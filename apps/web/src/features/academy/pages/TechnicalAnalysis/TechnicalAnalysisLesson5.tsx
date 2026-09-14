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

// SVG 1: Why Raw Price Looks Noisy
const NoisyPriceSVG = () => (
  <svg viewBox="0 0 600 280" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Raw Price Can Feel Overwhelming</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#64748b">Every tick, every move — it's hard to see the bigger picture</text>
    
    {/* Chart area */}
    <rect x="50" y="70" width="500" height="170" fill="#ffffff" rx="12" stroke="#e2e8f0" strokeWidth="2"/>
    
    {/* Very noisy price line */}
    <path 
      d="M70 150 L85 135 L95 155 L105 130 L115 145 L125 125 L140 140 L150 120 L165 135 L175 115 L190 130 L200 110 L215 125 L225 105 L240 120 L250 100 L265 115 L280 95 L295 110 L305 90 L320 105 L335 85 L350 100 L365 80 L380 95 L395 75 L410 90 L425 70 L440 85 L455 75 L470 90 L485 70 L500 85 L520 75 L530 80" 
      fill="none" 
      stroke="#94a3b8" 
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Question marks showing confusion */}
    <text x="150" y="180" fontSize="16" fill="#dc2626" fontWeight="500">?</text>
    <text x="280" y="165" fontSize="16" fill="#dc2626" fontWeight="500">?</text>
    <text x="400" y="175" fontSize="16" fill="#dc2626" fontWeight="500">?</text>
    
    {/* Bottom note */}
    <rect x="140" y="248" width="320" height="24" fill="#fef2f2" rx="8" stroke="#fca5a5" strokeWidth="1"/>
    <text x="300" y="264" textAnchor="middle" fontSize="10" fill="#991b1b">Too much detail can obscure the overall direction</text>
  </svg>
);

// SVG 2: What is a Moving Average
const WhatIsMovingAverageSVG = () => (
  <svg viewBox="0 0 600 320" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#334155">What is a Moving Average?</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#64748b">A simple way to smooth price data and see the underlying direction</text>
    
    {/* Left side - concept */}
    <rect x="30" y="70" width="250" height="220" fill="#e0f2fe" rx="12" stroke="#7dd3fc" strokeWidth="2"/>
    <text x="155" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0369a1">The Concept</text>
    
    {/* Visual representation of averaging */}
    <g transform="translate(155, 165)">
      {/* Price points */}
      <circle cx="-80" cy="-30" r="8" fill="#3b82f6"/>
      <text x="-80" y="-45" textAnchor="middle" fontSize="9" fill="#1e40af">$48</text>
      
      <circle cx="-40" cy="-10" r="8" fill="#3b82f6"/>
      <text x="-40" y="-25" textAnchor="middle" fontSize="9" fill="#1e40af">$52</text>
      
      <circle cx="0" cy="-40" r="8" fill="#3b82f6"/>
      <text x="0" y="-55" textAnchor="middle" fontSize="9" fill="#1e40af">$47</text>
      
      <circle cx="40" cy="0" r="8" fill="#3b82f6"/>
      <text x="40" y="-15" textAnchor="middle" fontSize="9" fill="#1e40af">$53</text>
      
      <circle cx="80" cy="-20" r="8" fill="#3b82f6"/>
      <text x="80" y="-35" textAnchor="middle" fontSize="9" fill="#1e40af">$50</text>
      
      {/* Arrow down to average */}
      <path d="M0 20 L0 50" stroke="#0369a1" strokeWidth="2" strokeDasharray="4 3"/>
      <path d="M-6 44 L0 50 L6 44" fill="none" stroke="#0369a1" strokeWidth="2"/>
      
      {/* Average result */}
      <rect x="-50" y="55" width="100" height="30" fill="#0ea5e9" rx="8"/>
      <text x="0" y="75" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">Average: $50</text>
    </g>
    
    <text x="155" y="265" textAnchor="middle" fontSize="9" fill="#0c4a6e">Take recent prices → Calculate average</text>
    <text x="155" y="278" textAnchor="middle" fontSize="9" fill="#0c4a6e">→ Plot that point → Repeat</text>
    
    {/* Right side - result */}
    <rect x="320" y="70" width="250" height="220" fill="#f0fdf4" rx="12" stroke="#86efac" strokeWidth="2"/>
    <text x="445" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16a34a">The Result</text>
    
    <g transform="translate(445, 175)">
      <rect x="-95" y="-60" width="190" height="120" fill="#ffffff" rx="8" stroke="#bbf7d0" strokeWidth="1"/>
      
      {/* Noisy price */}
      <path 
        d="M-75 30 L-55 10 L-40 25 L-20 -5 L0 15 L20 -15 L40 5 L60 -25 L75 -10" 
        fill="none" 
        stroke="#94a3b8" 
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Smooth moving average */}
      <path 
        d="M-75 20 L-45 12 L-15 0 L15 -8 L45 -15 L75 -18" 
        fill="none" 
        stroke="#22c55e" 
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    
    {/* Legend */}
    <g transform="translate(445, 255)">
      <line x1="-60" y1="0" x2="-40" y2="0" stroke="#94a3b8" strokeWidth="1.5"/>
      <text x="-35" y="4" fontSize="9" fill="#64748b">Raw Price</text>
      <line x1="15" y1="0" x2="35" y2="0" stroke="#22c55e" strokeWidth="2.5"/>
      <text x="40" y="4" fontSize="9" fill="#166534">Moving Avg</text>
    </g>
    
    <text x="445" y="280" textAnchor="middle" fontSize="9" fill="#166534">Smoother line reveals the trend</text>
  </svg>
);

// SVG 3: Before and After - Same Price Data
const BeforeAfterSVG = () => (
  <svg viewBox="0 0 640 340" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="640" height="340" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="320" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#334155">Same Data, Different Clarity</text>
    <text x="320" y="48" textAnchor="middle" fontSize="11" fill="#64748b">Adding a moving average helps reveal the underlying direction</text>
    
    {/* Left - Without MA */}
    <rect x="25" y="70" width="285" height="240" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
    <text x="167" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#dc2626">Without Moving Average</text>
    
    <g transform="translate(167, 190)">
      <rect x="-115" y="-70" width="230" height="140" fill="#ffffff" rx="8" stroke="#fecaca" strokeWidth="1"/>
      
      {/* Y axis labels */}
      <text x="-105" y="-50" fontSize="8" fill="#94a3b8">$60</text>
      <text x="-105" y="0" fontSize="8" fill="#94a3b8">$50</text>
      <text x="-105" y="50" fontSize="8" fill="#94a3b8">$40</text>
      
      {/* Noisy price only */}
      <path 
        d="M-85 40 L-70 25 L-55 35 L-40 15 L-25 30 L-10 5 L5 20 L20 -5 L35 15 L50 -15 L65 5 L80 -25 L95 -10 L105 -30" 
        fill="none" 
        stroke="#64748b" 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    
    <text x="167" y="285" textAnchor="middle" fontSize="9" fill="#991b1b">"Is it going up? Down? I can't tell..."</text>
    <text x="167" y="300" textAnchor="middle" fontSize="9" fill="#991b1b">Every wiggle demands attention</text>
    
    {/* Right - With MA */}
    <rect x="330" y="70" width="285" height="240" fill="#f0fdf4" rx="12" stroke="#86efac" strokeWidth="2"/>
    <text x="472" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16a34a">With Moving Average</text>
    
    <g transform="translate(472, 190)">
      <rect x="-115" y="-70" width="230" height="140" fill="#ffffff" rx="8" stroke="#bbf7d0" strokeWidth="1"/>
      
      {/* Y axis labels */}
      <text x="-105" y="-50" fontSize="8" fill="#94a3b8">$60</text>
      <text x="-105" y="0" fontSize="8" fill="#94a3b8">$50</text>
      <text x="-105" y="50" fontSize="8" fill="#94a3b8">$40</text>
      
      {/* Same noisy price */}
      <path 
        d="M-85 40 L-70 25 L-55 35 L-40 15 L-25 30 L-10 5 L5 20 L20 -5 L35 15 L50 -15 L65 5 L80 -25 L95 -10 L105 -30" 
        fill="none" 
        stroke="#94a3b8" 
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Moving average overlay */}
      <path 
        d="M-85 35 L-55 25 L-25 15 L5 5 L35 -5 L65 -12 L95 -18 L105 -22" 
        fill="none" 
        stroke="#22c55e" 
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    
    <text x="472" y="285" textAnchor="middle" fontSize="9" fill="#166534">"The green line shows: trending up"</text>
    <text x="472" y="300" textAnchor="middle" fontSize="9" fill="#166534">Context emerges through smoothing</text>
  </svg>
);

// SVG 4: Fast vs Slow Moving Averages
const FastVsSlowSVG = () => (
  <svg viewBox="0 0 600 360" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="360" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#334155">Fast vs Slow Moving Averages</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#64748b">Different lookback periods create different smoothness levels</text>
    
    {/* Main chart area */}
    <rect x="50" y="70" width="500" height="200" fill="#ffffff" rx="12" stroke="#e2e8f0" strokeWidth="2"/>
    
    {/* Y-axis */}
    <text x="40" y="95" textAnchor="end" fontSize="9" fill="#94a3b8">High</text>
    <text x="40" y="170" textAnchor="end" fontSize="9" fill="#94a3b8">Mid</text>
    <text x="40" y="245" textAnchor="end" fontSize="9" fill="#94a3b8">Low</text>
    
    {/* Grid */}
    <line x1="60" y1="95" x2="540" y2="95" stroke="#f1f5f9" strokeWidth="1"/>
    <line x1="60" y1="170" x2="540" y2="170" stroke="#f1f5f9" strokeWidth="1"/>
    <line x1="60" y1="245" x2="540" y2="245" stroke="#f1f5f9" strokeWidth="1"/>
    
    {/* Raw price - light gray */}
    <path 
      d="M70 200 L100 180 L130 195 L160 160 L190 175 L220 140 L250 160 L280 125 L310 145 L340 110 L370 130 L400 95 L430 115 L460 90 L490 105 L530 85" 
      fill="none" 
      stroke="#cbd5e1" 
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Fast MA (10-period style) - follows price more closely */}
    <path 
      d="M70 195 L110 182 L150 175 L190 158 L230 148 L270 135 L310 128 L350 115 L390 105 L430 98 L470 92 L520 88" 
      fill="none" 
      stroke="#f97316" 
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Slow MA (50-period style) - smoother, lags more */}
    <path 
      d="M70 190 L130 180 L190 168 L250 155 L310 142 L370 130 L430 120 L490 112 L530 108" 
      fill="none" 
      stroke="#8b5cf6" 
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Legend */}
    <rect x="100" y="285" width="400" height="60" fill="#f1f5f9" rx="10"/>
    
    <line x1="130" y1="305" x2="160" y2="305" stroke="#cbd5e1" strokeWidth="2"/>
    <text x="170" y="308" fontSize="10" fill="#64748b">Raw Price</text>
    
    <line x1="270" y1="305" x2="300" y2="305" stroke="#f97316" strokeWidth="2.5"/>
    <text x="310" y="308" fontSize="10" fill="#c2410c">Fast MA (fewer periods)</text>
    
    <line x1="130" y1="330" x2="160" y2="330" stroke="#8b5cf6" strokeWidth="2.5"/>
    <text x="170" y="333" fontSize="10" fill="#6d28d9">Slow MA (more periods)</text>
    
    <text x="310" y="333" fontSize="9" fill="#64748b">→ Smoother, shows bigger picture</text>
  </svg>
);

// SVG 5: Fast MA Characteristics
const FastMADetailSVG = () => (
  <svg viewBox="0 0 600 260" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="260" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="300" y="25" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Fast Moving Average</text>
    <text x="300" y="43" textAnchor="middle" fontSize="10" fill="#64748b">Uses fewer periods — reacts quickly to price changes</text>
    
    {/* Chart */}
    <rect x="50" y="60" width="350" height="150" fill="#ffffff" rx="10" stroke="#fed7aa" strokeWidth="2"/>
    
    {/* Price line */}
    <path 
      d="M70 150 L100 120 L130 140 L160 100 L190 125 L220 90 L250 110 L280 75 L310 95 L340 70 L380 85" 
      fill="none" 
      stroke="#94a3b8" 
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Fast MA - closely follows */}
    <path 
      d="M70 145 L100 125 L130 130 L160 108 L190 115 L220 98 L250 102 L280 85 L310 88 L340 78 L380 80" 
      fill="none" 
      stroke="#f97316" 
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Characteristics box */}
    <rect x="420" y="60" width="160" height="150" fill="#fff7ed" rx="10" stroke="#fdba74" strokeWidth="1"/>
    <text x="500" y="85" textAnchor="middle" fontSize="11" fontWeight="600" fill="#c2410c">Characteristics</text>
    
    <text x="435" y="110" fontSize="9" fill="#9a3412">• Stays close to price</text>
    <text x="435" y="128" fontSize="9" fill="#9a3412">• Reacts quickly</text>
    <text x="435" y="146" fontSize="9" fill="#9a3412">• More sensitive</text>
    <text x="435" y="164" fontSize="9" fill="#9a3412">• Shows recent trend</text>
    <text x="435" y="182" fontSize="9" fill="#9a3412">• Can be "noisy"</text>
    
    {/* Bottom note */}
    <rect x="100" y="225" width="400" height="25" fill="#ffedd5" rx="6"/>
    <text x="300" y="241" textAnchor="middle" fontSize="10" fill="#9a3412">Example: A 10-period average looks at the last 10 price points</text>
  </svg>
);

// SVG 6: Slow MA Characteristics
const SlowMADetailSVG = () => (
  <svg viewBox="0 0 600 260" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="260" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="300" y="25" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Slow Moving Average</text>
    <text x="300" y="43" textAnchor="middle" fontSize="10" fill="#64748b">Uses more periods — shows the bigger picture trend</text>
    
    {/* Chart */}
    <rect x="50" y="60" width="350" height="150" fill="#ffffff" rx="10" stroke="#c4b5fd" strokeWidth="2"/>
    
    {/* Price line */}
    <path 
      d="M70 150 L100 120 L130 140 L160 100 L190 125 L220 90 L250 110 L280 75 L310 95 L340 70 L380 85" 
      fill="none" 
      stroke="#94a3b8" 
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Slow MA - smoother, lags */}
    <path 
      d="M70 148 L110 140 L150 130 L190 118 L230 108 L270 98 L310 90 L350 84 L380 82" 
      fill="none" 
      stroke="#8b5cf6" 
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Characteristics box */}
    <rect x="420" y="60" width="160" height="150" fill="#f5f3ff" rx="10" stroke="#c4b5fd" strokeWidth="1"/>
    <text x="500" y="85" textAnchor="middle" fontSize="11" fontWeight="600" fill="#6d28d9">Characteristics</text>
    
    <text x="435" y="110" fontSize="9" fill="#5b21b6">• Further from price</text>
    <text x="435" y="128" fontSize="9" fill="#5b21b6">• Reacts slowly</text>
    <text x="435" y="146" fontSize="9" fill="#5b21b6">• Less sensitive</text>
    <text x="435" y="164" fontSize="9" fill="#5b21b6">• Shows major trend</text>
    <text x="435" y="182" fontSize="9" fill="#5b21b6">• Very smooth</text>
    
    {/* Bottom note */}
    <rect x="100" y="225" width="400" height="25" fill="#ede9fe" rx="6"/>
    <text x="300" y="241" textAnchor="middle" fontSize="10" fill="#5b21b6">Example: A 50-period average looks at the last 50 price points</text>
  </svg>
);

// SVG 7: Price Relative to Average (Context)
const PriceRelativeToAverageSVG = () => (
  <svg viewBox="0 0 600 340" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="340" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#334155">Price Relative to the Average</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#64748b">Where price sits compared to its average provides context</text>
    
    {/* Main chart */}
    <rect x="50" y="70" width="500" height="180" fill="#ffffff" rx="12" stroke="#e2e8f0" strokeWidth="2"/>
    
    {/* Moving average line */}
    <path 
      d="M70 170 L120 165 L170 155 L220 150 L270 145 L320 140 L370 138 L420 142 L470 150 L530 160" 
      fill="none" 
      stroke="#3b82f6" 
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Price above average section */}
    <path 
      d="M70 150 L100 140 L130 130 L160 125 L190 115 L220 120 L250 110 L280 115" 
      fill="none" 
      stroke="#22c55e" 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Price below average section */}
    <path 
      d="M280 115 L310 130 L340 155 L370 165 L400 175 L430 180 L460 185 L490 178 L530 170" 
      fill="none" 
      stroke="#ef4444" 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Labels */}
    <rect x="80" y="90" width="130" height="24" fill="#dcfce7" rx="6"/>
    <text x="145" y="106" textAnchor="middle" fontSize="9" fill="#166534">Price ABOVE average</text>
    
    <rect x="390" y="195" width="130" height="24" fill="#fee2e2" rx="6"/>
    <text x="455" y="211" textAnchor="middle" fontSize="9" fill="#991b1b">Price BELOW average</text>
    
    {/* Legend at bottom */}
    <rect x="100" y="265" width="400" height="60" fill="#f1f5f9" rx="10"/>
    
    <rect x="120" y="278" width="160" height="35" fill="#dcfce7" rx="6" stroke="#86efac" strokeWidth="1"/>
    <text x="200" y="295" textAnchor="middle" fontSize="9" fontWeight="500" fill="#166534">Above Average</text>
    <text x="200" y="307" textAnchor="middle" fontSize="8" fill="#15803d">Recently stronger than usual</text>
    
    <rect x="320" y="278" width="160" height="35" fill="#fee2e2" rx="6" stroke="#fca5a5" strokeWidth="1"/>
    <text x="400" y="295" textAnchor="middle" fontSize="9" fontWeight="500" fill="#991b1b">Below Average</text>
    <text x="400" y="307" textAnchor="middle" fontSize="8" fill="#b91c1c">Recently weaker than usual</text>
  </svg>
);

// SVG 8: Context Not Signals
const ContextNotSignalsSVG = () => (
  <svg viewBox="0 0 640 280" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="640" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="320" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#334155">Moving Averages Provide Context</text>
    <text x="320" y="48" textAnchor="middle" fontSize="11" fill="#64748b">They summarize what has happened — they don't predict what will happen</text>
    
    {/* Left - Wrong understanding */}
    <rect x="30" y="70" width="275" height="180" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
    <text x="167" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#dc2626">❌ Common Misconception</text>
    
    <g transform="translate(167, 165)">
      <rect x="-100" y="-45" width="200" height="90" fill="#ffffff" rx="8" stroke="#fecaca" strokeWidth="1"/>
      
      {/* MA line */}
      <path d="M-80 20 L0 0 L80 -20" fill="none" stroke="#3b82f6" strokeWidth="2"/>
      
      {/* Wrong: thinking it predicts */}
      <path d="M80 -20 L100 -35" fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="4 3"/>
      <text x="95" y="-40" fontSize="9" fill="#dc2626">Predicts future?</text>
      
      <text x="0" y="55" textAnchor="middle" fontSize="8" fill="#991b1b">"The MA says price will go up!"</text>
    </g>
    
    {/* Right - Correct understanding */}
    <rect x="335" y="70" width="275" height="180" fill="#f0fdf4" rx="12" stroke="#86efac" strokeWidth="2"/>
    <text x="472" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16a34a">✓ Correct Understanding</text>
    
    <g transform="translate(472, 165)">
      <rect x="-100" y="-45" width="200" height="90" fill="#ffffff" rx="8" stroke="#bbf7d0" strokeWidth="1"/>
      
      {/* MA line */}
      <path d="M-80 20 L0 0 L80 -20" fill="none" stroke="#3b82f6" strokeWidth="2"/>
      
      {/* Correct: showing past trend */}
      <text x="0" y="-30" textAnchor="middle" fontSize="8" fill="#166534">Shows recent direction</text>
      <path d="M-60 15 L60 -15" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 2"/>
      
      <text x="0" y="55" textAnchor="middle" fontSize="8" fill="#166534">"Price has been trending up recently"</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="140" y="258" width="360" height="18" fill="#e0f2fe" rx="6"/>
    <text x="320" y="270" textAnchor="middle" fontSize="9" fill="#0369a1">A moving average is a summary of past prices — use it for context, not prophecy</text>
  </svg>
);

const TechnicalAnalysisLesson5 = () => {
  const navigate = useNavigate();

  const quizQuestions = [
    {
      question: "What does a moving average do?",
      options: [
        "Predicts where price will go next",
        "Smooths price data to show the underlying trend",
        "Tells you when to buy or sell",
        "Calculates the exact future price"
      ],
      correctAnswer: "Smooths price data to show the underlying trend",
      explanation: "A moving average smooths out price fluctuations by averaging recent prices. This helps reveal the underlying direction or trend, making it easier to see the bigger picture instead of getting lost in every small price movement."
    },
    {
      question: "What is the main difference between a fast and slow moving average?",
      options: [
        "Fast MAs are more accurate than slow MAs",
        "Slow MAs use fewer data points than fast MAs",
        "Fast MAs react quickly to price changes, slow MAs are smoother",
        "There is no real difference between them"
      ],
      correctAnswer: "Fast MAs react quickly to price changes, slow MAs are smoother",
      explanation: "A fast moving average uses fewer periods (like 10), so it stays closer to current price and reacts quickly. A slow moving average uses more periods (like 50), making it smoother and better at showing the bigger trend, but slower to react."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
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
              Lesson 5 of 7
            </span>
            <h1 className="text-3xl font-bold text-gray-800 mt-4">Moving Averages – Context, Not Signals</h1>
            <p className="text-gray-600 mt-2">Understanding how smoothing reveals the bigger picture</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Raw Price Can Look Noisy</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              When you look at a price chart, you see every up and down movement. Every tick, 
              every fluctuation, every small reversal. While this detail is real, it can make it 
              <strong> hard to see the forest for the trees</strong>.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Is price going up? Down? Sideways? With so much movement happening, the overall 
              direction can get lost in the noise.
            </p>
            <p className="text-lg leading-relaxed">
              This is where <strong>moving averages</strong> come in — not as magic prediction tools, 
              but as a way to <strong>smooth out the noise</strong> and see the underlying trend 
              more clearly.
            </p>
          </div>

          <NoisyPriceSVG />
          
          <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-200">
            <p className="text-blue-800">
              <strong>Key insight:</strong> Moving averages don't predict the future. They 
              summarize what has already happened, giving you context about recent price behavior.
            </p>
          </div>
        </div>

        {/* What is a Moving Average */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">What is a Moving Average?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              A <strong>moving average</strong> is simply the average price over a specific number 
              of recent periods. For example, a 10-period moving average takes the last 10 price 
              points and calculates their average.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              As new prices come in, the average "moves" — it updates to always reflect the most 
              recent data. This creates a <strong>smooth line</strong> that follows price but without 
              all the jagged ups and downs.
            </p>
            <p className="text-lg leading-relaxed">
              The result? A cleaner view of where price has been trending — without the distraction 
              of every minor fluctuation.
            </p>
          </div>

          <WhatIsMovingAverageSVG />
          
          <div className="mt-6 bg-slate-100 rounded-xl p-5">
            <p className="text-slate-700">
              <strong>Simple formula:</strong> Add up the last N prices → Divide by N → 
              That's your moving average value. Repeat as new prices arrive.
            </p>
          </div>
        </div>

        {/* Before and After Comparison */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Same Data, Different Clarity</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              The best way to understand a moving average is to see the same price data with 
              and without one. The raw price tells you what happened in each moment. The moving 
              average tells you the <strong>general direction</strong> over time.
            </p>
            <p className="text-lg leading-relaxed">
              Neither view is "better" — they serve different purposes. Raw price shows detail; 
              the moving average shows context.
            </p>
          </div>

          <BeforeAfterSVG />
          
          <div className="mt-6 bg-green-50 rounded-xl p-5 border border-green-200">
            <p className="text-green-800">
              <strong>Notice:</strong> The moving average doesn't tell you what will happen next. 
              It simply makes it easier to see that price has been generally rising in this example.
            </p>
          </div>
        </div>

        {/* Fast vs Slow */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Fast vs Slow Moving Averages</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Not all moving averages are the same. The <strong>number of periods</strong> you 
              use changes how the average behaves:
            </p>
            <ul className="text-lg leading-relaxed mb-4 list-disc list-inside space-y-2">
              <li><strong>Fewer periods (fast):</strong> Stays close to price, reacts quickly</li>
              <li><strong>More periods (slow):</strong> Smoother line, shows bigger picture</li>
            </ul>
            <p className="text-lg leading-relaxed">
              Think of it like zooming in vs zooming out. A fast average shows you the recent 
              direction; a slow average shows you the longer-term trend.
            </p>
          </div>

          <FastVsSlowSVG />
        </div>

        {/* Fast MA Detail */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Understanding Fast Moving Averages</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              A <strong>fast moving average</strong> uses fewer data points — maybe 10 or 20 periods. 
              Because it's looking at a shorter window, it reacts quickly to price changes and stays 
              close to the current price. This can be useful for seeing recent momentum, but it can 
              also be "noisy" because it picks up smaller fluctuations.
            </p>
          </div>

          <FastMADetailSVG />
        </div>

        {/* Slow MA Detail */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Understanding Slow Moving Averages</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              A <strong>slow moving average</strong> uses more data points — maybe 50 or 200 periods. 
              This longer window means it doesn't react to every wiggle. Instead, it shows the 
              major trend direction. The tradeoff? It's slower to respond when price actually 
              changes direction.
            </p>
          </div>

          <SlowMADetailSVG />
          
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Fast MA Use</h4>
              <p className="text-orange-900 text-sm">
                Better for seeing recent direction. Stays close to price but can be jumpy.
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Slow MA Use</h4>
              <p className="text-purple-900 text-sm">
                Better for seeing the bigger trend. Very smooth but lags behind price.
              </p>
            </div>
          </div>
        </div>

        {/* Price Relative to Average */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Price Relative to the Average</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              One simple way to use a moving average is to notice <strong>where price is 
              relative to it</strong>:
            </p>
            <ul className="text-lg leading-relaxed mb-4 list-disc list-inside space-y-2">
              <li><strong>Price above the average:</strong> Recently performing stronger than usual</li>
              <li><strong>Price below the average:</strong> Recently performing weaker than usual</li>
            </ul>
            <p className="text-lg leading-relaxed">
              This isn't a signal to act — it's just <strong>context</strong>. It tells you 
              whether current prices are higher or lower than recent history.
            </p>
          </div>

          <PriceRelativeToAverageSVG />
        </div>

        {/* Context Not Signals */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Context, Not Prediction</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              This is the most important thing to understand about moving averages: 
              <strong> they summarize the past, they don't predict the future</strong>.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              A rising moving average doesn't mean price will keep going up. It means price 
              <strong> has been</strong> going up recently. That's valuable context — but it's 
              not a crystal ball.
            </p>
            <p className="text-lg leading-relaxed">
              Use moving averages to understand the current environment, not to make predictions.
            </p>
          </div>

          <ContextNotSignalsSVG />
          
          <div className="mt-6 bg-slate-700 rounded-xl p-5 text-white">
            <p className="font-medium">
              💡 Think of a moving average like a rearview mirror. It shows you where you've been, 
              which helps you understand where you are — but it doesn't show you where you're going.
            </p>
          </div>
        </div>

        {/* India-specific Note */}
        <div className="bg-indigo-50 rounded-2xl p-6 shadow-lg mb-8 border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-800 mb-3">🌍 Global Context</h3>
          <p className="text-indigo-900">
            Moving averages are one of the most widely used tools in markets around the world — 
            from Wall Street to London to Mumbai. The concept works the same everywhere: take 
            recent prices, calculate an average, and plot it on the chart. Whether you're 
            looking at global indices, Indian equities, commodities, or currencies, moving 
            averages help smooth the noise and reveal the underlying direction.
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
                  "How does smoothing help you see direction better? Think about looking at 
                  a mountain range from far away versus standing right next to it — which 
                  view makes it easier to understand the overall landscape?"
                </p>
                <p className="text-gray-600 text-sm">
                  This reflection helps you internalize why we smooth data. Sometimes stepping 
                  back (using averages) gives more clarity than focusing on every detail.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-lg mb-8 text-white">
          <h3 className="text-xl font-bold mb-3">🔑 Key Takeaways</h3>
          <ul className="space-y-2 text-lg">
            <li>• Moving averages smooth price data to reveal the underlying trend</li>
            <li>• They summarize what has happened — they don't predict the future</li>
            <li>• Fast MAs (fewer periods) react quickly, slow MAs (more periods) are smoother</li>
            <li>• Price above/below average gives context about recent strength</li>
            <li>• Use for understanding, not for making decisions</li>
            <li>• Context before conclusions — observation over prediction</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/technical-analysis-lesson-4')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-colors"
          >
            <FaArrowLeft />
            <span>Previous Lesson</span>
          </button>
          <button
            onClick={() => navigate('/learn/technical-analysis-lesson-6')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
          >
            <span>Next Lesson</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAnalysisLesson5;
