// "Show me the trades behind this number." A dialog listing the trades that
// make up a heatmap cell, calendar day, hour, emotion, ... with a summary on
// top; click a trade to expand every detail of it. Trades passed in are the
// rupee-converted ones every analysis page works on; money is shown in the
// visitor's selected currency.
import { useEffect, useState } from "react";
import { ChevronDown, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";
import type { Trade } from "../lib/api";
import { TradeDetailsBody } from "./TradeDetailsDialog";

export interface DrilldownRequest {
  title: string;
  /** One line under the title, e.g. "Monthly heatmap · 2026". */
  subtitle?: string;
  trades: Trade[];
}

export default function TradeDrilldown({ request, onClose }: { request: DrilldownRequest | null; onClose: () => void }) {
  const { formatInr } = useCurrency();
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => setOpenId(null), [request]);

  const trades = request?.trades ?? [];
  const sorted = [...trades].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const closed = trades.filter((t) => t.pnl != null);
  const net = trades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const wins = closed.filter((t) => (t.pnl ?? 0) > 0).length;
  const losses = closed.filter((t) => (t.pnl ?? 0) < 0).length;
  const winRate = closed.length ? (wins / closed.length) * 100 : 0;
  const money = (v: number | null | undefined) => (v == null ? null : formatInr(v, { maxDecimals: 2 }));

  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{request?.title}</DialogTitle>
          <DialogDescription>{request?.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-4">
          <Summary label="Trades" value={String(trades.length)} />
          <Summary label="Net P&L" value={formatInr(net)} tone={net > 0 ? "good" : net < 0 ? "bad" : undefined} />
          <Summary label="Win rate" value={closed.length ? `${winRate.toFixed(0)}%` : "-"} />
          <Summary label="Wins / losses" value={`${wins} / ${losses}`} />
        </div>

        {trades.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No trades here.</p>
        ) : (
          <ul className="space-y-2">
            {sorted.map((trade) => {
              const open = openId === trade.id;
              const positive = (trade.pnl ?? 0) >= 0;
              return (
                <li key={trade.id} className="overflow-hidden rounded-lg border">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : trade.id)}
                    className="flex w-full items-center justify-between gap-3 p-3 text-left transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 truncate text-sm font-semibold text-foreground">
                        {trade.asset}
                        <Badge variant={trade.buy_sell === "sell" ? "destructive" : "default"} className="px-1.5 py-0 text-[10px] uppercase">
                          {trade.buy_sell || "buy"}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {[
                          new Date(trade.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }),
                          trade.entry_time,
                          trade.strategy,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={cn("flex items-center gap-1 text-sm font-semibold tabular-nums", trade.pnl == null ? "text-muted-foreground" : positive ? "text-success" : "text-destructive")}>
                        {trade.pnl == null ? null : positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {trade.pnl == null ? "Open" : formatInr(trade.pnl, { maxDecimals: 2 })}
                      </span>
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true" />
                    </div>
                  </button>
                  {open && (
                    <div className="border-t bg-muted/20 p-4">
                      <TradeDetailsBody trade={trade} money={money} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Summary({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("truncate text-sm font-bold tabular-nums", tone === "good" && "text-success", tone === "bad" && "text-destructive")}>{value}</p>
    </div>
  );
}
