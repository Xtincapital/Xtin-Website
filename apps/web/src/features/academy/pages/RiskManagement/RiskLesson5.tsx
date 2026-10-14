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
                  ? 'border-brand bg-brand-soft'
                  : option === selectedAnswer
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
                : 'border-gray-200 hover:border-brand hover:bg-brand-soft'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {showResult && (
        <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${isCorrect ? 'bg-brand-soft' : 'bg-red-100'}`}>
          {isCorrect ? (
            <FaCheckCircle className="text-brand text-xl flex-shrink-0 mt-0.5" />
          ) : (
            <FaTimesCircle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`font-semibold ${isCorrect ? 'text-brand' : 'text-red-800'}`}>
              {isCorrect ? 'Correct!' : 'Not quite right'}
            </p>
            <p className="text-gray-700 mt-1">{explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// SVG 1: What Is A Drawdown
const WhatIsDrawdownSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="15" fontWeight="600" fill="#373A41">What Is A Drawdown?</text>
    <text x="350" y="50" textAnchor="middle" fontSize="10" fill="#717680">The decline from your highest point to your current point</text>
    
    {/* Equity curve */}
    <g transform="translate(80, 70)">
      {/* Grid lines */}
      <line x1="0" y1="180" x2="540" y2="180" stroke="#E4E4EA" strokeWidth="1"/>
      <line x1="0" y1="0" x2="0" y2="180" stroke="#E4E4EA" strokeWidth="1"/>
      
      {/* Rising portion */}
      <path d="M0 160 Q50 150 100 130 Q150 110 200 80 Q230 60 260 50" 
            fill="none" stroke="#12805A" strokeWidth="3" strokeLinecap="round"/>
      
      {/* Peak marker */}
      <circle cx="260" cy="50" r="8" fill="#12805A" stroke="white" strokeWidth="2"/>
      <text x="260" y="35" textAnchor="middle" fontSize="9" fontWeight="600" fill="#12805A">PEAK</text>
      <text x="260" y="22" textAnchor="middle" fontSize="8" fill="#12805A">Highest Point</text>
      
      {/* Declining portion (drawdown) */}
      <path d="M260 50 Q290 70 320 100 Q350 130 380 150 Q410 160 440 155" 
            fill="none" stroke="#E04848" strokeWidth="3" strokeLinecap="round"/>
      
      {/* Current point marker */}
      <circle cx="440" cy="155" r="8" fill="#E04848" stroke="white" strokeWidth="2"/>
      <text x="440" y="175" textAnchor="middle" fontSize="9" fontWeight="600" fill="#C7363B">CURRENT</text>
      
      {/* Drawdown arrow */}
      <line x1="500" y1="50" x2="500" y2="155" stroke="#E04848" strokeWidth="2" strokeDasharray="5"/>
      <polygon points="495,150 500,160 505,150" fill="#E04848"/>
      <polygon points="495,55 500,45 505,55" fill="#E04848"/>
      
      {/* Drawdown label */}
      <rect x="510" y="85" width="80" height="40" fill="#FDF1F1" rx="6" stroke="#F09B9B" strokeWidth="1"/>
      <text x="550" y="102" textAnchor="middle" fontSize="9" fontWeight="600" fill="#C7363B">DRAWDOWN</text>
      <text x="550" y="117" textAnchor="middle" fontSize="8" fill="#842428">Peak → Current</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="265" width="500" height="25" fill="#2A2A2C" rx="6"/>
    <text x="350" y="282" textAnchor="middle" fontSize="9" fill="white">A drawdown measures how far you've fallen from your best — not from where you started.</text>
  </svg>
);

// SVG 2: Drawdowns Are Normal
const DrawdownsAreNormalSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#373A41">Drawdowns Are Normal — Not Failure</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Even successful long-term growth includes periods of decline</text>
    
    {/* Long-term growth with multiple drawdowns */}
    <g transform="translate(60, 70)">
      {/* Overall upward trend line */}
      <path d="M0 180 L580 40" fill="none" stroke="#A0A3AA" strokeWidth="1" strokeDasharray="8"/>
      <text x="520" y="30" fontSize="8" fill="#717680">Long-term trend</text>
      
      {/* Actual path with multiple drawdowns */}
      <path d="M0 180 Q30 170 60 150 Q80 140 100 145 Q120 155 140 130 Q170 100 200 90 Q220 100 240 115 Q260 95 280 70 Q310 50 340 55 Q360 70 380 85 Q400 65 420 50 Q450 45 480 60 Q500 50 520 45 Q550 40 580 45" 
            fill="none" stroke="#12805A" strokeWidth="3" strokeLinecap="round"/>
      
      {/* Drawdown markers */}
      <g transform="translate(100, 145)">
        <line x1="0" y1="0" x2="0" y2="-15" stroke="#E04848" strokeWidth="2"/>
        <text x="0" y="15" textAnchor="middle" fontSize="7" fill="#C7363B">DD1</text>
      </g>
      
      <g transform="translate(240, 115)">
        <line x1="0" y1="0" x2="0" y2="-25" stroke="#E04848" strokeWidth="2"/>
        <text x="0" y="15" textAnchor="middle" fontSize="7" fill="#C7363B">DD2</text>
      </g>
      
      <g transform="translate(380, 85)">
        <line x1="0" y1="0" x2="0" y2="-35" stroke="#E04848" strokeWidth="2"/>
        <text x="0" y="15" textAnchor="middle" fontSize="7" fill="#C7363B">DD3</text>
      </g>
      
      <g transform="translate(480, 60)">
        <line x1="0" y1="0" x2="0" y2="-15" stroke="#E04848" strokeWidth="2"/>
        <text x="0" y="15" textAnchor="middle" fontSize="7" fill="#C7363B">DD4</text>
      </g>
    </g>
    
    {/* Key point boxes */}
    <g transform="translate(80, 230)">
      <rect x="0" y="0" width="160" height="35" fill="#EEF9F4" rx="6" stroke="#3CCB97" strokeWidth="1"/>
      <text x="80" y="15" textAnchor="middle" fontSize="8" fontWeight="600" fill="#12805A">✓ Multiple drawdowns</text>
      <text x="80" y="28" textAnchor="middle" fontSize="7" fill="#12805A">Yet overall growth</text>
    </g>
    
    <g transform="translate(270, 230)">
      <rect x="0" y="0" width="160" height="35" fill="#E0E7F1" rx="6" stroke="#9FB3D3" strokeWidth="1"/>
      <text x="80" y="15" textAnchor="middle" fontSize="8" fontWeight="600" fill="#2C3F5E">✓ Temporary declines</text>
      <text x="80" y="28" textAnchor="middle" fontSize="7" fill="#2C3F5E">Part of the journey</text>
    </g>
    
    <g transform="translate(460, 230)">
      <rect x="0" y="0" width="160" height="35" fill="#F6ECCE" rx="6" stroke="#E2C273" strokeWidth="1"/>
      <text x="80" y="15" textAnchor="middle" fontSize="8" fontWeight="600" fill="#654B26">✓ Survival matters</text>
      <text x="80" y="28" textAnchor="middle" fontSize="7" fill="#654B26">Stay in the game</text>
    </g>
  </svg>
);

// SVG 3: Why Losses Cluster
const LossesClusterSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#373A41">Why Losses Tend to Cluster</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Bad periods don't spread out evenly — they often come in waves</text>
    
    {/* Timeline with clustered losses */}
    <g transform="translate(60, 90)">
      {/* Timeline */}
      <line x1="0" y1="100" x2="580" y2="100" stroke="#CFD0D3" strokeWidth="2"/>
      <text x="290" y="130" textAnchor="middle" fontSize="8" fill="#717680">Time →</text>
      
      {/* Good period */}
      <rect x="0" y="60" width="150" height="40" fill="#EEF9F4" rx="6"/>
      <text x="75" y="85" textAnchor="middle" fontSize="9" fill="#12805A">Stable Period</text>
      
      {/* Loss cluster 1 */}
      <rect x="160" y="40" width="120" height="60" fill="#FDF1F1" rx="6" stroke="#F09B9B" strokeWidth="2"/>
      <text x="220" y="60" textAnchor="middle" fontSize="8" fontWeight="600" fill="#C7363B">Loss Cluster</text>
      <text x="190" y="78" fontSize="8" fill="#842428">↓ ↓ ↓</text>
      <text x="240" y="78" fontSize="8" fill="#842428">↓ ↓</text>
      <text x="220" y="92" textAnchor="middle" fontSize="7" fill="#6B2023">Multiple losses together</text>
      
      {/* Good period */}
      <rect x="290" y="60" width="130" height="40" fill="#EEF9F4" rx="6"/>
      <text x="355" y="85" textAnchor="middle" fontSize="9" fill="#12805A">Recovery Period</text>
      
      {/* Loss cluster 2 */}
      <rect x="430" y="40" width="100" height="60" fill="#FDF1F1" rx="6" stroke="#F09B9B" strokeWidth="2"/>
      <text x="480" y="60" textAnchor="middle" fontSize="8" fontWeight="600" fill="#C7363B">Loss Cluster</text>
      <text x="480" y="78" fontSize="8" fill="#842428">↓ ↓ ↓ ↓</text>
      <text x="480" y="92" textAnchor="middle" fontSize="7" fill="#6B2023">More losses</text>
      
      {/* Future */}
      <rect x="540" y="60" width="40" height="40" fill="#E4E4EA" rx="6"/>
      <text x="560" y="85" textAnchor="middle" fontSize="8" fill="#717680">...</text>
    </g>
    
    {/* Explanation */}
    <g transform="translate(100, 210)">
      <rect x="0" y="0" width="500" height="70" fill="#F6ECCE" rx="10" stroke="#E2C273" strokeWidth="2"/>
      <text x="250" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B26">Why This Happens:</text>
      <text x="250" y="42" textAnchor="middle" fontSize="9" fill="#533E22">• Market conditions affect many investments simultaneously</text>
      <text x="250" y="58" textAnchor="middle" fontSize="9" fill="#533E22">• Correlated assets decline together • Emotional decisions compound losses</text>
    </g>
  </svg>
);

// SVG 4: Temporary vs Permanent Damage
const TemporaryVsPermanentSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#373A41">Temporary Drawdown vs Permanent Damage</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Not all declines are the same — understanding the difference is critical</text>
    
    {/* Left: Temporary Drawdown */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="280" height="200" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">Temporary Drawdown</text>
      
      {/* Recovery curve */}
      <g transform="translate(30, 50)">
        <path d="M0 30 Q40 20 80 10 Q100 20 120 50 Q140 70 160 55 Q180 35 200 20" 
              fill="none" stroke="#12805A" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="120" cy="50" r="5" fill="#E04848"/>
        <text x="120" y="75" textAnchor="middle" fontSize="7" fill="#C7363B">Dip</text>
        <text x="200" y="15" fontSize="7" fill="#12805A">Recovers</text>
      </g>
      
      <text x="140" y="150" textAnchor="middle" fontSize="9" fill="#12805A">• Position size was controlled</text>
      <text x="140" y="168" textAnchor="middle" fontSize="9" fill="#12805A">• Capital intact to participate in recovery</text>
      <text x="140" y="186" textAnchor="middle" fontSize="9" fill="#12805A">• Part of normal market cycles</text>
    </g>
    
    {/* Right: Permanent Damage */}
    <g transform="translate(370, 75)">
      <rect x="0" y="0" width="280" height="200" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">Permanent Damage</text>
      
      {/* Non-recovery curve */}
      <g transform="translate(30, 50)">
        <path d="M0 20 Q40 15 80 10 L120 70" 
              fill="none" stroke="#12805A" strokeWidth="3" strokeLinecap="round"/>
        <path d="M120 70 Q140 85 160 88 Q180 90 200 87" 
              fill="none" stroke="#E04848" strokeWidth="3" strokeLinecap="round" strokeDasharray="5"/>
        <circle cx="120" cy="70" r="5" fill="#E04848"/>
        <text x="120" y="90" textAnchor="middle" fontSize="7" fill="#C7363B">Severe loss</text>
        <text x="180" y="105" fontSize="7" fill="#842428">Struggling...</text>
      </g>
      
      <text x="140" y="150" textAnchor="middle" fontSize="9" fill="#842428">• Position size was too large</text>
      <text x="140" y="168" textAnchor="middle" fontSize="9" fill="#842428">• Insufficient capital for recovery</text>
      <text x="140" y="186" textAnchor="middle" fontSize="9" fill="#842428">• May never return to previous level</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="285" width="500" height="25" fill="#2A2A2C" rx="6"/>
    <text x="350" y="302" textAnchor="middle" fontSize="9" fill="white">The difference is often determined by position sizing BEFORE the drawdown occurs.</text>
  </svg>
);

// SVG 5: Recovery Takes Longer
const RecoveryTakesLongerSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#373A41">Recovery Takes Longer Than You Think</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">The bigger the fall, the longer the climb back</text>
    
    {/* Visual comparison */}
    <g transform="translate(80, 80)">
      {/* Small drawdown recovery */}
      <g transform="translate(0, 0)">
        <text x="0" y="0" fontSize="9" fontWeight="600" fill="#12805A">Small Drawdown:</text>
        
        {/* Timeline */}
        <rect x="0" y="15" width="500" height="40" fill="#E4E4EA" rx="6"/>
        
        {/* Fall */}
        <rect x="0" y="15" width="80" height="40" fill="#F6C3C3" rx="6"/>
        <text x="40" y="40" textAnchor="middle" fontSize="8" fill="#842428">Fall</text>
        
        {/* Recovery */}
        <rect x="80" y="15" width="100" height="40" fill="#ABE5CC" rx="6"/>
        <text x="130" y="40" textAnchor="middle" fontSize="8" fill="#12805A">Recovery</text>
        
        {/* Back to normal */}
        <rect x="180" y="15" width="320" height="40" fill="#EEF9F4" rx="6"/>
        <text x="340" y="40" textAnchor="middle" fontSize="8" fill="#12805A">Growing again ✓</text>
      </g>
      
      {/* Medium drawdown recovery */}
      <g transform="translate(0, 70)">
        <text x="0" y="0" fontSize="9" fontWeight="600" fill="#7C5D2B">Medium Drawdown:</text>
        
        {/* Timeline */}
        <rect x="0" y="15" width="500" height="40" fill="#E4E4EA" rx="6"/>
        
        {/* Fall */}
        <rect x="0" y="15" width="80" height="40" fill="#F6C3C3" rx="6"/>
        <text x="40" y="40" textAnchor="middle" fontSize="8" fill="#842428">Fall</text>
        
        {/* Long recovery */}
        <rect x="80" y="15" width="250" height="40" fill="#F6ECCE" rx="6"/>
        <text x="205" y="40" textAnchor="middle" fontSize="8" fill="#654B26">Slow recovery...</text>
        
        {/* Finally back */}
        <rect x="330" y="15" width="170" height="40" fill="#EEF9F4" rx="6"/>
        <text x="415" y="40" textAnchor="middle" fontSize="8" fill="#12805A">Finally growing</text>
      </g>
      
      {/* Large drawdown recovery */}
      <g transform="translate(0, 140)">
        <text x="0" y="0" fontSize="9" fontWeight="600" fill="#C7363B">Large Drawdown:</text>
        
        {/* Timeline */}
        <rect x="0" y="15" width="500" height="40" fill="#E4E4EA" rx="6"/>
        
        {/* Fall */}
        <rect x="0" y="15" width="80" height="40" fill="#E04848" rx="6"/>
        <text x="40" y="40" textAnchor="middle" fontSize="8" fill="white">Fall</text>
        
        {/* Very long recovery */}
        <rect x="80" y="15" width="420" height="40" fill="#FDF1F1" rx="6" stroke="#F09B9B" strokeWidth="1" strokeDasharray="4"/>
        <text x="290" y="35" textAnchor="middle" fontSize="8" fill="#842428">Still trying to recover...</text>
        <text x="290" y="50" textAnchor="middle" fontSize="7" fill="#6B2023">Missing growth opportunities</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="265" width="500" height="25" fill="#12805A" rx="6"/>
    <text x="350" y="282" textAnchor="middle" fontSize="9" fill="white">Keeping drawdowns small means spending more time growing, less time recovering.</text>
  </svg>
);

// SVG 6: Two Portfolios Story
const TwoPortfoliosSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#373A41">Two Portfolios Face The Same Market Storm</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Same conditions, different outcomes</text>
    
    {/* Scene: Market Storm */}
    <g transform="translate(50, 70)">
      <rect x="0" y="0" width="600" height="40" fill="#373A41" rx="8"/>
      <text x="300" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">⛈️ A significant market downturn affects both portfolios</text>
    </g>
    
    {/* Portfolio A */}
    <g transform="translate(50, 125)">
      <rect x="0" y="0" width="290" height="170" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <text x="145" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">Portfolio A</text>
      <text x="145" y="42" textAnchor="middle" fontSize="8" fill="#12805A">Controlled exposure, diversified</text>
      
      {/* Drawdown visualization */}
      <g transform="translate(30, 55)">
        <rect x="0" y="0" width="230" height="30" fill="#12805A" rx="4"/>
        <text x="115" y="20" textAnchor="middle" fontSize="8" fill="white">Capital before storm</text>
        
        <text x="115" y="50" textAnchor="middle" fontSize="10" fill="#717680">↓ Storm hits</text>
        
        <rect x="0" y="60" width="180" height="30" fill="#12805A" rx="4"/>
        <rect x="180" y="60" width="50" height="30" fill="#F6C3C3" rx="4"/>
        <text x="90" y="80" textAnchor="middle" fontSize="8" fill="white">Remains</text>
        <text x="205" y="80" textAnchor="middle" fontSize="7" fill="#842428">Lost</text>
      </g>
      
      <text x="145" y="155" textAnchor="middle" fontSize="9" fontWeight="600" fill="#12805A">✓ Manageable drawdown</text>
      <text x="145" y="168" textAnchor="middle" fontSize="8" fill="#12805A">Can participate in recovery</text>
    </g>
    
    {/* Portfolio B */}
    <g transform="translate(360, 125)">
      <rect x="0" y="0" width="290" height="170" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="145" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">Portfolio B</text>
      <text x="145" y="42" textAnchor="middle" fontSize="8" fill="#842428">Concentrated, high exposure</text>
      
      {/* Drawdown visualization */}
      <g transform="translate(30, 55)">
        <rect x="0" y="0" width="230" height="30" fill="#12805A" rx="4"/>
        <text x="115" y="20" textAnchor="middle" fontSize="8" fill="white">Capital before storm</text>
        
        <text x="115" y="50" textAnchor="middle" fontSize="10" fill="#717680">↓ Storm hits</text>
        
        <rect x="0" y="60" width="70" height="30" fill="#E04848" rx="4"/>
        <rect x="70" y="60" width="160" height="30" fill="#F6C3C3" rx="4" stroke="#E04848" strokeWidth="1" strokeDasharray="4"/>
        <text x="35" y="80" textAnchor="middle" fontSize="7" fill="white">Left</text>
        <text x="150" y="80" textAnchor="middle" fontSize="8" fill="#842428">Devastated</text>
      </g>
      
      <text x="145" y="155" textAnchor="middle" fontSize="9" fontWeight="600" fill="#C7363B">✗ Severe drawdown</text>
      <text x="145" y="168" textAnchor="middle" fontSize="8" fill="#842428">Struggling to participate</text>
    </g>
    
    {/* Aftermath */}
    <rect x="100" y="305" width="500" height="25" fill="#2A2A2C" rx="6"/>
    <text x="350" y="322" textAnchor="middle" fontSize="9" fill="white">Same storm. Different preparation. Different outcomes.</text>
  </svg>
);

// SVG 7: Emotional vs Disciplined Response
const EmotionalVsDisciplinedSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#373A41">Emotional vs Disciplined Response to Drawdowns</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">How you react during losses determines your recovery</text>
    
    {/* Drawdown event */}
    <g transform="translate(250, 70)">
      <rect x="0" y="0" width="200" height="35" fill="#E04848" rx="8"/>
      <text x="100" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">📉 Drawdown Occurs</text>
    </g>
    
    {/* Branching paths */}
    <path d="M350 105 L200 140" fill="none" stroke="#8F6FC4" strokeWidth="2"/>
    <path d="M350 105 L500 140" fill="none" stroke="#12805A" strokeWidth="2"/>
    
    {/* Emotional Response */}
    <g transform="translate(50, 145)">
      <rect x="0" y="0" width="280" height="170" fill="#ECE4F6" rx="12" stroke="#C0A9E2" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#654B8A">😰 Emotional Response</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="9" fill="#533F70">• Panic: "I need to get out NOW!"</text>
        <text x="0" y="18" fontSize="9" fill="#533F70">• Sell at the worst time</text>
        <text x="0" y="36" fontSize="9" fill="#533F70">• Lock in losses permanently</text>
        <text x="0" y="54" fontSize="9" fill="#533F70">• Miss the recovery</text>
        <text x="0" y="72" fontSize="9" fill="#533F70">• Feel regret and frustration</text>
      </g>
      
      <rect x="20" y="135" width="240" height="25" fill="#E04848" rx="6"/>
      <text x="140" y="152" textAnchor="middle" fontSize="9" fontWeight="600" fill="white">Outcome: Worse than necessary</text>
    </g>
    
    {/* Disciplined Response */}
    <g transform="translate(370, 145)">
      <rect x="0" y="0" width="280" height="170" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">😌 Disciplined Response</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="9" fill="#12805A">• Pause: "This is uncomfortable but expected"</text>
        <text x="0" y="18" fontSize="9" fill="#12805A">• Review: Is anything fundamentally broken?</text>
        <text x="0" y="36" fontSize="9" fill="#12805A">• Hold if position sizing was correct</text>
        <text x="0" y="54" fontSize="9" fill="#12805A">• Participate in recovery</text>
        <text x="0" y="72" fontSize="9" fill="#12805A">• Learn and adjust for next time</text>
      </g>
      
      <rect x="20" y="135" width="240" height="25" fill="#12805A" rx="6"/>
      <text x="140" y="152" textAnchor="middle" fontSize="9" fontWeight="600" fill="white">Outcome: Optimal given circumstances</text>
    </g>
  </svg>
);

// SVG 8: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 200" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="200" fill="#F5F5F7" rx="16"/>
    
    {/* Central message */}
    <rect x="50" y="25" width="600" height="150" fill="url(#drawdownGradient)" rx="16"/>
    
    <defs>
      <linearGradient id="drawdownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#12805A"/>
        <stop offset="100%" stopColor="#2A8C9A"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="60" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">📊 Key Takeaway</text>
    
    <text x="350" y="90" textAnchor="middle" fontSize="11" fill="white">Drawdowns are not failure — they are part of the journey.</text>
    <text x="350" y="112" textAnchor="middle" fontSize="11" fill="white">What matters is keeping them manageable and responding with discipline.</text>
    <text x="350" y="150" textAnchor="middle" fontSize="15" fontWeight="700" fill="#F6ECCE">SURVIVE THE DIP. PARTICIPATE IN THE RECOVERY.</text>
  </svg>
);

const RiskLesson5 = () => {
  const navigate = useNavigate();

  const quizQuestions = [
    {
      question: "What is a drawdown?",
      options: [
        "The total amount you've invested",
        "The decline from your highest point to your current point",
        "How much you've gained since you started",
        "The amount of risk you're taking"
      ],
      correctAnswer: "The decline from your highest point to your current point",
      explanation: "A drawdown measures how far your capital has fallen from its peak — the distance between your best moment and where you are now."
    },
    {
      question: "What is the main difference between a temporary drawdown and permanent damage?",
      options: [
        "Temporary drawdowns happen faster",
        "Permanent damage only happens in bear markets",
        "With proper position sizing, drawdowns are temporary; with excessive exposure, they can become permanent damage",
        "There is no difference — all drawdowns are the same"
      ],
      correctAnswer: "With proper position sizing, drawdowns are temporary; with excessive exposure, they can become permanent damage",
      explanation: "When position sizes are controlled, drawdowns are survivable and temporary. When exposure is too high, losses can be so severe that recovery becomes impossible."
    }
  ];

  return (
    <>
      <Navbar />
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/learn/risk-management')}
            className="flex items-center gap-2 text-brand hover:text-brand transition-colors mb-4"
          >
            <FaArrowLeft />
            <span>Back to Risk Management</span>
          </button>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <span className="bg-brand-soft text-brand px-3 py-1 rounded-full text-sm font-medium">
              Lesson 5 of 7
            </span>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-800 mt-4 tracking-[-0.025em]">Drawdowns & Recovery Reality</h1>
            <p className="text-gray-600 mt-2">Understanding losses as part of the journey</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.025em]">Why Drawdowns Happen — Even With Good Decisions</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Here's something that surprises many new investors: <strong>drawdowns happen to 
              everyone</strong>. Even the best investors, the most successful funds, and the 
              most carefully constructed portfolios experience periods where their value declines.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              This isn't because they made mistakes. It's because markets don't move in straight 
              lines. Even sound decisions can look wrong for extended periods. Even diversified 
              portfolios can decline during broad market stress.
            </p>
            <p className="text-lg leading-relaxed">
              Understanding drawdowns — what they are, why they happen, and how to respond — is 
              essential to surviving long enough to succeed. The goal isn't to avoid all drawdowns. 
              It's to keep them manageable and respond with discipline rather than panic.
            </p>
          </div>

          <WhatIsDrawdownSVG />
        </div>

        {/* Drawdowns Are Normal */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Drawdowns Are Normal — Not Failure</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Look at any long-term investment chart. You'll see growth — but if you look closely, 
              you'll also see multiple periods of decline along the way. Dips, corrections, and 
              drawdowns are woven into the fabric of every successful long-term journey.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              This is important to understand: <strong>experiencing a drawdown does not mean you 
              did something wrong</strong>. It doesn't mean your approach is broken. It's simply 
              how markets work — periods of advance followed by periods of decline, followed by 
              more advance.
            </p>
            <p className="text-lg leading-relaxed">
              What matters isn't whether you experience drawdowns — you will. What matters is 
              whether you've positioned yourself to survive them and continue participating when 
              recovery begins.
            </p>
          </div>

          <DrawdownsAreNormalSVG />
        </div>

        {/* Why Losses Cluster */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Why Losses Tend to Cluster</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              One of the most disorienting aspects of drawdowns is that <strong>losses don't 
              spread out evenly</strong>. You don't get one bad day, then several good days, 
              then another bad day. Instead, bad periods tend to cluster together.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              This happens for several reasons. Market conditions that cause one investment to 
              decline often affect others too. Fear spreads through markets, causing selling 
              pressure across many assets. And our own emotional responses can lead us to make 
              decisions that compound losses.
            </p>
            <p className="text-lg leading-relaxed">
              Understanding this clustering effect helps you prepare mentally. When you enter a 
              losing period, don't expect it to end quickly. Don't assume that because you've 
              had several bad days, a good day must be coming. Drawdowns can persist, and being 
              prepared for that helps you respond with discipline rather than desperation.
            </p>
          </div>

          <LossesClusterSVG />
        </div>

        {/* Temporary vs Permanent */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Temporary Drawdown vs Permanent Damage</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Not all declines are equal. There's a crucial difference between a <strong>temporary 
              drawdown</strong> — one that you can recover from — and <strong>permanent damage</strong> 
              — a loss so severe that recovery becomes impractical or impossible.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              A temporary drawdown happens when you have enough capital remaining to participate 
              in the recovery. Yes, you've declined from your peak. But you're still in the game. 
              When conditions improve, your remaining capital can grow again.
            </p>
            <p className="text-lg leading-relaxed">
              Permanent damage happens when the drawdown is so severe that even a strong recovery 
              won't bring you back to where you started in any reasonable timeframe. You've lost 
              so much that compounding works against you — you simply don't have enough capital 
              to benefit meaningfully from better times ahead.
            </p>
          </div>

          <TemporaryVsPermanentSVG />
        </div>

        {/* Recovery Takes Longer */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Why Recovery Is Harder After Large Losses</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              One of the most important concepts in risk management is this: <strong>the bigger 
              the drawdown, the longer the recovery</strong>. This isn't just about waiting — 
              it's about lost opportunity.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              When you experience a small drawdown, recovery might be quick. You dip, you recover, 
              you continue growing. The interruption is brief. Most of your time is spent making 
              progress.
            </p>
            <p className="text-lg leading-relaxed">
              But when the drawdown is large, recovery dominates your timeline. Instead of growing, 
              you're climbing back to where you were. During all that recovery time, you're not 
              compounding — you're just trying to break even. And every day spent recovering is 
              a day not spent growing.
            </p>
          </div>

          <RecoveryTakesLongerSVG />
        </div>

        {/* Two Portfolios */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Two Portfolios Face The Same Storm</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Consider two portfolios facing the same market downturn. The same external conditions 
              hit both. The same fear grips the market. The same headlines dominate the news.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              <strong>Portfolio A</strong> was built with controlled exposure and diversification. 
              When the storm hits, it experiences a drawdown — but a manageable one. Most of its 
              capital survives. When conditions improve, it has the resources to participate in 
              recovery.
            </p>
            <p className="text-lg leading-relaxed">
              <strong>Portfolio B</strong> was concentrated and highly exposed. The same storm 
              hits much harder. The drawdown is severe. When conditions improve, Portfolio B 
              struggles — it simply doesn't have enough capital left to benefit meaningfully 
              from the recovery. Same storm, same market, completely different outcomes.
            </p>
          </div>

          <TwoPortfoliosSVG />
        </div>

        {/* Emotional vs Disciplined Response */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Emotional vs Disciplined Response</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              When a drawdown occurs, you have a choice about how to respond. This choice can 
              make the difference between a temporary setback and permanent damage.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The <strong>emotional response</strong> is driven by fear and panic. Sell everything! 
              Get out now! This often leads to selling at the worst possible time — locking in 
              losses and missing the recovery that follows.
            </p>
            <p className="text-lg leading-relaxed">
              The <strong>disciplined response</strong> recognizes that drawdowns are uncomfortable 
              but expected. It asks: Is anything fundamentally broken, or is this just market 
              volatility? If position sizing was correct, it means holding through the discomfort 
              and participating in the recovery. This doesn't guarantee the best outcome — nothing 
              does — but it gives you the best chance.
            </p>
          </div>

          <EmotionalVsDisciplinedSVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
          
          <div className="mt-6 bg-brand-soft rounded-xl p-5 border border-brand-line">
            <p className="text-brand font-medium">
              Remember: The goal of risk management isn't to avoid all drawdowns — that's 
              impossible. The goal is to keep drawdowns manageable so that you survive them 
              and can participate when recovery arrives. Position sizing before the drawdown 
              determines your options during it.
            </p>
          </div>
        </div>

        {/* India-specific Context */}
        <div className="bg-brand-soft rounded-2xl p-6 shadow-lg mb-8 border border-brand-line">
          <h3 className="text-lg font-semibold text-brand mb-3">🌍 Global Context</h3>
          <p className="text-brand">
            Drawdowns affect investors in every market worldwide. Whether you're invested in 
            American stocks, European bonds, emerging markets like India, or any other asset 
            class, you will experience periods where your portfolio declines from its peak. 
            This is universal. The principles of surviving drawdowns — controlled exposure, 
            disciplined response, patience during recovery — apply equally in Mumbai, New York, 
            London, or Tokyo. Markets differ in specifics, but the reality of drawdowns is 
            shared by all participants everywhere.
          </p>
        </div>

        {/* Quiz Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">📝 Knowledge Check</h2>
          {quizQuestions.map((q, index) => (
            <QuizQuestion key={index} {...q} />
          ))}
        </div>

        {/* Reflection Activity */}
        <div className="rounded-2xl p-8 shadow-lg mb-8 bg-brand-soft">
          <div className="flex items-start gap-4">
            <div className="bg-brand-fill rounded-full p-3">
              <FaLightbulb className="text-white text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-brand mb-3">Reflection Activity</h3>
              <div className="bg-white rounded-xl p-5 border border-brand-line">
                <p className="text-gray-800 font-medium mb-4">
                  Think about your emotional relationship with losses:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-brand font-bold">1.</span>
                    <span>How do you typically feel when you see your investments decline? Anxious? Panicked? Detached? Something else?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand font-bold">2.</span>
                    <span>Have you ever made a decision during a drawdown that you later regretted? What drove that decision?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand font-bold">3.</span>
                    <span>If your portfolio dropped significantly tomorrow, what would your first instinct be? Would that instinct serve your long-term goals?</span>
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-brand-soft rounded-lg">
                  <p className="text-brand text-sm">
                    <strong>Why this matters:</strong> Understanding your emotional patterns during 
                    losses helps you prepare for them. The time to decide how you'll respond to a 
                    drawdown is before it happens — not in the heat of the moment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-2xl p-8 shadow-lg mb-8 text-white bg-brand-fill">
          <h3 className="text-xl font-semibold mb-4">🔑 Lesson Summary</h3>
          <ul className="space-y-2 text-lg">
            <li>• <strong>Drawdown</strong> = the decline from your highest point to your current point</li>
            <li>• Drawdowns are <strong>normal</strong> — even successful long-term growth includes them</li>
            <li>• Losses tend to <strong>cluster</strong> — bad periods often come in waves</li>
            <li>• <strong>Temporary drawdowns</strong> are survivable; <strong>permanent damage</strong> isn't</li>
            <li>• The bigger the drawdown, the <strong>longer the recovery</strong> — and the more opportunity lost</li>
            <li>• <strong>Disciplined response</strong> beats emotional panic every time</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/risk-lesson-4')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-colors"
          >
            <FaArrowLeft />
            <span>Previous Lesson</span>
          </button>
          <button
            onClick={() => navigate('/learn/risk-lesson-6')}
            className="flex items-center gap-2 bg-brand-fill hover:bg-brand-hover text-white px-6 py-3 rounded-xl transition-colors"
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

export default RiskLesson5;
