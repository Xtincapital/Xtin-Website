// Journal Monthly View — rewrite (not a port) of
// features-incoming/journal/app.js's `updateMonthlyView()` (~lines
// 2834-2872). The original read a month/year `<select>` pair, filtered
// `trades` to that single month, ran them through `calculateMetrics()`, and
// rendered four metric cards (`#monthlyMetrics`) plus two Chart.js pie
// charts (`monthlyTypeChart` = trade-type distribution, `monthlyMarketChart`
// = market distribution) via `renderPieChart()`. This reproduces the same
// single-month breakdown as real React state + shadcn `Card`s + `recharts`.
//
// NOTE on the task brief's guess at this page's shape ("likely a table of
// months with P&L/win-rate per month"): reading `updateMonthlyView()` shows
// it is NOT a multi-month table — it's a single selected month's metrics
// (month/year picker), same shape as Daily.tsx's single-day view. This
// reproduces the actual original behavior rather than the guessed one, per
// this task's instruction to read the function fully.
//
// Calculations reproduced 1:1 from updateMonthlyView():
//   - Filter trades to the selected month+year
//   - Metrics: total trades, total P&L, wins/losses, win rate (same trimmed
//     `calculateMetrics()` subset Dashboard.tsx already uses — the
//     Sharpe/Sortino/Kelly/etc. fields from the original's full
//     `calculateMetrics()` belong on the Analytics page, not here)
//   - Type distribution and market distribution pie charts
//
// Deliberate departures, same reasoning as Dashboard.tsx/Calendar.tsx:
//   1. Currency: sums raw `pnl` as-is (see those files' header comments for
//      why a true multi-currency conversion is out of scope here).
//   2. Type/market distribution: the original iterated two hardcoded lists
//      (`tradingTypes`, `tradeMarkets`) and counted matches, including
//      types/markets with zero trades that month. This instead groups by
//      whatever distinct `type`/`market` values actually appear on the
//      month's trades (skipping the empty categories a live account may
//      not use), which better matches the free-text `type`/`market`
//      columns on the real `Trade` row (services/api's validator doesn't
//      constrain them to a fixed enum) than replaying the original's
//      hardcoded lists would.
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarRange } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import JournalLayout from "../components/JournalLayout";
import { getAllTrades, type Trade } from "../lib/api";
import { marketLabel } from "../lib/journalPatternHelpers";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const PIE_COLORS = [
  "hsl(var(--chart-positive))",
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--chart-negative))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))",
];

// Trimmed calculateMetrics() subset — matches Dashboard.tsx's own local
// copy (see that file's header comment for why only this subset is kept).
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

function distributionOf(list: Trade[], field: "type" | "market"): { name: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const t of list) {
    const key = t[field];
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([name, value]) => ({ name: field === "market" ? marketLabel(name) : name, value }));
}

const Monthly = () => {
  const { formatCurrency } = useCurrency();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  // Same pragmatic largest-page approach as Dashboard.tsx/Calendar.tsx.
  const { data: tradesData, isLoading } = useQuery({
    queryKey: ["journal", "trades", "monthly"],
    queryFn: () => getAllTrades(),
  });

  const allTrades = tradesData?.data ?? [];

  const { monthlyTrades, metrics, typeDistribution, marketDistribution } = useMemo(() => {
    const monthlyTrades = allTrades.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    return {
      monthlyTrades,
      metrics: calculateMetrics(monthlyTrades),
      typeDistribution: distributionOf(monthlyTrades, "type"),
      marketDistribution: distributionOf(monthlyTrades, "market"),
    };
  }, [allTrades, month, year]);

  const changeMonth = (direction: 1 | -1) => {
    let m = month + direction;
    let y = year;
    if (m > 11) {
      m = 0;
      y++;
    } else if (m < 0) {
      m = 11;
      y--;
    }
    setMonth(m);
    setYear(y);
  };

  const metricCards = [
    { label: "Monthly Trades", value: metrics.totalTrades.toLocaleString() },
    {
      label: "Monthly P&L",
      value: formatCurrency(metrics.totalPnL),
      className: metrics.totalPnL >= 0 ? "text-success" : "text-destructive",
    },
    { label: "Wins / Losses", value: `${metrics.wins} / ${metrics.losses}` },
    { label: "Win Rate", value: `${metrics.winRate.toFixed(2)}%`, className: "text-success" },
  ];

  const renderPie = (data: { name: string; value: number }[], emptyLabel: string) =>
    data.length === 0 ? (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">{emptyLabel}</div>
    ) : (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" stroke="none">
              {data.map((entry, index) => (
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
    );

  return (
    <JournalLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Monthly View</h1>
          <p className="text-muted-foreground">
            {isLoading ? "Loading your trading activity..." : `${monthlyTrades.length} trades in ${MONTH_NAMES[month]} ${year}`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-2 text-lg font-bold text-foreground">
            <CalendarRange className="w-4 h-4 text-primary" />
            {MONTH_NAMES[month]} {year}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => changeMonth(-1)} aria-label="Previous month">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => changeMonth(1)} aria-label="Next month">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
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
          transition={{ duration: 0.4, delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>{renderPie(typeDistribution, "No trades this month")}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Market Distribution</CardTitle>
            </CardHeader>
            <CardContent>{renderPie(marketDistribution, "No trades this month")}</CardContent>
          </Card>
        </motion.div>
      </div>
    </JournalLayout>
  );
};

export default Monthly;
