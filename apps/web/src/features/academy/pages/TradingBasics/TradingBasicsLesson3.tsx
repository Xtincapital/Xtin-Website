import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { moduleLabel } from "../../../../constants/learningModules";

// Custom SVG Icons
const Icons = {
  // P&L Icon
  PnL: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
      <circle cx="17" cy="17" r="1.5" fill="currentColor"/>
    </svg>
  ),

  // Profit Arrow Up
  ProfitArrow: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Loss Arrow Down
  LossArrow: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 12L12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

  // Calculator Icon
  Calculator: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
      <rect x="7" y="5" width="10" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="8" cy="13" r="1" fill="currentColor"/>
      <circle cx="12" cy="13" r="1" fill="currentColor"/>
      <circle cx="16" cy="13" r="1" fill="currentColor"/>
      <circle cx="8" cy="17" r="1" fill="currentColor"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
      <circle cx="16" cy="17" r="1" fill="currentColor"/>
    </svg>
  ),

  // Percentage Icon
  Percent: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Brokerage Icon
  Brokerage: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
      <path d="M6 15H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Tax Icon
  Tax: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4H20V20H4V4Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 8H20" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 4V20" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 12L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 12L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Clock Icon
  Clock: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Chart Icon
  Chart: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 14L10 11L13 14L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Hidden Costs Icon
  Hidden: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="16" r="1" fill="currentColor"/>
      <path d="M4 4L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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

  // Warning Icon
  Warning: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L22 20H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>
  ),

  // Breakeven Icon
  Breakeven: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // STT Icon
  STT: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 9H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 13H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 17H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
                : "border-gray-200 hover:border-yellow-300 hover:bg-yellow-50"
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

// Cost Breakdown Card
const CostCard = ({ icon: Icon, title, rate, example, color, description }) => {
  return (
    <div className={`bg-white rounded-xl p-4 border border-gray-200 shadow-sm`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500 mb-1">{description}</p>
          <p className="text-sm font-medium text-gray-700">{rate}</p>
          <p className="text-xs text-gray-400 mt-1">{example}</p>
        </div>
      </div>
    </div>
  );
};

const TradingBasicsLesson3 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-yellow-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/learn/trading-basics')}
              className="flex items-center gap-2 text-gray-500 hover:text-yellow-600 transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span>{moduleLabel("trading-basics")}</span>
            </button>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Icons.Clock className="w-4 h-4" />
              8 min read
            </span>
          </div>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full text-sm font-semibold">
                Lesson 3 of 7
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                Beginner
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-xl shadow-sm">
                <Icons.PnL className="w-7 h-7 text-yellow-600" />
              </span>
              <span>How Profit & Loss Works</span>
            </h1>
            <p className="text-lg text-gray-500">
              The math behind making (or losing) money in trading. Hidden costs that eat your profits.
            </p>
          </div>

          {/* The Hook */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-6 mb-10 border border-yellow-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <Icons.Calculator className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-900 mb-2">Trading Math is Different</h3>
                <p className="text-yellow-800">
                  "I bought at Rs. 100, sold at Rs. 105 — I made Rs. 5 profit!" Wrong. After brokerage, STT, GST, 
                  stamp duty, and other charges, your actual profit might be just Rs. 2... or even negative. 
                  Let's understand the REAL math of trading.
                </p>
              </div>
            </div>
          </div>

          {/* Basic P&L Formula */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Calculator className="w-6 h-6 text-yellow-600" />
              <span>The Basic P&L Formula</span>
            </h2>
            
            <div className="bg-gradient-to-r from-gray-50 to-yellow-50 rounded-xl p-6 mb-4">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800 mb-4">
                  Gross P&L = (Selling Price - Buying Price) × Quantity
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">Positive = Profit</span>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">Negative = Loss</span>
                </div>
              </div>
            </div>

            {/* Simple Example */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                  <Icons.ProfitArrow className="w-5 h-5" />
                  Profit Example
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>Buy: 100 shares × Rs. 500 = Rs. 50,000</li>
                  <li>Sell: 100 shares × Rs. 520 = Rs. 52,000</li>
                  <li className="font-bold pt-2 border-t border-green-200">
                    Gross Profit: Rs. 2,000 (+4%)
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                  <Icons.LossArrow className="w-5 h-5" />
                  Loss Example
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>Buy: 100 shares × Rs. 500 = Rs. 50,000</li>
                  <li>Sell: 100 shares × Rs. 480 = Rs. 48,000</li>
                  <li className="font-bold pt-2 border-t border-red-200">
                    Gross Loss: Rs. 2,000 (-4%)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Visual: The Real P&L */}
          <div className="bg-gradient-to-br from-gray-50 to-yellow-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">But Wait... The REAL P&L</h2>
            
            <svg className="w-full max-w-2xl mx-auto" viewBox="0 0 600 320" fill="none">
              {/* Title */}
              <text x="300" y="25" textAnchor="middle" fill="#1f2937" fontSize="14" fontWeight="700">
                Trading Rs. 50,000 and Making 4% "Profit"
              </text>
              
              {/* Left side - What you think */}
              <g transform="translate(50, 50)">
                <rect x="0" y="0" width="200" height="240" rx="12" fill="#dcfce7" stroke="#22c55e" strokeWidth="2"/>
                <text x="100" y="30" textAnchor="middle" fill="#166534" fontSize="12" fontWeight="700">WHAT YOU THINK</text>
                
                <rect x="20" y="50" width="160" height="60" rx="8" fill="white"/>
                <text x="100" y="75" textAnchor="middle" fill="#166534" fontSize="11">Gross Profit</text>
                <text x="100" y="95" textAnchor="middle" fill="#16a34a" fontSize="18" fontWeight="700">Rs. 2,000</text>
                
                <text x="100" y="135" textAnchor="middle" fill="#166534" fontSize="10">Simple math:</text>
                <text x="100" y="150" textAnchor="middle" fill="#166534" fontSize="10">Rs. 52,000 - Rs. 50,000</text>
                
                <text x="100" y="180" textAnchor="middle" fill="#15803d" fontSize="13" fontWeight="600">"I made 4% profit!"</text>
                
                <text x="100" y="220" textAnchor="middle" fill="#166534" fontSize="28">😊</text>
              </g>
              
              {/* Arrow */}
              <g transform="translate(260, 150)">
                <path d="M0 20 L60 20" stroke="#6b7280" strokeWidth="3" strokeDasharray="5,5"/>
                <polygon points="60,10 80,20 60,30" fill="#6b7280"/>
                <text x="40" y="50" textAnchor="middle" fill="#6b7280" fontSize="10">Reality</text>
              </g>
              
              {/* Right side - Reality */}
              <g transform="translate(350, 50)">
                <rect x="0" y="0" width="200" height="240" rx="12" fill="#fef2f2" stroke="#ef4444" strokeWidth="2"/>
                <text x="100" y="30" textAnchor="middle" fill="#991b1b" fontSize="12" fontWeight="700">WHAT ACTUALLY HAPPENS</text>
                
                <rect x="20" y="50" width="160" height="120" rx="8" fill="white"/>
                <text x="100" y="70" textAnchor="middle" fill="#991b1b" fontSize="10">Gross: Rs. 2,000</text>
                <text x="30" y="90" textAnchor="start" fill="#dc2626" fontSize="9">- Brokerage: Rs. 40</text>
                <text x="30" y="105" textAnchor="start" fill="#dc2626" fontSize="9">- STT: Rs. 52</text>
                <text x="30" y="120" textAnchor="start" fill="#dc2626" fontSize="9">- Exchange fees: Rs. 15</text>
                <text x="30" y="135" textAnchor="start" fill="#dc2626" fontSize="9">- GST: Rs. 10</text>
                <text x="30" y="150" textAnchor="start" fill="#dc2626" fontSize="9">- Stamp duty: Rs. 8</text>
                <text x="100" y="165" textAnchor="middle" fill="#dc2626" fontSize="11" fontWeight="700">Net: Rs. 1,875</text>
                
                <text x="100" y="195" textAnchor="middle" fill="#b91c1c" fontSize="12" fontWeight="600">"Actual profit: 3.75%"</text>
                <text x="100" y="210" textAnchor="middle" fill="#991b1b" fontSize="10">Lost 6.25% to charges!</text>
                
                <text x="100" y="230" textAnchor="middle" fill="#991b1b" fontSize="20">😐</text>
              </g>
            </svg>
          </div>

          {/* Hidden Costs Breakdown */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Icons.Hidden className="w-6 h-6 text-yellow-600" />
              <span>The Hidden Costs of Every Trade</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <CostCard
                icon={Icons.Brokerage}
                title="Brokerage"
                rate="Rs. 20 per order (discount) OR 0.03-0.5% (full-service)"
                example="Example: Rs. 20 × 2 (buy+sell) = Rs. 40"
                color="bg-blue-500"
                description="Fee paid to your broker"
              />

              <CostCard
                icon={Icons.STT}
                title="STT (Securities Transaction Tax)"
                rate="0.1% on sell value (equity delivery) | 0.025% (intraday)"
                example="Example: Rs. 52,000 × 0.1% = Rs. 52"
                color="bg-purple-500"
                description="Government tax on transactions"
              />

              <CostCard
                icon={Icons.Tax}
                title="Exchange Transaction Charges"
                rate="NSE: 0.00297% | BSE: 0.00275%"
                example="Example: ~Rs. 15 on Rs. 50,000 trade"
                color="bg-indigo-500"
                description="Fee to NSE/BSE for using their platform"
              />

              <CostCard
                icon={Icons.Percent}
                title="GST (18%)"
                rate="18% on brokerage + exchange charges"
                example="Example: 18% of Rs. 55 = Rs. 10"
                color="bg-pink-500"
                description="Tax on services (brokerage)"
              />

              <CostCard
                icon={Icons.STT}
                title="Stamp Duty"
                rate="0.015% (buy side only) - varies by state"
                example="Example: Rs. 50,000 × 0.015% = Rs. 7.50"
                color="bg-amber-500"
                description="State tax on transactions"
              />

              <CostCard
                icon={Icons.Rupee}
                title="SEBI Turnover Fee"
                rate="0.0001% of turnover"
                example="Example: ~Rs. 1 on Rs. 50,000"
                color="bg-teal-500"
                description="Fee to the regulator"
              />
            </div>

            <div className="mt-4 bg-red-50 rounded-xl p-4 border border-red-200">
              <p className="text-red-800 text-sm">
                <strong>Total charges typically:</strong> 0.2-0.5% per trade (round trip). On 100 trades with Rs. 50,000, 
                you could pay Rs. 10,000-25,000 in charges alone!
              </p>
            </div>
          </div>

          {/* The Breakeven Reality */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 mb-8 border border-amber-200">
            <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
              <Icons.Breakeven className="w-6 h-6 text-amber-600" />
              <span>The Breakeven Reality</span>
            </h2>
            
            <div className="bg-white rounded-xl p-5 mb-4">
              <p className="text-gray-700 mb-4">
                Because of costs, you need the stock to move a certain % just to BREAK EVEN (not profit, just not lose money):
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-amber-100">
                      <th className="text-left p-3 rounded-tl-lg">Trade Type</th>
                      <th className="text-left p-3">Typical Costs</th>
                      <th className="text-left p-3 rounded-tr-lg">Min. Move to Breakeven</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-100">
                      <td className="p-3 font-medium">Equity Delivery</td>
                      <td className="p-3">~0.2-0.3%</td>
                      <td className="p-3 text-amber-700 font-medium">Stock must rise 0.3%+</td>
                    </tr>
                    <tr className="border-t border-gray-100 bg-gray-50">
                      <td className="p-3 font-medium">Intraday Equity</td>
                      <td className="p-3">~0.05-0.1%</td>
                      <td className="p-3 text-amber-700 font-medium">Stock must rise 0.1%+</td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="p-3 font-medium">F&O (Options)</td>
                      <td className="p-3">~0.5-1%+ (varies wildly)</td>
                      <td className="p-3 text-red-700 font-medium">Option must rise 1%+ just to breakeven!</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-amber-100 rounded-lg p-3">
              <p className="text-amber-800 text-sm">
                <strong>Key Insight:</strong> In F&O trading, the bid-ask spread + high costs mean you're often 
                starting 1-2% in the RED on every trade. You need to be right AND right by a big enough margin!
              </p>
            </div>
          </div>

          {/* Net P&L Formula */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Calculator className="w-6 h-6 text-yellow-600" />
              <span>The REAL P&L Formula</span>
            </h2>
            
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
              <p className="text-center font-mono text-lg mb-4">
                Net P&L = Gross P&L - (Brokerage + STT + GST + Exchange Fees + Stamp Duty + SEBI Fees)
              </p>
              <p className="text-center text-gray-400 text-sm">
                This is what actually hits your bank account
              </p>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <h4 className="font-bold text-yellow-800 mb-2">For Winners</h4>
                <p className="text-yellow-700 text-sm">
                  Your 5% gross profit becomes ~4.5% net after costs. Plus, you'll owe taxes on profits at year-end 
                  (15% STCG if held &lt;1 year).
                </p>
              </div>

              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h4 className="font-bold text-red-800 mb-2">For Losers</h4>
                <p className="text-red-700 text-sm">
                  Your 5% gross loss becomes ~5.5% net loss. You STILL pay all the charges even when losing. 
                  Costs make losses worse.
                </p>
              </div>
            </div>
          </div>

          {/* Intraday vs Delivery Cost Comparison */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-200">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Intraday vs Delivery: Cost Comparison</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="text-left p-3">Cost Type</th>
                    <th className="text-left p-3">Intraday</th>
                    <th className="text-left p-3">Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3 font-medium">Brokerage</td>
                    <td className="p-3">Rs. 20 flat (discount broker)</td>
                    <td className="p-3">Rs. 20 flat OR 0 (many offer free)</td>
                  </tr>
                  <tr className="border-t bg-gray-50">
                    <td className="p-3 font-medium">STT</td>
                    <td className="p-3 text-blue-700">0.025% (sell side only)</td>
                    <td className="p-3 text-red-700">0.1% (both sides)</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-medium">Margin Required</td>
                    <td className="p-3 text-green-700">Only 20% (5× leverage)</td>
                    <td className="p-3">100% (full amount)</td>
                  </tr>
                  <tr className="border-t bg-gray-50">
                    <td className="p-3 font-medium">Tax on Profits</td>
                    <td className="p-3">15% STCG</td>
                    <td className="p-3">15% STCG (&lt;1yr) / 10% LTCG (&gt;1yr)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 bg-blue-100 rounded-lg p-3">
              <p className="text-blue-800 text-sm">
                <strong>The catch:</strong> Lower costs per trade in intraday, BUT you make MANY more trades. 
                20 intraday trades = 20× the costs. One delivery trade held for months = costs only once.
              </p>
            </div>
          </div>

          {/* India Focus Section */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-2xl p-6 mb-10 border border-orange-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.IndiaFlag className="w-6 h-6 text-orange-600" />
              <span>India Focus: Where Your Money Goes</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">Who Earns From Traders</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Approximate amounts earned from trading activity in FY 2023-24:
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span><strong>Rs. 32,000+ crore</strong> in STT alone</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>Brokers earned <strong>Rs. 25,000+ crore</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>Exchanges earned <strong>Rs. 4,000+ crore</strong></span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">Who Always Profits?</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Win or lose, these entities ALWAYS make money:
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Government (STT, GST, Stamp Duty)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Brokers (Brokerage on every trade)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Exchanges (Transaction charges)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">✗</span>
                    <span>89% of retail traders (LOSS)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <p className="text-red-800 text-sm">
                <strong>Sobering thought:</strong> Every time you trade, multiple parties take a cut BEFORE you 
                even know if you've made or lost money. The system is designed to extract fees from traders.
              </p>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-6 mb-10 border border-yellow-200">
            <h2 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
              <Icons.Lightbulb className="w-6 h-6 text-yellow-600" />
              <span>Key Takeaways</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-yellow-800">
                  <strong>Hidden costs:</strong> Brokerage, STT, GST, exchange fees, stamp duty eat into every trade
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-yellow-800">
                  <strong>Net vs Gross:</strong> What you see isn't what you get — always calculate NET P&L
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-yellow-800">
                  <strong>Breakeven first:</strong> You need to overcome costs before making ANY profit
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p className="text-yellow-800">
                  <strong>Frequency matters:</strong> More trades = more costs, even if each trade is "small"
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-xl">
                <span className="text-xl">✍️</span>
              </span>
              <span>Quick Quiz</span>
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                question="You buy shares worth Rs. 1,00,000 and sell at Rs. 1,05,000. Your gross profit is Rs. 5,000. What's approximately your NET profit after all charges?"
                options={[
                  "Rs. 5,000 — charges are negligible",
                  "Rs. 4,500-4,700 — about 5-10% eaten by charges",
                  "Rs. 2,500 — charges take half",
                  "Rs. 0 — charges equal the profit"
                ]}
                correctAnswer={1}
                explanation="For equity delivery, costs are typically 0.2-0.5% of the trade value. On a Rs. 1 lakh trade, that's Rs. 200-500 in costs. So your Rs. 5,000 gross profit becomes approximately Rs. 4,500-4,700 net — about 5-10% of your profit goes to charges."
              />
              
              <QuizQuestion
                question="Who ALWAYS makes money from trading, regardless of whether traders profit or lose?"
                options={[
                  "Retail traders who use stop-losses",
                  "The government, brokers, and exchanges",
                  "Only professional traders",
                  "Nobody — it's a fair game"
                ]}
                correctAnswer={1}
                explanation="The government (via STT, GST, stamp duty), brokers (via brokerage), and exchanges (via transaction fees) make money on EVERY trade, win or lose. They don't care about your P&L — they get paid regardless. That's why 89% of traders lose while these entities always profit."
              />
              
              <QuizQuestion
                question="Why do frequent traders (like scalpers) face a bigger cost problem than long-term investors?"
                options={[
                  "They pay higher brokerage per trade",
                  "They face more taxes",
                  "Costs add up with every trade — 100 trades = 100× the costs",
                  "They use more expensive brokers"
                ]}
                correctAnswer={2}
                explanation="Each trade has fixed costs (brokerage, fees, etc.). A scalper making 50 trades/day pays 50× the costs of someone making 1 trade. Even if individual costs are 'small', they compound rapidly. This is why high-frequency trading requires much higher win rates just to stay profitable."
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/learn/trading-basics-lesson-2')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors w-full sm:w-auto justify-center"
            >
              <FaArrowLeft className="text-sm" />
              <span>Previous: Types of Trading</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/trading-basics-lesson-4')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white rounded-xl transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
            >
              <span>Next: Risk & Stop Loss</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TradingBasicsLesson3;
