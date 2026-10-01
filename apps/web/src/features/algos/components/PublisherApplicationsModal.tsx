// "My applications" — shows the signed-in user's publisher applications and
// where each one stands (pending / under review / approved / rejected).
import React, { useEffect, useState } from 'react';
import { publisherApi, type ApplicationStatus, type PublisherApplication } from '../lib/publisherApi';

const STATUS: Record<ApplicationStatus, { label: string; cls: string; hint: string }> = {
  pending: { label: 'Submitted', cls: 'bg-gray-100 text-gray-700', hint: 'Received — waiting for our team to pick it up.' },
  under_review: { label: 'Under review', cls: 'bg-amber-100 text-amber-800', hint: 'Our team is reviewing your algorithm and backtest.' },
  approved: { label: 'Approved', cls: 'bg-green-100 text-green-800', hint: 'Approved — we will contact you about next steps.' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800', hint: 'Not approved this time.' },
};

interface Props {
  open: boolean;
  onClose: () => void;
}

const PublisherApplicationsModal = ({ open, onClose }: Props) => {
  const [items, setItems] = useState<PublisherApplication[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setItems(null);
    setError('');
    publisherApi.listMine().then(setItems).catch((e) => setError(e.message || 'Could not load your applications.'));
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="My publisher applications">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">My publisher applications</h2>
          <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 overflow-y-auto space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!error && items === null && <p className="text-sm text-gray-500">Loading…</p>}
          {items?.length === 0 && <p className="text-sm text-gray-600">You haven’t applied yet. Use “Apply to Publish” to submit your algorithm.</p>}
          {items?.map((a) => {
            const st = STATUS[a.status] || STATUS.pending;
            return (
              <div key={a.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{a.algo_name}</p>
                    <p className="text-xs text-gray-500">
                      Applied {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PublisherApplicationsModal;
