import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaTrophy, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// SVG Icons
const Icons = {
  Monitor: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21H16M12 17V21"/>
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
  Bell: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8"/><path d="M13.73 21A2 2 0 0 1 10.27 21"/>
    </svg>
  ),
  Brain: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5C9.5 3 6 3.5 4.5 6S4 12 6 14C4 15 3 17.5 4.5 19.5S9 21 12 19"/>
      <path d="M12 5C14.5 3 18 3.5 19.5 6S20 12 18 14C20 15 21 17.5 19.5 19.5S15 21 12 19"/>
      <path d="M12 5V19"/>
    </svg>
  ),
  Server: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
      <circle cx="6" cy="6" r="1" fill="currentColor"/><circle cx="6" cy="18" r="1" fill="currentColor"/>
    </svg>
  ),
  Shield: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"/>
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
          let bg = "bg-gray-50  hover:bg-green-50 ", border = "border-gray-200 ";
          if (showResult) { if (isRight) { bg="bg-emerald-50 "; border="border-emerald-400"; } 
            else if (isThis) { bg="bg-red-50 "; border="border-red-400"; }}
          return (
            <button key={i} onClick={()=>handleClick(i)} disabled={showResult}
              className={`w-full text-left p-4 rounded-xl border-2 ${border} ${bg} transition-all`}>
              <span className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${showResult && isRight ? 'bg-emerald-500 text-white' : showResult && isThis ? 'bg-red-500 text-white' : 'bg-green-100  text-green-600'}`}>{letter}</span>
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

const AlgoTradingLesson7 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-green-50/30   text-gray-900  min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb */}
          <button onClick={() => navigate('/learn/algorithmic-trading')}
            className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors mb-8 group">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/><span>Back to Algorithmic Trading</span>
          </button>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-full text-sm font-bold">Lesson 7 of 9 • Final</span>
              <span className="px-3 py-1.5 bg-gray-100  text-gray-600  rounded-full text-sm">20 min read</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-4">
              <span className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                <Icons.Monitor className="w-8 h-8 text-white"/>
              </span>
              Live Trading & Monitoring
            </h1>
            <p className="text-xl text-gray-600 ">
              The final step: deploying your algorithm and managing it in the real world.
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50   rounded-2xl p-6 mb-10 border border-emerald-200 ">
            <h2 className="font-bold text-emerald-800  mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center"><Icons.Target className="w-5 h-5 text-white"/></span>
              What You'll Learn
            </h2>
            <ul className="space-y-2">
              {["Set up a proper monitoring dashboard for your algorithm", "Implement alerts and circuit breakers", 
                "Understand the psychology of live trading", "Handle common production issues gracefully"].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-emerald-700 ">
                  <Icons.CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"/><span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none ">
            
            {/* Congrats Banner */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50   rounded-2xl p-6 mb-10 border border-yellow-300 ">
              <h3 className="font-bold text-yellow-900  mb-3 text-lg flex items-center gap-2">
                <FaTrophy className="text-yellow-500"/> You've Made It to the Final Lesson!
              </h3>
              <p className="text-yellow-800 ">
                After learning strategy design, backtesting, risk management, and execution, you're ready for the 
                most exciting (and nerve-wracking) part: <strong>going live</strong>.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4">The Paper-to-Live Transition</h2>
            <p className="text-gray-700  mb-6">
              Never jump straight from backtest to live trading. Follow this progression:
            </p>

            {/* Transition Path SVG */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-2xl p-6 mb-10 border border-emerald-800/50 shadow-xl">
              <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 200" fill="none">
                <text x="350" y="25" textAnchor="middle" fill="#e0e7ff" fontSize="14" fontWeight="700">PAPER TO LIVE TRANSITION PATH</text>
                
                {/* Step 1 - Backtest */}
                <g transform="translate(30, 60)">
                  <rect x="0" y="0" width="120" height="80" rx="10" fill="#3b82f6" opacity="0.9"/>
                  <text x="60" y="35" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">BACKTEST</text>
                  <text x="60" y="55" textAnchor="middle" fill="#bfdbfe" fontSize="8">Historical data</text>
                  <text x="60" y="68" textAnchor="middle" fill="#bfdbfe" fontSize="8">No real risk</text>
                </g>
                
                {/* Arrow 1 */}
                <path d="M160 100 L190 100" stroke="#6ee7b7" strokeWidth="3" markerEnd="url(#arrow)"/>
                
                {/* Step 2 - Paper */}
                <g transform="translate(200, 60)">
                  <rect x="0" y="0" width="120" height="80" rx="10" fill="#8b5cf6" opacity="0.9"/>
                  <text x="60" y="35" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">PAPER TRADE</text>
                  <text x="60" y="55" textAnchor="middle" fill="#c4b5fd" fontSize="8">Live data, fake money</text>
                  <text x="60" y="68" textAnchor="middle" fill="#c4b5fd" fontSize="8">2-4 weeks minimum</text>
                </g>
                
                {/* Arrow 2 */}
                <path d="M330 100 L360 100" stroke="#6ee7b7" strokeWidth="3"/>
                
                {/* Step 3 - Small Live */}
                <g transform="translate(370, 60)">
                  <rect x="0" y="0" width="120" height="80" rx="10" fill="#f59e0b" opacity="0.9"/>
                  <text x="60" y="35" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">SMALL LIVE</text>
                  <text x="60" y="55" textAnchor="middle" fill="#fcd34d" fontSize="8">10-20% of capital</text>
                  <text x="60" y="68" textAnchor="middle" fill="#fcd34d" fontSize="8">4-8 weeks</text>
                </g>
                
                {/* Arrow 3 */}
                <path d="M500 100 L530 100" stroke="#6ee7b7" strokeWidth="3"/>
                
                {/* Step 4 - Full Live */}
                <g transform="translate(540, 60)">
                  <rect x="0" y="0" width="120" height="80" rx="10" fill="#22c55e" opacity="0.9"/>
                  <text x="60" y="35" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">FULL LIVE</text>
                  <text x="60" y="55" textAnchor="middle" fill="#bbf7d0" fontSize="8">Full position sizes</text>
                  <text x="60" y="68" textAnchor="middle" fill="#bbf7d0" fontSize="8">Continuous monitoring</text>
                </g>

                {/* Time indicator */}
                <text x="350" y="175" textAnchor="middle" fill="#6b7280" fontSize="10">Minimum 6-12 weeks from backtest to full live</text>
                
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#6ee7b7"/>
                  </marker>
                </defs>
              </svg>
            </div>

            {/* Monitoring Dashboard */}
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-100  rounded-xl flex items-center justify-center">
                <Icons.Monitor className="w-5 h-5 text-blue-600 "/>
              </span>
              Building Your Monitoring Dashboard
            </h2>

            <p className="text-gray-700  mb-6">
              A good dashboard shows you everything you need at a glance — no more, no less.
            </p>

            {/* Dashboard SVG */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-6 mb-10 border border-blue-800/50 shadow-xl">
              <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 400" fill="none">
                <text x="350" y="25" textAnchor="middle" fill="#e0e7ff" fontSize="14" fontWeight="700">ALGO TRADING DASHBOARD LAYOUT</text>
                
                {/* Main Dashboard Frame */}
                <rect x="30" y="40" width="640" height="340" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
                
                {/* Top Row - Key Metrics */}
                <g transform="translate(50, 60)">
                  <rect x="0" y="0" width="140" height="70" rx="8" fill="#0f172a" stroke="#22c55e" strokeWidth="1"/>
                  <text x="70" y="25" textAnchor="middle" fill="#94a3b8" fontSize="9">Today's P&L</text>
                  <text x="70" y="50" textAnchor="middle" fill="#22c55e" fontSize="16" fontWeight="700">+₹12,450</text>
                </g>
                <g transform="translate(210, 60)">
                  <rect x="0" y="0" width="140" height="70" rx="8" fill="#0f172a" stroke="#3b82f6" strokeWidth="1"/>
                  <text x="70" y="25" textAnchor="middle" fill="#94a3b8" fontSize="9">Win Rate</text>
                  <text x="70" y="50" textAnchor="middle" fill="#3b82f6" fontSize="16" fontWeight="700">58.3%</text>
                </g>
                <g transform="translate(370, 60)">
                  <rect x="0" y="0" width="140" height="70" rx="8" fill="#0f172a" stroke="#8b5cf6" strokeWidth="1"/>
                  <text x="70" y="25" textAnchor="middle" fill="#94a3b8" fontSize="9">Trades Today</text>
                  <text x="70" y="50" textAnchor="middle" fill="#8b5cf6" fontSize="16" fontWeight="700">24</text>
                </g>
                <g transform="translate(530, 60)">
                  <rect x="0" y="0" width="120" height="70" rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="1"/>
                  <text x="60" y="25" textAnchor="middle" fill="#94a3b8" fontSize="9">Drawdown</text>
                  <text x="60" y="50" textAnchor="middle" fill="#f59e0b" fontSize="16" fontWeight="700">-2.1%</text>
                </g>

                {/* Equity Curve Panel */}
                <g transform="translate(50, 150)">
                  <rect x="0" y="0" width="300" height="130" rx="8" fill="#0f172a"/>
                  <text x="150" y="20" textAnchor="middle" fill="#94a3b8" fontSize="10">Equity Curve (MTD)</text>
                  {/* Simplified line chart */}
                  <polyline points="20,100 50,90 80,85 110,70 140,80 170,60 200,55 230,65 260,45 280,50" 
                    stroke="#22c55e" strokeWidth="2" fill="none"/>
                  <circle cx="280" cy="50" r="4" fill="#22c55e"/>
                </g>

                {/* Active Positions */}
                <g transform="translate(370, 150)">
                  <rect x="0" y="0" width="280" height="130" rx="8" fill="#0f172a"/>
                  <text x="140" y="20" textAnchor="middle" fill="#94a3b8" fontSize="10">Active Positions</text>
                  
                  <text x="20" y="45" fill="#94a3b8" fontSize="8">Symbol</text>
                  <text x="90" y="45" fill="#94a3b8" fontSize="8">Qty</text>
                  <text x="140" y="45" fill="#94a3b8" fontSize="8">Entry</text>
                  <text x="200" y="45" fill="#94a3b8" fontSize="8">P&L</text>
                  
                  <text x="20" y="65" fill="white" fontSize="9">RELIANCE</text>
                  <text x="90" y="65" fill="white" fontSize="9">100</text>
                  <text x="140" y="65" fill="white" fontSize="9">₹2,450</text>
                  <text x="200" y="65" fill="#22c55e" fontSize="9">+₹3,200</text>
                  
                  <text x="20" y="85" fill="white" fontSize="9">INFY</text>
                  <text x="90" y="85" fill="white" fontSize="9">200</text>
                  <text x="140" y="85" fill="white" fontSize="9">₹1,580</text>
                  <text x="200" y="85" fill="#ef4444" fontSize="9">-₹800</text>
                  
                  <text x="20" y="105" fill="white" fontSize="9">HDFC</text>
                  <text x="90" y="105" fill="white" fontSize="9">50</text>
                  <text x="140" y="105" fill="white" fontSize="9">₹1,720</text>
                  <text x="200" y="105" fill="#22c55e" fontSize="9">+₹1,150</text>
                </g>

                {/* System Status */}
                <g transform="translate(50, 300)">
                  <rect x="0" y="0" width="600" height="60" rx="8" fill="#0f172a"/>
                  <text x="300" y="20" textAnchor="middle" fill="#94a3b8" fontSize="10">System Status</text>
                  
                  <circle cx="60" cy="42" r="6" fill="#22c55e"/><text x="80" y="46" fill="#94a3b8" fontSize="9">Broker Connected</text>
                  <circle cx="200" cy="42" r="6" fill="#22c55e"/><text x="220" y="46" fill="#94a3b8" fontSize="9">Data Feed OK</text>
                  <circle cx="340" cy="42" r="6" fill="#22c55e"/><text x="360" y="46" fill="#94a3b8" fontSize="9">Strategy Running</text>
                  <circle cx="480" cy="42" r="6" fill="#f59e0b"/><text x="500" y="46" fill="#94a3b8" fontSize="9">1 Alert</text>
                </g>
              </svg>
            </div>

            {/* Essential Metrics */}
            <h3 className="text-xl font-bold mb-4">Essential Metrics to Monitor</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {[
                { metric: "P&L (Today/Week/Month)", why: "Know if you're making or losing money", category: "Performance" },
                { metric: "Win Rate", why: "Are your signals accurate?", category: "Performance" },
                { metric: "Average Win vs Loss", why: "Your risk-reward in practice", category: "Performance" },
                { metric: "Current Drawdown", why: "How far from peak?", category: "Risk" },
                { metric: "Max Drawdown", why: "Worst case so far", category: "Risk" },
                { metric: "Exposure / Leverage", why: "How much capital at risk?", category: "Risk" },
                { metric: "Latency", why: "Order execution speed", category: "System" },
                { metric: "Connection Status", why: "Are all systems online?", category: "System" }
              ].map((item, i) => {
                const catColors = { Performance: "bg-emerald-100  text-emerald-700 ",
                  Risk: "bg-red-100  text-red-700 ",
                  System: "bg-blue-100  text-blue-700 " };
                return (
                  <div key={i} className="bg-white  rounded-xl p-4 border border-gray-200 ">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 ">{item.metric}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${catColors[item.category]}`}>{item.category}</span>
                    </div>
                    <p className="text-sm text-gray-600 ">{item.why}</p>
                  </div>
                );
              })}
            </div>

            {/* Alerts and Circuit Breakers */}
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-red-100  rounded-xl flex items-center justify-center">
                <Icons.Bell className="w-5 h-5 text-red-600 "/>
              </span>
              Alerts & Circuit Breakers
            </h2>

            <div className="bg-gradient-to-r from-red-50 to-rose-50   rounded-2xl p-6 mb-8 border border-red-200 ">
              <h3 className="font-bold text-red-800  mb-4">Automatic Shutoffs You MUST Have</h3>
              <div className="space-y-3">
                {[
                  { trigger: "Daily Loss Limit", action: "Stop trading if losses exceed X%", example: "e.g., -2% daily max" },
                  { trigger: "Max Drawdown", action: "Halt if account drops below threshold", example: "e.g., -10% from peak" },
                  { trigger: "Position Limits", action: "Reject orders exceeding max size", example: "e.g., no more than 5% in one stock" },
                  { trigger: "Connection Loss", action: "Flatten all positions", example: "Lost broker connection > 30 seconds" },
                  { trigger: "Strategy Error", action: "Stop and alert", example: "Any unhandled exception" }
                ].map((item, i) => (
                  <div key={i} className="bg-white  rounded-lg p-3 flex flex-col md:flex-row md:items-center gap-2">
                    <span className="font-semibold text-red-700  md:w-40">{item.trigger}</span>
                    <span className="text-gray-700  flex-1">{item.action}</span>
                    <span className="text-xs text-gray-500  md:w-48 italic">{item.example}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Psychology */}
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-violet-100  rounded-xl flex items-center justify-center">
                <Icons.Brain className="w-5 h-5 text-violet-600 "/>
              </span>
              The Psychology of Live Trading
            </h2>

            <p className="text-gray-700  mb-6">
              Even with automation, your psychology matters. Here are common emotional traps:
            </p>

            {/* Psychology Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {[
                { trap: "Panic Override", desc: "Manually stopping your algo during a losing streak", solution: "Trust your backtest; set strict rules for when to intervene" },
                { trap: "Greed Override", desc: "Increasing position sizes after a winning streak", solution: "Stick to your position sizing rules, no exceptions" },
                { trap: "Tinkering", desc: "Constantly changing parameters based on recent results", solution: "Only adjust monthly; use statistical significance" },
                { trap: "Revenge Trading", desc: "Taking bigger risks to 'make back' losses", solution: "Your circuit breakers should prevent this automatically" }
              ].map((item, i) => (
                <div key={i} className="bg-white  rounded-xl p-5 border border-gray-200  shadow-sm">
                  <h4 className="font-bold text-gray-900  mb-2 flex items-center gap-2">
                    <Icons.Warning className="w-5 h-5 text-amber-500"/>{item.trap}
                  </h4>
                  <p className="text-sm text-gray-600  mb-3">{item.desc}</p>
                  <div className="bg-emerald-50  rounded-lg p-2">
                    <p className="text-sm text-emerald-700 "><strong>Fix:</strong> {item.solution}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Production Issues */}
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100  rounded-xl flex items-center justify-center">
                <Icons.Server className="w-5 h-5 text-amber-600 "/>
              </span>
              Common Production Issues
            </h2>

            <div className="bg-white  rounded-2xl p-6 mb-10 border border-gray-200 ">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 ">
                    <th className="text-left py-3 text-gray-600 ">Issue</th>
                    <th className="text-left py-3 text-gray-600 ">Cause</th>
                    <th className="text-left py-3 text-gray-600 ">Solution</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 ">
                  {[
                    { issue: "Missed Trades", cause: "Connection issues", solution: "Redundant data feeds, auto-reconnect" },
                    { issue: "Duplicate Orders", cause: "Network retry logic", solution: "Unique order IDs, state tracking" },
                    { issue: "Wrong Price Fills", cause: "Stale data", solution: "Timestamp validation, latency checks" },
                    { issue: "Position Mismatch", cause: "Partial fills not tracked", solution: "Regular reconciliation with broker" },
                    { issue: "Memory Leak", cause: "Long-running process", solution: "Daily restarts, monitoring" }
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 ">
                      <td className="py-3 font-medium">{row.issue}</td>
                      <td className="py-3">{row.cause}</td>
                      <td className="py-3">{row.solution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Daily Routine */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50   rounded-2xl p-6 mb-10 border border-blue-200 ">
              <h3 className="font-bold text-blue-800  mb-4 flex items-center gap-3">
                <Icons.Shield className="w-5 h-5"/> Your Daily Trading Routine
              </h3>
              <div className="space-y-2">
                {[
                  { time: "8:30 AM", task: "Check system status, data feeds, broker connection" },
                  { time: "9:00 AM", task: "Review pre-market data, adjust any position limits" },
                  { time: "9:15 AM", task: "Market opens — monitor first 15 minutes closely" },
                  { time: "10:00 AM", task: "First P&L check, verify positions match broker" },
                  { time: "1:00 PM", task: "Midday review — any circuit breakers triggered?" },
                  { time: "3:15 PM", task: "Pre-close review, prepare for closing auctions" },
                  { time: "3:30 PM", task: "Market closes — EOD reconciliation" },
                  { time: "4:00 PM", task: "Generate daily report, update logs" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white  rounded-lg p-3">
                    <span className="font-mono text-sm font-bold text-blue-600  w-20">{item.time}</span>
                    <span className="text-gray-700 ">{item.task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50   rounded-2xl p-6 mb-10 border border-emerald-200 ">
              <h3 className="font-bold text-emerald-800  mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center"><Icons.Key className="w-5 h-5 text-white"/></span>
                Key Takeaways
              </h3>
              <ul className="space-y-2">
                {["Always paper trade before going live — no exceptions",
                  "Start with small position sizes and gradually scale up",
                  "Build a monitoring dashboard that shows essential metrics at a glance",
                  "Implement circuit breakers that automatically stop trading when limits are hit",
                  "Your psychology still matters — don't override your algorithm emotionally",
                  "Have a daily routine for checking and reconciling",
                  "Plan for failures — redundancy and graceful degradation are essential"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-emerald-700 ">
                    <Icons.CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"/><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quiz */}
            <h2 className="text-2xl font-bold mb-6">Test Your Understanding</h2>
            <QuizQuestion
              question="What's the recommended minimum time from backtest to full live trading?"
              options={["1-2 weeks", "3-4 weeks", "6-12 weeks", "6 months"]}
              correctAnswer="C"
              explanation="You should spend 2-4 weeks paper trading, then 4-8 weeks with small live capital before scaling to full position sizes. This typically takes 6-12 weeks minimum."
            />
            <QuizQuestion
              question="What should happen if your algorithm hits the daily loss limit?"
              options={["Send an alert but keep trading", "Reduce position sizes by 50%", "Stop all trading automatically", "Ask the user what to do"]}
              correctAnswer="C"
              explanation="Circuit breakers should automatically stop trading when daily loss limits are hit. This protects you from catastrophic losses and removes the emotional decision-making during drawdowns."
            />
            <QuizQuestion
              question="Which is an example of a 'Panic Override'?"
              options={["Setting a stop loss on a position", "Manually stopping your algo during a losing streak", "Increasing position sizes after wins", "Running backtests on weekends"]}
              correctAnswer="B"
              explanation="Panic Override is when you manually intervene to stop your algorithm during a losing streak, even though the losses are within your backtest parameters. This often leads to missing the recovery."
            />

            {/* Completion Banner */}
            <div className="bg-gradient-to-r from-amber-100 to-yellow-100   rounded-2xl p-8 mb-10 border-2 border-amber-400  text-center">
              <FaTrophy className="w-16 h-16 text-amber-500 mx-auto mb-4"/>
              <h2 className="text-2xl font-bold text-amber-900  mb-2">Great Progress!</h2>
              <p className="text-amber-800  mb-4">
                You've completed the core trading foundations! 
                Next up: learn about <strong>data sources</strong> and <strong>broker APIs</strong> to actually build your systems.
              </p>
              <p className="text-sm text-amber-700 ">
                The next 2 lessons cover the practical infrastructure you need.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/algo-trading-lesson-6')}
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors group">
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/>Back: Execution & Order Types
            </button>
            <button onClick={() => navigate('/learn/algo-trading-lesson-8')}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all">
              Next: Data Management<FaArrowRight/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AlgoTradingLesson7;
