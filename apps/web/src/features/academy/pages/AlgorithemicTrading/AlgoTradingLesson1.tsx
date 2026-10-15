import React, { useState } from "react";
import StudyShell from "../../components/StudyShell";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import ModuleBadge from "../../components/ModuleBadge";

// Premium SVG Icons
const Icons = {
  // Foundation Icon
  Foundation: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 21V11L12 4L19 11V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="9" y="14" width="6" height="7" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="2"/>
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

  // CheckCircle Icon
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Lightbulb Icon
  Lightbulb: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 21H15M12 3C8.68629 3 6 5.68629 6 9C6 11.2208 7.2066 13.1599 9 14.1973V17C9 17.5523 9.44772 18 10 18H14C14.5523 18 15 17.5523 15 17V14.1973C16.7934 13.1599 18 11.2208 18 9C18 5.68629 15.3137 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // History/Clock Icon
  History: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 12H5M19 12H21M12 3V5M12 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Code/Algorithm Icon
  Code: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 18L22 12L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Warning Icon
  Warning: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 9V13M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.64 1.55 19C1.55 19.36 1.64 19.7 1.82 20C2 20.3 2.26 20.56 2.56 20.73C2.86 20.91 3.21 21 3.56 21H20.44C20.79 21 21.14 20.91 21.44 20.73C21.74 20.56 22 20.3 22.18 20C22.36 19.7 22.45 19.36 22.45 19C22.45 18.64 22.36 18.3 22.18 18L13.71 3.86C13.53 3.56 13.27 3.32 12.97 3.15C12.67 2.98 12.34 2.89 12 2.89C11.66 2.89 11.33 2.98 11.03 3.15C10.73 3.32 10.47 3.56 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Building/Institution Icon
  Building: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 9H8.01M12 9H12.01M16 9H16.01M8 13H8.01M12 13H12.01M16 13H16.01M8 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Brain/Mind Icon
  Brain: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4.5C10.5 4.5 9.5 5.5 9.5 7C9.5 7 8 7 7 8C6 9 6 10.5 6 10.5C6 10.5 5 11 5 12.5C5 14 6 15 6 15C6 15 5.5 16 6 17C6.5 18 8 18.5 8 18.5C8 18.5 8 20 10 20.5C11 20.75 12 20.5 12 20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 4.5C13.5 4.5 14.5 5.5 14.5 7C14.5 7 16 7 17 8C18 9 18 10.5 18 10.5C18 10.5 19 11 19 12.5C19 14 18 15 18 15C18 15 18.5 16 18 17C17.5 18 16 18.5 16 18.5C16 18.5 16 20 14 20.5C13 20.75 12 20.5 12 20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 4.5V20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Key Icon
  Key: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="15" r="5" stroke="currentColor" strokeWidth="2"/>
      <path d="M11.5 11.5L21 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 5L21 2L21 5L18 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Chart Icon
  Chart: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 17L10 13L14 15L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="17" cy="9" r="2" fill="currentColor"/>
    </svg>
  ),

  // Rocket Icon
  Rocket: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 16.5C3 18 3 21 3 21C3 21 6 21 7.5 19.5C8.32 18.68 8.32 17.32 7.5 16.5C6.68 15.68 5.32 15.68 4.5 16.5Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M9.5 10L14 5.5C16.5 3 22 2 22 2C22 2 21 7.5 18.5 10L14 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 10C14 10 13 6 9.5 10C6 14 10 15 10 15C10 15 14 14 14 10Z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Speed Icon
  Speed: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Scale/Balance Icon
  Scale: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 7L12 5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 11L5 17H9L7 11H3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 11L15 17H19L21 11H17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

// Quiz Component
const QuizQuestion = ({ question, options, correctAnswer, explanation, onAnswer }: { id: string; question: string; options: string[]; correctAnswer: string; explanation: string; onAnswer?: (correct: boolean) => void }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerClick = (option, index) => {
    if (showResult) return;
    const letter = String.fromCharCode(65 + index);
    setSelectedAnswer(letter);
    setShowResult(true);
    if (onAnswer) onAnswer(letter === correctAnswer);
  };

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <div className="bg-white  rounded-2xl p-6 shadow-lg border border-gray-100  mb-6">
      <h4 className="text-lg font-semibold text-gray-900  mb-4">{question}</h4>
      <div className="space-y-3">
        {options.map((option, index) => {
          const letter = String.fromCharCode(65 + index);
          const isSelected = selectedAnswer === letter;
          const isCorrectOption = correctAnswer === letter;
          
          let bgColor = "bg-gray-50  hover:bg-indigo-50 ";
          let borderColor = "border-gray-200 ";
          
          if (showResult) {
            if (isCorrectOption) {
              bgColor = "bg-brand-soft ";
              borderColor = "border-brand ";
            } else if (isSelected && !isCorrectOption) {
              bgColor = "bg-red-50 ";
              borderColor = "border-red-400 ";
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswerClick(option, index)}
              disabled={showResult}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${borderColor} ${bgColor} ${!showResult ? 'cursor-pointer hover:scale-[1.01]' : 'cursor-default'}`}
            >
              <span className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  showResult && isCorrectOption 
                    ? 'bg-brand-fill text-white' 
                    : showResult && isSelected 
                      ? 'bg-red-500 text-white' 
                      : 'bg-indigo-100  text-indigo-600 '
                }`}>
                  {letter}
                </span>
                <span className="text-gray-700 ">{option}</span>
                {showResult && isCorrectOption && <FaCheckCircle className="ml-auto text-brand" />}
                {showResult && isSelected && !isCorrectOption && <FaTimesCircle className="ml-auto text-red-500" />}
              </span>
            </button>
          );
        })}
      </div>
      {showResult && (
        <div className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-brand-soft  text-brand ' : 'bg-amber-100  text-amber-800 '}`}>
          <p className="font-medium flex items-center gap-2">
            {isCorrect ? (
              <>
                <FaCheckCircle className="text-brand " />
                <span>Excellent! You got it right!</span>
              </>
            ) : (
              <>
                <FaTimesCircle className="text-amber-600 " />
                <span>Not quite. Let's learn from this.</span>
              </>
            )}
          </p>
          <p className="text-sm mt-2 opacity-90">{explanation}</p>
        </div>
      )}
    </div>
  );
};

const AlgoTradingLesson1 = () => {
  const navigate = useNavigate();

  return (
    <StudyShell module="AlgorithemicTrading" lessonNumber={1}>

      <div>
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb */}
          <button 
            onClick={() => navigate('/learn/algorithmic-trading')}
            className="flex items-center gap-2 text-gray-500  hover:text-indigo-600  transition-colors mb-8 group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span>Back to Algorithmic Trading</span>
          </button>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <ModuleBadge moduleId="algorithmic-trading" />
              <span className="px-4 py-1.5 text-white rounded-full text-sm font-bold bg-brand-fill">
                Lesson 1 of 9
              </span>
              <span className="px-3 py-1.5 bg-gray-100  text-gray-600  rounded-full text-sm flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                15 min read
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 flex items-center gap-4 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg bg-brand-fill">
                <Icons.Foundation className="w-8 h-8 text-white" />
              </span>
              <span>Foundations of Algorithmic Trading</span>
            </h1>
            <p className="text-xl text-gray-600 ">
              Understand what algorithmic trading truly is, how it evolved, and why it dominates modern markets.
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50   rounded-2xl p-6 mb-10 border border-indigo-200  shadow-md">
            <h2 className="font-semibold text-indigo-800  mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg shadow-sm">
                <Icons.Target className="w-5 h-5 text-white" />
              </span>
              <span>What You'll Learn</span>
            </h2>
            <ul className="space-y-3">
              {[
                "Define algorithmic trading and distinguish it from manual trading",
                "Trace the historical evolution from floor trading to electronic markets",
                "Understand why institutions adopted systematic approaches",
                "Recognize the different categories of algorithmic strategies",
                "Identify common misconceptions about algo trading"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-indigo-700 ">
                  <span className="text-indigo-500 mt-0.5 flex-shrink-0">
                    <Icons.CheckCircle className="w-5 h-5" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none ">
            
            {/* Opening Hook */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50   rounded-2xl p-6 mb-10 border border-amber-200 ">
              <h3 className="font-semibold text-amber-900  mb-3 flex items-center gap-3 text-lg">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-amber-500 rounded-xl shadow-sm">
                  <Icons.Lightbulb className="w-5 h-5 text-white" />
                </span>
                <span>The Question That Changes Everything</span>
              </h3>
              <p className="text-amber-800  leading-relaxed">
                What if you could remove every emotional bias from your trading decisions? What if you could test 
                your ideas against decades of data before risking a single rupee? What if your strategies could 
                execute with perfect discipline, 24/7, without fatigue or hesitation?
              </p>
              <p className="text-amber-800  leading-relaxed mt-3 font-medium">
                This is the promise of algorithmic trading. But like all powerful tools, understanding its 
                true nature is essential before wielding it.
              </p>
            </div>

            {/* Section 1: Definition */}
            <h2 className="text-2xl font-bold text-gray-900  mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100  rounded-xl">
                <Icons.Code className="w-5 h-5 text-indigo-600 " />
              </span>
              What is Algorithmic Trading?
            </h2>
            
            <p className="text-gray-600  leading-relaxed mb-6">
              At its core, <strong className="text-gray-900 ">algorithmic trading</strong> is 
              simply trading based on pre-defined rules. Instead of making decisions in real-time based on 
              intuition or analysis, you define your decision criteria in advance and let a system execute them.
            </p>

            <div className="bg-gradient-to-br from-indigo-50 to-violet-50   rounded-2xl p-6 mb-8 border border-indigo-200 ">
              <p className="text-indigo-900  text-lg font-medium text-center">
                "An algorithm is nothing more than a precise set of instructions. Algorithmic trading is 
                executing those instructions systematically in financial markets."
              </p>
            </div>

            <p className="text-gray-600  leading-relaxed mb-6">
              The "algorithm" doesn't have to be complex. Consider this simple rule: 
              <em className="text-indigo-600 "> "Buy when the 50-day moving average crosses above 
              the 200-day moving average. Sell when it crosses below."</em> That's an algorithm. The computer 
              simply ensures this rule is followed exactly, every time, without exception.
            </p>

            {/* Visual: Manual vs Algorithmic */}
            <div className="rounded-2xl p-6 mb-10 border border-indigo-800/50 shadow-xl bg-brand-fill">
              <svg className="w-full max-w-2xl mx-auto" viewBox="0 0 600 320" fill="none">
                <defs>
                  <linearGradient id="manualGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#B8923F"/>
                    <stop offset="100%" stopColor="#9A7634"/>
                  </linearGradient>
                  <linearGradient id="algoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8F6FC4"/>
                    <stop offset="100%" stopColor="#8F6FC4"/>
                  </linearGradient>
                </defs>

                {/* Title */}
                <text x="300" y="28" textAnchor="middle" fill="#ECE4F6" fontSize="16" fontWeight="700">
                  MANUAL TRADING vs ALGORITHMIC TRADING
                </text>

                {/* Manual Trading Side */}
                <g transform="translate(30, 55)">
                  <rect x="0" y="0" width="240" height="240" rx="16" fill="#2A2A2C" stroke="#B8923F" strokeWidth="2"/>
                  <text x="120" y="30" textAnchor="middle" fill="#E2C273" fontSize="13" fontWeight="700">MANUAL TRADING</text>
                  
                  {/* Process Flow */}
                  <rect x="30" y="50" width="180" height="35" rx="8" fill="#1F1F1F" stroke="#555A63" strokeWidth="1"/>
                  <text x="120" y="72" textAnchor="middle" fill="#A0A3AA" fontSize="10">See Market Data</text>
                  
                  <path d="M120 90 L120 105" stroke="#B8923F" strokeWidth="2"/>
                  <polygon points="115,102 120,112 125,102" fill="#B8923F"/>
                  
                  <rect x="30" y="115" width="180" height="35" rx="8" fill="#2E2110" stroke="#B8923F" strokeWidth="1"/>
                  <text x="120" y="137" textAnchor="middle" fill="#E2C273" fontSize="10" fontWeight="600">Think + Feel + Decide</text>
                  
                  <path d="M120 155 L120 170" stroke="#B8923F" strokeWidth="2"/>
                  <polygon points="115,167 120,177 125,167" fill="#B8923F"/>
                  
                  <rect x="30" y="180" width="180" height="35" rx="8" fill="#1F1F1F" stroke="#555A63" strokeWidth="1"/>
                  <text x="120" y="202" textAnchor="middle" fill="#A0A3AA" fontSize="10">Execute Trade</text>
                  
                  <text x="120" y="235" textAnchor="middle" fill="#9A7634" fontSize="9" fontStyle="italic">Variable • Emotional • Subjective</text>
                </g>

                {/* VS Circle */}
                <circle cx="300" cy="175" r="25" fill="#2A2A2C" stroke="#555A63" strokeWidth="2"/>
                <text x="300" y="180" textAnchor="middle" fill="#A0A3AA" fontSize="12" fontWeight="700">VS</text>

                {/* Algorithmic Trading Side */}
                <g transform="translate(330, 55)">
                  <rect x="0" y="0" width="240" height="240" rx="16" fill="#2A2A2C" stroke="#8F6FC4" strokeWidth="2"/>
                  <text x="120" y="30" textAnchor="middle" fill="#C0A9E2" fontSize="13" fontWeight="700">ALGORITHMIC TRADING</text>
                  
                  {/* Process Flow */}
                  <rect x="30" y="50" width="180" height="35" rx="8" fill="#1F1F1F" stroke="#555A63" strokeWidth="1"/>
                  <text x="120" y="72" textAnchor="middle" fill="#A0A3AA" fontSize="10">Receive Market Data</text>
                  
                  <path d="M120 90 L120 105" stroke="#8F6FC4" strokeWidth="2"/>
                  <polygon points="115,102 120,112 125,102" fill="#8F6FC4"/>
                  
                  <rect x="30" y="115" width="180" height="35" rx="8" fill="#2A1F3A" stroke="#8F6FC4" strokeWidth="1"/>
                  <text x="120" y="137" textAnchor="middle" fill="#C0A9E2" fontSize="10" fontWeight="600">Check Pre-Defined Rules</text>
                  
                  <path d="M120 155 L120 170" stroke="#8F6FC4" strokeWidth="2"/>
                  <polygon points="115,167 120,177 125,167" fill="#8F6FC4"/>
                  
                  <rect x="30" y="180" width="180" height="35" rx="8" fill="#1F1F1F" stroke="#555A63" strokeWidth="1"/>
                  <text x="120" y="202" textAnchor="middle" fill="#A0A3AA" fontSize="10">Execute Automatically</text>
                  
                  <text x="120" y="235" textAnchor="middle" fill="#A88BD9" fontSize="9" fontStyle="italic">Consistent • Disciplined • Objective</text>
                </g>
              </svg>
            </div>

            {/* Section 2: History */}
            <h2 className="text-2xl font-bold text-gray-900  mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100  rounded-xl">
                <Icons.History className="w-5 h-5 text-indigo-600 " />
              </span>
              The Evolution: From Pit to Pixel
            </h2>

            <p className="text-gray-600  leading-relaxed mb-6">
              Understanding where algo trading came from helps us understand where it's going. The transformation 
              happened faster than most realize.
            </p>

            {/* Timeline Visual */}
            <div className="rounded-2xl p-6 mb-10 border border-indigo-800/50 shadow-xl bg-brand-fill">
              <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 280" fill="none">
                {/* Title */}
                <text x="350" y="25" textAnchor="middle" fill="#ECE4F6" fontSize="14" fontWeight="700">
                  THE EVOLUTION OF TRADING
                </text>

                {/* Timeline Line */}
                <path d="M50 140 L650 140" stroke="#555A63" strokeWidth="3" strokeLinecap="round"/>

                {/* Era 1: Floor Trading */}
                <g transform="translate(50, 60)">
                  <circle cx="0" cy="80" r="12" fill="#B8923F" stroke="#E2C273" strokeWidth="2"/>
                  <rect x="-60" y="0" width="120" height="55" rx="8" fill="#2A2A2C" stroke="#B8923F" strokeWidth="1"/>
                  <text x="0" y="20" textAnchor="middle" fill="#E2C273" fontSize="11" fontWeight="600">Floor Trading</text>
                  <text x="0" y="35" textAnchor="middle" fill="#A0A3AA" fontSize="8">1900s - 1970s</text>
                  <text x="0" y="48" textAnchor="middle" fill="#717680" fontSize="7">Open outcry, hand signals</text>
                  <path d="M0 55 L0 68" stroke="#B8923F" strokeWidth="1.5"/>
                </g>

                {/* Era 2: Electronic Trading */}
                <g transform="translate(200, 60)">
                  <circle cx="0" cy="80" r="12" fill="#16A34A" stroke="#16A34A" strokeWidth="2"/>
                  <rect x="-70" y="0" width="140" height="55" rx="8" fill="#2A2A2C" stroke="#16A34A" strokeWidth="1"/>
                  <text x="0" y="20" textAnchor="middle" fill="#16A34A" fontSize="11" fontWeight="600">Electronic Markets</text>
                  <text x="0" y="35" textAnchor="middle" fill="#A0A3AA" fontSize="8">1980s - 1990s</text>
                  <text x="0" y="48" textAnchor="middle" fill="#717680" fontSize="7">NASDAQ, screen-based</text>
                  <path d="M0 55 L0 68" stroke="#16A34A" strokeWidth="1.5"/>
                </g>

                {/* Era 3: Early Algos */}
                <g transform="translate(380, 60)">
                  <circle cx="0" cy="80" r="12" fill="#8F6FC4" stroke="#C0A9E2" strokeWidth="2"/>
                  <rect x="-70" y="0" width="140" height="55" rx="8" fill="#2A2A2C" stroke="#8F6FC4" strokeWidth="1"/>
                  <text x="0" y="20" textAnchor="middle" fill="#C0A9E2" fontSize="11" fontWeight="600">Algorithmic Era</text>
                  <text x="0" y="35" textAnchor="middle" fill="#A0A3AA" fontSize="8">2000s - 2010s</text>
                  <text x="0" y="48" textAnchor="middle" fill="#717680" fontSize="7">HFT, smart order routing</text>
                  <path d="M0 55 L0 68" stroke="#8F6FC4" strokeWidth="1.5"/>
                </g>

                {/* Era 4: Modern */}
                <g transform="translate(560, 60)">
                  <circle cx="0" cy="80" r="12" fill="#8F6FC4" stroke="#C0A9E2" strokeWidth="2"/>
                  <rect x="-70" y="0" width="140" height="55" rx="8" fill="#2A2A2C" stroke="#8F6FC4" strokeWidth="1"/>
                  <text x="0" y="20" textAnchor="middle" fill="#C0A9E2" fontSize="11" fontWeight="600">AI & Democratization</text>
                  <text x="0" y="35" textAnchor="middle" fill="#A0A3AA" fontSize="8">2020s+</text>
                  <text x="0" y="48" textAnchor="middle" fill="#717680" fontSize="7">ML models, retail access</text>
                  <path d="M0 55 L0 68" stroke="#8F6FC4" strokeWidth="1.5"/>
                </g>

                {/* Bottom Stats */}
                <g transform="translate(50, 175)">
                  <rect x="0" y="0" width="600" height="80" rx="12" fill="#1F1F1F" stroke="#373A41" strokeWidth="1"/>
                  <text x="300" y="25" textAnchor="middle" fill="#A0A3AA" fontSize="11" fontWeight="600">MARKET TRANSFORMATION</text>
                  
                  <text x="100" y="55" textAnchor="middle" fill="#8F6FC4" fontSize="22" fontWeight="700">70%+</text>
                  <text x="100" y="70" textAnchor="middle" fill="#717680" fontSize="8">US equity volume from algos</text>
                  
                  <text x="300" y="55" textAnchor="middle" fill="#16A34A" fontSize="22" fontWeight="700">50%+</text>
                  <text x="300" y="70" textAnchor="middle" fill="#717680" fontSize="8">Indian market algo share</text>
                  
                  <text x="500" y="55" textAnchor="middle" fill="#8F6FC4" fontSize="22" fontWeight="700">&lt;1ms</text>
                  <text x="500" y="70" textAnchor="middle" fill="#717680" fontSize="8">Modern execution speed</text>
                </g>
              </svg>
            </div>

            {/* Section 3: Why Institutions Use Algos */}
            <h2 className="text-2xl font-bold text-gray-900  mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100  rounded-xl">
                <Icons.Building className="w-5 h-5 text-indigo-600 " />
              </span>
              Why Institutions Went Algorithmic
            </h2>

            <p className="text-gray-600  leading-relaxed mb-6">
              Large institutions didn't adopt algorithmic trading because it was "cool" — they did it because 
              they had problems that only systematic approaches could solve.
            </p>

            {/* Key Reasons Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {[
                {
                  icon: Icons.Speed,
                  title: "Speed & Scale",
                  description: "Execute thousands of decisions per second across multiple markets. Monitor more opportunities than any human team could handle.",
                  color: "blue"
                },
                {
                  icon: Icons.Brain,
                  title: "Removing Emotion",
                  description: "Fear and greed cost institutions billions. Algorithms don't panic in crashes or get greedy in rallies. They follow rules.",
                  color: "violet"
                },
                {
                  icon: Icons.Chart,
                  title: "Testable Ideas",
                  description: "Before risking capital, run strategies against 20 years of historical data. Know your edge before you trade.",
                  color: "emerald"
                },
                {
                  icon: Icons.Scale,
                  title: "Consistency",
                  description: "The same rules applied the same way, every time. No interpretation, no shortcuts, no \"I had a bad feeling.\"",
                  color: "amber"
                }
              ].map((item, index) => {
                const colorClasses = {
                  blue: "from-blue-50 to-indigo-50   border-blue-200 ",
                  violet: "from-violet-50 to-purple-50   border-violet-200 ",
                  emerald: "border-brand-line bg-brand-soft",
                  amber: "from-amber-50 to-orange-50   border-amber-200 "
                };
                const iconColors = {
                  blue: "bg-blue-600",
                  violet: "bg-violet-600",
                  emerald: "bg-brand-fill",
                  amber: "bg-amber-600"
                };
                const IconComponent = item.icon;
                return (
                  <div key={index} className={`bg-gradient-to-br ${colorClasses[item.color]} rounded-xl p-5 border`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex items-center justify-center w-10 h-10 ${iconColors[item.color]} rounded-lg shadow-sm`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </span>
                      <h4 className="font-bold text-gray-900 ">{item.title}</h4>
                    </div>
                    <p className="text-gray-600  text-sm">{item.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Section 4: Types of Strategies */}
            <h2 className="text-2xl font-bold text-gray-900  mb-4 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100  rounded-xl">
                <Icons.Chart className="w-5 h-5 text-indigo-600 " />
              </span>
              Categories of Algorithmic Strategies
            </h2>

            <p className="text-gray-600  leading-relaxed mb-6">
              Not all algorithms are the same. Different strategies serve different purposes and operate on 
              different timescales. Here's how professionals categorize them:
            </p>

            {/* Strategy Categories Visual */}
            <div className="rounded-2xl p-6 mb-10 border border-indigo-800/50 shadow-xl bg-brand-fill">
              <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 400" fill="none">
                <text x="350" y="28" textAnchor="middle" fill="#ECE4F6" fontSize="15" fontWeight="700">
                  ALGORITHMIC STRATEGY SPECTRUM
                </text>

                {/* Time Axis */}
                <path d="M50 350 L650 350" stroke="#555A63" strokeWidth="2"/>
                <text x="50" y="375" fill="#717680" fontSize="10">Milliseconds</text>
                <text x="350" y="375" textAnchor="middle" fill="#717680" fontSize="10">Days/Weeks</text>
                <text x="650" y="375" textAnchor="end" fill="#717680" fontSize="10">Months/Years</text>
                <text x="350" y="390" textAnchor="middle" fill="#A0A3AA" fontSize="11" fontWeight="500">← Holding Period →</text>

                {/* Strategy 1: HFT */}
                <g transform="translate(70, 60)">
                  <rect x="0" y="0" width="150" height="120" rx="12" fill="#2A2A2C" stroke="#E04848" strokeWidth="2"/>
                  <text x="75" y="25" textAnchor="middle" fill="#F09B9B" fontSize="12" fontWeight="700">High-Frequency</text>
                  <text x="75" y="42" textAnchor="middle" fill="#F26B6B" fontSize="10">Trading (HFT)</text>
                  <text x="75" y="65" textAnchor="middle" fill="#A0A3AA" fontSize="9">• Market making</text>
                  <text x="75" y="80" textAnchor="middle" fill="#A0A3AA" fontSize="9">• Arbitrage</text>
                  <text x="75" y="95" textAnchor="middle" fill="#A0A3AA" fontSize="9">• Microsecond execution</text>
                  <rect x="10" y="105" width="130" height="10" rx="3" fill="#6B2023"/>
                  <text x="75" y="113" textAnchor="middle" fill="#F09B9B" fontSize="7">Ultra-short term</text>
                  <path d="M75 130 L75 218" stroke="#E04848" strokeWidth="1.5" strokeDasharray="4,2"/>
                </g>

                {/* Strategy 2: Statistical Arbitrage */}
                <g transform="translate(240, 60)">
                  <rect x="0" y="0" width="150" height="120" rx="12" fill="#2A2A2C" stroke="#B8923F" strokeWidth="2"/>
                  <text x="75" y="25" textAnchor="middle" fill="#E2C273" fontSize="12" fontWeight="700">Statistical</text>
                  <text x="75" y="42" textAnchor="middle" fill="#B8923F" fontSize="10">Arbitrage</text>
                  <text x="75" y="65" textAnchor="middle" fill="#A0A3AA" fontSize="9">• Pairs trading</text>
                  <text x="75" y="80" textAnchor="middle" fill="#A0A3AA" fontSize="9">• Mean reversion</text>
                  <text x="75" y="95" textAnchor="middle" fill="#A0A3AA" fontSize="9">• Relative value</text>
                  <rect x="10" y="105" width="130" height="10" rx="3" fill="#533E22"/>
                  <text x="75" y="113" textAnchor="middle" fill="#E2C273" fontSize="7">Hours to days</text>
                  <path d="M75 130 L75 218" stroke="#B8923F" strokeWidth="1.5" strokeDasharray="4,2"/>
                </g>

                {/* Strategy 3: Momentum/Trend */}
                <g transform="translate(410, 60)">
                  <rect x="0" y="0" width="150" height="120" rx="12" fill="#2A2A2C" stroke="#16A34A" strokeWidth="2"/>
                  <text x="75" y="25" textAnchor="middle" fill="#16A34A" fontSize="12" fontWeight="700">Trend Following</text>
                  <text x="75" y="42" textAnchor="middle" fill="#16A34A" fontSize="10">& Momentum</text>
                  <text x="75" y="65" textAnchor="middle" fill="#A0A3AA" fontSize="9">• Moving averages</text>
                  <text x="75" y="80" textAnchor="middle" fill="#A0A3AA" fontSize="9">• Breakout systems</text>
                  <text x="75" y="95" textAnchor="middle" fill="#A0A3AA" fontSize="9">• Managed futures</text>
                  <rect x="10" y="105" width="130" height="10" rx="3" fill="#16A34A"/>
                  <text x="75" y="113" textAnchor="middle" fill="#16A34A" fontSize="7">Days to months</text>
                  <path d="M75 130 L75 218" stroke="#16A34A" strokeWidth="1.5" strokeDasharray="4,2"/>
                </g>

                {/* Strategy 4: Factor/Quant */}
                <g transform="translate(560, 60)">
                  <rect x="0" y="0" width="130" height="120" rx="12" fill="#2A2A2C" stroke="#8F6FC4" strokeWidth="2"/>
                  <text x="65" y="25" textAnchor="middle" fill="#C0A9E2" fontSize="12" fontWeight="700">Factor</text>
                  <text x="65" y="42" textAnchor="middle" fill="#8F6FC4" fontSize="10">Investing</text>
                  <text x="65" y="65" textAnchor="middle" fill="#A0A3AA" fontSize="9">• Value factors</text>
                  <text x="65" y="80" textAnchor="middle" fill="#A0A3AA" fontSize="9">• Quality screens</text>
                  <text x="65" y="95" textAnchor="middle" fill="#A0A3AA" fontSize="9">• Smart beta</text>
                  <rect x="10" y="105" width="110" height="10" rx="3" fill="#46365D"/>
                  <text x="65" y="113" textAnchor="middle" fill="#C0A9E2" fontSize="7">Months to years</text>
                  <path d="M65 130 L65 218" stroke="#8F6FC4" strokeWidth="1.5" strokeDasharray="4,2"/>
                </g>

                {/* Execution Layer */}
                <g transform="translate(50, 220)">
                  <rect x="0" y="0" width="600" height="100" rx="12" fill="#1F1F1F" stroke="#373A41" strokeWidth="1"/>
                  <text x="300" y="25" textAnchor="middle" fill="#A0A3AA" fontSize="11" fontWeight="600">EXECUTION ALGORITHMS (Used by all strategy types)</text>
                  
                  <rect x="20" y="40" width="130" height="45" rx="8" fill="#2A2A2C" stroke="#555A63" strokeWidth="1"/>
                  <text x="85" y="60" textAnchor="middle" fill="#E4E4EA" fontSize="10" fontWeight="500">TWAP</text>
                  <text x="85" y="75" textAnchor="middle" fill="#717680" fontSize="8">Time-weighted avg</text>

                  <rect x="165" y="40" width="130" height="45" rx="8" fill="#2A2A2C" stroke="#555A63" strokeWidth="1"/>
                  <text x="230" y="60" textAnchor="middle" fill="#E4E4EA" fontSize="10" fontWeight="500">VWAP</text>
                  <text x="230" y="75" textAnchor="middle" fill="#717680" fontSize="8">Volume-weighted avg</text>

                  <rect x="310" y="40" width="130" height="45" rx="8" fill="#2A2A2C" stroke="#555A63" strokeWidth="1"/>
                  <text x="375" y="60" textAnchor="middle" fill="#E4E4EA" fontSize="10" fontWeight="500">Implementation</text>
                  <text x="375" y="75" textAnchor="middle" fill="#717680" fontSize="8">Shortfall minimizing</text>

                  <rect x="455" y="40" width="130" height="45" rx="8" fill="#2A2A2C" stroke="#555A63" strokeWidth="1"/>
                  <text x="520" y="60" textAnchor="middle" fill="#E4E4EA" fontSize="10" fontWeight="500">Smart Order</text>
                  <text x="520" y="75" textAnchor="middle" fill="#717680" fontSize="8">Routing (SOR)</text>
                </g>
              </svg>
            </div>

            {/* Section 5: Common Misconceptions */}
            <h2 className="text-2xl font-bold text-gray-900  mb-4 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-rose-100  rounded-xl">
                <Icons.Warning className="w-5 h-5 text-rose-600 " />
              </span>
              Dangerous Misconceptions
            </h2>

            <p className="text-gray-600  leading-relaxed mb-6">
              Before you go further, let's correct some common myths that cause beginners to fail:
            </p>

            <div className="space-y-4 mb-10">
              {[
                {
                  myth: "Algorithms guarantee profits",
                  reality: "Algorithms execute rules consistently — but if the rules are bad, you'll lose money consistently. Automation amplifies whatever you program, including mistakes."
                },
                {
                  myth: "More complexity = better results",
                  reality: "Many of the most robust strategies are embarrassingly simple. Complexity often leads to overfitting — a system that worked perfectly on historical data but fails in live markets."
                },
                {
                  myth: "AI/ML will find profitable patterns automatically",
                  reality: "Machine learning is a powerful tool, but it's not magic. Without domain knowledge and proper validation, ML models are prone to finding spurious correlations."
                },
                {
                  myth: "You need to be a programmer to do algo trading",
                  reality: "While coding helps, the real skill is strategic thinking. Many successful quants focus on ideas, not implementation. Platforms exist that require minimal coding."
                }
              ].map((item, index) => (
                <div key={index} className="bg-gradient-to-r from-rose-50 to-red-50   rounded-xl p-5 border border-rose-200 ">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                      <FaTimesCircle className="w-3 h-3 text-white" />
                    </span>
                    <div>
                      <p className="font-semibold text-rose-800  mb-1">Myth: "{item.myth}"</p>
                      <p className="text-rose-700  text-sm">{item.reality}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Key Takeaways */}
            <div className="rounded-2xl p-6 mb-10 border border-brand-line bg-brand-soft">
              <h3 className="font-semibold text-brand  mb-4 flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-brand-fill rounded-lg shadow-sm">
                  <Icons.Key className="w-5 h-5 text-white" />
                </span>
                <span>Key Takeaways</span>
              </h3>
              <ul className="space-y-3">
                {[
                  "Algorithmic trading is rule-based decision making — the rules can be simple or complex",
                  "The shift to electronic markets enabled algorithmic approaches to dominate",
                  "Institutions use algos for speed, scale, consistency, and emotional discipline",
                  "Different strategy types operate on different timescales — from milliseconds to years",
                  "Complexity doesn't equal profitability — many robust systems are surprisingly simple"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-brand ">
                    <span className="text-brand mt-0.5 flex-shrink-0">
                      <Icons.CheckCircle className="w-5 h-5" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quiz Section */}
            <h2 className="text-2xl font-bold text-gray-900  mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100  rounded-xl">
                <Icons.Brain className="w-5 h-5 text-indigo-600 " />
              </span>
              Test Your Understanding
            </h2>

            <QuizQuestion
              id="q1"
              question="What is the core definition of algorithmic trading?"
              options={[
                "Using artificial intelligence to predict stock prices",
                "Trading based on pre-defined rules executed systematically",
                "High-frequency trading that operates in milliseconds",
                "Using complex mathematical models to beat the market"
              ]}
              correctAnswer="B"
              explanation="Algorithmic trading is fundamentally about pre-defined rules. The algorithm doesn't have to be complex, use AI, or operate at high frequency — it simply needs to follow consistent, predetermined logic."
            />

            <QuizQuestion
              id="q2"
              question="Why did institutions primarily adopt algorithmic trading?"
              options={[
                "To replace all human traders with robots",
                "Because regulators required it",
                "To achieve speed, scale, consistency, and emotional discipline",
                "To manipulate markets more easily"
              ]}
              correctAnswer="C"
              explanation="Institutions adopted algos to solve real problems: executing large orders efficiently, removing emotional biases, maintaining discipline, and processing more information than humans could handle."
            />

            <QuizQuestion
              id="q3"
              question="Which statement about algorithmic strategies is TRUE?"
              options={[
                "All algorithmic strategies operate in milliseconds",
                "More complex algorithms always perform better",
                "Different strategies operate on different timescales, from milliseconds to years",
                "Algorithmic strategies can only be used by large institutions"
              ]}
              correctAnswer="C"
              explanation="Algorithmic strategies span a wide spectrum. HFT operates in milliseconds, statistical arbitrage in hours to days, trend-following over weeks to months, and factor investing over months to years."
            />

          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-gray-200 ">
            <button 
              onClick={() => navigate('/learn/algorithmic-trading')}
              className="flex items-center gap-2 text-gray-600  hover:text-indigo-600  transition-colors group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Module Overview</span>
            </button>
            <button 
              onClick={() => navigate('/learn/algo-trading-lesson-2')}
              className="flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all bg-brand-fill"
            >
              <span>Next: Trading System Architecture</span>
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </StudyShell>
  );
};

export default AlgoTradingLesson1;
