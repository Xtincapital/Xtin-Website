// --- Chatbot Logic ---
// Enhanced Gini AI Chatbot with Intelligent Financial Advisor
const AI_CONFIG = {
  mode: 'direct'
};

const CHAT_LIMITS = {
  trialTokens: 5000,
  // Reply depth by plan tier. Free is concise-but-human; Pro reads like a
  // sit-down conversation with an advisor. (The old 120-char cap made every
  // answer a fortune cookie — the opposite of a personal advisor.)
  freeReplyChars: 400,
  proReplyChars: 1400,
  freeMaxOutputTokens: 180,
  proMaxOutputTokens: 420,
  proIncludedTokens: 100000,
  storageKey: 'gini_ai_token_wallet_v1'
};

function isGiniProActive() {
  try { return Boolean(window.GiniPlan?.isPro?.()); } catch { return false; }
}

function getChatReplyCharLimit() {
  return isGiniProActive() ? CHAT_LIMITS.proReplyChars : CHAT_LIMITS.freeReplyChars;
}

function getChatMaxOutputTokens() {
  return isGiniProActive() ? CHAT_LIMITS.proMaxOutputTokens : CHAT_LIMITS.freeMaxOutputTokens;
}
window.getChatMaxOutputTokens = getChatMaxOutputTokens;
window.CHAT_LIMITS = CHAT_LIMITS;

const AI_TOKEN_PACKS = {
  ai_500: {
    id: 'ai_500',
    amountINR: 500,
    tokens: 100000,
    label: 'Starter'
  },
  ai_1000: {
    id: 'ai_1000',
    amountINR: 1000,
    tokens: 300000,
    label: 'Growth'
  },
  ai_2000: {
    id: 'ai_2000',
    amountINR: 2000,
    tokens: 500000,
    label: 'Power'
  }
};

const REPORT_LIMITS = {
  freeReportsPerMonth: 1,
  extraReportFeeINR: 100,
  storageKey: 'gini_report_quota_v1'
};
const REPORT_PAYWALL_ENABLED = true;
const AUTO_CONFIRM_PAYMENTS_UNTIL_RAZORPAY = true; // Set to false once Razorpay keys are configured in .env

// Chat history for conversation context
let chatHistory = [];

function countWords(text) {
  if (!text) return 0;
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

function trimToWordLimit(text, maxWords) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return String(text || '');
  return `${words.slice(0, maxWords).join(' ')}...`;
}

function trimToCharLimit(text, maxChars) {
  const clean = String(text || '').trim();
  if (clean.length <= maxChars) return clean;
  // Trim at the last word boundary within the limit, leaving room for an ellipsis.
  const slice = clean.slice(0, maxChars - 1);
  const lastSpace = slice.lastIndexOf(' ');
  const base = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  return `${base.trimEnd()}…`;
}

function loadChatQuota() {
  try {
    const raw = localStorage.getItem(CHAT_LIMITS.storageKey);
    if (!raw) {
      return {
        tokenBalance: CHAT_LIMITS.trialTokens,
        totalPurchasedTokens: 0,
        totalUsedTokens: 0,
        paywallLocked: false,
        initializedAt: new Date().toISOString(),
        purchases: []
      };
    }
    const parsed = JSON.parse(raw);
    return {
      tokenBalance: Number.isFinite(parsed?.tokenBalance) ? Math.max(0, parsed.tokenBalance) : 0,
      totalPurchasedTokens: Number.isFinite(parsed?.totalPurchasedTokens) ? Math.max(0, parsed.totalPurchasedTokens) : 0,
      totalUsedTokens: Number.isFinite(parsed?.totalUsedTokens) ? Math.max(0, parsed.totalUsedTokens) : 0,
      paywallLocked: Boolean(parsed?.paywallLocked),
      initializedAt: parsed?.initializedAt || new Date().toISOString(),
      purchases: Array.isArray(parsed?.purchases) ? parsed.purchases.slice(-25) : []
    };
  } catch (e) {
    return {
      tokenBalance: CHAT_LIMITS.trialTokens,
      totalPurchasedTokens: 0,
      totalUsedTokens: 0,
      paywallLocked: false,
      initializedAt: new Date().toISOString(),
      purchases: []
    };
  }
}

function saveChatQuota(quota) {
  try {
    localStorage.setItem(CHAT_LIMITS.storageKey, JSON.stringify(quota));
    window.GiniAuth?.updateAccountPanel?.();
    if (window.GiniAuth?.isLoggedIn?.()) {
      window.GiniAuth.scheduleSave(getCloudPersistencePayload);
    }
  } catch (e) {
    console.warn('[ChatQuota] Unable to persist quota state:', e);
  }
}

function estimateTokenUsage(text) {
  return Math.max(1, Math.ceil(String(text || '').length / 4));
}

function formatTokenCount(tokens) {
  const n = Math.max(0, Math.floor(Number(tokens) || 0));
  if (n >= 1000000) return `${(n / 1000000).toFixed(n >= 10000000 ? 0 : 1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}K`;
  return String(n);
}

function getGiniAITokenBalanceLabel() {
  return formatTokenCount(loadChatQuota().tokenBalance || 0);
}

function addAITokensToWallet(pack, payment = {}) {
  const wallet = loadChatQuota();
  const tokens = Number(pack?.tokens || 0);
  wallet.tokenBalance += tokens;
  wallet.totalPurchasedTokens += tokens;
  wallet.paywallLocked = false;
  wallet.purchases.push({
    packId: pack?.id || 'manual',
    amountINR: Number(pack?.amountINR || 0),
    tokens,
    paymentId: payment.paymentId || null,
    orderId: payment.orderId || null,
    purchasedAt: new Date().toISOString()
  });
  saveChatQuota(wallet);
  return wallet;
}

window.activateGiniAITokenPack = (packId = 'ai_500') => {
  const pack = AI_TOKEN_PACKS[packId] || AI_TOKEN_PACKS.ai_500;
  window.dispatchEvent(new CustomEvent('gini:payment:success', {
    detail: {
      pack,
      amount: pack.amountINR,
      source: 'chat-paywall',
      paymentId: 'manual-credit',
      orderId: 'manual-credit'
    }
  }));
};

window.activateGiniReportCredit = (amount = REPORT_LIMITS.extraReportFeeINR) => {
  window.dispatchEvent(new CustomEvent('gini:payment:success', {
    detail: {
      amount,
      source: 'report-paywall'
    }
  }));
};

function getCurrentReportMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function loadReportQuota() {
  const currentMonth = getCurrentReportMonthKey();
  try {
    const raw = localStorage.getItem(REPORT_LIMITS.storageKey);
    if (!raw) {
      return { monthKey: currentMonth, generatedCount: 0, paidCredits: 0 };
    }

    const parsed = JSON.parse(raw);
    if (parsed?.monthKey !== currentMonth) {
      return { monthKey: currentMonth, generatedCount: 0, paidCredits: 0 };
    }

    return {
      monthKey: currentMonth,
      generatedCount: Number.isFinite(parsed?.generatedCount) ? Math.max(0, parsed.generatedCount) : 0,
      paidCredits: Number.isFinite(parsed?.paidCredits) ? Math.max(0, parsed.paidCredits) : 0
    };
  } catch {
    return { monthKey: currentMonth, generatedCount: 0, paidCredits: 0 };
  }
}

function saveReportQuota(quota) {
  try {
    localStorage.setItem(REPORT_LIMITS.storageKey, JSON.stringify(quota));
    if (window.GiniAuth?.isLoggedIn?.()) {
      window.GiniAuth.scheduleSave(getCloudPersistencePayload);
    }
  } catch (e) {
    console.warn('[ReportQuota] Unable to persist report quota:', e);
  }
}

const pdfImport = {
  _toNumber: (value) => {
    if (value === undefined || value === null) return null;
    const cleaned = String(value).replace(/[^\d.-]/g, '');
    if (!cleaned) return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  },

  _extractLabelNumber: (text, labels = []) => {
    for (const label of labels) {
      const regex = new RegExp(`${label}\\s*[:\\-]?\\s*(?:Rs.|Rs\\.?|INR)?\\s*([0-9][0-9,]*(?:\\.[0-9]+)?)`, 'i');
      const match = text.match(regex);
      if (match) {
        const value = pdfImport._toNumber(match[1]);
        if (value !== null) return value;
      }
    }
    return null;
  },

  extractTextFromFile: async (file) => {
    if (!window.pdfjsLib) {
      throw new Error('PDF parser not loaded in browser');
    }

    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    const data = new Uint8Array(await file.arrayBuffer());
    const doc = await window.pdfjsLib.getDocument({ data }).promise;

    const pages = [];
    for (let i = 1; i <= doc.numPages; i += 1) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(' ');
      pages.push(pageText);
    }
    return pages.join('\n');
  },

  parseText: (rawText) => {
    const text = String(rawText || '').replace(/\s+/g, ' ').trim();
    const parsed = {
      userProfile: {},
      assets: [],
      liabilities: [],
      goals: [],
      familyMembers: []
    };

    const monthlyIncome = pdfImport._extractLabelNumber(text, ['Monthly Income', 'Household Income']);
    const annualIncome = pdfImport._extractLabelNumber(text, ['Annual Income']);
    const monthlyExpenses = pdfImport._extractLabelNumber(text, ['Monthly Expenses', 'Household Expenses']);
    const monthlySavings = pdfImport._extractLabelNumber(text, ['Monthly Savings']);
    const currentAge = pdfImport._extractLabelNumber(text, ['Current Age', 'Age']);
    const retirementAge = pdfImport._extractLabelNumber(text, ['Retirement Age']);
    const lifeExpectancy = pdfImport._extractLabelNumber(text, ['Life Expectancy']);

    if (monthlyIncome !== null) parsed.userProfile.monthlyIncome = monthlyIncome;
    if (annualIncome !== null && monthlyIncome === null) parsed.userProfile.monthlyIncome = Math.round(annualIncome / 12);
    if (monthlyExpenses !== null) parsed.userProfile.monthlyExpenses = monthlyExpenses;
    if (monthlySavings !== null) parsed.userProfile.monthlySavings = monthlySavings;
    if (currentAge !== null) parsed.userProfile.currentAge = Math.round(currentAge);
    if (retirementAge !== null) parsed.userProfile.retirementAge = Math.round(retirementAge);
    if (lifeExpectancy !== null) parsed.userProfile.lifeExpectancy = Math.round(lifeExpectancy);

    const assetCategoryMap = {
      'real estate': 'Real Estate',
      stocks: 'Stocks',
      'mutual funds': 'Mutual Funds',
      cash: 'Cash',
      'fixed deposits': 'Fixed Deposits',
      gold: 'Gold',
      ppf: 'PPF',
      epf: 'EPF',
      nps: 'NPS',
      bonds: 'Bonds',
      crypto: 'Crypto',
      other: 'Other'
    };

    const rowRegex = /([A-Za-z][A-Za-z0-9 .,&\/-]{2,})\s*\(([^)]+)\)\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]+)?)/g;
    const skipNames = ['Total Assets', 'Total Liabilities', 'Net Worth', 'Monthly Income', 'Monthly Expenses', 'Monthly Savings', 'Future Value', 'Already Saved'];
    let rowMatch;
    let nextId = 1;

    while ((rowMatch = rowRegex.exec(text)) !== null) {
      const name = rowMatch[1].trim();
      const rawCategory = rowMatch[2].trim();
      const value = pdfImport._toNumber(rowMatch[3]);
      if (!name || value === null || skipNames.includes(name)) continue;

      const lcCategory = rawCategory.toLowerCase();
      const mappedCategory = assetCategoryMap[lcCategory] || rawCategory;
      const looksLikeLiability = /loan|liabilit|credit|emi|debt/i.test(`${name} ${rawCategory}`);

      if (looksLikeLiability) {
        parsed.liabilities.push({
          id: nextId++,
          name,
          category: rawCategory,
          amount: value,
          rate: 10,
          emi: 0,
          owner: 1,
          jointShare: 100
        });
      } else {
        parsed.assets.push({
          id: nextId++,
          name,
          category: mappedCategory,
          value,
          owner: 1,
          jointShare: 100
        });
      }
    }

    const goalRegex = /([A-Za-z][A-Za-z0-9 .,&\/-]{2,})\s*\(([^)]+)\)\s*Target Year\s*[:\-]?\s*(\d{4})[\s\S]{0,120}?Already Saved\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]+)?)/gi;
    let goalMatch;
    let goalId = 1;
    while ((goalMatch = goalRegex.exec(text)) !== null) {
      const goalName = goalMatch[1].trim();
      const category = goalMatch[2].trim();
      const targetYear = Number(goalMatch[3]);
      const saved = pdfImport._toNumber(goalMatch[4]) || 0;
      if (!goalName || !Number.isFinite(targetYear)) continue;

      parsed.goals.push({
        id: goalId++,
        name: goalName,
        category,
        currentCost: Math.max(saved * 2, 100000),
        targetYear,
        saved,
        inflation: 7,
        return: 12,
        priority: 3
      });
    }

    const memberRegex = /([A-Z][A-Za-z ]{2,})\s+(Self|Spouse|Son|Daughter|Parent|Child)\s+(\d{1,2})\s+(?:₹|Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]+)?)/g;
    let memberMatch;
    let memberId = 1;
    while ((memberMatch = memberRegex.exec(text)) !== null) {
      const name = memberMatch[1].trim();
      const relationship = memberMatch[2].trim();
      const age = Number(memberMatch[3]);
      const income = pdfImport._toNumber(memberMatch[4]) || 0;

      parsed.familyMembers.push({
        id: memberId++,
        name,
        relationship,
        age,
        income,
        isEarner: income > 0,
        isDependent: income <= 0,
        retirementAge: 60,
        lifeExpectancy: 85,
        gender: 'Not specified',
        healthStatus: 'Good'
      });
    }

    return parsed;
  },

  applyToState: (parsed) => {
    if (!parsed) return { assets: 0, liabilities: 0, goals: 0, familyMembers: 0, profileFields: 0 };

    let profileFields = 0;
    if (parsed.userProfile) {
      Object.keys(parsed.userProfile).forEach((key) => {
        const value = parsed.userProfile[key];
        if (value !== null && value !== undefined && Number.isFinite(value)) {
          appState.userProfile[key] = value;
          profileFields += 1;
        }
      });
    }

    if (Array.isArray(parsed.assets) && parsed.assets.length > 0) {
      appState.assets = parsed.assets;
    }
    if (Array.isArray(parsed.liabilities) && parsed.liabilities.length > 0) {
      appState.liabilities = parsed.liabilities;
    }
    if (Array.isArray(parsed.goals) && parsed.goals.length > 0) {
      appState.goals = parsed.goals;
    }
    if (Array.isArray(parsed.familyMembers) && parsed.familyMembers.length > 0) {
      appState.familyMembers = parsed.familyMembers;
    }

    return {
      assets: parsed.assets?.length || 0,
      liabilities: parsed.liabilities?.length || 0,
      goals: parsed.goals?.length || 0,
      familyMembers: parsed.familyMembers?.length || 0,
      profileFields
    };
  },

  _buildPreviewHtml: (parsed) => {
    const profileRows = Object.entries(parsed.userProfile || {}).map(([k, v]) => `<li>${k}: ${v}</li>`).join('');
    const assetRows = (parsed.assets || []).slice(0, 5).map((a) => `<li>${a.name} (${a.category}) - ${utils.formatCurrency(a.value || 0)}</li>`).join('');
    const liabilityRows = (parsed.liabilities || []).slice(0, 5).map((l) => `<li>${l.name} (${l.category || l.type || 'Liability'}) - ${utils.formatCurrency(l.amount || 0)}</li>`).join('');
    const goalRows = (parsed.goals || []).slice(0, 5).map((g) => `<li>${g.name} (${g.category}) target ${g.targetYear}</li>`).join('');
    const memberRows = (parsed.familyMembers || []).slice(0, 5).map((m) => `<li>${m.name} (${m.relationship}) age ${m.age}, income ${utils.formatCurrency(m.income || 0)}</li>`).join('');

    return `
      <h4>Profile</h4>
      <ul>${profileRows || '<li>No profile values detected</li>'}</ul>
      <h4>Assets</h4>
      <ul>${assetRows || '<li>No assets detected</li>'}</ul>
      <h4>Liabilities</h4>
      <ul>${liabilityRows || '<li>No liabilities detected</li>'}</ul>
      <h4>Goals</h4>
      <ul>${goalRows || '<li>No goals detected</li>'}</ul>
      <h4>Family Members</h4>
      <ul>${memberRows || '<li>No family members detected</li>'}</ul>
    `;
  },

  reviewAndConfirm: (parsed) => {
    const modal = document.getElementById('pdfImportReviewModal');
    const summary = document.getElementById('pdfImportReviewSummary');
    const preview = document.getElementById('pdfImportReviewPreview');
    const applyBtn = document.getElementById('applyPdfImportBtn');
    const cancelBtn = document.getElementById('cancelPdfImportBtn');
    const closeBtn = document.getElementById('pdfImportReviewClose');

    if (!modal || !summary || !preview || !applyBtn || !cancelBtn) {
      return Promise.resolve(true);
    }

    const counts = {
      profile: Object.keys(parsed.userProfile || {}).length,
      assets: parsed.assets?.length || 0,
      liabilities: parsed.liabilities?.length || 0,
      goals: parsed.goals?.length || 0,
      members: parsed.familyMembers?.length || 0
    };

    summary.textContent = `Detected ${counts.profile} profile fields, ${counts.assets} assets, ${counts.liabilities} liabilities, ${counts.goals} goals, ${counts.members} family members.`;
    preview.innerHTML = pdfImport._buildPreviewHtml(parsed);

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');

    return new Promise((resolve) => {
      const close = (approved) => {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        applyBtn.removeEventListener('click', onApprove);
        cancelBtn.removeEventListener('click', onReject);
        closeBtn?.removeEventListener('click', onReject);
        modal.removeEventListener('click', onBackdrop);
        resolve(approved);
      };

      const onApprove = () => close(true);
      const onReject = () => close(false);
      const onBackdrop = (event) => {
        if (event.target?.dataset?.closePdfImportReview === 'true') {
          close(false);
        }
      };

      applyBtn.addEventListener('click', onApprove);
      cancelBtn.addEventListener('click', onReject);
      closeBtn?.addEventListener('click', onReject);
      modal.addEventListener('click', onBackdrop);
    });
  }
};

function appendChatMessage(role, text, isTyping = false) {
  const messages = document.getElementById('chatbotMessages');
  if (!messages) return null;
  
  const div = document.createElement('div');
  div.className = 'chatbot-message ' + (role === 'user' ? 'user' : 'bot');
  
  // Create avatar
  const avatar = document.createElement('div');
  avatar.className = 'chatbot-avatar';
  avatar.textContent = role === 'user' ? 'U' : 'G';
  
  // Create content container
  const content = document.createElement('div');
  content.className = 'chatbot-content';
  
  if (isTyping) {
    content.innerHTML = '<div class="chatbot-typing"><span></span><span></span><span></span></div>';
  } else {
    // Format the text with proper paragraph breaks
    // Split on double newlines for paragraphs
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    if (paragraphs.length > 1) {
      content.innerHTML = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
    } else {
      // Single paragraph - just use line breaks
      content.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
    }
  }
  
  div.appendChild(avatar);
  div.appendChild(content);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  
  return div;
}

function updateChatMessage(div, text) {
  if (!div) return;
  const content = div.querySelector('.chatbot-content');
  if (!content) return;
  
  // Format the text with proper paragraph breaks
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  if (paragraphs.length > 1) {
    content.innerHTML = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  } else {
    content.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
  }
}

// Update health score badge with animated ring
function updateHealthScoreBadge() {
  try {
    const scoreEl = document.getElementById('profileScore');
    const ringEl = document.getElementById('healthScoreRing');
    
    if (!scoreEl) return;
    
    // Try to get profile and score
    let score = null;
    
    if (window.GiniUserProfile) {
      const profile = window.GiniUserProfile.load();
      score = profile.healthSnapshot?.overallScore;
    }
    
    // If no data or score is null, show "--"
    if (score === null || score === undefined) {
      scoreEl.textContent = '--';
      if (ringEl) {
        ringEl.style.strokeDasharray = '0, 100';
        ringEl.style.stroke = 'rgba(255,255,255,0.3)';
      }
      return;
    }
    
    // Show the actual score
    scoreEl.textContent = score;
    
    // Animate the ring
    if (ringEl) {
      ringEl.style.strokeDasharray = `${score}, 100`;
      
      // Color based on score
      if (score >= 70) {
        ringEl.style.stroke = '#4ade80'; // Green
      } else if (score >= 40) {
        ringEl.style.stroke = '#fbbf24'; // Yellow
      } else {
        ringEl.style.stroke = '#f87171'; // Red
      }
    }
  } catch (e) {
    console.log('[Gini] Could not update health score badge');
    const scoreEl = document.getElementById('profileScore');
    if (scoreEl) scoreEl.textContent = '--';
  }
}

// ============================================================================
// AI CHATBOT WITH COMPREHENSIVE DATA ACCESS
// ============================================================================

// Function to gather ALL application data for AI context
function gatherComprehensiveFinancialData() {
  try {
    const data = {
      // 1. NET WORTH DATA
      netWorth: {
        total: 0,
        totalAssets: 0,
        totalLiabilities: 0,
        debtToAssetRatio: 0,
        savingsRate: 0
      },
      
      // 2. GOALS DATA (with calculations)
      goals: {
        count: 0,
        items: [],
        totalMonthlySIPNeeded: 0,
        criticalCount: 0,
        completedCount: 0
      },
      
      // 3. PORTFOLIO DATA
      portfolio: {
        totalValue: 0,
        weightedReturn: 0,
        allocations: [],
        riskLevel: 'Unknown'
      },
      
      // 4. MONTE CARLO RESULTS (if available)
      monteCarlo: {
        hasResults: false,
        probability: 0,
        median: 0,
        best: 0,
        worst: 0,
        target: 0
      },
      
      // 5. REQUIRED RETURN (if calculated)
      requiredReturn: {
        hasResults: false,
        requiredRate: 0,
        gap: 0,
        verdict: ''
      },
      
      // 6. FAMILY MEMBERS
      family: {
        count: 0,
        members: []
      }
    };
    
    // Safely get net worth data
    if (typeof networth !== 'undefined' && networth.calculateNetWorth) {
      data.netWorth.total = networth.calculateNetWorth();
      data.netWorth.totalAssets = networth.calculateTotalAssets();
      data.netWorth.totalLiabilities = networth.calculateTotalLiabilities();
      
      if (data.netWorth.totalAssets > 0) {
        data.netWorth.debtToAssetRatio = (data.netWorth.totalLiabilities / data.netWorth.totalAssets * 100);
        data.netWorth.savingsRate = ((data.netWorth.totalAssets - data.netWorth.totalLiabilities) / data.netWorth.totalAssets * 100);
      }
    }
    
    // Safely get goals data
    if (typeof appState !== 'undefined' && appState.goals && Array.isArray(appState.goals)) {
      data.goals.count = appState.goals.length;
      const currentYear = new Date().getFullYear();
      
      appState.goals.forEach(g => {
        const years = g.targetYear - currentYear;
        if (years <= 0) return;
        
        const targetAmount = g.currentCost * Math.pow(1 + g.inflation / 100, years);
        const monthsToGoal = years * 12;
        const monthlyReturn = g.return / 100 / 12;
        const futureValue = g.saved * Math.pow(1 + g.return / 100, years);
        const gap = targetAmount - futureValue;
        
        let requiredMonthlySIP = 0;
        if (gap > 0 && monthsToGoal > 0 && monthlyReturn > 0) {
          requiredMonthlySIP = (gap * monthlyReturn) / (Math.pow(1 + monthlyReturn, monthsToGoal) - 1);
        }
        
        const goalData = {
          name: g.name,
          category: g.category,
          targetYear: g.targetYear,
          yearsLeft: years,
          currentCost: g.currentCost,
          targetAmount: targetAmount,
          saved: g.saved,
          gap: gap,
          requiredMonthlySIP: requiredMonthlySIP,
          expectedReturn: g.return,
          inflation: g.inflation,
          priority: g.priority
        };
        
        data.goals.items.push(goalData);
        data.goals.totalMonthlySIPNeeded += requiredMonthlySIP;
        
        if (g.return > 18 || requiredMonthlySIP > g.saved * 0.1) {
          data.goals.criticalCount++;
        }
        if (g.saved >= targetAmount) {
          data.goals.completedCount++;
        }
      });
    }
    
    // Safely get portfolio data
    if (typeof appState !== 'undefined' && appState.assets && Array.isArray(appState.assets)) {
      const portfolioAssets = appState.assets.filter(a =>
        ['Stocks', 'Mutual Funds', 'Fixed Deposits'].includes(a.category)
      );

      data.portfolio.totalValue = portfolioAssets.reduce((sum, a) => sum + (a.value || 0), 0);

      if (portfolioAssets.length > 0 && data.portfolio.totalValue > 0) {
        let totalReturn = 0;
        portfolioAssets.forEach(a => {
          const allocation = (a.value || 0) / data.portfolio.totalValue;
          const returnRate = a.return || 10;
          totalReturn += allocation * returnRate;

          data.portfolio.allocations.push({
            type: a.category,
            value: a.value,
            allocation: allocation * 100,
            returnRate: returnRate
          });
        });
        data.portfolio.weightedReturn = totalReturn;

        const equityAllocation = portfolioAssets
          .filter(a => a.category === 'Stocks' || a.category === 'Mutual Funds')
          .reduce((sum, a) => sum + (a.value || 0), 0) / data.portfolio.totalValue * 100;

        if (equityAllocation > 70) data.portfolio.riskLevel = 'Aggressive';
        else if (equityAllocation > 40) data.portfolio.riskLevel = 'Moderate';
        else data.portfolio.riskLevel = 'Conservative';
      }
    }
    
    // Check for Monte Carlo results
    try {
      const mcProbElement = document.getElementById('mcProbability');
      if (mcProbElement && mcProbElement.textContent && mcProbElement.textContent !== '-') {
        data.monteCarlo.hasResults = true;
        data.monteCarlo.probability = parseFloat(mcProbElement.textContent) || 0;
        
        const mcMedianEl = document.getElementById('mcMedian');
        const mcBestEl = document.getElementById('mcBest');
        const mcWorstEl = document.getElementById('mcWorst');
        const mcTargetEl = document.getElementById('mcTarget');
        
        if (mcMedianEl) data.monteCarlo.median = parseFloat(mcMedianEl.dataset.raw || mcMedianEl.textContent.replace(/[₹,]/g, '')) || 0;
        if (mcBestEl) data.monteCarlo.best = parseFloat(mcBestEl.dataset.raw || mcBestEl.textContent.replace(/[₹,]/g, '')) || 0;
        if (mcWorstEl) data.monteCarlo.worst = parseFloat(mcWorstEl.dataset.raw || mcWorstEl.textContent.replace(/[₹,]/g, '')) || 0;
        if (mcTargetEl) data.monteCarlo.target = parseFloat(mcTargetEl.value) || 0;
      }
    } catch (e) {
      console.log('Monte Carlo results not available');
    }
    
    // Check for Required Return results
    try {
      const rrRequiredEl = document.getElementById('rrRequired');
      if (rrRequiredEl && rrRequiredEl.textContent && rrRequiredEl.textContent !== '-') {
        data.requiredReturn.hasResults = true;
        data.requiredReturn.requiredRate = parseFloat(rrRequiredEl.textContent) || 0;
        
        const rrExpectedEl = document.getElementById('rrExpected');
        if (rrExpectedEl) {
          const expectedReturn = parseFloat(rrExpectedEl.value) || 12;
          data.requiredReturn.gap = data.requiredReturn.requiredRate - expectedReturn;
          
          if (data.requiredReturn.requiredRate < 12) {
            data.requiredReturn.verdict = 'Achievable - Conservative';
          } else if (data.requiredReturn.requiredRate < 18) {
            data.requiredReturn.verdict = 'Challenging - Requires Discipline';
          } else {
            data.requiredReturn.verdict = 'Aggressive - High Risk';
          }
        }
      }
    } catch (e) {
      console.log('Required Return results not available');
    }
    
    // Safely get family data. (This previously read the non-existent
    // appState.family / m.relation keys, so the AI never actually received
    // the household composition — names, ages, roles were always empty.)
    if (typeof appState !== 'undefined' && Array.isArray(appState.familyMembers)) {
      data.family.count = appState.familyMembers.length;
      data.family.members = appState.familyMembers.map(m => ({
        name: m.name || 'Unknown',
        age: m.age || 0,
        relationship: m.relationship || 'Unknown',
        income: m.income || 0,
        isEarner: Boolean(m.isEarner),
        isDependent: Boolean(m.isDependent),
        retirementAge: m.retirementAge || 60
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Error gathering financial data:', error);
    // Return minimal safe data structure
    return {
      netWorth: { total: 0, totalAssets: 0, totalLiabilities: 0, debtToAssetRatio: 0, savingsRate: 0 },
      goals: { count: 0, items: [], totalMonthlySIPNeeded: 0, criticalCount: 0, completedCount: 0 },
      portfolio: { totalValue: 0, weightedReturn: 0, allocations: [], riskLevel: 'Unknown' },
      monteCarlo: { hasResults: false, probability: 0, median: 0, best: 0, worst: 0, target: 0 },
      requiredReturn: { hasResults: false, requiredRate: 0, gap: 0, verdict: '' },
      family: { count: 0, members: [] }
    };
  }
}

async function callAIChatAPI(messages) {
  // Gather ALL data from entire application
  const allData = gatherComprehensiveFinancialData();
  
  // Build comprehensive, data-rich context
  let contextText = `You are Gini, an expert financial advisor AI with access to ALL user data across the platform.

═══════════════════════════════════════════════════════
COMPLETE FINANCIAL PROFILE
═══════════════════════════════════════════════════════

📊 NET WORTH SUMMARY:
• Total Net Worth: ${utils.formatCurrency(allData.netWorth.total)}
• Assets: ${utils.formatCurrency(allData.netWorth.totalAssets)}
• Liabilities: ${utils.formatCurrency(allData.netWorth.totalLiabilities)}
• Debt-to-Asset Ratio: ${allData.netWorth.debtToAssetRatio.toFixed(1)}% ${allData.netWorth.debtToAssetRatio > 50 ? '🚨 HIGH RISK' : allData.netWorth.debtToAssetRatio > 30 ? '⚠️ MODERATE' : '✅ HEALTHY'}
• Savings Rate: ${allData.netWorth.savingsRate.toFixed(1)}%

`;

  // Add Goals Analysis
  if (allData.goals.count > 0) {
    contextText += `🎯 GOALS ANALYSIS (${allData.goals.count} Active Goals):
`;
    allData.goals.items.forEach(g => {
      contextText += `• ${g.name} (${g.category}): Target ₹${(g.targetAmount/100000).toFixed(1)}L by ${g.targetYear} (${g.yearsLeft}y left)
  - Current savings: Rs.${(g.saved/100000).toFixed(1)}L
  - Gap to cover: ₹${(g.gap/100000).toFixed(1)}L
  - Required monthly SIP: ₹${(g.requiredMonthlySIP/1000).toFixed(1)}K
  - Expected return: ${g.expectedReturn}% | Inflation: ${g.inflation}%
  - Priority: ${g.priority}
`;
    });
    contextText += `\n📈 TOTAL Monthly SIP Needed: ₹${(allData.goals.totalMonthlySIPNeeded/1000).toFixed(1)}K across all goals\n`;
    if (allData.goals.criticalCount > 0) {
      contextText += `⚠️ ${allData.goals.criticalCount} goal(s) need attention (aggressive returns or high SIP required)\n`;
    }
    if (allData.goals.completedCount > 0) {
      contextText += `🎉 ${allData.goals.completedCount} goal(s) already achieved!\n`;
    }
  } else {
    contextText += `🎯 GOALS: No goals set yet. Recommend creating financial goals.\n`;
  }

  // Add Portfolio Analysis
  contextText += `\n💼 PORTFOLIO ANALYSIS:
• Total Portfolio Value: ${utils.formatCurrency(allData.portfolio.totalValue)}
• Weighted Avg Return: ${allData.portfolio.weightedReturn.toFixed(2)}%
• Risk Profile: ${allData.portfolio.riskLevel}
`;
  
  if (allData.portfolio.allocations.length > 0) {
    contextText += `• Asset Allocation:\n`;
    allData.portfolio.allocations.forEach(a => {
      contextText += `  - ${a.type}: ${utils.formatCurrency(a.value)} (${a.allocation.toFixed(1)}%) @ ${a.returnRate}% return\n`;
    });
  }

  // Add Monte Carlo Results (if available)
  if (allData.monteCarlo.hasResults) {
    contextText += `\n🎲 MONTE CARLO SIMULATION RESULTS:
• Success Probability: ${allData.monteCarlo.probability.toFixed(1)}% ${allData.monteCarlo.probability > 90 ? '✅ EXCELLENT' : allData.monteCarlo.probability > 75 ? '✓ GOOD' : allData.monteCarlo.probability > 50 ? '⚠️ MODERATE' : '🚨 LOW'}
• Target Corpus: ${utils.formatCurrency(allData.monteCarlo.target)}
• Median Outcome: ${utils.formatCurrency(allData.monteCarlo.median)}
• Best Case (90th %ile): ${utils.formatCurrency(allData.monteCarlo.best)}
• Worst Case (10th %ile): ${utils.formatCurrency(allData.monteCarlo.worst)}
• Interpretation: ${allData.monteCarlo.probability}% chance of reaching Rs.${(allData.monteCarlo.target/100000).toFixed(1)}L target
`;
  }

  // Add Required Return Results (if available)
  if (allData.requiredReturn.hasResults) {
    contextText += `\n📊 REQUIRED RETURN CALCULATION:
• Required Annual Return: ${allData.requiredReturn.requiredRate.toFixed(2)}%
• Gap vs Expected: ${allData.requiredReturn.gap > 0 ? '+' : ''}${allData.requiredReturn.gap.toFixed(2)}%
• Verdict: ${allData.requiredReturn.verdict}
${allData.requiredReturn.requiredRate > 18 ? '🚨 WARNING: >18% returns are very difficult to achieve consistently. Consider adjusting goals or increasing contributions.' : ''}
${allData.requiredReturn.requiredRate > 15 && allData.requiredReturn.requiredRate <= 18 ? '⚠️ CHALLENGING: Requires aggressive equity allocation and disciplined investing.' : ''}
${allData.requiredReturn.requiredRate <= 12 ? '✅ ACHIEVABLE: Conservative diversified portfolio can meet this target.' : ''}
`;
  }

  // Add Family Context
  if (allData.family.count > 0) {
    contextText += `\n👨‍👩‍👧‍👦 FAMILY MEMBERS (${allData.family.count}):
`;
    allData.family.members.forEach(m => {
      contextText += `• ${m.name}, Age ${m.age} (${m.relation})${m.income > 0 ? ` - Income: ${utils.formatCurrency(m.income)}/month` : ''}\n`;
    });
  }

  contextText += `\n═══════════════════════════════════════════════════════
AI ADVISOR INSTRUCTIONS
═══════════════════════════════════════════════════════

YOU HAVE ACCESS TO ALL DATA ABOVE. Use it intelligently.

RESPONSE RULES:
1. Be SPECIFIC with numbers from the data (don't make up values)
2. If user asks about Monte Carlo, Required Return, Goals, Portfolio - YOU HAVE THE DATA above
3. Give ACTIONABLE recommendations with calculations
4. Keep responses 60-80 words, conversational
5. Progress conversation - don't repeat same info

FORMATTING RULES (CRITICAL):
• Use PLAIN TEXT ONLY - no markdown, no asterisks, no bullets
• For lists, use numbered format: "1) Item one 2) Item two 3) Item three"
• For tables, use this simple format:
  Goal 1: Home Purchase needs ₹45K/month over 5 years
  Goal 2: Education needs ₹32K/month over 8 years
  Total: ₹77K/month required
• Separate sections with a blank line, not with symbols
• Write like you're texting a smart friend - natural, direct, helpful

EXAMPLE GOOD RESPONSE:
"Your 6 goals need ₹95K monthly SIP total. That 18% required return is aggressive. Three realistic options: 1) Increase current ₹50K savings to ₹75K monthly 2) Extend flexible goals by 3 years to drop return need to 12% 3) Prioritize top 4 goals, defer the rest. Which approach works for your budget?"

EXAMPLE BAD RESPONSE (Don't do this):
"**Analysis:** Your goals are:
- Goal 1: ₹45K
- Goal 2: ₹32K
**Recommendation:** Increase SIP"

WHEN USER SAYS:
• "analyze this" / "evaluate" → Use the relevant section data above
• "monte carlo results" → Reference MONTE CARLO section
• "my goals" → Reference GOALS section  
• "portfolio" → Reference PORTFOLIO section
• "is this realistic" → Comment on Required Return or Goal SIPs

SMART ANALYSIS:
• If Required Return >15%: Flag as aggressive, suggest alternatives
• If Total SIP >${(allData.goals.totalMonthlySIPNeeded/1000).toFixed(0)}K: Comment if this seems high relative to income
• If Monte Carlo <80%: Suggest increasing contributions or extending timeline
• If Debt Ratio >40%: Prioritize debt paydown
• If no emergency fund: Make it priority #1

CALCULATION EXAMPLES:
• Future Value: FV = PV × (1+r)^n
• SIP needed: (Gap × r/12) / ((1+r/12)^months - 1)
• If user has multiple goals, analyze trade-offs

Be direct, insightful, and helpful. Use the comprehensive data you have!`;

  const contextMessage = {
    role: 'system',
    content: contextText
  };

  const fullMessages = [contextMessage, ...messages];

  try {
    // Build messages for Claude proxy
    const aiMessages = fullMessages.map(m => ({
      role: m.role === 'system' ? 'system' : (m.role === 'assistant' ? 'assistant' : 'user'),
      content: m.content
    }));

    let response;
    let maxRetries = 3;
    let lastError = null;

    // Retry mechanism with exponential backoff
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Use Vercel Function proxy (API key stays on server, never exposed to client)
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: aiMessages,
            maxOutputTokens: 180
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success && data.reply) {
          window.__giniLastAIUsage = data.usage || null;
          return data.reply;
        } else if (data.error) {
          lastError = data.error;
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }
          return `[AI Error] ${data.error}`;
        } else {
          return '[AI] Sorry, I could not generate a response.';
        }
      } catch (fetchError) {
        lastError = fetchError;
        if (attempt < maxRetries - 1) {
          // Exponential backoff: wait 1s, 2s, 4s before retrying
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }
      }
    }

    // If all retries failed
    throw lastError || new Error('All retry attempts failed');

  } catch (error) {
    console.error('AI API Error:', error);
    return `[AI Error] ${error.message || 'Network error. Please check your connection and ensure API key is valid.'}`;
  }
}

// Sanitize and format AI reply before rendering in chat UI
function sanitizeAIReply(text) {
  try {
    if (!text) return '';
    // Ensure string
    let out = String(text);

    // Remove common markdown emphasis (**, *, `)
    out = out.replace(/\*\*(.*?)\*\*/gs, '$1');
    out = out.replace(/\*(.*?)\*/gs, '$1');
    out = out.replace(/`([^`]*)`/g, '$1');

    // Normalize Windows/Unix line endings
    out = out.replace(/\r\n?/g, '\n');

    // Convert markdown numbered lists (1. ) to '1) ' for readability
    out = out.replace(/^\s*(\d+)\.\s+/gm, '$1) ');

    // Convert markdown bullets (- or *) at line start to a simple bullet
    out = out.replace(/^\s*[-\*]\s+/gm, '• ');

    // If text contains a markdown table (lines with pipes and a separator), render as ASCII table
    const lines = out.split('\n');
    const hasTable = lines.some((l, i) => l.indexOf('|') >= 0 && lines[i+1] && /^\s*\|?\s*[:-]+/.test(lines[i+1]));
    if (hasTable) {
      // Extract contiguous table block
      let start = 0, end = lines.length - 1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].indexOf('|') >= 0) { start = i; break; }
      }
      for (let i = start; i < lines.length; i++) {
        if (lines[i].indexOf('|') < 0) { end = i - 1; break; }
        if (i === lines.length - 1) end = i;
      }
      const tableLines = lines.slice(start, end + 1);
      const rows = tableLines.map(r => r.split('|').map(c => c.trim()).filter((_, idx, arr) => !(idx===0 && arr[0]==='')));
      // compute col widths
      const colCount = Math.max(...rows.map(r => r.length));
      const widths = new Array(colCount).fill(0);
      rows.forEach(r => { for (let i=0;i<colCount;i++) { const v = (r[i]||''); widths[i] = Math.max(widths[i], v.length); } });
      // build ascii table
      const pad = (s,w) => s + ' '.repeat(w - s.length);
      const ascii = rows.map(r => '| ' + r.map((c,i)=>pad(c||'', widths[i])).join(' | ') + ' |').join('\n');
      // replace block in out
      out = lines.slice(0, start).join('\n') + '\n' + ascii + '\n' + lines.slice(end+1).join('\n');
    }

    // Remove multiple blank lines
    out = out.replace(/\n{3,}/g, '\n\n');

    // Trim spaces on each line
    out = out.split('\n').map(l => l.trim()).join('\n');

    return out;
  } catch (e) {
    console.error('sanitizeAIReply error', e);
    return String(text).replace(/\*/g, '');
  }
}

function showAuthNotification(message, type = 'success') {
  const region = document.getElementById('giniToastRegion');
  if (!region || !message) return;

  const toast = document.createElement('div');
  toast.className = 'gini-toast';
  toast.dataset.type = type;
  toast.textContent = message;
  region.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
  }, 2600);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}

window.showAuthNotification = showAuthNotification;

// Escape user-entered text before injecting into innerHTML (names etc.)
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
window.escapeHtml = escapeHtml;

// Confirm dialog that prefers the premium GiniUX modal (gini-premium.js)
// and falls back to native confirm() if it isn't loaded.
function giniConfirm(options, onConfirm) {
  if (window.GiniUX?.confirm) {
    window.GiniUX.confirm(options).then((ok) => { if (ok) onConfirm(); });
  } else if (confirm(options.message || 'Are you sure?')) {
    onConfirm();
  }
}

function setupChatbot() {
  const toggle = document.getElementById('chatbotToggle');
  const windowEl = document.getElementById('chatbotWindow');
  const closeBtn = document.getElementById('chatbotClose');
  const clearBtn = document.getElementById('chatbotClear');
  const form = document.getElementById('chatbotForm');
  const input = document.getElementById('chatbotInput');
  const messages = document.getElementById('chatbotMessages');
  const quickActions = document.getElementById('chatbotQuickActions');
  const paymentModal = document.getElementById('paymentModal');
  const paymentModalClose = document.getElementById('paymentModalClose');
  const paymentModalLaterBtn = document.getElementById('paymentModalLaterBtn');
  const paymentModalPayBtn = document.getElementById('paymentModalPayBtn');
  
  if (!toggle || !windowEl || !closeBtn || !form || !input || !messages) return;

  const limitBadge = document.getElementById('chatbotLimitBadge');
  const sendBtn = form.querySelector('button[type="submit"]');
  let quota = loadChatQuota();
  let hasShownPaywallPopup = false;
  let selectedPackId = 'ai_500';

  const openPaymentModal = () => {
    if (!paymentModal) return;
    paymentModal.classList.remove('hidden');
    paymentModal.setAttribute('aria-hidden', 'false');
  };

  const closePaymentModal = () => {
    if (!paymentModal) return;
    paymentModal.classList.add('hidden');
    paymentModal.setAttribute('aria-hidden', 'true');
  };

  const updateQuotaBadge = () => {
    if (!limitBadge) return;
    const remaining = Math.max(0, quota.tokenBalance);
    if (quota.paywallLocked || remaining <= 0) {
      limitBadge.textContent = 'AI tokens finished. Add credits to continue.';
      return;
    }
    limitBadge.textContent = isGiniProActive()
      ? `${formatTokenCount(remaining)} AI tokens · Pro depth`
      : `${formatTokenCount(remaining)} AI tokens · Free plan`;
  };

  const showPaywallMessage = () => {
    appendChatMessage(
      'bot',
      isGiniProActive()
        ? 'Your AI token balance is finished. Add a token pack to continue our conversations.'
        : `Your AI token balance is finished. Add a token pack — or go Pro and get ${formatTokenCount(CHAT_LIMITS.proIncludedTokens)} tokens included plus full-depth advisor answers.`
    );

    if (!hasShownPaywallPopup) {
      hasShownPaywallPopup = true;
      openPaymentModal();
    }
  };

  const setChatLocked = (locked) => {
    if (locked) {
      input.disabled = true;
      input.placeholder = 'AI tokens finished. Add credits to continue.';
      if (sendBtn) sendBtn.disabled = true;
      if (quickActions) quickActions.style.pointerEvents = 'none';
      if (quickActions) quickActions.style.opacity = '0.45';
      return;
    }

    input.disabled = false;
    input.placeholder = 'Ask about your finances...';
    if (sendBtn) sendBtn.disabled = false;
    if (quickActions) quickActions.style.pointerEvents = '';
    if (quickActions) quickActions.style.opacity = '';
  };

  const enforcePaywallIfNeeded = (showMessage = false) => {
    if (quota.paywallLocked || quota.tokenBalance <= 0) {
      quota.paywallLocked = true;
      saveChatQuota(quota);
      setChatLocked(true);
      updateQuotaBadge();
      if (showMessage) showPaywallMessage();
      return true;
    }
    return false;
  };

  updateQuotaBadge();
  enforcePaywallIfNeeded(false);

  if (quota.paywallLocked) {
    hasShownPaywallPopup = true;
    openPaymentModal();
  }

  const renderTokenPacks = () => {
    const container = document.getElementById('aiTokenPackOptions');
    if (!container) return;
    container.innerHTML = Object.values(AI_TOKEN_PACKS).map((pack) => `
      <button class="ai-pack-option${pack.id === selectedPackId ? ' active' : ''}" type="button" data-pack-id="${pack.id}">
        ${pack.id === 'ai_1000' ? '<span class="ai-pack-option__badge">Popular</span>' : ''}
        ${pack.id === 'ai_2000' ? '<span class="ai-pack-option__badge">Best value</span>' : ''}
        <span class="ai-pack-option__name">${pack.label}</span>
        <strong>Rs.${pack.amountINR}</strong>
        <span>${formatTokenCount(pack.tokens)} tokens</span>
      </button>
    `).join('');
  };

  const syncSelectedPack = () => {
    const pack = AI_TOKEN_PACKS[selectedPackId] || AI_TOKEN_PACKS.ai_500;
    const priceEl = document.getElementById('aiTokenPackPrice');
    const tokensEl = document.getElementById('aiTokenPackTokens');
    if (priceEl) priceEl.textContent = String(pack.amountINR);
    if (tokensEl) tokensEl.textContent = `${formatTokenCount(pack.tokens)} tokens`;
    if (paymentModalPayBtn) paymentModalPayBtn.textContent = `Pay Rs.${pack.amountINR}`;
    renderTokenPacks();
  };

  renderTokenPacks();
  syncSelectedPack();

  const startRazorpayCheckout = async (packId) => {
    const pack = AI_TOKEN_PACKS[packId] || AI_TOKEN_PACKS.ai_500;
    if (!window.Razorpay) {
      throw new Error('Razorpay checkout script is not loaded.');
    }

    const orderResponse = await fetch('/api/razorpay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packId: pack.id })
    });
    const orderData = await orderResponse.json();
    if (!orderResponse.ok || !orderData.success) {
      throw new Error(orderData.error || 'Unable to start payment.');
    }

    return new Promise((resolve, reject) => {
      const checkout = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Xtin Gini',
        description: `${pack.label} AI token pack`,
        order_id: orderData.order.id,
        notes: { packId: pack.id },
        handler: async (paymentResult) => {
          try {
            const verifyResponse = await fetch('/api/razorpay-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ packId: pack.id, ...paymentResult })
            });
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment verification failed.');
            }
            resolve(verifyData);
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled.'))
        },
        theme: { color: '#00a651' }
      });
      checkout.open();
    });
  };

  if (paymentModal) {
    paymentModal.addEventListener('click', (e) => {
      const shouldClose = e.target?.dataset?.closePaymentModal === 'true';
      if (shouldClose) closePaymentModal();
    });
  }

  if (paymentModalClose) {
    paymentModalClose.addEventListener('click', closePaymentModal);
  }

  if (paymentModalLaterBtn) {
    paymentModalLaterBtn.addEventListener('click', closePaymentModal);
  }

  if (paymentModalPayBtn) {
    paymentModalPayBtn.addEventListener('click', async () => {
      const pack = AI_TOKEN_PACKS[selectedPackId] || AI_TOKEN_PACKS.ai_500;
      window.dispatchEvent(new CustomEvent('gini:payment:requested', {
        detail: {
          amount: pack.amountINR,
          currency: 'INR',
          source: 'chat-paywall',
          pack
        }
      }));

      paymentModalPayBtn.disabled = true;
      paymentModalPayBtn.textContent = 'Opening Razorpay...';

      try {
        if (AUTO_CONFIRM_PAYMENTS_UNTIL_RAZORPAY) {
          window.dispatchEvent(new CustomEvent('gini:payment:success', {
            detail: {
              pack,
              amount: pack.amountINR,
              source: 'chat-paywall'
            }
          }));
        } else {
          const verifiedPayment = await startRazorpayCheckout(pack.id);
          window.dispatchEvent(new CustomEvent('gini:payment:success', {
            detail: {
              pack: verifiedPayment.pack,
              amount: verifiedPayment.pack.amountINR,
              paymentId: verifiedPayment.paymentId,
              orderId: verifiedPayment.orderId,
              source: 'chat-paywall'
            }
          }));
        }
      } catch (error) {
        console.error('[Gini] Payment error:', error);
        appendChatMessage('bot', error.message || 'Payment could not be completed. Please try again.');
      } finally {
        paymentModalPayBtn.disabled = false;
        syncSelectedPack();
      }
    });
  }

  const packOptions = document.getElementById('aiTokenPackOptions');
  if (packOptions) {
    packOptions.addEventListener('click', (event) => {
      const option = event.target.closest('[data-pack-id]');
      if (!option) return;
      selectedPackId = option.dataset.packId;
      syncSelectedPack();
    });
  }

  window.addEventListener('gini:payment:success', (event) => {
    const source = event?.detail?.source;
    if (source && source !== 'chat-paywall') return;

    const pack = event?.detail?.pack || AI_TOKEN_PACKS.ai_500;
    quota = addAITokensToWallet(pack, {
      paymentId: event?.detail?.paymentId,
      orderId: event?.detail?.orderId
    });
    quota.paywallLocked = false;
    saveChatQuota(quota);
    hasShownPaywallPopup = false;
    setChatLocked(false);
    updateQuotaBadge();
    closePaymentModal();
    appendChatMessage('bot', `Payment received. Added ${formatTokenCount(pack.tokens)} AI tokens. Your balance is now ${formatTokenCount(quota.tokenBalance)} tokens.`);
  });

  // Initialize the AI Engine
  if (window.GiniAIEngine) {
    window.GiniAIEngine.initialize();
    updateHealthScoreBadge();
  }

  let serverCheckDone = false;
  async function checkServerOnFirstOpen() {
    if (serverCheckDone) return;
    serverCheckDone = true;
    try {
      const res = await fetch('/api/config', { method: 'GET' });
      if (!res.ok) throw new Error('bad status');
    } catch {
      appendChatMessage('bot', '⚠️ Server not running. Open a terminal in the project folder and run: npm run dev — then refresh this page.');
      setChatLocked(true);
    }
  }

  // Toggle chatbot window
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    windowEl.classList.toggle('hidden');
    if (!windowEl.classList.contains('hidden')) {
      checkServerOnFirstOpen();
      setTimeout(() => {
        input.focus({ preventScroll: true });
      }, 100);
      updateHealthScoreBadge();
    }
  });
  
  // Close chatbot
  closeBtn.addEventListener('click', () => {
    windowEl.classList.add('hidden');
  });
  
  // Clear chat history
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      chatHistory = [];
      // Keep only the welcome message
      const welcomeMsg = messages.querySelector('.chatbot-welcome');
      messages.innerHTML = '';
      if (welcomeMsg) {
        messages.appendChild(welcomeMsg);
      } else {
        // Recreate welcome message if needed
        appendChatMessage('bot', 'Chat cleared! How can I help you with your finances today?');
      }
      updateQuotaBadge();
    });
  }
  
  // Quick action buttons
  if (quickActions) {
    quickActions.addEventListener('click', async (e) => {
      const btn = e.target.closest('.quick-action-btn');
      if (!btn) return;
      
      const action = btn.dataset.action;
      let prompt = '';
      
      switch (action) {
        case 'health':
          prompt = 'How am I doing financially? Give me a quick health check.';
          break;
        case 'goals':
          prompt = 'Review my financial goals and tell me if I am on track.';
          break;
        case 'next':
          prompt = 'What should I focus on next? Give me my top priorities.';
          break;
        case 'portfolio':
          prompt = 'How does my portfolio look? Any changes needed?';
          break;
        default:
          return;
      }
      
      // Trigger the message
      input.value = prompt;
      form.dispatchEvent(new Event('submit'));
    });
  }
  
  // Require login before the AI bot can be used.
  const requireLoginForChat = () => {
    if (window.GiniAuth?.isLoggedIn?.()) return true;
    appendChatMessage(
      'bot',
      'Please log in to use Gini AI. Your financial data stays private and synced to your account once you sign in.'
    );
    // Surface the login modal so the user can sign in right away.
    document.getElementById('giniLoginBtn')?.click();
    return false;
  };

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!requireLoginForChat()) return;
    if (enforcePaywallIfNeeded(true)) return;

    const userMsg = input.value.trim();
    if (!userMsg) return;
    
    // Add user message
    appendChatMessage('user', userMsg);
    input.value = '';
    input.disabled = true;
    
    // Add to chat history
    chatHistory.push({ role: 'user', content: userMsg });
    
    // Show loading indicator
    const typingDiv = appendChatMessage('bot', '', true);
    
    try {
      let aiReply;
      
      // Use the new AI Engine if available
      if (window.GiniAIEngine) {
        aiReply = await window.GiniAIEngine.processMessage(userMsg, chatHistory);
      } else {
        // Fallback to old method
        aiReply = await callAIChatAPI(chatHistory);
        aiReply = sanitizeAIReply(typeof aiReply === 'string' ? aiReply : String(aiReply));
      }

      aiReply = trimToCharLimit(aiReply, getChatReplyCharLimit());
      
      // Update typing indicator with response
      updateChatMessage(typingDiv, aiReply);
      
      // Add to chat history
      chatHistory.push({ role: 'assistant', content: aiReply });
      
      // Keep chat history manageable
      if (chatHistory.length > 20) {
        chatHistory = chatHistory.slice(-16);
      }
      
      // Update health score
      updateHealthScoreBadge();

      const aiUsage = window.GiniAIEngine?.lastUsage || window.__giniLastAIUsage || null;
      const usedTokens = Number(aiUsage?.totalTokens || 0) || estimateTokenUsage(aiReply);
      quota.tokenBalance = Math.max(0, quota.tokenBalance - usedTokens);
      quota.totalUsedTokens += usedTokens;
      if (quota.tokenBalance <= 0) quota.paywallLocked = true;
      saveChatQuota(quota);
      updateQuotaBadge();

      if (enforcePaywallIfNeeded(true)) return;
      
    } catch (err) {
      console.error('[Gini] Chat error:', err);
      updateChatMessage(typingDiv, 'I apologize, but I encountered an error. Please try again.');
    } finally {
      // Re-enable input
      if (!quota.paywallLocked) {
        input.disabled = false;
        input.focus();
      }
    }
    
    messages.scrollTop = messages.scrollHeight;
  });
}
// Xtin Gini - Advanced Financial Planning Calculator

// Xtin Capital Brand Colors for Charts
const chartColors = {
  primary: [
    '#00A651',  // Primary green
    '#009246',  // Darker green
    '#00843D',  // Accent green
    '#4CAF50',  // Light green
    '#66BB6A',  // Lighter green
    '#81C784',  // Soft green
    '#00BFA5',  // Teal green
    '#26A69A',  // Dark teal
    '#80CBC4',  // Light teal
    '#A5D6A7'   // Pale green
  ],
  single: '#00A651',
  transparent: 'rgba(0, 166, 81, 0.1)',
  gradient: {
    start: 'rgba(0, 166, 81, 0.2)',
    end: 'rgba(0, 166, 81, 0.05)'
  }
};

// Chart.js theming based on CSS variables
const getCssVar = (name, fallback = '') => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return (v && v.trim().length) ? v.trim() : fallback;
};

const initChartDefaults = () => {
  if (typeof Chart === 'undefined') return;
  const text = getCssVar('--color-text', '#0f172a');
  const grid = getCssVar('--color-border', 'rgba(2, 6, 23, 0.08)');
  const surface = getCssVar('--color-surface', '#ffffff');

  // Global font and colors
  Chart.defaults.font.family = 'Inter, Poppins, Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  Chart.defaults.color = text;
  Chart.defaults.borderColor = grid;

  // Scales and ticks
  if (!Chart.defaults.scales.category) Chart.defaults.scales.category = {};
  if (!Chart.defaults.scales.linear) Chart.defaults.scales.linear = {};
  Chart.defaults.scales.category.grid = Chart.defaults.scales.category.grid || {};
  Chart.defaults.scales.linear.grid = Chart.defaults.scales.linear.grid || {};
  Chart.defaults.scales.category.grid.color = grid;
  Chart.defaults.scales.linear.grid.color = grid;
  Chart.defaults.scales.category.ticks = Chart.defaults.scales.category.ticks || {};
  Chart.defaults.scales.linear.ticks = Chart.defaults.scales.linear.ticks || {};
  Chart.defaults.scales.category.ticks.color = text;
  Chart.defaults.scales.linear.ticks.color = text;

  // Legend
  Chart.defaults.plugins.legend = Chart.defaults.plugins.legend || {};
  Chart.defaults.plugins.legend.labels = Chart.defaults.plugins.legend.labels || {};
  Chart.defaults.plugins.legend.labels.color = text;

  // Tooltip
  Chart.defaults.plugins.tooltip = Chart.defaults.plugins.tooltip || {};
  Chart.defaults.plugins.tooltip.backgroundColor = surface;
  Chart.defaults.plugins.tooltip.titleColor = text;
  Chart.defaults.plugins.tooltip.bodyColor = text;
  Chart.defaults.plugins.tooltip.borderColor = grid;
  Chart.defaults.plugins.tooltip.borderWidth = 1;

  // Rounded bars for modern look
  Chart.defaults.datasets = Chart.defaults.datasets || {};
  Chart.defaults.datasets.bar = Chart.defaults.datasets.bar || {};
  Chart.defaults.datasets.bar.borderRadius = 8;
};

// State Management
const appState = {
  assets: [],
  liabilities: [],
  goals: [],
  // Fresh installs start with no members: the "Add Yourself" flow collects
  // real data instead of projecting off a fake ₹2L placeholder user.
  // (Existing users' saved households load over this from storage.)
  familyMembers: [],
  familyViewMode: "Household", // "Household", "Individual", "Spouse"
  settings: {
    sipTiming: 'due', // 'due' (start of month) or 'ordinary' (end of month)
    mcMonthlySteps: true,
    mcLognormal: true,
    incomeMode: 'Single', // 'Single', 'Dual', 'Family'
    taxFilingMode: 'Individual', // 'Individual', 'Joint', 'Separate'
    enableCollaboration: false
  },
  userProfile: {
    // Money fields start at 0 — they are derived from real family members
    // on save. Non-zero placeholders here used to leak fake income into
    // reports and health scores before any data was entered.
    currentAge: 30,
    retirementAge: 60,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlySavings: 0,
    lifeExpectancy: 85
  },
  // Elder care & multi-generational planning
  elderCare: [],
  // Children's education timeline
  educationPlans: [],
  // Legacy & estate planning
  estatePlan: {
    beneficiaries: [],
    trusts: [],
    wills: []
  },
  // Tax optimization data
  taxOptimization: {
    deductions80C: {},
    deductions80D: {},
    deductions80E: {},
    hufBenefits: false
  },
  editingAsset: null,
  editingLiability: null,
  editingGoal: null,
  charts: {}
};
// Reports state
appState.reports = {
  financialHealthScore: null,
  lastHealthCheckDate: null,
  scenarios: [],
  yearEndReviews: {},
  autoGenerateYearEnd: true
};

// Deep clone utility for scenarios
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// --- Reporting Engine ---
const reportingEngine = {
  // Composite Financial Health Score (0-100)
  calculateFinancialHealthScore: () => {
    const netWorthScore = reportingEngine.calculateNetWorthScore();
    const savingsRateScore = reportingEngine.calculateSavingsRateScore();
    const debtRatioScore = reportingEngine.calculateDebtRatioScore();
    const emergencyFundScore = reportingEngine.calculateEmergencyFundScore();
    const goalProgressScore = reportingEngine.calculateGoalProgressScore();

    const totalScore = netWorthScore + savingsRateScore + debtRatioScore + emergencyFundScore + goalProgressScore;
    return {
      totalScore,
      breakdown: {
        netWorth: netWorthScore,
        savingsRate: savingsRateScore,
        debtRatio: debtRatioScore,
        emergencyFund: emergencyFundScore,
        goalProgress: goalProgressScore
      },
      rating: reportingEngine.getRating(totalScore)
    };
  },

  calculateNetWorthScore: () => {
    const nw = networth.calculateNetWorth();
    return nw > 0 ? 25 : 0;
  },

  calculateSavingsRateScore: () => {
    const income = appState.userProfile.monthlyIncome || 0;
    const expenses = appState.userProfile.monthlyExpenses || 0;
    const savings = Math.max(income - expenses, 0);
    const rate = income > 0 ? (savings / income) * 100 : 0;
    if (rate >= 20) return 25;
    if (rate <= 0) return 0;
    return Math.min(25, Math.round((rate / 20) * 25));
  },

  calculateDebtRatioScore: () => {
    const income = appState.userProfile.monthlyIncome || 0;
    const totalEMI = appState.liabilities.reduce((sum, l) => sum + (l.emi || 0), 0);
    const ratio = income > 0 ? (totalEMI / income) * 100 : 100;
    if (ratio <= 30) return 20;
    if (ratio >= 50) return 0;
    // Linear interpolation between 30% and 50%
    const over = Math.min(Math.max(ratio - 30, 0), 20);
    return Math.round(20 - (over / 20) * 20);
  },

  calculateEmergencyFundScore: () => {
    const expenses = appState.userProfile.monthlyExpenses || 0;
    // Estimate liquid assets as Cash + FDs categories
    const liquid = appState.assets
      .filter(a => ['Cash', 'Fixed Deposits'].includes(a.category))
      .reduce((s, a) => s + a.value, 0);
    const months = expenses > 0 ? liquid / expenses : 0;
    if (months >= 6) return 15;
    return Math.round(Math.min((months / 6) * 15, 15));
  },

  calculateGoalProgressScore: () => {
    if (appState.goals.length === 0) return 15; // no goals, not penalized
    let onTrack = 0;
    appState.goals.forEach(g => {
      const years = g.targetYear - new Date().getFullYear();
      const fv = utils.calculateFutureValue(g.currentCost, g.inflation || 7, Math.max(years, 0));
      const pct = fv > 0 ? (g.saved || 0) / fv : 1;
      if (pct >= 0.8) onTrack += 1; // consider on-track if 80% funded relative to time horizon (simple proxy)
    });
    const rate = onTrack / appState.goals.length;
    return Math.round(rate * 15);
  },

  getRating: (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  }
};

// --- Reports & Insights Module ---
const insights = {
  lastGeneratedReportType: null,

  toggleReportContainer: (containerId, buttonId, showLabel = 'Hide Report', hideLabel = 'Show Report') => {
    const container = document.getElementById(containerId);
    const toggleBtn = document.getElementById(buttonId);
    if (!container || !toggleBtn) return;

    const isHidden = container.classList.contains('is-hidden') || getComputedStyle(container).display === 'none';

    if (isHidden) {
      container.classList.remove('is-hidden');
      container.style.display = 'block';
      toggleBtn.textContent = showLabel;
      toggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      container.classList.add('is-hidden');
      container.style.display = 'none';
      toggleBtn.textContent = hideLabel;
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  },

  init: () => {
    // Subtab switching
    document.querySelectorAll('#reports-tab .subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#reports-tab .subtab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.subtab;
        insights.showSubtab(target);
      });
    });

    // Actions
    insights.setupGuidedReportFlow();
    
    // Toggle Family Report visibility
    document.getElementById('toggleFamilyReportBtn')?.addEventListener('click', () => {
      insights.toggleReportContainer('familyReportContainer', 'toggleFamilyReportBtn');
    });
    
    // Toggle General Report visibility
    document.getElementById('toggleGeneralReportBtn')?.addEventListener('click', () => {
      insights.toggleReportContainer('reportPreview', 'toggleGeneralReportBtn');
    });
    
    // Render default Financial Health view
    insights.renderHealthReport();
  },

  setupGuidedReportFlow: () => {
    const gate = document.getElementById('reportGateScreen');
    const main = document.getElementById('reportsMainContent');

    if (gate) gate.style.display = 'block';
    if (main) main.style.display = 'none';

    document.querySelectorAll('input[name="reportType"]').forEach((el) => {
      el.addEventListener('change', () => insights.syncReportSectionVisibility());
    });
    insights.syncReportSectionVisibility();
    insights.setupStartGuidePopup();

    document.getElementById('startGenerateReportBtn')?.addEventListener('click', () => {
      insights.requestReportGeneration(insights.getSelectedReportType(), true);
    });

    document.getElementById('finalDownloadReportBtn')?.addEventListener('click', () => {
      insights.downloadCurrentReportPDF();
    });

    insights.setupReportPaywallModal();
  },

  setupStartGuidePopup: () => {
    const popup = document.getElementById('reportGuidePopup');
    const closeBtn = document.getElementById('closeReportGuideBtn');
    if (!popup) return;

    popup.classList.remove('hidden');
    popup.setAttribute('aria-hidden', 'false');

    const close = () => {
      popup.classList.add('hidden');
      popup.setAttribute('aria-hidden', 'true');
    };

    closeBtn?.addEventListener('click', close, { once: true });
    popup.addEventListener('click', (e) => {
      const shouldClose = e.target?.dataset?.closeReportGuide === 'true';
      if (shouldClose) close();
    }, { once: true });
  },

  syncReportSectionVisibility: () => {
    const selectedType = insights.getSelectedReportType();
    const familySection = document.getElementById('familyReportSection');
    const generalSection = document.getElementById('generalReportSection');

    if (selectedType === 'family') {
      if (familySection) familySection.style.display = 'block';
      if (generalSection) generalSection.style.display = 'none';
      return;
    }

    if (familySection) familySection.style.display = 'none';
    if (generalSection) generalSection.style.display = 'block';
  },

  getSelectedReportType: () => {
    const selected = document.querySelector('input[name="reportType"]:checked');
    const type = selected?.value;
    return type === 'family' ? 'family' : 'general';
  },

  downloadCurrentReportPDF: () => {
    if (insights.lastGeneratedReportType === 'family') {
      familyReports.download();
      return;
    }

    if (insights.lastGeneratedReportType === 'general') {
      pdfExport.generateGeneralReportPDF();
      return;
    }

    alert('Please generate a report first.');
  },

  reportQuota: loadReportQuota(),
  pendingReportType: null,
  pendingGuidedMode: false,

  setupReportPaywallModal: () => {
    const modal = document.getElementById('reportPaywallModal');
    const closeBtn = document.getElementById('reportPaywallClose');
    const laterBtn = document.getElementById('reportPaywallLaterBtn');
    const payBtn = document.getElementById('reportPaywallPayBtn');

    if (modal) {
      modal.addEventListener('click', (e) => {
        const shouldClose = e.target?.dataset?.closeReportPaywall === 'true';
        if (shouldClose) insights.closeReportPaywallModal();
      });
    }

    closeBtn?.addEventListener('click', insights.closeReportPaywallModal);
    laterBtn?.addEventListener('click', insights.closeReportPaywallModal);

    payBtn?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('gini:payment:requested', {
        detail: {
          amount: REPORT_LIMITS.extraReportFeeINR,
          currency: 'INR',
          source: 'report-paywall'
        }
      }));

      if (AUTO_CONFIRM_PAYMENTS_UNTIL_RAZORPAY) {
        window.dispatchEvent(new CustomEvent('gini:payment:success', {
          detail: {
            amount: REPORT_LIMITS.extraReportFeeINR,
            source: 'report-paywall'
          }
        }));
      }
    });

    window.addEventListener('gini:payment:success', (event) => {
      const source = event?.detail?.source;
      if (source !== 'report-paywall') return;

      insights.reportQuota = loadReportQuota();
      insights.reportQuota.paidCredits += 1;
      saveReportQuota(insights.reportQuota);
      insights.closeReportPaywallModal();

      if (insights.pendingReportType) {
        const type = insights.pendingReportType;
        const guided = insights.pendingGuidedMode;
        insights.pendingReportType = null;
        insights.pendingGuidedMode = false;
        insights.requestReportGeneration(type, guided);
      }
    });
  },

  openReportPaywallModal: () => {
    if (!REPORT_PAYWALL_ENABLED) return;

    const modal = document.getElementById('reportPaywallModal');
    const usageText = document.getElementById('reportPaywallUsageText');
    insights.reportQuota = loadReportQuota();

    if (usageText) {
      usageText.textContent = `You can generate ${REPORT_LIMITS.freeReportsPerMonth} free report per month. This month you generated ${insights.reportQuota.generatedCount}. Pay Rs.${REPORT_LIMITS.extraReportFeeINR} to generate one more report.`;
    }

    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  },

  closeReportPaywallModal: () => {
    const modal = document.getElementById('reportPaywallModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  },

  canGenerateReportNow: () => {
    if (!REPORT_PAYWALL_ENABLED) return true;

    insights.reportQuota = loadReportQuota();

    if (insights.reportQuota.generatedCount < REPORT_LIMITS.freeReportsPerMonth) {
      return true;
    }

    if (insights.reportQuota.paidCredits > 0) {
      return true;
    }

    return false;
  },

  consumeReportCredit: () => {
    if (!REPORT_PAYWALL_ENABLED) return true;

    insights.reportQuota = loadReportQuota();

    if (insights.reportQuota.generatedCount < REPORT_LIMITS.freeReportsPerMonth) {
      insights.reportQuota.generatedCount += 1;
      saveReportQuota(insights.reportQuota);
      return true;
    }

    if (insights.reportQuota.paidCredits > 0) {
      insights.reportQuota.paidCredits -= 1;
      insights.reportQuota.generatedCount += 1;
      saveReportQuota(insights.reportQuota);
      return true;
    }

    return false;
  },

  requestReportGeneration: (type, guidedMode = false) => {
    if (!REPORT_PAYWALL_ENABLED) {
      if (guidedMode) {
        insights.startGuidedReportGeneration(type);
        return;
      }

      if (type === 'family') {
        insights.generateFamilyReportView();
        return;
      }

      insights.generateGeneralReportView();
      return;
    }

    if (!insights.canGenerateReportNow()) {
      insights.pendingReportType = type;
      insights.pendingGuidedMode = guidedMode;
      insights.openReportPaywallModal();
      return;
    }

    if (!insights.consumeReportCredit()) {
      insights.pendingReportType = type;
      insights.pendingGuidedMode = guidedMode;
      insights.openReportPaywallModal();
      return;
    }

    if (guidedMode) {
      insights.startGuidedReportGeneration(type);
      return;
    }

    if (type === 'family') {
      insights.generateFamilyReportView();
      return;
    }

    insights.generateGeneralReportView();
  },

  startGuidedReportGeneration: (type) => {
    const overlay = document.getElementById('reportGenerationOverlay');
    const progressBar = document.getElementById('reportGenProgressBar');
    const progressText = document.getElementById('reportGenProgressText');

    if (!overlay || !progressBar || !progressText) {
      insights.completeGuidedGeneration(type);
      return;
    }

    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    progressBar.style.width = '0%';
    progressText.textContent = 'Preparing data 0%';

    let progress = 0;
    const timer = setInterval(() => {
      progress = Math.min(progress + 4, 100);
      progressBar.style.width = `${progress}%`;
      progressText.textContent = `Generating report ${progress}%`;

      if (progress >= 100) {
        clearInterval(timer);
        overlay.classList.add('hidden');
        overlay.setAttribute('aria-hidden', 'true');
        insights.completeGuidedGeneration(type);
      }
    }, 110);
  },

  completeGuidedGeneration: (type) => {
    const gate = document.getElementById('reportGateScreen');
    const main = document.getElementById('reportsMainContent');

    if (gate) gate.style.display = 'none';
    if (main) main.style.display = 'block';
    insights.syncReportSectionVisibility();

    if (type === 'family') {
      insights.generateFamilyReportView();
    } else {
      insights.generateGeneralReportView();
    }
  },

  generateFamilyReportView: () => {
    const report = {
      generatedOn: new Date().toLocaleDateString('en-IN'),
      familyStructure: familyReports.getFamilyStructure(),
      netWorthBreakdown: familyReports.getNetWorthBreakdown(),
      goalsProgress: familyReports.getGoalsProgress(),
      retirementAnalysis: familyReports.getRetirementAnalysis(),
      recommendations: familyReports.getRecommendations()
    };

    const container = document.getElementById('familyReportContainer');
    if (!container) return;

    familyReports.renderInContainer(report, container);
    container.classList.remove('is-hidden');
    container.style.display = 'block';

    const toggleBtn = document.getElementById('toggleFamilyReportBtn');
    if (toggleBtn) {
      toggleBtn.style.display = 'inline-block';
      toggleBtn.textContent = 'Hide Report';
      toggleBtn.setAttribute('aria-expanded', 'true');
    }

    insights.lastGeneratedReportType = 'family';
  },

  generateGeneralReportView: () => {
    const includeNetWorth = document.getElementById('includeNetWorth')?.checked ?? true;
    const includeGoals = document.getElementById('includeGoals')?.checked ?? true;
    const includePortfolio = document.getElementById('includePortfolio')?.checked ?? true;

    reports.generateReportWithOptions(includeNetWorth, includeGoals, includePortfolio);

    const toggleBtn = document.getElementById('toggleGeneralReportBtn');

    if (toggleBtn) {
      toggleBtn.style.display = 'inline-block';
      toggleBtn.textContent = 'Hide Report';
      toggleBtn.setAttribute('aria-expanded', 'true');
    }

    insights.lastGeneratedReportType = 'general';
  },

  toggleScenarioForm: (show) => {
    const form = document.getElementById('scenarioFormContainer');
    if (!form) return;
    form.style.display = show ? 'block' : 'none';
    if (show) {
      // Prefill sensible defaults
      const nameEl = document.getElementById('scenarioName');
      if (nameEl && !nameEl.value) nameEl.value = `Scenario ${appState.reports.scenarios.length + 1}`;
      document.getElementById('scenarioRetAge').value = appState.userProfile.retirementAge || 60;
      document.getElementById('scenarioIncomeAdj').value = 0;
      document.getElementById('scenarioExpenseAdj').value = 0;
      document.getElementById('scenarioSavingsOverride').value = '';
      document.getElementById('scenarioReturnAdj').value = 0;
    }
  },

  createScenarioFromForm: () => {
    const name = document.getElementById('scenarioName')?.value?.trim();
    if (!name) { alert('Please enter a scenario name.'); return; }
    const retAge = parseInt(document.getElementById('scenarioRetAge')?.value || '');
    const incomeAdj = parseFloat(document.getElementById('scenarioIncomeAdj')?.value || '0');
    const expenseAdj = parseFloat(document.getElementById('scenarioExpenseAdj')?.value || '0');
    const savingsOverride = parseFloat(document.getElementById('scenarioSavingsOverride')?.value || '');
    const returnAdj = parseFloat(document.getElementById('scenarioReturnAdj')?.value || '0');

    const snapshot = deepClone(appState);
    if (!isNaN(retAge)) snapshot.userProfile.retirementAge = retAge;
    // Apply income/expense adjustments (% change)
    const inc = snapshot.userProfile.monthlyIncome || 0;
    const exp = snapshot.userProfile.monthlyExpenses || 0;
    snapshot.userProfile.monthlyIncome = Math.max(0, Math.round(inc * (1 + (incomeAdj / 100))));
    snapshot.userProfile.monthlyExpenses = Math.max(0, Math.round(exp * (1 + (expenseAdj / 100))));
    if (!isNaN(savingsOverride) && savingsOverride > 0) {
      snapshot.userProfile.monthlySavings = savingsOverride;
    }

    const scenario = insights.createScenario(name, snapshot, { returnAdj });
    if (scenario) {
      insights.toggleScenarioForm(false);
      insights.renderScenarios();
    }
  },

  showSubtab: (sub) => {
    const sections = ['health-report', 'scenario-comparison', 'yearend-review'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if ((sub === 'health' && id === 'health-report') ||
          (sub === 'scenarios' && id === 'scenario-comparison') ||
          (sub === 'yearend' && id === 'yearend-review')) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });
  },

  // Part A: Financial Health Report
  renderHealthReport: () => {
    const score = reportingEngine.calculateFinancialHealthScore();
    appState.reports.financialHealthScore = score;
    appState.reports.lastHealthCheckDate = new Date().toISOString();

    document.getElementById('healthTotalScore').textContent = score.totalScore;
    document.getElementById('healthRating').textContent = score.rating;
    document.getElementById('healthNetWorth').textContent = utils.formatCurrency(networth.calculateNetWorth());

    // Debt-to-income and emergency months
    const income = appState.userProfile.monthlyIncome || 0;
    const totalEMI = appState.liabilities.reduce((sum, l) => sum + (l.emi || 0), 0);
    const dti = income > 0 ? (totalEMI / income) * 100 : 0;
    document.getElementById('healthDTI').textContent = utils.formatNumber(dti, 1) + '%';
    const expenses = appState.userProfile.monthlyExpenses || 0;
    const liquid = appState.assets.filter(a => ['Cash', 'Fixed Deposits'].includes(a.category)).reduce((s, a) => s + a.value, 0);
    const months = expenses > 0 ? liquid / expenses : 0;
    document.getElementById('healthEmergencyMonths').textContent = utils.formatNumber(months, 1) + ' mo';

    // Net worth statement numbers
    const assets = networth.calculateTotalAssets();
    const liabilities = networth.calculateTotalLiabilities();
    document.getElementById('rptTotalAssets').textContent = utils.formatCurrency(assets);
    document.getElementById('rptTotalLiabilities').textContent = utils.formatCurrency(liabilities);
    document.getElementById('rptNetWorth').textContent = utils.formatCurrency(assets - liabilities);

    // Charts
  insights.renderAllocationChart();
  insights.renderCashFlowChart();
  insights.renderRiskRadar();

    // Goals table
  insights.renderGoalsTable();

    // Action items
    insights.renderActionItems();
  },

  renderAllocationChart: () => {
    try {
      const canvas = document.getElementById('rptAllocationChart');
      if (!canvas) return;
      if (appState.charts.rptAllocation) appState.charts.rptAllocation.destroy();

      const byCat = {};
      appState.assets.forEach(a => { byCat[a.category] = (byCat[a.category] || 0) + a.value; });
      const labels = Object.keys(byCat);
      const data = Object.values(byCat);
      if (labels.length === 0) return;

      appState.charts.rptAllocation = new Chart(canvas, {
        type: 'pie',
        data: { labels, datasets: [{ data, backgroundColor: chartColors.primary }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      });
    } catch (error) {
      console.error('[Chart Error] Failed to render allocation chart:', error);
    }
  },

  renderCashFlowChart: () => {
    try {
      const canvas = document.getElementById('rptCashFlowChart');
      if (!canvas) return;
      if (appState.charts.rptCashFlow) appState.charts.rptCashFlow.destroy();
      const income = appState.userProfile.monthlyIncome || 0;
      const expenses = appState.userProfile.monthlyExpenses || 0;
      const savings = Math.max(income - expenses, 0);

      appState.charts.rptCashFlow = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: ['Income', 'Expenses', 'Savings'],
          datasets: [{
            label: 'Monthly (₹)',
            data: [income, expenses, savings],
            backgroundColor: [chartColors.primary[0], chartColors.primary[3], chartColors.primary[6]]
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    } catch (error) {
      console.error('[Chart Error] Failed to render cash flow chart:', error);
    }
  },

  renderRiskRadar: () => {
    try {
      const canvas = document.getElementById('rptRiskRadar');
      if (!canvas) return;
      if (appState.charts.rptRisk) appState.charts.rptRisk.destroy();

      // Simple risk proxy scores (0-100)
      const portfolioRisk = (() => {
        const byCat = {};
        appState.assets.forEach(a => { byCat[a.category] = (byCat[a.category] || 0) + a.value; });
        const total = Object.values(byCat).reduce((a,b) => a+b, 0) || 1;
        const equity = (byCat['Stocks'] || 0) + (byCat['Mutual Funds'] || 0);
        const pct = (equity / total) * 100;
        return Math.min(Math.round(pct), 100);
      })();
      const incomeRisk = appState.familyMembers.filter(m => m.isEarner).length > 1 ? 30 : 70;
      const debtRisk = (() => {
        const income = appState.userProfile.monthlyIncome || 0;
        const emi = appState.liabilities.reduce((s,l)=>s+(l.emi||0),0);
        const ratio = income>0 ? (emi/income)*100 : 100; return Math.min(Math.round(ratio),100);
      })();
      const insuranceGap = (() => {
        const lifeCover = document.getElementById('fpLifeInsurance') ? parseFloat(document.getElementById('fpLifeInsurance').value) : 0;
        const annualIncome = document.getElementById('fpAnnualIncome') ? parseFloat(document.getElementById('fpAnnualIncome').value) : (appState.userProfile.monthlyIncome*12 || 0);
        const recommended = annualIncome * 10;
        const gap = Math.max(recommended - lifeCover, 0);
        const pct = recommended>0 ? (gap/recommended)*100 : 0;
        return Math.min(Math.round(pct),100);
      })();
      const emergencyPrep = (() => {
        const expenses = appState.userProfile.monthlyExpenses || 0;
        const liquid = appState.assets.filter(a=>['Cash','Fixed Deposits'].includes(a.category)).reduce((s,a)=>s+a.value,0);
        const months = expenses>0 ? liquid/expenses : 0; const pct = Math.max(0, Math.min((6-months)/6*100, 100));
        return Math.round(pct);
      })();

      appState.charts.rptRisk = new Chart(canvas, {
        type: 'radar',
        data: {
          labels: ['Portfolio', 'Income', 'Debt', 'Insurance Gap', 'Emergency'],
          datasets: [{
            label: 'Risk Level (lower is better)',
            data: [portfolioRisk, incomeRisk, debtRisk, insuranceGap, emergencyPrep],
            backgroundColor: chartColors.transparent,
            borderColor: chartColors.single
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { r: { suggestedMin: 0, suggestedMax: 100 } } }
      });
    } catch (error) {
      console.error('[Chart Error] Failed to render risk radar:', error);
    }
  },

  renderGoalsTable: () => {
    const container = document.getElementById('rptGoalsTable');
    if (!container) return;
    if (appState.goals.length === 0) {
      container.innerHTML = '<div class="empty-state-card"><p>No goals available.</p></div>';
      return;
    }
    const rows = appState.goals.map(g => {
      const years = g.targetYear - new Date().getFullYear();
      const fv = utils.calculateFutureValue(g.currentCost, g.inflation || 7, Math.max(years, 0));
      const pct = Math.min(((g.saved || 0) / fv) * 100, 100);
      const sip = years>0 ? utils.calculateRequiredSIP(Math.max(fv - (g.saved || 0), 0), g.return || 12, years) : 0;
      const status = pct >= 100 ? 'Ahead' : pct >= 60 ? 'On Track' : 'Behind';
      return `<tr>
        <td>${g.name}</td>
        <td>${g.targetYear}</td>
        <td>${utils.formatNumber(pct,1)}%</td>
        <td>${utils.formatCurrency(g.saved || 0)} / ${utils.formatCurrency(fv)}</td>
        <td>${status}</td>
        <td>${utils.formatCurrency(sip)} / mo</td>
      </tr>`;
    }).join('');
    container.innerHTML = `<table class="data-table"><thead><tr><th>Goal</th><th>Year</th><th>Progress</th><th>Saved / Needed</th><th>Status</th><th>SIP to Recover</th></tr></thead><tbody>${rows}</tbody></table>`;
  },

  renderActionItems: () => {
    const list = document.getElementById('rptActionItems');
    if (!list) return;
    const items = [];
    // High-interest debt
    appState.liabilities.filter(l => (l.rate || 0) >= 15).forEach(l => {
      items.push({ priority: 'High', category: 'Debt', action: `Pay off ${l.name} (${l.rate}% interest)`, impact: 'Reduce interest burden', timeframe: 'Next 6-12 months' });
    });
    // Emergency fund
    const expenses = appState.userProfile.monthlyExpenses || 0;
    const liquid = appState.assets.filter(a => ['Cash','Fixed Deposits'].includes(a.category)).reduce((s,a)=>s+a.value,0);
    const months = expenses>0 ? liquid/expenses : 0;
    if (months < 6) items.push({ priority: 'High', category: 'Emergency', action: 'Increase emergency fund to 6 months of expenses', impact: 'Improved resilience', timeframe: 'Next 6 months' });
    // Asset allocation gaps (simple rule of thumb)
    const age = appState.userProfile.currentAge || 35;
    const recEquity = Math.max(10, Math.min(80, 110 - age));
    const byCat = {}; appState.assets.forEach(a => { byCat[a.category] = (byCat[a.category] || 0) + a.value; });
    const total = Object.values(byCat).reduce((a,b)=>a+b,0) || 1;
    const equityNow = ((byCat['Stocks']||0)+(byCat['Mutual Funds']||0))/total*100;
    if (equityNow + 5 < recEquity) items.push({ priority: 'Medium', category: 'Investments', action: `Increase equity allocation to ~${recEquity}%`, impact: 'Potentially higher long-term returns', timeframe: '6-12 months' });
    // Insurance gap
    const annualIncome = (appState.userProfile.monthlyIncome||0)*12;
    const lifeInput = document.getElementById('fpLifeInsurance');
    const lifeCover = lifeInput ? parseFloat(lifeInput.value) : 0;
    if (lifeCover < annualIncome*10) items.push({ priority: 'High', category: 'Insurance', action: `Increase life cover by ${utils.formatCurrency(annualIncome*10 - lifeCover)}`, impact: 'Protect family income', timeframe: 'This month' });

    list.innerHTML = items.map(it => `
      <li class="action-item">
        <div class="action-priority priority-${it.priority.toLowerCase()}">[${it.priority}]</div>
        <div class="action-details">
          <strong>${it.category}:</strong> ${it.action}
          <div class="action-meta">
            <span class="action-impact">${it.impact}</span>
            <span class="action-timeframe">${it.timeframe}</span>
          </div>
        </div>
      </li>
    `).join('') || '<li>No immediate actions detected.</li>';
  },

  // Part B: Scenarios (minimal core)
  createScenarioPrompt: () => {
    const name = prompt('Scenario name (e.g., Early Retirement)');
    if (!name) return;
    // Basic modifications prompt (optional)
    const retAgeStr = prompt('Retirement age override (leave blank to keep current)');
    const snapshot = deepClone(appState);
    if (retAgeStr) snapshot.userProfile.retirementAge = parseInt(retAgeStr);
    const scenario = insights.createScenario(name, snapshot);
    if (scenario) insights.renderScenarios();
  },

  createScenario: (name, snapshot, options = {}) => {
    const base = deepClone(appState);
    const scen = {
      id: Date.now(),
      name,
      isBaseline: appState.reports.scenarios.length === 0,
      timestamp: new Date().toISOString(),
      snapshot,
      options,
      results: insights.calculateScenarioResults(snapshot, options)
    };
    appState.reports.scenarios.push(scen);
    return scen;
  },

  calculateScenarioResults: (snap, options = {}) => {
    // Retirement corpus approximation
    const years = (snap.userProfile.retirementAge || 60) - (snap.userProfile.currentAge || 35);
    const rate = Math.max(0, (12 + (options.returnAdj || 0))); // base 12% plus adjustment
    const totalAssetsNow = (snap.assets || []).reduce((s,a)=> s + (a.value||0), 0);
    const totalLiabsNow = (snap.liabilities || []).reduce((s,l)=> s + (l.amount||0), 0);
    const corpus = utils.calculateSIP(snap.userProfile.monthlySavings || 60000, rate, Math.max(years,0)) +
                   utils.calculateFutureValue(totalAssetsNow, 6, Math.max(years,0));
    // Goal success rate proxy
    let success = 100; if (snap.goals && snap.goals.length>0) {
      const met = snap.goals.filter(g=> (g.saved||0) >= utils.calculateFutureValue(g.currentCost, g.inflation||7, Math.max(g.targetYear - new Date().getFullYear(),0))).length;
      success = Math.round((met / snap.goals.length) * 100);
    }
    const finalNW = corpus - totalLiabsNow;
    return { retirementCorpus: corpus, goalSuccessRate: success, finalNetWorth: finalNW };
  },

  renderScenarios: () => {
    const table = document.getElementById('scenarioCompareTable');
    if (!table) return;
    const scenarios = appState.reports.scenarios;
    if (scenarios.length === 0) {
      table.querySelector('thead').innerHTML = '<tr><th>No scenarios yet</th></tr>';
      table.querySelector('tbody').innerHTML = '';
      return;
    }
    const headers = ['Metric', ...scenarios.map(s => s.name + (s.isBaseline ? ' (Baseline)' : ''))];
    const rows = [];
    const baseline = scenarios.find(s=>s.isBaseline) || scenarios[0];
    const metrics = [
      { key: 'retirementCorpus', label: 'Retirement Corpus', fmt: v => utils.formatCurrency(v) },
      { key: 'goalSuccessRate', label: 'Goal Success Rate', fmt: v => utils.formatNumber(v,0) + '%' },
      { key: 'finalNetWorth', label: 'Net Worth at Retirement', fmt: v => utils.formatCurrency(v) }
    ];
    metrics.forEach(m => {
      const row = [m.label];
      scenarios.forEach(s => {
        const val = s.results[m.key];
        const baseVal = baseline.results[m.key];
        const color = val > baseVal ? 'style="color: var(--color-success);"' : (val < baseVal ? 'style="color: var(--color-error);"' : '');
        row.push(`<span ${color}>${m.fmt(val)}</span>`);
      });
      rows.push(row);
    });
    table.querySelector('thead').innerHTML = `<tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr>`;
    table.querySelector('tbody').innerHTML = rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('');

    // Render charts
    insights.renderScenarioCharts(scenarios);
  },

  renderScenarioCharts: (scenarios) => {
    const netWorthCtx = document.getElementById('scenarioNetWorthChart');
    const goalsCtx = document.getElementById('scenarioGoalsChart');
    if (netWorthCtx) {
      if (appState.charts.scenarioNW) appState.charts.scenarioNW.destroy();
      appState.charts.scenarioNW = new Chart(netWorthCtx, {
        type: 'bar',
        data: {
          labels: scenarios.map(s => s.name),
          datasets: [{ label: 'Net Worth at Retirement', data: scenarios.map(s => s.results.finalNetWorth), backgroundColor: chartColors.primary }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }
    if (goalsCtx) {
      if (appState.charts.scenarioGoals) appState.charts.scenarioGoals.destroy();
      appState.charts.scenarioGoals = new Chart(goalsCtx, {
        type: 'bar',
        data: {
          labels: scenarios.map(s => s.name),
          datasets: [{ label: 'Goal Success Rate (%)', data: scenarios.map(s => s.results.goalSuccessRate), backgroundColor: chartColors.primary[2] }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } }, plugins: { legend: { display: false } } }
      });
    }
  },

  exportScenariosCSV: () => {
    const scenarios = appState.reports.scenarios || [];
    if (scenarios.length === 0) { alert('No scenarios to export.'); return; }
    const headers = ['Name','Baseline','Retirement Corpus','Goal Success %','Final Net Worth'];
    const rows = scenarios.map(s => [
      '"' + s.name.replace(/"/g,'\"') + '"',
      s.isBaseline ? 'Yes' : 'No',
      Math.round(s.results.retirementCorpus),
      s.results.goalSuccessRate,
      Math.round(s.results.finalNetWorth)
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scenarios-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Part C: Year-End Review (minimal)
  generateYearEndReview: (year) => {
    const review = {
      year,
      metrics: {
        netWorth: networth.calculateNetWorth(),
        totalIncome: (appState.userProfile.monthlyIncome||0)*12,
        totalExpenses: (appState.userProfile.monthlyExpenses||0)*12,
        totalSavings: Math.max(((appState.userProfile.monthlyIncome||0)-(appState.userProfile.monthlyExpenses||0))*12,0)
      },
      generatedDate: new Date().toISOString()
    };
    appState.reports.yearEndReviews[year] = review;
    // Store snapshot for YoY
    try { localStorage.setItem(`review_${year}`, JSON.stringify(review)); } catch {}
    insights.renderYearEnd(review);
    return review;
  },

  renderYearEnd: (review) => {
    // Populate year selector value
    const sel = document.getElementById('yearSelector');
    if (sel) sel.value = review.year;
    // Prepare YoY if previous year exists
    let prev = null; try { prev = JSON.parse(localStorage.getItem(`review_${review.year-1}`)); } catch {}
    const ctx = document.getElementById('yoyChart');
    if (ctx) {
      if (appState.charts.yoy) appState.charts.yoy.destroy();
      const labels = ['Net Worth','Income','Expenses','Savings'];
      const curr = [review.metrics.netWorth, review.metrics.totalIncome, review.metrics.totalExpenses, review.metrics.totalSavings];
      const prevData = prev ? [prev.metrics.netWorth, prev.metrics.totalIncome, prev.metrics.totalExpenses, prev.metrics.totalSavings] : [0,0,0,0];
      appState.charts.yoy = new Chart(ctx, { type:'bar', data:{ labels, datasets:[
        { label: review.year.toString(), data: curr, backgroundColor: chartColors.primary[0] },
        { label: (review.year-1).toString(), data: prevData, backgroundColor: chartColors.primary[3] }
      ]}, options:{ responsive:true, maintainAspectRatio:false } });
    }
    const ach = document.getElementById('achievementsList');
    if (ach) ach.innerHTML = `<ul><li>Year ${review.year} review generated. Add achievements and milestones in future iterations.</li></ul>`;
  }
};

// PDF export
const pdfExport = {
  generateFinancialHealthPDF: async () => {
    const el = document.getElementById('health-report');
    if (!el || typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
      alert('PDF libraries not loaded or element missing.');
      return;
    }
    const canvas = await html2canvas(el, { backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new window.jspdf.jsPDF('p','mm','a4');
    const pageWidth = 190; // A4 width minus margins
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 10, 10, pageWidth, pdfHeight);
    pdf.save(`Xtin-Gini-Financial-Health-${new Date().toISOString().split('T')[0]}.pdf`);
  },
  
  generateGeneralReportPDF: async () => {
    const el = document.getElementById('reportPreview');
    if (!el || !el.innerHTML || typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
      alert('Please generate a report first, or PDF libraries not loaded.');
      return;
    }
    const canvas = await html2canvas(el, { backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new window.jspdf.jsPDF('p','mm','a4');
    const pageWidth = 190;
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 10, 10, pageWidth, pdfHeight);
    pdf.save(`Xtin-Gini-General-Report-${new Date().toISOString().split('T')[0]}.pdf`);
  }
};

// Utility Functions
const utils = {
  formatCurrency: (amount) => {
    // Region-aware: symbol + locale grouping follow the visitor's region.
    // Amounts are the user's own numbers (their currency) — never FX-converted.
    if (window.XtinRegion) return XtinRegion.formatMoney(amount);
    return '₹' + Math.round(amount).toLocaleString('en-IN');
  },
  
  formatNumber: (num, decimals = 2) => {
    return Number(num).toFixed(decimals);
  },
  
  calculateFutureValue: (pv, rate, years) => {
    return pv * Math.pow(1 + rate / 100, years);
  },
  
  // Future value factor for SIP given timing
  sipFVFactor: (monthlyRate, months, timing = appState.settings.sipTiming) => {
    if (months <= 0) return 0;
    if (monthlyRate === 0) return months; // linear accumulation
    const base = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
    return timing === 'due' ? base * (1 + monthlyRate) : base; // due: deposit at start
  },

  calculateSIP: (monthlyAmount, rate, years, timing = appState.settings.sipTiming) => {
    const monthlyRate = rate / 12 / 100;
    const months = Math.max(0, Math.floor(years * 12));
    const factor = utils.sipFVFactor(monthlyRate, months, timing);
    return monthlyAmount * factor;
  },
  
  calculateEMI: (principal, rate, years) => {
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;
    if (monthlyRate === 0) return principal / months;
    return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  },
  
  calculateRequiredSIP: (futureValue, rate, years, timing = appState.settings.sipTiming) => {
    const monthlyRate = rate / 12 / 100;
    const months = Math.max(0, Math.floor(years * 12));
    const factor = utils.sipFVFactor(monthlyRate, months, timing);
    if (factor === 0) return 0;
    return futureValue / factor;
  },
  
  normalRandom: () => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
};

// Navigation
const navigation = {
  init: () => {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        navigation.switchTab(tab);
      });
    });
  },
  
  switchTab: (tabName) => {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.tab === tabName) {
        item.classList.add('active');
      }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Refresh data for specific tabs
    if (tabName === 'dashboard') dashboard.refresh();
    if (tabName === 'portfolio') portfolio.refresh();
    // Ensure charts render correctly when tabs become visible
    if (tabName === 'family-advanced') {
      advancedFamilyUI.reset();
      // Re-render education timeline chart so it sizes correctly after becoming visible
      educationTimeline.render();
      educationTimeline.renderChart();
    }
    if (tabName === 'reports') {
      insights.init();
    }
  }
};

// Global switchTab function for onclick handlers
function switchTab(tabName) {
  navigation.switchTab(tabName);
}

// Toggle Quick Actions Panel
function toggleQuickActions() {
  const panel = document.getElementById('quickActionsPanel');
  if (panel) {
    panel.classList.toggle('active');
  }
}

// Dashboard Module
const dashboard = {
  refresh: () => {
    const netWorth = networth.calculateNetWorth();
    const goalsCount = appState.goals.length;
    const healthScore = dashboard.calculateHealthScore();
    const totalLiabilities = networth.calculateTotalLiabilities();
    const totalAssets = networth.calculateTotalAssets();
    
    // Update all dashboard elements (including hero section)
    const dashNetWorth = document.getElementById('dashNetWorth');
    const dashGoalsCount = document.getElementById('dashGoalsCount');
    const dashHealthScore = document.getElementById('dashHealthScore');
    const dashLiabilities = document.getElementById('dashLiabilities');
    const dashTotalAssets = document.getElementById('dashTotalAssets');
    const dashGoalCount2 = document.getElementById('dashGoalCount2');
    
    if (dashNetWorth) dashNetWorth.textContent = utils.formatCurrency(netWorth);
    if (dashGoalsCount) dashGoalsCount.textContent = goalsCount;
    if (dashHealthScore) dashHealthScore.textContent = Math.round(healthScore) + '%';
    if (dashLiabilities) dashLiabilities.textContent = utils.formatCurrency(totalLiabilities);
    if (dashTotalAssets) dashTotalAssets.textContent = utils.formatCurrency(totalAssets);
    if (dashGoalCount2) dashGoalCount2.textContent = goalsCount;
    
    dashboard.renderAssetChart();
    dashboard.renderGoalsChart();
    dashboard.renderMiniChart();
    dashboard.updateOnboarding();
  },

  updateOnboarding: () => {
    const card = document.getElementById('dashboardOnboarding');
    if (!card) return;

    const hidden = localStorage.getItem('gini_onboarding_hidden') === 'true';
    const hasEnoughData = appState.familyMembers.length > 1 && appState.assets.length > 0 && appState.goals.length > 0;
    card.classList.toggle('hidden', hidden || hasEnoughData);

    const completion = {
      family: appState.familyMembers.length > 1,
      assets: appState.assets.length > 0,
      liabilities: appState.liabilities.length > 0,
      goals: appState.goals.length > 0,
      gini: (window.GiniAIEngine?.profile?.behavior?.interactionCount || 0) > 0
    };

    card.querySelectorAll('[data-onboarding-key]').forEach((step) => {
      step.classList.toggle('is-done', Boolean(completion[step.dataset.onboardingKey]));
    });
  },
  
  renderMiniChart: () => {
    const canvas = document.getElementById('dashMiniChart');
    if (!canvas) return;
    
    if (appState.charts.dashMini) {
      appState.charts.dashMini.destroy();
    }
    
    // Generate sample growth data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const growthData = [85, 90, 88, 95, 92, 100];
    
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 120);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
    
    appState.charts.dashMini = new Chart(canvas, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          data: growthData,
          borderColor: '#10b981',
          borderWidth: 2,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#10b981'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { 
            enabled: true,
            backgroundColor: 'rgba(17, 25, 22, 0.9)',
            borderColor: 'rgba(16, 185, 129, 0.3)',
            borderWidth: 1
          }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        },
        elements: {
          line: { borderJoinStyle: 'round' }
        }
      }
    });
  },
  
  calculateHealthScore: () => {
    // Earned from real actions — an empty household scores 0, never a
    // fake baseline. Mirrors the landing report's scoring philosophy.
    const members = appState.familyMembers || [];
    if (members.length === 0) return 0;

    let score = 10; // household profile created

    const income = members.filter(m => m.isEarner).reduce((s, m) => s + (m.income || 0), 0);
    if (income > 0) {
      score += 15;
      const totalEMI = appState.liabilities.reduce((s, l) => s + (l.emi || 0), 0);
      if ((totalEMI / income) * 100 < 40) score += 10;
    }

    if (appState.goals.length > 0) score += 10;

    const netWorth = networth.calculateNetWorth();
    const assets = networth.calculateTotalAssets();
    const liabilities = networth.calculateTotalLiabilities();
    if (assets > 0) {
      score += 15;
      if (netWorth > 0) score += 15;
      if (liabilities / assets < 0.5) score += 15;
      if (netWorth > 5000000) score += 10;
    }

    return Math.min(score, 100);
  },
  
  renderAssetChart: () => {
    const canvas = document.getElementById('dashAssetChart');
    if (!canvas) return;
    
    if (appState.charts.dashAsset) {
      appState.charts.dashAsset.destroy();
    }
    
    const assetsByCategory = {};
    appState.assets.forEach(asset => {
      if (!assetsByCategory[asset.category]) {
        assetsByCategory[asset.category] = 0;
      }
      assetsByCategory[asset.category] += asset.value;
    });
    
    if (Object.keys(assetsByCategory).length === 0) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    
    const labels = Object.keys(assetsByCategory);
    const data = Object.values(assetsByCategory);
    
    appState.charts.dashAsset = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: chartColors.primary
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  },
  
  renderGoalsChart: () => {
    const canvas = document.getElementById('dashGoalsChart');
    if (!canvas) return;
    
    if (appState.charts.dashGoals) {
      appState.charts.dashGoals.destroy();
    }
    
    if (appState.goals.length === 0) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    
    const labels = appState.goals.map(g => g.name);
    const progress = appState.goals.map(g => {
      const yearsRemaining = g.targetYear - new Date().getFullYear();
      const futureValue = utils.calculateFutureValue(g.currentCost, g.inflation, yearsRemaining);
      return Math.min((g.saved / futureValue) * 100, 100);
    });
    
    appState.charts.dashGoals = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Progress %',
          data: progress,
          backgroundColor: chartColors.single
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
};

const advancedFamilyUI = {
  reset: () => {
    document.querySelectorAll('#family-advanced-tab .fp-adv-section').forEach((section) => {
      section.classList.remove('active');
    });
  },

  open: (sectionId) => {
    document.querySelectorAll('#family-advanced-tab .fp-adv-section').forEach((section) => {
      section.classList.toggle('active', section.id === sectionId);
    });

    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

// Family Settings Module
const familySettings = {
  currentEditId: null, // Track which member is being edited

  init: () => {
    document.getElementById('addFamilyMemberBtn')?.addEventListener('click', () => familySettings.showAddMemberForm());
    document.getElementById('saveFamilyMemberBtn')?.addEventListener('click', () => familySettings.saveMember());
    document.getElementById('cancelFamilyMemberBtn')?.addEventListener('click', () => familySettings.hideAddMemberForm());
    document.getElementById('incomeModeSelect')?.addEventListener('change', (e) => familySettings.updateIncomeMode(e.target.value));
    document.getElementById('viewModeSelect')?.addEventListener('change', (e) => familySettings.updateViewMode(e.target.value));
    
    familySettings.renderFamilyMembers();
    familySettings.renderHouseholdSummary();
  },

  showAddMemberForm: (presetRelationship) => {
    familySettings.currentEditId = null; // Reset edit mode
    // Default to Self when the household is empty, so the first member
    // added is always the primary user.
    const hasSelf = appState.familyMembers.some(m => m.relationship === 'Self');
    const relationship = presetRelationship || (hasSelf ? 'Spouse' : 'Self');
    const isEarner = relationship === 'Self' || relationship === 'Spouse' || relationship === 'Sibling';
    document.getElementById('familyMemberFormContainer').style.display = 'block';
    document.getElementById('memberName').value = '';
    document.getElementById('memberRelationship').value = relationship;
    document.getElementById('memberAge').value = relationship === 'Child' ? '8' : '30';
    document.getElementById('memberIncome').value = '0';
    document.getElementById('memberIsEarner').checked = isEarner;
    document.getElementById('memberIsDependent').checked = !isEarner;
    document.getElementById('memberRetirementAge').value = '60';
    document.getElementById('saveFamilyMemberBtn').textContent = 'Save Member';
    document.getElementById('familyMemberFormContainer').scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => document.getElementById('memberName').focus(), 300);
  },

  hideAddMemberForm: () => {
    familySettings.currentEditId = null; // Reset edit mode
    document.getElementById('familyMemberFormContainer').style.display = 'none';
    document.getElementById('saveFamilyMemberBtn').textContent = 'Save Member';
  },

  saveMember: () => {
    const name = document.getElementById('memberName').value.trim();
    const relationship = document.getElementById('memberRelationship').value;
    const age = parseInt(document.getElementById('memberAge').value);
    const income = parseFloat(document.getElementById('memberIncome').value);
    const isEarner = document.getElementById('memberIsEarner').checked;
    const isDependent = document.getElementById('memberIsDependent').checked;
    const retirementAge = parseInt(document.getElementById('memberRetirementAge').value);

    if (!name) {
      showAuthNotification('Please enter the member\'s name.', 'error');
      document.getElementById('memberName').focus();
      return;
    }
    if (isNaN(age) || age < 0 || age > 120) {
      showAuthNotification('Please enter a valid age (0–120).', 'error');
      document.getElementById('memberAge').focus();
      return;
    }
    // Only one primary user allowed
    if (relationship === 'Self' &&
        appState.familyMembers.some(m => m.relationship === 'Self' && m.id !== familySettings.currentEditId)) {
      showAuthNotification('There is already a primary user ("Self"). Choose a different relationship.', 'error');
      return;
    }
    // Free plan cap on new members
    if (familySettings.currentEditId === null &&
        window.GiniPlan && !window.GiniPlan.canAddFamilyMember(appState.familyMembers.length)) {
      window.GiniPlan.showUpgradeModal('family');
      return;
    }

    // Check if we're editing an existing member
    if (familySettings.currentEditId !== null) {
      const member = appState.familyMembers.find(m => m.id === familySettings.currentEditId);
      if (member) {
        member.name = name;
        member.relationship = relationship;
        member.age = age;
        member.income = income || 0;
        member.isEarner = isEarner;
        member.isDependent = isDependent;
        member.retirementAge = retirementAge || 60;
      }
    } else {
      // Create new member
      const member = {
        id: Date.now(),
        name,
        relationship,
        age,
        income: income || 0,
        isEarner,
        isDependent,
        retirementAge: retirementAge || 60,
        lifeExpectancy: 85
      };
      appState.familyMembers.push(member);
    }

    const wasEditing = familySettings.currentEditId !== null;
    familySettings.hideAddMemberForm();
    familySettings.renderFamilyMembers();
    familySettings.renderHouseholdSummary();
    // Persist locally AND sync to cloud so logged-in users don't get
    // overwritten by a stale cloud copy on the next load.
    saveAppStateToStorage();
    showAuthNotification(
      wasEditing ? `${name}'s details updated.` : `${name} added to your household.`,
      'success'
    );
  },

  editMember: (id) => {
    const member = appState.familyMembers.find(m => m.id === id);
    if (!member) return;

    familySettings.currentEditId = id; // Set edit mode

    // Show edit form with member data
    document.getElementById('familyMemberFormContainer').style.display = 'block';
    document.getElementById('memberName').value = member.name;
    document.getElementById('memberRelationship').value = member.relationship;
    document.getElementById('memberAge').value = member.age;
    document.getElementById('memberIncome').value = member.income;
    document.getElementById('memberIsEarner').checked = member.isEarner;
    document.getElementById('memberIsDependent').checked = member.isDependent;
    document.getElementById('memberRetirementAge').value = member.retirementAge;

    // Change save button text
    document.getElementById('saveFamilyMemberBtn').textContent = 'Update Member';
  },

  deleteMember: (id) => {
    const member = appState.familyMembers.find(m => m.id === id);
    giniConfirm({
      title: `Remove ${member?.name || 'this member'}?`,
      message: 'Their income and goal assignments will be removed from all projections. This cannot be undone.',
      confirmText: 'Remove Member',
      danger: true
    }, () => {
      appState.familyMembers = appState.familyMembers.filter(m => m.id !== id);
      familySettings.renderFamilyMembers();
      familySettings.renderHouseholdSummary();
      saveAppStateToStorage();
      showAuthNotification(`${member?.name || 'Member'} removed from your household.`, 'success');
    });
  },

  renderFamilyMembers: () => {
    const container = document.getElementById('familyMembersContainer');
    if (!container) return;

    if (appState.familyMembers.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card empty-state-card--action">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="42" height="42">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="22" y1="11" x2="16" y2="11"></line>
            </svg>
          </div>
          <p class="empty-state-title">Let's start with you</p>
          <p class="empty-state-sub">Add yourself first — your age and income power every projection in Gini.</p>
          <button class="btn btn--primary" onclick="familySettings.showAddMemberForm('Self')">Add Yourself</button>
        </div>`;
      return;
    }

    container.innerHTML = appState.familyMembers.map(member => {
      const earnerBadge = member.isEarner ? '<span class="family-role-badge family-role-badge--earner">Earner</span>' : '';
      const dependentBadge = member.isDependent ? '<span class="family-role-badge family-role-badge--dependent">Dependent</span>' : '';

      return `
        <div class="family-member-card">
          <div class="family-member-card__header">
            <div>
              <h4 class="family-member-card__name">
                ${member.name} ${earnerBadge} ${dependentBadge}
              </h4>
              <p class="family-member-card__relationship">${member.relationship}</p>
            </div>
            <div class="family-member-card__actions">
              <button class="btn btn--sm btn--outline" onclick="familySettings.editMember(${member.id})">Edit</button>
              ${member.relationship !== 'Self' ? `<button class="btn btn--sm btn--outline family-member-card__remove" onclick="familySettings.deleteMember(${member.id})">Remove</button>` : ''}
            </div>
          </div>
          <div class="family-member-card__metrics">
            <div class="family-member-card__metric">
              <span>Age</span>
              <strong> ${member.age} years</strong>
            </div>
            ${member.isEarner ? `
              <div class="family-member-card__metric">
                <span>Monthly Income</span>
                <strong> ${utils.formatCurrency(member.income)}</strong>
              </div>
              <div class="family-member-card__metric">
                <span>Retirement Age</span>
                <strong> ${member.retirementAge}</strong>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  calculateHouseholdIncome: () => {
    return appState.familyMembers
      .filter(m => m.isEarner)
      .reduce((total, member) => total + member.income, 0);
  },

  renderHouseholdSummary: () => {
    const totalIncome = familySettings.calculateHouseholdIncome();
    const earners = appState.familyMembers.filter(m => m.isEarner);
    const dependents = appState.familyMembers.filter(m => m.isDependent);
    const members = appState.familyMembers.length;

    document.getElementById('fsHouseholdIncome').textContent = utils.formatCurrency(totalIncome);
    document.getElementById('fsTotalMembers').textContent = members;
    document.getElementById('fsEarners').textContent = earners.length;
    document.getElementById('fsDependents').textContent = dependents.length;

    // Render income breakdown chart
    familySettings.renderIncomeBreakdownChart(earners);
  },

  renderIncomeBreakdownChart: (earners) => {
    const canvas = document.getElementById('householdIncomeChart');
    if (!canvas) return;

    if (appState.charts.householdIncome) {
      appState.charts.householdIncome.destroy();
    }

    if (earners.length === 0) return;

    appState.charts.householdIncome = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: earners.map(e => e.name),
        datasets: [{
          data: earners.map(e => e.income),
          backgroundColor: chartColors.primary
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${utils.formatCurrency(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  },

  updateIncomeMode: (mode) => {
    appState.settings.incomeMode = mode;
    showAuthNotification(`Income mode set to: ${mode}`, 'success');
  },

  updateViewMode: (mode) => {
    appState.familyViewMode = mode;
    showAuthNotification(`View mode set to: ${mode}`, 'success');
    // Refresh relevant views
    dashboard.refresh();
  }
};

// Net Worth Module
const networth = {
  init: () => {
    document.getElementById('addAssetBtn').addEventListener('click', () => networth.showAssetForm());
    document.getElementById('cancelAssetBtn').addEventListener('click', () => networth.hideAssetForm());
    document.getElementById('saveAssetBtn').addEventListener('click', () => networth.saveAsset());
    
    document.getElementById('addLiabilityBtn').addEventListener('click', () => networth.showLiabilityForm());
    document.getElementById('cancelLiabilityBtn').addEventListener('click', () => networth.hideLiabilityForm());
    document.getElementById('saveLiabilityBtn').addEventListener('click', () => networth.saveLiability());
    
    networth.renderAssets();
    networth.renderLiabilities();
  },
  
  showAssetForm: () => {
    document.getElementById('assetFormContainer').style.display = 'block';
    appState.editingAsset = null;
    document.getElementById('assetName').value = '';
    document.getElementById('assetCategory').value = 'Real Estate';
    document.getElementById('assetValue').value = '';
    document.getElementById('assetReturn').value = '';
    
    // Populate owner dropdown
    const ownerSelect = document.getElementById('assetOwner');
    if (ownerSelect) {
      ownerSelect.innerHTML = appState.familyMembers.map(member =>
        `<option value="${member.id}">${member.name} (${member.relationship})</option>`
      ).join('');
      ownerSelect.value = '1'; // Default to Self
    }
    
    if (document.getElementById('assetOwnershipType')) {
      document.getElementById('assetOwnershipType').value = 'Individual';
    }
    if (document.getElementById('assetJointShare')) {
      document.getElementById('assetJointShare').value = '100';
    }
  },
  
  hideAssetForm: () => {
    document.getElementById('assetFormContainer').style.display = 'none';
    appState.editingAsset = null;
  },
  
  saveAsset: () => {
    const name = document.getElementById('assetName').value?.trim();
    const category = document.getElementById('assetCategory').value;
    const value = parseFloat(document.getElementById('assetValue').value);
    const returnRate = parseFloat(document.getElementById('assetReturn').value);
    
    // Ownership fields
    const ownershipType = document.getElementById('assetOwnershipType')?.value || 'Individual';
    const ownerMemberId = document.getElementById('assetOwner')?.value ? parseInt(document.getElementById('assetOwner').value) : 1;
    const jointOwnerShare = document.getElementById('assetJointShare')?.value ? parseFloat(document.getElementById('assetJointShare').value) : 100;
    
    // VALIDATION
    if (!name || name.length === 0) {
      alert('Asset name is required');
      return;
    }
    
    if (isNaN(value) || value <= 0) {
      alert('Asset value must be a positive number');
      return;
    }
    
    if (isNaN(returnRate) || returnRate < 0 || returnRate > 100) {
      alert('Expected return must be between 0 and 100 percent');
      return;
    }
    
    if (isNaN(jointOwnerShare) || jointOwnerShare <= 0 || jointOwnerShare > 100) {
      alert('Joint owner share must be between 1 and 100 percent');
      return;
    }
    
    const asset = {
      id: appState.editingAsset ? appState.editingAsset.id : Date.now(),
      name,
      category,
      value,
      return: returnRate,
      ownershipType: ownershipType, // 'Individual', 'Joint', 'Trust'
      owner: ownerMemberId,
      jointShare: jointOwnerShare // Percentage for joint ownership
    };
    
    if (appState.editingAsset) {
      const index = appState.assets.findIndex(a => a.id === appState.editingAsset.id);
      appState.assets[index] = asset;
    } else {
      appState.assets.push(asset);
    }
    
    networth.hideAssetForm();
    networth.renderAssets();
    networth.updateSummary();
  },
  
  editAsset: (id) => {
    const asset = appState.assets.find(a => a.id === id);
    if (!asset) return;
    
    appState.editingAsset = asset;
    document.getElementById('assetFormContainer').style.display = 'block';
    document.getElementById('assetName').value = asset.name;
    document.getElementById('assetCategory').value = asset.category;
    document.getElementById('assetValue').value = asset.value;
    document.getElementById('assetReturn').value = asset.return;
    
    // Load ownership data
    if (document.getElementById('assetOwnershipType') && asset.ownershipType) {
      document.getElementById('assetOwnershipType').value = asset.ownershipType;
    }
    if (document.getElementById('assetOwner') && asset.owner) {
      document.getElementById('assetOwner').value = asset.owner;
    }
    if (document.getElementById('assetJointShare') && asset.jointShare) {
      document.getElementById('assetJointShare').value = asset.jointShare;
    }
  },
  
  deleteAsset: (id) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    appState.assets = appState.assets.filter(a => a.id !== id);
    networth.renderAssets();
    networth.updateSummary();
  },
  
  renderAssets: () => {
    const tbody = document.getElementById('assetsTableBody');
    if (appState.assets.length === 0) {
      tbody.innerHTML = '<tr class="empty-state"><td colspan="6">No assets added yet. Click "Add Asset" to get started.</td></tr>';
    } else {
      tbody.innerHTML = appState.assets.map(asset => {
        const owner = appState.familyMembers.find(m => m.id === asset.owner);
        const ownerName = owner ? owner.name : 'Unknown';
        const ownershipDisplay = asset.ownershipType === 'Joint' ? 
          `<span class="ownership-badge ownership-badge--asset">${asset.ownershipType} (${asset.jointShare}%)</span>` : 
          `<span class="ownership-badge">${asset.ownershipType}</span>`;
        
        return `
        <tr>
          <td><strong class="table-primary-text">${asset.name}</strong></td>
          <td>${asset.category}</td>
          <td>${utils.formatCurrency(asset.value)}</td>
          <td>${asset.return}%</td>
          <td>${ownershipDisplay}<br/><small class="table-secondary-text">${ownerName}</small></td>
          <td>
            <button class="action-btn" onclick="networth.editAsset(${asset.id})">Edit</button>
            <button class="action-btn delete" onclick="networth.deleteAsset(${asset.id})">Delete</button>
          </td>
        </tr>
      `}).join('');
    }
    
    const total = networth.calculateTotalAssets();
    document.getElementById('totalAssets').textContent = utils.formatCurrency(total);
  },
  
  calculateTotalAssets: () => {
    return appState.assets.reduce((sum, asset) => sum + asset.value, 0);
  },
  
  showLiabilityForm: () => {
    document.getElementById('liabilityFormContainer').style.display = 'block';
    appState.editingLiability = null;
    document.getElementById('liabilityName').value = '';
    document.getElementById('liabilityType').value = 'Home Loan';
    document.getElementById('liabilityAmount').value = '';
    document.getElementById('liabilityRate').value = '';
    document.getElementById('liabilityEMI').value = '';
    document.getElementById('liabilityTenure').value = '';
    
    // Populate owner dropdown
    const ownerSelect = document.getElementById('liabilityOwner');
    if (ownerSelect) {
      ownerSelect.innerHTML = appState.familyMembers.map(member =>
        `<option value="${member.id}">${member.name} (${member.relationship})</option>`
      ).join('');
      ownerSelect.value = '1'; // Default to Self
    }
    
    if (document.getElementById('liabilityOwnershipType')) {
      document.getElementById('liabilityOwnershipType').value = 'Individual';
    }
    if (document.getElementById('liabilityJointShare')) {
      document.getElementById('liabilityJointShare').value = '100';
    }
  },
  
  hideLiabilityForm: () => {
    document.getElementById('liabilityFormContainer').style.display = 'none';
    appState.editingLiability = null;
  },
  
  saveLiability: () => {
    const name = document.getElementById('liabilityName').value?.trim();
    const type = document.getElementById('liabilityType').value;
    const amount = parseFloat(document.getElementById('liabilityAmount').value);
    const rate = parseFloat(document.getElementById('liabilityRate').value);
    const emi = parseFloat(document.getElementById('liabilityEMI').value);
    const tenure = parseFloat(document.getElementById('liabilityTenure').value);
    
    // Ownership fields
    const ownershipType = document.getElementById('liabilityOwnershipType')?.value || 'Individual';
    const ownerMemberId = document.getElementById('liabilityOwner')?.value ? parseInt(document.getElementById('liabilityOwner').value) : 1;
    const jointOwnerShare = document.getElementById('liabilityJointShare')?.value ? parseFloat(document.getElementById('liabilityJointShare').value) : 100;
    
    // VALIDATION
    if (!name || name.length === 0) {
      alert('Liability name is required');
      return;
    }
    
    if (isNaN(amount) || amount <= 0) {
      alert('Liability amount must be a positive number');
      return;
    }
    
    if (isNaN(rate) || rate < 0 || rate > 50) {
      alert('Interest rate must be between 0 and 50 percent');
      return;
    }
    
    if (!isNaN(emi) && emi < 0) {
      alert('EMI cannot be negative');
      return;
    }
    
    if (!isNaN(tenure) && tenure <= 0) {
      alert('Tenure must be a positive number');
      return;
    }
    
    if (isNaN(jointOwnerShare) || jointOwnerShare <= 0 || jointOwnerShare > 100) {
      alert('Joint owner share must be between 1 and 100 percent');
      return;
    }
    
    const liability = {
      id: appState.editingLiability ? appState.editingLiability.id : Date.now(),
      name,
      type,
      amount,
      rate,
      emi,
      tenure,
      ownershipType: ownershipType,
      owner: ownerMemberId,
      jointShare: jointOwnerShare
    };
    
    if (appState.editingLiability) {
      const index = appState.liabilities.findIndex(l => l.id === appState.editingLiability.id);
      appState.liabilities[index] = liability;
    } else {
      appState.liabilities.push(liability);
    }
    
    networth.hideLiabilityForm();
    networth.renderLiabilities();
    networth.updateSummary();
  },
  
  editLiability: (id) => {
    const liability = appState.liabilities.find(l => l.id === id);
    if (!liability) return;
    
    appState.editingLiability = liability;
    document.getElementById('liabilityFormContainer').style.display = 'block';
    document.getElementById('liabilityName').value = liability.name;
    document.getElementById('liabilityType').value = liability.type;
    document.getElementById('liabilityAmount').value = liability.amount;
    document.getElementById('liabilityRate').value = liability.rate;
    document.getElementById('liabilityEMI').value = liability.emi;
    document.getElementById('liabilityTenure').value = liability.tenure;
    
    // Load ownership data
    if (document.getElementById('liabilityOwnershipType') && liability.ownershipType) {
      document.getElementById('liabilityOwnershipType').value = liability.ownershipType;
    }
    if (document.getElementById('liabilityOwner') && liability.owner) {
      document.getElementById('liabilityOwner').value = liability.owner;
    }
    if (document.getElementById('liabilityJointShare') && liability.jointShare) {
      document.getElementById('liabilityJointShare').value = liability.jointShare;
    }
  },
  
  deleteLiability: (id) => {
    if (!confirm('Are you sure you want to delete this liability?')) return;
    appState.liabilities = appState.liabilities.filter(l => l.id !== id);
    networth.renderLiabilities();
    networth.updateSummary();
  },
  
  renderLiabilities: () => {
    const tbody = document.getElementById('liabilitiesTableBody');
    if (appState.liabilities.length === 0) {
      tbody.innerHTML = '<tr class="empty-state"><td colspan="7">No liabilities added yet.</td></tr>';
    } else {
      tbody.innerHTML = appState.liabilities.map(liability => {
        const owner = appState.familyMembers.find(m => m.id === liability.owner);
        const ownerName = owner ? owner.name : 'Unknown';
        const ownershipDisplay = liability.ownershipType === 'Joint' ? 
          `<span class="ownership-badge ownership-badge--liability">${liability.ownershipType} (${liability.jointShare}%)</span>` : 
          `<span class="ownership-badge">${liability.ownershipType}</span>`;
        
        return `
        <tr>
          <td><strong class="table-primary-text">${liability.name}</strong></td>
          <td>${liability.type}</td>
          <td>${utils.formatCurrency(liability.amount)}</td>
          <td>${liability.rate}%</td>
          <td>${utils.formatCurrency(liability.emi)}</td>
          <td>${ownershipDisplay}<br/><small class="table-secondary-text">${ownerName}</small></td>
          <td>
            <button class="action-btn" onclick="networth.editLiability(${liability.id})">Edit</button>
            <button class="action-btn delete" onclick="networth.deleteLiability(${liability.id})">Delete</button>
          </td>
        </tr>
      `}).join('');
    }
    
    const total = networth.calculateTotalLiabilities();
    document.getElementById('totalLiabilities').textContent = utils.formatCurrency(total);
  },
  
  calculateTotalLiabilities: () => {
    return appState.liabilities.reduce((sum, liability) => sum + liability.amount, 0);
  },
  
  calculateNetWorth: () => {
    return networth.calculateTotalAssets() - networth.calculateTotalLiabilities();
  },
  
  updateSummary: () => {
    const assets = networth.calculateTotalAssets();
    const liabilities = networth.calculateTotalLiabilities();
    const netWorthValue = networth.calculateNetWorth();
    
    document.getElementById('summaryAssets').textContent = utils.formatCurrency(assets);
    document.getElementById('summaryLiabilities').textContent = utils.formatCurrency(liabilities);
    document.getElementById('summaryNetWorth').textContent = utils.formatCurrency(netWorthValue);
    
    networth.renderCharts();
  },
  
  renderCharts: () => {
    // Asset Allocation Chart
    const allocationCanvas = document.getElementById('assetAllocationChart');
    if (appState.charts.assetAllocation) {
      appState.charts.assetAllocation.destroy();
    }
    
    const assetsByCategory = {};
    appState.assets.forEach(asset => {
      if (!assetsByCategory[asset.category]) {
        assetsByCategory[asset.category] = 0;
      }
      assetsByCategory[asset.category] += asset.value;
    });
    
    if (Object.keys(assetsByCategory).length > 0) {
      appState.charts.assetAllocation = new Chart(allocationCanvas, {
        type: 'pie',
        data: {
          labels: Object.keys(assetsByCategory),
          datasets: [{
            data: Object.values(assetsByCategory),
              backgroundColor: chartColors.primary
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
    
    // Assets vs Liabilities Chart
    const comparisonCanvas = document.getElementById('assetVsLiabilityChart');
    if (appState.charts.assetVsLiability) {
      appState.charts.assetVsLiability.destroy();
    }
    
    const assets = networth.calculateTotalAssets();
    const liabilities = networth.calculateTotalLiabilities();
    
    appState.charts.assetVsLiability = new Chart(comparisonCanvas, {
      type: 'bar',
      data: {
        labels: ['Assets', 'Liabilities', 'Net Worth'],
        datasets: [{
          label: 'Amount (₹)',
          data: [assets, liabilities, assets - liabilities],
            backgroundColor: [chartColors.primary[0], chartColors.primary[2], chartColors.primary[6]]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
};

// Goals Module
const goals = {
  init: () => {
    document.getElementById('addGoalBtn').addEventListener('click', () => goals.showGoalForm());
    document.getElementById('cancelGoalBtn').addEventListener('click', () => goals.hideGoalForm());
    document.getElementById('saveGoalBtn').addEventListener('click', () => goals.saveGoal());
    
    goals.renderGoals();
  },
  
  showGoalForm: () => {
    document.getElementById('goalFormContainer').style.display = 'block';
    appState.editingGoal = null;
    document.getElementById('goalName').value = '';
    document.getElementById('goalCategory').value = 'Education';
    document.getElementById('goalCurrentCost').value = '';
    document.getElementById('goalTargetYear').value = new Date().getFullYear() + 10;
    document.getElementById('goalPriority').value = 'High';
    document.getElementById('goalInflation').value = '7';
    document.getElementById('goalSaved').value = '0';
    document.getElementById('goalReturn').value = '12';
    
    // Populate family member dropdowns
    const assignedToSelect = document.getElementById('goalAssignedTo');
    const fundedBySelect = document.getElementById('goalFundedBy');
    
    if (assignedToSelect && fundedBySelect) {
      const memberOptions = appState.familyMembers.map(member =>
        `<option value="${member.id}">${member.name} (${member.relationship})</option>`
      ).join('');
      const earnerOptions = appState.familyMembers
        .filter(member => member.isEarner)
        .map(member => `<option value="${member.id}">${member.name} (${member.relationship})</option>`)
        .join('');

      assignedToSelect.innerHTML = '<option value="">Household</option>' + memberOptions;
      fundedBySelect.innerHTML = '<option value="">Household</option>' + earnerOptions;

      assignedToSelect.value = '1'; // Self by default
      fundedBySelect.value = '1'; // Self by default
    }
    
    if (document.getElementById('goalFundingSplit')) {
      document.getElementById('goalFundingSplit').value = '100';
    }
  },
  
  hideGoalForm: () => {
    document.getElementById('goalFormContainer').style.display = 'none';
    appState.editingGoal = null;
  },
  
  saveGoal: () => {
    const name = document.getElementById('goalName').value?.trim();
    const category = document.getElementById('goalCategory').value;
    const currentCost = parseFloat(document.getElementById('goalCurrentCost').value);
    const targetYear = parseInt(document.getElementById('goalTargetYear').value);
    const priority = document.getElementById('goalPriority').value;
    const inflation = parseFloat(document.getElementById('goalInflation').value);
    const saved = parseFloat(document.getElementById('goalSaved').value);
    const returnRate = parseFloat(document.getElementById('goalReturn').value);
    
    // Family assignment data
    const assignedToEl = document.getElementById('goalAssignedTo');
    const fundedByEl = document.getElementById('goalFundedBy');
    const fundingSplitEl = document.getElementById('goalFundingSplit');
    
    const assignedTo = assignedToEl ? parseInt(assignedToEl.value) || null : null;
    const fundedBy = fundedByEl ? parseInt(fundedByEl.value) || null : null;
    const fundingSplit = fundingSplitEl ? parseFloat(fundingSplitEl.value) || 100 : 100;
    
    // VALIDATION: Check required fields
    if (!name || name.length === 0) {
      showAuthNotification('Goal name is required.', 'error');
      return;
    }

    if (isNaN(currentCost) || currentCost <= 0) {
      showAuthNotification('Current cost must be a positive number.', 'error');
      return;
    }

    const currentYear = new Date().getFullYear();
    if (isNaN(targetYear) || targetYear <= currentYear) {
      showAuthNotification(`Target year must be after ${currentYear}.`, 'error');
      return;
    }

    if (isNaN(saved) || saved < 0) {
      showAuthNotification('Amount saved cannot be negative.', 'error');
      return;
    }

    if (isNaN(inflation) || inflation < 0 || inflation > 100) {
      showAuthNotification('Inflation must be between 0 and 100 percent.', 'error');
      return;
    }

    if (isNaN(returnRate) || returnRate < 0 || returnRate > 100) {
      showAuthNotification('Expected return must be between 0 and 100 percent.', 'error');
      return;
    }

    if (isNaN(fundingSplit) || fundingSplit <= 0 || fundingSplit > 100) {
      showAuthNotification('Funding split must be between 1 and 100 percent.', 'error');
      return;
    }

    if (saved > currentCost) {
      showAuthNotification('Amount saved cannot exceed current cost.', 'error');
      return;
    }

    // Free plan cap on new goals
    if (!appState.editingGoal &&
        window.GiniPlan && !window.GiniPlan.canAddGoal(appState.goals.length)) {
      window.GiniPlan.showUpgradeModal('goals');
      return;
    }

    const goal = {
      id: appState.editingGoal ? appState.editingGoal.id : Date.now(),
      name,
      category,
      currentCost,
      targetYear,
      priority,
      inflation,
      saved,
      return: returnRate,
      assignedTo: assignedTo,
      fundedBy: fundedBy,
      fundingSplit: fundingSplit
    };
    
    const wasEditingGoal = Boolean(appState.editingGoal);
    if (appState.editingGoal) {
      const index = appState.goals.findIndex(g => g.id === appState.editingGoal.id);
      appState.goals[index] = goal;
    } else {
      appState.goals.push(goal);
    }

    goals.hideGoalForm();
    goals.renderGoals();
    saveAppStateToStorage();
    showAuthNotification(wasEditingGoal ? `Goal "${name}" updated.` : `Goal "${name}" added.`, 'success');
  },
  
  editGoal: (id) => {
    const goal = appState.goals.find(g => g.id === id);
    if (!goal) return;
    
    appState.editingGoal = goal;
    document.getElementById('goalFormContainer').style.display = 'block';
    document.getElementById('goalName').value = goal.name;
    document.getElementById('goalCategory').value = goal.category;
    document.getElementById('goalCurrentCost').value = goal.currentCost;
    document.getElementById('goalTargetYear').value = goal.targetYear;
    document.getElementById('goalPriority').value = goal.priority;
    document.getElementById('goalInflation').value = goal.inflation;
    document.getElementById('goalSaved').value = goal.saved;
    document.getElementById('goalReturn').value = goal.return;
    
    // Load family assignment data
    if (document.getElementById('goalAssignedTo') && goal.assignedTo) {
      document.getElementById('goalAssignedTo').value = goal.assignedTo;
    }
    if (document.getElementById('goalFundedBy') && goal.fundedBy) {
      document.getElementById('goalFundedBy').value = goal.fundedBy;
    }
    if (document.getElementById('goalFundingSplit') && goal.fundingSplit) {
      document.getElementById('goalFundingSplit').value = goal.fundingSplit;
    }
  },
  
  deleteGoal: (id) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    appState.goals = appState.goals.filter(g => g.id !== id);
    goals.renderGoals();
  },
  
  renderGoals: () => {
    const container = document.getElementById('goalsCardsContainer');
    if (appState.goals.length === 0) {
      container.innerHTML = '<div class="empty-state-card"><p>No goals added yet. Click "Add Goal" to start planning.</p></div>';
    } else {
      container.innerHTML = appState.goals.map(goal => {
        const yearsRemaining = goal.targetYear - new Date().getFullYear();
        const futureValue = utils.calculateFutureValue(goal.currentCost, goal.inflation, yearsRemaining);
        const progressPercent = Math.min((goal.saved / futureValue) * 100, 100);
        
        let status = 'on-track';
        let statusText = 'On Track';
        if (progressPercent < 30) {
          status = 'critical';
          statusText = 'Critical';
        } else if (progressPercent < 60) {
          status = 'needs-attention';
          statusText = 'Needs Attention';
        }
        
        const monthlySIPRequired = yearsRemaining > 0 ? utils.calculateRequiredSIP(futureValue - goal.saved, goal.return, yearsRemaining) : 0;
        
        // Get member names for assignment display
        const assignedMember = goal.assignedTo ? appState.familyMembers.find(m => m.id === goal.assignedTo) : null;
        const fundingMember = goal.fundedBy ? appState.familyMembers.find(m => m.id === goal.fundedBy) : null;
        
        const memberBadge = assignedMember ? `<span class="goal-assignment-badge goal-assignment-badge--for">For: ${assignedMember.name}</span>` : '';
        const fundingBadge = fundingMember ? `<span class="goal-assignment-badge goal-assignment-badge--by">By: ${fundingMember.name} (${goal.fundingSplit || 100}%)</span>` : '';
        
        return `
          <div class="goal-card">
            <div class="goal-header">
              <div>
                <div class="goal-title"><span>${goal.name}</span> ${memberBadge} ${fundingBadge}</div>
                <div class="goal-category">${goal.category}</div>
              </div>
              <div class="goal-priority ${goal.priority.toLowerCase()}">${goal.priority}</div>
            </div>
            <div class="goal-details">
              <div class="goal-detail-item">
                <span class="goal-detail-label">Target Year:</span>
                <span class="goal-detail-value">${goal.targetYear}</span>
              </div>
              <div class="goal-detail-item">
                <span class="goal-detail-label">Years Remaining:</span>
                <span class="goal-detail-value">${yearsRemaining} years</span>
              </div>
              <div class="goal-detail-item">
                <span class="goal-detail-label">Future Value:</span>
                <span class="goal-detail-value">${utils.formatCurrency(futureValue)}</span>
              </div>
              <div class="goal-detail-item">
                <span class="goal-detail-label">Already Saved:</span>
                <span class="goal-detail-value">${utils.formatCurrency(goal.saved)}</span>
              </div>
              <div class="goal-detail-item">
                <span class="goal-detail-label">Monthly SIP Needed:</span>
                <span class="goal-detail-value">${utils.formatCurrency(monthlySIPRequired)}</span>
              </div>
            </div>
            <div class="goal-progress">
              <div class="goal-progress-label">
                <span>Progress</span>
                <span>${utils.formatNumber(progressPercent, 1)}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill ${status}" style="width: ${progressPercent}%"></div>
              </div>
            </div>
            <div class="goal-status ${status}">${statusText}</div>
            <div class="goal-actions">
              <button class="btn btn--sm btn--secondary" onclick="goals.editGoal(${goal.id})">Edit</button>
              <button class="btn btn--sm btn--outline" onclick="goals.deleteGoal(${goal.id})">Delete</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }
};

// Portfolio Module
const portfolio = {
  refresh: () => {
    portfolio.calculatePortfolio();
  },
  
  calculatePortfolio: () => {
    const assetsByCategory = {};
    const totalValue = networth.calculateTotalAssets();
    
    appState.assets.forEach(asset => {
      if (!assetsByCategory[asset.category]) {
        assetsByCategory[asset.category] = {
          value: 0,
          returns: []
        };
      }
      assetsByCategory[asset.category].value += asset.value;
      assetsByCategory[asset.category].returns.push(asset.return);
    });
    
    let weightedReturn = 0;
    const tbody = document.getElementById('portfolioTableBody');
    
    if (Object.keys(assetsByCategory).length === 0) {
      tbody.innerHTML = '<tr class="empty-state"><td colspan="5">No portfolio data available</td></tr>';
      document.getElementById('portfolioWeightedReturn').textContent = '0%';
      document.getElementById('portfolioTotalValue').textContent = '₹0';
      document.getElementById('portfolioAssetClasses').textContent = '0';
      return;
    }
    
    tbody.innerHTML = Object.entries(assetsByCategory).map(([category, data]) => {
      const allocation = (data.value / totalValue) * 100;
      const avgReturn = data.returns.reduce((a, b) => a + b, 0) / data.returns.length;
      const contribution = (allocation / 100) * avgReturn;
      weightedReturn += contribution;
      
      return `
        <tr>
          <td><strong class="table-primary-text">${category}</strong></td>
          <td>${utils.formatCurrency(data.value)}</td>
          <td><span class="allocation-pill">${utils.formatNumber(allocation, 1)}%</span></td>
          <td>${utils.formatNumber(avgReturn, 1)}%</td>
          <td><strong class="portfolio-return-text">${utils.formatNumber(contribution, 2)}%</strong></td>
        </tr>
      `;
    }).join('');
    
    document.getElementById('portfolioWeightedReturn').textContent = utils.formatNumber(weightedReturn, 2) + '%';
    document.getElementById('portfolioTotalValue').textContent = utils.formatCurrency(totalValue);
    document.getElementById('portfolioAssetClasses').textContent = Object.keys(assetsByCategory).length;
    
    portfolio.renderDistributionChart();
  },
  
  renderDistributionChart: () => {
    const canvas = document.getElementById('portfolioDistChart');
    if (appState.charts.portfolioDist) {
      appState.charts.portfolioDist.destroy();
    }
    
    const assetsByCategory = {};
    appState.assets.forEach(asset => {
      if (!assetsByCategory[asset.category]) {
        assetsByCategory[asset.category] = 0;
      }
      assetsByCategory[asset.category] += asset.value;
    });
    
    if (Object.keys(assetsByCategory).length === 0) return;
    
    appState.charts.portfolioDist = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: Object.keys(assetsByCategory),
        datasets: [{
          data: Object.values(assetsByCategory),
            backgroundColor: chartColors.primary
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  },
  
  init: () => {
    document.getElementById('calculateRiskBtn').addEventListener('click', () => portfolio.calculateRisk());
  },
  
  calculateRisk: () => {
    const horizon = parseInt(document.getElementById('riskHorizon').value);
    const tolerance = document.getElementById('riskTolerance').value;
    
    let equity = 50;
    let debt = 40;
    let others = 10;
    
    if (tolerance === 'Conservative') {
      equity = 30;
      debt = 60;
      others = 10;
    } else if (tolerance === 'Aggressive') {
      equity = 70;
      debt = 20;
      others = 10;
    }
    
    // Adjust for horizon
    if (horizon > 15) {
      equity += 10;
      debt -= 10;
    } else if (horizon < 5) {
      equity -= 10;
      debt += 10;
    }
    
    equity = Math.max(0, Math.min(100, equity));
    debt = Math.max(0, Math.min(100, debt));
    
    document.getElementById('recEquity').textContent = equity + '%';
    document.getElementById('recDebt').textContent = debt + '%';
    document.getElementById('recOthers').textContent = others + '%';
    document.getElementById('riskRecommendations').style.display = 'block';
  }
};

// Planner Module
const planner = {
  init: () => {
    document.getElementById('calculateProjectionBtn').addEventListener('click', () => planner.calculateProjections());
    
    // Scenario sliders
    document.getElementById('savingsAdjSlider').addEventListener('input', (e) => {
      document.getElementById('savingsAdjLabel').textContent = e.target.value + '%';
      planner.updateScenario();
    });
    
    document.getElementById('returnAdjSlider').addEventListener('input', (e) => {
      document.getElementById('returnAdjLabel').textContent = e.target.value + '%';
      planner.updateScenario();
    });
    
    document.getElementById('retirementAdjSlider').addEventListener('input', (e) => {
      document.getElementById('retirementAdjLabel').textContent = e.target.value + ' years';
      planner.updateScenario();
    });
  },
  
  calculateProjections: () => {
    const currentAge = parseInt(document.getElementById('plannerCurrentAge').value);
    const retirementAge = parseInt(document.getElementById('plannerRetirementAge').value);
    const currentSavings = parseFloat(document.getElementById('plannerSavings').value);
    const monthlySavings = parseFloat(document.getElementById('plannerMonthlySavings').value);
    const returnRate = parseFloat(document.getElementById('plannerReturn').value);
    const years = retirementAge - currentAge;
    
    const projectedCorpus = utils.calculateSIP(monthlySavings, returnRate, years) + utils.calculateFutureValue(currentSavings, returnRate, years);
    const totalInvested = currentSavings + (monthlySavings * 12 * years);
    const totalReturns = projectedCorpus - totalInvested;
    
    document.getElementById('projectedCorpus').textContent = utils.formatCurrency(projectedCorpus);
    document.getElementById('totalInvested').textContent = utils.formatCurrency(totalInvested);
    document.getElementById('totalReturns').textContent = utils.formatCurrency(totalReturns);
    document.getElementById('projectionResults').style.display = 'block';
    
    planner.renderProjectionChart(years, monthlySavings, currentSavings, returnRate);
    planner.baseProjection = { projectedCorpus, years, monthlySavings, currentSavings, returnRate, retirementAge };
    planner.updateScenario();
  },
  
  renderProjectionChart: (years, monthlySavings, currentSavings, returnRate) => {
    const canvas = document.getElementById('projectionChart');
    if (appState.charts.projection) {
      appState.charts.projection.destroy();
    }
    
    const labels = [];
    const data = [];
    let corpus = currentSavings;
    const months = years * 12;
    const mr = returnRate / 12 / 100;
    
    // Year 0 starting point
    labels.push('Year 0');
    data.push(corpus);
    
    for (let m = 1; m <= months; m++) {
      if (appState.settings.sipTiming === 'due') {
        // Deposit at start, then grow
        corpus = (corpus + monthlySavings) * (1 + mr);
      } else {
        // Grow then deposit at end
        corpus = corpus * (1 + mr) + monthlySavings;
      }
      if (m % 12 === 0) {
        labels.push('Year ' + (m / 12));
        data.push(corpus);
      }
    }
    
    appState.charts.projection = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Projected Wealth (₹)',
          data: data,
            borderColor: chartColors.single,
            backgroundColor: chartColors.transparent,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  },
  
  updateScenario: () => {
    if (!planner.baseProjection) return;
    
    const savingsAdj = parseFloat(document.getElementById('savingsAdjSlider').value);
    const returnAdj = parseFloat(document.getElementById('returnAdjSlider').value);
    const retirementAdj = parseInt(document.getElementById('retirementAdjSlider').value);
    
    const adjustedSavings = planner.baseProjection.monthlySavings * (1 + savingsAdj / 100);
    const adjustedReturn = planner.baseProjection.returnRate + returnAdj;
    const adjustedYears = planner.baseProjection.years + retirementAdj;
    
    const adjustedCorpus = utils.calculateSIP(adjustedSavings, adjustedReturn, adjustedYears) + 
                          utils.calculateFutureValue(planner.baseProjection.currentSavings, adjustedReturn, adjustedYears);
    
    const change = adjustedCorpus - planner.baseProjection.projectedCorpus;
    const changePercent = (change / planner.baseProjection.projectedCorpus) * 100;
    
    document.getElementById('scenarioResult').textContent = utils.formatCurrency(adjustedCorpus);
    const scenarioChange = document.getElementById('scenarioChange');
    scenarioChange.textContent = 
      (change >= 0 ? '↑ ' : '↓ ') + utils.formatCurrency(Math.abs(change)) + 
      ' (' + (change >= 0 ? '+' : '') + utils.formatNumber(changePercent, 1) + '%)';
    scenarioChange.classList.toggle('is-positive', change >= 0);
    scenarioChange.classList.toggle('is-negative', change < 0);
  }
};

// Required Return Module
const requiredReturn = {
  init: () => {
    document.getElementById('calculateRequiredReturnBtn').addEventListener('click', () => requiredReturn.calculate());
    requiredReturn.bindSliders();
  },

  bindSliders: () => {
    ['rrCurrentSavings', 'rrMonthlyContribution', 'rrExpectedReturn'].forEach((id) => {
      const slider = document.getElementById(id);
      if (!slider) return;

      slider.addEventListener('input', () => requiredReturn.updateSliderLabel(id));
      requiredReturn.updateSliderLabel(id);
    });
  },

  formatSliderValue: (id, value) => {
    if (id === 'rrExpectedReturn') return `${Number(value).toFixed(1)}%`;
    if (id === 'rrMonthlyContribution') return utils.formatCurrency(value);
    return value >= 1e7 ? `₹${(value / 1e7).toFixed(2)} Cr` : `₹${(value / 1e5).toFixed(2)} L`;
  },

  updateSliderLabel: (id) => {
    const slider = document.getElementById(id);
    const label = document.getElementById(`${id}Value`);
    if (!slider || !label) return;

    const value = parseFloat(slider.value) || 0;
    label.textContent = requiredReturn.formatSliderValue(id, value);
  },
  
  calculate: () => {
    const currentSavings = parseFloat(document.getElementById('rrCurrentSavings').value);
    const monthlyContribution = parseFloat(document.getElementById('rrMonthlyContribution').value);
    const expectedReturn = parseFloat(document.getElementById('rrExpectedReturn').value);
    
    // Calculate total needed for all goals
    let totalNeeded = 0;
    appState.goals.forEach(goal => {
      const yearsRemaining = goal.targetYear - new Date().getFullYear();
      if (yearsRemaining > 0) {
        const futureValue = utils.calculateFutureValue(goal.currentCost, goal.inflation, yearsRemaining);
        totalNeeded += futureValue;
      }
    });
    
    if (totalNeeded === 0) {
      alert('Please add some goals first');
      return;
    }
    
    // Find the maximum years
    const maxYears = Math.max(...appState.goals.map(g => g.targetYear - new Date().getFullYear()));
    
    // Calculate projected corpus at expected return
    const projectedCorpus = utils.calculateSIP(monthlyContribution, expectedReturn, maxYears) + 
                           utils.calculateFutureValue(currentSavings, expectedReturn, maxYears);
    
    // Calculate required return using iterative method
    const requiredReturnRate = requiredReturn.findRequiredReturn(currentSavings, monthlyContribution, totalNeeded, maxYears);
    
    const gap = requiredReturnRate - expectedReturn;
    
    document.getElementById('rrTotalNeeded').textContent = utils.formatCurrency(totalNeeded);
    document.getElementById('rrProjected').textContent = utils.formatCurrency(projectedCorpus);
    document.getElementById('rrRequired').textContent = utils.formatNumber(requiredReturnRate, 2) + '%';
    document.getElementById('rrGap').textContent = utils.formatNumber(gap, 2) + '%';
    
    // Feasibility assessment
    const indicator = document.getElementById('feasibilityIndicator');
    indicator.className = 'feasibility-indicator';
    
    let feasibility = '';
    let recommendations = [];
    
    if (requiredReturnRate < 12) {
      feasibility = 'achievable';
      indicator.querySelector('.feasibility-label').textContent = '✓ Achievable - Your goals are realistic';
      recommendations.push('Your goals are on track with a reasonable return expectation');
      recommendations.push('Consider diversifying across equity mutual funds and index funds');
      recommendations.push('Maintain discipline in your monthly investments');
    } else if (requiredReturnRate < 18) {
      feasibility = 'challenging';
      indicator.querySelector('.feasibility-label').textContent = '⚠ Challenging - Requires aggressive strategy';
      recommendations.push('Your goals require an aggressive investment approach');
      recommendations.push('Consider increasing your monthly contributions');
      recommendations.push('Focus on high-growth equity investments');
      recommendations.push('Review and prioritize your goals');
    } else {
      feasibility = 'difficult';
      indicator.querySelector('.feasibility-label').textContent = '✗ Very Difficult - Goals need adjustment';
      recommendations.push('Required return is very high and risky to achieve');
      recommendations.push('Consider extending goal timelines');
      recommendations.push('Significantly increase monthly contributions');
      recommendations.push('Re-evaluate goal priorities and costs');
      recommendations.push('Consider partial funding of lower priority goals');
    }
    
    indicator.classList.add(feasibility);
    
    const recList = document.getElementById('rrRecommendationsList');
    recList.innerHTML = recommendations.map(r => `<li>${r}</li>`).join('');
    
    document.getElementById('requiredReturnResults').style.display = 'block';
  },
  
  findRequiredReturn: (pv, pmt, fv, years) => {
    // Newton-Raphson method to find required return
    let rate = 12; // Initial guess
    const tolerance = 0.001;
    const maxIterations = 100;
    
    for (let i = 0; i < maxIterations; i++) {
      const monthlyRate = rate / 12 / 100;
      const months = years * 12;
      
      // Calculate corpus at current rate using configured timing
      const factor = utils.sipFVFactor(monthlyRate, months, appState.settings.sipTiming);
      const sipValue = pmt * factor;
      const pvValue = pv * Math.pow(1 + rate / 100, years);
      const totalValue = sipValue + pvValue;
      
      const error = totalValue - fv;
      
      if (Math.abs(error) < tolerance) {
        return rate;
      }
      
      // Derivative approximation
      const delta = 0.01;
      const monthlyRate2 = (rate + delta) / 12 / 100;
      const factor2 = utils.sipFVFactor(monthlyRate2, months, appState.settings.sipTiming);
      const sipValue2 = pmt * factor2;
      const pvValue2 = pv * Math.pow(1 + (rate + delta) / 100, years);
      const totalValue2 = sipValue2 + pvValue2;
      
      const derivative = (totalValue2 - totalValue) / delta;
      if (Math.abs(derivative) < 1e-9) {
        // Avoid division by near-zero; nudge rate slightly and continue
        rate += delta;
        continue;
      }
      
      // Newton-Raphson update
      rate = rate - error / derivative;
      rate = Math.max(0, Math.min(50, rate)); // Clamp between 0 and 50%
    }
    
    return rate;
  }
};

// Monte Carlo Module
const monteCarlo = {
  init: () => {
    document.getElementById('runMonteCarloBtn').addEventListener('click', () => monteCarlo.runSimulation());
  },

  fmt: (n) => n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : `₹${(n / 1e5).toFixed(2)} L`,

  token: (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
  
  runSimulation: () => {
    try {
      const initial = parseFloat(document.getElementById('mcInitial').value);
      const monthly = parseFloat(document.getElementById('mcMonthly').value);
      const years = parseInt(document.getElementById('mcYears').value);
      const meanReturn = parseFloat(document.getElementById('mcMeanReturn').value);
      const volatility = parseFloat(document.getElementById('mcVolatility').value);
      const target = parseFloat(document.getElementById('mcTarget').value);
      let simulations = parseInt(document.getElementById('mcSimulations').value);
      
      // OPTIMIZATION: Cap simulations to prevent UI freeze
      const maxSimulations = 10000;
      if (simulations > maxSimulations) {
        console.warn(`[Monte Carlo] Simulation count capped: ${simulations} → ${maxSimulations}`);
        simulations = maxSimulations;
      }
      
      // Validate inputs
      if (isNaN(initial) || initial < 0) throw new Error('Invalid initial amount');
      if (isNaN(monthly) || monthly < 0) throw new Error('Invalid monthly amount');
      if (isNaN(years) || years <= 0) throw new Error('Invalid years');
      if (isNaN(meanReturn) || meanReturn < -50 || meanReturn > 100) throw new Error('Invalid mean return (should be -50 to 100%)');
      if (isNaN(volatility) || volatility < 0 || volatility > 100) throw new Error('Invalid volatility');
      if (isNaN(target) || target < 0) throw new Error('Invalid target');
      if (isNaN(simulations) || simulations <= 0) throw new Error('Invalid simulation count');
      
      const results = [];
      const useMonthly = document.getElementById('mcMonthlySteps')?.checked ?? appState.settings.mcMonthlySteps;
      const useLognormal = document.getElementById('mcLognormal')?.checked ?? appState.settings.mcLognormal;
      const timing = appState.settings.sipTiming;

      if (useMonthly) {
        const muA = meanReturn / 100;
        const sigmaA = volatility / 100;
        const muM = useLognormal ? Math.log(1 + muA) / 12 : muA / 12;
        const sigmaM = sigmaA / Math.sqrt(12);
        const months = years * 12;

        for (let sim = 0; sim < simulations; sim++) {
          let corpus = initial;
          for (let m = 0; m < months; m++) {
            const z = utils.normalRandom();
            const factor = useLognormal
              ? Math.exp(muM - 0.5 * sigmaM * sigmaM + sigmaM * z)
              : (1 + muM + sigmaM * z);
            if (timing === 'due') {
              corpus = (corpus + monthly) * factor;
            } else {
              corpus = corpus * factor + monthly;
            }
          }
          results.push(corpus);
        }
      } else {
        // Annual steps fallback
        for (let sim = 0; sim < simulations; sim++) {
          let corpus = initial;
          for (let year = 0; year < years; year++) {
            const z = utils.normalRandom();
            const r = meanReturn / 100 + (volatility / 100) * z;
            corpus = corpus * (1 + r) + (monthly * 12);
          }
          results.push(corpus);
        }
      }
      
      // Sort results
      results.sort((a, b) => a - b);
      
      // Calculate statistics
      const median = results[Math.floor(results.length / 2)];
      const percentile10 = results[Math.floor(results.length * 0.1)];
      const percentile90 = results[Math.floor(results.length * 0.9)];
      const successCount = results.filter(r => r >= target).length;
      const probability = (successCount / simulations) * 100;
      
      document.getElementById('mcProbability').textContent = utils.formatNumber(probability, 1) + '%';
      document.getElementById('mcMedian').dataset.raw = median;
      document.getElementById('mcMedian').textContent = monteCarlo.fmt(median);
      document.getElementById('mcBest').dataset.raw = percentile90;
      document.getElementById('mcBest').textContent = monteCarlo.fmt(percentile90);
      document.getElementById('mcWorst').dataset.raw = percentile10;
      document.getElementById('mcWorst').textContent = monteCarlo.fmt(percentile10);
      
      monteCarlo.renderDistribution(results, target);
      document.getElementById('monteCarloResults').style.display = 'block';
    } catch (error) {
      console.error('[Monte Carlo Error]', error);
      alert('Error running simulation: ' + error.message);
    }
  },
  
  renderDistribution: (results, target) => {
    try {
      const canvas = document.getElementById('mcDistributionChart');
      if (appState.charts.mcDistribution) {
        appState.charts.mcDistribution.destroy();
      }
      
      // Create histogram
      const bins = 20;
      const min = Math.min(...results);
      const max = Math.max(...results);
      const binSize = (max - min) / bins;
      
      if (!isFinite(binSize)) {
        console.error('[Monte Carlo] Invalid bin size calculated');
        return;
      }
      
      const histogram = new Array(bins).fill(0);
      const labels = [];
      
      results.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
        histogram[binIndex]++;
      });
      
      for (let i = 0; i < bins; i++) {
        const binStart = min + (i * binSize);
        labels.push(monteCarlo.fmt(binStart));
      }

      const positive = monteCarlo.token('--positive');
      const border = monteCarlo.token('--border');
      const grid = monteCarlo.token('--bg-subtle');
      const textSecondary = monteCarlo.token('--text-secondary');
      const textPrimary = monteCarlo.token('--text-primary');
      const surface = monteCarlo.token('--bg-surface');
      const barColors = labels.map(() => positive);
      
      appState.charts.mcDistribution = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Simulation frequency',
            data: histogram,
            backgroundColor: barColors,
            borderColor: barColors,
            borderWidth: 0,
            borderRadius: 4,
            barPercentage: 0.9,
            categoryPercentage: 0.9
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              align: 'end',
              labels: {
                boxHeight: 10,
                boxWidth: 10,
                color: textSecondary,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              backgroundColor: surface,
              borderColor: border,
              borderWidth: 1,
              bodyColor: textPrimary,
              titleColor: textPrimary,
              cornerRadius: 8,
              displayColors: false,
              titleFont: {
                size: 12
              },
              bodyFont: {
                size: 12
              },
              callbacks: {
                title: (items) => `Outcome: ${items[0].label}`,
                label: (item) => `Simulations: ${item.raw}`
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: textSecondary,
                font: {
                  size: 11
                },
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 6
              }
            },
            y: {
              beginAtZero: true,
              border: {
                color: grid
              },
              grid: {
                color: grid
              },
              ticks: {
                color: textSecondary,
                font: {
                  size: 11
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('[Monte Carlo Chart Error]', error);
    }
  }
};

// Retirement Module
const retirement = {
  init: () => {
    document.getElementById('calculateRetirementBtn').addEventListener('click', () => retirement.calculate());
  },
  
  calculate: () => {
    const currentAge = parseInt(document.getElementById('retCurrentAge').value);
    const retirementAge = parseInt(document.getElementById('retRetirementAge').value);
    const lifeExpectancy = parseInt(document.getElementById('retLifeExpectancy').value);
    const currentExpenses = parseFloat(document.getElementById('retCurrentExpenses').value);
    const expensePercent = parseFloat(document.getElementById('retExpensePercent').value);
    const inflation = parseFloat(document.getElementById('retInflation').value);
    const postReturn = parseFloat(document.getElementById('retPostReturn').value);
    const existingCorpus = parseFloat(document.getElementById('retExistingCorpus').value);
    const monthlyContribution = parseFloat(document.getElementById('retMonthlyContribution').value);
    const preReturn = parseFloat(document.getElementById('retPreReturn').value);
    
    const yearsToRetirement = retirementAge - currentAge;
    const yearsInRetirement = lifeExpectancy - retirementAge;
    
    // Calculate retirement expenses
    const retirementExpenses = currentExpenses * (expensePercent / 100);
    const futureMonthlyExpenses = retirementExpenses * Math.pow(1 + inflation / 100, yearsToRetirement);
    const annualExpenses = futureMonthlyExpenses * 12;
    
    // Calculate corpus needed using PV of a growing annuity at retirement
    // First year's withdrawal = annualExpenses (already inflated to retirement)
    const r = postReturn / 100;
    const g = inflation / 100;
    let corpusNeeded;
    if (yearsInRetirement <= 0) {
      corpusNeeded = 0;
    } else if (Math.abs(r - g) < 1e-9) {
      // Limit case when r ≈ g
      corpusNeeded = (annualExpenses * yearsInRetirement) / (1 + r);
    } else {
      corpusNeeded = annualExpenses * (1 - Math.pow((1 + g) / (1 + r), yearsInRetirement)) / (r - g);
    }
    
    // Calculate projected corpus
    const sipCorpus = utils.calculateSIP(monthlyContribution, preReturn, yearsToRetirement);
    const existingGrowth = utils.calculateFutureValue(existingCorpus, preReturn, yearsToRetirement);
    const projectedCorpus = sipCorpus + existingGrowth;
    
    const surplus = projectedCorpus - corpusNeeded;
    
    // Calculate how long corpus will last
    let yearsLast = 0;
    let remainingCorpus = projectedCorpus;
    while (remainingCorpus > 0 && yearsLast < 100) {
      remainingCorpus = remainingCorpus * (1 + postReturn / 100) - annualExpenses * Math.pow(1 + inflation / 100, yearsLast);
      yearsLast++;
    }
    
    document.getElementById('retCorpusNeeded').textContent = utils.formatCurrency(corpusNeeded);
    document.getElementById('retProjectedCorpus').textContent = utils.formatCurrency(projectedCorpus);
    document.getElementById('retSurplus').textContent = utils.formatCurrency(surplus);
    document.getElementById('retSurplus').style.color = surplus >= 0 ? 'var(--color-success)' : 'var(--color-error)';
    document.getElementById('retYearsLast').textContent = yearsLast + ' years';
    
    retirement.renderChart(projectedCorpus, annualExpenses, yearsInRetirement, postReturn, inflation);
    document.getElementById('retirementResults').style.display = 'block';
  },
  
  renderChart: (initialCorpus, annualExpenses, years, returnRate, inflation) => {
    const canvas = document.getElementById('retirementChart');
    if (appState.charts.retirement) {
      appState.charts.retirement.destroy();
    }
    
    const labels = [];
    const data = [];
    const expenseData = [];
    let corpus = initialCorpus;
    let expenses = annualExpenses;
    
    for (let i = 0; i <= Math.min(years, 50); i++) {
      labels.push('Year ' + i);
      data.push(Math.max(0, corpus));
      expenseData.push(Math.max(0, expenses));
      corpus = corpus * (1 + returnRate / 100) - expenses;
      expenses = expenses * (1 + inflation / 100);
    }

    const positive = getComputedStyle(document.documentElement).getPropertyValue('--positive').trim();
    const negative = getComputedStyle(document.documentElement).getPropertyValue('--negative').trim();
    const border = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
    const grid = getComputedStyle(document.documentElement).getPropertyValue('--bg-subtle').trim();
    const textSecondary = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
    const textPrimary = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
    const surface = getComputedStyle(document.documentElement).getPropertyValue('--bg-surface').trim();
    
    appState.charts.retirement = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Retirement corpus',
          data: data,
          borderColor: positive,
          backgroundColor: `${positive}1a`,
          pointBackgroundColor: positive,
          pointBorderColor: surface,
          pointBorderWidth: 2,
          pointRadius: 2.5,
          pointHoverRadius: 4,
          fill: true,
          tension: 0.35
        }, {
          label: 'Annual expenses',
          data: expenseData,
          borderColor: negative,
          backgroundColor: `${negative}14`,
          pointBackgroundColor: negative,
          pointBorderColor: surface,
          pointBorderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 3,
          borderDash: [5, 4],
          fill: false,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            align: 'end',
            labels: {
              boxHeight: 10,
              boxWidth: 10,
              color: textSecondary,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: surface,
            borderColor: border,
            borderWidth: 1,
            bodyColor: textPrimary,
            titleColor: textPrimary,
            cornerRadius: 8,
            displayColors: false,
            titleFont: {
              size: 12
            },
            bodyFont: {
              size: 12
            },
            callbacks: {
              title: (items) => `${items[0].label}`,
              label: (item) => `${item.dataset.label}: ${utils.formatCurrency(item.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: grid
            },
            ticks: {
              color: textSecondary,
              font: {
                size: 11
              },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 26
            }
          },
          y: {
            beginAtZero: true,
            border: {
              color: grid
            },
            grid: {
              color: grid
            },
            ticks: {
              color: textSecondary,
              font: {
                size: 11
              },
              callback: (value) => value >= 1e7 ? `₹${(value / 1e7).toFixed(1)}Cr` : `₹${(value / 1e5).toFixed(0)}L`
            }
          }
        }
      }
    });
  }
};

// Calculators Module
const calculators = {
  init: () => {
    document.getElementById('calculateEMIBtn').addEventListener('click', () => calculators.calculateEMI());
    document.getElementById('calculateSIPBtn').addEventListener('click', () => calculators.calculateSIP());
    document.getElementById('calculateInflationBtn').addEventListener('click', () => calculators.calculateInflation());
    calculators.bindCalculatorCards();
    calculators.bindSliders();
  },

  bindCalculatorCards: () => {
    const cards = document.querySelectorAll('#calculators-tab .calc-select-card');
    const panels = document.querySelectorAll('#calculators-tab .calc-panel');

    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const target = card.dataset.calcTarget;
        cards.forEach((item) => item.classList.remove('active'));
        card.classList.add('active');
        panels.forEach((panel) => panel.classList.toggle('active', panel.id === target));
      });
    });
  },

  bindSliders: () => {
    const sliderIds = [
      'emiLoanAmount', 'emiRate', 'emiTenure',
      'sipMonthly', 'sipReturn', 'sipPeriod',
      'inflationAmount', 'inflationYears', 'inflationRate'
    ];

    sliderIds.forEach((id) => {
      const slider = document.getElementById(id);
      if (!slider) return;
      slider.addEventListener('input', () => calculators.updateSliderValue(id));
      calculators.updateSliderValue(id);
    });
  },

  formatSliderValue: (id, value) => {
    const currency = ['emiLoanAmount', 'sipMonthly', 'inflationAmount'];
    const percent = ['emiRate', 'sipReturn', 'inflationRate'];
    const years = ['emiTenure', 'sipPeriod', 'inflationYears'];

    if (currency.includes(id)) {
      if (id === 'emiLoanAmount' || id === 'inflationAmount') {
        return value >= 1e7 ? `₹${(value / 1e7).toFixed(2)} Cr` : `₹${(value / 1e5).toFixed(2)} L`;
      }
      return utils.formatCurrency(value);
    }
    if (percent.includes(id)) return `${Number(value).toFixed(1)}%`;
    if (years.includes(id)) return `${Math.round(value)} Yr`;
    return `${value}`;
  },

  updateSliderValue: (id) => {
    const slider = document.getElementById(id);
    const valueEl = document.getElementById(`${id}Value`);
    if (!slider || !valueEl) return;

    const value = parseFloat(slider.value) || 0;
    valueEl.textContent = calculators.formatSliderValue(id, value);
  },
  
  calculateEMI: () => {
    const loanAmount = parseFloat(document.getElementById('emiLoanAmount').value);
    const rate = parseFloat(document.getElementById('emiRate').value);
    const tenure = parseFloat(document.getElementById('emiTenure').value);
    
    const emi = utils.calculateEMI(loanAmount, rate, tenure);
    const totalAmount = emi * tenure * 12;
    const totalInterest = totalAmount - loanAmount;
    
    document.getElementById('emiMonthly').textContent = utils.formatCurrency(emi);
    document.getElementById('emiTotalInterest').textContent = utils.formatCurrency(totalInterest);
    document.getElementById('emiTotalAmount').textContent = utils.formatCurrency(totalAmount);
    
    calculators.renderEMIChart(loanAmount, totalInterest);
    document.getElementById('emiResults').style.display = 'block';
  },
  
  renderEMIChart: (principal, interest) => {
    const canvas = document.getElementById('emiChart');
    if (appState.charts.emi) {
      appState.charts.emi.destroy();
    }
    
    appState.charts.emi = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: ['Principal', 'Interest'],
        datasets: [{
          data: [principal, interest],
            backgroundColor: [chartColors.primary[0], chartColors.primary[2]]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  },
  
  calculateSIP: () => {
    const monthly = parseFloat(document.getElementById('sipMonthly').value);
    const returnRate = parseFloat(document.getElementById('sipReturn').value);
    const period = parseFloat(document.getElementById('sipPeriod').value);
    
    const maturityValue = utils.calculateSIP(monthly, returnRate, period);
    const invested = monthly * 12 * period;
    const returns = maturityValue - invested;
    
    document.getElementById('sipInvested').textContent = utils.formatCurrency(invested);
    document.getElementById('sipReturns').textContent = utils.formatCurrency(returns);
    document.getElementById('sipMaturity').textContent = utils.formatCurrency(maturityValue);
    
    calculators.renderSIPChart(invested, returns);
    document.getElementById('sipResults').style.display = 'block';
  },
  
  renderSIPChart: (invested, returns) => {
    const canvas = document.getElementById('sipChart');
    if (appState.charts.sip) {
      appState.charts.sip.destroy();
    }
    
    appState.charts.sip = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Invested Amount', 'Returns'],
        datasets: [{
          data: [invested, returns],
            backgroundColor: [chartColors.primary[0], chartColors.primary[2]]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  },
  
  calculateInflation: () => {
    const amount = parseFloat(document.getElementById('inflationAmount').value);
    const years = parseFloat(document.getElementById('inflationYears').value);
    const rate = parseFloat(document.getElementById('inflationRate').value);
    
    const futureValue = utils.calculateFutureValue(amount, rate, years);
    const loss = futureValue - amount;
    const retained = (amount / futureValue) * 100;
    
    document.getElementById('inflationFutureValue').textContent = utils.formatCurrency(futureValue);
    document.getElementById('inflationLoss').textContent = utils.formatCurrency(loss);
    document.getElementById('inflationRetained').textContent = utils.formatNumber(retained, 1) + '%';
    
    document.getElementById('inflationResults').style.display = 'block';
  }
};

// Reports Module
const reports = {
  init: () => {
    // Guard all bindings so missing legacy elements don't break app init
    document.getElementById('generateReportBtn')?.addEventListener('click', () => reports.generateReport());
    document.getElementById('exportJSONBtn')?.addEventListener('click', () => reports.exportJSON());
    document.getElementById('importJSONBtn')?.addEventListener('click', () => {
      document.getElementById('importFileInput')?.click();
    });
    document.getElementById('importFileInput')?.addEventListener('change', (e) => reports.importJSON(e));
    document.getElementById('printReportBtn')?.addEventListener('click', () => window.print());
  },
  
  generateReport: () => {
    // Default to including sections if checkboxes are absent in current UI
    const includeNetWorth = document.getElementById('reportNetWorth')?.checked ?? true;
    const includeGoals = document.getElementById('reportGoals')?.checked ?? true;
    const includePortfolio = document.getElementById('reportPortfolio')?.checked ?? true;
    
    reports.generateReportWithOptions(includeNetWorth, includeGoals, includePortfolio);
  },
  
  generateReportWithOptions: (includeNetWorth, includeGoals, includePortfolio) => {
    let html = '<div class="report-section"><h3>Financial Planning Report</h3>';
    html += `<p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p></div>`;
    
    if (includeNetWorth) {
      const assets = networth.calculateTotalAssets();
      const liabilities = networth.calculateTotalLiabilities();
      const netWorthValue = networth.calculateNetWorth();
      
      html += '<div class="report-section">';
      html += '<h3>Net Worth Statement</h3>';
      html += `<p><strong>Total Assets:</strong> ${utils.formatCurrency(assets)}</p>`;
      html += `<p><strong>Total Liabilities:</strong> ${utils.formatCurrency(liabilities)}</p>`;
      html += `<p><strong>Net Worth:</strong> ${utils.formatCurrency(netWorthValue)}</p>`;
      html += '<h4>Assets Breakdown</h4><ul>';
      appState.assets.forEach(asset => {
        html += `<li>${asset.name} (${asset.category}): ${utils.formatCurrency(asset.value)}</li>`;
      });
      html += '</ul></div>';
    }
    
    if (includeGoals && appState.goals.length > 0) {
      html += '<div class="report-section"><h3>Financial Goals</h3><ul>';
      appState.goals.forEach(goal => {
        const yearsRemaining = goal.targetYear - new Date().getFullYear();
        const futureValue = utils.calculateFutureValue(goal.currentCost, goal.inflation, yearsRemaining);
        html += `<li><strong>${goal.name}</strong> (${goal.category})<br>`;
        html += `Target Year: ${goal.targetYear}, Future Value: ${utils.formatCurrency(futureValue)}<br>`;
        html += `Priority: ${goal.priority}, Already Saved: ${utils.formatCurrency(goal.saved)}</li>`;
      });
      html += '</ul></div>';
    }
    
    if (includePortfolio) {
      html += '<div class="report-section"><h3>Portfolio Summary</h3>';
      html += `<p><strong>Total Portfolio Value:</strong> ${utils.formatCurrency(networth.calculateTotalAssets())}</p>`;
      html += '</div>';
    }
    
    const previewEl = document.getElementById('reportPreview');
    if (previewEl) {
      previewEl.innerHTML = html;
      previewEl.style.display = 'block';
    }
  },
  
  exportJSON: () => {
    const data = {
      assets: appState.assets,
      liabilities: appState.liabilities,
      goals: appState.goals,
      userProfile: appState.userProfile,
      exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'xtin-gini-data-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  
  importJSON: (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.assets) appState.assets = data.assets;
        if (data.liabilities) appState.liabilities = data.liabilities;
        if (data.goals) appState.goals = data.goals;
        if (data.userProfile) appState.userProfile = data.userProfile;
        
        // Refresh all views
        networth.renderAssets();
        networth.renderLiabilities();
        networth.updateSummary();
        goals.renderGoals();
        dashboard.refresh();
        
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data: ' + error.message);
      }
    };
    reader.readAsText(file);
  }
};

// Family Planning Module
const familyPlanning = {
  state: {
    children: []
  },

  init: () => {
    document.getElementById('updateFamilyProfileBtn')?.addEventListener('click', () => familyPlanning.updateProfile());
    document.getElementById('calculateChildCostsBtn')?.addEventListener('click', () => familyPlanning.calculateChildCosts());
    document.getElementById('addChildEducationBtn')?.addEventListener('click', () => familyPlanning.addChildEducation());
    document.getElementById('calculateWeddingBtn')?.addEventListener('click', () => familyPlanning.calculateWedding());
    document.getElementById('calculateInsuranceBtn')?.addEventListener('click', () => familyPlanning.calculateInsurance());
    document.getElementById('calculateEmergencyBtn')?.addEventListener('click', () => familyPlanning.calculateEmergency());
    document.getElementById('generateFamilyRoadmapBtn')?.addEventListener('click', () => familyPlanning.generateRoadmap());
    
    familyPlanning.renderChildrenList();
  },

  updateProfile: () => {
    const numChildren = parseInt(document.getElementById('fpNumChildren').value);
    alert(`Family profile updated! You have ${numChildren} child(ren).`);
  },

  calculateChildCosts: () => {
    const yearsToBirth = parseFloat(document.getElementById('fpYearsToBirth').value);
    const birthCosts = parseFloat(document.getElementById('fpBirthCosts').value);
    const monthlyCare = parseFloat(document.getElementById('fpMonthlyCare').value);
    const inflation = parseFloat(document.getElementById('fpChildInflation').value);

    const futureBirthCosts = utils.calculateFutureValue(birthCosts, inflation, yearsToBirth);
    const futureMonthlyCare = monthlyCare * Math.pow(1 + inflation / 100, yearsToBirth);
    const firstYearCosts = futureBirthCosts + (futureMonthlyCare * 12);
    
    let fiveYearTotal = futureBirthCosts;
    for (let year = 0; year < 5; year++) {
      const yearlyInflatedCare = monthlyCare * Math.pow(1 + inflation / 100, yearsToBirth + year) * 12;
      fiveYearTotal += yearlyInflatedCare;
    }

    const requiredSavings = yearsToBirth > 0 ? futureBirthCosts / (yearsToBirth * 12) : 0;

    document.getElementById('fpFutureBirthCosts').textContent = utils.formatCurrency(futureBirthCosts);
    document.getElementById('fpFirstYearCosts').textContent = utils.formatCurrency(firstYearCosts);
    document.getElementById('fpRequiredSavings').textContent = utils.formatCurrency(requiredSavings);
    document.getElementById('fp5YearCosts').textContent = utils.formatCurrency(fiveYearTotal);
    document.getElementById('childCostsResults').style.display = 'block';
  },

  addChildEducation: () => {
    const childId = Date.now();
    familyPlanning.state.children.push({
      id: childId,
      name: `Child ${familyPlanning.state.children.length + 1}`,
      currentAge: 5,
      preschoolCost: 50000,
      primaryCost: 100000,
      secondaryCost: 150000,
      higherSecCost: 200000,
      undergraduateCost: 500000,
      postgraduateCost: 1000000
    });
    familyPlanning.renderChildrenList();
  },

  renderChildrenList: () => {
    const container = document.getElementById('childrenEducationList');
    if (!container) return;

    if (familyPlanning.state.children.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #666;">No children added yet. Click "+ Add Child" to start planning.</p>';
      return;
    }

    container.innerHTML = familyPlanning.state.children.map((child, idx) => `
      <div class="child-education-card" style="background: #f8fafb; padding: 20px; margin: 15px 0; border-radius: 12px; border: 1px solid #e1e8ed;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h4 style="margin: 0;">Child ${idx + 1}</h4>
          <button class="btn btn--sm btn--outline" onclick="familyPlanning.removeChild(${child.id})">Remove</button>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Current Age</label>
            <input type="number" class="form-control" value="${child.currentAge}" onchange="familyPlanning.updateChild(${child.id}, 'currentAge', this.value)" min="0" max="25">
          </div>
          <div class="form-group">
            <label class="form-label">Preschool (Annual ₹)</label>
            <input type="number" class="form-control" value="${child.preschoolCost}" onchange="familyPlanning.updateChild(${child.id}, 'preschoolCost', this.value)" step="10000">
          </div>
          <div class="form-group">
            <label class="form-label">Primary School (Annual ₹)</label>
            <input type="number" class="form-control" value="${child.primaryCost}" onchange="familyPlanning.updateChild(${child.id}, 'primaryCost', this.value)" step="10000">
          </div>
          <div class="form-group">
            <label class="form-label">Secondary School (Annual ₹)</label>
            <input type="number" class="form-control" value="${child.secondaryCost}" onchange="familyPlanning.updateChild(${child.id}, 'secondaryCost', this.value)" step="10000">
          </div>
          <div class="form-group">
            <label class="form-label">Higher Secondary (Annual ₹)</label>
            <input type="number" class="form-control" value="${child.higherSecCost}" onchange="familyPlanning.updateChild(${child.id}, 'higherSecCost', this.value)" step="10000">
          </div>
          <div class="form-group">
            <label class="form-label">Undergraduate (Total ₹)</label>
            <input type="number" class="form-control" value="${child.undergraduateCost}" onchange="familyPlanning.updateChild(${child.id}, 'undergraduateCost', this.value)" step="50000">
          </div>
          <div class="form-group">
            <label class="form-label">Postgraduate (Total ₹)</label>
            <input type="number" class="form-control" value="${child.postgraduateCost}" onchange="familyPlanning.updateChild(${child.id}, 'postgraduateCost', this.value)" step="50000">
          </div>
        </div>
      </div>
    `).join('');

    familyPlanning.calculateEducation();
  },

  updateChild: (id, field, value) => {
    const child = familyPlanning.state.children.find(c => c.id === id);
    if (child) {
      child[field] = parseFloat(value);
      familyPlanning.calculateEducation();
    }
  },

  removeChild: (id) => {
    familyPlanning.state.children = familyPlanning.state.children.filter(c => c.id !== id);
    familyPlanning.renderChildrenList();
  },

  calculateEducation: () => {
    if (familyPlanning.state.children.length === 0) {
      document.getElementById('educationPlanResults').style.display = 'none';
      return;
    }

    const inflation = 8; // Education inflation
    let totalCorpus = 0;
    const timelineData = [];

    familyPlanning.state.children.forEach((child, idx) => {
      const age = child.currentAge;
      
      // Calculate each stage
      const stages = [
        { name: 'Preschool', yearStart: Math.max(0, 3 - age), years: 2, cost: child.preschoolCost },
        { name: 'Primary', yearStart: Math.max(0, 5 - age), years: 5, cost: child.primaryCost },
        { name: 'Secondary', yearStart: Math.max(0, 10 - age), years: 3, cost: child.secondaryCost },
        { name: 'Higher Sec', yearStart: Math.max(0, 13 - age), years: 2, cost: child.higherSecCost },
        { name: 'Undergrad', yearStart: Math.max(0, 15 - age), years: 1, cost: child.undergraduateCost },
        { name: 'Postgrad', yearStart: Math.max(0, 19 - age), years: 1, cost: child.postgraduateCost }
      ];

      stages.forEach(stage => {
        if (stage.yearStart >= 0) {
          const futureCost = utils.calculateFutureValue(stage.cost * stage.years, inflation, stage.yearStart);
          totalCorpus += futureCost;
          timelineData.push({
            child: `Child ${idx + 1}`,
            stage: stage.name,
            year: stage.yearStart,
            cost: futureCost
          });
        }
      });
    });

    const maxYears = Math.max(...timelineData.map(t => t.year), 1);
    const monthlyReturn = 12; // Expected return
    const monthlySIP = utils.calculateRequiredSIP(totalCorpus, monthlyReturn, maxYears);

    document.getElementById('fpTotalEducationCorpus').textContent = utils.formatCurrency(totalCorpus);
    document.getElementById('fpEducationSIP').textContent = utils.formatCurrency(monthlySIP);
    document.getElementById('educationPlanResults').style.display = 'block';

    // Render timeline chart
    familyPlanning.renderEducationChart(timelineData);
  },

  renderEducationChart: (timelineData) => {
    const canvas = document.getElementById('fpEducationTimelineChart');
    if (!canvas) return;

    if (appState.charts.fpEducationTimeline) {
      appState.charts.fpEducationTimeline.destroy();
    }

    const years = [...new Set(timelineData.map(t => t.year))].sort((a, b) => a - b);
    const datasets = [];
    const children = [...new Set(timelineData.map(t => t.child))];

    children.forEach((child, idx) => {
      const childData = years.map(year => {
        const item = timelineData.find(t => t.child === child && t.year === year);
        return item ? item.cost : 0;
      });

      datasets.push({
        label: child,
        data: childData,
        backgroundColor: chartColors.primary[idx % chartColors.primary.length]
      });
    });

    appState.charts.fpEducationTimeline = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: years.map(y => `Year ${y}`),
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true },
          y: { stacked: true, beginAtZero: true }
        },
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  },

  calculateWedding: () => {
    const numWeddings = parseInt(document.getElementById('fpNumWeddings').value);
    const years = parseFloat(document.getElementById('fpYearsToWedding').value);
    const currentCost = parseFloat(document.getElementById('fpWeddingCost').value);
    const inflation = parseFloat(document.getElementById('fpWeddingInflation').value);

    const futureWeddingCost = utils.calculateFutureValue(currentCost, inflation, years);
    const totalCost = futureWeddingCost * numWeddings;
    const monthlySIP = years > 0 ? utils.calculateRequiredSIP(totalCost, 12, years) : 0;

    document.getElementById('fpFutureWeddingCost').textContent = utils.formatCurrency(futureWeddingCost);
    document.getElementById('fpTotalWeddingCost').textContent = utils.formatCurrency(totalCost);
    document.getElementById('fpWeddingSIP').textContent = utils.formatCurrency(monthlySIP);
    document.getElementById('weddingResults').style.display = 'block';
  },

  calculateInsurance: () => {
    const healthCurrent = parseFloat(document.getElementById('fpHealthInsurance').value);
    const healthRecommended = parseFloat(document.getElementById('fpRecommendedHealth').value);
    const lifeCurrent = parseFloat(document.getElementById('fpLifeInsurance').value);
    const annualIncome = parseFloat(document.getElementById('fpAnnualIncome').value);

    const healthGap = Math.max(0, healthRecommended - healthCurrent);
    const recommendedLife = annualIncome * 10;
    const lifeGap = Math.max(0, recommendedLife - lifeCurrent);

    let status = 'Well Protected';
    if (healthGap > 0 || lifeGap > annualIncome * 5) {
      status = 'Critical - Needs Immediate Attention';
    } else if (lifeGap > 0) {
      status = 'Moderate - Could Improve';
    }

    document.getElementById('fpHealthGap').textContent = utils.formatCurrency(healthGap);
    document.getElementById('fpRecommendedLife').textContent = utils.formatCurrency(recommendedLife);
    document.getElementById('fpLifeGap').textContent = utils.formatCurrency(lifeGap);
    document.getElementById('fpProtectionStatus').textContent = status;
    document.getElementById('fpProtectionStatus').style.color = 
      status.includes('Critical') ? 'var(--color-error)' : 
      status.includes('Moderate') ? '#ff9800' : 'var(--color-success)';
    document.getElementById('insuranceResults').style.display = 'block';
  },

  calculateEmergency: () => {
    const monthlyExpenses = parseFloat(document.getElementById('fpMonthlyExpenses').value);
    const months = parseInt(document.getElementById('fpEmergencyMonths').value);
    const currentSavings = parseFloat(document.getElementById('fpCurrentEmergency').value);
    const timeframe = parseInt(document.getElementById('fpEmergencyTimeframe').value);

    const targetFund = monthlyExpenses * months;
    const gap = Math.max(0, targetFund - currentSavings);
    const monthlySavings = timeframe > 0 ? gap / timeframe : 0;
    const progress = (currentSavings / targetFund) * 100;

    document.getElementById('fpTargetEmergency').textContent = utils.formatCurrency(targetFund);
    document.getElementById('fpEmergencyGap').textContent = utils.formatCurrency(gap);
    document.getElementById('fpEmergencyMonthlySavings').textContent = utils.formatCurrency(monthlySavings);
    document.getElementById('fpEmergencyProgress').textContent = utils.formatNumber(progress, 1) + '%';
    document.getElementById('emergencyResults').style.display = 'block';
  },

  generateRoadmap: () => {
    // Collect all data
    const childCost = familyPlanning.state.children.length * 5000000; // Simplified
    const educationCorpus = parseFloat(document.getElementById('fpTotalEducationCorpus')?.textContent.replace(/[₹,]/g, '') || 0);
    const weddingCost = parseFloat(document.getElementById('fpTotalWeddingCost')?.textContent.replace(/[₹,]/g, '') || 0);
    const emergencyFund = parseFloat(document.getElementById('fpTargetEmergency')?.textContent.replace(/[₹,]/g, '') || 0);

    const totalCapital = childCost + educationCorpus + weddingCost + emergencyFund;
    
    const educationSIP = parseFloat(document.getElementById('fpEducationSIP')?.textContent.replace(/[₹,]/g, '') || 0);
    const weddingSIP = parseFloat(document.getElementById('fpWeddingSIP')?.textContent.replace(/[₹,]/g, '') || 0);
    const emergencySIP = parseFloat(document.getElementById('fpEmergencyMonthlySavings')?.textContent.replace(/[₹,]/g, '') || 0);
    
    const totalMonthly = educationSIP + weddingSIP + emergencySIP;
    const planningYears = 25;
    
    const currentSavings = appState.userProfile.monthlySavings || 0;
    const readiness = totalMonthly > 0 ? Math.min((currentSavings / totalMonthly) * 100, 100) : 100;

    document.getElementById('fpTotalCapitalNeeded').textContent = utils.formatCurrency(totalCapital);
    document.getElementById('fpTotalMonthlyCommitments').textContent = utils.formatCurrency(totalMonthly);
    document.getElementById('fpPlanningHorizon').textContent = planningYears + ' years';
    document.getElementById('fpReadinessScore').textContent = utils.formatNumber(readiness, 0) + '%';
    
    document.getElementById('familyRoadmapResults').style.display = 'block';

    // Milestones timeline
    const milestones = [];
    if (familyPlanning.state.children.length > 0) {
      milestones.push({ year: 2, event: 'First child starts preschool', cost: 100000 });
      milestones.push({ year: 5, event: 'Child starts primary school', cost: 500000 });
      milestones.push({ year: 15, event: 'Child starts undergraduate', cost: 2000000 });
      milestones.push({ year: 20, event: 'First wedding planning', cost: 5000000 });
    }

    document.getElementById('milestonesTimeline').innerHTML = milestones.map(m => `
      <div style="padding: 15px; margin: 10px 0; background: white; border-left: 4px solid var(--color-primary); border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: var(--color-primary);">Year ${m.year}</strong>
            <p style="margin: 5px 0 0 0;">${m.event}</p>
          </div>
          <div style="font-weight: 600; color: var(--color-text);">${utils.formatCurrency(m.cost)}</div>
        </div>
      </div>
    `).join('');

    familyPlanning.renderRoadmapChart();
  },

  renderRoadmapChart: () => {
    const canvas = document.getElementById('familyRoadmapChart');
    if (!canvas) return;

    if (appState.charts.familyRoadmap) {
      appState.charts.familyRoadmap.destroy();
    }

    const years = Array.from({length: 26}, (_, i) => i);
    const labels = years.map(y => `Year ${y}`);

    // Simulated accumulation
    const monthlySIP = parseFloat(document.getElementById('fpTotalMonthlyCommitments')?.textContent.replace(/[₹,]/g, '') || 50000);
    const returnRate = 12;
    const accumulated = years.map(y => utils.calculateSIP(monthlySIP, returnRate, y));

    appState.charts.familyRoadmap = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Accumulated Wealth (₹)',
          data: accumulated,
          borderColor: chartColors.single,
          backgroundColor: chartColors.transparent,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
};

// Advanced Family Modules

// Dual/Multi-Member Retirement Module
const dualRetirement = {
  init: () => {
    document.getElementById('calculateDualRetirementBtn')?.addEventListener('click', () => dualRetirement.calculate());
  },

  calculate: () => {
    const earners = appState.familyMembers.filter(m => m.isEarner);
    if (earners.length < 2) {
      alert('Add at least 2 earning family members to use dual retirement planning.');
      return;
    }

    const results = [];
    let combinedIncome = 0;
    earners.forEach(earner => {
      const yearsToRetirement = Math.max(0, earner.retirementAge - earner.age);
      const yearsInRetirement = Math.max(0, earner.lifeExpectancy - earner.retirementAge);
      
      results.push({
        name: earner.name,
        currentAge: earner.age,
        retirementAge: earner.retirementAge,
        yearsToRetirement,
        yearsInRetirement,
        monthlyIncome: earner.income
      });
      
      combinedIncome += earner.income;
    });

    // Render phased retirement timeline
    dualRetirement.renderTimeline(results, combinedIncome);
    
    document.getElementById('dualRetirementResults').style.display = 'block';
  },

  renderTimeline: (earners, combinedIncome) => {
    const canvas = document.getElementById('dualRetirementChart');
    if (!canvas) return;

    if (appState.charts.dualRetirement) {
      appState.charts.dualRetirement.destroy();
    }

    const currentYear = new Date().getFullYear();
    const maxYear = Math.max(...earners.map(e => currentYear + (e.retirementAge - e.currentAge) + e.yearsInRetirement));
    const years = maxYear - currentYear;

    const labels = [];
    const datasets = [];

    // Create year labels
    for (let i = 0; i <= years; i++) {
      labels.push((currentYear + i).toString());
    }

    // Create dataset for each earner
    earners.forEach((earner, index) => {
      const data = [];
      for (let i = 0; i <= years; i++) {
        const age = earner.currentAge + i;
        if (age < earner.retirementAge) {
          data.push(earner.monthlyIncome * 12); // Annual income
        } else if (age < earner.retirementAge + earner.yearsInRetirement) {
          data.push(0); // Retired, no income
        } else {
          data.push(null); // Beyond life expectancy
        }
      }

      datasets.push({
        label: earner.name,
        data: data,
        borderColor: chartColors.primary[index % chartColors.primary.length],
        backgroundColor: chartColors.primary[index % chartColors.primary.length],
        fill: false,
        tension: 0.1
      });
    });

    appState.charts.dualRetirement = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Household Income Timeline - Phased Retirement'
          },
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Annual Income (₹)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Year'
            }
          }
        }
      }
    });
  }
};

// Elder Care & Legacy Planning Module
const elderCare = {
  init: () => {
    document.getElementById('addElderCareBtn')?.addEventListener('click', () => elderCare.showForm());
    document.getElementById('saveElderCareBtn')?.addEventListener('click', () => elderCare.save());
    document.getElementById('cancelElderCareBtn')?.addEventListener('click', () => elderCare.hideForm());
    elderCare.render();
  },

  showForm: () => {
    document.getElementById('elderCareFormContainer').style.display = 'block';
    
    // Populate member dropdown
    const memberSelect = document.getElementById('elderCareMember');
    if (memberSelect) {
      memberSelect.innerHTML = appState.familyMembers.map(member =>
        `<option value="${member.id}">${member.name} (${member.relationship}, Age: ${member.age})</option>`
      ).join('');
    }
    
    // Reset form fields
    document.getElementById('elderMonthlySupport').value = '25000';
    document.getElementById('elderMedicalReserve').value = '500000';
    document.getElementById('elderLifeExpectancy').value = '85';
  },

  hideForm: () => {
    document.getElementById('elderCareFormContainer').style.display = 'none';
  },

  save: () => {
    const memberId = parseInt(document.getElementById('elderCareMember').value);
      const monthlySupport = parseFloat(document.getElementById('elderMonthlySupport').value);
    const medicalReserve = parseFloat(document.getElementById('elderMedicalReserve').value);
    const lifeExpectancy = parseInt(document.getElementById('elderLifeExpectancy').value);

    const member = appState.familyMembers.find(m => m.id === memberId);
    if (!member) return;

    const plan = {
      id: Date.now(),
      memberId,
      memberName: member.name,
      monthlySupport: monthlySupport || 0,
      medicalReserve: medicalReserve || 0,
      lifeExpectancy: lifeExpectancy || 85,
      yearsRemaining: Math.max(0, lifeExpectancy - member.age)
    };

    appState.elderCare.push(plan);
    elderCare.hideForm();
    elderCare.render();
  },

  delete: (id) => {
    if (!confirm('Remove this elder care plan?')) return;
    appState.elderCare = appState.elderCare.filter(p => p.id !== id);
    elderCare.render();
  },

  render: () => {
    const container = document.getElementById('elderCareList');
    if (!container) return;

    if (appState.elderCare.length === 0) {
      container.innerHTML = '<p style="color: var(--color-text-secondary);">No elder care plans yet.</p>';
      return;
    }

    container.innerHTML = appState.elderCare.map(plan => {
      const totalAnnual = plan.monthlySupport * 12;
      const totalRequired = (totalAnnual * plan.yearsRemaining) + plan.medicalReserve;

      return `
        <div style="background: var(--color-bg-1); padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid var(--color-primary);">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <h4 style="margin: 0 0 8px 0;">${plan.memberName}</h4>
              <p style="margin: 4px 0; color: var(--color-text-secondary);">
                Monthly Support: ${utils.formatCurrency(plan.monthlySupport)} | 
                Medical Reserve: ${utils.formatCurrency(plan.medicalReserve)}
              </p>
              <p style="margin: 4px 0;">
                <strong>Total Required:</strong> ${utils.formatCurrency(totalRequired)} 
                (over ${plan.yearsRemaining} years)
              </p>
            </div>
            <button class="btn btn--sm btn--outline" style="color: var(--color-error);" onclick="elderCare.delete(${plan.id})">Remove</button>
          </div>
        </div>
      `;
    }).join('');
  }
};

// Children's Education Timeline Module
const educationTimeline = {
  init: () => {
    document.getElementById('addEducationPlanBtn')?.addEventListener('click', () => educationTimeline.showForm());
    document.getElementById('saveEducationPlanBtn')?.addEventListener('click', () => educationTimeline.save());
    document.getElementById('cancelEducationPlanBtn')?.addEventListener('click', () => educationTimeline.hideForm());
    educationTimeline.render();
  },

  showForm: () => {
    document.getElementById('educationPlanFormContainer').style.display = 'block';
    
    // Populate child dropdown (filter for children/dependents)
    const childSelect = document.getElementById('educationChild');
    if (childSelect) {
      childSelect.innerHTML = '';
      const children = appState.familyMembers.filter(m => m.relationship === 'Child' || m.isDependent);
      if (children.length === 0) {
        childSelect.innerHTML = '<option value="">No children added yet</option>';
      } else {
        childSelect.innerHTML = children.map(child =>
          `<option value="${child.id}">${child.name} (Age: ${child.age})</option>`
        ).join('');
      }
    }
    
    // Reset form fields
    document.getElementById('educationMilestone').value = 'Primary School';
    document.getElementById('educationTargetYear').value = new Date().getFullYear() + 5;
    document.getElementById('educationCost').value = '';
    document.getElementById('educationSaved').value = '0';
    document.getElementById('educationPPF').value = '';
  },

  hideForm: () => {
    document.getElementById('educationPlanFormContainer').style.display = 'none';
  },

  save: () => {
    const childId = parseInt(document.getElementById('educationChild').value);
    const milestone = document.getElementById('educationMilestone').value;
    const targetYear = parseInt(document.getElementById('educationTargetYear').value);
    const cost = parseFloat(document.getElementById('educationCost').value);
    const saved = parseFloat(document.getElementById('educationSaved').value);
    const ppfAccount = document.getElementById('educationPPF').value;

    const child = appState.familyMembers.find(m => m.id === childId);
    if (!child) return;

    const plan = {
      id: Date.now(),
      childId,
      childName: child.name,
      milestone,
      targetYear,
      cost: cost || 0,
      saved: saved || 0,
      ppfAccount: ppfAccount || '',
      yearsRemaining: Math.max(0, targetYear - new Date().getFullYear())
    };

    appState.educationPlans.push(plan);
    educationTimeline.hideForm();
    educationTimeline.render();
    educationTimeline.renderChart();
  },

  delete: (id) => {
    if (!confirm('Remove this education plan?')) return;
    appState.educationPlans = appState.educationPlans.filter(p => p.id !== id);
    educationTimeline.render();
    educationTimeline.renderChart();
  },

  render: () => {
    const container = document.getElementById('educationPlansList');
    if (!container) return;

    if (appState.educationPlans.length === 0) {
      container.innerHTML = '<p style="color: var(--color-text-secondary);">No education plans yet.</p>';
      return;
    }

    container.innerHTML = appState.educationPlans.map(plan => {
      const progressPercent = plan.cost > 0 ? Math.min((plan.saved / plan.cost) * 100, 100) : 0;
      const requiredMonthly = plan.yearsRemaining > 0 ? utils.calculateRequiredSIP(plan.cost - plan.saved, 12, plan.yearsRemaining) : 0;

      return `
        <div style="background: var(--color-bg-1); padding: 15px; margin: 10px 0; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
            <div>
              <h4 style="margin: 0;">${plan.childName} - ${plan.milestone}</h4>
              <p style="margin: 4px 0; color: var(--color-text-secondary);">Target Year: ${plan.targetYear}</p>
            </div>
            <button class="btn btn--sm btn--outline" style="color: var(--color-error);" onclick="educationTimeline.delete(${plan.id})">Remove</button>
          </div>
          <div style="margin: 10px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 5px;">
              <span>Cost: ${utils.formatCurrency(plan.cost)}</span>
              <span>Saved: ${utils.formatCurrency(plan.saved)} (${utils.formatNumber(progressPercent, 1)}%)</span>
            </div>
            <div style="background: var(--color-bg-2); height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="background: var(--color-success); height: 100%; width: ${progressPercent}%;"></div>
            </div>
          </div>
          <p style="margin: 8px 0 0 0; font-size: 0.9rem;">
            <strong>Monthly SIP Required:</strong> ${utils.formatCurrency(requiredMonthly)}
            ${plan.ppfAccount ? `| PPF A/c: ${plan.ppfAccount}` : ''}
          </p>
        </div>
      `;
    }).join('');
  },

  renderChart: () => {
    const canvas = document.getElementById('educationTimelineChart');
    if (!canvas) return;

    if (appState.charts.advEducationTimeline) {
      appState.charts.advEducationTimeline.destroy();
    }

    if (appState.educationPlans.length === 0) return;

    // Sort by target year
    const sorted = [...appState.educationPlans].sort((a, b) => a.targetYear - b.targetYear);

    appState.charts.advEducationTimeline = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: sorted.map(p => `${p.childName} (${p.targetYear})`),
        datasets: [{
          label: 'Saved',
          data: sorted.map(p => p.saved),
          backgroundColor: chartColors.primary[4]
        }, {
          label: 'Required',
          data: sorted.map(p => p.cost - p.saved),
          backgroundColor: chartColors.primary[2]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Education Funding Timeline'
          },
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true,
            beginAtZero: true
          }
        }
      }
    });
  }
};

// Tax Optimization Module
const taxOptimization = {
  init: () => {
    document.getElementById('calculateTaxBtn')?.addEventListener('click', () => taxOptimization.calculate());
    document.getElementById('taxFilingModeSelect')?.addEventListener('change', (e) => {
      appState.settings.taxFilingMode = e.target.value;
      taxOptimization.calculate();
    });
  },

  calculate: () => {
    const filingMode = appState.settings.taxFilingMode || 'Individual';
    const earners = appState.familyMembers.filter(m => m.isEarner);

    if (earners.length === 0) {
      alert('Add earning family members to calculate tax optimization.');
      return;
    }

    const results = {
      individual: [],
      joint: null,
      savings: 0
    };

    // Calculate individual taxes
    let totalIndividualTax = 0;
    earners.forEach(earner => {
      const annualIncome = earner.income * 12;
      const tax = taxOptimization.calculateIncomeTax(annualIncome);
      results.individual.push({
        name: earner.name,
        income: annualIncome,
        tax: tax
      });
      totalIndividualTax += tax;
    });

    // Calculate joint tax if applicable
    if (filingMode === 'Joint' && earners.length >= 2) {
      const combinedIncome = earners.reduce((sum, e) => sum + (e.income * 12), 0);
      const jointTax = taxOptimization.calculateIncomeTax(combinedIncome);
      results.joint = {
        combinedIncome,
        tax: jointTax
      };
      results.savings = totalIndividualTax - jointTax;
    }

    taxOptimization.render(results, filingMode);
  },

  calculateIncomeTax: (annualIncome) => {
    // Simplified Indian tax calculation (Old Regime)
    // Assumes standard deduction of ₹50,000
    const taxableIncome = Math.max(0, annualIncome - 50000);
    
    let tax = 0;
    if (taxableIncome <= 250000) {
      tax = 0;
    } else if (taxableIncome <= 500000) {
      tax = (taxableIncome - 250000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      tax = 12500 + (taxableIncome - 500000) * 0.20;
    } else {
      tax = 12500 + 100000 + (taxableIncome - 1000000) * 0.30;
    }

    // Add 4% cess
    return tax * 1.04;
  },

  render: (results, filingMode) => {
    const container = document.getElementById('taxOptimizationResults');
    if (!container) return;

    let html = '<div style="background: var(--color-bg-1); padding: 20px; border-radius: 12px;">';
    html += `<h3>Tax Analysis - ${filingMode} Filing</h3>`;

    // Individual taxes
    html += '<div style="margin: 15px 0;"><h4>Individual Tax Liability:</h4>';
    results.individual.forEach(person => {
      html += `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
          <span>${person.name} (${utils.formatCurrency(person.income)})</span>
          <strong>${utils.formatCurrency(person.tax)}</strong>
        </div>
      `;
    });
    const totalIndividual = results.individual.reduce((sum, p) => sum + p.tax, 0);
    html += `
      <div style="display: flex; justify-content: space-between; padding: 12px 0; font-size: 1.1rem; font-weight: bold;">
        <span>Total Individual Tax:</span>
        <span>${utils.formatCurrency(totalIndividual)}</span>
      </div>
    `;
    html += '</div>';

    // Joint filing comparison
    if (results.joint) {
      html += '<div style="margin: 15px 0; padding: 15px; background: var(--color-bg-2); border-radius: 8px;">';
      html += '<h4>Joint Filing Analysis:</h4>';
      html += `
        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
          <span>Combined Income:</span>
          <span>${utils.formatCurrency(results.joint.combinedIncome)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
          <span>Joint Tax:</span>
          <strong>${utils.formatCurrency(results.joint.tax)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 12px 0; margin-top: 8px; border-top: 2px solid var(--color-border); font-size: 1.1rem;">
          <span>${results.savings >= 0 ? 'Tax Savings:' : 'Additional Tax:'}</span>
          <strong style="color: ${results.savings >= 0 ? 'var(--color-success)' : 'var(--color-error)'};">
            ${results.savings >= 0 ? '↓ ' : '↑ '}${utils.formatCurrency(Math.abs(results.savings))}
          </strong>
        </div>
      `;
      html += '</div>';

      if (results.savings >= 0) {
        html += '<p style="margin-top: 15px; padding: 10px; background: var(--color-success); color: white; border-radius: 6px;">✓ Joint filing is recommended - saves ' + utils.formatCurrency(results.savings) + ' annually.</p>';
      } else {
        html += '<p style="margin-top: 15px; padding: 10px; background: var(--color-error); color: white; border-radius: 6px;">Individual filing is recommended.</p>';
      }
    }

    html += '</div>';
    container.innerHTML = html;
    container.style.display = 'block';
  }
};

// Family-Specific Calculators Module
const familyCalculators = {
  init: () => {
    document.getElementById('calculateDependentCostBtn')?.addEventListener('click', () => familyCalculators.calculateDependentCost());
    document.getElementById('calculateFamilyInsuranceBtn')?.addEventListener('click', () => familyCalculators.calculateFamilyInsurance());
    document.getElementById('calculateEmergencyFundBtn')?.addEventListener('click', () => familyCalculators.calculateEmergencyFund());
  },

  calculateDependentCost: () => {
    const dependentType = document.getElementById('dependentType').value;
    const age = parseInt(document.getElementById('dependentAge').value);
    const lifestyle = document.getElementById('dependentLifestyle').value;

    let monthlyCost = 0;
    let years = 0;

    if (dependentType === 'Child') {
      // Cost to raise a child
      if (age < 5) {
        monthlyCost = 15000; // Infant/toddler care
        years = 18 - age;
      } else if (age < 12) {
        monthlyCost = 20000; // Primary education
        years = 18 - age;
      } else if (age < 18) {
        monthlyCost = 30000; // Secondary education
        years = 18 - age;
      } else {
        monthlyCost = 40000; // College/university
        years = 22 - age;
      }
    } else if (dependentType === 'Parent') {
      monthlyCost = 25000; // Elder care
      years = Math.max(0, 85 - age);
    } else if (dependentType === 'Spouse') {
      monthlyCost = 30000;
      years = 30; // Typical planning horizon
    }

    // Adjust for lifestyle
    const lifestyleMultiplier = {
      'Basic': 0.7,
      'Moderate': 1.0,
      'Comfortable': 1.5,
      'Luxurious': 2.0
    };
    monthlyCost *= lifestyleMultiplier[lifestyle] || 1.0;

    const annualCost = monthlyCost * 12;
    const totalCost = annualCost * years;
    const inflationAdjusted = utils.calculateFutureValue(totalCost, 6, years / 2); // Mid-point inflation

    const resultHtml = `
      <div style="background: var(--color-bg-1); padding: 20px; border-radius: 12px; margin-top: 15px;">
        <h3>Dependent Cost Estimation</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px;">
          <div class="results-box">
            <div class="results-label">Monthly Cost</div>
            <div class="results-value">${utils.formatCurrency(monthlyCost)}</div>
          </div>
          <div class="results-box">
            <div class="results-label">Annual Cost</div>
            <div class="results-value">${utils.formatCurrency(annualCost)}</div>
          </div>
          <div class="results-box">
            <div class="results-label">Total Cost (${years} years)</div>
            <div class="results-value">${utils.formatCurrency(totalCost)}</div>
          </div>
          <div class="results-box">
            <div class="results-label">Inflation-Adjusted</div>
            <div class="results-value">${utils.formatCurrency(inflationAdjusted)}</div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('dependentCostResults').innerHTML = resultHtml;
    document.getElementById('dependentCostResults').style.display = 'block';
  },

  calculateFamilyInsurance: () => {
    const members = appState.familyMembers.length;
    const dependents = appState.familyMembers.filter(m => m.isDependent).length;
    const elderlyCount = appState.familyMembers.filter(m => m.age >= 60).length;

    // Base calculation: ₹5 lakh per member + ₹10 lakh for elders
    const baseCoverage = members * 500000 + elderlyCount * 1000000;
    const recommendedCoverage = baseCoverage * 1.5; // 50% buffer

    // Premium estimation (simplified)
    const annualPremium = Math.round(recommendedCoverage * 0.01); // Approximately 1% of coverage

    const resultHtml = `
      <div style="background: var(--color-bg-1); padding: 20px; border-radius: 12px; margin-top: 15px;">
        <h3>Family Health Insurance Recommendation</h3>
        <div style="margin: 15px 0;">
          <p style="font-size: 0.9rem; color: var(--color-text-secondary);">
            Family Members: ${members} | Dependents: ${dependents} | Elderly (60+): ${elderlyCount}
          </p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px;">
          <div class="results-box">
            <div class="results-label">Minimum Coverage</div>
            <div class="results-value">${utils.formatCurrency(baseCoverage)}</div>
          </div>
          <div class="results-box">
            <div class="results-label">Recommended Coverage</div>
            <div class="results-value" style="color: var(--color-success);">${utils.formatCurrency(recommendedCoverage)}</div>
          </div>
          <div class="results-box">
            <div class="results-label">Estimated Annual Premium</div>
            <div class="results-value">${utils.formatCurrency(annualPremium)}</div>
          </div>
          <div class="results-box">
            <div class="results-label">Monthly Premium</div>
            <div class="results-value">${utils.formatCurrency(Math.round(annualPremium / 12))}</div>
          </div>
        </div>
        <div style="margin-top: 15px; padding: 12px; background: var(--color-bg-2); border-radius: 8px;">
          <p style="margin: 0; font-size: 0.9rem;">
            <strong>💡 Recommendation:</strong> Consider a family floater policy covering ${utils.formatCurrency(recommendedCoverage)} 
            with adequate coverage for critical illness, maternity (if applicable), and elder care.
          </p>
        </div>
      </div>
    `;

    document.getElementById('familyInsuranceResults').innerHTML = resultHtml;
    document.getElementById('familyInsuranceResults').style.display = 'block';
  },

  calculateEmergencyFund: () => {
    const monthlyExpenses = parseFloat(document.getElementById('familyMonthlyExpenses').value);
    const earners = appState.familyMembers.filter(m => m.isEarner).length;
    const dependents = appState.familyMembers.filter(m => m.isDependent).length;

    // Recommendation: 6-12 months, adjust for family size
    const baseMonths = 6;
    const adjustedMonths = baseMonths + (dependents * 1) + (earners === 1 ? 3 : 0); // Single earner needs more

    const recommendedFund = monthlyExpenses * adjustedMonths;
    const conservativeFund = monthlyExpenses * (adjustedMonths + 3);

    const resultHtml = `
      <div style="background: var(--color-bg-1); padding: 20px; border-radius: 12px; margin-top: 15px;">
        <h3>Family Emergency Fund Recommendation</h3>
        <div style="margin: 15px 0;">
          <p style="font-size: 0.9rem; color: var(--color-text-secondary);">
            Monthly Expenses: ${utils.formatCurrency(monthlyExpenses)} | 
            Earners: ${earners} | Dependents: ${dependents}
          </p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px;">
          <div class="results-box">
            <div class="results-label">Recommended Fund (${adjustedMonths} months)</div>
            <div class="results-value" style="color: var(--color-success);">${utils.formatCurrency(recommendedFund)}</div>
          </div>
          <div class="results-box">
            <div class="results-label">Conservative Fund (${adjustedMonths + 3} months)</div>
            <div class="results-value">${utils.formatCurrency(conservativeFund)}</div>
          </div>
        </div>
        <div style="margin-top: 15px; padding: 12px; background: var(--color-bg-2); border-radius: 8px;">
          <p style="margin: 0; font-size: 0.9rem;">
            <strong>💡 Recommendation:</strong> ${earners === 1 ? 
              'As a single-earner household, maintain a larger emergency fund (9-12 months).' : 
              'With multiple earners, 6-9 months is typically sufficient.'}
            Keep this in high-liquidity instruments like savings account or liquid funds.
          </p>
        </div>
      </div>
    `;

    document.getElementById('familyEmergencyResults').innerHTML = resultHtml;
    document.getElementById('familyEmergencyResults').style.display = 'block';
  }
};

// Family Reports Module
const familyReports = {
  init: () => {
    // Handler is set up in insights.init() for Reports tab integration
    document.getElementById('downloadFamilyReportBtn')?.addEventListener('click', () => familyReports.download());
  },

  generate: () => {
    const report = {
      generatedOn: new Date().toLocaleDateString('en-IN'),
      familyStructure: familyReports.getFamilyStructure(),
      netWorthBreakdown: familyReports.getNetWorthBreakdown(),
      goalsProgress: familyReports.getGoalsProgress(),
      retirementAnalysis: familyReports.getRetirementAnalysis(),
      recommendations: familyReports.getRecommendations()
    };

    familyReports.render(report);
  },

  getFamilyStructure: () => {
    return {
      totalMembers: appState.familyMembers.length,
      earners: appState.familyMembers.filter(m => m.isEarner).length,
      dependents: appState.familyMembers.filter(m => m.isDependent).length,
      householdIncome: familySettings.calculateHouseholdIncome(),
      members: appState.familyMembers
    };
  },

  getNetWorthBreakdown: () => {
    const totalAssets = networth.calculateTotalAssets();
    const totalLiabilities = networth.calculateTotalLiabilities();
    
    // Calculate by member
    const byMember = {};
    appState.familyMembers.forEach(member => {
      byMember[member.name] = {
        assets: 0,
        liabilities: 0
      };
    });

    appState.assets.forEach(asset => {
      const owner = appState.familyMembers.find(m => m.id === asset.owner);
      if (owner) {
        const share = asset.jointShare ? (asset.value * asset.jointShare / 100) : asset.value;
        byMember[owner.name].assets += share;
      }
    });

    appState.liabilities.forEach(liability => {
      const owner = appState.familyMembers.find(m => m.id === liability.owner);
      if (owner) {
        const share = liability.jointShare ? (liability.amount * liability.jointShare / 100) : liability.amount;
        byMember[owner.name].liabilities += share;
      }
    });

    return {
      total: {
        assets: totalAssets,
        liabilities: totalLiabilities,
        netWorth: totalAssets - totalLiabilities
      },
      byMember: byMember
    };
  },

  getGoalsProgress: () => {
    return appState.goals.map(goal => {
      const yearsRemaining = goal.targetYear - new Date().getFullYear();
      const futureValue = utils.calculateFutureValue(goal.currentCost, goal.inflation, yearsRemaining);
      const progressPercent = Math.min((goal.saved / futureValue) * 100, 100);
      const assignedMember = goal.assignedTo ? appState.familyMembers.find(m => m.id === goal.assignedTo) : null;
      const fundingMember = goal.fundedBy ? appState.familyMembers.find(m => m.id === goal.fundedBy) : null;

      return {
        name: goal.name,
        category: goal.category,
        targetYear: goal.targetYear,
        futureValue: futureValue,
        saved: goal.saved,
        progressPercent: progressPercent,
        assignedTo: assignedMember ? assignedMember.name : 'Household',
        fundedBy: fundingMember ? fundingMember.name : 'Household',
        status: progressPercent >= 60 ? 'On Track' : (progressPercent >= 30 ? 'Needs Attention' : 'Critical')
      };
    });
  },

  getRetirementAnalysis: () => {
    const earners = appState.familyMembers.filter(m => m.isEarner);
    return earners.map(earner => ({
      name: earner.name,
      currentAge: earner.age,
      retirementAge: earner.retirementAge,
      yearsToRetirement: Math.max(0, earner.retirementAge - earner.age),
      currentIncome: earner.income,
      lifeExpectancy: earner.lifeExpectancy
    }));
  },

  getRecommendations: () => {
    const recommendations = [];
    
    // Net worth recommendation
    const netWorth = networth.calculateNetWorth();
    if (netWorth < 0) {
      recommendations.push({
        category: 'Net Worth',
        priority: 'High',
        message: 'Your net worth is negative. Focus on debt reduction and increasing assets.'
      });
    }

    // Goals recommendation
    const criticalGoals = appState.goals.filter(g => {
      const years = g.targetYear - new Date().getFullYear();
      const fv = utils.calculateFutureValue(g.currentCost, g.inflation, years);
      return (g.saved / fv) < 0.3;
    });

    if (criticalGoals.length > 0) {
      recommendations.push({
        category: 'Goals',
        priority: 'High',
        message: `${criticalGoals.length} goal(s) need immediate attention with less than 30% funding.`
      });
    }

    // Insurance recommendation
    const members = appState.familyMembers.length;
    if (members > 2) {
      recommendations.push({
        category: 'Insurance',
        priority: 'Medium',
        message: 'Consider comprehensive family health insurance and adequate life coverage for earners.'
      });
    }

    // Emergency fund
    recommendations.push({
      category: 'Emergency Fund',
      priority: 'High',
      message: 'Maintain 6-12 months of expenses in liquid emergency fund.'
    });

    return recommendations;
  },

  render: (report) => {
    const container = document.getElementById('familyReportContent');
    if (!container) return;
    familyReports.renderInContainer(report, container);
  },
  
  renderInContainer: (report, container) => {
    if (!container) return;

    let html = `
      <div style="max-width: 1000px; margin: 0 auto; padding: 30px; background: white; color: #000;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid var(--color-primary); padding-bottom: 20px;">
          <h1 style="margin: 0; color: var(--color-primary);">Xtin Gini Family Financial Report</h1>
          <p style="margin: 10px 0; color: #666;">Generated on ${report.generatedOn}</p>
        </div>

        <!-- Family Structure -->
        <div style="margin: 30px 0;">
          <h2 style="color: var(--color-primary); border-bottom: 2px solid #eee; padding-bottom: 10px;">1. Family Structure</h2>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0;">
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 2rem; font-weight: bold; color: var(--color-primary);">${report.familyStructure.totalMembers}</div>
              <div style="color: #666; font-size: 0.9rem;">Total Members</div>
            </div>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 2rem; font-weight: bold; color: var(--color-success);">${report.familyStructure.earners}</div>
              <div style="color: #666; font-size: 0.9rem;">Earners</div>
            </div>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 2rem; font-weight: bold; color: #ff9800;">${report.familyStructure.dependents}</div>
              <div style="color: #666; font-size: 0.9rem;">Dependents</div>
            </div>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 1.2rem; font-weight: bold; color: var(--color-primary);">${utils.formatCurrency(report.familyStructure.householdIncome)}</div>
              <div style="color: #666; font-size: 0.9rem;">Monthly Income</div>
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Name</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Relationship</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Age</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Monthly Income</th>
              </tr>
            </thead>
            <tbody>
              ${report.familyStructure.members.map(m => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">${m.name}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${m.relationship}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${m.age}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${utils.formatCurrency(m.income)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Net Worth Breakdown -->
        <div style="margin: 30px 0; page-break-inside: avoid;">
          <h2 style="color: var(--color-primary); border-bottom: 2px solid #eee; padding-bottom: 10px;">2. Net Worth Analysis</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0;">
            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-success);">${utils.formatCurrency(report.netWorthBreakdown.total.assets)}</div>
              <div style="color: #666; font-size: 0.9rem;">Total Assets</div>
            </div>
            <div style="background: #ffebee; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-error);">${utils.formatCurrency(report.netWorthBreakdown.total.liabilities)}</div>
              <div style="color: #666; font-size: 0.9rem;">Total Liabilities</div>
            </div>
            <div style="background: ${report.netWorthBreakdown.total.netWorth >= 0 ? '#e3f2fd' : '#ffebee'}; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 1.5rem; font-weight: bold; color: ${report.netWorthBreakdown.total.netWorth >= 0 ? 'var(--color-primary)' : 'var(--color-error)'};">${utils.formatCurrency(report.netWorthBreakdown.total.netWorth)}</div>
              <div style="color: #666; font-size: 0.9rem;">Net Worth</div>
            </div>
          </div>
          <h3 style="margin: 20px 0 10px 0;">By Family Member:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Member</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Assets</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Liabilities</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Net Worth</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(report.netWorthBreakdown.byMember).map(([name, data]) => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd; color: var(--color-success);">${utils.formatCurrency(data.assets)}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd; color: var(--color-error);">${utils.formatCurrency(data.liabilities)}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd; font-weight: bold;">${utils.formatCurrency(data.assets - data.liabilities)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Goals Progress -->
        <div style="margin: 30px 0; page-break-inside: avoid;">
          <h2 style="color: var(--color-primary); border-bottom: 2px solid #eee; padding-bottom: 10px;">3. Financial Goals Progress</h2>
          ${report.goalsProgress.length === 0 ? '<p style="color: #666;">No goals defined yet.</p>' : `
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Goal</th>
                  <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Target Year</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Future Value</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Saved</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Progress</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${report.goalsProgress.map(goal => `
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                      ${goal.name}
                      <br/><small style="color: #666;">For: ${goal.assignedTo} | By: ${goal.fundedBy}</small>
                    </td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${goal.targetYear}</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${utils.formatCurrency(goal.futureValue)}</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${utils.formatCurrency(goal.saved)}</td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">
                      <div style="background: #eee; height: 20px; border-radius: 10px; overflow: hidden;">
                        <div style="background: ${goal.progressPercent >= 60 ? 'var(--color-success)' : (goal.progressPercent >= 30 ? '#ff9800' : 'var(--color-error)')}; height: 100%; width: ${goal.progressPercent}%;"></div>
                      </div>
                      <small>${utils.formatNumber(goal.progressPercent, 1)}%</small>
                    </td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">
                      <span style="padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; color: white; background: ${goal.status === 'On Track' ? 'var(--color-success)' : (goal.status === 'Needs Attention' ? '#ff9800' : 'var(--color-error)')};">
                        ${goal.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>

        <!-- Retirement Analysis -->
        <div style="margin: 30px 0; page-break-inside: avoid;">
          <h2 style="color: var(--color-primary); border-bottom: 2px solid #eee; padding-bottom: 10px;">4. Retirement Planning</h2>
          ${report.retirementAnalysis.length === 0 ? '<p style="color: #666;">No earners defined.</p>' : `
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Name</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Current Age</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Retirement Age</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Years to Retirement</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Current Income</th>
                </tr>
              </thead>
              <tbody>
                ${report.retirementAnalysis.map(earner => `
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${earner.name}</td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${earner.currentAge}</td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${earner.retirementAge}</td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${earner.yearsToRetirement}</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${utils.formatCurrency(earner.currentIncome)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>

        <!-- Recommendations -->
        <div style="margin: 30px 0; page-break-inside: avoid;">
          <h2 style="color: var(--color-primary); border-bottom: 2px solid #eee; padding-bottom: 10px;">5. Recommendations</h2>
          ${report.recommendations.map(rec => `
            <div style="margin: 15px 0; padding: 15px; border-left: 4px solid ${rec.priority === 'High' ? 'var(--color-error)' : (rec.priority === 'Medium' ? '#ff9800' : 'var(--color-success)')}; background: #f5f5f5; border-radius: 4px;">
              <div style="font-weight: bold; margin-bottom: 5px;">
                <span style="background: ${rec.priority === 'High' ? 'var(--color-error)' : (rec.priority === 'Medium' ? '#ff9800' : 'var(--color-success)')}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">${rec.priority}</span>
                ${rec.category}
              </div>
              <div style="color: #666;">${rec.message}</div>
            </div>
          `).join('')}
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; text-align: center; color: #999; font-size: 0.9rem;">
          <p>This report was generated by Xtin Gini - Advanced Financial Planning Calculator</p>
          <p>For professional financial advice, please consult a certified financial planner.</p>
        </div>
      </div>
    `;

    container.innerHTML = html;
    container.style.display = 'block';
  },

  download: () => {
    const el = document.getElementById('familyReportContainer');
    if (!el || !el.innerHTML || typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
      alert('Please generate family report first, or PDF libraries not loaded.');
      return;
    }

    html2canvas(el, { scale: 2, useCORS: true }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
      const pageWidth = 190;
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 10, 10, pageWidth, pdfHeight);
      pdf.save(`Xtin-Gini-Family-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    }).catch(() => {
      alert('Could not create family report PDF. Please try again.');
    });
  }
};

// Sample Data
const sampleData = {
  load: () => {
      // Reset and load comprehensive family structure
      appState.familyMembers = [
        {
          id: 1,
          name: "Rajesh Kumar",
          relationship: "Self",
          age: 38,
          income: 250000,
          isEarner: true,
          isDependent: false,
          retirementAge: 60,
          lifeExpectancy: 85,
          gender: "Male",
          healthStatus: "Good"
        },
        {
          id: 2,
          name: "Priya Kumar",
          relationship: "Spouse",
          age: 35,
          income: 180000,
          isEarner: true,
          isDependent: false,
          retirementAge: 60,
          lifeExpectancy: 85,
          gender: "Female",
          healthStatus: "Good"
        },
        {
          id: 3,
          name: "Aarav Kumar",
          relationship: "Son",
          age: 8,
          income: 0,
          isEarner: false,
          isDependent: true,
          retirementAge: 60,
          lifeExpectancy: 85,
          gender: "Male",
          healthStatus: "Good"
        },
        {
          id: 4,
          name: "Ananya Kumar",
          relationship: "Daughter",
          age: 5,
          income: 0,
          isEarner: false,
          isDependent: true,
          retirementAge: 60,
          lifeExpectancy: 85,
          gender: "Female",
          healthStatus: "Good"
        },
        {
          id: 5,
          name: "Ramesh Kumar (Father)",
          relationship: "Parent",
          age: 68,
          income: 0,
          isEarner: false,
          isDependent: true,
          retirementAge: 60,
          lifeExpectancy: 82,
          gender: "Male",
          healthStatus: "Fair"
        }
      ];

      // Assets with ownership
    appState.assets = [
        { id: 1, name: 'Primary Residence', category: 'Real Estate', value: 25000000, return: 8, ownershipType: 'Joint', owner: 1, jointShare: 50 },
        { id: 2, name: 'Fixed Deposits', category: 'Fixed Deposits', value: 2500000, return: 7, ownershipType: 'Individual', owner: 1, jointShare: 100 },
        { id: 3, name: 'Equity Mutual Funds (Rajesh)', category: 'Mutual Funds', value: 1500000, return: 12, ownershipType: 'Individual', owner: 1, jointShare: 100 },
        { id: 4, name: 'Equity Mutual Funds (Priya)', category: 'Mutual Funds', value: 800000, return: 12, ownershipType: 'Individual', owner: 2, jointShare: 100 },
        { id: 5, name: 'Gold', category: 'Gold', value: 1000000, return: 8, ownershipType: 'Joint', owner: 1, jointShare: 50 },
        { id: 6, name: 'PPF Account (Rajesh)', category: 'PPF', value: 600000, return: 7.1, ownershipType: 'Individual', owner: 1, jointShare: 100 },
        { id: 7, name: 'PPF Account (Priya)', category: 'PPF', value: 400000, return: 7.1, ownershipType: 'Individual', owner: 2, jointShare: 100 },
        { id: 8, name: 'Emergency Fund', category: 'Cash', value: 500000, return: 4, ownershipType: 'Joint', owner: 1, jointShare: 50 }
    ];
    
      // Liabilities with ownership
    appState.liabilities = [
        { id: 1, name: 'Home Loan', type: 'Home Loan', amount: 8000000, rate: 8.5, emi: 95000, tenure: 15, ownershipType: 'Joint', owner: 1, jointShare: 50 },
        { id: 2, name: 'Car Loan', type: 'Car Loan', amount: 500000, rate: 9, emi: 15000, tenure: 3, ownershipType: 'Individual', owner: 1, jointShare: 100 }
    ];
    
      // Goals with family member assignments
    appState.goals = [
        { id: 1, name: "Ananya's Higher Education", category: 'Education', currentCost: 2500000, targetYear: 2033, priority: 'High', inflation: 8, saved: 500000, return: 12, assignedTo: 4, fundedBy: 1, fundingSplit: 60 },
        { id: 2, name: "Aarav's Engineering Degree", category: 'Education', currentCost: 3000000, targetYear: 2030, priority: 'High', inflation: 8, saved: 400000, return: 12, assignedTo: 3, fundedBy: 1, fundingSplit: 60 },
        { id: 3, name: "Ananya's Wedding", category: 'Wedding', currentCost: 2000000, targetYear: 2038, priority: 'High', inflation: 7, saved: 200000, return: 12, assignedTo: 4, fundedBy: 1, fundingSplit: 50 },
        { id: 4, name: 'Family Retirement Corpus', category: 'Retirement', currentCost: 50000000, targetYear: 2047, priority: 'High', inflation: 6, saved: 5000000, return: 12, assignedTo: 1, fundedBy: 1, fundingSplit: 60 },
        { id: 5, name: 'Vacation Home in Goa', category: 'Home Purchase', currentCost: 8000000, targetYear: 2028, priority: 'Medium', inflation: 8, saved: 1000000, return: 12, assignedTo: null, fundedBy: 1, fundingSplit: 50 },
        { id: 6, name: 'Dream Car Upgrade', category: 'Other', currentCost: 1500000, targetYear: 2027, priority: 'Low', inflation: 5, saved: 300000, return: 10, assignedTo: null, fundedBy: 2, fundingSplit: 100 }
      ];

      // Elder care planning
      appState.elderCare = [
        {
          id: 1001,
          memberId: 5,
          memberName: "Ramesh Kumar (Father)",
          monthlySupport: 25000,
          medicalReserve: 800000,
          lifeExpectancy: 82,
          yearsRemaining: 14
        }
      ];

      // Education timeline plans
      appState.educationPlans = [
        {
            id: 2001,
            childId: 3,
            childName: "Aarav Kumar",
            milestone: 'Higher Secondary',
            targetYear: 2030,
            cost: 500000,
            saved: 150000,
            ppfAccount: 'PPF-AARAV-001',
            yearsRemaining: 5
        },
        {
            id: 2002,
            childId: 3,
            childName: "Aarav Kumar",
            milestone: 'Engineering (UG)',
            targetYear: 2034,
            cost: 2000000,
            saved: 400000,
            ppfAccount: 'PPF-AARAV-001',
            yearsRemaining: 9
          },
          {
            id: 2003,
            childId: 4,
            childName: "Ananya Kumar",
            milestone: 'Primary School',
            targetYear: 2028,
            cost: 300000,
            saved: 100000,
            ppfAccount: 'PPF-ANANYA-001',
            yearsRemaining: 3
          },
          {
            id: 2004,
            childId: 4,
            childName: "Ananya Kumar",
            milestone: 'Higher Secondary',
            targetYear: 2035,
            cost: 440000,
            saved: 50000,
            ppfAccount: 'PPF-ANANYA-001',
            yearsRemaining: 10
          },
          {
            id: 2005,
            childId: 4,
            childName: "Ananya Kumar",
            milestone: 'Medical/MBA (UG)',
            targetYear: 2038,
            cost: 3000000,
            saved: 200000,
            ppfAccount: 'PPF-ANANYA-001',
            yearsRemaining: 13
        }
      ];

      // Tax optimization settings
      appState.taxOptimization = {
        filingMode: 'Joint',
        deductions80C: {
          ppf: 150000,
          elss: 0,
          nsc: 0,
          lifePremium: 50000,
          tuitionFees: 0
        },
        deductions80D: {
          selfHealth: 25000,
          parentHealth: 50000
        },
        deductions80E: {
          educationLoanInterest: 0
        },
        hufBenefits: false
      };
    
      // Update settings
      appState.settings.incomeMode = 'Dual';
      appState.settings.taxFilingMode = 'Joint';
      appState.familyViewMode = 'Household';

      // Update user profile with combined household data
      appState.userProfile = {
        currentAge: 38,
        retirementAge: 60,
        monthlyIncome: 430000, // Combined income
        monthlyExpenses: 180000,
        monthlySavings: 150000,
        lifeExpectancy: 85
      };

      // Render all modules
    networth.renderAssets();
    networth.renderLiabilities();
    networth.updateSummary();
    goals.renderGoals();
    dashboard.refresh();
      familySettings.renderFamilyMembers();
      familySettings.renderHouseholdSummary();
      elderCare.render();
      educationTimeline.render();
    
      // Switch to dashboard tab to show the loaded data
      navigation.switchTab('dashboard');

      // Persist sample data immediately so subsequent adds don't lose it on reload
      saveAppStateToStorage();

      // Refresh landing page renders so family/goals lists reflect sample data
      window.landingPageRefresh?.();

      // Notification handled by caller (app.js event handler)
  }
};

// (Diagnostics section removed)

document.addEventListener('DOMContentLoaded', async () => {
  await window.GiniAuth?.init?.();
  await loadAppStateFromStorage();

  // Signal that persisted state is applied — the landing page waits for
  // this before rendering, so it never paints from empty default state.
  window.__giniStateLoaded = true;
  document.dispatchEvent(new CustomEvent('gini:state-loaded'));

  setupChatbot();
  // Initialize Chart.js defaults using current CSS theme variables
  initChartDefaults();

  navigation.init();
  networth.init();
  goals.init();
  portfolio.init();
  planner.init();
  requiredReturn.init();
  monteCarlo.init();
  retirement.init();
  calculators.init();
  reports.init();
  familySettings.init();
  familyPlanning.init();
  
  // Initialize advanced family modules
  dualRetirement.init();
  elderCare.init();
  educationTimeline.init();
  // Year-end auto generation (on load)
  try {
    const today = new Date();
    if (appState.reports.autoGenerateYearEnd && today.getMonth() === 11 && today.getDate() === 31) {
      const key = `review_${today.getFullYear()}`;
      if (!localStorage.getItem(key)) {
        insights.generateYearEndReview(today.getFullYear());
      }
    }
  } catch {}

  // If reports tab is default active in HTML in future, ensure it's initialized
  if (document.getElementById('reports-tab')?.classList.contains('active')) {
    insights.init();
  }
  taxOptimization.init();
  familyCalculators.init();
  familyReports.init();
  
  dashboard.refresh();

  // Settings wiring
  const sipSel = document.getElementById('sipTimingSelect');
  if (sipSel) {
    sipSel.value = appState.settings.sipTiming;
    sipSel.addEventListener('change', () => {
      appState.settings.sipTiming = sipSel.value;
      goals.renderGoals();
      const projVisible = document.getElementById('projectionResults')?.style.display !== 'none';
      if (projVisible) planner.calculateProjections();
      const sipVisible = document.getElementById('sipResults')?.style.display !== 'none';
      if (sipVisible) calculators.calculateSIP();
    });
  }
  const mcMonthlyEl = document.getElementById('mcMonthlySteps');
  const mcLognormalEl = document.getElementById('mcLognormal');
  if (mcMonthlyEl) mcMonthlyEl.checked = appState.settings.mcMonthlySteps;
  if (mcLognormalEl) mcLognormalEl.checked = appState.settings.mcLognormal;
  mcMonthlyEl?.addEventListener('change', () => appState.settings.mcMonthlySteps = mcMonthlyEl.checked);
  mcLognormalEl?.addEventListener('change', () => appState.settings.mcLognormal = mcLognormalEl.checked);

  document.getElementById('hideOnboardingBtn')?.addEventListener('click', () => {
    localStorage.setItem('gini_onboarding_hidden', 'true');
    dashboard.updateOnboarding();
  });

  document.getElementById('dashboardOnboarding')?.addEventListener('click', (event) => {
    const step = event.target.closest('[data-onboarding-key]');
    if (!step) return;

    if (step.dataset.onboardingKey === 'gini') {
      document.getElementById('chatbotToggle')?.click();
      return;
    }

    if (step.dataset.onboardingTab) {
      navigation.switchTab(step.dataset.onboardingTab);
    }
  });

  document.getElementById('loadSampleData').addEventListener('click', () => {
    try {
      sampleData.load();
      if (typeof showAuthNotification === 'function') {
        showAuthNotification('Sample data loaded successfully!', 'success');
      } else {
        alert('Sample data loaded successfully!');
      }
    } catch (error) {
      console.error('Error loading sample data:', error);
      if (typeof showAuthNotification === 'function') {
        showAuthNotification('Error loading sample data. Please try again.', 'error');
      } else {
        alert('Error loading sample data. Please try again.');
      }
    }
  });

  const importPdfBtn = document.getElementById('importPdfData');
  const importPdfInput = document.getElementById('importPdfInput');

  importPdfBtn?.addEventListener('click', () => {
    importPdfInput?.click();
  });

  importPdfInput?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    importPdfBtn.disabled = true;
    const originalLabel = importPdfBtn.textContent;
    importPdfBtn.textContent = 'Importing...';

    try {
      const pdfText = await pdfImport.extractTextFromFile(file);
      const parsed = pdfImport.parseText(pdfText);
      const confirmed = await pdfImport.reviewAndConfirm(parsed);

      if (!confirmed) {
        if (typeof showAuthNotification === 'function') {
          showAuthNotification('PDF import cancelled.', 'error');
        } else {
          alert('PDF import cancelled.');
        }
        return;
      }

      const result = pdfImport.applyToState(parsed);

      // Re-render key modules after applying imported values
      networth.renderAssets();
      networth.renderLiabilities();
      networth.updateSummary();
      goals.renderGoals();
      familySettings.renderFamilyMembers && familySettings.renderFamilyMembers();
      familySettings.renderHouseholdSummary && familySettings.renderHouseholdSummary();
      dashboard.refresh();

      if (typeof insights?.renderHealthReport === 'function') {
        insights.renderHealthReport();
      }

      saveAppStateToStorage();

      const summary = `Imported from PDF: ${result.profileFields} profile values, ${result.assets} assets, ${result.liabilities} liabilities, ${result.goals} goals, ${result.familyMembers} family members.`;
      if (typeof showAuthNotification === 'function') {
        showAuthNotification(summary, 'success');
      } else {
        alert(summary);
      }
    } catch (error) {
      console.error('[PDF Import] Failed:', error);
      const message = `Could not import PDF: ${error.message || 'Unknown error'}`;
      if (typeof showAuthNotification === 'function') {
        showAuthNotification(message, 'error');
      } else {
        alert(message);
      }
    } finally {
      importPdfBtn.disabled = false;
      importPdfBtn.textContent = originalLabel;
      importPdfInput.value = '';
    }
  });

  document.getElementById('resetData').addEventListener('click', () => {
    const loggedIn = !!window.GiniAuth?.isLoggedIn?.();
    const ok = confirm(
      'Reset all Gini data?\n\nThis clears your family members, assets, liabilities, goals, and reports' +
      (loggedIn ? ', and syncs the reset to your account' : '') +
      '. This cannot be undone.'
    );
    if (!ok) {
      showAuthNotification('Reset cancelled.', 'error');
      return;
    }

    appState.assets = [];
    appState.liabilities = [];
    appState.goals = [];
    appState.elderCare = [];
    appState.educationPlans = [];
    appState.reports.scenarios = [];
    // Reset the household to empty so any loaded sample family is cleared
    // and the user restarts from the "Add Yourself" flow with real data.
    appState.familyMembers = [];
    networth.renderAssets();
    networth.renderLiabilities();
    networth.updateSummary();
    goals.renderGoals();
    familySettings.renderFamilyMembers();
    familySettings.renderHouseholdSummary();
    dashboard.refresh();
    saveAppStateToStorage({ immediateCloudSync: true });
    showAuthNotification('All data has been reset.', 'success');
  });
  
  // Add Backup button functionality (legacy element may be absent in current UI)
  document.getElementById('addBackup')?.addEventListener('click', () => {
    // Open the full backup panel (left hover menu functionality)
    if (window.GiniBackupUI && typeof window.GiniBackupUI.showBackupPanel === 'function') {
      window.GiniBackupUI.showBackupPanel();
    } else {
      alert('Backup panel is not available.');
    }
  });
  
  // Listen for data restore events
  window.addEventListener('giniDataRestored', () => {
    // Reload state from storage
    loadAppStateFromStorage();
    // Re-render all UI
    networth.renderAssets();
    networth.renderLiabilities();
    networth.updateSummary();
    goals.renderGoals();
    familySettings.renderFamilyMembers && familySettings.renderFamilyMembers();
    dashboard.refresh();
  });
  
  let localAutoSaveTimer = null;
  const scheduleLocalAutoSave = () => {
    clearTimeout(localAutoSaveTimer);
    localAutoSaveTimer = setTimeout(() => {
      saveAppStateToStorage();
    }, 1200);
  };

  document.addEventListener('change', scheduleLocalAutoSave, true);
  document.addEventListener('input', (event) => {
    if (event.target?.matches?.('input, select, textarea')) {
      scheduleLocalAutoSave();
    }
  }, true);

  // Auto-save state periodically
  setInterval(saveAppStateToStorage, 30000); // Every 30 seconds

});

// ============================================================================
// BACKUP & RECOVERY SYSTEM
// ============================================================================

function getPersistableAppState() {
  return {
    assets: appState.assets || [],
    liabilities: appState.liabilities || [],
    goals: appState.goals || [],
    familyMembers: appState.familyMembers || [],
    familyViewMode: appState.familyViewMode || 'Household',
    settings: appState.settings || {},
    userProfile: appState.userProfile || {},
    elderCare: appState.elderCare || [],
    educationPlans: appState.educationPlans || [],
    estatePlan: appState.estatePlan || {},
    taxOptimization: appState.taxOptimization || {},
    reports: appState.reports || {},
    savedAt: new Date().toISOString()
  };
}

// Older versions seeded a fake "Primary User" (₹2,00,000, age 35) into
// every household, and that ghost still lives in saved localStorage/cloud
// data. Strip it on load — but ONLY the byte-exact untouched seed; any
// member the user renamed or edited is real data and is kept.
function stripLegacyDefaultMember(members) {
  if (!Array.isArray(members)) return members;
  return members.filter(m => !(
    m &&
    m.id === 1 &&
    m.name === 'Primary User' &&
    m.relationship === 'Self' &&
    m.age === 35 &&
    m.income === 200000 &&
    m.retirementAge === 60
  ));
}

function applyPersistedAppState(data = {}) {
  if (Array.isArray(data.assets)) appState.assets = data.assets;
  if (Array.isArray(data.liabilities)) appState.liabilities = data.liabilities;
  if (Array.isArray(data.goals)) appState.goals = data.goals;
  if (Array.isArray(data.familyMembers)) {
    const cleaned = stripLegacyDefaultMember(data.familyMembers);
    appState.familyMembers = cleaned;
    // If the ghost was removed, recompute the derived income fields so its
    // fake ₹2L doesn't linger in userProfile-based scores and reports.
    if (cleaned.length !== data.familyMembers.length && data.userProfile) {
      const income = cleaned.filter(m => m.isEarner).reduce((s, m) => s + (m.income || 0), 0);
      data.userProfile.monthlyIncome = income;
      data.userProfile.monthlyExpenses = Math.round(income * 0.6);
      data.userProfile.monthlySavings = Math.round(income * 0.4);
    }
  }
  if (data.familyViewMode) appState.familyViewMode = data.familyViewMode;
  if (data.settings) Object.assign(appState.settings, data.settings);
  if (data.userProfile) Object.assign(appState.userProfile, data.userProfile);
  if (Array.isArray(data.elderCare)) appState.elderCare = data.elderCare;
  if (Array.isArray(data.educationPlans)) appState.educationPlans = data.educationPlans;
  if (data.estatePlan) appState.estatePlan = data.estatePlan;
  if (data.taxOptimization) appState.taxOptimization = data.taxOptimization;
  if (data.reports) appState.reports = { ...(appState.reports || {}), ...data.reports };
}

function getCloudPersistencePayload() {
  let aiWallet = {};
  let reportQuota = {};
  let aiProfile = {};

  try {
    aiWallet = JSON.parse(localStorage.getItem(CHAT_LIMITS.storageKey) || '{}');
  } catch {}

  try {
    reportQuota = JSON.parse(localStorage.getItem(REPORT_LIMITS.storageKey) || '{}');
  } catch {}

  try {
    aiProfile = JSON.parse(localStorage.getItem('gini_user_profile_v2') || '{}');
  } catch {}

  // Ride the Pro plan along inside app_state so a purchase follows the
  // account across devices (no schema change needed on the Supabase table).
  const persistableState = getPersistableAppState();
  try {
    const proPlan = JSON.parse(localStorage.getItem('gini_plan_v1') || 'null');
    if (proPlan?.tier === 'pro') persistableState.proPlan = proPlan;
  } catch {}

  return {
    appState: persistableState,
    aiWallet,
    reportQuota,
    aiProfile
  };
}

function applyCloudPersistencePayload(data = {}) {
  if (data.app_state) applyPersistedAppState(data.app_state);

  // Restore a Pro plan bought on another device. Keep whichever record
  // (local vs cloud) was activated most recently.
  try {
    const cloudPlan = data.app_state?.proPlan;
    if (cloudPlan?.tier === 'pro') {
      const local = JSON.parse(localStorage.getItem('gini_plan_v1') || 'null');
      if (!local || (cloudPlan.activatedAt || 0) >= (local.activatedAt || 0)) {
        localStorage.setItem('gini_plan_v1', JSON.stringify(cloudPlan));
      }
      window.GiniPlan?.refreshUi?.();
    }
  } catch (error) {
    console.warn('[Gini] Could not restore Pro plan from cloud:', error);
  }

  try {
    if (data.ai_wallet && Object.keys(data.ai_wallet).length > 0) {
      localStorage.setItem(CHAT_LIMITS.storageKey, JSON.stringify(data.ai_wallet));
    }
    if (data.report_quota && Object.keys(data.report_quota).length > 0) {
      localStorage.setItem(REPORT_LIMITS.storageKey, JSON.stringify(data.report_quota));
    }
    if (data.ai_profile && Object.keys(data.ai_profile).length > 0) {
      localStorage.setItem('gini_user_profile_v2', JSON.stringify(data.ai_profile));
    }
  } catch (error) {
    console.warn('[Gini] Could not apply cloud local data:', error);
  }
}

function refreshGiniViews() {
  try {
    networth.renderAssets();
    networth.renderLiabilities();
    networth.updateSummary();
    goals.renderGoals();
    familySettings.renderFamilyMembers && familySettings.renderFamilyMembers();
    familySettings.renderHouseholdSummary && familySettings.renderHouseholdSummary();
    dashboard.refresh();
    if (document.getElementById('reports-tab')?.classList.contains('active')) {
      reports.render && reports.render();
    }
  } catch (error) {
    console.warn('[Gini] Could not refresh all views:', error);
  }
}

function createDataBackup() {
  try {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        ...getPersistableAppState()
      }
    };
    
    // Store up to 5 backups in localStorage
    const backups = JSON.parse(localStorage.getItem('giniBackups') || '[]');
    backups.unshift(backup);
    
    if (backups.length > 5) {
      backups.pop(); // Keep only last 5 backups
    }
    
    localStorage.setItem('giniBackups', JSON.stringify(backups));
    console.log('[Backup] Auto-backup created successfully');
    return true;
  } catch (e) {
    console.warn('[Backup] Failed to create backup:', e);
    return false;
  }
}

function getBackupsList() {
  try {
    return JSON.parse(localStorage.getItem('giniBackups') || '[]');
  } catch (e) {
    console.warn('[Backup] Failed to load backups:', e);
    return [];
  }
}

function restoreFromBackup(backupIndex) {
  try {
    const backups = getBackupsList();
    if (!backups[backupIndex]) {
      throw new Error('Backup not found');
    }
    
    const backup = backups[backupIndex];
    const { data } = backup;
    
    // Restore all data
    appState.assets = data.assets || [];
    appState.liabilities = data.liabilities || [];
    appState.goals = data.goals || [];
    appState.familyMembers = data.familyMembers || [];
    appState.userProfile = data.userProfile || {};
    Object.assign(appState.settings, data.settings || {});
    
    // Update storage
    saveAppStateToStorage();
    
    console.log('[Backup] Restored from backup:', backup.timestamp);
    return true;
  } catch (e) {
    console.error('[Backup] Failed to restore:', e);
    return false;
  }
}

function exportDataAsJSON() {
  try {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        assets: appState.assets || [],
        liabilities: appState.liabilities || [],
        goals: appState.goals || [],
        familyMembers: appState.familyMembers || [],
        userProfile: appState.userProfile || {},
        settings: appState.settings || {}
      }
    };
    
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gini-backup-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('[Backup] Data exported successfully');
    return true;
  } catch (e) {
    console.error('[Backup] Failed to export:', e);
    return false;
  }
}

function importDataFromJSON(file) {
  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const importData = JSON.parse(content);
      
      if (!importData.data) {
        throw new Error('Invalid backup file format');
      }
      
      const { data } = importData;
      
      // Restore all data
      appState.assets = data.assets || [];
      appState.liabilities = data.liabilities || [];
      appState.goals = data.goals || [];
      appState.familyMembers = data.familyMembers || [];
      appState.userProfile = data.userProfile || {};
      Object.assign(appState.settings, data.settings || {});
      
      // Update storage and UI
      saveAppStateToStorage();
      
      // Refresh all UI elements
      networth.renderAssets();
      networth.renderLiabilities();
      networth.updateSummary();
      goals.renderGoals();
      dashboard.refresh();
      
      console.log('[Backup] Data imported successfully');
      alert('OK Data imported successfully! Please refresh the page to see all updates.');
    };
    reader.readAsText(file);
  } catch (e) {
    console.error('[Backup] Failed to import:', e);
    alert('Error importing data: ' + e.message);
  }
}

// Save app state to localStorage for backup
async function saveAppStateToStorage(options = {}) {
  try {
    // Create backup before saving (rolling backups)
    createDataBackup();
    
    const appStatePayload = getPersistableAppState();
    localStorage.setItem('giniAppState', JSON.stringify(appStatePayload));

    if (window.GiniAuth?.isLoggedIn?.()) {
      if (options.immediateCloudSync) {
        await window.GiniAuth.saveUserData(getCloudPersistencePayload());
      } else {
        window.GiniAuth.scheduleSave(getCloudPersistencePayload);
      }
    }
  } catch (e) {
    console.warn('[Gini] Could not save state to storage:', e);
  }
}

// Load app state from localStorage
async function loadAppStateFromStorage() {
  try {
    if (window.GiniAuth?.isLoggedIn?.()) {
      const cloudData = await window.GiniAuth.loadUserData();
      if (cloudData) {
        applyCloudPersistencePayload(cloudData);
        return;
      }
    }

    const saved = localStorage.getItem('giniAppState');
    if (saved) {
      const data = JSON.parse(saved);
      applyPersistedAppState(data);
    }
  } catch (e) {
    console.warn('[Gini] Could not load state from storage:', e);
  }
}

// Export save function for backup system
window.saveAppStateToStorage = saveAppStateToStorage;
window.loadAppStateFromStorage = loadAppStateFromStorage;
window.refreshGiniViews = refreshGiniViews;
window.getCloudPersistencePayload = getCloudPersistencePayload;
window.getGiniAITokenBalanceLabel = getGiniAITokenBalanceLabel;

// Make functions globally accessible for onclick handlers
window.networth = networth;
window.goals = goals;

// Risk toggle buttons functionality
document.querySelectorAll('.risk-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.risk-btn').forEach(b => b.classList.remove('risk-btn--active'));
    btn.classList.add('risk-btn--active');
    const riskInput = document.getElementById('riskTolerance');
    if (riskInput) riskInput.value = btn.dataset.risk;
  });
});

// -----------------------------------------------------------------------------
// Merged landing page logic
// -----------------------------------------------------------------------------
/* ═══════════════════════════════════════════════════════════════════════
   XTIN GINI - UNIFIED LANDING PAGE JS LOGIC
   Manages interactive state, calculations, and syncs to localStorage.
   ═══════════════════════════════════════════════════════════════════════ */

function initLandingPage() {
    if (!document.getElementById('landing-page')) return;
    const landingPage = document.getElementById('landing-page');
    const dashboardEntry = document.getElementById('dashboard-entry');

    function openDashboard() {
        document.body.classList.remove('landing-active');
        if (dashboardEntry) {
            dashboardEntry.scrollIntoView({ behavior: 'auto', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
    }

    function returnToLanding() {
        document.body.classList.add('landing-active');
        history.replaceState(null, '', window.location.pathname);
        window.scrollTo({ top: 0, behavior: 'auto' });
    }
    // Expose globally so sidebar "Xtin Gini" link can trigger it
    window.returnToLandingPage = returnToLanding;

    // Always show landing page on fresh load / refresh
    document.body.classList.add('landing-active');
    window.scrollTo({ top: 0, behavior: 'auto' });

    // Wire up the Return to Landing button
    const returnToLandingBtn = document.getElementById('returnToLandingBtn');
    if (returnToLandingBtn) {
        returnToLandingBtn.addEventListener('click', returnToLanding);
    }

    if (window.location.hash === '#dashboard-entry') {
        openDashboard();
    } else {
        document.body.classList.add('landing-active');
        window.scrollTo({ top: 0, behavior: 'auto' });
    }

    landingPage.querySelectorAll('a[href="#dashboard-entry"]').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            history.replaceState(null, '', '#dashboard-entry');
            openDashboard();
        });
    });
    // ---------------------------------------------------------
    // 1. STATE MANAGEMENT
    // ---------------------------------------------------------
    // Use the global appState (already loaded by main DOMContentLoaded init)
    // so landing page reads/writes the same object as the dashboard.
    let editingMemberId = null;
    let editingGoalId = null;

    // ---------------------------------------------------------
    // STATE: use the global appState already loaded by the main
    // DOMContentLoaded initialiser — no separate copy, no race.
    // ---------------------------------------------------------
    function loadState() {
        // Global appState is already populated by loadAppStateFromStorage().
        // Just guard against missing arrays so landing page never crashes.
        if (!Array.isArray(appState.familyMembers)) appState.familyMembers = [];
        if (!Array.isArray(appState.goals))          appState.goals          = [];
        if (!Array.isArray(appState.assets))         appState.assets         = [];
        if (!Array.isArray(appState.liabilities))    appState.liabilities    = [];
        if (!appState.userProfile) appState.userProfile = {
            currentAge: 0, retirementAge: 60, monthlyIncome: 0,
            monthlyExpenses: 0, monthlySavings: 0, lifeExpectancy: 85
        };
    }

    // Save: sync derived fields then persist via the same localStorage key.
    function saveState() {
        try {
            const selfMember = appState.familyMembers.find(m => m.relationship === 'Self');
            if (selfMember) {
                appState.userProfile.currentAge    = selfMember.age;
                appState.userProfile.retirementAge = selfMember.retirementAge;
            }
            const totalIncome = appState.familyMembers
                .filter(m => m.isEarner)
                .reduce((sum, m) => sum + m.income, 0);
            appState.userProfile.monthlyIncome    = totalIncome;
            appState.userProfile.monthlyExpenses  = Math.round(totalIncome * 0.6);
            appState.userProfile.monthlySavings   = Math.round(totalIncome * 0.4);
            // Persist via the shared helper: it serializes a safe, curated
            // payload (raw appState holds non-serializable Chart.js refs, which
            // previously made this throw) and syncs the cloud copy for
            // logged-in users so changes aren't reverted by stale cloud data.
            saveAppStateToStorage();
        } catch (e) {
            console.error('[Landing] Error saving state:', e);
        }
    }

    // ---------------------------------------------------------
    // 2. CURRENCY & CALCULATION HELPERS
    // ---------------------------------------------------------
    function formatCurrency(amount) {
        if (window.XtinRegion) return XtinRegion.formatMoney(amount);
        return '\u20B9' + Math.round(amount).toLocaleString('en-IN');
    }

    function calculateFutureValue(pv, rate, years) {
        return pv * Math.pow(1 + rate / 100, years);
    }

    function calculateRequiredSIP(futureValue, rate, years) {
        const monthlyRate = rate / 12 / 100;
        const months = Math.max(0, Math.floor(years * 12));
        if (months <= 0) return 0;
        if (monthlyRate === 0) return futureValue / months;
        // Due timing factor: payment at start of month
        const factor = ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        return futureValue / factor;
    }

    // ---------------------------------------------------------
    // 3. FAMILY MEMBERS MODULE
    // ---------------------------------------------------------
    const familyFormContainer = document.getElementById('landing-familyFormContainer');
    const familyCardsContainer = document.getElementById('landing-familyCardsContainer');
    const showFamilyFormBtn = document.getElementById('landing-showFamilyFormBtn');
    const saveFamilyBtn = document.getElementById('landing-saveFamilyBtn');
    const cancelFamilyBtn = document.getElementById('landing-cancelFamilyBtn');
    const goalAssignedToSelect = document.getElementById('landing-goalAssignedTo');

    // Stats Displays
    const householdIncomeDisplay = document.getElementById('landing-householdIncomeDisplay');
    const totalMembersDisplay = document.getElementById('landing-totalMembersDisplay');
    const activeEarnersDisplay = document.getElementById('landing-activeEarnersDisplay');
    const dependentsDisplay = document.getElementById('landing-dependentsDisplay');

    function updateFamilyStats() {
        const totalIncome = appState.familyMembers
            .filter(m => m.isEarner)
            .reduce((total, m) => total + m.income, 0);
        const totalMembers = appState.familyMembers.length;
        const activeEarners = appState.familyMembers.filter(m => m.isEarner).length;
        const dependents = appState.familyMembers.filter(m => m.isDependent).length;

        householdIncomeDisplay.textContent = formatCurrency(totalIncome);
        totalMembersDisplay.textContent = totalMembers;
        activeEarnersDisplay.textContent = activeEarners;
        dependentsDisplay.textContent = dependents;
    }

    function renderFamilyMembers(highlightId = null) {
        const currentSelected = goalAssignedToSelect.value;
        goalAssignedToSelect.innerHTML = '<option value="">Household</option>' +
            appState.familyMembers.map(m => `<option value="${m.id}">${escapeHtml(m.name)} (${m.relationship})</option>`).join('');
        goalAssignedToSelect.value = currentSelected;

        if (appState.familyMembers.length === 0) {
            familyCardsContainer.innerHTML = `
                <div class="empty-state-card empty-state-card--action">
                    <div class="empty-state-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="42" height="42">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <line x1="19" y1="8" x2="19" y2="14"></line>
                            <line x1="22" y1="11" x2="16" y2="11"></line>
                        </svg>
                    </div>
                    <p class="empty-state-title">Let's start with you</p>
                    <p class="empty-state-sub">Add yourself first — your age and income power every projection in Gini.</p>
                    <button class="btn btn--primary" id="landing-addSelfBtn">Add Yourself</button>
                </div>`;
            document.getElementById('landing-addSelfBtn')?.addEventListener('click', () => openFamilyForm('Self'));
            return;
        }

        familyCardsContainer.innerHTML = appState.familyMembers.map(member => {
            const isSelf = member.relationship === 'Self';
            const selfClass = isSelf ? 'self' : '';
            const isNew = highlightId !== null && member.id === highlightId;
            const roles = [member.isEarner ? 'Earner' : '', member.isDependent ? 'Dependent' : ''].filter(Boolean).join(' · ') || '—';
            return `
                <div class="family-card ${isNew ? 'family-card--new' : ''}" data-member-id="${member.id}">
                    <div class="family-card-header">
                        <div class="family-card-name">${escapeHtml(member.name)}</div>
                        <div class="family-card-relation ${selfClass}">${member.relationship}</div>
                    </div>
                    <div class="family-card-detail">
                        <span class="family-card-label">Age:</span>
                        <span class="family-card-val">${member.age} yrs</span>
                    </div>
                    <div class="family-card-detail">
                        <span class="family-card-label">Monthly Income:</span>
                        <span class="family-card-val">${formatCurrency(member.income)}</span>
                    </div>
                    <div class="family-card-detail">
                        <span class="family-card-label">Retirement Age:</span>
                        <span class="family-card-val">${member.retirementAge} yrs</span>
                    </div>
                    <div class="family-card-detail">
                        <span class="family-card-label">Role:</span>
                        <span class="family-card-val">${roles}</span>
                    </div>
                    <div class="family-card-actions">
                        <button class="btn btn--sm btn--secondary edit-member-btn" data-id="${member.id}">Edit</button>
                        ${isSelf ? '' : `<button class="btn btn--sm btn--outline delete-member-btn" data-id="${member.id}">Delete</button>`}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Single delegated listener — survives re-renders, no duplicate handlers.
    familyCardsContainer.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-member-btn');
        if (editBtn) { editFamilyMember(parseInt(editBtn.dataset.id)); return; }
        const deleteBtn = e.target.closest('.delete-member-btn');
        if (deleteBtn) { deleteFamilyMember(parseInt(deleteBtn.dataset.id)); }
    });

    // --- Form validation helpers (inline errors instead of alert()) ---
    function setFieldError(inputId, message) {
        const input = document.getElementById(inputId);
        if (!input) return;
        const group = input.closest('.form-group');
        if (!group) return;
        group.classList.add('form-group--error');
        let slot = group.querySelector('.form-error-msg');
        if (!slot) {
            slot = document.createElement('div');
            slot.className = 'form-error-msg';
            group.appendChild(slot);
        }
        slot.textContent = message;
    }

    function clearFieldErrors(container) {
        container.querySelectorAll('.form-group--error').forEach(g => g.classList.remove('form-group--error'));
        container.querySelectorAll('.form-error-msg').forEach(s => s.remove());
    }

    // Clear a field's error as soon as the user starts fixing it
    familyFormContainer.addEventListener('input', (e) => {
        const group = e.target.closest('.form-group--error');
        if (group) {
            group.classList.remove('form-group--error');
            group.querySelector('.form-error-msg')?.remove();
        }
    });

    // Smart defaults per relationship — a layman shouldn't have to think
    // about earner/dependent flags; we pre-fill sensible values.
    const RELATIONSHIP_DEFAULTS = {
        Self:    { age: 30, retirementAge: 60, isEarner: true,  isDependent: false },
        Spouse:  { age: 30, retirementAge: 60, isEarner: true,  isDependent: false },
        Child:   { age: 8,  retirementAge: 60, isEarner: false, isDependent: true  },
        Parent:  { age: 60, retirementAge: 62, isEarner: false, isDependent: true  },
        Sibling: { age: 28, retirementAge: 60, isEarner: true,  isDependent: false },
        Other:   { age: 30, retirementAge: 60, isEarner: false, isDependent: true  }
    };

    function applyRelationshipDefaults(relationship) {
        const d = RELATIONSHIP_DEFAULTS[relationship] || RELATIONSHIP_DEFAULTS.Other;
        document.getElementById('landing-memberAge').value = d.age;
        document.getElementById('landing-memberRetirementAge').value = d.retirementAge;
        document.getElementById('landing-memberIsEarner').checked = d.isEarner;
        document.getElementById('landing-memberIsDependent').checked = d.isDependent;
        if (!d.isEarner) document.getElementById('landing-memberIncome').value = 0;
    }

    function openFamilyForm(presetRelationship) {
        editingMemberId = null;
        clearFieldErrors(familyFormContainer);
        const hasSelf = appState.familyMembers.some(m => m.relationship === 'Self');
        const relationship = presetRelationship || (hasSelf ? 'Spouse' : 'Self');
        document.getElementById('landing-familyFormTitle').textContent =
            relationship === 'Self' ? 'Add Yourself' : 'Add Family Member';
        document.getElementById('landing-memberName').value = '';
        document.getElementById('landing-memberRelationship').value = relationship;
        document.getElementById('landing-memberIncome').value = '';
        applyRelationshipDefaults(relationship);
        saveFamilyBtn.textContent = 'Add Member';

        familyFormContainer.style.display = 'block';
        familyFormContainer.classList.remove('form-container--visible');
        requestAnimationFrame(() => familyFormContainer.classList.add('form-container--visible'));
        familyFormContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => document.getElementById('landing-memberName').focus(), 350);
    }

    function closeFamilyForm() {
        familyFormContainer.classList.remove('form-container--visible');
        familyFormContainer.style.display = 'none';
        clearFieldErrors(familyFormContainer);
        editingMemberId = null;
    }

    function editFamilyMember(id) {
        const member = appState.familyMembers.find(m => m.id === id);
        if (!member) return;

        editingMemberId = id;
        clearFieldErrors(familyFormContainer);
        document.getElementById('landing-familyFormTitle').textContent = `Edit ${member.name}`;
        document.getElementById('landing-memberName').value = member.name;
        document.getElementById('landing-memberRelationship').value = member.relationship;
        document.getElementById('landing-memberAge').value = member.age;
        document.getElementById('landing-memberIncome').value = member.income;
        document.getElementById('landing-memberRetirementAge').value = member.retirementAge;
        document.getElementById('landing-memberIsEarner').checked = member.isEarner;
        document.getElementById('landing-memberIsDependent').checked = member.isDependent;
        saveFamilyBtn.textContent = 'Save Changes';

        familyFormContainer.style.display = 'block';
        familyFormContainer.classList.remove('form-container--visible');
        requestAnimationFrame(() => familyFormContainer.classList.add('form-container--visible'));
        familyFormContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => document.getElementById('landing-memberName').focus(), 350);
    }

    function deleteFamilyMember(id) {
        const member = appState.familyMembers.find(m => m.id === id);
        if (!member) return;
        if (member.relationship === 'Self') {
            showAuthNotification('You are the primary user — edit your details instead of deleting.', 'error');
            return;
        }
        giniConfirm({
            title: `Remove ${member.name}?`,
            message: 'Their income and goals assignments will be removed from all projections. This cannot be undone.',
            confirmText: 'Remove Member',
            danger: true
        }, () => {
            appState.familyMembers = appState.familyMembers.filter(m => m.id !== id);
            saveState();
            updateFamilyStats();
            renderFamilyMembers();
            showAuthNotification(`${member.name} removed from your household.`, 'success');
        });
    }

    showFamilyFormBtn.addEventListener('click', () => openFamilyForm());

    cancelFamilyBtn.addEventListener('click', closeFamilyForm);

    // Re-apply smart defaults when relationship changes (add mode only —
    // never stomp values the user is editing on an existing member).
    document.getElementById('landing-memberRelationship').addEventListener('change', (e) => {
        if (editingMemberId === null) applyRelationshipDefaults(e.target.value);
    });

    // Keyboard support: Enter saves, Escape closes.
    familyFormContainer.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            saveFamilyBtn.click();
        } else if (e.key === 'Escape') {
            closeFamilyForm();
        }
    });

    saveFamilyBtn.addEventListener('click', () => {
        clearFieldErrors(familyFormContainer);

        const name = document.getElementById('landing-memberName').value.trim();
        const relationship = document.getElementById('landing-memberRelationship').value;
        const age = parseInt(document.getElementById('landing-memberAge').value);
        const income = parseFloat(document.getElementById('landing-memberIncome').value) || 0;
        const retirementAge = parseInt(document.getElementById('landing-memberRetirementAge').value) || 60;
        const isEarner = document.getElementById('landing-memberIsEarner').checked;
        const isDependent = document.getElementById('landing-memberIsDependent').checked;

        // Inline validation — collect every problem at once
        let hasError = false;
        if (!name) {
            setFieldError('landing-memberName', 'Please enter a name.');
            hasError = true;
        } else if (name.length > 50) {
            setFieldError('landing-memberName', 'Name must be 50 characters or fewer.');
            hasError = true;
        }
        if (isNaN(age) || age < 0 || age > 120) {
            setFieldError('landing-memberAge', 'Enter an age between 0 and 120.');
            hasError = true;
        }
        if (income < 0) {
            setFieldError('landing-memberIncome', 'Income cannot be negative.');
            hasError = true;
        }
        if (isEarner && !isNaN(age) && retirementAge < age) {
            setFieldError('landing-memberRetirementAge', `Retirement age must be at least ${age} (current age).`);
            hasError = true;
        }
        // Only one primary user allowed
        const selfConflict = relationship === 'Self' &&
            appState.familyMembers.some(m => m.relationship === 'Self' && m.id !== editingMemberId);
        if (selfConflict) {
            setFieldError('landing-memberRelationship', 'There is already a primary user. Choose a different relationship.');
            hasError = true;
        }
        if (hasError) {
            familyFormContainer.querySelector('.form-group--error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (editingMemberId !== null) {
            const mIndex = appState.familyMembers.findIndex(m => m.id === editingMemberId);
            if (mIndex > -1) {
                appState.familyMembers[mIndex] = {
                    ...appState.familyMembers[mIndex],
                    name, relationship, age, income, retirementAge, isEarner, isDependent
                };
            }
            saveState();
            updateFamilyStats();
            renderFamilyMembers(editingMemberId);
            closeFamilyForm();
            showAuthNotification(`${name}'s details updated.`, 'success');
        } else {
            // Free plan cap (GiniPlan lives in gini-premium.js)
            if (window.GiniPlan && !window.GiniPlan.canAddFamilyMember(appState.familyMembers.length)) {
                window.GiniPlan.showUpgradeModal('family');
                return;
            }
            const newId = Date.now();
            appState.familyMembers.push({
                id: newId,
                name, relationship, age, income, retirementAge, isEarner, isDependent,
                lifeExpectancy: 85, gender: 'Male', healthStatus: 'Good'
            });
            saveState();
            updateFamilyStats();
            renderFamilyMembers(newId);
            closeFamilyForm();
            const isFirst = appState.familyMembers.length === 1;
            showAuthNotification(
                isFirst ? `Welcome, ${name}! Your household is taking shape.` : `${name} added to your household.`,
                'success'
            );
            if (isEarner && income === 0) {
                setTimeout(() => showAuthNotification(`Tip: ${name} is marked as an earner with ₹0 income — edit to add income for accurate projections.`, 'error'), 900);
            }
        }
    });

    // ---------------------------------------------------------
    // 4. FINANCIAL GOALS MODULE
    // ---------------------------------------------------------
    const goalFormContainer = document.getElementById('landing-goalFormContainer');
    const goalsCardsContainer = document.getElementById('landing-goalsCardsContainer');
    const showGoalFormBtn = document.getElementById('landing-showGoalFormBtn');
    const saveGoalBtn = document.getElementById('landing-saveGoalBtn');
    const cancelGoalBtn = document.getElementById('landing-cancelGoalBtn');

    function renderGoals() {
        if (appState.goals.length === 0) {
            goalsCardsContainer.innerHTML = '<div class="empty-state-card"><p>No goals added yet. Add a financial milestone to begin.</p></div>';
            return;
        }

        const currentYear = new Date().getFullYear();
        goalsCardsContainer.innerHTML = appState.goals.map(goal => {
            const yearsRemaining = Math.max(0, goal.targetYear - currentYear);
            const futureCost = calculateFutureValue(goal.currentCost, goal.inflation, yearsRemaining);
            const saved = goal.saved || 0;
            const progressPercent = futureCost > 0 ? Math.min((saved / futureCost) * 100, 100) : 0;
            const sipRequired = yearsRemaining > 0 ? calculateRequiredSIP(futureCost - saved, goal.return, yearsRemaining) : 0;

            let status = 'on-track';
            let statusText = 'On Track';
            if (progressPercent < 30) {
                status = 'critical';
                statusText = 'Critical';
            } else if (progressPercent < 60) {
                status = 'needs-attention';
                statusText = 'Needs Attention';
            }

            const assignee = goal.assignedTo ? appState.familyMembers.find(m => m.id === goal.assignedTo) : null;
            const assigneeBadge = assignee ? `<span class="goal-assignment-badge goal-assignment-badge--for">For: ${assignee.name}</span>` : '';

            return `
                <div class="goal-card">
                    <div class="goal-header">
                        <div class="goal-title">
                            <span>${goal.name}</span>
                            ${assigneeBadge}
                        </div>
                        <div class="goal-priority ${goal.priority.toLowerCase()}">${goal.priority}</div>
                    </div>
                    <div class="goal-category" style="margin-bottom: 8px;">${goal.category}</div>
                    <div class="goal-details">
                        <div class="goal-detail-item">
                            <span class="goal-detail-label">Target Year:</span>
                            <span class="goal-detail-value">${goal.targetYear} (${yearsRemaining} yrs left)</span>
                        </div>
                        <div class="goal-detail-item">
                            <span class="goal-detail-label">Current Cost:</span>
                            <span class="goal-detail-value">${formatCurrency(goal.currentCost)}</span>
                        </div>
                        <div class="goal-detail-item">
                            <span class="goal-detail-label">Inflation Cost (FV):</span>
                            <span class="goal-detail-value">${formatCurrency(futureCost)}</span>
                        </div>
                        <div class="goal-detail-item">
                            <span class="goal-detail-label">Already Saved:</span>
                            <span class="goal-detail-value">${formatCurrency(saved)}</span>
                        </div>
                        <div class="goal-detail-item">
                            <span class="goal-detail-label">Monthly SIP Needed:</span>
                            <span class="goal-detail-value" style="color: var(--c-navy-900); font-weight: bold;">${formatCurrency(sipRequired)}</span>
                        </div>
                    </div>
                    <div class="goal-progress">
                        <div class="goal-progress-label">
                            <span>Saved Progress</span>
                            <span>${progressPercent.toFixed(1)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${status}" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                    <div class="goal-status ${status}">${statusText}</div>
                    <div class="goal-actions">
                        <button class="btn btn--sm btn--secondary edit-goal-btn" data-id="${goal.id}">Edit</button>
                        <button class="btn btn--sm btn--outline delete-goal-btn" data-id="${goal.id}">Delete</button>
                    </div>
                </div>
            `;
        }).join('');

        // Attach listeners
        document.querySelectorAll('.landing-page .edit-goal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => editGoal(parseInt(e.target.dataset.id)));
        });
        document.querySelectorAll('.landing-page .delete-goal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deleteGoal(parseInt(e.target.dataset.id)));
        });
    }

    function editGoal(id) {
        const goal = appState.goals.find(g => g.id === id);
        if (!goal) return;

        editingGoalId = id;
        document.getElementById('landing-goalFormTitle').textContent = 'Edit Goal';
        document.getElementById('landing-goalName').value = goal.name;
        document.getElementById('landing-goalCategory').value = goal.category;
        document.getElementById('landing-goalCurrentCost').value = goal.currentCost;
        document.getElementById('landing-goalTargetYear').value = goal.targetYear;
        document.getElementById('landing-goalPriority').value = goal.priority;
        document.getElementById('landing-goalInflation').value = goal.inflation;
        document.getElementById('landing-goalSaved').value = goal.saved;
        document.getElementById('landing-goalReturn').value = goal.return;
        document.getElementById('landing-goalAssignedTo').value = goal.assignedTo || '';

        goalFormContainer.style.display = 'block';
        goalFormContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function deleteGoal(id) {
        if (confirm('Are you sure you want to delete this goal?')) {
            appState.goals = appState.goals.filter(g => g.id !== id);
            saveState();
            renderGoals();
        }
    }

    showGoalFormBtn.addEventListener('click', () => {
        editingGoalId = null;
        document.getElementById('landing-goalFormTitle').textContent = 'Add Goal';
        document.getElementById('landing-goalName').value = '';
        document.getElementById('landing-goalCategory').value = 'Education';
        document.getElementById('landing-goalCurrentCost').value = '';
        document.getElementById('landing-goalTargetYear').value = '';
        document.getElementById('landing-goalPriority').value = 'Medium';
        document.getElementById('landing-goalInflation').value = '7';
        document.getElementById('landing-goalSaved').value = '';
        document.getElementById('landing-goalReturn').value = '12';
        document.getElementById('landing-goalAssignedTo').value = '';

        goalFormContainer.style.display = 'block';
        goalFormContainer.scrollIntoView({ behavior: 'smooth' });
    });

    cancelGoalBtn.addEventListener('click', () => {
        goalFormContainer.style.display = 'none';
    });

    saveGoalBtn.addEventListener('click', () => {
        const name = document.getElementById('landing-goalName').value.trim();
        const category = document.getElementById('landing-goalCategory').value;
        const currentCost = parseFloat(document.getElementById('landing-goalCurrentCost').value);
        const targetYear = parseInt(document.getElementById('landing-goalTargetYear').value);
        const priority = document.getElementById('landing-goalPriority').value;
        const inflation = parseFloat(document.getElementById('landing-goalInflation').value);
        const saved = parseFloat(document.getElementById('landing-goalSaved').value) || 0;
        const returnRate = parseFloat(document.getElementById('landing-goalReturn').value);
        const assignedToVal = document.getElementById('landing-goalAssignedTo').value;
        const assignedTo = assignedToVal ? parseInt(assignedToVal) : null;

        if (!name) {
            showAuthNotification('Please enter a goal name.', 'error');
            return;
        }
        if (isNaN(currentCost) || currentCost <= 0) {
            showAuthNotification('Current cost must be a positive number.', 'error');
            return;
        }
        const currentYear = new Date().getFullYear();
        if (isNaN(targetYear) || targetYear <= currentYear) {
            showAuthNotification(`Target year must be after ${currentYear}.`, 'error');
            return;
        }
        if (saved > currentCost) {
            showAuthNotification('Amount saved cannot exceed current cost.', 'error');
            return;
        }

        // Free plan cap on new goals
        if (editingGoalId === null &&
            window.GiniPlan && !window.GiniPlan.canAddGoal(appState.goals.length)) {
            window.GiniPlan.showUpgradeModal('goals');
            return;
        }

        const goalData = {
            id: editingGoalId !== null ? editingGoalId : Date.now(),
            name, category, currentCost, targetYear, priority, inflation, saved,
            return: returnRate, assignedTo, fundedBy: null, fundingSplit: 100
        };

        const wasEditingGoal = editingGoalId !== null;
        if (wasEditingGoal) {
            const gIndex = appState.goals.findIndex(g => g.id === editingGoalId);
            if (gIndex > -1) {
                appState.goals[gIndex] = goalData;
            }
        } else {
            appState.goals.push(goalData);
        }

        saveState();
        renderGoals();
        goalFormContainer.style.display = 'none';
        showAuthNotification(wasEditingGoal ? `Goal "${name}" updated.` : `Goal "${name}" added — Gini has calculated your required monthly SIP.`, 'success');
    });

    // ---------------------------------------------------------
    // 5. REPORT GENERATOR MODULE
    // ---------------------------------------------------------
    const generateReportBtn = document.getElementById('landing-generateReportBtn');
    const reportPreviewContainer = document.getElementById('landing-reportPreviewContainer');
    const reportPreviewContent = document.getElementById('landing-reportPreviewContent');
    const downloadReportPdfBtn = document.getElementById('landing-downloadReportPdfBtn');

    // Honest, earned score: an empty household scores 0, and every point
    // maps to a real financial action. The visible headroom (plus the
    // "raise your score" tips in the report) is what motivates users to
    // keep building — never a fake "Excellent" on day one.
    function calculateCompositeHealthScore() {
        const members = appState.familyMembers || [];
        if (members.length === 0) return 0;

        let score = 10; // household profile created

        // Income foundation (up to +25)
        const income = members.filter(m => m.isEarner).reduce((s, m) => s + (m.income || 0), 0);
        if (income > 0) {
            score += 15;
            const totalEMI = (appState.liabilities || []).reduce((s, l) => s + (l.emi || 0), 0);
            if ((totalEMI / income) * 100 < 40) score += 10; // healthy EMI burden
        }

        // Goals (up to +35): defined + funded
        const goals = appState.goals || [];
        if (goals.length > 0) {
            score += 10;
            let futureCost = 0, saved = 0;
            const currentYear = new Date().getFullYear();
            goals.forEach(g => {
                const years = Math.max(0, g.targetYear - currentYear);
                futureCost += calculateFutureValue(g.currentCost, g.inflation, years);
                saved += (g.saved || 0);
            });
            const funding = futureCost > 0 ? Math.min(saved / futureCost, 1) : 0;
            score += Math.round(funding * 25);
        }

        // Net worth (up to +30): tracked + positive + low leverage
        const assets = (appState.assets || []).reduce((s, a) => s + (a.value || 0), 0);
        const liabilities = (appState.liabilities || []).reduce((s, l) => s + (l.amount || 0), 0);
        if (assets > 0) {
            score += 10;
            if (assets - liabilities > 0) score += 10;
            if (liabilities / assets < 0.5) score += 10;
        }

        return Math.min(score, 100);
    }

    function getHealthRating(score) {
        if (score >= 85) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 55) return 'Fair';
        if (score >= 30) return 'Building';
        return 'Just Starting';
    }

    // Actionable next steps shown under the score — each maps 1:1 to
    // points in calculateCompositeHealthScore, so users always know how
    // to improve (and every tip deepens engagement with the app).
    function getScoreImprovementTips() {
        const tips = [];
        const members = appState.familyMembers || [];
        const income = members.filter(m => m.isEarner).reduce((s, m) => s + (m.income || 0), 0);
        if (members.length === 0) return ['Add yourself and your family members'];
        if (income <= 0) tips.push('Add monthly income for at least one earner');
        if ((appState.goals || []).length === 0) tips.push('Set your first financial goal');
        else {
            const currentYear = new Date().getFullYear();
            let futureCost = 0, saved = 0;
            appState.goals.forEach(g => {
                const years = Math.max(0, g.targetYear - currentYear);
                futureCost += calculateFutureValue(g.currentCost, g.inflation, years);
                saved += (g.saved || 0);
            });
            if (futureCost > 0 && saved / futureCost < 0.3) tips.push('Grow your goal funding — start the suggested SIPs');
        }
        if ((appState.assets || []).length === 0) tips.push('Track your assets in Net Worth');
        return tips.slice(0, 3);
    }

    function generateReportHTML(reportType, includeNW, includeG, includePort) {
        const healthScore = calculateCompositeHealthScore();
        const rating = getHealthRating(healthScore);
        const dateStr = new Date().toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // Circle stroke offset logic
        const strokeDashArray = `${healthScore}, 100`;

        let html = `
            <div class="report-sheet">
                <div class="report-title-block">
                    <h2>Xtin Gini Financial Blueprint</h2>
                    <p>Generated on ${dateStr} | ${reportType === 'family' ? 'Family Dynamics Report' : 'General Financial Report'}</p>
                </div>

                <!-- Score Section -->
                <div class="health-score-report-block">
                    <div class="health-gauge-container">
                        <svg viewBox="0 0 36 36" class="health-score-svg">
                            <path class="health-score-bg-ring" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path class="health-score-fill-ring" stroke-dasharray="${strokeDashArray}" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div class="health-gauge-text">
                            <span class="health-score-val-text">${healthScore}%</span>
                            <span class="health-score-label">${rating}</span>
                        </div>
                    </div>
                    <div class="health-score-desc-block">
                        <h5>Financial Health Score</h5>
                        <p>Every point is earned from real actions — income coverage, goal funding, net worth strength. Your current score indicates a <strong>${rating}</strong> baseline.</p>
                        ${healthScore < 85 ? `
                        <div class="report-score-tips">
                            <span class="report-score-tips__label">Raise your score:</span>
                            <ul>${getScoreImprovementTips().map(t => `<li>${t}</li>`).join('')}</ul>
                        </div>` : ''}
                    </div>
                </div>
        `;

        // ===== Shared computations for the detailed report =====
        const rptYear = new Date().getFullYear();
        const rptMembers = appState.familyMembers || [];
        const rptEarners = rptMembers.filter(m => m.isEarner);
        const rptDependents = rptMembers.filter(m => m.isDependent);
        const rptIncome = rptEarners.reduce((s, m) => s + (m.income || 0), 0);
        const rptAnnualIncome = rptIncome * 12;
        const rptAvgAge = rptMembers.length ? Math.round(rptMembers.reduce((s, m) => s + (m.age || 0), 0) / rptMembers.length) : 0;
        const rptExpenses = Math.round(rptIncome * 0.6);
        const rptSurplus = rptIncome - rptExpenses;
        const rptSavingsRate = rptIncome > 0 ? (rptSurplus / rptIncome) * 100 : 0;

        const rptAssets = appState.assets || [];
        const rptLiabilities = appState.liabilities || [];
        const rptGoals = appState.goals || [];
        const rptAssetSum = rptAssets.reduce((s, a) => s + (a.value || 0), 0);
        const rptTotalAssets = rptAssets.length ? rptAssetSum : rptGoals.reduce((s, g) => s + (g.saved || 0), 0);
        const rptTotalLiab = rptLiabilities.reduce((s, l) => s + (l.amount || 0), 0);
        const rptTotalEMI = rptLiabilities.reduce((s, l) => s + (l.emi || 0), 0);
        const rptNetWorth = rptTotalAssets - rptTotalLiab;

        const rptWeightedReturn = rptAssetSum > 0
            ? rptAssets.reduce((s, a) => s + (a.value || 0) * (a.return || 0), 0) / rptAssetSum
            : 0;

        let rptFutureCost = 0, rptSaved = 0, rptSIP = 0, rptOnTrack = 0;
        rptGoals.forEach(g => {
            const yrs = Math.max(0, g.targetYear - rptYear);
            const fv = calculateFutureValue(g.currentCost, g.inflation, yrs);
            const sv = g.saved || 0;
            const sip = yrs > 0 ? calculateRequiredSIP(Math.max(0, fv - sv), g.return, yrs) : 0;
            rptFutureCost += fv; rptSaved += sv; rptSIP += Math.max(0, sip);
            if (fv > 0 && sv / fv >= 0.3) rptOnTrack += 1;
        });
        const rptGoalFunding = rptFutureCost > 0 ? (rptSaved / rptFutureCost) * 100 : 0;

        const rptDebtToAsset = rptTotalAssets > 0 ? (rptTotalLiab / rptTotalAssets) * 100 : 0;
        const rptEmiToIncome = rptIncome > 0 ? (rptTotalEMI / rptIncome) * 100 : 0;
        const rptLiquid = rptAssets
            .filter(a => /cash|fixed deposit|\bfd\b|emergency|savings|liquid/i.test(a.category || ''))
            .reduce((s, a) => s + (a.value || 0), 0);
        const rptEmergencyMonths = rptExpenses > 0 ? rptLiquid / rptExpenses : 0;
        const rptKpiColor = (v) => v >= 0 ? 'var(--c-green-700)' : 'var(--c-red-600)';

        // ===== Executive Summary =====
        html += `
            <h3>Executive Summary</h3>
            <p class="report-narrative">This blueprint consolidates a household of <strong>${rptMembers.length}</strong> member${rptMembers.length === 1 ? '' : 's'} (${rptEarners.length} earning, ${rptDependents.length} dependent), <strong>${rptAssets.length}</strong> tracked asset${rptAssets.length === 1 ? '' : 's'}, <strong>${rptLiabilities.length}</strong> liabilit${rptLiabilities.length === 1 ? 'y' : 'ies'}, and <strong>${rptGoals.length}</strong> financial goal${rptGoals.length === 1 ? '' : 's'} into one view.</p>
            <div class="report-metrics-grid">
                <div class="report-metric"><span class="report-metric__label">Net Worth</span><span class="report-metric__value" style="color:${rptKpiColor(rptNetWorth)};">${formatCurrency(rptNetWorth)}</span></div>
                <div class="report-metric"><span class="report-metric__label">Total Assets</span><span class="report-metric__value">${formatCurrency(rptTotalAssets)}</span></div>
                <div class="report-metric"><span class="report-metric__label">Total Liabilities</span><span class="report-metric__value">${formatCurrency(rptTotalLiab)}</span></div>
                <div class="report-metric"><span class="report-metric__label">Monthly Income</span><span class="report-metric__value">${formatCurrency(rptIncome)}</span></div>
                <div class="report-metric"><span class="report-metric__label">Est. Investable Surplus</span><span class="report-metric__value">${formatCurrency(Math.max(0, rptSurplus - rptTotalEMI))}</span></div>
                <div class="report-metric"><span class="report-metric__label">Monthly EMI Outgo</span><span class="report-metric__value">${formatCurrency(rptTotalEMI)}</span></div>
                <div class="report-metric"><span class="report-metric__label">Active Goals</span><span class="report-metric__value">${rptGoals.length}</span></div>
                <div class="report-metric"><span class="report-metric__label">Total Monthly SIP Need</span><span class="report-metric__value">${formatCurrency(rptSIP)}</span></div>
            </div>

        `;

        if (reportType === 'family') {
            // ===== FAMILY DYNAMICS REPORT: dependency, timelines, protection =====
            const fdEarnersSorted = [...rptEarners].sort((a, b) => (b.income || 0) - (a.income || 0));
            const fdTopShare = rptIncome > 0 && fdEarnersSorted.length
                ? Math.round(((fdEarnersSorted[0].income || 0) / rptIncome) * 100) : 0;

            html += `
                <h3>Income Dependency Analysis</h3>
                <p class="report-narrative">${
                    fdTopShare >= 70 && rptMembers.length > 1
                        ? `<strong>${fdTopShare}%</strong> of household income depends on <strong>${escapeHtml(fdEarnersSorted[0].name)}</strong>. A single income shock would affect the entire family — adequate term insurance and an emergency fund are critical.`
                        : rptEarners.length > 1
                            ? `Income is shared across ${rptEarners.length} earners — a healthy structure that cushions the household against a single income loss.`
                            : `The household currently runs on one income. As it grows, a second earning stream or stronger protection reduces family-wide risk.`
                }</p>
                <table class="report-table">
                    <thead><tr><th>Member</th><th>Monthly Income</th><th>Share of Household</th></tr></thead>
                    <tbody>
                        ${fdEarnersSorted.map(m => `
                            <tr>
                                <td><strong>${escapeHtml(m.name)}</strong> (${m.relationship})</td>
                                <td style="text-align:right;">${formatCurrency(m.income || 0)}</td>
                                <td style="text-align:right;font-weight:600;">${rptIncome > 0 ? Math.round(((m.income || 0) / rptIncome) * 100) : 0}%</td>
                            </tr>`).join('')}
                    </tbody>
                </table>

                <h3>Life-Stage Timeline</h3>
                <table class="report-table">
                    <thead><tr><th>Member</th><th>Current Age</th><th>Milestone</th><th>Years Away</th></tr></thead>
                    <tbody>
                        ${rptMembers.map(m => {
                            const isChild = m.relationship === 'Child';
                            const milestone = isChild ? 'Financial independence (est. age 22)' : `Retirement at ${m.retirementAge}`;
                            const yearsAway = isChild ? Math.max(0, 22 - (m.age || 0)) : Math.max(0, (m.retirementAge || 60) - (m.age || 0));
                            return `
                            <tr>
                                <td><strong>${escapeHtml(m.name)}</strong></td>
                                <td>${m.age} yrs</td>
                                <td>${milestone}</td>
                                <td style="text-align:right;font-weight:600;">${yearsAway} yrs (${rptYear + yearsAway})</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
                <p class="report-note">Earners approaching retirement within 10 years should be shifting goal portfolios toward lower-risk assets.</p>

                <h3>Family Protection Check</h3>
                <table class="report-table">
                    <thead><tr><th>Earner</th><th>Annual Income</th><th>Suggested Term Cover (~12×)</th></tr></thead>
                    <tbody>
                        ${fdEarnersSorted.map(m => `
                            <tr>
                                <td><strong>${escapeHtml(m.name)}</strong></td>
                                <td style="text-align:right;">${formatCurrency((m.income || 0) * 12)}</td>
                                <td style="text-align:right;font-weight:600;">${formatCurrency((m.income || 0) * 12 * 12)}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
                <p class="report-note">Rule-of-thumb guidance only: 10–15× annual income in pure term cover per earner, more when dependents or large loans exist.</p>
            `;
        } else {
            // ===== GENERAL FINANCIAL REPORT: income & cash flow =====
            html += `
            <h3>Income &amp; Cash Flow Analysis</h3>
            <table class="report-table">
                <tbody>
                    <tr><td><strong>Total Household Monthly Income</strong></td><td style="text-align:right;font-weight:600;">${formatCurrency(rptIncome)}</td></tr>
                    <tr><td>Estimated Monthly Expenses (~60%)</td><td style="text-align:right;">${formatCurrency(rptExpenses)}</td></tr>
                    <tr><td>Existing Loan EMIs</td><td style="text-align:right;color:var(--c-red-600);">${formatCurrency(rptTotalEMI)}</td></tr>
                    <tr style="background:var(--c-grey-50);"><td><strong>Estimated Investable Surplus</strong></td><td style="text-align:right;font-weight:700;color:${rptKpiColor(rptSurplus - rptTotalEMI)};">${formatCurrency(rptSurplus - rptTotalEMI)}</td></tr>
                    <tr><td>Annual Household Income</td><td style="text-align:right;">${formatCurrency(rptAnnualIncome)}</td></tr>
                </tbody>
            </table>
            <p class="report-note">Expense and surplus figures are modelled estimates (60% expense / 40% savings) used when detailed spending isn't entered.</p>
        `;
        }

        // ===== Household Demographics (always included) =====
        {
            html += `
                <h3>Household Demographics</h3>
                <p class="report-narrative">Average household age is <strong>${rptAvgAge}</strong>. ${rptEarners.length} member${rptEarners.length === 1 ? '' : 's'} contribute income; ${rptDependents.length} ${rptDependents.length === 1 ? 'is a dependent' : 'are dependents'}.</p>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Relationship</th>
                            <th>Age</th>
                            <th>Monthly Income</th>
                            <th>Retirement Age</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            appState.familyMembers.forEach(m => {
                html += `
                    <tr>
                        <td><strong>${m.name}</strong></td>
                        <td>${m.relationship}</td>
                        <td>${m.age} yrs</td>
                        <td>${formatCurrency(m.income)}</td>
                        <td>${m.retirementAge} yrs</td>
                        <td>${m.isEarner ? 'Earner' : ''} ${m.isDependent ? 'Dependent' : ''}</td>
                    </tr>
                `;
            });
            html += `
                    </tbody>
                </table>
            `;
        }

        if (includeNW) {
            const totalIncome = appState.familyMembers
                .filter(m => m.isEarner)
                .reduce((total, m) => total + m.income, 0);

            // Use real assets & liabilities from the dashboard, fall back to
            // goals-saved sum if the user hasn't filled those sections yet.
            const totalAssets = appState.assets && appState.assets.length > 0
                ? appState.assets.reduce((sum, a) => sum + (a.value || 0), 0)
                : appState.goals.reduce((sum, g) => sum + (g.saved || 0), 0);

            const totalLiabilities = appState.liabilities && appState.liabilities.length > 0
                ? appState.liabilities.reduce((sum, l) => sum + (l.amount || 0), 0)
                : 0;

            const netWorth = totalAssets - totalLiabilities;

            html += `
                <h3>Net Worth & Cash Flow Summary</h3>
                <table class="report-table">
                    <tbody>
                        <tr>
                            <td><strong>Total Household Monthly Income</strong></td>
                            <td style="text-align: right; font-weight: 600;">${formatCurrency(totalIncome)}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Assets</strong></td>
                            <td style="text-align: right; font-weight: 600; color: var(--c-green-700);">${formatCurrency(totalAssets)}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Liabilities / Debts</strong></td>
                            <td style="text-align: right; font-weight: 600; color: var(--c-red-600);">${formatCurrency(totalLiabilities)}</td>
                        </tr>
                        <tr style="background-color: var(--c-grey-50);">
                            <td><strong>Net Worth</strong></td>
                            <td style="text-align: right; font-weight: 700; font-size: var(--font-size-base); color: ${netWorth >= 0 ? 'var(--c-green-700)' : 'var(--c-red-600)'};">${formatCurrency(netWorth)}</td>
                        </tr>
                    </tbody>
                </table>
            `;
        }

        if (includeG) {
            html += `
                <h3>Milestone Feasibility & Savings Requirements</h3>
            `;
            if (appState.goals.length === 0) {
                html += '<p>No goals defined yet. Plan your goals to see detailed savings targets.</p>';
            } else {
                html += `
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Goal Name</th>
                                <th>Category</th>
                                <th>Target</th>
                                <th>Future Cost</th>
                                <th>Saved Amount</th>
                                <th>Monthly SIP Required</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                const currentYear = new Date().getFullYear();
                appState.goals.forEach(goal => {
                    const yearsRemaining = Math.max(0, goal.targetYear - currentYear);
                    const futureCost = calculateFutureValue(goal.currentCost, goal.inflation, yearsRemaining);
                    const saved = goal.saved || 0;
                    const sipRequired = yearsRemaining > 0 ? calculateRequiredSIP(futureCost - saved, goal.return, yearsRemaining) : 0;
                    const progressPercent = futureCost > 0 ? Math.min((saved / futureCost) * 100, 100) : 0;
                    
                    let statusColor = 'var(--c-green-600)';
                    let statusLabel = 'On Track';
                    if (progressPercent < 30) {
                        statusColor = 'var(--c-red-600)';
                        statusLabel = 'Critical';
                    } else if (progressPercent < 60) {
                        statusColor = 'var(--c-amber-600)';
                        statusLabel = 'Needs attention';
                    }

                    html += `
                        <tr>
                            <td><strong>${goal.name}</strong></td>
                            <td>${goal.category}</td>
                            <td>Year ${goal.targetYear} (${yearsRemaining} yrs)</td>
                            <td>${formatCurrency(futureCost)}</td>
                            <td>${formatCurrency(saved)} (${progressPercent.toFixed(1)}%)</td>
                            <td style="font-weight: 600;">${formatCurrency(sipRequired)}</td>
                            <td style="color: ${statusColor}; font-weight: bold;">${statusLabel}</td>
                        </tr>
                    `;
                });
                html += `
                        </tbody>
                    </table>
                `;
            }
        }

        if (includePort) {
            const totalAssets = appState.assets && appState.assets.length > 0
                ? appState.assets.reduce((sum, a) => sum + (a.value || 0), 0)
                : appState.goals.reduce((sum, g) => sum + (g.saved || 0), 0);

            if (appState.assets && appState.assets.length > 0) {
                html += `<h3>Portfolio Summary</h3><table class="report-table"><thead><tr><th>Asset</th><th>Category</th><th>Value</th><th>Expected Return</th></tr></thead><tbody>`;
                appState.assets.forEach(a => {
                    html += `<tr><td><strong>${a.name}</strong></td><td>${a.category || '—'}</td><td style="text-align:right;">${formatCurrency(a.value || 0)}</td><td style="text-align:right;">${a.return || 0}%</td></tr>`;
                });
                html += `<tr style="background:var(--c-grey-50);"><td colspan="2"><strong>Total Portfolio Value</strong></td><td style="text-align:right;font-weight:700;">${formatCurrency(totalAssets)}</td><td></td></tr>`;
                html += `</tbody></table>`;
            } else {
                html += `
                    <h3>Portfolio Summary</h3>
                    <p>Your combined financial asset tracking has mapped a total allocation value of <strong>${formatCurrency(totalAssets)}</strong>. Move into the full Gini dashboard to add assets, real estate holdings, and debt profiles for a complete picture.</p>
                `;
            }
        }

        // Action Items / Recommendations
        html += `
            <h3>Recommended Actions</h3>
            <ul class="recommendations-list">
        `;

        const netWorth = (() => {
            const assets = appState.assets && appState.assets.length > 0
                ? appState.assets.reduce((s, a) => s + (a.value || 0), 0)
                : appState.goals.reduce((s, g) => s + (g.saved || 0), 0);
            const liabilities = appState.liabilities
                ? appState.liabilities.reduce((s, l) => s + (l.amount || 0), 0)
                : 0;
            return assets - liabilities;
        })();
        if (netWorth === 0) {
            html += `
                <li class="rec-item high">
                    <span class="rec-badge high">High</span>
                    <div class="rec-msg"><strong>Accumulation Start:</strong> Set up a baseline savings plan. Currently, you have zero assets tracked. Initiate a low-risk automated monthly deposit.</div>
                </li>
            `;
        }

        // Filter critical goals
        const currentYear = new Date().getFullYear();
        const criticalCount = appState.goals.filter(g => {
            const years = Math.max(0, g.targetYear - currentYear);
            const fv = calculateFutureValue(g.currentCost, g.inflation, years);
            return (g.saved / fv) < 0.3;
        }).length;

        if (criticalCount > 0) {
            html += `
                <li class="rec-item high">
                    <span class="rec-badge high">High</span>
                    <div class="rec-msg"><strong>Milestone Urgency:</strong> ${criticalCount} of your goals are critically underfunded. Review your target years or increase your SIP contribution splits to ensure feasibility.</div>
                </li>
            `;
        }

        // General recommendations
        if (appState.familyMembers.length > 2) {
            html += `
                <li class="rec-item medium">
                    <span class="rec-badge medium">Medium</span>
                    <div class="rec-msg"><strong>Comprehensive Cover:</strong> With a multi-member household, ensure term insurance and family-floater medical coverage are active to protect dependents.</div>
                </li>
            `;
        }

        html += `
                <li class="rec-item low">
                    <span class="rec-badge low">Low</span>
                    <div class="rec-msg"><strong>Emergency Reserves:</strong> Secure liquid Cash and Fixed Deposits equal to at least 6 months of household expenses (approx. ${formatCurrency(appState.userProfile.monthlyExpenses * 6)}) before aggressive investing.</div>
                </li>
            </ul>
        `;

        // ===== Retirement Snapshot =====
        if (rptEarners.length > 0) {
            html += `
                <h3>Retirement Snapshot</h3>
                <table class="report-table">
                    <thead><tr><th>Member</th><th>Current Age</th><th>Retirement Age</th><th>Years Left</th><th>Est. Corpus Needed</th></tr></thead>
                    <tbody>
            `;
            rptEarners.forEach(m => {
                const yrsLeft = Math.max(0, (m.retirementAge || 60) - (m.age || 0));
                const corpus = (m.income || 0) * 12 * 0.7 * 25;
                html += `<tr><td><strong>${m.name}</strong></td><td>${m.age} yrs</td><td>${m.retirementAge || 60} yrs</td><td>${yrsLeft} yrs</td><td style="text-align:right;">${formatCurrency(corpus)}</td></tr>`;
            });
            html += `
                    </tbody>
                </table>
                <p class="report-note">Corpus estimates assume 70% income replacement and the 25x annual-expense rule. Use the dashboard retirement planner for inflation-adjusted projections.</p>
            `;
        }

        // ===== Key Financial Ratios =====
        const rptRatioRow = (label, valueText, good) =>
            `<tr><td>${label}</td><td style="text-align:right;font-weight:600;">${valueText}</td><td style="font-weight:600;color:${good ? 'var(--c-green-700)' : 'var(--c-amber-600)'};">${good ? 'Healthy' : 'Review'}</td></tr>`;
        html += `
            <h3>Key Financial Ratios</h3>
            <table class="report-table">
                <thead><tr><th>Ratio</th><th>Value</th><th>Assessment</th></tr></thead>
                <tbody>
                    ${rptRatioRow('Savings Rate', rptSavingsRate.toFixed(0) + '%', rptSavingsRate >= 20)}
                    ${rptRatioRow('Debt-to-Asset Ratio', rptDebtToAsset.toFixed(0) + '%', rptDebtToAsset <= 50)}
                    ${rptRatioRow('EMI-to-Income Ratio', rptEmiToIncome.toFixed(0) + '%', rptEmiToIncome <= 40)}
                    ${rptRatioRow('Emergency Fund Coverage', rptEmergencyMonths.toFixed(1) + ' months', rptEmergencyMonths >= 6)}
                    ${rptRatioRow('Goal Funding', rptGoalFunding.toFixed(0) + '%', rptGoalFunding >= 50)}
                    ${rptRatioRow('Portfolio Weighted Return', rptWeightedReturn.toFixed(2) + '%', rptWeightedReturn >= 8)}
                </tbody>
            </table>
            <p class="report-note">${rptOnTrack} of ${rptGoals.length} goal${rptGoals.length === 1 ? '' : 's'} on track; overall goal funding is ${rptGoalFunding.toFixed(1)}%.</p>
        `;

        // ===== Footer / disclaimer =====
        html += `
            <div class="report-footer">
                <p><strong>Xtin Gini</strong> &middot; AI-Powered Financial Intelligence by Xtin Capital</p>
                <p>This report is generated for informational purposes only and does not constitute financial, tax, or investment advice. Figures marked as estimates use standard planning assumptions and may differ from your actual situation. Consult a SEBI-registered advisor before acting.</p>
            </div>
        </div>
        `;

        return html;
    }

    generateReportBtn.addEventListener('click', () => {
        // A report without a household is meaningless — guide the user to
        // the first real step instead of rendering empty/fake numbers.
        if ((appState.familyMembers || []).length === 0) {
            reportPreviewContent.innerHTML = `
                <div class="empty-state-card empty-state-card--action">
                    <div class="empty-state-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="42" height="42">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                    </div>
                    <p class="empty-state-title">Your blueprint needs you in it</p>
                    <p class="empty-state-sub">Add yourself and your family in Step 1 — then Gini can analyse real numbers, not placeholders.</p>
                    <button class="btn btn--primary" id="landing-reportAddSelfBtn">Go to Step 1</button>
                </div>`;
            reportPreviewContainer.style.display = 'block';
            document.getElementById('landing-reportAddSelfBtn')?.addEventListener('click', () => {
                document.getElementById('landing-family-section')?.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => openFamilyForm(), 500);
            });
            return;
        }

        const reportType = document.querySelector('.landing-page input[name="landingReportType"]:checked').value;
        const includeNW = document.getElementById('landing-includeNetWorth').checked;
        const includeG = document.getElementById('landing-includeGoals').checked;
        const includePort = document.getElementById('landing-includePortfolio').checked;

        const reportHTML = generateReportHTML(reportType, includeNW, includeG, includePort);
        reportPreviewContent.innerHTML = reportHTML;
        reportPreviewContainer.style.display = 'block';
        reportPreviewContainer.scrollIntoView({ behavior: 'smooth' });
    });

    // Download PDF Action — free users get the full on-screen report
    // (real value, builds trust); the take-away PDF is the Pro moment.
    downloadReportPdfBtn.addEventListener('click', async () => {
        if (window.GiniPlan && !window.GiniPlan.isPro()) {
            window.GiniPlan.showUpgradeModal('reports');
            return;
        }
        const el = document.getElementById('landing-reportPreviewContent');
        if (!el || typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            showAuthNotification('PDF printing tools failed to load. Please try again.', 'error');
            return;
        }

        downloadReportPdfBtn.textContent = 'Generating...';
        downloadReportPdfBtn.disabled = true;

        try {
            const canvas = await html2canvas(el, {
                scale: 2, // better quality
                backgroundColor: '#ffffff',
                useCORS: true
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
            const pageWidth = 190; // margins
            const imgProps = pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 10, 15, pageWidth, pdfHeight);
            pdf.save(`Xtin-Gini-Onboarding-Blueprint-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (e) {
            console.error('[Landing] PDF generation error:', e);
            alert('Could not export PDF. Please try again.');
        } finally {
            downloadReportPdfBtn.textContent = 'Download PDF';
            downloadReportPdfBtn.disabled = false;
        }
    });

    // ---------------------------------------------------------
    // 6. INITIALIZATION
    // ---------------------------------------------------------
    loadState();
    updateFamilyStats();
    renderFamilyMembers();
    renderGoals();

    // Expose a refresh hook so external code (e.g. sampleData.load) can
    // re-render the landing page after mutating appState.
    window.landingPageRefresh = () => {
        updateFamilyStats();
        renderFamilyMembers();
        renderGoals();
    };
}

// Defer initLandingPage until persisted state is actually applied.
// (setTimeout(0) was NOT enough: loadAppStateFromStorage awaits real async
// work — auth init, cloud fetch — so the landing could paint from the empty
// default state on reload. Wait for the explicit signal instead.)
document.addEventListener('DOMContentLoaded', () => {
    if (window.__giniStateLoaded) {
        initLandingPage();
        return;
    }
    let started = false;
    const startOnce = () => {
        if (started) return;
        started = true;
        initLandingPage();
    };
    document.addEventListener('gini:state-loaded', startOnce, { once: true });
    // Safety net: never leave the landing page unrendered if the main
    // init throws before dispatching the signal.
    setTimeout(startOnce, 4000);
});