// Express guard for Fundakamental Pro features (Pro bought directly or via a
// bundle — both set funda_users.plan). The browser hides these for free
// users too, but only this check actually stops them.
import { getUserPlan } from "./razorpay.repository.js";

export const requireFundaPro = async (req, res, next) => {
    try {
        const { data } = await getUserPlan(req.user.authId);
        const pro = data?.plan === "premium" || data?.plan === "enterprise";
        const current = !data?.plan_valid_until || new Date(data.plan_valid_until).getTime() > Date.now();
        if (pro && current) return next();
    } catch (err) {
        console.error("[Fundakamental] plan check failed:", (err as Error)?.message || err);
    }
    return res.status(403).json({ error: "This is part of Fundakamental Pro.", code: "PRO_REQUIRED" });
};
