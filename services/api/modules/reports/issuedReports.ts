// Registry of issued reports + the public verification lookup.
//   POST /api/reports/register  (signed in)  — Gini/Journal call this when they build a report in the browser.
//   GET  /api/reports/verify    (public)     — the /verify page and the QR code on every report.
// Fundakamental reports are built on the server and registered directly via registerIssuedReport.
import { Router } from "express";
import supabase from "../../supabase/index.js";
import { authenticate } from "../../middlewares/auth.js";

const REPORT_NO = /^XC-(GN|JN|FK-(AN|SC|TA))-\d{8}-[0-9A-F]{8}$/;
const FINGERPRINT = /^([0-9A-F]{4}-){7}[0-9A-F]{4}$/;
const norm = (v: unknown) => String(v ?? "").trim().toUpperCase();
const stripDashes = (v: string) => v.replace(/-/g, "");

export const kindOf = (reportNo: string) => (reportNo.startsWith("XC-GN") ? "gini" : reportNo.startsWith("XC-JN") ? "journal" : "fundakamental");
const KIND_LABEL: Record<string, string> = { gini: "Gini Financial Planning Report", journal: "Xtin Journal Trading Report", fundakamental: "Fundakamental Research Report" };

/** "Suraj Nandan" -> "Suraj N."; email-only users get their email's local part's first letters hidden. */
export const holderLabel = (name?: string, email?: string) => {
    const parts = (name || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
    if (parts.length === 1) return parts[0];
    return email ? `${email[0].toUpperCase()}***` : "Xtin user";
};

export interface IssuedReport {
    report_no: string;
    fingerprint: string;
    user_id: string;
    holder_name: string;
}

/** Idempotent: the same report registered twice is fine; the same number with different content or owner is refused. */
export const registerIssuedReport = async (r: IssuedReport): Promise<"created" | "exists" | "conflict"> => {
    const { data: existing, error } = await supabase.from("issued_reports").select("fingerprint,user_id").eq("report_no", r.report_no).maybeSingle();
    if (error) throw error;
    if (existing) return existing.fingerprint === r.fingerprint && existing.user_id === r.user_id ? "exists" : "conflict";
    const { error: insErr } = await supabase.from("issued_reports").insert({ ...r, kind: kindOf(r.report_no) });
    if (insErr) throw insErr;
    return "created";
};

// Small per-IP limiter for the public lookup, so it can't be used to enumerate report numbers.
const hits = new Map<string, { n: number; reset: number }>();
const limitVerify = (req, res, next) => {
    const now = Date.now();
    const ip = String(req.ip || "unknown");
    const h = hits.get(ip);
    if (!h || h.reset < now) hits.set(ip, { n: 1, reset: now + 60_000 });
    else if (++h.n > 30) return res.status(429).json({ error: "Too many checks. Please wait a minute." });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    next();
};

export const register = async (req, res) => {
    const report_no = norm(req.body?.report_no);
    const fingerprint = norm(req.body?.fingerprint);
    if (!REPORT_NO.test(report_no) || !FINGERPRINT.test(fingerprint)) return res.status(400).json({ error: "Invalid report number or fingerprint." });
    // Browser-built reports are Gini/Journal only; Fundakamental ones are registered by the server itself.
    if (report_no.startsWith("XC-FK")) return res.status(400).json({ error: "This report type is registered by the server." });
    try {
        const name = [req.user?.first_name, req.user?.last_name].filter(Boolean).join(" ");
        const result = await registerIssuedReport({ report_no, fingerprint, user_id: req.user.authId, holder_name: holderLabel(name, req.user?.email) });
        if (result === "conflict") return res.status(409).json({ error: "This report number is already registered." });
        return res.status(result === "created" ? 201 : 200).json({ ok: true });
    } catch (err) {
        console.error("[Reports] register failed:", err);
        return res.status(500).json({ error: "Could not register the report." });
    }
};

export const verify = async (req, res) => {
    const report_no = norm(req.query?.report_no);
    const fingerprint = norm(req.query?.fingerprint);
    if (!REPORT_NO.test(report_no)) return res.status(200).json({ found: false });
    try {
        const { data, error } = await supabase.from("issued_reports").select("report_no,kind,fingerprint,holder_name,issued_at").eq("report_no", report_no).maybeSingle();
        if (error) throw error;
        if (!data) return res.status(200).json({ found: false });
        return res.status(200).json({
            found: true,
            report_no: data.report_no,
            report_type: KIND_LABEL[data.kind] || "Xtin report",
            issued_to: data.holder_name,
            issued_at: data.issued_at,
            // null = no fingerprint supplied to compare; false = the copy's figures differ from what was issued.
            fingerprint_match: fingerprint ? stripDashes(fingerprint) === stripDashes(data.fingerprint) : null,
        });
    } catch (err) {
        console.error("[Reports] verify failed:", err);
        return res.status(500).json({ error: "Could not check the report right now." });
    }
};

const router = Router();
router.post("/reports/register", authenticate, register);
router.get("/reports/verify", limitVerify, verify);
export default router;
