// Journal Psychology page — rewrite (not a port) of
// features-incoming/journal/app.js's `renderPsychologyTab()`
// (~line 4791-4969) — emotion-tagged trade analysis, correlating the
// `emotion` logged on each trade with its P&L. This is the same underlying
// insight the AI coach's "emotion fingerprint" (see
// services/api/modules/journal/tradeContext.ts /
// aiCoach.controller.ts on the backend) feeds into an LLM prompt — this page
// computes and displays it directly instead.
//
// Reproduced from the original:
//   - 4 metric cards: Top Emotion (most-logged), Journal Count (trades with
//     notes), Tagged Count (trades with tags), Best Emotion (highest total
//     P&L)
//   - Emotion Performance bar chart (P&L per emotion, green/red by sign)
//   - Top Tags chart (top 10 tags by frequency across all trades)
//   - Journal Entries list: every trade with notes, newest first, showing
//     asset/date/strategy/side, P&L + win/loss/breakeven status, emotion
//     emoji, tags, and the note text
//
// Emotion list: same 7 emotions + emoji pages/Trades.tsx's trade form uses
// (`EMOTIONS`), duplicated here rather than imported since Trades.tsx
// doesn't export it (and is read-only for this task).
//
// Charting: reuses the same recharts approach Dashboard.tsx established.
//
// Currency: sums raw `pnl` as-is, same documented departure from the
// original's `convertTradeAmountToINR()` that Dashboard.tsx's header
// comment explains.
//
// Data fetching: same pragmatic single large-page fetch Dashboard.tsx uses
// (GET /journal/trades has no aggregate endpoint) — limit=200, offset=0.
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { BookOpen, Tags, Sparkles, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
import JournalLayout from "../components/JournalLayout";
import { trades as tradesApi, type Trade } from "../lib/api";

// Same 7-emotion list + emoji pages/Trades.tsx's trade form uses.
const EMOTIONS: Record<string, { emoji: string; label: string }> = {
  confident: { emoji: "\u{1F60A}", label: "Confident" },
  neutral: { emoji: "\u{1F610}", label: "Neutral" },
  uncertain: { emoji: "\u{1F61F}", label: "Uncertain" },
  frustrated: { emoji: "\u{1F624}", label: "Frustrated" },
  excited: { emoji: "\u{1F929}", label: "Excited" },
  fearful: { emoji: "\u{1F628}", label: "Fearful" },
  greedy: { emoji: "\u{1F4B0}", label: "Greedy" },
};
const emotionInfo = (key: string) => EMOTIONS[key] ?? { emoji: "\u{1F610}", label: key.charAt(0).toUpperCase() + key.slice(1) };

const TAG_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-positive))",
  "hsl(var(--chart-negative))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--secondary))",
  "hsl(var(--accent-foreground))",
];

const Psychology = () => {
  const { formatCurrency } = useCurrency();

  // Pragmatic full-history fetch — see header comment (matches Dashboard.tsx).
  const { data: tradesData, isLoading } = useQuery({
    queryKey: ["journal", "trades", "psychology"],
    queryFn: () => tradesApi.getTrades({ limit: 200, offset: 0 }),
  });

  const allTrades = tradesData?.data ?? [];

  const { topEmotion, bestEmotion, journalCount, taggedCount, emotionChartData, topTags, journalEntries } = useMemo(() => {
    const emotionCount: Record<string, number> = {};
    const emotionPnL: Record<string, number> = {};
    let journalCount = 0;
    let taggedCount = 0;
    const allTags: string[] = [];

    for (const t of allTrades) {
      const emotion = t.emotion || "neutral";
      emotionCount[emotion] = (emotionCount[emotion] ?? 0) + 1;
      emotionPnL[emotion] = (emotionPnL[emotion] ?? 0) + (t.pnl ?? 0);

      if (t.notes && t.notes.trim()) journalCount++;
      if (t.tags && t.tags.length > 0) {
        taggedCount++;
        allTags.push(...t.tags);
      }
    }

    const topEmotionKey = Object.keys(emotionCount).reduce((a, b) => (emotionCount[a] > emotionCount[b] ? a : b), "neutral");
    const bestEmotionKey = Object.keys(emotionPnL).reduce((a, b) => (emotionPnL[a] > emotionPnL[b] ? a : b), "neutral");

    const emotionChartData = Object.keys(emotionPnL).map((key) => ({
      key,
      label: `${emotionInfo(key).emoji} ${emotionInfo(key).label}`,
      pnl: emotionPnL[key],
    }));

    const tagCounts: Record<string, number> = {};
    for (const tag of allTags) tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    const journalEntries = allTrades
      .filter((t) => t.notes && t.notes.trim())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      topEmotion: Object.keys(emotionCount).length > 0 ? topEmotionKey : null,
      bestEmotion: Object.keys(emotionPnL).length > 0 ? bestEmotionKey : null,
      journalCount,
      taggedCount,
      emotionChartData,
      topTags,
      journalEntries,
    };
  }, [allTrades]);

  const metricCards = [
    {
      label: "Top Emotion",
      value: topEmotion ? `${emotionInfo(topEmotion).emoji} ${emotionInfo(topEmotion).label}` : "N/A",
      icon: Sparkles,
    },
    { label: "Journal Entries", value: journalCount.toLocaleString(), icon: BookOpen },
    { label: "Tagged Trades", value: taggedCount.toLocaleString(), icon: Tags },
    {
      label: "Best Performing Emotion",
      value: bestEmotion ? `${emotionInfo(bestEmotion).emoji} ${emotionInfo(bestEmotion).label}` : "N/A",
      icon: Trophy,
    },
  ];

  return (
    <JournalLayout proFeature="Psychology analysis">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Psychology</h1>
          <p className="text-muted-foreground">
            {isLoading ? "Reading your trading mindset..." : "How your emotions correlate with performance"}
          </p>
        </motion.div>

        {/* Metric cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4 mb-8"
        >
          {metricCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                  <card.icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className="stat-value font-bold text-foreground truncate">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">P&L by Emotion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {emotionChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No trades yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={emotionChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), "P&L"]} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                        {emotionChartData.map((entry) => (
                          <Cell key={entry.key} fill={entry.pnl >= 0 ? "hsl(var(--chart-positive))" : "hsl(var(--chart-negative))"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {topTags.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No tagged trades yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={topTags} dataKey="count" nameKey="tag" cx="50%" cy="50%" innerRadius="45%" outerRadius="80%" stroke="none">
                        {topTags.map((entry, index) => (
                          <Cell key={entry.tag} fill={TAG_COLORS[index % TAG_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value} trades`, name]}
                        contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              {topTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {topTags.map((t, i) => (
                    <Badge key={t.tag} variant="outline" className="text-xs" style={{ borderColor: TAG_COLORS[i % TAG_COLORS.length] }}>
                      {t.tag} · {t.count}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Journal entries */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Journal Entries
          </h2>
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">Loading journal entries...</CardContent>
            </Card>
          ) : journalEntries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No journal entries yet. Add notes to your trades to see them here.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {journalEntries.map((trade) => {
                const pnl = trade.pnl ?? 0;
                const status = pnl > 0 ? "Win" : pnl < 0 ? "Loss" : "Breakeven";
                const info = emotionInfo(trade.emotion || "neutral");
                return (
                  <Card key={trade.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{trade.asset}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {new Date(trade.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                            {trade.strategy ? ` • ${trade.strategy}` : ""}
                            {trade.buy_sell ? ` • ${trade.buy_sell === "buy" ? "Buy" : "Sell"}` : ""}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-base font-bold ${pnl >= 0 ? "text-success" : "text-destructive"}`}>{formatCurrency(pnl)}</p>
                          <p className="text-xs text-muted-foreground">{status}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className="text-xl" title={info.label}>
                          {info.emoji}
                        </span>
                        {(trade.tags ?? []).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-3 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {trade.notes}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </JournalLayout>
  );
};

export default Psychology;
