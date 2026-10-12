// The (i) button on the Dashboard that shows how a journal holding trades in
// several currencies was added up: each trade's money is converted to the
// currency the visitor selected, then summed; this lists the trades per
// original currency so nothing is hidden by the conversion.
import { useMemo } from "react";
import InfoTip from "@/components/ui/info-tip";
import { useCurrency } from "@/contexts/CurrencyContext";
import { convert } from "@/lib/region";
import type { Trade } from "../lib/api";

export function CurrencyBreakdown({ trades }: { trades: Trade[] }) {
  const { formatCurrency, currency } = useCurrency();

  const rows = useMemo(() => {
    const byCurrency = new Map<string, { count: number; pnl: number }>();
    for (const t of trades) {
      const c = String(t.currency || "INR").toUpperCase();
      const row = byCurrency.get(c) ?? { count: 0, pnl: 0 };
      row.count += 1;
      row.pnl += t.pnl ?? 0;
      byCurrency.set(c, row);
    }
    return [...byCurrency.entries()].sort((a, b) => b[1].count - a[1].count);
  }, [trades]);

  if (rows.length === 0) return null;
  const mixed = rows.length > 1;
  const totalConverted = rows.reduce((sum, [c, r]) => sum + convert(r.pnl, c, currency), 0);

  return (
    <InfoTip title={mixed ? "Trades in different currencies" : "Currency of your trades"} widthClass="w-80" label="Currency breakdown of your trades">
      <p>
        {mixed
          ? `Your journal has trades in ${rows.length} currencies. Each trade's money is first converted to ${currency} (today's rate), then added up, so every number on this page is in ${currency}.`
          : `All your trades are in ${rows[0][0]}. Totals here are shown in ${currency}.`}
      </p>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-foreground">
            <th className="py-1 pr-2 font-medium">Currency</th>
            <th className="py-1 pr-2 text-right font-medium">Trades</th>
            <th className="py-1 pr-2 text-right font-medium">P&amp;L (original)</th>
            {mixed && <th className="py-1 text-right font-medium">In {currency}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(([c, r]) => (
            <tr key={c} className="border-t border-border">
              <td className="py-1 pr-2 font-medium text-foreground">{c}</td>
              <td className="py-1 pr-2 text-right tabular-nums">{r.count.toLocaleString()}</td>
              <td className="py-1 pr-2 text-right tabular-nums">{formatCurrency(r.pnl, { currency: c, maxDecimals: 0 })}</td>
              {mixed && <td className="py-1 text-right tabular-nums">{formatCurrency(convert(r.pnl, c, currency), { maxDecimals: 0 })}</td>}
            </tr>
          ))}
          {mixed && (
            <tr className="border-t border-border text-foreground">
              <td className="py-1 pr-2 font-semibold">Total</td>
              <td className="py-1 pr-2 text-right font-semibold tabular-nums">{trades.length.toLocaleString()}</td>
              <td />
              <td className="py-1 text-right font-semibold tabular-nums">{formatCurrency(totalConverted, { maxDecimals: 0 })}</td>
            </tr>
          )}
        </tbody>
      </table>
    </InfoTip>
  );
}

export default CurrencyBreakdown;
