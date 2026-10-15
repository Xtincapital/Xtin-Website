import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { 
  ReceiptIcon, TargetIcon, CheckCircleIcon, BookOpenIcon, 
  BrainIcon, KeyIcon, PercentIcon, CoinsIcon, DocumentCheckIcon, LightbulbIcon, HomeIcon, BoltIcon,
  DollarIcon, PencilIcon, ClipboardIcon
} from "../../components/LearningIcons";

const PersonalFinanceLesson8 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});
  const [activityList, setActivityList] = useState(["", "", ""]);

  const handleAnswer = (questionId, selectedOption) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
    setShowResults(prev => ({ ...prev, [questionId]: true }));
  };

  const updateActivityItem = (index, value) => {
    const newList = [...activityList];
    newList[index] = value;
    setActivityList(newList);
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
                Lesson 8 of 9
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                6 min read
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-sm bg-brand-soft">
                <ReceiptIcon className="w-7 h-7 text-brand" />
              </span>
              <span>Taxes – Basic Awareness</span>
            </h1>
            <p className="text-lg text-gray-500">
              Understand what taxes are and why they matter in your financial life.
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
                <span>What taxes are and why they exist</span>
              </li>
              <li className="flex items-start gap-3 text-brand">
                <span className="text-brand mt-0.5 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5" />
                </span>
                <span>How taxes affect your income</span>
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-[-0.015em]">What are Taxes?</h2>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              <strong className="text-gray-900">Taxes</strong> are payments you make to the government. They're collected from your income, purchases, and other sources. Governments use taxes to pay for public services like roads, schools, hospitals, and safety.
            </p>

            <div className="bg-brand-soft rounded-xl p-5 mb-6 border border-brand-line">
              <h4 className="font-bold text-brand mb-2 flex items-center gap-2">
                <TargetIcon className="w-5 h-5 text-brand" />
                Why Do Taxes Exist?
              </h4>
              <p className="text-brand">
                Taxes fund things we all share — infrastructure, public safety, healthcare, and education. Without taxes, there would be no public roads, fire departments, or government services!
              </p>
            </div>

            <div className="bg-brand-soft rounded-xl p-5 mb-8 border border-brand-line">
              <h4 className="font-bold text-brand mb-2 flex items-center gap-2">
                <LightbulbIcon className="w-5 h-5 text-brand" />
                How Taxes Affect Your Income
              </h4>
              <p className="text-brand">
                When you earn money, a portion goes to taxes before you receive your <strong>take-home pay</strong>. The amount depends on how much you earn and where you live.
              </p>
            </div>

            {/* What Taxes Fund */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-[-0.015em]">What Do Taxes Pay For?</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 18H20M4 18V14L8 10L12 14L16 10L20 14V18M4 18H2M20 18H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h4 className="font-bold text-blue-900 text-base">Roads</h4>
              </div>
              <div className="bg-rose-50 rounded-xl p-4 text-center border border-rose-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-rose-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 9V15M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h4 className="font-bold text-rose-900 text-base">Hospitals</h4>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-amber-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M5 21V10L12 4L19 10V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="9" y="13" width="6" height="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 13V11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11V13" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h4 className="font-bold text-amber-900 text-base">Schools</h4>
              </div>
              <div className="bg-violet-50 rounded-xl p-4 text-center border border-violet-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-violet-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4 className="font-bold text-violet-900 text-base">Safety</h4>
              </div>
            </div>

            {/* SVG Diagram - How Taxes Work */}
            <div className="bg-white rounded-3xl p-8 mb-10 border border-gray-100 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">How Taxes Work</h3>
              <svg className="w-full max-w-lg mx-auto" viewBox="0 0 480 180" fill="none">
                {/* Income Box */}
                <g transform="translate(20, 40)">
                  <rect x="0" y="0" width="110" height="80" rx="12" fill="#E0E7F1" stroke="#5A77AA" strokeWidth="2"/>
                  <text x="55" y="35" textAnchor="middle" fill="#2C3F5E" fontSize="22">$</text>
                  <text x="55" y="55" textAnchor="middle" fill="#2C3F5E" fontSize="11" fontWeight="bold">INCOME</text>
                  <text x="55" y="70" textAnchor="middle" fill="#3E5C8A" fontSize="10">$3,000</text>
                  <text x="55" y="105" textAnchor="middle" fill="#2C3F5E" fontSize="10" fontWeight="600">Your Salary</text>
                </g>
                
                {/* Arrow 1 */}
                <g transform="translate(140, 70)">
                  <path d="M0 15 L40 15" stroke="#8F6FC4" strokeWidth="3"/>
                  <polygon points="40,15 30,9 30,21" fill="#8F6FC4"/>
                </g>
                
                {/* Tax Box */}
                <g transform="translate(190, 40)">
                  <rect x="0" y="0" width="100" height="80" rx="12" fill="#F6ECCE" stroke="#B8923F" strokeWidth="2"/>
                  <text x="50" y="42" textAnchor="middle" fill="#654B26" fontSize="11" fontWeight="bold">TAXES</text>
                  <text x="50" y="58" textAnchor="middle" fill="#9A7634" fontSize="10">$450</text>
                  <text x="50" y="105" textAnchor="middle" fill="#654B26" fontSize="10" fontWeight="600">To Government</text>
                </g>
                
                {/* Arrow 2 */}
                <g transform="translate(300, 70)">
                  <path d="M0 15 L40 15" stroke="#8F6FC4" strokeWidth="3"/>
                  <polygon points="40,15 30,9 30,21" fill="#8F6FC4"/>
                </g>
                
                {/* Take-home Box */}
                <g transform="translate(350, 40)">
                  <rect x="0" y="0" width="110" height="80" rx="12" fill="#F0FDF4" stroke="#16A34A" strokeWidth="2"/>
                  <text x="55" y="42" textAnchor="middle" fill="#16A34A" fontSize="11" fontWeight="bold">TAKE-HOME</text>
                  <text x="55" y="58" textAnchor="middle" fill="#16A34A" fontSize="10">$2,550</text>
                  <text x="55" y="105" textAnchor="middle" fill="#16A34A" fontSize="10" fontWeight="600">Your Money</text>
                </g>
                
                {/* Formula at bottom */}
                <g transform="translate(100, 160)">
                  <text x="140" y="10" textAnchor="middle" fill="#8F6FC4" fontSize="11" fontWeight="600">
                    Income ($3,000) − Taxes ($450) = Take-Home Pay ($2,550)
                  </text>
                </g>
              </svg>
              <p className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-2">
                <LightbulbIcon className="w-4 h-4 text-amber-500" />
                <span>Your take-home pay is what you actually receive after taxes are deducted.</span>
              </p>
            </div>

            {/* Real Life Example */}
            <div className="rounded-2xl p-6 mb-10 border border-brand-line relative overflow-hidden bg-brand-soft">
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-soft rounded-full"></div>
              <h3 className="font-semibold text-brand mb-4 flex items-center gap-2 relative z-10">
                <span className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
                  <DollarIcon className="w-5 h-5 text-brand" />
                </span>
                Real Example: Lisa's Paycheck
              </h3>
              <p className="text-brand leading-relaxed mb-4 relative z-10">
                Lisa earns <strong>$3,000 per month</strong>. Here's how taxes affect her pay:
              </p>
              
              <div className="space-y-3 relative z-10">
                <div className="bg-white/70 rounded-xl p-4 flex items-center justify-between border border-blue-200">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M16 6V4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4V6" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 11V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M10 13H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <div>
                      <p className="font-bold text-blue-800">Gross Income</p>
                      <p className="text-sm text-blue-600">Before taxes</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">$3,000</span>
                </div>
                
                <div className="bg-white/70 rounded-xl p-4 flex items-center justify-between border border-amber-200">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M5 10V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M9 10V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M15 10V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M19 10V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M12 3L21 10H3L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <div>
                      <p className="font-bold text-amber-800">Taxes Deducted</p>
                      <p className="text-sm text-amber-600">Goes to government</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-amber-600">−$450</span>
                </div>
                
                <div className="bg-white/70 rounded-xl p-4 flex items-center justify-between border border-brand-line">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-brand-soft rounded-lg flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-brand" />
                    </span>
                    <div>
                      <p className="font-bold text-brand">Take-Home Pay</p>
                      <p className="text-sm text-brand">What Lisa actually gets</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-brand">$2,550</span>
                </div>
              </div>
              
              <div className="mt-4 bg-brand-soft rounded-xl p-4 relative z-10">
                <p className="text-brand text-sm flex items-center gap-2">
                  <LightbulbIcon className="w-4 h-4 text-brand flex-shrink-0" />
                  <span>Lisa budgets with <strong>$2,550</strong>, not $3,000. Always plan your expenses based on take-home pay!</span>
                </p>
              </div>
            </div>

            {/* India-specific Note */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 mb-10 border border-orange-200">
              <h3 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 8L16 8M8 12H14M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                India-Specific Note
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white/70 rounded-xl p-4 border border-orange-100">
                  <h4 className="font-bold text-orange-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V7C20 5.89543 19.1046 5 18 5H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <rect x="8" y="2" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M8 16H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Income Tax
                  </h4>
                  <p className="text-sm text-orange-600">
                    In India, if you earn above a certain amount, you pay income tax. Your employer usually deducts it from your salary automatically (called TDS).
                  </p>
                </div>
                
                <div className="bg-white/70 rounded-xl p-4 border border-orange-100">
                  <h4 className="font-bold text-orange-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 14H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M14 14H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Annual Filing
                  </h4>
                  <p className="text-sm text-orange-600">
                    Once a year, you need to file an income tax return. This is usually done between April and July for the previous financial year.
                  </p>
                </div>
              </div>
              
              <p className="text-orange-700 text-sm mt-4 italic flex items-center gap-2">
                <LightbulbIcon className="w-4 h-4 text-orange-600 flex-shrink-0" />
                Keep track of your income and tax deductions throughout the year!
              </p>
            </div>

          </div>

          {/* Quiz Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-brand-fill">
                <PencilIcon className="w-6 h-6 text-white" />
              </span>
              Quick Quiz
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                id="q1"
                question="Why do governments collect taxes?"
                options={[
                  "To make people poorer",
                  "To fund public services like roads, schools, and hospitals",
                  "To keep money in banks",
                  "To give money to other countries"
                ]}
                correctAnswer="B"
                explanation="Taxes fund essential public services that everyone uses — roads, healthcare, education, safety, and infrastructure!"
              />

              <QuizQuestion
                id="q2"
                question="What is 'take-home pay'?"
                options={[
                  "Your total salary before any deductions",
                  "The bonus you receive at year end",
                  "The amount you actually receive after taxes are deducted",
                  "Money you save in a bank"
                ]}
                correctAnswer="C"
                explanation="Take-home pay (or net pay) is what you actually receive in your bank account after taxes and other deductions are removed from your gross salary."
              />
            </div>
          </div>

          {/* Mini Activity */}
          <div className="mt-12 rounded-2xl p-6 border border-brand-line bg-brand-soft">
            <h2 className="text-xl font-semibold text-brand mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
                <ClipboardIcon className="w-5 h-5 text-brand" />
              </span>
              Mini Activity: What Do Taxes Support?
            </h2>
            <p className="text-brand mb-4">
              Think about public services around you that are funded by taxes. List 3 things:
            </p>
            
            <div className="space-y-3">
              {activityList.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-brand-soft rounded-lg flex items-center justify-center text-sm font-bold text-brand">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateActivityItem(index, e.target.value)}
                    placeholder={index === 0 ? "e.g., Public roads and highways" : index === 1 ? "e.g., Fire department and police" : "e.g., Public schools"}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-brand-line focus:border-brand focus:outline-none"
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-4 bg-brand-soft rounded-xl p-4">
              <p className="text-brand text-sm flex items-center gap-2">
                <LightbulbIcon className="w-4 h-4 text-brand flex-shrink-0" />
                <span><strong>Tip:</strong> Next time you use a public road or visit a government hospital, remember — taxes made it possible!</span>
              </p>
            </div>
          </div>

          {/* Key Takeaway */}
          <div className="mt-12 rounded-2xl p-6 text-white relative overflow-hidden bg-brand-fill">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <h3 className="font-semibold text-lg mb-2 relative z-10 flex items-center gap-2">
              <BoltIcon className="w-5 h-5" />
              Key Takeaway
            </h3>
            <p className="text-white/85 leading-relaxed relative z-10">
              Taxes are a part of earning money. They fund public services we all use daily. Your <strong className="text-white">take-home pay</strong> is what matters for budgeting — always plan your expenses based on what you actually receive, not your gross salary!
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-200">
            <button 
              onClick={() => navigate('/learn/personal-finance-lesson-7')}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-brand transition-colors group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Lesson 7: Insurance Basics</span>
            </button>
            <button 
              onClick={() => navigate('/learn/personal-finance-lesson-9')}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-brand/25 transition-all bg-brand-fill"
            >
              <span>Next: Money Mistakes</span>
              <FaArrowRight />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PersonalFinanceLesson8;
