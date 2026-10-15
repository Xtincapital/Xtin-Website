import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import useRegion from '../../../hooks/useRegion';
import RollingNumber from '../../../components/motion/RollingNumber';

// Same maths as the SIP calculator (features/tools/components/sip.tsx):
// FV = P × ((1 + r)^n − 1) / r × (1 + r), monthly compounding, paid in advance.
function sipValue(monthly: number, annualPct: number, months: number) {
  const r = annualPct / 12 / 100;
  if (r === 0) return monthly * months;
  return monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
}

const SAMPLES = 48; // fixed point count so the chart path can morph smoothly
const W = 600;
const H = 240;
const PAD = { l: 8, r: 8, t: 16, b: 8 };

export default function SipPlayground() {
  const { symbol } = useRegion();
  const reduce = useReducedMotion();
  const isINR = symbol === '₹';
  const locale = isINR ? 'en-IN' : 'en-US';
  const range = isINR ? { min: 500, max: 100000, step: 500, start: 10000 } : { min: 50, max: 10000, step: 50, start: 500 };

  const [monthly, setMonthly] = useState(range.start);
  // The region resolves after first paint; follow it until the user moves the slider.
  const touched = useRef(false);
  useEffect(() => {
    if (!touched.current) setMonthly(range.start);
  }, [range.start]);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(12);
  const [hover, setHover] = useState<number | null>(null);
  const gid = useId().replace(/:/g, '');

  const full = (v: number) => `${symbol}${Math.round(v).toLocaleString(locale)}`;
  const short = (v: number) => {
    if (isINR) {
      if (v >= 1e7) return `₹${(v / 1e7).toFixed(v >= 1e9 ? 0 : 2)} Cr`;
      if (v >= 1e5) return `₹${(v / 1e5).toFixed(1)} L`;
      return `₹${Math.round(v / 1000)}K`;
    }
    return `${symbol}${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v)}`;
  };

  const months = years * 12;
  const total = sipValue(monthly, rate, months);
  const invested = monthly * months;
  const gains = total - invested;
  const multiple = total / invested;

  const chart = useMemo(() => {
    const pts = Array.from({ length: SAMPLES + 1 }, (_, k) => {
      const m = (k / SAMPLES) * months;
      return { m, inv: monthly * m, val: sipValue(monthly, rate, m) };
    });
    const max = pts[pts.length - 1].val || 1;
    const x = (k: number) => PAD.l + (k / SAMPLES) * (W - PAD.l - PAD.r);
    const y = (v: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);
    const path = (key: 'inv' | 'val') => pts.map((p, k) => `${k ? 'L' : 'M'}${x(k).toFixed(2)} ${y(p[key]).toFixed(2)}`).join(' ');
    const area = (key: 'inv' | 'val') => `${path(key)} L${x(SAMPLES).toFixed(2)} ${H - PAD.b} L${PAD.l} ${H - PAD.b} Z`;
    return { pts, max, x, y, valLine: path('val'), invLine: path('inv'), valArea: area('val'), invArea: area('inv') };
  }, [monthly, rate, months]);

  // Hover readout at a whole year, from the formula (not the sampled path).
  const hp = hover != null ? { year: hover, inv: monthly * hover * 12, val: sipValue(monthly, rate, hover * 12) } : null;
  const hx = hover != null ? PAD.l + (hover / years) * (W - PAD.l - PAD.r) : 0;
  const fill = (v: number, min: number, max: number) => `${((v - min) / (max - min)) * 100}%`;
  const tween = reduce ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <section aria-labelledby="xp-sip-title" className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-[var(--xp-tile-shadow)] md:p-7">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-brand">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Quick plan
        </div>
        <h2 id="xp-sip-title" className="mt-1 text-2xl font-bold tracking-[-0.02em] text-foreground [text-wrap:balance] md:text-3xl">
          What could your monthly SIP become?
        </h2>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <Slider
            id="xp-sip-monthly"
            label="Monthly investment"
            value={full(monthly)}
            min={range.min}
            max={range.max}
            step={range.step}
            raw={monthly}
            onChange={(v) => {
              touched.current = true;
              setMonthly(v);
            }}
            fill={fill(monthly, range.min, range.max)}
          />
          <Slider id="xp-sip-years" label="Time period" value={`${years} years`} min={1} max={40} step={1} raw={years} onChange={setYears} fill={fill(years, 1, 40)} />
          <Slider id="xp-sip-rate" label="Expected return (a year)" value={`${rate}%`} min={1} max={30} step={0.5} raw={rate} onChange={setRate} fill={fill(rate, 1, 30)} />

          <div className="grid grid-cols-2 gap-3">
            <div className="xp-panel rounded-2xl p-4">
              <div className="text-xs font-bold text-muted-foreground">You invest</div>
              <div className="mt-1 whitespace-nowrap text-lg font-bold tabular-nums text-foreground" title={full(invested)}>{short(invested)}</div>
            </div>
            <div className="xp-panel rounded-2xl p-4">
              <div className="text-xs font-bold text-muted-foreground">Est. returns</div>
              <div className="mt-1 whitespace-nowrap text-lg font-bold tabular-nums text-brand" title={full(gains)}>+{short(gains)}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/tools/sip" className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-sm font-bold text-foreground transition hover:border-brand-line hover:text-brand">
              Full SIP calculator <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/tools/step-up-sip" className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground">
              Try a step-up SIP
            </Link>
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-muted-foreground">Value after {years} years</div>
              <div className="text-4xl font-bold tracking-[-0.03em] text-foreground md:text-5xl" aria-live="polite">
                <RollingNumber value={full(total)} />
              </div>
            </div>
            <span className="mb-1.5 rounded-full bg-brand-soft px-3 py-1 text-sm font-bold text-brand">{multiple.toFixed(1)}× your money</span>
          </div>

          <div
            className="relative mt-4 min-h-[14rem] flex-1"
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const t = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
              setHover(Math.round(t * years)); // snap to whole years
            }}
            onPointerLeave={() => setHover(null)}
          >
            <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" role="img" aria-label={`Projected value grows from ${full(0)} to ${full(total)} over ${years} years; ${full(invested)} of it is what you put in.`}>
              <defs>
                <linearGradient id={`${gid}-v`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(22 163 74)" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="rgb(22 163 74)" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((g) => (
                <line key={g} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + g * (H - PAD.t - PAD.b)} y2={PAD.t + g * (H - PAD.t - PAD.b)} stroke="var(--xp-panel-line)" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
              ))}
              <motion.path initial={false} animate={{ d: chart.valArea }} transition={tween} fill={`url(#${gid}-v)`} />
              <motion.path initial={false} animate={{ d: chart.invArea }} transition={tween} fill="var(--xp-panel-line)" fillOpacity="0.75" />
              <motion.path initial={false} animate={{ d: chart.invLine }} transition={tween} fill="none" stroke="currentColor" className="text-muted-foreground" strokeWidth="1.5" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />
              <motion.path initial={false} animate={{ d: chart.valLine }} transition={tween} fill="none" stroke="rgb(var(--brand))" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              {hp && (
                <line x1={hx} x2={hx} y1={PAD.t - 6} y2={H - PAD.b} stroke="currentColor" className="text-foreground/40" vectorEffect="non-scaling-stroke" />
              )}
            </svg>
            {hp && (
              <>
                <span
                  className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-fill shadow dark:border-[#1F1F1F]"
                  style={{ left: `${(hx / W) * 100}%`, top: `${(chart.y(hp.val) / H) * 100}%` }}
                />
                <div
                  className="pointer-events-none absolute top-0 z-10 w-44 rounded-xl border border-border bg-popover p-3 text-xs shadow-lg"
                  style={{ left: `clamp(0px, calc(${(hx / W) * 100}% - 5.5rem), calc(100% - 11rem))` }}
                >
                  <div className="font-bold text-foreground">{hp.year === 0 ? 'Today' : `After ${hp.year} year${hp.year > 1 ? 's' : ''}`}</div>
                  <div className="mt-1 flex justify-between gap-2 text-muted-foreground">
                    <span>Value</span>
                    <span className="font-bold tabular-nums text-brand">{short(hp.val)}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-muted-foreground">
                    <span>Invested</span>
                    <span className="font-bold tabular-nums text-foreground">{short(hp.inv)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded bg-brand-fill" aria-hidden="true" /> Value
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0 w-4 border-t-2 border-dashed border-muted-foreground" aria-hidden="true" /> Invested
              </span>
            </span>
            <span>Assumed returns, not a promise. Markets go down too.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  raw,
  onChange,
  fill,
}: {
  id: string;
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  raw: number;
  onChange: (v: number) => void;
  fill: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-foreground">
          {label}
        </label>
        <span className="rounded-lg bg-brand-soft px-2.5 py-1 text-sm font-bold tabular-nums text-brand">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={raw}
        onChange={(e) => onChange(Number(e.target.value))}
        className="xp-range mt-2"
        style={{ ['--fill' as string]: fill }}
        aria-valuetext={value}
      />
    </div>
  );
}
