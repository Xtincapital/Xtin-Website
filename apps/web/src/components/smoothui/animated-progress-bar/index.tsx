// SmoothUI AnimatedProgressBar (installed from the @smoothui registry),
// restyled to the site: brand-green fill on the neutral track, rounded ends,
// and a soft gradient like the Journal concept. The spring-in is SmoothUI's.
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface AnimatedProgressBarProps {
  barClassName?: string;
  className?: string;
  /** Fill colour; defaults to the brand green. */
  color?: string;
  label?: string;
  labelClassName?: string;
  value: number; // 0-100
  /**
   * To replay the animation, change the React 'key' prop on this component from the parent.
   */
}

const MIN_PROGRESS_VALUE = 0;
const MAX_PROGRESS_VALUE = 100;

const SPRING = {
  damping: 18,
  mass: 0.75,
  stiffness: 90,
  type: "spring" as const,
  delay: 0.25,
};

export default function AnimatedProgressBar({
  value,
  label,
  color = "rgb(var(--brand))",
  className = "",
  barClassName = "",
  labelClassName = "",
}: AnimatedProgressBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const width = Math.max(MIN_PROGRESS_VALUE, Math.min(MAX_PROGRESS_VALUE, value));

  return (
    <div className={cn("w-full", className)}>
      {label ? <div className={cn("mb-1 font-medium text-sm", labelClassName)}>{label}</div> : null}
      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-secondary shadow-[inset_0_0_0_1px_hsl(var(--border))]"
        role="progressbar"
        aria-valuemin={MIN_PROGRESS_VALUE}
        aria-valuemax={MAX_PROGRESS_VALUE}
        aria-valuenow={Math.round(width)}
      >
        <motion.div
          animate={{ width: `${width}%` }}
          className={cn("h-full rounded-full", barClassName)}
          initial={{ width: MIN_PROGRESS_VALUE }}
          style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${color} 65%, transparent), ${color})` }}
          transition={shouldReduceMotion ? { duration: 0 } : SPRING}
        />
      </div>
    </div>
  );
}
