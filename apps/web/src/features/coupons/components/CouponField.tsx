// "Have a coupon code?" — drop into any checkout. Applying a discount code
// only previews it (and hands the code to the parent, which sends it with the
// order); the server re-prices the real order. A free-access code typed here
// can be activated on the spot.
import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/features/billing/lib/format";
import { showPurchaseReceipt } from "@/features/billing/lib/purchaseReceipt";
import { previewCoupon, redeemCoupon, type CouponPreview, type CouponProduct } from "../lib/api";

type Props = {
  /** What's being bought. Pages selling several things pass them all — the code only has to fit one. */
  product: CouponProduct | CouponProduct[];
  /** List price in the smallest unit (paise / cents), for showing the saving. Omit on pages with several prices. */
  amount?: number;
  currency?: string;
  /** The applied code, or null. */
  value: string | null;
  onChange: (code: string | null) => void;
  /** The price after the code (smallest unit), or null when no discount applies — for the pay button. */
  onPriceChange?: (amount: number | null) => void;
  /** Called after a free-access code was activated here. */
  onRedeemed?: () => void;
  className?: string;
};

export default function CouponField({ product, amount, currency = "INR", value, onChange, onPriceChange, onRedeemed, className }: Props) {
  const [open, setOpen] = useState(!!value);
  const [input, setInput] = useState(value || "");
  const [preview, setPreview] = useState<CouponPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const check = async (code: string) => {
    setBusy(true);
    setError(null);
    try {
      const products = Array.isArray(product) ? product : [product];
      let result: CouponPreview | null = null;
      let firstError: unknown = null;
      for (const p of products) {
        try {
          result = await previewCoupon(code, p, amount ?? 0, currency);
          break;
        } catch (err) {
          firstError ??= err;
        }
      }
      if (!result) throw firstError;
      setPreview(result);
      onChange(result.kind === "discount" ? result.code : null);
      onPriceChange?.(result.kind === "discount" && amount !== undefined ? result.amount : null);
    } catch (e) {
      setPreview(null);
      onChange(null);
      onPriceChange?.(null);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // Plan or billing switched while a code is applied: re-price it (or drop it if it no longer fits).
  useEffect(() => {
    if (value && preview?.kind === "discount" && amount !== undefined && amount !== preview.list_amount) check(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, currency, String(product)]);

  const apply = (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = input.trim();
    if (code) check(code);
  };

  const remove = () => {
    setPreview(null);
    setInput("");
    setError(null);
    onChange(null);
    onPriceChange?.(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const activate = async () => {
    if (preview?.kind !== "free_access") return;
    setBusy(true);
    setError(null);
    try {
      const redeemed = await redeemCoupon(preview.code);
      setPreview(null);
      setInput("");
      showPurchaseReceipt(redeemed.order_id);
      onRedeemed?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={cn("inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline dark:text-brand", className)}
      >
        <Tag size={14} /> Have a coupon code?
      </button>
    );
  }

  return (
    <div className={cn("w-full text-left", className)}>
      {preview?.kind === "discount" && value ? (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-brand-line bg-brand-soft px-3 py-2 text-sm dark:border-brand dark:bg-brand-fill/40">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-semibold text-brand dark:text-brand">
              <Check size={14} /> {preview.code} applied · {preview.label}
            </div>
            {amount !== undefined && preview.discount > 0 && (
              <div className="mt-0.5 text-brand dark:text-brand">
                You save {formatMoney(preview.discount, currency)} — pay {formatMoney(preview.amount, currency)}
              </div>
            )}
            {amount === undefined && <div className="mt-0.5 text-brand dark:text-brand">Taken off at checkout.</div>}
          </div>
          <button type="button" onClick={remove} aria-label="Remove coupon" className="shrink-0 rounded p-1 text-brand hover:bg-brand-soft dark:text-brand dark:hover:bg-brand-hover">
            <X size={14} />
          </button>
        </div>
      ) : preview?.kind === "free_access" ? (
        <div className="rounded-lg border border-brand-line bg-brand-soft px-3 py-2.5 text-sm dark:border-brand dark:bg-brand-fill/40">
          <div className="font-semibold text-brand dark:text-brand">{preview.code} unlocks {preview.label} — free</div>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={activate} disabled={busy} className="rounded-md bg-brand-fill px-3 py-1.5 font-semibold text-white hover:bg-brand-hover disabled:opacity-60">
              {busy ? "Activating…" : "Activate for free"}
            </button>
            <button type="button" onClick={remove} className="rounded-md px-3 py-1.5 font-medium text-brand hover:bg-brand-soft dark:text-brand dark:hover:bg-brand-hover">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={apply} className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Coupon code"
            aria-label="Coupon code"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            maxLength={32}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand-line dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white brand-on-dark"
          >
            {busy && <Loader2 size={14} className="animate-spin" />} Apply
          </button>
        </form>
      )}
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
