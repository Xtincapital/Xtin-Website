// Admin: review algo publisher applications (AlgoMarket).
//
// Applicants submit from the Algos page; admins are emailed (see
// services/api/services/adminNotify.service.ts) and land here to read the
// submission, move it through pending -> under review -> approved/rejected, and
// leave a note the applicant sees. The backend (requireAdmin) enforces access;
// isAdminEmail only decides whether to show the page.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, Loader2, Mail, RefreshCw, XCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import authService from '../../../services/authService';
import { BACKEND_URL } from '../../../config/env';
import { isAdminEmail } from '../../../config/admin';
import SEO from '../../../components/SEO';
import { ASSET_LABELS, EXPERIENCE_LABELS, STRATEGY_LABELS, type ApplicationStatus, type PublisherApplication } from '../lib/publisherApi';
import AdminHeader from '@/features/admin/components/AdminHeader';

const STATUSES: { id: ApplicationStatus; label: string; badge: string }[] = [
  { id: 'pending', label: 'Pending', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  { id: 'under_review', label: 'Under review', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  { id: 'approved', label: 'Approved', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { id: 'rejected', label: 'Rejected', badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
];
const badgeOf = (s: ApplicationStatus) => STATUSES.find((x) => x.id === s)!;

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/algos/publisher-applications${path}`, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'Request failed');
  return body as T;
}

function ApplicationCard({ app, onSaved }: { app: PublisherApplication; onSaved: (a: PublisherApplication) => void }) {
  const [open, setOpen] = useState(app.status === 'pending');
  const [note, setNote] = useState(app.review_note || '');
  const [busy, setBusy] = useState<ApplicationStatus | null>(null);
  const [error, setError] = useState('');

  const setStatus = async (status: ApplicationStatus) => {
    if (status === 'rejected' && !note.trim() && !window.confirm('Reject without a note? The applicant will not see a reason.')) return;
    setBusy(status);
    setError('');
    try {
      onSaved(await api<PublisherApplication>(`/${app.id}`, { method: 'PATCH', body: JSON.stringify({ status, review_note: note.trim() || null }) }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update');
    } finally {
      setBusy(null);
    }
  };

  const field = (label: string, value: string) => (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-sm text-gray-900 dark:text-slate-100">{value}</dd>
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 px-5 py-4 text-left" aria-expanded={open}>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900 dark:text-slate-100">{app.algo_name}</p>
          <p className="truncate text-sm text-gray-500 dark:text-slate-400">
            {app.applicant_name} · {when(app.created_at)}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeOf(app.status).badge}`}>{badgeOf(app.status).label}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="space-y-5 border-t border-gray-100 px-5 py-5 dark:border-slate-700">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {field('Applicant', app.applicant_name)}
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Email</dt>
              <dd className="mt-0.5 text-sm">
                <a href={`mailto:${app.applicant_email}`} className="inline-flex items-center gap-1 text-emerald-700 hover:underline dark:text-emerald-400">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  {app.applicant_email}
                </a>
              </dd>
            </div>
            {field('Experience', EXPERIENCE_LABELS[app.experience] || app.experience)}
            {field('Strategy', STRATEGY_LABELS[app.strategy_type] || app.strategy_type)}
            {field('Asset class', ASSET_LABELS[app.asset_class] || app.asset_class)}
            {field('Expected price', `₹${Number(app.expected_price).toLocaleString('en-IN')}`)}
          </dl>
          <dl className="space-y-4">
            {field('Backtest summary', app.backtest_summary)}
            {field('Description', app.description)}
          </dl>

          <div>
            <label htmlFor={`note-${app.id}`} className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
              Note to applicant (shown on their application)
            </label>
            <textarea
              id={`note-${app.id}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={2000}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {app.status !== 'under_review' && (
              <button type="button" disabled={!!busy} onClick={() => setStatus('under_review')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                {busy === 'under_review' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}Start review
              </button>
            )}
            <button type="button" disabled={!!busy} onClick={() => setStatus('approved')} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
              {busy === 'approved' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}Approve
            </button>
            <button type="button" disabled={!!busy} onClick={() => setStatus('rejected')} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
              {busy === 'rejected' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <XCircle className="h-4 w-4" aria-hidden="true" />}Reject
            </button>
            {app.reviewed_at && <span className="text-xs text-gray-500 dark:text-slate-400">Last decision {when(app.reviewed_at)}</span>}
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {app.status === 'approved'
              ? 'Listed publicly in AlgoMarket (name, algorithm, price, description and backtest; never the email). Change the status to remove it.'
              : 'Approving lists this algorithm publicly in AlgoMarket with the applicant\'s name, price, description and backtest (not their email).'}
          </p>
          {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}

const AdminAlgoApplications = () => {
  const { user } = useAuth();
  const [apps, setApps] = useState<PublisherApplication[]>([]);
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setApps(await api<PublisherApplication[]>('/all'));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAdminEmail(user.email)) load();
  }, [user, load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: apps.length };
    apps.forEach((a) => (c[a.status] = (c[a.status] || 0) + 1));
    return c;
  }, [apps]);
  const shown = filter === 'all' ? apps : apps.filter((a) => a.status === filter);

  if (!user || !isAdminEmail(user.email)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-slate-900">
        <p className="text-gray-600 dark:text-slate-300">{user ? 'Admin access only.' : 'Please log in to access the admin panel.'}</p>
      </div>
    );
  }

  return (
    <>
      <SEO title="Algo Applications – Admin" description="Review algo publisher applications." />
      <AdminHeader />
      <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="xt-title">Algo publisher applications</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">Check each submission, then approve or reject it. Your note is shown to the applicant.</p>
            </div>
            <button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />Refresh
            </button>
          </div>

          <div className="mb-5 flex flex-wrap gap-2" role="tablist">
            {[{ id: 'all' as const, label: 'All' }, ...STATUSES].map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={filter === t.id}
                onClick={() => setFilter(t.id)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${filter === t.id ? 'bg-gray-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'}`}
              >
                {t.label} <span className="opacity-70">{counts[t.id] || 0}</span>
              </button>
            ))}
          </div>

          {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}
          {loading && apps.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500 dark:text-slate-400">Loading… (the server may take a minute to wake up)</p>
          ) : shown.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500 dark:text-slate-400">No applications here.</p>
          ) : (
            <div className="space-y-3">
              {shown.map((a) => (
                <ApplicationCard key={a.id} app={a} onSaved={(u) => setApps((cur) => cur.map((x) => (x.id === u.id ? u : x)))} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminAlgoApplications;
