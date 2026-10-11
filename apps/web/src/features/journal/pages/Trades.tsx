// Trades page — rewritten from features-incoming/journal/app.js's
// `renderTradesTable` / `saveTrade` / `deleteTrade` / `filterTrades` (a
// vanilla-JS table + modal against a client-side `trades` array synced to
// Supabase) into a React page against the live REST backend
// (services/api/modules/journal/trades.{routes,validator,controller}.ts).
//
// API client: `apps/web/src/features/journal/lib/api.ts` (owned by the
// parallel task) landed mid-way through writing this page, using the exact
// verbose method names this page was already calling (`getTrades`/
// `createTrade`/`updateTrade`/`deleteTrade`, `getStrategies`/
// `createStrategy`) — its own header comment notes it matched this page's
// naming on purpose to avoid a rename on either side. Imported as
// `import { api } from "../lib/api"` + `import type { Trade, Strategy }`.
//
// JournalLayout: imported from "../components/JournalLayout" (also not yet
// built by the parallel task) exactly like FundaKaMental's pages import
// `DashboardLayout` — assumed to be a default-exported component that
// wraps `children`.
//
// Route path: mounted at `/journal/trades` per the task brief's default
// assumption — JournalApp.tsx (meant to document the parallel task's chosen
// route paths) did not exist yet either, so this could not be confirmed.
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Upload, Download, FileText, X, Copy, ChevronDown } from "lucide-react";
import { csvCell, downloadTextFile } from "@/lib/uploadFile";
import ImportTradesDialog from "../components/ImportTradesDialog";
import { api } from "../lib/api";
import type { Trade, Strategy } from "../lib/api";
import JournalLayout from "../components/JournalLayout";
import { marketLabel } from "../lib/journalPatternHelpers";
import { useAuth } from "@/contexts/AuthContext";
import { buildReportMeta, registerReport, verifyQr } from "@/lib/reportMeta";

const blobToDataUrl = async (res: Response) => {
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
};

// Static option lists carried over from app.js (tradingTypes, tradeMarkets,
// defaultStrategies, the emotion select, timezone select, buy/sell select
// and option-type select all come straight from index.html's #tradeModal).
const TRADING_TYPES = ["Scalping", "Intraday", "Swing Trading", "Positional Trading", "Investing", "Long-Term Investing"];
const TRADE_MARKETS = ["Equity", "Futures", "Options", "Commodities", "Forex", "Crypto_Currency"];
const DEFAULT_STRATEGIES = ["Breakout", "Breakdown", "M Pattern", "W Pattern", "Head & shoulder", "Iron Condor", "Hammer Candle", "Shooting Star"];
const TIME_ZONES = [
  { value: "Asia/Kolkata", label: "IST - India" },
  { value: "America/New_York", label: "ET - New York" },
  { value: "America/Chicago", label: "CT - Chicago" },
  { value: "America/Los_Angeles", label: "PT - Los Angeles" },
  { value: "Europe/London", label: "GMT/BST - London" },
  { value: "Europe/Berlin", label: "CET - Berlin" },
  { value: "Asia/Dubai", label: "GST - Dubai" },
  { value: "Asia/Singapore", label: "SGT - Singapore" },
  { value: "Asia/Tokyo", label: "JST - Tokyo" },
  { value: "Australia/Sydney", label: "AET - Sydney" },
];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "JPY"];
const EMOTIONS = [
  { value: "confident", label: "😊 Confident" },
  { value: "neutral", label: "😐 Neutral" },
  { value: "uncertain", label: "😟 Uncertain" },
  { value: "frustrated", label: "😤 Frustrated" },
  { value: "excited", label: "🤩 Excited" },
  { value: "fearful", label: "😨 Fearful" },
  { value: "greedy", label: "💰 Greedy" },
];

const PAGE_SIZE = 25;

// Form state uses strings for every input (native form control values),
// converted to the typed/snake_case payload on submit.
interface TradeFormState {
  date: string;
  exit_date: string;
  entry_time: string;
  exit_time: string;
  time_zone: string;
  type: string;
  market: string;
  asset: string;
  currency: string;
  quantity: string;
  entry_price: string;
  target_price: string;
  stop_loss: string;
  exit_price: string;
  brokerage: string;
  pnl: string;
  strategy: string;
  margin: string;
  buy_sell: "buy" | "sell";
  contract: string;
  strike_price: string;
  option_type: "call" | "put" | "";
  underlying_price: string;
  implied_volatility: string;
  days_to_expiry: string;
  notes: string;
  tags: string;
  emotion: string;
}

const EMPTY_FORM: TradeFormState = {
  date: "",
  exit_date: "",
  entry_time: "",
  exit_time: "",
  time_zone: "Asia/Kolkata",
  type: "",
  market: "",
  asset: "",
  currency: "INR",
  quantity: "1",
  entry_price: "",
  target_price: "",
  stop_loss: "",
  exit_price: "",
  brokerage: "0",
  pnl: "",
  strategy: "",
  margin: "",
  buy_sell: "buy",
  contract: "",
  strike_price: "",
  option_type: "",
  underlying_price: "",
  implied_volatility: "",
  days_to_expiry: "",
  notes: "",
  tags: "",
  emotion: "neutral",
};

// Quick-add memory: the last market/type/currency/time zone/fees used, and
// recently traded assets, so a new trade starts mostly filled in.
const DEFAULTS_KEY = "journal_trade_defaults_v1";
const RECENT_ASSETS_KEY = "journal_recent_assets_v1";
type RememberedDefaults = Partial<Pick<TradeFormState, "market" | "type" | "currency" | "time_zone" | "brokerage">>;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / private mode — just don't remember
  }
}

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** A blank trade for today, using the last-used market/type/currency/fees. */
function newTradeForm(): TradeFormState {
  const remembered = readJson<RememberedDefaults>(DEFAULTS_KEY, {});
  return { ...EMPTY_FORM, ...remembered, date: todayIso() };
}

// Fields that live under "More details"; open it automatically when editing a trade that uses them.
const MORE_FIELDS: (keyof TradeFormState)[] = [
  "exit_date", "entry_time", "exit_time", "margin", "notes", "tags", "underlying_price", "implied_volatility",
];

/** Single-tap choice row (replaces a dropdown). */
function ChoiceChips({
  label,
  options,
  value,
  onChange,
  allowClear = false,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  allowClear?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
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
                "rounded-full border px-3 py-1 text-sm transition-colors",
                selected ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
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

// Same formula as CSV import (services/api/modules/journal/importParsers.ts).
// Returns "" until quantity, entry and exit price are all filled in.
function calcPnl(f: Pick<TradeFormState, "quantity" | "entry_price" | "exit_price" | "brokerage" | "buy_sell">): string {
  const q = parseFloat(f.quantity);
  const entry = parseFloat(f.entry_price);
  const exit = parseFloat(f.exit_price);
  if (!Number.isFinite(q) || !Number.isFinite(entry) || !Number.isFinite(exit)) return "";
  const fees = parseFloat(f.brokerage) || 0;
  const gross = f.buy_sell === "sell" ? (entry - exit) * q : (exit - entry) * q;
  return String(Math.round((gross - fees) * 100) / 100);
}

const PNL_INPUTS = new Set<keyof TradeFormState>(["quantity", "entry_price", "exit_price", "brokerage", "buy_sell"]);

function tradeToForm(trade: Trade): TradeFormState {
  return {
    date: trade.date || "",
    exit_date: trade.exit_date || "",
    entry_time: trade.entry_time || "",
    exit_time: trade.exit_time || "",
    time_zone: trade.time_zone || "Asia/Kolkata",
    type: trade.type || "",
    market: trade.market || "",
    asset: trade.asset || "",
    currency: trade.currency || "INR",
    quantity: trade.quantity != null ? String(trade.quantity) : "",
    entry_price: trade.entry_price != null ? String(trade.entry_price) : "",
    target_price: trade.target_price != null ? String(trade.target_price) : "",
    stop_loss: trade.stop_loss != null ? String(trade.stop_loss) : "",
    exit_price: trade.exit_price != null ? String(trade.exit_price) : "",
    brokerage: trade.brokerage != null ? String(trade.brokerage) : "0",
    pnl: trade.pnl != null ? String(trade.pnl) : "",
    strategy: trade.strategy || "",
    margin: trade.margin != null ? String(trade.margin) : "",
    buy_sell: trade.buy_sell || "buy",
    contract: trade.contract || "",
    strike_price: trade.strike_price != null ? String(trade.strike_price) : "",
    option_type: trade.option_type || "",
    underlying_price: trade.underlying_price != null ? String(trade.underlying_price) : "",
    implied_volatility: trade.implied_volatility != null ? String(trade.implied_volatility) : "",
    days_to_expiry: trade.days_to_expiry != null ? String(trade.days_to_expiry) : "",
    notes: trade.notes || "",
    tags: (trade.tags || []).join(", "),
    emotion: trade.emotion || "neutral",
  };
}

function num(value: string): number | null {
  if (value === "" || value == null) return null;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatMoney(value: number | null | undefined, currency: string | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "-";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR", maximumFractionDigits: 2 }).format(value);
  } catch {
    return value.toFixed(2);
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function tradeStatus(pnl: number | null | undefined): { label: string; className: string } {
  if (pnl == null) return { label: "-", className: "text-muted-foreground" };
  if (pnl > 0) return { label: "Win", className: "text-emerald-600 dark:text-emerald-400" };
  if (pnl < 0) return { label: "Loss", className: "text-red-600 dark:text-red-400" };
  return { label: "Breakeven", className: "text-muted-foreground" };
}

const EXPORT_COLUMNS: (keyof Trade)[] = [
  "date", "exit_date", "entry_time", "exit_time", "asset", "market", "type", "buy_sell", "quantity", "entry_price",
  "exit_price", "stop_loss", "target_price", "brokerage", "pnl", "currency", "strategy", "emotion", "notes", "tags",
];

export default function Trades() {
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { user } = useAuth();

  async function fetchAllTrades(): Promise<Trade[]> {
    const all: Trade[] = [];
    for (let off = 0; ; off += 200) {
      const res = await api.trades.getTrades({ limit: 200, offset: off });
      all.push(...(res.data || []));
      if (!res.data?.length || all.length >= (res.pagination?.total ?? 0)) break;
    }
    return all;
  }

  async function exportPdf() {
    setExporting(true);
    try {
      const all = await fetchAllTrades();
      if (!all.length) {
        toast.error("No trades to export yet");
        return;
      }
      const [{ jsPDF }, { buildTradesPdf }] = await Promise.all([import("jspdf"), import("../lib/tradesPdf")]);
      const now = new Date();
      const meta = await buildReportMeta(user?.id || "anon", all.map((t) => [t.date, t.asset, t.quantity, t.entry_price, t.exit_price, t.pnl]), now, "XC-JN");
      if (!(await registerReport(meta))) toast.warning("Report exported, but it could not be registered for online verification.");
      const qr = await verifyQr(meta);
      const logo = await fetch("/favicon.png").then(blobToDataUrl).catch(() => undefined);
      const preparedFor = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email : undefined;
      buildTradesPdf(jsPDF, all, now, { preparedFor, email: user?.email, meta, logo, qr }).save(`Xtin-Journal-Report-${meta.reportNo}.pdf`);
      toast.success(`Exported ${all.length} trade${all.length === 1 ? "" : "s"} to PDF`);
    } catch (err: any) {
      toast.error(err?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const all = await fetchAllTrades();
      if (!all.length) {
        toast.error("No trades to export yet");
        return;
      }
      const lines = [EXPORT_COLUMNS.join(",")].concat(
        all.map((t) => EXPORT_COLUMNS.map((c) => csvCell(Array.isArray(t[c]) ? (t[c] as string[]).join(";") : t[c])).join(","))
      );
      downloadTextFile(`journal-trades-${new Date().toISOString().slice(0, 10)}.csv`, lines.join("\n"));
      toast.success(`Exported ${all.length} trade${all.length === 1 ? "" : "s"}`);
    } catch (err: any) {
      toast.error(err?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  }

  const [trades, setTrades] = useState<Trade[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  // Filters run on the server, across every trade (not just this page).
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [jumpTo, setJumpTo] = useState("");
  const latestRequest = useRef(0);
  const datesInvalid = !!fromDate && !!toDate && fromDate > toDate;
  const filtering = !!(appliedSearch || fromDate || toDate);

  // Search as you type, after a short pause; always back to page 1.
  useEffect(() => {
    const term = search.trim();
    if (term === appliedSearch) return;
    const timer = setTimeout(() => {
      setAppliedSearch(term);
      setOffset(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, appliedSearch]);

  function setDateFilter(which: "from" | "to", value: string) {
    if (which === "from") setFromDate(value);
    else setToDate(value);
    setOffset(0);
  }

  function clearFilters() {
    setSearch("");
    setAppliedSearch("");
    setFromDate("");
    setToDate("");
    setOffset(0);
  }

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [pnlManual, setPnlManual] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [recentAssets, setRecentAssets] = useState<string[]>(() => readJson<string[]>(RECENT_ASSETS_KEY, []));
  const assetInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<TradeFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Trade | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTrades = useCallback(
    async (nextOffset: number) => {
      if (datesInvalid) return;
      // Ignore a slower, older response (e.g. while typing a search).
      const requestId = ++latestRequest.current;
      setLoading(true);
      try {
        const res = await api.trades.getTrades({
          limit: PAGE_SIZE,
          offset: nextOffset,
          search: appliedSearch || undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
        });
        if (requestId !== latestRequest.current) return;
        setTrades(res.data || []);
        setTotal(res.pagination?.total ?? (res.data || []).length);
      } catch (err) {
        if (requestId !== latestRequest.current) return;
        console.error(err);
        toast.error("Failed to load trades", { id: "journal-trades-load-error" });
      } finally {
        if (requestId === latestRequest.current) setLoading(false);
      }
    },
    [appliedSearch, fromDate, toDate, datesInvalid]
  );

  const loadStrategies = useCallback(async () => {
    try {
      const res = await api.strategies.getStrategies();
      setStrategies(res || []);
    } catch (err) {
      console.error(err);
      // Non-fatal — the strategy field still works as a free-text input.
    }
  }, []);

  useEffect(() => {
    loadTrades(offset);
  }, [offset, loadTrades]);

  useEffect(() => {
    loadStrategies();
  }, [loadStrategies]);

  const strategyOptions = useMemo(() => {
    const names = new Set<string>(DEFAULT_STRATEGIES);
    strategies.forEach((s) => names.add(s.name));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [strategies]);

  const visibleTrades = trades;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  function goToPage(raw: string) {
    const page = Math.trunc(Number(raw));
    if (!Number.isFinite(page) || page < 1 || page > totalPages) {
      toast.error(`Enter a page from 1 to ${totalPages}`, { id: "journal-trades-jump" });
      return;
    }
    setOffset((page - 1) * PAGE_SIZE);
    setJumpTo("");
  }

  function openAddDialog() {
    setEditingTrade(null);
    setForm(newTradeForm());
    setPnlManual(false);
    setShowMore(false);
    setDialogOpen(true);
  }

  function openEditDialog(trade: Trade) {
    const next = tradeToForm(trade);
    setEditingTrade(trade);
    // Keep a P&L the user typed by hand; otherwise follow the prices.
    setPnlManual(next.pnl !== "" && Number(next.pnl) !== Number(calcPnl(next) || NaN));
    setForm(next);
    setShowMore(MORE_FIELDS.some((k) => String(next[k] || "").trim() !== ""));
    setDialogOpen(true);
  }

  // Start a new trade from an existing one: same asset and setup, today's
  // date, no exit/result yet.
  function openDuplicateDialog(trade: Trade) {
    const base = tradeToForm(trade);
    setEditingTrade(null);
    setForm({
      ...base,
      date: todayIso(),
      exit_date: "",
      entry_time: "",
      exit_time: "",
      exit_price: "",
      pnl: "",
      notes: "",
      emotion: "neutral",
    });
    setPnlManual(false);
    setShowMore(false);
    setDialogOpen(true);
  }

  function rememberTrade(f: TradeFormState) {
    writeJson(DEFAULTS_KEY, {
      market: f.market,
      type: f.type,
      currency: f.currency,
      time_zone: f.time_zone,
      brokerage: f.brokerage,
    } satisfies RememberedDefaults);
    const asset = f.asset.trim();
    if (asset) {
      const next = [asset, ...recentAssets.filter((a) => a.toLowerCase() !== asset.toLowerCase())].slice(0, 20);
      setRecentAssets(next);
      writeJson(RECENT_ASSETS_KEY, next);
    }
  }

  function setField<K extends keyof TradeFormState>(key: K, value: TradeFormState[K]) {
    if (key === "pnl") setPnlManual(value !== "");
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (PNL_INPUTS.has(key) && !pnlManual) next.pnl = calcPnl(next);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // "Save & add another" submits with this button; keep the dialog open then.
    const addAnother = ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value === "another";

    if (!form.date || !form.asset.trim()) {
      toast.error("Trade date and asset are required");
      return;
    }
    if (form.exit_date && form.exit_date < form.date) {
      toast.error("Exit day cannot be before trade date");
      return;
    }
    const nonNegative = ["quantity", "entry_price", "target_price", "stop_loss", "exit_price", "brokerage", "strike_price"] as const;
    if (nonNegative.some((k) => (num(form[k]) ?? 0) < 0)) {
      toast.error("Quantity, prices and brokerage can't be negative");
      return;
    }

    const strategyName = form.strategy.trim();

    setSaving(true);
    try {
      // Mirrors app.js's `rememberCustomStrategy` — get-or-create the
      // strategy server-side (createStrategy is idempotent by name,
      // case-insensitive) whenever a strategy name was entered.
      if (strategyName) {
        try {
          await api.strategies.createStrategy(strategyName);
        } catch (err) {
          console.error("Failed to remember strategy:", err);
        }
      }

      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

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
        tags,
        emotion: form.emotion || null,
        underlying_price: num(form.underlying_price),
        implied_volatility: num(form.implied_volatility),
        days_to_expiry: num(form.days_to_expiry),
      };

      if (editingTrade) {
        await api.trades.updateTrade(editingTrade.id, payload);
        toast.success("Trade updated");
      } else {
        await api.trades.createTrade(payload);
        toast.success(`${payload.asset} added`);
      }
      rememberTrade(form);

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
        setPnlManual(false);
        setTimeout(() => assetInputRef.current?.focus(), 0);
      } else {
        setDialogOpen(false);
      }
      await loadTrades(offset);
      await loadStrategies();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save trade");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.trades.deleteTrade(deleteTarget.id);
      toast.success("Trade deleted");
      setDeleteTarget(null);
      // If we deleted the last row on a page beyond the first, step back.
      const nextOffset = trades.length === 1 && offset > 0 ? offset - PAGE_SIZE : offset;
      setOffset(nextOffset);
      await loadTrades(nextOffset);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to delete trade");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <JournalLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Trades</h1>
            <p className="text-sm text-muted-foreground">
              {filtering ? `${total} matching trade${total === 1 ? "" : "s"}` : `${total} trade${total === 1 ? "" : "s"} logged`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" disabled={exporting} onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" disabled={exporting} onClick={exportPdf}>
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Trade
            </Button>
          </div>
        </div>
        <ImportTradesDialog open={importOpen} onOpenChange={setImportOpen} onImported={() => loadTrades(0)} />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="Search by asset or strategy"
              placeholder="Search by asset or strategy..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <Label htmlFor="trades-from" className="text-xs text-muted-foreground">From</Label>
              <Input
                id="trades-from"
                type="date"
                className="w-[9.5rem]"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => setDateFilter("from", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="trades-to" className="text-xs text-muted-foreground">To</Label>
              <Input
                id="trades-to"
                type="date"
                className="w-[9.5rem]"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => setDateFilter("to", e.target.value)}
              />
            </div>
          </div>
          {(search || fromDate || toDate) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 self-start sm:self-auto">
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
        {datesInvalid && <p className="text-sm text-destructive">The From date is after the To date.</p>}

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Exit Date</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Entry Time</TableHead>
                <TableHead>Exit Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Market</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">Target</TableHead>
                <TableHead className="text-right">Stop</TableHead>
                <TableHead className="text-right">Exit</TableHead>
                <TableHead className="text-right">Brokerage</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right">P&amp;L</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Emotion</TableHead>
                <TableHead>Notes</TableHead>
                {/* Pinned to the right edge so edit/delete stay visible when the wide table scrolls. */}
                <TableHead className="sticky right-0 z-10 bg-background text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={22} className="h-24 text-center text-muted-foreground">
                    Loading trades...
                  </TableCell>
                </TableRow>
              ) : visibleTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={22} className="h-24 text-center text-muted-foreground">
                    {filtering ? "No trades match these filters." : "No trades found."}
                  </TableCell>
                </TableRow>
              ) : (
                visibleTrades.map((trade) => {
                  const status = tradeStatus(trade.pnl);
                  const notesPreview = (trade.notes || "").length > 30 ? `${(trade.notes || "").slice(0, 30)}...` : trade.notes || "-";
                  return (
                    <TableRow key={trade.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(trade.date)}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDate(trade.exit_date || trade.date)}</TableCell>
                      <TableCell>
                        <Badge variant={trade.buy_sell === "sell" ? "destructive" : "default"} className="uppercase">
                          {trade.buy_sell || "buy"}
                        </Badge>
                      </TableCell>
                      <TableCell>{trade.entry_time || "-"}</TableCell>
                      <TableCell>{trade.exit_time || "-"}</TableCell>
                      <TableCell>{trade.type || "-"}</TableCell>
                      <TableCell>{trade.market ? marketLabel(trade.market) : "-"}</TableCell>
                      <TableCell className="font-medium">{trade.asset}</TableCell>
                      <TableCell>{trade.currency || "INR"}</TableCell>
                      <TableCell className="text-right">{trade.quantity ?? "-"}</TableCell>
                      <TableCell className="text-right">{formatMoney(trade.entry_price, trade.currency)}</TableCell>
                      <TableCell className="text-right">{formatMoney(trade.target_price, trade.currency)}</TableCell>
                      <TableCell className="text-right">{formatMoney(trade.stop_loss, trade.currency)}</TableCell>
                      <TableCell className="text-right">{formatMoney(trade.exit_price, trade.currency)}</TableCell>
                      <TableCell className="text-right">{formatMoney(trade.brokerage, trade.currency)}</TableCell>
                      <TableCell>{trade.strategy || "-"}</TableCell>
                      <TableCell className="text-right">{formatMoney(trade.margin, trade.currency)}</TableCell>
                      <TableCell className={cn("text-right font-medium", status.className)}>{formatMoney(trade.pnl, trade.currency)}</TableCell>
                      <TableCell className={status.className}>{status.label}</TableCell>
                      <TableCell className="capitalize">{trade.emotion || "neutral"}</TableCell>
                      <TableCell className="max-w-[160px] truncate" title={trade.notes || ""}>
                        {notesPreview}
                      </TableCell>
                      <TableCell className="sticky right-0 z-10 bg-background text-right shadow-[-6px_0_6px_-6px_hsl(var(--border))]">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(trade)} aria-label="Edit trade" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDuplicateDialog(trade)}
                            aria-label={`Log another ${trade.asset} trade`}
                            title="Duplicate (new trade with the same setup)"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(trade)} aria-label="Delete trade">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={cn(offset === 0 && "pointer-events-none opacity-50")}
                  onClick={() => offset > 0 && setOffset(Math.max(0, offset - PAGE_SIZE))}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink isActive>{currentPage}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <span className="px-2 text-sm text-muted-foreground">of {totalPages}</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  className={cn(currentPage >= totalPages && "pointer-events-none opacity-50")}
                  onClick={() => currentPage < totalPages && setOffset(offset + PAGE_SIZE)}
                />
              </PaginationItem>
              <PaginationItem>
                <form
                  className="ml-2 flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    goToPage(jumpTo);
                  }}
                >
                  <Label htmlFor="trades-jump" className="whitespace-nowrap text-sm text-muted-foreground">
                    Go to page
                  </Label>
                  <Input
                    id="trades-jump"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={totalPages}
                    placeholder={String(currentPage)}
                    value={jumpTo}
                    onChange={(e) => setJumpTo(e.target.value)}
                    className="h-9 w-20"
                  />
                  <Button type="submit" variant="outline" size="sm" disabled={!jumpTo}>
                    Go
                  </Button>
                </form>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTrade ? "Edit Trade" : "Add Trade"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* The essentials — enough to log a trade */}
            <section className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr_10rem]">
                <div className="space-y-1.5">
                  <Label>Side</Label>
                  <div role="radiogroup" aria-label="Buy or sell" className="inline-flex rounded-lg border p-0.5">
                    {(["buy", "sell"] as const).map((side) => (
                      <button
                        key={side}
                        type="button"
                        role="radio"
                        aria-checked={form.buy_sell === side}
                        onClick={() => setField("buy_sell", side)}
                        className={cn(
                          "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                          form.buy_sell === side
                            ? side === "buy"
                              ? "bg-emerald-600 text-white"
                              : "bg-red-600 text-white"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {side === "buy" ? "Buy / Long" : "Sell / Short"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="asset">Asset / Stock</Label>
                  <Input
                    id="asset"
                    ref={assetInputRef}
                    list="recent-assets"
                    autoFocus={!editingTrade}
                    value={form.asset}
                    onChange={(e) => setField("asset", e.target.value)}
                    placeholder="e.g. RELIANCE, NIFTY 24500 CE"
                    required
                  />
                  <datalist id="recent-assets">
                    {recentAssets.map((a) => (
                      <option key={a} value={a} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="date">Trade Date</Label>
                  <Input id="date" type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} required />
                </div>
              </div>

              <ChoiceChips
                label="Market"
                options={TRADE_MARKETS.map((m) => ({ value: m, label: marketLabel(m) }))}
                value={form.market}
                onChange={(v) => setField("market", v)}
                allowClear
              />

              {form.market === "Options" && (
                <div className="grid grid-cols-1 gap-4 rounded-lg border border-dashed p-3 sm:grid-cols-3">
                  <ChoiceChips
                    label="Option Type"
                    options={[
                      { value: "call", label: "Call (CE)" },
                      { value: "put", label: "Put (PE)" },
                    ]}
                    value={form.option_type}
                    onChange={(v) => setField("option_type", v as "call" | "put" | "")}
                    allowClear
                  />
                  <div className="space-y-1.5">
                    <Label htmlFor="strike_price">Strike Price</Label>
                    <Input id="strike_price" type="number" min={0} step="0.01" value={form.strike_price} onChange={(e) => setField("strike_price", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contract">Expiry / Contract</Label>
                    <Input id="contract" value={form.contract} onChange={(e) => setField("contract", e.target.value)} placeholder="e.g. 30 OCT 2026" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <div className="space-y-1.5">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" min={0} step="any" inputMode="decimal" value={form.quantity} onChange={(e) => setField("quantity", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="entry_price">Entry Price</Label>
                  <Input id="entry_price" type="number" min={0} step="0.01" inputMode="decimal" value={form.entry_price} onChange={(e) => setField("entry_price", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="exit_price">Exit Price</Label>
                  <Input
                    id="exit_price"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    value={form.exit_price}
                    onChange={(e) => setField("exit_price", e.target.value)}
                    placeholder="Blank if open"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stop_loss">Stop Loss</Label>
                  <Input id="stop_loss" type="number" min={0} step="0.01" inputMode="decimal" value={form.stop_loss} onChange={(e) => setField("stop_loss", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="target_price">Target</Label>
                  <Input id="target_price" type="number" min={0} step="0.01" inputMode="decimal" value={form.target_price} onChange={(e) => setField("target_price", e.target.value)} />
                </div>
              </div>

              {/* Live result: P&L follows the prices unless typed by hand */}
              {(() => {
                const pnlValue = num(form.pnl);
                const entry = num(form.entry_price);
                const stop = num(form.stop_loss);
                const target = num(form.target_price);
                const qty = num(form.quantity);
                const risk = entry != null && stop != null && qty ? Math.abs(entry - stop) * qty : null;
                const reward = entry != null && target != null && qty ? Math.abs(target - entry) * qty : null;
                return (
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg bg-muted/50 px-4 py-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">P&amp;L </span>
                      {pnlManual ? (
                        <Input
                          id="pnl"
                          aria-label="Profit / Loss"
                          type="number"
                          step="0.01"
                          value={form.pnl}
                          onChange={(e) => setField("pnl", e.target.value)}
                          className="inline-block h-8 w-32"
                        />
                      ) : (
                        <span
                          className={cn(
                            "font-semibold",
                            pnlValue == null ? "text-muted-foreground" : pnlValue >= 0 ? "text-emerald-600" : "text-red-600"
                          )}
                        >
                          {pnlValue == null ? "Open — add an exit price" : formatMoney(pnlValue, form.currency)}
                        </span>
                      )}
                      <button
                        type="button"
                        className="ml-2 text-xs text-primary hover:underline"
                        onClick={() => {
                          if (pnlManual) {
                            setPnlManual(false);
                            setForm((prev) => ({ ...prev, pnl: calcPnl(prev) }));
                          } else {
                            setPnlManual(true);
                          }
                        }}
                      >
                        {pnlManual ? "Use calculated" : "Type it myself"}
                      </button>
                    </div>
                    {risk != null && (
                      <div>
                        <span className="text-muted-foreground">Risk </span>
                        <span className="font-medium">{formatMoney(risk, form.currency)}</span>
                      </div>
                    )}
                    {risk != null && reward != null && risk > 0 && (
                      <div>
                        <span className="text-muted-foreground">Reward : Risk </span>
                        <span className="font-medium">{(reward / risk).toFixed(1)} : 1</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Label htmlFor="brokerage" className="text-muted-foreground font-normal">
                        Fees
                      </Label>
                      <Input
                        id="brokerage"
                        type="number"
                        min={0}
                        step="0.01"
                        value={form.brokerage}
                        onChange={(e) => setField("brokerage", e.target.value)}
                        className="h-8 w-24"
                      />
                    </div>
                  </div>
                );
              })()}

              <ChoiceChips
                label="Trading Type"
                options={TRADING_TYPES.map((t) => ({ value: t, label: t }))}
                value={form.type}
                onChange={(v) => setField("type", v)}
                allowClear
              />

              <div className="space-y-1.5">
                <ChoiceChips
                  label="Strategy"
                  options={strategyOptions.slice(0, 12).map((n) => ({ value: n, label: n }))}
                  value={form.strategy}
                  onChange={(v) => setField("strategy", v)}
                  allowClear
                />
                <Input
                  id="strategy"
                  aria-label="Strategy (type your own)"
                  list="strategy-options"
                  value={form.strategy}
                  onChange={(e) => setField("strategy", e.target.value)}
                  placeholder="…or type your own — it will be remembered"
                  className="max-w-sm"
                />
                <datalist id="strategy-options">
                  {strategyOptions.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              <ChoiceChips
                label="How did you feel?"
                options={EMOTIONS}
                value={form.emotion}
                onChange={(v) => setField("emotion", v || "neutral")}
              />
            </section>

            {/* Everything else, one click away */}
            <section className="space-y-3">
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                aria-expanded={showMore}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <ChevronDown className={cn("h-4 w-4 transition-transform", showMore && "rotate-180")} />
                {showMore ? "Hide details" : "More details — times, notes, tags, currency, margin"}
              </button>
              {showMore && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="exit_date">Exit Day</Label>
                      <Input id="exit_date" type="date" value={form.exit_date} onChange={(e) => setField("exit_date", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="entry_time">Entry Time</Label>
                      <Input id="entry_time" type="time" step={1} value={form.entry_time} onChange={(e) => setField("entry_time", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="exit_time">Exit Time</Label>
                      <Input id="exit_time" type="time" step={1} value={form.exit_time} onChange={(e) => setField("exit_time", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Time Zone</Label>
                      <Select value={form.time_zone} onValueChange={(v) => setField("time_zone", v)}>
                        <SelectTrigger aria-label="Time Zone">
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
                    <div className="space-y-1.5">
                      <Label>Currency</Label>
                      <Select value={form.currency} onValueChange={(v) => setField("currency", v)}>
                        <SelectTrigger aria-label="Currency">
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
                    <div className="space-y-1.5">
                      <Label htmlFor="margin">Margin</Label>
                      <Input id="margin" type="number" step="0.01" value={form.margin} onChange={(e) => setField("margin", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="notes">Trade Notes / Journal</Label>
                    <Textarea
                      id="notes"
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setField("notes", e.target.value)}
                      placeholder="Pre-trade plan, setup quality, market conditions, post-trade review..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input id="tags" value={form.tags} onChange={(e) => setField("tags", e.target.value)} placeholder="e.g., breakout, momentum" />
                  </div>
                  {form.market === "Options" && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="underlying_price">Underlying Price</Label>
                        <Input id="underlying_price" type="number" step="0.01" value={form.underlying_price} onChange={(e) => setField("underlying_price", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="implied_volatility">Implied Volatility (%)</Label>
                        <Input id="implied_volatility" type="number" step="0.01" value={form.implied_volatility} onChange={(e) => setField("implied_volatility", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="days_to_expiry">Days to Expiry</Label>
                        <Input id="days_to_expiry" type="number" value={form.days_to_expiry} onChange={(e) => setField("days_to_expiry", e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              {!editingTrade && (
                <Button type="submit" value="another" variant="outline" disabled={saving}>
                  Save &amp; add another
                </Button>
              )}
              <Button type="submit" value="save" disabled={saving}>
                {saving ? "Saving..." : "Save Trade"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this trade?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {deleteTarget?.asset} trade from {formatDate(deleteTarget?.date)}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </JournalLayout>
  );
}
