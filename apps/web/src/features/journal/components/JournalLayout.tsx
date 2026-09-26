// Journal's navigation shell — the header/tab bar every Journal page wraps
// its content in.
//
// Design: restores the ORIGINAL standalone Journal app's look
// (features-incoming/journal/index.html — `.app-header`, `.tabs-container`,
// `.tab-button`, `.tab-content`), which the Phase 9d port had replaced with a
// FundaKaMental-style sidebar. The original was a single-page app whose
// `switchTab()` toggled `.tab-content` divs; here each tab is a real route.
// The matching styles live in ../journal.css under `.journal-classic`.
//
// The only departures from the original chrome: the shared site Navbar and
// Footer wrap the page (so the single main Xtin wordmark in the Navbar is the
// only logo — the original header's own logo image and "Xtin Capital" link are
// dropped), and the region/currency/time-zone selectors are dropped because
// the Navbar's RegionSwitcher already covers region/currency app-wide.
//
// Route paths here MUST match ../JournalApp.tsx's route list exactly (see that
// file's header comment).
//
// Auth: uses the shared `useAuth()` (apps/web/src/contexts/AuthContext.tsx)
// for logout.
import { useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface JournalLayoutProps {
  children: React.ReactNode;
}

interface TabItem {
  name: string;
  href: string;
  /** Dashboard is the index route (`/journal`) — needs an exact match or it
   *  would stay active on every Journal page. */
  end?: boolean;
}

// The original's tab order (dashboard, trades, psychology, hourly, calendar,
// summary, monthly, daily, analytics, heatmaps), followed by the sections the
// port added (goals, AI coach, pricing — was "subscription" — and settings).
const tabs: TabItem[] = [
  { name: "Dashboard", href: "/journal", end: true },
  { name: "Trades", href: "/journal/trades" },
  { name: "Psychology", href: "/journal/psychology" },
  { name: "Hourly Analysis", href: "/journal/hourly" },
  { name: "Calendar", href: "/journal/calendar" },
  { name: "Metrics", href: "/journal/summary" },
  { name: "Monthly", href: "/journal/monthly" },
  { name: "Daily", href: "/journal/daily" },
  { name: "Analytics", href: "/journal/analytics" },
  { name: "Heatmaps", href: "/journal/heatmaps" },
  { name: "Goals", href: "/journal/goals" },
  { name: "AI Coach", href: "/journal/coach" },
  { name: "Pricing", href: "/journal/pricing" },
  { name: "Settings", href: "/journal/settings" },
];

const JournalLayout = ({ children }: JournalLayoutProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const tabsRef = useRef<HTMLElement>(null);

  // On narrow screens the tab bar scrolls sideways; keep the active tab visible.
  useEffect(() => {
    const bar = tabsRef.current;
    const active = bar?.querySelector<HTMLElement>(".tab-button.active");
    if (bar && active) {
      const barBox = bar.getBoundingClientRect();
      const tabBox = active.getBoundingClientRect();
      bar.scrollLeft += tabBox.left - barBox.left - (barBox.width - tabBox.width) / 2;
    }
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <Navbar />
      <div className="journal-scope journal-classic">
        <header className="app-header">
          <div className="header-left">
            <NavLink to="/journal" end className="brand-link">
              <span className="brand-name-main">Xtin</span>
              <span className="brand-name-accent">Journal</span>
            </NavLink>
            <p>Trading Journal</p>
          </div>
          <div className="header-right">
            <button type="button" onClick={handleLogout} className="btn btn-secondary">
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </header>

        <nav ref={tabsRef} className="tabs-container" aria-label="Trading journal sections">
          {tabs.map((tab) => (
            <NavLink
              key={tab.href}
              to={tab.href}
              end={tab.end}
              className={({ isActive }) => (isActive ? "tab-button active" : "tab-button")}
            >
              {tab.name}
            </NavLink>
          ))}
        </nav>

        <main id="main-content" className="tab-content journal-content">
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default JournalLayout;
