// Upload → analysis progress card (New Analysis). Same props as the ported
// original; restyled to the approved step list: spinning ring for the
// running step, solid green check when done, one slim overall bar.
import { motion } from "framer-motion";
import { Check, FileText } from "lucide-react";

interface ProcessingStep {
  name: string;
  status: "pending" | "processing" | "completed";
  progress?: number;
}

interface FileProcessingStatusProps {
  fileName: string;
  fileSize: number;
  isProcessing: boolean;
  overallProgress: number;
  steps: ProcessingStep[];
}

const statusLine = (p: number) =>
  p >= 100
    ? "Analysis complete. Opening your report…"
    : p >= 75
    ? "Almost there. Writing the report…"
    : p >= 50
    ? "Analysing the financial data…"
    : "Reading and processing the document…";

const FileProcessingStatus = ({
  fileName,
  fileSize,
  isProcessing,
  overallProgress,
  steps,
}: FileProcessingStatusProps) => {
  const size = fileSize < 1024 * 1024 ? `${Math.max(1, Math.round(fileSize / 1024))} KB` : `${(fileSize / 1024 / 1024).toFixed(2)} MB`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-brand-line bg-card p-5"
      aria-live="polite"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-brand-soft text-brand">
          <FileText className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{fileName}</p>
          <p className="text-xs text-muted-foreground">
            {size} · {isProcessing ? "In progress" : "Completed"}
          </p>
        </div>
        <span className="text-sm font-bold tabular-nums text-foreground">{Math.round(overallProgress)}%</span>
      </div>

      <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="h-full rounded-full bg-brand-fill"
        />
      </div>

      <ol className="space-y-3">
        {steps.map((step, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`flex items-center gap-3 text-sm ${
              step.status === "pending" ? "text-muted-foreground" : "text-foreground"
            } ${step.status === "processing" ? "font-semibold" : ""}`}
          >
            {step.status === "completed" ? (
              <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-brand-fill text-white">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            ) : step.status === "processing" ? (
              <span className="h-5 w-5 flex-none animate-spin rounded-full border-2 border-brand border-t-transparent" />
            ) : (
              <span className="h-5 w-5 flex-none rounded-full border-2 border-border" />
            )}
            <span className="flex-1">{step.name}</span>
            {step.status === "processing" && step.progress !== undefined && (
              <span className="text-xs tabular-nums text-muted-foreground">{Math.round(step.progress)}%</span>
            )}
          </motion.li>
        ))}
      </ol>

      <p className="mt-4 border-t border-border pt-3 text-center text-xs text-muted-foreground">
        {statusLine(overallProgress)}
      </p>
    </motion.div>
  );
};

export default FileProcessingStatus;
