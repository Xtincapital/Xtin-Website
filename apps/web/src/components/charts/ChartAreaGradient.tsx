import { chartColors } from "./chartTheme";

/** Vertical fade under a line (place inside <defs>). */
export default function ChartAreaGradient({ id, color = chartColors.positive }: { id: string; color?: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color} stopOpacity={0.28} />
      <stop offset="100%" stopColor={color} stopOpacity={0} />
    </linearGradient>
  );
}
