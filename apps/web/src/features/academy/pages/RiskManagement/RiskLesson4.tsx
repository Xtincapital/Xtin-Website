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

// SVG 1: What Is Position Size
const WhatIsPositionSizeSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">What Is Position Size?</text>
    <text x="350" y="50" textAnchor="middle" fontSize="10" fill="#64748b">How much of your capital is committed to a single idea</text>
    
    {/* Total Capital Box */}
    <g transform="translate(100, 80)">
      <rect x="0" y="0" width="500" height="80" fill="#dbeafe" rx="12" stroke="#3b82f6" strokeWidth="2"/>
      <text x="250" y="35" textAnchor="middle" fontSize="12" fontWeight="600" fill="#1e40af">YOUR TOTAL CAPITAL</text>
      <text x="250" y="55" textAnchor="middle" fontSize="10" fill="#1e40af">Everything you have available to invest or trade</text>
    </g>
    
    {/* Position Size Slice */}
    <g transform="translate(100, 180)">
      <rect x="0" y="0" width="150" height="80" fill="#059669" rx="12" stroke="#047857" strokeWidth="3"/>
      <text x="75" y="35" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">Position</text>
      <text x="75" y="52" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">Size</text>
      
      {/* Remaining capital */}
      <rect x="160" y="0" width="340" height="80" fill="#e2e8f0" rx="12" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4"/>
      <text x="330" y="35" textAnchor="middle" fontSize="10" fill="#64748b">Remaining Capital</text>
      <text x="330" y="52" textAnchor="middle" fontSize="9" fill="#64748b">(Not exposed to this idea)</text>
    </g>
    
    {/* Arrow and label */}
    <g transform="translate(175, 165)">
      <line x1="0" y1="0" x2="0" y2="15" stroke="#059669" strokeWidth="2"/>
      <polygon points="-5,12 0,22 5,12" fill="#059669"/>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="270" width="500" height="22" fill="#1e293b" rx="5"/>
    <text x="350" y="285" textAnchor="middle" fontSize="9" fill="white">Position size = how much you're risking on ONE decision</text>
  </svg>
);

// SVG 2: Small vs Large Position
const SmallVsLargeSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Small Position vs Large Position</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">The same idea, different exposure levels</text>
    
    {/* Small Position */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="280" height="200" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">Small Position</text>
      
      {/* Capital bar */}
      <rect x="20" y="50" width="240" height="40" fill="#e2e8f0" rx="6" stroke="#94a3b8" strokeWidth="1"/>
      <rect x="20" y="50" width="50" height="40" fill="#22c55e" rx="6"/>
      <text x="45" y="75" textAnchor="middle" fontSize="8" fill="white" fontWeight="600">Exposed</text>
      <text x="160" y="75" textAnchor="middle" fontSize="8" fill="#64748b">Protected</text>
      
      {/* If wrong scenario */}
      <text x="140" y="115" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">If the idea is wrong:</text>
      <rect x="40" y="125" width="200" height="55" fill="#f0fdf4" rx="6"/>
      <text x="140" y="145" textAnchor="middle" fontSize="8" fill="#14532d">• Small loss to capital</text>
      <text x="140" y="160" textAnchor="middle" fontSize="8" fill="#14532d">• Plenty left to continue</text>
      <text x="140" y="175" textAnchor="middle" fontSize="8" fill="#14532d">• Can try again</text>
    </g>
    
    {/* Large Position */}
    <g transform="translate(370, 75)">
      <rect x="0" y="0" width="280" height="200" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">Large Position</text>
      
      {/* Capital bar */}
      <rect x="20" y="50" width="240" height="40" fill="#e2e8f0" rx="6" stroke="#94a3b8" strokeWidth="1"/>
      <rect x="20" y="50" width="190" height="40" fill="#ef4444" rx="6"/>
      <text x="115" y="75" textAnchor="middle" fontSize="8" fill="white" fontWeight="600">Exposed</text>
      <text x="235" y="75" textAnchor="middle" fontSize="7" fill="#64748b">Left</text>
      
      {/* If wrong scenario */}
      <text x="140" y="115" textAnchor="middle" fontSize="9" fontWeight="600" fill="#dc2626">If the idea is wrong:</text>
      <rect x="40" y="125" width="200" height="55" fill="#fef2f2" rx="6"/>
      <text x="140" y="145" textAnchor="middle" fontSize="8" fill="#991b1b">• Major loss to capital</text>
      <text x="140" y="160" textAnchor="middle" fontSize="8" fill="#991b1b">• Recovery becomes difficult</text>
      <text x="140" y="175" textAnchor="middle" fontSize="8" fill="#991b1b">• May be eliminated</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="285" width="500" height="25" fill="#1e293b" rx="6"/>
    <text x="350" y="302" textAnchor="middle" fontSize="9" fill="white">Same idea. Different position sizes. Completely different outcomes.</text>
  </svg>
);

// SVG 3: Exposure Determines Survival
const ExposureSurvivalSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Exposure Determines Survival</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">It's not about being right — it's about surviving when you're wrong</text>
    
    {/* Two paths visualization */}
    <g transform="translate(350, 170)">
      {/* Starting point */}
      <circle cx="0" cy="-80" r="25" fill="#6366f1" stroke="#4f46e5" strokeWidth="3"/>
      <text x="0" y="-83" textAnchor="middle" fontSize="8" fill="white">Same</text>
      <text x="0" y="-73" textAnchor="middle" fontSize="8" fill="white">Idea</text>
      
      {/* Branching paths */}
      <path d="M-15 -55 Q-100 -20 -150 40" fill="none" stroke="#22c55e" strokeWidth="3"/>
      <path d="M15 -55 Q100 -20 150 40" fill="none" stroke="#ef4444" strokeWidth="3"/>
      
      {/* Small exposure outcome */}
      <g transform="translate(-150, 50)">
        <circle cx="0" cy="0" r="35" fill="#dcfce7" stroke="#22c55e" strokeWidth="3"/>
        <text x="0" y="-8" textAnchor="middle" fontSize="8" fontWeight="600" fill="#166534">Small</text>
        <text x="0" y="5" textAnchor="middle" fontSize="8" fontWeight="600" fill="#166534">Exposure</text>
        <text x="0" y="20" textAnchor="middle" fontSize="7" fill="#14532d">Survives</text>
      </g>
      
      {/* Large exposure outcome */}
      <g transform="translate(150, 50)">
        <circle cx="0" cy="0" r="35" fill="#fef2f2" stroke="#ef4444" strokeWidth="3"/>
        <text x="0" y="-8" textAnchor="middle" fontSize="8" fontWeight="600" fill="#dc2626">Large</text>
        <text x="0" y="5" textAnchor="middle" fontSize="8" fontWeight="600" fill="#dc2626">Exposure</text>
        <text x="0" y="20" textAnchor="middle" fontSize="7" fill="#991b1b">Eliminated</text>
      </g>
      
      {/* Labels */}
      <text x="-150" y="100" textAnchor="middle" fontSize="8" fill="#166534">Still in the game</text>
      <text x="150" y="100" textAnchor="middle" fontSize="8" fill="#dc2626">Game over</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="265" width="500" height="25" fill="#059669" rx="6"/>
    <text x="350" y="282" textAnchor="middle" fontSize="9" fill="white">When both are wrong, only the smaller exposure survives to try again.</text>
  </svg>
);

// SVG 4: Why Same Ideas Have Different Results
const SameIdeaDifferentResultsSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Why Identical Ideas Produce Different Results</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">The idea is the same — the outcome depends on position size</text>
    
    {/* Three investors with same idea */}
    <g transform="translate(50, 70)">
      {/* Shared idea */}
      <rect x="200" y="0" width="200" height="40" fill="#6366f1" rx="8"/>
      <text x="300" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">💡 The Same Investment Idea</text>
    </g>
    
    {/* Three outcomes */}
    <g transform="translate(50, 130)">
      {/* Investor A - Conservative */}
      <rect x="0" y="0" width="180" height="140" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="2"/>
      <text x="90" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">Investor A</text>
      <text x="90" y="42" textAnchor="middle" fontSize="8" fill="#14532d">Small position</text>
      
      <rect x="15" y="55" width="150" height="25" fill="#e2e8f0" rx="4"/>
      <rect x="15" y="55" width="30" height="25" fill="#22c55e" rx="4"/>
      
      <text x="90" y="100" textAnchor="middle" fontSize="8" fill="#166534">If wrong:</text>
      <text x="90" y="115" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">Minor setback</text>
      <text x="90" y="130" textAnchor="middle" fontSize="8" fill="#14532d">Continues investing</text>
    </g>
    
    <g transform="translate(260, 130)">
      {/* Investor B - Moderate */}
      <rect x="0" y="0" width="180" height="140" fill="#fef9c3" rx="10" stroke="#fcd34d" strokeWidth="2"/>
      <text x="90" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#a16207">Investor B</text>
      <text x="90" y="42" textAnchor="middle" fontSize="8" fill="#92400e">Medium position</text>
      
      <rect x="15" y="55" width="150" height="25" fill="#e2e8f0" rx="4"/>
      <rect x="15" y="55" width="75" height="25" fill="#eab308" rx="4"/>
      
      <text x="90" y="100" textAnchor="middle" fontSize="8" fill="#a16207">If wrong:</text>
      <text x="90" y="115" textAnchor="middle" fontSize="9" fontWeight="600" fill="#a16207">Significant hit</text>
      <text x="90" y="130" textAnchor="middle" fontSize="8" fill="#92400e">Recovery needed</text>
    </g>
    
    <g transform="translate(470, 130)">
      {/* Investor C - Aggressive */}
      <rect x="0" y="0" width="180" height="140" fill="#fef2f2" rx="10" stroke="#fca5a5" strokeWidth="2"/>
      <text x="90" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">Investor C</text>
      <text x="90" y="42" textAnchor="middle" fontSize="8" fill="#991b1b">Large position</text>
      
      <rect x="15" y="55" width="150" height="25" fill="#e2e8f0" rx="4"/>
      <rect x="15" y="55" width="135" height="25" fill="#ef4444" rx="4"/>
      
      <text x="90" y="100" textAnchor="middle" fontSize="8" fill="#dc2626">If wrong:</text>
      <text x="90" y="115" textAnchor="middle" fontSize="9" fontWeight="600" fill="#dc2626">Devastating loss</text>
      <text x="90" y="130" textAnchor="middle" fontSize="8" fill="#991b1b">May not recover</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="285" width="500" height="25" fill="#1e293b" rx="6"/>
    <text x="350" y="302" textAnchor="middle" fontSize="9" fill="white">Same idea, same outcome — but different consequences based on exposure.</text>
  </svg>
);

// SVG 5: Exposure Control vs Prediction
const ExposureVsPredictionSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Exposure Control vs Prediction</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">You can't control outcomes, but you can control exposure</text>
    
    {/* Left: Prediction (uncontrollable) */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="280" height="170" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">❌ Prediction</text>
      <text x="140" y="45" textAnchor="middle" fontSize="9" fill="#991b1b">(Cannot be controlled)</text>
      
      {/* Question marks showing uncertainty */}
      <g transform="translate(140, 100)">
        <text x="-60" y="0" fontSize="30" fill="#fca5a5">?</text>
        <text x="0" y="0" fontSize="30" fill="#fca5a5">?</text>
        <text x="60" y="0" fontSize="30" fill="#fca5a5">?</text>
      </g>
      
      <text x="140" y="145" textAnchor="middle" fontSize="8" fill="#7f1d1d">• Markets are unpredictable</text>
      <text x="140" y="160" textAnchor="middle" fontSize="8" fill="#7f1d1d">• News is unknowable in advance</text>
    </g>
    
    {/* Right: Exposure (controllable) */}
    <g transform="translate(370, 80)">
      <rect x="0" y="0" width="280" height="170" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">✓ Exposure Control</text>
      <text x="140" y="45" textAnchor="middle" fontSize="9" fill="#14532d">(Completely in your hands)</text>
      
      {/* Slider showing control */}
      <g transform="translate(40, 75)">
        <rect x="0" y="0" width="200" height="12" fill="#e2e8f0" rx="6"/>
        <rect x="0" y="0" width="80" height="12" fill="#22c55e" rx="6"/>
        <circle cx="80" cy="6" r="10" fill="#22c55e" stroke="white" strokeWidth="2"/>
        <text x="100" y="35" textAnchor="middle" fontSize="8" fill="#166534">You decide how much</text>
      </g>
      
      <text x="140" y="135" textAnchor="middle" fontSize="8" fill="#14532d">• You choose position size</text>
      <text x="140" y="150" textAnchor="middle" fontSize="8" fill="#14532d">• You determine maximum loss</text>
      <text x="140" y="165" textAnchor="middle" fontSize="8" fill="#14532d">• You control survival</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="265" width="500" height="25" fill="#059669" rx="6"/>
    <text x="350" y="282" textAnchor="middle" fontSize="9" fill="white">Focus on what you CAN control: how much you risk, not what the market does.</text>
  </svg>
);

// SVG 6: Capital Impact Comparison
const CapitalImpactSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Impact on Capital: Before and After</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">What happens to your capital when an idea goes wrong</text>
    
    {/* Small Position Impact */}
    <g transform="translate(50, 75)">
      <text x="140" y="0" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">Small Position</text>
      
      {/* Before */}
      <text x="35" y="25" fontSize="8" fill="#64748b">Before:</text>
      <rect x="70" y="15" width="180" height="30" fill="#22c55e" rx="4"/>
      <text x="160" y="35" textAnchor="middle" fontSize="9" fill="white" fontWeight="600">Full Capital</text>
      
      {/* Arrow */}
      <text x="160" y="65" textAnchor="middle" fontSize="12" fill="#64748b">↓</text>
      
      {/* After */}
      <text x="35" y="95" fontSize="8" fill="#64748b">After:</text>
      <rect x="70" y="85" width="160" height="30" fill="#22c55e" rx="4"/>
      <rect x="230" y="85" width="20" height="30" fill="#fca5a5" rx="4"/>
      <text x="150" y="105" textAnchor="middle" fontSize="8" fill="white" fontWeight="600">Most capital intact</text>
      
      <text x="160" y="135" textAnchor="middle" fontSize="9" fill="#166534">✓ Minor damage, still strong</text>
    </g>
    
    {/* Large Position Impact */}
    <g transform="translate(380, 75)">
      <text x="140" y="0" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">Large Position</text>
      
      {/* Before */}
      <text x="35" y="25" fontSize="8" fill="#64748b">Before:</text>
      <rect x="70" y="15" width="180" height="30" fill="#22c55e" rx="4"/>
      <text x="160" y="35" textAnchor="middle" fontSize="9" fill="white" fontWeight="600">Full Capital</text>
      
      {/* Arrow */}
      <text x="160" y="65" textAnchor="middle" fontSize="12" fill="#64748b">↓</text>
      
      {/* After */}
      <text x="35" y="95" fontSize="8" fill="#64748b">After:</text>
      <rect x="70" y="85" width="50" height="30" fill="#22c55e" rx="4"/>
      <rect x="120" y="85" width="130" height="30" fill="#ef4444" rx="4"/>
      <text x="95" y="105" textAnchor="middle" fontSize="7" fill="white">Left</text>
      <text x="185" y="105" textAnchor="middle" fontSize="8" fill="white" fontWeight="600">Lost</text>
      
      <text x="160" y="135" textAnchor="middle" fontSize="9" fill="#dc2626">✗ Severe damage, recovery uncertain</text>
    </g>
    
    {/* Visual comparison bars */}
    <g transform="translate(100, 195)">
      <text x="0" y="0" fontSize="10" fontWeight="600" fill="#334155">What remains after the same failed idea:</text>
      
      {/* Small position result */}
      <rect x="0" y="20" width="400" height="25" fill="#22c55e" rx="4"/>
      <text x="10" y="37" fontSize="9" fill="white" fontWeight="600">Small position: Most capital preserved</text>
      
      {/* Large position result */}
      <rect x="0" y="55" width="100" height="25" fill="#ef4444" rx="4"/>
      <text x="10" y="72" fontSize="9" fill="white" fontWeight="600">Large position</text>
      <rect x="110" y="55" width="290" height="25" fill="#fef2f2" rx="4" stroke="#fca5a5" strokeWidth="1" strokeDasharray="4"/>
      <text x="255" y="72" textAnchor="middle" fontSize="9" fill="#dc2626">← This is what was lost</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="285" width="500" height="25" fill="#1e293b" rx="6"/>
    <text x="350" y="302" textAnchor="middle" fontSize="9" fill="white">The same mistake has vastly different consequences depending on position size.</text>
  </svg>
);

// SVG 7: The Tale of Two Traders
const TwoTradersStorySVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">A Tale of Two Traders</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Same opportunity, same outcome, different stories</text>
    
    {/* Scene 1: Both see opportunity */}
    <g transform="translate(50, 70)">
      <rect x="0" y="0" width="600" height="50" fill="#dbeafe" rx="8"/>
      <text x="300" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#1e40af">Scene 1: Both traders see the same promising opportunity</text>
      <text x="300" y="40" textAnchor="middle" fontSize="9" fill="#1e40af">They both decide to invest. They both believe in the idea.</text>
    </g>
    
    {/* Scene 2: Different choices */}
    <g transform="translate(50, 135)">
      <rect x="0" y="0" width="290" height="70" fill="#dcfce7" rx="8" stroke="#86efac" strokeWidth="2"/>
      <text x="145" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">Trader A: Small Position</text>
      <text x="145" y="42" textAnchor="middle" fontSize="8" fill="#14532d">"I'll commit a portion I can afford to lose"</text>
      <text x="145" y="58" textAnchor="middle" fontSize="8" fill="#14532d">"This way I stay safe if I'm wrong"</text>
      
      <rect x="310" y="0" width="290" height="70" fill="#fef2f2" rx="8" stroke="#fca5a5" strokeWidth="2"/>
      <text x="455" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">Trader B: Large Position</text>
      <text x="455" y="42" textAnchor="middle" fontSize="8" fill="#991b1b">"I'm confident, so I'll go big"</text>
      <text x="455" y="58" textAnchor="middle" fontSize="8" fill="#991b1b">"Maximum exposure for maximum gain"</text>
    </g>
    
    {/* Scene 3: Outcome */}
    <g transform="translate(50, 220)">
      <rect x="0" y="0" width="600" height="40" fill="#fef3c7" rx="8"/>
      <text x="300" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#92400e">Scene 3: The idea turns out to be wrong. Both lose.</text>
    </g>
    
    {/* Scene 4: Aftermath */}
    <g transform="translate(50, 275)">
      <rect x="0" y="0" width="290" height="50" fill="#22c55e" rx="8"/>
      <text x="145" y="20" textAnchor="middle" fontSize="9" fontWeight="600" fill="white">Trader A: Small loss, moves on</text>
      <text x="145" y="38" textAnchor="middle" fontSize="8" fill="white">"Lesson learned, capital intact"</text>
      
      <rect x="310" y="0" width="290" height="50" fill="#ef4444" rx="8"/>
      <text x="455" y="20" textAnchor="middle" fontSize="9" fontWeight="600" fill="white">Trader B: Devastating loss</text>
      <text x="455" y="38" textAnchor="middle" fontSize="8" fill="white">"I'm struggling to recover"</text>
    </g>
  </svg>
);

// SVG 8: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 200" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="200" fill="#f8fafc" rx="16"/>
    
    {/* Central message */}
    <rect x="50" y="25" width="600" height="150" fill="url(#positionGradient)" rx="16"/>
    
    <defs>
      <linearGradient id="positionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#059669"/>
        <stop offset="100%" stopColor="#0d9488"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="60" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">⚖️ Key Takeaway</text>
    
    <text x="350" y="95" textAnchor="middle" fontSize="11" fill="white">Position size is not about being conservative or aggressive.</text>
    <text x="350" y="115" textAnchor="middle" fontSize="11" fill="white">It's about ensuring that being wrong doesn't end your journey.</text>
    <text x="350" y="150" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fef3c7">SMALL LOSSES PRESERVE OPPORTUNITY.</text>
  </svg>
);

const RiskLesson4 = () => {
  const navigate = useNavigate();

  const quizQuestions = [
    {
      question: "What does 'position size' refer to in investing?",
      options: [
        "The total amount of money you have",
        "How much of your capital you commit to a single idea or investment",
        "The number of different investments you own",
        "How long you hold an investment"
      ],
      correctAnswer: "How much of your capital you commit to a single idea or investment",
      explanation: "Position size is your exposure to any single investment — the portion of your total capital at risk in one decision."
    },
    {
      question: "Why can two investors with the same idea have completely different outcomes?",
      options: [
        "Because they're using different platforms",
        "Because the market treats them differently",
        "Because their position sizes determine how much they lose when the idea is wrong",
        "Because one is luckier than the other"
      ],
      correctAnswer: "Because their position sizes determine how much they lose when the idea is wrong",
      explanation: "When an idea fails, the investor with a small position loses little and continues; the one with a large position may be severely damaged or eliminated."
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
              Lesson 4 of 7
            </span>
            <h1 className="text-3xl font-bold text-gray-800 mt-4">Position Sizing – Conceptual Understanding</h1>
            <p className="text-gray-600 mt-2">How exposure determines survival</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Position Size Determines Risk</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Here's a truth that surprises many people: <strong>how much you risk matters more 
              than how often you're right</strong>. A trader who is right most of the time can 
              still be destroyed by one oversized position. A trader who is wrong frequently can 
              still prosper if they keep their losses small.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              This is the power of position sizing — the practice of controlling how much of your 
              capital you commit to any single idea. It's not about predicting outcomes. It's 
              about surviving when predictions go wrong.
            </p>
            <p className="text-lg leading-relaxed">
              In this lesson, we'll explore what position sizing means, why identical ideas can 
              lead to vastly different results, and why exposure control — not prediction — is 
              the key to long-term survival.
            </p>
          </div>

          <WhatIsPositionSizeSVG />
        </div>

        {/* What Position Sizing Means */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">What Position Sizing Means</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Position size is simply <strong>how much of your total capital you put into any 
              single investment or trade</strong>. Think of it as your exposure to one idea.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              If you have a total capital base and you commit a portion of it to one investment, 
              that portion is your position size for that investment. The rest of your capital 
              remains protected — not exposed to that particular idea's outcome.
            </p>
            <p className="text-lg leading-relaxed">
              A <strong>small position</strong> means only a fraction of your capital is at risk. 
              A <strong>large position</strong> means most or all of your capital is exposed to 
              a single idea. The difference between these two approaches defines your risk profile 
              more than any other decision you make.
            </p>
          </div>

          <SmallVsLargeSVG />
        </div>

        {/* Exposure Determines Survival */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Exposure Determines Survival</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Every investment idea can be right or wrong. We don't control that. What we control 
              is <strong>what happens to us when we're wrong</strong>.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              With a small position, being wrong means a small loss. You're disappointed, maybe 
              humbled, but you're still standing. You still have capital. You can try again, 
              learn from the experience, and continue participating in the market.
            </p>
            <p className="text-lg leading-relaxed">
              With a large position, being wrong can mean devastation. The loss isn't just 
              painful — it may be disabling. Recovery becomes a long, difficult road. In extreme 
              cases, it means elimination from the game entirely. This is why exposure — not 
              prediction — determines survival.
            </p>
          </div>

          <ExposureSurvivalSVG />
        </div>

        {/* Same Ideas, Different Results */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Identical Ideas Produce Different Results</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Imagine three investors who all have the same investment idea. They all buy the 
              same thing, at the same time, with the same expectations. The idea turns out to 
              be wrong — the investment declines.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              One investor committed a small portion of their capital. They experience a minor 
              setback and move on. Another committed a moderate amount. They face a significant 
              hit that requires time to recover. The third committed most of their capital. 
              They're severely damaged — possibly unable to continue.
            </p>
            <p className="text-lg leading-relaxed">
              <strong>Same idea. Same outcome. Completely different consequences.</strong> The 
              difference was not in their analysis or timing. The difference was in their 
              position sizes. This is why risk management focuses on exposure, not prediction.
            </p>
          </div>

          <SameIdeaDifferentResultsSVG />
        </div>

        {/* Exposure Control vs Prediction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Exposure Control vs Prediction</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              There's a fundamental difference between prediction and exposure control. 
              <strong>Prediction is about guessing what will happen. Exposure control is about 
              managing what happens to you regardless of the outcome.</strong>
            </p>
            <p className="text-lg leading-relaxed mb-4">
              You cannot control whether an investment goes up or down. You cannot control 
              economic events, company decisions, or market sentiment. These are outside your 
              power.
            </p>
            <p className="text-lg leading-relaxed">
              What you <em>can</em> control is how much of your capital is exposed to any 
              single outcome. You decide position size. You determine maximum possible loss. 
              You choose whether a wrong prediction will be a minor inconvenience or a major 
              catastrophe. This is where your real power lies.
            </p>
          </div>

          <ExposureVsPredictionSVG />
        </div>

        {/* Capital Impact */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">The Impact on Your Capital</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Let's visualize what happens to capital when an idea goes wrong, depending on 
              position size.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              With a small position, most of your capital remains intact even after a complete 
              failure. You've lost something, but the majority is preserved. You retain your 
              ability to continue, to compound, to participate in future opportunities.
            </p>
            <p className="text-lg leading-relaxed">
              With a large position, a failure can wipe out most of what you have. Even if you 
              don't lose everything, you're left in a weakened state. The same future opportunity 
              that could help the first investor compound their remaining capital is much less 
              impactful for you because you have so much less to work with.
            </p>
          </div>

          <CapitalImpactSVG />
        </div>

        {/* Practical Example */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">A Practical Example: Two Traders, One Idea</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Consider this scenario: Two traders both identify what they believe is an excellent 
              opportunity. They both analyze it carefully. They both have conviction. They both 
              invest.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Trader A decides to commit a small portion of their capital. "I believe in this," 
              they think, "but I could be wrong. I'll risk an amount I can afford to lose."
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Trader B decides to go big. "I'm confident," they reason. "Why limit my gains 
              when I'm sure about this?"
            </p>
            <p className="text-lg leading-relaxed">
              The idea turns out to be wrong. Both traders lose. But Trader A walks away with 
              a minor setback and a lesson learned. Trader B faces a devastating loss that may 
              take years to recover from — if they recover at all. Same idea. Same outcome. 
              Completely different stories.
            </p>
          </div>

          <TwoTradersStorySVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
          
          <div className="mt-6 bg-emerald-50 rounded-xl p-5 border border-emerald-200">
            <p className="text-emerald-800 font-medium">
              Remember: Position sizing isn't about being timid or lacking conviction. It's 
              about recognizing that every idea can fail, and designing your approach so that 
              failure doesn't end your ability to succeed in the future.
            </p>
          </div>
        </div>

        {/* India-specific Context */}
        <div className="bg-emerald-50 rounded-2xl p-6 shadow-lg mb-8 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-800 mb-3">🌍 Global Context</h3>
          <p className="text-emerald-900">
            Exposure control is a universal principle that applies to every market in the world. 
            Whether you're investing in the United States, Europe, Japan, or India, the mathematics 
            of position sizing remain the same. A large position that goes wrong will damage capital 
            equally in New York, London, or Mumbai. The specific investments may differ, but the 
            principle is constant: control your exposure to survive and thrive over the long term.
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
                  Think honestly about your current investment or trading approach:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">1.</span>
                    <span>Do you have any single position that represents a large portion of your total capital? How would you feel if it dropped significantly?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">2.</span>
                    <span>When you've been confident about an idea in the past, did you increase your position size? What happened?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">3.</span>
                    <span>Where might you currently be overexposed without realizing it? Consider individual investments, sectors, or asset types.</span>
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                  <p className="text-emerald-800 text-sm">
                    <strong>Purpose:</strong> This isn't about judging your past decisions. It's 
                    about developing awareness of how position sizing affects your risk, so you 
                    can make more intentional choices going forward.
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
            <li>• <strong>Position size</strong> is how much capital you expose to any single idea</li>
            <li>• <strong>Small positions</strong> limit damage; <strong>large positions</strong> amplify damage</li>
            <li>• Identical ideas can produce completely different outcomes based on exposure</li>
            <li>• You can't control predictions, but you CAN control position size</li>
            <li>• Exposure determines survival — small losses preserve opportunity</li>
            <li>• Risk management is about surviving when you're wrong, not just profiting when you're right</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/risk-lesson-3')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-colors"
          >
            <FaArrowLeft />
            <span>Previous Lesson</span>
          </button>
          <button
            onClick={() => navigate('/learn/risk-lesson-5')}
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

export default RiskLesson4;
