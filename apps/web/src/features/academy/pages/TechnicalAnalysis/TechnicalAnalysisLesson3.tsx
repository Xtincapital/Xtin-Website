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
                : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
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

// SVG 1: Why Direction Matters
const WhyDirectionMattersSVG = () => (
  <svg viewBox="0 0 600 280" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#373A41">Markets Move in Directions</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#717680">Understanding the general direction provides valuable context</text>
    
    {/* Left - Chaos without context */}
    <rect x="30" y="70" width="250" height="190" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
    <text x="155" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">Without Direction Context</text>
    
    {/* Chaotic price movement */}
    <g transform="translate(155, 165)">
      <rect x="-90" y="-50" width="180" height="100" fill="#ffffff" rx="8" stroke="#F6C3C3" strokeWidth="1"/>
      
      {/* Random looking movement */}
      <path 
        d="M-70 20 L-50 -10 L-30 25 L-10 -20 L10 15 L30 -25 L50 10 L70 -15" 
        fill="none" 
        stroke="#A0A3AA" 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Question marks */}
      <text x="-60" y="-30" fontSize="14" fill="#C7363B">?</text>
      <text x="0" y="40" fontSize="14" fill="#C7363B">?</text>
      <text x="50" y="-35" fontSize="14" fill="#C7363B">?</text>
    </g>
    
    <text x="155" y="235" textAnchor="middle" fontSize="10" fill="#842428">Price movements feel random</text>
    <text x="155" y="250" textAnchor="middle" fontSize="10" fill="#842428">and confusing</text>
    
    {/* Right - Clarity with context */}
    <rect x="320" y="70" width="250" height="190" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
    <text x="445" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A">With Direction Context</text>
    
    {/* Clear upward movement */}
    <g transform="translate(445, 165)">
      <rect x="-90" y="-50" width="180" height="100" fill="#ffffff" rx="8" stroke="#BBF7D0" strokeWidth="1"/>
      
      {/* Clear uptrend with swings */}
      <path 
        d="M-70 30 L-50 15 L-30 25 L-10 5 L10 15 L30 -10 L50 0 L70 -25" 
        fill="none" 
        stroke="#16A34A" 
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Upward arrow indicating direction */}
      <path d="M80 -10 L80 -35 M72 -27 L80 -35 L88 -27" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    
    <text x="445" y="235" textAnchor="middle" fontSize="10" fill="#16A34A">Direction provides structure</text>
    <text x="445" y="250" textAnchor="middle" fontSize="10" fill="#16A34A">and understanding</text>
  </svg>
);

// SVG 2: The Three Market Directions
const ThreeDirectionsSVG = () => (
  <svg viewBox="0 0 640 320" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="640" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="320" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">The Three Market Directions</text>
    <text x="320" y="48" textAnchor="middle" fontSize="11" fill="#717680">At any time, a market is doing one of three things</text>
    
    {/* Uptrend */}
    <rect x="25" y="70" width="185" height="230" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
    <text x="117" y="95" textAnchor="middle" fontSize="13" fontWeight="600" fill="#16A34A">UPTREND</text>
    <text x="117" y="112" textAnchor="middle" fontSize="10" fill="#16A34A">Prices generally rising</text>
    
    <g transform="translate(117, 175)">
      <rect x="-70" y="-45" width="140" height="90" fill="#ffffff" rx="8" stroke="#BBF7D0" strokeWidth="1"/>
      
      {/* Uptrend line with swings */}
      <path 
        d="M-55 35 L-35 20 L-20 30 L0 10 L20 20 L35 -5 L55 -25" 
        fill="none" 
        stroke="#16A34A" 
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Dots at swing points */}
      <circle cx="-35" cy="20" r="4" fill="#16A34A"/>
      <circle cx="0" cy="10" r="4" fill="#16A34A"/>
      <circle cx="35" cy="-5" r="4" fill="#16A34A"/>
    </g>
    
    <text x="117" y="250" textAnchor="middle" fontSize="9" fill="#16A34A">Higher highs</text>
    <text x="117" y="263" textAnchor="middle" fontSize="9" fill="#16A34A">Higher lows</text>
    
    {/* Arrow up */}
    <g transform="translate(117, 285)">
      <path d="M0 5 L0 -8 M-6 -2 L0 -8 L6 -2" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    
    {/* Downtrend */}
    <rect x="227" y="70" width="185" height="230" fill="#FDF1F1" rx="12" stroke="#E04848" strokeWidth="2"/>
    <text x="320" y="95" textAnchor="middle" fontSize="13" fontWeight="600" fill="#C7363B">DOWNTREND</text>
    <text x="320" y="112" textAnchor="middle" fontSize="10" fill="#A52A2F">Prices generally falling</text>
    
    <g transform="translate(320, 175)">
      <rect x="-70" y="-45" width="140" height="90" fill="#ffffff" rx="8" stroke="#F6C3C3" strokeWidth="1"/>
      
      {/* Downtrend line with swings */}
      <path 
        d="M-55 -25 L-35 -10 L-20 -20 L0 5 L20 -5 L35 15 L55 35" 
        fill="none" 
        stroke="#E04848" 
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Dots at swing points */}
      <circle cx="-35" cy="-10" r="4" fill="#E04848"/>
      <circle cx="0" cy="5" r="4" fill="#E04848"/>
      <circle cx="35" cy="15" r="4" fill="#E04848"/>
    </g>
    
    <text x="320" y="250" textAnchor="middle" fontSize="9" fill="#842428">Lower highs</text>
    <text x="320" y="263" textAnchor="middle" fontSize="9" fill="#842428">Lower lows</text>
    
    {/* Arrow down */}
    <g transform="translate(320, 285)">
      <path d="M0 -5 L0 8 M-6 2 L0 8 L6 2" stroke="#C7363B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    
    {/* Sideways */}
    <rect x="430" y="70" width="185" height="230" fill="#FBF7EC" rx="12" stroke="#B8923F" strokeWidth="2"/>
    <text x="522" y="95" textAnchor="middle" fontSize="13" fontWeight="600" fill="#9A7634">SIDEWAYS</text>
    <text x="522" y="112" textAnchor="middle" fontSize="10" fill="#7C5D2B">Prices moving in a range</text>
    
    <g transform="translate(522, 175)">
      <rect x="-70" y="-45" width="140" height="90" fill="#ffffff" rx="8" stroke="#EDD89D" strokeWidth="1"/>
      
      {/* Sideways line bouncing between levels */}
      <path 
        d="M-55 0 L-35 -20 L-15 15 L5 -18 L25 12 L45 -15 L55 5" 
        fill="none" 
        stroke="#B8923F" 
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Range boundaries */}
      <line x1="-60" y1="-22" x2="60" y2="-22" stroke="#CDAA5F" strokeWidth="1" strokeDasharray="4 3"/>
      <line x1="-60" y1="18" x2="60" y2="18" stroke="#CDAA5F" strokeWidth="1" strokeDasharray="4 3"/>
    </g>
    
    <text x="522" y="250" textAnchor="middle" fontSize="9" fill="#654B26">No clear direction</text>
    <text x="522" y="263" textAnchor="middle" fontSize="9" fill="#654B26">Bouncing in range</text>
    
    {/* Arrow sideways */}
    <g transform="translate(522, 285)">
      <path d="M-8 0 L8 0 M-2 -5 L-8 0 L-2 5 M2 -5 L8 0 L2 5" stroke="#9A7634" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  </svg>
);

// SVG 3: Uptrend Explained - Higher Highs & Higher Lows
const UptrendExplainedSVG = () => (
  <svg viewBox="0 0 600 340" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">Understanding an Uptrend</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#717680">Each swing point is higher than the previous one</text>
    
    {/* Main chart area */}
    <rect x="50" y="70" width="500" height="220" fill="#ffffff" rx="12" stroke="#E4E4EA" strokeWidth="2"/>
    
    {/* Y-axis labels */}
    <text x="40" y="95" textAnchor="end" fontSize="9" fill="#A0A3AA">High</text>
    <text x="40" y="180" textAnchor="end" fontSize="9" fill="#A0A3AA">Mid</text>
    <text x="40" y="265" textAnchor="end" fontSize="9" fill="#A0A3AA">Low</text>
    
    {/* Grid lines */}
    <line x1="60" y1="95" x2="540" y2="95" stroke="#EEEEF1" strokeWidth="1"/>
    <line x1="60" y1="180" x2="540" y2="180" stroke="#EEEEF1" strokeWidth="1"/>
    <line x1="60" y1="265" x2="540" y2="265" stroke="#EEEEF1" strokeWidth="1"/>
    
    {/* Uptrend price movement */}
    <path 
      d="M80 250 L130 200 L170 230 L230 170 L280 195 L340 130 L400 160 L470 100 L520 85" 
      fill="none" 
      stroke="#16A34A" 
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Higher Lows - marked with circles and labels */}
    <circle cx="80" cy="250" r="8" fill="#5A77AA" stroke="#344C72" strokeWidth="2"/>
    <text x="80" y="270" textAnchor="middle" fontSize="8" fill="#344C72">Low 1</text>
    
    <circle cx="170" cy="230" r="8" fill="#5A77AA" stroke="#344C72" strokeWidth="2"/>
    <text x="170" y="250" textAnchor="middle" fontSize="8" fill="#344C72">Higher Low</text>
    
    <circle cx="280" cy="195" r="8" fill="#5A77AA" stroke="#344C72" strokeWidth="2"/>
    <text x="280" y="215" textAnchor="middle" fontSize="8" fill="#344C72">Higher Low</text>
    
    <circle cx="400" cy="160" r="8" fill="#5A77AA" stroke="#344C72" strokeWidth="2"/>
    <text x="400" y="180" textAnchor="middle" fontSize="8" fill="#344C72">Higher Low</text>
    
    {/* Higher Highs - marked with circles and labels */}
    <circle cx="130" cy="200" r="8" fill="#16A34A" stroke="#16A34A" strokeWidth="2"/>
    <text x="130" y="190" textAnchor="middle" fontSize="8" fill="#16A34A">High 1</text>
    
    <circle cx="230" cy="170" r="8" fill="#16A34A" stroke="#16A34A" strokeWidth="2"/>
    <text x="230" y="160" textAnchor="middle" fontSize="8" fill="#16A34A">Higher High</text>
    
    <circle cx="340" cy="130" r="8" fill="#16A34A" stroke="#16A34A" strokeWidth="2"/>
    <text x="340" y="120" textAnchor="middle" fontSize="8" fill="#16A34A">Higher High</text>
    
    <circle cx="470" cy="100" r="8" fill="#16A34A" stroke="#16A34A" strokeWidth="2"/>
    <text x="470" y="90" textAnchor="middle" fontSize="8" fill="#16A34A">Higher High</text>
    
    {/* Legend */}
    <rect x="150" y="300" width="300" height="30" fill="#F0FDF4" rx="8" stroke="#16A34A" strokeWidth="1"/>
    <circle cx="180" cy="315" r="6" fill="#16A34A"/>
    <text x="195" y="318" fontSize="9" fill="#16A34A">Higher Highs</text>
    <circle cx="310" cy="315" r="6" fill="#5A77AA"/>
    <text x="325" y="318" fontSize="9" fill="#2C3F5E">Higher Lows</text>
    <text x="420" y="318" fontSize="9" fill="#717680">= Uptrend</text>
  </svg>
);

// SVG 4: Downtrend Explained - Lower Highs & Lower Lows
const DowntrendExplainedSVG = () => (
  <svg viewBox="0 0 600 340" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">Understanding a Downtrend</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#717680">Each swing point is lower than the previous one</text>
    
    {/* Main chart area */}
    <rect x="50" y="70" width="500" height="220" fill="#ffffff" rx="12" stroke="#E4E4EA" strokeWidth="2"/>
    
    {/* Y-axis labels */}
    <text x="40" y="95" textAnchor="end" fontSize="9" fill="#A0A3AA">High</text>
    <text x="40" y="180" textAnchor="end" fontSize="9" fill="#A0A3AA">Mid</text>
    <text x="40" y="265" textAnchor="end" fontSize="9" fill="#A0A3AA">Low</text>
    
    {/* Grid lines */}
    <line x1="60" y1="95" x2="540" y2="95" stroke="#EEEEF1" strokeWidth="1"/>
    <line x1="60" y1="180" x2="540" y2="180" stroke="#EEEEF1" strokeWidth="1"/>
    <line x1="60" y1="265" x2="540" y2="265" stroke="#EEEEF1" strokeWidth="1"/>
    
    {/* Downtrend price movement */}
    <path 
      d="M80 85 L130 120 L170 95 L230 150 L280 130 L340 190 L400 165 L470 220 L520 250" 
      fill="none" 
      stroke="#E04848" 
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Lower Highs - marked with circles and labels */}
    <circle cx="80" cy="85" r="8" fill="#D2754C" stroke="#C0623B" strokeWidth="2"/>
    <text x="80" y="78" textAnchor="middle" fontSize="8" fill="#C0623B">High 1</text>
    
    <circle cx="170" cy="95" r="8" fill="#D2754C" stroke="#C0623B" strokeWidth="2"/>
    <text x="170" y="88" textAnchor="middle" fontSize="8" fill="#C0623B">Lower High</text>
    
    <circle cx="280" cy="130" r="8" fill="#D2754C" stroke="#C0623B" strokeWidth="2"/>
    <text x="280" y="123" textAnchor="middle" fontSize="8" fill="#C0623B">Lower High</text>
    
    <circle cx="400" cy="165" r="8" fill="#D2754C" stroke="#C0623B" strokeWidth="2"/>
    <text x="400" y="158" textAnchor="middle" fontSize="8" fill="#C0623B">Lower High</text>
    
    {/* Lower Lows - marked with circles and labels */}
    <circle cx="130" cy="120" r="8" fill="#E04848" stroke="#C7363B" strokeWidth="2"/>
    <text x="130" y="137" textAnchor="middle" fontSize="8" fill="#C7363B">Low 1</text>
    
    <circle cx="230" cy="150" r="8" fill="#E04848" stroke="#C7363B" strokeWidth="2"/>
    <text x="230" y="167" textAnchor="middle" fontSize="8" fill="#C7363B">Lower Low</text>
    
    <circle cx="340" cy="190" r="8" fill="#E04848" stroke="#C7363B" strokeWidth="2"/>
    <text x="340" y="207" textAnchor="middle" fontSize="8" fill="#C7363B">Lower Low</text>
    
    <circle cx="470" cy="220" r="8" fill="#E04848" stroke="#C7363B" strokeWidth="2"/>
    <text x="470" y="237" textAnchor="middle" fontSize="8" fill="#C7363B">Lower Low</text>
    
    {/* Legend */}
    <rect x="150" y="300" width="300" height="30" fill="#FDF1F1" rx="8" stroke="#F09B9B" strokeWidth="1"/>
    <circle cx="180" cy="315" r="6" fill="#D2754C"/>
    <text x="195" y="318" fontSize="9" fill="#9C4D2E">Lower Highs</text>
    <circle cx="310" cy="315" r="6" fill="#E04848"/>
    <text x="325" y="318" fontSize="9" fill="#C7363B">Lower Lows</text>
    <text x="420" y="318" fontSize="9" fill="#717680">= Downtrend</text>
  </svg>
);

// SVG 5: Sideways Market Explained
const SidewaysExplainedSVG = () => (
  <svg viewBox="0 0 600 300" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">Understanding a Sideways Market</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#717680">Price bounces between a ceiling and floor with no clear direction</text>
    
    {/* Main chart area */}
    <rect x="50" y="70" width="500" height="180" fill="#ffffff" rx="12" stroke="#E4E4EA" strokeWidth="2"/>
    
    {/* Range boundaries */}
    <line x1="70" y1="100" x2="530" y2="100" stroke="#B8923F" strokeWidth="2" strokeDasharray="8 4"/>
    <text x="545" y="103" fontSize="9" fill="#9A7634">Ceiling</text>
    
    <line x1="70" y1="220" x2="530" y2="220" stroke="#B8923F" strokeWidth="2" strokeDasharray="8 4"/>
    <text x="545" y="223" fontSize="9" fill="#9A7634">Floor</text>
    
    {/* Sideways price movement */}
    <path 
      d="M80 160 L110 110 L150 200 L200 115 L250 210 L300 105 L350 195 L400 120 L450 205 L500 130 L520 160" 
      fill="none" 
      stroke="#B8923F" 
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Bounce points at ceiling */}
    <circle cx="110" cy="110" r="6" fill="#B8923F"/>
    <circle cx="200" cy="115" r="6" fill="#B8923F"/>
    <circle cx="300" cy="105" r="6" fill="#B8923F"/>
    <circle cx="400" cy="120" r="6" fill="#B8923F"/>
    <circle cx="500" cy="130" r="6" fill="#B8923F"/>
    
    {/* Bounce points at floor */}
    <circle cx="150" cy="200" r="6" fill="#B8923F"/>
    <circle cx="250" cy="210" r="6" fill="#B8923F"/>
    <circle cx="350" cy="195" r="6" fill="#B8923F"/>
    <circle cx="450" cy="205" r="6" fill="#B8923F"/>
    
    {/* Annotation */}
    <rect x="180" y="258" width="240" height="32" fill="#FBF7EC" rx="8" stroke="#E2C273" strokeWidth="1"/>
    <text x="300" y="275" textAnchor="middle" fontSize="10" fill="#654B26">Also called: Range-bound, Consolidation,</text>
    <text x="300" y="287" textAnchor="middle" fontSize="10" fill="#654B26">or "Choppy" market</text>
  </svg>
);

// SVG 6: Swings Within Trends
const SwingsWithinTrendsSVG = () => (
  <svg viewBox="0 0 600 320" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">Markets Don't Move in Straight Lines</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#717680">Even in a strong trend, prices swing up and down</text>
    
    {/* Left - Myth */}
    <rect x="30" y="70" width="250" height="220" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
    <text x="155" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">❌ What beginners expect</text>
    
    <g transform="translate(155, 175)">
      <rect x="-90" y="-60" width="180" height="120" fill="#ffffff" rx="8" stroke="#F6C3C3" strokeWidth="1"/>
      
      {/* Straight line up */}
      <path 
        d="M-70 45 L70 -45" 
        fill="none" 
        stroke="#A0A3AA" 
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      <text x="0" y="70" textAnchor="middle" fontSize="9" fill="#842428">Straight line up</text>
    </g>
    
    {/* Right - Reality */}
    <rect x="320" y="70" width="250" height="220" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
    <text x="445" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A">✓ What actually happens</text>
    
    <g transform="translate(445, 175)">
      <rect x="-90" y="-60" width="180" height="120" fill="#ffffff" rx="8" stroke="#BBF7D0" strokeWidth="1"/>
      
      {/* Zigzag line trending up */}
      <path 
        d="M-70 45 L-50 25 L-35 38 L-15 15 L5 30 L25 5 L45 20 L70 -30" 
        fill="none" 
        stroke="#16A34A" 
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Dots at turns */}
      <circle cx="-50" cy="25" r="4" fill="#16A34A"/>
      <circle cx="-15" cy="15" r="4" fill="#16A34A"/>
      <circle cx="25" cy="5" r="4" fill="#16A34A"/>
      
      <text x="0" y="70" textAnchor="middle" fontSize="9" fill="#16A34A">Zigzag pattern trending up</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="120" y="298" width="360" height="18" fill="#E0E7F1" rx="6"/>
    <text x="300" y="310" textAnchor="middle" fontSize="9" fill="#344C72">These swings are natural — they don't invalidate the trend</text>
  </svg>
);

// SVG 7: Practical Example - Asset Rising
const AssetRisingExampleSVG = () => (
  <svg viewBox="0 0 600 280" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="300" y="25" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Example: Asset in an Uptrend</text>
    
    {/* Chart area */}
    <rect x="60" y="50" width="480" height="180" fill="#ffffff" rx="10" stroke="#E4E4EA" strokeWidth="2"/>
    
    {/* Y-axis */}
    <text x="50" y="70" textAnchor="end" fontSize="9" fill="#A0A3AA">$60</text>
    <text x="50" y="115" textAnchor="end" fontSize="9" fill="#A0A3AA">$50</text>
    <text x="50" y="160" textAnchor="end" fontSize="9" fill="#A0A3AA">$40</text>
    <text x="50" y="205" textAnchor="end" fontSize="9" fill="#A0A3AA">$30</text>
    
    {/* Grid */}
    <line x1="70" y1="70" x2="530" y2="70" stroke="#EEEEF1" strokeWidth="1"/>
    <line x1="70" y1="115" x2="530" y2="115" stroke="#EEEEF1" strokeWidth="1"/>
    <line x1="70" y1="160" x2="530" y2="160" stroke="#EEEEF1" strokeWidth="1"/>
    <line x1="70" y1="205" x2="530" y2="205" stroke="#EEEEF1" strokeWidth="1"/>
    
    {/* X-axis time labels */}
    <text x="120" y="243" textAnchor="middle" fontSize="9" fill="#A0A3AA">Week 1</text>
    <text x="230" y="243" textAnchor="middle" fontSize="9" fill="#A0A3AA">Week 2</text>
    <text x="340" y="243" textAnchor="middle" fontSize="9" fill="#A0A3AA">Week 3</text>
    <text x="450" y="243" textAnchor="middle" fontSize="9" fill="#A0A3AA">Week 4</text>
    
    {/* Uptrend line */}
    <path 
      d="M90 195 L140 165 L180 180 L230 140 L280 155 L340 110 L400 125 L460 85 L510 70" 
      fill="none" 
      stroke="#16A34A" 
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Key points */}
    <circle cx="90" cy="195" r="5" fill="#16A34A"/>
    <circle cx="230" cy="140" r="5" fill="#16A34A"/>
    <circle cx="340" cy="110" r="5" fill="#16A34A"/>
    <circle cx="510" cy="70" r="5" fill="#16A34A"/>
    
    {/* Price annotations */}
    <text x="90" y="212" textAnchor="middle" fontSize="8" fill="#16A34A">$32</text>
    <text x="510" y="62" textAnchor="middle" fontSize="8" fill="#16A34A">$58</text>
    
    {/* Bottom note */}
    <rect x="150" y="255" width="300" height="20" fill="#F0FDF4" rx="6"/>
    <text x="300" y="269" textAnchor="middle" fontSize="10" fill="#16A34A">Overall direction: UP (with natural pullbacks)</text>
  </svg>
);

// SVG 8: Practical Example - Asset Falling
const AssetFallingExampleSVG = () => (
  <svg viewBox="0 0 600 280" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="300" y="25" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Example: Asset in a Downtrend</text>
    
    {/* Chart area */}
    <rect x="60" y="50" width="480" height="180" fill="#ffffff" rx="10" stroke="#E4E4EA" strokeWidth="2"/>
    
    {/* Y-axis */}
    <text x="50" y="70" textAnchor="end" fontSize="9" fill="#A0A3AA">$80</text>
    <text x="50" y="115" textAnchor="end" fontSize="9" fill="#A0A3AA">$70</text>
    <text x="50" y="160" textAnchor="end" fontSize="9" fill="#A0A3AA">$60</text>
    <text x="50" y="205" textAnchor="end" fontSize="9" fill="#A0A3AA">$50</text>
    
    {/* Grid */}
    <line x1="70" y1="70" x2="530" y2="70" stroke="#EEEEF1" strokeWidth="1"/>
    <line x1="70" y1="115" x2="530" y2="115" stroke="#EEEEF1" strokeWidth="1"/>
    <line x1="70" y1="160" x2="530" y2="160" stroke="#EEEEF1" strokeWidth="1"/>
    <line x1="70" y1="205" x2="530" y2="205" stroke="#EEEEF1" strokeWidth="1"/>
    
    {/* X-axis time labels */}
    <text x="120" y="243" textAnchor="middle" fontSize="9" fill="#A0A3AA">Week 1</text>
    <text x="230" y="243" textAnchor="middle" fontSize="9" fill="#A0A3AA">Week 2</text>
    <text x="340" y="243" textAnchor="middle" fontSize="9" fill="#A0A3AA">Week 3</text>
    <text x="450" y="243" textAnchor="middle" fontSize="9" fill="#A0A3AA">Week 4</text>
    
    {/* Downtrend line */}
    <path 
      d="M90 70 L140 95 L180 80 L230 120 L280 105 L340 150 L400 135 L460 175 L510 200" 
      fill="none" 
      stroke="#E04848" 
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Key points */}
    <circle cx="90" cy="70" r="5" fill="#E04848"/>
    <circle cx="230" cy="120" r="5" fill="#E04848"/>
    <circle cx="340" cy="150" r="5" fill="#E04848"/>
    <circle cx="510" cy="200" r="5" fill="#E04848"/>
    
    {/* Price annotations */}
    <text x="90" y="62" textAnchor="middle" fontSize="8" fill="#C7363B">$78</text>
    <text x="510" y="217" textAnchor="middle" fontSize="8" fill="#C7363B">$52</text>
    
    {/* Bottom note */}
    <rect x="150" y="255" width="300" height="20" fill="#FBE1E1" rx="6"/>
    <text x="300" y="269" textAnchor="middle" fontSize="10" fill="#842428">Overall direction: DOWN (with natural bounces)</text>
  </svg>
);

const TechnicalAnalysisLesson3 = () => {
  const navigate = useNavigate();

  const quizQuestions = [
    {
      question: "What defines an uptrend?",
      options: [
        "Price moves in a straight line upward",
        "Price makes higher highs and higher lows",
        "Price never goes down",
        "Volume increases every day"
      ],
      correctAnswer: "Price makes higher highs and higher lows",
      explanation: "An uptrend is characterized by a series of higher highs (each peak is higher than the previous) and higher lows (each dip is higher than the previous). Price doesn't move in straight lines — it swings up and down while maintaining an overall upward direction."
    },
    {
      question: "In a sideways market, what happens to price?",
      options: [
        "It moves steadily upward",
        "It moves steadily downward",
        "It bounces between a ceiling and floor with no clear direction",
        "It stays at exactly the same price"
      ],
      correctAnswer: "It bounces between a ceiling and floor with no clear direction",
      explanation: "A sideways (or range-bound) market has no clear directional trend. Price oscillates between an upper boundary (ceiling) and a lower boundary (floor), moving up and down without making sustained progress in either direction."
    }
  ];

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/learn/technical-analysis')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <FaArrowLeft />
            <span>Back to Technical Analysis</span>
          </button>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Lesson 3 of 7
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mt-4 tracking-[-0.025em]">Trends & Market Direction</h1>
            <p className="text-gray-600 mt-2">Understanding how markets move and why direction matters</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.025em]">Why Direction Matters</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              When you look at a price chart for the first time, it can seem like random noise — 
              prices bouncing around without any logic. But there's often an underlying 
              <strong> direction</strong> to the movement that gives you valuable context.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Understanding market direction doesn't mean predicting where price will go next. 
              It means recognizing the <strong>general flow</strong> of the market — whether 
              prices are generally rising, falling, or moving sideways.
            </p>
            <p className="text-lg leading-relaxed">
              This context helps you make sense of individual price movements and understand 
              the broader environment in which they're occurring.
            </p>
          </div>

          <WhyDirectionMattersSVG />
          
          <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-200">
            <p className="text-blue-800">
              <strong>Key insight:</strong> Direction provides context, not certainty. 
              Knowing the trend doesn't tell you what will happen — it helps you understand 
              what has been happening.
            </p>
          </div>
        </div>

        {/* The Three Directions */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">The Three Market Directions</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              At any given time, a market is doing one of three things: <strong>trending up</strong>, 
              <strong>trending down</strong>, or <strong>moving sideways</strong>. These are the 
              only three possibilities, and understanding each one is fundamental to reading charts.
            </p>
          </div>

          <ThreeDirectionsSVG />

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="bg-brand-soft rounded-xl p-5 border border-brand-line">
              <h4 className="font-semibold text-brand mb-2">📈 Uptrend</h4>
              <p className="text-brand text-sm">
                Prices are generally rising. Buyers are in control. Each swing high and 
                swing low is higher than the previous one.
              </p>
            </div>
            <div className="bg-red-50 rounded-xl p-5 border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">📉 Downtrend</h4>
              <p className="text-red-900 text-sm">
                Prices are generally falling. Sellers are in control. Each swing high and 
                swing low is lower than the previous one.
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">↔️ Sideways</h4>
              <p className="text-amber-900 text-sm">
                Prices are bouncing in a range. Neither buyers nor sellers have control. 
                No clear direction is established.
              </p>
            </div>
          </div>
        </div>

        {/* Uptrend Explanation */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Understanding Uptrends</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              An <strong>uptrend</strong> isn't a straight line going up. Markets don't work that way. 
              Instead, an uptrend is a series of <strong>higher highs</strong> and <strong>higher lows</strong>.
            </p>
            <p className="text-lg leading-relaxed">
              Think of it like climbing a staircase: you go up, rest on a step, maybe dip down slightly 
              to gather strength, then climb higher. Each rest point (low) is higher than the last, 
              and each peak (high) is also higher than the last.
            </p>
          </div>

          <UptrendExplainedSVG />
          
          <div className="mt-6 bg-slate-100 rounded-xl p-5">
            <p className="text-slate-700">
              <strong>Higher Highs:</strong> Each peak in price is higher than the previous peak.<br/>
              <strong>Higher Lows:</strong> Each dip in price is higher than the previous dip.<br/>
              When you see both of these together, you're looking at an uptrend.
            </p>
          </div>
        </div>

        {/* Downtrend Explanation */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Understanding Downtrends</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              A <strong>downtrend</strong> is the opposite of an uptrend. It's a series of 
              <strong> lower highs</strong> and <strong>lower lows</strong>.
            </p>
            <p className="text-lg leading-relaxed">
              Imagine walking down a staircase: you step down, maybe bounce up slightly, but 
              your overall movement is downward. Each bounce (high) is lower than the last, 
              and each step down (low) is also lower than the last.
            </p>
          </div>

          <DowntrendExplainedSVG />
          
          <div className="mt-6 bg-slate-100 rounded-xl p-5">
            <p className="text-slate-700">
              <strong>Lower Highs:</strong> Each peak in price is lower than the previous peak.<br/>
              <strong>Lower Lows:</strong> Each dip in price is lower than the previous dip.<br/>
              When you see both of these together, you're looking at a downtrend.
            </p>
          </div>
        </div>

        {/* Sideways Explanation */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Understanding Sideways Markets</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Sometimes, the market has <strong>no clear direction</strong>. Price bounces up and down 
              within a range, hitting a ceiling (resistance area) and a floor (support area) 
              without breaking through either.
            </p>
            <p className="text-lg leading-relaxed">
              This is called a <strong>sideways market</strong>, also known as a range-bound market 
              or consolidation. Neither buyers nor sellers have gained the upper hand — it's a 
              tug-of-war with no winner yet.
            </p>
          </div>

          <SidewaysExplainedSVG />
          
          <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
            <p className="text-amber-800">
              <strong>Good to know:</strong> Sideways markets can be frustrating because there's no 
              clear trend to observe. Many traders prefer to wait for a direction to emerge 
              rather than trying to trade in choppy conditions.
            </p>
          </div>
        </div>

        {/* Swings Within Trends */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Markets Don't Move in Straight Lines</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              One of the most important things beginners need to understand: <strong>even in a 
              strong trend, prices swing up and down</strong>. This is completely normal.
            </p>
            <p className="text-lg leading-relaxed">
              An uptrend doesn't mean price goes up every single day. A downtrend doesn't mean 
              price falls constantly. There are always pullbacks, bounces, and temporary reversals. 
              What matters is the <strong>overall direction</strong> of those swings.
            </p>
          </div>

          <SwingsWithinTrendsSVG />
          
          <div className="mt-6 bg-slate-700 rounded-xl p-5 text-white">
            <p className="font-medium">
              💡 Don't be fooled by short-term movements within a larger trend. A single down day 
              doesn't end an uptrend, just as a single up day doesn't end a downtrend. Look at 
              the bigger picture.
            </p>
          </div>
        </div>

        {/* Practical Examples */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Practical Examples</h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">📌 Example 1: Asset in an Uptrend</h3>
            <p className="text-gray-700 mb-4">
              Imagine an asset that starts at <strong>$32</strong> and over four weeks moves to 
              <strong>$58</strong>. Along the way, it doesn't go straight up — it has pullbacks 
              and consolidation periods. But the overall structure shows higher highs and higher lows.
            </p>
          </div>

          <AssetRisingExampleSVG />

          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 my-6 border border-red-200">
            <h3 className="text-xl font-semibold text-red-800 mb-4">📌 Example 2: Asset in a Downtrend</h3>
            <p className="text-gray-700 mb-4">
              Now imagine an asset that starts at <strong>$78</strong> and over four weeks falls to 
              <strong>$52</strong>. It doesn't fall in a straight line — there are bounces along the way. 
              But the overall structure shows lower highs and lower lows.
            </p>
          </div>

          <AssetFallingExampleSVG />
          
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-brand-soft rounded-xl p-5 border border-brand-line">
              <h4 className="font-semibold text-brand mb-2">Uptrend Observation</h4>
              <p className="text-brand text-sm">
                Price rose from $32 to $58 — an increase of 81%. The trend provided context 
                that buying pressure was dominant during this period.
              </p>
            </div>
            <div className="bg-red-50 rounded-xl p-5 border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">Downtrend Observation</h4>
              <p className="text-red-900 text-sm">
                Price fell from $78 to $52 — a decrease of 33%. The trend provided context 
                that selling pressure was dominant during this period.
              </p>
            </div>
          </div>
        </div>

        {/* India-specific Note */}
        <div className="bg-indigo-50 rounded-2xl p-6 shadow-lg mb-8 border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-800 mb-3">🌍 Global Context</h3>
          <p className="text-indigo-900">
            Trends appear in every market around the world — whether you're looking at stocks 
            in New York, commodities in London, or indices in Mumbai. The concept of higher highs, 
            higher lows (and their opposite) is universal. The same trend structures you see in 
            global markets appear in Indian markets as well. This makes trend analysis a 
            transferable skill across all markets.
          </p>
        </div>

        {/* Quiz Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">📝 Knowledge Check</h2>
          {quizQuestions.map((q, index) => (
            <QuizQuestion key={index} {...q} />
          ))}
        </div>

        {/* Reflection Activity */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-purple-500 rounded-full p-3">
              <FaLightbulb className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-purple-800 mb-3">Reflection Activity</h3>
              <div className="bg-white rounded-xl p-5 border border-purple-200">
                <p className="text-gray-800 font-medium mb-3">
                  Take a moment to consider:
                </p>
                <p className="text-gray-700 mb-4 italic">
                  "Why might it feel easier to move with the direction of a trend rather than 
                  against it? Think about swimming in a river — what's the difference between 
                  swimming with the current versus against it?"
                </p>
                <p className="text-gray-600 text-sm">
                  This isn't about right or wrong answers. It's about developing intuition for 
                  why trend awareness matters. When you understand the general flow, you have 
                  more context for any decisions you might make.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="rounded-2xl p-8 shadow-lg mb-8 text-white bg-brand-fill">
          <h3 className="text-xl font-semibold mb-3">🔑 Key Takeaways</h3>
          <ul className="space-y-2 text-lg">
            <li>• Markets move in three directions: up, down, or sideways</li>
            <li>• An uptrend = higher highs + higher lows</li>
            <li>• A downtrend = lower highs + lower lows</li>
            <li>• Sideways = price bouncing in a range with no clear direction</li>
            <li>• Markets don't move in straight lines — swings are normal</li>
            <li>• Trends provide context, not predictions</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/technical-analysis-lesson-2')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-colors"
          >
            <FaArrowLeft />
            <span>Previous Lesson</span>
          </button>
          <button
            onClick={() => navigate('/learn/technical-analysis-lesson-4')}
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

export default TechnicalAnalysisLesson3;
