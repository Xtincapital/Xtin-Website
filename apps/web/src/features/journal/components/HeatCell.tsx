// One heatmap box and the Loss ← → Profit legend, shared by every Journal
// heatmap (Heatmaps page, Calendar) so they all read the same way: a five-step
// green / red scale (journal.css --heat-*), the amount in bold with the trade
// count under it, and a dashed "—" box where there were no trades.
import { cn } from "@/lib/utils";
import { heatCellStyle } from "../lib/journalPatternHelpers";

interface HeatCellProps {
  pnl: number;
  trades: number;
  maxAbs: number;
  /** Small label above the amount (e.g. "Jan"). */
  label?: React.ReactNode;
  /** Formatted amount, e.g. "₹12.4K". */
  amount: string;
  title?: string;
  onClick?: () => void;
  className?: string;
}

export default function HeatCell({ pnl, trades, maxAbs, label, amount, title, onClick, className }: HeatCellProps) {
  if (!trades) {
    return (
      <div
        className={cn(
          "flex min-h-[4.5rem] flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed text-center text-muted-foreground/70",
          className,
        )}
        aria-label={typeof label === "string" ? `${label}: no trades` : "No trades"}
      >
        {label && <span className="text-xs font-bold">{label}</span>}
        <span className="text-sm">—</span>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={heatCellStyle(pnl, maxAbs)}
      className={cn(
        "flex min-h-[4.5rem] flex-col items-center justify-center gap-0.5 rounded-xl p-2 text-center shadow-[inset_0_0_0_1px_var(--heat-line)]",
        "transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:z-10 hover:scale-[1.05] hover:shadow-[0_12px_28px_-10px_rgb(0_0_0/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {label && <span className="text-xs font-bold opacity-75">{label}</span>}
      <span className="text-sm font-bold tabular-nums tracking-[-0.01em]">{amount}</span>
      <span className="text-xs tabular-nums opacity-75">
        {trades} trade{trades === 1 ? "" : "s"}
      </span>
    </button>
  );
}

/** Loss ← five red steps · five green steps → Profit */
export function HeatLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)} aria-hidden="true">
      <span>Loss</span>
      <span className="flex gap-0.5">
        {[5, 4, 3, 2, 1].map((l) => (
          <span key={`n${l}`} className="h-2.5 w-3.5 rounded-[3px]" style={{ background: `var(--heat-n${l})` }} />
        ))}
        {[1, 2, 3, 4, 5].map((l) => (
          <span key={`p${l}`} className="h-2.5 w-3.5 rounded-[3px]" style={{ background: `var(--heat-p${l})` }} />
        ))}
      </span>
      <span>Profit</span>
    </div>
  );
}
