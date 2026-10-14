import { useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Slide-to-confirm for destructive actions (delete a trade, clear data).
// Drag the knob to the end, or focus it and press Enter / Space. If the
// action fails (onConfirm throws or returns false), the knob springs back so
// the user can try again.

const PAD = 4;
const KNOB = 42;

interface SlideToConfirmProps {
  label: string;
  busyLabel?: string;
  onConfirm: () => Promise<boolean | void> | boolean | void;
  disabled?: boolean;
  className?: string;
}

export default function SlideToConfirm({ label, busyLabel = "Working…", onConfirm, disabled, className }: SlideToConfirmProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [max, setMax] = useState(0);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const x = useMotionValue(0);
  const fill = useTransform(x, (v) => v + KNOB + PAD * 2);
  const labelOpacity = useTransform(x, [0, Math.max(1, max * 0.6)], [1, 0]);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setMax(Math.max(0, el.clientWidth - KNOB - PAD * 2));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const springBack = () => animate(x, 0, { type: "spring", stiffness: 500, damping: 28 });

  async function complete() {
    if (state !== "idle" || disabled) return;
    animate(x, max, { type: "spring", stiffness: 500, damping: 40 });
    setState("busy");
    try {
      // `false` (or a throw) means the action failed: reset for another try.
      if ((await onConfirm()) === false) throw new Error("not confirmed");
      setState("done");
    } catch {
      setState("idle");
      springBack();
    }
  }

  const locked = disabled || state !== "idle";

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative h-[50px] w-full select-none overflow-hidden rounded-full bg-destructive/10 shadow-[inset_0_0_0_1px_hsl(var(--destructive)/0.25)]",
        disabled && "opacity-50",
        className,
      )}
    >
      <motion.div className="absolute inset-y-0 left-0 rounded-full bg-destructive/20" style={{ width: fill }} />
      <motion.span
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-semibold text-destructive"
        style={{ opacity: state === "idle" ? labelOpacity : 1 }}
      >
        {state === "idle" ? label : busyLabel}
      </motion.span>
      <motion.button
        type="button"
        aria-label={`${label}. Press Enter to confirm.`}
        disabled={locked}
        drag={locked ? false : "x"}
        dragConstraints={{ left: 0, right: max }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={() => (x.get() >= max * 0.9 ? complete() : springBack())}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            complete();
          }
        }}
        style={{ x, width: KNOB, height: KNOB, top: PAD, left: PAD }}
        className="absolute grid cursor-grab place-items-center rounded-full bg-destructive text-destructive-foreground shadow-[0_4px_12px_hsl(var(--destructive)/0.45)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:cursor-grabbing disabled:cursor-default"
      >
        {state === "busy" ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : state === "done" ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        )}
      </motion.button>
    </div>
  );
}
