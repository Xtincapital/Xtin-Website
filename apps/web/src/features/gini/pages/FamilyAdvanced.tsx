// Advanced Family Planning page — PRO-GATED, rewrite of
// features-incoming/gini/index.html's `family-advanced-tab` div
// (~lines 2543-2834) and its five backing app.js modules into a React page:
//   - `dualRetirement`      (~5502-5618) — read-only, computed
//   - `elderCare`           (~5621-5713) — full CRUD, now against
//                             `api.elderCare` (`gini_elder_care`)
//   - `educationTimeline`   (~5716-5880) — full CRUD, now against
//                             `api.educationPlans` (`gini_education_plans`)
//   - `taxOptimization`     (~5883-6013) — see judgement call below
//   - `familyCalculators`   (~6016-6191) — read-only, computed
//
// Pro gating: same ProGate/useGiniPlanStore wiring as RequiredReturn.tsx/
// MonteCarlo.tsx (static header outside the gate, `fetchPlan()` in a mount
// effect) — this page is the original's own "Advanced Family Planning" Pro
// module (see ProGate.tsx's header comment for the authoritative list).
//
// Judgement calls:
//   - Tax Optimization: the original's actual UI here (index.html
//     ~2757-2771) is only a "Tax Filing Mode" select + a joint-vs-individual
//     tax comparison (`taxOptimization.calculate`/`calculateIncomeTax`) — it
//     never renders a form for the `deductions80C`/`80D`/`80E`/`hufBenefits`
//     fields this task's `api.taxOptimization` is built around. Those field
//     names only exist as an `appState.taxOptimization` shape used by the
//     app's demo-data loader (app.js ~1704-1709, ~6734-6751) — never wired
//     to any input. Per this task's explicit brief, this page builds the
//     settings form those fields imply (grouped exactly as the demo data
//     groups them: 80C → ppf/elss/nsc/lifePremium/tuitionFees, 80D →
//     selfHealth/parentHealth, 80E → educationLoanInterest, plus
//     `hufBenefits`) rather than porting the filing-mode comparison
//     calculator, which has no persistence story in `api.taxOptimization`
//     at all (no `filingMode` column) and is out of this section's brief.
//   - Family Calculators: brief names "Cost to Support a Dependent" and
//     "Family Health Insurance Requirement" explicitly; this page also
//     includes the original's third sub-card, "Family Emergency Fund
//     Recommendation" (app.js `calculateEmergencyFund`, ~6146-6191) since
//     it's real, non-trivial logic in the same section the brief said to
//     "read the full div" for — left out only if truly redundant, which
//     this isn't.
//   - Dual Retirement / Family Health Insurance read `age`/`retirement_age`/
//     `life_expectancy`/`income` straight off `api.familyMembers.
//     getFamilyMembers()`; members missing those optional columns are
//     skipped from Dual Retirement's per-earner math (can't compute a
//     retirement timeline without them) rather than silently defaulting to
//     invented numbers.
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Landmark,
  HeartHandshake,
  GraduationCap,
  Receipt,
  Calculator,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useCurrency } from "@/contexts/CurrencyContext";
import GiniLayout from "../components/GiniLayout";
import ProGate from "../components/ProGate";
import { useGiniPlanStore } from "../store/useGiniPlanStore";
import { api } from "../lib/api";
import type {
  ElderCarePlan,
  ElderCarePlanInput,
  EducationPlan,
  EducationPlanInput,
  FamilyMember,
  TaxOptimization,
  TaxOptimizationInput,
} from "../lib/api";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const SIP_TIMING: "due" | "ordinary" = "due";

function calculateFutureValue(pv: number, rate: number, years: number) {
  return pv * Math.pow(1 + rate / 100, years);
}

function sipFVFactor(monthlyRate: number, months: number, timing: "due" | "ordinary") {
  if (months <= 0) return 0;
  if (monthlyRate === 0) return months;
  const base = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  return timing === "due" ? base * (1 + monthlyRate) : base;
}

function calculateRequiredSIP(futureValue: number, rate: number, years: number, timing: "due" | "ordinary" = SIP_TIMING) {
  const monthlyRate = rate / 12 / 100;
  const months = Math.max(0, Math.floor(years * 12));
  const factor = sipFVFactor(monthlyRate, months, timing);
  if (factor === 0) return 0;
  return futureValue / factor;
}

function num(value: string, fallback = 0): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function memberLabel(m: FamilyMember) {
  return m.relationship ? `${m.name} (${m.relationship}, Age ${m.age ?? "—"})` : m.name;
}

const FAMILY_MEMBERS_KEY = ["gini", "family-members"] as const;
const ELDER_CARE_KEY = ["gini", "elder-care"] as const;
const EDUCATION_PLANS_KEY = ["gini", "education-plans"] as const;
const TAX_OPTIMIZATION_KEY = ["gini", "tax-optimization"] as const;

function ResultGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border bg-accent/40 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-base font-bold text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Dual Retirement — app.js `dualRetirement.calculate`/`renderTimeline`
// (~5502-5618), read-only.
// ─────────────────────────────────────────────────────────────────────────
function DualRetirementTab({ members, isLoading }: { members: FamilyMember[]; isLoading: boolean }) {
  const { formatCurrency } = useCurrency();

  const earners = useMemo(
    () => members.filter((m) => m.is_earner && m.age != null && m.retirement_age != null && m.life_expectancy != null),
    [members]
  );

  const chartData = useMemo(() => {
    if (earners.length < 2) return [];
    const currentYear = new Date().getFullYear();
    const maxYear = Math.max(
      ...earners.map(
        (e) => currentYear + (e.retirement_age! - e.age!) + Math.max(0, e.life_expectancy! - e.retirement_age!)
      )
    );
    const years = maxYear - currentYear;
    const rows: Record<string, number | string | null>[] = [];
    for (let i = 0; i <= years; i++) {
      const row: Record<string, number | string | null> = { year: String(currentYear + i) };
      earners.forEach((e) => {
        const age = e.age! + i;
        const yearsInRetirement = Math.max(0, e.life_expectancy! - e.retirement_age!);
        if (age < e.retirement_age!) row[e.id] = (e.income || 0) * 12;
        else if (age < e.retirement_age! + yearsInRetirement) row[e.id] = 0;
        else row[e.id] = null;
      });
      rows.push(row);
    }
    return rows;
  }, [earners]);

  const chartConfig: ChartConfig = useMemo(
    () =>
      Object.fromEntries(
        earners.map((e, i) => [e.id, { label: e.name, color: CHART_COLORS[i % CHART_COLORS.length] }])
      ),
    [earners]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dual Retirement Planning</CardTitle>
        <p className="text-sm text-muted-foreground">Visualize phased retirement for multiple earners in the family</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : earners.length < 2 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Add at least 2 earning family members with age, retirement age, and life expectancy set (on the Family
            page) to see a dual retirement timeline.
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Household Income Timeline</h4>
            <ChartContainer config={chartConfig} className="h-96 w-full">
              <LineChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                <ChartTooltip
                  content={(props: any) => (
                    <ChartTooltipContent {...props} formatter={(v: any) => formatCurrency(Number(v))} />
                  )}
                />
                {earners.map((e, i) => (
                  <Line
                    key={e.id}
                    type="monotone"
                    dataKey={e.id}
                    name={e.name}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Elder Care — full CRUD against api.elderCare, app.js `elderCare` module
// (~5621-5713).
// ─────────────────────────────────────────────────────────────────────────
interface ElderCareFormState {
  member_id: string;
  monthly_support: string;
  medical_reserve: string;
  life_expectancy: string;
}

const EMPTY_ELDER_FORM: ElderCareFormState = {
  member_id: "",
  monthly_support: "25000",
  medical_reserve: "500000",
  life_expectancy: "85",
};

function elderPlanToForm(plan: ElderCarePlan): ElderCareFormState {
  return {
    member_id: plan.member_id,
    monthly_support: plan.monthly_support != null ? String(plan.monthly_support) : "",
    medical_reserve: plan.medical_reserve != null ? String(plan.medical_reserve) : "",
    life_expectancy: plan.life_expectancy != null ? String(plan.life_expectancy) : "",
  };
}

function elderFormToInput(form: ElderCareFormState): ElderCarePlanInput {
  return {
    member_id: form.member_id,
    monthly_support: form.monthly_support === "" ? null : num(form.monthly_support),
    medical_reserve: form.medical_reserve === "" ? null : num(form.medical_reserve),
    life_expectancy: form.life_expectancy === "" ? null : num(form.life_expectancy),
  };
}

function ElderCareTab({ members }: { members: FamilyMember[] }) {
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const plansQuery = useQuery({ queryKey: ELDER_CARE_KEY, queryFn: api.elderCare.getPlans });
  const plans = plansQuery.data || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ElderCareFormState>(EMPTY_ELDER_FORM);
  const [deleteTarget, setDeleteTarget] = useState<ElderCarePlan | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ELDER_CARE_KEY });

  const createMutation = useMutation({
    mutationFn: (data: ElderCarePlanInput) => api.elderCare.createPlan(data),
    onSuccess: () => {
      toast.success("Elder care plan added");
      setDialogOpen(false);
      invalidate();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to add elder care plan"),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ElderCarePlanInput }) => api.elderCare.updatePlan(id, data),
    onSuccess: () => {
      toast.success("Elder care plan updated");
      setDialogOpen(false);
      invalidate();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update elder care plan"),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.elderCare.deletePlan(id),
    onSuccess: () => {
      toast.success("Elder care plan removed");
      setDeleteTarget(null);
      invalidate();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to remove elder care plan"),
  });

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_ELDER_FORM);
    setDialogOpen(true);
  }
  function openEdit(plan: ElderCarePlan) {
    setEditingId(plan.id);
    setForm(elderPlanToForm(plan));
    setDialogOpen(true);
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.member_id) {
      toast.error("Please choose a family member.");
      return;
    }
    const input = elderFormToInput(form);
    if (editingId) updateMutation.mutate({ id: editingId, data: input });
    else createMutation.mutate(input);
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Elder Care Planning</CardTitle>
          <p className="text-sm text-muted-foreground">
            Plan for parents or elderly dependents — medical reserves, monthly support, longevity planning
          </p>
        </div>
        <Button onClick={openAdd} disabled={members.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Add Elder Care Plan
        </Button>
      </CardHeader>
      <CardContent>
        {plansQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : plans.length === 0 ? (
          <p className="text-sm text-muted-foreground">No elder care plans yet.</p>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => {
              const member = members.find((m) => m.id === plan.member_id);
              const yearsRemaining = plan.years_remaining ?? 0;
              // app.js elderCare.render (~5689-5711), using the server's
              // computed `years_remaining` instead of the original's
              // client-side `lifeExpectancy - member.age`.
              const totalRequired = (plan.monthly_support || 0) * 12 * yearsRemaining + (plan.medical_reserve || 0);
              return (
                <div key={plan.id} className="rounded-lg border-l-4 border-primary bg-accent/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{member?.name || "Unknown member"}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Monthly Support: {formatCurrency(plan.monthly_support || 0)} | Medical Reserve:{" "}
                        {formatCurrency(plan.medical_reserve || 0)}
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        <strong>Total Required:</strong> {formatCurrency(totalRequired)} (over {yearsRemaining} years)
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(plan)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(plan)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Elder Care Plan" : "Add Elder Care Plan"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Family Member</Label>
              <Select value={form.member_id} onValueChange={(v) => setForm((p) => ({ ...p, member_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a family member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {memberLabel(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="elder-monthly">Monthly Support</Label>
              <Input
                id="elder-monthly"
                type="number"
                min={0}
                value={form.monthly_support}
                onChange={(e) => setForm((p) => ({ ...p, monthly_support: e.target.value }))}
                placeholder="25000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="elder-medical">Medical Reserve</Label>
              <Input
                id="elder-medical"
                type="number"
                min={0}
                value={form.medical_reserve}
                onChange={(e) => setForm((p) => ({ ...p, medical_reserve: e.target.value }))}
                placeholder="500000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="elder-life">Life Expectancy (Age)</Label>
              <Input
                id="elder-life"
                type="number"
                min={0}
                max={120}
                value={form.life_expectancy}
                onChange={(e) => setForm((p) => ({ ...p, life_expectancy: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this elder care plan?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Education Timeline — full CRUD against api.educationPlans, app.js
// `educationTimeline` module (~5716-5880).
// ─────────────────────────────────────────────────────────────────────────
const MILESTONE_OPTIONS = ["Primary School", "Secondary School", "High School", "Undergraduate", "Postgraduate"];

interface EducationFormState {
  child_id: string;
  milestone: string;
  target_year: string;
  cost: string;
  saved: string;
  ppf_account: string;
}

function emptyEducationForm(): EducationFormState {
  return {
    child_id: "",
    milestone: MILESTONE_OPTIONS[0],
    target_year: String(new Date().getFullYear() + 5),
    cost: "",
    saved: "0",
    ppf_account: "",
  };
}

function educationPlanToForm(plan: EducationPlan): EducationFormState {
  return {
    child_id: plan.child_id,
    milestone: plan.milestone || MILESTONE_OPTIONS[0],
    target_year: plan.target_year != null ? String(plan.target_year) : "",
    cost: plan.cost != null ? String(plan.cost) : "",
    saved: plan.saved != null ? String(plan.saved) : "0",
    ppf_account: plan.ppf_account || "",
  };
}

function educationFormToInput(form: EducationFormState): EducationPlanInput {
  return {
    child_id: form.child_id,
    milestone: form.milestone || null,
    target_year: form.target_year === "" ? null : num(form.target_year),
    cost: form.cost === "" ? null : num(form.cost),
    saved: form.saved === "" ? 0 : num(form.saved),
    ppf_account: form.ppf_account.trim() === "" ? null : form.ppf_account.trim(),
  };
}

function EducationTimelineTab({ members }: { members: FamilyMember[] }) {
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const plansQuery = useQuery({ queryKey: EDUCATION_PLANS_KEY, queryFn: api.educationPlans.getPlans });
  const plans = plansQuery.data || [];

  // app.js educationTimeline.showForm filters to Child/dependent members
  // (~5731).
  const children = useMemo(() => members.filter((m) => m.relationship === "Child" || m.is_dependent), [members]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EducationFormState>(emptyEducationForm());
  const [deleteTarget, setDeleteTarget] = useState<EducationPlan | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: EDUCATION_PLANS_KEY });

  const createMutation = useMutation({
    mutationFn: (data: EducationPlanInput) => api.educationPlans.createPlan(data),
    onSuccess: () => {
      toast.success("Education plan added");
      setDialogOpen(false);
      invalidate();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to add education plan"),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EducationPlanInput }) => api.educationPlans.updatePlan(id, data),
    onSuccess: () => {
      toast.success("Education plan updated");
      setDialogOpen(false);
      invalidate();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update education plan"),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.educationPlans.deletePlan(id),
    onSuccess: () => {
      toast.success("Education plan removed");
      setDeleteTarget(null);
      invalidate();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to remove education plan"),
  });

  function openAdd() {
    setEditingId(null);
    setForm(emptyEducationForm());
    setDialogOpen(true);
  }
  function openEdit(plan: EducationPlan) {
    setEditingId(plan.id);
    setForm(educationPlanToForm(plan));
    setDialogOpen(true);
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.child_id) {
      toast.error("Please choose a child.");
      return;
    }
    const input = educationFormToInput(form);
    if (editingId) updateMutation.mutate({ id: editingId, data: input });
    else createMutation.mutate(input);
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  const chartData = useMemo(() => {
    // app.js educationTimeline.renderChart (~5829-5879), sorted by target
    // year, stacked Saved vs. Required (cost - saved).
    const sorted = [...plans].sort((a, b) => (a.target_year || 0) - (b.target_year || 0));
    return sorted.map((p) => {
      const child = members.find((m) => m.id === p.child_id);
      return {
        name: `${child?.name || "Child"} (${p.target_year ?? "—"})`,
        saved: p.saved || 0,
        required: Math.max(0, (p.cost || 0) - (p.saved || 0)),
      };
    });
  }, [plans, members]);

  const chartConfig: ChartConfig = {
    saved: { label: "Saved", color: CHART_COLORS[4] },
    required: { label: "Required", color: CHART_COLORS[2] },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Children's Education Timeline</CardTitle>
          <p className="text-sm text-muted-foreground">Track education milestones, costs, and funding for each child</p>
        </div>
        <Button onClick={openAdd} disabled={children.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Add Education Milestone
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {plansQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : plans.length === 0 ? (
          <p className="text-sm text-muted-foreground">No education plans yet.</p>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => {
              const child = members.find((m) => m.id === plan.child_id);
              const cost = plan.cost || 0;
              const saved = plan.saved || 0;
              const progress = cost > 0 ? Math.min((saved / cost) * 100, 100) : 0;
              const yearsRemaining = plan.years_remaining ?? 0;
              const requiredMonthly = yearsRemaining > 0 ? calculateRequiredSIP(cost - saved, 12, yearsRemaining) : 0;
              return (
                <div key={plan.id} className="rounded-lg bg-accent/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {child?.name || "Unknown"} — {plan.milestone || "Milestone"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Target Year: {plan.target_year ?? "—"} · {yearsRemaining} years remaining
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(plan)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(plan)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Cost: {formatCurrency(cost)}</span>
                      <span>
                        Saved: {formatCurrency(saved)} ({progress.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={progress} />
                  </div>
                  <p className="mt-2 text-sm text-foreground">
                    <strong>Monthly SIP Required:</strong> {formatCurrency(requiredMonthly)}
                    {plan.ppf_account ? ` | PPF A/c: ${plan.ppf_account}` : ""}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {chartData.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">Education Funding Timeline</h4>
            <ChartContainer config={chartConfig} className="h-72 w-full">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                <ChartTooltip
                  content={(props: any) => (
                    <ChartTooltipContent {...props} formatter={(v: any) => formatCurrency(Number(v))} />
                  )}
                />
                <Bar dataKey="saved" stackId="a" fill="var(--color-saved)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="required" stackId="a" fill="var(--color-required)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Education Milestone" : "Add Education Milestone"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Child</Label>
                <Select value={form.child_id} onValueChange={(v) => setForm((p) => ({ ...p, child_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a child" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} (Age: {c.age ?? "—"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Milestone</Label>
                <Select value={form.milestone} onValueChange={(v) => setForm((p) => ({ ...p, milestone: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MILESTONE_OPTIONS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edu-target-year">Target Year</Label>
                <Input
                  id="edu-target-year"
                  type="number"
                  value={form.target_year}
                  onChange={(e) => setForm((p) => ({ ...p, target_year: e.target.value }))}
                  placeholder="2030"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edu-cost">Estimated Cost</Label>
                <Input
                  id="edu-cost"
                  type="number"
                  min={0}
                  value={form.cost}
                  onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))}
                  placeholder="1000000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edu-saved">Already Saved</Label>
                <Input
                  id="edu-saved"
                  type="number"
                  min={0}
                  value={form.saved}
                  onChange={(e) => setForm((p) => ({ ...p, saved: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edu-ppf">PPF/529 Account (Optional)</Label>
                <Input
                  id="edu-ppf"
                  value={form.ppf_account}
                  onChange={(e) => setForm((p) => ({ ...p, ppf_account: e.target.value }))}
                  placeholder="Account number"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this education plan?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Tax Optimization — single settings form via api.taxOptimization,
// see header comment for why this differs from app.js's actual UI.
// ─────────────────────────────────────────────────────────────────────────
interface TaxFormState {
  ppf: string;
  elss: string;
  nsc: string;
  lifePremium: string;
  tuitionFees: string;
  selfHealth: string;
  parentHealth: string;
  educationLoanInterest: string;
  huf_benefits: boolean;
}

const EMPTY_TAX_FORM: TaxFormState = {
  ppf: "",
  elss: "",
  nsc: "",
  lifePremium: "",
  tuitionFees: "",
  selfHealth: "",
  parentHealth: "",
  educationLoanInterest: "",
  huf_benefits: false,
};

function taxRecordToForm(record: TaxOptimization | undefined): TaxFormState {
  if (!record) return EMPTY_TAX_FORM;
  const c = record.deductions_80c || {};
  const d = record.deductions_80d || {};
  const e = record.deductions_80e || {};
  return {
    ppf: c.ppf != null ? String(c.ppf) : "",
    elss: c.elss != null ? String(c.elss) : "",
    nsc: c.nsc != null ? String(c.nsc) : "",
    lifePremium: c.lifePremium != null ? String(c.lifePremium) : "",
    tuitionFees: c.tuitionFees != null ? String(c.tuitionFees) : "",
    selfHealth: d.selfHealth != null ? String(d.selfHealth) : "",
    parentHealth: d.parentHealth != null ? String(d.parentHealth) : "",
    educationLoanInterest: e.educationLoanInterest != null ? String(e.educationLoanInterest) : "",
    huf_benefits: Boolean(record.huf_benefits),
  };
}

function taxFormToInput(form: TaxFormState): TaxOptimizationInput {
  return {
    deductions_80c: {
      ppf: num(form.ppf),
      elss: num(form.elss),
      nsc: num(form.nsc),
      lifePremium: num(form.lifePremium),
      tuitionFees: num(form.tuitionFees),
    },
    deductions_80d: {
      selfHealth: num(form.selfHealth),
      parentHealth: num(form.parentHealth),
    },
    deductions_80e: {
      educationLoanInterest: num(form.educationLoanInterest),
    },
    huf_benefits: form.huf_benefits,
  };
}

const SECTION_80C_CAP = 150000;

function TaxOptimizationTab() {
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const taxQuery = useQuery({ queryKey: TAX_OPTIMIZATION_KEY, queryFn: api.taxOptimization.get });

  const [form, setForm] = useState<TaxFormState>(EMPTY_TAX_FORM);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded && taxQuery.data) {
      setForm(taxRecordToForm(taxQuery.data));
      setLoaded(true);
    }
  }, [loaded, taxQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (data: TaxOptimizationInput) => api.taxOptimization.update(data),
    onSuccess: () => {
      toast.success("Tax optimization settings saved");
      queryClient.invalidateQueries({ queryKey: TAX_OPTIMIZATION_KEY });
    },
    onError: (err: any) => toast.error(err?.message || "Failed to save tax settings"),
  });

  const total80C = num(form.ppf) + num(form.elss) + num(form.nsc) + num(form.lifePremium) + num(form.tuitionFees);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate(taxFormToInput(form));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Family Tax Optimization</CardTitle>
        <p className="text-sm text-muted-foreground">Track deductions across Sections 80C, 80D, and 80E, plus HUF benefits</p>
      </CardHeader>
      <CardContent>
        {taxQuery.isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Section 80C</h4>
                <span className={`text-xs ${total80C > SECTION_80C_CAP ? "text-destructive" : "text-muted-foreground"}`}>
                  {formatCurrency(total80C)} of {formatCurrency(SECTION_80C_CAP)} cap
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="tax-ppf">PPF</Label>
                  <Input id="tax-ppf" type="number" min={0} value={form.ppf} onChange={(e) => setForm((p) => ({ ...p, ppf: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tax-elss">ELSS</Label>
                  <Input id="tax-elss" type="number" min={0} value={form.elss} onChange={(e) => setForm((p) => ({ ...p, elss: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tax-nsc">NSC</Label>
                  <Input id="tax-nsc" type="number" min={0} value={form.nsc} onChange={(e) => setForm((p) => ({ ...p, nsc: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tax-life">Life Insurance Premium</Label>
                  <Input
                    id="tax-life"
                    type="number"
                    min={0}
                    value={form.lifePremium}
                    onChange={(e) => setForm((p) => ({ ...p, lifePremium: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tax-tuition">Tuition Fees</Label>
                  <Input
                    id="tax-tuition"
                    type="number"
                    min={0}
                    value={form.tuitionFees}
                    onChange={(e) => setForm((p) => ({ ...p, tuitionFees: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">Section 80D — Health Insurance</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="tax-self-health">Self &amp; Family Health Insurance</Label>
                  <Input
                    id="tax-self-health"
                    type="number"
                    min={0}
                    value={form.selfHealth}
                    onChange={(e) => setForm((p) => ({ ...p, selfHealth: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tax-parent-health">Parents' Health Insurance</Label>
                  <Input
                    id="tax-parent-health"
                    type="number"
                    min={0}
                    value={form.parentHealth}
                    onChange={(e) => setForm((p) => ({ ...p, parentHealth: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">Section 80E — Education Loan</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="tax-edu-loan">Education Loan Interest</Label>
                  <Input
                    id="tax-edu-loan"
                    type="number"
                    min={0}
                    value={form.educationLoanInterest}
                    onChange={(e) => setForm((p) => ({ ...p, educationLoanInterest: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="tax-huf"
                checked={form.huf_benefits}
                onCheckedChange={(checked) => setForm((p) => ({ ...p, huf_benefits: checked === true }))}
              />
              <Label htmlFor="tax-huf" className="cursor-pointer font-normal">
                Claim HUF (Hindu Undivided Family) benefits
              </Label>
            </div>

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Tax Settings"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Family Calculators — app.js `familyCalculators` module (~6016-6191),
// read-only/computed.
// ─────────────────────────────────────────────────────────────────────────
const LIFESTYLE_MULTIPLIER: Record<string, number> = { Basic: 0.7, Moderate: 1.0, Comfortable: 1.5, Luxurious: 2.0 };

function calculateDependentCost(type: string, age: number, lifestyle: string) {
  let monthlyCost = 0;
  let years = 0;
  if (type === "Child") {
    if (age < 5) {
      monthlyCost = 15000;
      years = 18 - age;
    } else if (age < 12) {
      monthlyCost = 20000;
      years = 18 - age;
    } else if (age < 18) {
      monthlyCost = 30000;
      years = 18 - age;
    } else {
      monthlyCost = 40000;
      years = 22 - age;
    }
  } else if (type === "Parent") {
    monthlyCost = 25000;
    years = Math.max(0, 85 - age);
  } else if (type === "Spouse") {
    monthlyCost = 30000;
    years = 30;
  }
  monthlyCost *= LIFESTYLE_MULTIPLIER[lifestyle] ?? 1.0;
  const annualCost = monthlyCost * 12;
  const totalCost = annualCost * years;
  const inflationAdjusted = calculateFutureValue(totalCost, 6, years / 2);
  return { monthlyCost, annualCost, totalCost, inflationAdjusted, years };
}

function FamilyCalculatorsTab({ members }: { members: FamilyMember[] }) {
  const { formatCurrency } = useCurrency();

  // Cost to Support a Dependent
  const [depType, setDepType] = useState("Child");
  const [depAge, setDepAge] = useState("5");
  const [depLifestyle, setDepLifestyle] = useState("Moderate");
  const [depResults, setDepResults] = useState<ReturnType<typeof calculateDependentCost> | null>(null);

  // Family Health Insurance Requirement — app.js `calculateFamilyInsurance`
  // (~6095-6144), computed straight from real family member data.
  const [insuranceResults, setInsuranceResults] = useState<{
    membersCount: number;
    dependents: number;
    elderlyCount: number;
    baseCoverage: number;
    recommendedCoverage: number;
    annualPremium: number;
  } | null>(null);

  function calculateFamilyInsurance() {
    const membersCount = members.length;
    const dependents = members.filter((m) => m.is_dependent).length;
    const elderlyCount = members.filter((m) => (m.age ?? 0) >= 60).length;
    const baseCoverage = membersCount * 500000 + elderlyCount * 1000000;
    const recommendedCoverage = baseCoverage * 1.5;
    const annualPremium = Math.round(recommendedCoverage * 0.01);
    setInsuranceResults({ membersCount, dependents, elderlyCount, baseCoverage, recommendedCoverage, annualPremium });
  }

  // Family Emergency Fund Recommendation — app.js `calculateEmergencyFund`
  // (~6146-6191).
  const [emergencyExpenses, setEmergencyExpenses] = useState("150000");
  const [emergencyResults, setEmergencyResults] = useState<{
    adjustedMonths: number;
    recommendedFund: number;
    conservativeFund: number;
    earners: number;
    dependents: number;
  } | null>(null);

  function calculateFamilyEmergencyFund() {
    const monthlyExpenses = num(emergencyExpenses);
    const earners = members.filter((m) => m.is_earner).length;
    const dependents = members.filter((m) => m.is_dependent).length;
    const baseMonths = 6;
    const adjustedMonths = baseMonths + dependents * 1 + (earners === 1 ? 3 : 0);
    const recommendedFund = monthlyExpenses * adjustedMonths;
    const conservativeFund = monthlyExpenses * (adjustedMonths + 3);
    setEmergencyResults({ adjustedMonths, recommendedFund, conservativeFund, earners, dependents });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost to Support a Dependent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Dependent Type</Label>
              <Select value={depType} onValueChange={setDepType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Child">Child</SelectItem>
                  <SelectItem value="Parent">Parent/Elder</SelectItem>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Current Age</Label>
              <Input type="number" min={0} value={depAge} onChange={(e) => setDepAge(e.target.value)} placeholder="25" />
            </div>
            <div className="space-y-1.5">
              <Label>Lifestyle</Label>
              <Select value={depLifestyle} onValueChange={setDepLifestyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(LIFESTYLE_MULTIPLIER).map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => setDepResults(calculateDependentCost(depType, num(depAge), depLifestyle))}>
            Calculate Cost
          </Button>
          {depResults && (
            <ResultGrid
              items={[
                { label: "Monthly Cost", value: formatCurrency(depResults.monthlyCost) },
                { label: "Annual Cost", value: formatCurrency(depResults.annualCost) },
                { label: `Total Cost (${depResults.years} years)`, value: formatCurrency(depResults.totalCost) },
                { label: "Inflation-Adjusted", value: formatCurrency(depResults.inflationAdjusted) },
              ]}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Family Health Insurance Requirement</CardTitle>
          <p className="text-sm text-muted-foreground">Based on your family size and composition</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={calculateFamilyInsurance} disabled={members.length === 0}>
            Calculate Insurance Needs
          </Button>
          {insuranceResults && (
            <>
              <p className="text-xs text-muted-foreground">
                Family Members: {insuranceResults.membersCount} | Dependents: {insuranceResults.dependents} | Elderly
                (60+): {insuranceResults.elderlyCount}
              </p>
              <ResultGrid
                items={[
                  { label: "Minimum Coverage", value: formatCurrency(insuranceResults.baseCoverage) },
                  { label: "Recommended Coverage", value: formatCurrency(insuranceResults.recommendedCoverage) },
                  { label: "Estimated Annual Premium", value: formatCurrency(insuranceResults.annualPremium) },
                  { label: "Monthly Premium", value: formatCurrency(Math.round(insuranceResults.annualPremium / 12)) },
                ]}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Family Emergency Fund Recommendation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs space-y-1.5">
            <Label>Monthly Household Expenses</Label>
            <Input
              type="number"
              min={0}
              value={emergencyExpenses}
              onChange={(e) => setEmergencyExpenses(e.target.value)}
              placeholder="150000"
            />
          </div>
          <Button onClick={calculateFamilyEmergencyFund}>Calculate Emergency Fund</Button>
          {emergencyResults && (
            <>
              <p className="text-xs text-muted-foreground">
                Earners: {emergencyResults.earners} | Dependents: {emergencyResults.dependents}
              </p>
              <ResultGrid
                items={[
                  { label: `Recommended Fund (${emergencyResults.adjustedMonths} months)`, value: formatCurrency(emergencyResults.recommendedFund) },
                  {
                    label: `Conservative Fund (${emergencyResults.adjustedMonths + 3} months)`,
                    value: formatCurrency(emergencyResults.conservativeFund),
                  },
                ]}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────
export default function FamilyAdvanced() {
  const { isPro, fetched, fetchPlan } = useGiniPlanStore();
  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const familyMembersQuery = useQuery({ queryKey: FAMILY_MEMBERS_KEY, queryFn: api.familyMembers.getFamilyMembers });
  const members = familyMembersQuery.data || [];

  return (
    <GiniLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Advanced tools</span>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Advanced Family Planning</h1>
          <p className="text-muted-foreground">Dual retirement, elder care, children's education, and tax optimization</p>
        </div>

        <ProGate feature="Advanced Family Planning" isPro={isPro()} loading={!fetched}>
          <Tabs defaultValue="dual-retirement" className="space-y-6">
            <TabsList className="flex h-auto flex-wrap justify-start gap-1">
              <TabsTrigger value="dual-retirement" className="gap-1.5">
                <Landmark className="h-3.5 w-3.5" />
                Dual Retirement
              </TabsTrigger>
              <TabsTrigger value="elder-care" className="gap-1.5">
                <HeartHandshake className="h-3.5 w-3.5" />
                Elder Care
              </TabsTrigger>
              <TabsTrigger value="education" className="gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                Education Timeline
              </TabsTrigger>
              <TabsTrigger value="tax" className="gap-1.5">
                <Receipt className="h-3.5 w-3.5" />
                Tax Optimization
              </TabsTrigger>
              <TabsTrigger value="calculators" className="gap-1.5">
                <Calculator className="h-3.5 w-3.5" />
                Family Calculators
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dual-retirement">
              <DualRetirementTab members={members} isLoading={familyMembersQuery.isLoading} />
            </TabsContent>
            <TabsContent value="elder-care">
              <ElderCareTab members={members} />
            </TabsContent>
            <TabsContent value="education">
              <EducationTimelineTab members={members} />
            </TabsContent>
            <TabsContent value="tax">
              <TaxOptimizationTab />
            </TabsContent>
            <TabsContent value="calculators">
              <FamilyCalculatorsTab members={members} />
            </TabsContent>
          </Tabs>
        </ProGate>
      </div>
    </GiniLayout>
  );
}
