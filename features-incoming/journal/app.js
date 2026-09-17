// Trading Journal Data Management
// Start with empty trades array - users can load sample data via "Load Sample" button
let trades = [];
const PRESENTATION_MODE_STORAGE_KEY = 'trading_journal_presentation_mode';
const DEMO_SAMPLE_STORAGE_KEY = 'trading_journal_demo_sample';
const ACTIVE_TAB_STORAGE_KEY = 'trading_journal_active_tab';
const TRADE_DRAFT_STORAGE_KEY = 'trading_journal_trade_draft';
const GOAL_DRAFT_STORAGE_KEY = 'trading_journal_goal_draft';
const QUICK_TRADE_DRAFT_STORAGE_KEY = 'trading_journal_quick_trade_draft';
let isPresentationMode = false;
let liveClockIntervalId = null;
let isLoadingCloudState = false;
let isSampleDataMode = false;

// ==================== LIGHT MODE ONLY ====================
// Theme colors (light mode only - no dark mode)
function getChartColors() {
  return {
    text: '#1f2937',
    textSecondary: '#6b7280',
    gridColor: 'rgba(0, 0, 0, 0.1)',
    tooltipBg: 'rgba(255, 255, 255, 0.95)',
    tooltipText: '#1f2937',
    positive: '#059669',
    negative: '#dc2626',
    primary: '#10b981',
    surface: '#ffffff',
    background: '#f9fafb'
  };
}

let currentEditId = null;
let lastFocusedElement = null;
let filteredTrades = [...trades];
let nextTradeId = trades.length > 0 ? Math.max(...trades.map(t => t.id)) + 1 : 1;

const tradingTypes = ['Scalping', 'Intraday', 'Swing Trading', 'Positional Trading', 'Investing', 'Long-Term Investing'];
const tradeMarkets = ['Equity', 'Futures', 'Options', 'Commodities', 'Forex', 'Crypto_Currency'];
const defaultStrategies = ['Breakout', 'Breakdown', 'M Pattern', 'W Pattern', 'Head & shoulder', 'Iron Condor', 'Hammer Candle', 'Shooting Star'];
let customStrategies = [];
const CUSTOM_STRATEGY_KEY = 'trading_journal_custom_strategies';

let equities = [];
let futures = [];
let options = [];
let commodities = [];
let forex = [];
let crypto = [];

let charts = {};
let goals = [];
let nextGoalId = 1;

const GOALS_STORAGE_KEY = 'trading_journal_goals';
const SUBSCRIPTION_STORAGE_KEY = 'XtinJournalSubscription';
const INVOICES_STORAGE_KEY = 'XtinJournalInvoices';

const LOCAL_BACKEND_URL = 'http://127.0.0.1:8001';
const RENDER_BACKEND_URL = 'https://xtin-backend.onrender.com';

function getBackendURL() {
  if (window.BACKEND_URL && typeof window.BACKEND_URL === 'string') {
    return window.BACKEND_URL.trim();
  }

  const { protocol, hostname } = window.location;
  const isLocal =
    protocol === 'file:' ||
    !hostname ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0';
  if (isLocal) return LOCAL_BACKEND_URL;

  const backendMeta = document.querySelector('meta[name="backend-url"]')?.content;
  if (backendMeta && typeof backendMeta === 'string') {
    return backendMeta.trim();
  }

  return RENDER_BACKEND_URL;
}

function getSubscriptionUserId() {
  const supabaseUser = window.journalSupabase?.getUser?.();
  if (supabaseUser?.id) return supabaseUser.id;
  const existing = localStorage.getItem('XtinJournalUserId') || localStorage.getItem('XtinUserId');
  if (existing) return existing;
  const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
  localStorage.setItem('XtinJournalUserId', userId);
  return userId;
}

async function fetchSubscriptionFromAPI(userId) {
  const response = await fetch(`${getBackendURL()}/api/v2/subscription?user_id=${encodeURIComponent(userId)}`);
  if (!response.ok) throw new Error(`Subscription fetch failed: ${response.status}`);
  const payload = await response.json();
  return payload.subscription || null;
}

async function fetchInvoicesFromAPI(userId) {
  const response = await fetch(`${getBackendURL()}/api/v2/invoices?user_id=${encodeURIComponent(userId)}`);
  if (!response.ok) throw new Error(`Invoice fetch failed: ${response.status}`);
  const payload = await response.json();
  return Array.isArray(payload.invoices) ? payload.invoices : [];
}

// Ensure goals is always an array
if (!Array.isArray(goals)) {
  goals = [];
}
const goalMetricFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2
});

const GOAL_METRIC_CONFIG = {
  total_pnl: {
    label: 'Total P&L',
    formatter: (value) => typeof formatCurrency === 'function' ? formatCurrency(value) : goalMetricFormatter.format(value)
  },
  win_rate: {
    label: 'Win Rate',
    formatter: (value) => `${value.toFixed(1)}%`
  },
  trade_count: {
    label: 'Total Trades',
    formatter: (value) => `${Math.round(value)}`
  },
  avg_pnl: {
    label: 'Average P&L',
    formatter: (value) => typeof formatCurrency === 'function' ? formatCurrency(value) : goalMetricFormatter.format(value)
  }
};

const GOAL_TIMEFRAME_LABELS = {
  all_time: 'All-Time',
  this_month: 'This Month'
};

function loadCustomStrategies() {
  try {
    const stored = localStorage.getItem(CUSTOM_STRATEGY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        customStrategies = parsed
          .map(name => typeof name === 'string' ? name.trim() : '')
          .filter(Boolean);
      }
    }
  } catch (error) {
    console.error('Error loading custom strategies:', error);
    customStrategies = [];
  }
}

function saveCustomStrategies() {
  try {
    localStorage.setItem(CUSTOM_STRATEGY_KEY, JSON.stringify(customStrategies));
    saveJournalCloudState('custom_strategies');
  } catch (error) {
    console.error('Error saving custom strategies:', error);
  }
}

// Helper function for AI Coach to get all trades
function getAllTrades() {
  return trades && Array.isArray(trades) ? trades : [];
}

function normalizeStrategyName(name) {
  return typeof name === 'string' ? name.trim() : '';
}

function toStrategyKey(name) {
  const normalized = normalizeStrategyName(name);
  return normalized ? normalized.toLowerCase() : '';
}

function strategyMatches(tradeStrategy, targetStrategy) {
  const tradeKey = toStrategyKey(tradeStrategy);
  const targetKey = toStrategyKey(targetStrategy);
  if (!tradeKey || !targetKey) return false;
  return tradeKey === targetKey;
}

function getStrategyOptions() {
  const combined = [
    ...defaultStrategies,
    ...customStrategies,
    ...trades.map(t => t.strategy).filter(Boolean)
  ];
  const unique = [];
  const seen = new Set();
  combined.forEach(name => {
    const normalized = normalizeStrategyName(name);
    if (!normalized) return;
    const key = normalized.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(normalized);
    }
  });
  return unique;
}

function rememberCustomStrategy(name) {
  const normalized = normalizeStrategyName(name);
  if (!normalized) return;
  const isDefault = defaultStrategies.some(strat => strat.toLowerCase() === normalized.toLowerCase());
  if (isDefault) return;
  const exists = customStrategies.some(strat => strat.toLowerCase() === normalized.toLowerCase());
  if (exists) return;
  customStrategies.push(normalized);
  customStrategies.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  saveCustomStrategies();
  refreshStrategyOptionsUI();
}

function updateStrategyInputOptions() {
  const datalist = document.getElementById('strategyOptionsList');
  if (!datalist) return;
  const options = getStrategyOptions();
  datalist.innerHTML = '';
  const fragment = document.createDocumentFragment();
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    fragment.appendChild(opt);
  });
  datalist.appendChild(fragment);
}

function renderStrategiesSetupList() {
  const listEl = document.getElementById('strategiesList');
  if (!listEl) return;
  const options = getStrategyOptions();
  if (options.length === 0) {
    listEl.innerHTML = '<div class="setup-list-item" style="opacity:0.7;">No strategies configured yet</div>';
    return;
  }
  listEl.innerHTML = options.map(option => `<div class="setup-list-item">${option}</div>`).join('');
}

function refreshStrategyOptionsUI() {
  updateStrategyInputOptions();
  renderStrategiesSetupList();
}

function normalizeTradeStrategies(tradesList) {
  if (!Array.isArray(tradesList)) return;
  tradesList.forEach(trade => {
    if (!trade || typeof trade !== 'object') return;
    const normalized = normalizeStrategyName(trade.strategy);
    if (normalized) {
      trade.strategy = normalized;
    }
  });
}

function ensureTradeIds(tradesList) {
  if (!Array.isArray(tradesList)) return;
  
  // First, normalize all existing valid numeric IDs and collect them in a Set
  const existingIds = new Set();
  tradesList.forEach(t => {
    if (t && typeof t === 'object' && t.id !== undefined && t.id !== null && !isNaN(Number(t.id))) {
      t.id = Number(t.id);
      existingIds.add(t.id);
    }
  });

  // Find the next available ID starting from 1
  let nextId = 1;
  tradesList.forEach(t => {
    if (!t || typeof t !== 'object') return;
    if (t.id === undefined || t.id === null || isNaN(Number(t.id))) {
      while (existingIds.has(nextId)) {
        nextId++;
      }
      t.id = nextId;
      existingIds.add(nextId);
      nextId++;
    }
  });
}

function ensureTradeDefaults(tradesList) {
  if (!Array.isArray(tradesList)) return;
  tradesList.forEach(trade => {
    if (!trade || typeof trade !== 'object') return;
    if (!trade.exitDate) trade.exitDate = trade.date || getTodayInSelectedTimeZone();
    if (!trade.currency) trade.currency = 'INR';
    if (!trade.timeZone) trade.timeZone = getSelectedTimeZone();
    if (!trade.contract) trade.contract = getContractLabelFromDate(trade.date);
    if (!Array.isArray(trade.tags)) trade.tags = [];
    if (!trade.emotion) trade.emotion = 'neutral';
    if (typeof trade.pnl !== 'number' || !isFinite(trade.pnl)) {
      trade.pnl = calculatePnLSnapshot(trade);
    }
  });
}

function getTradeCurrency(trade = null) {
  const currency = trade?.currency || 'INR';
  if (typeof CURRENCY_CONFIG === 'object' && CURRENCY_CONFIG[currency]) return currency;
  return 'INR';
}

function convertTradeAmountToINR(value, trade = null) {
  const amount = Number(value) || 0;
  const currency = getTradeCurrency(trade);
  if (typeof convertAmount === 'function') {
    return convertAmount(amount, currency, 'INR');
  }
  return amount;
}

function getTradePnlInINR(trade) {
  return convertTradeAmountToINR(trade?.pnl || 0, trade);
}

function getTradeMarginInINR(trade) {
  return convertTradeAmountToINR(trade?.margin || 0, trade);
}

function formatNativeCurrency(amount, currency = 'INR') {
  const value = Number(amount) || 0;
  const config = typeof CURRENCY_CONFIG === 'object' ? CURRENCY_CONFIG[currency] : null;
  const symbol = config?.symbol || currency;
  const formatted = Math.abs(value).toFixed(2);
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${value < 0 ? '-' : ''}${symbol}${parts.join('.')}`;
}

function formatTradeCurrency(amount, trade = null) {
  return formatNativeCurrency(amount, getTradeCurrency(trade));
}

function loadGoalsFromStorage() {
  try {
    const saved = localStorage.getItem(GOALS_STORAGE_KEY);
    console.log('Loading goals from storage:', saved);
    // Check if saved is not null, not the string "null", and not undefined
    if (saved && saved !== 'null' && saved !== 'undefined') {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        goals = parsed.map(goal => ({
          ...goal,
          targetValue: typeof goal.targetValue === 'number' ? goal.targetValue : parseFloat(goal.targetValue) || 0
        }));
        const ids = goals.map(goal => goal.id || 0);
        nextGoalId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
        console.log('Loaded goals:', goals.length, goals);
      } else {
        console.log('No goals in storage or empty array');
      }
    } else {
      console.log('Storage returned null or invalid value');
    }
  } catch (error) {
    console.error('Error loading goals:', error);
    goals = [];
  }
}

function saveGoalsToStorage() {
  try {
    // Ensure goals is always an array before saving
    const goalsToSave = Array.isArray(goals) ? goals : [];
    const jsonString = JSON.stringify(goalsToSave);
    localStorage.setItem(GOALS_STORAGE_KEY, jsonString);
    console.log('Saved goals to storage:', jsonString);
    saveJournalCloudState('goals');
  } catch (error) {
    console.error('Error saving goals:', error);
  }
}

function handleGoalForm(event) {
  event.preventDefault();
  const title = document.getElementById('goalTitle').value.trim();
  const metric = document.getElementById('goalMetric').value;
  const timeframe = document.getElementById('goalTimeframe').value;
  const targetValue = parseFloat(document.getElementById('goalTarget').value);
  if (!title) {
    showToast('Please enter a goal title', 'error');
    return;
  }
  if (!metric || !GOAL_METRIC_CONFIG[metric]) {
    showToast('Please select a valid metric', 'error');
    return;
  }
  if (!timeframe || !GOAL_TIMEFRAME_LABELS[timeframe]) {
    showToast('Please select a valid timeframe', 'error');
    return;
  }
  if (isNaN(targetValue) || targetValue <= 0) {
    showToast('Target must be greater than zero', 'error');
    return;
  }
  // Free plan cap on goals (JournalPlan lives in journal-premium.js)
  if (window.JournalPlan && !window.JournalPlan.canAddGoal(goals.length)) {
    window.JournalPlan.showUpgradeModal('goals');
    return;
  }
  const newGoal = {
    id: nextGoalId++,
    title,
    metric,
    timeframe,
    targetValue
  };
  goals.push(newGoal);
  saveGoalsToStorage();
  localStorage.removeItem(GOAL_DRAFT_STORAGE_KEY);
  saveJournalCloudState('drafts');
  event.target.reset();
  document.getElementById('goalMetric').value = 'total_pnl';
  document.getElementById('goalTimeframe').value = 'this_month';
  renderGoals();
  showToast('Goal added successfully!', 'success');
}

function renderGoals(precomputedMetrics = null) {
  const container = document.getElementById('goalCardsContainer');
  const emptyState = document.getElementById('goalEmptyState');

  if (!container) {
    console.error('Goal container not found!');
    return;
  }
  if (!emptyState) {
    console.error('Goal empty state not found!');
    return;
  }

  console.log('=== RENDER GOALS START ===');
  console.log('Goals array:', goals);
  console.log('Goals length:', goals ? goals.length : 'undefined');
  console.log('Is array:', Array.isArray(goals));
  console.log('Precomputed metrics:', precomputedMetrics);

  if (!Array.isArray(goals) || goals.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    console.log('No goals to display');
    return;
  }

  emptyState.style.display = 'none';
  const metricsByTimeframe = precomputedMetrics || buildGoalMetricsByTimeframe();
  console.log('Metrics by timeframe:', metricsByTimeframe);

  console.log('Starting goal card generation for', goals.length, 'goals');
  const goalCards = goals.map(goal => {
    console.log('Processing goal:', goal);
    const metricConfig = GOAL_METRIC_CONFIG[goal.metric] || GOAL_METRIC_CONFIG.total_pnl;
    const timeframeLabel = GOAL_TIMEFRAME_LABELS[goal.timeframe] || GOAL_TIMEFRAME_LABELS.all_time;
    const { currentValue, percentComplete, statusText, statusClass } = computeGoalProgress(goal, metricsByTimeframe);
    console.log('Goal progress computed:', { currentValue, percentComplete, statusText });
    const formattedCurrent = metricConfig.formatter(currentValue);
    const formattedTarget = metricConfig.formatter(goal.targetValue);
    const percentDisplay = Number.isFinite(percentComplete) ? percentComplete.toFixed(0) : '0';

    return `
      <div class="goal-card">
        <div class="goal-card-header">
          <div>
            <h4>${goal.title}</h4>
            <div class="goal-card-meta">${metricConfig.label} • ${timeframeLabel}</div>
          </div>
          <button class="btn btn-delete" style="padding: 4px 8px;" onclick="deleteGoal(${goal.id})">Remove</button>
        </div>
        <div>
          <div class="goal-progress-bar"><span style="width: ${Math.min(100, percentComplete)}%"></span></div>
          <div class="goal-progress-meta">
            <span>${formattedCurrent}</span>
            <span>Target: ${formattedTarget}</span>
          </div>
          <div style="font-size: 12px; opacity: 0.8; text-align: right; margin-top: 4px;">${percentDisplay}% complete</div>
        </div>
        <div class="goal-status ${statusClass}">${statusText}</div>
      </div>
    `;
  });

  container.innerHTML = goalCards.join('');
  console.log('Goal cards HTML set, length:', container.innerHTML.length);
  console.log('=== RENDER GOALS COMPLETE ===');
}

function computeGoalProgress(goal, metricsByTimeframe) {
  const metricBundle = metricsByTimeframe[goal.timeframe] || metricsByTimeframe.all_time;
  const metrics = metricBundle || { totalPnL: 0, winRate: 0, totalTrades: 0, avgPnL: 0 };
  let currentValue = 0;
  switch (goal.metric) {
    case 'win_rate':
      currentValue = metrics.winRate || 0;
      break;
    case 'trade_count':
      currentValue = metrics.totalTrades || 0;
      break;
    case 'avg_pnl':
      currentValue = metrics.avgPnL || 0;
      break;
    case 'total_pnl':
    default:
      currentValue = metrics.totalPnL || 0;
      break;
  }
  const percentComplete = goal.targetValue > 0 ? Math.max(0, Math.min(100, (currentValue / goal.targetValue) * 100)) : 0;
  let statusText = 'Making Progress';
  let statusClass = 'on-track';
  if (percentComplete >= 100) {
    statusText = 'Goal Completed';
    statusClass = 'completed';
  } else if (percentComplete >= 60) {
    statusText = 'On Track';
  } else {
    statusText = 'Needs Attention';
    statusClass = 'behind';
  }
  return { currentValue, percentComplete, statusText, statusClass };
}

function buildGoalMetricsByTimeframe() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const thisMonthTrades = trades.filter(trade => {
    const tradeDate = new Date(trade.date);
    return tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear;
  });
  return {
    all_time: calculateMetrics(trades),
    this_month: calculateMetrics(thisMonthTrades)
  };
}

function deleteGoal(goalId) {
  const doDelete = () => {
    goals = goals.filter(goal => goal.id !== goalId);
    saveGoalsToStorage();
    renderGoals();
    showToast('Goal removed', 'success');
  };
  if (window.JournalUX?.confirm) {
    window.JournalUX.confirm({
      title: 'Remove this goal?',
      message: 'Its progress tracking will stop. You can always set a new goal later.',
      confirmText: 'Remove Goal',
      danger: true
    }).then((ok) => { if (ok) doDelete(); });
  } else if (confirm('Remove this goal?')) {
    doDelete();
  }
}

function resetGoals() {
  goals = [];
  nextGoalId = 1;
  localStorage.removeItem(GOALS_STORAGE_KEY);
  renderGoals();
}

// Universal 24h session buckets to support equity, forex, and crypto markets
const GLOBAL_SESSIONS = [
  { label: 'Asia (00:00-06:00)', startHour: 0, endHour: 6 },
  { label: 'Europe (06:00-12:00)', startHour: 6, endHour: 12 },
  { label: 'Americas (12:00-18:00)', startHour: 12, endHour: 18 },
  { label: 'Overnight (18:00-24:00)', startHour: 18, endHour: 24 }
];

// Database Management using localStorage
const DB_KEY = 'trading_journal_data';

function buildJournalSettingsState() {
  return {
    selectedCurrency: typeof currentCurrency === 'string' ? currentCurrency : localStorage.getItem('selectedCurrency') || 'INR',
    selectedTimeZone: getSelectedTimeZone(),
    activeTab: localStorage.getItem(ACTIVE_TAB_STORAGE_KEY) || 'dashboard',
    presentationMode: isPresentationMode,
    hasSeenWelcome: localStorage.getItem('hasSeenWelcome') === 'true'
  };
}

function buildJournalCloudState() {
  return {
    trades,
    goals,
    custom_strategies: customStrategies,
    settings: buildJournalSettingsState(),
    subscription: safeReadJSON(SUBSCRIPTION_STORAGE_KEY, null),
    invoices: safeReadJSON(INVOICES_STORAGE_KEY, []),
    ai_usage: {
      usage: safeReadJSON('XtinJournalAIUsage', null),
      resetDate: localStorage.getItem('XtinJournalUsageResetDate') || null,
      paymentMethod: localStorage.getItem('XtinJournalPaymentMethod') || null,
      subscription: safeReadJSON(SUBSCRIPTION_STORAGE_KEY, null)
    },
    drafts: {
      trade: safeReadJSON(TRADE_DRAFT_STORAGE_KEY, null),
      quickTrade: safeReadJSON(QUICK_TRADE_DRAFT_STORAGE_KEY, null),
      goal: safeReadJSON(GOAL_DRAFT_STORAGE_KEY, null)
    }
  };
}

async function saveJournalCloudState(stateKey = null) {
  if (isLoadingCloudState || isSampleDataMode || !window.journalSupabase?.getUser?.()) return;

  const state = buildJournalCloudState();
  if (stateKey) {
    await window.journalSupabase.saveState(stateKey, state[stateKey]);
    return;
  }
  await window.journalSupabase.saveManyState(state);
}

async function loadJournalCloudState() {
  if (!window.journalSupabase?.getUser?.()) return;
  isLoadingCloudState = true;
  try {
    const state = await window.journalSupabase.loadAllState();

    if (Array.isArray(state.trades)) {
      trades = state.trades;
      ensureTradeIds(trades);
      ensureTradeDefaults(trades);
      normalizeTradeStrategies(trades);
      filteredTrades = [...trades];
      nextTradeId = trades.length > 0 ? Math.max(...trades.map(t => t.id)) + 1 : 1;
      localStorage.setItem(DB_KEY, JSON.stringify(trades));
    }

    if (Array.isArray(state.goals)) {
      goals = state.goals.map(goal => ({
        ...goal,
        targetValue: typeof goal.targetValue === 'number' ? goal.targetValue : parseFloat(goal.targetValue) || 0
      }));
      nextGoalId = goals.length > 0 ? Math.max(...goals.map(goal => goal.id || 0)) + 1 : 1;
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    }

    if (Array.isArray(state.custom_strategies)) {
      customStrategies = state.custom_strategies;
      localStorage.setItem(CUSTOM_STRATEGY_KEY, JSON.stringify(customStrategies));
    }

    if (state.settings && typeof state.settings === 'object') {
      if (state.settings.selectedCurrency) {
        currentCurrency = state.settings.selectedCurrency;
        localStorage.setItem('selectedCurrency', currentCurrency);
        const selector = document.getElementById('currencySelector');
        if (selector) selector.value = currentCurrency;
      }
      if (state.settings.selectedTimeZone) {
        currentTimeZone = state.settings.selectedTimeZone;
        localStorage.setItem('selectedTimeZone', currentTimeZone);
        const selector = document.getElementById('timeZoneSelector');
        if (selector) selector.value = currentTimeZone;
      }
      if (state.settings.activeTab) localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, state.settings.activeTab);
      if (state.settings.hasSeenWelcome) localStorage.setItem('hasSeenWelcome', 'true');
    }

    if (state.subscription) localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(state.subscription));
    if (Array.isArray(state.invoices)) localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(state.invoices));
    if (state.ai_usage?.usage) localStorage.setItem('XtinJournalAIUsage', JSON.stringify(state.ai_usage.usage));
    if (state.ai_usage?.resetDate) localStorage.setItem('XtinJournalUsageResetDate', state.ai_usage.resetDate);
    if (state.ai_usage?.paymentMethod) localStorage.setItem('XtinJournalPaymentMethod', state.ai_usage.paymentMethod);
    if (state.drafts?.trade) localStorage.setItem(TRADE_DRAFT_STORAGE_KEY, JSON.stringify(state.drafts.trade));
    if (state.drafts?.quickTrade) localStorage.setItem(QUICK_TRADE_DRAFT_STORAGE_KEY, JSON.stringify(state.drafts.quickTrade));
    if (state.drafts?.goal) localStorage.setItem(GOAL_DRAFT_STORAGE_KEY, JSON.stringify(state.drafts.goal));
  } finally {
    isLoadingCloudState = false;
  }
}

function refreshJournalAfterCloudLoad() {
  filteredTrades = [...trades];
  rebuildAssetCategoriesFromTrades();
  refreshStrategyOptionsUI();
  updateCurrencyLabels();
  updateDatabaseStatus();
  renderTradesTable();
  renderDashboard();
  renderSummaryMetrics();
  updateMonthlyView();
  updateDailyView();
  renderAnalytics();
  renderHourlyAnalysis();
  renderHeatmapsTab();
  renderSubscriptionTab();
}

async function reloadJournalFromCloud(options = {}) {
  await loadJournalCloudState();
  refreshJournalAfterCloudLoad();
  if (options.showToast) {
    showToast('Journal data loaded from Supabase', 'success');
  }
}

window.reloadJournalFromCloud = reloadJournalFromCloud;

function saveToDatabase(options = {}) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(trades));
    localStorage.setItem(DB_KEY + '_timestamp', new Date().toISOString());
    updateDatabaseStatus();
    if (!options.skipCloud) saveJournalCloudState();
    console.log('Data saved to database');
  } catch (error) {
    console.error('Error saving to database:', error);
    showToast('Error saving data to database', 'error');
  }
}

function updateDatabaseStatus() {
  const dbTradeCount = document.getElementById('dbTradeCount');
  const lastUpdated = document.getElementById('lastUpdated');

  if (dbTradeCount) {
    dbTradeCount.textContent = trades.length;
  }

  if (lastUpdated) {
    const timestamp = localStorage.getItem(DB_KEY + '_timestamp');
    if (timestamp) {
      const date = new Date(timestamp);
      lastUpdated.textContent = date.toLocaleString('en-IN', {
        timeZone: getSelectedTimeZone(),
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short'
      }) + ` ${getShortTimeZoneLabel()}`;
    } else {
      lastUpdated.textContent = 'Just now';
    }
  }
}

function loadFromDatabase() {
  try {
    const savedData = localStorage.getItem(DB_KEY);
    if (savedData) {
      const loadedTrades = JSON.parse(savedData);
      if (loadedTrades && Array.isArray(loadedTrades) && loadedTrades.length > 0) {
        trades = loadedTrades;
        ensureTradeIds(trades);
        ensureTradeDefaults(trades);
        normalizeTradeStrategies(trades);
        filteredTrades = [...trades];
        nextTradeId = trades.length > 0 ? Math.max(...trades.map(t => t.id)) + 1 : 1;
        console.log(`Loaded ${trades.length} trades from database`);
        showToast(`Loaded ${trades.length} trades from database`, 'success');
      }
    }
  } catch (error) {
    console.error('Error loading from database:', error);
  }
}

function getSelectedTimeZone() {
  if (typeof currentTimeZone === 'string' && currentTimeZone) return currentTimeZone;
  return localStorage.getItem('selectedTimeZone') || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
}

function getShortTimeZoneLabel(timeZone = getSelectedTimeZone()) {
  const labels = {
    'Asia/Kolkata': 'IST',
    'America/New_York': 'ET',
    'America/Chicago': 'CT',
    'America/Los_Angeles': 'PT',
    'Europe/London': 'GMT/BST',
    'Europe/Berlin': 'CET',
    'Asia/Dubai': 'GST',
    'Asia/Singapore': 'SGT',
    'Asia/Tokyo': 'JST',
    'Australia/Sydney': 'AET'
  };
  return labels[timeZone] || timeZone;
}

function getTodayInSelectedTimeZone() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: getSelectedTimeZone(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
}

function getCurrentTimeInSelectedTimeZone() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: getSelectedTimeZone(),
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(new Date());
  const byType = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${byType.hour || '00'}:${byType.minute || '00'}:${byType.second || '00'}`;
}

function updateLiveTimeDisplay() {
  const liveTimeDisplay = document.getElementById('liveTimeDisplay');
  if (!liveTimeDisplay) return;

  const now = new Date();
  const timeZone = getSelectedTimeZone();
  const formattedDate = now.toLocaleDateString('en-IN', {
    timeZone,
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = now.toLocaleTimeString('en-IN', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  liveTimeDisplay.textContent = `${formattedDate}, ${formattedTime} ${getShortTimeZoneLabel(timeZone)}`;
}

function startLiveClock() {
  updateLiveTimeDisplay();
  if (liveClockIntervalId) clearInterval(liveClockIntervalId);
  liveClockIntervalId = setInterval(updateLiveTimeDisplay, 1000);
}

function refreshDateSensitiveViews() {
  updateCurrencyLabels();
  updateLiveTimeDisplay();
  updateDatabaseStatus();
  renderDashboard();
  renderTradesTable();
  updateMonthlyView();
  updateDailyView();
  renderCalendarView();
  renderHourlyAnalysis();
  renderHeatmapsTab();
}

function clearDatabase() {
  const runClear = () => {
    isSampleDataMode = false;
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(DB_KEY + '_timestamp');
    trades = [];
    filteredTrades = [];
    equities = [];
    futures = [];
    options = [];
    commodities = [];
    forex = [];
    crypto = [];
    renderTradesTable();
    renderDashboard();
    renderSummaryMetrics();
    updateMonthlyView();
    updateDailyView();
    renderAnalytics();
    renderHeatmapsTab();
    updateDatabaseStatus();
    rebuildAssetCategoriesFromTrades();
    refreshStrategyOptionsUI();
    saveJournalCloudState();
    showToast('Database cleared successfully', 'success');
  };
  if (window.JournalUX?.confirm) {
    window.JournalUX.confirm({
      title: 'Clear ALL journal data?',
      message: 'Every trade, goal and setting will be permanently deleted. This cannot be undone. Consider exporting a backup first.',
      confirmText: 'Delete Everything',
      danger: true
    }).then((ok) => { if (ok) runClear(); });
  } else if (confirm('Are you sure you want to clear all data? This cannot be undone!')) {
    runClear();
  }
}

// Initialize App
async function initApp() {
  console.log('=== INIT APP START ===');
  const cloudInit = await initializeJournalSupabase();
  loadFromDatabase(); // Load data first
  loadCustomStrategies();
  loadGoalsFromStorage();
  if (cloudInit.user) {
    await loadJournalCloudState();
  }
  console.log('After initial load, goals count:', goals.length);
  setupTabs();
  initializePresentationMode();
  initializeDemoProfileSelector();
  populateDropdowns();
  populateQuickTradeDropdowns();
  rebuildAssetCategoriesFromTrades();
  renderDashboard();
  renderTradesTable();
  renderSummaryMetrics();
  updateMonthlyView();
  updateDailyView();
  renderAnalytics();
  renderHeatmapsTab();
  renderSubscriptionTab();
  setDefaultDates();
  setupExitDateListeners();
  populateFilterDropdowns();
  updateDatabaseStatus();
  setupPnLListeners();
  setupDraftPersistence();
  updateCurrencyLabels();
  startLiveClock();
  restoreActiveTab();
}

async function initializeJournalSupabase() {
  if (!window.journalSupabase) {
    return { configured: false, user: null };
  }

  const result = await window.journalSupabase.init();
  if (result.configured && !result.user) {
    openJournalAuthModal();
  }
  return result;
}

// Setup event listeners for P&L preview
function setupPnLListeners() {
  const fieldsToWatch = ['pnl'];

  fieldsToWatch.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.addEventListener('input', updatePnLPreview);
    }
  });
}

// Set default dates
function setDefaultDates() {
  const today = getTodayInSelectedTimeZone();
  document.getElementById('dailyDateSelector').value = today;
  document.getElementById('tradeDate').value = today;
  const exitDate = document.getElementById('exitDate');
  if (exitDate && !exitDate.value) exitDate.value = today;
  const quickDate = document.getElementById('quickDate');
  if (quickDate && !quickDate.value) quickDate.value = today;
  const quickExitDate = document.getElementById('quickExitDate');
  if (quickExitDate && !quickExitDate.value) quickExitDate.value = quickDate?.value || today;
  const quickEntryTime = document.getElementById('quickEntryTime');
  if (quickEntryTime && !quickEntryTime.value) quickEntryTime.value = getCurrentTimeInSelectedTimeZone();
  const tradeTimeZone = document.getElementById('tradeTimeZone');
  if (tradeTimeZone) tradeTimeZone.value = getSelectedTimeZone();
}

function syncExitDateWithEntryDate(entryId, exitId) {
  const entryDate = document.getElementById(entryId);
  const exitDate = document.getElementById(exitId);
  if (!entryDate || !exitDate) return;
  if (!exitDate.value || exitDate.value < entryDate.value) {
    exitDate.value = entryDate.value;
  }
}

function setupExitDateListeners() {
  const pairs = [
    ['tradeDate', 'exitDate'],
    ['quickDate', 'quickExitDate']
  ];
  pairs.forEach(([entryId, exitId]) => {
    const entryDate = document.getElementById(entryId);
    if (!entryDate) return;
    entryDate.addEventListener('change', () => syncExitDateWithEntryDate(entryId, exitId));
  });
}

// Setup Tab Navigation
function setupTabs() {
  const tabButtons = Array.from(document.querySelectorAll('.tab-button[data-tab]'));
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      switchTab(tabName);
    });

    button.addEventListener('keydown', (event) => {
      handleTabKeyNavigation(event, tabButtons);
    });
  });
}

function handleTabKeyNavigation(event, tabButtons) {
  const currentIndex = tabButtons.indexOf(event.currentTarget);
  let targetIndex = -1;

  if (event.key === 'ArrowRight') {
    targetIndex = (currentIndex + 1) % tabButtons.length;
  } else if (event.key === 'ArrowLeft') {
    targetIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
  } else if (event.key === 'Home') {
    targetIndex = 0;
  } else if (event.key === 'End') {
    targetIndex = tabButtons.length - 1;
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.currentTarget.click();
    return;
  }

  if (targetIndex >= 0) {
    event.preventDefault();
    tabButtons[targetIndex].focus();
  }
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
    tab.setAttribute('aria-hidden', 'true');
  });

  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
    btn.setAttribute('tabindex', '-1');
  });

  const targetPanel = document.getElementById(`${tabName}-tab`);
  const targetButton = document.querySelector(`[data-tab="${tabName}"]`);

  if (!targetPanel || !targetButton) return;
  localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tabName);
  saveJournalCloudState('settings');

  targetPanel.classList.add('active');
  targetPanel.classList.add('tab-enter');
  targetPanel.setAttribute('aria-hidden', 'false');
  targetButton.classList.add('active');
  targetButton.setAttribute('aria-selected', 'true');
  targetButton.setAttribute('tabindex', '0');

  setTimeout(() => {
    targetPanel.classList.remove('tab-enter');
  }, 260);

  if (tabName === 'dashboard') {
    renderDashboard();
  } else if (tabName === 'trades') {
    renderTradesTable();
  } else if (tabName === 'psychology') {
    renderPsychologyTab();
  } else if (tabName === 'hourly') {
    renderHourlyAnalysis();
  } else if (tabName === 'calendar') {
    renderCalendarView();
  } else if (tabName === 'summary') {
    renderSummaryMetrics();
  } else if (tabName === 'monthly') {
    updateMonthlyView();
  } else if (tabName === 'daily') {
    updateDailyView();
  } else if (tabName === 'analytics') {
    renderAnalytics();
  } else if (tabName === 'subscription') {
    renderSubscriptionTab();
  } else if (tabName === 'heatmaps') {
    renderHeatmapsTab();
  }
}

function restoreActiveTab() {
  const savedTab = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
  if (!savedTab || !document.getElementById(`${savedTab}-tab`)) return;
  switchTab(savedTab);
}

function safeReadJSON(storageKey, fallback) {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Failed reading ${storageKey}:`, error);
    return fallback;
  }
}

function safeWriteJSON(storageKey, value) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
    if (storageKey === SUBSCRIPTION_STORAGE_KEY) saveJournalCloudState('subscription');
    if (storageKey === INVOICES_STORAGE_KEY) saveJournalCloudState('invoices');
  } catch (error) {
    console.error(`Failed writing ${storageKey}:`, error);
  }
}

function getSubscriptionData() {
  return safeReadJSON(SUBSCRIPTION_STORAGE_KEY, null);
}

function ensureInvoicesFromSubscription(subscription) {
  if (!subscription) return [];

  const existing = safeReadJSON(INVOICES_STORAGE_KEY, []);
  const invoices = Array.isArray(existing) ? existing : [];
  if (invoices.length > 0) return invoices;

  const issueDate = subscription.startedAt || new Date().toISOString();
  const dueDateObj = new Date(issueDate);
  dueDateObj.setDate(dueDateObj.getDate() + 7);
  const dueDate = dueDateObj.toISOString();
  const invoiceId = `INV-${new Date(issueDate).toISOString().slice(0, 10).replace(/-/g, '')}`;

  const generated = [{
    id: invoiceId,
    issueDate,
    dueDate,
    amountInr: subscription.amountInr || 0,
    plan: subscription.plan || 'starter',
    paymentMethod: subscription.paymentMethod || 'N/A',
    status: subscription.status === 'active' ? 'Paid' : 'Cancelled'
  }];

  safeWriteJSON(INVOICES_STORAGE_KEY, generated);
  return generated;
}

async function renderSubscriptionTab() {
  const hero = document.getElementById('profileDashboardHero');
  const cardsContainer = document.getElementById('userDashboardCards');
  const picker = document.getElementById('brokerConnectionPicker');
  const selectedList = document.getElementById('selectedConnectionList');
  const personalInfoPanel = document.getElementById('personalInfoPanel');
  if (!hero || !cardsContainer || !picker || !selectedList || !personalInfoPanel) return;

  const user = window.journalSupabase?.getUser?.();
  const displayName = window.journalSupabase?.getDisplayName?.() || user?.email?.split('@')[0] || 'Trader';
  const totalTrades = getAllTrades().length;
  const connected = safeReadJSON('xtin_broker_connections', {});
  const connectedCount = Object.values(connected).filter(Boolean).length;
  const initials = displayName.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'TR';

  hero.innerHTML = `
    <div style="display: flex; align-items: center; gap: 16px; min-width: 0;">
      <div class="profile-avatar">${initials}</div>
      <div style="min-width: 0;">
        <h3 style="margin: 0; font-size: 22px;">${displayName}</h3>
        <p style="margin: 4px 0 0; color: var(--color-text-secondary);">${user?.email || 'Sign in to sync profile and journal data'}</p>
      </div>
    </div>
    <button class="btn btn-primary" onclick="openJournalAuthModal()">Manage Profile</button>
  `;

  cardsContainer.innerHTML = `
    <div class="subscription-card">
      <div class="label">Saved Trades</div>
      <div class="value">${totalTrades.toLocaleString()}</div>
    </div>
    <div class="subscription-card">
      <div class="label">Selected Platforms</div>
      <div class="value">${connectedCount}</div>
    </div>
    <div class="subscription-card">
      <div class="label">Default Currency</div>
      <div class="value">${currentCurrency}</div>
    </div>
    <div class="subscription-card">
      <div class="label">Time Zone</div>
      <div class="value" style="font-size:16px;">${currentTimeZone}</div>
    </div>
    <div class="subscription-card">
      <div class="label">Data Sync</div>
      <div class="value">${user ? 'Cloud Enabled' : 'Local Only'}</div>
    </div>
  `;

  const platforms = [
    ['Zerodha Kite', 'Indian broker', 'Import equity, F&O and holdings history.'],
    ['Upstox', 'Indian broker', 'Pull orders and tradebook data.'],
    ['Angel One', 'Indian broker', 'Connect order and position reports.'],
    ['Dhan', 'Indian broker', 'Sync trades from broker reports.'],
    ['Groww', 'Indian broker', 'Track equity and mutual fund activity.'],
    ['TradingView', 'Charting alerts', 'Capture alerts and strategy signals.'],
    ['Binance', 'Crypto exchange', 'Import spot and futures crypto trades.']
  ];
  picker.innerHTML = platforms.map(([name, type, description]) => {
    const selected = !!connected[name];
    return `
      <button class="connection-card ${selected ? 'selected' : ''}" type="button" onclick="toggleBrokerConnection('${name}')">
        <div style="font-weight: 700; margin-bottom: 6px;">${name}</div>
        <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 10px;">${type}</div>
        <div style="font-size: 13px; color: var(--color-text-secondary);">${description}</div>
      </button>
    `;
  }).join('');

  const selectedNames = Object.keys(connected).filter(name => connected[name]);
  selectedList.innerHTML = selectedNames.length
    ? selectedNames.map(name => `<span class="selected-connection-pill">${name}<button type="button" onclick="toggleBrokerConnection('${name}')" style="border:0;background:transparent;color:inherit;cursor:pointer;font-weight:700;">x</button></span>`).join('')
    : '<span style="color: var(--color-text-secondary);">Select a platform above to prepare a connection placeholder.</span>';

  personalInfoPanel.innerHTML = `
    <div class="subscription-card"><div class="label">User ID</div><div class="value" style="font-size:14px;">${user?.id || getAICoachUserId()}</div></div>
    <div class="subscription-card"><div class="label">Name</div><div class="value">${displayName}</div></div>
    <div class="subscription-card"><div class="label">Email</div><div class="value" style="font-size:16px;">${user?.email || 'Not signed in'}</div></div>
    <div class="subscription-card"><div class="label">Pricing Page</div><div class="value" style="font-size:16px;"><a href="pricing.html">Open Pricing</a></div></div>
  `;
}

function toggleBrokerConnection(name) {
  const connections = safeReadJSON('xtin_broker_connections', {});
  connections[name] = !connections[name];
  safeWriteJSON('xtin_broker_connections', connections);
  renderSubscriptionTab();
  showToast(`${name} ${connections[name] ? 'added to dashboard' : 'removed from dashboard'}`, 'success');
}

function downloadInvoiceCSV(invoiceId) {
  const invoices = safeReadJSON(INVOICES_STORAGE_KEY, []);
  const invoice = invoices.find(inv => inv.id === invoiceId);
  if (!invoice) {
    showToast('Invoice not found', 'error');
    return;
  }

  const csv = [
    'Invoice ID,Issue Date,Due Date,Plan,Payment Method,Amount INR,Status',
    `${invoice.id},${new Date(invoice.issueDate).toLocaleDateString()},${new Date(invoice.dueDate).toLocaleDateString()},${(invoice.plan || '').toUpperCase()},${(invoice.paymentMethod || '').toUpperCase()},${invoice.amountInr || 0},${invoice.status || ''}`
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${invoice.id}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Downloaded ${invoice.id}`, 'success');
}

function openPricingPage() {
  if (window.aiCoach && typeof window.aiCoach.showPricingGate === 'function') {
    window.aiCoach.showPricingGate();
    return;
  }
  showToast('AI token recharge is not available right now.', 'error');
}

function openCoachSubscriptionManager() {
  if (window.aiCoach && typeof window.aiCoach.showSubscriptionManager === 'function') {
    window.aiCoach.showSubscriptionManager();
    return;
  }
  showToast('AI Coach wallet is not available right now.', 'error');
}

async function ensureAICoachLoaded() {
  if (window.aiCoach && typeof window.aiCoach.open === 'function') {
    return true;
  }

  if (typeof window.AICoach === 'undefined') {
    try {
      await loadScript(`ai-coach.js?v=${Date.now()}`);
    } catch (error) {
      console.error('Failed to load AI Coach script:', error);
      return false;
    }
  }

  if (!window.aiCoach && typeof AICoach !== 'undefined') {
    window.aiCoach = new AICoach();
    window.aiCoach.init();
  }

  return !!(window.aiCoach && typeof window.aiCoach.open === 'function');
}

async function openAICoachChat() {
  const isReady = await ensureAICoachLoaded();

  if (window.aiCoach && typeof window.aiCoach.open === 'function') {
    window.aiCoach.open();
    window.aiCoach.switchTab('chat');
    return;
  }

  showToast(isReady ? 'AI Coach could not open right now.' : 'AI Coach script did not load. Please check deployment files.', 'error');
}

function getAICoachUserId() {
  const supabaseUser = window.journalSupabase?.getUser?.();
  if (supabaseUser?.id) return supabaseUser.id;
  let userId = localStorage.getItem('XtinJournalUserId') || localStorage.getItem('XtinUserId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem('XtinJournalUserId', userId);
  }
  return userId;
}

function appendAICoachPageMessage(message, type = 'coach') {
  const container = document.getElementById('aiCoachPageMessages');
  if (!container) return null;
  const item = document.createElement('div');
  item.className = `ai-page-message ${type}`;
  item.textContent = message;
  container.appendChild(item);
  container.scrollTop = container.scrollHeight;
  return item;
}

function getAICoachTradesPayload() {
  return getAllTrades().map(trade => ({
    id: trade.id || Date.now(),
    symbol: trade.asset || trade.symbol || 'UNKNOWN',
    entry_price: parseFloat(trade.entryPrice || trade.entry_price || 0),
    exit_price: parseFloat(trade.exitPrice || trade.exit_price || 0),
    quantity: parseInt(trade.quantity || 1),
    profit_loss: parseFloat(trade.pnl || trade.profit_loss || 0),
    trading_type: trade.type || trade.trading_type || 'Unknown',
    market: trade.market || 'Equity',
    strategy: trade.strategy || 'Unknown',
    date: trade.date || new Date().toISOString().split('T')[0],
    exit_date: trade.exitDate || trade.exit_date || trade.date || new Date().toISOString().split('T')[0],
    time_in_trade: trade.timeInTrade || null,
    win_loss: parseFloat(trade.pnl || trade.profit_loss || 0) > 0 ? 'Win' : 'Loss'
  }));
}

function renderAICoachPage() {
  const stats = document.getElementById('aiCoachStats');
  const insights = document.getElementById('aiCoachInsightsPanel');
  const dna = document.getElementById('aiCoachDnaPanel');
  if (!stats || !insights || !dna) return;

  const allTrades = getAllTrades();
  const total = allTrades.length;
  const pnl = allTrades.reduce((sum, trade) => sum + (parseFloat(trade.pnl || trade.profit_loss || 0) || 0), 0);
  const wins = allTrades.filter(trade => (parseFloat(trade.pnl || trade.profit_loss || 0) || 0) > 0).length;
  const losses = allTrades.filter(trade => (parseFloat(trade.pnl || trade.profit_loss || 0) || 0) < 0).length;
  const winRate = total ? (wins / total * 100) : 0;
  const byStrategy = {};
  allTrades.forEach(trade => {
    const strategy = trade.strategy || 'Unknown';
    const tradePnl = parseFloat(trade.pnl || trade.profit_loss || 0) || 0;
    byStrategy[strategy] = byStrategy[strategy] || { count: 0, pnl: 0 };
    byStrategy[strategy].count += 1;
    byStrategy[strategy].pnl += tradePnl;
  });
  const bestStrategy = Object.entries(byStrategy).sort((a, b) => b[1].pnl - a[1].pnl)[0];
  const riskProfile = winRate >= 55 && pnl >= 0 ? 'Disciplined' : losses > wins ? 'Needs Risk Control' : 'Building Consistency';

  stats.innerHTML = `
    <div class="metric-card"><h3>Total Trades</h3><div class="value">${total}</div></div>
    <div class="metric-card"><h3>Win Rate</h3><div class="value">${winRate.toFixed(1)}%</div></div>
    <div class="metric-card"><h3>Total P&L</h3><div class="value ${pnl >= 0 ? 'positive' : 'negative'}">${formatCurrency(pnl)}</div></div>
    <div class="metric-card"><h3>Token Wallet</h3><div class="value" id="aiCoachStatsWallet">...</div></div>
  `;

  insights.innerHTML = `
    <div class="ai-insight-card">
      <strong>Best Strategy:</strong> ${bestStrategy ? `${bestStrategy[0]} (${formatCurrency(bestStrategy[1].pnl)})` : 'Add trades to calculate'}
    </div>
    <div class="ai-insight-card">
      <strong>Current Edge:</strong> ${total ? `${wins} wins and ${losses} losses across ${total} trades.` : 'No trades saved yet.'}
    </div>
    <div class="ai-insight-card warning">
      <strong>Focus:</strong> ${losses > wins ? 'Reduce losing trade size and review entries before adding risk.' : 'Keep journaling every setup and compare strategy performance weekly.'}
    </div>
  `;

  dna.innerHTML = `
    <div class="ai-insight-card">
      <strong>Trader Type:</strong> ${bestStrategy?.[0] || 'Not enough data'}
    </div>
    <div class="ai-insight-card">
      <strong>Risk Profile:</strong> ${riskProfile}
    </div>
    <div class="ai-insight-card">
      <strong>Markets:</strong> ${[...new Set(allTrades.map(t => t.market || 'Unknown'))].slice(0, 5).join(', ') || 'No markets yet'}
    </div>
  `;
  refreshAICoachPageWallet();
}

async function refreshAICoachPageWallet() {
  const badge = document.getElementById('aiCoachPageWallet');
  const statsWallet = document.getElementById('aiCoachStatsWallet');
  if (!badge && !statsWallet) return;
  try {
    const response = await fetch(`${getBackendURL()}/api/v2/ai/wallet?user_id=${encodeURIComponent(getAICoachUserId())}`);
    if (!response.ok) throw new Error(`Wallet ${response.status}`);
    const payload = await response.json();
    const balance = payload.wallet?.token_balance || 0;
    if (badge) badge.textContent = `${balance.toLocaleString()} tokens`;
    if (statsWallet) statsWallet.textContent = balance.toLocaleString();
  } catch (error) {
    if (badge) badge.textContent = 'Wallet unavailable';
    if (statsWallet) statsWallet.textContent = '-';
  }
}

async function sendAICoachPageMessage(event) {
  event.preventDefault();
  const input = document.getElementById('aiCoachPageInput');
  const message = input?.value.trim();
  if (!message) return;

  input.value = '';
  appendAICoachPageMessage(message, 'user');
  const loading = appendAICoachPageMessage('Thinking...', 'coach');

  try {
    const response = await fetch(`${getBackendURL()}/api/v2/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: getAICoachUserId(),
        message,
        trades: getAICoachTradesPayload()
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = payload.detail;
      throw new Error(typeof detail === 'string' ? detail : (detail?.message || `AI error ${response.status}`));
    }
    loading.textContent = payload.reply || 'No reply returned.';
    if (typeof payload.token_balance === 'number') {
      const badge = document.getElementById('aiCoachPageWallet');
      if (badge) badge.textContent = `${payload.token_balance.toLocaleString()} tokens`;
    }
  } catch (error) {
    loading.className = 'ai-page-message error';
    loading.textContent = error.message || 'AI Coach is not available right now.';
  }
}

function initializePresentationMode() {
  isPresentationMode = true;
  try {
    localStorage.setItem(PRESENTATION_MODE_STORAGE_KEY, 'true');
  } catch (error) {
    console.error('Error saving presentation mode preference:', error);
  }
  applyPresentationModeState();
}

function applyPresentationModeState() {
  document.body.classList.toggle('presentation-mode', isPresentationMode);
  const toggleBtn = document.getElementById('presentationModeToggle');
  const modeChip = document.getElementById('presentationModeChip');

  if (toggleBtn) {
    toggleBtn.textContent = isPresentationMode ? 'Disable Presentation Mode' : 'Enable Presentation Mode';
    toggleBtn.setAttribute('aria-pressed', isPresentationMode ? 'true' : 'false');
  }

  if (modeChip) {
    modeChip.setAttribute('aria-hidden', isPresentationMode ? 'false' : 'true');
  }
}

function togglePresentationMode() {
  isPresentationMode = true;
  applyPresentationModeState();

  try {
    localStorage.setItem(PRESENTATION_MODE_STORAGE_KEY, 'true');
  } catch (error) {
    console.error('Error saving presentation mode preference:', error);
  }

  showToast(
    'Presentation Mode is always enabled for desktop demo.',
    'success'
  );
}

function initializeDemoProfileSelector() {
  const selector = document.getElementById('demoSampleSelector');
  if (!selector) return;

  const options = getSampleDataOptions();
  selector.innerHTML = options
    .map(option => `<option value="${option.id}">${option.name}</option>`)
    .join('');

  let selectedId = '4';
  try {
    const stored = localStorage.getItem(DEMO_SAMPLE_STORAGE_KEY);
    if (stored && options.some(option => option.id === stored)) {
      selectedId = stored;
    }
  } catch (error) {
    console.error('Error loading demo sample preference:', error);
  }

  selector.value = selectedId;
  selector.addEventListener('change', () => {
    try {
      localStorage.setItem(DEMO_SAMPLE_STORAGE_KEY, selector.value);
    } catch (error) {
      console.error('Error saving demo sample preference:', error);
    }
  });
}

function startDemoFlow() {
  const selector = document.getElementById('demoSampleSelector');
  const selectedId = selector && selector.value ? selector.value : '4';
  const options = getSampleDataOptions();
  const selectedOption = options.find(option => option.id === selectedId);

  if (!selectedOption) {
    showToast('Selected demo profile is unavailable.', 'error');
    return;
  }

  loadSampleDataById(selectedId, true);
  switchTab('dashboard');

  if (!isPresentationMode) {
    isPresentationMode = true;
    applyPresentationModeState();
    try {
      localStorage.setItem(PRESENTATION_MODE_STORAGE_KEY, 'true');
    } catch (error) {
      console.error('Error saving presentation mode preference:', error);
    }
  }

  try {
    localStorage.setItem(DEMO_SAMPLE_STORAGE_KEY, selectedId);
  } catch (error) {
    console.error('Error saving demo sample preference:', error);
  }

  showToast(`Demo flow started with ${selectedOption.name}.`, 'success');
}

// Populate Dropdowns
function populateDropdowns() {
  const tradingTypeSelect = document.getElementById('tradingType');
  const tradeMarketSelect = document.getElementById('tradeMarket');

  tradingTypes.forEach(type => {
    tradingTypeSelect.innerHTML += `<option value="${type}">${type}</option>`;
  });

  tradeMarkets.forEach(market => {
    tradeMarketSelect.innerHTML += `<option value="${market}">${market}</option>`;
  });

  updateStrategyInputOptions();
}

function populateQuickTradeDropdowns() {
  const quickType = document.getElementById('quickType');
  const quickMarket = document.getElementById('quickMarket');
  if (quickType && quickType.options.length === 0) {
    tradingTypes.forEach(type => {
      quickType.innerHTML += `<option value="${type}">${type}</option>`;
    });
  }
  if (quickMarket && quickMarket.options.length === 0) {
    tradeMarkets.forEach(market => {
      quickMarket.innerHTML += `<option value="${market}">${market}</option>`;
    });
  }
  if (quickType && !quickType.value) quickType.value = 'Intraday';
  if (quickMarket && !quickMarket.value) quickMarket.value = 'Equity';
  populateTradeCurrencySelectors();
}

function populateTradeCurrencySelectors() {
  const selectors = [
    document.getElementById('tradeCurrency'),
    document.getElementById('quickTradeCurrency')
  ].filter(Boolean);

  selectors.forEach(selector => {
    if (selector.options.length === 0 && typeof CURRENCY_CONFIG === 'object') {
      Object.entries(CURRENCY_CONFIG).forEach(([code, config]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${code} (${config.symbol})`;
        selector.appendChild(option);
      });
    }
    if (!selector.value) selector.value = currentCurrency || 'INR';
  });
}

function setDefaultTradeCurrency(currency) {
  const quickTradeCurrency = document.getElementById('quickTradeCurrency');
  if (quickTradeCurrency) quickTradeCurrency.value = currency || 'INR';

  const tradeCurrency = document.getElementById('tradeCurrency');
  if (tradeCurrency && !currentEditId) tradeCurrency.value = currency || 'INR';
  updateCurrencyLabels();
}

function updateCurrencyLabels() {
  const tradeCurrency = document.getElementById('tradeCurrency')?.value || currentCurrency || 'INR';
  const symbol = typeof getCurrencySymbol === 'function' ? getCurrencySymbol(tradeCurrency) : '₹';
  document.querySelectorAll('.currency-symbol-label').forEach(label => {
    label.textContent = symbol;
  });
}

function readFormValues(fieldIds) {
  return fieldIds.reduce((values, id) => {
    const element = document.getElementById(id);
    if (element) values[id] = element.value;
    return values;
  }, {});
}

function writeFormValues(values) {
  if (!values || typeof values !== 'object') return;
  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element && value !== undefined && value !== null) element.value = value;
  });
}

function setupDraftPersistence() {
  const tradeFields = getTradeFormFieldIds();
  tradeFields.forEach(id => {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener('input', persistTradeDraft);
    element.addEventListener('change', persistTradeDraft);
  });

  const goalFields = ['goalTitle', 'goalMetric', 'goalTimeframe', 'goalTarget'];
  goalFields.forEach(id => {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener('input', persistGoalDraft);
    element.addEventListener('change', persistGoalDraft);
  });
  writeFormValues(safeReadJSON(GOAL_DRAFT_STORAGE_KEY, null));

  const quickFields = getQuickTradeFieldIds();
  quickFields.forEach(id => {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener('input', persistQuickTradeDraft);
    element.addEventListener('change', persistQuickTradeDraft);
  });
  const quickDraft = safeReadJSON(QUICK_TRADE_DRAFT_STORAGE_KEY, null);
  if (quickDraft) writeFormValues(quickDraft);
}

// Populate Setup Lists
function populateSetupLists() {
  populateList('tradingTypesList', tradingTypes);
  populateList('tradeMarketsList', tradeMarkets);
  renderStrategiesSetupList();
  populateList('equitiesList', equities);
  populateList('futuresList', futures);
  populateList('optionsList', options);
  populateList('commoditiesList', commodities);
  populateList('forexList', forex);
  populateList('cryptoList', crypto);
}

function populateList(elementId, items) {
  const container = document.getElementById(elementId);
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = '<div class="setup-list-item" style="opacity:0.6;">No data yet</div>';
    return;
  }
  container.innerHTML = items.map(item => `<div class="setup-list-item">${item}</div>`).join('');
}

function rebuildAssetCategoriesFromTrades() {
  const equitiesSet = new Set();
  const futuresSet = new Set();
  const optionsSet = new Set();
  const commoditiesSet = new Set();
  const forexSet = new Set();
  const cryptoSet = new Set();

  trades.forEach(t => {
    if (!t.asset) return;
    const asset = t.asset.trim();
    const lower = asset.toLowerCase();
    if (/(industries|bank|infosys|tcs|itc|airtel|forge|systems|tyres|organics|fertilis|steel|motors|india)/.test(lower)) equitiesSet.add(asset);
    if (/(fut|nifty|bank nifty|banknifty)/.test(lower)) futuresSet.add(asset);
    if (/(nifty|sensex|banknifty|option|call|put)/.test(lower)) optionsSet.add(asset);
    if (/(gold|silver|alum|copper|lead|nickel|zinc|crude|oil|gas|wheat|maize|corn|rice|gram|lentil|moong|soy|mustard|castor|groundnut|cotton|jeera|turmeric|coriander|cardamom|pepper|jute)/.test(lower)) commoditiesSet.add(asset);
    if (/(usd|inr|eur|gbp|jpy|aud|nzd|forex|gbp\/|eur\/|usd\/)/.test(lower)) forexSet.add(asset);
    if (/(btc|bitcoin|eth|ethereum|bnb|xrp|litecoin|ltc|bch|tether|usdt|crypto)/.test(lower)) cryptoSet.add(asset);
  });

  equities = Array.from(equitiesSet).sort();
  futures = Array.from(futuresSet).sort();
  options = Array.from(optionsSet).sort();
  commodities = Array.from(commoditiesSet).sort();
  forex = Array.from(forexSet).sort();
  crypto = Array.from(cryptoSet).sort();

  populateSetupLists();
}

// Trade Management Functions
function getTradeFormFieldIds() {
  return [
    'tradeDate', 'exitDate', 'entryTime', 'exitTime', 'tradeTimeZone', 'tradingType', 'tradeMarket', 'assetName',
    'tradeCurrency', 'quantity', 'entryPrice', 'targetPrice', 'stopLoss', 'exitPrice', 'brokerage', 'pnl', 'strategy',
    'margin', 'buySell', 'contract', 'strikePrice', 'optionType', 'underlyingPrice',
    'impliedVolatility', 'daysToExpiry', 'notes', 'tags', 'emotion'
  ];
}

function getQuickTradeFieldIds() {
  return [
    'quickDate', 'quickExitDate', 'quickEntryTime', 'quickBuySell', 'quickTradeCurrency', 'quickAsset', 'quickQuantity',
    'quickEntryPrice', 'quickExitPrice', 'quickPnl', 'quickType', 'quickMarket', 'quickStrategy'
  ];
}

function persistTradeDraft() {
  if (currentEditId) return;
  localStorage.setItem(TRADE_DRAFT_STORAGE_KEY, JSON.stringify(readFormValues(getTradeFormFieldIds())));
  saveJournalCloudState('drafts');
}

function persistQuickTradeDraft() {
  localStorage.setItem(QUICK_TRADE_DRAFT_STORAGE_KEY, JSON.stringify(readFormValues(getQuickTradeFieldIds())));
  saveJournalCloudState('drafts');
}

function persistGoalDraft() {
  localStorage.setItem(GOAL_DRAFT_STORAGE_KEY, JSON.stringify(readFormValues(['goalTitle', 'goalMetric', 'goalTimeframe', 'goalTarget'])));
  saveJournalCloudState('drafts');
}

function openTradeModal(tradeId = null) {
  const modal = document.getElementById('tradeModal');
  const modalTitle = document.getElementById('modalTitle');
  const firstInput = document.getElementById('tradeDate');
  lastFocusedElement = document.activeElement;

  currentEditId = tradeId;

  if (tradeId) {
    modalTitle.textContent = 'Edit Trade';
    const trade = trades.find(t => t.id === tradeId);
    if (trade) {
      document.getElementById('tradeDate').value = trade.date;
      document.getElementById('exitDate').value = trade.exitDate || trade.date;
      document.getElementById('entryTime').value = trade.entryTime;
      document.getElementById('exitTime').value = trade.exitTime;
      document.getElementById('tradeTimeZone').value = trade.timeZone || getSelectedTimeZone();
      document.getElementById('tradingType').value = trade.type;
      document.getElementById('tradeMarket').value = trade.market;
      document.getElementById('assetName').value = trade.asset;
      document.getElementById('tradeCurrency').value = getTradeCurrency(trade);
      document.getElementById('quantity').value = trade.quantity;
      document.getElementById('entryPrice').value = trade.entryPrice;
      document.getElementById('targetPrice').value = trade.targetPrice || '';
      document.getElementById('stopLoss').value = trade.stopLoss || '';
      document.getElementById('exitPrice').value = trade.exitPrice;
      document.getElementById('brokerage').value = trade.brokerage;
      document.getElementById('pnl').value = trade.pnl !== undefined ? trade.pnl : '';
      document.getElementById('strategy').value = trade.strategy || '';
      document.getElementById('margin').value = trade.margin;

      // Advanced fields
      document.getElementById('buySell').value = trade.buySell || 'Buy';
      document.getElementById('contract').value = trade.contract || 'NOV-2025';
      document.getElementById('strikePrice').value = trade.strikePrice || '';
      document.getElementById('optionType').value = trade.optionType || '';
      document.getElementById('notes').value = trade.notes || '';
      document.getElementById('tags').value = (trade.tags || []).join(', ');
      document.getElementById('emotion').value = trade.emotion || 'neutral';

      // Greeks and IV fields
      document.getElementById('underlyingPrice').value = trade.underlyingPrice || '';
      document.getElementById('impliedVolatility').value = trade.impliedVolatility || '';
      document.getElementById('daysToExpiry').value = trade.daysToExpiry || '';

      // Recalculate Greeks if data exists
      if (trade.optionType && trade.strikePrice) {
        calculateGreeks();
      }
    }
  } else {
    modalTitle.textContent = 'Add New Trade';
    clearForm();
    const draft = safeReadJSON(TRADE_DRAFT_STORAGE_KEY, null);
    if (draft) {
      writeFormValues(draft);
      showToast('Restored your unsaved trade draft', 'success');
    }
  }

  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  updateCurrencyLabels();
  updatePnLPreview();
  if (firstInput) firstInput.focus();
  document.addEventListener('keydown', handleModalKeydown);
}

function closeTradeModal() {
  const modal = document.getElementById('tradeModal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  document.removeEventListener('keydown', handleModalKeydown);
  currentEditId = null;
  clearForm();

  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

function handleModalKeydown(event) {
  const modal = document.getElementById('tradeModal');
  if (!modal || !modal.classList.contains('show')) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closeTradeModal();
    return;
  }

  if (event.key !== 'Tab') return;

  const focusableElements = Array.from(
    modal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ).filter(el => !el.hasAttribute('disabled'));

  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function clearForm() {
  const today = getTodayInSelectedTimeZone();
  document.getElementById('tradeDate').value = today;
  document.getElementById('exitDate').value = today;
  document.getElementById('entryTime').value = '';
  document.getElementById('exitTime').value = '';
  document.getElementById('tradeTimeZone').value = getSelectedTimeZone();
  document.getElementById('tradingType').value = '';
  document.getElementById('tradeMarket').value = '';
  document.getElementById('assetName').value = '';
  const tradeCurrency = document.getElementById('tradeCurrency');
  if (tradeCurrency) tradeCurrency.value = currentCurrency || 'INR';
  document.getElementById('quantity').value = '1';
  document.getElementById('entryPrice').value = '';
  document.getElementById('targetPrice').value = '';
  document.getElementById('stopLoss').value = '';
  document.getElementById('exitPrice').value = '';
  document.getElementById('brokerage').value = '0';
  document.getElementById('pnl').value = '';
  document.getElementById('strategy').value = '';
  document.getElementById('margin').value = '';

  // Clear advanced fields
  document.getElementById('buySell').value = 'Buy';
  document.getElementById('contract').value = 'NOV-2025';
  document.getElementById('strikePrice').value = '';
  document.getElementById('optionType').value = '';
  document.getElementById('notes').value = '';
  document.getElementById('tags').value = '';
  document.getElementById('emotion').value = 'confident';

  // Clear Greeks and IV fields
  document.getElementById('underlyingPrice').value = '';
  document.getElementById('impliedVolatility').value = '';
  document.getElementById('daysToExpiry').value = '';
  document.getElementById('deltaValue').textContent = '-';
  document.getElementById('gammaValue').textContent = '-';
  document.getElementById('thetaValue').textContent = '-';
  document.getElementById('vegaValue').textContent = '-';

  updatePnLPreview();
}

function updatePnLPreview() {
  const pnlInput = document.getElementById('pnl');
  const pnl = parseFloat(pnlInput ? pnlInput.value : 0) || 0;
  const tradeCurrency = document.getElementById('tradeCurrency')?.value || currentCurrency || 'INR';

  const pnlElement = document.getElementById('pnlValue');
  if (pnlElement) {
    pnlElement.textContent = formatNativeCurrency(pnl, tradeCurrency);
    pnlElement.className = 'pnl-value';
    if (pnl > 0) {
      pnlElement.classList.add('positive');
    } else if (pnl < 0) {
      pnlElement.classList.add('negative');
    }
  }
}

function saveTrade() {
  // Validate required fields
  const requiredFields = [
    { id: 'tradeDate', name: 'Trade Date' },
    { id: 'exitDate', name: 'Exit Day' },
    { id: 'entryTime', name: 'Entry Time' },
    { id: 'exitTime', name: 'Exit Time' },
    { id: 'tradeTimeZone', name: 'Time Zone' },
    { id: 'tradingType', name: 'Trading Type' },
    { id: 'tradeMarket', name: 'Trade Market' },
    { id: 'assetName', name: 'Asset Name' },
    { id: 'quantity', name: 'Quantity' },
    { id: 'entryPrice', name: 'Entry Price' },
    { id: 'exitPrice', name: 'Exit Price' },
    { id: 'pnl', name: 'P&L' },
    { id: 'strategy', name: 'Strategy' },
    { id: 'margin', name: 'Margin' }
  ];

  for (const field of requiredFields) {
    const element = document.getElementById(field.id);
    const value = element.value ? element.value.trim() : '';
    if (!value) {
      showToast(`Please fill in ${field.name}`, 'error');
      element.focus();
      return;
    }
  }
  const strategyName = normalizeStrategyName(document.getElementById('strategy').value);
  if (document.getElementById('exitDate').value < document.getElementById('tradeDate').value) {
    showToast('Exit day cannot be before trade date', 'error');
    document.getElementById('exitDate').focus();
    return;
  }
  if (!strategyName) {
    showToast('Please enter a strategy', 'error');
    document.getElementById('strategy').focus();
    return;
  }
  document.getElementById('strategy').value = strategyName;

  // Parse tags from comma-separated string
  const tagsInput = document.getElementById('tags').value.trim();
  const tagsArray = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

  const trade = {
    date: document.getElementById('tradeDate').value,
    exitDate: document.getElementById('exitDate').value,
    entryTime: document.getElementById('entryTime').value,
    exitTime: document.getElementById('exitTime').value,
    timeZone: document.getElementById('tradeTimeZone').value || getSelectedTimeZone(),
    type: document.getElementById('tradingType').value,
    market: document.getElementById('tradeMarket').value,
    asset: document.getElementById('assetName').value,
    currency: document.getElementById('tradeCurrency')?.value || currentCurrency || 'INR',
    quantity: parseFloat(document.getElementById('quantity').value),
    entryPrice: parseFloat(document.getElementById('entryPrice').value),
    targetPrice: parseFloat(document.getElementById('targetPrice').value) || 0,
    stopLoss: parseFloat(document.getElementById('stopLoss').value) || 0,
    exitPrice: parseFloat(document.getElementById('exitPrice').value),
    brokerage: parseFloat(document.getElementById('brokerage').value) || 0,
    pnl: parseFloat(document.getElementById('pnl').value) || 0,
    strategy: strategyName,
    margin: parseFloat(document.getElementById('margin').value),

    // ADVANCED FIELDS
    buySell: document.getElementById('buySell').value,
    contract: document.getElementById('contract').value || 'NOV-2025',
    strikePrice: parseFloat(document.getElementById('strikePrice').value) || null,
    optionType: document.getElementById('optionType').value || null,
    notes: document.getElementById('notes').value.trim() || '',
    tags: tagsArray,
    emotion: document.getElementById('emotion').value || 'neutral',

    // OPTIONS GREEKS & IV
    underlyingPrice: parseFloat(document.getElementById('underlyingPrice').value) || null,
    impliedVolatility: parseFloat(document.getElementById('impliedVolatility').value) || null,
    daysToExpiry: parseFloat(document.getElementById('daysToExpiry').value) || null
  };

  // Calculate and store Greeks if it's an options trade
  if (trade.optionType && trade.strikePrice && trade.underlyingPrice && trade.impliedVolatility && trade.daysToExpiry) {
    const greeks = calculateGreeks();
    if (greeks) {
      trade.greeks = greeks;
    }
  }

  rememberCustomStrategy(strategyName);

  if (currentEditId) {
    const index = trades.findIndex(t => t.id === currentEditId);
    if (index !== -1) {
      trade.id = currentEditId;
      trades[index] = trade;
      showToast('Trade updated successfully!', 'success');
    }
  } else {
    trade.id = trades.length > 0 ? Math.max(...trades.map(t => t.id)) + 1 : 1;
    trades.push(trade);
    showToast('Trade added successfully!', 'success');
  }

  saveToDatabase(); // Save to database
  localStorage.removeItem(TRADE_DRAFT_STORAGE_KEY);
  saveJournalCloudState('drafts');
  filteredTrades = [...trades];
  renderTradesTable();
  closeTradeModal();
  renderDashboard();
  renderSummaryMetrics();
  updateMonthlyView();
  updateDailyView();
  renderAnalytics();
  renderHeatmapsTab();
  rebuildAssetCategoriesFromTrades();
  refreshStrategyOptionsUI();
}

function handleQuickTrade(event) {
  event.preventDefault();
  const requiredFields = [
    { id: 'quickDate', name: 'Date' },
    { id: 'quickExitDate', name: 'Exit day' },
    { id: 'quickEntryTime', name: 'Time' },
    { id: 'quickAsset', name: 'Asset' },
    { id: 'quickQuantity', name: 'Quantity' },
    { id: 'quickEntryPrice', name: 'Entry price' },
    { id: 'quickExitPrice', name: 'Exit price' },
    { id: 'quickPnl', name: 'P&L' },
    { id: 'quickType', name: 'Trading type' },
    { id: 'quickMarket', name: 'Market' },
    { id: 'quickStrategy', name: 'Strategy' }
  ];

  for (const field of requiredFields) {
    const element = document.getElementById(field.id);
    if (!element || !String(element.value || '').trim()) {
      showToast(`Please fill in ${field.name}`, 'error');
      element?.focus();
      return;
    }
  }

  const date = document.getElementById('quickDate').value;
  const exitDate = document.getElementById('quickExitDate').value || date;
  const entryTime = document.getElementById('quickEntryTime').value;
  const buySell = document.getElementById('quickBuySell').value || 'Buy';
  const asset = document.getElementById('quickAsset').value.trim();
  const quantity = parseFloat(document.getElementById('quickQuantity').value);
  const entryPrice = parseFloat(document.getElementById('quickEntryPrice').value);
  const exitPrice = parseFloat(document.getElementById('quickExitPrice').value);
  const pnl = parseFloat(document.getElementById('quickPnl').value) || 0;
  const strategyName = normalizeStrategyName(document.getElementById('quickStrategy').value);
  const currency = document.getElementById('quickTradeCurrency')?.value || currentCurrency || 'INR';

  if (exitDate < date) {
    showToast('Exit day cannot be before trade date', 'error');
    document.getElementById('quickExitDate').focus();
    return;
  }

  if (!strategyName || quantity <= 0 || !isFinite(entryPrice) || !isFinite(exitPrice) || !isFinite(pnl)) {
    showToast('Quick trade values look incomplete', 'error');
    return;
  }

  const trade = {
    id: trades.length > 0 ? Math.max(...trades.map(t => t.id)) + 1 : 1,
    date,
    exitDate,
    entryTime,
    exitTime: entryTime,
    timeZone: getSelectedTimeZone(),
    type: document.getElementById('quickType').value,
    market: document.getElementById('quickMarket').value,
    asset,
    currency,
    quantity,
    entryPrice,
    targetPrice: 0,
    stopLoss: 0,
    exitPrice,
    brokerage: 0,
    strategy: strategyName,
    margin: Math.abs(entryPrice * quantity),
    buySell,
    contract: getContractLabelFromDate(date),
    strikePrice: null,
    optionType: null,
    notes: 'Quick add',
    tags: ['quick-add'],
    emotion: 'neutral',
    underlyingPrice: null,
    impliedVolatility: null,
    daysToExpiry: null,
    pnl
  };

  trades.push(trade);
  rememberCustomStrategy(strategyName);
  saveToDatabase();
  filteredTrades = [...trades];
  localStorage.removeItem(QUICK_TRADE_DRAFT_STORAGE_KEY);
  saveJournalCloudState('drafts');

  document.getElementById('quickAsset').value = '';
  document.getElementById('quickQuantity').value = '1';
  document.getElementById('quickEntryPrice').value = '';
  document.getElementById('quickExitPrice').value = '';
  document.getElementById('quickPnl').value = '';
  document.getElementById('quickEntryTime').value = getCurrentTimeInSelectedTimeZone();
  document.getElementById('quickExitDate').value = document.getElementById('quickDate').value || getTodayInSelectedTimeZone();

  renderTradesTable();
  renderDashboard();
  renderSummaryMetrics();
  updateMonthlyView();
  updateDailyView();
  renderAnalytics();
  renderHeatmapsTab();
  rebuildAssetCategoriesFromTrades();
  refreshStrategyOptionsUI();
  showToast('Quick trade saved', 'success');
}

function deleteTrade(id) {
  const runDelete = () => {
    trades = trades.filter(t => t.id !== id);
    saveToDatabase(); // Save to database
    filteredTrades = [...trades];
    renderTradesTable();
    renderDashboard();
    renderSummaryMetrics();
    updateMonthlyView();
    updateDailyView();
    renderAnalytics();
    renderHeatmapsTab();
    rebuildAssetCategoriesFromTrades();
    refreshStrategyOptionsUI();
    showToast('Trade deleted successfully!', 'success');
  };
  if (window.JournalUX?.confirm) {
    window.JournalUX.confirm({
      title: 'Delete this trade?',
      message: 'It will be removed from every metric, chart and analysis. This cannot be undone.',
      confirmText: 'Delete Trade',
      danger: true
    }).then((ok) => { if (ok) runDelete(); });
  } else if (confirm('Are you sure you want to delete this trade?')) {
    runDelete();
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

let currentAuthMode = 'signin';

function openJournalAuthModal() {
  const modal = document.getElementById('journalAuthModal');
  if (!modal) return;
  switchJournalAuthTab('signin');
  updateJournalAuthModalState();
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  setTimeout(() => document.getElementById('journalAuthEmail')?.focus(), 50);
}

function closeJournalAuthModal() {
  const modal = document.getElementById('journalAuthModal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

function switchJournalAuthTab(mode) {
  currentAuthMode = mode;
  const tabSignin = document.getElementById('authTabSignin');
  const tabSignup = document.getElementById('authTabSignup');
  const title = document.getElementById('journalAuthModalTitle');
  const subtitle = document.getElementById('journalAuthSubtitle');
  const submitBtnText = document.querySelector('#journalAuthSubmitBtn .btn-text');
  
  if (tabSignin) {
    tabSignin.classList.toggle('active', mode === 'signin');
    tabSignin.setAttribute('aria-selected', mode === 'signin');
  }
  if (tabSignup) {
    tabSignup.classList.toggle('active', mode === 'signup');
    tabSignup.setAttribute('aria-selected', mode === 'signup');
  }
  
  const isSignup = mode === 'signup';
  showJournalAuthSignupFields(isSignup);
  
  const forgotContainer = document.getElementById('forgotPasswordContainer');
  if (forgotContainer) forgotContainer.style.display = isSignup ? 'none' : 'block';

  if (title) title.textContent = isSignup ? 'Create Your Xtin Account' : 'Sign in to Xtin Journal';
  if (subtitle) subtitle.textContent = isSignup 
    ? 'Start syncing your trades, psychology notes, and AI insights across all your devices.' 
    : 'Welcome back! Your trades, drafts, goals, and settings stay attached to your account.';
    
  if (submitBtnText) submitBtnText.textContent = isSignup ? 'Create Account' : 'Sign In';

  // Clear previous message on tab switch
  const messageEl = document.getElementById('journalAuthMessage');
  if (messageEl) {
    messageEl.textContent = '';
    messageEl.className = 'auth-message';
  }
}

function toggleAuthPasswordVisibility() {
  const input = document.getElementById('journalAuthPassword');
  const showIcon = document.querySelector('.eye-show');
  const hideIcon = document.querySelector('.eye-hide');
  if (!input) return;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  if (showIcon) showIcon.style.display = isPassword ? 'none' : 'block';
  if (hideIcon) hideIcon.style.display = isPassword ? 'block' : 'none';
}

function setAuthButtonLoading(loading) {
  const submitBtn = document.getElementById('journalAuthSubmitBtn');
  if (!submitBtn) return;
  const btnText = submitBtn.querySelector('.btn-text');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');
  submitBtn.disabled = loading;
  if (btnText) btnText.style.display = loading ? 'none' : 'inline-block';
  if (btnSpinner) btnSpinner.style.display = loading ? 'inline-flex' : 'none';
}

function formatAuthError(error) {
  const msg = (error?.message || '').toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (msg.includes('user already registered') || msg.includes('already exists')) {
    return 'An account with this email already exists. Try signing in instead!';
  }
  if (msg.includes('password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many attempts. Please wait a few moments before trying again.';
  }
  if (/failed to fetch|network|fetch/i.test(msg)) {
    return 'Could not connect to authentication service. Check your internet connection.';
  }
  return error?.message || 'Authentication failed. Please try again.';
}

async function handleJournalAuth(event) {
  event.preventDefault();
  const mode = currentAuthMode;
  
  const email = document.getElementById('journalAuthEmail')?.value.trim();
  const password = document.getElementById('journalAuthPassword')?.value;
  const name = document.getElementById('journalAuthName')?.value.trim();
  const ageValue = document.getElementById('journalAuthAge')?.value;
  const age = ageValue ? parseInt(ageValue, 10) : null;

  if (!email || !password) {
    setJournalAuthMessage('Please fill in both email and password.', 'error');
    return;
  }
  if (mode === 'signup' && !name) {
    setJournalAuthMessage('Please enter your full name to create an account.', 'error');
    document.getElementById('journalAuthName')?.focus();
    return;
  }
  if (mode === 'signup' && (!age || age < 13 || age > 120)) {
    setJournalAuthMessage('Please enter a valid age (13 to 120) to create an account.', 'error');
    document.getElementById('journalAuthAge')?.focus();
    return;
  }
  if (!window.journalSupabase?.isConfigured?.()) {
    setJournalAuthMessage('Authentication backend is currently configuring. Local journal mode remains active.', 'error');
    return;
  }

  setAuthButtonLoading(true);

  try {
    if (mode === 'signup') {
      await window.journalSupabase.signUp(email, password, {
        full_name: name,
        age
      });
      setJournalAuthMessage('🎉 Account created! Check your email to verify your address, then sign in.', 'success');
      showToast('Account created! Verify your email to complete registration.', 'success');
      switchJournalAuthTab('signin');
    } else {
      await window.journalSupabase.signIn(email, password);
      const user = window.journalSupabase.getUser?.();
      const displayName = window.journalSupabase.getDisplayName?.() || user?.user_metadata?.full_name || 'trader';
      setJournalAuthMessage(`Welcome back to Xtin Journal, ${displayName}!`, 'success');
      showToast(`Welcome back, ${displayName}!`, 'success');
      closeJournalAuthModal();
      await reloadJournalFromCloud({ showToast: false });
    }
  } catch (error) {
    const friendly = formatAuthError(error);
    setJournalAuthMessage(friendly, 'error');
  } finally {
    setAuthButtonLoading(false);
  }
}

async function handleForgotPassword(event) {
  if (event) event.preventDefault();
  const email = document.getElementById('journalAuthEmail')?.value.trim();
  if (!email) {
    setJournalAuthMessage('Please enter your email address above to reset your password.', 'error');
    document.getElementById('journalAuthEmail')?.focus();
    return;
  }
  if (!window.journalSupabase?.isConfigured?.()) {
    setJournalAuthMessage('Authentication backend is not active.', 'error');
    return;
  }
  setAuthButtonLoading(true);
  try {
    await window.journalSupabase.resetPassword(email);
    setJournalAuthMessage(`Password reset link sent to ${email}! Check your inbox or spam folder.`, 'success');
    showToast(`Password reset link sent to ${email}`, 'success');
  } catch (error) {
    setJournalAuthMessage(formatAuthError(error), 'error');
  } finally {
    setAuthButtonLoading(false);
  }
}

function setJournalAuthMessage(message, type = 'info') {
  const messageEl = document.getElementById('journalAuthMessage');
  if (!messageEl) return;
  messageEl.textContent = message;
  messageEl.className = `auth-message show ${type}`;
}

function showJournalAuthSignupFields(show) {
  const fields = document.getElementById('journalAuthProfileFields');
  if (!fields) return;
  fields.classList.toggle('show', Boolean(show));
  document.getElementById('journalAuthName')?.toggleAttribute('required', Boolean(show));
  document.getElementById('journalAuthAge')?.toggleAttribute('required', Boolean(show));
}

function updateJournalAuthModalState() {
  const user = window.journalSupabase?.getUser?.();
  const title = document.getElementById('journalAuthModalTitle');
  const subtitle = document.getElementById('journalAuthSubtitle');
  if (user) {
    const displayName = window.journalSupabase.getDisplayName?.() || user.user_metadata?.full_name || 'trader';
    if (title) title.textContent = 'Account Connected';
    if (subtitle) subtitle.textContent = `Signed in as ${displayName} (${user.email}). Your trades sync automatically.`;
    setJournalAuthMessage(`You are currently signed in as ${displayName}.`, 'success');
  }
}

async function signOutJournalUser() {
  await window.journalSupabase?.signOut?.();
  showToast('Signed out', 'success');
}

async function changeJournalUserName() {
  const user = window.journalSupabase?.getUser?.();
  if (!user) {
    showToast('Please sign in first', 'error');
    return;
  }

  const currentName = window.journalSupabase.getDisplayName?.() || '';
  const nextName = prompt('Enter your display name', currentName);
  if (nextName === null) return;

  const cleanedName = nextName.trim();
  if (!cleanedName) {
    showToast('Name cannot be empty', 'error');
    return;
  }

  try {
    await window.journalSupabase.updateProfile?.({
      ...user.user_metadata,
      full_name: cleanedName
    });
    await saveJournalCloudState('settings');
    updateJournalAuthModalState();
    showToast(`Name updated to ${cleanedName}`, 'success');
  } catch (error) {
    showToast(error.message || 'Could not update name', 'error');
  }
}

// Render Trades Table
function renderTradesTable() {
  const tbody = document.getElementById('tradesTableBody');
  tbody.innerHTML = filteredTrades.map(trade => {
    const status = trade.pnl > 0 ? 'Win' : trade.pnl < 0 ? 'Loss' : 'Breakeven';
    const statusClass = trade.pnl > 0 ? 'status-win' : trade.pnl < 0 ? 'status-loss' : 'status-breakeven';
    const rowClass = trade.pnl > 0 ? 'win-row' : trade.pnl < 0 ? 'loss-row' : '';

    // Format buy/sell with color
    const buySellClass = trade.buySell === 'Buy' ? 'status-win' : 'status-loss';
    const buySellText = trade.buySell === 'Buy' ? 'BUY' : 'SELL';
    const buySellBadge = `<span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: ${trade.buySell === 'Buy' ? '#d1fae5' : '#fee2e2'}; color: ${trade.buySell === 'Buy' ? '#065f46' : '#991b1b'};">${buySellText}</span>`;

    // Emotion text mapping
    const emotionText = {
      'confident': 'Confident',
      'neutral': 'Neutral',
      'uncertain': 'Uncertain',
      'frustrated': 'Frustrated',
      'excited': 'Excited',
      'fearful': 'Fearful',
      'greedy': 'Greedy'
    };

    // Truncate notes for preview
    const notesPreview = (trade.notes || '').length > 30
      ? (trade.notes || '').substring(0, 30) + '...'
      : (trade.notes || '-');

    return `
      <tr class="${rowClass}">
        <td>${formatDate(trade.date)}</td>
        <td>${formatDate(trade.exitDate || trade.date)}</td>
        <td>${buySellBadge}</td>
        <td>${trade.entryTime}</td>
        <td>${trade.exitTime}</td>
        <td>${getShortTimeZoneLabel(trade.timeZone || getSelectedTimeZone())}</td>
        <td>${trade.type}</td>
        <td>${trade.market}</td>
        <td>${trade.asset}</td>
        <td>${getTradeCurrency(trade)}</td>
        <td>${trade.quantity}</td>
        <td>${formatTradeCurrency(trade.entryPrice, trade)}</td>
        <td>${formatTradeCurrency(trade.targetPrice || 0, trade)}</td>
        <td>${formatTradeCurrency(trade.stopLoss || 0, trade)}</td>
        <td>${formatTradeCurrency(trade.exitPrice, trade)}</td>
        <td>${formatTradeCurrency(trade.brokerage, trade)}</td>
        <td>${trade.strategy}</td>
        <td>${formatTradeCurrency(trade.margin, trade)}</td>
        <td class="${statusClass}">${formatTradeCurrency(trade.pnl, trade)}</td>
        <td class="${statusClass}">${status}</td>
        <td title="${trade.emotion || 'neutral'}">${emotionText[trade.emotion || 'neutral'] || 'Neutral'}</td>
        <td title="${trade.notes || ''}" style="max-width: 150px; overflow: hidden; text-overflow: ellipsis;">${notesPreview}</td>
        <td>
          <button class="btn btn-edit" onclick="openTradeModal(${trade.id})">Edit</button>
          <button class="btn btn-delete" onclick="deleteTrade(${trade.id})">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Summary Metrics
function renderSummaryMetrics() {
  const metrics = calculateMetrics(trades);
  const container = document.getElementById('summaryMetrics');

  container.innerHTML = `
    <div class="metric-card">
      <h3>Total Trades</h3>
      <div class="value">${metrics.totalTrades}</div>
    </div>
    <div class="metric-card">
      <h3>Total P&amp;L</h3>
      <div class="value ${metrics.totalPnL >= 0 ? 'positive' : 'negative'}">${formatCurrency(metrics.totalPnL)}</div>
    </div>
    <div class="metric-card">
      <h3>Win Rate</h3>
      <div class="value positive">${metrics.winRate.toFixed(2)}%</div>
    </div>
    <div class="metric-card">
      <h3>Avg P/L Per Trade</h3>
      <div class="value ${metrics.avgPnL >= 0 ? 'positive' : 'negative'}">${formatCurrency(metrics.avgPnL)}</div>
    </div>
    <div class="metric-card">
      <h3>Largest Win</h3>
      <div class="value positive">${formatCurrency(metrics.largestWin)}</div>
    </div>
    <div class="metric-card">
      <h3>Largest Loss</h3>
      <div class="value negative">${formatCurrency(metrics.largestLoss)}</div>
    </div>
    <div class="metric-card">
      <h3>Avg Winning Trade</h3>
      <div class="value positive">${formatCurrency(metrics.avgWin)}</div>
    </div>
    <div class="metric-card">
      <h3>Avg Losing Trade</h3>
      <div class="value negative">${formatCurrency(metrics.avgLoss)}</div>
    </div>
    
    <!-- ADVANCED RISK METRICS -->
    <div class="metric-card" style="border: 2px solid #3b82f6;">
      <h3>⭐ Sharpe Ratio</h3>
      <div class="value ${metrics.sharpeRatio >= 1 ? 'positive' : 'negative'}">${metrics.sharpeRatio.toFixed(3)}</div>
      <small style="opacity: 0.7;">${metrics.sharpeRatio >= 2 ? 'Excellent' : metrics.sharpeRatio >= 1 ? 'Good' : 'Poor'}</small>
    </div>
    <div class="metric-card" style="border: 2px solid #3b82f6;">
      <h3>⭐ Sortino Ratio</h3>
      <div class="value ${metrics.sortinoRatio >= 1 ? 'positive' : 'negative'}">${metrics.sortinoRatio.toFixed(3)}</div>
      <small style="opacity: 0.7;">${metrics.sortinoRatio >= 2 ? 'Excellent' : metrics.sortinoRatio >= 1 ? 'Good' : 'Poor'}</small>
    </div>
    <div class="metric-card" style="border: 2px solid #dc2626;">
      <h3>⭐ Max Drawdown</h3>
      <div class="value negative">${formatCurrency(metrics.maxDrawdown)}</div>
      <small style="opacity: 0.7;">${metrics.maxDrawdownPercent.toFixed(1)}% of peak</small>
    </div>
    <div class="metric-card" style="border: 2px solid #059669;">
      <h3>⭐ Profit Factor</h3>
      <div class="value ${metrics.profitFactor >= 2 ? 'positive' : metrics.profitFactor >= 1 ? '' : 'negative'}">${metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}</div>
      <small style="opacity: 0.7;">${metrics.profitFactor >= 2 ? 'Excellent' : metrics.profitFactor >= 1 ? 'Profitable' : 'Unprofitable'}</small>
    </div>
    <div class="metric-card" style="border: 2px solid #059669;">
      <h3>⭐ Expectancy</h3>
      <div class="value ${metrics.expectancy >= 0 ? 'positive' : 'negative'}">${formatCurrency(metrics.expectancy)}</div>
      <small style="opacity: 0.7;">Per trade expected</small>
    </div>
    <div class="metric-card" style="border: 2px solid #fbbf24;">
      <h3>⭐ Current Streak</h3>
      <div class="value ${metrics.currentStreak.type === 'win' ? 'positive' : 'negative'}">${metrics.currentStreak.count} ${metrics.currentStreak.type || 'None'}${metrics.currentStreak.count > 1 ? 's' : ''}</div>
      <small style="opacity: 0.7;">Max Win: ${metrics.longestWinStreak} | Max Loss: ${metrics.longestLossStreak}</small>
    </div>
    <div class="metric-card" style="border: 2px solid #a855f7;">
      <h3>⭐ Kelly %</h3>
      <div class="value ${metrics.kellyPercent > 0 ? 'positive' : 'negative'}">${(metrics.kellyPercent * 100).toFixed(1)}%</div>
      <small style="opacity: 0.7;">Optimal position size</small>
    </div>
    <div class="metric-card" style="border: 2px solid #3b82f6;">
      <h3>⭐ Calmar Ratio</h3>
      <div class="value ${metrics.calmarRatio >= 3 ? 'positive' : ''}">${metrics.calmarRatio.toFixed(2)}</div>
      <small style="opacity: 0.7;">${metrics.calmarRatio >= 3 ? 'Excellent' : metrics.calmarRatio >= 1 ? 'Good' : 'Poor'}</small>
    </div>
  `;

  renderSummaryCharts();
}

function calculateMetrics(tradesList) {
  const totalTrades = tradesList.length;
  const normalizedTrades = tradesList.map(trade => ({
    ...trade,
    pnlInINR: convertTradeAmountToINR(trade.pnl, trade),
    marginInINR: convertTradeAmountToINR(trade.margin, trade)
  }));
  const totalPnL = normalizedTrades.reduce((sum, trade) => sum + trade.pnlInINR, 0);
  const wins = normalizedTrades.filter(t => t.pnlInINR > 0);
  const losses = normalizedTrades.filter(t => t.pnlInINR < 0);

  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
  const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0;
  const largestWin = wins.length > 0 ? Math.max(...wins.map(t => t.pnlInINR)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map(t => t.pnlInINR)) : 0;
  const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnlInINR, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + t.pnlInINR, 0) / losses.length : 0;

  // ========== ADVANCED RISK METRICS ==========

  // 1. Sharpe Ratio (risk-adjusted return)
  const returns = normalizedTrades.map(t => t.pnlInINR);
  const avgReturn = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length || 1));
  const riskFreeRate = 0; // Assuming 0 for simplicity
  const sharpeRatio = stdDev > 0 ? (avgReturn - riskFreeRate) / stdDev : 0;

  // 2. Sortino Ratio (downside risk-adjusted return)
  const negativeReturns = returns.filter(r => r < 0);
  const downsideDeviation = negativeReturns.length > 0
    ? Math.sqrt(negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length)
    : stdDev;
  const sortinoRatio = downsideDeviation > 0 ? (avgReturn - riskFreeRate) / downsideDeviation : 0;

  // 3. Maximum Drawdown
  let peak = 0;
  let maxDrawdown = 0;
  let runningTotal = 0;

  // Sort trades by date to calculate drawdown chronologically
  const sortedTrades = [...normalizedTrades].sort((a, b) => new Date(a.date) - new Date(b.date));
  sortedTrades.forEach(trade => {
    runningTotal += trade.pnlInINR;
    if (runningTotal > peak) {
      peak = runningTotal;
    }
    const drawdown = peak - runningTotal;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  const maxDrawdownPercent = peak > 0 ? (maxDrawdown / peak) * 100 : 0;

  // 4. Profit Factor (gross profit / gross loss)
  const grossProfit = wins.reduce((sum, t) => sum + t.pnlInINR, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnlInINR, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // 5. Expectancy
  const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * Math.abs(avgLoss);

  // 6. Risk of Ruin (simplified Kelly Criterion)
  const winProb = winRate / 100;
  const lossProb = 1 - winProb;
  const avgWinLossRatio = avgLoss !== 0 ? avgWin / Math.abs(avgLoss) : 0;
  const kellyPercent = winProb - (lossProb / avgWinLossRatio);

  // 7. Consecutive Wins/Losses
  let currentStreak = { type: null, count: 0 };
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  sortedTrades.forEach(trade => {
    if (trade.pnlInINR > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      if (currentWinStreak > longestWinStreak) {
        longestWinStreak = currentWinStreak;
      }
    } else if (trade.pnlInINR < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      if (currentLossStreak > longestLossStreak) {
        longestLossStreak = currentLossStreak;
      }
    }
  });

  // Determine current streak
  if (sortedTrades.length > 0) {
    const lastTrade = sortedTrades[sortedTrades.length - 1];
    if (lastTrade.pnlInINR > 0) {
      currentStreak = { type: 'win', count: currentWinStreak };
    } else if (lastTrade.pnlInINR < 0) {
      currentStreak = { type: 'loss', count: currentLossStreak };
    }
  }

  // 8. Calmar Ratio (annual return / max drawdown)
  const calmarRatio = maxDrawdown > 0 ? totalPnL / maxDrawdown : 0;

  return {
    totalTrades,
    totalPnL,
    winRate,
    avgPnL,
    largestWin,
    largestLoss,
    avgWin,
    avgLoss,
    wins: wins.length,
    losses: losses.length,

    // Advanced Risk Metrics
    sharpeRatio,
    sortinoRatio,
    maxDrawdown,
    maxDrawdownPercent,
    profitFactor,
    expectancy,
    kellyPercent,
    currentStreak,
    longestWinStreak,
    longestLossStreak,
    calmarRatio,
    grossProfit,
    grossLoss
  };
}

// Chart Rendering
function renderSummaryCharts() {
  // Trading Type Distribution
  const typeData = {};
  tradingTypes.forEach(type => {
    typeData[type] = trades.filter(t => t.type === type).length;
  });

  renderPieChart('tradingTypeChart', Object.keys(typeData), Object.values(typeData), 'Trading Type Distribution');

  // Trade Market Distribution
  const marketData = {};
  tradeMarkets.forEach(market => {
    marketData[market] = trades.filter(t => t.market === market).length;
  });

  renderPieChart('tradeMarketChart', Object.keys(marketData), Object.values(marketData), 'Market Distribution');

  // P&L by Type
  const pnlByType = {};
  tradingTypes.forEach(type => {
    pnlByType[type] = trades.filter(t => t.type === type).reduce((sum, t) => sum + getTradePnlInINR(t), 0);
  });

  renderBarChart('pnlByTypeChart', Object.keys(pnlByType), Object.values(pnlByType), 'P&L by Trading Type', true);

  // P&L by Market
  const pnlByMarket = {};
  tradeMarkets.forEach(market => {
    pnlByMarket[market] = trades.filter(t => t.market === market).reduce((sum, t) => sum + getTradePnlInINR(t), 0);
  });

  renderBarChart('pnlByMarketChart', Object.keys(pnlByMarket), Object.values(pnlByMarket), 'P&L by Market', true);
}

function renderPieChart(canvasId, labels, data, title) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  if (charts[canvasId]) {
    charts[canvasId].destroy();
  }

  const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];

  charts[canvasId] = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff'
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

function renderBarChart(canvasId, labels, data, title, isHorizontal = false) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  if (charts[canvasId]) {
    charts[canvasId].destroy();
  }

  const isCurrencyChart = /p&l|profit|loss/i.test(title || '');
  const displayData = isCurrencyChart
    ? data.map(value => typeof convertAmount === 'function' ? convertAmount(value, 'INR') : value)
    : data;
  const colors = data.map(val => val >= 0 ? '#059669' : '#dc2626');
  const chartColors = getChartColors();

  charts[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: isCurrencyChart ? `P&L (${getCurrencySymbol()})` : title,
        data: displayData,
        backgroundColor: colors,
        borderWidth: 0
      }]
    },
    options: {
      indexAxis: isHorizontal ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: isHorizontal,
          ticks: { color: chartColors.textSecondary },
          grid: { display: isHorizontal, color: chartColors.gridColor }
        },
        y: {
          beginAtZero: !isHorizontal,
          ticks: { color: chartColors.textSecondary },
          grid: { display: !isHorizontal, color: chartColors.gridColor }
        }
      }
    }
  });
}

// Monthly Overview
function updateMonthlyView() {
  const month = parseInt(document.getElementById('monthSelector').value);
  const year = parseInt(document.getElementById('yearSelector').value);

  const monthlyTrades = trades.filter(trade => {
    const tradeDate = new Date(trade.date);
    return tradeDate.getMonth() === month && tradeDate.getFullYear() === year;
  });

  const metrics = calculateMetrics(monthlyTrades);
  const container = document.getElementById('monthlyMetrics');

  container.innerHTML = `
    <div class="metric-card">
      <h3>Monthly Trades</h3>
      <div class="value">${metrics.totalTrades}</div>
    </div>
    <div class="metric-card">
      <h3>Monthly P&amp;L</h3>
      <div class="value ${metrics.totalPnL >= 0 ? 'positive' : 'negative'}">${formatCurrency(metrics.totalPnL)}</div>
    </div>
    <div class="metric-card">
      <h3>Wins / Losses</h3>
      <div class="value">${metrics.wins} / ${metrics.losses}</div>
    </div>
    <div class="metric-card">
      <h3>Win Rate</h3>
      <div class="value positive">${metrics.winRate.toFixed(2)}%</div>
    </div>
  `;

  // Render monthly charts
  const typeData = {};
  tradingTypes.forEach(type => {
    typeData[type] = monthlyTrades.filter(t => t.type === type).length;
  });
  renderPieChart('monthlyTypeChart', Object.keys(typeData), Object.values(typeData), 'Monthly Type Distribution');

  const marketData = {};
  tradeMarkets.forEach(market => {
    marketData[market] = monthlyTrades.filter(t => t.market === market).length;
  });
  renderPieChart('monthlyMarketChart', Object.keys(marketData), Object.values(marketData), 'Monthly Market Distribution');
}

// Daily Overview
function updateDailyView() {
  const selectedDate = document.getElementById('dailyDateSelector').value;

  const dailyTrades = trades.filter(trade => trade.date === selectedDate);

  const metrics = calculateMetrics(dailyTrades);
  const container = document.getElementById('dailyMetrics');

  container.innerHTML = `
    <div class="metric-card">
      <h3>Daily Trades</h3>
      <div class="value">${metrics.totalTrades}</div>
    </div>
    <div class="metric-card">
      <h3>Daily P&amp;L</h3>
      <div class="value ${metrics.totalPnL >= 0 ? 'positive' : 'negative'}">${formatCurrency(metrics.totalPnL)}</div>
    </div>
    <div class="metric-card">
      <h3>Wins / Losses</h3>
      <div class="value">${metrics.wins} / ${metrics.losses}</div>
    </div>
    <div class="metric-card">
      <h3>Win Rate</h3>
      <div class="value positive">${metrics.winRate.toFixed(2)}%</div>
    </div>
  `;

  // Render daily charts
  const typeData = {};
  tradingTypes.forEach(type => {
    typeData[type] = dailyTrades.filter(t => t.type === type).length;
  });
  renderPieChart('dailyTypeChart', Object.keys(typeData), Object.values(typeData), 'Daily Type Distribution');

  const strategyNames = getStrategyOptions();
  const strategyData = {};
  strategyNames.forEach(strategy => {
    const stratTrades = dailyTrades.filter(t => strategyMatches(t.strategy, strategy));
    strategyData[strategy] = stratTrades.reduce((sum, t) => sum + getTradePnlInINR(t), 0);
  });
  renderBarChart('dailyStrategyChart', Object.keys(strategyData), Object.values(strategyData), 'Daily Strategy Performance', true);
}

// Analytics
function renderAnalytics() {
  const metrics = calculateMetrics(trades);
  const container = document.getElementById('analyticsMetrics');

  // Calculate advanced metrics
  const riskRewardRatio = metrics.avgWin / Math.abs(metrics.avgLoss);
  const totalMarginInINR = trades.reduce((sum, t) => sum + getTradeMarginInINR(t), 0);
  const totalROI = totalMarginInINR > 0
    ? (metrics.totalPnL / totalMarginInINR) * 100
    : 0;

  // Calculate strategy effectiveness metrics
  const strategyStats = {};
  const strategyNames = getStrategyOptions();
  strategyNames.forEach(strategy => {
    const stratTrades = trades.filter(t => strategyMatches(t.strategy, strategy));
    if (stratTrades.length > 0) {
      const wins = stratTrades.filter(t => getTradePnlInINR(t) > 0);
      const losses = stratTrades.filter(t => getTradePnlInINR(t) < 0);
      const totalPnL = stratTrades.reduce((sum, t) => sum + getTradePnlInINR(t), 0);
      const avgPnL = totalPnL / stratTrades.length;
      const winRate = (wins.length / stratTrades.length) * 100;
      const grossProfit = wins.reduce((sum, t) => sum + getTradePnlInINR(t), 0);
      const grossLoss = Math.abs(losses.reduce((sum, t) => sum + getTradePnlInINR(t), 0));
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : 0);

      // Calculate consistency (inverse of standard deviation normalized)
      const returns = stratTrades.map(t => getTradePnlInINR(t));
      const mean = avgPnL;
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = mean !== 0 ? (stdDev / Math.abs(mean)) : 0;
      const consistencyScore = Math.max(0, 100 - (coefficientOfVariation * 20)); // Higher is better

      strategyStats[strategy] = {
        trades: stratTrades.length,
        winRate,
        totalPnL,
        avgPnL,
        profitFactor,
        consistencyScore
      };
    }
  });

  // Find best strategy by profit factor
  const bestStratByPF = Object.entries(strategyStats).reduce((best, [strat, stats]) => {
    return (!best || stats.profitFactor > best.stats.profitFactor) ? { strat, stats } : best;
  }, null);

  // Find most consistent strategy
  const mostConsistent = Object.entries(strategyStats).reduce((best, [strat, stats]) => {
    return (!best || stats.consistencyScore > best.stats.consistencyScore) ? { strat, stats } : best;
  }, null);

  container.innerHTML = `
    <div class="metric-card">
      <h3>Avg Risk:Reward Ratio</h3>
      <div class="value">${isFinite(riskRewardRatio) ? riskRewardRatio.toFixed(2) : '0.00'}</div>
    </div>
    <div class="metric-card">
      <h3>Total ROI</h3>
      <div class="value ${totalROI >= 0 ? 'positive' : 'negative'}">${totalROI.toFixed(2)}%</div>
    </div>
    <div class="metric-card">
      <h3>Best Strategy (P.F.)</h3>
      <div class="value positive" style="font-size: var(--font-size-lg);">${bestStratByPF ? bestStratByPF.strat : 'N/A'}</div>
      <small style="opacity: 0.7;">${bestStratByPF ? `PF: ${bestStratByPF.stats.profitFactor.toFixed(2)}` : ''}</small>
    </div>
    <div class="metric-card">
      <h3>Most Consistent</h3>
      <div class="value" style="font-size: var(--font-size-lg);">${mostConsistent ? mostConsistent.strat : 'N/A'}</div>
      <small style="opacity: 0.7;">${mostConsistent ? `Score: ${mostConsistent.stats.consistencyScore.toFixed(0)}` : ''}</small>
    </div>
    <div class="metric-card" style="border: 2px solid #059669;">
      <h3>⭐ Best Win Rate</h3>
      <div class="value positive">${getStrategyWithBestWinRate(strategyStats)}</div>
    </div>
    <div class="metric-card" style="border: 2px solid #3b82f6;">
      <h3>⭐ Highest Avg P&L</h3>
      <div class="value">${getStrategyWithBestAvgPnL(strategyStats)}</div>
    </div>
  `;

  // Strategy Performance
  const strategyPnL = {};
  strategyNames.forEach(strategy => {
    const stratTrades = trades.filter(t => strategyMatches(t.strategy, strategy));
    strategyPnL[strategy] = stratTrades.reduce((sum, t) => sum + getTradePnlInINR(t), 0);
  });
  renderBarChart('strategyPerformanceChart', Object.keys(strategyPnL), Object.values(strategyPnL), 'Strategy Performance', true);

  // Win Rate by Strategy
  const strategyWinRate = {};
  strategyNames.forEach(strategy => {
    const stratTrades = trades.filter(t => strategyMatches(t.strategy, strategy));
    const wins = stratTrades.filter(t => getTradePnlInINR(t) > 0).length;
    strategyWinRate[strategy] = stratTrades.length > 0 ? (wins / stratTrades.length) * 100 : 0;
  });
  renderBarChart('winRateStrategyChart', Object.keys(strategyWinRate), Object.values(strategyWinRate), 'Win Rate by Strategy (%)', true);

  // Monthly P&L Trend
  const monthlyPnL = {};
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months.forEach((month, idx) => {
    const monthTrades = trades.filter(trade => new Date(trade.date).getMonth() === idx);
    monthlyPnL[month] = monthTrades.reduce((sum, t) => sum + getTradePnlInINR(t), 0);
  });
  renderLineChart('monthlyPnLTrendChart', Object.keys(monthlyPnL), Object.values(monthlyPnL), 'Monthly P&L Trend');

  // Trade Count by Type
  const typeCount = {};
  tradingTypes.forEach(type => {
    typeCount[type] = trades.filter(t => t.type === type).length;
  });
  renderBarChart('tradeCountChart', Object.keys(typeCount), Object.values(typeCount), 'Trade Count by Type', true);
}

function renderLineChart(canvasId, labels, data, title) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  if (charts[canvasId]) {
    charts[canvasId].destroy();
  }
  const displayData = data.map(value => typeof convertAmount === 'function' ? convertAmount(value, 'INR') : value);

  charts[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `P&L (${getCurrencySymbol()})`,
        data: displayData,
        borderColor: '#1FB8CD',
        backgroundColor: 'rgba(31, 184, 205, 0.1)',
        borderWidth: 2,
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
        x: {
          ticks: {
            autoSkip: false
          }
        },
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function getBestStrategy() {
  const strategyPnL = {};
  const strategyNames = getStrategyOptions();
  strategyNames.forEach(strategy => {
    const stratTrades = trades.filter(t => strategyMatches(t.strategy, strategy));
    strategyPnL[strategy] = stratTrades.reduce((sum, t) => sum + getTradePnlInINR(t), 0);
  });

  let bestStrategy = 'N/A';
  let maxPnL = -Infinity;
  for (const [strategy, pnl] of Object.entries(strategyPnL)) {
    if (pnl > maxPnL) {
      maxPnL = pnl;
      bestStrategy = strategy;
    }
  }
  return bestStrategy;
}

function getStrategyWithBestWinRate(strategyStats) {
  const best = Object.entries(strategyStats).reduce((best, [strat, stats]) => {
    return (!best || stats.winRate > best.stats.winRate) ? { strat, stats } : best;
  }, null);
  return best ? `${best.strat} (${best.stats.winRate.toFixed(1)}%)` : 'N/A';
}

function getStrategyWithBestAvgPnL(strategyStats) {
  const best = Object.entries(strategyStats).reduce((best, [strat, stats]) => {
    return (!best || stats.avgPnL > best.stats.avgPnL) ? { strat, stats } : best;
  }, null);
  return best ? `${best.strat} (${formatCurrency(best.stats.avgPnL)})` : 'N/A';
}

function getMostTradedMarket() {
  const marketCount = {};
  tradeMarkets.forEach(market => {
    marketCount[market] = trades.filter(t => t.market === market).length;
  });

  let mostTraded = 'N/A';
  let maxCount = 0;
  for (const [market, count] of Object.entries(marketCount)) {
    if (count > maxCount) {
      maxCount = count;
      mostTraded = market;
    }
  }
  return mostTraded;
}

// Dashboard
function renderDashboard() {
  const metrics = calculateMetrics(trades);
  const container = document.getElementById('dashboardMetrics');

  const today = new Date().toISOString().split('T')[0];
  const todayTrades = trades.filter(t => t.date === today);
  const todayMetrics = calculateMetrics(todayTrades);

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthTrades = trades.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const monthMetrics = calculateMetrics(monthTrades);

  container.innerHTML = `
    <div class="metric-card">
      <h3>Today's P&amp;L</h3>
      <div class="value ${todayMetrics.totalPnL >= 0 ? 'positive' : 'negative'}">${formatCurrency(todayMetrics.totalPnL)}</div>
    </div>
    <div class="metric-card">
      <h3>Total Trades</h3>
      <div class="value">${metrics.totalTrades}</div>
    </div>
    <div class="metric-card">
      <h3>Win Rate</h3>
      <div class="value positive">${metrics.winRate.toFixed(1)}%</div>
    </div>
    <div class="metric-card">
      <h3>Avg Trade P&amp;L</h3>
      <div class="value ${metrics.avgPnL >= 0 ? 'positive' : 'negative'}">${formatCurrency(metrics.avgPnL)}</div>
    </div>
    <div class="metric-card">
      <h3>This Month P&amp;L</h3>
      <div class="value ${monthMetrics.totalPnL >= 0 ? 'positive' : 'negative'}">${formatCurrency(monthMetrics.totalPnL)}</div>
    </div>
    <div class="metric-card">
      <h3>Total P&amp;L</h3>
      <div class="value ${metrics.totalPnL >= 0 ? 'positive' : 'negative'}">${formatCurrency(metrics.totalPnL)}</div>
    </div>
  `;

  renderDashboardCharts();
  renderRecentTrades();

  console.log('Dashboard rendering goals, count:', goals ? goals.length : 0);
  renderGoals({
    all_time: metrics,
    this_month: monthMetrics
  });
}

function renderDashboardCharts() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyPnL = months.map((month, idx) => {
    const monthTrades = trades.filter(t => new Date(t.date).getMonth() === idx);
    return monthTrades.reduce((sum, t) => sum + getTradePnlInINR(t), 0);
  });

  renderLineChart('dashboardPnlChart', months, monthlyPnL, 'Monthly P&L Trend');

  const metrics = calculateMetrics(trades);
  const winRate = metrics.winRate;
  renderGaugeChart('performanceGaugeChart', winRate);
}

function renderGaugeChart(canvasId, value) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  if (charts[canvasId]) {
    charts[canvasId].destroy();
  }

  charts[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Win Rate', 'Remaining'],
      datasets: [{
        data: [value, 100 - value],
        backgroundColor: ['#059669', '#e0e0e0'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      circumference: 180,
      rotation: 270,
      cutout: '70%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      }
    }
  });
}

function renderRecentTrades() {
  const recentTrades = trades.slice(-5).reverse();
  const container = document.getElementById('recentTradesList');

  if (recentTrades.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--space-24);">No trades yet. Add your first trade!</p>';
    return;
  }

  container.innerHTML = recentTrades.map(trade => {
    const statusClass = trade.pnl >= 0 ? 'status-win' : 'status-loss';
    return `
      <div class="recent-trade-item">
        <div class="trade-info">
          <div class="trade-asset">${trade.asset}</div>
          <div class="trade-details">${trade.type} • ${trade.market} • ${formatDate(trade.date)}</div>
        </div>
        <div class="trade-pnl ${statusClass}">${formatTradeCurrency(trade.pnl, trade)}</div>
      </div>
    `;
  }).join('');
}

// Filter and Search
function populateFilterDropdowns() {
  const filterType = document.getElementById('filterType');
  const filterMarket = document.getElementById('filterMarket');

  tradingTypes.forEach(type => {
    filterType.innerHTML += `<option value="${type}">${type}</option>`;
  });

  tradeMarkets.forEach(market => {
    filterMarket.innerHTML += `<option value="${market}">${market}</option>`;
  });
}

function filterTrades() {
  const typeFilter = document.getElementById('filterType').value;
  const marketFilter = document.getElementById('filterMarket').value;
  const statusFilter = document.getElementById('filterStatus').value;
  const searchTerm = document.getElementById('searchTrades').value.toLowerCase();

  filteredTrades = trades.filter(trade => {
    const matchesType = !typeFilter || trade.type === typeFilter;
    const matchesMarket = !marketFilter || trade.market === marketFilter;
    const matchesStatus = !statusFilter ||
      (statusFilter === 'win' && trade.pnl > 0) ||
      (statusFilter === 'loss' && trade.pnl < 0);
    const strategyField = normalizeStrategyName(trade.strategy).toLowerCase();
    const matchesSearch = !searchTerm ||
      trade.asset.toLowerCase().includes(searchTerm) ||
      trade.date.includes(searchTerm) ||
      (trade.exitDate || trade.date || '').includes(searchTerm) ||
      (strategyField && strategyField.includes(searchTerm));

    return matchesType && matchesMarket && matchesStatus && matchesSearch;
  });

  renderTradesTable();
}

function exportTrades() {
  const csv = [
    ['Date', 'Exit Day', 'Buy/Sell', 'Entry Time', 'Exit Time', 'Time Zone', 'Type', 'Market', 'Asset', 'Quantity', 'Entry Price', 'Target Price', 'Stop Loss', 'Exit Price', 'Brokerage', 'Strategy', 'Margin', 'P&L', 'Currency', 'Contract', 'Strike Price', 'Option Type', 'Emotion', 'Tags', 'Notes'].join(','),
    ...trades.map(t => [
      t.date, t.exitDate || t.date, t.buySell || 'Buy', t.entryTime, t.exitTime, t.timeZone || getSelectedTimeZone(), t.type, t.market, t.asset, t.quantity,
      t.entryPrice, t.targetPrice || 0, t.stopLoss || 0, t.exitPrice, t.brokerage, t.strategy, t.margin, t.pnl, getTradeCurrency(t),
      t.contract || '', t.strikePrice || '', t.optionType || '', t.emotion || 'neutral',
      (t.tags || []).join(';'), `"${(t.notes || '').replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trades_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  showToast('Trades exported successfully!', 'success');
}

function backupDatabase() {
  const data = {
    trades: trades,
    customStrategies: customStrategies,
    goals: goals,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };

  console.log('Backing up data:', {
    trades: data.trades.length,
    customStrategies: data.customStrategies.length,
    goals: data.goals.length
  });

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trading_journal_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
  showToast(`Backup created: ${data.trades.length} trades, ${data.goals.length} goals!`, 'success');
}

function restoreDatabase() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          console.log('Restoring backup data:', data);

          if (data.trades && Array.isArray(data.trades)) {
            const goalsCount = Array.isArray(data.goals) ? data.goals.length : 0;
            const strategiesCount = Array.isArray(data.customStrategies) ? data.customStrategies.length : 0;

            if (confirm(`This will restore:\n• ${data.trades.length} trades\n• ${goalsCount} goals\n• ${strategiesCount} custom strategies\n\nCurrent data will be replaced. Continue?`)) {
              isSampleDataMode = false;
              trades = data.trades;
              ensureTradeIds(trades);
              normalizeTradeStrategies(trades);
              filteredTrades = [...trades];
              nextTradeId = trades.length > 0 ? Math.max(...trades.map(t => t.id)) + 1 : 1;

              if (Array.isArray(data.customStrategies)) {
                customStrategies = data.customStrategies
                  .map(name => typeof name === 'string' ? name.trim() : '')
                  .filter(Boolean);
                saveCustomStrategies();
                console.log('Restored custom strategies:', customStrategies.length);
              }

              if (Array.isArray(data.goals)) {
                goals = data.goals.map(goal => ({
                  ...goal,
                  targetValue: typeof goal.targetValue === 'number' ? goal.targetValue : parseFloat(goal.targetValue) || 0
                }));
                const goalIds = goals.map(goal => goal.id || 0);
                nextGoalId = goalIds.length > 0 ? Math.max(...goalIds) + 1 : 1;
                console.log('Restored goals to memory:', goals.length, goals);

                // Save to localStorage and verify immediately
                saveGoalsToStorage();

                // Immediate verification
                setTimeout(() => {
                  const verifyGoals = localStorage.getItem(GOALS_STORAGE_KEY);
                  console.log('Verified goals in storage after save:', verifyGoals);
                }, 10);
              } else {
                console.log('No goals found in backup data');
              }

              saveToDatabase();

              // Goals are already loaded from backup data above, don't reload from storage
              console.log('Goals after restore (before render):', goals);

              renderTradesTable();
              renderSummaryMetrics();
              updateMonthlyView();
              updateDailyView();
              renderAnalytics();
              renderHeatmapsTab();
              updateDatabaseStatus();
              refreshStrategyOptionsUI();
              rebuildAssetCategoriesFromTrades();

              // Render dashboard which includes goals
              console.log('About to render dashboard after restore');
              renderDashboard();

              // Force explicit goal render with fresh metrics
              setTimeout(() => {
                console.log('=== FORCE RENDER GOALS AFTER RESTORE ===');
                console.log('Goals in memory:', goals);
                renderGoals();
              }, 200);

              showToast(`Restored: ${trades.length} trades, ${goalsCount} goals, ${strategiesCount} strategies!`, 'success');
            }
          } else {
            showToast('Invalid backup file format', 'error');
          }
        } catch (error) {
          showToast('Error reading backup file', 'error');
          console.error(error);
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

function loadSampleData() {
  openSampleDataModal();
}

let sampleModalLastFocusedElement = null;

function openSampleDataModal() {
  const modal = document.getElementById('sampleDataModal');
  if (!modal) {
    showToast('Sample data modal not found.', 'error');
    return;
  }

  sampleModalLastFocusedElement = document.activeElement;
  updateSampleDataPreviews();
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');

  const firstButton = modal.querySelector('.sample-option-btn');
  if (firstButton) {
    firstButton.focus();
  }

  document.addEventListener('keydown', handleSampleModalKeydown);
}

function updateSampleDataPreviews() {
  const options = getSampleDataOptions();

  options.forEach(option => {
    const statsEl = document.getElementById(`sampleDataStats${option.id}`);
    if (!statsEl) return;

    const tradesPreview = option.generator();
    const metrics = calculateMetrics(tradesPreview);
    const winRate = Number.isFinite(metrics.winRate) ? metrics.winRate.toFixed(1) : '0.0';
    statsEl.classList.remove('positive', 'negative');
    if (metrics.totalPnL > 0) {
      statsEl.classList.add('positive');
    } else if (metrics.totalPnL < 0) {
      statsEl.classList.add('negative');
    }
    statsEl.textContent = `${tradesPreview.length} trades | WR ${winRate}% | P&L ${formatCurrency(metrics.totalPnL)}`;
  });
}

function closeSampleDataModal() {
  const modal = document.getElementById('sampleDataModal');
  if (!modal) return;

  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  document.removeEventListener('keydown', handleSampleModalKeydown);

  if (sampleModalLastFocusedElement && typeof sampleModalLastFocusedElement.focus === 'function') {
    sampleModalLastFocusedElement.focus();
  }
}

function handleSampleModalKeydown(event) {
  const modal = document.getElementById('sampleDataModal');
  if (!modal || !modal.classList.contains('show')) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closeSampleDataModal();
  }
}

function loadSampleDataById(sampleId, skipConfirmation = false) {
  const sampleDataOptions = getSampleDataOptions();
  const selected = sampleDataOptions.find(option => option.id === sampleId);

  if (!selected) {
    showToast('Invalid sample data selection.', 'error');
    return;
  }

  if (!skipConfirmation && !confirm(`Load ${selected.name}? This will replace current data.`)) {
    return;
  }

  closeSampleDataModal();
  const sampleTrades = selected.generator();
  isSampleDataMode = true;
  trades = sampleTrades;
  ensureTradeIds(trades);
  normalizeTradeStrategies(trades);
  filteredTrades = [...trades];
  nextTradeId = trades.length > 0 ? Math.max(...trades.map(t => t.id)) + 1 : 1;
  saveToDatabase({ skipCloud: true });
  renderTradesTable();
  renderDashboard();
  renderSummaryMetrics();
  updateMonthlyView();
  updateDailyView();
  renderAnalytics();
  renderHourlyAnalysis();
  renderHeatmapsTab();
  updateDatabaseStatus();
  rebuildAssetCategoriesFromTrades();
  refreshStrategyOptionsUI();
  showToast(`${selected.name} loaded successfully!`, 'success');
}

function getSampleDataOptions() {
  return [
    { id: '1', name: 'Sample Data 1 - Beginner Balanced', generator: createSampleData1 },
    { id: '2', name: 'Sample Data 2 - Intermediate Conservative', generator: createSampleData2 },
    { id: '3', name: 'Sample Data 3 - Intermediate Scalper', generator: createSampleData3 },
    { id: '4', name: 'Sample Data 4 - Advanced Momentum', generator: createSampleData4 },
    { id: '5', name: 'Sample Data 5 - Advanced Defensive Swing', generator: createSampleData5 },
    { id: '6', name: 'Sample Data 6 - Expert Derivatives', generator: createSampleData6 },
    { id: '7', name: 'Sample Data 7 - Stress Test Regime Mix', generator: createSampleData7 }
  ];
}

function createSampleData1() {
  return createSampleTrades();
}

function createSampleTrades() {
  const template = [
    // November 2025
    { date: '2025-11-21', entryTime: '09:15', exitTime: '10:45', type: 'Intraday', market: 'Equity', asset: 'Reliance Industries', quantity: 15, entryPrice: 2850, targetPrice: 2900, stopLoss: 2820, exitPrice: 2895, brokerage: 75, strategy: 'Breakout', margin: 28000, buySell: 'Buy', notes: 'Strong opening momentum after positive news', tags: ['momentum', 'large-cap'], emotion: 'confident' },
    { date: '2025-11-21', entryTime: '11:20', exitTime: '12:50', type: 'Scalping', market: 'Futures', asset: 'Nifty-50', quantity: 3, entryPrice: 23520, targetPrice: 23580, stopLoss: 23480, exitPrice: 23565, brokerage: 60, strategy: 'Breakout', margin: 71000, buySell: 'Buy', notes: 'Mid-session breakout trade', tags: ['futures', 'scalping'], emotion: 'excited' },
    { date: '2025-11-21', entryTime: '14:30', exitTime: '15:15', type: 'Intraday', market: 'Equity', asset: 'TCS', quantity: 8, entryPrice: 3980, targetPrice: 4020, stopLoss: 3950, exitPrice: 3975, brokerage: 40, strategy: 'Double Bottom', margin: 32000, buySell: 'Buy', notes: 'Failed breakout, cut early', tags: ['it-sector'], emotion: 'frustrated' },
    { date: '2025-11-20', entryTime: '09:30', exitTime: '11:00', type: 'Intraday', market: 'Equity', asset: 'HDFC Bank', quantity: 10, entryPrice: 1645, targetPrice: 1670, stopLoss: 1630, exitPrice: 1668, brokerage: 50, strategy: 'M Pattern', margin: 16500, buySell: 'Buy', notes: 'Banking sector strength', tags: ['banking', 'momentum'], emotion: 'confident' },
    { date: '2025-11-20', entryTime: '12:45', exitTime: '14:20', type: 'Scalping', market: 'Futures', asset: 'BankNifty', quantity: 2, entryPrice: 47800, targetPrice: 47900, stopLoss: 47750, exitPrice: 47890, brokerage: 45, strategy: 'Breakout', margin: 96000, buySell: 'Buy', notes: 'Afternoon momentum trade', tags: ['futures', 'banking'], emotion: 'neutral' },
    { date: '2025-11-19', entryTime: '10:00', exitTime: '11:30', type: 'Intraday', market: 'Equity', asset: 'Infosys', quantity: 12, entryPrice: 1820, targetPrice: 1850, stopLoss: 1800, exitPrice: 1842, brokerage: 55, strategy: 'Breakout', margin: 22000, buySell: 'Buy', notes: 'IT sector rally continuation', tags: ['it-sector', 'momentum'], emotion: 'confident' },
    { date: '2025-11-19', entryTime: '13:15', exitTime: '14:45', type: 'Intraday', market: 'Options', asset: 'Nifty', quantity: 3, entryPrice: 180, targetPrice: 220, stopLoss: 160, exitPrice: 210, brokerage: 30, strategy: 'Iron Condor', margin: 550, buySell: 'Buy', strikePrice: 23500, optionType: 'Call', impliedVolatility: 16, daysToExpiry: 3, notes: 'Theta decay play worked well', tags: ['options', 'theta'], emotion: 'excited' },

    // October 2025
    { date: '2025-10-31', entryTime: '09:45', exitTime: '11:15', type: 'Intraday', market: 'Equity', asset: 'ITC', quantity: 25, entryPrice: 465, targetPrice: 475, stopLoss: 460, exitPrice: 473, brokerage: 58, strategy: 'Head & shoulder', margin: 11700, buySell: 'Buy', notes: 'FMCG sector strength', tags: ['fmcg', 'defensive'], emotion: 'confident' },
    { date: '2025-10-30', entryTime: '10:20', exitTime: '12:00', type: 'Swing Trading', market: 'Commodities', asset: 'Gold', quantity: 4, entryPrice: 61200, targetPrice: 61500, stopLoss: 61000, exitPrice: 61450, brokerage: 120, strategy: 'Hammer Candle', margin: 24500, buySell: 'Buy', notes: 'Gold rally on Fed speculation', tags: ['gold', 'safe-haven'], emotion: 'neutral' },
    { date: '2025-10-29', entryTime: '11:00', exitTime: '13:30', type: 'Intraday', market: 'Equity', asset: 'Wipro', quantity: 20, entryPrice: 540, targetPrice: 555, stopLoss: 532, exitPrice: 535, brokerage: 54, strategy: 'Breakout', margin: 10900, buySell: 'Buy', notes: 'Weak follow-through, stopped out', tags: ['it-sector'], emotion: 'uncertain' },
    { date: '2025-10-28', entryTime: '09:30', exitTime: '10:45', type: 'Scalping', market: 'Futures', asset: 'Nifty-50', quantity: 4, entryPrice: 23180, targetPrice: 23240, stopLoss: 23150, exitPrice: 23225, brokerage: 80, strategy: 'M Pattern', margin: 93000, buySell: 'Buy', notes: 'Quick scalp on opening range breakout', tags: ['futures', 'scalping'], emotion: 'excited' },
    { date: '2025-10-25', entryTime: '14:00', exitTime: '15:20', type: 'Intraday', market: 'Equity', asset: 'Tata Motors', quantity: 18, entryPrice: 895, targetPrice: 920, stopLoss: 880, exitPrice: 915, brokerage: 65, strategy: 'Breakout', margin: 16200, buySell: 'Buy', notes: 'Auto sector momentum', tags: ['auto', 'momentum'], emotion: 'confident' },
    { date: '2025-10-24', entryTime: '10:30', exitTime: '12:00', type: 'Intraday', market: 'Forex', asset: 'USD/INR', quantity: 100, entryPrice: 83.25, targetPrice: 83.40, stopLoss: 83.15, exitPrice: 83.38, brokerage: 42, strategy: 'Breakout', margin: 4200, buySell: 'Buy', notes: 'Dollar strength on US data', tags: ['forex', 'usd'], emotion: 'neutral' },
    { date: '2025-10-23', entryTime: '11:45', exitTime: '13:15', type: 'Intraday', market: 'Equity', asset: 'Bajaj Finance', quantity: 6, entryPrice: 7350, targetPrice: 7450, stopLoss: 7300, exitPrice: 7420, brokerage: 88, strategy: 'Double Bottom', margin: 44200, buySell: 'Buy', notes: 'NBFC sector rally', tags: ['nbfc', 'financial'], emotion: 'excited' },
    { date: '2025-10-22', entryTime: '09:15', exitTime: '10:30', type: 'Scalping', market: 'Futures', asset: 'BankNifty', quantity: 3, entryPrice: 47200, targetPrice: 47300, stopLoss: 47150, exitPrice: 47280, brokerage: 67, strategy: 'Breakout', margin: 142000, buySell: 'Buy', notes: 'Morning gap-up continuation', tags: ['futures', 'banking'], emotion: 'confident' },
    { date: '2025-10-21', entryTime: '13:00', exitTime: '14:30', type: 'Intraday', market: 'Options', asset: 'BankNifty', quantity: 4, entryPrice: 250, targetPrice: 300, stopLoss: 230, exitPrice: 285, brokerage: 40, strategy: 'Iron Condor', margin: 1020, buySell: 'Buy', strikePrice: 47500, optionType: 'Put', impliedVolatility: 19, daysToExpiry: 4, notes: 'Volatility expansion trade', tags: ['options', 'volatility'], emotion: 'neutral' },
    { date: '2025-10-18', entryTime: '10:00', exitTime: '11:45', type: 'Intraday', market: 'Equity', asset: 'Asian Paints', quantity: 14, entryPrice: 2920, targetPrice: 2970, stopLoss: 2890, exitPrice: 2960, brokerage: 82, strategy: 'Head & shoulder', margin: 41000, buySell: 'Buy', notes: 'Paint sector strength', tags: ['consumer'], emotion: 'confident' },
    { date: '2025-10-17', entryTime: '14:15', exitTime: '15:25', type: 'Scalping', market: 'Crypto_Currency', asset: 'Bitcoin (BTC)', quantity: 0.8, entryPrice: 65200, targetPrice: 65800, stopLoss: 64900, exitPrice: 65650, brokerage: 130, strategy: 'Breakout', margin: 8300, buySell: 'Buy', notes: 'Crypto afternoon pump', tags: ['crypto', 'btc'], emotion: 'excited' },
    { date: '2025-10-16', entryTime: '09:30', exitTime: '11:00', type: 'Intraday', market: 'Equity', asset: 'Maruti Suzuki', quantity: 7, entryPrice: 11200, targetPrice: 11350, stopLoss: 11100, exitPrice: 11320, brokerage: 157, strategy: 'M Pattern', margin: 78600, buySell: 'Buy', notes: 'Auto sector breakout', tags: ['auto', 'large-cap'], emotion: 'confident' },

    // September 2025
    { date: '2025-09-30', entryTime: '10:45', exitTime: '12:15', type: 'Intraday', market: 'Equity', asset: 'ICICI Bank', quantity: 13, entryPrice: 1120, targetPrice: 1145, stopLoss: 1105, exitPrice: 1140, brokerage: 58, strategy: 'Breakout', margin: 14600, buySell: 'Buy', notes: 'Banking rally on rate pause', tags: ['banking', 'momentum'], emotion: 'excited' },
    { date: '2025-09-27', entryTime: '11:30', exitTime: '13:00', type: 'Intraday', market: 'Futures', asset: 'Nifty-50', quantity: 5, entryPrice: 22850, targetPrice: 22920, stopLoss: 22800, exitPrice: 22905, brokerage: 100, strategy: 'Breakout', margin: 114500, buySell: 'Buy', notes: 'Pre-weekend momentum', tags: ['futures'], emotion: 'neutral' },
    { date: '2025-09-26', entryTime: '09:15', exitTime: '10:45', type: 'Scalping', market: 'Equity', asset: 'Sun Pharma', quantity: 16, entryPrice: 1510, targetPrice: 1540, stopLoss: 1495, exitPrice: 1535, brokerage: 96, strategy: 'Double Bottom', margin: 24200, buySell: 'Buy', notes: 'Pharma sector rotation', tags: ['pharma', 'healthcare'], emotion: 'confident' },
    { date: '2025-09-25', entryTime: '13:45', exitTime: '15:10', type: 'Intraday', market: 'Commodities', asset: 'Silver', quantity: 6, entryPrice: 77500, targetPrice: 78200, stopLoss: 77000, exitPrice: 78100, brokerage: 155, strategy: 'Hammer Candle', margin: 46600, buySell: 'Buy', notes: 'Silver rally on industrial demand', tags: ['silver', 'commodities'], emotion: 'excited' },
    { date: '2025-09-24', entryTime: '10:00', exitTime: '11:30', type: 'Intraday', market: 'Equity', asset: 'Axis Bank', quantity: 11, entryPrice: 1085, targetPrice: 1110, stopLoss: 1070, exitPrice: 1105, brokerage: 60, strategy: 'Head & shoulder', margin: 12000, buySell: 'Buy', notes: 'Private bank strength', tags: ['banking'], emotion: 'confident' },
    { date: '2025-09-23', entryTime: '14:20', exitTime: '15:20', type: 'Scalping', market: 'Options', asset: 'Nifty', quantity: 5, entryPrice: 145, targetPrice: 175, stopLoss: 130, exitPrice: 165, brokerage: 50, strategy: 'Iron Condor', margin: 750, buySell: 'Buy', strikePrice: 22800, optionType: 'Call', impliedVolatility: 17, daysToExpiry: 2, notes: 'End of day volatility trade', tags: ['options', 'theta'], emotion: 'neutral' },
    { date: '2025-09-20', entryTime: '09:30', exitTime: '11:00', type: 'Intraday', market: 'Equity', asset: 'Bharti Airtel', quantity: 19, entryPrice: 1450, targetPrice: 1480, stopLoss: 1435, exitPrice: 1475, brokerage: 69, strategy: 'Breakout', margin: 27600, buySell: 'Buy', notes: 'Telecom sector breakout', tags: ['telecom', 'momentum'], emotion: 'excited' },
    { date: '2025-09-19', entryTime: '12:00', exitTime: '13:30', type: 'Intraday', market: 'Forex', asset: 'EUR/USD', quantity: 150, entryPrice: 1.0920, targetPrice: 1.0950, stopLoss: 1.0900, exitPrice: 1.0945, brokerage: 38, strategy: 'M Pattern', margin: 3280, buySell: 'Buy', notes: 'Euro strength on ECB comments', tags: ['forex', 'eur'], emotion: 'confident' },
    { date: '2025-09-18', entryTime: '10:15', exitTime: '11:45', type: 'Swing Trading', market: 'Crypto_Currency', asset: 'Ethereum (ETH)', quantity: 2.5, entryPrice: 2580, targetPrice: 2680, stopLoss: 2520, exitPrice: 2650, brokerage: 162, strategy: 'Breakout', margin: 6500, buySell: 'Buy', notes: 'Crypto market reversal', tags: ['crypto', 'eth'], emotion: 'excited' },
    { date: '2025-09-17', entryTime: '13:30', exitTime: '14:50', type: 'Intraday', market: 'Equity', asset: 'Coal India', quantity: 35, entryPrice: 425, targetPrice: 440, stopLoss: 418, exitPrice: 437, brokerage: 75, strategy: 'Breakout', margin: 14900, buySell: 'Buy', notes: 'PSU momentum', tags: ['psu', 'energy'], emotion: 'neutral' },
    { date: '2025-09-16', entryTime: '09:45', exitTime: '11:15', type: 'Intraday', market: 'Futures', asset: 'BankNifty', quantity: 4, entryPrice: 46850, targetPrice: 46950, stopLoss: 46800, exitPrice: 46930, brokerage: 85, strategy: 'Double Bottom', margin: 187600, buySell: 'Buy', notes: 'Banking sector recovery', tags: ['futures', 'banking'], emotion: 'confident' },
    { date: '2025-09-13', entryTime: '11:00', exitTime: '12:30', type: 'Scalping', market: 'Equity', asset: 'Power Grid', quantity: 28, entryPrice: 285, targetPrice: 295, stopLoss: 280, exitPrice: 293, brokerage: 41, strategy: 'Head & shoulder', margin: 8000, buySell: 'Buy', notes: 'Utility sector play', tags: ['utility', 'defensive'], emotion: 'neutral' },
    { date: '2025-09-12', entryTime: '14:00', exitTime: '15:15', type: 'Intraday', market: 'Commodities', asset: 'Crude Oil', quantity: 8, entryPrice: 6820, targetPrice: 6900, stopLoss: 6780, exitPrice: 6880, brokerage: 137, strategy: 'Hammer Candle', margin: 54800, buySell: 'Buy', notes: 'Oil rally on supply cuts', tags: ['oil', 'energy'], emotion: 'excited' },

    // August 2025
    { date: '2025-08-30', entryTime: '09:20', exitTime: '10:50', type: 'Intraday', market: 'Equity', asset: 'HCL Tech', quantity: 17, entryPrice: 1680, targetPrice: 1720, stopLoss: 1660, exitPrice: 1715, brokerage: 114, strategy: 'M Pattern', margin: 28600, buySell: 'Buy', notes: 'IT sector strength on dollar weakness', tags: ['it-sector', 'large-cap'], emotion: 'confident' },
    { date: '2025-08-29', entryTime: '11:45', exitTime: '13:15', type: 'Scalping', market: 'Futures', asset: 'Nifty-50', quantity: 6, entryPrice: 22450, targetPrice: 22510, stopLoss: 22410, exitPrice: 22495, brokerage: 120, strategy: 'Breakout', margin: 135000, buySell: 'Buy', notes: 'Mid-day range breakout', tags: ['futures', 'scalping'], emotion: 'excited' },
    { date: '2025-08-28', entryTime: '13:00', exitTime: '14:30', type: 'Intraday', market: 'Options', asset: 'BankNifty', quantity: 6, entryPrice: 320, targetPrice: 370, stopLoss: 300, exitPrice: 355, brokerage: 72, strategy: 'Iron Condor', margin: 1960, buySell: 'Buy', strikePrice: 46500, optionType: 'Call', impliedVolatility: 20, daysToExpiry: 5, notes: 'Volatility spike opportunity', tags: ['options', 'volatility'], emotion: 'neutral' },
    { date: '2025-08-27', entryTime: '10:00', exitTime: '11:30', type: 'Intraday', market: 'Equity', asset: 'Titan Company', quantity: 9, entryPrice: 3420, targetPrice: 3480, stopLoss: 3390, exitPrice: 3470, brokerage: 123, strategy: 'Breakout', margin: 30900, buySell: 'Buy', notes: 'Consumer discretionary rally', tags: ['consumer', 'jewelry'], emotion: 'confident' },
    { date: '2025-08-26', entryTime: '14:15', exitTime: '15:20', type: 'Scalping', market: 'Crypto_Currency', asset: 'Ripple (XRP)', quantity: 500, entryPrice: 54.2, targetPrice: 56.8, stopLoss: 52.8, exitPrice: 56.3, brokerage: 108, strategy: 'Double Bottom', margin: 2750, buySell: 'Buy', notes: 'Altcoin momentum', tags: ['crypto', 'altcoin'], emotion: 'excited' },
    { date: '2025-08-23', entryTime: '09:30', exitTime: '11:00', type: 'Intraday', market: 'Equity', asset: 'Adani Ports', quantity: 24, entryPrice: 1240, targetPrice: 1275, stopLoss: 1220, exitPrice: 1268, brokerage: 149, strategy: 'Head & shoulder', margin: 29800, buySell: 'Buy', notes: 'Infrastructure play', tags: ['infrastructure', 'adani'], emotion: 'neutral' },
    { date: '2025-08-22', entryTime: '12:30', exitTime: '14:00', type: 'Intraday', market: 'Forex', asset: 'GBP/INR', quantity: 80, entryPrice: 105.8, targetPrice: 106.3, stopLoss: 105.4, exitPrice: 106.2, brokerage: 42, strategy: 'Breakout', margin: 4240, buySell: 'Buy', notes: 'Pound strength on UK data', tags: ['forex', 'gbp'], emotion: 'confident' },
    { date: '2025-08-21', entryTime: '10:45', exitTime: '12:15', type: 'Swing Trading', market: 'Commodities', asset: 'Natural Gas', quantity: 15, entryPrice: 215, targetPrice: 228, stopLoss: 208, exitPrice: 225, brokerage: 81, strategy: 'Hammer Candle', margin: 3250, buySell: 'Buy', notes: 'Winter demand speculation', tags: ['gas', 'energy'], emotion: 'excited' },
    { date: '2025-08-20', entryTime: '13:45', exitTime: '15:10', type: 'Intraday', market: 'Equity', asset: 'Dr Reddy', quantity: 5, entryPrice: 6280, targetPrice: 6380, stopLoss: 6230, exitPrice: 6360, brokerage: 126, strategy: 'M Pattern', margin: 31500, buySell: 'Buy', notes: 'Pharma sector strength', tags: ['pharma', 'large-cap'], emotion: 'confident' },
    { date: '2025-08-19', entryTime: '09:15', exitTime: '10:45', type: 'Scalping', market: 'Futures', asset: 'BankNifty', quantity: 5, entryPrice: 46200, targetPrice: 46300, stopLoss: 46150, exitPrice: 46285, brokerage: 106, strategy: 'Breakout', margin: 231500, buySell: 'Buy', notes: 'Opening range breakout', tags: ['futures', 'banking'], emotion: 'excited' },

    // July 2025
    { date: '2025-07-31', entryTime: '11:20', exitTime: '12:50', type: 'Intraday', market: 'Equity', asset: 'Kotak Bank', quantity: 8, entryPrice: 1850, targetPrice: 1890, stopLoss: 1830, exitPrice: 1882, brokerage: 59, strategy: 'Double Bottom', margin: 14900, buySell: 'Buy', notes: 'Private banking strength', tags: ['banking', 'private'], emotion: 'confident' },
    { date: '2025-07-30', entryTime: '14:00', exitTime: '15:15', type: 'Intraday', market: 'Options', asset: 'Nifty', quantity: 7, entryPrice: 190, targetPrice: 230, stopLoss: 175, exitPrice: 220, brokerage: 70, strategy: 'Iron Condor', margin: 1360, buySell: 'Buy', strikePrice: 22200, optionType: 'Put', impliedVolatility: 18, daysToExpiry: 3, notes: 'End of month theta decay', tags: ['options', 'theta'], emotion: 'neutral' },
    { date: '2025-07-29', entryTime: '09:45', exitTime: '11:15', type: 'Intraday', market: 'Equity', asset: 'Dabur India', quantity: 31, entryPrice: 565, targetPrice: 580, stopLoss: 558, exitPrice: 577, brokerage: 71, strategy: 'Breakout', margin: 17600, buySell: 'Buy', notes: 'FMCG sector rally', tags: ['fmcg', 'consumer'], emotion: 'excited' },
    { date: '2025-07-26', entryTime: '12:00', exitTime: '13:30', type: 'Scalping', market: 'Crypto_Currency', asset: 'Solana (SOL)', quantity: 18, entryPrice: 2280, targetPrice: 2380, stopLoss: 2230, exitPrice: 2360, brokerage: 164, strategy: 'Head & shoulder', margin: 4140, buySell: 'Buy', notes: 'Alt season momentum', tags: ['crypto', 'altcoin'], emotion: 'excited' },
    { date: '2025-07-25', entryTime: '10:30', exitTime: '12:00', type: 'Intraday', market: 'Forex', asset: 'USD/JPY', quantity: 200, entryPrice: 143.8, targetPrice: 144.3, stopLoss: 143.5, exitPrice: 144.2, brokerage: 80, strategy: 'M Pattern', margin: 5750, buySell: 'Buy', notes: 'Yen weakness continues', tags: ['forex', 'jpy'], emotion: 'confident' },
    { date: '2025-07-24', entryTime: '13:15', exitTime: '14:45', type: 'Intraday', market: 'Equity', asset: 'Vedanta', quantity: 22, entryPrice: 395, targetPrice: 410, stopLoss: 388, exitPrice: 407, brokerage: 45, strategy: 'Breakout', margin: 8750, buySell: 'Buy', notes: 'Metal sector rotation', tags: ['metals', 'commodity'], emotion: 'neutral' },
    { date: '2025-07-23', entryTime: '09:20', exitTime: '10:50', type: 'Swing Trading', market: 'Commodities', asset: 'Copper', quantity: 9, entryPrice: 738, targetPrice: 755, stopLoss: 728, exitPrice: 752, brokerage: 133, strategy: 'Hammer Candle', margin: 6680, buySell: 'Buy', notes: 'Base metal demand pickup', tags: ['copper', 'metals'], emotion: 'confident' },
    { date: '2025-07-22', entryTime: '11:45', exitTime: '13:15', type: 'Intraday', market: 'Futures', asset: 'Nifty-50', quantity: 7, entryPrice: 21950, targetPrice: 22010, stopLoss: 21910, exitPrice: 21995, brokerage: 140, strategy: 'Double Bottom', margin: 154000, buySell: 'Buy', notes: 'Mid-week consolidation breakout', tags: ['futures'], emotion: 'excited' },
    { date: '2025-07-19', entryTime: '14:20', exitTime: '15:25', type: 'Scalping', market: 'Equity', asset: 'Grasim Industries', quantity: 26, entryPrice: 2140, targetPrice: 2180, stopLoss: 2120, exitPrice: 2172, brokerage: 166, strategy: 'Head & shoulder', margin: 55800, buySell: 'Buy', notes: 'Cement sector play', tags: ['cement', 'infrastructure'], emotion: 'neutral' },
    { date: '2025-07-18', entryTime: '10:00', exitTime: '11:30', type: 'Intraday', market: 'Options', asset: 'BankNifty', quantity: 8, entryPrice: 280, targetPrice: 330, stopLoss: 265, exitPrice: 315, brokerage: 80, strategy: 'Iron Condor', margin: 2280, buySell: 'Buy', strikePrice: 45800, optionType: 'Call', impliedVolatility: 21, daysToExpiry: 6, notes: 'Banking volatility trade', tags: ['options', 'banking'], emotion: 'confident' },
    { date: '2025-07-17', entryTime: '12:30', exitTime: '14:00', type: 'Intraday', market: 'Equity', asset: 'JSW Steel', quantity: 19, entryPrice: 845, targetPrice: 870, stopLoss: 832, exitPrice: 865, brokerage: 80, strategy: 'M Pattern', margin: 16100, buySell: 'Buy', notes: 'Steel sector momentum', tags: ['steel', 'metals'], emotion: 'excited' },
    { date: '2025-07-16', entryTime: '09:30', exitTime: '11:00', type: 'Intraday', market: 'Crypto_Currency', asset: 'Cardano (ADA)', quantity: 850, entryPrice: 38.5, targetPrice: 41.2, stopLoss: 37.0, exitPrice: 40.8, brokerage: 138, strategy: 'Breakout', margin: 3300, buySell: 'Buy', notes: 'Altcoin rally', tags: ['crypto', 'altcoin'], emotion: 'excited' },
    { date: '2025-07-15', entryTime: '13:45', exitTime: '15:10', type: 'Scalping', market: 'Forex', asset: 'AUD/USD', quantity: 180, entryPrice: 0.6720, targetPrice: 0.6755, stopLoss: 0.6700, exitPrice: 0.6748, brokerage: 72, strategy: 'Double Bottom', margin: 2420, buySell: 'Buy', notes: 'Aussie strength on commodities', tags: ['forex', 'aud'], emotion: 'confident' },

    // Additional diverse trades across June-August
    { date: '2025-08-15', entryTime: '10:15', exitTime: '11:45', type: 'Intraday', market: 'Equity', asset: 'Hindalco', quantity: 29, entryPrice: 615, targetPrice: 635, stopLoss: 605, exitPrice: 630, brokerage: 90, strategy: 'Breakout', margin: 17900, buySell: 'Buy', notes: 'Aluminum demand surge', tags: ['metals', 'aluminum'], emotion: 'excited' },
    { date: '2025-08-14', entryTime: '14:00', exitTime: '15:15', type: 'Scalping', market: 'Futures', asset: 'BankNifty', quantity: 6, entryPrice: 45650, targetPrice: 45750, stopLoss: 45600, exitPrice: 45730, brokerage: 127, strategy: 'Head & shoulder', margin: 274200, buySell: 'Buy', notes: 'Afternoon scalp', tags: ['futures', 'banking'], emotion: 'neutral' },
    { date: '2025-08-13', entryTime: '09:45', exitTime: '11:15', type: 'Intraday', market: 'Commodities', asset: 'Zinc', quantity: 12, entryPrice: 265, targetPrice: 275, stopLoss: 260, exitPrice: 273, brokerage: 64, strategy: 'Hammer Candle', margin: 3200, buySell: 'Buy', notes: 'Base metal strength', tags: ['metals', 'zinc'], emotion: 'confident' },
    { date: '2025-08-12', entryTime: '11:30', exitTime: '13:00', type: 'Intraday', market: 'Equity', asset: 'L&T', quantity: 11, entryPrice: 3580, targetPrice: 3640, stopLoss: 3550, exitPrice: 3628, brokerage: 159, strategy: 'M Pattern', margin: 39500, buySell: 'Buy', notes: 'Infrastructure capex play', tags: ['infrastructure', 'large-cap'], emotion: 'confident' },
    { date: '2025-08-09', entryTime: '13:15', exitTime: '14:45', type: 'Swing Trading', market: 'Crypto_Currency', asset: 'Polygon (MATIC)', quantity: 420, entryPrice: 52.3, targetPrice: 56.8, stopLoss: 50.2, exitPrice: 55.9, brokerage: 93, strategy: 'Double Bottom', margin: 2210, buySell: 'Buy', notes: 'Layer 2 momentum', tags: ['crypto', 'defi'], emotion: 'excited' },
    { date: '2025-08-08', entryTime: '10:00', exitTime: '11:30', type: 'Intraday', market: 'Options', asset: 'Nifty', quantity: 9, entryPrice: 165, targetPrice: 200, stopLoss: 152, exitPrice: 192, brokerage: 90, strategy: 'Iron Condor', margin: 1520, buySell: 'Buy', strikePrice: 21800, optionType: 'Call', impliedVolatility: 19, daysToExpiry: 4, notes: 'Theta decay strategy', tags: ['options', 'theta'], emotion: 'neutral' },
    { date: '2025-08-07', entryTime: '14:30', exitTime: '15:20', type: 'Scalping', market: 'Equity', asset: 'UltraTech Cement', quantity: 4, entryPrice: 9850, targetPrice: 10000, stopLoss: 9780, exitPrice: 9975, brokerage: 199, strategy: 'Breakout', margin: 39600, buySell: 'Buy', notes: 'Cement demand uptick', tags: ['cement', 'construction'], emotion: 'confident' },
    { date: '2025-08-06', entryTime: '09:20', exitTime: '10:50', type: 'Intraday', market: 'Forex', asset: 'EUR/GBP', quantity: 160, entryPrice: 0.8620, targetPrice: 0.8655, stopLoss: 0.8600, exitPrice: 0.8648, brokerage: 64, strategy: 'Head & shoulder', margin: 2760, buySell: 'Buy', notes: 'Cross-currency opportunity', tags: ['forex', 'eur'], emotion: 'excited' },
    { date: '2025-08-05', entryTime: '12:45', exitTime: '14:15', type: 'Intraday', market: 'Equity', asset: 'Eicher Motors', quantity: 3, entryPrice: 4820, targetPrice: 4920, stopLoss: 4770, exitPrice: 4905, brokerage: 73, strategy: 'Breakout', margin: 14500, buySell: 'Buy', notes: 'Premium auto segment strength', tags: ['auto', 'premium'], emotion: 'confident' },
    { date: '2025-08-02', entryTime: '10:45', exitTime: '12:15', type: 'Swing Trading', market: 'Commodities', asset: 'Platinum', quantity: 7, entryPrice: 28400, targetPrice: 29100, stopLoss: 27900, exitPrice: 28950, brokerage: 406, strategy: 'Hammer Candle', margin: 20000, buySell: 'Buy', notes: 'Precious metal rotation', tags: ['platinum', 'precious-metal'], emotion: 'neutral' },
    { date: '2025-08-01', entryTime: '13:00', exitTime: '14:30', type: 'Intraday', market: 'Futures', asset: 'Nifty-50', quantity: 8, entryPrice: 21550, targetPrice: 21620, stopLoss: 21510, exitPrice: 21605, brokerage: 160, strategy: 'Double Bottom', margin: 172600, buySell: 'Buy', notes: 'Month-start momentum', tags: ['futures'], emotion: 'excited' },

    // June 2025 trades
    { date: '2025-06-28', entryTime: '09:30', exitTime: '11:00', type: 'Intraday', market: 'Equity', asset: 'Nestle India', quantity: 2, entryPrice: 24500, targetPrice: 24850, stopLoss: 24300, exitPrice: 24800, brokerage: 248, strategy: 'M Pattern', margin: 49200, buySell: 'Buy', notes: 'Defensive FMCG play', tags: ['fmcg', 'defensive'], emotion: 'confident' },
    { date: '2025-06-27', entryTime: '11:45', exitTime: '13:15', type: 'Scalping', market: 'Crypto_Currency', asset: 'Litecoin (LTC)', quantity: 35, entryPrice: 7250, targetPrice: 7480, stopLoss: 7150, exitPrice: 7445, brokerage: 255, strategy: 'Breakout', margin: 25500, buySell: 'Buy', notes: 'Crypto recovery trade', tags: ['crypto', 'ltc'], emotion: 'excited' },
    { date: '2025-06-26', entryTime: '14:00', exitTime: '15:15', type: 'Intraday', market: 'Options', asset: 'BankNifty', quantity: 10, entryPrice: 350, targetPrice: 400, stopLoss: 335, exitPrice: 385, brokerage: 100, strategy: 'Iron Condor', margin: 3580, buySell: 'Buy', strikePrice: 45000, optionType: 'Put', impliedVolatility: 22, daysToExpiry: 7, notes: 'Banking vol expansion', tags: ['options', 'volatility'], emotion: 'neutral' },
    { date: '2025-06-25', entryTime: '10:15', exitTime: '11:45', type: 'Intraday', market: 'Equity', asset: 'Bajaj Auto', quantity: 12, entryPrice: 8950, targetPrice: 9100, stopLoss: 8880, exitPrice: 9075, brokerage: 217, strategy: 'Head & shoulder', margin: 107600, buySell: 'Buy', notes: 'Two-wheeler demand surge', tags: ['auto', '2w'], emotion: 'confident' },
    { date: '2025-06-24', entryTime: '12:30', exitTime: '14:00', type: 'Scalping', market: 'Forex', asset: 'CHF/JPY', quantity: 140, entryPrice: 162.5, targetPrice: 163.2, stopLoss: 162.1, exitPrice: 163.0, brokerage: 70, strategy: 'Breakout', margin: 4560, buySell: 'Buy', notes: 'Safe-haven cross trade', tags: ['forex', 'chf'], emotion: 'neutral' },
    { date: '2025-06-21', entryTime: '09:45', exitTime: '11:15', type: 'Intraday', market: 'Equity', asset: 'Hero MotoCorp', quantity: 16, entryPrice: 4680, targetPrice: 4780, stopLoss: 4640, exitPrice: 4765, brokerage: 299, strategy: 'Double Bottom', margin: 75100, buySell: 'Buy', notes: 'Auto sector rally', tags: ['auto', '2w'], emotion: 'excited' },
    { date: '2025-06-20', entryTime: '13:15', exitTime: '14:45', type: 'Swing Trading', market: 'Commodities', asset: 'Lead', quantity: 18, entryPrice: 185, targetPrice: 195, stopLoss: 180, exitPrice: 193, brokerage: 70, strategy: 'Hammer Candle', margin: 3360, buySell: 'Buy', notes: 'Industrial metal demand', tags: ['metals', 'industrial'], emotion: 'confident' },
    { date: '2025-06-19', entryTime: '10:00', exitTime: '11:30', type: 'Intraday', market: 'Futures', asset: 'BankNifty', quantity: 7, entryPrice: 44800, targetPrice: 44900, stopLoss: 44750, exitPrice: 44880, brokerage: 148, strategy: 'M Pattern', margin: 314200, buySell: 'Buy', notes: 'Banking index strength', tags: ['futures', 'banking'], emotion: 'confident' },
    { date: '2025-06-18', entryTime: '14:30', exitTime: '15:20', type: 'Scalping', market: 'Equity', asset: 'Shree Cement', quantity: 5, entryPrice: 27200, targetPrice: 27550, stopLoss: 27050, exitPrice: 27500, brokerage: 550, strategy: 'Breakout', margin: 136500, buySell: 'Buy', notes: 'Cement sector breakout', tags: ['cement', 'construction'], emotion: 'excited' },
    { date: '2025-06-17', entryTime: '09:20', exitTime: '10:50', type: 'Intraday', market: 'Crypto_Currency', asset: 'Avalanche (AVAX)', quantity: 65, entryPrice: 2840, targetPrice: 2980, stopLoss: 2760, exitPrice: 2950, brokerage: 383, strategy: 'Head & shoulder', margin: 18600, buySell: 'Buy', notes: 'DeFi platform rally', tags: ['crypto', 'defi'], emotion: 'neutral' },
    { date: '2025-06-14', entryTime: '11:45', exitTime: '13:15', type: 'Intraday', market: 'Options', asset: 'Nifty', quantity: 11, entryPrice: 210, targetPrice: 250, stopLoss: 198, exitPrice: 240, brokerage: 110, strategy: 'Iron Condor', margin: 2360, buySell: 'Buy', strikePrice: 21200, optionType: 'Call', impliedVolatility: 20, daysToExpiry: 5, notes: 'Weekly options play', tags: ['options', 'weekly'], emotion: 'confident' },
    { date: '2025-06-13', entryTime: '12:00', exitTime: '13:30', type: 'Intraday', market: 'Forex', asset: 'NZD/USD', quantity: 190, entryPrice: 0.6240, targetPrice: 0.6280, stopLoss: 0.6220, exitPrice: 0.6272, brokerage: 76, strategy: 'Breakout', margin: 2370, buySell: 'Buy', notes: 'Kiwi commodity strength', tags: ['forex', 'nzd'], emotion: 'excited' },
    { date: '2025-06-12', entryTime: '13:45', exitTime: '15:10', type: 'Scalping', market: 'Equity', asset: 'Tata Steel', quantity: 38, entryPrice: 142, targetPrice: 148, stopLoss: 139, exitPrice: 147, brokerage: 108, strategy: 'Double Bottom', margin: 5430, buySell: 'Buy', notes: 'Steel sector rotation', tags: ['steel', 'metals'], emotion: 'confident' },
    { date: '2025-06-11', entryTime: '10:30', exitTime: '12:00', type: 'Swing Trading', market: 'Commodities', asset: 'Aluminum', quantity: 24, entryPrice: 215, targetPrice: 226, stopLoss: 210, exitPrice: 224, brokerage: 108, strategy: 'Hammer Candle', margin: 5200, buySell: 'Buy', notes: 'Base metal recovery', tags: ['aluminum', 'metals'], emotion: 'neutral' },
    { date: '2025-06-10', entryTime: '09:15', exitTime: '10:45', type: 'Intraday', market: 'Equity', asset: 'Indraprastha Gas', quantity: 41, entryPrice: 485, targetPrice: 505, stopLoss: 475, exitPrice: 502, brokerage: 103, strategy: 'M Pattern', margin: 20000, buySell: 'Buy', notes: 'Gas utility play', tags: ['utility', 'gas'], emotion: 'confident' },
    { date: '2025-06-07', entryTime: '14:00', exitTime: '15:15', type: 'Intraday', market: 'Futures', asset: 'Nifty-50', quantity: 9, entryPrice: 20850, targetPrice: 20920, stopLoss: 20810, exitPrice: 20905, brokerage: 180, strategy: 'Breakout', margin: 188100, buySell: 'Buy', notes: 'Friday momentum', tags: ['futures'], emotion: 'excited' },
    { date: '2025-06-06', entryTime: '11:00', exitTime: '12:30', type: 'Scalping', market: 'Crypto_Currency', asset: 'Chainlink (LINK)', quantity: 110, entryPrice: 1280, targetPrice: 1340, stopLoss: 1250, exitPrice: 1330, brokerage: 293, strategy: 'Head & shoulder', margin: 14200, buySell: 'Buy', notes: 'Oracle network pump', tags: ['crypto', 'oracle'], emotion: 'excited' },
    { date: '2025-06-05', entryTime: '12:45', exitTime: '14:15', type: 'Intraday', market: 'Equity', asset: 'Mahindra & Mahindra', quantity: 13, entryPrice: 2420, targetPrice: 2480, stopLoss: 2390, exitPrice: 2470, brokerage: 128, strategy: 'Double Bottom', margin: 31600, buySell: 'Buy', notes: 'Auto and tractor strength', tags: ['auto', 'tractor'], emotion: 'confident' },
    { date: '2025-06-04', entryTime: '13:30', exitTime: '15:00', type: 'Intraday', market: 'Options', asset: 'BankNifty', quantity: 12, entryPrice: 390, targetPrice: 440, stopLoss: 375, exitPrice: 425, brokerage: 120, strategy: 'Iron Condor', margin: 4760, buySell: 'Buy', strikePrice: 44200, optionType: 'Call', impliedVolatility: 23, daysToExpiry: 8, notes: 'Banking volatility trade', tags: ['options', 'banking'], emotion: 'neutral' },
    { date: '2025-06-03', entryTime: '10:15', exitTime: '11:45', type: 'Intraday', market: 'Forex', asset: 'CAD/JPY', quantity: 170, entryPrice: 106.8, targetPrice: 107.4, stopLoss: 106.5, exitPrice: 107.3, brokerage: 85, strategy: 'Breakout', margin: 3640, buySell: 'Buy', notes: 'Loonie commodity play', tags: ['forex', 'cad'], emotion: 'confident' }
  ];
  const recentTemplate = remapTradesToRecentTimeline(template);

  return recentTemplate.map((trade, index) => {
    const normalized = {
      id: index + 1,
      ...trade,
      targetPrice: trade.targetPrice || 0,
      stopLoss: trade.stopLoss || 0,
      brokerage: trade.brokerage != null ? trade.brokerage : 0,
      contract: trade.contract || getContractLabelFromDate(trade.date),
      timeZone: trade.timeZone || getSelectedTimeZone(),
      notes: trade.notes || '',
      tags: trade.tags || [],
      emotion: trade.emotion || 'neutral',
      strikePrice: trade.strikePrice ?? null,
      optionType: trade.optionType ?? null,
      underlyingPrice: trade.underlyingPrice ?? null,
      impliedVolatility: trade.impliedVolatility ?? null,
      daysToExpiry: trade.daysToExpiry ?? null
    };
    normalized.pnl = calculatePnLSnapshot(normalized);
    return normalized;
  });
}

function remapTradesToRecentTimeline(tradesList) {
  if (!Array.isArray(tradesList) || tradesList.length === 0) return tradesList;

  const uniqueDates = Array.from(new Set(tradesList.map(trade => trade.date).filter(Boolean)));
  if (uniqueDates.length === 0) return tradesList;

  const sortedAsc = uniqueDates.sort((a, b) => new Date(a) - new Date(b));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const spanDays = Math.max(84, sortedAsc.length * 2);
  const stepDays = sortedAsc.length > 1
    ? Math.max(1, Math.floor(spanDays / (sortedAsc.length - 1)))
    : 0;

  const dateMap = {};
  sortedAsc.forEach((originalDate, index) => {
    const daysBack = (sortedAsc.length - 1 - index) * stepDays;
    const mappedDate = new Date(today);
    mappedDate.setDate(mappedDate.getDate() - daysBack);
    dateMap[originalDate] = formatDateYYYYMMDD(mappedDate);
  });

  return tradesList.map(trade => ({
    ...trade,
    date: dateMap[trade.date] || trade.date
  }));
}

function formatDateYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getContractLabelFromDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'CURRENT';
  }
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${months[date.getMonth()]}-${date.getFullYear()}`;
}

function createSampleData2() {
  const base = createSampleTrades();
  const conservativeSlice = base.filter((_, index) => index % 2 === 0);

  return conservativeSlice.map((trade, index) => {
    const quantity = Math.max(1, Math.round((trade.quantity || 1) * 0.65));
    const entryPrice = parseFloat(trade.entryPrice) || 0;
    const direction = 'Buy';
    const expectedMovePct = index % 5 === 0 ? -0.006 : 0.012;
    const exitPrice = parseFloat((entryPrice * (1 + expectedMovePct)).toFixed(4));

    const adjusted = {
      ...trade,
      id: index + 1,
      buySell: direction,
      type: index % 3 === 0 ? 'Positional Trading' : 'Swing Trading',
      quantity,
      entryPrice,
      exitPrice,
      brokerage: parseFloat(((trade.brokerage || 0) * 0.8).toFixed(2)),
      notes: `${trade.notes || ''} [Sample Data 2]`,
      strategy: index % 2 === 0 ? 'W Pattern' : 'Hammer Candle'
    };

    adjusted.pnl = calculatePnLSnapshot(adjusted);
    return adjusted;
  });
}

function createSampleData3() {
  const base = createSampleTrades();
  const scalpingTimes = ['09:20', '09:40', '10:05', '10:35', '11:10', '12:00', '13:15', '14:05'];

  return base.map((trade, index) => {
    const entryPrice = parseFloat(trade.entryPrice) || 0;
    const direction = index % 3 === 0 ? 'Sell' : 'Buy';
    const movePct = index % 4 === 0 ? 0.0035 : index % 4 === 1 ? 0.0028 : index % 4 === 2 ? -0.0022 : 0.0015;

    const exitPrice = direction === 'Sell'
      ? parseFloat((entryPrice * (1 - movePct)).toFixed(4))
      : parseFloat((entryPrice * (1 + movePct)).toFixed(4));

    const start = scalpingTimes[index % scalpingTimes.length];
    const end = scalpingTimes[(index + 1) % scalpingTimes.length];

    const adjusted = {
      ...trade,
      id: index + 1,
      buySell: direction,
      type: 'Scalping',
      market: index % 2 === 0 ? 'Futures' : 'Options',
      quantity: Math.max(1, Math.round((trade.quantity || 1) * 1.25)),
      entryTime: start,
      exitTime: end,
      entryPrice,
      exitPrice,
      brokerage: parseFloat(((trade.brokerage || 0) * 1.05).toFixed(2)),
      notes: `${trade.notes || ''} [Sample Data 3]`,
      strategy: index % 2 === 0 ? 'Breakout' : 'M Pattern'
    };

    adjusted.pnl = calculatePnLSnapshot(adjusted);
    return adjusted;
  });
}

function createSampleData4() {
  const base = createSampleTrades();
  return buildExpandedSampleSet(base, {
    rounds: 2,
    qtyMultiplier: 1.35,
    brokerageMultiplier: 1.1,
    movePattern: [0.011, 0.014, -0.007, 0.009, 0.012],
    directionPattern: ['Buy', 'Buy', 'Buy', 'Sell'],
    typePattern: ['Intraday', 'Swing Trading', 'Scalping', 'Positional Trading'],
    strategyPattern: ['Breakout', 'M Pattern', 'Double Bottom', 'Head & shoulder'],
    marketPattern: ['Equity', 'Futures', 'Options', 'Commodities', 'Forex'],
    dateShiftPerRound: 12,
    notesSuffix: ' [Sample Data 4]'
  });
}

function createSampleData5() {
  const base = createSampleTrades();
  return buildExpandedSampleSet(base, {
    rounds: 2,
    qtyMultiplier: 0.9,
    brokerageMultiplier: 0.95,
    movePattern: [0.0065, 0.008, -0.0045, 0.0055, -0.0035],
    directionPattern: ['Buy', 'Buy', 'Sell', 'Buy'],
    typePattern: ['Swing Trading', 'Positional Trading', 'Intraday'],
    strategyPattern: ['W Pattern', 'Hammer Candle', 'Iron Condor', 'Breakout'],
    marketPattern: ['Equity', 'Commodities', 'Forex', 'Options'],
    dateShiftPerRound: 14,
    notesSuffix: ' [Sample Data 5]'
  });
}

function createSampleData6() {
  const base = createSampleTrades();
  return buildExpandedSampleSet(base, {
    rounds: 2,
    qtyMultiplier: 1.6,
    brokerageMultiplier: 1.2,
    movePattern: [0.015, -0.01, 0.0125, 0.009, -0.0075],
    directionPattern: ['Sell', 'Buy', 'Sell', 'Buy'],
    typePattern: ['Scalping', 'Intraday', 'Swing Trading'],
    strategyPattern: ['Iron Condor', 'Breakout', 'M Pattern', 'Head & shoulder'],
    marketPattern: ['Futures', 'Options', 'Futures', 'Options', 'Equity'],
    dateShiftPerRound: 10,
    notesSuffix: ' [Sample Data 6]'
  });
}

function createSampleData7() {
  const base = createSampleTrades();
  return buildExpandedSampleSet(base, {
    rounds: 3,
    qtyMultiplier: 1.05,
    brokerageMultiplier: 1,
    movePattern: [0.01, -0.012, 0.014, -0.009, 0.007, 0.011],
    directionPattern: ['Buy', 'Sell', 'Buy', 'Sell'],
    typePattern: ['Intraday', 'Scalping', 'Swing Trading', 'Positional Trading'],
    strategyPattern: ['Breakout', 'Double Bottom', 'Hammer Candle', 'W Pattern'],
    marketPattern: ['Equity', 'Futures', 'Options', 'Commodities', 'Crypto_Currency', 'Forex'],
    dateShiftPerRound: 18,
    notesSuffix: ' [Sample Data 7]'
  });
}

function buildExpandedSampleSet(baseTrades, config) {
  if (!Array.isArray(baseTrades) || baseTrades.length === 0) return [];

  const rounds = Math.max(1, config.rounds || 1);
  const qtyMultiplier = Number(config.qtyMultiplier || 1);
  const brokerageMultiplier = Number(config.brokerageMultiplier || 1);
  const movePattern = Array.isArray(config.movePattern) && config.movePattern.length > 0
    ? config.movePattern
    : [0.01];
  const directionPattern = Array.isArray(config.directionPattern) && config.directionPattern.length > 0
    ? config.directionPattern
    : ['Buy'];
  const typePattern = Array.isArray(config.typePattern) && config.typePattern.length > 0
    ? config.typePattern
    : ['Intraday'];
  const strategyPattern = Array.isArray(config.strategyPattern) && config.strategyPattern.length > 0
    ? config.strategyPattern
    : ['Breakout'];
  const marketPattern = Array.isArray(config.marketPattern) && config.marketPattern.length > 0
    ? config.marketPattern
    : ['Equity'];
  const notesSuffix = config.notesSuffix || '';
  const dateShiftPerRound = Number(config.dateShiftPerRound || 0);

  const expanded = [];

  for (let round = 0; round < rounds; round++) {
    baseTrades.forEach((trade, index) => {
      const sequence = round * baseTrades.length + index;
      const entryPrice = parseFloat(trade.entryPrice) || 0;
      const move = movePattern[sequence % movePattern.length];
      const direction = directionPattern[sequence % directionPattern.length] === 'Sell' ? 'Sell' : 'Buy';
      const exitPrice = direction === 'Sell'
        ? parseFloat((entryPrice * (1 - move)).toFixed(4))
        : parseFloat((entryPrice * (1 + move)).toFixed(4));

      const adjusted = {
        ...trade,
        buySell: direction,
        type: typePattern[sequence % typePattern.length],
        strategy: strategyPattern[sequence % strategyPattern.length],
        market: marketPattern[sequence % marketPattern.length],
        quantity: Math.max(1, parseFloat(((parseFloat(trade.quantity) || 1) * qtyMultiplier).toFixed(2))),
        entryPrice,
        exitPrice,
        brokerage: parseFloat((((parseFloat(trade.brokerage) || 0) * brokerageMultiplier) + round * 2).toFixed(2)),
        date: shiftDateByDays(trade.date, round * dateShiftPerRound),
        notes: `${trade.notes || ''}${notesSuffix}`
      };

      adjusted.pnl = calculatePnLSnapshot(adjusted);
      expanded.push(adjusted);
    });
  }

  return expanded.map((trade, index) => ({
    ...trade,
    id: index + 1
  }));
}

function shiftDateByDays(dateString, daysBack) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  date.setDate(date.getDate() - daysBack);
  return date.toISOString().slice(0, 10);
}

function calculatePnLSnapshot(trade) {
  const quantity = parseFloat(trade.quantity) || 0;
  const entry = parseFloat(trade.entryPrice) || 0;
  const exit = parseFloat(trade.exitPrice) || 0;
  const brokerage = parseFloat(trade.brokerage) || 0;
  const direction = trade.buySell === 'Sell' ? 'Sell' : 'Buy';
  if (direction === 'Sell') {
    return (entry - exit) * quantity - brokerage;
  }
  return (exit - entry) * quantity - brokerage;
}

// ==================== INTERACTIVE CALENDAR VIEW ====================

function renderCalendarView() {
  const month = parseInt(document.getElementById('calendarMonthSelect').value);
  const year = parseInt(document.getElementById('calendarYearSelect').value);

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  // Group trades by date
  const tradesByDate = {};
  trades.forEach(trade => {
    const tradeDate = new Date(trade.date);
    if (tradeDate.getMonth() === month && tradeDate.getFullYear() === year) {
      const day = tradeDate.getDate();
      if (!tradesByDate[day]) {
        tradesByDate[day] = [];
      }
      tradesByDate[day].push(trade);
    }
  });

  // Calculate metrics
  const tradingDays = Object.keys(tradesByDate).length;
  let profitableDays = 0;
  let lossDays = 0;
  let bestDay = { day: '-', pnl: -Infinity };

  Object.entries(tradesByDate).forEach(([day, dayTrades]) => {
    const dayPnL = dayTrades.reduce((sum, t) => sum + getTradePnlInINR(t), 0);
    if (dayPnL > 0) profitableDays++;
    else if (dayPnL < 0) lossDays++;
    if (dayPnL > bestDay.pnl) {
      bestDay = { day, pnl: dayPnL };
    }
  });

  // Update metrics
  document.getElementById('calTradingDays').textContent = tradingDays;
  document.getElementById('calProfitableDays').textContent = profitableDays;
  document.getElementById('calLossDays').textContent = lossDays;
  document.getElementById('calBestDay').textContent = bestDay.day !== '-' ? `${bestDay.day} (${formatCurrency(bestDay.pnl)})` : '-';

  // Render calendar grid
  const calendarGrid = document.getElementById('calendarGrid');
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  let html = `
    <div style="grid-column: 1/-1; text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 10px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
      ${monthNames[month]} ${year}
    </div>
  `;

  // Day headers
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(day => {
    html += `<div style="text-align: center; font-weight: bold; padding: 10px; opacity: 0.7;">${day}</div>`;
  });

  // Empty cells for days before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    html += `<div style="padding: 15px; border-radius: 8px; background: rgba(255,255,255,0.02);"></div>`;
  }

  // Calendar days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayTrades = tradesByDate[day] || [];
    const dayPnL = dayTrades.reduce((sum, t) => sum + getTradePnlInINR(t), 0);
    const tradeCount = dayTrades.length;

    let bgColor = 'rgba(255,255,255,0.05)';
    let indicator = '';
    let borderColor = 'transparent';

    if (tradeCount > 0) {
      if (dayPnL > 0) {
        bgColor = 'rgba(5, 150, 105, 0.15)';
        borderColor = '#059669';
        indicator = '<svg width="12" height="12" viewBox="0 0 24 24" fill="#059669" style="vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle></svg>';
      } else if (dayPnL < 0) {
        bgColor = 'rgba(220, 38, 38, 0.15)';
        borderColor = '#dc2626';
        indicator = '<svg width="12" height="12" viewBox="0 0 24 24" fill="#dc2626" style="vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle></svg>';
      } else {
        bgColor = 'rgba(251, 191, 36, 0.15)';
        borderColor = '#fbbf24';
        indicator = '<svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" style="vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle></svg>';
      }
    }

    html += `
      <div onclick="showDayDetails(${day}, ${month}, ${year})" style="
        padding: 15px; 
        border-radius: 8px; 
        background: ${bgColor};
        border: 2px solid ${borderColor};
        cursor: ${tradeCount > 0 ? 'pointer' : 'default'};
        transition: all 0.2s;
        text-align: center;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        <div style="font-size: 18px; font-weight: bold;">${day}</div>
        ${tradeCount > 0 ? `
          <div style="font-size: 12px; margin-top: 5px;">${indicator} ${tradeCount} trade${tradeCount > 1 ? 's' : ''}</div>
          <div style="font-size: 11px; font-weight: bold; margin-top: 3px; color: ${dayPnL >= 0 ? '#059669' : '#dc2626'};">
            ${formatCurrencyShort(dayPnL)}
          </div>
        ` : '<div style="height: 40px;"></div>'}
      </div>
    `;
  }

  calendarGrid.innerHTML = html;
}

function showDayDetails(day, month, year) {
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const dayTrades = trades.filter(t => t.date === dateStr);

  const dayDetails = document.getElementById('dayDetails');

  if (dayTrades.length === 0) {
    dayDetails.innerHTML = '<p style="text-align: center; opacity: 0.6;">No trades on this day</p>';
    return;
  }

  const dayPnL = dayTrades.reduce((sum, t) => sum + getTradePnlInINR(t), 0);
  const wins = dayTrades.filter(t => t.pnl > 0).length;
  const losses = dayTrades.filter(t => t.pnl < 0).length;

  let html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid var(--border);">
      <div>
        <h3 style="margin: 0;">${formatDate(dateStr)}</h3>
        <p style="margin: 5px 0 0 0; opacity: 0.7;">${dayTrades.length} trade${dayTrades.length > 1 ? 's' : ''} • ${wins}W ${losses}L</p>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 24px; font-weight: bold; color: ${dayPnL >= 0 ? '#059669' : '#dc2626'};">
          ${formatCurrency(dayPnL)}
        </div>
        <div style="font-size: 14px; opacity: 0.8;">
          ${dayPnL >= 0 ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; display: inline;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg> Profitable Day' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; display: inline;"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg> Loss Day'}
        </div>
      </div>
    </div>
    <div style="display: grid; gap: 15px;">
  `;

  dayTrades.forEach(trade => {
    const statusClass = trade.pnl >= 0 ? 'positive' : 'negative';
    html += `
      <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border-left: 3px solid ${trade.pnl >= 0 ? '#059669' : '#dc2626'};">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${trade.asset}</strong> • ${trade.strategy}
            <div style="font-size: 12px; opacity: 0.7; margin-top: 4px;">
              ${trade.type} • ${trade.buySell || 'Buy'} • ${trade.entryTime} - ${trade.exitTime}
            </div>
          </div>
          <div style="text-align: right;">
            <div class="${statusClass}" style="font-size: 18px; font-weight: bold;">
              ${formatTradeCurrency(trade.pnl, trade)}
            </div>
            <div style="font-size: 12px; opacity: 0.7;">
              ${trade.quantity} @ ${formatTradeCurrency(trade.entryPrice, trade)} → ${formatTradeCurrency(trade.exitPrice, trade)}
            </div>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  dayDetails.innerHTML = html;
}

function changeCalendarMonth(direction) {
  const monthSelect = document.getElementById('calendarMonthSelect');
  const yearSelect = document.getElementById('calendarYearSelect');
  let month = parseInt(monthSelect.value);
  let year = parseInt(yearSelect.value);

  month += direction;

  if (month > 11) {
    month = 0;
    year++;
  } else if (month < 0) {
    month = 11;
    year--;
  }

  monthSelect.value = month;
  yearSelect.value = year;
  renderCalendarView();
}

// ==================== HOURLY PERFORMANCE ANALYSIS ====================

function renderHourlyAnalysis() {
  // Build 24h buckets so equity, forex, and crypto data all align
  const hourlyData = {};
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = { trades: [], totalPnL: 0, wins: 0, losses: 0 };
  }

  const sessions = {};
  GLOBAL_SESSIONS.forEach(session => {
    sessions[session.label] = [];
  });

  trades.forEach(trade => {
    const entryHour = getEntryHour(trade.entryTime);
    if (entryHour === null) return;
    const pnlInINR = getTradePnlInINR(trade);
    hourlyData[entryHour].trades.push(trade);
    hourlyData[entryHour].totalPnL += pnlInINR;
    if (pnlInINR > 0) hourlyData[entryHour].wins++;
    else if (pnlInINR < 0) hourlyData[entryHour].losses++;

    const sessionLabel = getSessionLabelForTrade(trade);
    if (sessions[sessionLabel]) {
      sessions[sessionLabel].push(trade);
    }
  });

  const hourEntries = Object.entries(hourlyData).map(([hour, data]) => ({
    hour: parseInt(hour, 10),
    data
  }));

  const bestHourEntry = hourEntries.reduce((best, current) => {
    if (!best) return current;
    return current.data.totalPnL > best.data.totalPnL ? current : best;
  }, null);
  const bestHour = bestHourEntry ? bestHourEntry.hour : null;
  const bestPnL = bestHourEntry ? bestHourEntry.data.totalPnL : 0;

  let activeSession = GLOBAL_SESSIONS[0]?.label || 'Global Session';
  let maxTrades = -1;
  Object.entries(sessions).forEach(([session, sessionTrades]) => {
    if (sessionTrades.length > maxTrades) {
      maxTrades = sessionTrades.length;
      activeSession = session;
    }
  });

  // Calculate average trade duration
  let totalDuration = 0;
  let durationCount = 0;
  trades.forEach(trade => {
    const entry = new Date(`2000-01-01T${trade.entryTime}`);
    const exit = new Date(`2000-01-01T${trade.exitTime}`);
    const duration = (exit - entry) / (1000 * 60 * 60); // hours
    if (duration > 0 && duration < 24) {
      totalDuration += duration;
      durationCount++;
    }
  });
  const avgDuration = durationCount > 0 ? totalDuration / durationCount : 0;

  // Update metrics
  document.getElementById('bestHour').textContent = bestHour !== null ? `${formatHourDisplay(bestHour)} (${formatCurrency(bestPnL)})` : '--';
  document.getElementById('activeSession').textContent = activeSession;
  document.getElementById('avgDuration').textContent = `${avgDuration.toFixed(1)} hrs`;
  document.getElementById('peakTime').textContent = bestHour !== null ? formatHourRange(bestHour) : '--';

  // Hourly P&L Chart
  const hours = hourEntries.map(entry => formatHourDisplay(entry.hour));
  const pnlData = hourEntries.map(entry => entry.data.totalPnL);

  const hourlyPnLChart = document.getElementById('hourlyPnLChart');
  if (hourlyPnLChart.chart) hourlyPnLChart.chart.destroy();

  const chartColors = getChartColors();

  hourlyPnLChart.chart = new Chart(hourlyPnLChart, {
    type: 'bar',
    data: {
      labels: hours,
      datasets: [{
        label: `P&L (${getCurrencySymbol()})`,
        data: pnlData,
        backgroundColor: pnlData.map(p => p >= 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'),
        borderColor: pnlData.map(p => p >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: chartColors.tooltipBg,
          titleColor: chartColors.tooltipText,
          bodyColor: chartColors.tooltipText,
          callbacks: {
            label: (context) => `P&L: ${formatCurrency(context.parsed.y)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: chartColors.textSecondary },
          grid: { color: chartColors.gridColor }
        },
        x: {
          ticks: { color: chartColors.textSecondary },
          grid: { display: false }
        }
      }
    }
  });

  // Trade Count Chart
  const tradeCountData = hourEntries.map(entry => entry.data.trades.length);

  const hourlyTradeCountChart = document.getElementById('hourlyTradeCountChart');
  if (hourlyTradeCountChart.chart) hourlyTradeCountChart.chart.destroy();

  hourlyTradeCountChart.chart = new Chart(hourlyTradeCountChart, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [{
        label: 'Number of Trades',
        data: tradeCountData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: chartColors.tooltipBg,
          titleColor: chartColors.tooltipText,
          bodyColor: chartColors.tooltipText,
          callbacks: {
            label: (context) => `Trades: ${context.parsed.y}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: chartColors.textSecondary, stepSize: 1 },
          grid: { color: chartColors.gridColor }
        },
        x: {
          ticks: { color: chartColors.textSecondary },
          grid: { display: false }
        }
      }
    }
  });

  // Session Performance Chart
  const sessionLabels = Object.keys(sessions);
  const sessionPnL = sessionLabels.map(label => sessions[label].reduce((sum, t) => sum + getTradePnlInINR(t), 0));

  const sessionChart = document.getElementById('sessionPerformanceChart');
  if (sessionChart.chart) sessionChart.chart.destroy();

  sessionChart.chart = new Chart(sessionChart, {
    type: 'doughnut',
    data: {
      labels: sessionLabels,
      datasets: [{
        data: sessionPnL.map(p => Math.abs(p)),
        backgroundColor: [
          'rgba(251, 191, 36, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(168, 85, 247, 0.6)'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: window.innerWidth < 768 ? 'bottom' : 'right',
          labels: { color: '#94a3b8', padding: 15 }
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${formatCurrency(sessionPnL[context.dataIndex])}`
          }
        }
      }
    }
  });

  // Win Rate by Hour Chart
  const winRateData = hourEntries.map(entry => {
    const d = entry.data;
    const total = d.wins + d.losses;
    return total > 0 ? (d.wins / total) * 100 : 0;
  });

  const hourlyWinRateChart = document.getElementById('hourlyWinRateChart');
  if (hourlyWinRateChart.chart) hourlyWinRateChart.chart.destroy();

  hourlyWinRateChart.chart = new Chart(hourlyWinRateChart, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [{
        label: 'Win Rate (%)',
        data: winRateData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: chartColors.tooltipBg,
          titleColor: chartColors.tooltipText,
          bodyColor: chartColors.tooltipText,
          callbacks: {
            label: (context) => `Win Rate: ${context.parsed.y.toFixed(1)}%`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { color: chartColors.textSecondary },
          grid: { color: chartColors.gridColor }
        },
        x: {
          ticks: { color: chartColors.textSecondary },
          grid: { display: false }
        }
      }
    }
  });

  // Hourly Breakdown Table
  const tbody = document.getElementById('hourlyBreakdownBody');
  tbody.innerHTML = hourEntries.map(entry => {
    const hourLabel = formatHourDisplay(entry.hour);
    const data = entry.data;
    const avgPnL = data.trades.length > 0 ? data.totalPnL / data.trades.length : 0;
    const winRate = (data.wins + data.losses) > 0 ? (data.wins / (data.wins + data.losses)) * 100 : 0;

    // Find best strategy for this hour
    const strategyCount = {};
    data.trades.forEach(t => {
      const stratKey = normalizeStrategyName(t.strategy) || 'N/A';
      strategyCount[stratKey] = (strategyCount[stratKey] || 0) + 1;
    });
    const bestStrategy = Object.keys(strategyCount).reduce((a, b) =>
      strategyCount[a] > strategyCount[b] ? a : b, '-'
    );

    const statusClass = data.totalPnL >= 0 ? 'positive' : 'negative';
    const performance = data.totalPnL >= 0 ? 'Good' : 'Poor';
    const badgeClass = data.totalPnL >= 0 ? 'performance-badge-good' : 'performance-badge-poor';

    return `
      <tr>
        <td>${hourLabel}</td>
        <td>${data.trades.length}</td>
        <td class="${statusClass}">${formatCurrency(data.totalPnL)}</td>
        <td class="${statusClass}">${formatCurrency(avgPnL)}</td>
        <td>${winRate.toFixed(1)}%</td>
        <td>${bestStrategy}</td>
        <td><span class="${badgeClass}">${performance}</span></td>
      </tr>
    `;
  }).join('');
}

// ==================== HEATMAP VISUALIZATIONS ====================

function renderHeatmapsTab() {
  const tab = document.getElementById('heatmaps-tab');
  if (!tab) return;
  populateHeatmapYearOptions();
  const filteredTrades = getHeatmapFilteredTrades();
  renderHeatmapMetrics(filteredTrades);
  renderMonthlyHeatmap(filteredTrades);
  renderDayOfWeekHeatmap(filteredTrades);
  renderHourMarketHeatmap(filteredTrades);
}

function populateHeatmapYearOptions() {
  const yearSelect = document.getElementById('heatmapYearSelect');
  if (!yearSelect) return;
  const currentValue = yearSelect.value || 'all';
  const years = Array.from(new Set(trades.map(t => new Date(t.date).getFullYear()))).sort();
  let options = '<option value="all">All Years</option>';
  years.forEach(year => {
    options += `<option value="${year}">${year}</option>`;
  });
  yearSelect.innerHTML = options;
  if (years.includes(parseInt(currentValue))) {
    yearSelect.value = currentValue;
  } else {
    yearSelect.value = 'all';
  }
}

function getHeatmapFilteredTrades() {
  const rangeSelect = document.getElementById('heatmapRangeSelect');
  const rangeValue = rangeSelect ? rangeSelect.value : 'all';
  if (rangeValue === 'all') {
    return [...trades];
  }
  const days = parseInt(rangeValue, 10);
  if (isNaN(days)) return [...trades];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return trades.filter(trade => new Date(trade.date) >= cutoff);
}

function renderHeatmapMetrics(tradesSubset) {
  const container = document.getElementById('heatmapMetrics');
  if (!container) return;
  if (!tradesSubset || tradesSubset.length === 0) {
    container.innerHTML = `<div class="heatmap-empty" style="grid-column: 1 / -1;">Add more trades to unlock heatmap insights.</div>`;
    return;
  }
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthTotals = new Array(12).fill(0);
  const weekdayTotals = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const hourTotals = {};
  const marketTotals = {};

  tradesSubset.forEach(trade => {
    const date = new Date(trade.date);
    const pnlInINR = getTradePnlInINR(trade);
    if (!isNaN(date)) {
      monthTotals[date.getMonth()] += pnlInINR;
      const weekdayLabel = dayNames[date.getDay()];
      if (weekdayTotals[weekdayLabel] !== undefined) {
        weekdayTotals[weekdayLabel] += pnlInINR;
      }
    }
    const hour = getEntryHour(trade.entryTime);
    if (hour !== null) {
      hourTotals[hour] = (hourTotals[hour] || 0)  + getTradePnlInINR(trade);
    }
    const marketKey = trade.market || 'Other';
    marketTotals[marketKey] = (marketTotals[marketKey] || 0)  + getTradePnlInINR(trade);
  });

  const bestMonthIndex = monthTotals.reduce((bestIdx, value, idx, arr) => value > arr[bestIdx] ? idx : bestIdx, 0);
  const bestWeekday = Object.entries(weekdayTotals).reduce((best, current) => current[1] > best[1] ? current : best, ['Mon', 0]);
  const bestHour = Object.entries(hourTotals).sort((a, b) => b[1] - a[1])[0] || [null, 0];
  const bestMarket = Object.entries(marketTotals).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

  container.innerHTML = `
    <div class="metric-card">
      <h3>Seasonality Champion</h3>
      <div class="value ${monthTotals[bestMonthIndex] >= 0 ? 'positive' : 'negative'}">${monthNames[bestMonthIndex]}</div>
      <small>${formatCurrencyShort(monthTotals[bestMonthIndex])}</small>
    </div>
    <div class="metric-card">
      <h3>Best Weekday</h3>
      <div class="value ${bestWeekday[1] >= 0 ? 'positive' : 'negative'}">${bestWeekday[0]}</div>
      <small>${formatCurrencyShort(bestWeekday[1])}</small>
    </div>
    <div class="metric-card">
      <h3>Power Hour</h3>
      <div class="value">${bestHour[0] !== null ? formatHourDisplay(parseInt(bestHour[0], 10)) : 'N/A'}</div>
      <small>${formatCurrencyShort(bestHour[1])}</small>
    </div>
    <div class="metric-card">
      <h3>Top Market Edge</h3>
      <div class="value">${bestMarket[0]}</div>
      <small>${formatCurrencyShort(bestMarket[1])}</small>
    </div>
  `;
}

function renderMonthlyHeatmap(tradesSubset) {
  const grid = document.getElementById('monthlyHeatmapGrid');
  const badge = document.getElementById('heatmapYearBadge');
  const yearSelect = document.getElementById('heatmapYearSelect');
  if (!grid || !yearSelect) return;
  const dataset = tradesSubset || getHeatmapFilteredTrades();
  const selectedYear = yearSelect.value || 'all';
  if (badge) {
    badge.textContent = selectedYear === 'all' ? 'All Years' : selectedYear;
  }
  const filtered = dataset.filter(trade => {
    if (selectedYear === 'all') return true;
    return new Date(trade.date).getFullYear() === parseInt(selectedYear, 10);
  });
  const monthStats = Array.from({ length: 12 }, () => ({ pnl: 0, trades: 0 }));
  filtered.forEach(trade => {
    const date = new Date(trade.date);
    if (!isNaN(date)) {
      const month = date.getMonth();
      monthStats[month].pnl += getTradePnlInINR(trade);
      monthStats[month].trades += 1;
    }
  });
  const maxAbs = Math.max(1, ...monthStats.map(stat => Math.abs(stat.pnl)));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  grid.innerHTML = monthStats.map((stat, idx) => {
    const color = getHeatmapColor(stat.pnl, maxAbs);
    const title = `${months[idx]} • ${stat.trades} trade${stat.trades === 1 ? '' : 's'}\nP&L: ${formatCurrencyShort(stat.pnl)}`;
    return `
      <div class="heatmap-cell" style="background:${color};" title="${title}">
        <span class="heatmap-label">${months[idx]}</span>
        <strong>${formatCurrencyShort(stat.pnl)}</strong>
        <small>${stat.trades} trade${stat.trades === 1 ? '' : 's'}</small>
      </div>
    `;
  }).join('');
}

function renderDayOfWeekHeatmap(tradesSubset) {
  const grid = document.getElementById('weekdayHeatmapGrid');
  if (!grid) return;
  const dataset = tradesSubset || getHeatmapFilteredTrades();
  if (dataset.length === 0) {
    grid.innerHTML = `<div class="heatmap-empty" style="grid-column: 1 / -1;">No trades in selected range.</div>`;
    return;
  }
  const sessionBuckets = GLOBAL_SESSIONS.map(session => session.label);
  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  grid.style.gridTemplateColumns = `repeat(${sessionBuckets.length + 1}, minmax(120px, 1fr))`;
  const dayMap = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };
  const matrix = dayOrder.reduce((acc, day) => {
    acc[day] = sessionBuckets.reduce((sessionAcc, session) => {
      sessionAcc[session] = { pnl: 0, trades: 0 };
      return sessionAcc;
    }, {});
    return acc;
  }, {});
  dataset.forEach(trade => {
    const date = new Date(trade.date);
    if (isNaN(date)) return;
    const dayLabel = dayMap[date.getDay()];
    const session = getSessionBucket(trade);
    if (matrix[dayLabel] && matrix[dayLabel][session]) {
      matrix[dayLabel][session].pnl += getTradePnlInINR(trade);
      matrix[dayLabel][session].trades += 1;
    }
  });
  const values = dayOrder.flatMap(day => sessionBuckets.map(session => Math.abs(matrix[day][session].pnl)));
  const maxAbs = Math.max(1, ...values);
  let html = '<div class="heatmap-cell heatmap-cell-header">Day / Session</div>';
  sessionBuckets.forEach(session => {
    html += `<div class="heatmap-cell heatmap-cell-header">${session}</div>`;
  });
  dayOrder.forEach(day => {
    html += `<div class="heatmap-cell heatmap-cell-label">${day}</div>`;
    sessionBuckets.forEach(session => {
      const stat = matrix[day][session];
      const color = getHeatmapColor(stat.pnl, maxAbs);
      const title = `${day} • ${session}\nP&L: ${formatCurrencyShort(stat.pnl)}\nTrades: ${stat.trades}`;
      html += `
        <div class="heatmap-cell small" style="background:${color};" title="${title}">
          <strong>${stat.trades}</strong>
          <small>${formatCurrencyShort(stat.pnl)}</small>
        </div>
      `;
    });
  });
  grid.innerHTML = html;
}

function renderHourMarketHeatmap(tradesSubset) {
  const grid = document.getElementById('hourMarketHeatmapGrid');
  if (!grid) return;
  const dataset = tradesSubset || getHeatmapFilteredTrades();
  if (dataset.length === 0) {
    grid.innerHTML = `<div class="heatmap-empty" style="grid-column: 1 / -1;">No trades in selected range.</div>`;
    return;
  }
  const marketCounts = {};
  dataset.forEach(trade => {
    const key = trade.market || 'Other';
    marketCounts[key] = (marketCounts[key] || 0) + 1;
  });
  const sortedMarkets = Object.entries(marketCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  const markets = (sortedMarkets.length > 0 ? sortedMarkets : tradeMarkets).slice(0, 4);
  if (!markets.includes('Other')) {
    markets.push('Other');
  }
  const uniqueHours = Array.from(new Set(dataset.map(trade => getEntryHour(trade.entryTime)).filter(hour => hour !== null))).sort((a, b) => a - b);
  const hours = uniqueHours.length > 0 ? uniqueHours : [9, 10, 11, 12, 13, 14, 15];
  const matrix = {};
  hours.forEach(hour => {
    matrix[hour] = {};
    markets.forEach(market => {
      matrix[hour][market] = { pnl: 0, trades: 0 };
    });
  });
  grid.style.gridTemplateColumns = `repeat(${markets.length + 1}, minmax(120px, 1fr))`;
  dataset.forEach(trade => {
    const hour = getEntryHour(trade.entryTime);
    const market = trade.market || 'Other';
    if (hour === null || !matrix[hour]) return;
    const targetMarket = markets.includes(market) ? market : 'Other';
    matrix[hour][targetMarket].pnl += getTradePnlInINR(trade);
    matrix[hour][targetMarket].trades += 1;
  });
  const values = hours.flatMap(hour => markets.map(market => Math.abs(matrix[hour][market].pnl)));
  const maxAbs = Math.max(1, ...values);
  let html = '<div class="heatmap-cell heatmap-cell-header">Hour / Market</div>';
  markets.forEach(market => {
    html += `<div class="heatmap-cell heatmap-cell-header">${market}</div>`;
  });
  hours.forEach(hour => {
    html += `<div class="heatmap-cell heatmap-cell-label">${formatHourDisplay(hour)}</div>`;
    markets.forEach(market => {
      const stat = matrix[hour][market];
      const color = getHeatmapColor(stat.pnl, maxAbs);
      const title = `${formatHourDisplay(hour)} • ${market}\nP&L: ${formatCurrencyShort(stat.pnl)}\nTrades: ${stat.trades}`;
      html += `
        <div class="heatmap-cell small" style="background:${color};" title="${title}">
          <strong>${stat.trades}</strong>
          <small>${formatCurrencyShort(stat.pnl)}</small>
        </div>
      `;
    });
  });
  grid.innerHTML = html;
}

function getSessionBucket(trade) {
  return getSessionLabelForTrade(trade);
}

function getSessionLabelForTrade(trade) {
  const hour = getEntryHour(trade.entryTime);
  const minute = getEntryMinute(trade.entryTime);
  if (hour === null) return GLOBAL_SESSIONS[0]?.label || 'Global Session';
  const totalMinutes = hour * 60 + minute;
  const session = GLOBAL_SESSIONS.find(({ startHour, endHour }) => {
    const start = startHour * 60;
    const end = endHour * 60;
    return totalMinutes >= start && totalMinutes < end;
  }) || GLOBAL_SESSIONS[GLOBAL_SESSIONS.length - 1];
  return session.label;
}

function getEntryHour(timeStr) {
  if (!timeStr) return null;
  const hour = parseInt(timeStr.split(':')[0], 10);
  return isNaN(hour) ? null : hour;
}

function getEntryMinute(timeStr) {
  if (!timeStr) return 0;
  const minute = parseInt(timeStr.split(':')[1], 10);
  return isNaN(minute) ? 0 : minute;
}

function formatHourDisplay(hour) {
  if (hour === null || isNaN(hour)) return 'N/A';
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized}:00 ${suffix}`;
}

function formatHourRange(hour) {
  if (hour === null || isNaN(hour)) return '--';
  const endHour = (hour + 1) % 24;
  return `${formatHourDisplay(hour)} - ${formatHourDisplay(endHour)}`;
}

function formatCurrencyShort(value) {
  if (!isFinite(value)) return formatCurrency(0);

  // Get currency config
  const symbol = getCurrencySymbol();
  const convertedValue = typeof convertAmount === 'function'
    ? convertAmount(value, 'INR')
    : value;

  const absValue = Math.abs(convertedValue);

  // Format based on currency (different scales for different currencies)
  if (currentCurrency === 'INR') {
    if (absValue >= 10000000) return `${symbol}${(convertedValue / 10000000).toFixed(1)}Cr`;
    if (absValue >= 100000) return `${symbol}${(convertedValue / 100000).toFixed(1)}L`;
    if (absValue >= 1000) return `${symbol}${(convertedValue / 1000).toFixed(1)}K`;
  } else if (currentCurrency === 'JPY' || currentCurrency === 'CNY') {
    // No decimal for JPY/CNY
    if (absValue >= 1000000) return `${symbol}${(convertedValue / 1000000).toFixed(1)}M`;
    if (absValue >= 1000) return `${symbol}${(convertedValue / 1000).toFixed(1)}K`;
    return `${symbol}${convertedValue.toFixed(0)}`;
  } else {
    // USD, EUR, GBP, etc.
    if (absValue >= 1000000) return `${symbol}${(convertedValue / 1000000).toFixed(1)}M`;
    if (absValue >= 1000) return `${symbol}${(convertedValue / 1000).toFixed(1)}K`;
  }

  return formatCurrency(value);
}

function getHeatmapColor(value, maxAbs) {
  if (!maxAbs || maxAbs === 0) {
    return 'rgba(148, 163, 184, 0.2)';
  }
  if (value === 0) {
    return 'rgba(251, 191, 36, 0.3)';
  }
  const ratio = Math.min(Math.abs(value) / maxAbs, 1);
  if (value > 0) {
    return interpolateColor([251, 191, 36], [34, 197, 94], ratio);
  }
  return interpolateColor([239, 68, 68], [251, 191, 36], ratio);
}

function interpolateColor(start, end, factor) {
  const clamped = Math.min(Math.max(factor, 0), 1);
  const channel = start.map((val, idx) => Math.round(val + (end[idx] - val) * clamped));
  return `rgba(${channel[0]}, ${channel[1]}, ${channel[2]}, 0.9)`;
}

// Psychology Tab Functions
function renderPsychologyTab() {
  // Calculate emotion metrics
  const emotionCount = {};
  const emotionPnL = {};
  let journalCount = 0;
  let taggedCount = 0;
  const allTags = [];

  trades.forEach(trade => {
    const emotion = trade.emotion || 'neutral';
    emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
    emotionPnL[emotion] = (emotionPnL[emotion] || 0)  + getTradePnlInINR(trade);

    if (trade.notes && trade.notes.trim()) journalCount++;
    if (trade.tags && trade.tags.length > 0) {
      taggedCount++;
      allTags.push(...trade.tags);
    }
  });

  // Find most common emotion
  const topEmotionKey = Object.keys(emotionCount).reduce((a, b) =>
    emotionCount[a] > emotionCount[b] ? a : b, 'neutral'
  );
  const emotionEmoji = {
    'confident': '😊', 'neutral': '😐', 'uncertain': '😟',
    'frustrated': '😤', 'excited': '🤩', 'fearful': '😨', 'greedy': '💰'
  };

  // Find best performing emotion
  const bestEmotionKey = Object.keys(emotionPnL).reduce((a, b) =>
    emotionPnL[a] > emotionPnL[b] ? a : b, 'neutral'
  );

  // Update metrics
  document.getElementById('topEmotion').textContent =
    `${emotionEmoji[topEmotionKey]} ${topEmotionKey.charAt(0).toUpperCase() + topEmotionKey.slice(1)}`;
  document.getElementById('journalCount').textContent = journalCount;
  document.getElementById('taggedCount').textContent = taggedCount;
  document.getElementById('bestEmotion').textContent =
    `${emotionEmoji[bestEmotionKey]} ${bestEmotionKey.charAt(0).toUpperCase() + bestEmotionKey.slice(1)}`;

  // Emotion Performance Chart
  const emotionLabels = Object.keys(emotionPnL);
  const emotionData = emotionLabels.map(e => emotionPnL[e]);
  const emotionChart = document.getElementById('emotionPerformanceChart');

  if (emotionChart.chart) {
    emotionChart.chart.destroy();
  }

  emotionChart.chart = new Chart(emotionChart, {
    type: 'bar',
    data: {
      labels: emotionLabels.map(e => `${emotionEmoji[e]} ${e}`),
      datasets: [{
        label: 'P&L by Emotion',
        data: emotionData,
        backgroundColor: emotionData.map(d => d >= 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'),
        borderColor: emotionData.map(d => d >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `P&L: ${formatCurrency(context.parsed.y)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(148, 163, 184, 0.1)' }
        },
        x: {
          ticks: { color: '#94a3b8' },
          grid: { display: false }
        }
      }
    }
  });

  // Tags Chart
  const tagCounts = {};
  allTags.forEach(tag => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const tagsChart = document.getElementById('tagsChart');
  if (tagsChart.chart) {
    tagsChart.chart.destroy();
  }

  tagsChart.chart = new Chart(tagsChart, {
    type: 'doughnut',
    data: {
      labels: topTags.map(t => t[0]),
      datasets: [{
        data: topTags.map(t => t[1]),
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)', 'rgba(34, 197, 94, 0.6)',
          'rgba(168, 85, 247, 0.6)', 'rgba(251, 191, 36, 0.6)',
          'rgba(239, 68, 68, 0.6)', 'rgba(20, 184, 166, 0.6)',
          'rgba(249, 115, 22, 0.6)', 'rgba(236, 72, 153, 0.6)',
          'rgba(99, 102, 241, 0.6)', 'rgba(14, 165, 233, 0.6)'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: window.innerWidth < 768 ? 'bottom' : 'right',
          labels: { color: '#94a3b8', padding: 15 }
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.parsed} trades`
          }
        }
      }
    }
  });

  // Journal Entries
  const journalContainer = document.getElementById('journalEntries');
  const tradesWithNotes = trades
    .filter(t => t.notes && t.notes.trim())
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (tradesWithNotes.length === 0) {
    journalContainer.innerHTML = '<p style="text-align: center; opacity: 0.6; padding: 40px;">No journal entries yet. Add notes to your trades!</p>';
  } else {
    journalContainer.innerHTML = tradesWithNotes.map(trade => {
      const status = trade.pnl > 0 ? 'Win' : trade.pnl < 0 ? 'Loss' : 'Breakeven';
      const statusClass = trade.pnl > 0 ? 'positive' : trade.pnl < 0 ? 'negative' : '';

      return `
        <div class="metric-card" style="text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
            <div>
              <h3 style="margin: 0; font-size: 18px;">${trade.asset}</h3>
              <p style="margin: 4px 0; opacity: 0.7; font-size: 14px;">
                ${formatDate(trade.date)} • ${trade.strategy} • ${trade.buySell || 'Buy'}
              </p>
            </div>
            <div style="text-align: right;">
              <div class="value ${statusClass}" style="font-size: 20px; margin: 0;">
                ${formatTradeCurrency(trade.pnl, trade)}
              </div>
              <span style="font-size: 14px; opacity: 0.8;">${status}</span>
            </div>
          </div>
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <span style="font-size: 24px;" title="${trade.emotion}">${emotionEmoji[trade.emotion || 'neutral']}</span>
            ${(trade.tags || []).map(tag =>
        `<span style="background: rgba(59,130,246,0.2); color: #60a5fa; padding: 4px 12px; border-radius: 12px; font-size: 12px;">${tag}</span>`
      ).join('')}
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; font-size: 14px; line-height: 1.6;">
            ${trade.notes}
          </div>
        </div>
      `;
    }).join('');
  }
}

// Utility Functions
function parseFlexibleDate(dateStr) {
  if (!dateStr) return null;
  dateStr = String(dateStr).trim();

  const isoDateOnly = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateOnly) {
    return new Date(Number(isoDateOnly[1]), Number(isoDateOnly[2]) - 1, Number(isoDateOnly[3]));
  }
  
  // Try standard parse first
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d;
  }
  
  // Clean separators (replace slashes and dots with hyphens)
  const cleanStr = dateStr.replace(/[\/\.]/g, '-');
  
  // Month string mapping
  const monthNames = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    january: 0, february: 1, march: 2, april: 3, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
  };

  // Try DD-MM-YYYY
  const dmYRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/;
  let match = cleanStr.match(dmYRegex);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    const hour = match[4] ? parseInt(match[4], 10) : 0;
    const min = match[5] ? parseInt(match[5], 10) : 0;
    const sec = match[6] ? parseInt(match[6], 10) : 0;
    
    if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
      d = new Date(year, month, day, hour, min, sec);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // Try DD-MMM-YYYY (e.g. 20-May-2026)
  const dMmyYRegex = /^(\d{1,2})-([A-Za-z]+)-(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/;
  match = cleanStr.match(dMmyYRegex);
  if (match) {
    const day = parseInt(match[1], 10);
    const monthStr = match[2].toLowerCase();
    const year = parseInt(match[3], 10);
    const hour = match[4] ? parseInt(match[4], 10) : 0;
    const min = match[5] ? parseInt(match[5], 10) : 0;
    const sec = match[6] ? parseInt(match[6], 10) : 0;
    
    if (monthNames[monthStr] !== undefined) {
      const month = monthNames[monthStr];
      if (day >= 1 && day <= 31) {
        d = new Date(year, month, day, hour, min, sec);
        if (!isNaN(d.getTime())) return d;
      }
    }
  }

  // Try YYYY-MM-DD
  const YmdRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/;
  match = cleanStr.match(YmdRegex);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const hour = match[4] ? parseInt(match[4], 10) : 0;
    const min = match[5] ? parseInt(match[5], 10) : 0;
    const sec = match[6] ? parseInt(match[6], 10) : 0;
    
    if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
      d = new Date(year, month, day, hour, min, sec);
      if (!isNaN(d.getTime())) return d;
    }
  }
  
  return null;
}

function formatDate(dateStr) {
  const date = parseFlexibleDate(dateStr);
  if (!date) return dateStr || 'Invalid Date';
  return date.toLocaleDateString('en-IN', {
    timeZone: getSelectedTimeZone(),
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// ==================== GREEKS CALCULATION (BLACK-SCHOLES MODEL) ====================

// Standard normal cumulative distribution function
function normCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

// Standard normal probability density function
function normPDF(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// Calculate Greeks using Black-Scholes model
// Calculate Greeks using Black-Scholes model for given parameters (independent of DOM)
function calculateBlackScholesGreeks(strikePrice, underlyingPrice, iv, days, optionType) {
  if (!strikePrice || !underlyingPrice || !iv || !days || !optionType) {
    return null;
  }

  const S = underlyingPrice;  // Underlying price
  const K = strikePrice;      // Strike price
  const T = days / 365;       // Time to expiry in years
  const r = 0.065;            // Risk-free rate (6.5% for India)
  const sigma = iv / 100;     // Implied volatility as decimal

  // Black-Scholes d1 and d2
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  let delta, gamma, theta, vega;

  if (optionType === 'Call') {
    // Call option Greeks
    delta = normCDF(d1);
    gamma = normPDF(d1) / (S * sigma * Math.sqrt(T));
    theta = -(S * normPDF(d1) * sigma) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * normCDF(d2);
    theta = theta / 365; // Daily theta
    vega = S * normPDF(d1) * Math.sqrt(T) / 100; // Vega per 1% change in IV
  } else if (optionType === 'Put') {
    // Put option Greeks
    delta = normCDF(d1) - 1;
    gamma = normPDF(d1) / (S * sigma * Math.sqrt(T));
    theta = -(S * normPDF(d1) * sigma) / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * normCDF(-d2);
    theta = theta / 365; // Daily theta
    vega = S * normPDF(d1) * Math.sqrt(T) / 100; // Vega per 1% change in IV
  } else {
    return null;
  }

  return { delta, gamma, theta, vega };
}

// Calculate Greeks using Black-Scholes model from DOM inputs
function calculateGreeks() {
  const strikePrice = parseFloat(document.getElementById('strikePrice').value);
  const underlyingPrice = parseFloat(document.getElementById('underlyingPrice').value);
  const iv = parseFloat(document.getElementById('impliedVolatility').value);
  const days = parseFloat(document.getElementById('daysToExpiry').value);
  const optionType = document.getElementById('optionType').value;

  const greeks = calculateBlackScholesGreeks(strikePrice, underlyingPrice, iv, days, optionType);

  // Clear display if any required field is missing or calculation fails
  if (!greeks) {
    document.getElementById('deltaValue').textContent = '-';
    document.getElementById('gammaValue').textContent = '-';
    document.getElementById('thetaValue').textContent = '-';
    document.getElementById('vegaValue').textContent = '-';
    return null;
  }

  // Update display with proper formatting
  document.getElementById('deltaValue').textContent = greeks.delta.toFixed(4);
  document.getElementById('gammaValue').textContent = greeks.gamma.toFixed(6);
  document.getElementById('thetaValue').textContent = greeks.theta.toFixed(2);
  document.getElementById('vegaValue').textContent = greeks.vega.toFixed(2);

  // Color code delta (positive green, negative red)
  const deltaEl = document.getElementById('deltaValue');
  deltaEl.style.color = greeks.delta >= 0 ? '#059669' : '#dc2626';
  deltaEl.style.fontWeight = 'bold';

  // Color code theta (always negative, so show in red)
  const thetaEl = document.getElementById('thetaValue');
  thetaEl.style.color = greeks.theta < 0 ? '#dc2626' : '#059669';
  thetaEl.style.fontWeight = 'bold';

  return greeks;
}

// Close modal on outside click
window.onclick = function (event) {
  const modal = document.getElementById('tradeModal');
  const importTypeModal = document.getElementById('importTypeModal');
  const importModal = document.getElementById('importPreviewModal');
  const sampleModal = document.getElementById('sampleDataModal');
  const authModal = document.getElementById('journalAuthModal');
  if (event.target === modal) {
    closeTradeModal();
  } else if (event.target === importTypeModal) {
    closeImportTypeModal();
  } else if (event.target === importModal) {
    closeImportPreviewModal();
  } else if (event.target === sampleModal) {
    closeSampleDataModal();
  } else if (event.target === authModal) {
    closeJournalAuthModal();
  }
};

// Initialize AI Coach
function initializeAICoach() {
  try {
    if (window.aiCoach) {
      if (!document.getElementById('aiCoachPanel')) {
        window.aiCoach.init();
      }
      console.log('✓ AI Coach already available');
      return;
    }
    if (typeof AICoach !== 'undefined') {
      window.aiCoach = new AICoach();
      window.aiCoach.init();
      console.log('✓ AI Coach initialized successfully');
    } else {
      console.warn('AICoach class not found - ai-coach.js may not be loaded');
    }
  } catch (error) {
    console.error('Error initializing AI Coach:', error);
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function () {
  initializeAICoach();
});

// ==================== TRADE IMPORT SYSTEM (CSV, EXCEL, PDF) ====================

let selectedImportType = null;

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${url}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}

function triggerImport() {
  const modal = document.getElementById('importTypeModal');
  if (!modal) {
    chooseImportType('spreadsheet');
    return;
  }
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function closeImportTypeModal() {
  const modal = document.getElementById('importTypeModal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

function chooseImportType(type) {
  selectedImportType = type;
  closeImportTypeModal();

  const input = document.getElementById('importFileInput');
  if (!input) {
    showToast('Import file input not found', 'error');
    return;
  }

  input.value = '';
  input.accept = type === 'pdf' ? '.pdf' : '.csv,.xlsx,.xls';
  input.click();
}

function getBackendImportType(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  if (extension === 'pdf') return 'pdf';
  if (extension === 'xlsx' || extension === 'xls') return 'excel';
  return 'csv';
}

async function parseImportFileOnBackend(file) {
  const formData = new FormData();
  formData.append('file_type', getBackendImportType(file.name));
  formData.append('file', file);

  const response = await fetch(`${getBackendURL()}/api/v2/import-trades`, {
    method: 'POST',
    body: formData
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.detail || `Import failed with status ${response.status}`);
  }

  return Array.isArray(payload?.trades) ? payload.trades : [];
}

async function parseImportFileInBrowser(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  if (extension === 'csv') return parseCSVFile(file);
  if (extension === 'xlsx' || extension === 'xls') return parseExcelFile(file);
  if (extension === 'pdf') return parsePDFFile(file);
  return [];
}

async function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileName = file.name;
  const extension = fileName.split('.').pop().toLowerCase();
  const expectedType = selectedImportType;

  if (expectedType === 'pdf' && extension !== 'pdf') {
    showToast('Please choose a PDF file.', 'error');
    return;
  }
  if (expectedType === 'spreadsheet' && !['csv', 'xlsx', 'xls'].includes(extension)) {
    showToast('Please choose a CSV, XLS, or XLSX file.', 'error');
    return;
  }
  
  showToast(`Uploading ${fileName} for parsing...`, 'success');
  
  try {
    if (!['csv', 'xlsx', 'xls', 'pdf'].includes(extension)) {
      showToast('Unsupported file type. Please upload a CSV, Excel, or PDF file.', 'error');
      return;
    }

    let importedTrades = [];
    try {
      importedTrades = await parseImportFileOnBackend(file);
    } catch (backendError) {
      console.warn('Backend import parser unavailable, falling back to browser parser:', backendError);
      showToast('Backend parser unavailable. Trying local parser...', 'success');
      importedTrades = await parseImportFileInBrowser(file);
    }
    
    if (!importedTrades || importedTrades.length === 0) {
      showToast('No trades found in the file. Please check the file formatting.', 'error');
      return;
    }
    
    showImportPreview(importedTrades);
  } catch (error) {
    console.error('File parsing failed:', error);
    showToast(`Error parsing file: ${error.message}`, 'error');
  }
}

function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = parseCSVText(text);
        if (rows.length < 2) {
          resolve([]);
          return;
        }
        
        const headers = rows[0].map(h => normalizeImportHeader(h));
        const tradesList = [];
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length === 0 || (row.length === 1 && !row[0])) continue;
          
          const rowData = {};
          headers.forEach((header, index) => {
            if (!header) return;
            rowData[header] = row[index] ? row[index].trim() : '';
          });
          
          const trade = mapRowToTrade(rowData);
          if (trade) {
            tradesList.push(trade);
          }
        }
        resolve(tradesList);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('CSV file read error'));
    reader.readAsText(file);
  });
}

function parseCSVText(text) {
  const result = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      row.push(cell);
      result.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  
  if (cell || row.length > 0) {
    row.push(cell);
    result.push(row);
  }
  return result;
}

async function parseExcelFile(file) {
  showToast('Loading Excel processing library...', 'success');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' });
        if (rows.length < 2) {
          resolve([]);
          return;
        }
        
        const headers = rows[0].map(h => normalizeImportHeader(h));
        const tradesList = [];
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;
          
          const rowData = {};
          headers.forEach((header, index) => {
            if (header) {
              rowData[header] = row[index] !== undefined && row[index] !== null ? String(row[index]).trim() : '';
            }
          });
          
          const trade = mapRowToTrade(rowData);
          if (trade) {
            tradesList.push(trade);
          }
        }
        resolve(tradesList);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Excel file read error'));
    reader.readAsArrayBuffer(file);
  });
}

async function parsePDFFile(file) {
  showToast('Loading PDF processing library...', 'success');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js');
  
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let lines = [];
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          const items = textContent.items;
          items.sort((a, b) => {
            if (Math.abs(a.transform[5] - b.transform[5]) < 5) {
              return a.transform[4] - b.transform[4];
            }
            return b.transform[5] - a.transform[5];
          });
          
          let currentLine = '';
          let lastY = null;
          
          for (const item of items) {
            const y = item.transform[5];
            if (lastY === null || Math.abs(y - lastY) < 5) {
              currentLine += ' ' + item.str;
            } else {
              if (currentLine.trim()) {
                lines.push(currentLine.trim());
              }
              currentLine = item.str;
            }
            lastY = y;
          }
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
          }
        }
        
        console.log('Extracted PDF lines:', lines);
        const tradesList = parsePDFLinesToTrades(lines);
        resolve(tradesList);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('PDF file read error'));
    reader.readAsArrayBuffer(file);
  });
}

function parsePDFLinesToTrades(lines) {
  const tradesList = [];
  const dateRegex = /\b(\d{4}[-/.]\d{2}[-/.]\d{2}|\d{2}[-/.]\d{2}[-/.]\d{4}|\d{1,2}\s+[A-Za-z]{3}\s+\d{4})\b/;
  const buySellRegex = /\b(buy|sell|long|short)\b/i;
  
  for (const line of lines) {
    const dateMatch = line.match(dateRegex);
    if (!dateMatch) continue;
    
    const buySellMatch = line.match(buySellRegex);
    if (!buySellMatch) continue;
    
    const cleanLine = line.replace(dateRegex, ' ');
    
    const numberMatches = cleanLine.match(/\b\d+[\d,.]*\b/g);
    if (!numberMatches || numberMatches.length < 3) continue;
    
    const numbers = numberMatches
      .map(n => parseFloat(n.replace(/,/g, '')))
      .filter(n => !isNaN(n));
      
    if (numbers.length < 3) continue;
    
    const words = cleanLine.split(/\s+/).filter(w => {
      const lower = w.toLowerCase();
      return w.length > 1 && 
             !buySellRegex.test(lower) && 
             !/^\d+/.test(w) && 
             !['intraday', 'scalping', 'swing', 'equity', 'futures', 'options', 'commodity', 'forex', 'crypto'].includes(lower);
    });
    
    const asset = words.length > 0 ? words.join(' ') : 'Unknown';
    
    let quantity = numbers[0];
    let entryPrice = numbers[1];
    let exitPrice = numbers[2];
    
    if (quantity <= 0 || entryPrice <= 0 || exitPrice <= 0) continue;
    
    const buySell = buySellMatch[1].toLowerCase();
    const action = buySell.startsWith('b') || buySell.startsWith('l') ? 'Buy' : 'Sell';
    
    let dateVal = dateMatch[1];
    const parsedDate = parseFlexibleDate(dateVal);
    if (parsedDate) {
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsedDate.getDate()).padStart(2, '0');
      dateVal = `${year}-${month}-${day}`;
    }
    
    const pnl = action === 'Buy' ? (exitPrice - entryPrice) * quantity : (entryPrice - exitPrice) * quantity;
    tradesList.push({
      date: dateVal,
      exitDate: dateVal,
      entryTime: '09:15:00',
      exitTime: '15:30:00',
      type: 'Intraday',
      market: 'Equity',
      asset: asset,
      currency: 'INR',
      quantity: quantity,
      entryPrice: entryPrice,
      targetPrice: 0,
      stopLoss: 0,
      exitPrice: exitPrice,
      brokerage: 0,
      strategy: 'Breakout',
      margin: quantity * entryPrice,
      buySell: action,
      pnl: pnl,
      emotion: 'neutral',
      notes: 'Imported from PDF statement',
      tags: ['imported', 'pdf']
    });
  }
  
  return tradesList;
}

function normalizeImportHeader(header) {
  return String(header || '')
    .replace(/^\uFEFF/, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[%₹$€£¥]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function getImportHeaderAliases(keys) {
  const aliases = new Set();
  keys.forEach(key => {
    const normalized = normalizeImportHeader(key);
    if (!normalized) return;
    aliases.add(normalized);
    aliases.add(normalized.replace(/\s+/g, ''));
  });
  return Array.from(aliases);
}

function parseImportedNumber(value) {
  if (value === null || value === undefined || value === '') return NaN;
  if (typeof value === 'number') return value;

  let text = String(value).trim();
  if (!text) return NaN;

  const isNegative = /^\(.*\)$/.test(text) || /\b(dr|debit|loss)\b/i.test(text);
  text = text
    .replace(/[,\s]/g, '')
    .replace(/[₹$€£¥]/g, '')
    .replace(/[()]/g, '')
    .replace(/\b(cr|credit|dr|debit|profit|loss)\b/gi, '');

  const match = text.match(/[-+]?\d*\.?\d+/);
  if (!match) return NaN;

  const number = parseFloat(match[0]);
  if (isNaN(number)) return NaN;
  return isNegative && number > 0 ? -number : number;
}

function formatImportedDate(dateValue) {
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    return formatDateInputValue(dateValue);
  }

  if (typeof dateValue === 'number' && isFinite(dateValue)) {
    // Excel serial dates start at 1899-12-30 in the JS Date epoch conversion.
    const excelDate = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
    if (!isNaN(excelDate.getTime())) return formatDateInputValue(excelDate);
  }

  const parsedDate = parseFlexibleDate(dateValue);
  return parsedDate ? formatDateInputValue(parsedDate) : String(dateValue || '').trim();
}

function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function mapRowToTrade(row) {
  const findValue = (keys) => {
    for (const key of getImportHeaderAliases(keys)) {
      if (row[key] !== undefined && row[key] !== '') {
        return row[key];
      }
    }
    return '';
  };
  
  const dateVal = findValue(['date', 'trade date', 'entry date', 'entry day', 'datetime', 'time', 'date/time', 'order execution time', 'trade execution time']);
  const exitDateVal = findValue(['exit day', 'exit date', 'close date', 'closed date', 'closing date', 'exit datetime', 'exit date/time']);
  const assetVal = findValue(['asset', 'asset/stock', 'stock', 'symbol', 'ticker', 'instrument', 'asset name', 'scrip', 'scrip name', 'security', 'contract']);
  const qtyVal = parseImportedNumber(findValue(['quantity', 'qty', 'qty.', 'volume', 'size', 'shares', 'lots', 'lot size', 'filled qty', 'executed quantity']));
  const entryVal = parseImportedNumber(findValue(['entry price', 'entry', 'buy price', 'price', 'entryprice', 'entry avg price', 'average buy price', 'avg buy price', 'buy avg', 'buy average']));
  let exitVal = parseImportedNumber(findValue(['exit price', 'exit', 'sell price', 'exitprice', 'exit avg price', 'average sell price', 'avg sell price', 'sell avg', 'sell average']));
  const buySellVal = findValue(['buysell', 'buy/sell', 'action', 'type', 'direction', 'b/s']);

  let buySell = 'Buy';
  if (buySellVal) {
    const val = buySellVal.toLowerCase();
    if (val.startsWith('s') || val.includes('short') || val === 'sell') {
      buySell = 'Sell';
    }
  }

  const brokerage = parseImportedNumber(findValue(['brokerage', 'fee', 'fees', 'charges', 'total charges'])) || 0;
  const importedPnl = parseImportedNumber(findValue(['p&l', 'pnl', 'p/l', 'profit loss', 'profit/loss', 'net pnl', 'net p&l', 'realized pnl', 'realised pnl']));
  if (isNaN(exitVal) && !isNaN(importedPnl) && !isNaN(qtyVal) && qtyVal !== 0 && !isNaN(entryVal)) {
    exitVal = buySell === 'Buy'
      ? entryVal + ((importedPnl + brokerage) / qtyVal)
      : entryVal - ((importedPnl + brokerage) / qtyVal);
  }

  if (!dateVal || !assetVal || isNaN(qtyVal) || isNaN(entryVal) || isNaN(exitVal)) {
    return null;
  }

  const dateFormatted = formatImportedDate(dateVal);
  const exitDateFormatted = exitDateVal ? formatImportedDate(exitDateVal) : dateFormatted;

  const type = findValue(['trading type', 'trade type', 'category', 'product', 'product type']) || 'Intraday';
  const market = findValue(['trade market', 'market', 'segment']) || 'Equity';
  const entryTime = findValue(['entry time', 'entrytime']) || '09:15:00';
  const exitTime = findValue(['exit time', 'exittime']) || '15:30:00';
  const strategy = findValue(['trading strategy', 'strategy', 'setup']) || 'Breakout';
  const margin = parseImportedNumber(findValue(['margin', 'capital', 'required capital', 'turnover'])) || (qtyVal * entryVal);
  const targetPrice = parseImportedNumber(findValue(['target price', 'target'])) || 0;
  const stopLoss = parseImportedNumber(findValue(['stop loss', 'sl'])) || 0;
  const notes = findValue(['notes', 'trade notes/journal', 'journal', 'comment', 'description']) || 'Imported from file';
  const emotion = findValue(['emotion', 'emotion/psychology', 'psychology']) || 'neutral';
  const tagsInput = findValue(['tags', 'labels']) || 'imported';
  const tagsArray = typeof tagsInput === 'string' ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : ['imported'];
  const currencyRaw = String(findValue(['currency', 'trade currency', 'ccy']) || 'INR').trim().toUpperCase();
  const currency = typeof CURRENCY_CONFIG === 'object' && CURRENCY_CONFIG[currencyRaw] ? currencyRaw : 'INR';
  
  // Option specific fields
  const strikePriceVal = parseImportedNumber(findValue(['strike price', 'strike', 'strikeprice', 'strike_price']));
  const optionTypeRaw = findValue(['option type', 'optiontype', 'opt type', 'call/put', 'cp', 'option_type']);
  const underlyingPriceVal = parseImportedNumber(findValue(['underlying price', 'underlying', 'underlyingprice', 'spot price', 'spot', 'underlying_price']));
  const ivVal = parseImportedNumber(findValue(['implied volatility', 'iv', 'volatility', 'impliedvolatility', 'implied_volatility', 'vol']));
  const daysToExpiryVal = parseImportedNumber(findValue(['days to expiry', 'days to expiration', 'dte', 'daystoexpiry', 'days_to_expiry']));

  let optionType = null;
  if (optionTypeRaw) {
    const ot = optionTypeRaw.toLowerCase();
    if (ot.startsWith('c') || ot === 'call') {
      optionType = 'Call';
    } else if (ot.startsWith('p') || ot === 'put') {
      optionType = 'Put';
    }
  }

  const strikePrice = !isNaN(strikePriceVal) ? strikePriceVal : null;
  const underlyingPrice = !isNaN(underlyingPriceVal) ? underlyingPriceVal : null;
  const impliedVolatility = !isNaN(ivVal) ? ivVal : null;
  const daysToExpiry = !isNaN(daysToExpiryVal) ? daysToExpiryVal : null;
  
  const pnl = buySell === 'Buy' ? (exitVal - entryVal) * qtyVal - brokerage : (entryVal - exitVal) * qtyVal - brokerage;
  
  const trade = {
    date: dateFormatted,
    exitDate: exitDateFormatted,
    entryTime,
    exitTime,
    type,
    market,
    asset: assetVal,
    currency,
    quantity: qtyVal,
    entryPrice: entryVal,
    targetPrice,
    stopLoss,
    exitPrice: exitVal,
    brokerage,
    strategy,
    margin,
    buySell,
    pnl: pnl,
    emotion: emotion.toLowerCase(),
    notes,
    tags: tagsArray,
    strikePrice,
    optionType,
    underlyingPrice,
    impliedVolatility,
    daysToExpiry
  };

  // Calculate option greeks if all inputs are present
  if (optionType && strikePrice && underlyingPrice && impliedVolatility && daysToExpiry) {
    const greeks = calculateBlackScholesGreeks(strikePrice, underlyingPrice, impliedVolatility, daysToExpiry, optionType);
    if (greeks) {
      trade.greeks = greeks;
    }
  }

  return trade;
}

let pendingImportTrades = [];

function showImportPreview(importedTrades) {
  pendingImportTrades = importedTrades;
  const tbody = document.getElementById('importPreviewTableBody');
  const summaryText = document.getElementById('importSummaryText');
  const modal = document.getElementById('importPreviewModal');
  
  tbody.innerHTML = '';
  
  importedTrades.forEach(trade => {
    let pnl = 0;
    if (trade.buySell === 'Buy') {
      pnl = (trade.exitPrice - trade.entryPrice) * trade.quantity - trade.brokerage;
    } else {
      pnl = (trade.entryPrice - trade.exitPrice) * trade.quantity - trade.brokerage;
    }
    
    const pnlClass = pnl >= 0 ? 'status-win' : 'status-loss';
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${trade.date}</td>
      <td><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: ${trade.buySell === 'Buy' ? '#d1fae5' : '#fee2e2'}; color: ${trade.buySell === 'Buy' ? '#065f46' : '#991b1b'};">${trade.buySell.toUpperCase()}</span></td>
      <td>${trade.type}</td>
      <td>${trade.market}</td>
      <td>${trade.asset}</td>
      <td>${trade.quantity}</td>
      <td>${formatTradeCurrency(trade.entryPrice, trade)}</td>
      <td>${formatTradeCurrency(trade.exitPrice, trade)}</td>
      <td>${formatTradeCurrency(trade.brokerage, trade)}</td>
      <td class="${pnlClass}">${formatTradeCurrency(pnl, trade)}</td>
    `;
    tbody.appendChild(row);
  });
  
  const totalPnL = importedTrades.reduce((sum, trade) => {
    let pnl = 0;
    if (trade.buySell === 'Buy') {
      pnl = (trade.exitPrice - trade.entryPrice) * trade.quantity - trade.brokerage;
    } else {
      pnl = (trade.entryPrice - trade.exitPrice) * trade.quantity - trade.brokerage;
    }
    return sum + convertTradeAmountToINR(pnl, trade);
  }, 0);
  
  summaryText.innerHTML = `Total parsed trades: <span style="color: #111625; font-weight: 700;">${importedTrades.length}</span> | Cumulative Est. P&L: <span class="${totalPnL >= 0 ? 'status-win' : 'status-loss'}" style="font-weight: 700;">${formatCurrency(totalPnL)}</span>`;
  
  document.getElementById('confirmImportBtn').onclick = () => confirmImport();
  
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function closeImportPreviewModal() {
  const modal = document.getElementById('importPreviewModal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  pendingImportTrades = [];
}

function confirmImport() {
  if (pendingImportTrades.length === 0) return;
  
  isSampleDataMode = false;
  trades = trades.concat(pendingImportTrades);
  ensureTradeIds(trades);
  ensureTradeDefaults(trades);
  filteredTrades = [...trades];
  
  saveToDatabase();
  renderTradesTable();
  renderDashboard();
  renderSummaryMetrics();
  updateMonthlyView();
  updateDailyView();
  renderAnalytics();
  renderHourlyAnalysis();
  renderHeatmapsTab();
  updateDatabaseStatus();
  rebuildAssetCategoriesFromTrades();
  refreshStrategyOptionsUI();
  
  const count = pendingImportTrades.length;
  closeImportPreviewModal();
  showToast(`Successfully imported ${count} trades!`, 'success');
}
