import React from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { moduleLabel, moduleTag } from "../../../../constants/learningModules";

// Custom SVG Icons
const Icons = {
  // Trading Icon (Lightning bolt with chart)
  Trading: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Types Icon (Grid)
  Types: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Profit Loss Icon (Scales)
  ProfitLoss: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 8L12 5L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 8V12C5 13.1 5.9 14 7 14H9C10.1 14 11 13.1 11 12V8" stroke="currentColor" strokeWidth="2"/>
      <path d="M13 8V16C13 17.1 13.9 18 15 18H17C18.1 18 19 17.1 19 16V8" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Risk/Shield Icon
  Risk: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L4 7V12C4 16.42 7.4 20.5 12 21.5C16.6 20.5 20 16.42 20 12V7L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="16" r="1" fill="currentColor"/>
    </svg>
  ),

  // Psychology/Brain Icon
  Psychology: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3C8 3 5 6.5 5 10C5 13 7 15.5 7 18H17C17 15.5 19 13 19 10C19 6.5 16 3 12 3Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 18V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 18V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 9H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Why Lose Icon (Down trend with question)
  WhyLose: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7L9 13L13 9L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 17H21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="5" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
      <text x="4" y="18.5" fontSize="3" fill="currentColor" fontWeight="bold">?</text>
    </svg>
  ),

  // Self Assessment Icon (Checklist with person)
  SelfAssess: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 9L10 11L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 15H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 18H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Clock Icon
  Clock: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Book Icon
  Book: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 6.04168C10.4467 4.75868 8.41833 4 6.21429 4C4.88558 4 3.62325 4.27778 2.5 4.77618V18.7762C3.62325 18.2778 4.88558 18 6.21429 18C8.41833 18 10.4467 18.7587 12 20.0417M12 6.04168C13.5533 4.75868 15.5817 4 17.7857 4C19.1144 4 20.3768 4.27778 21.5 4.77618V18.7762C20.3768 18.2778 19.1144 18 17.7857 18C15.5817 18 13.5533 18.7587 12 20.0417M12 6.04168V20.0417" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Target Icon
  Target: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  ),

  // Check Icon
  Check: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Lock Icon
  Lock: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Play Icon
  Play: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="5,3 19,12 5,21" fill="currentColor"/>
    </svg>
  ),

  // Warning Icon
  Warning: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L22 20H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>
  )
};

const TradingBasicsOverview = () => {
  const navigate = useNavigate();

  const lessons = [
    { 
      num: 1, 
      title: "What is Trading?", 
      subtitle: "Trading vs investing explained",
      duration: "7 min", 
      available: true,
      icon: Icons.Trading,
      color: "amber"
    },
    { 
      num: 2, 
      title: "Types of Trading", 
      subtitle: "Intraday, swing, positional & more",
      duration: "9 min", 
      available: true,
      icon: Icons.Types,
      color: "orange"
    },
    { 
      num: 3, 
      title: "How Profit & Loss Works", 
      subtitle: "Understanding your trading P&L",
      duration: "8 min", 
      available: true,
      icon: Icons.ProfitLoss,
      color: "yellow"
    },
    { 
      num: 4, 
      title: "Risk & Stop Loss", 
      subtitle: "Protecting your trading capital",
      duration: "10 min", 
      available: true,
      icon: Icons.Risk,
      color: "red"
    },
    { 
      num: 5, 
      title: "Trading Psychology", 
      subtitle: "Emotions, fear, greed & discipline",
      duration: "9 min", 
      available: true,
      icon: Icons.Psychology,
      color: "purple"
    },
    { 
      num: 6, 
      title: "Why Most Traders Lose", 
      subtitle: "The harsh reality & statistics",
      duration: "8 min", 
      available: true,
      icon: Icons.WhyLose,
      color: "rose"
    },
    { 
      num: 7, 
      title: "Should You Trade?", 
      subtitle: "Honest self-assessment guide",
      duration: "10 min", 
      available: true,
      icon: Icons.SelfAssess,
      color: "indigo"
    },
  ];

  const colorClasses = {
    amber: {
      bg: "bg-brand-fill",
      light: "bg-amber-50 border-amber-200",
      text: "text-amber-600"
    },
    orange: {
      bg: "bg-brand-fill",
      light: "bg-orange-50 border-orange-200",
      text: "text-orange-600"
    },
    yellow: {
      bg: "bg-brand-fill",
      light: "bg-yellow-50 border-yellow-200",
      text: "text-yellow-600"
    },
    red: {
      bg: "bg-gradient-to-br from-red-500 to-rose-600",
      light: "bg-red-50 border-red-200",
      text: "text-red-600"
    },
    purple: {
      bg: "bg-brand-fill",
      light: "bg-purple-50 border-purple-200",
      text: "text-purple-600"
    },
    rose: {
      bg: "bg-gradient-to-br from-rose-500 to-pink-600",
      light: "bg-rose-50 border-rose-200",
      text: "text-rose-600"
    },
    indigo: {
      bg: "bg-brand-fill",
      light: "bg-indigo-50 border-indigo-200",
      text: "text-indigo-600"
    }
  };

  const whatYoullLearn = [
    "What trading really means (without the hype)",
    "Different types of trading approaches",
    "How profits and losses are calculated",
    "Risk management and stop-loss basics",
    "The psychology behind trading decisions",
    "Why 89% of traders lose money",
    "Whether trading is right for you"
  ];

  const totalDuration = lessons.reduce((acc, lesson) => {
    const mins = parseInt(lesson.duration);
    return acc + mins;
  }, 0);

  const availableLessons = lessons.filter(l => l.available).length;

  return (
    <div className="bg-gradient-to-b from-white to-amber-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-5xl mx-auto">
          
          {/* Back Navigation */}
          <button 
            onClick={() => navigate('/learn')}
            className="flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors mb-8 group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Modules</span>
          </button>

          {/* Module Header */}
          <div className="rounded-3xl p-8 md:p-10 mb-10 text-white relative overflow-hidden bg-brand-fill">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <pattern id="tradingPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M0 10 L5 5 L10 8 L15 3 L20 7" stroke="white" strokeWidth="0.5" fill="none"/>
                </pattern>
                <rect x="0" y="0" width="100" height="100" fill="url(#tradingPattern)"/>
              </svg>
            </div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-semibold">
                  {moduleTag("trading-basics")}
                </span>
                <span className="px-3 py-1 bg-red-400/30 backdrop-blur rounded-full text-sm font-medium flex items-center gap-1">
                  <Icons.Warning className="w-4 h-4" />
                  Awareness Track
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-display font-semibold mb-3 tracking-[-0.025em]">Trading Basics</h1>
              <p className="text-white/90 text-lg mb-6 max-w-2xl">
                Understand trading before you risk real money. This module focuses on awareness, 
                not strategies — so you can make an informed decision about whether trading is right for you.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                  <Icons.Book className="w-4 h-4" />
                  {lessons.length} Lessons
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                  <Icons.Clock className="w-4 h-4" />
                  ~{totalDuration} mins
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                  <Icons.Target className="w-4 h-4" />
                  Beginner
                </span>
              </div>
            </div>
          </div>

          {/* Important Warning Box */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 mb-10 border-2 border-red-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icons.Warning className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Important: Read Before Starting</h3>
                <p className="text-red-800 mb-3">
                  This module is about <strong>awareness</strong>, not teaching you how to trade. 
                  SEBI data shows 89% of F&O traders in India lost money in 2022-23, with average losses of Rs. 1.1 lakh.
                </p>
                <p className="text-red-700 text-sm">
                  Our goal is to help you understand what trading really involves — the risks, psychology, 
                  and statistics — so you can make an informed decision. We're not encouraging you to trade.
                </p>
              </div>
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="bg-white rounded-2xl p-6 md:p-8 mb-10 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Icons.Target className="w-6 h-6 text-amber-600" />
              <span>What You'll Learn</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {whatYoullLearn.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                  <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icons.Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Module Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-900">Module Progress</h2>
              <span className="text-sm text-gray-500">
                {availableLessons} of {lessons.length} lessons available
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 bg-brand-fill"
                style={{ width: `${(availableLessons / lessons.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Lessons List */}
          <div className="space-y-4 mb-10">
            {lessons.map((lesson) => {
              const colors = colorClasses[lesson.color];
              const Icon = lesson.icon;
              
              return (
                <div
                  key={lesson.num}
                  onClick={() => lesson.available && navigate(`/learn/trading-basics-lesson-${lesson.num}`)}
                  className={`relative rounded-2xl p-5 border transition-all duration-300 ${
                    lesson.available
                      ? `${colors.light} hover:shadow-lg hover:scale-[1.01] cursor-pointer`
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Lesson Number & Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      lesson.available ? colors.bg : "bg-gray-300"
                    }`}>
                      {lesson.available ? (
                        <Icon className="w-7 h-7 text-white" />
                      ) : (
                        <Icons.Lock className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    
                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold uppercase tracking-wide ${
                          lesson.available ? colors.text : "text-gray-400"
                        }`}>
                          Lesson {lesson.num}
                        </span>
                        {!lesson.available && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-500 text-xs rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <h3 className={`font-bold text-lg ${
                        lesson.available ? "text-gray-900" : "text-gray-500"
                      }`}>
                        {lesson.title}
                      </h3>
                      <p className={`text-sm ${
                        lesson.available ? "text-gray-500" : "text-gray-400"
                      }`}>
                        {lesson.subtitle}
                      </p>
                    </div>
                    
                    {/* Duration & Action */}
                    <div className="flex items-center gap-4">
                      <span className={`text-sm flex items-center gap-1.5 ${
                        lesson.available ? "text-gray-500" : "text-gray-400"
                      }`}>
                        <Icons.Clock className="w-4 h-4" />
                        {lesson.duration}
                      </span>
                      {lesson.available && (
                        <div className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center`}>
                          <Icons.Play className="w-4 h-4 text-white ml-0.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visual: Trading vs Investing */}
          <div className="bg-gradient-to-br from-gray-50 to-amber-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Trading vs Investing: Know the Difference</h3>
            <svg className="w-full max-w-2xl mx-auto" viewBox="0 0 600 200" fill="none">
              {/* Investing Side */}
              <g transform="translate(30, 20)">
                <rect x="0" y="0" width="240" height="160" rx="12" fill="#EEF9F4" stroke="#12805A" strokeWidth="2"/>
                <text x="120" y="30" textAnchor="middle" fill="#12805A" fontSize="14" fontWeight="700">INVESTING</text>
                
                {/* Long steady line */}
                <path d="M30 120 Q70 110 110 100 Q150 90 190 70 L220 60" stroke="#12805A" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <circle cx="30" cy="120" r="5" fill="#12805A"/>
                <circle cx="220" cy="60" r="7" fill="#12805A"/>
                
                <text x="120" y="145" textAnchor="middle" fill="#12805A" fontSize="10">Years to Decades</text>
                <text x="120" y="90" textAnchor="middle" fill="#12805A" fontSize="9">Slow & Steady Growth</text>
              </g>

              {/* VS Circle */}
              <g transform="translate(280, 75)">
                <circle cx="20" cy="25" r="22" fill="#EEEEF1" stroke="#CFD0D3" strokeWidth="2"/>
                <text x="20" y="31" textAnchor="middle" fill="#373A41" fontSize="12" fontWeight="700">VS</text>
              </g>

              {/* Trading Side */}
              <g transform="translate(330, 20)">
                <rect x="0" y="0" width="240" height="160" rx="12" fill="#F6ECCE" stroke="#B8923F" strokeWidth="2"/>
                <text x="120" y="30" textAnchor="middle" fill="#654B26" fontSize="14" fontWeight="700">TRADING</text>
                
                {/* Volatile zigzag line */}
                <path d="M20 90 L50 60 L80 100 L110 50 L140 85 L170 40 L200 70 L220 55" stroke="#B8923F" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="50" cy="60" r="4" fill="#12805A"/>
                <circle cx="110" cy="50" r="4" fill="#E04848"/>
                <circle cx="170" cy="40" r="4" fill="#12805A"/>
                
                <text x="120" y="145" textAnchor="middle" fill="#7C5D2B" fontSize="10">Minutes to Weeks</text>
                <text x="120" y="120" textAnchor="middle" fill="#654B26" fontSize="9">Frequent Buy/Sell Decisions</text>
              </g>
            </svg>
          </div>

          {/* Visual: Risk Spectrum */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Where Trading Sits on the Risk Spectrum</h3>
            <svg className="w-full max-w-2xl mx-auto" viewBox="0 0 600 120" fill="none">
              {/* Gradient Bar */}
              <defs>
                <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#12805A"/>
                  <stop offset="40%" stopColor="#B8923F"/>
                  <stop offset="70%" stopColor="#D2754C"/>
                  <stop offset="100%" stopColor="#E04848"/>
                </linearGradient>
              </defs>
              <rect x="50" y="30" width="500" height="20" rx="10" fill="url(#riskGradient)"/>
              
              {/* Labels */}
              <text x="90" y="70" textAnchor="middle" fill="#12805A" fontSize="10" fontWeight="600">Savings</text>
              <text x="90" y="85" textAnchor="middle" fill="#12805A" fontSize="8">Low Risk</text>
              
              <text x="220" y="70" textAnchor="middle" fill="#9A7634" fontSize="10" fontWeight="600">Investing</text>
              <text x="220" y="85" textAnchor="middle" fill="#9A7634" fontSize="8">Moderate</text>
              
              <text x="380" y="70" textAnchor="middle" fill="#C0623B" fontSize="10" fontWeight="600">Trading</text>
              <text x="380" y="85" textAnchor="middle" fill="#C0623B" fontSize="8">Higher Risk</text>
              
              <text x="510" y="70" textAnchor="middle" fill="#C7363B" fontSize="10" fontWeight="600">Speculation</text>
              <text x="510" y="85" textAnchor="middle" fill="#C7363B" fontSize="8">Highest Risk</text>
              
              {/* Arrow pointing to Trading */}
              <polygon points="380,25 375,15 385,15" fill="#717680"/>
              <text x="380" y="10" textAnchor="middle" fill="#717680" fontSize="9" fontWeight="600">This Module</text>
              
              {/* Note */}
              <text x="300" y="110" textAnchor="middle" fill="#717680" fontSize="9" fontStyle="italic">
                Higher potential reward = Higher potential loss
              </text>
            </svg>
          </div>

          {/* Prerequisites */}
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-3">Prerequisites</h3>
            <p className="text-amber-800 mb-3">
              Before diving into trading concepts, make sure you've completed:
            </p>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => navigate('/learn/personal-finance-basics')}
                className="px-4 py-2 bg-white border border-amber-300 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors text-sm font-medium"
              >
                Module 1: Personal Finance Basics
              </button>
              <button
                onClick={() => navigate('/learn/stock-market')}
                className="px-4 py-2 bg-white border border-amber-300 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors text-sm font-medium"
              >
                {moduleLabel("stock-market")}
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TradingBasicsOverview;
