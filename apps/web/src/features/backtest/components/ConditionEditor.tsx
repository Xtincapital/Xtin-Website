import { Plus, X } from "lucide-react";
import type { Condition, ConditionGroup, Operand } from "../lib/types";
import { INDICATORS, FIELDS, OPERATORS, emptyCondition } from "../lib/types";

const control =
  "rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100";

const OP_LABEL: Record<string, string> = { ">": ">", "<": "<", ">=": "≥", "<=": "≤", "==": "=", crosses_above: "crosses above", crosses_below: "crosses below" };

function OperandEditor({ operand, onChange }: { operand: Operand; onChange: (o: Operand) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <select
        className={control}
        value={operand.kind}
        aria-label="Operand type"
        onChange={(e) => {
          const kind = e.target.value as Operand["kind"];
          if (kind === "indicator") onChange({ kind: "indicator", indicator: "RSI", period: 14 });
          else if (kind === "field") onChange({ kind: "field", field: "close" });
          else onChange({ kind: "value", value: 0 });
        }}
      >
        <option value="indicator">Indicator</option>
        <option value="field">Price / volume</option>
        <option value="value">Number</option>
      </select>

      {operand.kind === "indicator" && (
        <>
          <select className={`${control} font-semibold`} value={operand.indicator} aria-label="Indicator" onChange={(e) => onChange({ ...operand, indicator: e.target.value })}>
            {INDICATORS.map((i) => (
              <option key={i} value={i}>
                {i.replace("_", " ")}
              </option>
            ))}
          </select>
          {!["MACD", "VWAP"].includes(operand.indicator) && (
            <input
              type="number"
              min={1}
              className={`${control} w-20 tabular-nums`}
              placeholder="period"
              aria-label="Period"
              value={operand.period ?? ""}
              onChange={(e) => onChange({ ...operand, period: e.target.value ? Number(e.target.value) : null })}
            />
          )}
        </>
      )}

      {operand.kind === "field" && (
        <select className={control} value={operand.field} aria-label="Price field" onChange={(e) => onChange({ ...operand, field: e.target.value })}>
          {FIELDS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      )}

      {operand.kind === "value" && (
        <input
          type="number"
          className={`${control} w-24 tabular-nums`}
          aria-label="Value"
          value={operand.value}
          onChange={(e) => onChange({ ...operand, value: e.target.value === "" ? "" : Number(e.target.value) })}
        />
      )}
    </div>
  );
}

export default function ConditionGroupEditor({ group, onChange, emptyText }: { group: ConditionGroup; onChange: (g: ConditionGroup) => void; emptyText: string }) {
  return (
    <div>
      {group.conditions.length > 1 && (
        <div className="mb-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          Trigger when
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-white/5">
            {(["all", "any"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChange({ ...group, match: m })}
                className={`rounded-md px-2.5 py-1 font-semibold transition ${group.match === m ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : ""}`}
              >
                {m === "all" ? "ALL match" : "ANY matches"}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-2">
        {group.conditions.map((c, i) => (
          <div key={i}>
            {i > 0 && <div className="my-1 pl-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{group.match === "any" ? "or" : "and"}</div>}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 dark:border-white/10 dark:bg-white/[0.02]">
              <OperandEditor operand={c.left} onChange={(left) => onChange({ ...group, conditions: group.conditions.map((x, j) => (j === i ? { ...c, left } : x)) })} />
              <select
                className={`${control} font-semibold text-emerald-700 dark:text-emerald-300`}
                value={c.op}
                aria-label="Comparison"
                onChange={(e) => onChange({ ...group, conditions: group.conditions.map((x, j) => (j === i ? { ...c, op: e.target.value as Condition["op"] } : x)) })}
              >
                {OPERATORS.map((op) => (
                  <option key={op} value={op}>
                    {OP_LABEL[op]}
                  </option>
                ))}
              </select>
              <OperandEditor operand={c.right} onChange={(right) => onChange({ ...group, conditions: group.conditions.map((x, j) => (j === i ? { ...c, right } : x)) })} />
              <button
                type="button"
                onClick={() => onChange({ ...group, conditions: group.conditions.filter((_, j) => j !== i) })}
                className="ml-auto rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                aria-label="Remove condition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {group.conditions.length === 0 && <p className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-400 dark:border-white/10">{emptyText}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange({ ...group, conditions: [...group.conditions, emptyCondition()] })}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
      >
        <Plus className="h-4 w-4" /> Add condition
      </button>
    </div>
  );
}
