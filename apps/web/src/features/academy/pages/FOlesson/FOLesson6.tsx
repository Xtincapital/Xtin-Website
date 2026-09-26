import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";

// SVG Icons
const Icons = {
  ArrowLeft: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  ),
  ArrowRight: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  Clock: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  ),
  Target: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  TrendingUp: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Zap: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Layers: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  Activity: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Compass: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  ),
  AlertTriangle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Lightbulb: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18h6M10 22h4M12 2v1M4.22 4.22l.71.71M1 12h1M4.22 19.78l.71-.71M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
    </svg>
  )
};

// SVG: What is Delta
const DeltaConceptSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <defs>
      <linearGradient id="deltaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a"/>
        <stop offset="100%" stopColor="#1e3a5f"/>
      </linearGradient>
    </defs>
    
    <rect x="0" y="0" width="700" height="380" fill="url(#deltaGrad)" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="20" fontWeight="700" fill="white">DELTA (Δ)</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">Rate of change in option price relative to underlying price change</text>
    
    {/* Formula */}
    <g transform="translate(150, 75)">
      <rect x="0" y="0" width="400" height="50" fill="#1e293b" rx="10"/>
      <text x="200" y="32" textAnchor="middle" fontSize="16" fontWeight="600" fill="white">Δ = ∂C/∂S = Change in Option Price / Change in Stock Price</text>
    </g>
    
    {/* Delta Values */}
    <g transform="translate(50, 145)">
      <text x="0" y="0" fontSize="12" fontWeight="600" fill="white">Delta Values by Option Type</text>
      
      {/* Call Options */}
      <g transform="translate(0, 20)">
        <rect x="0" y="0" width="290" height="100" fill="#22c55e" fillOpacity="0.15" rx="10" stroke="#22c55e" strokeWidth="1"/>
        <text x="145" y="25" textAnchor="middle" fontSize="13" fontWeight="600" fill="#22c55e">CALL OPTIONS</text>
        <text x="145" y="50" textAnchor="middle" fontSize="11" fill="white">Delta range: 0 to +1.00</text>
        <text x="145" y="70" textAnchor="middle" fontSize="10" fill="#94a3b8">Deep ITM call → Delta ≈ +1.00</text>
        <text x="145" y="85" textAnchor="middle" fontSize="10" fill="#94a3b8">ATM call → Delta ≈ +0.50</text>
      </g>
      
      {/* Put Options */}
      <g transform="translate(310, 20)">
        <rect x="0" y="0" width="290" height="100" fill="#dc2626" fillOpacity="0.15" rx="10" stroke="#dc2626" strokeWidth="1"/>
        <text x="145" y="25" textAnchor="middle" fontSize="13" fontWeight="600" fill="#dc2626">PUT OPTIONS</text>
        <text x="145" y="50" textAnchor="middle" fontSize="11" fill="white">Delta range: -1.00 to 0</text>
        <text x="145" y="70" textAnchor="middle" fontSize="10" fill="#94a3b8">Deep ITM put → Delta ≈ -1.00</text>
        <text x="145" y="85" textAnchor="middle" fontSize="10" fill="#94a3b8">ATM put → Delta ≈ -0.50</text>
      </g>
    </g>
    
    {/* Interpretation */}
    <g transform="translate(50, 280)">
      <rect x="0" y="0" width="600" height="85" fill="#1e293b" rx="10"/>
      <text x="300" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill="#f97316">PRACTICAL INTERPRETATION</text>
      
      <g transform="translate(20, 40)">
        <circle cx="8" cy="8" r="4" fill="#22c55e"/>
        <text x="20" y="12" fontSize="10" fill="white">Delta of 0.60 means: For every $1 stock moves, option moves ~$0.60</text>
      </g>
      <g transform="translate(20, 60)">
        <circle cx="8" cy="8" r="4" fill="#3b82f6"/>
        <text x="20" y="12" fontSize="10" fill="white">Also approximates probability of finishing ITM (60 delta ≈ 60% probability)</text>
      </g>
    </g>
  </svg>
);

// SVG: Delta Curve
const DeltaCurveSVG = () => (
  <svg viewBox="0 0 700 350" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="350" fill="#0f172a" rx="16"/>
    
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">Delta vs Stock Price (S-Curve)</text>
    
    {/* Chart Area */}
    <g transform="translate(80, 60)">
      {/* Axes */}
      <line x1="0" y1="230" x2="540" y2="230" stroke="#475569" strokeWidth="1"/>
      <line x1="270" y1="0" x2="270" y2="230" stroke="#475569" strokeWidth="1" strokeDasharray="4"/>
      
      {/* Y-axis labels */}
      <text x="-10" y="10" textAnchor="end" fontSize="10" fill="#94a3b8">+1.00</text>
      <text x="-10" y="115" textAnchor="end" fontSize="10" fill="#94a3b8">+0.50</text>
      <text x="-10" y="230" textAnchor="end" fontSize="10" fill="#94a3b8">0</text>
      
      {/* X-axis labels */}
      <text x="0" y="250" textAnchor="middle" fontSize="10" fill="#94a3b8">Deep OTM</text>
      <text x="270" y="250" textAnchor="middle" fontSize="10" fill="#f97316">ATM</text>
      <text x="540" y="250" textAnchor="middle" fontSize="10" fill="#94a3b8">Deep ITM</text>
      
      {/* Delta Curve for Call */}
      <path 
        d="M 0 220 C 60 218, 130 210, 180 180 C 230 140, 260 115, 270 115 C 280 115, 310 90, 360 50 C 410 20, 480 8, 540 5"
        fill="none" stroke="#22c55e" strokeWidth="3"
      />
      
      {/* ATM point */}
      <circle cx="270" cy="115" r="6" fill="#f97316"/>
      <text x="290" y="110" fontSize="9" fill="#f97316">ATM (Δ ≈ 0.50)</text>
      
      {/* Annotations */}
      <g transform="translate(30, 200)">
        <rect x="0" y="0" width="80" height="20" fill="#dc2626" fillOpacity="0.2" rx="4"/>
        <text x="40" y="14" textAnchor="middle" fontSize="8" fill="#dc2626">Low Delta</text>
      </g>
      
      <g transform="translate(230, 40)">
        <rect x="0" y="0" width="80" height="20" fill="#f97316" fillOpacity="0.2" rx="4"/>
        <text x="40" y="14" textAnchor="middle" fontSize="8" fill="#f97316">Highest Gamma</text>
      </g>
      
      <g transform="translate(430, 10)">
        <rect x="0" y="0" width="80" height="20" fill="#22c55e" fillOpacity="0.2" rx="4"/>
        <text x="40" y="14" textAnchor="middle" fontSize="8" fill="#22c55e">High Delta</text>
      </g>
    </g>
    
    {/* Key insight */}
    <g transform="translate(80, 310)">
      <rect x="0" y="0" width="540" height="30" fill="#1e293b" rx="6"/>
      <text x="270" y="20" textAnchor="middle" fontSize="10" fill="#94a3b8">The S-curve shows delta is most sensitive (changes fastest) when ATM - this is where Gamma is highest</text>
    </g>
  </svg>
);

// SVG: Gamma Concept
const GammaConceptSVG = () => (
  <svg viewBox="0 0 700 360" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="360" fill="#0f172a" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="20" fontWeight="700" fill="white">GAMMA (Γ)</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">Rate of change of Delta - measures Delta&apos;s sensitivity</text>
    
    {/* Formula */}
    <g transform="translate(150, 75)">
      <rect x="0" y="0" width="400" height="50" fill="#1e293b" rx="10"/>
      <text x="200" y="32" textAnchor="middle" fontSize="16" fontWeight="600" fill="white">Γ = ∂Δ/∂S = ∂²C/∂S² (Second Derivative)</text>
    </g>
    
    {/* Core Concept */}
    <g transform="translate(50, 145)">
      <rect x="0" y="0" width="600" height="80" fill="#a855f7" fillOpacity="0.15" rx="10" stroke="#a855f7" strokeWidth="1"/>
      
      <text x="300" y="25" textAnchor="middle" fontSize="13" fontWeight="600" fill="#a855f7">GAMMA TELLS YOU HOW FAST DELTA CHANGES</text>
      
      <g transform="translate(30, 40)">
        <text x="0" y="15" fontSize="10" fill="white">• High Gamma = Delta changes quickly with stock movement</text>
        <text x="0" y="35" fontSize="10" fill="white">• Gamma is always POSITIVE for long options (calls and puts)</text>
      </g>
    </g>
    
    {/* Gamma by Moneyness */}
    <g transform="translate(50, 245)">
      <text x="0" y="0" fontSize="12" fontWeight="600" fill="white">Gamma by Moneyness</text>
      
      <g transform="translate(0, 20)">
        {[
          { label: "Deep OTM", gamma: "Low", color: "#3b82f6", desc: "Delta near 0, changes slowly" },
          { label: "ATM", gamma: "HIGHEST", color: "#f97316", desc: "Maximum sensitivity zone" },
          { label: "Deep ITM", gamma: "Low", color: "#22c55e", desc: "Delta near 1, changes slowly" }
        ].map((item, i) => (
          <g key={i} transform={`translate(${i * 200}, 0)`}>
            <rect x="0" y="0" width="190" height="75" fill={item.color} fillOpacity="0.15" rx="8" stroke={item.color} strokeWidth="1"/>
            <text x="95" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill={item.color}>{item.label}</text>
            <text x="95" y="42" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">Gamma: {item.gamma}</text>
            <text x="95" y="62" textAnchor="middle" fontSize="9" fill="#94a3b8">{item.desc}</text>
          </g>
        ))}
      </g>
    </g>
  </svg>
);

// SVG: Gamma Risk
const GammaRiskSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="320" fill="#0f172a" rx="16"/>
    
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">Gamma Risk: Long vs Short</text>
    
    {/* Long Gamma */}
    <g transform="translate(40, 60)">
      <rect x="0" y="0" width="300" height="200" fill="#22c55e" fillOpacity="0.1" rx="12" stroke="#22c55e" strokeWidth="2"/>
      <text x="150" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#22c55e">LONG GAMMA</text>
      <text x="150" y="50" textAnchor="middle" fontSize="10" fill="#94a3b8">(Option Buyers)</text>
      
      <g transform="translate(20, 70)">
        <text x="0" y="0" fontSize="10" fill="white">Benefits:</text>
        <text x="0" y="18" fontSize="9" fill="#94a3b8">• Delta grows as trade goes your way</text>
        <text x="0" y="34" fontSize="9" fill="#94a3b8">• Delta shrinks as trade goes against you</text>
        <text x="0" y="50" fontSize="9" fill="#94a3b8">• &quot;Convexity&quot; - profits accelerate</text>
        
        <text x="0" y="75" fontSize="10" fill="white">Downside:</text>
        <text x="0" y="93" fontSize="9" fill="#94a3b8">• Pay for this via time decay (Theta)</text>
        <text x="0" y="109" fontSize="9" fill="#94a3b8">• Need movement to profit</text>
      </g>
    </g>
    
    {/* Short Gamma */}
    <g transform="translate(360, 60)">
      <rect x="0" y="0" width="300" height="200" fill="#dc2626" fillOpacity="0.1" rx="12" stroke="#dc2626" strokeWidth="2"/>
      <text x="150" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#dc2626">SHORT GAMMA</text>
      <text x="150" y="50" textAnchor="middle" fontSize="10" fill="#94a3b8">(Option Sellers)</text>
      
      <g transform="translate(20, 70)">
        <text x="0" y="0" fontSize="10" fill="white">Benefits:</text>
        <text x="0" y="18" fontSize="9" fill="#94a3b8">• Collect premium (Theta profit)</text>
        <text x="0" y="34" fontSize="9" fill="#94a3b8">• Profit from stable markets</text>
        
        <text x="0" y="59" fontSize="10" fill="white">Risks:</text>
        <text x="0" y="77" fontSize="9" fill="#dc2626">• Delta works against you in both directions</text>
        <text x="0" y="93" fontSize="9" fill="#dc2626">• Losses can accelerate quickly</text>
        <text x="0" y="109" fontSize="9" fill="#dc2626">• &quot;Picking up pennies in front of steamroller&quot;</text>
      </g>
    </g>
    
    {/* Bottom Warning */}
    <g transform="translate(50, 275)">
      <rect x="0" y="0" width="600" height="35" fill="#f97316" fillOpacity="0.15" rx="8"/>
      <text x="300" y="22" textAnchor="middle" fontSize="10" fill="#f97316">Short Gamma near expiration is extremely dangerous - small moves cause large delta swings. This is &quot;gamma risk.&quot;</text>
    </g>
  </svg>
);

// SVG: Delta Hedging
const DeltaHedgingSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="380" fill="#0f172a" rx="16"/>
    
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">Delta Hedging in Practice</text>
    <text x="350" y="50" textAnchor="middle" fontSize="10" fill="#94a3b8">Maintaining delta-neutral positions</text>
    
    {/* Example Scenario */}
    <g transform="translate(50, 70)">
      <rect x="0" y="0" width="600" height="130" fill="#1e293b" rx="10"/>
      <text x="300" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#3b82f6">EXAMPLE: Delta Hedging a Short Call</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="10" fill="white">Position: Short 10 Call contracts (100 shares each) with Delta = 0.50</text>
        <text x="0" y="20" fontSize="10" fill="#94a3b8">Total Delta exposure: -10 × 100 × 0.50 = -500 deltas</text>
        <text x="0" y="40" fontSize="10" fill="#94a3b8">This means you need +500 deltas to be neutral</text>
        <text x="0" y="65" fontSize="10" fill="#22c55e">Hedge: Buy 500 shares of underlying stock (+500 deltas)</text>
        <text x="0" y="85" fontSize="10" fill="#f97316">Net Position: -500 + 500 = 0 deltas (Delta Neutral)</text>
      </g>
    </g>
    
    {/* Dynamic Hedging */}
    <g transform="translate(50, 215)">
      <text x="0" y="0" fontSize="12" fontWeight="600" fill="white">Dynamic Hedging: Adjusting as Delta Changes</text>
      
      <g transform="translate(0, 20)">
        {[
          { scenario: "Stock rises $5", delta: "0.60", action: "Sell 100 more shares", reason: "More negative delta from calls" },
          { scenario: "Stock falls $5", delta: "0.40", action: "Buy back 100 shares", reason: "Less negative delta from calls" }
        ].map((item, i) => (
          <g key={i} transform={`translate(0, ${i * 60})`}>
            <rect x="0" y="0" width="600" height="50" fill={i === 0 ? "#22c55e" : "#dc2626"} fillOpacity="0.1" rx="8"/>
            <text x="20" y="18" fontSize="10" fontWeight="600" fill={i === 0 ? "#22c55e" : "#dc2626"}>{item.scenario}</text>
            <text x="180" y="18" fontSize="10" fill="white">New Δ: {item.delta}</text>
            <text x="300" y="18" fontSize="10" fill="white">{item.action}</text>
            <text x="20" y="38" fontSize="9" fill="#94a3b8">{item.reason}</text>
          </g>
        ))}
      </g>
    </g>
    
    {/* Key Note */}
    <g transform="translate(50, 345)">
      <rect x="0" y="0" width="600" height="25" fill="#a855f7" fillOpacity="0.15" rx="6"/>
      <text x="300" y="17" textAnchor="middle" fontSize="9" fill="#a855f7">Gamma determines how often you need to rebalance. High gamma = frequent adjustments = higher transaction costs.</text>
    </g>
  </svg>
);

// Quiz Questions
const quizQuestions = [
  {
    id: 1,
    question: "An ATM call option has a delta of approximately:",
    options: [
      "0.00",
      "0.25",
      "0.50",
      "1.00"
    ],
    correct: 2,
    explanation: "At-the-money call options have a delta of approximately 0.50, meaning for every $1 the stock moves, the option moves about $0.50. Deep ITM approaches 1.00, deep OTM approaches 0."
  },
  {
    id: 2,
    question: "When is Gamma highest for an option?",
    options: [
      "When deep in-the-money",
      "When deep out-of-the-money",
      "When at-the-money",
      "Gamma is constant across all strikes"
    ],
    correct: 2,
    explanation: "Gamma is highest for ATM options because this is where delta is most sensitive to stock price changes. The S-curve of delta is steepest at ATM."
  },
  {
    id: 3,
    question: "A trader who sells options is said to be:",
    options: [
      "Long gamma, short theta",
      "Short gamma, long theta",
      "Long both gamma and theta",
      "Short both gamma and theta"
    ],
    correct: 1,
    explanation: "Option sellers are short gamma (exposed to delta acceleration risk) but long theta (collect time decay). Option buyers are the opposite: long gamma, short theta."
  },
  {
    id: 4,
    question: "You are short 5 call contracts (delta 0.40 each). How many shares do you need to delta hedge?",
    options: [
      "Buy 200 shares",
      "Sell 200 shares",
      "Buy 40 shares",
      "Sell 40 shares"
    ],
    correct: 0,
    explanation: "Short 5 calls × 100 shares × 0.40 delta = -200 deltas. To neutralize, you need +200 deltas, so buy 200 shares. Short calls have negative delta exposure."
  }
];

const FOLesson6 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (questionId, answerIndex) => {
    if (showResults) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correct) correct++;
    });
    return correct;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-orange-50  ">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/learn/derivatives')}
            className="flex items-center gap-2 text-gray-600  hover:text-orange-600  transition-colors mb-4"
          >
            <Icons.ArrowLeft className="w-4 h-4" />
            <span>Back to Module</span>
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-orange-100  text-orange-700  text-sm font-medium rounded-full">
              Lesson 6 of 12
            </span>
            <span className="flex items-center gap-1 text-gray-500  text-sm">
              <Icons.Clock className="w-4 h-4" />
              28 min read
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900  mb-4">
            The Greeks Part 1: Delta & Gamma
          </h1>
          <p className="text-lg text-gray-600 ">
            Understanding the two most important risk measures in options trading.
          </p>
        </div>

        {/* Learning Objectives */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 mb-10 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Icons.Target className="w-6 h-6" />
            <h2 className="text-xl font-bold">Learning Objectives</h2>
          </div>
          <ul className="space-y-2">
            {[
              "Master Delta - directional exposure and probability interpretation",
              "Understand Gamma - the acceleration of Delta",
              "Learn the long gamma vs short gamma trade-off",
              "Apply delta hedging techniques"
            ].map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <Icons.CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          
          {/* Section 1: Delta */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
                  <Icons.TrendingUp className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Understanding Delta</h2>
                  <p className="text-sm text-gray-500 ">Your directional exposure measure</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Delta is the most fundamental Greek. It measures how much the option price changes for a $1 move in the underlying. 
                But delta serves two critical purposes in trading.
              </p>

              <DeltaConceptSVG />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50  rounded-xl p-5 border border-green-200 ">
                  <h4 className="font-bold text-green-800  mb-2">Price Sensitivity</h4>
                  <p className="text-gray-700  text-sm">
                    Delta 0.60: If stock rises $1, call rises ~$0.60. If stock falls $1, call falls ~$0.60.
                  </p>
                </div>
                <div className="bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                  <h4 className="font-bold text-blue-800  mb-2">Probability Proxy</h4>
                  <p className="text-gray-700  text-sm">
                    Delta 0.60: Approximately 60% probability the option finishes in-the-money at expiration.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Delta Curve */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                  <Icons.Activity className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">The Delta S-Curve</h2>
                  <p className="text-sm text-gray-500 ">How delta changes with stock price</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Delta doesn&apos;t change linearly - it follows an S-shaped curve. Understanding this shape 
                is crucial because it shows you where delta is most sensitive (and where Gamma matters most).
              </p>

              <DeltaCurveSVG />

              <div className="mt-6 bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                <div className="flex items-start gap-3">
                  <Icons.Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-800  mb-1">Why This Matters</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      The steepness of the curve at ATM means your position&apos;s directional exposure 
                      can change rapidly. A stock that moves through your strike can quickly turn 
                      a small position into a large directional bet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Gamma */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                  <Icons.Zap className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Understanding Gamma</h2>
                  <p className="text-sm text-gray-500 ">The rate of change of Delta</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                If Delta tells you your speed, Gamma tells you your acceleration. It measures how quickly 
                your Delta changes as the stock moves. This second-order effect is crucial for risk management.
              </p>

              <GammaConceptSVG />

              <div className="mt-6 bg-purple-50  rounded-xl p-5 border border-purple-200 ">
                <h4 className="font-bold text-purple-800  mb-2">Gamma Explodes Near Expiration</h4>
                <p className="text-gray-700  text-sm">
                  As options approach expiration, ATM gamma increases dramatically. A stock sitting near 
                  the strike can cause massive delta swings in the final hours - this is why expiration 
                  week is dangerous for short option positions.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Long vs Short Gamma */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                  <Icons.Layers className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Long Gamma vs Short Gamma</h2>
                  <p className="text-sm text-gray-500 ">The fundamental options trade-off</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Every options trade is fundamentally a trade-off between gamma and theta. 
                Understanding which side you&apos;re on determines your risk profile.
              </p>

              <GammaRiskSVG />

              <div className="mt-6 bg-red-50  rounded-xl p-5 border border-red-200 ">
                <div className="flex items-start gap-3">
                  <Icons.AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-800  mb-1">Short Gamma Blowups</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      Many famous trading disasters involved short gamma positions. 
                      When markets move violently, short gamma traders face accelerating losses - their 
                      delta exposure grows precisely when they&apos;re already losing. This is why position sizing 
                      and risk management are critical for option sellers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Delta Hedging */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                  <Icons.Compass className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Delta Hedging</h2>
                  <p className="text-sm text-gray-500 ">Managing directional risk</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Delta hedging is the practice of offsetting your option&apos;s directional exposure 
                by trading the underlying. Market makers do this continuously to isolate their 
                volatility and theta exposure from directional risk.
              </p>

              <DeltaHedgingSVG />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-cyan-50  rounded-xl p-5 border border-cyan-200 ">
                  <h4 className="font-bold text-cyan-800  mb-2">Static Hedging</h4>
                  <p className="text-gray-700  text-sm">
                    Set hedge once and leave it. Simple but becomes inaccurate as delta changes. 
                    Common for retail traders.
                  </p>
                </div>
                <div className="bg-indigo-50  rounded-xl p-5 border border-indigo-200 ">
                  <h4 className="font-bold text-indigo-800  mb-2">Dynamic Hedging</h4>
                  <p className="text-gray-700  text-sm">
                    Continuously adjust hedge as delta changes. Required for market makers. 
                    Transaction costs are a key consideration.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Key Takeaways */}
          <section>
            <div className="bg-gradient-to-br from-slate-900 to-orange-950 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Key Takeaways</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Delta measures price sensitivity and approximates ITM probability",
                  "Call deltas: 0 to +1. Put deltas: -1 to 0. ATM ≈ 0.50/-0.50",
                  "Gamma measures how fast delta changes - highest at ATM",
                  "Long options = Long gamma (benefits from movement)",
                  "Short options = Short gamma (profits from stability but dangerous if market moves)",
                  "Delta hedging removes directional risk but requires ongoing management"
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/10 rounded-lg p-4">
                    <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Quiz Section */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <h2 className="text-2xl font-bold text-gray-900  mb-6">Knowledge Check</h2>
              
              <div className="space-y-8">
                {quizQuestions.map((q) => (
                  <div key={q.id} className="bg-gray-50  rounded-xl p-6">
                    <p className="font-semibold text-gray-900  mb-4">{q.id}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswerSelect(q.id, idx)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            quizAnswers[q.id] === idx
                              ? showResults
                                ? idx === q.correct
                                  ? 'border-green-500 bg-green-50 '
                                  : 'border-red-500 bg-red-50 '
                                : 'border-orange-500 bg-orange-50 '
                              : showResults && idx === q.correct
                                ? 'border-green-500 bg-green-50 '
                                : 'border-gray-200  hover:border-gray-300 '
                          }`}
                        >
                          <span className="text-gray-700 ">{option}</span>
                        </button>
                      ))}
                    </div>
                    {showResults && (
                      <div className={`mt-4 p-4 rounded-lg ${
                        quizAnswers[q.id] === q.correct
                          ? 'bg-green-100  text-green-800 '
                          : 'bg-red-100  text-red-800 '
                      }`}>
                        <p className="text-sm">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!showResults ? (
                <button
                  onClick={() => setShowResults(true)}
                  disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-red-700 transition-all"
                >
                  Check Answers
                </button>
              ) : (
                <div className="mt-6 p-4 bg-gray-100  rounded-xl text-center">
                  <p className="text-lg font-semibold text-gray-900 ">
                    Score: {calculateScore()} / {quizQuestions.length}
                  </p>
                  <p className="text-gray-600  text-sm mt-1">
                    {calculateScore() === quizQuestions.length 
                      ? "Excellent! You understand Delta and Gamma." 
                      : "Review the explanations to strengthen your understanding."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 ">
            <button
              onClick={() => navigate('/learn/derivatives/lesson-5')}
              className="flex items-center gap-2 text-gray-600  hover:text-orange-600 transition-colors"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
              <span>Previous: Options Pricing Models</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/derivatives/lesson-7')}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all"
            >
              <span>Next: The Greeks Part 2</span>
              <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FOLesson6;
