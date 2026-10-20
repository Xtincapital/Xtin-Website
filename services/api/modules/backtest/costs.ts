// Indian transaction costs per fill — brokerage, STT, exchange fee, SEBI fee,
// stamp duty, GST and the DP charge on delivery sells.
//
// Rates live in a dated table, never inline in the engine: a fill is charged
// with the schedule in force on its date. Add a new entry (with its effective
// date) whenever a broker or the exchange changes a rate — never edit an old
// one, or past runs stop reproducing.
//
// Sources: zerodha.com/charges (read 2026-10-21) for the current schedule;
// Zerodha's bulletin of 28 Sep 2024 for the NSE transaction charge moving from
// 0.00322% to 0.00297% on 1 Oct 2024. The later move to 0.00307% has no dated
// circular we could find: it is dated 9 Apr 2026, the earliest published
// source confirming it, so fills between Oct 2024 and then may be charged
// ~₹0.10 per lakh too little. Replace that date when NSE's circular is found.

export type Product = "CNC" | "MIS";

type Schedule = {
    effective_from: string; // "YYYY-MM-DD"
    brokerage: Record<Product, { pct: number; cap: number }>; // per executed order
    stt: Record<Product, { buy: number; sell: number }>; // % of turnover, rounded to the rupee
    exchange_pct: number; // NSE transaction charge, % of turnover
    sebi_per_crore: number;
    stamp_buy: Record<Product, number>; // % of buy turnover
    gst_pct: number; // on brokerage + exchange + SEBI
    dp_per_sell: number; // delivery sells, per scrip per day, GST included
};

const ZERODHA_BASE = {
    brokerage: { CNC: { pct: 0, cap: 0 }, MIS: { pct: 0.03, cap: 20 } },
    stt: { CNC: { buy: 0.1, sell: 0.1 }, MIS: { buy: 0, sell: 0.025 } },
    sebi_per_crore: 10,
    stamp_buy: { CNC: 0.015, MIS: 0.003 },
    gst_pct: 18,
    dp_per_sell: 15.34,
};

export const COST_PROFILES: Record<string, Schedule[]> = {
    zerodha: [
        { effective_from: "2000-01-01", ...ZERODHA_BASE, exchange_pct: 0.00322 },
        { effective_from: "2024-10-01", ...ZERODHA_BASE, exchange_pct: 0.00297 },
        { effective_from: "2026-04-09", ...ZERODHA_BASE, exchange_pct: 0.00307 },
    ],
};

export const DEFAULT_COST_PROFILE = "zerodha";
export const DEFAULT_SLIPPAGE_BPS = 5;

/** The cost model only knows Indian exchanges; elsewhere runs are labelled "before costs". */
export const costsApply = (exchange: string | undefined) => ["NSE", "BSE"].includes((exchange ?? "NSE").toUpperCase());

function scheduleFor(profile: string, date: string): Schedule | null {
    const schedules = COST_PROFILES[profile];
    if (!schedules) return null;
    let found: Schedule | null = null;
    for (const s of schedules) if (s.effective_from <= date.slice(0, 10)) found = s;
    return found ?? schedules[0];
}

/**
 * Charges for one fill. `buy` is the trade direction of this fill (a short's
 * entry is a sell, its exit a buy). Returns rupees, rounded to the paisa.
 */
export function fillCharges(profile: string, product: Product, buy: boolean, price: number, qty: number, date: string): number {
    const s = scheduleFor(profile, date);
    if (!s || qty <= 0) return 0;
    const turnover = price * qty;
    const b = s.brokerage[product];
    const brokerage = Math.min((turnover * b.pct) / 100, b.cap);
    const stt = Math.round((turnover * (buy ? s.stt[product].buy : s.stt[product].sell)) / 100);
    const exchange = (turnover * s.exchange_pct) / 100;
    const sebi = (turnover * s.sebi_per_crore) / 1e7;
    const stamp = buy ? (turnover * s.stamp_buy[product]) / 100 : 0;
    const gst = ((brokerage + exchange + sebi) * s.gst_pct) / 100;
    const dp = !buy && product === "CNC" ? s.dp_per_sell : 0;
    return Math.round((brokerage + stt + exchange + sebi + stamp + gst + dp) * 100) / 100;
}
