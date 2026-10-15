// "Redeem a code" — for free-access codes (Billing page, Dashboard). Discount
// codes are explained back to the member: they go in at checkout.
import { useState } from "react";
import { Gift, Loader2 } from "lucide-react";
import { showPurchaseReceipt } from "@/features/billing/lib/purchaseReceipt";
import { redeemCoupon } from "../lib/api";

export default function RedeemCodeCard({ onRedeemed }: { onRedeemed?: () => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const redeemed = await redeemCoupon(code.trim());
      setDone(`${redeemed.label} is now active on your account.`);
      setCode("");
      showPurchaseReceipt(redeemed.order_id);
      onRedeemed?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand dark:bg-brand-fill/50 dark:text-brand">
          <Gift size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Redeem a code</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Got a free-access code? Enter it here. Discount codes go in at checkout.</p>
          <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="Enter code"
              aria-label="Code to redeem"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              maxLength={32}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand-line dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              type="submit"
              disabled={busy || !code.trim()}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-fill px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-50"
            >
              {busy && <Loader2 size={14} className="animate-spin" />} Redeem
            </button>
          </form>
          {error && <p role="alert" className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
          {done && <p role="status" className="mt-2 text-sm text-brand dark:text-brand">{done}</p>}
        </div>
      </div>
    </section>
  );
}
