import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaTrophy } from "react-icons/fa";

// Custom SVG Icons
const Icons = {
  // Self Assessment Icon
  SelfAssess: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 21V19C4 16.2386 6.23858 14 9 14H15C17.7614 14 20 16.2386 20 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 14V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 19L12 21L14 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Question Icon
  Question: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.3062 14.1652 11.4174 13 11.8293V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>
  ),

  // Checklist Icon
  Checklist: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 10L11 12L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Money Icon
  Money: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M6 9V9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 15V15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Time Icon
  Clock: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Alternative Path Icon
  Path: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12H8L10 8L14 16L16 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

  // Invest Icon
  Invest: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 21L7 17L10 19L14 14L17 16L21 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 11V15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="3" y="3" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
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

  // Trophy Icon
  Trophy: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 4H17V10C17 13.3137 14.7614 16 12 16C9.23858 16 7 13.3137 7 10V4Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 7H4C4 9.76142 5.79086 12 8 12" stroke="currentColor" strokeWidth="2"/>
      <path d="M17 7H20C20 9.76142 18.2091 12 16 12" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Heart Icon
  Heart: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21C12 21 3 14.5 3 8.5C3 5.5 5.5 3 8.5 3C10.04 3 11.54 3.81 12 5C12.46 3.81 13.96 3 15.5 3C18.5 3 21 5.5 21 8.5C21 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // SIP Icon
  SIP: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 8V6C7 4.89543 7.89543 4 9 4H15C16.1046 4 17 4.89543 17 6V8" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 14H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Book Icon  
  Book: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 19.5C4 18.12 5.12 17 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M6.5 2H20V22H6.5C5.12 22 4 20.88 4 19.5V4.5C4 3.12 5.12 2 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 6H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 10H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
};

// Assessment Question Component
const AssessmentQuestion = ({ number, question, yesText, noText, yesScore, noScore, onAnswer, answered, value }) => {
  return (
    <div className={`bg-white rounded-xl p-5 border-2 transition-all ${answered ? 'border-indigo-300' : 'border-gray-200'} mb-4`}>
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-indigo-600 font-bold text-sm">{number}</span>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-3">{question}</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onAnswer(yesScore)}
              className={`p-3 rounded-lg border-2 text-sm transition-all ${
                answered && value === yesScore 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              <span className="font-medium">✓ Yes</span>
              <p className="text-xs text-gray-500 mt-1">{yesText}</p>
            </button>
            <button
              onClick={() => onAnswer(noScore)}
              className={`p-3 rounded-lg border-2 text-sm transition-all ${
                answered && value === noScore 
                  ? 'border-red-500 bg-red-50 text-red-700' 
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              <span className="font-medium">✗ No</span>
              <p className="text-xs text-gray-500 mt-1">{noText}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Alternative Option Card
const AlternativeCard = ({ icon: Icon, title, description, returns, risk, effort, bestFor }) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        <h4 className="font-bold text-gray-900">{title}</h4>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Expected Returns:</span>
          <span className="font-medium text-green-600">{returns}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Risk Level:</span>
          <span className="font-medium text-amber-600">{risk}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Time/Effort:</span>
          <span className="font-medium text-blue-600">{effort}</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500"><strong>Best for:</strong> {bestFor}</p>
      </div>
    </div>
  );
};

const TradingBasicsLesson7 = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const questions = [
    {
      id: 1,
      question: "Do you have at least 6 months of emergency fund saved separately?",
      yesText: "Fully funded emergency reserve",
      noText: "Still building or none",
      yesScore: 2,
      noScore: 0
    },
    {
      id: 2,
      question: "Do you have stable income from a job or business?",
      yesText: "Reliable monthly income",
      noText: "Depending on trading income",
      yesScore: 2,
      noScore: 0
    },
    {
      id: 3,
      question: "Can you afford to lose 100% of your trading capital without affecting your life?",
      yesText: "It's truly disposable money",
      noText: "Would create problems",
      yesScore: 2,
      noScore: 0
    },
    {
      id: 4,
      question: "Have you spent at least 6 months studying markets seriously (not just YouTube)?",
      yesText: "Read books, courses, practiced",
      noText: "Just starting out",
      yesScore: 2,
      noScore: 0
    },
    {
      id: 5,
      question: "Do you have a written trading plan with specific entry/exit rules?",
      yesText: "Documented system",
      noText: "Trading by intuition",
      yesScore: 2,
      noScore: 0
    },
    {
      id: 6,
      question: "Have you paper traded or backtested your strategy for at least 3 months?",
      yesText: "Tested without real money",
      noText: "Going straight to live",
      yesScore: 2,
      noScore: 0
    },
    {
      id: 7,
      question: "Can you handle losing 5 trades in a row without emotional distress?",
      yesText: "Part of the process",
      noText: "Would feel devastated",
      yesScore: 2,
      noScore: 0
    },
    {
      id: 8,
      question: "Do you understand that 89% of traders lose money and you're probably not special?",
      yesText: "Aware and humble",
      noText: "I'll be different",
      yesScore: 2,
      noScore: 0
    },
    {
      id: 9,
      question: "Are you willing to treat this as a 2-3 year learning journey, not a quick income source?",
      yesText: "Long-term commitment",
      noText: "Want quick results",
      yesScore: 2,
      noScore: 0
    },
    {
      id: 10,
      question: "Is your trading capital at least Rs. 5 lakhs (for meaningful position sizing)?",
      yesText: "Adequate capital",
      noText: "Starting small",
      yesScore: 2,
      noScore: 0
    }
  ];

  const handleAnswer = (id, score) => {
    setAnswers(prev => ({ ...prev, [id]: score }));
  };

  const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
  const allAnswered = Object.keys(answers).length === questions.length;

  const getResult = () => {
    if (totalScore >= 16) {
      return {
        title: "You MAY be ready to trade",
        color: "green",
        message: "You have the financial foundation and mindset prerequisites. But remember: even with all boxes checked, most traders still lose. Start small, stay humble, and never stop learning.",
        recommendation: "Start with small positions (max 1% risk per trade) and track everything in a journal for at least 6 months."
      };
    } else if (totalScore >= 10) {
      return {
        title: "Not quite ready yet",
        color: "amber",
        message: "You have some prerequisites but critical gaps remain. Trading now would likely result in losses. Focus on filling the gaps first.",
        recommendation: "Work on the areas you answered 'No' to. Consider paper trading while building your foundation. Come back in 6 months."
      };
    } else {
      return {
        title: "Trading is NOT for you right now",
        color: "red",
        message: "You're missing too many prerequisites. Trading now would almost certainly result in significant losses. The good news? There are better alternatives for you.",
        recommendation: "Focus on building emergency fund, stable income, and financial knowledge first. Consider SIPs in index funds instead. Revisit trading after 1-2 years."
      };
    }
  };

  const result = getResult();

  return (
    <div className="bg-gradient-to-b from-white to-indigo-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/learn/trading-basics')}
              className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span>Module 4: Trading Basics</span>
            </button>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Icons.Clock className="w-4 h-4" />
              10 min read
            </span>
          </div>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-semibold">
                Lesson 7 of 7
              </span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                Final Assessment
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-xl shadow-sm">
                <Icons.SelfAssess className="w-7 h-7 text-indigo-600" />
              </span>
              <span>Should You Trade?</span>
            </h1>
            <p className="text-lg text-gray-500">
              An honest self-assessment. Not everyone should trade — and that's okay. Let's find out if trading is right for you.
            </p>
          </div>

          {/* The Hook */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-10 border-2 border-indigo-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <Icons.Question className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-900 mb-2">The Question Nobody Asks</h3>
                <p className="text-indigo-800">
                  Everyone asks "How do I trade?" or "Which stock should I buy?" But the most important question is: 
                  <strong> "Should I be trading at all?"</strong> This lesson will help you answer honestly.
                </p>
              </div>
            </div>
          </div>

          {/* The Uncomfortable Truth */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Warning className="w-6 h-6 text-amber-500" />
              <span>The Uncomfortable Truth</span>
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Trading is not for everyone.</strong> In fact, it's probably not for most people. Here's why:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h4 className="font-bold text-red-800 mb-2">Trading Requires:</h4>
                  <ul className="space-y-1 text-sm text-red-700">
                    <li>• Significant capital you can lose</li>
                    <li>• Years of study and practice</li>
                    <li>• Emotional discipline most don't have</li>
                    <li>• Time to monitor markets</li>
                    <li>• A real statistical edge</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2">Investing (SIP) Requires:</h4>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>• Any amount (even Rs. 500/month)</li>
                    <li>• Basic knowledge (few hours)</li>
                    <li>• Patience (not discipline)</li>
                    <li>• 10 minutes/month</li>
                    <li>• Market participation, not beating</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-amber-800 text-sm">
                  <strong>Real talk:</strong> A Rs. 10,000/month SIP in a Nifty 50 index fund, held for 20 years at 12% returns, 
                  would grow to approximately <strong>Rs. 1 crore</strong>. No stress, no daily charts, no sleepless nights. 
                  Most "successful" traders don't beat this.
                </p>
              </div>
            </div>
          </div>

          {/* Self Assessment Quiz */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Icons.Checklist className="w-6 h-6 text-indigo-600" />
              <span>Self-Assessment: Are You Ready?</span>
            </h2>
            <p className="text-gray-600 mb-6">
              Answer honestly. Nobody is watching. This is for YOUR clarity.
            </p>

            <div className="space-y-2">
              {questions.map((q) => (
                <AssessmentQuestion
                  key={q.id}
                  number={q.id}
                  question={q.question}
                  yesText={q.yesText}
                  noText={q.noText}
                  yesScore={q.yesScore}
                  noScore={q.noScore}
                  onAnswer={(score) => handleAnswer(q.id, score)}
                  answered={answers[q.id] !== undefined}
                  value={answers[q.id]}
                />
              ))}
            </div>

            {/* Score Display */}
            {allAnswered && (
              <div className={`mt-6 rounded-2xl p-6 border-2 ${
                result.color === 'green' ? 'bg-green-50 border-green-300' :
                result.color === 'amber' ? 'bg-amber-50 border-amber-300' :
                'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    result.color === 'green' ? 'bg-green-500' :
                    result.color === 'amber' ? 'bg-amber-500' :
                    'bg-red-500'
                  }`}>
                    <span className="text-white font-bold text-lg">{totalScore}</span>
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${
                      result.color === 'green' ? 'text-green-800' :
                      result.color === 'amber' ? 'text-amber-800' :
                      'text-red-800'
                    }`}>{result.title}</h3>
                    <p className="text-sm text-gray-600">Score: {totalScore}/20</p>
                  </div>
                </div>
                <p className={`mb-3 ${
                  result.color === 'green' ? 'text-green-700' :
                  result.color === 'amber' ? 'text-amber-700' :
                  'text-red-700'
                }`}>{result.message}</p>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm"><strong>Recommendation:</strong> {result.recommendation}</p>
                </div>
              </div>
            )}

            {!allAnswered && (
              <p className="text-center text-gray-500 mt-4 text-sm">
                Answer all {questions.length} questions to see your result ({Object.keys(answers).length}/{questions.length} completed)
              </p>
            )}
          </div>

          {/* Better Alternatives */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-indigo-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Path className="w-6 h-6 text-indigo-600" />
              <span>Alternatives to Active Trading</span>
            </h2>
            <p className="text-gray-600 mb-6">
              If trading isn't right for you now, these options can build wealth with less risk and stress:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <AlternativeCard
                icon={Icons.SIP}
                title="SIP in Index Funds"
                description="Automatic monthly investment in Nifty 50 or Nifty Next 50 index funds. Set it and forget it."
                returns="10-12% CAGR (long term)"
                risk="Low-Medium"
                effort="10 min/month"
                bestFor="Everyone. Seriously, start here."
              />
              
              <AlternativeCard
                icon={Icons.Invest}
                title="Direct Equity (Long Term)"
                description="Buy quality stocks and hold for 5-10+ years. No trading, just ownership."
                returns="12-15% CAGR (long term)"
                risk="Medium"
                effort="Few hours/month research"
                bestFor="Those who enjoy company analysis"
              />
              
              <AlternativeCard
                icon={Icons.Money}
                title="Fixed Income"
                description="FDs, PPF, debt mutual funds. Lower returns but capital protection."
                returns="6-8% per year"
                risk="Low"
                effort="Minimal"
                bestFor="Risk-averse, emergency funds"
              />
              
              <AlternativeCard
                icon={Icons.Book}
                title="Skill Building"
                description="Invest in yourself. Career growth often gives better ROI than trading."
                returns="20-50%+ salary increase"
                risk="None"
                effort="Hours/week"
                bestFor="Young professionals"
              />
            </div>
          </div>

          {/* If You Still Want to Trade */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.Checklist className="w-6 h-6 text-indigo-600" />
              <span>If You STILL Want to Trade...</span>
            </h2>
            
            <p className="text-gray-700 mb-4">
              Despite everything you've learned, if trading still calls to you, here's the ONLY responsible way to start:
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Complete your financial foundation first</h4>
                  <p className="text-sm text-gray-600">Emergency fund (6 months), health insurance, no high-interest debt, SIPs running.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Study for 6+ months before risking money</h4>
                  <p className="text-sm text-gray-600">Books (not YouTube), courses, paper trading. Treat it like getting a degree.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Start with cash equity only (no F&O)</h4>
                  <p className="text-sm text-gray-600">No leverage means you can't blow up. F&O is for professionals with years of experience.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Risk only money you can 100% lose</h4>
                  <p className="text-sm text-gray-600">Call it "tuition money." Assume it's gone. If losing it would hurt, don't trade it.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">5</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Keep a detailed trading journal</h4>
                  <p className="text-sm text-gray-600">Every trade, every emotion, every lesson. Review weekly. This is non-negotiable.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">6</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Set a "quit line" before you start</h4>
                  <p className="text-sm text-gray-600">"If I lose Rs. X, I stop for 6 months and reassess." Decide this BEFORE trading.</p>
                </div>
              </div>
            </div>
          </div>

          {/* India Focus Section */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-2xl p-6 mb-10 border border-orange-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.IndiaFlag className="w-6 h-6 text-orange-600" />
              <span>India Focus: The SIP Revolution</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">SIP Growth in India</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">→</span>
                    <span>Monthly SIP flows: <strong>Rs. 23,000+ crore</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">→</span>
                    <span>Total SIP accounts: <strong>8+ crore</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">→</span>
                    <span>Average SIP size: Rs. 2,500/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">→</span>
                    <span>10-year Nifty 50 CAGR: ~12%</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">The Smart Money Path</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">1.</span>
                    <span>Start SIP in index fund today</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">2.</span>
                    <span>Build emergency fund (6 months)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">3.</span>
                    <span>Get term + health insurance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">4.</span>
                    <span>Then (maybe) explore trading</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-orange-100 rounded-xl p-4 border border-orange-300">
              <p className="text-orange-800 text-sm">
                <strong>The real wealth builders:</strong> India's retail investors who quietly do SIPs for 15-20 years 
                are building far more wealth than 89% of active traders. Boring works.
              </p>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-10 border border-indigo-200">
            <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <Icons.Lightbulb className="w-6 h-6 text-indigo-600" />
              <span>Key Takeaways</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-indigo-800">
                  <strong>Trading isn't for everyone</strong> — and that's completely okay
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-indigo-800">
                  <strong>SIPs beat most traders</strong> — over long term with zero stress
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-indigo-800">
                  <strong>Financial foundation first</strong> — never trade with money you need
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p className="text-indigo-800">
                  <strong>Honest self-assessment</strong> — know your score before starting
                </p>
              </div>
            </div>
          </div>

          {/* Module Complete */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 mb-10 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <FaTrophy className="w-8 h-8 text-yellow-300" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">🎉 Module 4 Complete!</h2>
            <p className="text-indigo-100 mb-4">
              You've finished Trading Basics. You now understand what trading really involves — 
              the psychology, the risks, the statistics, and most importantly, whether it's right for you.
            </p>
            <div className="bg-white/10 rounded-xl p-4 max-w-lg mx-auto">
              <p className="text-sm text-indigo-100">
                <strong>Next Steps:</strong> If you're ready to continue, Module 5 covers Technical Analysis — 
                the tools traders use to analyze charts and make decisions.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/learn/trading-basics-lesson-6')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors w-full sm:w-auto justify-center"
            >
              <FaArrowLeft className="text-sm" />
              <span>Previous: Why Most Traders Lose</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/trading-basics')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
            >
              <span>Back to Module Overview</span>
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TradingBasicsLesson7;
