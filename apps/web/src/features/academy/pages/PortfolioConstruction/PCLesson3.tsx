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
  TrendingUp: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Building: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>
    </svg>
  ),
  Globe: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Home: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  DollarSign: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Layers: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
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
  // Asset Allocation Pie Chart
  AssetPieChart: ({ className = "w-full h-64" }) => (
    <svg className={className} viewBox="0 0 400 300" fill="none">
      <defs>
        {['#5A77AA', '#12805A', '#B8923F', '#E04848', '#8F6FC4'].map((color, i) => (
          <linearGradient key={`grad-${i}`} id={`pieGrad${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.6"/>
          </linearGradient>
        ))}
      </defs>
      <circle cx="150" cy="150" r="100" fill="none" stroke="#E4E4EA" strokeWidth="2"/>
      {/* Stocks 40% */}
      <path d="M 150 150 L 150 50 A 100 100 0 0 1 235.35 89.65 Z" fill="url(#pieGrad0)" stroke="white" strokeWidth="2"/>
      {/* Bonds 30% */}
      <path d="M 150 150 L 235.35 89.65 A 100 100 0 0 1 235.35 210.35 Z" fill="url(#pieGrad1)" stroke="white" strokeWidth="2"/>
      {/* Real Estate 15% */}
      <path d="M 150 150 L 235.35 210.35 A 100 100 0 0 1 150 250 Z" fill="url(#pieGrad2)" stroke="white" strokeWidth="2"/>
      {/* Commodities 10% */}
      <path d="M 150 150 L 150 250 A 100 100 0 0 1 89.65 210.35 Z" fill="url(#pieGrad3)" stroke="white" strokeWidth="2"/>
      {/* Cash 5% */}
      <path d="M 150 150 L 89.65 210.35 A 100 100 0 0 1 79.29 189.64 Z" fill="url(#pieGrad4)" stroke="white" strokeWidth="2"/>
      <path d="M 150 150 L 79.29 189.64 A 100 100 0 0 1 150 50 Z" fill="url(#pieGrad4)" stroke="white" strokeWidth="2" opacity="0.5"/>
      {/* Legend */}
      <g transform="translate(280, 80)">
        {[{c:'#5A77AA',l:'Stocks 40%'},{c:'#12805A',l:'Bonds 30%'},{c:'#B8923F',l:'Real Estate 15%'},{c:'#E04848',l:'Commodities 10%'},{c:'#8F6FC4',l:'Cash 5%'}].map((item, i) => (
          <g key={i} transform={`translate(0, ${i*35})`}>
            <rect width="20" height="20" fill={item.c} rx="3"/>
            <text x="28" y="15" fill="currentColor" fontSize="13">{item.l}</text>
          </g>
        ))}
      </g>
      <text x="150" y="145" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">Diversified</text>
      <text x="150" y="165" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">Portfolio</text>
    </svg>
  )
};

const PCLesson3 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const quizQuestions = [
    {
      id: 1,
      question: "What is the primary benefit of including bonds in a stock portfolio?",
      options: [
        "Bonds always provide higher returns than stocks",
        "Bonds provide diversification and reduce overall portfolio volatility",
        "Bonds are completely risk-free",
        "Bonds have no correlation with stocks"
      ],
      correct: 1,
      explanation: "Bonds typically have lower correlation with stocks and provide stability. During stock market declines, high-quality bonds often hold value or appreciate, reducing overall portfolio volatility."
    },
    {
      id: 2,
      question: "Real Estate Investment Trusts (REITs) provide exposure to:",
      options: [
        "Only residential properties",
        "A diversified portfolio of income-producing real estate",
        "Raw land only",
        "Construction companies"
      ],
      correct: 1,
      explanation: "REITs own and operate income-producing real estate across various sectors: offices, apartments, retail, healthcare facilities, data centers, and more. They must distribute 90% of taxable income as dividends."
    },
    {
      id: 3,
      question: "Why are alternative investments often considered for portfolio diversification?",
      options: [
        "They guarantee positive returns",
        "They have low correlation with traditional stock and bond markets",
        "They are easier to trade than stocks",
        "They have no fees"
      ],
      correct: 1,
      explanation: "Alternatives like commodities, hedge funds, and private equity often move independently of stocks and bonds. This low correlation can reduce overall portfolio risk when traditional markets decline."
    },
    {
      id: 4,
      question: "International diversification is valuable because:",
      options: [
        "Foreign stocks always outperform domestic stocks",
        "Different economies and markets don't move in perfect sync",
        "Currency risk doesn't exist",
        "International stocks have no volatility"
      ],
      correct: 1,
      explanation: "Global markets have different economic cycles, policies, and growth drivers. While correlations have increased with globalization, geographic diversification still provides meaningful risk reduction."
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
              <span className="px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-sm bg-brand-fill">LESSON 3 OF 12</span>
              <span className="px-3 py-1.5 bg-brand-soft  text-brand  rounded-full text-xs font-medium flex items-center gap-1.5">
                <Icons.Clock className="w-3.5 h-3.5"/>45 min read
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-semibold mb-5 leading-tight tracking-[-0.025em] text-brand">Asset Class Mastery</h1>
            <p className="text-xl text-gray-600  leading-relaxed max-w-3xl">Understand the building blocks of diversified portfolios. Master the characteristics, risks, and roles of equities, fixed income, real assets, and alternatives in portfolio construction.</p>
          </header>

          <div className="space-y-12">
            
            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20 bg-brand-fill">
                    <Icons.TrendingUp className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">Equities: Ownership Stakes</h2>
                    <p className="text-sm text-gray-500 ">The growth engine of portfolios</p>
                  </div>
                </div>
                
                <p className="text-gray-700  leading-relaxed mb-6">Stocks represent ownership in companies. When you buy shares, you become a part-owner entitled to a portion of profits (dividends) and capital appreciation. Historically, equities have been the primary driver of long-term wealth creation.</p>
                
                {/* Visual: Asset Allocation Pie Chart */}
                <div className="rounded-2xl p-8 mb-6 shadow-lg bg-brand-fill">
                  <h4 className="text-white font-bold mb-4 text-center">Visual: Sample Diversified Portfolio</h4>
                  <Icons.AssetPieChart className="w-full h-64"/>
                  <div className="mt-4 text-center text-sm text-gray-300">
                    A well-diversified portfolio spreads risk across multiple asset classes
                  </div>
                </div>
                
                <div className="rounded-xl p-8 mb-6 bg-brand-fill">
                  <h4 className="text-white font-semibold mb-4 text-center">Equity Categories</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-brand font-bold mb-2">By Size</div>
                      <div className="text-gray-400 text-sm space-y-1">
                        <p>Large Cap (&gt;$10B)</p>
                        <p>Mid Cap ($2-10B)</p>
                        <p>Small Cap (&lt;$2B)</p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-brand font-bold mb-2">By Style</div>
                      <div className="text-gray-400 text-sm space-y-1">
                        <p>Value (cheap metrics)</p>
                        <p>Growth (high growth)</p>
                        <p>Blend (mixed)</p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-brand font-bold mb-2">By Geography</div>
                      <div className="text-gray-400 text-sm space-y-1">
                        <p>Domestic</p>
                        <p>Developed Int'l</p>
                        <p>Emerging Markets</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                    <h4 className="font-bold text-brand  mb-2">✓ Strengths</h4>
                    <ul className="text-sm text-gray-600  space-y-1">
                      <li>• Highest long-term returns historically</li>
                      <li>• Inflation protection through growth</li>
                      <li>• Dividend income potential</li>
                      <li>• High liquidity</li>
                    </ul>
                  </div>
                  <div className="bg-red-50  rounded-xl p-5 border border-red-200 ">
                    <h4 className="font-bold text-red-800  mb-2">⚠ Risks</h4>
                    <ul className="text-sm text-gray-600  space-y-1">
                      <li>• High short-term volatility</li>
                      <li>• Can lose 50%+ in crashes</li>
                      <li>• No guaranteed returns</li>
                      <li>• Company-specific risks</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 bg-brand-fill">
                    <Icons.DollarSign className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">Fixed Income: Lending Your Money</h2>
                    <p className="text-sm text-gray-500 ">The stabilizer of portfolios</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">Bonds are loans you make to governments or corporations. In exchange, you receive regular interest payments and return of principal at maturity. They typically provide stability and income.</p>

                <div className="bg-gray-50  rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-gray-900  mb-4">Bond Categories</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 ">
                          <th className="pb-3 font-medium">Type</th>
                          <th className="pb-3 font-medium">Risk Level</th>
                          <th className="pb-3 font-medium">Typical Yield</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700 ">
                        <tr className="border-t border-gray-200 ">
                          <td className="py-3">Treasury Bonds</td>
                          <td className="py-3"><span className="px-2 py-1 bg-brand-soft  text-brand  rounded text-xs">Very Low</span></td>
                          <td className="py-3">3-5%</td>
                        </tr>
                        <tr className="border-t border-gray-200 ">
                          <td className="py-3">Investment Grade Corporate</td>
                          <td className="py-3"><span className="px-2 py-1 bg-blue-100  text-blue-700  rounded text-xs">Low-Medium</span></td>
                          <td className="py-3">4-6%</td>
                        </tr>
                        <tr className="border-t border-gray-200 ">
                          <td className="py-3">High Yield (Junk)</td>
                          <td className="py-3"><span className="px-2 py-1 bg-amber-100  text-amber-700  rounded text-xs">Medium-High</span></td>
                          <td className="py-3">6-9%</td>
                        </tr>
                        <tr className="border-t border-gray-200 ">
                          <td className="py-3">Emerging Market</td>
                          <td className="py-3"><span className="px-2 py-1 bg-red-100  text-red-700  rounded text-xs">High</span></td>
                          <td className="py-3">7-12%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-xl p-6 border-l-4 border-amber-400 mb-6">
                  <div className="flex items-start gap-3">
                    <Icons.Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <h4 className="font-bold text-gray-900  mb-2">Interest Rate Risk</h4>
                      <p className="text-gray-700  text-sm leading-relaxed">Bond prices move inversely to interest rates. When rates rise, existing bond prices fall. Longer-duration bonds are more sensitive to rate changes than short-term bonds.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl p-6 bg-brand-fill">
                  <h4 className="text-white font-semibold mb-3 text-center">The Role of Bonds in Portfolios</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-blue-400 font-bold">Stability</div>
                      <p className="text-gray-400 text-sm">Lower volatility than stocks</p>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-bold">Income</div>
                      <p className="text-gray-400 text-sm">Regular interest payments</p>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-bold">Diversification</div>
                      <p className="text-gray-400 text-sm">Often rise when stocks fall</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20 bg-brand-fill">
                    <Icons.Building className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">Real Assets: Tangible Value</h2>
                    <p className="text-sm text-gray-500 ">Physical assets with intrinsic worth</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">Real assets have physical form and intrinsic value. They often serve as inflation hedges because their value tends to rise with general price levels.</p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-50  rounded-xl p-6 border border-amber-200 ">
                    <div className="flex items-center gap-3 mb-4">
                      <Icons.Home className="w-8 h-8 text-amber-600 "/>
                      <h4 className="font-bold text-gray-900 ">Real Estate</h4>
                    </div>
                    <p className="text-sm text-gray-600  mb-3">Access through REITs (Real Estate Investment Trusts) or direct property ownership.</p>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center gap-2 text-gray-700 ">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"/>Income from rent
                      </li>
                      <li className="flex items-center gap-2 text-gray-700 ">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"/>Appreciation potential
                      </li>
                      <li className="flex items-center gap-2 text-gray-700 ">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"/>Inflation hedge
                      </li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50  rounded-xl p-6 border border-yellow-200 ">
                    <div className="flex items-center gap-3 mb-4">
                      <Icons.Layers className="w-8 h-8 text-yellow-600 "/>
                      <h4 className="font-bold text-gray-900 ">Commodities</h4>
                    </div>
                    <p className="text-sm text-gray-600  mb-3">Raw materials: gold, oil, agricultural products, industrial metals.</p>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center gap-2 text-gray-700 ">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"/>Portfolio diversification
                      </li>
                      <li className="flex items-center gap-2 text-gray-700 ">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"/>Inflation protection
                      </li>
                      <li className="flex items-center gap-2 text-gray-700 ">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"/>Crisis hedge (gold)
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50  rounded-xl p-6">
                  <h4 className="font-bold text-gray-900  mb-4">REIT Sectors</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Residential", "Office", "Retail", "Industrial", "Healthcare", "Data Centers", "Cell Towers", "Storage"].map((sector, i) => (
                      <div key={i} className="bg-white  rounded-lg px-3 py-2 text-center text-sm text-gray-700 ">
                        {sector}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 bg-brand-fill">
                    <Icons.Layers className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">Alternative Investments</h2>
                    <p className="text-sm text-gray-500 ">Beyond traditional stocks and bonds</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">Alternatives encompass a wide range of investments outside traditional stocks, bonds, and cash. They often have unique risk-return profiles and low correlation with public markets.</p>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-purple-50  rounded-xl p-5 border border-purple-200 ">
                    <h4 className="font-bold text-purple-800  mb-3">Private Equity</h4>
                    <p className="text-sm text-gray-600 ">Ownership in private companies. Includes venture capital (early stage) and buyouts (mature companies).</p>
                    <div className="mt-3 text-xs text-purple-600 ">Typical: Long lock-up periods, high minimums</div>
                  </div>
                  <div className="bg-indigo-50  rounded-xl p-5 border border-indigo-200 ">
                    <h4 className="font-bold text-indigo-800  mb-3">Hedge Funds</h4>
                    <p className="text-sm text-gray-600 ">Pooled funds using various strategies: long/short, arbitrage, macro, event-driven.</p>
                    <div className="mt-3 text-xs text-indigo-600 ">Typical: 2% management fee, 20% performance fee</div>
                  </div>
                  <div className="bg-violet-50  rounded-xl p-5 border border-violet-200 ">
                    <h4 className="font-bold text-violet-800  mb-3">Private Credit</h4>
                    <p className="text-sm text-gray-600 ">Direct lending to companies outside public bond markets. Higher yields but less liquidity.</p>
                    <div className="mt-3 text-xs text-violet-600 ">Typical: Floating rate, senior secured</div>
                  </div>
                  <div className="bg-pink-50  rounded-xl p-5 border border-pink-200 ">
                    <h4 className="font-bold text-pink-800  mb-3">Infrastructure</h4>
                    <p className="text-sm text-gray-600 ">Roads, utilities, airports, telecommunications. Stable cash flows, often inflation-linked.</p>
                    <div className="mt-3 text-xs text-pink-600 ">Typical: Long-duration, regulated returns</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-violet-50   rounded-xl p-6 border-l-4 border-purple-500">
                  <h4 className="font-bold text-gray-900  mb-2">Considerations for Alternatives</h4>
                  <ul className="text-sm text-gray-700  space-y-2">
                    <li>• <strong>Illiquidity:</strong> Many alternatives lock up capital for years</li>
                    <li>• <strong>High minimums:</strong> Often $250K+ for direct access</li>
                    <li>• <strong>Complexity:</strong> Require due diligence expertise</li>
                    <li>• <strong>Fees:</strong> Generally higher than traditional investments</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20 bg-brand-fill">
                    <Icons.Globe className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">Global Diversification</h2>
                    <p className="text-sm text-gray-500 ">Expanding beyond domestic markets</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">Geographic diversification reduces country-specific risks and captures growth opportunities worldwide. The global stock market is roughly 60% US, 25% developed international, and 15% emerging markets.</p>

                <div className="rounded-xl p-6 mb-6 bg-brand-fill">
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-cyan-400 font-bold text-xl mb-1">US Markets</div>
                      <p className="text-gray-400 text-sm">Large, liquid, tech-heavy</p>
                      <p className="text-gray-500 text-xs mt-2">Home bias often leads to overweight</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-teal-400 font-bold text-xl mb-1">Developed Int'l</div>
                      <p className="text-gray-400 text-sm">Europe, Japan, Australia</p>
                      <p className="text-gray-500 text-xs mt-2">Different valuations, sectors</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-brand font-bold text-xl mb-1">Emerging Markets</div>
                      <p className="text-gray-400 text-sm">China, India, Brazil</p>
                      <p className="text-gray-500 text-xs mt-2">Higher growth, higher risk</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-xl p-6 border-l-4 border-amber-400">
                  <div className="flex items-start gap-3">
                    <Icons.Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <h4 className="font-bold text-gray-900  mb-2">Currency Considerations</h4>
                      <p className="text-gray-700  text-sm leading-relaxed">International investments add currency risk. When the dollar strengthens, foreign returns are reduced when converted back. Some investors hedge currency; others accept it as additional diversification.</p>
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
                    <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">Knowledge Check</h2>
                    <p className="text-sm text-gray-500 ">Test your understanding of asset classes</p>
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
                        <div className="mt-4 p-4 bg-brand-soft  rounded-lg border border-brand-line ">
                          <p className="text-sm text-brand "><strong>Explanation:</strong> {q.explanation}</p>
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
                    <p className="text-white/85">{calculateScore() === quizQuestions.length ? "Outstanding! You've mastered asset class fundamentals." : "Review the explanations to strengthen your knowledge."}</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/pc-lesson-2')} className="flex items-center gap-2 px-6 py-3 bg-gray-100  text-gray-700  rounded-xl font-medium hover:bg-gray-200  transition-colors">
              <Icons.ArrowLeft className="w-4 h-4"/><span>Previous: Risk and Return</span>
            </button>
            <button onClick={() => navigate('/learn/pc-lesson-4')} className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-brand/25 transition-all duration-200 bg-brand-fill">
              <span>Next: Strategic Asset Allocation</span><Icons.ArrowRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PCLesson3;
