import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { 
  BalanceScaleIcon, TargetIcon, CheckCircleIcon, BookOpenIcon, 
  BrainIcon, KeyIcon, HomeIcon, HeartIcon, LightbulbIcon,
  PlugIcon, GroceryIcon, BusIcon, PhoneIcon, PizzaIcon, FilmIcon, ShirtIcon, GamepadIcon, CoinsIcon
} from "../../components/LearningIcons";

const PersonalFinanceLesson2 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const handleAnswer = (questionId, selectedOption, _correctAnswer) => {
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
                onClick={() => !answered && handleAnswer(id, optionLetter, correctAnswer)}
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
                <><svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v10M12 17v4M12 21a9 9 0 100-18 9 9 0 000 18z"/></svg> Not quite right.</>  
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
                Lesson 2 of 9
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                8 min read
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-sm bg-brand-soft">
                <BalanceScaleIcon className="w-7 h-7 text-brand" />
              </span>
              <span>Income vs Expenses</span>
            </h1>
            <p className="text-lg text-gray-500">
              Learn the difference between needs and wants — the foundation of smart spending.
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
                <span>The difference between <strong>needs</strong> and <strong>wants</strong></span>
              </li>
              <li className="flex items-start gap-3 text-brand">
                <span className="text-brand mt-0.5 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5" />
                </span>
                <span>How to identify where your money is really going</span>
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-[-0.015em]">The Simple Truth About Money</h2>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              Every dollar you spend falls into one of two categories: <strong className="text-gray-900">Needs</strong> or <strong className="text-gray-900">Wants</strong>.
            </p>
            
            <p className="text-gray-600 leading-relaxed mb-4">
              <strong className="text-brand">Needs</strong> = Things you <em>must</em> have to survive (rent, food, electricity, medicine).
            </p>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              <strong className="text-purple-600">Wants</strong> = Things that are nice to have but you can live without (Netflix, dining out, new clothes).
            </p>

            <p className="text-gray-600 leading-relaxed mb-8">
              Most people overspend on wants without realizing it. Knowing the difference helps you save more without feeling poor.
            </p>

            {/* Visual SVG - Needs vs Wants Scale */}
            <div className="bg-white rounded-3xl p-8 mb-10 border border-gray-100 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Needs vs Wants — The Balance</h3>
              <svg className="w-full max-w-lg mx-auto" viewBox="0 0 500 280" fill="none">
                {/* Balance beam base */}
                <rect x="235" y="220" width="30" height="60" rx="4" fill="#373A41"/>
                <polygon points="250,180 220,220 280,220" fill="#555A63"/>
                
                {/* Balance beam */}
                <rect x="50" y="170" width="400" height="12" rx="6" fill="#A0A3AA"/>
                <circle cx="250" cy="176" r="8" fill="#373A41"/>
                
                {/* Left pan - Needs (heavier/lower) */}
                <ellipse cx="100" cy="200" rx="70" ry="15" fill="#16A34A"/>
                <line x1="100" y1="176" x2="100" y2="185" stroke="#717680" strokeWidth="3"/>
                
                {/* Needs items */}
                <rect x="55" y="130" width="90" height="55" rx="8" fill="#F0FDF4" stroke="#16A34A" strokeWidth="2"/>
                <text x="100" y="150" textAnchor="middle" fill="#16A34A" fontSize="11" fontWeight="bold">NEEDS ✓</text>
                <text x="100" y="168" textAnchor="middle" fill="#16A34A" fontSize="9">Rent • Food</text>
                <text x="100" y="180" textAnchor="middle" fill="#16A34A" fontSize="9">Utilities • Health</text>
                
                {/* Right pan - Wants (lighter/higher) */}
                <ellipse cx="400" cy="155" rx="70" ry="15" fill="#8F6FC4"/>
                <line x1="400" y1="176" x2="400" y2="140" stroke="#717680" strokeWidth="3"/>
                
                {/* Wants items */}
                <rect x="355" y="85" width="90" height="55" rx="8" fill="#ECE4F6" stroke="#8F6FC4" strokeWidth="2"/>
                <text x="400" y="105" textAnchor="middle" fill="#533F70" fontSize="11" fontWeight="bold">WANTS ♡</text>
                <text x="400" y="123" textAnchor="middle" fill="#654B8A" fontSize="9">Streaming • Dining</text>
                <text x="400" y="135" textAnchor="middle" fill="#654B8A" fontSize="9">Shopping • Trips</text>
                
                {/* Arrow showing priority */}
                <path d="M180 120 L180 100 L220 130 L180 160 L180 140 L140 140 L140 120 Z" fill="#CDAA5F" opacity="0.8"/>
                <text x="180" y="130" textAnchor="middle" fill="#654B26" fontSize="8" fontWeight="bold">PAY</text>
                <text x="180" y="142" textAnchor="middle" fill="#654B26" fontSize="8" fontWeight="bold">FIRST</text>
                
                {/* Labels */}
                <text x="100" y="230" textAnchor="middle" fill="#16A34A" fontSize="12" fontWeight="bold">Essential</text>
                <text x="400" y="230" textAnchor="middle" fill="#533F70" fontSize="12" fontWeight="bold">Optional</text>
              </svg>
              <p className="text-center text-gray-500 text-sm mt-6 flex items-center justify-center gap-2">
                <LightbulbIcon className="w-4 h-4 text-amber-500" />
                <span><strong>Rule:</strong> Always pay for Needs first, then enjoy Wants with what's left.</span>
              </p>
            </div>

            {/* Real Life Example */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 mb-10 border border-orange-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="font-semibold text-orange-900 mb-4 flex items-center gap-3 relative z-10">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm">
                  <BookOpenIcon className="w-5 h-5 text-orange-600" />
                </span>
                <span>Real Example: Alex's Monthly Expenses</span>
              </h3>
              <p className="text-orange-800 leading-relaxed mb-4 relative z-10">
                Alex earns <strong>$4,000/month</strong>. Let's see his spending:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 relative z-10">
                <div className="bg-white/70 rounded-xl p-4 border border-brand-line">
                  <h4 className="font-bold text-brand mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-brand-soft rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-brand" />
                    </span>
                    Needs (Must Pay)
                  </h4>
                  <ul className="text-sm text-brand space-y-2">
                    <li className="flex items-center gap-2"><HomeIcon className="w-4 h-4 text-brand" /> Rent: $1,400</li>
                    <li className="flex items-center gap-2"><PlugIcon className="w-4 h-4 text-brand" /> Utilities & WiFi: $200</li>
                    <li className="flex items-center gap-2"><GroceryIcon className="w-4 h-4 text-brand" /> Groceries: $400</li>
                    <li className="flex items-center gap-2"><BusIcon className="w-4 h-4 text-brand" /> Transport: $250</li>
                    <li className="flex items-center gap-2"><PhoneIcon className="w-4 h-4 text-brand" /> Phone bill: $50</li>
                    <li className="font-bold pt-2 border-t border-brand-line">Total: $2,300</li>
                  </ul>
                </div>
                
                <div className="bg-white/70 rounded-xl p-4 border border-purple-200">
                  <h4 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <HeartIcon className="w-4 h-4 text-purple-600" />
                    </span>
                    Wants (Can Reduce)
                  </h4>
                  <ul className="text-sm text-purple-800 space-y-2">
                    <li className="flex items-center gap-2"><PizzaIcon className="w-4 h-4 text-purple-600" /> Food delivery apps: $350</li>
                    <li className="flex items-center gap-2"><FilmIcon className="w-4 h-4 text-purple-600" /> Netflix + Spotify: $30</li>
                    <li className="flex items-center gap-2"><ShirtIcon className="w-4 h-4 text-purple-600" /> Shopping: $250</li>
                    <li className="flex items-center gap-2"><GamepadIcon className="w-4 h-4 text-purple-600" /> Gaming/Entertainment: $170</li>
                    <li className="font-bold pt-2 border-t border-purple-200">Total: $800</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 bg-brand-soft rounded-xl p-4 relative z-10">
                <p className="text-brand text-sm flex items-center gap-2">
                  <CoinsIcon className="w-4 h-4 text-brand" />
                  <span><strong>Remaining for Savings:</strong> $4,000 - $2,300 - $800 = <strong className="text-brand">$900</strong></span>
                </p>
                <p className="text-brand text-xs mt-1">
                  If Alex reduces wants by $300, he can save $1,200/month!
                </p>
              </div>
            </div>

          </div>

          {/* Quiz Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-brand-fill">
                <BrainIcon className="w-6 h-6 text-white" />
              </span>
              <span>Test Your Understanding</span>
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                id="q1"
                question="Which of these is a NEED?"
                options={[
                  "Netflix subscription",
                  "New smartphone every year",
                  "Electricity bill",
                  "Eating at restaurants"
                ]}
                correctAnswer="C"
                explanation="Electricity is essential for daily life — you need it for lights, cooking, and work. Netflix and restaurants are wants — nice to have but not necessary."
              />

              <QuizQuestion
                id="q2"
                question="Alex wants to save more. What should he do FIRST?"
                options={[
                  "Stop paying rent",
                  "Reduce food delivery and shopping",
                  "Cancel his phone plan",
                  "Stop buying groceries"
                ]}
                correctAnswer="B"
                explanation="Food delivery and shopping are wants — they can be reduced. Rent, phone, and groceries are needs that you can't skip!"
              />
            </div>
          </div>

          {/* Key Takeaway */}
          <div className="mt-12 rounded-2xl p-6 text-white relative overflow-hidden bg-brand-fill">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-3 relative z-10">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm">
                <KeyIcon className="w-5 h-5 text-white" />
              </span>
              <span>Key Takeaway</span>
            </h3>
            <p className="text-white/85 leading-relaxed relative z-10">
              Before spending, ask yourself: <em>"Do I need this, or do I just want it?"</em> 
              Pay for needs first, enjoy wants second, and you'll always have money left to save.
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-200">
            <button 
              onClick={() => navigate('/learn/personal-finance-lesson-1')}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-brand transition-colors group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Lesson 1: What is Personal Finance?</span>
            </button>
            <button 
              onClick={() => navigate('/learn/personal-finance-lesson-3')}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-brand/25 transition-all bg-brand-fill"
            >
              <span>Next: Budgeting Basics</span>
              <FaArrowRight />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PersonalFinanceLesson2;
