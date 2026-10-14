import React from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlay, FaLock, FaCheckCircle } from "react-icons/fa";
import { moduleTag } from "../../../../constants/learningModules";

// Custom SVG Icons for Stock Market Module
const Icons = {
  // Stock Chart Icon
  StockChart: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 17L10 13L14 15L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="17" cy="9" r="2" fill="currentColor"/>
    </svg>
  ),

  // Building/Company Icon
  Building: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 6H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 14H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="9" y="17" width="6" height="5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Share/Pie Icon
  Share: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 3V12L19 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Exchange Icon
  Exchange: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 10L3 6L7 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 6H17C19.2091 6 21 7.79086 21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 14L21 18L17 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 18H7C4.79086 18 3 16.2091 3 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Index/Bars Icon
  Index: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="12" width="4" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="10" y="8" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="17" y="4" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // TrendUp Icon
  TrendUp: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 7H21V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Compare Icon
  Compare: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="7" height="16" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="4" width="7" height="16" rx="1" stroke="currentColor" strokeWidth="2"/>
      <path d="M6.5 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17.5 10V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Warning/Mistakes Icon
  Warning: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L22 20H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
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

  // India Flag Icon
  IndiaFlag: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 15H21" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),

  // Check Icon
  Check: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Play Icon
  Play: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="5,3 19,12 5,21" fill="currentColor"/>
    </svg>
  )
};

const StockMarketOverview = () => {
  const navigate = useNavigate();

  const lessons = [
    { 
      num: 1, 
      title: "What is the Stock Market?", 
      subtitle: "The marketplace for company ownership",
      duration: "8 min", 
      available: true,
      icon: Icons.StockChart,
      color: "indigo"
    },
    { 
      num: 2, 
      title: "What Are Shares?", 
      subtitle: "Owning a piece of a company",
      duration: "7 min", 
      available: true,
      icon: Icons.Share,
      color: "blue"
    },
    { 
      num: 3, 
      title: "How Buying & Selling Works", 
      subtitle: "Your first trade explained",
      duration: "10 min", 
      available: true,
      icon: Icons.Exchange,
      color: "purple"
    },
    { 
      num: 4, 
      title: "What is a Market Index?", 
      subtitle: "Nifty, Sensex & market health",
      duration: "8 min", 
      available: true,
      icon: Icons.Index,
      color: "amber"
    },
    { 
      num: 5, 
      title: "Why Stock Prices Move", 
      subtitle: "Supply, demand & sentiment",
      duration: "9 min", 
      available: true,
      icon: Icons.TrendUp,
      color: "teal"
    },
    { 
      num: 6, 
      title: "Investing vs Trading", 
      subtitle: "Two different approaches",
      duration: "8 min", 
      available: true,
      icon: Icons.Compare,
      color: "green"
    },
    { 
      num: 7, 
      title: "Common Beginner Mistakes", 
      subtitle: "Learn from others' errors",
      duration: "10 min", 
      available: true,
      icon: Icons.Warning,
      color: "rose"
    },
  ];

  const colorClasses = {
    indigo: {
      bg: "bg-gradient-to-br from-green-600 to-emerald-700",
      light: "bg-indigo-50 border-indigo-200",
      text: "text-indigo-600"
    },
    blue: {
      bg: "bg-gradient-to-br from-green-600 to-emerald-700",
      light: "bg-blue-50 border-blue-200",
      text: "text-blue-600"
    },
    purple: {
      bg: "bg-gradient-to-br from-green-600 to-emerald-700",
      light: "bg-purple-50 border-purple-200",
      text: "text-purple-600"
    },
    amber: {
      bg: "bg-gradient-to-br from-green-600 to-emerald-700",
      light: "bg-amber-50 border-amber-200",
      text: "text-amber-600"
    },
    teal: {
      bg: "bg-gradient-to-br from-green-600 to-emerald-700",
      light: "bg-teal-50 border-teal-200",
      text: "text-teal-600"
    },
    green: {
      bg: "bg-gradient-to-br from-green-600 to-emerald-700",
      light: "bg-green-50 border-green-200",
      text: "text-green-600"
    },
    rose: {
      bg: "bg-gradient-to-br from-rose-500 to-pink-600",
      light: "bg-rose-50 border-rose-200",
      text: "text-rose-600"
    }
  };

  const learningOutcomes = [
    "Understand what the stock market is and how it functions",
    "Know what shares represent and how ownership works",
    "Learn how to buy and sell stocks in India (NSE, BSE)",
    "Understand market indices like Nifty 50 and Sensex",
    "Know why stock prices go up and down",
    "Differentiate between investing and trading",
    "Avoid common mistakes that cost beginners money"
  ];

  return (
    <div className="bg-gradient-to-b from-white to-indigo-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-5xl mx-auto">
          
          {/* Back Navigation */}
          <button 
            onClick={() => navigate('/learn')}
            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-8 group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Modules</span>
          </button>

          {/* Module Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl p-8 md:p-10 mb-10 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
                <rect width="100" height="100" fill="url(#grid)"/>
              </svg>
            </div>

            {/* Stock Chart Line Animation */}
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-20">
              <svg viewBox="0 0 200 150" className="w-full h-full">
                <path d="M0 100 L30 80 L60 90 L90 60 L120 70 L150 40 L180 50 L200 20" 
                      stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                  {moduleTag("stock-market")}
                </span>
                <span className="px-3 py-1 bg-yellow-400/90 text-yellow-900 rounded-full text-sm font-semibold">
                  Beginner
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-display font-normal mb-3 tracking-[-0.015em]">
                Stock Market Basics
              </h1>
              <p className="text-indigo-100 text-lg mb-6 max-w-2xl">
                Understand how the stock market works, what shares are, and how ordinary people 
                can participate in company ownership. No jargon, just clear explanations.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Icons.Book className="w-4 h-4" />
                  <span>7 Lessons</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Icons.Clock className="w-4 h-4" />
                  <span>~60 minutes</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Icons.IndiaFlag className="w-4 h-4" />
                  <span>India Focused</span>
                </div>
              </div>
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="bg-white rounded-2xl p-6 md:p-8 mb-10 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-xl">
                <Icons.Target className="w-5 h-5 text-indigo-600" />
              </span>
              <span>What You'll Learn</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {learningOutcomes.map((outcome, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icons.Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <span className="text-gray-700">{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Why This Matters - India Context */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-2xl p-6 md:p-8 mb-10 border border-orange-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <Icons.IndiaFlag className="w-6 h-6 text-orange-600" />
              <span>Why This Matters for Indians</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/80 rounded-xl p-4 border border-orange-100">
                <div className="text-2xl font-bold text-indigo-600 mb-1">14 Cr+</div>
                <p className="text-sm text-gray-600">demat accounts in India — over 3x since 2020 (one person can hold more than one).</p>
              </div>
              <div className="bg-white/80 rounded-xl p-4 border border-orange-100">
                <div className="text-2xl font-bold text-green-600 mb-1">12-15%</div>
                <p className="text-sm text-gray-600">Average annual returns from Nifty 50 over the long term</p>
              </div>
              <div className="bg-white/80 rounded-xl p-4 border border-orange-100">
                <div className="text-2xl font-bold text-purple-600 mb-1">Rs. 100</div>
                <p className="text-sm text-gray-600">You can start investing with just Rs. 100 in India</p>
              </div>
            </div>
          </div>

          {/* Lessons List */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-xl">
                <Icons.Book className="w-5 h-5 text-indigo-600" />
              </span>
              <span>Course Content</span>
            </h2>
            
            <div className="space-y-4">
              {lessons.map((lesson) => {
                const colors = colorClasses[lesson.color];
                const IconComponent = lesson.icon;
                
                return (
                  <div
                    key={lesson.num}
                    onClick={() => lesson.available && navigate(`/learn/stock-market-lesson-${lesson.num}`)}
                    className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 ${
                      lesson.available 
                        ? `${colors.light} hover:shadow-lg hover:scale-[1.01] cursor-pointer` 
                        : 'border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="p-5 flex items-center gap-5">
                      {/* Lesson Number with Icon */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm ${
                        lesson.available ? colors.bg : 'bg-gray-300'
                      }`}>
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      
                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            lesson.available ? `${colors.light} ${colors.text}` : 'bg-gray-100 text-gray-500'
                          }`}>
                            Lesson {lesson.num}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Icons.Clock className="w-3 h-3" />
                            {lesson.duration}
                          </span>
                        </div>
                        <h3 className={`font-bold text-lg ${lesson.available ? 'text-gray-900' : 'text-gray-500'}`}>
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">{lesson.subtitle}</p>
                      </div>
                      
                      {/* Action Button */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        lesson.available 
                          ? `${colors.light} group-hover:${colors.bg}` 
                          : 'bg-gray-100'
                      }`}>
                        {lesson.available ? (
                          <Icons.Play className={`w-5 h-5 ${colors.text} group-hover:text-white`} />
                        ) : (
                          <FaLock className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prerequisites */}
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 mb-10">
            <h3 className="font-semibold text-amber-900 mb-3">Recommended Before This Module</h3>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => navigate('/learn/personal-finance-basics')}
                className="px-4 py-2 bg-white rounded-lg text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200 text-sm"
              >
                Module 1: Personal Finance Basics
              </button>
            </div>
            <p className="text-amber-700 text-sm mt-3">
              Having a foundation in personal finance will help you better understand direct stock investing.
            </p>
          </div>

          {/* Important Note */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icons.Warning className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900 mb-2">Educational Content Only</h3>
                <p className="text-indigo-700 text-sm">
                  This module is for educational purposes only. We teach you how the stock market works — 
                  not which stocks to buy. Always do your own research or consult a SEBI-registered 
                  advisor before investing your money.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StockMarketOverview;
