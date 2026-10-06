// Gini Reports page — client-side PDF report generator. Free (no ProGate):
// reports are not in the original's Pro-module list, so every logged-in user
// can use it.
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
import { FileBarChart, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import GiniLayout from "../components/GiniLayout";
import { api } from "../lib/api";
import { csvCell, downloadTextFile } from "@/lib/uploadFile";
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

  // Report options — ids/semantics match the original's
  // #includeNetWorth/#includeGoals/#includePortfolio checkboxes exactly.
  const [includeNetWorth, setIncludeNetWorth] = useState(true);
  const [includeGoals, setIncludeGoals] = useState(true);
  const [includePortfolio, setIncludePortfolio] = useState(true);

  const [generating, setGenerating] = useState(false);
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

  // The same sections as the PDF (whichever are ticked), as one spreadsheet-friendly file.
  function handleDownloadCsv() {
    const rows: unknown[][] = [["Section", "Name", "Category / Type", "Amount", "Rate %", "Details"]];
    if (includeNetWorth || includePortfolio) {
      for (const a of assets) rows.push(["Asset", a.name, a.category, a.value, a.return_rate, a.ownership_type]);
      for (const l of liabilities) rows.push(["Liability", l.name, l.type, l.amount, l.rate, l.emi != null ? `EMI ${l.emi}` : ""]);
      rows.push(["Summary", "Net worth", "", summary.netWorth, "", ""]);
    }
    if (includeGoals) {
      for (const g of goals) rows.push(["Goal", g.name, g.category, g.current_cost, "", [g.target_year && `Target ${g.target_year}`, g.saved && `Saved ${g.saved}`].filter(Boolean).join("; ")]);
    }
    if (rows.length === 1) {
      toast.error("Nothing to export yet");
      return;
    }
    downloadTextFile(`Xtin-Gini-Report-${new Date().toISOString().split("T")[0]}.csv`, rows.map((r) => r.map(csvCell).join(",")).join("\n"));
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
      include: { netWorth: includeNetWorth, goals: includeGoals, portfolio: includePortfolio },
      isSample: sample,
    }),
    [assets, liabilities, members, summary, clientName, user?.email, sample, formatCurrency, includeNetWorth, includeGoals, includePortfolio],
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
  }, [isLoading, meta]);

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
            <p className="text-sm text-muted-foreground">Generate a printable financial report and download it as a PDF</p>
          </div>
        </div>

        {/* Report options */}
        <Card>
          <CardHeader>
            <CardTitle>Report Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <Checkbox id="includeNetWorth" checked={includeNetWorth} onCheckedChange={(v) => setIncludeNetWorth(v === true)} />
                <Label htmlFor="includeNetWorth" className="cursor-pointer">
                  Net Worth Statement
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="includeGoals" checked={includeGoals} onCheckedChange={(v) => setIncludeGoals(v === true)} />
                <Label htmlFor="includeGoals" className="cursor-pointer">
                  Goals Analysis
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="includePortfolio" checked={includePortfolio} onCheckedChange={(v) => setIncludePortfolio(v === true)} />
                <Label htmlFor="includePortfolio" className="cursor-pointer">
                  Portfolio Summary
                </Label>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={handleDownloadCsv} disabled={isLoading} className="gap-2">
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
              <Button onClick={handleDownloadPdf} disabled={isLoading || generating || !meta} className="gap-2">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {generating ? "Generating PDF…" : "Download PDF"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !meta ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <div ref={frameRef} className="w-full overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#ffffff] shadow-sm" style={{ height: "auto" }}>
                <div style={{ width: REPORT_WIDTH * scale, height: docH * scale || undefined }}>
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
    </GiniLayout>
  );
}
