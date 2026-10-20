// The remote MCP endpoint (Streamable HTTP, stateless) and the OAuth metadata
// Claude uses to sign users in with their Xtin login.
//
//   POST /mcp                                     JSON-RPC over Streamable HTTP
//   GET  /.well-known/oauth-protected-resource    RFC 9728: where to get a token
//
// Sign-in: Supabase Auth (the same login as the website) is the OAuth 2.1
// authorization server. An unauthenticated call gets 401 with a
// WWW-Authenticate pointer to the metadata; Claude registers itself with
// Supabase, the user approves on xtincapital.com/oauth/consent, and Claude
// sends the Supabase access token here. Tokens are validated like any other
// session, then forwarded to /api/v1 — the MCP server holds no data of its
// own and never sees broker tokens or conversation text.
import { Router } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { verifyAccessToken } from "../../middlewares/auth.js";
import { rateLimit } from "../backtest/rateLimit.js";
import { apiClient } from "./apiClient.js";
import { buildMcpServer } from "./server.js";

type Verify = (token: string) => Promise<{ sub: string; clientId: string | null } | { error: string; expired: boolean }>;

export type McpRouterOptions = {
    /** /api/v1 root the tools call. Default: this process. */
    apiBase?: () => string;
    verify?: Verify;
    /** Public URL of the MCP endpoint (MCP_PUBLIC_URL), else derived from the request. */
    mcpUrl?: (req) => string;
    siteUrl?: () => string;
    authorizationServer?: () => string;
};

/** Browsers may only call from these origins; Claude's servers send no Origin at all. */
const ALLOWED_ORIGINS = [/^https:\/\/(www\.)?claude\.(ai|com)$/, /^https:\/\/(www\.)?xtincapital\.com$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];

const defaults = {
    apiBase: () => process.env.INTERNAL_API_URL || `http://127.0.0.1:${process.env.PORT || 5000}/api/v1`,
    // Behind Render's proxy req.protocol is "http"; set MCP_PUBLIC_URL in production.
    mcpUrl: (req) => process.env.MCP_PUBLIC_URL || `${String(req.get("x-forwarded-proto") ?? req.protocol).split(",")[0]}://${req.get("host")}/mcp`,
    siteUrl: () => process.env.SITE_URL || "https://www.xtincapital.com",
    authorizationServer: () => process.env.MCP_AUTHORIZATION_SERVER || `${String(process.env.SUPABASE_URL ?? "").replace(/\/$/, "")}/auth/v1`,
};

type McpRequest = import("express").Request & { user?: { authId: string }; mcpToken?: string };

const jsonRpcError = (res, status: number, code: number, message: string) => res.status(status).json({ jsonrpc: "2.0", error: { code, message }, id: null });

export function mcpRouter(options: McpRouterOptions = {}) {
    const o = { ...defaults, verify: verifyAccessToken as Verify, ...options };
    const router = Router();
    const metadataUrl = (req) => {
        const mcp = new URL(o.mcpUrl(req));
        return `${mcp.origin}/.well-known/oauth-protected-resource${mcp.pathname}`;
    };

    const protectedResource = (req, res) => {
        res.set("Cache-Control", "public, max-age=3600");
        res.json({
            resource: o.mcpUrl(req),
            authorization_servers: [o.authorizationServer()],
            bearer_methods_supported: ["header"],
            scopes_supported: ["openid", "email", "profile"],
            resource_name: "Xtin Backtest",
            resource_documentation: `${o.siteUrl()}/backtest`,
        });
    };
    router.get("/.well-known/oauth-protected-resource", protectedResource);
    router.get("/.well-known/oauth-protected-resource/mcp", protectedResource);

    const limitMcp = rateLimit("mcp", [{ limit: 120, seconds: 60 }, { limit: 2000, seconds: 3600 }], "calling Xtin tools", (req) => req.ip || "unknown");

    router.post(
        "/mcp",
        async (req: McpRequest, res, next) => {
            // DNS-rebinding protection: a browser page from another site can't drive this endpoint.
            const origin = req.get("origin");
            if (origin && !ALLOWED_ORIGINS.some((re) => re.test(origin))) return jsonRpcError(res, 403, -32600, "Origin not allowed");

            const challenge = (error?: string, description?: string) => {
                res.set("WWW-Authenticate", `Bearer resource_metadata="${metadataUrl(req)}"${error ? `, error="${error}", error_description="${description}"` : ""}`);
                return jsonRpcError(res, 401, -32001, description ?? "Sign in to Xtin to use these tools.");
            };
            const m = /^Bearer\s+(\S+)$/i.exec(req.get("authorization") ?? "");
            if (!m) return challenge();
            const verified = await o.verify(m[1]).catch(() => ({ error: "Token check failed", expired: false }));
            if ("error" in verified) return challenge("invalid_token", verified.expired ? "The access token expired" : "The access token is invalid");
            req.user = { authId: verified.sub };
            req.mcpToken = m[1];
            next();
        },
        limitMcp,
        async (req: McpRequest, res) => {
            // Stateless: a fresh server and transport per request (no sessions to lose on a redeploy).
            const server = buildMcpServer({ api: apiClient(o.apiBase(), req.mcpToken as string), siteUrl: o.siteUrl(), mcpUrl: o.mcpUrl(req) });
            const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
            res.on("close", () => {
                void transport.close();
                void server.close();
            });
            try {
                await server.connect(transport);
                await transport.handleRequest(req, res, req.body);
            } catch (err) {
                console.error("[MCP] request failed:", (err as Error)?.message ?? err);
                if (!res.headersSent) jsonRpcError(res, 500, -32603, "Internal error");
            }
        }
    );

    // Stateless server: no server-initiated stream and no sessions to end.
    const notAllowed = (_req, res) => res.set("Allow", "POST").status(405).json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed — POST JSON-RPC to /mcp." }, id: null });
    router.get("/mcp", notAllowed);
    router.delete("/mcp", notAllowed);

    return router;
}
