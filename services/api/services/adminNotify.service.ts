// Emails the admin team when something needs their review (e.g. a new algo
// publisher application). Uses Resend when RESEND_API_KEY is set — a dedicated
// provider, so these alerts don't share the Gmail SMTP daily quota the
// newsletter uses up — and falls back to the existing SMTP sender otherwise.
import { adminEmails } from "../middlewares/auth.js";
import { sendEmail } from "./mail.service.js";

const esc = (v: unknown) =>
    String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const sendViaResend = async (to: string[], subject: string, html: string, replyTo?: string) => {
    const from = process.env.RESEND_FROM || `Xtin Capital <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`;
    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
};

export const sendAdminAlert = async (subject: string, html: string, replyTo?: string) => {
    const to = [...new Set(adminEmails())];
    if (process.env.RESEND_API_KEY) return sendViaResend(to, subject, html, replyTo);
    for (const addr of to) await sendEmail(addr, subject, html);
};

export interface NewApplicationInfo {
    id: string;
    applicant_name: string;
    applicant_email: string;
    algo_name: string;
    strategy_type: string;
    asset_class: string;
    expected_price: number;
    experience: string;
    backtest_summary: string;
}

/** Fire-and-forget: an email failure must never fail the applicant's submission. */
export const notifyAdminsNewApplication = (app: NewApplicationInfo) => {
    const base = (process.env.FRONTEND_URL || "https://www.xtincapital.com").replace(/\/$/, "");
    const row = (k: string, v: unknown) =>
        `<tr><td style="padding:6px 12px;color:#6b7280;white-space:nowrap">${k}</td><td style="padding:6px 12px;color:#111827">${esc(v)}</td></tr>`;
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
<h2 style="margin:0 0 4px">New algo publisher application</h2>
<p style="color:#6b7280;margin:0 0 16px">${esc(app.applicant_name)} wants to publish <b>${esc(app.algo_name)}</b> on AlgoMarket and is waiting for review.</p>
<table style="border:1px solid #e5e7eb;border-radius:8px;border-collapse:collapse;width:100%">
${row("Applicant", `${app.applicant_name} <${app.applicant_email}>`)}${row("Algorithm", app.algo_name)}${row("Strategy", app.strategy_type)}
${row("Asset class", app.asset_class)}${row("Expected price", `₹${app.expected_price}`)}${row("Experience", app.experience)}
${row("Backtest summary", app.backtest_summary.slice(0, 600))}</table>
<p><a href="${base}/admin/algo-applications" style="background:#111827;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block">Review application</a></p>
<p style="color:#9ca3af;font-size:12px">Application ID ${esc(app.id)}</p></div>`;
    sendAdminAlert(`[Xtin] New algo application: ${app.algo_name}`, html, app.applicant_email).catch((err) =>
        console.error("[Algos] admin notification failed:", err?.message || err),
    );
};
