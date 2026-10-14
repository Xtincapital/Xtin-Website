// Ported from features-incoming/fundakamental/src/components/ProCelebration.tsx.
// Only the store import path changed (relative, see ./UpgradeModal.tsx's
// header comment for why).
import { usePlanStore } from "../store/usePlanStore";
import { Sparkles } from "lucide-react";

/**
 * Brief full-screen "welcome to Pro" moment after a successful upgrade.
 * Buying should feel like an arrival, not a silent state change.
 */
export default function ProCelebration() {
  const celebrating = usePlanStore((s) => s.celebrating);
  if (!celebrating) return null;

  return (
    <div className="fixed inset-0 z-[10090] flex items-center justify-center bg-gray-900/95 backdrop-blur-sm animate-in fade-in duration-300 brand-on-dark">
      <div className="text-center text-white px-6">
        <div className="mx-auto mb-5 w-20 h-20 rounded-3xl bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_60px_rgba(18, 128, 90,0.4)]">
          <Sparkles className="w-9 h-9 text-brand" />
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-semibold mb-2 tracking-[-0.025em]">Welcome to Pro</h2>
        <p className="text-white/70">
          Every tool is unlocked. Time to research like an institution.
        </p>
      </div>
    </div>
  );
}
