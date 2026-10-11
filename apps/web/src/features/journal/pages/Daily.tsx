// Journal Daily View — rewrite (not a port) of
// features-incoming/journal/app.js's `updateDailyView()` (~lines
// 2879-2915). The original read a `<input type="date">` (`dailyDateSelector`),
// filtered `trades` to that exact date, ran them through `calculateMetrics()`,
// and rendered four metric cards (`#dailyMetrics`) plus a Chart.js pie chart
// (`dailyTypeChart` = trade-type distribution) and a Chart.js bar chart
// (`dailyStrategyChart` = P&L per strategy, via `renderBarChart(..., true)`
// i.e. horizontal). This reproduces the same single-day breakdown as real
// React state + shadcn `Card`s + `recharts`.
//
// Calculations reproduced 1:1 from updateDailyView():
//   - Filter trades to the exact selected date (`trade.date === selectedDate`)
//   - Metrics: total trades, total P&L, wins/losses, win rate (same trimmed
//     `calculateMetrics()` subset Dashboard.tsx/Monthly.tsx already use)
//   - Type distribution pie chart
//   - Per-strategy P&L bar chart (horizontal, matching the original's
//     `renderBarChart(..., isHorizontal=true)` call)
//
// Deliberate departures, same reasoning as Dashboard.tsx/Calendar.tsx/Monthly.tsx:
//   1. Currency: sums raw `pnl` as-is rather than converting every trade to
//      a common INR base via `getTradePnlInINR()` (see those files' header
//      comments for why a true multi-currency conversion is out of scope
//      here).
//   2. Strategy P&L: the original iterated `getStrategyOptions()` (default +
//      custom + every strategy name ever used, normalized/deduped) and
//      matched trades with `strategyMatches()` (case-insensitive normalized
//      comparison). This instead groups by the exact distinct `strategy`
//      string present on the day's trades — equivalent for a single day's
//      data (there's nothing to normalize away when every trade's raw value
//      is used directly as its own bucket key) without needing to port the
//      original's normalization helpers, which live outside the ported
//      functions and aren't available here.
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarClock } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCurrency } from "@/contexts/CurrencyContext";
import JournalLayout from "../components/JournalLayout";
import { type Trade } from "../lib/api";
import { getAllTradesInInr } from "../lib/tradesInInr";

const PIE_COLORS = [
  "hsl(var(--chart-positive))",
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--chart-negative))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))",
];

// Trimmed calculateMetrics() subset — matches Dashboard.tsx/Monthly.tsx's
// own local copy (see those files' header comments for why only this
// subset is kept here).
interface Metrics {
  totalTrades: number;
  totalPnL: number;
  winRate: number;
  wins: number;
  losses: number;
}

function calculateMetrics(list: Trade[]): Metrics {
  const totalTrades = list.length;
  // Trades without a P&L (still open) are not wins or losses, so they stay out of every rate and average.
  const closed = list.filter((t) => t.pnl != null);
  const totalPnL = list.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const wins = closed.filter((t) => (t.pnl ?? 0) > 0);
  const losses = closed.filter((t) => (t.pnl ?? 0) < 0);
  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
  return { totalTrades, totalPnL, winRate, wins: wins.length, losses: losses.length };
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

const Daily = () => {
  const { formatInr: formatCurrency } = useCurrency();
  const [selectedDate, setSelectedDate] = useState(todayStr());

  // Same pragmatic largest-page approach as Dashboard.tsx/Calendar.tsx/Monthly.tsx.
  const { data: tradesData, isLoading } = useQuery({
    queryKey: ["journal", "trades", "daily"],
    queryFn: () => getAllTradesInInr(),
  });

  const allTrades = tradesData?.data ?? [];

  const { dailyTrades, metrics, typeDistribution, strategyPnL } = useMemo(() => {
    const dailyTrades = allTrades.filter((t) => t.date === selectedDate);

    const typeCounts = new Map<string, number>();
    for (const t of dailyTrades) {
      if (!t.type) continue;
      typeCounts.set(t.type, (typeCounts.get(t.type) ?? 0) + 1);
    }
    const typeDistribution = Array.from(typeCounts.entries()).map(([name, value]) => ({ name, value }));

    const strategyTotals = new Map<string, number>();
    for (const t of dailyTrades) {
      const key = t.strategy || "Unspecified";
      strategyTotals.set(key, (strategyTotals.get(key) ?? 0) + (t.pnl ?? 0));
    }
    const strategyPnL = Array.from(strategyTotals.entries()).map(([strategy, pnl]) => ({ strategy, pnl }));

    return { dailyTrades, metrics: calculateMetrics(dailyTrades), typeDistribution, strategyPnL };
  }, [allTrades, selectedDate]);

  const metricCards = [
    { label: "Daily Trades", value: metrics.totalTrades.toLocaleString() },
    {
      label: "Daily P&L",
      value: formatCurrency(metrics.totalPnL),
      className: metrics.totalPnL >= 0 ? "text-success" : "text-destructive",
    },
    { label: "Wins / Losses", value: `${metrics.wins} / ${metrics.losses}` },
    { label: "Win Rate", value: `${metrics.winRate.toFixed(2)}%`, className: "text-success" },
  ];

  return (
    <JournalLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Daily View</h1>
            <p className="text-muted-foreground">
              {isLoading ? "Loading your trading activity..." : `${dailyTrades.length} trades on ${selectedDate}`}
            </p>
          </div>
          <div className="flex items-center gap-2 max-w-[220px]">
            <CalendarClock className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4 mb-8"
        >
          {metricCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <p className="text-xs font-medium text-muted-foreground mb-2">{card.label}</p>
                <p className={`stat-value font-bold ${card.className ?? "text-foreground"}`}>{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {typeDistribution.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">No trades this day</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={typeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" stroke="none">
                        {typeDistribution.map((entry, index) => (
                          <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value} trade${value === 1 ? "" : "s"}`, name]}
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Strategy Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {strategyPnL.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">No trades this day</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={strategyPnL} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={false}
                        tickFormatter={(v) => formatCurrency(v, { compact: true })}
                      />
                      <YAxis
                        type="category"
                        dataKey="strategy"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        width={100}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), "P&L"]}
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                        {strategyPnL.map((entry) => (
                          <Cell
                            key={entry.strategy}
                            fill={entry.pnl >= 0 ? "hsl(var(--chart-positive))" : "hsl(var(--chart-negative))"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </JournalLayout>
  );
};

export default Daily;
