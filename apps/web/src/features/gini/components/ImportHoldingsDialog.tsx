// Upload a CSV / Excel sheet or a PDF statement of assets or liabilities (a broker holdings
// export, a bank/loan statement sheet, or your own spreadsheet), preview what
// was read, then save. Parsing is stateless server-side
// (POST /gini/import-holdings); saving reuses the normal create endpoints so
// imported rows behave like manually added ones (and work in sample mode).
import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { downloadTextFile, importFileType } from "@/lib/uploadFile";
import { api } from "../lib/api";

type Kind = "assets" | "liabilities";

const TEMPLATES: Record<Kind, string> = {
  assets: [
    "Name,Category,Value,Return Rate",
    "HDFC Flexi Cap Fund,Mutual Funds,250000,12",
    "SBI Fixed Deposit,Fixed Deposits,500000,7",
    "Family Flat,Real Estate,6500000,8",
  ].join("\n"),
  liabilities: [
    "Name,Type,Amount,Interest Rate,EMI,Tenure",
    "SBI Home Loan,Home Loan,3200000,8.5,32000,180",
    "HDFC Credit Card,Credit Card,45000,36,,",
  ].join("\n"),
};

interface Props {
  kind: Kind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

const inr = (n: number | null | undefined) => (n == null ? "-" : `₹${Math.round(n).toLocaleString("en-IN")}`);

export default function ImportHoldingsDialog({ kind, open, onOpenChange, onImported }: Props) {
  const isAssets = kind === "assets";
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<any[]>([]);
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
      const res = await api.importHoldings.parse(file, type, kind);
      setRows(res.rows || []);
      setSkipped(res.skipped ?? 0);
      if (!res.rows?.length) toast.error("No rows found in that file");
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
        if (isAssets) await api.assets.createAsset({ ...row, ownership_type: "Individual" });
        else await api.liabilities.createLiability({ ...row, ownership_type: "Individual" });
        ok++;
      } catch {
        failed++;
      }
      setProgress(ok + failed);
    }
    setSaving(false);
    if (ok) {
      toast.success(`Imported ${ok} ${isAssets ? "asset" : "liabilit"}${isAssets ? (ok === 1 ? "" : "s") : ok === 1 ? "y" : "ies"}${failed ? ` (${failed} failed)` : ""}`);
      onImported();
      reset();
      onOpenChange(false);
    } else {
      toast.error("None of the rows could be saved");
    }
  }

  const label = isAssets ? "assets" : "liabilities";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (saving) return;
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import {label} from a file</DialogTitle>
          <DialogDescription>
            Upload a CSV, Excel or PDF statement. We read the values out of it and show a preview before anything is saved. You can
            fine-tune ownership afterwards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls,.pdf" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            <Button type="button" variant="outline" disabled={parsing || saving} onClick={() => inputRef.current?.click()}>
              {parsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {fileName ? "Choose another file" : "Choose file"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => downloadTextFile(`gini-${label}-template.csv`, TEMPLATES[kind])}>
              <Download className="mr-2 h-4 w-4" />
              Download template
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
                Found <strong>{rows.length}</strong> row{rows.length === 1 ? "" : "s"}
                {rows.length > 10 ? " — showing the first 10" : ""}.
                {skipped > 0 && (
                  <span className="text-amber-600 dark:text-amber-400">
                    {" "}
                    {skipped} row{skipped === 1 ? " was" : "s were"} skipped (missing a name or a valid amount).
                  </span>
                )}
              </p>
              <div className="rounded-md border overflow-x-auto max-h-72 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>{isAssets ? "Category" : "Type"}</TableHead>
                      <TableHead className="text-right">{isAssets ? "Value" : "Amount"}</TableHead>
                      <TableHead className="text-right">{isAssets ? "Return %" : "Rate %"}</TableHead>
                      {!isAssets && <TableHead className="text-right">EMI</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 10).map((r, i) => (
                      <TableRow key={i}>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>{(isAssets ? r.category : r.type) || "-"}</TableCell>
                        <TableCell className="text-right">{inr(isAssets ? r.value : r.amount)}</TableCell>
                        <TableCell className="text-right">{(isAssets ? r.return_rate : r.rate) ?? "-"}</TableCell>
                        {!isAssets && <TableCell className="text-right">{inr(r.emi)}</TableCell>}
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
            {saving ? `Saving ${progress}/${rows.length}…` : `Import ${rows.length || ""} ${rows.length === 1 ? label.replace(/ies$/, "y").replace(/s$/, "") : label}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
