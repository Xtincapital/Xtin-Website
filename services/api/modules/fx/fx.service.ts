// Daily exchange rates for the website's currency switcher.
//
// One server-side copy, refreshed at most once a day, so visitors don't each hit
// a third-party API and every page converts with the same numbers. The refresh
// is lazy (the first request after the cache goes stale triggers it), which
// works on a host that sleeps; a warm-up at boot fills it as soon as the server
// starts. If the source is down we keep serving the last good rates.
//
// Rates are "units of currency per 1 USD". Source: frankfurter.dev (ECB data).
// It doesn't publish AED, which is pegged to the dollar, so that one is fixed.

export type FxRates = Record<string, number>;

export interface FxSnapshot {
	rates: FxRates;
	/** When we last fetched from the source (ISO). null = never succeeded (built-in fallback). */
	fetchedAt: string | null;
	/** The source's own date for the rates. */
	asOf: string | null;
	source: "live" | "stale" | "fallback";
}

const SOURCE_URL = "https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR,EUR,GBP,SGD";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 5000;
const AED_PEG = 3.6725;

export const FALLBACK_RATES: FxRates = { USD: 1, INR: 96.7, EUR: 0.89, GBP: 0.76, AED: AED_PEG, SGD: 1.28 };

let cache: { rates: FxRates; fetchedAt: number; asOf: string | null } | null = null;
let inflight: Promise<void> | null = null;

async function fetchRates(): Promise<void> {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
	try {
		const res = await fetch(SOURCE_URL, { signal: ctrl.signal });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = (await res.json()) as { rates?: Record<string, number>; date?: string };
		const rates: FxRates = { USD: 1, AED: AED_PEG };
		for (const [code, value] of Object.entries(data.rates ?? {})) {
			if (typeof value === "number" && value > 0) rates[code] = value;
		}
		if (!(rates.INR > 0)) throw new Error("response had no INR rate");
		cache = { rates, fetchedAt: Date.now(), asOf: data.date ?? null };
	} finally {
		clearTimeout(timer);
	}
}

/** Current rates; refreshes first if older than a day. Never throws. */
export async function getFxRates(): Promise<FxSnapshot> {
	const stale = !cache || Date.now() - cache.fetchedAt > MAX_AGE_MS;
	if (stale) {
		inflight ??= fetchRates()
			.catch((err) => console.warn("[FX] refresh failed:", err instanceof Error ? err.message : err))
			.finally(() => {
				inflight = null;
			});
		await inflight;
	}
	if (!cache) return { rates: { ...FALLBACK_RATES }, fetchedAt: null, asOf: null, source: "fallback" };
	const stillStale = Date.now() - cache.fetchedAt > MAX_AGE_MS;
	return {
		rates: { ...cache.rates },
		fetchedAt: new Date(cache.fetchedAt).toISOString(),
		asOf: cache.asOf,
		source: stillStale ? "stale" : "live",
	};
}

/** Fill the cache at boot so the first visitor doesn't wait. */
export function warmFxRates() {
	void getFxRates();
}

/** Test hook. */
export function resetFxCache() {
	cache = null;
	inflight = null;
}
