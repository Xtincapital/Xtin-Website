// Gini Education Plans API — brand-new REST CRUD against
// `gini_education_plans` (no legacy backend contract to port; the original
// app synced a client-side JSON blob straight to Supabase — see
// database/migrations/0006's header comment and
// features-incoming/gini/app.js's education-plan `save()` handler, ~line
// 5764).
//
// Auth: `req.user.authId` (populated by `authenticate`) equals
// `auth.users.id`, which `gini_education_plans.user_id` references
// directly.
//
// Request/response bodies use the same snake_case field names as the DB
// columns 1:1 (child_id, milestone, target_year, cost, saved,
// ppf_account), plus one computed, non-persisted field: `years_remaining`.
//
// `years_remaining` design choice: same call as elder care (see
// elderCare.controller.ts's longer comment) — the original computed
// `targetYear - currentYear` client-side at save time and stored it on the
// plan object. There's no column for it here either (it goes stale the
// instant a year passes), so we compute it fresh server-side on every
// read/write instead of persisting it.
//
// `child_id` is a required FK to `gini_family_members.id`, but that FK
// doesn't scope by `user_id` on its own — without an explicit check, a
// user could reference any family member row in the table, not just their
// own. `getFamilyMemberOwnership` is used before every insert/update that
// touches `child_id` to confirm the referenced member actually belongs to
// the authenticated user first.
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateEducationPlanCreate, validateEducationPlanUpdate } from "./educationPlans.validator.js";
import {
    getFamilyMemberOwnership,
    insertEducationPlan,
    getEducationPlansByUser,
    getEducationPlanById,
    updateEducationPlan as updateEducationPlanRepo,
    deleteEducationPlan as deleteEducationPlanRepo,
} from "./educationPlans.repository.js";

const shapeEducationPlan = (row: Record<string, unknown>) => {
    const currentYear = new Date().getFullYear();
    const targetYear = row.target_year as number | null | undefined;
    const yearsRemaining = targetYear != null ? Math.max(0, targetYear - currentYear) : null;
    return { ...row, years_remaining: yearsRemaining };
};

/* POST /gini/education-plans */
export const createEducationPlan = async (req, res) => {
    const validation = validateEducationPlanCreate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const userId = req.user.authId;

    try {
        const { data: childData, error: childError } = await getFamilyMemberOwnership(validation.data.child_id, userId);
        if (childError) throw childError;
        if (!childData || childData.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "child_id does not reference a family member belonging to this user" });
        }

        const { data, error } = await insertEducationPlan({ ...validation.data, user_id: userId });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Failed to create education plan" });
        }
        return res.status(HTTP_STATUS.CREATED).json(shapeEducationPlan(data[0]));
    } catch (err) {
        console.error("[Gini] create education plan failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error creating education plan: ${(err as Error)?.message || err}` });
    }
};

/* GET /gini/education-plans */
export const listEducationPlans = async (req, res) => {
    try {
        const { data, error } = await getEducationPlansByUser(req.user.authId);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json((data || []).map(shapeEducationPlan));
    } catch (err) {
        console.error("[Gini] list education plans failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching education plans: ${(err as Error)?.message || err}` });
    }
};

/* GET /gini/education-plans/:planId */
export const getEducationPlan = async (req, res) => {
    const { planId } = req.params;
    try {
        const { data, error } = await getEducationPlanById(planId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Education plan not found" });
        }
        return res.status(HTTP_STATUS.OK).json(shapeEducationPlan(data[0]));
    } catch (err) {
        console.error("[Gini] fetch education plan failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching education plan: ${(err as Error)?.message || err}` });
    }
};

/* PATCH /gini/education-plans/:planId */
export const updateEducationPlan = async (req, res) => {
    const { planId } = req.params;
    const validation = validateEducationPlanUpdate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    if (Object.keys(validation.data).length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No fields to update" });
    }
    const userId = req.user.authId;

    try {
        if (validation.data.child_id) {
            const { data: childData, error: childError } = await getFamilyMemberOwnership(validation.data.child_id, userId);
            if (childError) throw childError;
            if (!childData || childData.length === 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "child_id does not reference a family member belonging to this user" });
            }
        }

        const { data, error } = await updateEducationPlanRepo(planId, userId, { ...validation.data, updated_at: new Date().toISOString() });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Education plan not found" });
        }
        return res.status(HTTP_STATUS.OK).json(shapeEducationPlan(data[0]));
    } catch (err) {
        console.error("[Gini] update education plan failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error updating education plan: ${(err as Error)?.message || err}` });
    }
};

/* DELETE /gini/education-plans/:planId */
export const deleteEducationPlan = async (req, res) => {
    const { planId } = req.params;
    try {
        const { data, error } = await deleteEducationPlanRepo(planId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Education plan not found" });
        }
        return res.status(HTTP_STATUS.OK).json({ success: true, message: "Education plan deleted successfully" });
    } catch (err) {
        console.error("[Gini] delete education plan failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error deleting education plan: ${(err as Error)?.message || err}` });
    }
};
