// The list of saved AI chats, shown inside Gini's chat panel and the Journal
// coach. Free users see what Pro adds instead. Uses the shadcn tokens
// (bg-card, border-border, …) both apps define.
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Loader2, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { chatWhen, savedChats, type ChatApp, type SavedChat, type SavedMessage } from "@/lib/aiChatHistory";

type Props = {
  app: ChatApp;
  /** The open conversation, highlighted in the list. */
  activeId: string | null;
  onOpen: (id: string, messages: SavedMessage[]) => void;
  /** Called when the open conversation is deleted, so the chat can start fresh. */
  onDeletedActive?: () => void;
  upgradeHref: string;
  className?: string;
};

export default function SavedChatsList({ app, activeId, onOpen, onDeletedActive, upgradeHref, className }: Props) {
  const [state, setState] = useState<{ pro: boolean; chats: SavedChat[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await savedChats.list(app);
      setState({ pro: res.pro, chats: res.conversations });
    } catch (e) {
      setError((e as Error).message);
    }
  }, [app]);

  useEffect(() => {
    load();
  }, [load]);

  const open = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      const res = await savedChats.open(app, id);
      onOpen(id, res.messages);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (chat: SavedChat) => {
    if (!window.confirm(`Delete “${chat.title}”?`)) return;
    setBusyId(chat.id);
    try {
      await savedChats.remove(app, chat.id);
      setState((s) => (s ? { ...s, chats: s.chats.filter((c) => c.id !== chat.id) } : s));
      if (chat.id === activeId) onDeletedActive?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  if (error && !state) {
    return (
      <div className={cn("p-4 text-sm text-destructive", className)}>
        {error}{" "}
        <button type="button" onClick={load} className="font-semibold underline underline-offset-2">Try again</button>
      </div>
    );
  }
  if (!state) {
    return (
      <div className={cn("flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground", className)}>
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your chats…
      </div>
    );
  }
  if (!state.pro) {
    return (
      <div className={cn("p-4", className)}>
        <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Crown className="h-4 w-4 text-amber-500" /> Saved chats are a Pro perk
          </div>
          <p className="mt-1.5 text-muted-foreground">With Pro, every conversation is saved so you can come back to it, pick up where you left off, or delete it.</p>
          <Link to={upgradeHref} className="mt-3 inline-flex rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            See Pro
          </Link>
        </div>
      </div>
    );
  }
  if (!state.chats.length) {
    return (
      <div className={cn("flex flex-col items-center gap-2 p-6 text-center text-sm text-muted-foreground", className)}>
        <MessageSquare className="h-6 w-6" />
        No saved chats yet. Your conversations will appear here.
      </div>
    );
  }
  return (
    <div className={className}>
      {error && <p className="px-3 pt-2 text-xs text-destructive">{error}</p>}
      <ul className="divide-y divide-border">
        {state.chats.map((c) => (
          <li key={c.id} className={cn("group flex items-center gap-1", c.id === activeId && "bg-secondary/60")}>
            <button
              type="button"
              onClick={() => open(c.id)}
              disabled={busyId !== null}
              className="min-w-0 flex-1 px-3 py-2.5 text-left transition hover:bg-secondary/40 disabled:opacity-60"
            >
              <span className="block truncate text-sm font-medium text-foreground">{c.title}</span>
              <span className="block text-xs text-muted-foreground">{chatWhen(c.updated_at)}</span>
            </button>
            <button
              type="button"
              onClick={() => remove(c)}
              disabled={busyId !== null}
              aria-label={`Delete chat: ${c.title}`}
              className="mr-1.5 shrink-0 rounded-md p-1.5 text-muted-foreground opacity-60 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 disabled:opacity-30"
            >
              {busyId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
