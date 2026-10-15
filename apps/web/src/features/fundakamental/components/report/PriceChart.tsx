// Share-price card for the Analysis Report header.
// Pulls 5 years of daily closes once (the Pro technicals endpoint with
// include_history) and slices 1M / 6M / 1Y / 5Y on the client, so switching
// ranges never hits the API again. Renders nothing if the data can't be had.
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../lib/api";
import { Skeleton } from "@/components/ui/skeleton";

type Range = "1M" | "6M" | "1Y" | "5Y";
const RANGES: Range[] = ["1M", "6M", "1Y", "5Y"];
const DAYS: Record<Range, number> = { "1M": 31, "6M": 183, "1Y": 366, "5Y": 1827 };
const MAX_POINTS = 320;
const H = 200, PAD_R = 68, PAD_T = 12, PAD_B = 24;

interface Point { d: Date; c: number }

export default function PriceChart({ ticker, currency }: { ticker: string; currency: string }) {
  const [history, setHistory] = useState<Point[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [range, setRange] = useState<Range>("1Y");
  const [hover, setHover] = useState<number | null>(null);
  const [width, setWidth] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    api.stocks
      .getTechnicalIndicators(ticker, "5y", false, true)
      .then((r: any) => {
        const h = r?.history;
        const pts: Point[] = (h?.dates || [])
          .map((d: string, i: number) => ({ d: new Date(d), c: Number(h.close?.[i]) }))
          .filter((p: Point) => Number.isFinite(p.c) && p.c > 0);
        if (pts.length < 2) throw new Error("no history");
        if (!cancelled) setHistory(pts);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => { cancelled = true; };
  }, [ticker]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [history]);

  const pts = useMemo(() => {
    if (!history) return [];
    const end = history[history.length - 1].d.getTime();
    const from = end - DAYS[range] * 86_400_000;
    const sliced = history.filter((p) => p.d.getTime() >= from);
    const step = Math.ceil(sliced.length / MAX_POINTS);
    return step > 1 ? sliced.filter((_, i) => i % step === 0 || i === sliced.length - 1) : sliced;
  }, [history, range]);

  if (failed) return null;
  if (!history) return <Skeleton className="h-[262px] rounded-2xl mb-5" />;

  const n = pts.length;
  const min = Math.min(...pts.map((p) => p.c));
  const max = Math.max(...pts.map((p) => p.c));
  const plotW = Math.max(1, width - PAD_R);
  const x = (i: number) => (n > 1 ? (i / (n - 1)) * plotW : 0);
  const y = (v: number) => PAD_T + (1 - (v - min) / (max - min || 1)) * (H - PAD_T - PAD_B);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.c).toFixed(1)}`).join("");
  const up = pts[n - 1].c >= pts[0].c;
  const pct = (pts[n - 1].c / pts[0].c - 1) * 100;
  const tone = up ? "text-brand" : "text-destructive";
  const fmtPrice = (v: number) => `${currency}${v.toLocaleString(currency === "₹" ? "en-IN" : "en-US", { maximumFractionDigits: v >= 1000 ? 0 : 2 })}`;
  const fmtDate = (d: Date) => d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "2-digit" });
  const ticks = [min, (min + max) / 2, max];

  const onMove = (e: React.PointerEvent) => {
    const r = boxRef.current!.getBoundingClientRect();
    setHover(Math.max(0, Math.min(n - 1, Math.round(((e.clientX - r.left) / plotW) * (n - 1)))));
  };

  return (
    <section className="rounded-2xl bg-card border border-border px-5 pt-4 pb-3 mb-5">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h2 className="text-base font-bold text-foreground">Share price</h2>
        <span className={`text-sm font-bold tabular-nums ${tone}`}>
          {up ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
          <span className="ml-1 font-medium text-muted-foreground">in {range}</span>
        </span>
        <div className="ml-auto flex gap-0.5 rounded-xl bg-secondary border border-border p-[3px]" role="tablist" aria-label="Price range">
          {RANGES.map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={range === r}
              onClick={() => setRange(r)}
              className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-colors ${
                range === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={boxRef}
        className={`relative h-[200px] touch-pan-y ${tone}`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {width > 0 && (
          <svg width={width} height={H} className="block overflow-visible">
            <defs>
              <linearGradient id={`pc-fill-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="currentColor" stopOpacity={0.2} />
                <stop offset="1" stopColor="currentColor" stopOpacity={0} />
              </linearGradient>
            </defs>
            {ticks.map((t, i) => (
              <g key={i}>
                <line x1={0} x2={plotW} y1={y(t)} y2={y(t)} className="stroke-border" strokeDasharray="3 4" />
                <text x={plotW + 10} y={y(t) + 4} className="fill-muted-foreground text-[11px] tabular-nums">{fmtPrice(t)}</text>
              </g>
            ))}
            <path d={`${line}L${x(n - 1)} ${H - PAD_B}L0 ${H - PAD_B}Z`} fill={`url(#pc-fill-${ticker})`} />
            <motion.path
              key={range}
              d={line}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
            />
            <circle cx={x(n - 1)} cy={y(pts[n - 1].c)} r={4} fill="currentColor" />
            {[0, Math.floor((n - 1) / 2), n - 1].map((i, k) => (
              <text key={k} x={x(i)} y={H - 5} textAnchor={(["start", "middle", "end"] as const)[k]} className="fill-muted-foreground text-[11px]">
                {fmtDate(pts[i].d)}
              </text>
            ))}
            {hover != null && (
              <g>
                <line x1={x(hover)} x2={x(hover)} y1={PAD_T} y2={H - PAD_B} className="stroke-muted-foreground" strokeDasharray="3 3" />
                <circle cx={x(hover)} cy={y(pts[hover].c)} r={5} className="fill-card" stroke="currentColor" strokeWidth={2.5} />
              </g>
            )}
          </svg>
        )}
        {hover != null && (
          <div
            className="pointer-events-none absolute -top-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-xs text-background"
            style={{ left: Math.max(64, Math.min(plotW - 64, x(hover))) }}
          >
            <b className="tabular-nums">{fmtPrice(pts[hover].c)}</b> · {fmtDate(pts[hover].d)}
          </div>
        )}
      </div>
    </section>
  );
}
