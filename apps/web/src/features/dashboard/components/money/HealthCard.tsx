// Money health: a five-part ring (safety net, debt load, savings rate,
// insurance, goals on track) around a score out of 100. Tapping a part opens
// what it means and the one thing to do about it; a part missing one of the
// money basics (expenses, monthly investing, cover) asks for it right there.
// Links to #health-<part> elsewhere on the page open that part.

import { useEffect, useRef, useState } from "react";
import { HeartPulse, Landmark, PiggyBank, ShieldCheck, Target, Umbrella } from "lucide-react";
import RollingNumber from "@/components/motion/RollingNumber";
import { cn } from "@/lib/utils";
import type { HealthPart, PartAsk, PartKey } from "../../lib/money";
import type { ProfilePatch } from "../../services/moneyService";
import { CARD, TONE, TONE_WORD } from "./styles";
import { Chip, GoLink, IconTile } from "./ui";

const R = 96;
const C = 2 * Math.PI * R;
const ARC = (C * 67) / 360; // 72° per part, less a 5° gap

const PART_ICON: Record<PartKey, typeof HeartPulse> = {
  safety: ShieldCheck,
  debt: Landmark,
  savings: PiggyBank,
  insurance: Umbrella,
  goals: Target,
};

const PART_KEYS = Object.keys(PART_ICON) as PartKey[];

const digitsOnly = (v: string) => v.replace(/\D/g, "").slice(0, 11);
const grouped = (digits: string) => (digits ? Number(digits).toLocaleString("en-IN") : "");

/** ₹ fields for a part's money basics, saved together. */
function AsksForm({ asks, onSave, onDone }: { asks: PartAsk[]; onSave: (patch: ProfilePatch) => Promise<void>; onDone: () => void }) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(asks.map((a) => [a.field, a.value != null ? grouped(String(Math.round(a.value))) : ""])),
  );
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const patch: ProfilePatch = {};
  for (const a of asks) {
    const digits = digitsOnly(values[a.field] || "");
    if (digits) patch[a.field] = Number(digits);
  }
  const ready = Object.keys(patch).length > 0;

  return (
    <form
      className="mt-3 space-y-2.5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!ready) return;
        setState("saving");
        try {
          await onSave(patch);
          setState("idle");
          onDone();
        } catch {
          setState("error");
        }
      }}
    >
      {asks.map((a) => (
        <div key={a.field} className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={`xd-ask-${a.field}`} className="text-[13px] font-bold">
            {a.label}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
            <input
              id={`xd-ask-${a.field}`}
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              value={values[a.field] || ""}
              onChange={(e) => setValues((v) => ({ ...v, [a.field]: grouped(digitsOnly(e.target.value)) }))}
              className="h-11 w-40 rounded-xl border border-border bg-card pl-7 pr-3 text-sm font-bold tabular-nums outline-none focus:border-brand"
            />
          </div>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={!ready || state === "saving"}
          className="h-11 rounded-xl bg-brand-fill px-5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state === "saving" ? "Saving…" : "Save"}
        </button>
        {state === "error" ? (
          <span className="text-[13px] font-semibold text-destructive" role="alert">
            Couldn't save. Try again in a moment.
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Saved to your account, used only here.</span>
        )}
      </div>
    </form>
  );
}

function weakest(parts: HealthPart[]): PartKey {
  const known = parts.filter((p) => p.value != null).sort((a, b) => (a.value as number) - (b.value as number));
  return (known[0] ?? parts.find((p) => p.value == null) ?? parts[0]).key;
}

export default function HealthCard({
  parts,
  score,
  onSave,
  canSave,
}: {
  parts: HealthPart[];
  score: number | null;
  onSave: (patch: ProfilePatch) => Promise<void>;
  canSave: boolean;
}) {
  const [selected, setSelected] = useState<PartKey>(() => weakest(parts));
  const [editing, setEditing] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // "#health-insurance" (from This week's actions) opens that part here. The
  // hash is cleared once handled, so a later save doesn't reopen the form.
  useEffect(() => {
    const open = () => {
      const key = window.location.hash.replace("#health-", "") as PartKey;
      if (!window.location.hash.startsWith("#health-") || !PART_KEYS.includes(key)) return;
      setSelected(key);
      setEditing(true);
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);

  const sel = parts.find((p) => p.key === selected) ?? parts[0];
  const toFix = parts.filter((p) => p.tone === "bad").length;
  const unset = parts.filter((p) => p.tone === "none").length;
  const word = score == null ? "Add details" : score >= 85 ? "Strong" : score >= 65 ? "Fair" : "Needs care";
  const SelIcon = PART_ICON[sel.key];

  return (
    <section ref={cardRef} id="money-health" className={cn(CARD, "scroll-mt-24")} aria-labelledby="health-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="health-title" className="xt-label">Money health</h2>
        {toFix > 0 ? (
          <Chip tone="bad">{toFix} {toFix === 1 ? "thing" : "things"} to fix</Chip>
        ) : unset > 0 ? (
          <Chip tone="none">{unset} not set up</Chip>
        ) : (
          <Chip tone="good">All in good shape</Chip>
        )}
      </div>

      <div className="mt-3.5 flex flex-col items-stretch gap-5 sm:flex-row sm:items-center">
        <div className="relative h-[210px] w-[210px] shrink-0 self-center">
          <svg
            viewBox="0 0 240 240"
            className="h-full w-full -rotate-90 overflow-visible"
            role="img"
            aria-label={score == null ? "Money health score not available yet" : `Money health score ${score} out of 100`}
          >
            {parts.map((p, i) => (
              <circle
                key={`t-${p.key}`}
                cx="120"
                cy="120"
                r={R}
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="14"
                strokeDasharray={`${ARC} ${C}`}
                strokeDashoffset={-(C * (i * 72 + 2.5)) / 360}
              />
            ))}
            {parts.map((p, i) => (
              <circle
                key={`f-${p.key}`}
                className="xd-ring-fill"
                cx="120"
                cy="120"
                r={R}
                fill="none"
                stroke={TONE[p.tone].stroke}
                strokeWidth={p.key === selected ? 22 : 14}
                strokeDasharray={`${drawn ? ARC * (p.value ?? 0) : 0} ${C}`}
                strokeDashoffset={-(C * (i * 72 + 2.5)) / 360}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold leading-none tabular-nums">
              {score == null ? "–" : <RollingNumber value={String(score)} />}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">out of 100</span>
            <span className="mt-1.5 text-[13px] font-bold">{word}</span>
          </div>
        </div>

        <ul className="grid min-w-0 flex-1 gap-0.5">
          {parts.map((p) => (
            <li key={p.key}>
              <button
                type="button"
                aria-pressed={p.key === selected}
                onClick={() => {
                  setSelected(p.key);
                  setEditing(false);
                }}
                className={cn(
                  "flex min-h-[44px] w-full items-center gap-2.5 rounded-xl border px-3 text-left text-sm font-semibold transition-colors",
                  p.key === selected ? "border-border bg-secondary" : "border-transparent hover:bg-secondary",
                )}
              >
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", TONE[p.tone].fill)} />
                <span className="flex-1">{p.name}</span>
                <span className="text-[13px] tabular-nums text-muted-foreground">{p.short}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div key={sel.key} className="xd-fade mt-4 rounded-2xl bg-secondary p-4" aria-live="polite">
        <div className="flex items-start gap-3.5">
          <IconTile tone={sel.tone}>
            <SelIcon size={20} aria-hidden="true" />
          </IconTile>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-bold">{sel.name}</span>
              <Chip tone={sel.tone}>{TONE_WORD[sel.tone]}</Chip>
            </div>
            <div className="mt-0.5 text-[13px] font-semibold tabular-nums">{sel.detail}</div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{sel.text}</p>
            {sel.asks && sel.asks.length > 0 && canSave && (sel.value == null || editing) ? (
              <AsksForm key={sel.key} asks={sel.asks} onSave={onSave} onDone={() => setEditing(false)} />
            ) : (
              <div className="flex flex-wrap items-center gap-x-4">
                <GoLink href={sel.href}>{sel.cta}</GoLink>
                {sel.asks && sel.asks.length > 0 && canSave && (
                  <button type="button" onClick={() => setEditing(true)} className="min-h-[44px] text-sm font-bold text-muted-foreground hover:text-foreground">
                    Update your numbers
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
