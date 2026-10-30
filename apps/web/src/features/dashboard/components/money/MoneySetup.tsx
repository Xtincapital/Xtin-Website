// Shown instead of Money Pulse and the Life Road until the user has put
// anything into Gini: three steps, each opening the Gini page that fills it.

import { Link } from "react-router-dom";
import { ArrowRight, Landmark, Target, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { CARD } from "./styles";
import { IconTile } from "./ui";

const STEPS = [
  { icon: Users, title: "You and your family", text: "Ages and monthly income. They power every projection.", href: "/gini/family", cta: "Add family" },
  { icon: Landmark, title: "What you own and owe", text: "Savings, investments, property and loans give your net worth.", href: "/gini/networth", cta: "Add assets and loans" },
  { icon: Target, title: "What you're saving for", text: "A home, a car, education, retirement. Each one becomes a stop on your Life Road.", href: "/gini/goals", cta: "Add goals" },
];

export default function MoneySetup() {
  return (
    <section className={cn(CARD, "sm:p-8")} aria-labelledby="setup-title">
      <div className="xt-eyebrow">Your money picture</div>
      <h2 id="setup-title" className="mt-2 text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-[32px]">
        Three steps to your Money Pulse and Life Road
      </h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
        Add a few numbers in Gini and this page turns into your money health score, your net worth, and a road from today to every goal. No bank login needed.
      </p>
      <ol className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.href} className="flex flex-col gap-3 rounded-2xl bg-secondary p-5">
            <div className="flex items-center justify-between">
              <IconTile>
                <s.icon size={20} aria-hidden="true" />
              </IconTile>
              <span className="text-sm font-bold tabular-nums text-muted-foreground">Step {i + 1}</span>
            </div>
            <div className="text-base font-bold">{s.title}</div>
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            <Link
              to={s.href}
              className={cn(
                "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors",
                i === 0 ? "bg-brand-fill text-white hover:bg-brand-hover" : "border border-border bg-card hover:border-brand",
              )}
            >
              {s.cta}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
