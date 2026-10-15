import React, { useState } from "react";
import StudyShell from "../../components/StudyShell";
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
  RefreshCw: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  Calendar: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  TrendingUp: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Scale: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
    </svg>
  ),
  AlertTriangle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
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
  // Portfolio Drift and Rebalancing
  RebalancingViz: ({ className = "w-full h-56" }) => (
    <svg className={className} viewBox="0 0 400 250" fill="none">
      {/* Before Rebalancing */}
      <g transform="translate(70, 80)">
        <text x="0" y="-10" fill="currentColor" fontSize="13" fontWeight="bold" textAnchor="middle">Before</text>
        <rect x="-50" y="0" width="100" height="40" fill="#5A77AA" opacity="0.7" stroke="white" strokeWidth="2" rx="4"/>
        <text x="0" y="25" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">Stocks 70%</text>
        <rect x="-50" y="50" width="60" height="40" fill="#16A34A" opacity="0.7" stroke="white" strokeWidth="2" rx="4"/>
        <text x="-20" y="75" fill="white" fontSize="13" fontWeight="bold" textAnchor="middle">Bonds</text>
        <text x="-20" y="88" fill="white" fontSize="11" textAnchor="middle">30%</text>
        <circle cx="0" cy="140" r="8" fill="#E04848" stroke="white" strokeWidth="2"/>
        <text x="0" y="160" fill="#E04848" fontSize="11" fontWeight="bold" textAnchor="middle">Off Target!</text>
      </g>
      {/* Arrow */}
      <g transform="translate(200, 105)">
        <path d="M -30 0 L 20 0 L 20 -8 L 35 0 L 20 8 L 20 0 Z" fill="#8F6FC4" opacity="0.7"/>
        <text x="2" y="-15" fill="#8F6FC4" fontSize="11" fontWeight="bold" textAnchor="middle">Rebalance</text>
      </g>
      {/* After Rebalancing */}
      <g transform="translate(330, 80)">
        <text x="0" y="-10" fill="currentColor" fontSize="13" fontWeight="bold" textAnchor="middle">After</text>
        <rect x="-50" y="0" width="80" height="40" fill="#5A77AA" opacity="0.7" stroke="white" strokeWidth="2" rx="4"/>
        <text x="-10" y="25" fill="white" fontSize="13" fontWeight="bold" textAnchor="middle">Stocks 60%</text>
        <rect x="-50" y="50" width="80" height="40" fill="#16A34A" opacity="0.7" stroke="white" strokeWidth="2" rx="4"/>
        <text x="-10" y="75" fill="white" fontSize="13" fontWeight="bold" textAnchor="middle">Bonds 40%</text>
        <circle cx="0" cy="140" r="8" fill="#16A34A" stroke="white" strokeWidth="2"/>
        <text x="0" y="160" fill="#16A34A" fontSize="11" fontWeight="bold" textAnchor="middle">On Target!</text>
      </g>
      <text x="200" y="25" fill="currentColor" opacity="0.7" fontSize="14" fontWeight="bold" textAnchor="middle">Portfolio Drift & Rebalancing</text>
    </svg>
  )
};

const PCLesson9 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  

  const quizQuestions = [
    {
      id: 1,
      question: "Why does portfolio drift occur over time?",
      options: [
        "Inflation erodes values",
        "Different assets earn different returns, changing their relative weights",
        "Brokers change allocations",
        "Tax laws require it"
      ],
      correct: 1,
      explanation: "When one asset class outperforms another, it becomes a larger portion of your portfolio. If stocks rise 20% while bonds rise 2%, stocks will naturally become a bigger percentage of your portfolio than originally intended."
    },
    {
      id: 2,
      question: "What is the main advantage of threshold-based rebalancing over calendar-based?",
      options: [
        "It's cheaper",
        "It's simpler",
        "It responds to actual portfolio drift rather than arbitrary dates",
        "Regulators prefer it"
      ],
      correct: 2,
      explanation: "Threshold-based rebalancing triggers trades only when allocations drift meaningfully from targets. This avoids unnecessary trading when drift is minimal and ensures action when drift is significant, regardless of the calendar."
    },
    {
      id: 3,
      question: "In a taxable account, which approach helps minimize tax impact when rebalancing?",
      options: [
        "Sell highest gainers first",
        "Use new contributions to buy underweighted assets instead of selling",
        "Rebalance monthly",
        "Ignore taxes when rebalancing"
      ],
      correct: 1,
      explanation: "Directing new contributions (and dividends) to underweighted assets lets you rebalance without selling winners and realizing gains. This 'cash flow rebalancing' is more tax-efficient than selling to rebalance."
    },
    {
      id: 4,
      question: "The disciplined nature of rebalancing forces investors to:",
      options: [
        "Buy high and sell low",
        "Sell winners and buy relative losers (contrarian behavior)",
        "Follow the crowd",
        "Increase risk over time"
      ],
      correct: 1,
      explanation: "Rebalancing is inherently contrarian - you sell what has gone up (winners) and buy what has gone down (relative losers) to maintain your target allocation. This disciplines you to 'buy low, sell high' systematically."
    }
  ];

  const handleQuizAnswer = (qId, aIdx) => {
    if (!showResults) {
      setQuizAnswers(prev => ({ ...prev, [qId]: aIdx }));
    }
  };

  const calculateScore = () => quizQuestions.filter(q => quizAnswers[q.id] === q.correct).length;

  return (
    <StudyShell module="PortfolioConstruction" lessonNumber={9}>
      
      <div>
        <div className="max-w-4xl mx-auto">
          
          <button onClick={() => navigate('/learn/portfolio-construction')} className="flex items-center gap-2 text-gray-500 hover:text-orange-600  transition-colors mb-8 group">
            <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
            <span className="text-sm font-medium">Back to Portfolio Construction</span>
          </button>

          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-sm bg-brand-fill">LESSON 9 OF 12</span>
              <span className="px-3 py-1.5 bg-orange-100  text-orange-700  rounded-full text-xs font-medium flex items-center gap-1.5">
                <Icons.Clock className="w-3.5 h-3.5"/>35 min read
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-gray-900 via-orange-900 to-amber-900 bg-clip-text text-transparent mb-5 leading-tight tracking-[-0.025em] brand-on-dark">Portfolio Rebalancing</h1>
            <p className="text-xl text-gray-600  leading-relaxed max-w-3xl">Learn when and how to restore your portfolio to its target allocation. Master the art of disciplined rebalancing while minimizing costs and taxes.</p>
          </header>

          <div className="space-y-12">
            
            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20 bg-brand-fill">
                      <Icons.RefreshCw className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">What is Rebalancing?</h2>
                      <p className="text-sm text-gray-500 ">Maintaining your intended allocation</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700  leading-relaxed mb-6">Rebalancing is the process of realigning your portfolio weights back to your target allocation. Over time, different asset classes earn different returns, causing your portfolio to "drift" away from its intended mix. Rebalancing restores balance.</p>

                  <div className="rounded-xl p-6 mb-6 bg-brand-fill">
                    <h4 className="text-white font-semibold mb-4 text-center">Portfolio Drift Example</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-orange-400 text-sm mb-2">Original Target</div>
                        <div className="text-white text-2xl font-bold mb-1">60/40</div>
                        <div className="text-gray-400 text-xs">Stocks / Bonds</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-amber-400 text-sm mb-2">After Strong Stocks</div>
                        <div className="text-white text-2xl font-bold mb-1">70/30</div>
                        <div className="text-gray-400 text-xs">Stocks outperformed</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-brand text-sm mb-2">After Rebalancing</div>
                        <div className="text-white text-2xl font-bold mb-1">60/40</div>
                        <div className="text-gray-400 text-xs">Back to target</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-amber-50   rounded-xl p-6 border-l-4 border-orange-500">
                    <h4 className="font-bold text-gray-900  mb-2">The Core Principle</h4>
                    <p className="text-gray-700  text-sm">Without rebalancing, a portfolio naturally becomes riskier as stocks outperform bonds over time. A 60/40 portfolio can drift to 80/20 after years of stock gains, exposing you to more risk than you intended.</p>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20 bg-brand-fill">
                      <Icons.Scale className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Why Rebalance?</h2>
                      <p className="text-sm text-gray-500 ">The benefits of discipline</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                      <h4 className="font-bold text-brand  mb-3">Risk Control</h4>
                      <p className="text-sm text-gray-700  mb-2">Without rebalancing, your portfolio's risk profile changes as markets move. A conservative investor can end up with an aggressive portfolio after a bull market.</p>
                      <div className="p-3 bg-brand-soft  rounded-lg text-xs text-brand ">
                        Keeps your risk aligned with your risk tolerance
                      </div>
                    </div>

                    <div className="bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                      <h4 className="font-bold text-blue-800  mb-3">Disciplined Contrarian</h4>
                      <p className="text-sm text-gray-700  mb-2">Rebalancing forces you to sell high (winners) and buy low (relative losers). This systematic contrarian behavior overcomes emotional trading tendencies.</p>
                      <div className="p-3 bg-blue-100  rounded-lg text-xs text-blue-700 ">
                        Removes emotion from investment decisions
                      </div>
                    </div>

                    <div className="bg-violet-50  rounded-xl p-5 border border-violet-200 ">
                      <h4 className="font-bold text-violet-800  mb-3">Return Enhancement</h4>
                      <p className="text-sm text-gray-700  mb-2">Research shows rebalancing can add 0.3-0.5% annually to returns by systematically harvesting gains and buying dips across asset classes.</p>
                      <div className="p-3 bg-violet-100  rounded-lg text-xs text-violet-700 ">
                        "Rebalancing bonus" from mean reversion
                      </div>
                    </div>

                    <div className="bg-rose-50  rounded-xl p-5 border border-rose-200 ">
                      <h4 className="font-bold text-rose-800  mb-3">Maintains Strategy</h4>
                      <p className="text-sm text-gray-700  mb-2">Your original allocation was chosen for a reason. Drift undermines the diversification and risk/return profile you carefully designed.</p>
                      <div className="p-3 bg-rose-100  rounded-lg text-xs text-rose-700 ">
                        Preserves your investment thesis
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50  rounded-xl p-6">
                    <h4 className="font-bold text-gray-900  mb-4">Rebalancing Isn't Timing</h4>
                    <p className="text-sm text-gray-700 ">Rebalancing is not market timing. You're not predicting which asset will perform best. You're simply maintaining your predetermined risk level. The discipline comes from following rules, not forecasts.</p>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20 bg-brand-fill">
                      <Icons.TrendingUp className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Rebalancing Methods</h2>
                      <p className="text-sm text-gray-500 ">Different approaches to restore balance</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-indigo-50  rounded-xl p-5 border border-indigo-200 ">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-indigo-800 ">Calendar-Based</h4>
                        <span className="px-2 py-1 bg-indigo-200  rounded text-xs font-medium text-indigo-700 ">Simple</span>
                      </div>
                      <p className="text-sm text-gray-700  mb-2">Rebalance on a fixed schedule: monthly, quarterly, or annually. Easy to implement and remember.</p>
                      <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                        <div className="p-2 bg-brand-soft  rounded text-brand ">+ Simple, predictable</div>
                        <div className="p-2 bg-rose-100  rounded text-rose-700 ">- May trade when unnecessary</div>
                      </div>
                    </div>

                    <div className="bg-violet-50  rounded-xl p-5 border border-violet-200 ">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-violet-800 ">Threshold-Based</h4>
                        <span className="px-2 py-1 bg-violet-200  rounded text-xs font-medium text-violet-700 ">Efficient</span>
                      </div>
                      <p className="text-sm text-gray-700  mb-2">Rebalance when any asset drifts beyond a threshold (e.g., 5% absolute or 25% relative). Only trades when necessary.</p>
                      <div className="bg-white  rounded-lg p-3 mt-3">
                        <p className="text-xs text-gray-600 ">Example: Target 60% stocks. Rebalance when stocks reach 65% or 55% (5% absolute threshold).</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                        <div className="p-2 bg-brand-soft  rounded text-brand ">+ More efficient, fewer trades</div>
                        <div className="p-2 bg-rose-100  rounded text-rose-700 ">- Requires monitoring</div>
                      </div>
                    </div>

                    <div className="bg-teal-50  rounded-xl p-5 border border-teal-200 ">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-teal-800 ">Cash Flow Rebalancing</h4>
                        <span className="px-2 py-1 bg-teal-200  rounded text-xs font-medium text-teal-700 ">Tax-Smart</span>
                      </div>
                      <p className="text-sm text-gray-700  mb-2">Use new contributions, dividends, and withdrawals to move toward target weights without selling. The most tax-efficient approach.</p>
                      <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                        <div className="p-2 bg-brand-soft  rounded text-brand ">+ Minimizes taxes and costs</div>
                        <div className="p-2 bg-rose-100  rounded text-rose-700 ">- May take time to correct large drifts</div>
                      </div>
                    </div>

                    <div className="bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-blue-800 ">Hybrid Approach</h4>
                        <span className="px-2 py-1 bg-blue-200  rounded text-xs font-medium text-blue-700 ">Recommended</span>
                      </div>
                      <p className="text-sm text-gray-700  mb-2">Combine methods: Use cash flows for minor adjustments, check thresholds monthly, do full rebalance annually. Best of all worlds.</p>
                      <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                        <div className="p-2 bg-brand-soft  rounded text-brand ">+ Balanced and practical</div>
                        <div className="p-2 bg-rose-100  rounded text-rose-700 ">- Slightly more complex</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20 bg-brand-fill">
                      <Icons.RefreshCw className="w-7 h-7 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Rebalancing in Practice</h2>
                      <p className="text-sm text-gray-500 ">Maintaining your target allocation</p>
                    </div>
                  </div>
                  
                  {/* Visual: Rebalancing Process */}
                  <div className="bg-gradient-to-br from-gray-900 to-violet-950 rounded-2xl p-8 mb-6 shadow-lg brand-on-dark">
                    <h4 className="text-white font-bold mb-4 text-center">Visual: Rebalancing Process</h4>
                    <Icons.RebalancingViz className="w-full h-56"/>
                    <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
                      <span className="text-gray-300">Rebalancing sells winners and buys losers to maintain risk targets</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700  leading-relaxed mb-6">Over time, market movements cause portfolio allocations to drift from targets. Systematic rebalancing maintains your desired risk-return profile and forces disciplined "buy low, sell high" behavior.</p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-orange-50  rounded-xl p-6 border border-orange-200 ">
                      <h4 className="font-bold text-orange-800  mb-3">Indian Tax-Aware Rebalancing</h4>
                      <div className="space-y-3 text-sm">
                        <div className="bg-orange-100  rounded-lg p-3">
                          <p className="font-medium text-orange-900  mb-1">Equity (&gt;1 year hold)</p>
                          <p className="text-orange-700  text-xs">LTCG: 12.5% after ₹1.25L exempt per year</p>
                        </div>
                        <div className="bg-orange-100  rounded-lg p-3">
                          <p className="font-medium text-orange-900  mb-1">Equity (&lt;1 year hold)</p>
                          <p className="text-orange-700  text-xs">STCG: 20% - significant tax cost</p>
                        </div>
                        <div className="bg-orange-100  rounded-lg p-3">
                          <p className="font-medium text-orange-900  mb-1">Debt Funds</p>
                          <p className="text-orange-700  text-xs">At slab rate regardless of holding period</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-brand-soft  rounded-xl p-6 border border-brand-line ">
                      <h4 className="font-bold text-brand  mb-3">Optimal Strategy</h4>
                      <ul className="space-y-2 text-sm text-gray-600 ">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-brand-fill rounded-full mt-1.5 flex-shrink-0"/>
                          <span><strong className="text-gray-900 ">Wait for LTCG:</strong> If equity position is profitable but &lt;1 year old, wait to rebalance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-brand-fill rounded-full mt-1.5 flex-shrink-0"/>
                          <span><strong className="text-gray-900 ">Use SIP:</strong> Systematic Investment Plans for new money automatically rebalance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-brand-fill rounded-full mt-1.5 flex-shrink-0"/>
                          <span><strong className="text-gray-900 ">March planning:</strong> Harvest LTCG up to ₹1.25L exemption before year-end</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-brand-fill rounded-full mt-1.5 flex-shrink-0"/>
                          <span><strong className="text-gray-900 ">Annual cadence:</strong> Once-yearly rebalancing works well with tax considerations</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-green-50   rounded-xl p-6 border-l-4 border-orange-500">
                    <h4 className="font-bold text-gray-900  mb-2">Example: Indian Rebalancing in Action</h4>
                    <p className="text-gray-700  text-sm leading-relaxed mb-2">Portfolio: 70% equity target. After strong market, equity is 80% (₹8L out of ₹10L total).</p>
                    <p className="text-gray-700  text-sm leading-relaxed mb-2"><strong>Bad approach:</strong> Sell ₹1L equity immediately (triggers STCG tax if held &lt;1 year).</p>
                    <p className="text-gray-700  text-sm leading-relaxed"><strong>Smart approach:</strong> 1) Direct new SIP contributions to debt, 2) Sell LTCG holdings if needed, 3) Wait for recent equity purchases to complete 1 year.</p>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20 bg-brand-fill">
                      <Icons.Calendar className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Timing and Frequency</h2>
                      <p className="text-sm text-gray-500 ">How often should you rebalance?</p>
                    </div>
                  </div>

                  <p className="text-gray-700  leading-relaxed mb-6">Research on optimal rebalancing frequency shows diminishing returns from more frequent rebalancing. Trading costs and taxes often outweigh the benefits of frequent adjustment.</p>

                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 ">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 ">Frequency</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 ">Pros</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 ">Cons</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 ">Best For</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { freq: "Monthly", pros: "Tight control", cons: "High costs, tax drag", best: "Tax-advantaged accounts only" },
                          { freq: "Quarterly", pros: "Good balance", cons: "Some costs", best: "Active investors" },
                          { freq: "Semi-Annual", pros: "Low costs", cons: "More drift allowed", best: "Balanced approach" },
                          { freq: "Annual", pros: "Minimal costs", cons: "Significant drift possible", best: "Hands-off investors" }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-gray-100 ">
                            <td className="py-3 px-4 font-medium text-gray-900 ">{row.freq}</td>
                            <td className="py-3 px-4 text-center text-brand  text-xs">{row.pros}</td>
                            <td className="py-3 px-4 text-center text-rose-600  text-xs">{row.cons}</td>
                            <td className="py-3 px-4 text-center text-gray-600  text-xs">{row.best}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50   rounded-xl p-5 border border-cyan-200 ">
                      <h4 className="font-bold text-gray-900  mb-3">Recommended Approach</h4>
                      <ul className="text-sm text-gray-700  space-y-2">
                        <li className="flex items-start gap-2"><Icons.CheckCircle className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0"/>Check allocations quarterly or when making contributions</li>
                        <li className="flex items-start gap-2"><Icons.CheckCircle className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0"/>Use 5% threshold for action in taxable accounts</li>
                        <li className="flex items-start gap-2"><Icons.CheckCircle className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0"/>Rebalance in tax-advantaged accounts first</li>
                        <li className="flex items-start gap-2"><Icons.CheckCircle className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0"/>Do comprehensive review annually</li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50   rounded-xl p-5 border border-amber-200 ">
                      <h4 className="font-bold text-gray-900  mb-3">Key Research Finding</h4>
                      <p className="text-sm text-gray-700 ">Studies show annual or semi-annual rebalancing performs similarly to monthly rebalancing on a risk-adjusted basis, but with significantly lower costs and tax impact.</p>
                      <div className="mt-3 p-3 bg-amber-100  rounded-lg">
                        <p className="text-xs text-amber-700  font-medium">Don't over-optimize frequency. Simplicity often wins.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20 bg-brand-fill">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Tax-Smart Rebalancing</h2>
                      <p className="text-sm text-gray-500 ">Minimize the tax impact</p>
                    </div>
                  </div>

                  <p className="text-gray-700  leading-relaxed mb-6">In taxable accounts, selling winners to rebalance triggers capital gains taxes. Smart rebalancing minimizes this drag while still maintaining your target allocation.</p>

                  <div className="space-y-4 mb-6">
                    <div className="bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                      <h4 className="font-bold text-brand  mb-2">Priority 1: Tax-Advantaged Accounts First</h4>
                      <p className="text-sm text-gray-700 ">Do most rebalancing in IRAs and 401(k)s where there are no tax consequences. Keep taxable accounts stable when possible.</p>
                    </div>

                    <div className="bg-teal-50  rounded-xl p-5 border border-teal-200 ">
                      <h4 className="font-bold text-teal-800  mb-2">Priority 2: Use Cash Flows</h4>
                      <p className="text-sm text-gray-700 ">Direct new contributions, dividends, and required withdrawals to move toward targets without selling. This is "free" rebalancing with no tax impact.</p>
                    </div>

                    <div className="bg-cyan-50  rounded-xl p-5 border border-cyan-200 ">
                      <h4 className="font-bold text-cyan-800  mb-2">Priority 3: Tax-Loss Harvesting</h4>
                      <p className="text-sm text-gray-700 ">If you have losers, sell them to rebalance. Losses offset gains and can reduce taxes. Combine rebalancing with tax-loss harvesting for double benefit.</p>
                    </div>

                    <div className="bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                      <h4 className="font-bold text-blue-800  mb-2">Priority 4: Consider Lot Selection</h4>
                      <p className="text-sm text-gray-700 ">When you must sell, choose specific lots with highest cost basis (lowest gain) or longest holding period (long-term rate). This minimizes tax impact.</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-xl p-6 border-l-4 border-amber-400">
                    <h4 className="font-bold text-gray-900  mb-2 flex items-center gap-2">
                      <Icons.AlertTriangle className="w-5 h-5 text-amber-500"/> Asset Location Matters
                    </h4>
                    <p className="text-gray-700  text-sm">Proper asset location (which assets go in which accounts) makes rebalancing easier. Put tax-inefficient assets (bonds, REITs) in tax-advantaged accounts, tax-efficient assets (stock index funds) in taxable. We'll cover this in the next lesson.</p>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-8">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20 bg-brand-fill">
                      <Icons.CheckCircle className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Knowledge Check</h2>
                      <p className="text-sm text-gray-500 ">Test your understanding of rebalancing</p>
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
                          <div className="mt-4 p-4 bg-amber-50  rounded-lg border border-amber-200 ">
                            <p className="text-sm text-amber-800 "><strong>Explanation:</strong> {q.explanation}</p>
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
                      <p className="text-orange-100">{calculateScore() === quizQuestions.length ? "Excellent! You understand the discipline of rebalancing." : "Review the explanations to master rebalancing strategies."}</p>
                    </div>
                  )}
                </div>
              </section>
          </div>

          <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/pc-lesson-8')} className="flex items-center gap-2 px-6 py-3 bg-gray-100  text-gray-700  rounded-xl font-medium hover:bg-gray-200  transition-colors">
              <Icons.ArrowLeft className="w-4 h-4"/><span>Previous Lesson</span>
            </button>
            <button onClick={() => navigate('/learn/pc-lesson-10')} className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 bg-brand-fill">
              <span>Next: Tax Efficiency</span><Icons.ArrowRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </div>
    </StudyShell>
  );
};

export default PCLesson9;
