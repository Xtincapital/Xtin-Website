// "Across Xtin": one live card each for Journal (this month's trades), Learn
// (the course in progress, out of every course), the newsletter (latest
// issue) and the plan with its AI token balances.

import type { ReactNode } from "react";
import { BarChart3, BookOpen, Crown, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { inr } from "../../lib/money";
import { LEARN_COURSES, pickCourse, type CourseProgress } from "../../lib/learnCourses";
import type { Article, TradePnl } from "../../services/moneyService";
import { CARD, SECTION_TITLE } from "./styles";
import { GoLink, IconTile, Progress } from "./ui";

export interface PlanSummary {
  planName: string;
  expiryDate: string;
  isBundle?: boolean;
}

const cardCls = cn(CARD, "flex flex-col gap-2.5");

function CardHead({ icon, title, sub, gold }: { icon: ReactNode; title: string; sub: string; gold?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {gold ? <span className="pro-gold-bg inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">{icon}</span> : <IconTile>{icon}</IconTile>}
      <div className="min-w-0">
        <div className="text-[15px] font-bold">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

function JournalCard({ trades }: { trades: TradePnl[] | null }) {
  const month = new Date().toLocaleString("en-IN", { month: "long" });
  if (!trades || trades.length === 0) {
    return (
      <article className={cardCls}>
        <CardHead icon={<BarChart3 size={20} aria-hidden="true" />} title="Journal" sub={`${month} so far`} />
        <div className="flex-1 text-base font-bold leading-snug">No trades logged this month</div>
        <p className="text-[13px] text-muted-foreground">Log trades to see your P&amp;L, win rate and streaks here.</p>
        <GoLink href="/journal">Open Journal</GoLink>
      </article>
    );
  }
  const closed = trades.filter((t) => t.pnl != null);
  const pnl = closed.reduce((s, t) => s + (t.pnl as number), 0);
  const wins = closed.filter((t) => (t.pnl as number) > 0).length;
  const last = closed.slice(0, 10).reverse();
  const peak = Math.max(1, ...last.map((t) => Math.abs(t.pnl as number)));
  return (
    <article className={cardCls}>
      <CardHead icon={<BarChart3 size={20} aria-hidden="true" />} title="Journal" sub={`${month} so far`} />
      <div className={cn("text-2xl font-bold tabular-nums", pnl >= 0 ? "text-brand" : "text-destructive")}>
        {pnl >= 0 ? "+" : ""}
        {inr(pnl)}
      </div>
      {last.length > 0 && (
        <div className="flex h-11 items-end gap-1" aria-hidden="true">
          {last.map((t) => (
            <span
              key={t.id}
              className={cn("min-h-[4px] flex-1 rounded-t-[3px] rounded-b-[1px]", (t.pnl as number) >= 0 ? "bg-brand-fill" : "bg-destructive")}
              style={{ height: `${(Math.abs(t.pnl as number) / peak) * 100}%` }}
            />
          ))}
        </div>
      )}
      <div className="text-[13px] tabular-nums text-muted-foreground">
        {trades.length} {trades.length === 1 ? "trade" : "trades"}
        {closed.length > 0 ? ` · ${Math.round((wins / closed.length) * 100)}% win rate` : ""}
      </div>
      <GoLink href="/journal">Open Journal</GoLink>
    </article>
  );
}

function LearnCard({ progress }: { progress: CourseProgress[] | null }) {
  const { course, started, allDone } = pickCourse(progress ?? []);
  return (
    <article className={cardCls}>
      <CardHead
        icon={<BookOpen size={20} aria-hidden="true" />}
        title={started ? "Continue learning" : "Learn"}
        sub={allDone ? "Every course finished" : `${course.name} course`}
      />
      {allDone ? (
        <div className="flex-1 text-base font-bold leading-snug">You've finished all {LEARN_COURSES.length} courses</div>
      ) : (
        <>
          <div className="text-base font-bold leading-snug">{started ? `Pick up ${course.name}` : `Start ${course.name}`}</div>
          <Progress pct={course.pct} tone="good" />
          <div className="flex-1 text-[13px] tabular-nums text-muted-foreground">
            {course.completed} of {course.lessons} lessons done
          </div>
        </>
      )}
      <GoLink href={allDone ? "/learn" : course.path}>{started ? "Resume" : allDone ? "Go to Learn" : "Start the course"}</GoLink>
    </article>
  );
}

function NewsletterCard({ article }: { article: Article | null }) {
  const date = article?.postDate ? new Date(article.postDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : null;
  return (
    <article className={cardCls}>
      <CardHead icon={<Mail size={20} aria-hidden="true" />} title="Newsletter" sub={date ? `Latest · ${date}` : "Market briefs"} />
      <div className="line-clamp-3 flex-1 text-base font-bold leading-snug">{article?.title ?? "Morning and closing market briefs"}</div>
      {article?.subtitle && <p className="line-clamp-2 text-[13px] text-muted-foreground">{article.subtitle}</p>}
      <GoLink href={article?.slug ? `/newsletter/article/${article.slug}` : "/newsletter"}>{article ? "Read the issue" : "Open Newsletter"}</GoLink>
    </article>
  );
}

export interface TokenBalances {
  gini: number | null;
  journal: number | null;
}

/** "Gini 84,000 · Journal 30,000" for the wallets the user has; empty when none. */
function tokenLine(tokens: TokenBalances): string {
  const parts: string[] = [];
  if (tokens.gini != null) parts.push(`Gini ${tokens.gini.toLocaleString("en-IN")}`);
  if (tokens.journal != null) parts.push(`Journal ${tokens.journal.toLocaleString("en-IN")}`);
  return parts.join(" · ");
}

function PlanCard({ plans, tokens, onSeePlans }: { plans: PlanSummary[]; tokens: TokenBalances; onSeePlans: () => void }) {
  const aiTokens = tokenLine(tokens);
  const plan = [...plans].sort((a, b) => new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime())[0];
  if (!plan) {
    return (
      <article className={cardCls}>
        <CardHead icon={<Crown size={20} aria-hidden="true" />} title="Free plan" sub="No Pro plan yet" gold />
        <div className="flex-1 text-base font-bold leading-snug">Unlock Pro tools one at a time, or save with a bundle</div>
        {aiTokens && <div className="text-[13px] tabular-nums text-muted-foreground">AI tokens: {aiTokens}</div>}
        <button type="button" onClick={onSeePlans} className="inline-flex min-h-[44px] items-center gap-1.5 self-start text-sm font-bold text-brand hover:underline">
          See plans
        </button>
      </article>
    );
  }
  const end = new Date(plan.expiryDate);
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
  return (
    <article className={cardCls}>
      <CardHead icon={<Crown size={20} aria-hidden="true" />} title={plan.planName} sub={`Ends ${end.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`} gold />
      <div className={cn("text-2xl font-bold tabular-nums", daysLeft <= 14 && "text-destructive")}>
        {daysLeft} {daysLeft === 1 ? "day" : "days"} left
      </div>
      <div className="flex-1 text-[13px] text-muted-foreground">
        {plans.length > 1 ? `${plans.length} active plans` : plan.isBundle ? "Bundle" : "Active"}
        {aiTokens && <div className="mt-1 tabular-nums">AI tokens: {aiTokens}</div>}
      </div>
      <GoLink href="/billing">Manage plan</GoLink>
    </article>
  );
}

export default function AcrossXtin({
  trades,
  learn,
  article,
  plans,
  tokens,
  onSeePlans,
}: {
  trades: TradePnl[] | null;
  learn: CourseProgress[] | null;
  article: Article | null;
  plans: PlanSummary[];
  tokens: TokenBalances;
  onSeePlans: () => void;
}) {
  return (
    <section aria-labelledby="across-title">
      <h2 id="across-title" className={cn(SECTION_TITLE, "mb-4")}>
        Across Xtin
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <JournalCard trades={trades} />
        <LearnCard progress={learn} />
        <NewsletterCard article={article} />
        <PlanCard plans={plans} tokens={tokens} onSeePlans={onSeePlans} />
      </div>
    </section>
  );
}
