// Gini Family Members API — brand-new REST CRUD against `gini_family_members`
// (no legacy backend contract to port; the original app synced a client-side
// JSON blob straight to Supabase — see database/migrations/0006's header
// comment and features-incoming/gini/app.js's `familySettings.saveMember`/
// `editMember`/`deleteMember`, ~lines 3097-3160).
//
// Auth: `req.user.authId` (populated by `authenticate`) equals
// `auth.users.id`, which `gini_family_members.user_id` references directly.
//
// Request/response bodies use the same snake_case field names as the DB
// columns 1:1 (name, relationship, age, income, is_earner, is_dependent,
// retirement_age, life_expectancy).
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateFamilyMemberCreate, validateFamilyMemberUpdate } from "./familyMembers.validator.js";
import {
    insertFamilyMember,
    getFamilyMembersByUser,
    getFamilyMemberById,
    updateFamilyMember as updateFamilyMemberRepo,
    deleteFamilyMember as deleteFamilyMemberRepo,
} from "./familyMembers.repository.js";

/* POST /gini/family-members */
export const createFamilyMember = async (req, res) => {
    const validation = validateFamilyMemberCreate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const userId = req.user.authId;

    try {
        const { data, error } = await insertFamilyMember({ ...validation.data, user_id: userId });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Failed to create family member" });
        }
        return res.status(HTTP_STATUS.CREATED).json(data[0]);
    } catch (err) {
        console.error("[Gini] create family member failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error creating family member: ${(err as Error)?.message || err}` });
    }
};

/* GET /gini/family-members */
export const listFamilyMembers = async (req, res) => {
    try {
        const { data, error } = await getFamilyMembersByUser(req.user.authId);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json(data || []);
    } catch (err) {
        console.error("[Gini] list family members failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching family members: ${(err as Error)?.message || err}` });
    }
};

/* GET /gini/family-members/:memberId */
export const getFamilyMember = async (req, res) => {
    const { memberId } = req.params;
    try {
        const { data, error } = await getFamilyMemberById(memberId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Family member not found" });
        }
        return res.status(HTTP_STATUS.OK).json(data[0]);
    } catch (err) {
        console.error("[Gini] fetch family member failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching family member: ${(err as Error)?.message || err}` });
    }
};

/* PATCH /gini/family-members/:memberId */
export const updateFamilyMember = async (req, res) => {
    const { memberId } = req.params;
    const validation = validateFamilyMemberUpdate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    if (Object.keys(validation.data).length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No fields to update" });
    }

    try {
        const { data, error } = await updateFamilyMemberRepo(memberId, req.user.authId, { ...validation.data, updated_at: new Date().toISOString() });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Family member not found" });
        }
        return res.status(HTTP_STATUS.OK).json(data[0]);
    } catch (err) {
        console.error("[Gini] update family member failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error updating family member: ${(err as Error)?.message || err}` });
    }
};

/* DELETE /gini/family-members/:memberId */
export const deleteFamilyMember = async (req, res) => {
    const { memberId } = req.params;
    try {
        const { data, error } = await deleteFamilyMemberRepo(memberId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Family member not found" });
        }
        return res.status(HTTP_STATUS.OK).json({ success: true, message: "Family member deleted successfully" });
    } catch (err) {
        console.error("[Gini] delete family member failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error deleting family member: ${(err as Error)?.message || err}` });
    }
};
