import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CornerDownLeft, Search, Sparkles, UserRound } from 'lucide-react';
import useRegion from '../../../hooks/useRegion';
import { cn } from '@/lib/utils';
import { PRODUCTS, buildSearchIndex, searchIndex, type SearchItem } from '../lib/catalog';

const PROMPTS = ['SIP calculator', 'stock scanner', 'retirement plan', 'log a trade', 'income tax', 'options course'];

// Shown before the user types anything.
const SUGGESTED_PATHS = ['/gini', '/fundakamental/scanner', '/tools/sip', '/journal/trades', '/newsletter', '/backtest/app/strategies/new'];

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export default function CommandSearch() {
  const navigate = useNavigate();
  const { region } = useRegion();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [promptIdx, setPromptIdx] = useState(0);

  const index = useMemo(() => buildSearchIndex(region), [region]);
  const results: SearchItem[] = useMemo(() => {
    if (query.trim()) return searchIndex(index, query);
    return SUGGESTED_PATHS.map((path) => index.find((i) => i.path === path)).filter(Boolean) as SearchItem[];
  }, [index, query]);

  useEffect(() => setActive(0), [query]);

  // ⌘K / Ctrl+K or "/" focuses the search from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName) || (e.target as HTMLElement)?.isContentEditable;
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Rotating example in the placeholder.
  useEffect(() => {
    if (reduce || query) return;
    const id = window.setInterval(() => setPromptIdx((i) => (i + 1) % PROMPTS.length), 2600);
    return () => window.clearInterval(id);
  }, [reduce, query]);

  const go = (item?: SearchItem) => {
    if (!item) return;
    setOpen(false);
    navigate(item.path);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === 'Escape') {
      if (query) setQuery('');
      else inputRef.current?.blur();
      setOpen(false);
    }
  };

  const showList = open && results.length > 0;
  const noMatches = open && query.trim() && results.length === 0;

  // Group headers in result order.
  let lastGroup = '';

  return (
    <div className="relative w-full max-w-xl" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setOpen(false)}>
      <label htmlFor="xp-search" className="sr-only">
        Search products, calculators and courses
      </label>
      <div
        className={cn(
          'group relative flex h-14 items-center gap-3 rounded-2xl border bg-card pl-4 pr-2 transition-all duration-300',
          'shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-16px_rgba(16,24,40,0.18)]',
          open ? 'border-brand ring-4 ring-brand/15' : 'border-border hover:border-brand-line',
        )}
      >
        <Search className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-focus-within:text-brand" aria-hidden="true" />
        <div className="relative h-full flex-1">
          <input
            ref={inputRef}
            id="xp-search"
            type="text"
            role="combobox"
            aria-expanded={showList}
            aria-controls="xp-search-list"
            aria-activedescendant={showList ? `xp-opt-${results[active]?.id}` : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="peer h-full w-full bg-transparent text-base text-foreground outline-none"
          />
          {!query && (
            <div className="pointer-events-none absolute inset-0 flex items-center gap-1.5 overflow-hidden text-base text-muted-foreground">
              <span>Search Xtin, try</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={promptIdx}
                  initial={reduce ? false : { y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduce ? undefined : { y: -14, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="truncate font-medium text-foreground/70"
                >
                  “{PROMPTS[promptIdx]}”
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>
        <kbd className="hidden h-8 shrink-0 items-center gap-1 rounded-lg border border-border bg-muted px-2 text-xs font-semibold text-muted-foreground sm:inline-flex">
          {isMac ? '⌘' : 'Ctrl'} K
        </kbd>
      </div>

      <AnimatePresence>
        {(showList || noMatches) && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: -4, scale: 0.99, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 origin-top overflow-hidden rounded-2xl border border-border bg-popover shadow-[0_24px_64px_-24px_rgba(16,24,40,0.35)]"
          >
            {noMatches ? (
              <div className="flex items-center gap-3 px-4 py-5 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-brand" aria-hidden="true" />
                <span>
                  Nothing matches “{query}”. Try{' '}
                  <button type="button" className="font-semibold text-brand hover:underline" onMouseDown={(e) => e.preventDefault()} onClick={() => { setOpen(false); navigate('/gini'); }}>
                    asking Gini
                  </button>{' '}
                  instead.
                </span>
              </div>
            ) : (
              <ul id="xp-search-list" role="listbox" aria-label="Search results" className="max-h-[22rem] overflow-y-auto p-2">
                {!query.trim() && <li className="px-3 pb-1 pt-2 text-xs font-bold text-muted-foreground">Suggested</li>}
                {results.map((item, i) => {
                  const header = query.trim() && item.group !== lastGroup ? item.group : null;
                  lastGroup = item.group;
                  const Icon = item.product ? PRODUCTS[item.product].Icon : UserRound;
                  return (
                    <li key={item.id} role="presentation">
                      {header && <div className="px-3 pb-1 pt-2 text-xs font-bold text-muted-foreground">{header}</div>}
                      <div
                        id={`xp-opt-${item.id}`}
                        role="option"
                        aria-selected={i === active}
                        tabIndex={-1}
                        onMouseEnter={() => setActive(i)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => go(item)}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                          i === active ? 'bg-brand-soft' : 'hover:bg-muted',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
                            i === active ? 'border-brand-line bg-card text-brand' : 'border-border bg-card text-muted-foreground',
                          )}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">{item.label}</span>
                          <span className="block truncate text-xs text-muted-foreground first-letter:uppercase">{item.hint}</span>
                        </span>
                        {i === active ? (
                          <CornerDownLeft className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                        ) : (
                          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/0" aria-hidden="true" />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">
                <kbd className="font-sans font-semibold">↑</kbd> <kbd className="font-sans font-semibold">↓</kbd> to move · <kbd className="font-sans font-semibold">↵</kbd> to open
              </span>
              <span>{index.length} places across Xtin</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
