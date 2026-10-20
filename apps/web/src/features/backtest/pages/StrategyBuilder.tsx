import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProBadge from "../components/ProBadge";
import { usePlan } from "../lib/usePlan";
import { showProRequired, useProDialog } from "../lib/proDialog";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Crosshair, DoorOpen, LayoutTemplate, LogIn, Save, ShieldCheck, Sparkles } from "lucide-react";
import BacktestLayout from "../components/BacktestLayout";
import PageHeader from "../components/PageHeader";
import SpecConditionEditor from "../components/SpecConditionEditor";
import { ApiError } from "../lib/api";
import { rulesOnly, v1 } from "../lib/v1";
import { emptySpec, parseInstrumentId, type LevelRule, type SizingMode, type Spec, type Timeframe, type TrailRule } from "../lib/spec";
import { btnPrimary, btnSecondary, card, chip, input, label, muted } from "../lib/styles";

const TIMEFRAMES: Timeframe[] = ["1m", "5m", "15m", "1h", "1d"];
const TF_LABEL: Record<string, string> = { "1m": "1 min", "5m": "5 min", "15m": "15 min", "1h": "1 hour", "1d": "Daily" };

const SIZING_MODES: { id: SizingMode; label: string; unit: string; fallback: number; field: string }[] = [
  { id: "pct_equity", label: "% of equity", unit: "%", fallback: 50, field: "Percent" },
  { id: "fixed_amount", label: "₹ per trade", unit: "₹", fallback: 50000, field: "Rupees" },
  { id: "fixed_qty", label: "Shares", unit: "qty", fallback: 1, field: "Shares" },
  { id: "risk_pct", label: "% risked", unit: "%", fallback: 1, field: "Risk per trade" },
];

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

/** Stop-loss / target: off, a percent, rupee points, or an ATR multiple. */
function LevelField({ text, value, types, onChange }: { text: string; value: LevelRule | TrailRule | null; types: ("pct" | "points" | "atr")[]; onChange: (v: LevelRule | null) => void }) {
  const type = value?.type ?? "off";
  return (
    <div className="block">
      <span className={label}>{text}</span>
      <div className="flex gap-1.5">
        <select
          className={`${input} !w-auto !px-2`}
          aria-label={`${text} type`}
          value={type}
          onChange={(e) => {
            const t = e.target.value;
            onChange(t === "off" ? null : { type: t as LevelRule["type"], value: value?.value ?? (t === "atr" ? 2 : t === "points" ? 10 : 2), ...(t === "atr" ? { len: 14 } : {}) });
          }}
        >
          <option value="off">Off</option>
          {types.includes("pct") && <option value="pct">%</option>}
          {types.includes("points") && <option value="points">₹ pts</option>}
          {types.includes("atr") && <option value="atr">× ATR</option>}
        </select>
        {value && (
          <input
            type="number"
            step="0.1"
            min={0}
            className={`${input} tabular-nums`}
            aria-label={`${text} value`}
            value={value.value}
            onChange={(e) => onChange({ ...value, value: Number(e.target.value) || 0 })}
          />
        )}
      </div>
      {value?.type === "atr" && (
        <label className={`mt-1 flex items-center gap-1.5 text-xs ${muted}`}>
          ATR length
          <input type="number" min={1} className={`${input} !w-16 !py-1 tabular-nums`} value={value.len ?? 14} onChange={(e) => onChange({ ...value, len: Math.max(1, Math.trunc(Number(e.target.value) || 14)) })} />
        </label>
      )}
    </div>
  );
}

/** Symbol box with suggestions from the instrument search. */
function InstrumentPicker({ id, onChange }: { id: string; onChange: (id: string) => void }) {
  const { exchange, symbol } = parseInstrumentId(id);
  const [focused, setFocused] = useState(false);
  const [q, setQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQ(symbol), 250);
    return () => clearTimeout(t);
  }, [symbol]);
  const search = useQuery({ queryKey: ["bt-instruments", q], queryFn: () => v1.instruments(q), enabled: focused && q.length > 0, staleTime: 5 * 60_000 });
  const suggestions = (search.data?.data ?? []).filter((i) => i.id !== id);
  return (
    <>
      <label className="relative block">
        <span className={label}>Symbol</span>
        <input
          className={`${input} font-semibold uppercase`}
          value={symbol}
          maxLength={20}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onChange={(e) => onChange(`${exchange}:${e.target.value.toUpperCase().replace(/[^A-Z0-9&.^-]/g, "")}`)}
          aria-autocomplete="list"
        />
        {focused && suggestions.length > 0 && (
          <ul className={`${card} absolute z-20 mt-1 max-h-64 w-72 overflow-auto p-1 text-sm`} role="listbox">
            {suggestions.map((i) => (
              <li key={i.id}>
                <button type="button" className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-white/5" onMouseDown={() => onChange(i.id)}>
                  <span>
                    <span className="font-semibold">{i.symbol}</span> <span className={`text-xs ${muted}`}>{i.name}</span>
                  </span>
                  <span className={`text-xs ${muted}`}>{i.segment === "EQ" ? i.exchange : i.segment}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </label>
      <label className="block">
        <span className={label}>Exchange</span>
        <select className={input} value={exchange} onChange={(e) => onChange(`${e.target.value}:${symbol}`)}>
          {["NSE", "BSE", "NASDAQ", "NYSE"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
    </>
  );
}

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function StrategyBuilder() {
  const { id } = useParams();
  const isEdit = id !== undefined;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { locked } = usePlan();
  const intradayLocked = locked("intraday");

  const [name, setName] = useState("");
  const [spec, setSpec] = useState<Spec>(emptySpec());
  const [error, setError] = useState<string[] | null>(null);

  const existing = useQuery({ queryKey: ["bt-strategy", id], queryFn: () => v1.getStrategy(id as string), enabled: isEdit });
  const templates = useQuery({ queryKey: ["bt-templates"], queryFn: v1.templates, enabled: !isEdit, staleTime: 60 * 60_000 });

  useEffect(() => {
    if (existing.data?.spec) {
      setName(existing.data.name);
      setSpec(existing.data.spec);
    }
  }, [existing.data]);

  // Debounce the JSON, not the object: a fresh object every render would re-arm the timer forever.
  const draft = useDebounced(JSON.stringify(rulesOnly({ ...spec, name: name.trim() || "Untitled strategy" })), 400);
  const validation = useQuery({ queryKey: ["bt-validate", draft], queryFn: () => v1.validate(JSON.parse(draft) as Spec), placeholderData: keepPreviousData, staleTime: 60_000 });
  const check = validation.data;

  const save = useMutation({
    mutationFn: () => {
      const body = { name: name.trim(), spec: rulesOnly({ ...spec, name: name.trim() }) };
      return isEdit ? v1.addVersion(id as string, body) : v1.createStrategy(body);
    },
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ["bt-strategies"] });
      qc.invalidateQueries({ queryKey: ["bt-strategy", id] });
      toast.success(isEdit ? `Saved as version ${s.version}` : "Strategy saved", { action: { label: "Backtest it", onClick: () => navigate(`/backtest/app/strategies/${s.id}/run`) } });
      navigate("/backtest/app/strategies");
    },
    onError: (err) => {
      const list = err instanceof ApiError ? (err.errors?.length ? err.errors : [err.message]) : ["Failed to save"];
      setError(list);
      if (!showProRequired(err)) toast.error(list[0]);
    },
  });

  const patch = (p: Partial<Spec>) => setSpec((s) => ({ ...s, ...p }));
  const patchExit = (p: Partial<Spec["exit"]>) => setSpec((s) => ({ ...s, exit: { ...s.exit, ...p } }));

  function onSave() {
    const problems = [!name.trim() && "Give your strategy a name.", !parseInstrumentId(spec.instrument.id).symbol && "Pick a symbol, e.g. RELIANCE (SAMPLE gives synthetic demo data)."].filter(Boolean) as string[];
    const all = problems.length ? problems : check && !check.valid ? check.errors : [];
    setError(all.length ? all : null);
    if (all.length) toast.error(all[0]); // the summary card can be below the fold on small screens
    else save.mutate();
  }

  if (isEdit && existing.isLoading) {
    return (
      <BacktestLayout>
        <div className={`${card} h-96 animate-pulse`} />
      </BacktestLayout>
    );
  }
  if (isEdit && (existing.isError || (existing.data && !existing.data.spec))) {
    return (
      <BacktestLayout>
        <p className="text-rose-600">Couldn't load this strategy{existing.data?.errors?.length ? `: ${existing.data.errors.join("; ")}` : "."}</p>
      </BacktestLayout>
    );
  }

  const timeframe = spec.instrument.timeframe;
  const intraday = timeframe !== "1d";
  const sizing = SIZING_MODES.find((m) => m.id === spec.sizing.mode) ?? SIZING_MODES[0];

  return (
    <BacktestLayout>
      <Link to="/backtest/app/strategies" className={`mb-4 inline-flex items-center gap-1.5 text-sm ${muted} hover:text-slate-900 dark:hover:text-white`}>
        <ArrowLeft className="h-4 w-4" /> Strategies
      </Link>
      <PageHeader
        eyebrow="Strategy builder"
        title={isEdit ? "Edit strategy" : "Build a strategy"}
        description={
          isEdit
            ? `Saving keeps every earlier version — this is version ${existing.data?.version ?? 1}${existing.data?.legacy ? " (saved before versioning)" : ""}.`
            : "Define exactly when to get in, how much to trade, and when to get out. Every rule is tested bar by bar on historical candles."
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          {!isEdit && (templates.data?.data.length ?? 0) > 0 && (
            <section className={`${card} p-5 sm:p-6`}>
              <h2 className="flex items-center gap-2 font-semibold">
                <LayoutTemplate className="h-4 w-4 text-brand dark:text-brand" /> Start from a template
              </h2>
              <p className={`mt-1 text-sm ${muted}`}>A starting point to edit — not a recommendation.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {templates.data!.data.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    title={t.description}
                    onClick={() => {
                      setSpec({ ...emptySpec(), ...t.spec, exit: { ...emptySpec().exit, stop_loss: null, ...t.spec.exit } });
                      setName(t.name);
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-left text-sm transition hover:border-brand-line hover:bg-brand-soft dark:border-white/10"
                  >
                    <span className="block font-semibold">{t.name}</span>
                    <span className={`block text-xs ${muted}`}>{t.category}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <Section n={1} icon={Crosshair} title="Market" hint="What you trade, and the candle size the rules look at.">
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
              <label className="block sm:col-span-3">
                <span className={label}>Strategy name</span>
                <input className={input} value={name} maxLength={160} onChange={(e) => setName(e.target.value)} placeholder="e.g. RSI dip buyer" />
              </label>
              <InstrumentPicker id={spec.instrument.id} onChange={(instrumentId) => patch({ instrument: { ...spec.instrument, id: instrumentId, segment: undefined } })} />
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
                            : patch({ instrument: { ...spec.instrument, timeframe: t }, execution: { ...spec.execution, product: undefined, square_off: t === "1d" ? null : (spec.execution?.square_off ?? "15:15") } })}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition aria-disabled:opacity-40 ${timeframe === t ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : muted}`}
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
                {intraday && " This strategy uses one — you can save it, but running it needs Pro."}
                <Link to="/backtest/app/upgrade" className="font-semibold underline">
                  See Pro
                </Link>
              </p>
            )}
            <p className={`mt-3 text-xs ${muted}`}>
              <b>SAMPLE</b> is generated demo data — its results are synthetic, not market results. Real symbols pull live history; intraday data only goes back ~60 days (1-minute: ~7 days).
            </p>
          </Section>

          <Section n={2} icon={LogIn} title="Entry" hint="When these conditions are true on a candle's close, the order fills at the next candle's open.">
            <SpecConditionEditor group={spec.entry.when} intraday={intraday} onChange={(when) => patch({ entry: { ...spec.entry, when } })} emptyText="No entry rule yet — add one to start." />
          </Section>

          <Section n={3} icon={Sparkles} title="Position" hint="Direction and size of each trade. Size is worked out again at every fill price, and capped by the cash in the account.">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <span className={label}>Direction</span>
                <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/5">
                  {(["long", "short"] as const).map((side) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => patch({ entry: { ...spec.entry, side } })}
                      className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${spec.entry.side === side ? (side === "long" ? "bg-sky-600 text-white shadow-sm" : "bg-violet-600 text-white shadow-sm") : muted}`}
                    >
                      {side === "long" ? "Long (buy)" : "Short (sell)"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className={label}>Size each trade by</span>
                <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/5">
                  {SIZING_MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={spec.sizing.mode === m.id}
                      onClick={() => spec.sizing.mode !== m.id && patch({ sizing: { mode: m.id, value: m.fallback } })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${spec.sizing.mode === m.id ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : muted}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block w-36">
                <span className={label}>{sizing.field}</span>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={spec.sizing.mode === "fixed_qty" ? 1 : "any"}
                    className={`${input} pr-10 tabular-nums`}
                    value={spec.sizing.value}
                    onChange={(e) => patch({ sizing: { ...spec.sizing, value: Number(e.target.value) || 0 } })}
                  />
                  <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs ${muted}`}>{sizing.unit}</span>
                </div>
              </label>
            </div>
            {spec.sizing.mode === "risk_pct" && <p className={`mt-3 text-xs ${muted}`}>Shares = (equity × risk %) ÷ distance to the stop-loss — set a stop-loss below.</p>}
          </Section>

          <Section n={4} icon={DoorOpen} title="Exit" hint="Close the position when any of these is true — or leave empty and rely on stops, targets and time.">
            <SpecConditionEditor
              group={spec.exit.when ?? { any: [] }}
              intraday={intraday}
              onChange={(when) => patchExit({ when: "all" in when ? (when.all.length ? when : null) : when.any.length ? when : null })}
              emptyText="No exit signal — stops, targets, time exit or square-off will close trades."
            />
            <label className={`mt-4 flex flex-wrap items-center gap-2 text-sm ${muted}`}>
              <input type="checkbox" checked={Boolean(spec.exit.time_exit)} onChange={(e) => patchExit({ time_exit: e.target.checked ? { bars: 10 } : null })} />
              Exit after
              <input
                type="number"
                min={1}
                disabled={!spec.exit.time_exit}
                className={`${input} !w-20 !py-1 tabular-nums`}
                value={spec.exit.time_exit?.bars ?? 10}
                onChange={(e) => patchExit({ time_exit: { bars: Math.max(1, Math.trunc(Number(e.target.value) || 1)) } })}
              />
              bars held
            </label>
          </Section>

          <Section n={5} icon={ShieldCheck} title="Risk management" hint="Checked intrabar; a stop the open gaps through fills at the open, and the stop is checked before the target.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <LevelField text="Stop-loss" types={["pct", "points", "atr"]} value={spec.exit.stop_loss} onChange={(stop_loss) => patchExit({ stop_loss })} />
              <LevelField text="Target" types={["pct", "points", "atr"]} value={spec.exit.target} onChange={(target) => patchExit({ target })} />
              <LevelField text="Trailing stop" types={["pct", "atr"]} value={spec.exit.trailing_stop} onChange={(t) => patchExit({ trailing_stop: t as TrailRule | null })} />
              <label className="block">
                <span className={label}>Square-off</span>
                <input
                  className={`${input} tabular-nums`}
                  placeholder={intraday ? "15:15" : "daily — n/a"}
                  disabled={!intraday}
                  value={intraday ? (spec.execution?.square_off ?? "") : ""}
                  onChange={(e) => patch({ execution: { ...spec.execution, square_off: e.target.value || null } })}
                />
              </label>
            </div>
          </Section>
        </div>

        {/* live summary — written by the server's validator, not computed here */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative overflow-hidden rounded-2xl bg-[#131417] p-5 text-white shadow-xl shadow-slate-900/10 brand-on-dark">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-soft blur-3xl" />
            <div className="relative xt-eyebrow">Your rule, in words</div>
            <p className="relative mt-3 text-sm leading-relaxed text-slate-100" aria-live="polite">
              {check?.valid ? check.summary : check ? "Fix the issues below to see the summary." : "Checking your rule…"}
            </p>
            {check && !check.valid && (
              <ul className="relative mt-3 space-y-1 rounded-xl bg-amber-500/15 px-3 py-2 text-xs text-amber-100">
                {check.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
            {check?.valid && (check.warnings?.length ?? 0) > 0 && (
              <ul className="relative mt-3 space-y-1 text-xs text-slate-300">
                {check.warnings!.map((w) => (
                  <li key={w}>· {w}</li>
                ))}
              </ul>
            )}
            {check?.valid && check.spec_hash && (
              <div className="relative mt-3 flex flex-wrap gap-1.5">
                <span className={`${chip} !bg-white/10 !text-slate-200`}>fingerprint {check.spec_hash.slice(0, 8)}</span>
                {check.estimate && <span className={`${chip} !bg-white/10 !text-slate-200`}>{check.estimate.credits} credit per run</span>}
              </div>
            )}
            {error && (
              <ul className="relative mt-4 space-y-1 rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200">
                {error.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
            <button onClick={onSave} disabled={save.isPending} className={`${btnPrimary} relative mt-5 w-full`}>
              <Save className="h-4 w-4" />
              {save.isPending ? "Saving…" : isEdit ? "Save as new version" : "Save strategy"}
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
