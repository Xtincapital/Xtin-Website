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
import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Settings as SettingsIcon } from "lucide-react";
import { AI_LAUNCHER_CLASS, AiLauncherInner } from "@/components/AiLauncher";
import { ProIcon } from "@/components/ProMark";
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
// port added (goals and pricing — was "subscription"). AI Coach is a floating
// button (bottom-right, like Gini's chat) and Settings is a gear beside
// "Load sample", so neither crowds the tab bar.
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
  { name: "Pricing", href: "/journal/pricing" },
];

const JournalLayout = ({ children, proFeature }: JournalLayoutProps) => {
  const { pathname } = useLocation();
  // Subscribe to the plan itself: selecting the isPro function never re-rendered
  // once the plan loaded, so paying users kept seeing Free gates.
  const isPro = useJournalPlanStore((s) => !!s.validUntil && new Date(s.validUntil).getTime() > Date.now());
  const planFetched = useJournalPlanStore((s) => s.fetched);
  const fetchPlan = useJournalPlanStore((s) => s.fetchPlan);

  // Server-backed plan lookup, once per session — fails closed (not Pro) if it errors.
  useEffect(() => {
    if (!planFetched) fetchPlan();
  }, [planFetched, fetchPlan]);

  return (
    <>
      <Navbar />
      <div className="journal-scope journal-classic">
        {/* One bar: every tab stays visible (wrapping on narrow screens). */}
        <div className="nav-bar">
          <nav className="tabs-container" aria-label="Trading journal sections">
            {tabs.map((tab) => (
              <NavLink
                key={tab.href}
                to={tab.href}
                end={tab.end}
                className={({ isActive }) => (isActive ? "tab-button active" : "tab-button")}
              >
                {tab.name}
                {tab.pro && planFetched && <ProIcon unlocked={isPro} className="tab-lock" />}
              </NavLink>
            ))}
          </nav>
          <div className="nav-sample">
            <JournalSampleBar placement="button" />
            <NavLink
              to="/journal/settings"
              className={({ isActive }) => (isActive ? "nav-settings active" : "nav-settings")}
              aria-label="Journal settings"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" aria-hidden="true" />
            </NavLink>
          </div>
        </div>

        <JournalSampleBar placement="banner" />

        <main id="main-content" className="tab-content journal-content">
          {proFeature ? (
            <ProGate feature={proFeature} isPro={isPro} loading={!planFetched}>
              {children}
            </ProGate>
          ) : (
            children
          )}
        </main>
        {/* AI Coach: out of the tab bar, a floating button that expands on hover. */}
        {pathname !== "/journal/coach" && (
          <NavLink to="/journal/coach" className={AI_LAUNCHER_CLASS} aria-label="Open AI Coach" title="AI Coach">
            <AiLauncherInner label="AI Coach" sub="Review your trades" />
          </NavLink>
        )}
      </div>
      <Footer />
    </>
  );
};

export default JournalLayout;
