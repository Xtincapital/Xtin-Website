import React from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaLock } from "react-icons/fa";
import ModuleBadge from "../../components/ModuleBadge";

// Custom SVG Icons
const Icons = {
  Portfolio: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2A10 10 0 0 1 22 12"/>
      <path d="M12 12L12 2"/>
      <path d="M12 12L19.07 4.93"/>
      <path d="M12 12L4.93 19.07"/>
    </svg>
  ),
  Clock: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><path d="M12 6V12L16 14"/>
    </svg>
  ),
  Warning: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 9V13M12 17H12.01"/><path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.54 21H20.46A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z"/>
    </svg>
  ),
  Target: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><path d="M8 12L11 15L16 9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  // Lesson Icons
  Foundation: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21H21"/><path d="M5 21V7L12 3L19 7V21"/><path d="M9 21V15H15V21"/>
    </svg>
  ),
  Chart: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3V21H21"/><path d="M7 14L12 9L16 13L21 8"/>
    </svg>
  ),
  Layers: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7L12 12L22 7L12 2Z"/><path d="M2 17L12 22L22 17"/><path d="M2 12L12 17L22 12"/>
    </svg>
  ),
  Compass: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" stroke="none"/>
    </svg>
  ),
  TrendUp: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 6L13.5 15.5L8.5 10.5L1 18"/><path d="M17 6H23V12"/>
    </svg>
  ),
  Cube: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8A2 2 0 0 0 19.5 6.26L12 2L4.5 6.26A2 2 0 0 0 3 8V16A2 2 0 0 0 4.5 17.74L12 22L19.5 17.74A2 2 0 0 0 21 16Z"/>
      <path d="M12 22V12"/><path d="M3 8L12 12L21 8"/>
    </svg>
  ),
  Sliders: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
      <circle cx="4" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="10" r="2" fill="currentColor"/><circle cx="20" cy="14" r="2" fill="currentColor"/>
    </svg>
  ),
  Network: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/>
      <path d="M12 8V12M5 16L10 10M19 16L14 10"/>
    </svg>
  ),
  Refresh: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 4V10H17"/><path d="M1 20V14H7"/><path d="M3.51 9A9 9 0 0 1 20.49 9L23 10M1 14L3.51 15A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  Receipt: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 2V22L7 20L10 22L12 20L14 22L17 20L20 22V2L17 4L14 2L12 4L10 2L7 4L4 2Z"/>
      <line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/>
    </svg>
  ),
  Activity: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
    </svg>
  ),
  Eye: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12S5 4 12 4 23 12 23 12 19 20 12 20 1 12 1 12Z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )
};

const PortfolioConstructionOverview = () => {
  const navigate = useNavigate();

  // Premium 12-lesson structure for advanced portfolio construction
  const lessons = [
    { 
      num: 1, 
      title: "Modern Portfolio Theory", 
      subtitle: "Markowitz & the efficient frontier",
      duration: "22 min", 
      available: true,
      icon: Icons.Foundation,
      color: "blue",
      description: "Understand the mathematical foundation that revolutionized investing. Learn expected returns, variance, and the efficient frontier."
    },
    { 
      num: 2, 
      title: "Risk & Return Deep Dive", 
      subtitle: "Variance, covariance & correlation",
      duration: "25 min", 
      available: true,
      icon: Icons.Chart,
      color: "indigo",
      description: "Master the statistical tools for measuring portfolio risk. Correlation matrices, diversification math, and risk decomposition."
    },
    { 
      num: 3, 
      title: "Asset Class Mastery", 
      subtitle: "Building blocks of portfolios",
      duration: "20 min", 
      available: true,
      icon: Icons.Layers,
      color: "violet",
      description: "Deep dive into equities, bonds, commodities, real estate, and alternatives. Understand their risk-return profiles and correlation patterns."
    },
    { 
      num: 4, 
      title: "Strategic Asset Allocation", 
      subtitle: "Long-term portfolio design",
      duration: "24 min", 
      available: true,
      icon: Icons.Compass,
      color: "purple",
      description: "Design portfolios based on goals, time horizon, and risk tolerance. Learn policy portfolios and investor profile mapping."
    },
    { 
      num: 5, 
      title: "Tactical Asset Allocation", 
      subtitle: "Dynamic portfolio adjustments",
      duration: "22 min", 
      available: true,
      icon: Icons.TrendUp,
      color: "fuchsia",
      description: "Learn when and how to deviate from strategic allocation. Valuation-based shifts, momentum signals, and market regime detection."
    },
    { 
      num: 6, 
      title: "Factor Investing", 
      subtitle: "Beyond traditional beta",
      duration: "28 min", 
      available: true,
      icon: Icons.Cube,
      color: "rose",
      description: "Explore value, momentum, quality, size, and low volatility factors. Build factor-tilted portfolios for enhanced returns."
    },
    { 
      num: 7, 
      title: "Portfolio Optimization", 
      subtitle: "From theory to practice",
      duration: "30 min", 
      available: true,
      icon: Icons.Sliders,
      color: "red",
      description: "Mean-variance optimization, Black-Litterman model, and risk parity. Handle estimation error and create robust portfolios."
    },
    { 
      num: 8, 
      title: "Diversification Mastery", 
      subtitle: "The only free lunch in finance",
      duration: "20 min", 
      available: true,
      icon: Icons.Network,
      color: "orange",
      description: "Beyond naive diversification. Correlation breakdown during crises, tail risk, concentration limits, and true diversification."
    },
    { 
      num: 9, 
      title: "Rebalancing Strategies", 
      subtitle: "Maintaining your edge",
      duration: "18 min", 
      available: true,
      icon: Icons.Refresh,
      color: "amber",
      description: "Calendar vs threshold rebalancing, transaction costs, tax implications, and optimal rebalancing bands."
    },
    { 
      num: 10, 
      title: "Tax-Efficient Investing", 
      subtitle: "Keep more of what you earn",
      duration: "25 min", 
      available: true,
      icon: Icons.Receipt,
      color: "yellow",
      description: "Asset location strategies, tax-loss harvesting, holding period optimization, and after-tax return maximization."
    },
    { 
      num: 11, 
      title: "Portfolio Stress Testing", 
      subtitle: "Preparing for the worst",
      duration: "22 min", 
      available: true,
      icon: Icons.Activity,
      color: "lime",
      description: "Historical scenario analysis, Monte Carlo simulations, drawdown analysis, and portfolio vulnerability assessment."
    },
    { 
      num: 12, 
      title: "Portfolio Monitoring", 
      subtitle: "Continuous improvement",
      duration: "20 min", 
      available: true,
      icon: Icons.Eye,
      color: "emerald",
      description: "Performance attribution, drift analysis, benchmark comparison, and systematic portfolio review process."
    },
  ];

  const colorClasses = {
    blue: { bg: "bg-gradient-to-br from-blue-500 to-blue-700", light: "bg-blue-50 border-blue-200  ", text: "text-blue-600 ", badge: "bg-blue-100 text-blue-700  " },
    indigo: { bg: "bg-gradient-to-br from-indigo-500 to-indigo-700", light: "bg-indigo-50 border-indigo-200  ", text: "text-indigo-600 ", badge: "bg-indigo-100 text-indigo-700  " },
    violet: { bg: "bg-gradient-to-br from-violet-500 to-violet-700", light: "bg-violet-50 border-violet-200  ", text: "text-violet-600 ", badge: "bg-violet-100 text-violet-700  " },
    purple: { bg: "bg-gradient-to-br from-purple-500 to-purple-700", light: "bg-purple-50 border-purple-200  ", text: "text-purple-600 ", badge: "bg-purple-100 text-purple-700  " },
    fuchsia: { bg: "bg-gradient-to-br from-fuchsia-500 to-fuchsia-700", light: "bg-fuchsia-50 border-fuchsia-200  ", text: "text-fuchsia-600 ", badge: "bg-fuchsia-100 text-fuchsia-700  " },
    rose: { bg: "bg-gradient-to-br from-rose-500 to-rose-700", light: "bg-rose-50 border-rose-200  ", text: "text-rose-600 ", badge: "bg-rose-100 text-rose-700  " },
    red: { bg: "bg-gradient-to-br from-red-500 to-red-700", light: "bg-red-50 border-red-200  ", text: "text-red-600 ", badge: "bg-red-100 text-red-700  " },
    orange: { bg: "bg-gradient-to-br from-orange-500 to-orange-700", light: "bg-orange-50 border-orange-200  ", text: "text-orange-600 ", badge: "bg-orange-100 text-orange-700  " },
    amber: { bg: "bg-gradient-to-br from-amber-500 to-amber-700", light: "bg-amber-50 border-amber-200  ", text: "text-amber-600 ", badge: "bg-amber-100 text-amber-700  " },
    yellow: { bg: "bg-gradient-to-br from-yellow-500 to-yellow-600", light: "bg-yellow-50 border-yellow-200  ", text: "text-yellow-600 ", badge: "bg-yellow-100 text-yellow-700  " },
    lime: { bg: "bg-gradient-to-br from-lime-500 to-lime-700", light: "bg-lime-50 border-lime-200  ", text: "text-lime-600 ", badge: "bg-lime-100 text-lime-700  " },
    emerald: { bg: "bg-gradient-to-br from-emerald-500 to-emerald-700", light: "bg-emerald-50 border-emerald-200  ", text: "text-emerald-600 ", badge: "bg-emerald-100 text-emerald-700  " },
  };

  const totalDuration = lessons.reduce((acc, l) => acc + parseInt(l.duration), 0);

  return (
    <div className="bg-gradient-to-b from-white to-blue-50/30   text-gray-900  min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-5xl mx-auto">
          
          {/* Breadcrumb */}
          <button onClick={() => navigate('/learn')} className="flex items-center gap-2 text-gray-500  hover:text-blue-600  transition-colors mb-8 group">
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" /><span>Back to Learn</span>
          </button>

          {/* Module Header */}
          <div className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-500/25">Advanced Module</span>
              <span className="px-3 py-1.5 bg-blue-100  text-blue-700  rounded-full text-sm flex items-center gap-1.5 font-medium">
                <Icons.Clock className="w-4 h-4" />12 Lessons
              </span>
              <span className="px-3 py-1.5 bg-gray-100  text-gray-600  rounded-full text-sm">~{totalDuration} min total</span>
              <span className="px-3 py-1.5 bg-amber-100  text-amber-700  rounded-full text-sm font-semibold flex items-center gap-1.5">
                <Icons.Warning className="w-4 h-4" />Requires Prerequisites
              </span>
            </div>
            <div className="mb-3"><ModuleBadge moduleId="portfolio-construction" /></div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900  mb-5 flex items-center gap-4">
              <span className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/30">
                <Icons.Portfolio className="w-9 h-9 text-white" />
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600   text-transparent bg-clip-text">
                Portfolio Construction
              </span>
            </h1>
            <p className="text-xl text-gray-600  max-w-3xl leading-relaxed">
              Build institutional-grade portfolios using Modern Portfolio Theory, factor investing, 
              and advanced optimization techniques. Learn to construct, maintain, and optimize portfolios 
              that achieve your goals while managing risk systematically.
            </p>
          </div>

          {/* Hero Visual - Portfolio Allocation SVG */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-8 mb-12 border border-blue-800/50 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <pattern id="grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
                <rect x="0" y="0" width="100" height="100" fill="url(#grid)" className="text-blue-400"/>
              </svg>
            </div>

            <svg className="w-full max-w-4xl mx-auto relative z-10" viewBox="0 0 800 400" fill="none">
              <defs>
                <linearGradient id="pcGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#6366f1"/>
                </linearGradient>
                <linearGradient id="pcGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#a855f7"/>
                </linearGradient>
                <linearGradient id="pcGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#10b981"/>
                </linearGradient>
                <linearGradient id="pcGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#f97316"/>
                </linearGradient>
              </defs>

              {/* Title */}
              <text x="400" y="35" textAnchor="middle" fill="#e0e7ff" fontSize="16" fontWeight="700">THE PORTFOLIO CONSTRUCTION FRAMEWORK</text>

              {/* Left: Efficient Frontier Chart */}
              <g transform="translate(30, 60)">
                <rect x="0" y="0" width="320" height="280" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
                <text x="160" y="25" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">EFFICIENT FRONTIER</text>
                
                {/* Axes */}
                <line x1="50" y1="240" x2="290" y2="240" stroke="#475569" strokeWidth="1"/>
                <line x1="50" y1="50" x2="50" y2="240" stroke="#475569" strokeWidth="1"/>
                <text x="170" y="265" textAnchor="middle" fill="#64748b" fontSize="9">Risk (Standard Deviation)</text>
                <text x="25" y="145" textAnchor="middle" fill="#64748b" fontSize="9" transform="rotate(-90, 25, 145)">Return</text>

                {/* Efficient Frontier Curve */}
                <path d="M60 200 Q100 180 130 140 Q160 100 200 80 Q240 65 280 55" stroke="url(#pcGrad1)" strokeWidth="3" fill="none"/>
                
                {/* Asset Points */}
                <circle cx="80" cy="190" r="8" fill="#ef4444"><title>Bonds</title></circle>
                <text x="80" y="210" textAnchor="middle" fill="#ef4444" fontSize="8">Bonds</text>
                
                <circle cx="160" cy="110" r="8" fill="#3b82f6"><title>Mixed</title></circle>
                <text x="160" y="130" textAnchor="middle" fill="#3b82f6" fontSize="8">Balanced</text>
                
                <circle cx="250" cy="70" r="8" fill="#22c55e"><title>Equities</title></circle>
                <text x="250" y="90" textAnchor="middle" fill="#22c55e" fontSize="8">Equities</text>

                {/* Optimal Portfolio Point */}
                <circle cx="180" cy="95" r="10" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2"/>
                <text x="180" y="75" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">Optimal</text>

                {/* Inefficient Region */}
                <circle cx="200" cy="160" r="6" fill="#64748b" opacity="0.5"/>
                <circle cx="140" cy="170" r="6" fill="#64748b" opacity="0.5"/>
                <circle cx="230" cy="150" r="6" fill="#64748b" opacity="0.5"/>
                <text x="185" y="185" textAnchor="middle" fill="#475569" fontSize="7">Inefficient</text>
              </g>

              {/* Right: Pie Chart + Components */}
              <g transform="translate(400, 60)">
                <rect x="0" y="0" width="370" height="280" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
                <text x="185" y="25" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">OPTIMAL ASSET ALLOCATION</text>

                {/* Pie Chart */}
                <g transform="translate(100, 150)">
                  {/* Equities - 50% */}
                  <path d="M0,0 L0,-80 A80,80 0 0,1 69.28,-40 Z" fill="url(#pcGrad1)"/>
                  <text x="25" y="-50" fill="white" fontSize="10" fontWeight="600">50%</text>
                  
                  {/* Bonds - 25% */}
                  <path d="M0,0 L69.28,-40 A80,80 0 0,1 80,0 Z" fill="url(#pcGrad2)"/>
                  <text x="60" y="-10" fill="white" fontSize="9">25%</text>
                  
                  {/* Real Estate - 15% */}
                  <path d="M0,0 L80,0 A80,80 0 0,1 40,69.28 Z" fill="url(#pcGrad3)"/>
                  <text x="50" y="35" fill="white" fontSize="9">15%</text>
                  
                  {/* Alternatives - 10% */}
                  <path d="M0,0 L40,69.28 A80,80 0 0,1 0,80 Z" fill="url(#pcGrad4)"/>
                  <text x="10" y="55" fill="white" fontSize="8">10%</text>
                  
                  {/* Remaining back to equities */}
                  <path d="M0,0 L0,80 A80,80 0 0,1 0,-80 Z" fill="#1e293b"/>
                </g>

                {/* Legend */}
                <g transform="translate(220, 70)">
                  <rect x="0" y="0" width="12" height="12" rx="2" fill="url(#pcGrad1)"/>
                  <text x="18" y="10" fill="#e0e7ff" fontSize="10">Equities (50%)</text>
                  
                  <rect x="0" y="25" width="12" height="12" rx="2" fill="url(#pcGrad2)"/>
                  <text x="18" y="35" fill="#e0e7ff" fontSize="10">Bonds (25%)</text>
                  
                  <rect x="0" y="50" width="12" height="12" rx="2" fill="url(#pcGrad3)"/>
                  <text x="18" y="60" fill="#e0e7ff" fontSize="10">Real Estate (15%)</text>
                  
                  <rect x="0" y="75" width="12" height="12" rx="2" fill="url(#pcGrad4)"/>
                  <text x="18" y="85" fill="#e0e7ff" fontSize="10">Alternatives (10%)</text>
                </g>

                {/* Key Metrics */}
                <g transform="translate(220, 180)">
                  <rect x="0" y="0" width="130" height="75" rx="8" fill="#0f172a" stroke="#334155"/>
                  <text x="65" y="18" textAnchor="middle" fill="#94a3b8" fontSize="8">PORTFOLIO METRICS</text>
                  <text x="10" y="35" fill="#64748b" fontSize="8">Exp. Return:</text>
                  <text x="120" y="35" textAnchor="end" fill="#22c55e" fontSize="9" fontWeight="600">9.2%</text>
                  <text x="10" y="50" fill="#64748b" fontSize="8">Volatility:</text>
                  <text x="120" y="50" textAnchor="end" fill="#f59e0b" fontSize="9" fontWeight="600">12.4%</text>
                  <text x="10" y="65" fill="#64748b" fontSize="8">Sharpe:</text>
                  <text x="120" y="65" textAnchor="end" fill="#3b82f6" fontSize="9" fontWeight="600">0.74</text>
                </g>
              </g>

              {/* Bottom: Process Flow */}
              <g transform="translate(30, 360)">
                <text x="385" y="0" textAnchor="middle" fill="#64748b" fontSize="10">Define Goals → Select Assets → Optimize Weights → Implement → Monitor → Rebalance</text>
              </g>
            </svg>
          </div>

          {/* What You'll Learn */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50   rounded-2xl p-8 mb-12 border border-blue-200 ">
            <h2 className="text-2xl font-bold text-gray-900  mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Icons.Target className="w-5 h-5 text-white"/>
              </span>
              What You'll Master
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Modern Portfolio Theory and the mathematics behind diversification",
                "Strategic and tactical asset allocation frameworks",
                "Factor investing: value, momentum, quality, and more",
                "Portfolio optimization beyond simple mean-variance",
                "Risk budgeting and parity approaches",
                "Tax-efficient investing and asset location",
                "Rebalancing strategies that balance costs and drift",
                "Stress testing and scenario analysis for robustness"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Icons.CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"/>
                  <span className="text-gray-700 ">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50   rounded-2xl p-6 mb-12 border border-amber-200 ">
            <h3 className="font-bold text-amber-800  mb-4 flex items-center gap-3">
              <Icons.Warning className="w-5 h-5"/>
              Prerequisites
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { module: "Stock Market Basics", path: "/learn/stock-market" },
                { module: "Risk Management", path: "/learn/risk-management" },
                { module: "Long-Term Investing", path: "/learn/long-term-investing" }
              ].map((prereq, i) => (
                <button key={i} onClick={() => navigate(prereq.path)}
                  className="flex items-center gap-2 px-4 py-3 bg-white  rounded-xl border border-amber-200  hover:border-amber-400 transition-colors text-sm font-medium text-amber-700 ">
                  <Icons.CheckCircle className="w-4 h-4"/>{prereq.module}
                </button>
              ))}
            </div>
          </div>

          {/* Lessons Grid */}
          <h2 className="text-2xl font-bold text-gray-900  mb-6">Course Content</h2>
          <div className="grid gap-4 mb-12">
            {lessons.map((lesson) => {
              const colors = colorClasses[lesson.color];
              const LessonIcon = lesson.icon;
              return (
                <div key={lesson.num}
                  onClick={() => lesson.available && navigate(`/learn/pc-lesson-${lesson.num}`)}
                  className={`group relative rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
                    ${lesson.available 
                      ? `${colors.light} hover:shadow-xl hover:scale-[1.01] hover:border-${lesson.color}-400` 
                      : 'bg-gray-50  border-gray-200  opacity-60 cursor-not-allowed'}`}
                >
                  <div className="flex items-center gap-4 p-5">
                    {/* Lesson Number & Icon */}
                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg
                      ${lesson.available ? colors.bg : 'bg-gray-400'}`}>
                      <LessonIcon className="w-7 h-7 text-white"/>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${lesson.available ? colors.badge : 'bg-gray-200 text-gray-500'}`}>
                          Lesson {lesson.num}
                        </span>
                        <span className="text-xs text-gray-500  flex items-center gap-1">
                          <Icons.Clock className="w-3 h-3"/>{lesson.duration}
                        </span>
                      </div>
                      <h3 className={`font-bold text-lg ${lesson.available ? 'text-gray-900 ' : 'text-gray-500'}`}>
                        {lesson.title}
                      </h3>
                      <p className={`text-sm ${lesson.available ? colors.text : 'text-gray-400'}`}>{lesson.subtitle}</p>
                      <p className="text-sm text-gray-600  mt-1 line-clamp-1">{lesson.description}</p>
                    </div>

                    {/* Arrow / Lock */}
                    <div className="flex-shrink-0">
                      {lesson.available ? (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:scale-110 ${colors.badge}`}>
                          <FaArrowRight className={`${colors.text}`}/>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200  flex items-center justify-center">
                          <FaLock className="text-gray-400"/>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Start Learning CTA */}
          <div className="text-center">
            <button onClick={() => navigate('/learn/pc-lesson-1')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all">
              Start Learning<FaArrowRight/>
            </button>
            <p className="text-sm text-gray-500  mt-4">Begin your journey to institutional-grade portfolio management</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioConstructionOverview;
