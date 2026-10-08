// Gini Reports page — "Analyse my portfolio": one button runs the analysis
// and shows the full report, which can be downloaded as a PDF, or as a CSV in
// Gini's own data format (../lib/giniDataCsv.ts) that can be uploaded back
// from the Gini Dashboard's "Upload data". Free (no ProGate): reports are not
// in the original's Pro-module list, so every logged-in user can use it.
//
// Data is read-only via TanStack Query (same keys NetWorth/Dashboard use, so a
// warm cache means no extra fetches). The document itself lives in
// ../components/ReportDocument.tsx; ../lib/reportMeta.ts gives it a report
// number and an integrity fingerprint. The PDF is made by capturing each
// `[data-block]` of that document with html2canvas and packing the blocks onto
// A4 pages (so tables and goals are never cut mid-row), then stamping a header
// and "Page x of y" footer carrying the report number on every page.
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileBarChart, Download, Loader2, Info, ScanSearch, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import GiniLayout from "../components/GiniLayout";
import { api } from "../lib/api";
import { downloadTextFile } from "@/lib/uploadFile";
import { buildGiniCsv } from "../lib/giniDataCsv";
import { fetchGiniData } from "../lib/giniDataImport";
import { useGiniPlanStore } from "../store/useGiniPlanStore";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ReportDocument, { REPORT_WIDTH, type ReportData } from "../components/ReportDocument";
import { buildReportMeta, registerReport, verifyQr, type ReportMeta } from "@/lib/reportMeta";
import { giniSampleMode } from "../lib/sampleData";

function futureValue(currentCost: number, inflationPct: number | null, years: number) {
  const rate = (inflationPct ?? 0) / 100;
  const n = Math.max(0, years);
  return currentCost * Math.pow(1 + rate, n);
}

// Category buckets for the "risk profile" heuristic below — matches
// NetWorth.tsx's `ASSET_CATEGORIES` list.
const GROWTH_CATEGORIES = new Set(["Stocks", "Mutual Funds"]);

const ANALYSIS_STEPS = ["Adding up your assets and loans", "Checking your asset mix and risk", "Measuring progress on your goals", "Scoring your financial health"];
const STABLE_CATEGORIES = new Set(["Fixed Deposits", "Gold", "Cash", "PPF", "Insurance"]);

export default function Reports() {
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const sample = giniSampleMode.useState().active;

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["gini", "assets"],
    queryFn: api.assets.getAssets,
  });
  const { data: liabilities = [], isLoading: liabilitiesLoading } = useQuery({
    queryKey: ["gini", "liabilities"],
    queryFn: api.liabilities.getLiabilities,
  });
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["gini", "goals"],
    queryFn: api.goals.getGoals,
  });
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["gini", "family-members"],
    queryFn: api.familyMembers.getFamilyMembers,
  });

  const isLoading = assetsLoading || liabilitiesLoading || goalsLoading || membersLoading;

  // "Analyse my portfolio": idle → analysing (a short walk through the steps) → done.
  const [analysis, setAnalysis] = useState<"idle" | "analysing" | "done">("idle");
  const [step, setStep] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [generating, setGenerating] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [docH, setDocH] = useState(0);
  const [meta, setMeta] = useState<ReportMeta | null>(null);
  const [qr, setQr] = useState<string>();

  const summary = useMemo(() => {
    const totalAssets = assets.reduce((sum, a) => sum + (a.value || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + (l.amount || 0), 0);
    const netWorth = totalAssets - totalLiabilities;

    const byCategory = new Map<string, number>();
    assets.forEach((a) => {
      const key = a.category || "Uncategorized";
      byCategory.set(key, (byCategory.get(key) || 0) + (a.value || 0));
    });
    const allocation = Array.from(byCategory.entries())
      .map(([category, value]) => ({
        category,
        value,
        pct: totalAssets > 0 ? (value / totalAssets) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

    const monthlyIncome = members.filter((m) => m.is_earner).reduce((s, m) => s + (m.income || 0), 0);
    const monthlyEmi = liabilities.reduce((s, l) => s + (l.emi || 0), 0);
    const monthlyCashFlow = monthlyIncome - monthlyEmi;

    let growth = 0;
    assets.forEach((a) => {
      if (GROWTH_CATEGORIES.has(a.category || "")) growth += a.value || 0;
    });
    const growthPct = totalAssets > 0 ? (growth / totalAssets) * 100 : 0;
    const riskLabel = totalAssets === 0 ? "Not enough data" : growthPct >= 55 ? "Aggressive" : growthPct >= 25 ? "Moderate" : "Conservative";

    const goalRows = goals.map((g) => {
      const yearsRemaining = (g.target_year || new Date().getFullYear()) - new Date().getFullYear();
      const fv = futureValue(g.current_cost, g.inflation, yearsRemaining);
      const saved = g.saved || 0;
      const progressPct = fv > 0 ? Math.min(100, (saved / fv) * 100) : 0;
      return { ...g, futureValue: fv, progressPct };
    });

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      allocation,
      monthlyIncome,
      monthlyEmi,
      monthlyCashFlow,
      growthPct,
      riskLabel,
      goalRows,
    };
  }, [assets, liabilities, goals, members]);

  async function handleAnalyse() {
    setAnalysis("analysing");
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, 550));
    }
    setAnalysis("done");
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  // The CSV is the same file as the Dashboard's "Download my data", so it can be uploaded back into Gini.
  async function handleDownloadCsv() {
    setExportingCsv(true);
    try {
      const plan = useGiniPlanStore.getState();
      if (!plan.fetched) await plan.fetchPlan();
      const data = await fetchGiniData(useGiniPlanStore.getState().isPro());
      downloadTextFile(`gini-data-${new Date().toISOString().slice(0, 10)}.csv`, buildGiniCsv(data));
    } catch (err) {
      toast.error((err as Error)?.message || "Could not download the CSV");
    } finally {
      setExportingCsv(false);
    }
  }

  const clientName = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email : "Valued Client";

  const reportData: ReportData = useMemo(
    () => ({
      clientName: sample ? "Sample Household" : clientName,
      clientEmail: sample ? "sample@example.com" : user?.email || "",
      preparedFor: members.map((m) => m.name),
      currency: (n) => formatCurrency(n),
      totalAssets: summary.totalAssets,
      totalLiabilities: summary.totalLiabilities,
      netWorth: summary.netWorth,
      assets: assets.map((a) => ({ name: a.name, category: a.category || "Uncategorized", value: a.value || 0, returnRate: a.return_rate, owner: members.find((m) => m.id === a.owner)?.name || (a.ownership_type || "—") })),
      allocation: summary.allocation,
      liabilities: liabilities.map((l) => ({ name: l.name, type: l.type || "—", amount: l.amount || 0, rate: l.rate, emi: l.emi })),
      goals: summary.goalRows.map((g) => ({ name: g.name, category: g.category || "General", targetYear: g.target_year, priority: g.priority || "—", futureValue: g.futureValue, saved: g.saved || 0, progressPct: g.progressPct })),
      members: members.map((m) => ({ name: m.name, relationship: m.relationship || "—", age: m.age, income: m.income, earner: !!m.is_earner })),
      monthlyIncome: summary.monthlyIncome,
      monthlyEmi: summary.monthlyEmi,
      monthlyCashFlow: summary.monthlyCashFlow,
      growthPct: summary.growthPct,
      riskLabel: summary.riskLabel,
      isSample: sample,
    }),
    [assets, liabilities, members, summary, clientName, user?.email, sample, formatCurrency],
  );

  // Fingerprint the figures (not the layout options): same data -> same fingerprint.
  useEffect(() => {
    if (isLoading) return;
    let live = true;
    buildReportMeta(user?.id || "anon", { a: assets.map((x) => [x.name, x.value]), l: liabilities.map((x) => [x.name, x.amount, x.emi]), g: goals.map((x) => [x.name, x.current_cost, x.saved]), m: members.map((x) => [x.name, x.income]) }).then(async (m) => {
      const code = await verifyQr(m);
      if (live) {
        setMeta(m);
        setQr(code);
      }
    });
    return () => {
      live = false;
    };
  }, [isLoading, user?.id, assets, liabilities, goals, members]);

  // Fit the fixed-width A4 document into the card on narrow screens.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const fit = () => {
      setScale(Math.min(1, el.clientWidth / REPORT_WIDTH));
      setDocH(previewRef.current?.offsetHeight || 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    if (previewRef.current) ro.observe(previewRef.current);
    return () => ro.disconnect();
  }, [isLoading, meta, analysis]);

  async function handleDownloadPdf() {
    const root = previewRef.current;
    if (!root || !meta) return;
    setGenerating(true);
    try {
      // Record it first so /verify finds this copy. Sample-data reports are not registered.
      if (!sample && !(await registerReport(meta))) toast.warning("Report saved, but it could not be registered for online verification.");
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const pdf = new jsPDF("p", "mm", "a4");
      const PW = 210, PH = 297, top0 = 14, bottom = 16; // mm: room for header/footer stamps
      const usable = PH - top0 - bottom;
      const mmPerPx = PW / REPORT_WIDTH;
      let y = 0; // mm used on the current page
      let first = true;
      const blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-block]"));
      for (const block of blocks) {
        const canvas = await html2canvas(block, {
          backgroundColor: "#ffffff",
          scale: 2,
          width: REPORT_WIDTH,
          windowWidth: REPORT_WIDTH,
          // The preview is CSS-scaled to fit small screens; capture at 1:1.
          onclone: (doc) => {
            const wrap = doc.getElementById("report-scale-wrap");
            if (wrap) wrap.style.transform = "none";
          },
        });
        const h = canvas.height * (PW / canvas.width);
        const isCover = first;
        first = false;
        // The cover band bleeds to the page edges; everything else sits below the header strip.
        if (isCover) {
          pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, PW, h);
          y = h + 4 - top0;
          continue;
        }
        if (h > usable) {
          // Oversize block: slice it across pages.
          const slicePx = Math.floor((usable / h) * canvas.height);
          for (let t = 0; t < canvas.height; t += slicePx) {
            const sh = Math.min(slicePx, canvas.height - t);
            const part = document.createElement("canvas");
            part.width = canvas.width;
            part.height = sh;
            const ctx = part.getContext("2d");
            if (!ctx) break;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, part.width, sh);
            ctx.drawImage(canvas, 0, t, canvas.width, sh, 0, 0, canvas.width, sh);
            if (y > 0) { pdf.addPage(); y = 0; }
            const ph = sh * (PW / canvas.width);
            pdf.addImage(part.toDataURL("image/jpeg", 0.92), "JPEG", 0, top0, PW, ph);
            y = ph;
          }
          continue;
        }
        if (y + h > usable) { pdf.addPage(); y = 0; }
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, top0 + y, PW, h);
        y += h;
      }
      void mmPerPx;

      // Stamp every page: confidential header + report no. / page count footer.
      const total = pdf.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        pdf.setPage(p);
        if (p > 1) {
          pdf.setFont("times", "bold").setFontSize(8).setTextColor(11, 31, 58);
          pdf.text("XTIN CAPITAL  ·  GINI FINANCIAL PLANNING REPORT", 14, 9);
          pdf.setFont("helvetica", "normal").setTextColor(107, 114, 128);
          pdf.text(`Prepared for ${reportData.clientName}`, PW - 14, 9, { align: "right" });
          pdf.setDrawColor(184, 137, 43).setLineWidth(0.4).line(14, 11, PW - 14, 11);
        }
        pdf.setDrawColor(229, 231, 235).setLineWidth(0.2).line(14, PH - 12, PW - 14, PH - 12);
        pdf.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(107, 114, 128);
        pdf.text(`Report No. ${meta.reportNo}  ·  Fingerprint ${meta.fingerprint.slice(0, 19)}…`, 14, PH - 8);
        pdf.text(`Page ${p} of ${total}`, PW - 14, PH - 8, { align: "right" });
      }
      pdf.setProperties({
        title: `Financial Planning Report — ${reportData.clientName}`,
        subject: `Report ${meta.reportNo}`,
        author: "Xtin Capital · Gini Planning Engine",
        keywords: meta.fingerprint,
        creator: "Xtin Capital",
      });
      pdf.save(`Xtin-Gini-Report-${meta.reportNo}.pdf`);
    } catch (e) {
      console.error("[Gini] report PDF failed:", e);
      toast.error("Could not generate the PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <GiniLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2">
          <FileBarChart className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
            <p className="text-sm text-muted-foreground">Analyse your portfolio and download the full report as a PDF or CSV</p>
          </div>
        </div>

        {analysis !== "done" ? (
          <Card>
            <CardContent className="flex flex-col items-center px-6 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {analysis === "analysing" ? <Loader2 className="h-7 w-7 animate-spin" /> : <ScanSearch className="h-7 w-7" />}
              </span>
              {analysis === "analysing" ? (
                <>
                  <h2 className="mt-4 text-lg font-semibold">Analysing your portfolio…</h2>
                  <ul className="mt-4 space-y-1.5 text-left text-sm" aria-live="polite">
                    {ANALYSIS_STEPS.map((label, i) => (
                      <li key={label} className={i <= step ? "text-foreground" : "text-muted-foreground/50"}>
                        <span className="mr-2 inline-flex w-4 justify-center">
                          {i < step ? <Check className="h-4 w-4 text-primary" /> : i === step ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "·"}
                        </span>
                        {label}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <h2 className="mt-4 text-lg font-semibold">See where your money stands</h2>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    Gini reviews your net worth, asset mix, loans, goals and household cash flow, rates your financial health, and puts it all in one report.
                  </p>
                  <Button size="lg" className="mt-6 gap-2" onClick={handleAnalyse} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
                    Analyse my portfolio
                  </Button>
                  {!isLoading && assets.length === 0 && goals.length === 0 && (
                    <p className="mt-3 text-xs text-muted-foreground">Tip: add your assets and goals first for a fuller analysis.</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div ref={resultsRef} className="scroll-mt-32 space-y-6">
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
                <CardTitle>Your portfolio analysis</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleAnalyse}>
                    <RotateCcw className="h-4 w-4" /> Analyse again
                  </Button>
                  <div className="flex items-center">
                    <Button variant="outline" onClick={handleDownloadCsv} disabled={exportingCsv || sample} className="gap-2" title={sample ? "Exit sample data to download your own data" : undefined}>
                      {exportingCsv ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      Download CSV
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" aria-label="About the CSV file" className="ml-1 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                          <Info className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-72 border-border bg-card text-sm text-card-foreground shadow-lg">
                        <p className="font-semibold">Reuse this data in Gini</p>
                        <p className="mt-1 text-muted-foreground">
                          The CSV holds your Gini data — family, assets, loans and goals — in Gini's own format. Upload it any time from the Gini
                          Dashboard with <span className="font-medium text-foreground">Upload data</span> to restore it, or open it in Excel or Google Sheets.
                        </p>
                        {sample && <p className="mt-2 text-xs text-muted-foreground">Exit sample data first to download your own data.</p>}
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button onClick={handleDownloadPdf} disabled={generating || !meta} className="gap-2">
                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {generating ? "Generating PDF…" : "Download PDF"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { label: "Net worth", value: formatCurrency(summary.netWorth) },
                    { label: "Risk profile", value: summary.riskLabel, sub: summary.totalAssets > 0 ? `${summary.growthPct.toFixed(0)}% in growth assets` : undefined },
                    { label: "Monthly cash flow", value: formatCurrency(summary.monthlyCashFlow), sub: summary.monthlyIncome > 0 ? "after EMIs" : "add family income" },
                    {
                      label: "Goals funded",
                      value: summary.goalRows.length ? `${(summary.goalRows.reduce((s, g) => s + g.progressPct, 0) / summary.goalRows.length).toFixed(0)}%` : "—",
                      sub: summary.goalRows.length ? `average of ${summary.goalRows.length} goal${summary.goalRows.length === 1 ? "" : "s"}` : "no goals yet",
                    },
                  ].map((t) => (
                    <div key={t.label} className="rounded-lg border border-border p-3">
                      <div className="text-xs text-muted-foreground">{t.label}</div>
                      <div className="mt-1 text-lg font-semibold tabular-nums">{t.value}</div>
                      {t.sub && <div className="text-xs text-muted-foreground">{t.sub}</div>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Full report — this is what the PDF contains */}
            <Card>
              <CardHeader>
                <CardTitle>Full report</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading || !meta ? (
                  <Skeleton className="h-96 w-full" />
                ) : (
                  <div ref={frameRef} className="w-full overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#ffffff] shadow-sm" style={{ height: "auto" }}>
                    <div className="mx-auto" style={{ width: REPORT_WIDTH * scale, height: docH * scale || undefined }}>
                      <div id="report-scale-wrap" style={{ width: REPORT_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
                        <div ref={previewRef}>
                          <ReportDocument d={reportData} meta={meta} qr={qr} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </GiniLayout>
  );
}
