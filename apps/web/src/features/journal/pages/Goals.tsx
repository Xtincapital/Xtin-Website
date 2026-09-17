// Goals page — rewritten from features-incoming/journal/app.js's
// `handleGoalForm` / `renderGoals` / `computeGoalProgress` /
// `buildGoalMetricsByTimeframe` / `deleteGoal` into a React page against the
// live REST backend (services/api/modules/journal/goals.{routes,validator,controller}.ts).
//
// API client / layout: see Trades.tsx's header comment — this page uses the
// same real `api.ts` (`api.goals.*` / `api.trades.*`, verbose names like
// `getGoals`/`createGoal`/`deleteGoal`) and a default-exported `JournalLayout`.
//
// Route path: mounted at `/journal/goals` per the task brief's default
// assumption (JournalApp.tsx, meant to document the parallel task's chosen
// paths, did not exist yet either).
//
// Goal progress: computed LIVE against the user's actual trades (not
// static), reproducing app.js's `computeGoalProgress`/`buildGoalMetricsByTimeframe`.
// Caveat: `GET /journal/trades` has no date-range filter and caps `limit`
// at 200 (trades.validator.ts's `tradeListQuerySchema`), so this fetches
// the latest 200 trades once and derives all_time/this_week/this_month/
// this_year metrics from that page. For a user with more than 200 trades,
// "all_time" (and any timeframe that page doesn't fully cover) will
// understate totals — there's no aggregate endpoint yet to compute this
// server-side.
import { useState, useEffect, useCallback, useMemo } from "react";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Trash2, Target } from "lucide-react";
import { api } from "../lib/api";
import type { Goal, Trade } from "../lib/api";
import JournalLayout from "../components/JournalLayout";

// The real `Goal` type (from lib/api.ts) keeps `metric`/`timeframe` as plain
// `string` (no server-side enum) — these narrower unions are this page's own
// contract for what it lets the user pick when creating a goal, matching
// app.js's `GOAL_METRIC_CONFIG` / `GOAL_TIMEFRAME_LABELS`.
type GoalMetric = "total_pnl" | "win_rate" | "trade_count" | "avg_pnl";
type GoalTimeframe = "all_time" | "this_week" | "this_month" | "this_year";

type TradeForMetrics = Pick<Trade, "date" | "pnl">;

const METRIC_CONFIG: Record<GoalMetric, { label: string; format: (v: number) => string }> = {
  total_pnl: { label: "Total P&L", format: (v) => formatMoney(v) },
  win_rate: { label: "Win Rate", format: (v) => `${v.toFixed(1)}%` },
  trade_count: { label: "Total Trades", format: (v) => `${Math.round(v)}` },
  avg_pnl: { label: "Average P&L", format: (v) => formatMoney(v) },
};

const TIMEFRAME_LABELS: Record<GoalTimeframe, string> = {
  all_time: "All-Time",
  this_week: "This Week",
  this_month: "This Month",
  this_year: "This Year",
};

function formatMoney(value: number) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
  } catch {
    return value.toFixed(2);
  }
}

interface TimeframeMetrics {
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  avgPnL: number;
}

function computeMetrics(trades: TradeForMetrics[]): TimeframeMetrics {
  const totalTrades = trades.length;
  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const wins = trades.filter((t) => (t.pnl || 0) > 0).length;
  return {
    totalPnL,
    totalTrades,
    winRate: totalTrades > 0 ? (wins / totalTrades) * 100 : 0,
    avgPnL: totalTrades > 0 ? totalPnL / totalTrades : 0,
  };
}

// Mirrors app.js's `buildGoalMetricsByTimeframe`, extended with
// this_week/this_year (the original only computed all_time/this_month).
function buildMetricsByTimeframe(trades: TradeForMetrics[]): Record<GoalTimeframe, TimeframeMetrics> {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const inThisWeek = trades.filter((t) => new Date(t.date) >= startOfWeek);
  const inThisMonth = trades.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const inThisYear = trades.filter((t) => new Date(t.date).getFullYear() === now.getFullYear());

  return {
    all_time: computeMetrics(trades),
    this_week: computeMetrics(inThisWeek),
    this_month: computeMetrics(inThisMonth),
    this_year: computeMetrics(inThisYear),
  };
}

function computeGoalProgress(goal: Goal, metricsByTimeframe: Record<GoalTimeframe, TimeframeMetrics>) {
  const metrics = metricsByTimeframe[goal.timeframe as GoalTimeframe] || metricsByTimeframe.all_time;
  let currentValue = 0;
  switch (goal.metric) {
    case "win_rate":
      currentValue = metrics.winRate;
      break;
    case "trade_count":
      currentValue = metrics.totalTrades;
      break;
    case "avg_pnl":
      currentValue = metrics.avgPnL;
      break;
    case "total_pnl":
    default:
      currentValue = metrics.totalPnL;
      break;
  }
  const percentComplete = goal.target_value > 0 ? Math.max(0, Math.min(100, (currentValue / goal.target_value) * 100)) : 0;
  let statusText = "Making Progress";
  let statusClass = "text-amber-600 dark:text-amber-400";
  if (percentComplete >= 100) {
    statusText = "Goal Completed";
    statusClass = "text-emerald-600 dark:text-emerald-400";
  } else if (percentComplete >= 60) {
    statusText = "On Track";
    statusClass = "text-blue-600 dark:text-blue-400";
  } else {
    statusText = "Needs Attention";
    statusClass = "text-red-600 dark:text-red-400";
  }
  return { currentValue, percentComplete, statusText, statusClass };
}

interface GoalFormState {
  title: string;
  metric: GoalMetric;
  timeframe: GoalTimeframe;
  target_value: string;
}

const EMPTY_FORM: GoalFormState = { title: "", metric: "total_pnl", timeframe: "this_month", target_value: "" };

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [trades, setTrades] = useState<TradeForMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<GoalFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [goalsRes, tradesRes] = await Promise.all([
        api.goals.getGoals(),
        api.trades.getTrades({ limit: 200, offset: 0 }),
      ]);
      setGoals(goalsRes || []);
      setTrades((tradesRes.data || []).map((t) => ({ date: t.date, pnl: t.pnl })));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const metricsByTimeframe = useMemo(() => buildMetricsByTimeframe(trades), [trades]);

  function openAddDialog() {
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = form.title.trim();
    const targetValue = parseFloat(form.target_value);

    if (!title) {
      toast.error("Please enter a goal title");
      return;
    }
    if (!Number.isFinite(targetValue) || targetValue <= 0) {
      toast.error("Target must be greater than zero");
      return;
    }

    setSaving(true);
    try {
      await api.goals.createGoal({
        title,
        metric: form.metric,
        timeframe: form.timeframe,
        target_value: targetValue,
      });
      toast.success("Goal added");
      setDialogOpen(false);
      await load();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to add goal");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.goals.deleteGoal(deleteTarget.id);
      toast.success("Goal removed");
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to delete goal");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <JournalLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
            <p className="text-sm text-muted-foreground">Track targets against your logged trades</p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading goals...</p>
        ) : goals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
              <Target className="h-8 w-8" />
              <p>No goals yet. Add one to start tracking progress.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => {
              const config = METRIC_CONFIG[goal.metric as GoalMetric] || METRIC_CONFIG.total_pnl;
              const { currentValue, percentComplete, statusText, statusClass } = computeGoalProgress(goal, metricsByTimeframe);
              return (
                <Card key={goal.id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base">{goal.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {config.label} • {TIMEFRAME_LABELS[goal.timeframe as GoalTimeframe] || goal.timeframe}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(goal)} aria-label="Remove goal">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", percentComplete >= 100 ? "bg-emerald-500" : "bg-primary")}
                        style={{ width: `${Math.min(100, percentComplete)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>{config.format(currentValue)}</span>
                      <span className="text-muted-foreground">Target: {config.format(goal.target_value)}</span>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">{percentComplete.toFixed(0)}% complete</div>
                    <div className={cn("text-sm font-medium", statusClass)}>{statusText}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add goal dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="goal-title">Title</Label>
              <Input
                id="goal-title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g., Hit ₹50,000 profit this month"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Metric</Label>
              <Select value={form.metric} onValueChange={(v) => setForm((p) => ({ ...p, metric: v as GoalMetric }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(METRIC_CONFIG) as GoalMetric[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {METRIC_CONFIG[key].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Timeframe</Label>
              <Select value={form.timeframe} onValueChange={(v) => setForm((p) => ({ ...p, timeframe: v as GoalTimeframe }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TIMEFRAME_LABELS) as GoalTimeframe[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {TIMEFRAME_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-target">Target Value</Label>
              <Input
                id="goal-target"
                type="number"
                step="0.01"
                min={0}
                value={form.target_value}
                onChange={(e) => setForm((p) => ({ ...p, target_value: e.target.value }))}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Add Goal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </JournalLayout>
  );
}
