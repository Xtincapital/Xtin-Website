import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// SVG Icons
const Icons = {
  Shield: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3L20 7V11C20 15.42 16.42 19 12 21C7.58 19 4 15.42 4 11V7L12 3Z"/>
      <path d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round"/>
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
  TrendDown: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 18L13.5 8.5L8.5 13.5L1 6"/><path d="M17 18H23V12"/>
    </svg>
  ),
  Percent: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 18L18 6"/>
    </svg>
  ),
  Scale: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3V21M5 6L12 3L19 6M5 6L5 10C5 12 7 14 12 14C17 14 19 12 19 10V6"/>
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
          let bg = "bg-gray-50  hover:bg-rose-50 ", border = "border-gray-200 ";
          if (showResult) { if (isRight) { bg="bg-brand-soft "; border="border-brand"; } 
            else if (isThis) { bg="bg-red-50 "; border="border-red-400"; }}
          return (
            <button key={i} onClick={()=>handleClick(i)} disabled={showResult}
              className={`w-full text-left p-4 rounded-xl border-2 ${border} ${bg} transition-all`}>
              <span className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${showResult && isRight ? 'bg-brand-fill text-white' : showResult && isThis ? 'bg-red-500 text-white' : 'bg-rose-100  text-rose-600'}`}>{letter}</span>
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

const AlgoTradingLesson5 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-rose-50/30   text-gray-900  min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb */}
          <button onClick={() => navigate('/learn/algorithmic-trading')}
            className="flex items-center gap-2 text-gray-500 hover:text-rose-600 transition-colors mb-8 group">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/><span>Back to Algorithmic Trading</span>
          </button>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-full text-sm font-bold">Lesson 5 of 9</span>
              <span className="px-3 py-1.5 bg-gray-100  text-gray-600  rounded-full text-sm">18 min read</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 flex items-center gap-4 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg">
                <Icons.Shield className="w-8 h-8 text-white"/>
              </span>
              Risk Management in Algo Trading
            </h1>
            <p className="text-xl text-gray-600 ">
              The difference between surviving and thriving in algorithmic trading.
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50   rounded-2xl p-6 mb-10 border border-rose-200 ">
            <h2 className="font-semibold text-rose-800  mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center"><Icons.Target className="w-5 h-5 text-white"/></span>
              What You'll Learn
            </h2>
            <ul className="space-y-2">
              {["Master position sizing formulas and techniques", "Understand drawdowns and how to manage them", 
                "Learn the Kelly Criterion and when to use it", "Implement stop-losses and portfolio-level risk controls"].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-rose-700 ">
                  <Icons.CheckCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0"/><span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none ">
            
            {/* Intro */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50   rounded-2xl p-6 mb-10 border border-amber-200 ">
              <h3 className="font-semibold text-amber-900  mb-3 text-lg flex items-center gap-2">
                <Icons.Lightbulb className="w-5 h-5"/> The Most Important Lesson
              </h3>
              <p className="text-amber-800 ">
                <strong>"The strategy that survives is better than the strategy that maximizes returns."</strong> 
                Without proper risk management, even the best strategy will eventually blow up your account. 
                Risk management isn't about avoiding losses — it's about surviving to trade another day.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4 tracking-[-0.025em]">Why Risk Management Matters More Than Strategy</h2>
            <p className="text-gray-700  mb-6">
              A mediocre strategy with excellent risk management will outperform an excellent strategy with poor risk management. 
              Here's why: <strong>markets are unpredictable</strong>. No matter how good your backtest looks, unexpected events happen.
            </p>

            {/* Risk Hierarchy SVG */}
            <div className="rounded-2xl p-6 mb-10 border border-rose-800/50 shadow-xl bg-brand-fill">
              <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 320" fill="none">
                <text x="350" y="25" textAnchor="middle" fill="#ECE4F6" fontSize="14" fontWeight="700">THE RISK MANAGEMENT HIERARCHY</text>
                <text x="350" y="45" textAnchor="middle" fill="#A0A3AA" fontSize="10">From most critical to least critical</text>

                {/* Pyramid */}
                <g transform="translate(150, 70)">
                  {/* Level 1 - Survival */}
                  <path d="M200 0 L350 230 L50 230 Z" fill="#C7363B" opacity="0.9"/>
                  <text x="200" y="200" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">SURVIVAL</text>
                  <text x="200" y="215" textAnchor="middle" fill="#F6C3C3" fontSize="9">Never risk ruin</text>
                  
                  {/* Level 2 - Drawdown Control */}
                  <path d="M200 40 L320 180 L80 180 Z" fill="#B8923F" opacity="0.9"/>
                  <text x="200" y="155" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">DRAWDOWN CONTROL</text>
                  <text x="200" y="168" textAnchor="middle" fill="#F6ECCE" fontSize="8">Limit peak-to-trough losses</text>
                  
                  {/* Level 3 - Position Sizing */}
                  <path d="M200 80 L290 135 L110 135 Z" fill="#16A34A" opacity="0.9"/>
                  <text x="200" y="115" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">POSITION SIZING</text>
                  <text x="200" y="128" textAnchor="middle" fill="#F0FDF4" fontSize="8">Right size per trade</text>
                  
                  {/* Level 4 - Entry/Exit */}
                  <path d="M200 105 L250 90 L150 90 L200 105" fill="#5A77AA" opacity="0.9"/>
                </g>

                {/* Labels */}
                <g transform="translate(520, 120)">
                  <rect x="0" y="0" width="150" height="160" rx="8" fill="#1F1F1F" stroke="#373A41"/>
                  <text x="75" y="25" textAnchor="middle" fill="#ECE4F6" fontSize="10" fontWeight="600">Priority Order:</text>
                  
                  <circle cx="20" cy="50" r="8" fill="#C7363B"/>
                  <text x="20" y="54" textAnchor="middle" fill="white" fontSize="8">1</text>
                  <text x="40" y="54" fill="#F09B9B" fontSize="9">Survival First</text>
                  
                  <circle cx="20" cy="80" r="8" fill="#B8923F"/>
                  <text x="20" y="84" textAnchor="middle" fill="white" fontSize="8">2</text>
                  <text x="40" y="84" fill="#E2C273" fontSize="9">Control Drawdowns</text>
                  
                  <circle cx="20" cy="110" r="8" fill="#16A34A"/>
                  <text x="20" y="114" textAnchor="middle" fill="white" fontSize="8">3</text>
                  <text x="40" y="114" fill="#16A34A" fontSize="9">Size Positions</text>
                  
                  <circle cx="20" cy="140" r="8" fill="#5A77AA"/>
                  <text x="20" y="144" textAnchor="middle" fill="white" fontSize="8">4</text>
                  <text x="40" y="144" fill="#9FB3D3" fontSize="9">Entry/Exit Rules</text>
                </g>
              </svg>
            </div>

            {/* Position Sizing */}
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="w-10 h-10 bg-brand-soft  rounded-xl flex items-center justify-center">
                <Icons.Scale className="w-5 h-5 text-brand "/>
              </span>
              Position Sizing: The Most Important Decision
            </h2>

            <p className="text-gray-700  mb-6">
              Position sizing determines <strong>how much</strong> of your capital to risk on each trade. 
              Get it wrong, and you'll either blow up your account or grow it too slowly.
            </p>

            {/* Position Sizing Methods */}
            <div className="grid gap-6 mb-10">
              {/* Fixed Percentage */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50   rounded-2xl p-6 border-l-4 border-blue-500">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Icons.Percent className="w-6 h-6 text-white"/>
                  </span>
                  <div>
                    <span className="text-xs font-bold text-blue-600 ">METHOD 1</span>
                    <h3 className="text-xl font-semibold text-gray-900 ">Fixed Percentage Risk</h3>
                  </div>
                </div>
                
                <p className="text-gray-700  mb-4">
                  Risk a fixed percentage of your capital on each trade (typically 1-2%).
                </p>

                <div className="bg-white  rounded-xl p-4 mb-4">
                  <p className="font-mono text-sm text-gray-800  mb-2">
                    <strong>Formula:</strong> Position Size = (Account × Risk %) ÷ Stop Loss Distance
                  </p>
                  <div className="bg-blue-50  rounded-lg p-3 mt-3">
                    <p className="text-sm text-blue-800 ">
                      <strong>Example:</strong> ₹10,00,000 account × 1% risk = ₹10,000 max loss per trade<br/>
                      If stop loss is ₹50 away → Position size = ₹10,000 ÷ ₹50 = 200 shares
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-brand-soft  rounded-lg p-3">
                    <p className="text-sm font-semibold text-brand ">✓ Pros</p>
                    <ul className="text-xs text-brand  mt-1 space-y-1">
                      <li>• Simple to calculate</li>
                      <li>• Automatic position adjustment</li>
                      <li>• Limits catastrophic losses</li>
                    </ul>
                  </div>
                  <div className="bg-red-50  rounded-lg p-3">
                    <p className="text-sm font-semibold text-red-700 ">✗ Cons</p>
                    <ul className="text-xs text-red-600  mt-1 space-y-1">
                      <li>• Ignores strategy edge</li>
                      <li>• Same risk for all setups</li>
                      <li>• May be too conservative</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Kelly Criterion */}
              <div className="bg-gradient-to-r from-violet-50 to-purple-50   rounded-2xl p-6 border-l-4 border-violet-500">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">K</span>
                  </span>
                  <div>
                    <span className="text-xs font-bold text-violet-600 ">METHOD 2</span>
                    <h3 className="text-xl font-semibold text-gray-900 ">Kelly Criterion</h3>
                  </div>
                </div>
                
                <p className="text-gray-700  mb-4">
                  Mathematically optimal position sizing based on your win rate and reward-to-risk ratio.
                </p>

                <div className="bg-white  rounded-xl p-4 mb-4">
                  <p className="font-mono text-sm text-gray-800  mb-2">
                    <strong>Formula:</strong> Kelly % = W - [(1-W) ÷ R]
                  </p>
                  <p className="text-xs text-gray-500  mb-2">
                    W = Win probability, R = Win/Loss ratio
                  </p>
                  <div className="bg-violet-50  rounded-lg p-3 mt-3">
                    <p className="text-sm text-violet-800 ">
                      <strong>Example:</strong> 55% win rate, 1.5:1 reward/risk<br/>
                      Kelly = 0.55 - (0.45 ÷ 1.5) = 0.55 - 0.30 = <strong>25%</strong><br/>
                      <span className="text-xs">Most traders use "Half Kelly" (12.5%) to reduce volatility</span>
                    </p>
                  </div>
                </div>
                
                <div className="bg-amber-100  rounded-lg p-3">
                  <p className="text-sm text-amber-800 ">
                    <strong>⚠️ Warning:</strong> Full Kelly is very aggressive. Most professionals use 25-50% of Kelly to smooth out equity curve swings.
                  </p>
                </div>
              </div>
            </div>

            {/* Drawdown Management */}
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="w-10 h-10 bg-red-100  rounded-xl flex items-center justify-center">
                <Icons.TrendDown className="w-5 h-5 text-red-600 "/>
              </span>
              Understanding Drawdowns
            </h2>

            <p className="text-gray-700  mb-6">
              A <strong>drawdown</strong> is the peak-to-trough decline in your account. 
              Understanding drawdowns is crucial because recovering from them is harder than you think.
            </p>

            {/* Drawdown Recovery Table */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50   rounded-2xl p-6 mb-10 border border-red-200 ">
              <h3 className="font-semibold text-red-800  mb-4">The Math of Recovery</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-red-100 ">
                      <th className="p-3 text-left font-bold text-red-800 ">Drawdown</th>
                      <th className="p-3 text-left font-bold text-red-800 ">Gain Needed to Recover</th>
                      <th className="p-3 text-left font-bold text-red-800 ">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-200 ">
                    {[
                      ["10%", "11%", "Easy"],
                      ["20%", "25%", "Manageable"],
                      ["30%", "43%", "Challenging"],
                      ["40%", "67%", "Difficult"],
                      ["50%", "100%", "Very Hard"],
                      ["75%", "300%", "Near Impossible"],
                      ["90%", "900%", "Game Over"]
                    ].map((row, i) => (
                      <tr key={i} className="bg-white ">
                        <td className="p-3 font-medium text-red-700 ">{row[0]}</td>
                        <td className="p-3 text-gray-700 ">{row[1]}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            i < 2 ? 'bg-brand-soft text-brand  ' :
                            i < 4 ? 'bg-amber-100 text-amber-700  ' :
                            'bg-red-100 text-red-700  '
                          }`}>{row[2]}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-red-600  mt-4">
                <strong>Key Insight:</strong> Keeping drawdowns below 20-25% is critical. Beyond that, recovery becomes exponentially harder.
              </p>
            </div>

            {/* Portfolio Level Controls */}
            <h2 className="text-2xl font-bold mb-4 tracking-[-0.015em]">Portfolio-Level Risk Controls</h2>
            <p className="text-gray-700  mb-6">
              Beyond individual trade risk, you need system-wide safeguards:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {[
                { title: "Max Daily Loss", value: "2-3%", desc: "Stop trading for the day if you hit this limit" },
                { title: "Max Weekly Loss", value: "5-6%", desc: "Reduce position sizes or pause trading" },
                { title: "Max Correlation", value: "< 0.5", desc: "Avoid having all positions move together" },
                { title: "Max Position Count", value: "10-15", desc: "Don't over-diversify into too many positions" },
                { title: "Single Sector Limit", value: "< 30%", desc: "Avoid concentration in one industry" },
                { title: "Max Drawdown Trigger", value: "15-20%", desc: "Review strategy if breached" }
              ].map((item, i) => (
                <div key={i} className="bg-white  rounded-xl p-4 border border-gray-200  shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 ">{item.title}</h4>
                    <span className="px-3 py-1 bg-rose-100  rounded-full text-sm font-mono text-rose-700 ">{item.value}</span>
                  </div>
                  <p className="text-sm text-gray-600 ">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Stop Loss Types */}
            <h2 className="text-2xl font-bold mb-4 tracking-[-0.015em]">Stop Loss Strategies</h2>
            
            <div className="rounded-2xl p-6 mb-10 border border-rose-800/50 shadow-xl bg-brand-fill">
              <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 280" fill="none">
                <text x="350" y="25" textAnchor="middle" fill="#ECE4F6" fontSize="14" fontWeight="700">STOP LOSS TYPES</text>

                {/* Fixed Stop */}
                <g transform="translate(30, 60)">
                  <rect x="0" y="0" width="200" height="100" rx="10" fill="#2A2A2C" stroke="#5A77AA" strokeWidth="2"/>
                  <text x="100" y="30" textAnchor="middle" fill="#9FB3D3" fontSize="11" fontWeight="600">FIXED STOP</text>
                  <text x="100" y="55" textAnchor="middle" fill="#717680" fontSize="9">Exit at specific price</text>
                  <text x="100" y="75" textAnchor="middle" fill="#A0A3AA" fontSize="8">e.g., "Sell if price drops 2%"</text>
                  <text x="100" y="90" textAnchor="middle" fill="#16A34A" fontSize="8">✓ Simple, predictable</text>
                </g>

                {/* Trailing Stop */}
                <g transform="translate(250, 60)">
                  <rect x="0" y="0" width="200" height="100" rx="10" fill="#2A2A2C" stroke="#8F6FC4" strokeWidth="2"/>
                  <text x="100" y="30" textAnchor="middle" fill="#C0A9E2" fontSize="11" fontWeight="600">TRAILING STOP</text>
                  <text x="100" y="55" textAnchor="middle" fill="#717680" fontSize="9">Moves with price</text>
                  <text x="100" y="75" textAnchor="middle" fill="#A0A3AA" fontSize="8">e.g., "Always 5% below high"</text>
                  <text x="100" y="90" textAnchor="middle" fill="#16A34A" fontSize="8">✓ Locks in profits</text>
                </g>

                {/* Volatility Stop */}
                <g transform="translate(470, 60)">
                  <rect x="0" y="0" width="200" height="100" rx="10" fill="#2A2A2C" stroke="#B8923F" strokeWidth="2"/>
                  <text x="100" y="30" textAnchor="middle" fill="#E2C273" fontSize="11" fontWeight="600">VOLATILITY STOP (ATR)</text>
                  <text x="100" y="55" textAnchor="middle" fill="#717680" fontSize="9">Based on market volatility</text>
                  <text x="100" y="75" textAnchor="middle" fill="#A0A3AA" fontSize="8">e.g., "Exit at 2× ATR below"</text>
                  <text x="100" y="90" textAnchor="middle" fill="#16A34A" fontSize="8">✓ Adapts to conditions</text>
                </g>

                {/* Best Practice */}
                <g transform="translate(100, 180)">
                  <rect x="0" y="0" width="500" height="70" rx="10" fill="#2A2A2C" stroke="#16A34A" strokeWidth="2"/>
                  <text x="250" y="25" textAnchor="middle" fill="#16A34A" fontSize="11" fontWeight="600">💡 BEST PRACTICE</text>
                  <text x="250" y="45" textAnchor="middle" fill="#A0A3AA" fontSize="9">Use ATR-based stops for algo trading — they adapt to market conditions</text>
                  <text x="250" y="60" textAnchor="middle" fill="#717680" fontSize="8">Typical range: 1.5× to 3× ATR based on strategy timeframe</text>
                </g>
              </svg>
            </div>

            {/* Common Risk Mistakes */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50   rounded-2xl p-6 mb-10 border border-red-200 ">
              <h3 className="font-semibold text-red-800  mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><Icons.Warning className="w-5 h-5 text-white"/></span>
                Common Risk Management Mistakes
              </h3>
              <ul className="space-y-3">
                {[
                  { title: "Averaging Down", desc: "Adding to losing positions hoping for recovery. This can turn a small loss into a catastrophic one." },
                  { title: "No Stop Loss", desc: "Hoping a losing trade will recover. Small losses become account-killers." },
                  { title: "Over-Leveraging", desc: "Using too much margin. Amplifies both gains AND losses — usually ends badly." },
                  { title: "Correlation Blindness", desc: "Holding multiple positions that all move together. When they fall, they all fall together." },
                  { title: "Ignoring Black Swans", desc: "Not planning for extreme events. Markets can gap 20%+ overnight." }
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
                {["Risk management is MORE important than strategy selection",
                  "Never risk more than 1-2% of capital on a single trade",
                  "Drawdowns above 25% become exponentially harder to recover from",
                  "Use ATR-based stops that adapt to market volatility",
                  "Implement portfolio-level controls (daily limits, correlation limits)",
                  "Kelly Criterion provides mathematically optimal sizing — use half or quarter Kelly",
                  "Plan for black swan events — they happen more often than you think"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-brand ">
                    <Icons.CheckCircle className="w-5 h-5 text-brand mt-0.5 flex-shrink-0"/><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quiz */}
            <h2 className="text-2xl font-bold mb-6 tracking-[-0.015em]">Test Your Understanding</h2>
            <QuizQuestion
              question="If your account drops by 50%, how much gain do you need to recover?"
              options={["50%", "75%", "100%", "150%"]}
              correctAnswer="C"
              explanation="A 50% loss means going from ₹100 to ₹50. To get back to ₹100, you need to double your money — that's a 100% gain from ₹50."
            />
            <QuizQuestion
              question="What is the main advantage of using ATR-based stops over fixed percentage stops?"
              options={["They are simpler to calculate", "They automatically adapt to market volatility", "They always prevent losses", "They guarantee profits"]}
              correctAnswer="B"
              explanation="ATR (Average True Range) based stops widen in volatile markets and tighten in calm markets, preventing premature stop-outs while maintaining protection."
            />
            <QuizQuestion
              question="Why do most professionals use 'Half Kelly' instead of full Kelly Criterion?"
              options={["Half Kelly is more profitable", "Full Kelly produces too much volatility in returns", "Half Kelly is easier to calculate", "Full Kelly doesn't work in practice"]}
              correctAnswer="B"
              explanation="Full Kelly sizing is mathematically optimal for growth but produces extremely volatile returns. Half or quarter Kelly smooths the equity curve while still capturing most of the growth benefits."
            />
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/algo-trading-lesson-4')}
              className="flex items-center gap-2 text-gray-600 hover:text-rose-600 transition-colors group">
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/>Back: Backtesting
            </button>
            <button onClick={() => navigate('/learn/algo-trading-lesson-6')}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all">
              Next: Execution & Orders<FaArrowRight/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AlgoTradingLesson5;
