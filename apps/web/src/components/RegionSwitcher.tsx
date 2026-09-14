import React, { useEffect, useRef, useState } from 'react';
import { REGIONS, REGION_ORDER } from '../lib/region';
import useRegion from '../hooks/useRegion';

/**
 * Compact region + currency switcher. Shows the active region's flag +
 * currency; opens a dropdown of all supported regions. Changing it updates
 * prices, examples and calculators across the site instantly.
 */
export default function RegionSwitcher({ className = '' }) {
  const { region, config, setRegion } = useRegion();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-[10100] py-1">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">Region &amp; currency</div>
          {REGION_ORDER.map((code) => {
            const r = REGIONS[code];
            return (
              <button
                key={code}
                type="button"
                onClick={() => { setRegion(code); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <span className="text-base">{r.flag}</span>
                <span className="flex-1 text-gray-700 dark:text-gray-200">{r.name}</span>
                <span className="text-xs text-gray-400">{r.symbol.trim()} {r.currency}</span>
                {region === code && <span className="text-emerald-500">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
