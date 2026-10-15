import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COURSE_COUNT, PRODUCTS, type ProductId } from '../lib/catalog';

// Two rings: the inner one is learning and planning, the outer one research
// and trading. Angles in degrees, 0 = right, clockwise.
const RINGS: { radius: number; spin: string; reverse?: boolean; items: { id: ProductId; angle: number }[] }[] = [
  {
    radius: 27,
    spin: '70s',
    items: [
      { id: 'learn', angle: -90 },
      { id: 'tools', angle: 0 },
      { id: 'newsletter', angle: 90 },
      { id: 'gini', angle: 180 },
    ],
  },
  {
    radius: 44,
    spin: '110s',
    reverse: true,
    items: [
      { id: 'fundakamental', angle: -45 },
      { id: 'backtest', angle: 45 },
      { id: 'algos', angle: 135 },
      { id: 'journal', angle: 225 },
    ],
  },
];

const pos = (radius: number, angle: number) => ({
  x: 50 + radius * Math.cos((angle * Math.PI) / 180),
  y: 50 + radius * Math.sin((angle * Math.PI) / 180),
});

export default function EcosystemOrbit() {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<ProductId | null>(null);

  // Gentle 3D tilt toward the pointer.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), { stiffness: 120, damping: 18 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
    setHovered(null);
  };

  const active = hovered ? PRODUCTS[hovered] : null;

  return (
    <div className="relative mx-auto w-full max-w-[500px] [perspective:1100px]" onPointerMove={onMove} onPointerLeave={onLeave}>
      <motion.div style={reduce ? undefined : { rotateX: rx, rotateY: ry }} className="xp-orbit relative aspect-square w-full [transform-style:preserve-3d]">
        {/* glow + rings */}
        <div aria-hidden="true" className="absolute inset-[22%] rounded-full bg-[var(--xp-glow-strong)] blur-3xl" />
        <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <radialGradient id="xp-disc" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgb(22 163 74)" stopOpacity="0.10" />
              <stop offset="100%" stopColor="rgb(22 163 74)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#xp-disc)" />
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--xp-ring)" strokeWidth="0.35" strokeDasharray="0.6 1.4" />
          <circle cx="50" cy="50" r="35.5" fill="none" stroke="var(--xp-ring)" strokeWidth="0.2" />
          <circle cx="50" cy="50" r="27" fill="none" stroke="var(--xp-ring-strong)" strokeWidth="0.3" />
        </svg>

        {/* comet arcs sweeping the rings */}
        <div aria-hidden="true" className="xp-orbit-spin" style={{ ['--xp-spin' as string]: '14s' }}>
          <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
            <defs>
              <linearGradient id="xp-comet" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgb(22 163 74)" stopOpacity="0" />
                <stop offset="100%" stopColor="rgb(22 163 74)" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="44" fill="none" stroke="url(#xp-comet)" strokeWidth="0.7" strokeLinecap="round" strokeDasharray="22 255" />
          </svg>
        </div>
        <div aria-hidden="true" className="xp-orbit-spin xp-rev" style={{ ['--xp-spin' as string]: '9s' }}>
          <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
            <circle cx="50" cy="50" r="27" fill="none" stroke="rgb(22 163 74)" strokeOpacity="0.7" strokeWidth="0.6" strokeLinecap="round" strokeDasharray="10 160" />
          </svg>
        </div>

        {/* product rings */}
        {RINGS.map((ring) => (
          <div key={ring.radius} className={cn('xp-orbit-spin', ring.reverse && 'xp-rev')} style={{ ['--xp-spin' as string]: ring.spin }}>
            <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
              {ring.items.map(({ id, angle }) => {
                const p = pos(ring.radius - 4.5, angle);
                const on = hovered === id;
                return (
                  <g key={id}>
                    <line x1={p.x} y1={p.y} x2="50" y2="50" stroke="rgb(22 163 74)" strokeOpacity={on ? 0.35 : 0.14} strokeWidth="0.3" />
                    <line
                      x1={p.x}
                      y1={p.y}
                      x2="50"
                      y2="50"
                      stroke="rgb(22 163 74)"
                      strokeOpacity={on ? 1 : 0.55}
                      strokeWidth={on ? 0.7 : 0.45}
                      strokeLinecap="round"
                      className="xp-beam transition-[stroke-opacity] duration-300"
                    />
                  </g>
                );
              })}
            </svg>
            {ring.items.map(({ id, angle }) => {
              const p = pos(ring.radius, angle);
              const product = PRODUCTS[id];
              const on = hovered === id;
              return (
                <div key={id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                  <div className="xp-orbit-upright" style={{ ['--xp-spin' as string]: ring.spin }}>
                    <Link
                      to={product.path}
                      aria-label={`${product.name}: ${product.tagline}`}
                      onPointerEnter={() => setHovered(id)}
                      onFocus={() => setHovered(id)}
                      onBlur={() => setHovered(null)}
                      className="group flex flex-col items-center gap-1.5 rounded-2xl outline-none"
                    >
                      <span
                        className={cn(
                          'xp-node flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-300 lg:h-14 lg:w-14',
                          on ? 'scale-110 border-brand text-white !bg-brand-fill' : 'border-border text-brand',
                          'group-focus-visible:ring-4 group-focus-visible:ring-brand/30',
                        )}
                      >
                        <product.Icon className="h-5 w-5 lg:h-6 lg:w-6" strokeWidth={1.9} aria-hidden="true" />
                      </span>
                      <span
                        className={cn(
                          'whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold transition-colors duration-300',
                          on ? 'bg-brand-soft text-brand' : 'bg-card/80 text-foreground/80 backdrop-blur',
                        )}
                      >
                        {product.name}
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* core */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[29%] w-[29%] [transform:translate3d(-50%,-50%,40px)]">
          <span aria-hidden="true" className="xp-pulse absolute inset-0 rounded-full border border-brand/50" />
          <span aria-hidden="true" className="xp-pulse xp-delay absolute inset-0 rounded-full border border-brand/40" />
          <div className="xp-node relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-brand-line">
            <AnimatePresence mode="wait" initial={false}>
              {active ? (
                <motion.div
                  key={active.id}
                  initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center px-2 text-center"
                >
                  <active.Icon className="h-6 w-6 text-brand lg:h-7 lg:w-7" strokeWidth={1.9} aria-hidden="true" />
                  <span className="mt-1 text-xs font-bold leading-tight text-foreground lg:text-sm">{active.name}</span>
                  <span className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-bold text-brand">
                    Open <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="core"
                  initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center"
                >
                  <span className="text-2xl font-bold tracking-[-0.03em] text-foreground lg:text-3xl">
                    Xtin<span className="text-brand">.</span>
                  </span>
                  <span className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">One account</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* floating facts, lifted off the plane for depth */}
        {/* in the corners, outside the outer ring's path */}
        <div aria-hidden="true" className="pointer-events-none absolute -left-3 -top-1 [transform:translateZ(70px)]">
          <FactChip value="8" label="products" />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute -right-3 top-[3%] [transform:translateZ(90px)]">
          <FactChip value="20+" label="calculators" />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-1 -right-1 [transform:translateZ(60px)]">
          <FactChip value={String(COURSE_COUNT)} label="courses" />
        </div>
      </motion.div>
    </div>
  );
}

function FactChip({ value, label }: { value: string; label: string }) {
  return (
    <div className="xp-node flex items-baseline gap-1.5 rounded-xl border border-border px-3 py-2">
      <span className="text-lg font-bold tabular-nums text-brand">{value}</span>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}
