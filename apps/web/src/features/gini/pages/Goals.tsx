// Goals page — financial goals CRUD, rewritten from
// features-incoming/gini/app.js's goal-form `save()` handler and goal-list
// rendering (`goals.saveGoal`/`goals.editGoal`/`goals.deleteGoal`/
// `goals.renderGoals`, ~lines 3727-3987) into a React page against the live
// REST backend (services/api/modules/gini/goals.{routes,validator,controller}.ts).
//
// Each category asks its own questions (a child's age and course fees for
// Education, price and down payment for a home, expenses and retirement age
// for Retirement, ...) and works out the cost and target year from them; see
// ../lib/goalCategories.ts. "I already know the amount" falls back to typing
// the cost and year directly, which is how goals saved before that open.
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
import { Card, CardContent } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api } from "../lib/api";
import type { FamilyMember, Goal, GoalInput } from "../lib/api";
import GiniLayout from "../components/GiniLayout";
import PageHeader from "../components/PageHeader";
import { ProgressRow } from "../components/GiniCharts";
import { CARD_LIFT, CHIP_DOWN, CHIP_GOLD, CHIP_MUTED, CHIP_UP, ICON_TILE } from "../lib/ui";
import GoalCategoryQuestions, { NO_MEMBER } from "../components/GoalCategoryQuestions";
import {
  GOAL_CATEGORIES,
  answersFromMember,
  answersToSave,
  computeGoal,
  configFor,
  defaultGoalName,
  detailsSummary,
  hasQuestions,
  seedAnswers,
  updateAnswer,
  type Answers,
  type Computed,
} from "../lib/goalCategories";

// Verbatim from index.html's #goalPriority select (~lines 1153-1157).
const GOAL_PRIORITIES = ["High", "Medium", "Low"];

const CURRENT_YEAR = new Date().getFullYear();

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

function priorityChip(priority: string | null): string {
  return priority === "High" ? CHIP_UP : CHIP_MUTED;
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
  if (progressPercent >= 100) return { label: "Goal Completed", className: CHIP_UP };
  if (progressPercent >= 60) return { label: "On Track", className: CHIP_UP };
  if (progressPercent >= 30) return { label: "Needs Attention", className: CHIP_GOLD };
  return { label: "Critical", className: CHIP_DOWN };
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
  /** "guided": the category questions work out cost and year; "manual": typed in. */
  mode: "guided" | "manual";
  answers: Answers;
}

function newGoalForm(category: string = GOAL_CATEGORIES[0]): GoalFormState {
  const cfg = configFor(category);
  return {
    name: "",
    category,
    current_cost: "",
    target_year: String(CURRENT_YEAR + 10),
    priority: cfg.defaults.priority,
    inflation: String(cfg.defaults.inflation),
    saved: "0",
    return_rate: String(cfg.defaults.return_rate),
    assigned_to: NO_MEMBER,
    mode: hasQuestions(category) ? "guided" : "manual",
    answers: seedAnswers(category, {}),
  };
}

function goalToForm(goal: Goal): GoalFormState {
  const category = goal.category || GOAL_CATEGORIES[0];
  const guided = goal.details?.mode === "guided" && hasQuestions(category);
  return {
    mode: guided ? "guided" : "manual",
    answers: seedAnswers(category, guided ? goal.details?.answers || {} : {}),
    name: goal.name,
    category,
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
function validateGoalForm(form: GoalFormState, computed: Computed | null, name: string): string | null {
  if (!name) return "Goal name is required";

  if (computed) {
    if (computed.problems.length) return computed.problems[0];
    if (computed.cost == null || computed.targetYear == null) return "Answer the questions to work out the cost";
  }

  const currentCost = computed ? computed.cost : num(form.current_cost);
  if (currentCost == null || currentCost <= 0) return "Current cost must be a positive number";

  if (!computed && form.target_year.trim() !== "") {
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

function goalFormToPayload(form: GoalFormState, computed: Computed | null, name: string): GoalInput {
  return {
    name,
    category: form.category || null,
    current_cost: computed?.cost ?? num(form.current_cost) ?? 0,
    target_year: computed ? computed.targetYear : form.target_year.trim() === "" ? null : num(form.target_year),
    priority: form.priority || null,
    inflation: num(form.inflation),
    saved: form.saved.trim() === "" ? 0 : num(form.saved),
    return_rate: num(form.return_rate),
    assigned_to: form.assigned_to === NO_MEMBER ? null : form.assigned_to,
    details: computed ? { mode: "guided", answers: answersToSave(form.category, form.answers) } : { mode: "manual" },
  };
}

export default function Goals() {
  // Re-render in the new currency when it changes; `sym` labels the amount boxes.
  const { symbol } = useCurrency();
  const sym = symbol.trim();
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
  const [form, setForm] = useState<GoalFormState>(() => newGoalForm());

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
    setForm(newGoalForm());
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

  const guided = form.mode === "guided" && hasQuestions(form.category);
  const computed = guided ? computeGoal(form.category, form.answers, { currentYear: CURRENT_YEAR, inflation: num(form.inflation) ?? 0 }) : null;
  const selectedMember = familyMembers.find((m) => m.id === form.assigned_to) ?? null;
  const suggestedName = defaultGoalName(form.category, form.answers, selectedMember);
  const categoryConfig = configFor(form.category);

  function changeCategory(category: string) {
    setForm((prev) => {
      const cfg = configFor(category);
      // A new goal takes the category's typical rates; an edited goal keeps its own.
      const rates = editingGoal
        ? {}
        : { inflation: String(cfg.defaults.inflation), return_rate: String(cfg.defaults.return_rate), priority: cfg.defaults.priority };
      const member = familyMembers.find((m) => m.id === prev.assigned_to);
      return {
        ...prev,
        ...rates,
        category,
        mode: hasQuestions(category) ? (editingGoal && prev.mode === "manual" ? "manual" : "guided") : "manual",
        answers: seedAnswers(category, answersFromMember(category, prev.answers, member)),
      };
    });
  }

  function changeMember(id: string) {
    const member = familyMembers.find((m) => m.id === id);
    setForm((prev) => ({ ...prev, assigned_to: id, answers: seedAnswers(prev.category, answersFromMember(prev.category, prev.answers, member)) }));
  }

  function setMode(mode: "guided" | "manual") {
    setForm((prev) => ({
      ...prev,
      mode,
      // Carry the worked-out numbers over so "I already know the amount" starts from them.
      ...(mode === "manual" && computed?.cost != null ? { current_cost: String(computed.cost) } : {}),
      ...(mode === "manual" && computed?.targetYear != null ? { target_year: String(computed.targetYear) } : {}),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim() || suggestedName;
    const error = validateGoalForm(form, computed, name);
    if (error) {
      toast.error(error);
      return;
    }
    const payload = goalFormToPayload(form, computed, name);
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
      <div className="space-y-6 p-6 md:p-8 max-w-7xl mx-auto">
        <PageHeader
          title="Financial Goals"
          subtitle="Plan and track your financial objectives"
          actions={
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          }
        />

        {goalsQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : goalsList.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
              <span className={ICON_TILE}><Target className="h-5 w-5" /></span>
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
                <div key={goal.id} className={`${CARD_LIFT} flex flex-col`}>
                  <div className="flex items-start justify-between gap-3 p-5 pb-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="text-lg font-bold leading-tight text-foreground">{goal.name}</h3>
                        {assignedMember && <span className={CHIP_MUTED}>For: {assignedMember.name}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {[goal.category || "Uncategorized", detailsSummary(goal.category, goal.details)].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {goal.priority && <span className={cn("shrink-0", priorityChip(goal.priority))}>{goal.priority}</span>}
                  </div>
                  <div className="flex flex-1 flex-col gap-3.5 px-5 pb-4">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm tabular-nums">
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

                    <div className="text-sm">
                      <ProgressRow
                        name="Progress"
                        saved={`${projection.progressPercent.toFixed(1)}%`}
                        target="100%"
                        percent={projection.progressPercent}
                        // Same "behind" rule as the Dashboard: due within 3 years and under half funded.
                        behind={projection.progressPercent < 50 && projection.yearsRemaining != null && projection.yearsRemaining <= 3}
                      />
                    </div>

                    <div><span className={status.className}>{status.label}</span></div>

                    <div className="mt-auto flex justify-end gap-1 border-t pt-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(goal)} aria-label="Edit goal">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(goal)} aria-label="Delete goal">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit goal dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit Goal" : "Add Goal"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={changeCategory}>
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
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input
                  id="goal-name"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder={suggestedName || categoryConfig.namePlaceholder}
                />
                {!form.name.trim() && suggestedName && (
                  <p className="text-xs text-muted-foreground">Leave blank to call it "{suggestedName}".</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-sm text-muted-foreground">{guided ? categoryConfig.intro : "Enter the cost at today's prices and the year you need the money."}</p>
              {hasQuestions(form.category) && (
                <button
                  type="button"
                  className="text-sm font-medium text-brand hover:underline"
                  onClick={() => setMode(guided ? "manual" : "guided")}
                >
                  {guided ? "I already know the amount" : "Help me work out the amount"}
                </button>
              )}
            </div>

            {guided ? (
              <GoalCategoryQuestions
                category={form.category}
                answers={form.answers}
                onAnswer={(id, value) => setForm((prev) => ({ ...prev, answers: updateAnswer(prev.category, prev.answers, id, value) }))}
                members={familyMembers}
                memberId={form.assigned_to}
                onMember={changeMember}
                computed={computed}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="goal-current-cost">Cost at today's prices ({sym})</Label>
                  <MoneyInput
                    id="goal-current-cost"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.current_cost}
                    onChange={(e) => setField("current_cost", e.target.value)}
                    placeholder="1000000"
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
                    placeholder={String(CURRENT_YEAR + 5)}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2">
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
                <Label htmlFor="goal-saved">Amount Already Saved ({sym})</Label>
                <MoneyInput
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
                <Label htmlFor="goal-inflation">Yearly rise in cost (%)</Label>
                <Input
                  id="goal-inflation"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={form.inflation}
                  onChange={(e) => setField("inflation", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{categoryConfig.inflationHint}</p>
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
                <p className="text-xs text-muted-foreground">{categoryConfig.returnHint}</p>
              </div>
              {!(guided && categoryConfig.member) && (
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
              )}
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
