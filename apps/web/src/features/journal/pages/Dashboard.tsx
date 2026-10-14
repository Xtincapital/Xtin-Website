// Journal Dashboard — rewrite (not a port) of
// features-incoming/journal/app.js's `renderDashboard()` /
// `renderDashboardCharts()` / `calculateMetrics()` functions. The original
// rendered raw HTML strings into `#dashboardMetrics` / `#dashboardPnlChart`
// (Chart.js) / `#recentTradesList` / `#goalCardsContainer`; this reproduces
// the same set of metrics as real React state + shadcn `Card`s + `recharts`,
// per this task's brief (FundaKaMental already built the shadcn/recharts
// component library this app uses — no reason to hand-roll DOM/Chart.js
// again).
//
// Metrics reproduced 1:1 from calculateMetrics()/renderDashboard():
//   - Today's P&L, Total Trades, Win Rate, Avg Trade P&L, This Month P&L,
//     Total P&L (the six metric cards)
//   - Monthly P&L trend (renderDashboardCharts()'s `dashboardPnlChart` line
//     chart)
//   - Win-rate gauge (renderDashboardCharts()'s `performanceGaugeChart`
//     doughnut)
//   - Recent trades list (renderRecentTrades())
//   - Goal progress cards (renderGoals()/computeGoalProgress())
//
// Two deliberate departures from the original, both noted where they occur
// below:
//   1. Currency: the original converted every trade's P&L to INR via
//      `convertTradeAmountToINR()` before summing (so multi-currency trades
//      aggregated correctly) and formatted with a hardcoded INR formatter.
//      This rewrite sums raw `pnl` values as-is and formats the total with
//      the shared `useCurrency()` (the host app's region-aware formatter,
//      same one FundaKaMental uses) — correct for single-currency trade
//      history, but does NOT convert mixed-currency trades to a common
//      base. A real fix would need either a stored FX rate per trade or a
//      backend aggregate endpoint; out of scope here.
//   2. Monthly trend: the original bucketed trades by calendar month
//      (Jan–Dec) ignoring year, so a Jan-2024 trade and a Jan-2025 trade
//      would be summed into the same "Jan" bucket. This rewrite instead
//      shows a rolling last-12-months trend (each bucket is a distinct
//      year+month), which avoids silently blending years together.
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ProductBrand from "@/components/ProductBrand";
import {
  Wallet,
  Receipt,
  Percent,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Target,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnimatedProgressBar from "@/components/smoothui/animated-progress-bar";
import { useCurrency } from "@/contexts/CurrencyContext";
import JournalLayout from "../components/JournalLayout";
import { goals as goalsApi, type Trade, type Goal } from "../lib/api";
import { getAllTrades } from "../lib/api";
import { tradeInInr } from "../lib/tradesInInr";
import CurrencyBreakdown from "../components/CurrencyBreakdown";
import { marketLabel } from "../lib/journalPatternHelpers";
import StatCard from "../components/StatCard";
import WinRateRing from "../components/WinRateRing";
import { JLineChart } from "../components/JournalCharts";
import { signedMoney } from "../lib/format";

// ─────────────────────────────────────────────────────────────────────────
// Metrics — port of app.js's calculateMetrics(), trimmed to the subset the
// dashboard actually displays (win/loss streaks, Sharpe/Sortino/Kelly etc.
// from the original belong on the Analytics page, not here).
// ─────────────────────────────────────────────────────────────────────────
interface Metrics {
  totalTrades: number;
  totalPnL: number;
  winRate: number;
  avgPnL: number;
  wins: number;
  losses: number;
}

function calculateMetrics(list: Trade[]): Metrics & { closed: number } {
  const totalTrades = list.length;
  // Trades without a P&L (still open) are not wins or losses, so they stay out of every rate and average.
  const closed = list.filter((t) => t.pnl != null);
  const totalPnL = list.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const wins = closed.filter((t) => (t.pnl ?? 0) > 0);
  const losses = closed.filter((t) => (t.pnl ?? 0) < 0);
  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
  const avgPnL = closed.length > 0 ? totalPnL / closed.length : 0;
  return { totalTrades, totalPnL, winRate, avgPnL, wins: wins.length, losses: losses.length, closed: closed.length };
}

// Goal metric config — mirrors app.js's GOAL_METRIC_CONFIG.
const GOAL_METRIC_LABELS: Record<string, string> = {
  total_pnl: "Total P&L",
  win_rate: "Win Rate",
  trade_count: "Trade Count",
  avg_pnl: "Avg Trade P&L",
};

const GOAL_TIMEFRAME_LABELS: Record<string, string> = {
  all_time: "All Time",
  this_month: "This Month",
  this_week: "This Week",
  this_year: "This Year",
};

function goalCurrentValue(goal: Goal, allTime: Metrics, thisMonth: Metrics): number {
  const metrics = goal.timeframe === "this_month" ? thisMonth : allTime;
  switch (goal.metric) {
    case "win_rate":
      return metrics.winRate;
    case "trade_count":
      return metrics.totalTrades;
    case "avg_pnl":
      return metrics.avgPnL;
    case "total_pnl":
    default:
      return metrics.totalPnL;
  }
}


/** Two-letter badge for an asset row ("NIFTY 25000 CE" → "NI"). */
const assetMonogram = (asset: string) => (asset.replace(/[^A-Za-z]/g, "").slice(0, 2) || "—").toUpperCase();

const Dashboard = () => {
  const { formatInr: formatCurrency } = useCurrency();

  // Pragmatic choice: GET /journal/trades is paginated (default 50, max 200
  // server-side — see trades.validator.ts). A dedicated stats/aggregate
  // endpoint would be the correct long-term fix for computing dashboard
  // metrics over a real trade history; that's out of scope here, so this
  // just requests the largest allowed page so the numbers below are at
  // least accurate for accounts with up to 200 trades.
  const { data: tradesData, isLoading: tradesLoading } = useQuery({
    queryKey: ["journal", "trades", "dashboard"],
    // Keep the trades as recorded (for the per-currency breakdown) next to
    // the rupee-converted copy every total below is built from.
    queryFn: async () => {
      const res = await getAllTrades();
      return { ...res, raw: res.data, data: res.data.map(tradeInInr) };
    },
  });

  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ["journal", "goals"],
    queryFn: () => goalsApi.getGoals(),
  });

  const allTrades = tradesData?.data ?? [];
  const rawTrades = tradesData?.raw ?? [];
  const goalsList = goalsData ?? [];

  const { metrics, todayMetrics, monthMetrics, monthlyTrend, trendTotal, recentTrades, firstDate } = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const todayTrades = allTrades.filter((t) => t.date === todayStr);
    const monthTrades = allTrades.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    // Rolling last-12-months P&L trend (see header comment for why this
    // departs from the original's year-blind month bucketing).
    const buckets: { key: string; label: string; pnl: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(thisYear, thisMonth - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
        pnl: 0,
      });
    }
    const bucketByKey = new Map(buckets.map((b) => [b.key, b]));
    for (const t of allTrades) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = bucketByKey.get(key);
      if (bucket) bucket.pnl += t.pnl ?? 0;
    }

    // Recent trades — most recent 5 by date.
    const sorted = [...allTrades].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

    return {
      metrics: calculateMetrics(allTrades),
      todayMetrics: calculateMetrics(todayTrades),
      monthMetrics: calculateMetrics(monthTrades),
      monthlyTrend: buckets,
      trendTotal: buckets.reduce((sum, b) => sum + b.pnl, 0),
      recentTrades: sorted.slice(0, 5),
      firstDate: sorted.length ? sorted[sorted.length - 1].date : null,
    };
  }, [allTrades]);

  const money = (v: number) => signedMoney(formatCurrency, v);
  const tone = (v: number) => (v > 0 ? ("pos" as const) : v < 0 ? ("neg" as const) : undefined);
  const now = new Date();
  const dayLabel = now.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const monthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

  const metricCards = [
    {
      label: "Today's P&L",
      value: money(todayMetrics.totalPnL),
      tone: tone(todayMetrics.totalPnL),
      icon: CalendarDays,
      sub: `${plural(todayMetrics.totalTrades, "trade")} · ${dayLabel}`,
      subTone: todayMetrics.totalTrades ? tone(todayMetrics.totalPnL) : undefined,
    },
    {
      label: "Total Trades",
      value: metrics.totalTrades.toLocaleString("en-IN"),
      icon: Receipt,
      sub: firstDate ? `Since ${new Date(firstDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}` : "No trades yet",
    },
    {
      label: "Win Rate",
      value: `${metrics.winRate.toFixed(1)}%`,
      icon: Percent,
      sub: `${plural(metrics.wins, "win")} · ${plural(metrics.losses, "loss").replace("losss", "losses")}`,
    },
    {
      label: "Avg Trade P&L",
      value: money(metrics.avgPnL),
      tone: tone(metrics.avgPnL),
      icon: TrendingUp,
      sub: "Per closed trade",
    },
    {
      label: "This Month P&L",
      value: money(monthMetrics.totalPnL),
      tone: tone(monthMetrics.totalPnL),
      icon: Wallet,
      sub: monthLabel,
    },
    {
      label: "Total P&L",
      value: money(metrics.totalPnL),
      tone: tone(metrics.totalPnL),
      icon: Wallet,
      sub: "All time",
    },
  ];

  return (
    <JournalLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          {/* Title on the left, the product wordmark on the right of the same line. */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <h1 className="xt-title">Dashboard</h1>
            <ProductBrand to="/journal" name="Journal" size="lg" />
          </div>
          <p className="mt-2 text-muted-foreground flex items-center gap-1.5">
            {tradesLoading ? "Loading your trading activity..." : `${metrics.totalTrades} trades logged`}
            {!tradesLoading && <CurrencyBreakdown trades={rawTrades} />}
          </p>
        </motion.div>

        {/* Metric cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4 mb-8"
        >
          {metricCards.map((card) => (
            <StatCard
              key={card.label}
              label={
                <>
                  {card.label}
                  {card.label === "Total P&L" && <CurrencyBreakdown trades={rawTrades} />}
                </>
              }
              value={card.value}
              icon={card.icon}
              tone={card.tone}
              sub={card.sub}
              subTone={card.subTone}
            />
          ))}
        </motion.div>

        {/* Charts row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="text-lg">Monthly P&L Trend</CardTitle>
              <span className="text-xs tabular-nums text-muted-foreground">
                Last 12 months ·{" "}
                <span className={trendTotal >= 0 ? "text-brand" : "text-destructive"}>{money(trendTotal)}</span>
              </span>
            </CardHeader>
            <CardContent>
              <JLineChart
                data={monthlyTrend.map((b) => ({ label: b.label, value: b.pnl }))}
                formatAxis={(v) => formatCurrency(v, { compact: true })}
                formatValue={money}
                ariaLabel="Monthly P&L, last 12 months"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <WinRateRing wins={metrics.wins} losses={metrics.losses} total={metrics.closed} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent trades + Goal progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Receipt className="w-4 h-4 text-brand" />
                Recent Trades
              </h2>
              <Link to="/journal/trades" className="text-brand hover:text-brand/80 text-sm font-medium flex items-center gap-1">
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-2">
              {tradesLoading ? (
                <Card>
                  <CardContent className="p-8 text-center text-sm text-muted-foreground">Loading trades...</CardContent>
                </Card>
              ) : recentTrades.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-sm text-muted-foreground">
                    No trades yet. Add your first trade to see it here.
                  </CardContent>
                </Card>
              ) : (
                recentTrades.map((trade) => {
                  const positive = (trade.pnl ?? 0) >= 0;
                  return (
                    <Card key={trade.id} className="transition-[transform,border-color] duration-300 hover:translate-x-1 hover:border-gray-300 dark:hover:border-gray-700">
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border bg-secondary text-xs font-bold tracking-wide text-muted-foreground">
                          {assetMonogram(trade.asset)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-2 font-semibold text-foreground text-sm">
                            <span className="truncate">{trade.asset}</span>
                            {trade.buy_sell && (
                              <span
                                className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                                  trade.buy_sell === "buy" ? "bg-brand-soft text-brand" : "bg-destructive/10 text-destructive"
                                }`}
                              >
                                {trade.buy_sell}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {[trade.type, trade.market && marketLabel(trade.market)].filter(Boolean).join(" • ")}
                            {trade.type || trade.market ? " • " : ""}
                            {new Date(trade.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 shrink-0 font-semibold text-sm ${positive ? "text-brand" : "text-destructive"}`}>
                          {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {money(trade.pnl ?? 0)}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-brand" />
                Goal Progress
              </h2>
              <Link to="/journal/goals" className="text-brand hover:text-brand/80 text-sm font-medium flex items-center gap-1">
                Manage
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {goalsLoading ? (
                <Card>
                  <CardContent className="p-8 text-center text-sm text-muted-foreground">Loading goals...</CardContent>
                </Card>
              ) : goalsList.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-sm text-muted-foreground">
                    No goals set yet. Set a goal to track your progress.
                  </CardContent>
                </Card>
              ) : (
                goalsList.map((goal) => {
                  const currentValue = goalCurrentValue(goal, metrics, monthMetrics);
                  const percentComplete = goal.target_value > 0 ? Math.max(0, Math.min(100, (currentValue / goal.target_value) * 100)) : 0;
                  const isPercentMetric = goal.metric === "win_rate";
                  const isCountMetric = goal.metric === "trade_count";
                  const formatValue = (v: number) =>
                    isPercentMetric ? `${v.toFixed(1)}%` : isCountMetric ? v.toFixed(0) : formatCurrency(v);
                  const status =
                    percentComplete >= 100 ? "Completed" : percentComplete >= 60 ? "On Track" : "Needs Attention";
                  const statusVariant = percentComplete >= 100 ? "default" : percentComplete >= 60 ? "secondary" : "destructive";

                  return (
                    <Card key={goal.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-sm truncate">{goal.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {GOAL_METRIC_LABELS[goal.metric] || goal.metric} • {GOAL_TIMEFRAME_LABELS[goal.timeframe] || goal.timeframe}
                            </p>
                          </div>
                          <Badge variant={statusVariant as any} className="shrink-0">
                            {status}
                          </Badge>
                        </div>
                        <AnimatedProgressBar value={percentComplete} className="mb-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatValue(currentValue)}</span>
                          <span>Target: {formatValue(goal.target_value)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </JournalLayout>
  );
};

export default Dashboard;
