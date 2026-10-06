// ============================================================
// XTIN NEWSLETTER GENERATOR — edition- and market-aware.
//
// Two editions a day, three markets each:
//   • pre_market  (8:00 AM IST slot)  — "know before the bell"
//   • post_market (5:00 PM IST slot)  — "what moved & why"
//   • markets: IN (India) | US (United States) | GLOBAL (World)
//
// Free subscribers  → India Post-Market Wrap only.
// Pro subscribers   → both editions, in every market (India, US, Global) —
//                     no per-market choice; subscriptions.markets is ignored.
// Pro status comes from newsletter_pro_plans (written server-side only
// after Razorpay verification — see controllers/newsletterPlan.controller.mjs).
//
// The DB schema keeps the original 5×5 heading/subheading shape so every
// existing reader page keeps working; `edition` and `market` columns are
// added via database/newsletter_pro_plans.sql (inserts degrade gracefully
// if the migration hasn't run yet).
// ============================================================
import { config } from '../constants/config.js';
import supabase from '../supabase/index.js';
import { readSubscribers } from '../modules/newsletter/subscription.repository.js';
import { sendEmailToAll } from '../services/mail.service.js';

const ANTHROPIC_API_KEY = config.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
// Default to a current model. claude-3-5-sonnet-20241022 was retired (Oct 2025)
// and now 404s, which silently forces the RSS fallback. Override via ANTHROPIC_MODEL.
const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

/* ---------------- markets & editions ---------------- */

export const MARKETS = ['IN', 'US', 'GLOBAL'];

const MARKET_META = {
  IN: {
    label: 'India',
    audience: 'Indian retail investors',
    indices: 'Sensex and Nifty 50 (also Bank Nifty, midcaps)',
    currencySymbol: '₹',
    feeds: [
      'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
      'https://economictimes.indiatimes.com/rssfeedstopstories.cms',
      'https://www.moneycontrol.com/rss/business.xml',
      'https://www.moneycontrol.com/rss/MCtopnews.xml',
      'https://www.livemint.com/rss/markets',
      'https://www.livemint.com/rss/companies',
      'https://www.business-standard.com/rss/markets-106.rss',
    ],
  },
  US: {
    label: 'United States',
    audience: 'investors in US equities',
    indices: 'the S&P 500, Nasdaq and Dow',
    currencySymbol: '$',
    feeds: [
      'https://www.cnbc.com/id/100003114/device/rss/rss.html',
      'https://www.cnbc.com/id/20910258/device/rss/rss.html',
      'https://feeds.content.dowjones.io/public/rss/mw_topstories',
      'https://finance.yahoo.com/news/rssindex',
    ],
  },
  GLOBAL: {
    label: 'Global',
    audience: 'globally diversified investors',
    indices: 'major world indices (S&P 500, STOXX 600, Nikkei, Hang Seng)',
    currencySymbol: '$',
    feeds: [
      'https://feeds.bbci.co.uk/news/business/rss.xml',
      'https://www.cnbc.com/id/100727362/device/rss/rss.html',
      'https://www.cnbc.com/id/100003114/device/rss/rss.html',
      'https://www.livemint.com/rss/markets',
    ],
  },
};

const EDITION_META = {
  pre_market: {
    label: 'Pre-Market Brief',
    tagline: 'Know before the bell',
    sections: [
      'While You Were Away',
      'What to Watch Today',
      'Stocks in Focus',
      'The Big Picture',
      'Levels & One Smart Idea',
    ],
    framing:
      'This is a PRE-MARKET brief read at breakfast, before trading opens. ' +
      'Focus on overnight/global moves, cues for the session ahead, events and earnings due today, ' +
      'stocks likely to react to fresh news, and the key index levels to watch.',
  },
  post_market: {
    label: 'Post-Market Wrap',
    tagline: 'What moved & why',
    sections: [
      'What Moved Today',
      'Winners & Losers',
      'The Story Behind the Move',
      'Money & Macro',
      "Tomorrow's Watchlist",
    ],
    framing:
      'This is a POST-MARKET wrap read after the close. ' +
      'Focus on what actually moved today WITH NUMBERS (index %, stock %, levels), who won and who lost and why, ' +
      "the day's biggest narrative, macro/currency/commodity shifts, and what carries into tomorrow.",
  },
};

export function editionForISTHour(hour) {
  return hour < 12 ? 'pre_market' : 'post_market';
}

function currentISTHour() {
  return Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hour12: false,
    }).format(getNewsletterBaseDate())
  );
}

function getNewsletterBaseDate() {
  const override = process.env.NEWSLETTER_DATE_OVERRIDE;
  const allowOverride = process.env.ALLOW_NEWSLETTER_DATE_OVERRIDE === 'true';
  const isProduction = process.env.NODE_ENV === 'production';

  // Safety: production cron should always use real current date/time.
  if (!override || isProduction || !allowOverride) return new Date();

  const parsed = new Date(override);
  if (Number.isNaN(parsed.getTime())) {
    console.warn(`[Newsletter] Invalid NEWSLETTER_DATE_OVERRIDE: ${override}. Falling back to current date.`);
    return new Date();
  }

  return parsed;
}

function getNewsletterDateString() {
  return getNewsletterBaseDate().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function newsletterTitle(edition, market) {
  return `${EDITION_META[edition].label} — ${MARKET_META[market].label} | ${getNewsletterDateString()}`;
}

/* ---------------- AI API with retry ---------------- */

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const waitTime = retryAfter
          ? parseInt(retryAfter) * 1000
          : Math.min(1000 * Math.pow(2, attempt), 10000);

        console.warn(`[AI API] Rate limited (429). Waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);

        if (attempt < maxRetries - 1) {
          await sleep(waitTime);
          continue;
        }

        throw new Error(`AI API rate limit exceeded after ${maxRetries} retries`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API error: ${response.status} - ${errorText}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1 && !error.message.includes('rate limit')) {
        await sleep(1000 * (attempt + 1));
      }
    }
  }

  throw lastError;
}

/* ---------------- prompt (the quality bar) ---------------- */

function generateNewsletterPrompt({ edition, market, headlines }) {
  const currentDate = getNewsletterDateString();
  const ed = EDITION_META[edition];
  const mk = MARKET_META[market];

  const headlineBlock = headlines.length
    ? headlines.map((h, idx) => `${idx + 1}. ${h.title}${h.description ? ` — ${h.description.slice(0, 160)}` : ''}`).join('\n')
    : 'No live headlines available';

  const requiredKeys = ['title'];
  for (let i = 1; i <= 5; i++) {
    requiredKeys.push(`heading_${i}`);
    for (let j = 1; j <= 5; j++) {
      requiredKeys.push(`heading_${i}_subheading_${j}`);
      requiredKeys.push(`heading_${i}_subheading_${j}_content`);
    }
  }

  return `You are writing the "${ed.label}" (${ed.tagline}) for ${mk.label} — dated ${currentDate}, for ${mk.audience}.

${ed.framing}

READER PROMISE (this is a paid-quality product — every item must earn its place):
- Write like a sharp friend on a trading desk: plain English, short sentences, zero unexplained jargon.
- Lead with the concrete fact or number from the headlines (index moves, stock %, levels, amounts in ${mk.currencySymbol}). Never invent numbers not present in the source material — if the sources don't give one, describe direction and driver instead.
- END every item with one sentence starting "Why it matters:" that tells the reader what to DO or WATCH.
- No filler ("markets remain volatile", "investors should stay cautious"), no generic advice, no repetition across items.
- Reference ${mk.indices} where relevant.

Use these EXACT section titles in order:
1) ${ed.sections[0]}
2) ${ed.sections[1]}
3) ${ed.sections[2]}
4) ${ed.sections[3]}
5) ${ed.sections[4]}

Source headlines (your ONLY factual material — pick the most consequential, skip celebrity/fluff):
${headlineBlock}

Output requirements:
- Return ONLY valid JSON (no markdown).
- "title" must be exactly: "${newsletterTitle(edition, market)}"
- Must include ALL keys: ${requiredKeys.join(', ')}
- heading_1..heading_5 are the section titles above, exactly.
- Each heading_i_subheading_j is a punchy, specific headline (max 9 words).
- Each heading_i_subheading_j_content is 55-90 words following the reader promise.`;
}

function parseNewsletterResponse(responseText) {
  try {
    let jsonText = responseText;
    if (responseText.includes('```json')) {
      const start = responseText.indexOf('```json') + 7;
      const end = responseText.indexOf('```', start);
      jsonText = responseText.substring(start, end).trim();
    } else if (responseText.includes('```')) {
      const start = responseText.indexOf('```') + 3;
      const end = responseText.indexOf('```', start);
      jsonText = responseText.substring(start, end).trim();
    }

    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonText = jsonText.slice(firstBrace, lastBrace + 1);
    }

    return JSON.parse(jsonText);
  } catch (error) {
    console.warn('Could not parse AI response:', error.message);
    return null;
  }
}

function normalizeNewsletterData(partial = {}, { edition, market, headlines }) {
  const base = createRssBackedNewsletter({ edition, market, headlines });
  const normalized = { ...base };

  if (partial && typeof partial === 'object') {
    for (const [key, value] of Object.entries(partial)) {
      if (typeof value === 'string' && value.trim()) {
        normalized[key] = value.trim();
      }
    }
  }

  // The title is product identity — never let the model rename the edition.
  normalized.title = newsletterTitle(edition, market);
  return normalized;
}

/* ---------------- RSS ---------------- */

function stripHtml(input = '') {
  return String(input).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseRssItems(xmlText = '') {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const block = match[1];
    const titleMatch = block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/i);
    const descMatch = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/i);
    const title = stripHtml((titleMatch?.[1] || titleMatch?.[2] || '').trim());
    const description = stripHtml((descMatch?.[1] || descMatch?.[2] || '').trim());

    if (title) {
      items.push({ title, description });
    }
  }

  // Support Atom feeds as well.
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
  while ((match = entryRegex.exec(xmlText)) !== null) {
    const block = match[1];
    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const summaryMatch = block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) || block.match(/<content[^>]*>([\s\S]*?)<\/content>/i);
    const title = stripHtml((titleMatch?.[1] || '').trim());
    const description = stripHtml((summaryMatch?.[1] || '').trim());

    if (title) {
      items.push({ title, description });
    }
  }

  return items;
}

async function fetchMarketHeadlines(market, limit = 25) {
  const all = [];
  const feeds = MARKET_META[market]?.feeds || MARKET_META.IN.feeds;

  for (const feedUrl of feeds) {
    try {
      const response = await fetch(feedUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'XtinCapitalNewsletterBot/1.0' },
      });
      if (!response.ok) {
        continue;
      }
      const xml = await response.text();
      const items = parseRssItems(xml).slice(0, 12);
      all.push(...items);
    } catch (_err) {
      // Continue with other feeds for resilience.
    }
  }

  const unique = [];
  const seen = new Set();
  for (const item of all) {
    const key = item.title.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
    if (unique.length >= limit) break;
  }

  return unique;
}

/* ---------------- RSS-backed fallback newsletter ---------------- */

function createRssBackedNewsletter({ edition, market, headlines = [] }) {
  const ed = EDITION_META[edition];
  const sections = ed.sections;

  const normalizedHeadlines = headlines
    .filter((h) => h && h.title)
    .map((h) => ({
      title: String(h.title).trim(),
      description: String(h.description || '').trim(),
    }));

  const fallback = {
    title: newsletterTitle(edition, market),
  };

  let cursor = 0;
  for (let i = 1; i <= 5; i++) {
    fallback[`heading_${i}`] = sections[i - 1];

    for (let j = 1; j <= 5; j++) {
      const headline = normalizedHeadlines[cursor];
      cursor += 1;
      if (headline) {
        fallback[`heading_${i}_subheading_${j}`] = headline.title;
        fallback[`heading_${i}_subheading_${j}_content`] =
          `${headline.description || 'Tracked from live financial news sources.'} ` +
          `Why it matters: keep this on your radar under "${sections[i - 1]}" — it can move positioning in the ${MARKET_META[market].label} market.`;
      } else {
        fallback[`heading_${i}_subheading_${j}`] = 'Live source coverage was limited for this slot';
        fallback[`heading_${i}_subheading_${j}_content`] =
          'Live source coverage was limited for this slot. The next edition will pick up the thread with fresh, verified headlines.';
      }
    }
  }

  return fallback;
}

function isLowQualityFallbackContent(newsletter) {
  const probes = [
    newsletter?.heading_1_subheading_1_content,
    newsletter?.heading_2_subheading_1_content,
    newsletter?.heading_3_subheading_1_content,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    probes.includes('temporarily unavailable') ||
    probes.includes('technical issues') ||
    probes.includes('live source coverage was limited for this slot')
  );
}

function createFallbackNewsletter() {
  const fallback = {
    title: `Indian Finance Newsletter - ${getNewsletterDateString()}`,
  };

  for (let i = 1; i <= 5; i++) {
    fallback[`heading_${i}`] = `Market Update ${i}`;

    for (let j = 1; j <= 5; j++) {
      fallback[`heading_${i}_subheading_${j}`] = `Market Subheading ${j}`;
      fallback[`heading_${i}_subheading_${j}_content`] =
        'Newsletter content temporarily unavailable. Our team is working to resolve technical issues and will have comprehensive market analysis available soon.';
    }
  }

  return fallback;
}

/* ---------------- persistence ---------------- */

async function saveNewsletterToSupabase(content, { edition, market }: { edition?: string; market?: string } = {}) {
  const data: Record<string, any> = {
    created_at: new Date().toISOString(),
    title: content.title || 'Xtin Market Newsletter',
  };

  for (let i = 1; i <= 5; i++) {
    data[`heading_${i}`] = content[`heading_${i}`] || `Heading ${i}`;

    for (let j = 1; j <= 5; j++) {
      data[`heading_${i}_subheading_${j}`] = content[`heading_${i}_subheading_${j}`] || `Subheading ${j}`;
      data[`heading_${i}_subheading_${j}_content`] = content[`heading_${i}_subheading_${j}_content`] || 'Content not generated';
    }
  }

  // Edition/market columns arrive via database/newsletter_pro_plans.sql; if the
  // migration hasn't run yet, retry the insert without them so the pipeline
  // never breaks.
  const withMeta: Record<string, any> = { ...data };
  if (edition) withMeta.edition = edition;
  if (market) withMeta.market = market;

  let { data: result, error } = await supabase
    .from('indian_finance_newsletter')
    .insert(withMeta)
    .select()
    .single();

  if (error && /column|schema/i.test(error.message || '')) {
    console.warn('[Newsletter] edition/market columns missing — run database/newsletter_pro_plans.sql. Saving without metadata.');
    ({ data: result, error } = await supabase
      .from('indian_finance_newsletter')
      .insert(data)
      .select()
      .single());
  }

  if (error) {
    console.error('✗ Error saving to Supabase:', error);
    throw error;
  }

  console.log(`✓ Saved ${edition || 'newsletter'}/${market || ''}:`, result.id);
  return result;
}

/* ---------------- generation ---------------- */

export async function generateNewsletter({ edition, market }: { edition?: string; market?: string } = {}) {
  const resolvedEdition = EDITION_META[edition] ? edition : editionForISTHour(currentISTHour());
  const resolvedMarket = MARKET_META[market] ? market : 'IN';

  console.log(`🚀 Generating ${EDITION_META[resolvedEdition].label} (${resolvedMarket}) with AI...`);

  try {
    const headlines = await fetchMarketHeadlines(resolvedMarket, 25);
    const context = { edition: resolvedEdition, market: resolvedMarket, headlines };

    if (!ANTHROPIC_API_KEY) {
      console.warn('Claude API key not found, using RSS-backed newsletter');
      return await saveNewsletterToSupabase(createRssBackedNewsletter(context), context);
    }

    const prompt = generateNewsletterPrompt(context);

    const response = await fetchWithRetry(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        system:
          'You are the lead writer of a premium daily markets newsletter. Sharp, factual, plain-English. ' +
          'You never invent numbers, never pad with generic advice, and always answer "why it matters". ' +
          'Output exact JSON only.',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.35,
      }),
    }, 3);

    const data: any = await response.json();
    const content = Array.isArray(data?.content)
      ? data.content
          .filter((item) => item?.type === 'text' && item?.text)
          .map((item) => item.text)
          .join('\n')
      : null;

    if (!content) {
      console.error('No content in Claude response');
      return await saveNewsletterToSupabase(createRssBackedNewsletter(context), context);
    }

    const newsletterData = parseNewsletterResponse(content);
    if (!newsletterData) {
      console.warn('Failed to parse AI response, using RSS-backed newsletter');
      return await saveNewsletterToSupabase(createRssBackedNewsletter(context), context);
    }

    const normalizedNewsletter = normalizeNewsletterData(newsletterData, context);

    console.log(`✅ ${EDITION_META[resolvedEdition].label} (${resolvedMarket}) generated!`);
    return await saveNewsletterToSupabase(normalizedNewsletter, context);
  } catch (error) {
    console.error('Newsletter generation failed:', error);
    console.log('Falling back to RSS-backed newsletter');
    const headlines = await fetchMarketHeadlines(resolvedMarket, 25);
    const context = { edition: resolvedEdition, market: resolvedMarket, headlines };
    return await saveNewsletterToSupabase(createRssBackedNewsletter(context), context);
  }
}

/* ---------------- email HTML ---------------- */

export const generateNewsletterHTML = (newsletter) => {
  const title = newsletter.title || 'Xtin Market Newsletter';
  const edition = newsletter.edition ? EDITION_META[newsletter.edition] : null;
  const market = newsletter.market ? MARKET_META[newsletter.market] : null;
  const badge = edition
    ? `${edition.label}${market ? ` · ${market.label}` : ''} — ${edition.tagline}`
    : 'Financial News Made Simple';

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        }

        body {
            background-color: #f9fafb;
            margin: 0;
            padding: 20px 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }
        .edition-badge {
            display: inline-block;
            background: #ecfdf5;
            color: #059669;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            padding: 6px 14px;
            border-radius: 999px;
            margin: 0 auto 16px;
        }
        .badge-row { text-align: center; }
        .title {
            font-size: 32px;
            font-weight: 600;
            color: #111827;
            text-align: center;
            margin-bottom: 16px;
            border-bottom: 3px solid #059669;
            padding-bottom: 20px;
        }
        .date {
            font-size: 14px;
            color: #6b7280;
            text-align: center;
            margin-bottom: 40px;
        }
        .heading {
            font-size: 22px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            border-bottom: 2px solid #059669;
            padding-bottom: 10px;
            margin-top: 40px;
        }
        .subheading {
            font-size: 17px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 10px;
            margin-top: 28px;
        }
        .content {
            font-size: 16px;
            font-weight: 400;
            line-height: 1.65;
            color: #4b5563;
            margin-bottom: 26px;
        }
        .footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="badge-row"><span class="edition-badge">${badge}</span></div>
        <h1 class="title">${title}</h1>
        <p class="date">${new Date(newsletter.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}</p>`;

  for (let i = 1; i <= 5; i++) {
    const heading = newsletter[`heading_${i}`];
    if (heading) {
      html += `<h2 class="heading">${heading}</h2>`;

      for (let j = 1; j <= 5; j++) {
        const subheading = newsletter[`heading_${i}_subheading_${j}`];
        const content = newsletter[`heading_${i}_subheading_${j}_content`];
        if (subheading && content) {
          html += `<h3 class="subheading">${subheading}</h3><p class="content">${content}</p>`;
        }
      }
    }
  }

  html += `<div class="footer">
            <p><a href="https://www.xtincapital.com" style="color:inherit;text-decoration:none;font-weight:bold;">Xtin Capital</a> - Financial News Made Simple</p>
            <p>${edition ? `You are receiving the ${edition.label}${market ? ` for ${market.label}` : ''}.` : 'Stay informed with the latest market insights.'} Manage your editions at xtincapital.com/newsletter.</p>
        </div>
    </div>
</body>
</html>`;

  return html;
};

/* ---------------- subscriber targeting ---------------- */

async function readProEmailSet() {
  try {
    const { data, error } = await supabase
      .from('newsletter_pro_plans')
      .select('user_email, valid_until');
    if (error) throw error;
    const now = Date.now();
    return new Set(
      (data || [])
        .filter((r) => r.user_email && new Date(r.valid_until).getTime() > now)
        .map((r) => String(r.user_email).toLowerCase())
    );
  } catch (err) {
    // Table not created yet (run database/newsletter_pro_plans.sql) — everyone is free tier.
    console.warn('[Newsletter] newsletter_pro_plans unavailable:', err.message);
    return new Set();
  }
}

/**
 * Who receives a given (edition, market) newsletter:
 *  • Free  → IN post_market only (the free daily wrap).
 *  • Pro   → both editions of every market. There is no per-market choice.
 */
function eligibleEmails({ subscribers, proSet, edition, market }) {
  const emails = [];
  for (const s of subscribers) {
    const email = String(s.email || '').trim();
    if (!email) continue;
    const isPro = proSet.has(email.toLowerCase());
    if (isPro) {
      emails.push(email);
    } else if (edition === 'post_market' && market === 'IN') {
      emails.push(email);
    }
  }
  return emails;
}

/* ---------------- the twice-daily job ---------------- */

export const generateAndSendNewsletter = async ({ edition: requested }: { edition?: string } = {}) => {
  try {
    // An explicit edition (manual admin run) wins; otherwise infer from the IST clock.
    const edition = EDITION_META[requested] ? requested : editionForISTHour(currentISTHour());
    console.log(`[Newsletter Cron] Slot resolved to edition: ${edition}${requested ? ' (chosen manually)' : ''}`);

    const [subscribers, proSet] = await Promise.all([
      readSubscribers(),
      readProEmailSet(),
    ]);

    const summary = { edition, markets: {}, totalSent: 0 };

    for (const market of MARKETS) {
      // Skip markets nobody would receive (saves AI calls until Pro users exist).
      const audience = eligibleEmails({ subscribers, proSet, edition, market });
      if (audience.length === 0 && !(edition === 'post_market' && market === 'IN')) {
        console.log(`[Newsletter Cron] ${edition}/${market}: no eligible subscribers, skipping generation.`);
        summary.markets[market] = { generated: false, sent: 0 };
        continue;
      }

      let newsletter;
      try {
        newsletter = await generateNewsletter({ edition, market });
      } catch (err) {
        console.error(`[Newsletter Cron] ${edition}/${market} generation failed:`, err.message);
        summary.markets[market] = { generated: false, error: err.message, sent: 0 };
        continue;
      }

      if (isLowQualityFallbackContent(newsletter)) {
        console.warn(`[Newsletter Cron] ${edition}/${market}: quality check failed, not sending.`);
        summary.markets[market] = { generated: true, sent: 0, skippedSend: 'quality' };
        continue;
      }

      if (audience.length === 0) {
        console.log(`[Newsletter Cron] ${edition}/${market}: generated (archive), no emails to send.`);
        summary.markets[market] = { generated: true, sent: 0 };
        continue;
      }

      const html = generateNewsletterHTML({ ...newsletter, edition, market });
      console.log(`[Newsletter Cron] Sending ${edition}/${market} to ${audience.length} subscribers...`);
      const sendResult = await sendEmailToAll(audience, newsletter.title, html);
      summary.markets[market] = { generated: true, sent: sendResult.successCount ?? audience.length };
      summary.totalSent += sendResult.successCount ?? audience.length;
    }

    console.log(`[Newsletter Cron] ✅ Done: ${JSON.stringify(summary)}`);
    return { success: true, ...summary, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('[Newsletter Cron] Failed:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

// Backward compatibility exports
export const getPreviousDayNewsletter = () => null;
export const generateNewsletterContent = generateNewsletter;
export const generateBackupNewsletter = createFallbackNewsletter;
