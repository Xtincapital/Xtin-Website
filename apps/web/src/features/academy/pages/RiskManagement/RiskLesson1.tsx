import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';

const QuizQuestion = ({ question, options, correctAnswer, explanation }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerClick = (option) => {
    setSelectedAnswer(option);
    setShowResult(true);
  };

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <div className="bg-white rounded-xl p-6 shadow-md mb-6 border border-gray-100">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">{question}</h4>
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(option)}
            disabled={showResult}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              showResult
                ? option === correctAnswer
                  ? 'border-green-500 bg-green-50'
                  : option === selectedAnswer
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
                : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {showResult && (
        <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          {isCorrect ? (
            <FaCheckCircle className="text-green-600 text-xl flex-shrink-0 mt-0.5" />
          ) : (
            <FaTimesCircle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
              {isCorrect ? 'Correct!' : 'Not quite right'}
            </p>
            <p className="text-gray-700 mt-1">{explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// SVG 1: Risk Exists Before Reward
const RiskBeforeRewardSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Risk Exists Before Reward</text>
    
    {/* Timeline */}
    <line x1="100" y1="150" x2="600" y2="150" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round"/>
    
    {/* Risk zone (left) */}
    <rect x="100" y="100" width="200" height="100" fill="#fef2f2" rx="8" stroke="#fca5a5" strokeWidth="2"/>
    <text x="200" y="130" textAnchor="middle" fontSize="12" fontWeight="600" fill="#dc2626">RISK</text>
    <text x="200" y="155" textAnchor="middle" fontSize="9" fill="#991b1b">Uncertainty begins here</text>
    <text x="200" y="175" textAnchor="middle" fontSize="9" fill="#991b1b">Outcomes unknown</text>
    
    {/* Arrow */}
    <path d="M320 150 L380 150" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowHead)"/>
    <defs>
      <marker id="arrowHead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#64748b"/>
      </marker>
    </defs>
    <text x="350" y="135" textAnchor="middle" fontSize="8" fill="#64748b">Time passes</text>
    
    {/* Reward zone (right) */}
    <rect x="400" y="100" width="200" height="100" fill="#dcfce7" rx="8" stroke="#86efac" strokeWidth="2"/>
    <text x="500" y="130" textAnchor="middle" fontSize="12" fontWeight="600" fill="#166534">REWARD</text>
    <text x="500" y="155" textAnchor="middle" fontSize="9" fill="#14532d">Only possible after</text>
    <text x="500" y="175" textAnchor="middle" fontSize="9" fill="#14532d">surviving the risk</text>
    
    {/* Key insight */}
    <rect x="150" y="220" width="400" height="40" fill="#1e293b" rx="8"/>
    <text x="350" y="245" textAnchor="middle" fontSize="10" fill="white">💡 You cannot skip risk to reach reward. Risk comes first, always.</text>
  </svg>
);

// SVG 2: What Is Risk
const WhatIsRiskSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">What Is Risk in Financial Markets?</text>
    
    {/* Central definition */}
    <rect x="150" y="55" width="400" height="70" fill="#e0f2fe" rx="12" stroke="#7dd3fc" strokeWidth="2"/>
    <text x="350" y="85" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0369a1">Risk = Uncertainty of Outcomes</text>
    <text x="350" y="108" textAnchor="middle" fontSize="9" fill="#0c4a6e">The possibility that what happens will differ from what you expect</text>
    
    {/* Three aspects */}
    <g transform="translate(50, 145)">
      <rect x="0" y="0" width="180" height="120" fill="#fef2f2" rx="10" stroke="#fca5a5" strokeWidth="2"/>
      <text x="90" y="28" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">❓ Unknown Outcomes</text>
      <text x="90" y="55" textAnchor="middle" fontSize="8" fill="#991b1b">You cannot know in advance</text>
      <text x="90" y="72" textAnchor="middle" fontSize="8" fill="#991b1b">whether an investment will</text>
      <text x="90" y="89" textAnchor="middle" fontSize="8" fill="#991b1b">gain or lose value</text>
    </g>
    
    <g transform="translate(260, 145)">
      <rect x="0" y="0" width="180" height="120" fill="#fefce8" rx="10" stroke="#fde047" strokeWidth="2"/>
      <text x="90" y="28" textAnchor="middle" fontSize="10" fontWeight="600" fill="#a16207">⚡ Variable Results</text>
      <text x="90" y="55" textAnchor="middle" fontSize="8" fill="#92400e">The same decision can lead</text>
      <text x="90" y="72" textAnchor="middle" fontSize="8" fill="#92400e">to different results at</text>
      <text x="90" y="89" textAnchor="middle" fontSize="8" fill="#92400e">different times</text>
    </g>
    
    <g transform="translate(470, 145)">
      <rect x="0" y="0" width="180" height="120" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="2"/>
      <text x="90" y="28" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">🎯 Range of Possibilities</text>
      <text x="90" y="55" textAnchor="middle" fontSize="8" fill="#14532d">Multiple outcomes exist —</text>
      <text x="90" y="72" textAnchor="middle" fontSize="8" fill="#14532d">some favorable, some not —</text>
      <text x="90" y="89" textAnchor="middle" fontSize="8" fill="#14532d">you face all of them</text>
    </g>
  </svg>
);

// SVG 3: Certain vs Uncertain Outcomes
const CertainVsUncertainSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Certain vs Uncertain Outcomes</text>
    
    {/* Left: Certain */}
    <g transform="translate(50, 55)">
      <rect x="0" y="0" width="270" height="230" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="135" y="30" textAnchor="middle" fontSize="12" fontWeight="600" fill="#166534">✓ Certain Outcome</text>
      
      {/* Single path */}
      <circle cx="135" cy="70" r="15" fill="#22c55e"/>
      <text x="135" y="75" textAnchor="middle" fontSize="10" fill="white">A</text>
      
      <line x1="135" y1="90" x2="135" y2="150" stroke="#22c55e" strokeWidth="3"/>
      
      <circle cx="135" cy="170" r="15" fill="#22c55e"/>
      <text x="135" y="175" textAnchor="middle" fontSize="10" fill="white">B</text>
      
      <text x="135" y="205" textAnchor="middle" fontSize="9" fill="#14532d">Known cost → Known result</text>
      <text x="135" y="222" textAnchor="middle" fontSize="8" fill="#166534">Example: Fixed deposit interest</text>
    </g>
    
    {/* Right: Uncertain */}
    <g transform="translate(380, 55)">
      <rect x="0" y="0" width="270" height="230" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="135" y="30" textAnchor="middle" fontSize="12" fontWeight="600" fill="#dc2626">? Uncertain Outcome</text>
      
      {/* Multiple paths */}
      <circle cx="135" cy="70" r="15" fill="#ef4444"/>
      <text x="135" y="75" textAnchor="middle" fontSize="10" fill="white">A</text>
      
      {/* Branching lines */}
      <line x1="135" y1="90" x2="60" y2="150" stroke="#ef4444" strokeWidth="2" strokeDasharray="4"/>
      <line x1="135" y1="90" x2="135" y2="150" stroke="#eab308" strokeWidth="2" strokeDasharray="4"/>
      <line x1="135" y1="90" x2="210" y2="150" stroke="#22c55e" strokeWidth="2" strokeDasharray="4"/>
      
      <circle cx="60" cy="170" r="12" fill="#ef4444"/>
      <text x="60" y="175" textAnchor="middle" fontSize="8" fill="white">-$</text>
      
      <circle cx="135" cy="170" r="12" fill="#eab308"/>
      <text x="135" y="175" textAnchor="middle" fontSize="8" fill="white">~</text>
      
      <circle cx="210" cy="170" r="12" fill="#22c55e"/>
      <text x="210" y="175" textAnchor="middle" fontSize="8" fill="white">+$</text>
      
      <text x="135" y="205" textAnchor="middle" fontSize="9" fill="#991b1b">Same action → Multiple results</text>
      <text x="135" y="222" textAnchor="middle" fontSize="8" fill="#dc2626">Example: Stock investment</text>
    </g>
    
    {/* Bottom insight */}
    <text x="350" y="305" textAnchor="middle" fontSize="10" fill="#64748b">Financial markets are defined by uncertainty — not all outcomes can be predicted.</text>
  </svg>
);

// SVG 4: Known Cost vs Unknown Outcome
const KnownVsUnknownSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Known Costs vs Unknown Outcomes</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">What you control vs what you cannot</text>
    
    {/* Left: Known */}
    <rect x="50" y="70" width="270" height="180" fill="#e0f2fe" rx="12" stroke="#7dd3fc" strokeWidth="2"/>
    <text x="185" y="100" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0369a1">💰 What You Know (Costs)</text>
    
    <rect x="70" y="115" width="230" height="30" fill="#bfdbfe" rx="6"/>
    <text x="185" y="135" textAnchor="middle" fontSize="9" fill="#1e40af">How much you're investing</text>
    
    <rect x="70" y="155" width="230" height="30" fill="#bfdbfe" rx="6"/>
    <text x="185" y="175" textAnchor="middle" fontSize="9" fill="#1e40af">Fees and transaction costs</text>
    
    <rect x="70" y="195" width="230" height="30" fill="#bfdbfe" rx="6"/>
    <text x="185" y="215" textAnchor="middle" fontSize="9" fill="#1e40af">Time you're committing</text>
    
    {/* Right: Unknown */}
    <rect x="380" y="70" width="270" height="180" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
    <text x="515" y="100" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">❓ What You Don't Know (Outcomes)</text>
    
    <rect x="400" y="115" width="230" height="30" fill="#fee2e2" rx="6"/>
    <text x="515" y="135" textAnchor="middle" fontSize="9" fill="#991b1b">Future market movements</text>
    
    <rect x="400" y="155" width="230" height="30" fill="#fee2e2" rx="6"/>
    <text x="515" y="175" textAnchor="middle" fontSize="9" fill="#991b1b">Whether you'll gain or lose</text>
    
    <rect x="400" y="195" width="230" height="30" fill="#fee2e2" rx="6"/>
    <text x="515" y="215" textAnchor="middle" fontSize="9" fill="#991b1b">How long until results appear</text>
    
    {/* Bottom insight */}
    <text x="350" y="268" textAnchor="middle" fontSize="10" fill="#475569">Risk is the gap between what you can control (costs) and what you cannot (outcomes).</text>
  </svg>
);

// SVG 5: Risk vs Volatility
const RiskVsVolatilitySVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Risk vs Volatility: Not the Same</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">A common misconception clarified</text>
    
    {/* Left: Volatility */}
    <g transform="translate(50, 70)">
      <rect x="0" y="0" width="270" height="190" fill="#f3e8ff" rx="12" stroke="#d8b4fe" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#7c3aed">📈 Volatility</text>
      
      {/* Wavy line to show ups and downs */}
      <path d="M30 100 Q60 60 90 100 T150 100 T210 100 T240 100" 
            fill="none" stroke="#8b5cf6" strokeWidth="3"/>
      
      <text x="135" y="135" textAnchor="middle" fontSize="9" fill="#6b21a8">How much prices move</text>
      <text x="135" y="155" textAnchor="middle" fontSize="9" fill="#6b21a8">up and down over time</text>
      
      <rect x="20" y="165" width="230" height="18" fill="#ede9fe" rx="4"/>
      <text x="135" y="178" textAnchor="middle" fontSize="7" fill="#5b21b6">Measures: Price fluctuations (observable)</text>
    </g>
    
    {/* Right: Risk */}
    <g transform="translate(380, 70)">
      <rect x="0" y="0" width="270" height="190" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">⚠️ Risk</text>
      
      {/* Question marks representing uncertainty */}
      <text x="70" y="90" fontSize="24" fill="#fca5a5">?</text>
      <text x="120" y="105" fontSize="32" fill="#f87171">?</text>
      <text x="175" y="85" fontSize="20" fill="#fca5a5">?</text>
      
      <text x="135" y="135" textAnchor="middle" fontSize="9" fill="#991b1b">The possibility of permanent</text>
      <text x="135" y="155" textAnchor="middle" fontSize="9" fill="#991b1b">loss or unacceptable outcomes</text>
      
      <rect x="20" y="165" width="230" height="18" fill="#fee2e2" rx="4"/>
      <text x="135" y="178" textAnchor="middle" fontSize="7" fill="#991b1b">Measures: Potential for harm (uncertain)</text>
    </g>
    
    {/* Bottom comparison */}
    <rect x="100" y="270" width="500" height="24" fill="#1e293b" rx="6"/>
    <text x="350" y="286" textAnchor="middle" fontSize="9" fill="white">Volatility is visible movement. Risk is the potential for loss. High volatility ≠ high risk automatically.</text>
  </svg>
);

// SVG 6: Risk Cannot Be Removed
const RiskCannotBeRemovedSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Risk Cannot Be Removed — Only Managed</text>
    
    {/* Wrong approach */}
    <g transform="translate(50, 55)">
      <rect x="0" y="0" width="270" height="200" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">❌ The Impossible Goal</text>
      <text x="135" y="48" textAnchor="middle" fontSize="9" fill="#991b1b">"Eliminate all risk"</text>
      
      {/* Crossed out risk symbol */}
      <circle cx="135" cy="110" r="40" fill="#fee2e2" stroke="#ef4444" strokeWidth="3"/>
      <text x="135" y="118" textAnchor="middle" fontSize="14" fill="#ef4444">RISK</text>
      <line x1="100" y1="75" x2="170" y2="145" stroke="#ef4444" strokeWidth="4"/>
      
      <text x="135" y="175" textAnchor="middle" fontSize="8" fill="#991b1b">This leads to either:</text>
      <text x="135" y="192" textAnchor="middle" fontSize="8" fill="#7f1d1d">• Never investing (losing to inflation)</text>
      <text x="135" y="207" textAnchor="middle" fontSize="8" fill="#7f1d1d">• False confidence (ignoring real risk)</text>
    </g>
    
    {/* Right approach */}
    <g transform="translate(380, 55)">
      <rect x="0" y="0" width="270" height="200" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">✓ The Realistic Goal</text>
      <text x="135" y="48" textAnchor="middle" fontSize="9" fill="#14532d">"Manage risk thoughtfully"</text>
      
      {/* Contained risk symbol */}
      <rect x="85" y="65" width="100" height="80" fill="#f0fdf4" stroke="#22c55e" strokeWidth="3" rx="8"/>
      <text x="135" y="115" textAnchor="middle" fontSize="14" fill="#22c55e">RISK</text>
      
      <text x="135" y="168" textAnchor="middle" fontSize="8" fill="#14532d">This leads to:</text>
      <text x="135" y="185" textAnchor="middle" fontSize="8" fill="#166534">• Accepting uncertainty exists</text>
      <text x="135" y="200" textAnchor="middle" fontSize="8" fill="#166534">• Taking calculated exposure</text>
      <text x="135" y="215" textAnchor="middle" fontSize="8" fill="#166534">• Preparing for adverse outcomes</text>
    </g>
    
    {/* Bottom message */}
    <text x="350" y="280" textAnchor="middle" fontSize="10" fill="#64748b">Risk management is not about avoidance — it's about intelligent engagement with uncertainty.</text>
  </svg>
);

// SVG 7: Same Investment Different Outcomes
const SameInvestmentSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Same Investment, Different Outcomes</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Why uncertainty is unavoidable</text>
    
    {/* Starting point */}
    <circle cx="120" cy="170" r="35" fill="#6366f1" stroke="#4f46e5" strokeWidth="3"/>
    <text x="120" y="165" textAnchor="middle" fontSize="9" fill="white">Investor</text>
    <text x="120" y="180" textAnchor="middle" fontSize="9" fill="white">buys $1000</text>
    
    {/* Branches */}
    <line x1="160" y1="145" x2="280" y2="80" stroke="#22c55e" strokeWidth="2"/>
    <line x1="160" y1="170" x2="280" y2="170" stroke="#eab308" strokeWidth="2"/>
    <line x1="160" y1="195" x2="280" y2="260" stroke="#ef4444" strokeWidth="2"/>
    
    {/* Scenario labels */}
    <text x="220" y="100" fontSize="8" fill="#64748b">Scenario A</text>
    <text x="220" y="165" fontSize="8" fill="#64748b">Scenario B</text>
    <text x="220" y="240" fontSize="8" fill="#64748b">Scenario C</text>
    
    {/* Outcomes */}
    <rect x="300" y="50" width="350" height="60" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="2"/>
    <text x="475" y="75" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">📈 Market rises</text>
    <text x="475" y="95" textAnchor="middle" fontSize="9" fill="#14532d">Investment grows to $1,300 — Investor feels successful</text>
    
    <rect x="300" y="140" width="350" height="60" fill="#fefce8" rx="10" stroke="#fde047" strokeWidth="2"/>
    <text x="475" y="165" textAnchor="middle" fontSize="10" fontWeight="600" fill="#a16207">📊 Market stays flat</text>
    <text x="475" y="185" textAnchor="middle" fontSize="9" fill="#92400e">Investment stays at $1,000 — Investor waits, uncertain</text>
    
    <rect x="300" y="230" width="350" height="60" fill="#fef2f2" rx="10" stroke="#fca5a5" strokeWidth="2"/>
    <text x="475" y="255" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">📉 Market falls</text>
    <text x="475" y="275" textAnchor="middle" fontSize="9" fill="#991b1b">Investment drops to $700 — Investor faces loss</text>
    
    {/* Key insight */}
    <text x="350" y="310" textAnchor="middle" fontSize="9" fill="#475569">The same decision leads to different outcomes. This is risk — it exists before you know which scenario unfolds.</text>
  </svg>
);

// SVG 8: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 200" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="200" fill="#f8fafc" rx="16"/>
    
    {/* Central message */}
    <rect x="50" y="25" width="600" height="150" fill="url(#riskGradient)" rx="16"/>
    
    <defs>
      <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#059669"/>
        <stop offset="100%" stopColor="#0d9488"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="60" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">💡 Key Takeaway</text>
    
    <text x="350" y="95" textAnchor="middle" fontSize="12" fill="white">Risk is uncertainty — the possibility that outcomes will differ from expectations.</text>
    <text x="350" y="120" textAnchor="middle" fontSize="12" fill="white">It exists in every financial decision. It cannot be eliminated.</text>
    <text x="350" y="150" textAnchor="middle" fontSize="16" fontWeight="700" fill="#fef3c7">UNDERSTANDING RISK IS THE FIRST STEP TO MANAGING IT</text>
  </svg>
);

const RiskLesson1 = () => {
  const navigate = useNavigate();

  const quizQuestions = [
    {
      question: "What does 'risk' mean in financial markets?",
      options: [
        "The guarantee of losing money",
        "The uncertainty of outcomes — results may differ from expectations",
        "High volatility in stock prices",
        "Investing in stocks instead of bonds"
      ],
      correctAnswer: "The uncertainty of outcomes — results may differ from expectations",
      explanation: "Risk is fundamentally about uncertainty. It means outcomes are not guaranteed and may differ from what you expect — either positively or negatively."
    },
    {
      question: "Can risk be completely eliminated from investing?",
      options: [
        "Yes, by choosing the right investments",
        "Yes, by never investing in stocks",
        "No, risk is inherent in all financial decisions and can only be managed",
        "Yes, by timing the market perfectly"
      ],
      correctAnswer: "No, risk is inherent in all financial decisions and can only be managed",
      explanation: "Risk cannot be eliminated — only managed. Even not investing carries risk (losing purchasing power to inflation). The goal is to manage risk thoughtfully, not to avoid it entirely."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/learn/risk-management')}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 transition-colors mb-4"
          >
            <FaArrowLeft />
            <span>Back to Risk Management</span>
          </button>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
              Lesson 1 of 7
            </span>
            <h1 className="text-3xl font-bold text-gray-800 mt-4">What Is Risk in Financial Markets?</h1>
            <p className="text-gray-600 mt-2">Understanding the foundation of all financial decisions</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Risk Exists in All Financial Decisions</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Every time you make a financial decision — whether to invest, to save, to spend, 
              or even to do nothing — you're engaging with risk. This isn't a flaw in the system. 
              It's not something to fear or avoid. It's simply the nature of financial markets.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Risk exists because the future is uncertain. No one knows with certainty what will 
              happen tomorrow, next month, or next year. Markets reflect this uncertainty. Prices 
              move because new information arrives, expectations change, and outcomes unfold 
              differently than anticipated.
            </p>
            <p className="text-lg leading-relaxed">
              The first step to becoming a thoughtful investor isn't learning strategies or 
              picking assets — it's understanding what risk actually means. That understanding 
              changes how you think, how you behave, and ultimately, how you protect your capital.
            </p>
          </div>

          <RiskBeforeRewardSVG />
        </div>

        {/* Core Explanation: What Risk Means */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">What Risk Means in Finance</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              In financial markets, risk has a specific meaning: <strong>uncertainty of outcomes</strong>. 
              When you invest, you don't know what will happen. The value of your investment might 
              go up, go down, or stay flat. You cannot know in advance which of these will occur.
            </p>
            <p className="text-lg leading-relaxed">
              This is different from everyday usage where "risk" often means "danger." In finance, 
              risk simply means that multiple outcomes are possible, and you face all of them 
              when you make a decision. Understanding this removes the emotional charge from 
              the concept and allows you to think more clearly.
            </p>
          </div>

          <WhatIsRiskSVG />
        </div>

        {/* Certain vs Uncertain */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Certain vs Uncertain Outcomes</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              To understand risk, compare situations with certain outcomes versus uncertain ones. 
              When you put money in a fixed deposit, you know the interest rate. The outcome is 
              predictable — you'll receive a specific amount at a specific time.
            </p>
            <p className="text-lg leading-relaxed">
              When you invest in the stock market, however, no such guarantee exists. The same 
              action (buying shares) can lead to very different results depending on factors 
              you cannot control or predict. This uncertainty is what we call risk.
            </p>
          </div>

          <CertainVsUncertainSVG />
        </div>

        {/* Known vs Unknown */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Known Costs vs Unknown Outcomes</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              A useful way to think about risk is to separate what you can know from what you 
              cannot. When you make an investment, certain things are knowable: how much you're 
              investing, what fees you'll pay, and what your time commitment looks like.
            </p>
            <p className="text-lg leading-relaxed">
              But other things remain fundamentally unknowable: whether the market will rise or 
              fall, how long it will take to see results, and whether your expectations will 
              be met. This gap between the known and the unknown is where risk lives.
            </p>
          </div>

          <KnownVsUnknownSVG />
        </div>

        {/* Risk vs Volatility */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Risk vs Volatility: A Common Misconception</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Many people confuse risk with volatility. They're related but not the same thing.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              <strong>Volatility</strong> measures how much prices move up and down. It's 
              observable — you can see it in price charts. Some investments are more volatile 
              than others, meaning their prices fluctuate more.
            </p>
            <p className="text-lg leading-relaxed">
              <strong>Risk</strong>, however, is about the possibility of permanent loss or 
              outcomes you cannot accept. An investment can be volatile without being risky 
              to you (if you can withstand the fluctuations), and an investment can seem 
              stable but carry hidden risks. Understanding this distinction helps you make 
              better decisions.
            </p>
          </div>

          <RiskVsVolatilitySVG />
        </div>

        {/* Risk Cannot Be Removed */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Risk Cannot Be Removed</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              A fundamental truth of financial markets: <strong>risk cannot be eliminated</strong>. 
              It can only be managed. Attempts to remove all risk lead to either paralysis 
              (never investing and losing purchasing power to inflation) or false confidence 
              (believing you've found a "safe" path that doesn't exist).
            </p>
            <p className="text-lg leading-relaxed">
              The goal of risk management is not to avoid risk but to engage with it 
              thoughtfully — to understand what you're facing, to size your exposure 
              appropriately, and to prepare for adverse outcomes. This is a more mature 
              and realistic approach than seeking the impossible goal of zero risk.
            </p>
          </div>

          <RiskCannotBeRemovedSVG />
        </div>

        {/* Practical Example */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">A Simple Example: Same Investment, Different Outcomes</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Imagine an investor who puts $1,000 into a diversified market investment. At the 
              moment of investment, the outcome is unknown. The market could rise, stay flat, 
              or fall. All three scenarios are possible.
            </p>
            <p className="text-lg leading-relaxed">
              Only after time passes does one outcome become reality. But at the moment of 
              decision, the investor faces all three possibilities simultaneously. This is 
              what risk means — living with uncertainty until outcomes reveal themselves. 
              The investor who understands this is better prepared than one who expects 
              certainty.
            </p>
          </div>

          <SameInvestmentSVG />
        </div>

        {/* Key Takeaway Visual */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
        </div>

        {/* India-specific Context */}
        <div className="bg-emerald-50 rounded-2xl p-6 shadow-lg mb-8 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-800 mb-3">🌍 Global Context</h3>
          <p className="text-emerald-900">
            Market uncertainty exists everywhere — from the United States and Europe to 
            India and other emerging markets. The fundamental nature of risk (uncertainty 
            of outcomes) is universal. Whether you're investing in New York, London, Mumbai, 
            or Singapore, you face the same reality: outcomes cannot be predicted with 
            certainty, and understanding this is the foundation of thoughtful investing. 
            In rapidly growing markets, this awareness becomes even more important as 
            enthusiasm can sometimes overshadow fundamental risk awareness.
          </p>
        </div>

        {/* Quiz Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Knowledge Check</h2>
          {quizQuestions.map((q, index) => (
            <QuizQuestion key={index} {...q} />
          ))}
        </div>

        {/* Reflection Activity */}
        <div className="bg-gradient-to-r from-teal-100 to-emerald-100 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-500 rounded-full p-3">
              <FaLightbulb className="text-white text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-emerald-800 mb-3">Reflection Activity</h3>
              <div className="bg-white rounded-xl p-5 border border-emerald-200">
                <p className="text-gray-800 font-medium mb-4">
                  Think about your own financial decisions — past, present, or planned. 
                  Consider these questions:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">1.</span>
                    <span>Where do you face uncertainty in your financial life? (Investments, career, expenses?)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">2.</span>
                    <span>Have you ever made a decision expecting a certain outcome, only to experience something different?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">3.</span>
                    <span>How comfortable are you with uncertainty? Does the unknown create anxiety, or can you accept it calmly?</span>
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                  <p className="text-emerald-800 text-sm">
                    <strong>Why this matters:</strong> Understanding your own relationship 
                    with uncertainty is the first step to managing risk effectively. There's 
                    no right answer — only honest self-awareness.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 shadow-lg mb-8 text-white">
          <h3 className="text-xl font-bold mb-4">🔑 Lesson Summary</h3>
          <ul className="space-y-2 text-lg">
            <li>• Risk in finance means uncertainty of outcomes — not danger</li>
            <li>• The same action can lead to different results at different times</li>
            <li>• You can know costs, but you cannot know outcomes in advance</li>
            <li>• Risk and volatility are related but not the same</li>
            <li>• Risk cannot be eliminated — only managed thoughtfully</li>
            <li>• Understanding risk is the foundation of protecting capital</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/risk-management')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Module</span>
          </button>
          <button
            onClick={() => navigate('/learn/risk-lesson-2')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl transition-colors"
          >
            <span>Next Lesson</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskLesson1;
