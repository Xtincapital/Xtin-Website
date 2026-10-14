import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { getModuleInfo, moduleLabel } from "../../../../constants/learningModules";

// Custom SVG Icons
const Icons = {
  // Warning Icon
  Warning: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L22 20H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>
  ),

  // Mistake 1: Following Tips Blindly
  Tips: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 7H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 15H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="16" cy="15" r="2" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Mistake 2: No Research
  NoResearch: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
      <path d="M21 21L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 8L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 8L8 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Mistake 3: Emotional Decisions
  Emotional: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 15C8 15 9.5 13 12 13C14.5 13 16 15 16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 9L7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 9L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Mistake 4: No Diversification
  NoDiversity: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.3"/>
    </svg>
  ),

  // Mistake 5: Timing the Market
  Timing: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 5L19 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Mistake 6: Ignoring Costs
  Costs: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 9.5C9 8.67 9.67 8 10.5 8H13.5C14.33 8 15 8.67 15 9.5C15 10.33 14.33 11 13.5 11H10.5C9.67 11 9 11.67 9 12.5C9 13.33 9.67 14 10.5 14H13.5C14.33 14 15 14.67 15 15.5C15 16.33 14.33 17 13.5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Mistake 7: Panic Selling
  Panic: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 17H21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Mistake 8: Borrowing to Invest
  Borrow: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 14H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 5L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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

  // Clock Icon
  Clock: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Shield Icon (Protection)
  Shield: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L4 7V12C4 16.42 7.4 20.5 12 21.5C16.6 20.5 20 16.42 20 12V7L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

  // Book/Learn Icon
  Learn: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 6.04168C10.4467 4.75868 8.41833 4 6.21429 4C4.88558 4 3.62325 4.27778 2.5 4.77618V18.7762C3.62325 18.2778 4.88558 18 6.21429 18C8.41833 18 10.4467 18.7587 12 20.0417M12 6.04168C13.5533 4.75868 15.5817 4 17.7857 4C19.1144 4 20.3768 4.27778 21.5 4.77618V18.7762C20.3768 18.2778 19.1144 18 17.7857 18C15.5817 18 13.5533 18.7587 12 20.0417M12 6.04168V20.0417" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Celebration Icon
  Celebration: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14.4 8.8L21.6 9.2L16.2 14L17.8 21.2L12 17.6L6.2 21.2L7.8 14L2.4 9.2L9.6 8.8L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

  // FOMO Icon
  FOMO: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 9C8 9 10 8 12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 9C16 9 14 8 12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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

// Mistake Card Component
const MistakeCard = ({ number, title, icon: Icon, description, wrongWay, rightWay, realExample, color = "rose" }) => {
  return (
    <div className={`bg-gradient-to-br from-${color}-50 to-red-50 rounded-2xl p-6 border border-${color}-200 mb-6`}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 border border-${color}-200`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div>
          <span className={`text-xs font-semibold text-${color}-600 uppercase tracking-wide`}>Mistake #{number}</span>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4">{description}</p>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-red-100 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <Icons.Cross className="w-4 h-4 text-red-600" />
            <span className="font-semibold text-red-800 text-sm">Wrong Approach</span>
          </div>
          <p className="text-red-700 text-sm">{wrongWay}</p>
        </div>
        
        <div className="bg-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Icons.Check className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-green-800 text-sm">Right Approach</span>
          </div>
          <p className="text-green-700 text-sm">{rightWay}</p>
        </div>
      </div>
      
      {realExample && (
        <div className="bg-white rounded-xl p-3 border border-gray-200">
          <p className="text-gray-600 text-sm">
            <span className="font-semibold text-gray-800">Real Example: </span>
            {realExample}
          </p>
        </div>
      )}
    </div>
  );
};

const StockMarketLesson7 = () => {
  const navigate = useNavigate();

  const mistakes = [
    {
      number: 1,
      title: "Following Tips Blindly",
      icon: Icons.Tips,
      description: "Getting stock tips from WhatsApp groups, YouTube influencers, or 'experts' on social media without doing your own research.",
      wrongWay: "A friend says 'XYZ stock will double in 3 months!' — you invest your savings immediately.",
      rightWay: "Research the company yourself. Check financials, understand the business, then decide.",
      realExample: "Thousands lost money in 2021-22 following 'operator tips' on small-cap stocks that crashed 70-90% after the hype died down."
    },
    {
      number: 2,
      title: "No Research Before Buying",
      icon: Icons.NoResearch,
      description: "Buying stocks because the price went up recently, or the name sounds good, without understanding the company's business or financials.",
      wrongWay: "This stock went from Rs. 50 to Rs. 200 in 6 months, it must be good! Let me buy!",
      rightWay: "Ask: What does the company do? Is it profitable? What's the PE ratio? Why is it growing?",
      realExample: "Paytm IPO (2021): Many bought at Rs. 2,150 without understanding the business. Stock fell to Rs. 400 within 2 years."
    },
    {
      number: 3,
      title: "Emotional Decision Making",
      icon: Icons.Emotional,
      description: "Letting fear and greed drive your investment decisions instead of logic and research.",
      wrongWay: "Market crashed 5%! Sell everything before it falls more! / Stock is up 50%! Buy more before it goes higher!",
      rightWay: "Stick to your investment plan. Buy quality companies at fair prices, hold for long term.",
      realExample: "March 2020 COVID crash: Those who panic-sold at Nifty 7,500 missed the recovery to 18,000+ within 18 months."
    },
    {
      number: 4,
      title: "Putting All Eggs in One Basket",
      icon: Icons.NoDiversity,
      description: "Investing all your money in a single stock or sector instead of diversifying across different companies and industries.",
      wrongWay: "I love Adani stocks! I'll put my entire portfolio in Adani companies.",
      rightWay: "Spread investments across 10-15 stocks from different sectors (IT, Banking, Pharma, FMCG, etc.)",
      realExample: "Yes Bank investors (2020): Stock fell from Rs. 400 to Rs. 5. Those with 100% in Yes Bank lost almost everything."
    },
    {
      number: 5,
      title: "Trying to Time the Market",
      icon: Icons.Timing,
      description: "Waiting for the 'perfect' time to buy or sell, trying to catch exact tops and bottoms.",
      wrongWay: "I'll wait for the market to crash more before buying. / I'll sell when it reaches exactly Rs. 1,000.",
      rightWay: "Time in the market beats timing the market. Start SIPs, invest regularly, stay invested.",
      realExample: "People waiting for Nifty to fall to 15,000 in 2023 missed the rally to 22,000+. Waiting for 'perfect' entry can cost more than imperfect timing."
    },
    {
      number: 6,
      title: "Ignoring Transaction Costs & Taxes",
      icon: Icons.Costs,
      description: "Frequent buying and selling without considering brokerage, STT, GST, and short-term capital gains tax eating into your profits.",
      wrongWay: "I made Rs. 5,000 profit! (Ignoring Rs. 1,500 in charges and Rs. 1,000 in taxes)",
      rightWay: "Calculate net returns after all costs. For short-term gains, 20% STCG tax applies. Long-term (>1 year) is only 12.5%.",
      realExample: "A trader making 100 trades/month with Rs. 20/trade brokerage spends Rs. 24,000/year just on brokerage!"
    },
    {
      number: 7,
      title: "Panic Selling in Crashes",
      icon: Icons.Panic,
      description: "Selling good quality stocks during market corrections out of fear, locking in losses permanently.",
      wrongWay: "Market fell 20%! Everything is going down! Sell all stocks before it becomes zero!",
      rightWay: "If you bought quality companies, corrections are buying opportunities, not selling signals.",
      realExample: "Nifty fell 40% in March 2020. Those who sold at 7,500 regretted it when it hit 18,000 in just 18 months."
    },
    {
      number: 8,
      title: "Borrowing Money to Invest",
      icon: Icons.Borrow,
      description: "Taking loans or using credit cards to invest in stocks, hoping to make quick profits.",
      wrongWay: "I'll take a personal loan at 14% interest. The stock will surely give 30% returns!",
      rightWay: "Only invest money you can afford to lose. Never borrow for equity investments.",
      realExample: "Many borrowed to invest in the 2021 bull market. When stocks fell 30-50% in 2022, they were left with losses AND loan EMIs."
    }
  ];

  return (
    <div className="bg-gradient-to-b from-white to-rose-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/learn/stock-market')}
              className="flex items-center gap-2 text-gray-500 hover:text-rose-600 transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span>{moduleLabel("stock-market")}</span>
            </button>
            <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Icons.Clock className="w-4 h-4" />
              10 min read
            </span>
          </div>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-full text-sm font-semibold">
                Lesson 7 of 7
              </span>
              <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm">
                Beginner
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                Module Complete!
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-normal text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-rose-100 to-red-200 rounded-xl shadow-sm">
                <Icons.Warning className="w-7 h-7 text-rose-600" />
              </span>
              <span>Common Beginner Mistakes</span>
            </h1>
            <p className="text-lg text-gray-500">
              Learn from others' expensive errors — these mistakes cost real people real money!
            </p>
          </div>

          {/* The Hook */}
          <div className="bg-gradient-to-r from-rose-50 to-red-50 rounded-2xl p-6 mb-10 border border-rose-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <Icons.Question className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-rose-900 mb-2">Why Learn About Mistakes?</h3>
                <p className="text-rose-800">
                  Smart investors learn from their own mistakes. Wise investors learn from others' mistakes 
                  and avoid them altogether! These 8 mistakes have cost Indian investors crores of rupees. 
                  Understanding them now will save you years of regret and money.
                </p>
              </div>
            </div>
          </div>

          {/* Visual: The Cost of Mistakes */}
          <div className="bg-gradient-to-br from-gray-50 to-rose-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">The Real Cost of These Mistakes</h2>
            
            <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 200" fill="none">
              {/* Background */}
              <rect x="20" y="20" width="660" height="160" rx="12" fill="#FDF1F1" stroke="#F09B9B" strokeWidth="2"/>
              
              {/* Title */}
              <text x="350" y="50" textAnchor="middle" fill="#842428" fontSize="14" fontWeight="700">
                What Indian Investors Lost Due to Common Mistakes
              </text>
              
              {/* Stats */}
              <g transform="translate(60, 75)">
                <rect x="0" y="0" width="150" height="80" rx="8" fill="white" stroke="#F6C3C3" strokeWidth="2"/>
                <text x="75" y="30" textAnchor="middle" fill="#C7363B" fontSize="20" fontWeight="bold">89%</text>
                <text x="75" y="50" textAnchor="middle" fill="#6B2023" fontSize="10">F&O traders</text>
                <text x="75" y="65" textAnchor="middle" fill="#6B2023" fontSize="10">lost money in FY23</text>
              </g>
              
              <g transform="translate(275, 75)">
                <rect x="0" y="0" width="150" height="80" rx="8" fill="white" stroke="#F6C3C3" strokeWidth="2"/>
                <text x="75" y="30" textAnchor="middle" fill="#C7363B" fontSize="18" fontWeight="bold">Rs.1.1L</text>
                <text x="75" y="50" textAnchor="middle" fill="#6B2023" fontSize="10">Average loss per</text>
                <text x="75" y="65" textAnchor="middle" fill="#6B2023" fontSize="10">F&O trader</text>
              </g>
              
              <g transform="translate(490, 75)">
                <rect x="0" y="0" width="150" height="80" rx="8" fill="white" stroke="#F6C3C3" strokeWidth="2"/>
                <text x="75" y="30" textAnchor="middle" fill="#C7363B" fontSize="18" fontWeight="bold">Rs.52,000Cr</text>
                <text x="75" y="50" textAnchor="middle" fill="#6B2023" fontSize="10">Total losses by retail</text>
                <text x="75" y="65" textAnchor="middle" fill="#6B2023" fontSize="10">traders in FY22-23</text>
              </g>
            </svg>
            
            <p className="text-center text-gray-600 text-sm mt-4">
              Source: SEBI Study on Retail Participation in F&O Trading (2023)
            </p>
          </div>

          {/* All 8 Mistakes */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-rose-100 rounded-xl">
                <Icons.Warning className="w-6 h-6 text-rose-600" />
              </span>
              <span>8 Costly Mistakes to Avoid</span>
            </h2>

            {mistakes.map((mistake) => (
              <MistakeCard key={mistake.number} {...mistake} />
            ))}
          </div>

          {/* India Focus Section */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-2xl p-6 mb-10 border border-orange-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.IndiaFlag className="w-6 h-6 text-orange-600" />
              <span>India Focus: Biggest Retail Investor Disasters</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-red-200">
                <h4 className="font-bold text-red-800 mb-2">Yes Bank (2020)</h4>
                <p className="text-gray-700 text-sm mb-2">
                  Stock fell from Rs. 400 to Rs. 5 (98.75% crash). Lakhs of retail investors lost their savings.
                </p>
                <p className="text-red-600 text-xs font-medium">Lesson: Don't put all money in one stock</p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-red-200">
                <h4 className="font-bold text-red-800 mb-2">Paytm IPO (2021)</h4>
                <p className="text-gray-700 text-sm mb-2">
                  Listed at Rs. 1,950, fell 80% to Rs. 400. Investors who bought at IPO price of Rs. 2,150 lost heavily.
                </p>
                <p className="text-red-600 text-xs font-medium">Lesson: Research before IPO investing</p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-red-200">
                <h4 className="font-bold text-red-800 mb-2">LIC IPO (2022)</h4>
                <p className="text-gray-700 text-sm mb-2">
                  India's biggest IPO. Stock fell 30%+ from issue price. Many retail investors stuck with losses.
                </p>
                <p className="text-red-600 text-xs font-medium">Lesson: Big name ≠ Good investment</p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-green-200">
                <h4 className="font-bold text-green-800 mb-2">Success: Patient Investors</h4>
                <p className="text-gray-700 text-sm mb-2">
                  Those who invested in Nifty 50 and held for 10+ years made 12-14% CAGR returns consistently.
                </p>
                <p className="text-green-600 text-xs font-medium">Lesson: Patience + Diversification = Success</p>
              </div>
            </div>
          </div>

          {/* How to Protect Yourself */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-10 border border-green-200">
            <h2 className="text-xl font-semibold text-green-900 mb-4 flex items-center gap-2">
              <Icons.Shield className="w-6 h-6 text-green-600" />
              <span>How to Protect Yourself</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <Icons.Learn className="w-5 h-5 text-green-600" />
                  Before You Invest
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2 text-green-700">
                    <Icons.Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Learn the basics (you're doing this now!)</span>
                  </li>
                  <li className="flex items-start gap-2 text-green-700">
                    <Icons.Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Start with index funds or blue-chip stocks</span>
                  </li>
                  <li className="flex items-start gap-2 text-green-700">
                    <Icons.Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Only invest money you won't need for 5+ years</span>
                  </li>
                  <li className="flex items-start gap-2 text-green-700">
                    <Icons.Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Build emergency fund first (6 months expenses)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 border border-green-200">
                <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <Icons.Target className="w-5 h-5 text-green-600" />
                  While You're Invested
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2 text-green-700">
                    <Icons.Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Diversify across 10-15 stocks minimum</span>
                  </li>
                  <li className="flex items-start gap-2 text-green-700">
                    <Icons.Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Use SIPs to avoid timing mistakes</span>
                  </li>
                  <li className="flex items-start gap-2 text-green-700">
                    <Icons.Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Review portfolio quarterly, not daily</span>
                  </li>
                  <li className="flex items-start gap-2 text-green-700">
                    <Icons.Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Stay calm during market crashes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-gradient-to-r from-rose-50 to-red-50 rounded-2xl p-6 mb-10 border border-rose-200">
            <h2 className="text-xl font-semibold text-rose-900 mb-4 flex items-center gap-2">
              <Icons.Lightbulb className="w-6 h-6 text-rose-600" />
              <span>Key Takeaways</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-rose-800">
                  <strong>Never follow tips blindly</strong> — do your own research before investing
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-rose-800">
                  <strong>Diversify your portfolio</strong> — never put all money in one stock
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-rose-800">
                  <strong>Control emotions</strong> — don't panic sell or FOMO buy
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p className="text-rose-800">
                  <strong>Time in market beats timing</strong> — stay invested for long term
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-rose-100 rounded-xl">
                <span className="text-xl">✍️</span>
              </span>
              <span>Quick Quiz</span>
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                question="Your WhatsApp group says 'Buy XYZ stock now, it will double in 1 month!' What should you do?"
                options={[
                  "Buy immediately before it goes up more",
                  "Research the company first, then decide based on fundamentals",
                  "Ask more people in the group for confirmation",
                  "Take a loan and invest everything in it"
                ]}
                correctAnswer={1}
                explanation="Never follow tips blindly! Always research the company's business, financials, and valuation before investing. Most 'hot tips' lead to losses. The tip-giver often sells when you buy!"
              />
              
              <QuizQuestion
                question="The market crashed 15% this month. You have quality stocks. What's the best approach?"
                options={[
                  "Sell everything immediately to stop further losses",
                  "Wait for it to crash more, then sell",
                  "Stay calm, review your holdings, and consider buying more if fundamentals are intact",
                  "Stop checking your portfolio and never invest again"
                ]}
                correctAnswer={2}
                explanation="Market crashes are normal and temporary. If you own quality companies, crashes are often buying opportunities! The 2020 COVID crash was followed by a massive rally. Panic selling locks in losses permanently."
              />
              
              <QuizQuestion
                question="Which portfolio strategy is MOST likely to protect you from big losses?"
                options={[
                  "All money in your favorite 2-3 stocks",
                  "Diversifying across 10-15 stocks from different sectors",
                  "100% investment in one sector you understand well",
                  "Following a famous investor's exact portfolio"
                ]}
                correctAnswer={1}
                explanation="Diversification is your best protection! If you have 15 stocks across different sectors and one crashes 50%, your overall portfolio only falls ~3%. With just 2 stocks, the same crash hurts you 25%!"
              />
            </div>
          </div>

          {/* Module Completion */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 mb-10 text-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Celebration className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 tracking-[-0.015em]">Module {getModuleInfo("stock-market")?.number} Complete!</h2>
              <p className="text-white/90 mb-4">
                Congratulations! You've completed Stock Market Basics. You now understand how the stock market works, 
                what shares are, how trading happens, market indices, price movements, investing vs trading, and common mistakes to avoid.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-4">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">7 Lessons Completed</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Stock Market Basics Mastered</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Ready for Module {getModuleInfo("trading-basics")?.number}!</span>
              </div>
              <button
                onClick={() => navigate('/learn')}
                className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-white/90 transition-colors"
              >
                Explore More Modules
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/learn/stock-market-lesson-6')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors w-full sm:w-auto justify-center"
            >
              <FaArrowLeft className="text-sm" />
              <span>Previous: Investing vs Trading</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/stock-market')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white rounded-xl transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
            >
              <span>Back to Module Overview</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StockMarketLesson7;
