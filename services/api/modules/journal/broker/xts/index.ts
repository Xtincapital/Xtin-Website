// The XTS adapter for the running server: built once from the environment so
// the login session (one per key pair) and the request pacing are shared by
// every sync in this process.
import type { BrokerAdapter } from "../types.js";
import { readXtsConfig } from "./config.js";
import { createXtsAdapter } from "./adapter.js";
import { createOutboundFetch, readProxyUrl } from "./egress.js";

let cached: { key: string; adapter: BrokerAdapter } | null = null;
const warned = new Set<string>();

const warnOnce = (message: string) => {
    if (warned.has(message)) return;
    warned.add(message);
    console.warn(`[Journal] ${message} Broker sync stays unavailable.`);
};

/** The adapter, or null when the XTS settings in the environment are incomplete or the proxy address is wrong. */
export function getXtsAdapter(): BrokerAdapter | null {
    const config = readXtsConfig();
    if (!config) {
        warnOnce("XTS_ADAPTER=xts, but XTS_APP_KEY, XTS_SECRET_KEY and an address (XTS_BASE_URL, or XTS_HOSTLOOKUP_URL with XTS_ACCESS_PASSWORD) are not all set.");
        return null;
    }
    const proxy = readProxyUrl();
    if ("error" in proxy) {
        // Going direct instead would reach the broker from an address it may not accept; refuse instead.
        warnOnce(`${proxy.error}.`);
        return null;
    }
    const key = [config.appKey, config.secretKey, config.baseUrl, config.hostLookup?.url, proxy.url].join("|");
    if (cached?.key !== key) cached = { key, adapter: createXtsAdapter(config, { fetch: createOutboundFetch(proxy.url) }) };
    return cached.adapter;
}

/** The route broker traffic takes, for finding out what address the broker sees. Throws if the proxy address is wrong. */
export function getOutboundFetch(): { fetch: typeof fetch; viaProxy: boolean } {
    const proxy = readProxyUrl();
    if ("error" in proxy) throw new Error(proxy.error);
    return { fetch: createOutboundFetch(proxy.url), viaProxy: proxy.url !== null };
}
