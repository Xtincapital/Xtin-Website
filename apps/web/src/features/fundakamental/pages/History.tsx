// Ported from features-incoming/fundakamental/src/pages/History.tsx.
//
// Adaptations from the original:
//  - `DashboardLayout` now comes from `../components/dashboard/DashboardLayout`
//    (relative, matching Dashboard.tsx/Settings.tsx's own convention) instead
//    of `@/components/dashboard/DashboardLayout`. Not yet ported by the
//    parallel shared-components task at the time of this port — see that
//    task for the real file.
//  - `api` now comes from `../lib/api` (this port's API client, already
//    wired to the real backend's `GET /fundakamental/reports` — see
//    services/api/modules/fundakamental/reports.controller.ts's
//    `getReportsList`, which returns exactly the `{ total, reports }` shape
//    this page expects) instead of `@/lib/api`.
//  - `exportReportPdf` now comes from `../lib/helpers` (already ported,
//    same Pro-gated PDF-export flow) instead of `@/lib/helpers`.
//  - Internal links updated from `/dashboard/...` to `/fundakamental/...`
//    to match this port's nested route scheme (see ../FundakamentalApp.tsx
//    and Dashboard.tsx, which already uses the same `/fundakamental/analyze`
//    and `/fundakamental/report/:id` paths).
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
// TODO: not yet ported — source:
// features-incoming/fundakamental/src/components/dashboard/DashboardLayout.tsx
import DashboardLayout from "../components/dashboard/DashboardLayout";
import PageHeader from "../components/PageHeader";
import { CARD, INPUT, BTN, ICON_TILE } from "../lib/ui";
import { scorePill, healthLabel, tickerTile } from "../lib/score";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Search,
  Clock,
  Download,
  Trash2,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { exportReportPdf } from "../lib/helpers";

interface ReportItem {
  id: string;
  company: string;
  ticker: string;
  overall_score: number;
  created_at: string;
  status: string;
}

type SortKey = "newest" | "oldest" | "score";
const PAGE_SIZE = 24;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const History = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ReportItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadReports = async (offset: number) => {
    try {
      const data = await api.analysis.getReportsList(PAGE_SIZE, offset);
      const incoming: ReportItem[] = data.reports || [];
      setTotal(data.total || 0);
      setReports((prev) => (offset === 0 ? incoming : [...prev, ...incoming]));
      setError(null);
    } catch {
      if (offset === 0) setError("We couldn't load your reports. Please try again.");
      else toast.error("Failed to load more reports");
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadReports(0);
      setLoading(false);
    })();
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadReports(reports.length);
    setLoadingMore(false);
  };

  // Client-side search + sort over the reports already loaded.
  const visibleReports = useMemo(() => {
    let list = reports;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.company.toLowerCase().includes(q) || r.ticker.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sort === "newest") {
      sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    } else if (sort === "oldest") {
      sorted.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    } else {
      sorted.sort((a, b) => b.overall_score - a.overall_score);
    }
    return sorted;
  }, [reports, searchQuery, sort]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setIsDeleting(true);
    // Optimistic removal.
    setReports((prev) => prev.filter((r) => r.id !== target.id));
    setTotal((t) => Math.max(0, t - 1));
    try {
      await api.analysis.deleteReport(target.id);
      toast.success("Report deleted");
    } catch {
      // Restore on failure.
      setReports((prev) => [target, ...prev]);
      setTotal((t) => t + 1);
      toast.error("Couldn't delete the report. Please try again.");
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  };

  const handleDownload = async (report: ReportItem) => {
    setExportingId(report.id);
    try {
      const result = await exportReportPdf({ id: report.id, ticker: report.ticker, company: report.company });
      if (result === "ok") toast.success("PDF downloaded");
    } catch {
      toast.error("Couldn't export this report. Please try again.");
    } finally {
      setExportingId(null);
    }
  };

  const scoreChip = (score: number) => (
    <div className="flex flex-col items-end gap-1">
      <span className="text-xl font-bold leading-none tabular-nums text-foreground">
        {score.toFixed(1)}<span className="text-xs font-medium text-muted-foreground">/10</span>
      </span>
      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${scorePill(score)}`}>{healthLabel(score)}</span>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <PageHeader title="Report History" subtitle="Every analysis you've run, newest first. Open, download or tidy them up." />

        {/* Search & Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${INPUT}`}
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-full sm:w-48 h-11 rounded-xl bg-card border-border">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="score">Highest score</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${CARD} p-5`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-7 w-16 rounded" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className={`${CARD} text-center py-16 px-6`}>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-destructive/10 text-destructive mx-auto mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Couldn't load your reports</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={async () => {
                setLoading(true);
                await loadReports(0);
                setLoading(false);
              }}
              className={BTN}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Empty (no reports at all) */}
        {!loading && !error && total === 0 && (
          <div className={`${CARD} text-center py-16 px-6`}>
            <div className={`${ICON_TILE} !h-12 !w-12 mx-auto mb-4`}>
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No reports yet</h3>
            <p className="text-muted-foreground mb-5">
              Analyze your first company and it'll show up here.
            </p>
            <Link to="/fundakamental/analyze">
              <Button className={BTN}>
                Create your first analysis
              </Button>
            </Link>
          </div>
        )}

        {/* Reports grid */}
        {!loading && !error && total > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleReports.map((report, index) => {
                const isProcessing =
                  report.status === "processing" || report.status === "pending";
                const isFailed = report.status === "failed";
                const isExporting = exportingId === report.id;
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(0.05 * index, 0.4) }}
                    className={`group ${CARD} p-5 transition-colors hover:border-brand-line`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-border bg-secondary text-[11px] font-extrabold tracking-tight text-foreground">
                        {tickerTile(report.ticker, report.company)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-foreground mb-1 truncate">{report.company}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          {report.ticker && !/^n\/?a$/i.test(report.ticker.trim()) && (
                            <span className="text-xs font-semibold text-foreground">
                              {report.ticker}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(report.created_at)}
                          </span>
                        </div>
                      </div>
                      {isProcessing ? (
                        <span className="rounded-full px-2.5 py-1 bg-warning/10 text-warning text-xs font-semibold animate-pulse">
                          Processing…
                        </span>
                      ) : isFailed ? (
                        <span className="rounded-full px-2.5 py-1 bg-destructive/10 text-destructive text-xs font-semibold">
                          Failed
                        </span>
                      ) : (
                        scoreChip(report.overall_score)
                      )}
                    </div>

                    <div className="flex items-center gap-2 border-t border-border pt-3">
                      {isFailed ? (
                        <div className="flex-1 text-xs text-muted-foreground">
                          Analysis didn't complete.
                        </div>
                      ) : (
                        <Link
                          to={isProcessing ? "#" : `/fundakamental/report/${report.id}`}
                          className={`flex-1 ${isProcessing ? "pointer-events-none" : ""}`}
                          tabIndex={isProcessing ? -1 : 0}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full rounded-lg font-bold group-hover:border-brand-line group-hover:text-brand"
                            disabled={isProcessing}
                          >
                            View Report
                          </Button>
                        </Link>
                      )}
                      {!isFailed && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          disabled={isProcessing || isExporting}
                          onClick={() => handleDownload(report)}
                          title="Download PDF"
                          aria-label={`Download PDF of ${report.company || "report"}`}
                        >
                          {isExporting ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Download className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setPendingDelete(report)}
                        title="Delete report"
                        aria-label={`Delete report for ${report.company || "this company"}`}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* No search matches */}
            {visibleReports.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">No reports match "{searchQuery}"</h3>
                <p className="text-muted-foreground">
                  Try a different search term or create a new analysis
                </p>
              </div>
            )}

            {/* Load more */}
            {!searchQuery && reports.length < total && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="gap-2"
                >
                  {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loadingMore ? "Loading…" : `Load more (${total - reports.length})`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && !isDeleting && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `"${pendingDelete.company}" will be permanently removed. This can't be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default History;
