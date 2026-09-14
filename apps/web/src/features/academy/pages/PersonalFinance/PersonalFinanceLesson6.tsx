import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { 
  CreditCardIcon, TargetIcon, CheckCircleIcon, BookOpenIcon, 
  BrainIcon, KeyIcon, PercentIcon, WarningIcon, CoinsIcon, LightbulbIcon, BoltIcon,
  ClipboardIcon, BankIcon, ClockIcon, GrowthIcon, CarIcon
} from "../../components/LearningIcons";

const PersonalFinanceLesson6 = () => {
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
              <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-sm font-semibold shadow-sm">
                Lesson 6 of 9
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                8 min read
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-200 rounded-xl shadow-sm">
                <CreditCardIcon className="w-7 h-7 text-emerald-600" />
              </span>
              <span>Credit, Loans & EMIs</span>
            </h1>
            <p className="text-lg text-gray-500">
              Learn how borrowing money works and why managing credit wisely is crucial.
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 mb-10 border border-emerald-200 shadow-sm">
            <h2 className="font-bold text-emerald-900 mb-4 flex items-center gap-3">
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
                <span>What credit, loans, and EMIs mean</span>
              </li>
              <li className="flex items-start gap-3 text-emerald-800">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5" />
                </span>
                <span>Why using credit carefully matters</span>
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Credit?</h2>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              <strong className="text-gray-900">Credit</strong> means borrowing money now and paying it back later. When you use a credit card or take a loan, you're using credit.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-emerald-50 rounded-xl p-5 text-center border border-emerald-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <CreditCardIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="font-bold text-emerald-900">Credit</h4>
                <p className="text-sm text-emerald-700 mt-1">Borrow now, pay later</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-5 text-center border border-emerald-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <BankIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="font-bold text-emerald-900">Loan</h4>
                <p className="text-sm text-emerald-700 mt-1">A lump sum you borrow</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-5 text-center border border-amber-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <ClockIcon className="w-6 h-6 text-amber-600" />
                </div>
                <h4 className="font-bold text-amber-900">EMI</h4>
                <p className="text-sm text-amber-700 mt-1">Fixed monthly payment</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is a Loan?</h2>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              A <strong className="text-gray-900">loan</strong> is when a bank gives you a large amount of money upfront. You agree to pay it back over time, usually with <strong className="text-emerald-600">interest</strong> (the bank's fee for lending you money).
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is EMI?</h2>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              <strong className="text-gray-900">EMI (Equated Monthly Installment)</strong> is a fixed amount you pay every month to repay a loan. It includes part of the loan amount + interest.
            </p>

            <div className="bg-amber-50 rounded-xl p-5 mb-8 border border-amber-200">
              <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                <WarningIcon className="w-5 h-5 text-amber-600" />
                Why Use Credit Carefully?
              </h4>
              <p className="text-amber-700">
                Credit makes buying easy, but you're spending <strong>future money</strong>. If you borrow too much, EMIs can pile up and stress your budget. Always borrow only what you can repay!
              </p>
            </div>

            {/* SVG Diagram - How Loans & EMIs Work */}
            <div className="bg-white rounded-3xl p-8 mb-10 border border-gray-100 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">How Loans & EMIs Work</h3>
              <svg className="w-full max-w-xl mx-auto" viewBox="0 0 550 220" fill="none">
                {/* Bank */}
                <g transform="translate(30, 50)">
                  <rect x="0" y="30" width="90" height="70" rx="8" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2"/>
                  <polygon points="45,5 0,35 90,35" fill="#c7d2fe" stroke="#6366f1" strokeWidth="2"/>
                  <rect x="15" y="50" width="20" height="25" rx="4" fill="#6366f1"/>
                  <rect x="55" y="50" width="20" height="25" rx="4" fill="#6366f1"/>
                  <circle cx="45" cy="20" r="8" fill="#fbbf24"/>
                  <text x="45" y="24" textAnchor="middle" fill="#92400e" fontSize="10" fontWeight="bold">$</text>
                  <text x="45" y="120" textAnchor="middle" fill="#4338ca" fontSize="12" fontWeight="bold">BANK</text>
                </g>
                
                {/* Arrow: Loan */}
                <g transform="translate(130, 80)">
                  <path d="M0 20 L70 20" stroke="#10b981" strokeWidth="3"/>
                  <polygon points="70,20 60,14 60,26" fill="#10b981"/>
                  <text x="35" y="8" textAnchor="middle" fill="#059669" fontSize="11" fontWeight="600">LOAN</text>
                  <text x="35" y="45" textAnchor="middle" fill="#059669" fontSize="10">$10,000</text>
                </g>
                
                {/* Person (You) */}
                <g transform="translate(210, 55)">
                  <circle cx="35" cy="25" r="22" fill="#818cf8" stroke="#6366f1" strokeWidth="2"/>
                  <text x="35" y="32" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">$</text>
                  <text x="35" y="75" textAnchor="middle" fill="#4338ca" fontSize="12" fontWeight="bold">YOU</text>
                </g>
                
                {/* Arrow: EMI payments */}
                <g transform="translate(285, 80)">
                  <path d="M0 20 L70 20" stroke="#f59e0b" strokeWidth="3"/>
                  <polygon points="70,20 60,14 60,26" fill="#f59e0b"/>
                  <text x="35" y="8" textAnchor="middle" fill="#d97706" fontSize="11" fontWeight="600">EMI</text>
                  <text x="35" y="45" textAnchor="middle" fill="#d97706" fontSize="10">$300/month</text>
                </g>
                
                {/* EMI Timeline */}
                <g transform="translate(365, 40)">
                  <rect x="0" y="0" width="150" height="130" rx="12" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
                  <text x="75" y="25" textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="bold">MONTHLY PAYMENTS</text>
                  
                  {/* EMI boxes */}
                  <g transform="translate(15, 40)">
                    <rect x="0" y="0" width="35" height="28" rx="6" fill="#fbbf24"/>
                    <text x="17.5" y="18" textAnchor="middle" fill="#78350f" fontSize="9" fontWeight="bold">$300</text>
                    <text x="17.5" y="38" textAnchor="middle" fill="#92400e" fontSize="8">Mo 1</text>
                  </g>
                  <g transform="translate(58, 40)">
                    <rect x="0" y="0" width="35" height="28" rx="6" fill="#fbbf24"/>
                    <text x="17.5" y="18" textAnchor="middle" fill="#78350f" fontSize="9" fontWeight="bold">$300</text>
                    <text x="17.5" y="38" textAnchor="middle" fill="#92400e" fontSize="8">Mo 2</text>
                  </g>
                  <g transform="translate(101, 40)">
                    <rect x="0" y="0" width="35" height="28" rx="6" fill="#fbbf24"/>
                    <text x="17.5" y="18" textAnchor="middle" fill="#78350f" fontSize="9" fontWeight="bold">$300</text>
                    <text x="17.5" y="38" textAnchor="middle" fill="#92400e" fontSize="8">Mo 3</text>
                  </g>
                  
                  {/* Dots indicating more */}
                  <text x="75" y="100" textAnchor="middle" fill="#92400e" fontSize="14" fontWeight="bold">. . .</text>
                  <text x="75" y="120" textAnchor="middle" fill="#78350f" fontSize="9">until paid off</text>
                </g>
                
                {/* Interest label */}
                <g transform="translate(200, 180)">
                  <rect x="0" y="0" width="150" height="30" rx="8" fill="#fce7f3" stroke="#ec4899" strokeWidth="1.5"/>
                  <text x="75" y="20" textAnchor="middle" fill="#be185d" fontSize="10" fontWeight="600">EMI = Loan Amount + Interest</text>
                </g>
              </svg>
              <p className="text-center text-gray-500 text-sm mt-6">
                You get $10,000 today → Pay back $300 every month → Until the loan + interest is fully repaid
              </p>
            </div>

            {/* Real Life Example */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 mb-10 border border-emerald-200 relative overflow-hidden">
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-200/30 rounded-full"></div>
              <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2 relative z-10">
                <span className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CarIcon className="w-5 h-5 text-emerald-600" />
                </span>
                Real Example: Jake's Car Loan
              </h3>
              <p className="text-emerald-800 leading-relaxed mb-4 relative z-10">
                Jake wants to buy a used car for <strong>$10,000</strong>. He doesn't have that much saved, so he takes a loan from the bank.
              </p>
              
              <div className="space-y-3 relative z-10">
                <div className="bg-white/70 rounded-xl p-4 flex items-center justify-between border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <CoinsIcon className="w-5 h-5 text-emerald-600" />
                    </span>
                    <div>
                      <p className="font-bold text-emerald-900">Loan Amount</p>
                      <p className="text-sm text-emerald-700">What Jake borrowed</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">$10,000</span>
                </div>
                
                <div className="bg-white/70 rounded-xl p-4 flex items-center justify-between border border-amber-200">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-amber-600" />
                    </span>
                    <div>
                      <p className="font-bold text-amber-800">Monthly EMI</p>
                      <p className="text-sm text-amber-600">Fixed payment each month</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-amber-600">$300</span>
                </div>
                
                <div className="bg-white/70 rounded-xl p-4 flex items-center justify-between border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-emerald-600" />
                    </span>
                    <div>
                      <p className="font-bold text-emerald-900">Loan Duration</p>
                      <p className="text-sm text-emerald-700">Time to fully repay</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">~36 months</span>
                </div>
                
                <div className="bg-white/70 rounded-xl p-4 flex items-center justify-between border border-rose-200">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                      <GrowthIcon className="w-5 h-5 text-rose-600" />
                    </span>
                    <div>
                      <p className="font-bold text-rose-800">Total Paid (with interest)</p>
                      <p className="text-sm text-rose-600">$300 × 36 months</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-rose-600">$10,800</span>
                </div>
              </div>
              
              <div className="mt-4 bg-emerald-100 rounded-xl p-4 relative z-10">
                <p className="text-emerald-900 text-sm flex items-center gap-2">
                  <LightbulbIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Jake paid <strong>$800 extra</strong> as interest. That's the cost of borrowing money. The faster you repay, the less interest you pay!</span>
                </p>
              </div>
            </div>

            {/* India-specific Note */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 mb-10 border border-orange-200">
              <h3 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
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
                      <rect x="3" y="12" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="2"/>
                      <rect x="10" y="8" width="4" height="13" rx="1" stroke="currentColor" strokeWidth="2"/>
                      <rect x="17" y="4" width="4" height="17" rx="1" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Credit Score (CIBIL)
                  </h4>
                  <p className="text-sm text-orange-600">
                    In India, your <strong>credit score</strong> (like CIBIL score, 300-900) shows how trustworthy you are with borrowed money. A higher score means better loan offers!
                  </p>
                </div>
                
                <div className="bg-white/70 rounded-xl p-4 border border-orange-100">
                  <h4 className="font-bold text-orange-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Why Timely EMI Matters
                  </h4>
                  <ul className="text-sm text-orange-600 space-y-1">
                    <li>• Late payments hurt your credit score</li>
                    <li>• Banks may charge penalties</li>
                    <li>• Future loans become harder to get</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-orange-700 text-sm mt-4 italic flex items-center gap-2">
                <LightbulbIcon className="w-4 h-4 text-orange-500" />
                <span>Always pay EMIs on time — set auto-debit to never miss a payment!</span>
              </p>
            </div>

          </div>

          {/* Quiz Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <BrainIcon className="w-6 h-6 text-white" />
              </span>
              Quick Quiz
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                id="q1"
                question="What does EMI stand for?"
                options={[
                  "Extra Money Interest",
                  "Equated Monthly Installment",
                  "Easy Money Investment",
                  "Equal Monthly Income"
                ]}
                correctAnswer="B"
                explanation="EMI = Equated Monthly Installment. It's the fixed amount you pay every month to repay a loan, including both principal and interest."
              />

              <QuizQuestion
                id="q2"
                question="Why should you be careful with credit?"
                options={[
                  "Credit cards are illegal",
                  "Banks don't allow credit",
                  "You're spending future money and must repay with interest",
                  "Credit is only for rich people"
                ]}
                correctAnswer="C"
                explanation="When you use credit, you're borrowing against your future income. You'll have to pay it back with interest, so borrow only what you can afford to repay!"
              />
            </div>
          </div>

          {/* Mini Activity */}
          <div className="mt-12 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
            <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <ClipboardIcon className="w-5 h-5 text-emerald-600" />
              </span>
              Mini Activity: Your Loans & EMIs
            </h2>
            <p className="text-emerald-700 mb-4">
              List any loans or EMIs you currently have. If you don't have any, write "None" — that's perfectly okay!
            </p>
            
            <div className="space-y-3">
              {activityList.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-sm font-bold text-emerald-700">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateActivityItem(index, e.target.value)}
                    placeholder={index === 0 ? "e.g., Car loan - $250/month" : index === 1 ? "e.g., Student loan - $150/month" : "e.g., None"}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-4 bg-emerald-100 rounded-xl p-4">
              <p className="text-emerald-900 text-sm flex items-center gap-2">
                <LightbulbIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span><strong>Tip:</strong> If you have multiple EMIs, add them up. That's how much of your monthly income is already committed!</span>
              </p>
            </div>
          </div>

          {/* Key Takeaway */}
          <div className="mt-12 bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <h3 className="font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
              <BoltIcon className="w-5 h-5" />
              <span>Key Takeaway</span>
            </h3>
            <p className="text-emerald-50 leading-relaxed relative z-10">
              Credit is a tool, not free money. <strong className="text-white">Loans</strong> help you buy big things now, but you pay back more due to <strong className="text-white">interest</strong>. <strong className="text-white">EMIs</strong> spread the cost over time. Borrow wisely, pay on time, and never take more than you can repay!
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-200">
            <button 
              onClick={() => navigate('/learn/personal-finance-lesson-5')}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-emerald-600 transition-colors group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Lesson 5: Banking Basics</span>
            </button>
            <button 
              onClick={() => navigate('/learn/personal-finance-lesson-7')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              <span>Next: Insurance Basics</span>
              <FaArrowRight />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PersonalFinanceLesson6;
