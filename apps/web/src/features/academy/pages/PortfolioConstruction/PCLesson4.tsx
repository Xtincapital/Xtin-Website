import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";

const Icons = {
  ArrowLeft: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  ),
  ArrowRight: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  Clock: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  ),
  Target: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Lightbulb: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18h6M10 22h4M12 2v1M4.22 4.22l.71.71M1 12h1M4.22 19.78l.71-.71M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
    </svg>
  ),
  PieChart: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  ),
  User: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Calendar: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  TrendingUp: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Shield: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  RefreshCw: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  XCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
    </svg>
  ),
  // Lifecycle Allocation Glide Path
  GlidePath: ({ className = "w-full h-56" }) => (
    <svg className={className} viewBox="0 0 400 250" fill="none">
      <defs>
        <linearGradient id="stockGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5A77AA" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#5A77AA" stopOpacity="0.2"/>
        </linearGradient>
        <linearGradient id="bondGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#16A34A" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#16A34A" stopOpacity="0.2"/>
        </linearGradient>
      </defs>
      {/* Axes */}
      <line x1="50" y1="200" x2="370" y2="200" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <line x1="50" y1="200" x2="50" y2="30" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <text x="210" y="230" fill="currentColor" opacity="0.6" fontSize="13" textAnchor="middle">Age →</text>
      <text x="20" y="120" fill="currentColor" opacity="0.6" fontSize="13" textAnchor="middle" transform="rotate(-90 20 120)">Allocation %</text>
      {/* Stock allocation (decreasing) */}
      <path d="M 50 50 L 130 70 L 210 100 L 290 140 L 370 180" stroke="#5A77AA" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M 50 50 L 130 70 L 210 100 L 290 140 L 370 180 L 370 200 L 50 200 Z" fill="url(#stockGrad)"/>
      {/* Bond allocation (increasing) */}
      <path d="M 50 200 L 130 190 L 210 170 L 290 140 L 370 100" stroke="#16A34A" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M 50 200 L 130 190 L 210 170 L 290 140 L 370 100 L 370 200 Z" fill="url(#bondGrad)"/>
      {/* Age markers */}
      {[{x:50,a:'25'},{x:130,a:'35'},{x:210,a:'45'},{x:290,a:'55'},{x:370,a:'65'}].map((m, i) => (
        <g key={i}>
          <line x1={m.x} y1="200" x2={m.x} y2="205" stroke="currentColor" opacity="0.5" strokeWidth="2"/>
          <text x={m.x} y="220" fill="currentColor" opacity="0.6" fontSize="12" textAnchor="middle">{m.a}</text>
        </g>
      ))}
      {/* Labels */}
      <text x="80" y="70" fill="#5A77AA" fontSize="13" fontWeight="bold">Stocks</text>
      <text x="340" y="115" fill="#16A34A" fontSize="13" fontWeight="bold">Bonds</text>
      <text x="200" y="25" fill="currentColor" opacity="0.7" fontSize="14" fontWeight="bold" textAnchor="middle">Target-Date Glide Path</text>
    </svg>
  )
};

const PCLesson4 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const quizQuestions = [
    {
      id: 1,
      question: "Strategic Asset Allocation (SAA) is primarily based on:",
      options: [
        "Short-term market predictions",
        "Long-term capital market assumptions and investor goals",
        "Recent stock performance",
        "Daily market movements"
      ],
      correct: 1,
      explanation: "SAA establishes long-term target allocations based on expected returns, risks, and correlations over extended periods (5-30+ years), aligned with investor objectives and constraints."
    },
    {
      id: 2,
      question: "Why should a younger investor typically hold more stocks than an older investor?",
      options: [
        "Stocks are always safer for young people",
        "Younger investors have longer time horizons to recover from market declines",
        "Older investors don't understand stocks",
        "Bonds don't pay interest to young people"
      ],
      correct: 1,
      explanation: "With decades until retirement, younger investors can weather short-term volatility in pursuit of higher long-term returns. Their human capital (future earnings) also acts as a bond-like asset."
    },
    {
      id: 3,
      question: "The primary purpose of portfolio rebalancing is to:",
      options: [
        "Maximize returns at all costs",
        "Eliminate all portfolio risk",
        "Maintain target risk levels and enforce discipline",
        "Time the market perfectly"
      ],
      correct: 2,
      explanation: "Rebalancing keeps the portfolio aligned with its strategic allocation, preventing risk drift and systematically selling winners and buying losers (buy low, sell high discipline)."
    },
    {
      id: 4,
      question: "A 'glide path' in lifecycle investing refers to:",
      options: [
        "The path stocks take during a crash",
        "The gradual shift from aggressive to conservative allocation over time",
        "The fastest way to grow wealth",
        "A trading strategy"
      ],
      correct: 1,
      explanation: "Target-date funds use glide paths to automatically reduce equity exposure as investors age, shifting from growth-oriented to capital-preservation focus approaching retirement."
    }
  ];

  const handleQuizAnswer = (qId, aIdx) => {
    if (!showResults) {
      setQuizAnswers(prev => ({ ...prev, [qId]: aIdx }));
    }
  };

  const calculateScore = () => quizQuestions.filter(q => quizAnswers[q.id] === q.correct).length;

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-indigo-50/30    text-gray-900  min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          <button onClick={() => navigate('/learn/portfolio-construction')} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600  transition-colors mb-8 group">
            <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
            <span className="text-sm font-medium">Back to Portfolio Construction</span>
          </button>

          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-sm bg-brand-fill">LESSON 4 OF 12</span>
              <span className="px-3 py-1.5 bg-indigo-100  text-indigo-700  rounded-full text-xs font-medium flex items-center gap-1.5">
                <Icons.Clock className="w-3.5 h-3.5"/>40 min read
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent mb-5 leading-tight tracking-[-0.025em] brand-on-dark">Strategic Asset Allocation</h1>
            <p className="text-xl text-gray-600  leading-relaxed max-w-3xl">Learn how to set long-term portfolio targets based on your goals, time horizon, and risk tolerance. Master the framework that drives 90%+ of portfolio return variation.</p>
          </header>

          <div className="space-y-12">
            
            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20 bg-brand-fill">
                    <Icons.PieChart className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">What is Strategic Asset Allocation?</h2>
                    <p className="text-sm text-gray-500 ">The foundation of your investment policy</p>
                  </div>
                </div>
                
                <p className="text-gray-700  leading-relaxed mb-6">Strategic Asset Allocation (SAA) establishes your long-term target mix of asset classes based on your goals, time horizon, and risk tolerance. Research shows that <strong className="text-gray-900 ">SAA explains over 90% of the variation in portfolio returns over time</strong>.</p>
                
                <div className="rounded-xl p-8 mb-6 bg-brand-fill">
                  <h4 className="text-white font-semibold mb-4 text-center">SAA vs. Security Selection</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-lg p-5 text-center">
                      <div className="text-indigo-400 text-3xl font-bold mb-2">~90%</div>
                      <div className="text-white font-medium">Asset Allocation</div>
                      <p className="text-gray-400 text-sm mt-2">Stocks vs. Bonds vs. Real Assets</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-5 text-center">
                      <div className="text-violet-400 text-3xl font-bold mb-2">~10%</div>
                      <div className="text-white font-medium">Security Selection</div>
                      <p className="text-gray-400 text-sm mt-2">Which specific stocks/funds</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-xl p-6 border-l-4 border-amber-400">
                  <div className="flex items-start gap-3">
                    <Icons.Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <h4 className="font-bold text-gray-900  mb-2">Key Insight</h4>
                      <p className="text-gray-700  text-sm leading-relaxed">Don't obsess over picking the "best" ETF or stock. Your decision to be 60% stocks vs. 80% stocks matters far more than choosing between similar index funds.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 bg-brand-fill">
                    <Icons.User className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Determining Your Risk Tolerance</h2>
                    <p className="text-sm text-gray-500 ">Know yourself before building your portfolio</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">Risk tolerance has two components: <strong className="text-gray-900 ">risk capacity</strong> (how much risk you can afford to take) and <strong className="text-gray-900 ">risk attitude</strong> (how much risk you're comfortable with emotionally).</p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-indigo-50  rounded-xl p-6 border border-indigo-200 ">
                    <h4 className="font-bold text-indigo-800  mb-3">Risk Capacity Factors</h4>
                    <ul className="text-sm space-y-2">
                      {["Time horizon (years to goal)", "Income stability", "Wealth relative to goals", "Liquidity needs", "Other income sources"].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700 ">
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"/>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-violet-50  rounded-xl p-6 border border-violet-200 ">
                    <h4 className="font-bold text-violet-800  mb-3">Risk Attitude Factors</h4>
                    <ul className="text-sm space-y-2">
                      {["Past investment experience", "Reaction to volatility", "Sleep-at-night test", "Financial knowledge", "Behavioral tendencies"].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700 ">
                          <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"/>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50  rounded-xl p-6">
                  <h4 className="font-bold text-gray-900  mb-4">Risk Tolerance Spectrum</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="w-24 text-sm font-medium text-brand ">Conservative</span>
                      <div className="flex-1 h-3 bg-gray-200  rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-brand-fill" style={{width: '30%'}}/>
                      </div>
                      <span className="text-sm text-gray-600 ">20-40% Stocks</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-24 text-sm font-medium text-blue-600 ">Moderate</span>
                      <div className="flex-1 h-3 bg-gray-200  rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-brand-fill" style={{width: '60%'}}/>
                      </div>
                      <span className="text-sm text-gray-600 ">50-70% Stocks</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-24 text-sm font-medium text-rose-600 ">Aggressive</span>
                      <div className="flex-1 h-3 bg-gray-200  rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full" style={{width: '90%'}}/>
                      </div>
                      <span className="text-sm text-gray-600 ">80-100% Stocks</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 bg-brand-fill">
                    <Icons.Target className="w-7 h-7 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Lifecycle Asset Allocation</h2>
                    <p className="text-sm text-gray-500 ">Age-based portfolio strategies</p>
                  </div>
                </div>
                
                {/* Visual: Lifecycle Glide Path */}
                <div className="bg-gradient-to-br from-gray-900 to-purple-950 rounded-2xl p-8 mb-6 shadow-lg brand-on-dark">
                  <h4 className="text-white font-bold mb-4 text-center">Visual: Target-Date Asset Allocation</h4>
                  <Icons.GlidePath className="w-full h-56"/>
                  <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-gray-300">Stocks (Higher Risk/Return)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-brand-fill"></div>
                      <span className="text-gray-300">Bonds (Lower Risk/Return)</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700  leading-relaxed mb-6">Strategic asset allocation adapts to your life stage. As you age and approach retirement, gradually reducing equity exposure helps protect accumulated wealth from market volatility.</p>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-orange-50  rounded-xl p-5 border border-orange-200 ">
                    <h4 className="font-bold text-orange-800  mb-3">Age 25-35</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 ">Indian Equity</span>
                        <span className="font-medium text-gray-900 ">50%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 ">International</span>
                        <span className="font-medium text-gray-900 ">20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 ">Debt Funds</span>
                        <span className="font-medium text-gray-900 ">20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 ">Gold</span>
                        <span className="font-medium text-gray-900 ">10%</span>
                      </div>
                    </div>
                    <p className="text-xs text-orange-600  mt-3">Aggressive growth phase</p>
                  </div>
                  <div className="bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                    <h4 className="font-bold text-brand  mb-3">Age 40-50</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 ">Indian Equity</span>
                        <span className="font-medium text-gray-900 ">40%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 ">International</span>
                        <span className="font-medium text-gray-900 ">15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 ">Debt Funds</span>
                        <span className="font-medium text-gray-900 ">30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 ">Gold + REITs</span>
                        <span className="font-medium text-gray-900 ">15%</span>
                      </div>
                    </div>
                    <p className="text-xs text-brand  mt-3">Balanced accumulation</p>
                  </div>
                  <div className="bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                    <h4 className="font-bold text-blue-800  mb-3">Age 55+</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 ">Indian Equity</span>
                        <span className="font-medium text-gray-900 ">25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 ">International</span>
                        <span className="font-medium text-gray-900 ">10%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 ">Debt + FDs</span>
                        <span className="font-medium text-gray-900 ">50%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 ">Gold</span>
                        <span className="font-medium text-gray-900 ">15%</span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600  mt-3">Capital preservation</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-green-50   rounded-xl p-6 border-l-4 border-orange-500">
                  <h4 className="font-bold text-gray-900  mb-2">NPS & Tax-Saving Allocations</h4>
                  <p className="text-gray-700  text-sm leading-relaxed mb-2">National Pension System (NPS) and ELSS funds offer tax benefits under Section 80C/80CCD(1B). Allocate these within your equity/debt targets. NPS Tier-I is long-term (locked till 60), while ELSS has 3-year lock-in.</p>
                  <p className="text-gray-600  text-xs">Don't let tax tail wag investment dog - ensure NPS/ELSS fit your overall SAA before investing for tax savings.</p>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20 bg-brand-fill">
                    <Icons.Calendar className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Lifecycle Investing</h2>
                    <p className="text-sm text-gray-500 ">Age-appropriate asset allocation</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">Your optimal allocation changes over time. Young investors with decades ahead can afford more risk; those near retirement need capital preservation. This concept drives the "glide path" of target-date funds.</p>

                <div className="rounded-xl p-6 mb-6 bg-brand-fill">
                  <h4 className="text-white font-semibold mb-4 text-center">Typical Glide Path</h4>
                  <div className="space-y-4">
                    {[
                      { age: "25-35", stocks: 90, label: "Accumulation Phase" },
                      { age: "35-45", stocks: 80, label: "Growth Phase" },
                      { age: "45-55", stocks: 70, label: "Transition Phase" },
                      { age: "55-65", stocks: 55, label: "Pre-Retirement" },
                      { age: "65+", stocks: 40, label: "Retirement" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="w-16 text-gray-400 text-sm">{item.age}</span>
                        <div className="flex-1 h-6 bg-gray-700 rounded-full overflow-hidden flex">
                          <div className="h-full bg-brand-fill" style={{width: `${item.stocks}%`}}/>
                          <div className="h-full flex-1 bg-brand-fill"/>
                        </div>
                        <span className="w-24 text-right text-gray-300 text-sm">{item.stocks}% Stocks</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-6 mt-4 text-sm">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-brand-fill rounded"/>Stocks</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-400 rounded"/>Bonds</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                    <h4 className="font-bold text-brand  mb-2">Human Capital</h4>
                    <p className="text-sm text-gray-600 ">Young people's future earnings act like a bond—stable and predictable. This allows financial portfolio to be more aggressive.</p>
                  </div>
                  <div className="bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                    <h4 className="font-bold text-blue-800  mb-2">Sequence Risk</h4>
                    <p className="text-sm text-gray-600 ">Poor returns early in retirement can devastate a portfolio. Reducing equity exposure protects against this timing risk.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20 bg-brand-fill">
                    <Icons.Target className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Sample Strategic Allocations</h2>
                    <p className="text-sm text-gray-500 ">Model portfolios by risk level</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50  rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900 ">Conservative Portfolio</h4>
                      <span className="px-3 py-1 bg-brand-soft  text-brand  rounded-full text-sm">Low Risk</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-center text-sm">
                      <div className="bg-blue-100  rounded-lg p-3"><div className="font-bold text-blue-700 ">50%</div><div className="text-gray-600 ">Bonds</div></div>
                      <div className="bg-brand-soft  rounded-lg p-3"><div className="font-bold text-brand ">25%</div><div className="text-gray-600 ">US Stocks</div></div>
                      <div className="bg-purple-100  rounded-lg p-3"><div className="font-bold text-purple-700 ">15%</div><div className="text-gray-600 ">Int'l Stocks</div></div>
                      <div className="bg-amber-100  rounded-lg p-3"><div className="font-bold text-amber-700 ">10%</div><div className="text-gray-600 ">Real Assets</div></div>
                    </div>
                  </div>

                  <div className="bg-gray-50  rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900 ">Balanced Portfolio</h4>
                      <span className="px-3 py-1 bg-blue-100  text-blue-700  rounded-full text-sm">Moderate Risk</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-center text-sm">
                      <div className="bg-brand-soft  rounded-lg p-3"><div className="font-bold text-brand ">40%</div><div className="text-gray-600 ">US Stocks</div></div>
                      <div className="bg-blue-100  rounded-lg p-3"><div className="font-bold text-blue-700 ">30%</div><div className="text-gray-600 ">Bonds</div></div>
                      <div className="bg-purple-100  rounded-lg p-3"><div className="font-bold text-purple-700 ">20%</div><div className="text-gray-600 ">Int'l Stocks</div></div>
                      <div className="bg-amber-100  rounded-lg p-3"><div className="font-bold text-amber-700 ">10%</div><div className="text-gray-600 ">Alternatives</div></div>
                    </div>
                  </div>

                  <div className="bg-gray-50  rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900 ">Aggressive Portfolio</h4>
                      <span className="px-3 py-1 bg-rose-100  text-rose-700  rounded-full text-sm">High Risk</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-center text-sm">
                      <div className="bg-brand-soft  rounded-lg p-3"><div className="font-bold text-brand ">55%</div><div className="text-gray-600 ">US Stocks</div></div>
                      <div className="bg-purple-100  rounded-lg p-3"><div className="font-bold text-purple-700 ">25%</div><div className="text-gray-600 ">Int'l Stocks</div></div>
                      <div className="bg-amber-100  rounded-lg p-3"><div className="font-bold text-amber-700 ">10%</div><div className="text-gray-600 ">EM Stocks</div></div>
                      <div className="bg-blue-100  rounded-lg p-3"><div className="font-bold text-blue-700 ">10%</div><div className="text-gray-600 ">Bonds</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20 bg-brand-fill">
                    <Icons.RefreshCw className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Rebalancing Strategies</h2>
                    <p className="text-sm text-gray-500 ">Maintaining your target allocation</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">As markets move, your actual allocation drifts from targets. Rebalancing restores your intended risk level and systematically "buys low, sells high."</p>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-cyan-50  rounded-xl p-5 border border-cyan-200 ">
                    <h4 className="font-bold text-cyan-800  mb-2">Calendar</h4>
                    <p className="text-sm text-gray-600  mb-2">Rebalance on fixed schedule (quarterly, annually).</p>
                    <div className="text-xs text-cyan-600 ">Simple, predictable, low effort</div>
                  </div>
                  <div className="bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                    <h4 className="font-bold text-blue-800  mb-2">Threshold</h4>
                    <p className="text-sm text-gray-600  mb-2">Rebalance when allocation drifts 5%+ from target.</p>
                    <div className="text-xs text-blue-600 ">More responsive to market moves</div>
                  </div>
                  <div className="bg-indigo-50  rounded-xl p-5 border border-indigo-200 ">
                    <h4 className="font-bold text-indigo-800  mb-2">Hybrid</h4>
                    <p className="text-sm text-gray-600  mb-2">Check calendar + rebalance if threshold exceeded.</p>
                    <div className="text-xs text-indigo-600 ">Best of both approaches</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-xl p-6 border-l-4 border-amber-400">
                  <div className="flex items-start gap-3">
                    <Icons.Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <h4 className="font-bold text-gray-900  mb-2">Tax-Efficient Rebalancing</h4>
                      <p className="text-gray-700  text-sm leading-relaxed">In taxable accounts, rebalance using new contributions, dividends, or by adjusting in tax-advantaged accounts first. Selling winners triggers capital gains taxes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-8">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20 bg-brand-fill">
                    <Icons.CheckCircle className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Knowledge Check</h2>
                    <p className="text-sm text-gray-500 ">Test your understanding of strategic allocation</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {quizQuestions.map((q, qIdx) => (
                    <div key={q.id} className="bg-gray-50  rounded-xl p-6">
                      <p className="font-semibold text-gray-900  mb-4 text-lg">{qIdx + 1}. {q.question}</p>
                      <div className="space-y-3">
                        {q.options.map((option, oIdx) => {
                          const isSelected = quizAnswers[q.id] === oIdx;
                          const isCorrect = q.correct === oIdx;
                          const showCorrect = showResults && isCorrect;
                          const showWrong = showResults && isSelected && !isCorrect;
                          
                          return (
                            <button key={oIdx} onClick={() => handleQuizAnswer(q.id, oIdx)} disabled={showResults}
                              className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4
                                ${showCorrect ? 'border-brand bg-brand-soft ' : ''}
                                ${showWrong ? 'border-red-500 bg-red-50 ' : ''}
                                ${isSelected && !showResults ? 'border-indigo-500 bg-indigo-50 ' : ''}
                                ${!isSelected && !showResults ? 'border-gray-200  hover:border-gray-300 ' : ''}
                                ${showResults ? 'cursor-default' : 'cursor-pointer'}`}>
                              <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300  text-gray-500'}`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="flex-1 text-gray-700 ">{option}</span>
                              {showResults && isCorrect && <Icons.CheckCircle className="w-6 h-6 text-brand"/>}
                              {showResults && isSelected && !isCorrect && <Icons.XCircle className="w-6 h-6 text-red-500"/>}
                            </button>
                          );
                        })}
                      </div>
                      {showResults && (
                        <div className="mt-4 p-4 bg-indigo-50  rounded-lg border border-indigo-200 ">
                          <p className="text-sm text-indigo-800 "><strong>Explanation:</strong> {q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!showResults ? (
                  <button onClick={() => setShowResults(true)} disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                    className="mt-8 w-full py-4 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-brand-fill">
                    Check Answers
                  </button>
                ) : (
                  <div className="mt-8 p-6 rounded-xl text-center bg-brand-fill">
                    <p className="text-3xl font-bold text-white mb-2">{calculateScore()} / {quizQuestions.length}</p>
                    <p className="text-indigo-100">{calculateScore() === quizQuestions.length ? "Excellent! You've mastered strategic asset allocation." : "Review the explanations to strengthen your understanding."}</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/pc-lesson-3')} className="flex items-center gap-2 px-6 py-3 bg-gray-100  text-gray-700  rounded-xl font-medium hover:bg-gray-200  transition-colors">
              <Icons.ArrowLeft className="w-4 h-4"/><span>Previous: Asset Class Mastery</span>
            </button>
            <button onClick={() => navigate('/learn/pc-lesson-5')} className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 bg-brand-fill">
              <span>Next: Tactical Asset Allocation</span><Icons.ArrowRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PCLesson4;
