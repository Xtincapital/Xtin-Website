import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach, vi } from "vitest";
import http from "node:http";
import net from "node:net";
import type { AddressInfo } from "node:net";
import { createOutboundFetch, lookupOutboundIp, readProxyUrl } from "./egress.js";
import { createXtsAdapter } from "./adapter.js";
import { getXtsAdapter, getOutboundFetch } from "./index.js";

// Real sockets: a small XTS-like server, and a small proxy that tunnels to it.

let xts: http.Server;
let xtsPort = 0;
const xtsSeen: string[] = [];

/** A proxy that records what it was asked to reach, and can demand a username and password. */
class FakeProxy {
    server!: http.Server;
    port = 0;
    seen: string[] = [];
    credentials: string | null = null;
    // CONNECT tunnels are taken out of the server's own bookkeeping, so they are tracked here to be closed.
    private tunnels = new Set<{ destroy(): unknown }>();
    async start() {
        this.server = http.createServer((req, res) => {
            // A request for an absolute address (a plain-http target handed to the proxy to forward).
            this.seen.push(`${req.method} ${req.url}`);
            if (!this.allowed(req.headers["proxy-authorization"])) {
                res.writeHead(407, { "Proxy-Authenticate": 'Basic realm="proxy"' });
                return void res.end();
            }
            const target = new URL(req.url ?? "");
            const upstream = http.request({ host: target.hostname, port: target.port, path: target.pathname + target.search, method: req.method, headers: { ...req.headers, host: target.host } }, (r) => {
                res.writeHead(r.statusCode ?? 502, r.headers);
                r.pipe(res);
            });
            req.pipe(upstream);
        });
        this.server.on("connect", (req, socket, head) => {
            this.seen.push(`CONNECT ${req.url}`);
            if (!this.allowed(req.headers["proxy-authorization"])) {
                socket.write("HTTP/1.1 407 Proxy Authentication Required\r\nProxy-Authenticate: Basic realm=\"proxy\"\r\n\r\n");
                return void socket.destroy();
            }
            const [host, port] = (req.url ?? "").split(":");
            const upstream = net.connect(Number(port), host, () => {
                this.tunnels.add(socket).add(upstream);
                socket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
                upstream.write(head);
                upstream.pipe(socket);
                socket.pipe(upstream);
            });
            upstream.on("error", () => socket.destroy());
            socket.on("error", () => upstream.destroy());
        });
        await new Promise<void>((r) => this.server.listen(0, "127.0.0.1", r));
        this.port = (this.server.address() as AddressInfo).port;
    }
    private allowed(header: string | undefined) {
        return !this.credentials || header === `Basic ${Buffer.from(this.credentials).toString("base64")}`;
    }
    async stop() {
        for (const tunnel of this.tunnels) tunnel.destroy();
        this.server.closeAllConnections();
        await new Promise<void>((r) => this.server.close(() => r()));
    }
    get url() {
        return `http://127.0.0.1:${this.port}`;
    }
}

beforeAll(async () => {
    xts = http.createServer((req, res) => {
        xtsSeen.push(`${req.method} ${req.url}`);
        res.writeHead(200, { "content-type": "application/json" });
        if (req.method === "POST") return void res.end(JSON.stringify({ type: "success", result: { token: "TOKEN", isInvestorClient: false, clientCodes: ["AB1234"] } }));
        if (req.url?.startsWith("/ip")) return void res.end(JSON.stringify({ ip: "203.0.113.7" }));
        res.end(JSON.stringify({ type: "success", result: [] }));
    });
    await new Promise<void>((r) => xts.listen(0, "127.0.0.1", r));
    xtsPort = (xts.address() as AddressInfo).port;
});
afterAll(async () => {
    xts.closeAllConnections();
    await new Promise<void>((r) => xts.close(() => r()));
});
beforeEach(() => void (xtsSeen.length = 0));

const config = () => ({ baseUrl: `http://127.0.0.1:${xtsPort}/interactive`, appKey: "k", secretKey: "s", hostLookup: null });
const quick = { minIntervalMs: 0, timeoutMs: 3000 };

describe("readProxyUrl", () => {
    it("is none when not set", () => {
        expect(readProxyUrl({})).toEqual({ url: null });
        expect(readProxyUrl({ XTS_PROXY_URL: "  " })).toEqual({ url: null });
    });

    it("accepts http and https proxy addresses, with or without a login", () => {
        for (const url of ["http://10.0.0.5:3128", "https://proxy.example.com:8443", "http://user:pass@proxy.example.com:8080"]) {
            expect(readProxyUrl({ XTS_PROXY_URL: url })).toEqual({ url });
        }
    });

    it("rejects anything else, without repeating the address (which may hold a password)", () => {
        for (const bad of ["proxy.example.com:3128", "ftp://proxy.example.com", "socks5://user:secret@proxy.example.com:1080", "not a url", "http://"]) {
            const result = readProxyUrl({ XTS_PROXY_URL: bad });
            expect(result, bad).toHaveProperty("error");
            expect(JSON.stringify(result)).not.toContain("secret");
        }
    });
});

describe("sending broker traffic through a proxy", () => {
    const proxy = new FakeProxy();
    beforeAll(() => proxy.start());
    afterAll(() => proxy.stop());
    beforeEach(() => {
        proxy.seen.length = 0;
        proxy.credentials = null;
    });

    it("reaches the broker by way of the proxy", async () => {
        const adapter = createXtsAdapter(config(), { ...quick, fetch: createOutboundFetch(proxy.url) });
        expect(await adapter.getTodaysFills("AB1234")).toEqual([]);

        expect(xtsSeen).toEqual(["POST /interactive/user/session", "GET /interactive/orders/trades?clientID=AB1234"]);
        // Every call went to the proxy first, naming the broker as the destination.
        expect(proxy.seen.length).toBeGreaterThan(0);
        expect(proxy.seen.every((s) => s.includes(`127.0.0.1:${xtsPort}`))).toBe(true);
    });

    it("goes direct when no proxy is set", async () => {
        const adapter = createXtsAdapter(config(), { ...quick, fetch: createOutboundFetch(null) });
        await adapter.getTodaysFills("AB1234");
        expect(proxy.seen).toEqual([]);
        expect(xtsSeen.length).toBe(2);
    });

    it("sends the proxy's username and password", async () => {
        proxy.credentials = "fixed:ip-secret";
        const adapter = createXtsAdapter(config(), { ...quick, fetch: createOutboundFetch(`http://fixed:ip-secret@127.0.0.1:${proxy.port}`) });
        expect(await adapter.getTodaysFills("AB1234")).toEqual([]);
    });

    it("fails, rather than going direct, if the proxy refuses the login", async () => {
        proxy.credentials = "fixed:ip-secret";
        const adapter = createXtsAdapter(config(), { ...quick, fetch: createOutboundFetch(`http://fixed:wrong@127.0.0.1:${proxy.port}`) });
        await expect(adapter.getTodaysFills("AB1234")).rejects.toThrow(/Could not reach/);
        expect(xtsSeen).toEqual([]); // the broker never saw a request
    });

    it("fails, rather than going direct, if the proxy is down", async () => {
        const adapter = createXtsAdapter(config(), { ...quick, fetch: createOutboundFetch("http://127.0.0.1:1") });
        await expect(adapter.getTodaysFills("AB1234")).rejects.toThrow(/Could not reach/);
        expect(xtsSeen).toEqual([]);
    });
});

describe("lookupOutboundIp", () => {
    const url = () => `http://127.0.0.1:${xtsPort}/ip`;

    it("returns the address the service reports", async () => {
        expect(await lookupOutboundIp(fetch, url())).toBe("203.0.113.7");
    });

    it("asks through the proxy when there is one, so it reports the proxy's address", async () => {
        const proxy = new FakeProxy();
        await proxy.start();
        try {
            expect(await lookupOutboundIp(createOutboundFetch(proxy.url), url())).toBe("203.0.113.7");
            expect(proxy.seen.length).toBeGreaterThan(0);
        } finally {
            await proxy.stop();
        }
    });

    it("passes on only something shaped like an address", async () => {
        const answers = [{ status: 200, body: { ip: "<script>alert(1)</script>" } }, { status: 200, body: { ip: "" } }, { status: 200, body: { nope: 1 } }, { status: 500, body: { ip: "203.0.113.7" } }];
        for (const { status, body } of answers) {
            const fake = (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
            await expect(lookupOutboundIp(fake, "http://x")).rejects.toThrow();
        }
        const html = (async () => new Response("<html>", { status: 200 })) as unknown as typeof fetch;
        await expect(lookupOutboundIp(html, "http://x")).rejects.toThrow(/couldn't read/);
    });

    it("accepts an IPv6 address", async () => {
        const fake = (async () => new Response(JSON.stringify({ ip: "2001:db8::7" }))) as unknown as typeof fetch;
        expect(await lookupOutboundIp(fake, "http://x")).toBe("2001:db8::7");
    });
});

describe("the adapter and route chosen from the environment", () => {
    beforeEach(() => {
        vi.stubEnv("XTS_BASE_URL", "http://127.0.0.1:9/interactive");
        vi.stubEnv("XTS_APP_KEY", "k");
        vi.stubEnv("XTS_SECRET_KEY", "s");
        vi.spyOn(console, "warn").mockImplementation(() => undefined);
    });
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it("is available with a good proxy address, and a different adapter when the proxy changes", () => {
        vi.stubEnv("XTS_PROXY_URL", "http://127.0.0.1:3128");
        const first = getXtsAdapter();
        expect(first?.name).toBe("xts");
        expect(getXtsAdapter()).toBe(first);
        vi.stubEnv("XTS_PROXY_URL", "http://127.0.0.1:3129");
        expect(getXtsAdapter()).not.toBe(first);
    });

    it("is unavailable with a bad proxy address, rather than quietly going direct", () => {
        vi.stubEnv("XTS_PROXY_URL", "socks5://proxy:1080");
        expect(getXtsAdapter()).toBeNull();
    });

    it("says which route the broker traffic takes", () => {
        vi.stubEnv("XTS_PROXY_URL", "");
        expect(getOutboundFetch().viaProxy).toBe(false);
        vi.stubEnv("XTS_PROXY_URL", "http://127.0.0.1:3128");
        expect(getOutboundFetch().viaProxy).toBe(true);
        vi.stubEnv("XTS_PROXY_URL", "nonsense");
        expect(() => getOutboundFetch()).toThrow(/isn't a valid/);
    });
});
