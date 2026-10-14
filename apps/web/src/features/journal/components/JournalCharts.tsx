// The Journal's three chart types, drawn as plain SVG so they match the
// Journal redesign concept exactly:
//
//   JLineChart — the curve draws itself in over a soft area; one dot per
//     point (green profit / red loss) and a pulse on the latest; hovering
//     shows a dashed crosshair, a ring on the point and a tooltip with the
//     change against the previous point.
//   JBarChart  — gradient bars with rounded ends that grow in one after
//     another; hovering fades the other bars, labels the hovered one and
//     shows a tooltip. "signed" = green/red money bars, "mono" = one ink
//     colour for counts and percentages (optional dashed reference line).
//   JDonut     — segments with small gaps that draw in, the total in the
//     middle and a legend beside it; hovering a legend row or a segment
//     thickens that segment and fades the rest.
//
// Animation runs on Motion (motion/react): pathLength draws the curve, and the
// bars / donut segments stagger in. Colours come from the site tokens, so
// every chart follows light/dark mode.
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { chartColors } from "@/components/charts/chartTheme";

const POS = "rgb(var(--brand))";
const NEG = "hsl(var(--destructive))";
const INK = "hsl(var(--foreground))";
const GRID = "hsl(var(--border))";
const MUTED = "hsl(var(--muted-foreground))";
const CARD = "hsl(var(--card))";
const GOLD = "#B8923F";
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const EASE_ARR = [0.16, 1, 0.3, 1] as const;

/** Width of a container, kept up to date as it resizes. */
function useWidth<T extends HTMLElement>(): [React.RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

const niceStep = (x: number) => {
  const p = Math.pow(10, Math.floor(Math.log10(x)));
  const f = x / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
};

/** Y range rounded to tidy ticks, always including zero. */
function scaleY(values: number[], count = 4, fixedMax?: number) {
  if (fixedMax != null) {
    const step = fixedMax / 4;
    return { lo: 0, hi: fixedMax, ticks: [0, 1, 2, 3, 4].map((k) => k * step) };
  }
  let lo = Math.min(0, ...values);
  let hi = Math.max(0, ...values);
  if (lo === hi) hi = lo + 1;
  const step = niceStep((hi - lo) / count);
  lo = Math.floor(lo / step) * step;
  hi = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(6));
  return { lo, hi, ticks };
}

function Tip({ x, y, show, children }: { x: number; y: number; show: boolean; children: React.ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute z-10 whitespace-nowrap rounded-xl border bg-popover px-3 py-2 text-xs shadow-xl"
      style={{
        left: x,
        top: y,
        opacity: show ? 1 : 0,
        transform: `translate(-50%, calc(-100% - 14px)) scale(${show ? 1 : 0.96})`,
        transition: `opacity .15s, transform .2s ${EASE}`,
      }}
      role="presentation"
    >
      {children}
    </div>
  );
}

const TipLabel = ({ children }: { children: React.ReactNode }) => <div className="mb-0.5 text-muted-foreground">{children}</div>;
const TipValue = ({ children, tone }: { children: React.ReactNode; tone?: "pos" | "neg" }) => (
  <div className={cn("text-sm font-semibold tabular-nums tracking-[-0.01em]", tone === "pos" ? "text-brand" : tone === "neg" ? "text-destructive" : "text-foreground")}>
    {children}
  </div>
);

// ─── Line ────────────────────────────────────────────────────────────────

export interface LinePoint {
  label: string;
  value: number;
}

interface JLineChartProps {
  data: LinePoint[];
  /** Axis tick text (short form, e.g. "₹12K"). */
  formatAxis: (v: number) => string;
  /** Tooltip value (full form, e.g. "+₹12,450"). */
  formatValue: (v: number) => string;
  /** Colour points green/red by sign (money). Off = one green line (e.g. win rate). */
  signed?: boolean;
  /** Fixed top of the scale (e.g. 100 for percentages). */
  max?: number;
  height?: number;
  ariaLabel: string;
  onPointClick?: (index: number) => void;
}

export function JLineChart({ data, formatAxis, formatValue, signed = true, max, height = 256, ariaLabel, onPointClick }: JLineChartProps) {
  const [wrap, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const uid = useMemo(() => `jl${Math.random().toString(36).slice(2, 8)}`, []);
  const W = Math.max(260, width);
  const H = height;
  const pl = 56, pr = 14, pt = 16, pb = 30;
  const n = data.length;
  const { lo, hi, ticks } = scaleY(data.map((d) => d.value), 4, max);
  const x = (i: number) => (n <= 1 ? (pl + W - pr) / 2 : pl + (i * (W - pl - pr)) / (n - 1));
  const y = (v: number) => pt + ((hi - v) / (hi - lo)) * (H - pt - pb);
  const pts = data.map((d, i) => [x(i), y(d.value)] as const);
  let line = pts.length ? `M${pts[0][0]} ${pts[0][1]}` : "";
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    line += ` C${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`;
  }
  const labelEvery = Math.max(1, Math.ceil((n * 46) / Math.max(1, W - pl - pr)));
  const colorOf = (v: number) => (!signed ? POS : v >= 0 ? POS : NEG);
  const dataKey = data.map((d) => d.value).join(",");

  const pick = (clientX: number, rect: DOMRect) => {
    if (n === 0) return null;
    const i = Math.round(((clientX - rect.left - pl) / Math.max(1, W - pl - pr)) * (n - 1));
    return Math.max(0, Math.min(n - 1, i));
  };

  const h = hover;
  const hv = h != null ? data[h].value : 0;
  const prev = h != null && h > 0 ? data[h - 1] : null;

  return (
    <div ref={wrap} className="relative w-full" style={{ height: H }}>
      {width > 0 && n > 0 && (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="block overflow-visible">
          <defs>
            <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={POS} stopOpacity={0.22} />
              <stop offset="1" stopColor={POS} stopOpacity={0} />
            </linearGradient>
          </defs>
          {ticks.map((v) => (
            <g key={v}>
              <line x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} stroke={GRID} strokeWidth={v === 0 ? 1.25 : 1} strokeDasharray={v === 0 ? undefined : "2 5"} />
              <text x={pl - 12} y={y(v) + 4} textAnchor="end" fontSize={11} fill={MUTED} className="tabular-nums">
                {formatAxis(v)}
              </text>
            </g>
          ))}
          {data.map((d, i) =>
            i % labelEvery ? null : (
              <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={11} fill={MUTED}>
                {d.label}
              </text>
            ),
          )}
          {/* The curve draws itself in whenever the data changes. */}
          <motion.path
            key={dataKey}
            d={line}
            fill="none"
            stroke={POS}
            strokeWidth={2.25}
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, ease: EASE_ARR, delay: 0.1 }}
          />
          <motion.path
            key={`a${dataKey}`}
            d={`${line} L${x(n - 1)} ${H - pb} L${x(0)} ${H - pb}Z`}
            fill={`url(#${uid})`}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          {data.map((d, i) => (
            <motion.circle
              key={`${dataKey}-${i}`}
              cx={x(i)}
              cy={y(d.value)}
              r={i === n - 1 ? 4.5 : 3}
              fill={colorOf(d.value)}
              stroke={CARD}
              strokeWidth={2}
              initial={reduce ? false : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + (i / Math.max(1, n - 1)) * 1.3, type: "spring", stiffness: 500, damping: 26 }}
            />
          ))}
          <circle className="jr-halo" cx={x(n - 1)} cy={y(data[n - 1].value)} r={4.5} fill={colorOf(data[n - 1].value)} />
          {h != null && (
            <>
              <line x1={x(h)} x2={x(h)} y1={pt} y2={H - pb} stroke={MUTED} strokeDasharray="2 3" opacity={0.6} />
              <circle cx={x(h)} cy={y(hv)} r={7} fill={CARD} stroke={colorOf(hv)} strokeWidth={2.5} />
            </>
          )}
          <rect
            x={pl}
            y={0}
            width={Math.max(0, W - pl - pr)}
            height={H}
            fill="transparent"
            style={{ cursor: onPointClick ? "pointer" : "crosshair" }}
            onPointerMove={(e) => setHover(pick(e.clientX, (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect()))}
            onPointerLeave={() => setHover(null)}
            onClick={(e) => {
              const i = pick(e.clientX, (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect());
              if (i != null) onPointClick?.(i);
            }}
          />
        </svg>
      )}
      {h != null && (
        <Tip x={x(h)} y={y(hv)} show>
          <TipLabel>{data[h].label}</TipLabel>
          <TipValue tone={signed ? (hv >= 0 ? "pos" : "neg") : undefined}>{formatValue(hv)}</TipValue>
          {prev && (
            <div className="mt-0.5 text-muted-foreground">
              {hv - prev.value >= 0 ? "▲" : "▼"} {formatValue(Math.abs(hv - prev.value)).replace(/^[+−-]/, "")} vs {prev.label}
            </div>
          )}
        </Tip>
      )}
    </div>
  );
}

// ─── Bars ────────────────────────────────────────────────────────────────

export interface BarDatum {
  label: string;
  value: number;
  /** Extra tooltip line, e.g. "12 trades". */
  sub?: string;
}

interface JBarChartProps {
  data: BarDatum[];
  /** "signed": green profit / red loss. "mono": one ink colour (counts, %). */
  mode?: "signed" | "mono";
  formatAxis: (v: number) => string;
  formatValue: (v: number) => string;
  /** Fixed top of the scale (e.g. 100 for percentages). */
  max?: number;
  /** Dashed gold reference line, e.g. { value: 50, label: "50%" }. */
  reference?: { value: number; label: string };
  height?: number;
  ariaLabel: string;
  onBarClick?: (index: number) => void;
}

export function JBarChart({ data, mode = "signed", formatAxis, formatValue, max, reference, height = 256, ariaLabel, onBarClick }: JBarChartProps) {
  const [wrap, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const uid = useMemo(() => `jb${Math.random().toString(36).slice(2, 8)}`, []);
  const reduce = useReducedMotion();
  const dataKey = data.map((d) => d.value).join(",");
  const W = Math.max(260, width);
  const H = height;
  const pl = 56, pr = 8, pt = 24, pb = 32;
  const n = data.length;
  const { lo, hi, ticks } = scaleY(data.map((d) => d.value), 4, max);
  const band = (W - pl - pr) / Math.max(1, n);
  const bw = Math.min(48, band * 0.58);
  const r = Math.min(6, bw / 3);
  const x = (i: number) => pl + i * band + (band - bw) / 2;
  const y = (v: number) => pt + ((hi - v) / (hi - lo)) * (H - pt - pb);
  const shape = (xx: number, v: number) => {
    const y0 = y(0);
    const y1 = y(v);
    const h = Math.max(Math.abs(y1 - y0), 1.5);
    const rr = Math.min(r, h);
    return v >= 0
      ? `M${xx} ${y0}V${y1 + rr}Q${xx} ${y1} ${xx + rr} ${y1}H${xx + bw - rr}Q${xx + bw} ${y1} ${xx + bw} ${y1 + rr}V${y0}Z`
      : `M${xx} ${y0}V${y1 - rr}Q${xx} ${y1} ${xx + rr} ${y1}H${xx + bw - rr}Q${xx + bw} ${y1} ${xx + bw} ${y1 - rr}V${y0}Z`;
  };
  const fill = (v: number) => (mode === "mono" ? `url(#${uid}m)` : v >= 0 ? `url(#${uid}p)` : `url(#${uid}n)`);
  // Axis labels: with many bars (e.g. 24 hours) label every few so they don't
  // collide; with a handful of categories, shorten each name to fit its bar.
  const CHAR_W = 6.4;
  const longest = Math.max(1, ...data.map((d) => d.label.length));
  const labelEvery = n > 12 ? Math.max(1, Math.ceil((longest * CHAR_W + 10) / Math.max(1, band))) : 1;
  const maxChars = Math.max(3, Math.floor((band - 6) / CHAR_W));
  const short = (s: string) => (n > 12 || s.length <= maxChars ? s : `${s.slice(0, maxChars - 1)}…`);

  return (
    <div ref={wrap} className="relative w-full" style={{ height: H }}>
      {width > 0 && n > 0 && (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="block overflow-visible">
          <defs>
            <linearGradient id={`${uid}p`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={POS} stopOpacity={1} />
              <stop offset="1" stopColor={POS} stopOpacity={0.55} />
            </linearGradient>
            <linearGradient id={`${uid}n`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={NEG} stopOpacity={0.55} />
              <stop offset="1" stopColor={NEG} stopOpacity={1} />
            </linearGradient>
            <linearGradient id={`${uid}m`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={INK} stopOpacity={0.85} />
              <stop offset="1" stopColor={INK} stopOpacity={0.45} />
            </linearGradient>
          </defs>
          {ticks.map((v) => (
            <g key={v}>
              <line x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} stroke={GRID} strokeWidth={v === 0 ? 1.25 : 1} strokeDasharray={v === 0 ? undefined : "2 5"} />
              <text x={pl - 12} y={y(v) + 4} textAnchor="end" fontSize={11} fill={MUTED} className="tabular-nums">
                {formatAxis(v)}
              </text>
            </g>
          ))}
          {reference && (
            <g>
              <line x1={pl} x2={W - pr} y1={y(reference.value)} y2={y(reference.value)} stroke={GOLD} strokeDasharray="5 4" />
              <text x={W - pr} y={y(reference.value) - 7} textAnchor="end" fontSize={11} fontWeight={600} fill={GOLD}>
                {reference.label}
              </text>
            </g>
          )}
          {data.map((d, i) => {
            const on = hover === i;
            return (
              <g key={i}>
                <motion.path
                  key={`${dataKey}-${i}`}
                  d={shape(x(i), d.value)}
                  fill={fill(d.value)}
                  style={{ transformBox: "fill-box", originY: d.value >= 0 ? 1 : 0 }}
                  initial={reduce ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1, opacity: hover != null && !on ? 0.3 : 1 }}
                  transition={{ scaleY: { duration: 0.9, ease: EASE_ARR, delay: i * 0.07 }, opacity: { duration: 0.25 } }}
                />
                <text
                  x={x(i) + bw / 2}
                  y={d.value >= 0 ? y(d.value) - 8 : y(d.value) + 16}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill={INK}
                  className="tabular-nums"
                  style={{ opacity: on ? 1 : 0, transition: "opacity .2s" }}
                >
                  {formatAxis(d.value)}
                </text>
                {i % labelEvery === 0 && (
                  <text x={x(i) + bw / 2} y={H - 10} textAnchor="middle" fontSize={11} fill={MUTED}>
                    {short(d.label)}
                  </text>
                )}
              </g>
            );
          })}
          {data.map((_, i) => (
            <rect
              key={`hit${i}`}
              x={pl + i * band}
              y={0}
              width={band}
              height={H}
              fill="transparent"
              style={{ cursor: onBarClick ? "pointer" : "default" }}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              onClick={() => onBarClick?.(i)}
            />
          ))}
        </svg>
      )}
      {hover != null && (
        <Tip x={x(hover) + bw / 2} y={Math.min(y(data[hover].value), y(0)) - 14} show>
          <TipLabel>{data[hover].label}</TipLabel>
          <TipValue tone={mode === "mono" ? undefined : data[hover].value >= 0 ? "pos" : "neg"}>{formatValue(data[hover].value)}</TipValue>
          {data[hover].sub && <div className="mt-0.5 text-muted-foreground">{data[hover].sub}</div>}
        </Tip>
      )}
    </div>
  );
}

// ─── Donut ───────────────────────────────────────────────────────────────

export interface DonutDatum {
  label: string;
  value: number;
}

interface JDonutProps {
  data: DonutDatum[];
  /** Word under the total, e.g. "tag uses" or "trades". */
  centerLabel: string;
  /** Segment colours in order; defaults to the site's categorical series. */
  colors?: readonly string[];
  /** Shown after the count in the legend, e.g. a P&L figure. */
  legendExtra?: (d: DonutDatum, index: number) => React.ReactNode;
  /** Replaces the count column in the legend (e.g. a signed P&L). */
  legendValue?: (d: DonutDatum, index: number) => React.ReactNode;
  /** Replaces the total in the middle (e.g. net P&L). */
  centerValue?: string;
  ariaLabel: string;
  onSelect?: (index: number) => void;
}

export function JDonut({ data, centerLabel, colors = chartColors.series, legendExtra, legendValue, centerValue, ariaLabel, onSelect }: JDonutProps) {
  const [hover, setHover] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const S = 196;
  const c = S / 2;
  const R = 72;
  const C = 2 * Math.PI * R;
  const total = data.reduce((a, d) => a + d.value, 0);
  const dataKey = data.map((d) => d.value).join(",");
  let acc = 0;
  const segs = data.map((d, i) => {
    const len = total > 0 ? (d.value / total) * C : 0;
    const off = -acc;
    acc += len;
    return { len, off, i };
  });
  const color = (i: number) => colors[i % colors.length];
  const centerText = centerValue ?? total.toLocaleString("en-IN");

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
      <div className="relative mx-auto aspect-square w-full max-w-[12rem]">
        <svg viewBox={`0 0 ${S} ${S}`} className="h-full w-full" role="img" aria-label={ariaLabel}>
          <g transform={`rotate(-90 ${c} ${c})`}>
            <circle cx={c} cy={c} r={R} fill="none" stroke="hsl(var(--secondary))" strokeWidth={26} />
            {segs.map(({ len, off, i }) => {
              const on = hover === i;
              return (
                <motion.circle
                  key={`${dataKey}-${i}`}
                  cx={c}
                  cy={c}
                  r={R}
                  fill="none"
                  stroke={color(i)}
                  strokeDasharray={`${Math.max(len - 3, 0)} ${C}`}
                  initial={reduce ? false : { strokeDashoffset: C }}
                  animate={{ strokeDashoffset: off, strokeWidth: on ? 32 : 26, opacity: hover != null && !on ? 0.2 : 1 }}
                  transition={{
                    strokeDashoffset: { duration: 1.4, ease: EASE_ARR, delay: i * 0.09 },
                    strokeWidth: { duration: 0.25, ease: EASE_ARR },
                    opacity: { duration: 0.25 },
                  }}
                  style={{ cursor: onSelect ? "pointer" : "default" }}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                  onClick={() => onSelect?.(i)}
                />
              );
            })}
          </g>
          <text
            x={c}
            y={c - 2}
            textAnchor="middle"
            fontSize={centerText.length > 8 ? 17 : centerText.length > 6 ? 21 : 26}
            fontWeight={600}
            fill={INK}
            className="tabular-nums"
            style={{ letterSpacing: "-0.02em" }}
          >
            {centerText}
          </text>
          <text x={c} y={c + 18} textAnchor="middle" fontSize={12} fill={MUTED}>
            {centerLabel}
          </text>
        </svg>
      </div>
      <ul className="grid gap-0.5">
        {data.map((d, i) => (
          <li key={d.label}>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors",
                hover === i ? "bg-secondary" : "hover:bg-secondary",
              )}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => onSelect?.(i)}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: color(i) }} aria-hidden="true" />
              <span className="min-w-0 truncate text-foreground">{d.label}</span>
              <span className="text-xs text-muted-foreground/80">{total ? Math.round((d.value / total) * 100) : 0}%</span>
              <span className="ml-auto flex items-center gap-3 tabular-nums text-muted-foreground">
                {legendExtra?.(d, i)}
                <span>{legendValue ? legendValue(d, i) : d.value.toLocaleString("en-IN")}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
