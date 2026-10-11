// Net Worth page — assets + liabilities CRUD, rewritten from
// features-incoming/gini/app.js's `networth` module (`saveAsset`/`editAsset`/
// `deleteAsset`/`saveLiability`/`editLiability`/`deleteLiability`/
// `calculateTotalAssets`/`calculateTotalLiabilities`/`calculateNetWorth`,
// ~lines 3308-3724) into a React page against the live REST backend
// (services/api/modules/gini/{assets,liabilities}.{routes,validator,controller}.ts).
// Combines both sections on one page, matching the original's single
// `networth-tab` (features-incoming/gini/index.html, ~lines 890-1103, ids
// `assetsTable`/`liabilitiesTable`).
//
// Category/type option lists are copied verbatim from index.html's
// `#assetCategory` (~line 917) and `#liabilityType` (~line 999) selects —
// see this file's ASSET_CATEGORIES / LIABILITY_TYPES constants below.
//
// Ownership: the original's asset form offered Individual/Joint/Trust
// (index.html ~line 939) but its liability form only offered
// Individual/Joint (~line 1025). The live backend's shared
// `ownership_type` enum (assets.validator.ts / liabilities.validator.ts,
// mirrored in lib/api.ts's `AssetOwnershipType`) allows all three for both
// tables, so this page offers Individual/Joint/Trust for both assets and
// liabilities — a deliberate widening of the original liability form to
// match the real schema/API contract instead of the standalone app's
// narrower client-side list.
//
// API client / layout: see GiniApp.tsx's header comment — `../lib/api`
// (`api.assets`, `api.liabilities`, `api.familyMembers.getFamilyMembers`
// read-only for the owner dropdown) and default-exported `GiniLayout`.
//
// State management: TanStack Query (useQuery/useMutation) against the Gini
// query client mounted in GiniApp.tsx, with query invalidation on mutation
// success — unlike Journal's own CRUD pages (features/journal/pages/Goals.tsx
// /Trades.tsx, this task's closest style template), which predate the
// TanStack Query dependency being wired up for Gini and use manual
// useState/useEffect fetch instead. This page follows the task brief's
// explicit TanStack Query requirement while keeping every other convention
// (shadcn Dialog/AlertDialog forms, sonner toasts, lucide icons) identical
// to that template.
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Download, Landmark, Pencil, Plus, Scale, Trash2, Upload, Wallet } from "lucide-react";
import { csvCell, downloadTextFile } from "@/lib/uploadFile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import MoneyInput from "@/components/MoneyInput";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatFromInr } from "@/lib/region";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { api } from "../lib/api";
import type { Asset, AssetInput, AssetOwnershipType, FamilyMember, Liability, LiabilityInput } from "../lib/api";
import GiniLayout from "../components/GiniLayout";
import ImportHoldingsDialog from "../components/ImportHoldingsDialog";

// Verbatim from features-incoming/gini/index.html's #assetCategory select
// (~lines 917-927).
const ASSET_CATEGORIES = [
  "Real Estate",
  "Stocks",
  "Mutual Funds",
  "Fixed Deposits",
  "Gold",
  "Cash",
  "PPF",
  "Insurance",
  "Others",
];

// Verbatim from features-incoming/gini/index.html's #liabilityType select
// (~lines 999-1005).
const LIABILITY_TYPES = ["Home Loan", "Car Loan", "Personal Loan", "Credit Card", "Others"];

// See header comment — widened to all three for both tables (matches
// lib/api.ts's `AssetOwnershipType`, the shared backend enum).
const OWNERSHIP_TYPES: AssetOwnershipType[] = ["Individual", "Joint", "Trust"];

const NO_OWNER = "__none__";

const CHART_PALETTE = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

// Values are saved in rupees and shown in the selected currency.
const formatCurrency = (value: number | null | undefined) => formatFromInr(value ?? 0, { maxDecimals: 0 });

function num(value: string): number | null {
  if (value === "" || value == null) return null;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function memberLabel(member: FamilyMember) {
  return member.relationship ? `${member.name} (${member.relationship})` : member.name;
}

// ─────────────────────────────────────────────────────────────────────────
// Asset form
// ─────────────────────────────────────────────────────────────────────────
interface AssetFormState {
  name: string;
  category: string;
  value: string;
  return_rate: string;
  ownership_type: AssetOwnershipType;
  owner: string;
  joint_share: string;
}

const EMPTY_ASSET_FORM: AssetFormState = {
  name: "",
  category: ASSET_CATEGORIES[0],
  value: "",
  return_rate: "",
  ownership_type: "Individual",
  owner: NO_OWNER,
  joint_share: "100",
};

function assetToForm(asset: Asset): AssetFormState {
  return {
    name: asset.name,
    category: asset.category || ASSET_CATEGORIES[0],
    value: asset.value != null ? String(asset.value) : "",
    return_rate: asset.return_rate != null ? String(asset.return_rate) : "",
    ownership_type: asset.ownership_type || "Individual",
    owner: asset.owner || NO_OWNER,
    joint_share: asset.joint_share != null ? String(asset.joint_share) : "100",
  };
}

// Mirrors app.js's `networth.saveAsset` validation (~lines 3363-3382),
// adjusted to the live backend's bounds (assets.validator.ts: value is
// non-negative, not strictly positive).
function validateAssetForm(form: AssetFormState): string | null {
  if (!form.name.trim()) return "Asset name is required";
  const value = num(form.value);
  if (value == null || value < 0) return "Asset value must be a non-negative number";
  if (form.return_rate.trim() !== "") {
    const r = num(form.return_rate);
    if (r == null || r < 0 || r > 100) return "Expected return must be between 0 and 100 percent";
  }
  if (form.ownership_type === "Joint") {
    const js = num(form.joint_share);
    if (js == null || js <= 0 || js > 100) return "Joint share must be between 1 and 100 percent";
  }
  return null;
}

function assetFormToPayload(form: AssetFormState): AssetInput {
  return {
    name: form.name.trim(),
    category: form.category || null,
    value: num(form.value) ?? 0,
    return_rate: num(form.return_rate),
    ownership_type: form.ownership_type,
    owner: form.owner === NO_OWNER ? null : form.owner,
    joint_share: form.ownership_type === "Joint" ? num(form.joint_share) : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Liability form
// ─────────────────────────────────────────────────────────────────────────
interface LiabilityFormState {
  name: string;
  type: string;
  amount: string;
  rate: string;
  emi: string;
  tenure: string;
  ownership_type: AssetOwnershipType;
  owner: string;
  joint_share: string;
}

const EMPTY_LIABILITY_FORM: LiabilityFormState = {
  name: "",
  type: LIABILITY_TYPES[0],
  amount: "",
  rate: "",
  emi: "",
  tenure: "",
  ownership_type: "Individual",
  owner: NO_OWNER,
  joint_share: "100",
};

function liabilityToForm(liability: Liability): LiabilityFormState {
  return {
    name: liability.name,
    type: liability.type || LIABILITY_TYPES[0],
    amount: liability.amount != null ? String(liability.amount) : "",
    rate: liability.rate != null ? String(liability.rate) : "",
    emi: liability.emi != null ? String(liability.emi) : "",
    tenure: liability.tenure != null ? String(liability.tenure) : "",
    ownership_type: liability.ownership_type || "Individual",
    owner: liability.owner || NO_OWNER,
    joint_share: liability.joint_share != null ? String(liability.joint_share) : "100",
  };
}

// Mirrors app.js's `networth.saveLiability` validation (~lines 3517-3546).
function validateLiabilityForm(form: LiabilityFormState): string | null {
  if (!form.name.trim()) return "Liability name is required";
  const amount = num(form.amount);
  if (amount == null || amount <= 0) return "Liability amount must be a positive number";
  if (form.rate.trim() !== "") {
    const r = num(form.rate);
    if (r == null || r < 0 || r > 50) return "Interest rate must be between 0 and 50 percent";
  }
  if (form.emi.trim() !== "") {
    const e = num(form.emi);
    if (e == null || e < 0) return "EMI cannot be negative";
  }
  if (form.tenure.trim() !== "") {
    const t = num(form.tenure);
    if (t == null || t <= 0) return "Tenure must be a positive number";
  }
  if (form.ownership_type === "Joint") {
    const js = num(form.joint_share);
    if (js == null || js <= 0 || js > 100) return "Joint share must be between 1 and 100 percent";
  }
  return null;
}

function liabilityFormToPayload(form: LiabilityFormState): LiabilityInput {
  return {
    name: form.name.trim(),
    type: form.type || null,
    amount: num(form.amount) ?? 0,
    rate: num(form.rate),
    emi: num(form.emi),
    tenure: num(form.tenure),
    ownership_type: form.ownership_type,
    owner: form.owner === NO_OWNER ? null : form.owner,
    joint_share: form.ownership_type === "Joint" ? num(form.joint_share) : null,
  };
}

type DeleteTarget = { kind: "asset"; item: Asset } | { kind: "liability"; item: Liability } | null;

export default function NetWorth() {
  // Re-render in the new currency when it changes; `sym` labels the amount boxes.
  const { symbol, currency, inrToDisplay } = useCurrency();
  const sym = symbol.trim();
  const queryClient = useQueryClient();

  const assetsQuery = useQuery({ queryKey: ["gini", "assets"], queryFn: api.assets.getAssets });
  const liabilitiesQuery = useQuery({ queryKey: ["gini", "liabilities"], queryFn: api.liabilities.getLiabilities });
  const familyMembersQuery = useQuery({
    queryKey: ["gini", "family-members"],
    queryFn: api.familyMembers.getFamilyMembers,
  });

  const assets = assetsQuery.data || [];
  const liabilities = liabilitiesQuery.data || [];
  const familyMembers = familyMembersQuery.data || [];

  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assetForm, setAssetForm] = useState<AssetFormState>(EMPTY_ASSET_FORM);

  const [liabilityDialogOpen, setLiabilityDialogOpen] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
  const [liabilityForm, setLiabilityForm] = useState<LiabilityFormState>(EMPTY_LIABILITY_FORM);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const [importKind, setImportKind] = useState<"assets" | "liabilities" | null>(null);

  // Same columns as the import template, so an exported file can be imported back.
  // In the selected currency, the same as Import reads it, so a file can go
  // out and back in unchanged.
  function exportCsv(kind: "assets" | "liabilities") {
    const cur = (n: number | null) => (n == null ? null : Math.round(inrToDisplay(n) * 100) / 100);
    const rows: unknown[][] =
      kind === "assets"
        ? [["Name", "Category", "Value", "Return Rate", "Ownership"], ...assets.map((a) => [a.name, a.category, cur(a.value), a.return_rate, a.ownership_type])]
        : [
            ["Name", "Type", "Amount", "Interest Rate", "EMI", "Tenure", "Ownership"],
            ...liabilities.map((l) => [l.name, l.type, cur(l.amount), l.rate, cur(l.emi), l.tenure, l.ownership_type]),
          ];
    if (rows.length === 1) {
      toast.error(`No ${kind} to export yet`);
      return;
    }
    downloadTextFile(`gini-${kind}-${currency}-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((r) => r.map(csvCell).join(",")).join("\n"));
    toast.success(`Exported ${rows.length - 1} ${rows.length === 2 ? kind.replace(/ies$/, "y").replace(/s$/, "") : kind}`);
  }
  const invalidateAssets = () => queryClient.invalidateQueries({ queryKey: ["gini", "assets"] });
  const invalidateLiabilities = () => queryClient.invalidateQueries({ queryKey: ["gini", "liabilities"] });

  const createAssetMutation = useMutation({
    mutationFn: (data: AssetInput) => api.assets.createAsset(data),
    onSuccess: () => {
      toast.success("Asset added");
      setAssetDialogOpen(false);
      invalidateAssets();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to add asset"),
  });

  const updateAssetMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssetInput }) => api.assets.updateAsset(id, data),
    onSuccess: () => {
      toast.success("Asset updated");
      setAssetDialogOpen(false);
      invalidateAssets();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update asset"),
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (id: string) => api.assets.deleteAsset(id),
    onSuccess: () => {
      toast.success("Asset removed");
      setDeleteTarget(null);
      invalidateAssets();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to delete asset"),
  });

  const createLiabilityMutation = useMutation({
    mutationFn: (data: LiabilityInput) => api.liabilities.createLiability(data),
    onSuccess: () => {
      toast.success("Liability added");
      setLiabilityDialogOpen(false);
      invalidateLiabilities();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to add liability"),
  });

  const updateLiabilityMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: LiabilityInput }) => api.liabilities.updateLiability(id, data),
    onSuccess: () => {
      toast.success("Liability updated");
      setLiabilityDialogOpen(false);
      invalidateLiabilities();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update liability"),
  });

  const deleteLiabilityMutation = useMutation({
    mutationFn: (id: string) => api.liabilities.deleteLiability(id),
    onSuccess: () => {
      toast.success("Liability removed");
      setDeleteTarget(null);
      invalidateLiabilities();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to delete liability"),
  });

  const totalAssets = useMemo(() => assets.reduce((sum, a) => sum + (a.value || 0), 0), [assets]);
  const totalLiabilities = useMemo(() => liabilities.reduce((sum, l) => sum + (l.amount || 0), 0), [liabilities]);
  const netWorth = totalAssets - totalLiabilities;

  const allocationData = useMemo(() => {
    const byCategory = new Map<string, number>();
    assets.forEach((a) => {
      const key = a.category || "Uncategorized";
      byCategory.set(key, (byCategory.get(key) || 0) + (a.value || 0));
    });
    return Array.from(byCategory.entries()).map(([category, value]) => ({ category, value }));
  }, [assets]);

  const allocationConfig = useMemo(() => {
    const cfg: ChartConfig = {};
    allocationData.forEach((d, i) => {
      cfg[d.category] = { label: d.category, color: CHART_PALETTE[i % CHART_PALETTE.length] };
    });
    return cfg;
  }, [allocationData]);

  const comparisonData = useMemo(
    () => [
      { name: "Assets", value: totalAssets, fill: "hsl(var(--chart-positive))" },
      { name: "Liabilities", value: totalLiabilities, fill: "hsl(var(--chart-negative))" },
      { name: "Net Worth", value: netWorth, fill: "hsl(var(--primary))" },
    ],
    [totalAssets, totalLiabilities, netWorth]
  );

  const comparisonConfig: ChartConfig = { value: { label: "Amount" } };

  function openAddAssetDialog() {
    setEditingAsset(null);
    setAssetForm(EMPTY_ASSET_FORM);
    setAssetDialogOpen(true);
  }

  function openEditAssetDialog(asset: Asset) {
    setEditingAsset(asset);
    setAssetForm(assetToForm(asset));
    setAssetDialogOpen(true);
  }

  function setAssetField<K extends keyof AssetFormState>(key: K, value: AssetFormState[K]) {
    setAssetForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleAssetSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = validateAssetForm(assetForm);
    if (error) {
      toast.error(error);
      return;
    }
    const payload = assetFormToPayload(assetForm);
    if (editingAsset) {
      updateAssetMutation.mutate({ id: editingAsset.id, data: payload });
    } else {
      createAssetMutation.mutate(payload);
    }
  }

  function openAddLiabilityDialog() {
    setEditingLiability(null);
    setLiabilityForm(EMPTY_LIABILITY_FORM);
    setLiabilityDialogOpen(true);
  }

  function openEditLiabilityDialog(liability: Liability) {
    setEditingLiability(liability);
    setLiabilityForm(liabilityToForm(liability));
    setLiabilityDialogOpen(true);
  }

  function setLiabilityField<K extends keyof LiabilityFormState>(key: K, value: LiabilityFormState[K]) {
    setLiabilityForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleLiabilitySubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = validateLiabilityForm(liabilityForm);
    if (error) {
      toast.error(error);
      return;
    }
    const payload = liabilityFormToPayload(liabilityForm);
    if (editingLiability) {
      updateLiabilityMutation.mutate({ id: editingLiability.id, data: payload });
    } else {
      createLiabilityMutation.mutate(payload);
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "asset") {
      deleteAssetMutation.mutate(deleteTarget.item.id);
    } else {
      deleteLiabilityMutation.mutate(deleteTarget.item.id);
    }
  }

  const deleting = deleteAssetMutation.isPending || deleteLiabilityMutation.isPending;
  const savingAsset = createAssetMutation.isPending || updateAssetMutation.isPending;
  const savingLiability = createLiabilityMutation.isPending || updateLiabilityMutation.isPending;

  function ownerCell(ownerId: string | null, ownershipType: AssetOwnershipType | null, jointShare: number | null) {
    const owner = familyMembers.find((m) => m.id === ownerId);
    return (
      <div className="space-y-0.5">
        <Badge variant="secondary">
          {ownershipType || "Individual"}
          {ownershipType === "Joint" && jointShare != null ? ` (${jointShare}%)` : ""}
        </Badge>
        <div className="text-xs text-muted-foreground">{owner ? owner.name : "Unassigned"}</div>
      </div>
    );
  }

  return (
    <GiniLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Net Worth Calculator</h1>
          <p className="text-sm text-muted-foreground">Track your assets and liabilities</p>
        </div>

        {/* Assets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <CardTitle>Assets</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setImportKind("assets")}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button size="sm" variant="outline" onClick={() => exportCsv("assets")}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button size="sm" onClick={openAddAssetDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {assetsQuery.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Return</TableHead>
                      <TableHead>Ownership</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No assets added yet. Click "Add Asset" to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      assets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.name}</TableCell>
                          <TableCell>{asset.category || "-"}</TableCell>
                          <TableCell className="text-right">{formatCurrency(asset.value)}</TableCell>
                          <TableCell className="text-right">{asset.return_rate != null ? `${asset.return_rate}%` : "-"}</TableCell>
                          <TableCell>{ownerCell(asset.owner, asset.ownership_type, asset.joint_share)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditAssetDialog(asset)} aria-label="Edit asset">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteTarget({ kind: "asset", item: asset })}
                                aria-label="Delete asset"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
              <span className="text-sm font-medium text-muted-foreground">Total Assets</span>
              <strong className="text-lg">{formatCurrency(totalAssets)}</strong>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              <CardTitle>Liabilities</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setImportKind("liabilities")}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button size="sm" variant="outline" onClick={() => exportCsv("liabilities")}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button size="sm" onClick={openAddLiabilityDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Liability
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {liabilitiesQuery.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">EMI</TableHead>
                      <TableHead>Ownership</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liabilities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No liabilities added yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      liabilities.map((liability) => (
                        <TableRow key={liability.id}>
                          <TableCell className="font-medium">{liability.name}</TableCell>
                          <TableCell>{liability.type || "-"}</TableCell>
                          <TableCell className="text-right">{formatCurrency(liability.amount)}</TableCell>
                          <TableCell className="text-right">{liability.rate != null ? `${liability.rate}%` : "-"}</TableCell>
                          <TableCell className="text-right">{liability.emi != null ? formatCurrency(liability.emi) : "-"}</TableCell>
                          <TableCell>{ownerCell(liability.owner, liability.ownership_type, liability.joint_share)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditLiabilityDialog(liability)}
                                aria-label="Edit liability"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteTarget({ kind: "liability", item: liability })}
                                aria-label="Delete liability"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
              <span className="text-sm font-medium text-muted-foreground">Total Liabilities</span>
              <strong className="text-lg">{formatCurrency(totalLiabilities)}</strong>
            </div>
          </CardContent>
        </Card>

        {/* Net Worth Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <Scale className="h-5 w-5 text-primary" />
            <CardTitle>Net Worth Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Assets</p>
                <p className="mt-1 text-xl font-bold text-success">{formatCurrency(totalAssets)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Liabilities</p>
                <p className="mt-1 text-xl font-bold text-destructive">{formatCurrency(totalLiabilities)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Net Worth</p>
                <p className={cn("mt-1 text-xl font-bold", netWorth >= 0 ? "text-success" : "text-destructive")}>
                  {formatCurrency(netWorth)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Asset Allocation</h4>
                {allocationData.length === 0 ? (
                  <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                    Add assets to see allocation
                  </div>
                ) : (
                  <ChartContainer config={allocationConfig} className="h-[240px] w-full">
                    <PieChart>
                      <ChartTooltip content={(props: any) => <ChartTooltipContent {...props} nameKey="category" hideLabel />} />
                      <Pie data={allocationData} dataKey="value" nameKey="category" innerRadius={50} outerRadius={90} strokeWidth={2}>
                        {allocationData.map((entry, index) => (
                          <Cell key={entry.category} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                )}
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Assets vs Liabilities</h4>
                <ChartContainer config={comparisonConfig} className="h-[240px] w-full">
                  <BarChart data={comparisonData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} width={90} />
                    <ChartTooltip
                      content={(props: any) => (
                        <ChartTooltipContent {...props} hideLabel formatter={(value: any) => formatCurrency(Number(value))} />
                      )}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {comparisonData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit asset dialog */}
      {importKind && (
        <ImportHoldingsDialog
          kind={importKind}
          open
          onOpenChange={(o) => !o && setImportKind(null)}
          onImported={importKind === "assets" ? invalidateAssets : invalidateLiabilities}
        />
      )}
      <Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAsset ? "Edit Asset" : "Add Asset"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssetSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="asset-name">Asset Name</Label>
                <Input
                  id="asset-name"
                  value={assetForm.name}
                  onChange={(e) => setAssetField("name", e.target.value)}
                  placeholder="e.g., Primary Residence"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={assetForm.category} onValueChange={(v) => setAssetField("category", v)}>
                  <SelectTrigger aria-label="Category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="asset-value">Current Value ({sym})</Label>
                <MoneyInput
                  id="asset-value"
                  type="number"
                  min={0}
                  step="0.01"
                  value={assetForm.value}
                  onChange={(e) => setAssetField("value", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="asset-return">Expected Annual Return (%)</Label>
                <Input
                  id="asset-return"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={assetForm.return_rate}
                  onChange={(e) => setAssetField("return_rate", e.target.value)}
                  placeholder="e.g. 8"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ownership Type</Label>
                <Select value={assetForm.ownership_type} onValueChange={(v) => setAssetField("ownership_type", v as AssetOwnershipType)}>
                  <SelectTrigger aria-label="Ownership Type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OWNERSHIP_TYPES.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Owner</Label>
                <Select value={assetForm.owner} onValueChange={(v) => setAssetField("owner", v)}>
                  <SelectTrigger aria-label="Owner">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_OWNER}>Unassigned</SelectItem>
                    {familyMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {memberLabel(m)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {assetForm.ownership_type === "Joint" && (
                <div className="space-y-1.5">
                  <Label htmlFor="asset-joint-share">Ownership Share (%)</Label>
                  <Input
                    id="asset-joint-share"
                    type="number"
                    min={1}
                    max={100}
                    value={assetForm.joint_share}
                    onChange={(e) => setAssetField("joint_share", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">For joint ownership, enter share percentage</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAssetDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingAsset}>
                {savingAsset ? "Saving..." : "Save Asset"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add / Edit liability dialog */}
      <Dialog open={liabilityDialogOpen} onOpenChange={setLiabilityDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLiability ? "Edit Liability" : "Add Liability"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLiabilitySubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="liability-name">Liability Name</Label>
                <Input
                  id="liability-name"
                  value={liabilityForm.name}
                  onChange={(e) => setLiabilityField("name", e.target.value)}
                  placeholder="e.g., Home Loan"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={liabilityForm.type} onValueChange={(v) => setLiabilityField("type", v)}>
                  <SelectTrigger aria-label="Type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LIABILITY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="liability-amount">Outstanding Amount ({sym})</Label>
                <MoneyInput
                  id="liability-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={liabilityForm.amount}
                  onChange={(e) => setLiabilityField("amount", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="liability-rate">Interest Rate (%)</Label>
                <Input
                  id="liability-rate"
                  type="number"
                  min={0}
                  max={50}
                  step="0.1"
                  value={liabilityForm.rate}
                  onChange={(e) => setLiabilityField("rate", e.target.value)}
                  placeholder="e.g. 8.5"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="liability-emi">Monthly EMI ({sym})</Label>
                <MoneyInput
                  id="liability-emi"
                  type="number"
                  min={0}
                  step="0.01"
                  value={liabilityForm.emi}
                  onChange={(e) => setLiabilityField("emi", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="liability-tenure">Tenure Remaining (years)</Label>
                <Input
                  id="liability-tenure"
                  type="number"
                  min={0}
                  step="0.1"
                  value={liabilityForm.tenure}
                  onChange={(e) => setLiabilityField("tenure", e.target.value)}
                  placeholder="e.g. 10"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ownership Type</Label>
                <Select
                  value={liabilityForm.ownership_type}
                  onValueChange={(v) => setLiabilityField("ownership_type", v as AssetOwnershipType)}
                >
                  <SelectTrigger aria-label="Ownership Type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OWNERSHIP_TYPES.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Primary Borrower</Label>
                <Select value={liabilityForm.owner} onValueChange={(v) => setLiabilityField("owner", v)}>
                  <SelectTrigger aria-label="Primary Borrower">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_OWNER}>Unassigned</SelectItem>
                    {familyMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {memberLabel(m)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {liabilityForm.ownership_type === "Joint" && (
                <div className="space-y-1.5">
                  <Label htmlFor="liability-joint-share">Responsibility Share (%)</Label>
                  <Input
                    id="liability-joint-share"
                    type="number"
                    min={1}
                    max={100}
                    value={liabilityForm.joint_share}
                    onChange={(e) => setLiabilityField("joint_share", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">For joint liability, enter responsibility percentage</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLiabilityDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingLiability}>
                {savingLiability ? "Saving..." : "Save Liability"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTarget?.kind === "liability" ? "Delete this liability?" : "Delete this asset?"}</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.item.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </GiniLayout>
  );
}
