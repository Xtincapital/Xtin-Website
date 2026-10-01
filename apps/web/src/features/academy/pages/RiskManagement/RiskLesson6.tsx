import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

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

// SVG 1: Two Approaches, Different Risks
const TwoApproachesSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Two Approaches to Markets — Different Risk Profiles</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Neither is inherently safer — they're simply different</text>
    
    {/* Trading Side */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="270" height="175" fill="#dbeafe" rx="12" stroke="#93c5fd" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fill="#1e40af">Trading</text>
      
      {/* Icon: Lightning bolt */}
      <g transform="translate(115, 45)">
        <circle cx="20" cy="20" r="18" fill="#3b82f6"/>
        <path d="M22 8 L14 22 H20 L18 32 L26 18 H20 Z" fill="white"/>
      </g>
      
      <text x="135" y="95" textAnchor="middle" fontSize="9" fill="#1e40af">Short time horizons</text>
      <text x="135" y="112" textAnchor="middle" fontSize="9" fill="#1e40af">Frequent decisions</text>
      <text x="135" y="129" textAnchor="middle" fontSize="9" fill="#1e40af">Active attention required</text>
      <text x="135" y="146" textAnchor="middle" fontSize="9" fill="#1e40af">Immediate feedback</text>
      <text x="135" y="163" textAnchor="middle" fontSize="9" fill="#1e40af">Higher emotional intensity</text>
    </g>
    
    {/* VS Divider */}
    <g transform="translate(330, 140)">
      <circle cx="20" cy="20" r="20" fill="#64748b"/>
      <text x="20" y="26" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">VS</text>
    </g>
    
    {/* Investing Side */}
    <g transform="translate(380, 75)">
      <rect x="0" y="0" width="270" height="175" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="13" fontWeight="600" fill="#166534">Investing</text>
      
      {/* Icon: Tree/Growth */}
      <g transform="translate(115, 45)">
        <circle cx="20" cy="20" r="18" fill="#22c55e"/>
        <path d="M20 28 L20 20 M15 22 L20 16 L25 22 M13 26 L20 18 L27 26" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </g>
      
      <text x="135" y="95" textAnchor="middle" fontSize="9" fill="#166534">Long time horizons</text>
      <text x="135" y="112" textAnchor="middle" fontSize="9" fill="#166534">Infrequent decisions</text>
      <text x="135" y="129" textAnchor="middle" fontSize="9" fill="#166534">Patience required</text>
      <text x="135" y="146" textAnchor="middle" fontSize="9" fill="#166534">Delayed feedback</text>
      <text x="135" y="163" textAnchor="middle" fontSize="9" fill="#166534">Lower day-to-day intensity</text>
    </g>
  </svg>
);

// SVG 2: Time Horizon Comparison
const TimeHorizonSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Time Horizon Changes Everything</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">The same volatility looks different through different lenses</text>
    
    {/* Timeline base */}
    <g transform="translate(60, 90)">
      <line x1="0" y1="0" x2="580" y2="0" stroke="#cbd5e1" strokeWidth="3"/>
      
      {/* Timeline markers */}
      <g transform="translate(0, 0)">
        <circle cx="0" cy="0" r="6" fill="#64748b"/>
        <text x="0" y="20" textAnchor="middle" fontSize="8" fill="#64748b">Now</text>
      </g>
      
      <g transform="translate(80, 0)">
        <circle cx="0" cy="0" r="4" fill="#94a3b8"/>
        <text x="0" y="20" textAnchor="middle" fontSize="8" fill="#64748b">Days</text>
      </g>
      
      <g transform="translate(180, 0)">
        <circle cx="0" cy="0" r="4" fill="#94a3b8"/>
        <text x="0" y="20" textAnchor="middle" fontSize="8" fill="#64748b">Weeks</text>
      </g>
      
      <g transform="translate(300, 0)">
        <circle cx="0" cy="0" r="4" fill="#94a3b8"/>
        <text x="0" y="20" textAnchor="middle" fontSize="8" fill="#64748b">Months</text>
      </g>
      
      <g transform="translate(450, 0)">
        <circle cx="0" cy="0" r="4" fill="#94a3b8"/>
        <text x="0" y="20" textAnchor="middle" fontSize="8" fill="#64748b">Years</text>
      </g>
      
      <g transform="translate(580, 0)">
        <circle cx="0" cy="0" r="6" fill="#64748b"/>
        <text x="0" y="20" textAnchor="middle" fontSize="8" fill="#64748b">Decades</text>
      </g>
    </g>
    
    {/* Trading Zone */}
    <g transform="translate(60, 130)">
      <rect x="0" y="0" width="180" height="50" fill="#dbeafe" rx="8" stroke="#3b82f6" strokeWidth="2"/>
      <text x="90" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#1e40af">Trading Zone</text>
      <text x="90" y="38" textAnchor="middle" fontSize="8" fill="#1e40af">Minutes → Weeks</text>
      
      {/* Arrow pointing to timeline */}
      <line x1="90" y1="-5" x2="90" y2="-25" stroke="#3b82f6" strokeWidth="2"/>
      <polygon points="85,-25 90,-35 95,-25" fill="#3b82f6"/>
    </g>
    
    {/* Investing Zone */}
    <g transform="translate(300, 130)">
      <rect x="0" y="0" width="280" height="50" fill="#dcfce7" rx="8" stroke="#22c55e" strokeWidth="2"/>
      <text x="140" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">Investing Zone</text>
      <text x="140" y="38" textAnchor="middle" fontSize="8" fill="#166534">Months → Decades</text>
      
      {/* Arrow pointing to timeline */}
      <line x1="140" y1="-5" x2="140" y2="-25" stroke="#22c55e" strokeWidth="2"/>
      <polygon points="135,-25 140,-35 145,-25" fill="#22c55e"/>
    </g>
    
    {/* Key insight boxes */}
    <g transform="translate(80, 210)">
      <rect x="0" y="0" width="240" height="60" fill="#eff6ff" rx="8" stroke="#bfdbfe" strokeWidth="1"/>
      <text x="120" y="20" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1e40af">Trading Risk:</text>
      <text x="120" y="38" textAnchor="middle" fontSize="8" fill="#1e3a8a">Short-term noise matters</text>
      <text x="120" y="52" textAnchor="middle" fontSize="8" fill="#1e3a8a">Every movement counts</text>
    </g>
    
    <g transform="translate(380, 210)">
      <rect x="0" y="0" width="240" height="60" fill="#f0fdf4" rx="8" stroke="#bbf7d0" strokeWidth="1"/>
      <text x="120" y="20" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">Investing Risk:</text>
      <text x="120" y="38" textAnchor="middle" fontSize="8" fill="#14532d">Long-term direction matters</text>
      <text x="120" y="52" textAnchor="middle" fontSize="8" fill="#14532d">Daily noise is filtered out</text>
    </g>
  </svg>
);

// SVG 3: Volatility vs Time
const VolatilityTimeSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Same Asset, Different Views</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Time horizon determines how "volatile" something feels</text>
    
    {/* Short-term view (choppy) */}
    <g transform="translate(60, 80)">
      <text x="130" y="0" textAnchor="middle" fontSize="10" fontWeight="600" fill="#1e40af">Short-Term View (Trading)</text>
      
      <rect x="0" y="10" width="260" height="100" fill="#eff6ff" rx="8" stroke="#93c5fd" strokeWidth="1"/>
      
      {/* Choppy line */}
      <path d="M20 70 L35 50 L50 75 L65 40 L80 65 L95 35 L110 70 L125 45 L140 80 L155 55 L170 75 L185 40 L200 60 L215 50 L230 65 L245 55" 
            fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
      
      {/* Stress indicators */}
      <text x="130" y="125" textAnchor="middle" fontSize="8" fill="#dc2626">😰 Every move feels significant</text>
    </g>
    
    {/* Long-term view (smooth) */}
    <g transform="translate(380, 80)">
      <text x="130" y="0" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">Long-Term View (Investing)</text>
      
      <rect x="0" y="10" width="260" height="100" fill="#f0fdf4" rx="8" stroke="#86efac" strokeWidth="1"/>
      
      {/* Smooth upward line with light volatility */}
      <path d="M20 85 Q70 80 120 65 Q170 55 220 45 Q240 42 245 40" 
            fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round"/>
      
      {/* Faded volatility underneath */}
      <path d="M20 85 L35 80 L50 88 L65 78 L80 82 L95 72 L110 78 L125 68 L140 72 L155 62 L170 66 L185 55 L200 58 L215 48 L230 52 L245 40" 
            fill="none" stroke="#86efac" strokeWidth="1" strokeLinecap="round" strokeDasharray="2"/>
      
      {/* Calm indicator */}
      <text x="130" y="125" textAnchor="middle" fontSize="8" fill="#166534">😌 Noise smooths into trend</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="210" width="500" height="70" fill="#fef9c3" rx="10" stroke="#fcd34d" strokeWidth="2"/>
    <text x="350" y="235" textAnchor="middle" fontSize="10" fontWeight="600" fill="#92400e">Key Insight:</text>
    <text x="350" y="255" textAnchor="middle" fontSize="9" fill="#78350f">The asset didn't change — only the lens you view it through.</text>
    <text x="350" y="270" textAnchor="middle" fontSize="9" fill="#78350f">Traders live in the noise. Investors look past it.</text>
  </svg>
);

// SVG 4: Decision Frequency
const DecisionFrequencySVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Decision Frequency Creates Different Risks</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">More decisions = more opportunities to make mistakes</text>
    
    {/* Trading: Many decisions */}
    <g transform="translate(60, 80)">
      <text x="130" y="0" textAnchor="middle" fontSize="10" fontWeight="600" fill="#1e40af">Trading: Frequent Decisions</text>
      
      <rect x="0" y="15" width="260" height="80" fill="#dbeafe" rx="8"/>
      
      {/* Many decision points */}
      <g transform="translate(20, 40)">
        {[0, 25, 50, 75, 100, 125, 150, 175, 200].map((x, i) => (
          <g key={i} transform={`translate(${x}, 0)`}>
            <circle cx="0" cy="0" r="8" fill="#3b82f6"/>
            <text x="0" y="4" textAnchor="middle" fontSize="6" fill="white">D</text>
          </g>
        ))}
        <text x="110" y="30" textAnchor="middle" fontSize="7" fill="#1e40af">D = Decision point</text>
      </g>
      
      <text x="130" y="110" textAnchor="middle" fontSize="8" fill="#dc2626">⚠️ Each decision is a chance to be right OR wrong</text>
    </g>
    
    {/* Investing: Few decisions */}
    <g transform="translate(380, 80)">
      <text x="130" y="0" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">Investing: Rare Decisions</text>
      
      <rect x="0" y="15" width="260" height="80" fill="#dcfce7" rx="8"/>
      
      {/* Few decision points */}
      <g transform="translate(20, 40)">
        <circle cx="30" cy="0" r="10" fill="#22c55e"/>
        <text x="30" y="4" textAnchor="middle" fontSize="7" fill="white">D</text>
        
        <circle cx="190" cy="0" r="10" fill="#22c55e"/>
        <text x="190" y="4" textAnchor="middle" fontSize="7" fill="white">D</text>
        
        <line x1="45" y1="0" x2="175" y2="0" stroke="#86efac" strokeWidth="2" strokeDasharray="5"/>
        <text x="110" y="30" textAnchor="middle" fontSize="7" fill="#166534">Long periods between decisions</text>
      </g>
      
      <text x="130" y="110" textAnchor="middle" fontSize="8" fill="#166534">✓ Fewer decisions = fewer error opportunities</text>
    </g>
    
    {/* Comparison insight */}
    <g transform="translate(100, 200)">
      <rect x="0" y="0" width="500" height="60" fill="#1e293b" rx="10"/>
      <text x="250" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">Different Risk Types:</text>
      <text x="125" y="45" textAnchor="middle" fontSize="9" fill="#93c5fd">Trading: Risk of frequent mistakes</text>
      <text x="375" y="45" textAnchor="middle" fontSize="9" fill="#86efac">Investing: Risk of inaction or impatience</text>
    </g>
  </svg>
);

// SVG 5: Emotional Pressure Comparison
const EmotionalPressureSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Emotional Pressure Over Time</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Both approaches test you — just differently</text>
    
    {/* Trading emotional pattern */}
    <g transform="translate(60, 80)">
      <text x="130" y="0" textAnchor="middle" fontSize="10" fontWeight="600" fill="#1e40af">Trading: Intense Spikes</text>
      
      <rect x="0" y="15" width="260" height="100" fill="#eff6ff" rx="8" stroke="#bfdbfe" strokeWidth="1"/>
      
      {/* Stress line - spiky */}
      <path d="M20 80 L30 30 L40 75 L55 25 L70 70 L85 20 L100 65 L115 35 L130 70 L145 25 L160 60 L175 40 L190 75 L205 30 L220 65 L235 50 L245 55" 
            fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
      
      <text x="130" y="130" textAnchor="middle" fontSize="8" fill="#991b1b">High-frequency emotional peaks and valleys</text>
    </g>
    
    {/* Investing emotional pattern */}
    <g transform="translate(380, 80)">
      <text x="130" y="0" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">Investing: Slow Burns</text>
      
      <rect x="0" y="15" width="260" height="100" fill="#f0fdf4" rx="8" stroke="#bbf7d0" strokeWidth="1"/>
      
      {/* Stress line - gentle waves with occasional spike */}
      <path d="M20 60 Q50 55 80 58 Q110 62 140 55 Q160 50 170 30 Q180 50 200 55 Q230 52 245 58" 
            fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
      
      {/* Mark the spike */}
      <circle cx="170" cy="30" r="5" fill="#f59e0b" stroke="white" strokeWidth="1"/>
      <text x="170" y="18" textAnchor="middle" fontSize="6" fill="#92400e">Market crash</text>
      
      <text x="130" y="130" textAnchor="middle" fontSize="8" fill="#78350f">Long patience tests, rare acute stress</text>
    </g>
    
    {/* Comparison boxes */}
    <g transform="translate(60, 210)">
      <rect x="0" y="0" width="260" height="65" fill="#fef2f2" rx="8" stroke="#fca5a5" strokeWidth="1"/>
      <text x="130" y="20" textAnchor="middle" fontSize="9" fontWeight="600" fill="#dc2626">Trading Emotional Risks:</text>
      <text x="130" y="38" textAnchor="middle" fontSize="8" fill="#991b1b">• Overtrading from excitement</text>
      <text x="130" y="52" textAnchor="middle" fontSize="8" fill="#991b1b">• Revenge trading after losses</text>
    </g>
    
    <g transform="translate(380, 210)">
      <rect x="0" y="0" width="260" height="65" fill="#fef9c3" rx="8" stroke="#fcd34d" strokeWidth="1"/>
      <text x="130" y="20" textAnchor="middle" fontSize="9" fontWeight="600" fill="#92400e">Investing Emotional Risks:</text>
      <text x="130" y="38" textAnchor="middle" fontSize="8" fill="#78350f">• Panic selling during crashes</text>
      <text x="130" y="52" textAnchor="middle" fontSize="8" fill="#78350f">• Impatience abandoning strategy</text>
    </g>
  </svg>
);

// SVG 6: Same Asset, Different Experience
const SameAssetDifferentExperienceSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Same Asset — Different Experiences</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Two people hold the same asset with completely different journeys</text>
    
    {/* Asset indicator */}
    <g transform="translate(280, 65)">
      <rect x="0" y="0" width="140" height="30" fill="#64748b" rx="6"/>
      <text x="70" y="20" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">📊 Asset XYZ</text>
    </g>
    
    {/* Branching paths */}
    <path d="M350 95 L200 130" fill="none" stroke="#3b82f6" strokeWidth="2"/>
    <path d="M350 95 L500 130" fill="none" stroke="#22c55e" strokeWidth="2"/>
    
    {/* Trader's Experience */}
    <g transform="translate(50, 135)">
      <rect x="0" y="0" width="280" height="180" fill="#dbeafe" rx="12" stroke="#93c5fd" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e40af">⚡ Trader's Experience</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="9" fill="#1e3a8a">Day 1: Bought during dip</text>
        <text x="0" y="18" fontSize="9" fill="#1e3a8a">Day 2: Up slightly — excitement</text>
        <text x="0" y="36" fontSize="9" fill="#dc2626">Day 3: Down sharply — stress</text>
        <text x="0" y="54" fontSize="9" fill="#1e3a8a">Day 4: Recovered — relief</text>
        <text x="0" y="72" fontSize="9" fill="#dc2626">Day 5: Down again — sold in frustration</text>
      </g>
      
      <rect x="20" y="140" width="240" height="30" fill="#fef2f2" rx="6"/>
      <text x="140" y="160" textAnchor="middle" fontSize="9" fill="#dc2626">Result: Emotional rollercoaster, many decisions</text>
    </g>
    
    {/* Investor's Experience */}
    <g transform="translate(370, 135)">
      <rect x="0" y="0" width="280" height="180" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">🌱 Investor's Experience</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="9" fill="#14532d">Month 1: Bought based on thesis</text>
        <text x="0" y="18" fontSize="9" fill="#14532d">Month 2: Checked briefly — fine</text>
        <text x="0" y="36" fontSize="9" fill="#14532d">Month 3: Some volatility — ignored</text>
        <text x="0" y="54" fontSize="9" fill="#14532d">Month 6: Reviewed thesis — still valid</text>
        <text x="0" y="72" fontSize="9" fill="#14532d">Year 1: Gradual progress — satisfied</text>
      </g>
      
      <rect x="20" y="140" width="240" height="30" fill="#f0fdf4" rx="6"/>
      <text x="140" y="160" textAnchor="middle" fontSize="9" fill="#166534">Result: Calm journey, few decisions</text>
    </g>
  </svg>
);

// SVG 7: Neither Is Safer
const NeitherIsSaferSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Neither Approach Is "Safer" By Default</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Both have risks — they're just different kinds of risk</text>
    
    {/* Balance scale visual */}
    <g transform="translate(270, 80)">
      {/* Fulcrum */}
      <polygon points="80,0 70,20 90,20" fill="#64748b"/>
      <line x1="80" y1="20" x2="80" y2="50" stroke="#64748b" strokeWidth="4"/>
      
      {/* Balance beam */}
      <line x1="0" y1="0" x2="160" y2="0" stroke="#64748b" strokeWidth="6" strokeLinecap="round"/>
      
      {/* Trading pan */}
      <g transform="translate(-10, 0)">
        <line x1="10" y1="0" x2="10" y2="30" stroke="#64748b" strokeWidth="2"/>
        <ellipse cx="10" cy="35" rx="40" ry="10" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
        <text x="10" y="60" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1e40af">Trading</text>
      </g>
      
      {/* Investing pan */}
      <g transform="translate(150, 0)">
        <line x1="10" y1="0" x2="10" y2="30" stroke="#64748b" strokeWidth="2"/>
        <ellipse cx="10" cy="35" rx="40" ry="10" fill="#dcfce7" stroke="#22c55e" strokeWidth="2"/>
        <text x="10" y="60" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">Investing</text>
      </g>
    </g>
    
    {/* Risk comparison */}
    <g transform="translate(60, 170)">
      <rect x="0" y="0" width="260" height="90" fill="#dbeafe" rx="10"/>
      <text x="130" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#1e40af">Trading Risks Include:</text>
      <text x="130" y="42" textAnchor="middle" fontSize="8" fill="#1e3a8a">• Compounding small mistakes</text>
      <text x="130" y="56" textAnchor="middle" fontSize="8" fill="#1e3a8a">• Emotional decision fatigue</text>
      <text x="130" y="70" textAnchor="middle" fontSize="8" fill="#1e3a8a">• Overconfidence from short wins</text>
      <text x="130" y="84" textAnchor="middle" fontSize="8" fill="#1e3a8a">• Missing the forest for trees</text>
    </g>
    
    <g transform="translate(380, 170)">
      <rect x="0" y="0" width="260" height="90" fill="#dcfce7" rx="10"/>
      <text x="130" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">Investing Risks Include:</text>
      <text x="130" y="42" textAnchor="middle" fontSize="8" fill="#14532d">• Staying in bad positions too long</text>
      <text x="130" y="56" textAnchor="middle" fontSize="8" fill="#14532d">• Missing warning signs</text>
      <text x="130" y="70" textAnchor="middle" fontSize="8" fill="#14532d">• Confusing patience with stubbornness</text>
      <text x="130" y="84" textAnchor="middle" fontSize="8" fill="#14532d">• Complacency during slow erosion</text>
    </g>
  </svg>
);

// SVG 8: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 200" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="200" fill="#f8fafc" rx="16"/>
    
    {/* Central message */}
    <rect x="50" y="25" width="600" height="150" fill="url(#tradingInvestingGradient)" rx="16"/>
    
    <defs>
      <linearGradient id="tradingInvestingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#059669"/>
        <stop offset="100%" stopColor="#0d9488"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="55" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">🎯 Key Takeaway</text>
    
    <text x="350" y="85" textAnchor="middle" fontSize="11" fill="white">Risk doesn't disappear based on your approach.</text>
    <text x="350" y="107" textAnchor="middle" fontSize="11" fill="white">It transforms. Trading spreads risk across many decisions.</text>
    <text x="350" y="129" textAnchor="middle" fontSize="11" fill="white">Investing concentrates risk in patience and thesis quality.</text>
    <text x="350" y="160" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fef3c7">KNOW YOUR APPROACH. KNOW YOUR RISKS.</text>
  </svg>
);

const RiskLesson6 = () => {
  const navigate = useNavigate();

  const quizQuestions = [
    {
      question: "What is the main difference between trading and investing from a risk perspective?",
      options: [
        "Trading is always riskier than investing",
        "Investing is always riskier than trading",
        "They have different types of risk based on time horizon and decision frequency",
        "There is no risk difference between them"
      ],
      correctAnswer: "They have different types of risk based on time horizon and decision frequency",
      explanation: "Neither is inherently safer — they simply expose you to different kinds of risk. Trading spreads risk across many short-term decisions, while investing concentrates risk in patience and long-term thesis quality."
    },
    {
      question: "Why does the same asset feel more volatile to a trader than to a long-term investor?",
      options: [
        "Because traders buy riskier assets",
        "Because the trader is viewing it through a shorter time lens where daily noise is significant",
        "Because investors don't pay attention to their portfolios",
        "Because trading platforms show different charts"
      ],
      correctAnswer: "Because the trader is viewing it through a shorter time lens where daily noise is significant",
      explanation: "The asset doesn't change — only the lens through which you view it. Short-term views amplify every movement, while long-term views smooth noise into trends."
    }
  ];

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 pt-24 pb-8 px-4">
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
              Lesson 6 of 7
            </span>
            <h1 className="text-3xl font-bold text-gray-800 mt-4">Risk in Trading vs Investing</h1>
            <p className="text-gray-600 mt-2">Understanding how time horizon transforms risk</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Trading and Investing Feel Risky in Different Ways</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Ask a trader what risk feels like, and they might describe the intensity of watching 
              positions move minute by minute, the pressure of making rapid decisions, the 
              emotional highs and lows that can happen in a single day.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Ask a long-term investor the same question, and you'll hear something different — 
              the challenge of sitting still during market crashes, the discipline required to 
              ignore daily noise, the patience tested over months and years.
            </p>
            <p className="text-lg leading-relaxed">
              Both are describing <strong>real risk</strong> — but risk that manifests very 
              differently. This lesson explores how your time horizon and approach fundamentally 
              change the nature of the risks you face. Neither trading nor investing is 
              inherently "safer." They're simply different.
            </p>
          </div>

          <TwoApproachesSVG />
        </div>

        {/* Time Horizon */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Time Horizon Changes Everything</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              The most fundamental difference between trading and investing is <strong>time</strong>. 
              Traders operate in minutes, hours, days, or weeks. Investors think in months, years, 
              or decades. This single difference creates entirely different risk profiles.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              For traders, short-term price movements are the entire game. Every tick matters. 
              Noise isn't filtered out — it's where the action is. This creates risk through 
              constant exposure to randomness and the need for rapid response.
            </p>
            <p className="text-lg leading-relaxed">
              For investors, short-term movements are largely irrelevant. What matters is the 
              long-term direction. Daily volatility is noise to be ignored. The risk shifts 
              to thesis quality and the patience to wait.
            </p>
          </div>

          <TimeHorizonSVG />
        </div>

        {/* Volatility vs Time */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Same Asset, Different Views</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Here's something fascinating: the same asset can feel completely different 
              depending on your time frame. A stock that seems chaotic and unpredictable 
              day-to-day might show a clear trend when viewed over years.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              <strong>The asset hasn't changed. Your lens has.</strong>
            </p>
            <p className="text-lg leading-relaxed">
              This is why traders and investors can look at the exact same chart and reach 
              different conclusions. The trader sees opportunity in every wiggle. The investor 
              sees only the broader direction. Both are valid — but they create different risks.
            </p>
          </div>

          <VolatilityTimeSVG />
        </div>

        {/* Decision Frequency */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Decision Frequency Creates Different Risks</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Traders make many decisions. Each decision is an opportunity to be right — but 
              also an opportunity to make a mistake. The risk of compounding errors is real 
              when you're making dozens or hundreds of choices.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Investors make few decisions. This reduces the chance of frequent errors — but 
              it increases the importance of each individual decision. When you only act a few 
              times per year, getting those moments wrong has larger consequences.
            </p>
            <p className="text-lg leading-relaxed">
              Neither is inherently better. <strong>More decisions spread risk but multiply 
              error opportunities. Fewer decisions concentrate risk but reduce exposure to 
              behavioral mistakes.</strong>
            </p>
          </div>

          <DecisionFrequencySVG />
        </div>

        {/* Emotional Pressure */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Emotional Pressure: Different Patterns</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Trading creates <strong>intense, frequent emotional spikes</strong>. The constant 
              feedback loop of wins and losses generates highs and lows throughout each session. 
              This can lead to emotional exhaustion, overtrading, or revenge trading after losses.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Investing creates <strong>slow-burning emotional tests</strong>. Most days are 
              uneventful, but during market crashes, the pressure to act can become overwhelming. 
              The risk is panic selling at the worst time or abandoning strategy due to impatience.
            </p>
            <p className="text-lg leading-relaxed">
              Both test your emotional discipline — just in different ways. Know which pattern 
              matches your temperament better.
            </p>
          </div>

          <EmotionalPressureSVG />
        </div>

        {/* Same Asset, Different Experience */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Same Asset, Completely Different Journeys</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Imagine two people buy the same asset on the same day. One approaches it as a 
              trade, the other as an investment. Their experiences will be completely different.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The trader will live through every move — excitement when it rises, anxiety when 
              it falls, constant decision-making about whether to stay or exit. Every day brings 
              new emotions and choices.
            </p>
            <p className="text-lg leading-relaxed">
              The investor will barely notice the daily moves. They'll check occasionally, 
              perhaps feel mild concern during broader market stress, but mostly experience 
              patience and waiting. Same asset, entirely different risks experienced.
            </p>
          </div>

          <SameAssetDifferentExperienceSVG />
        </div>

        {/* Neither Is Safer */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Neither Approach Is "Safer" By Default</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              It's tempting to assume one approach is safer than the other. People often say 
              "trading is gambling" or "just invest long-term and you'll be fine." Both 
              oversimplifications miss the truth.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              <strong>Trading risks:</strong> Compounding small mistakes, emotional decision 
              fatigue, overconfidence from short-term wins, missing the big picture while 
              focused on noise.
            </p>
            <p className="text-lg leading-relaxed">
              <strong>Investing risks:</strong> Staying in bad positions too long, missing 
              warning signs while being patient, confusing stubbornness with conviction, 
              complacency during slow erosion of value.
            </p>
          </div>

          <NeitherIsSaferSVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
          
          <div className="mt-6 bg-emerald-50 rounded-xl p-5 border border-emerald-200">
            <p className="text-emerald-800 font-medium">
              Remember: Risk doesn't disappear based on your approach — it transforms. The 
              key is understanding which type of risk you're taking and whether it matches 
              your temperament, time availability, and emotional resilience. There's no 
              universally "right" choice — only the right choice for you.
            </p>
          </div>
        </div>

        {/* India-specific Context */}
        <div className="bg-emerald-50 rounded-2xl p-6 shadow-lg mb-8 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-800 mb-3">🌍 Global Context</h3>
          <p className="text-emerald-900">
            Both trading and investing coexist in every major market worldwide — from New York 
            to London to Tokyo to Mumbai. In India, as in other markets, you'll find active 
            traders navigating daily volatility alongside long-term investors building wealth 
            over decades. The principles in this lesson apply universally. The distinction 
            between trading and investing isn't about geography — it's about time horizon, 
            decision frequency, and the type of risk you're prepared to face.
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
                  Consider which approach better matches your temperament:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">1.</span>
                    <span>Do you prefer quick feedback and resolution, or are you comfortable with delayed gratification and uncertainty over long periods?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">2.</span>
                    <span>How do you typically respond to frequent small setbacks versus rare but significant challenges?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">3.</span>
                    <span>Given your daily life and responsibilities, do you have the time and mental bandwidth for frequent decision-making, or would a more hands-off approach suit you better?</span>
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                  <p className="text-emerald-800 text-sm">
                    <strong>Why this matters:</strong> Choosing an approach that conflicts with 
                    your natural temperament creates additional risk. If you're naturally patient, 
                    trading may cause unnecessary stress. If you crave action, long-term investing 
                    may tempt you into poor decisions out of boredom. Self-awareness is risk management.
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
            <li>• <strong>Time horizon</strong> is the fundamental difference — minutes/days vs months/years</li>
            <li>• The same asset looks different through <strong>different time lenses</strong></li>
            <li>• Trading = <strong>frequent decisions</strong>, many small error opportunities</li>
            <li>• Investing = <strong>rare decisions</strong>, concentrated importance per choice</li>
            <li>• Trading creates <strong>intense emotional spikes</strong>; investing creates <strong>slow-burn patience tests</strong></li>
            <li>• <strong>Neither is inherently safer</strong> — they're different risk profiles</li>
            <li>• Choose the approach that <strong>matches your temperament</strong></li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/risk-lesson-5')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-colors"
          >
            <FaArrowLeft />
            <span>Previous Lesson</span>
          </button>
          <button
            onClick={() => navigate('/learn/risk-lesson-7')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl transition-colors"
          >
            <span>Next Lesson</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default RiskLesson6;
