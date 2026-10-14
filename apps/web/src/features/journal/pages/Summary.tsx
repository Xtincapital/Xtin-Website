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
import { useMemo, useState } from "react";
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
import { chartGrid, chartTick, chartTooltip, chartBarRadius, chartMaxBarSize } from "@/components/charts/chartTheme";
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
import InfoTip from "@/components/ui/info-tip";
import TradeDrilldown, { type DrilldownRequest } from "../components/TradeDrilldown";
import JournalLayout from "../components/JournalLayout";
import { CATEGORY_COLORS } from "../lib/chartColors";
import { type Trade } from "../lib/api";
import { getAllTradesInInr } from "../lib/tradesInInr";
import { marketLabel } from "../lib/journalPatternHelpers";

// Same static option lists pages/Trades.tsx uses for the trade form (app.js's
// `tradingTypes` / `tradeMarkets`).
const TRADING_TYPES = ["Scalping", "Intraday", "Swing Trading", "Positional Trading", "Investing", "Long-Term Investing"];
const TRADE_MARKETS = ["Equity", "Futures", "Options", "Commodities", "Forex", "Crypto_Currency"];

const PIE_COLORS = CATEGORY_COLORS;

/** Full port of app.js's `calculateMetrics()` — basic stats plus every
 *  "advanced risk metric" (Sharpe/Sortino/drawdown/profit factor/expectancy/
 *  Kelly/streaks/Calmar). Dashboard.tsx only needed the basic subset for its
 *  own scoped `calculateMetrics`; Summary needs the full set, so it's
 *  reproduced here rather than imported (Dashboard.tsx is read-only). */
function calculateMetrics(list: Trade[]) {
  const totalTrades = list.length;
  // Trades without a P&L (still open) are not wins or losses, so they stay out of every rate and average.
  const closed = list.filter((t) => t.pnl != null);
  const pnls = closed.map((t) => t.pnl as number);
  const totalPnL = pnls.reduce((s, p) => s + p, 0);
  const wins = closed.filter((t) => (t.pnl ?? 0) > 0);
  const losses = closed.filter((t) => (t.pnl ?? 0) < 0);

  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
  const lossRate = closed.length > 0 ? (losses.length / closed.length) * 100 : 0;
  const avgPnL = closed.length > 0 ? totalPnL / closed.length : 0;
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
  const expectancy = (winRate / 100) * avgWin - (lossRate / 100) * Math.abs(avgLoss);

  // Kelly % (simplified)
  const winProb = winRate / 100;
  const lossProb = lossRate / 100;
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
  const { formatInr: formatCurrency } = useCurrency();
  const [drill, setDrill] = useState<DrilldownRequest | null>(null);

  // Pragmatic full-history fetch — see header comment (matches Dashboard.tsx).
  const { data: tradesData, isLoading } = useQuery({
    queryKey: ["journal", "trades", "summary"],
    queryFn: () => getAllTradesInInr(),
  });

  const allTrades = tradesData?.data ?? [];

  const { metrics, typeDistribution, marketDistribution, pnlByType, pnlByMarket } = useMemo(() => {
    const metrics = calculateMetrics(allTrades);

    const typeDistribution = TRADING_TYPES.map((type) => ({
      name: type,
      value: allTrades.filter((t) => t.type === type).length,
    })).filter((d) => d.value > 0);

    const marketDistribution = TRADE_MARKETS.map((market) => ({
      name: marketLabel(market),
      value: allTrades.filter((t) => t.market === market).length,
    })).filter((d) => d.value > 0);

    const pnlByType = TRADING_TYPES.map((type) => ({
      type,
      pnl: allTrades.filter((t) => t.type === type).reduce((s, t) => s + (t.pnl ?? 0), 0),
    }));

    const pnlByMarket = TRADE_MARKETS.map((market) => ({
      market: marketLabel(market),
      pnl: allTrades.filter((t) => t.market === market).reduce((s, t) => s + (t.pnl ?? 0), 0),
    }));

    return { metrics, typeDistribution, marketDistribution, pnlByType, pnlByMarket };
  }, [allTrades]);

  const wins = allTrades.filter((t) => (t.pnl ?? 0) > 0);
  const lossTrades = allTrades.filter((t) => (t.pnl ?? 0) < 0);
  const biggestWin = wins.length ? [wins.reduce((a, b) => ((a.pnl ?? 0) >= (b.pnl ?? 0) ? a : b))] : [];
  const biggestLoss = lossTrades.length ? [lossTrades.reduce((a, b) => ((a.pnl ?? 0) <= (b.pnl ?? 0) ? a : b))] : [];
  const show = (title: string, subtitle: string, trades: Trade[]) => () => setDrill({ title, subtitle, trades });

  interface Card_ {
    label: string;
    info: string;
    value: string;
    positive: boolean;
    sub?: string;
    icon: typeof Receipt;
    onClick?: () => void;
  }

  const basicCards: Card_[] = [
    { label: "Total Trades", info: "Every trade in your journal.", value: metrics.totalTrades.toLocaleString(), positive: true, icon: Receipt, onClick: allTrades.length ? show("All trades", "Everything in your journal", allTrades) : undefined },
    { label: "Total P&L", info: "Profit and loss: everything your closed trades made minus what they lost, after fees. Trades in other currencies are converted to your selected currency.", value: formatCurrency(metrics.totalPnL), positive: metrics.totalPnL >= 0, icon: Wallet },
    { label: "Win Rate", info: "The percentage of your closed trades that made money. A 40% win rate can still be very profitable if your wins are much bigger than your losses.", value: `${metrics.winRate.toFixed(2)}%`, positive: true, icon: Percent, onClick: wins.length ? show("Winning trades", "Trades that made money", wins) : undefined },
    { label: "Avg P/L Per Trade", info: "Total P&L divided by the number of closed trades: what a typical trade earns or loses.", value: formatCurrency(metrics.avgPnL), positive: metrics.avgPnL >= 0, icon: TrendingUp },
    { label: "Largest Win", info: "Your single biggest winning trade.", value: formatCurrency(metrics.largestWin), positive: true, icon: ArrowUpCircle, onClick: biggestWin.length ? show("Largest win", "Your best trade", biggestWin) : undefined },
    { label: "Largest Loss", info: "Your single biggest losing trade. If this is much bigger than your average loss, a risk rule was probably broken.", value: formatCurrency(metrics.largestLoss), positive: false, icon: ArrowDownCircle, onClick: biggestLoss.length ? show("Largest loss", "Your worst trade", biggestLoss) : undefined },
    { label: "Avg Winning Trade", info: "The average profit of your winning trades.", value: formatCurrency(metrics.avgWin), positive: true, icon: TrendingUp, onClick: wins.length ? show("Winning trades", "Trades that made money", wins) : undefined },
    { label: "Avg Losing Trade", info: "The average loss of your losing trades. You want this to be smaller than your average win.", value: formatCurrency(metrics.avgLoss), positive: false, icon: TrendingDown, onClick: lossTrades.length ? show("Losing trades", "Trades that lost money", lossTrades) : undefined },
  ];

  const riskCards: Card_[] = [
    {
      label: "Sharpe Ratio",
      info: "Return earned for each unit of ups and downs (volatility) in your results. Above 1 is good, above 2 is excellent. Higher means smoother, more reliable profits.",
      value: metrics.sharpeRatio.toFixed(3),
      positive: metrics.sharpeRatio >= 1,
      sub: metrics.sharpeRatio >= 2 ? "Excellent" : metrics.sharpeRatio >= 1 ? "Good" : "Poor",
      icon: Gauge,
    },
    {
      label: "Sortino Ratio",
      info: "Like the Sharpe ratio, but only counts the bad ups and downs (losses), not the good ones. A higher number means better returns for the downside risk you take.",
      value: metrics.sortinoRatio.toFixed(3),
      positive: metrics.sortinoRatio >= 1,
      sub: metrics.sortinoRatio >= 2 ? "Excellent" : metrics.sortinoRatio >= 1 ? "Good" : "Poor",
      icon: BarChart3,
    },
    {
      label: "Max Drawdown",
      info: "The biggest fall from a peak in your running profit to the next low. It tells you the worst losing stretch you have lived through, and how much pain to expect again.",
      value: formatCurrency(metrics.maxDrawdown),
      positive: false,
      sub: `${metrics.maxDrawdownPercent.toFixed(1)}% of peak`,
      icon: Flame,
    },
    {
      label: "Profit Factor",
      info: "Total money won divided by total money lost. Above 1 means you make more than you lose; above 2 is excellent. For example 1.5 means you win 1.50 for every 1 you lose.",
      value: metrics.profitFactor === Infinity ? "∞" : metrics.profitFactor.toFixed(2),
      positive: metrics.profitFactor >= 1,
      sub: metrics.profitFactor >= 2 ? "Excellent" : metrics.profitFactor >= 1 ? "Profitable" : "Unprofitable",
      icon: Target,
    },
    {
      label: "Expectancy",
      info: "What you can expect to make on an average trade, using your win rate and your average win and loss. Positive means your approach has an edge over many trades.",
      value: formatCurrency(metrics.expectancy),
      positive: metrics.expectancy >= 0,
      sub: "Per trade expected",
      icon: Zap,
    },
    {
      label: "Current Streak",
      info: "How many wins (or losses) in a row your latest trades have. The Max Win and Max Loss lines show your longest runs ever.",
      value: `${metrics.currentStreak.count} ${metrics.currentStreak.type ?? "None"}${metrics.currentStreak.count > 1 ? "s" : ""}`,
      positive: metrics.currentStreak.type === "win",
      sub: `Max Win: ${metrics.longestWinStreak} | Max Loss: ${metrics.longestLossStreak}`,
      icon: Award,
    },
    {
      label: "Kelly %",
      info: "A formula for the share of your capital to risk on each trade, from your win rate and win/loss sizes. Most traders use only a half or a quarter of it. Negative means your results don't show an edge yet.",
      value: `${(metrics.kellyPercent * 100).toFixed(1)}%`,
      positive: metrics.kellyPercent > 0,
      sub: "Optimal position size",
      icon: Percent,
    },
    {
      label: "Calmar Ratio",
      info: "Total profit divided by your max drawdown: how much you earned compared with the worst fall you suffered. Above 3 is excellent.",
      value: metrics.calmarRatio.toFixed(2),
      positive: metrics.calmarRatio >= 3,
      sub: metrics.calmarRatio >= 3 ? "Excellent" : metrics.calmarRatio >= 1 ? "Good" : "Poor",
      icon: Gauge,
    },
  ];

  const tradesOfType = (type: string) => allTrades.filter((t) => t.type === type);
  const tradesOfMarket = (label: string) => allTrades.filter((t) => t.market && marketLabel(t.market) === label);

  return (
    <JournalLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="xt-title mb-2 flex items-center gap-3">
            Metrics
            <InfoTip title="Performance metrics" widthClass="w-80">
              <p>One page with the numbers professional traders use to judge their results: how often you win, how big wins and losses are, and how risky your equity curve has been.</p>
              <p>Tap the <strong className="text-foreground">i</strong> next to any metric to see what it means. Click a value, slice or bar to see the trades behind it.</p>
            </InfoTip>
          </h1>
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
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    {card.label}
                    <InfoTip title={card.label}>
                      <p>{card.info}</p>
                      {card.onClick && <p>Click the value to see these trades.</p>}
                    </InfoTip>
                  </p>
                  <card.icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                {card.onClick ? (
                  <button type="button" onClick={card.onClick} className="text-left cursor-pointer hover:underline">
                    <p className={`stat-value font-semibold ${card.positive ? "text-brand" : "text-destructive"}`}>{card.value}</p>
                  </button>
                ) : (
                  <p className={`stat-value font-semibold ${card.positive ? "text-brand" : "text-destructive"}`}>{card.value}</p>
                )}
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
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      {card.label}
                      <InfoTip title={card.label} widthClass="w-80">
                        <p>{card.info}</p>
                      </InfoTip>
                    </p>
                    <card.icon className="w-3.5 h-3.5 text-brand" />
                  </div>
                  <p className={`stat-value font-semibold ${card.positive ? "text-brand" : "text-destructive"}`}>{card.value}</p>
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
              <CardTitle className="text-base flex items-center gap-1.5">
                Trading Type Distribution
                <InfoTip title="Trading Type Distribution">
                  <p>How your trades split between styles (scalping, intraday, swing, ...). Click a slice to list those trades.</p>
                </InfoTip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {typeDistribution.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No trades yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={typeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" stroke="hsl(var(--card))" strokeWidth={2} cursor="pointer" onClick={(d) => show(`${d.name} trades`, "Trading type", tradesOfType(String(d.name)))()}>
                        {typeDistribution.map((entry, index) => (
                          <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value} trades`, name]}
                        {...chartTooltip}
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
              <CardTitle className="text-base flex items-center gap-1.5">
                Market Distribution
                <InfoTip title="Market Distribution">
                  <p>How your trades split between markets (equity, options, forex, ...). Click a slice to list those trades.</p>
                </InfoTip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {marketDistribution.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No trades yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={marketDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" stroke="hsl(var(--card))" strokeWidth={2} cursor="pointer" onClick={(d) => show(`${d.name} trades`, "Market", tradesOfMarket(String(d.name)))()}>
                        {marketDistribution.map((entry, index) => (
                          <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value} trades`, name]}
                        {...chartTooltip}
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
              <CardTitle className="text-base flex items-center gap-1.5">
                P&L by Trading Type
                <InfoTip title="P&L by Trading Type">
                  <p>Total profit or loss for each trading style. It shows which style pays you. Click a bar to list its trades.</p>
                </InfoTip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pnlByType} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid {...chartGrid} />
                    <XAxis dataKey="type" tick={chartTick} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={chartTick} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), "P&L"]} {...chartTooltip} />
                    <Bar dataKey="pnl" radius={chartBarRadius} maxBarSize={chartMaxBarSize} cursor="pointer" onClick={(d) => { const t = (d as unknown as { payload: { type: string } }).payload.type; show(`${t} trades`, "Trading type", tradesOfType(t))(); }}>
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
              <CardTitle className="text-base flex items-center gap-1.5">
                P&L by Market
                <InfoTip title="P&L by Market">
                  <p>Total profit or loss for each market. Click a bar to list its trades.</p>
                </InfoTip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pnlByMarket} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid {...chartGrid} />
                    <XAxis dataKey="market" tick={chartTick} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={chartTick} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), "P&L"]} {...chartTooltip} />
                    <Bar dataKey="pnl" radius={chartBarRadius} maxBarSize={chartMaxBarSize} cursor="pointer" onClick={(d) => { const m = (d as unknown as { payload: { market: string } }).payload.market; show(`${m} trades`, "Market", tradesOfMarket(m))(); }}>
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
      <TradeDrilldown request={drill} onClose={() => setDrill(null)} />
    </JournalLayout>
  );
};

export default Summary;
