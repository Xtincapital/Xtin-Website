// Real-time market data streaming — Node/TS port of `market_ws.py` +
// `utils/market_data_streamer.py`'s MarketDataStreamer.
//
// This is NOT a true push feed: it's a 15s polling loop (matching the
// Python source's `update_interval`) that re-fetches a quote for every
// currently-subscribed ticker and fans updates out to whichever sockets are
// subscribed to that ticker (a pub/sub pattern wrapped around polling).
//
// The Python source's `PriceAlertChecker` (in the same file) is
// intentionally not ported: it isn't imported by market_ws.py, and it
// belongs to the price-alerts/notifications domain that's owned by
// alerts.py — explicitly out of scope for this slice.
import type { Server as HttpServer } from "node:http";
import WebSocket, { WebSocketServer } from "ws";
import { getQuote, type QuoteData } from "./stockDataService.js";

const UPDATE_INTERVAL_MS = 15_000; // seconds between price updates, matches the Python source
const PER_TICKER_DELAY_MS = 500; // be gentle with the upstream API between symbols
const WS_PATH = "/api/fundakamental/ws/market-data";

interface CachedPrice extends QuoteData {
    timestamp: string;
}

// ticker -> set of subscribed sockets (mirrors Python's `active_connections`)
const activeConnections = new Map<string, Set<WebSocket>>();
// ticker -> latest known quote (mirrors Python's `price_cache`)
const priceCache = new Map<string, CachedPrice>();

let isRunning = false;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeSend(ws: WebSocket, payload: unknown): void {
    if (ws.readyState !== WebSocket.OPEN) return;
    try {
        ws.send(JSON.stringify(payload));
    } catch (err) {
        console.error("[Fundakamental market stream] send failed:", err);
    }
}

function subscribe(ws: WebSocket, ticker: string): void {
    const upper = ticker.toUpperCase();
    if (!activeConnections.has(upper)) activeConnections.set(upper, new Set());
    activeConnections.get(upper)!.add(ws);

    const cached = priceCache.get(upper);
    if (cached) safeSend(ws, { type: "price_update", ticker: upper, data: cached });
}

function unsubscribe(ws: WebSocket, ticker: string): void {
    const upper = ticker.toUpperCase();
    const subscribers = activeConnections.get(upper);
    if (!subscribers) return;
    subscribers.delete(ws);
    if (subscribers.size === 0) {
        activeConnections.delete(upper);
        priceCache.delete(upper);
    }
}

function unsubscribeAll(ws: WebSocket): void {
    const emptied: string[] = [];
    for (const [ticker, subscribers] of activeConnections.entries()) {
        subscribers.delete(ws);
        if (subscribers.size === 0) emptied.push(ticker);
    }
    for (const ticker of emptied) {
        activeConnections.delete(ticker);
        priceCache.delete(ticker);
    }
}

async function broadcastPrice(ticker: string, data: CachedPrice): Promise<void> {
    const subscribers = activeConnections.get(ticker);
    if (!subscribers || subscribers.size === 0) return;

    const message = { type: "price_update", ticker, data };
    const dead: WebSocket[] = [];
    for (const ws of subscribers) {
        if (ws.readyState !== WebSocket.OPEN) {
            dead.push(ws);
            continue;
        }
        try {
            ws.send(JSON.stringify(message));
        } catch (err) {
            console.error("[Fundakamental market stream] error sending to websocket:", err);
            dead.push(ws);
        }
    }
    for (const ws of dead) unsubscribe(ws, ticker);
}

async function updatePrices(tickers: string[]): Promise<void> {
    for (const ticker of tickers) {
        try {
            const quote = await getQuote(ticker);
            if (quote) {
                const cached: CachedPrice = { ...quote, timestamp: new Date().toISOString() };
                priceCache.set(ticker, cached);
                await broadcastPrice(ticker, cached);
            }
        } catch (err) {
            console.error(`[Fundakamental market stream] error updating ${ticker}:`, err);
        }
        await sleep(PER_TICKER_DELAY_MS); // small delay to respect rate limits
    }
}

async function priceUpdateLoop(): Promise<void> {
    while (isRunning) {
        try {
            const tickers = Array.from(activeConnections.keys());
            if (tickers.length) await updatePrices(tickers);
        } catch (err) {
            console.error("[Fundakamental market stream] error in price update loop:", err);
        }
        if (!isRunning) break;
        await sleep(UPDATE_INTERVAL_MS);
    }
}

function startStreamer(): void {
    if (isRunning) return;
    isRunning = true;
    void priceUpdateLoop();
}

/** Streaming statistics, equivalent to the Python source's GET /market-data/status. */
export function getMarketStreamerStats() {
    let totalConnections = 0;
    for (const subscribers of activeConnections.values()) totalConnections += subscribers.size;
    return {
        is_running: isRunning,
        active_tickers: activeConnections.size,
        total_connections: totalConnections,
        cached_prices: priceCache.size,
        update_interval: UPDATE_INTERVAL_MS / 1000,
    };
}

/**
 * Attach the FundaKaMental live market-data WebSocket to an existing HTTP
 * server.
 *
 * Client sends:
 *   {"action": "subscribe", "tickers": ["AAPL", "GOOGL"]}
 *   {"action": "unsubscribe", "tickers": ["AAPL"]}
 *   {"action": "ping"}
 *
 * Server sends:
 *   {"type": "connected", "message": "..."}
 *   {"type": "subscribed" | "unsubscribed", "tickers": [...]}
 *   {"type": "price_update", "ticker": "AAPL", "data": {...}}
 *   {"type": "pong"}
 *   {"type": "error", "message": "..."}
 */
export function attachMarketDataWebSocket(server: HttpServer): void {
    const wss = new WebSocketServer({ server, path: WS_PATH });

    wss.on("connection", (ws: WebSocket) => {
        if (!isRunning) startStreamer();

        safeSend(ws, { type: "connected", message: "Connected to market data stream" });

        ws.on("message", (raw: WebSocket.RawData) => {
            let message: { action?: string; tickers?: string[] };
            try {
                message = JSON.parse(raw.toString());
            } catch {
                safeSend(ws, { type: "error", message: "Invalid JSON message" });
                return;
            }

            try {
                const action = message.action;
                if (action === "subscribe") {
                    const tickers = (message.tickers || []).map((t) => String(t).toUpperCase());
                    for (const ticker of tickers) subscribe(ws, ticker);
                    safeSend(ws, { type: "subscribed", tickers });
                } else if (action === "unsubscribe") {
                    const tickers = (message.tickers || []).map((t) => String(t).toUpperCase());
                    for (const ticker of tickers) unsubscribe(ws, ticker);
                    safeSend(ws, { type: "unsubscribed", tickers });
                } else if (action === "ping") {
                    safeSend(ws, { type: "pong" });
                } else {
                    safeSend(ws, { type: "error", message: `Unknown action: ${action}` });
                }
            } catch (err) {
                safeSend(ws, { type: "error", message: String((err as Error)?.message || err) });
            }
        });

        ws.on("close", () => unsubscribeAll(ws));
        ws.on("error", (err) => {
            console.error("[Fundakamental market stream] websocket error:", err);
            unsubscribeAll(ws);
        });
    });
}
