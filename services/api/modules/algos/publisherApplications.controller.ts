// AlgoMarket publisher applications. Applicants submit once per algorithm and
// can list their own applications to see the status (pending / under review /
// approved / rejected, plus the reviewer's note). Admins list everything and
// set the status.
import { HTTP_STATUS } from "../../constants/constants.js";
import { validateApplicationCreate, validateApplicationReview } from "./publisherApplications.validator.js";
import { insertApplication, getApplicationsByUser, getAllApplications, updateApplicationStatus } from "./publisherApplications.repository.js";

/* POST /algos/publisher-applications */
export const createApplication = async (req, res) => {
    const validation = validateApplicationCreate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    try {
        const { data, error } = await insertApplication({ ...validation.data, user_id: req.user.authId });
        if (error) throw error;
        return res.status(HTTP_STATUS.CREATED).json(data?.[0]);
    } catch (err) {
        console.error("[Algos] create publisher application failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Could not submit your application. Please try again." });
    }
};

/* GET /algos/publisher-applications — the signed-in user's own applications */
export const listMyApplications = async (req, res) => {
    try {
        const { data, error } = await getApplicationsByUser(req.user.authId);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json(data || []);
    } catch (err) {
        console.error("[Algos] list publisher applications failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Could not load your applications." });
    }
};

/* GET /algos/publisher-applications/all?status= — admin only */
export const listAllApplications = async (req, res) => {
    try {
        const status = typeof req.query?.status === "string" ? req.query.status : undefined;
        const { data, error } = await getAllApplications(status);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json(data || []);
    } catch (err) {
        console.error("[Algos] admin list publisher applications failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Could not load applications." });
    }
};

/* PATCH /algos/publisher-applications/:id — admin only */
export const reviewApplication = async (req, res) => {
    const validation = validateApplicationReview(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    try {
        const now = new Date().toISOString();
        const { data, error } = await updateApplicationStatus(req.params.id, {
            ...validation.data,
            reviewed_at: now,
            updated_at: now,
        });
        if (error) throw error;
        if (!data || data.length === 0) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Application not found" });
        return res.status(HTTP_STATUS.OK).json(data[0]);
    } catch (err) {
        console.error("[Algos] review publisher application failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Could not update the application." });
    }
};
