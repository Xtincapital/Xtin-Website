import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Crown, Infinity as InfinityIcon, Lock, Minus, RefreshCcw, ShieldCheck, Sparkles } from "lucide-react";
import BacktestLayout from "../components/BacktestLayout";
import PageHeader from "../components/PageHeader";
import { backtestApi } from "../lib/api";
import { btnPrimary, btnSecondary, card, muted } from "../lib/styles";
import { inr } from "../lib/types";

type RazorpayCtor = new (options: Record<string, unknown>) => { open: () => void };
const razorpay = (): RazorpayCtor | undefined => (window as any).Razorpay;

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (razorpay()) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// Keep in step with services/api/modules/backtest/plans.ts (free limits are
// env-configurable there; these are the defaults).
const COMPARE: [string, string | boolean, string | boolean][] = [
  ["Backtests (chat + saved-strategy runs)", "25 / month", "Unlimited"],
  ["Candles", "Daily", "1m · 5m · 15m · 1h · daily"],
  ["History you can test", "Last 2 years", "Full history"],
  ["Saved strategies", "3", "Unlimited"],
  ["Options: straddle, strangle, iron condor", false, true],
  ["AI parser for free-form ideas", false, true],
  ["Drawdown chart, monthly heatmap, trade analytics", false, true],
  ["Core report: return, Sharpe, drawdown %, equity curve, trade log", true, true],
  ["NSE, BSE & NASDAQ stocks and indices", true, true],
];

const Cell = ({ v }: { v: string | boolean }) =>
  typeof v === "string" ? <span className="font-semibold">{v}</span> : v ? <Check className="mx-auto h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <Minus className="mx-auto h-4 w-4 text-slate-300 dark:text-slate-600" />;

export default function Upgrade() {
  const qc = useQueryClient();
  const passes = useQuery({ queryKey: ["bt-passes"], queryFn: backtestApi.passes });
  const plan = useQuery({ queryKey: ["bt-plan"], queryFn: backtestApi.plan });
  const [busy, setBusy] = useState<string | null>(null);

  async function buy(passId: string) {
    setBusy(passId);
    try {
      const order = await backtestApi.createPassOrder(passId);
      const Razorpay = (await loadRazorpay()) ? razorpay() : undefined;
      if (!Razorpay) throw new Error("Could not load the secure checkout. Check your connection.");

      const rzp = new Razorpay({
        key: order.key_id,
        order_id: order.order.id,
        amount: order.order.amount,
        currency: order.order.currency,
        name: "Xtin Backtest",
        description: `${order.pass.label} — ${order.pass.days} days of Pro`,
        theme: { color: "#059669" },
        handler: async (response: Record<string, string>) => {
          try {
            const res = await backtestApi.verifyPass({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (!res.success) throw new Error("Verification failed");
            toast.success("You're Pro! Unlimited backtests unlocked.");
            await qc.invalidateQueries({ queryKey: ["bt-plan"] });
          } catch {
            toast.error("Payment succeeded but we couldn't confirm it yet. It will activate automatically within a few minutes — contact support with your payment ID if it doesn't.", { duration: 20000 });
          } finally {
            setBusy(null);
          }
        },
        modal: { ondismiss: () => setBusy(null) },
      });
      rzp.open();
    } catch (err) {
      setBusy(null);
      toast.error(err instanceof Error ? err.message : "Unable to start checkout. Please try again.");
    }
  }

  const p = plan.data;
  const list = passes.data?.passes ?? [];
  const cheapestPerDay = Math.min(...list.map((x) => x.amount_paise / x.days));

  return (
    <BacktestLayout>
      <PageHeader eyebrow="Xtin Backtest Pro" title="Backtest without limits" description="One-time passes — pay once, no auto-renew, no subscription to cancel. Buying again while active adds the days on top of what you have left." />

      {p && (
        <div className={`${card} mb-6 flex flex-wrap items-center justify-between gap-3 p-4`}>
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${p.tier === "pro" ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-slate-100 dark:bg-white/10"}`}>
              {p.tier === "pro" ? <Crown className="h-5 w-5 text-white" /> : <Lock className="h-5 w-5 text-slate-500" />}
            </span>
            <div>
              <div className="text-sm font-semibold">{p.tier === "pro" ? (p.trial ? "Pro trial active" : "Pro pass active") : "Free plan"}</div>
              <div className={`text-xs ${muted}`}>
                {p.tier === "pro"
                  ? `Unlimited until ${p.expires_at ? new Date(p.expires_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}`
                  : `${p.backtests_used ?? 0} of ${p.backtests_limit} chat backtests used this month`}
              </div>
            </div>
          </div>
          {p.tier !== "pro" && p.backtests_limit ? (
            <div className="h-2 w-48 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${Math.min(100, ((p.backtests_used ?? 0) / p.backtests_limit) * 100)}%` }} />
            </div>
          ) : null}
        </div>
      )}

      {passes.isError && <p className="text-rose-600">Couldn't load pricing. Please refresh.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {list.map((x, i) => {
          const featured = x.tag === "POPULAR";
          const perDay = x.amount_paise / 100 / x.days;
          return (
            <motion.div
              key={x.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative flex flex-col rounded-2xl p-5 ${featured ? "border border-emerald-400/70 bg-gradient-to-b from-[#10233a] to-[#0a1120] text-white shadow-[0_18px_50px_-12px_rgba(16,185,129,0.45)] lg:-my-2 lg:py-7" : card}`}
            >
              {x.tag && (
                <span className={`absolute -top-3 left-5 rounded-full px-3 py-0.5 text-[11px] font-bold tracking-wider ${featured ? "bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-900" : "bg-amber-400 text-slate-900"}`}>{x.tag}</span>
              )}
              <div className={`text-sm font-semibold ${featured ? "text-emerald-300" : ""}`}>{x.label}</div>
              <div className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums">{inr(x.amount_paise / 100)}</div>
              <div className={`mt-1 text-xs ${featured ? "text-slate-400" : muted}`}>
                {x.days} days · <span className="tabular-nums">{inr(perDay)}</span>/day
              </div>
              {x.amount_paise / x.days === cheapestPerDay && <div className="mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Lowest per-day price</div>}
              <button
                onClick={() => void buy(x.id)}
                disabled={busy !== null}
                className={`${featured ? btnPrimary : btnSecondary} mt-auto w-full !mt-5`}
              >
                {busy === x.id ? "Opening checkout…" : p?.tier === "pro" && !p.trial ? "Add days" : "Get pass"}
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className={`${card} overflow-hidden`}>
          <table className="w-full text-sm">
            <thead className={`bg-slate-50 text-[11px] uppercase tracking-wider dark:bg-white/[0.03] ${muted}`}>
              <tr>
                <th className="px-5 py-3 text-left font-semibold">What you get</th>
                <th className="w-32 px-3 py-3 text-center font-semibold">Free</th>
                <th className="w-32 px-3 py-3 text-center font-semibold text-emerald-700 dark:text-emerald-400">Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([feature, free, pro]) => (
                <tr key={feature} className="border-t border-slate-100 dark:border-white/5">
                  <td className="px-5 py-3">{feature}</td>
                  <td className="px-3 py-3 text-center">
                    <Cell v={free} />
                  </td>
                  <td className="bg-emerald-50/40 px-3 py-3 text-center dark:bg-emerald-500/5">
                    <Cell v={pro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="space-y-3 text-sm">
          {[
            { icon: ShieldCheck, title: "Secure Razorpay checkout", text: "UPI, cards and netbanking. We never see your card details." },
            { icon: RefreshCcw, title: "No auto-renew", text: "Passes simply end. Buy again only if you want more days." },
            { icon: InfinityIcon, title: "Days stack", text: "Renew early and the new days start when the current pass ends." },
            { icon: Sparkles, title: "Pro the moment you pay", text: "Your pass activates instantly — even if your browser closes mid-checkout." },
          ].map(({ icon: Icon, title, text }) => (
            <li key={title} className={`${card} flex gap-3 p-4`}>
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <div className="font-semibold">{title}</div>
                <div className={`text-xs ${muted}`}>{text}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className={`mt-8 text-xs ${muted}`}>Prices in INR, inclusive of applicable taxes. Backtests are simulations on historical data; past results don't guarantee future returns.</p>
    </BacktestLayout>
  );
}
