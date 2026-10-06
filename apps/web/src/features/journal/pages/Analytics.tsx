// Journal Analytics page — rewrite (not a port) of
// features-incoming/journal/app.js's `renderAnalytics()` (~line 2924-3040)
// plus its supporting helpers `getStrategyWithBestWinRate` /
// `getStrategyWithBestAvgPnL` (~3106-3118). `getBestStrategy()` (~3087) and
// `getMostTradedMarket()` (~3120) were read too, but neither is actually
// called anywhere in app.js (dead helpers in the original — `renderAnalytics`
// finds its "best strategy" via profit factor inline instead) so nothing
// here reproduces them.
//
// Deeper, strategy-by-strategy performance analytics — this is the metrics
// Dashboard.tsx deliberately does NOT show (it sticks to today/overall
// headline numbers). Reproduced from `renderAnalytics()`:
//   - Avg Risk:Reward Ratio, Total ROI (vs. total margin deployed)
//   - Best strategy by profit factor, most consistent strategy (inverse
//     coefficient-of-variation score), best win-rate strategy, highest
//     avg-P&L strategy — all computed from a per-strategy stats table
//     (`strategyStats`), which is also rendered here as a real shadcn
//     `Table` (the original never showed this breakdown as a table, only as
//     four single-strategy metric cards — showing the full table is an
//     presentation improvement enabled by "full freedom over visual
//     presentation", not a new calculation)
//   - Strategy Performance (P&L per strategy) + Win Rate by Strategy bar
//     charts, Monthly P&L Trend line chart, Trade Count by Type bar chart
//
// Charting: uses the same recharts approach Dashboard.tsx already
// established (ResponsiveContainer + Cartesian/Pie primitives, journal.css's
// --chart-* CSS variables for color) instead of re-deriving one from the
// original's Chart.js-based `renderBarChart`/`renderLineChart`/`renderPieChart`.
//
// Monthly P&L Trend: the original bucketed by calendar month (Jan-Dec)
// ignoring year, the same year-blind bug Dashboard.tsx's header comment
// documents and deliberately fixes. Reusing Dashboard's fix here (rolling
// last-12-months, distinct year+month buckets) instead of reintroducing the
// bug, for consistency between the two pages' trend charts.
//
// Currency: like Dashboard.tsx, this sums raw `pnl`/`margin` values as-is
// rather than porting the original's `convertTradeAmountToINR()` universal
// INR conversion — correct for single-currency histories, not for mixed
// currencies. Same documented tradeoff, not re-explained per metric below.
//
// Strategy list: mirrors the original's `getStrategyOptions()` (default
// strategies ∪ custom strategies ∪ every strategy value actually used on a
// trade, de-duped case-insensitively) using `DEFAULT_STRATEGIES` from
// pages/Trades.tsx and `api.strategies.getStrategies()` for the custom set.
//
// Data fetching: same pragmatic full-history fetch Dashboard.tsx uses (see
// its header comment) — GET /journal/trades has no server-side aggregate
// endpoint, so this requests the largest allowed page (limit=200) and
// computes everything client-side.
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Gauge, Percent, Trophy, Activity, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrency } from "@/contexts/CurrencyContext";
import JournalLayout from "../components/JournalLayout";
import { trades as tradesApi, strategies as strategiesApi } from "../lib/api";

// Same static list pages/Trades.tsx uses for the trade form's strategy
// datalist (app.js's `defaultStrategies`).
const DEFAULT_STRATEGIES = ["Breakout", "Breakdown", "M Pattern", "W Pattern", "Head & shoulder", "Iron Condor", "Hammer Candle", "Shooting Star"];
const TRADING_TYPES = ["Scalping", "Intraday", "Swing Trading", "Positional Trading", "Investing", "Long-Term Investing"];

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

/** app.js's `normalizeStrategyName`/`toStrategyKey`/`strategyMatches`. */
const strategyKey = (name: string | null | undefined) => (typeof name === "string" ? name.trim().toLowerCase() : "");
const strategyMatches = (a: string | null | undefined, b: string) => {
  const ka = strategyKey(a);
  const kb = strategyKey(b);
  return !!ka && !!kb && ka === kb;
};

interface StrategyStats {
  trades: number;
  winRate: number;
  totalPnL: number;
  avgPnL: number;
  profitFactor: number;
  consistencyScore: number;
}

const Analytics = () => {
  const { formatCurrency } = useCurrency();

  // Pragmatic full-history fetch — see header comment (matches Dashboard.tsx).
  const { data: tradesData, isLoading: tradesLoading } = useQuery({
    queryKey: ["journal", "trades", "analytics"],
    queryFn: () => tradesApi.getTrades({ limit: 200, offset: 0 }),
  });

  const { data: customStrategies } = useQuery({
    queryKey: ["journal", "strategies"],
    queryFn: () => strategiesApi.getStrategies(),
  });

  const allTrades = tradesData?.data ?? [];

  const {
    strategyNames,
    strategyStats,
    riskRewardRatio,
    totalROI,
    bestStratByPF,
    mostConsistent,
    bestWinRateLabel,
    bestAvgPnLLabel,
    strategyPerformance,
    strategyWinRates,
    monthlyTrend,
    tradeCountByType,
  } = useMemo(() => {
    // getStrategyOptions(): default ∪ custom ∪ every trade's own strategy,
    // de-duped case-insensitively.
    const combined = [
      ...DEFAULT_STRATEGIES,
      ...(customStrategies ?? []).map((s) => s.name),
      ...allTrades.map((t) => t.strategy).filter((s): s is string => !!s && s.trim().length > 0),
    ];
    const seen = new Set<string>();
    const names: string[] = [];
    for (const raw of combined) {
      const normalized = raw.trim();
      const key = normalized.toLowerCase();
      if (!normalized || seen.has(key)) continue;
      seen.add(key);
      names.push(normalized);
    }

    // calculateMetrics()'s avgWin/avgLoss, scoped to the trades that matter
    // here (used for the overall risk:reward ratio card).
    const wins = allTrades.filter((t) => (t.pnl ?? 0) > 0);
    const losses = allTrades.filter((t) => (t.pnl ?? 0) < 0);
    const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length : 0;
    const riskRewardRatio = avgLoss !== 0 ? avgWin / Math.abs(avgLoss) : 0;

    // ROI is P&L over margin deployed, so use only trades that recorded a margin;
    // counting P&L from trades with no margin inflated it (₹178 over a ₹200 margin read as 89%).
    const withMargin = allTrades.filter((t) => (t.margin ?? 0) > 0);
    const marginPnL = withMargin.reduce((s, t) => s + (t.pnl ?? 0), 0);
    const totalMargin = withMargin.reduce((s, t) => s + (t.margin ?? 0), 0);
    const totalROI = totalMargin > 0 ? (marginPnL / totalMargin) * 100 : 0;

    // Per-strategy stats table — profit factor + consistency score exactly
    // as renderAnalytics() computes them.
    const stats: Record<string, StrategyStats> = {};
    for (const name of names) {
      const stratTrades = allTrades.filter((t) => strategyMatches(t.strategy, name));
      if (stratTrades.length === 0) continue;
      const stratClosed = stratTrades.filter((t) => t.pnl != null);
      const stratWins = stratTrades.filter((t) => (t.pnl ?? 0) > 0);
      const stratLosses = stratTrades.filter((t) => (t.pnl ?? 0) < 0);
      const stratTotalPnL = stratTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
      const avgPnL = stratClosed.length > 0 ? stratTotalPnL / stratClosed.length : 0;
      const winRate = stratClosed.length > 0 ? (stratWins.length / stratClosed.length) * 100 : 0;
      const grossProfit = stratWins.reduce((s, t) => s + (t.pnl ?? 0), 0);
      const grossLoss = Math.abs(stratLosses.reduce((s, t) => s + (t.pnl ?? 0), 0));
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

      const returns = stratClosed.map((t) => t.pnl as number);
      const mean = avgPnL;
      const variance = returns.length > 0 ? returns.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / returns.length : 0;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = mean !== 0 ? stdDev / Math.abs(mean) : 0;
      const consistencyScore = Math.max(0, 100 - coefficientOfVariation * 20);

      stats[name] = { trades: stratTrades.length, winRate, totalPnL: stratTotalPnL, avgPnL, profitFactor, consistencyScore };
    }

    const entries = Object.entries(stats);
    const bestStratByPF = entries.reduce<{ strat: string; stats: StrategyStats } | null>(
      (best, [strat, s]) => (!best || s.profitFactor > best.stats.profitFactor ? { strat, stats: s } : best),
      null
    );
    const mostConsistent = entries.reduce<{ strat: string; stats: StrategyStats } | null>(
      (best, [strat, s]) => (!best || s.consistencyScore > best.stats.consistencyScore ? { strat, stats: s } : best),
      null
    );
    const bestWinRate = entries.reduce<{ strat: string; stats: StrategyStats } | null>(
      (best, [strat, s]) => (!best || s.winRate > best.stats.winRate ? { strat, stats: s } : best),
      null
    );
    const bestAvgPnL = entries.reduce<{ strat: string; stats: StrategyStats } | null>(
      (best, [strat, s]) => (!best || s.avgPnL > best.stats.avgPnL ? { strat, stats: s } : best),
      null
    );

    // Strategy Performance / Win Rate by Strategy bar charts.
    const strategyPerformance = names.map((name) => ({
      name,
      pnl: stats[name]?.totalPnL ?? 0,
    }));
    const strategyWinRates = names.map((name) => ({
      name,
      winRate: stats[name]?.winRate ?? 0,
    }));

    // Monthly P&L Trend — rolling last-12-months (see header comment for why
    // this departs from the original's year-blind Jan-Dec bucketing, same
    // fix Dashboard.tsx applies).
    const today = new Date();
    const buckets: { key: string; label: string; pnl: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }), pnl: 0 });
    }
    const bucketByKey = new Map(buckets.map((b) => [b.key, b]));
    for (const t of allTrades) {
      const d = new Date(t.date);
      const bucket = bucketByKey.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (bucket) bucket.pnl += t.pnl ?? 0;
    }

    // Trade Count by Type.
    const tradeCountByType = TRADING_TYPES.map((type) => ({
      type,
      count: allTrades.filter((t) => t.type === type).length,
    }));

    return {
      strategyNames: names,
      strategyStats: stats,
      riskRewardRatio,
      totalROI,
      bestStratByPF,
      mostConsistent,
      bestWinRateLabel: bestWinRate ? `${bestWinRate.strat} (${bestWinRate.stats.winRate.toFixed(1)}%)` : "N/A",
      bestAvgPnLLabel: bestAvgPnL ? `${bestAvgPnL.strat} (${formatCurrency(bestAvgPnL.stats.avgPnL)})` : "N/A",
      strategyPerformance,
      strategyWinRates,
      monthlyTrend: buckets,
      tradeCountByType,
    };
  }, [allTrades, customStrategies, formatCurrency]);

  const metricCards = [
    {
      label: "Avg Risk:Reward Ratio",
      value: isFinite(riskRewardRatio) ? riskRewardRatio.toFixed(2) : "0.00",
      icon: Gauge,
    },
    {
      label: "Total ROI",
      value: `${totalROI.toFixed(2)}%`,
      positive: totalROI >= 0,
      icon: Percent,
    },
    {
      label: "Best Strategy (P.F.)",
      value: bestStratByPF ? bestStratByPF.strat : "N/A",
      sub: bestStratByPF ? `PF: ${bestStratByPF.stats.profitFactor === Infinity ? "∞" : bestStratByPF.stats.profitFactor.toFixed(2)}` : "",
      icon: Trophy,
      positive: true,
    },
    {
      label: "Most Consistent",
      value: mostConsistent ? mostConsistent.strat : "N/A",
      sub: mostConsistent ? `Score: ${mostConsistent.stats.consistencyScore.toFixed(0)}` : "",
      icon: Activity,
    },
    {
      label: "Best Win Rate",
      value: bestWinRateLabel,
      icon: Target,
      positive: true,
    },
    {
      label: "Highest Avg P&L",
      value: bestAvgPnLLabel,
      icon: TrendingUp,
    },
  ];

  return (
    <JournalLayout proFeature="Analytics">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Analytics</h1>
          <p className="text-muted-foreground">
            {tradesLoading ? "Crunching the numbers..." : `Strategy-level performance across ${allTrades.length} trades`}
          </p>
        </motion.div>

        {/* Metric cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          {metricCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                  <card.icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p
                  className={
                    card.positive === undefined
                      ? "text-lg font-bold text-foreground truncate"
                      : `text-lg font-bold truncate ${card.positive ? "text-success" : "text-destructive"}`
                  }
                >
                  {card.value}
                </p>
                {card.sub && <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>}
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Strategy Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strategyPerformance} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} interval={0} angle={-25} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), "P&L"]} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {strategyPerformance.map((entry) => (
                        <Cell key={entry.name} fill={entry.pnl >= 0 ? "hsl(var(--chart-positive))" : "hsl(var(--chart-negative))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Win Rate by Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strategyWinRates} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} interval={0} angle={-25} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Win Rate"]} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="winRate" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly P&L Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), "P&L"]} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="pnl" stroke="hsl(var(--chart-positive))" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trade Count by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tradeCountByType} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="type" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
                    <Tooltip formatter={(value: number) => [value, "Trades"]} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {tradeCountByType.map((entry, index) => (
                        <Cell key={entry.type} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Per-strategy breakdown table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Strategy Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {strategyNames.filter((n) => strategyStats[n]).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No strategy-tagged trades yet — add a strategy when logging a trade to see this breakdown.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Strategy</TableHead>
                      <TableHead className="text-right">Trades</TableHead>
                      <TableHead className="text-right">Win Rate</TableHead>
                      <TableHead className="text-right">Total P&L</TableHead>
                      <TableHead className="text-right">Avg P&L</TableHead>
                      <TableHead className="text-right">Profit Factor</TableHead>
                      <TableHead className="text-right">Consistency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {strategyNames
                      .filter((n) => strategyStats[n])
                      .sort((a, b) => strategyStats[b].totalPnL - strategyStats[a].totalPnL)
                      .map((name) => {
                        const s = strategyStats[name];
                        return (
                          <TableRow key={name}>
                            <TableCell className="font-medium">{name}</TableCell>
                            <TableCell className="text-right">{s.trades}</TableCell>
                            <TableCell className="text-right">{s.winRate.toFixed(1)}%</TableCell>
                            <TableCell className={`text-right font-medium ${s.totalPnL >= 0 ? "text-success" : "text-destructive"}`}>
                              {formatCurrency(s.totalPnL)}
                            </TableCell>
                            <TableCell className={`text-right ${s.avgPnL >= 0 ? "text-success" : "text-destructive"}`}>
                              {formatCurrency(s.avgPnL)}
                            </TableCell>
                            <TableCell className="text-right">{s.profitFactor === Infinity ? "∞" : s.profitFactor.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{s.consistencyScore.toFixed(0)}</TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </JournalLayout>
  );
};

export default Analytics;
