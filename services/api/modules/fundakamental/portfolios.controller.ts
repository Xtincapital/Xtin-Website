// Portfolio Tracking API — Node/TS port of `api/endpoints/portfolios.py`.
//
// Auth: `req.user.authId` is the FundaKaMental user id for every query here
// (equals `auth.users.id`, which `funda_portfolios.user_id` references
// directly). See portfolios.repository.ts header comment for the exact
// table mapping.
//
// Live prices: the Python source's `market_data.get_market_data` wrapper
// around `yfinance` is replaced with `getQuote` from `./stockDataService.js`.
import { HTTP_STATUS } from "../../constants/constants.js";
import { getQuote } from "./stockDataService.js";
import { validatePortfolioCreate, validatePortfolioUpdate, validateTransactionCreate, validateHoldingCreate } from "./portfolios.validator.js";
import {
    insertPortfolio,
    getPortfoliosByUser,
    getPortfolioOwnership,
    getPortfolioById,
    updatePortfolio as updatePortfolioRepo,
    deletePortfolio as deletePortfolioRepo,
    insertTransaction,
    getTransactions as getTransactionsRepo,
    getAllTransactionsOrdered,
    deleteTransaction as deleteTransactionRepo,
    getHoldings as getHoldingsRepo,
    upsertHolding,
    getHoldingByTicker,
    deleteHolding as deleteHoldingRepo,
    updateHoldingNotes as updateHoldingNotesRepo,
    getSnapshotsSince,
} from "./portfolios.repository.js";
import { calculatePortfolioMetrics, calculatePerformanceOverTime, calculateRealizedGains, type PortfolioPriceMap } from "./portfolioAnalytics.js";

interface HoldingRow {
    id?: string;
    portfolio_id?: string;
    ticker: string;
    company_name?: string | null;
    asset_type?: string | null;
    quantity: number | string;
    avg_cost_basis: number | string;
    total_cost: number | string;
    manual_price?: number | string | null;
    live_ticker?: string | null;
    currency?: string | null;
    first_purchase_date?: string | null;
    last_transaction_date?: string | null;
    notes?: string | null;
    current_price?: number | null;
    current_value?: number | null;
    gain_loss?: number | null;
    gain_loss_pct?: number | null;
    [key: string]: unknown;
}

/** Fetch live quotes for a set of tickers -> plain ticker -> price map. */
async function fetchPrices(tickers: string[]): Promise<Record<string, number>> {
    const unique = Array.from(new Set(tickers.map((t) => t.toUpperCase())));
    const result: Record<string, number> = {};
    await Promise.all(
        unique.map(async (ticker) => {
            try {
                const quote = await getQuote(ticker);
                if (quote && quote.price !== null && quote.price !== undefined) {
                    result[ticker] = quote.price;
                }
            } catch (err) {
                console.error(`[Fundakamental] quote lookup failed for ${ticker}:`, err);
            }
        }),
    );
    return result;
}

/**
 * Port of `_price_holdings`. Attaches current_price/current_value/gain_loss
 * to each holding, by asset type: stocks/gold priced live (by `live_ticker`
 * or `ticker`), cash values at face amount, other/manually-priced holdings
 * use `manual_price` (falling back to `avg_cost_basis`).
 */
async function priceHoldings(holdings: HoldingRow[]): Promise<HoldingRow[]> {
    const liveSymbols = new Set<string>();
    for (const h of holdings) {
        const atype = h.asset_type || "stock";
        if (atype === "stock" || atype === "gold") {
            const sym = (h.live_ticker || h.ticker || "").toUpperCase();
            if (sym) liveSymbols.add(sym);
        }
    }
    const prices = liveSymbols.size > 0 ? await fetchPrices(Array.from(liveSymbols)) : {};

    for (const h of holdings) {
        const atype = h.asset_type || "stock";
        const qty = Number(h.quantity || 0);
        const cost = Number(h.total_cost || 0);
        let curPrice: number | null = null;

        if (atype === "cash") {
            curPrice = 1.0;
            h.current_value = qty;
        } else if (atype === "other" || (h.manual_price !== null && h.manual_price !== undefined)) {
            curPrice = Number(h.manual_price ?? h.avg_cost_basis ?? 0);
            h.current_value = qty * curPrice;
        } else {
            const sym = (h.live_ticker || h.ticker || "").toUpperCase();
            if (sym in prices) {
                curPrice = prices[sym];
                h.current_value = qty * curPrice;
            }
        }

        h.current_price = curPrice;
        if (h.current_value !== undefined && h.current_value !== null) {
            h.gain_loss = h.current_value - cost;
            h.gain_loss_pct = cost > 0 ? (h.gain_loss / cost) * 100 : 0;
        }
    }

    return holdings;
}

/* ========================================================================
 * PORTFOLIO CRUD
 * ==================================================================== */

/* POST /api/fundakamental/portfolios */
export const createPortfolio = async (req, res) => {
    const validation = validatePortfolioCreate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { name, description, currency, is_default } = validation.data;

    try {
        const { data, error } = await insertPortfolio({
            user_id: req.user.authId,
            name,
            description: description ?? null,
            currency,
            is_default,
        });

        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Failed to create portfolio" });
        }

        return res.status(HTTP_STATUS.CREATED).json(data[0]);
    } catch (err) {
        const message = (err as Error)?.message || String(err);
        if (message.includes("unique_funda_portfolio_name_per_user")) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Portfolio with this name already exists" });
        }
        console.error("[Fundakamental] create portfolio failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error creating portfolio: ${message}` });
    }
};

/* GET /api/fundakamental/portfolios */
export const getPortfolios = async (req, res) => {
    try {
        const { data, error } = await getPortfoliosByUser(req.user.authId);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json(data || []);
    } catch (err) {
        console.error("[Fundakamental] fetch portfolios failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching portfolios: ${(err as Error)?.message || err}` });
    }
};

/* GET /api/fundakamental/portfolios/:portfolioId */
export const getPortfolio = async (req, res) => {
    const { portfolioId } = req.params;
    try {
        const { data, error } = await getPortfolioById(portfolioId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Portfolio not found" });
        }
        return res.status(HTTP_STATUS.OK).json(data[0]);
    } catch (err) {
        console.error("[Fundakamental] fetch portfolio failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching portfolio: ${(err as Error)?.message || err}` });
    }
};

/* PATCH /api/fundakamental/portfolios/:portfolioId */
export const updatePortfolio = async (req, res) => {
    const { portfolioId } = req.params;
    const validation = validatePortfolioUpdate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { name, description, is_default } = validation.data;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (is_default !== undefined) updateData.is_default = is_default;

    if (Object.keys(updateData).length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No fields to update" });
    }

    try {
        const { data, error } = await updatePortfolioRepo(portfolioId, req.user.authId, updateData);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Portfolio not found" });
        }
        return res.status(HTTP_STATUS.OK).json(data[0]);
    } catch (err) {
        console.error("[Fundakamental] update portfolio failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error updating portfolio: ${(err as Error)?.message || err}` });
    }
};

/* DELETE /api/fundakamental/portfolios/:portfolioId */
export const deletePortfolio = async (req, res) => {
    const { portfolioId } = req.params;
    try {
        const { data, error } = await deletePortfolioRepo(portfolioId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Portfolio not found" });
        }
        return res.status(HTTP_STATUS.OK).json({ success: true, message: "Portfolio deleted successfully" });
    } catch (err) {
        console.error("[Fundakamental] delete portfolio failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error deleting portfolio: ${(err as Error)?.message || err}` });
    }
};

/* ========================================================================
 * TRANSACTIONS
 * ==================================================================== */

/* POST /api/fundakamental/portfolios/:portfolioId/transactions */
export const addTransaction = async (req, res) => {
    const { portfolioId } = req.params;
    const validation = validateTransactionCreate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { ticker, company_name, transaction_type, quantity, price_per_share, fees, transaction_date, notes } = validation.data;

    try {
        const { data: ownership, error: ownershipError } = await getPortfolioOwnership(portfolioId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Portfolio not found" });
        }

        const { data, error } = await insertTransaction({
            portfolio_id: portfolioId,
            ticker: ticker.toUpperCase(),
            company_name: company_name ?? null,
            transaction_type,
            quantity,
            price_per_share,
            fees,
            transaction_date: transaction_date.toISOString(),
            notes: notes ?? null,
        });

        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Failed to create transaction" });
        }

        return res.status(HTTP_STATUS.CREATED).json(data[0]);
    } catch (err) {
        console.error("[Fundakamental] add transaction failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error adding transaction: ${(err as Error)?.message || err}` });
    }
};

/* GET /api/fundakamental/portfolios/:portfolioId/transactions?ticker=&transaction_type=&limit= */
export const getTransactions = async (req, res) => {
    const { portfolioId } = req.params;
    const ticker = req.query.ticker ? String(req.query.ticker).toUpperCase() : null;
    const transactionType = req.query.transaction_type ? String(req.query.transaction_type).toUpperCase() : null;
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);

    try {
        const { data: ownership, error: ownershipError } = await getPortfolioOwnership(portfolioId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Portfolio not found" });
        }

        const { data, error } = await getTransactionsRepo(portfolioId, ticker, transactionType, limit);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json(data || []);
    } catch (err) {
        console.error("[Fundakamental] fetch transactions failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching transactions: ${(err as Error)?.message || err}` });
    }
};

/* DELETE /api/fundakamental/portfolios/:portfolioId/transactions/:transactionId */
// Note (matches the Python source): does NOT automatically recalculate holdings.
export const deleteTransaction = async (req, res) => {
    const { portfolioId, transactionId } = req.params;
    try {
        const { data: ownership, error: ownershipError } = await getPortfolioOwnership(portfolioId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Portfolio not found" });
        }

        const { data, error } = await deleteTransactionRepo(portfolioId, transactionId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Transaction not found" });
        }

        return res.status(HTTP_STATUS.OK).json({ success: true, message: "Transaction deleted successfully" });
    } catch (err) {
        console.error("[Fundakamental] delete transaction failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error deleting transaction: ${(err as Error)?.message || err}` });
    }
};

/* ========================================================================
 * HOLDINGS
 * ==================================================================== */

/* GET /api/fundakamental/portfolios/:portfolioId/holdings?include_prices= */
export const getHoldings = async (req, res) => {
    const { portfolioId } = req.params;
    const includePrices = req.query.include_prices !== "false";

    try {
        const { data: ownership, error: ownershipError } = await getPortfolioOwnership(portfolioId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Portfolio not found" });
        }

        const { data, error } = await getHoldingsRepo(portfolioId);
        if (error) throw error;
        let holdings: HoldingRow[] = data || [];

        if (includePrices && holdings.length > 0) {
            holdings = await priceHoldings(holdings);
        }

        return res.status(HTTP_STATUS.OK).json(holdings);
    } catch (err) {
        console.error("[Fundakamental] fetch holdings failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching holdings: ${(err as Error)?.message || err}` });
    }
};

/* POST /api/fundakamental/portfolios/:portfolioId/holdings */
// The "log my current portfolio" flow — add/update a holding directly for
// any asset (stock, gold, cash, other), no buy/sell transaction needed.
export const addHolding = async (req, res) => {
    const { portfolioId } = req.params;
    const validation = validateHoldingCreate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { asset_type, ticker, company_name, quantity, avg_cost_basis, purchase_date, live_ticker, manual_price, currency, notes } = validation.data;

    try {
        const { data: ownership, error: ownershipError } = await getPortfolioOwnership(portfolioId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Portfolio not found" });
        }

        const tickerUpper = (ticker || asset_type).toUpperCase();
        const row: Record<string, unknown> = {
            portfolio_id: portfolioId,
            ticker: tickerUpper,
            company_name: company_name || ticker,
            asset_type,
            quantity,
            avg_cost_basis: asset_type !== "cash" ? avg_cost_basis : 1,
            live_ticker: live_ticker ?? null,
            manual_price: manual_price ?? null,
            currency: currency || "INR",
            notes: notes ?? null,
        };
        if (purchase_date) row.first_purchase_date = purchase_date.toISOString();

        const { data, error } = await upsertHolding(row);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Failed to add holding" });
        }

        const priced = await priceHoldings([data[0] as HoldingRow]);
        return res.status(HTTP_STATUS.CREATED).json(priced[0]);
    } catch (err) {
        console.error("[Fundakamental] add holding failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error adding holding: ${(err as Error)?.message || err}` });
    }
};

/* DELETE /api/fundakamental/portfolios/:portfolioId/holdings/:ticker */
export const deleteHolding = async (req, res) => {
    const { portfolioId, ticker } = req.params;
    try {
        const { data: ownership, error: ownershipError } = await getPortfolioOwnership(portfolioId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Portfolio not found" });
        }

        const { error } = await deleteHoldingRepo(portfolioId, String(ticker).toUpperCase());
        if (error) throw error;

        return res.status(HTTP_STATUS.OK).json({ message: "Holding removed" });
    } catch (err) {
        console.error("[Fundakamental] delete holding failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error removing holding: ${(err as Error)?.message || err}` });
    }
};

/* GET /api/fundakamental/portfolios/:portfolioId/holdings/:ticker */
export const getHolding = async (req, res) => {
    const { portfolioId, ticker } = req.params;
    try {
        const { data: ownership, error: ownershipError } = await getPortfolioOwnership(portfolioId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Portfolio not found" });
        }

        const { data, error } = await getHoldingByTicker(portfolioId, String(ticker).toUpperCase());
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Holding not found" });
        }

        const [priced] = await priceHoldings([data[0] as HoldingRow]);
        return res.status(HTTP_STATUS.OK).json(priced);
    } catch (err) {
        console.error("[Fundakamental] fetch holding failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching holding: ${(err as Error)?.message || err}` });
    }
};

/* PATCH /api/fundakamental/portfolios/:portfolioId/holdings/:ticker */
// The Python source binds `notes: str` as a plain (query) parameter — this
// port accepts it from the JSON body first, falling back to the query
// string for parity.
export const updateHoldingNotes = async (req, res) => {
    const { portfolioId, ticker } = req.params;
    const notes = req.body?.notes !== undefined ? req.body.notes : req.query.notes;

    if (notes === undefined || notes === null) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "notes is required" });
    }

    try {
        const { data: ownership, error: ownershipError } = await getPortfolioOwnership(portfolioId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Portfolio not found" });
        }

        const { data, error } = await updateHoldingNotesRepo(portfolioId, String(ticker).toUpperCase(), String(notes));
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Holding not found" });
        }

        return res.status(HTTP_STATUS.OK).json({ success: true, message: "Notes updated successfully" });
    } catch (err) {
        console.error("[Fundakamental] update holding notes failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error updating holding: ${(err as Error)?.message || err}` });
    }
};

/* ========================================================================
 * PORTFOLIO SUMMARY & ANALYTICS
 * ==================================================================== */

/* GET /api/fundakamental/portfolios/:portfolioId/summary */
export const getPortfolioSummary = async (req, res) => {
    const { portfolioId } = req.params;

    try {
        const { data: ownership, error: ownershipError } = await getPortfolioOwnership(portfolioId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Portfolio not found" });
        }

        const { data: holdingsData, error: holdingsError } = await getHoldingsRepo(portfolioId);
        if (holdingsError) throw holdingsError;
        let holdings: HoldingRow[] = holdingsData || [];

        if (holdings.length === 0) {
            return res.status(HTTP_STATUS.OK).json({
                portfolio_id: portfolioId,
                total_value: 0,
                total_cost: 0,
                total_gain_loss: 0,
                gain_loss_pct: 0,
                num_holdings: 0,
            });
        }

        holdings = await priceHoldings(holdings);

        let totalValue = 0.0;
        let totalCost = 0.0;
        let bestPerformer: { ticker: string; gain_loss_pct: number } | null = null;
        let worstPerformer: { ticker: string; gain_loss_pct: number } | null = null;
        let bestPct = -Infinity;
        let worstPct = Infinity;
        const alloc: Record<string, number> = {};
        let earliest: Date | null = null;

        for (const h of holdings) {
            const cost = Number(h.total_cost || 0);
            const value = h.current_value !== undefined && h.current_value !== null ? Number(h.current_value) : cost;
            totalCost += cost;
            totalValue += value;
            const atype = h.asset_type || "stock";
            alloc[atype] = (alloc[atype] || 0) + value;

            const glp = h.gain_loss_pct;
            if (glp !== undefined && glp !== null && atype !== "cash") {
                if (glp > bestPct) {
                    bestPct = glp;
                    bestPerformer = { ticker: h.ticker, gain_loss_pct: Math.round(glp * 100) / 100 };
                }
                if (glp < worstPct) {
                    worstPct = glp;
                    worstPerformer = { ticker: h.ticker, gain_loss_pct: Math.round(glp * 100) / 100 };
                }
            }

            if (h.first_purchase_date) {
                const dt = new Date(h.first_purchase_date);
                if (!Number.isNaN(dt.getTime()) && (earliest === null || dt < earliest)) {
                    earliest = dt;
                }
            }
        }

        const totalGainLoss = totalValue - totalCost;
        const gainLossPct = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

        // CAGR = (value/cost)^(1/years) - 1, from the earliest purchase date.
        let cagr: number | null = null;
        let years: number | null = null;
        if (earliest && totalCost > 0 && totalValue > 0) {
            years = Math.max((Date.now() - earliest.getTime()) / (1000 * 60 * 60 * 24 * 365.25), 0.0);
            if (years >= 0.08) {
                // ~1 month minimum, else CAGR is meaningless
                cagr = (Math.pow(totalValue / totalCost, 1 / years) - 1) * 100;
            }
        }

        const allocation = Object.entries(alloc)
            .sort((a, b) => b[1] - a[1])
            .map(([assetType, v]) => ({
                asset_type: assetType,
                value: Math.round(v * 100) / 100,
                pct: Math.round((totalValue ? (v / totalValue) * 100 : 0) * 10) / 10,
            }));

        return res.status(HTTP_STATUS.OK).json({
            portfolio_id: portfolioId,
            total_value: Math.round(totalValue * 100) / 100,
            total_cost: Math.round(totalCost * 100) / 100,
            total_gain_loss: Math.round(totalGainLoss * 100) / 100,
            gain_loss_pct: Math.round(gainLossPct * 100) / 100,
            cagr: cagr !== null ? Math.round(cagr * 100) / 100 : null,
            holding_period_years: years !== null ? Math.round(years * 100) / 100 : null,
            num_holdings: holdings.length,
            allocation,
            best_performer: bestPerformer,
            worst_performer: worstPerformer,
        });
    } catch (err) {
        console.error("[Fundakamental] portfolio summary failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error calculating summary: ${(err as Error)?.message || err}` });
    }
};

/* GET /api/fundakamental/portfolios/:portfolioId/analytics */
export const getPortfolioAnalytics = async (req, res) => {
    const { portfolioId } = req.params;

    try {
        const { data: ownership, error: ownershipError } = await getPortfolioOwnership(portfolioId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Portfolio not found" });
        }

        const { data: holdingsData, error: holdingsError } = await getHoldingsRepo(portfolioId);
        if (holdingsError) throw holdingsError;
        const holdings: HoldingRow[] = holdingsData || [];

        if (holdings.length === 0) {
            return res.status(HTTP_STATUS.OK).json({
                portfolio_id: portfolioId,
                summary: { total_value: 0, total_cost: 0, gain_loss: 0, gain_loss_pct: 0 },
                sector_allocation: [],
                position_sizes: [],
                diversification: { score: 0, num_holdings: 0, concentration_risk: "High", largest_position_pct: 0 },
                best_performer: null,
                worst_performer: null,
            });
        }

        const priceMap = await fetchPrices(holdings.map((h) => h.ticker));
        const analyticsPrices: PortfolioPriceMap = {};
        for (const [ticker, price] of Object.entries(priceMap)) analyticsPrices[ticker] = { price };

        const metrics = await calculatePortfolioMetrics(holdings, analyticsPrices);

        return res.status(HTTP_STATUS.OK).json({ portfolio_id: portfolioId, ...metrics });
    } catch (err) {
        console.error("[Fundakamental] portfolio analytics failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error calculating analytics: ${(err as Error)?.message || err}` });
    }
};

/* GET /api/fundakamental/portfolios/:portfolioId/performance?period=all_time|1y|3m|1m|1w */
export const getPortfolioPerformance = async (req, res) => {
    const { portfolioId } = req.params;
    const period = ["all_time", "1y", "3m", "1m", "1w"].includes(String(req.query.period)) ? String(req.query.period) : "all_time";

    try {
        const { data: ownership, error: ownershipError } = await getPortfolioOwnership(portfolioId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Portfolio not found" });
        }

        const endDate = new Date();
        let startDate: Date;
        switch (period) {
            case "1w":
                startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "1m":
                startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case "3m":
                startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case "1y":
                startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(Date.UTC(2000, 0, 1));
        }

        const { data, error } = await getSnapshotsSince(portfolioId, startDate.toISOString().slice(0, 10));
        if (error) throw error;

        const performance = { ...calculatePerformanceOverTime(data || []), period };

        return res.status(HTTP_STATUS.OK).json(performance);
    } catch (err) {
        console.error("[Fundakamental] portfolio performance failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error calculating performance: ${(err as Error)?.message || err}` });
    }
};

/* GET /api/fundakamental/portfolios/:portfolioId/realized-gains */
export const getRealizedGains = async (req, res) => {
    const { portfolioId } = req.params;

    try {
        const { data: ownership, error: ownershipError } = await getPortfolioOwnership(portfolioId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Portfolio not found" });
        }

        const { data, error } = await getAllTransactionsOrdered(portfolioId);
        if (error) throw error;

        const realized = calculateRealizedGains(data || []);
        return res.status(HTTP_STATUS.OK).json({ portfolio_id: portfolioId, ...realized });
    } catch (err) {
        console.error("[Fundakamental] realized gains failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error calculating realized gains: ${(err as Error)?.message || err}` });
    }
};
