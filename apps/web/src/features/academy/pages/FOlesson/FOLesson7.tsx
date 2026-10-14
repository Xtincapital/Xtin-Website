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
  Watch: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"/>
    </svg>
  ),
  Activity: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Percent: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  ),
  Lightbulb: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18h6M10 22h4M12 2v1M4.22 4.22l.71.71M1 12h1M4.22 19.78l.71-.71M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
    </svg>
  ),
  AlertTriangle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  TrendingDown: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
    </svg>
  ),
  Sunrise: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/>
    </svg>
  )
};

// SVG: Theta Concept
const ThetaConceptSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <defs>
      <linearGradient id="thetaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#151517"/>
        <stop offset="100%" stopColor="#232327"/>
      </linearGradient>
    </defs>
    
    <rect x="0" y="0" width="700" height="380" fill="url(#thetaGrad)" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="20" fontWeight="700" fill="white">THETA (Θ)</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A3A1A6">Time decay - the daily erosion of option value</text>
    
    {/* Formula */}
    <g transform="translate(150, 75)">
      <rect x="0" y="0" width="400" height="50" fill="#232327" rx="10"/>
      <text x="200" y="32" textAnchor="middle" fontSize="16" fontWeight="600" fill="white">Θ = ∂C/∂t = Change in Option Price / 1 Day Passage</text>
    </g>
    
    {/* Core Concept */}
    <g transform="translate(50, 145)">
      <rect x="0" y="0" width="600" height="90" fill="#C7363B" fillOpacity="0.15" rx="10" stroke="#C7363B" strokeWidth="1"/>
      
      <text x="300" y="25" textAnchor="middle" fontSize="13" fontWeight="600" fill="#C7363B">THETA IS ALWAYS NEGATIVE FOR LONG OPTIONS</text>
      
      <g transform="translate(30, 45)">
        <text x="0" y="0" fontSize="10" fill="white">• All options lose value as time passes (time value erodes)</text>
        <text x="0" y="18" fontSize="10" fill="white">• Theta represents this daily dollar loss</text>
        <text x="0" y="36" fontSize="10" fill="white">• Theta of -0.05 means option loses $0.05 per day ($5 per contract)</text>
      </g>
    </g>
    
    {/* Buyer vs Seller */}
    <g transform="translate(50, 255)">
      <text x="0" y="0" fontSize="12" fontWeight="600" fill="white">Theta by Position</text>
      
      <g transform="translate(0, 20)">
        <g>
          <rect x="0" y="0" width="290" height="65" fill="#C7363B" fillOpacity="0.15" rx="8" stroke="#C7363B" strokeWidth="1"/>
          <text x="145" y="22" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">LONG OPTIONS (Buyer)</text>
          <text x="145" y="42" textAnchor="middle" fontSize="11" fill="white">Negative Theta</text>
          <text x="145" y="58" textAnchor="middle" fontSize="9" fill="#A3A1A6">Time decay works against you</text>
        </g>
        
        <g transform="translate(310, 0)">
          <rect x="0" y="0" width="290" height="65" fill="#1FA978" fillOpacity="0.15" rx="8" stroke="#1FA978" strokeWidth="1"/>
          <text x="145" y="22" textAnchor="middle" fontSize="12" fontWeight="600" fill="#1FA978">SHORT OPTIONS (Seller)</text>
          <text x="145" y="42" textAnchor="middle" fontSize="11" fill="white">Positive Theta</text>
          <text x="145" y="58" textAnchor="middle" fontSize="9" fill="#A3A1A6">Time decay works for you</text>
        </g>
      </g>
    </g>
    
    {/* Bottom note */}
    <g transform="translate(50, 350)">
      <rect x="0" y="0" width="600" height="22" fill="#232327" rx="6"/>
      <text x="300" y="15" textAnchor="middle" fontSize="9" fill="#D2754C">Theta is highest for ATM options near expiration. Weekends count - Friday&apos;s close to Monday&apos;s open sees 2-3 days of decay.</text>
    </g>
  </svg>
);

// SVG: Theta Decay Curve
const ThetaDecaySVG = () => (
  <svg viewBox="0 0 700 320" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="320" fill="#151517" rx="16"/>
    
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">Time Value Decay - Non-Linear</text>
    
    {/* Chart */}
    <g transform="translate(80, 60)">
      {/* Axes */}
      <line x1="0" y1="200" x2="540" y2="200" stroke="#5A5A62" strokeWidth="1"/>
      <line x1="0" y1="0" x2="0" y2="200" stroke="#5A5A62" strokeWidth="1"/>
      
      {/* Y-axis label */}
      <text x="-30" y="100" textAnchor="middle" fontSize="10" fill="#A3A1A6" transform="rotate(-90, -30, 100)">Time Value</text>
      
      {/* X-axis labels */}
      <text x="0" y="220" textAnchor="middle" fontSize="9" fill="#A3A1A6">90</text>
      <text x="135" y="220" textAnchor="middle" fontSize="9" fill="#A3A1A6">60</text>
      <text x="270" y="220" textAnchor="middle" fontSize="9" fill="#A3A1A6">45</text>
      <text x="405" y="220" textAnchor="middle" fontSize="9" fill="#A3A1A6">30</text>
      <text x="473" y="220" textAnchor="middle" fontSize="9" fill="#D2754C">14</text>
      <text x="540" y="220" textAnchor="middle" fontSize="9" fill="#C7363B">0</text>
      <text x="270" y="240" textAnchor="middle" fontSize="10" fill="#A3A1A6">Days to Expiration</text>
      
      {/* Decay Curve */}
      <path 
        d="M 0 30 C 100 40, 200 55, 270 80 C 340 110, 400 140, 450 160 C 480 175, 510 190, 540 200"
        fill="none" stroke="#C7363B" strokeWidth="3"
      />
      
      {/* Shaded danger zone */}
      <path 
        d="M 430 160 C 480 175, 510 190, 540 200 L 540 200 L 430 200 Z"
        fill="#C7363B" fillOpacity="0.2"
      />
      
      {/* Annotations */}
      <g transform="translate(50, 20)">
        <rect x="0" y="0" width="150" height="30" fill="#1FA978" fillOpacity="0.2" rx="4"/>
        <text x="75" y="20" textAnchor="middle" fontSize="9" fill="#1FA978">Gradual decay - time to adjust</text>
      </g>
      
      <g transform="translate(350, 120)">
        <rect x="0" y="0" width="180" height="45" fill="#C7363B" fillOpacity="0.2" rx="4"/>
        <text x="90" y="17" textAnchor="middle" fontSize="9" fill="#C7363B">Accelerated decay!</text>
        <text x="90" y="35" textAnchor="middle" fontSize="8" fill="#A3A1A6">Final 2-3 weeks most dangerous</text>
      </g>
      
      {/* 30 DTE marker */}
      <line x1="405" y1="0" x2="405" y2="200" stroke="#D2754C" strokeWidth="1" strokeDasharray="4"/>
      <text x="405" y="-8" textAnchor="middle" fontSize="8" fill="#D2754C">30 DTE</text>
    </g>
    
    {/* Key Insight */}
    <g transform="translate(80, 285)">
      <rect x="0" y="0" width="540" height="25" fill="#232327" rx="6"/>
      <text x="270" y="17" textAnchor="middle" fontSize="9" fill="#A3A1A6">Theta accelerates exponentially. Many traders roll or close positions before 21 DTE to avoid rapid decay.</text>
    </g>
  </svg>
);

// SVG: Vega Concept
const VegaConceptSVG = () => (
  <svg viewBox="0 0 700 360" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="360" fill="#151517" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="20" fontWeight="700" fill="white">VEGA (ν)</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A3A1A6">Sensitivity to changes in implied volatility</text>
    
    {/* Formula */}
    <g transform="translate(150, 75)">
      <rect x="0" y="0" width="400" height="50" fill="#232327" rx="10"/>
      <text x="200" y="32" textAnchor="middle" fontSize="16" fontWeight="600" fill="white">ν = ∂C/∂σ = Change in Option Price / 1% IV Change</text>
    </g>
    
    {/* Core Concept */}
    <g transform="translate(50, 145)">
      <rect x="0" y="0" width="600" height="90" fill="#8F6FC4" fillOpacity="0.15" rx="10" stroke="#8F6FC4" strokeWidth="1"/>
      
      <text x="300" y="25" textAnchor="middle" fontSize="13" fontWeight="600" fill="#8F6FC4">VEGA IS ALWAYS POSITIVE FOR LONG OPTIONS</text>
      
      <g transform="translate(30, 45)">
        <text x="0" y="0" fontSize="10" fill="white">• Higher IV = Higher option prices (both calls and puts)</text>
        <text x="0" y="18" fontSize="10" fill="white">• Vega of 0.15 means: if IV rises 1%, option price rises $0.15 ($15/contract)</text>
        <text x="0" y="36" fontSize="10" fill="white">• Vega is highest for ATM options with longer time to expiry</text>
      </g>
    </g>
    
    {/* Long vs Short Vega */}
    <g transform="translate(50, 255)">
      <text x="0" y="0" fontSize="12" fontWeight="600" fill="white">Vega by Position</text>
      
      <g transform="translate(0, 20)">
        <g>
          <rect x="0" y="0" width="290" height="65" fill="#1FA978" fillOpacity="0.15" rx="8" stroke="#1FA978" strokeWidth="1"/>
          <text x="145" y="22" textAnchor="middle" fontSize="12" fontWeight="600" fill="#1FA978">LONG OPTIONS</text>
          <text x="145" y="42" textAnchor="middle" fontSize="11" fill="white">Positive Vega (Long Volatility)</text>
          <text x="145" y="58" textAnchor="middle" fontSize="9" fill="#A3A1A6">Profit when IV increases</text>
        </g>
        
        <g transform="translate(310, 0)">
          <rect x="0" y="0" width="290" height="65" fill="#C7363B" fillOpacity="0.15" rx="8" stroke="#C7363B" strokeWidth="1"/>
          <text x="145" y="22" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">SHORT OPTIONS</text>
          <text x="145" y="42" textAnchor="middle" fontSize="11" fill="white">Negative Vega (Short Volatility)</text>
          <text x="145" y="58" textAnchor="middle" fontSize="9" fill="#A3A1A6">Profit when IV decreases</text>
        </g>
      </g>
    </g>
  </svg>
);

// SVG: Rho Concept
const RhoConceptSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="280" fill="#151517" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="20" fontWeight="700" fill="white">RHO (ρ)</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A3A1A6">Sensitivity to changes in interest rates</text>
    
    {/* Formula */}
    <g transform="translate(150, 75)">
      <rect x="0" y="0" width="400" height="50" fill="#232327" rx="10"/>
      <text x="200" y="32" textAnchor="middle" fontSize="16" fontWeight="600" fill="white">ρ = ∂C/∂r = Change in Option Price / 1% Rate Change</text>
    </g>
    
    {/* Effect on Calls vs Puts */}
    <g transform="translate(50, 145)">
      <text x="0" y="0" fontSize="12" fontWeight="600" fill="white">Interest Rate Impact</text>
      
      <g transform="translate(0, 20)">
        <g>
          <rect x="0" y="0" width="290" height="70" fill="#1FA978" fillOpacity="0.15" rx="8" stroke="#1FA978" strokeWidth="1"/>
          <text x="145" y="22" textAnchor="middle" fontSize="12" fontWeight="600" fill="#1FA978">CALL OPTIONS</text>
          <text x="145" y="42" textAnchor="middle" fontSize="11" fill="white">Positive Rho</text>
          <text x="145" y="60" textAnchor="middle" fontSize="9" fill="#A3A1A6">Rising rates increase call values</text>
        </g>
        
        <g transform="translate(310, 0)">
          <rect x="0" y="0" width="290" height="70" fill="#C7363B" fillOpacity="0.15" rx="8" stroke="#C7363B" strokeWidth="1"/>
          <text x="145" y="22" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">PUT OPTIONS</text>
          <text x="145" y="42" textAnchor="middle" fontSize="11" fill="white">Negative Rho</text>
          <text x="145" y="60" textAnchor="middle" fontSize="9" fill="#A3A1A6">Rising rates decrease put values</text>
        </g>
      </g>
    </g>
    
    {/* Note */}
    <g transform="translate(50, 245)">
      <rect x="0" y="0" width="600" height="25" fill="#5A77AA" fillOpacity="0.15" rx="6"/>
      <text x="300" y="17" textAnchor="middle" fontSize="9" fill="#5A77AA">Rho is typically the least important Greek for short-term options. Matters more for LEAPS (1+ year options).</text>
    </g>
  </svg>
);

// SVG: Greeks Summary
const GreeksSummarySVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="380" fill="#151517" rx="16"/>
    
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">Complete Greeks Summary</text>
    
    {/* Table Header */}
    <g transform="translate(40, 55)">
      <rect x="0" y="0" width="620" height="35" fill="#232327" rx="6"/>
      <text x="70" y="23" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">GREEK</text>
      <text x="180" y="23" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">MEASURES</text>
      <text x="310" y="23" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">LONG OPTION</text>
      <text x="440" y="23" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">SHORT OPTION</text>
      <text x="560" y="23" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">HIGHEST AT</text>
    </g>
    
    {/* Data Rows */}
    <g transform="translate(40, 95)">
      {[
        { greek: "Delta (Δ)", measures: "Stock Price", long: "0 to +1 (call)", short: "0 to -1 (call)", highest: "Deep ITM", color: "#1FA978" },
        { greek: "Gamma (Γ)", measures: "Delta Change", long: "Positive", short: "Negative", highest: "ATM, near expiry", color: "#8F6FC4" },
        { greek: "Theta (Θ)", measures: "Time Decay", long: "Negative", short: "Positive", highest: "ATM, near expiry", color: "#C7363B" },
        { greek: "Vega (ν)", measures: "IV Change", long: "Positive", short: "Negative", highest: "ATM, long dated", color: "#5A77AA" },
        { greek: "Rho (ρ)", measures: "Interest Rate", long: "+ (call), - (put)", short: "- (call), + (put)", highest: "Deep ITM, LEAPS", color: "#D2754C" }
      ].map((row, i) => (
        <g key={i} transform={`translate(0, ${i * 55})`}>
          <rect x="0" y="0" width="620" height="50" fill={row.color} fillOpacity="0.1" rx="6"/>
          <text x="70" y="20" textAnchor="middle" fontSize="11" fontWeight="600" fill={row.color}>{row.greek}</text>
          <text x="180" y="20" textAnchor="middle" fontSize="10" fill="white">{row.measures}</text>
          <text x="310" y="20" textAnchor="middle" fontSize="10" fill="white">{row.long}</text>
          <text x="440" y="20" textAnchor="middle" fontSize="10" fill="white">{row.short}</text>
          <text x="560" y="20" textAnchor="middle" fontSize="9" fill="#A3A1A6">{row.highest}</text>
        </g>
      ))}
    </g>
    
    {/* Key Relationship */}
    <g transform="translate(40, 345)">
      <rect x="0" y="0" width="620" height="25" fill="#D2754C" fillOpacity="0.15" rx="6"/>
      <text x="310" y="17" textAnchor="middle" fontSize="9" fill="#D2754C">Core Tradeoff: Long options have positive gamma and vega but negative theta. Short options are the opposite.</text>
    </g>
  </svg>
);

// Quiz Questions
const quizQuestions = [
  {
    id: 1,
    question: "Theta represents:",
    options: [
      "The change in option price for a $1 move in the stock",
      "The daily dollar loss from time decay",
      "The sensitivity to volatility changes",
      "The sensitivity to interest rate changes"
    ],
    correct: 1,
    explanation: "Theta measures the daily erosion of time value. A theta of -0.05 means the option loses $0.05 per share ($5 per contract) each day, all else equal."
  },
  {
    id: 2,
    question: "When does theta decay accelerate most rapidly?",
    options: [
      "90 days to expiration",
      "60 days to expiration",
      "Final 2-3 weeks before expiration",
      "Theta decays linearly throughout"
    ],
    correct: 2,
    explanation: "Time decay follows a non-linear curve that accelerates dramatically in the final 2-3 weeks. Many traders roll or close positions before this period to avoid rapid decay."
  },
  {
    id: 3,
    question: "You are long a call option. If implied volatility increases by 5% and your Vega is 0.10, your option gains approximately:",
    options: [
      "$0.10 per share",
      "$0.50 per share",
      "$1.00 per share",
      "$5.00 per share"
    ],
    correct: 1,
    explanation: "Vega of 0.10 means each 1% IV increase adds $0.10 to the option price. A 5% IV increase adds 5 × $0.10 = $0.50 per share ($50 per contract)."
  },
  {
    id: 4,
    question: "Which Greek is typically LEAST important for short-term options traders?",
    options: [
      "Delta",
      "Gamma",
      "Theta",
      "Rho"
    ],
    correct: 3,
    explanation: "Rho measures sensitivity to interest rate changes. For short-term options, interest rate changes have minimal impact. Rho becomes more important for LEAPS (options with 1+ year expiration)."
  }
];

const FOLesson7 = () => {
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
              Lesson 7 of 12
            </span>
            <span className="flex items-center gap-1 text-gray-500  text-sm">
              <Icons.Clock className="w-4 h-4" />
              25 min read
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-normal text-gray-900  mb-4 tracking-[-0.015em]">
            The Greeks Part 2: Theta, Vega & Rho
          </h1>
          <p className="text-lg text-gray-600 ">
            Time decay, volatility sensitivity, and interest rate effects on options.
          </p>
        </div>

        {/* Learning Objectives */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 mb-10 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Icons.Target className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Learning Objectives</h2>
          </div>
          <ul className="space-y-2">
            {[
              "Master Theta and the non-linear nature of time decay",
              "Understand Vega and how to trade volatility",
              "Learn Rho and when interest rates matter",
              "See the complete Greeks picture and their interactions"
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
          
          {/* Section 1: Theta */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                  <Icons.Watch className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Understanding Theta</h2>
                  <p className="text-sm text-gray-500 ">The daily cost of holding options</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Theta represents time decay - the daily erosion of an option&apos;s time value. 
                As each day passes, options move closer to expiration and lose extrinsic value. 
                This is why options are often called &quot;wasting assets.&quot;
              </p>

              <ThetaConceptSVG />

              <div className="mt-6 bg-red-50  rounded-xl p-5 border border-red-200 ">
                <div className="flex items-start gap-3">
                  <Icons.AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-800  mb-1">Weekend Decay</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      Time decay occurs every calendar day, not just trading days. From Friday&apos;s close 
                      to Monday&apos;s open, options experience 2-3 days of theta decay. This is priced 
                      into Friday&apos;s premiums, creating opportunities for weekend theta sellers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Theta Decay Curve */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                  <Icons.TrendingDown className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Non-Linear Decay</h2>
                  <p className="text-sm text-gray-500 ">Why the final weeks are critical</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Time decay doesn&apos;t happen at a constant rate. Options lose time value slowly at first, 
                then the decay accelerates dramatically as expiration approaches.
              </p>

              <ThetaDecaySVG />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                  <h4 className="font-bold text-amber-800  mb-2">For Option Buyers</h4>
                  <p className="text-gray-700  text-sm">
                    Close or roll positions before rapid decay begins (typically 21-30 DTE). 
                    Buy more time than you think you need.
                  </p>
                </div>
                <div className="bg-green-50  rounded-xl p-5 border border-green-200 ">
                  <h4 className="font-bold text-green-800  mb-2">For Option Sellers</h4>
                  <p className="text-gray-700  text-sm">
                    Maximum theta collection in final weeks, but also maximum gamma risk. 
                    Many sellers target 30-45 DTE for balance of theta/gamma.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Vega */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                  <Icons.Activity className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Understanding Vega</h2>
                  <p className="text-sm text-gray-500 ">Your volatility exposure</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Vega measures how much an option&apos;s price changes for each 1% change in implied volatility. 
                It&apos;s crucial because IV can change rapidly, especially around earnings or market events.
              </p>

              <VegaConceptSVG />

              <div className="mt-6 bg-purple-50  rounded-xl p-5 border border-purple-200 ">
                <div className="flex items-start gap-3">
                  <Icons.Lightbulb className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-purple-800  mb-1">IV Crush</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      After major events (earnings, FDA decisions), IV typically drops sharply as uncertainty resolves. 
                      This &quot;IV crush&quot; can devastate option buyers even if the stock moves in their direction. 
                      Vega tells you exactly how much you&apos;ll lose from this crush.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Rho */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                  <Icons.Percent className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Understanding Rho</h2>
                  <p className="text-sm text-gray-500 ">Interest rate sensitivity</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Rho measures the option&apos;s sensitivity to changes in interest rates. While often 
                the least discussed Greek, it becomes important in specific situations.
              </p>

              <RhoConceptSVG />

              <div className="mt-6 bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                <h4 className="font-bold text-blue-800  mb-2">When Rho Matters</h4>
                <ul className="text-gray-700  text-sm space-y-1">
                  <li>• LEAPS (long-term options with 1+ year to expiration)</li>
                  <li>• Deep in-the-money options with significant cost-of-carry</li>
                  <li>• Periods of significant interest rate changes (like Fed policy shifts)</li>
                  <li>• Large institutional portfolios where small changes compound</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5: Greeks Summary */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                  <Icons.Sunrise className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">The Complete Picture</h2>
                  <p className="text-sm text-gray-500 ">All five Greeks at a glance</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Professional options traders manage portfolios by monitoring all Greeks simultaneously. 
                Here&apos;s the complete summary to reference as you build your trading strategies.
              </p>

              <GreeksSummarySVG />

              <div className="mt-6 bg-orange-50  rounded-xl p-5 border border-orange-200 ">
                <h4 className="font-bold text-orange-800  mb-2">The Core Trade-Off</h4>
                <p className="text-gray-700  text-sm leading-relaxed">
                  <strong>Long options:</strong> You have positive gamma (accelerating gains) and positive vega 
                  (benefit from IV spikes), but you pay for it with negative theta (daily time decay).
                  <br/><br/>
                  <strong>Short options:</strong> You collect positive theta (daily income), but face negative gamma 
                  (accelerating losses if wrong) and negative vega (hurt by IV spikes).
                </p>
              </div>
            </div>
          </section>

          {/* Key Takeaways */}
          <section>
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-semibold mb-6 tracking-[-0.015em]">Key Takeaways</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Theta is always negative for long options - you pay daily rent for time value",
                  "Time decay accelerates exponentially in the final 2-3 weeks",
                  "Vega tells you volatility exposure - critical around earnings/events",
                  "IV crush can hurt option buyers even when they're directionally correct",
                  "Rho is minor for short-term options, matters for LEAPS",
                  "Long gamma/vega vs positive theta is the fundamental options trade-off"
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
              <h2 className="text-2xl font-semibold text-gray-900  mb-6 tracking-[-0.015em]">Knowledge Check</h2>
              
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
                  className="mt-6 w-full py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-red-700 transition-all"
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
                      ? "Excellent! You understand all the Greeks." 
                      : "Review the explanations to strengthen your understanding."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 ">
            <button
              onClick={() => navigate('/learn/derivatives/lesson-6')}
              className="flex items-center gap-2 text-gray-600  hover:text-orange-600 transition-colors"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
              <span>Previous: Greeks Part 1</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/derivatives/lesson-8')}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all"
            >
              <span>Next: Volatility Analysis</span>
              <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FOLesson7;
