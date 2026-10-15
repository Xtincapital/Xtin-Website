// Journal Heatmaps — rewrite (not a port) of
// features-incoming/journal/app.js's `renderHeatmapsTab()` and its helpers
// (`populateHeatmapYearOptions`, `getHeatmapFilteredTrades`,
// `renderHeatmapMetrics`, `renderMonthlyHeatmap`, `renderDayOfWeekHeatmap`,
// `renderHourMarketHeatmap`, ~lines 4445-4789). The original rendered raw
// HTML strings of `.heatmap-cell` divs into `#monthlyHeatmapGrid` /
// `#weekdayHeatmapGrid` / `#hourMarketHeatmapGrid`; this reproduces the same
// three heatmap grids + summary metrics as real React state + shadcn
// `Card`/`Select`, colored with the Journal heat scale (components/HeatCell.tsx)
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
import InfoTip from "@/components/ui/info-tip";
import TradeDrilldown, { type DrilldownRequest } from "../components/TradeDrilldown";
import StatCard from "../components/StatCard";
import HeatCell, { HeatLegend } from "../components/HeatCell";
import { signedMoney } from "../lib/format";
import JournalLayout from "../components/JournalLayout";
import { type Trade } from "../lib/api";
import { getAllTradesInInr } from "../lib/tradesInInr";
import {
  GLOBAL_SESSIONS,
  formatHourDisplay,
  getEntryHour,
  getSessionLabelForTrade,
  marketLabel,
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
  const { formatInr: formatCurrency } = useCurrency();
  const [range, setRange] = useState("all");
  const [year, setYear] = useState("all");
  const [drill, setDrill] = useState<DrilldownRequest | null>(null);

  // Pragmatic choice matching Dashboard.tsx: no dedicated aggregate
  // endpoint exists for pattern analysis, so this requests the largest
  // allowed page (200) and computes every heatmap client-side.
  const { data: tradesData, isLoading } = useQuery({
    queryKey: ["journal", "trades", "heatmaps"],
    queryFn: () => getAllTradesInInr(),
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
      seasonIndex: bestMonthIndex,
      bestHourKey: bestHourEntry ? parseInt(bestHourEntry[0], 10) : null,
      bestMarketKey: bestMarketEntry ? bestMarketEntry[0] : null,
      seasonMonth: MONTH_NAMES[bestMonthIndex],
      seasonValue: monthTotals[bestMonthIndex],
      bestWeekdayLabel: bestWeekday[0],
      bestWeekdayValue: bestWeekday[1],
      bestHourLabel: bestHourEntry ? formatHourDisplay(parseInt(bestHourEntry[0], 10)) : "N/A",
      bestHourValue: bestHourEntry ? bestHourEntry[1] : 0,
      bestMarketLabel: bestMarketEntry ? marketLabel(bestMarketEntry[0]) : "N/A",
      bestMarketValue: bestMarketEntry ? bestMarketEntry[1] : 0,
    };
  }, [filteredTrades]);

  // Port of renderMonthlyHeatmap() — the range-filtered dataset, further
  // narrowed by the year select (matches the original's two-stage filter).
  const monthlyStats = useMemo(() => {
    const dataset =
      year === "all" ? filteredTrades : filteredTrades.filter((t) => new Date(t.date).getFullYear() === parseInt(year, 10));
    const stats = Array.from({ length: 12 }, () => ({ pnl: 0, trades: 0, list: [] as Trade[] }));
    dataset.forEach((trade) => {
      const date = new Date(trade.date);
      if (isValidDate(date)) {
        stats[date.getMonth()].pnl += trade.pnl ?? 0;
        stats[date.getMonth()].trades += 1;
        stats[date.getMonth()].list.push(trade);
      }
    });
    return stats;
  }, [filteredTrades, year]);
  const monthlyMaxAbs = useMemo(() => Math.max(1, ...monthlyStats.map((s) => Math.abs(s.pnl))), [monthlyStats]);

  // Port of renderDayOfWeekHeatmap().
  const sessionLabels = useMemo(() => GLOBAL_SESSIONS.map((s) => s.label), []);
  const weekdayMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, { pnl: number; trades: number; list: Trade[] }>> = {};
    DAY_ORDER.forEach((day) => {
      matrix[day] = {};
      sessionLabels.forEach((s) => {
        matrix[day][s] = { pnl: 0, trades: 0, list: [] };
      });
    });
    filteredTrades.forEach((trade) => {
      const date = new Date(trade.date);
      if (!isValidDate(date)) return;
      const dayLabel = DAY_MAP[date.getDay()];
      if (getEntryHour(trade.entry_time) === null) return; // no time, no session
      const session = getSessionLabelForTrade(trade);
      if (matrix[dayLabel]?.[session]) {
        matrix[dayLabel][session].pnl += trade.pnl ?? 0;
        matrix[dayLabel][session].trades += 1;
        matrix[dayLabel][session].list.push(trade);
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

    const matrix: Record<number, Record<string, { pnl: number; trades: number; list: Trade[] }>> = {};
    hours.forEach((hour) => {
      matrix[hour] = {};
      markets.forEach((m) => {
        matrix[hour][m] = { pnl: 0, trades: 0, list: [] };
      });
    });
    filteredTrades.forEach((trade) => {
      const hour = getEntryHour(trade.entry_time);
      const market = trade.market || "Other";
      if (hour === null || !matrix[hour]) return;
      const targetMarket = markets.includes(market) ? market : "Other";
      matrix[hour][targetMarket].pnl += trade.pnl ?? 0;
      matrix[hour][targetMarket].trades += 1;
      matrix[hour][targetMarket].list.push(trade);
    });
    return { markets, hours, matrix };
  }, [filteredTrades]);
  const hourMarketMaxAbs = useMemo(() => {
    const values = hourMarketData.hours.flatMap((hour) =>
      hourMarketData.markets.map((m) => Math.abs(hourMarketData.matrix[hour][m].pnl)),
    );
    return Math.max(1, ...values);
  }, [hourMarketData]);

  const shortCurrency = (v: number) => signedMoney(formatCurrency, v, { compact: true });

  return (
    <JournalLayout proFeature="Heatmaps">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="xt-title mb-2 flex items-center gap-3">
            <Flame className="w-6 h-6 text-brand" />
            Heatmaps
            <InfoTip title="What is a heatmap?" widthClass="w-80">
              <p>A heatmap colours a grid by how much you made or lost in each box: green is profit, red is loss, and the deeper the colour the bigger the amount.</p>
              <p>Use it to spot patterns, like the months, weekdays or hours when you consistently do well or badly.</p>
              <p><strong className="text-foreground">Click any box</strong> to see the exact trades behind it, and click a trade to see all its details.</p>
            </InfoTip>
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
          className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4 mb-8"
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
                info="Your most profitable calendar month, adding up every year in the selected range. Hints at seasonal strengths in your trading."
                value={metrics.seasonMonth}
                sub={shortCurrency(metrics.seasonValue)}
                positive={metrics.seasonValue >= 0}
                onClick={() =>
                  setDrill({
                    title: `${metrics.seasonMonth}: Seasonality Champion`,
                    subtitle: "All trades placed in this month",
                    trades: filteredTrades.filter((t) => { const d = new Date(t.date); return isValidDate(d) && d.getMonth() === metrics.seasonIndex; }),
                  })
                }
              />
              <MetricCard
                icon={CalendarIcon}
                label="Best Weekday"
                info="The day of the week with the highest total P&L across the selected range."
                value={metrics.bestWeekdayLabel}
                sub={shortCurrency(metrics.bestWeekdayValue)}
                positive={metrics.bestWeekdayValue >= 0}
                onClick={() =>
                  setDrill({
                    title: `${metrics.bestWeekdayLabel}: Best Weekday`,
                    subtitle: "All trades placed on this weekday",
                    trades: filteredTrades.filter((t) => { const d = new Date(t.date); return isValidDate(d) && DAY_MAP[d.getDay()] === metrics.bestWeekdayLabel; }),
                  })
                }
              />
              <MetricCard
                icon={Clock}
                label="Power Hour"
                info="The hour of the day (by trade entry time) in which you earn the most in total. Only trades with an entry time are counted."
                value={metrics.bestHourLabel}
                sub={shortCurrency(metrics.bestHourValue)}
                positive={metrics.bestHourValue >= 0}
                onClick={
                  metrics.bestHourKey == null
                    ? undefined
                    : () =>
                        setDrill({
                          title: `${metrics.bestHourLabel}: Power Hour`,
                          subtitle: "All trades entered in this hour",
                          trades: filteredTrades.filter((t) => getEntryHour(t.entry_time) === metrics.bestHourKey),
                        })
                }
              />
              <MetricCard
                icon={MarketIcon}
                label="Top Market Edge"
                info="The market (equity, options, forex, ...) where your trades have made the most money in total."
                value={metrics.bestMarketLabel}
                sub={shortCurrency(metrics.bestMarketValue)}
                positive={metrics.bestMarketValue >= 0}
                onClick={
                  metrics.bestMarketKey == null
                    ? undefined
                    : () =>
                        setDrill({
                          title: `${metrics.bestMarketLabel}: Top Market Edge`,
                          subtitle: "All trades in this market",
                          trades: filteredTrades.filter((t) => (t.market || "Other") === metrics.bestMarketKey),
                        })
                }
              />
            </>
          )}
        </motion.div>

        {/* Monthly heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg flex items-center gap-1.5">
                Monthly Heatmap
                <InfoTip title="Monthly heatmap" widthClass="w-80">
                  <p>One box per calendar month showing your total P&L and number of trades. Green months made money, red months lost money.</p>
                  <p>Pick a year to look at one year only, or &quot;All Years&quot; to combine the same month across years.</p>
                  <p>Click a month to list its trades.</p>
                </InfoTip>
              </CardTitle>
              <div className="flex flex-wrap items-center gap-4">
              <HeatLegend className="max-sm:hidden" />
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {monthlyStats.map((stat, idx) => (
                  <HeatCell
                    key={MONTH_NAMES[idx]}
                    pnl={stat.pnl}
                    trades={stat.trades}
                    maxAbs={monthlyMaxAbs}
                    label={MONTH_NAMES[idx]}
                    amount={shortCurrency(stat.pnl)}
                    title={`${MONTH_NAMES[idx]} • ${stat.trades} trade${stat.trades === 1 ? "" : "s"}\nP&L: ${shortCurrency(stat.pnl)}\nClick to see these trades`}
                    onClick={() =>
                      setDrill({
                        title: `${MONTH_NAMES[idx]}${year === "all" ? "" : ` ${year}`}`,
                        subtitle: "Monthly heatmap",
                        trades: stat.list,
                      })
                    }
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Day of week x Session heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="mb-8">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
              <CardTitle className="text-lg flex items-center gap-1.5">
                Day of Week x Session
                <InfoTip title="Day of week × session" widthClass="w-80">
                  <p>Rows are weekdays; columns are global market sessions (Asia, Europe, Americas, Overnight) based on when you entered the trade.</p>
                  <p>Each box shows the number of trades, with the total P&L under it. It shows when in the week and day you trade best.</p>
                  <p>Click a box to list its trades.</p>
                </InfoTip>
              </CardTitle>
              <HeatLegend />
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
                      <div key={s} className="text-xs font-semibold text-muted-foreground text-center px-1">
                        {s}
                      </div>
                    ))}
                    {DAY_ORDER.map((day) => (
                      <Fragment key={day}>
                        <div className="text-sm font-semibold text-foreground flex items-center">{day}</div>
                        {sessionLabels.map((session) => {
                          const stat = weekdayMatrix[day][session];
                          return (
                            <HeatCell
                              key={`${day}-${session}`}
                              pnl={stat.pnl}
                              trades={stat.trades}
                              maxAbs={weekdayMaxAbs}
                              amount={shortCurrency(stat.pnl)}
                              title={`${day} • ${session}\nP&L: ${shortCurrency(stat.pnl)}\nTrades: ${stat.trades}\nClick to see these trades`}
                              onClick={() => setDrill({ title: `${day}, ${session}`, subtitle: "Day of week × session", trades: stat.list })}
                            />
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
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
              <CardTitle className="text-lg flex items-center gap-1.5">
                Hour x Market
                <InfoTip title="Hour × market" widthClass="w-80">
                  <p>Rows are the hours of the day you entered trades; columns are the markets you trade most (everything else is grouped as &quot;Other&quot;).</p>
                  <p>Each box shows the number of trades and the total P&L, so you can see which market works for you at which hour.</p>
                  <p>Click a box to list its trades.</p>
                </InfoTip>
              </CardTitle>
              <HeatLegend />
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
                      <div key={m} className="text-xs font-semibold text-muted-foreground text-center px-1 truncate">
                        {marketLabel(m)}
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
                            <HeatCell
                              key={`${hour}-${market}`}
                              pnl={stat.pnl}
                              trades={stat.trades}
                              maxAbs={hourMarketMaxAbs}
                              amount={shortCurrency(stat.pnl)}
                              title={`${formatHourDisplay(hour)} • ${marketLabel(market)}\nP&L: ${shortCurrency(stat.pnl)}\nTrades: ${stat.trades}\nClick to see these trades`}
                              onClick={() => setDrill({ title: `${formatHourDisplay(hour)}, ${marketLabel(market)}`, subtitle: "Hour × market", trades: stat.list })}
                            />
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
      <TradeDrilldown request={drill} onClose={() => setDrill(null)} />
    </JournalLayout>
  );
};

function MetricCard({
  icon: Icon,
  label,
  info,
  value,
  sub,
  positive,
  onClick,
}: {
  icon: typeof Sun;
  label: string;
  info: string;
  value: string;
  sub: string;
  positive: boolean;
  onClick?: () => void;
}) {
  return (
    <StatCard
      label={
        <>
          {label}
          <InfoTip title={label}>
            <p>{info}</p>
            {onClick && <p>Click the value to see these trades.</p>}
          </InfoTip>
        </>
      }
      value={value}
      icon={Icon}
      word
      sub={sub}
      subTone={positive ? "pos" : "neg"}
      onClick={onClick}
    />
  );
}

export default Heatmaps;
