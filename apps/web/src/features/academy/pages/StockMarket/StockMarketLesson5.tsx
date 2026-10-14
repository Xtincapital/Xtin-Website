import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { moduleLabel } from "../../../../constants/learningModules";

// Custom SVG Icons
const Icons = {
  // TrendUp Icon
  TrendUp: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 7H21V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // TrendDown Icon
  TrendDown: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7L9 13L13 9L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 17H21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Scale/Balance Icon
  Scale: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 7H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 7L3 14H7L5 7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M19 7L21 14H17L19 7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M12 7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Buyers Icon
  Buyers: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 21V19C3 16.2386 5.23858 14 8 14H10C12.7614 14 15 16.2386 15 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 11L18 13L22 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Sellers Icon
  Sellers: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 21V19C3 16.2386 5.23858 14 8 14H10C12.7614 14 15 16.2386 15 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 9L21 13M21 9L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // News Icon
  News: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 11H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 15H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="14" y="11" width="3" height="6" rx="1" fill="currentColor"/>
    </svg>
  ),

  // Earnings Icon
  Earnings: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 4V10" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Economy Icon
  Economy: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 3C14.5 5.5 15.5 8.5 15.5 12C15.5 15.5 14.5 18.5 12 21" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 3C9.5 5.5 8.5 8.5 8.5 12C8.5 15.5 9.5 18.5 12 21" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 12H21" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Sentiment Icon
  Sentiment: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 14C8.5 15.5 10 17 12 17C14 17 15.5 15.5 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="9" cy="10" r="1" fill="currentColor"/>
      <circle cx="15" cy="10" r="1" fill="currentColor"/>
    </svg>
  ),

  // Fear Icon
  Fear: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 16C8.5 14.5 10 13 12 13C14 13 15.5 14.5 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="9" cy="10" r="1" fill="currentColor"/>
      <circle cx="15" cy="10" r="1" fill="currentColor"/>
    </svg>
  ),

  // Government Icon
  Government: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 21V11" stroke="currentColor" strokeWidth="2"/>
      <path d="M19 21V11" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 21V11" stroke="currentColor" strokeWidth="2"/>
      <path d="M15 21V11" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 3L3 11H21L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),

  // FII Icon
  FII: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="8" height="12" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="6" width="8" height="12" rx="1" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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

  // Rupee Icon
  Rupee: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 7H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 11C8 11 10 11 11 13C12 15 8 17 8 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Interest Rate Icon
  InterestRate: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // World Events Icon
  WorldEvents: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 3C14.5 5.5 15.5 8.5 15.5 12C15.5 15.5 14.5 18.5 12 21" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 3C9.5 5.5 8.5 8.5 8.5 12C8.5 15.5 9.5 18.5 12 21" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 12H21" stroke="currentColor" strokeWidth="2"/>
      <path d="M4.5 7.5H19.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4.5 16.5H19.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),

  // Arrow Up Icon
  ArrowUp: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Arrow Down Icon
  ArrowDown: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                : "border-gray-200 hover:border-teal-300 hover:bg-teal-50"
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

const StockMarketLesson5 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-teal-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/learn/stock-market')}
              className="flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span>{moduleLabel("stock-market")}</span>
            </button>
            <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Icons.Clock className="w-4 h-4" />
              9 min read
            </span>
          </div>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-white rounded-full text-sm font-semibold bg-brand-fill">
                Lesson 5 of 7
              </span>
              <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                Beginner
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-200 rounded-xl shadow-sm">
                <Icons.TrendUp className="w-7 h-7 text-teal-600" />
              </span>
              <span>Why Stock Prices Move</span>
            </h1>
            <p className="text-lg text-gray-500">
              Understanding supply, demand, and the factors that make stock prices go up or down every day.
            </p>
          </div>

          {/* The Hook */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 mb-10 border border-teal-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <Icons.Question className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-teal-900 mb-2">Why Did the Stock I Bought Yesterday Fall Today?</h3>
                <p className="text-teal-800">
                  You check your portfolio — it's red! But you didn't see any bad news. What happened? 
                  Stock prices move constantly, and understanding <strong>why</strong> is the key to being a 
                  confident investor instead of a confused one. Let's decode the mystery.
                </p>
              </div>
            </div>
          </div>

          {/* The Foundation: Supply & Demand */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Scale className="w-6 h-6 text-teal-600" />
              <span>The Foundation: Supply & Demand</span>
            </h2>
            
            <div className="rounded-xl p-6 text-white mb-4 bg-brand-fill">
              <p className="text-xl font-semibold text-center">
                Stock prices are determined by <span className="underline decoration-yellow-300 decoration-2">supply</span> (sellers) 
                and <span className="underline decoration-yellow-300 decoration-2">demand</span> (buyers).
                <br />
                <span className="text-teal-100 text-base">More buyers than sellers? Price goes UP. More sellers than buyers? Price goes DOWN.</span>
              </p>
            </div>
            
            <p className="text-gray-600">
              It's like any market — whether it's vegetables, houses, or cricket tickets. 
              When something is in high demand and short supply, prices rise. When no one wants it, prices fall.
            </p>
          </div>

          {/* Visual: Supply & Demand */}
          <div className="bg-gradient-to-br from-gray-50 to-teal-50 rounded-2xl p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How Supply & Demand Works</h2>
            
            <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 300" fill="none">
              {/* Scenario 1: More Buyers */}
              <g transform="translate(50, 30)">
                <text x="125" y="0" textAnchor="middle" fill="#373A41" fontSize="12" fontWeight="700">MORE BUYERS THAN SELLERS</text>
                
                {/* Buyers side */}
                <g transform="translate(0, 20)">
                  <rect x="0" y="0" width="100" height="120" rx="8" fill="#EEF9F4" stroke="#12805A" strokeWidth="2"/>
                  <text x="50" y="20" textAnchor="middle" fill="#12805A" fontSize="10" fontWeight="600">BUYERS</text>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <circle key={i} cx={25 + (i % 2) * 50} cy={45 + Math.floor(i / 2) * 30} r="10" fill="#12805A"/>
                  ))}
                </g>

                {/* Sellers side */}
                <g transform="translate(150, 20)">
                  <rect x="0" y="0" width="100" height="120" rx="8" fill="#FBE1E1" stroke="#E04848" strokeWidth="2"/>
                  <text x="50" y="20" textAnchor="middle" fill="#842428" fontSize="10" fontWeight="600">SELLERS</text>
                  {[0, 1].map((i) => (
                    <circle key={i} cx={25 + i * 50} cy={60} r="10" fill="#E04848"/>
                  ))}
                </g>

                {/* Result */}
                <g transform="translate(60, 160)">
                  <rect x="0" y="0" width="130" height="40" rx="8" fill="#12805A"/>
                  <text x="65" y="17" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">RESULT</text>
                  <text x="65" y="32" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">PRICE GOES UP ↑</text>
                </g>
              </g>

              {/* VS */}
              <g transform="translate(320, 100)">
                <circle cx="30" cy="30" r="25" fill="#EEEEF1" stroke="#CFD0D3" strokeWidth="2"/>
                <text x="30" y="35" textAnchor="middle" fill="#717680" fontSize="12" fontWeight="700">VS</text>
              </g>

              {/* Scenario 2: More Sellers */}
              <g transform="translate(400, 30)">
                <text x="125" y="0" textAnchor="middle" fill="#373A41" fontSize="12" fontWeight="700">MORE SELLERS THAN BUYERS</text>
                
                {/* Buyers side */}
                <g transform="translate(0, 20)">
                  <rect x="0" y="0" width="100" height="120" rx="8" fill="#EEF9F4" stroke="#12805A" strokeWidth="2"/>
                  <text x="50" y="20" textAnchor="middle" fill="#12805A" fontSize="10" fontWeight="600">BUYERS</text>
                  {[0, 1].map((i) => (
                    <circle key={i} cx={25 + i * 50} cy={60} r="10" fill="#12805A"/>
                  ))}
                </g>

                {/* Sellers side */}
                <g transform="translate(150, 20)">
                  <rect x="0" y="0" width="100" height="120" rx="8" fill="#FBE1E1" stroke="#E04848" strokeWidth="2"/>
                  <text x="50" y="20" textAnchor="middle" fill="#842428" fontSize="10" fontWeight="600">SELLERS</text>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <circle key={i} cx={25 + (i % 2) * 50} cy={45 + Math.floor(i / 2) * 30} r="10" fill="#E04848"/>
                  ))}
                </g>

                {/* Result */}
                <g transform="translate(60, 160)">
                  <rect x="0" y="0" width="130" height="40" rx="8" fill="#E04848"/>
                  <text x="65" y="17" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">RESULT</text>
                  <text x="65" y="32" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">PRICE GOES DOWN ↓</text>
                </g>
              </g>

              {/* Bottom note */}
              <g transform="translate(50, 250)">
                <rect x="0" y="0" width="600" height="35" rx="8" fill="#EEF8F9" stroke="#A9DDE3" strokeWidth="2"/>
                <text x="300" y="22" textAnchor="middle" fill="#2A8C9A" fontSize="11">
                  The price at which buyers and sellers agree to trade is called the "market price"
                </text>
              </g>
            </svg>
          </div>

          {/* What Makes People Buy or Sell */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Question className="w-6 h-6 text-teal-600" />
              <span>But What Makes People Buy or Sell?</span>
            </h2>
            
            <p className="text-gray-600 mb-4">
              Here's the interesting part. Many factors influence whether people want to buy or sell a stock:
            </p>

            <div className="space-y-4">
              {/* Factor Categories */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Company-Specific Factors */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <Icons.Earnings className="w-5 h-5" />
                    Company-Specific Factors
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2 text-blue-700">
                      <Icons.Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Earnings reports</strong> — Profit up? Stock usually rises</span>
                    </li>
                    <li className="flex items-start gap-2 text-blue-700">
                      <Icons.Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span><strong>New products/services</strong> — Jio launch boosted Reliance</span>
                    </li>
                    <li className="flex items-start gap-2 text-blue-700">
                      <Icons.Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Management changes</strong> — New CEO can excite or worry investors</span>
                    </li>
                    <li className="flex items-start gap-2 text-blue-700">
                      <Icons.Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Scandals/frauds</strong> — Yes Bank crashed on bad loans news</span>
                    </li>
                  </ul>
                </div>

                {/* Market-Wide Factors */}
                <div className="rounded-xl p-4 border border-brand-line bg-brand-soft">
                  <h4 className="font-bold text-brand mb-3 flex items-center gap-2">
                    <Icons.Economy className="w-5 h-5" />
                    Market-Wide Factors
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2 text-brand">
                      <Icons.Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                      <span><strong>Interest rates</strong> — RBI hikes rates? Stocks often fall</span>
                    </li>
                    <li className="flex items-start gap-2 text-brand">
                      <Icons.Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                      <span><strong>Inflation</strong> — High inflation worries investors</span>
                    </li>
                    <li className="flex items-start gap-2 text-brand">
                      <Icons.Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                      <span><strong>GDP growth</strong> — Strong economy = confident investors</span>
                    </li>
                    <li className="flex items-start gap-2 text-brand">
                      <Icons.Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                      <span><strong>Elections/Budget</strong> — Policy changes affect sectors</span>
                    </li>
                  </ul>
                </div>

                {/* Global Factors */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                    <Icons.WorldEvents className="w-5 h-5" />
                    Global Factors
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2 text-purple-700">
                      <Icons.Check className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span><strong>US Fed rates</strong> — Affects money flow to India</span>
                    </li>
                    <li className="flex items-start gap-2 text-purple-700">
                      <Icons.Check className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Oil prices</strong> — India imports oil, so prices matter</span>
                    </li>
                    <li className="flex items-start gap-2 text-purple-700">
                      <Icons.Check className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Geopolitics</strong> — Wars, tensions create uncertainty</span>
                    </li>
                    <li className="flex items-start gap-2 text-purple-700">
                      <Icons.Check className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Pandemics</strong> — COVID crashed markets in March 2020</span>
                    </li>
                  </ul>
                </div>

                {/* Sentiment/Psychology */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                  <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                    <Icons.Sentiment className="w-5 h-5" />
                    Sentiment & Psychology
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2 text-amber-700">
                      <Icons.Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Fear</strong> — Bad news → panic selling → prices crash</span>
                    </li>
                    <li className="flex items-start gap-2 text-amber-700">
                      <Icons.Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Greed</strong> — FOMO buying → prices skyrocket</span>
                    </li>
                    <li className="flex items-start gap-2 text-amber-700">
                      <Icons.Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Herd mentality</strong> — "Everyone's buying, I should too!"</span>
                    </li>
                    <li className="flex items-start gap-2 text-amber-700">
                      <Icons.Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Rumors/Tips</strong> — WhatsApp tips move penny stocks!</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* FII and DII Impact */}
          <div className="bg-gradient-to-br from-gray-50 to-teal-50 rounded-2xl p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.FII className="w-6 h-6 text-teal-600" />
              <span>The Big Players: FII & DII</span>
            </h2>
            
            <p className="text-gray-600 mb-4">
              Individual investors like you and me aren't the only ones trading. Big institutions move markets:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">FII (Foreign Institutional Investors)</h4>
                <p className="text-blue-700 text-sm mb-2">
                  Foreign banks, hedge funds, pension funds that invest in Indian markets.
                </p>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    <strong>When FIIs buy:</strong> Rupee strengthens, markets rise<br/>
                    <strong>When FIIs sell:</strong> Rupee weakens, markets fall
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-brand-line">
                <h4 className="font-bold text-brand mb-2">DII (Domestic Institutional Investors)</h4>
                <p className="text-brand text-sm mb-2">
                  Indian mutual funds, insurance companies (LIC), banks.
                </p>
                <div className="bg-brand-soft rounded-lg p-3">
                  <p className="text-brand text-sm">
                    <strong>When DIIs buy:</strong> They often step in when FIIs sell<br/>
                    <strong>Growing SIP culture:</strong> DIIs are getting stronger!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <p className="text-teal-800 text-sm">
                <strong>Why this matters:</strong> FIIs and DIIs trade in crores daily. Their buying/selling patterns 
                significantly impact stock prices. When you see "FIIs sold Rs. 5,000 crore today", expect the market to be weak!
              </p>
            </div>
          </div>

          {/* Real Examples */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.News className="w-6 h-6 text-teal-600" />
              <span>Real Examples: What Moved These Stocks?</span>
            </h2>

            <div className="space-y-4">
              <div className="bg-brand-soft rounded-xl p-4 border border-brand-line">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-brand">Reliance Industries (2020)</h4>
                  <span className="px-2 py-1 bg-brand-soft text-brand rounded text-sm flex items-center gap-1">
                    <Icons.ArrowUp className="w-4 h-4" /> +150%
                  </span>
                </div>
                <p className="text-brand text-sm">
                  <strong>What happened:</strong> Facebook, Google invested billions in Jio Platforms. 
                  Reliance became debt-free. Investors saw huge growth potential → massive buying!
                </p>
              </div>

              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-red-800">Yes Bank (2020)</h4>
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm flex items-center gap-1">
                    <Icons.ArrowDown className="w-4 h-4" /> -85%
                  </span>
                </div>
                <p className="text-red-700 text-sm">
                  <strong>What happened:</strong> Bad loans exposed, RBI had to step in, management issues. 
                  Investors lost trust → panic selling → stock crashed from Rs. 300+ to Rs. 15!
                </p>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-amber-800">Zomato IPO (2021)</h4>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-sm">
                    Wild swings!
                  </span>
                </div>
                <p className="text-amber-700 text-sm">
                  <strong>What happened:</strong> Listed at Rs. 116, went up to Rs. 169 (hype), 
                  then crashed to Rs. 40 (profitability concerns), now recovering. Pure sentiment + expectations game!
                </p>
              </div>
            </div>
          </div>

          {/* India Focus Section */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-2xl p-6 mb-10 border border-orange-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.IndiaFlag className="w-6 h-6 text-orange-600" />
              <span>India Focus: Events That Move Our Markets</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-3">Bullish Events (Markets Rise)</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-brand-fill rounded-full"></span>
                    Strong GDP growth numbers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-brand-fill rounded-full"></span>
                    Good monsoon (helps rural economy)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-brand-fill rounded-full"></span>
                    FII buying spree
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-brand-fill rounded-full"></span>
                    Business-friendly budget policies
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-brand-fill rounded-full"></span>
                    RBI rate cuts (cheaper loans)
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-3">Bearish Events (Markets Fall)</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    High inflation reports
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Rupee weakening sharply
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    FII selling heavily
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Global market crash (US, China)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Rising crude oil prices
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">
                <strong>Pro Tip:</strong> Keep an eye on quarterly earnings season (April-May, July-Aug, Oct-Nov, Jan-Feb). 
                That's when companies report results and stocks move the most!
              </p>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 mb-10 border border-teal-200">
            <h2 className="text-xl font-semibold text-teal-900 mb-4 flex items-center gap-2">
              <Icons.Lightbulb className="w-6 h-6 text-teal-600" />
              <span>Key Takeaways</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-teal-800">
                  <strong>Supply & Demand rule</strong> — More buyers = price up, more sellers = price down
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-teal-800">
                  <strong>Multiple factors matter</strong> — Company news, economy, global events, sentiment
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-teal-800">
                  <strong>FIIs & DIIs are big players</strong> — Their buying/selling impacts markets heavily
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p className="text-teal-800">
                  <strong>Sentiment can override logic</strong> — Fear and greed move markets short-term
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-teal-100 rounded-xl">
                <span className="text-xl">✍️</span>
              </span>
              <span>Quick Quiz</span>
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                question="What primarily determines stock prices?"
                options={[
                  "The company's CEO decides the price",
                  "SEBI sets the price every day",
                  "Supply and demand from buyers and sellers",
                  "The face value of the stock"
                ]}
                correctAnswer={2}
                explanation="Stock prices are determined by supply and demand. When more people want to buy (demand) than sell (supply), prices go up. When more want to sell than buy, prices go down. It's just like any market!"
              />
              
              <QuizQuestion
                question="When FIIs (Foreign Institutional Investors) sell heavily, what typically happens?"
                options={[
                  "Markets usually rise because foreigners are leaving",
                  "Markets usually fall and rupee weakens",
                  "No impact on markets",
                  "Only IT stocks are affected"
                ]}
                correctAnswer={1}
                explanation="When FIIs sell heavily, they convert rupees back to dollars, which weakens the rupee. The selling pressure also causes stock prices to fall. FIIs are major players, so their actions significantly impact Indian markets."
              />
              
              <QuizQuestion
                question="A company announces record profits, but its stock falls. Why could this happen?"
                options={[
                  "This is impossible — profits always make stocks rise",
                  "The market expected even higher profits (disappointment)",
                  "Someone made a trading mistake",
                  "The stock exchange made an error"
                ]}
                correctAnswer={1}
                explanation="This is common! If a company reports Rs. 100 crore profit but the market expected Rs. 150 crore, the stock might fall. It's not just about results — it's about results vs expectations. 'Beat estimates' matters more than absolute numbers!"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/learn/stock-market-lesson-4')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors w-full sm:w-auto justify-center"
            >
              <FaArrowLeft className="text-sm" />
              <span>Previous: What is a Market Index?</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/stock-market-lesson-6')}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center bg-brand-fill hover:bg-brand-hover"
            >
              <span>Next: Investing vs Trading</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StockMarketLesson5;
