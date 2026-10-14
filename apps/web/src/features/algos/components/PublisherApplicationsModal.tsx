// "My applications" — the signed-in user's publisher applications: where each one
// stands (submitted / under review / approved / rejected) AND everything they
// submitted, so a mistake is easy to spot. While an application is still
// "Submitted" it can be edited; once our team starts reviewing it, it's locked.
import React, { useEffect, useState } from 'react';
import {
  publisherApi,
  ASSET_LABELS,
  EXPERIENCE_LABELS,
  STRATEGY_LABELS,
  type ApplicationStatus,
  type PublisherApplication,
} from '../lib/publisherApi';

const STATUS: Record<ApplicationStatus, { label: string; cls: string; hint: string }> = {
  pending: { label: 'Submitted', cls: 'bg-gray-100 text-gray-700', hint: 'Received — waiting for our team to pick it up. You can still edit it.' },
  under_review: { label: 'Under review', cls: 'bg-amber-100 text-amber-800', hint: 'Our team is reviewing your algorithm and backtest. Details are locked while we review.' },
  approved: { label: 'Approved', cls: 'bg-brand-soft text-brand', hint: 'Approved — we will contact you about next steps.' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800', hint: 'Not approved this time.' },
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
    <dd className="mt-0.5 text-sm text-gray-900 whitespace-pre-wrap break-words">{children}</dd>
  </div>
);

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called with the application the user wants to correct (only offered while pending). */
  onEdit: (application: PublisherApplication) => void;
  /** Bump to force a reload (e.g. right after a submit or an edit). */
  refreshKey?: number;
}

const PublisherApplicationsModal = ({ open, onClose, onEdit, refreshKey = 0 }: Props) => {
  const [items, setItems] = useState<PublisherApplication[] | null>(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    setItems(null);
    setError('');
    publisherApi
      .listMine()
      .then((list) => {
        setItems(list);
        // Show the newest application's details straight away.
        if (list[0]) setExpanded((e) => ({ ...e, [list[0].id]: true }));
      })
      .catch((e) => setError(e.message || 'Could not load your applications.'));
  }, [open, refreshKey]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto" onClick={onClose} role="dialog" aria-modal="true" aria-label="My publisher applications">
      <div className="min-h-full flex justify-center p-4">
        <div className="bg-white rounded-2xl max-w-xl w-full my-auto shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 z-10 bg-white p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">My publisher applications</h2>
            <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-5 space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!error && items === null && <p className="text-sm text-gray-500">Loading…</p>}
            {items?.length === 0 && <p className="text-sm text-gray-600">You haven’t applied yet. Use “Apply to Publish” to submit your algorithm.</p>}
            {items?.map((a) => {
              const st = STATUS[a.status] || STATUS.pending;
              const open = !!expanded[a.id];
              return (
                <div key={a.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{a.algo_name}</p>
                      <p className="text-xs text-gray-500">
                        Applied {fmtDate(a.created_at)}
                        {a.updated_at && a.updated_at !== a.created_at && Math.abs(new Date(a.updated_at).getTime() - new Date(a.created_at).getTime()) > 60000
                          ? ` · edited ${fmtDate(a.updated_at)}`
                          : ''}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${st.cls}`}>{st.label}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{st.hint}</p>
                  {a.review_note && (
                    <p className="mt-2 text-sm text-gray-800 bg-gray-50 rounded-lg p-3">
                      <strong>Note from our team:</strong> {a.review_note}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="text-sm font-semibold text-brand hover:underline"
                      onClick={() => setExpanded((e) => ({ ...e, [a.id]: !open }))}
                      aria-expanded={open}
                    >
                      {open ? 'Hide what I submitted' : 'View what I submitted'}
                    </button>
                    {a.status === 'pending' && (
                      <button type="button" className="text-sm font-semibold text-blue-700 hover:underline" onClick={() => onEdit(a)}>
                        Edit details
                      </button>
                    )}
                  </div>

                  {open && (
                    <dl className="mt-4 grid gap-3 border-t border-gray-100 pt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Your name">{a.applicant_name}</Field>
                        <Field label="Email">{a.applicant_email}</Field>
                      </div>
                      <Field label="Algorithm name">{a.algo_name}</Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Strategy type">{STRATEGY_LABELS[a.strategy_type] || a.strategy_type}</Field>
                        <Field label="Asset class">{ASSET_LABELS[a.asset_class] || a.asset_class}</Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Expected price">₹{Number(a.expected_price).toLocaleString('en-IN')}</Field>
                        <Field label="Trading experience">{EXPERIENCE_LABELS[a.experience] || a.experience}</Field>
                      </div>
                      <Field label="Backtesting results summary">{a.backtest_summary}</Field>
                      <Field label="Algorithm description">{a.description}</Field>
                    </dl>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublisherApplicationsModal;
