// Gini Goals API — brand-new REST CRUD against `gini_goals` (no legacy
// backend contract to port; the original app synced a client-side JSON
// blob straight to Supabase — see database/migrations/0006's header
// comment and features-incoming/gini/app.js's goal-form `save()` handler,
// ~lines 3789-3860).
//
// Auth: `req.user.authId` (populated by `authenticate`) equals
// `auth.users.id`, which `gini_goals.user_id` references directly.
//
// Request/response bodies use the same snake_case field names as the DB
// columns 1:1 (name, category, current_cost, target_year, priority,
// inflation, saved, return_rate, assigned_to, funded_by, funding_split).
//
// `assigned_to` is a nullable FK to `gini_family_members.id` that doesn't
// scope by user_id on its own — validated against `getFamilyMemberOwnership`
// whenever present, same pattern as elderCare/educationPlans' required
// member_id/child_id, so a goal can never be assigned to another user's
// family member.
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateGoalCreate, validateGoalUpdate } from "./goals.validator.js";
import {
    getFamilyMemberOwnership,
    insertGoal,
    getGoalsByUser,
    getGoalById,
    updateGoal as updateGoalRepo,
    deleteGoal as deleteGoalRepo,
} from "./goals.repository.js";

/* POST /gini/goals */
export const createGoal = async (req, res) => {
    const validation = validateGoalCreate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const userId = req.user.authId;

    try {
        if (validation.data.assigned_to) {
            const { data: memberData, error: memberError } = await getFamilyMemberOwnership(validation.data.assigned_to, userId);
            if (memberError) throw memberError;
            if (!memberData || memberData.length === 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "assigned_to does not reference a family member belonging to this user" });
            }
        }

        const { data, error } = await insertGoal({ ...validation.data, user_id: userId });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Failed to create goal" });
        }
        return res.status(HTTP_STATUS.CREATED).json(data[0]);
    } catch (err) {
        console.error("[Gini] create goal failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error creating goal: ${(err as Error)?.message || err}` });
    }
};

/* GET /gini/goals */
export const listGoals = async (req, res) => {
    try {
        const { data, error } = await getGoalsByUser(req.user.authId);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json(data || []);
    } catch (err) {
        console.error("[Gini] list goals failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching goals: ${(err as Error)?.message || err}` });
    }
};

/* GET /gini/goals/:goalId */
export const getGoal = async (req, res) => {
    const { goalId } = req.params;
    try {
        const { data, error } = await getGoalById(goalId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Goal not found" });
        }
        return res.status(HTTP_STATUS.OK).json(data[0]);
    } catch (err) {
        console.error("[Gini] fetch goal failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching goal: ${(err as Error)?.message || err}` });
    }
};

/* PATCH /gini/goals/:goalId */
export const updateGoal = async (req, res) => {
    const { goalId } = req.params;
    const validation = validateGoalUpdate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    if (Object.keys(validation.data).length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No fields to update" });
    }
    const userId = req.user.authId;

    try {
        if (validation.data.assigned_to) {
            const { data: memberData, error: memberError } = await getFamilyMemberOwnership(validation.data.assigned_to, userId);
            if (memberError) throw memberError;
            if (!memberData || memberData.length === 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "assigned_to does not reference a family member belonging to this user" });
            }
        }

        const { data, error } = await updateGoalRepo(goalId, userId, { ...validation.data, updated_at: new Date().toISOString() });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Goal not found" });
        }
        return res.status(HTTP_STATUS.OK).json(data[0]);
    } catch (err) {
        console.error("[Gini] update goal failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error updating goal: ${(err as Error)?.message || err}` });
    }
};

/* DELETE /gini/goals/:goalId */
export const deleteGoal = async (req, res) => {
    const { goalId } = req.params;
    try {
        const { data, error } = await deleteGoalRepo(goalId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Goal not found" });
        }
        return res.status(HTTP_STATUS.OK).json({ success: true, message: "Goal deleted successfully" });
    } catch (err) {
        console.error("[Gini] delete goal failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error deleting goal: ${(err as Error)?.message || err}` });
    }
};
