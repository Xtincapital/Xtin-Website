import React, { useState } from "react";
import StudyShell from "../../components/StudyShell";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { moduleLabel } from "../../../../constants/learningModules";

// Custom SVG Icons
const Icons = {
  // Trading Icon (Lightning)
  Trading: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Investing Icon (Plant/Growth)
  Investing: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 12C12 12 12 8 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 12C12 12 12 8 16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 8C12 8 12 5 9 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 8C12 8 12 5 15 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 22H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Clock Icon
  Clock: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Calendar Icon
  Calendar: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Chart Up Icon
  ChartUp: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 7H21V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Chart Volatile Icon
  ChartVolatile: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12L6 8L9 14L12 6L15 16L18 10L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

  // Target Icon
  Target: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
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

  // Question Icon
  Question: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.3062 14.1652 11.4175 13 11.8293V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>
  ),

  // Check Icon
  Check: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Cross Icon
  Cross: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Screen/Monitor Icon
  Screen: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Relax/Coffee Icon
  Relax: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 8H18C19.6569 8 21 9.34315 21 11C21 12.6569 19.6569 14 18 14H17" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 8H17V15C17 17.7614 14.7614 20 12 20H8C5.23858 20 3 17.7614 3 15V8Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M6 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
                  ? "border-brand bg-brand-soft"
                  : index === selected
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-gray-50"
                : "border-gray-200 hover:border-amber-300 hover:bg-amber-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={showResult && index === correctAnswer ? "text-brand font-medium" : showResult && index === selected ? "text-red-700" : "text-gray-700"}>
                {option}
              </span>
              {showResult && index === correctAnswer && (
                <FaCheckCircle className="text-brand" />
              )}
              {showResult && index === selected && index !== correctAnswer && (
                <FaTimesCircle className="text-red-500" />
              )}
            </div>
          </button>
        ))}
      </div>
      {showResult && (
        <div className={`mt-4 p-4 rounded-xl ${isCorrect ? "bg-brand-soft text-brand" : "bg-amber-100 text-amber-800"}`}>
          <p className="font-medium">{isCorrect ? "Correct!" : "Not quite!"}</p>
          <p className="text-sm mt-1">{explanation}</p>
        </div>
      )}
    </div>
  );
};

const TradingBasicsLesson1 = () => {
  const navigate = useNavigate();

  return (
    <StudyShell module="TradingBasics" lessonNumber={1}>

      <div>
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/learn/trading-basics')}
              className="flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span>{moduleLabel("trading-basics")}</span>
            </button>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Icons.Clock className="w-4 h-4" />
              7 min read
            </span>
          </div>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-white rounded-full text-sm font-semibold bg-brand-fill">
                Lesson 1 of 7
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                Beginner
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-1">
                <Icons.Warning className="w-3 h-3" />
                Awareness
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl shadow-sm">
                <Icons.Trading className="w-7 h-7 text-amber-600" />
              </span>
              <span>What is Trading?</span>
            </h1>
            <p className="text-lg text-gray-500">
              Understanding trading vs investing — and why the difference matters for your money.
            </p>
          </div>

          {/* Important Warning */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 mb-10 border-2 border-red-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icons.Warning className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Awareness, Not Advice</h3>
                <p className="text-red-800">
                  This lesson teaches you what trading IS — not how to do it. SEBI data shows 89% of traders lose money. 
                  We want you to understand trading fully before you ever consider risking real money.
                </p>
              </div>
            </div>
          </div>

          {/* The Hook */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-10 border border-amber-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <Icons.Question className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">"My Friend Made Rs. 50,000 in One Day!"</h3>
                <p className="text-amber-800">
                  You've heard the stories — someone made lakhs trading stocks. What they don't tell you: 
                  most traders lose money. Before you get tempted by quick profits, understand what trading 
                  actually is and how it's completely different from investing.
                </p>
              </div>
            </div>
          </div>

          {/* Simple Definition */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Lightbulb className="w-6 h-6 text-amber-600" />
              <span>Trading in Simple Words</span>
            </h2>
            
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 mb-4">
              <p className="text-lg text-amber-900 font-medium text-center">
                <strong>Trading</strong> = Buying and selling stocks (or other assets) <strong>frequently</strong> to profit from <strong>short-term price changes</strong>
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 mb-2">Think of it like:</h4>
                <p className="text-gray-700 text-sm">
                  Buying vegetables at Rs. 50/kg in the morning and selling at Rs. 55/kg in the evening. 
                  You don't want to keep the vegetables — you want to profit from the price difference.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 mb-2">Key point:</h4>
                <p className="text-gray-700 text-sm">
                  Traders don't care about the company's long-term future. They care about 
                  what the stock price will do TODAY, this WEEK, or this MONTH.
                </p>
              </div>
            </div>
          </div>

          {/* Visual: Trading vs Investing */}
          <div className="bg-gradient-to-br from-gray-50 to-amber-50 rounded-2xl p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Trading vs Investing: The Core Difference</h2>
            
            <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 350" fill="none">
              {/* Investing Side */}
              <g transform="translate(30, 30)">
                <rect x="0" y="0" width="280" height="280" rx="16" fill="#F0FDF4" stroke="#16A34A" strokeWidth="3"/>
                <text x="140" y="35" textAnchor="middle" fill="#16A34A" fontSize="18" fontWeight="700">INVESTING</text>
                <text x="140" y="55" textAnchor="middle" fill="#16A34A" fontSize="11">"I own a piece of this company"</text>
                
                {/* Growing tree visualization */}
                <g transform="translate(90, 80)">
                  <rect x="45" y="120" width="12" height="50" fill="#654B26"/>
                  <ellipse cx="51" cy="90" rx="45" ry="40" fill="#16A34A"/>
                  <ellipse cx="35" cy="105" rx="25" ry="22" fill="#16A34A"/>
                  <ellipse cx="67" cy="105" rx="25" ry="22" fill="#16A34A"/>
                  <text x="51" y="95" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">5-20</text>
                  <text x="51" y="108" textAnchor="middle" fill="white" fontSize="9">YEARS</text>
                </g>
                
                {/* Key points */}
                <g transform="translate(20, 210)">
                  <circle cx="8" cy="8" r="4" fill="#16A34A"/>
                  <text x="20" y="12" fill="#16A34A" fontSize="10">Buy & hold for years</text>
                  <circle cx="8" cy="28" r="4" fill="#16A34A"/>
                  <text x="20" y="32" fill="#16A34A" fontSize="10">Focus on company growth</text>
                  <circle cx="8" cy="48" r="4" fill="#16A34A"/>
                  <text x="20" y="52" fill="#16A34A" fontSize="10">Less time, less stress</text>
                </g>
              </g>

              {/* VS Circle */}
              <g transform="translate(320, 140)">
                <circle cx="30" cy="30" r="28" fill="#EEEEF1" stroke="#CFD0D3" strokeWidth="3"/>
                <text x="30" y="36" textAnchor="middle" fill="#373A41" fontSize="14" fontWeight="700">VS</text>
              </g>

              {/* Trading Side */}
              <g transform="translate(390, 30)">
                <rect x="0" y="0" width="280" height="280" rx="16" fill="#F6ECCE" stroke="#B8923F" strokeWidth="3"/>
                <text x="140" y="35" textAnchor="middle" fill="#654B26" fontSize="18" fontWeight="700">TRADING</text>
                <text x="140" y="55" textAnchor="middle" fill="#7C5D2B" fontSize="11">"I want to profit from price moves"</text>
                
                {/* Volatile chart visualization */}
                <g transform="translate(20, 75)">
                  <rect x="0" y="0" width="240" height="120" rx="8" fill="white" stroke="#E2C273" strokeWidth="2"/>
                  <path d="M20 80 L50 50 L80 70 L110 30 L140 60 L170 25 L200 45 L220 35" stroke="#B8923F" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  
                  {/* Buy/Sell markers */}
                  <circle cx="50" cy="50" r="6" fill="#16A34A"/>
                  <text x="50" y="45" textAnchor="middle" fill="#16A34A" fontSize="8" fontWeight="bold">BUY</text>
                  <circle cx="110" cy="30" r="6" fill="#E04848"/>
                  <text x="110" y="25" textAnchor="middle" fill="#E04848" fontSize="8" fontWeight="bold">SELL</text>
                  <circle cx="140" cy="60" r="6" fill="#16A34A"/>
                  <text x="140" y="75" textAnchor="middle" fill="#16A34A" fontSize="8" fontWeight="bold">BUY</text>
                  <circle cx="200" cy="45" r="6" fill="#E04848"/>
                  <text x="200" y="40" textAnchor="middle" fill="#E04848" fontSize="8" fontWeight="bold">SELL</text>
                  
                  <text x="120" y="110" textAnchor="middle" fill="#654B26" fontSize="9">Minutes to Weeks</text>
                </g>
                
                {/* Key points */}
                <g transform="translate(20, 210)">
                  <circle cx="8" cy="8" r="4" fill="#B8923F"/>
                  <text x="20" y="12" fill="#654B26" fontSize="10">Buy & sell frequently</text>
                  <circle cx="8" cy="28" r="4" fill="#B8923F"/>
                  <text x="20" y="32" fill="#654B26" fontSize="10">Focus on price movement</text>
                  <circle cx="8" cy="48" r="4" fill="#B8923F"/>
                  <text x="20" y="52" fill="#654B26" fontSize="10">More time, more stress</text>
                </g>
              </g>

              {/* Bottom comparison */}
              <g transform="translate(30, 320)">
                <text x="350" y="15" textAnchor="middle" fill="#717680" fontSize="11" fontStyle="italic">
                  Same stock market, completely different approaches and mindsets
                </text>
              </g>
            </svg>
          </div>

          {/* Detailed Comparison Table */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Target className="w-6 h-6 text-amber-600" />
              <span>Side-by-Side Comparison</span>
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-3 bg-gray-50 rounded-tl-lg font-semibold text-gray-700">Aspect</th>
                    <th className="text-left p-3 bg-brand-soft">
                      <span className="flex items-center gap-2 text-brand font-semibold">
                        <Icons.Investing className="w-5 h-5" />
                        Investing
                      </span>
                    </th>
                    <th className="text-left p-3 bg-amber-50 rounded-tr-lg">
                      <span className="flex items-center gap-2 text-amber-700 font-semibold">
                        <Icons.Trading className="w-5 h-5" />
                        Trading
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium text-gray-700">Holding Period</td>
                    <td className="p-3 text-brand">Years to decades</td>
                    <td className="p-3 text-amber-700">Minutes to months</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50/50">
                    <td className="p-3 font-medium text-gray-700">Primary Goal</td>
                    <td className="p-3 text-brand">Build long-term wealth</td>
                    <td className="p-3 text-amber-700">Profit from price swings</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium text-gray-700">Decision Basis</td>
                    <td className="p-3 text-brand">Company fundamentals</td>
                    <td className="p-3 text-amber-700">Price charts & patterns</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50/50">
                    <td className="p-3 font-medium text-gray-700">Time Required</td>
                    <td className="p-3 text-brand">Few hours per month</td>
                    <td className="p-3 text-amber-700">Several hours daily</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium text-gray-700">Emotional Stress</td>
                    <td className="p-3 text-brand">Low to moderate</td>
                    <td className="p-3 text-amber-700">High (requires discipline)</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50/50">
                    <td className="p-3 font-medium text-gray-700">Success Rate</td>
                    <td className="p-3 text-brand">Higher (12-14% CAGR historically)</td>
                    <td className="p-3 text-amber-700">Lower (89% lose money)</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium text-gray-700">Best For</td>
                    <td className="p-3 text-brand">Most people</td>
                    <td className="p-3 text-amber-700">Full-time professionals</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Real Example */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Same Stock, Different Approaches</h2>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-gray-800 font-medium mb-2">Let's say Reliance stock is at Rs. 2,500 today:</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-brand-soft rounded-xl p-4 border border-brand-line">
                <div className="flex items-center gap-2 mb-3">
                  <Icons.Investing className="w-5 h-5 text-brand" />
                  <h4 className="font-bold text-brand">Investor's Thinking</h4>
                </div>
                <ul className="space-y-2 text-sm text-brand">
                  <li>"Reliance is expanding into green energy and retail"</li>
                  <li>"The company has strong fundamentals"</li>
                  <li>"I'll hold for 5-10 years and let it grow"</li>
                  <li>"Daily price changes don't bother me"</li>
                </ul>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <Icons.Trading className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-amber-800">Trader's Thinking</h4>
                </div>
                <ul className="space-y-2 text-sm text-amber-700">
                  <li>"The chart shows support at Rs. 2,480"</li>
                  <li>"I'll buy now and sell at Rs. 2,550"</li>
                  <li>"Target: Rs. 50 profit per share today"</li>
                  <li>"If it drops to Rs. 2,470, I'll exit with a loss"</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Why People Are Attracted to Trading */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 mb-6 border border-amber-200">
            <h2 className="text-xl font-semibold text-amber-900 mb-4 flex items-center gap-2">
              <Icons.ChartVolatile className="w-6 h-6 text-amber-600" />
              <span>Why Trading Looks Attractive</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 border border-amber-200">
                <h4 className="font-bold text-amber-800 mb-2">The Promise:</h4>
                <ul className="space-y-1 text-sm text-amber-700">
                  <li>• Quick money in days/weeks</li>
                  <li>• No need to wait years</li>
                  <li>• Exciting, fast-paced</li>
                  <li>• Stories of people getting rich</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 border border-red-200">
                <h4 className="font-bold text-red-800 mb-2">The Reality:</h4>
                <ul className="space-y-1 text-sm text-red-700">
                  <li>• 89% of traders lose money</li>
                  <li>• Requires hours of daily work</li>
                  <li>• Extremely stressful</li>
                  <li>• Most "success stories" are fake or rare</li>
                </ul>
              </div>
            </div>

            <div className="bg-red-100 rounded-xl p-4 border border-red-200">
              <p className="text-red-800 text-sm">
                <strong>Think About It:</strong> If making money through trading were easy, why would anyone 
                work a 9-to-5 job? The people selling trading courses make money from SELLING courses — not from trading.
              </p>
            </div>
          </div>

          {/* India Focus Section */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-2xl p-6 mb-10 border border-orange-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.IndiaFlag className="w-6 h-6 text-orange-600" />
              <span>India Focus: Trading Statistics</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 border border-red-200 text-center">
                <p className="text-3xl font-bold text-red-600 mb-1">89%</p>
                <p className="text-gray-600 text-sm">F&O traders lost money in FY22-23</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-red-200 text-center">
                <p className="text-3xl font-bold text-red-600 mb-1">Rs. 1.1L</p>
                <p className="text-gray-600 text-sm">Average loss per trader</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-red-200 text-center">
                <p className="text-3xl font-bold text-red-600 mb-1">Rs. 52,000 Cr</p>
                <p className="text-gray-600 text-sm">Total retail trading losses</p>
              </div>
            </div>

            <div className="bg-brand-soft rounded-xl p-4 border border-brand-line">
              <p className="text-brand text-sm">
                <strong>Meanwhile:</strong> Investors who simply held Nifty 50 index funds for 10+ years 
                earned 12-14% annual returns — beating most traders without any stress or daily effort.
              </p>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-10 border border-amber-200">
            <h2 className="text-xl font-semibold text-amber-900 mb-4 flex items-center gap-2">
              <Icons.Lightbulb className="w-6 h-6 text-amber-600" />
              <span>Key Takeaways</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-amber-800">
                  <strong>Trading ≠ Investing</strong> — They're completely different activities
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-amber-800">
                  <strong>Trading is short-term</strong> — Buying/selling within days or weeks
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-amber-800">
                  <strong>89% of traders lose money</strong> — This is not easy money
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p className="text-amber-800">
                  <strong>Investing is safer</strong> — For most people, long-term investing is better
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-amber-100 rounded-xl">
                <span className="text-xl">✍️</span>
              </span>
              <span>Quick Quiz</span>
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                question="What is the main goal of trading?"
                options={[
                  "Building wealth over decades through company ownership",
                  "Profiting from short-term price movements",
                  "Receiving dividends from companies",
                  "Avoiding all risk in the stock market"
                ]}
                correctAnswer={1}
                explanation="Trading focuses on profiting from short-term price movements — buying low and selling high within days, weeks, or months. Traders don't care about long-term company growth; they care about immediate price changes."
              />
              
              <QuizQuestion
                question="According to SEBI data, what percentage of F&O traders lost money in FY22-23?"
                options={[
                  "About 30%",
                  "About 50%",
                  "About 70%",
                  "About 89%"
                ]}
                correctAnswer={3}
                explanation="SEBI's 2023 study revealed that 89% of individual F&O traders lost money, with average losses of Rs. 1.1 lakh per person. This is why trading is considered high-risk and not suitable for beginners."
              />
              
              <QuizQuestion
                question="How much time does typical trading require compared to investing?"
                options={[
                  "Trading requires less time than investing",
                  "Both require the same amount of time",
                  "Trading requires significantly more daily time",
                  "Investing requires more time because of research"
                ]}
                correctAnswer={2}
                explanation="Trading typically requires several hours of daily market monitoring, chart analysis, and quick decision-making. Investing requires just a few hours per month for research and portfolio review. Trading is essentially a full-time job if done seriously."
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/learn/trading-basics')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors w-full sm:w-auto justify-center"
            >
              <FaArrowLeft className="text-sm" />
              <span>Back to Module Overview</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/trading-basics-lesson-2')}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center bg-brand-fill hover:bg-brand-hover"
            >
              <span>Next: Types of Trading</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>

        </div>
      </div>
    </StudyShell>
  );
};

export default TradingBasicsLesson1;
