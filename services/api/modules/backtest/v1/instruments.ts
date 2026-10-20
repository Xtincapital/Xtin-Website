// Instrument search and data coverage for /api/v1.
//
// A curated starter list (large NSE stocks, the main indices and their ETFs,
// plus the synthetic SAMPLE series) — NOT a full instrument master. The full
// master (every listed symbol, ISINs, symbol changes, lot sizes) comes with
// the licensed data lane. Any valid NSE/BSE ticker can still be backtested;
// search just won't suggest it.
import { INDEX_ETF } from "../marketData.js";

export type Instrument = { id: string; symbol: string; exchange: string; name: string; segment: "EQ" | "INDEX" | "ETF" | "SYNTHETIC"; aliases?: string[] };

const eq = (symbol: string, name: string, aliases?: string[]): Instrument => ({ id: `NSE:${symbol}`, symbol, exchange: "NSE", name, segment: "EQ", ...(aliases ? { aliases } : {}) });

export const INSTRUMENTS: Instrument[] = [
    { id: "NSE:NIFTY", symbol: "NIFTY", exchange: "NSE", name: "NIFTY 50 index", segment: "INDEX", aliases: ["NIFTY50"] },
    { id: "NSE:BANKNIFTY", symbol: "BANKNIFTY", exchange: "NSE", name: "NIFTY Bank index", segment: "INDEX" },
    { id: "BSE:SENSEX", symbol: "SENSEX", exchange: "BSE", name: "S&P BSE Sensex index", segment: "INDEX" },
    { id: "NSE:NIFTYBEES", symbol: "NIFTYBEES", exchange: "NSE", name: "Nippon India ETF Nifty 50 BeES", segment: "ETF" },
    { id: "NSE:BANKBEES", symbol: "BANKBEES", exchange: "NSE", name: "Nippon India ETF Nifty Bank BeES", segment: "ETF" },
    { id: "NSE:SAMPLE", symbol: "SAMPLE", exchange: "NSE", name: "Synthetic demo series (not market data)", segment: "SYNTHETIC" },
    eq("RELIANCE", "Reliance Industries"),
    eq("TCS", "Tata Consultancy Services"),
    eq("HDFCBANK", "HDFC Bank", ["HDFC"]),
    eq("ICICIBANK", "ICICI Bank", ["ICICI"]),
    eq("INFY", "Infosys", ["INFOSYS"]),
    eq("BHARTIARTL", "Bharti Airtel", ["AIRTEL"]),
    eq("ITC", "ITC"),
    eq("SBIN", "State Bank of India", ["SBI"]),
    eq("LT", "Larsen & Toubro", ["L&T"]),
    eq("HINDUNILVR", "Hindustan Unilever", ["HUL"]),
    eq("BAJFINANCE", "Bajaj Finance"),
    eq("KOTAKBANK", "Kotak Mahindra Bank", ["KOTAK"]),
    eq("AXISBANK", "Axis Bank"),
    eq("MARUTI", "Maruti Suzuki India"),
    eq("SUNPHARMA", "Sun Pharmaceutical Industries"),
    eq("HCLTECH", "HCL Technologies"),
    eq("M&M", "Mahindra & Mahindra", ["MAHINDRA"]),
    eq("TITAN", "Titan Company"),
    eq("ULTRACEMCO", "UltraTech Cement"),
    eq("NTPC", "NTPC"),
    eq("ONGC", "Oil & Natural Gas Corporation"),
    eq("POWERGRID", "Power Grid Corporation of India"),
    eq("ADANIENT", "Adani Enterprises"),
    eq("ADANIPORTS", "Adani Ports and SEZ"),
    eq("ASIANPAINT", "Asian Paints"),
    eq("BAJAJFINSV", "Bajaj Finserv"),
    eq("NESTLEIND", "Nestlé India", ["NESTLE"]),
    eq("WIPRO", "Wipro"),
    eq("JSWSTEEL", "JSW Steel"),
    eq("TATASTEEL", "Tata Steel"),
    eq("COALINDIA", "Coal India"),
    eq("GRASIM", "Grasim Industries"),
    eq("HINDALCO", "Hindalco Industries"),
    eq("TECHM", "Tech Mahindra"),
    eq("CIPLA", "Cipla"),
    eq("DRREDDY", "Dr. Reddy's Laboratories"),
    eq("EICHERMOT", "Eicher Motors"),
    eq("HEROMOTOCO", "Hero MotoCorp"),
    eq("BRITANNIA", "Britannia Industries"),
    eq("APOLLOHOSP", "Apollo Hospitals"),
    eq("DIVISLAB", "Divi's Laboratories"),
    eq("BPCL", "Bharat Petroleum"),
    eq("SBILIFE", "SBI Life Insurance"),
    eq("HDFCLIFE", "HDFC Life Insurance"),
    eq("BAJAJ-AUTO", "Bajaj Auto"),
    eq("INDUSINDBK", "IndusInd Bank"),
    eq("SHRIRAMFIN", "Shriram Finance"),
    eq("TRENT", "Trent"),
    eq("BEL", "Bharat Electronics"),
    eq("HAL", "Hindustan Aeronautics"),
    eq("JIOFIN", "Jio Financial Services"),
    eq("DMART", "Avenue Supermarts (DMart)"),
    eq("PIDILITIND", "Pidilite Industries"),
    eq("SIEMENS", "Siemens"),
    eq("DLF", "DLF"),
    eq("IOC", "Indian Oil Corporation"),
    eq("VEDL", "Vedanta"),
    eq("TATAPOWER", "Tata Power"),
    eq("GAIL", "GAIL (India)"),
    eq("AMBUJACEM", "Ambuja Cements"),
    eq("BANKBARODA", "Bank of Baroda"),
    eq("PNB", "Punjab National Bank"),
    eq("CANBK", "Canara Bank"),
    eq("GODREJCP", "Godrej Consumer Products"),
    eq("DABUR", "Dabur India"),
    eq("HAVELLS", "Havells India"),
    eq("ICICIPRULI", "ICICI Prudential Life Insurance"),
    eq("ICICIGI", "ICICI Lombard General Insurance"),
    eq("CHOLAFIN", "Cholamandalam Investment and Finance"),
    eq("TVSMOTOR", "TVS Motor Company"),
    eq("NAUKRI", "Info Edge (India)"),
    eq("INDIGO", "InterGlobe Aviation (IndiGo)"),
    eq("IRCTC", "Indian Railway Catering and Tourism"),
    eq("IRFC", "Indian Railway Finance Corporation"),
    eq("BOSCHLTD", "Bosch"),
    eq("SHREECEM", "Shree Cement"),
    eq("MARICO", "Marico"),
    eq("COLPAL", "Colgate-Palmolive (India)"),
    eq("TORNTPHARM", "Torrent Pharmaceuticals"),
    eq("LUPIN", "Lupin"),
    eq("ABB", "ABB India"),
    eq("ADANIPOWER", "Adani Power"),
    eq("LICI", "Life Insurance Corporation of India", ["LIC"]),
    eq("POLYCAB", "Polycab India"),
];

const BY_ID = new Map(INSTRUMENTS.map((i) => [i.id, i]));

export const findInstrument = (id: string) => BY_ID.get(id.trim().toUpperCase()) ?? null;

/** Ranked search: exact symbol or alias, then symbol prefix, then name-word prefix, then substring. */
export function searchInstruments(q: string, limit = 10): Instrument[] {
    const query = q.trim().toUpperCase();
    if (!query) return INSTRUMENTS.slice(0, limit);
    const scored: [number, Instrument][] = [];
    for (const inst of INSTRUMENTS) {
        const name = inst.name.toUpperCase();
        const symbols = [inst.symbol, ...(inst.aliases ?? [])];
        let score = 0;
        if (symbols.includes(query) || inst.id === query) score = 100;
        else if (symbols.some((s) => s.startsWith(query))) score = 80;
        else if (name.split(/[\s(]+/).some((w) => w.startsWith(query))) score = 60;
        else if (name.includes(query) || symbols.some((s) => s.includes(query))) score = 40;
        if (score) scored.push([score + (inst.segment === "SYNTHETIC" ? -10 : 0), inst]);
    }
    return scored.sort((a, b) => b[0] - a[0] || a[1].symbol.localeCompare(b[1].symbol)).slice(0, limit).map(([, i]) => i);
}

/** Data available per timeframe. Yahoo's intraday depth is approximate and changes without notice. */
export function coverage(id: string, today = new Date()) {
    const [exchange, symbol] = id.toUpperCase().split(":");
    const iso = (daysBack: number) => new Date(today.getTime() - daysBack * 86_400_000).toISOString().slice(0, 10);
    const to = iso(0);
    if (symbol === "SAMPLE") {
        const all = { from: "2000-01-01", to, approximate: false };
        return { id, source: "synthetic", note: "Generated on demand for any window — results are synthetic.", timeframes: { "1d": all, "1h": all, "15m": all, "5m": all, "1m": all } };
    }
    const known = findInstrument(id);
    return {
        id: `${exchange}:${symbol}`,
        source: "yahoo",
        listed_in_search: Boolean(known),
        note:
            (known?.segment === "INDEX" ? `An index can't be bought — results are theoretical${INDEX_ETF[symbol] ? `; ${INDEX_ETF[symbol]} is the tradable ETF` : ""}. ` : "") +
            "Daily history usually goes back to the 2000s; intraday depth is approximate.",
        timeframes: {
            "1d": { from: "2000-01-01", to, approximate: true },
            "1h": { from: iso(729), to, approximate: true },
            "15m": { from: iso(59), to, approximate: true },
            "5m": { from: iso(59), to, approximate: true },
            "1m": { from: iso(6), to, approximate: true },
        },
    };
}
