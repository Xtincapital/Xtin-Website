import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { 
  PiggyBankIcon, TargetIcon, CheckCircleIcon, BookOpenIcon, 
  BrainIcon, KeyIcon, ShieldIcon, CoinsIcon, CalculatorIcon, HomeIcon, LightbulbIcon, BoltIcon,
  WarningIcon, TrophyIcon, ChartBarIcon, PencilIcon
} from "../../components/LearningIcons";

const PersonalFinanceLesson4 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});
  const [monthlyExpenses, setMonthlyExpenses] = useState("");

  const handleAnswer = (questionId, selectedOption) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
    setShowResults(prev => ({ ...prev, [questionId]: true }));
  };

  const QuizQuestion = ({ id, question, options, correctAnswer, explanation }) => {
    const answered = showResults[id];
    const userAnswer = quizAnswers[id];
    const isCorrect = userAnswer === correctAnswer;

    return (
      <div className="rounded-2xl p-6 border border-brand-line shadow-sm bg-brand-soft">
        <p className="font-semibold text-gray-900 mb-4 text-lg">{question}</p>
        <div className="space-y-3">
          {options.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index);
            const isSelected = userAnswer === optionLetter;
            const isCorrectOption = correctAnswer === optionLetter;
            
            let bgColor = "bg-white hover:bg-brand-soft hover:border-brand-line";
            let borderColor = "border-gray-200";
            
            if (answered) {
              if (isCorrectOption) {
                bgColor = "bg-brand-soft";
                borderColor = "border-brand";
              } else if (isSelected && !isCorrectOption) {
                bgColor = "bg-red-50";
                borderColor = "border-red-400";
              }
            }

            return (
              <button
                key={index}
                onClick={() => !answered && handleAnswer(id, optionLetter)}
                disabled={answered}
                className={`w-full text-left p-4 rounded-xl border-2 ${borderColor} ${bgColor} transition-all duration-200 ${!answered ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className="flex items-center gap-3">
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${answered && isCorrectOption ? 'bg-brand-fill text-white' : answered && isSelected ? 'bg-red-500 text-white' : 'bg-brand-soft text-brand'}`}>
                    {optionLetter}
                  </span>
                  <span className="text-gray-700 flex-1">{option}</span>
                  {answered && isCorrectOption && <FaCheckCircle className="text-brand text-lg" />}
                  {answered && isSelected && !isCorrectOption && <FaTimesCircle className="text-red-500 text-lg" />}
                </span>
              </button>
            );
          })}
        </div>
        {answered && (
          <div className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-brand-soft text-brand border border-brand-line' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
            <p className="font-semibold flex items-center gap-2">
              {isCorrect ? (
                <><CheckCircleIcon className="w-5 h-5 text-brand" /> Correct!</>
              ) : (
                <><svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg> Not quite.</>  
              )}
            </p>
            <p className="text-sm mt-1 opacity-90">{explanation}</p>
          </div>
        )}
      </div>
    );
  };

  // Calculate emergency fund targets
  const expenses = parseFloat(monthlyExpenses) || 0;
  const threeMonths = (expenses * 3).toFixed(0);
  const sixMonths = (expenses * 6).toFixed(0);

  return (
    <div className="text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-3xl mx-auto">
          
          {/* Breadcrumb */}
          <button 
            onClick={() => navigate('/learn')}
            className="flex items-center gap-2 text-gray-500 hover:text-brand transition-colors mb-8 group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span>Back to Module</span>
          </button>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 text-white rounded-full text-sm font-semibold shadow-sm bg-brand-fill">
                Lesson 4 of 9
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                10 min read
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-sm bg-brand-soft">
                <PiggyBankIcon className="w-7 h-7 text-brand" />
              </span>
              <span>Savings & Emergency Fund</span>
            </h1>
            <p className="text-lg text-gray-500">
              Build your financial safety net — the money that protects you when life gets unexpected.
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="rounded-2xl p-6 mb-10 border border-brand-line shadow-sm bg-brand-soft">
            <h2 className="font-semibold text-brand mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm">
                <TargetIcon className="w-5 h-5 text-brand" />
              </span>
              <span>After this lesson, you'll know:</span>
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-brand">
                <span className="text-brand mt-0.5 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5" />
                </span>
                <span>Why savings matter and what an emergency fund is</span>
              </li>
              <li className="flex items-start gap-3 text-brand">
                <span className="text-brand mt-0.5 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5" />
                </span>
                <span>How much to save (<strong>3–6 months</strong> of expenses)</span>
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-[-0.015em]">What is Savings?</h2>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              <strong className="text-gray-900">Savings</strong> is the money you keep aside instead of spending. It's your future self saying "thank you."
            </p>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              But not all savings are equal. The most important type? Your <strong className="text-cyan-600">Emergency Fund</strong>.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-[-0.015em]">What is an Emergency Fund?</h2>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              An emergency fund is money saved for <em>unexpected</em> situations — job loss, medical bills, car repairs, or urgent home fixes. It's not for vacations or shopping sales!
            </p>

            <div className="bg-rose-50 rounded-xl p-5 mb-6 border border-rose-200">
              <h4 className="font-bold text-rose-800 mb-2 flex items-center gap-2">
                <WarningIcon className="w-5 h-5 text-rose-600" />
                Common Emergencies:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3 text-center border border-rose-100">
                  <span className="flex items-center justify-center">
                    <svg className="w-6 h-6 text-rose-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M16 6V4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4V6" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 11V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M10 13H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <p className="text-sm text-rose-700 mt-1">Job Loss</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-rose-100">
                  <span className="flex items-center justify-center">
                    <svg className="w-6 h-6 text-rose-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 12H15M12 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <p className="text-sm text-rose-700 mt-1">Medical Bills</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-rose-100">
                  <span className="flex items-center justify-center">
                    <svg className="w-6 h-6 text-rose-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 10L6.5 5H17.5L19 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="3" y="10" width="18" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </span>
                  <p className="text-sm text-rose-700 mt-1">Car Repairs</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-rose-100">
                  <span className="flex items-center justify-center">
                    <HomeIcon className="w-6 h-6 text-rose-500" />
                  </span>
                  <p className="text-sm text-rose-700 mt-1">Home Fixes</p>
                </div>
              </div>
            </div>

            <div className="bg-brand-soft rounded-xl p-5 mb-8 border border-brand-line">
              <h4 className="font-bold text-brand mb-2 flex items-center gap-2">
                <TargetIcon className="w-5 h-5 text-brand" />
                How Much to Save?
              </h4>
              <p className="text-brand">
                Target: <strong>3 to 6 months</strong> of your monthly expenses. Start small — even $500 is better than $0!
              </p>
            </div>

            {/* SVG Diagram - Emergency Fund Ladder */}
            <div className="bg-white rounded-3xl p-8 mb-10 border border-gray-100 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Building Your Emergency Fund</h3>
              <svg className="w-full max-w-md mx-auto" viewBox="0 0 400 320" fill="none">
                {/* Background jar shape */}
                <path d="M100 280 L100 100 Q100 60 140 60 L260 60 Q300 60 300 100 L300 280 Q300 300 250 300 L150 300 Q100 300 100 280Z" fill="#E0E7F1" stroke="#2A8C9A" strokeWidth="3"/>
                
                {/* Jar lid */}
                <rect x="90" y="45" width="220" height="20" rx="5" fill="#2A8C9A"/>
                <rect x="130" y="35" width="140" height="15" rx="4" fill="#33A0AE"/>
                
                {/* Water levels */}
                {/* 6 months - top */}
                <rect x="103" y="80" width="194" height="50" fill="#4FB5C2" opacity="0.4"/>
                <text x="200" y="110" textAnchor="middle" fill="#23727E" fontSize="12" fontWeight="bold">6 MONTHS ★</text>
                
                {/* 3 months - middle */}
                <rect x="103" y="130" width="194" height="60" fill="#4FB5C2" opacity="0.6"/>
                <text x="200" y="165" textAnchor="middle" fill="#23727E" fontSize="12" fontWeight="bold">3 MONTHS ✓</text>
                
                {/* 1 month - bottom */}
                <rect x="103" y="190" width="194" height="60" fill="#4FB5C2" opacity="0.8"/>
                <text x="200" y="225" textAnchor="middle" fill="#23727E" fontSize="12" fontWeight="bold">1 MONTH</text>
                
                {/* Starting point */}
                <rect x="103" y="250" width="194" height="45" fill="#33A0AE"/>
                <text x="200" y="278" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">START HERE → $500</text>
                
                {/* Arrow on right side */}
                <path d="M330 270 L330 90" stroke="#2A8C9A" strokeWidth="3" strokeDasharray="8 4"/>
                <polygon points="330,80 320,100 340,100" fill="#2A8C9A"/>
                <text x="355" y="180" fill="#2A8C9A" fontSize="11" fontWeight="bold" transform="rotate(90, 355, 180)">GOAL</text>
                
                {/* Labels on left */}
                <text x="70" y="110" textAnchor="end" fill="#717680" fontSize="11">Secure</text>
                <text x="70" y="165" textAnchor="end" fill="#717680" fontSize="11">Safe</text>
                <text x="70" y="225" textAnchor="end" fill="#717680" fontSize="11">Basic</text>
                <text x="70" y="275" textAnchor="end" fill="#717680" fontSize="11">Start</text>
              </svg>
              <p className="text-center text-gray-500 text-sm mt-6 flex items-center justify-center gap-2">
                <LightbulbIcon className="w-4 h-4 text-cyan-500" />
                <span>Fill your jar step by step — every dollar counts!</span>
              </p>
            </div>

            {/* Real Life Example */}
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 mb-10 border border-sky-200 relative overflow-hidden">
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-sky-200/30 rounded-full"></div>
              <h3 className="font-semibold text-sky-900 mb-4 flex items-center gap-2 relative z-10">
                <span className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                  <CoinsIcon className="w-5 h-5 text-sky-600" />
                </span>
                Real Example: Maya's Emergency Fund
              </h3>
              <p className="text-sky-800 leading-relaxed mb-4 relative z-10">
                Maya's monthly expenses are <strong>$1,500</strong>. Here's her emergency fund goal:
              </p>
              
              <div className="space-y-3 relative z-10">
                <div className="bg-white/70 rounded-xl p-4 flex items-center justify-between border border-sky-200">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="w-5 h-5 text-sky-600" />
                    </span>
                    <div>
                      <p className="font-bold text-sky-800">Monthly Expenses</p>
                      <p className="text-sm text-sky-600">Rent, food, bills, transport</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-sky-600">$1,500</span>
                </div>
                
                <div className="bg-white/70 rounded-xl p-4 flex items-center justify-between border border-amber-200">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <TargetIcon className="w-5 h-5 text-amber-600" />
                    </span>
                    <div>
                      <p className="font-bold text-amber-800">Minimum Goal (3 months)</p>
                      <p className="text-sm text-amber-600">Basic safety net</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-amber-600">$4,500</span>
                </div>
                
                <div className="bg-white/70 rounded-xl p-4 flex items-center justify-between border border-brand-line">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-brand-soft rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-brand" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M7 4H17V8C17 11.3137 14.7614 14 12 14C9.23858 14 7 11.3137 7 8V4Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M17 7H19C20.1046 7 21 7.89543 21 9V9C21 10.6569 19.6569 12 18 12H17" stroke="currentColor" strokeWidth="2"/>
                        <path d="M7 7H5C3.89543 7 3 7.89543 3 9V9C3 10.6569 4.34315 12 6 12H7" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </span>
                    <div>
                      <p className="font-bold text-brand">Ideal Goal (6 months)</p>
                      <p className="text-sm text-brand">Full protection</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-brand">$9,000</span>
                </div>
              </div>
              
              <div className="mt-4 bg-sky-100 rounded-xl p-4 relative z-10">
                <p className="text-sky-800 text-sm flex items-center gap-2">
                  <LightbulbIcon className="w-4 h-4 text-sky-600" />
                  <span><strong>Maya's plan:</strong> Save $300/month → reaches $4,500 in 15 months!</span>
                </p>
              </div>
            </div>

            {/* Where to Keep Emergency Fund */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 mb-10 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M5 10V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M9 10V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M15 10V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M19 10V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 3L21 10H3L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Where to Keep Your Emergency Fund?
              </h3>
              <p className="text-slate-600 mb-4">
                Your emergency fund should be <strong>easy to access</strong> but separate from daily spending:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-brand" />
                    Good Options:
                  </h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• High-yield savings account</li>
                    <li>• Money market account</li>
                    <li>• Separate bank account</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-4 border border-red-100">
                  <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Avoid:
                  </h4>
                  <ul className="text-sm text-red-600 space-y-1">
                    <li>• Stocks (too risky)</li>
                    <li>• Fixed deposits (hard to withdraw)</li>
                    <li>• Your main checking account</li>
                  </ul>
                </div>
              </div>
              
              {/* India-specific note */}
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 8L16 8M8 12H14M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  India-Specific Options:
                </h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• <strong>Savings account</strong> — instant access</li>
                  <li>• <strong>Liquid mutual funds</strong> — slightly better returns, 1-day withdrawal</li>
                  <li>• <strong>Sweep-in FD</strong> — earns interest, accessible when needed</li>
                </ul>
              </div>
            </div>

          </div>

          {/* Quiz Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-brand-fill">
                <PencilIcon className="w-6 h-6 text-white" />
              </span>
              Quick Quiz
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                id="q1"
                question="How much should you save in an emergency fund?"
                options={[
                  "1 week of expenses",
                  "1 month of expenses",
                  "3 to 6 months of expenses",
                  "1 year of expenses"
                ]}
                correctAnswer="C"
                explanation="3–6 months of expenses is the recommended target. It gives you enough cushion for most emergencies like job loss or medical bills."
              />

              <QuizQuestion
                id="q2"
                question="Which is NOT a good place for an emergency fund?"
                options={[
                  "High-yield savings account",
                  "Stock market investments",
                  "Money market account",
                  "Separate bank account"
                ]}
                correctAnswer="B"
                explanation="Stocks are too volatile — their value can drop when you need money most. Emergency funds should be safe and easy to access."
              />
            </div>
          </div>

          {/* Mini Activity */}
          <div className="mt-12 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200">
            <h2 className="text-xl font-semibold text-teal-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <CalculatorIcon className="w-5 h-5 text-teal-600" />
              </span>
              Calculate Your Emergency Fund!
            </h2>
            <p className="text-teal-700 mb-4">
              Enter your total monthly expenses to see your emergency fund target:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="text-sm text-teal-600 font-medium mb-1 block">Your Monthly Expenses</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                    placeholder="1500"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-teal-200 focus:border-teal-500 focus:outline-none text-lg font-semibold"
                  />
                </div>
              </div>
            </div>

            {expenses > 0 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="bg-amber-100 rounded-xl p-4 flex items-center justify-between border border-amber-200">
                  <div>
                    <p className="text-xs text-amber-600 font-medium">MINIMUM (3 MONTHS)</p>
                    <p className="text-sm text-amber-700">Basic safety net</p>
                  </div>
                  <p className="text-3xl font-bold text-amber-700">${threeMonths}</p>
                </div>
                <div className="bg-brand-soft rounded-xl p-4 flex items-center justify-between border border-brand-line">
                  <div>
                    <p className="text-xs text-brand font-medium">IDEAL (6 MONTHS)</p>
                    <p className="text-sm text-brand">Full protection</p>
                  </div>
                  <p className="text-3xl font-bold text-brand">${sixMonths}</p>
                </div>
                <p className="text-center text-teal-600 text-sm mt-2 flex items-center justify-center gap-2">
                  <LightbulbIcon className="w-4 h-4 text-teal-500" />
                  <span>Start with $500, then work toward 3 months. You've got this!</span>
                </p>
              </div>
            )}
          </div>

          {/* Key Takeaway */}
          <div className="mt-12 rounded-2xl p-6 text-white relative overflow-hidden bg-brand-fill">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <h3 className="font-semibold text-lg mb-2 relative z-10 flex items-center gap-2">
              <BoltIcon className="w-5 h-5" />
              <span>Key Takeaway</span>
            </h3>
            <p className="text-white/85 leading-relaxed relative z-10">
              An emergency fund is your <strong className="text-white">financial safety net</strong>. Aim for 3–6 months of expenses, keep it accessible, and start today — even $50/month adds up!
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-200">
            <button 
              onClick={() => navigate('/learn/personal-finance-lesson-3')}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-brand transition-colors group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Lesson 3: Budgeting Basics</span>
            </button>
            <button 
              onClick={() => navigate('/learn/personal-finance-lesson-5')}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-brand/25 transition-all bg-brand-fill"
            >
              <span>Next: Banking Basics</span>
              <FaArrowRight />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PersonalFinanceLesson4;
