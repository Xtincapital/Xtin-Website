// Small shared components for the dashboard's money sections: tone chip,
// icon tile, progress bar, and a link that handles both routes and #anchors.

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Car, GraduationCap, Heart, Home, Plane, ShieldCheck, Sunset, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "../../lib/money";
import { CHIP, TONE } from "./styles";

export function Chip({ tone, className, children }: { tone: Tone; className?: string; children: ReactNode }) {
  return <span className={cn(CHIP, TONE[tone].chip, className)}>{children}</span>;
}

export function IconTile({ tone = "good", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", TONE[tone].soft, TONE[tone].text, className)}>
      {children}
    </span>
  );
}

/** Bar that grows to `pct` (0–100). */
export function Progress({ pct, tone, className }: { pct: number; tone: Tone; className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-secondary", className)}>
      <div className={cn("xd-grow h-full rounded-full", TONE[tone].fill)} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

const GOAL_ICONS: Record<string, typeof Target> = {
  Education: GraduationCap,
  Wedding: Heart,
  "Home Purchase": Home,
  Car,
  Retirement: Sunset,
  Vacation: Plane,
  "Emergency Fund": ShieldCheck,
};

/** The icon for a Gini goal category (goalCategories.ts), a target otherwise. */
export function GoalIcon({ category, size = 20 }: { category: string | null; size?: number }) {
  const Icon = GOAL_ICONS[category || ""] ?? Target;
  return <Icon size={size} aria-hidden="true" />;
}

/** Green text link with an arrow; `#id` hrefs scroll on this page, others route. */
export function GoLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const cls = cn("inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-brand hover:underline", className);
  const arrow = <ArrowRight size={15} aria-hidden="true" />;
  if (href.startsWith("#")) {
    return (
      <a href={href} className={cls}>
        {children}
        {arrow}
      </a>
    );
  }
  return (
    <Link to={href} className={cls}>
      {children}
      {arrow}
    </Link>
  );
}
