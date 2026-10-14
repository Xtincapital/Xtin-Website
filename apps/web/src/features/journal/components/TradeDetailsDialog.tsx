// Everything about one trade, opened by clicking its row on the Trades page.
// The table itself only carries the columns used to scan and analyse trades
// (date, asset, size, entry/exit, P&L, result); the rest lives here.
import type { ReactNode } from "react";
import { Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";
import type { Trade } from "../lib/api";
import { formatMoney } from "../lib/tradeForm";
import { marketLabel } from "../lib/journalPatternHelpers";
import { tradeInCurrency } from "../lib/tradesInInr";

const dash = <span className="text-muted-foreground">-</span>;

function fmtDate(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">{children}</dl>
    </section>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm font-medium tabular-nums">{children ?? dash}</dd>
    </div>
  );
}

type Fmt = (v: number | null | undefined) => string | null;

/** All of a trade's fields, laid out in sections. `money` formats a price/amount in whatever currency the trade is shown in. */
export function TradeDetailsBody({ trade, money, convertedPnl }: { trade: Trade; money: Fmt; convertedPnl?: string | null }) {
  const pnl = trade.pnl;
  const result = pnl == null ? "Open" : pnl > 0 ? "Win" : pnl < 0 ? "Loss" : "Breakeven";
  const resultClass = pnl == null ? "text-muted-foreground" : pnl > 0 ? "text-brand dark:text-brand" : pnl < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground";
  const hasOption = !!(trade.contract || trade.strike_price != null || trade.option_type || trade.underlying_price != null || trade.implied_volatility != null || trade.days_to_expiry != null);

  return (
    <div className="space-y-5">
      <Section title="Result">
        <Field label="Outcome">
          <span className={resultClass}>{result}</span>
        </Field>
        <Field label="Net P&L">
          <span className={resultClass}>{money(pnl)}</span>
        </Field>
        {convertedPnl != null && <Field label="In your currency">{convertedPnl}</Field>}
        <Field label="Brokerage / fees">{money(trade.brokerage)}</Field>
        <Field label="Strategy">{trade.strategy}</Field>
        <Field label="Emotion" className="capitalize">{trade.emotion}</Field>
      </Section>

      <Section title="Position">
        <Field label="Side" className="uppercase">{trade.buy_sell || "buy"}</Field>
        <Field label="Quantity">{trade.quantity != null ? trade.quantity.toLocaleString() : null}</Field>
        <Field label="Entry price">{money(trade.entry_price)}</Field>
        <Field label="Exit price">{money(trade.exit_price)}</Field>
        <Field label="Stop loss">{money(trade.stop_loss)}</Field>
        <Field label="Target">{money(trade.target_price)}</Field>
        <Field label="Margin">{money(trade.margin)}</Field>
        <Field label="Market">{trade.market ? marketLabel(trade.market) : null}</Field>
        <Field label="Trade type">{trade.type}</Field>
      </Section>

      <Section title="Timing">
        <Field label="Entry date">{fmtDate(trade.date)}</Field>
        <Field label="Exit date">{fmtDate(trade.exit_date)}</Field>
        <Field label="Time zone">{trade.time_zone}</Field>
        <Field label="Entry time">{trade.entry_time}</Field>
        <Field label="Exit time">{trade.exit_time}</Field>
      </Section>

      {hasOption && (
        <Section title="Option / contract">
          <Field label="Contract">{trade.contract}</Field>
          <Field label="Type" className="capitalize">{trade.option_type}</Field>
          <Field label="Strike price">{money(trade.strike_price)}</Field>
          <Field label="Underlying price">{money(trade.underlying_price)}</Field>
          <Field label="Implied volatility">{trade.implied_volatility != null ? `${trade.implied_volatility}%` : null}</Field>
          <Field label="Days to expiry">{trade.days_to_expiry}</Field>
        </Section>
      )}

      {(trade.notes || (trade.tags && trade.tags.length > 0)) && (
        <section className="space-y-2">
          <h3 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">Notes</h3>
          {trade.notes && <p className="whitespace-pre-wrap text-sm">{trade.notes}</p>}
          {trade.tags && trade.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {trade.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

interface Props {
  trade: Trade | null;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
  onLogAgain: (trade: Trade) => void;
}

export default function TradeDetailsDialog(props: Props) {
  return props.trade ? <OpenTradeDetails {...props} trade={props.trade} /> : null;
}

function OpenTradeDetails({ trade, onClose, onEdit, onLogAgain }: Props & { trade: Trade }) {
  const { currency: displayCurrency, formatCurrency } = useCurrency();

  const own = String(trade.currency || "INR").toUpperCase();
  const money: Fmt = (v) => (v == null ? null : formatMoney(v, own));
  const pnl = trade.pnl;
  const resultClass = pnl == null ? "text-muted-foreground" : pnl > 0 ? "text-brand dark:text-brand" : pnl < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground";
  const converted = own !== displayCurrency && pnl != null ? tradeInCurrency(trade, displayCurrency).pnl : null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {trade.asset}
            <Badge variant={trade.buy_sell === "sell" ? "destructive" : "default"} className="uppercase">
              {trade.buy_sell || "buy"}
            </Badge>
            <span className={cn("text-sm font-semibold tabular-nums", resultClass)}>{money(pnl) ?? "Open"}</span>
          </DialogTitle>
          <DialogDescription>
            {[fmtDate(trade.date), trade.market && marketLabel(trade.market), trade.type, `Logged in ${own}`].filter(Boolean).join(" · ")}
          </DialogDescription>
        </DialogHeader>

        <TradeDetailsBody trade={trade} money={money} convertedPnl={converted != null ? formatCurrency(converted, { maxDecimals: 2 }) : null} />

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onLogAgain(trade)}>
            <Plus className="mr-2 h-4 w-4" />
            Log again
          </Button>
          <Button onClick={() => onEdit(trade)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit trade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
