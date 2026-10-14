import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { moduleLabel } from "../../../../constants/learningModules";

// Custom SVG Icons
const Icons = {
  // Compare Icon
  Compare: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="7" height="16" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="4" width="7" height="16" rx="1" stroke="currentColor" strokeWidth="2"/>
      <path d="M6.5 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17.5 10V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Investor Icon (Plant/Growth)
  Investor: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 12C12 12 12 8 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 12C12 12 12 8 16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 8C12 8 12 5 9 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 8C12 8 12 5 15 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 22H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Trader Icon (Lightning/Speed)
  Trader: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Clock/Time Icon
  Time: ({ className = "w-6 h-6" }) => (
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
      <circle cx="8" cy="15" r="1" fill="currentColor"/>
      <circle cx="12" cy="15" r="1" fill="currentColor"/>
      <circle cx="16" cy="15" r="1" fill="currentColor"/>
    </svg>
  ),

  // Chart Icon
  Chart: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 14L10 11L13 14L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Research Icon
  Research: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
      <path d="M21 21L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M11 8V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 11H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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

  // Risk Icon
  Risk: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L22 20H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>
  ),

  // Money/Rupee Icon
  Rupee: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 7H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 11C8 11 10 11 11 13C12 15 8 17 8 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Stress Icon
  Stress: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 15C8.5 13.5 10 12 12 12C14 12 15.5 13.5 16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 9L7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 9L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Relax Icon
  Relax: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 14C8.5 15.5 10 17 12 17C14 17 15.5 15.5 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="9" cy="10" r="1" fill="currentColor"/>
      <circle cx="15" cy="10" r="1" fill="currentColor"/>
    </svg>
  ),

  // Tax Icon
  Tax: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 4V10" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Clock Icon (smaller)
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

  // Question Icon
  Question: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.3062 14.1652 11.4175 13 11.8293V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
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
                : "border-gray-200 hover:border-brand-line hover:bg-brand-soft"
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

const StockMarketLesson6 = () => {
  const navigate = useNavigate();

  return (
    <div className="text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/learn/stock-market')}
              className="flex items-center gap-2 text-gray-500 hover:text-brand transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span>{moduleLabel("stock-market")}</span>
            </button>
            <span className="px-3 py-1 bg-brand-soft text-brand rounded-full text-sm font-medium flex items-center gap-1.5">
              <Icons.Clock className="w-4 h-4" />
              8 min read
            </span>
          </div>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-white rounded-full text-sm font-semibold bg-brand-fill">
                Lesson 6 of 7
              </span>
              <span className="px-3 py-1 bg-brand-soft text-brand rounded-full text-sm">
                Beginner
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-sm bg-brand-soft">
                <Icons.Compare className="w-7 h-7 text-brand" />
              </span>
              <span>Investing vs Trading</span>
            </h1>
            <p className="text-lg text-gray-500">
              Two very different approaches to the stock market — which one suits you better?
            </p>
          </div>

          {/* The Hook */}
          <div className="rounded-2xl p-6 mb-10 border border-brand-line bg-brand-soft">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <Icons.Question className="w-6 h-6 text-brand" />
              </div>
              <div>
                <h3 className="font-semibold text-brand mb-2">"Should I Invest or Trade?"</h3>
                <p className="text-brand">
                  Your friend made Rs. 50,000 in one day trading Nifty options. Your uncle doubled his money 
                  in 5 years investing in TCS. Both are in the stock market — but playing completely different games. 
                  Understanding the difference will save you from choosing the wrong path!
                </p>
              </div>
            </div>
          </div>

          {/* Visual: The Two Approaches */}
          <div className="rounded-2xl p-6 mb-6 border border-gray-200 bg-brand-soft">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Two Different Mindsets</h2>
            
            <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 320" fill="none">
              {/* Investor Side */}
              <g transform="translate(50, 30)">
                <rect x="0" y="0" width="250" height="240" rx="16" fill="#F0FDF4" stroke="#16A34A" strokeWidth="3"/>
                <text x="125" y="30" textAnchor="middle" fill="#16A34A" fontSize="16" fontWeight="700">INVESTING</text>
                <text x="125" y="50" textAnchor="middle" fill="#16A34A" fontSize="10">"Plant a tree, watch it grow"</text>
                
                {/* Tree growing visualization */}
                <g transform="translate(75, 70)">
                  <rect x="45" y="100" width="10" height="40" fill="#654B26"/>
                  <circle cx="50" cy="80" r="30" fill="#16A34A"/>
                  <circle cx="35" cy="90" r="20" fill="#16A34A"/>
                  <circle cx="65" cy="90" r="20" fill="#16A34A"/>
                  <text x="50" y="85" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">5-20</text>
                  <text x="50" y="95" textAnchor="middle" fill="white" fontSize="8">YEARS</text>
                </g>
                
                {/* Key points */}
                <g transform="translate(20, 180)">
                  <text x="0" y="0" fill="#16A34A" fontSize="10">✓ Long-term wealth building</text>
                  <text x="0" y="18" fill="#16A34A" fontSize="10">✓ Less time-consuming</text>
                  <text x="0" y="36" fill="#16A34A" fontSize="10">✓ Lower stress</text>
                </g>
              </g>

              {/* VS Circle */}
              <g transform="translate(320, 120)">
                <circle cx="30" cy="30" r="28" fill="#EEEEF1" stroke="#CFD0D3" strokeWidth="3"/>
                <text x="30" y="36" textAnchor="middle" fill="#373A41" fontSize="14" fontWeight="700">VS</text>
              </g>

              {/* Trader Side */}
              <g transform="translate(400, 30)">
                <rect x="0" y="0" width="250" height="240" rx="16" fill="#F6ECCE" stroke="#B8923F" strokeWidth="3"/>
                <text x="125" y="30" textAnchor="middle" fill="#654B26" fontSize="16" fontWeight="700">TRADING</text>
                <text x="125" y="50" textAnchor="middle" fill="#7C5D2B" fontSize="10">"Catch waves in the ocean"</text>
                
                {/* Chart with quick moves */}
                <g transform="translate(25, 70)">
                  <rect x="0" y="0" width="200" height="100" rx="8" fill="white" stroke="#E2C273" strokeWidth="2"/>
                  <path d="M20 70 L50 50 L80 65 L110 30 L140 45 L170 25" stroke="#B8923F" strokeWidth="3" fill="none"/>
                  <circle cx="50" cy="50" r="4" fill="#16A34A"/>
                  <text x="50" y="45" textAnchor="middle" fill="#16A34A" fontSize="7">BUY</text>
                  <circle cx="110" cy="30" r="4" fill="#E04848"/>
                  <text x="110" y="25" textAnchor="middle" fill="#E04848" fontSize="7">SELL</text>
                  <text x="100" y="90" textAnchor="middle" fill="#654B26" fontSize="9">Minutes to Days</text>
                </g>
                
                {/* Key points */}
                <g transform="translate(20, 180)">
                  <text x="0" y="0" fill="#654B26" fontSize="10">✓ Quick profits possible</text>
                  <text x="0" y="18" fill="#654B26" fontSize="10">✓ Requires active monitoring</text>
                  <text x="0" y="36" fill="#654B26" fontSize="10">✓ Higher risk & stress</text>
                </g>
              </g>

              {/* Bottom note */}
              <g transform="translate(50, 285)">
                <rect x="0" y="0" width="600" height="30" rx="8" fill="#F0FDF4" stroke="#16A34A" strokeWidth="2"/>
                <text x="300" y="20" textAnchor="middle" fill="#16A34A" fontSize="11">
                  Neither is "better" — they serve different goals and suit different personalities
                </text>
              </g>
            </svg>
          </div>

          {/* Detailed Comparison Table */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Compare className="w-6 h-6 text-brand" />
              <span>Head-to-Head Comparison</span>
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-3 bg-gray-50 rounded-tl-lg">Aspect</th>
                    <th className="text-left p-3 bg-brand-soft">
                      <span className="flex items-center gap-2 text-brand">
                        <Icons.Investor className="w-5 h-5" />
                        Investing
                      </span>
                    </th>
                    <th className="text-left p-3 bg-amber-50 rounded-tr-lg">
                      <span className="flex items-center gap-2 text-amber-700">
                        <Icons.Trader className="w-5 h-5" />
                        Trading
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium text-gray-700">Time Horizon</td>
                    <td className="p-3 text-brand">Years to decades</td>
                    <td className="p-3 text-amber-700">Minutes to months</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50/50">
                    <td className="p-3 font-medium text-gray-700">Goal</td>
                    <td className="p-3 text-brand">Build wealth over time</td>
                    <td className="p-3 text-amber-700">Profit from price swings</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium text-gray-700">Analysis Type</td>
                    <td className="p-3 text-brand">Fundamental (company quality)</td>
                    <td className="p-3 text-amber-700">Technical (charts & patterns)</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50/50">
                    <td className="p-3 font-medium text-gray-700">Time Needed</td>
                    <td className="p-3 text-brand">Few hours per month</td>
                    <td className="p-3 text-amber-700">Hours every day</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium text-gray-700">Risk Level</td>
                    <td className="p-3 text-brand">Moderate (if diversified)</td>
                    <td className="p-3 text-amber-700">High (especially with leverage)</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50/50">
                    <td className="p-3 font-medium text-gray-700">Stress Level</td>
                    <td className="p-3 text-brand">Low to moderate</td>
                    <td className="p-3 text-amber-700">High (market timing pressure)</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium text-gray-700">Success Rate</td>
                    <td className="p-3 text-brand">Higher (historically ~12%/year)</td>
                    <td className="p-3 text-amber-700">Lower (~10% traders profit long-term)</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50/50">
                    <td className="p-3 font-medium text-gray-700">Tax Treatment</td>
                    <td className="p-3 text-brand">LTCG: 12.5% (after 1 year)</td>
                    <td className="p-3 text-amber-700">STCG: 20% (within 1 year)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Investor Profile */}
          <div className="rounded-2xl p-6 mb-6 border border-brand-line bg-brand-soft">
            <h2 className="text-xl font-semibold text-brand mb-4 flex items-center gap-2">
              <Icons.Investor className="w-6 h-6 text-brand" />
              <span>The Investor's Approach</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 border border-brand-line">
                <h4 className="font-bold text-brand mb-3">What Investors Do:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2 text-brand">
                    <Icons.Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                    <span>Buy quality companies with strong fundamentals</span>
                  </li>
                  <li className="flex items-start gap-2 text-brand">
                    <Icons.Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                    <span>Hold for years, ignore short-term volatility</span>
                  </li>
                  <li className="flex items-start gap-2 text-brand">
                    <Icons.Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                    <span>Benefit from dividends + price appreciation</span>
                  </li>
                  <li className="flex items-start gap-2 text-brand">
                    <Icons.Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                    <span>Let compounding work its magic</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 border border-brand-line">
                <h4 className="font-bold text-brand mb-3">Best Suited For:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2 text-brand">
                    <Icons.Person className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                    <span>People with full-time jobs</span>
                  </li>
                  <li className="flex items-start gap-2 text-brand">
                    <Icons.Person className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                    <span>Long-term financial goals (retirement, kids' education)</span>
                  </li>
                  <li className="flex items-start gap-2 text-brand">
                    <Icons.Person className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                    <span>Those who prefer less screen time</span>
                  </li>
                  <li className="flex items-start gap-2 text-brand">
                    <Icons.Person className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                    <span>Patient people who can handle temporary losses</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-brand-soft rounded-xl p-4">
              <p className="text-brand text-sm">
                <strong>Famous Example:</strong> Warren Buffett bought Coca-Cola shares in 1988 and still holds them. 
                His investment has grown 20x+ and he receives billions in dividends. That's the power of long-term investing!
              </p>
            </div>
          </div>

          {/* Trader Profile */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 mb-6 border border-amber-200">
            <h2 className="text-xl font-semibold text-amber-900 mb-4 flex items-center gap-2">
              <Icons.Trader className="w-6 h-6 text-amber-600" />
              <span>The Trader's Approach</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 border border-amber-200">
                <h4 className="font-bold text-amber-800 mb-3">What Traders Do:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2 text-amber-700">
                    <Icons.Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Buy and sell frequently (daily/weekly)</span>
                  </li>
                  <li className="flex items-start gap-2 text-amber-700">
                    <Icons.Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Use technical analysis (charts, indicators)</span>
                  </li>
                  <li className="flex items-start gap-2 text-amber-700">
                    <Icons.Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Often use leverage (F&O) for bigger gains</span>
                  </li>
                  <li className="flex items-start gap-2 text-amber-700">
                    <Icons.Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Profit in both rising AND falling markets</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 border border-amber-200">
                <h4 className="font-bold text-amber-800 mb-3">Best Suited For:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2 text-amber-700">
                    <Icons.Person className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Full-time traders (as a career)</span>
                  </li>
                  <li className="flex items-start gap-2 text-amber-700">
                    <Icons.Person className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>People who enjoy chart analysis</span>
                  </li>
                  <li className="flex items-start gap-2 text-amber-700">
                    <Icons.Person className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>High risk tolerance and capital to lose</span>
                  </li>
                  <li className="flex items-start gap-2 text-amber-700">
                    <Icons.Person className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Quick decision-makers, disciplined people</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-red-100 rounded-xl p-4">
              <p className="text-red-800 text-sm">
                <strong>Reality Check:</strong> SEBI studies show that 89% of individual F&O traders in India 
                lost money in FY22-23. The average loss was Rs. 1.1 lakh per person. Trading is NOT easy money — 
                most beginners lose before they learn!
              </p>
            </div>
          </div>

          {/* Types of Trading */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Time className="w-6 h-6 text-brand" />
              <span>Types of Trading (By Time)</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-2">Intraday Trading</h4>
                <p className="text-purple-700 text-sm mb-2">
                  Buy and sell within the same day. No overnight positions.
                </p>
                <p className="text-purple-600 text-xs">Time: Minutes to hours | Risk: Very High</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">Swing Trading</h4>
                <p className="text-blue-700 text-sm mb-2">
                  Hold for days to weeks. Catch "swings" in price movement.
                </p>
                <p className="text-blue-600 text-xs">Time: Days to weeks | Risk: High</p>
              </div>

              <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                <h4 className="font-bold text-teal-800 mb-2">Positional Trading</h4>
                <p className="text-teal-700 text-sm mb-2">
                  Hold for weeks to months based on trends.
                </p>
                <p className="text-teal-600 text-xs">Time: Weeks to months | Risk: Moderate-High</p>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <h4 className="font-bold text-amber-800 mb-2">Scalping</h4>
                <p className="text-amber-700 text-sm mb-2">
                  Very short trades — seconds to minutes. Many trades per day.
                </p>
                <p className="text-amber-600 text-xs">Time: Seconds to minutes | Risk: Extremely High</p>
              </div>
            </div>
          </div>

          {/* India Focus Section */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-2xl p-6 mb-10 border border-orange-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.IndiaFlag className="w-6 h-6 text-orange-600" />
              <span>India Focus: The Numbers Don't Lie</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-3">Indian Stock Market Returns</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-brand-fill rounded-full"></span>
                    <span>Nifty 50 CAGR (20 years): ~12-14%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-brand-fill rounded-full"></span>
                    <span>SIP in index fund (15 years): ~12%+ returns</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-brand-fill rounded-full"></span>
                    <span>Long-term equity investing works!</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-3">Trading Reality in India</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>89% F&O traders lose money (SEBI 2023)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>Average loss: Rs. 1.1 lakh/year</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    <span>Only top 1% make consistent profits</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 bg-brand-soft rounded-lg border border-brand-line">
              <p className="text-brand text-sm">
                <strong>Recommendation for Beginners:</strong> Start with investing, not trading. Build wealth 
                slowly through SIPs in good stocks or index funds. Once you understand markets well (1-2 years), 
                you can explore trading with a small portion of your capital.
              </p>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="rounded-2xl p-6 mb-10 border border-brand-line bg-brand-soft">
            <h2 className="text-xl font-semibold text-brand mb-4 flex items-center gap-2">
              <Icons.Lightbulb className="w-6 h-6 text-brand" />
              <span>Key Takeaways</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brand-fill rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-brand">
                  <strong>Investing = Long-term</strong> (years), <strong>Trading = Short-term</strong> (days/weeks)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brand-fill rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-brand">
                  <strong>Trading is harder</strong> — 89% of F&O traders lose money
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brand-fill rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-brand">
                  <strong>Beginners should invest</strong> — Start with SIPs, learn for 1-2 years first
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brand-fill rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p className="text-brand">
                  <strong>Neither is "wrong"</strong> — Choose based on your goals, time, and risk appetite
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-brand-soft rounded-xl">
                <span className="text-xl">✍️</span>
              </span>
              <span>Quick Quiz</span>
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                question="You have a full-time job and want to grow your savings over 10 years. Which approach suits you better?"
                options={[
                  "Intraday trading for quick profits",
                  "Long-term investing in quality stocks or mutual funds",
                  "Scalping in F&O markets",
                  "Both trading and investing equally"
                ]}
                correctAnswer={1}
                explanation="Long-term investing is ideal for people with jobs! You don't need to monitor markets daily, and historical data shows investing in quality stocks/index funds delivers ~12% returns over long periods. Trading requires full-time attention."
              />
              
              <QuizQuestion
                question="According to SEBI data, what percentage of F&O traders in India made losses in 2022-23?"
                options={[
                  "About 30%",
                  "About 50%",
                  "About 89%",
                  "About 10%"
                ]}
                correctAnswer={2}
                explanation="SEBI's 2023 study revealed that 89% of individual F&O traders lost money, with average losses of Rs. 1.1 lakh per person. This is why trading is NOT recommended for beginners!"
              />
              
              <QuizQuestion
                question="What's the main difference between investing and trading?"
                options={[
                  "Investors use only mutual funds, traders use only stocks",
                  "Investing is for rich people, trading is for everyone",
                  "Investing focuses on long-term wealth, trading focuses on short-term price movements",
                  "There is no real difference"
                ]}
                correctAnswer={2}
                explanation="The core difference is TIME HORIZON. Investors buy and hold for years, focusing on company fundamentals and long-term growth. Traders buy and sell frequently (days/weeks), focusing on price patterns and short-term movements."
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/learn/stock-market-lesson-5')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors w-full sm:w-auto justify-center"
            >
              <FaArrowLeft className="text-sm" />
              <span>Previous: Why Stock Prices Move</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/stock-market-lesson-7')}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center bg-brand-fill"
            >
              <span>Next: Common Beginner Mistakes</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StockMarketLesson6;
