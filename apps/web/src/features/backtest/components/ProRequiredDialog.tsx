import { useNavigate } from "react-router-dom";
import { Check, Crown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useProDialog, type ProReason } from "../lib/proDialog";
import { usePlan } from "../lib/usePlan";

const COPY: Record<ProReason, { title: string; tried: string; fallback: string }> = {
  quota: { title: "You've reached this month's free backtests", tried: "You tried to run another backtest.", fallback: "The free plan includes a monthly number of backtests." },
  options: { title: "Options strategies are a Pro feature", tried: "You tried to backtest an options structure (straddle, strangle or iron condor).", fallback: "Options backtests need a Pro pass." },
  intraday: { title: "Intraday candles are a Pro feature", tried: "You tried to use minute or hourly candles.", fallback: "The free plan backtests on daily candles." },
  full_history: { title: "Longer history is a Pro feature", tried: "You tried to test further back than the free plan allows.", fallback: "The free plan tests recent history only." },
  unlimited_strategies: { title: "You've saved the maximum free strategies", tried: "You tried to save another strategy.", fallback: "Delete one to make room, or go Pro for unlimited." },
  advanced_analytics: { title: "Advanced analytics are a Pro feature", tried: "You tried to open the drawdown chart or detailed analytics.", fallback: "Pro unlocks the full report." },
  ai: { title: "The AI parser is a Pro feature", tried: "You tried to describe a free-form idea for the AI to build.", fallback: "The free plan uses the rule-based parser." },
};

export default function ProRequiredDialog() {
  const { open, reason, message, close } = useProDialog();
  const navigate = useNavigate();
  const { plan } = usePlan();
  const c = COPY[reason];
  const historyYears = plan?.history_days ? Math.round(plan.history_days / 365) : 2;
  const included = [
    `${plan?.backtests_limit ?? 25} backtests a month`,
    "Daily candles on NSE, BSE & NASDAQ stocks and indices",
    `The last ${historyYears} year${historyYears === 1 ? "" : "s"} of history`,
    `${plan?.saved_strategies_limit ?? 3} saved strategies`,
    "Core report: return, Sharpe, drawdown %, equity curve, trade log",
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-md rounded-2xl border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/30">
            <Crown className="h-5 w-5 text-white" />
          </span>
          <div>
            <DialogTitle className="text-lg font-bold leading-snug">{c.title}</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {c.tried} {message || c.fallback}
            </DialogDescription>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-white/5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Your free plan includes</div>
          <ul className="space-y-1.5">
            {included.map((i) => (
              <li key={i} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                {i}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button onClick={close} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">
            Not now
          </button>
          <button
            onClick={() => {
              close();
              navigate("/backtest/app/upgrade");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400"
          >
            <Crown className="h-4 w-4" /> See Pro passes
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
