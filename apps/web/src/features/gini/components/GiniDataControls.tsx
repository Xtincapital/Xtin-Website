// "Download my data" / "Upload data": all of the user's Gini data as one CSV
// (format in ../lib/giniDataCsv.ts, merge rules in ../lib/giniDataImport.ts).
// Sits beside "Load sample data"; hidden while sample mode is on, because
// that data isn't the user's.
import { useRef, useState } from "react";
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { downloadTextFile } from "@/lib/uploadFile";
import { buildGiniCsv, countBySection, parseGiniCsv, PRO_SECTIONS, SECTIONS, type ParsedGiniCsv } from "../lib/giniDataCsv";
import { applyGiniImport, fetchGiniData, type ImportOutcome } from "../lib/giniDataImport";
import { useGiniPlanStore } from "../store/useGiniPlanStore";

const SECTION_LABEL: Record<(typeof SECTIONS)[number], string> = {
  Family: "Family members",
  Asset: "Assets",
  Liability: "Liabilities",
  Goal: "Goals",
  "Elder Care": "Elder-care plans",
  Education: "Education plans",
  Tax: "Tax deductions",
};

const buttonClass =
  "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 whitespace-nowrap hover:bg-gray-50 transition-colors disabled:opacity-60";

async function ensurePlan() {
  const store = useGiniPlanStore.getState();
  if (!store.fetched) await store.fetchPlan();
  return useGiniPlanStore.getState().isPro();
}

export default function GiniDataControls() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedGiniCsv | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<[number, number]>([0, 0]);
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null);

  async function handleDownload() {
    setDownloading(true);
    try {
      const data = await fetchGiniData(await ensurePlan());
      const total = data.family.length + data.assets.length + data.liabilities.length + data.goals.length + data.elderCare.length + data.education.length;
      // A backup: amounts stay in rupees (as saved) so it restores exactly, whatever currency is selected.
      downloadTextFile(`gini-data-INR-${new Date().toISOString().slice(0, 10)}.csv`, buildGiniCsv(data));
      toast.success(total ? "Downloaded all your Gini data" : "Downloaded an empty file with the column headers. Fill it in and upload it.");
    } catch (err: any) {
      toast.error(err?.message || "Could not download your data");
    } finally {
      setDownloading(false);
    }
  }

  function reset() {
    setFileName("");
    setParsed(null);
    setOutcome(null);
    setProgress([0, 0]);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Upload the .csv file you downloaded from \"Download my data\"");
      return;
    }
    reset();
    setFileName(file.name);
    setIsPro(await ensurePlan());
    setParsed(parseGiniCsv(await file.text()));
    setOpen(true);
  }

  async function handleSave() {
    if (!parsed) return;
    setSaving(true);
    try {
      const existing = await fetchGiniData(isPro);
      const result = await applyGiniImport(parsed, existing, { isPro, onProgress: (d, t) => setProgress([d, t]) });
      setOutcome(result);
      queryClient.invalidateQueries({ queryKey: ["gini"] });
      const saved = result.created + result.updated;
      if (saved && !result.failed.length) toast.success(`Saved ${saved} record${saved === 1 ? "" : "s"} from ${fileName}`);
      else if (saved) toast.warning(`Saved ${saved}, ${result.failed.length} could not be saved`);
      else toast.error("Nothing from that file could be saved");
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  const counts = parsed ? countBySection(parsed) : null;
  const toSave = counts ? SECTIONS.reduce((n, s) => n + (isPro || !PRO_SECTIONS.includes(s) ? counts[s] : 0), 0) : 0;
  const proInFile = counts ? PRO_SECTIONS.reduce((n, s) => n + counts[s], 0) : 0;

  return (
    <>
      <button type="button" className={buttonClass} onClick={handleDownload} disabled={downloading}>
        {downloading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Download className="w-4 h-4" aria-hidden="true" />}
        Download my data
      </button>
      <button type="button" className={buttonClass} onClick={() => inputRef.current?.click()}>
        <Upload className="w-4 h-4" aria-hidden="true" />
        Upload data
      </button>
      <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" aria-label="Gini data CSV file" onChange={(e) => handleFile(e.target.files?.[0])} />

      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (saving) return;
          setOpen(o);
          if (!o) reset();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload your Gini data</DialogTitle>
            <DialogDescription>
              Records that match ones you already have (same name) are updated, new ones are added, and nothing is deleted. Blank cells keep
              your current values. Amounts in this file are in rupees (₹), as in "Download my data".
            </DialogDescription>
          </DialogHeader>

          {fileName && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
              {fileName}
            </p>
          )}

          {counts && !outcome && (
            <div className="space-y-3 text-sm">
              {toSave + proInFile > 0 && (
                <ul className="rounded-md border divide-y">
                  {SECTIONS.filter((s) => counts[s] > 0).map((s) => {
                    const locked = !isPro && PRO_SECTIONS.includes(s);
                    return (
                      <li key={s} className="flex justify-between px-3 py-2">
                        <span>{SECTION_LABEL[s]}</span>
                        <span className={locked ? "text-muted-foreground" : "font-medium tabular-nums"}>
                          {locked ? `${counts[s]} · Pro only, skipped` : counts[s]}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              {!isPro && proInFile > 0 && (
                <p className="text-muted-foreground">Elder-care, education and tax rows are Gini Pro features, so they won't be saved on your plan.</p>
              )}
              {parsed!.problems.length > 0 && (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900 max-h-40 overflow-y-auto">
                  <p className="font-medium mb-1">
                    {parsed!.problems.length} row{parsed!.problems.length === 1 ? "" : "s"} can't be read and will be skipped:
                  </p>
                  <ul className="space-y-0.5">
                    {parsed!.problems.slice(0, 20).map((p, i) => (
                      <li key={i}>
                        Line {p.line}: {p.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {toSave === 0 && !parsed!.problems.length && <p className="text-muted-foreground">There's nothing to save in this file.</p>}
            </div>
          )}

          {outcome && (
            <div className="space-y-3 text-sm">
              <p>
                <strong>{outcome.created}</strong> added, <strong>{outcome.updated}</strong> updated
                {outcome.proSkipped > 0 && <>, {outcome.proSkipped} Pro-only skipped</>}.
              </p>
              {outcome.failed.length + outcome.notes.length > 0 && (
                <ul className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900 space-y-0.5 max-h-40 overflow-y-auto">
                  {outcome.failed.map((f, i) => (
                    <li key={`f${i}`}>
                      {f.line ? `Line ${f.line}` : f.section}: not saved. {f.message}
                    </li>
                  ))}
                  {outcome.notes.map((n, i) => (
                    <li key={`n${i}`}>
                      Line {n.line}: {n.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <DialogFooter>
            {outcome ? (
              <Button onClick={() => (setOpen(false), reset())}>Done</Button>
            ) : (
              <>
                <Button variant="outline" disabled={saving} onClick={() => (setOpen(false), reset())}>
                  Cancel
                </Button>
                <Button disabled={!toSave || saving} onClick={handleSave}>
                  {saving ? `Saving ${progress[0]}/${progress[1]}…` : `Save ${toSave} record${toSave === 1 ? "" : "s"}`}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
