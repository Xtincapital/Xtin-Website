// Small Gini chart pieces from the approved concept (2026-10-15): score ring,
// goal progress rows and a two-part split bar. Drawn on Motion with site
// tokens only, so they follow light/dark mode like chartTheme does.
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CHIP_GOLD } from "../lib/ui";

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Circular 0–100 gauge, e.g. the Health Score tile. */
export function ScoreRing({ value, size = 44, className }: { value: number; size?: number; className?: string }) {
  const reduce = useReducedMotion();
  const r = 16;
  const C = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const good = value >= 60;
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden="true">
      <circle cx="20" cy="20" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
      <motion.circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke={good ? "rgb(var(--brand))" : "var(--pro-gold)"}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={C}
        transform="rotate(-90 20 20)"
        initial={reduce ? false : { strokeDashoffset: C }}
        animate={{ strokeDashoffset: C * (1 - pct) }}
        transition={{ duration: 1.1, ease: EASE }}
      />
    </svg>
  );
}

interface ProgressRowProps {
  name: string;
  /** Small muted text after the name, e.g. "by 2031". */
  meta?: string;
  saved: string;
  target: string;
  /** 0–100. */
  percent: number;
  /** Gold bar + "Behind" chip. */
  behind?: boolean;
  delay?: number;
}

/** One goal: name, saved / target, and a filling bar. */
export function ProgressRow({ name, meta, saved, target, percent, behind, delay = 0 }: ProgressRowProps) {
  const reduce = useReducedMotion();
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1.5">
      <div className="flex min-w-0 items-center gap-2 font-semibold text-foreground">
        <span className="truncate">{name}</span>
        {meta && <span className="shrink-0 text-xs font-medium text-muted-foreground">{meta}</span>}
        {behind && <span className={CHIP_GOLD}>Behind</span>}
      </div>
      <div className="text-sm tabular-nums text-muted-foreground">
        <b className="font-semibold text-foreground">{saved}</b> / {target}
      </div>
      <div className="col-span-2 h-2.5 overflow-hidden rounded-full border border-border bg-secondary">
        <motion.div
          className={cn("h-full rounded-full", behind ? "bg-[var(--pro-gold)]" : "bg-brand-fill")}
          style={{ width: `${p}%`, transformOrigin: "left" }}
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, ease: EASE, delay }}
        />
      </div>
    </div>
  );
}

/** Two-part bar (e.g. assets vs liabilities), green then red. */
export function SplitBar({ a, b, className }: { a: number; b: number; className?: string }) {
  const reduce = useReducedMotion();
  const total = a + b;
  const pa = total > 0 ? (a / total) * 100 : 0;
  return (
    <div className={cn("flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-secondary", className)} aria-hidden="true">
      <motion.span
        className="h-full rounded-full bg-brand-fill"
        initial={reduce ? false : { width: 0 }}
        animate={{ width: `${pa}%` }}
        transition={{ duration: 1, ease: EASE }}
      />
      {b > 0 && (
        <motion.span
          className="h-full flex-1 rounded-full bg-destructive/80"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        />
      )}
    </div>
  );
}
