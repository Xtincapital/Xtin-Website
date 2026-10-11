// Journal Trades API — brand-new REST CRUD against `journal_trades` (no
// legacy backend contract to port; the original app synced a client-side
// JSON blob straight to Supabase — see database/migrations/0005's header
// comment and features-incoming/journal/app.js's `saveTrade()`).
//
// Auth: `req.user.authId` (populated by `authenticate`) equals
// `auth.users.id`, which `journal_trades.user_id` references directly.
//
// Request/response bodies use the same snake_case field names as the DB
// columns 1:1 (date, exit_date, entry_price, strike_price, ...).
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateTradeCreate, validateTradeUpdate, validateTradeListQuery } from "./trades.validator.js";
import { computeTradePnl } from "./importParsers.js";
import { existingTradeKeys, tradeKey } from "./tradeDuplicates.js";
import { insertTrade, getTradesByUser, getTradeById, updateTrade as updateTradeRepo, deleteTrade as deleteTradeRepo, deleteAllTrades } from "./trades.repository.js";

/* POST /journal/trades */
export const createTrade = async (req, res) => {
    const validation = validateTradeCreate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const userId = req.user.authId;

    try {
        // Refuse a trade that's already in the journal, unless the user has
        // confirmed it's a separate trade (`allow_duplicate: true`).
        if (req.body?.allow_duplicate !== true) {
            const existing = await existingTradeKeys(userId, [validation.data]);
            const existingId = existing.get(tradeKey(validation.data));
            if (existingId) {
                const t = validation.data;
                const side = t.buy_sell ? `${t.buy_sell} ` : "";
                const qty = t.quantity != null ? `${t.quantity} ` : "";
                return res.status(HTTP_STATUS.CONFLICT).json({
                    error: `This trade is already in your journal (${side}${qty}${t.asset} on ${t.date} at the same prices${t.entry_time ? " and time" : ""}). If it's a separate trade, add its entry time.`,
                    code: "DUPLICATE_TRADE",
                    existing_id: existingId,
                });
            }
        }

        // A blank P&L is worked out from the prices, the same way CSV import does.
        const trade = { ...validation.data, pnl: validation.data.pnl ?? computeTradePnl(validation.data) };
        const { data, error } = await insertTrade({ ...trade, user_id: userId });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Failed to create trade" });
        }
        return res.status(HTTP_STATUS.CREATED).json(data[0]);
    } catch (err) {
        console.error("[Journal] create trade failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error creating trade: ${(err as Error)?.message || err}` });
    }
};

/* GET /journal/trades?limit=&offset= */
export const listTrades = async (req, res) => {
    const validation = validateTradeListQuery(req.query);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { limit, offset, search, from, to } = validation.data;
    const userId = req.user.authId;

    try {
        const { data, error, count } = await getTradesByUser(userId, limit, offset, { search, from, to });
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json({ data: data || [], pagination: { total: count || 0, limit, offset } });
    } catch (err) {
        console.error("[Journal] list trades failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching trades: ${(err as Error)?.message || err}` });
    }
};

/* GET /journal/trades/:tradeId */
export const getTrade = async (req, res) => {
    const { tradeId } = req.params;
    try {
        const { data, error } = await getTradeById(tradeId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Trade not found" });
        }
        return res.status(HTTP_STATUS.OK).json(data[0]);
    } catch (err) {
        console.error("[Journal] fetch trade failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching trade: ${(err as Error)?.message || err}` });
    }
};

/* PATCH /journal/trades/:tradeId */
export const updateTrade = async (req, res) => {
    const { tradeId } = req.params;
    const validation = validateTradeUpdate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    if (Object.keys(validation.data).length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No fields to update" });
    }

    try {
        const changes = { ...validation.data };
        // Only when this update carries all the prices; a partial edit (say, notes) leaves P&L alone.
        if (changes.pnl == null && changes.quantity != null && changes.entry_price != null && changes.exit_price != null) {
            changes.pnl = computeTradePnl(changes);
        }
        const { data, error } = await updateTradeRepo(tradeId, req.user.authId, { ...changes, updated_at: new Date().toISOString() });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Trade not found" });
        }
        return res.status(HTTP_STATUS.OK).json(data[0]);
    } catch (err) {
        console.error("[Journal] update trade failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error updating trade: ${(err as Error)?.message || err}` });
    }
};

/* DELETE /journal/trades/:tradeId */
export const deleteTrade = async (req, res) => {
    const { tradeId } = req.params;
    try {
        const { data, error } = await deleteTradeRepo(tradeId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Trade not found" });
        }
        return res.status(HTTP_STATUS.OK).json({ success: true, message: "Trade deleted successfully" });
    } catch (err) {
        console.error("[Journal] delete trade failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error deleting trade: ${(err as Error)?.message || err}` });
    }
};

/* DELETE /journal/trades — clears every trade for the user (mirrors app.js's
 * `clearDatabase()`, scoped to trades only; goals/strategies have their own
 * delete endpoints). */
export const clearTrades = async (req, res) => {
    try {
        const { data, error } = await deleteAllTrades(req.user.authId);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json({ success: true, deleted: data ? data.length : 0 });
    } catch (err) {
        console.error("[Journal] clear trades failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error clearing trades: ${(err as Error)?.message || err}` });
    }
};
