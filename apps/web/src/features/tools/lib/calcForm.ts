// Shared keyboard + chart behaviour for the tools calculators.
//
// `useCalcForm(onCalculate)` returns props to spread on the element that wraps
// a calculator's inputs:
//   - Enter moves to the next input; Enter on the last input runs `onCalculate`.
//   - Inputs that re-format as you type ("1,24,400") keep the caret where the
//     user is editing instead of jumping to the end.
import { useCallback, useRef } from "react";
import type { KeyboardEvent, FormEvent } from "react";

const FIELD_SELECTOR =
  'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([disabled]):not([readonly]), select:not([disabled])';

const countNonComma = (s: string) => s.replace(/,/g, "").length;

// Index in `value` at which `n` non-comma characters precede the caret.
const indexAfterChars = (value: string, n: number) => {
  let seen = 0;
  for (let i = 0; i < value.length; i++) {
    if (seen >= n) return i;
    if (value[i] !== ",") seen++;
  }
  return value.length;
};

export function useCalcForm(onCalculate: () => void) {
  const pending = useRef<{ el: HTMLInputElement; before: number; total: number } | null>(null);

  const restoreCaret = useCallback(() => {
    const p = pending.current;
    pending.current = null;
    if (!p || !p.el.isConnected || document.activeElement !== p.el) return;
    const removed = Math.max(0, p.total - countNonComma(p.el.value));
    const pos = indexAfterChars(p.el.value, Math.max(0, p.before - removed));
    p.el.setSelectionRange(pos, pos);
  }, []);

  // Runs before React's own onChange, so we see the raw text the user just typed.
  const onInputCapture = useCallback((e: FormEvent<HTMLElement>) => {
    const el = e.target as HTMLInputElement;
    if (el.tagName !== "INPUT" || el.type !== "text" || el.selectionStart == null) return;
    const caret = el.selectionStart;
    pending.current = {
      el,
      before: countNonComma(el.value.slice(0, caret)),
      total: countNonComma(el.value),
    };
    // After React has committed the re-formatted value, put the caret back.
    // (A microtask would run before React's own flush, so use a task.)
    setTimeout(restoreCaret, 0);
  }, [restoreCaret]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      const el = e.target as HTMLInputElement;
      if (e.nativeEvent.isComposing) return;
      // A keystroke can arrive before the deferred caret restore has run.
      restoreCaret();

      // Backspace/Delete next to a thousands separator would only delete the
      // comma (which is re-added at once). Step over it instead.
      if ((e.key === "Backspace" || e.key === "Delete") && el.tagName === "INPUT" && el.type === "text") {
        const { selectionStart: s, selectionEnd: end, value } = el;
        if (s != null && s === end) {
          if (e.key === "Backspace" && s > 0 && value[s - 1] === ",") {
            e.preventDefault();
            el.setSelectionRange(s - 1, s - 1);
          } else if (e.key === "Delete" && value[s] === ",") {
            e.preventDefault();
            el.setSelectionRange(s + 1, s + 1);
          }
        }
        return;
      }

      if (e.key !== "Enter" || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
      if (el.tagName !== "INPUT" && el.tagName !== "SELECT") return;
      if (el.type === "checkbox" || el.type === "radio" || el.type === "button" || el.type === "submit") return;

      e.preventDefault();
      const fields = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(FIELD_SELECTOR)).filter(
        (f) => f.offsetParent !== null
      );
      const next = fields[fields.indexOf(el) + 1];
      if (next) {
        next.focus();
        if (next instanceof HTMLInputElement) next.select();
      } else {
        onCalculate();
      }
    },
    [onCalculate, restoreCaret]
  );

  return { onKeyDown, onInputCapture };
}

// ── Input limits ──────────────────────────────────────────────────────────

/** Beyond these, results are 20-digit numbers that mean nothing. */
export const LIMITS = { amount: 1e10, ratePct: 50, years: 60 };

/**
 * Message for the first input above LIMITS, or "" if all are within them.
 * `rate` is an annual rate as a fraction (0.12 for 12%).
 */
export function limitProblem({ amount, rate, years }: { amount?: number; rate?: number; years?: number }) {
  if (amount !== undefined && amount > LIMITS.amount) return "Amount can't be more than 10,00,00,00,000 (1,000 crore).";
  if (rate !== undefined && rate * 100 > LIMITS.ratePct) return `Rate can't be more than ${LIMITS.ratePct}% a year.`;
  if (years !== undefined && years > LIMITS.years) return `Period can't be more than ${LIMITS.years} years.`;
  return "";
}

// ── Charts ────────────────────────────────────────────────────────────────

/** Compact axis label: 12,500 → 12.5k, 4,50,000 → 4.5L, 2.1Cr. */
export const compactMoney = (v: number | string) => {
  const n = Number(v);
  const abs = Math.abs(n);
  const trim = (x: number) => String(parseFloat(x.toFixed(2)));
  if (abs >= 1e7) return `${trim(n / 1e7)}Cr`;
  if (abs >= 1e5) return `${trim(n / 1e5)}L`;
  if (abs >= 1e3) return `${trim(n / 1e3)}k`;
  return trim(n);
};

/** Margin so axis labels/dots stay inside the card. */
export const CHART_MARGIN = { top: 10, right: 24, left: 4, bottom: 16 };

/** Spread on <YAxis>: always starts at 0, fixed width so labels never clip. */
export const Y_AXIS_PROPS = {
  domain: [0, "auto"] as [number, "auto"],
  width: 64,
  tickFormatter: compactMoney,
};

/** Spread on <XAxis> for numeric year axes: always starts at 0. */
export const X_AXIS_PROPS = {
  type: "number" as const,
  domain: [0, "dataMax"] as [number, "dataMax"],
  allowDecimals: false,
};
