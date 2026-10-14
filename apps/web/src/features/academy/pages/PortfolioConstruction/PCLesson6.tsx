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
  Layers: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  TrendingUp: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Percent: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  ),
  Box: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  Zap: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Award: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="7"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/>
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
  // Factor Returns Bar Chart
  FactorChart: ({ className = "w-full h-56" }) => (
    <svg className={className} viewBox="0 0 400 250" fill="none">
      <defs>
        {['#5A77AA', '#1FA978', '#B8923F', '#8F6FC4', '#E04848'].map((color, i) => (
          <linearGradient key={`fGrad-${i}`} id={`factorGrad${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.4"/>
          </linearGradient>
        ))}
      </defs>
      {/* Axes */}
      <line x1="50" y1="200" x2="370" y2="200" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <line x1="50" y1="200" x2="50" y2="30" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <text x="210" y="230" fill="currentColor" opacity="0.6" fontSize="13" textAnchor="middle">Factor Premiums</text>
      <text x="20" y="120" fill="currentColor" opacity="0.6" fontSize="13" textAnchor="middle" transform="rotate(-90 20 120)">Annual Return %</text>
      {/* Bars */}
      {[{x:70,h:120,c:0,l:'Value'},{x:130,h:90,c:1,l:'Size'},{x:190,h:110,c:2,l:'Momentum'},{x:250,h:100,c:3,l:'Quality'},{x:310,h:85,c:4,l:'Low Vol'}].map((bar, i) => (
        <g key={i}>
          <rect x={bar.x} y={200-bar.h} width="40" height={bar.h} fill={`url(#factorGrad${bar.c})`} stroke="white" strokeWidth="2" rx="4"/>
          <text x={bar.x+20} y={200-bar.h-5} fill="currentColor" fontSize="12" fontWeight="bold" textAnchor="middle">{bar.h/10}%</text>
          <text x={bar.x+20} y="218" fill="currentColor" opacity="0.7" fontSize="11" textAnchor="middle">{bar.l}</text>
        </g>
      ))}
      {/* Reference line */}
      <line x1="50" y1="150" x2="370" y2="150" stroke="#A3A1A6" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.5"/>
      <text x="365" y="145" fill="#A3A1A6" fontSize="10" textAnchor="end">Market</text>
      <text x="200" y="25" fill="currentColor" opacity="0.7" fontSize="14" fontWeight="bold" textAnchor="middle">Historical Factor Outperformance</text>
    </svg>
  )
};

const PCLesson6 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const quizQuestions = [
    {
      id: 1,
      question: "What is a 'factor' in the context of factor investing?",
      options: [
        "A type of mutual fund",
        "A systematic source of return that explains differences in stock performance",
        "The expense ratio of an ETF",
        "A broker's commission"
      ],
      correct: 1,
      explanation: "Factors are characteristics that systematically explain why certain stocks outperform others over time. They represent compensated risks or behavioral anomalies that persist across markets and time periods."
    },
    {
      id: 2,
      question: "The Value factor is based on investing in stocks that:",
      options: [
        "Have the highest prices",
        "Are cheap relative to fundamentals (low P/E, P/B ratios)",
        "Are growing the fastest",
        "Pay no dividends"
      ],
      correct: 1,
      explanation: "Value investing targets stocks trading at low prices relative to fundamentals like earnings, book value, or cash flow. The value premium has historically rewarded investors for buying 'unpopular' stocks."
    },
    {
      id: 3,
      question: "Why might factor premiums exist and persist?",
      options: [
        "Government regulations require them",
        "They represent compensation for risk or are due to behavioral biases",
        "They are guaranteed by investment banks",
        "Random chance only"
      ],
      correct: 1,
      explanation: "Factor premiums exist either as compensation for bearing certain risks (risk-based explanation) or because investors systematically make behavioral errors that create exploitable patterns (behavioral explanation)."
    },
    {
      id: 4,
      question: "What is a key risk of factor investing?",
      options: [
        "Factors are guaranteed to work every year",
        "Factors can underperform for extended periods, requiring patience",
        "Factor ETFs are always expensive",
        "Factors only work in emerging markets"
      ],
      correct: 1,
      explanation: "Factor investing requires significant patience. Even well-documented factors like Value can underperform for a decade or more. Investors who abandon factor strategies during drawdowns lock in poor returns."
    }
  ];

  const handleQuizAnswer = (qId, aIdx) => {
    if (!showResults) {
      setQuizAnswers(prev => ({ ...prev, [qId]: aIdx }));
    }
  };

  const calculateScore = () => quizQuestions.filter(q => quizAnswers[q.id] === q.correct).length;

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-violet-50/30    text-gray-900  min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          <button onClick={() => navigate('/learn/portfolio-construction')} className="flex items-center gap-2 text-gray-500 hover:text-violet-600  transition-colors mb-8 group">
            <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
            <span className="text-sm font-medium">Back to Portfolio Construction</span>
          </button>

          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white text-xs font-bold rounded-full shadow-sm">LESSON 6 OF 12</span>
              <span className="px-3 py-1.5 bg-violet-100  text-violet-700  rounded-full text-xs font-medium flex items-center gap-1.5">
                <Icons.Clock className="w-3.5 h-3.5"/>45 min read
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-normal bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900    bg-clip-text text-transparent mb-5 leading-tight tracking-[-0.015em]">Factor Investing</h1>
            <p className="text-xl text-gray-600  leading-relaxed max-w-3xl">Discover the systematic drivers of investment returns. Learn about value, momentum, size, quality, and other factors that have historically delivered premiums—and understand their risks.</p>
          </header>

          <div className="space-y-12">
            
            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                    <Icons.Layers className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">What Are Factors?</h2>
                    <p className="text-sm text-gray-500 ">The building blocks of returns</p>
                  </div>
                </div>
                
                <p className="text-gray-700  leading-relaxed mb-6">Factors are <strong className="text-gray-900 ">systematic characteristics that explain differences in investment returns</strong>. Rather than picking individual stocks, factor investing targets specific attributes that have historically delivered excess returns across markets and time periods.</p>
                
                <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-xl p-8 mb-6">
                  <h4 className="text-white font-semibold mb-4 text-center">The Factor Revolution</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-violet-400 font-bold">1960s-70s</div>
                      <p className="text-gray-400 text-sm mt-1">CAPM: Beta is the only factor</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-purple-400 font-bold">1992-93</div>
                      <p className="text-gray-400 text-sm mt-1">Fama-French: Size & Value factors</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-pink-400 font-bold">2010s+</div>
                      <p className="text-gray-400 text-sm mt-1">Multi-factor models dominate</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-xl p-6 border-l-4 border-amber-400">
                  <div className="flex items-start gap-3">
                    <Icons.Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <h4 className="font-bold text-gray-900  mb-2">Academic Foundation</h4>
                      <p className="text-gray-700  text-sm leading-relaxed">Factor investing emerged from academic research showing that the market factor alone (beta) couldn't explain all return differences. Nobel laureates Eugene Fama and Kenneth French pioneered this field.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                    <Icons.Percent className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">The Value Factor</h2>
                    <p className="text-sm text-gray-500 ">Buying stocks on sale</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">The value factor targets stocks trading at low prices relative to their fundamental worth. Value stocks are often "unpopular" companies facing challenges, but history shows they tend to outperform over the long run.</p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50  rounded-xl p-6 border border-blue-200 ">
                    <h4 className="font-bold text-blue-800  mb-3">Value Metrics</h4>
                    <ul className="text-sm space-y-2">
                      {["Low Price-to-Earnings (P/E)", "Low Price-to-Book (P/B)", "High Dividend Yield", "Low Price-to-Cash Flow"].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700 ">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"/>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-indigo-50  rounded-xl p-6 border border-indigo-200 ">
                    <h4 className="font-bold text-indigo-800  mb-3">Historical Premium</h4>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600 ">~3-4%</div>
                      <p className="text-sm text-gray-600  mt-2">Annual value premium vs. growth (historical)</p>
                    </div>
                    <p className="text-xs text-gray-500  mt-3 text-center">Note: 2010s saw prolonged value underperformance</p>
                  </div>
                </div>

                <div className="bg-gray-50  rounded-xl p-5">
                  <h4 className="font-bold text-gray-900  mb-2">Why Value Works (Theories)</h4>
                  <p className="text-sm text-gray-600 "><strong>Risk-based:</strong> Value stocks are riskier (distressed companies), so investors demand higher returns.</p>
                  <p className="text-sm text-gray-600  mt-2"><strong>Behavioral:</strong> Investors overreact to bad news and overpay for "glamour" growth stocks.</p>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                    <Icons.Zap className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">The Momentum Factor</h2>
                    <p className="text-sm text-gray-500 ">Trends tend to continue</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">Momentum invests in recent winners and avoids recent losers. Stocks that have performed well over the past 3-12 months tend to continue outperforming. This is one of the most robust factors across markets and asset classes.</p>

                <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-xl p-6 mb-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-lg p-5">
                      <div className="text-emerald-400 font-bold mb-2">Typical Implementation</div>
                      <p className="text-gray-300 text-sm">Buy stocks with highest 12-month returns (excluding most recent month)</p>
                      <p className="text-gray-400 text-xs mt-2">Short/avoid stocks with lowest 12-month returns</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-5">
                      <div className="text-teal-400 font-bold mb-2">Historical Premium</div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-400">~5-6%</div>
                        <p className="text-gray-400 text-sm mt-1">Annual premium (historically)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-rose-50   rounded-xl p-6 border-l-4 border-red-400">
                  <h4 className="font-bold text-red-800  mb-2">⚠️ Momentum Risk: Crashes</h4>
                  <p className="text-gray-700  text-sm leading-relaxed">Momentum can experience severe crashes when trends reverse sharply (e.g., 2009 recovery). It requires careful risk management and typically higher turnover than other factors.</p>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                    <Icons.TrendingUp className="w-7 h-7 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Factor Performance Analysis</h2>
                    <p className="text-sm text-gray-500 ">Historical factor premiums</p>
                  </div>
                </div>
                
                {/* Visual: Factor Returns Chart */}
                <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl p-8 mb-6 shadow-lg">
                  <h4 className="text-white font-bold mb-4 text-center">Visual: Factor Premium Comparison</h4>
                  <Icons.FactorChart className="w-full h-56"/>
                  <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
                    <span className="text-gray-300">Factors have historically outperformed the broad market over long periods</span>
                  </div>
                </div>
                
                <p className="text-gray-700  leading-relaxed mb-6">Factor premiums have been documented across global markets and time periods. These systematic sources of return offer a rules-based approach to capturing market inefficiencies.</p>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-orange-50  rounded-xl p-5 border border-orange-200 ">
                    <h4 className="font-bold text-orange-800  mb-3">Indian Factor Indices & ETFs</h4>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="bg-orange-100  rounded-lg p-3">
                        <p className="font-medium text-orange-900  mb-1">Value</p>
                        <p className="text-orange-700  text-xs">Nifty 200 Value 30 (low P/E, P/B stocks)</p>
                      </div>
                      <div className="bg-orange-100  rounded-lg p-3">
                        <p className="font-medium text-orange-900  mb-1">Momentum</p>
                        <p className="text-orange-700  text-xs">Nifty 200 Momentum 30 (6-12 month winners)</p>
                      </div>
                      <div className="bg-orange-100  rounded-lg p-3">
                        <p className="font-medium text-orange-900  mb-1">Quality</p>
                        <p className="text-orange-700  text-xs">Nifty 200 Quality 30 (high ROE, low debt)</p>
                      </div>
                      <div className="bg-orange-100  rounded-lg p-3">
                        <p className="font-medium text-orange-900  mb-1">Alpha</p>
                        <p className="text-orange-700  text-xs">Nifty 200 Alpha 30 (mix of factors)</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50  rounded-xl p-6 border border-green-200 ">
                    <h4 className="font-bold text-green-800  mb-3">Sample Indian Factor Portfolio</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 ">Nifty 50 (Core)</span>
                        <span className="font-medium text-gray-900 ">40%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 ">Nifty 200 Quality 30</span>
                        <span className="font-medium text-gray-900 ">20%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 ">Nifty 200 Value 30</span>
                        <span className="font-medium text-gray-900 ">20%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 ">Nifty Midcap 150 Momentum 50</span>
                        <span className="font-medium text-gray-900 ">20%</span>
                      </div>
                    </div>
                    <p className="text-xs text-green-600  mt-3">Diversified factor exposure with mid-cap tilt</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-green-50   rounded-xl p-6 border-l-4 border-orange-500">
                  <h4 className="font-bold text-gray-900  mb-2">Indian Market Considerations</h4>
                  <p className="text-gray-700  text-sm leading-relaxed mb-2">Value factor in India can include cyclical sectors (metals, PSU banks) that underperform for years during growth/tech leadership. Quality factor particularly valuable given governance concerns with some mid/small-caps.</p>
                  <p className="text-gray-600  text-xs">Rebalance annually. Factor ETFs have higher expense ratios (0.5-0.75%) than plain index funds but lower than active mutual funds.</p>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                    <Icons.Box className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Size, Quality, and Other Factors</h2>
                    <p className="text-sm text-gray-500 ">Completing the factor toolkit</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold">S</div>
                      <div>
                        <h4 className="font-bold text-gray-900 ">Size (Small Cap)</h4>
                        <p className="text-sm text-gray-600  mt-1">Small companies have historically outperformed large companies. Premium has weakened in recent decades but persists internationally.</p>
                        <div className="text-xs text-amber-600  mt-2">Historical premium: ~2-3% annually</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50  rounded-xl p-5 border border-emerald-200 ">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold">Q</div>
                      <div>
                        <h4 className="font-bold text-gray-900 ">Quality</h4>
                        <p className="text-sm text-gray-600  mt-1">Companies with high profitability, stable earnings, and low debt outperform. Includes metrics like ROE, earnings stability, and leverage.</p>
                        <div className="text-xs text-emerald-600  mt-2">Recent addition to factor models, strong performance</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold">L</div>
                      <div>
                        <h4 className="font-bold text-gray-900 ">Low Volatility</h4>
                        <p className="text-sm text-gray-600  mt-1">Lower-risk stocks have historically delivered better risk-adjusted returns than theory predicts. Contradicts CAPM but has been persistent.</p>
                        <div className="text-xs text-blue-600  mt-2">Particularly effective in market downturns</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50  rounded-xl p-5 border border-purple-200 ">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold">D</div>
                      <div>
                        <h4 className="font-bold text-gray-900 ">Dividend Yield</h4>
                        <p className="text-sm text-gray-600  mt-1">High-dividend stocks provide income and have shown some excess returns. Often overlaps with value factor. Popular with income-seeking investors.</p>
                        <div className="text-xs text-purple-600  mt-2">Debates about whether it's a distinct factor</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/20">
                    <Icons.TrendingUp className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Implementing Factor Strategies</h2>
                    <p className="text-sm text-gray-500 ">Practical approaches</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50  rounded-xl p-6">
                    <h4 className="font-bold text-gray-900  mb-4">Single-Factor ETFs</h4>
                    <p className="text-sm text-gray-600  mb-3">Target one factor in isolation. Examples:</p>
                    <ul className="text-sm space-y-2">
                      <li className="flex justify-between text-gray-700 ">
                        <span>iShares MSCI USA Value</span>
                        <span className="text-gray-500">VLUE</span>
                      </li>
                      <li className="flex justify-between text-gray-700 ">
                        <span>iShares MSCI USA Momentum</span>
                        <span className="text-gray-500">MTUM</span>
                      </li>
                      <li className="flex justify-between text-gray-700 ">
                        <span>iShares MSCI USA Quality</span>
                        <span className="text-gray-500">QUAL</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-50  rounded-xl p-6">
                    <h4 className="font-bold text-gray-900  mb-4">Multi-Factor ETFs</h4>
                    <p className="text-sm text-gray-600  mb-3">Combine multiple factors for diversification:</p>
                    <ul className="text-sm space-y-2">
                      <li className="flex justify-between text-gray-700 ">
                        <span>iShares MSCI Multifactor</span>
                        <span className="text-gray-500">LRGF</span>
                      </li>
                      <li className="flex justify-between text-gray-700 ">
                        <span>Goldman Sachs ActiveBeta</span>
                        <span className="text-gray-500">GSLC</span>
                      </li>
                      <li className="flex justify-between text-gray-700 ">
                        <span>JPMorgan Diversified Return</span>
                        <span className="text-gray-500">JPUS</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-xl p-6 border-l-4 border-amber-400">
                  <div className="flex items-start gap-3">
                    <Icons.Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <h4 className="font-bold text-gray-900  mb-2">Factor Diversification</h4>
                      <p className="text-gray-700  text-sm leading-relaxed">Different factors perform well at different times. Combining value (does well in recoveries) with momentum (does well in trends) can smooth returns and reduce the chance of prolonged underperformance.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                    <Icons.Award className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Factor Investing Challenges</h2>
                    <p className="text-sm text-gray-500 ">Risks and limitations</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-red-50  rounded-xl p-5 border border-red-200 ">
                    <h4 className="font-bold text-red-800  mb-2">Extended Underperformance</h4>
                    <p className="text-sm text-gray-600 ">Factors can underperform for years or even decades. Value lagged growth for most of 2010-2020.</p>
                  </div>
                  <div className="bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                    <h4 className="font-bold text-amber-800  mb-2">Crowding Risk</h4>
                    <p className="text-sm text-gray-600 ">As more money flows into factor strategies, premiums may shrink or disappear.</p>
                  </div>
                  <div className="bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                    <h4 className="font-bold text-blue-800  mb-2">Implementation Costs</h4>
                    <p className="text-sm text-gray-600 ">Higher turnover, tracking error, and expense ratios can eat into theoretical premiums.</p>
                  </div>
                  <div className="bg-purple-50  rounded-xl p-5 border border-purple-200 ">
                    <h4 className="font-bold text-purple-800  mb-2">Behavioral Challenge</h4>
                    <p className="text-sm text-gray-600 ">Sticking with underperforming factors requires conviction. Many investors abandon ship at the worst time.</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-violet-50 to-purple-50   rounded-xl p-6 border-l-4 border-violet-500">
                  <h4 className="font-bold text-gray-900  mb-2">The Bottom Line</h4>
                  <p className="text-gray-700  text-sm leading-relaxed">Factor investing has strong academic support but requires patience, diversification across factors, and realistic expectations. Consider it a modest tilt rather than an all-or-nothing bet.</p>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-8">
                  <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/20">
                    <Icons.CheckCircle className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Knowledge Check</h2>
                    <p className="text-sm text-gray-500 ">Test your understanding of factor investing</p>
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
                                ${isSelected && !showResults ? 'border-violet-500 bg-violet-50 ' : ''}
                                ${!isSelected && !showResults ? 'border-gray-200  hover:border-gray-300 ' : ''}
                                ${showResults ? 'cursor-default' : 'cursor-pointer'}`}>
                              <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected ? 'border-violet-500 bg-violet-500 text-white' : 'border-gray-300  text-gray-500'}`}>
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
                        <div className="mt-4 p-4 bg-violet-50  rounded-lg border border-violet-200 ">
                          <p className="text-sm text-violet-800 "><strong>Explanation:</strong> {q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!showResults ? (
                  <button onClick={() => setShowResults(true)} disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                    className="mt-8 w-full py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    Check Answers
                  </button>
                ) : (
                  <div className="mt-8 p-6 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl text-center">
                    <p className="text-3xl font-bold text-white mb-2">{calculateScore()} / {quizQuestions.length}</p>
                    <p className="text-violet-100">{calculateScore() === quizQuestions.length ? "Excellent! You've mastered factor investing fundamentals." : "Review the explanations to strengthen your understanding."}</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/pc-lesson-5')} className="flex items-center gap-2 px-6 py-3 bg-gray-100  text-gray-700  rounded-xl font-medium hover:bg-gray-200  transition-colors">
              <Icons.ArrowLeft className="w-4 h-4"/><span>Previous: Tactical Asset Allocation</span>
            </button>
            <button onClick={() => navigate('/learn/pc-lesson-7')} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-200">
              <span>Next: Portfolio Optimization</span><Icons.ArrowRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PCLesson6;
