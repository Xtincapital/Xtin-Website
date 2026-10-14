// Post-checkout receipt animation: processing → printing → complete.
// "processing" lasts until the order's receipt is issued (normally already
// done by the time checkout's verify call returns) and at least a beat, so
// the moment registers; then the paper feeds out of the printer.
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Download, ReceiptText, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { COMPANY } from "@/constants/company";
import { fetchReceiptByOrder, isFreeGrant, type Receipt } from "../lib/api";
import { formatMoney, formatReceiptDate } from "../lib/format";
import { RECEIPT_PRINT_DURATION_MS, ReceiptPrinter, type ReceiptPrinterStage } from "./ReceiptPrinter";

const MIN_PROCESSING_MS = 1100;
const POLL_INTERVAL_MS = 1500;
const POLL_ATTEMPTS = 8;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitForReceipt(orderId: string, isCancelled: () => boolean): Promise<Receipt | null> {
  for (let attempt = 0; attempt < POLL_ATTEMPTS && !isCancelled(); attempt++) {
    try {
      const receipt = await fetchReceiptByOrder(orderId);
      if (receipt) return receipt;
    } catch {
      // Network blip — keep trying until the attempts run out.
    }
    await sleep(POLL_INTERVAL_MS);
  }
  return null;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="shrink-0 opacity-60">{label}</span>
      <span className="min-w-0 truncate text-right">{value}</span>
    </div>
  );
}

const Divider = () => <div aria-hidden="true" className="my-3 border-t border-dashed border-current opacity-30" />;

function ReceiptSlip({ receipt }: { receipt: Receipt | null }) {
  return (
    <div className="text-xs leading-relaxed">
      <div className="text-center">
        <div className="text-sm font-bold tracking-[0.2em]">XTIN CAPITAL</div>
        <div className="opacity-60">{COMPANY.legalName}</div>
        <div className="opacity-60">GSTIN {COMPANY.gstin}</div>
      </div>
      <Divider />
      {receipt ? (
        <>
          <Row label="Receipt" value={receipt.receipt_no} />
          <Row label="Date" value={formatReceiptDate(receipt.paid_at, true)} />
          <Divider />
          <div className="break-words font-semibold">{receipt.description}</div>
          <Divider />
          <div className="flex items-baseline justify-between gap-3 text-sm font-bold">
            <span>TOTAL</span>
            <span>{formatMoney(receipt.amount, receipt.currency)}</span>
          </div>
          <div className="text-right text-xs opacity-60">Incl. of applicable taxes</div>
          <Divider />
          <Row label={isFreeGrant(receipt) ? "Ref" : "Payment"} value={receipt.payment_id} />
          <Row label="Paid via" value={isFreeGrant(receipt) ? "Coupon" : "Razorpay"} />
        </>
      ) : (
        <div className="py-6 text-center">
          <div className="font-semibold">Payment received</div>
          <div className="mt-1 opacity-60">Your receipt will appear under Billing in a minute.</div>
        </div>
      )}
      <Divider />
      <div className="text-center opacity-60">Thank you for your purchase!</div>
      <div aria-hidden="true" className="mt-3 flex h-8 justify-center gap-[2px] opacity-80">
        {Array.from({ length: 36 }, (_, i) => (
          <span key={i} className="h-full bg-current" style={{ width: [1, 2, 1, 3, 1, 2][(i * 7) % 6] }} />
        ))}
      </div>
    </div>
  );
}

export default function PurchaseReceiptDialog({
  orderId,
  resumed = false,
  onClose,
}: {
  orderId: string;
  /** Reopened after a page reload: skip straight to the printed receipt. */
  resumed?: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState<ReceiptPrinterStage>("processing");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [downloading, setDownloading] = useState(false);
  const doneRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;
    setStage("processing");
    setReceipt(null);
    (async () => {
      if (resumed) {
        const found = await waitForReceipt(orderId, () => cancelled);
        if (cancelled) return;
        setReceipt(found);
        setStage("complete");
        return;
      }
      const [found] = await Promise.all([waitForReceipt(orderId, () => cancelled), sleep(MIN_PROCESSING_MS)]);
      if (cancelled) return;
      setReceipt(found);
      setStage("printing");
      await sleep(reduceMotion ? 0 : RECEIPT_PRINT_DURATION_MS + 150);
      if (!cancelled) setStage("complete");
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, resumed, reduceMotion]);

  useEffect(() => {
    if (stage === "complete") doneRef.current?.focus();
  }, [stage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const download = useCallback(async () => {
    if (!receipt) return;
    setDownloading(true);
    try {
      const { downloadReceiptPdf } = await import("../lib/receiptPdf");
      downloadReceiptPdf(receipt);
    } finally {
      setDownloading(false);
    }
  }, [receipt]);

  const complete = stage === "complete";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Your purchase receipt"
      className="fixed inset-0 z-[10100] overflow-y-auto bg-slate-950/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Top-anchored, not centred: the slip's height settles once the receipt loads, and the printer must not jump. */}
      <div className="flex min-h-full flex-col items-center px-4 pb-8 pt-[max(3.5rem,10vh)]">
        <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute -top-2 right-0 z-[60] -translate-y-full rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>

          <ReceiptPrinter.Root stage={stage} animate={!resumed} className="mx-auto">
            <ReceiptPrinter.Machine>
              <ReceiptPrinter.Header>
                <span className="pl-1 pt-0.5 font-mono text-xs font-bold tracking-[0.25em] text-grayscale-8 dark:text-grayscale-11">XTIN</span>
                <span className="flex items-center gap-1.5 pr-1 pt-1.5" aria-hidden="true">
                  <span className={`size-1.5 rounded-full ${complete ? "bg-brand-fill shadow-[0_0_6px_theme(colors.green.500)]" : "bg-amber-400 shadow-[0_0_6px_theme(colors.amber.400)]"}`} />
                  <span className="size-1.5 rounded-full bg-grayscale-9/40" />
                </span>
              </ReceiptPrinter.Header>
              <ReceiptPrinter.Screen>
                <ReceiptPrinter.Status />
              </ReceiptPrinter.Screen>
            </ReceiptPrinter.Machine>
            {/* Sized to the slip (the feed animation is a transform, so layout never moves); pb leaves room for its shadow. */}
            <ReceiptPrinter.Output className="h-auto pb-4">
              <ReceiptPrinter.Paper className="min-h-0">
                <ReceiptSlip receipt={receipt} />
              </ReceiptPrinter.Paper>
            </ReceiptPrinter.Output>
          </ReceiptPrinter.Root>

          <motion.div
            initial={false}
            animate={{ opacity: complete ? 1 : 0, y: complete || reduceMotion ? 0 : 8 }}
            transition={{ duration: 0.2 }}
            className={`mt-4 flex flex-wrap justify-center gap-2 ${complete ? "" : "pointer-events-none"}`}
            aria-hidden={!complete}
          >
            {receipt && (
              <button
                type="button"
                onClick={download}
                disabled={downloading}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
              >
                <Download size={16} /> {downloading ? "Preparing…" : "Download PDF"}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate("/billing");
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <ReceiptText size={16} /> Billing history
            </button>
            <button
              ref={doneRef}
              type="button"
              onClick={onClose}
              className="rounded-lg bg-brand-fill px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              Done
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
