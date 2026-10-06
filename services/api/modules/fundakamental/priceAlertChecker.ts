// Price alert checker: compares every active price alert (watchlist targets
// create these) with the latest price and, when one is hit, switches it off
// and drops an in-app notification for the user (bell + Alerts page).
//
// Runs every 15 minutes in-process, and also for one user whenever their
// dashboard asks for the unread count (at most every 5 minutes per user) —
// Render's free tier sleeps, so the timer alone can miss hours.
import cron from "node-cron";
import supabase from "../../supabase/index.js";
import { getQuote } from "./stockDataService.js";

export interface AlertRow {
    id: string;
    user_id: string;
    ticker: string;
    condition: "above" | "below";
    target_price: number | string;
}

const USER_CHECK_GAP_MS = 5 * 60 * 1000;
const lastUserCheck = new Map<string, number>();
let globalRunning = false;

export const isHit = (condition: string, price: number, target: number) =>
    condition === "above" ? price >= target : price <= target;

const money = (ticker: string, n: number) =>
    `${/\.(NS|BO)$/i.test(ticker) ? "₹" : "$"}${n.toLocaleString(/\.(NS|BO)$/i.test(ticker) ? "en-IN" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function alertNotification(alert: AlertRow, price: number) {
    const target = Number(alert.target_price);
    const up = alert.condition === "above";
    return {
        user_id: alert.user_id,
        type: "price_alert",
        title: `${alert.ticker} ${up ? "rose to" : "fell to"} your target`,
        message: `${alert.ticker} is at ${money(alert.ticker, price)} — your alert was for ${up ? "at or above" : "at or below"} ${money(alert.ticker, target)}.`,
        data: { ticker: alert.ticker, condition: alert.condition, target_price: target, price, alert_id: alert.id },
        is_read: false,
    };
}

/** Switch off one alert and notify; returns false if another run beat us to it. */
async function triggerAlert(alert: AlertRow, price: number): Promise<boolean> {
    const target = Number(alert.target_price);
    // (user, ticker, condition, target, is_active) is unique: clear an older
    // triggered copy of the same alert before marking this one triggered.
    await supabase
        .from("funda_price_alerts")
        .delete()
        .eq("user_id", alert.user_id)
        .eq("ticker", alert.ticker)
        .eq("condition", alert.condition)
        .eq("target_price", target)
        .eq("is_active", false);

    const { data, error } = await supabase
        .from("funda_price_alerts")
        .update({ is_active: false, triggered_at: new Date().toISOString(), triggered_price: price })
        .eq("id", alert.id)
        .eq("is_active", true)
        .select("id");
    if (error || !data || data.length === 0) return false;

    const { error: notifyError } = await supabase.from("funda_notifications").insert(alertNotification(alert, price));
    if (notifyError) console.error("[PriceAlerts] notification insert failed:", notifyError.message);
    return true;
}

/** Check active alerts (all users, or one) against current prices. */
export async function checkPriceAlerts(opts: { userId?: string } = {}): Promise<{ checked: number; triggered: number }> {
    let query = supabase.from("funda_price_alerts").select("id, user_id, ticker, condition, target_price").eq("is_active", true).limit(5000);
    if (opts.userId) query = query.eq("user_id", opts.userId);
    const { data, error } = await query;
    if (error) throw error;
    const alerts = (data || []) as AlertRow[];

    const prices = new Map<string, number | null>();
    for (const ticker of new Set(alerts.map((a) => a.ticker.toUpperCase()))) {
        const quote = await getQuote(ticker).catch(() => null);
        prices.set(ticker, quote?.price && quote.price > 0 ? quote.price : null);
    }

    let triggered = 0;
    for (const alert of alerts) {
        const price = prices.get(alert.ticker.toUpperCase());
        if (price == null || !isHit(alert.condition, price, Number(alert.target_price))) continue;
        if (await triggerAlert(alert, price)) triggered += 1;
    }
    return { checked: alerts.length, triggered };
}

/** Check one user's alerts if we haven't recently (called from the unread-count endpoint). */
export async function checkUserAlertsIfDue(userId: string): Promise<void> {
    const last = lastUserCheck.get(userId) || 0;
    if (Date.now() - last < USER_CHECK_GAP_MS) return;
    lastUserCheck.set(userId, Date.now());
    try {
        await checkPriceAlerts({ userId });
    } catch (err) {
        console.error("[PriceAlerts] user check failed:", (err as Error)?.message || err);
    }
}

export function startPriceAlertScheduler() {
    if (process.env.DISABLE_PRICE_ALERT_CRON === "true") return;
    cron.schedule("*/15 * * * *", async () => {
        if (globalRunning) return;
        globalRunning = true;
        try {
            const { checked, triggered } = await checkPriceAlerts();
            if (triggered) console.log(`[PriceAlerts] ${triggered} of ${checked} alerts triggered`);
        } catch (err) {
            console.error("[PriceAlerts] scheduled check failed:", (err as Error)?.message || err);
        } finally {
            globalRunning = false;
        }
    });
    console.log("[PriceAlerts] Checking price alerts every 15 minutes");
}

/** Let the next unread-count call re-check this user (after they add or change an alert). */
export function forgetUserCheck(userId: string) {
    lastUserCheck.delete(userId);
}

/** Test hook. */
export function resetPriceAlertState() {
    lastUserCheck.clear();
    globalRunning = false;
}
