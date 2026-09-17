// Port of main.py's `compact_trade_context` — builds a compact text summary
// of a trade list for Claude's context window. Used by every Claude-calling
// endpoint in aiCoach.controller.ts (chat, weekly-review, pre-trade-check).
// `analyze` does NOT use this — it's pure rule-based math with no AI call.
//
// Field-name note: the original Python read trades shaped like the
// standalone app's `TradeData` model (`symbol`, `profit_loss`, ...). These
// endpoints still accept trades in the request body exactly like the source
// (nothing here queries `journal_trades` directly — the client is expected
// to pass trades it already fetched via `GET /journal/trades`), but that
// endpoint returns rows shaped like Phase 9a's `journal_trades` table
// (`asset`, `pnl`, ...) instead. The helpers below read either shape
// defensively, preferring the new column names and falling back to the
// legacy ones — exactly as permissive as the Python source's own
// `t.get(a, t.get(b, default))` calls.
export interface JournalTradeLike {
    date?: string | null;
    exit_date?: string | null;
    exitDate?: string | null;
    asset?: string | null;
    symbol?: string | null;
    strategy?: string | null;
    market?: string | null;
    pnl?: number | null;
    profit_loss?: number | null;
    emotion?: string | null;
    [key: string]: unknown;
}

export function pnlOf(trade: JournalTradeLike): number {
    const value = trade.pnl ?? trade.profit_loss ?? 0;
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

export function symbolOf(trade: JournalTradeLike): string {
    return (trade.asset || trade.symbol || "?") as string;
}

export function exitDateOf(trade: JournalTradeLike): string {
    return (trade.exit_date || trade.exitDate || trade.date || "?") as string;
}

/** Plain-number formatting matching Python's `{value:,.0f}` — thousands
 * comma grouping, no decimals, US/international grouping (NOT Indian
 * lakh/crore grouping, which `toLocaleString("en-IN")` would produce). */
export function fmt(n: number): string {
    return Math.round(n || 0).toLocaleString("en-US");
}

/** Port of `compact_trade_context`. */
export function compactTradeContext(trades: JournalTradeLike[] | null | undefined, maxRecent = 12): string {
    const rows = trades || [];
    if (rows.length === 0) return "No trades logged.";

    const total = rows.length;
    const totalPnl = rows.reduce((sum, t) => sum + pnlOf(t), 0);
    const wins = rows.filter((t) => pnlOf(t) > 0).length;
    const losses = rows.filter((t) => pnlOf(t) < 0).length;
    const winRate = total ? (wins / total) * 100 : 0;

    const strategies = new Map<string, { count: number; pnl: number }>();
    const markets = new Map<string, number>();
    for (const t of rows) {
        const strategy = (t.strategy as string) || "Unknown";
        const market = (t.market as string) || "Unknown";
        const s = strategies.get(strategy) || { count: 0, pnl: 0 };
        s.count += 1;
        s.pnl += pnlOf(t);
        strategies.set(strategy, s);
        markets.set(market, (markets.get(market) || 0) + 1);
    }

    const topStrategies = [...strategies.entries()].sort((a, b) => b[1].pnl - a[1].pnl).slice(0, 5);
    const recent = [...rows].sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))).slice(0, maxRecent);

    const recentLines = recent.map(
        (t) => `${t.date || "?"}->${exitDateOf(t)} ${symbolOf(t)} ${t.strategy || "?"} PnL=${pnlOf(t).toFixed(2)}`
    );
    const strategyLines = topStrategies.map(([name, data]) => `${name}: ${data.count} trades, PnL ${data.pnl.toFixed(2)}`);
    const marketLines = [...markets.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => `${name}: ${count}`);

    return [
        `Trades=${total}, Wins=${wins}, Losses=${losses}, WinRate=${winRate.toFixed(1)}%, TotalPnL=${totalPnl.toFixed(2)}`,
        "Markets: " + marketLines.slice(0, 6).join("; "),
        "Top strategies: " + strategyLines.join("; "),
        "Recent trades: " + recentLines.join(" | "),
    ].join("\n");
}
