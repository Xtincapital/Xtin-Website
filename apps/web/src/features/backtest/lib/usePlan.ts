// The signed-in user's Backtest plan, shared by every page (one cached query).
// Until it loads we treat the user as Pro-capable for display so free users
// don't see locks flash on Pro accounts; the server enforces the real limits.
import { useQuery } from "@tanstack/react-query";
import { backtestApi } from "./api";
import type { Feature } from "./types";

export function usePlan() {
  const query = useQuery({ queryKey: ["bt-plan"], queryFn: backtestApi.plan, retry: 0, staleTime: 30_000 });
  const plan = query.data;
  const loaded = Boolean(plan);
  const isPro = plan?.tier === "pro";
  return {
    plan,
    loaded,
    isPro,
    /** True when the feature is locked for this (loaded, non-Pro) account. */
    locked: (f: Feature) => loaded && !isPro && plan?.features?.[f] === false,
    historyDays: plan?.history_days ?? null,
    strategyLimit: plan?.saved_strategies_limit ?? null,
  };
}

/** "YYYY-MM-DD" of the earliest date a free account may start a test from. */
export const earliestStart = (historyDays: number | null) =>
  historyDays === null ? null : new Date(Date.now() - historyDays * 86_400_000).toISOString().slice(0, 10);
