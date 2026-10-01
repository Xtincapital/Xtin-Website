import { useEffect, useRef } from "react";
import { createChart, ColorType, type IChartApi } from "lightweight-charts";
import { useTheme } from "../../../contexts/ThemeContext";
import { toUnix } from "../lib/time";
import type { EquityPoint } from "../lib/types";

const TONES = {
  emerald: { line: "#10b981", top: "rgba(16,185,129,0.28)", bottom: "rgba(16,185,129,0.01)" },
  rose: { line: "#f43f5e", top: "rgba(244,63,94,0.02)", bottom: "rgba(244,63,94,0.28)" },
};

/** Area chart for an equity or drawdown curve. */
export default function TimeSeriesChart({
  data,
  tone = "emerald",
  height = 280,
  format,
  baseline,
}: {
  data: EquityPoint[];
  tone?: keyof typeof TONES;
  height?: number;
  format?: (v: number) => string;
  /** Draw a dashed reference line (e.g. starting capital). */
  baseline?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!ref.current) return;
    const dark = theme === "dark";
    const grid = dark ? "rgba(255,255,255,0.05)" : "#eef2f7";
    const chart: IChartApi = createChart(ref.current, {
      height,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: dark ? "#94a3b8" : "#64748b", fontSize: 11 },
      grid: { vertLines: { color: grid }, horzLines: { color: grid } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true },
      crosshair: { vertLine: { labelBackgroundColor: "#0f766e" }, horzLine: { labelBackgroundColor: "#0f766e" } },
      handleScroll: false,
      handleScale: false,
      localization: format ? { priceFormatter: format } : undefined,
    });

    const c = TONES[tone];
    const series = chart.addAreaSeries({
      lineColor: c.line,
      topColor: c.top,
      bottomColor: c.bottom,
      lineWidth: 2,
      invertFilledArea: tone === "rose",
      priceLineVisible: false,
    });
    const seen = new Set<number>();
    series.setData(
      data
        .map((p) => ({ time: toUnix(p.time), value: p.equity }))
        .filter((p) => (seen.has(p.time) ? false : (seen.add(p.time), true)))
    );
    if (baseline !== undefined) {
      series.createPriceLine({ price: baseline, color: dark ? "#475569" : "#94a3b8", lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: "" });
    }
    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => ref.current && chart.applyOptions({ width: ref.current.clientWidth }));
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [data, tone, height, format, baseline, theme]);

  return <div ref={ref} className="w-full" />;
}
