import { Lock } from "lucide-react";

/** Small "PRO" tag for locked options in lists, tabs and buttons. */
export default function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md pro-gold-bg px-1.5 py-px text-xs font-extrabold uppercase tracking-wider ${className}`}>
      <Lock className="h-2.5 w-2.5" /> Pro
    </span>
  );
}
