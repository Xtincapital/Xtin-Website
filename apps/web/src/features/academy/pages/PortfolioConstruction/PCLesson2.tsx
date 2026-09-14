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
  BookOpen: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  Lightbulb: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18h6M10 22h4M12 2v1M4.22 4.22l.71.71M1 12h1M4.22 19.78l.71-.71M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
    </svg>
  ),
  AlertTriangle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Target: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  TrendingUp: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Activity: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
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
  // Normal Distribution / Bell Curve
  BellCurve: ({ className = "w-full h-56" }) => (
    <svg className={className} viewBox="0 0 400 250" fill="none">
      <defs>
        <linearGradient id="bellGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1"/>
        </linearGradient>
      </defs>
      {/* Axes */}
      <line x1="40" y1="200" x2="360" y2="200" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      {/* Bell curve path */}
      <path d="M 40 200 Q 80 180, 120 120 T 200 50 T 280 120 Q 320 180, 360 200" stroke="#3b82f6" strokeWidth="3" fill="url(#bellGrad)"/>
      {/* Mean line */}
      <line x1="200" y1="50" x2="200" y2="210" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5"/>
      <text x="200" y="230" fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle">μ (Mean)</text>
      {/* Standard deviation markers */}
      <line x1="130" y1="190" x2="130" y2="205" stroke="#ef4444" strokeWidth="2"/>
      <line x1="270" y1="190" x2="270" y2="205" stroke="#ef4444" strokeWidth="2"/>
      <path d="M 130 197 L 200 197" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arrowRed)"/>
      <path d="M 200 197 L 270 197" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arrowRed)"/>
      <text x="165" y="220" fill="#ef4444" fontSize="11" textAnchor="middle">σ</text>
      <text x="235" y="220" fill="#ef4444" fontSize="11" textAnchor="middle">σ</text>
      {/* Labels */}
      <text x="200" y="30" fill="currentColor" opacity="0.7" fontSize="14" fontWeight="bold" textAnchor="middle">Return Distribution</text>
      {/* Percentages */}
      <text x="200" y="130" fill="currentColor" opacity="0.5" fontSize="11" textAnchor="middle">68% within ±1σ</text>
      <defs>
        <marker id="arrowRed" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#ef4444"/>
        </marker>
      </defs>
    </svg>
  ),
  // Risk Types Breakdown
  RiskBreakdown: ({ className = "w-full h-48" }) => (
    <svg className={className} viewBox="0 0 400 200" fill="none">
      {/* Total Risk Bar */}
      <rect x="50" y="40" width="300" height="50" fill="#3b82f6" opacity="0.3" stroke="#3b82f6" strokeWidth="2" rx="4"/>
      <text x="200" y="70" fill="currentColor" fontSize="14" fontWeight="bold" textAnchor="middle">TOTAL RISK</text>
      {/* Systematic Risk */}
      <rect x="50" y="120" width="200" height="40" fill="#ef4444" opacity="0.6" stroke="#ef4444" strokeWidth="2" rx="4"/>
      <text x="150" y="145" fill="white" fontSize="13" fontWeight="bold" textAnchor="middle">Systematic Risk</text>
      <text x="150" y="180" fill="#ef4444" fontSize="11" textAnchor="middle">Cannot Diversify</text>
      {/* Unsystematic Risk */}
      <rect x="260" y="120" width="90" height="40" fill="#10b981" opacity="0.6" stroke="#10b981" strokeWidth="2" rx="4"/>
      <text x="305" y="138" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">Unsystematic</text>
      <text x="305" y="152" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">Risk</text>
      <text x="305" y="180" fill="#10b981" fontSize="11" textAnchor="middle">Can Diversify!</text>
      {/* Arrows */}
      <path d="M 200 100 L 150 110" stroke="currentColor" strokeWidth="1.5" opacity="0.4" markerEnd="url(#arrow)"/>
      <path d="M 200 100 L 305 110" stroke="currentColor" strokeWidth="1.5" opacity="0.4" markerEnd="url(#arrow)"/>
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="currentColor" opacity="0.4"/>
        </marker>
      </defs>
    </svg>
  ),
  // Sharpe Ratio Visualization
  SharpeRatioChart: ({ className = "w-full h-56" }) => (
    <svg className={className} viewBox="0 0 400 250" fill="none">
      {/* Axes */}
      <line x1="50" y1="200" x2="370" y2="200" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <line x1="50" y1="200" x2="50" y2="30" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <text x="210" y="230" fill="currentColor" opacity="0.6" fontSize="13" textAnchor="middle">Risk (Volatility)</text>
      <text x="20" y="120" fill="currentColor" opacity="0.6" fontSize="13" textAnchor="middle" transform="rotate(-90 20 120)">Return</text>
      {/* Risk-free rate line */}
      <line x1="50" y1="190" x2="370" y2="190" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,4"/>
      <text x="370" y="185" fill="#94a3b8" fontSize="11" textAnchor="end">Risk-Free Rate</text>
      {/* Three portfolios */}
      {/* Low Sharpe */}
      <circle cx="150" cy="160" r="8" fill="#ef4444" stroke="white" strokeWidth="2"/>
      <line x1="50" y1="190" x2="150" y2="160" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,3" opacity="0.4"/>
      <text x="150" y="150" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle">Low SR</text>
      {/* Medium Sharpe */}
      <circle cx="220" cy="120" r="8" fill="#f59e0b" stroke="white" strokeWidth="2"/>
      <line x1="50" y1="190" x2="220" y2="120" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" opacity="0.4"/>
      <text x="220" y="110" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle">Med SR</text>
      {/* High Sharpe */}
      <circle cx="250" cy="70" r="8" fill="#10b981" stroke="white" strokeWidth="2"/>
      <line x1="50" y1="190" x2="250" y2="70" stroke="#10b981" strokeWidth="2.5" opacity="0.6"/>
      <text x="250" y="60" fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle">High SR ★</text>
      {/* Legend */}
      <text x="200" y="25" fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle">Steeper slope = Better Sharpe Ratio</text>
    </svg>
  )
};

const PCLesson2 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const quizQuestions = [
    {
      id: 1,
      question: "What is the key difference between systematic and unsystematic risk?",
      options: [
        "Systematic risk affects individual stocks, unsystematic affects the market",
        "Systematic risk can be diversified away, unsystematic cannot",
        "Systematic risk affects the entire market and cannot be diversified away",
        "There is no meaningful difference between them"
      ],
      correct: 2,
      explanation: "Systematic risk (market risk) affects all securities and cannot be eliminated through diversification. Unsystematic risk is company-specific and CAN be diversified away by holding multiple securities."
    },
    {
      id: 2,
      question: "The Sharpe Ratio measures:",
      options: [
        "Total return of a portfolio",
        "Excess return per unit of total risk",
        "The correlation between assets",
        "Maximum potential loss"
      ],
      correct: 1,
      explanation: "The Sharpe Ratio = (Portfolio Return - Risk-Free Rate) / Standard Deviation. It measures how much excess return you receive for each unit of risk taken."
    },
    {
      id: 3,
      question: "Standard deviation in investing represents:",
      options: [
        "The average return over time",
        "The maximum loss possible",
        "The dispersion of returns around the mean",
        "The minimum return expected"
      ],
      correct: 2,
      explanation: "Standard deviation measures volatility - how much returns deviate from the average. Higher standard deviation means returns are more spread out and unpredictable."
    },
    {
      id: 4,
      question: "Why do investors typically demand higher returns for riskier investments?",
      options: [
        "Because risky investments always lose money",
        "To compensate for the uncertainty and potential for loss",
        "Because the government requires it",
        "Because safe investments are illegal"
      ],
      correct: 1,
      explanation: "The risk-return trade-off is fundamental: investors require a risk premium to compensate for taking on uncertainty. Without higher expected returns, no rational investor would accept additional risk."
    }
  ];

  const handleQuizAnswer = (qId, aIdx) => {
    if (!showResults) {
      setQuizAnswers(prev => ({ ...prev, [qId]: aIdx }));
    }
  };

  const calculateScore = () => quizQuestions.filter(q => quizAnswers[q.id] === q.correct).length;

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-rose-50/30    text-gray-900  min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          <button onClick={() => navigate('/learn/portfolio-construction')} className="flex items-center gap-2 text-gray-500 hover:text-rose-600  transition-colors mb-8 group">
            <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
            <span className="text-sm font-medium">Back to Portfolio Construction</span>
          </button>

          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs font-bold rounded-full shadow-sm">LESSON 2 OF 12</span>
              <span className="px-3 py-1.5 bg-rose-100  text-rose-700  rounded-full text-xs font-medium flex items-center gap-1.5">
                <Icons.Clock className="w-3.5 h-3.5"/>40 min read
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-rose-900 to-red-900    bg-clip-text text-transparent mb-5 leading-tight">Risk and Return Deep Dive</h1>
            <p className="text-xl text-gray-600  leading-relaxed max-w-3xl">Master the fundamental concepts of investment risk. Understand different risk types, how to measure them, and why the risk-return relationship drives all investment decisions.</p>
          </header>

          <div className="space-y-12">
            
            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/20">
                    <Icons.Target className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1">The Risk-Return Trade-Off</h2>
                    <p className="text-sm text-gray-500 ">The fundamental law of investing</p>
                  </div>
                </div>
                
                <p className="text-gray-700  leading-relaxed mb-6">Every investment decision involves a trade-off between risk and return. This isn't just theory—it's backed by decades of data across every asset class. <strong className="text-gray-900 ">Higher expected returns require accepting higher risk.</strong></p>
                
                <div className="bg-gradient-to-br from-slate-900 to-rose-950 rounded-xl p-8 mb-6">
                  <h4 className="text-white font-semibold mb-4 text-center">Historical Risk-Return Relationship (1928-2023)</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-emerald-400 font-bold text-xl mb-1">3.3%</div>
                      <div className="text-gray-400 text-sm">T-Bills Return</div>
                      <div className="text-gray-500 text-xs mt-1">Risk: 3.1%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-amber-400 font-bold text-xl mb-1">5.2%</div>
                      <div className="text-gray-400 text-sm">10Y Bonds</div>
                      <div className="text-gray-500 text-xs mt-1">Risk: 7.7%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-rose-400 font-bold text-xl mb-1">11.7%</div>
                      <div className="text-gray-400 text-sm">S&P 500</div>
                      <div className="text-gray-500 text-xs mt-1">Risk: 19.6%</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-xl p-6 border-l-4 border-amber-400">
                  <div className="flex items-start gap-3">
                    <Icons.Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <h4 className="font-bold text-gray-900  mb-2">The Equity Risk Premium</h4>
                      <p className="text-gray-700  text-sm leading-relaxed">The extra return stocks provide over risk-free assets (historically ~6-8%) compensates investors for accepting stock market volatility. This premium is why long-term investors favor equities.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                    <Icons.AlertTriangle className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1">Systematic vs. Unsystematic Risk</h2>
                    <p className="text-sm text-gray-500 ">Understanding what you can and cannot diversify</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">Not all risk is created equal. The distinction between systematic and unsystematic risk is crucial for portfolio construction because it determines what diversification can achieve.</p>

                {/* Visual: Risk Breakdown */}
                <div className="bg-gradient-to-br from-gray-900 to-blue-950 rounded-2xl p-8 mb-6 shadow-lg">
                  <h4 className="text-white font-bold mb-4 text-center">Visual: Total Risk Decomposition</h4>
                  <Icons.RiskBreakdown className="w-full h-48"/>
                  <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-gray-300">Systematic (Market) Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-gray-300">Unsystematic (Diversifiable) Risk</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-red-50  rounded-xl p-6 border border-red-200 ">
                    <h4 className="font-bold text-red-800  mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm">S</span>
                      Systematic Risk
                    </h4>
                    <p className="text-sm text-gray-600  mb-3">Also called market risk or undiversifiable risk. Affects ALL securities in the market.</p>
                    <ul className="text-sm space-y-2">
                      {["Interest rate changes", "Recessions", "Inflation shocks", "Geopolitical events", "Pandemics"].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700 ">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"/>{item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-red-200 ">
                      <p className="text-xs text-red-700  font-medium">⚠️ Cannot be eliminated through diversification</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50  rounded-xl p-6 border border-emerald-200 ">
                    <h4 className="font-bold text-emerald-800  mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm">U</span>
                      Unsystematic Risk
                    </h4>
                    <p className="text-sm text-gray-600  mb-3">Also called specific risk or diversifiable risk. Affects individual companies or industries.</p>
                    <ul className="text-sm space-y-2">
                      {["CEO departure", "Product recalls", "Lawsuits", "Labor strikes", "Competitive disruption"].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700 ">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"/>{item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-emerald-200 ">
                      <p className="text-xs text-emerald-700  font-medium">✓ CAN be eliminated through diversification</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50   rounded-xl p-6 border-l-4 border-blue-500">
                  <h4 className="font-bold text-gray-900  mb-2">Key Implication</h4>
                  <p className="text-gray-700  text-sm leading-relaxed">Since unsystematic risk can be diversified away for free, the market doesn't compensate you for taking it. You only earn a risk premium for bearing systematic risk. This is why holding just a few stocks is inefficient.</p>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                    <Icons.Activity className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1">Measuring Risk: Standard Deviation</h2>
                    <p className="text-sm text-gray-500 ">The most common risk metric explained</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">Standard deviation measures volatility—how much returns fluctuate around their average. Higher standard deviation means more unpredictable returns, which most investors perceive as higher risk.</p>

                {/* Visual: Normal Distribution / Bell Curve */}
                <div className="bg-gradient-to-br from-gray-900 to-purple-950 rounded-2xl p-8 mb-6 shadow-lg">
                  <h4 className="text-white font-bold mb-4 text-center">Visual: Return Distribution & Standard Deviation</h4>
                  <Icons.BellCurve className="w-full h-56"/>
                  <div className="mt-4 text-center text-sm text-gray-300">
                    Returns typically follow a bell-shaped distribution centered on the mean (μ), with standard deviation (σ) measuring spread
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-xl p-8 mb-6">
                  <div className="text-center">
                    <p className="text-blue-400 text-sm font-medium mb-3 uppercase tracking-wide">Standard Deviation Formula</p>
                    <div className="text-white text-xl md:text-2xl font-mono">σ = √[Σ(Rᵢ - R̄)² / (n-1)]</div>
                    <div className="mt-4 text-sm text-gray-400">Where R̄ is the mean return and n is the number of observations</div>
                  </div>
                </div>

                <div className="bg-gray-50  rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-gray-900  mb-4">What Standard Deviation Tells Us</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <span className="w-16 text-center py-1 bg-emerald-100  text-emerald-700  rounded font-medium text-sm">68%</span>
                      <p className="text-gray-700  text-sm">of returns fall within ±1 standard deviation of the mean</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="w-16 text-center py-1 bg-blue-100  text-blue-700  rounded font-medium text-sm">95%</span>
                      <p className="text-gray-700  text-sm">of returns fall within ±2 standard deviations of the mean</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="w-16 text-center py-1 bg-purple-100  text-purple-700  rounded font-medium text-sm">99.7%</span>
                      <p className="text-gray-700  text-sm">of returns fall within ±3 standard deviations of the mean</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50  rounded-lg p-4 text-center border border-emerald-200 ">
                    <div className="text-2xl font-bold text-emerald-600 ">5-8%</div>
                    <div className="text-sm text-gray-600 ">Bond Funds</div>
                  </div>
                  <div className="bg-amber-50  rounded-lg p-4 text-center border border-amber-200 ">
                    <div className="text-2xl font-bold text-amber-600 ">15-20%</div>
                    <div className="text-sm text-gray-600 ">Stock Index</div>
                  </div>
                  <div className="bg-red-50  rounded-lg p-4 text-center border border-red-200 ">
                    <div className="text-2xl font-bold text-red-600 ">30-50%</div>
                    <div className="text-sm text-gray-600 ">Individual Stocks</div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                    <Icons.TrendingUp className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1">The Sharpe Ratio</h2>
                    <p className="text-sm text-gray-500 ">Measuring risk-adjusted returns</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">Developed by Nobel laureate William Sharpe, this ratio answers a crucial question: <strong className="text-gray-900 ">how much extra return are you getting for each unit of risk taken?</strong></p>

                {/* Visual: Sharpe Ratio Comparison */}
                <div className="bg-gradient-to-br from-gray-900 to-green-950 rounded-2xl p-8 mb-6 shadow-lg">
                  <h4 className="text-white font-bold mb-4 text-center">Visual: Comparing Sharpe Ratios</h4>
                  <Icons.SharpeRatioChart className="w-full h-56"/>
                  <div className="mt-4 text-center text-sm text-gray-300">
                    Higher Sharpe Ratio = Better risk-adjusted returns. The steeper the line from the risk-free rate, the better.
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-amber-950 rounded-xl p-8 mb-6">
                  <div className="text-center">
                    <p className="text-amber-400 text-sm font-medium mb-3 uppercase tracking-wide">Sharpe Ratio</p>
                    <div className="text-white text-2xl md:text-3xl font-mono">SR = (Rₚ - Rƒ) / σₚ</div>
                    <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                      <span>Rₚ = Portfolio return</span>
                      <span>Rƒ = Risk-free rate</span>
                      <span>σₚ = Portfolio std dev</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50  rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-gray-900  mb-4">Interpreting Sharpe Ratios</h4>
                  <div className="grid md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-red-100  rounded-lg">
                      <div className="font-bold text-red-600 ">&lt; 0</div>
                      <div className="text-xs text-gray-600 ">Poor</div>
                    </div>
                    <div className="text-center p-3 bg-amber-100  rounded-lg">
                      <div className="font-bold text-amber-600 ">0 - 1</div>
                      <div className="text-xs text-gray-600 ">Adequate</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-100  rounded-lg">
                      <div className="font-bold text-emerald-600 ">1 - 2</div>
                      <div className="text-xs text-gray-600 ">Good</div>
                    </div>
                    <div className="text-center p-3 bg-blue-100  rounded-lg">
                      <div className="font-bold text-blue-600 ">&gt; 2</div>
                      <div className="text-xs text-gray-600 ">Excellent</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-xl p-6 border-l-4 border-amber-400">
                  <div className="flex items-start gap-3">
                    <Icons.Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <h4 className="font-bold text-gray-900  mb-2">Pro Tip</h4>
                      <p className="text-gray-700  text-sm leading-relaxed">Always compare Sharpe Ratios over the same time period and using the same risk-free rate. The ratio varies significantly depending on market conditions and the measurement timeframe.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                    <Icons.Shield className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1">Beyond Standard Deviation</h2>
                    <p className="text-sm text-gray-500 ">Advanced risk measures</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">While standard deviation is useful, it treats upside and downside volatility equally. Most investors care more about downside risk, leading to alternative measures.</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50  rounded-xl p-6">
                    <h4 className="font-bold text-gray-900  mb-3">Sortino Ratio</h4>
                    <p className="text-sm text-gray-600  mb-3">Like Sharpe, but uses downside deviation instead of total volatility. Only penalizes negative returns.</p>
                    <div className="bg-gray-200  rounded p-3 text-center font-mono text-sm">
                      Sortino = (Rₚ - Rƒ) / σdownside
                    </div>
                  </div>
                  <div className="bg-gray-50  rounded-xl p-6">
                    <h4 className="font-bold text-gray-900  mb-3">Value at Risk (VaR)</h4>
                    <p className="text-sm text-gray-600  mb-3">Estimates maximum loss over a time period at a given confidence level.</p>
                    <div className="bg-gray-200  rounded p-3 text-center text-sm">
                      "95% confident loss won't exceed X%"
                    </div>
                  </div>
                  <div className="bg-gray-50  rounded-xl p-6">
                    <h4 className="font-bold text-gray-900  mb-3">Maximum Drawdown</h4>
                    <p className="text-sm text-gray-600  mb-3">The largest peak-to-trough decline in portfolio value. Shows worst-case historical scenario.</p>
                    <div className="bg-gray-200  rounded p-3 text-center text-sm">
                      Max DD = (Trough - Peak) / Peak
                    </div>
                  </div>
                  <div className="bg-gray-50  rounded-xl p-6">
                    <h4 className="font-bold text-gray-900  mb-3">Beta</h4>
                    <p className="text-sm text-gray-600  mb-3">Measures sensitivity to market movements. Beta of 1.2 means 20% more volatile than the market.</p>
                    <div className="bg-gray-200  rounded p-3 text-center font-mono text-sm">
                      β = Cov(Rₐ, Rₘ) / Var(Rₘ)
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-8">
                  <span className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                    <Icons.CheckCircle className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1">Knowledge Check</h2>
                    <p className="text-sm text-gray-500 ">Test your understanding of risk and return</p>
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
                                ${showCorrect ? 'border-emerald-500 bg-emerald-50 ' : ''}
                                ${showWrong ? 'border-red-500 bg-red-50 ' : ''}
                                ${isSelected && !showResults ? 'border-rose-500 bg-rose-50 ' : ''}
                                ${!isSelected && !showResults ? 'border-gray-200  hover:border-gray-300 ' : ''}
                                ${showResults ? 'cursor-default' : 'cursor-pointer'}`}>
                              <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-gray-300  text-gray-500'}`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="flex-1 text-gray-700 ">{option}</span>
                              {showResults && isCorrect && <Icons.CheckCircle className="w-6 h-6 text-emerald-500"/>}
                              {showResults && isSelected && !isCorrect && <Icons.XCircle className="w-6 h-6 text-red-500"/>}
                            </button>
                          );
                        })}
                      </div>
                      {showResults && (
                        <div className="mt-4 p-4 bg-rose-50  rounded-lg border border-rose-200 ">
                          <p className="text-sm text-rose-800 "><strong>Explanation:</strong> {q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!showResults ? (
                  <button onClick={() => setShowResults(true)} disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                    className="mt-8 w-full py-4 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    Check Answers
                  </button>
                ) : (
                  <div className="mt-8 p-6 bg-gradient-to-r from-rose-600 to-red-600 rounded-xl text-center">
                    <p className="text-3xl font-bold text-white mb-2">{calculateScore()} / {quizQuestions.length}</p>
                    <p className="text-rose-100">{calculateScore() === quizQuestions.length ? "Excellent! You've mastered risk fundamentals." : "Review the explanations to deepen your understanding."}</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/pc-lesson-1')} className="flex items-center gap-2 px-6 py-3 bg-gray-100  text-gray-700  rounded-xl font-medium hover:bg-gray-200  transition-colors">
              <Icons.ArrowLeft className="w-4 h-4"/><span>Previous: Modern Portfolio Theory</span>
            </button>
            <button onClick={() => navigate('/learn/pc-lesson-3')} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-200">
              <span>Next: Asset Class Mastery</span><Icons.ArrowRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PCLesson2;
