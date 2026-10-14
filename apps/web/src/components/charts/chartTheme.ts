// Shared Recharts styling, so every chart on the site has the same axes,
// gridlines, tooltip card, bar shape and colours. Colours read the site
// tokens (src/index.css), so charts follow light/dark mode automatically.
//
// Usage:
//   <CartesianGrid {...chartGrid} />
//   <XAxis dataKey="label" {...chartXAxis} />
//   <YAxis {...chartYAxis} tickFormatter={...} />
//   <Tooltip {...chartTooltip} formatter={...} />
//   <Bar radius={chartBarRadius} maxBarSize={chartMaxBarSize} ... />
//   <defs><ChartAreaGradient id="pnlFill" /></defs> + <Area fill="url(#pnlFill)" />
//   (ChartAreaGradient lives in ./ChartAreaGradient.tsx)

export const chartColors = {
  positive: "hsl(var(--chart-positive))",
  negative: "hsl(var(--chart-negative))",
  neutral: "hsl(var(--chart-neutral))",
  ink: "hsl(var(--foreground))",
  grid: "hsl(var(--border))",
  muted: "hsl(var(--muted-foreground))",
  // Categorical series, in order: brand, gold, slate blue, violet,
  // terracotta, teal, light slate blue, light gold.
  series: [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
    "hsl(var(--chart-7))",
    "hsl(var(--chart-8))",
  ],
} as const;

/** Green for profit, red for loss. */
export const pnlColor = (value: number) => (value >= 0 ? chartColors.positive : chartColors.negative);

export const chartTick = { fontSize: 11, fill: chartColors.muted } as const;

export const chartGrid = {
  stroke: chartColors.grid,
  strokeDasharray: "2 5",
  vertical: false,
} as const;

export const chartXAxis = {
  tick: chartTick,
  axisLine: false,
  tickLine: false,
  tickMargin: 10,
} as const;

export const chartYAxis = {
  tick: chartTick,
  axisLine: false,
  tickLine: false,
  tickMargin: 8,
} as const;

export const chartTooltip = {
  cursor: { stroke: chartColors.muted, strokeDasharray: "2 3", strokeOpacity: 0.6, fill: "hsl(var(--muted) / 0.5)" },
  contentStyle: {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    boxShadow: "var(--shadow-lg)",
    padding: "8px 12px",
    fontSize: 12,
  },
  labelStyle: { color: chartColors.muted, fontSize: 11, marginBottom: 2 },
  itemStyle: { color: "hsl(var(--popover-foreground))", fontWeight: 700, fontVariantNumeric: "tabular-nums", padding: 0 },
  wrapperStyle: { outline: "none" },
} as const;

/** Bars: rounded tops, capped width so a few bars never turn into slabs. */
export const chartBarRadius: [number, number, number, number] = [6, 6, 0, 0];
export const chartMaxBarSize = 48;

/** Entry animation shared by every series. */
export const chartAnimation = { animationDuration: 900, animationEasing: "ease-out" } as const;

export const chartActiveDot = { r: 5, strokeWidth: 2, stroke: "hsl(var(--card))" } as const;

/** Hex colours for canvas chart libraries (lightweight-charts), which can't read
 *  CSS variables. Same values as the tokens above, per theme. */
export function canvasChartColors(dark: boolean) {
  return dark
    ? { up: "#16A34A", down: "#F26B6B", text: "#A0A3AA", grid: "rgba(255,255,255,0.05)", baseline: "#555A63", crosshairLabel: "#2F2F35", marker: "#7C95C4", font: '"Inter Tight", "Plus Jakarta Sans", system-ui, sans-serif' }
    : { up: "#16A34A", down: "#C7363B", text: "#717680", grid: "#EFEBE3", baseline: "#A0A3AA", crosshairLabel: "#2A2A2C", marker: "#3E5C8A", font: '"Inter Tight", "Plus Jakarta Sans", system-ui, sans-serif' };
}

/** rgba() of a #RRGGBB hex at the given opacity (for canvas area fills). */
export function hexAlpha(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
