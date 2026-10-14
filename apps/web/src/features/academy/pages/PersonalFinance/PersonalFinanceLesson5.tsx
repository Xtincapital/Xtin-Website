import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { 
  BankIcon, TargetIcon, CheckCircleIcon, BookOpenIcon, 
  BrainIcon, KeyIcon, LockIcon, GrowthIcon, CoinsIcon, LightbulbIcon, PhoneIcon, StarIcon, BoltIcon,
  ClipboardIcon
} from "../../components/LearningIcons";

const PersonalFinanceLesson5 = () => {
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
                Lesson 5 of 9
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                8 min read
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-sm bg-brand-soft">
                <BankIcon className="w-7 h-7 text-brand" />
              </span>
              <span>Banking Basics</span>
            </h1>
            <p className="text-lg text-gray-500">
              Understand how banks work and why they're essential for managing your money safely.
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
                <span>What a bank does and why it's useful</span>
              </li>
              <li className="flex items-start gap-3 text-brand">
                <span className="text-brand mt-0.5 flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5" />
                </span>
                <span>How savings accounts and interest work</span>
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-[-0.015em]">What is a Bank?</h2>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              A <strong className="text-gray-900">bank</strong> is a safe place to keep your money. Instead of storing cash at home (risky!), you deposit it in a bank where it's protected.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-brand-soft rounded-xl p-5 text-center border border-brand-line hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-brand-soft rounded-xl flex items-center justify-center mx-auto mb-2">
                  <LockIcon className="w-6 h-6 text-brand" />
                </div>
                <h4 className="font-bold text-brand">Safe Storage</h4>
                <p className="text-sm text-brand mt-1">Money is protected from theft or loss</p>
              </div>
              <div className="bg-brand-soft rounded-xl p-5 text-center border border-brand-line hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-brand-soft rounded-xl flex items-center justify-center mx-auto mb-2">
                  <GrowthIcon className="w-6 h-6 text-brand" />
                </div>
                <h4 className="font-bold text-brand">Earn Interest</h4>
                <p className="text-sm text-brand mt-1">Your money grows a little over time</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-5 text-center border border-amber-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <BankIcon className="w-6 h-6 text-amber-600" />
                </div>
                <h4 className="font-bold text-amber-900">Easy Access</h4>
                <p className="text-sm text-amber-700 mt-1">Withdraw anytime via ATM or online</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-[-0.015em]">What is a Savings Account?</h2>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              A <strong className="text-gray-900">savings account</strong> is the most common type of bank account. You deposit money, the bank keeps it safe, and pays you a small reward called <strong className="text-brand">interest</strong>.
            </p>

            <div className="bg-brand-soft rounded-xl p-5 mb-8 border border-brand-line">
              <h4 className="font-bold text-brand mb-2 flex items-center gap-2">
                <LightbulbIcon className="w-5 h-5 text-brand" />
                What is Interest?
              </h4>
              <p className="text-brand">
                Interest is money the bank pays you for keeping your money with them. It's like a small "thank you" that makes your balance grow automatically!
              </p>
            </div>

            {/* SVG Diagram - How Banking Works */}
            <div className="bg-white rounded-3xl p-8 mb-10 border border-gray-100 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">How Banking Works</h3>
              <svg className="w-full max-w-lg mx-auto" viewBox="0 0 500 200" fill="none">
                {/* Person icon */}
                <g transform="translate(50, 60)">
                  <circle cx="30" cy="25" r="20" fill="#A88BD9" stroke="#8F6FC4" strokeWidth="2"/>
                  <path d="M30 50 L30 80 M15 60 L45 60 M30 80 L15 110 M30 80 L45 110" stroke="#8F6FC4" strokeWidth="3" strokeLinecap="round"/>
                  <text x="30" y="130" textAnchor="middle" fill="#654B8A" fontSize="12" fontWeight="bold">YOU</text>
                </g>
                
                {/* Arrow 1: Deposit */}
                <g transform="translate(110, 85)">
                  <path d="M0 20 L60 20" stroke="#12805A" strokeWidth="3" markerEnd="url(#arrowGreen)"/>
                  <text x="30" y="10" textAnchor="middle" fill="#12805A" fontSize="11" fontWeight="600">Deposit</text>
                  <text x="30" y="45" textAnchor="middle" fill="#12805A" fontSize="10">$1,000</text>
                </g>
                
                {/* Bank building */}
                <g transform="translate(190, 40)">
                  <rect x="0" y="40" width="120" height="80" rx="8" fill="#ECE4F6" stroke="#8F6FC4" strokeWidth="2"/>
                  <polygon points="60,10 0,45 120,45" fill="#D9CBEE" stroke="#8F6FC4" strokeWidth="2"/>
                  <rect x="20" y="60" width="25" height="35" rx="4" fill="#8F6FC4"/>
                  <rect x="75" y="60" width="25" height="35" rx="4" fill="#8F6FC4"/>
                  <rect x="48" y="80" width="25" height="40" rx="4" fill="#7A5BA6"/>
                  <circle cx="60" cy="25" r="8" fill="#CDAA5F"/>
                  <text x="60" y="29" textAnchor="middle" fill="#654B26" fontSize="10" fontWeight="bold">$</text>
                  <text x="60" y="145" textAnchor="middle" fill="#654B8A" fontSize="12" fontWeight="bold">BANK</text>
                </g>
                
                {/* Arrow 2: Interest + Balance */}
                <g transform="translate(330, 85)">
                  <path d="M0 20 L60 20" stroke="#8F6FC4" strokeWidth="3"/>
                  <polygon points="60,20 50,14 50,26" fill="#8F6FC4"/>
                  <text x="30" y="10" textAnchor="middle" fill="#7A5BA6" fontSize="11" fontWeight="600">+ Interest</text>
                  <text x="30" y="45" textAnchor="middle" fill="#7A5BA6" fontSize="10">$1,020</text>
                </g>
                
                {/* Growing money */}
                <g transform="translate(400, 55)">
                  <rect x="0" y="20" width="70" height="70" rx="12" fill="#EEF9F4" stroke="#12805A" strokeWidth="2"/>
                  <text x="35" y="55" textAnchor="middle" fill="#12805A" fontSize="22" fontWeight="bold">$$$</text>
                  <text x="35" y="72" textAnchor="middle" fill="#12805A" fontSize="11" fontWeight="bold">GROWS!</text>
                  <text x="35" y="115" textAnchor="middle" fill="#12805A" fontSize="12" fontWeight="bold">YOUR $$$</text>
                </g>
                
                {/* Arrow definitions */}
                <defs>
                  <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#12805A"/>
                  </marker>
                </defs>
              </svg>
              <p className="text-center text-gray-500 text-sm mt-6 flex items-center justify-center gap-2">
                <LightbulbIcon className="w-4 h-4 text-brand" />
                <span>You deposit money → Bank keeps it safe → You earn interest → Your balance grows!</span>
              </p>
            </div>

            {/* Real Life Example */}
            <div className="rounded-2xl p-6 mb-10 border border-brand-line relative overflow-hidden bg-brand-soft">
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-soft rounded-full"></div>
              <h3 className="font-semibold text-brand mb-4 flex items-center gap-2 relative z-10">
                <span className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
                  <CoinsIcon className="w-5 h-5 text-brand" />
                </span>
                Real Example: Sam's Savings Account
              </h3>
              <p className="text-brand leading-relaxed mb-4 relative z-10">
                Sam opens a savings account and deposits <strong>$1,000</strong>. The bank offers <strong>2% interest per year</strong>.
              </p>
              
              <div className="space-y-3 relative z-10">
                <div className="bg-white/70 rounded-xl p-4 flex items-center justify-between border border-brand-line">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-brand-soft rounded-lg flex items-center justify-center">
                      <CoinsIcon className="w-5 h-5 text-brand" />
                    </span>
                    <div>
                      <p className="font-bold text-brand">Initial Deposit</p>
                      <p className="text-sm text-brand">Money Sam put in</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-brand">$1,000</span>
                </div>
                
                <div className="bg-white/70 rounded-xl p-4 flex items-center justify-between border border-brand-line">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-brand-soft rounded-lg flex items-center justify-center">
                      <GrowthIcon className="w-5 h-5 text-brand" />
                    </span>
                    <div>
                      <p className="font-bold text-brand">Interest Earned (1 year)</p>
                      <p className="text-sm text-brand">2% of $1,000</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-brand">+$20</span>
                </div>
                
                <div className="bg-white/70 rounded-xl p-4 flex items-center justify-between border border-brand-line">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-brand-soft rounded-lg flex items-center justify-center">
                      <CoinsIcon className="w-5 h-5 text-brand" />
                    </span>
                    <div>
                      <p className="font-bold text-brand">New Balance</p>
                      <p className="text-sm text-brand">After 1 year</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-brand">$1,020</span>
                </div>
              </div>
              
              <div className="mt-4 bg-brand-soft rounded-xl p-4 relative z-10">
                <p className="text-brand text-sm flex items-center gap-2">
                  <StarIcon className="w-4 h-4 text-brand" />
                  <span>Sam did nothing — the money grew on its own! That's the power of interest.</span>
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
              <p className="text-orange-800 mb-4">
                In India, banking is easy and widely accessible:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/70 rounded-xl p-4 border border-orange-100">
                  <h4 className="font-bold text-orange-700 mb-2 flex items-center gap-2">
                    <BankIcon className="w-4 h-4 text-orange-600" />
                    Account Types
                  </h4>
                  <ul className="text-sm text-orange-600 space-y-1">
                    <li>• Savings Account (most common)</li>
                    <li>• Salary Account (from employer)</li>
                    <li>• Zero-balance accounts available</li>
                  </ul>
                </div>
                <div className="bg-white/70 rounded-xl p-4 border border-orange-100">
                  <h4 className="font-bold text-orange-700 mb-2 flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-orange-600" />
                    Digital Banking
                  </h4>
                  <ul className="text-sm text-orange-600 space-y-1">
                    <li>• UPI apps (instant transfers)</li>
                    <li>• Net banking & mobile apps</li>
                    <li>• ATMs everywhere</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-orange-700 text-sm mt-4 italic flex items-center gap-2">
                <LightbulbIcon className="w-4 h-4 text-orange-500" />
                <span>Most banks offer 2.5%–4% interest on savings accounts in India.</span>
              </p>
            </div>

          </div>

          {/* Quiz Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <span className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-brand-fill">
                <BrainIcon className="w-6 h-6 text-white" />
              </span>
              Quick Quiz
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                id="q1"
                question="What is interest on a savings account?"
                options={[
                  "A fee you pay the bank",
                  "Money the bank pays you for keeping your money with them",
                  "The minimum balance required",
                  "A type of loan"
                ]}
                correctAnswer="B"
                explanation="Interest is like a small reward — the bank pays you for letting them hold your money. It's free money that grows your balance!"
              />

              <QuizQuestion
                id="q2"
                question="Why is a bank safer than keeping cash at home?"
                options={[
                  "Banks are open 24 hours",
                  "Banks give you free gifts",
                  "Your money is protected from theft, loss, and earns interest",
                  "Banks are closer to your home"
                ]}
                correctAnswer="C"
                explanation="Banks offer security (insurance protects your money), convenience (ATMs, online access), and your money earns interest. Cash at home has none of these benefits!"
              />
            </div>
          </div>

          {/* Mini Activity */}
          <div className="mt-12 rounded-2xl p-6 border border-brand-line bg-brand-soft">
            <h2 className="text-xl font-semibold text-brand mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
                <ClipboardIcon className="w-5 h-5 text-brand" />
              </span>
              Mini Activity: Where's Your Money?
            </h2>
            <p className="text-brand mb-4">
              List where you currently keep your money. Be honest — this helps you understand your habits!
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
                    placeholder={index === 0 ? "e.g., Savings account at ABC Bank" : index === 1 ? "e.g., Cash in wallet" : "e.g., Digital wallet app"}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-brand-line focus:border-brand focus:outline-none"
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-4 bg-brand-soft rounded-xl p-4">
              <p className="text-brand text-sm flex items-center gap-2">
                <LightbulbIcon className="w-4 h-4 text-brand" />
                <span><strong>Tip:</strong> Most of your money should be in a savings account where it's safe and earns interest!</span>
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
              A bank keeps your money <strong className="text-white">safe</strong>, lets you <strong className="text-white">access it anytime</strong>, and pays you <strong className="text-white">interest</strong> to grow it. Open a savings account if you don't have one — it's the first step to smart money management!
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-200">
            <button 
              onClick={() => navigate('/learn/personal-finance-lesson-4')}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-brand transition-colors group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Lesson 4: Savings & Emergency Fund</span>
            </button>
            <button 
              onClick={() => navigate('/learn/personal-finance-lesson-6')}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-brand/25 transition-all bg-brand-fill"
            >
              <span>Next: Credit Basics</span>
              <FaArrowRight />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PersonalFinanceLesson5;
