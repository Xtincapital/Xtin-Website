// A number box that groups digits with commas as you type (1000 → 1,000) and
// can carry a currency symbol inside the box. The value it keeps and reports is
// the plain number as text ("1000.5", no commas), so forms parse it as before:
// `onChange` receives `{ target: { value } }`, like <Input>.
import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<typeof Input>;

/** Group the digits of a plain number string: "1234567.5" → "1,234,567.5" (or "12,34,567.5" with lakh grouping). */
export function groupNumberText(raw: string, indian = false): string {
  if (!raw) return "";
  const negative = raw.startsWith("-");
  const body = negative ? raw.slice(1) : raw;
  const dot = body.indexOf(".");
  const int = dot === -1 ? body : body.slice(0, dot);
  const frac = dot === -1 ? "" : body.slice(dot);
  let grouped = int;
  if (indian) {
    if (int.length > 3) grouped = `${int.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${int.slice(-3)}`;
  } else {
    grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return `${negative ? "-" : ""}${grouped}${frac}`;
}

/** What the user typed → the plain number text we keep ("1,2a3.456" → "123.45"). */
export function cleanNumberText(typed: string, decimals: number, allowNegative: boolean): string {
  let s = typed.replace(/,/g, "").replace(/\s/g, "");
  const negative = allowNegative && s.startsWith("-");
  s = s.replace(/[^0-9.]/g, "");
  const dot = s.indexOf(".");
  if (dot !== -1) {
    const frac = s.slice(dot + 1).replace(/\./g, "").slice(0, decimals);
    s = decimals > 0 ? `${s.slice(0, dot)}.${frac}` : s.slice(0, dot);
  }
  // Drop leading zeros ("007" → "7") but keep "0" and "0.5".
  s = s.replace(/^0+(?=\d)/, "");
  return negative ? `-${s}` : s;
}

export const isIndianGrouping = (currencyOrLocale?: string) => currencyOrLocale === "INR" || currencyOrLocale === "en-IN";

export interface AmountInputProps extends Omit<InputProps, "value" | "onChange" | "defaultValue"> {
  /** Plain number text, no commas ('' when empty). */
  value: string | number | null | undefined;
  onChange: (e: { target: { value: string } }) => void;
  /** Shown inside the box, before the number (e.g. "₹"). */
  symbol?: string;
  /** Group like Indian numbers (12,34,567) instead of 1,234,567. */
  indian?: boolean;
  /** Most decimals kept (default 2; 0 = whole numbers only). */
  decimals?: number;
  /** Let a leading minus through (default true unless `min` is 0 or more). */
  allowNegative?: boolean;
  invalid?: boolean;
}

const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(function AmountInput(
  { value, onChange, symbol, indian = false, decimals = 2, allowNegative, invalid, className, style, min, max, step, type: _type, ...rest },
  forwardedRef,
) {
  const raw = value == null ? "" : String(value);
  const negativeOk = allowNegative ?? (min == null || Number(min) < 0);
  const innerRef = React.useRef<HTMLInputElement | null>(null);
  const caretDigits = React.useRef<number | null>(null);

  const setRefs = (el: HTMLInputElement | null) => {
    innerRef.current = el;
    if (typeof forwardedRef === "function") forwardedRef(el);
    else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
  };

  const shown = groupNumberText(raw, indian);

  // Put the caret back after the same digit it was on before the commas moved.
  React.useLayoutEffect(() => {
    const el = innerRef.current;
    const digits = caretDigits.current;
    caretDigits.current = null;
    if (!el || digits == null || document.activeElement !== el) return;
    let seen = 0;
    let pos = 0;
    while (pos < shown.length && seen < digits) {
      if (/[0-9.]/.test(shown[pos])) seen += 1;
      pos += 1;
    }
    el.setSelectionRange(pos, pos);
  }, [shown]);

  const symbolLen = symbol ? symbol.trim().length : 0;

  return (
    <div className="relative">
      {symbol ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">{symbol.trim()}</span>
      ) : null}
      <Input
        {...rest}
        ref={setRefs}
        type="text"
        inputMode={decimals > 0 ? "decimal" : "numeric"}
        autoComplete="off"
        aria-invalid={invalid || rest["aria-invalid"] || undefined}
        value={shown}
        style={symbolLen ? { paddingLeft: `calc(${symbolLen}ch + 1.35rem)`, ...style } : style}
        className={cn("tabular-nums", invalid && "border-red-400 focus-visible:ring-red-400", className)}
        onChange={(e) => {
          const el = e.target;
          const typed = el.value;
          const caret = el.selectionStart ?? typed.length;
          caretDigits.current = typed.slice(0, caret).replace(/[^0-9.]/g, "").length;
          const next = cleanNumberText(typed, decimals, negativeOk);
          // A lone "-" or "." is a number in progress; keep it as typed.
          onChange({ target: { value: next } });
          if (next === raw) {
            // Nothing changed (a rejected key): restore the box to what it showed.
            el.value = shown;
          }
        }}
      />
    </div>
  );
});

export default AmountInput;
export { AmountInput };
