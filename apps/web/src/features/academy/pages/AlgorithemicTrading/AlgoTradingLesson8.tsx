import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// SVG Icons
const Icons = {
  Database: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12C21 13.66 16.97 15 12 15S3 13.66 3 12"/><path d="M3 5V19C3 20.66 7.03 22 12 22S21 20.66 21 19V5"/>
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
  Download: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Zap: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Filter: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/></svg>
  ),
  Server: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
      <circle cx="6" cy="6" r="1" fill="currentColor"/><circle cx="6" cy="18" r="1" fill="currentColor"/>
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
          let bg = "bg-gray-50  hover:bg-cyan-50 ", border = "border-gray-200 ";
          if (showResult) { if (isRight) { bg="bg-emerald-50 "; border="border-emerald-400"; } 
            else if (isThis) { bg="bg-red-50 "; border="border-red-400"; }}
          return (
            <button key={i} onClick={()=>handleClick(i)} disabled={showResult}
              className={`w-full text-left p-4 rounded-xl border-2 ${border} ${bg} transition-all`}>
              <span className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${showResult && isRight ? 'bg-emerald-500 text-white' : showResult && isThis ? 'bg-red-500 text-white' : 'bg-cyan-100  text-cyan-600'}`}>{letter}</span>
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

const AlgoTradingLesson8 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-cyan-50/30   text-gray-900  min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb */}
          <button onClick={() => navigate('/learn/algorithmic-trading')}
            className="flex items-center gap-2 text-gray-500 hover:text-cyan-600 transition-colors mb-8 group">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/><span>Back to Algorithmic Trading</span>
          </button>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full text-sm font-bold">Lesson 8 of 9</span>
              <span className="px-3 py-1.5 bg-gray-100  text-gray-600  rounded-full text-sm">18 min read</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-4">
              <span className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
                <Icons.Database className="w-8 h-8 text-white"/>
              </span>
              Data Management & Sources
            </h1>
            <p className="text-xl text-gray-600 ">
              Data is the fuel for your algorithms. Learn where to get it, how to clean it, and how to store it.
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50   rounded-2xl p-6 mb-10 border border-cyan-200 ">
            <h2 className="font-bold text-cyan-800  mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center"><Icons.Target className="w-5 h-5 text-white"/></span>
              What You'll Learn
            </h2>
            <ul className="space-y-2">
              {["Understand the types of market data (tick, OHLC, fundamental)", "Discover free and paid data sources for Indian markets", 
                "Learn data cleaning and preprocessing techniques", "Explore storage solutions from CSV to databases"].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-cyan-700 ">
                  <Icons.CheckCircle className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0"/><span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none ">
            
            {/* Data Importance */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-2xl p-6 mb-10 border border-amber-200 ">
              <h3 className="font-bold text-amber-900  mb-3 text-lg flex items-center gap-2">
                <Icons.Warning className="w-5 h-5"/> Why Data Quality Matters
              </h3>
              <p className="text-amber-800 ">
                <strong>"Garbage in, garbage out"</strong> is the #1 rule of algo trading. Your strategy is only as good as your data. 
                Bad data leads to false signals, unrealistic backtests, and real losses.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4">Types of Market Data</h2>
            <p className="text-gray-700  mb-6">
              Understanding the different types of data helps you choose what you need for your strategy.
            </p>

            {/* Data Types SVG */}
            <div className="bg-gradient-to-br from-slate-900 to-cyan-950 rounded-2xl p-6 mb-10 border border-cyan-800/50 shadow-xl">
              <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 350" fill="none">
                <text x="350" y="25" textAnchor="middle" fill="#e0e7ff" fontSize="14" fontWeight="700">TYPES OF MARKET DATA</text>

                {/* Tick Data */}
                <g transform="translate(30, 50)">
                  <rect x="0" y="0" width="200" height="130" rx="12" fill="#1e293b" stroke="#06b6d4" strokeWidth="2"/>
                  <rect x="0" y="0" width="200" height="35" rx="12" fill="#06b6d4"/>
                  <rect x="0" y="23" width="200" height="12" fill="#06b6d4"/>
                  <text x="100" y="24" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">TICK DATA</text>
                  <text x="100" y="58" textAnchor="middle" fill="#67e8f9" fontSize="9">Every single trade</text>
                  <text x="20" y="80" fill="#94a3b8" fontSize="8">• Price + Volume per trade</text>
                  <text x="20" y="95" fill="#94a3b8" fontSize="8">• Timestamp to millisecond</text>
                  <text x="20" y="110" fill="#94a3b8" fontSize="8">• Huge storage required</text>
                  <text x="100" y="125" textAnchor="middle" fill="#fcd34d" fontSize="7">Best for: HFT, microstructure</text>
                </g>

                {/* OHLC Data */}
                <g transform="translate(250, 50)">
                  <rect x="0" y="0" width="200" height="130" rx="12" fill="#1e293b" stroke="#22c55e" strokeWidth="2"/>
                  <rect x="0" y="0" width="200" height="35" rx="12" fill="#22c55e"/>
                  <rect x="0" y="23" width="200" height="12" fill="#22c55e"/>
                  <text x="100" y="24" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">OHLC DATA</text>
                  <text x="100" y="58" textAnchor="middle" fill="#86efac" fontSize="9">Candlestick bars</text>
                  <text x="20" y="80" fill="#94a3b8" fontSize="8">• Open, High, Low, Close</text>
                  <text x="20" y="95" fill="#94a3b8" fontSize="8">• 1min to Daily intervals</text>
                  <text x="20" y="110" fill="#94a3b8" fontSize="8">• Manageable storage</text>
                  <text x="100" y="125" textAnchor="middle" fill="#fcd34d" fontSize="7">Best for: Most strategies</text>
                </g>

                {/* Fundamental Data */}
                <g transform="translate(470, 50)">
                  <rect x="0" y="0" width="200" height="130" rx="12" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2"/>
                  <rect x="0" y="0" width="200" height="35" rx="12" fill="#8b5cf6"/>
                  <rect x="0" y="23" width="200" height="12" fill="#8b5cf6"/>
                  <text x="100" y="24" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">FUNDAMENTAL</text>
                  <text x="100" y="58" textAnchor="middle" fill="#c4b5fd" fontSize="9">Company financials</text>
                  <text x="20" y="80" fill="#94a3b8" fontSize="8">• Earnings, Revenue, P/E</text>
                  <text x="20" y="95" fill="#94a3b8" fontSize="8">• Quarterly updates</text>
                  <text x="20" y="110" fill="#94a3b8" fontSize="8">• Requires normalization</text>
                  <text x="100" y="125" textAnchor="middle" fill="#fcd34d" fontSize="7">Best for: Value, factor models</text>
                </g>

                {/* Alternative Data */}
                <g transform="translate(140, 200)">
                  <rect x="0" y="0" width="200" height="130" rx="12" fill="#1e293b" stroke="#f59e0b" strokeWidth="2"/>
                  <rect x="0" y="0" width="200" height="35" rx="12" fill="#f59e0b"/>
                  <rect x="0" y="23" width="200" height="12" fill="#f59e0b"/>
                  <text x="100" y="24" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">ALTERNATIVE DATA</text>
                  <text x="100" y="58" textAnchor="middle" fill="#fcd34d" fontSize="9">Non-traditional sources</text>
                  <text x="20" y="80" fill="#94a3b8" fontSize="8">• Sentiment, news, satellite</text>
                  <text x="20" y="95" fill="#94a3b8" fontSize="8">• Social media trends</text>
                  <text x="20" y="110" fill="#94a3b8" fontSize="8">• Often expensive</text>
                  <text x="100" y="125" textAnchor="middle" fill="#fcd34d" fontSize="7">Best for: Edge seeking</text>
                </g>

                {/* Real-time Data */}
                <g transform="translate(360, 200)">
                  <rect x="0" y="0" width="200" height="130" rx="12" fill="#1e293b" stroke="#ef4444" strokeWidth="2"/>
                  <rect x="0" y="0" width="200" height="35" rx="12" fill="#ef4444"/>
                  <rect x="0" y="23" width="200" height="12" fill="#ef4444"/>
                  <text x="100" y="24" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">REAL-TIME FEEDS</text>
                  <text x="100" y="58" textAnchor="middle" fill="#fca5a5" fontSize="9">Live market data</text>
                  <text x="20" y="80" fill="#94a3b8" fontSize="8">• WebSocket streams</text>
                  <text x="20" y="95" fill="#94a3b8" fontSize="8">• L1/L2 order book</text>
                  <text x="20" y="110" fill="#94a3b8" fontSize="8">• Subscription fees apply</text>
                  <text x="100" y="125" textAnchor="middle" fill="#fcd34d" fontSize="7">Best for: Live trading</text>
                </g>
              </svg>
            </div>

            {/* Data Sources */}
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-emerald-100  rounded-xl flex items-center justify-center">
                <Icons.Download className="w-5 h-5 text-emerald-600 "/>
              </span>
              Data Sources for Indian Markets
            </h2>

            <p className="text-gray-700  mb-6">
              Here are the main sources for getting historical and real-time data for NSE/BSE:
            </p>

            {/* Free Sources */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50   rounded-2xl p-6 mb-6 border border-emerald-200 ">
              <h3 className="font-bold text-emerald-800  mb-4">🆓 Free Data Sources</h3>
              <div className="space-y-4">
                {[
                  { name: "NSE India Website", url: "nseindia.com", desc: "Official historical data, bhavcopy downloads", limit: "Limited API, manual downloads" },
                  { name: "Yahoo Finance", url: "finance.yahoo.com", desc: "OHLC data via yfinance Python library", limit: "15-min delayed, some gaps" },
                  { name: "Google Finance", url: "google.com/finance", desc: "Basic price data, no API", limit: "Very limited, no bulk downloads" },
                  { name: "BSE India", url: "bseindia.com", desc: "Historical data, corporate actions", limit: "Manual downloads only" },
                ].map((src, i) => (
                  <div key={i} className="bg-white  rounded-xl p-4 border border-emerald-200 ">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-emerald-700 ">{src.name}</h4>
                      <span className="text-xs text-gray-500 ">{src.url}</span>
                    </div>
                    <p className="text-sm text-gray-600 ">{src.desc}</p>
                    <p className="text-xs text-amber-600  mt-1">⚠️ {src.limit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Paid Sources */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50   rounded-2xl p-6 mb-10 border border-blue-200 ">
              <h3 className="font-bold text-blue-800  mb-4">💎 Paid/Premium Sources</h3>
              <div className="space-y-4">
                {[
                  { name: "Zerodha Kite API", price: "₹2000/month", desc: "Real-time data, historical candles, order placement", best: "Best for retail algo traders" },
                  { name: "Upstox API", price: "Free with account", desc: "Real-time + historical data, REST/WebSocket", best: "Good free alternative" },
                  { name: "TrueData", price: "₹500+/month", desc: "Tick data, real-time feeds, backtesting data", best: "High-quality historical data" },
                  { name: "Global Data Feeds", price: "₹3000+/month", desc: "Institutional-grade tick data, low latency", best: "For serious algo traders" },
                ].map((src, i) => (
                  <div key={i} className="bg-white  rounded-xl p-4 border border-blue-200 ">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-blue-700 ">{src.name}</h4>
                      <span className="text-sm font-mono text-blue-600 ">{src.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 ">{src.desc}</p>
                    <p className="text-xs text-emerald-600  mt-1">✓ {src.best}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Cleaning */}
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-violet-100  rounded-xl flex items-center justify-center">
                <Icons.Filter className="w-5 h-5 text-violet-600 "/>
              </span>
              Data Cleaning & Preprocessing
            </h2>

            <p className="text-gray-700  mb-6">
              Raw data is rarely ready for use. Here's what you need to handle:
            </p>

            {/* Cleaning Steps */}
            <div className="bg-white  rounded-2xl p-6 mb-10 border border-gray-200 ">
              <div className="space-y-4">
                {[
                  { step: "Handle Missing Data", desc: "Fill gaps with forward-fill, interpolation, or mark as invalid", code: "df['close'].ffill()" },
                  { step: "Adjust for Splits/Dividends", desc: "Use adjusted close prices for accurate returns", code: "adj_close = close * adj_factor" },
                  { step: "Remove Outliers", desc: "Filter out erroneous spikes (e.g., >20% single-candle moves)", code: "df = df[df['return'].abs() < 0.20]" },
                  { step: "Handle Corporate Actions", desc: "Account for bonuses, rights issues, delistings", code: "Check corporate actions calendar" },
                  { step: "Timezone Handling", desc: "Ensure all timestamps are in IST (UTC+5:30)", code: "df.index = df.index.tz_localize('Asia/Kolkata')" },
                  { step: "Validate Data Integrity", desc: "Check for High < Open, Low > High, etc.", code: "assert (df['high'] >= df['low']).all()" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 bg-gray-50  rounded-xl">
                    <span className="flex-shrink-0 w-8 h-8 bg-violet-100  rounded-lg flex items-center justify-center text-violet-600  font-bold text-sm">{i + 1}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 ">{item.step}</h4>
                      <p className="text-sm text-gray-600 ">{item.desc}</p>
                      <code className="text-xs text-violet-600  bg-violet-50  px-2 py-0.5 rounded mt-1 inline-block">{item.code}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Storage Solutions */}
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-100  rounded-xl flex items-center justify-center">
                <Icons.Server className="w-5 h-5 text-blue-600 "/>
              </span>
              Data Storage Solutions
            </h2>

            {/* Storage Comparison SVG */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-6 mb-10 border border-blue-800/50 shadow-xl">
              <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 280" fill="none">
                <text x="350" y="25" textAnchor="middle" fill="#e0e7ff" fontSize="14" fontWeight="700">STORAGE SOLUTIONS BY SCALE</text>

                {/* Small Scale */}
                <g transform="translate(30, 50)">
                  <rect x="0" y="0" width="200" height="200" rx="12" fill="#1e293b" stroke="#22c55e" strokeWidth="2"/>
                  <text x="100" y="30" textAnchor="middle" fill="#86efac" fontSize="12" fontWeight="700">SMALL SCALE</text>
                  <text x="100" y="50" textAnchor="middle" fill="#64748b" fontSize="9">&lt; 1GB data</text>
                  
                  <text x="20" y="80" fill="white" fontSize="10" fontWeight="600">CSV Files</text>
                  <text x="20" y="95" fill="#94a3b8" fontSize="8">• Simple, portable</text>
                  <text x="20" y="108" fill="#94a3b8" fontSize="8">• Easy with pandas</text>
                  
                  <text x="20" y="130" fill="white" fontSize="10" fontWeight="600">Parquet</text>
                  <text x="20" y="145" fill="#94a3b8" fontSize="8">• Compressed, fast reads</text>
                  <text x="20" y="158" fill="#94a3b8" fontSize="8">• Better than CSV</text>
                  
                  <text x="100" y="190" textAnchor="middle" fill="#86efac" fontSize="8">✓ Recommended for beginners</text>
                </g>

                {/* Medium Scale */}
                <g transform="translate(250, 50)">
                  <rect x="0" y="0" width="200" height="200" rx="12" fill="#1e293b" stroke="#3b82f6" strokeWidth="2"/>
                  <text x="100" y="30" textAnchor="middle" fill="#93c5fd" fontSize="12" fontWeight="700">MEDIUM SCALE</text>
                  <text x="100" y="50" textAnchor="middle" fill="#64748b" fontSize="9">1-50GB data</text>
                  
                  <text x="20" y="80" fill="white" fontSize="10" fontWeight="600">SQLite</text>
                  <text x="20" y="95" fill="#94a3b8" fontSize="8">• Single file database</text>
                  <text x="20" y="108" fill="#94a3b8" fontSize="8">• SQL queries, no server</text>
                  
                  <text x="20" y="130" fill="white" fontSize="10" fontWeight="600">PostgreSQL</text>
                  <text x="20" y="145" fill="#94a3b8" fontSize="8">• Full SQL power</text>
                  <text x="20" y="158" fill="#94a3b8" fontSize="8">• TimescaleDB extension</text>
                  
                  <text x="100" y="190" textAnchor="middle" fill="#93c5fd" fontSize="8">✓ Best for most algo traders</text>
                </g>

                {/* Large Scale */}
                <g transform="translate(470, 50)">
                  <rect x="0" y="0" width="200" height="200" rx="12" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2"/>
                  <text x="100" y="30" textAnchor="middle" fill="#c4b5fd" fontSize="12" fontWeight="700">LARGE SCALE</text>
                  <text x="100" y="50" textAnchor="middle" fill="#64748b" fontSize="9">&gt; 50GB data</text>
                  
                  <text x="20" y="80" fill="white" fontSize="10" fontWeight="600">InfluxDB</text>
                  <text x="20" y="95" fill="#94a3b8" fontSize="8">• Time-series optimized</text>
                  <text x="20" y="108" fill="#94a3b8" fontSize="8">• Built for OHLC data</text>
                  
                  <text x="20" y="130" fill="white" fontSize="10" fontWeight="600">ClickHouse</text>
                  <text x="20" y="145" fill="#94a3b8" fontSize="8">• Columnar storage</text>
                  <text x="20" y="158" fill="#94a3b8" fontSize="8">• Blazing fast queries</text>
                  
                  <text x="100" y="190" textAnchor="middle" fill="#c4b5fd" fontSize="8">✓ For institutional/HFT</text>
                </g>
              </svg>
            </div>

            {/* Practical Tips */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-2xl p-6 mb-10 border border-amber-200 ">
              <h3 className="font-bold text-amber-800  mb-4 flex items-center gap-3">
                <Icons.Zap className="w-5 h-5"/> Practical Data Tips
              </h3>
              <ul className="space-y-3">
                {[
                  { tip: "Start with daily data", why: "Easier to work with, most strategies don't need minute data" },
                  { tip: "Use yfinance for learning", why: "Free, easy Python API, good enough for backtesting" },
                  { tip: "Always validate your data", why: "Run sanity checks before any backtest" },
                  { tip: "Store raw and processed separately", why: "Never modify raw data, keep it as source of truth" },
                  { tip: "Version your data", why: "Track when data was downloaded and any transformations" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 bg-white  rounded-lg p-3">
                    <Icons.CheckCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0"/>
                    <div>
                      <span className="font-semibold text-amber-700 ">{item.tip}</span>
                      <span className="text-amber-600  ml-1">— {item.why}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Takeaways */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50   rounded-2xl p-6 mb-10 border border-cyan-200 ">
              <h3 className="font-bold text-cyan-800  mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center"><Icons.Key className="w-5 h-5 text-white"/></span>
                Key Takeaways
              </h3>
              <ul className="space-y-2">
                {["Data quality directly impacts strategy performance — validate everything",
                  "Start with free sources (Yahoo Finance, NSE) while learning",
                  "Most retail strategies work fine with daily or hourly OHLC data",
                  "Always clean data: handle missing values, splits, dividends, outliers",
                  "Use Parquet or SQLite for manageable data, PostgreSQL for scaling",
                  "Keep raw data separate from processed data — never modify originals"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-cyan-700 ">
                    <Icons.CheckCircle className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0"/><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quiz */}
            <h2 className="text-2xl font-bold mb-6">Test Your Understanding</h2>
            <QuizQuestion
              question="Which data type is most suitable for a typical swing trading strategy?"
              options={["Tick data (every trade)", "Daily/Hourly OHLC data", "Alternative data (satellite imagery)", "Level 2 order book data"]}
              correctAnswer="B"
              explanation="Daily or hourly OHLC (Open-High-Low-Close) data is sufficient for most swing trading strategies. Tick data is overkill and requires massive storage, while alternative data and order book data are typically used for more specialized strategies."
            />
            <QuizQuestion
              question="What is the main advantage of using adjusted close prices?"
              options={["They're easier to calculate", "They account for splits and dividends", "They reduce storage requirements", "They're more accurate in real-time"]}
              correctAnswer="B"
              explanation="Adjusted close prices account for corporate actions like stock splits and dividends, giving you accurate historical returns. Without adjustment, a 2:1 split would look like a 50% price drop in your data."
            />
            <QuizQuestion
              question="Which storage solution is best for a beginner with less than 1GB of data?"
              options={["InfluxDB time-series database", "CSV or Parquet files", "ClickHouse columnar database", "MongoDB"]}
              correctAnswer="B"
              explanation="For small-scale data (< 1GB), simple CSV or Parquet files are the best choice. They're easy to work with in pandas, require no database setup, and are portable. Parquet is preferred as it's compressed and faster to read."
            />
          </div>
          {/* End of prose div */}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/algo-trading-lesson-7')}
              className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-colors group">
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/>Back: Live Trading
            </button>
            <button onClick={() => navigate('/learn/algo-trading-lesson-9')}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all">
              Next: Broker APIs<FaArrowRight/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AlgoTradingLesson8;
