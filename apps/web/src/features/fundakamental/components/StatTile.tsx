// One summary number (Watchlist, Portfolio, Scanner): label, soft icon tile,
// big tabular value and an optional hint line underneath.
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CARD, ICON_TILE } from "../lib/ui";

interface Props {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  /** Colour class for the value, e.g. text-brand / text-destructive. */
  tone?: string;
  hint?: ReactNode;
}

export default function StatTile({ label, value, icon: Icon, tone = "text-foreground", hint }: Props) {
  return (
    <div className={`${CARD} p-5`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="xt-label">{label}</p>
        <span className={`${ICON_TILE} !h-8 !w-8 !rounded-lg`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className={`text-2xl font-bold leading-tight tabular-nums ${tone}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
