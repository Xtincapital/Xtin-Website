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
import { useState, useEffect, useMemo, useCallback } from "react";
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
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { api } from "../lib/api";
import type { Trade, Strategy } from "../lib/api";
import JournalLayout from "../components/JournalLayout";

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

export default function Trades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [form, setForm] = useState<TradeFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Trade | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTrades = useCallback(async (nextOffset: number) => {
    setLoading(true);
    try {
      const res = await api.trades.getTrades({ limit: PAGE_SIZE, offset: nextOffset });
      setTrades(res.data || []);
      setTotal(res.pagination?.total ?? (res.data || []).length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load trades");
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Client-side filter over the currently-loaded page only — the list
  // endpoint (trades.validator.ts's tradeListQuerySchema) takes only
  // limit/offset, no filter params, so real server-side search isn't
  // available yet.
  const visibleTrades = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return trades;
    return trades.filter(
      (t) => t.asset.toLowerCase().includes(term) || (t.strategy || "").toLowerCase().includes(term)
    );
  }, [trades, search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  function openAddDialog() {
    setEditingTrade(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEditDialog(trade: Trade) {
    setEditingTrade(trade);
    setForm(tradeToForm(trade));
    setDialogOpen(true);
  }

  function setField<K extends keyof TradeFormState>(key: K, value: TradeFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.date || !form.asset.trim()) {
      toast.error("Trade date and asset are required");
      return;
    }
    if (form.exit_date && form.exit_date < form.date) {
      toast.error("Exit day cannot be before trade date");
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
        toast.success("Trade added");
      }

      setDialogOpen(false);
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
            <p className="text-sm text-muted-foreground">{total} trade{total === 1 ? "" : "s"} logged</p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Trade
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by asset or strategy..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

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
                <TableHead className="text-right">Actions</TableHead>
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
                    No trades found.
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
                      <TableCell>{trade.market || "-"}</TableCell>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(trade)} aria-label="Edit trade">
                            <Pencil className="h-4 w-4" />
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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Core trade details */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Core Trade Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="date">Trade Date</Label>
                  <Input id="date" type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} required />
                </div>
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
                    <SelectTrigger>
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
                  <Label>Trading Type</Label>
                  <Select value={form.type} onValueChange={(v) => setField("type", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRADING_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Trade Market</Label>
                  <Select value={form.market} onValueChange={(v) => setField("market", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select market" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRADE_MARKETS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="asset">Asset / Stock</Label>
                  <Input id="asset" value={form.asset} onChange={(e) => setField("asset", e.target.value)} placeholder="Enter asset name" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Select value={form.currency} onValueChange={(v) => setField("currency", v)}>
                    <SelectTrigger>
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
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" min={0} value={form.quantity} onChange={(e) => setField("quantity", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="entry_price">Entry Price</Label>
                  <Input id="entry_price" type="number" step="0.01" value={form.entry_price} onChange={(e) => setField("entry_price", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="target_price">Target Price</Label>
                  <Input id="target_price" type="number" step="0.01" value={form.target_price} onChange={(e) => setField("target_price", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stop_loss">Stop Loss</Label>
                  <Input id="stop_loss" type="number" step="0.01" value={form.stop_loss} onChange={(e) => setField("stop_loss", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="exit_price">Exit Price</Label>
                  <Input id="exit_price" type="number" step="0.01" value={form.exit_price} onChange={(e) => setField("exit_price", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="brokerage">Brokerage</Label>
                  <Input id="brokerage" type="number" step="0.01" value={form.brokerage} onChange={(e) => setField("brokerage", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pnl">Profit / Loss</Label>
                  <Input id="pnl" type="number" step="0.01" value={form.pnl} onChange={(e) => setField("pnl", e.target.value)} placeholder="Enter manual P&L" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="strategy">Trading Strategy</Label>
                  <Input
                    id="strategy"
                    list="strategy-options"
                    value={form.strategy}
                    onChange={(e) => setField("strategy", e.target.value)}
                    placeholder="Type or select a strategy"
                  />
                  <datalist id="strategy-options">
                    {strategyOptions.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                  <p className="text-xs text-muted-foreground">Start typing to add your own strategy — it will be remembered.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="margin">Margin</Label>
                  <Input id="margin" type="number" step="0.01" value={form.margin} onChange={(e) => setField("margin", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Buy / Sell</Label>
                  <Select value={form.buy_sell} onValueChange={(v) => setField("buy_sell", v as "buy" | "sell")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy (Long)</SelectItem>
                      <SelectItem value="sell">Sell (Short)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Advanced / options fields */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Advanced &amp; Options Fields</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="contract">Contract</Label>
                  <Input id="contract" value={form.contract} onChange={(e) => setField("contract", e.target.value)} placeholder="e.g., NOV-2025" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="strike_price">Strike Price (options only)</Label>
                  <Input
                    id="strike_price"
                    type="number"
                    step="0.01"
                    value={form.strike_price}
                    onChange={(e) => setField("strike_price", e.target.value)}
                    placeholder="Leave empty for non-options"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Option Type</Label>
                  <Select value={form.option_type || "none"} onValueChange={(v) => setField("option_type", v === "none" ? "" : (v as "call" | "put"))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Not an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not an option</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="put">Put</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="underlying_price">Underlying Price</Label>
                  <Input
                    id="underlying_price"
                    type="number"
                    step="0.01"
                    value={form.underlying_price}
                    onChange={(e) => setField("underlying_price", e.target.value)}
                    placeholder="Current market price"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="implied_volatility">Implied Volatility (%)</Label>
                  <Input
                    id="implied_volatility"
                    type="number"
                    step="0.01"
                    value={form.implied_volatility}
                    onChange={(e) => setField("implied_volatility", e.target.value)}
                    placeholder="e.g., 18.5"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="days_to_expiry">Days to Expiry</Label>
                  <Input
                    id="days_to_expiry"
                    type="number"
                    value={form.days_to_expiry}
                    onChange={(e) => setField("days_to_expiry", e.target.value)}
                    placeholder="Days until expiration"
                  />
                </div>
              </div>
            </section>

            {/* Notes / tags / emotion */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Notes, Tags &amp; Emotion</h3>
              <div className="grid grid-cols-1 gap-4">
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input id="tags" value={form.tags} onChange={(e) => setField("tags", e.target.value)} placeholder="e.g., breakout, momentum" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Emotion / Psychology</Label>
                    <Select value={form.emotion} onValueChange={(v) => setField("emotion", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EMOTIONS.map((e) => (
                          <SelectItem key={e.value} value={e.value}>
                            {e.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </section>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
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
