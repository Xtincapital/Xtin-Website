import { Lock } from "lucide-react";

/** Small "PRO" tag for locked options in lists, tabs and buttons. */
export default function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md bg-gradient-to-r from-amber-400 to-orange-500 px-1.5 py-px text-[9px] font-extrabold uppercase tracking-wider text-white ${className}`}>
      <Lock className="h-2.5 w-2.5" /> Pro
    </span>
  );
}
