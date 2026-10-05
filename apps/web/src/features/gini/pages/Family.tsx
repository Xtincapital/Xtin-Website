// Family page — full CRUD UI for `gini_family_members`, backed by
// `api.familyMembers` (apps/web/src/features/gini/lib/api.ts, Phase 10a).
// Rewrite (not a port) of features-incoming/gini/app.js's `familySettings`
// module (`saveMember`/`editMember`/`deleteMember`/`renderFamilyMembers`/
// `renderHouseholdSummary`/`renderIncomeBreakdownChart`, ~lines 3037-3292)
// into a React/TanStack Query page against the live REST backend, following
// this app's established pattern — see
// apps/web/src/features/journal/pages/Goals.tsx for the closest sibling
// (Dialog form + shadcn Card list) and Dashboard.tsx for TanStack Query +
// recharts conventions.
//
// Reproduced from the original:
//   - "Household Overview" summary (fsHouseholdIncome/fsTotalMembers/
//     fsEarners/fsDependents) — total members, earners, dependents, and
//     household income (sum of `income` for every `is_earner` member).
//   - "Income Contribution" chart (householdIncomeChart) — a donut of each
//     earning member's income share.
//   - Family member cards with add/edit/delete, same field list as the
//     original's `#familyMemberFormContainer` form (name, relationship,
//     age, income, retirement_age, is_earner, is_dependent), plus
//     `life_expectancy` (a real `gini_family_members` column the original's
//     UI never exposed a field for — defaulted to 85 there; exposed here as
//     an explicit optional field instead of a hidden default, since this
//     page has no client-side app-state default to fall back on).
//
// Judgement calls (see this task's final report for the full list):
//   - No "only one Self allowed" / free-plan member-cap validation — both
//     were `window.GiniPlan`/local-appState concerns in the original with
//     no equivalent surfaced by this backend's `familyMembers.validator.ts`;
//     reproducing them here would mean guessing at limits this page can't
//     actually enforce server-side.
//   - Delete confirmation uses shadcn `AlertDialog` (Goals.tsx's pattern)
//     instead of the original's custom `giniConfirm()` modal.
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pie, PieChart, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { Users, UserCheck, UserMinus, Wallet, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useCurrency } from "@/contexts/CurrencyContext";
import GiniLayout from "../components/GiniLayout";
import { api } from "../lib/api";
import type { FamilyMember, FamilyMemberInput } from "../lib/api";

const RELATIONSHIP_OPTIONS = [
  { value: "Self", label: "Self / Primary User" },
  { value: "Spouse", label: "Spouse / Partner" },
  { value: "Child", label: "Child" },
  { value: "Parent", label: "Parent" },
  { value: "Sibling", label: "Sibling" },
  { value: "Other", label: "Other Dependent" },
];

// Matches gini.css's `--chart-1`..`--chart-5` tokens (see that file's header
// comment) — reused here instead of hardcoding hex values, per this
// codebase's "never hardcode hex colors" convention.
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const FAMILY_MEMBERS_QUERY_KEY = ["gini", "family-members"] as const;

interface MemberFormState {
  name: string;
  relationship: string;
  age: string;
  income: string;
  retirement_age: string;
  life_expectancy: string;
  is_earner: boolean;
  is_dependent: boolean;
}

function emptyForm(hasSelf: boolean): MemberFormState {
  // Defaults to Self for the first member added (always the primary user),
  // Spouse thereafter — matches the original's `showAddMemberForm` intent.
  // Never defaults to "Child", so the age default here is always 30 (the
  // relationship Select lets the user pick Child and adjust age from
  // there).
  const relationship: string = hasSelf ? "Spouse" : "Self";
  const isEarner = relationship === "Self" || relationship === "Spouse" || relationship === "Sibling";
  return {
    name: "",
    relationship,
    age: "30",
    income: "0",
    retirement_age: "60",
    life_expectancy: "85",
    is_earner: isEarner,
    is_dependent: !isEarner,
  };
}

function formToInput(form: MemberFormState): FamilyMemberInput {
  return {
    name: form.name.trim(),
    relationship: form.relationship || null,
    age: form.age === "" ? null : Number(form.age),
    income: form.income === "" ? 0 : Number(form.income),
    retirement_age: form.retirement_age === "" ? null : Number(form.retirement_age),
    life_expectancy: form.life_expectancy === "" ? null : Number(form.life_expectancy),
    is_earner: form.is_earner,
    is_dependent: form.is_dependent,
  };
}

function memberToForm(member: FamilyMember): MemberFormState {
  return {
    name: member.name,
    relationship: member.relationship || "Other",
    age: member.age === null ? "" : String(member.age),
    income: member.income === null ? "0" : String(member.income),
    retirement_age: member.retirement_age === null ? "" : String(member.retirement_age),
    life_expectancy: member.life_expectancy === null ? "" : String(member.life_expectancy),
    is_earner: Boolean(member.is_earner),
    is_dependent: Boolean(member.is_dependent),
  };
}

export default function Family() {
  const queryClient = useQueryClient();
  const { formatCurrency } = useCurrency();

  const { data: members = [], isLoading } = useQuery({
    queryKey: FAMILY_MEMBERS_QUERY_KEY,
    queryFn: api.familyMembers.getFamilyMembers,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MemberFormState>(() => emptyForm(false));
  const [deleteTarget, setDeleteTarget] = useState<FamilyMember | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: FAMILY_MEMBERS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (input: FamilyMemberInput) => api.familyMembers.createFamilyMember(input),
    onSuccess: (created) => {
      invalidate();
      setDialogOpen(false);
      toast.success(`${created.name} added to your household.`);
    },
    onError: (err: any) => toast.error(err?.message || "Failed to add family member"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: FamilyMemberInput }) =>
      api.familyMembers.updateFamilyMember(id, input),
    onSuccess: (updated) => {
      invalidate();
      setDialogOpen(false);
      toast.success(`${updated.name}'s details updated.`);
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update family member"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.familyMembers.deleteFamilyMember(id),
    onSuccess: () => {
      invalidate();
      const name = deleteTarget?.name || "Member";
      setDeleteTarget(null);
      toast.success(`${name} removed from your household.`);
    },
    onError: (err: any) => toast.error(err?.message || "Failed to remove family member"),
  });

  const hasSelf = members.some((m) => m.relationship === "Self");

  function openAddDialog() {
    setEditingId(null);
    setForm(emptyForm(hasSelf));
    setDialogOpen(true);
  }

  function openEditDialog(member: FamilyMember) {
    setEditingId(member.id);
    setForm(memberToForm(member));
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Please enter the member's name.");
      return;
    }
    const age = Number(form.age);
    if (form.age !== "" && (!Number.isFinite(age) || age < 0 || age > 120)) {
      toast.error("Please enter a valid age (0-120).");
      return;
    }
    const input = formToInput(form);
    if (editingId) {
      updateMutation.mutate({ id: editingId, input });
    } else {
      createMutation.mutate(input);
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
  }

  const { totalMembers, earners, dependents, householdIncome } = useMemo(() => {
    const earnerList = members.filter((m) => m.is_earner);
    const dependentList = members.filter((m) => m.is_dependent);
    const income = earnerList.reduce((sum, m) => sum + (m.income || 0), 0);
    return {
      totalMembers: members.length,
      earners: earnerList,
      dependents: dependentList,
      householdIncome: income,
    };
  }, [members]);

  const incomeChartData = earners
    .filter((m) => (m.income || 0) > 0)
    .map((m) => ({ name: m.name, value: m.income || 0 }));

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <GiniLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Family</h1>
            <p className="text-muted-foreground">Manage your household's members and income sources</p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>

        {/* Household Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Members", value: totalMembers.toLocaleString(), icon: Users },
            { label: "Earners", value: earners.length.toLocaleString(), icon: UserCheck },
            { label: "Dependents", value: dependents.length.toLocaleString(), icon: UserMinus },
            { label: "Household Income", value: formatCurrency(householdIncome), icon: Wallet },
          ].map((card) => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                  <card.icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                {isLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <p className="text-xl font-bold text-foreground">{card.value}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Income Contribution chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Income Contribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : incomeChartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                No earner income yet. Add an earning member to see the breakdown.
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="85%"
                      stroke="none"
                    >
                      {incomeChartData.map((entry, index) => (
                        <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      wrapperStyle={{ fontSize: 12 }}
                      formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Family Members list */}
        <div>
          <h2 className="text-base font-bold text-foreground mb-4">Family Members</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-36 w-full" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center">
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground mb-1">Let's start with you</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Add yourself first — your age and income power every projection in Gini.
                </p>
                <Button onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Yourself
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-foreground text-sm truncate">{member.name}</p>
                          {member.is_earner && (
                            <Badge variant="secondary" className="text-[10px] text-success">
                              Earner
                            </Badge>
                          )}
                          {member.is_dependent && (
                            <Badge variant="secondary" className="text-[10px]">
                              Dependent
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{member.relationship || "—"}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(member)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {member.relationship !== "Self" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(member)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Age</span>
                        <span className="font-medium text-foreground">{member.age ?? "—"} years</span>
                      </div>
                      {member.is_earner && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Monthly Income</span>
                            <span className="font-medium text-foreground">{formatCurrency(member.income || 0)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Retirement Age</span>
                            <span className="font-medium text-foreground">{member.retirement_age ?? "—"}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Member" : "Add Family Member"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="member-name">Name</Label>
              <Input
                id="member-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Priya Sharma"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Relationship</Label>
              <Select
                value={form.relationship}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    relationship: v,
                    is_earner: v === "Self" || v === "Spouse" || v === "Sibling",
                    is_dependent: !(v === "Self" || v === "Spouse" || v === "Sibling"),
                  }))
                }
              >
                <SelectTrigger aria-label="Relationship">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="member-age">Age</Label>
                <Input
                  id="member-age"
                  type="number"
                  min={0}
                  max={120}
                  value={form.age}
                  onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="member-life-expectancy">Life Expectancy</Label>
                <Input
                  id="member-life-expectancy"
                  type="number"
                  min={0}
                  max={120}
                  value={form.life_expectancy}
                  onChange={(e) => setForm((p) => ({ ...p, life_expectancy: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="member-income">Monthly Income</Label>
                <Input
                  id="member-income"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.income}
                  onChange={(e) => setForm((p) => ({ ...p, income: e.target.value }))}
                  disabled={!form.is_earner}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="member-retirement-age">Retirement Age</Label>
                <Input
                  id="member-retirement-age"
                  type="number"
                  min={0}
                  max={120}
                  value={form.retirement_age}
                  onChange={(e) => setForm((p) => ({ ...p, retirement_age: e.target.value }))}
                  disabled={!form.is_earner}
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="member-is-earner"
                  checked={form.is_earner}
                  onCheckedChange={(checked) => setForm((p) => ({ ...p, is_earner: checked === true }))}
                />
                <Label htmlFor="member-is-earner" className="font-normal cursor-pointer">
                  Earning member
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="member-is-dependent"
                  checked={form.is_dependent}
                  onCheckedChange={(checked) => setForm((p) => ({ ...p, is_dependent: checked === true }))}
                />
                <Label htmlFor="member-is-dependent" className="font-normal cursor-pointer">
                  Dependent
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Member" : "Save Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleteTarget?.name || "this member"}?</AlertDialogTitle>
            <AlertDialogDescription>
              Their income and goal assignments will be removed from all projections. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Removing..." : "Remove Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </GiniLayout>
  );
}
