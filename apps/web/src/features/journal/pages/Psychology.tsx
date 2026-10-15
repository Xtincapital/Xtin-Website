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
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Tags, Sparkles, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
import InfoTip from "@/components/ui/info-tip";
import TradeDrilldown, { type DrilldownRequest } from "../components/TradeDrilldown";
import JournalLayout from "../components/JournalLayout";
import { type Trade } from "../lib/api";
import { getAllTradesInInr } from "../lib/tradesInInr";
import StatCard from "../components/StatCard";
import { JBarChart, JDonut } from "../components/JournalCharts";
import { signedMoney } from "../lib/format";

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


const Psychology = () => {
  const { formatInr: formatCurrency } = useCurrency();
  const [drill, setDrill] = useState<DrilldownRequest | null>(null);
  const [entrySearch, setEntrySearch] = useState("");
  const [shownEntries, setShownEntries] = useState(5);

  // Pragmatic full-history fetch — see header comment (matches Dashboard.tsx).
  const { data: tradesData, isLoading } = useQuery({
    queryKey: ["journal", "trades", "psychology"],
    queryFn: () => getAllTradesInInr(),
  });

  const allTrades = tradesData?.data ?? [];

  const { topEmotion, bestEmotion, journalCount, taggedCount, emotionChartData, topTags, journalEntries, emotionCount, emotionPnL } = useMemo(() => {
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

    // Best to worst, so the bars read as a ranking.
    const emotionChartData = Object.keys(emotionPnL)
      .map((key) => ({
        key,
        label: `${emotionInfo(key).emoji} ${emotionInfo(key).label}`,
        pnl: emotionPnL[key],
      }))
      .sort((a, b) => b.pnl - a.pnl);

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
      emotionCount,
      emotionPnL,
    };
  }, [allTrades]);

  const needle = entrySearch.trim().toLowerCase();
  const matchingEntries = needle
    ? journalEntries.filter((t) =>
        [t.asset, t.notes, t.strategy, t.emotion, ...(t.tags ?? [])].some((v) => (v ?? "").toLowerCase().includes(needle)),
      )
    : journalEntries;
  const visibleEntries = matchingEntries.slice(0, shownEntries);

  const emotionTrades = (key: string) => allTrades.filter((t) => (t.emotion || "neutral") === key);
  const showEmotion = (key: string, subtitle: string) =>
    setDrill({ title: `${emotionInfo(key).emoji} ${emotionInfo(key).label} trades`, subtitle, trades: emotionTrades(key) });

  const total = allTrades.length;
  const tradesWord = (n: number) => `${n.toLocaleString("en-IN")} trade${n === 1 ? "" : "s"}`;
  const metricCards: { label: string; info: string; value: string; icon: typeof Sparkles; sub: string; onClick?: () => void; word?: boolean }[] = [
    {
      label: "Top Emotion",
      info: "The emotion you tag most often on your trades. It shows the mindset you trade in most of the time.",
      value: topEmotion ? `${emotionInfo(topEmotion).emoji} ${emotionInfo(topEmotion).label}` : "N/A",
      icon: Sparkles,
      word: true,
      sub: topEmotion ? tradesWord(emotionCount[topEmotion] ?? 0) : "No trades yet",
      onClick: topEmotion ? () => showEmotion(topEmotion, "Your most frequent emotion") : undefined,
    },
    {
      label: "Journal Entries",
      info: "Trades where you wrote a note. Writing why you took a trade and how it went is the habit that improves results most.",
      value: journalCount.toLocaleString(),
      icon: BookOpen,
      sub: "Trades with notes",
      onClick: journalCount ? () => setDrill({ title: "Trades with notes", subtitle: "Journal entries", trades: journalEntries }) : undefined,
    },
    {
      label: "Tagged Trades",
      info: "Trades you labelled with tags (like #breakout or #news) so you can group and compare them later.",
      value: taggedCount.toLocaleString(),
      icon: Tags,
      sub: total ? `${Math.round((taggedCount / total) * 100)}% of ${tradesWord(total)}` : "No trades yet",
      onClick: taggedCount ? () => setDrill({ title: "Tagged trades", subtitle: "Trades with at least one tag", trades: allTrades.filter((t) => t.tags && t.tags.length > 0) }) : undefined,
    },
    {
      label: "Best Performing Emotion",
      info: "The emotion that earned you the most money in total. Compare it with your Top Emotion: are you trading most in the state that pays?",
      value: bestEmotion ? `${emotionInfo(bestEmotion).emoji} ${emotionInfo(bestEmotion).label}` : "N/A",
      icon: Trophy,
      word: true,
      sub: bestEmotion ? `${signedMoney(formatCurrency, emotionPnL[bestEmotion] ?? 0)} across ${tradesWord(emotionCount[bestEmotion] ?? 0)}` : "No trades yet",
      onClick: bestEmotion ? () => showEmotion(bestEmotion, "Your most profitable emotion") : undefined,
    },
  ];

  return (
    <JournalLayout proFeature="Psychology analysis">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="xt-title mb-2 flex items-center gap-3">
            Psychology
            <InfoTip title="Trading psychology" widthClass="w-80">
              <p>Your emotions affect your trades: fear makes you exit early, greed makes you hold too long. This page connects the emotion you tagged on each trade to the money it made or lost.</p>
              <p>Tag an emotion when you log a trade, then look for the feelings that cost you money.</p>
              <p><strong className="text-foreground">Click</strong> any card, bar or tag to see the trades behind it.</p>
            </InfoTip>
          </h1>
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
            <StatCard
              key={card.label}
              label={
                <>
                  {card.label}
                  <InfoTip title={card.label}>
                    <p>{card.info}</p>
                    {card.onClick && <p>Click the value to see these trades.</p>}
                  </InfoTip>
                </>
              }
              value={card.value}
              icon={card.icon}
              word={card.word}
              sub={card.sub}
              onClick={card.onClick}
            />
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
              <CardTitle className="text-lg flex items-center gap-1.5">
                P&L by Emotion
                <InfoTip title="P&L by emotion">
                  <p>Total profit or loss from trades tagged with each emotion. Green bars made money; red bars lost money.</p>
                  <p>Click a bar to list its trades.</p>
                </InfoTip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {emotionChartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">No trades yet</div>
              ) : (
                <JBarChart
                  data={emotionChartData.map((e) => ({
                    label: emotionInfo(e.key).label,
                    value: e.pnl,
                    sub: `${(emotionCount[e.key] ?? 0).toLocaleString("en-IN")} trade${emotionCount[e.key] === 1 ? "" : "s"}`,
                  }))}
                  formatAxis={(v) => formatCurrency(v, { compact: true })}
                  formatValue={(v) => signedMoney(formatCurrency, v)}
                  ariaLabel="P&L by emotion"
                  onBarClick={(i) => showEmotion(emotionChartData[i].key, "Trades tagged with this emotion")}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-1.5">
                Top Tags
                <InfoTip title="Top tags">
                  <p>The ten tags you use most. Tags are short labels you add to a trade, like &quot;breakout&quot; or &quot;revenge trade&quot;.</p>
                  <p>Click a tag in the list to see its trades.</p>
                </InfoTip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topTags.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">No tagged trades yet</div>
              ) : (
                <JDonut
                  data={topTags.map((t) => ({ label: t.tag, value: t.count }))}
                  centerLabel="tag uses"
                  ariaLabel="Top tags"
                  onSelect={(i) => {
                    const tag = topTags[i].tag;
                    setDrill({ title: `Tag: ${tag}`, subtitle: "Trades with this tag", trades: allTrades.filter((tr) => tr.tags?.includes(tag)) });
                  }}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Journal entries */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand" />
            Journal Entries
            <InfoTip title="Journal entries">
              <p>Your five most recent trades with a note. Search to find older ones, or tap Load more. Click an entry to see the full trade.</p>
            </InfoTip>
          </h2>
          {journalEntries.length > 0 && (
            <div className="relative mb-4 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                aria-label="Search journal entries"
                placeholder="Search notes, assets, tags..."
                className="pl-8"
                value={entrySearch}
                onChange={(e) => {
                  setEntrySearch(e.target.value);
                  setShownEntries(5);
                }}
              />
            </div>
          )}
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
              {matchingEntries.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-sm text-muted-foreground">No entries match &quot;{entrySearch}&quot;.</CardContent>
                </Card>
              )}
              {visibleEntries.map((trade) => {
                const pnl = trade.pnl ?? 0;
                const status = pnl > 0 ? "Win" : pnl < 0 ? "Loss" : "Breakeven";
                const info = emotionInfo(trade.emotion || "neutral");
                return (
                  <Card key={trade.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setDrill({ title: `${trade.asset} trade`, subtitle: new Date(trade.date).toLocaleDateString(), trades: [trade] })}>
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
                          <p className={`text-base font-semibold tabular-nums ${pnl >= 0 ? "text-brand" : "text-destructive"}`}>{signedMoney(formatCurrency, pnl)}</p>
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
              {matchingEntries.length > shownEntries && (
                <div className="flex justify-center pt-1">
                  <Button variant="outline" onClick={() => setShownEntries((n) => n + 5)}>
                    Load more ({matchingEntries.length - shownEntries} more)
                  </Button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
      <TradeDrilldown request={drill} onClose={() => setDrill(null)} />
    </JournalLayout>
  );
};

export default Psychology;
