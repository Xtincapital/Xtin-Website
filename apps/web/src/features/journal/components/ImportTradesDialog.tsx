// Upload a broker statement / spreadsheet (CSV, Excel, PDF), preview the
// trades the server parsed out of it, then save them to the journal.
// Parsing is stateless server-side (POST /journal/import-trades, Pro-only);
// saving goes through the normal `api.trades.createTrade`, so imported trades
// behave exactly like manually entered ones (and work in sample mode too).
//
// The server marks rows already in the journal or repeated in the file; they
// are shown and skipped unless the user ticks "Import them anyway".
import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, Download, Loader2, CopyCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { downloadTextFile, importFileType } from "@/lib/uploadFile";
import { api } from "../lib/api";
import type { FillsSummary, ImportedTrade } from "../lib/api";
import { journalSampleMode } from "../lib/sampleData";

const TEMPLATE_CSV = [
  "Date,Asset,Buy/Sell,Quantity,Entry Price,Exit Price,Brokerage,Strategy,Market,Currency,Notes",
  "2025-01-15,RELIANCE,Buy,50,2450.5,2478.25,40,Breakout,Equity,INR,Sample row - replace me",
  "2025-01-16,NIFTY 22500 CE,Sell,75,120,95,60,Iron Condor,Options,INR,",
].join("\n");

// One row per execution, as most brokers export their tradebook; buys and sells are paired into trades.
// Keep in step with the headers fillsImport.ts reads (services/api/modules/journal).
const TRADEBOOK_TEMPLATE_CSV = [
  "Date,Time,Symbol,Buy/Sell,Quantity,Price,Product,Brokerage",
  "2025-01-15,09:20:00,RELIANCE,Buy,50,2450.5,MIS,20",
  "2025-01-15,10:05:00,RELIANCE,Sell,50,2478.25,MIS,20",
].join("\n");

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

export default function ImportTradesDialog({ open, onOpenChange, onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ImportedTrade[]>([]);
  const [includeDuplicates, setIncludeDuplicates] = useState(false);
  const [skipped, setSkipped] = useState(0);
  const [fills, setFills] = useState<FillsSummary | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  function reset() {
    setFileName("");
    setRows([]);
    setSkipped(0);
    setFills(null);
    setProgress(0);
    setIncludeDuplicates(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const type = importFileType(file);
    if (!type) {
      toast.error("Upload a CSV, Excel (.xlsx/.xls) or PDF file");
      return;
    }
    setParsing(true);
    setRows([]);
    setFills(null);
    setFileName(file.name);
    try {
      const res = await api.bulkImport.parse(file, type);
      // In sample mode the server compared against the real journal, not the
      // sample trades on screen, so "already in your journal" doesn't apply.
      const parsed = (res.trades || []).map((t) => (journalSampleMode.isActive() && t.duplicate === "journal" ? { ...t, duplicate: undefined } : t));
      setRows(parsed);
      setIncludeDuplicates(false);
      setSkipped(res.skipped ?? 0);
      setFills(res.fills ?? null);
      if (!res.trades?.length) {
        toast.error(
          res.fills
            ? `We read ${plural(res.fills.fills, "execution", "executions")}, but none of them make a finished trade yet.`
            : "No trades found. Make sure the file has Date, Asset, Quantity and Entry/Exit price columns.",
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not read that file");
    } finally {
      setParsing(false);
    }
  }

  const inJournal = rows.filter((r) => r.duplicate === "journal").length;
  const inFile = rows.filter((r) => r.duplicate === "file").length;
  const toSave = includeDuplicates ? rows : rows.filter((r) => !r.duplicate);

  async function handleSave() {
    setSaving(true);
    setProgress(0);
    let ok = 0;
    let failed = 0;
    let alreadyThere = 0;
    for (const { duplicate, ...row } of toSave) {
      try {
        // Rows the user chose to import anyway are saved even though they match.
        await api.trades.createTrade(includeDuplicates && duplicate ? { ...row, allow_duplicate: true } : row);
        ok++;
      } catch (err: any) {
        // Added from another tab, or earlier in this same upload.
        if (/already in your journal/i.test(err?.message || "")) alreadyThere++;
        else failed++;
      }
      setProgress(ok + failed + alreadyThere);
    }
    setSaving(false);
    const notes = [alreadyThere && `${alreadyThere} already in your journal`, failed && `${failed} failed`].filter(Boolean).join(", ");
    if (ok) {
      toast.success(`Imported ${ok} trade${ok === 1 ? "" : "s"}${notes ? ` (${notes})` : ""}`);
      onImported();
      reset();
      onOpenChange(false);
    } else if (alreadyThere && !failed) {
      toast.info("These trades are already in your journal. Nothing new to import.");
    } else {
      toast.error("None of the trades could be saved");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (saving) return;
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import trades</DialogTitle>
          <DialogDescription>
            Upload a CSV, Excel or PDF statement, or your broker's tradebook (one row per buy or sell, which we pair into trades). We show a preview before anything is saved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <Button type="button" variant="outline" disabled={parsing || saving} onClick={() => inputRef.current?.click()}>
              {parsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {fileName ? "Choose another file" : "Choose file"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => downloadTextFile("journal-import-template.csv", TEMPLATE_CSV)}>
              <Download className="mr-2 h-4 w-4" />
              Download CSV template
            </Button>
            <Button type="button" variant="ghost" onClick={() => downloadTextFile("journal-tradebook-template.csv", TRADEBOOK_TEMPLATE_CSV)}>
              <Download className="mr-2 h-4 w-4" />
              Tradebook template
            </Button>
            {fileName && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" />
                {fileName}
              </span>
            )}
          </div>

          {fills && (
            <div className="rounded-md border p-3 text-sm" role="status">
              <p>
                Read <strong>{plural(fills.fills, "execution", "executions")}</strong> from your tradebook and paired them into <strong>{plural(fills.trades, "trade", "trades")}</strong>.
              </p>
              {fills.open > 0 && (
                <p className="mt-1 text-muted-foreground">
                  {plural(fills.open, "position is", "positions are")} still open (bought but not sold in this file, or the reverse), so {fills.open === 1 ? "it isn't" : "they aren't"} included.
                </p>
              )}
              {fills.unmatched > 0 && (
                <p className="mt-1 text-muted-foreground">
                  {plural(fills.unmatched, "sale has", "sales have")} no purchase in this file, for example shares bought before it begins, so {fills.unmatched === 1 ? "it's" : "they're"} left out.
                </p>
              )}
            </div>
          )}

          {rows.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground">
                Found <strong>{rows.length}</strong> trade{rows.length === 1 ? "" : "s"}
                {rows.length > 8 ? " — showing the first 8" : ""}.
                {skipped > 0 && (
                  <span className="text-amber-600 dark:text-amber-400">
                    {" "}
                    {skipped} row{skipped === 1 ? " was" : "s were"} skipped (missing a date, asset, quantity or price).
                  </span>
                )}
              </p>
              {inJournal + inFile > 0 && (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                  <p className="flex items-start gap-2 font-medium">
                    <CopyCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {inJournal === rows.length
                      ? `All ${rows.length} trade${rows.length === 1 ? " is" : "s are"} already in your journal.`
                      : [
                          inJournal > 0 && `${inJournal} trade${inJournal === 1 ? " is" : "s are"} already in your journal`,
                          inFile > 0 && `${inFile} ${inFile === 1 ? "is a repeat" : "are repeats"} of other rows in this file`,
                        ]
                          .filter(Boolean)
                          .join(" and ") + "."}
                  </p>
                  <p className="mt-1 pl-6">
                    Same date, asset, side, quantity, prices and entry time. {includeDuplicates ? "They will be imported again." : "They will be skipped."}
                  </p>
                  <label className="mt-2 flex items-center gap-2 pl-6">
                    <Checkbox checked={includeDuplicates} onCheckedChange={(v) => setIncludeDuplicates(v === true)} />
                    Import them anyway (they are separate trades)
                  </label>
                </div>
              )}
              <div className="rounded-md border overflow-x-auto max-h-72 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Entry</TableHead>
                      <TableHead className="text-right">Exit</TableHead>
                      <TableHead className="text-right">P&amp;L</TableHead>
                      {inJournal + inFile > 0 && <TableHead>Status</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 8).map((t, i) => (
                      <TableRow key={i} className={t.duplicate && !includeDuplicates ? "text-muted-foreground" : undefined}>
                        <TableCell>{t.date}</TableCell>
                        <TableCell>{t.asset}</TableCell>
                        <TableCell className="capitalize">{t.buy_sell}</TableCell>
                        <TableCell className="text-right">{t.quantity}</TableCell>
                        <TableCell className="text-right">{t.entry_price}</TableCell>
                        <TableCell className="text-right">{t.exit_price}</TableCell>
                        <TableCell className="text-right">{t.pnl != null ? Math.round(t.pnl * 100) / 100 : "-"}</TableCell>
                        {inJournal + inFile > 0 && (
                          <TableCell className="whitespace-nowrap text-xs">
                            {t.duplicate === "journal" ? "Already in journal" : t.duplicate === "file" ? "Repeated in file" : "New"}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!toSave.length || saving} onClick={handleSave}>
            {saving
              ? `Saving ${progress}/${toSave.length}…`
              : rows.length && !toSave.length
                ? "Nothing new to import"
                : `Import ${toSave.length || ""} trade${toSave.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
