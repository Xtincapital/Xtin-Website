// Gini Pricing page — Pro plan + AI wallet purchase page, entirely backed by
// ../store/useGiniPlanStore (Phase 10f extended that store with the full
// wallet/checkout flow this page needs; see that file's header comment for
// the live backend routes it talks to). No direct fetch calls here — the
// store owns fetching and Razorpay checkout end to end.
//
// Structure closely modeled on
// apps/web/src/features/journal/pages/Pricing.tsx (read as this task's
// template) — same layout skeleton (status card, Pro plan cards, AI pack
// cards, celebration overlay) — but with Gini's own two-plan Pro tier
// (`PRO_PLANS.pro_monthly`/`pro_yearly`, no monthly/yearly toggle tabs since
// Gini's store keys the two plans by id rather than a shared "billing"
// selector) and Gini's own three-pack AI wallet catalogue.
//
// Copy: feature bullets are original to this page (Gini has no dedicated
// premium-features list file the way Journal's journal-premium.js/pricing.html
// did — see this task's final report for that judgement call), matching this
// repo's actual Gini feature set (Required Return / Monte Carlo Pro-gating,
// per ../components/ProGate.tsx which links here).
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Coins, Loader2, CreditCard } from "lucide-react";
import useRegion from "@/hooks/useRegion";
import GiniLayout from "../components/GiniLayout";
import {
  useGiniPlanStore,
  PRO_PLANS,
  formatTokens,
  currencyForRegion,
  type AiPackageId,
} from "../store/useGiniPlanStore";
import CouponField from "@/features/coupons/components/CouponField";

const CURRENCY_SYMBOL: Record<string, string> = { INR: "₹", USD: "$", GBP: "£", EUR: "€" };

const FREE_FEATURES = [
  "Household, net worth & goals tracking",
  "Portfolio and goal planner",
  "Retirement & EMI/SIP/inflation calculators",
  "AI advisor (starter tokens)",
];

const PRO_FEATURES = [
  "Everything in Free, plus:",
  "Required Return analysis",
  "Monte Carlo retirement simulations",
  "Advanced family planning tools",
  "100,000 bonus AI tokens on purchase",
  "Priority AI advisor access",
];

const PACK_FEATURES: Record<AiPackageId, string[]> = {
  ai_500: ["Claude-powered advisor replies", "Uses your live financial data", "Stops automatically at zero balance"],
  ai_1000: ["Deeper multi-turn conversations", "Personalized from your Gini profile", "More tokens per rupee than Starter"],
  ai_2000: ["High-volume AI advisor usage", "Best for frequent planning sessions", "Best per-token value"],
};

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

  // Subscribe to the plan itself: selecting the isPro function never re-rendered
  // once the plan loaded, so paying users kept seeing Free gates.
  const isPro = useGiniPlanStore((s) => !!s.validUntil && new Date(s.validUntil).getTime() > Date.now());
  const validUntil = useGiniPlanStore((s) => s.validUntil);
  const wallet = useGiniPlanStore((s) => s.wallet);
  const aiPackages = useGiniPlanStore((s) => s.aiPackages);
  const checkoutBusy = useGiniPlanStore((s) => s.checkoutBusy);
  const celebrating = useGiniPlanStore((s) => s.celebrating);
  const refreshAll = useGiniPlanStore((s) => s.refreshAll);
  const fetchAiPackages = useGiniPlanStore((s) => s.fetchAiPackages);
  const startProCheckout = useGiniPlanStore((s) => s.startProCheckout);
  const startAiPackCheckout = useGiniPlanStore((s) => s.startAiPackCheckout);
  const couponCode = useGiniPlanStore((s) => s.couponCode);
  const setCouponCode = useGiniPlanStore((s) => s.setCouponCode);

  useEffect(() => {
    refreshAll();
    fetchAiPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthly = PRO_PLANS.pro_monthly;
  const yearly = PRO_PLANS.pro_yearly;
  const monthlyAmount = monthly.amounts[currency];
  const yearlyAmount = yearly.amounts[currency];
  const effMonthly = Math.round(yearlyAmount / 12);

  return (
    <GiniLayout>
      <div className="mx-auto max-w-5xl space-y-10 p-6">
        <div className="space-y-2 text-center">
          <Badge variant="secondary" className="mx-auto w-fit">
            Xtin Gini Plans
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            {isPro ? "You're on Gini Pro" : "Plan your family's future with confidence"}
          </h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground">
            {isPro
              ? "Every advanced planning tool unlocked. Manage your plan and AI tokens below."
              : "Gini's core planning tools are free forever. Upgrade for advanced scenario analysis."}
          </p>
        </div>

        {/* Current status */}
        <Card>
          <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-lg font-semibold">{isPro ? "Pro" : "Free"}</span>
                {isPro && (
                  <Badge className="gap-1">
                    <Sparkles className="h-3 w-3" /> Active
                  </Badge>
                )}
              </div>
              {isPro && validUntil && <p className="mt-1 text-sm text-muted-foreground">Active until {formatDate(validUntil)}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Coins className="h-3.5 w-3.5" /> AI tokens
                </p>
                <span className="text-sm font-bold">{wallet ? formatTokens(wallet.token_balance) : "-"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mx-auto flex max-w-md justify-center">
          <CouponField product={["gini_pro_plan", "gini_ai_tokens"]} value={couponCode} onChange={setCouponCode} onRedeemed={refreshAll} />
        </div>

        {/* Pro plan section */}
        <section className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Gini Pro</h2>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground">Unlock Required Return, Monte Carlo, and advanced family planning.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className={isPro ? "opacity-70" : undefined}>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Every core planning tool, free forever.</CardDescription>
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
                  <CardTitle className="flex items-center gap-1.5">
                    Pro <Sparkles className="h-4 w-4 text-primary" />
                  </CardTitle>
                  <Badge>Most popular</Badge>
                </div>
                <CardDescription>The full advanced planning suite</CardDescription>
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
                    {yearlyAmount} billed yearly, or {symbol}
                    {monthlyAmount}/mo billed monthly
                  </p>
                </div>
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
              <CardFooter className="flex flex-col gap-2">
                <Button className="w-full gap-2" disabled={isPro || checkoutBusy} onClick={() => startProCheckout("pro_yearly", currency)}>
                  {checkoutBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isPro ? "✦ Active" : checkoutBusy ? "Opening checkout…" : `Upgrade yearly — ${symbol}${yearlyAmount}`}
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={isPro || checkoutBusy}
                  onClick={() => startProCheckout("pro_monthly", currency)}
                >
                  {checkoutBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isPro ? "✦ Active" : checkoutBusy ? "Opening checkout…" : `Or monthly — ${symbol}${monthlyAmount}/mo`}
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
              Recharge once with Razorpay and use Claude-powered advisor chat until your token balance reaches zero.
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

        {celebrating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <Card className="mx-4 max-w-sm text-center">
              <CardContent className="space-y-2 p-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">Welcome to Gini Pro</h3>
                <p className="text-sm text-muted-foreground">
                  Required Return, Monte Carlo, and advanced family planning — all unlocked.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <CreditCard className="h-3.5 w-3.5" /> Prices shown in {currency}, detected from your region.
        </p>
      </div>
    </GiniLayout>
  );
}
