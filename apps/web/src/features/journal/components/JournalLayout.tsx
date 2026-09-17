// Journal's navigation shell — the sidebar/header every Journal page wraps
// its content in. Modeled on
// apps/web/src/features/fundakamental/components/dashboard/DashboardLayout.tsx
// (read as this task's template), but built fresh rather than ported: the
// original standalone app (features-incoming/journal/app.js) had no
// component-based nav at all — it was a single-page app with a
// `switchTab()` function toggling `.tab-content`/`.tab-button` DOM classes
// (see that function for the full list of tabs this nav reproduces as real
// routes instead).
//
// Route paths chosen here MUST match ../JournalApp.tsx's route list exactly
// (see that file's header comment) — the parallel Trades/Goals task and
// later AI-coach/import/wallet/plan sub-phases build pages against these
// same hrefs.
//
// Auth: uses the shared `useAuth()` (apps/web/src/contexts/AuthContext.tsx)
// for logout — no Journal-specific auth (the original's
// `supabase-journal.js` login flow) is reproduced here, matching
// FundaKaMental's own DashboardLayout.
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Receipt,
  Target,
  CalendarDays,
  BarChart3,
  Flame,
  Brain,
  Clock,
  FileText,
  CalendarRange,
  CalendarClock,
  Sparkles,
  Settings,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface JournalLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  icon: typeof LayoutDashboard;
  href: string;
  /** Dashboard is the index route (`/journal`) — needs an exact match
   *  instead of the `startsWith` used for every other (nested) route, or it
   *  would stay highlighted on every Journal page. */
  exact?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

// Full route list, matching every tab app.js's switchTab() had (dashboard,
// trades, psychology, hourly, calendar, summary, monthly, daily, analytics,
// subscription→pricing, heatmaps) plus goals + AI coach as new sections —
// see JournalApp.tsx's header comment for the canonical path list.
const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", icon: LayoutDashboard, href: "/journal", exact: true }],
  },
  {
    label: "Trading",
    items: [
      { name: "Trades", icon: Receipt, href: "/journal/trades" },
      { name: "Goals", icon: Target, href: "/journal/goals" },
      { name: "Calendar", icon: CalendarDays, href: "/journal/calendar" },
      { name: "Analytics", icon: BarChart3, href: "/journal/analytics" },
      { name: "Heatmaps", icon: Flame, href: "/journal/heatmaps" },
    ],
  },
  {
    label: "Insights",
    items: [
      { name: "Psychology", icon: Brain, href: "/journal/psychology" },
      { name: "Hourly", icon: Clock, href: "/journal/hourly" },
      { name: "Summary", icon: FileText, href: "/journal/summary" },
      { name: "Monthly", icon: CalendarRange, href: "/journal/monthly" },
      { name: "Daily", icon: CalendarClock, href: "/journal/daily" },
    ],
  },
  {
    label: "AI Coach",
    items: [{ name: "Coach", icon: Sparkles, href: "/journal/coach" }],
  },
  {
    label: "Account",
    items: [
      { name: "Settings", icon: Settings, href: "/journal/settings" },
      { name: "Pricing", icon: CreditCard, href: "/journal/pricing" },
    ],
  },
];

const isActivePath = (pathname: string, item: NavItem) =>
  item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

const JournalLayout = ({ children }: JournalLayoutProps) => {
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
          FundaKaMental's DashboardLayout) */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 76 : 260 }}
        transition={{ duration: 0.2 }}
        className="fixed left-0 top-0 h-full bg-white border-r border-border flex flex-col z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border shrink-0">
          <Link to="/journal" className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </span>
            {!collapsed && (
              <span className="font-bold tracking-tight text-xl leading-none text-foreground whitespace-nowrap">
                Trading <span className="text-primary">Journal</span>
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
    </div>
  );
};

export default JournalLayout;
