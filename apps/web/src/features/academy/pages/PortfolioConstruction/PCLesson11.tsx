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
  Zap: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Activity: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  BarChart: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
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
  // Stress Test Scenarios
  StressTestViz: ({ className = "w-full h-64" }) => (
    <svg className={className} viewBox="0 0 400 300" fill="none">
      {/* Portfolio value over time with stress */}
      <defs>
        <linearGradient id="stressGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5A77AA" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#E04848" stopOpacity="0.2"/>
        </linearGradient>
      </defs>
      {/* Axes */}
      <line x1="50" y1="220" x2="370" y2="220" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <line x1="50" y1="220" x2="50" y2="40" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <text x="210" y="250" fill="currentColor" opacity="0.6" fontSize="13" textAnchor="middle">Time →</text>
      <text x="20" y="130" fill="currentColor" opacity="0.6" fontSize="13" textAnchor="middle" transform="rotate(-90 20 130)">Portfolio Value</text>
      {/* Normal growth path */}
      <path d="M 50 200 L 100 180 L 150 160 L 200 140 L 250 120 L 300 100 L 350 80" stroke="#16A34A" strokeWidth="2" strokeDasharray="5,5" opacity="0.5"/>
      <text x="360" y="75" fill="#16A34A" fontSize="11">Normal</text>
      {/* Stress scenario path */}
      <path d="M 50 200 L 100 180 L 150 160 L 200 190 L 250 170 L 300 150 L 350 130" stroke="#E04848" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M 50 200 L 100 180 L 150 160 L 200 190 L 250 170 L 300 150 L 350 130 L 350 220 L 50 220 Z" fill="url(#stressGrad)"/>
      {/* Stress event marker */}
      <circle cx="200" cy="190" r="6" fill="#E04848" stroke="white" strokeWidth="2"/>
      <line x1="200" y1="196" x2="200" y2="230" stroke="#E04848" strokeWidth="1.5" strokeDasharray="3,3"/>
      <text x="200" y="245" fill="#E04848" fontSize="11" fontWeight="bold" textAnchor="middle">Market Crash</text>
      {/* Drawdown annotation */}
      <path d="M 200 160 L 200 190" stroke="#B8923F" strokeWidth="2" markerEnd="url(#arrowDown)"/>
      <text x="210" y="175" fill="#B8923F" fontSize="11" fontWeight="bold">-20% DD</text>
      <defs>
        <marker id="arrowDown" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="#B8923F"/>
        </marker>
      </defs>
      <text x="200" y="25" fill="currentColor" opacity="0.7" fontSize="14" fontWeight="bold" textAnchor="middle">Stress Test Scenario</text>
    </svg>
  )
};

const PCLesson11 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  

  const quizQuestions = [
    {
      id: 1,
      question: "What is the primary purpose of portfolio stress testing?",
      options: [
        "To predict exactly what will happen",
        "To understand how your portfolio might behave in adverse conditions",
        "To maximize returns",
        "To time the market"
      ],
      correct: 1,
      explanation: "Stress testing helps you understand potential vulnerabilities and extreme outcomes before they occur. It's not about prediction - it's about preparation and ensuring you can handle adverse scenarios without derailing your financial plan."
    },
    {
      id: 2,
      question: "Which historical event would be useful for stress testing a 60/40 portfolio?",
      options: [
        "A year with average returns",
        "The 2008 Global Financial Crisis",
        "A year when bonds and stocks both rose",
        "Random daily price movements"
      ],
      correct: 1,
      explanation: "The 2008 crisis is valuable because it shows how a traditional 60/40 portfolio performs when correlations spike and diversification benefits temporarily break down. It's a realistic severe scenario that tests portfolio resilience."
    },
    {
      id: 3,
      question: "Monte Carlo simulation generates thousands of scenarios by:",
      options: [
        "Predicting the future with certainty",
        "Using only historical data exactly as it occurred",
        "Randomly sampling from statistical distributions based on asset characteristics",
        "Asking expert opinions"
      ],
      correct: 2,
      explanation: "Monte Carlo simulations randomly generate thousands of possible return paths by sampling from probability distributions defined by expected returns, volatilities, and correlations. This reveals the range of possible outcomes, including rare events."
    },
    {
      id: 4,
      question: "If stress testing reveals your portfolio would drop 45% in a severe recession, you should:",
      options: [
        "Ignore it since it hasn't happened",
        "Panic and sell everything",
        "Assess whether you could psychologically and financially handle that loss",
        "Assume it will happen exactly that way"
      ],
      correct: 2,
      explanation: "The right response is to honestly assess whether you could stay the course during such a decline. If a 45% drop would cause you to panic-sell or derail your financial plans, you may need to reduce portfolio risk before the stress actually occurs."
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
              <span className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs font-bold rounded-full shadow-sm">LESSON 11 OF 12</span>
              <span className="px-3 py-1.5 bg-rose-100  text-rose-700  rounded-full text-xs font-medium flex items-center gap-1.5">
                <Icons.Clock className="w-3.5 h-3.5"/>40 min read
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-gray-900 via-rose-900 to-red-900 bg-clip-text text-transparent mb-5 leading-tight tracking-[-0.025em] brand-on-dark">Portfolio Stress Testing</h1>
            <p className="text-xl text-gray-600  leading-relaxed max-w-3xl">Learn to test your portfolio against extreme scenarios before they happen. Understand scenario analysis, historical stress tests, and Monte Carlo simulation to build resilient portfolios.</p>
          </header>

          <div className="space-y-12">
            
            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/20">
                      <Icons.Zap className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Why Stress Test?</h2>
                      <p className="text-sm text-gray-500 ">Prepare for the unexpected</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700  leading-relaxed mb-6">Stress testing asks "what if?" It subjects your portfolio to hypothetical adverse scenarios to understand how much you might lose in a crisis. This isn't about predicting the future - it's about preparing for it and ensuring you can stay the course when markets get difficult.</p>

                  <div className="rounded-xl p-6 mb-6 bg-brand-fill">
                    <h4 className="text-white font-semibold mb-4 text-center">The Value of Stress Testing</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-rose-400 text-sm mb-2">Know Your Exposure</div>
                        <div className="text-gray-300 text-xs">Understand worst-case scenarios before they happen</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-red-400 text-sm mb-2">Test Your Tolerance</div>
                        <div className="text-gray-300 text-xs">Can you actually handle the losses you might face?</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-pink-400 text-sm mb-2">Build Resilience</div>
                        <div className="text-gray-300 text-xs">Adjust portfolio before stress, not during</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-rose-50 to-red-50   rounded-xl p-6 border-l-4 border-rose-500">
                    <h4 className="font-bold text-gray-900  mb-2">The Real Question</h4>
                    <p className="text-gray-700  text-sm">Stress testing helps answer: "If markets crashed tomorrow, would I panic and sell at the bottom, or stay invested?" If you can't honestly say you'd stay the course through a 40% decline, your portfolio may be too aggressive for your actual risk tolerance.</p>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                      <Icons.BarChart className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Scenario Analysis</h2>
                      <p className="text-sm text-gray-500 ">What-if analysis</p>
                    </div>
                  </div>

                  <p className="text-gray-700  leading-relaxed mb-6">Scenario analysis tests your portfolio against specific hypothetical situations. You define the conditions (e.g., "stocks fall 30%, bonds rise 10%, commodities fall 15%") and calculate the impact on your portfolio.</p>

                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 ">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 ">Scenario</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 ">Stocks</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 ">Bonds</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 ">60/40 Portfolio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { scenario: "Mild Recession", stocks: "-15%", bonds: "+5%", result: "-7%", color: "amber" },
                          { scenario: "Severe Recession", stocks: "-35%", bonds: "+8%", result: "-18%", color: "orange" },
                          { scenario: "Stagflation", stocks: "-25%", bonds: "-5%", result: "-17%", color: "orange" },
                          { scenario: "Deflationary Crisis", stocks: "-40%", bonds: "+15%", result: "-18%", color: "red" },
                          { scenario: "Market Crash + Rates Spike", stocks: "-45%", bonds: "-15%", result: "-33%", color: "red" }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="py-3 px-4 text-gray-700 font-medium">{row.scenario}</td>
                            <td className="py-3 px-4 text-center text-red-600">{row.stocks}</td>
                            <td className={`py-3 px-4 text-center ${row.bonds.startsWith('+') ? 'text-brand' : 'text-red-600'}`}>{row.bonds}</td>
                            <td className={`py-3 px-4 text-center font-bold text-${row.color}-600`}>{row.result}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-red-50  rounded-xl p-5 border border-red-200 ">
                      <h4 className="font-bold text-red-800  mb-3">Scenario Types</h4>
                      <ul className="text-sm text-gray-700  space-y-2">
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"/>Economic scenarios (recession, inflation)</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"/>Market events (crash, correction)</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"/>Policy scenarios (rate hikes, QT)</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"/>Tail events (pandemic, geopolitical)</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50  rounded-xl p-5 border border-orange-200 ">
                      <h4 className="font-bold text-orange-800  mb-3">Building Scenarios</h4>
                      <ul className="text-sm text-gray-700  space-y-2">
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"/>Base case (expected outcome)</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"/>Optimistic case (things go well)</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"/>Pessimistic case (moderate downturn)</li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"/>Worst case (severe stress)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20 bg-brand-fill">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/>
                      </svg>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Historical Stress Tests</h2>
                      <p className="text-sm text-gray-500 ">Learning from past crises</p>
                    </div>
                  </div>

                  <p className="text-gray-700  leading-relaxed mb-6">Historical stress tests apply actual past crisis returns to your current portfolio. This shows how you would have fared during real events, providing concrete and relatable scenarios.</p>

                  <div className="space-y-4 mb-6">
                    {[
                      { event: "2008 Global Financial Crisis", period: "Oct 2007 - Mar 2009", sp500: "-56.8%", agg: "+7.4%", portfolio: "-31%", duration: "17 months" },
                      { event: "Dot-Com Crash", period: "Mar 2000 - Oct 2002", sp500: "-49.1%", agg: "+29.4%", portfolio: "-18%", duration: "31 months" },
                      { event: "COVID-19 Crash", period: "Feb - Mar 2020", sp500: "-33.9%", agg: "+3.1%", portfolio: "-18%", duration: "33 days" },
                      { event: "2022 Stocks + Bonds Down", period: "Jan - Sep 2022", sp500: "-24.5%", agg: "-14.6%", portfolio: "-21%", duration: "9 months" },
                      { event: "1973-74 Bear Market", period: "Jan 1973 - Oct 1974", sp500: "-48.2%", agg: "-4.1%", portfolio: "-31%", duration: "22 months" }
                    ].map((crisis, i) => (
                      <div key={i} className="bg-gray-50  rounded-xl p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                          <h4 className="font-bold text-gray-900 ">{crisis.event}</h4>
                          <span className="text-xs text-gray-500 ">{crisis.period}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-center text-sm">
                          <div>
                            <div className="text-red-600  font-bold">{crisis.sp500}</div>
                            <div className="text-xs text-gray-500">S&P 500</div>
                          </div>
                          <div>
                            <div className={`font-bold ${crisis.agg.startsWith('+') ? 'text-brand' : 'text-red-600'}`}>{crisis.agg}</div>
                            <div className="text-xs text-gray-500">US Agg Bond</div>
                          </div>
                          <div>
                            <div className="text-amber-600  font-bold">{crisis.portfolio}</div>
                            <div className="text-xs text-gray-500">60/40 Portfolio</div>
                          </div>
                          <div>
                            <div className="text-gray-600  font-bold">{crisis.duration}</div>
                            <div className="text-xs text-gray-500">Duration</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-xl p-6 border-l-4 border-amber-400">
                    <h4 className="font-bold text-gray-900  mb-2 flex items-center gap-2">
                      <Icons.AlertTriangle className="w-5 h-5 text-amber-500"/> Key Insight: 2022
                    </h4>
                    <p className="text-gray-700  text-sm">2022 showed that diversification between stocks and bonds isn't guaranteed. When inflation forced rapid rate hikes, both stocks and bonds fell together. Historical stress tests should include this scenario to test portfolios under correlation breakdown.</p>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20 bg-brand-fill">
                      <Icons.Activity className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Monte Carlo Simulation</h2>
                      <p className="text-sm text-gray-500 ">Thousands of possible futures</p>
                    </div>
                  </div>

                  <p className="text-gray-700  leading-relaxed mb-6">Monte Carlo simulation generates thousands of random return scenarios based on statistical characteristics of your portfolio (expected returns, volatilities, correlations). It reveals the range of possible outcomes and their probabilities.</p>

                  <div className="rounded-xl p-6 mb-6 bg-brand-fill">
                    <h4 className="text-white font-semibold mb-4 text-center">How Monte Carlo Works</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                        <span className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</span>
                        <div className="text-gray-300 text-sm flex-1">Define inputs: expected returns, volatilities, correlations for each asset</div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                        <span className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</span>
                        <div className="text-gray-300 text-sm flex-1">Randomly generate returns for each period based on these distributions</div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                        <span className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</span>
                        <div className="text-gray-300 text-sm flex-1">Calculate portfolio value path over your time horizon</div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                        <span className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</span>
                        <div className="text-gray-300 text-sm flex-1">Repeat 10,000+ times to see full distribution of outcomes</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-violet-50  rounded-xl p-5 border border-violet-200 ">
                      <h4 className="font-bold text-violet-800  mb-3">What Monte Carlo Shows</h4>
                      <ul className="text-sm text-gray-700  space-y-2">
                        <li className="flex items-start gap-2"><Icons.CheckCircle className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0"/>Range of possible ending values</li>
                        <li className="flex items-start gap-2"><Icons.CheckCircle className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0"/>Probability of meeting goals</li>
                        <li className="flex items-start gap-2"><Icons.CheckCircle className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0"/>Worst-case (5th percentile) outcomes</li>
                        <li className="flex items-start gap-2"><Icons.CheckCircle className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0"/>Path risk (sequence of returns)</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50  rounded-xl p-5 border border-purple-200 ">
                      <h4 className="font-bold text-purple-800  mb-3">Key Metrics</h4>
                      <ul className="text-sm text-gray-700  space-y-2">
                        <li><strong className="text-purple-700 ">Success Rate:</strong> % of simulations meeting goal</li>
                        <li><strong className="text-purple-700 ">5th Percentile:</strong> Worst 5% of outcomes</li>
                        <li><strong className="text-purple-700 ">95th Percentile:</strong> Best 5% of outcomes</li>
                        <li><strong className="text-purple-700 ">Max Drawdown:</strong> Largest peak-to-trough decline</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gray-50  rounded-xl p-6">
                    <h4 className="font-bold text-gray-900  mb-3">Example: $1M Portfolio Over 30 Years</h4>
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div className="p-4 bg-white  rounded-lg">
                        <div className="text-red-600  font-bold text-lg">$1.2M</div>
                        <div className="text-xs text-gray-500">5th Percentile (Worst 5%)</div>
                      </div>
                      <div className="p-4 bg-white  rounded-lg">
                        <div className="text-blue-600  font-bold text-lg">$4.8M</div>
                        <div className="text-xs text-gray-500">Median (50th Percentile)</div>
                      </div>
                      <div className="p-4 bg-white  rounded-lg">
                        <div className="text-brand  font-bold text-lg">$15M</div>
                        <div className="text-xs text-gray-500">95th Percentile (Best 5%)</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500  text-center mt-3">Illustrative only. Based on hypothetical 60/40 portfolio assumptions.</p>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20 bg-brand-fill">
                      <Icons.CheckCircle className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Taking Action on Results</h2>
                      <p className="text-sm text-gray-500 ">What to do with stress test findings</p>
                    </div>
                  </div>

                  <p className="text-gray-700  leading-relaxed mb-6">Stress testing is only valuable if you act on the insights. Here's how to use your results to build a more resilient portfolio and financial plan.</p>

                  <div className="space-y-4 mb-6">
                    <div className="bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                      <h4 className="font-bold text-brand  mb-2">1. Assess Your True Risk Tolerance</h4>
                      <p className="text-sm text-gray-700 ">If stress tests show potential losses that would cause you to panic-sell, your portfolio is too aggressive. Reduce risk now, before the stress occurs. It's easier to stay invested through a 20% decline than a 40% decline.</p>
                    </div>

                    <div className="bg-teal-50  rounded-xl p-5 border border-teal-200 ">
                      <h4 className="font-bold text-teal-800  mb-2">2. Evaluate Financial Plan Resilience</h4>
                      <p className="text-sm text-gray-700 ">Can your plan survive the worst-case scenario? If retirement depends on the 95th percentile outcome, you're gambling. Plans should work even at the 25th percentile of market outcomes.</p>
                    </div>

                    <div className="bg-cyan-50  rounded-xl p-5 border border-cyan-200 ">
                      <h4 className="font-bold text-cyan-800  mb-2">3. Identify Concentration Risks</h4>
                      <p className="text-sm text-gray-700 ">Stress tests often reveal hidden concentrations. If a single scenario (like tech crash) devastates your portfolio, you may need more diversification across sectors, asset classes, or geographies.</p>
                    </div>

                    <div className="bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                      <h4 className="font-bold text-blue-800  mb-2">4. Build Cash Reserves</h4>
                      <p className="text-sm text-gray-700 ">Stress testing can help size emergency funds. If a severe scenario could coincide with job loss, ensure you have 6-12 months of expenses outside your investment portfolio.</p>
                    </div>

                    <div className="bg-indigo-50  rounded-xl p-5 border border-indigo-200 ">
                      <h4 className="font-bold text-indigo-800  mb-2">5. Document Your Plan</h4>
                      <p className="text-sm text-gray-700 ">Write down what you'll do in a crisis. "If portfolio drops 20%, I will stay invested and rebalance." This pre-commitment helps you act rationally when emotions run high.</p>
                    </div>
                  </div>

                  <div className="rounded-xl p-6 border-l-4 border-brand bg-brand-soft">
                    <h4 className="font-bold text-gray-900  mb-2">The Goal</h4>
                    <p className="text-gray-700  text-sm">A well-stress-tested portfolio isn't one that never loses money - that's impossible. It's one where you understand the potential losses, have accepted them in advance, and have a plan to stay the course. Preparation prevents panic.</p>
                  </div>
                </div>
              </section>

            <section>
                <div className="bg-white  rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 ">
                  <div className="flex items-start gap-4 mb-8">
                    <span className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/20">
                      <Icons.CheckCircle className="w-6 h-6 text-white"/>
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.015em]">Knowledge Check</h2>
                      <p className="text-sm text-gray-500 ">Test your understanding of stress testing</p>
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
                                  ${isSelected && !showResults ? 'border-rose-500 bg-rose-50 ' : ''}
                                  ${!isSelected && !showResults ? 'border-gray-200  hover:border-gray-300 ' : ''}
                                  ${showResults ? 'cursor-default' : 'cursor-pointer'}`}>
                                <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-gray-300  text-gray-500'}`}>
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
                      <p className="text-rose-100">{calculateScore() === quizQuestions.length ? "Excellent! You understand portfolio stress testing." : "Review the explanations to master stress testing techniques."}</p>
                    </div>
                  )}
                </div>
              </section>
          </div>

          <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/pc-lesson-10')} className="flex items-center gap-2 px-6 py-3 bg-gray-100  text-gray-700  rounded-xl font-medium hover:bg-gray-200  transition-colors">
              <Icons.ArrowLeft className="w-4 h-4"/><span>Previous Lesson</span>
            </button>
            <button onClick={() => navigate('/learn/pc-lesson-12')} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-200">
              <span>Next: Monitoring</span><Icons.ArrowRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PCLesson11;
