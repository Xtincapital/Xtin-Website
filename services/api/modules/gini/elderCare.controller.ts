// Gini Elder Care Plans API — brand-new REST CRUD against `gini_elder_care`
// (no legacy backend contract to port; the original app synced a
// client-side JSON blob straight to Supabase — see
// database/migrations/0006's header comment and
// features-incoming/gini/app.js's elder-care `save()` handler, ~line 5658).
//
// Auth: `req.user.authId` (populated by `authenticate`) equals
// `auth.users.id`, which `gini_elder_care.user_id` references directly.
//
// Request/response bodies use the same snake_case field names as the DB
// columns 1:1 (member_id, monthly_support, medical_reserve,
// life_expectancy), plus one computed, non-persisted field:
// `years_remaining`.
//
// `years_remaining` design choice: the original computed
// `lifeExpectancy - member.age` client-side at save time and stored it on
// the plan object. There's no column for it in `gini_elder_care` (by
// design — it's cheaply derivable, not primary data), so instead of
// persisting a value that would go stale whenever the member's age
// changes, we compute it fresh server-side on every read/write and
// include it in the response. The frontend never has to duplicate this
// math or worry about it drifting from the member's current age.
//
// `member_id` is a required FK to `gini_family_members.id`, but that FK
// doesn't scope by `user_id` on its own — without an explicit check, a
// user could reference (and read the derived age of) any family member
// row in the table, not just their own. `getFamilyMemberOwnership` is
// used before every insert/update that touches `member_id` to confirm the
// referenced member actually belongs to the authenticated user first.
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateElderCareCreate, validateElderCareUpdate } from "./elderCare.validator.js";
import {
    getFamilyMemberOwnership,
    insertElderCarePlan,
    getElderCarePlansByUser,
    getElderCarePlanById,
    updateElderCarePlan as updateElderCarePlanRepo,
    deleteElderCarePlan as deleteElderCarePlanRepo,
} from "./elderCare.repository.js";

// Strips the joined `family_member` row and adds the computed
// `years_remaining` field in its place.
const shapeElderCarePlan = (row: Record<string, unknown>) => {
    const { family_member, ...plan } = row;
    const age = (family_member as { age?: number } | null)?.age;
    const yearsRemaining = age != null && plan.life_expectancy != null ? Math.max(0, (plan.life_expectancy as number) - age) : null;
    return { ...plan, years_remaining: yearsRemaining };
};

/* POST /gini/elder-care */
export const createElderCarePlan = async (req, res) => {
    const validation = validateElderCareCreate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const userId = req.user.authId;

    try {
        const { data: memberData, error: memberError } = await getFamilyMemberOwnership(validation.data.member_id, userId);
        if (memberError) throw memberError;
        if (!memberData || memberData.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "member_id does not reference a family member belonging to this user" });
        }

        const { data, error } = await insertElderCarePlan({ ...validation.data, user_id: userId });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Failed to create elder care plan" });
        }
        return res.status(HTTP_STATUS.CREATED).json(shapeElderCarePlan(data[0]));
    } catch (err) {
        console.error("[Gini] create elder care plan failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error creating elder care plan: ${(err as Error)?.message || err}` });
    }
};

/* GET /gini/elder-care */
export const listElderCarePlans = async (req, res) => {
    try {
        const { data, error } = await getElderCarePlansByUser(req.user.authId);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json((data || []).map(shapeElderCarePlan));
    } catch (err) {
        console.error("[Gini] list elder care plans failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching elder care plans: ${(err as Error)?.message || err}` });
    }
};

/* GET /gini/elder-care/:planId */
export const getElderCarePlan = async (req, res) => {
    const { planId } = req.params;
    try {
        const { data, error } = await getElderCarePlanById(planId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Elder care plan not found" });
        }
        return res.status(HTTP_STATUS.OK).json(shapeElderCarePlan(data[0]));
    } catch (err) {
        console.error("[Gini] fetch elder care plan failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching elder care plan: ${(err as Error)?.message || err}` });
    }
};

/* PATCH /gini/elder-care/:planId */
export const updateElderCarePlan = async (req, res) => {
    const { planId } = req.params;
    const validation = validateElderCareUpdate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    if (Object.keys(validation.data).length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No fields to update" });
    }
    const userId = req.user.authId;

    try {
        if (validation.data.member_id) {
            const { data: memberData, error: memberError } = await getFamilyMemberOwnership(validation.data.member_id, userId);
            if (memberError) throw memberError;
            if (!memberData || memberData.length === 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "member_id does not reference a family member belonging to this user" });
            }
        }

        const { data, error } = await updateElderCarePlanRepo(planId, userId, { ...validation.data, updated_at: new Date().toISOString() });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Elder care plan not found" });
        }
        return res.status(HTTP_STATUS.OK).json(shapeElderCarePlan(data[0]));
    } catch (err) {
        console.error("[Gini] update elder care plan failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error updating elder care plan: ${(err as Error)?.message || err}` });
    }
};

/* DELETE /gini/elder-care/:planId */
export const deleteElderCarePlan = async (req, res) => {
    const { planId } = req.params;
    try {
        const { data, error } = await deleteElderCarePlanRepo(planId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Elder care plan not found" });
        }
        return res.status(HTTP_STATUS.OK).json({ success: true, message: "Elder care plan deleted successfully" });
    } catch (err) {
        console.error("[Gini] delete elder care plan failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error deleting elder care plan: ${(err as Error)?.message || err}` });
    }
};
