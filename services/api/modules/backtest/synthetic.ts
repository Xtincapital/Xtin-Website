// Deterministic synthetic candles for the special symbol "SAMPLE" — lets the
// whole backtest flow work offline and gives reproducible results for demos and
// tests. A seeded random walk with intrabar high/low noise (mulberry32 PRNG
// seeded from the request, so the same request always yields the same series).
import type { Candle } from "./types.js";

const BARS_PER_DAY: Record<string, number> = { "1m": 375, "5m": 75, "15m": 25, "1h": 7, "1d": 1 };
const STEP_MIN: Record<string, number> = { "1m": 1, "5m": 5, "15m": 15, "1h": 60, "1d": 1440 };

function seedFrom(s: string): number {
    let h = 1779033703 ^ s.length;
    for (let i = 0; i < s.length; i++) {
        h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
}

function mulberry32(seed: number) {
    let a = seed;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) =>
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;

/** `start` / `end` are "YYYY-MM-DD" dates, inclusive. */
export function generateSampleCandles(timeframe: string, start: string, end: string): Candle[] {
    const rand = mulberry32(seedFrom(`${timeframe}:${start}:${end}`));
    const uniform = (a: number, b: number) => a + (b - a) * rand();
    const barsPerDay = BARS_PER_DAY[timeframe] ?? 1;
    const stepMs = (STEP_MIN[timeframe] ?? 1440) * 60_000;

    const candles: Candle[] = [];
    let price = 100;
    // UTC arithmetic only: the strings are naive local clock times, not instants.
    for (let day = new Date(`${start}T00:00:00Z`); day <= new Date(`${end}T00:00:00Z`); day = new Date(day.getTime() + 86_400_000)) {
        const dow = day.getUTCDay();
        if (dow === 0 || dow === 6) continue; // skip weekends like an equity market
        let ts = new Date(day.getTime() + (9 * 60 + 15) * 60_000);
        for (let b = 0; b < barsPerDay; b++) {
            const drift = uniform(-1.0, 1.05); // mild upward bias
            const o = price;
            const c = Math.max(1, o + drift);
            const hi = Math.max(o, c) + uniform(0, 0.6);
            const lo = Math.min(o, c) - uniform(0, 0.6);
            candles.push({
                time: iso(ts),
                open: Math.round(o * 100) / 100,
                high: Math.round(hi * 100) / 100,
                low: Math.round(Math.max(0.5, lo) * 100) / 100,
                close: Math.round(c * 100) / 100,
                volume: Math.floor(uniform(1000, 50001)),
            });
            price = c;
            ts = new Date(ts.getTime() + stepMs);
        }
    }
    return candles;
}
