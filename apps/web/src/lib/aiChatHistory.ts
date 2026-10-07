// Saved AI chats (Gini / Journal coach) — a Pro perk. Server side:
// services/api/modules/ai/chatHistory.ts. The server decides who is Pro;
// free users get `{ pro: false }` from the list call.
import authService from "@/services/authService";
import { BACKEND_URL } from "@/config/env";

export type ChatApp = "gini" | "journal";
export type SavedChat = { id: string; title: string; created_at: string; updated_at: string };
export type SavedMessage = { role: "user" | "assistant"; content: string; created_at: string };

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data as T;
}

export const savedChats = {
  list: (app: ChatApp) => call<{ pro: boolean; conversations: SavedChat[] }>(`/${app}/chat/conversations`),
  open: (app: ChatApp, id: string) => call<{ id: string; messages: SavedMessage[] }>(`/${app}/chat/conversations/${id}`),
  remove: (app: ChatApp, id: string) => call<{ success: boolean }>(`/${app}/chat/conversations/${id}`, { method: "DELETE" }),
};

/** "Today, 4:05 pm" / "Yesterday" / "12 Oct" */
export function chatWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const days = Math.floor((new Date(now.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 864e5);
  if (days === 0) return `Today, ${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}) });
}
