// Gini Liabilities API — brand-new REST CRUD against `gini_liabilities`
// (no legacy backend contract to port; the original app synced a
// client-side JSON blob straight to Supabase — see
// database/migrations/0006's header comment and
// features-incoming/gini/app.js's `networth.saveLiability`/`editLiability`/
// `deleteLiability`, ~lines 3548-3600).
//
// Auth: `req.user.authId` (populated by `authenticate`) equals
// `auth.users.id`, which `gini_liabilities.user_id` references directly.
//
// Request/response bodies use the same snake_case field names as the DB
// columns 1:1 (name, type, amount, rate, emi, tenure, ownership_type,
// owner, joint_share).
//
// `owner` is a nullable FK to `gini_family_members.id` that doesn't scope by
// user_id on its own — validated against `getFamilyMemberOwnership`
// whenever present, same pattern as gini_goals.assigned_to / gini_assets.owner.
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateLiabilityCreate, validateLiabilityUpdate } from "./liabilities.validator.js";
import {
    getFamilyMemberOwnership,
    insertLiability,
    getLiabilitiesByUser,
    getLiabilityById,
    updateLiability as updateLiabilityRepo,
    deleteLiability as deleteLiabilityRepo,
} from "./liabilities.repository.js";

/* POST /gini/liabilities */
export const createLiability = async (req, res) => {
    const validation = validateLiabilityCreate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const userId = req.user.authId;

    try {
        if (validation.data.owner) {
            const { data: memberData, error: memberError } = await getFamilyMemberOwnership(validation.data.owner, userId);
            if (memberError) throw memberError;
            if (!memberData || memberData.length === 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "owner does not reference a family member belonging to this user" });
            }
        }

        const { data, error } = await insertLiability({ ...validation.data, user_id: userId });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Failed to create liability" });
        }
        return res.status(HTTP_STATUS.CREATED).json(data[0]);
    } catch (err) {
        console.error("[Gini] create liability failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error creating liability: ${(err as Error)?.message || err}` });
    }
};

/* GET /gini/liabilities */
export const listLiabilities = async (req, res) => {
    try {
        const { data, error } = await getLiabilitiesByUser(req.user.authId);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json(data || []);
    } catch (err) {
        console.error("[Gini] list liabilities failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching liabilities: ${(err as Error)?.message || err}` });
    }
};

/* GET /gini/liabilities/:liabilityId */
export const getLiability = async (req, res) => {
    const { liabilityId } = req.params;
    try {
        const { data, error } = await getLiabilityById(liabilityId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Liability not found" });
        }
        return res.status(HTTP_STATUS.OK).json(data[0]);
    } catch (err) {
        console.error("[Gini] fetch liability failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching liability: ${(err as Error)?.message || err}` });
    }
};

/* PATCH /gini/liabilities/:liabilityId */
export const updateLiability = async (req, res) => {
    const { liabilityId } = req.params;
    const validation = validateLiabilityUpdate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    if (Object.keys(validation.data).length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No fields to update" });
    }
    const userId = req.user.authId;

    try {
        if (validation.data.owner) {
            const { data: memberData, error: memberError } = await getFamilyMemberOwnership(validation.data.owner, userId);
            if (memberError) throw memberError;
            if (!memberData || memberData.length === 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "owner does not reference a family member belonging to this user" });
            }
        }

        const { data, error } = await updateLiabilityRepo(liabilityId, userId, { ...validation.data, updated_at: new Date().toISOString() });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Liability not found" });
        }
        return res.status(HTTP_STATUS.OK).json(data[0]);
    } catch (err) {
        console.error("[Gini] update liability failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error updating liability: ${(err as Error)?.message || err}` });
    }
};

/* DELETE /gini/liabilities/:liabilityId */
export const deleteLiability = async (req, res) => {
    const { liabilityId } = req.params;
    try {
        const { data, error } = await deleteLiabilityRepo(liabilityId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Liability not found" });
        }
        return res.status(HTTP_STATUS.OK).json({ success: true, message: "Liability deleted successfully" });
    } catch (err) {
        console.error("[Gini] delete liability failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error deleting liability: ${(err as Error)?.message || err}` });
    }
};
