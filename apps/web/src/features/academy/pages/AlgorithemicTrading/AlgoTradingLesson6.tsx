import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// SVG Icons
const Icons = {
  Zap: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" strokeLinecap="round" strokeLinejoin="round"/>
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
  Clock: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9"/><path d="M12 6V12L16 14"/>
    </svg>
  ),
  Layers: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7L12 12L22 7L12 2Z"/><path d="M2 17L12 22L22 17"/><path d="M2 12L12 17L22 12"/>
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
          let bg = "bg-gray-50  hover:bg-amber-50 ", border = "border-gray-200 ";
          if (showResult) { if (isRight) { bg="bg-brand-soft "; border="border-brand"; } 
            else if (isThis) { bg="bg-red-50 "; border="border-red-400"; }}
          return (
            <button key={i} onClick={()=>handleClick(i)} disabled={showResult}
              className={`w-full text-left p-4 rounded-xl border-2 ${border} ${bg} transition-all`}>
              <span className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${showResult && isRight ? 'bg-brand-fill text-white' : showResult && isThis ? 'bg-red-500 text-white' : 'bg-amber-100  text-amber-600'}`}>{letter}</span>
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

const AlgoTradingLesson6 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-amber-50/30   text-gray-900  min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb */}
          <button onClick={() => navigate('/learn/algorithmic-trading')}
            className="flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors mb-8 group">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/><span>Back to Algorithmic Trading</span>
          </button>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 text-white rounded-full text-sm font-bold bg-brand-fill">Lesson 6 of 9</span>
              <span className="px-3 py-1.5 bg-gray-100  text-gray-600  rounded-full text-sm">15 min read</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 flex items-center gap-4 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg bg-brand-fill">
                <Icons.Zap className="w-8 h-8 text-white"/>
              </span>
              Execution & Order Types
            </h1>
            <p className="text-xl text-gray-600 ">
              Master the art of turning signals into profitable trades without losing money to slippage.
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50   rounded-2xl p-6 mb-10 border border-amber-200 ">
            <h2 className="font-semibold text-amber-800  mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center"><Icons.Target className="w-5 h-5 text-white"/></span>
              What You'll Learn
            </h2>
            <ul className="space-y-2">
              {["Understand different order types and when to use each", "Learn about slippage and how to minimize it", 
                "Master TWAP and VWAP execution algorithms", "Understand market microstructure basics"].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-amber-700 ">
                  <Icons.CheckCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0"/><span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none ">
            
            {/* Intro */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50   rounded-2xl p-6 mb-10 border border-red-200 ">
              <h3 className="font-semibold text-red-900  mb-3 text-lg flex items-center gap-2">
                <Icons.Warning className="w-5 h-5"/> The Execution Gap
              </h3>
              <p className="text-red-800 ">
                <strong>A strategy that makes 10% per year can easily lose 2-3% to poor execution.</strong> 
                The difference between your backtest price and actual fill price is where profits disappear. 
                This lesson teaches you how to keep that gap as small as possible.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4 tracking-[-0.025em]">Order Types: Your Execution Toolkit</h2>
            <p className="text-gray-700  mb-6">
              Different order types serve different purposes. Understanding when to use each is crucial for efficient execution.
            </p>

            {/* Order Types SVG */}
            <div className="rounded-2xl p-6 mb-10 border border-amber-800/50 shadow-xl bg-brand-fill">
              <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 380" fill="none">
                <text x="350" y="25" textAnchor="middle" fill="#ECE4F6" fontSize="14" fontWeight="700">ORDER TYPES COMPARISON</text>

                {/* Market Order */}
                <g transform="translate(30, 50)">
                  <rect x="0" y="0" width="300" height="140" rx="12" fill="#2A2A2C" stroke="#16A34A" strokeWidth="2"/>
                  <rect x="0" y="0" width="300" height="35" rx="12" fill="#16A34A"/>
                  <rect x="0" y="23" width="300" height="12" fill="#16A34A"/>
                  <text x="150" y="24" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">MARKET ORDER</text>
                  <text x="150" y="60" textAnchor="middle" fill="#16A34A" fontSize="10">"Execute NOW at best available price"</text>
                  
                  <text x="20" y="85" fill="#A0A3AA" fontSize="9">✓ Guaranteed execution</text>
                  <text x="20" y="100" fill="#A0A3AA" fontSize="9">✓ Instant fill</text>
                  <text x="20" y="115" fill="#F09B9B" fontSize="9">✗ No price control</text>
                  <text x="20" y="130" fill="#F09B9B" fontSize="9">✗ Can slip in volatile markets</text>
                </g>

                {/* Limit Order */}
                <g transform="translate(370, 50)">
                  <rect x="0" y="0" width="300" height="140" rx="12" fill="#2A2A2C" stroke="#5A77AA" strokeWidth="2"/>
                  <rect x="0" y="0" width="300" height="35" rx="12" fill="#5A77AA"/>
                  <rect x="0" y="23" width="300" height="12" fill="#5A77AA"/>
                  <text x="150" y="24" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">LIMIT ORDER</text>
                  <text x="150" y="60" textAnchor="middle" fill="#9FB3D3" fontSize="10">"Execute ONLY at this price or better"</text>
                  
                  <text x="20" y="85" fill="#A0A3AA" fontSize="9">✓ Price control</text>
                  <text x="20" y="100" fill="#A0A3AA" fontSize="9">✓ No slippage if filled</text>
                  <text x="20" y="115" fill="#F09B9B" fontSize="9">✗ May not execute</text>
                  <text x="20" y="130" fill="#F09B9B" fontSize="9">✗ Can miss opportunities</text>
                </g>

                {/* Stop Order */}
                <g transform="translate(30, 210)">
                  <rect x="0" y="0" width="300" height="140" rx="12" fill="#2A2A2C" stroke="#B8923F" strokeWidth="2"/>
                  <rect x="0" y="0" width="300" height="35" rx="12" fill="#B8923F"/>
                  <rect x="0" y="23" width="300" height="12" fill="#B8923F"/>
                  <text x="150" y="24" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">STOP ORDER</text>
                  <text x="150" y="60" textAnchor="middle" fill="#E2C273" fontSize="10">"Become market order when price hits X"</text>
                  
                  <text x="20" y="85" fill="#A0A3AA" fontSize="9">✓ Automatic protection</text>
                  <text x="20" y="100" fill="#A0A3AA" fontSize="9">✓ Works while you sleep</text>
                  <text x="20" y="115" fill="#F09B9B" fontSize="9">✗ Can be triggered by spikes</text>
                  <text x="20" y="130" fill="#F09B9B" fontSize="9">✗ Slippage after trigger</text>
                </g>

                {/* Stop-Limit Order */}
                <g transform="translate(370, 210)">
                  <rect x="0" y="0" width="300" height="140" rx="12" fill="#2A2A2C" stroke="#8F6FC4" strokeWidth="2"/>
                  <rect x="0" y="0" width="300" height="35" rx="12" fill="#8F6FC4"/>
                  <rect x="0" y="23" width="300" height="12" fill="#8F6FC4"/>
                  <text x="150" y="24" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">STOP-LIMIT ORDER</text>
                  <text x="150" y="60" textAnchor="middle" fill="#C0A9E2" fontSize="10">"Limit order when price hits trigger"</text>
                  
                  <text x="20" y="85" fill="#A0A3AA" fontSize="9">✓ Price control + automation</text>
                  <text x="20" y="100" fill="#A0A3AA" fontSize="9">✓ Best of both worlds</text>
                  <text x="20" y="115" fill="#F09B9B" fontSize="9">✗ Complex to set up</text>
                  <text x="20" y="130" fill="#F09B9B" fontSize="9">✗ May not fill in fast markets</text>
                </g>
              </svg>
            </div>

            {/* When to Use Each */}
            <h2 className="text-2xl font-bold mb-4 tracking-[-0.025em]">When to Use Each Order Type</h2>
            <div className="grid gap-4 mb-10">
              {[
                { type: "Market Order", when: "Urgent exits, stop losses, highly liquid stocks", color: "emerald" },
                { type: "Limit Order", when: "Entries at specific prices, large orders, illiquid stocks", color: "blue" },
                { type: "Stop Order", when: "Automated stop losses, breakout entries", color: "amber" },
                { type: "Stop-Limit", when: "Important exits where you need price control", color: "violet" }
              ].map((item) => {
                const colors = { emerald: "border-brand bg-brand-soft ", blue: "border-blue-500 bg-blue-50 ",
                  amber: "border-amber-500 bg-amber-50 ", violet: "border-violet-500 bg-violet-50 " };
                return (
                  <div key={item.type} className={`rounded-xl p-4 border-l-4 ${colors[item.color]}`}>
                    <h4 className="font-bold text-gray-900 ">{item.type}</h4>
                    <p className="text-sm text-gray-600 ">Best for: {item.when}</p>
                  </div>
                );
              })}
            </div>

            {/* Slippage */}
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 tracking-[-0.015em]">
              <span className="w-10 h-10 bg-red-100  rounded-xl flex items-center justify-center">
                <Icons.Warning className="w-5 h-5 text-red-600 "/>
              </span>
              Understanding Slippage
            </h2>

            <p className="text-gray-700  mb-6">
              <strong>Slippage</strong> is the difference between the price you expected and the price you actually got. 
              It's one of the biggest hidden costs in trading.
            </p>

            {/* Slippage Causes */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50   rounded-2xl p-6 mb-8 border border-red-200 ">
              <h3 className="font-semibold text-red-800  mb-4">Causes of Slippage</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { cause: "Low Liquidity", desc: "Not enough buyers/sellers at your price" },
                  { cause: "High Volatility", desc: "Prices moving faster than your order" },
                  { cause: "Large Order Size", desc: "Your order moves the market" },
                  { cause: "Market Hours", desc: "Opening/closing have wider spreads" }
                ].map((item, i) => (
                  <div key={i} className="bg-white  rounded-lg p-3">
                    <p className="font-semibold text-red-700 ">{item.cause}</p>
                    <p className="text-sm text-red-600 ">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* TWAP and VWAP */}
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 tracking-[-0.015em]">
              <span className="w-10 h-10 bg-violet-100  rounded-xl flex items-center justify-center">
                <Icons.Clock className="w-5 h-5 text-violet-600 "/>
              </span>
              Execution Algorithms: TWAP & VWAP
            </h2>

            <p className="text-gray-700  mb-6">
              Large orders need to be broken up to avoid moving the market. TWAP and VWAP are the most common algorithms for this.
            </p>

            {/* TWAP vs VWAP SVG */}
            <div className="rounded-2xl p-6 mb-10 border border-violet-800/50 shadow-xl bg-brand-fill">
              <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 320" fill="none">
                <text x="350" y="25" textAnchor="middle" fill="#ECE4F6" fontSize="14" fontWeight="700">TWAP vs VWAP EXECUTION</text>

                {/* TWAP */}
                <g transform="translate(30, 50)">
                  <rect x="0" y="0" width="310" height="240" rx="12" fill="#2A2A2C" stroke="#5A77AA" strokeWidth="2"/>
                  <text x="155" y="30" textAnchor="middle" fill="#9FB3D3" fontSize="12" fontWeight="700">TWAP</text>
                  <text x="155" y="48" textAnchor="middle" fill="#717680" fontSize="9">Time-Weighted Average Price</text>
                  
                  {/* Visual - equal slices */}
                  <g transform="translate(30, 70)">
                    <rect x="0" y="0" width="50" height="60" fill="#5A77AA" opacity="0.7" rx="4"/>
                    <rect x="60" y="0" width="50" height="60" fill="#5A77AA" opacity="0.7" rx="4"/>
                    <rect x="120" y="0" width="50" height="60" fill="#5A77AA" opacity="0.7" rx="4"/>
                    <rect x="180" y="0" width="50" height="60" fill="#5A77AA" opacity="0.7" rx="4"/>
                    <text x="125" y="80" textAnchor="middle" fill="#717680" fontSize="8">Equal orders over time</text>
                  </g>
                  
                  <text x="155" y="175" textAnchor="middle" fill="#A0A3AA" fontSize="9">📋 How it works:</text>
                  <text x="155" y="195" textAnchor="middle" fill="#A0A3AA" fontSize="8">Split order into equal parts</text>
                  <text x="155" y="210" textAnchor="middle" fill="#A0A3AA" fontSize="8">Execute at regular intervals</text>
                  <text x="155" y="230" textAnchor="middle" fill="#16A34A" fontSize="8">✓ Best for: Low-volume stocks</text>
                </g>

                {/* VWAP */}
                <g transform="translate(360, 50)">
                  <rect x="0" y="0" width="310" height="240" rx="12" fill="#2A2A2C" stroke="#8F6FC4" strokeWidth="2"/>
                  <text x="155" y="30" textAnchor="middle" fill="#C0A9E2" fontSize="12" fontWeight="700">VWAP</text>
                  <text x="155" y="48" textAnchor="middle" fill="#717680" fontSize="9">Volume-Weighted Average Price</text>
                  
                  {/* Visual - varying slices */}
                  <g transform="translate(30, 70)">
                    <rect x="0" y="30" width="50" height="30" fill="#8F6FC4" opacity="0.7" rx="4"/>
                    <rect x="60" y="10" width="50" height="50" fill="#8F6FC4" opacity="0.7" rx="4"/>
                    <rect x="120" y="0" width="50" height="60" fill="#8F6FC4" opacity="0.7" rx="4"/>
                    <rect x="180" y="25" width="50" height="35" fill="#8F6FC4" opacity="0.7" rx="4"/>
                    <text x="125" y="80" textAnchor="middle" fill="#717680" fontSize="8">More when volume is high</text>
                  </g>
                  
                  <text x="155" y="175" textAnchor="middle" fill="#A0A3AA" fontSize="9">📋 How it works:</text>
                  <text x="155" y="195" textAnchor="middle" fill="#A0A3AA" fontSize="8">Match execution to market volume</text>
                  <text x="155" y="210" textAnchor="middle" fill="#A0A3AA" fontSize="8">More shares when volume is higher</text>
                  <text x="155" y="230" textAnchor="middle" fill="#16A34A" fontSize="8">✓ Best for: High-volume stocks</text>
                </g>
              </svg>
            </div>

            {/* Market Microstructure */}
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 tracking-[-0.015em]">
              <span className="w-10 h-10 bg-blue-100  rounded-xl flex items-center justify-center">
                <Icons.Layers className="w-5 h-5 text-blue-600 "/>
              </span>
              Market Microstructure Basics
            </h2>

            <p className="text-gray-700  mb-6">
              Understanding how orders flow through the market helps you execute better.
            </p>

            {/* Order Book Visual */}
            <div className="bg-white  rounded-2xl p-6 mb-8 border border-gray-200 ">
              <h3 className="font-semibold text-gray-900  mb-4">The Order Book</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Bid Side */}
                <div className="bg-brand-soft  rounded-xl p-4 border border-brand-line ">
                  <h4 className="font-bold text-brand  mb-3">BID (Buyers)</h4>
                  <div className="space-y-2 font-mono text-sm">
                    {[
                      { price: "₹100.50", qty: "500" },
                      { price: "₹100.45", qty: "1,200" },
                      { price: "₹100.40", qty: "800" },
                      { price: "₹100.35", qty: "2,000" }
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between text-brand ">
                        <span>{row.price}</span><span>{row.qty}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-brand  mt-3">Willing to buy at these prices</p>
                </div>

                {/* Ask Side */}
                <div className="bg-red-50  rounded-xl p-4 border border-red-200 ">
                  <h4 className="font-bold text-red-700  mb-3">ASK (Sellers)</h4>
                  <div className="space-y-2 font-mono text-sm">
                    {[
                      { price: "₹100.55", qty: "300" },
                      { price: "₹100.60", qty: "900" },
                      { price: "₹100.65", qty: "1,500" },
                      { price: "₹100.70", qty: "600" }
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between text-red-700 ">
                        <span>{row.price}</span><span>{row.qty}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-red-600  mt-3">Willing to sell at these prices</p>
                </div>
              </div>
              
              <div className="mt-4 bg-amber-50  rounded-lg p-3">
                <p className="text-sm text-amber-800 ">
                  <strong>Spread = ₹100.55 - ₹100.50 = ₹0.05</strong><br/>
                  <span className="text-xs">This is the "cost" of immediate execution. Tighter spreads = lower costs.</span>
                </p>
              </div>
            </div>

            {/* Best Practices */}
            <div className="rounded-2xl p-6 mb-10 border border-brand-line bg-brand-soft">
              <h3 className="font-semibold text-brand  mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-brand-fill rounded-lg flex items-center justify-center"><Icons.Lightbulb className="w-5 h-5 text-white"/></span>
                Execution Best Practices
              </h3>
              <ul className="space-y-3">
                {[
                  { tip: "Trade liquid stocks", desc: "Higher volume = tighter spreads = lower slippage" },
                  { tip: "Avoid market opens/closes", desc: "Spreads are wider, volatility is higher" },
                  { tip: "Use limit orders for entries", desc: "Control your entry price, don't chase" },
                  { tip: "Use market orders for exits", desc: "When you need to exit, get out reliably" },
                  { tip: "Break up large orders", desc: "Use TWAP/VWAP to avoid moving the market" },
                  { tip: "Account for slippage in backtests", desc: "Add 0.05-0.1% per trade to be realistic" }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Icons.CheckCircle className="w-5 h-5 text-brand mt-0.5 flex-shrink-0"/>
                    <div>
                      <span className="font-semibold text-brand ">{item.tip}:</span>
                      <span className="text-brand  ml-1">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Takeaways */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50   rounded-2xl p-6 mb-10 border border-amber-200 ">
              <h3 className="font-semibold text-amber-800  mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center"><Icons.Key className="w-5 h-5 text-white"/></span>
                Key Takeaways
              </h3>
              <ul className="space-y-2">
                {["Different order types serve different purposes — match the tool to the job",
                  "Slippage can destroy profitable strategies — always account for it",
                  "TWAP is best for low-volume stocks; VWAP for high-volume stocks",
                  "The bid-ask spread is a hidden cost on every trade",
                  "Trade during high-liquidity periods for better execution",
                  "Limit orders control price; Market orders guarantee execution"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-amber-700 ">
                    <Icons.CheckCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0"/><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quiz */}
            <h2 className="text-2xl font-bold mb-6 tracking-[-0.015em]">Test Your Understanding</h2>
            <QuizQuestion
              question="Which order type guarantees execution but NOT the price?"
              options={["Limit Order", "Market Order", "Stop-Limit Order", "None of these"]}
              correctAnswer="B"
              explanation="Market orders guarantee execution by taking the best available price. You'll definitely get filled, but the price might differ from what you expected, especially in volatile or illiquid markets."
            />
            <QuizQuestion
              question="When would you use VWAP instead of TWAP?"
              options={["For illiquid, low-volume stocks", "For high-volume stocks where you want to match market activity", "When you need immediate execution", "When trading options"]}
              correctAnswer="B"
              explanation="VWAP (Volume-Weighted Average Price) executes more shares when volume is higher, making it ideal for liquid stocks where you want your execution to match the market's natural activity pattern."
            />
            <QuizQuestion
              question="What is the 'spread' in market microstructure?"
              options={["The difference between today's high and low", "The difference between bid and ask prices", "The commission charged by the broker", "The slippage on a large order"]}
              correctAnswer="B"
              explanation="The spread is the difference between the highest price a buyer will pay (bid) and the lowest price a seller will accept (ask). It represents the cost of immediate execution."
            />
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/algo-trading-lesson-5')}
              className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors group">
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/>Back: Risk Management
            </button>
            <button onClick={() => navigate('/learn/algo-trading-lesson-7')}
              className="flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all bg-brand-fill">
              Next: Live Trading<FaArrowRight/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AlgoTradingLesson6;
