// Win-rate ring: wins in green and losses in red around one full circle,
// with a tick dial outside it. Arcs draw in on mount (switched off for
// reduced motion by the global media query in index.css).
import { useEffect, useState } from "react";
import RollingNumber from "@/components/motion/RollingNumber";

interface WinRateRingProps {
  wins: number;
  losses: number;
  /** Closed trades that broke even count in the total but in neither arc. */
  total: number;
}

const SIZE = 240;
const C = SIZE / 2;
const R = 82;
const STROKE = 13;
const CIRC = 2 * Math.PI * R;
const GAP = 4; // px of empty track between the two arcs

export default function WinRateRing({ wins, losses, total }: WinRateRingProps) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  const winFrac = total > 0 ? wins / total : 0;
  const lossFrac = total > 0 ? losses / total : 0;
  const winLen = Math.max(0, winFrac * CIRC - (lossFrac > 0 ? GAP : 0));
  const lossLen = Math.max(0, lossFrac * CIRC - (winFrac > 0 ? GAP : 0));
  const rate = total > 0 ? (wins / total) * 100 : 0;

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
    const major = i % 5 === 0;
    const r1 = R + STROKE / 2 + 9;
    const r2 = r1 + (major ? 9 : 5);
    const inWins = i / 60 < winFrac;
    return (
      <line
        key={i}
        x1={C + r1 * Math.cos(a)}
        y1={C + r1 * Math.sin(a)}
        x2={C + r2 * Math.cos(a)}
        y2={C + r2 * Math.sin(a)}
        style={{ stroke: inWins ? "rgb(var(--brand) / 0.7)" : "hsl(var(--muted-foreground) / 0.35)" }}
        strokeWidth={major ? 1.6 : 1}
        strokeLinecap="round"
      />
    );
  });

  const arc = (len: number, offset: number, color: string, delay: number) => (
    <circle
      cx={C}
      cy={C}
      r={R}
      fill="none"
      style={{
        stroke: color,
        // The arc grows from its start point: animate the dash length.
        strokeDasharray: `${drawn ? len : 0} ${CIRC}`,
        strokeDashoffset: -offset,
        opacity: len > 0 ? 1 : 0,
        transition: `stroke-dasharray 1.4s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
      strokeWidth={STROKE}
      strokeLinecap="round"
      transform={`rotate(-90 ${C} ${C})`}
    />
  );

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[15rem]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full" role="img" aria-label={`Win rate ${rate.toFixed(1)}%: ${wins} wins, ${losses} losses`}>
        {ticks}
        <circle cx={C} cy={C} r={R} fill="none" style={{ stroke: "hsl(var(--secondary))" }} strokeWidth={STROKE} />
        {arc(winLen, 0, "rgb(var(--brand))", 100)}
        {arc(lossLen, winFrac * CIRC + (winFrac > 0 && lossFrac > 0 ? GAP / 2 : 0), "hsl(var(--destructive))", 350)}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <RollingNumber value={`${rate.toFixed(1)}%`} className="xt-metric text-3xl text-foreground" />
        <span className="mt-1 text-xs tabular-nums text-muted-foreground">
          {wins} W · {losses} L
        </span>
      </div>
    </div>
  );
}
