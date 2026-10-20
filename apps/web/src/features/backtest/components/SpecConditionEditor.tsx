// Edits one condition group of a Strategy Spec v1: indicators with their
// parameters and lines, every operator (incl. between / rising / falling), and
// one level of nested groups. Same look as the legacy ConditionEditor.
import { Plus, X } from "lucide-react";
import {
  INDICATOR_META,
  LINE_LABEL,
  PARAM_LABEL,
  SPEC_OPS,
  emptyCondition,
  indicator,
  isGroup,
  isRef,
  items,
  matchOf,
  withItems,
  type IndicatorName,
  type PriceField,
  type SpecCondition,
  type SpecGroup,
  type SpecOp,
  type SpecOperand,
} from "../lib/spec";

const control =
  "rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand-line dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100";

const FIELDS: PriceField[] = ["close", "open", "high", "low", "volume"];

function NumberInput({ value, onChange, label, width = "w-20", step }: { value: number | undefined; onChange: (v: number | undefined) => void; label: string; width?: string; step?: string }) {
  return (
    <input
      type="number"
      step={step ?? "any"}
      className={`${control} ${width} tabular-nums`}
      aria-label={label}
      placeholder={label}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
    />
  );
}

function OperandEditor({ operand, onChange, intraday }: { operand: SpecOperand; onChange: (o: SpecOperand) => void; intraday: boolean }) {
  const kind = typeof operand === "number" ? "value" : "field" in operand ? "field" : "indicator";
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <select
        className={control}
        value={kind}
        aria-label="Operand type"
        onChange={(e) => {
          const k = e.target.value;
          onChange(k === "indicator" ? indicator("RSI") : k === "field" ? { field: "close" } : 0);
        }}
      >
        <option value="indicator">Indicator</option>
        <option value="field">Price / volume</option>
        <option value="value">Number</option>
      </select>

      {isRef(operand) && (
        <>
          <select className={`${control} font-semibold`} value={operand.ind} aria-label="Indicator" onChange={(e) => onChange(indicator(e.target.value as IndicatorName))}>
            {(Object.keys(INDICATOR_META) as IndicatorName[]).map((name) => (
              <option key={name} value={name} disabled={INDICATOR_META[name].intradayOnly && !intraday}>
                {INDICATOR_META[name].label}
                {INDICATOR_META[name].intradayOnly && !intraday ? " (intraday)" : ""}
              </option>
            ))}
          </select>
          {INDICATOR_META[operand.ind].params.map((p) => (
            <NumberInput
              key={p}
              label={PARAM_LABEL[p]}
              width={p === "mult" ? "w-16" : "w-20"}
              step={p === "mult" ? "0.1" : "1"}
              value={operand[p] ?? INDICATOR_META[operand.ind].defaults[p]}
              onChange={(v) => onChange({ ...operand, [p]: v })}
            />
          ))}
          {INDICATOR_META[operand.ind].lines && (
            <select className={control} aria-label="Line" value={operand.line ?? INDICATOR_META[operand.ind].defaults.line} onChange={(e) => onChange({ ...operand, line: e.target.value as typeof operand.line })}>
              {INDICATOR_META[operand.ind].lines!.map((l) => (
                <option key={l} value={l}>
                  {LINE_LABEL[l]}
                </option>
              ))}
            </select>
          )}
        </>
      )}

      {typeof operand === "object" && "field" in operand && (
        <select className={control} value={operand.field} aria-label="Price field" onChange={(e) => onChange({ field: e.target.value as PriceField })}>
          {FIELDS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      )}

      {typeof operand === "number" && <NumberInput label="Value" width="w-24" value={operand} onChange={(v) => onChange(v ?? 0)} />}
    </div>
  );
}

function ConditionRow({ c, onChange, onRemove, intraday }: { c: SpecCondition; onChange: (c: SpecCondition) => void; onRemove: () => void; intraday: boolean }) {
  const setOp = (op: SpecOp) => {
    if (op === "between") onChange({ left: c.left, op, low: c.low ?? 40, high: c.high ?? 60 });
    else if (op === "rising" || op === "falling") onChange({ left: c.left, op, bars: c.bars ?? 3 });
    else onChange({ left: c.left, op, right: c.right ?? 0 });
  };
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 dark:border-white/10 dark:bg-white/[0.02]">
      <OperandEditor operand={c.left} intraday={intraday} onChange={(left) => onChange({ ...c, left })} />
      <select className={`${control} font-semibold text-brand dark:text-brand`} value={c.op} aria-label="Comparison" onChange={(e) => setOp(e.target.value as SpecOp)}>
        {SPEC_OPS.map(({ op, label }) => (
          <option key={op} value={op}>
            {label}
          </option>
        ))}
      </select>
      {c.op === "between" ? (
        <>
          <OperandEditor operand={c.low ?? 0} intraday={intraday} onChange={(low) => onChange({ ...c, low })} />
          <span className="text-xs font-semibold text-slate-400">and</span>
          <OperandEditor operand={c.high ?? 0} intraday={intraday} onChange={(high) => onChange({ ...c, high })} />
        </>
      ) : c.op === "rising" || c.op === "falling" ? (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <NumberInput label="bars" width="w-16" step="1" value={c.bars} onChange={(bars) => onChange({ ...c, bars })} /> bars
        </span>
      ) : (
        <OperandEditor operand={c.right ?? 0} intraday={intraday} onChange={(right) => onChange({ ...c, right })} />
      )}
      <button type="button" onClick={onRemove} className="ml-auto rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" aria-label="Remove condition">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function MatchToggle({ group, onChange }: { group: SpecGroup; onChange: (g: SpecGroup) => void }) {
  const match = matchOf(group);
  return (
    <div className="mb-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
      Trigger when
      <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-white/5">
        {(["all", "any"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => m !== match && onChange(m === "all" ? { all: items(group) } : { any: items(group) })}
            className={`rounded-md px-2.5 py-1 font-semibold transition ${match === m ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : ""}`}
          >
            {m === "all" ? "ALL match" : "ANY matches"}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SpecConditionEditor({
  group,
  onChange,
  emptyText,
  intraday,
  depth = 0,
}: {
  group: SpecGroup;
  onChange: (g: SpecGroup) => void;
  emptyText: string;
  intraday: boolean;
  depth?: number;
}) {
  const list = items(group);
  const set = (next: (SpecCondition | SpecGroup)[]) => onChange(withItems(group, next));
  const joiner = matchOf(group) === "any" ? "or" : "and";
  return (
    <div>
      {list.length > 1 && <MatchToggle group={group} onChange={onChange} />}
      <div className="space-y-2">
        {list.map((n, i) => (
          <div key={i}>
            {i > 0 && <div className="my-1 pl-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{joiner}</div>}
            {isGroup(n) ? (
              <div className="rounded-xl border border-dashed border-brand-line p-3">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Group
                  <button type="button" onClick={() => set(list.filter((_, j) => j !== i))} className="rounded-lg p-1 text-slate-400 hover:text-rose-600" aria-label="Remove group">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <SpecConditionEditor group={n} depth={depth + 1} intraday={intraday} emptyText="Empty group" onChange={(g) => set(list.map((x, j) => (j === i ? g : x)))} />
              </div>
            ) : (
              <ConditionRow c={n} intraday={intraday} onChange={(c) => set(list.map((x, j) => (j === i ? c : x)))} onRemove={() => set(list.filter((_, j) => j !== i))} />
            )}
          </div>
        ))}
        {list.length === 0 && <p className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-400 dark:border-white/10">{emptyText}</p>}
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => set([...list, emptyCondition()])}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand transition hover:bg-brand-soft dark:text-brand dark:hover:bg-brand-hover"
        >
          <Plus className="h-4 w-4" /> Add condition
        </button>
        {depth === 0 && (
          <button
            type="button"
            onClick={() => set([...list, matchOf(group) === "all" ? { any: [emptyCondition()] } : { all: [emptyCondition()] }])}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
          >
            <Plus className="h-4 w-4" /> Add {matchOf(group) === "all" ? "an OR" : "an AND"} group
          </button>
        )}
      </div>
    </div>
  );
}
