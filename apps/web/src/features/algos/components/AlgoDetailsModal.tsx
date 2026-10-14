// "View details" modal for an algo card: principle, what's included, what you
// need before buying, how to use it afterwards, and the backtest report.
import React, { useEffect } from 'react';
import { ALGO_DETAILS } from './algoDetails';
import ApproxPrice from '@/components/ApproxPrice';

interface Props {
  algoName: string | null;
  onClose: () => void;
  onSubscribe: (algoName: string) => void;
}

const Check = () => (
  <svg className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-6">
    <h3 className="xt-eyebrow mb-3">{title}</h3>
    {children}
  </section>
);

const AlgoDetailsModal = ({ algoName, onClose, onSubscribe }: Props) => {
  const detail = algoName ? ALGO_DETAILS[algoName] : null;

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detail, onClose]);

  if (!detail) return null;
  const bt = detail.backtest;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 brand-on-dark"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${detail.name} details`}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-white flex items-start justify-between gap-4 bg-brand-fill">
          <div>
            <h2 className="text-2xl font-bold">{detail.name}</h2>
            <p className="text-white/85 text-sm mt-1">{detail.tagline}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">{detail.style}</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">{detail.timeframes}</span>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <Section title="How it works">
            <ul className="space-y-3 text-sm text-gray-700">
              {detail.principle.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <Check />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-gray-600">
              <strong className="text-gray-900">Best for:</strong> {detail.bestFor}
            </p>
          </Section>

          <Section title="What you get">
            <ul className="space-y-2 text-sm text-gray-700">
              {detail.included.map((i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Before you buy">
            <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
              <li>You need a TradingView account — we ask for your TradingView username so we can add the algorithm to it.</li>
              <li>TradingView alerts depend on your TradingView plan; the signals themselves show on the chart either way.</li>
              <li>The results below are historical backtests, not live trading results. Live results can and will differ.</li>
              <li>You place and manage your own trades. The strategy gives signals; it does not guarantee profits.</li>
              <li>Check the maximum drawdown and the losing streaks below and decide whether you can stay with the strategy through them.</li>
            </ul>
          </Section>

          <Section title="How to start after you subscribe">
            <ol className="space-y-2 text-sm text-gray-700 list-decimal pl-5">
              <li>Subscribe and enter your TradingView username.</li>
              <li>Our team adds the algorithm to your TradingView account within 24 hours.</li>
              <li>Open a chart of the market shown above and add it from your invite-only scripts.</li>
              <li>Follow the signals and the strategy’s built-in risk sizing, and set TradingView alerts if your plan supports them.</li>
            </ol>
          </Section>

          <Section title="Backtest results">
            <p className="text-xs text-gray-500 mb-3">
              {bt.market} · {bt.period}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ['Total return', bt.cumulativeReturn],
                ['Yearly return (CAGR)', bt.cagr],
                ['Max drawdown', bt.maxDrawdown],
                ['Sharpe ratio', bt.sharpe],
                ['Profit factor', bt.profitFactor],
                ['Win rate', bt.winRate],
                ['Trades', bt.trades],
                ['Balance drawdown', bt.balanceDrawdown],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-200 p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-left">
                    <th className="px-4 py-2 font-semibold">Year</th>
                    <th className="px-4 py-2 font-semibold text-right">Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bt.yearly.map((y) => (
                    <tr key={y.label}>
                      <td className="px-4 py-2 text-gray-700">{y.label}</td>
                      <td className={`px-4 py-2 text-right font-semibold ${y.value.startsWith('-') ? 'text-red-600' : 'text-brand'}`}>{y.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-3 space-y-1.5 text-sm text-gray-700 list-disc pl-5">
              {bt.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
              <li>Max drawdown is the larger equity drawdown from the report; balance drawdown counts realised results only.</li>
            </ul>

          </Section>

          <p className="text-xs text-gray-500">
            Past performance, including backtests, does not guarantee future results. Trading involves risk of loss. Signals are
            not investment advice.
          </p>
        </div>

        <div className="p-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button onClick={onClose} className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
            Close
          </button>
          <button
            onClick={() => onSubscribe(detail.name)}
            className="px-6 py-3 rounded-xl text-white font-semibold transition-all bg-brand-fill"
          >
            Subscribe — ₹4,999/month
          </button>
          <ApproxPrice inr={4999} suffix="/month" className="mt-2 block text-center text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default AlgoDetailsModal;
