/**
 * Real-Time Market Data Hook
 * Manages WebSocket connection for live price updates.
 *
 * Ported from features-incoming/fundakamental/src/hooks/use-market-data.ts.
 *
 * Adaptations from the original:
 *  - The original derived its WS base from `VITE_API_URL` (falling back to
 *    `http://localhost:8080` in dev / a now-defunct Render URL in prod) —
 *    the standalone app's own FastAPI backend. This backend's real live
 *    market-data socket lives on THIS app's Express server instead, at
 *    `/api/fundakamental/ws/market-data` (see
 *    services/api/modules/fundakamental/marketStream.ts). So the WS base is
 *    now derived from this app's own `BACKEND_URL`
 *    (apps/web/src/config/env.ts), converting its scheme the same way the
 *    original did (`http` → `ws`, `https` → `wss`).
 *  - Message shapes match as-is: `marketStream.ts`'s header comment
 *    documents the exact same client `{action, tickers}` / server
 *    `{type, ...}` protocol this hook already speaks (subscribe/
 *    unsubscribe/ping in, connected/subscribed/unsubscribed/price_update/
 *    pong/error out) — verified directly against that file, not assumed.
 *  - Dropped the `auth_token` gate on `connect()`: the original backend's
 *    WS route required a token (`?token=...`) and `connect()` returned
 *    early without one. This backend's `attachMarketDataWebSocket` (see
 *    marketStream.ts) performs no auth check at all on the socket — so
 *    gating the connection on a possibly-absent legacy `auth_token`
 *    localStorage key would only break the feed for users who are
 *    authenticated purely via a Supabase session. The hook now always
 *    connects.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { BACKEND_URL } from '../../../config/env';

// http -> ws, https -> wss, so an https:// page doesn't try an insecure ws://.
const WS_BASE_URL = BACKEND_URL.replace(/^http/, 'ws');
const WS_URL = `${WS_BASE_URL}/api/fundakamental/ws/market-data`;

interface PriceUpdate {
  ticker: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  timestamp: string;
}

interface WebSocketMessage {
  type: string;
  ticker?: string;
  data?: PriceUpdate;
  tickers?: string[];
  message?: string;
}

export function useMarketData() {
  const [isConnected, setIsConnected] = useState(false);
  const [prices, setPrices] = useState<Map<string, PriceUpdate>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subscribedTickersRef = useRef<Set<string>>(new Set());

  const connect = useCallback(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('✅ Market data WebSocket connected');
      setIsConnected(true);
      setError(null);

      // Resubscribe to tickers after reconnect
      if (subscribedTickersRef.current.size > 0) {
        const tickers = Array.from(subscribedTickersRef.current);
        ws.send(JSON.stringify({
          action: 'subscribe',
          tickers: tickers
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        if (message.type === 'price_update' && message.ticker && message.data) {
          setPrices((prev) => {
            const newPrices = new Map(prev);
            newPrices.set(message.ticker!, message.data!);
            return newPrices;
          });
        } else if (message.type === 'error') {
          console.error('WebSocket error:', message.message);
          setError(message.message || 'Unknown error');
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = (event) => {
      console.error('❌ WebSocket error:', event);
      setError('Connection error');
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setIsConnected(false);
      wsRef.current = null;

      // Attempt reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Attempting to reconnect...');
        connect();
      }, 5000);
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const subscribe = useCallback((tickers: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, queueing subscription');
      tickers.forEach(t => subscribedTickersRef.current.add(t.toUpperCase()));
      return;
    }

    const upperTickers = tickers.map(t => t.toUpperCase());
    upperTickers.forEach(t => subscribedTickersRef.current.add(t));

    wsRef.current.send(JSON.stringify({
      action: 'subscribe',
      tickers: upperTickers
    }));
  }, []);

  const unsubscribe = useCallback((tickers: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const upperTickers = tickers.map(t => t.toUpperCase());
    upperTickers.forEach(t => subscribedTickersRef.current.delete(t));

    wsRef.current.send(JSON.stringify({
      action: 'unsubscribe',
      tickers: upperTickers
    }));
  }, []);

  const getPrice = useCallback((ticker: string): PriceUpdate | undefined => {
    return prices.get(ticker.toUpperCase());
  }, [prices]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    prices,
    error,
    subscribe,
    unsubscribe,
    getPrice,
    reconnect: connect
  };
}
