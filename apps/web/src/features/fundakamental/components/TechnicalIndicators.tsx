/**
 * Technical indicators for one stock: overall signal, the readings behind it
 * (RSI, MACD, moving averages, Bollinger Bands, stochastic) and a price chart
 * with the 20/50-day moving averages. Pro feature (the API enforces it).
 */
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartGrid, chartXAxis, chartYAxis, chartTooltip, chartColors, chartActiveDot } from "@/components/charts/chartTheme";
import { api } from "../lib/api";

interface TechnicalIndicatorsProps {
  ticker: string;
}

interface Indicators {
  sma_20: number | null;
  sma_50: number | null;
  sma_200: number | null;
  rsi: number | null;
  macd: number | null;
  macd_signal: number | null;
  bb_upper: number | null;
  bb_middle: number | null;
  bb_lower: number | null;
  stoch_k: number | null;
  stoch_d: number | null;
  atr: number | null;
  current_price: number;
}

interface Signal {
  overall_signal: string;
  signal_strength: number;
  buy_signals: string[];
  sell_signals: string[];
}

interface History {
  dates: string[];
  close: number[];
  sma_20: Array<number | null>;
  sma_50: Array<number | null>;
}

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export function TechnicalIndicators({ ticker }: TechnicalIndicatorsProps) {
  const [indicators, setIndicators] = useState<Indicators | null>(null);
  const [signals, setSignals] = useState<Signal | null>(null);
  const [history, setHistory] = useState<History | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("1y");

  const indian = /\.(NS|BO)$/i.test(ticker);
  const cur = indian ? "₹" : "$";
  const fmt = (n: number | null | undefined) =>
    isNum(n) ? `${cur}${n.toLocaleString(indian ? "en-IN" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.stocks.getTechnicalIndicators(ticker, period, true, true);
        if (cancelled) return;
        setIndicators(response.indicators);
        setSignals(response.signals);
        setHistory(response.history || null);
      } catch (e) {
        if (cancelled) return;
        setIndicators(null);
        setSignals(null);
        setHistory(null);
        setError(e instanceof Error ? e.message : "Couldn't load technical data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ticker, period]);

  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-48 w-full" />
      </Card>
    );
  }

  if (error || !indicators || !signals) {
    return (
      <Card className="p-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">No technical data for {ticker}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error || "Try again in a minute."} Check the ticker — Indian stocks end in .NS (e.g. RELIANCE.NS).
          </p>
        </div>
      </Card>
    );
  }

  const signalColor = (signal: string) => {
    if (signal.includes("STRONG BUY")) return "bg-green-600";
    if (signal.includes("BUY")) return "bg-green-500";
    if (signal.includes("STRONG SELL")) return "bg-red-600";
    if (signal.includes("SELL")) return "bg-red-500";
    return "bg-gray-500";
  };

  const price = indicators.current_price;
  const vsAverage = (avg: number | null) =>
    isNum(avg) ? (
      <div className={`text-xs ${price > avg ? "text-green-600" : "text-red-600"}`}>
        Price is {price > avg ? "above" : "below"} ({(((price - avg) / avg) * 100).toFixed(1)}%)
      </div>
    ) : null;

  const chartData = history
    ? history.dates.map((d, i) => ({
        date: d,
        Price: history.close[i],
        "20-day avg": history.sma_20[i] ?? undefined,
        "50-day avg": history.sma_50[i] ?? undefined,
      }))
    : [];

  return (
    <div className="space-y-4">
      {/* Overall Signal */}
      <Card className="p-6">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold">Technical signal</h3>
            <p className="text-sm text-muted-foreground">Last price {fmt(price)}</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32" aria-label="Price history period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6mo">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
              <SelectItem value="2y">2 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <Badge className={`${signalColor(signals.overall_signal)} text-white text-lg px-4 py-2`}>{signals.overall_signal}</Badge>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground" title="0 = every reading bearish, 100 = every reading bullish">
              Bullish score:
            </span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${signals.signal_strength > 60 ? "bg-green-500" : signals.signal_strength < 40 ? "bg-red-500" : "bg-gray-400"}`}
                style={{ width: `${Math.max(0, Math.min(100, signals.signal_strength))}%` }}
              />
            </div>
            <span className="text-sm font-medium">{Math.round(signals.signal_strength)}/100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> Bullish readings ({signals.buy_signals.length})
            </h4>
            <ul className="space-y-1">
              {signals.buy_signals.length === 0 && <li className="text-sm text-muted-foreground">None</li>}
              {signals.buy_signals.map((s) => (
                <li key={s} className="text-sm text-muted-foreground">• {s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
              <TrendingDown className="h-4 w-4" /> Bearish readings ({signals.sell_signals.length})
            </h4>
            <ul className="space-y-1">
              {signals.sell_signals.length === 0 && <li className="text-sm text-muted-foreground">None</li>}
              {signals.sell_signals.map((s) => (
                <li key={s} className="text-sm text-muted-foreground">• {s}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Price and moving averages</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid {...chartGrid} />
                <XAxis dataKey="date" {...chartXAxis} minTickGap={40} tickFormatter={(d) => String(d).slice(0, 7)} />
                <YAxis {...chartYAxis} domain={["auto", "auto"]} width={60} tickFormatter={(v) => `${cur}${Math.round(v)}`} />
                <Tooltip {...chartTooltip} formatter={(v: number) => fmt(v)} labelFormatter={(d) => String(d).slice(0, 10)} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="plainline" />
                <Line type="monotone" dataKey="Price" stroke={chartColors.positive} dot={false} strokeWidth={2.25} activeDot={chartActiveDot} />
                <Line type="monotone" dataKey="20-day avg" stroke={chartColors.series[2]} dot={false} strokeWidth={1.5} />
                <Line type="monotone" dataKey="50-day avg" stroke={chartColors.series[1]} dot={false} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Key Indicators */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" /> Key indicators
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {isNum(indicators.rsi) && (
            <div className="border rounded-lg p-3">
              <div className="text-sm text-muted-foreground mb-1">RSI (14)</div>
              <div className={`text-2xl font-bold ${indicators.rsi < 30 ? "text-green-600" : indicators.rsi > 70 ? "text-red-600" : "text-foreground"}`}>
                {indicators.rsi.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {indicators.rsi < 30 ? "Oversold (below 30)" : indicators.rsi > 70 ? "Overbought (above 70)" : "Neutral (30–70)"} — momentum of recent moves
              </div>
            </div>
          )}

          {isNum(indicators.macd) && isNum(indicators.macd_signal) && (
            <div className="border rounded-lg p-3">
              <div className="text-sm text-muted-foreground mb-1">MACD</div>
              <div className={`text-2xl font-bold ${indicators.macd > indicators.macd_signal ? "text-green-600" : "text-red-600"}`}>
                {indicators.macd.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {indicators.macd > indicators.macd_signal ? "Above" : "Below"} its signal line ({indicators.macd_signal.toFixed(2)})
              </div>
            </div>
          )}

          {isNum(indicators.sma_20) && (
            <div className="border rounded-lg p-3">
              <div className="text-sm text-muted-foreground mb-1">20-day average</div>
              <div className="xt-metric">{fmt(indicators.sma_20)}</div>
              {vsAverage(indicators.sma_20)}
            </div>
          )}

          {isNum(indicators.sma_50) && (
            <div className="border rounded-lg p-3">
              <div className="text-sm text-muted-foreground mb-1">50-day average</div>
              <div className="xt-metric">{fmt(indicators.sma_50)}</div>
              {vsAverage(indicators.sma_50)}
            </div>
          )}

          <div className="border rounded-lg p-3">
            <div className="text-sm text-muted-foreground mb-1">200-day average</div>
            <div className="xt-metric">{fmt(indicators.sma_200)}</div>
            {isNum(indicators.sma_200) ? vsAverage(indicators.sma_200) : <div className="text-xs text-muted-foreground">Needs 1 year or more of history</div>}
          </div>

          {isNum(indicators.bb_upper) && isNum(indicators.bb_lower) && (
            <div className="border rounded-lg p-3">
              <div className="text-sm text-muted-foreground mb-1">Bollinger Bands</div>
              <div className="text-xs space-y-1">
                <div>Upper: {fmt(indicators.bb_upper)}</div>
                <div>Middle: {fmt(indicators.bb_middle)}</div>
                <div>Lower: {fmt(indicators.bb_lower)}</div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {price >= indicators.bb_upper ? "At the upper band" : price <= indicators.bb_lower ? "At the lower band" : "Inside the bands"}
              </div>
            </div>
          )}

          {isNum(indicators.stoch_k) && isNum(indicators.stoch_d) && (
            <div className="border rounded-lg p-3">
              <div className="text-sm text-muted-foreground mb-1">Stochastic (%K / %D)</div>
              <div className="xt-metric">
                {indicators.stoch_k.toFixed(0)} / {indicators.stoch_d.toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {indicators.stoch_k < 20 ? "Oversold (below 20)" : indicators.stoch_k > 80 ? "Overbought (above 80)" : "Neutral (20–80)"}
              </div>
            </div>
          )}

          {isNum(indicators.atr) && (
            <div className="border rounded-lg p-3">
              <div className="text-sm text-muted-foreground mb-1">Average true range (14)</div>
              <div className="xt-metric">{fmt(indicators.atr)}</div>
              <div className="text-xs text-muted-foreground mt-1">Typical daily move ({((indicators.atr / price) * 100).toFixed(1)}% of price)</div>
            </div>
          )}
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        Technical signals are calculated from past prices only and are for education, not investment advice.
      </p>
    </div>
  );
}
