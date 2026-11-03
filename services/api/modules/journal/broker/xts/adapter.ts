// The real broker adapter: reads a client's day of executions from XTS.
//
// Built from the Interactive documentation and tested against responses written
// from it; not yet run against a live XTS server. Things the docs leave open, and
// that the first test against the broker's UAT must settle, are marked ASSUMPTION.
import type { BrokerAdapter, BrokerFill } from "../types.js";
import type { XtsConfig } from "./config.js";
import { createXtsHttp, XtsError, type XtsHttpDeps } from "./http.js";
import { tradeRowToFill } from "./mapper.js";
import { runDiagnosis } from "./diagnose.js";
import { createSessionManager, type XtsSession } from "./session.js";
import { clientQuery, DAY_MS, istDay } from "./shared.js";

/** Only clients mapped to this login can be read; say so plainly instead of passing on a vague 400. */
function assertReadable(session: XtsSession, code: string) {
    if (session.clientCodes.length && !session.clientCodes.includes(code)) {
        throw new XtsError("This client code isn't mapped to our broker login");
    }
}

export function createXtsAdapter(config: XtsConfig, deps: XtsHttpDeps = {}): BrokerAdapter {
    const now = deps.now ?? Date.now;
    const http = createXtsHttp(deps);
    const sessions = createSessionManager(config, http, now);

    /** Runs `fn` with a session, logging in again once if the token turns out to be stale. */
    async function withSession<T>(fn: (session: XtsSession) => Promise<T>): Promise<T> {
        const session = await sessions.get();
        try {
            return await fn(session);
        } catch (err) {
            if (!(err instanceof XtsError) || !err.auth) throw err;
            sessions.invalidate(session.token);
            return fn(await sessions.get());
        }
    }

    return {
        name: "xts",

        async getTodaysFills(clientCode: string): Promise<BrokerFill[]> {
            const code = clientCode.trim().toUpperCase();
            return withSession(async (session) => {
                assertReadable(session, code);
                const dealer = !session.isInvestorClient;

                // If the server ignores clientID, rows from other clients are dropped by the sync
                // (it keeps only the linked client's rows).
                const body = await http.request("GET", `${session.baseUrl}/orders/trades${clientQuery(session, code)}`, { headers: { Authorization: session.token } });

                // The TradeBook covers one trading day, so a row's date is today's or, just after
                // midnight, yesterday's. That settles "02-09-2026" being day-first or month-first.
                const expectedDates = [istDay(now()), istDay(now() - DAY_MS)];
                const rows = body.result ?? [];
                if (!Array.isArray(rows)) throw new XtsError("XTS sent a trade book we couldn't read");

                const fills: BrokerFill[] = [];
                rows.forEach((row, index) => {
                    const fill = tradeRowToFill(row, { requestedClient: code, singleClient: !dealer, expectedDates }, index);
                    if (fill) fills.push(fill);
                });
                return fills;
            });
        },

        diagnose: (clientCode?: string) => runDiagnosis({ http, sessions, now }, clientCode),

        async getClientProfile(clientCode: string): Promise<{ name: string | null }> {
            const code = clientCode.trim().toUpperCase();
            return withSession(async (session) => {
                assertReadable(session, code);
                const body = await http.request("GET", `${session.baseUrl}/user/profile${clientQuery(session, code)}`, { headers: { Authorization: session.token } });
                // ASSUMPTION: `result` is the profile object (a one-item list is tolerated).
                const profile = Array.isArray(body.result) ? body.result[0] : body.result;
                const name = typeof profile?.ClientName === "string" ? profile.ClientName.trim() : "";
                // The profile also carries PAN and bank details. They stop here: only the name is passed on.
                return { name: name || null };
            });
        },
    };
}
