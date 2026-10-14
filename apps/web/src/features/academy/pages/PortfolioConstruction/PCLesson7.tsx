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
  Lightbulb: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18h6M10 22h4M12 2v1M4.22 4.22l.71.71M1 12h1M4.22 19.78l.71-.71M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
    </svg>
  ),
  Settings: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  TrendingUp: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Target: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  BarChart: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20V10M6 20V4M18 20v-6"/>
    </svg>
  ),
  AlertTriangle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Shield: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
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
  // Optimization Constraints Visualization
  ConstraintViz: ({ className = "w-full h-56" }) => (
    <svg className={className} viewBox="0 0 400 250" fill="none">
      <defs>
        <linearGradient id="feasibleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#16A34A" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#5A77AA" stopOpacity="0.2"/>
        </linearGradient>
      </defs>
      {/* Axes */}
      <line x1="50" y1="200" x2="370" y2="200" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <line x1="50" y1="200" x2="50" y2="30" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <text x="210" y="230" fill="currentColor" opacity="0.6" fontSize="13" textAnchor="middle">Asset A Weight</text>
      <text x="20" y="120" fill="currentColor" opacity="0.6" fontSize="13" textAnchor="middle" transform="rotate(-90 20 120)">Asset B Weight</text>
      {/* Feasible region (polygon) */}
      <path d="M 80 200 L 320 200 L 280 80 L 120 80 Z" fill="url(#feasibleGrad)" stroke="#16A34A" strokeWidth="2" strokeDasharray="5,5"/>
      {/* Constraint lines */}
      <line x1="80" y1="80" x2="80" y2="200" stroke="#E04848" strokeWidth="2" opacity="0.6"/>
      <text x="75" y="140" fill="#E04848" fontSize="11" fontWeight="bold" textAnchor="end">Min 20%</text>
      <line x1="50" y1="80" x2="320" y2="80" stroke="#E04848" strokeWidth="2" opacity="0.6"/>
      <text x="200" y="70" fill="#E04848" fontSize="11" fontWeight="bold" textAnchor="middle">Min 20%</text>
      <line x1="320" y1="30" x2="320" y2="200" stroke="#B8923F" strokeWidth="2" opacity="0.6"/>
      <text x="325" y="140" fill="#B8923F" fontSize="11" fontWeight="bold">Max 80%</text>
      {/* Optimal point */}
      <circle cx="200" cy="130" r="8" fill="#8F6FC4" stroke="white" strokeWidth="3"/>
      <text x="200" y="115" fill="#8F6FC4" fontSize="12" fontWeight="bold" textAnchor="middle">Optimal</text>
      {/* Labels */}
      <text x="200" y="25" fill="currentColor" opacity="0.7" fontSize="14" fontWeight="bold" textAnchor="middle">Constrained Optimization</text>
      <text x="200" y="150" fill="#16A34A" fontSize="11" fontWeight="bold" textAnchor="middle">Feasible Region</text>
    </svg>
  )
};

const PCLesson7 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const quizQuestions = [
    {
      id: 1,
      question: "Mean-Variance Optimization (MVO) finds portfolios that:",
      options: [
        "Always beat the market",
        "Maximize expected return for a given level of risk",
        "Eliminate all portfolio risk",
        "Invest only in bonds"
      ],
      correct: 1,
      explanation: "MVO, developed by Markowitz, finds the portfolio weights that maximize expected return for each risk level (or minimize risk for each return level), creating the efficient frontier."
    },
    {
      id: 2,
      question: "Why is MVO sensitive to input errors?",
      options: [
        "It only works with stocks",
        "Small changes in expected returns cause large changes in optimal weights",
        "It ignores correlations",
        "It's designed to be unstable"
      ],
      correct: 1,
      explanation: "MVO is an 'error maximizer' - it heavily overweights assets with high (possibly overestimated) expected returns. This sensitivity to estimation errors is a key practical limitation."
    },
    {
      id: 3,
      question: "What is a practical constraint commonly added to portfolio optimization?",
      options: [
        "Require 100% in a single stock",
        "Maximum allocation limits per asset (e.g., no more than 30%)",
        "Only allow trading on Mondays",
        "Ignore transaction costs"
      ],
      correct: 1,
      explanation: "Position limits (maximum weights per asset) prevent over-concentration in assets that optimization might favor due to estimation errors. Other constraints include minimum positions and sector limits."
    },
    {
      id: 4,
      question: "Black-Litterman optimization improves on MVO by:",
      options: [
        "Eliminating the need for expected returns",
        "Starting from market equilibrium and incorporating investor views",
        "Ignoring correlations",
        "Only working with bonds"
      ],
      correct: 1,
      explanation: "Black-Litterman uses implied market returns as a starting point and blends them with investor views. This produces more stable, intuitive portfolios than traditional MVO."
    }
  ];

  const handleQuizAnswer = (qId, aIdx) => {
    if (!showResults) {
      setQuizAnswers(prev => ({ ...prev, [qId]: aIdx }));
    }
  };

  const calculateScore = () => quizQuestions.filter(q => quizAnswers[q.id] === q.correct).length;

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-cyan-50/30    text-gray-900  min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          <button onClick={() => navigate('/learn/portfolio-construction')} className="flex items-center gap-2 text-gray-500 hover:text-cyan-600  transition-colors mb-8 group">
            <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
            <span className="text-sm font-medium">Back to Portfolio Construction</span>
          </button>

          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-sm bg-brand-fill">LESSON 7 OF 12</span>
              <span className="px-3 py-1.5 bg-cyan-100  text-cyan-700  rounded-full text-xs font-medium flex items-center gap-1.5">
                <Icons.Clock className="w-3.5 h-3.5"/>45 min read
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-gray-900 via-cyan-900 to-blue-900 bg-clip-text text-transparent mb-5 leading-tight tracking-[-0.025em] brand-on-dark">Portfolio Optimization</h1>
            <p className="text-xl text-gray-600  leading-relaxed max-w-3xl">Master the quantitative techniques used to construct optimal portfolios. Understand Mean-Variance Optimization, its limitations, and practical improvements used by professional asset managers.</p>
          </header>

          <div className="space-y-12">
            
            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20 bg-brand-fill">
                    <Icons.Settings className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Mean-Variance Optimization (MVO)</h2>
                    <p className="text-sm text-gray-500 ">Markowitz's mathematical framework</p>
                  </div>
                </div>
                
                <p className="text-gray-700  leading-relaxed mb-6">Mean-Variance Optimization is the mathematical engine behind Modern Portfolio Theory. Given expected returns, volatilities, and correlations, MVO finds the <strong className="text-gray-900 ">optimal portfolio weights</strong> that maximize return for each risk level.</p>
                
                <div className="rounded-xl p-8 mb-6 bg-brand-fill">
                  <div className="text-center mb-6">
                    <p className="text-cyan-400 text-sm font-medium mb-3 uppercase tracking-wide">The Optimization Problem</p>
                    <div className="text-white text-xl font-mono mb-2">Maximize: E(Rₚ) - λ × σ²ₚ</div>
                    <div className="text-gray-400 text-sm">Subject to: Σwᵢ = 1 (weights sum to 100%)</div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-cyan-400 font-medium">Inputs</div>
                      <p className="text-gray-400 text-xs mt-1">Expected returns, covariances</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-blue-400 font-medium">Process</div>
                      <p className="text-gray-400 text-xs mt-1">Quadratic programming</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-indigo-400 font-medium">Output</div>
                      <p className="text-gray-400 text-xs mt-1">Optimal weights wᵢ</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-xl p-6 border-l-4 border-amber-400">
                  <div className="flex items-start gap-3">
                    <Icons.Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <h4 className="font-bold text-gray-900  mb-2">What λ (Lambda) Represents</h4>
                      <p className="text-gray-700  text-sm leading-relaxed">Lambda is the risk aversion parameter. Higher λ means the investor is more risk-averse, resulting in more conservative portfolios. Different λ values trace out the entire efficient frontier.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                    <Icons.AlertTriangle className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">MVO's Limitations</h2>
                    <p className="text-sm text-gray-500 ">Why simple MVO often fails in practice</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">Despite its theoretical elegance, MVO has been called an "error maximizer." Small errors in expected return estimates lead to extreme, unstable portfolio weights.</p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-red-50  rounded-xl p-6 border border-red-200 ">
                    <h4 className="font-bold text-red-800  mb-3">Input Sensitivity</h4>
                    <p className="text-sm text-gray-600  mb-3">A 0.5% change in expected return can shift optimal weights by 20%+ for some assets.</p>
                    <div className="bg-red-100  rounded-lg p-3 text-center">
                      <div className="text-red-700  text-sm font-medium">"Garbage in, garbage out"</div>
                    </div>
                  </div>
                  <div className="bg-amber-50  rounded-xl p-6 border border-amber-200 ">
                    <h4 className="font-bold text-amber-800  mb-3">Estimation Errors</h4>
                    <p className="text-sm text-gray-600  mb-3">Expected returns are notoriously hard to estimate. Historical returns are poor predictors of future returns.</p>
                    <div className="bg-amber-100  rounded-lg p-3 text-center">
                      <div className="text-amber-700  text-sm font-medium">±2% error is common</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50  rounded-xl p-6">
                  <h4 className="font-bold text-gray-900  mb-4">Common MVO Problems</h4>
                  <ul className="space-y-3">
                    {[
                      { problem: "Extreme weights", desc: "100% in one asset, short positions in others" },
                      { problem: "Unstable portfolios", desc: "Small data changes → completely different allocations" },
                      { problem: "Concentration", desc: "Over-invests in assets with highest (possibly wrong) return estimates" },
                      { problem: "Ignores reality", desc: "Transaction costs, liquidity, position limits not considered" }
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"/>
                        <div>
                          <span className="font-medium text-gray-900 ">{item.problem}:</span>
                          <span className="text-gray-600  ml-1">{item.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20 bg-brand-fill">
                    <Icons.Target className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Adding Practical Constraints</h2>
                    <p className="text-sm text-gray-500 ">Making optimization work in the real world</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">Professional investors add constraints to prevent extreme solutions and make portfolios implementable. Constrained optimization produces more stable, realistic portfolios.</p>

                <div className="space-y-4 mb-6">
                  <div className="bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-brand ">Position Limits</h4>
                      <span className="text-sm text-brand ">0% ≤ wᵢ ≤ 30%</span>
                    </div>
                    <p className="text-sm text-gray-600  mt-2">Maximum allocation per asset prevents over-concentration in any single position.</p>
                  </div>
                  <div className="bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-blue-800 ">Sector Limits</h4>
                      <span className="text-sm text-blue-600 ">Max 40% per sector</span>
                    </div>
                    <p className="text-sm text-gray-600  mt-2">Prevents portfolios from becoming too exposed to any single industry or sector.</p>
                  </div>
                  <div className="bg-purple-50  rounded-xl p-5 border border-purple-200 ">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-purple-800 ">Turnover Limits</h4>
                      <span className="text-sm text-purple-600 ">Max 25%/quarter</span>
                    </div>
                    <p className="text-sm text-gray-600  mt-2">Limits trading to control transaction costs and tax implications.</p>
                  </div>
                  <div className="bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-amber-800 ">No Short Sales</h4>
                      <span className="text-sm text-amber-600 ">wᵢ ≥ 0</span>
                    </div>
                    <p className="text-sm text-gray-600  mt-2">Long-only constraint for accounts that can't or don't want to short.</p>
                  </div>
                </div>

                <div className="rounded-xl p-6 border-l-4 border-brand bg-brand-soft">
                  <h4 className="font-bold text-gray-900  mb-2">The Constraint Paradox</h4>
                  <p className="text-gray-700  text-sm leading-relaxed">Adding constraints technically reduces the "optimal" solution space. But in practice, constrained portfolios often perform better out-of-sample because they're less sensitive to estimation errors.</p>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20 bg-brand-fill">
                    <Icons.Target className="w-7 h-7 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Practical Optimization</h2>
                    <p className="text-sm text-gray-500 ">Real-world constraints and solutions</p>
                  </div>
                </div>
                
                {/* Visual: Constraint Visualization */}
                <div className="rounded-2xl p-8 mb-6 shadow-lg bg-brand-fill">
                  <h4 className="text-white font-bold mb-4 text-center">Visual: Constrained Optimization Space</h4>
                  <Icons.ConstraintViz className="w-full h-56"/>
                  <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-brand-fill"></div>
                      <span className="text-gray-300">Feasible Region</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-gray-300">Optimal Point</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700  leading-relaxed mb-6">Portfolio optimization in practice requires balancing theoretical optimality with real-world constraints like position limits, turnover costs, and tax considerations.</p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-orange-50  rounded-xl p-6 border border-orange-200 ">
                    <h4 className="font-bold text-orange-800  mb-3">Indian Market Constraints</h4>
                    <ul className="space-y-2 text-sm text-gray-600 ">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"/>
                        <span><strong className="text-gray-900 ">Stock limits:</strong> Max 10% per stock to avoid concentration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"/>
                        <span><strong className="text-gray-900 ">International cap:</strong> LRS limit $250k/year per person</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"/>
                        <span><strong className="text-gray-900 ">Liquidity:</strong> Small/mid-caps have higher impact costs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"/>
                        <span><strong className="text-gray-900 ">Turnover limit:</strong> LTCG tax benefit after 1 year holding</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-brand-soft  rounded-xl p-6 border border-brand-line ">
                    <h4 className="font-bold text-brand  mb-3">Tax-Optimized Rebalancing</h4>
                    <p className="text-sm text-gray-600  mb-3">Indian tax treatment affects optimal turnover:</p>
                    <div className="space-y-2 text-xs">
                      <div className="bg-brand-soft  rounded-lg p-2">
                        <p className="font-medium text-brand ">Equity LTCG: 12.5% (after ₹1.25L exempt)</p>
                        <p className="text-brand ">Equity STCG: 20% (within 1 year)</p>
                      </div>
                      <div className="bg-brand-soft  rounded-lg p-2">
                        <p className="font-medium text-brand ">Debt LTCG: Slab rate (after 3 years)</p>
                        <p className="text-brand ">Consider tax loss harvesting in March</p>
                      </div>
                    </div>
                    <p className="text-xs text-brand  mt-2">Hold winners 1+ year when possible; use new cash to rebalance</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-green-50   rounded-xl p-6 border-l-4 border-orange-500">
                  <h4 className="font-bold text-gray-900  mb-2">Home Bias in Indian Portfolios</h4>
                  <p className="text-gray-700  text-sm leading-relaxed mb-2">Indian investors often have extreme home bias (95%+ domestic allocation). While familiarity and tax efficiency favor Indian assets, optimal diversification suggests 15-30% international exposure, especially to developed markets with lower correlation.</p>
                  <p className="text-gray-600  text-xs">Use MVO with constraint: min 15% international. This prevents optimizer from concentrating entirely in high-return (but volatile) Indian equities.</p>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20 bg-brand-fill">
                    <Icons.Shield className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Robust Optimization Methods</h2>
                    <p className="text-sm text-gray-500 ">Beyond traditional MVO</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-violet-50  rounded-xl p-6 border border-violet-200 ">
                    <h4 className="font-bold text-violet-800  mb-3">Black-Litterman Model</h4>
                    <p className="text-sm text-gray-600  mb-3">Starts from market equilibrium (implied returns) and blends with investor views. More stable than traditional MVO.</p>
                    <div className="bg-violet-100  rounded-lg p-3">
                      <p className="text-xs text-violet-700 ">Used by: Goldman Sachs (original developers), many institutional investors</p>
                    </div>
                  </div>
                  <div className="bg-purple-50  rounded-xl p-6 border border-purple-200 ">
                    <h4 className="font-bold text-purple-800  mb-3">Resampled Efficiency</h4>
                    <p className="text-sm text-gray-600  mb-3">Runs MVO on thousands of simulated inputs and averages the results. Produces more diversified portfolios.</p>
                    <div className="bg-purple-100  rounded-lg p-3">
                      <p className="text-xs text-purple-700 ">Developed by Richard Michaud</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50  rounded-xl p-6 border border-indigo-200 ">
                    <h4 className="font-bold text-indigo-800  mb-3">Risk Parity</h4>
                    <p className="text-sm text-gray-600  mb-3">Equalizes risk contribution from each asset rather than optimizing returns. Doesn't require return estimates.</p>
                    <div className="bg-indigo-100  rounded-lg p-3">
                      <p className="text-xs text-indigo-700 ">Popularized by Bridgewater's All Weather fund</p>
                    </div>
                  </div>
                  <div className="bg-blue-50  rounded-xl p-6 border border-blue-200 ">
                    <h4 className="font-bold text-blue-800  mb-3">Minimum Variance</h4>
                    <p className="text-sm text-gray-600  mb-3">Focuses only on minimizing risk, ignoring return estimates entirely. Uses only covariance matrix (more stable).</p>
                    <div className="bg-blue-100  rounded-lg p-3">
                      <p className="text-xs text-blue-700 ">Strong out-of-sample performance in research</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20 bg-brand-fill">
                    <Icons.BarChart className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Practical Optimization Workflow</h2>
                    <p className="text-sm text-gray-500 ">How professionals actually build portfolios</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {[
                    { step: 1, title: "Define Universe", desc: "Select eligible assets and gather historical data" },
                    { step: 2, title: "Estimate Inputs", desc: "Calculate expected returns (or use equilibrium), covariances" },
                    { step: 3, title: "Set Constraints", desc: "Position limits, sector bounds, turnover limits" },
                    { step: 4, title: "Run Optimization", desc: "Use robust method (Black-Litterman, resampling, etc.)" },
                    { step: 5, title: "Stress Test", desc: "Check portfolio behavior under different scenarios" },
                    { step: 6, title: "Implement", desc: "Execute trades, considering transaction costs" }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4 bg-gray-50  rounded-xl p-4">
                      <span className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 bg-brand-fill">
                        {item.step}
                      </span>
                      <div>
                        <h4 className="font-bold text-gray-900 ">{item.title}</h4>
                        <p className="text-sm text-gray-600 ">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-xl p-6 border-l-4 border-amber-400">
                  <div className="flex items-start gap-3">
                    <Icons.Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <h4 className="font-bold text-gray-900  mb-2">The Human Element</h4>
                      <p className="text-gray-700  text-sm leading-relaxed">No optimizer is a black box. Professional portfolio managers use optimization as a tool, not a dictator. They apply judgment, check results for reasonableness, and override when necessary.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-8">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/20 bg-brand-fill">
                    <Icons.CheckCircle className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Knowledge Check</h2>
                    <p className="text-sm text-gray-500 ">Test your understanding of portfolio optimization</p>
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
                                ${isSelected && !showResults ? 'border-cyan-500 bg-cyan-50 ' : ''}
                                ${!isSelected && !showResults ? 'border-gray-200  hover:border-gray-300 ' : ''}
                                ${showResults ? 'cursor-default' : 'cursor-pointer'}`}>
                              <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected ? 'border-cyan-500 bg-cyan-500 text-white' : 'border-gray-300  text-gray-500'}`}>
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
                        <div className="mt-4 p-4 bg-cyan-50  rounded-lg border border-cyan-200 ">
                          <p className="text-sm text-cyan-800 "><strong>Explanation:</strong> {q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!showResults ? (
                  <button onClick={() => setShowResults(true)} disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                    className="mt-8 w-full py-4 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-brand-fill">
                    Check Answers
                  </button>
                ) : (
                  <div className="mt-8 p-6 rounded-xl text-center bg-brand-fill">
                    <p className="text-3xl font-bold text-white mb-2">{calculateScore()} / {quizQuestions.length}</p>
                    <p className="text-cyan-100">{calculateScore() === quizQuestions.length ? "Excellent! You've mastered portfolio optimization concepts." : "Review the explanations to strengthen your understanding."}</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/pc-lesson-6')} className="flex items-center gap-2 px-6 py-3 bg-gray-100  text-gray-700  rounded-xl font-medium hover:bg-gray-200  transition-colors">
              <Icons.ArrowLeft className="w-4 h-4"/><span>Previous: Factor Investing</span>
            </button>
            <button onClick={() => navigate('/learn/pc-lesson-8')} className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 bg-brand-fill">
              <span>Next: Tax-Efficient Investing</span><Icons.ArrowRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PCLesson7;
