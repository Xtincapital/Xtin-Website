// The Journal's stat card: label + icon on top, the figure, and one line of
// context under it ("2 trades · 14 Oct", "78% of days") so a number never
// stands alone. Lifts on hover (journal.css `.jr-stat`).
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import RollingNumber from "@/components/motion/RollingNumber";
import { cn } from "@/lib/utils";

type Tone = "pos" | "neg";

interface StatCardProps {
  label: React.ReactNode;
  value: string;
  icon?: LucideIcon;
  /** Colours the figure green (pos) or red (neg); omit for plain ink. */
  tone?: Tone;
  /** One line of context under the figure. */
  sub?: React.ReactNode;
  /** Adds a coloured dot before the context line. */
  subTone?: Tone;
  /** A word or label rather than a number ("Confident", "13 Oct"): no rolling digits. */
  word?: boolean;
  /** Makes the figure a button (e.g. "see these trades"). */
  onClick?: () => void;
  className?: string;
}

const toneText = (t?: Tone) => (t === "pos" ? "text-brand" : t === "neg" ? "text-destructive" : "text-foreground");

export default function StatCard({ label, value, icon: Icon, tone, sub, subTone, word, onClick, className }: StatCardProps) {
  return (
    <Card className={cn("jr-stat", className)}>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1 text-xs font-bold text-muted-foreground">{label}</div>
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden="true" />}
        </div>
        {(() => {
          const figure = word ? (
            <p className={cn("truncate text-2xl font-semibold leading-tight tracking-[-0.02em]", toneText(tone))}>{value}</p>
          ) : (
            <p className={cn("stat-value font-semibold", toneText(tone))}>
              <RollingNumber value={value} />
            </p>
          );
          return onClick ? (
            <button type="button" onClick={onClick} className="block max-w-full cursor-pointer text-left hover:underline">
              {figure}
            </button>
          ) : (
            figure
          );
        })()}
        {sub != null && sub !== "" && (
          <p className="mt-1.5 flex items-center gap-1.5 truncate text-xs tabular-nums text-muted-foreground">
            {subTone && (
              <span
                className={cn("h-1.5 w-1.5 shrink-0 rounded-full", subTone === "pos" ? "bg-brand" : "bg-destructive")}
                aria-hidden="true"
              />
            )}
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
