// Coupon endpoints.
//   Members (signed in):
//     POST /api/coupons/preview   { code, product, amount, currency } — what a code does at checkout
//     POST /api/coupons/redeem    { code }                            — redeem a free-access code
//   Admins (requireAdmin):
//     GET    /api/admin/coupons                 — all codes with usage counts
//     GET    /api/admin/coupons/catalog         — products / free plans a code can target
//     POST   /api/admin/coupons                 — create
//     PATCH  /api/admin/coupons/:id             — edit limits, dates, on/off
//     DELETE /api/admin/coupons/:id             — only codes nobody has used
//     GET    /api/admin/coupons/:id/redemptions — who used it
import { Router } from "express";
import { authenticate, requireAdmin } from "../../middlewares/auth.js";
import { FulfillmentError } from "../payments/fulfillment.js";
import { COUPON_PRODUCTS, COUPON_PRODUCT_KEYS, FREE_ACCESS_PLANS, findFreeAccessPlan, missingLimits } from "./coupons.catalog.js";
import { deleteCoupon, findCouponById, insertCoupon, listCoupons, listRedemptions, updateCoupon, type CouponRow } from "./coupons.repository.js";
import { normalizeCode, previewCoupon, redeemFreeAccess, sendCouponError } from "./coupons.service.js";

const CODE = /^[A-Z0-9_-]{3,32}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const optionalDate = (v: unknown, field: string) => {
    if (v === undefined || v === null || v === "") return null;
    const d = new Date(String(v));
    if (Number.isNaN(d.getTime())) throw new Error(`${field} is not a valid date`);
    return d.toISOString();
};

const optionalPositiveInt = (v: unknown, field: string) => {
    if (v === undefined || v === null || v === "") return null;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1) throw new Error(`${field} must be a whole number of 1 or more`);
    return n;
};

/** Validates an admin's create request into a coupons row. Throws Error with a message for the form. */
export function parseNewCoupon(body: Record<string, unknown>, adminEmail: string): Partial<CouponRow> {
    const code = normalizeCode(body.code);
    if (!CODE.test(code)) throw new Error("Code must be 3–32 letters, numbers, - or _ (no spaces)");
    const kind = body.kind === "free_access" ? "free_access" : body.kind === "discount" ? "discount" : null;
    if (!kind) throw new Error("Choose a coupon type");

    const row: Partial<CouponRow> = {
        code,
        kind,
        description: String(body.description || "").trim().slice(0, 300) || null,
        audience: (["everyone", "new_customers", "members"].includes(String(body.audience)) ? body.audience : "everyone") as CouponRow["audience"],
        max_redemptions: optionalPositiveInt(body.max_redemptions, "Total uses"),
        per_user_limit: optionalPositiveInt(body.per_user_limit, "Uses per person") || 1,
        starts_at: optionalDate(body.starts_at, "Start date"),
        expires_at: optionalDate(body.expires_at, "End date"),
        active: body.active === undefined ? true : Boolean(body.active),
        created_by: adminEmail,
        products: [],
        percent_off: null,
        amount_off_paise: null,
        free_product: null,
        free_plan: null,
    };
    if (row.starts_at && row.expires_at && row.expires_at <= row.starts_at) throw new Error("End date must be after the start date");

    if (kind === "discount") {
        const percent = body.percent_off === undefined || body.percent_off === "" || body.percent_off === null ? null : Number(body.percent_off);
        const rupees = body.amount_off === undefined || body.amount_off === "" || body.amount_off === null ? null : Number(body.amount_off);
        if ((percent === null) === (rupees === null)) throw new Error("Give either a % off or a ₹ amount off");
        if (percent !== null) {
            if (!Number.isInteger(percent) || percent < 1 || percent > 100) throw new Error("% off must be a whole number from 1 to 100");
            row.percent_off = percent;
        } else {
            if (!Number.isFinite(rupees) || (rupees as number) <= 0) throw new Error("₹ off must be more than 0");
            row.amount_off_paise = Math.round((rupees as number) * 100);
        }
        const products = Array.isArray(body.products) ? body.products.map(String) : [];
        const unknown = products.filter((p) => !COUPON_PRODUCT_KEYS.has(p));
        if (unknown.length) throw new Error(`Unknown product: ${unknown.join(", ")}`);
        row.products = Array.from(new Set(products));
    } else {
        const plan = findFreeAccessPlan(String(body.free_product || ""), String(body.free_plan || ""));
        if (!plan) throw new Error("Choose what the free code unlocks");
        row.free_product = plan.product;
        row.free_plan = plan.plan;
    }
    const limits = missingLimits(row);
    if (limits) throw new Error(limits);
    return row;
}

/** Fields an admin may change after creation (the code and what it gives stay fixed once people may have it). */
export function parseCouponPatch(body: Record<string, unknown>): Partial<CouponRow> {
    const patch: Partial<CouponRow> = {};
    if ("active" in body) patch.active = Boolean(body.active);
    if ("description" in body) patch.description = String(body.description || "").trim().slice(0, 300) || null;
    if ("max_redemptions" in body) patch.max_redemptions = optionalPositiveInt(body.max_redemptions, "Total uses");
    if ("per_user_limit" in body) patch.per_user_limit = optionalPositiveInt(body.per_user_limit, "Uses per person") || 1;
    if ("starts_at" in body) patch.starts_at = optionalDate(body.starts_at, "Start date");
    if ("expires_at" in body) patch.expires_at = optionalDate(body.expires_at, "End date");
    if (!Object.keys(patch).length) throw new Error("Nothing to update");
    return patch;
}

const fail = (res, status: number, error: string) => res.status(status).json({ error });

const router = Router();

router.post("/coupons/preview", authenticate, async (req: any, res) => {
    try {
        const { code, product, amount, currency } = req.body || {};
        if (!COUPON_PRODUCT_KEYS.has(String(product))) return fail(res, 400, "Unknown product");
        const preview = await previewCoupon({ rawCode: code, product: String(product), amount: Number(amount) || 0, currency: String(currency || "INR").toUpperCase(), user: req.user });
        return res.json({ coupon: preview });
    } catch (err) {
        if (sendCouponError(res, err)) return;
        console.error("[Coupons] preview failed:", (err as Error)?.message || err);
        return fail(res, 500, "Couldn't check that code — please try again");
    }
});

router.post("/coupons/redeem", authenticate, async (req: any, res) => {
    try {
        const redeemed = await redeemFreeAccess(req.body?.code, req.user);
        return res.json({ success: true, order_id: redeemed.orderId, label: redeemed.label, product: redeemed.product });
    } catch (err) {
        if (sendCouponError(res, err)) return;
        if (err instanceof FulfillmentError) return fail(res, err.status, err.message);
        console.error("[Coupons] redeem failed:", (err as Error)?.message || err);
        return fail(res, 500, "Couldn't redeem that code — please try again");
    }
});

router.get("/admin/coupons/catalog", authenticate, requireAdmin, (_req: any, res) => {
    res.json({ products: COUPON_PRODUCTS, free_plans: FREE_ACCESS_PLANS.map(({ product, plan, label, needsLimits }) => ({ product, plan, label, needs_limits: Boolean(needsLimits) })) });
});

router.get("/admin/coupons", authenticate, requireAdmin, async (_req: any, res) => {
    try {
        return res.json({ coupons: await listCoupons() });
    } catch (err) {
        console.error("[Coupons] list failed:", (err as Error)?.message || err);
        return fail(res, 500, "Couldn't load coupons — has database/migrations/0016_coupons.sql been run?");
    }
});

router.post("/admin/coupons", authenticate, requireAdmin, async (req: any, res) => {
    let row: Partial<CouponRow>;
    try {
        row = parseNewCoupon(req.body || {}, String(req.user.email || ""));
    } catch (err) {
        return fail(res, 400, (err as Error).message);
    }
    try {
        return res.status(201).json({ coupon: await insertCoupon(row) });
    } catch (err) {
        if ((err as { code?: string })?.code === "23505") return fail(res, 409, `A coupon called ${row.code} already exists`);
        console.error("[Coupons] create failed:", (err as Error)?.message || err);
        return fail(res, 500, "Couldn't create the coupon");
    }
});

router.patch("/admin/coupons/:id", authenticate, requireAdmin, async (req: any, res) => {
    if (!UUID.test(req.params.id)) return fail(res, 400, "Invalid coupon id");
    let patch: Partial<CouponRow>;
    try {
        patch = parseCouponPatch(req.body || {});
    } catch (err) {
        return fail(res, 400, (err as Error).message);
    }
    try {
        const existing = await findCouponById(req.params.id);
        if (!existing) return fail(res, 404, "Coupon not found");
        // Clearing the limit or end date of a code that must keep them.
        const limits = missingLimits({ ...existing, ...patch });
        if (limits) return fail(res, 400, limits);
        const coupon = await updateCoupon(req.params.id, patch);
        return coupon ? res.json({ coupon }) : fail(res, 404, "Coupon not found");
    } catch (err) {
        console.error("[Coupons] update failed:", (err as Error)?.message || err);
        return fail(res, 500, "Couldn't update the coupon");
    }
});

router.delete("/admin/coupons/:id", authenticate, requireAdmin, async (req: any, res) => {
    if (!UUID.test(req.params.id)) return fail(res, 400, "Invalid coupon id");
    try {
        await deleteCoupon(req.params.id);
        return res.json({ success: true });
    } catch (err) {
        // coupon_redemptions references the coupon (on delete restrict).
        if ((err as { code?: string })?.code === "23503") return fail(res, 409, "This code has been used, so it can't be deleted — switch it off instead");
        console.error("[Coupons] delete failed:", (err as Error)?.message || err);
        return fail(res, 500, "Couldn't delete the coupon");
    }
});

router.get("/admin/coupons/:id/redemptions", authenticate, requireAdmin, async (req: any, res) => {
    if (!UUID.test(req.params.id)) return fail(res, 400, "Invalid coupon id");
    try {
        return res.json({ redemptions: await listRedemptions(req.params.id) });
    } catch (err) {
        console.error("[Coupons] redemptions failed:", (err as Error)?.message || err);
        return fail(res, 500, "Couldn't load who used this code");
    }
});

export default router;
