// Ported from features-incoming/fundakamental/src/pages/Pricing.tsx.
//
// Adaptations from the original:
//  - `DashboardLayout` now comes from `../components/dashboard/DashboardLayout`
//    (relative, matching Dashboard.tsx/Settings.tsx's own convention) instead
//    of `@/components/dashboard/DashboardLayout`. Not yet ported by the
//    parallel shared-components task at the time of this port — see that
//    task for the real file.
//  - `usePlanStore`/`billingFor` now come from `../store/usePlanStore`,
//    `formatPrice` from `../lib/currency`.
//  - `useRegion` now comes from the shared `@/hooks/useRegion` (default
//    export, Context-based) instead of FundaKaMental's own module-singleton
//    hook of the same name — see Dashboard.tsx/Settings.tsx for the same
//    substitution.
//  - Checkout flow: this page never implemented Razorpay checkout itself —
//    both in the original and here, "Start Premium" just calls
//    `usePlanStore`'s `openUpgrade("general")`, which flips
//    `upgradeOpen`/`upgradeReason` state. The actual Razorpay checkout
//    (loadRazorpayScript + `new Razorpay({...}).open()` + order/verify calls)
//    lives entirely in `usePlanStore.startCheckout()` (already ported, see
//    store/usePlanStore.ts), which the not-yet-ported `UpgradeModal` (owned
//    by the parallel shared-components task) is expected to call once the
//    user picks a billing cycle in that modal. So there's nothing to
//    reimplement here — this page only ever needs to open that modal.
//  - Internal navigation updated from `/dashboard` to `/fundakamental` (this
//    port's dashboard index route — see ../FundakamentalApp.tsx).
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
// TODO: not yet ported — source:
// features-incoming/fundakamental/src/components/dashboard/DashboardLayout.tsx
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { usePlanStore, billingFor } from "../store/usePlanStore";
import { formatPrice } from "../lib/currency";
import useRegion from "@/hooks/useRegion";

export default function Pricing() {
  const navigate = useNavigate();
  const openUpgrade = usePlanStore((s) => s.openUpgrade);
  // Subscribe to the plan itself: selecting the isPro function never re-rendered
  // once the plan loaded, so paying users kept seeing Free gates.
  const isPro = usePlanStore((s) => s.plan === "premium" || s.plan === "enterprise");
  const { region } = useRegion();
  const bp = billingFor(region as any);

  const plansData = [
    {
      name: "Free",
      description: "Perfect for getting started",
      price: formatPrice(0, bp.currency),
      period: "forever",
      subprice: "",
      features: [
        "60K AI tokens per month",
        "PDF upload support",
        "Basic financial metrics",
        "Report history",
        "Email support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Premium",
      description: "For serious investors",
      price: formatPrice(bp.monthly, bp.currency),
      period: "/month",
      subprice: `or ${formatPrice(bp.yearly, bp.currency)}/year — save 33%`,
      features: [
        "500K AI tokens per month (top-ups available)",
        "PDF, Excel, CSV support",
        "Advanced ratio analysis",
        "Interactive Q&A",
        "Stock screener access",
        "Unlimited history",
        "PDF report exports",
        "Priority support",
      ],
      cta: "Start Premium",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For teams & institutions",
      price: "Custom",
      period: "",
      subprice: "",
      features: [
        "Everything in Premium",
        "API access",
        "Team collaboration",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
        "On-premise deployment",
        "Custom training",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const handleCta = (planName: string) => {
    if (planName === "Free") {
      navigate("/fundakamental");
    } else if (planName === "Premium") {
      if (isPro) {
        navigate("/fundakamental");
      } else {
        openUpgrade("general");
      }
    } else {
      // Enterprise — route to contact / mailto
      window.location.href = "mailto:support@xtincapital.com?subject=Fundakamental%20Enterprise%20plan%20enquiry";
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-24 bg-white/50 min-h-screen">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="xt-eyebrow">
            Pricing
          </span>
          <h2 className="xt-title mt-3 mb-4">
            Simple, Transparent
            <br />
            <span className="text-primary">Pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start free and upgrade when you are ready. No hidden fees.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plansData.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 bg-white ${
                plan.popular
                  ? "border-2 border-primary shadow-lg"
                  : "border border-border"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-sm font-medium flex items-center gap-1 w-max">
                  <Sparkles className="w-4 h-4" />
                  Most Popular
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {plan.subprice && (
                  <p className="text-xs text-primary font-medium mt-2">{plan.subprice}</p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                onClick={() => handleCta(plan.name)}
                className={`w-full rounded-full ${
                  plan.popular
                    ? "bg-primary hover:bg-primary/90 text-white"
                    : "bg-secondary hover:bg-secondary/80 text-foreground"
                }`}
                size="lg"
              >
                {plan.name === "Premium" && isPro ? "Current Plan" : plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
