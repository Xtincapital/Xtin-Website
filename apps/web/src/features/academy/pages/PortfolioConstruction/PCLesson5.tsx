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
  Zap: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  TrendingUp: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  TrendingDown: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
    </svg>
  ),
  AlertTriangle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Eye: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  BarChart: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20V10M6 20V4M18 20v-6"/>
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
  // Market Cycle Diagram
  MarketCycle: ({ className = "w-full h-64" }) => (
    <svg className={className} viewBox="0 0 400 300" fill="none">
      <defs>
        <linearGradient id="cycleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#16A34A" stopOpacity="0.3"/>
          <stop offset="25%" stopColor="#5A77AA" stopOpacity="0.3"/>
          <stop offset="50%" stopColor="#E04848" stopOpacity="0.3"/>
          <stop offset="75%" stopColor="#B8923F" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#16A34A" stopOpacity="0.3"/>
        </linearGradient>
      </defs>
      {/* Sine wave representing market cycle */}
      <path d="M 40 150 Q 90 80 140 150 T 240 150 T 340 150" stroke="#5A77AA" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M 40 150 Q 90 80 140 150 T 240 150 T 340 150 L 340 280 L 40 280 Z" fill="url(#cycleGrad)"/>
      {/* Center equilibrium line */}
      <line x1="40" y1="150" x2="360" y2="150" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5,5" opacity="0.3"/>
      {/* Phase markers */}
      <g transform="translate(70, 70)">
        <circle r="25" fill="#16A34A" opacity="0.2" stroke="#16A34A" strokeWidth="2"/>
        <text y="5" fill="#16A34A" fontSize="11" fontWeight="bold" textAnchor="middle">Recovery</text>
      </g>
      <g transform="translate(170, 190)">
        <circle r="25" fill="#E04848" opacity="0.2" stroke="#E04848" strokeWidth="2"/>
        <text y="5" fill="#E04848" fontSize="11" fontWeight="bold" textAnchor="middle">Downturn</text>
      </g>
      <g transform="translate(270, 70)">
        <circle r="25" fill="#B8923F" opacity="0.2" stroke="#B8923F" strokeWidth="2"/>
        <text y="5" fill="#B8923F" fontSize="11" fontWeight="bold" textAnchor="middle">Peak</text>
      </g>
      {/* Strategy arrows */}
      <text x="70" y="45" fill="#16A34A" fontSize="10" fontWeight="bold" textAnchor="middle">↑ Add Risk</text>
      <text x="270" y="45" fill="#E04848" fontSize="10" fontWeight="bold" textAnchor="middle">↓ Reduce Risk</text>
      {/* Labels */}
      <text x="200" y="25" fill="currentColor" opacity="0.7" fontSize="14" fontWeight="bold" textAnchor="middle">Economic/Market Cycle</text>
      <text x="200" y="295" fill="currentColor" opacity="0.6" fontSize="12" textAnchor="middle">Time →</text>
    </svg>
  )
};

const PCLesson5 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const quizQuestions = [
    {
      id: 1,
      question: "What is the main difference between Strategic and Tactical Asset Allocation?",
      options: [
        "SAA is for wealthy investors, TAA is for everyone",
        "SAA is long-term policy, TAA involves short-term deviations based on opportunities",
        "TAA eliminates all risk, SAA does not",
        "There is no meaningful difference"
      ],
      correct: 1,
      explanation: "Strategic allocation sets long-term targets (the policy portfolio), while Tactical allocation temporarily deviates from those targets to exploit perceived short-term opportunities or risks."
    },
    {
      id: 2,
      question: "Why do most individual investors fail at market timing?",
      options: [
        "They don't have enough money",
        "They buy high (after rallies) and sell low (after crashes) due to emotions",
        "The market is completely random",
        "Timing is impossible for anyone"
      ],
      correct: 1,
      explanation: "Behavioral biases cause investors to chase performance (buying after gains) and panic sell (after losses). Studies show average investor returns lag fund returns significantly due to poor timing."
    },
    {
      id: 3,
      question: "What is a common TAA signal based on valuations?",
      options: [
        "Always buy when prices are high",
        "The CAPE (Cyclically Adjusted P/E) ratio compared to historical averages",
        "Random number generators",
        "Social media sentiment only"
      ],
      correct: 1,
      explanation: "CAPE compares current prices to 10-year average earnings, smoothing business cycles. Historically high CAPE has predicted lower future returns, though timing based on it alone is difficult."
    },
    {
      id: 4,
      question: "A reasonable constraint for TAA tilts might be:",
      options: [
        "No constraints, go all-in on timing bets",
        "Limit deviations to ±5-10% from strategic targets",
        "Only make changes once per decade",
        "Follow whatever social media says"
      ],
      correct: 1,
      explanation: "Limiting tactical tilts to modest deviations (e.g., ±5-10%) prevents catastrophic timing errors while still allowing opportunistic adjustments. Many advisors set strict bands around SAA targets."
    }
  ];

  const handleQuizAnswer = (qId, aIdx) => {
    if (!showResults) {
      setQuizAnswers(prev => ({ ...prev, [qId]: aIdx }));
    }
  };

  const calculateScore = () => quizQuestions.filter(q => quizAnswers[q.id] === q.correct).length;

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-orange-50/30    text-gray-900  min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          <button onClick={() => navigate('/learn/portfolio-construction')} className="flex items-center gap-2 text-gray-500 hover:text-orange-600  transition-colors mb-8 group">
            <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
            <span className="text-sm font-medium">Back to Portfolio Construction</span>
          </button>

          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-sm bg-brand-fill">LESSON 5 OF 12</span>
              <span className="px-3 py-1.5 bg-orange-100  text-orange-700  rounded-full text-xs font-medium flex items-center gap-1.5">
                <Icons.Clock className="w-3.5 h-3.5"/>35 min read
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-gray-900 via-orange-900 to-amber-900 bg-clip-text text-transparent mb-5 leading-tight tracking-[-0.025em] brand-on-dark">Tactical Asset Allocation</h1>
            <p className="text-xl text-gray-600  leading-relaxed max-w-3xl">Explore the art and science of short-term portfolio adjustments. Learn when tactical moves make sense, the dangers of market timing, and disciplined approaches to dynamic allocation.</p>
          </header>

          <div className="space-y-12">
            
            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20 bg-brand-fill">
                    <Icons.Zap className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Strategic vs. Tactical Allocation</h2>
                    <p className="text-sm text-gray-500 ">Policy meets opportunity</p>
                  </div>
                </div>
                
                <p className="text-gray-700  leading-relaxed mb-6">While Strategic Asset Allocation (SAA) sets your long-term targets, Tactical Asset Allocation (TAA) involves <strong className="text-gray-900 ">temporary, deliberate deviations</strong> from those targets to exploit perceived market opportunities or manage emerging risks.</p>
                
                <div className="rounded-xl p-8 mb-6 bg-brand-fill">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-lg p-5">
                      <div className="text-orange-400 font-bold text-lg mb-3">Strategic (SAA)</div>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li>• Long-term targets (5-30+ years)</li>
                        <li>• Based on risk tolerance & goals</li>
                        <li>• Rarely changes</li>
                        <li>• "Policy portfolio"</li>
                      </ul>
                    </div>
                    <div className="bg-white/5 rounded-lg p-5">
                      <div className="text-amber-400 font-bold text-lg mb-3">Tactical (TAA)</div>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li>• Short-term tilts (weeks to months)</li>
                        <li>• Based on market conditions</li>
                        <li>• Frequent adjustments</li>
                        <li>• "Active overlay"</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-xl p-6 border-l-4 border-amber-400">
                  <div className="flex items-start gap-3">
                    <Icons.Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <h4 className="font-bold text-gray-900  mb-2">The 90/10 Reality</h4>
                      <p className="text-gray-700  text-sm leading-relaxed">Most evidence suggests SAA drives ~90% of portfolio performance. TAA is the "seasoning," not the main course. Always maintain a solid strategic foundation before considering tactical adjustments.</p>
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
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">The Market Timing Trap</h2>
                    <p className="text-sm text-gray-500 ">Why most investors fail at timing</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">Market timing sounds appealing—buy before rallies, sell before crashes. In practice, it's extraordinarily difficult. Studies consistently show individual investors destroy wealth through poor timing decisions.</p>

                <div className="bg-red-50  rounded-xl p-6 border border-red-200  mb-6">
                  <h4 className="font-bold text-red-800  mb-4">The Behavioral Gap</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900  mb-2">9.9%</div>
                      <div className="text-sm text-gray-600 ">S&P 500 Average Annual Return</div>
                      <div className="text-xs text-gray-500 mt-1">(1992-2021)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-red-600  mb-2">4.3%</div>
                      <div className="text-sm text-gray-600 ">Average Investor Return</div>
                      <div className="text-xs text-gray-500 mt-1">(Same period, Dalbar study)</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-sm text-red-700 ">
                    The gap? Buying high after rallies and selling low after crashes.
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50  rounded-xl p-5">
                    <h4 className="font-bold text-gray-900  mb-3">Why Timing Fails</h4>
                    <ul className="text-sm space-y-2">
                      {["Must be right twice (exit AND re-entry)", "Best days often follow worst days", "Emotional decisions override logic", "Transaction costs and taxes compound"].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 ">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"/>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-50  rounded-xl p-5">
                    <h4 className="font-bold text-gray-900  mb-3">Missing the Best Days</h4>
                    <p className="text-sm text-gray-600  mb-2">$10,000 invested in S&P 500 (1993-2022):</p>
                    <ul className="text-sm space-y-1">
                      <li className="flex justify-between"><span>Stayed invested:</span><span className="font-bold text-brand ">$199,000</span></li>
                      <li className="flex justify-between"><span>Missed 10 best days:</span><span className="font-bold text-amber-600 ">$91,000</span></li>
                      <li className="flex justify-between"><span>Missed 30 best days:</span><span className="font-bold text-red-600 ">$30,000</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 bg-brand-fill">
                    <Icons.TrendingUp className="w-7 h-7 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Market Cycle Analysis</h2>
                    <p className="text-sm text-gray-500 ">Understanding economic phases</p>
                  </div>
                </div>
                
                {/* Visual: Market Cycle */}
                <div className="bg-gradient-to-br from-gray-900 to-purple-950 rounded-2xl p-8 mb-6 shadow-lg brand-on-dark">
                  <h4 className="text-white font-bold mb-4 text-center">Visual: Economic & Market Cycles</h4>
                  <Icons.MarketCycle className="w-full h-64"/>
                  <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-brand-fill"></div>
                      <span className="text-gray-300">Recovery Phase - Increase Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-gray-300">Downturn Phase - Reduce Risk</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700  leading-relaxed mb-6">Markets move in cycles driven by economic conditions, sentiment, and policy. Understanding these patterns can help optimize tactical allocation decisions across different market environments.</p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-orange-50  rounded-xl p-6 border border-orange-200 ">
                    <h4 className="font-bold text-orange-800  mb-3">India-Specific Signals</h4>
                    <ul className="space-y-2 text-sm text-gray-600 ">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"/>
                        <span><strong className="text-gray-900 ">Nifty P/E ratio:</strong> Historical avg ~22x; above 25x = expensive</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"/>
                        <span><strong className="text-gray-900 ">FII flows:</strong> Sustained outflows often precede corrections</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"/>
                        <span><strong className="text-gray-900 ">Credit growth:</strong> Bank lending acceleration signals economic strength</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"/>
                        <span><strong className="text-gray-900 ">Monsoon forecast:</strong> Affects rural demand, agriculture stocks</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-brand-soft  rounded-xl p-6 border border-brand-line ">
                    <h4 className="font-bold text-brand  mb-3">Sector Rotation Strategy</h4>
                    <p className="text-sm text-gray-600  mb-3">Indian markets show strong sector rotation patterns. Example tactical tilts:</p>
                    <div className="space-y-2 text-xs">
                      <div className="bg-brand-soft  rounded-lg p-2">
                        <span className="font-medium text-brand ">Rate cut cycle:</span>
                        <span className="text-brand  ml-1">Overweight banks, real estate</span>
                      </div>
                      <div className="bg-brand-soft  rounded-lg p-2">
                        <span className="font-medium text-brand ">Rupee weakness:</span>
                        <span className="text-brand  ml-1">Favor IT, pharma exporters</span>
                      </div>
                      <div className="bg-brand-soft  rounded-lg p-2">
                        <span className="font-medium text-brand ">Pre-election:</span>
                        <span className="text-brand  ml-1">Infrastructure, PSU stocks gain</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-green-50   rounded-xl p-6 border-l-4 border-orange-500">
                  <h4 className="font-bold text-gray-900  mb-2">⚠️ India TAA Caveat</h4>
                  <p className="text-gray-700  text-sm leading-relaxed">The Indian market has defied valuation logic multiple times (2014-17 rally despite high valuations, 2020 COVID recovery). Keep tactical adjustments modest (±10% from SAA targets) and systematic. Emotional reactions to headlines often backfire.</p>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20 bg-brand-fill">
                    <Icons.Eye className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">TAA Signals and Indicators</h2>
                    <p className="text-sm text-gray-500 ">What professionals monitor</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">While timing is difficult, certain indicators have shown some predictive power over longer horizons. These signals inform—but shouldn't dictate—tactical decisions.</p>

                <div className="space-y-4 mb-6">
                  <div className="bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                    <h4 className="font-bold text-brand  mb-2">Valuation Metrics</h4>
                    <p className="text-sm text-gray-600  mb-2">CAPE ratio, Price-to-Book, Earnings Yield vs. Bond Yield</p>
                    <div className="text-xs text-brand ">Useful over 7-10 year horizons, poor for short-term timing</div>
                  </div>
                  <div className="bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                    <h4 className="font-bold text-blue-800  mb-2">Economic Indicators</h4>
                    <p className="text-sm text-gray-600  mb-2">Yield curve, Leading Economic Index, Unemployment trends</p>
                    <div className="text-xs text-blue-600 ">Recession signals have worked historically, but with variable lead times</div>
                  </div>
                  <div className="bg-purple-50  rounded-xl p-5 border border-purple-200 ">
                    <h4 className="font-bold text-purple-800  mb-2">Technical / Momentum</h4>
                    <p className="text-sm text-gray-600  mb-2">Moving averages, trend following, relative strength</p>
                    <div className="text-xs text-purple-600 ">Can reduce worst-case drawdowns but may underperform in bull markets</div>
                  </div>
                  <div className="bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                    <h4 className="font-bold text-amber-800  mb-2">Sentiment Indicators</h4>
                    <p className="text-sm text-gray-600  mb-2">VIX (fear gauge), put/call ratios, investor surveys</p>
                    <div className="text-xs text-amber-600 ">Contrarian signals: extreme fear = potential opportunity</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-xl p-6 border-l-4 border-amber-400">
                  <div className="flex items-start gap-3">
                    <Icons.Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <h4 className="font-bold text-gray-900  mb-2">Signal Humility</h4>
                      <p className="text-gray-700  text-sm leading-relaxed">No indicator works all the time. Markets can stay "expensive" or "cheap" for years. Use signals as inputs to probabilistic thinking, not as trading rules.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20 bg-brand-fill">
                    <Icons.BarChart className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Disciplined TAA Framework</h2>
                    <p className="text-sm text-gray-500 ">Rules-based tactical adjustments</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">If you pursue TAA, do so with discipline. Set rules in advance, define position limits, and stick to your process regardless of emotions.</p>

                <div className="rounded-xl p-6 mb-6 bg-brand-fill">
                  <h4 className="text-white font-semibold mb-4 text-center">TAA Guardrails</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-cyan-400 font-bold text-xl mb-2">±5-10%</div>
                      <div className="text-gray-300 text-sm">Maximum tactical deviation</div>
                      <div className="text-gray-500 text-xs mt-1">from strategic targets</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-blue-400 font-bold text-xl mb-2">2-4</div>
                      <div className="text-gray-300 text-sm">Signals for action</div>
                      <div className="text-gray-500 text-xs mt-1">Multiple confirmations</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-indigo-400 font-bold text-xl mb-2">6-18mo</div>
                      <div className="text-gray-300 text-sm">Typical holding period</div>
                      <div className="text-gray-500 text-xs mt-1">for tactical positions</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50  rounded-xl p-6">
                  <h4 className="font-bold text-gray-900  mb-4">Example TAA Rules</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white  rounded-lg">
                      <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</span>
                      <p className="text-sm text-gray-700 ">Reduce equity allocation by 5% when CAPE exceeds 30 AND yield curve inverts</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white  rounded-lg">
                      <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</span>
                      <p className="text-sm text-gray-700 ">Increase equity allocation by 5% after 20%+ market decline with VIX &gt; 35</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white  rounded-lg">
                      <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</span>
                      <p className="text-sm text-gray-700 ">Review and reset positions back to SAA if conditions normalize within 18 months</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20 bg-brand-fill">
                    <Icons.TrendingUp className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">When TAA Might Make Sense</h2>
                    <p className="text-sm text-gray-500 ">Appropriate applications</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                    <h4 className="font-bold text-brand  mb-3 flex items-center gap-2">
                      <Icons.CheckCircle className="w-5 h-5"/>Good TAA Candidates
                    </h4>
                    <ul className="text-sm space-y-2 text-gray-700 ">
                      <li>• Extreme valuations (very high/low)</li>
                      <li>• Clear recession signals</li>
                      <li>• Crisis-level market panic</li>
                      <li>• Major policy regime shifts</li>
                    </ul>
                  </div>
                  <div className="bg-red-50  rounded-xl p-5 border border-red-200 ">
                    <h4 className="font-bold text-red-800  mb-3 flex items-center gap-2">
                      <Icons.XCircle className="w-5 h-5"/>Poor TAA Applications
                    </h4>
                    <ul className="text-sm space-y-2 text-gray-700 ">
                      <li>• Reacting to daily news headlines</li>
                      <li>• Following hot tips or predictions</li>
                      <li>• Trading on emotion after losses</li>
                      <li>• Frequent portfolio churning</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-violet-50 to-purple-50   rounded-xl p-6 border-l-4 border-violet-500">
                  <h4 className="font-bold text-gray-900  mb-2">The Verdict on TAA</h4>
                  <p className="text-gray-700  text-sm leading-relaxed">For most investors, a strict strategic approach with disciplined rebalancing outperforms attempted tactical timing. If you do pursue TAA, keep positions modest, use rules-based approaches, and never abandon your strategic foundation entirely.</p>
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
                    <p className="text-sm text-gray-500 ">Test your understanding of tactical allocation</p>
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
                                ${isSelected && !showResults ? 'border-orange-500 bg-orange-50 ' : ''}
                                ${!isSelected && !showResults ? 'border-gray-200  hover:border-gray-300 ' : ''}
                                ${showResults ? 'cursor-default' : 'cursor-pointer'}`}>
                              <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-300  text-gray-500'}`}>
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
                        <div className="mt-4 p-4 bg-orange-50  rounded-lg border border-orange-200 ">
                          <p className="text-sm text-orange-800 "><strong>Explanation:</strong> {q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!showResults ? (
                  <button onClick={() => setShowResults(true)} disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                    className="mt-8 w-full py-4 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-brand-fill">
                    Check Answers
                  </button>
                ) : (
                  <div className="mt-8 p-6 rounded-xl text-center bg-brand-fill">
                    <p className="text-3xl font-bold text-white mb-2">{calculateScore()} / {quizQuestions.length}</p>
                    <p className="text-orange-100">{calculateScore() === quizQuestions.length ? "Great work! You understand tactical allocation and its pitfalls." : "Review the explanations to strengthen your understanding."}</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/pc-lesson-4')} className="flex items-center gap-2 px-6 py-3 bg-gray-100  text-gray-700  rounded-xl font-medium hover:bg-gray-200  transition-colors">
              <Icons.ArrowLeft className="w-4 h-4"/><span>Previous: Strategic Asset Allocation</span>
            </button>
            <button onClick={() => navigate('/learn/pc-lesson-6')} className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 bg-brand-fill">
              <span>Next: Factor Investing</span><Icons.ArrowRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PCLesson5;
