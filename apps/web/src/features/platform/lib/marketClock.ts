// Market hours, computed from the clock alone (no price feed). Each market's
// regular session is defined in its own time zone, so US daylight saving and
// MCX's matching late close are handled by the browser's tz database.
// Exchange holidays are not modelled; the UI says so.

const IST = 'Asia/Kolkata';
const MIN = 60_000;
const DAY = 24 * 60 * MIN;

export type MarketId = 'nse' | 'mcx' | 'lse' | 'nyse' | 'crypto';

interface Session {
  start: number; // epoch ms
  end: number;
  pre?: boolean;
}

export interface MarketDef {
  id: MarketId;
  name: string;
  detail: string;
  tz: string;
  /** Sessions for a local calendar date in the market's tz ([h, m] pairs). */
  sessions: (y: number, m: number, d: number, weekday: number) => { from: [number, number]; to: [number, number]; pre?: boolean }[];
}

// Intl formatters are slow to build and the clock ticks every second.
const fmtCache = new Map<string, Intl.DateTimeFormat>();
function fmt(locale: string, opts: Intl.DateTimeFormatOptions) {
  const key = locale + JSON.stringify(opts);
  let f = fmtCache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, opts);
    fmtCache.set(key, f);
  }
  return f;
}

// Offset of `tz` from UTC at instant `t`, in ms.
function tzOffset(t: number, tz: string): number {
  const parts = fmt('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(new Date(t));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asUtc - Math.floor(t / 1000) * 1000;
}

// Epoch ms of a wall-clock time in `tz`.
function zoned(y: number, m: number, d: number, h: number, min: number, tz: string): number {
  const guess = Date.UTC(y, m - 1, d, h, min);
  const first = guess - tzOffset(guess, tz);
  return guess - tzOffset(first, tz);
}

// Calendar date (y, m, d, weekday 0=Sun) of instant `t` in `tz`.
function localDate(t: number, tz: string) {
  const parts = fmt('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).formatToParts(new Date(t));
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { y: Number(get('year')), m: Number(get('month')), d: Number(get('day')), weekday };
}

const weekdaysOnly = (weekday: number) => weekday >= 1 && weekday <= 5;

// MCX closes 23:30 IST while the US is on daylight time, 23:55 otherwise.
function usOnDaylightTime(t: number) {
  return tzOffset(t, 'America/New_York') === -4 * 60 * MIN;
}

export const MARKETS: MarketDef[] = [
  {
    id: 'nse',
    name: 'NSE · BSE',
    detail: 'Indian equities',
    tz: IST,
    sessions: (_y, _m, _d, wd) =>
      weekdaysOnly(wd)
        ? [
            { from: [9, 0], to: [9, 15], pre: true },
            { from: [9, 15], to: [15, 30] },
          ]
        : [],
  },
  {
    id: 'mcx',
    name: 'MCX',
    detail: 'Commodities',
    tz: IST,
    sessions: (y, m, d, wd) =>
      weekdaysOnly(wd)
        ? [{ from: [9, 0], to: usOnDaylightTime(Date.UTC(y, m - 1, d, 12)) ? [23, 30] : [23, 55] }]
        : [],
  },
  {
    id: 'lse',
    name: 'London',
    detail: 'LSE',
    tz: 'Europe/London',
    sessions: (_y, _m, _d, wd) => (weekdaysOnly(wd) ? [{ from: [8, 0], to: [16, 30] }] : []),
  },
  {
    id: 'nyse',
    name: 'NYSE · Nasdaq',
    detail: 'US equities',
    tz: 'America/New_York',
    sessions: (_y, _m, _d, wd) => (weekdaysOnly(wd) ? [{ from: [9, 30], to: [16, 0] }] : []),
  },
  {
    id: 'crypto',
    name: 'Crypto',
    detail: 'Always on',
    tz: 'UTC',
    sessions: () => [{ from: [0, 0], to: [24, 0] }],
  },
];

function sessionsAround(market: MarketDef, t: number, daysBack: number, daysAhead: number): Session[] {
  const out: Session[] = [];
  for (let i = -daysBack; i <= daysAhead; i++) {
    const { y, m, d, weekday } = localDate(t + i * DAY, market.tz);
    for (const s of market.sessions(y, m, d, weekday)) {
      out.push({
        start: zoned(y, m, d, s.from[0], s.from[1], market.tz),
        end: zoned(y, m, d, s.to[0], s.to[1], market.tz),
        pre: s.pre,
      });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

export type MarketState = 'open' | 'pre' | 'closed';

export interface MarketStatus {
  market: MarketDef;
  state: MarketState;
  /** "closes in 2h 14m" / "opens Mon 9:15 am" */
  note: string;
  /** Segments of the current IST day as fractions [0..1] of 24h. */
  segments: { from: number; to: number; pre?: boolean }[];
}

export function formatIn(t: number, opts: Intl.DateTimeFormatOptions, tz = IST) {
  return fmt('en-IN', { timeZone: tz, ...opts }).format(new Date(t));
}

function duration(ms: number) {
  const mins = Math.max(1, Math.round(ms / MIN));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

export function istDayStart(t: number) {
  const { y, m, d } = localDate(t, IST);
  return zoned(y, m, d, 0, 0, IST);
}

export function marketStatus(market: MarketDef, now: number): MarketStatus {
  const sessions = sessionsAround(market, now, 2, 8);
  const dayStart = istDayStart(now);
  const dayEnd = dayStart + DAY;

  const segments = sessions
    .filter((s) => s.end > dayStart && s.start < dayEnd)
    .map((s) => ({
      from: (Math.max(s.start, dayStart) - dayStart) / DAY,
      to: (Math.min(s.end, dayEnd) - dayStart) / DAY,
      pre: s.pre,
    }));

  if (market.id === 'crypto') {
    return { market, state: 'open', note: 'Trades 24 × 7', segments: [{ from: 0, to: 1 }] };
  }

  const current = sessions.find((s) => now >= s.start && now < s.end);
  if (current) {
    // A pre-open run straight into the regular session: count to the real close.
    const regular = current.pre ? sessions.find((s) => !s.pre && s.start === current.end) : current;
    const closesAt = (regular || current).end;
    return {
      market,
      state: current.pre ? 'pre' : 'open',
      note: current.pre ? `Pre-open · opens in ${duration(current.end - now)}` : `Closes in ${duration(closesAt - now)}`,
      segments,
    };
  }

  // Quote the regular open (9:15 for NSE), not the pre-open auction.
  const next = sessions.find((s) => s.start > now && !s.pre);
  if (!next) return { market, state: 'closed', note: 'Closed', segments };
  const sameIstDay = istDayStart(next.start) === dayStart;
  const when = sameIstDay
    ? formatIn(next.start, { hour: 'numeric', minute: '2-digit' })
    : formatIn(next.start, { weekday: 'short', hour: 'numeric', minute: '2-digit' });
  return { market, state: 'closed', note: `Opens ${when} IST`, segments };
}

export function greetingFor(now: number) {
  const hour = Number(formatIn(now, { hour: 'numeric', hourCycle: 'h23' }));
  if (hour < 5) return 'Welcome back';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
