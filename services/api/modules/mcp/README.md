# Xtin Backtest — Claude connector (MCP server)

A remote MCP server, in this API process, that lets Claude (and other MCP
clients) backtest with a user's Xtin account. It is just another client of
`/api/v1`: it never touches the database, so plan gates, credits, the result
cache and metering (`channel = mcp`) apply as on the website. It never places
orders.

| Path | What |
|---|---|
| `POST /mcp` | MCP over Streamable HTTP, stateless (JSON responses) |
| `GET /.well-known/oauth-protected-resource[/mcp]` | RFC 9728 metadata: where to get a token |

Tools: `search_instruments`, `get_strategy_schema`, `validate_strategy`,
`run_backtest` (shows the in-chat report), `get_backtest_report`,
`compare_backtests`, `save_strategy`, `list_strategies`, `delete_strategy`,
`get_usage`. Resources: the Strategy Spec schema (`xtin://spec/v1/schema.json`)
and the report view (`ui://xtin-backtest/report.html`, an MCP App).

## Sign-in

Supabase Auth — the website's login — is the OAuth 2.1 authorization server.
Claude calls `/mcp`, gets `401` with a `WWW-Authenticate` pointer to the
metadata, registers itself with Supabase (dynamic client registration), sends
the user to `https://www.xtincapital.com/oauth/consent` to approve, and then
calls `/mcp` with the Supabase access token. The token is checked like any other
session (`verifyAccessToken`) and forwarded to `/api/v1`.

### One-time setup (Supabase dashboard — needs a project admin)

1. **Authentication → OAuth Server**: enable the OAuth 2.1 server.
2. Set the **authorization path** to `/oauth/consent` (site URL
   `https://www.xtincapital.com`).
3. Enable **dynamic client registration** (Claude registers itself).
4. **Authentication → URL Configuration → Redirect URLs**: add
   `https://www.xtincapital.com/oauth/consent**` so a Google sign-in started
   from the consent page comes back to it.
5. Confirm the discovery document loads:
   `https://<project-ref>.supabase.co/.well-known/oauth-authorization-server/auth/v1`
   and lists `S256` under `code_challenge_methods_supported`.

### Environment (Render)

| Variable | Value |
|---|---|
| `MCP_PUBLIC_URL` | `https://mcp.xtincapital.com/mcp` (or `https://<render-host>/mcp` until DNS is set). **Required in production** — it is the OAuth resource id and seeds the report view's sandbox domain. |
| `SITE_URL` | `https://www.xtincapital.com` (report links) |
| `INTERNAL_API_URL` | optional; defaults to `http://127.0.0.1:$PORT/api/v1` |
| `MCP_AUTHORIZATION_SERVER` | optional; defaults to `$SUPABASE_URL/auth/v1` |

For `mcp.xtincapital.com`: add it as a custom domain on the Render service and a
CNAME at the DNS provider. If the URL changes later, the report's sandbox domain
changes with it (it is derived from the URL), which is expected.

## Try it

- **MCP Inspector**: `npx @modelcontextprotocol/inspector`, transport
  "Streamable HTTP", URL `https://…/mcp`; it runs the OAuth flow itself.
- **Claude**: Settings → Connectors → Add custom connector → the `/mcp` URL.
  Custom connectors work on every Claude plan, so beta users can add it before
  any directory listing.
- **Tests**: `npx vitest run modules/mcp` drives the real server with the MCP SDK
  client.

## Editing the report view

`ui/report.ts` is built into the committed, self-contained `ui/report.html`:

    npm run build:mcp-ui

The test suite fails if `report.html` is older than `report.ts`.

## Directory submission checklist

1. Every tool exercised in MCP Inspector and from a Claude chat.
2. Public docs page, privacy policy, support contact, icon, 3–5 PNG screenshots
   (≥ 1,000 px wide), at least three example prompts, a fully populated reviewer
   account (Pro, with saved strategies and runs).
3. claude.ai/directory/manage → Submit new → MCP connector (includes the
   financial-transactions acknowledgement — this server executes none).
4. Plugin: publish `integrations/claude-plugin` as a public repo, run
   `claude plugin validate`, submit as a Plugin bundle.

## Known limits

- Supabase's OAuth server doesn't support RFC 8707 resource indicators, so
  tokens aren't bound to this server's URL; they are ordinary Xtin session
  tokens, accepted by the whole API.
- Scopes are Supabase's standard ones (`openid email profile`); access control
  is per user in `/api/v1`, not per scope.
- Supabase doesn't advertise client ID metadata documents, so Claude uses
  dynamic client registration (a new client per fresh connection).
- Rate limits and idempotency keys are in-process — correct for one Render
  instance; move them to Redis/Postgres before scaling out.
