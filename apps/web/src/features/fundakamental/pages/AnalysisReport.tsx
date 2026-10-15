// Ported from features-incoming/fundakamental/src/pages/AnalysisReport.tsx.
//
// Adaptations from the original:
//  - `@/store/usePlanStore` -> `../store/usePlanStore` (this port's store).
//  - `@/components/dashboard/DashboardLayout` -> `../components/dashboard/DashboardLayout`
//    (owned by the parallel shared-components task; not yet ported as of
//    this file's creation — the import will resolve once it lands. Do not
//    stub it here.)
//  - `@/components/ChatMessage` -> `../components/ChatMessage` (ported
//    alongside this page, verbatim — see that file).
//  - `@/lib/api` -> `../lib/api` (real client; `api.analysis.getReport`,
//    `api.chat.sendMessage`, `api.chat.getChatHistory` all confirmed
//    against reports.controller.ts / chat.controller.ts — see below).
//  - `@/lib/helpers` -> `../lib/helpers` (already ported; `exportReportPdf`
//    there is pro-gated client-side via usePlanStore and downloads the blob
//    via `downloadBlob` — reused as-is, matching the original page's logic).
//  - `@/hooks/use-toast` unchanged (already ported at that path).
//  - `@/components/ui/*` unchanged (already ported at that path).
//  - Route: mounted at `report/:id` under `/fundakamental/*`
//    (see ../FundakamentalApp.tsx's commented-out
//    `<Route path="report/:id" element={<AnalysisReport />} />` TODO) —
//    `useParams<{ id: string }>()` below matches that `:id` param name.
import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import PriceChart from "../components/report/PriceChart";
import ScoreRing from "../components/report/ScoreRing";
import { scoreTone } from "../lib/score";
import { usePlanStore } from "../store/usePlanStore";
// TODO: not yet ported — source:
// features-incoming/fundakamental/src/components/dashboard/DashboardLayout.tsx
import DashboardLayout from "../components/dashboard/DashboardLayout";
import ChatMessage from "../components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { api } from "../lib/api";
import { exportReportPdf } from "../lib/helpers";
import {
  ArrowLeft,
  Download,
  Send,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Eye,
  FileText,
  BarChart3,
  PieChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface MetricValue {
  score: number;
  label?: string;
  details?: string;
}

interface KeyRatio {
  name: string;
  value: string;
  benchmark: string;
}

interface Report {
  id: string;
  company: string;
  ticker: string;
  exchange: string;
  date: string;
  overall_score: number;
  summary: string;
  plain_english?: string;
  metrics: Record<string, MetricValue>;
  key_ratios: KeyRatio[];
  strengths: string[];
  red_flags: string[];
  investment_assessment: string;
  // Pro-only deeper sections (present when generated on a paid plan)
  personalized_take?: string;
  bull_case?: string[];
  bear_case?: string[];
  what_to_watch?: string[];
  peer_context?: string;
  data_confidence?: { score?: number; note?: string };
}

interface ChatSource {
  document: string;
  page: number;
  excerpt: string;
}

interface UIMessage {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
}

const WELCOME_MESSAGE: UIMessage = {
  role: "assistant",
  content:
    "I've analyzed this document. Ask me anything about the financials, ratios, or risks and I'll answer from the source material.",
  sources: [],
};

const hasValue = (v?: string | null) => !!v && !/^n\/?a$/i.test(v.trim());

/** Plain-language health label for the overall score (not a buy/sell call). */
const verdictFor = (s: number) =>
  s >= 8 ? "Strong fundamentals" : s >= 6.5 ? "Healthy" : s >= 5 ? "Mixed" : "Weak";

const stampTone = (s: number) =>
  s >= 6.5 ? "bg-brand-fill text-white" : s >= 5 ? "bg-warning text-white" : "bg-destructive text-white";

/** First number in a ratio string ("14.2%", "Industry avg 1.8x") or null. */
const firstNumber = (s?: string) => {
  const m = (s || "").replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};

const SECTIONS = [
  { id: "r-summary", label: "Summary" },
  { id: "r-scores", label: "Scores" },
  { id: "r-ratios", label: "Ratios" },
  { id: "r-risks", label: "Risks" },
  { id: "r-verdict", label: "Verdict" },
];

const CARD = "rounded-2xl bg-card border border-border p-5 md:p-6";
const H2 = "text-base font-bold text-foreground mb-4 flex items-center gap-2";

/** Titan-vs-benchmark position on one shared scale. Neutral colours: whether
 *  higher is better depends on the ratio, so it shows position only. */
function BenchmarkBar({ value, benchmark }: { value: string; benchmark: string }) {
  const v = firstNumber(value);
  const b = firstNumber(benchmark);
  if (v == null || b == null) return <span className="text-xs text-muted-foreground">—</span>;
  const lo = Math.min(0, v, b);
  const hi = Math.max(v, b) * 1.15 || 1;
  const pos = (t: number) => `${((t - lo) / (hi - lo || 1)) * 100}%`;
  return (
    <div className="relative ml-auto h-4 w-28" title={`This company ${value} · benchmark ${benchmark}`}>
      <div className="absolute inset-x-0 top-[7px] h-0.5 rounded bg-border" />
      <div className="absolute top-0.5 h-3 w-0.5 -translate-x-1/2 rounded bg-muted-foreground" style={{ left: pos(b) }} />
      <motion.div
        className="absolute top-0.5 h-3 w-3 -translate-x-1/2 rounded-full bg-brand-fill ring-[3px] ring-brand-soft"
        initial={{ left: pos(b) }}
        animate={{ left: pos(v) }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      />
    </div>
  );
}

const AnalysisReport = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [report, setReport] = useState<Report | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(true);
  const [reportError, setReportError] = useState<string | null>(null);
  // Subscribe to the plan itself: selecting the isPro function never re-rendered
  // once the plan loaded, so paying users kept seeing Free gates.
  const isPro = usePlanStore((s) => s.plan === "premium" || s.plan === "enterprise");

  const [messages, setMessages] = useState<UIMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeMetric, setActiveMetric] = useState<number | null>(null);
  const [previous, setPrevious] = useState<{ score: number; date: string } | null>(null);
  const [showNav, setShowNav] = useState(false);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Last completed report on the same ticker, for "Up from 7.4 on 12 Jul".
  useEffect(() => {
    if (!report || !hasValue(report.ticker)) return;
    let cancelled = false;
    api.analysis
      .getReportsList(50, 0)
      .then((r: any) => {
        const prev = (r?.reports || [])
          .filter(
            (x: any) =>
              x.id !== report.id &&
              x.ticker === report.ticker &&
              x.status === "completed" &&
              new Date(x.created_at) < new Date(report.date)
          )
          .sort((a: any, b: any) => +new Date(b.created_at) - +new Date(a.created_at))[0];
        if (prev && !cancelled)
          setPrevious({
            score: Number(prev.overall_score) || 0,
            date: new Date(prev.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }),
          });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [report]);

  // Sticky section bar: shows after the header scrolls away, tracks the section in view.
  useEffect(() => {
    if (!report) return;
    const onScroll = () => {
      setShowNav(window.scrollY > 320);
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < 180) current = s.id;
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [report]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages.length, isSending]);

  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 150, behavior: "smooth" });
  };

  // Fetch the report and any existing chat history on mount
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const load = async () => {
      setIsLoadingReport(true);
      setReportError(null);
      try {
        const data = await api.analysis.getReport(id);
        if (!cancelled) setReport(data);
      } catch (error) {
        if (!cancelled) {
          setReportError(
            error instanceof Error ? error.message : "Failed to load report."
          );
        }
      } finally {
        if (!cancelled) setIsLoadingReport(false);
      }

      try {
        const history = await api.chat.getChatHistory(id);
        if (!cancelled && Array.isArray(history) && history.length > 0) {
          setMessages([
            WELCOME_MESSAGE,
            ...history.map((m: any) => ({
              role: m.role,
              content: m.content,
              sources: m.sources || [],
            })),
          ]);
        }
      } catch {
        // No history yet — keep the welcome message
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const formattedDate = report?.date
    ? new Date(report.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const handleExportPDF = async () => {
    if (!report) return;
    setIsExporting(true);
    try {
      // Pro-gated inside the shared helper (free users get the upgrade modal).
      const result = await exportReportPdf(report);
      if (result === "ok") {
        toast({
          title: "PDF Exported",
          description: "Your analysis report has been downloaded successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description:
          error instanceof Error ? error.message : "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || isSending || !id) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInputValue("");
    setIsSending(true);

    try {
      const resp = await api.chat.sendMessage(id, text);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: resp.message, sources: resp.sources },
      ]);
    } catch (error) {
      toast({
        title: "Chat error",
        description:
          error instanceof Error ? error.message : "Failed to get a response.",
        variant: "destructive",
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't answer that right now. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoadingReport) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 max-w-7xl mx-auto" aria-busy="true" aria-label="Loading report">
          <Skeleton className="h-4 w-40 mb-4" />
          <Skeleton className="h-11 w-80 max-w-full mb-3" />
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-7 w-24" /><Skeleton className="h-7 w-24" /><Skeleton className="h-7 w-32" />
          </div>
          <Skeleton className="h-[262px] rounded-2xl mb-5" />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-[250px_minmax(0,1fr)]">
                <Skeleton className="h-[300px] rounded-2xl" /><Skeleton className="h-[300px] rounded-2xl" />
              </div>
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
            <Skeleton className="h-[560px] rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (reportError || !report) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-7rem)] gap-4 text-center px-6">
          <AlertTriangle className="w-10 h-10 text-warning" />
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Couldn't load this report
            </h2>
            <p className="text-sm text-muted-foreground">
              {reportError || "The report may still be processing or was not found."}
            </p>
          </div>
          <Link to="/fundakamental">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to dashboard
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const score = Number(report.overall_score) || 0;
  const metricList: [string, number][] = Object.entries(report.metrics || {}).map(
    ([k, v]) => [k, Number(v?.score) || 0]
  );
  const showTicker = hasValue(report.ticker);
  const currency =
    /\.(NS|BO)$/i.test(report.ticker || "") || /NSE|BSE/i.test(report.exchange || "") ? "₹" : "$";
  const delta = previous ? score - previous.score : 0;

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Sticky section bar — appears once the header has scrolled away */}
        <div className="sticky top-[5.75rem] z-30 h-0">
          <AnimatePresence>
            {showNav && (
              <motion.nav
                aria-label="Report sections"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                className="flex items-center gap-3 overflow-x-auto rounded-2xl border border-border bg-card/85 px-3 py-2 shadow-lg backdrop-blur-xl"
              >
                <span className="hidden sm:block font-bold text-foreground whitespace-nowrap">{report.company}</span>
                <span className="text-sm font-bold tabular-nums whitespace-nowrap">
                  {score.toFixed(1)}<span className="font-medium text-muted-foreground">/10</span>
                </span>
                <span className={`hidden md:inline-block rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${stampTone(score)}`}>
                  {verdictFor(score)}
                </span>
                <div className="ml-auto flex gap-0.5">
                  {SECTIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => jumpTo(s.id)}
                      className={`rounded-lg px-2.5 py-1 text-sm font-semibold whitespace-nowrap transition-colors ${
                        activeSection === s.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex flex-wrap items-end justify-between gap-5"
        >
          <div className="min-w-0">
            <nav className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
              <Link to="/fundakamental" className="hover:text-foreground">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>Analysis report</span>
            </nav>
            <h1 className="xt-title mb-3">{report.company}</h1>
            <div className="flex flex-wrap gap-2">
              {showTicker && (
                <span className="rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground">
                  {hasValue(report.exchange) ? `${report.exchange}: ` : ""}{report.ticker}
                </span>
              )}
              <span className="rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                Generated {formattedDate}
              </span>
              {report.data_confidence?.score != null && (
                <span className="rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  Data confidence {report.data_confidence.score}/10
                </span>
              )}
            </div>
          </div>
          <Button
            className="gap-2 bg-brand-fill text-white hover:bg-brand-hover"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting…" : "Export PDF"}
          </Button>
        </motion.header>

        {/* Price history needs the Pro technicals feed; free plans skip the card. */}
        {isPro && showTicker && <PriceChart ticker={report.ticker} currency={currency} />}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-5">
            {/* Score ring + summary */}
            <div className="grid gap-5 md:grid-cols-[250px_minmax(0,1fr)]" id="r-summary">
              <section className={`${CARD} flex flex-col items-center justify-center gap-3 text-center`}>
                <ScoreRing overall={score} metrics={metricList} active={activeMetric} onActive={setActiveMetric} />
                <motion.span
                  initial={{ opacity: 0, rotateX: 85, scale: 1.3 }}
                  animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                  style={{ transformPerspective: 500 }}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide ${stampTone(score)}`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {verdictFor(score)}
                </motion.span>
                {previous && (
                  <span className="text-xs text-muted-foreground">
                    {delta > 0.05 ? "Up" : delta < -0.05 ? "Down" : "Level"} from{" "}
                    <b className="text-foreground tabular-nums">{previous.score.toFixed(1)}</b> on {previous.date}
                  </span>
                )}
                {metricList.length > 1 && (
                  <span className="text-xs text-muted-foreground">Hover a segment to see its score</span>
                )}
              </section>

              <section className={`${CARD} space-y-4`}>
                {report.plain_english && (
                  <div className="rounded-xl border border-brand-line bg-brand-soft p-4">
                    <p className="xt-eyebrow mb-1">The bottom line</p>
                    <p className="font-medium leading-relaxed text-foreground">{report.plain_english}</p>
                  </div>
                )}
                <div>
                  <h2 className={H2}>
                    <FileText className="w-4 h-4 text-brand" />
                    Executive summary
                  </h2>
                  <p className="leading-relaxed text-muted-foreground">{report.summary}</p>
                </div>
                {report.personalized_take && (
                  <div className="flex gap-3 rounded-xl border border-border bg-secondary/60 p-4">
                    <Eye className="mt-0.5 h-4 w-4 flex-none text-brand" />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      <b className="text-brand">Written for how you invest. </b>
                      {report.personalized_take}
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Health scores — hover syncs with the ring */}
            <section className={CARD} id="r-scores">
              <h2 className={H2}>
                <BarChart3 className="w-4 h-4 text-brand" />
                Financial health scores
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {Object.entries(report.metrics || {}).map(([key, value], i) => {
                  const s = Number(value?.score) || 0;
                  return (
                    <div
                      key={key}
                      onPointerEnter={() => setActiveMetric(i)}
                      onPointerLeave={() => setActiveMetric(null)}
                      className={`rounded-xl border p-4 transition-colors ${
                        activeMetric === i ? "border-brand bg-brand-soft" : "border-border bg-secondary/50"
                      }`}
                    >
                      <p className="xt-label mb-1 capitalize">{key}</p>
                      <p className="mb-2 text-2xl font-bold tabular-nums text-foreground">
                        {s}<span className="text-sm font-medium text-muted-foreground"> /10</span>
                      </p>
                      <div className={`grid grid-cols-10 gap-[3px] ${scoreTone(s)}`}>
                        {Array.from({ length: 10 }, (_, k) => (
                          <motion.i
                            key={k}
                            className={`h-1.5 rounded-sm ${k < Math.round(s) ? "bg-current" : "bg-border"}`}
                            initial={{ opacity: 0.2 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 + k * 0.05 + i * 0.08 }}
                          />
                        ))}
                      </div>
                      {value?.label && <p className={`mt-2 text-xs font-semibold ${scoreTone(s)}`}>{value.label}</p>}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Key ratios */}
            <section className={CARD} id="r-ratios">
              <h2 className={H2}>
                <PieChart className="w-4 h-4 text-brand" />
                Key financial ratios
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm tabular-nums">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="pb-2 pr-3 text-left font-bold">Ratio</th>
                      <th className="pb-2 px-3 text-right font-bold">Value</th>
                      <th className="pb-2 px-3 text-right font-bold">Benchmark</th>
                      <th className="pb-2 pl-3 text-right font-bold">vs benchmark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.key_ratios || []).map((ratio, index) => (
                      <tr key={index} className="border-t border-border">
                        <td className="py-3 pr-3 text-foreground">{ratio.name}</td>
                        <td className="py-3 px-3 text-right font-bold text-foreground">{ratio.value}</td>
                        <td className="py-3 px-3 text-right text-muted-foreground">{ratio.benchmark}</td>
                        <td className="py-3 pl-3"><BenchmarkBar value={ratio.value} benchmark={ratio.benchmark} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Strengths & red flags */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2" id="r-risks">
              <section className={CARD}>
                <h2 className={H2}>
                  <CheckCircle className="w-4 h-4 text-brand" />
                  Strengths
                </h2>
                <ul className="divide-y divide-border">
                  {(report.strengths || []).map((strength, index) => (
                    <li key={index} className="flex items-start gap-3 py-2.5 text-sm text-muted-foreground first:pt-0">
                      <span className="grid h-5 w-5 flex-none place-items-center rounded-md bg-brand-soft text-xs font-extrabold text-brand">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </section>
              <section className={CARD}>
                <h2 className={H2}>
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  Red flags & concerns
                </h2>
                <ul className="divide-y divide-border">
                  {(report.red_flags || []).map((flag, index) => (
                    <li key={index} className="flex items-start gap-3 py-2.5 text-sm text-muted-foreground first:pt-0">
                      <span className="grid h-5 w-5 flex-none place-items-center rounded-md bg-destructive/10 text-xs font-extrabold text-destructive">!</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Bull vs bear (Pro) */}
            {(report.bull_case?.length || report.bear_case?.length) ? (
              <div className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-2">
                {report.bull_case?.length ? (
                  <section className="p-5 md:p-6">
                    <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-foreground">
                      <TrendingUp className="h-4 w-4 text-brand" /> Bull case
                    </h2>
                    <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                      {report.bull_case.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </section>
                ) : null}
                {report.bear_case?.length ? (
                  <section className="border-t border-border p-5 md:border-l md:border-t-0 md:p-6">
                    <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-foreground">
                      <TrendingDown className="h-4 w-4 text-destructive" /> Bear case
                    </h2>
                    <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                      {report.bear_case.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </section>
                ) : null}
              </div>
            ) : null}

            {/* What to watch (Pro) */}
            {report.what_to_watch?.length ? (
              <section className={CARD}>
                <h2 className={H2}>
                  <Eye className="w-4 h-4 text-brand" />
                  What to watch next quarter
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {report.what_to_watch.map((w, i) => (
                    <div key={i} className="flex gap-3 rounded-xl border border-border p-4 text-sm text-muted-foreground">
                      <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">{i + 1}</span>
                      {w}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Pro upsell teaser — shown when the report has no deep sections (free plan) */}
            {!isPro && !report.bull_case?.length && (
              <section
                className="cursor-pointer rounded-2xl border border-dashed border-brand-line bg-brand-soft p-5 transition-colors hover:border-brand"
                onClick={() => usePlanStore.getState().openUpgrade("general")}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand" />
                  <span className="text-sm font-bold text-foreground">Unlock the full analyst view with Pro</span>
                  <span className="ml-auto pro-gold-bg text-xs font-bold tracking-wide px-1.5 py-0.5 rounded">PRO</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  The price chart, a personalised take written for how <em>you</em> invest, a full bull vs bear breakdown, what to watch next quarter, and one-click PDF export. <span className="font-semibold text-brand">Upgrade →</span>
                </p>
              </section>
            )}

            {/* Investment assessment — the closing verdict, inverted */}
            <section id="r-verdict" className="rounded-2xl bg-foreground p-5 text-background md:p-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-brand">Investment assessment</p>
              <p className="whitespace-pre-line leading-relaxed opacity-90">{report.investment_assessment}</p>
              <Button
                variant="outline"
                className="mt-4 gap-2 border-background bg-background text-foreground hover:bg-background/90"
                onClick={handleExportPDF}
                disabled={isExporting}
              >
                <Download className="w-4 h-4" />
                {isExporting ? "Exporting…" : "Download PDF report"}
              </Button>
            </section>

            <p className="text-xs text-muted-foreground">
              <strong>Disclaimer:</strong> This analysis is for educational purposes only and does not constitute
              financial advice. Past performance is not indicative of future results. Always conduct your own
              research before making investment decisions.
            </p>
          </div>

          {/* Ask about this report — stays beside the report while scrolling */}
          <motion.aside
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-border bg-card xl:sticky xl:top-24 xl:h-[calc(100vh-7.5rem)] xl:max-h-[760px]"
          >
            <div className="flex items-center gap-3 border-b border-border p-4">
              <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-brand-fill text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-bold text-foreground">Ask about this report</h2>
                <p className="text-xs text-muted-foreground">Answers come from the source document and use AI tokens</p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <ChatMessage key={index} role={message.role} content={message.content} sources={message.sources} />
                ))}
                {isSending && <ChatMessage role="assistant" content="" sources={[]} isLoading />}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                {["What are the biggest risks?", "How does it compare to peers?", "Is the debt a concern?", "Explain the margins"].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInputValue(suggestion)}
                      className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-brand-line hover:bg-brand-soft hover:text-foreground"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            )}

            <div className="flex gap-2 border-t border-border p-3">
              <Input
                aria-label="Ask a question about this report"
                placeholder={`Ask anything about ${report.company}…`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isSending}
                className="h-10 flex-1 rounded-xl bg-secondary border-border"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={isSending || !inputValue.trim()}
                aria-label="Send question"
                className="h-10 w-10 rounded-xl bg-brand-fill text-white hover:bg-brand-hover"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.aside>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalysisReport;
