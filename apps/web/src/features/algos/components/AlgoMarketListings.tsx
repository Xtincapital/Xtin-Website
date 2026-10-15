// AlgoMarket: algorithms from community publishers that our team has approved
// (publisher applications with status "approved", see ../lib/publisherApi.ts).
// Results are the publisher's own and are labelled as such.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { ASSET_LABELS, EXPERIENCE_LABELS, STRATEGY_LABELS, publisherApi, type MarketAlgo } from '../lib/publisherApi';
import ApproxPrice from '@/components/ApproxPrice';

const label = (map: Record<string, string>, v: string) => map[v] || v;

function AlgoCard({ algo }: { algo: MarketAlgo }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-gray-900 break-words">{algo.algo_name}</h3>
          <p className="text-sm text-gray-500">by {algo.applicant_name}</p>
        </div>
        <span className="shrink-0 rounded-full bg-brand-soft text-brand px-2.5 py-0.5 text-xs font-semibold">Approved</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{label(STRATEGY_LABELS, algo.strategy_type)}</span>
        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{label(ASSET_LABELS, algo.asset_class)}</span>
        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{label(EXPERIENCE_LABELS, algo.experience)} trading</span>
      </div>
      <p className={`text-gray-700 text-sm whitespace-pre-line ${open ? '' : 'line-clamp-3'}`}>{algo.description}</p>
      {open && (
        <div className="mt-4">
          <h4 className="text-base font-semibold text-gray-900 mb-1">Backtest results (reported by the publisher)</h4>
          <p className="text-sm text-gray-700 whitespace-pre-line">{algo.backtest_summary}</p>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-3 inline-flex items-center gap-1 self-start text-sm font-medium text-brand hover:underline"
      >
        {open ? 'Show less' : 'View details'}
        {open ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
      </button>
      <div className="mt-auto pt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
        <div>
          <div className="xt-metric text-gray-900 dark:text-white">₹{Number(algo.expected_price).toLocaleString('en-IN')}</div>
          <div className="text-xs text-gray-500">Publisher's listed price</div>
          <ApproxPrice inr={Number(algo.expected_price)} className="text-gray-500" />
        </div>
        <Link
          to="/contact"
          className="bg-brand-fill hover:bg-brand-hover text-white font-semibold px-5 py-2.5 rounded-lg transition"
        >
          Request access
        </Link>
      </div>
    </article>
  );
}

/**
 * Renders the approved algorithms followed by `footer`, or only `empty` when
 * there are none (or they can't be loaded).
 */
export default function AlgoMarketListings({ empty, footer }: { empty: React.ReactNode; footer?: React.ReactNode }) {
  const [algos, setAlgos] = useState<MarketAlgo[] | null>(null);

  useEffect(() => {
    let live = true;
    publisherApi
      .listMarket()
      .then((list) => live && setAlgos(list))
      .catch(() => live && setAlgos([]));
    return () => {
      live = false;
    };
  }, []);

  if (algos === null) {
    return (
      <div className="flex justify-center py-12 text-gray-500" role="status">
        <Loader2 className="w-6 h-6 animate-spin mr-2" aria-hidden="true" /> Loading algorithms…
      </div>
    );
  }
  if (!algos.length) return <>{empty}</>;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {algos.map((a) => (
          <AlgoCard key={a.id} algo={a} />
        ))}
      </div>
      <p className="mt-6 text-xs text-gray-500 text-center max-w-3xl mx-auto">
        AlgoMarket algorithms are built and run by independent publishers. Our team reviews each one before listing it, but the
        backtest figures are the publisher's own and have not been independently verified. Past or backtested performance does not
        guarantee future results.
      </p>
      {footer}
    </>
  );
}
