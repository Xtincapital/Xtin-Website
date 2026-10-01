import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import ModuleBadge from "../../components/ModuleBadge";

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
  Award: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="7"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/>
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
  // Efficient Frontier Visualization
  EfficientFrontier: ({ className = "w-full h-64" }) => (
    <svg className={className} viewBox="0 0 400 300" fill="none">
      <defs>
        <linearGradient id="frontierGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3"/>
        </linearGradient>
      </defs>
      {/* Axes */}
      <line x1="50" y1="250" x2="380" y2="250" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <line x1="50" y1="250" x2="50" y2="20" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      {/* Labels */}
      <text x="200" y="285" fill="currentColor" opacity="0.6" fontSize="14" textAnchor="middle">Risk (σ)</text>
      <text x="15" y="140" fill="currentColor" opacity="0.6" fontSize="14" textAnchor="middle" transform="rotate(-90 15 140)">Return (μ)</text>
      {/* Inefficient portfolios (dots) */}
      {[{x:100,y:200},{x:120,y:190},{x:150,y:180},{x:180,y:185},{x:200,y:175},{x:220,y:195},{x:250,y:170}].map((pt, i) => (
        <circle key={`ineff-${i}`} cx={pt.x} cy={pt.y} r="4" fill="#94a3b8" opacity="0.4"/>
      ))}
      {/* Efficient Frontier Curve */}
      <path d="M 80 220 Q 150 120 320 80" stroke="#3b82f6" strokeWidth="3" fill="none"/>
      <path d="M 80 220 Q 150 120 320 80 L 320 250 L 80 250 Z" fill="url(#frontierGrad)"/>
      {/* Optimal Portfolio Point */}
      <circle cx="200" cy="130" r="8" fill="#8b5cf6" stroke="white" strokeWidth="2"/>
      <text x="200" y="115" fill="#8b5cf6" fontSize="12" fontWeight="bold" textAnchor="middle">Optimal</text>
      {/* Min Risk Point */}
      <circle cx="100" cy="200" r="6" fill="#10b981" stroke="white" strokeWidth="2"/>
      <text x="100" y="220" fill="#10b981" fontSize="11" textAnchor="middle">Min Risk</text>
    </svg>
  ),
  // Diversification Benefit
  DiversificationChart: ({ className = "w-full h-48" }) => (
    <svg className={className} viewBox="0 0 400 200" fill="none">
      {/* Background grid */}
      {[0,1,2,3,4].map(i => (
        <line key={`grid-${i}`} x1="50" y1={40 + i*35} x2="370" y2={40 + i*35} stroke="currentColor" opacity="0.1" strokeWidth="1"/>
      ))}
      {/* Risk reduction curve */}
      <path d="M 50 40 L 100 80 L 150 110 L 200 130 L 250 145 L 300 155 L 350 160" stroke="#ef4444" strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Shaded area */}
      <path d="M 50 40 L 100 80 L 150 110 L 200 130 L 250 145 L 300 155 L 350 160 L 350 180 L 50 180 Z" fill="#ef4444" opacity="0.1"/>
      {/* Data points */}
      {[{x:50,y:40},{x:100,y:80},{x:150,y:110},{x:200,y:130},{x:250,y:145},{x:300,y:155},{x:350,y:160}].map((pt, i) => (
        <circle key={`pt-${i}`} cx={pt.x} cy={pt.y} r="5" fill="#ef4444" stroke="white" strokeWidth="2"/>
      ))}
      {/* Labels */}
      <text x="50" y="30" fill="#10b981" fontSize="12" fontWeight="bold">High Risk</text>
      <text x="350" y="195" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="end">Low Risk</text>
      <text x="200" y="195" fill="currentColor" opacity="0.6" fontSize="12" textAnchor="middle">Number of Assets →</text>
      <text x="30" y="100" fill="currentColor" opacity="0.6" fontSize="11" textAnchor="middle" transform="rotate(-90 30 100)">Portfolio Risk</text>
    </svg>
  )
};

const PCLesson1 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const quizQuestions = [
    {
      id: 1,
      question: "What was the revolutionary insight of Modern Portfolio Theory?",
      options: [
        "Higher returns always mean higher risk",
        "Risk should be measured at the portfolio level, not individual asset level",
        "Diversification is impossible to achieve",
        "Only government bonds are safe investments"
      ],
      correct: 1,
      explanation: "Markowitz showed that individual asset risk matters less than how assets behave together. Portfolio-level thinking transformed investing from art to science."
    },
    {
      id: 2,
      question: "On the efficient frontier, portfolios are optimal because they:",
      options: [
        "Have the lowest possible risk",
        "Have the highest possible return",
        "Offer maximum return for a given level of risk",
        "Contain only stocks"
      ],
      correct: 2,
      explanation: "Efficient portfolios maximize return for each risk level, or equivalently, minimize risk for each return target. No portfolio below the frontier is optimal."
    },
    {
      id: 3,
      question: "Why is correlation between assets crucial in MPT?",
      options: [
        "It determines individual stock prices",
        "Low correlation allows diversification to reduce portfolio risk",
        "High correlation guarantees profits",
        "Correlation only matters for bonds"
      ],
      correct: 1,
      explanation: "When assets don't move in lockstep (low correlation), combining them reduces overall volatility without proportionally reducing returns. This is the mathematical foundation of diversification."
    },
    {
      id: 4,
      question: "The expected return of a portfolio equals:",
      options: [
        "The return of the best-performing asset",
        "The average of all asset returns",
        "The weighted average of individual expected returns",
        "The risk-free rate plus beta"
      ],
      correct: 2,
      explanation: "Portfolio expected return is calculated as E(Rp) = sum of (weight × expected return) for each asset. It's a straightforward weighted average based on allocation percentages."
    }
  ];

  const handleQuizAnswer = (qId, aIdx) => {
    if (!showResults) {
      setQuizAnswers(prev => ({ ...prev, [qId]: aIdx }));
    }
  };

  const calculateScore = () => quizQuestions.filter(q => quizAnswers[q.id] === q.correct).length;

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-blue-50/30    text-gray-900  min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          <button onClick={() => navigate('/learn/portfolio-construction')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600  transition-colors mb-8 group">
            <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
            <span className="text-sm font-medium">Back to Portfolio Construction</span>
          </button>

          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <ModuleBadge moduleId="portfolio-construction" />
              <span className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-sm">LESSON 1 OF 12</span>
              <span className="px-3 py-1.5 bg-blue-100  text-blue-700  rounded-full text-xs font-medium flex items-center gap-1.5">
                <Icons.Clock className="w-3.5 h-3.5"/>35 min read
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900    bg-clip-text text-transparent mb-5 leading-tight">Modern Portfolio Theory</h1>
            <p className="text-xl text-gray-600  leading-relaxed max-w-3xl">Discover the mathematical framework that revolutionized investment management and earned Harry Markowitz a Nobel Prize. Learn how to think about risk and return in a portfolio context.</p>
          </header>

          <div className="space-y-12">
            
            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                    <Icons.BookOpen className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1">The Birth of Scientific Investing</h2>
                    <p className="text-sm text-gray-500 ">Where intuition met mathematics</p>
                  </div>
                </div>
                
                <p className="text-gray-700  leading-relaxed mb-6">Before 1952, investment was largely an art. Investors picked stocks based on intuition, tips, and simple analysis. Then came Harry Markowitz, a 25-year-old PhD student at the University of Chicago, who published a 14-page paper that would transform finance forever.</p>
                
                <p className="text-gray-700  leading-relaxed mb-6">His insight was deceptively simple: <strong className="text-gray-900 ">investors should care about both return AND risk</strong>, and the relationship between assets matters as much as the assets themselves. This became Modern Portfolio Theory (MPT).</p>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-xl p-6 border-l-4 border-amber-400">
                  <div className="flex items-start gap-3">
                    <Icons.Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <h4 className="font-bold text-gray-900  mb-2">Core Insight</h4>
                      <p className="text-gray-700  text-sm leading-relaxed">"Don't put all your eggs in one basket" is ancient wisdom. Markowitz mathematically proved why this works and showed exactly how to optimize basket allocation.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                    <Icons.Award className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1">The Father of Modern Finance</h2>
                    <p className="text-sm text-gray-500 ">Harry Markowitz and his Nobel-winning framework</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <p className="text-gray-700  leading-relaxed mb-4">In 1990, Markowitz received the Nobel Prize in Economics for work he started as a graduate student. The Nobel committee recognized that his framework fundamentally changed how we think about investment decisions.</p>
                    <p className="text-gray-700  leading-relaxed">Before MPT, the prevailing wisdom was to simply pick stocks with the highest expected returns. Markowitz showed this was dangerously incomplete.</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-6">
                    <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Key Contributions</h4>
                    <ul className="space-y-3">
                      {["Mean-variance optimization framework", "Efficient frontier concept", "Mathematical basis for diversification", "Risk-return trade-off quantification"].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"/>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 ">
                  <h4 className="font-bold text-gray-900  mb-4">Historical Timeline</h4>
                  <div className="flex flex-wrap gap-4">
                    {[{ year: "1952", event: "Portfolio Selection paper published" }, { year: "1959", event: "First book on portfolio theory" }, { year: "1990", event: "Nobel Prize in Economics" }].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-50  rounded-lg px-4 py-2">
                        <span className="text-blue-600  font-bold">{item.year}</span>
                        <span className="text-gray-600  text-sm">{item.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                    <Icons.TrendingUp className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1">Expected Return: The Weighted Average</h2>
                    <p className="text-sm text-gray-500 ">Calculating what you might earn</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">The expected return of a portfolio is wonderfully simple to calculate. It's just the weighted average of each asset's expected return, where the weights are your allocation percentages.</p>

                <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-xl p-8 mb-6">
                  <div className="text-center">
                    <p className="text-emerald-400 text-sm font-medium mb-3 uppercase tracking-wide">Portfolio Expected Return</p>
                    <div className="text-white text-2xl md:text-3xl font-mono">E(Rp) = w₁ × E(R₁) + w₂ × E(R₂) + ...</div>
                    <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                      <span>wᵢ = weight of asset i</span>
                      <span>E(Rᵢ) = expected return of asset i</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50  rounded-xl p-6">
                  <h4 className="font-bold text-gray-900  mb-4">Practical Example</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 ">
                          <th className="pb-3 font-medium">Asset</th>
                          <th className="pb-3 font-medium text-center">Weight</th>
                          <th className="pb-3 font-medium text-center">Expected Return</th>
                          <th className="pb-3 font-medium text-center">Contribution</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700 ">
                        <tr className="border-t border-gray-200 ">
                          <td className="py-3">US Stocks</td>
                          <td className="py-3 text-center">60%</td>
                          <td className="py-3 text-center">8%</td>
                          <td className="py-3 text-center text-emerald-600  font-medium">4.8%</td>
                        </tr>
                        <tr className="border-t border-gray-200 ">
                          <td className="py-3">Bonds</td>
                          <td className="py-3 text-center">40%</td>
                          <td className="py-3 text-center">4%</td>
                          <td className="py-3 text-center text-emerald-600  font-medium">1.6%</td>
                        </tr>
                        <tr className="border-t-2 border-gray-300  font-bold">
                          <td className="py-3" colSpan={3}>Portfolio Expected Return</td>
                          <td className="py-3 text-center text-emerald-600 ">6.4%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/20">
                    <Icons.Target className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1">Portfolio Risk: Where Magic Happens</h2>
                    <p className="text-sm text-gray-500 ">Why portfolio risk isn't just a weighted average</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">Here's where MPT gets interesting. Unlike return, <strong className="text-gray-900 ">portfolio risk is NOT simply the weighted average of individual risks</strong>. The correlation between assets creates a diversification benefit that can dramatically reduce overall portfolio volatility.</p>

                {/* Visual: Diversification Benefit */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50   rounded-2xl p-8 mb-6 border border-red-200 ">
                  <h4 className="text-gray-900  font-bold mb-4 text-center">Visual: How Diversification Reduces Risk</h4>
                  <Icons.DiversificationChart className="w-full h-48"/>
                  <p className="text-sm text-center text-gray-600  mt-4">As you add more uncorrelated assets, portfolio risk decreases but never reaches zero (systematic risk remains)</p>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-rose-950 rounded-xl p-8 mb-6">
                  <div className="text-center">
                    <p className="text-rose-400 text-sm font-medium mb-3 uppercase tracking-wide">Two-Asset Portfolio Variance</p>
                    <div className="text-white text-lg md:text-xl font-mono leading-relaxed">σ²ₚ = w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρ₁₂σ₁σ₂</div>
                    <div className="mt-4 text-sm text-gray-400">ρ₁₂ = correlation between assets (the key variable!)</div>
                  </div>
                </div>

                <div className="bg-gray-50  rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-gray-900  mb-4">The Power of Correlation</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-red-50  rounded-lg p-4 border border-red-200 ">
                      <div className="text-2xl font-bold text-red-600  mb-1">+1.0</div>
                      <div className="text-sm font-medium text-gray-900  mb-1">Perfect positive</div>
                      <div className="text-xs text-gray-600 ">No diversification benefit</div>
                    </div>
                    <div className="bg-amber-50  rounded-lg p-4 border border-amber-200 ">
                      <div className="text-2xl font-bold text-amber-600  mb-1">0.0</div>
                      <div className="text-sm font-medium text-gray-900  mb-1">Uncorrelated</div>
                      <div className="text-xs text-gray-600 ">Moderate risk reduction</div>
                    </div>
                    <div className="bg-emerald-50  rounded-lg p-4 border border-emerald-200 ">
                      <div className="text-2xl font-bold text-emerald-600  mb-1">-1.0</div>
                      <div className="text-sm font-medium text-gray-900  mb-1">Perfect negative</div>
                      <div className="text-xs text-gray-600 ">Maximum risk reduction</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50   rounded-xl p-6 border-l-4 border-blue-500">
                  <h4 className="font-bold text-gray-900  mb-2">The Diversification Dividend</h4>
                  <p className="text-gray-700  text-sm leading-relaxed">When correlation is less than +1, the portfolio risk is LESS than the weighted average of individual risks. This "free" risk reduction without sacrificing expected return is the fundamental insight of MPT.</p>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                    <Icons.BarChart className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900  mb-1">The Efficient Frontier</h2>
                    <p className="text-sm text-gray-500 ">The boundary of optimal portfolios</p>
                  </div>
                </div>

                <p className="text-gray-700  leading-relaxed mb-6">The efficient frontier represents all portfolios that offer the highest expected return for each level of risk. Any portfolio below this curve is suboptimal because you could get either more return for the same risk, or the same return with less risk.</p>

                {/* Visual: Efficient Frontier Diagram */}
                <div className="bg-gradient-to-br from-gray-900 to-blue-950 rounded-2xl p-8 mb-6 shadow-lg">
                  <h4 className="text-white font-bold mb-4 text-center">Visual: The Efficient Frontier</h4>
                  <Icons.EfficientFrontier className="w-full h-64"/>
                  <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      <span className="text-gray-300">Inefficient Portfolios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-gray-300">Efficient Frontier</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-gray-300">Optimal Portfolio</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-amber-950 rounded-xl p-6 mb-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-amber-400 text-lg font-bold mb-2">Efficient Portfolios</div>
                      <p className="text-gray-400 text-sm">Maximum return for given risk level</p>
                      <p className="text-gray-400 text-sm">Lie ON the frontier curve</p>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-gray-400 text-lg font-bold mb-2">Inefficient Portfolios</div>
                      <p className="text-gray-400 text-sm">Suboptimal risk-return trade-off</p>
                      <p className="text-gray-400 text-sm">Lie BELOW the frontier curve</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50  rounded-xl p-5 border border-emerald-200 ">
                    <h4 className="font-bold text-emerald-800  mb-2">Minimum Variance Portfolio</h4>
                    <p className="text-sm text-gray-600 ">The leftmost point on the frontier. Lowest possible risk achievable through diversification alone.</p>
                  </div>
                  <div className="bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                    <h4 className="font-bold text-amber-800  mb-2">Tangency Portfolio</h4>
                    <p className="text-sm text-gray-600 ">Where the Capital Market Line touches the frontier. Offers the best risk-adjusted return (highest Sharpe ratio).</p>
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
                    <p className="text-sm text-gray-500 ">Test your understanding of Modern Portfolio Theory</p>
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
                                ${isSelected && !showResults ? 'border-blue-500 bg-blue-50 ' : ''}
                                ${!isSelected && !showResults ? 'border-gray-200  hover:border-gray-300 ' : ''}
                                ${showResults ? 'cursor-default' : 'cursor-pointer'}`}>
                              <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300  text-gray-500'}`}>
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
                        <div className="mt-4 p-4 bg-blue-50  rounded-lg border border-blue-200 ">
                          <p className="text-sm text-blue-800 "><strong>Explanation:</strong> {q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!showResults ? (
                  <button onClick={() => setShowResults(true)} disabled={Object.keys(quizAnswers).length !== quizQuestions.length}
                    className="mt-8 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    Check Answers
                  </button>
                ) : (
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-center">
                    <p className="text-3xl font-bold text-white mb-2">{calculateScore()} / {quizQuestions.length}</p>
                    <p className="text-blue-100">{calculateScore() === quizQuestions.length ? "Perfect! You've mastered MPT fundamentals." : "Review the explanations to strengthen your understanding."}</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/portfolio-construction')} className="flex items-center gap-2 px-6 py-3 bg-gray-100  text-gray-700  rounded-xl font-medium hover:bg-gray-200  transition-colors">
              <Icons.ArrowLeft className="w-4 h-4"/><span>Module Overview</span>
            </button>
            <button onClick={() => navigate('/learn/pc-lesson-2')} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200">
              <span>Next: Risk and Return</span><Icons.ArrowRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PCLesson1;
