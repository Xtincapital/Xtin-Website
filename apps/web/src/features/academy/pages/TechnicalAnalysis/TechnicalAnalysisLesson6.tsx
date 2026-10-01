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
                : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
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

// SVG 1: Why Indicators Exist
const WhyIndicatorsExistSVG = () => (
  <svg viewBox="0 0 600 280" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Why Do Indicators Exist?</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#64748b">They help summarize and visualize price behavior in different ways</text>
    
    {/* Flow diagram */}
    {/* Price Data */}
    <rect x="50" y="90" width="140" height="80" fill="#e0f2fe" rx="12" stroke="#0ea5e9" strokeWidth="2"/>
    <text x="120" y="120" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0369a1">Raw Price Data</text>
    <text x="120" y="138" textAnchor="middle" fontSize="9" fill="#0c4a6e">Open, High, Low, Close</text>
    <text x="120" y="152" textAnchor="middle" fontSize="9" fill="#0c4a6e">Volume, Time</text>
    
    {/* Arrow */}
    <path d="M200 130 L240 130" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#64748b"/>
      </marker>
    </defs>
    
    {/* Calculation */}
    <rect x="250" y="90" width="100" height="80" fill="#fef3c7" rx="12" stroke="#f59e0b" strokeWidth="2"/>
    <text x="300" y="120" textAnchor="middle" fontSize="11" fontWeight="600" fill="#b45309">Mathematical</text>
    <text x="300" y="138" textAnchor="middle" fontSize="11" fontWeight="600" fill="#b45309">Processing</text>
    <text x="300" y="155" textAnchor="middle" fontSize="9" fill="#92400e">Averages, ratios</text>
    
    {/* Arrow */}
    <path d="M360 130 L400 130" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
    
    {/* Indicator Output */}
    <rect x="410" y="90" width="140" height="80" fill="#f0fdf4" rx="12" stroke="#22c55e" strokeWidth="2"/>
    <text x="480" y="120" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16a34a">Indicator</text>
    <text x="480" y="138" textAnchor="middle" fontSize="9" fill="#166534">A visual representation</text>
    <text x="480" y="152" textAnchor="middle" fontSize="9" fill="#166534">of processed data</text>
    
    {/* Bottom note */}
    <rect x="100" y="200" width="400" height="60" fill="#f1f5f9" rx="10"/>
    <text x="300" y="222" textAnchor="middle" fontSize="10" fontWeight="500" fill="#334155">Key Understanding</text>
    <text x="300" y="240" textAnchor="middle" fontSize="9" fill="#64748b">Indicators don't create new information — they repackage existing price data</text>
    <text x="300" y="254" textAnchor="middle" fontSize="9" fill="#64748b">in ways that may help you see certain aspects more clearly</text>
  </svg>
);

// SVG 2: Indicators Lag Price
const IndicatorLagSVG = () => (
  <svg viewBox="0 0 600 320" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#334155">Indicators Lag Behind Price</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#64748b">Because they're calculated from past prices, indicators always react after the fact</text>
    
    {/* Chart area */}
    <rect x="50" y="70" width="500" height="180" fill="#ffffff" rx="12" stroke="#e2e8f0" strokeWidth="2"/>
    
    {/* Price line - turns first */}
    <path 
      d="M70 200 L120 180 L170 165 L220 140 L270 120 L320 100 L350 95 L380 100 L420 120 L470 150 L530 180" 
      fill="none" 
      stroke="#3b82f6" 
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Indicator line - lags behind */}
    <path 
      d="M70 195 L130 185 L190 170 L250 150 L310 125 L370 110 L420 115 L470 135 L530 165" 
      fill="none" 
      stroke="#f97316" 
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Turning point annotation */}
    <circle cx="350" cy="95" r="8" fill="none" stroke="#3b82f6" strokeWidth="2"/>
    <line x1="350" y1="78" x2="350" y2="60" stroke="#3b82f6" strokeWidth="1.5"/>
    <text x="350" y="55" textAnchor="middle" fontSize="9" fill="#1d4ed8">Price turns here</text>
    
    <circle cx="420" cy="115" r="8" fill="none" stroke="#f97316" strokeWidth="2"/>
    <line x1="420" y1="132" x2="420" y2="150" stroke="#f97316" strokeWidth="1.5"/>
    <text x="420" y="165" textAnchor="middle" fontSize="9" fill="#c2410c">Indicator reacts later</text>
    
    {/* Lag annotation */}
    <path d="M350 85 L420 85" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 3"/>
    <text x="385" y="80" textAnchor="middle" fontSize="8" fill="#64748b">LAG</text>
    
    {/* Legend */}
    <rect x="150" y="265" width="300" height="45" fill="#f1f5f9" rx="10"/>
    <line x1="180" y1="280" x2="210" y2="280" stroke="#3b82f6" strokeWidth="2.5"/>
    <text x="220" y="283" fontSize="10" fill="#1d4ed8">Price (moves first)</text>
    <line x1="180" y1="298" x2="210" y2="298" stroke="#f97316" strokeWidth="2.5"/>
    <text x="220" y="301" fontSize="10" fill="#c2410c">Indicator (follows later)</text>
  </svg>
);

// SVG 3: Indicator Categories
const IndicatorCategoriesSVG = () => (
  <svg viewBox="0 0 640 300" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="640" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="320" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#334155">Common Indicator Categories</text>
    <text x="320" y="48" textAnchor="middle" fontSize="11" fill="#64748b">Different types of indicators attempt to measure different aspects</text>
    
    {/* Trend Category */}
    <rect x="30" y="75" width="180" height="190" fill="#e0f2fe" rx="12" stroke="#0ea5e9" strokeWidth="2"/>
    <text x="120" y="100" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0369a1">Trend</text>
    <text x="120" y="118" textAnchor="middle" fontSize="9" fill="#0c4a6e">Direction over time</text>
    
    <g transform="translate(120, 175)">
      <rect x="-60" y="-40" width="120" height="80" fill="#ffffff" rx="8" stroke="#7dd3fc" strokeWidth="1"/>
      {/* Simple uptrend with MA */}
      <path d="M-45 30 L-20 15 L5 5 L30 -10 L45 -25" fill="none" stroke="#94a3b8" strokeWidth="1.5"/>
      <path d="M-45 25 L-10 10 L25 -5 L45 -15" fill="none" stroke="#0ea5e9" strokeWidth="2"/>
    </g>
    <text x="120" y="250" textAnchor="middle" fontSize="8" fill="#0c4a6e">Shows overall direction</text>
    
    {/* Momentum Category */}
    <rect x="230" y="75" width="180" height="190" fill="#fef3c7" rx="12" stroke="#f59e0b" strokeWidth="2"/>
    <text x="320" y="100" textAnchor="middle" fontSize="13" fontWeight="600" fill="#b45309">Momentum</text>
    <text x="320" y="118" textAnchor="middle" fontSize="9" fill="#92400e">Speed of price changes</text>
    
    <g transform="translate(320, 175)">
      <rect x="-60" y="-40" width="120" height="80" fill="#ffffff" rx="8" stroke="#fcd34d" strokeWidth="1"/>
      {/* Oscillator-style indicator */}
      <line x1="-50" y1="0" x2="50" y2="0" stroke="#e5e7eb" strokeWidth="1"/>
      <path d="M-45 15 L-25 -20 L-5 25 L15 -15 L35 20 L45 -5" fill="none" stroke="#f59e0b" strokeWidth="2"/>
    </g>
    <text x="320" y="250" textAnchor="middle" fontSize="8" fill="#92400e">Shows strength of moves</text>
    
    {/* Volatility Category */}
    <rect x="430" y="75" width="180" height="190" fill="#f3e8ff" rx="12" stroke="#a855f7" strokeWidth="2"/>
    <text x="520" y="100" textAnchor="middle" fontSize="13" fontWeight="600" fill="#7c3aed">Volatility</text>
    <text x="520" y="118" textAnchor="middle" fontSize="9" fill="#6b21a8">Range of price swings</text>
    
    <g transform="translate(520, 175)">
      <rect x="-60" y="-40" width="120" height="80" fill="#ffffff" rx="8" stroke="#d8b4fe" strokeWidth="1"/>
      {/* Volatility bands */}
      <path d="M-45 0 L0 0 L45 0" fill="none" stroke="#94a3b8" strokeWidth="1.5"/>
      <path d="M-45 -20 L-20 -25 L5 -15 L30 -30 L45 -20" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 2"/>
      <path d="M-45 20 L-20 25 L5 15 L30 30 L45 20" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 2"/>
    </g>
    <text x="520" y="250" textAnchor="middle" fontSize="8" fill="#6b21a8">Shows how much price swings</text>
  </svg>
);

// SVG 4: Conflicting Signals
const ConflictingSignalsSVG = () => (
  <svg viewBox="0 0 600 380" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="380" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#334155">Different Indicators, Different Views</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#64748b">The same price chart can produce conflicting interpretations</text>
    
    {/* Main price chart */}
    <rect x="50" y="70" width="500" height="100" fill="#ffffff" rx="10" stroke="#e2e8f0" strokeWidth="2"/>
    <text x="60" y="85" fontSize="9" fill="#64748b">Price</text>
    <path 
      d="M70 130 L120 115 L170 125 L220 105 L270 115 L320 95 L370 110 L420 100 L470 105 L530 90" 
      fill="none" 
      stroke="#3b82f6" 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Indicator A - shows bullish */}
    <rect x="50" y="180" width="240" height="80" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="2"/>
    <text x="60" y="198" fontSize="9" fontWeight="500" fill="#166534">Indicator A</text>
    <g transform="translate(170, 225)">
      <path d="M-100 20 L-60 10 L-20 -5 L20 -15 L60 -20 L100 -25" fill="none" stroke="#22c55e" strokeWidth="2"/>
    </g>
    <text x="170" y="270" textAnchor="middle" fontSize="9" fill="#166534">↑ Suggests strength</text>
    
    {/* Indicator B - shows bearish */}
    <rect x="310" y="180" width="240" height="80" fill="#fee2e2" rx="10" stroke="#fca5a5" strokeWidth="2"/>
    <text x="320" y="198" fontSize="9" fontWeight="500" fill="#991b1b">Indicator B</text>
    <g transform="translate(430, 225)">
      <path d="M-100 -20 L-60 -15 L-20 -5 L20 5 L60 15 L100 25" fill="none" stroke="#ef4444" strokeWidth="2"/>
    </g>
    <text x="430" y="270" textAnchor="middle" fontSize="9" fill="#991b1b">↓ Suggests weakness</text>
    
    {/* Confusion indicator */}
    <rect x="150" y="290" width="300" height="70" fill="#fef3c7" rx="10" stroke="#fcd34d" strokeWidth="2"/>
    <text x="300" y="315" textAnchor="middle" fontSize="12" fontWeight="600" fill="#b45309">🤔 Which one is "right"?</text>
    <text x="300" y="335" textAnchor="middle" fontSize="9" fill="#92400e">Neither — they measure different things and can both be valid</text>
    <text x="300" y="350" textAnchor="middle" fontSize="9" fill="#92400e">This is why relying on indicators alone is problematic</text>
  </svg>
);

// SVG 5: Indicator Overload
const IndicatorOverloadSVG = () => (
  <svg viewBox="0 0 640 340" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="640" height="340" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="320" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#334155">More Indicators ≠ Better Clarity</text>
    <text x="320" y="48" textAnchor="middle" fontSize="11" fill="#64748b">Adding more tools often creates more confusion, not less</text>
    
    {/* Left - Overloaded chart */}
    <rect x="30" y="70" width="275" height="240" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
    <text x="167" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#dc2626">❌ Indicator Overload</text>
    
    <g transform="translate(167, 185)">
      <rect x="-105" y="-70" width="210" height="140" fill="#ffffff" rx="8" stroke="#fecaca" strokeWidth="1"/>
      
      {/* Messy overlapping indicators */}
      <path d="M-85 30 L-50 10 L-20 25 L10 5 L40 20 L70 -10 L85 0" fill="none" stroke="#94a3b8" strokeWidth="1.5"/>
      <path d="M-85 20 L-40 15 L0 5 L40 -5 L85 -15" fill="none" stroke="#3b82f6" strokeWidth="1.5"/>
      <path d="M-85 40 L-30 25 L20 35 L60 15 L85 25" fill="none" stroke="#22c55e" strokeWidth="1.5"/>
      <path d="M-85 -20 L-50 -30 L-10 -15 L30 -35 L70 -20 L85 -30" fill="none" stroke="#f97316" strokeWidth="1.5"/>
      <path d="M-85 -10 L-40 0 L10 -20 L50 -5 L85 -25" fill="none" stroke="#a855f7" strokeWidth="1.5"/>
      <path d="M-85 50 L-30 35 L30 50 L85 30" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2"/>
      
      {/* Confusion marks */}
      <text x="-60" y="-45" fontSize="12" fill="#dc2626">?</text>
      <text x="20" y="55" fontSize="12" fill="#dc2626">?</text>
      <text x="60" y="-40" fontSize="12" fill="#dc2626">?</text>
    </g>
    
    <text x="167" y="290" textAnchor="middle" fontSize="9" fill="#991b1b">"What am I even looking at?"</text>
    <text x="167" y="303" textAnchor="middle" fontSize="9" fill="#991b1b">Too much noise, no clarity</text>
    
    {/* Right - Clean chart */}
    <rect x="335" y="70" width="275" height="240" fill="#f0fdf4" rx="12" stroke="#86efac" strokeWidth="2"/>
    <text x="472" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16a34a">✓ Clean & Focused</text>
    
    <g transform="translate(472, 185)">
      <rect x="-105" y="-70" width="210" height="140" fill="#ffffff" rx="8" stroke="#bbf7d0" strokeWidth="1"/>
      
      {/* Clean price with one simple MA */}
      <path d="M-85 30 L-50 10 L-20 25 L10 5 L40 20 L70 -10 L85 0" fill="none" stroke="#64748b" strokeWidth="2"/>
      <path d="M-85 25 L-40 15 L5 8 L50 -2 L85 -8" fill="none" stroke="#22c55e" strokeWidth="2.5"/>
    </g>
    
    <text x="472" y="290" textAnchor="middle" fontSize="9" fill="#166534">"Price is above its average"</text>
    <text x="472" y="303" textAnchor="middle" fontSize="9" fill="#166534">Simple context, easy to understand</text>
  </svg>
);

// SVG 6: Indicators Describe, Don't Decide
const DescribeDontDecideSVG = () => (
  <svg viewBox="0 0 640 280" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="640" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="320" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#334155">Indicators Describe, They Don't Decide</text>
    <text x="320" y="48" textAnchor="middle" fontSize="11" fill="#64748b">Understanding the proper role of indicators</text>
    
    {/* Wrong approach */}
    <rect x="30" y="70" width="275" height="180" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
    <text x="167" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#dc2626">❌ Wrong Expectation</text>
    
    <g transform="translate(167, 160)">
      {/* Indicator pointing to action */}
      <rect x="-80" y="-40" width="160" height="50" fill="#fee2e2" rx="8" stroke="#fca5a5" strokeWidth="1"/>
      <text x="0" y="-15" textAnchor="middle" fontSize="10" fill="#991b1b">Indicator says:</text>
      <text x="0" y="5" textAnchor="middle" fontSize="12" fontWeight="600" fill="#dc2626">"BUY NOW!"</text>
      
      <path d="M0 20 L0 40" stroke="#dc2626" strokeWidth="2"/>
      <path d="M-6 34 L0 40 L6 34" fill="none" stroke="#dc2626" strokeWidth="2"/>
    </g>
    
    <text x="167" y="225" textAnchor="middle" fontSize="9" fill="#991b1b">Treating indicators as commands</text>
    <text x="167" y="238" textAnchor="middle" fontSize="9" fill="#991b1b">leads to mechanical mistakes</text>
    
    {/* Right approach */}
    <rect x="335" y="70" width="275" height="180" fill="#f0fdf4" rx="12" stroke="#86efac" strokeWidth="2"/>
    <text x="472" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16a34a">✓ Correct Understanding</text>
    
    <g transform="translate(472, 160)">
      {/* Indicator providing context */}
      <rect x="-80" y="-40" width="160" height="50" fill="#dcfce7" rx="8" stroke="#86efac" strokeWidth="1"/>
      <text x="0" y="-15" textAnchor="middle" fontSize="10" fill="#166534">Indicator shows:</text>
      <text x="0" y="5" textAnchor="middle" fontSize="11" fontWeight="500" fill="#166534">"Momentum is rising"</text>
      
      <text x="0" y="35" textAnchor="middle" fontSize="9" fill="#166534">↓</text>
      <text x="0" y="50" textAnchor="middle" fontSize="9" fill="#166534">Context, not instruction</text>
    </g>
    
    <text x="472" y="225" textAnchor="middle" fontSize="9" fill="#166534">Using indicators as one piece</text>
    <text x="472" y="238" textAnchor="middle" fontSize="9" fill="#166534">of a larger understanding</text>
  </svg>
);

// SVG 7: Same Price, Different Indicator Views
const SamePriceDifferentViewsSVG = () => (
  <svg viewBox="0 0 600 400" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="400" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="300" y="25" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Same Price Chart, Different Perspectives</text>
    
    {/* Main price chart */}
    <rect x="50" y="45" width="500" height="80" fill="#ffffff" rx="8" stroke="#e2e8f0" strokeWidth="2"/>
    <text x="60" y="60" fontSize="8" fill="#64748b">Price</text>
    <path 
      d="M70 100 L110 85 L150 95 L190 75 L230 85 L270 65 L310 80 L350 60 L390 75 L430 55 L470 70 L510 50 L530 60" 
      fill="none" 
      stroke="#3b82f6" 
      strokeWidth="2"
      strokeLinecap="round"
    />
    
    {/* Trend indicator */}
    <rect x="50" y="135" width="160" height="70" fill="#e0f2fe" rx="8" stroke="#7dd3fc" strokeWidth="1"/>
    <text x="60" y="152" fontSize="8" fontWeight="500" fill="#0369a1">Trend Indicator</text>
    <path d="M65 180 L100 175 L135 168 L170 160 L195 155" fill="none" stroke="#0ea5e9" strokeWidth="2"/>
    <text x="130" y="197" textAnchor="middle" fontSize="8" fill="#0369a1">"Trending up"</text>
    
    {/* Momentum indicator */}
    <rect x="220" y="135" width="160" height="70" fill="#fef3c7" rx="8" stroke="#fcd34d" strokeWidth="1"/>
    <text x="230" y="152" fontSize="8" fontWeight="500" fill="#b45309">Momentum Indicator</text>
    <line x1="235" y1="175" x2="365" y2="175" stroke="#e5e7eb" strokeWidth="1"/>
    <path d="M235 165 L265 180 L295 160 L325 185 L355 168 L365 175" fill="none" stroke="#f59e0b" strokeWidth="2"/>
    <text x="300" y="197" textAnchor="middle" fontSize="8" fill="#b45309">"Mixed / choppy"</text>
    
    {/* Volatility indicator */}
    <rect x="390" y="135" width="160" height="70" fill="#f3e8ff" rx="8" stroke="#d8b4fe" strokeWidth="1"/>
    <text x="400" y="152" fontSize="8" fontWeight="500" fill="#7c3aed">Volatility Indicator</text>
    <path d="M405 178 L440 170 L475 175 L510 165 L535 172" fill="none" stroke="#a855f7" strokeWidth="2"/>
    <text x="470" y="197" textAnchor="middle" fontSize="8" fill="#7c3aed">"Volatility decreasing"</text>
    
    {/* Summary box */}
    <rect x="80" y="220" width="440" height="80" fill="#f1f5f9" rx="10"/>
    <text x="300" y="245" textAnchor="middle" fontSize="11" fontWeight="600" fill="#334155">Three indicators, three different stories</text>
    <text x="300" y="265" textAnchor="middle" fontSize="9" fill="#64748b">• Trend indicator: Price direction is up</text>
    <text x="300" y="280" textAnchor="middle" fontSize="9" fill="#64748b">• Momentum indicator: Recent moves are uneven</text>
    <text x="300" y="295" textAnchor="middle" fontSize="9" fill="#64748b">• Volatility indicator: Swings are getting smaller</text>
    
    {/* Insight */}
    <rect x="100" y="315" width="400" height="70" fill="#e0f2fe" rx="10" stroke="#7dd3fc" strokeWidth="1"/>
    <text x="300" y="340" textAnchor="middle" fontSize="10" fontWeight="600" fill="#0369a1">Key Insight</text>
    <text x="300" y="358" textAnchor="middle" fontSize="9" fill="#0c4a6e">All three can be "correct" at the same time — they just measure</text>
    <text x="300" y="372" textAnchor="middle" fontSize="9" fill="#0c4a6e">different aspects of the same price action</text>
  </svg>
);

// SVG 8: The Proper Role
const ProperRoleSVG = () => (
  <svg viewBox="0 0 600 260" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="260" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="300" y="25" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">The Proper Role of Indicators</text>
    
    {/* Three pillars */}
    <rect x="50" y="50" width="150" height="130" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="2"/>
    <text x="125" y="75" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">✓ DO</text>
    <text x="125" y="100" textAnchor="middle" fontSize="9" fill="#166534">Provide context</text>
    <text x="125" y="118" textAnchor="middle" fontSize="9" fill="#166534">Summarize trends</text>
    <text x="125" y="136" textAnchor="middle" fontSize="9" fill="#166534">Highlight conditions</text>
    <text x="125" y="154" textAnchor="middle" fontSize="9" fill="#166534">Aid visualization</text>
    <text x="125" y="172" textAnchor="middle" fontSize="9" fill="#166534">Simplify complexity</text>
    
    <rect x="225" y="50" width="150" height="130" fill="#fee2e2" rx="10" stroke="#fca5a5" strokeWidth="2"/>
    <text x="300" y="75" textAnchor="middle" fontSize="10" fontWeight="600" fill="#991b1b">✗ DON'T</text>
    <text x="300" y="100" textAnchor="middle" fontSize="9" fill="#991b1b">Predict the future</text>
    <text x="300" y="118" textAnchor="middle" fontSize="9" fill="#991b1b">Give certainty</text>
    <text x="300" y="136" textAnchor="middle" fontSize="9" fill="#991b1b">Replace thinking</text>
    <text x="300" y="154" textAnchor="middle" fontSize="9" fill="#991b1b">Work in isolation</text>
    <text x="300" y="172" textAnchor="middle" fontSize="9" fill="#991b1b">Guarantee outcomes</text>
    
    <rect x="400" y="50" width="150" height="130" fill="#e0f2fe" rx="10" stroke="#7dd3fc" strokeWidth="2"/>
    <text x="475" y="75" textAnchor="middle" fontSize="10" fontWeight="600" fill="#0369a1">REMEMBER</text>
    <text x="475" y="100" textAnchor="middle" fontSize="9" fill="#0369a1">Derived from price</text>
    <text x="475" y="118" textAnchor="middle" fontSize="9" fill="#0369a1">Always lag behind</text>
    <text x="475" y="136" textAnchor="middle" fontSize="9" fill="#0369a1">Can conflict</text>
    <text x="475" y="154" textAnchor="middle" fontSize="9" fill="#0369a1">Less is often more</text>
    <text x="475" y="172" textAnchor="middle" fontSize="9" fill="#0369a1">Context is key</text>
    
    {/* Bottom insight */}
    <rect x="100" y="195" width="400" height="50" fill="#f1f5f9" rx="10"/>
    <text x="300" y="218" textAnchor="middle" fontSize="11" fontWeight="500" fill="#334155">💡 Think of indicators as lenses, not crystal balls</text>
    <text x="300" y="235" textAnchor="middle" fontSize="9" fill="#64748b">They help you see price data differently — they don't see the future</text>
  </svg>
);

const TechnicalAnalysisLesson6 = () => {
  const navigate = useNavigate();

  const quizQuestions = [
    {
      question: "Why do indicators lag behind price?",
      options: [
        "Because they are broken or poorly designed",
        "Because they are calculated from past price data",
        "Because they predict future prices",
        "Because they update only once per day"
      ],
      correctAnswer: "Because they are calculated from past price data",
      explanation: "Indicators are derived from historical price data — they average, sum, or process past prices to produce their readings. This means they can only react after price has already moved, creating an inherent lag."
    },
    {
      question: "What should you understand about using multiple indicators?",
      options: [
        "More indicators always lead to better decisions",
        "Different indicators can show conflicting views of the same price action",
        "All indicators will always agree if the chart is correct",
        "Indicators should be used to make automatic buy/sell decisions"
      ],
      correctAnswer: "Different indicators can show conflicting views of the same price action",
      explanation: "Different indicators measure different things (trend, momentum, volatility). Because they focus on different aspects, they can produce different — even conflicting — readings from the same price data. This is normal, not a flaw."
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
              Lesson 6 of 7
            </span>
            <h1 className="text-3xl font-bold text-gray-800 mt-4">Indicators – Purpose & Limitations</h1>
            <p className="text-gray-600 mt-2">Understanding what indicators can and cannot do</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Indicators Exist</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              If you've spent any time looking at charts online, you've probably seen them covered 
              with colorful lines, histograms, and oscillators. These are <strong>indicators</strong> — 
              mathematical calculations applied to price data to help visualize certain aspects of 
              market behavior.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Indicators exist because raw price data can be hard to interpret. They help 
              <strong> summarize</strong> and <strong>visualize</strong> information in different ways — 
              showing trends, measuring momentum, or highlighting volatility.
            </p>
            <p className="text-lg leading-relaxed">
              But here's where many beginners go wrong: they treat indicators as <strong>fortune-telling 
              tools</strong> that predict the future. They're not. Indicators describe what has 
              happened — they don't decide what will happen.
            </p>
          </div>

          <WhyIndicatorsExistSVG />
          
          <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
            <p className="text-amber-800">
              <strong>Common beginner mistake:</strong> Thinking that the "right" combination of 
              indicators will unlock consistent profits. In reality, indicators are just tools for 
              understanding — not magic formulas.
            </p>
          </div>
        </div>

        {/* What Indicators Are */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">What Are Indicators?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              At their core, indicators are <strong>mathematical transformations of price and/or 
              volume data</strong>. They take raw numbers (open, high, low, close, volume) and 
              process them to create new visual outputs.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The key thing to understand: <strong>indicators don't create new information</strong>. 
              Everything they show is derived from price data you already have. They just present 
              it in a different way that might make certain aspects easier to see.
            </p>
            <p className="text-lg leading-relaxed">
              Think of it like this: price is the raw data. Indicators are different lenses 
              through which you can view that data.
            </p>
          </div>

          <IndicatorCategoriesSVG />
          
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="bg-sky-50 rounded-xl p-5 border border-sky-200">
              <h4 className="font-semibold text-sky-800 mb-2">Trend Indicators</h4>
              <p className="text-sky-900 text-sm">
                Help identify the general direction of price movement over time. Moving averages 
                are the most common example.
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">Momentum Indicators</h4>
              <p className="text-amber-900 text-sm">
                Attempt to measure the speed or strength of price changes. They often oscillate 
                between high and low values.
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Volatility Indicators</h4>
              <p className="text-purple-900 text-sm">
                Show how much price is swinging. They expand when moves are large and contract 
                when moves are small.
              </p>
            </div>
          </div>
        </div>

        {/* Indicators Lag */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Indicators Lag Behind Price</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Because indicators are calculated from <strong>past prices</strong>, they can only 
              react <strong>after</strong> price has already moved. This creates an inherent 
              <strong> lag</strong> — the indicator is always looking backward.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              When price turns direction, the indicator doesn't know immediately. It needs more 
              data points to "catch up" to what's happening. By the time an indicator confirms 
              a move, price may have already traveled significantly.
            </p>
            <p className="text-lg leading-relaxed">
              This lag isn't a flaw — it's a fundamental characteristic of how indicators work. 
              Understanding this helps you set realistic expectations.
            </p>
          </div>

          <IndicatorLagSVG />
          
          <div className="mt-6 bg-slate-700 rounded-xl p-5 text-white">
            <p className="font-medium">
              💡 The more data points an indicator uses (longer lookback), the more it lags. 
              The fewer data points (shorter lookback), the more responsive but also noisier it becomes.
            </p>
          </div>
        </div>

        {/* Conflicting Signals */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Indicators Can Conflict</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              One of the most frustrating experiences for beginners is seeing <strong>different 
              indicators give different signals</strong> on the same chart. One says "strong," 
              another says "weak." Which one is right?
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The answer: <strong>they can both be right</strong>. Different indicators measure 
              different things. A trend indicator might show price is rising while a momentum 
              indicator shows the rises are slowing down. Both observations can be true simultaneously.
            </p>
            <p className="text-lg leading-relaxed">
              This is why blindly following indicator "signals" is problematic. Context and 
              understanding matter more than mechanical readings.
            </p>
          </div>

          <ConflictingSignalsSVG />
        </div>

        {/* Same Price, Different Views */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Same Price, Different Perspectives</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Let's see this in action. The same price movement can produce very different 
              readings across indicator categories. This isn't contradiction — it's each 
              indicator doing its job of measuring its specific aspect of price behavior.
            </p>
          </div>

          <SamePriceDifferentViewsSVG />
          
          <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-200">
            <p className="text-blue-800">
              <strong>Understanding this is crucial:</strong> Indicators aren't trying to agree 
              with each other. Each one answers a different question about the same price data.
            </p>
          </div>
        </div>

        {/* Indicator Overload */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">The Problem with Indicator Overload</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              A natural instinct when learning is to add <strong>more tools</strong> in search of 
              more confidence. "If one indicator is good, surely five must be better!"
            </p>
            <p className="text-lg leading-relaxed mb-4">
              In practice, the opposite is often true. <strong>More indicators usually create more 
              confusion</strong>, not more clarity. You end up with conflicting signals, analysis 
              paralysis, and charts so cluttered you can't see the actual price action anymore.
            </p>
            <p className="text-lg leading-relaxed">
              Simplicity tends to work better. A clean chart with minimal, purposeful tools often 
              provides more insight than a rainbow of overlapping indicators.
            </p>
          </div>

          <IndicatorOverloadSVG />
        </div>

        {/* Describe Don't Decide */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Indicators Describe, They Don't Decide</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              The most important mental shift: <strong>indicators are descriptive, not prescriptive</strong>. 
              They tell you about current conditions — they don't tell you what to do.
            </p>
            <p className="text-lg leading-relaxed">
              When an indicator shows momentum is rising, it's describing a condition. It's not 
              commanding you to act. The description provides context; the decision requires 
              judgment that goes beyond any single indicator.
            </p>
          </div>

          <DescribeDontDecideSVG />
        </div>

        {/* The Proper Role */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">The Proper Role of Indicators</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              When used correctly, indicators can be genuinely helpful — not as prediction tools, 
              but as <strong>context providers</strong>. They can help you quickly assess conditions, 
              visualize trends, and organize your thinking. The key is knowing their limitations.
            </p>
          </div>

          <ProperRoleSVG />
        </div>

        {/* India-specific Note */}
        <div className="bg-indigo-50 rounded-2xl p-6 shadow-lg mb-8 border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-800 mb-3">🌍 Global Context</h3>
          <p className="text-indigo-900">
            Indicator overuse and misunderstanding is a global phenomenon — it's not unique to any 
            market. Traders in New York, London, Tokyo, and Mumbai all face the same temptation to 
            overcomplicate their charts. The principles covered here — understanding lag, accepting 
            conflicting readings, keeping charts clean — apply universally across all markets and 
            asset classes.
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
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-purple-500 rounded-full p-3">
              <FaLightbulb className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-purple-800 mb-3">Reflection Activity</h3>
              <div className="bg-white rounded-xl p-5 border border-purple-200">
                <p className="text-gray-800 font-medium mb-3">
                  Take a moment to consider:
                </p>
                <p className="text-gray-700 mb-4 italic">
                  "Why might using fewer tools actually improve your clarity? Think about times 
                  in life when having too many options or too much information made a decision 
                  harder rather than easier."
                </p>
                <p className="text-gray-600 text-sm">
                  This reflection helps you internalize the value of simplicity. In markets, 
                  as in many areas of life, more complexity doesn't automatically mean better 
                  understanding.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-lg mb-8 text-white">
          <h3 className="text-xl font-bold mb-3">🔑 Key Takeaways</h3>
          <ul className="space-y-2 text-lg">
            <li>• Indicators are derived from price — they don't create new information</li>
            <li>• All indicators lag behind price because they use historical data</li>
            <li>• Different indicators measure different things and can conflict</li>
            <li>• More indicators ≠ better analysis — simplicity often wins</li>
            <li>• Indicators describe conditions, they don't make decisions</li>
            <li>• Think of indicators as lenses, not crystal balls</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/technical-analysis-lesson-5')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-colors"
          >
            <FaArrowLeft />
            <span>Previous Lesson</span>
          </button>
          <button
            onClick={() => navigate('/learn/technical-analysis-lesson-7')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
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

export default TechnicalAnalysisLesson6;
