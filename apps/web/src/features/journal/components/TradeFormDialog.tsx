// Add / edit / "log again" form for a journal trade.
//
// Built for speed: the essentials (asset, market, side, quantity, entry) are
// up front, everything optional is one click away under "More details", and
// a new trade starts with today's date and the last market/type/currency/fees
// used. Save stays disabled until the required fields are filled in, and a
// trade the server recognises as already logged asks before saving it twice.
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api, JournalApiError } from "../lib/api";
import type { Trade } from "../lib/api";
import { marketLabel } from "../lib/journalPatternHelpers";
import {
  CURRENCIES,
  CURRENCY_SYMBOL,
  DEFAULTS_KEY,
  EMOTIONS,
  EMPTY_FORM,
  MORE_FIELDS,
  PNL_INPUTS,
  RECENT_ASSETS_KEY,
  TIME_ZONES,
  TRADE_MARKETS,
  TRADING_TYPES,
  calcPnl,
  formProblems,
  formatMoney,
  missingRequired,
  newTradeForm,
  num,
  readJson,
  todayIso,
  tradeToForm,
  writeJson,
  type RememberedDefaults,
  type TradeFormState,
} from "../lib/tradeForm";

/* ---------- small building blocks ---------- */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{children}</h3>;
}

function FieldLabel({ htmlFor, required, children }: { htmlFor?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <Label htmlFor={htmlFor} className="text-[13px] font-medium text-foreground">
      {children}
      {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
    </Label>
  );
}

function FieldError({ show, children }: { show: boolean; children: React.ReactNode }) {
  return show ? <p className="text-xs text-red-600">{children}</p> : null;
}

/** Single-tap choice row (replaces a dropdown). */
function ChoiceChips({
  label,
  options,
  value,
  onChange,
  allowClear = false,
  required = false,
  invalid = false,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  allowClear?: boolean;
  required?: boolean;
  invalid?: boolean;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel required={required}>{label}</FieldLabel>
      <div
        role="radiogroup"
        aria-label={label}
        aria-required={required || undefined}
        className={cn("flex flex-wrap gap-2", invalid && "rounded-md ring-1 ring-red-400 ring-offset-2")}
      >
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(selected && allowClear ? "" : o.value)}
              className={cn(
                "inline-flex h-8 items-center rounded-md border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : "border-input bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Number input with the currency symbol inside the box. */
function MoneyInput({
  id,
  symbol,
  invalid,
  ...props
}: React.ComponentProps<typeof Input> & { symbol: string; invalid?: boolean }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{symbol}</span>
      <Input
        id={id}
        type="number"
        min={0}
        step="0.01"
        inputMode="decimal"
        aria-invalid={invalid || undefined}
        className={cn("h-10 tabular-nums", symbol.length > 1 ? "pl-12" : "pl-7", invalid && "border-red-400 focus-visible:ring-red-400")}
        {...props}
      />
    </div>
  );
}

function Stat({ label, children, hint }: { label: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-1 px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="truncate text-base font-semibold tabular-nums">{children}</div>
      {hint}
    </div>
  );
}

/* ---------- the dialog ---------- */

// Exported as a type only, so this file still exports just the component.
export type TradeDialogRequest = { mode: "add" } | { mode: "edit"; trade: Trade } | { mode: "copy"; trade: Trade };

interface TradeFormDialogProps {
  request: TradeDialogRequest | null;
  onClose: () => void;
  /** Strategy names to offer (the user's own plus defaults). */
  strategyOptions: string[];
  /** Called after every successful save (reload the list etc.). */
  onSaved: () => void | Promise<void>;
}

export default function TradeFormDialog({ request, onClose, strategyOptions, onSaved }: TradeFormDialogProps) {
  const [form, setForm] = useState<TradeFormState>(EMPTY_FORM);
  const [showMore, setShowMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);
  const [recentAssets, setRecentAssets] = useState<string[]>(() => readJson<string[]>(RECENT_ASSETS_KEY, []));
  const assetInputRef = useRef<HTMLInputElement>(null);

  const editingTrade = request?.mode === "edit" ? request.trade : null;

  // Fill the form whenever the dialog is (re)opened.
  useEffect(() => {
    if (!request) return;
    setAttempted(false);
    setDuplicateMessage(null);
    if (request.mode === "add") {
      setForm(newTradeForm());
      setShowMore(false);
    } else if (request.mode === "edit") {
      const next = tradeToForm(request.trade);
      // P&L always follows the prices; an older trade without full prices
      // (e.g. imported with only a P&L) keeps the P&L it was saved with.
      setForm({ ...next, pnl: calcPnl(next) || next.pnl });
      setShowMore(MORE_FIELDS.some((k) => String(next[k] || "").trim() !== ""));
    } else {
      // "Log again": same asset and setup, today's date, no exit or result yet.
      setForm({
        ...tradeToForm(request.trade),
        date: todayIso(),
        exit_date: "",
        entry_time: "",
        exit_time: "",
        exit_price: "",
        pnl: "",
        notes: "",
        emotion: "neutral",
      });
      setShowMore(false);
    }
  }, [request]);

  function setField<K extends keyof TradeFormState>(key: K, value: TradeFormState[K]) {
    setDuplicateMessage(null);
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // P&L is always worked out from side, quantity, prices and fees.
      if (PNL_INPUTS.has(key)) next.pnl = calcPnl(next);
      return next;
    });
  }

  const missing = useMemo(() => missingRequired(form), [form]);
  const problems = useMemo(() => formProblems(form), [form]);
  const canSave = missing.length === 0 && problems.length === 0;
  const showError = (field: string) => attempted && missing.includes(field);
  const symbol = CURRENCY_SYMBOL[form.currency] || form.currency || "₹";

  function rememberTrade(f: TradeFormState) {
    writeJson(DEFAULTS_KEY, { market: f.market, type: f.type, currency: f.currency, time_zone: f.time_zone, brokerage: f.brokerage } satisfies RememberedDefaults);
    const asset = f.asset.trim();
    if (asset) {
      const next = [asset, ...recentAssets.filter((a) => a.toLowerCase() !== asset.toLowerCase())].slice(0, 20);
      setRecentAssets(next);
      writeJson(RECENT_ASSETS_KEY, next);
    }
  }

  async function save({ addAnother, allowDuplicate }: { addAnother: boolean; allowDuplicate?: boolean }) {
    setAttempted(true);
    if (!canSave) return;

    const strategyName = form.strategy.trim();
    setSaving(true);
    try {
      // Remember a new strategy name (idempotent by name on the server).
      if (strategyName) {
        try {
          await api.strategies.createStrategy(strategyName);
        } catch (err) {
          console.error("Failed to remember strategy:", err);
        }
      }

      const payload = {
        date: form.date,
        exit_date: form.exit_date || null,
        entry_time: form.entry_time || null,
        exit_time: form.exit_time || null,
        time_zone: form.time_zone || null,
        type: form.type || null,
        market: form.market || null,
        asset: form.asset.trim(),
        currency: form.currency || null,
        quantity: num(form.quantity),
        entry_price: num(form.entry_price),
        target_price: num(form.target_price),
        stop_loss: num(form.stop_loss),
        exit_price: num(form.exit_price),
        brokerage: num(form.brokerage),
        pnl: num(form.pnl),
        strategy: strategyName || null,
        margin: num(form.margin),
        buy_sell: form.buy_sell,
        contract: form.contract || null,
        strike_price: num(form.strike_price),
        option_type: form.option_type || null,
        notes: form.notes.trim() || null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        emotion: form.emotion || null,
        underlying_price: num(form.underlying_price),
        implied_volatility: num(form.implied_volatility),
        days_to_expiry: num(form.days_to_expiry),
      };

      if (editingTrade) {
        await api.trades.updateTrade(editingTrade.id, payload);
        toast.success("Trade updated");
      } else {
        await api.trades.createTrade({ ...payload, ...(allowDuplicate ? { allow_duplicate: true } : {}) });
        toast.success(`${payload.asset} added to your journal`);
      }
      rememberTrade(form);
      setDuplicateMessage(null);

      if (addAnother && !editingTrade) {
        // Same day, market, type and strategy; fresh asset and prices.
        setForm((prev) => ({
          ...newTradeForm(),
          date: prev.date,
          market: prev.market,
          type: prev.type,
          strategy: prev.strategy,
          currency: prev.currency,
          time_zone: prev.time_zone,
          brokerage: prev.brokerage,
        }));
        setAttempted(false);
        setTimeout(() => assetInputRef.current?.focus(), 0);
      } else {
        onClose();
      }
      await onSaved();
    } catch (err) {
      if (err instanceof JournalApiError && err.code === "DUPLICATE_TRADE") {
        setDuplicateMessage(err.message);
      } else {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Failed to save trade");
      }
    } finally {
      setSaving(false);
    }
  }

  // Live result figures.
  const pnlValue = num(form.pnl);
  const entry = num(form.entry_price);
  const stop = num(form.stop_loss);
  const target = num(form.target_price);
  const qty = num(form.quantity);
  const risk = entry != null && stop != null && qty ? Math.abs(entry - stop) * qty : null;
  const reward = entry != null && target != null && qty ? Math.abs(target - entry) * qty : null;

  const title = editingTrade ? "Edit trade" : request?.mode === "copy" ? "Log another trade" : "Log a trade";

  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="flex max-h-[92vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-1 border-b px-6 pb-4 pt-5 text-left">
          <DialogTitle className="text-lg font-semibold tracking-tight">{title}</DialogTitle>
          <DialogDescription className="text-[13px]">
            Fields marked <span className="text-red-500">*</span> are required. Everything else is optional.
          </DialogDescription>
        </DialogHeader>

        <form
          id="trade-form"
          className="flex-1 space-y-7 overflow-y-auto px-6 py-6"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
            save({ addAnother: submitter?.value === "another" });
          }}
        >
          {/* Instrument */}
          <section>
            <SectionTitle>Instrument</SectionTitle>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_11rem]">
                <div className="space-y-2">
                  <FieldLabel htmlFor="asset" required>
                    Asset / Symbol
                  </FieldLabel>
                  <Input
                    id="asset"
                    ref={assetInputRef}
                    list="recent-assets"
                    autoFocus={!editingTrade}
                    autoComplete="off"
                    value={form.asset}
                    onChange={(e) => setField("asset", e.target.value)}
                    placeholder="e.g. RELIANCE, NIFTY 24500 CE"
                    aria-invalid={showError("asset") || undefined}
                    className={cn("h-10", showError("asset") && "border-red-400")}
                  />
                  <datalist id="recent-assets">
                    {recentAssets.map((a) => (
                      <option key={a} value={a} />
                    ))}
                  </datalist>
                  <FieldError show={showError("asset")}>Enter the stock or contract you traded.</FieldError>
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="date" required>
                    Trade date
                  </FieldLabel>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setField("date", e.target.value)}
                    aria-invalid={showError("trade date") || undefined}
                    className={cn("h-10", showError("trade date") && "border-red-400")}
                  />
                </div>
              </div>

              <ChoiceChips
                label="Market"
                required
                invalid={showError("market")}
                options={TRADE_MARKETS.map((m) => ({ value: m, label: marketLabel(m) }))}
                value={form.market}
                onChange={(v) => setField("market", v)}
              />

              {form.market === "Options" && (
                <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-3">
                  <ChoiceChips
                    label="Option type"
                    options={[
                      { value: "call", label: "Call (CE)" },
                      { value: "put", label: "Put (PE)" },
                    ]}
                    value={form.option_type}
                    onChange={(v) => setField("option_type", v as "call" | "put" | "")}
                    allowClear
                  />
                  <div className="space-y-2">
                    <FieldLabel htmlFor="strike_price">Strike price</FieldLabel>
                    <MoneyInput id="strike_price" symbol={symbol} value={form.strike_price} onChange={(e) => setField("strike_price", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel htmlFor="contract">Expiry / contract</FieldLabel>
                    <Input id="contract" className="h-10" value={form.contract} onChange={(e) => setField("contract", e.target.value)} placeholder="e.g. 30 Oct 2026" />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Position */}
          <section className="border-t pt-6">
            <SectionTitle>Position</SectionTitle>
            <div className="space-y-5">
              <div className="space-y-2">
                <FieldLabel required>Side</FieldLabel>
                <div role="radiogroup" aria-label="Buy or sell" className="grid grid-cols-2 gap-2 sm:max-w-sm">
                  {(["buy", "sell"] as const).map((side) => {
                    const selected = form.buy_sell === side;
                    const Icon = side === "buy" ? ArrowUpRight : ArrowDownRight;
                    return (
                      <button
                        key={side}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setField("buy_sell", side)}
                        className={cn(
                          "inline-flex h-10 items-center justify-center gap-1.5 rounded-md border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          !selected && "border-input bg-background text-muted-foreground hover:text-foreground",
                          selected && side === "buy" && "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
                          selected && side === "sell" && "border-red-600 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {side === "buy" ? "Buy / Long" : "Sell / Short"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <FieldLabel htmlFor="quantity" required>
                    Quantity
                  </FieldLabel>
                  <Input
                    id="quantity"
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    value={form.quantity}
                    onChange={(e) => setField("quantity", e.target.value)}
                    placeholder="e.g. 50"
                    aria-invalid={showError("quantity") || undefined}
                    className={cn("h-10 tabular-nums", showError("quantity") && "border-red-400")}
                  />
                  <FieldError show={showError("quantity")}>Must be more than 0.</FieldError>
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="entry_price" required>
                    Entry price
                  </FieldLabel>
                  <MoneyInput
                    id="entry_price"
                    symbol={symbol}
                    value={form.entry_price}
                    onChange={(e) => setField("entry_price", e.target.value)}
                    placeholder="0.00"
                    invalid={showError("entry price")}
                  />
                  <FieldError show={showError("entry price")}>Must be more than 0.</FieldError>
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="exit_price">Exit price</FieldLabel>
                  <MoneyInput id="exit_price" symbol={symbol} value={form.exit_price} onChange={(e) => setField("exit_price", e.target.value)} placeholder="Blank if still open" />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="stop_loss">Stop loss</FieldLabel>
                  <MoneyInput id="stop_loss" symbol={symbol} value={form.stop_loss} onChange={(e) => setField("stop_loss", e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="target_price">Target</FieldLabel>
                  <MoneyInput id="target_price" symbol={symbol} value={form.target_price} onChange={(e) => setField("target_price", e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="brokerage">Fees &amp; brokerage</FieldLabel>
                  <MoneyInput id="brokerage" symbol={symbol} value={form.brokerage} onChange={(e) => setField("brokerage", e.target.value)} placeholder="0.00" />
                </div>
              </div>

              {/* Result summary, calculated from the prices */}
              <div className="grid grid-cols-1 divide-y rounded-lg border bg-muted/30 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <Stat label="Profit / loss">
                  {pnlValue == null ? (
                    <span className="text-sm font-normal text-muted-foreground">Open position</span>
                  ) : (
                    <span className={pnlValue >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                      {pnlValue > 0 ? "+" : ""}
                      {formatMoney(pnlValue, form.currency)}
                    </span>
                  )}
                </Stat>
                <Stat label="Risk">{risk != null ? formatMoney(risk, form.currency) : <span className="text-sm font-normal text-muted-foreground">Add a stop loss</span>}</Stat>
                <Stat label="Reward : Risk">
                  {risk != null && reward != null && risk > 0 ? (
                    `${(reward / risk).toFixed(1)} : 1`
                  ) : (
                    <span className="text-sm font-normal text-muted-foreground">Add stop &amp; target</span>
                  )}
                </Stat>
              </div>
            </div>
          </section>

          {/* Context */}
          <section className="border-t pt-6">
            <SectionTitle>Context</SectionTitle>
            <div className="space-y-5">
              <ChoiceChips
                label="Trading type"
                options={TRADING_TYPES.map((t) => ({ value: t, label: t }))}
                value={form.type}
                onChange={(v) => setField("type", v)}
                allowClear
              />
              <div className="space-y-2">
                <ChoiceChips
                  label="Strategy"
                  options={strategyOptions.slice(0, 10).map((n) => ({ value: n, label: n }))}
                  value={form.strategy}
                  onChange={(v) => setField("strategy", v)}
                  allowClear
                />
                <Input
                  id="strategy"
                  aria-label="Strategy (type your own)"
                  list="strategy-options"
                  // Only a typed-in strategy shows here; a picked chip is already highlighted above.
                  value={strategyOptions.slice(0, 10).includes(form.strategy) ? "" : form.strategy}
                  onChange={(e) => setField("strategy", e.target.value)}
                  placeholder="Or type your own strategy — it will be remembered"
                  className="h-10 sm:max-w-sm"
                />
                <datalist id="strategy-options">
                  {strategyOptions.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <FieldLabel>Emotion</FieldLabel>
                <div role="radiogroup" aria-label="Emotion" className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {EMOTIONS.map((e) => {
                    const [emoji, ...rest] = e.label.split(" ");
                    const selected = form.emotion === e.value;
                    return (
                      <button
                        key={e.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={rest.join(" ")}
                        onClick={() => setField("emotion", e.value)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-md border px-1 py-2 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          selected
                            ? "border-primary bg-primary/10 font-medium text-primary"
                            : "border-input bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        )}
                      >
                        <span className="text-lg leading-none">{emoji}</span>
                        {rest.join(" ")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Everything else, one click away */}
          <section className="rounded-lg border">
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              aria-expanded={showMore}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/40"
            >
              <span>
                More details
                <span className="ml-2 font-normal text-muted-foreground">Times, notes, tags, currency, margin</span>
              </span>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showMore && "rotate-180")} />
            </button>
            {showMore && (
              <div className="space-y-4 border-t px-4 py-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <FieldLabel htmlFor="exit_date">Exit day</FieldLabel>
                    <Input id="exit_date" type="date" className="h-10" value={form.exit_date} onChange={(e) => setField("exit_date", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel htmlFor="entry_time">Entry time</FieldLabel>
                    <Input id="entry_time" type="time" step={1} className="h-10" value={form.entry_time} onChange={(e) => setField("entry_time", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel htmlFor="exit_time">Exit time</FieldLabel>
                    <Input id="exit_time" type="time" step={1} className="h-10" value={form.exit_time} onChange={(e) => setField("exit_time", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Time zone</FieldLabel>
                    <Select value={form.time_zone} onValueChange={(v) => setField("time_zone", v)}>
                      <SelectTrigger aria-label="Time Zone" className="h-10">
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_ZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Currency</FieldLabel>
                    <Select value={form.currency} onValueChange={(v) => setField("currency", v)}>
                      <SelectTrigger aria-label="Currency" className="h-10">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel htmlFor="margin">Margin used</FieldLabel>
                    <MoneyInput id="margin" symbol={symbol} value={form.margin} onChange={(e) => setField("margin", e.target.value)} placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="notes">Notes</FieldLabel>
                  <Textarea
                    id="notes"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                    placeholder="Plan, setup quality, market conditions, what you'd do differently…"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="tags">Tags</FieldLabel>
                  <Input id="tags" className="h-10" value={form.tags} onChange={(e) => setField("tags", e.target.value)} placeholder="Comma-separated, e.g. breakout, momentum" />
                </div>
                {form.market === "Options" && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <FieldLabel htmlFor="underlying_price">Underlying price</FieldLabel>
                      <MoneyInput id="underlying_price" symbol={symbol} value={form.underlying_price} onChange={(e) => setField("underlying_price", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel htmlFor="implied_volatility">Implied volatility (%)</FieldLabel>
                      <Input id="implied_volatility" type="number" step="0.01" className="h-10" value={form.implied_volatility} onChange={(e) => setField("implied_volatility", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel htmlFor="days_to_expiry">Days to expiry</FieldLabel>
                      <Input id="days_to_expiry" type="number" className="h-10" value={form.days_to_expiry} onChange={(e) => setField("days_to_expiry", e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </form>

        {/* Duplicate warning from the server */}
        {duplicateMessage && (
          <div role="alert" className="flex flex-col gap-3 border-t bg-amber-50 px-6 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 sm:flex-row sm:items-center">
            <AlertTriangle className="hidden h-4 w-4 shrink-0 sm:block" />
            <p className="flex-1">{duplicateMessage}</p>
            <Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => save({ addAnother: false, allowDuplicate: true })}>
              Save anyway
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {problems.length > 0 ? (
              <span className="text-red-600">{problems[0]}.</span>
            ) : missing.length > 0 ? (
              <>Still needed: {missing.join(", ")}.</>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">Ready to save.</span>
            )}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            {/* On phones the × in the corner closes; keep the bar to the two save actions. */}
            <Button type="button" variant="ghost" className="hidden sm:inline-flex" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            {!editingTrade && (
              <Button type="submit" form="trade-form" value="another" variant="outline" disabled={saving || !canSave}>
                Save &amp; add another
              </Button>
            )}
            <Button type="submit" form="trade-form" value="save" className={cn(editingTrade && "col-span-2")} disabled={saving || !canSave}>
              {saving ? "Saving…" : editingTrade ? "Save changes" : "Save trade"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
