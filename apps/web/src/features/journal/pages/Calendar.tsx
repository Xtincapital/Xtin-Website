// Journal Calendar — rewrite (not a port) of
// features-incoming/journal/app.js's `renderCalendarView()` (~line 3953),
// plus its `showDayDetails()` and `changeCalendarMonth()` helpers right
// after it (~lines 3953-4152). The original rendered a raw-HTML month grid
// into `#calendarGrid` (driven by `<select>` elements for month/year) and a
// separate `#dayDetails` panel below it that `showDayDetails()` filled in
// on cell click; this reproduces the same month-grid-with-per-day-P&L
// idea as real React state + shadcn `Card`/`Dialog`, per this task's brief.
//
// Calculations reproduced 1:1 from renderCalendarView()/showDayDetails():
//   - Trades grouped by day-of-month for the selected month+year
//     (`tradesByDate`)
//   - Per-day P&L (sum of that day's trade P&Ls) and trade count
//   - Month summary: trading days (days with >=1 trade), profitable days
//     (dayPnL > 0), loss days (dayPnL < 0), best day (highest dayPnL)
//   - Day-cell color: green when dayPnL > 0, red when < 0, amber when
//     exactly 0 (breakeven) — matches the original's three bgColor branches
//   - Day details on click: that day's trades, win/loss count, total P&L
//
// Deliberate departures, same reasoning Dashboard.tsx documented for its
// own currency/grouping simplifications:
//   1. Currency: the original converted every trade's P&L to INR via
//      `getTradePnlInINR()` before summing, so multi-currency trades
//      aggregated correctly under one INR total. This rewrite sums raw
//      `pnl` values as-is and formats with the shared `useCurrency()`
//      (region-aware, same as every other Journal page) — correct for
//      single-currency history, not a true multi-currency conversion. A
//      real fix needs either a stored FX rate per trade or a backend
//      aggregate endpoint; out of scope here (see Dashboard.tsx's header
//      comment for the same tradeoff).
//   2. Day details: the original had a separate always-visible
//      `#dayDetails` panel below the grid. This uses a shadcn `Dialog`
//      instead (opened on day-cell click) since there's no reason to
//      reserve permanent page space for it — the original's onclick
//      behavior (click a day with trades to see its detail) is preserved.
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InfoTip from "@/components/ui/info-tip";
import TradeDrilldown from "../components/TradeDrilldown";
import { useCurrency } from "@/contexts/CurrencyContext";
import JournalLayout from "../components/JournalLayout";
import { type Trade } from "../lib/api";
import { getAllTradesInInr } from "../lib/tradesInInr";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DayCell {
  day: number;
  trades: Trade[];
  pnl: number;
}

const Calendar = () => {
  const { formatInr: formatCurrency } = useCurrency();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Pragmatic choice, same as Dashboard.tsx: GET /journal/trades is
  // paginated (default 50, max 200 server-side). Requesting the largest
  // allowed page keeps this accurate for accounts with up to 200 trades;
  // a dedicated aggregate endpoint would be the correct long-term fix.
  const { data: tradesData, isLoading } = useQuery({
    queryKey: ["journal", "trades", "calendar"],
    queryFn: () => getAllTradesInInr(),
  });

  const allTrades = tradesData?.data ?? [];

  const { firstDayOfWeek, daysInMonth, tradesByDate, tradingDays, profitableDays, lossDays, bestDay } =
    useMemo(() => {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const firstDayOfWeek = firstDay.getDay();

      const tradesByDate = new Map<number, Trade[]>();
      for (const trade of allTrades) {
        const d = new Date(trade.date);
        if (d.getMonth() === month && d.getFullYear() === year) {
          const day = d.getDate();
          const bucket = tradesByDate.get(day) ?? [];
          bucket.push(trade);
          tradesByDate.set(day, bucket);
        }
      }

      let tradingDays = 0;
      let profitableDays = 0;
      let lossDays = 0;
      let bestDay: { day: number | null; pnl: number } = { day: null, pnl: -Infinity };

      tradesByDate.forEach((dayTrades, day) => {
        tradingDays++;
        const dayPnL = dayTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
        if (dayPnL > 0) profitableDays++;
        else if (dayPnL < 0) lossDays++;
        if (dayPnL > bestDay.pnl) bestDay = { day, pnl: dayPnL };
      });

      return { firstDayOfWeek, daysInMonth, tradesByDate, tradingDays, profitableDays, lossDays, bestDay };
    }, [allTrades, month, year]);

  const cells: DayCell[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dayTrades = tradesByDate.get(day) ?? [];
    cells.push({ day, trades: dayTrades, pnl: dayTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0) });
  }

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
    setSelectedDay(null);
  };

  const selectedDayTrades = selectedDay != null ? tradesByDate.get(selectedDay) ?? [] : [];

  return (
    <JournalLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="xt-title mb-2 flex items-center gap-3">
            Calendar
            <InfoTip title="How to read the calendar" widthClass="w-80">
              <p>Each box is a day. It shows how many trades you took and your total P&L for that day.</p>
              <p><strong className="text-success">Green</strong> days made money, <strong className="text-destructive">red</strong> days lost money, <strong className="text-amber-500">amber</strong> days broke even, and grey days had no trades.</p>
              <p><strong className="text-foreground">Click a day</strong> with trades to see every trade from it, and click a trade to see its full details. Use the arrows to move between months.</p>
            </InfoTip>
          </h1>
          <p className="text-muted-foreground">
            {isLoading ? "Loading your trading activity..." : "Daily P&L across the month"}
          </p>
        </motion.div>

        {/* Month summary metrics — trading days, profitable days, loss days, best day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4 mb-6"
        >
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                Trading Days
                <InfoTip title="Trading Days">
                  <p>Days this month on which you placed at least one trade.</p>
                </InfoTip>
              </p>
              <p className="stat-value font-semibold text-foreground">{tradingDays}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                Profitable Days
                <InfoTip title="Profitable Days">
                  <p>Days whose combined P&L across all trades was above zero.</p>
                </InfoTip>
              </p>
              <p className="stat-value font-semibold text-success">{profitableDays}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                Loss Days
                <InfoTip title="Loss Days">
                  <p>Days whose combined P&L across all trades was below zero.</p>
                </InfoTip>
              </p>
              <p className="stat-value font-semibold text-destructive">{lossDays}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                Best Day
                <InfoTip title="Best Day">
                  <p>Your single most profitable day this month: the date and its total P&L.</p>
                </InfoTip>
              </p>
              <p className="stat-value font-semibold text-foreground">
                {bestDay.day != null ? `${bestDay.day} (${formatCurrency(bestDay.pnl)})` : "-"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                {MONTH_NAMES[month]} {year}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => changeMonth(-1)} aria-label="Previous month">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => changeMonth(1)} aria-label="Next month">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {DAY_NAMES.map((d) => (
                  <div key={d} className="text-center text-xs font-bold text-muted-foreground/70 py-2">
                    {d}
                  </div>
                ))}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="rounded-lg" />
                ))}
                {cells.map((cell) => {
                  const hasTrades = cell.trades.length > 0;
                  const positive = cell.pnl > 0;
                  const negative = cell.pnl < 0;
                  return (
                    <button
                      key={cell.day}
                      type="button"
                      disabled={!hasTrades}
                      onClick={() => setSelectedDay(cell.day)}
                      className={`rounded-xl p-3 text-center border transition-[transform,box-shadow] duration-300 ${
                        !hasTrades
                          ? "border-transparent bg-muted/40 cursor-default"
                          : positive
                            ? "border-success/40 bg-success/10 cursor-pointer hover:-translate-y-1 hover:shadow-lg dark:bg-success/15"
                            : negative
                              ? "border-destructive/40 bg-destructive/10 cursor-pointer hover:-translate-y-1 hover:shadow-lg dark:bg-destructive/15"
                              : "border-amber-400/50 bg-amber-400/10 cursor-pointer hover:-translate-y-1 hover:shadow-lg"
                      }`}
                    >
                      <div className="text-sm font-semibold text-foreground tabular-nums">{cell.day}</div>
                      {hasTrades ? (
                        <>
                          <div className="text-[11px] text-muted-foreground mt-1">
                            {cell.trades.length} trade{cell.trades.length > 1 ? "s" : ""}
                          </div>
                          <div className={`text-[11px] font-semibold tabular-nums mt-0.5 ${positive ? "text-success" : negative ? "text-destructive" : "text-amber-500"}`}>
                            {formatCurrency(cell.pnl, { compact: true })}
                          </div>
                        </>
                      ) : (
                        <div className="h-8" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <TradeDrilldown
          request={
            selectedDay != null
              ? {
                  title: new Date(year, month, selectedDay).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
                  subtitle: "Trades placed on this day",
                  trades: selectedDayTrades,
                }
              : null
          }
          onClose={() => setSelectedDay(null)}
        />
      </div>
    </JournalLayout>
  );
};

export default Calendar;
