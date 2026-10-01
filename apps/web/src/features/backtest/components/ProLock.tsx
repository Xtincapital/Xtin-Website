// Shows a blurred preview of a Pro-only view with an unlock card on top.
import { Link } from "react-router-dom";
import { Crown } from "lucide-react";

export default function ProLock({ locked, title, text, children, className = "" }: { locked: boolean; title: string; text: string; children: React.ReactNode; className?: string }) {
  if (!locked) return <>{children}</>;
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <div aria-hidden className="pointer-events-none select-none blur-[5px] saturate-50">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/40 p-4 backdrop-blur-[1px] dark:bg-slate-950/40">
        <div className="max-w-xs rounded-2xl border border-amber-200 bg-white/95 p-5 text-center shadow-xl dark:border-amber-400/20 dark:bg-slate-900/95">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/30">
            <Crown className="h-5 w-5 text-white" />
          </span>
          <div className="mt-3 font-semibold">{title}</div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{text}</p>
          <Link
            to="/backtest/app/upgrade"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400"
          >
            <Crown className="h-3.5 w-3.5" /> Unlock with Pro
          </Link>
        </div>
      </div>
    </div>
  );
}
