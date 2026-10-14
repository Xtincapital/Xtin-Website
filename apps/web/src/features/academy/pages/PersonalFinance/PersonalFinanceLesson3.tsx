import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { 
  ChartBarIcon, TargetIcon, CheckCircleIcon, BookOpenIcon, 
  BrainIcon, KeyIcon, HomeIcon, PercentIcon, CoinsIcon, CalculatorIcon, DollarIcon,
  LightbulbIcon, FilmIcon, PiggyBankIcon, StarIcon, BoltIcon
} from "../../components/LearningIcons";

const PersonalFinanceLesson3 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});
  const [activityIncome, setActivityIncome] = useState("");

  const handleAnswer = (questionId, selectedOption) => {
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
                onClick={() => !answered && handleAnswer(id, optionLetter)}
                disabled={answered}
                className={`w-full text-left p-4 rounded-xl border-2 ${borderColor} ${bgColor} transition-all duration-200 ${!answered ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className="flex items-center gap-3">
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${answered && isCorrectOption ? 'bg-emerald-500 text-white' : answered && isSelected ? 'bg-red-500 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                    {optionLetter}
                  </span>
                  <span className="text-gray-700 flex-1">{option}</span>
                  {answered && isCorrectOption && <FaCheckCircle className="text-emerald-500 text-lg" />}
                  {answered && isSelected && !isCorrectOption && <FaTimesCircle className="text-red-500 text-lg" />}
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

  // Calculate 50-30-20 split
  const income = parseFloat(activityIncome) || 0;
  const needs = (income * 0.5).toFixed(0);
  const wants = (income * 0.3).toFixed(0);
  const savings = (income * 0.2).toFixed(0);

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
            <span>Back to Module</span>
          </button>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
                Lesson 3 of 9
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                10 min read
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-normal text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-200 rounded-xl shadow-sm">
                <ChartBarIcon className="w-7 h-7 text-emerald-600" />
              </span>
              <span>Budgeting Basics</span>
            </h1>
            <p className="text-lg text-gray-500">
              Learn the simple 50-30-20 rule that makes managing money effortless.
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 mb-10 border border-emerald-200 shadow-sm">
            <h2 className="font-semibold text-emerald-900 mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm">
                <TargetIcon className="w-5 h-5 text-emerald-600" />
              </span>
              <span>After this lesson, you'll know:</span>
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-emerald-800">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5" />
                </span>
                <span>What a budget is and why it matters</span>
              </li>
              <li className="flex items-start gap-3 text-emerald-800">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5" />
                </span>
                <span>How to use the <strong>50-30-20 rule</strong> to split your income</span>
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-[-0.015em]">What is a Budget?</h2>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              A <strong className="text-gray-900">budget</strong> is simply a plan for your money. Before you spend, you decide where each dollar should go. No surprises at the end of the month!
            </p>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              The easiest budget system? The <strong className="text-amber-600">50-30-20 rule</strong>. Split your income into three parts:
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-emerald-50 rounded-xl p-5 text-center border-2 border-emerald-200 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-2 font-bold text-emerald-600">50%</div>
                <h4 className="font-bold text-emerald-900">Needs</h4>
                <p className="text-sm text-emerald-700 mt-1">Rent, food, bills, transport</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-5 text-center border-2 border-purple-200 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-2 font-bold text-purple-600">30%</div>
                <h4 className="font-bold text-purple-900">Wants</h4>
                <p className="text-sm text-purple-700 mt-1">Entertainment, dining, hobbies</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-5 text-center border-2 border-blue-200 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-2 font-bold text-blue-600">20%</div>
                <h4 className="font-bold text-blue-900">Savings</h4>
                <p className="text-sm text-blue-700 mt-1">Emergency fund, future goals</p>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8">
              That's it! This simple split keeps you financially healthy without complicated spreadsheets.
            </p>

            {/* SVG Diagram - Donut Chart */}
            <div className="bg-white rounded-3xl p-8 mb-10 border border-gray-100 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">The 50-30-20 Split</h3>
              <svg className="w-full max-w-md mx-auto" viewBox="0 0 400 300" fill="none">
                {/* Background circle */}
                <circle cx="150" cy="150" r="100" fill="#EFEDE7"/>
                
                {/* 50% Needs - Green (starts at top, goes clockwise) */}
                <path 
                  d="M150 50 A100 100 0 0 1 150 250" 
                  fill="none" 
                  stroke="#1FA978" 
                  strokeWidth="40"
                  strokeLinecap="round"
                />
                
                {/* 30% Wants - Purple */}
                <path 
                  d="M150 250 A100 100 0 0 1 63.4 100" 
                  fill="none" 
                  stroke="#8F6FC4" 
                  strokeWidth="40"
                />
                
                {/* 20% Savings - Blue */}
                <path 
                  d="M63.4 100 A100 100 0 0 1 150 50" 
                  fill="none" 
                  stroke="#5A77AA" 
                  strokeWidth="40"
                />
                
                {/* Center white circle */}
                <circle cx="150" cy="150" r="60" fill="white"/>
                
                {/* Center text */}
                <text x="150" y="145" textAnchor="middle" fill="#404047" fontSize="14" fontWeight="bold">YOUR</text>
                <text x="150" y="165" textAnchor="middle" fill="#404047" fontSize="14" fontWeight="bold">INCOME</text>
                
                {/* Labels - moved further right with more space */}
                <g transform="translate(280, 100)">
                  <rect x="0" y="0" width="16" height="16" rx="4" fill="#1FA978"/>
                  <text x="24" y="13" fill="#0D543C" fontSize="13" fontWeight="600">50% Needs</text>
                </g>
                <g transform="translate(280, 130)">
                  <rect x="0" y="0" width="16" height="16" rx="4" fill="#8F6FC4"/>
                  <text x="24" y="13" fill="#533F70" fontSize="13" fontWeight="600">30% Wants</text>
                </g>
                <g transform="translate(280, 160)">
                  <rect x="0" y="0" width="16" height="16" rx="4" fill="#5A77AA"/>
                  <text x="24" y="13" fill="#2C3F5E" fontSize="13" fontWeight="600">20% Savings</text>
                </g>
              </svg>
              <p className="text-center text-gray-500 text-sm mt-6 flex items-center justify-center gap-2">
                <LightbulbIcon className="w-4 h-4 text-amber-500" />
                <span>This simple split works for any income level!</span>
              </p>
            </div>

            {/* Real Life Example */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 mb-10 border border-teal-200 relative overflow-hidden">
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-teal-200/30 rounded-full"></div>
              <h3 className="font-semibold text-teal-900 mb-4 flex items-center gap-2 relative z-10">
                <span className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <DollarIcon className="w-5 h-5 text-teal-600" />
                </span>
                Real Example: Jordan's Budget
              </h3>
              <p className="text-teal-800 leading-relaxed mb-4 relative z-10">
                Jordan earns <strong>$3,000/month</strong>. Here's how the 50-30-20 rule works:
              </p>
              
              <div className="space-y-3 relative z-10">
                <div className="bg-white/70 rounded-xl p-4 flex items-center justify-between border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <HomeIcon className="w-5 h-5 text-emerald-600" />
                    </span>
                    <div>
                      <p className="font-bold text-emerald-800">50% → Needs</p>
                      <p className="text-sm text-emerald-600">Rent, groceries, utilities, transport</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">$1,500</span>
                </div>
                
                <div className="bg-white/70 rounded-xl p-4 flex items-center justify-between border border-purple-200">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FilmIcon className="w-5 h-5 text-purple-600" />
                    </span>
                    <div>
                      <p className="font-bold text-purple-800">30% → Wants</p>
                      <p className="text-sm text-purple-600">Dining out, streaming, shopping</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">$900</span>
                </div>
                
                <div className="bg-white/70 rounded-xl p-4 flex items-center justify-between border border-blue-200">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <PiggyBankIcon className="w-5 h-5 text-blue-600" />
                    </span>
                    <div>
                      <p className="font-bold text-blue-800">20% → Savings</p>
                      <p className="text-sm text-blue-600">Emergency fund, future goals</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">$600</span>
                </div>
              </div>
              
              <div className="mt-4 bg-teal-100 rounded-xl p-4 relative z-10">
                <p className="text-teal-800 text-sm flex items-center gap-2">
                  <StarIcon className="w-4 h-4 text-teal-600" />
                  <span><strong>Result:</strong> Jordan enjoys life, pays all bills, AND saves $600 every month. In one year, that's <strong>$7,200</strong> saved!</span>
                </p>
              </div>
            </div>

          </div>

          {/* Quiz Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
                <BrainIcon className="w-6 h-6 text-white" />
              </span>
              Quick Quiz
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                id="q1"
                question="In the 50-30-20 rule, what percentage goes to Savings?"
                options={[
                  "50%",
                  "30%",
                  "20%",
                  "10%"
                ]}
                correctAnswer="C"
                explanation="20% of your income should go to savings. This builds your emergency fund and helps you reach future goals!"
              />

              <QuizQuestion
                id="q2"
                question="If you earn $4,000/month, how much should you spend on Wants?"
                options={[
                  "$2,000",
                  "$1,200",
                  "$800",
                  "$400"
                ]}
                correctAnswer="B"
                explanation="30% of $4,000 = $1,200. That's your budget for entertainment, dining out, and fun stuff!"
              />
            </div>
          </div>

          {/* Mini Activity */}
          <div className="mt-12 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200">
            <h2 className="text-xl font-semibold text-violet-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <CalculatorIcon className="w-5 h-5 text-violet-600" />
              </span>
              Try It Yourself!
            </h2>
            <p className="text-violet-700 mb-4">
              Enter your monthly income and see your 50-30-20 split instantly:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="text-sm text-violet-600 font-medium mb-1 block">Your Monthly Income</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    value={activityIncome}
                    onChange={(e) => setActivityIncome(e.target.value)}
                    placeholder="3000"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none text-lg font-semibold"
                  />
                </div>
              </div>
            </div>

            {income > 0 && (
              <div className="grid grid-cols-3 gap-3 animate-fadeIn">
                <div className="bg-emerald-100 rounded-xl p-4 text-center border border-emerald-200">
                  <p className="text-xs text-emerald-600 font-medium mb-1">50% NEEDS</p>
                  <p className="text-2xl font-bold text-emerald-700">${needs}</p>
                </div>
                <div className="bg-purple-100 rounded-xl p-4 text-center border border-purple-200">
                  <p className="text-xs text-purple-600 font-medium mb-1">30% WANTS</p>
                  <p className="text-2xl font-bold text-purple-700">${wants}</p>
                </div>
                <div className="bg-blue-100 rounded-xl p-4 text-center border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-1">20% SAVINGS</p>
                  <p className="text-2xl font-bold text-blue-700">${savings}</p>
                </div>
              </div>
            )}
          </div>

          {/* Key Takeaway */}
          <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <h3 className="font-semibold text-lg mb-2 relative z-10 flex items-center gap-2">
              <BoltIcon className="w-5 h-5" />
              <span>Key Takeaway</span>
            </h3>
            <p className="text-emerald-50 leading-relaxed relative z-10">
              The 50-30-20 rule is the simplest budget you'll ever use. <strong className="text-white">50% Needs, 30% Wants, 20% Savings.</strong> Start today — your future self will thank you!
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-200">
            <button 
              onClick={() => navigate('/learn/personal-finance-lesson-2')}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-emerald-600 transition-colors group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Lesson 2: Income vs Expenses</span>
            </button>
            <button 
              onClick={() => navigate('/learn/personal-finance-lesson-4')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              <span>Next: Savings & Emergency Fund</span>
              <FaArrowRight />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PersonalFinanceLesson3;
