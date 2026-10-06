import { create } from "zustand";
import { toast } from "sonner";
import { api } from "../lib/api";

/**
 * Unread price-alert notifications for the sidebar badge, plus a pop-up the
 * first time each new one is seen in this browser session. The server checks
 * the user's price targets whenever the unread count is requested.
 */
export interface FundaNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: { ticker?: string; condition?: string; target_price?: number; price?: number } | null;
  is_read: boolean;
  created_at: string;
}

const SEEN_KEY = "fk_alert_toasts_seen";

function seenIds(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(SEEN_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function rememberSeen(ids: Set<string>) {
  try {
    sessionStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(ids).slice(-200)));
  } catch {
    // private mode etc. — worst case a pop-up repeats
  }
}

interface AlertsState {
  unread: number;
  refreshUnread: (opts?: { announce?: boolean; onOpen?: () => void }) => Promise<void>;
  setUnread: (n: number) => void;
}

// Count the list was last fetched at; only re-fetch it when the count moves.
let checkedAtCount = -1;

export const useAlertsStore = create<AlertsState>((set) => ({
  unread: 0,
  setUnread: (n) => set({ unread: Math.max(0, n) }),
  refreshUnread: async (opts = {}) => {
    try {
      const res: any = await api.alerts.getUnreadCount();
      const count = Number(res?.count ?? res?.unread_count ?? 0) || 0;
      set({ unread: count });
      if (!opts.announce || count === 0 || count === checkedAtCount) return;
      checkedAtCount = count;

      const list: FundaNotification[] = await api.alerts.getNotifications({ unreadOnly: true, limit: 10 });
      const seen = seenIds();
      const fresh = (list || []).filter((n) => !seen.has(n.id));
      fresh.slice(0, 3).forEach((n) => {
        toast(n.title, {
          description: n.message,
          duration: 10000,
          action: opts.onOpen ? { label: "View", onClick: opts.onOpen } : undefined,
        });
      });
      fresh.forEach((n) => seen.add(n.id));
      rememberSeen(seen);
    } catch {
      // not signed in / offline — keep the last count
    }
  },
}));
