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
  DollarSign: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Shield: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  MapPin: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
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
  // Tax-Advantaged Account Layers
  TaxAccountViz: ({ className = "w-full h-56" }) => (
    <svg className={className} viewBox="0 0 400 250" fill="none">
      <defs>
        {['#16A34A', '#5A77AA', '#B8923F'].map((color, i) => (
          <linearGradient key={`tGrad-${i}`} id={`taxGrad${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.7"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.4"/>
          </linearGradient>
        ))}
      </defs>
      {/* Three account layers */}
      <rect x="80" y="50" width="100" height="50" fill="url(#taxGrad0)" stroke="white" strokeWidth="2" rx="6"/>
      <text x="130" y="70" fill="white" fontSize="13" fontWeight="bold" textAnchor="middle">Tax-Deferred</text>
      <text x="130" y="88" fill="white" fontSize="11" textAnchor="middle">401(k), IRA</text>
      <rect x="190" y="50" width="100" height="50" fill="url(#taxGrad1)" stroke="white" strokeWidth="2" rx="6"/>
      <text x="240" y="70" fill="white" fontSize="13" fontWeight="bold" textAnchor="middle">Tax-Free</text>
      <text x="240" y="88" fill="white" fontSize="11" textAnchor="middle">Roth, HSA</text>
      <rect x="135" y="110" width="130" height="50" fill="url(#taxGrad2)" stroke="white" strokeWidth="2" rx="6"/>
      <text x="200" y="130" fill="white" fontSize="13" fontWeight="bold" textAnchor="middle">Taxable</text>
      <text x="200" y="148" fill="white" fontSize="11" textAnchor="middle">Brokerage Account</text>
      {/* Asset placement arrows */}
      <g transform="translate(50, 180)">
        <text x="0" y="0" fill="currentColor" fontSize="12" fontWeight="bold">Best Assets by Account:</text>
        <text x="0" y="20" fill="#16A34A" fontSize="11">• Tax-Deferred: Bonds, REITs</text>
        <text x="0" y="38" fill="#5A77AA" fontSize="11">• Tax-Free: High-growth stocks</text>
        <text x="0" y="56" fill="#B8923F" fontSize="11">• Taxable: Index funds, muni bonds</text>
      </g>
      <text x="200" y="25" fill="currentColor" opacity="0.7" fontSize="14" fontWeight="bold" textAnchor="middle">Tax-Efficient Account Structure</text>
    </svg>
  )
};

const PCLesson10 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  

  const quizQuestions = [
    {
      id: 1,
      question: "What is tax-loss harvesting?",
      options: [
        "Selling all your losing investments",
        "Selling investments at a loss to offset gains and reduce taxes",
        "Avoiding taxes by moving to another country",
        "Waiting until retirement to sell"
      ],
      correct: 1,
      explanation: "Tax-loss harvesting means strategically selling investments at a loss to offset capital gains from other sales. The losses reduce your taxable gains, and up to $3,000 can offset ordinary income annually."
    },
    {
      id: 2,
      question: "Why should bonds generally be held in tax-advantaged accounts?",
      options: [
        "Bonds are riskier",
        "Bond interest is taxed as ordinary income, which has higher rates than capital gains",
        "Bonds don't grow in value",
        "IRAs only allow bonds"
      ],
      correct: 1,
      explanation: "Bond interest is taxed as ordinary income (up to 37%), while stock gains are taxed at preferential capital gains rates (0-20%). Sheltering bonds in tax-advantaged accounts protects their income from the higher ordinary income rates."
    },
    {
      id: 3,
      question: "The wash sale rule prevents you from:",
      options: [
        "Selling stocks at all",
        "Claiming a loss if you buy substantially identical securities within 30 days",
        "Holding mutual funds",
        "Rebalancing your portfolio"
      ],
      correct: 1,
      explanation: "The wash sale rule disallows a loss deduction if you buy the same or substantially identical security within 30 days before or after the sale. This prevents tax-motivated sales where you immediately buy back the same investment."
    },
    {
      id: 4,
      question: "Asset location strategy can add approximately how much to after-tax returns annually?",
      options: [
        "0.01% to 0.05%",
        "0.20% to 0.75%",
        "2% to 3%",
        "5% to 10%"
      ],
      correct: 1,
      explanation: "Research suggests proper asset location can add 0.20% to 0.75% annually to after-tax returns. While this seems small, over decades of compounding, it can add up to significant wealth - potentially $100,000+ on a large portfolio."
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
              <span className="px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-sm bg-brand-fill">LESSON 10 OF 12</span>
              <span className="px-3 py-1.5 bg-brand-soft  text-brand  rounded-full text-xs font-medium flex items-center gap-1.5">
                <Icons.Clock className="w-3.5 h-3.5"/>45 min read
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-5 leading-tight tracking-[-0.025em] text-brand">Tax-Efficient Investing</h1>
            <p className="text-xl text-gray-600  leading-relaxed max-w-3xl">Master the strategies that keep more money in your pocket. Learn tax-loss harvesting, asset location, and other techniques to minimize your tax burden while maximizing after-tax returns.</p>
          </header>

          <div className="space-y-12">
            
            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20 bg-brand-fill">
                      <Icons.DollarSign className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Why Tax Efficiency Matters</h2>
                      <p className="text-sm text-gray-500 ">The return you keep is what counts</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700  leading-relaxed mb-6">Taxes are often the largest expense for investors. While you can't control market returns, you have significant control over tax efficiency. The goal isn't to avoid all taxes - it's to maximize after-tax wealth by deferring taxes, using preferential rates, and harvesting losses strategically.</p>

                  <div className="rounded-xl p-6 mb-6 bg-brand-fill">
                    <h4 className="text-white font-semibold mb-4 text-center">Tax Drag: The Hidden Wealth Destroyer</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-brand text-sm mb-2">Pre-Tax Return</div>
                        <div className="text-white text-2xl font-bold mb-1">8%</div>
                        <div className="text-gray-400 text-xs">Annual return</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-amber-400 text-sm mb-2">Tax-Inefficient</div>
                        <div className="text-white text-2xl font-bold mb-1">5.6%</div>
                        <div className="text-gray-400 text-xs">After 30% tax drag</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-brand text-sm mb-2">Tax-Efficient</div>
                        <div className="text-white text-2xl font-bold mb-1">7.2%</div>
                        <div className="text-gray-400 text-xs">After 10% tax drag</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-brand text-center">
                      <span className="text-gray-400 text-xs">Over 30 years, a 1.6% annual difference can mean 50%+ more wealth</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                      <h4 className="font-bold text-brand  mb-2">Short-Term Gains</h4>
                      <p className="text-sm text-gray-700 ">Held less than 1 year. Taxed as ordinary income at your marginal rate (up to 37%).</p>
                    </div>
                    <div className="bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                      <h4 className="font-bold text-brand  mb-2">Long-Term Gains</h4>
                      <p className="text-sm text-gray-700 ">Held more than 1 year. Taxed at preferential rates: 0%, 15%, or 20% depending on income.</p>
                    </div>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20 bg-brand-fill">
                      <Icons.Shield className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Tax-Loss Harvesting</h2>
                      <p className="text-sm text-gray-500 ">Turn losses into tax savings</p>
                    </div>
                  </div>

                  <p className="text-gray-700  leading-relaxed mb-6">Tax-loss harvesting involves selling investments at a loss to offset capital gains. The losses reduce your tax bill, while you maintain your investment exposure by buying a similar (but not identical) security.</p>

                  <div className="rounded-xl p-6 mb-6 bg-brand-fill">
                    <h4 className="text-white font-semibold mb-4 text-center">How Tax-Loss Harvesting Works</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                        <span className="w-8 h-8 bg-brand-fill rounded-full flex items-center justify-center text-white font-bold text-sm">1</span>
                        <div className="text-gray-300 text-sm flex-1">Identify investments with unrealized losses</div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                        <span className="w-8 h-8 bg-brand-fill rounded-full flex items-center justify-center text-white font-bold text-sm">2</span>
                        <div className="text-gray-300 text-sm flex-1">Sell those investments to realize the loss</div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                        <span className="w-8 h-8 bg-brand-fill rounded-full flex items-center justify-center text-white font-bold text-sm">3</span>
                        <div className="text-gray-300 text-sm flex-1">Immediately buy a similar but not identical replacement</div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                        <span className="w-8 h-8 bg-brand-fill rounded-full flex items-center justify-center text-white font-bold text-sm">4</span>
                        <div className="text-gray-300 text-sm flex-1">Use losses to offset gains; excess offsets $3,000 income</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                      <h4 className="font-bold text-brand  mb-3">Benefits</h4>
                      <ul className="text-sm text-gray-700  space-y-2">
                        <li className="flex items-start gap-2"><Icons.CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0"/>Offset capital gains dollar-for-dollar</li>
                        <li className="flex items-start gap-2"><Icons.CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0"/>Offset up to $3,000 ordinary income annually</li>
                        <li className="flex items-start gap-2"><Icons.CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0"/>Unused losses carry forward indefinitely</li>
                        <li className="flex items-start gap-2"><Icons.CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0"/>Maintain market exposure throughout</li>
                      </ul>
                    </div>

                    <div className="bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                      <h4 className="font-bold text-amber-800  mb-3 flex items-center gap-2">
                        <Icons.AlertTriangle className="w-5 h-5"/> Wash Sale Rule
                      </h4>
                      <p className="text-sm text-gray-700  mb-2">You cannot claim a loss if you buy "substantially identical" securities within 30 days before or after the sale.</p>
                      <div className="p-3 bg-amber-100  rounded-lg text-xs text-amber-700 ">
                        Solution: Buy similar but not identical replacement (e.g., different index fund tracking same market)
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50  rounded-xl p-6">
                    <h4 className="font-bold text-gray-900  mb-3">Example: TLH in Action</h4>
                    <div className="text-sm text-gray-700  space-y-2">
                      <p>You own Total Stock Market ETF (VTI) with a $10,000 loss. You also have $10,000 in capital gains from other sales.</p>
                      <p className="font-semibold text-brand ">Action: Sell VTI (realize $10,000 loss). Immediately buy S&P 500 ETF (SPY) to maintain stock exposure.</p>
                      <p>Result: The $10,000 loss offsets your $10,000 gain. You owe $0 capital gains tax instead of ~$1,500-$2,000.</p>
                    </div>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 bg-brand-fill">
                      <Icons.MapPin className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Asset Location Strategy</h2>
                      <p className="text-sm text-gray-500 ">The right asset in the right account</p>
                    </div>
                  </div>

                  <p className="text-gray-700  leading-relaxed mb-6">Asset location is deciding which investments go in which account types (taxable, traditional IRA, Roth IRA) to minimize lifetime taxes. Different assets have different tax characteristics, and matching them to the right account type can add significant value.</p>

                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 ">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 ">Asset Type</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 ">Tax Efficiency</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 ">Best Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { asset: "Stock Index Funds", efficiency: "High", location: "Taxable", color: "emerald" },
                          { asset: "Municipal Bonds", efficiency: "Very High", location: "Taxable", color: "emerald" },
                          { asset: "Individual Stocks (buy & hold)", efficiency: "High", location: "Taxable", color: "emerald" },
                          { asset: "Taxable Bonds", efficiency: "Low", location: "Tax-Advantaged", color: "amber" },
                          { asset: "REITs", efficiency: "Low", location: "Tax-Advantaged", color: "amber" },
                          { asset: "High-Turnover Funds", efficiency: "Low", location: "Tax-Advantaged", color: "amber" },
                          { asset: "High-Growth Stocks", efficiency: "Variable", location: "Roth (if expect growth)", color: "blue" }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="py-3 px-4 text-gray-700">{row.asset}</td>
                            <td className={`py-3 px-4 text-center font-medium text-${row.color}-600`}>{row.efficiency}</td>
                            <td className="py-3 px-4 text-center text-gray-900 font-medium">{row.location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                      <h4 className="font-bold text-brand  mb-2">Taxable Account</h4>
                      <p className="text-xs text-gray-600  mb-2">Best for tax-efficient assets</p>
                      <ul className="text-xs text-gray-700  space-y-1">
                        <li>Stock index funds/ETFs</li>
                        <li>Muni bonds</li>
                        <li>Buy-and-hold stocks</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                      <h4 className="font-bold text-blue-800  mb-2">Traditional IRA/401(k)</h4>
                      <p className="text-xs text-gray-600  mb-2">Best for tax-inefficient assets</p>
                      <ul className="text-xs text-gray-700  space-y-1">
                        <li>Taxable bonds</li>
                        <li>REITs</li>
                        <li>High-turnover funds</li>
                      </ul>
                    </div>

                    <div className="bg-violet-50  rounded-xl p-5 border border-violet-200 ">
                      <h4 className="font-bold text-violet-800  mb-2">Roth IRA</h4>
                      <p className="text-xs text-gray-600  mb-2">Best for highest-growth potential</p>
                      <ul className="text-xs text-gray-700  space-y-1">
                        <li>Growth stocks</li>
                        <li>Emerging markets</li>
                        <li>Small caps</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50   rounded-xl p-6 border-l-4 border-blue-500">
                    <h4 className="font-bold text-gray-900  mb-2">The Logic</h4>
                    <p className="text-gray-700  text-sm">Put assets with the worst tax treatment (ordinary income) in tax-sheltered accounts. Put assets with best tax treatment (qualified dividends, long-term gains) in taxable accounts where you'd pay lower rates anyway.</p>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20 bg-brand-fill">
                      <Icons.Shield className="w-7 h-7 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Tax-Advantaged Accounts</h2>
                      <p className="text-sm text-gray-500 ">Optimizing account structure</p>
                    </div>
                  </div>
                  
                  {/* Visual: Tax Account Structure */}
                  <div className="bg-gradient-to-br from-gray-900 to-amber-950 rounded-2xl p-8 mb-6 shadow-lg brand-on-dark">
                    <h4 className="text-white font-bold mb-4 text-center">Visual: Tax-Efficient Account Layering</h4>
                    <Icons.TaxAccountViz className="w-full h-56"/>
                    <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
                      <span className="text-gray-300">Strategic asset placement maximizes after-tax returns</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700  leading-relaxed mb-6">Tax-efficient investing requires strategic use of different account types. Understanding how to layer assets across tax-deferred, tax-free, and taxable accounts can significantly boost after-tax returns.</p>
                  
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 ">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 ">Investment Type</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 ">Tax Treatment</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 ">Strategy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { investment: "Equity Funds (>1 year)", tax: "12.5% LTCG (₹1.25L exempt)", strategy: "Hold >1 year, harvest exemption" },
                          { investment: "Equity Funds (<1 year)", tax: "20% STCG", strategy: "Avoid short-term trading" },
                          { investment: "Debt Funds (any period)", tax: "At slab rate", strategy: "Less attractive post-2023 changes" },
                          { investment: "PPF/EPF", tax: "EEE (exempt-exempt-exempt)", strategy: "Max out for tax-free growth" },
                          { investment: "NPS Tier-I", tax: "80C + 80CCD(1B) deduction", strategy: "Additional ₹50k deduction" },
                          { investment: "ELSS", tax: "80C deduction, LTCG on exit", strategy: "3-year lock-in" }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-gray-100 ">
                            <td className="py-3 px-4 text-gray-700 ">{row.investment}</td>
                            <td className="py-3 px-4 text-center text-gray-900  text-xs">{row.tax}</td>
                            <td className="py-3 px-4 text-center text-gray-600  text-xs">{row.strategy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-orange-50  rounded-xl p-6 border border-orange-200 ">
                      <h4 className="font-bold text-orange-800  mb-3">Tax-Loss Harvesting (Indian Style)</h4>
                      <p className="text-sm text-gray-600  mb-3">Harvest losses to offset LTCG/STCG in same financial year:</p>
                      <div className="space-y-2 text-xs">
                        <div className="bg-orange-100  rounded-lg p-2">
                          <p className="font-medium text-orange-900 ">Before March 31:</p>
                          <p className="text-orange-700 ">Sell losing equity positions to offset realized gains</p>
                        </div>
                        <div className="bg-orange-100  rounded-lg p-2">
                          <p className="font-medium text-orange-900 ">Repurchase:</p>
                          <p className="text-orange-700 ">No wash-sale rule in India - can repurchase immediately</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-brand-soft  rounded-xl p-6 border border-brand-line ">
                      <h4 className="font-bold text-brand  mb-3">Section 80C Optimization</h4>
                      <p className="text-sm text-gray-600  mb-2">Max ₹1.5L deduction (30% tax bracket = ₹46,500 saved):</p>
                      <ul className="space-y-1 text-xs text-gray-700 ">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-brand-fill rounded-full mt-1 flex-shrink-0"/>
                          ELSS (equity exposure + 3yr lock-in)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-brand-fill rounded-full mt-1 flex-shrink-0"/>
                          PPF (EEE status, 15yr maturity)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-brand-fill rounded-full mt-1 flex-shrink-0"/>
                          NPS Tier-I (additional ₹50k under 80CCD(1B))
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-green-50   rounded-xl p-6 border-l-4 border-orange-500">
                    <h4 className="font-bold text-gray-900  mb-2">2023 Debt Fund Tax Change Impact</h4>
                    <p className="text-gray-700  text-sm leading-relaxed mb-2">Post-April 2023, debt mutual funds lost indexation benefit and LTCG treatment. Gains are now taxed at slab rate regardless of holding period.</p>
                    <p className="text-gray-600  text-xs"><strong>Implication:</strong> For debt allocation, consider tax-free bonds, PPF, or debt ETFs (still get LTCG after 3 years). Direct bonds held to maturity avoid capital gains entirely.</p>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20 bg-brand-fill">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Advanced Tax Strategies</h2>
                      <p className="text-sm text-gray-500 ">Beyond the basics</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-violet-50  rounded-xl p-5 border border-violet-200 ">
                      <h4 className="font-bold text-violet-800  mb-2">Tax-Gain Harvesting</h4>
                      <p className="text-sm text-gray-700 ">In years when your income is low (retirement, sabbatical), realize long-term gains in the 0% capital gains bracket. This "resets" your cost basis higher, reducing future taxes.</p>
                    </div>

                    <div className="bg-purple-50  rounded-xl p-5 border border-purple-200 ">
                      <h4 className="font-bold text-purple-800  mb-2">Charitable Giving with Appreciated Stock</h4>
                      <p className="text-sm text-gray-700 ">Donate appreciated securities instead of cash. You get a deduction for the full value and avoid paying capital gains tax on the appreciation. Double tax benefit.</p>
                    </div>

                    <div className="bg-indigo-50  rounded-xl p-5 border border-indigo-200 ">
                      <h4 className="font-bold text-indigo-800  mb-2">Roth Conversions</h4>
                      <p className="text-sm text-gray-700 ">Convert traditional IRA to Roth in low-income years. You pay tax now at a lower rate to get tax-free growth and withdrawals later. Especially powerful early in career or retirement.</p>
                    </div>

                    <div className="bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                      <h4 className="font-bold text-blue-800  mb-2">Specific Lot Identification</h4>
                      <p className="text-sm text-gray-700 ">When selling, specify which lot (purchase) you're selling. Choose lots with highest cost basis to minimize gains, or lots with lowest cost basis if harvesting losses.</p>
                    </div>

                    <div className="bg-cyan-50  rounded-xl p-5 border border-cyan-200 ">
                      <h4 className="font-bold text-cyan-800  mb-2">Holding Period Management</h4>
                      <p className="text-sm text-gray-700 ">Wait to sell until you've held for over a year to qualify for long-term capital gains rates. The difference between short-term (37%) and long-term (15-20%) rates is significant.</p>
                    </div>
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
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Common Tax Mistakes</h2>
                      <p className="text-sm text-gray-500 ">Pitfalls to avoid</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-rose-50  rounded-xl p-5 border border-rose-200 ">
                      <h4 className="font-bold text-rose-800  mb-2">Letting Tax Tail Wag the Dog</h4>
                      <p className="text-sm text-gray-700 ">Never let taxes alone drive investment decisions. A bad investment with tax benefits is still a bad investment. Focus on after-tax returns, not just tax savings.</p>
                    </div>

                    <div className="bg-red-50  rounded-xl p-5 border border-red-200 ">
                      <h4 className="font-bold text-red-800  mb-2">Wash Sale Violations</h4>
                      <p className="text-sm text-gray-700 ">Buying back the same security within 30 days invalidates your loss. Also applies across accounts (spouse's too) and to reinvested dividends. Plan carefully.</p>
                    </div>

                    <div className="bg-orange-50  rounded-xl p-5 border border-orange-200 ">
                      <h4 className="font-bold text-orange-800  mb-2">Ignoring Asset Location</h4>
                      <p className="text-sm text-gray-700 ">Holding bonds in taxable accounts and stocks in IRAs is backward. This common mistake costs investors 0.2-0.5%+ annually in unnecessary taxes.</p>
                    </div>

                    <div className="bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                      <h4 className="font-bold text-amber-800  mb-2">Failing to Tax-Loss Harvest</h4>
                      <p className="text-sm text-gray-700 ">Opportunities arise during market downturns. Investors who don't harvest losses during drops miss valuable tax benefits. Set up a system or use automated services.</p>
                    </div>

                    <div className="bg-yellow-50  rounded-xl p-5 border border-yellow-200 ">
                      <h4 className="font-bold text-yellow-800  mb-2">Short-Term Trading</h4>
                      <p className="text-sm text-gray-700 ">Frequent trading generates short-term gains taxed at ordinary income rates. A 35% tax rate vs 15% long-term rate dramatically compounds over time.</p>
                    </div>
                  </div>

                  <div className="rounded-xl p-6 border-l-4 border-brand bg-brand-soft">
                    <h4 className="font-bold text-gray-900  mb-2">The Bottom Line</h4>
                    <p className="text-gray-700  text-sm">Tax efficiency is about keeping more of what you earn. Implement these strategies systematically: use tax-advantaged accounts fully, practice asset location, harvest losses regularly, and hold long-term. Small annual savings compound into major wealth differences.</p>
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
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Knowledge Check</h2>
                      <p className="text-sm text-gray-500 ">Test your understanding of tax-efficient investing</p>
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
                      <p className="text-white/85">{calculateScore() === quizQuestions.length ? "Excellent! You understand tax-efficient investing strategies." : "Review the explanations to master tax-efficient investing."}</p>
                    </div>
                  )}
                </div>
              </section>
          </div>

          <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/pc-lesson-9')} className="flex items-center gap-2 px-6 py-3 bg-gray-100  text-gray-700  rounded-xl font-medium hover:bg-gray-200  transition-colors">
              <Icons.ArrowLeft className="w-4 h-4"/><span>Previous Lesson</span>
            </button>
            <button onClick={() => navigate('/learn/pc-lesson-11')} className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-brand/25 transition-all duration-200 bg-brand-fill">
              <span>Next: Stress Testing</span><Icons.ArrowRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PCLesson10;
