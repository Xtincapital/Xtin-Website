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

// SVG 1: Three Layers of Risk
const ThreeLayersOfRiskSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">The Three Layers of Risk</text>
    <text x="350" y="50" textAnchor="middle" fontSize="10" fill="#64748b">Every investment decision involves multiple risk dimensions</text>
    
    {/* Concentric circles showing layers */}
    <g transform="translate(350, 185)">
      {/* Outer layer - Market Risk */}
      <ellipse cx="0" cy="0" rx="200" ry="120" fill="#dbeafe" stroke="#3b82f6" strokeWidth="3"/>
      <text x="0" y="-95" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e40af">MARKET RISK</text>
      <text x="0" y="-80" textAnchor="middle" fontSize="8" fill="#1e40af">Price movements • Volatility • External forces</text>
      
      {/* Middle layer - System Risk */}
      <ellipse cx="0" cy="0" rx="130" ry="75" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3"/>
      <text x="0" y="-50" textAnchor="middle" fontSize="11" fontWeight="600" fill="#b45309">SYSTEM RISK</text>
      <text x="0" y="-35" textAnchor="middle" fontSize="8" fill="#b45309">Tools • Execution • Process</text>
      
      {/* Inner layer - Emotional Risk */}
      <ellipse cx="0" cy="0" rx="60" ry="35" fill="#fce7f3" stroke="#ec4899" strokeWidth="3"/>
      <text x="0" y="-5" textAnchor="middle" fontSize="10" fontWeight="600" fill="#be185d">EMOTIONAL</text>
      <text x="0" y="10" textAnchor="middle" fontSize="10" fontWeight="600" fill="#be185d">RISK</text>
      <text x="0" y="25" textAnchor="middle" fontSize="7" fill="#be185d">You</text>
    </g>
    
    {/* Legend */}
    <g transform="translate(50, 280)">
      <rect x="0" y="0" width="600" height="30" fill="#1e293b" rx="6"/>
      <circle cx="100" cy="15" r="6" fill="#3b82f6"/>
      <text x="115" y="19" fontSize="8" fill="white">Visible on charts</text>
      <circle cx="280" cy="15" r="6" fill="#f59e0b"/>
      <text x="295" y="19" fontSize="8" fill="white">Hidden in process</text>
      <circle cx="460" cy="15" r="6" fill="#ec4899"/>
      <text x="475" y="19" fontSize="8" fill="white">Inside your mind</text>
    </g>
  </svg>
);

// SVG 2: Market Risk Explained
const MarketRiskSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Market Risk: The Visible Risk</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">What most people think of when they hear "risk"</text>
    
    {/* Chart visualization */}
    <g transform="translate(100, 70)">
      <rect x="0" y="0" width="500" height="150" fill="#eff6ff" rx="8" stroke="#bfdbfe" strokeWidth="1"/>
      
      {/* Price line with volatility */}
      <path d="M30 100 L80 80 L130 110 L180 60 L230 90 L280 40 L330 120 L380 70 L430 85 L470 50" 
            fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
      
      {/* Downward arrow showing risk */}
      <g transform="translate(330, 90)">
        <line x1="0" y1="0" x2="0" y2="40" stroke="#ef4444" strokeWidth="3"/>
        <polygon points="-8,35 0,50 8,35" fill="#ef4444"/>
        <text x="15" y="30" fontSize="8" fill="#dc2626">Price drops</text>
      </g>
      
      {/* Upward arrow */}
      <g transform="translate(180, 90)">
        <line x1="0" y1="30" x2="0" y2="-10" stroke="#22c55e" strokeWidth="3"/>
        <polygon points="-8,-5 0,-20 8,-5" fill="#22c55e"/>
        <text x="15" y="10" fontSize="8" fill="#16a34a">Price rises</text>
      </g>
      
      {/* Y-axis label */}
      <text x="15" y="75" fontSize="8" fill="#64748b" transform="rotate(-90 15 75)">Price</text>
      
      {/* X-axis label */}
      <text x="250" y="145" textAnchor="middle" fontSize="8" fill="#64748b">Time</text>
    </g>
    
    {/* Examples */}
    <g transform="translate(50, 235)">
      <text x="0" y="0" fontSize="9" fontWeight="600" fill="#1e40af">Examples:</text>
      <text x="70" y="0" fontSize="9" fill="#334155">Economic news • Company earnings • Interest rate changes • Global events • Sector movements</text>
    </g>
    
    {/* Key insight */}
    <rect x="50" y="250" width="600" height="20" fill="#dbeafe" rx="4"/>
    <text x="350" y="264" textAnchor="middle" fontSize="8" fill="#1e40af">Market risk is external — you cannot control it, only respond to it.</text>
  </svg>
);

// SVG 3: System Risk Explained
const SystemRiskSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">System Risk: The Hidden Risk</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Risks in processes, tools, and execution that don't appear on price charts</text>
    
    {/* Process flow with failure points */}
    <g transform="translate(50, 80)">
      {/* Step 1: Decision */}
      <rect x="0" y="30" width="100" height="60" fill="#dcfce7" rx="8" stroke="#86efac" strokeWidth="2"/>
      <text x="50" y="55" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">Decision</text>
      <text x="50" y="70" textAnchor="middle" fontSize="7" fill="#166534">Make a choice</text>
      
      {/* Arrow 1 */}
      <line x1="105" y1="60" x2="140" y2="60" stroke="#94a3b8" strokeWidth="2"/>
      <polygon points="138,55 150,60 138,65" fill="#94a3b8"/>
      
      {/* Step 2: Platform */}
      <rect x="150" y="30" width="100" height="60" fill="#fef3c7" rx="8" stroke="#fcd34d" strokeWidth="2"/>
      <text x="200" y="55" textAnchor="middle" fontSize="9" fontWeight="600" fill="#b45309">Platform</text>
      <text x="200" y="70" textAnchor="middle" fontSize="7" fill="#b45309">Submit order</text>
      
      {/* Failure indicator */}
      <circle cx="250" cy="30" r="12" fill="#fef2f2" stroke="#ef4444" strokeWidth="2"/>
      <text x="250" y="35" textAnchor="middle" fontSize="10" fill="#ef4444">!</text>
      <text x="250" y="15" fontSize="6" fill="#dc2626">App crash?</text>
      
      {/* Arrow 2 */}
      <line x1="255" y1="60" x2="290" y2="60" stroke="#94a3b8" strokeWidth="2"/>
      <polygon points="288,55 300,60 288,65" fill="#94a3b8"/>
      
      {/* Step 3: Network */}
      <rect x="300" y="30" width="100" height="60" fill="#fef3c7" rx="8" stroke="#fcd34d" strokeWidth="2"/>
      <text x="350" y="55" textAnchor="middle" fontSize="9" fontWeight="600" fill="#b45309">Network</text>
      <text x="350" y="70" textAnchor="middle" fontSize="7" fill="#b45309">Transmit data</text>
      
      {/* Failure indicator */}
      <circle cx="400" cy="30" r="12" fill="#fef2f2" stroke="#ef4444" strokeWidth="2"/>
      <text x="400" y="35" textAnchor="middle" fontSize="10" fill="#ef4444">!</text>
      <text x="400" y="15" fontSize="6" fill="#dc2626">Slow/offline?</text>
      
      {/* Arrow 3 */}
      <line x1="405" y1="60" x2="440" y2="60" stroke="#94a3b8" strokeWidth="2"/>
      <polygon points="438,55 450,60 438,65" fill="#94a3b8"/>
      
      {/* Step 4: Exchange */}
      <rect x="450" y="30" width="100" height="60" fill="#fef3c7" rx="8" stroke="#fcd34d" strokeWidth="2"/>
      <text x="500" y="55" textAnchor="middle" fontSize="9" fontWeight="600" fill="#b45309">Exchange</text>
      <text x="500" y="70" textAnchor="middle" fontSize="7" fill="#b45309">Execute trade</text>
      
      {/* Failure indicator */}
      <circle cx="550" cy="30" r="12" fill="#fef2f2" stroke="#ef4444" strokeWidth="2"/>
      <text x="550" y="35" textAnchor="middle" fontSize="10" fill="#ef4444">!</text>
      <text x="550" y="15" fontSize="6" fill="#dc2626">Delayed?</text>
    </g>
    
    {/* System risk categories */}
    <g transform="translate(50, 180)">
      <rect x="0" y="0" width="190" height="70" fill="#fef9c3" rx="8" stroke="#fcd34d" strokeWidth="1"/>
      <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#b45309">Technology Failures</text>
      <text x="95" y="38" textAnchor="middle" fontSize="7" fill="#78350f">App crashes, freezes,</text>
      <text x="95" y="50" textAnchor="middle" fontSize="7" fill="#78350f">wrong price display</text>
      
      <rect x="205" y="0" width="190" height="70" fill="#fef9c3" rx="8" stroke="#fcd34d" strokeWidth="1"/>
      <text x="300" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#b45309">Connectivity Issues</text>
      <text x="300" y="38" textAnchor="middle" fontSize="7" fill="#78350f">Internet outages, slow</text>
      <text x="300" y="50" textAnchor="middle" fontSize="7" fill="#78350f">connections, data lag</text>
      
      <rect x="410" y="0" width="190" height="70" fill="#fef9c3" rx="8" stroke="#fcd34d" strokeWidth="1"/>
      <text x="505" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#b45309">Execution Gaps</text>
      <text x="505" y="38" textAnchor="middle" fontSize="7" fill="#78350f">Slippage, delays,</text>
      <text x="505" y="50" textAnchor="middle" fontSize="7" fill="#78350f">partial fills, errors</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="50" y="265" width="600" height="25" fill="#fef3c7" rx="6"/>
    <text x="350" y="282" textAnchor="middle" fontSize="9" fill="#92400e">System risk can strike at the worst possible moment — when you need to act quickly.</text>
  </svg>
);

// SVG 4: Emotional Risk Explained
const EmotionalRiskSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Emotional Risk: The Internal Risk</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">The risk you bring to every decision — your own psychology</text>
    
    {/* Brain with emotion zones */}
    <g transform="translate(350, 165)">
      {/* Brain outline */}
      <ellipse cx="0" cy="0" rx="100" ry="80" fill="#fdf2f8" stroke="#f9a8d4" strokeWidth="3"/>
      
      {/* Emotional zones */}
      <g transform="translate(-60, -30)">
        <circle cx="0" cy="0" r="25" fill="#fecaca" stroke="#ef4444" strokeWidth="2"/>
        <text x="0" y="-5" textAnchor="middle" fontSize="7" fontWeight="600" fill="#dc2626">FEAR</text>
        <text x="0" y="8" textAnchor="middle" fontSize="6" fill="#991b1b">Panic selling</text>
      </g>
      
      <g transform="translate(60, -30)">
        <circle cx="0" cy="0" r="25" fill="#bbf7d0" stroke="#22c55e" strokeWidth="2"/>
        <text x="0" y="-5" textAnchor="middle" fontSize="7" fontWeight="600" fill="#16a34a">GREED</text>
        <text x="0" y="8" textAnchor="middle" fontSize="6" fill="#166534">Over-exposure</text>
      </g>
      
      <g transform="translate(-60, 35)">
        <circle cx="0" cy="0" r="25" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
        <text x="0" y="-5" textAnchor="middle" fontSize="7" fontWeight="600" fill="#d97706">HOPE</text>
        <text x="0" y="8" textAnchor="middle" fontSize="6" fill="#b45309">Denial of loss</text>
      </g>
      
      <g transform="translate(60, 35)">
        <circle cx="0" cy="0" r="25" fill="#ddd6fe" stroke="#8b5cf6" strokeWidth="2"/>
        <text x="0" y="-5" textAnchor="middle" fontSize="7" fontWeight="600" fill="#7c3aed">REGRET</text>
        <text x="0" y="8" textAnchor="middle" fontSize="6" fill="#6d28d9">Revenge trades</text>
      </g>
      
      {/* Center */}
      <circle cx="0" cy="0" r="15" fill="#f9a8d4" stroke="#ec4899" strokeWidth="2"/>
      <text x="0" y="4" textAnchor="middle" fontSize="6" fontWeight="600" fill="#be185d">YOU</text>
    </g>
    
    {/* Side labels */}
    <g transform="translate(50, 120)">
      <rect x="0" y="0" width="130" height="100" fill="#fce7f3" rx="8" stroke="#f9a8d4" strokeWidth="1"/>
      <text x="65" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#be185d">Emotional Triggers</text>
      <text x="65" y="42" textAnchor="middle" fontSize="7" fill="#9d174d">• Seeing losses grow</text>
      <text x="65" y="56" textAnchor="middle" fontSize="7" fill="#9d174d">• Missing opportunities</text>
      <text x="65" y="70" textAnchor="middle" fontSize="7" fill="#9d174d">• Comparing to others</text>
      <text x="65" y="84" textAnchor="middle" fontSize="7" fill="#9d174d">• Time pressure</text>
    </g>
    
    <g transform="translate(520, 120)">
      <rect x="0" y="0" width="130" height="100" fill="#fce7f3" rx="8" stroke="#f9a8d4" strokeWidth="1"/>
      <text x="65" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#be185d">Emotional Actions</text>
      <text x="65" y="42" textAnchor="middle" fontSize="7" fill="#9d174d">• Abandon plan</text>
      <text x="65" y="56" textAnchor="middle" fontSize="7" fill="#9d174d">• Size up impulsively</text>
      <text x="65" y="70" textAnchor="middle" fontSize="7" fill="#9d174d">• Exit too early/late</text>
      <text x="65" y="84" textAnchor="middle" fontSize="7" fill="#9d174d">• Chase price moves</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="265" width="500" height="25" fill="#fce7f3" rx="6"/>
    <text x="350" y="282" textAnchor="middle" fontSize="9" fill="#be185d">Emotional risk is the only risk you have direct control over — and often the most destructive.</text>
  </svg>
);

// SVG 5: Risks Interact and Compound
const RisksInteractSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">How Risks Interact and Compound</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Risks rarely appear alone — they trigger and amplify each other</text>
    
    {/* Three risk nodes */}
    <g transform="translate(350, 170)">
      {/* Market Risk Node */}
      <circle cx="-120" cy="-60" r="45" fill="#dbeafe" stroke="#3b82f6" strokeWidth="3"/>
      <text x="-120" y="-65" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1e40af">Market</text>
      <text x="-120" y="-50" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1e40af">Risk</text>
      
      {/* System Risk Node */}
      <circle cx="120" cy="-60" r="45" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3"/>
      <text x="120" y="-65" textAnchor="middle" fontSize="9" fontWeight="600" fill="#b45309">System</text>
      <text x="120" y="-50" textAnchor="middle" fontSize="9" fontWeight="600" fill="#b45309">Risk</text>
      
      {/* Emotional Risk Node */}
      <circle cx="0" cy="80" r="45" fill="#fce7f3" stroke="#ec4899" strokeWidth="3"/>
      <text x="0" y="75" textAnchor="middle" fontSize="9" fontWeight="600" fill="#be185d">Emotional</text>
      <text x="0" y="90" textAnchor="middle" fontSize="9" fontWeight="600" fill="#be185d">Risk</text>
      
      {/* Connecting arrows with labels */}
      {/* Market → Emotional */}
      <path d="M-85 -25 Q-60 30 -35 55" fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowGray)"/>
      <text x="-80" y="25" fontSize="6" fill="#64748b">Price drops</text>
      <text x="-80" y="35" fontSize="6" fill="#64748b">trigger fear</text>
      
      {/* System → Emotional */}
      <path d="M85 -25 Q60 30 35 55" fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowGray)"/>
      <text x="55" y="25" fontSize="6" fill="#64748b">Failures</text>
      <text x="55" y="35" fontSize="6" fill="#64748b">cause panic</text>
      
      {/* Market ↔ System */}
      <path d="M-70 -60 L70 -60" fill="none" stroke="#94a3b8" strokeWidth="2"/>
      <text x="0" y="-70" textAnchor="middle" fontSize="6" fill="#64748b">Volatility overloads systems</text>
      
      {/* Emotional → Both */}
      <path d="M-25 45 Q-70 0 -90 -20" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrowRed)"/>
      <path d="M25 45 Q70 0 90 -20" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrowRed)"/>
      
      <defs>
        <marker id="arrowGray" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#94a3b8"/>
        </marker>
        <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#ef4444"/>
        </marker>
      </defs>
    </g>
    
    {/* Feedback loop warning */}
    <g transform="translate(520, 200)">
      <rect x="0" y="0" width="140" height="60" fill="#fef2f2" rx="8" stroke="#fca5a5" strokeWidth="1"/>
      <text x="70" y="20" textAnchor="middle" fontSize="8" fontWeight="600" fill="#dc2626">⚠️ Feedback Loop</text>
      <text x="70" y="35" textAnchor="middle" fontSize="7" fill="#991b1b">Emotional reactions</text>
      <text x="70" y="48" textAnchor="middle" fontSize="7" fill="#991b1b">create new risks</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="285" width="500" height="25" fill="#1e293b" rx="6"/>
    <text x="350" y="302" textAnchor="middle" fontSize="9" fill="white">A single risk rarely causes failure. Risk compounding does.</text>
  </svg>
);

// SVG 6: Visible vs Invisible Risk
const VisibleVsInvisibleSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Visible vs Invisible Risk</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">What you see on charts is only part of the picture</text>
    
    {/* Iceberg visualization */}
    <g transform="translate(350, 175)">
      {/* Water line */}
      <line x1="-250" y1="0" x2="250" y2="0" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="8"/>
      <text x="220" y="-10" fontSize="8" fill="#0369a1">Surface</text>
      
      {/* Above water - visible */}
      <polygon points="-60,-80 60,-80 80,-10 -80,-10" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
      <text x="0" y="-50" textAnchor="middle" fontSize="10" fontWeight="600" fill="#1e40af">MARKET RISK</text>
      <text x="0" y="-35" textAnchor="middle" fontSize="7" fill="#1e40af">Price charts, news,</text>
      <text x="0" y="-22" textAnchor="middle" fontSize="7" fill="#1e40af">visible movements</text>
      
      {/* Below water - invisible */}
      <polygon points="-80,10 80,10 120,50 100,90 -100,90 -120,50" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
      <text x="0" y="35" textAnchor="middle" fontSize="9" fontWeight="600" fill="#b45309">SYSTEM RISK</text>
      <text x="0" y="50" textAnchor="middle" fontSize="7" fill="#92400e">Hidden process failures</text>
      <text x="0" y="63" textAnchor="middle" fontSize="7" fill="#92400e">Technology vulnerabilities</text>
      
      {/* Deepest - emotional */}
      <polygon points="-100,95 100,95 60,130 -60,130" fill="#fce7f3" stroke="#ec4899" strokeWidth="2"/>
      <text x="0" y="115" textAnchor="middle" fontSize="9" fontWeight="600" fill="#be185d">EMOTIONAL RISK</text>
      
      {/* Water effect */}
      <rect x="-250" y="0" width="500" height="140" fill="rgba(14, 165, 233, 0.1)"/>
    </g>
    
    {/* Labels */}
    <g transform="translate(50, 100)">
      <rect x="0" y="0" width="100" height="50" fill="#dbeafe" rx="6"/>
      <text x="50" y="20" textAnchor="middle" fontSize="8" fontWeight="600" fill="#1e40af">👁️ VISIBLE</text>
      <text x="50" y="35" textAnchor="middle" fontSize="7" fill="#1e40af">Easy to track</text>
    </g>
    
    <g transform="translate(550, 180)">
      <rect x="0" y="0" width="100" height="50" fill="#fef2f2" rx="6"/>
      <text x="50" y="20" textAnchor="middle" fontSize="8" fontWeight="600" fill="#dc2626">🙈 INVISIBLE</text>
      <text x="50" y="35" textAnchor="middle" fontSize="7" fill="#dc2626">Easy to ignore</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="265" width="500" height="25" fill="#1e293b" rx="6"/>
    <text x="350" y="282" textAnchor="middle" fontSize="9" fill="white">The risks you don't see are often the ones that sink you.</text>
  </svg>
);

// SVG 7: Scenario - Multiple Risks at Once
const MultipleRisksScenarioSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">When All Three Risks Strike Together</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">A realistic scenario showing risk compounding</text>
    
    {/* Timeline */}
    <line x1="80" y1="280" x2="620" y2="280" stroke="#cbd5e1" strokeWidth="2"/>
    
    {/* Event 1: Market */}
    <g transform="translate(100, 80)">
      <circle cx="30" cy="200" r="8" fill="#3b82f6" stroke="#1e40af" strokeWidth="2"/>
      <line x1="30" y1="192" x2="30" y2="130" stroke="#3b82f6" strokeWidth="2"/>
      
      <rect x="0" y="0" width="130" height="120" fill="#dbeafe" rx="8" stroke="#3b82f6" strokeWidth="2"/>
      <text x="65" y="22" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1e40af">1️⃣ MARKET RISK</text>
      <text x="65" y="40" textAnchor="middle" fontSize="8" fill="#1e40af">Unexpected news</text>
      <text x="65" y="55" textAnchor="middle" fontSize="8" fill="#1e40af">drops market sharply</text>
      
      <rect x="10" y="65" width="110" height="45" fill="#eff6ff" rx="4"/>
      <text x="65" y="82" textAnchor="middle" fontSize="7" fill="#334155">Your holdings</text>
      <text x="65" y="95" textAnchor="middle" fontSize="7" fill="#334155">are affected</text>
    </g>
    
    {/* Event 2: System */}
    <g transform="translate(285, 80)">
      <circle cx="30" cy="200" r="8" fill="#f59e0b" stroke="#b45309" strokeWidth="2"/>
      <line x1="30" y1="192" x2="30" y2="130" stroke="#f59e0b" strokeWidth="2"/>
      
      <rect x="0" y="0" width="130" height="120" fill="#fef3c7" rx="8" stroke="#f59e0b" strokeWidth="2"/>
      <text x="65" y="22" textAnchor="middle" fontSize="9" fontWeight="700" fill="#b45309">2️⃣ SYSTEM RISK</text>
      <text x="65" y="40" textAnchor="middle" fontSize="8" fill="#b45309">Trading app slows</text>
      <text x="65" y="55" textAnchor="middle" fontSize="8" fill="#b45309">under heavy traffic</text>
      
      <rect x="10" y="65" width="110" height="45" fill="#fefce8" rx="4"/>
      <text x="65" y="82" textAnchor="middle" fontSize="7" fill="#334155">You cannot act</text>
      <text x="65" y="95" textAnchor="middle" fontSize="7" fill="#334155">when you want to</text>
    </g>
    
    {/* Event 3: Emotional */}
    <g transform="translate(470, 80)">
      <circle cx="30" cy="200" r="8" fill="#ec4899" stroke="#be185d" strokeWidth="2"/>
      <line x1="30" y1="192" x2="30" y2="130" stroke="#ec4899" strokeWidth="2"/>
      
      <rect x="0" y="0" width="130" height="120" fill="#fce7f3" rx="8" stroke="#ec4899" strokeWidth="2"/>
      <text x="65" y="22" textAnchor="middle" fontSize="9" fontWeight="700" fill="#be185d">3️⃣ EMOTIONAL RISK</text>
      <text x="65" y="40" textAnchor="middle" fontSize="8" fill="#be185d">Panic sets in</text>
      <text x="65" y="55" textAnchor="middle" fontSize="8" fill="#be185d">as losses mount</text>
      
      <rect x="10" y="65" width="110" height="45" fill="#fdf2f8" rx="4"/>
      <text x="65" y="82" textAnchor="middle" fontSize="7" fill="#334155">You make impulsive</text>
      <text x="65" y="95" textAnchor="middle" fontSize="7" fill="#334155">decisions</text>
    </g>
    
    {/* Connection arrows */}
    <path d="M230 140 L270 140" fill="none" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowScenario)"/>
    <path d="M415 140 L455 140" fill="none" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowScenario)"/>
    
    <defs>
      <marker id="arrowScenario" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#ef4444"/>
      </marker>
    </defs>
    
    {/* Result */}
    <rect x="200" y="300" width="300" height="30" fill="#ef4444" rx="6"/>
    <text x="350" y="320" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">Result: Compounded damage to capital</text>
  </svg>
);

// SVG 8: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 200" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="200" fill="#f8fafc" rx="16"/>
    
    {/* Central message */}
    <rect x="50" y="25" width="600" height="150" fill="url(#awarenessGradient)" rx="16"/>
    
    <defs>
      <linearGradient id="awarenessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#059669"/>
        <stop offset="100%" stopColor="#0d9488"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="60" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">🔍 Key Takeaway</text>
    
    <text x="350" y="90" textAnchor="middle" fontSize="11" fill="white">Risk is not just what happens to prices.</text>
    <text x="350" y="110" textAnchor="middle" fontSize="11" fill="white">It's also what happens to your tools and what happens inside you.</text>
    <text x="350" y="145" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fef3c7">AWARENESS IS THE FIRST DEFENSE.</text>
  </svg>
);

const RiskLesson3 = () => {
  const navigate = useNavigate();

  const quizQuestions = [
    {
      question: "Which type of risk is NOT visible on a price chart?",
      options: [
        "Market risk from price movements",
        "System risk from technology failures and emotional risk from human reactions",
        "Volatility risk",
        "All risks are visible on price charts"
      ],
      correctAnswer: "System risk from technology failures and emotional risk from human reactions",
      explanation: "System risk (technology, execution) and emotional risk (psychology) don't show up on charts but can significantly impact your outcomes."
    },
    {
      question: "Why do risks often compound (make each other worse)?",
      options: [
        "Because risks are mathematically linked",
        "Because one risk can trigger another — for example, a market drop can cause system overload and emotional panic",
        "Because all risks happen at the same time by definition",
        "Risks don't actually compound"
      ],
      correctAnswer: "Because one risk can trigger another — for example, a market drop can cause system overload and emotional panic",
      explanation: "Risks interact in chains: market events can overload systems, and both can trigger emotional responses that lead to poor decisions."
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
              Lesson 3 of 7
            </span>
            <h1 className="text-3xl font-bold text-gray-800 mt-4">Types of Risk – Market, System & Emotional</h1>
            <p className="text-gray-600 mt-2">Understanding the multiple dimensions of risk</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Identifying Risk Types Matters</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              When most people think about risk in financial markets, they think about one thing: 
              <strong> prices going down</strong>. While that's certainly a form of risk, it's far 
              from the complete picture.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              In reality, risk comes in multiple layers. Some risks are visible on charts. Others 
              hide in the systems you depend on. And some of the most dangerous risks live inside 
              your own mind, invisible until they cause damage.
            </p>
            <p className="text-lg leading-relaxed">
              Understanding these different types of risk doesn't eliminate them — but awareness 
              reduces surprises. When you can name what's threatening your capital, you're better 
              positioned to recognize it before it strikes.
            </p>
          </div>

          <ThreeLayersOfRiskSVG />
        </div>

        {/* Market Risk */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Market Risk: The Visible Layer</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              <strong>Market risk</strong> is what most people mean when they talk about risk. It's 
              the risk that prices will move against you — that what you own will become worth less, 
              or that what you want to buy will become more expensive.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              This type of risk is driven by external forces you cannot control: economic news, 
              company performance, interest rate changes, geopolitical events, sector rotations, 
              and the collective behavior of millions of market participants.
            </p>
            <p className="text-lg leading-relaxed">
              Market risk is <strong>visible</strong> — you can see it on price charts, read about 
              it in headlines, and track it in real-time. This visibility makes it the most studied 
              form of risk. But visibility doesn't mean controllability. Market risk happens to you; 
              you can only decide how to respond.
            </p>
          </div>

          <MarketRiskSVG />
        </div>

        {/* System Risk */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">System Risk: The Hidden Layer</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              <strong>System risk</strong> encompasses everything that can go wrong between your 
              decision and its execution. It lives in the tools, platforms, networks, and processes 
              you depend on to participate in markets.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              This includes technology failures (app crashes, slow loading, wrong data display), 
              connectivity issues (internet outages, server problems, data delays), and execution 
              gaps (slippage, partial fills, order errors).
            </p>
            <p className="text-lg leading-relaxed">
              What makes system risk particularly dangerous is its <strong>timing</strong>. Systems 
              tend to fail exactly when you need them most — during high volatility, when everyone 
              is trying to act at once, when speed matters. The same market event that creates market 
              risk can simultaneously create system risk by overloading infrastructure.
            </p>
          </div>

          <SystemRiskSVG />
        </div>

        {/* Emotional Risk */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Emotional Risk: The Internal Layer</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              <strong>Emotional risk</strong> is the risk you bring to every financial decision 
              through your own psychology. Fear, greed, hope, regret, impatience, overconfidence — 
              these emotions can turn a manageable situation into a disaster.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Emotional risk is triggered by circumstances: watching losses grow, seeing others 
              profit while you don't, feeling time pressure, or experiencing unexpected volatility. 
              These triggers don't cause damage directly — they cause you to act in ways that 
              create damage.
            </p>
            <p className="text-lg leading-relaxed">
              The paradox of emotional risk is that it's the <strong>only type you can directly 
              control</strong> — yet it's often the hardest to manage. You cannot control market 
              prices. You cannot guarantee systems won't fail. But you can, with awareness and 
              discipline, control your responses.
            </p>
          </div>

          <EmotionalRiskSVG />
        </div>

        {/* How Risks Interact */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">How Risks Interact and Compound</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Understanding each risk type individually is important, but real danger often comes 
              from how risks <strong>interact</strong>. A single risk rarely causes catastrophic 
              failure — it's the compounding of multiple risks that does.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Market risk triggers emotional risk: prices drop, fear kicks in. System risk amplifies 
              emotional risk: you can't act, panic grows. Emotional risk creates new market risk: 
              panicked decisions lead to poorly timed actions.
            </p>
            <p className="text-lg leading-relaxed">
              This creates feedback loops. Each risk makes the others worse. A market decline that 
              would be manageable on its own becomes devastating when combined with system failures 
              and emotional reactions. Recognizing these interactions is crucial for understanding 
              why capital protection requires awareness of all three layers.
            </p>
          </div>

          <RisksInteractSVG />
        </div>

        {/* Visible vs Invisible */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">The Iceberg: Visible vs Invisible Risk</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Think of risk like an iceberg. Market risk — price movements, volatility, news 
              events — is the visible portion above the waterline. It's what everyone sees, 
              discusses, and tracks.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Below the surface lies system risk: the hidden vulnerabilities in tools and processes 
              that only reveal themselves when something goes wrong. And deeper still lies emotional 
              risk: the psychological patterns that influence every decision you make.
            </p>
            <p className="text-lg leading-relaxed">
              The danger is that we tend to prepare only for what we can see. We watch charts, 
              follow news, and track prices — but ignore the larger mass of risk hidden below. 
              Yet it's often those invisible risks that cause the most damage, precisely because 
              we weren't prepared for them.
            </p>
          </div>

          <VisibleVsInvisibleSVG />
        </div>

        {/* Practical Scenario */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">A Real-World Scenario: Multiple Risks at Once</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Imagine this scenario: <strong>Major unexpected news hits the market</strong>. Prices 
              begin dropping sharply. This is market risk in action — external forces moving 
              prices against you.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              You decide you want to reduce your exposure. But when you open your trading app, 
              it's slow. Very slow. Millions of other people are trying to do the same thing. 
              The platform struggles under the load. This is system risk — the infrastructure 
              failing exactly when you need it.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              As you watch prices fall and your app refuses to respond, <strong>panic sets in</strong>. 
              Your heart races. You start making rapid decisions — any decision — just to feel 
              like you're doing something. This is emotional risk hijacking your judgment.
            </p>
            <p className="text-lg leading-relaxed">
              Each risk made the others worse. The market event overloaded the system. The system 
              failure intensified your emotions. Your emotions led to worse decisions than you 
              would have made with a calm mind. This is how risks compound.
            </p>
          </div>

          <MultipleRisksScenarioSVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
          
          <div className="mt-6 bg-emerald-50 rounded-xl p-5 border border-emerald-200">
            <p className="text-emerald-800 font-medium">
              Remember: You don't need to have solutions for every risk type right now. The goal 
              of this lesson is simply awareness — recognizing that risk is multi-dimensional 
              and that the risks you don't see can be just as dangerous as the ones you do.
            </p>
          </div>
        </div>

        {/* India-specific Context */}
        <div className="bg-emerald-50 rounded-2xl p-6 shadow-lg mb-8 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-800 mb-3">🌍 Global Context</h3>
          <p className="text-emerald-900">
            These three categories of risk — market, system, and emotional — exist in every 
            financial market worldwide, from Wall Street to European exchanges to Asian markets 
            including India. The technology may differ, the specific triggers may vary, but the 
            fundamental structure of risk remains universal. A trader in Mumbai faces the same 
            types of risk as one in New York or London: prices that move unpredictably, systems 
            that can fail under pressure, and human emotions that can override rational planning. 
            Awareness of this universal structure helps you prepare regardless of where you operate.
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
                  Consider the three types of risk and your own experience:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">1.</span>
                    <span>Of the three risk types (market, system, emotional), which do you think you have the most control over? Why?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">2.</span>
                    <span>Have you ever experienced a situation where multiple risks combined to make things worse? What happened?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">3.</span>
                    <span>Which "invisible" risk (system or emotional) do you think you currently pay the least attention to?</span>
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                  <p className="text-emerald-800 text-sm">
                    <strong>Hint:</strong> Emotional risk is the one type you can directly control — 
                    but most people underestimate how much it influences their decisions. System 
                    risk is often ignored until something goes wrong.
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
            <li>• <strong>Market risk</strong> is visible — price movements driven by external forces</li>
            <li>• <strong>System risk</strong> is hidden — failures in tools, platforms, and execution</li>
            <li>• <strong>Emotional risk</strong> is internal — your psychology influencing decisions</li>
            <li>• Risks interact and compound — one risk often triggers or amplifies others</li>
            <li>• The risks you don't see (below the surface) can be most dangerous</li>
            <li>• Awareness of all three layers is the foundation of risk management</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/risk-lesson-2')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-colors"
          >
            <FaArrowLeft />
            <span>Previous Lesson</span>
          </button>
          <button
            onClick={() => navigate('/learn/risk-lesson-4')}
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

export default RiskLesson3;
