import { useEffect, useMemo, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MARKETS, formatIn, istDayStart, marketStatus, type MarketState } from '../lib/marketClock';

const PILL: Record<MarketState, { label: string; cls: string; dot: string }> = {
  open: { label: 'Open', cls: 'bg-brand-soft text-brand border-brand-line', dot: 'bg-brand-fill xp-live-dot' },
  pre: { label: 'Pre-open', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/30', dot: 'bg-amber-500' },
  closed: { label: 'Closed', cls: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground/50' },
};

const HOURS = [0, 3, 6, 9, 12, 15, 18, 21, 24];

// Column widths on md+ (the now-line is placed with the same numbers).
const C1 = '10.5rem';
const C2 = '7rem';
const C4 = '11.5rem';
const GAP = '1.25rem';

export default function MarketClock() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Statuses only change by the minute.
  const minute = Math.floor(now / 60_000);
  const rows = useMemo(() => MARKETS.map((m) => marketStatus(m, minute * 60_000 + 1)), [minute]);
  const dayFraction = (now - istDayStart(now)) / 86_400_000;
  const openCount = rows.filter((r) => r.state === 'open' && r.market.id !== 'crypto').length;

  const needleLeft = `calc(${C1} + ${C2} + 2 * ${GAP} + (100% - ${C1} - ${C2} - ${C4} - 3 * ${GAP}) * ${dayFraction.toFixed(5)})`;

  return (
    <section aria-labelledby="xp-markets-title" className="rounded-3xl border border-border bg-card p-5 shadow-[var(--xp-tile-shadow)] md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Clock3 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="xp-markets-title" className="text-lg font-bold text-foreground">
              Markets right now
            </h2>
            <p className="text-sm text-muted-foreground">
              {openCount === 0 ? 'No stock exchange on this list is trading.' : `${openCount} of 4 exchanges trading.`} Regular hours in IST; holidays aren’t shown.
            </p>
          </div>
        </div>
        <div className="sm:text-right">
          <div className="text-3xl font-bold tabular-nums tracking-[-0.02em] text-foreground" aria-live="off">
            {formatIn(now, { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-xs font-semibold text-muted-foreground">IST · {formatIn(now, { weekday: 'long', day: 'numeric', month: 'short' })}</div>
        </div>
      </div>

      <div className="relative mt-6">
        {/* hour axis (md+) */}
        <div
          aria-hidden="true"
          className="hidden md:grid"
          style={{ gridTemplateColumns: `${C1} ${C2} 1fr ${C4}`, columnGap: GAP }}
        >
          <span />
          <span />
          <div className="relative h-5">
            {HOURS.map((h) => (
              <span
                key={h}
                className="absolute top-0 -translate-x-1/2 text-[11px] font-semibold tabular-nums text-muted-foreground"
                style={{ left: `${(h / 24) * 100}%` }}
              >
                {String(h).padStart(2, '0')}
              </span>
            ))}
          </div>
          <span />
        </div>

        <ul className="divide-y divide-border md:divide-y-0">
          {rows.map((row) => {
            const pill = PILL[row.state];
            return (
              <li
                key={row.market.id}
                className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3 md:grid-cols-[var(--c1)_var(--c2)_1fr_var(--c4)] md:gap-x-[var(--gap)] md:py-2.5"
                style={{ ['--c1' as string]: C1, ['--c2' as string]: C2, ['--c4' as string]: C4, ['--gap' as string]: GAP }}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-foreground">{row.market.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{row.market.detail}</div>
                </div>
                <span className={cn('inline-flex w-fit items-center gap-1.5 justify-self-end rounded-full border px-2.5 py-1 text-xs font-bold md:justify-self-start', pill.cls)}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', pill.dot)} aria-hidden="true" />
                  {pill.label}
                </span>
                <div className="relative hidden h-3 overflow-hidden rounded-full xp-hatch md:block" aria-hidden="true">
                  {row.segments.map((s, i) => (
                    <span
                      key={i}
                      className={cn(
                        'absolute inset-y-0 rounded-full',
                        s.pre ? 'bg-amber-400/70' : row.state === 'open' ? 'bg-brand-fill' : 'bg-brand-fill/45',
                      )}
                      style={{ left: `${s.from * 100}%`, width: `${Math.max(0.6, (s.to - s.from) * 100)}%` }}
                    />
                  ))}
                </div>
                <div className="col-span-2 text-xs font-semibold text-muted-foreground md:col-span-1 md:text-right md:text-sm">{row.note}</div>
              </li>
            );
          })}
        </ul>

        {/* now-line across every track (md+) */}
        <div aria-hidden="true" className="pointer-events-none absolute bottom-1 top-6 hidden w-px bg-foreground/70 md:block" style={{ left: needleLeft }}>
          <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-foreground" />
        </div>
      </div>
    </section>
  );
}
