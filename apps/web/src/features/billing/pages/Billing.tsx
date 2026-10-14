// /billing — the signed-in member's purchase history, one downloadable receipt per payment.
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Download, ReceiptText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { COMPANY } from "@/constants/company";
import { fetchReceipts, type Receipt } from "../lib/api";
import { formatMoney, formatReceiptDate } from "../lib/format";
import RedeemCodeCard from "@/features/coupons/components/RedeemCodeCard";

function StatusBadge({ status }: { status: Receipt["status"] }) {
  return status === "refunded" ? (
    <span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">Refunded</span>
  ) : (
    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">Paid</span>
  );
}

function DownloadButton({ receipt }: { receipt: Receipt }) {
  const [busy, setBusy] = useState(false);
  const download = async () => {
    setBusy(true);
    try {
      const { downloadReceiptPdf } = await import("../lib/receiptPdf");
      downloadReceiptPdf(receipt);
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      type="button"
      onClick={download}
      disabled={busy}
      aria-label={`Download receipt ${receipt.receipt_no}`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    >
      <Download size={14} /> {busy ? "Preparing…" : "PDF"}
    </button>
  );
}

export default function Billing() {
  const [receipts, setReceipts] = useState<Receipt[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setReceipts(await fetchReceipts());
    } catch (e) {
      setError((e as Error)?.message || "Could not load your receipts");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SEO title="Billing & Receipts" description="Your Xtin Capital purchase history and receipts." canonicalUrl="/billing" noIndex />
      <Navbar />

      <main className="mt-20 flex-grow px-4 py-10 md:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-emerald-600 dark:text-slate-400">
            <ArrowLeft size={14} /> Dashboard
          </Link>

          <div>
            <h1 className="xt-title">Billing &amp; receipts</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Every purchase you make on Xtin Capital, with a downloadable receipt.</p>
          </div>

          <RedeemCodeCard onRedeemed={() => setTimeout(load, 1500)} />

          {error ? (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </span>
              <button type="button" onClick={load} className="rounded-lg bg-white px-3 py-1.5 font-medium text-rose-700 shadow-sm dark:bg-rose-900 dark:text-rose-100">
                Try again
              </button>
            </div>
          ) : receipts === null ? (
            <div className="space-y-3" aria-busy="true" aria-label="Loading receipts">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800/70" />
              ))}
            </div>
          ) : receipts.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
              <ReceiptText size={32} className="text-slate-400" />
              <h2 className="mt-3 font-semibold">No purchases yet</h2>
              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">When you buy a plan or a token pack, its receipt will show up here.</p>
              <Link to="/dashboard" className="mt-5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                Browse plans
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                    <tr>
                      <th scope="col" className="px-5 py-3 font-medium">Date</th>
                      <th scope="col" className="px-5 py-3 font-medium">Item</th>
                      <th scope="col" className="px-5 py-3 font-medium">Receipt no.</th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">Amount</th>
                      <th scope="col" className="px-5 py-3 font-medium">Status</th>
                      <th scope="col" className="px-5 py-3"><span className="sr-only">Download</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {receipts.map((r) => (
                      <tr key={r.receipt_no}>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-300">{formatReceiptDate(r.paid_at)}</td>
                        <td className="px-5 py-4 font-medium">{r.description}</td>
                        <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{r.receipt_no}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums">{formatMoney(r.amount, r.currency)}</td>
                        <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                        <td className="px-5 py-4 text-right"><DownloadButton receipt={r} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="space-y-3 md:hidden">
                {receipts.map((r) => (
                  <li key={r.receipt_no} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium">{r.description}</div>
                        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{formatReceiptDate(r.paid_at)} · <span className="font-mono">{r.receipt_no}</span></div>
                      </div>
                      <div className="shrink-0 text-right font-semibold tabular-nums">{formatMoney(r.amount, r.currency)}</div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <StatusBadge status={r.status} />
                      <DownloadButton receipt={r} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Receipts are issued by {COMPANY.legalName} (GSTIN {COMPANY.gstin}). Prices include applicable taxes. Questions about a payment?
            Email <a className="text-emerald-600 hover:underline" href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a> with the receipt number.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
