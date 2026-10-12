// Journal AI Coach page (Phase 9f — final Journal frontend sub-phase).
// Rebuild (not a port) of features-incoming/journal/ai-coach.js's `AICoach`
// class — a floating chat-bubble widget in the original — as a proper
// routed page at `/journal/coach` (JournalApp.tsx's reserved path). See
// that file's header comment for why a widget-to-page conversion is a
// "reasonable modernization" here rather than something to replicate.
//
// Backend: services/api/modules/journal/aiCoach.{routes,controller,
// validator}.ts, called through ../lib/coachApi.ts (a new sibling file to
// ../lib/api.ts — see that file's header comment for why it isn't added to
// api.ts's own reserved `coach` slot: api.ts is out of bounds for this task).
//
// Of the AICoach class's five feature areas, all five get *some* UI here,
// with two judgement calls on scope (see each tab's comment below):
//   1. sendMessage/addMessage/formatMessage      -> "Chat" tab (full build)
//   2. generateWeeklyReview                       -> "Weekly Review" tab (full build)
//   3. showPreTradeReminder                       -> "Pre-Trade Check" tab (full build)
//   4. loadProfile/buildProfileFromAnalysis/
//      displayProfile/renderBehavioralGauge/
//      analyzeAllTrades/displayAnalysis           -> "Insights" tab (SIMPLIFIED:
//         only POST /journal/analyze's rule-based issues/strengths list is
//         shown — the strategy-performance and emotion-P&L breakdowns that
//         `analyze`'s core_metrics also imply are already fully covered by
//         pages/Analytics.tsx and pages/Psychology.tsx, read first to confirm
//         this; rebuilding a third "Trading DNA" gauge view of the same
//         numbers here would be pure duplication)
//   5. checkBehavioralAlerts/displayBehavioralAlerts -> "Alerts" tab (wired
//         up for forward-compatibility per the task brief, but GET
//         /journal/behavioral-alerts is a trivial stub that always returns
//         an empty array — see aiCoach.controller.ts's own comment — so this
//         is deliberately just an empty-state card, not elaborate UI)
//
// Chat history: the open conversation lives in component state, and the last
// `history` messages are sent with every chat request so Claude remembers the
// thread. For Pro users the server also saves each exchange
// (services/api/modules/ai/chatHistory.ts); "Saved chats" lists them and
// reopening one continues it. Free users see the Pro upsell there.
//
// Wallet: ../store/useJournalPlanStore.ts (the parallel task, landed by the
// time this was written — its real shape was read directly, not guessed).
// Its own header comment says a Coach-page upgrade prompt should be "a
// plain link to /journal/pricing" rather than a modal/trigger function — so
// this page does exactly that on a 402 instead of calling any
// checkout-opening method.
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles,
  Send,
  Loader2,
  Wallet,
  CalendarCheck,
  ShieldCheck,
  BellRing,
  Lightbulb,
  Bot,
  User as UserIcon,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CircleCheck,
  History,
  MessageSquarePlus,
} from "lucide-react";
import SavedChatsList from "@/components/ai/SavedChatsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AmountInput from "@/components/ui/amount-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import JournalLayout from "../components/JournalLayout";
import { goals as goalsApi, type Trade } from "../lib/api";
import { getAllTradesInInr, tradeInCurrency } from "../lib/tradesInInr";
import { coach, InsufficientTokensError, type ChatHistoryMessage } from "../lib/coachApi";
import { useJournalPlanStore, formatTokens } from "../store/useJournalPlanStore";
import { marketLabel } from "../lib/journalPatternHelpers";

// Same static lists pages/Trades.tsx's trade form uses — duplicated here
// (not imported, that page is read-only for this task and doesn't export
// them) for the Pre-Trade Check form's selects.
const TRADING_TYPES = ["Scalping", "Intraday", "Swing Trading", "Positional Trading", "Investing", "Long-Term Investing"];
const TRADE_MARKETS = ["Equity", "Futures", "Options", "Commodities", "Forex", "Crypto_Currency"];

let messageIdCounter = 0;
const nextMessageId = () => `msg-${Date.now()}-${messageIdCounter++}`;

interface ChatBubble {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

/** Lightweight, safe (no dangerouslySetInnerHTML) rewrite of the original's
 *  `formatMessage()` — bold/heading/bullet formatting for Claude replies
 *  rendered as real React nodes instead of injected HTML. Handles the
 *  common shapes Claude actually returns for these prompts (weekly-review's
 *  numbered sections, `**bold**`, `- ` / `• ` bullets). */
function renderCoachText(text: string): ReactNode {
  if (!text) return null;
  const lines = text.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let bulletBuffer: string[] = [];

  const renderInline = (line: string, key: string): ReactNode => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).filter((p) => p !== "");
    return (
      <>
        {parts.map((part, i) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={`${key}-${i}`}>{part.slice(2, -2)}</strong>
          ) : (
            <span key={`${key}-${i}`}>{part}</span>
          ),
        )}
      </>
    );
  };

  const flushBullets = (key: string) => {
    if (bulletBuffer.length === 0) return;
    blocks.push(
      <ul key={key} className="list-disc space-y-1 pl-5">
        {bulletBuffer.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed">
            {renderInline(item, `${key}-li-${i}`)}
          </li>
        ))}
      </ul>,
    );
    bulletBuffer = [];
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) {
      flushBullets(`ul-${idx}`);
      return;
    }
    const bulletMatch = line.match(/^[-•]\s+(.*)$/);
    if (bulletMatch) {
      bulletBuffer.push(bulletMatch[1]);
      return;
    }
    flushBullets(`ul-${idx}`);

    // "1. Week Summary" / "1. **Week Summary**" style section headers —
    // short numbered lines with no trailing sentence punctuation.
    const numberedHeading = line.match(/^(\d+)\.\s+\*{0,2}([A-Za-z][^.]{2,50})\*{0,2}\s*$/);
    const isHashHeading = /^#{1,3}\s+/.test(line);
    const isFullyBold = /^\*\*[^*]+\*\*$/.test(line);

    if (numberedHeading) {
      blocks.push(
        <h4 key={idx} className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-foreground first:mt-0">
          <span className="text-primary">{numberedHeading[1]}.</span> {numberedHeading[2]}
        </h4>,
      );
    } else if (isHashHeading) {
      blocks.push(
        <h4 key={idx} className="mt-3 text-sm font-semibold text-foreground first:mt-0">
          {line.replace(/^#{1,3}\s+/, "")}
        </h4>,
      );
    } else if (isFullyBold) {
      blocks.push(
        <h4 key={idx} className="mt-3 text-sm font-semibold text-foreground first:mt-0">
          {line.slice(2, -2)}
        </h4>,
      );
    } else {
      blocks.push(
        <p key={idx} className="text-sm leading-relaxed">
          {renderInline(line, `p-${idx}`)}
        </p>
      );
    }
  });
  flushBullets("ul-end");

  return <div className="space-y-1.5">{blocks}</div>;
}

function severityBadgeVariant(severity: string | undefined): "default" | "destructive" | "secondary" {
  if (severity === "high") return "destructive";
  if (severity === "medium") return "secondary";
  return "default";
}

export default function Coach() {
  const { user } = useAuth();
  const { currency } = useCurrency();

  const wallet = useJournalPlanStore((s) => s.wallet);
  const walletLoading = useJournalPlanStore((s) => s.walletLoading);
  const fetchWallet = useJournalPlanStore((s) => s.fetchWallet);
  const isPro = useJournalPlanStore((s) => s.isPro);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const clientTier = isPro() ? "pro" : "free";
  const displayName = (user?.email || "").split("@")[0] || "";

  // Full trade history + goals, reused across every tab — same pragmatic
  // single-large-page fetch Dashboard.tsx/Analytics.tsx/Psychology.tsx all
  // use (GET /journal/trades has no server-side aggregate endpoint).
  const { data: tradesData, isLoading: tradesLoading } = useQuery({
    queryKey: ["journal", "trades", "coach"],
    queryFn: () => getAllTradesInInr(),
  });
  const allTrades: Trade[] = tradesData?.data ?? [];

  const { data: goalsData } = useQuery({
    queryKey: ["journal", "goals", "coach"],
    queryFn: () => goalsApi.getGoals(),
  });

  const [activeTab, setActiveTab] = useState("chat");

  /** Shared 402 handler — every AI-calling endpoint here can run short on
   *  wallet tokens. Points at /journal/pricing (the parallel task's page)
   *  rather than any checkout-trigger function, per useJournalPlanStore.ts's
   *  own header comment on how Coach should upsell. */
  const handleInsufficientTokens = (err: InsufficientTokensError) => {
    fetchWallet();
    toast.error("You're out of AI tokens", {
      description: err.message,
      action: {
        label: "Top up",
        onClick: () => {
          window.location.href = "/journal/pricing";
        },
      },
    });
  };

  return (
    <JournalLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-foreground mb-1">
              <Sparkles className="h-6 w-6 text-primary" />
              AI Coach
            </h1>
            <p className="text-muted-foreground">Chat, weekly reviews, and pre-trade checks powered by your trade history</p>
          </div>

          {/* Wallet balance badge */}
          <Card className="w-full sm:w-auto">
            <CardContent className="flex items-center gap-3 p-3 px-4">
              <Wallet className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">AI Tokens</p>
                <p className="text-sm font-bold text-foreground">
                  {walletLoading && !wallet ? "Loading..." : wallet ? formatTokens(wallet.token_balance) : "—"}
                </p>
              </div>
              <Badge variant={clientTier === "pro" ? "default" : "outline"} className="ml-1 shrink-0 uppercase">
                {clientTier}
              </Badge>
              <Button asChild size="sm" variant="outline" className="ml-1 shrink-0">
                <Link to="/journal/pricing">Top up</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 flex w-full flex-wrap h-auto gap-1">
              <TabsTrigger value="chat" className="gap-1.5">
                <Bot className="h-3.5 w-3.5" /> Chat
              </TabsTrigger>
              <TabsTrigger value="weekly" className="gap-1.5">
                <CalendarCheck className="h-3.5 w-3.5" /> Weekly Review
              </TabsTrigger>
              <TabsTrigger value="pretrade" className="gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Pre-Trade Check
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-1.5">
                <Lightbulb className="h-3.5 w-3.5" /> Insights
              </TabsTrigger>
              <TabsTrigger value="alerts" className="gap-1.5">
                <BellRing className="h-3.5 w-3.5" /> Alerts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat">
              <ChatTab
                trades={allTrades}
                tradesLoading={tradesLoading}
                goals={goalsData ?? []}
                displayName={displayName}
                clientTier={clientTier}
                currency={currency}
                onInsufficientTokens={handleInsufficientTokens}
                onWalletChange={fetchWallet}
              />
            </TabsContent>

            <TabsContent value="weekly">
              <WeeklyReviewTab trades={allTrades} tradesLoading={tradesLoading} onInsufficientTokens={handleInsufficientTokens} onWalletChange={fetchWallet} />
            </TabsContent>

            <TabsContent value="pretrade">
              <PreTradeTab onInsufficientTokens={handleInsufficientTokens} onWalletChange={fetchWallet} />
            </TabsContent>

            <TabsContent value="insights">
              <InsightsTab trades={allTrades} tradesLoading={tradesLoading} active={activeTab === "insights"} />
            </TabsContent>

            <TabsContent value="alerts">
              <AlertsTab active={activeTab === "alerts"} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </JournalLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Chat tab — port of sendMessage/addMessage/formatMessage. Conversation is
// local component state only (see file header comment on why).
// ─────────────────────────────────────────────────────────────────────────
function ChatTab({
  trades,
  tradesLoading,
  goals,
  displayName,
  clientTier,
  currency,
  onInsufficientTokens,
  onWalletChange,
}: {
  trades: Trade[];
  tradesLoading: boolean;
  goals: { title: string; metric: string; timeframe: string; target_value: number }[];
  displayName: string;
  clientTier: "free" | "pro";
  currency: string;
  onInsufficientTokens: (err: InsufficientTokensError) => void;
  onWalletChange: () => void;
}) {
  const welcome = (): ChatBubble => ({
    id: nextMessageId(),
    role: "assistant",
    content:
      "Hey! I'm Xtin Journal AI, your personal trading coach. I look at your actual trade history to give specific, honest feedback — ask me anything about your performance, a strategy, or how your emotions are affecting your P&L.",
  });
  const [messages, setMessages] = useState<ChatBubble[]>(() => [welcome()]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  // Pro: the saved conversation being continued, and whether the saved-chats list is showing.
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  function newChat() {
    setMessages([welcome()]);
    setConversationId(null);
    setShowHistory(false);
  }

  function openSaved(id: string, saved: { role: "user" | "assistant"; content: string }[]) {
    setMessages(saved.map((m) => ({ id: nextMessageId(), role: m.role, content: m.content })));
    setConversationId(id);
    setShowHistory(false);
  }
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatBubble = { id: nextMessageId(), role: "user", content: text };
    // History sent to the backend excludes the bubble we're about to add —
    // matches the original's "remembers what was said two questions ago".
    const history: ChatHistoryMessage[] = messages
      .filter((m) => !m.isError)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await coach.chat({
        message: text,
        // Amounts in the currency the coach is told to use.
        trades: trades.map((t) => tradeInCurrency(t, currency)),
        display_name: displayName,
        history,
        goals: goals.map((g) => ({ title: g.title, target: g.target_value, metric: g.metric, timeframe: g.timeframe })),
        client_tier: clientTier,
        currency,
        conversation_id: conversationId,
      });
      if (res.conversation_id) setConversationId(res.conversation_id);
      setMessages((prev) => [...prev, { id: nextMessageId(), role: "assistant", content: res.reply }]);
      onWalletChange();
    } catch (err) {
      if (err instanceof InsufficientTokensError) {
        onInsufficientTokens(err);
        setMessages((prev) => [
          ...prev,
          { id: nextMessageId(), role: "assistant", content: "I'm out of AI tokens for your account — top up to keep chatting.", isError: true },
        ]);
      } else {
        const message = err instanceof Error ? err.message : "Something went wrong talking to the coach.";
        toast.error(message);
        setMessages((prev) => [...prev, { id: nextMessageId(), role: "assistant", content: message, isError: true }]);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-end gap-1 border-b px-3 py-2">
          <Button type="button" variant={showHistory ? "secondary" : "ghost"} size="sm" className="gap-1.5" onClick={() => setShowHistory((v) => !v)} aria-pressed={showHistory}>
            <History className="h-4 w-4" /> Saved chats
          </Button>
          <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={newChat}>
            <MessageSquarePlus className="h-4 w-4" /> New chat
          </Button>
        </div>
        {showHistory ? (
          <SavedChatsList
            app="journal"
            activeId={conversationId}
            onOpen={openSaved}
            onDeletedActive={newChat}
            upgradeHref="/journal/pricing"
            className="max-h-[55vh] min-h-[320px] overflow-y-auto"
          />
        ) : (
        <div ref={scrollRef} className="max-h-[55vh] min-h-[320px] space-y-4 overflow-y-auto p-4 sm:p-6">
          {tradesLoading && (
            <p className="text-center text-xs text-muted-foreground">Loading your trade history for context...</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                }`}
              >
                {m.role === "user" ? <UserIcon className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : m.isError
                      ? "bg-destructive/10 text-destructive"
                      : "bg-secondary/60 text-foreground"
                }`}
              >
                {m.role === "user" ? <p className="text-sm leading-relaxed">{m.content}</p> : renderCoachText(m.content)}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex items-start gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl bg-secondary/60 px-4 py-2.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2 border-t p-3 sm:p-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your trades, a strategy, or your discipline..."
            disabled={sending}
          />
          <Button type="submit" disabled={sending || !input.trim()} size="icon" aria-label="Send message">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Weekly Review tab — port of generateWeeklyReview.
// ─────────────────────────────────────────────────────────────────────────
function WeeklyReviewTab({
  trades,
  tradesLoading,
  onInsufficientTokens,
  onWalletChange,
}: {
  trades: Trade[];
  tradesLoading: boolean;
  onInsufficientTokens: (err: InsufficientTokensError) => void;
  onWalletChange: () => void;
}) {
  const [review, setReview] = useState<string | null>(null);
  const [tradeCount, setTradeCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (trades.length === 0) {
      toast.error("No trades to review yet — add some trades first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await coach.weeklyReview({ trades });
      setReview(res.review);
      setTradeCount(res.trade_count);
      onWalletChange();
    } catch (err) {
      if (err instanceof InsufficientTokensError) {
        onInsufficientTokens(err);
      } else {
        const message = err instanceof Error ? err.message : "Could not generate the weekly review.";
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Weekly Review</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            A structured AI summary of your trading — what worked, what didn't, and what to focus on next.
          </p>
        </div>
        <Button onClick={generate} disabled={loading || tradesLoading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            "Generate Review"
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!review && !loading && !error && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Click "Generate Review" for an AI breakdown of your recent trading activity.
          </p>
        )}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Reviewing your trades...
          </div>
        )}
        {error && !loading && <p className="py-4 text-center text-sm text-destructive">{error}</p>}
        {review && !loading && (
          <div>
            {tradeCount != null && (
              <p className="mb-3 text-xs text-muted-foreground">Based on {tradeCount} trade{tradeCount === 1 ? "" : "s"}</p>
            )}
            <div className="rounded-xl bg-secondary/50 p-4">{renderCoachText(review)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Pre-Trade Check tab — port of showPreTradeReminder, modernized from a
// blocking `alert()` popup into an inline form + verdict card.
// ─────────────────────────────────────────────────────────────────────────
interface PreTradeForm {
  symbol: string;
  trade_type: string;
  market: string;
  strategy: string;
  risk_amount: string;
  potential_profit: string;
}

const EMPTY_PRETRADE_FORM: PreTradeForm = {
  symbol: "",
  trade_type: "",
  market: "",
  strategy: "",
  risk_amount: "",
  potential_profit: "",
};

function PreTradeTab({
  onInsufficientTokens,
  onWalletChange,
}: {
  onInsufficientTokens: (err: InsufficientTokensError) => void;
  onWalletChange: () => void;
}) {
  const { symbol } = useCurrency();
  const [form, setForm] = useState<PreTradeForm>(EMPTY_PRETRADE_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ reminder: string; riskReward: number; symbol: string } | null>(null);

  function setField<K extends keyof PreTradeForm>(key: K, value: PreTradeForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await coach.preTradeCheck({
        symbol: form.symbol || undefined,
        trade_type: form.trade_type || undefined,
        market: form.market || undefined,
        strategy: form.strategy || undefined,
        risk_amount: form.risk_amount ? Number(form.risk_amount) : undefined,
        potential_profit: form.potential_profit ? Number(form.potential_profit) : undefined,
      });
      setResult({ reminder: res.reminder, riskReward: res.risk_reward, symbol: res.symbol });
      onWalletChange();
    } catch (err) {
      if (err instanceof InsufficientTokensError) {
        onInsufficientTokens(err);
      } else {
        toast.error(err instanceof Error ? err.message : "Could not run the pre-trade check.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pre-Trade Check</CardTitle>
          <p className="text-sm text-muted-foreground">Get a quick GO / WAIT / DON'T TRADE read before you enter.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pt-symbol">Symbol</Label>
              <Input id="pt-symbol" value={form.symbol} onChange={(e) => setField("symbol", e.target.value)} placeholder="e.g., NIFTY, RELIANCE" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Trade Type</Label>
                <Select value={form.trade_type} onValueChange={(v) => setField("trade_type", v)}>
                  <SelectTrigger aria-label="Trade Type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADING_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Market</Label>
                <Select value={form.market} onValueChange={(v) => setField("market", v)}>
                  <SelectTrigger aria-label="Market">
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADE_MARKETS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {marketLabel(m)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pt-strategy">Strategy</Label>
              <Input id="pt-strategy" value={form.strategy} onChange={(e) => setField("strategy", e.target.value)} placeholder="e.g., Breakout" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pt-risk">Risk Amount</Label>
                <AmountInput
                  id="pt-risk"
                  symbol={symbol}
                  indian={symbol.trim() === "₹"}
                  value={form.risk_amount}
                  onChange={(e) => setField("risk_amount", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pt-profit">Potential Profit</Label>
                <AmountInput
                  id="pt-profit"
                  symbol={symbol}
                  indian={symbol.trim() === "₹"}
                  value={form.potential_profit}
                  onChange={(e) => setField("potential_profit", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...
                </>
              ) : (
                "Check This Trade"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verdict</CardTitle>
        </CardHeader>
        <CardContent>
          {!result && !loading && (
            <p className="py-8 text-center text-sm text-muted-foreground">Fill in the trade details and run a check to see the AI's read here.</p>
          )}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Assessing {form.symbol || "your trade"}...
            </div>
          )}
          {result && !loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{result.symbol}</span>
                <Badge variant="outline">R:R {result.riskReward.toFixed(2)}:1</Badge>
              </div>
              <div className="rounded-xl bg-secondary/50 p-4">{renderCoachText(result.reminder)}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Insights tab — SIMPLIFIED port of loadProfile/analyzeAllTrades. Only
// POST /journal/analyze's rule-based `insights.issues`/`insights.strengths`
// are shown (free, no AI call, no wallet gating) — the per-strategy and
// per-emotion breakdowns `analyze` also returns are intentionally NOT
// re-rendered here since pages/Analytics.tsx and pages/Psychology.tsx
// already show that exact data as real tables/charts (see file header
// comment).
// ─────────────────────────────────────────────────────────────────────────
function InsightsTab({ trades, tradesLoading, active }: { trades: Trade[]; tradesLoading: boolean; active: boolean }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["journal", "coach", "analyze", trades.length],
    queryFn: () => coach.analyze(trades),
    enabled: active && !tradesLoading,
  });

  if (tradesLoading || (isLoading && active)) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Crunching your trade history...
      </div>
    );
  }

  if (isError) {
    return <p className="py-8 text-center text-sm text-destructive">{error instanceof Error ? error.message : "Could not load insights."}</p>;
  }

  if (!data) return null;

  const { issues, strengths } = data.insights;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Rule-based flags from your trade history — for the full strategy and emotion breakdowns, see{" "}
        <Link to="/journal/analytics" className="text-primary underline underline-offset-2">
          Analytics
        </Link>{" "}
        and{" "}
        <Link to="/journal/psychology" className="text-primary underline underline-offset-2">
          Psychology
        </Link>
        .
      </p>

      {issues.length === 0 && strengths.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">No flags yet — keep logging trades.</CardContent>
        </Card>
      )}

      {issues.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <TrendingDown className="h-4 w-4 text-destructive" /> Needs Attention
          </h3>
          {issues.map((issue) => (
            <Card key={issue.title}>
              <CardContent className="p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                    {issue.title}
                  </span>
                  <Badge variant={severityBadgeVariant(issue.severity)}>{issue.metric}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{issue.insight}</p>
                {issue.action && <p className="mt-2 text-sm text-foreground">{issue.action}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {strengths.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <TrendingUp className="h-4 w-4 text-success" /> Working Well
          </h3>
          {strengths.map((s) => (
            <Card key={s.title}>
              <CardContent className="p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <CircleCheck className="h-3.5 w-3.5 text-success shrink-0" />
                    {s.title}
                  </span>
                  <Badge variant="outline">{s.metric}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{s.insight}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Alerts tab — port of checkBehavioralAlerts/displayBehavioralAlerts.
// GET /journal/behavioral-alerts is a trivial always-empty stub server-side
// (aiCoach.controller.ts's own comment) — wired up for forward-compat, kept
// to a plain empty state rather than speculative UI for data that never
// arrives today.
// ─────────────────────────────────────────────────────────────────────────
function AlertsTab({ active }: { active: boolean }) {
  const { data, isLoading } = useQuery({
    queryKey: ["journal", "coach", "behavioral-alerts"],
    queryFn: () => coach.behavioralAlerts(),
    enabled: active,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Behavioral Alerts</CardTitle>
        <p className="text-sm text-muted-foreground">Automatic flags for risky patterns as they're detected.</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking for alerts...
          </div>
        ) : !data || data.alerts.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <BellRing className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            No behavioral alerts right now — you're all clear.
          </div>
        ) : (
          <div className="space-y-3">
            {data.alerts.map((alert, i) => (
              <div key={i} className="rounded-lg bg-secondary/50 p-3 text-sm">
                {alert.title && <p className="font-semibold text-foreground">{alert.title}</p>}
                {alert.message && <p className="text-muted-foreground">{alert.message}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
