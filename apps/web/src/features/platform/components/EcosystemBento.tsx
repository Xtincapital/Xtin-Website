import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ProPill } from '../../../components/ProMark';
import { cn } from '@/lib/utils';
import { PRODUCTS, type ProductId } from '../lib/catalog';
import {
  AlgosPreview,
  BacktestPreview,
  FundakamentalPreview,
  GiniPreview,
  JournalPreview,
  LearnPreview,
  NewsletterPreview,
  ToolsPreview,
} from './BentoPreviews';

const TILES: { id: ProductId; className: string; Preview: () => JSX.Element; cta: string }[] = [
  { id: 'gini', className: 'md:col-span-2 lg:row-span-2', Preview: GiniPreview, cta: 'Plan with Gini' },
  { id: 'fundakamental', className: 'md:col-span-2', Preview: FundakamentalPreview, cta: 'Research a company' },
  { id: 'journal', className: '', Preview: JournalPreview, cta: 'Open your journal' },
  { id: 'backtest', className: '', Preview: BacktestPreview, cta: 'Test an idea' },
  { id: 'algos', className: '', Preview: AlgosPreview, cta: 'Browse strategies' },
  { id: 'tools', className: '', Preview: ToolsPreview, cta: 'Open calculators' },
  { id: 'learn', className: '', Preview: LearnPreview, cta: 'Start learning' },
  { id: 'newsletter', className: '', Preview: NewsletterPreview, cta: 'Read the brief' },
];

export default function EcosystemBento({ pro }: { pro: Partial<Record<ProductId, boolean>> }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:auto-rows-[minmax(21rem,auto)] lg:grid-cols-4 lg:gap-5"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.06 } } }}
    >
      {TILES.map(({ id, className, Preview, cta }) => {
        const p = PRODUCTS[id];
        const big = id === 'gini';
        return (
          <motion.div
            key={id}
            className={cn('min-w-0', className)}
            variants={{
              hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.98 },
              show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
            }}
          >
            <Link
              to={p.path}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
              }}
              className="xp-tile group flex h-full flex-col rounded-3xl border border-border bg-card p-5 outline-none focus-visible:ring-4 focus-visible:ring-brand/30 md:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      'flex shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors duration-300 group-hover:bg-brand-fill group-hover:text-white',
                      big ? 'h-12 w-12' : 'h-10 w-10',
                    )}
                  >
                    <p.Icon className={big ? 'h-6 w-6' : 'h-5 w-5'} strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <h3 className={cn('truncate font-bold text-foreground', big ? 'text-2xl' : 'text-lg')}>{p.name}</h3>
                  {pro[id] && <ProPill className="shrink-0" />}
                </div>
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 group-hover:rotate-45 group-hover:border-brand-fill group-hover:bg-brand-fill group-hover:text-white"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <p className={cn('mt-2 text-muted-foreground', big ? 'max-w-md text-base' : 'text-sm')}>{p.tagline}</p>
              <div className="relative mt-4 min-h-[11rem] flex-1">
                <Preview />
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand">
                {cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
