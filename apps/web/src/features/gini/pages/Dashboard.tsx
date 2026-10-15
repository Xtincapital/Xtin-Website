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
//   - Asset Allocation chart (dashAssetChart) — donut of asset value by
//     `category` (shared JDonut, linked hover legend).
//   - Goals Progress (dashGoalsChart) — one progress bar per goal, `saved`
//     vs `current_cost` inflation-adjusted to `target_year`.
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
import { Wallet, Target, HeartPulse, CreditCard, Users, PiggyBank, ArrowRight, Sparkles } from "lucide-react";
import RollingNumber from "@/components/motion/RollingNumber";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import { JDonut } from "@/features/journal/components/JournalCharts";
import PageHeader from "../components/PageHeader";
import { ProgressRow, ScoreRing, SplitBar } from "../components/GiniCharts";
import { CARD, CARD_LIFT, CHIP_DOWN, CHIP_GOLD, CHIP_UP, LABEL } from "../lib/ui";
import GiniLayout from "../components/GiniLayout";
import { api } from "../lib/api";

/** Simple compound-inflation future value — mirrors the original's
 *  `utils.calculateFutureValue(currentCost, inflationPct, years)`. */
function futureValue(currentCost: number, inflationPct: number | null, years: number) {
  const rate = (inflationPct ?? 0) / 100;
  const n = Math.max(0, years);
  return currentCost * Math.pow(1 + rate, n);
}

export default function Dashboard() {
  const { formatInr: formatCurrency } = useCurrency();

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

  const { totalAssets, totalLiabilities, netWorth, healthScore, assetChartData, goalsChartData } = useMemo(() => {
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

  // A goal counts as behind when it's due within 3 years and under half funded.
  const currentYear = new Date().getFullYear();
  const goalRows = goals.map((g, i) => {
    const row = goalsChartData[i];
    const percent = row.target > 0 ? (row.saved / row.target) * 100 : 0;
    const yearsLeft = (g.target_year ?? currentYear) - currentYear;
    return { ...row, year: g.target_year, percent, behind: percent < 100 && yearsLeft <= 3 && percent < 50 };
  });
  const behindCount = goalRows.filter((g) => g.behind).length;
  const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  return (
    <GiniLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <PageHeader
          title="Dashboard"
          subtitle={isLoading ? "Loading your household's financial picture..." : "Your household's financial picture at a glance"}
        />

        {isBrandNew && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
            <div className={`${CARD} border-brand-line bg-brand-soft p-6 md:p-8`}>
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-brand-fill flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
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
            </div>
          </motion.div>
        )}

        {/* KPI tiles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-1 min-[460px]:grid-cols-2 lg:grid-cols-4 gap-4 mb-3"
        >
          <KpiTile label="Net Worth" icon={Wallet} loading={isLoading}
            value={formatCurrency(netWorth)} tone={netWorth >= 0 ? "default" : "down"}
            foot={
              <div className="w-full">
                <SplitBar a={totalAssets} b={totalLiabilities} className="mb-2" />
                <span>Assets {formatCurrency(totalAssets, { compact: true })}</span>
              </div>
            }
          />
          <KpiTile label="Goals" icon={Target} loading={isLoading} value={goals.length.toLocaleString()}
            foot={
              goals.length === 0 ? <span>No goals yet</span> : (
                <>
                  <span className={CHIP_UP}>{goals.length - behindCount} on track</span>
                  {behindCount > 0 && <span className={CHIP_GOLD}>{behindCount} behind</span>}
                </>
              )
            }
          />
          <KpiTile label="Health Score" icon={HeartPulse} loading={isLoading} value={`${Math.round(healthScore)}%`}
            foot={<><span className={healthScore >= 60 ? CHIP_UP : CHIP_GOLD}>{healthScore >= 60 ? "Good" : "Needs work"}</span>out of 100</>}
            corner={<ScoreRing value={healthScore} />}
          />
          <KpiTile label="Total Liabilities" icon={CreditCard} loading={isLoading}
            value={formatCurrency(totalLiabilities)} tone={totalLiabilities > 0 ? "down" : "default"}
            foot={<><span className={debtRatio < 50 ? CHIP_UP : CHIP_DOWN}>{debtRatio.toFixed(1)}%</span>of assets</>}
          />
        </motion.div>
        {!isLoading && (
          <p className="text-xs text-muted-foreground mb-8">
            Health Score is a lightweight, client-side approximation based on income coverage, debt-to-asset ratio
            and goal funding — not a substitute for financial advice.
          </p>
        )}

        {/* Charts row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          <section className={`${CARD} flex flex-col p-5 md:p-6`}>
            <div className="mb-5 flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold">Asset Allocation</h3>
              {totalAssets > 0 && <span className="text-xs tabular-nums text-muted-foreground">{formatCurrency(totalAssets, { compact: true })} total</span>}
            </div>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : assetChartData.length === 0 ? (
              <EmptyState text="No assets logged yet." to="/gini/networth" cta="Add an asset" />
            ) : (
              <div className="my-auto">
              <JDonut
                data={assetChartData.map((d) => ({ label: d.name, value: d.value }))}
                centerLabel="total assets"
                centerValue={formatCurrency(totalAssets, { compact: true })}
                legendValue={(d) => formatCurrency(d.value, { compact: true })}
                ariaLabel="Asset allocation by category"
              />
              </div>
            )}
          </section>

          <section className={`${CARD} p-5 md:p-6`}>
            <div className="mb-5 flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold">Goals Progress</h3>
              <span className="text-xs text-muted-foreground">saved vs inflation-adjusted target</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : goalRows.length === 0 ? (
              <EmptyState text="No goals set yet." to="/gini/goals" cta="Set a goal" />
            ) : (
              <div className="flex flex-col gap-4">
                {goalRows.map((g, i) => (
                  <ProgressRow
                    key={`${g.name}-${i}`}
                    name={g.name}
                    meta={g.year ? `by ${g.year}` : undefined}
                    saved={formatCurrency(g.saved, { compact: true })}
                    target={formatCurrency(g.target, { compact: true })}
                    percent={g.percent}
                    behind={g.behind}
                    delay={0.15 + i * 0.08}
                  />
                ))}
              </div>
            )}
          </section>
        </motion.div>
      </div>
    </GiniLayout>
  );
}

function EmptyState({ text, to, cta }: { text: string; to: string; cta: string }) {
  return (
    <div className="h-56 flex flex-col items-center justify-center text-center text-sm text-muted-foreground gap-3">
      <p>{text}</p>
      <Button asChild size="sm" variant="outline">
        <Link to={to}>
          {cta}
          <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}

interface KpiTileProps {
  label: string;
  icon: typeof Wallet;
  value: string;
  loading: boolean;
  tone?: "default" | "down";
  foot?: React.ReactNode;
  corner?: React.ReactNode;
}

function KpiTile({ label, icon: Icon, value, loading, tone = "default", foot, corner }: KpiTileProps) {
  return (
    <div className={`${CARD_LIFT} relative overflow-hidden p-5`}>
      <div className="flex items-center justify-between">
        <p className={LABEL}>{label}</p>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      {loading ? (
        <Skeleton className="mt-3 mb-2 h-8 w-28" />
      ) : (
        <p className={`mt-3 mb-2.5 text-[28px] font-bold leading-none tabular-nums tracking-[-0.01em] ${tone === "down" ? "text-destructive" : "text-foreground"}`}>
          <RollingNumber value={value} />
        </p>
      )}
      {foot && <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">{foot}</div>}
      {corner && <div className="absolute right-4 bottom-4">{corner}</div>}
    </div>
  );
}
