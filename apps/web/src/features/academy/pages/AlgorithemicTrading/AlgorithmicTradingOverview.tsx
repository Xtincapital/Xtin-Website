import React from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaLock, FaPlay } from "react-icons/fa";

// Premium SVG Icons for Algorithmic Trading Module
const Icons = {
  // Algorithm/Code Icon
  Algorithm: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 8L10 11L7 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Clock Icon
  Clock: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Book/Lesson Icon
  Book: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 6.04168C10.4467 4.75868 8.41833 4 6.21429 4C4.88558 4 3.62325 4.27778 2.5 4.77618V18.7762C3.62325 18.2778 4.88558 18 6.21429 18C8.41833 18 10.4467 18.7587 12 20.0417M12 6.04168C13.5533 4.75868 15.5817 4 17.7857 4C19.1144 4 20.3768 4.27778 21.5 4.77618V18.7762C20.3768 18.2778 19.1144 18 17.7857 18C15.5817 18 13.5533 18.7587 12 20.0417M12 6.04168V20.0417" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Target Icon
  Target: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  ),

  // CheckCircle Icon
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Foundation Icon
  Foundation: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 21V11L12 4L19 11V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="9" y="14" width="6" height="7" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Architecture Icon
  Architecture: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 6.5H14M6.5 10V14M17.5 10V14M10 17.5H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Strategy Icon
  Strategy: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="5" r="3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="5" cy="19" r="3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="19" cy="19" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 8V12M12 12L7 16M12 12L17 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Backtest Icon
  Backtest: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4V9H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.5 15C6.5 18 9.5 20 13 20C17.4183 20 21 16.4183 21 12C21 7.58172 17.4183 4 13 4C9.5 4 6.5 6 5.5 9L4 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M13 8V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Risk/Shield Icon
  RiskShield: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L20 7V11C20 15.4183 16.4183 19 12 21C7.58172 19 4 15.4183 4 11V7L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="15" r="1" fill="currentColor"/>
    </svg>
  ),

  // Execution Icon
  Execution: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Live/Monitoring Icon
  LiveMonitor: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 21H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 18V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 11L10 8L13 11L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="17" cy="7" r="1.5" fill="currentColor"/>
    </svg>
  ),

  // Warning/Advanced Icon
  Warning: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 9V13M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.64 1.55 19C1.55 19.36 1.64 19.7 1.82 20C2 20.3 2.26 20.56 2.56 20.73C2.86 20.91 3.21 21 3.56 21H20.44C20.79 21 21.14 20.91 21.44 20.73C21.74 20.56 22 20.3 22.18 20C22.36 19.7 22.45 19.36 22.45 19C22.45 18.64 22.36 18.3 22.18 18L13.71 3.86C13.53 3.56 13.27 3.32 12.97 3.15C12.67 2.98 12.34 2.89 12 2.89C11.66 2.89 11.33 2.98 11.03 3.15C10.73 3.32 10.47 3.56 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Rocket Icon
  Rocket: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 16.5C3 18 3 21 3 21C3 21 6 21 7.5 19.5C8.32 18.68 8.32 17.32 7.5 16.5C6.68 15.68 5.32 15.68 4.5 16.5Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M9.5 10L14 5.5C16.5 3 22 2 22 2C22 2 21 7.5 18.5 10L14 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 10C14 10 13 6 9.5 10C6 14 10 15 10 15C10 15 14 14 14 10Z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
};

const AlgorithmicTradingOverview = () => {
  const navigate = useNavigate();

  // Premium lesson structure - 9 comprehensive lessons
  const lessons = [
    { 
      num: 1, 
      title: "Foundations of Algorithmic Trading", 
      subtitle: "History, concepts & market impact",
      duration: "15 min", 
      available: true,
      icon: Icons.Foundation,
      color: "indigo",
      description: "Understand what algo trading really is, its evolution, and why institutions rely on it."
    },
    { 
      num: 2, 
      title: "Trading System Architecture", 
      subtitle: "Components & infrastructure",
      duration: "18 min", 
      available: true,
      icon: Icons.Architecture,
      color: "violet",
      description: "Deep dive into data feeds, execution engines, and how systems connect."
    },
    { 
      num: 3, 
      title: "Strategy Development Framework", 
      subtitle: "Design & conceptualization",
      duration: "20 min", 
      available: true,
      icon: Icons.Strategy,
      color: "purple",
      description: "Learn how to think about strategy design: momentum, mean reversion, and more."
    },
    { 
      num: 4, 
      title: "Backtesting & Optimization", 
      subtitle: "Testing without losing money",
      duration: "20 min", 
      available: true,
      icon: Icons.Backtest,
      color: "blue",
      description: "Avoid overfitting, understand walk-forward analysis, and test properly."
    },
    { 
      num: 5, 
      title: "Risk Management in Algo Trading", 
      subtitle: "Position sizing & drawdowns",
      duration: "18 min", 
      available: true,
      icon: Icons.RiskShield,
      color: "rose",
      description: "Master position sizing, correlation risks, and black swan protection."
    },
    { 
      num: 6, 
      title: "Execution & Order Types", 
      subtitle: "Market microstructure deep-dive",
      duration: "15 min", 
      available: true,
      icon: Icons.Execution,
      color: "amber",
      description: "Understand slippage, TWAP, VWAP, and professional execution methods."
    },
    { 
      num: 7, 
      title: "Live Trading & Monitoring", 
      subtitle: "Going live with confidence",
      duration: "15 min", 
      available: true,
      icon: Icons.LiveMonitor,
      color: "teal",
      description: "Deploy, monitor, alert systems, and continuous improvement strategies."
    },
    { 
      num: 8, 
      title: "Data Management & Sources", 
      subtitle: "The fuel for your algorithms",
      duration: "18 min", 
      available: true,
      icon: Icons.Architecture,
      color: "cyan",
      description: "Where to get data, how to clean it, storage solutions, and real-time feeds."
    },
    { 
      num: 9, 
      title: "Broker APIs & Integration", 
      subtitle: "Connecting to Indian markets",
      duration: "20 min", 
      available: true,
      icon: Icons.Execution,
      color: "emerald",
      description: "Connect to Zerodha, Upstox & other Indian brokers. API basics and order management."
    },
  ];

  const colorClasses = {
    indigo: {
      bg: "bg-gradient-to-br from-indigo-500 to-indigo-700",
      light: "bg-indigo-50 border-indigo-200  ",
      text: "text-indigo-600 ",
      badge: "bg-indigo-100 text-indigo-700  "
    },
    violet: {
      bg: "bg-gradient-to-br from-violet-500 to-violet-700",
      light: "bg-violet-50 border-violet-200  ",
      text: "text-violet-600 ",
      badge: "bg-violet-100 text-violet-700  "
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-500 to-purple-700",
      light: "bg-purple-50 border-purple-200  ",
      text: "text-purple-600 ",
      badge: "bg-purple-100 text-purple-700  "
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-500 to-blue-700",
      light: "bg-blue-50 border-blue-200  ",
      text: "text-blue-600 ",
      badge: "bg-blue-100 text-blue-700  "
    },
    rose: {
      bg: "bg-gradient-to-br from-rose-500 to-rose-700",
      light: "bg-rose-50 border-rose-200  ",
      text: "text-rose-600 ",
      badge: "bg-rose-100 text-rose-700  "
    },
    amber: {
      bg: "bg-gradient-to-br from-amber-500 to-amber-700",
      light: "bg-amber-50 border-amber-200  ",
      text: "text-amber-600 ",
      badge: "bg-amber-100 text-amber-700  "
    },
    teal: {
      bg: "bg-gradient-to-br from-teal-500 to-teal-700",
      light: "bg-teal-50 border-teal-200  ",
      text: "text-teal-600 ",
      badge: "bg-teal-100 text-teal-700  "
    },
    cyan: {
      bg: "bg-gradient-to-br from-cyan-500 to-cyan-700",
      light: "bg-cyan-50 border-cyan-200  ",
      text: "text-cyan-600 ",
      badge: "bg-cyan-100 text-cyan-700  "
    },
    emerald: {
      bg: "bg-gradient-to-br from-emerald-500 to-emerald-700",
      light: "bg-emerald-50 border-emerald-200  ",
      text: "text-emerald-600 ",
      badge: "bg-emerald-100 text-emerald-700  "
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-indigo-50/30   text-gray-900  min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-5xl mx-auto">
          
          {/* Breadcrumb */}
          <button 
            onClick={() => navigate('/learn')}
            className="flex items-center gap-2 text-gray-500  hover:text-indigo-600  transition-colors mb-8 group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span>Back to Learn</span>
          </button>

          {/* Module Header */}
          <div className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full text-sm font-bold shadow-lg shadow-indigo-500/25">
                Advanced Module
              </span>
              <span className="px-3 py-1.5 bg-indigo-100  text-indigo-700  rounded-full text-sm flex items-center gap-1.5 font-medium">
                <Icons.Clock className="w-4 h-4" />
                9 Lessons
              </span>
              <span className="px-3 py-1.5 bg-gray-100  text-gray-600  rounded-full text-sm">
                ~160 min total
              </span>
              <span className="px-3 py-1.5 bg-amber-100  text-amber-700  rounded-full text-sm font-semibold flex items-center gap-1.5">
                <Icons.Warning className="w-4 h-4" />
                Requires Prerequisites
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900  mb-5 flex items-center gap-4">
              <span className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-xl shadow-indigo-500/30">
                <Icons.Algorithm className="w-9 h-9 text-white" />
              </span>
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600   text-transparent bg-clip-text">
                Algorithmic Trading
              </span>
            </h1>
            <p className="text-xl text-gray-600  max-w-3xl leading-relaxed">
              Master the foundations of systematic trading. Learn how institutions think about automation, 
              strategy development, and risk management. Build the mental models that separate 
              professional traders from retail.
            </p>
          </div>

          {/* Hero Visual - Premium Trading System SVG */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 mb-12 border border-indigo-800/50 shadow-2xl overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <pattern id="grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
                <rect x="0" y="0" width="100" height="100" fill="url(#grid)" className="text-indigo-400"/>
              </svg>
            </div>

            <svg className="w-full max-w-3xl mx-auto relative z-10" viewBox="0 0 700 350" fill="none">
              <defs>
                <linearGradient id="algoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
                <linearGradient id="algoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e"/>
                  <stop offset="100%" stopColor="#10b981"/>
                </linearGradient>
                <linearGradient id="algoGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b"/>
                  <stop offset="100%" stopColor="#ef4444"/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Title */}
              <text x="350" y="30" textAnchor="middle" fill="#e0e7ff" fontSize="16" fontWeight="700" letterSpacing="1">
                ALGORITHMIC TRADING SYSTEM ARCHITECTURE
              </text>
              <text x="350" y="50" textAnchor="middle" fill="#94a3b8" fontSize="11">
                How Professional Trading Systems Process Information
              </text>

              {/* Data Sources Section */}
              <g transform="translate(30, 75)">
                <rect x="0" y="0" width="140" height="180" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
                <text x="70" y="25" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">DATA FEEDS</text>
                
                {/* Data Items */}
                <rect x="15" y="40" width="110" height="28" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="1"/>
                <circle cx="32" cy="54" r="8" fill="url(#algoGrad2)"/>
                <text x="50" y="58" fill="#e2e8f0" fontSize="9">Price Data</text>
                
                <rect x="15" y="75" width="110" height="28" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="1"/>
                <circle cx="32" cy="89" r="8" fill="url(#algoGrad1)"/>
                <text x="50" y="93" fill="#e2e8f0" fontSize="9">Order Book</text>
                
                <rect x="15" y="110" width="110" height="28" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="1"/>
                <circle cx="32" cy="124" r="8" fill="url(#algoGrad3)"/>
                <text x="50" y="128" fill="#e2e8f0" fontSize="9">News/Events</text>
                
                <rect x="15" y="145" width="110" height="28" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="1"/>
                <circle cx="32" cy="159" r="8" fill="#8b5cf6"/>
                <text x="50" y="163" fill="#e2e8f0" fontSize="9">Alt Data</text>
              </g>

              {/* Arrow 1 */}
              <g transform="translate(175, 160)">
                <path d="M0 5 L40 5" stroke="#6366f1" strokeWidth="2" strokeDasharray="4,2"/>
                <polygon points="38,0 48,5 38,10" fill="#6366f1"/>
              </g>

              {/* Processing Engine */}
              <g transform="translate(230, 75)">
                <rect x="0" y="0" width="200" height="180" rx="12" fill="url(#algoGrad1)" fillOpacity="0.15" stroke="#6366f1" strokeWidth="2"/>
                <text x="100" y="25" textAnchor="middle" fill="#c7d2fe" fontSize="12" fontWeight="700">TRADING ENGINE</text>
                
                {/* Strategy Layer */}
                <rect x="15" y="40" width="170" height="35" rx="8" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="1"/>
                <text x="100" y="55" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="600">Strategy Logic</text>
                <text x="100" y="68" textAnchor="middle" fill="#818cf8" fontSize="8">Entry / Exit Rules</text>
                
                {/* Signal Generator */}
                <rect x="15" y="82" width="80" height="40" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="1"/>
                <text x="55" y="100" textAnchor="middle" fill="#e2e8f0" fontSize="9" fontWeight="500">Signal</text>
                <text x="55" y="113" textAnchor="middle" fill="#94a3b8" fontSize="8">Generator</text>
                
                {/* Risk Engine */}
                <rect x="105" y="82" width="80" height="40" rx="6" fill="#0f172a" stroke="#ef4444" strokeWidth="1"/>
                <text x="145" y="100" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="500">Risk</text>
                <text x="145" y="113" textAnchor="middle" fill="#f87171" fontSize="8">Manager</text>
                
                {/* Order Manager */}
                <rect x="15" y="130" width="170" height="35" rx="8" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="1"/>
                <text x="100" y="145" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="600">Order Management</text>
                <text x="100" y="158" textAnchor="middle" fill="#818cf8" fontSize="8">Position Sizing / Execution</text>
              </g>

              {/* Arrow 2 */}
              <g transform="translate(435, 160)">
                <path d="M0 5 L40 5" stroke="#6366f1" strokeWidth="2" strokeDasharray="4,2"/>
                <polygon points="38,0 48,5 38,10" fill="#6366f1"/>
              </g>

              {/* Execution Section */}
              <g transform="translate(490, 75)">
                <rect x="0" y="0" width="140" height="180" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
                <text x="70" y="25" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">EXECUTION</text>
                
                {/* Order Types */}
                <rect x="15" y="40" width="110" height="28" rx="6" fill="#0f172a" stroke="#22c55e" strokeWidth="1"/>
                <text x="70" y="58" textAnchor="middle" fill="#86efac" fontSize="9">Market Orders</text>
                
                <rect x="15" y="75" width="110" height="28" rx="6" fill="#0f172a" stroke="#22c55e" strokeWidth="1"/>
                <text x="70" y="93" textAnchor="middle" fill="#86efac" fontSize="9">Limit Orders</text>
                
                <rect x="15" y="110" width="110" height="28" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="1"/>
                <text x="70" y="128" textAnchor="middle" fill="#fcd34d" fontSize="9">TWAP / VWAP</text>
                
                <rect x="15" y="145" width="110" height="28" rx="6" fill="#0f172a" stroke="#ef4444" strokeWidth="1"/>
                <text x="70" y="163" textAnchor="middle" fill="#fca5a5" fontSize="9">Stop Loss</text>
              </g>

              {/* Bottom Feedback Loop */}
              <g transform="translate(100, 280)">
                <rect x="0" y="0" width="500" height="50" rx="10" fill="#0f172a" stroke="#475569" strokeWidth="1"/>
                <text x="250" y="20" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">MONITORING & FEEDBACK LOOP</text>
                <text x="250" y="38" textAnchor="middle" fill="#64748b" fontSize="9">
                  P&L Tracking | Performance Analytics | Risk Alerts | System Health
                </text>
                
                {/* Feedback Arrows */}
                <path d="M-30 -20 L-30 25 L0 25" stroke="#475569" strokeWidth="1.5" fill="none" strokeDasharray="3,2"/>
                <path d="M530 25 L560 25 L560 -205 L500 -205" stroke="#475569" strokeWidth="1.5" fill="none" strokeDasharray="3,2"/>
              </g>

              {/* Legend */}
              <g transform="translate(250, 340)">
                <circle cx="0" cy="0" r="4" fill="url(#algoGrad2)"/>
                <text x="10" y="4" fill="#94a3b8" fontSize="8">Input</text>
                
                <circle cx="60" cy="0" r="4" fill="url(#algoGrad1)"/>
                <text x="70" y="4" fill="#94a3b8" fontSize="8">Processing</text>
                
                <circle cx="140" cy="0" r="4" fill="url(#algoGrad3)"/>
                <text x="150" y="4" fill="#94a3b8" fontSize="8">Output</text>
              </g>
            </svg>
          </div>

          {/* What You'll Learn Section */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50   rounded-3xl p-8 mb-12 border border-indigo-200  shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900  mb-6 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-md">
                <Icons.Target className="w-5 h-5 text-white" />
              </span>
              What You'll Master
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Build mental models for systematic trading",
                "Understand trading system architecture",
                "Design and evaluate trading strategies",
                "Implement proper backtesting methodology",
                "Apply professional risk management",
                "Navigate execution complexity",
                "Deploy and monitor live systems",
                "Think like institutional traders"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 text-gray-700 ">
                  <span className="text-indigo-500 mt-0.5 flex-shrink-0">
                    <Icons.CheckCircle className="w-5 h-5" />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prerequisites Warning */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50   rounded-2xl p-6 mb-12 border border-amber-200 ">
            <h3 className="font-bold text-amber-800  mb-3 flex items-center gap-2">
              <Icons.Warning className="w-5 h-5" />
              Prerequisites Recommended
            </h3>
            <p className="text-amber-700  text-sm leading-relaxed">
              This is an <strong>advanced module</strong>. For the best learning experience, we recommend completing 
              <span className="font-semibold"> Stock Market Basics</span>, <span className="font-semibold">Trading Basics</span>, 
              and <span className="font-semibold">Technical Analysis</span> first. Some programming knowledge is helpful 
              but not required — we focus on concepts, not code.
            </p>
          </div>

          {/* Lessons Grid */}
          <h2 className="text-2xl font-bold text-gray-900  mb-6">Module Curriculum</h2>
          <div className="space-y-4 mb-12">
            {lessons.map((lesson) => {
              const colors = colorClasses[lesson.color];
              const IconComponent = lesson.icon;
              
              return (
                <div
                  key={lesson.num}
                  onClick={() => lesson.available && navigate(`/learn/algo-trading-lesson-${lesson.num}`)}
                  className={`group relative rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                    lesson.available
                      ? `${colors.light} cursor-pointer hover:shadow-xl hover:scale-[1.01] hover:border-indigo-400`
                      : 'bg-gray-50 border-gray-200 opacity-70'
                  }`}
                >
                  <div className="p-6 flex items-center gap-5">
                    {/* Lesson Number */}
                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                      lesson.available ? colors.bg : 'bg-gray-300 '
                    }`}>
                      {lesson.available ? (
                        <IconComponent className="w-7 h-7 text-white" />
                      ) : (
                        <FaLock className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                          Lesson {lesson.num}
                        </span>
                        <span className="text-gray-400 ">•</span>
                        <span className="text-xs text-gray-500  flex items-center gap-1">
                          <Icons.Clock className="w-3 h-3" />
                          {lesson.duration}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900  mb-1 group-hover:text-indigo-600  transition-colors">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-gray-500  mb-2">{lesson.subtitle}</p>
                      <p className="text-sm text-gray-600  hidden md:block">{lesson.description}</p>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      {lesson.available ? (
                        <div className="w-10 h-10 rounded-full bg-indigo-100  flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                          <FaPlay className="w-3 h-3 text-indigo-600  group-hover:text-white transition-colors ml-0.5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200  flex items-center justify-center">
                          <FaLock className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-center shadow-2xl shadow-indigo-500/20">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Think Like an Institution?
            </h2>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Start your journey into systematic trading. Learn the frameworks and mental models 
              that separate professional traders from retail participants.
            </p>
            <button 
              onClick={() => navigate('/learn/algo-trading-lesson-1')}
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <FaPlay className="w-4 h-4" />
              Start Lesson 1
              <FaArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AlgorithmicTradingOverview;
