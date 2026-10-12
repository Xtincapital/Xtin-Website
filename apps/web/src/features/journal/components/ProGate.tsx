// Journal Pro gate — shows an upgrade prompt in place of a Pro-only page's
// content unless the user has an active Journal Pro plan. Mirrors
// ../../gini/components/ProGate.tsx. The plan comes from the server-backed
// `useJournalPlanStore` (never a client-side guess), and the same features
// are also enforced server-side where they hit the API.
import { Link } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProGateProps {
  /** Feature name shown in the upgrade copy, e.g. "Psychology analysis". */
  feature: string;
  children: React.ReactNode;
  isPro: boolean;
  loading?: boolean;
}

const ProGate = ({ feature, children, isPro, loading }: ProGateProps) => {
  if (loading) return null;
  if (isPro) return <>{children}</>;

  return (
    <Card className="mx-auto my-8 max-w-2xl border-dashed border-2 pro-gold-border bg-gradient-accent">
      <CardContent className="flex flex-col items-center text-center gap-4 py-16 px-6">
        <span className="flex items-center justify-center w-14 h-14 rounded-2xl pro-gold-bg">
          <Lock className="w-6 h-6" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">{feature} is a Journal Pro feature</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Upgrade to Journal Pro to unlock it, along with Psychology, Hourly Analysis, Analytics, Heatmaps
            and unlimited goals.
          </p>
        </div>
        <Button asChild className="pro-gold-bg border-0 hover:brightness-105 hover:bg-transparent">
          <Link to="/journal/pricing">
            <Sparkles className="w-4 h-4 mr-1.5" />
            Upgrade to Pro
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProGate;
