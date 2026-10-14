import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { moduleLabel } from "../../../../constants/learningModules";

// Custom SVG Icons
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

  // People/Investors Icon
  People: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="17" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 19C3 15.6863 5.68629 14 9 14C10.5 14 11.5 14.5 12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M21 19C21 15.6863 18.3137 14 15 14C14.5 14 14 14.1 13.5 14.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Marketplace Icon
  Marketplace: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9L12 3L21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 9V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V9" stroke="currentColor" strokeWidth="2"/>
      <rect x="9" y="13" width="6" height="8" stroke="currentColor" strokeWidth="2"/>
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

  // Growth Icon
  Growth: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 7H21V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

  // Exchange Icon
  Exchange: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 10L3 6L7 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 6H17C19.2091 6 21 7.79086 21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 14L21 18L17 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 18H7C4.79086 18 3 16.2091 3 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Share/Piece Icon
  Piece: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 3V12L19 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // History Icon
  History: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V12L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 12H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 5L3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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

  // Shield Icon
  Shield: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 6V12C3 17.5 7 21.5 12 22C17 21.5 21 17.5 21 12V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
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

const StockMarketLesson1 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-indigo-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/learn/stock-market')}
              className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span>{moduleLabel("stock-market")}</span>
            </button>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Icons.Clock className="w-4 h-4" />
              8 min read
            </span>
          </div>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-full text-sm font-semibold">
                Lesson 1 of 7
              </span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                Beginner
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-normal text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-100 to-violet-200 rounded-xl shadow-sm">
                <Icons.StockChart className="w-7 h-7 text-indigo-600" />
              </span>
              <span>What is the Stock Market?</span>
            </h1>
            <p className="text-lg text-gray-500">
              The marketplace where ordinary people can own pieces of India's biggest companies.
            </p>
          </div>

          {/* The Hook - Relatable Story */}
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-6 mb-10 border border-indigo-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <Icons.Question className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900 mb-2">Have You Ever Wondered...</h3>
                <p className="text-indigo-800">
                  How do people "invest in Reliance" or "own TCS shares"? When someone says 
                  "the market is up today," what does that even mean? By the end of this lesson, 
                  you'll understand exactly how ordinary people become part-owners of India's 
                  biggest companies!
                </p>
              </div>
            </div>
          </div>

          {/* Simple Definition */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Lightbulb className="w-6 h-6 text-amber-500" />
              <span>The Simple Answer</span>
            </h2>
            
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-6 text-white mb-4">
              <p className="text-xl font-semibold text-center">
                The stock market is a <span className="underline decoration-yellow-300 decoration-2">marketplace</span> where 
                people <span className="underline decoration-yellow-300 decoration-2">buy and sell</span> small pieces of 
                <span className="underline decoration-yellow-300 decoration-2"> companies</span>.
              </p>
            </div>
            
            <p className="text-gray-600">
              Just like you buy vegetables at a market, or buy products on Amazon — the stock market 
              is where you buy and sell <strong>ownership in companies</strong>. These small pieces 
              of ownership are called <strong>shares</strong> or <strong>stocks</strong>.
            </p>
          </div>

          {/* Visual: The Marketplace Analogy */}
          <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Marketplace className="w-6 h-6 text-indigo-600" />
              <span>Think of It Like a Marketplace</span>
            </h2>
            
            <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 300" fill="none">
              {/* Title */}
              <text x="350" y="25" textAnchor="middle" fill="#404047" fontSize="14" fontWeight="600">
                Sabzi Mandi vs Stock Market
              </text>

              {/* Left Side - Vegetable Market */}
              <g transform="translate(50, 50)">
                <rect x="0" y="0" width="250" height="200" rx="16" fill="#D5F2E5" stroke="#77D3AE" strokeWidth="2"/>
                <text x="125" y="30" textAnchor="middle" fill="#0D543C" fontSize="14" fontWeight="700">Sabzi Mandi</text>
                
                {/* Vegetables */}
                <g transform="translate(30, 60)">
                  <rect x="0" y="0" width="60" height="50" rx="8" fill="#1FA978"/>
                  <text x="30" y="30" textAnchor="middle" fill="white" fontSize="10">Tomatoes</text>
                </g>
                <g transform="translate(100, 60)">
                  <rect x="0" y="0" width="60" height="50" rx="8" fill="#D2754C"/>
                  <text x="30" y="30" textAnchor="middle" fill="white" fontSize="10">Onions</text>
                </g>
                <g transform="translate(170, 60)">
                  <rect x="0" y="0" width="60" height="50" rx="8" fill="#1FA978"/>
                  <text x="30" y="30" textAnchor="middle" fill="white" fontSize="10">Potatoes</text>
                </g>
                
                <text x="125" y="140" textAnchor="middle" fill="#0D543C" fontSize="11">You buy: Vegetables</text>
                <text x="125" y="158" textAnchor="middle" fill="#0D543C" fontSize="11">You get: Food to eat</text>
                <text x="125" y="176" textAnchor="middle" fill="#0D543C" fontSize="11">Seller gets: Money</text>
              </g>

              {/* Arrow */}
              <g transform="translate(320, 130)">
                <rect x="0" y="0" width="60" height="40" rx="8" fill="#8F6FC4"/>
                <text x="30" y="18" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">Same</text>
                <text x="30" y="32" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">Concept!</text>
              </g>

              {/* Right Side - Stock Market */}
              <g transform="translate(400, 50)">
                <rect x="0" y="0" width="250" height="200" rx="16" fill="#ECE4F6" stroke="#C0A9E2" strokeWidth="2"/>
                <text x="125" y="30" textAnchor="middle" fill="#533F70" fontSize="14" fontWeight="700">Stock Market</text>
                
                {/* Companies */}
                <g transform="translate(30, 60)">
                  <rect x="0" y="0" width="60" height="50" rx="8" fill="#8F6FC4"/>
                  <text x="30" y="25" textAnchor="middle" fill="white" fontSize="9">Reliance</text>
                  <text x="30" y="38" textAnchor="middle" fill="#D9CBEE" fontSize="8">Shares</text>
                </g>
                <g transform="translate(100, 60)">
                  <rect x="0" y="0" width="60" height="50" rx="8" fill="#8F6FC4"/>
                  <text x="30" y="25" textAnchor="middle" fill="white" fontSize="9">TCS</text>
                  <text x="30" y="38" textAnchor="middle" fill="#D9CBEE" fontSize="8">Shares</text>
                </g>
                <g transform="translate(170, 60)">
                  <rect x="0" y="0" width="60" height="50" rx="8" fill="#8F6FC4"/>
                  <text x="30" y="25" textAnchor="middle" fill="white" fontSize="9">HDFC</text>
                  <text x="30" y="38" textAnchor="middle" fill="#D9CBEE" fontSize="8">Shares</text>
                </g>
                
                <text x="125" y="140" textAnchor="middle" fill="#533F70" fontSize="11">You buy: Company shares</text>
                <text x="125" y="158" textAnchor="middle" fill="#533F70" fontSize="11">You get: Ownership piece</text>
                <text x="125" y="176" textAnchor="middle" fill="#533F70" fontSize="11">Company gets: Money to grow</text>
              </g>

              {/* Bottom insight */}
              <g transform="translate(100, 265)">
                <rect x="0" y="0" width="500" height="30" rx="8" fill="#F6ECCE" stroke="#E2C273" strokeWidth="1"/>
                <text x="250" y="20" textAnchor="middle" fill="#654B26" fontSize="11">
                  Key difference: Vegetables get consumed. Shares can grow in value over time!
                </text>
              </g>
            </svg>
          </div>

          {/* Why Companies Sell Shares */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Building className="w-6 h-6 text-indigo-600" />
              <span>Why Do Companies Sell Shares?</span>
            </h2>
            
            <p className="text-gray-600 mb-4">
              Companies need money to grow — build factories, hire employees, create new products. 
              Instead of taking a loan from a bank (which they have to repay with interest), they 
              can sell small pieces of their company to the public.
            </p>
            
            <div className="bg-indigo-50 rounded-xl p-4 mb-4 border border-indigo-200">
              <h4 className="font-bold text-indigo-800 mb-2">Real Example: Zomato</h4>
              <p className="text-indigo-700 text-sm">
                In 2021, Zomato raised Rs. 9,375 crore by selling shares to the public (IPO). 
                They used this money to expand to more cities, improve their app, and grow the business. 
                Now, if you own Zomato shares, you're a part-owner of Zomato!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Company Benefits</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-green-500" />
                    <span>Gets money to grow business</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-green-500" />
                    <span>No need to repay like a loan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-green-500" />
                    <span>Can attract talented employees with stock options</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Investor Benefits</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-blue-500" />
                    <span>Become part-owner of company</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-blue-500" />
                    <span>Share price can grow if company grows</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-blue-500" />
                    <span>May receive dividends (profit sharing)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Visual: How it Works Flow */}
          <div className="bg-gradient-to-br from-gray-50 to-violet-50 rounded-2xl p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Exchange className="w-6 h-6 text-violet-600" />
              <span>How the Stock Market Works</span>
            </h2>
            
            <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 280" fill="none">
              {/* Step 1: Company */}
              <g transform="translate(50, 40)">
                <rect x="0" y="0" width="140" height="100" rx="12" fill="#8F6FC4"/>
                <text x="70" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">COMPANY</text>
                <text x="70" y="50" textAnchor="middle" fill="#D9CBEE" fontSize="10">(e.g., Infosys)</text>
                <text x="70" y="75" textAnchor="middle" fill="#ECE4F6" fontSize="9">Wants to raise money</text>
                <text x="70" y="90" textAnchor="middle" fill="#ECE4F6" fontSize="9">Sells shares to public</text>
              </g>

              {/* Arrow 1 */}
              <g transform="translate(200, 70)">
                <path d="M0 20 L50 20" stroke="#8F6FC4" strokeWidth="3" strokeDasharray="6,4"/>
                <polygon points="50,15 60,20 50,25" fill="#8F6FC4"/>
                <text x="30" y="45" textAnchor="middle" fill="#8F6FC4" fontSize="9">Lists on</text>
              </g>

              {/* Step 2: Stock Exchange */}
              <g transform="translate(270, 40)">
                <rect x="0" y="0" width="160" height="100" rx="12" fill="#8F6FC4"/>
                <text x="80" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">STOCK EXCHANGE</text>
                <text x="80" y="50" textAnchor="middle" fill="#D9CBEE" fontSize="10">(NSE / BSE)</text>
                <text x="80" y="75" textAnchor="middle" fill="#ECE4F6" fontSize="9">The official marketplace</text>
                <text x="80" y="90" textAnchor="middle" fill="#ECE4F6" fontSize="9">Connects buyers & sellers</text>
              </g>

              {/* Arrow 2 */}
              <g transform="translate(440, 70)">
                <path d="M0 20 L50 20" stroke="#8F6FC4" strokeWidth="3" strokeDasharray="6,4"/>
                <polygon points="50,15 60,20 50,25" fill="#8F6FC4"/>
                <text x="30" y="45" textAnchor="middle" fill="#8F6FC4" fontSize="9">Buy via</text>
              </g>

              {/* Step 3: You */}
              <g transform="translate(510, 40)">
                <rect x="0" y="0" width="140" height="100" rx="12" fill="#1FA978"/>
                <text x="70" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">YOU</text>
                <text x="70" y="50" textAnchor="middle" fill="#ABE5CC" fontSize="10">(Investor)</text>
                <text x="70" y="75" textAnchor="middle" fill="#D5F2E5" fontSize="9">Buy shares through</text>
                <text x="70" y="90" textAnchor="middle" fill="#D5F2E5" fontSize="9">Zerodha, Groww, etc.</text>
              </g>

              {/* Bottom: What happens next */}
              <g transform="translate(50, 170)">
                <rect x="0" y="0" width="600" height="90" rx="12" fill="#F6ECCE" stroke="#E2C273" strokeWidth="2"/>
                <text x="300" y="25" textAnchor="middle" fill="#654B26" fontSize="12" fontWeight="700">What Happens Next?</text>
                
                <g transform="translate(30, 45)">
                  <circle cx="0" cy="8" r="6" fill="#1FA978"/>
                  <text x="15" y="12" fill="#0D543C" fontSize="10">If company does well → Share price goes up → You profit!</text>
                </g>
                <g transform="translate(30, 70)">
                  <circle cx="0" cy="8" r="6" fill="#E04848"/>
                  <text x="15" y="12" fill="#842428" fontSize="10">If company does poorly → Share price falls → You may lose money</text>
                </g>
              </g>
            </svg>
          </div>

          {/* India Focus Section */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-2xl p-6 mb-10 border border-orange-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.IndiaFlag className="w-6 h-6 text-orange-600" />
              <span>India Focus: Our Stock Exchanges</span>
            </h2>
            
            <p className="text-gray-700 mb-4">
              India has two main stock exchanges where shares are bought and sold:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white/80 rounded-xl p-4 border border-blue-200">
                <h4 className="font-bold text-blue-800 text-lg mb-2">NSE</h4>
                <p className="text-blue-900 font-semibold mb-1">National Stock Exchange</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Founded in 1992</li>
                  <li>• Largest exchange by volume</li>
                  <li>• Home to Nifty 50 index</li>
                  <li>• ~2,000 listed companies</li>
                </ul>
              </div>
              
              <div className="bg-white/80 rounded-xl p-4 border border-purple-200">
                <h4 className="font-bold text-purple-800 text-lg mb-2">BSE</h4>
                <p className="text-purple-900 font-semibold mb-1">Bombay Stock Exchange</p>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Founded in 1875 (Asia's oldest!)</li>
                  <li>• Located in Mumbai</li>
                  <li>• Home to Sensex index</li>
                  <li>• ~5,000+ listed companies</li>
                </ul>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Good News for Beginners:</h4>
              <p className="text-green-700 text-sm">
                You don't need to visit these exchanges physically! Apps like Zerodha, Groww, Upstox, 
                and Angel One connect directly to NSE and BSE. You can buy/sell shares from your phone 
                in seconds, anytime during market hours (9:15 AM - 3:30 PM, Monday-Friday).
              </p>
            </div>
          </div>

          {/* Common Misconceptions */}
          <div className="bg-amber-50 rounded-2xl p-6 mb-10 border border-amber-200">
            <h2 className="text-xl font-semibold text-amber-900 mb-4 flex items-center gap-2">
              <Icons.Question className="w-6 h-6 text-amber-600" />
              <span>Common Misconceptions</span>
            </h2>
            
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4">
                <p className="font-semibold text-red-700 mb-1">"Stock market is like gambling"</p>
                <p className="text-gray-600 text-sm">
                  <strong className="text-green-700">Reality:</strong> Gambling is pure chance. Investing is 
                  owning real businesses with real products, employees, and profits. Yes, there's risk — 
                  but it's not random luck.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-4">
                <p className="font-semibold text-red-700 mb-1">"You need lakhs to start"</p>
                <p className="text-gray-600 text-sm">
                  <strong className="text-green-700">Reality:</strong> You can start with as little as Rs. 100! 
                  Many good stocks cost Rs. 100-500 per share. Some apps even let you buy fractional shares.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-4">
                <p className="font-semibold text-red-700 mb-1">"Only experts can invest"</p>
                <p className="text-gray-600 text-sm">
                  <strong className="text-green-700">Reality:</strong> Anyone with basic knowledge can start. 
                  Index funds and ETFs let you invest in the whole market without picking individual stocks.
                </p>
              </div>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-6 mb-10 border border-indigo-200">
            <h2 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center gap-2">
              <Icons.Lightbulb className="w-6 h-6 text-indigo-600" />
              <span>Key Takeaways</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-indigo-800">
                  <strong>Stock market = Marketplace</strong> for buying/selling company ownership
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-indigo-800">
                  <strong>Shares = Small pieces</strong> of a company that you can own
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-indigo-800">
                  <strong>NSE & BSE</strong> are India's two main stock exchanges
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p className="text-indigo-800">
                  <strong>Anyone can start</strong> with small amounts through apps
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-xl">
                <span className="text-xl">✍️</span>
              </span>
              <span>Quick Quiz</span>
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                question="What is the stock market?"
                options={[
                  "A government bank where you deposit money",
                  "A marketplace where you can buy and sell ownership in companies",
                  "A place where only rich people can invest",
                  "A lottery system to win money"
                ]}
                correctAnswer={1}
                explanation="The stock market is a marketplace where people buy and sell shares (small pieces of ownership) in companies. It's not a bank, not limited to rich people, and definitely not a lottery!"
              />
              
              <QuizQuestion
                question="Why do companies sell shares to the public?"
                options={[
                  "They are required by law to sell shares",
                  "They want to give away their company",
                  "To raise money for growing their business",
                  "To reduce their profits"
                ]}
                correctAnswer={2}
                explanation="Companies sell shares to raise money without taking loans. This capital helps them expand, hire more people, build new products, and grow the business. Investors who buy these shares become part-owners."
              />
              
              <QuizQuestion
                question="What are NSE and BSE?"
                options={[
                  "Two government banks in India",
                  "India's two main stock exchanges",
                  "Mobile apps to buy stocks",
                  "Types of mutual funds"
                ]}
                correctAnswer={1}
                explanation="NSE (National Stock Exchange) and BSE (Bombay Stock Exchange) are India's two main stock exchanges. They're the official marketplaces where stocks are listed and traded. Apps like Zerodha and Groww connect to these exchanges."
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/learn/stock-market')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors w-full sm:w-auto justify-center"
            >
              <FaArrowLeft className="text-sm" />
              <span>Back to Module Overview</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/stock-market-lesson-2')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-indigo-600 hover:to-violet-600 text-white rounded-xl transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
            >
              <span>Next: What Are Shares?</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StockMarketLesson1;
