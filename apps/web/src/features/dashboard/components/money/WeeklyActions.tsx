// "Do these this week": up to three fixes picked from the money health parts,
// biggest score gain first. "Mark done" ticks one off on this device for a
// week; the score itself only moves when the numbers behind it change.

import { useEffect, useState } from "react";
import { Check, HeartPulse, Landmark, PiggyBank, ShieldCheck, Target, Umbrella, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { WeeklyAction } from "../../lib/money";
import { CARD, SECTION_TITLE } from "./styles";
import { Chip, IconTile } from "./ui";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const ICONS: Record<string, typeof HeartPulse> = {
  "set-monthly": Wallet,
  safety: ShieldCheck,
  debt: Landmark,
  savings: PiggyBank,
  insurance: Umbrella,
};

function readDone(key: string): Record<string, number> {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "{}");
    const now = Date.now();
    return Object.fromEntries(Object.entries(raw).filter(([, at]) => typeof at === "number" && now - at < WEEK_MS)) as Record<string, number>;
  } catch {
    return {};
  }
}

export default function WeeklyActions({ actions, storageKey }: { actions: WeeklyAction[]; storageKey: string }) {
  const [done, setDone] = useState<Record<string, number>>(() => readDone(storageKey));
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(done));
    } catch {
      /* private mode: ticks just won't persist */
    }
  }, [done, storageKey]);

  const toggle = (key: string) =>
    setDone((d) => {
      const next = { ...d };
      if (next[key]) delete next[key];
      else next[key] = Date.now();
      return next;
    });

  const doneCount = actions.filter((a) => done[a.key]).length;

  return (
    <section aria-labelledby="week-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="week-title" className={SECTION_TITLE}>Do these this week</h2>
          <p className="mt-1 text-sm text-muted-foreground">Picked from your numbers, the biggest win first.</p>
        </div>
        {actions.length > 0 && (
          <Chip tone="good">
            {doneCount} of {actions.length} done
          </Chip>
        )}
      </div>

      {actions.length === 0 ? (
        <div className={cn(CARD, "text-sm text-muted-foreground")}>Nothing urgent this week. Every part of your money health looks strong.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {actions.map((a) => {
            const isDone = Boolean(done[a.key]);
            const Icon = ICONS[a.key] ?? Target;
            return (
              <article key={a.key} className={cn(CARD, "flex flex-col gap-3 transition-colors", isDone && "border-brand")}>
                <div className="flex items-center justify-between gap-2">
                  <IconTile tone={isDone ? "good" : a.tone === "none" ? "ok" : a.tone}>
                    <Icon size={20} aria-hidden="true" />
                  </IconTile>
                  {a.points == null ? (
                    <Chip tone="none">{a.unlocks ?? "Unlocks your score"}</Chip>
                  ) : a.points > 0 ? (
                    <Chip tone="good">+{a.points} points</Chip>
                  ) : null}
                </div>
                <h3 className={cn("text-[17px] font-bold tracking-[-0.01em]", isDone && "text-muted-foreground line-through")}>{a.title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{a.text}</p>
                <div className="flex flex-wrap gap-2">
                  {a.href.startsWith("#") ? (
                    <a href={a.href} className="inline-flex min-h-[44px] items-center rounded-xl border border-border bg-card px-4 text-sm font-bold transition-colors hover:border-brand">
                      {a.cta}
                    </a>
                  ) : (
                    <Link to={a.href} className="inline-flex min-h-[44px] items-center rounded-xl border border-border bg-card px-4 text-sm font-bold transition-colors hover:border-brand">
                      {a.cta}
                    </Link>
                  )}
                  {/* Saving the monthly amount is what completes "set-monthly", so it has no tick. */}
                  {a.key !== "set-monthly" && (
                    <button
                      type="button"
                      onClick={() => toggle(a.key)}
                      aria-pressed={isDone}
                      className={cn(
                        "inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors",
                        isDone ? "bg-brand-soft text-brand" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <Check size={16} aria-hidden="true" />
                      {isDone ? "Done" : "Mark done"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
