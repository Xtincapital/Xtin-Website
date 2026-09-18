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
// Auth: uses the shared `useAuth()` (apps/web/src/contexts/AuthContext.tsx)
// for logout — no Gini-specific auth (the original had none of its own
// either; it relied on the same Supabase session) is reproduced here,
// matching Journal/FundaKaMental's own layouts.
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  LogOut,
  ChevronLeft,
  ChevronRight,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import ChatWidget from "./ChatWidget";

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
      { name: "Required Return", icon: Percent, href: "/gini/required-return" },
      { name: "Monte Carlo", icon: Dices, href: "/gini/monte-carlo" },
    ],
  },
  {
    label: "Planning",
    items: [
      { name: "Retirement", icon: Landmark, href: "/gini/retirement" },
      { name: "Calculators", icon: Calculator, href: "/gini/calculators" },
      { name: "Family Planning", icon: HeartHandshake, href: "/gini/family-planning" },
      { name: "Advanced Planning", icon: ShieldCheck, href: "/gini/family-advanced" },
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
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Sidebar — Clean white, Xtin-aligned (same treatment as
          Journal/FundaKaMental's layouts) */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 76 : 260 }}
        transition={{ duration: 0.2 }}
        className="fixed left-0 top-0 h-full bg-white border-r border-border flex flex-col z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border shrink-0">
          <Link to="/gini" className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </span>
            {!collapsed && (
              <span className="font-bold tracking-tight text-xl leading-none text-foreground whitespace-nowrap">
                Gini
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <div className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
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
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group",
                        isActive
                          ? "bg-accent text-primary font-semibold"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && "text-primary")} />
                      {!collapsed && <span className="text-sm">{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-border space-y-0.5 shrink-0">
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
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center hover:bg-accent transition-colors shadow-sm"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-200 min-h-screen",
          collapsed ? "ml-[76px]" : "ml-[260px]"
        )}
      >
        {children}
      </main>

      {/* Floating AI chat widget — see GiniApp.tsx's header comment: not a
          route, mounted directly here as a sibling of the sidebar/main
          content so it floats over every Gini page (Phase 10f). */}
      <ChatWidget />
    </div>
  );
};

export default GiniLayout;
