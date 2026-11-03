// Sample executions for exercising the sync end to end before the broker's
// credentials exist. Never used in production (see adapter.ts). Every client
// gets the same three trades for "today", with ids that repeat within a day so
// running it twice shows the sync adding nothing the second time.
import type { BrokerAdapter, BrokerFill, Side } from "./types.js";

const IST_OFFSET_MS = 330 * 60_000;

interface SampleRow {
    time: string;
    symbol: string;
    segment: string;
    product: string;
    side: Side;
    quantity: number;
    price: number;
    charges: number;
}

const SAMPLE: SampleRow[] = [
    { time: "09:20", symbol: "RELIANCE", segment: "NSECM", product: "MIS", side: "buy", quantity: 10, price: 2450.5, charges: 9.2 },
    { time: "10:05", symbol: "RELIANCE", segment: "NSECM", product: "MIS", side: "sell", quantity: 10, price: 2462, charges: 11.4 },
    { time: "11:00", symbol: "NIFTY26N1024500CE", segment: "NSEFO", product: "NRML", side: "buy", quantity: 75, price: 120, charges: 21 },
    { time: "13:30", symbol: "NIFTY26N1024500CE", segment: "NSEFO", product: "NRML", side: "sell", quantity: 75, price: 135, charges: 24.5 },
    { time: "14:00", symbol: "TCS", segment: "NSECM", product: "CNC", side: "buy", quantity: 5, price: 3900, charges: 0 },
];

export function createMockAdapter(now: () => Date = () => new Date()): BrokerAdapter {
    return {
        name: "mock",
        async getClientProfile() {
            return { name: "Sample Trader" };
        },
        async getTodaysFills(clientCode: string): Promise<BrokerFill[]> {
            const day = new Date(now().getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
            const ymd = day.replace(/-/g, "");
            return SAMPLE.map((r, i) => ({
                executionId: `${ymd}${String(i + 1).padStart(4, "0")}`,
                clientCode,
                symbol: r.symbol,
                segment: r.segment,
                instrumentId: null,
                product: r.product,
                side: r.side,
                quantity: r.quantity,
                price: r.price,
                charges: r.charges,
                tradedAt: `${day}T${r.time}:00+05:30`,
            }));
        },
    };
}
