import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { moduleLabel } from "../../../../constants/learningModules";

// Custom SVG Icons
const Icons = {
  // Share/Pie Icon
  Share: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 3V12L19 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Pizza Icon
  Pizza: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 3V12" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 12L19.8 8" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 12L4.2 8" stroke="currentColor" strokeWidth="2"/>
      <circle cx="9" cy="9" r="1" fill="currentColor"/>
      <circle cx="15" cy="14" r="1" fill="currentColor"/>
      <circle cx="10" cy="15" r="1" fill="currentColor"/>
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

  // Certificate/Document Icon
  Certificate: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 6H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 14H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="15" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
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

  // Dividend Icon
  Dividend: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 9L12 6L9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 15L12 18L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

  // Cross Icon
  Cross: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Vote Icon
  Vote: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 14L10 16L14 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // People Icon
  People: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="17" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 19C3 15.6863 5.68629 14 9 14C10.5 14 11.5 14.5 12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M21 19C21 15.6863 18.3137 14 15 14C14.5 14 14 14.1 13.5 14.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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

  // Price Tag Icon
  PriceTag: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="7" cy="7" r="2" fill="currentColor"/>
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
                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
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

const StockMarketLesson2 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-blue-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/learn/stock-market')}
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span>{moduleLabel("stock-market")}</span>
            </button>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Icons.Clock className="w-4 h-4" />
              7 min read
            </span>
          </div>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-white rounded-full text-sm font-semibold bg-brand-fill">
                Lesson 2 of 7
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Beginner
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl shadow-sm">
                <Icons.Share className="w-7 h-7 text-blue-600" />
              </span>
              <span>What Are Shares?</span>
            </h1>
            <p className="text-lg text-gray-500">
              Understanding how you can own a piece of any company — even giant ones like TCS or Reliance.
            </p>
          </div>

          {/* The Hook - Pizza Analogy */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-10 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <Icons.Pizza className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Think of a Pizza...</h3>
                <p className="text-blue-800">
                  Imagine a pizza cut into 8 slices. Each slice is a <strong>share</strong> of the pizza. 
                  If you buy 2 slices, you own 2/8 (or 25%) of the pizza. Companies work the same way — 
                  they're divided into millions of "slices" called shares, and you can buy as many as you want!
                </p>
              </div>
            </div>
          </div>

          {/* Visual: Pizza to Shares Analogy */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Share className="w-6 h-6 text-blue-600" />
              <span>Shares = Slices of a Company</span>
            </h2>
            
            <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 280" fill="none">
              {/* Left Side - Pizza */}
              <g transform="translate(50, 30)">
                <text x="100" y="0" textAnchor="middle" fill="#373A41" fontSize="14" fontWeight="700">Pizza = 8 Slices</text>
                
                {/* Pizza circle with slices */}
                <circle cx="100" cy="100" r="70" fill="#CDAA5F" stroke="#B8923F" strokeWidth="3"/>
                {/* Slice lines */}
                <line x1="100" y1="30" x2="100" y2="170" stroke="#654B26" strokeWidth="2"/>
                <line x1="30" y1="100" x2="170" y2="100" stroke="#654B26" strokeWidth="2"/>
                <line x1="50" y1="50" x2="150" y2="150" stroke="#654B26" strokeWidth="2"/>
                <line x1="150" y1="50" x2="50" y2="150" stroke="#654B26" strokeWidth="2"/>
                {/* Toppings */}
                <circle cx="80" cy="70" r="6" fill="#E04848"/>
                <circle cx="120" cy="85" r="6" fill="#E04848"/>
                <circle cx="90" cy="120" r="6" fill="#E04848"/>
                <circle cx="115" cy="130" r="6" fill="#12805A"/>
                <circle cx="75" cy="105" r="6" fill="#12805A"/>
                
                <text x="100" y="195" textAnchor="middle" fill="#654B26" fontSize="11">You buy 2 slices</text>
                <text x="100" y="210" textAnchor="middle" fill="#654B26" fontSize="11">= You own 25% of pizza</text>
              </g>

              {/* Arrow */}
              <g transform="translate(280, 90)">
                <rect x="0" y="0" width="80" height="40" rx="8" fill="#5A77AA"/>
                <text x="40" y="18" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">Same</text>
                <text x="40" y="32" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">Concept!</text>
              </g>

              {/* Right Side - Company */}
              <g transform="translate(400, 30)">
                <text x="125" y="0" textAnchor="middle" fill="#373A41" fontSize="14" fontWeight="700">Reliance = 676 Cr Shares</text>
                
                {/* Company building representation */}
                <rect x="50" y="20" width="150" height="150" rx="12" fill="#8F6FC4" stroke="#7A5BA6" strokeWidth="3"/>
                
                {/* Grid pattern to show many shares */}
                <g transform="translate(60, 30)">
                  {[...Array(5)].map((_, row) => (
                    [...Array(6)].map((_, col) => (
                      <rect 
                        key={`${row}-${col}`}
                        x={col * 22} 
                        y={row * 26} 
                        width="18" 
                        height="22" 
                        rx="2" 
                        fill={row === 0 && col < 2 ? "#12805A" : "#C0A9E2"}
                        stroke="#7A5BA6"
                        strokeWidth="1"
                      />
                    ))
                  ))}
                </g>
                
                <text x="125" y="195" textAnchor="middle" fill="#7A5BA6" fontSize="11">You buy 100 shares</text>
                <text x="125" y="210" textAnchor="middle" fill="#7A5BA6" fontSize="11">= You're a part-owner!</text>
              </g>

              {/* Bottom insight */}
              <g transform="translate(50, 240)">
                <rect x="0" y="0" width="600" height="35" rx="8" fill="#E0E7F1" stroke="#9FB3D3" strokeWidth="2"/>
                <text x="300" y="22" textAnchor="middle" fill="#2C3F5E" fontSize="11">
                  The more shares you own, the bigger your ownership stake in the company
                </text>
              </g>
            </svg>
          </div>

          {/* Simple Definition */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Lightbulb className="w-6 h-6 text-amber-500" />
              <span>The Simple Definition</span>
            </h2>
            
            <div className="rounded-xl p-6 text-white mb-4 bg-brand-fill">
              <p className="text-xl font-semibold text-center">
                A <span className="underline decoration-yellow-300 decoration-2">share</span> is a 
                <span className="underline decoration-yellow-300 decoration-2"> unit of ownership</span> in a company.
                <br />
                <span className="text-blue-100 text-base">Share = Stock = Equity (all mean the same thing!)</span>
              </p>
            </div>
            
            <p className="text-gray-600">
              When you buy a share of a company, you become a <strong>shareholder</strong> — 
              a part-owner of that business. Even if you own just 1 share out of crores, 
              you legally own a tiny piece of the company.
            </p>
          </div>

          {/* What Ownership Means */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Certificate className="w-6 h-6 text-blue-600" />
              <span>What Does Owning Shares Mean?</span>
            </h2>
            
            <p className="text-gray-600 mb-4">
              As a shareholder, you get certain rights. Here's what you can and can't do:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-brand-soft rounded-xl p-4 border border-brand-line">
                <h4 className="font-bold text-brand mb-3">You CAN:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-brand text-sm">
                    <Icons.Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                    <span><strong>Share in profits</strong> — Get dividends when company shares profits</span>
                  </li>
                  <li className="flex items-start gap-2 text-brand text-sm">
                    <Icons.Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                    <span><strong>Benefit from growth</strong> — Share price rises when company grows</span>
                  </li>
                  <li className="flex items-start gap-2 text-brand text-sm">
                    <Icons.Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                    <span><strong>Vote on decisions</strong> — Vote in company meetings (AGMs)</span>
                  </li>
                  <li className="flex items-start gap-2 text-brand text-sm">
                    <Icons.Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                    <span><strong>Sell anytime</strong> — Sell your shares to anyone in the market</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h4 className="font-bold text-red-800 mb-3">You CAN'T:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-red-700 text-sm">
                    <Icons.Cross className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Walk into office</strong> — You can't just enter and use company property</span>
                  </li>
                  <li className="flex items-start gap-2 text-red-700 text-sm">
                    <Icons.Cross className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Take products</strong> — Owning TCS shares doesn't give you free software</span>
                  </li>
                  <li className="flex items-start gap-2 text-red-700 text-sm">
                    <Icons.Cross className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Make daily decisions</strong> — That's the CEO's job, not yours</span>
                  </li>
                  <li className="flex items-start gap-2 text-red-700 text-sm">
                    <Icons.Cross className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Demand salary</strong> — You're an owner, not an employee</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* How Shareholders Make Money */}
          <div className="rounded-2xl p-6 mb-6 border border-gray-200 bg-brand-soft">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Rupee className="w-6 h-6 text-brand" />
              <span>How Do Shareholders Make Money?</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Capital Gains */}
              <div className="bg-white rounded-xl p-5 border border-brand-line">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-brand-soft rounded-lg flex items-center justify-center">
                    <Icons.Growth className="w-6 h-6 text-brand" />
                  </div>
                  <h4 className="font-bold text-gray-900">1. Capital Gains</h4>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  Buy low, sell high. If the share price goes up, you profit!
                </p>
                <div className="bg-brand-soft rounded-lg p-3 text-sm">
                  <p className="text-brand">
                    <strong>Example:</strong><br/>
                    Buy Infosys at Rs. 1,400<br/>
                    Sell after 2 years at Rs. 1,800<br/>
                    <span className="font-bold">Profit: Rs. 400 per share (28.5% gain)</span>
                  </p>
                </div>
              </div>

              {/* Dividends */}
              <div className="bg-white rounded-xl p-5 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icons.Dividend className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900">2. Dividends</h4>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  Some companies share profits with shareholders regularly.
                </p>
                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                  <p className="text-blue-800">
                    <strong>Example:</strong><br/>
                    Own 100 shares of ITC<br/>
                    ITC pays Rs. 6.25 per share dividend<br/>
                    <span className="font-bold">You receive: Rs. 625 (just for holding!)</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-amber-800 text-sm">
                <strong>Important:</strong> Not all companies pay dividends. Growth companies like Zomato 
                reinvest profits back into the business instead of distributing them. That's okay — 
                you can still benefit from capital gains if the share price rises!
              </p>
            </div>
          </div>

          {/* Visual: Share Price Example */}
          <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.PriceTag className="w-6 h-6 text-indigo-600" />
              <span>Understanding Share Prices</span>
            </h2>
            
            <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 250" fill="none">
              {/* Header */}
              <text x="350" y="25" textAnchor="middle" fill="#373A41" fontSize="13" fontWeight="600">
                What does "Reliance is at Rs. 2,500" mean?
              </text>

              {/* Share price box */}
              <g transform="translate(50, 50)">
                <rect x="0" y="0" width="200" height="120" rx="12" fill="#8F6FC4"/>
                <text x="100" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">RELIANCE INDUSTRIES</text>
                <text x="100" y="70" textAnchor="middle" fill="#D9CBEE" fontSize="11">Current Share Price</text>
                <text x="100" y="100" textAnchor="middle" fill="white" fontSize="24" fontWeight="700">₹ 2,500</text>
              </g>

              {/* Equals sign */}
              <text x="280" y="110" textAnchor="middle" fill="#8F6FC4" fontSize="30" fontWeight="700">=</text>

              {/* Explanation */}
              <g transform="translate(320, 50)">
                <rect x="0" y="0" width="330" height="120" rx="12" fill="#EEF9F4" stroke="#3CCB97" strokeWidth="2"/>
                <text x="165" y="30" textAnchor="middle" fill="#12805A" fontSize="12" fontWeight="700">Cost to Buy 1 Share of Reliance</text>
                
                <g transform="translate(20, 50)">
                  <text x="0" y="15" fill="#12805A" fontSize="11">• With Rs. 2,500 → You buy 1 share</text>
                  <text x="0" y="35" fill="#12805A" fontSize="11">• With Rs. 25,000 → You buy 10 shares</text>
                  <text x="0" y="55" fill="#12805A" fontSize="11">• With Rs. 2,50,000 → You buy 100 shares</text>
                </g>
              </g>

              {/* Bottom note */}
              <g transform="translate(50, 190)">
                <rect x="0" y="0" width="600" height="50" rx="10" fill="#F6ECCE" stroke="#E2C273" strokeWidth="2"/>
                <text x="300" y="20" textAnchor="middle" fill="#654B26" fontSize="11" fontWeight="600">
                  Different companies have different share prices
                </text>
                <text x="300" y="38" textAnchor="middle" fill="#654B26" fontSize="10">
                  TCS: ~Rs. 3,500 | Infosys: ~Rs. 1,500 | Yes Bank: ~Rs. 20 | Tata Steel: ~Rs. 150
                </text>
              </g>
            </svg>
          </div>

          {/* Face Value vs Market Price */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Question className="w-6 h-6 text-purple-600" />
              <span>Face Value vs Market Price</span>
            </h2>
            
            <p className="text-gray-600 mb-4">
              Two terms you'll hear often. Don't confuse them:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-2">Face Value</h4>
                <p className="text-purple-700 text-sm mb-2">
                  The original value assigned when company first issued shares. Usually Rs. 1, 2, 5, or 10.
                </p>
                <p className="text-purple-600 text-xs">
                  Think of it like the "original price tag" — mostly for accounting purposes.
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">Market Price</h4>
                <p className="text-blue-700 text-sm mb-2">
                  The price at which shares are currently being bought/sold. Changes every second!
                </p>
                <p className="text-blue-600 text-xs">
                  This is what you actually pay when buying. Based on supply & demand.
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-700 text-sm">
                <strong>Example:</strong> Reliance's face value is Rs. 10, but market price is Rs. 2,500+. 
                The market price is 250x the face value! This shows how much the company has grown since it started.
              </p>
            </div>
          </div>

          {/* India Focus Section */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-2xl p-6 mb-10 border border-orange-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.IndiaFlag className="w-6 h-6 text-orange-600" />
              <span>India Focus: Real Examples</span>
            </h2>
            
            <p className="text-gray-700 mb-4">
              Here's what owning shares in some popular Indian companies looks like:
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 rounded-tl-lg">Company</th>
                    <th className="text-left p-3">Share Price (approx)</th>
                    <th className="text-left p-3">Total Shares</th>
                    <th className="text-left p-3 rounded-tr-lg">If you buy 10 shares</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium text-gray-900">Reliance</td>
                    <td className="p-3 text-gray-600">Rs. 2,500</td>
                    <td className="p-3 text-gray-600">676 Cr shares</td>
                    <td className="p-3 text-brand">Cost: Rs. 25,000</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50/50">
                    <td className="p-3 font-medium text-gray-900">TCS</td>
                    <td className="p-3 text-gray-600">Rs. 3,500</td>
                    <td className="p-3 text-gray-600">366 Cr shares</td>
                    <td className="p-3 text-brand">Cost: Rs. 35,000</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium text-gray-900">HDFC Bank</td>
                    <td className="p-3 text-gray-600">Rs. 1,700</td>
                    <td className="p-3 text-gray-600">760 Cr shares</td>
                    <td className="p-3 text-brand">Cost: Rs. 17,000</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50/50">
                    <td className="p-3 font-medium text-gray-900">ITC</td>
                    <td className="p-3 text-gray-600">Rs. 450</td>
                    <td className="p-3 text-gray-600">1,245 Cr shares</td>
                    <td className="p-3 text-brand">Cost: Rs. 4,500</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium text-gray-900">Yes Bank</td>
                    <td className="p-3 text-gray-600">Rs. 20</td>
                    <td className="p-3 text-gray-600">2,963 Cr shares</td>
                    <td className="p-3 text-brand">Cost: Rs. 200</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-gray-500 text-xs mt-3 italic">
              * Prices are approximate and change daily. Lower price doesn't mean better investment!
            </p>
          </div>

          {/* Key Takeaways */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-10 border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Icons.Lightbulb className="w-6 h-6 text-blue-600" />
              <span>Key Takeaways</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-blue-800">
                  <strong>Shares = Ownership units</strong> — like slices of a company pizza
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-blue-800">
                  <strong>Two ways to profit</strong> — Capital gains (price up) or Dividends (profit sharing)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-blue-800">
                  <strong>Market price ≠ Face value</strong> — You pay market price, which changes daily
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p className="text-blue-800">
                  <strong>Lower price ≠ Better deal</strong> — A Rs. 3,000 share can be cheaper than a Rs. 30 share
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                <span className="text-xl">✍️</span>
              </span>
              <span>Quick Quiz</span>
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                question="What is a share?"
                options={[
                  "A loan you give to a company",
                  "A unit of ownership in a company",
                  "A fixed deposit in the stock market",
                  "A type of mutual fund"
                ]}
                correctAnswer={1}
                explanation="A share represents a unit of ownership in a company. When you buy shares, you become a part-owner (shareholder) of that company and are entitled to share in its profits and growth."
              />
              
              <QuizQuestion
                question="If Infosys has 420 crore shares and you own 100 shares, what do you own?"
                options={[
                  "100% of Infosys",
                  "A very tiny fraction of Infosys — but you're still a part-owner!",
                  "Nothing, 100 shares is too small",
                  "Only the right to use Infosys products"
                ]}
                correctAnswer={1}
                explanation="Even with just 100 shares out of 420 crore, you are legally a part-owner of Infosys! You can attend shareholder meetings, receive dividends, and benefit from the company's growth. Every shareholder counts, no matter how small."
              />
              
              <QuizQuestion
                question="How can shareholders make money?"
                options={[
                  "Only through dividends",
                  "Only through selling shares at higher prices",
                  "Through capital gains (price increase) and/or dividends",
                  "By working for the company they own shares in"
                ]}
                correctAnswer={2}
                explanation="Shareholders can make money in two ways: (1) Capital gains — when share price goes up and they sell for profit, and (2) Dividends — when companies share their profits with shareholders. Not all companies pay dividends, but you can still benefit from price appreciation."
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/learn/stock-market-lesson-1')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors w-full sm:w-auto justify-center"
            >
              <FaArrowLeft className="text-sm" />
              <span>Previous: What is the Stock Market?</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/stock-market-lesson-3')}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center bg-brand-fill hover:bg-brand-hover"
            >
              <span>Next: How Buying & Selling Works</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StockMarketLesson2;
