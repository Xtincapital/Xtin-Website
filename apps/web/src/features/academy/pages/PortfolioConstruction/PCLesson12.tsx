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
  Eye: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  TrendingUp: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  FileText: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Award: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
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
  // Performance Dashboard
  PerformanceDashboard: ({ className = "w-full h-64" }) => (
    <svg className={className} viewBox="0 0 400 300" fill="none">
      {/* Metric cards */}
      <g>
        {/* Total Return */}
        <rect x="20" y="40" width="110" height="70" fill="#1FA978" opacity="0.2" stroke="#1FA978" strokeWidth="2" rx="8"/>
        <text x="75" y="60" fill="currentColor" fontSize="11" fontWeight="bold" textAnchor="middle">Total Return</text>
        <text x="75" y="85" fill="#1FA978" fontSize="24" fontWeight="bold" textAnchor="middle">+12.5%</text>
        <text x="75" y="103" fill="currentColor" fontSize="10" opacity="0.6" textAnchor="middle">YTD</text>
        {/* Sharpe Ratio */}
        <rect x="145" y="40" width="110" height="70" fill="#5A77AA" opacity="0.2" stroke="#5A77AA" strokeWidth="2" rx="8"/>
        <text x="200" y="60" fill="currentColor" fontSize="11" fontWeight="bold" textAnchor="middle">Sharpe Ratio</text>
        <text x="200" y="85" fill="#5A77AA" fontSize="24" fontWeight="bold" textAnchor="middle">1.45</text>
        <text x="200" y="103" fill="currentColor" fontSize="10" opacity="0.6" textAnchor="middle">Risk-Adj.</text>
        {/* Max Drawdown */}
        <rect x="270" y="40" width="110" height="70" fill="#E04848" opacity="0.2" stroke="#E04848" strokeWidth="2" rx="8"/>
        <text x="325" y="60" fill="currentColor" fontSize="11" fontWeight="bold" textAnchor="middle">Max Drawdown</text>
        <text x="325" y="85" fill="#E04848" fontSize="24" fontWeight="bold" textAnchor="middle">-15.2%</text>
        <text x="325" y="103" fill="currentColor" fontSize="10" opacity="0.6" textAnchor="middle">Worst Loss</text>
      </g>
      {/* Performance vs Benchmark chart */}
      <g transform="translate(0, 130)">
        <rect x="20" y="0" width="360" height="140" fill="#232327" opacity="0.3" stroke="currentColor" strokeWidth="1" rx="8"/>
        <text x="200" y="20" fill="currentColor" fontSize="12" fontWeight="bold" textAnchor="middle">Portfolio vs Benchmark</text>
        {/* Simple line chart */}
        <path d="M 40 120 L 80 100 L 120 85 L 160 95 L 200 70 L 240 65 L 280 55 L 320 50 L 360 45" stroke="#1FA978" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M 40 120 L 80 105 L 120 95 L 160 100 L 200 85 L 240 80 L 280 75 L 320 72 L 360 70" stroke="#A3A1A6" strokeWidth="2" fill="none" strokeDasharray="4,4"/>
        <circle cx="360" cy="45" r="4" fill="#1FA978" stroke="white" strokeWidth="2"/>
        <circle cx="360" cy="70" r="4" fill="#A3A1A6" stroke="white" strokeWidth="2"/>
        <text x="340" y="40" fill="#1FA978" fontSize="10" fontWeight="bold" textAnchor="end">Portfolio</text>
        <text x="340" y="68" fill="#A3A1A6" fontSize="10" textAnchor="end">Benchmark</text>
      </g>
      <text x="200" y="25" fill="currentColor" opacity="0.7" fontSize="14" fontWeight="bold" textAnchor="middle">Performance Monitoring Dashboard</text>
    </svg>
  )
};

const PCLesson12 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  

  const quizQuestions = [
    {
      id: 1,
      question: "Why is time-weighted return (TWR) preferred over money-weighted return for evaluating managers?",
      options: [
        "TWR is always higher",
        "TWR isolates investment performance from cash flow timing decisions",
        "Money-weighted is too complicated",
        "TWR is required by law"
      ],
      correct: 1,
      explanation: "Time-weighted return removes the impact of deposits and withdrawals, showing pure investment performance. Since you (not the manager) control cash flow timing, TWR fairly evaluates manager skill. Money-weighted return is better for assessing your personal wealth accumulation."
    },
    {
      id: 2,
      question: "What is the primary purpose of using a benchmark?",
      options: [
        "To always beat the market",
        "To provide a relevant comparison point for evaluating portfolio performance",
        "To predict future returns",
        "To impress clients"
      ],
      correct: 1,
      explanation: "A benchmark provides context for returns. Did your portfolio do well because of your decisions, or just because markets rose? A good benchmark matches your portfolio's risk and asset allocation, giving you a fair comparison to judge your strategy."
    },
    {
      id: 3,
      question: "How often should you conduct a comprehensive portfolio review?",
      options: [
        "Daily",
        "Weekly",
        "Annually, plus after major life events or market changes",
        "Only when performance is bad"
      ],
      correct: 2,
      explanation: "Annual reviews ensure your strategy remains aligned with your goals and circumstances. Additionally, review after major life events (marriage, retirement, inheritance) or significant market changes that might require strategy adjustment."
    },
    {
      id: 4,
      question: "What is the danger of checking portfolio performance too frequently?",
      options: [
        "It uses too much electricity",
        "It leads to emotional reactions and potentially harmful trading decisions",
        "Returns will be lower",
        "It's not actually dangerous"
      ],
      correct: 1,
      explanation: "Frequent checking exposes you to short-term volatility that's mostly noise. This can trigger emotional reactions (fear, greed) leading to poor decisions like panic-selling or chasing performance. Long-term investors benefit from less frequent monitoring."
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
              <span className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white text-xs font-bold rounded-full shadow-sm">LESSON 12 OF 12</span>
              <span className="px-3 py-1.5 bg-indigo-100  text-indigo-700  rounded-full text-xs font-medium flex items-center gap-1.5">
                <Icons.Clock className="w-3.5 h-3.5"/>35 min read
              </span>
              <span className="px-3 py-1.5 bg-emerald-100  text-emerald-700  rounded-full text-xs font-bold">FINAL LESSON</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-normal bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900    bg-clip-text text-transparent mb-5 leading-tight tracking-[-0.015em]">Portfolio Monitoring</h1>
            <p className="text-xl text-gray-600  leading-relaxed max-w-3xl">Complete your portfolio management journey by learning how to track performance, benchmark effectively, and conduct meaningful reviews. Build the discipline of long-term stewardship.</p>
          </header>

          <div className="space-y-12">
            
            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                      <Icons.Eye className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">The Discipline of Monitoring</h2>
                      <p className="text-sm text-gray-500 ">Watchful stewardship, not obsessive checking</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700  leading-relaxed mb-6">Portfolio monitoring is the ongoing process of tracking performance, comparing against benchmarks, and reviewing your strategy. Done right, it keeps you informed and disciplined. Done wrong, it leads to overtrading and emotional decisions.</p>

                  <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-xl p-6 mb-6">
                    <h4 className="text-white font-semibold mb-4 text-center">The Monitoring Balance</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-red-400 text-sm mb-2">Too Little</div>
                        <div className="text-gray-300 text-xs">Miss important changes, drift unchecked, strategy neglected</div>
                      </div>
                      <div className="text-center p-4 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                        <div className="text-emerald-400 text-sm mb-2">Just Right</div>
                        <div className="text-gray-300 text-xs">Regular reviews, informed decisions, disciplined approach</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-red-400 text-sm mb-2">Too Much</div>
                        <div className="text-gray-300 text-xs">Emotional reactions, overtrading, short-term focus</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-violet-50   rounded-xl p-6 border-l-4 border-indigo-500">
                    <h4 className="font-bold text-gray-900  mb-2">The Right Cadence</h4>
                    <p className="text-gray-700  text-sm">Check allocations monthly or quarterly. Review performance against benchmarks quarterly or semi-annually. Conduct comprehensive strategy reviews annually. React to life changes immediately. Don't check daily prices - that's noise, not information.</p>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                      <Icons.TrendingUp className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Performance Tracking</h2>
                      <p className="text-sm text-gray-500 ">Measuring what matters</p>
                    </div>
                  </div>

                  <p className="text-gray-700  leading-relaxed mb-6">Understanding your portfolio's true performance requires more than just looking at ending values. You need to account for contributions, withdrawals, and timing to get meaningful metrics.</p>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-violet-50  rounded-xl p-5 border border-violet-200 ">
                      <h4 className="font-bold text-violet-800  mb-3">Time-Weighted Return (TWR)</h4>
                      <p className="text-sm text-gray-700  mb-3">Measures investment performance independent of cash flows. Shows how $1 invested at the start would have grown.</p>
                      <div className="p-3 bg-violet-100  rounded-lg text-xs">
                        <strong className="text-violet-700 ">Best for:</strong> <span className="text-gray-700 ">Evaluating manager skill, comparing strategies</span>
                      </div>
                    </div>

                    <div className="bg-purple-50  rounded-xl p-5 border border-purple-200 ">
                      <h4 className="font-bold text-purple-800  mb-3">Money-Weighted Return (MWR)</h4>
                      <p className="text-sm text-gray-700  mb-3">Measures actual dollar growth including timing of deposits/withdrawals. Shows your personal wealth accumulation.</p>
                      <div className="p-3 bg-purple-100  rounded-lg text-xs">
                        <strong className="text-purple-700 ">Best for:</strong> <span className="text-gray-700 ">Personal financial progress, IRR calculations</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50  rounded-xl p-6">
                    <h4 className="font-bold text-gray-900  mb-4">Key Performance Metrics</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white  rounded-lg">
                        <h5 className="font-semibold text-indigo-700  mb-2">Absolute Return</h5>
                        <p className="text-xs text-gray-600 ">Total percentage gain/loss over a period. Simple but needs context.</p>
                      </div>
                      <div className="p-4 bg-white  rounded-lg">
                        <h5 className="font-semibold text-violet-700  mb-2">Risk-Adjusted Return</h5>
                        <p className="text-xs text-gray-600 ">Return per unit of risk (Sharpe ratio). Higher is better.</p>
                      </div>
                      <div className="p-4 bg-white  rounded-lg">
                        <h5 className="font-semibold text-purple-700  mb-2">Max Drawdown</h5>
                        <p className="text-xs text-gray-600 ">Largest peak-to-trough decline. Measures worst-case loss.</p>
                      </div>
                      <div className="p-4 bg-white  rounded-lg">
                        <h5 className="font-semibold text-fuchsia-700  mb-2">Volatility</h5>
                        <p className="text-xs text-gray-600 ">Standard deviation of returns. Measures consistency/bumpiness.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                      <Icons.Award className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Effective Benchmarking</h2>
                      <p className="text-sm text-gray-500 ">Comparing apples to apples</p>
                    </div>
                  </div>

                  <p className="text-gray-700  leading-relaxed mb-6">A benchmark provides context for your returns. Earning 8% sounds great until you learn the market returned 15%. Losing 10% sounds terrible until you learn it was a 20% down year. Choose benchmarks that match your portfolio's risk profile.</p>

                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 ">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 ">Portfolio Type</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 ">Appropriate Benchmark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { portfolio: "All US Stocks", benchmark: "S&P 500 or Total Stock Market Index" },
                          { portfolio: "60/40 Balanced", benchmark: "60% S&P 500 + 40% Bloomberg Agg" },
                          { portfolio: "Global Stocks", benchmark: "MSCI All Country World Index" },
                          { portfolio: "US Bonds Only", benchmark: "Bloomberg US Aggregate Bond" },
                          { portfolio: "Target Date Fund", benchmark: "Comparable target date index" },
                          { portfolio: "Custom Multi-Asset", benchmark: "Blended benchmark matching allocation" }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-gray-100 ">
                            <td className="py-3 px-4 text-gray-700  font-medium">{row.portfolio}</td>
                            <td className="py-3 px-4 text-gray-600 ">{row.benchmark}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                      <h4 className="font-bold text-blue-800  mb-3 flex items-center gap-2">
                        <Icons.CheckCircle className="w-5 h-5"/> Good Benchmark Criteria
                      </h4>
                      <ul className="text-sm text-gray-700  space-y-2">
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"/>Investable (you could actually hold it)</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"/>Appropriate risk level</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"/>Matches your asset allocation</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"/>Defined in advance, not cherry-picked</li>
                      </ul>
                    </div>

                    <div className="bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                      <h4 className="font-bold text-amber-800  mb-3 flex items-center gap-2">
                        <Icons.AlertTriangle className="w-5 h-5"/> Benchmarking Mistakes
                      </h4>
                      <ul className="text-sm text-gray-700  space-y-2">
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"/>Comparing bonds to stocks</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"/>Changing benchmarks after the fact</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"/>Comparing to the best performer</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"/>Ignoring risk differences</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                      <Icons.FileText className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Reporting and Documentation</h2>
                      <p className="text-sm text-gray-500 ">Keeping records that matter</p>
                    </div>
                  </div>

                  <p className="text-gray-700  leading-relaxed mb-6">Good record-keeping helps you make informed decisions, track progress, and stay accountable to your strategy. Document not just numbers, but also your reasoning and any changes you make.</p>

                  <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-xl p-6 mb-6">
                    <h4 className="text-white font-semibold mb-4 text-center">Portfolio Report Template</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h5 className="text-emerald-400 font-medium mb-2">Performance Summary</h5>
                        <ul className="text-gray-400 text-xs space-y-1">
                          <li>Period return vs benchmark</li>
                          <li>Year-to-date return</li>
                          <li>Since-inception return</li>
                          <li>Risk metrics (vol, drawdown)</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h5 className="text-emerald-400 font-medium mb-2">Allocation Review</h5>
                        <ul className="text-gray-400 text-xs space-y-1">
                          <li>Current vs target weights</li>
                          <li>Drift from targets</li>
                          <li>Rebalancing needs</li>
                          <li>New contributions allocated</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h5 className="text-emerald-400 font-medium mb-2">Holdings Review</h5>
                        <ul className="text-gray-400 text-xs space-y-1">
                          <li>Individual position performance</li>
                          <li>Tax lots and cost basis</li>
                          <li>Dividend/income received</li>
                          <li>Any changes made</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h5 className="text-emerald-400 font-medium mb-2">Forward Looking</h5>
                        <ul className="text-gray-400 text-xs space-y-1">
                          <li>Actions needed</li>
                          <li>Strategy considerations</li>
                          <li>Life changes to address</li>
                          <li>Next review date</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-emerald-50  rounded-xl p-5 border border-emerald-200 ">
                      <h4 className="font-bold text-emerald-800  mb-2">Keep an Investment Journal</h4>
                      <p className="text-sm text-gray-700 ">Document why you make changes, not just what you change. This helps you learn from past decisions and avoid repeating mistakes. "Sold bond fund because I panicked" is valuable self-knowledge.</p>
                    </div>

                    <div className="bg-teal-50  rounded-xl p-5 border border-teal-200 ">
                      <h4 className="font-bold text-teal-800  mb-2">Use a Consistent Format</h4>
                      <p className="text-sm text-gray-700 ">Standardized reports let you compare periods easily. Many brokers provide statements, but consider creating your own summary that focuses on what matters most to you.</p>
                    </div>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
                      </svg>
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Annual Review Process</h2>
                      <p className="text-sm text-gray-500 ">Your yearly strategy checkup</p>
                    </div>
                  </div>

                  <p className="text-gray-700  leading-relaxed mb-6">The annual review is your opportunity to step back and evaluate the big picture. It's not about short-term performance, but about ensuring your strategy remains aligned with your life goals.</p>

                  <div className="space-y-4 mb-6">
                    <div className="bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                      <h4 className="font-bold text-amber-800  mb-3">1. Goals Review</h4>
                      <ul className="text-sm text-gray-700  space-y-1">
                        <li>Have your financial goals changed?</li>
                        <li>Is your time horizon still the same?</li>
                        <li>Any new goals (education, house, retirement date change)?</li>
                        <li>Are you on track to meet existing goals?</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50  rounded-xl p-5 border border-orange-200 ">
                      <h4 className="font-bold text-orange-800  mb-3">2. Risk Tolerance Check</h4>
                      <ul className="text-sm text-gray-700  space-y-1">
                        <li>Has your risk capacity changed (income, job security)?</li>
                        <li>Did you react to volatility as expected, or panic?</li>
                        <li>Should you adjust aggressiveness based on experience?</li>
                        <li>Any life changes affecting your risk profile?</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50  rounded-xl p-5 border border-yellow-200 ">
                      <h4 className="font-bold text-yellow-800  mb-3">3. Performance Evaluation</h4>
                      <ul className="text-sm text-gray-700  space-y-1">
                        <li>How did your portfolio perform vs benchmark?</li>
                        <li>What drove over/underperformance?</li>
                        <li>Were returns worth the risk taken?</li>
                        <li>Any holdings consistently underperforming?</li>
                      </ul>
                    </div>

                    <div className="bg-lime-50  rounded-xl p-5 border border-lime-200 ">
                      <h4 className="font-bold text-lime-800  mb-3">4. Strategy Adjustments</h4>
                      <ul className="text-sm text-gray-700  space-y-1">
                        <li>Should target allocation change (glide path)?</li>
                        <li>Any holdings to replace (better options available)?</li>
                        <li>Tax-loss harvesting opportunities?</li>
                        <li>Contribution/withdrawal rate changes?</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50   rounded-xl p-6 border-l-4 border-amber-400">
                    <h4 className="font-bold text-gray-900  mb-2">Annual Review Checklist</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 ">
                      <div className="space-y-1">
                        <p className="flex items-center gap-2"><span className="w-4 h-4 border border-gray-400 rounded"/>Review IPS and goals</p>
                        <p className="flex items-center gap-2"><span className="w-4 h-4 border border-gray-400 rounded"/>Calculate year's performance</p>
                        <p className="flex items-center gap-2"><span className="w-4 h-4 border border-gray-400 rounded"/>Compare to benchmark</p>
                        <p className="flex items-center gap-2"><span className="w-4 h-4 border border-gray-400 rounded"/>Check allocation drift</p>
                      </div>
                      <div className="space-y-1">
                        <p className="flex items-center gap-2"><span className="w-4 h-4 border border-gray-400 rounded"/>Review each holding</p>
                        <p className="flex items-center gap-2"><span className="w-4 h-4 border border-gray-400 rounded"/>Evaluate tax situation</p>
                        <p className="flex items-center gap-2"><span className="w-4 h-4 border border-gray-400 rounded"/>Update beneficiaries</p>
                        <p className="flex items-center gap-2"><span className="w-4 h-4 border border-gray-400 rounded"/>Set next year's goals</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-8">
                    <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                      <Icons.CheckCircle className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Final Knowledge Check</h2>
                      <p className="text-sm text-gray-500 ">Complete your Portfolio Construction journey</p>
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
                                  ${isSelected && !showResults ? 'border-indigo-500 bg-indigo-50 ' : ''}
                                  ${!isSelected && !showResults ? 'border-gray-200  hover:border-gray-300 ' : ''}
                                  ${showResults ? 'cursor-default' : 'cursor-pointer'}`}>
                                <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300  text-gray-500'}`}>
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
                          <div className="mt-4 p-4 bg-indigo-50  rounded-lg border border-indigo-200 ">
                            <p className="text-sm text-indigo-800 "><strong>Explanation:</strong> {q.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {!showResults ? (
                    <button onClick={() => setShowResults(true)} disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                      className="mt-8 w-full py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      Complete Module
                    </button>
                  ) : (
                    <div className="mt-8 p-8 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl text-center">
                      <p className="text-3xl font-bold text-white mb-2">{calculateScore()} / {quizQuestions.length}</p>
                      <p className="text-indigo-100 mb-4">{calculateScore() === quizQuestions.length ? "Outstanding! You've completed the Portfolio Construction module." : "Review the explanations to solidify your monitoring knowledge."}</p>
                      <div className="pt-4 border-t border-indigo-400/30">
                        <p className="text-white font-semibold">Congratulations on completing Portfolio Construction!</p>
                        <p className="text-indigo-200 text-sm mt-2">You now have a comprehensive framework for building, managing, and monitoring investment portfolios.</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
          </div>

          <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/pc-lesson-11')} className="flex items-center gap-2 px-6 py-3 bg-gray-100  text-gray-700  rounded-xl font-medium hover:bg-gray-200  transition-colors">
              <Icons.ArrowLeft className="w-4 h-4"/><span>Previous Lesson</span>
            </button>
            <button onClick={() => navigate('/learn/portfolio-construction')} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200">
              <span>Back to Module Overview</span><Icons.ArrowRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PCLesson12;
