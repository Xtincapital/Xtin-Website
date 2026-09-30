// Journal Heatmaps — rewrite (not a port) of
// features-incoming/journal/app.js's `renderHeatmapsTab()` and its helpers
// (`populateHeatmapYearOptions`, `getHeatmapFilteredTrades`,
// `renderHeatmapMetrics`, `renderMonthlyHeatmap`, `renderDayOfWeekHeatmap`,
// `renderHourMarketHeatmap`, ~lines 4445-4789). The original rendered raw
// HTML strings of `.heatmap-cell` divs into `#monthlyHeatmapGrid` /
// `#weekdayHeatmapGrid` / `#hourMarketHeatmapGrid`; this reproduces the same
// three heatmap grids + summary metrics as real React state + shadcn
// `Card`/`Select`, colored with the ported `getHeatmapColor()` interpolation
// logic (see ../lib/journalPatternHelpers.ts) as inline `backgroundColor`
// styles on CSS-grid cells — a colored grid isn't a `recharts` chart type,
// so it's built directly rather than forced into that library, per this
// task's brief.
//
// Reproduced 1:1 (data/grouping logic, not pixel layout):
//   - Range filter (`getHeatmapFilteredTrades()`'s all-time / last-N-days
//     cutoff) feeding the metrics + all three heatmaps
//   - Year filter (`populateHeatmapYearOptions()` /
//     `renderMonthlyHeatmap()`'s extra year narrowing) — applies only to the
//     monthly heatmap, exactly like the original
//   - 4 summary metrics: Seasonality Champion (best month), Best Weekday,
//     Power Hour, Top Market Edge
//   - Monthly heatmap: 12 cells, P&L + trade count per calendar month
//   - Day-of-week x Session heatmap: 7 days x 4 global sessions
//     (Asia/Europe/Americas/Overnight, see GLOBAL_SESSIONS)
//   - Hour x Market heatmap: entry-hour rows x top-4-markets-plus-Other
//     columns
//
// Currency: see ../lib/journalPatternHelpers.ts's header comment — sums raw
// `trade.pnl` and formats with `useCurrency()` (`{ compact: true }` in place
// of the original's `formatCurrencyShort()`), same departure Dashboard.tsx
// already documents.
import { Fragment, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Flame, Sun, CalendarDays as CalendarIcon, Clock, LineChart as MarketIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/contexts/CurrencyContext";
import JournalLayout from "../components/JournalLayout";
import { trades as tradesApi, type Trade } from "../lib/api";
import {
  GLOBAL_SESSIONS,
  formatHourDisplay,
  getEntryHour,
  getHeatmapColor,
  getSessionLabelForTrade,
} from "../lib/journalPatternHelpers";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_MAP: Record<number, string> = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };
const FALLBACK_MARKETS = ["Equity", "Futures", "Options", "Commodities", "Forex", "Crypto_Currency"];

// Range-select options — the original's `#heatmapRangeSelect` (values
// consumed by `getHeatmapFilteredTrades()`'s `parseInt(rangeValue, 10)` day
// cutoff); the original's HTML for this select wasn't in the ported JS
// section, so these are a reasonable/common set of day-cutoffs matching that
// same "all" | days-as-string contract.
const RANGE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
  { value: "180", label: "Last 6 Months" },
  { value: "365", label: "Last Year" },
];

function isValidDate(d: Date): boolean {
  return !isNaN(d.getTime());
}

const Heatmaps = () => {
  const { formatCurrency } = useCurrency();
  const [range, setRange] = useState("all");
  const [year, setYear] = useState("all");

  // Pragmatic choice matching Dashboard.tsx: no dedicated aggregate
  // endpoint exists for pattern analysis, so this requests the largest
  // allowed page (200) and computes every heatmap client-side.
  const { data: tradesData, isLoading } = useQuery({
    queryKey: ["journal", "trades", "heatmaps"],
    queryFn: () => tradesApi.getTrades({ limit: 200, offset: 0 }),
  });
  const allTrades: Trade[] = tradesData?.data ?? [];

  // Port of populateHeatmapYearOptions() — years present across ALL trades
  // (unfiltered by range), used for the year <Select>.
  const years = useMemo(
    () =>
      Array.from(new Set(allTrades.map((t) => new Date(t.date).getFullYear()).filter((y) => !isNaN(y)))).sort(
        (a, b) => a - b,
      ),
    [allTrades],
  );

  // Port of getHeatmapFilteredTrades().
  const filteredTrades = useMemo(() => {
    if (range === "all") return allTrades;
    const days = parseInt(range, 10);
    if (isNaN(days)) return allTrades;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return allTrades.filter((trade) => new Date(trade.date) >= cutoff);
  }, [allTrades, range]);

  // Port of renderHeatmapMetrics().
  const metrics = useMemo(() => {
    if (filteredTrades.length === 0) return null;
    const monthTotals = new Array(12).fill(0);
    const weekdayTotals: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const hourTotals: Record<number, number> = {};
    const marketTotals: Record<string, number> = {};

    filteredTrades.forEach((trade) => {
      const date = new Date(trade.date);
      const pnl = trade.pnl ?? 0;
      if (isValidDate(date)) {
        monthTotals[date.getMonth()] += pnl;
        const weekdayLabel = DAY_MAP[date.getDay()];
        if (weekdayTotals[weekdayLabel] !== undefined) weekdayTotals[weekdayLabel] += pnl;
      }
      const hour = getEntryHour(trade.entry_time);
      if (hour !== null) hourTotals[hour] = (hourTotals[hour] ?? 0) + pnl;
      const marketKey = trade.market || "Other";
      marketTotals[marketKey] = (marketTotals[marketKey] ?? 0) + pnl;
    });

    const bestMonthIndex = monthTotals.reduce((bestIdx, value, idx, arr) => (value > arr[bestIdx] ? idx : bestIdx), 0);
    const bestWeekday = Object.entries(weekdayTotals).reduce(
      (best, current) => (current[1] > best[1] ? current : best),
      ["Mon", 0] as [string, number],
    );
    const bestHourEntry = Object.entries(hourTotals).sort((a, b) => b[1] - a[1])[0];
    const bestMarketEntry = Object.entries(marketTotals).sort((a, b) => b[1] - a[1])[0];

    return {
      seasonMonth: MONTH_NAMES[bestMonthIndex],
      seasonValue: monthTotals[bestMonthIndex],
      bestWeekdayLabel: bestWeekday[0],
      bestWeekdayValue: bestWeekday[1],
      bestHourLabel: bestHourEntry ? formatHourDisplay(parseInt(bestHourEntry[0], 10)) : "N/A",
      bestHourValue: bestHourEntry ? bestHourEntry[1] : 0,
      bestMarketLabel: bestMarketEntry ? bestMarketEntry[0] : "N/A",
      bestMarketValue: bestMarketEntry ? bestMarketEntry[1] : 0,
    };
  }, [filteredTrades]);

  // Port of renderMonthlyHeatmap() — the range-filtered dataset, further
  // narrowed by the year select (matches the original's two-stage filter).
  const monthlyStats = useMemo(() => {
    const dataset =
      year === "all" ? filteredTrades : filteredTrades.filter((t) => new Date(t.date).getFullYear() === parseInt(year, 10));
    const stats = Array.from({ length: 12 }, () => ({ pnl: 0, trades: 0 }));
    dataset.forEach((trade) => {
      const date = new Date(trade.date);
      if (isValidDate(date)) {
        stats[date.getMonth()].pnl += trade.pnl ?? 0;
        stats[date.getMonth()].trades += 1;
      }
    });
    return stats;
  }, [filteredTrades, year]);
  const monthlyMaxAbs = useMemo(() => Math.max(1, ...monthlyStats.map((s) => Math.abs(s.pnl))), [monthlyStats]);

  // Port of renderDayOfWeekHeatmap().
  const sessionLabels = useMemo(() => GLOBAL_SESSIONS.map((s) => s.label), []);
  const weekdayMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, { pnl: number; trades: number }>> = {};
    DAY_ORDER.forEach((day) => {
      matrix[day] = {};
      sessionLabels.forEach((s) => {
        matrix[day][s] = { pnl: 0, trades: 0 };
      });
    });
    filteredTrades.forEach((trade) => {
      const date = new Date(trade.date);
      if (!isValidDate(date)) return;
      const dayLabel = DAY_MAP[date.getDay()];
      const session = getSessionLabelForTrade(trade);
      if (matrix[dayLabel]?.[session]) {
        matrix[dayLabel][session].pnl += trade.pnl ?? 0;
        matrix[dayLabel][session].trades += 1;
      }
    });
    return matrix;
  }, [filteredTrades, sessionLabels]);
  const weekdayMaxAbs = useMemo(() => {
    const values = DAY_ORDER.flatMap((day) => sessionLabels.map((s) => Math.abs(weekdayMatrix[day][s].pnl)));
    return Math.max(1, ...values);
  }, [weekdayMatrix, sessionLabels]);

  // Port of renderHourMarketHeatmap().
  const hourMarketData = useMemo(() => {
    const marketCounts: Record<string, number> = {};
    filteredTrades.forEach((trade) => {
      const key = trade.market || "Other";
      marketCounts[key] = (marketCounts[key] ?? 0) + 1;
    });
    const sortedMarkets = Object.entries(marketCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k);
    const markets = (sortedMarkets.length > 0 ? sortedMarkets : FALLBACK_MARKETS).slice(0, 4);
    if (!markets.includes("Other")) markets.push("Other");

    const uniqueHours = Array.from(
      new Set(filteredTrades.map((t) => getEntryHour(t.entry_time)).filter((h): h is number => h !== null)),
    ).sort((a, b) => a - b);
    const hours = uniqueHours.length > 0 ? uniqueHours : [9, 10, 11, 12, 13, 14, 15];

    const matrix: Record<number, Record<string, { pnl: number; trades: number }>> = {};
    hours.forEach((hour) => {
      matrix[hour] = {};
      markets.forEach((m) => {
        matrix[hour][m] = { pnl: 0, trades: 0 };
      });
    });
    filteredTrades.forEach((trade) => {
      const hour = getEntryHour(trade.entry_time);
      const market = trade.market || "Other";
      if (hour === null || !matrix[hour]) return;
      const targetMarket = markets.includes(market) ? market : "Other";
      matrix[hour][targetMarket].pnl += trade.pnl ?? 0;
      matrix[hour][targetMarket].trades += 1;
    });
    return { markets, hours, matrix };
  }, [filteredTrades]);
  const hourMarketMaxAbs = useMemo(() => {
    const values = hourMarketData.hours.flatMap((hour) =>
      hourMarketData.markets.map((m) => Math.abs(hourMarketData.matrix[hour][m].pnl)),
    );
    return Math.max(1, ...values);
  }, [hourMarketData]);

  const shortCurrency = (v: number) => formatCurrency(v, { compact: true });

  return (
    <JournalLayout proFeature="Heatmaps">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
            <Flame className="w-6 h-6 text-primary" />
            Heatmaps
          </h1>
          <p className="text-muted-foreground">
            {isLoading ? "Loading your trading activity..." : "Spot seasonal, weekday, and time-of-day patterns in your P&L"}
          </p>
        </motion.div>

        {/* Range filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-6 w-full max-w-xs"
        >
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger>
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Summary metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {!metrics ? (
            <Card className="col-span-2 lg:col-span-4">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Add more trades to unlock heatmap insights.
              </CardContent>
            </Card>
          ) : (
            <>
              <MetricCard
                icon={Sun}
                label="Seasonality Champion"
                value={metrics.seasonMonth}
                sub={shortCurrency(metrics.seasonValue)}
                positive={metrics.seasonValue >= 0}
              />
              <MetricCard
                icon={CalendarIcon}
                label="Best Weekday"
                value={metrics.bestWeekdayLabel}
                sub={shortCurrency(metrics.bestWeekdayValue)}
                positive={metrics.bestWeekdayValue >= 0}
              />
              <MetricCard
                icon={Clock}
                label="Power Hour"
                value={metrics.bestHourLabel}
                sub={shortCurrency(metrics.bestHourValue)}
                positive={metrics.bestHourValue >= 0}
              />
              <MetricCard
                icon={MarketIcon}
                label="Top Market Edge"
                value={metrics.bestMarketLabel}
                sub={shortCurrency(metrics.bestMarketValue)}
                positive={metrics.bestMarketValue >= 0}
              />
            </>
          )}
        </motion.div>

        {/* Monthly heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Monthly Heatmap</CardTitle>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {monthlyStats.map((stat, idx) => (
                  <div
                    key={MONTH_NAMES[idx]}
                    className="rounded-lg p-3 flex flex-col items-center justify-center text-center min-h-[84px]"
                    style={{ backgroundColor: getHeatmapColor(stat.pnl, monthlyMaxAbs) }}
                    title={`${MONTH_NAMES[idx]} • ${stat.trades} trade${stat.trades === 1 ? "" : "s"}\nP&L: ${shortCurrency(stat.pnl)}`}
                  >
                    <span className="text-xs font-semibold text-black/70">{MONTH_NAMES[idx]}</span>
                    <strong className="text-sm text-black/90">{shortCurrency(stat.pnl)}</strong>
                    <span className="text-[10px] text-black/60">
                      {stat.trades} trade{stat.trades === 1 ? "" : "s"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Day of week x Session heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Day of Week x Session</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No trades in selected range.</p>
              ) : (
                <div className="overflow-x-auto">
                  <div
                    className="grid gap-2 min-w-[640px]"
                    style={{ gridTemplateColumns: `100px repeat(${sessionLabels.length}, minmax(120px, 1fr))` }}
                  >
                    <div />
                    {sessionLabels.map((s) => (
                      <div key={s} className="text-[11px] font-semibold text-muted-foreground text-center px-1">
                        {s}
                      </div>
                    ))}
                    {DAY_ORDER.map((day) => (
                      <Fragment key={day}>
                        <div className="text-sm font-semibold text-foreground flex items-center">{day}</div>
                        {sessionLabels.map((session) => {
                          const stat = weekdayMatrix[day][session];
                          return (
                            <div
                              key={`${day}-${session}`}
                              className="rounded-lg p-2 flex flex-col items-center justify-center text-center min-h-[64px]"
                              style={{ backgroundColor: getHeatmapColor(stat.pnl, weekdayMaxAbs) }}
                              title={`${day} • ${session}\nP&L: ${shortCurrency(stat.pnl)}\nTrades: ${stat.trades}`}
                            >
                              <strong className="text-sm text-black/90">{stat.trades}</strong>
                              <span className="text-[10px] text-black/60">{shortCurrency(stat.pnl)}</span>
                            </div>
                          );
                        })}
                      </Fragment>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Hour x Market heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hour x Market</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No trades in selected range.</p>
              ) : (
                <div className="overflow-x-auto">
                  <div
                    className="grid gap-2 min-w-[640px]"
                    style={{ gridTemplateColumns: `100px repeat(${hourMarketData.markets.length}, minmax(120px, 1fr))` }}
                  >
                    <div />
                    {hourMarketData.markets.map((m) => (
                      <div key={m} className="text-[11px] font-semibold text-muted-foreground text-center px-1 truncate">
                        {m}
                      </div>
                    ))}
                    {hourMarketData.hours.map((hour) => (
                      <Fragment key={hour}>
                        <div className="text-sm font-semibold text-foreground flex items-center whitespace-nowrap">
                          {formatHourDisplay(hour)}
                        </div>
                        {hourMarketData.markets.map((market) => {
                          const stat = hourMarketData.matrix[hour][market];
                          return (
                            <div
                              key={`${hour}-${market}`}
                              className="rounded-lg p-2 flex flex-col items-center justify-center text-center min-h-[64px]"
                              style={{ backgroundColor: getHeatmapColor(stat.pnl, hourMarketMaxAbs) }}
                              title={`${formatHourDisplay(hour)} • ${market}\nP&L: ${shortCurrency(stat.pnl)}\nTrades: ${stat.trades}`}
                            >
                              <strong className="text-sm text-black/90">{stat.trades}</strong>
                              <span className="text-[10px] text-black/60">{shortCurrency(stat.pnl)}</span>
                            </div>
                          );
                        })}
                      </Fragment>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </JournalLayout>
  );
};

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  positive,
}: {
  icon: typeof Sun;
  label: string;
  value: string;
  sub: string;
  positive: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <p className={`text-xl font-bold ${positive ? "text-success" : "text-destructive"}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

export default Heatmaps;
