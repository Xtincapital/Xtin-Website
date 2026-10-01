import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// SVG Icons
const Icons = {
  Strategy: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7L12 12L22 7L12 2Z"/><path d="M2 17L12 22L22 17"/><path d="M2 12L12 17L22 12"/>
    </svg>
  ),
  Target: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9"/><path d="M8 12L11 15L16 9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  TrendUp: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 6L13.5 15.5L8.5 10.5L1 18"/><path d="M17 6H23V12"/>
    </svg>
  ),
  TrendDown: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 18L13.5 8.5L8.5 13.5L1 6"/><path d="M17 18H23V12"/>
    </svg>
  ),
  Revert: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21"/>
      <path d="M9 12H15"/><path d="M3 12L1 10M3 12L5 10"/>
    </svg>
  ),
  Breakout: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="8" width="18" height="8" rx="1" strokeDasharray="4 2"/>
      <path d="M12 4V20" strokeLinecap="round"/><path d="M8 8L12 4L16 8"/>
    </svg>
  ),
  Key: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="15" r="5"/><path d="M11.5 11.5L21 2M18 5L21 2L21 5L18 5Z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Lightbulb: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18H15M10 22H14M12 2V3M4.22 4.22L4.93 4.93M2 12H3M4.22 19.78L4.93 19.07M22 12H21M19.78 4.22L19.07 4.93"/>
      <path d="M18 12A6 6 0 1 0 9 17.13V18A1 1 0 0 0 10 19H14A1 1 0 0 0 15 18V17.13A6 6 0 0 0 18 12Z"/>
    </svg>
  ),
  Warning: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 9V13M12 17H12.01"/><path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.54 21H20.46A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z"/>
    </svg>
  )
};

// Quiz Component
const QuizQuestion = ({ question, options, correctAnswer, explanation }) => {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const handleClick = (idx) => { if (!showResult) { setSelected(String.fromCharCode(65+idx)); setShowResult(true); }};
  const isCorrect = selected === correctAnswer;
  return (
    <div className="bg-white  rounded-2xl p-6 shadow-lg border border-gray-100  mb-6">
      <h4 className="text-lg font-semibold text-gray-900  mb-4">{question}</h4>
      <div className="space-y-3">
        {options.map((opt, i) => {
          const letter = String.fromCharCode(65+i);
          const isThis = selected === letter, isRight = correctAnswer === letter;
          let bg = "bg-gray-50  hover:bg-indigo-50", border = "border-gray-200 ";
          if (showResult) { if (isRight) { bg="bg-emerald-50 "; border="border-emerald-400"; } 
            else if (isThis) { bg="bg-red-50 "; border="border-red-400"; }}
          return (
            <button key={i} onClick={()=>handleClick(i)} disabled={showResult}
              className={`w-full text-left p-4 rounded-xl border-2 ${border} ${bg} transition-all`}>
              <span className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${showResult && isRight ? 'bg-emerald-500 text-white' : showResult && isThis ? 'bg-red-500 text-white' : 'bg-indigo-100  text-indigo-600'}`}>{letter}</span>
                <span className="text-gray-700 ">{opt}</span>
                {showResult && isRight && <FaCheckCircle className="ml-auto text-emerald-500"/>}
                {showResult && isThis && !isRight && <FaTimesCircle className="ml-auto text-red-500"/>}
              </span>
            </button>
          );
        })}
      </div>
      {showResult && (
        <div className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-emerald-100  text-emerald-800 ' : 'bg-amber-100  text-amber-800 '}`}>
          <p className="font-medium flex items-center gap-2">
            {isCorrect ? <><FaCheckCircle/> Correct!</> : <><FaTimesCircle/> Not quite.</>}
          </p>
          <p className="text-sm mt-1">{explanation}</p>
        </div>
      )}
    </div>
  );
};

const AlgoTradingLesson3 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-indigo-50/30   text-gray-900  min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb */}
          <button onClick={() => navigate('/learn/algorithmic-trading')}
            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-8 group">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/><span>Back to Algorithmic Trading</span>
          </button>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full text-sm font-bold">Lesson 3 of 9</span>
              <span className="px-3 py-1.5 bg-gray-100  text-gray-600  rounded-full text-sm">20 min read</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-4">
              <span className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
                <Icons.Strategy className="w-8 h-8 text-white"/>
              </span>
              Strategy Development Fundamentals
            </h1>
            <p className="text-xl text-gray-600 ">
              Learn the core strategy types that power algorithmic trading systems and when to use each one.
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50   rounded-2xl p-6 mb-10 border border-cyan-200 ">
            <h2 className="font-bold text-cyan-800  mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center"><Icons.Target className="w-5 h-5 text-white"/></span>
              What You'll Learn
            </h2>
            <ul className="space-y-2">
              {["Understand the 4 main categories of trading strategies", "Learn when each strategy type works best", 
                "Identify market conditions that favor different approaches", "Avoid common strategy development mistakes"].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-cyan-700 ">
                  <Icons.CheckCircle className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0"/><span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none ">
            
            {/* Intro */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50   rounded-2xl p-6 mb-10 border border-amber-200 ">
              <h3 className="font-bold text-amber-900  mb-3 text-lg flex items-center gap-2">
                <Icons.Lightbulb className="w-5 h-5"/> The Strategy Spectrum
              </h3>
              <p className="text-amber-800 ">
                Every trading strategy answers one question: <strong>"What market behavior am I trying to profit from?"</strong> 
                Understanding the core strategy types helps you choose the right approach for your goals and market conditions.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4">The 4 Core Strategy Types</h2>

            {/* Strategy Types Visual */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 mb-10 border border-indigo-800/50 shadow-xl">
              <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 400" fill="none">
                <text x="350" y="25" textAnchor="middle" fill="#e0e7ff" fontSize="15" fontWeight="700">STRATEGY TYPE OVERVIEW</text>
                
                {/* Quadrant Grid */}
                <line x1="350" y1="60" x2="350" y2="340" stroke="#334155" strokeWidth="2"/>
                <line x1="50" y1="200" x2="650" y2="200" stroke="#334155" strokeWidth="2"/>
                
                {/* Axis Labels */}
                <text x="350" y="360" textAnchor="middle" fill="#94a3b8" fontSize="10">← Slower Execution | Faster Execution →</text>
                <text x="30" y="200" textAnchor="middle" fill="#94a3b8" fontSize="10" transform="rotate(-90, 30, 200)">← Lower Frequency | Higher Frequency →</text>

                {/* Quadrant 1: Trend Following (top-left) */}
                <g transform="translate(80, 80)">
                  <rect x="0" y="0" width="220" height="100" rx="12" fill="#1e293b" stroke="#22c55e" strokeWidth="2"/>
                  <circle cx="30" cy="30" r="18" fill="#22c55e"/>
                  <text x="30" y="35" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">1</text>
                  <text x="130" y="30" textAnchor="middle" fill="#86efac" fontSize="13" fontWeight="700">TREND FOLLOWING</text>
                  <text x="130" y="50" textAnchor="middle" fill="#94a3b8" fontSize="9">"The trend is your friend"</text>
                  <text x="130" y="70" textAnchor="middle" fill="#64748b" fontSize="8">• Moving averages, breakouts</text>
                  <text x="130" y="85" textAnchor="middle" fill="#64748b" fontSize="8">• Hold days to months</text>
                </g>

                {/* Quadrant 2: Mean Reversion (top-right) */}
                <g transform="translate(400, 80)">
                  <rect x="0" y="0" width="220" height="100" rx="12" fill="#1e293b" stroke="#3b82f6" strokeWidth="2"/>
                  <circle cx="30" cy="30" r="18" fill="#3b82f6"/>
                  <text x="30" y="35" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">2</text>
                  <text x="130" y="30" textAnchor="middle" fill="#93c5fd" fontSize="13" fontWeight="700">MEAN REVERSION</text>
                  <text x="130" y="50" textAnchor="middle" fill="#94a3b8" fontSize="9">"What goes up must come down"</text>
                  <text x="130" y="70" textAnchor="middle" fill="#64748b" fontSize="8">• RSI, Bollinger Bands</text>
                  <text x="130" y="85" textAnchor="middle" fill="#64748b" fontSize="8">• Hold hours to days</text>
                </g>

                {/* Quadrant 3: Momentum (bottom-left) */}
                <g transform="translate(80, 220)">
                  <rect x="0" y="0" width="220" height="100" rx="12" fill="#1e293b" stroke="#f59e0b" strokeWidth="2"/>
                  <circle cx="30" cy="30" r="18" fill="#f59e0b"/>
                  <text x="30" y="35" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">3</text>
                  <text x="130" y="30" textAnchor="middle" fill="#fcd34d" fontSize="13" fontWeight="700">MOMENTUM</text>
                  <text x="130" y="50" textAnchor="middle" fill="#94a3b8" fontSize="9">"Winners keep winning"</text>
                  <text x="130" y="70" textAnchor="middle" fill="#64748b" fontSize="8">• Relative strength, sector rotation</text>
                  <text x="130" y="85" textAnchor="middle" fill="#64748b" fontSize="8">• Hold weeks to months</text>
                </g>

                {/* Quadrant 4: Market Making (bottom-right) */}
                <g transform="translate(400, 220)">
                  <rect x="0" y="0" width="220" height="100" rx="12" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2"/>
                  <circle cx="30" cy="30" r="18" fill="#8b5cf6"/>
                  <text x="30" y="35" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">4</text>
                  <text x="130" y="30" textAnchor="middle" fill="#c4b5fd" fontSize="13" fontWeight="700">MARKET MAKING</text>
                  <text x="130" y="50" textAnchor="middle" fill="#94a3b8" fontSize="9">"Profit from the spread"</text>
                  <text x="130" y="70" textAnchor="middle" fill="#64748b" fontSize="8">• Bid-ask spread capture</text>
                  <text x="130" y="85" textAnchor="middle" fill="#64748b" fontSize="8">• Hold seconds to minutes</text>
                </g>

                {/* Center label */}
                <circle cx="350" cy="200" r="25" fill="#0f172a" stroke="#475569" strokeWidth="2"/>
                <text x="350" y="205" textAnchor="middle" fill="#e0e7ff" fontSize="9" fontWeight="600">CORE</text>
              </svg>
            </div>

            {/* Strategy 1: Trend Following */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50   rounded-2xl p-6 mb-8 border-l-4 border-emerald-500">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <Icons.TrendUp className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <span className="text-xs font-bold text-emerald-600 ">STRATEGY TYPE 1</span>
                  <h3 className="text-xl font-bold text-gray-900 ">Trend Following</h3>
                </div>
              </div>
              
              <p className="text-gray-700  mb-4">
                <strong>Core Idea:</strong> Markets tend to move in sustained directions. Buy when prices are rising, sell when falling.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/50  rounded-xl p-4">
                  <h4 className="font-semibold text-emerald-700  mb-2">Common Indicators</h4>
                  <ul className="text-sm text-gray-600  space-y-1">
                    <li>• Moving Average Crossovers (50/200 SMA)</li>
                    <li>• MACD (Moving Average Convergence)</li>
                    <li>• ADX (Average Directional Index)</li>
                    <li>• Donchian Channels</li>
                  </ul>
                </div>
                <div className="bg-white/50  rounded-xl p-4">
                  <h4 className="font-semibold text-emerald-700  mb-2">Best Market Conditions</h4>
                  <ul className="text-sm text-gray-600  space-y-1">
                    <li>✓ Strong directional moves</li>
                    <li>✓ Low volatility transitions</li>
                    <li>✓ News-driven momentum</li>
                    <li>✗ Avoid: Sideways/choppy markets</li>
                  </ul>
                </div>
              </div>

              <div className="bg-emerald-100  rounded-lg p-3">
                <p className="text-sm text-emerald-800 ">
                  <strong>Indian Market Example:</strong> A 50-day MA crossover strategy on Nifty 50 would have caught the 2020-2021 bull run from 8,000 to 18,000+ levels.
                </p>
              </div>
            </div>

            {/* Strategy 2: Mean Reversion */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50   rounded-2xl p-6 mb-8 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Icons.Revert className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <span className="text-xs font-bold text-blue-600 ">STRATEGY TYPE 2</span>
                  <h3 className="text-xl font-bold text-gray-900 ">Mean Reversion</h3>
                </div>
              </div>
              
              <p className="text-gray-700  mb-4">
                <strong>Core Idea:</strong> Prices oscillate around an average value. Buy when oversold, sell when overbought.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/50  rounded-xl p-4">
                  <h4 className="font-semibold text-blue-700  mb-2">Common Indicators</h4>
                  <ul className="text-sm text-gray-600  space-y-1">
                    <li>• RSI (Relative Strength Index)</li>
                    <li>• Bollinger Bands</li>
                    <li>• Stochastic Oscillator</li>
                    <li>• Z-Score from moving average</li>
                  </ul>
                </div>
                <div className="bg-white/50  rounded-xl p-4">
                  <h4 className="font-semibold text-blue-700  mb-2">Best Market Conditions</h4>
                  <ul className="text-sm text-gray-600  space-y-1">
                    <li>✓ Range-bound markets</li>
                    <li>✓ High liquidity stocks</li>
                    <li>✓ Stable volatility periods</li>
                    <li>✗ Avoid: Strong trend phases</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-100  rounded-lg p-3">
                <p className="text-sm text-blue-800 ">
                  <strong>Indian Market Example:</strong> Buying Bank Nifty when RSI drops below 30 and selling above 70 works well during consolidation phases.
                </p>
              </div>
            </div>

            {/* Strategy 3: Momentum */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50   rounded-2xl p-6 mb-8 border-l-4 border-amber-500">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
                  <Icons.TrendUp className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <span className="text-xs font-bold text-amber-600 ">STRATEGY TYPE 3</span>
                  <h3 className="text-xl font-bold text-gray-900 ">Momentum Trading</h3>
                </div>
              </div>
              
              <p className="text-gray-700  mb-4">
                <strong>Core Idea:</strong> Stocks that have performed well recently tend to continue performing well (and vice versa).
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/50  rounded-xl p-4">
                  <h4 className="font-semibold text-amber-700  mb-2">Common Approaches</h4>
                  <ul className="text-sm text-gray-600  space-y-1">
                    <li>• Relative strength ranking</li>
                    <li>• 52-week high/low strategies</li>
                    <li>• Sector rotation models</li>
                    <li>• Price rate of change (ROC)</li>
                  </ul>
                </div>
                <div className="bg-white/50  rounded-xl p-4">
                  <h4 className="font-semibold text-amber-700  mb-2">Best Market Conditions</h4>
                  <ul className="text-sm text-gray-600  space-y-1">
                    <li>✓ Bull markets with dispersion</li>
                    <li>✓ Sector-specific rallies</li>
                    <li>✓ Clear market leadership</li>
                    <li>✗ Avoid: Market reversals</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-100  rounded-lg p-3">
                <p className="text-sm text-amber-800 ">
                  <strong>Indian Market Example:</strong> During 2023-24, momentum strategies favoring PSU banks and energy stocks significantly outperformed.
                </p>
              </div>
            </div>

            {/* Strategy 4: Market Making */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50   rounded-2xl p-6 mb-8 border-l-4 border-violet-500">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center">
                  <Icons.Breakout className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <span className="text-xs font-bold text-violet-600 ">STRATEGY TYPE 4</span>
                  <h3 className="text-xl font-bold text-gray-900 ">Market Making / Arbitrage</h3>
                </div>
              </div>
              
              <p className="text-gray-700  mb-4">
                <strong>Core Idea:</strong> Profit from providing liquidity (bid-ask spread) or exploiting price differences across venues.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/50  rounded-xl p-4">
                  <h4 className="font-semibold text-violet-700  mb-2">Types of Arbitrage</h4>
                  <ul className="text-sm text-gray-600  space-y-1">
                    <li>• Cash-futures arbitrage</li>
                    <li>• Statistical arbitrage (pairs)</li>
                    <li>• Cross-exchange arbitrage</li>
                    <li>• Options mispricing</li>
                  </ul>
                </div>
                <div className="bg-white/50  rounded-xl p-4">
                  <h4 className="font-semibold text-violet-700  mb-2">Requirements</h4>
                  <ul className="text-sm text-gray-600  space-y-1">
                    <li>⚡ Ultra-low latency systems</li>
                    <li>💰 High capital requirements</li>
                    <li>📊 Advanced infrastructure</li>
                    <li>⚠️ Mostly institutional</li>
                  </ul>
                </div>
              </div>

              <div className="bg-violet-100  rounded-lg p-3">
                <p className="text-sm text-violet-800 ">
                  <strong>Note for Retail:</strong> Pure market making requires infrastructure retail traders don't have. Focus on statistical arbitrage (pairs trading) instead.
                </p>
              </div>
            </div>

            {/* Comparison Table */}
            <h2 className="text-2xl font-bold mb-4">Strategy Comparison</h2>
            <div className="overflow-x-auto mb-10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-indigo-100 ">
                    <th className="p-3 text-left font-bold text-indigo-800 ">Factor</th>
                    <th className="p-3 text-center font-bold text-emerald-700 ">Trend</th>
                    <th className="p-3 text-center font-bold text-blue-700 ">Mean Rev.</th>
                    <th className="p-3 text-center font-bold text-amber-700 ">Momentum</th>
                    <th className="p-3 text-center font-bold text-violet-700 ">Arb/MM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 ">
                  {[
                    ["Hold Time", "Days-Months", "Hours-Days", "Weeks-Months", "Seconds-Mins"],
                    ["Win Rate", "30-40%", "55-65%", "40-50%", "50-60%"],
                    ["Profit per Win", "Large", "Small", "Medium", "Very Small"],
                    ["Capital Needed", "Medium", "Low-Medium", "Medium-High", "Very High"],
                    ["Retail Friendly", "✓ Yes", "✓ Yes", "✓ Yes", "⚠️ Limited"]
                  ].map((row, i) => (
                    <tr key={i} className="bg-white ">
                      <td className="p-3 font-medium text-gray-900 ">{row[0]}</td>
                      <td className="p-3 text-center text-gray-600 ">{row[1]}</td>
                      <td className="p-3 text-center text-gray-600 ">{row[2]}</td>
                      <td className="p-3 text-center text-gray-600 ">{row[3]}</td>
                      <td className="p-3 text-center text-gray-600 ">{row[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Common Mistakes */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50   rounded-2xl p-6 mb-10 border border-red-200 ">
              <h3 className="font-bold text-red-800  mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><Icons.Warning className="w-5 h-5 text-white"/></span>
                Common Strategy Development Mistakes
              </h3>
              <ul className="space-y-3">
                {[
                  { title: "Overfitting", desc: "Creating a strategy that works perfectly on historical data but fails in live trading." },
                  { title: "Ignoring transaction costs", desc: "Strategies that look profitable become losers after accounting for brokerage, slippage, and taxes." },
                  { title: "Using the wrong strategy for market conditions", desc: "Running a trend strategy in a sideways market will generate losses." },
                  { title: "No clear exit rules", desc: "Knowing when to exit (profit or loss) is as important as entry signals." }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-red-200  rounded-full flex items-center justify-center text-red-600  text-xs font-bold flex-shrink-0">{i+1}</span>
                    <div>
                      <span className="font-semibold text-red-700 ">{item.title}:</span>
                      <span className="text-red-600  ml-1">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Takeaways */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50   rounded-2xl p-6 mb-10 border border-emerald-200 ">
              <h3 className="font-bold text-emerald-800  mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center"><Icons.Key className="w-5 h-5 text-white"/></span>
                Key Takeaways
              </h3>
              <ul className="space-y-2">
                {["There are 4 main strategy types: Trend Following, Mean Reversion, Momentum, and Market Making/Arbitrage",
                  "Each strategy works best in specific market conditions — there's no 'best' strategy",
                  "Trend following has low win rates but large wins; Mean reversion has high win rates but small wins",
                  "Start with one strategy type and master it before combining multiple approaches",
                  "Always account for transaction costs, slippage, and taxes in your strategy testing"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-emerald-700 ">
                    <Icons.CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"/><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quiz */}
            <h2 className="text-2xl font-bold mb-6">Test Your Understanding</h2>
            <QuizQuestion
              question="Which strategy type typically has the lowest win rate but largest profits per winning trade?"
              options={["Mean Reversion", "Trend Following", "Market Making", "Statistical Arbitrage"]}
              correctAnswer="B"
              explanation="Trend following strategies often have win rates of only 30-40%, but winning trades can be very large as they capture extended price moves."
            />
            <QuizQuestion
              question="What type of market condition is WORST for a mean reversion strategy?"
              options={["Sideways/ranging market", "High liquidity stocks", "Strong trending market", "Stable volatility"]}
              correctAnswer="C"
              explanation="Mean reversion assumes prices return to an average. In a strong trend, prices keep moving away from the mean, causing repeated losses."
            />
            <QuizQuestion
              question="Which of these is a common strategy development mistake?"
              options={["Using multiple timeframes", "Accounting for transaction costs", "Overfitting to historical data", "Having clear exit rules"]}
              correctAnswer="C"
              explanation="Overfitting creates strategies that look perfect on past data but fail in live markets because they've memorized noise rather than genuine patterns."
            />
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/algo-trading-lesson-2')}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors group">
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/>Back: System Architecture
            </button>
            <button onClick={() => navigate('/learn/algo-trading-lesson-4')}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all">
              Next: Backtesting Essentials<FaArrowRight/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AlgoTradingLesson3;
