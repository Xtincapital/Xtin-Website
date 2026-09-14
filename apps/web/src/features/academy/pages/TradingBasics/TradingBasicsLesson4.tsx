import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// Custom SVG Icons
const Icons = {
  // Risk/Warning Icon
  Risk: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L22 20H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>
  ),

  // Stop Loss Icon (Shield with X)
  StopLoss: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 12L12 15L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Target Icon
  Target: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  ),

  // Risk-Reward Icon (Scale/Balance)
  RiskReward: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 8L12 3L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="3" y="8" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="13" y="13" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="2"/>
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

  // Dollar Loss Icon
  Loss: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 8L16 16M8 16L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Chart Down Icon
  ChartDown: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 10L10 13L13 10L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 10V14H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

  // Position Size Icon
  PositionSize: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="14" width="7" height="18" rx="1" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Brain/Psychology Icon
  Brain: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3C8 3 5 6 5 10C5 11 5.5 12 6 12.5C5 13 4 14 4 15.5C4 17.5 5.5 19 7.5 19C8 19 8.5 18.9 9 18.7C9.5 20 11 21 12.5 21C14.5 21 16 19.5 16 17.5C16 17 15.9 16.5 15.7 16C17 15.5 18 14.5 18 13C18 11.5 17 10.5 15.5 10C16 9.5 16 8.5 16 8C16 5 14 3 12 3Z" stroke="currentColor" strokeWidth="2"/>
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

  // Checklist Icon
  Checklist: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
                : "border-gray-200 hover:border-red-300 hover:bg-red-50"
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

// Risk Type Card
const RiskCard = ({ icon: Icon, title, description, examples, severity }) => {
  const severityColors = {
    critical: "border-red-500 bg-red-50",
    high: "border-orange-500 bg-orange-50",
    medium: "border-yellow-500 bg-yellow-50"
  };

  return (
    <div className={`rounded-xl p-5 border-2 ${severityColors[severity]}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 ${severity === 'critical' ? 'bg-red-500' : severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-700 mt-1">{description}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg p-3 text-sm text-gray-600">
        <p className="font-medium text-gray-800 mb-1">Examples:</p>
        <ul className="space-y-1">
          {examples.map((ex, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>{ex}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const TradingBasicsLesson4 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-red-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/learn/trading-basics')}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span>Module 4: Trading Basics</span>
            </button>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Icons.Clock className="w-4 h-4" />
              10 min read
            </span>
          </div>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-full text-sm font-semibold">
                Lesson 4 of 7
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                Critical
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-100 to-rose-200 rounded-xl shadow-sm">
                <Icons.StopLoss className="w-7 h-7 text-red-600" />
              </span>
              <span>Risk & Stop Loss</span>
            </h1>
            <p className="text-lg text-gray-500">
              The MOST important lesson in trading. Your survival depends on managing risk properly.
            </p>
          </div>

          {/* The Hook */}
          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 mb-10 border-2 border-red-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <Icons.Risk className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-900 mb-2">One Big Loss Can Wipe Out Months of Profit</h3>
                <p className="text-red-800">
                  You can be right 9 out of 10 times, make small profits each time. Then lose it all (and more) 
                  on the 10th trade because you didn't use a stop loss. Risk management isn't optional — 
                  it's the difference between surviving and blowing up your account.
                </p>
              </div>
            </div>
          </div>

          {/* Visual: The Math of Losses */}
          <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">The Scary Math of Losses</h2>
            
            <svg className="w-full max-w-2xl mx-auto mb-4" viewBox="0 0 600 280" fill="none">
              <text x="300" y="25" textAnchor="middle" fill="#1f2937" fontSize="13" fontWeight="700">
                How Much Gain You Need to Recover from a Loss
              </text>
              
              {/* Left bars - Losses */}
              <g transform="translate(50, 50)">
                <text x="0" y="15" fill="#991b1b" fontSize="12" fontWeight="600">Loss</text>
                
                <rect x="0" y="25" width="40" height="30" rx="4" fill="#fee2e2"/>
                <text x="20" y="47" textAnchor="middle" fill="#991b1b" fontSize="11" fontWeight="600">10%</text>
                
                <rect x="0" y="65" width="60" height="30" rx="4" fill="#fecaca"/>
                <text x="30" y="87" textAnchor="middle" fill="#991b1b" fontSize="11" fontWeight="600">20%</text>
                
                <rect x="0" y="105" width="90" height="30" rx="4" fill="#fca5a5"/>
                <text x="45" y="127" textAnchor="middle" fill="#991b1b" fontSize="11" fontWeight="600">30%</text>
                
                <rect x="0" y="145" width="120" height="30" rx="4" fill="#f87171"/>
                <text x="60" y="167" textAnchor="middle" fill="#7f1d1d" fontSize="11" fontWeight="600">50%</text>
                
                <rect x="0" y="185" width="150" height="30" rx="4" fill="#dc2626"/>
                <text x="75" y="207" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">75%</text>
              </g>
              
              {/* Arrow */}
              <g transform="translate(220, 140)">
                <path d="M0 0 L60 0" stroke="#6b7280" strokeWidth="3"/>
                <polygon points="60,-8 80,0 60,8" fill="#6b7280"/>
                <text x="40" y="-15" textAnchor="middle" fill="#6b7280" fontSize="10" fontWeight="600">Needs</text>
              </g>
              
              {/* Right bars - Required gains */}
              <g transform="translate(310, 50)">
                <text x="0" y="15" fill="#166534" fontSize="12" fontWeight="600">Gain Needed</text>
                
                <rect x="0" y="25" width="45" height="30" rx="4" fill="#dcfce7"/>
                <text x="22" y="47" textAnchor="middle" fill="#166534" fontSize="11" fontWeight="600">11%</text>
                
                <rect x="0" y="65" width="70" height="30" rx="4" fill="#bbf7d0"/>
                <text x="35" y="87" textAnchor="middle" fill="#166534" fontSize="11" fontWeight="600">25%</text>
                
                <rect x="0" y="105" width="120" height="30" rx="4" fill="#86efac"/>
                <text x="60" y="127" textAnchor="middle" fill="#166534" fontSize="11" fontWeight="600">43%</text>
                
                <rect x="0" y="145" width="200" height="30" rx="4" fill="#4ade80"/>
                <text x="100" y="167" textAnchor="middle" fill="#052e16" fontSize="11" fontWeight="600">100%</text>
                
                <rect x="0" y="185" width="270" height="30" rx="4" fill="#16a34a"/>
                <text x="135" y="207" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">300%</text>
              </g>
              
              <text x="300" y="260" textAnchor="middle" fill="#991b1b" fontSize="11" fontWeight="600">
                A 50% loss needs 100% gain just to break even!
              </text>
            </svg>

            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-sm text-gray-600 mb-1">Lose 10%</p>
                <p className="text-lg font-bold text-red-600">Need +11%</p>
                <p className="text-xs text-gray-500">to recover</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-sm text-gray-600 mb-1">Lose 50%</p>
                <p className="text-lg font-bold text-red-600">Need +100%</p>
                <p className="text-xs text-gray-500">to recover</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-sm text-gray-600 mb-1">Lose 75%</p>
                <p className="text-lg font-bold text-red-600">Need +300%</p>
                <p className="text-xs text-gray-500">to recover</p>
              </div>
            </div>
          </div>

          {/* What is a Stop Loss */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Icons.StopLoss className="w-6 h-6 text-red-600" />
              <span>What is a Stop Loss?</span>
            </h2>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
              <p className="text-gray-700 mb-4">
                A <strong>stop loss</strong> is a pre-decided price at which you will EXIT a losing trade, no matter what. 
                It's your emergency exit. It limits your maximum loss on any single trade.
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-3">Example:</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-gray-600 mb-2"><strong>You buy:</strong> Reliance at Rs. 2,500</p>
                    <p className="text-gray-600 mb-2"><strong>Stop Loss:</strong> Rs. 2,450 (2% down)</p>
                    <p className="text-red-700 font-medium">If price hits Rs. 2,450 → Auto-exit</p>
                    <p className="text-gray-500 text-xs mt-2">Max loss: Rs. 50 per share</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-gray-600 mb-2"><strong>Without stop loss:</strong></p>
                    <p className="text-gray-600 mb-2">Price falls to Rs. 2,200</p>
                    <p className="text-red-700 font-medium">Loss: Rs. 300 per share (12%)</p>
                    <p className="text-gray-500 text-xs mt-2">6× bigger loss!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
              <p className="text-red-800 text-sm">
                <strong>Critical Rule:</strong> ALWAYS set a stop loss BEFORE entering a trade. Never enter without knowing 
                your exit point for losses. Hope is not a strategy.
              </p>
            </div>
          </div>

          {/* Types of Risk */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Three Types of Risk You Must Manage</h2>

            <div className="space-y-4">
              <RiskCard
                icon={Icons.Loss}
                title="1. Trade-Level Risk"
                description="How much you're willing to lose on ONE trade"
                examples={[
                  "Maximum 1-2% of capital per trade",
                  "Example: Rs. 1L capital → Max Rs. 1,000-2,000 risk per trade",
                  "Set stop loss to limit this risk"
                ]}
                severity="critical"
              />

              <RiskCard
                icon={Icons.PositionSize}
                title="2. Position Sizing Risk"
                description="How much capital to allocate to each trade"
                examples={[
                  "Never put all money in one trade",
                  "Example: Rs. 1L capital → Use max Rs. 20-30K per position",
                  "Diversify across 4-5 positions if holding multiple"
                ]}
                severity="high"
              />

              <RiskCard
                icon={Icons.ChartDown}
                title="3. Account-Level Risk"
                description="Maximum drawdown (loss from peak) you can handle"
                examples={[
                  "Set a monthly/weekly loss limit",
                  "Example: If down 10% for the month → STOP trading",
                  "Prevents catastrophic losses from revenge trading"
                ]}
                severity="critical"
              />
            </div>
          </div>

          {/* The 2% Rule */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 border-2 border-green-300">
            <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
              <Icons.Checklist className="w-6 h-6 text-green-600" />
              <span>The Golden 2% Rule</span>
            </h2>
            
            <div className="bg-white rounded-xl p-5 mb-4">
              <p className="text-gray-700 mb-4">
                <strong>Never risk more than 2% of your trading capital on a single trade.</strong>
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2">Why 2%?</h4>
                  <ul className="space-y-2 text-green-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>You can survive 50 consecutive losses (unlikely!)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Gives room for learning without blowing up</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Reduces emotional stress on each trade</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-2">Example Calculation:</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>Capital: <strong>Rs. 1,00,000</strong></li>
                    <li>2% Risk: <strong>Rs. 2,000</strong></li>
                    <li>Buy: Rs. 500 per share</li>
                    <li>Stop Loss: Rs. 490 (Rs. 10 risk/share)</li>
                    <li className="font-bold pt-2 border-t border-blue-200">
                      Max shares: 2000 ÷ 10 = 200 shares
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-100 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                <strong>Pro Tip:</strong> Conservative traders use 1% risk. Aggressive might use 3-5%, but this significantly 
                increases the chance of large drawdowns. Start with 1-2% until you're consistently profitable.
              </p>
            </div>
          </div>

          {/* Risk-Reward Ratio */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.RiskReward className="w-6 h-6 text-red-600" />
              <span>Risk-Reward Ratio</span>
            </h2>
            
            <p className="text-gray-700 mb-4">
              For every rupee you risk, how much do you aim to make? This is your <strong>Risk:Reward ratio</strong>.
            </p>

            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-5 text-white mb-4">
              <p className="text-center font-mono text-lg mb-2">
                Risk:Reward Ratio = Potential Profit ÷ Potential Loss
              </p>
              <p className="text-center text-gray-400 text-sm">
                Aim for at least 1:2 (risk Rs. 1 to make Rs. 2)
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-red-50 rounded-xl p-4 border border-red-200 text-center">
                <p className="text-sm text-gray-600 mb-2">Bad Trade</p>
                <p className="text-2xl font-bold text-red-600">1:1</p>
                <p className="text-xs text-gray-500 mt-1">Risk Rs. 100 to make Rs. 100</p>
                <p className="text-xs text-red-600 mt-2">Need 50%+ win rate</p>
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 text-center">
                <p className="text-sm text-gray-600 mb-2">Okay Trade</p>
                <p className="text-2xl font-bold text-yellow-600">1:2</p>
                <p className="text-xs text-gray-500 mt-1">Risk Rs. 100 to make Rs. 200</p>
                <p className="text-xs text-yellow-600 mt-2">Need 33%+ win rate</p>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
                <p className="text-sm text-gray-600 mb-2">Good Trade</p>
                <p className="text-2xl font-bold text-green-600">1:3</p>
                <p className="text-xs text-gray-500 mt-1">Risk Rs. 100 to make Rs. 300</p>
                <p className="text-xs text-green-600 mt-2">Need 25%+ win rate</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2">Real Example:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Entry: Rs. 500</p>
                <p>• Stop Loss: Rs. 490 (Risk: Rs. 10)</p>
                <p>• Target: Rs. 520 (Reward: Rs. 20)</p>
                <p className="font-bold pt-2">Risk:Reward = 10:20 = 1:2 ✓ Good!</p>
              </div>
            </div>
          </div>

          {/* Common Stop Loss Mistakes */}
          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 mb-8 border-2 border-red-200">
            <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
              <Icons.Warning className="w-6 h-6 text-red-600" />
              <span>Common Stop Loss Mistakes (Avoid These!)</span>
            </h2>
            
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-4 border-l-4 border-red-500">
                <h4 className="font-bold text-red-800 mb-1">1. Moving Stop Loss Further Away</h4>
                <p className="text-sm text-red-700">
                  Price approaching your stop? DON'T move it lower to "give it more room". You're just increasing your loss. 
                  Stick to the plan.
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border-l-4 border-red-500">
                <h4 className="font-bold text-red-800 mb-1">2. Removing Stop Loss After Entering</h4>
                <p className="text-sm text-red-700">
                  "Let me cancel the SL and watch manually" — Famous last words. You'll hesitate, hope it recovers, 
                  and watch small losses become big disasters.
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border-l-4 border-red-500">
                <h4 className="font-bold text-red-800 mb-1">3. Setting Stop Loss Too Tight</h4>
                <p className="text-sm text-red-700">
                  0.5% stop loss in a volatile stock = guaranteed stop-out due to normal fluctuations. 
                  Give reasonable breathing room based on the stock's volatility.
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border-l-4 border-red-500">
                <h4 className="font-bold text-red-800 mb-1">4. Not Using Stop Loss at All</h4>
                <p className="text-sm text-red-700">
                  "I'll watch it and exit manually if needed" — You won't. Emotions take over. You'll keep hoping. 
                  Always use automated stop losses.
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border-l-4 border-red-500">
                <h4 className="font-bold text-red-800 mb-1">5. Revenge Trading After Stop Loss Hit</h4>
                <p className="text-sm text-red-700">
                  Stop loss hit → Angry → Take bigger position to "recover fast" → Bigger loss. 
                  Stop losses are normal. Don't take them personally.
                </p>
              </div>
            </div>
          </div>

          {/* India Focus Section */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-2xl p-6 mb-10 border border-orange-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.IndiaFlag className="w-6 h-6 text-orange-600" />
              <span>India Focus: Why Most Indian Traders Ignore Stop Losses</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">Common Excuses</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✗</span>
                    <span>"Stop losses get triggered by market makers"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✗</span>
                    <span>"I'll average down if it falls"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✗</span>
                    <span>"It always recovers eventually"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✗</span>
                    <span>"I have a 'mental' stop loss"</span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h4 className="font-bold text-red-800 mb-2">The Reality (SEBI Data)</h4>
                <ul className="space-y-2 text-sm text-red-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">→</span>
                    <span>89% of traders lose money</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">→</span>
                    <span>Most wipe out in 1-2 big losing trades</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">→</span>
                    <span>Common pattern: Many small wins, ONE huge loss</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">→</span>
                    <span>Professional traders ALWAYS use stop losses</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-orange-100 rounded-xl p-4 border border-orange-300">
              <p className="text-orange-800 text-sm">
                <strong>The 11% who profit consistently:</strong> They ALL use stop losses religiously. 
                They treat trading as risk management first, profits second. This is not optional for survival.
              </p>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 mb-10 border border-red-200">
            <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
              <Icons.Lightbulb className="w-6 h-6 text-red-600" />
              <span>Key Takeaways</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-red-800">
                  <strong>Always use stop losses:</strong> Set them BEFORE entering, never move them wider
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-red-800">
                  <strong>2% Rule:</strong> Never risk more than 2% of capital on one trade
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-red-800">
                  <strong>Risk:Reward:</strong> Aim for at least 1:2 ratio on every trade
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p className="text-red-800">
                  <strong>Big losses compound:</strong> A 50% loss needs 100% gain just to break even
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-red-100 rounded-xl">
                <span className="text-xl">✍️</span>
              </span>
              <span>Quick Quiz</span>
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                question="You have Rs. 1,00,000 capital and follow the 2% rule. What's the maximum you should risk on one trade?"
                options={[
                  "Rs. 10,000 — need significant position",
                  "Rs. 5,000 — balance risk and reward",
                  "Rs. 2,000 — that's 2% of capital",
                  "Rs. 500 — be extra conservative"
                ]}
                correctAnswer={2}
                explanation="2% of Rs. 1,00,000 = Rs. 2,000. This is your MAXIMUM risk per trade. This doesn't mean you invest only Rs. 2,000 — it means your stop loss should limit your loss to Rs. 2,000. You might buy Rs. 50,000 worth of stock with a stop loss that risks Rs. 2,000."
              />
              
              <QuizQuestion
                question="If you lose 50% of your capital, what percentage gain do you need just to get back to break-even?"
                options={[
                  "50% — same amount",
                  "75% — a bit more",
                  "100% — double what you have left",
                  "150% — more than double"
                ]}
                correctAnswer={2}
                explanation="If you start with Rs. 100 and lose 50%, you have Rs. 50 left. To get back to Rs. 100, you need to gain Rs. 50 on your Rs. 50 base — that's a 100% gain (50/50). This is why preventing big losses is critical!"
              />
              
              <QuizQuestion
                question="What's the BEST reason to use a stop loss?"
                options={[
                  "To avoid broker fees on losing trades",
                  "To limit maximum loss and protect capital for future trades",
                  "Because SEBI requires it",
                  "To automatically exit at profit"
                ]}
                correctAnswer={1}
                explanation="Stop losses protect your capital by limiting your maximum loss on any single trade. One big loss can wipe out many profitable trades. By using stop losses, you ensure you live to trade another day. Capital preservation is the #1 rule of trading."
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/learn/trading-basics-lesson-3')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors w-full sm:w-auto justify-center"
            >
              <FaArrowLeft className="text-sm" />
              <span>Previous: How Profit & Loss Works</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/trading-basics-lesson-5')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
            >
              <span>Next: Trading Psychology</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TradingBasicsLesson4;
