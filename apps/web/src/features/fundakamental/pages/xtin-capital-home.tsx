import React, { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Search, TrendingUp, TrendingDown, Building2, MapPin, User, Briefcase,
  Sparkles, ShieldCheck, ChevronDown, ArrowRight, ArrowUpRight,
  Target, AlertTriangle, Trophy, Gauge as GaugeIcon, Layers, Lock,
  BarChart3, BrainCircuit, FileText, CheckCircle2, Zap, ArrowLeft
} from "lucide-react";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import { FUNDAMENTAL_URL } from "../../../constants/externalApps";

const APP_URL = FUNDAMENTAL_URL;
const appLink = (path) => `${APP_URL.replace(/\/$/, "")}${path}`;

/* ═══════════════════════════════════════════════════════════
   Sample research dataset (illustrative demo data)
   ═══════════════════════════════════════════════════════════ */
const COMPANIES = {
  TCS: {
    ticker: "TCS", name: "Tata Consultancy Services", logo: "T", color: "#10b981",
    sector: "Information Technology", industry: "IT Services & Consulting",
    ceo: "K Krithivasan", hq: "Mumbai, India",
    marketCap: "₹14.2L Cr", price: "3,912.40", change: 1.24, up: true,
    profile: "India's largest IT services firm and a global leader in consulting, digital transformation and managed services across 55 countries.",
    health: { revGrowth: "+6.8%", profitGrowth: "+9.1%", roe: "51.4%", roce: "64.2%", de: "0.09" },
    valuation: { pe: "29.1", pb: "14.8", evEbitda: "20.4", fairValue: "4,150", current: "3,912" },
    growth: { cagr: "12.4%", revGrowth: "+6.8%", epsGrowth: "+10.2%" },
    scores: { growth: 78, quality: 94, valuation: 62, risk: 88, overall: 86 },
    trend: [{ y: "FY21", rev: 164, pft: 32 }, { y: "FY22", rev: 191, pft: 38 }, { y: "FY23", rev: 226, pft: 42 }, { y: "FY24", rev: 240, pft: 46 }, { y: "FY25", rev: 256, pft: 50 }],
    ai: {
      bull: "Industry-leading margins, a record-high order book and disciplined capital returns make TCS a compounding cash machine with durable client relationships.",
      bear: "Discretionary tech spending remains soft, wage inflation pressures margins, and a premium valuation leaves little room for execution slips.",
      risks: ["Slower discretionary IT spend in BFSI", "Rupee appreciation vs USD", "Visa & onsite cost pressure", "Premium valuation re-rating risk"],
      moat: ["Deep, sticky enterprise relationships", "Scale & delivery talent pool", "Brand & Tata governance", "Best-in-class margins"],
      outlook: "Steady high-single-digit revenue growth with margin defence; AI-led deals expected to accelerate from FY26.",
    },
    thesis: {
      buy: ["Highest ROE & ROCE in the sector", "Net cash balance sheet, ~100% FCF conversion", "Consistent dividend + buyback policy", "Large deal momentum building"],
      avoid: ["Trades at a premium to historical PE", "Near-term growth muted by macro", "Limited margin expansion headroom"],
      catalysts: ["AI & GenAI deal ramp-ups", "BFSI spending recovery", "Large multi-year transformation wins"],
      risk: ["Client concentration in US/Europe", "Currency volatility", "Talent attrition cycles"],
      moat: "Wide moat — unmatched delivery scale, blue-chip client stickiness and a fortress balance sheet underpin pricing power and superior returns on capital.",
    },
    peers: ["TCS", "INFY", "WIPRO", "HCLTECH"], peerLabel: "IT Services peers",
  },
  RELIANCE: {
    ticker: "RELIANCE", name: "Reliance Industries", logo: "R", color: "#059669",
    sector: "Energy & Conglomerate", industry: "Oil, Telecom & Retail",
    ceo: "Mukesh Ambani", hq: "Mumbai, India",
    marketCap: "₹19.8L Cr", price: "2,924.80", change: 0.62, up: true,
    profile: "India's largest company by market value, spanning energy & petrochemicals (O2C), the Jio digital & telecom platform, and Reliance Retail — the country's largest retailer.",
    health: { revGrowth: "+8.4%", profitGrowth: "+11.3%", roe: "9.1%", roce: "10.4%", de: "0.44" },
    valuation: { pe: "27.9", pb: "2.3", evEbitda: "13.8", fairValue: "3,150", current: "2,924" },
    growth: { cagr: "13.6%", revGrowth: "+8.4%", epsGrowth: "+9.7%" },
    scores: { growth: 84, quality: 76, valuation: 64, risk: 70, overall: 78 },
    trend: [{ y: "FY21", rev: 539, pft: 49 }, { y: "FY22", rev: 721, pft: 60 }, { y: "FY23", rev: 902, pft: 66 }, { y: "FY24", rev: 968, pft: 70 }, { y: "FY25", rev: 1010, pft: 78 }],
    ai: {
      bull: "A multi-engine growth story — Jio's tariff hikes, Retail's scale-up and a potential new-energy ramp create multiple value-unlock catalysts.",
      bear: "High capex intensity, cyclical O2C earnings and leverage make returns on capital modest relative to consumer peers.",
      risks: ["O2C margin cyclicality", "Elevated capex & debt", "Regulatory/telecom pricing", "New-energy execution risk"],
      moat: ["Largest retail & telecom networks", "Integrated O2C scale", "Balance-sheet firepower"],
      outlook: "Double-digit consolidated growth led by consumer and digital; new-energy a long-dated optionality.",
    },
    thesis: {
      buy: ["Dominant consumer + digital platforms", "Jio ARPU upcycle", "Retail store expansion", "New-energy optionality"],
      avoid: ["Low ROE vs consumer peers", "Heavy capex cycle", "Holding-company complexity"],
      catalysts: ["Jio/Retail value unlock (IPO)", "Telecom tariff hikes", "New-energy commissioning"],
      risk: ["Oil & refining cycles", "Leverage & capex", "Regulatory shifts"],
      moat: "Wide moat — unrivalled scale across telecom, retail and energy with infrastructure that is near-impossible to replicate.",
    },
    peers: ["RELIANCE", "TCS", "HDFCBANK", "INFY"], peerLabel: "Index heavyweights",
  },
  HDFCBANK: {
    ticker: "HDFCBANK", name: "HDFC Bank", logo: "H", color: "#2563eb",
    sector: "Financial Services", industry: "Private Sector Bank",
    ceo: "Sashidhar Jagdishan", hq: "Mumbai, India",
    marketCap: "₹12.6L Cr", price: "1,654.20", change: -0.31, up: false,
    profile: "India's largest private sector bank by assets, offering retail and wholesale banking with a best-in-class deposit franchise and consistently low credit costs.",
    health: { revGrowth: "+14.2%", profitGrowth: "+12.8%", roe: "16.8%", roce: "7.4%", de: "—" },
    valuation: { pe: "18.6", pb: "2.7", evEbitda: "—", fairValue: "1,820", current: "1,654" },
    growth: { cagr: "16.9%", revGrowth: "+14.2%", epsGrowth: "+11.5%" },
    scores: { growth: 80, quality: 90, valuation: 74, risk: 86, overall: 84 },
    trend: [{ y: "FY21", rev: 120, pft: 31 }, { y: "FY22", rev: 135, pft: 37 }, { y: "FY23", rev: 161, pft: 44 }, { y: "FY24", rev: 283, pft: 61 }, { y: "FY25", rev: 312, pft: 67 }],
    ai: {
      bull: "Post-merger, an unmatched distribution network and granular deposit franchise position HDFC Bank to compound earnings with sector-leading asset quality.",
      bear: "Merger integration is pressuring margins and the loan-to-deposit ratio, capping near-term re-rating until deposits catch up.",
      risks: ["Deposit mobilization pace", "NIM compression post-merger", "Loan-deposit ratio normalization", "Credit cycle turn"],
      moat: ["Largest private deposit base", "Pan-India distribution", "Low credit costs", "Digital banking scale"],
      outlook: "Steady mid-teens loan growth with gradual margin recovery as deposits and integration normalize.",
    },
    thesis: {
      buy: ["Best-in-class asset quality", "Granular low-cost deposits", "Trades below historical PB", "Long runway of branch expansion"],
      avoid: ["Merger integration overhang", "Tight liquidity ratios", "Margin pressure near term"],
      catalysts: ["Deposit growth acceleration", "NIM recovery", "Re-rating to historical multiple"],
      risk: ["Rate cycle on NIMs", "Asset-quality surprises", "Slower deposit accretion"],
      moat: "Wide moat — a deposit franchise and distribution reach competitors have spent decades failing to match.",
    },
    peers: ["HDFCBANK", "RELIANCE", "TCS", "INFY"], peerLabel: "Index heavyweights",
  },
};

const TICKERS = Object.keys(COMPANIES);
const POPULAR = ["TCS", "RELIANCE", "HDFCBANK"];

/* ═══════════════════════════════════════════════════════════
   Animation helpers
   ═══════════════════════════════════════════════════════════ */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const Reveal = ({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section ref={ref} id={id} initial="hidden" animate={inView ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }} className={className}>
      {children}
    </motion.section>
  );
};

/* ═══════════════════════════════════════════════════════════
   Visual components
   ═══════════════════════════════════════════════════════════ */
const ScoreRing = ({ value, size = 132, stroke = 10, label }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = value >= 80 ? "#10b981" : value >= 60 ? "#f59e0b" : "#ef4444";
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-slate-200 dark:stroke-slate-800" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={inView ? { strokeDashoffset: c - (c * value) / 100 } : {}}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tabular-nums" style={{ color: tone }}>{value}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">/ 100</span>
        </div>
      </div>
      {label && <span className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>}
    </div>
  );
};

const ScoreBar = ({ label, value }) => {
  const tone = value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-amber-500" : "bg-rose-500";
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref}>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
        <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <motion.div className={`h-full rounded-full ${tone}`} initial={{ width: 0 }}
          animate={inView ? { width: `${value}%` } : {}} transition={{ duration: 1, ease: "easeOut" }} />
      </div>
    </div>
  );
};

const TrendChart = ({ data, color }) => {
  const max = Math.max(...data.map((d) => d.rev));
  const W = 460, H = 200, pad = 28, bw = (W - pad * 2) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={pad} x2={W - pad} y1={H - pad - (H - pad * 2) * g} y2={H - pad - (H - pad * 2) * g}
          className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="1" strokeDasharray="3 4" />
      ))}
      {data.map((d, i) => {
        const x = pad + i * bw;
        const rh = ((H - pad * 2) * d.rev) / max;
        const ph = ((H - pad * 2) * d.pft) / max;
        return (
          <g key={d.y}>
            <motion.rect x={x + bw * 0.18} width={bw * 0.3} rx="3" fill={color} fillOpacity="0.35"
              initial={{ height: 0, y: H - pad }} whileInView={{ height: rh, y: H - pad - rh }}
              viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.06 }} />
            <motion.rect x={x + bw * 0.52} width={bw * 0.3} rx="3" fill={color}
              initial={{ height: 0, y: H - pad }} whileInView={{ height: ph, y: H - pad - ph }}
              viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.06 + 0.1 }} />
            <text x={x + bw / 2} y={H - 8} textAnchor="middle" className="fill-slate-400 dark:fill-slate-500" fontSize="11">{d.y}</text>
          </g>
        );
      })}
    </svg>
  );
};

const Metric = ({ label, value, accent }: { label: React.ReactNode; value: React.ReactNode; accent?: string }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
    <div className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</div>
    <div className={`mt-1 text-lg font-bold tabular-nums ${accent || "text-slate-900 dark:text-slate-100"}`}>{value}</div>
  </div>
);

const SectionCard = ({ icon: Icon, title, children, className = "" }: { icon: React.ElementType; title: React.ReactNode; children: React.ReactNode; className?: string }) => (
  <motion.div variants={fadeUp} className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 ${className}`}>
    <div className="mb-5 flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-800/40">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">{title}</h3>
    </div>
    {children}
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function XtinCapitalHome() {
  const [activeTicker, setActiveTicker] = useState("TCS");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState(["RELIANCE", "HDFCBANK"]);
  const dashRef = useRef(null);

  const co = COMPANIES[activeTicker];

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return TICKERS.map((t) => COMPANIES[t]).filter(
      (c) => c.name.toLowerCase().includes(q) || c.ticker.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)
    );
  }, [query]);

  const selectCompany = useCallback((ticker, scroll = true) => {
    setActiveTicker(ticker);
    setQuery("");
    setFocused(false);
    setRecent((prev) => [ticker, ...prev.filter((t) => t !== ticker)].slice(0, 4));
    if (scroll) setTimeout(() => dashRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />

      <main id="main-content">
        {/* ─────────── HERO SECTION ─────────── */}
        <section className="relative bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 px-6 md:px-12 lg:px-24 mt-16 overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="fundGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="#10B981" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#fundGrid)" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Hero Content & Search */}
              <div>
                <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }}>
                  
                  {/* Badge */}
                  <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-green-50 text-green-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-green-200 dark:border-emerald-700/50">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Equity Research Workspace · NSE &amp; BSE Listed Companies
                  </motion.div>

                  {/* Headline */}
                  <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 dark:text-slate-100 mb-6">
                    Research Companies with{' '}
                    <span className="text-green-600 dark:text-emerald-400">AI Conviction</span>
                  </motion.h1>

                  {/* Subheadline */}
                  <motion.p variants={fadeUp} className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-lg leading-relaxed">
                    Analyze financial performance, valuation multiples, earnings trends, and business quality scorecards — all in one unified platform.
                  </motion.p>

                  {/* Search Bar Input */}
                  <motion.div variants={fadeUp} className="relative max-w-lg mb-4">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setTimeout(() => setFocused(false), 150)}
                        placeholder="Search company, ticker (e.g. TCS, Reliance)..."
                        className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-16 text-base text-slate-900 shadow-lg shadow-gray-200/50 transition placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:shadow-black/40"
                      />
                      <kbd className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 sm:block">⌘K</kbd>
                    </div>

                    {/* Search Suggestions Dropdown */}
                    <AnimatePresence>
                      {focused && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                          className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                          {query.trim() ? (
                            suggestions.length ? suggestions.map((c) => (
                              <button key={c.ticker} onMouseDown={() => selectCompany(c.ticker)}
                                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ background: c.color }}>{c.logo}</span>
                                <span className="flex-1">
                                  <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">{c.name}</span>
                                  <span className="block text-xs text-slate-400">{c.ticker} · {c.sector}</span>
                                </span>
                                <ArrowUpRight className="h-4 w-4 text-slate-400" />
                              </button>
                            )) : <div className="px-4 py-4 text-sm text-slate-400">No matches found. Try "TCS", "RELIANCE", or "HDFCBANK".</div>
                          ) : (
                            <>
                              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Recent searches</div>
                              {recent.map((t) => {
                                const c = COMPANIES[t];
                                return (
                                  <button key={t} onMouseDown={() => selectCompany(t)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-white" style={{ background: c.color }}>{c.logo}</span>
                                    <span className="text-sm text-slate-700 dark:text-slate-200">{c.name}</span>
                                    <span className="ml-auto text-xs text-slate-400">{c.ticker}</span>
                                  </button>
                                );
                              })}
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Popular Ticker Badges */}
                  <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2 mb-8">
                    <span className="text-xs font-semibold text-slate-400">Popular:</span>
                    {POPULAR.map((t) => (
                      <button key={t} onClick={() => selectCompany(t)}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                          activeTicker === t 
                            ? "bg-green-600 text-white shadow-md shadow-green-600/20" 
                            : "border border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:text-green-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        }`}>
                        {t}
                      </button>
                    ))}
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                    <a href={appLink("/register")} target="_blank" rel="noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-green-600/25 flex items-center justify-center gap-2">
                      <span>Open Fundakamental Workspace</span>
                      <ArrowRight className="h-5 w-5" />
                    </a>
                    <a href={appLink("/dashboard")} target="_blank" rel="noreferrer"
                      className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-200 font-semibold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                      Go to Dashboard
                    </a>
                  </motion.div>

                </motion.div>
              </div>

              {/* Right Column - Terminal Preview */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="hidden lg:block">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
                  
                  {/* Window Chrome Header */}
                  <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-rose-400" />
                      <span className="h-3 w-3 rounded-full bg-amber-400" />
                      <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                      <Lock className="h-3 w-3 text-emerald-500" /> fundakamental.in/research/{co.ticker}
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Terminal
                    </span>
                  </div>

                  {/* Terminal Content */}
                  <div className="p-6">
                    {/* Ticker Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-extrabold text-white shadow-md" style={{ background: co.color }}>{co.logo}</span>
                        <div>
                          <div className="text-base font-extrabold text-slate-900 dark:text-white">{co.name}</div>
                          <div className="text-xs text-slate-400 font-medium">{co.ticker} · {co.sector}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-white">₹{co.price}</div>
                        <div className={`inline-flex items-center gap-1 text-xs font-semibold ${co.up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {co.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {co.change > 0 ? "+" : ""}{co.change}%
                        </div>
                      </div>
                    </div>

                    {/* Tabs Bar */}
                    <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 mb-4 pb-2">
                      {["Overview", "Financials", "Valuation", "Quality"].map((t, i) => (
                        <span key={t} className={`text-xs font-semibold pb-1 cursor-pointer transition ${i === 0 ? "border-b-2 border-green-600 text-green-600 dark:text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-600 dark:text-slate-500"}`}>{t}</span>
                      ))}
                    </div>

                    {/* Metric Cards Grid */}
                    <div className="grid grid-cols-3 gap-2.5 mb-4">
                      {[["Market Cap", co.marketCap], ["P/E Ratio", co.valuation.pe], ["ROE", co.health.roe], ["ROCE", co.health.roce], ["5Y CAGR", co.growth.cagr], ["D/E Ratio", co.health.de]].map(([k, v]) => (
                        <div key={k} className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/40">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{k}</div>
                          <div className="mt-0.5 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Revenue & Profit Chart */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-950/40 mb-4">
                      <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        <span>Revenue &amp; Net Profit (₹'000 Cr)</span>
                        <span>FY21–FY25</span>
                      </div>
                      <TrendChart data={co.trend} color={co.color} />
                    </div>

                    {/* Quality Score Footer */}
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Quality Scorecard</span>
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-20 overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-900/50">
                          <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${co.scores.overall}%` }} />
                        </span>
                        <span className="font-mono text-sm font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">{co.scores.overall}/100</span>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ─────────── CORE FEATURES SECTION ─────────── */}
        <section className="py-16 px-6 md:px-12 lg:px-24 bg-white dark:bg-slate-900 border-y border-slate-200/60 dark:border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-sm font-semibold text-green-600 dark:text-emerald-400 uppercase tracking-wider">Features</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 mb-4">
                Everything You Need for Serious Stock Analysis
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg">
                Built specifically for Indian equity markets. Move faster from screening to high-conviction decisions.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Company Research',
                  description: 'Search listed businesses, review key metrics, and analyze financial health metrics in seconds.',
                  icon: <Search className="w-6 h-6 text-green-600 dark:text-emerald-400" />,
                },
                {
                  title: 'AI Report Builder',
                  description: 'Turn filings, annual reports, quarterly releases, and statements into structured insights automatically.',
                  icon: <BrainCircuit className="w-6 h-6 text-green-600 dark:text-emerald-400" />,
                },
                {
                  title: 'Watchlist Workflow',
                  description: 'Track companies, momentum signals, and target catalysts from one streamlined research loop.',
                  icon: <TrendingUp className="w-6 h-6 text-green-600 dark:text-emerald-400" />,
                },
              ].map((f) => (
                <div key={f.title} className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 hover:border-green-300 dark:hover:border-emerald-500 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">{f.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────── INTERACTIVE RESEARCH DASHBOARD ─────────── */}
        <div ref={dashRef} className="scroll-mt-20">
          <Reveal className="px-6 py-20 md:px-12 lg:px-24">
            <div className="mx-auto max-w-7xl">
              
              {/* Dashboard Header */}
              <motion.div variants={fadeUp} className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow-lg" style={{ background: co.color }}>{co.logo}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{co.name}</h2>
                      <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{co.ticker}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{co.industry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <div className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">₹{co.price}</div>
                    <div className={`text-sm font-semibold ${co.up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {co.change > 0 ? "+" : ""}{co.change}% today
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800/40">
                    <ShieldCheck className="h-4 w-4" /> Live Research Analysis
                  </span>
                </div>
              </motion.div>

              {/* Metric Cards Grid */}
              <div className="grid gap-6 lg:grid-cols-3">
                <SectionCard icon={Building2} title="Company Overview" className="lg:col-span-1">
                  <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{co.profile}</p>
                  <div className="space-y-3 text-sm">
                    {[
                      [Briefcase, "Market Cap", co.marketCap],
                      [Layers, "Sector", co.sector],
                      [Building2, "Industry", co.industry],
                      [User, "CEO", co.ceo],
                      [MapPin, "Headquarters", co.hq],
                    ].map(([Ic, k, v]) => (
                      <div key={k} className="flex items-center justify-between border-b border-slate-100 pb-2.5 last:border-0 dark:border-slate-800">
                        <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400"><Ic className="h-4 w-4" />{k}</span>
                        <span className="text-right font-semibold text-slate-900 dark:text-slate-100">{v}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <div className="space-y-6 lg:col-span-2">
                  <SectionCard icon={GaugeIcon} title="Financial Health">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      <Metric label="Rev Growth" value={co.health.revGrowth} accent={co.health.revGrowth.startsWith("-") ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"} />
                      <Metric label="Profit Growth" value={co.health.profitGrowth} accent="text-emerald-600 dark:text-emerald-400" />
                      <Metric label="ROE" value={co.health.roe} />
                      <Metric label="ROCE" value={co.health.roce} />
                      <Metric label="Debt / Equity" value={co.health.de} />
                    </div>
                  </SectionCard>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <SectionCard icon={Target} title="Valuation Metrics">
                      <div className="grid grid-cols-2 gap-3">
                        <Metric label="P/E Ratio" value={co.valuation.pe} />
                        <Metric label="P/B Ratio" value={co.valuation.pb} />
                        <Metric label="EV/EBITDA" value={co.valuation.evEbitda} />
                        <Metric label="Fair Value" value={`₹${co.valuation.fairValue}`} accent="text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </SectionCard>
                    <SectionCard icon={TrendingUp} title="Growth Metrics">
                      <div className="grid grid-cols-1 gap-3">
                        <Metric label="5Y Revenue CAGR" value={co.growth.cagr} accent="text-emerald-600 dark:text-emerald-400" />
                        <Metric label="Revenue Growth (YoY)" value={co.growth.revGrowth} />
                        <Metric label="EPS Growth (YoY)" value={co.growth.epsGrowth} />
                      </div>
                    </SectionCard>
                  </div>
                </div>
              </div>

              {/* Scorecard + Trend */}
              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <SectionCard icon={Trophy} title="AI Quality Scorecard">
                  <div className="flex flex-col items-center">
                    <ScoreRing value={co.scores.overall} label="Overall Business Quality" />
                    <div className="mt-6 w-full space-y-4">
                      <ScoreBar label="Growth" value={co.scores.growth} />
                      <ScoreBar label="Quality" value={co.scores.quality} />
                      <ScoreBar label="Valuation" value={co.scores.valuation} />
                      <ScoreBar label="Risk-adjusted" value={co.scores.risk} />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard icon={TrendingUp} title="Revenue & Profit Trend (₹'000 Cr)" className="lg:col-span-2">
                  <TrendChart data={co.trend} color={co.color} />
                  <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: co.color, opacity: 0.4 }} /> Revenue</span>
                    <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: co.color }} /> Net Profit</span>
                  </div>
                </SectionCard>
              </div>

            </div>
          </Reveal>
        </div>

        {/* ─────────── BOTTOM CALL TO ACTION ─────────── */}
        <section className="px-6 py-20 md:px-12 lg:px-24">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-green-700 via-emerald-800 to-green-900 p-12 text-center text-white shadow-2xl shadow-green-900/30 md:p-16">
            <div className="absolute -top-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-emerald-200 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-emerald-300" /> Professional Equity Research
              </div>
              <h2 className="text-3xl font-extrabold md:text-5xl tracking-tight mb-4">
                Institutional Research in Your Hands
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-emerald-100 leading-relaxed mb-8">
                Screen thousands of stocks, analyze financial statements, generate AI reports, and track your portfolio — all in one Fundakamental workspace.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href={appLink("/register")} target="_blank" rel="noreferrer"
                  className="bg-white text-green-800 hover:bg-emerald-50 font-bold px-8 py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                  <span>Start Free Analysis</span>
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a href={appLink("/dashboard")} target="_blank" rel="noreferrer"
                  className="bg-green-800/60 hover:bg-green-800 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl backdrop-blur-sm transition-all flex items-center justify-center gap-2">
                  Go to Dashboard
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
