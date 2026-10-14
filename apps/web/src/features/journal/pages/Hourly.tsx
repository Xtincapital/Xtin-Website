// Journal Hourly Analysis — rewrite (not a port) of
// features-incoming/journal/app.js's `renderHourlyAnalysis()`
// (~lines 4152-4441). The original rendered 4 Chart.js charts (hourly P&L
// bar, trade-count line, session-performance doughnut, win-rate-by-hour
// line) plus a metrics strip and an HTML table into fixed DOM ids; this
// reproduces the same 4 charts with `recharts` (matching Dashboard.tsx's
// convention) + shadcn `Card`/`Table`/`Badge`.
//
// Reproduced 1:1 (data/grouping logic, not pixel layout):
//   - 24 hourly buckets (trades/totalPnL/wins/losses per entry hour)
//   - Session bucketing via GLOBAL_SESSIONS / getSessionLabelForTrade
//     (shared with Heatmaps.tsx, see ../lib/journalPatternHelpers.ts)
//   - Best Hour / Active Session (most-traded session) / Avg Trade Duration
//     / Peak Time metrics
//   - Hourly P&L, Trade Count, Session Performance (P&L split), and
//     Win Rate by Hour charts
//   - Hourly breakdown table: trades, total/avg P&L, win rate, best
//     strategy (by trade count) per hour, and a Good/Poor performance badge
//
// Currency: see ../lib/journalPatternHelpers.ts's header comment — sums raw
// `trade.pnl` and formats with `useCurrency()`, same departure Dashboard.tsx
// already documents (no INR-normalization of mixed-currency trades).
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartGrid, chartTick, chartBarRadius, chartMaxBarSize, chartActiveDot, chartTooltip } from "@/components/charts/chartTheme";
import { Clock, Activity, Timer, Target as PeakIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrency } from "@/contexts/CurrencyContext";
import InfoTip from "@/components/ui/info-tip";
import TradeDrilldown, { type DrilldownRequest } from "../components/TradeDrilldown";
import JournalLayout from "../components/JournalLayout";
import { type Trade } from "../lib/api";
import { getAllTradesInInr } from "../lib/tradesInInr";
import {
  GLOBAL_SESSIONS,
  formatHourDisplay,
  formatHourRange,
  getEntryHour,
  getSessionLabelForTrade,
  normalizeStrategyName,
} from "../lib/journalPatternHelpers";

interface HourBucket {
  hour: number;
  trades: Trade[];
  totalPnL: number;
  wins: number;
  losses: number;
}

const SESSION_COLORS = ["rgba(205, 170, 95, 0.8)", "rgba(31, 169, 120, 0.8)", "rgba(90, 119, 170, 0.8)", "rgba(143, 111, 196, 0.8)"];

const Hourly = () => {
  const { formatInr: formatCurrency } = useCurrency();
  const [drill, setDrill] = useState<DrilldownRequest | null>(null);

  // Same pragmatic full-history fetch as Dashboard.tsx / Heatmaps.tsx — no
  // dedicated aggregate endpoint exists yet for hourly/session analysis.
  const { data: tradesData, isLoading } = useQuery({
    queryKey: ["journal", "trades", "hourly"],
    queryFn: () => getAllTradesInInr(),
  });
  const allTrades: Trade[] = tradesData?.data ?? [];

  // Port of renderHourlyAnalysis()'s 24h bucket + session bucket build-up.
  const { hourBuckets, sessions } = useMemo(() => {
    const buckets: HourBucket[] = Array.from({ length: 24 }, (_, hour) => ({ hour, trades: [], totalPnL: 0, wins: 0, losses: 0 }));
    const sessionMap: Record<string, Trade[]> = {};
    GLOBAL_SESSIONS.forEach((s) => {
      sessionMap[s.label] = [];
    });

    allTrades.forEach((trade) => {
      const entryHour = getEntryHour(trade.entry_time);
      const pnl = trade.pnl ?? 0;
      if (entryHour !== null) {
        const bucket = buckets[entryHour];
        bucket.trades.push(trade);
        bucket.totalPnL += pnl;
        if (pnl > 0) bucket.wins++;
        else if (pnl < 0) bucket.losses++;
      }
      // A trade with no entry time has no session; filing it under the first one skewed "Active Session".
      if (entryHour !== null) {
        const sessionLabel = getSessionLabelForTrade(trade);
        if (sessionMap[sessionLabel]) sessionMap[sessionLabel].push(trade);
      }
    });

    return { hourBuckets: buckets, sessions: sessionMap };
  }, [allTrades]);

  // Best hour, active (most-traded) session, avg duration, peak time.
  const summary = useMemo(() => {
    const bestBucket = hourBuckets.reduce<HourBucket | null>((best, current) => {
      if (current.trades.length === 0) return best; // an empty hour can't be the best hour
      if (!best) return current;
      return current.totalPnL > best.totalPnL ? current : best;
    }, null);

    let activeSession = "--";
    let maxTrades = 0;
    Object.entries(sessions).forEach(([session, sessionTrades]) => {
      if (sessionTrades.length > maxTrades) {
        maxTrades = sessionTrades.length;
        activeSession = session;
      }
    });

    let totalDuration = 0;
    let durationCount = 0;
    allTrades.forEach((trade) => {
      if (!trade.entry_time || !trade.exit_time) return;
      const entry = new Date(`2000-01-01T${trade.entry_time}`);
      const exit = new Date(`2000-01-01T${trade.exit_time}`);
      const duration = (exit.getTime() - entry.getTime()) / (1000 * 60 * 60);
      if (duration > 0 && duration < 24) {
        totalDuration += duration;
        durationCount++;
      }
    });
    const avgDuration = durationCount > 0 ? totalDuration / durationCount : 0;

    return {
      bestHour: bestBucket ? bestBucket.hour : null,
      bestPnL: bestBucket ? bestBucket.totalPnL : 0,
      activeSession,
      avgDuration,
    };
  }, [hourBuckets, sessions, allTrades]);

  // Chart data.
  const hourChartData = useMemo(
    () =>
      hourBuckets.map((b) => {
        const total = b.wins + b.losses;
        return {
          hour: b.hour,
          label: formatHourDisplay(b.hour),
          pnl: b.totalPnL,
          tradeCount: b.trades.length,
          winRate: total > 0 ? (b.wins / total) * 100 : 0,
        };
      }),
    [hourBuckets],
  );

  const sessionChartData = useMemo(
    () =>
      Object.entries(sessions).map(([label, sessionTrades]) => ({
        label,
        pnl: sessionTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0),
        trades: sessionTrades.length,
      })),
    [sessions],
  );

  const shortCurrency = (v: number) => formatCurrency(v, { compact: true });

  const showHour = (hour: number) => {
    const bucket = hourBuckets[hour];
    if (bucket?.trades.length) setDrill({ title: `Trades entered at ${formatHourDisplay(hour)}`, subtitle: "Hourly analysis", trades: bucket.trades });
  };
  const showSession = (label: string) => {
    const list = sessions[label] ?? [];
    if (list.length) setDrill({ title: `${label} session`, subtitle: "Trades entered during this session", trades: list });
  };

  const metricCards: { label: string; info: string; value: string; icon: typeof Clock; onClick?: () => void }[] = [
    {
      label: "Best Hour",
      info: "The hour of the day (by entry time) in which your trades earned the most in total.",
      value: summary.bestHour !== null ? `${formatHourDisplay(summary.bestHour)} (${shortCurrency(summary.bestPnL)})` : "--",
      icon: Clock,
      onClick: summary.bestHour !== null ? () => showHour(summary.bestHour as number) : undefined,
    },
    {
      label: "Active Session",
      info: "The market session in which you place the most trades: Asia, Europe, Americas or Overnight, based on your time zone and entry time.",
      value: summary.activeSession,
      icon: Activity,
      onClick: summary.activeSession !== "--" ? () => showSession(summary.activeSession) : undefined,
    },
    {
      label: "Avg Duration",
      info: "How long a typical trade lasts, from entry time to exit time on the same day. Only trades with both times are counted.",
      value: `${summary.avgDuration.toFixed(1)} hrs`,
      icon: Timer,
    },
    {
      label: "Peak Time",
      info: "The one-hour window around your Best Hour. This is when you tend to trade best.",
      value: summary.bestHour !== null ? formatHourRange(summary.bestHour) : "--",
      icon: PeakIcon,
      onClick: summary.bestHour !== null ? () => showHour(summary.bestHour as number) : undefined,
    },
  ];

  return (
    <JournalLayout proFeature="Hourly analysis">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="xt-title mb-2 flex items-center gap-3">
            <Clock className="w-6 h-6 text-primary" />
            Hourly Analysis
            <InfoTip title="Hourly analysis" widthClass="w-80">
              <p>Shows how you do at different times of the day, using the entry time of each trade. Many traders find they make most of their money in one or two hours and give it back at other times.</p>
              <p>Trades without an entry time are left out.</p>
              <p><strong className="text-foreground">Click</strong> a card, bar, session or table row to see the trades behind it.</p>
            </InfoTip>
          </h1>
          <p className="text-muted-foreground">
            {isLoading ? "Loading your trading activity..." : "Performance broken down by hour of day and trading session"}
          </p>
        </motion.div>

        {/* Metric cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {metricCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    {card.label}
                    <InfoTip title={card.label}>
                      <p>{card.info}</p>
                      {card.onClick && <p>Click the value to see the trades.</p>}
                    </InfoTip>
                  </p>
                  <card.icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                {card.onClick ? (
                  <button type="button" onClick={card.onClick} className="text-left cursor-pointer hover:underline">
                    <p className="stat-value font-semibold text-foreground">{card.value}</p>
                  </button>
                ) : (
                  <p className="stat-value font-semibold text-foreground">{card.value}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Hourly P&L + Trade Count charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-1.5">
                Hourly P&L
                <InfoTip title="Hourly P&L">
                  <p>Total profit or loss for trades entered in each hour. Green bars are profitable hours, red bars are losing hours. Click a bar to list its trades.</p>
                </InfoTip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid {...chartGrid} />
                    <XAxis
                      dataKey="label"
                      tick={chartTick}
                      axisLine={false}
                      tickLine={false}
                      interval={2}
                    />
                    <YAxis
                      tick={chartTick}
                      axisLine={false}
                      tickLine={false}
                      width={56}
                      tickFormatter={(v) => shortCurrency(v)}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "P&L"]}
                      {...chartTooltip}
                    />
                    <Bar dataKey="pnl" radius={chartBarRadius} maxBarSize={chartMaxBarSize} cursor="pointer" onClick={(d) => showHour((d as unknown as { payload: { hour: number } }).payload.hour)}>
                      {hourChartData.map((d) => (
                        <Cell key={d.hour} fill={d.pnl >= 0 ? "hsl(var(--chart-positive))" : "hsl(var(--destructive))"} />
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
                Trade Count by Hour
                <InfoTip title="Trade Count by Hour">
                  <p>How many trades you entered in each hour. Compare it with Hourly P&L: do you trade the most when you earn the least?</p>
                </InfoTip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid {...chartGrid} />
                    <XAxis
                      dataKey="label"
                      tick={chartTick}
                      axisLine={false}
                      tickLine={false}
                      interval={2}
                    />
                    <YAxis
                      tick={chartTick}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(value: number) => [value, "Trades"]}
                      {...chartTooltip}
                    />
                    <Line
                      type="monotone"
                      dataKey="tradeCount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={chartActiveDot}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Session Performance + Win Rate by Hour charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-1.5">
                Session Performance
                <InfoTip title="Session Performance">
                  <p>Total P&L per market session (Asia, Europe, Americas, Overnight). Click a session name on the right to list its trades.</p>
                </InfoTip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center gap-4">
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sessionChartData}
                        dataKey={(d) => Math.abs(d.pnl)}
                        nameKey="label"
                        innerRadius="55%"
                        outerRadius="90%"
                        stroke="hsl(var(--card))"
                        strokeWidth={2}
                      >
                        {sessionChartData.map((entry, index) => (
                          <Cell key={entry.label} fill={SESSION_COLORS[index % SESSION_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(_value: number, _name: string, ctx: any) => [formatCurrency(ctx?.payload?.pnl ?? 0), ctx?.payload?.label]}
                        {...chartTooltip}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-2">
                  {sessionChartData.map((s, i) => (
                    <button type="button" key={s.label} onClick={() => showSession(s.label)} className="flex w-full items-center gap-2 text-xs text-left cursor-pointer hover:underline" title="Click to see these trades">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: SESSION_COLORS[i % SESSION_COLORS.length] }} />
                      <span className="text-muted-foreground truncate">{s.label}</span>
                      <span className={`ml-auto font-semibold ${s.pnl >= 0 ? "text-success" : "text-destructive"}`}>
                        {shortCurrency(s.pnl)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-1.5">
                Win Rate by Hour
                <InfoTip title="Win Rate by Hour">
                  <p>The share of winning trades among trades that ended in a win or a loss, for each hour. Above 50% means more winners than losers.</p>
                </InfoTip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid {...chartGrid} />
                    <XAxis
                      dataKey="label"
                      tick={chartTick}
                      axisLine={false}
                      tickLine={false}
                      interval={2}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={chartTick}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}%`, "Win Rate"]}
                      {...chartTooltip}
                    />
                    <Line
                      type="monotone"
                      dataKey="winRate"
                      stroke="hsl(var(--chart-positive))"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={chartActiveDot}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hourly breakdown table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-1.5">
                Hourly Breakdown
                <InfoTip title="Hourly Breakdown">
                  <p>A table of every hour of the day: number of trades, total and average P&L, win rate and your most-used strategy. Click a row to list its trades.</p>
                </InfoTip>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hour</TableHead>
                    <TableHead>Trades</TableHead>
                    <TableHead>Total P&L</TableHead>
                    <TableHead>Avg P&L</TableHead>
                    <TableHead>Win Rate</TableHead>
                    <TableHead>Best Strategy</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hourBuckets.map((bucket) => {
                    const avgPnL = bucket.trades.length > 0 ? bucket.totalPnL / bucket.trades.length : 0;
                    const totalDecided = bucket.wins + bucket.losses;
                    const winRate = totalDecided > 0 ? (bucket.wins / totalDecided) * 100 : 0;

                    const strategyCount: Record<string, number> = {};
                    bucket.trades.forEach((t) => {
                      const key = normalizeStrategyName(t.strategy) || "N/A";
                      strategyCount[key] = (strategyCount[key] ?? 0) + 1;
                    });
                    const strategyKeys = Object.keys(strategyCount);
                    const bestStrategy =
                      strategyKeys.length > 0
                        ? strategyKeys.reduce((a, b) => (strategyCount[a] > strategyCount[b] ? a : b))
                        : "-";

                    const positive = bucket.totalPnL >= 0;

                    return (
                      <TableRow
                        key={bucket.hour}
                        className={bucket.trades.length ? "cursor-pointer" : undefined}
                        onClick={() => showHour(bucket.hour)}
                      >
                        <TableCell className="font-medium">{formatHourDisplay(bucket.hour)}</TableCell>
                        <TableCell>{bucket.trades.length}</TableCell>
                        <TableCell className={positive ? "text-success" : "text-destructive"}>{formatCurrency(bucket.totalPnL)}</TableCell>
                        <TableCell className={positive ? "text-success" : "text-destructive"}>{formatCurrency(avgPnL)}</TableCell>
                        <TableCell>{winRate.toFixed(1)}%</TableCell>
                        <TableCell className="max-w-[140px] truncate">{bestStrategy}</TableCell>
                        <TableCell>
                          <Badge variant={positive ? "default" : "destructive"}>{positive ? "Good" : "Poor"}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <TradeDrilldown request={drill} onClose={() => setDrill(null)} />
    </JournalLayout>
  );
};

export default Hourly;
