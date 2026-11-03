// Test helper: the broker tradebook CSV for a set of executions, as the Import dialog and backfill read it.
import type { BrokerFill } from "./types.js";

/** A broker tradebook CSV for these executions, as the Import dialog and backfill read them. */
export function statementCsv(fills: BrokerFill[]): Buffer {
    const place = (seg: string | null) => (seg === "NSEFO" ? ["NFO", "FO"] : seg === "MCXFO" ? ["MCX", "COM"] : ["NSE", "EQ"]);
    const lines = ["Trade Date,Trade Time,Symbol,Exchange,Segment,Buy/Sell,Quantity,Price,Trade ID,Product,Brokerage"];
    for (const f of fills) {
        const [exchange, segment] = place(f.segment);
        lines.push([f.tradedAt.slice(0, 10), f.tradedAt.slice(11, 19), f.symbol, exchange, segment, f.side, f.quantity, f.price, f.executionId, f.product ?? "", f.charges ?? ""].join(","));
    }
    return Buffer.from(lines.join("\n"));
}
