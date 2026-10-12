// "Load sample data" control + "you're viewing sample data" banner, shared by
// the Journal and Gini layouts. The data itself is handled by
// ../lib/sampleMode.ts; this is only the switch.
//
// Uses plain Tailwind colours (not the feature design tokens) so it renders
// the same inside Journal's `journal-scope` and Gini's `gini-scope`.
import { useEffect, useRef, useState } from 'react';
import { Database, FlaskConical, X } from 'lucide-react';

export interface SampleDataOption {
  id: string;
  name: string;
  description: string;
  /** Short stat line shown under the description, e.g. "86 trades · +₹1.2L". */
  meta?: string;
}

interface SampleDataBarProps {
  /** Feature name for copy, e.g. "Journal". */
  feature: string;
  active: boolean;
  /** Name of the loaded dataset, shown in the banner. */
  activeName?: string | null;
  options: SampleDataOption[];
  onLoad: (optionId: string) => void;
  onExit: () => void;
  /**
   * `bar` (default): full-width strip / banner under the header.
   * `button`: only the compact control, for placing inside a nav bar.
   * `banner`: only the "viewing sample data" banner (renders nothing when off).
   */
  placement?: 'bar' | 'button' | 'banner';
  /** Text on the load button (default "Load sample data"). */
  label?: string;
}

const SampleDataBar = ({ feature, active, activeName, options, onLoad, onExit, placement = 'bar', label = 'Load sample data' }: SampleDataBarProps) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  // While sample data is on, the banner is the one place to exit. Showing an
  // "Exit" button in the nav as well made the control appear twice.
  if (active && placement === 'button') return null;

  if (!active && placement === 'banner') return null;

  if (active) {
    return (
      <div
        role="status"
        className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-sm"
      >
        <FlaskConical className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 min-w-0">
          <strong className="font-semibold">Sample data{activeName ? `: ${activeName}` : ''}.</strong>{' '}
          You're previewing {feature} with demo data. Nothing you add or change here is saved.
        </span>
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 font-medium hover:bg-amber-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
          Exit sample mode
        </button>
      </div>
    );
  }

  const handlePick = (id: string) => {
    setOpen(false);
    onLoad(id);
  };

  return (
    <div className={placement === 'button' ? 'flex items-center' : 'flex justify-end px-4 py-2 bg-white border-b border-gray-200'}>
      <div className="relative" ref={panelRef}>
        <button
          type="button"
          onClick={() => (options.length === 1 ? handlePick(options[0].id) : setOpen((v) => !v))}
          aria-expanded={options.length > 1 ? open : undefined}
          aria-haspopup={options.length > 1 ? 'true' : undefined}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 whitespace-nowrap hover:bg-gray-50 transition-colors"
        >
          <Database className="w-4 h-4" aria-hidden="true" />
          {label}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 z-50 w-[min(22rem,calc(100vw-2rem))] max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl p-2">
            <p className="px-2 pt-1 pb-2 text-xs text-gray-500">
              Preview {feature} with demo data. Your real data isn't touched.
            </p>
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handlePick(option.id)}
                className="w-full text-left rounded-lg px-3 py-2.5 hover:bg-emerald-50 transition-colors"
              >
                <div className="text-sm font-semibold text-gray-900">{option.name}</div>
                <div className="text-xs text-gray-600 mt-0.5">{option.description}</div>
                {option.meta && <div className="text-xs font-medium text-gray-500 mt-1 tabular-nums">{option.meta}</div>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SampleDataBar;
