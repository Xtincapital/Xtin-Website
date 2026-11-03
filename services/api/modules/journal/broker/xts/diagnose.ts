// A read-only test of the connection to the broker's XTS, for the first day with
// real credentials. It checks each thing the adapter assumes about XTS and says
// which held, so the open questions get settled in minutes instead of by
// trial and error.
//
// It reports counts, field names and the SHAPE of values (digits shown as 9),
// never a customer's actual symbols, prices, names or times.
import { pairFills } from "../roundTrips.js";
import type { BrokerFill, DiagnosisReport, DiagnosisStep } from "../types.js";
import { XtsError, type XtsHttp } from "./http.js";
import { parseXtsTimestamp, tradeRowToFill, XtsParseError } from "./mapper.js";
import type { SessionManager } from "./session.js";
import { clientQuery, DAY_MS, istDay } from "./shared.js";

// What the adapter reads from every execution row.
const REQUIRED_FIELDS = ["ClientID", "TradingSymbol", "OrderSide", "ProductType", "ExchangeSegment", "ExchangeInstrumentID", "LastTradedQuantity", "LastTradedPrice", "ExecutionID", "LastExecutionTransactTime"];

const num = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN);
const present = (v: unknown) => v !== undefined && v !== null && String(v).trim() !== "";
const shapeOf = (v: unknown) => String(v).replace(/[0-9]/g, "9").replace(/[A-Za-z]/g, "A");
/** A message that is safe to show: ours, or the broker's own short description. */
const safe = (e: unknown) => (e instanceof XtsError || e instanceof XtsParseError ? e.message : "Unexpected error");
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export async function runDiagnosis(ctx: { http: XtsHttp; sessions: SessionManager; now: () => number }, clientCode?: string): Promise<DiagnosisReport> {
    const steps: DiagnosisStep[] = [];
    const add = (name: string, ok: boolean, detail: string) => void steps.push({ name, ok, detail });

    let session;
    try {
        session = await ctx.sessions.get();
        add(
            "Log in",
            true,
            session.isInvestorClient
                ? `Logged in as an investor client, which can read its own account only. ${plural(session.clientCodes.length, "client code")} visible.`
                : `Logged in as a dealer. ${plural(session.clientCodes.length, "client code")} mapped to this login.`,
        );
    } catch (err) {
        add("Log in", false, safe(err));
        return { steps };
    }

    if (!clientCode) {
        add("Client code", true, "No client code was given, so only the login was tested. Enter one to test reading its trades.");
        return { steps };
    }

    const code = clientCode.trim().toUpperCase();
    if (session.clientCodes.length) {
        const mapped = session.clientCodes.includes(code);
        add("Client code is visible to this login", mapped, mapped ? "Yes." : "No. This login can't read it, so the sync would refuse it too. Ask the broker to map it.");
        if (!mapped) return { steps };
    }
    const dealer = !session.isInvestorClient;
    const auth = { Authorization: session.token };

    // ── trade book
    let rows: Record<string, any>[] | null = null;
    try {
        const body = await ctx.http.request("GET", `${session.baseUrl}/orders/trades${clientQuery(session, code)}`, { headers: auth });
        if (body.result !== null && body.result !== undefined && !Array.isArray(body.result)) throw new XtsError("The trade book wasn't a list");
        rows = (body.result ?? []) as Record<string, any>[];
        add("Read today's trade book", true, `${plural(rows.length, "row")} came back.`);
    } catch (err) {
        add("Read today's trade book", false, safe(err));
    }

    if (rows && rows.length === 0) {
        add("Check the trade rows", true, "There are no trades today for this client, so the row checks were skipped. Run this again on a day the client has traded.");
    } else if (rows) {
        const own = rows.filter((r) => String(r.ClientID ?? "").trim().toUpperCase() === code).length;
        const unlabelled = rows.filter((r) => !present(r.ClientID)).length;
        const others = rows.length - own - unlabelled;
        if (dealer) {
            add(
                "Trade book is limited to the requested client (?clientID= works)",
                others === 0 && unlabelled === 0,
                others === 0 && unlabelled === 0
                    ? `All ${plural(own, "row")} belong to this client.`
                    : `${plural(own, "row")} are this client's; ${others} belong to other clients and ${unlabelled} have no ClientID. The server seems to ignore clientID. The sync still keeps only this client's rows, but check that all of this client's trades are included.`,
            );
        }

        const executions = rows.filter((r) => num(r.LastTradedQuantity) > 0);
        const missing = REQUIRED_FIELDS.map((f) => [f, executions.filter((r) => !present(r[f])).length] as const).filter(([, n]) => n > 0);
        add(
            "Execution rows have every field we read",
            missing.length === 0,
            missing.length === 0 ? `${plural(executions.length, "execution row")} checked; all ${REQUIRED_FIELDS.length} fields are present.` : `Missing: ${missing.map(([f, n]) => `${f} (${n} of ${executions.length} rows)`).join(", ")}.`,
        );

        const expectedDates = [istDay(ctx.now()), istDay(ctx.now() - DAY_MS)];
        const times = executions.map((r) => r.LastExecutionTransactTime ?? r.ExchangeTransactTime);
        const shapes = [...new Set(times.filter(present).map(shapeOf))];
        const unreadable = times.filter((t) => parseXtsTimestamp(t, expectedDates) === null).length;
        add(
            "Execution times are in a format we read",
            unreadable === 0 && executions.length > 0,
            executions.length === 0
                ? "There are no executions among these rows to check."
                : unreadable === 0
                  ? `Format seen: ${shapes.map((s) => `"${s}"`).join(", ")}. All ${executions.length} read, with day and month placed using today's date.`
                  : `${unreadable} of ${executions.length} couldn't be read, or have a day/month that fits neither today nor yesterday. Format seen: ${shapes.map((s) => `"${s}"`).join(", ") || "none"}.`,
        );

        const fills: BrokerFill[] = [];
        let firstProblem = "";
        rows.forEach((row, index) => {
            try {
                const fill = tradeRowToFill(row, { requestedClient: code, singleClient: !dealer, expectedDates }, index);
                if (fill) fills.push(fill);
            } catch (err) {
                firstProblem ||= safe(err);
            }
        });
        add("Rows turn into fills", !firstProblem, firstProblem ? `The sync would fail on this day's data. First problem: ${firstProblem}` : `${plural(fills.length, "fill")} made from ${plural(rows.length, "row")}.`);

        const paired = pairFills(fills.filter((f) => f.clientCode === code));
        add("Fills pair into trades", true, `${plural(paired.trades.length, "completed trade")}, ${plural(paired.open.length, "open position")}, ${plural(paired.unmatched.length, "delivery sale")} with no known purchase.`);
    }

    // ── profile (for the admin's name check)
    try {
        const body = await ctx.http.request("GET", `${session.baseUrl}/user/profile${clientQuery(session, code)}`, { headers: auth });
        const profile = Array.isArray(body.result) ? body.result[0] : body.result;
        const hasName = present(profile?.ClientName);
        add("Read the client's profile", hasName, hasName ? "The broker returned a name for this client." : "The profile came back with no ClientName, so the name check can't compare.");
    } catch (err) {
        add("Read the client's profile", false, safe(err));
    }

    return { steps };
}
