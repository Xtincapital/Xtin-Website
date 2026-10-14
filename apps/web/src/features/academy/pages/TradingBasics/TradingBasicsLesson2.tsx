import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { moduleLabel } from "../../../../constants/learningModules";

// Custom SVG Icons
const Icons = {
  // Types/Grid Icon
  Types: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Intraday Icon (Sun/Day)
  Intraday: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M4 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M22 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M6.34 6.34L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M19.07 19.07L17.66 17.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M6.34 17.66L4.93 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M19.07 4.93L17.66 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Swing Icon (Wave)
  Swing: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12C2 12 5 6 8 6C11 6 11 18 14 18C17 18 22 12 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Positional Icon (Calendar with arrow)
  Positional: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 14L11 17L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Scalping Icon (Lightning fast)
  Scalping: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Clock Icon
  Clock: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Risk Icon
  Risk: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L22 20H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>
  ),

  // Chart Icon
  Chart: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 14L10 11L13 14L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

  // Time Icon (Hourglass)
  Hourglass: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M6 22H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M6 2V8L12 12L6 16V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 2V8L12 12L18 16V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

  // Rupee Icon
  Rupee: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 7H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 11C8 11 10 11 11 13C12 15 8 17 8 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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

  // Person Icon
  Person: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 21V19C4 16.2386 6.23858 14 9 14H15C17.7614 14 20 16.2386 20 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
                : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
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

// Trading Type Card Component
const TradingTypeCard = ({ icon: Icon, title, timeframe, description, risk, capital, suited, color, bgColor, borderColor }) => {
  return (
    <div className={`${bgColor} rounded-2xl p-6 border-2 ${borderColor} mb-6`}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-500 text-sm">{timeframe}</p>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4">{description}</p>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Risk Level</p>
          <p className={`font-bold text-sm ${risk === 'Extreme' ? 'text-red-600' : risk === 'Very High' ? 'text-orange-600' : risk === 'High' ? 'text-amber-600' : 'text-yellow-600'}`}>{risk}</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Capital Needed</p>
          <p className="font-bold text-sm text-gray-700">{capital}</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Time Required</p>
          <p className="font-bold text-sm text-gray-700">{suited}</p>
        </div>
      </div>
    </div>
  );
};

const TradingBasicsLesson2 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-orange-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/learn/trading-basics')}
              className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span>{moduleLabel("trading-basics")}</span>
            </button>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Icons.Clock className="w-4 h-4" />
              9 min read
            </span>
          </div>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-white rounded-full text-sm font-semibold bg-brand-fill">
                Lesson 2 of 7
              </span>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                Beginner
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-100 to-red-200 rounded-xl shadow-sm">
                <Icons.Types className="w-7 h-7 text-orange-600" />
              </span>
              <span>Types of Trading</span>
            </h1>
            <p className="text-lg text-gray-500">
              Four different styles of trading — from seconds to months. Know what you're getting into.
            </p>
          </div>

          {/* The Hook */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 mb-10 border border-orange-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <Icons.Types className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">Not All Trading is the Same</h3>
                <p className="text-orange-800">
                  "I want to try trading" — but which type? Scalping requires split-second decisions. 
                  Swing trading lets you sleep at night. Positional trading is almost like investing. 
                  Each type has vastly different time commitments, risks, and skills required.
                </p>
              </div>
            </div>
          </div>

          {/* Visual: Trading Types Overview */}
          <div className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">The Four Types of Trading (By Timeframe)</h2>
            
            <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 280" fill="none">
              {/* Timeline */}
              <defs>
                <linearGradient id="timelineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#E04848"/>
                  <stop offset="33%" stopColor="#D2754C"/>
                  <stop offset="66%" stopColor="#B8923F"/>
                  <stop offset="100%" stopColor="#12805A"/>
                </linearGradient>
              </defs>
              
              <rect x="50" y="220" width="600" height="12" rx="6" fill="url(#timelineGrad)"/>
              
              {/* Time labels */}
              <text x="80" y="250" textAnchor="middle" fill="#717680" fontSize="10">Seconds</text>
              <text x="200" y="250" textAnchor="middle" fill="#717680" fontSize="10">Minutes-Hours</text>
              <text x="400" y="250" textAnchor="middle" fill="#717680" fontSize="10">Days-Weeks</text>
              <text x="600" y="250" textAnchor="middle" fill="#717680" fontSize="10">Weeks-Months</text>
              
              {/* Scalping Box */}
              <g transform="translate(30, 20)">
                <rect x="0" y="0" width="140" height="180" rx="12" fill="#FDF1F1" stroke="#E04848" strokeWidth="2"/>
                <text x="70" y="30" textAnchor="middle" fill="#C7363B" fontSize="12" fontWeight="700">SCALPING</text>
                <circle cx="70" cy="60" r="20" fill="#FBE1E1"/>
                <text x="70" y="55" textAnchor="middle" fill="#C7363B" fontSize="8">⚡</text>
                <text x="70" y="68" textAnchor="middle" fill="#C7363B" fontSize="7">FAST</text>
                <text x="70" y="100" textAnchor="middle" fill="#6B2023" fontSize="9">Seconds to</text>
                <text x="70" y="112" textAnchor="middle" fill="#6B2023" fontSize="9">minutes</text>
                <text x="70" y="140" textAnchor="middle" fill="#C7363B" fontSize="9" fontWeight="600">Risk: EXTREME</text>
                <text x="70" y="160" textAnchor="middle" fill="#842428" fontSize="8">50-100+ trades/day</text>
              </g>
              
              {/* Intraday Box */}
              <g transform="translate(185, 20)">
                <rect x="0" y="0" width="140" height="180" rx="12" fill="#FCF3EE" stroke="#D2754C" strokeWidth="2"/>
                <text x="70" y="30" textAnchor="middle" fill="#C0623B" fontSize="12" fontWeight="700">INTRADAY</text>
                <circle cx="70" cy="60" r="20" fill="#F8E2D6"/>
                <text x="70" y="55" textAnchor="middle" fill="#C0623B" fontSize="8">☀️</text>
                <text x="70" y="68" textAnchor="middle" fill="#C0623B" fontSize="7">1 DAY</text>
                <text x="70" y="100" textAnchor="middle" fill="#7D3F28" fontSize="9">Buy & sell</text>
                <text x="70" y="112" textAnchor="middle" fill="#7D3F28" fontSize="9">same day</text>
                <text x="70" y="140" textAnchor="middle" fill="#C0623B" fontSize="9" fontWeight="600">Risk: VERY HIGH</text>
                <text x="70" y="160" textAnchor="middle" fill="#7D3F28" fontSize="8">5-20 trades/day</text>
              </g>
              
              {/* Swing Box */}
              <g transform="translate(340, 20)">
                <rect x="0" y="0" width="140" height="180" rx="12" fill="#FBF7EC" stroke="#B8923F" strokeWidth="2"/>
                <text x="70" y="30" textAnchor="middle" fill="#9A7634" fontSize="12" fontWeight="700">SWING</text>
                <circle cx="70" cy="60" r="20" fill="#F6ECCE"/>
                <text x="70" y="55" textAnchor="middle" fill="#9A7634" fontSize="8">〰️</text>
                <text x="70" y="68" textAnchor="middle" fill="#9A7634" fontSize="7">WAVE</text>
                <text x="70" y="100" textAnchor="middle" fill="#654B26" fontSize="9">Days to</text>
                <text x="70" y="112" textAnchor="middle" fill="#654B26" fontSize="9">weeks</text>
                <text x="70" y="140" textAnchor="middle" fill="#9A7634" fontSize="9" fontWeight="600">Risk: HIGH</text>
                <text x="70" y="160" textAnchor="middle" fill="#654B26" fontSize="8">2-10 trades/week</text>
              </g>
              
              {/* Positional Box */}
              <g transform="translate(495, 20)">
                <rect x="0" y="0" width="140" height="180" rx="12" fill="#EEF9F4" stroke="#12805A" strokeWidth="2"/>
                <text x="70" y="30" textAnchor="middle" fill="#12805A" fontSize="12" fontWeight="700">POSITIONAL</text>
                <circle cx="70" cy="60" r="20" fill="#EEF9F4"/>
                <text x="70" y="55" textAnchor="middle" fill="#12805A" fontSize="8">📅</text>
                <text x="70" y="68" textAnchor="middle" fill="#12805A" fontSize="7">LONG</text>
                <text x="70" y="100" textAnchor="middle" fill="#12805A" fontSize="9">Weeks to</text>
                <text x="70" y="112" textAnchor="middle" fill="#12805A" fontSize="9">months</text>
                <text x="70" y="140" textAnchor="middle" fill="#12805A" fontSize="9" fontWeight="600">Risk: MODERATE</text>
                <text x="70" y="160" textAnchor="middle" fill="#12805A" fontSize="8">2-5 trades/month</text>
              </g>
              
              {/* Arrow showing increasing time */}
              <text x="350" y="270" textAnchor="middle" fill="#717680" fontSize="11" fontStyle="italic">
                ← Shorter holding period | Longer holding period →
              </text>
            </svg>
          </div>

          {/* Detailed Cards for Each Type */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-[-0.015em]">Understanding Each Type</h2>

            {/* Scalping */}
            <TradingTypeCard
              icon={Icons.Scalping}
              title="Scalping"
              timeframe="Seconds to Minutes"
              description="The fastest form of trading. Scalpers make dozens or even hundreds of trades per day, trying to profit from tiny price movements (often just a few paise). Requires intense focus, fast internet, and quick reflexes."
              risk="Extreme"
              capital="High (Rs. 5L+)"
              suited="Full-time only"
              color="bg-gradient-to-br from-red-500 to-rose-600"
              bgColor="bg-gradient-to-br from-red-50 to-rose-50"
              borderColor="border-red-200"
            />

            {/* Intraday */}
            <TradingTypeCard
              icon={Icons.Intraday}
              title="Intraday Trading"
              timeframe="Minutes to Hours (Same Day)"
              description="Buy and sell within the same trading day. Positions are closed before market closes (3:30 PM). No overnight risk, but requires watching markets throughout the day. Most popular among retail traders in India."
              risk="Very High"
              capital="Medium (Rs. 1-5L)"
              suited="4-6 hours/day"
              color="bg-brand-fill"
              bgColor="bg-gradient-to-br from-orange-50 to-amber-50"
              borderColor="border-orange-200"
            />

            {/* Swing */}
            <TradingTypeCard
              icon={Icons.Swing}
              title="Swing Trading"
              timeframe="Days to Weeks"
              description="Hold positions for several days or weeks, capturing 'swings' in price trends. Less stressful than intraday as you don't need to watch markets constantly. Overnight risk exists, but more time for analysis."
              risk="High"
              capital="Medium (Rs. 1-3L)"
              suited="1-2 hours/day"
              color="bg-brand-fill"
              bgColor="bg-gradient-to-br from-yellow-50 to-amber-50"
              borderColor="border-yellow-200"
            />

            {/* Positional */}
            <TradingTypeCard
              icon={Icons.Positional}
              title="Positional Trading"
              timeframe="Weeks to Months"
              description="Hold positions for weeks or months based on longer-term trends. Almost like investing but with active management. Less time-intensive, relies more on fundamental + technical analysis combined."
              risk="Moderate-High"
              capital="Lower (Rs. 50K+)"
              suited="Few hours/week"
              color="bg-brand-fill"
              bgColor="bg-brand-soft"
              borderColor="border-brand-line"
            />
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Chart className="w-6 h-6 text-orange-600" />
              <span>Quick Comparison</span>
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 rounded-tl-lg font-semibold">Type</th>
                    <th className="text-left p-3 font-semibold">Holding Time</th>
                    <th className="text-left p-3 font-semibold">Trades/Period</th>
                    <th className="text-left p-3 font-semibold">Screen Time</th>
                    <th className="text-left p-3 rounded-tr-lg font-semibold">Suitable For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium text-red-600">Scalping</td>
                    <td className="p-3">Seconds-Minutes</td>
                    <td className="p-3">50-100+/day</td>
                    <td className="p-3">6+ hours/day</td>
                    <td className="p-3">Professionals only</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50/50">
                    <td className="p-3 font-medium text-orange-600">Intraday</td>
                    <td className="p-3">Minutes-Hours</td>
                    <td className="p-3">5-20/day</td>
                    <td className="p-3">4-6 hours/day</td>
                    <td className="p-3">Full-time traders</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium text-yellow-600">Swing</td>
                    <td className="p-3">Days-Weeks</td>
                    <td className="p-3">2-10/week</td>
                    <td className="p-3">1-2 hours/day</td>
                    <td className="p-3">Part-time possible</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50/50">
                    <td className="p-3 font-medium text-brand">Positional</td>
                    <td className="p-3">Weeks-Months</td>
                    <td className="p-3">2-5/month</td>
                    <td className="p-3">Few hours/week</td>
                    <td className="p-3">Working professionals</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* What Most Beginners Choose */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 mb-8 border-2 border-red-200">
            <h2 className="text-xl font-semibold text-red-900 mb-4 flex items-center gap-2">
              <Icons.Warning className="w-6 h-6 text-red-600" />
              <span>The Beginner Trap</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-red-200">
                <h4 className="font-bold text-red-800 mb-2">What Beginners Choose:</h4>
                <p className="text-red-700 text-sm mb-2">
                  Most beginners jump into <strong>Intraday or Scalping</strong> because:
                </p>
                <ul className="text-red-600 text-sm space-y-1">
                  <li>• "No overnight risk"</li>
                  <li>• "Quick money"</li>
                  <li>• "Exciting and fast-paced"</li>
                  <li>• "Lower margin requirements"</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 border border-brand-line">
                <h4 className="font-bold text-brand mb-2">What Experts Recommend:</h4>
                <p className="text-brand text-sm mb-2">
                  If you must trade, start with <strong>Swing or Positional</strong>:
                </p>
                <ul className="text-brand text-sm space-y-1">
                  <li>• More time to analyze and think</li>
                  <li>• Less stressful, fewer decisions</li>
                  <li>• Compatible with a job</li>
                  <li>• Better learning environment</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 bg-red-100 rounded-lg">
              <p className="text-red-800 text-sm">
                <strong>Reality Check:</strong> SEBI data shows intraday traders have the highest loss rates. 
                The "no overnight risk" argument ignores that most losses happen DURING the day due to poor decisions under pressure.
              </p>
            </div>
          </div>

          {/* India Focus Section */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-2xl p-6 mb-10 border border-orange-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.IndiaFlag className="w-6 h-6 text-orange-600" />
              <span>India Focus: What Indians Trade</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">Most Popular in India</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span><strong>Intraday in F&O</strong> — Most common (and most losses)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span><strong>Bank Nifty options</strong> — Favorite for intraday</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span><strong>Weekly expiry trades</strong> — High-risk, high-volume</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">Indian Market Timings</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <Icons.Clock className="w-4 h-4 text-gray-500" />
                    <span>Pre-market: 9:00 - 9:15 AM</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Clock className="w-4 h-4 text-gray-500" />
                    <span>Regular: 9:15 AM - 3:30 PM</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Clock className="w-4 h-4 text-gray-500" />
                    <span>Intraday must close by 3:30 PM</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="text-amber-800 text-sm">
                <strong>Note:</strong> Intraday trading in India requires lower margin (you can trade with less capital), 
                which attracts beginners. But lower margin = higher leverage = bigger losses when wrong.
              </p>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 mb-10 border border-orange-200">
            <h2 className="text-xl font-semibold text-orange-900 mb-4 flex items-center gap-2">
              <Icons.Lightbulb className="w-6 h-6 text-orange-600" />
              <span>Key Takeaways</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-orange-800">
                  <strong>4 types:</strong> Scalping, Intraday, Swing, Positional — each very different
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-orange-800">
                  <strong>Shorter = Riskier:</strong> Scalping is hardest, positional is "easiest"
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-orange-800">
                  <strong>Time commitment:</strong> Intraday = full-time job, Swing = part-time possible
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p className="text-orange-800">
                  <strong>Beginners:</strong> If you must trade, start with swing/positional
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-orange-100 rounded-xl">
                <span className="text-xl">✍️</span>
              </span>
              <span>Quick Quiz</span>
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                question="Which type of trading requires the MOST screen time and attention?"
                options={[
                  "Positional trading",
                  "Swing trading",
                  "Scalping",
                  "All require equal time"
                ]}
                correctAnswer={2}
                explanation="Scalping requires constant attention — often 6+ hours glued to screens making split-second decisions. Scalpers may execute 50-100+ trades per day. It's considered the most demanding and is suited only for professionals."
              />
              
              <QuizQuestion
                question="You have a full-time job but want to try trading. Which type might be most compatible?"
                options={[
                  "Intraday trading — it's done by 3:30 PM",
                  "Scalping — quick profits in minutes",
                  "Swing or Positional — requires less daily time",
                  "None — trading requires full-time commitment"
                ]}
                correctAnswer={2}
                explanation="Swing and Positional trading can work with a job because they require only 1-2 hours of analysis per day or even just a few hours per week. Intraday still needs 4-6 hours of market watching during work hours."
              />
              
              <QuizQuestion
                question="Why do most beginners choose intraday trading in India?"
                options={[
                  "It has the highest success rate",
                  "Lower margin requirements and 'no overnight risk' appeal",
                  "It's recommended by SEBI for beginners",
                  "It requires less skill than other types"
                ]}
                correctAnswer={1}
                explanation="Lower margin (less capital needed) and the appeal of 'no overnight risk' attract beginners to intraday. However, this is misleading — intraday traders have the HIGHEST loss rates because rapid decisions under pressure lead to more mistakes, not fewer."
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/learn/trading-basics-lesson-1')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors w-full sm:w-auto justify-center"
            >
              <FaArrowLeft className="text-sm" />
              <span>Previous: What is Trading?</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/trading-basics-lesson-3')}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center bg-brand-fill hover:bg-brand-hover"
            >
              <span>Next: How Profit & Loss Works</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TradingBasicsLesson2;
