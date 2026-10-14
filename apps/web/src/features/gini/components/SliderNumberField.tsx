// A slider paired with a typed number box, so users can either drag or type an
// exact value. Typing is committed on blur / Enter and clamped to [min, max];
// while the box is focused it holds free text so partial entries ("1", "12.")
// aren't rewritten under the user's cursor.
import { useEffect, useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  /** Shown before the box (e.g. "₹"). */
  prefix?: string;
  /** Shown after the box (e.g. "%"). */
  suffix?: string;
  /** Decimals kept when typing (default 0). */
  decimals?: number;
  /** Labels under the slider's left/right ends. */
  minLabel?: string;
  maxLabel?: string;
  hint?: string;
  /**
   * `value`, `min` and `max` are rupees; the box shows and takes the
   * selected currency, with its symbol in front.
   */
  money?: boolean;
}

export default function SliderNumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  decimals = 0,
  minLabel,
  maxLabel,
  hint,
  money,
}: Props) {
  const { symbol, inrToDisplay, displayToInr } = useCurrency();
  const toShown = (v: number) => (money ? Math.round(inrToDisplay(v) * 100) / 100 : v);
  const [text, setText] = useState(String(toShown(value)));
  const [focused, setFocused] = useState(false);

  // Follow the slider / external changes while the user isn't typing.
  useEffect(() => {
    if (!focused) setText(String(toShown(value)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, focused, symbol]);

  function commit() {
    setFocused(false);
    const typed = parseFloat(text.replace(/,/g, ""));
    if (!Number.isFinite(typed)) {
      setText(String(toShown(value)));
      return;
    }
    const parsed = money ? displayToInr(typed) : typed;
    const factor = Math.pow(10, decimals);
    const next = Math.min(max, Math.max(min, Math.round(parsed * factor) / factor));
    onChange(next);
    setText(String(toShown(next)));
  }

  const shown = focused
    ? text
    : Number(toShown(value)).toLocaleString(money && symbol.trim() !== "₹" ? "en-US" : "en-IN", { maximumFractionDigits: money ? 0 : decimals });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-1">
          {(money || prefix) && <span className="text-sm text-muted-foreground">{money ? symbol.trim() : prefix}</span>}
          <Input
            type="text"
            inputMode="decimal"
            aria-label={label}
            value={shown}
            onFocus={(e) => {
              setFocused(true);
              setText(String(toShown(value)));
              e.currentTarget.select();
            }}
            onChange={(e) => setText(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="h-8 w-28 px-2 text-right text-sm font-semibold text-brand"
          />
          {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
        </div>
      </div>
      <Slider value={[Math.min(max, Math.max(min, value))]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
