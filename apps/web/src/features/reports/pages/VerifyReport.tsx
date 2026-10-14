// Public "Verify a report" page. Anyone holding an Xtin report (Gini, Journal or
// Fundakamental) can check it here: type the report number, or arrive via the QR
// code on the report (/verify?r=<report no>&f=<fingerprint>). The backend answers
// from the issued_reports registry (services/api/modules/reports/issuedReports.ts).
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BadgeCheck, Loader2, ShieldAlert, SearchX } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import SEO from '../../../components/SEO';
import { BACKEND_URL } from '../../../config/env';

interface Result {
  found: boolean;
  report_no?: string;
  report_type?: string;
  issued_to?: string;
  issued_at?: string;
  fingerprint_match?: boolean | null;
}

const VerifyReport = () => {
  const [params, setParams] = useSearchParams();
  const [reportNo, setReportNo] = useState(params.get('r') || '');
  const [fingerprint, setFingerprint] = useState(params.get('f') || '');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const check = useCallback(async (r: string, f: string) => {
    if (!r.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const q = new URLSearchParams({ report_no: r.trim() });
      if (f.trim()) q.set('fingerprint', f.trim());
      const res = await fetch(`${BACKEND_URL}/api/reports/verify?${q}`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Could not check the report right now.');
      setResult(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not check the report right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Arriving from a QR code: check straight away.
  useEffect(() => {
    const r = params.get('r');
    if (r) check(r, params.get('f') || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(reportNo ? { r: reportNo.trim(), ...(fingerprint.trim() ? { f: fingerprint.trim() } : {}) } : {});
    check(reportNo, fingerprint);
  };

  const genuine = result?.found && result.fingerprint_match !== false;
  const altered = result?.found && result.fingerprint_match === false;

  return (
    <div className="min-h-screen bg-background text-gray-900">
      <SEO title="Verify a Report" description="Check that an Xtin Capital report is genuine: enter its report number or scan its QR code." canonicalUrl="/verify" />
      <Navbar />
      <main className="mx-auto mt-20 max-w-2xl px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-[-0.025em]">Verify a report</h1>
        <p className="mt-2 text-gray-600">
          Every Xtin Capital report carries a report number and a QR code. Enter the number to confirm the report was really issued by us, to whom, and when.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-medium" htmlFor="rno">Report number</label>
          <input id="rno" value={reportNo} onChange={(e) => setReportNo(e.target.value)} placeholder="XC-GN-20261006-0B1E7A2C" autoComplete="off" className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm" />
          <label className="block text-sm font-medium" htmlFor="fp">Fingerprint <span className="font-semibold text-gray-500">(optional, but it confirms the figures weren't changed)</span></label>
          <input id="fp" value={fingerprint} onChange={(e) => setFingerprint(e.target.value)} placeholder="7E37-2E93-81BC-6116-5E86-C5C0-B5A8-6818" autoComplete="off" className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm" />
          <button type="submit" disabled={loading || !reportNo.trim()} className="inline-flex items-center gap-2 rounded-lg bg-brand-fill px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50">
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}Verify
          </button>
        </form>

        <div aria-live="polite" className="mt-6">
          {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          {genuine && result && (
            <div className="rounded-2xl border border-brand-line bg-brand-soft p-6">
              <div className="flex items-center gap-2 text-brand"><BadgeCheck className="h-6 w-6" aria-hidden="true" /><h2 className="text-xl font-semibold">{result.fingerprint_match ? 'Genuine report: figures match' : 'Genuine report'}</h2></div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-gray-500">Report</dt><dd className="font-medium">{result.report_type}</dd></div>
                <div><dt className="text-gray-500">Report number</dt><dd className="font-mono font-medium">{result.report_no}</dd></div>
                <div><dt className="text-gray-500">Issued to</dt><dd className="font-medium">{result.issued_to}</dd></div>
                <div><dt className="text-gray-500">Issued on</dt><dd className="font-medium">{result.issued_at && new Date(result.issued_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' })} IST</dd></div>
              </dl>
              {result.fingerprint_match === null && <p className="mt-4 text-sm text-brand">This number was issued by Xtin Capital. Add the fingerprint printed on the report to also confirm its figures weren't altered.</p>}
            </div>
          )}

          {altered && (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-red-900">
              <div className="flex items-center gap-2"><ShieldAlert className="h-6 w-6" aria-hidden="true" /><h2 className="text-xl font-semibold">Fingerprint does not match</h2></div>
              <p className="mt-2 text-sm">This report number was issued, but the fingerprint you entered is different from the one we recorded. The copy may have been altered, or the fingerprint was mistyped. Please check it and try again.</p>
            </div>
          )}

          {result && !result.found && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-900">
              <div className="flex items-center gap-2"><SearchX className="h-6 w-6" aria-hidden="true" /><h2 className="text-xl font-semibold">No report found</h2></div>
              <p className="mt-2 text-sm">We have no record of that report number. Check for typos. Reports created before this page launched, or sample-data reports, are not on record.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyReport;
