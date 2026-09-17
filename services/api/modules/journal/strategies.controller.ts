// Journal Strategies API — list + create (get-or-create) + delete against
// `journal_strategies`, a deliberately minimal per-user list of custom
// strategy names (see the migration's comment on this table).
//
// app.js's `rememberCustomStrategy(name)` is called every time a trade is
// saved with a strategy name that isn't one of the built-in defaults and
// isn't already in `customStrategies` — it normalizes the name, skips it if
// a case-insensitive match already exists, and otherwise appends it. That's
// a "get-or-create by name" pattern, which `createStrategy` below
// reproduces server-side: creating a strategy that already exists (any
// case) just returns the existing row instead of erroring, so callers
// (including a future "save trade" endpoint) can call this unconditionally.
//
// Auth: `req.user.authId` equals `auth.users.id`, which
// `journal_strategies.user_id` references directly.
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateStrategyCreate } from "./strategies.validator.js";
import { getStrategiesByUser, findStrategyByNameCI, insertStrategy, deleteStrategy as deleteStrategyRepo } from "./strategies.repository.js";

/* GET /journal/strategies */
export const listStrategies = async (req, res) => {
    try {
        const { data, error } = await getStrategiesByUser(req.user.authId);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json(data || []);
    } catch (err) {
        console.error("[Journal] list strategies failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching strategies: ${(err as Error)?.message || err}` });
    }
};

/* POST /journal/strategies — get-or-create by name (case-insensitive). */
export const createStrategy = async (req, res) => {
    const validation = validateStrategyCreate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { name } = validation.data;
    const userId = req.user.authId;

    try {
        const { data: existing, error: existingError } = await findStrategyByNameCI(userId, name);
        if (existingError) throw existingError;
        if (existing && existing.length > 0) {
            return res.status(HTTP_STATUS.OK).json(existing[0]);
        }

        const { data, error } = await insertStrategy({ user_id: userId, name });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Failed to create strategy" });
        }
        return res.status(HTTP_STATUS.CREATED).json(data[0]);
    } catch (err) {
        const message = (err as Error)?.message || String(err);
        // Race-safe fallback: the `unique (user_id, name)` constraint can
        // still fire between the lookup above and this insert.
        if (message.includes("duplicate key value") || message.includes("journal_strategies_user_id_name_key")) {
            const { data: existing } = await findStrategyByNameCI(userId, name);
            if (existing && existing.length > 0) {
                return res.status(HTTP_STATUS.OK).json(existing[0]);
            }
        }
        console.error("[Journal] create strategy failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error creating strategy: ${message}` });
    }
};

/* DELETE /journal/strategies/:strategyId */
export const deleteStrategy = async (req, res) => {
    const { strategyId } = req.params;
    try {
        const { data, error } = await deleteStrategyRepo(strategyId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Strategy not found" });
        }
        return res.status(HTTP_STATUS.OK).json({ success: true, message: "Strategy deleted successfully" });
    } catch (err) {
        console.error("[Journal] delete strategy failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error deleting strategy: ${(err as Error)?.message || err}` });
    }
};
