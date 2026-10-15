// Gini's navigation shell — the sidebar/header every Gini page wraps its
// content in. Modeled on
// apps/web/src/features/journal/components/JournalLayout.tsx (read as this
// task's template), but built fresh rather than ported: the original
// standalone app (features-incoming/gini/index.html + app.js) had no
// component-based nav at all — it was a single-page app with a sidebar of
// `.nav-item[data-tab]` buttons toggling `.tab-content` divs (see
// index.html's `<nav class="sidebar-nav">`, ~lines 460-584, for the full
// list of tabs this nav reproduces as real routes instead).
//
// Route paths chosen here MUST match ../GiniApp.tsx's route list exactly
// (see that file's header comment) — this task's Dashboard/Family/NetWorth/
// Goals pages and every later Gini sub-phase (portfolio, planner,
// calculators, family planning, reports, chat, pricing) build against these
// same hrefs.
//
// No Log Out button here: signing out lives in the site's own account menu
// (Dashboard), like every other page.
//
// Site integration: wrapped in the shared site Navbar + Footer like every
// other Xtin page. The sidebar sits under the fixed Navbar (sticky on
// desktop, an off-canvas drawer below lg) and carries no Gini logo of its own
// — the Navbar's Xtin wordmark is the only logo. Design tokens come from the
// shared site block in apps/web/src/index.css.
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Target,
  PieChart,
  TrendingUp,
  Percent,
  Dices,
  Landmark,
  Calculator,
  HeartHandshake,
  ShieldCheck,
  FileBarChart,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "./ChatWidget";
import { PRO_TAG } from "../lib/ui";
import GiniSampleBar from "./GiniSampleBar";
import { useGiniPlanStore } from "../store/useGiniPlanStore";

interface GiniLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  icon: typeof LayoutDashboard;
  href: string;
  /** Dashboard is the index route (`/gini`) — needs an exact match instead
   *  of the `startsWith` used for every other (nested) route, or it would
   *  stay highlighted on every Gini page. */
  exact?: boolean;
  /** Pro-only page (matches the Pricing page's Pro feature list). */
  pro?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

// Full route list, matching every tab index.html's sidebar had (dashboard,
// family-settings, networth, goals, portfolio, planner, required-return,
// monte-carlo, retirement, calculators, family-planning, family-advanced,
// reports) plus pricing as a new section, same convention Journal added for
// its own Pro plan page — see GiniApp.tsx's header comment for the
// canonical path list. The original's floating AI chat widget
// (`#chatbotToggle`/`#chatbotWindow`) is NOT a nav item/route here either —
// it's reproduced as a floating widget mounted directly in this layout
// (Phase 10f), matching the original's actual UX rather than turning it
// into a page the way Journal's AI coach became.
const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", icon: LayoutDashboard, href: "/gini", exact: true }],
  },
  {
    label: "Household",
    items: [
      { name: "Family", icon: Users, href: "/gini/family" },
      { name: "Net Worth", icon: Wallet, href: "/gini/networth" },
      { name: "Goals", icon: Target, href: "/gini/goals" },
    ],
  },
  {
    label: "Analysis",
    items: [
      { name: "Portfolio", icon: PieChart, href: "/gini/portfolio" },
      { name: "Planner", icon: TrendingUp, href: "/gini/planner" },
      { name: "Required Return", pro: true, icon: Percent, href: "/gini/required-return" },
      { name: "Monte Carlo", pro: true, icon: Dices, href: "/gini/monte-carlo" },
    ],
  },
  {
    label: "Planning",
    items: [
      { name: "Retirement", icon: Landmark, href: "/gini/retirement" },
      { name: "Calculators", icon: Calculator, href: "/gini/calculators" },
      { name: "Family Planning", icon: HeartHandshake, href: "/gini/family-planning" },
      { name: "Advanced Planning", pro: true, icon: ShieldCheck, href: "/gini/family-advanced" },
    ],
  },
  {
    label: "Insights",
    items: [{ name: "Reports", icon: FileBarChart, href: "/gini/reports" }],
  },
  {
    label: "Account",
    items: [{ name: "Pricing", icon: CreditCard, href: "/gini/pricing" }],
  },
];

const isActivePath = (pathname: string, item: NavItem) =>
  item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

const GiniLayout = ({ children }: GiniLayoutProps) => {
  const [sidebarCollapsed, setCollapsed] = useState(false);
  // Below lg the sidebar is an off-canvas drawer; it always shows full width there.
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = sidebarCollapsed && !mobileOpen;
  const location = useLocation();
  // Subscribe to the plan itself: selecting the isPro function never re-rendered
  // once the plan loaded, so paying users kept seeing Free gates.
  const isPro = useGiniPlanStore((s) => !!s.validUntil && new Date(s.validUntil).getTime() > Date.now());
  const planFetched = useGiniPlanStore((s) => s.fetched);
  const fetchPlan = useGiniPlanStore((s) => s.fetchPlan);

  // Server-backed plan lookup, once per session — fails closed (not Pro) if it errors.
  useEffect(() => {
    if (!planFetched) fetchPlan();
  }, [planFetched, fetchPlan]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      {/* pt-20 clears the fixed site Navbar */}
      <div
        className="gini-scope pt-20 min-h-screen bg-background flex"
        style={{ "--sb": collapsed ? "76px" : "260px" } as React.CSSProperties}
      >
        {/* Sidebar — sticky under the Navbar on desktop, a drawer below lg */}
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 76 : 260 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed left-0 top-20 bottom-0 z-40 shrink-0 bg-card lg:bg-secondary/40 border-r border-border flex flex-col transition-transform duration-200",
            "lg:sticky lg:top-20 lg:bottom-auto lg:h-[calc(100vh-5rem)] lg:self-start lg:z-10 lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Navigation */}
          <nav className="flex-1 min-h-0 py-4 px-3 space-y-4 overflow-y-auto">
            {navSections.map((section) => (
              <div key={section.label}>
                {!collapsed && (
                  <div className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                    {section.label}
                  </div>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = isActivePath(location.pathname, item);
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 relative group",
                          isActive
                            ? "text-foreground font-bold"
                            : "text-muted-foreground font-medium hover:text-foreground"
                        )}
                        title={collapsed ? item.name : undefined}
                      >
                        {/* Sliding highlight behind the active item */}
                        {isActive && (
                          <motion.span
                            layoutId="gini-nav-active"
                            className="absolute inset-0 -z-0 rounded-xl border border-border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.18)] before:absolute before:-left-px before:top-2.5 before:bottom-2.5 before:w-[3px] before:rounded-full before:bg-brand-fill"
                            transition={{ type: "spring", stiffness: 420, damping: 30 }}
                          />
                        )}
                        <item.icon className={cn("relative w-[18px] h-[18px] flex-shrink-0", isActive && "text-brand dark:text-brand")} />
                        {!collapsed && <span className="relative text-sm">{item.name}</span>}
                        {!collapsed && item.pro && planFetched && (
                          <span className={cn("relative ml-auto", PRO_TAG)} title={isPro ? "Pro feature (unlocked)" : "Pro feature"}>
                            PRO
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-card border border-border hidden lg:flex items-center justify-center hover:bg-accent transition-colors shadow-sm"
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
        {/* Page content sits in the site's centred column (same edges as the
            nav, Tools and Learn) while the sidebar stays on the screen edge.
            Padding % is relative to the full-width row; below ~1800px the
            column would run under the sidebar, so it starts 2rem after it.
            The layout owns the side margins, so pages drop their own (px-0)
            on desktop and every page's text lines up with the nav. */}
        <main className="flex-1 min-w-0 lg:pl-[max(2rem,calc((100%_-_80rem)/2_-_var(--sb)))] lg:pr-[max(2rem,calc((100%_-_80rem)/2))] lg:[&>*]:!px-0">
          {/* Mobile bar — opens the sidebar drawer */}
          <div className="lg:hidden sticky top-20 z-20 h-14 flex items-center gap-3 px-4 bg-card border-b border-border">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg text-foreground hover:bg-accent transition-colors"
              aria-label="Open Gini menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/gini" className="text-base font-semibold text-foreground">
              Gini
            </Link>
          </div>
          <GiniSampleBar />
          {children}
        </main>

        {/* Floating AI chat widget — see GiniApp.tsx's header comment: not a
            route, mounted directly here as a sibling of the sidebar/main
            content so it floats over every Gini page (Phase 10f). */}
        <ChatWidget />
      </div>
      <Footer />
    </>
  );
};

export default GiniLayout;
