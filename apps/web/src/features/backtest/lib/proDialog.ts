// One "Pro required" popup for the whole Backtest app. Any page (or a server
// PRO_REQUIRED / paywall answer) opens it with what the user tried and why it
// is blocked; <ProRequiredDialog/> in BacktestApp renders it.
import { create } from "zustand";
import { isProRequired } from "./api";

export type ProReason = "quota" | "options" | "intraday" | "full_history" | "unlimited_strategies" | "advanced_analytics" | "ai";

type State = {
  open: boolean;
  reason: ProReason;
  message: string;
  show: (reason: ProReason, message?: string) => void;
  close: () => void;
};

export const useProDialog = create<State>((set) => ({
  open: false,
  reason: "quota",
  message: "",
  show: (reason, message = "") => set({ open: true, reason, message }),
  close: () => set({ open: false }),
}));

const REASONS = new Set<ProReason>(["quota", "options", "intraday", "full_history", "unlimited_strategies", "advanced_analytics", "ai"]);

/** Opens the popup for a server `PRO_REQUIRED` error. Returns true when it did. */
export function showProRequired(err: unknown): boolean {
  if (!isProRequired(err)) return false;
  const reason = REASONS.has(err.feature as ProReason) ? (err.feature as ProReason) : "quota";
  useProDialog.getState().show(reason, err.message);
  return true;
}
