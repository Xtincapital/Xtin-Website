// Ported from features-incoming/fundakamental/src/components/dashboard/DashboardLayout.tsx.
// This is the navigation shell every FundaKaMental page wraps its content in.
//
// Adaptations from the original:
//  - `useAuthStore` (dropped, redundant with the host app's own auth — see
//    ../../FundakamentalApp.tsx's header comment) replaced with the shared
//    `useAuth()` (apps/web/src/contexts/AuthContext.tsx). No more
//    `initializeAuth()` call on mount — the host app's `AuthContext` already
//    initializes auth once at the app root.
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
//  - `Logo`/`LogoMark`, `OnboardingTour`, `RegionSwitcher` imports point at
//    this port's own copies (relative paths) instead of the standalone
//    app's `@/components/...` — in this monorepo `@/` resolves to the
//    *shared* `apps/web/src/` tree, not a FundaKaMental-local one, so those
//    absolute imports would resolve to the wrong (or nonexistent) files.
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  FileText,
  Filter,
  Briefcase,
  Eye,
  Clock,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Coins,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Logo, { LogoMark } from "../brand/Logo";
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
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);
  const isPro = usePlanStore((s) => s.isPro)();
  const wallet = usePlanStore((s) => s.wallet);
  const fetchWallet = usePlanStore((s) => s.fetchWallet);
  const openBuyTokens = usePlanStore((s) => s.openBuyTokens);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Refresh the AI token balance when the dashboard mounts.
  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Sidebar — Clean white, Xtin-aligned */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 76 : 260 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r border-border flex flex-col z-50 transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border">
          <Link to="/fundakamental" className="flex items-center gap-2.5">
            {collapsed ? (
              <LogoMark size={36} />
            ) : (
              <Logo size="md" />
            )}
          </Link>
        </div>

        {/* Region / currency — sets prices, symbols & examples app-wide */}
        <div className={cn("px-3 pt-3", collapsed ? "flex justify-center" : "")} data-tour="region-switcher">
          <RegionSwitcher compact={collapsed} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-0.5" data-tour="sidebar-nav">
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
              5 AI reports included every month
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

        {/* Bottom actions */}
        <div className="p-3 border-t border-border space-y-0.5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Log Out</span>}
          </button>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-border hidden lg:flex items-center justify-center hover:bg-accent transition-colors shadow-sm"
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
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 min-w-0 transition-all duration-200 min-h-screen",
          collapsed ? "lg:ml-[76px]" : "lg:ml-[260px]"
        )}
      >
        {/* Mobile top bar — opens the sidebar drawer */}
        <div className="lg:hidden sticky top-0 z-30 h-14 flex items-center gap-3 px-4 bg-white border-b border-border">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-foreground hover:bg-accent transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/fundakamental" className="flex items-center">
            <Logo size="md" />
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
  );
};

export default DashboardLayout;
