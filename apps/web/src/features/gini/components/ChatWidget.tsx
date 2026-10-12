// Gini floating AI chat widget — reproduces the original standalone app's
// `#chatbotToggle`/`#chatbotWindow` floating widget
// (features-incoming/gini/index.html, ~lines 2904-2972; wiring in app.js's
// `setupChatbot()`, ~lines 1157-1222 + the form submit handler, ~lines
// 1520-1583) as a fresh, self-contained React component — not a port of the
// vanilla-JS DOM code, just its UI/interaction shape:
//   - A fixed floating toggle button that opens/closes a slide-up panel.
//   - Header: title/subtitle + a token-balance badge (the original's
//     `#chatbotLimitBadge`, here backed by the REAL server-side wallet via
//     ../store/useGiniPlanStore instead of the original's client-side
//     localStorage `CHAT_LIMITS` quota — see that store's header comment).
//     The original's health-score ring badge is NOT reproduced here: it
//     depended on the original's own `updateHealthScoreBadge()` reading
//     live DOM state this widget has no equivalent source for, and Gini's
//     Dashboard page already surfaces an equivalent health score — adding a
//     second, different one here would be confusing, not port-faithful.
//   - Quick-action buttons (health/goals/next/portfolio) — copied verbatim
//     from app.js's quick-action prompts.
//   - Message list (user/assistant bubbles) + input + send, backed by
//     ../lib/api's `api.chat.send(message, history)` (POST /gini/chat, real
//     server-side wallet gating — see chat.controller.ts).
//
// 402 (insufficient balance) detection: `../lib/api.ts`'s shared `request()`
// helper (and this store's own `request()`) both discard the HTTP status
// code — a failed call surfaces only as `Error(message)`, where `message`
// is chat.controller.ts's error body's `error` field. On a 402 specifically,
// that's always `aiWallet.repository.ts`'s `InsufficientAiTokensError`
// message ("AI token balance is low. Please recharge to continue."),
// checked directly against that source file. Since no status code survives
// to this layer, insufficient-balance is detected by matching that known
// message text (see `isInsufficientBalanceError` below) rather than a
// `.status === 402` check — a deliberate judgement call given the API
// surface actually available here (see this task's final report).
//
// Chat history: the open conversation lives in component state. Pro users'
// conversations are also saved server-side (services/api/modules/ai/chatHistory.ts)
// and listed under the History button; free users see the Pro upsell there.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X, Send, Loader2, Coins, HeartPulse, Target, ArrowRight, PieChart, History, MessageSquarePlus } from "lucide-react";
import AiLauncher from "@/components/AiLauncher";
import SavedChatsList from "@/components/ai/SavedChatsList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api, type ChatHistoryEntry } from "../lib/api";
import { useGiniPlanStore, formatTokens } from "../store/useGiniPlanStore";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm Gini, your AI financial advisor. I can help with financial health checks, goal planning, portfolio analysis, retirement planning and investment strategies. Ask me anything, or try a quick action below.",
};

// Copied verbatim from app.js's quick-action prompt strings (~lines
// 1482-1493).
const QUICK_ACTIONS = [
  { key: "health", label: "Health Check", icon: HeartPulse, prompt: "How am I doing financially? Give me a quick health check." },
  { key: "goals", label: "Goal Review", icon: Target, prompt: "Review my financial goals and tell me if I am on track." },
  { key: "next", label: "What's Next?", icon: ArrowRight, prompt: "What should I focus on next? Give me my top priorities." },
  { key: "portfolio", label: "Portfolio", icon: PieChart, prompt: "How does my portfolio look? Any changes needed?" },
];

// See header comment — the exact text of
// aiWallet.repository.ts's `InsufficientAiTokensError` message.
function isInsufficientBalanceError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? "");
  return /token balance is low/i.test(message);
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg-${Date.now()}-${idCounter}`;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [view, setView] = useState<"chat" | "history">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const wallet = useGiniPlanStore((s) => s.wallet);
  const fetchWallet = useGiniPlanStore((s) => s.fetchWallet);

  // Fetch the wallet balance lazily, the first time the panel opens.
  useEffect(() => {
    if (open && !wallet) {
      fetchWallet();
    }
  }, [open, wallet, fetchWallet]);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  function historyFor(msgs: ChatMessage[]): ChatHistoryEntry[] {
    return msgs
      .filter((m) => m.id !== "welcome" && !m.pending)
      .map((m) => ({ role: m.role, content: m.content }));
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending || blocked) return;

    const userMsg: ChatMessage = { id: nextId(), role: "user", content: trimmed };
    const history = historyFor(messages);
    const pendingId = nextId();

    setMessages((prev) => [...prev, userMsg, { id: pendingId, role: "assistant", content: "", pending: true }]);
    setInput("");
    setSending(true);

    try {
      const res = await api.chat.send(trimmed, history, conversationId);
      if (res.conversation_id) setConversationId(res.conversation_id);
      setMessages((prev) => prev.map((m) => (m.id === pendingId ? { id: pendingId, role: "assistant", content: res.reply } : m)));
      fetchWallet();
    } catch (err) {
      if (isInsufficientBalanceError(err)) {
        setBlocked(true);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId
              ? {
                  id: pendingId,
                  role: "assistant",
                  content:
                    "__INSUFFICIENT_BALANCE__",
                }
              : m
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId
              ? { id: pendingId, role: "assistant", content: "I apologize, but I encountered an error. Please try again." }
              : m
          )
        );
      }
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleNewChat() {
    setMessages([WELCOME_MESSAGE]);
    setBlocked(false);
    setConversationId(null);
    setView("chat");
  }

  function openSaved(id: string, saved: { role: "user" | "assistant"; content: string }[]) {
    setMessages(saved.map((m) => ({ id: nextId(), role: m.role, content: m.content })));
    setConversationId(id);
    setBlocked(false);
    setView("chat");
  }

  return (
    <>
      {/* Toggle button */}
      {open ? (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close Gini AI Chat"
          className="fixed bottom-6 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-teal-300 to-amber-300 p-[1.5px] shadow-[0_10px_30px_-6px_rgba(2,6,23,0.55)] transition-transform hover:scale-105"
        >
          <span className="flex h-full w-full items-center justify-center rounded-full bg-[#0b1220] text-white"><X className="h-6 w-6" /></span>
        </button>
      ) : (
        <AiLauncher label="Ask Gini" sub="Your AI planner" onClick={() => setOpen(true)} />
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="min-w-0">
              <p className="font-semibold leading-tight">Gini</p>
              <p className="text-xs text-primary-foreground/70">Your Financial Advisor</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium">
                <Coins className="h-3 w-3" />
                {wallet ? `${formatTokens(wallet.token_balance)} AI tokens left` : "Loading tokens…"}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setView((v) => (v === "history" ? "chat" : "history"))}
                title="Saved chats"
                aria-label="Saved chats"
                aria-pressed={view === "history"}
                className={cn(
                  "rounded-md p-1.5 text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground",
                  view === "history" && "bg-white/15 text-primary-foreground"
                )}
              >
                <History className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNewChat}
                title="New chat"
                aria-label="Start a new chat"
                className="rounded-md p-1.5 text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground"
              >
                <MessageSquarePlus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Close"
                aria-label="Close chat window"
                className="rounded-md p-1.5 text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {view === "history" ? (
            <div className="flex-1 overflow-y-auto">
              <p className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Saved chats</p>
              <SavedChatsList app="gini" activeId={conversationId} onOpen={openSaved} onDeletedActive={handleNewChat} upgradeHref="/gini/pricing" />
            </div>
          ) : (
          <>
          {/* Quick actions */}
          <div className="flex flex-wrap gap-1.5 border-b border-border px-3 py-2">
            {QUICK_ACTIONS.map((qa) => (
              <button
                key={qa.key}
                type="button"
                disabled={sending || blocked}
                onClick={() => sendMessage(qa.prompt)}
                className="flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <qa.icon className="h-3 w-3" />
                {qa.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex items-start gap-2", m.role === "user" && "flex-row-reverse")}>
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    m.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
                  )}
                >
                  {m.role === "user" ? "U" : "G"}
                </div>
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {m.pending ? (
                    <span className="flex items-center gap-1 py-0.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                    </span>
                  ) : m.content === "__INSUFFICIENT_BALANCE__" ? (
                    <span>
                      Your AI token balance is finished. Add a token pack or upgrade to Pro to continue —{" "}
                      <Link to="/gini/pricing" className="font-semibold underline underline-offset-2" onClick={() => setOpen(false)}>
                        view plans on the Pricing page
                      </Link>
                      .
                    </span>
                  ) : (
                    m.content.split(/\n\n+/).map((para, i) => (
                      <p key={i} className={i > 0 ? "mt-2" : undefined}>
                        {para}
                      </p>
                    ))
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-2.5">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={blocked ? "AI tokens finished. Add credits to continue." : "Ask about your finances..."}
              disabled={sending || blocked}
              autoComplete="off"
              aria-label="Chat message input"
              className="h-9"
            />
            <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={sending || blocked || !input.trim()} aria-label="Send message">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          </>
          )}
        </div>
      )}
    </>
  );
}
