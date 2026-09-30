// Gini Dashboard — the `/gini` index route. Rewrite (not a port) of
// features-incoming/gini/app.js's `dashboard` module (`dashboard.refresh()`/
// `calculateHealthScore()`/`renderAssetChart()`/`renderGoalsChart()`,
// ~lines 2770-3005) into a React/TanStack Query page that aggregates
// read-only data from four Gini API modules — see
// apps/web/src/features/journal/pages/Dashboard.tsx for the TanStack Query
// + recharts conventions this follows.
//
// This page ONLY reads data (`api.familyMembers`/`api.assets`/
// `api.liabilities`/`api.goals`) — it owns no mutations, and does not touch
// NetWorth.tsx/Goals.tsx (a sibling task's scope; see this task's explicit
// boundaries).
//
// Reproduced from the original:
//   - KPI tiles: Net Worth (dashNetWorth), Goals count (dashGoalsCount),
//     Health Score (dashHealthScore), Total Liabilities (dashLiabilities).
//   - Asset Allocation chart (dashAssetChart) — pie of asset value by
//     `category`.
//   - Goals Progress chart (dashGoalsChart) — bar of `saved` vs
//     `current_cost` (inflation-adjusted to `target_year`) per goal.
//   - A welcome/empty state for brand-new users (no family/assets/goals
//     yet), replacing the original's `dashboardOnboarding` checklist widget
//     with a lighter single card pointing at the three real household
//     routes.
//
// Judgement calls (see this task's final report for the full list):
//   - Health Score: the original's `calculateHealthScore()` is reproduced
//     faithfully below (same point weights/thresholds) since it was pure
//     client-side arithmetic over the same four datasets this page already
//     fetches — NOT the backend's separate `_calculateHealthSnapshot` in
//     services/api/modules/gini/aiProfile.ts, which the task brief
//     explicitly says is out of scope here. This is clearly labeled in the
//     UI as an approximation.
//   - "Goals Progress" bar chart's future-value calc uses a simple
//     compound-inflation formula (`currentCost * (1 + inflation/100) ^
//     yearsRemaining`), matching the original's `utils.calculateFutureValue`
//     intent without importing that module.
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Wallet, Target, HeartPulse, CreditCard, Users, PiggyBank, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import GiniLayout from "../components/GiniLayout";
import { api } from "../lib/api";

// Matches gini.css's `--chart-1`..`--chart-5` tokens.
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

/** Simple compound-inflation future value — mirrors the original's
 *  `utils.calculateFutureValue(currentCost, inflationPct, years)`. */
function futureValue(currentCost: number, inflationPct: number | null, years: number) {
  const rate = (inflationPct ?? 0) / 100;
  const n = Math.max(0, years);
  return currentCost * Math.pow(1 + rate, n);
}

export default function Dashboard() {
  const { formatCurrency } = useCurrency();

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["gini", "family-members"],
    queryFn: api.familyMembers.getFamilyMembers,
  });
  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["gini", "assets"],
    queryFn: api.assets.getAssets,
  });
  const { data: liabilities = [], isLoading: liabilitiesLoading } = useQuery({
    queryKey: ["gini", "liabilities"],
    queryFn: api.liabilities.getLiabilities,
  });
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["gini", "goals"],
    queryFn: api.goals.getGoals,
  });

  const isLoading = membersLoading || assetsLoading || liabilitiesLoading || goalsLoading;

  const { totalLiabilities, netWorth, healthScore, assetChartData, goalsChartData } = useMemo(() => {
    const totalAssetsValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);
    const totalLiabilitiesValue = liabilities.reduce((sum, l) => sum + (l.amount || 0), 0);
    const netWorthValue = totalAssetsValue - totalLiabilitiesValue;

    // Health Score — client-side approximation, same weights as the
    // original's `calculateHealthScore()` (see header comment).
    let score = 0;
    if (members.length > 0) {
      score += 10; // household profile created
      const income = members.filter((m) => m.is_earner).reduce((s, m) => s + (m.income || 0), 0);
      if (income > 0) {
        score += 15;
        const totalEmi = liabilities.reduce((s, l) => s + (l.emi || 0), 0);
        if ((totalEmi / income) * 100 < 40) score += 10;
      }
      if (goals.length > 0) score += 10;
      if (totalAssetsValue > 0) {
        score += 15;
        if (netWorthValue > 0) score += 15;
        if (totalLiabilitiesValue / totalAssetsValue < 0.5) score += 15;
        if (netWorthValue > 5000000) score += 10;
      }
    }
    score = Math.min(score, 100);

    // Asset Allocation — by category.
    const byCategory = new Map<string, number>();
    for (const a of assets) {
      const key = a.category || "Other";
      byCategory.set(key, (byCategory.get(key) || 0) + (a.value || 0));
    }
    const assetChart = Array.from(byCategory.entries()).map(([name, value]) => ({ name, value }));

    // Goals Progress — saved vs inflation-adjusted target.
    const currentYear = new Date().getFullYear();
    const goalsChart = goals.map((g) => {
      const yearsRemaining = (g.target_year ?? currentYear) - currentYear;
      const target = futureValue(g.current_cost, g.inflation, yearsRemaining);
      return {
        name: g.name,
        saved: g.saved || 0,
        target,
      };
    });

    return {
      totalAssets: totalAssetsValue,
      totalLiabilities: totalLiabilitiesValue,
      netWorth: netWorthValue,
      healthScore: score,
      assetChartData: assetChart,
      goalsChartData: goalsChart,
    };
  }, [members, assets, liabilities, goals]);

  const isBrandNew = !isLoading && members.length === 0 && assets.length === 0 && goals.length === 0;

  const kpiCards = [
    {
      label: "Net Worth",
      value: formatCurrency(netWorth),
      positive: netWorth >= 0,
      icon: Wallet,
    },
    {
      label: "Goals",
      value: goals.length.toLocaleString(),
      icon: Target,
    },
    {
      label: "Health Score",
      value: `${Math.round(healthScore)}%`,
      positive: healthScore >= 60,
      icon: HeartPulse,
    },
    {
      label: "Total Liabilities",
      value: formatCurrency(totalLiabilities),
      positive: false,
      icon: CreditCard,
    },
  ];

  return (
    <GiniLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Dashboard</h1>
          <p className="text-muted-foreground">
            {isLoading ? "Loading your household's financial picture..." : "Your household's financial picture at a glance"}
          </p>
        </motion.div>

        {isBrandNew && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
            <Card className="bg-gradient-accent border-primary/10">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-foreground mb-1">Welcome to Gini</h2>
                    <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
                      Set up your household to unlock net worth tracking, goal projections, and personalized
                      insights. Start with these three steps.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm">
                        <Link to="/gini/family">
                          <Users className="mr-2 h-4 w-4" />
                          Add family members
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/gini/networth">
                          <PiggyBank className="mr-2 h-4 w-4" />
                          Add assets &amp; liabilities
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/gini/goals">
                          <Target className="mr-2 h-4 w-4" />
                          Set a goal
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* KPI tiles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {kpiCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                  <card.icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                {isLoading ? (
                  <Skeleton className="h-7 w-24" />
                ) : (
                  <p
                    className={
                      card.positive === undefined
                        ? "text-xl font-bold text-foreground"
                        : `text-xl font-bold ${card.positive ? "text-success" : "text-destructive"}`
                    }
                  >
                    {card.value}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </motion.div>
        {!isLoading && (
          <p className="text-xs text-muted-foreground -mt-6 mb-8">
            Health Score is a lightweight, client-side approximation based on income coverage, debt-to-asset ratio
            and goal funding — not a substitute for financial advice.
          </p>
        )}

        {/* Charts row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : assetChartData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center text-sm text-muted-foreground gap-3">
                  <p>No assets logged yet.</p>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/gini/networth">
                      Add an asset
                      <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="55%"
                        outerRadius="85%"
                        stroke="none"
                      >
                        {assetChartData.map((entry, index) => (
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Goals Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : goalsChartData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center text-sm text-muted-foreground gap-3">
                  <p>No goals set yet.</p>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/gini/goals">
                      Set a goal
                      <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={goalsChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        width={56}
                        tickFormatter={(v) => formatCurrency(v, { compact: true })}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="saved" name="Saved" fill="hsl(var(--chart-positive))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="target" name="Target" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </GiniLayout>
  );
}
