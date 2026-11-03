// How requests to the broker leave this server, and what address they leave from.
//
// Some brokers only accept API calls from addresses they have whitelisted. A host
// like Render doesn't give one fixed address (its outbound addresses are a shared
// range that can change), so two things are provided:
//   - lookupOutboundIp: asks an outside service what address the broker will see,
//     for the admin to pass on when the broker asks for it;
//   - XTS_PROXY_URL: send the broker traffic through a proxy that does have a fixed
//     address (a small server in India, or a fixed-IP proxy service). It fails
//     closed: if the proxy is set but unusable, calls fail, they don't quietly go
//     direct from an address the broker hasn't whitelisted.

/** The proxy address from the environment: none, a valid one, or an error saying why it isn't valid. */
export function readProxyUrl(env: NodeJS.ProcessEnv = process.env): { url: string | null } | { error: string } {
    const raw = (env.XTS_PROXY_URL ?? "").trim();
    if (!raw) return { url: null };
    try {
        const parsed = new URL(raw);
        if ((parsed.protocol !== "http:" && parsed.protocol !== "https:") || !parsed.hostname) throw new Error("not a web address");
        return { url: raw };
    } catch {
        // The address can carry a password, so it isn't repeated here.
        return { error: "XTS_PROXY_URL isn't a valid http:// or https:// address" };
    }
}

/**
 * A fetch that goes through `proxyUrl`, or the ordinary fetch when there is none. Uses undici's own
 * fetch with its proxy agent: mixing that agent with Node's built-in fetch breaks across versions.
 */
export function createOutboundFetch(proxyUrl: string | null): typeof fetch {
    if (!proxyUrl) return fetch;
    let agent: unknown;
    return (async (input: any, init?: any) => {
        const { ProxyAgent, fetch: proxied } = await import("undici");
        agent ??= new ProxyAgent(proxyUrl);
        return (proxied as any)(input, { ...init, dispatcher: agent });
    }) as typeof fetch;
}

const IP_SERVICE = "https://api.ipify.org?format=json";

/** The address the broker sees our requests coming from, asked of an outside service through the same route. */
export async function lookupOutboundIp(fetchImpl: typeof fetch, url = IP_SERVICE, timeoutMs = 8000): Promise<string> {
    const res = await fetchImpl(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) throw new Error(`The address lookup answered ${res.status}`);
    const body: any = await res.json().catch(() => null);
    const ip = typeof body?.ip === "string" ? body.ip.trim() : "";
    // Only something shaped like an address is passed on.
    if (!/^[0-9a-fA-F:.]{3,45}$/.test(ip)) throw new Error("The address lookup gave an answer we couldn't read");
    return ip;
}
