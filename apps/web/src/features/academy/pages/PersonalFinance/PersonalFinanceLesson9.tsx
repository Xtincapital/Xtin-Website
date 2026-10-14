import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaTrophy } from "react-icons/fa";
import { 
  WarningIcon, TargetIcon, CheckCircleIcon, BookOpenIcon, 
  BrainIcon, KeyIcon, TrophyIcon, CelebrationIcon, ShieldIcon,
  PiggyBankIcon, CreditCardIcon, ChartBarIcon, SearchIcon, CoinsIcon,
  LightbulbIcon, PencilIcon, BoltIcon
} from "../../components/LearningIcons";

const PersonalFinanceLesson9 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});
  const [selectedMistake, setSelectedMistake] = useState("");

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

  const mistakes = [
    { id: "spending", label: "Spending more than I earn", IconComponent: CoinsIcon },
    { id: "emergency", label: "Building an emergency fund", IconComponent: PiggyBankIcon },
    { id: "insurance", label: "Getting proper insurance", IconComponent: ShieldIcon },
    { id: "credit", label: "Using credit wisely", IconComponent: CreditCardIcon },
    { id: "budget", label: "Creating a budget", IconComponent: ChartBarIcon },
    { id: "research", label: "Researching before investing", IconComponent: SearchIcon },
  ];

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
                Lesson 9 of 9
              </span>
              <span className="px-3 py-1.5 bg-brand-soft text-brand rounded-full text-sm font-semibold flex items-center gap-1.5">
                <TrophyIcon className="w-4 h-4" />
                Final Lesson!
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-100 to-red-200 rounded-xl shadow-sm">
                <WarningIcon className="w-7 h-7 text-red-600" />
              </span>
              <span>Common Money Mistakes Beginners Make</span>
            </h1>
            <p className="text-lg text-gray-500">
              Learn what to avoid so you can build a stronger financial future.
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
                <span>Common money mistakes to avoid</span>
              </li>
              <li className="flex items-start gap-3 text-brand">
                <span className="text-brand mt-0.5 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5" />
                </span>
                <span>How to break bad money habits</span>
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-[-0.025em]">Why Money Mistakes Happen</h2>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              <strong className="text-gray-900">Everyone makes money mistakes</strong> — especially when starting out. Nobody teaches us about money in school, so we learn through trial and error. The good news? Recognizing these mistakes early helps you avoid them and build better habits!
            </p>

            <div className="bg-brand-soft rounded-xl p-5 mb-8 border border-brand-line">
              <h4 className="font-bold text-brand mb-2 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-brand" />
                Remember
              </h4>
              <p className="text-brand">
                Making mistakes doesn't make you bad with money — it makes you human. What matters is <strong>learning</strong> from them and making better choices going forward.
              </p>
            </div>

            {/* Common Mistakes */}
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-[-0.025em]">6 Common Beginner Mistakes</h2>
            
            <div className="space-y-4 mb-10">
              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-5 border border-red-200">
                <div className="flex items-start gap-4">
                  <span className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <WarningIcon className="w-6 h-6 text-red-600" />
                  </span>
                  <div>
                    <h4 className="font-bold text-red-900">1. Spending More Than You Earn</h4>
                    <p className="text-red-700 text-sm mt-1">
                      If you spend $3,500 on a $3,000 salary, you're going backwards. Always live within your means.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-200">
                <div className="flex items-start gap-4">
                  <span className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PiggyBankIcon className="w-6 h-6 text-amber-600" />
                  </span>
                  <div>
                    <h4 className="font-bold text-amber-900">2. No Emergency Fund</h4>
                    <p className="text-amber-700 text-sm mt-1">
                      Without savings, one unexpected expense can push you into debt. Aim for 3–6 months of expenses.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl p-5 border border-brand-line bg-brand-soft">
                <div className="flex items-start gap-4">
                  <span className="w-12 h-12 bg-brand-soft rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShieldIcon className="w-6 h-6 text-brand" />
                  </span>
                  <div>
                    <h4 className="font-bold text-brand">3. Ignoring Insurance</h4>
                    <p className="text-brand text-sm mt-1">
                      Skipping health or life insurance can wipe out years of savings in one emergency. Protection first!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
                <div className="flex items-start gap-4">
                  <span className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCardIcon className="w-6 h-6 text-blue-600" />
                  </span>
                  <div>
                    <h4 className="font-bold text-blue-900">4. Misusing Credit Cards</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      Paying only the minimum? Interest piles up fast. Use credit cards wisely — pay full balance monthly.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl p-5 border border-teal-200 bg-brand-soft">
                <div className="flex items-start gap-4">
                  <span className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ChartBarIcon className="w-6 h-6 text-teal-600" />
                  </span>
                  <div>
                    <h4 className="font-bold text-teal-900">5. No Budget or Tracking</h4>
                    <p className="text-teal-700 text-sm mt-1">
                      "I don't know where my money goes" — tracking expenses is the first step to control. Use the 50-30-20 rule!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-200">
                <div className="flex items-start gap-4">
                  <span className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <SearchIcon className="w-6 h-6 text-pink-600" />
                  </span>
                  <div>
                    <h4 className="font-bold text-pink-900">6. Following Tips Blindly</h4>
                    <p className="text-pink-700 text-sm mt-1">
                      "My friend said to invest in X" — always research before putting your money anywhere. No shortcuts!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SVG Diagram - Mistake Loop vs Smart Money Loop */}
            <div className="bg-white rounded-3xl p-8 mb-10 border border-gray-100 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Mistake Loop vs Smart Money Loop</h3>
              <svg className="w-full max-w-2xl mx-auto" viewBox="0 0 600 280" fill="none">
                {/* Left Side - Mistake Loop */}
                <g transform="translate(20, 20)">
                  <text x="110" y="15" textAnchor="middle" fill="#C7363B" fontSize="14" fontWeight="bold">✖ MISTAKE LOOP</text>
                  
                  {/* Circular arrows */}
                  <circle cx="110" cy="130" r="90" fill="none" stroke="#F6C3C3" strokeWidth="8" strokeDasharray="20 10"/>
                  
                  {/* Earn */}
                  <g transform="translate(75, 35)">
                    <rect x="0" y="0" width="70" height="40" rx="8" fill="#FBE1E1" stroke="#E04848" strokeWidth="2"/>
                    <text x="35" y="25" textAnchor="middle" fill="#C7363B" fontSize="11" fontWeight="bold">Earn $</text>
                  </g>
                  
                  {/* Overspend */}
                  <g transform="translate(155, 100)">
                    <rect x="0" y="0" width="80" height="40" rx="8" fill="#FBE1E1" stroke="#E04848" strokeWidth="2"/>
                    <text x="40" y="25" textAnchor="middle" fill="#C7363B" fontSize="11" fontWeight="bold">Overspend</text>
                  </g>
                  
                  {/* Debt */}
                  <g transform="translate(75, 175)">
                    <rect x="0" y="0" width="70" height="40" rx="8" fill="#FBE1E1" stroke="#E04848" strokeWidth="2"/>
                    <text x="35" y="25" textAnchor="middle" fill="#C7363B" fontSize="11" fontWeight="bold">Debt</text>
                  </g>
                  
                  {/* Stress */}
                  <g transform="translate(-15, 100)">
                    <rect x="0" y="0" width="70" height="40" rx="8" fill="#FBE1E1" stroke="#E04848" strokeWidth="2"/>
                    <text x="35" y="25" textAnchor="middle" fill="#C7363B" fontSize="11" fontWeight="bold">Stress</text>
                  </g>
                  
                  {/* Arrows */}
                  <path d="M145 65 Q180 80 185 100" stroke="#E04848" strokeWidth="2" fill="none" markerEnd="url(#arrowRed)"/>
                  <path d="M185 145 Q180 170 145 190" stroke="#E04848" strokeWidth="2" fill="none" markerEnd="url(#arrowRed)"/>
                  <path d="M75 195 Q40 180 35 145" stroke="#E04848" strokeWidth="2" fill="none" markerEnd="url(#arrowRed)"/>
                  <path d="M35 100 Q40 70 75 55" stroke="#E04848" strokeWidth="2" fill="none" markerEnd="url(#arrowRed)"/>
                </g>
                
                {/* Center divider */}
                <line x1="300" y1="30" x2="300" y2="250" stroke="#E4E4EA" strokeWidth="2" strokeDasharray="5 5"/>
                <text x="300" y="270" textAnchor="middle" fill="#717680" fontSize="12" fontWeight="bold">VS</text>
                
                {/* Right Side - Smart Money Loop */}
                <g transform="translate(330, 20)">
                  <text x="120" y="15" textAnchor="middle" fill="#12805A" fontSize="14" fontWeight="bold">✔ SMART MONEY LOOP</text>
                  
                  {/* Circular arrows */}
                  <circle cx="120" cy="130" r="90" fill="none" stroke="#ABE5CC" strokeWidth="8" strokeDasharray="20 10"/>
                  
                  {/* Earn */}
                  <g transform="translate(85, 35)">
                    <rect x="0" y="0" width="70" height="40" rx="8" fill="#EEF9F4" stroke="#12805A" strokeWidth="2"/>
                    <text x="35" y="25" textAnchor="middle" fill="#12805A" fontSize="11" fontWeight="bold">Earn $</text>
                  </g>
                  
                  {/* Budget */}
                  <g transform="translate(165, 100)">
                    <rect x="0" y="0" width="70" height="40" rx="8" fill="#EEF9F4" stroke="#12805A" strokeWidth="2"/>
                    <text x="35" y="25" textAnchor="middle" fill="#12805A" fontSize="11" fontWeight="bold">Budget</text>
                  </g>
                  
                  {/* Save */}
                  <g transform="translate(85, 175)">
                    <rect x="0" y="0" width="70" height="40" rx="8" fill="#EEF9F4" stroke="#12805A" strokeWidth="2"/>
                    <text x="35" y="25" textAnchor="middle" fill="#12805A" fontSize="11" fontWeight="bold">Save</text>
                  </g>
                  
                  {/* Grow */}
                  <g transform="translate(5, 100)">
                    <rect x="0" y="0" width="70" height="40" rx="8" fill="#EEF9F4" stroke="#12805A" strokeWidth="2"/>
                    <text x="35" y="25" textAnchor="middle" fill="#12805A" fontSize="11" fontWeight="bold">Grow</text>
                  </g>
                  
                  {/* Arrows */}
                  <path d="M155 65 Q190 80 195 100" stroke="#12805A" strokeWidth="2" fill="none" markerEnd="url(#arrowGreen)"/>
                  <path d="M195 145 Q190 170 155 190" stroke="#12805A" strokeWidth="2" fill="none" markerEnd="url(#arrowGreen)"/>
                  <path d="M85 195 Q50 180 45 145" stroke="#12805A" strokeWidth="2" fill="none" markerEnd="url(#arrowGreen)"/>
                  <path d="M45 100 Q50 70 85 55" stroke="#12805A" strokeWidth="2" fill="none" markerEnd="url(#arrowGreen)"/>
                </g>
                
                {/* Arrow markers */}
                <defs>
                  <marker id="arrowRed" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#E04848"/>
                  </marker>
                  <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#12805A"/>
                  </marker>
                </defs>
              </svg>
              <p className="text-center text-gray-500 text-sm mt-6 flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H15M12 3C8.68629 3 6 5.68629 6 9C6 11.2208 7.2066 13.1599 9 14.1973V17C9 17.5523 9.44772 18 10 18H14C14.5523 18 15 17.5523 15 17V14.1973C16.7934 13.1599 18 11.2208 18 9C18 5.68629 15.3137 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Break the mistake loop by budgeting, saving, and letting your money grow!
              </p>
            </div>

            {/* Real Life Example */}
            <div className="rounded-2xl p-6 mb-10 border border-brand-line relative overflow-hidden bg-brand-soft">
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-soft rounded-full"></div>
              <h3 className="font-semibold text-brand mb-4 flex items-center gap-2 relative z-10">
                <span className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
                  <BookOpenIcon className="w-5 h-5 text-brand" />
                </span>
                Real Example: Mike's Wake-Up Call
              </h3>
              <p className="text-brand leading-relaxed mb-4 relative z-10">
                Mike earns <strong>$4,000/month</strong> but fell into the mistake loop:
              </p>
              
              <div className="space-y-3 relative z-10">
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    What Went Wrong
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Got a raise → Upgraded apartment ($500 more rent)</li>
                    <li>• New car loan → $400/month EMI</li>
                    <li>• Credit card for shopping → $2,000 balance at 20% interest</li>
                    <li>• No savings → Emergency hit, borrowed more</li>
                  </ul>
                </div>
                
                <div className="bg-brand-soft rounded-xl p-4 border border-brand-line">
                  <h4 className="font-bold text-brand mb-2 flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-brand" />
                    The Fix
                  </h4>
                  <ul className="text-sm text-brand space-y-1">
                    <li>• Created a budget (50-30-20 rule)</li>
                    <li>• Paid off credit card debt first</li>
                    <li>• Built a $5,000 emergency fund</li>
                    <li>• Stopped lifestyle inflation</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 bg-brand-soft rounded-xl p-4 relative z-10">
                <p className="text-brand text-sm flex items-center gap-2">
                  <LightbulbIcon className="w-4 h-4 text-brand flex-shrink-0" />
                  <span>Mike's lesson: <strong>A raise doesn't mean spend more</strong> — it means save and invest more!</span>
                </p>
              </div>
            </div>

          </div>

          {/* Quiz Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.025em]">
              <span className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-brand-fill">
                <PencilIcon className="w-6 h-6 text-white" />
              </span>
              Quick Quiz
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                id="q1"
                question="What should you do FIRST when you get a salary increase?"
                options={[
                  "Upgrade your lifestyle immediately",
                  "Buy a new car on loan",
                  "Increase your savings and investments",
                  "Go on an expensive vacation"
                ]}
                correctAnswer="C"
                explanation="When income increases, smart money habit is to save/invest more first. Avoid 'lifestyle inflation' where your spending grows with your income!"
              />

              <QuizQuestion
                id="q2"
                question="Why is paying only the 'minimum due' on a credit card a mistake?"
                options={[
                  "It closes your credit card account",
                  "Interest keeps adding up and your debt grows",
                  "Banks charge a one-time fee",
                  "It's actually a good strategy"
                ]}
                correctAnswer="B"
                explanation="Paying only the minimum means the remaining balance grows with high interest (often 20-40% per year). Always try to pay the full balance!"
              />
            </div>
          </div>

          {/* Reflection Activity */}
          <div className="mt-12 rounded-2xl p-6 border border-brand-line bg-brand-soft">
            <h2 className="text-xl font-semibold text-brand mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
                <SearchIcon className="w-5 h-5 text-brand" />
              </span>
              Reflection: Your First Priority
            </h2>
            <p className="text-brand mb-4">
              Which money mistake do you want to avoid or fix first? Select one to focus on:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mistakes.map((mistake) => (
                <button
                  key={mistake.id}
                  onClick={() => setSelectedMistake(mistake.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedMistake === mistake.id 
                      ? 'border-brand bg-brand-soft shadow-md' 
                      : 'border-brand-line bg-white hover:border-brand-line hover:bg-brand-soft'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <mistake.IconComponent className={`w-6 h-6 ${selectedMistake === mistake.id ? 'text-brand' : 'text-gray-500'}`} />
                    <span className={`font-medium ${selectedMistake === mistake.id ? 'text-brand' : 'text-gray-700'}`}>
                      {mistake.label}
                    </span>
                    {selectedMistake === mistake.id && (
                      <FaCheckCircle className="text-brand ml-auto" />
                    )}
                  </span>
                </button>
              ))}
            </div>
            
            {selectedMistake && (
              <div className="mt-4 bg-brand-soft rounded-xl p-4 border border-brand-line">
                <p className="text-brand text-sm flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-brand flex-shrink-0" />
                  <span>Great choice! Focus on <strong>one thing at a time</strong>. Once you master it, move to the next. Small steps lead to big changes!</span>
                </p>
              </div>
            )}
          </div>

          {/* Module Completion */}
          <div className="mt-12 rounded-2xl p-8 text-white relative overflow-hidden bg-brand-fill">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrophy className="text-4xl text-yellow-300" />
              </div>
              <h3 className="font-semibold text-2xl mb-2 flex items-center justify-center gap-2 tracking-[-0.015em]">
                <CelebrationIcon className="w-7 h-7 text-yellow-300" />
                Congratulations!
              </h3>
              <p className="text-white/85 mb-4">
                You've completed the <strong className="text-white">"Personal Finance – Zero to Confident"</strong> module!
              </p>
              <div className="bg-white/10 rounded-xl p-4 max-w-md mx-auto">
                <p className="text-sm text-white/85">
                  You now understand: budgeting, savings, banking, credit, insurance, taxes, and common mistakes to avoid. <strong className="text-white">Apply what you've learned!</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Key Takeaway */}
          <div className="mt-8 rounded-2xl p-6 text-white relative overflow-hidden bg-brand-fill">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="font-semibold text-lg mb-2 relative z-10 flex items-center gap-2">
              <BoltIcon className="w-5 h-5" />
              Final Takeaway
            </h3>
            <p className="text-white/85 leading-relaxed relative z-10">
              Money mistakes are normal — what matters is <strong className="text-white">learning and improving</strong>. Budget your income, save before spending, avoid unnecessary debt, and always research before investing. Start small, stay consistent, and your financial confidence will grow!
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-200">
            <button 
              onClick={() => navigate('/learn/personal-finance-lesson-8')}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-brand transition-colors group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Lesson 8: Taxes</span>
            </button>
            <button 
              onClick={() => navigate('/learn')}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-brand/25 transition-all bg-brand-fill"
            >
              <FaTrophy className="text-yellow-300" />
              <span>Back to Learn</span>
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PersonalFinanceLesson9;
