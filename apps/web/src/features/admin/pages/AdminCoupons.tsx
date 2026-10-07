// /admin/coupons — create and manage coupon codes.
//   Discount codes: % or ₹ off, on all or chosen products, applied at checkout.
//   Free-access codes: unlock one plan for free (members redeem them on Billing or at checkout).
// The API (services/api/modules/coupons) validates and enforces everything; this page just drives it.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Copy, Loader2, Plus, Trash2, X } from "lucide-react";
import SEO from "@/components/SEO";
import { formatMoney, formatReceiptDate } from "@/features/billing/lib/format";
import AdminHeader from "../components/AdminHeader";
import { adminCoupons, type AdminCoupon, type CouponCatalog, type Redemption } from "@/features/coupons/lib/admin";

const AUDIENCES = [
  { id: "everyone", label: "Everyone" },
  { id: "new_customers", label: "First-time buyers" },
  { id: "members", label: "Existing members" },
] as const;

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950";
const labelCls = "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";

function Segmented<T extends string>({ value, options, onChange, name }: { value: T; options: ReadonlyArray<{ id: T; label: string }>; onChange: (v: T) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${value === o.id ? "bg-white shadow-sm dark:bg-slate-950" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 ${checked ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"}`}
    >
      <span className={`inline-block size-5 rounded-full bg-white shadow transition ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

type Draft = {
  code: string;
  description: string;
  kind: "discount" | "free_access";
  discountType: "percent" | "amount";
  value: string;
  allProducts: boolean;
  products: string[];
  freePlan: string; // "product|plan"
  audience: "everyone" | "new_customers" | "members";
  maxUses: string;
  perUser: string;
  startsAt: string;
  expiresAt: string;
};

const emptyDraft = (): Draft => ({
  code: "",
  description: "",
  kind: "discount",
  discountType: "percent",
  value: "",
  allProducts: true,
  products: [],
  freePlan: "",
  audience: "everyone",
  maxUses: "",
  perUser: "1",
  startsAt: "",
  expiresAt: "",
});

const productNames = (keys: string[], catalog: CouponCatalog | null) =>
  keys.map((k) => catalog?.products.find((p) => p.key === k)?.label || k).join(", ");

/** One line saying what a coupon does, used in the form preview and the list. */
function describe(c: Pick<AdminCoupon, "kind" | "percent_off" | "amount_off_paise" | "products" | "free_product" | "free_plan">, catalog: CouponCatalog | null) {
  if (c.kind === "free_access") {
    const plan = catalog?.free_plans.find((p) => p.product === c.free_product && p.plan === c.free_plan);
    return `Free: ${plan?.label || `${c.free_product} / ${c.free_plan}`}`;
  }
  const off = c.percent_off ? `${c.percent_off}% off` : `${formatMoney(Number(c.amount_off_paise), "INR")} off`;
  return `${off} ${c.products.length ? productNames(c.products, catalog) : "everything"}`;
}

const statusOf = (c: AdminCoupon) => {
  const now = Date.now();
  if (!c.active) return { label: "Off", cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" };
  if (c.expires_at && new Date(c.expires_at).getTime() <= now) return { label: "Expired", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" };
  if (c.starts_at && new Date(c.starts_at).getTime() > now) return { label: "Scheduled", cls: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300" };
  if (c.max_redemptions && c.redemptions >= c.max_redemptions) return { label: "Used up", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" };
  return { label: "Live", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" };
};

/** <input type="datetime-local"> wants local "YYYY-MM-DDTHH:mm". */
const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

function CreateCouponForm({ catalog, onCreated, onCancel }: { catalog: CouponCatalog | null; onCreated: (c: AdminCoupon) => void; onCancel: () => void }) {
  const [d, setD] = useState<Draft>(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setD((prev) => ({ ...prev, [key]: value }));

  const summary = useMemo(() => {
    const [free_product, free_plan] = d.freePlan.split("|");
    const value = Number(d.value);
    const what =
      d.kind === "free_access"
        ? d.freePlan
          ? describe({ kind: "free_access", percent_off: null, amount_off_paise: null, products: [], free_product, free_plan }, catalog)
          : "Free access — choose what it unlocks"
        : d.value
          ? describe({ kind: "discount", percent_off: d.discountType === "percent" ? value : null, amount_off_paise: d.discountType === "amount" ? value * 100 : null, products: d.allProducts ? [] : d.products, free_product: null, free_plan: null }, catalog)
          : "Discount — set the amount";
    const who = AUDIENCES.find((a) => a.id === d.audience)?.label.toLowerCase();
    const uses = `${d.maxUses ? `${d.maxUses} uses in total` : "unlimited uses"}, ${d.perUser || 1} per person`;
    const until = d.expiresAt ? `until ${formatReceiptDate(new Date(d.expiresAt).toISOString(), true)}` : "no end date";
    return `${d.code || "CODE"} — ${what} · for ${who} · ${uses} · ${until}`;
  }, [d, catalog]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const [free_product, free_plan] = d.freePlan.split("|");
    try {
      const created = await adminCoupons.create({
        code: d.code,
        description: d.description,
        kind: d.kind,
        percent_off: d.kind === "discount" && d.discountType === "percent" ? d.value : undefined,
        amount_off: d.kind === "discount" && d.discountType === "amount" ? d.value : undefined,
        products: d.kind === "discount" && !d.allProducts ? d.products : [],
        free_product: d.kind === "free_access" ? free_product : undefined,
        free_plan: d.kind === "free_access" ? free_plan : undefined,
        audience: d.audience,
        max_redemptions: d.maxUses,
        per_user_limit: d.perUser,
        starts_at: d.startsAt ? new Date(d.startsAt).toISOString() : "",
        expires_at: d.expiresAt ? new Date(d.expiresAt).toISOString() : "",
      });
      onCreated(created);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const plansByProduct = useMemo(() => {
    const groups = new Map<string, CouponCatalog["free_plans"]>();
    for (const p of catalog?.free_plans || []) groups.set(p.product, [...(groups.get(p.product) || []), p]);
    return groups;
  }, [catalog]);

  return (
    <form onSubmit={submit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">New coupon</h2>
        <button type="button" onClick={onCancel} aria-label="Close" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">
          <X size={18} />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-code" className={labelCls}>Code</label>
          <input
            id="c-code"
            required
            value={d.code}
            onChange={(e) => set("code", e.target.value.toUpperCase().replace(/\s+/g, ""))}
            placeholder="e.g. DIWALI25"
            maxLength={32}
            autoComplete="off"
            className={`${inputCls} font-mono uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal`}
          />
          <p className="mt-1 text-xs text-slate-500">Letters, numbers, - and _. Members type it in any case.</p>
        </div>
        <div>
          <label htmlFor="c-desc" className={labelCls}>Note <span className="font-normal text-slate-400">(only admins see this)</span></label>
          <input id="c-desc" value={d.description} onChange={(e) => set("description", e.target.value)} placeholder="e.g. Diwali campaign, Instagram" maxLength={300} className={inputCls} />
        </div>
      </div>

      <div>
        <span className={labelCls}>Type</span>
        <Segmented name="Coupon type" value={d.kind} onChange={(v) => set("kind", v)} options={[{ id: "discount", label: "Discount at checkout" }, { id: "free_access", label: "Free access" }]} />
      </div>

      {d.kind === "discount" ? (
        <div className="space-y-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-950/50">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <span className={labelCls}>Discount</span>
              <Segmented name="Discount type" value={d.discountType} onChange={(v) => set("discountType", v)} options={[{ id: "percent", label: "% off" }, { id: "amount", label: "₹ off" }]} />
            </div>
            <div className="w-36">
              <label htmlFor="c-value" className="sr-only">Discount value</label>
              <div className="relative">
                {d.discountType === "amount" && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₹</span>}
                <input
                  id="c-value"
                  required
                  type="number"
                  min={1}
                  max={d.discountType === "percent" ? 100 : undefined}
                  step={d.discountType === "percent" ? 1 : "0.01"}
                  value={d.value}
                  onChange={(e) => set("value", e.target.value)}
                  className={`${inputCls} ${d.discountType === "amount" ? "pl-7" : "pr-8"}`}
                />
                {d.discountType === "percent" && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">%</span>}
              </div>
            </div>
          </div>
          {d.discountType === "amount" && <p className="text-xs text-slate-500">₹ off works on payments in rupees only. 100% / full-price codes make the item free — no payment step.</p>}
          <div>
            <span className={labelCls}>Works on</span>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={d.allProducts} onChange={(e) => set("allProducts", e.target.checked)} className="size-4 accent-emerald-600" />
              Every product
            </label>
            {!d.allProducts && (
              <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {catalog?.products.map((p) => (
                  <label key={p.key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={d.products.includes(p.key)}
                      onChange={(e) => set("products", e.target.checked ? [...d.products, p.key] : d.products.filter((k) => k !== p.key))}
                      className="size-4 accent-emerald-600"
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950/50">
          <label htmlFor="c-plan" className={labelCls}>Unlocks</label>
          <select id="c-plan" required value={d.freePlan} onChange={(e) => set("freePlan", e.target.value)} className={inputCls}>
            <option value="">Choose a plan…</option>
            {[...plansByProduct.entries()].map(([product, plans]) => (
              <optgroup key={product} label={catalog?.products.find((p) => p.key === product)?.label || product}>
                {plans.map((p) => (
                  <option key={p.plan} value={`${p.product}|${p.plan}`}>{p.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">Members enter it under “Redeem a code” on their Billing page (or at that product’s checkout). Time is added on top of any plan they already have.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <span className={labelCls}>Who can use it</span>
          <Segmented name="Who can use it" value={d.audience} onChange={(v) => set("audience", v)} options={AUDIENCES} />
        </div>
        <div>
          <label htmlFor="c-max" className={labelCls}>Total uses</label>
          <input id="c-max" type="number" min={1} value={d.maxUses} onChange={(e) => set("maxUses", e.target.value)} placeholder="Unlimited" className={inputCls} />
        </div>
        <div>
          <label htmlFor="c-per" className={labelCls}>Uses per person</label>
          <input id="c-per" type="number" min={1} value={d.perUser} onChange={(e) => set("perUser", e.target.value)} className={inputCls} />
        </div>
        <div className="hidden sm:block" />
        <div>
          <label htmlFor="c-start" className={labelCls}>Starts <span className="font-normal text-slate-400">(optional)</span></label>
          <input id="c-start" type="datetime-local" value={d.startsAt} onChange={(e) => set("startsAt", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="c-end" className={labelCls}>Ends <span className="font-normal text-slate-400">(optional)</span></label>
          <input id="c-end" type="datetime-local" value={d.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} className={inputCls} />
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm dark:border-slate-700">
        <span className="font-medium">Summary: </span>
        <span className="text-slate-600 dark:text-slate-300">{summary}</span>
      </div>

      {error && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
          {busy && <Loader2 size={14} className="animate-spin" />} Create coupon
        </button>
      </div>
    </form>
  );
}

function CouponRow({ coupon, catalog, onChanged, onDeleted }: { coupon: AdminCoupon; catalog: CouponCatalog | null; onChanged: (c: AdminCoupon) => void; onDeleted: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState<Redemption[] | null>(null);
  const [edit, setEdit] = useState({ maxUses: coupon.max_redemptions?.toString() || "", perUser: String(coupon.per_user_limit), expiresAt: toLocalInput(coupon.expires_at) });
  const status = statusOf(coupon);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = () => run(async () => onChanged(await adminCoupons.update(coupon.id, { active: !coupon.active })));
  const save = () =>
    run(async () =>
      onChanged(
        await adminCoupons.update(coupon.id, {
          max_redemptions: edit.maxUses,
          per_user_limit: edit.perUser,
          expires_at: edit.expiresAt ? new Date(edit.expiresAt).toISOString() : "",
        })
      )
    );
  const remove = () =>
    run(async () => {
      if (!window.confirm(`Delete ${coupon.code}? This can't be undone.`)) return;
      await adminCoupons.remove(coupon.id);
      onDeleted(coupon.id);
    });

  const expand = () => {
    const next = !open;
    setOpen(next);
    if (next && usage === null) adminCoupons.redemptions(coupon.id).then(setUsage).catch((e) => setError(e.message));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked — the code is on screen anyway.
    }
  };

  return (
    <li className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-base font-bold tracking-wide">{coupon.code}</span>
            <button type="button" onClick={copy} aria-label={`Copy ${coupon.code}`} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.cls}`}>{status.label}</span>
          </div>
          <div className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{describe(coupon, catalog)}</div>
          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {AUDIENCES.find((a) => a.id === coupon.audience)?.label} · {coupon.per_user_limit} per person
            {coupon.expires_at ? ` · ends ${formatReceiptDate(coupon.expires_at, true)}` : ""}
            {coupon.description ? ` · ${coupon.description}` : ""}
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="font-semibold tabular-nums">
            {coupon.redemptions}
            {coupon.max_redemptions ? ` / ${coupon.max_redemptions}` : ""}
          </div>
          <div className="text-xs text-slate-500">used</div>
        </div>
        <Switch checked={coupon.active} onChange={toggle} disabled={busy} label={`${coupon.code} on/off`} />
        <button type="button" onClick={expand} aria-expanded={open} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
          Details <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="space-y-4 border-t border-slate-100 p-4 dark:border-slate-800">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-32">
              <label className={labelCls} htmlFor={`max-${coupon.id}`}>Total uses</label>
              <input id={`max-${coupon.id}`} type="number" min={1} value={edit.maxUses} onChange={(e) => setEdit({ ...edit, maxUses: e.target.value })} placeholder="Unlimited" className={inputCls} />
            </div>
            <div className="w-32">
              <label className={labelCls} htmlFor={`per-${coupon.id}`}>Per person</label>
              <input id={`per-${coupon.id}`} type="number" min={1} value={edit.perUser} onChange={(e) => setEdit({ ...edit, perUser: e.target.value })} className={inputCls} />
            </div>
            <div className="w-56">
              <label className={labelCls} htmlFor={`end-${coupon.id}`}>Ends</label>
              <input id={`end-${coupon.id}`} type="datetime-local" value={edit.expiresAt} onChange={(e) => setEdit({ ...edit, expiresAt: e.target.value })} className={inputCls} />
            </div>
            <button type="button" onClick={save} disabled={busy} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900">
              Save
            </button>
            {coupon.redemptions === 0 && (
              <button type="button" onClick={remove} disabled={busy} className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60 dark:hover:bg-rose-950/40">
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Who used it</h3>
            {usage === null ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : usage.length === 0 ? (
              <p className="text-sm text-slate-500">Nobody yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-1 pr-4 font-medium">When</th>
                      <th className="py-1 pr-4 font-medium">Member</th>
                      <th className="py-1 pr-4 font-medium">Product</th>
                      <th className="py-1 text-right font-medium">Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {usage.map((r) => (
                      <tr key={r.order_id}>
                        <td className="whitespace-nowrap py-1.5 pr-4">{formatReceiptDate(r.created_at, true)}</td>
                        <td className="py-1.5 pr-4">{r.buyer_email || "Deleted account"}</td>
                        <td className="py-1.5 pr-4">{productNames([r.product], catalog)}</td>
                        <td className="whitespace-nowrap py-1.5 text-right tabular-nums">
                          {r.paid_amount ? formatMoney(r.paid_amount, r.currency || "INR") : "Free"}
                          {r.list_amount && r.paid_amount !== null && r.list_amount > r.paid_amount ? (
                            <span className="ml-1 text-xs text-slate-400 line-through">{formatMoney(r.list_amount, r.currency || "INR")}</span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      {error && <p role="alert" className="px-4 pb-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </li>
  );
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<AdminCoupon[] | null>(null);
  const [catalog, setCatalog] = useState<CouponCatalog | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      const [list, cat] = await Promise.all([adminCoupons.list(), adminCoupons.catalog()]);
      setCoupons(list);
      setCatalog(cat);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => {
    const q = query.trim().toUpperCase();
    return (coupons || []).filter((c) => !q || c.code.includes(q) || (c.description || "").toUpperCase().includes(q));
  }, [coupons, query]);

  const replace = (c: AdminCoupon) => setCoupons((list) => (list || []).map((x) => (x.id === c.id ? { ...c, redemptions: x.redemptions } : x)));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SEO title="Admin — Coupons — Xtin Capital" noIndex />
      <AdminHeader />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Discount codes apply at checkout. Free-access codes unlock a plan with no payment.</p>
          </div>
          {!creating && (
            <button type="button" onClick={() => setCreating(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              <Plus size={16} /> New coupon
            </button>
          )}
        </div>

        {creating && (
          <CreateCouponForm
            catalog={catalog}
            onCancel={() => setCreating(false)}
            onCreated={(c) => {
              setCoupons((list) => [{ ...c, redemptions: 0 }, ...(list || [])]);
              setCreating(false);
            }}
          />
        )}

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            {error}{" "}
            <button type="button" onClick={load} className="font-semibold underline">Try again</button>
          </div>
        ) : coupons === null ? (
          <div className="space-y-3" aria-busy="true">
            {[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800/70" />)}
          </div>
        ) : coupons.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
            No coupons yet. Create your first one with “New coupon”.
          </div>
        ) : (
          <>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search codes and notes" aria-label="Search coupons" className={`${inputCls} max-w-xs`} />
            <ul className="space-y-3">
              {shown.map((c) => (
                <CouponRow key={c.id} coupon={c} catalog={catalog} onChanged={replace} onDeleted={(id) => setCoupons((list) => (list || []).filter((x) => x.id !== id))} />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
