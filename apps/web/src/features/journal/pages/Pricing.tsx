// Journal Pricing page (Phase 9f) — combines the two places the original
// standalone app split this across:
//   - features-incoming/journal/journal-premium.js's `JournalPlan` module
//     (search `const JournalPlan = (() =>`, ~line 311) — the real Pro-plan
//     upgrade modal, its `PLANS` constant (~line 291) and its feature list
//     (`showPricing`, ~line 505) — reused here for copy, not markup.
//   - features-incoming/journal/pricing.html — the separate AI-token-pack
//     marketing page (3 packs, comparison table, FAQ) — same, copy only.
// Both were vanilla-JS/HTML; this is a fresh React page against the live
// `useJournalPlanStore` (../store/useJournalPlanStore, this task's other
// deliverable) rather than a port of either file's DOM code.
//
// Checkout is inline on this page (Dialog/Card buttons calling the store's
// `startProCheckout`/`startAiPackCheckout` directly) rather than a global
// modal — see useJournalPlanStore.ts's header comment for why no
// FundaKaMental-style `UpgradeModal`/`BuyTokensModal` pair was built for
// this rewrite.
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Check, Sparkles, Coins, Loader2 } from "lucide-react";
import useRegion from "@/hooks/useRegion";
import JournalLayout from "../components/JournalLayout";
import {
  useJournalPlanStore,
  PRO_PLANS,
  formatTokens,
  currencyForRegion,
  type ProPlanId,
  type AiPackageId,
} from "../store/useJournalPlanStore";

const CURRENCY_SYMBOL: Record<string, string> = { INR: "₹", USD: "$", GBP: "£", EUR: "€" };

const FREE_FEATURES = [
  "Unlimited manual trade logging",
  "CSV/Excel/PDF trade import & CSV export",
  "Dashboard, Calendar & Daily views",
  "Metrics & Monthly summaries",
  "Up to 2 performance goals",
  "AI trading coach (starter tokens)",
];

const PRO_FEATURES = [
  "Everything in Free, plus:",
  "Psychology — emotion-to-P&L analysis",
  "Hourly Analysis — find your golden hours",
  "Analytics — pro-grade performance review",
  "Heatmaps — see patterns at a glance",
  "Unlimited performance goals",
  "Priority AI coach access",
];

const PACK_FEATURES: Record<AiPackageId, string[]> = {
  ai_500: ["Claude-powered coach replies", "Uses compact trade context", "Stops automatically at zero balance"],
  ai_1000: ["Weekly reviews and chat coaching", "Personalized from journal data", "More tokens per rupee than Starter"],
  ai_2000: ["High-volume AI coach usage", "Best for daily journaling workflows", "Best per-token value"],
};

const FAQ = [
  {
    q: "How are tokens calculated?",
    a: "Tokens are chunks of text used by Claude. Xtin Journal sends compact trade context and deducts the actual input plus output tokens reported by the API.",
  },
  {
    q: "Can I use AI after tokens finish?",
    a: "No. The AI coach is blocked when the balance reaches zero. Recharge any pack, or upgrade to Pro for a token bonus, to continue.",
  },
  {
    q: "How are payments handled?",
    a: "Payments are created and verified through Razorpay. Tokens/Pro access are credited only after our backend verifies the Razorpay signature.",
  },
  {
    q: "Is there a monthly minimum on AI packs?",
    a: "No monthly minimum. AI credits are prepaid and remain in your wallet until used.",
  },
  {
    q: "Can I cancel Pro?",
    a: "Pro is a fixed-term purchase (monthly or yearly) rather than an auto-renewing subscription — it simply doesn't renew unless you buy again.",
  },
];

function formatDate(value: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Pricing() {
  const { region } = useRegion();
  const currency = currencyForRegion(region as string | undefined);
  const symbol = CURRENCY_SYMBOL[currency] || "₹";

  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  // Subscribe to the plan itself: selecting the isPro function never re-rendered
  // once the plan loaded, so paying users kept seeing Free gates.
  const isPro = useJournalPlanStore((s) => !!s.validUntil && new Date(s.validUntil).getTime() > Date.now());
  const validUntil = useJournalPlanStore((s) => s.validUntil);
  const wallet = useJournalPlanStore((s) => s.wallet);
  const aiPackages = useJournalPlanStore((s) => s.aiPackages);
  const checkoutBusy = useJournalPlanStore((s) => s.checkoutBusy);
  const celebrating = useJournalPlanStore((s) => s.celebrating);
  const fetchPlan = useJournalPlanStore((s) => s.fetchPlan);
  const fetchWallet = useJournalPlanStore((s) => s.fetchWallet);
  const fetchAiPackages = useJournalPlanStore((s) => s.fetchAiPackages);
  const startProCheckout = useJournalPlanStore((s) => s.startProCheckout);
  const startAiPackCheckout = useJournalPlanStore((s) => s.startAiPackCheckout);

  useEffect(() => {
    fetchPlan();
    fetchWallet();
    fetchAiPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planId: ProPlanId = billing === "yearly" ? "journal_pro_yearly" : "journal_pro_monthly";
  const plan = PRO_PLANS[planId];
  const amount = plan.amounts[currency];
  const monthlyAmount = PRO_PLANS.journal_pro_monthly.amounts[currency];
  const yearlyAmount = PRO_PLANS.journal_pro_yearly.amounts[currency];
  const effMonthly = Math.round(yearlyAmount / 12);

  const walletPct = wallet
    ? Math.min(100, Math.round((wallet.token_balance / Math.max(1, wallet.free_tokens_granted || wallet.token_balance || 1)) * 100))
    : 0;

  return (
    <JournalLayout>
      <div className="mx-auto max-w-5xl space-y-10 p-6">
        <div className="space-y-2 text-center">
          <Badge variant="secondary" className="mx-auto w-fit">
            Xtin Journal Plans
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            {isPro ? "You're on Journal Pro" : "Trade with an edge, not a hunch"}
          </h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground">
            {isPro
              ? "Every analysis tool unlocked. Manage your plan and AI tokens below."
              : "Journal free forever. Upgrade when you're ready to see your patterns."}
          </p>
        </div>

        {/* Current status */}
        <Card>
          <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-lg font-semibold">{isPro ? "Pro" : "Free"}</span>
                {isPro && <Badge className="gap-1"><Sparkles className="h-3 w-3" /> Active</Badge>}
              </div>
              {isPro && validUntil && (
                <p className="mt-1 text-sm text-muted-foreground">Active until {formatDate(validUntil)}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Coins className="h-3.5 w-3.5" /> AI tokens
                </p>
                <span className="text-sm font-bold">{wallet ? formatTokens(wallet.token_balance) : "-"}</span>
              </div>
              <Progress value={walletPct} className="mt-2 h-1.5" />
            </div>
          </CardContent>
        </Card>

        {/* Pro plan section */}
        <section className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-xl font-semibold">Journal Pro</h2>
            {!isPro && (
              <Tabs value={billing} onValueChange={(v) => setBilling(v as "monthly" | "yearly")}>
                <TabsList>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">
                    Yearly <Badge variant="secondary" className="ml-1.5">Save 33%</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className={isPro ? "opacity-70" : undefined}>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>A serious journal, free forever. No card required.</CardDescription>
                <p className="pt-2 text-3xl font-bold">
                  {symbol}0<span className="text-sm font-normal text-muted-foreground">/forever</span>
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" disabled>
                  {isPro ? "Included in Pro" : "Current plan"}
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-primary/40 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-1.5">Pro <Sparkles className="h-4 w-4 text-primary" /></CardTitle>
                  <Badge>Most popular</Badge>
                </div>
                <CardDescription>The full pattern-detection suite</CardDescription>
                {billing === "yearly" ? (
                  <div className="pt-2">
                    <p className="text-3xl font-bold">
                      {symbol}
                      {effMonthly}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                      <span className="ml-2 text-base font-normal text-muted-foreground line-through">
                        {symbol}
                        {monthlyAmount}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {symbol}
                      {yearlyAmount} billed yearly
                    </p>
                  </div>
                ) : (
                  <p className="pt-2 text-3xl font-bold">
                    {symbol}
                    {monthlyAmount}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {PRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full gap-2"
                  disabled={isPro || checkoutBusy}
                  onClick={() => startProCheckout(planId, currency)}
                >
                  {checkoutBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isPro ? "✦ Active" : checkoutBusy ? "Opening checkout…" : `Upgrade to Pro — ${symbol}${amount}`}
                </Button>
              </CardFooter>
            </Card>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Secure payments via Razorpay · cards, UPI &amp; netbanking · Your data stays yours
          </p>
        </section>

        {/* AI token packs section */}
        <section className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold">AI Credit Packs</h2>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground">
              Recharge once with Razorpay and use Claude-powered coaching until your token balance reaches zero.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {aiPackages.map((pack) => (
              <Card key={pack.id} className={pack.id === "ai_1000" ? "border-primary/40 shadow-md" : undefined}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{pack.label}</CardTitle>
                    {pack.id === "ai_1000" && <Badge variant="secondary">Best value</Badge>}
                  </div>
                  <p className="pt-1 text-2xl font-bold">
                    ₹{pack.amount_inr}
                    <span className="text-sm font-normal text-muted-foreground"> one time</span>
                  </p>
                  <CardDescription>{formatTokens(pack.tokens)} tokens</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {(PACK_FEATURES[pack.id as AiPackageId] || []).map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={pack.id === "ai_1000" ? "default" : "outline"}
                    className="w-full gap-2"
                    disabled={checkoutBusy}
                    onClick={() => startAiPackCheckout(pack.id as AiPackageId)}
                  >
                    {checkoutBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                    Recharge
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-center text-xl font-semibold">Frequently Asked Questions</h2>
          <div className="mx-auto max-w-2xl space-y-3">
            {FAQ.map((item) => (
              <Card key={item.q}>
                <CardContent className="p-4">
                  <p className="font-medium">{item.q}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {celebrating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <Card className="mx-4 max-w-sm text-center">
              <CardContent className="space-y-2 p-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">Welcome to Journal Pro</h3>
                <p className="text-sm text-muted-foreground">
                  Psychology, Hourly, Analytics, Heatmaps — every pattern in your trading, unlocked.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </JournalLayout>
  );
}
