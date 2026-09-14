import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// Custom SVG Icons
const Icons = {
  // Exchange Icon
  Exchange: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 16L3 12M3 12L7 8M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 8L21 12M21 12L17 16M21 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="translate(0, 8)"/>
    </svg>
  ),

  // Broker Icon
  Broker: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="9" y="18" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),

  // Demat Account Icon
  Demat: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 15H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Trading Account Icon
  Trading: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M2 9H22" stroke="currentColor" strokeWidth="2"/>
      <path d="M6 15L10 11L13 14L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Mobile App Icon
  MobileApp: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 6H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Order Book Icon
  OrderBook: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 9H21" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 9V21" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 6H7.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 13H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 17H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 13H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 17H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Buy Icon
  Buy: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Sell Icon
  Sell: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Rupee Icon
  Rupee: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 7H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 11C8 11 10 11 11 13C12 15 8 17 8 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Clock Icon
  Clock: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Lightbulb Icon
  Lightbulb: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 17H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 3C8.13401 3 5 6.13401 5 10C5 12.38 6.19 14.47 8 15.74V17H16V15.74C17.81 14.47 19 12.38 19 10C19 6.13401 15.866 3 12 3Z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // India Flag Icon
  IndiaFlag: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 15H21" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),

  // Steps/Process Icon
  Steps: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 6H15" stroke="currentColor" strokeWidth="2"/>
      <path d="M6 9V15" stroke="currentColor" strokeWidth="2"/>
      <path d="M18 9V15" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 18H15" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Market Order Icon
  MarketOrder: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Limit Order Icon
  LimitOrder: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 12H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 16L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Settlement Icon
  Settlement: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 14H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Check Icon
  Check: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Question Icon
  Question: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.3062 14.1652 11.4175 13 11.8293V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>
  ),

  // Warning Icon
  Warning: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L22 20H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>
  ),

  // Arrow Icon
  Arrow: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

// Quiz Question Component
const QuizQuestion = ({ question, options, correctAnswer, explanation }) => {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index) => {
    if (showResult) return;
    setSelected(index);
    setShowResult(true);
  };

  const isCorrect = selected === correctAnswer;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <h4 className="font-bold text-gray-900 mb-4">{question}</h4>
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            disabled={showResult}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              showResult
                ? index === correctAnswer
                  ? "border-green-500 bg-green-50"
                  : index === selected
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-gray-50"
                : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={showResult && index === correctAnswer ? "text-green-700 font-medium" : showResult && index === selected ? "text-red-700" : "text-gray-700"}>
                {option}
              </span>
              {showResult && index === correctAnswer && (
                <FaCheckCircle className="text-green-500" />
              )}
              {showResult && index === selected && index !== correctAnswer && (
                <FaTimesCircle className="text-red-500" />
              )}
            </div>
          </button>
        ))}
      </div>
      {showResult && (
        <div className={`mt-4 p-4 rounded-xl ${isCorrect ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
          <p className="font-medium">{isCorrect ? "Correct!" : "Not quite!"}</p>
          <p className="text-sm mt-1">{explanation}</p>
        </div>
      )}
    </div>
  );
};

const StockMarketLesson3 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-purple-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/learn/stock-market')}
              className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span>Module 3: Stock Market Basics</span>
            </button>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Icons.Clock className="w-4 h-4" />
              10 min read
            </span>
          </div>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-full text-sm font-semibold">
                Lesson 3 of 7
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Beginner
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-200 rounded-xl shadow-sm">
                <Icons.Exchange className="w-7 h-7 text-purple-600" />
              </span>
              <span>How Buying & Selling Works</span>
            </h1>
            <p className="text-lg text-gray-500">
              Your step-by-step guide to placing your first stock order — from opening an account to clicking "Buy".
            </p>
          </div>

          {/* The Hook */}
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 mb-10 border border-purple-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <Icons.Question className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-purple-900 mb-2">Ever Wondered How People Buy Stocks?</h3>
                <p className="text-purple-800">
                  You've heard "I bought Reliance shares" or "I sold my Infosys stock" — but how does it actually happen? 
                  Can you just walk into NSE and buy? (Spoiler: No!) Let's demystify the entire process from opening 
                  your first account to executing your first trade.
                </p>
              </div>
            </div>
          </div>

          {/* What You Need - The Three Accounts */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Steps className="w-6 h-6 text-purple-600" />
              <span>What You Need to Start Trading</span>
            </h2>
            
            <p className="text-gray-600 mb-6">
              Before you can buy your first share, you need to set up these three accounts. 
              Don't worry — most brokers open all three together in one go!
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* Bank Account */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                  <Icons.Rupee className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-bold text-green-800 mb-2">1. Bank Account</h4>
                <p className="text-green-700 text-sm">
                  Your regular savings account. Money flows from here to buy stocks, and returns here when you sell.
                </p>
                <p className="text-green-600 text-xs mt-2 italic">You probably already have this!</p>
              </div>

              {/* Demat Account */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-200">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                  <Icons.Demat className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-bold text-purple-800 mb-2">2. Demat Account</h4>
                <p className="text-purple-700 text-sm">
                  "Dematerialized" account — a digital locker where your shares are stored electronically. No physical certificates!
                </p>
                <p className="text-purple-600 text-xs mt-2 italic">Like a bank locker, but for shares</p>
              </div>

              {/* Trading Account */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <Icons.Trading className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-bold text-blue-800 mb-2">3. Trading Account</h4>
                <p className="text-blue-700 text-sm">
                  The interface where you place buy/sell orders. This connects your bank account to the stock exchange.
                </p>
                <p className="text-blue-600 text-xs mt-2 italic">Your window to the market</p>
              </div>
            </div>
          </div>

          {/* Visual: How the Three Accounts Connect */}
          <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How These Accounts Work Together</h2>
            
            <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 300" fill="none">
              {/* Title */}
              <text x="350" y="25" textAnchor="middle" fill="#374151" fontSize="14" fontWeight="600">
                When You Buy 10 Shares of TCS at Rs. 3,500 each
              </text>

              {/* Bank Account */}
              <g transform="translate(50, 60)">
                <rect x="0" y="0" width="150" height="100" rx="12" fill="#dcfce7" stroke="#22c55e" strokeWidth="2"/>
                <text x="75" y="25" textAnchor="middle" fill="#166534" fontSize="12" fontWeight="700">BANK ACCOUNT</text>
                <text x="75" y="50" textAnchor="middle" fill="#15803d" fontSize="11">Your Money</text>
                <text x="75" y="75" textAnchor="middle" fill="#166534" fontSize="16" fontWeight="700">₹ 50,000</text>
                <text x="75" y="92" textAnchor="middle" fill="#dc2626" fontSize="10">-₹ 35,000</text>
              </g>

              {/* Arrow 1 */}
              <g transform="translate(210, 95)">
                <path d="M0 15 L60 15" stroke="#9333ea" strokeWidth="3" strokeDasharray="5,3"/>
                <path d="M55 10 L65 15 L55 20" fill="#9333ea"/>
                <text x="32" y="8" textAnchor="middle" fill="#7c3aed" fontSize="9">Money flows</text>
              </g>

              {/* Trading Account */}
              <g transform="translate(275, 60)">
                <rect x="0" y="0" width="150" height="100" rx="12" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2"/>
                <text x="75" y="25" textAnchor="middle" fill="#5b21b6" fontSize="12" fontWeight="700">TRADING ACCOUNT</text>
                <text x="75" y="50" textAnchor="middle" fill="#7c3aed" fontSize="11">Places Order</text>
                <rect x="25" y="60" width="100" height="30" rx="6" fill="#8b5cf6"/>
                <text x="75" y="80" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">BUY TCS x 10</text>
              </g>

              {/* Arrow 2 */}
              <g transform="translate(435, 95)">
                <path d="M0 15 L60 15" stroke="#9333ea" strokeWidth="3" strokeDasharray="5,3"/>
                <path d="M55 10 L65 15 L55 20" fill="#9333ea"/>
                <text x="32" y="8" textAnchor="middle" fill="#7c3aed" fontSize="9">Order sent</text>
              </g>

              {/* Stock Exchange */}
              <g transform="translate(500, 60)">
                <rect x="0" y="0" width="150" height="100" rx="12" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
                <text x="75" y="25" textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="700">NSE / BSE</text>
                <text x="75" y="50" textAnchor="middle" fill="#b45309" fontSize="11">Matches Buyers</text>
                <text x="75" y="65" textAnchor="middle" fill="#b45309" fontSize="11">& Sellers</text>
                <text x="75" y="85" textAnchor="middle" fill="#16a34a" fontSize="11" fontWeight="600">✓ TRADE EXECUTED</text>
              </g>

              {/* After Trade Section */}
              <g transform="translate(50, 190)">
                <rect x="0" y="0" width="600" height="80" rx="12" fill="#f3e8ff" stroke="#c084fc" strokeWidth="2"/>
                <text x="300" y="25" textAnchor="middle" fill="#7c3aed" fontSize="12" fontWeight="700">AFTER THE TRADE (T+1 Settlement)</text>
                
                {/* Demat receives shares */}
                <g transform="translate(50, 40)">
                  <rect x="0" y="0" width="200" height="30" rx="6" fill="#ddd6fe"/>
                  <text x="100" y="20" textAnchor="middle" fill="#5b21b6" fontSize="11">Demat Account receives 10 TCS shares</text>
                </g>

                {/* Bank balance */}
                <g transform="translate(300, 40)">
                  <rect x="0" y="0" width="250" height="30" rx="6" fill="#bbf7d0"/>
                  <text x="125" y="20" textAnchor="middle" fill="#166534" fontSize="11">Bank Balance: ₹ 50,000 - 35,000 = ₹ 15,000</text>
                </g>
              </g>
            </svg>
          </div>

          {/* Who is a Broker? */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Broker className="w-6 h-6 text-purple-600" />
              <span>Who is a Stockbroker?</span>
            </h2>
            
            <p className="text-gray-600 mb-4">
              You can't directly go to NSE/BSE and buy shares. You need a middleman — a <strong>stockbroker</strong>.
            </p>

            <div className="bg-purple-50 rounded-xl p-4 mb-4 border border-purple-200">
              <p className="text-purple-800">
                <strong>Stockbroker</strong> = A SEBI-registered company that provides you access to the stock exchange. 
                They open your Demat + Trading accounts and let you buy/sell shares through their app or website.
              </p>
            </div>

            <h4 className="font-semibold text-gray-800 mb-3">Popular Brokers in India:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: "Zerodha", type: "Discount", color: "bg-green-100 text-green-700" },
                { name: "Groww", type: "Discount", color: "bg-blue-100 text-blue-700" },
                { name: "Upstox", type: "Discount", color: "bg-purple-100 text-purple-700" },
                { name: "Angel One", type: "Discount", color: "bg-amber-100 text-amber-700" },
                { name: "ICICI Direct", type: "Full Service", color: "bg-red-100 text-red-700" },
                { name: "HDFC Securities", type: "Full Service", color: "bg-indigo-100 text-indigo-700" },
                { name: "5paisa", type: "Discount", color: "bg-teal-100 text-teal-700" },
                { name: "Paytm Money", type: "Discount", color: "bg-cyan-100 text-cyan-700" }
              ].map((broker, index) => (
                <div key={index} className={`${broker.color} rounded-lg p-3 text-center`}>
                  <p className="font-semibold text-sm">{broker.name}</p>
                  <p className="text-xs opacity-75">{broker.type}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">
                <strong>Discount Broker:</strong> Low fees (Rs. 0-20 per trade), basic services, app-focused<br/>
                <strong>Full Service:</strong> Higher fees, research reports, personal advisor, more features
              </p>
            </div>
          </div>

          {/* Types of Orders */}
          <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.OrderBook className="w-6 h-6 text-purple-600" />
              <span>Types of Orders</span>
            </h2>
            
            <p className="text-gray-600 mb-6">
              When placing an order, you can choose how you want to buy or sell:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Market Order */}
              <div className="bg-white rounded-xl p-5 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icons.MarketOrder className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-bold text-gray-900">Market Order</h4>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  "Buy/Sell NOW at whatever the current price is"
                </p>
                <div className="bg-green-50 rounded-lg p-3 text-sm">
                  <p className="text-green-800 mb-2">
                    <strong>When to use:</strong> You want the trade done immediately and don't care about exact price
                  </p>
                  <p className="text-green-700">
                    <strong>Example:</strong> TCS is at Rs. 3,500. You place market order → You might get it at Rs. 3,498 or Rs. 3,502
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Fast Execution</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">Price May Vary</span>
                </div>
              </div>

              {/* Limit Order */}
              <div className="bg-white rounded-xl p-5 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icons.LimitOrder className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900">Limit Order</h4>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  "Buy/Sell ONLY at this specific price or better"
                </p>
                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                  <p className="text-blue-800 mb-2">
                    <strong>When to use:</strong> You have a specific price in mind and can wait
                  </p>
                  <p className="text-blue-700">
                    <strong>Example:</strong> TCS is at Rs. 3,500. You set limit order at Rs. 3,450 → Trade only happens if price drops to Rs. 3,450
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Price Control</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">May Not Execute</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-amber-800 text-sm">
                <strong>Beginner Tip:</strong> Start with limit orders! They give you more control over the price 
                you pay. Market orders are useful for highly liquid stocks when you need immediate execution.
              </p>
            </div>
          </div>

          {/* Step-by-Step: Placing Your First Order */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.MobileApp className="w-6 h-6 text-purple-600" />
              <span>Placing Your First Order (Step-by-Step)</span>
            </h2>

            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: "Open Your Trading App",
                  desc: "Login to Zerodha, Groww, or your broker's app",
                  color: "purple"
                },
                {
                  step: 2,
                  title: "Search for the Stock",
                  desc: "Type 'TCS' or 'RELIANCE' in the search bar",
                  color: "blue"
                },
                {
                  step: 3,
                  title: "Click on Buy (B) or Sell (S)",
                  desc: "Green for Buy, Red for Sell",
                  color: "green"
                },
                {
                  step: 4,
                  title: "Enter Quantity",
                  desc: "How many shares? Start small — even 1 is fine!",
                  color: "amber"
                },
                {
                  step: 5,
                  title: "Choose Order Type",
                  desc: "Market or Limit order (Limit recommended for beginners)",
                  color: "teal"
                },
                {
                  step: 6,
                  title: "Review & Place Order",
                  desc: "Double-check everything, then hit 'Place Order'",
                  color: "indigo"
                },
                {
                  step: 7,
                  title: "Order Confirmation",
                  desc: "You'll see order status: Pending → Executed",
                  color: "rose"
                }
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className={`w-10 h-10 bg-${item.color}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-${item.color}-600 font-bold`}>{item.step}</span>
                  </div>
                  <div className="flex-1 pb-4 border-b border-gray-100">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settlement: T+1 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Settlement className="w-6 h-6 text-blue-600" />
              <span>Settlement: When Do You Get Your Shares?</span>
            </h2>

            <div className="bg-white rounded-xl p-5 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl font-bold text-purple-600">T+1</span>
                <div>
                  <p className="font-semibold text-gray-900">Trade Day + 1 Working Day</p>
                  <p className="text-gray-500 text-sm">India moved to T+1 settlement in 2023 (faster than most countries!)</p>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-purple-800 text-sm">
                  <strong>What this means:</strong><br/>
                  If you buy shares on Monday, they'll appear in your Demat account by Tuesday.<br/>
                  If you sell shares on Monday, money will be in your bank by Tuesday.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">When You BUY:</h4>
                <p className="text-green-700 text-sm">
                  Day 0: Money debited from bank<br/>
                  Day 1: Shares credited to Demat
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">When You SELL:</h4>
                <p className="text-red-700 text-sm">
                  Day 0: Shares debited from Demat<br/>
                  Day 1: Money credited to bank
                </p>
              </div>
            </div>
          </div>

          {/* India Focus Section */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-2xl p-6 mb-10 border border-orange-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.IndiaFlag className="w-6 h-6 text-orange-600" />
              <span>India Focus: Market Timings & Rules</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Market Hours (NSE/BSE)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-gray-700">
                    <Icons.Clock className="w-4 h-4 text-purple-500" />
                    <span><strong>Pre-Open:</strong> 9:00 AM - 9:15 AM</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <Icons.Clock className="w-4 h-4 text-green-500" />
                    <span><strong>Normal Trading:</strong> 9:15 AM - 3:30 PM</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <Icons.Clock className="w-4 h-4 text-amber-500" />
                    <span><strong>Post-Close:</strong> 3:40 PM - 4:00 PM</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <span className="w-4 h-4" />
                    <span className="italic">Monday to Friday (not on holidays)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Key Things to Know</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Icons.Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Minimum investment: Even 1 share (no minimum amount!)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>PAN card mandatory for opening Demat account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>KYC (Aadhaar + PAN) required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>SEBI regulates all brokers (your money is safe)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="bg-red-50 rounded-2xl p-6 mb-6 border border-red-200">
            <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
              <Icons.Warning className="w-6 h-6 text-red-600" />
              <span>Common Beginner Mistakes</span>
            </h2>
            
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 border border-red-100">
                <p className="text-red-800 font-medium">Using market orders on volatile stocks</p>
                <p className="text-red-600 text-sm">You might buy at a much higher price than expected. Use limit orders!</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-100">
                <p className="text-red-800 font-medium">Not checking order status</p>
                <p className="text-red-600 text-sm">Limit orders might not execute. Always check if your order went through.</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-100">
                <p className="text-red-800 font-medium">Trading in pre-market without understanding it</p>
                <p className="text-red-600 text-sm">Pre-open session works differently. Stick to normal hours as a beginner.</p>
              </div>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 mb-10 border border-purple-200">
            <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
              <Icons.Lightbulb className="w-6 h-6 text-purple-600" />
              <span>Key Takeaways</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-purple-800">
                  <strong>3 accounts needed:</strong> Bank + Demat + Trading (opened together via broker)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-purple-800">
                  <strong>Broker = Your gateway</strong> to the stock exchange (Zerodha, Groww, etc.)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-purple-800">
                  <strong>Market vs Limit orders</strong> — use limit orders for price control
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p className="text-purple-800">
                  <strong>T+1 settlement</strong> — shares/money delivered next working day
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl">
                <span className="text-xl">✍️</span>
              </span>
              <span>Quick Quiz</span>
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                question="What is a Demat account used for?"
                options={[
                  "To transfer money for buying shares",
                  "To store your shares electronically",
                  "To place buy/sell orders",
                  "To pay taxes on profits"
                ]}
                correctAnswer={1}
                explanation="A Demat (Dematerialized) account is your digital locker where shares are stored electronically. Your bank account holds money, and your trading account is used to place orders."
              />
              
              <QuizQuestion
                question="You want to buy Infosys at exactly Rs. 1,450, not a rupee more. Which order type should you use?"
                options={[
                  "Market Order",
                  "Limit Order",
                  "Stop Loss Order",
                  "Any order will work"
                ]}
                correctAnswer={1}
                explanation="A Limit Order lets you specify the exact price you want to pay. The trade will only execute at Rs. 1,450 or lower. A Market Order would buy at the current market price, which might be higher."
              />
              
              <QuizQuestion
                question="What does T+1 settlement mean?"
                options={[
                  "You get shares 1 hour after buying",
                  "You get shares 1 working day after buying",
                  "You must hold shares for at least 1 day",
                  "You can only trade once per day"
                ]}
                correctAnswer={1}
                explanation="T+1 means Trade Day + 1 working day. If you buy shares on Monday, they'll be in your Demat account by Tuesday. India moved to T+1 settlement in 2023, making it one of the fastest settlement systems globally!"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/learn/stock-market-lesson-2')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors w-full sm:w-auto justify-center"
            >
              <FaArrowLeft className="text-sm" />
              <span>Previous: What Are Shares?</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/stock-market-lesson-4')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white rounded-xl transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
            >
              <span>Next: What is a Market Index?</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StockMarketLesson3;
