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
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  Wallet,
  CalendarCheck,
  ShieldCheck,
  BellRing,
  Lightbulb,
  Bot,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CircleCheck,
  History,
  MessageSquarePlus,
} from "lucide-react";
import SavedChatsList from "@/components/ai/SavedChatsList";
import AIConversation from "@/components/smoothui/ai-conversation";
import AIMessage from "@/components/smoothui/ai-message";
import AILoader from "@/components/smoothui/ai-loader";
import AISuggestions from "@/components/smoothui/ai-suggestions";
import AIPromptInput from "@/components/smoothui/ai-prompt-input";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AmountInput from "@/components/ui/amount-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
        <h4 key={idx} className="mt-3 flex items-center gap-1.5 text-base font-semibold text-foreground first:mt-0">
          <span className="text-brand">{numberedHeading[1]}.</span> {numberedHeading[2]}
        </h4>,
      );
    } else if (isHashHeading) {
      blocks.push(
        <h4 key={idx} className="mt-3 text-base font-semibold text-foreground first:mt-0">
          {line.replace(/^#{1,3}\s+/, "")}
        </h4>,
      );
    } else if (isFullyBold) {
      blocks.push(
        <h4 key={idx} className="mt-3 text-base font-semibold text-foreground first:mt-0">
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

type CoachView = "chat" | "weekly" | "pretrade" | "insights" | "alerts";

const TOOLS: { id: Exclude<CoachView, "chat">; label: string; hint: string; icon: typeof Bot }[] = [
  { id: "weekly", label: "Weekly Review", hint: "A written review of your week", icon: CalendarCheck },
  { id: "pretrade", label: "Pre-Trade Check", hint: "Sanity-check a trade before you take it", icon: ShieldCheck },
  { id: "insights", label: "Insights", hint: "Strengths and habits to fix", icon: Lightbulb },
  { id: "alerts", label: "Alerts", hint: "Behaviour warnings", icon: BellRing },
];

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

  // Full trade history + goals, reused across every tool — same pragmatic
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

  const [view, setView] = useState<CoachView>("chat");
  // Bumping this starts a fresh conversation in the chat panel.
  const [chatSession, setChatSession] = useState(0);
  const [openChat, setOpenChat] = useState<{ id: string; messages: { role: "user" | "assistant"; content: string }[] } | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const newChat = () => {
    setOpenChat(null);
    setActiveChatId(null);
    setChatSession((n) => n + 1);
    setView("chat");
    setPanelOpen(false);
  };

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

  const tool = TOOLS.find((t) => t.id === view);

  const sidePanel = (
    <div className="flex h-full min-h-0 flex-col gap-4 p-3">
      <Button onClick={newChat} className="w-full justify-start gap-2">
        <MessageSquarePlus className="h-4 w-4" /> New chat
      </Button>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <p className="xt-label px-2 pb-1.5">Your chats</p>
        <SavedChatsList
          app="journal"
          activeId={activeChatId}
          onOpen={(id, saved) => {
            setOpenChat({ id, messages: saved });
            setActiveChatId(id);
            setChatSession((n) => n + 1);
            setView("chat");
            setPanelOpen(false);
          }}
          onDeletedActive={newChat}
          upgradeHref="/journal/pricing"
          className="text-sm"
        />

        <p className="xt-label px-2 pb-1.5 pt-5">Coach tools</p>
        <ul className="grid gap-0.5">
          {TOOLS.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  setView(t.id);
                  setPanelOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                  view === t.id ? "bg-brand-soft text-brand" : "text-foreground hover:bg-secondary",
                )}
              >
                <t.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block font-medium">{t.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{t.hint}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* AI token wallet */}
      <div className="grid gap-2.5 rounded-xl border bg-secondary/40 p-3">
        <div className="flex items-center gap-2.5">
          <Wallet className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">AI tokens</p>
            <p className="text-sm font-bold tabular-nums text-foreground">
              {walletLoading && !wallet ? "Loading…" : wallet ? formatTokens(wallet.token_balance) : "—"}
            </p>
          </div>
          <Badge variant={clientTier === "pro" ? "default" : "outline"} className="shrink-0 uppercase">
            {clientTier}
          </Badge>
        </div>
        <Button asChild size="sm" variant="outline" className="w-full">
          <Link to="/journal/pricing">Top up tokens</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <JournalLayout>
      <div className="max-w-7xl mx-auto">
        <div className="grid h-[calc(100dvh-14rem)] min-h-[34rem] overflow-hidden rounded-2xl border bg-card lg:grid-cols-[17rem_minmax(0,1fr)]">
          {/* Side panel: fixed on desktop, a slide-over on smaller screens */}
          <aside className="hidden min-h-0 border-r lg:block">{sidePanel}</aside>
          {panelOpen && (
            <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-label="Chats and tools">
              <button type="button" aria-label="Close" className="absolute inset-0 bg-black/40" onClick={() => setPanelOpen(false)} />
              <div className="absolute inset-y-0 left-0 w-[min(20rem,85vw)] border-r bg-card shadow-xl">{sidePanel}</div>
            </div>
          )}

          <section className="flex min-h-0 min-w-0 flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={() => setPanelOpen(true)} aria-label="Chats and tools">
                <History className="h-4 w-4" />
              </Button>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-fill text-white">
                {tool ? <tool.icon className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </span>
              <div className="min-w-0">
                {/* role=heading, not <h1>: journal.css sizes every page h1 as a page title. */}
                <p role="heading" aria-level={1} className="truncate text-base font-bold text-foreground">
                  {tool ? tool.label : "AI Coach"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {tool
                    ? tool.hint
                    : tradesLoading
                      ? "Reading your trade history…"
                      : `Knows your ${allTrades.length.toLocaleString("en-IN")} logged trade${allTrades.length === 1 ? "" : "s"}`}
                </p>
              </div>
              {tool && (
                <Button type="button" variant="outline" size="sm" className="ml-auto gap-1.5" onClick={() => setView("chat")}>
                  <Bot className="h-4 w-4" /> Back to chat
                </Button>
              )}
            </div>

            {view === "chat" ? (
              <ChatPanel
                key={chatSession}
                initial={openChat}
                trades={allTrades}
                tradesLoading={tradesLoading}
                goals={goalsData ?? []}
                displayName={displayName}
                clientTier={clientTier}
                currency={currency}
                onInsufficientTokens={handleInsufficientTokens}
                onWalletChange={fetchWallet}
                onConversation={setActiveChatId}
              />
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                {view === "weekly" && <WeeklyReviewTab trades={allTrades} tradesLoading={tradesLoading} onInsufficientTokens={handleInsufficientTokens} onWalletChange={fetchWallet} />}
                {view === "pretrade" && <PreTradeTab onInsufficientTokens={handleInsufficientTokens} onWalletChange={fetchWallet} />}
                {view === "insights" && <InsightsTab trades={allTrades} tradesLoading={tradesLoading} active />}
                {view === "alerts" && <AlertsTab active />}
              </div>
            )}
          </section>
        </div>
      </div>
    </JournalLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Chat — a full conversation view built on SmoothUI's AI pieces
// (AIConversation scroll container, AIMessage, AILoader, AISuggestions,
// AIPromptInput). The open conversation lives in component state; the last
// messages go with every request so the coach remembers the thread, and Pro
// users' exchanges are saved server-side (see the file header).
// ─────────────────────────────────────────────────────────────────────────
const STARTERS = [
  "Why am I losing money lately?",
  "Which strategy should I stop trading?",
  "How are my emotions affecting my P&L?",
  "Review my last 10 trades",
  "What time of day do I trade best?",
  "Am I sizing my positions sensibly?",
];

function CoachAvatar() {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-brand" aria-hidden="true">
      <Sparkles className="h-4 w-4" />
    </span>
  );
}

function ChatPanel({
  initial,
  trades,
  tradesLoading,
  goals,
  displayName,
  clientTier,
  currency,
  onInsufficientTokens,
  onWalletChange,
  onConversation,
}: {
  initial: { id: string; messages: { role: "user" | "assistant"; content: string }[] } | null;
  trades: Trade[];
  tradesLoading: boolean;
  goals: { title: string; metric: string; timeframe: string; target_value: number }[];
  displayName: string;
  clientTier: "free" | "pro";
  currency: string;
  onInsufficientTokens: (err: InsufficientTokensError) => void;
  onWalletChange: () => void;
  onConversation: (id: string | null) => void;
}) {
  const [messages, setMessages] = useState<ChatBubble[]>(() =>
    (initial?.messages ?? []).map((m) => ({ id: nextMessageId(), role: m.role, content: m.content })),
  );
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(initial?.id ?? null);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || sending) return;

    // History excludes the message being sent (the server appends it).
    const history: ChatHistoryMessage[] = messages.filter((m) => !m.isError).map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev.filter((m) => !m.isError), { id: nextMessageId(), role: "user", content: clean }]);
    setDraft("");
    setSending(true);

    try {
      const res = await coach.chat({
        message: clean,
        // Amounts in the currency the coach is told to use.
        trades: trades.map((t) => tradeInCurrency(t, currency)),
        display_name: displayName,
        history,
        goals: goals.map((g) => ({ title: g.title, target: g.target_value, metric: g.metric, timeframe: g.timeframe })),
        client_tier: clientTier,
        currency,
        conversation_id: conversationId,
      });
      if (res.conversation_id) {
        setConversationId(res.conversation_id);
        onConversation(res.conversation_id);
      }
      setMessages((prev) => [...prev, { id: nextMessageId(), role: "assistant", content: res.reply }]);
      onWalletChange();
    } catch (err) {
      if (err instanceof InsufficientTokensError) {
        onInsufficientTokens(err);
        setMessages((prev) => [...prev, { id: nextMessageId(), role: "assistant", content: "I'm out of AI tokens for your account — top up to keep chatting.", isError: true }]);
      } else {
        const message = err instanceof Error ? err.message : "Something went wrong talking to the coach.";
        setMessages((prev) => [...prev, { id: nextMessageId(), role: "assistant", content: message, isError: true }]);
      }
    } finally {
      setSending(false);
    }
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const greeting = displayName ? `Hi ${displayName.charAt(0).toUpperCase()}${displayName.slice(1)}` : "Hi there";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AIConversation className="min-h-0 flex-1" contentKey={`${messages.length}-${sending}`}>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
          {messages.length === 0 ? (
            // Empty conversation: a greeting and a few ways to start.
            <div className="flex flex-col items-center gap-6 py-10 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-fill text-white shadow-lg shadow-brand/25">
                <Sparkles className="h-6 w-6" />
              </span>
              <div>
                <p role="heading" aria-level={2} className="text-2xl font-bold tracking-[-0.02em] text-foreground">
                  {greeting}, what should we work on?
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  I read your actual trade history{trades.length ? ` (${trades.length.toLocaleString("en-IN")} trades)` : ""} and give specific, honest feedback on your performance, strategies and discipline.
                </p>
              </div>
              <AISuggestions
                suggestions={STARTERS.map((label, i) => ({ id: String(i), label }))}
                onSelect={(sug) => send(sug.label)}
                className="justify-center"
              />
            </div>
          ) : (
            messages.map((m) => (
              <AIMessage
                key={m.id}
                from={m.role}
                bubble={m.role === "user" || !!m.isError}
                avatar={m.role === "assistant" ? <CoachAvatar /> : undefined}
                copyText={m.role === "assistant" && !m.isError ? m.content : undefined}
                onRetry={m.isError && lastUser ? () => send(lastUser.content) : undefined}
              >
                {m.role === "user" ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : m.isError ? (
                  <p className="text-destructive">{m.content}</p>
                ) : (
                  renderCoachText(m.content)
                )}
              </AIMessage>
            ))
          )}
          {sending && (
            <div className="flex items-center gap-2.5">
              <CoachAvatar />
              <AILoader variant="dots" label="Reading your trades…" />
            </div>
          )}
        </div>
      </AIConversation>

      {/* Composer */}
      <div className="border-t bg-card px-4 pb-4 pt-3 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <AIPromptInput
            aria-label="Message the AI Coach"
            value={draft}
            onValueChange={setDraft}
            onSubmit={send}
            disabled={sending}
            state={sending ? "thinking" : "idle"}
            maxLength={2000}
            placeholder={tradesLoading ? "Loading your trades…" : "Ask about your trades, a strategy or your discipline…"}
          />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Enter to send · Shift + Enter for a new line · The coach can make mistakes and isn't investment advice.
          </p>
        </div>
      </div>
    </div>
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
          <CardTitle className="text-lg">Weekly Review</CardTitle>
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
          <CardTitle className="text-lg">Pre-Trade Check</CardTitle>
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
          <CardTitle className="text-lg">Verdict</CardTitle>
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
        <Link to="/journal/analytics" className="text-brand underline underline-offset-2">
          Analytics
        </Link>{" "}
        and{" "}
        <Link to="/journal/psychology" className="text-brand underline underline-offset-2">
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
          <h3 className="flex items-center gap-1.5 text-base font-semibold text-foreground">
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
          <h3 className="flex items-center gap-1.5 text-base font-semibold text-foreground">
            <TrendingUp className="h-4 w-4 text-brand" /> Working Well
          </h3>
          {strengths.map((s) => (
            <Card key={s.title}>
              <CardContent className="p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <CircleCheck className="h-3.5 w-3.5 text-brand shrink-0" />
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
        <CardTitle className="text-lg">Behavioral Alerts</CardTitle>
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
