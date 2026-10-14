import { useEffect, useRef } from "react";
import { createChart, ColorType, type IChartApi } from "lightweight-charts";
import { useTheme } from "../../../contexts/ThemeContext";
import { toUnix } from "../lib/time";
import { canvasChartColors, hexAlpha } from "@/components/charts/chartTheme";
import type { EquityPoint } from "../lib/types";

// Profit curves are green, drawdown curves red (filled downward), in the
// site's theme colours (canvasChartColors).
const TONES = { emerald: "up", rose: "down" } as const;

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
    const pal = canvasChartColors(dark);
    const chart: IChartApi = createChart(ref.current, {
      height,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: pal.text, fontSize: 11, fontFamily: pal.font },
      grid: { vertLines: { visible: false }, horzLines: { color: pal.grid } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true },
      crosshair: { vertLine: { labelBackgroundColor: pal.crosshairLabel }, horzLine: { labelBackgroundColor: pal.crosshairLabel } },
      handleScroll: false,
      handleScale: false,
      localization: format ? { priceFormatter: format } : undefined,
    });

    const line = pal[TONES[tone]];
    const rose = tone === "rose";
    const series = chart.addAreaSeries({
      lineColor: line,
      topColor: hexAlpha(line, rose ? 0.02 : dark ? 0.3 : 0.2),
      bottomColor: hexAlpha(line, rose ? (dark ? 0.3 : 0.2) : 0.01),
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
      series.createPriceLine({ price: baseline, color: pal.baseline, lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: "" });
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
