import { useEffect, useRef } from "react";
import { createChart, ColorType, type IChartApi, type SeriesMarker, type Time } from "lightweight-charts";
import { useTheme } from "../../../contexts/ThemeContext";
import { toUnix } from "../lib/time";
import { canvasChartColors } from "@/components/charts/chartTheme";
import type { BacktestTrade, Candle } from "../lib/types";

/** Price candles with entry (▲/▼) and exit (●) markers. */
export default function CandleChart({ candles, trades, showTrades = true, height = 380 }: { candles: Candle[]; trades: BacktestTrade[]; showTrades?: boolean; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!ref.current) return;
    const c = canvasChartColors(theme === "dark");
    const chart: IChartApi = createChart(ref.current, {
      height,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: c.text, fontSize: 11, fontFamily: c.font },
      grid: { vertLines: { visible: false }, horzLines: { color: c.grid } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true },
      crosshair: { vertLine: { labelBackgroundColor: c.crosshairLabel }, horzLine: { labelBackgroundColor: c.crosshairLabel } },
    });

    const series = chart.addCandlestickSeries({
      upColor: c.up,
      downColor: c.down,
      borderUpColor: c.up,
      borderDownColor: c.down,
      wickUpColor: c.up,
      wickDownColor: c.down,
    });

    const seen = new Set<number>();
    series.setData(
      candles
        .map((c) => ({ time: toUnix(c.time), open: c.open, high: c.high, low: c.low, close: c.close }))
        .filter((c) => (seen.has(c.time) ? false : (seen.add(c.time), true)))
    );

    if (showTrades) {
      const markers: SeriesMarker<Time>[] = [];
      for (const t of trades) {
        markers.push({ time: toUnix(t.entry_time), position: t.side === "BUY" ? "belowBar" : "aboveBar", color: c.marker, shape: t.side === "BUY" ? "arrowUp" : "arrowDown", text: t.side === "BUY" ? "Buy" : "Short" });
        markers.push({ time: toUnix(t.exit_time), position: t.side === "BUY" ? "aboveBar" : "belowBar", color: t.pnl >= 0 ? c.up : c.down, shape: "circle", text: `${t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(0)}` });
      }
      markers.sort((a, b) => (a.time as number) - (b.time as number));
      series.setMarkers(markers);
    }
    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => ref.current && chart.applyOptions({ width: ref.current.clientWidth }));
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [candles, trades, showTrades, height, theme]);

  return <div ref={ref} className="w-full" />;
}
