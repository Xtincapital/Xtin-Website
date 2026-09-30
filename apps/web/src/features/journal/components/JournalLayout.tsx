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
// No Log Out button here: signing out lives in the site's own account menu
// (Dashboard), like every other page.
import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Lock } from "lucide-react";
import JournalSampleBar from "./JournalSampleBar";
import ProGate from "./ProGate";
import { useJournalPlanStore } from "../store/useJournalPlanStore";

interface JournalLayoutProps {
  children: React.ReactNode;
  /** Set on Pro-only pages: shows an upgrade prompt instead of the page
   *  content unless the user has an active Journal Pro plan. */
  proFeature?: string;
}

interface TabItem {
  name: string;
  href: string;
  /** Dashboard is the index route (`/journal`) — needs an exact match or it
   *  would stay active on every Journal page. */
  end?: boolean;
  /** Pro-only section (matches the Pricing page's Pro feature list). */
  pro?: boolean;
}

// The original's tab order (dashboard, trades, psychology, hourly, calendar,
// summary, monthly, daily, analytics, heatmaps), followed by the sections the
// port added (goals, AI coach, pricing — was "subscription" — and settings).
const tabs: TabItem[] = [
  { name: "Dashboard", href: "/journal", end: true },
  { name: "Trades", href: "/journal/trades" },
  { name: "Psychology", href: "/journal/psychology", pro: true },
  { name: "Hourly Analysis", href: "/journal/hourly", pro: true },
  { name: "Calendar", href: "/journal/calendar" },
  { name: "Metrics", href: "/journal/summary" },
  { name: "Monthly", href: "/journal/monthly" },
  { name: "Daily", href: "/journal/daily" },
  { name: "Analytics", href: "/journal/analytics", pro: true },
  { name: "Heatmaps", href: "/journal/heatmaps", pro: true },
  { name: "Goals", href: "/journal/goals" },
  { name: "AI Coach", href: "/journal/coach" },
  { name: "Pricing", href: "/journal/pricing" },
  { name: "Settings", href: "/journal/settings" },
];

const JournalLayout = ({ children, proFeature }: JournalLayoutProps) => {
  const { pathname } = useLocation();
  const tabsRef = useRef<HTMLElement>(null);
  const isPro = useJournalPlanStore((s) => s.isPro)();
  const planFetched = useJournalPlanStore((s) => s.fetched);
  const fetchPlan = useJournalPlanStore((s) => s.fetchPlan);

  // Server-backed plan lookup, once per session — fails closed (not Pro) if it errors.
  useEffect(() => {
    if (!planFetched) fetchPlan();
  }, [planFetched, fetchPlan]);

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

  return (
    <>
      <Navbar />
      <div className="journal-scope journal-classic">
        {/* One bar: the Xtin Journal brand sits in the nav with the tabs. */}
        <div className="nav-bar">
          <NavLink to="/journal" end className="brand-link" aria-label="Xtin Journal home">
            <span className="brand-name-main">Xtin</span>
            <span className="brand-name-accent">Journal</span>
          </NavLink>
          <nav ref={tabsRef} className="tabs-container" aria-label="Trading journal sections">
            {tabs.map((tab) => (
              <NavLink
                key={tab.href}
                to={tab.href}
                end={tab.end}
                className={({ isActive }) => (isActive ? "tab-button active" : "tab-button")}
              >
                {tab.name}
                {tab.pro && !isPro && planFetched && (
                  <Lock className="tab-lock" aria-label="Pro feature" />
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <JournalSampleBar />

        <main id="main-content" className="tab-content journal-content">
          {proFeature ? (
            <ProGate feature={proFeature} isPro={isPro} loading={!planFetched}>
              {children}
            </ProGate>
          ) : (
            children
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default JournalLayout;
