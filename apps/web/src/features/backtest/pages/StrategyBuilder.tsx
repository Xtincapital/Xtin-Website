import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProBadge from "../components/ProBadge";
import { usePlan } from "../lib/usePlan";
import { showProRequired, useProDialog } from "../lib/proDialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Crosshair, DoorOpen, LogIn, Save, ShieldCheck, Sparkles } from "lucide-react";
import BacktestLayout from "../components/BacktestLayout";
import PageHeader from "../components/PageHeader";
import ConditionGroupEditor from "../components/ConditionEditor";
import { ApiError, backtestApi } from "../lib/api";
import { strategySentence } from "../lib/analytics";
import { btnPrimary, btnSecondary, card, input, label, muted } from "../lib/styles";
import { type StrategyDefinition, emptyDefinition, TIMEFRAMES } from "../lib/types";

const TF_LABEL: Record<string, string> = { "1m": "1 min", "5m": "5 min", "15m": "15 min", "1h": "1 hour", "1d": "Daily" };

function Section({ n, icon: Icon, title, hint, children }: { n: number; icon: typeof Crosshair; title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className={`${card} p-5 sm:p-6`}>
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-900 brand-on-dark">{n}</span>
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            <Icon className="h-4 w-4 text-brand dark:text-brand" /> {title}
          </h2>
          <p className={`text-sm ${muted}`}>{hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function PctField({ text, value, onChange }: { text: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <label className="block">
      <span className={label}>{text}</span>
      <div className="relative">
        <input type="number" step="0.1" min={0} className={`${input} pr-8 tabular-nums`} placeholder="off" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />
        <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm ${muted}`}>%</span>
      </div>
    </label>
  );
}

/** Client-side check so the user gets a precise message instead of a server validation error. */
function problems(name: string, d: StrategyDefinition): string | null {
  if (!name.trim()) return "Give your strategy a name.";
  if (!d.instrument.symbol.trim()) return "Pick a symbol (or SAMPLE for offline demo data).";
  if (!d.entry.conditions.length) return "Add at least one entry condition.";
  const all = [...d.entry.conditions, ...d.exit.conditions];
  if (all.some((c) => [c.left, c.right].some((o) => o.kind === "value" && (o.value === "" || Number.isNaN(Number(o.value)))))) return "Fill in every number in your conditions.";
  if (d.risk.square_off_time && !/^\d{1,2}:\d{2}$/.test(d.risk.square_off_time)) return "Square-off time must look like 15:15.";
  return null;
}

export default function StrategyBuilder() {
  const { id } = useParams();
  const isEdit = id !== undefined;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { locked } = usePlan();
  const intradayLocked = locked("intraday");

  const [name, setName] = useState("");
  const [def, setDef] = useState<StrategyDefinition>(emptyDefinition());
  const [error, setError] = useState<string | null>(null);

  const existing = useQuery({ queryKey: ["bt-strategy", id], queryFn: () => backtestApi.getStrategy(id as string), enabled: isEdit });

  useEffect(() => {
    if (existing.data) {
      const base = emptyDefinition();
      const d = existing.data.definition;
      setName(existing.data.name);
      // Fill any part a saved strategy omits so every control has a value.
      setDef({
        instrument: { ...base.instrument, ...d.instrument },
        entry: { match: d.entry?.match ?? "all", conditions: d.entry?.conditions ?? [] },
        entry_action: { ...base.entry_action, ...d.entry_action },
        exit: { match: d.exit?.match ?? "any", conditions: d.exit?.conditions ?? [] },
        risk: { ...base.risk, ...d.risk },
      });
    }
  }, [existing.data]);

  const save = useMutation({
    mutationFn: () => (isEdit ? backtestApi.updateStrategy(id as string, { name, definition: def }) : backtestApi.createStrategy({ name, definition: def })),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ["bt-strategies"] });
      qc.invalidateQueries({ queryKey: ["bt-strategy", id] });
      toast.success(isEdit ? "Strategy updated" : "Strategy saved", { action: { label: "Backtest it", onClick: () => navigate(`/backtest/app/strategies/${s.id}/run`) } });
      navigate("/backtest/app/strategies");
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Failed to save";
      setError(msg);
      if (!showProRequired(err)) toast.error(msg);
    },
  });

  const patch = (p: Partial<StrategyDefinition>) => setDef((d) => ({ ...d, ...p }));

  function onSave() {
    const p = problems(name, def);
    setError(p);
    if (p) toast.error(p); // the summary card can be below the fold on small screens
    else save.mutate();
  }

  if (isEdit && existing.isLoading) {
    return (
      <BacktestLayout>
        <div className={`${card} h-96 animate-pulse`} />
      </BacktestLayout>
    );
  }
  if (isEdit && existing.isError) {
    return (
      <BacktestLayout>
        <p className="text-rose-600">Couldn't load this strategy.</p>
      </BacktestLayout>
    );
  }

  const intraday = def.instrument.timeframe !== "1d";

  return (
    <BacktestLayout>
      <Link to="/backtest/app/strategies" className={`mb-4 inline-flex items-center gap-1.5 text-sm ${muted} hover:text-slate-900 dark:hover:text-white`}>
        <ArrowLeft className="h-4 w-4" /> Strategies
      </Link>
      <PageHeader eyebrow="Strategy builder" title={isEdit ? "Edit strategy" : "Build a strategy"} description="Define exactly when to get in, how much to trade, and when to get out. Every rule is tested bar by bar on historical candles." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Section n={1} icon={Crosshair} title="Market" hint="What you trade, and the candle size the rules look at.">
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
              <label className="block sm:col-span-3">
                <span className={label}>Strategy name</span>
                <input className={input} value={name} maxLength={160} onChange={(e) => setName(e.target.value)} placeholder="e.g. RSI dip buyer" />
              </label>
              <label className="block">
                <span className={label}>Symbol</span>
                <input className={`${input} font-semibold uppercase`} value={def.instrument.symbol} maxLength={20} onChange={(e) => patch({ instrument: { ...def.instrument, symbol: e.target.value.toUpperCase() } })} />
              </label>
              <label className="block">
                <span className={label}>Exchange</span>
                <select className={input} value={def.instrument.exchange} onChange={(e) => patch({ instrument: { ...def.instrument, exchange: e.target.value } })}>
                  {[...new Set(["NSE", "BSE", "NASDAQ", "NYSE", def.instrument.exchange])].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <div>
                <span className={label}>Timeframe</span>
                <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/5">
                  {TIMEFRAMES.map((t) => {
                    const lockedTf = intradayLocked && t !== "1d";
                    return (
                      <button
                        key={t}
                        type="button"
                        aria-disabled={lockedTf}
                        onClick={() =>
                          lockedTf
                            ? useProDialog.getState().show("intraday", `${TF_LABEL[t]} candles need a Pro pass — the free plan backtests on daily candles.`)
                            : patch({ instrument: { ...def.instrument, timeframe: t }, risk: { ...def.risk, square_off_time: t === "1d" ? null : def.risk.square_off_time ?? "15:15" } })}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition aria-disabled:opacity-40 ${def.instrument.timeframe === t ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : muted}`}
                        title={lockedTf ? `${TF_LABEL[t]} candles are a Pro feature` : TF_LABEL[t]}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            {intradayLocked && (
              <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                <ProBadge /> Intraday candles (1m–1h) are a Pro feature.
                {def.instrument.timeframe !== "1d" && " This strategy uses one — you can save it, but running it needs Pro."}
                <Link to="/backtest/app/upgrade" className="font-semibold underline">
                  See Pro
                </Link>
              </p>
            )}
            <p className={`mt-3 text-xs ${muted}`}>
              Use <b>SAMPLE</b> for instant offline demo data. Real symbols pull live history — intraday data only goes back ~60 days (1-minute: ~7 days).
            </p>
          </Section>

          <Section n={2} icon={LogIn} title="Entry" hint="Open a position when these conditions are true on a candle's close.">
            <ConditionGroupEditor group={def.entry} onChange={(entry) => patch({ entry })} emptyText="No entry rule yet — add one to start." />
          </Section>

          <Section n={3} icon={Sparkles} title="Position" hint="Direction and size of each trade.">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <span className={label}>Direction</span>
                <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/5">
                  {(["BUY", "SELL"] as const).map((side) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => patch({ entry_action: { ...def.entry_action, side } })}
                      className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${def.entry_action.side === side ? (side === "BUY" ? "bg-sky-600 text-white shadow-sm" : "bg-violet-600 text-white shadow-sm") : muted}`}
                    >
                      {side === "BUY" ? "Long (buy)" : "Short (sell)"}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block w-36">
                <span className={label}>Quantity</span>
                <input type="number" min={1} className={`${input} tabular-nums`} value={def.entry_action.qty} onChange={(e) => patch({ entry_action: { ...def.entry_action, qty: Math.max(1, Number(e.target.value) || 1) } })} />
              </label>
            </div>
          </Section>

          <Section n={4} icon={DoorOpen} title="Exit" hint="Close the position when any of these is true — or leave empty and rely on stops and targets.">
            <ConditionGroupEditor group={def.exit} onChange={(exit) => patch({ exit })} emptyText="No exit signal — stops, targets or square-off will close trades." />
          </Section>

          <Section n={5} icon={ShieldCheck} title="Risk management" hint="Checked intrabar; the stop is always checked before the target.">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <PctField text="Stop-loss" value={def.risk.stop_loss_pct} onChange={(v) => patch({ risk: { ...def.risk, stop_loss_pct: v } })} />
              <PctField text="Target" value={def.risk.target_pct} onChange={(v) => patch({ risk: { ...def.risk, target_pct: v } })} />
              <PctField text="Trailing stop" value={def.risk.trailing_sl_pct} onChange={(v) => patch({ risk: { ...def.risk, trailing_sl_pct: v } })} />
              <label className="block">
                <span className={label}>Square-off</span>
                <input
                  className={`${input} tabular-nums`}
                  placeholder={intraday ? "15:15" : "daily — n/a"}
                  disabled={!intraday}
                  value={intraday ? def.risk.square_off_time ?? "" : ""}
                  onChange={(e) => patch({ risk: { ...def.risk, square_off_time: e.target.value || null } })}
                />
              </label>
            </div>
          </Section>
        </div>

        {/* live summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative overflow-hidden rounded-2xl bg-[#131417] p-5 text-white shadow-xl shadow-slate-900/10 brand-on-dark">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-soft blur-3xl" />
            <div className="relative xt-eyebrow">Your rule, in words</div>
            <p className="relative mt-3 text-base leading-relaxed text-slate-100">{strategySentence(def)}</p>
            {error && <p className="relative mt-4 rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200">{error}</p>}
            <button onClick={onSave} disabled={save.isPending} className={`${btnPrimary} relative mt-5 w-full`}>
              <Save className="h-4 w-4" />
              {save.isPending ? "Saving…" : isEdit ? "Save changes" : "Save strategy"}
            </button>
            <Link to="/backtest/app/strategies" className={`${btnSecondary} relative mt-2 w-full !border-white/10 !bg-white/5 !text-slate-200`}>
              Cancel
            </Link>
          </div>
        </aside>
      </div>
    </BacktestLayout>
  );
}
