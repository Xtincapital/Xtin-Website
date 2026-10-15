// Ported from features-incoming/fundakamental/src/pages/NewAnalysis.tsx.
//
// Adaptations from the original:
//  - `usePlanStore` now comes from this port's own store
//    (../store/usePlanStore) — same shape the original relied on
//    (`wallet.balance`, `isPro()`, `openBuyTokens()`, `openUpgrade(reason)`,
//    `fetchWallet()`), verified directly against that file rather than
//    assumed.
//  - `useRegion` now comes from the shared `@/hooks/useRegion` (default
//    export, Context-based) instead of FundaKaMental's own module-singleton
//    hook of the same name — same precedent already used by
//    ../pages/Dashboard.tsx and ../pages/Settings.tsx in this port.
//  - `popularTickers` now lives in `../lib/currency` (this port's home for
//    FundaKaMental-specific region extras) instead of `@/lib/region`.
//  - `api` now comes from `../lib/api` (this backend's Express client) —
//    `api.analysis.uploadFile(file)` and `api.analysis.analyzeFile(fileId,
//    company, ticker, opts)` map onto the same `POST .../analysis/upload`
//    and `POST .../analysis/analyze` calls the original made, verified
//    against analysis.validator.ts/analysis.controller.ts's request body
//    (file_id/company_name/company_ticker/investor_style/horizon/region) and
//    response (`report_id`, `status`).
//  - `DashboardLayout`, `CompanySearchResults` and `AnalysisIllustration` are
//    owned by the parallel shared-components port; imported from their
//    expected paths in this feature folder.
//  - `useToast` comes from `@/hooks/use-toast` (already ported UI-primitive).
//  - Added: this page now also accepts a file handed off via router state
//    (`{ file, autoStart }`, sent by ../pages/Dashboard.tsx's upload box
//    when it redirects here) and a `?ticker=&name=` query pair (sent by
//    Dashboard's "analyze this stock" actions), since neither existed as an
//    entry point in the original standalone app. Purely additive — it does
//    not change the original upload/analyze flow itself.
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { usePlanStore } from "../store/usePlanStore";
import useRegion from "@/hooks/useRegion";
import { popularTickers } from "../lib/currency";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import PageHeader from "../components/PageHeader";
import { CARD_P, H2, H2_ICON, CHIP, CHIP_ON, INPUT, BTN } from "../lib/ui";
import CompanySearchResults from "../components/CompanySearchResults";
import FileProcessingStatus from "../components/FileProcessingStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Upload,
  FileText,
  X,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import { AnalysisIllustration } from "../components/brand/Illustrations";
import { api } from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import { uploadProblem } from "../lib/validations";

type StepStatus = "pending" | "processing" | "completed";
interface ProcessingStep {
  name: string;
  status: StepStatus;
  progress: number;
}

const INITIAL_STEPS: ProcessingStep[] = [
  { name: "Uploading file", status: "pending", progress: 0 },
  { name: "Extracting text from document", status: "pending", progress: 0 },
  { name: "Generating embeddings", status: "pending", progress: 0 },
  { name: "Analyzing financial data", status: "pending", progress: 0 },
  { name: "Generating report", status: "pending", progress: 0 },
];

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const NewAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { region } = useRegion();
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("name") || searchParams.get("ticker") || ""
  );
  // The company the report is about: picked in the search results, or passed
  // in from the dashboard (?ticker=&name=). Falls back to the file name.
  const [selectedCompany, setSelectedCompany] = useState<{ ticker: string; name: string } | null>(() => {
    const ticker = searchParams.get("ticker");
    return ticker ? { ticker, name: searchParams.get("name") || ticker } : null;
  });
  // Seed from the user's saved defaults (Settings → Preferences), else fall back.
  const [investorStyle, setInvestorStyle] = useState(
    () => localStorage.getItem("fk_pref_style") || "balanced"
  );
  const [horizon, setHorizon] = useState(
    () => localStorage.getItem("fk_pref_horizon") || "long_term"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(
    () => (location.state as { file?: File } | null)?.file || null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>(INITIAL_STEPS);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  function pickFile(file: File) {
    const problem = uploadProblem(file);
    if (problem) {
      toast({ title: "Can't use this file", description: problem, variant: "destructive" });
      return;
    }
    setSelectedFile(file);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      pickFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      pickFile(e.target.files[0]);
    }
    e.target.value = ""; // so picking the same file again still fires onChange
  };

  const markStep = (index: number, status: StepStatus) => {
    setProcessingSteps((prev) =>
      prev.map((step, i) =>
        i === index
          ? {
              ...step,
              status,
              progress: status === "completed" ? 100 : status === "processing" ? 50 : step.progress,
            }
          : step
      )
    );
  };

  /** Poll the report until the background analysis completes or fails. */
  const waitForReport = async (reportId: string) => {
    // A report takes 1-3 minutes; allow for one server-side retry on top.
    const deadline = Date.now() + 8 * 60 * 1000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 4000));
      const status = await api.analysis.getAnalysisStatus(reportId);
      if (status?.status === "completed") return;
      if (status?.status === "failed") {
        throw new Error(status.error || "Analysis failed. Please try again.");
      }
    }
    throw new Error("The analysis is taking longer than expected — check History in a minute.");
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please choose a financial document to analyze.",
        variant: "destructive",
      });
      return;
    }

    // Token gate: no balance → upgrade (free) or top up (pro) before spending effort.
    const plan = usePlanStore.getState();
    const w = plan.wallet;
    if (w && w.balance < 20000) {
      if (await plan.ensurePro()) plan.openBuyTokens();
      else plan.openUpgrade("reports");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProcessingSteps(INITIAL_STEPS);

    // Use the company picked in the search (or passed from the dashboard);
    // otherwise derive a readable name from the file name.
    const companyName = selectedCompany?.name || selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");
    const companyTicker = selectedCompany?.ticker || "";

    let creep: ReturnType<typeof setInterval> | undefined;
    try {
      // 1. Upload — the backend extracts text and builds embeddings during this request
      markStep(0, "processing");
      const upload = await api.analysis.uploadFile(selectedFile);
      markStep(0, "completed");
      markStep(1, "completed");
      markStep(2, "completed");
      setProgress(60);

      // Writing the report takes 1-3 minutes with no progress from the server,
      // so ease the bar from 60% towards 95% instead of leaving it frozen.
      creep = setInterval(() => {
        setProgress((p) => (p < 95 ? p + (95 - p) * 0.04 : p));
        setProcessingSteps((prev) =>
          prev.map((step) => (step.status === "processing" ? { ...step, progress: Math.min(95, step.progress + (95 - step.progress) * 0.04) } : step))
        );
      }, 2000);

      // 2. Run the AI analysis (this generates the report)
      markStep(3, "processing");
      markStep(4, "processing");
      const result = await api.analysis.analyzeFile(upload.file_id, companyName, companyTicker, {
        investorStyle,
        horizon,
        region,
      });

      if (!result.reportId) {
        throw new Error("Analysis did not return a report id.");
      }

      // The server writes the report in the background (it takes a minute or
      // two) — wait for it to finish before opening it.
      if (result.status !== "completed") {
        await waitForReport(result.reportId);
      }
      clearInterval(creep);
      markStep(3, "completed");
      markStep(4, "completed");
      setProgress(100);

      // Balance changed — refresh the wallet, then open the finished report
      usePlanStore.getState().fetchWallet();
      setTimeout(() => navigate(`/fundakamental/report/${result.reportId}`), 400);
    } catch (error) {
      clearInterval(creep);
      const message =
        error instanceof Error ? error.message : "Analysis failed. Please try again.";
      // Out of AI tokens → route to the right purchase surface instead of a
      // dead error. (Match the specific message, not any mention of "token" —
      // auth errors like "Invalid token" must show as errors.)
      if (/out of AI tokens/i.test(message)) {
        const plan = usePlanStore.getState();
        if (await plan.ensurePro()) plan.openBuyTokens();
      else plan.openUpgrade("reports");
      } else {
        toast({ title: "Analysis failed", description: message, variant: "destructive" });
      }
      setIsProcessing(false);
      setProgress(0);
      setProcessingSteps(INITIAL_STEPS);
    }
  };

  // Router-state handoff from Dashboard's upload box: file already chosen
  // there, so auto-kick the analysis instead of making the user re-click.
  useEffect(() => {
    const autoStart = (location.state as { autoStart?: boolean } | null)?.autoStart;
    if (autoStart && selectedFile && !isProcessing) {
      handleAnalyze();
    }
    // Only ever fire once off the initial navigation state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <PageHeader
          title="New Analysis"
          subtitle="Upload financial statements and we'll write the report the way you invest."
        />

        {/* Personalization — tailor the analysis to the investor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className={`${CARD_P} mb-6`}
        >
          <h2 className={`${H2} !mb-1`}>
            <Sparkles className={H2_ICON} />
            Tailor this analysis to you
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Fundakamental writes every report through your lens — the same filing, read the way <em>you</em> invest.
          </p>
          <Label className="xt-label">How do you invest?</Label>
          <div className="flex flex-wrap gap-2 mt-2 mb-4">
            {[
              { id: "beginner", label: "New to investing" },
              { id: "value", label: "Value" },
              { id: "growth", label: "Growth" },
              { id: "income", label: "Dividends / Income" },
              { id: "trader", label: "Shorter-term" },
              { id: "balanced", label: "Balanced" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setInvestorStyle(s.id)}
                className={`${CHIP} !h-9 !px-3.5 !text-sm ${investorStyle === s.id ? CHIP_ON : "!text-muted-foreground"}`}
                aria-pressed={investorStyle === s.id}
              >
                {s.label}
              </button>
            ))}
          </div>
          <Label className="xt-label">Your horizon</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              { id: "long_term", label: "Long term (years)" },
              { id: "medium", label: "Medium (6–18 mo)" },
              { id: "short", label: "Short term" },
            ].map((h) => (
              <button
                key={h.id}
                onClick={() => setHorizon(h.id)}
                className={`${CHIP} !h-9 !px-3.5 !text-sm ${horizon === h.id ? CHIP_ON : "!text-muted-foreground"}`}
                aria-pressed={horizon === h.id}
              >
                {h.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Search Company */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`${CARD_P} mb-6`}
        >
          <h2 className={`${H2} !mb-1`}>
            <Search className="w-4 h-4 text-brand" />
            Search Public Company
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Find a company, then upload its latest annual or quarterly report below to generate the analysis.
          </p>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter company name or ticker symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 !h-12 text-base ${INPUT}`}
            />
          </div>

          {/* Popular Tickers */}
          {!searchQuery && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Popular:</span>
              {popularTickers(region as any).map((ticker) => (
                <button
                  key={ticker}
                  onClick={() => setSearchQuery(ticker)}
                  className={CHIP}
                >
                  {ticker.replace(/\.(NS|BO)$/i, "")}
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {searchQuery && (
            <div className="mt-6">
              <CompanySearchResults
                query={searchQuery}
                onAnalyze={(company: any) => {
                  if (company?.ticker) {
                    setSelectedCompany({ ticker: company.ticker, name: company.name || company.ticker });
                  }
                  toast({
                    title: `Ready to analyse ${company?.name || company?.ticker || "this company"}`,
                    description:
                      "Upload its latest annual/quarterly report in the box below and Fundakamental will do the rest.",
                  });
                  document
                    .querySelector('[data-tour="upload-report"], #file-upload')
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              />
            </div>
          )}
        </motion.div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-4 font-bold tracking-wide text-muted-foreground">
              Or upload documents
            </span>
          </div>
        </div>

        {/* File Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={CARD_P}
        >
          <h2 className={H2}>
            <Upload className="w-4 h-4 text-brand" />
            Upload Financial Statements
          </h2>

          {!selectedFile ? (
            <label
              htmlFor="file-upload"
              className={`block border-[1.5px] border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-brand bg-brand-soft"
                  : "border-border bg-secondary/40 hover:border-brand hover:bg-brand-soft"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <AnalysisIllustration size={160} className="mx-auto mb-4" />
              <p className="text-foreground mb-1">
                <b>Drag & drop files here</b> or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Annual reports, quarterly results, balance sheets · max 25 MB
              </p>
              <div className="mt-3 flex justify-center gap-1.5">
                {["PDF", "XLSX", "XLS", "CSV"].map((f) => (
                  <span key={f} className="rounded border border-border bg-card px-1.5 py-px font-mono text-[10px] text-muted-foreground">{f}</span>
                ))}
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          ) : isProcessing ? (
            <FileProcessingStatus
              fileName={selectedFile.name}
              fileSize={selectedFile.size}
              isProcessing={isProcessing}
              overallProgress={progress}
              steps={processingSteps}
            />
          ) : (
            <div className="p-5 rounded-xl bg-card border border-brand-line">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center flex-none">
                  <FileText className="w-6 h-6 text-brand" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-foreground truncate">
                      {selectedFile.name}
                    </p>
                    {!isProcessing && (
                      <button
                        onClick={() => setSelectedFile(null)}
                        aria-label="Remove selected file"
                        className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {formatSize(selectedFile.size)}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {selectedCompany ? (
                      <>
                        Report will be for <span className="font-semibold text-foreground">{selectedCompany.name}</span>
                        {selectedCompany.ticker ? ` (${selectedCompany.ticker})` : ""}.{" "}
                        <button onClick={() => setSelectedCompany(null)} className="text-brand font-medium hover:underline">
                          Wrong company?
                        </button>
                      </>
                    ) : (
                      "The company name will be taken from the document. Pick the company above to add its ticker."
                    )}
                  </p>

                  <Button
                    onClick={() => handleAnalyze()}
                    className={`${BTN} gap-2`}
                  >
                    Start Analysis
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-border pt-5">
            <h3 className="xt-label mb-3">Supported documents</h3>
            <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {[
                "Annual reports (10-K, 20-F)",
                "Quarterly reports (10-Q)",
                "Income statements, balance sheets, cash flow",
                "Investor presentations with financial data",
              ].map((d) => (
                <li key={d} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-md bg-brand-soft text-brand">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default NewAnalysis;
