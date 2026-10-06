// PDF Generation Service — Node/TS port of `utils/pdf_generator.py`'s
// `PDFGenerator` class.
//
// The Python original renders Jinja2 templates and converts them to PDF with
// WeasyPrint (a Python HTML-to-PDF renderer needing native system libraries:
// pango, cairo, gdk-pixbuf). Node equivalents, per the porting brief:
//   - Templating: nunjucks (a JS port of Jinja2 — `templates/*.njk` below).
//   - HTML -> PDF: puppeteer (headless Chromium, `page.pdf()`).
//
// `save_file` support from the Python source (writing the PDF to
// `UPLOAD_DIR/pdfs/`) is intentionally dropped — every route here returns
// the PDF as a binary HTTP response (`generate_analysis_report(..., save_file=False)`
// was already the only mode `pdf_export.py`'s endpoints ever used).
import nunjucks from "nunjucks";
import puppeteer, { type Browser } from "puppeteer";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import QRCode from "qrcode";
import { registerIssuedReport, holderLabel } from "../reports/issuedReports.js";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.join(__dirname, "templates");

const APP_NAME = "FundaKaMental";

/* ==========================================================================
 * TEMPLATE ENVIRONMENT
 * ======================================================================== */

const env = nunjucks.configure(TEMPLATE_DIR, {
    autoescape: true,
    trimBlocks: true,
    lstripBlocks: true,
});

// Jinja2's built-in `format` filter does Python `%`-style string formatting
// (`"%.2f"|format(x)`), which nunjucks has no equivalent for. `fixed(n)`
// below covers every use of that pattern across the ported templates.
env.addFilter("fixed", (value: unknown, digits: number = 2) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(digits) : (0).toFixed(digits);
});

// `"%.2fB"|format(x / 1_000_000_000)` pattern — divide by a billion, then fix.
env.addFilter("billions", (value: unknown, digits: number = 2) => {
    const n = Number(value);
    return Number.isFinite(n) ? (n / 1_000_000_000).toFixed(digits) : (0).toFixed(digits);
});

// Xtin favicon, inlined so the PDF is self-contained (the renderer loads the page from a string).
let logoDataUri = "";
try {
    logoDataUri = `data:image/png;base64,${fs.readFileSync(path.join(TEMPLATE_DIR, "assets", "logo.png")).toString("base64")}`;
} catch {
    console.warn("[Fundakamental] templates/assets/logo.png missing; PDFs will have no logo");
}

/** Who a report was issued to (shown on the cover and the authenticity seal). */
export interface PreparedFor {
    name?: string;
    email?: string;
    userId?: string;
}

const preparedForLabel = (p?: PreparedFor) => (p?.name?.trim() || p?.email || "");

/** Report number + fingerprint: a SHA-256 of the report's data, so a copy can be matched to what was issued. */
function reportIdentity(templateName: string, context: Record<string, unknown>, now: Date) {
    const digest = crypto.createHash("sha256").update(JSON.stringify(context)).digest("hex").toUpperCase();
    const kind = templateName.startsWith("analysis") ? "AN" : templateName.startsWith("screening") ? "SC" : "TA";
    const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
    return {
        report_no: `XC-FK-${kind}-${ymd}-${digest.slice(0, 8)}`,
        fingerprint: (digest.slice(0, 32).match(/.{4}/g) || []).join("-"),
    };
}

const verifyBase = () => (process.env.FRONTEND_URL || "https://www.xtincapital.com").replace(/\/$/, "");

async function renderTemplate(templateName: string, context: Record<string, unknown>, preparedFor?: PreparedFor): Promise<string> {
    const now = new Date();
    const identity = reportIdentity(templateName, context, now);
    const verify_url = `${verifyBase()}/verify?r=${identity.report_no}&f=${identity.fingerprint}`;
    // Record the report so /verify can find it. A registry hiccup must not block the user's download.
    if (preparedFor?.userId) {
        await registerIssuedReport({ report_no: identity.report_no, fingerprint: identity.fingerprint, user_id: preparedFor.userId, holder_name: holderLabel(preparedFor.name, preparedFor.email) })
            .catch((err) => console.error("[Fundakamental] could not register report:", err?.message || err));
    }
    const fullContext = {
        ...context,
        ...identity,
        verify_url,
        verify_page: `${verifyBase().replace(/^https?:\/\//, "")}/verify`,
        qr_data_uri: await QRCode.toDataURL(verify_url, { margin: 1, width: 220, errorCorrectionLevel: "M" }),
        logo_data_uri: logoDataUri,
        prepared_for: preparedForLabel(preparedFor),
        generated_at: new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            // Render runs in UTC; label the time instead of printing UTC as if local.
            timeZone: "Asia/Kolkata",
        }).format(now) + " IST",
        app_name: APP_NAME,
        current_year: now.getFullYear(),
    };
    return env.render(templateName, fullContext);
}

/* ==========================================================================
 * CORE PDF GENERATION (puppeteer)
 * ======================================================================== */

let browserPromise: Promise<Browser> | null = null;

// Render (and most containers) give Chrome a tiny /dev/shm and little RAM:
// without these flags Chrome can hang or crash mid-render, and a PDF request
// then never returns. `--single-process`/`--no-zygote` keep memory low on the
// 512 MB free tier.
const CHROME_ARGS = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-extensions",
    "--no-first-run",
    "--no-zygote",
    "--single-process",
];
const LAUNCH_TIMEOUT_MS = 45_000;
const RENDER_TIMEOUT_MS = 45_000;

function getBrowser(): Promise<Browser> {
    if (!browserPromise) {
        const launching = puppeteer.launch({
            headless: true,
            args: CHROME_ARGS,
            timeout: LAUNCH_TIMEOUT_MS,
            protocolTimeout: RENDER_TIMEOUT_MS,
        });
        browserPromise = launching;
        launching
            .then((browser) => {
                // If Chrome dies (e.g. out of memory), launch a fresh one next
                // time instead of handing out a dead browser that hangs forever.
                browser.on("disconnected", () => {
                    if (browserPromise === launching) browserPromise = null;
                });
            })
            .catch(() => {
                // Allow a later call to retry launching instead of caching a rejected promise.
                if (browserPromise === launching) browserPromise = null;
            });
    }
    return browserPromise;
}

function withTimeout<T>(promise: Promise<T>, ms: number, what: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`${what} timed out after ${Math.round(ms / 1000)}s`)), ms);
        promise.then(
            (v) => { clearTimeout(timer); resolve(v); },
            (e) => { clearTimeout(timer); reject(e); },
        );
    });
}

async function htmlToPdf(html: string, footerLabel = ""): Promise<Buffer> {
    const browser = await withTimeout(getBrowser(), LAUNCH_TIMEOUT_MS, "Starting the PDF renderer");
    const page = await browser.newPage();
    try {
        // Templates are self-contained (no external assets), so the DOM being
        // ready is enough — no need to wait on network idle.
        await page.setContent(html, { waitUntil: "domcontentloaded", timeout: RENDER_TIMEOUT_MS });
        const pdf = await withTimeout(
            page.pdf({
                format: "A4",
                printBackground: true,
                margin: { top: "20px", bottom: "34px", left: "20px", right: "20px" },
                displayHeaderFooter: true,
                headerTemplate: "<span></span>",
                footerTemplate: `<div style="width:100%;padding:0 22px;font-size:7px;color:#6b7280;font-family:Arial,sans-serif;display:flex;justify-content:space-between;border-top:1px solid #e5e7eb;padding-top:5px"><span>XTIN CAPITAL &middot; ${footerLabel.replace(/[<>&]/g, "")}</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
            }),
            RENDER_TIMEOUT_MS,
            "Rendering the PDF",
        );
        return Buffer.from(pdf);
    } finally {
        await page.close().catch(() => {});
    }
}

/** Closes the shared headless browser. Not called in normal operation — exposed for test/teardown scripts. */
export async function closePdfBrowser(): Promise<void> {
    if (browserPromise) {
        const browser = await browserPromise;
        await browser.close();
        browserPromise = null;
    }
}

/* ==========================================================================
 * ANALYSIS REPORT PDF
 * ======================================================================== */
// Port of `PDFGenerator.generate_analysis_report`. Context shape matches
// `funda_reports` / `AnalysisReportResponse` (see reports.controller.ts),
// NOT the ad hoc `analysis_data` dict the Python source built from the
// nonexistent `analysis_reports` table — that mismatch was the other half
// of the bug this port fixes.
const isBlank = (v: unknown) => v === null || v === undefined || /^\s*(n\/?a)?\s*$/i.test(String(v));

export async function generateAnalysisReportPdf(data: Record<string, unknown>, preparedFor?: PreparedFor): Promise<Buffer> {
    // Uploads without a chosen company have ticker/exchange "N/A"; leave them
    // out of the header, and print the report date as a date, not a timestamp.
    const date = data.date ? new Date(String(data.date)) : null;
    const html = await renderTemplate("analysisReport.njk", {
        ...data,
        ticker: isBlank(data.ticker) ? "" : data.ticker,
        exchange: isBlank(data.exchange) ? "" : data.exchange,
        date: date && !Number.isNaN(date.getTime())
            ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(date)
            : data.date ?? "",
    }, preparedFor);
    return htmlToPdf(html, "FUNDAMENTAL ANALYSIS REPORT");
}

/* ==========================================================================
 * SCREENING RESULTS PDF
 * ======================================================================== */
// Port of `PDFGenerator.generate_screening_report`.
export async function generateScreeningReportPdf(data: Record<string, unknown>, preparedFor?: PreparedFor): Promise<Buffer> {
    const html = await renderTemplate("screeningReport.njk", data, preparedFor);
    return htmlToPdf(html, "STOCK SCREENING REPORT");
}

/* ==========================================================================
 * TECHNICAL ANALYSIS PDF
 * ======================================================================== */
// Port of `PDFGenerator.generate_technical_report`.
export async function generateTechnicalReportPdf(data: Record<string, unknown>, preparedFor?: PreparedFor): Promise<Buffer> {
    const html = await renderTemplate("technicalReport.njk", data, preparedFor);
    return htmlToPdf(html, "TECHNICAL ANALYSIS REPORT");
}

/* ==========================================================================
 * HELPERS
 * ======================================================================== */
// Port of `PDFGenerator.get_pdf_size`.
export function getPdfSize(pdfBytes: Buffer): string {
    const sizeBytes = pdfBytes.length;
    if (sizeBytes < 1024) return `${sizeBytes} B`;
    if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

// `PDFGenerator.generate_watchlist_report` / `generate_comparison_report` and
// `cleanup_old_pdfs` (a disk-file GC job for the now-unused `save_file` path)
// are intentionally NOT ported — `pdf_export.py`, the only caller in scope
// for this slice, never invokes them (no `/export/watchlist` or
// `/export/comparison` routes exist there), and `cleanup_old_pdfs` has
// nothing to clean since PDFs are never written to disk here.
