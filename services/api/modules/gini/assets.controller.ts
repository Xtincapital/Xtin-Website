// Gini Assets API — brand-new REST CRUD against `gini_assets` (no legacy
// backend contract to port; the original app synced a client-side JSON
// blob straight to Supabase — see database/migrations/0006's header
// comment and features-incoming/gini/app.js's `networth.saveAsset`/
// `editAsset`/`deleteAsset`, ~lines 3384-3430).
//
// Auth: `req.user.authId` (populated by `authenticate`) equals
// `auth.users.id`, which `gini_assets.user_id` references directly.
//
// Request/response bodies use the same snake_case field names as the DB
// columns 1:1 (name, category, value, return_rate, ownership_type, owner,
// joint_share).
//
// `owner` is a nullable FK to `gini_family_members.id` that doesn't scope by
// user_id on its own — validated against `getFamilyMemberOwnership`
// whenever present, same pattern as gini_goals.assigned_to /
// elderCare/educationPlans' member_id/child_id.
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateAssetCreate, validateAssetUpdate } from "./assets.validator.js";
import {
    getFamilyMemberOwnership,
    insertAsset,
    getAssetsByUser,
    getAssetById,
    updateAsset as updateAssetRepo,
    deleteAsset as deleteAssetRepo,
} from "./assets.repository.js";

/* POST /gini/assets */
export const createAsset = async (req, res) => {
    const validation = validateAssetCreate(req.body);
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

        const { data, error } = await insertAsset({ ...validation.data, user_id: userId });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Failed to create asset" });
        }
        return res.status(HTTP_STATUS.CREATED).json(data[0]);
    } catch (err) {
        console.error("[Gini] create asset failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error creating asset: ${(err as Error)?.message || err}` });
    }
};

/* GET /gini/assets */
export const listAssets = async (req, res) => {
    try {
        const { data, error } = await getAssetsByUser(req.user.authId);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json(data || []);
    } catch (err) {
        console.error("[Gini] list assets failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching assets: ${(err as Error)?.message || err}` });
    }
};

/* GET /gini/assets/:assetId */
export const getAsset = async (req, res) => {
    const { assetId } = req.params;
    try {
        const { data, error } = await getAssetById(assetId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Asset not found" });
        }
        return res.status(HTTP_STATUS.OK).json(data[0]);
    } catch (err) {
        console.error("[Gini] fetch asset failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching asset: ${(err as Error)?.message || err}` });
    }
};

/* PATCH /gini/assets/:assetId */
export const updateAsset = async (req, res) => {
    const { assetId } = req.params;
    const validation = validateAssetUpdate(req.body);
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

        const { data, error } = await updateAssetRepo(assetId, userId, { ...validation.data, updated_at: new Date().toISOString() });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Asset not found" });
        }
        return res.status(HTTP_STATUS.OK).json(data[0]);
    } catch (err) {
        console.error("[Gini] update asset failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error updating asset: ${(err as Error)?.message || err}` });
    }
};

/* DELETE /gini/assets/:assetId */
export const deleteAsset = async (req, res) => {
    const { assetId } = req.params;
    try {
        const { data, error } = await deleteAssetRepo(assetId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Asset not found" });
        }
        return res.status(HTTP_STATUS.OK).json({ success: true, message: "Asset deleted successfully" });
    } catch (err) {
        console.error("[Gini] delete asset failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error deleting asset: ${(err as Error)?.message || err}` });
    }
};
