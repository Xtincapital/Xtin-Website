// The money half of the account dashboard: Money Pulse (net worth and money
// health), the Life Road, this week's actions, where the money sits and every
// goal, then one live card per product. Everything reads the user's own data
// from one request (GET /api/dashboard/money); the "money basics" Gini has no
// fields for (monthly investing, expenses, cover) are saved to the account
// through PUT /api/dashboard/money/profile.

import "../../money.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { allocation, healthParts, healthScore, household, planGoals, weeklyActions } from "../../lib/money";
import {
  getLatestArticle,
  getMoneySummary,
  saveMoneyProfile,
  type Article,
  type MoneyProfile,
  type MoneySummary,
  type ProfilePatch,
} from "../../services/moneyService";
import AcrossXtin, { type PlanSummary } from "./AcrossXtin";
import HealthCard from "./HealthCard";
import LifeRoad from "./LifeRoad";
import MoneyBreakdown from "./MoneyBreakdown";
import MoneySetup from "./MoneySetup";
import NetWorthCard from "./NetWorthCard";
import WeeklyActions from "./WeeklyActions";
import { CARD } from "./styles";

const EMPTY_PROFILE: MoneyProfile = {
  monthlyInvesting: null,
  stepUp: 0,
  monthlyExpenses: null,
  termCover: null,
  healthCover: null,
  updatedAt: null,
};

/** Slider drags are saved once the user lets go for this long. */
const SAVE_DELAY_MS = 800;

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-[22px] border border-border bg-secondary ${className}`} />;
}

export default function MoneySection({ userKey, plans, onSeePlans }: { userKey: string; plans: PlanSummary[]; onSeePlans: () => void }) {
  // undefined while loading; null when nothing could be read.
  const [summary, setSummary] = useState<MoneySummary | null | undefined>(undefined);
  const [article, setArticle] = useState<Article | null | undefined>(undefined);
  const [profile, setProfile] = useState<MoneyProfile | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await getMoneySummary();
      if (cancelled) return;
      setSummary(s);
      setProfile(s?.profile ?? null);
      // The newsletter is public and secondary: fetch it after, not alongside.
      const a = await getLatestArticle();
      if (!cancelled) setArticle(a);
    })();
    return () => {
      cancelled = true;
    };
  }, [userKey]);

  // Saving: the screen updates at once; the server gets the change straight
  // away, or after a pause for slider drags. Changes made while a save is in
  // flight are kept on screen and go in the next save.
  const live = Boolean(summary?.live);
  const pending = useRef<ProfilePatch>({});
  const timer = useRef<number | undefined>(undefined);
  const flush = useCallback(async () => {
    const patch = pending.current;
    pending.current = {};
    if (Object.keys(patch).length === 0) return;
    const saved = await saveMoneyProfile(patch);
    setProfile({ ...saved, ...pending.current });
    setSaveFailed(false);
  }, []);
  const save = useCallback(
    async (patch: ProfilePatch, later = false) => {
      setProfile((p) => ({ ...(p ?? EMPTY_PROFILE), ...patch }));
      if (!live) return;
      pending.current = { ...pending.current, ...patch };
      window.clearTimeout(timer.current);
      if (later) {
        timer.current = window.setTimeout(() => {
          flush().catch(() => setSaveFailed(true));
        }, SAVE_DELAY_MS);
        return;
      }
      try {
        await flush();
      } catch (err) {
        setSaveFailed(true);
        throw err;
      }
    },
    [live, flush],
  );
  // Leaving the page mid-drag still saves the last value.
  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      flush().catch(() => undefined);
    },
    [flush],
  );

  const gini = summary?.gini ?? null;
  const model = useMemo(() => {
    if (!gini) return null;
    const h = household(gini.members, gini.assets, gini.liabilities);
    const plan = planGoals(gini.goals, profile?.monthlyInvesting ?? null, profile?.stepUp ?? 0);
    const parts = healthParts(h, gini.assets, gini.liabilities, gini.goals, plan.goals, profile);
    return {
      h,
      plan,
      parts,
      score: healthScore(parts),
      actions: weeklyActions(parts, plan.goals),
      slices: allocation(gini.assets),
    };
  }, [gini, profile]);

  const isEmpty = gini != null && gini.members.length + gini.assets.length + gini.liabilities.length + gini.goals.length === 0;

  return (
    <div className="space-y-10">
      {summary === undefined ? (
        <div className="space-y-5" aria-busy="true" aria-label="Loading your money picture">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Skeleton className="h-[420px]" />
            <Skeleton className="h-[420px]" />
          </div>
          <Skeleton className="h-[520px]" />
        </div>
      ) : !gini ? (
        <div className={`${CARD} text-sm text-muted-foreground`} role="status">
          We couldn't load your Gini numbers just now. Refresh the page to try again.
        </div>
      ) : isEmpty || !model ? (
        <MoneySetup />
      ) : (
        <>
          {saveFailed && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive" role="alert">
              Your last change couldn't be saved. It's still shown here; try changing it again in a moment.
            </div>
          )}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <NetWorthCard
              household={model.h}
              assets={gini.assets}
              liabilities={gini.liabilities}
              history={summary?.netWorthHistory ?? []}
              monthly={profile?.monthlyInvesting ?? null}
            />
            <HealthCard parts={model.parts} score={model.score} onSave={(patch) => save(patch)} canSave={live} />
          </div>
          <LifeRoad
            plan={model.plan.goals}
            monthly={profile?.monthlyInvesting ?? null}
            stepUp={profile?.stepUp ?? 0}
            onMonthly={(monthlyInvesting, dragging) => save({ monthlyInvesting }, dragging).catch(() => undefined)}
            onStepUp={(stepUp) => save({ stepUp }).catch(() => undefined)}
            totalRequired={model.plan.totalRequired}
            spare={model.plan.spare}
            age={model.h.age}
            netWorth={model.h.netWorth}
          />
          <WeeklyActions actions={model.actions} storageKey={`xt_dash_done_${userKey}`} />
          <MoneyBreakdown slices={model.slices} totalAssets={model.h.totalAssets} plan={model.plan.goals} />
        </>
      )}

      {summary === undefined || article === undefined ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[230px]" />
          ))}
        </div>
      ) : (
        <AcrossXtin
          trades={summary?.trades ?? null}
          learn={summary?.learn ?? null}
          article={article}
          plans={plans}
          tokens={summary?.tokens ?? { gini: null, journal: null }}
          onSeePlans={onSeePlans}
        />
      )}
    </div>
  );
}
