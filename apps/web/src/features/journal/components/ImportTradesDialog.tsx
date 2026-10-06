// Upload a broker statement / spreadsheet (CSV, Excel, PDF), preview the
// trades the server parsed out of it, then save them to the journal.
// Parsing is stateless server-side (POST /journal/import-trades, Pro-only);
// saving goes through the normal `api.trades.createTrade`, so imported trades
// behave exactly like manually entered ones (and work in sample mode too).
import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { downloadTextFile, importFileType } from "@/lib/uploadFile";
import { api } from "../lib/api";
import type { TradeCreateInput } from "../lib/api";

const TEMPLATE_CSV = [
  "Date,Asset,Buy/Sell,Quantity,Entry Price,Exit Price,Brokerage,Strategy,Market,Currency,Notes",
  "2025-01-15,RELIANCE,Buy,50,2450.5,2478.25,40,Breakout,Equity,INR,Sample row - replace me",
  "2025-01-16,NIFTY 22500 CE,Sell,75,120,95,60,Iron Condor,Options,INR,",
].join("\n");

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

export default function ImportTradesDialog({ open, onOpenChange, onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<TradeCreateInput[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  function reset() {
    setFileName("");
    setRows([]);
    setSkipped(0);
    setProgress(0);
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
    setFileName(file.name);
    try {
      const res = await api.bulkImport.parse(file, type);
      setRows(res.trades || []);
      setSkipped(res.skipped ?? 0);
      if (!res.trades?.length) {
        toast.error("No trades found. Make sure the file has Date, Asset, Quantity and Entry/Exit price columns.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not read that file");
    } finally {
      setParsing(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setProgress(0);
    let ok = 0;
    let failed = 0;
    for (const row of rows) {
      try {
        await api.trades.createTrade(row);
        ok++;
      } catch {
        failed++;
      }
      setProgress(ok + failed);
    }
    setSaving(false);
    if (ok) {
      toast.success(`Imported ${ok} trade${ok === 1 ? "" : "s"}${failed ? ` (${failed} failed)` : ""}`);
      onImported();
      reset();
      onOpenChange(false);
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
            Upload a CSV, Excel or PDF statement. We read the trades out of it and show a preview before anything is saved.
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
            {fileName && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" />
                {fileName}
              </span>
            )}
          </div>

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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 8).map((t, i) => (
                      <TableRow key={i}>
                        <TableCell>{t.date}</TableCell>
                        <TableCell>{t.asset}</TableCell>
                        <TableCell className="capitalize">{t.buy_sell}</TableCell>
                        <TableCell className="text-right">{t.quantity}</TableCell>
                        <TableCell className="text-right">{t.entry_price}</TableCell>
                        <TableCell className="text-right">{t.exit_price}</TableCell>
                        <TableCell className="text-right">{t.pnl != null ? Math.round(t.pnl * 100) / 100 : "-"}</TableCell>
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
          <Button disabled={!rows.length || saving} onClick={handleSave}>
            {saving ? `Saving ${progress}/${rows.length}…` : `Import ${rows.length || ""} trade${rows.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
