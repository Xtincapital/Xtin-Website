// Gold marks for Pro features, used site-wide. A feature you haven't unlocked
// shows a gold lock; once the plan is active it shows a gold crown, so Pro
// looks like Pro after purchase too.
import { Crown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/** Small gold icon: a lock while locked, a crown once unlocked. */
export function ProIcon({ unlocked = false, className }: { unlocked?: boolean; className?: string }) {
  const Icon = unlocked ? Crown : Lock;
  return <Icon className={cn("pro-gold-text", className)} aria-label={unlocked ? "Pro feature (unlocked)" : "Pro feature"} />;
}

/** Gold "PRO" pill. */
export function ProPill({ className, label = "Pro" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "pro-gold-bg inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase leading-none tracking-wider",
        className,
      )}
    >
      <Crown className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}

export default ProPill;
