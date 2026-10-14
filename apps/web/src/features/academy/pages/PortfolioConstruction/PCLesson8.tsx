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
  Globe: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Layers: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12,2 2,7 12,12 22,7"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/>
    </svg>
  ),
  Grid: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
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
  // Correlation Heatmap
  CorrelationHeatmap: ({ className = "w-full h-64" }) => (
    <svg className={className} viewBox="0 0 400 300" fill="none">
      {/* Grid cells with different correlations */}
      {[
        [{v:1,c:'#12805A'},{v:0.3,c:'#5A77AA'},{v:-0.2,c:'#8F6FC4'},{v:0.1,c:'#7C95C4'}],
        [{v:0.3,c:'#5A77AA'},{v:1,c:'#12805A'},{v:0.5,c:'#3CCB97'},{v:0.2,c:'#5A77AA'}],
        [{v:-0.2,c:'#8F6FC4'},{v:0.5,c:'#3CCB97'},{v:1,c:'#12805A'},{v:-0.1,c:'#A88BD9'}],
        [{v:0.1,c:'#7C95C4'},{v:0.2,c:'#5A77AA'},{v:-0.1,c:'#A88BD9'},{v:1,c:'#12805A'}]
      ].map((row, i) => (
        row.map((cell, j) => (
          <g key={`${i}-${j}`}>
            <rect x={100+j*60} y={50+i*50} width="55" height="45" fill={cell.c} opacity="0.6" stroke="white" strokeWidth="2" rx="4"/>
            <text x={127.5+j*60} y={77+i*50} fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">{cell.v}</text>
          </g>
        ))
      ))}
      {/* Labels */}
      {['Stocks', 'Bonds', 'Real Estate', 'Commodities'].map((label, i) => (
        <g key={`label-${i}`}>
          <text x="90" y={77+i*50} fill="currentColor" fontSize="12" textAnchor="end">{label}</text>
          <text x={127.5+i*60} y="40" fill="currentColor" fontSize="12" textAnchor="middle">{label.split(' ')[0]}</text>
        </g>
      ))}
      <text x="200" y="25" fill="currentColor" opacity="0.7" fontSize="14" fontWeight="bold" textAnchor="middle">Asset Correlation Matrix</text>
      {/* Legend */}
      <g transform="translate(120, 260)">
        <rect x="0" y="0" width="40" height="15" fill="#8F6FC4" opacity="0.6" rx="2"/>
        <text x="45" y="11" fill="currentColor" fontSize="10">Negative</text>
        <rect x="100" y="0" width="40" height="15" fill="#5A77AA" opacity="0.6" rx="2"/>
        <text x="145" y="11" fill="currentColor" fontSize="10">Low</text>
        <rect x="190" y="0" width="40" height="15" fill="#12805A" opacity="0.6" rx="2"/>
        <text x="235" y="11" fill="currentColor" fontSize="10">High</text>
      </g>
    </svg>
  )
};

const PCLesson8 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const quizQuestions = [
    {
      id: 1,
      question: "What is the key difference between naive diversification and true diversification?",
      options: [
        "Naive diversification requires more assets",
        "True diversification considers correlation between assets, not just quantity",
        "Naive diversification is more expensive",
        "True diversification only works with stocks"
      ],
      correct: 1,
      explanation: "Naive diversification means just holding many assets. True diversification considers how assets move relative to each other (correlation). Holding 50 tech stocks is less diversified than holding 10 assets from uncorrelated sources."
    },
    {
      id: 2,
      question: "Why do correlations tend to increase during market crises?",
      options: [
        "Regulations require it",
        "Assets become fundamentally similar",
        "Fear causes investors to sell everything, creating synchronized movements",
        "Mathematical error in correlation calculations"
      ],
      correct: 2,
      explanation: "During panics, investors sell indiscriminately to raise cash or reduce risk. This 'flight to quality' causes normally uncorrelated assets to fall together, reducing diversification benefits exactly when you need them most."
    },
    {
      id: 3,
      question: "What is the primary benefit of international diversification?",
      options: [
        "Foreign stocks always outperform",
        "Currency gains are guaranteed",
        "Access to economic cycles and sectors not available domestically",
        "Lower tax rates"
      ],
      correct: 2,
      explanation: "Different countries have different economic cycles, industry compositions, and monetary policies. International diversification gives exposure to growth opportunities and risk factors not available in your home market."
    },
    {
      id: 4,
      question: "The statement 'diversification is the only free lunch in investing' means:",
      options: [
        "Diversification has no costs",
        "You can reduce risk without proportionally reducing expected return",
        "Diversified portfolios always make money",
        "You don't need to pay commissions on diversified portfolios"
      ],
      correct: 1,
      explanation: "Harry Markowitz noted that diversification allows you to reduce portfolio risk without giving up expected return (because uncorrelated assets smooth volatility). This is 'free' in the sense that you get something (lower risk) without paying for it (lower return)."
    }
  ];

  const handleQuizAnswer = (qId, aIdx) => {
    if (!showResults) {
      setQuizAnswers(prev => ({ ...prev, [qId]: aIdx }));
    }
  };

  const calculateScore = () => quizQuestions.filter(q => quizAnswers[q.id] === q.correct).length;

  return (
    <div className="text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          <button onClick={() => navigate('/learn/portfolio-construction')} className="flex items-center gap-2 text-gray-500 hover:text-brand  transition-colors mb-8 group">
            <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
            <span className="text-sm font-medium">Back to Portfolio Construction</span>
          </button>

          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-sm bg-brand-fill">LESSON 8 OF 12</span>
              <span className="px-3 py-1.5 bg-brand-soft  text-brand  rounded-full text-xs font-medium flex items-center gap-1.5">
                <Icons.Clock className="w-3.5 h-3.5"/>40 min read
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-semibold mb-5 leading-tight tracking-[-0.025em] text-brand">Diversification Mastery</h1>
            <p className="text-xl text-gray-600  leading-relaxed max-w-3xl">Discover why diversification is called the "only free lunch in investing." Learn to build portfolios that reduce risk without sacrificing returns through true diversification across assets and geography.</p>
          </header>

          <div className="space-y-12">
            
            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20 bg-brand-fill">
                      <Icons.Layers className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">The Free Lunch of Finance</h2>
                      <p className="text-sm text-gray-500 ">Why diversification matters</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700  leading-relaxed mb-6">Harry Markowitz famously called diversification "the only free lunch in investing." Unlike most financial decisions that involve trade-offs, proper diversification allows you to reduce portfolio risk without proportionally reducing expected returns.</p>

                  <div className="rounded-xl p-6 mb-6 bg-brand-fill">
                    <h4 className="text-white font-semibold mb-4 text-center">The Mathematics of Diversification</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-brand text-sm mb-2">Single Stock</div>
                        <div className="text-white text-lg font-mono">σp = σ</div>
                        <div className="text-gray-400 text-xs mt-2">Full volatility exposure</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-brand text-sm mb-2">N Uncorrelated Stocks</div>
                        <div className="text-white text-lg font-mono">σp = σ / sqrt(N)</div>
                        <div className="text-gray-400 text-xs mt-2">Risk decreases with sqrt(N)</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-brand text-center">
                      <span className="text-gray-400 text-xs">With 25 uncorrelated assets of equal volatility, portfolio risk is just 20% of single-asset risk</span>
                    </div>
                  </div>

                  <div className="rounded-xl p-6 border-l-4 border-brand bg-brand-soft">
                    <h4 className="font-bold text-gray-900  mb-2">The Core Insight</h4>
                    <p className="text-gray-700  text-sm">When assets don't move in lockstep, losses in some are offset by gains in others. This smoothing effect reduces volatility without reducing average returns. That's the free lunch - less risk, same expected reward.</p>
                  </div>
                </div>
              </section>
            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20 bg-brand-fill">
                      <Icons.Grid className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">True vs. Naive Diversification</h2>
                      <p className="text-sm text-gray-500 ">Quantity is not quality</p>
                    </div>
                  </div>

                  <p className="text-gray-700  leading-relaxed mb-6">Simply owning many assets does not guarantee diversification. What matters is how those assets behave relative to each other. A portfolio of 50 similar assets may be less diversified than a portfolio of 10 different ones.</p>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-red-50  rounded-xl p-5 border border-red-200 ">
                      <h4 className="font-bold text-red-800  mb-3 flex items-center gap-2">
                        <Icons.XCircle className="w-5 h-5"/> Naive Diversification
                      </h4>
                      <ul className="text-sm text-gray-700  space-y-2">
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"/>Owning 30 tech stocks</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"/>Multiple funds with same holdings</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"/>Correlated asset classes</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"/>Only domestic investments</li>
                      </ul>
                      <div className="mt-4 p-3 bg-red-100  rounded-lg">
                        <p className="text-xs text-red-700 ">Appears diversified but correlated. Risk reduction is limited.</p>
                      </div>
                    </div>

                    <div className="bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                      <h4 className="font-bold text-brand  mb-3 flex items-center gap-2">
                        <Icons.CheckCircle className="w-5 h-5"/> True Diversification
                      </h4>
                      <ul className="text-sm text-gray-700  space-y-2">
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-brand-fill rounded-full mt-1.5 flex-shrink-0"/>Different asset classes</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-brand-fill rounded-full mt-1.5 flex-shrink-0"/>Multiple geographies</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-brand-fill rounded-full mt-1.5 flex-shrink-0"/>Different risk factors</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-brand-fill rounded-full mt-1.5 flex-shrink-0"/>Various economic sensitivities</li>
                      </ul>
                      <div className="mt-4 p-3 bg-brand-soft  rounded-lg">
                        <p className="text-xs text-brand ">Low correlations provide genuine risk reduction.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50  rounded-xl p-6">
                    <h4 className="font-bold text-gray-900  mb-4">Diversification Dimensions</h4>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="p-4 bg-white  rounded-lg">
                        <h5 className="font-semibold text-brand  mb-2">Asset Class</h5>
                        <p className="text-gray-600 ">Stocks, bonds, real estate, commodities</p>
                      </div>
                      <div className="p-4 bg-white  rounded-lg">
                        <h5 className="font-semibold text-teal-700  mb-2">Geography</h5>
                        <p className="text-gray-600 ">US, developed intl, emerging markets</p>
                      </div>
                      <div className="p-4 bg-white  rounded-lg">
                        <h5 className="font-semibold text-cyan-700  mb-2">Sector</h5>
                        <p className="text-gray-600 ">Technology, healthcare, financials, etc.</p>
                      </div>
                      <div className="p-4 bg-white  rounded-lg">
                        <h5 className="font-semibold text-blue-700  mb-2">Market Cap</h5>
                        <p className="text-gray-600 ">Large, mid, small cap exposure</p>
                      </div>
                      <div className="p-4 bg-white  rounded-lg">
                        <h5 className="font-semibold text-indigo-700  mb-2">Style</h5>
                        <p className="text-gray-600 ">Value, growth, quality, momentum</p>
                      </div>
                      <div className="p-4 bg-white  rounded-lg">
                        <h5 className="font-semibold text-violet-700  mb-2">Time</h5>
                        <p className="text-gray-600 ">Dollar-cost averaging over time</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 bg-brand-fill">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 20V10M12 20V4M6 20v-6"/>
                      </svg>
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">Understanding Correlation</h2>
                      <p className="text-sm text-gray-500 ">The key to diversification</p>
                    </div>
                  </div>

                  <p className="text-gray-700  leading-relaxed mb-6">Correlation measures how two assets move relative to each other. It ranges from -1 (perfectly opposite) to +1 (perfectly together). Lower correlations mean better diversification benefits.</p>

                  <div className="rounded-xl p-6 mb-6 bg-brand-fill">
                    <h4 className="text-white font-semibold mb-4 text-center">Correlation Spectrum</h4>
                    <div className="relative">
                      <div className="h-3 rounded-full bg-brand-fill"/>
                      <div className="flex justify-between mt-2 text-xs">
                        <span className="text-brand">-1.0<br/>Perfect hedge</span>
                        <span className="text-yellow-400">0<br/>Uncorrelated</span>
                        <span className="text-red-400">+1.0<br/>Perfect correlation</span>
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-brand-fill/40 rounded-lg">
                        <div className="text-brand font-bold">Negative</div>
                        <div className="text-gray-400 text-xs mt-1">Maximum diversification benefit</div>
                      </div>
                      <div className="p-3 bg-yellow-900/40 rounded-lg">
                        <div className="text-yellow-400 font-bold">Near Zero</div>
                        <div className="text-gray-400 text-xs mt-1">Good diversification benefit</div>
                      </div>
                      <div className="p-3 bg-red-900/40 rounded-lg">
                        <div className="text-red-400 font-bold">High Positive</div>
                        <div className="text-gray-400 text-xs mt-1">Limited diversification</div>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 ">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 ">Asset Pair</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 ">Typical Correlation</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 ">Diversification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { pair: "US Large vs. Small Cap", corr: "+0.75 to +0.85", benefit: "Limited", color: "red" },
                          { pair: "US vs. Developed Intl", corr: "+0.70 to +0.85", benefit: "Limited", color: "red" },
                          { pair: "Stocks vs. Investment Grade Bonds", corr: "+0.20 to -0.20", benefit: "Good", color: "emerald" },
                          { pair: "Stocks vs. Long-Term Treasuries", corr: "-0.10 to -0.40", benefit: "Excellent", color: "emerald" },
                          { pair: "Stocks vs. Gold", corr: "+0.05 to -0.15", benefit: "Good", color: "emerald" },
                          { pair: "Stocks vs. Commodities", corr: "+0.20 to +0.40", benefit: "Moderate", color: "amber" }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="py-3 px-4 text-gray-700">{row.pair}</td>
                            <td className="py-3 px-4 text-center font-mono text-gray-900">{row.corr}</td>
                            <td className={`py-3 px-4 text-center font-semibold text-${row.color}-600`}>{row.benefit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-l-4 border-amber-400">
                    <h4 className="font-bold text-gray-900  mb-2 flex items-center gap-2">
                      <Icons.AlertTriangle className="w-5 h-5 text-amber-500"/> Correlation Warning
                    </h4>
                    <p className="text-gray-700  text-sm">Correlations are not stable. They tend to increase during market crises - exactly when you need diversification most. This "correlation breakdown" is a major risk that historical correlations may not capture.</p>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20 bg-brand-fill">
                      <Icons.Grid className="w-7 h-7 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Asset Correlation Analysis</h2>
                      <p className="text-sm text-gray-500 ">Understanding asset relationships</p>
                    </div>
                  </div>
                  
                  {/* Visual: Correlation Heatmap */}
                  <div className="bg-gradient-to-br from-gray-900 to-cyan-950 rounded-2xl p-8 mb-6 shadow-lg brand-on-dark">
                    <h4 className="text-white font-bold mb-4 text-center">Visual: Asset Correlation Matrix</h4>
                    <Icons.CorrelationHeatmap className="w-full h-64"/>
                    <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
                      <span className="text-gray-300">Lower correlations provide better diversification benefits</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700  leading-relaxed mb-6">Effective diversification relies on combining assets with low or negative correlations. Understanding correlation patterns across different asset classes helps build more resilient portfolios.</p>
                  
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 ">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 ">Asset Pair (India)</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 ">Typical Correlation</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 ">Diversification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { pair: "Nifty 50 vs. Nifty Midcap", corr: "+0.80 to +0.90", benefit: "Limited", color: "red" },
                          { pair: "Indian Equity vs. US S&P 500", corr: "+0.50 to +0.70", benefit: "Good", color: "emerald" },
                          { pair: "Indian Stocks vs. Gilt Funds", corr: "+0.10 to +0.30", benefit: "Good", color: "emerald" },
                          { pair: "Indian Equity vs. Gold", corr: "-0.05 to +0.15", benefit: "Excellent", color: "emerald" },
                          { pair: "Nifty 50 vs. Bank Nifty", corr: "+0.85 to +0.95", benefit: "Very Limited", color: "red" },
                          { pair: "Indian Stocks vs. REITs", corr: "+0.40 to +0.60", benefit: "Moderate", color: "amber" }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="py-3 px-4 text-gray-700">{row.pair}</td>
                            <td className="py-3 px-4 text-center font-mono text-gray-900">{row.corr}</td>
                            <td className={`py-3 px-4 text-center font-semibold text-${row.color}-600`}>{row.benefit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-orange-50  rounded-xl p-6 border border-orange-200 ">
                      <h4 className="font-bold text-orange-800  mb-3">Breaking Home Bias</h4>
                      <p className="text-sm text-gray-600  mb-3">Most Indian investors have 90%+ domestic allocation. Optimal diversification suggests:</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"/>
                          <span><strong className="text-gray-900 ">15-25% International:</strong> US/developed markets</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"/>
                          <span><strong className="text-gray-900 ">10-15% Gold:</strong> Traditional hedge + cultural value</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"/>
                          <span><strong className="text-gray-900 ">5-10% REITs/InvITs:</strong> Real estate without concentration</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-brand-soft  rounded-xl p-6 border border-brand-line ">
                      <h4 className="font-bold text-brand  mb-3">Sector Diversification</h4>
                      <p className="text-sm text-gray-600  mb-3">Nifty 50 is heavily weighted to financials (~35%). Diversify across:</p>
                      <div className="space-y-2 text-xs">
                        <div className="bg-brand-soft  rounded-lg p-2">
                          <span className="font-medium text-brand ">IT (15%):</span>
                          <span className="text-brand  ml-1">Export earnings, rupee hedge</span>
                        </div>
                        <div className="bg-brand-soft  rounded-lg p-2">
                          <span className="font-medium text-brand ">FMCG (10%):</span>
                          <span className="text-brand  ml-1">Defensive, rural consumption</span>
                        </div>
                        <div className="bg-brand-soft  rounded-lg p-2">
                          <span className="font-medium text-brand ">Pharma (10%):</span>
                          <span className="text-brand  ml-1">Healthcare demand, exports</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-green-50   rounded-xl p-6 border-l-4 border-orange-500">
                    <h4 className="font-bold text-gray-900  mb-2">2020 Correlation Lesson</h4>
                    <p className="text-gray-700  text-sm leading-relaxed mb-2">During March 2020 COVID crash, Indian large-caps, mid-caps, and small-caps all fell 30-40% together (correlations approached 0.95). Portfolios with international diversification and gold fared better.</p>
                    <p className="text-gray-600  text-xs">Lesson: Don't assume different Indian market segments provide true diversification during crises.</p>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20 bg-brand-fill">
                      <Icons.Globe className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Global Diversification</h2>
                      <p className="text-sm text-gray-500 ">Beyond your home market</p>
                    </div>
                  </div>

                  <p className="text-gray-700  leading-relaxed mb-6">Most investors exhibit "home bias" - overweighting their domestic market. But the global opportunity set offers access to different economic cycles, growth opportunities, and risk factors that can improve portfolio efficiency.</p>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-violet-50  rounded-xl p-5 border border-violet-200 ">
                      <h4 className="font-bold text-violet-800  mb-3">United States</h4>
                      <p className="text-2xl font-bold text-gray-900  mb-1">~60%</p>
                      <p className="text-xs text-gray-600 ">of global market cap</p>
                      <div className="mt-3 text-xs text-violet-600 ">Tech-heavy, growth-oriented</div>
                    </div>
                    <div className="bg-indigo-50  rounded-xl p-5 border border-indigo-200 ">
                      <h4 className="font-bold text-indigo-800  mb-3">Developed Intl</h4>
                      <p className="text-2xl font-bold text-gray-900  mb-1">~30%</p>
                      <p className="text-xs text-gray-600 ">of global market cap</p>
                      <div className="mt-3 text-xs text-indigo-600 ">Europe, Japan, Australia</div>
                    </div>
                    <div className="bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                      <h4 className="font-bold text-blue-800  mb-3">Emerging Markets</h4>
                      <p className="text-2xl font-bold text-gray-900  mb-1">~10%</p>
                      <p className="text-xs text-gray-600 ">of global market cap</p>
                      <div className="mt-3 text-xs text-blue-600 ">China, India, Brazil, etc.</div>
                    </div>
                  </div>

                  <div className="bg-gray-50  rounded-xl p-6 mb-6">
                    <h4 className="font-bold text-gray-900  mb-4">Benefits vs. Challenges</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-semibold text-brand  mb-3">Benefits</h5>
                        <ul className="text-sm text-gray-700  space-y-2">
                          <li className="flex items-start gap-2"><Icons.CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0"/>Access to different economic cycles</li>
                          <li className="flex items-start gap-2"><Icons.CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0"/>Exposure to sectors underrepresented at home</li>
                          <li className="flex items-start gap-2"><Icons.CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0"/>Potential for higher returns in EM</li>
                          <li className="flex items-start gap-2"><Icons.CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0"/>Currency diversification</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-amber-700  mb-3">Challenges</h5>
                        <ul className="text-sm text-gray-700  space-y-2">
                          <li className="flex items-start gap-2"><Icons.AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0"/>Currency risk (can help or hurt)</li>
                          <li className="flex items-start gap-2"><Icons.AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0"/>Political and regulatory risk in EM</li>
                          <li className="flex items-start gap-2"><Icons.AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0"/>Higher costs and taxes</li>
                          <li className="flex items-start gap-2"><Icons.AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0"/>Correlations have increased over time</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-violet-50 to-purple-50   rounded-xl p-6 border-l-4 border-violet-500">
                    <h4 className="font-bold text-gray-900  mb-2">Practical Approach</h4>
                    <p className="text-gray-700  text-sm">Many advisors recommend 20-40% international allocation for US investors. Consider your personal situation: do you have international income or plan to retire abroad? Factor in your total exposure, not just your portfolio.</p>
                  </div>
                </div>
              </section>
            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/20">
                      <Icons.AlertTriangle className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Limits and Common Mistakes</h2>
                      <p className="text-sm text-gray-500 ">What diversification cannot do</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-rose-50  rounded-xl p-5 border border-rose-200 ">
                      <h4 className="font-bold text-rose-800  mb-2">Cannot Eliminate Market Risk</h4>
                      <p className="text-sm text-gray-700 ">Diversification reduces idiosyncratic (company-specific) risk but cannot eliminate systematic (market-wide) risk. In a global crisis, most assets fall together. You can't diversify away the risk of being in the market.</p>
                    </div>

                    <div className="bg-red-50  rounded-xl p-5 border border-red-200 ">
                      <h4 className="font-bold text-red-800  mb-2">Correlations Spike in Crises</h4>
                      <p className="text-sm text-gray-700 ">During 2008, nearly all asset classes (except Treasuries) fell together as investors panicked. Historical correlations understate how correlated assets become during stress. This is why diversification often disappoints exactly when you need it most.</p>
                    </div>

                    <div className="bg-orange-50  rounded-xl p-5 border border-orange-200 ">
                      <h4 className="font-bold text-orange-800  mb-2">Over-Diversification Exists</h4>
                      <p className="text-sm text-gray-700 ">Beyond about 20-30 holdings, the marginal benefit of adding more assets diminishes. Too many holdings can increase costs, complexity, and tax inefficiency without meaningful risk reduction. Quality matters more than quantity.</p>
                    </div>

                    <div className="bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                      <h4 className="font-bold text-amber-800  mb-2">"Diworsification"</h4>
                      <p className="text-sm text-gray-700 ">Adding mediocre assets just for diversification can drag down returns without proportionally reducing risk. Only add assets with reasonable expected returns and low correlation. Diversification for its own sake can hurt performance.</p>
                    </div>
                  </div>

                  <div className="bg-gray-50  rounded-xl p-6">
                    <h4 className="font-bold text-gray-900  mb-4">Diversification Done Right</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white  rounded-lg">
                        <h5 className="font-semibold text-brand  mb-2">Focus On</h5>
                        <ul className="text-sm text-gray-700  space-y-1">
                          <li>Asset class diversification first</li>
                          <li>Low correlation, not just quantity</li>
                          <li>Stress-tested relationships</li>
                          <li>Cost-effective implementation</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-white  rounded-lg">
                        <h5 className="font-semibold text-rose-700  mb-2">Avoid</h5>
                        <ul className="text-sm text-gray-700  space-y-1">
                          <li>Overlapping funds</li>
                          <li>Too many similar holdings</li>
                          <li>Expensive alternatives for diversification</li>
                          <li>Complexity without benefit</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-8">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20 bg-brand-fill">
                      <Icons.CheckCircle className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Knowledge Check</h2>
                      <p className="text-sm text-gray-500 ">Test your understanding of diversification</p>
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
                                  ${isSelected && !showResults ? 'border-brand bg-brand-soft ' : ''}
                                  ${!isSelected && !showResults ? 'border-gray-200  hover:border-gray-300 ' : ''}
                                  ${showResults ? 'cursor-default' : 'cursor-pointer'}`}>
                                <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected ? 'border-brand bg-brand-fill text-white' : 'border-gray-300  text-gray-500'}`}>
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
                          <div className="mt-4 p-4 bg-teal-50  rounded-lg border border-teal-200 ">
                            <p className="text-sm text-teal-800 "><strong>Explanation:</strong> {q.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {!showResults ? (
                    <button onClick={() => setShowResults(true)} disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                      className="mt-8 w-full py-4 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-brand/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-brand-fill">
                      Check Answers
                    </button>
                  ) : (
                    <div className="mt-8 p-6 rounded-xl text-center bg-brand-fill">
                      <p className="text-3xl font-bold text-white mb-2">{calculateScore()} / {quizQuestions.length}</p>
                      <p className="text-white/85">{calculateScore() === quizQuestions.length ? "Perfect! You understand the art and science of diversification." : "Review the explanations to master diversification concepts."}</p>
                    </div>
                  )}
                </div>
              </section>
          </div>

          <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/pc-lesson-7')} className="flex items-center gap-2 px-6 py-3 bg-gray-100  text-gray-700  rounded-xl font-medium hover:bg-gray-200  transition-colors">
              <Icons.ArrowLeft className="w-4 h-4"/><span>Previous Lesson</span>
            </button>
            <button onClick={() => navigate('/learn/pc-lesson-9')} className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-brand/25 transition-all duration-200 bg-brand-fill">
              <span>Next: Rebalancing</span><Icons.ArrowRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PCLesson8;
