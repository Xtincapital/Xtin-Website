import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { moduleLabel } from "../../../../constants/learningModules";

// Custom SVG Icons
const Icons = {
  // Index/Chart Icon
  Index: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 14L10 11L13 14L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="17" cy="10" r="2" fill="currentColor"/>
    </svg>
  ),

  // Thermometer Icon
  Thermometer: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 14.76V3.5C14 2.67157 13.3284 2 12.5 2H11.5C10.6716 2 10 2.67157 10 3.5V14.76C8.79401 15.4122 8 16.6393 8 18C8 20.2091 9.79086 22 12 22C14.2091 22 16 20.2091 16 18C16 16.6393 15.206 15.4122 14 14.76Z" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="18" r="2" fill="currentColor"/>
    </svg>
  ),

  // Basket Icon
  Basket: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9H21L19 20H5L3 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 9V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V9" stroke="currentColor" strokeWidth="2"/>
      <circle cx="9" cy="14" r="1" fill="currentColor"/>
      <circle cx="12" cy="14" r="1" fill="currentColor"/>
      <circle cx="15" cy="14" r="1" fill="currentColor"/>
    </svg>
  ),

  // Nifty Icon
  Nifty: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="bold">50</text>
    </svg>
  ),

  // Sensex Icon
  Sensex: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="bold">30</text>
    </svg>
  ),

  // Building Icon
  Building: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 6H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 14H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="9" y="17" width="6" height="5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

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

  // Scale/Weight Icon
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

  // Globe Icon
  Globe: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 12H21" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 3C14.5 5.5 15.5 8.5 15.5 12C15.5 15.5 14.5 18.5 12 21" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 3C9.5 5.5 8.5 8.5 8.5 12C8.5 15.5 9.5 18.5 12 21" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Percent Icon
  Percent: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
                : "border-gray-200 hover:border-amber-300 hover:bg-amber-50"
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

const StockMarketLesson4 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-amber-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/learn/stock-market')}
              className="flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span>{moduleLabel("stock-market")}</span>
            </button>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Icons.Clock className="w-4 h-4" />
              8 min read
            </span>
          </div>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-full text-sm font-semibold">
                Lesson 4 of 7
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                Beginner
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-normal text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl shadow-sm">
                <Icons.Index className="w-7 h-7 text-amber-600" />
              </span>
              <span>What is a Market Index?</span>
            </h1>
            <p className="text-lg text-gray-500">
              Understanding Nifty 50, Sensex, and how they tell you the market's mood in one number.
            </p>
          </div>

          {/* The Hook */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-10 border border-amber-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <Icons.News className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">"Sensex Crashes 500 Points!" — What Does That Even Mean?</h3>
                <p className="text-amber-800">
                  You've seen these headlines. But what exactly is Sensex? What's Nifty? Why do people panic when 
                  these numbers drop? These are <strong>market indices</strong> — and they're actually simpler than they sound. 
                  Think of them as the "temperature" of the stock market.
                </p>
              </div>
            </div>
          </div>

          {/* Simple Definition */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Thermometer className="w-6 h-6 text-amber-600" />
              <span>The Simple Explanation</span>
            </h2>
            
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-6 text-white mb-4">
              <p className="text-xl font-semibold text-center">
                A <span className="underline decoration-yellow-300 decoration-2">Market Index</span> is a 
                <span className="underline decoration-yellow-300 decoration-2"> single number</span> that represents 
                how a <span className="underline decoration-yellow-300 decoration-2">group of stocks</span> is performing.
              </p>
            </div>
            
            <p className="text-gray-600">
              Instead of checking 5,000+ stocks individually, you look at one number. 
              If Nifty is up, it generally means the market is doing well. If it's down, things aren't looking great.
            </p>
          </div>

          {/* Visual: The Basket Analogy */}
          <div className="bg-gradient-to-br from-gray-50 to-amber-50 rounded-2xl p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Basket className="w-6 h-6 text-amber-600" />
              <span>Think of It Like a Basket</span>
            </h2>
            
            <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 320" fill="none">
              {/* Title */}
              <text x="350" y="25" textAnchor="middle" fill="#404047" fontSize="14" fontWeight="600">
                An Index = A Basket of Selected Stocks
              </text>

              {/* Basket */}
              <g transform="translate(200, 50)">
                <path d="M50 100 L0 200 H300 L250 100 Z" fill="#F6ECCE" stroke="#B8923F" strokeWidth="3"/>
                <path d="M100 60 Q150 20 200 60" stroke="#B8923F" strokeWidth="3" fill="none"/>
                
                {/* Stocks in basket */}
                <g transform="translate(30, 110)">
                  <rect x="0" y="0" width="50" height="60" rx="4" fill="#8F6FC4"/>
                  <text x="25" y="25" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">TCS</text>
                  <text x="25" y="45" textAnchor="middle" fill="#D9CBEE" fontSize="7">₹3,500</text>
                </g>
                
                <g transform="translate(60, 115)">
                  <rect x="0" y="0" width="50" height="55" rx="4" fill="#5A77AA"/>
                  <text x="25" y="22" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">RELIANCE</text>
                  <text x="25" y="42" textAnchor="middle" fill="#C3D0E4" fontSize="7">₹2,500</text>
                </g>
                
                <g transform="translate(95, 108)">
                  <rect x="0" y="0" width="50" height="62" rx="4" fill="#1FA978"/>
                  <text x="25" y="25" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">HDFC</text>
                  <text x="25" y="45" textAnchor="middle" fill="#ABE5CC" fontSize="7">₹1,700</text>
                </g>
                
                <g transform="translate(130, 112)">
                  <rect x="0" y="0" width="50" height="58" rx="4" fill="#B8923F"/>
                  <text x="25" y="24" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">INFY</text>
                  <text x="25" y="44" textAnchor="middle" fill="#F6ECCE" fontSize="7">₹1,500</text>
                </g>
                
                <g transform="translate(165, 105)">
                  <rect x="0" y="0" width="50" height="65" rx="4" fill="#E04848"/>
                  <text x="25" y="26" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">ITC</text>
                  <text x="25" y="46" textAnchor="middle" fill="#F6C3C3" fontSize="7">₹450</text>
                </g>
                
                <g transform="translate(195, 118)">
                  <rect x="0" y="0" width="35" height="52" rx="4" fill="#8F6FC4"/>
                  <text x="17" y="24" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">+45</text>
                  <text x="17" y="40" textAnchor="middle" fill="#D9CBEE" fontSize="6">more</text>
                </g>
              </g>

              {/* Arrow */}
              <g transform="translate(520, 140)">
                <path d="M0 20 L40 20" stroke="#B8923F" strokeWidth="3"/>
                <path d="M35 10 L50 20 L35 30" fill="#B8923F"/>
              </g>

              {/* Result Number */}
              <g transform="translate(580, 100)">
                <rect x="0" y="0" width="100" height="80" rx="12" fill="#B8923F"/>
                <text x="50" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">NIFTY 50</text>
                <text x="50" y="55" textAnchor="middle" fill="white" fontSize="20" fontWeight="700">22,500</text>
                <text x="50" y="72" textAnchor="middle" fill="#F6ECCE" fontSize="10">+1.2%</text>
              </g>

              {/* Bottom explanation */}
              <g transform="translate(50, 270)">
                <rect x="0" y="0" width="600" height="40" rx="8" fill="#F6ECCE" stroke="#E2C273" strokeWidth="2"/>
                <text x="300" y="25" textAnchor="middle" fill="#654B26" fontSize="11">
                  50 stocks go in → 1 number comes out → That number tells you how these 50 companies are doing overall
                </text>
              </g>
            </svg>
          </div>

          {/* India's Two Main Indices */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.IndiaFlag className="w-6 h-6 text-orange-600" />
              <span>India's Two Main Indices</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Nifty 50 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">50</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 text-lg">NIFTY 50</h3>
                    <p className="text-blue-600 text-sm">National Stock Exchange</p>
                  </div>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2 text-blue-800">
                    <Icons.Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong>50 companies</strong> from NSE</span>
                  </li>
                  <li className="flex items-start gap-2 text-blue-800">
                    <Icons.Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>India's most popular index</span>
                  </li>
                  <li className="flex items-start gap-2 text-blue-800">
                    <Icons.Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Companies from 13 different sectors</span>
                  </li>
                  <li className="flex items-start gap-2 text-blue-800">
                    <Icons.Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Started in 1996 (base value: 1,000)</span>
                  </li>
                </ul>

                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Current:</strong> ~22,000-24,000 range
                  </p>
                </div>
              </div>

              {/* Sensex */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">30</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-900 text-lg">SENSEX</h3>
                    <p className="text-red-600 text-sm">Bombay Stock Exchange</p>
                  </div>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2 text-red-800">
                    <Icons.Check className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>30 companies</strong> from BSE</span>
                  </li>
                  <li className="flex items-start gap-2 text-red-800">
                    <Icons.Check className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>India's oldest index (since 1986)</span>
                  </li>
                  <li className="flex items-start gap-2 text-red-800">
                    <Icons.Check className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>Full form: Sensitive Index</span>
                  </li>
                  <li className="flex items-start gap-2 text-red-800">
                    <Icons.Check className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>Started in 1986 (base value: 100)</span>
                  </li>
                </ul>

                <div className="mt-4 p-3 bg-red-100 rounded-lg">
                  <p className="text-red-800 text-sm">
                    <strong>Current:</strong> ~72,000-78,000 range
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-700 text-sm">
                <strong>Which one to follow?</strong> Both! They usually move together. Nifty 50 is more commonly 
                used for trading (Nifty futures, options), while Sensex is older and more recognized internationally.
              </p>
            </div>
          </div>

          {/* How Index is Calculated */}
          <div className="bg-gradient-to-br from-gray-50 to-amber-50 rounded-2xl p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Calculator className="w-6 h-6 text-amber-600" />
              <span>How is an Index Calculated?</span>
            </h2>
            
            <p className="text-gray-600 mb-4">
              Indices use <strong>market-cap weighted</strong> calculation. Bigger companies have more impact on the index.
            </p>

            <svg className="w-full max-w-2xl mx-auto mb-4" viewBox="0 0 500 200" fill="none">
              {/* Title */}
              <text x="250" y="20" textAnchor="middle" fill="#404047" fontSize="12" fontWeight="600">
                Bigger Company = More Weight in Index
              </text>

              {/* Scale visualization */}
              <g transform="translate(50, 50)">
                {/* Bar chart showing weights */}
                <rect x="0" y="80" width="80" height="80" rx="4" fill="#5A77AA"/>
                <text x="40" y="130" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">RELIANCE</text>
                <text x="40" y="145" textAnchor="middle" fill="#C3D0E4" fontSize="8">10% weight</text>
                
                <rect x="100" y="100" width="70" height="60" rx="4" fill="#8F6FC4"/>
                <text x="135" y="135" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">TCS</text>
                <text x="135" y="148" textAnchor="middle" fill="#D9CBEE" fontSize="8">5% weight</text>
                
                <rect x="190" y="110" width="65" height="50" rx="4" fill="#8F6FC4"/>
                <text x="222" y="140" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">HDFC</text>
                <text x="222" y="152" textAnchor="middle" fill="#D9CBEE" fontSize="8">4% weight</text>
                
                <rect x="275" y="125" width="55" height="35" rx="4" fill="#8F6FC4"/>
                <text x="302" y="147" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">INFY</text>
                
                <rect x="345" y="135" width="45" height="25" rx="4" fill="#A88BD9"/>
                <text x="367" y="152" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">ITC</text>
              </g>

              {/* Explanation */}
              <g transform="translate(50, 175)">
                <text x="200" y="0" textAnchor="middle" fill="#654B26" fontSize="10">
                  If Reliance moves 2%, it affects Nifty more than if ITC moves 2%
                </text>
              </g>
            </svg>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="text-amber-800 text-sm">
                <strong>Why this matters:</strong> When you hear "Nifty crashed 500 points", it might be because 
                a few big companies like Reliance or TCS had a bad day — even if smaller companies did fine!
              </p>
            </div>
          </div>

          {/* What Do Index Movements Mean */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.TrendUp className="w-6 h-6 text-green-600" />
              <span>What Do Index Movements Mean?</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.TrendUp className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-green-800">Index Goes UP</h4>
                </div>
                <p className="text-green-700 text-sm">
                  Overall, the companies in the index are doing well. Investors are optimistic. 
                  Called a <strong>"Bull Market"</strong> if the uptrend continues.
                </p>
              </div>

              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.TrendDown className="w-5 h-5 text-red-600" />
                  <h4 className="font-bold text-red-800">Index Goes DOWN</h4>
                </div>
                <p className="text-red-700 text-sm">
                  Overall, companies are struggling or investors are worried. 
                  Called a <strong>"Bear Market"</strong> if the downtrend continues.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Understanding the Numbers</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-gray-500">Points Change</p>
                  <p className="font-bold text-amber-600">+250 pts</p>
                  <p className="text-gray-400 text-xs">Absolute movement</p>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-gray-500">% Change</p>
                  <p className="font-bold text-green-600">+1.1%</p>
                  <p className="text-gray-400 text-xs">Relative movement</p>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-gray-500">Day's High</p>
                  <p className="font-bold text-blue-600">22,650</p>
                  <p className="text-gray-400 text-xs">Highest today</p>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-gray-500">Day's Low</p>
                  <p className="font-bold text-purple-600">22,380</p>
                  <p className="text-gray-400 text-xs">Lowest today</p>
                </div>
              </div>
            </div>
          </div>

          {/* Other Important Indices */}
          <div className="bg-gradient-to-br from-gray-50 to-amber-50 rounded-2xl p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Globe className="w-6 h-6 text-amber-600" />
              <span>Other Indices You Should Know</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">Indian Indices</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span><strong>Nifty Bank</strong> — Top 12 banking stocks</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span><strong>Nifty IT</strong> — Top IT companies</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span><strong>Nifty Next 50</strong> — Companies 51-100</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    <span><strong>Nifty Midcap 100</strong> — Medium-sized companies</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">Global Indices</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span><strong>Dow Jones</strong> — USA (30 companies)</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span><strong>S&P 500</strong> — USA (500 companies)</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span><strong>NASDAQ</strong> — USA tech companies</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span><strong>FTSE 100</strong> — UK (100 companies)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="text-amber-800 text-sm">
                <strong>Pro Tip:</strong> Global markets affect Indian markets! If US markets crash overnight, 
                Indian markets often open lower the next day. Keep an eye on Dow Jones and NASDAQ too.
              </p>
            </div>
          </div>

          {/* India Focus Section */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-2xl p-6 mb-10 border border-orange-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.IndiaFlag className="w-6 h-6 text-orange-600" />
              <span>India Focus: Top Nifty 50 Companies</span>
            </h2>
            
            <p className="text-gray-700 mb-4">
              These are some of the biggest companies in Nifty 50 by weight (as of 2024):
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { name: "HDFC Bank", weight: "~13%", color: "bg-blue-100 text-blue-700" },
                { name: "Reliance", weight: "~10%", color: "bg-indigo-100 text-indigo-700" },
                { name: "ICICI Bank", weight: "~7%", color: "bg-purple-100 text-purple-700" },
                { name: "Infosys", weight: "~6%", color: "bg-green-100 text-green-700" },
                { name: "TCS", weight: "~4%", color: "bg-teal-100 text-teal-700" },
                { name: "L&T", weight: "~4%", color: "bg-amber-100 text-amber-700" },
                { name: "ITC", weight: "~4%", color: "bg-red-100 text-red-700" },
                { name: "Bharti Airtel", weight: "~3%", color: "bg-rose-100 text-rose-700" },
                { name: "Axis Bank", weight: "~3%", color: "bg-cyan-100 text-cyan-700" },
                { name: "Kotak Bank", weight: "~3%", color: "bg-orange-100 text-orange-700" }
              ].map((company, index) => (
                <div key={index} className={`${company.color} rounded-lg p-3 text-center`}>
                  <p className="font-semibold text-sm">{company.name}</p>
                  <p className="text-xs opacity-75">{company.weight}</p>
                </div>
              ))}
            </div>

            <p className="text-gray-500 text-xs mt-3 italic">
              * Weights change based on market cap. These top 10 make up nearly 60% of Nifty 50!
            </p>
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
                  <strong>Index = Market thermometer</strong> — one number showing overall market health
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-amber-800">
                  <strong>Nifty 50 (NSE)</strong> and <strong>Sensex (BSE)</strong> are India's main indices
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-amber-800">
                  <strong>Bigger companies = More weight</strong> — they impact the index more
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p className="text-amber-800">
                  <strong>Index up ≠ All stocks up</strong> — it's an average of selected companies
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-amber-100 rounded-xl">
                <span className="text-xl">✍️</span>
              </span>
              <span>Quick Quiz</span>
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                question="What is Nifty 50?"
                options={[
                  "A list of 50 cheapest stocks on NSE",
                  "An index tracking 50 large companies on NSE",
                  "The top 50 stocks by daily trading volume",
                  "A mutual fund that invests in 50 stocks"
                ]}
                correctAnswer={1}
                explanation="Nifty 50 is an index that tracks the performance of 50 of the largest and most liquid companies listed on the National Stock Exchange (NSE). It represents various sectors of the Indian economy."
              />
              
              <QuizQuestion
                question="If Reliance (10% weight) goes up 5% and all other stocks stay flat, what happens to Nifty?"
                options={[
                  "Nifty stays flat (no change)",
                  "Nifty goes up by approximately 0.5%",
                  "Nifty goes up by exactly 5%",
                  "Nifty goes down because only one stock moved"
                ]}
                correctAnswer={1}
                explanation="Since Reliance has ~10% weight in Nifty, a 5% rise in Reliance contributes about 0.5% (10% × 5% = 0.5%) to the overall index. This is why bigger companies have more impact!"
              />
              
              <QuizQuestion
                question="Sensex has how many companies?"
                options={[
                  "50 companies",
                  "100 companies",
                  "30 companies",
                  "500 companies"
                ]}
                correctAnswer={2}
                explanation="Sensex (Sensitive Index) tracks 30 of the largest and most actively traded companies on the Bombay Stock Exchange (BSE). It's India's oldest stock market index, started in 1986."
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/learn/stock-market-lesson-3')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors w-full sm:w-auto justify-center"
            >
              <FaArrowLeft className="text-sm" />
              <span>Previous: How Buying & Selling Works</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/stock-market-lesson-5')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
            >
              <span>Next: Why Stock Prices Move</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StockMarketLesson4;
