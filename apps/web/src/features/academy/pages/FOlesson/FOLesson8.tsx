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
  Activity: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  TrendingUp: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  BarChart: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
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
  Zap: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  )
};

// SVG: IV vs HV Deep Dive
const IVvsHVDeepSVG = () => (
  <svg viewBox="0 0 700 400" className="w-full h-auto">
    <defs>
      <linearGradient id="volGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1F1F1F"/>
        <stop offset="100%" stopColor="#2A2A2C"/>
      </linearGradient>
    </defs>
    
    <rect x="0" y="0" width="700" height="400" fill="url(#volGrad)" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Implied vs Historical Volatility Deep Dive</text>
    
    {/* Chart Area */}
    <g transform="translate(80, 70)">
      {/* Axes */}
      <line x1="0" y1="200" x2="540" y2="200" stroke="#555A63" strokeWidth="1"/>
      <line x1="0" y1="0" x2="0" y2="200" stroke="#555A63" strokeWidth="1"/>
      
      {/* Y-axis labels */}
      <text x="-10" y="10" textAnchor="end" fontSize="9" fill="#A0A3AA">50%</text>
      <text x="-10" y="60" textAnchor="end" fontSize="9" fill="#A0A3AA">40%</text>
      <text x="-10" y="110" textAnchor="end" fontSize="9" fill="#A0A3AA">30%</text>
      <text x="-10" y="160" textAnchor="end" fontSize="9" fill="#A0A3AA">20%</text>
      <text x="-10" y="200" textAnchor="end" fontSize="9" fill="#A0A3AA">10%</text>
      
      {/* HV Line (blue) */}
      <path 
        d="M 0 140 L 60 130 L 120 145 L 180 120 L 240 135 L 300 140 L 360 125 L 420 155 L 480 145 L 540 150"
        fill="none" stroke="#5A77AA" strokeWidth="2.5"
      />
      
      {/* IV Line (orange) - showing it spiking ahead of events */}
      <path 
        d="M 0 120 L 60 100 L 120 80 L 180 130 L 240 90 L 300 50 L 360 130 L 420 110 L 480 70 L 540 120"
        fill="none" stroke="#D2754C" strokeWidth="2.5"
      />
      
      {/* Event markers */}
      <line x1="300" y1="0" x2="300" y2="200" stroke="#C7363B" strokeWidth="1" strokeDasharray="4"/>
      <text x="300" y="-8" textAnchor="middle" fontSize="8" fill="#C7363B">Earnings</text>
      
      <line x1="480" y1="0" x2="480" y2="200" stroke="#C7363B" strokeWidth="1" strokeDasharray="4"/>
      <text x="480" y="-8" textAnchor="middle" fontSize="8" fill="#C7363B">Event</text>
      
      {/* Legend */}
      <g transform="translate(380, 220)">
        <line x1="0" y1="0" x2="25" y2="0" stroke="#5A77AA" strokeWidth="3"/>
        <text x="35" y="4" fontSize="10" fill="#5A77AA">Historical Volatility (HV)</text>
        
        <line x1="0" y1="20" x2="25" y2="20" stroke="#D2754C" strokeWidth="3"/>
        <text x="35" y="24" fontSize="10" fill="#D2754C">Implied Volatility (IV)</text>
      </g>
    </g>
    
    {/* Key Observations */}
    <g transform="translate(50, 315)">
      <rect x="0" y="0" width="600" height="75" fill="#2A2A2C" rx="10"/>
      <text x="300" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">Key Observations</text>
      <text x="20" y="42" fontSize="9" fill="#A0A3AA">1. IV spikes BEFORE events (anticipation), HV reflects PAST movements</text>
      <text x="20" y="58" fontSize="9" fill="#A0A3AA">2. IV &gt; HV = Options are &quot;expensive&quot; | IV &lt; HV = Options are &quot;cheap&quot;</text>
      <text x="20" y="74" fontSize="9" fill="#D2754C">3. After events, IV typically &quot;crushes&quot; back toward HV</text>
    </g>
  </svg>
);

// SVG: VIX Explained
const VIXExplainedSVG = () => (
  <svg viewBox="0 0 700 350" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="350" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">The VIX - &quot;Fear Index&quot;</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">CBOE Volatility Index - Market&apos;s 30-day expected volatility</text>
    
    {/* VIX Gauge */}
    <g transform="translate(100, 90)">
      <rect x="0" y="0" width="500" height="50" fill="#2A2A2C" rx="8"/>
      
      {/* Color zones */}
      <rect x="5" y="15" width="120" height="20" fill="#16A34A" fillOpacity="0.5" rx="4"/>
      <rect x="125" y="15" width="120" height="20" fill="#16A34A" fillOpacity="0.3" rx="4"/>
      <rect x="245" y="15" width="120" height="20" fill="#D2754C" fillOpacity="0.5" rx="4"/>
      <rect x="365" y="15" width="130" height="20" fill="#C7363B" fillOpacity="0.5" rx="4"/>
      
      {/* Labels */}
      <text x="65" y="30" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">0-12</text>
      <text x="185" y="30" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">12-20</text>
      <text x="305" y="30" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">20-30</text>
      <text x="430" y="30" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">30+</text>
      
      <text x="65" y="60" textAnchor="middle" fontSize="8" fill="#16A34A">Low/Complacent</text>
      <text x="185" y="60" textAnchor="middle" fontSize="8" fill="#16A34A">Normal</text>
      <text x="305" y="60" textAnchor="middle" fontSize="8" fill="#D2754C">Elevated</text>
      <text x="430" y="60" textAnchor="middle" fontSize="8" fill="#C7363B">High Fear</text>
    </g>
    
    {/* How VIX is Calculated */}
    <g transform="translate(50, 170)">
      <rect x="0" y="0" width="290" height="120" fill="#5A77AA" fillOpacity="0.1" rx="10" stroke="#5A77AA" strokeWidth="1"/>
      <text x="145" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#5A77AA">How VIX is Calculated</text>
      <text x="20" y="50" fontSize="9" fill="white">• Uses S&P 500 index options prices</text>
      <text x="20" y="68" fontSize="9" fill="white">• Weights near-term & next-term options</text>
      <text x="20" y="86" fontSize="9" fill="white">• Derives 30-day expected volatility</text>
      <text x="20" y="104" fontSize="9" fill="#A0A3AA">• Expressed as annualized percentage</text>
    </g>
    
    {/* What VIX Tells You */}
    <g transform="translate(360, 170)">
      <rect x="0" y="0" width="290" height="120" fill="#D2754C" fillOpacity="0.1" rx="10" stroke="#D2754C" strokeWidth="1"/>
      <text x="145" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#D2754C">What VIX Tells You</text>
      <text x="20" y="50" fontSize="9" fill="white">• VIX of 20 = ~1.25% daily move expected</text>
      <text x="20" y="68" fontSize="9" fill="white">• VIX of 30 = ~1.9% daily move expected</text>
      <text x="20" y="86" fontSize="9" fill="#A0A3AA">Formula: Daily move ≈ VIX / √252</text>
      <text x="20" y="104" fontSize="9" fill="#A0A3AA">VIX tends to spike during sell-offs</text>
    </g>
    
    {/* Key Insight */}
    <g transform="translate(50, 305)">
      <rect x="0" y="0" width="600" height="35" fill="#8F6FC4" fillOpacity="0.15" rx="8"/>
      <text x="300" y="22" textAnchor="middle" fontSize="10" fill="#8F6FC4">VIX is mean-reverting. Extreme highs (40+) usually don&apos;t last. Many traders sell volatility after VIX spikes, expecting reversion.</text>
    </g>
  </svg>
);

// SVG: Volatility Smile
const VolatilitySmileSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="380" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">Volatility Smile & Skew</text>
    
    {/* Chart Area */}
    <g transform="translate(80, 60)">
      {/* Axes */}
      <line x1="0" y1="200" x2="540" y2="200" stroke="#555A63" strokeWidth="1"/>
      <line x1="270" y1="0" x2="270" y2="200" stroke="#555A63" strokeWidth="1" strokeDasharray="4"/>
      
      {/* X-axis labels */}
      <text x="0" y="220" textAnchor="middle" fontSize="9" fill="#A0A3AA">OTM Puts</text>
      <text x="270" y="220" textAnchor="middle" fontSize="9" fill="#D2754C">ATM</text>
      <text x="540" y="220" textAnchor="middle" fontSize="9" fill="#A0A3AA">OTM Calls</text>
      <text x="270" y="240" textAnchor="middle" fontSize="10" fill="#A0A3AA">Strike Price (relative to spot)</text>
      
      {/* Y-axis label */}
      <text x="-40" y="100" fontSize="10" fill="#A0A3AA" transform="rotate(-90, -40, 100)">Implied Volatility</text>
      
      {/* Smile curve (equity skew - puts more expensive) */}
      <path 
        d="M 0 40 C 80 80, 180 130, 270 140 C 360 150, 460 160, 540 120"
        fill="none" stroke="#D2754C" strokeWidth="3"
      />
      
      {/* Flat line (what BS assumes) */}
      <path 
        d="M 0 140 L 540 140"
        fill="none" stroke="#717680" strokeWidth="2" strokeDasharray="8"
      />
      
      {/* Annotations */}
      <g transform="translate(30, 30)">
        <rect x="0" y="0" width="140" height="40" fill="#C7363B" fillOpacity="0.2" rx="4"/>
        <text x="70" y="17" textAnchor="middle" fontSize="9" fontWeight="600" fill="#C7363B">Higher IV (OTM Puts)</text>
        <text x="70" y="32" textAnchor="middle" fontSize="8" fill="#A0A3AA">Crash protection premium</text>
      </g>
      
      <g transform="translate(370, 100)">
        <rect x="0" y="0" width="140" height="40" fill="#16A34A" fillOpacity="0.2" rx="4"/>
        <text x="70" y="17" textAnchor="middle" fontSize="9" fontWeight="600" fill="#16A34A">Lower IV (OTM Calls)</text>
        <text x="70" y="32" textAnchor="middle" fontSize="8" fill="#A0A3AA">Less demand for upside</text>
      </g>
      
      {/* Legend */}
      <g transform="translate(400, 175)">
        <line x1="0" y1="0" x2="25" y2="0" stroke="#D2754C" strokeWidth="3"/>
        <text x="35" y="4" fontSize="9" fill="#D2754C">Actual Market IV</text>
        
        <line x1="0" y1="15" x2="25" y2="15" stroke="#717680" strokeWidth="2" strokeDasharray="4"/>
        <text x="35" y="19" fontSize="9" fill="#717680">BS Assumption</text>
      </g>
    </g>
    
    {/* Explanation */}
    <g transform="translate(50, 300)">
      <rect x="0" y="0" width="600" height="70" fill="#2A2A2C" rx="10"/>
      <text x="300" y="20" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">Why the Skew Exists</text>
      <text x="20" y="40" fontSize="9" fill="#A0A3AA">• Markets crash faster than they rally - OTM puts are expensive due to tail risk hedging</text>
      <text x="20" y="55" fontSize="9" fill="#A0A3AA">• Institutional investors constantly buy downside protection, driving up put IV</text>
    </g>
  </svg>
);

// SVG: IV Rank and Percentile
const IVRankSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="320" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">IV Rank vs IV Percentile</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">Essential metrics for determining if options are &quot;cheap&quot; or &quot;expensive&quot;</text>
    
    {/* IV Rank */}
    <g transform="translate(40, 80)">
      <rect x="0" y="0" width="300" height="170" fill="#16A34A" fillOpacity="0.1" rx="12" stroke="#16A34A" strokeWidth="1"/>
      <text x="150" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#16A34A">IV RANK</text>
      
      <g transform="translate(20, 50)">
        <text x="0" y="0" fontSize="10" fill="white">Current IV&apos;s position in 52-week range</text>
        
        <text x="0" y="30" fontSize="9" fill="#A0A3AA">Formula:</text>
        <rect x="0" y="40" width="260" height="30" fill="#1F1F1F" rx="4"/>
        <text x="130" y="60" textAnchor="middle" fontSize="9" fill="white">(Current IV - 52wk Low) / (52wk High - 52wk Low)</text>
        
        <text x="0" y="95" fontSize="9" fill="#A0A3AA">Example: IV Range 15%-45%, Current 25%</text>
        <text x="0" y="110" fontSize="9" fill="#16A34A">IV Rank = (25-15)/(45-15) = 33%</text>
      </g>
    </g>
    
    {/* IV Percentile */}
    <g transform="translate(360, 80)">
      <rect x="0" y="0" width="300" height="170" fill="#5A77AA" fillOpacity="0.1" rx="12" stroke="#5A77AA" strokeWidth="1"/>
      <text x="150" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#5A77AA">IV PERCENTILE</text>
      
      <g transform="translate(20, 50)">
        <text x="0" y="0" fontSize="10" fill="white">% of days IV was LOWER than today</text>
        
        <text x="0" y="30" fontSize="9" fill="#A0A3AA">Formula:</text>
        <rect x="0" y="40" width="260" height="30" fill="#1F1F1F" rx="4"/>
        <text x="130" y="60" textAnchor="middle" fontSize="9" fill="white"># Days IV &lt; Current / Total Days (252)</text>
        
        <text x="0" y="95" fontSize="9" fill="#A0A3AA">Example: 200 of 252 days had lower IV</text>
        <text x="0" y="110" fontSize="9" fill="#5A77AA">IV Percentile = 200/252 = 79%</text>
      </g>
    </g>
    
    {/* Trading Application */}
    <g transform="translate(50, 265)">
      <rect x="0" y="0" width="600" height="45" fill="#D2754C" fillOpacity="0.15" rx="8"/>
      <text x="300" y="18" textAnchor="middle" fontSize="10" fontWeight="600" fill="#D2754C">TRADING APPLICATION</text>
      <text x="300" y="35" textAnchor="middle" fontSize="9" fill="#A0A3AA">High IV Rank/Percentile (&gt;50%) = Favor selling options | Low (&lt;30%) = Favor buying options</text>
    </g>
  </svg>
);

// SVG: IV Crush Example
const IVCrushSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="380" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">IV Crush: The Earnings Trap</text>
    
    {/* Timeline */}
    <g transform="translate(80, 60)">
      {/* Main line */}
      <line x1="0" y1="80" x2="540" y2="80" stroke="#555A63" strokeWidth="2"/>
      
      {/* Before Earnings */}
      <circle cx="100" r="8" cy="80" fill="#D2754C"/>
      <text x="100" y="55" textAnchor="middle" fontSize="10" fontWeight="600" fill="#D2754C">1 Week Before</text>
      <text x="100" y="105" textAnchor="middle" fontSize="9" fill="#A0A3AA">IV: 65%</text>
      <text x="100" y="120" textAnchor="middle" fontSize="9" fill="#A0A3AA">Call Price: $8.00</text>
      
      {/* Earnings */}
      <circle cx="300" r="10" cy="80" fill="#C7363B"/>
      <text x="300" y="55" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">EARNINGS</text>
      <text x="300" y="105" textAnchor="middle" fontSize="9" fill="#A0A3AA">IV Peak: 85%</text>
      <text x="300" y="120" textAnchor="middle" fontSize="9" fill="#A0A3AA">Call Price: $10.00</text>
      
      {/* After Earnings */}
      <circle cx="500" r="8" cy="80" fill="#16A34A"/>
      <text x="500" y="55" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16A34A">Day After</text>
      <text x="500" y="105" textAnchor="middle" fontSize="9" fill="#A0A3AA">IV: 35%</text>
      <text x="500" y="120" textAnchor="middle" fontSize="9" fill="#A0A3AA">Call Price: $5.50</text>
    </g>
    
    {/* The Trap */}
    <g transform="translate(50, 200)">
      <rect x="0" y="0" width="600" height="100" fill="#C7363B" fillOpacity="0.1" rx="10" stroke="#C7363B" strokeWidth="1"/>
      <text x="300" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">THE TRAP EXPLAINED</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="10" fill="white">Trader buys call before earnings expecting stock to rise 5%</text>
        <text x="0" y="20" fontSize="10" fill="white">Stock rises 5% as predicted, but IV drops from 85% to 35%</text>
        <text x="0" y="40" fontSize="10" fill="#C7363B">Result: Option LOSES money despite being RIGHT on direction!</text>
      </g>
    </g>
    
    {/* Solution */}
    <g transform="translate(50, 320)">
      <rect x="0" y="0" width="600" height="45" fill="#16A34A" fillOpacity="0.15" rx="8"/>
      <text x="300" y="28" textAnchor="middle" fontSize="10" fill="#16A34A">Solution: Sell options before earnings to benefit from IV crush, or use defined-risk spreads to reduce vega exposure.</text>
    </g>
  </svg>
);

// Quiz Questions
const quizQuestions = [
  {
    id: 1,
    question: "If IV is significantly higher than HV, options are generally considered:",
    options: [
      "Cheap - good time to buy",
      "Expensive - good time to sell",
      "Fairly priced",
      "Unable to determine"
    ],
    correct: 1,
    explanation: "When IV > HV, the market is pricing in more volatility than has actually occurred. This makes options relatively expensive, favoring sellers who can collect inflated premiums."
  },
  {
    id: 2,
    question: "A VIX reading of 30 implies approximately what daily move in the S&P 500?",
    options: [
      "0.5%",
      "1.0%",
      "1.9%",
      "3.0%"
    ],
    correct: 2,
    explanation: "Daily expected move ≈ VIX / √252. With VIX at 30: 30 / 15.87 ≈ 1.9% daily move expected. This formula converts annualized volatility to daily."
  },
  {
    id: 3,
    question: "Why do OTM puts typically have higher IV than OTM calls (the 'skew')?",
    options: [
      "Puts are more liquid than calls",
      "Institutional demand for downside protection",
      "Puts have more time value",
      "Black-Scholes requires this"
    ],
    correct: 1,
    explanation: "The equity volatility skew exists because institutions constantly hedge portfolios by buying OTM puts. This demand pressure raises put IV. Markets also crash faster than they rally, justifying crash protection premiums."
  },
  {
    id: 4,
    question: "What is 'IV Crush'?",
    options: [
      "When IV slowly rises over time",
      "Sharp IV drop after anticipated events (like earnings)",
      "When IV equals historical volatility",
      "The VIX reaching all-time highs"
    ],
    correct: 1,
    explanation: "IV Crush is the rapid decline in implied volatility immediately after anticipated events (earnings, FDA decisions, etc.). As uncertainty resolves, IV collapses, hurting option buyers and benefiting sellers."
  }
];

const FOLesson8 = () => {
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
              Lesson 8 of 12
            </span>
            <span className="flex items-center gap-1 text-gray-500  text-sm">
              <Icons.Clock className="w-4 h-4" />
              30 min read
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 tracking-[-0.025em]">
            Volatility Analysis
          </h1>
          <p className="text-lg text-gray-600 ">
            Master IV, HV, the VIX, volatility smile, and the infamous IV crush.
          </p>
        </div>

        {/* Learning Objectives */}
        <div className="rounded-2xl p-6 mb-10 text-white bg-brand-fill">
          <div className="flex items-center gap-3 mb-4">
            <Icons.Target className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Learning Objectives</h2>
          </div>
          <ul className="space-y-2">
            {[
              "Deeply understand the relationship between IV and HV",
              "Interpret the VIX and use it for market context",
              "Recognize and use volatility smile and skew patterns",
              "Avoid the IV crush trap around earnings"
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
          
          {/* Section 1: IV vs HV Deep Dive */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20 bg-brand-fill">
                  <Icons.Activity className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">IV vs HV: The Complete Picture</h2>
                  <p className="text-sm text-gray-500 ">Forward-looking vs backward-looking volatility</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Implied Volatility (IV) represents what the market expects future volatility to be, while 
                Historical Volatility (HV) shows what actually happened. The relationship between them 
                tells you if options are cheap or expensive.
              </p>

              <IVvsHVDeepSVG />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                  <h4 className="font-bold text-brand  mb-2">When IV &lt; HV</h4>
                  <p className="text-gray-700  text-sm">
                    Options are &quot;cheap&quot; - market expects less movement than history suggests. 
                    Consider buying strategies (long calls, long puts, straddles).
                  </p>
                </div>
                <div className="bg-red-50  rounded-xl p-5 border border-red-200 ">
                  <h4 className="font-bold text-red-800  mb-2">When IV &gt; HV</h4>
                  <p className="text-gray-700  text-sm">
                    Options are &quot;expensive&quot; - market expects more movement than history suggests. 
                    Consider selling strategies (covered calls, iron condors, credit spreads).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: VIX */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 bg-brand-fill">
                  <Icons.BarChart className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">The VIX Index</h2>
                  <p className="text-sm text-gray-500 ">The market&apos;s fear gauge</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                The VIX is the most widely followed volatility index. It measures the market&apos;s expectation 
                of 30-day volatility based on S&P 500 option prices. It&apos;s often called the &quot;fear index&quot; 
                because it typically spikes during market stress.
              </p>

              <VIXExplainedSVG />

              <div className="mt-6 bg-purple-50  rounded-xl p-5 border border-purple-200 ">
                <div className="flex items-start gap-3">
                  <Icons.Lightbulb className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-purple-800  mb-1">Trading the VIX</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      You cannot trade the VIX directly - it&apos;s just an index. However, you can trade VIX 
                      futures, options on VIX, and ETFs/ETNs like VXX. Be cautious: VIX products have unique 
                      characteristics including contango decay in futures-based products.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Volatility Smile */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20 bg-brand-fill">
                  <Icons.TrendingUp className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Volatility Smile & Skew</h2>
                  <p className="text-sm text-gray-500 ">Why different strikes have different IVs</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Black-Scholes assumes constant volatility across all strikes. In reality, different strikes 
                trade at different implied volatilities. This creates the &quot;smile&quot; or &quot;skew&quot; pattern that 
                reveals market sentiment.
              </p>

              <VolatilitySmileSVG />

              <div className="mt-6 bg-cyan-50  rounded-xl p-5 border border-cyan-200 ">
                <h4 className="font-bold text-cyan-800  mb-2">Trading Implications of Skew</h4>
                <ul className="text-gray-700  text-sm space-y-1">
                  <li>• OTM puts are expensive relative to calls - makes protective puts costly</li>
                  <li>• Vertical put spreads benefit from selling high-IV puts</li>
                  <li>• Call writers get less premium than put writers at same delta</li>
                  <li>• Skew changes can affect spread pricing significantly</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: IV Rank & Percentile */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20 bg-brand-fill">
                  <Icons.Zap className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">IV Rank & Percentile</h2>
                  <p className="text-sm text-gray-500 ">Contextualizing current IV levels</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Knowing that IV is 30% doesn&apos;t tell you if that&apos;s high or low for a particular stock. 
                IV Rank and IV Percentile provide the context you need to make informed decisions.
              </p>

              <IVRankSVG />

              <div className="mt-6 bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                <h4 className="font-bold text-brand  mb-2">Which to Use?</h4>
                <p className="text-gray-700  text-sm">
                  <strong>IV Percentile</strong> is generally more useful because it accounts for all data points, 
                  not just extremes. A single spike in IV can skew IV Rank for months. Most professional 
                  options traders prefer IV Percentile for trade selection.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: IV Crush */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                  <Icons.AlertTriangle className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">The IV Crush Trap</h2>
                  <p className="text-sm text-gray-500 ">The #1 mistake options beginners make</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Many new options traders buy calls or puts before earnings, expecting a big move. 
                They&apos;re often right about direction but still lose money. This is the IV crush trap.
              </p>

              <IVCrushSVG />

              <div className="mt-6 bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                <h4 className="font-bold text-amber-800  mb-2">How to Handle Earnings</h4>
                <ul className="text-gray-700  text-sm space-y-1">
                  <li>• <strong>Sell premium:</strong> Iron condors, strangles, or credit spreads benefit from IV crush</li>
                  <li>• <strong>Use spreads:</strong> Vertical spreads have reduced vega, lessening crush impact</li>
                  <li>• <strong>Calculate breakeven:</strong> Determine how much the stock must move to overcome crush</li>
                  <li>• <strong>Buy after earnings:</strong> IV is lowest after events - better entry for directional plays</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Key Takeaways */}
          <section>
            <div className="rounded-2xl p-8 text-white bg-brand-fill">
              <h2 className="text-2xl font-bold mb-6 tracking-[-0.025em]">Key Takeaways</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "IV shows expected volatility; HV shows actual past volatility",
                  "IV > HV = expensive options (favor selling); IV < HV = cheap options (favor buying)",
                  "VIX measures S&P 500's 30-day expected volatility; mean-reverts after spikes",
                  "Volatility skew: OTM puts have higher IV due to crash protection demand",
                  "Use IV Percentile over IV Rank for better context",
                  "IV Crush: avoid buying options before earnings; spreads reduce vega risk"
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
              <h2 className="text-2xl font-bold text-gray-900  mb-6 tracking-[-0.015em]">Knowledge Check</h2>
              
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
                                  ? 'border-brand bg-brand-soft '
                                  : 'border-red-500 bg-red-50 '
                                : 'border-orange-500 bg-orange-50 '
                              : showResults && idx === q.correct
                                ? 'border-brand bg-brand-soft '
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
                          ? 'bg-brand-soft  text-brand '
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
                  className="mt-6 w-full py-3 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-brand-fill hover:bg-brand-hover"
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
                      ? "Excellent! You understand volatility analysis." 
                      : "Review the explanations to strengthen your understanding."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 ">
            <button
              onClick={() => navigate('/learn/derivatives/lesson-7')}
              className="flex items-center gap-2 text-gray-600  hover:text-orange-600 transition-colors"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
              <span>Previous: Greeks Part 2</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/derivatives/lesson-9')}
              className="flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all bg-brand-fill hover:bg-brand-hover"
            >
              <span>Next: Basic Option Strategies</span>
              <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FOLesson8;
