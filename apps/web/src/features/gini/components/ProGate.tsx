// Shared Pro-plan gate — wraps a page's content and shows an upgrade
// prompt instead when the user isn't on Gini Pro. Used by Required Return
// and Monte Carlo (Phase 10e; the original gates these plus Family
// Planning/Advanced Planning/PDF reports behind Pro too — see
// services/api/modules/gini/chatPrompt.ts's system-prompt line "Plan: Free
// (Monte Carlo, Required Return, Family Planning and PDF reports are Pro
// modules...)" for the authoritative list this mirrors) — later sub-phases
// (10f) should reuse this same component for Family Planning/Advanced
// Planning/Reports rather than rebuilding the pattern.
//
// Tier source: ../store/useGiniPlanStore.ts's `isPro()`, backed by the
// real server-side `GET /gini/plan` — never a client-side guess.
//
// Links to `/gini/pricing`, a real routed path (GiniApp.tsx) even though
// it's still a `ComingSoon` placeholder until Phase 10f — same as how
// Journal's Coach page linked to its own not-yet-built Pricing page during
// that product's incremental buildout.
import { Link } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProGateProps {
  /** Feature name shown in the upgrade copy, e.g. "Monte Carlo simulations". */
  feature: string;
  children: React.ReactNode;
  isPro: boolean;
  loading?: boolean;
}

const ProGate = ({ feature, children, isPro, loading }: ProGateProps) => {
  if (loading) return null;
  if (isPro) return <>{children}</>;

  return (
    <Card className="border-dashed border-2 pro-gold-border bg-gradient-accent">
      <CardContent className="flex flex-col items-center text-center gap-4 py-16 px-6">
        <span className="flex items-center justify-center w-14 h-14 rounded-2xl pro-gold-bg">
          <Lock className="w-6 h-6" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">{feature} is a Gini Pro feature</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Upgrade to Gini Pro to unlock {feature.toLowerCase()}, deeper AI advisor answers, and the rest of
            Gini's advanced planning tools.
          </p>
        </div>
        <Button asChild className="pro-gold-bg border-0 hover:brightness-105 hover:bg-transparent">
          <Link to="/gini/pricing">
            <Sparkles className="w-4 h-4 mr-1.5" />
            Upgrade to Pro
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProGate;
