import React, { useState } from "react";
import StudyShell from "../../components/StudyShell";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { 
  ShieldIcon, TargetIcon, CheckCircleIcon, BookOpenIcon, 
  BrainIcon, KeyIcon, HeartIcon, HomeIcon, CoinsIcon, LightbulbIcon, CarIcon, BoltIcon, MedicalIcon,
  WarningIcon, ClipboardIcon
} from "../../components/LearningIcons";

const PersonalFinanceLesson7 = () => {
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
    <StudyShell module="PersonalFinance" lessonNumber={7}>

      <div>
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
                Lesson 7 of 9
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
                <ShieldIcon className="w-7 h-7 text-brand" />
              </span>
              <span>Insurance Basics (Protection First)</span>
            </h1>
            <p className="text-lg text-gray-500">
              Learn how insurance protects you from life's unexpected financial shocks.
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
                <span>What insurance is and why it matters</span>
              </li>
              <li className="flex items-start gap-3 text-brand">
                <span className="text-brand mt-0.5 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5" />
                </span>
                <span>The main types of insurance you need</span>
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-[-0.015em]">What is Insurance?</h2>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              <strong className="text-gray-900">Insurance</strong> is a way to protect yourself from big, unexpected expenses. You pay a small amount regularly (called a <strong className="text-brand">premium</strong>), and in return, the insurance company covers large costs when something bad happens.
            </p>

            <div className="bg-brand-soft rounded-xl p-5 mb-6 border border-brand-line">
              <h4 className="font-bold text-brand mb-2 flex items-center gap-2">
                <TargetIcon className="w-5 h-5 text-brand" />
                The Core Idea
              </h4>
              <p className="text-brand">
                Pay a <strong>little now</strong> to avoid paying a <strong>lot later</strong>. Insurance spreads risk — many people pay small premiums, so the company can help those who face emergencies.
              </p>
            </div>

            <div className="bg-amber-50 rounded-xl p-5 mb-8 border border-amber-200">
              <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                <WarningIcon className="w-5 h-5 text-amber-600" />
                Important: Insurance is NOT an Investment!
              </h4>
              <p className="text-amber-700">
                Insurance is for <strong>protection</strong>, not for making money. Don't buy insurance expecting returns — buy it to protect yourself and your family from financial disasters.
              </p>
            </div>

            {/* Key Terms */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-brand-soft rounded-xl p-5 text-center border border-brand-line hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-brand-soft rounded-xl flex items-center justify-center mx-auto mb-2">
                  <CoinsIcon className="w-6 h-6 text-brand" />
                </div>
                <h4 className="font-bold text-brand">Premium</h4>
                <p className="text-sm text-brand mt-1">Amount you pay regularly</p>
              </div>
              <div className="bg-brand-soft rounded-xl p-5 text-center border border-brand-line hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-brand-soft rounded-xl flex items-center justify-center mx-auto mb-2">
                  <ShieldIcon className="w-6 h-6 text-brand" />
                </div>
                <h4 className="font-bold text-brand">Coverage</h4>
                <p className="text-sm text-brand mt-1">Maximum amount insured</p>
              </div>
              <div className="bg-brand-soft rounded-xl p-5 text-center border border-brand-line hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-brand-soft rounded-xl flex items-center justify-center mx-auto mb-2">
                  <ClipboardIcon className="w-6 h-6 text-brand" />
                </div>
                <h4 className="font-bold text-brand">Claim</h4>
                <p className="text-sm text-brand mt-1">Request for payment when needed</p>
              </div>
            </div>

            {/* Types of Insurance */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-[-0.015em]">Types of Insurance</h2>
            
            <div className="space-y-4 mb-8">
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-5 border border-rose-200">
                <div className="flex items-start gap-4">
                  <span className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MedicalIcon className="w-6 h-6 text-rose-600" />
                  </span>
                  <div>
                    <h4 className="font-bold text-rose-900">Health Insurance</h4>
                    <p className="text-rose-700 text-sm mt-1">
                      Covers medical expenses — hospital bills, surgeries, treatments. <strong>Most essential</strong> insurance to have!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
                <div className="flex items-start gap-4">
                  <span className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <HeartIcon className="w-6 h-6 text-blue-600" />
                  </span>
                  <div>
                    <h4 className="font-bold text-blue-900">Life Insurance (Term)</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      Pays your family if something happens to you. <strong>Term insurance</strong> = pure protection at low cost. Best for breadwinners.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-start gap-4">
                  <span className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CarIcon className="w-6 h-6 text-gray-600" />
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-900">Other Types</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Car insurance, home insurance, travel insurance — protect your assets and trips from unexpected events.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SVG Diagram - How Insurance Works */}
            <div className="bg-white rounded-3xl p-8 mb-10 border border-gray-100 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">How Insurance Works</h3>
              <svg className="w-full max-w-xl mx-auto" viewBox="0 0 550 200" fill="none">
                {/* Person */}
                <g transform="translate(30, 50)">
                  <circle cx="35" cy="25" r="22" fill="#A88BD9" stroke="#8F6FC4" strokeWidth="2"/>
                  <text x="35" y="32" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">$</text>
                  <text x="35" y="70" textAnchor="middle" fill="#654B8A" fontSize="11" fontWeight="bold">YOU</text>
                  <text x="35" y="85" textAnchor="middle" fill="#8F6FC4" fontSize="9">Pay Premium</text>
                </g>
                
                {/* Arrow: Premium */}
                <g transform="translate(95, 65)">
                  <path d="M0 15 L50 15" stroke="#16A34A" strokeWidth="3"/>
                  <polygon points="50,15 40,9 40,21" fill="#16A34A"/>
                  <text x="25" y="5" textAnchor="middle" fill="#16A34A" fontSize="10" fontWeight="600">$50/mo</text>
                </g>
                
                {/* Insurance Shield */}
                <g transform="translate(155, 25)">
                  <path d="M50 0 L100 20 L100 70 C100 100 50 120 50 120 C50 120 0 100 0 70 L0 20 Z" fill="#E0E7F1" stroke="#5A77AA" strokeWidth="2"/>
                  <text x="50" y="60" textAnchor="middle" fill="#2C3F5E" fontSize="28" fontWeight="bold">Σ</text>
                  <text x="50" y="80" textAnchor="middle" fill="#2C3F5E" fontSize="10" fontWeight="bold">INSURANCE</text>
                  <text x="50" y="145" textAnchor="middle" fill="#3E5C8A" fontSize="10" fontWeight="600">Coverage: $100,000</text>
                </g>
                
                {/* Risk Cloud */}
                <g transform="translate(280, 20)">
                  <ellipse cx="45" cy="40" rx="45" ry="30" fill="#FBE1E1" stroke="#E04848" strokeWidth="2"/>
                  <text x="45" y="43" textAnchor="middle" fill="#C7363B" fontSize="11" fontWeight="bold">RISK!</text>
                  <text x="45" y="85" textAnchor="middle" fill="#C7363B" fontSize="9">Accident, Illness</text>
                  <text x="45" y="97" textAnchor="middle" fill="#C7363B" fontSize="9">Emergency</text>
                </g>
                
                {/* Arrow: Claim */}
                <g transform="translate(375, 65)">
                  <path d="M0 15 L50 15" stroke="#8F6FC4" strokeWidth="3"/>
                  <polygon points="50,15 40,9 40,21" fill="#8F6FC4"/>
                  <text x="25" y="5" textAnchor="middle" fill="#7A5BA6" fontSize="10" fontWeight="600">CLAIM</text>
                </g>
                
                {/* Protection Result */}
                <g transform="translate(435, 35)">
                  <rect x="0" y="0" width="90" height="80" rx="12" fill="#F0FDF4" stroke="#16A34A" strokeWidth="2"/>
                  <text x="45" y="35" textAnchor="middle" fill="#16A34A" fontSize="24">✔</text>
                  <text x="45" y="55" textAnchor="middle" fill="#16A34A" fontSize="10" fontWeight="bold">PROTECTED</text>
                  <text x="45" y="70" textAnchor="middle" fill="#16A34A" fontSize="9">Bills Covered!</text>
                  <text x="45" y="110" textAnchor="middle" fill="#16A34A" fontSize="11" fontWeight="bold">PEACE OF MIND</text>
                </g>
              </svg>
              <p className="text-center text-gray-500 text-sm mt-6">
                You pay small premiums → Insurance provides coverage → When risk happens → You file a claim → Bills get covered!
              </p>
            </div>

            {/* Real Life Example */}
            <div className="rounded-2xl p-6 mb-10 border border-brand-line relative overflow-hidden bg-brand-soft">
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-soft rounded-full"></div>
              <h3 className="font-semibold text-brand mb-4 flex items-center gap-2 relative z-10">
                <span className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
                  <MedicalIcon className="w-5 h-5 text-brand" />
                </span>
                Real Example: Medical Emergency
              </h3>
              <p className="text-brand leading-relaxed mb-4 relative z-10">
                Emma needs surgery. The hospital bill is <strong>$20,000</strong>. Let's see the difference insurance makes:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 relative z-10">
                {/* Without Insurance */}
                <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                  <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Without Insurance
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-red-700">Hospital Bill</span>
                      <span className="font-bold text-red-800">$20,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-700">Insurance Pays</span>
                      <span className="font-bold text-red-800">$0</span>
                    </div>
                    <hr className="border-red-200"/>
                    <div className="flex justify-between">
                      <span className="font-bold text-red-700">Emma Pays</span>
                      <span className="font-bold text-red-900 text-xl">$20,000</span>
                    </div>
                  </div>
                  <p className="text-red-600 text-sm mt-3 flex items-center gap-1">
                    <WarningIcon className="w-4 h-4 text-red-500" />
                    Financial disaster!
                  </p>
                </div>
                
                {/* With Insurance */}
                <div className="bg-brand-soft rounded-xl p-5 border border-brand-line">
                  <h4 className="font-bold text-brand mb-3 flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-brand" />
                    With Insurance
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand">Hospital Bill</span>
                      <span className="font-bold text-brand">$20,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand">Insurance Pays</span>
                      <span className="font-bold text-brand">$18,500</span>
                    </div>
                    <hr className="border-brand-line"/>
                    <div className="flex justify-between">
                      <span className="font-bold text-brand">Emma Pays</span>
                      <span className="font-bold text-brand text-xl">$1,500</span>
                    </div>
                  </div>
                  <p className="text-brand text-sm mt-3 flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4 text-brand" />
                    Manageable expense!
                  </p>
                </div>
              </div>
              
              <div className="mt-4 bg-brand-soft rounded-xl p-4 relative z-10">
                <p className="text-brand text-sm flex items-center gap-2">
                  <LightbulbIcon className="w-4 h-4 text-brand flex-shrink-0" />
                  <span>Emma paid <strong>$600/year</strong> in premiums. When she needed it, insurance saved her <strong>$18,500</strong>. That's the power of protection!</span>
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
                    <MedicalIcon className="w-4 h-4 text-orange-600" />
                    Health Insurance
                  </h4>
                  <p className="text-sm text-orange-600">
                    Medical costs in India are rising fast. A basic health cover of ₹5-10 lakhs for your family is essential. Many employers provide group health insurance — check if you have it!
                  </p>
                </div>
                
                <div className="bg-white/70 rounded-xl p-4 border border-orange-100">
                  <h4 className="font-bold text-orange-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                      <path d="M3 21V19C3 16.7909 4.79086 15 7 15H11C13.2091 15 15 16.7909 15 19V21" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="17" cy="9" r="3" stroke="currentColor" strokeWidth="2"/>
                      <path d="M21 21V20C21 18.3431 19.6569 17 18 17H16" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Term Insurance
                  </h4>
                  <p className="text-sm text-orange-600">
                    If your family depends on your income, get a term plan. It's affordable and provides high coverage (e.g., ₹1 crore for ~₹10,000/year for a young person).
                  </p>
                </div>
              </div>
              
              <p className="text-orange-700 text-sm mt-4 italic flex items-center gap-2">
                <LightbulbIcon className="w-4 h-4 text-orange-500" />
                <span>Focus on protection first. Don't mix insurance with investments!</span>
              </p>
            </div>

          </div>

          {/* Quiz Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-brand-fill">
                <BrainIcon className="w-6 h-6 text-white" />
              </span>
              Quick Quiz
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                id="q1"
                question="What is the main purpose of insurance?"
                options={[
                  "To make money from investments",
                  "To protect yourself from large unexpected expenses",
                  "To save on taxes",
                  "To get free medical checkups"
                ]}
                correctAnswer="B"
                explanation="Insurance is for protection, not investment. You pay small premiums to avoid big financial shocks when emergencies happen."
              />

              <QuizQuestion
                id="q2"
                question="What is a 'premium' in insurance?"
                options={[
                  "The amount you receive when you make a claim",
                  "The maximum amount the insurance covers",
                  "The amount you pay regularly to maintain coverage",
                  "A bonus given by the insurance company"
                ]}
                correctAnswer="C"
                explanation="Premium is the regular payment (monthly/yearly) you make to keep your insurance active. It's like a subscription for protection!"
              />
            </div>
          </div>

          {/* Mini Activity */}
          <div className="mt-12 rounded-2xl p-6 border border-brand-line bg-brand-soft">
            <h2 className="text-xl font-semibold text-brand mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
                <ClipboardIcon className="w-5 h-5 text-brand" />
              </span>
              Mini Activity: Your Protection Needs
            </h2>
            <p className="text-brand mb-4">
              List the risks you want protection from. Think about health, income, and assets:
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
                    placeholder={index === 0 ? "e.g., Medical emergencies for family" : index === 1 ? "e.g., Income protection if I can't work" : "e.g., Car accident damage"}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-brand-line focus:border-brand focus:outline-none"
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-4 bg-brand-soft rounded-xl p-4">
              <p className="text-brand text-sm flex items-center gap-2">
                <LightbulbIcon className="w-4 h-4 text-brand flex-shrink-0" />
                <span><strong>Tip:</strong> Start with health insurance — it's the most important. Add term life insurance if others depend on your income.</span>
              </p>
            </div>
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
              Insurance is your financial safety net. Pay small <strong className="text-white">premiums</strong> now to avoid huge bills later. <strong className="text-white">Health insurance</strong> is essential for everyone. <strong className="text-white">Term life insurance</strong> protects your family. Remember: insurance = protection, NOT investment!
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-200">
            <button 
              onClick={() => navigate('/learn/personal-finance-lesson-6')}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-brand transition-colors group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Lesson 6: Credit, Loans & EMIs</span>
            </button>
            <button 
              onClick={() => navigate('/learn/personal-finance-lesson-8')}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-brand/25 transition-all bg-brand-fill"
            >
              <span>Next: Tax Basics</span>
              <FaArrowRight />
            </button>
          </div>

        </div>
      </div>
    </StudyShell>
  );
};

export default PersonalFinanceLesson7;
