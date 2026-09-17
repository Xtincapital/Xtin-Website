// Journal Goals API — full CRUD against `journal_goals`. The original app
// (app.js's `handleGoalForm`/`deleteGoal`) only ever added or deleted goals
// client-side; this API adds update too since there's no reason a real
// backend shouldn't support editing a goal in place.
//
// Auth: `req.user.authId` equals `auth.users.id`, which `journal_goals.user_id`
// references directly.
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateGoalCreate, validateGoalUpdate } from "./goals.validator.js";
import { insertGoal, getGoalsByUser, getGoalById, updateGoal as updateGoalRepo, deleteGoal as deleteGoalRepo } from "./goals.repository.js";

/* POST /journal/goals */
export const createGoal = async (req, res) => {
    const validation = validateGoalCreate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const userId = req.user.authId;

    try {
        const { data, error } = await insertGoal({ ...validation.data, user_id: userId });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Failed to create goal" });
        }
        return res.status(HTTP_STATUS.CREATED).json(data[0]);
    } catch (err) {
        console.error("[Journal] create goal failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error creating goal: ${(err as Error)?.message || err}` });
    }
};

/* GET /journal/goals */
export const listGoals = async (req, res) => {
    try {
        const { data, error } = await getGoalsByUser(req.user.authId);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json(data || []);
    } catch (err) {
        console.error("[Journal] list goals failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching goals: ${(err as Error)?.message || err}` });
    }
};

/* GET /journal/goals/:goalId */
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
        console.error("[Journal] fetch goal failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching goal: ${(err as Error)?.message || err}` });
    }
};

/* PATCH /journal/goals/:goalId */
export const updateGoal = async (req, res) => {
    const { goalId } = req.params;
    const validation = validateGoalUpdate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    if (Object.keys(validation.data).length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No fields to update" });
    }

    try {
        const { data, error } = await updateGoalRepo(goalId, req.user.authId, { ...validation.data, updated_at: new Date().toISOString() });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Goal not found" });
        }
        return res.status(HTTP_STATUS.OK).json(data[0]);
    } catch (err) {
        console.error("[Journal] update goal failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error updating goal: ${(err as Error)?.message || err}` });
    }
};

/* DELETE /journal/goals/:goalId */
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
        console.error("[Journal] delete goal failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error deleting goal: ${(err as Error)?.message || err}` });
    }
};
