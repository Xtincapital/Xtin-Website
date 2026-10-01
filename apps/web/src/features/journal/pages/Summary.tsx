// Journal Summary page — rewrite (not a port) of
// features-incoming/journal/app.js's `renderSummaryMetrics()`
// (~line 2497-2579) plus the "advanced risk metrics" section of its
// `calculateMetrics()` (~2581-2712) and `renderSummaryCharts()` (~2715-2747).
//
// Differs from Dashboard.tsx (which only shows the six headline cards —
// today's/month's/total P&L, trade count, win rate, avg trade P&L) by
// showing:
//   - 8 basic metric cards Dashboard doesn't: Largest Win, Largest Loss,
//     Avg Winning Trade, Avg Losing Trade (Dashboard has Total Trades/Total
//     P&L/Win Rate/Avg P&L too, repeated here for a complete "summary" view
//     matching the original's card set 1:1)
//   - 8 "advanced risk metric" cards Dashboard has none of: Sharpe Ratio,
//     Sortino Ratio, Max Drawdown (+ % of peak), Profit Factor, Expectancy,
//     Current Streak (+ longest win/loss streaks), Kelly %, Calmar Ratio
//   - Trading Type Distribution + Market Distribution pie charts, P&L by
//     Type + P&L by Market bar charts (Dashboard has neither — its only
//     chart is the 12-month P&L trend line + win-rate gauge)
//
// Charting: reuses the same recharts approach Dashboard.tsx established
// (ResponsiveContainer + recharts primitives + journal.css's --chart-*
// tokens) rather than porting the original's Chart.js pie/bar helpers.
//
// Currency: sums raw `pnl`/`margin` as-is, same documented departure from
// the original's blanket `convertTradeAmountToINR()` that Dashboard.tsx's
// header comment explains (not re-explained per metric below).
//
// Data fetching: same pragmatic single large-page fetch Dashboard.tsx uses
// (GET /journal/trades has no aggregate endpoint) — limit=200, offset=0,
// computed client-side.
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import {
  Receipt,
  Wallet,
  Percent,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Gauge,
  BarChart3,
  Flame,
  Target,
  Zap,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/contexts/CurrencyContext";
import JournalLayout from "../components/JournalLayout";
import { trades as tradesApi, type Trade } from "../lib/api";

// Same static option lists pages/Trades.tsx uses for the trade form (app.js's
// `tradingTypes` / `tradeMarkets`).
const TRADING_TYPES = ["Scalping", "Intraday", "Swing Trading", "Positional Trading", "Investing", "Long-Term Investing"];
const TRADE_MARKETS = ["Equity", "Futures", "Options", "Commodities", "Forex", "Crypto_Currency"];

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-positive))",
];

/** Full port of app.js's `calculateMetrics()` — basic stats plus every
 *  "advanced risk metric" (Sharpe/Sortino/drawdown/profit factor/expectancy/
 *  Kelly/streaks/Calmar). Dashboard.tsx only needed the basic subset for its
 *  own scoped `calculateMetrics`; Summary needs the full set, so it's
 *  reproduced here rather than imported (Dashboard.tsx is read-only). */
function calculateMetrics(list: Trade[]) {
  const totalTrades = list.length;
  const pnls = list.map((t) => t.pnl ?? 0);
  const totalPnL = pnls.reduce((s, p) => s + p, 0);
  const wins = list.filter((t) => (t.pnl ?? 0) > 0);
  const losses = list.filter((t) => (t.pnl ?? 0) < 0);

  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
  const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0;
  const largestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.pnl ?? 0)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map((t) => t.pnl ?? 0)) : 0;
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length : 0;

  // Sharpe Ratio
  const avgReturn = pnls.reduce((a, b) => a + b, 0) / (pnls.length || 1);
  const stdDev = Math.sqrt(pnls.reduce((s, r) => s + Math.pow(r - avgReturn, 2), 0) / (pnls.length || 1));
  const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

  // Sortino Ratio
  const negativeReturns = pnls.filter((r) => r < 0);
  const downsideDeviation =
    negativeReturns.length > 0 ? Math.sqrt(negativeReturns.reduce((s, r) => s + Math.pow(r, 2), 0) / negativeReturns.length) : stdDev;
  const sortinoRatio = downsideDeviation > 0 ? avgReturn / downsideDeviation : 0;

  // Max Drawdown (chronological)
  let peak = 0;
  let maxDrawdown = 0;
  let runningTotal = 0;
  const sorted = [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  sorted.forEach((t) => {
    runningTotal += t.pnl ?? 0;
    if (runningTotal > peak) peak = runningTotal;
    const drawdown = peak - runningTotal;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });
  const maxDrawdownPercent = peak > 0 ? (maxDrawdown / peak) * 100 : 0;

  // Profit Factor
  const grossProfit = wins.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // Expectancy
  const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * Math.abs(avgLoss);

  // Kelly % (simplified)
  const winProb = winRate / 100;
  const lossProb = 1 - winProb;
  const avgWinLossRatio = avgLoss !== 0 ? avgWin / Math.abs(avgLoss) : 0;
  const kellyPercent = avgWinLossRatio !== 0 ? winProb - lossProb / avgWinLossRatio : 0;

  // Streaks
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  sorted.forEach((t) => {
    const pnl = t.pnl ?? 0;
    if (pnl > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      if (currentWinStreak > longestWinStreak) longestWinStreak = currentWinStreak;
    } else if (pnl < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      if (currentLossStreak > longestLossStreak) longestLossStreak = currentLossStreak;
    }
  });
  let currentStreak: { type: "win" | "loss" | null; count: number } = { type: null, count: 0 };
  if (sorted.length > 0) {
    const last = sorted[sorted.length - 1];
    const lastPnl = last.pnl ?? 0;
    if (lastPnl > 0) currentStreak = { type: "win", count: currentWinStreak };
    else if (lastPnl < 0) currentStreak = { type: "loss", count: currentLossStreak };
  }

  // Calmar Ratio
  const calmarRatio = maxDrawdown > 0 ? totalPnL / maxDrawdown : 0;

  return {
    totalTrades,
    totalPnL,
    winRate,
    avgPnL,
    largestWin,
    largestLoss,
    avgWin,
    avgLoss,
    sharpeRatio,
    sortinoRatio,
    maxDrawdown,
    maxDrawdownPercent,
    profitFactor,
    expectancy,
    kellyPercent,
    currentStreak,
    longestWinStreak,
    longestLossStreak,
    calmarRatio,
  };
}

const Summary = () => {
  const { formatCurrency } = useCurrency();

  // Pragmatic full-history fetch — see header comment (matches Dashboard.tsx).
  const { data: tradesData, isLoading } = useQuery({
    queryKey: ["journal", "trades", "summary"],
    queryFn: () => tradesApi.getTrades({ limit: 200, offset: 0 }),
  });

  const allTrades = tradesData?.data ?? [];

  const { metrics, typeDistribution, marketDistribution, pnlByType, pnlByMarket } = useMemo(() => {
    const metrics = calculateMetrics(allTrades);

    const typeDistribution = TRADING_TYPES.map((type) => ({
      name: type,
      value: allTrades.filter((t) => t.type === type).length,
    })).filter((d) => d.value > 0);

    const marketDistribution = TRADE_MARKETS.map((market) => ({
      name: market,
      value: allTrades.filter((t) => t.market === market).length,
    })).filter((d) => d.value > 0);

    const pnlByType = TRADING_TYPES.map((type) => ({
      type,
      pnl: allTrades.filter((t) => t.type === type).reduce((s, t) => s + (t.pnl ?? 0), 0),
    }));

    const pnlByMarket = TRADE_MARKETS.map((market) => ({
      market,
      pnl: allTrades.filter((t) => t.market === market).reduce((s, t) => s + (t.pnl ?? 0), 0),
    }));

    return { metrics, typeDistribution, marketDistribution, pnlByType, pnlByMarket };
  }, [allTrades]);

  const basicCards = [
    { label: "Total Trades", value: metrics.totalTrades.toLocaleString(), icon: Receipt },
    { label: "Total P&L", value: formatCurrency(metrics.totalPnL), positive: metrics.totalPnL >= 0, icon: Wallet },
    { label: "Win Rate", value: `${metrics.winRate.toFixed(2)}%`, positive: true, icon: Percent },
    { label: "Avg P/L Per Trade", value: formatCurrency(metrics.avgPnL), positive: metrics.avgPnL >= 0, icon: TrendingUp },
    { label: "Largest Win", value: formatCurrency(metrics.largestWin), positive: true, icon: ArrowUpCircle },
    { label: "Largest Loss", value: formatCurrency(metrics.largestLoss), positive: false, icon: ArrowDownCircle },
    { label: "Avg Winning Trade", value: formatCurrency(metrics.avgWin), positive: true, icon: TrendingUp },
    { label: "Avg Losing Trade", value: formatCurrency(metrics.avgLoss), positive: false, icon: TrendingDown },
  ];

  const riskCards = [
    {
      label: "Sharpe Ratio",
      value: metrics.sharpeRatio.toFixed(3),
      positive: metrics.sharpeRatio >= 1,
      sub: metrics.sharpeRatio >= 2 ? "Excellent" : metrics.sharpeRatio >= 1 ? "Good" : "Poor",
      icon: Gauge,
    },
    {
      label: "Sortino Ratio",
      value: metrics.sortinoRatio.toFixed(3),
      positive: metrics.sortinoRatio >= 1,
      sub: metrics.sortinoRatio >= 2 ? "Excellent" : metrics.sortinoRatio >= 1 ? "Good" : "Poor",
      icon: BarChart3,
    },
    {
      label: "Max Drawdown",
      value: formatCurrency(metrics.maxDrawdown),
      positive: false,
      sub: `${metrics.maxDrawdownPercent.toFixed(1)}% of peak`,
      icon: Flame,
    },
    {
      label: "Profit Factor",
      value: metrics.profitFactor === Infinity ? "∞" : metrics.profitFactor.toFixed(2),
      positive: metrics.profitFactor >= 1,
      sub: metrics.profitFactor >= 2 ? "Excellent" : metrics.profitFactor >= 1 ? "Profitable" : "Unprofitable",
      icon: Target,
    },
    {
      label: "Expectancy",
      value: formatCurrency(metrics.expectancy),
      positive: metrics.expectancy >= 0,
      sub: "Per trade expected",
      icon: Zap,
    },
    {
      label: "Current Streak",
      value: `${metrics.currentStreak.count} ${metrics.currentStreak.type ?? "None"}${metrics.currentStreak.count > 1 ? "s" : ""}`,
      positive: metrics.currentStreak.type === "win",
      sub: `Max Win: ${metrics.longestWinStreak} | Max Loss: ${metrics.longestLossStreak}`,
      icon: Award,
    },
    {
      label: "Kelly %",
      value: `${(metrics.kellyPercent * 100).toFixed(1)}%`,
      positive: metrics.kellyPercent > 0,
      sub: "Optimal position size",
      icon: Percent,
    },
    {
      label: "Calmar Ratio",
      value: metrics.calmarRatio.toFixed(2),
      positive: metrics.calmarRatio >= 3,
      sub: metrics.calmarRatio >= 3 ? "Excellent" : metrics.calmarRatio >= 1 ? "Good" : "Poor",
      icon: Gauge,
    },
  ];

  return (
    <JournalLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Summary</h1>
          <p className="text-muted-foreground">
            {isLoading ? "Loading your trading history..." : `Full performance summary across ${metrics.totalTrades} trades`}
          </p>
        </motion.div>

        {/* Basic metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4 mb-6"
        >
          {basicCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                  <card.icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className={`stat-value font-bold ${card.positive ? "text-success" : "text-destructive"}`}>{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Advanced risk metrics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mb-8">
          <h2 className="text-base font-bold text-foreground mb-3">Advanced Risk Metrics</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4">
            {riskCards.map((card) => (
              <Card key={card.label} className="border-primary/20">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                    <card.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className={`stat-value font-bold ${card.positive ? "text-success" : "text-destructive"}`}>{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Distribution + P&L charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trading Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {typeDistribution.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No trades yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={typeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" stroke="none">
                        {typeDistribution.map((entry, index) => (
                          <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value} trades`, name]}
                        contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Market Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {marketDistribution.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No trades yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={marketDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" stroke="none">
                        {marketDistribution.map((entry, index) => (
                          <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value} trades`, name]}
                        contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">P&L by Trading Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pnlByType} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="type" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), "P&L"]} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {pnlByType.map((entry) => (
                        <Cell key={entry.type} fill={entry.pnl >= 0 ? "hsl(var(--chart-positive))" : "hsl(var(--chart-negative))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">P&L by Market</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pnlByMarket} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="market" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), "P&L"]} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {pnlByMarket.map((entry) => (
                        <Cell key={entry.market} fill={entry.pnl >= 0 ? "hsl(var(--chart-positive))" : "hsl(var(--chart-negative))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </JournalLayout>
  );
};

export default Summary;
