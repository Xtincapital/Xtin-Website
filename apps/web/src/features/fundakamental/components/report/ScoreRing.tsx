// Overall score as a ring split into one arc per health metric. Each arc fills
// to its metric's score; hovering an arc (or its score card, via `active`)
// shows that metric in the centre.
import { motion } from "framer-motion";
import { scoreTone } from "../../lib/score";

const R = 78;
const C = 2 * Math.PI * R;

interface Props {
  overall: number;
  metrics: [string, number][];
  active: number | null;
  onActive: (i: number | null) => void;
}

export default function ScoreRing({ overall, metrics, active, onActive }: Props) {
  const n = Math.max(1, metrics.length);
  const seg = C / n;
  const gap = metrics.length > 1 ? 14 : 0;
  const parts: [string, number][] = metrics.length ? metrics : [["Overall", overall]];
  const shown = active != null && metrics[active] ? metrics[active] : null;

  return (
    <div className="relative h-[180px] w-[180px]">
      <svg width={180} height={180} viewBox="0 0 180 180" className="-rotate-90">
        {parts.map(([name, score], i) => {
          const len = Math.max(0, (seg - gap) * Math.min(10, score) / 10);
          const dim = active != null && active !== i;
          return (
            <g key={name} className={scoreTone(score)}>
              <circle
                cx={90} cy={90} r={R} fill="none" className="stroke-secondary" strokeWidth={12}
                strokeLinecap={gap ? "round" : "butt"}
                strokeDasharray={`${seg - gap} ${C}`} strokeDashoffset={-i * seg}
              />
              <motion.circle
                cx={90} cy={90} r={R} fill="none" stroke="currentColor"
                strokeLinecap="round" strokeDashoffset={-i * seg}
                initial={{ strokeDasharray: `0 ${C}` }}
                animate={{ strokeDasharray: `${len} ${C}`, opacity: dim ? 0.28 : 1, strokeWidth: active === i ? 15 : 12 }}
                transition={{ strokeDasharray: { duration: 1, delay: 0.15 + i * 0.12, ease: [0.2, 0.8, 0.2, 1] }, default: { duration: 0.2 } }}
                onPointerEnter={() => metrics.length && onActive(i)}
                onPointerLeave={() => onActive(null)}
                className="cursor-pointer"
              >
                <title>{`${name}: ${score}/10`}</title>
              </motion.circle>
            </g>
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
        <span className="text-5xl font-bold leading-none tabular-nums text-foreground">
          {(shown ? shown[1] : overall).toFixed(1)}
        </span>
        <span className="mt-1 text-xs text-muted-foreground capitalize">
          {shown ? `${shown[0]} / 10` : "Overall score / 10"}
        </span>
      </div>
    </div>
  );
}
