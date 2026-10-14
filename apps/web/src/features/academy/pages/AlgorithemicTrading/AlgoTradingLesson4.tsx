import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// SVG Icons
const Icons = {
  Backtest: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4V9H9" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.5 15C6.5 18 9.5 20 13 20C17.42 20 21 16.42 21 12C21 7.58 17.42 4 13 4C9.5 4 6.5 6 5.5 9L4 9"/>
      <path d="M13 8V12L16 14" strokeLinecap="round"/>
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
  Warning: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 9V13M12 17H12.01"/><path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.54 21H20.46A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z"/>
    </svg>
  ),
  Key: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="15" r="5"/><path d="M11.5 11.5L21 2M18 5L21 2L21 5L18 5Z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Lightbulb: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18H15M10 22H14"/><path d="M18 12A6 6 0 1 0 9 17.13V18A1 1 0 0 0 10 19H14A1 1 0 0 0 15 18V17.13A6 6 0 0 0 18 12Z"/>
    </svg>
  ),
  Chart: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3V21H21"/><path d="M7 16L11 12L15 14L21 8"/>
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
          let bg = "bg-gray-50  hover:bg-blue-50 ", border = "border-gray-200 ";
          if (showResult) { if (isRight) { bg="bg-brand-soft "; border="border-brand"; } 
            else if (isThis) { bg="bg-red-50 "; border="border-red-400"; }}
          return (
            <button key={i} onClick={()=>handleClick(i)} disabled={showResult}
              className={`w-full text-left p-4 rounded-xl border-2 ${border} ${bg} transition-all`}>
              <span className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${showResult && isRight ? 'bg-brand-fill text-white' : showResult && isThis ? 'bg-red-500 text-white' : 'bg-blue-100  text-blue-600'}`}>{letter}</span>
                <span className="text-gray-700 ">{opt}</span>
                {showResult && isRight && <FaCheckCircle className="ml-auto text-brand"/>}
                {showResult && isThis && !isRight && <FaTimesCircle className="ml-auto text-red-500"/>}
              </span>
            </button>
          );
        })}
      </div>
      {showResult && (
        <div className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-brand-soft  text-brand ' : 'bg-amber-100  text-amber-800 '}`}>
          <p className="font-medium flex items-center gap-2">
            {isCorrect ? <><FaCheckCircle/> Correct!</> : <><FaTimesCircle/> Not quite.</>}
          </p>
          <p className="text-sm mt-1">{explanation}</p>
        </div>
      )}
    </div>
  );
};

const AlgoTradingLesson4 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-blue-50/30   text-gray-900  min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb */}
          <button onClick={() => navigate('/learn/algorithmic-trading')}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 group">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/><span>Back to Algorithmic Trading</span>
          </button>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 text-white rounded-full text-sm font-bold bg-brand-fill">Lesson 4 of 9</span>
              <span className="px-3 py-1.5 bg-gray-100  text-gray-600  rounded-full text-sm">20 min read</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold mb-4 flex items-center gap-4 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg bg-brand-fill">
                <Icons.Backtest className="w-8 h-8 text-white"/>
              </span>
              Backtesting & Optimization
            </h1>
            <p className="text-xl text-gray-600 ">
              Learn how to test your strategies on historical data without fooling yourself.
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50   rounded-2xl p-6 mb-10 border border-blue-200 ">
            <h2 className="font-semibold text-blue-800  mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Icons.Target className="w-5 h-5 text-white"/></span>
              What You'll Learn
            </h2>
            <ul className="space-y-2">
              {["Understand what backtesting is and why it matters", "Learn the dangers of overfitting and curve-fitting", 
                "Master walk-forward analysis and out-of-sample testing", "Know the key metrics to evaluate strategy performance"].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-blue-700 ">
                  <Icons.CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"/><span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none ">
            
            {/* Intro */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50   rounded-2xl p-6 mb-10 border border-amber-200 ">
              <h3 className="font-semibold text-amber-900  mb-3 text-lg flex items-center gap-2">
                <Icons.Lightbulb className="w-5 h-5"/> The Most Important Skill
              </h3>
              <p className="text-amber-800 ">
                A strategy that looked amazing in backtesting but fails in live trading is worse than useless — it gives you false confidence. 
                <strong> Learning to test properly is what separates successful algo traders from the rest.</strong>
              </p>
            </div>

            <h2 className="text-2xl font-semibold mb-4 tracking-[-0.025em]">What is Backtesting?</h2>
            <p className="text-gray-700  mb-6">
              Backtesting is the process of applying your trading rules to historical market data to see how they would have performed. 
              It's your strategy's "time machine" — testing ideas without risking real money.
            </p>

            {/* Backtesting Flow SVG */}
            <div className="rounded-2xl p-6 mb-10 border border-blue-800/50 shadow-xl bg-brand-fill">
              <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 280" fill="none">
                <text x="350" y="25" textAnchor="middle" fill="#ECE4F6" fontSize="14" fontWeight="700">THE BACKTESTING PROCESS</text>

                {/* Step 1: Historical Data */}
                <g transform="translate(30, 60)">
                  <rect x="0" y="0" width="140" height="90" rx="12" fill="#2A2A2C" stroke="#5A77AA" strokeWidth="2"/>
                  <circle cx="70" cy="25" r="15" fill="#5A77AA"/>
                  <text x="70" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">1</text>
                  <text x="70" y="55" textAnchor="middle" fill="#9FB3D3" fontSize="11" fontWeight="600">HISTORICAL</text>
                  <text x="70" y="70" textAnchor="middle" fill="#9FB3D3" fontSize="11" fontWeight="600">DATA</text>
                  <text x="70" y="85" textAnchor="middle" fill="#717680" fontSize="8">Past prices & events</text>
                </g>

                {/* Arrow */}
                <path d="M175 105 L210 105" stroke="#555A63" strokeWidth="2" markerEnd="url(#arrow)"/>
                <text x="193" y="95" textAnchor="middle" fill="#717680" fontSize="8">+</text>

                {/* Step 2: Strategy Rules */}
                <g transform="translate(215, 60)">
                  <rect x="0" y="0" width="140" height="90" rx="12" fill="#2A2A2C" stroke="#8F6FC4" strokeWidth="2"/>
                  <circle cx="70" cy="25" r="15" fill="#8F6FC4"/>
                  <text x="70" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">2</text>
                  <text x="70" y="55" textAnchor="middle" fill="#C0A9E2" fontSize="11" fontWeight="600">STRATEGY</text>
                  <text x="70" y="70" textAnchor="middle" fill="#C0A9E2" fontSize="11" fontWeight="600">RULES</text>
                  <text x="70" y="85" textAnchor="middle" fill="#717680" fontSize="8">Your trading logic</text>
                </g>

                {/* Arrow */}
                <path d="M360 105 L395 105" stroke="#555A63" strokeWidth="2"/>
                <text x="378" y="95" textAnchor="middle" fill="#717680" fontSize="8">=</text>

                {/* Step 3: Simulated Trades */}
                <g transform="translate(400, 60)">
                  <rect x="0" y="0" width="140" height="90" rx="12" fill="#2A2A2C" stroke="#B8923F" strokeWidth="2"/>
                  <circle cx="70" cy="25" r="15" fill="#B8923F"/>
                  <text x="70" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">3</text>
                  <text x="70" y="55" textAnchor="middle" fill="#E2C273" fontSize="11" fontWeight="600">SIMULATED</text>
                  <text x="70" y="70" textAnchor="middle" fill="#E2C273" fontSize="11" fontWeight="600">TRADES</text>
                  <text x="70" y="85" textAnchor="middle" fill="#717680" fontSize="8">What would happen</text>
                </g>

                {/* Arrow */}
                <path d="M545 105 L580 105" stroke="#555A63" strokeWidth="2"/>

                {/* Step 4: Results */}
                <g transform="translate(555, 60)">
                  <rect x="0" y="0" width="120" height="90" rx="12" fill="#2A2A2C" stroke="#12805A" strokeWidth="2"/>
                  <circle cx="60" cy="25" r="15" fill="#12805A"/>
                  <text x="60" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">4</text>
                  <text x="60" y="55" textAnchor="middle" fill="#3CCB97" fontSize="11" fontWeight="600">RESULTS</text>
                  <text x="60" y="70" textAnchor="middle" fill="#3CCB97" fontSize="11" fontWeight="600">& METRICS</text>
                  <text x="60" y="85" textAnchor="middle" fill="#717680" fontSize="8">Performance data</text>
                </g>

                {/* Warning Box */}
                <g transform="translate(100, 180)">
                  <rect x="0" y="0" width="500" height="70" rx="10" fill="#2A2A2C" stroke="#E04848" strokeWidth="2"/>
                  <text x="250" y="25" textAnchor="middle" fill="#F09B9B" fontSize="11" fontWeight="600">⚠️ CRITICAL WARNING</text>
                  <text x="250" y="45" textAnchor="middle" fill="#A0A3AA" fontSize="9">Good backtest results ≠ Good future results</text>
                  <text x="250" y="60" textAnchor="middle" fill="#717680" fontSize="9">The past does not guarantee the future. Always validate properly.</text>
                </g>
              </svg>
            </div>

            {/* The Overfitting Problem */}
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="w-10 h-10 bg-red-100  rounded-xl flex items-center justify-center">
                <Icons.Warning className="w-5 h-5 text-red-600 "/>
              </span>
              The #1 Enemy: Overfitting
            </h2>

            <div className="bg-gradient-to-r from-red-50 to-rose-50   rounded-2xl p-6 mb-8 border border-red-200 ">
              <p className="text-gray-700  mb-4">
                <strong>Overfitting</strong> (also called "curve-fitting") is when you optimize your strategy so much that it perfectly fits historical data 
                but fails on new data. It's like memorizing exam answers instead of learning the concepts.
              </p>
              
              {/* Overfitting Visual */}
              <div className="bg-white  rounded-xl p-4 mb-4">
                <svg className="w-full max-w-2xl mx-auto" viewBox="0 0 600 200" fill="none">
                  <text x="300" y="20" textAnchor="middle" className="fill-gray-500 " fontSize="12" fontWeight="600">OVERFITTING vs GOOD FIT</text>
                  
                  {/* Good Fit */}
                  <g transform="translate(50, 40)">
                    <rect x="0" y="0" width="220" height="140" rx="8" className="fill-brand-soft  stroke-brand" strokeWidth="2"/>
                    <text x="110" y="25" textAnchor="middle" className="fill-brand " fontSize="10" fontWeight="600">✓ GOOD FIT</text>
                    
                    {/* Simple trend line */}
                    <path d="M30 110 Q110 50 190 80" stroke="#12805A" strokeWidth="3" fill="none"/>
                    
                    {/* Data points */}
                    <circle cx="40" cy="105" r="4" fill="#5A77AA"/><circle cx="70" cy="85" r="4" fill="#5A77AA"/>
                    <circle cx="100" cy="65" r="4" fill="#5A77AA"/><circle cx="130" cy="70" r="4" fill="#5A77AA"/>
                    <circle cx="160" cy="75" r="4" fill="#5A77AA"/><circle cx="190" cy="80" r="4" fill="#5A77AA"/>
                    
                    <text x="110" y="135" textAnchor="middle" className="fill-brand " fontSize="8">Captures the trend, ignores noise</text>
                  </g>

                  {/* Overfit */}
                  <g transform="translate(330, 40)">
                    <rect x="0" y="0" width="220" height="140" rx="8" className="fill-red-50  stroke-red-400" strokeWidth="2"/>
                    <text x="110" y="25" textAnchor="middle" className="fill-red-700 " fontSize="10" fontWeight="600">✗ OVERFIT</text>
                    
                    {/* Complex curve hitting every point */}
                    <path d="M30 105 Q45 105 50 85 Q55 65 70 85 Q85 105 100 65 Q115 25 130 70 Q145 115 160 75 Q175 35 190 80" 
                          stroke="#C7363B" strokeWidth="3" fill="none"/>
                    
                    {/* Same data points */}
                    <circle cx="40" cy="105" r="4" fill="#5A77AA"/><circle cx="70" cy="85" r="4" fill="#5A77AA"/>
                    <circle cx="100" cy="65" r="4" fill="#5A77AA"/><circle cx="130" cy="70" r="4" fill="#5A77AA"/>
                    <circle cx="160" cy="75" r="4" fill="#5A77AA"/><circle cx="190" cy="80" r="4" fill="#5A77AA"/>
                    
                    <text x="110" y="135" textAnchor="middle" className="fill-red-600 " fontSize="8">Fits perfectly but won't generalize</text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Signs of Overfitting */}
            <h3 className="text-xl font-semibold mb-4">Signs Your Strategy is Overfit</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { title: "Too Many Parameters", desc: "More than 5-7 parameters is usually a red flag" },
                { title: "Perfect Backtest Results", desc: "90%+ win rate? Probably too good to be true" },
                { title: "Works Only on Specific Period", desc: "Falls apart when tested on different dates" },
                { title: "Uses Exact Numbers", desc: "Like 'sell at exactly 2.37% profit' — suspicious" }
              ].map((item, i) => (
                <div key={i} className="bg-red-50  rounded-xl p-4 border border-red-200 ">
                  <h4 className="font-semibold text-red-700  mb-1">{item.title}</h4>
                  <p className="text-sm text-red-600 ">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* The Solution: Walk-Forward Analysis */}
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="w-10 h-10 bg-brand-soft  rounded-xl flex items-center justify-center">
                <Icons.Chart className="w-5 h-5 text-brand "/>
              </span>
              The Solution: Walk-Forward Analysis
            </h2>

            <p className="text-gray-700  mb-6">
              Walk-forward analysis splits your data into <strong>in-sample</strong> (training) and <strong>out-of-sample</strong> (testing) periods. 
              You optimize on in-sample, then validate on out-of-sample data the strategy has never seen.
            </p>

            {/* Walk-Forward SVG */}
            <div className="rounded-2xl p-6 mb-10 border border-brand/50 shadow-xl bg-brand-fill">
              <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 300" fill="none">
                <text x="350" y="25" textAnchor="middle" fill="#ECE4F6" fontSize="14" fontWeight="700">WALK-FORWARD ANALYSIS</text>
                <text x="350" y="45" textAnchor="middle" fill="#A0A3AA" fontSize="10">Optimize → Test → Move Forward → Repeat</text>

                {/* Timeline */}
                <line x1="50" y1="100" x2="650" y2="100" stroke="#555A63" strokeWidth="3"/>
                <text x="50" y="90" fill="#717680" fontSize="9">2018</text>
                <text x="200" y="90" fill="#717680" fontSize="9">2019</text>
                <text x="350" y="90" fill="#717680" fontSize="9">2020</text>
                <text x="500" y="90" fill="#717680" fontSize="9">2021</text>
                <text x="630" y="90" fill="#717680" fontSize="9">2022</text>

                {/* Window 1 */}
                <g transform="translate(50, 120)">
                  <rect x="0" y="0" width="200" height="30" rx="4" fill="#5A77AA" opacity="0.7"/>
                  <text x="100" y="20" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">IN-SAMPLE (Optimize)</text>
                  <rect x="200" y="0" width="80" height="30" rx="4" fill="#12805A"/>
                  <text x="240" y="20" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">TEST</text>
                </g>

                {/* Window 2 */}
                <g transform="translate(130, 160)">
                  <rect x="0" y="0" width="200" height="30" rx="4" fill="#5A77AA" opacity="0.7"/>
                  <text x="100" y="20" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">IN-SAMPLE (Optimize)</text>
                  <rect x="200" y="0" width="80" height="30" rx="4" fill="#12805A"/>
                  <text x="240" y="20" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">TEST</text>
                </g>

                {/* Window 3 */}
                <g transform="translate(210, 200)">
                  <rect x="0" y="0" width="200" height="30" rx="4" fill="#5A77AA" opacity="0.7"/>
                  <text x="100" y="20" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">IN-SAMPLE (Optimize)</text>
                  <rect x="200" y="0" width="80" height="30" rx="4" fill="#12805A"/>
                  <text x="240" y="20" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">TEST</text>
                </g>

                {/* Legend */}
                <g transform="translate(480, 140)">
                  <rect x="0" y="0" width="160" height="80" rx="8" fill="#1F1F1F" stroke="#373A41"/>
                  <rect x="15" y="15" width="20" height="12" rx="2" fill="#5A77AA"/>
                  <text x="45" y="25" fill="#A0A3AA" fontSize="9">Training Period</text>
                  <rect x="15" y="35" width="20" height="12" rx="2" fill="#12805A"/>
                  <text x="45" y="45" fill="#A0A3AA" fontSize="9">Testing Period</text>
                  <text x="80" y="68" textAnchor="middle" fill="#717680" fontSize="8">Results must be consistent</text>
                </g>
              </svg>
            </div>

            {/* Key Metrics */}
            <h2 className="text-2xl font-semibold mb-4 tracking-[-0.025em]">Key Performance Metrics</h2>
            <p className="text-gray-700  mb-6">
              Don't just look at total profit. These metrics give you a complete picture of strategy performance:
            </p>

            <div className="grid gap-4 mb-10">
              {[
                { name: "Sharpe Ratio", target: "> 1.0", desc: "Risk-adjusted returns. Higher is better. Above 1 is decent, above 2 is excellent.", color: "blue" },
                { name: "Maximum Drawdown", target: "< 20%", desc: "Largest peak-to-trough decline. Tells you worst-case scenario for your capital.", color: "rose" },
                { name: "Win Rate", target: "40-60%", desc: "Percentage of winning trades. Doesn't need to be high if winners are larger than losers.", color: "amber" },
                { name: "Profit Factor", target: "> 1.5", desc: "Gross profit ÷ Gross loss. Above 1 means profitable, above 1.5 is good.", color: "emerald" },
                { name: "Number of Trades", target: "> 100", desc: "Statistical significance. More trades = more reliable results.", color: "violet" }
              ].map((metric) => {
                const colors = { blue: "border-blue-500 bg-blue-50 ", rose: "border-rose-500 bg-rose-50 ",
                  amber: "border-amber-500 bg-amber-50 ", emerald: "border-brand bg-brand-soft ",
                  violet: "border-violet-500 bg-violet-50 " };
                return (
                  <div key={metric.name} className={`rounded-xl p-4 border-l-4 ${colors[metric.color]}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 ">{metric.name}</h4>
                      <span className="px-3 py-1 bg-white  rounded-full text-sm font-mono text-gray-700 ">{metric.target}</span>
                    </div>
                    <p className="text-sm text-gray-600 ">{metric.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Common Mistakes */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50   rounded-2xl p-6 mb-10 border border-red-200 ">
              <h3 className="font-semibold text-red-800  mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><Icons.Warning className="w-5 h-5 text-white"/></span>
                Common Backtesting Mistakes
              </h3>
              <ul className="space-y-3">
                {[
                  { title: "Look-Ahead Bias", desc: "Using information that wouldn't have been available at trade time (like using day's close to decide morning trade)." },
                  { title: "Survivorship Bias", desc: "Only testing on stocks that exist today, ignoring delisted/bankrupt companies." },
                  { title: "Ignoring Transaction Costs", desc: "Not accounting for brokerage, slippage, STT, and other fees." },
                  { title: "Not Enough Data", desc: "Testing on 6 months of data isn't statistically significant." }
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
            <div className="rounded-2xl p-6 mb-10 border border-brand-line bg-brand-soft">
              <h3 className="font-semibold text-brand  mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-brand-fill rounded-lg flex items-center justify-center"><Icons.Key className="w-5 h-5 text-white"/></span>
                Key Takeaways
              </h3>
              <ul className="space-y-2">
                {["Backtesting is essential but NOT a guarantee of future performance",
                  "Overfitting is the #1 reason strategies fail in live trading",
                  "Use walk-forward analysis to validate on unseen data",
                  "Look at multiple metrics, not just total profit",
                  "Include realistic transaction costs and slippage",
                  "Need at least 100+ trades for statistical significance"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-brand ">
                    <Icons.CheckCircle className="w-5 h-5 text-brand mt-0.5 flex-shrink-0"/><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quiz */}
            <h2 className="text-2xl font-semibold mb-6 tracking-[-0.015em]">Test Your Understanding</h2>
            <QuizQuestion
              question="What is overfitting in the context of backtesting?"
              options={["When your strategy is too simple", "When your strategy fits historical data too perfectly and fails on new data", "When you test on too much data", "When transaction costs are too high"]}
              correctAnswer="B"
              explanation="Overfitting occurs when a strategy is optimized so much for historical data that it captures noise rather than genuine patterns, leading to poor performance on new, unseen data."
            />
            <QuizQuestion
              question="What is the purpose of out-of-sample testing?"
              options={["To make the backtest results look better", "To validate strategy performance on data it was NOT optimized on", "To reduce the number of trades", "To increase the Sharpe ratio"]}
              correctAnswer="B"
              explanation="Out-of-sample testing validates your strategy on data it has never seen during optimization, helping detect overfitting and giving a more realistic performance estimate."
            />
            <QuizQuestion
              question="Which metric tells you the worst-case decline your capital might experience?"
              options={["Sharpe Ratio", "Win Rate", "Maximum Drawdown", "Profit Factor"]}
              correctAnswer="C"
              explanation="Maximum Drawdown measures the largest peak-to-trough decline in your portfolio, showing you the worst loss you would have experienced at any point."
            />
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/algo-trading-lesson-3')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group">
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/>Back: Strategy Development
            </button>
            <button onClick={() => navigate('/learn/algo-trading-lesson-5')}
              className="flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all bg-brand-fill">
              Next: Risk Management<FaArrowRight/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AlgoTradingLesson4;
