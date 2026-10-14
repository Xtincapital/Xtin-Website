import React, { useEffect, useRef, useState } from 'react';
import { REGIONS, REGION_ORDER, crossRates, formatRate, getRates, getRatesSnapshot } from '../lib/region';
import useRegion from '../hooks/useRegion';

/**
 * Compact region + currency switcher. Shows the active region's flag +
 * currency; opens a dropdown of all supported regions. Changing it updates
 * prices, examples and calculators across the site instantly. The "i" next
 * to each currency shows what one unit of it is worth in each of the others.
 */
export default function RegionSwitcher({ className = '' }) {
  const { region, config, setRegion } = useRegion();
  const [open, setOpen] = useState(false);
  const [infoFor, setInfoFor] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState(() => getRatesSnapshot());
  const ref = useRef(null);

  // Load (or refresh from cache) the daily rates whenever the menu opens.
  useEffect(() => {
    if (!open) { setInfoFor(null); return; }
    let cancelled = false;
    getRates().then(() => { if (!cancelled) setSnapshot(getRatesSnapshot()); });
    return () => { cancelled = true; };
  }, [open]);

  const asOfLabel = snapshot.asOf
    ? new Date(snapshot.asOf).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;


  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change region and currency"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="text-base leading-none">{config.flag}</span>
        <span>{config.currency}</span>
        <svg className="w-3 h-3 opacity-60" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-[10100] py-1">
          <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">Region &amp; currency</div>
          {REGION_ORDER.map((code) => {
            const r = REGIONS[code];
            const showInfo = infoFor === code;
            return (
              <div key={code}>
                <div className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <button
                    type="button"
                    onClick={() => { setRegion(code); setOpen(false); }}
                    className="flex-1 flex items-center gap-2.5 pl-3 py-2 text-sm text-left"
                  >
                    <span className="text-base">{r.flag}</span>
                    <span className="flex-1 text-gray-700 dark:text-gray-200">{r.name}</span>
                    <span className="text-xs text-gray-400">{r.symbol.trim()} {r.currency}</span>
                    {region === code && <span className="text-brand">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInfoFor(showInfo ? null : code)}
                    aria-label={`${r.currency} against the other currencies`}
                    aria-expanded={showInfo}
                    className="mx-2 w-5 h-5 shrink-0 rounded-full border border-gray-300 dark:border-gray-500 text-xs font-semibold leading-none text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    i
                  </button>
                </div>
                {showInfo && (
                  <div className="mx-3 mb-2 rounded-lg bg-gray-50 dark:bg-gray-900/60 px-2.5 py-2 text-xs text-gray-600 dark:text-gray-300">
                    <p className="mb-1 font-semibold text-gray-700 dark:text-gray-200">1 {r.currency} equals</p>
                    <table className="w-full tabular-nums">
                      <tbody>
                        {crossRates(r.currency, snapshot.rates).map((x) => (
                          <tr key={x.currency}>
                            <td className="py-0.5 pr-2 font-medium text-gray-700 dark:text-gray-200">
                              {formatRate(x.perBase)} {x.currency}
                            </td>
                            <td className="py-0.5 text-right text-gray-400">
                              1 {x.currency} = {formatRate(x.basePer)} {r.currency}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="mt-1.5 text-xs text-gray-400">
                      {snapshot.live ? (asOfLabel ? `Rates as of ${asOfLabel}` : 'Live rates') : 'Approximate rates (live rates unavailable)'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
