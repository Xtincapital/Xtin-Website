// Gini Tax Optimization API — get-or-create-style GET/PUT against
// `gini_tax_optimization`, not list-style CRUD, since it's exactly one
// settings row per user (`user_id` is the primary key) — mirrors
// `appState.taxOptimization`'s shape in the original (a settings object,
// not a collection; see features-incoming/gini/app.js ~line 1704).
//
// Auth: `req.user.authId` (populated by `authenticate`) equals
// `auth.users.id`, which `gini_tax_optimization.user_id` references
// directly (and is itself the primary key, one row per user).
//
// Request/response bodies use the same snake_case field names as the DB
// columns 1:1 (deductions_80c, deductions_80d, deductions_80e,
// huf_benefits).
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateTaxOptimizationUpsert } from "./taxOptimization.validator.js";
import { getTaxOptimizationByUser, insertDefaultTaxOptimization, upsertTaxOptimization } from "./taxOptimization.repository.js";

/* GET /gini/tax-optimization — get-or-create: returns the user's row,
 * creating a default one (all jsonb columns '{}', huf_benefits false) the
 * first time a user has none. */
export const getTaxOptimization = async (req, res) => {
    const userId = req.user.authId;
    try {
        const { data, error } = await getTaxOptimizationByUser(userId);
        if (error) throw error;
        if (data && data.length > 0) {
            return res.status(HTTP_STATUS.OK).json(data[0]);
        }

        const { data: created, error: createError } = await insertDefaultTaxOptimization(userId);
        if (createError) throw createError;
        if (!created || created.length === 0) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to initialize tax optimization settings" });
        }
        return res.status(HTTP_STATUS.OK).json(created[0]);
    } catch (err) {
        console.error("[Gini] fetch tax optimization failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching tax optimization: ${(err as Error)?.message || err}` });
    }
};

/* PUT /gini/tax-optimization — upserts the user's row: creates it if
 * missing (DB defaults fill any field not sent), or merges the given
 * fields into the existing row otherwise. */
export const updateTaxOptimization = async (req, res) => {
    const validation = validateTaxOptimizationUpsert(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const userId = req.user.authId;

    try {
        const { data, error } = await upsertTaxOptimization(userId, validation.data);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Failed to save tax optimization settings" });
        }
        return res.status(HTTP_STATUS.OK).json(data[0]);
    } catch (err) {
        console.error("[Gini] update tax optimization failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error updating tax optimization: ${(err as Error)?.message || err}` });
    }
};
