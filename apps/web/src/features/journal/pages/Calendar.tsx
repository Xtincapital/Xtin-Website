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
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCurrency } from "@/contexts/CurrencyContext";
import JournalLayout from "../components/JournalLayout";
import { getAllTrades, type Trade } from "../lib/api";

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
  const { formatCurrency } = useCurrency();
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
    queryFn: () => getAllTrades(),
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
  const selectedDayPnL = selectedDayTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const selectedDayWins = selectedDayTrades.filter((t) => (t.pnl ?? 0) > 0).length;
  const selectedDayLosses = selectedDayTrades.filter((t) => (t.pnl ?? 0) < 0).length;

  return (
    <JournalLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Calendar</h1>
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
              <p className="text-xs font-medium text-muted-foreground mb-2">Trading Days</p>
              <p className="stat-value font-bold text-foreground">{tradingDays}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground mb-2">Profitable Days</p>
              <p className="stat-value font-bold text-success">{profitableDays}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground mb-2">Loss Days</p>
              <p className="stat-value font-bold text-destructive">{lossDays}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground mb-2">Best Day</p>
              <p className="stat-value font-bold text-foreground">
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
                      className={`rounded-lg p-3 text-center border-2 transition-transform hover:scale-[1.03] ${
                        !hasTrades
                          ? "border-transparent bg-muted/30 cursor-default"
                          : positive
                            ? "border-success bg-success/10 cursor-pointer"
                            : negative
                              ? "border-destructive bg-destructive/10 cursor-pointer"
                              : "border-amber-400 bg-amber-400/10 cursor-pointer"
                      }`}
                    >
                      <div className="text-sm font-bold text-foreground">{cell.day}</div>
                      {hasTrades ? (
                        <>
                          <div className="text-[11px] text-muted-foreground mt-1">
                            {cell.trades.length} trade{cell.trades.length > 1 ? "s" : ""}
                          </div>
                          <div className={`text-[11px] font-bold mt-0.5 ${positive ? "text-success" : negative ? "text-destructive" : "text-amber-500"}`}>
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

        {/* Day details dialog — port of showDayDetails() */}
        <Dialog open={selectedDay != null} onOpenChange={(open) => !open && setSelectedDay(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedDay != null
                  ? new Date(year, month, selectedDay).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : ""}
              </DialogTitle>
              <DialogDescription>
                {selectedDayTrades.length} trade{selectedDayTrades.length !== 1 ? "s" : ""} • {selectedDayWins}W {selectedDayLosses}L
              </DialogDescription>
            </DialogHeader>

            <div className={`text-2xl font-bold ${selectedDayPnL >= 0 ? "text-success" : "text-destructive"}`}>
              {formatCurrency(selectedDayPnL)}
            </div>

            <div className="space-y-3">
              {selectedDayTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No trades on this day</p>
              ) : (
                selectedDayTrades.map((trade) => {
                  const positive = (trade.pnl ?? 0) >= 0;
                  return (
                    <Card key={trade.id} className={`border-l-4 ${positive ? "border-l-success" : "border-l-destructive"}`}>
                      <CardContent className="p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">
                            {trade.asset} {trade.strategy ? `• ${trade.strategy}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {[trade.type, trade.buy_sell, [trade.entry_time, trade.exit_time].filter(Boolean).join(" - ")]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 shrink-0 font-semibold text-sm ${positive ? "text-success" : "text-destructive"}`}>
                          {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {formatCurrency(trade.pnl ?? 0)}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </JournalLayout>
  );
};

export default Calendar;
