// Admin: send the daily newsletters by hand.
//
// Render's free tier sleeps, so the backend's 8 AM / 5 PM timers can't be
// relied on — the scheduler is off by default and editions are sent from
// here instead. Pressing a button also wakes the server. The backend
// (POST /api/admin/newsletter/run) starts the run in the background, since
// generating three markets and emailing subscribers takes a few minutes; this
// page polls GET /api/admin/newsletter/status until it finishes.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Moon, RefreshCw, Send, Sun } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import authService from '../../../services/authService';
import { BACKEND_URL } from '../../../config/env';
import { isAdminEmail } from '../../../config/admin';
import SEO from '../../../components/SEO';
import AdminHeader from '@/features/admin/components/AdminHeader';

type Edition = 'pre_market' | 'post_market';

interface Run {
  timestamp: string;
  completedAt: string | null;
  source: string;
  status: 'running' | 'success' | 'failed';
  result: {
    success?: boolean;
    edition?: Edition;
    totalSent?: number;
    error?: string;
    markets?: Record<string, { generated: boolean; sent: number; error?: string; skippedSend?: string }>;
  } | null;
}

const EDITIONS: { id: Edition; name: string; time: string; blurb: string; Icon: typeof Sun }[] = [
  { id: 'pre_market', name: 'Pre-Market Brief', time: '8:00 AM', blurb: 'Overnight moves, today’s events and levels to watch.', Icon: Sun },
  { id: 'post_market', name: 'Post-Market Wrap', time: '5:00 PM', blurb: 'What moved today and why, winners, losers and tomorrow’s watchlist.', Icon: Moon },
];

const POLL_MS = 10000;

const istDay = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
const istTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/** Which edition a run was for: the result says so once it's finished; a
 *  manual run's source names it from the start. */
const editionOf = (run: Run): Edition | null => {
  if (run.result?.edition) return run.result.edition;
  const m = run.source.match(/^admin-manual:(pre_market|post_market)/);
  return (m?.[1] as Edition) ?? null;
};

const triggerLabel = (source: string) =>
  source.startsWith('admin-manual') ? `Manual (${source.split(':')[2] || 'admin'})` : source.startsWith('in-process-cron') ? 'Automatic timer' : 'External trigger';

async function api<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; body: T }> {
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api${path}`, init);
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

const AdminNewsletters = () => {
  const { user } = useAuth();
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState<Edition | null>(null);
  const [confirming, setConfirming] = useState<Edition | null>(null);
  const [notice, setNotice] = useState('');
  const pollRef = useRef<ReturnType<typeof setTimeout>>();

  const running = runs.find((r) => r.status === 'running');

  const loadStatus = useCallback(async () => {
    try {
      const { ok, body } = await api<{ data?: { executionHistory: Run[] }; error?: string; message?: string }>('/admin/newsletter/status');
      if (!ok) throw new Error(body.error || body.message || 'Could not load newsletter status');
      setRuns(body.data?.executionHistory || []);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load newsletter status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAdminEmail(user.email)) loadStatus();
  }, [user, loadStatus]);

  // Poll only while a run is in progress — one small request every 10s.
  useEffect(() => {
    clearTimeout(pollRef.current);
    if (running) pollRef.current = setTimeout(loadStatus, POLL_MS);
    return () => clearTimeout(pollRef.current);
  }, [running, runs, loadStatus]);

  const sentToday = (edition: Edition) =>
    runs.find((r) => editionOf(r) === edition && r.status === 'success' && istDay(r.timestamp) === istDay(new Date().toISOString()));

  const send = async (edition: Edition) => {
    if (sentToday(edition) && confirming !== edition) {
      setConfirming(edition);
      return;
    }
    setConfirming(null);
    setStarting(edition);
    setNotice('');
    setError('');
    try {
      const { ok, status, body } = await api<{ message?: string; error?: string }>('/admin/newsletter/run', {
        method: 'POST',
        body: JSON.stringify({ edition }),
      });
      if (!ok) throw new Error(status === 409 ? body.message : body.error || body.message || 'Could not start the newsletter');
      setNotice('Started. Generating and emailing takes a few minutes — you can leave this page, it keeps going on the server.');
      await loadStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start the newsletter');
    } finally {
      setStarting(null);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-900">
        <p className="text-lg text-gray-600 dark:text-slate-300">Please log in to access the admin panel.</p>
      </div>
    );
  }

  if (!isAdminEmail(user.email)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg dark:border-red-900/50 dark:bg-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Access Denied</h2>
          <p className="mt-2 text-gray-500 dark:text-slate-400">You are not authorized to send newsletters.</p>
          <p className="mt-4 text-xs text-gray-400 dark:text-slate-500">Logged in as: {user.email}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Admin — Newsletters — Xtin Capital" />
      <AdminHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Newsletters</h1>
              <p className="mt-2 text-gray-600 dark:text-slate-400">
                Send each edition yourself. Each run writes India, US and Global versions and emails the subscribers who get them.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setLoading(true); loadStatus(); }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              Refresh
            </button>
          </div>

          {error && (
            <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}
          {notice && (
            <div role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
              {notice}
            </div>
          )}

          {running && (
            <div role="status" className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
              <span>
                {EDITIONS.find((e) => e.id === editionOf(running))?.name || 'A newsletter'} is being generated and sent (started {istTime(running.timestamp)}). This page updates automatically.
              </span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {EDITIONS.map(({ id, name, time, blurb, Icon }) => {
              const done = sentToday(id);
              const isConfirming = confirming === id;
              return (
                <div key={id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-slate-100">{name}</h2>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Usually {time} IST</p>
                    </div>
                  </div>
                  <p className="mb-4 flex-1 text-sm text-gray-600 dark:text-slate-400">{blurb}</p>
                  <p className={`mb-4 text-sm font-medium ${done ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-slate-400'}`}>
                    {done ? `Sent today at ${istTime(done.timestamp)}${done.result?.totalSent != null ? ` · ${done.result.totalSent} emails` : ''}` : 'Not sent yet today'}
                  </p>
                  <button
                    type="button"
                    onClick={() => send(id)}
                    disabled={!!running || !!starting}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      isConfirming ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {starting === id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                    {starting === id ? 'Starting… (the server may take a minute to wake)' : isConfirming ? 'Already sent today — click again to resend' : `Send ${name}`}
                  </button>
                  {isConfirming && (
                    <button type="button" onClick={() => setConfirming(null)} className="mt-2 text-xs text-gray-500 underline hover:text-gray-700 dark:text-slate-400">
                      Cancel
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="border-b border-gray-200 px-6 py-4 font-semibold text-gray-900 dark:border-slate-700 dark:text-slate-100">Recent runs</h2>
            {loading && runs.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-500 dark:text-slate-400">Loading… (the server may take a minute to wake up)</p>
            ) : runs.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-500 dark:text-slate-400">No runs yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-gray-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-3 font-medium">Started (IST)</th>
                      <th className="px-6 py-3 font-medium">Edition</th>
                      <th className="px-6 py-3 font-medium">Trigger</th>
                      <th className="px-6 py-3 font-medium">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {runs.map((run) => {
                      const markets = Object.entries(run.result?.markets || {})
                        .map(([m, r]) => `${m}: ${r.error ? 'failed' : r.skippedSend ? 'not sent (quality)' : r.generated ? `${r.sent} sent` : 'skipped'}`)
                        .join(' · ');
                      return (
                        <tr key={run.timestamp} className="text-gray-700 dark:text-slate-300">
                          <td className="whitespace-nowrap px-6 py-3">{istTime(run.timestamp)}</td>
                          <td className="whitespace-nowrap px-6 py-3">{EDITIONS.find((e) => e.id === editionOf(run))?.name || '—'}</td>
                          <td className="px-6 py-3 text-xs">{triggerLabel(run.source)}</td>
                          <td className="px-6 py-3">
                            <span
                              className={`mr-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                                run.status === 'success'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                  : run.status === 'running'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                              }`}
                            >
                              {run.status}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-slate-400">{run.result?.error || markets}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminNewsletters;
