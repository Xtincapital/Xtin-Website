// Goals page — financial goals CRUD, rewritten from
// features-incoming/gini/app.js's goal-form `save()` handler and goal-list
// rendering (`goals.saveGoal`/`goals.editGoal`/`goals.deleteGoal`/
// `goals.renderGoals`, ~lines 3727-3987) into a React page against the live
// REST backend (services/api/modules/gini/goals.{routes,validator,controller}.ts).
//
// Category/priority option lists are copied verbatim from
// features-incoming/gini/index.html's `#goalCategory` (~line 1132) and
// `#goalPriority` (~line 1153) selects — see GOAL_CATEGORIES / GOAL_PRIORITIES
// below.
//
// Fields NOT built here: `funded_by` / `funding_split`. The original form
// had "Funded By" and "Contribution Split (%)" fields alongside "Assigned
// To" (index.html ~lines 1178-1189) and lib/api.ts's `Goal` type still
// carries both columns, but this task's field list (see the task brief)
// only calls for `assigned_to` — funded_by/funding_split are left as a
// later sub-phase's addition (the backend already accepts them; this page
// just never sends them, so they stay null on goals created here).
//
// Progress / SIP math: the original's `goals.renderGoals` (app.js
// ~3908-3985) projects an inflation-adjusted target via
// `utils.calculateFutureValue` (pv * (1+rate/100)^years) and a required
// monthly SIP via an annuity-factor helper (`utils.calculateRequiredSIP` /
// `sipFVFactor`, supporting begin/end-of-month timing from
// `appState.settings.sipTiming`). This page reproduces the *inflation-
// adjusted target amount* (judgement call: chosen over a plain
// `saved / current_cost` progress bar, since the original always displayed
// progress against the inflated future cost, not today's cost) using the
// simpler ordinary-annuity SIP formula the live backend already uses for
// the AI chat's financial snapshot (services/api/modules/gini/
// financialSnapshot.ts, ~lines 84-122: targetAmount = current_cost *
// (1+inflation/100)^years, requiredMonthlySIP = gap*monthlyReturn /
// ((1+monthlyReturn)^months - 1)) rather than re-implementing the original's
// begin/end-timing variant client-side — this keeps the Goals page's own
// numbers consistent with whatever the AI chat tells the user about the
// same goal. When return_rate is 0 (or unset), the required-SIP figure
// mirrors the snapshot's own behavior and reads 0 rather than falling back
// to linear division — a known simplification carried over intentionally
// for parity with the server, not a bug in this page.
//
// API client / layout / state management: see NetWorth.tsx's header
// comment — same `../lib/api` (`api.goals`, `api.familyMembers.
// getFamilyMembers` read-only for the assignment dropdown), default-
// exported `GiniLayout`, and TanStack Query (useQuery/useMutation) per the
// task brief.
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api } from "../lib/api";
import type { FamilyMember, Goal, GoalInput } from "../lib/api";
import GiniLayout from "../components/GiniLayout";

// Verbatim from features-incoming/gini/index.html's #goalCategory select
// (~lines 1132-1141).
const GOAL_CATEGORIES = [
  "Education",
  "Wedding",
  "Home Purchase",
  "Car",
  "Retirement",
  "Vacation",
  "Emergency Fund",
  "Others",
];

// Verbatim from index.html's #goalPriority select (~lines 1153-1157).
const GOAL_PRIORITIES = ["High", "Medium", "Low"];

const NO_MEMBER = "__household__";

const CURRENT_YEAR = new Date().getFullYear();

function formatCurrency(value: number | null | undefined) {
  const n = value ?? 0;
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `₹${n.toFixed(0)}`;
  }
}

function num(value: string): number | null {
  if (value === "" || value == null) return null;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function memberLabel(member: FamilyMember) {
  return member.relationship ? `${member.name} (${member.relationship})` : member.name;
}

function priorityVariant(priority: string | null): "default" | "secondary" | "outline" {
  if (priority === "High") return "default";
  if (priority === "Medium") return "secondary";
  return "outline";
}

// Mirrors services/api/modules/gini/financialSnapshot.ts's goal loop
// (~lines 84-122) — see this file's header comment for why this formula was
// chosen over the original's begin/end-timing SIP factor.
interface GoalProjection {
  yearsRemaining: number | null;
  targetAmount: number;
  progressPercent: number;
  requiredMonthlySIP: number | null;
}

function projectGoal(goal: Goal): GoalProjection {
  const currentCost = goal.current_cost || 0;
  const inflation = goal.inflation ?? 0;
  const returnRate = goal.return_rate ?? 0;
  const saved = goal.saved ?? 0;

  if (goal.target_year == null) {
    const progressPercent = currentCost > 0 ? Math.max(0, Math.min(100, (saved / currentCost) * 100)) : 0;
    return { yearsRemaining: null, targetAmount: currentCost, progressPercent, requiredMonthlySIP: null };
  }

  const years = goal.target_year - CURRENT_YEAR;
  if (years <= 0) {
    const progressPercent = currentCost > 0 ? Math.max(0, Math.min(100, (saved / currentCost) * 100)) : 0;
    return { yearsRemaining: years, targetAmount: currentCost, progressPercent, requiredMonthlySIP: null };
  }

  const targetAmount = currentCost * Math.pow(1 + inflation / 100, years);
  const monthsToGoal = years * 12;
  const monthlyReturn = returnRate / 100 / 12;
  const futureValueOfSaved = saved * Math.pow(1 + returnRate / 100, years);
  const gap = targetAmount - futureValueOfSaved;

  let requiredMonthlySIP = 0;
  if (gap > 0 && monthsToGoal > 0 && monthlyReturn > 0) {
    requiredMonthlySIP = (gap * monthlyReturn) / (Math.pow(1 + monthlyReturn, monthsToGoal) - 1);
  }

  const progressPercent = targetAmount > 0 ? Math.max(0, Math.min(100, (saved / targetAmount) * 100)) : 0;

  return { yearsRemaining: years, targetAmount, progressPercent, requiredMonthlySIP };
}

function goalStatus(progressPercent: number): { label: string; className: string } {
  if (progressPercent >= 100) return { label: "Goal Completed", className: "text-success" };
  if (progressPercent >= 60) return { label: "On Track", className: "text-blue-600 dark:text-blue-400" };
  if (progressPercent >= 30) return { label: "Needs Attention", className: "text-warning" };
  return { label: "Critical", className: "text-destructive" };
}

interface GoalFormState {
  name: string;
  category: string;
  current_cost: string;
  target_year: string;
  priority: string;
  inflation: string;
  saved: string;
  return_rate: string;
  assigned_to: string;
}

const EMPTY_GOAL_FORM: GoalFormState = {
  name: "",
  category: GOAL_CATEGORIES[0],
  current_cost: "",
  target_year: String(CURRENT_YEAR + 10),
  priority: "High",
  inflation: "7",
  saved: "0",
  return_rate: "12",
  assigned_to: NO_MEMBER,
};

function goalToForm(goal: Goal): GoalFormState {
  return {
    name: goal.name,
    category: goal.category || GOAL_CATEGORIES[0],
    current_cost: goal.current_cost != null ? String(goal.current_cost) : "",
    target_year: goal.target_year != null ? String(goal.target_year) : "",
    priority: goal.priority || "High",
    inflation: goal.inflation != null ? String(goal.inflation) : "",
    saved: goal.saved != null ? String(goal.saved) : "0",
    return_rate: goal.return_rate != null ? String(goal.return_rate) : "",
    assigned_to: goal.assigned_to || NO_MEMBER,
  };
}

// Mirrors app.js's goal-form `save()` validation (~lines 3797-3837) and the
// live backend's goals.validator.ts bounds.
function validateGoalForm(form: GoalFormState): string | null {
  if (!form.name.trim()) return "Goal name is required";

  const currentCost = num(form.current_cost);
  if (currentCost == null || currentCost <= 0) return "Current cost must be a positive number";

  if (form.target_year.trim() !== "") {
    const targetYear = num(form.target_year);
    if (targetYear == null || !Number.isInteger(targetYear) || targetYear <= CURRENT_YEAR) {
      return `Target year must be after ${CURRENT_YEAR}`;
    }
  }

  if (form.inflation.trim() !== "") {
    const inflation = num(form.inflation);
    if (inflation == null || inflation < 0 || inflation > 100) return "Inflation must be between 0 and 100 percent";
  }

  if (form.return_rate.trim() !== "") {
    const returnRate = num(form.return_rate);
    if (returnRate == null || returnRate < 0 || returnRate > 100) return "Expected return must be between 0 and 100 percent";
  }

  const saved = form.saved.trim() === "" ? 0 : num(form.saved);
  if (saved == null || saved < 0) return "Amount saved cannot be negative";
  if (currentCost != null && saved > currentCost) return "Amount saved cannot exceed current cost";

  return null;
}

function goalFormToPayload(form: GoalFormState): GoalInput {
  return {
    name: form.name.trim(),
    category: form.category || null,
    current_cost: num(form.current_cost) ?? 0,
    target_year: form.target_year.trim() === "" ? null : num(form.target_year),
    priority: form.priority || null,
    inflation: num(form.inflation),
    saved: form.saved.trim() === "" ? 0 : num(form.saved),
    return_rate: num(form.return_rate),
    assigned_to: form.assigned_to === NO_MEMBER ? null : form.assigned_to,
  };
}

export default function Goals() {
  const queryClient = useQueryClient();

  const goalsQuery = useQuery({ queryKey: ["gini", "goals"], queryFn: api.goals.getGoals });
  const familyMembersQuery = useQuery({
    queryKey: ["gini", "family-members"],
    queryFn: api.familyMembers.getFamilyMembers,
  });

  const goalsList = goalsQuery.data || [];
  const familyMembers = familyMembersQuery.data || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState<GoalFormState>(EMPTY_GOAL_FORM);

  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);

  const invalidateGoals = () => queryClient.invalidateQueries({ queryKey: ["gini", "goals"] });

  const createMutation = useMutation({
    mutationFn: (data: GoalInput) => api.goals.createGoal(data),
    onSuccess: () => {
      toast.success("Goal added");
      setDialogOpen(false);
      invalidateGoals();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to add goal"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: GoalInput }) => api.goals.updateGoal(id, data),
    onSuccess: () => {
      toast.success("Goal updated");
      setDialogOpen(false);
      invalidateGoals();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update goal"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.goals.deleteGoal(id),
    onSuccess: () => {
      toast.success("Goal removed");
      setDeleteTarget(null);
      invalidateGoals();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to delete goal"),
  });

  const saving = createMutation.isPending || updateMutation.isPending;
  const deleting = deleteMutation.isPending;

  const projections = useMemo(() => {
    const map = new Map<string, GoalProjection>();
    goalsList.forEach((g) => map.set(g.id, projectGoal(g)));
    return map;
  }, [goalsList]);

  function openAddDialog() {
    setEditingGoal(null);
    setForm(EMPTY_GOAL_FORM);
    setDialogOpen(true);
  }

  function openEditDialog(goal: Goal) {
    setEditingGoal(goal);
    setForm(goalToForm(goal));
    setDialogOpen(true);
  }

  function setField<K extends keyof GoalFormState>(key: K, value: GoalFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = validateGoalForm(form);
    if (error) {
      toast.error(error);
      return;
    }
    const payload = goalFormToPayload(form);
    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
  }

  return (
    <GiniLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Financial Goals</h1>
            <p className="text-sm text-muted-foreground">Plan and track your financial objectives</p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
        </div>

        {goalsQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : goalsList.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
              <Target className="h-8 w-8" />
              <p>No goals added yet. Click "Add Goal" to start planning.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goalsList.map((goal) => {
              const projection = projections.get(goal.id) || projectGoal(goal);
              const status = goalStatus(projection.progressPercent);
              const assignedMember = goal.assigned_to ? familyMembers.find((m) => m.id === goal.assigned_to) : null;

              return (
                <Card key={goal.id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <CardTitle className="text-base">{goal.name}</CardTitle>
                        {assignedMember && <Badge variant="secondary">For: {assignedMember.name}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{goal.category || "Uncategorized"}</p>
                    </div>
                    {goal.priority && <Badge variant={priorityVariant(goal.priority)}>{goal.priority}</Badge>}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                      <span className="text-muted-foreground">Target Year</span>
                      <span className="text-right font-medium">{goal.target_year ?? "-"}</span>
                      <span className="text-muted-foreground">Years Remaining</span>
                      <span className="text-right font-medium">
                        {projection.yearsRemaining != null ? `${projection.yearsRemaining} years` : "-"}
                      </span>
                      <span className="text-muted-foreground">Target Amount</span>
                      <span className="text-right font-medium">{formatCurrency(projection.targetAmount)}</span>
                      <span className="text-muted-foreground">Already Saved</span>
                      <span className="text-right font-medium">{formatCurrency(goal.saved)}</span>
                      {projection.requiredMonthlySIP != null && (
                        <>
                          <span className="text-muted-foreground">Monthly SIP Needed</span>
                          <span className="text-right font-medium">{formatCurrency(projection.requiredMonthlySIP)}</span>
                        </>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{projection.progressPercent.toFixed(1)}%</span>
                      </div>
                      <Progress value={projection.progressPercent} />
                    </div>

                    <div className={cn("text-sm font-medium", status.className)}>{status.label}</div>

                    <div className="flex justify-end gap-1 pt-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(goal)} aria-label="Edit goal">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(goal)} aria-label="Delete goal">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit goal dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit Goal" : "Add Goal"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input
                  id="goal-name"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="e.g., Child Education"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setField("category", v)}>
                  <SelectTrigger aria-label="Category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal-current-cost">Current Cost (₹)</Label>
                <Input
                  id="goal-current-cost"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.current_cost}
                  onChange={(e) => setField("current_cost", e.target.value)}
                  placeholder="1000000"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal-target-year">Target Year</Label>
                <Input
                  id="goal-target-year"
                  type="number"
                  min={CURRENT_YEAR + 1}
                  max={2100}
                  value={form.target_year}
                  onChange={(e) => setField("target_year", e.target.value)}
                  placeholder="2030"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setField("priority", v)}>
                  <SelectTrigger aria-label="Priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal-inflation">Inflation Rate (%)</Label>
                <Input
                  id="goal-inflation"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={form.inflation}
                  onChange={(e) => setField("inflation", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal-saved">Amount Already Saved (₹)</Label>
                <Input
                  id="goal-saved"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.saved}
                  onChange={(e) => setField("saved", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal-return">Expected Return (%)</Label>
                <Input
                  id="goal-return"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={form.return_rate}
                  onChange={(e) => setField("return_rate", e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Assigned To</Label>
                <Select value={form.assigned_to} onValueChange={(v) => setField("assigned_to", v)}>
                  <SelectTrigger aria-label="Assigned To">
                    <SelectValue placeholder="Household" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_MEMBER}>Household</SelectItem>
                    {familyMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {memberLabel(m)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Who is this goal for?</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Goal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.name}". This action cannot be undone.
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
