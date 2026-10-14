import React, { useState, useEffect } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import progressService from "../../../../services/progressService";
import authService from "../../../../services/authService";
import ModuleBadge from "../../components/ModuleBadge";
import {
  LightbulbIcon,
  WalletIcon,
  ShoppingCartIcon,
  PiggyBankIcon,
  BookOpenIcon,
  BrainIcon,
  TargetIcon,
  CheckCircleIcon,
  KeyIcon,
} from "../../components/LearningIcons";

const PersonalFinanceLesson1 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  // Mark lesson as completed when component mounts
  useEffect(() => {
    const markCompleted = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        if (isAuthenticated) {
          await progressService.markLessonCompleted('personal-finance', 'lesson-1');
        }
      } catch (error) {
        console.error('Failed to mark lesson as completed:', error);
      }
    };

    markCompleted();
  }, []);

  const handleAnswer = (questionId, selectedOption, _correctAnswer) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
    setShowResults(prev => ({ ...prev, [questionId]: true }));
  };

  const QuizQuestion = ({ id, question, options, correctAnswer, explanation }) => {
    const answered = showResults[id];
    const userAnswer = quizAnswers[id];
    const isCorrect = userAnswer === correctAnswer;

    return (
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200 shadow-sm">
        <p className="font-semibold text-gray-900 mb-4 text-lg">{question}</p>
        <div className="space-y-3">
          {options.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index);
            const isSelected = userAnswer === optionLetter;
            const isCorrectOption = correctAnswer === optionLetter;
            
            let bgColor = "bg-white hover:bg-emerald-50 hover:border-emerald-300";
            let borderColor = "border-gray-200";
            
            if (answered) {
              if (isCorrectOption) {
                bgColor = "bg-emerald-50";
                borderColor = "border-emerald-400";
              } else if (isSelected && !isCorrectOption) {
                bgColor = "bg-red-50";
                borderColor = "border-red-400";
              }
            }

            return (
              <button
                key={index}
                onClick={() => !answered && handleAnswer(id, optionLetter, correctAnswer)}
                disabled={answered}
                className={`w-full text-left p-4 rounded-xl border-2 ${borderColor} ${bgColor} transition-all ${!answered ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className="flex items-center gap-3">
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${answered && isCorrectOption ? 'bg-emerald-500 text-white' : answered && isSelected ? 'bg-red-500 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                    {optionLetter}
                  </span>
                  <span className="text-gray-700 flex-1">{option}</span>
                  {answered && isCorrectOption && <FaCheckCircle className="text-emerald-500 text-lg" />}
                  {answered && isSelected && !isCorrectOption && <FaTimesCircle className="ml-auto text-red-500" />}
                </span>
              </button>
            );
          })}
        </div>
        {answered && (
          <div className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
            <p className="font-semibold flex items-center gap-2">
              {isCorrect ? (
                <><CheckCircleIcon className="w-5 h-5 text-emerald-600" /> Correct!</>
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
    <div className="bg-gradient-to-b from-white to-emerald-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-3xl mx-auto">
          
          {/* Breadcrumb */}
          <button 
            onClick={() => navigate('/learn')}
            className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors mb-8 group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span>Back to Learn</span>
          </button>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <ModuleBadge moduleId="personal-finance" />
              <span className="px-4 py-1.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-full text-sm font-semibold shadow-sm">
                Lesson 1 of 9
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                ~10 min read
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-normal text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-200 rounded-xl shadow-sm">
                <LightbulbIcon className="w-7 h-7 text-emerald-600" />
              </span>
              <span>What is Personal Finance?</span>
            </h1>
            <p className="text-lg text-gray-500">
              Let's start with the basics — understanding what personal finance really means.
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 mb-10 border border-emerald-200 shadow-sm">
            <h2 className="font-semibold text-emerald-900 mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm">
                <TargetIcon className="w-5 h-5 text-emerald-600" />
              </span>
              <span>Learning Objectives</span>
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-emerald-800">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5" />
                </span>
                <span>Understand what personal finance means in simple words</span>
              </li>
              <li className="flex items-start gap-3 text-emerald-800">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5" />
                </span>
                <span>Know why managing money is important for everyone</span>
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-[-0.015em]">So, What is Personal Finance?</h2>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              <strong className="text-gray-900">Personal finance</strong> is simply how you manage your own money. That's it!
            </p>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              It includes three simple things:
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 text-center border border-emerald-200 shadow-sm hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-xl shadow-sm mb-3">
                  <WalletIcon className="w-7 h-7 text-emerald-600" />
                </div>
                <h4 className="font-bold text-emerald-900 text-lg">Earning</h4>
                <p className="text-sm text-emerald-700 mt-1">Money coming in (salary, business)</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 text-center border border-emerald-200 shadow-sm hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-xl shadow-sm mb-3">
                  <ShoppingCartIcon className="w-7 h-7 text-emerald-600" />
                </div>
                <h4 className="font-bold text-emerald-900 text-lg">Spending</h4>
                <p className="text-sm text-emerald-700 mt-1">Money going out (rent, food, fun)</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 text-center border border-emerald-200 shadow-sm hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-xl shadow-sm mb-3">
                  <PiggyBankIcon className="w-7 h-7 text-emerald-600" />
                </div>
                <h4 className="font-bold text-emerald-900 text-lg">Saving</h4>
                <p className="text-sm text-emerald-700 mt-1">Money kept for later (future goals)</p>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8">
              When you understand these three things and make smart choices, you're doing personal finance. 
              It's not about being rich — it's about being <strong className="text-gray-900">in control</strong> of your money.
            </p>

            {/* SVG Diagram - Enhanced Professional Version */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-8 mb-10 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
                <TargetIcon className="w-5 h-5 text-emerald-600" />
                How Money Flows
              </h3>
              <svg className="w-full max-w-lg mx-auto" viewBox="0 0 400 200" fill="none">
                {/* Definitions for gradients and shadows */}
                <defs>
                  <linearGradient id="youGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1FA978"/>
                    <stop offset="100%" stopColor="#12805A"/>
                  </linearGradient>
                  <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E0E7F1"/>
                    <stop offset="100%" stopColor="#C3D0E4"/>
                  </linearGradient>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/>
                  </filter>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#75757D"/>
                  </marker>
                </defs>
                
                {/* You circle with gradient */}
                <circle cx="200" cy="35" r="28" fill="url(#youGradient)" filter="url(#shadow)"/>
                <text x="200" y="40" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">YOU</text>
                
                {/* Person icon inside You circle */}
                <circle cx="200" cy="28" r="5" fill="white" fillOpacity="0.3"/>
                
                {/* Arrow down from You */}
                <path d="M200 63 L200 85" stroke="#A3A1A6" strokeWidth="2" strokeDasharray="4 2"/>
                <polygon points="195,82 200,92 205,82" fill="#75757D"/>
                
                {/* Income box with gradient */}
                <rect x="125" y="95" width="150" height="38" rx="10" fill="url(#incomeGradient)" stroke="#5A77AA" strokeWidth="2" filter="url(#shadow)"/>
                <text x="200" y="119" textAnchor="middle" fill="#2C3F5E" fontSize="14" fontWeight="700">Your Income</text>
                
                {/* Animated-looking split arrows */}
                <path d="M155 133 L95 160" stroke="#A3A1A6" strokeWidth="2" strokeLinecap="round"/>
                <polygon points="90,156 88,166 98,162" fill="#75757D"/>
                
                <path d="M200 133 L200 160" stroke="#A3A1A6" strokeWidth="2" strokeLinecap="round"/>
                <polygon points="195,157 200,167 205,157" fill="#75757D"/>
                
                <path d="M245 133 L305 160" stroke="#A3A1A6" strokeWidth="2" strokeLinecap="round"/>
                <polygon points="302,162 312,166 310,156" fill="#75757D"/>
                
                {/* Three destination boxes with enhanced styling */}
                <rect x="35" y="167" width="100" height="30" rx="8" fill="#F6ECCE" stroke="#B8923F" strokeWidth="2" filter="url(#shadow)"/>
                <text x="85" y="187" textAnchor="middle" fill="#654B26" fontSize="12" fontWeight="700">Spend</text>
                
                <rect x="150" y="167" width="100" height="30" rx="8" fill="#D5F2E5" stroke="#1FA978" strokeWidth="2" filter="url(#shadow)"/>
                <text x="200" y="187" textAnchor="middle" fill="#0D543C" fontSize="12" fontWeight="700">Save</text>
                
                <rect x="265" y="167" width="100" height="30" rx="8" fill="#D5F2E5" stroke="#1FA978" strokeWidth="2" filter="url(#shadow)"/>
                <text x="315" y="187" textAnchor="middle" fill="#0D543C" fontSize="12" fontWeight="700">Invest</text>
              </svg>
              <p className="text-center text-gray-500 text-sm mt-5 font-medium">
                Your income splits into spending, saving, and investing
              </p>
            </div>

            {/* Real Life Example */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 mb-10 border border-amber-200 shadow-sm">
              <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm">
                  <BookOpenIcon className="w-5 h-5 text-amber-600" />
                </span>
                <span>Real-Life Example</span>
              </h3>
              <p className="text-amber-800 leading-relaxed">
                <strong>Meet Sarah.</strong> She just got her first job with a salary of <strong>$3,000/month</strong>.
              </p>
              <p className="text-amber-800 leading-relaxed mt-3">
                Without personal finance knowledge, she might spend $2,900 on rent, food, shopping, and outings — leaving just $100. 
                One emergency (like a broken phone), and she's in trouble.
              </p>
              <p className="text-amber-800 leading-relaxed mt-3">
                <strong>With personal finance knowledge</strong>, she plans:
              </p>
              <ul className="mt-2 space-y-1 text-amber-800">
                <li>• Rent & bills: $1,200</li>
                <li>• Food & transport: $600</li>
                <li>• Fun & shopping: $600</li>
                <li>• <strong>Savings: $600</strong> (for emergencies & goals)</li>
              </ul>
              <p className="text-amber-800 leading-relaxed mt-3">
                Now Sarah is in control. She enjoys life AND saves for her future. That's personal finance!
              </p>
            </div>

          </div>

          {/* Quiz Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
                <BrainIcon className="w-6 h-6 text-white" />
              </span>
              <span>Quick Check</span>
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                id="q1"
                question="What is personal finance?"
                options={[
                  "A type of bank account",
                  "Managing your own money (earning, spending, saving)",
                  "Investing in the stock market only",
                  "A government tax scheme"
                ]}
                correctAnswer="B"
                explanation="Personal finance is simply managing your own money — how you earn it, spend it, and save it."
              />

              <QuizQuestion
                id="q2"
                question="In Sarah's example, why was she able to save $600?"
                options={[
                  "She got a bonus from her company",
                  "She stopped eating food",
                  "She planned her expenses and saved before spending",
                  "Her parents gave her extra money"
                ]}
                correctAnswer="C"
                explanation="Sarah planned her budget first. She decided how much to spend on each category and kept $600 aside for savings. That's smart money management!"
              />
            </div>
          </div>

          {/* Key Takeaway */}
          <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm">
                <KeyIcon className="w-5 h-5 text-white" />
              </span>
              <span>Key Takeaway</span>
            </h3>
            <p className="text-green-50 leading-relaxed">
              Personal finance isn't complicated. It's about knowing your money — what comes in, what goes out, and what you keep. 
              When you manage this well, you're building a secure future!
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-100">
            <button 
              onClick={() => navigate('/learn')}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-emerald-600 transition-colors group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Module</span>
            </button>
            <button 
              onClick={() => navigate('/learn/personal-finance-lesson-2')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              <span>Next: Income vs Expenses</span>
              <FaArrowRight />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PersonalFinanceLesson1;
