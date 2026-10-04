// FundaKaMental API client — Node/TS port of the standalone app's
// `src/lib/api.ts`, rewired onto this app's shared auth + backend.
//
// Differences from the original (features-incoming/fundakamental/src/lib/api.ts):
//  - Auth: uses this app's own `authService.makeAuthenticatedRequest` (Supabase
//    session token, falling back to the localStorage JWT, with 401 handling)
//    instead of the standalone app's own `fetchWithAuth`/Supabase-session logic.
//    `authApi` (login/register/logout/profile/etc.) is dropped entirely — this
//    app already has its own shared auth via AuthContext/authService.
//  - Base URL + paths: every request goes to `${BACKEND_URL}/api/fundakamental/...`
//    (this Express backend's real mount, see services/api/app.ts and
//    services/api/modules/fundakamental/*.routes.ts), not the standalone
//    app's bare `/api/...` against its own FastAPI backend. A few paths also
//    changed shape during the port (e.g. portfolios/watchlists lost a
//    doubled `/portfolios/portfolios` segment, reports lost `/list`) — the
//    route files were read directly rather than assumed; see each module below.
//  - `pdfApi` now targets `reports.controller.ts`'s export endpoints (the
//    standalone app's separate `/api/pdf/*` FastAPI router was folded into
//    this backend's `reports` module) and returns blobs via the same
//    authenticated-request helper instead of hand-rolled fetch+token calls.
//  - Added `alertsApi` (price alerts + notifications) since the backend
//    already exposes `alerts.routes.ts` but the original client never wired
//    it up. Added a handful of other real backend endpoints the original
//    client didn't have yet (screener presets/save/saved, stock refresh,
//    market-data status, indicator chart, bulk signals, MACD, Bollinger
//    Bands, PDF export health) — all present in the routes files.
//  - Dropped `pdfApi.exportTechnicalByTicker`: the standalone app called a
//    `GET /api/pdf/export/technical/:ticker` convenience route that has no
//    equivalent in this backend's `reports.routes.ts` (only the POST
//    body-based `/reports/export/technical` and the generic
//    `/reports/ticker/:ticker/pdf` exist). Use `exportTechnical` instead.

import authService from '../../../services/authService';
import { BACKEND_URL } from '../../../config/env';
import supabase from '../../../supabase';

const API_PREFIX = '/api/fundakamental';

/** Parse an error body the same way across every helper below. */
async function readError(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.message || body?.error || body?.detail || fallback;
}

/** Authenticated JSON request — the workhorse behind every API module here. */
async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}${API_PREFIX}${path}`, options);
  if (!res.ok) {
    throw new Error(await readError(res, 'Request failed'));
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Authenticated request that returns a Blob (PDF export downloads). */
async function requestBlob(path: string, options: RequestInit = {}): Promise<Blob> {
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}${API_PREFIX}${path}`, options);
  if (!res.ok) {
    throw new Error(await readError(res, 'Export failed'));
  }
  return res.blob();
}

/** Unauthenticated JSON request — only for routes with no `authenticate` middleware. */
async function publicRequest<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${API_PREFIX}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) {
    throw new Error(await readError(res, 'Request failed'));
  }
  return res.json();
}

// Mirrors authService.makeAuthenticatedRequest's own token lookup (Supabase
// session first, localStorage fallback) — needed only for the one endpoint
// below (file upload) that can't go through makeAuthenticatedRequest.
async function getAuthToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) return data.session.access_token;
  } catch {
    // ignore, fall back to the stored token
  }
  return localStorage.getItem('auth_token');
}

// ─────────────────────────────────────────────────────────────────────────
// Financial analysis (analysis.routes.ts + reports.routes.ts's CRUD half)
// ─────────────────────────────────────────────────────────────────────────
export const analysisApi = {
  /**
   * POST /fundakamental/analysis/upload — multipart file upload.
   *
   * Deliberately NOT routed through `request()`/`makeAuthenticatedRequest`:
   * that helper sets a default `Content-Type: application/json` header,
   * which breaks multipart uploads (the browser must set its own
   * `multipart/form-data; boundary=...`, which only happens when
   * Content-Type is left unset). So this fetches the token itself, the same
   * way `makeAuthenticatedRequest` does, and calls `fetch` directly with
   * only an `Authorization` header and a `FormData` body.
   */
  uploadFile: async (file: File, company?: string, ticker?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (company) formData.append('company', company);
    if (ticker) formData.append('ticker', ticker);

    const token = await getAuthToken();
    if (!token) throw new Error('No authentication session found');

    const res = await fetch(`${BACKEND_URL}${API_PREFIX}/analysis/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // No Content-Type — the browser sets multipart/form-data + boundary.
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(await readError(res, 'Upload failed'));
    }
    return res.json();
  },

  analyzeFile: async (
    fileId: string | null,
    company: string,
    ticker: string,
    opts?: { investorStyle?: string; horizon?: string; region?: string }
  ) => {
    const data = await request('/analysis/analyze', {
      method: 'POST',
      body: JSON.stringify({
        file_id: fileId,
        company_name: company,
        company_ticker: ticker,
        investor_style: opts?.investorStyle || 'balanced',
        horizon: opts?.horizon || 'long_term',
        region: opts?.region,
      }),
    });

    return {
      reportId: data.report_id,
      status: data.status,
      company,
      ticker,
    };
  },

  getAnalysisStatus: async (analysisId: string) => {
    return await request(`/analysis/status/${analysisId}`);
  },

  getReport: async (reportId: string) => {
    return await request(`/reports/${reportId}`);
  },

  // Real route is `GET /fundakamental/reports` (no `/list` suffix — the
  // standalone app's FastAPI source had one, this Express port doesn't).
  getReportsList: async (limit: number = 20, offset: number = 0) => {
    return await request(`/reports?limit=${limit}&offset=${offset}`);
  },

  deleteReport: async (reportId: string) => {
    return await request(`/reports/${reportId}`, { method: 'DELETE' });
  },

  searchCompany: async (query: string) => {
    const data = await request(`/stocks/search?query=${encodeURIComponent(query)}`);
    // The backend responds with a bare array (stocks.controller.ts searchCompanies).
    return Array.isArray(data) ? data : data?.results || [];
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Stock data, screener & technicals (stocks.routes.ts + technicals.routes.ts)
// ─────────────────────────────────────────────────────────────────────────
export const stockApi = {
  getStockData: async (ticker: string) => {
    return await request(`/stocks/details/${ticker}`);
  },

  screenStocks: async (filters: any) => {
    const data = await request('/stocks/screener', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
    return data.results || [];
  },

  getTechnicalIndicators: async (ticker: string, period: string = '1y', includeSignals: boolean = false) => {
    return await request(`/stocks/${ticker}/technicals?period=${period}&include_signals=${includeSignals}`);
  },

  getTradingSignals: async (ticker: string) => {
    return await request(`/stocks/${ticker}/signals`);
  },

  // --- Added: present on the real backend, not in the original client ---

  getScreeningPresets: async () => {
    return await request('/stocks/screener/presets');
  },

  saveCustomScreen: async (screen: { name: string; filters: any; description?: string }) => {
    return await request('/stocks/screener/save', {
      method: 'POST',
      body: JSON.stringify(screen),
    });
  },

  getSavedScreens: async () => {
    return await request('/stocks/screener/saved');
  },

  refreshStockData: async (ticker: string) => {
    return await request('/stocks/refresh', {
      method: 'POST',
      body: JSON.stringify({ ticker }),
    });
  },

  getMarketDataStatus: async () => {
    return await request('/market-data/status');
  },

  getIndicatorChart: async (ticker: string, indicatorName: string, period: string = '1y') => {
    return await request(`/stocks/${ticker}/indicator/${indicatorName}?period=${period}`);
  },

  getBulkTradingSignals: async (tickers: string[]) => {
    return await request('/stocks/bulk-signals', {
      method: 'POST',
      body: JSON.stringify({ tickers }),
    });
  },

  getMacdData: async (ticker: string, period: string = '1y') => {
    return await request(`/stocks/${ticker}/macd?period=${period}`);
  },

  getBollingerBandsData: async (ticker: string, period: string = '1y') => {
    return await request(`/stocks/${ticker}/bollinger-bands?period=${period}`);
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Chat / Q&A over a report (chat.routes.ts)
// ─────────────────────────────────────────────────────────────────────────
export const chatApi = {
  sendMessage: async (reportId: string, message: string) => {
    const data = await request('/chat/message', {
      method: 'POST',
      body: JSON.stringify({
        report_id: reportId,
        message,
      }),
    });

    return {
      // The backend returns the answer as `content` (chat.controller.ts).
      message: data.content ?? data.response,
      timestamp: data.timestamp || new Date().toISOString(),
      sources: data.sources || [],
    };
  },

  getChatHistory: async (reportId: string) => {
    const data = await request(`/chat/history/${reportId}`);
    return data.messages || [];
  },
};

// ─────────────────────────────────────────────────────────────────────────
// PDF export — folded into reports.routes.ts on this backend (the
// standalone app's separate `/api/pdf/*` FastAPI router doesn't exist here).
// ─────────────────────────────────────────────────────────────────────────
export const pdfApi = {
  exportAnalysis: async (ticker: string, analysisData: any) => {
    return await requestBlob('/reports/export/analysis', {
      method: 'POST',
      body: JSON.stringify({
        ticker,
        analysis_data: analysisData,
      }),
    });
  },

  exportAnalysisByTicker: async (ticker: string) => {
    return await requestBlob(`/reports/ticker/${ticker}/pdf`);
  },

  exportScreening: async (presetName: string, screeningData: any) => {
    return await requestBlob('/reports/export/screening', {
      method: 'POST',
      body: JSON.stringify({
        preset_name: presetName,
        description: screeningData.description,
        stocks: screeningData.stocks,
        filters: screeningData.filters,
        total_matches: screeningData.total_matches,
        average_score: screeningData.average_score,
        top_sectors: screeningData.top_sectors,
      }),
    });
  },

  exportTechnical: async (ticker: string, technicalData: any) => {
    return await requestBlob('/reports/export/technical', {
      method: 'POST',
      body: JSON.stringify({
        ticker,
        technical_data: technicalData,
      }),
    });
  },

  // Added: direct report-id PDF export (real route, no original equivalent).
  exportReportPdf: async (reportId: string) => {
    return await requestBlob(`/reports/${reportId}/pdf`);
  },

  getExportInfo: async () => {
    return await request('/reports/export/info');
  },

  // Added: unauthenticated diagnostic route — matches the Python source and
  // reports.routes.ts's comment ("unauthenticated diagnostic").
  getExportHealth: async () => {
    return await publicRequest('/reports/export/health');
  },
};

// Helper function to download blob as file
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────────────────────────────────────
// Portfolios (portfolios.routes.ts)
//
// Paths lost a doubled segment during the port: the standalone app called
// `/api/portfolios/portfolios...` (its FastAPI router was itself mounted
// under `/portfolios`, containing routes that started with `/portfolios`
// again); this backend's routes are singular: `/fundakamental/portfolios...`.
// ─────────────────────────────────────────────────────────────────────────
export const portfolioApi = {
  // Portfolio CRUD
  createPortfolio: async (data: { name: string; description?: string; currency?: string; is_default?: boolean }) => {
    return await request('/portfolios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPortfolios: async () => {
    return await request('/portfolios');
  },

  getPortfolio: async (portfolioId: string) => {
    return await request(`/portfolios/${portfolioId}`);
  },

  updatePortfolio: async (portfolioId: string, data: { name?: string; description?: string; is_default?: boolean }) => {
    return await request(`/portfolios/${portfolioId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deletePortfolio: async (portfolioId: string) => {
    return await request(`/portfolios/${portfolioId}`, {
      method: 'DELETE',
    });
  },

  // Holdings
  getHoldings: async (portfolioId: string, includePrices: boolean = true) => {
    return await request(`/portfolios/${portfolioId}/holdings?include_prices=${includePrices}`);
  },

  getHolding: async (portfolioId: string, ticker: string) => {
    return await request(`/portfolios/${portfolioId}/holdings/${ticker}`);
  },

  // Direct add/update of a holding — any asset (stock | gold | cash | other)
  addHolding: async (portfolioId: string, holding: {
    asset_type: 'stock' | 'gold' | 'cash' | 'other';
    ticker: string;
    company_name?: string;
    quantity: number;
    avg_cost_basis?: number;
    purchase_date?: string;
    live_ticker?: string;
    manual_price?: number;
    currency?: string;
    notes?: string;
  }) => {
    return await request(`/portfolios/${portfolioId}/holdings`, {
      method: 'POST',
      body: JSON.stringify(holding),
    });
  },

  deleteHolding: async (portfolioId: string, ticker: string) => {
    return await request(`/portfolios/${portfolioId}/holdings/${encodeURIComponent(ticker)}`, {
      method: 'DELETE',
    });
  },

  updateHoldingNotes: async (portfolioId: string, ticker: string, notes: string) => {
    return await request(`/portfolios/${portfolioId}/holdings/${ticker}`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  },

  // Transactions
  addTransaction: async (portfolioId: string, transaction: {
    ticker: string;
    company_name?: string;
    transaction_type: 'BUY' | 'SELL' | 'DIVIDEND' | 'SPLIT';
    quantity: number;
    price_per_share: number;
    fees?: number;
    transaction_date: string;
    notes?: string;
  }) => {
    return await request(`/portfolios/${portfolioId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  },

  getTransactions: async (portfolioId: string, filters?: { ticker?: string; transaction_type?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.ticker) params.append('ticker', filters.ticker);
    if (filters?.transaction_type) params.append('transaction_type', filters.transaction_type);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    return await request(`/portfolios/${portfolioId}/transactions${queryString ? '?' + queryString : ''}`);
  },

  deleteTransaction: async (portfolioId: string, transactionId: string) => {
    return await request(`/portfolios/${portfolioId}/transactions/${transactionId}`, {
      method: 'DELETE',
    });
  },

  // Summary & Analytics
  getSummary: async (portfolioId: string) => {
    return await request(`/portfolios/${portfolioId}/summary`);
  },

  getAnalytics: async (portfolioId: string) => {
    return await request(`/portfolios/${portfolioId}/analytics`);
  },

  getPerformance: async (portfolioId: string, period: 'all_time' | '1y' | '3m' | '1m' | '1w' = 'all_time') => {
    return await request(`/portfolios/${portfolioId}/performance?period=${period}`);
  },

  getRealizedGains: async (portfolioId: string) => {
    return await request(`/portfolios/${portfolioId}/realized-gains`);
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Watchlists (watchlists.routes.ts) — same doubled-segment fix as portfolios.
// ─────────────────────────────────────────────────────────────────────────
export const watchlistApi = {
  // Watchlists CRUD
  getWatchlists: async () => {
    return await request('/watchlists');
  },

  getWatchlist: async (watchlistId: string) => {
    return await request(`/watchlists/${watchlistId}`);
  },

  createWatchlist: async (watchlist: {
    name: string;
    description?: string | null;
    color?: string | null;
    is_default?: boolean;
  }) => {
    return await request('/watchlists', {
      method: 'POST',
      body: JSON.stringify(watchlist),
    });
  },

  updateWatchlist: async (watchlistId: string, updates: {
    name?: string;
    description?: string | null;
    color?: string | null;
    is_default?: boolean;
    sort_order?: number;
  }) => {
    return await request(`/watchlists/${watchlistId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  deleteWatchlist: async (watchlistId: string) => {
    return await request(`/watchlists/${watchlistId}`, {
      method: 'DELETE',
    });
  },

  // Watchlist Items
  getWatchlistItems: async (watchlistId: string, includePrices: boolean = true) => {
    return await request(`/watchlists/${watchlistId}/items?include_prices=${includePrices}`);
  },

  getWatchlistItem: async (watchlistId: string, itemId: string) => {
    return await request(`/watchlists/${watchlistId}/items/${itemId}`);
  },

  addItemToWatchlist: async (watchlistId: string, item: {
    ticker: string;
    company_name?: string | null;
    target_price?: number | null;
    target_price_type?: 'BUY' | 'SELL' | 'ALERT' | null;
    notes?: string | null;
    tags?: string[];
  }) => {
    return await request(`/watchlists/${watchlistId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  updateWatchlistItem: async (watchlistId: string, itemId: string, updates: {
    target_price?: number | null;
    target_price_type?: 'BUY' | 'SELL' | 'ALERT' | null;
    notes?: string | null;
    tags?: string[];
  }) => {
    return await request(`/watchlists/${watchlistId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  removeItemFromWatchlist: async (watchlistId: string, itemId: string) => {
    return await request(`/watchlists/${watchlistId}/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  // Bulk Operations
  addItemsBulk: async (watchlistId: string, tickers: string[]) => {
    const params = new URLSearchParams();
    tickers.forEach(ticker => params.append('tickers', ticker));

    return await request(`/watchlists/${watchlistId}/items/bulk?${params.toString()}`, {
      method: 'POST',
    });
  },

  removeItemsBulk: async (watchlistId: string, tickers: string[]) => {
    const params = new URLSearchParams();
    tickers.forEach(ticker => params.append('tickers', ticker));

    return await request(`/watchlists/${watchlistId}/items?${params.toString()}`, {
      method: 'DELETE',
    });
  },

  // Analytics
  getWatchlistSummary: async (watchlistId: string) => {
    return await request(`/watchlists/${watchlistId}/summary`);
  },

  createSnapshot: async (watchlistId: string) => {
    return await request(`/watchlists/${watchlistId}/snapshot`, {
      method: 'POST',
    });
  },

  getSnapshots: async (watchlistId: string, days: number = 30) => {
    return await request(`/watchlists/${watchlistId}/snapshots?days=${days}`);
  },
};

// ─────────────────────────────────────────────────────────────────────────
// AI token wallet + top-up packs (tokens.routes.ts)
// ─────────────────────────────────────────────────────────────────────────
export const tokenApi = {
  getWallet: async () => {
    return await request('/tokens/wallet');
  },
  // Unauthenticated route (no `authenticate` middleware in tokens.routes.ts).
  getPacks: async () => {
    return await publicRequest('/tokens/packs');
  },
  createOrder: async (packId: string, currency: string, region?: string) => {
    return await request('/tokens/order', {
      method: 'POST',
      body: JSON.stringify({ pack_id: packId, currency, region }),
    });
  },
  verify: async (payload: {
    pack_id: string;
    currency: string;
    region?: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    return await request('/tokens/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Razorpay Pro subscription (razorpay.routes.ts)
// ─────────────────────────────────────────────────────────────────────────
export const razorpayApi = {
  createOrder: async (planId: string, currency: string, region?: string) => {
    return await request('/razorpay/order', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId, currency, region }),
    });
  },
  verify: async (payload: {
    plan_id: string;
    currency: string;
    region?: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    return await request('/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getPlan: async () => {
    return await request('/razorpay/plan');
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Price alerts + notifications (alerts.routes.ts) — added: the backend has
// always had this module, the original client never called it.
// ─────────────────────────────────────────────────────────────────────────
export const alertsApi = {
  createPriceAlert: async (alert: {
    ticker: string;
    target_price: number;
    condition: 'above' | 'below';
    notes?: string;
  }) => {
    return await request('/alerts', {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  },

  getPriceAlerts: async () => {
    return await request('/alerts');
  },

  getAlertsForTicker: async (ticker: string) => {
    return await request(`/alerts/${ticker}`);
  },

  deletePriceAlert: async (alertId: string) => {
    return await request(`/alerts/${alertId}`, { method: 'DELETE' });
  },

  toggleAlert: async (alertId: string) => {
    return await request(`/alerts/${alertId}/toggle`, { method: 'PATCH' });
  },

  getNotifications: async () => {
    return await request('/notifications');
  },

  getUnreadCount: async () => {
    return await request('/notifications/unread-count');
  },

  markNotificationRead: async (notificationId: string) => {
    return await request(`/notifications/${notificationId}/read`, { method: 'PATCH' });
  },

  markAllNotificationsRead: async () => {
    return await request('/notifications/read-all', { method: 'POST' });
  },

  deleteNotification: async (notificationId: string) => {
    return await request(`/notifications/${notificationId}`, { method: 'DELETE' });
  },
};

// Export all APIs
export const api = {
  analysis: analysisApi,
  stocks: stockApi,
  chat: chatApi,
  pdf: pdfApi,
  portfolio: portfolioApi,
  watchlists: watchlistApi,
  razorpay: razorpayApi,
  tokens: tokenApi,
  alerts: alertsApi,
};
