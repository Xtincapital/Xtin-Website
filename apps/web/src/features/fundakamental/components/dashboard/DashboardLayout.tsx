// Ported from features-incoming/fundakamental/src/components/dashboard/DashboardLayout.tsx.
// This is the navigation shell every FundaKaMental page wraps its content in.
//
// Adaptations from the original:
//  - `useAuthStore` (dropped, redundant with the host app's own auth — see
//    ../../FundakamentalApp.tsx's header comment) replaced with the shared
//    `useAuth()` (apps/web/src/contexts/AuthContext.tsx). No more
//    `initializeAuth()` call on mount — the host app's `AuthContext` already
//    initializes auth once at the app root. No Log Out button either:
//    signing out lives in the site's own account menu (Dashboard).
//  - The shared `AuthContext` user shape has no `plan`/`reportsUsed`/
//    `reportsLimit` fields (see ../../pages/Dashboard.tsx and
//    ../../pages/Settings.tsx's own port notes for why — those lived on
//    FundaKaMental's own now-dropped backend user profile). The "Upgrade
//    Card" now gates on `usePlanStore`'s `isPro()` instead of `user?.plan`,
//    and its "N reports remaining" line is now static copy (same reasoning
//    Settings.tsx already used for its own now-unavailable reports-used
//    counter).
//  - Nav hrefs rewritten from the standalone app's own top-level routes
//    (`/dashboard`, `/dashboard/analyze`, ...) to this port's nested routes
//    under `/fundakamental` — matches the exact path names reserved in
//    ../../FundakamentalApp.tsx's route TODOs (`analyze`, `scanner`,
//    `portfolio`, `watchlist`, `history`, `settings`).
//  - `OnboardingTour`, `RegionSwitcher` imports point at this port's own
//    copies (relative paths) instead of the standalone app's
//    `@/components/...` — in this monorepo `@/` resolves to the *shared*
//    `apps/web/src/` tree, not a FundaKaMental-local one, so those absolute
//    imports would resolve to the wrong (or nonexistent) files.
//  - Wrapped in the shared site Navbar + Footer like every other Xtin page.
//    The sidebar now sits under the fixed Navbar (sticky on desktop, an
//    off-canvas drawer below lg), and the app's own FundaKaMental logo is
//    gone — the Navbar's Xtin wordmark is the only logo. The design tokens
//    come from the shared site block in apps/web/src/index.css.
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  FileText,
  Filter,
  Briefcase,
  Eye,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Coins,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePlanStore, formatTokens } from "../../store/usePlanStore";
import OnboardingTour, { startTour } from "../OnboardingTour";
import RegionSwitcher from "../RegionSwitcher";

interface SidebarProps {
  children: React.ReactNode;
}

const navItems = [
  { name: "Home", icon: Home, href: "/fundakamental", premium: false },
  { name: "New Analysis", icon: FileText, href: "/fundakamental/analyze", premium: false },
  { name: "Stock Scanner", icon: Filter, href: "/fundakamental/scanner", premium: true },
  { name: "Portfolio", icon: Briefcase, href: "/fundakamental/portfolio", premium: false },
  { name: "Watchlist", icon: Eye, href: "/fundakamental/watchlist", premium: false },
  { name: "History", icon: Clock, href: "/fundakamental/history", premium: false },
  { name: "Settings", icon: Settings, href: "/fundakamental/settings", premium: false },
];

const DashboardLayout = ({ children }: SidebarProps) => {
  const [sidebarCollapsed, setCollapsed] = useState(false);
  // Below lg the sidebar is an off-canvas drawer; it always shows full width there.
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = sidebarCollapsed && !mobileOpen;
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);
  // Subscribe to the plan itself: selecting the isPro function never re-rendered
  // once the plan loaded, so paying users kept seeing Free gates.
  const isPro = usePlanStore((s) => s.plan === "premium" || s.plan === "enterprise");
  const wallet = usePlanStore((s) => s.wallet);
  const fetchWallet = usePlanStore((s) => s.fetchWallet);
  const openBuyTokens = usePlanStore((s) => s.openBuyTokens);

  const refreshPlan = usePlanStore((s) => s.refreshPlan);

  // Refresh the plan and AI token balance when the dashboard mounts. The plan
  // used to be read only after a checkout, so every Pro/bundle customer saw
  // "Free Plan" and gated tools again after any reload.
  useEffect(() => {
    refreshPlan();
    fetchWallet();
  }, [refreshPlan, fetchWallet]);

  return (
    <>
      <Navbar />
      {/* pt-20 clears the fixed site Navbar */}
      <div className="fundakamental-scope pt-20 min-h-screen bg-background flex">
        {/* Sidebar — sticky under the Navbar on desktop, a drawer below lg */}
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 76 : 260 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed left-0 top-20 bottom-0 z-40 shrink-0 bg-white border-r border-border flex flex-col overflow-y-auto transition-transform duration-200",
            "lg:sticky lg:top-20 lg:bottom-auto lg:h-[calc(100vh-5rem)] lg:self-start lg:z-10 lg:overflow-visible lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Region / currency — sets prices, symbols & examples app-wide */}
          <div className={cn("px-3 pt-3", collapsed ? "flex justify-center" : "")} data-tour="region-switcher">
            <RegionSwitcher compact={collapsed} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 min-h-0 overflow-y-auto py-4 px-3 space-y-0.5" data-tour="sidebar-nav">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  data-tour={item.premium ? "nav-premium" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group",
                    isActive
                      ? "bg-accent text-primary font-semibold"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && "text-primary")} />
                  {!collapsed && (
                    <>
                      <span className="text-sm">{item.name}</span>
                      {item.premium && (
                        <span className="ml-auto text-[9px] font-extrabold tracking-wide px-1.5 py-0.5 rounded bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                          PRO
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && item.premium && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* AI token balance — the metered fuel for reports & Q&A */}
          {!collapsed && wallet && (
            <div className="mx-3 mb-3 p-3 rounded-xl bg-white border border-border">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-primary" /> AI tokens
                </span>
                <span className="text-xs font-bold text-foreground">{formatTokens(wallet.balance)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, Math.round((wallet.balance / Math.max(1, wallet.monthly_grant)) * 100))}%` }}
                />
              </div>
              <button
                onClick={() => (isPro ? openBuyTokens() : usePlanStore.getState().openUpgrade("reports"))}
                className="mt-2 text-[11px] font-semibold text-primary hover:underline"
              >
                {isPro ? "Buy more tokens" : "Get more with Pro →"}
              </button>
            </div>
          )}

          {/* Upgrade Card — shown to Free-plan users */}
          {!collapsed && !isPro && (
            <div className="mx-3 mb-3 p-4 rounded-2xl bg-accent border border-primary/10" data-tour="upgrade-card">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground capitalize">Free Plan</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                60K AI tokens included every month
              </p>
              <Button
                size="sm"
                onClick={() => usePlanStore.getState().openUpgrade("general")}
                className="w-full bg-primary hover:bg-primary/90 text-white text-xs rounded-full font-medium"
              >
                Upgrade to Premium
              </Button>
            </div>
          )}

          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white border border-border hidden lg:flex items-center justify-center hover:bg-accent transition-colors shadow-sm"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
        </motion.aside>

        {mobileOpen && (
          <div
            className="fixed inset-x-0 top-20 bottom-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile bar — opens the sidebar drawer */}
          <div className="lg:hidden sticky top-20 z-20 h-14 flex items-center gap-3 px-4 bg-white border-b border-border">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg text-foreground hover:bg-accent transition-colors"
              aria-label="Open FundaKaMental menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/fundakamental" className="text-base font-semibold text-gray-900">
              FundaKaMental
            </Link>
          </div>
          {children}
        </main>

        {/* First-run guided tour + re-launch control */}
        <OnboardingTour />
        <button
          onClick={startTour}
          title="Take the tour"
          className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full bg-white border border-border shadow-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
          aria-label="Take the product tour"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
      <Footer />
    </>
  );
};

export default DashboardLayout;
