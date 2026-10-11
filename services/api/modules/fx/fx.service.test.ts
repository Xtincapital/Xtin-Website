import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FALLBACK_RATES, getFxRates, resetFxCache } from "./fx.service.js";

const ok = (rates: Record<string, number>) =>
	({ ok: true, status: 200, json: async () => ({ date: "2026-10-09", rates }) }) as unknown as Response;

describe("getFxRates", () => {
	beforeEach(() => {
		resetFxCache();
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it("fetches once and serves the cache for a day", async () => {
		const fetchMock = vi.fn().mockResolvedValue(ok({ INR: 96.73, EUR: 0.89, GBP: 0.76, SGD: 1.28 }));
		vi.stubGlobal("fetch", fetchMock);

		const first = await getFxRates();
		const second = await getFxRates();
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(first.source).toBe("live");
		expect(first.rates.INR).toBe(96.73);
		expect(first.rates.USD).toBe(1);
		expect(first.rates.AED).toBeGreaterThan(3);
		expect(second.rates).toEqual(first.rates);
	});

	it("refreshes after 24 hours", async () => {
		const fetchMock = vi.fn().mockResolvedValue(ok({ INR: 96.73 }));
		vi.stubGlobal("fetch", fetchMock);
		await getFxRates();
		vi.setSystemTime(Date.now() + 25 * 60 * 60 * 1000);
		fetchMock.mockResolvedValue(ok({ INR: 97.5 }));
		const next = await getFxRates();
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(next.rates.INR).toBe(97.5);
	});

	it("keeps serving the last good rates, marked stale, when the source is down", async () => {
		const fetchMock = vi.fn().mockResolvedValueOnce(ok({ INR: 96.73 }));
		vi.stubGlobal("fetch", fetchMock);
		await getFxRates();
		vi.setSystemTime(Date.now() + 25 * 60 * 60 * 1000);
		fetchMock.mockRejectedValue(new Error("down"));
		const result = await getFxRates();
		expect(result.source).toBe("stale");
		expect(result.rates.INR).toBe(96.73);
	});

	it("falls back to built-in rates if the source has never answered", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
		const result = await getFxRates();
		expect(result.source).toBe("fallback");
		expect(result.rates).toEqual(FALLBACK_RATES);
	});

	it("rejects a response without an INR rate", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok({ EUR: 0.89 })));
		expect((await getFxRates()).source).toBe("fallback");
	});
});
