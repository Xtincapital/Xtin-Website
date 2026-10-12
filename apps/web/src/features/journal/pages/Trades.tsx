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
import TradeFormDialog, { type TradeDialogRequest } from "../components/TradeFormDialog";
import { DEFAULT_STRATEGIES, formatMoney } from "../lib/tradeForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Search, Upload, Download, FileText, X, Copy } from "lucide-react";
import { csvCell, downloadTextFile } from "@/lib/uploadFile";
import ImportTradesDialog from "../components/ImportTradesDialog";
import TradeDetailsDialog from "../components/TradeDetailsDialog";
import InfoTip from "@/components/ui/info-tip";
import { api } from "../lib/api";
import type { Trade, Strategy } from "../lib/api";
import JournalLayout from "../components/JournalLayout";
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

const PAGE_SIZE = 25;

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
  const [onlyDuplicates, setOnlyDuplicates] = useState(false);
  const latestRequest = useRef(0);
  const datesInvalid = !!fromDate && !!toDate && fromDate > toDate;
  const filtering = !!(appliedSearch || fromDate || toDate || onlyDuplicates);

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
    setOnlyDuplicates(false);
    setOffset(0);
  }

  const [dialogRequest, setDialogRequest] = useState<TradeDialogRequest | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearConfirm, setClearConfirm] = useState("");
  const [clearing, setClearing] = useState(false);

  const [detailsTrade, setDetailsTrade] = useState<Trade | null>(null);
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
          flag_duplicates: true,
          only_duplicates: onlyDuplicates || undefined,
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
    [appliedSearch, fromDate, toDate, datesInvalid, onlyDuplicates]
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

  async function clearAllTrades() {
    setClearing(true);
    try {
      const res = await api.trades.clearTrades();
      toast.success(`Deleted ${res?.deleted ?? "all"} trade${res?.deleted === 1 ? "" : "s"}`);
      setClearOpen(false);
      setClearConfirm("");
      clearFilters();
      await loadTrades(0);
    } catch (err: any) {
      toast.error(err?.message || "Couldn't clear your trades");
    } finally {
      setClearing(false);
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
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {filtering ? `${total} matching trade${total === 1 ? "" : "s"}` : `${total} trade${total === 1 ? "" : "s"} logged`}
              <InfoTip title="Click a trade for the full picture">
                <p>The table keeps to what you need to scan and analyse: date, asset, size, entry and exit, P&amp;L and result.</p>
                <p>Click any row to see everything else: times, stop loss, target, fees, margin, emotion, notes, tags and option details.</p>
                <p>Each trade is listed in the currency it was logged in. The Dashboard and other pages convert them all into your selected currency.</p>
              </InfoTip>
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
            <Button
              variant="outline"
              className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
              disabled={total === 0 && !filtering}
              onClick={() => {
                setClearConfirm("");
                setClearOpen(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear all
            </Button>
            <Button onClick={() => setDialogRequest({ mode: "add" })}>
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
          <Button
            variant={onlyDuplicates ? "default" : "outline"}
            size="sm"
            className="h-10 gap-1.5 self-start sm:self-auto"
            aria-pressed={onlyDuplicates}
            onClick={() => {
              setOnlyDuplicates((v) => !v);
              setOffset(0);
            }}
            title="Trades with the same date, asset, side, quantity, prices and entry time as another trade"
          >
            <Copy className="h-4 w-4" />
            {onlyDuplicates ? "Showing duplicates" : "Show duplicates"}
          </Button>
          {(search || fromDate || toDate || onlyDuplicates) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 self-start sm:self-auto">
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
        {datesInvalid && <p className="text-sm text-destructive">The From date is after the To date.</p>}

        <div className="rounded-md border overflow-x-auto">
          <Table className="compact-rows">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">Exit</TableHead>
                <TableHead className="text-right">P&amp;L</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Strategy</TableHead>
                {/* Pinned to the right edge so edit/delete stay visible if the table scrolls on a narrow screen. */}
                <TableHead className="sticky right-0 z-10 bg-background text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    Loading trades...
                  </TableCell>
                </TableRow>
              ) : visibleTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    {filtering ? "No trades match these filters." : "No trades found."}
                  </TableCell>
                </TableRow>
              ) : (
                visibleTrades.map((trade) => {
                  const status = tradeStatus(trade.pnl);
                  return (
                    <TableRow
                      key={trade.id}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details of ${trade.asset} trade from ${formatDate(trade.date)}`}
                      className="cursor-pointer"
                      onClick={() => setDetailsTrade(trade)}
                      onKeyDown={(e) => {
                        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          setDetailsTrade(trade);
                        }
                      }}
                    >
                      <TableCell className="whitespace-nowrap">{formatDate(trade.date)}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          {trade.asset}
                          <Badge variant={trade.buy_sell === "sell" ? "destructive" : "default"} className="px-1.5 py-0 text-[10px] uppercase">
                            {trade.buy_sell || "buy"}
                          </Badge>
                          {trade.is_duplicate && (
                            <span
                              className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                              title="Same date, asset, side, quantity, prices and entry time as another trade in your journal"
                            >
                              <Copy className="h-3 w-3" />
                              Duplicate
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{trade.quantity != null ? trade.quantity.toLocaleString() : "-"}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMoney(trade.entry_price, trade.currency)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMoney(trade.exit_price, trade.currency)}</TableCell>
                      <TableCell className={cn("text-right font-medium tabular-nums", status.className)}>{formatMoney(trade.pnl, trade.currency)}</TableCell>
                      <TableCell className={status.className}>{status.label}</TableCell>
                      <TableCell>{trade.strategy || "-"}</TableCell>
                      <TableCell
                        className="sticky right-0 z-10 bg-background text-right shadow-[-6px_0_6px_-6px_hsl(var(--border))]"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setDialogRequest({ mode: "edit", trade })} aria-label="Edit trade" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDialogRequest({ mode: "copy", trade })}
                            aria-label={`Log another ${trade.asset} trade`}
                            title="Log again (new trade with the same setup)"
                          >
                            <Plus className="h-4 w-4" />
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

      <TradeFormDialog
        request={dialogRequest}
        onClose={() => setDialogRequest(null)}
        strategyOptions={strategyOptions}
        onSaved={async () => {
          await loadTrades(offset);
          await loadStrategies();
        }}
      />

      <TradeDetailsDialog
        trade={detailsTrade}
        onClose={() => setDetailsTrade(null)}
        onEdit={(trade) => {
          setDetailsTrade(null);
          setDialogRequest({ mode: "edit", trade });
        }}
        onLogAgain={(trade) => {
          setDetailsTrade(null);
          setDialogRequest({ mode: "copy", trade });
        }}
      />

      {/* Clear all trades */}
      <AlertDialog open={clearOpen} onOpenChange={(open) => !open && !clearing && setClearOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete every trade?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>This permanently deletes all trades in your journal. Your goals and strategies stay. This can't be undone.</p>
                <p>
                  Want a copy first?{" "}
                  <button type="button" className="font-medium text-primary hover:underline" onClick={exportCsv} disabled={exporting}>
                    Export CSV
                  </button>
                </p>
                <p>
                  Type <strong className="text-foreground">DELETE</strong> to confirm.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            aria-label="Type DELETE to confirm"
            value={clearConfirm}
            onChange={(e) => setClearConfirm(e.target.value)}
            placeholder="DELETE"
            autoComplete="off"
            disabled={clearing}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearing}>Cancel</AlertDialogCancel>
            <Button variant="destructive" disabled={clearConfirm !== "DELETE" || clearing} onClick={clearAllTrades}>
              {clearing ? "Deleting…" : "Delete all trades"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
