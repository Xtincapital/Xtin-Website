import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { moduleLabel } from "../../../../constants/learningModules";

// Custom SVG Icons
const Icons = {
  // Chart Down Icon
  ChartDown: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 10L10 13L13 10L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 10V14H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Statistics Icon
  Stats: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="14" width="4" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="10" y="10" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="17" y="3" width="4" height="18" rx="1" stroke="currentColor" strokeWidth="2"/>
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

  // Money Loss Icon
  MoneyLoss: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 16V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 10C9 8.89543 9.89543 8 11 8H13C14.1046 8 15 8.89543 15 10C15 11.1046 14.1046 12 13 12H11C9.89543 12 9 12.8954 9 14C9 15.1046 9.89543 16 11 16H13C14.1046 16 15 15.1046 15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M4 4L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Reason Icon
  Reason: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Broker Icon
  Broker: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M2 8H22" stroke="currentColor" strokeWidth="2"/>
      <path d="M6 15H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 15H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Clock Icon
  Clock: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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

  // India Flag Icon
  IndiaFlag: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 15H21" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/>
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

  // Target Miss Icon
  TargetMiss: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
      <path d="M3 3L8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 8L8 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Person Icon
  Person: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 21V19C4 16.2386 6.23858 14 9 14H15C17.7614 14 20 16.2386 20 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Zero Sum Icon
  ZeroSum: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
      <circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2"/>
    </svg>
  ),

  // Document Icon
  Document: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 13H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
                : "border-gray-200 hover:border-rose-300 hover:bg-rose-50"
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

// Reason Card Component
const ReasonCard = ({ number, title, description, impact, bgColor, borderColor }) => {
  return (
    <div className={`${bgColor} rounded-xl p-5 border-2 ${borderColor} mb-4`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-rose-600 font-bold text-lg">{number}</span>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
          <p className="text-sm text-gray-700 mb-3">{description}</p>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs font-semibold text-rose-600 mb-1">IMPACT:</p>
            <p className="text-sm text-gray-700">{impact}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TradingBasicsLesson6 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-rose-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/learn/trading-basics')}
              className="flex items-center gap-2 text-gray-500 hover:text-rose-600 transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span>{moduleLabel("trading-basics")}</span>
            </button>
            <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Icons.Clock className="w-4 h-4" />
              8 min read
            </span>
          </div>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full text-sm font-semibold">
                Lesson 6 of 7
              </span>
              <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm">
                Reality Check
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-200 rounded-xl shadow-sm">
                <Icons.ChartDown className="w-7 h-7 text-rose-600" />
              </span>
              <span>Why Most Traders Lose</span>
            </h1>
            <p className="text-lg text-gray-500">
              The harsh reality backed by data. Understanding why most fail is the first step to being in the minority that doesn't.
            </p>
          </div>

          {/* The Hook - SEBI Data */}
          <div className="bg-gradient-to-r from-rose-50 to-red-50 rounded-2xl p-6 mb-10 border-2 border-rose-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <Icons.Document className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-rose-900 mb-2">SEBI's Official Data (January 2023 Study)</h3>
                <p className="text-rose-800">
                  SEBI studied 1 crore+ F&O traders over 3 years. The findings should make anyone pause before trading:
                </p>
              </div>
            </div>
          </div>

          {/* Visual: The Statistics */}
          <div className="bg-gradient-to-br from-gray-50 to-rose-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">The Hard Numbers (SEBI Study)</h2>
            
            <svg className="w-full max-w-2xl mx-auto mb-4" viewBox="0 0 600 300" fill="none">
              {/* Title */}
              <text x="300" y="25" textAnchor="middle" fill="#1f2937" fontSize="13" fontWeight="700">
                Out of Every 100 F&O Traders in India
              </text>
              
              {/* 89 Red figures (losers) */}
              <g transform="translate(50, 45)">
                {[...Array(89)].map((_, i) => {
                  const row = Math.floor(i / 10);
                  const col = i % 10;
                  return (
                    <g key={i} transform={`translate(${col * 40}, ${row * 22})`}>
                      <circle cx="8" cy="4" r="4" fill="#f43f5e"/>
                      <path d="M8 8 L8 16 M4 11 L12 11 M8 16 L4 22 M8 16 L12 22" stroke="#f43f5e" strokeWidth="1.5"/>
                    </g>
                  );
                })}
              </g>
              
              {/* 11 Green figures (winners) */}
              <g transform="translate(410, 45)">
                {[...Array(11)].map((_, i) => {
                  const row = Math.floor(i / 3);
                  const col = i % 3;
                  return (
                    <g key={i} transform={`translate(${col * 45}, ${row * 25})`}>
                      <circle cx="8" cy="4" r="4" fill="#22c55e"/>
                      <path d="M8 8 L8 16 M4 11 L12 11 M8 16 L4 22 M8 16 L12 22" stroke="#22c55e" strokeWidth="1.5"/>
                    </g>
                  );
                })}
              </g>
              
              {/* Labels */}
              <rect x="50" y="250" width="300" height="40" rx="8" fill="#fee2e2" stroke="#f43f5e" strokeWidth="2"/>
              <text x="200" y="275" textAnchor="middle" fill="#991b1b" fontSize="14" fontWeight="700">89 LOSE MONEY</text>
              
              <rect x="400" y="250" width="150" height="40" rx="8" fill="#dcfce7" stroke="#22c55e" strokeWidth="2"/>
              <text x="475" y="275" textAnchor="middle" fill="#166534" fontSize="14" fontWeight="700">11 PROFIT</text>
            </svg>

            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-4 text-center border-2 border-rose-200">
                <p className="text-3xl font-bold text-rose-600 mb-1">89%</p>
                <p className="text-sm text-gray-700">of traders made losses</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border-2 border-rose-200">
                <p className="text-3xl font-bold text-rose-600 mb-1">Rs. 1.1 Lakh</p>
                <p className="text-sm text-gray-700">average loss per person</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border-2 border-rose-200">
                <p className="text-3xl font-bold text-rose-600 mb-1">Rs. 51,689 Cr</p>
                <p className="text-sm text-gray-700">total losses by retail traders</p>
              </div>
            </div>
          </div>

          {/* Who Wins in This System */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.ZeroSum className="w-6 h-6 text-rose-600" />
              <span>The Zero-Sum Reality: Where Does the Money Go?</span>
            </h2>
            
            <p className="text-gray-700 mb-4">
              Trading (especially F&O) is a <strong>zero-sum game</strong>. For every rupee someone makes, someone else loses it. 
              Here's who's on the winning side:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 rounded-tl-lg font-semibold">Who</th>
                    <th className="text-left p-3 font-semibold">How They Profit</th>
                    <th className="text-left p-3 rounded-tr-lg font-semibold">Amount (FY23)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium text-green-700">Proprietary Traders (FIIs)</td>
                    <td className="p-3">Sophisticated algos, better information</td>
                    <td className="p-3 font-bold text-green-600">Rs. 28,000+ Cr profit</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50">
                    <td className="p-3 font-medium text-green-700">Brokers</td>
                    <td className="p-3">Brokerage on every trade (win or lose)</td>
                    <td className="p-3 font-bold text-green-600">Rs. 25,000+ Cr fees</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium text-green-700">Government</td>
                    <td className="p-3">STT, GST, Stamp Duty</td>
                    <td className="p-3 font-bold text-green-600">Rs. 32,000+ Cr taxes</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50">
                    <td className="p-3 font-medium text-green-700">Exchanges (NSE/BSE)</td>
                    <td className="p-3">Transaction charges</td>
                    <td className="p-3 font-bold text-green-600">Rs. 4,000+ Cr fees</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-rose-50">
                    <td className="p-3 font-medium text-rose-700">Retail Traders</td>
                    <td className="p-3 text-rose-700">Trading F&O</td>
                    <td className="p-3 font-bold text-rose-600">Rs. 51,689 Cr LOSS</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 bg-rose-50 rounded-lg p-4 border border-rose-200">
              <p className="text-rose-800 text-sm">
                <strong>Reality:</strong> You're not just competing against other traders. You're competing against 
                algorithms that execute in microseconds, institutions with teams of analysts, AND paying fees to brokers, 
                exchanges, and government on every single trade.
              </p>
            </div>
          </div>

          {/* The 10 Reasons Most Traders Lose */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Icons.TargetMiss className="w-6 h-6 text-rose-600" />
              <span>10 Reasons Most Traders Lose Money</span>
            </h2>

            <ReasonCard
              number="1"
              title="No Edge"
              description="Most traders trade based on 'tips', intuition, or patterns everyone already knows. In a zero-sum game, you need an edge the market hasn't priced in."
              impact="Without an edge, you're gambling. And in gambling with a house cut (fees), the house always wins eventually."
              bgColor="bg-rose-50"
              borderColor="border-rose-200"
            />

            <ReasonCard
              number="2"
              title="Overtrading"
              description="More trades = more fees. Each trade has a cost (brokerage, STT, etc.). Making 50 trades/day means 50× the cost drain."
              impact="Even with a 50% win rate, the accumulated fees push you into loss territory. Time in market beats timing the market."
              bgColor="bg-rose-50"
              borderColor="border-rose-200"
            />

            <ReasonCard
              number="3"
              title="No Risk Management"
              description="No stop losses, position too large, all eggs in one basket. One bad trade wipes out months of profits."
              impact="A 50% loss needs 100% gain to recover. Most traders never recover from one big blowup."
              bgColor="bg-rose-50"
              borderColor="border-rose-200"
            />

            <ReasonCard
              number="4"
              title="Leverage Abuse"
              description="F&O lets you control Rs. 10L with Rs. 1L margin. Looks great when winning, devastating when losing."
              impact="Leverage amplifies BOTH profits and losses. A 10% move against you with 10× leverage = 100% loss of capital."
              bgColor="bg-rose-50"
              borderColor="border-rose-200"
            />

            <ReasonCard
              number="5"
              title="Emotional Trading"
              description="Fear, greed, FOMO, revenge trading. Decisions made emotionally are almost always wrong."
              impact="Buy high (greed), sell low (fear). The exact opposite of what makes money."
              bgColor="bg-rose-50"
              borderColor="border-rose-200"
            />

            <ReasonCard
              number="6"
              title="No Trading Plan"
              description="No written rules for entry, exit, position size. Making it up as they go."
              impact="Without a plan, every decision is emotional. Consistency is impossible."
              bgColor="bg-rose-50"
              borderColor="border-rose-200"
            />

            <ReasonCard
              number="7"
              title="Chasing Hot Tips"
              description="Acting on Telegram tips, friend's suggestions, or 'insider info'. The tip giver has already bought."
              impact="By the time tip reaches retail, smart money is selling. You become the exit liquidity."
              bgColor="bg-rose-50"
              borderColor="border-rose-200"
            />

            <ReasonCard
              number="8"
              title="Survivorship Bias"
              description="Seeing only success stories on YouTube/Twitter. The 89% who lost don't post about it."
              impact="Creates false confidence. The 'trading gurus' showing profits often make more from courses than trading."
              bgColor="bg-rose-50"
              borderColor="border-rose-200"
            />

            <ReasonCard
              number="9"
              title="Insufficient Capital"
              description="Starting with Rs. 10,000-50,000, expecting to 'grow it' to lakhs. Small capital + required returns = excessive risk."
              impact="To make Rs. 50,000/month from Rs. 1 lakh, you need 50% monthly returns. That's not trading, that's gambling."
              bgColor="bg-rose-50"
              borderColor="border-rose-200"
            />

            <ReasonCard
              number="10"
              title="Treating It Like a Get-Rich-Quick Scheme"
              description="Expecting to quit job in 6 months, make lakhs from home. Trading is a skill that takes years to develop."
              impact="Unrealistic expectations lead to excessive risk-taking, which leads to account destruction."
              bgColor="bg-rose-50"
              borderColor="border-rose-200"
            />
          </div>

          {/* The Pattern of Losing Traders */}
          <div className="bg-gradient-to-r from-gray-50 to-rose-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">The Typical Losing Trader Journey</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-sm text-gray-700"><strong>Start with excitement:</strong> Open demat account, fund it with Rs. 50,000-1 lakh</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-sm text-gray-700"><strong>Initial wins:</strong> Make some money (beginner's luck or bull market), feel like a genius</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-sm text-gray-700"><strong>Increase size:</strong> Add more capital, trade bigger positions, no stop losses</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-sm text-gray-700"><strong>Big loss hits:</strong> One trade wipes out 30-50% of account in a day</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">5</span>
                </div>
                <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-sm text-gray-700"><strong>Revenge trading:</strong> Try to recover quickly, take bigger risks, lose more</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">6</span>
                </div>
                <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-sm text-gray-700"><strong>Account blown:</strong> Rs. 1-2 lakhs gone. Either quit or add more money and repeat the cycle</p>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-rose-100 rounded-lg p-3">
              <p className="text-rose-800 text-sm">
                <strong>The industry secret:</strong> Brokers love this cycle. When traders blow up and add more capital, 
                that's new revenue. They want you to keep trading, not to keep winning.
              </p>
            </div>
          </div>

          {/* India Focus Section */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-2xl p-6 mb-10 border border-orange-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.IndiaFlag className="w-6 h-6 text-orange-600" />
              <span>India Focus: The F&O Explosion</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">Why India is Worst Hit</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>India = <strong>#1 in F&O volume globally</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Weekly expiries = more gambling opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Low margin requirements attract small traders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Aggressive broker marketing on social media</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">The Numbers Are Getting Worse</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">→</span>
                    <span>FY20: Rs. 31,000 Cr losses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">→</span>
                    <span>FY22: Rs. 51,689 Cr losses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">→</span>
                    <span>More new traders = more losses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">→</span>
                    <span>SEBI considering stricter regulations</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-orange-100 rounded-xl p-4 border border-orange-300">
              <p className="text-orange-800 text-sm">
                <strong>SEBI's response:</strong> Peak margin rules, increased lot sizes, considering banning weekly expiries. 
                They're trying to protect retail investors from themselves.
              </p>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 mb-10 border border-rose-200">
            <h2 className="text-xl font-bold text-rose-900 mb-4 flex items-center gap-2">
              <Icons.Lightbulb className="w-6 h-6 text-rose-600" />
              <span>Key Takeaways</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-rose-800">
                  <strong>89% lose:</strong> SEBI's official data — this is fact, not opinion
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-rose-800">
                  <strong>Zero-sum game:</strong> Your losses are someone else's (usually institutions') profits
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-rose-800">
                  <strong>Fees stack up:</strong> Brokers, government, exchanges ALL profit from your activity
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p className="text-rose-800">
                  <strong>Not impossible:</strong> 11% DO profit — but they do everything differently
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-rose-100 rounded-xl">
                <span className="text-xl">✍️</span>
              </span>
              <span>Quick Quiz</span>
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                question="According to SEBI's 2023 study, what percentage of F&O traders made losses?"
                options={[
                  "50% — it's basically a coin flip",
                  "65% — majority lose but many win",
                  "89% — almost 9 out of 10 lose money",
                  "95% — almost everyone loses"
                ]}
                correctAnswer={2}
                explanation="SEBI's official study found that 89% of individual F&O traders made losses over a 3-year period. The average loss was Rs. 1.1 lakh per person, totaling Rs. 51,689 crore in losses by retail traders. Only 11% were profitable."
              />
              
              <QuizQuestion
                question="In the F&O market, who consistently makes money from retail trader losses?"
                options={[
                  "Only other retail traders who are smarter",
                  "FIIs, brokers, exchanges, and the government",
                  "Nobody — it's just bad luck",
                  "Only mutual funds"
                ]}
                correctAnswer={1}
                explanation="F&O is a zero-sum game where professional traders (FIIs/prop traders) made Rs. 28,000+ crore in profits. Additionally, brokers (Rs. 25,000 Cr), government (Rs. 32,000 Cr STT), and exchanges (Rs. 4,000 Cr) all made money from trading activity regardless of whether traders won or lost."
              />
              
              <QuizQuestion
                question="What is 'survivorship bias' in trading context?"
                options={[
                  "The strategy of surviving bad trades",
                  "Only seeing success stories while the 89% losers stay silent",
                  "A way to protect your portfolio",
                  "The bias towards surviving market crashes"
                ]}
                correctAnswer={1}
                explanation="Survivorship bias means you only see the winners on YouTube, Twitter, and Telegram. The 89% who lost money don't make content about their failures. This creates a false impression that trading is easy and profitable, when the reality is starkly different."
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/learn/trading-basics-lesson-5')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors w-full sm:w-auto justify-center"
            >
              <FaArrowLeft className="text-sm" />
              <span>Previous: Trading Psychology</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/trading-basics-lesson-7')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
            >
              <span>Next: Should You Trade?</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TradingBasicsLesson6;
