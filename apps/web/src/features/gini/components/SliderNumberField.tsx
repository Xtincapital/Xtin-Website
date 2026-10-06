// A slider paired with a typed number box, so users can either drag or type an
// exact value. Typing is committed on blur / Enter and clamped to [min, max];
// while the box is focused it holds free text so partial entries ("1", "12.")
// aren't rewritten under the user's cursor.
import { useEffect, useState } from "react";
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
}: Props) {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  // Follow the slider / external changes while the user isn't typing.
  useEffect(() => {
    if (!focused) setText(String(value));
  }, [value, focused]);

  function commit() {
    setFocused(false);
    const parsed = parseFloat(text.replace(/,/g, ""));
    if (!Number.isFinite(parsed)) {
      setText(String(value));
      return;
    }
    const factor = Math.pow(10, decimals);
    const next = Math.min(max, Math.max(min, Math.round(parsed * factor) / factor));
    onChange(next);
    setText(String(next));
  }

  const shown = focused ? text : Number(value).toLocaleString("en-IN", { maximumFractionDigits: decimals });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-1">
          {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
          <Input
            type="text"
            inputMode="decimal"
            aria-label={label}
            value={shown}
            onFocus={(e) => {
              setFocused(true);
              setText(String(value));
              e.currentTarget.select();
            }}
            onChange={(e) => setText(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="h-8 w-28 px-2 text-right text-sm font-semibold text-primary"
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
