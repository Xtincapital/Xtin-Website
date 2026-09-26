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
  ),
  Calculator: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="8" y1="18" x2="8" y2="18.01"/><line x1="12" y1="18" x2="12" y2="18.01"/><line x1="16" y1="18" x2="16" y2="18.01"/>
    </svg>
  ),
  Zap: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Grid: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Activity: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  BookOpen: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
};

// SVG: Black-Scholes Formula
const BlackScholesSVG = () => (
  <svg viewBox="0 0 700 450" className="w-full h-auto">
    <defs>
      <linearGradient id="bsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a"/>
        <stop offset="100%" stopColor="#1e3a5f"/>
      </linearGradient>
    </defs>
    
    <rect x="0" y="0" width="700" height="450" fill="url(#bsGrad)" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Black-Scholes-Merton Model</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">The Nobel Prize-winning options pricing formula (1973)</text>
    
    {/* Main Formulas */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="600" height="120" fill="#1e293b" rx="12"/>
      
      <text x="300" y="30" textAnchor="middle" fontSize="12" fontWeight="600" fill="#22c55e">CALL OPTION PRICE</text>
      <text x="300" y="55" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">C = S × N(d₁) - K × e⁻ʳᵗ × N(d₂)</text>
      
      <text x="300" y="85" textAnchor="middle" fontSize="12" fontWeight="600" fill="#dc2626">PUT OPTION PRICE</text>
      <text x="300" y="110" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">P = K × e⁻ʳᵗ × N(-d₂) - S × N(-d₁)</text>
    </g>
    
    {/* d1 and d2 formulas */}
    <g transform="translate(50, 215)">
      <rect x="0" y="0" width="290" height="80" fill="#f97316" fillOpacity="0.15" rx="10" stroke="#f97316" strokeWidth="1"/>
      <text x="145" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#f97316">d₁ Formula</text>
      <text x="145" y="50" textAnchor="middle" fontSize="12" fill="white">d₁ = [ln(S/K) + (r + σ²/2)t] / (σ√t)</text>
      <text x="145" y="70" textAnchor="middle" fontSize="9" fill="#94a3b8">Probability-weighted stock factor</text>
    </g>
    
    <g transform="translate(360, 215)">
      <rect x="0" y="0" width="290" height="80" fill="#3b82f6" fillOpacity="0.15" rx="10" stroke="#3b82f6" strokeWidth="1"/>
      <text x="145" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#3b82f6">d₂ Formula</text>
      <text x="145" y="50" textAnchor="middle" fontSize="12" fill="white">d₂ = d₁ - σ√t</text>
      <text x="145" y="70" textAnchor="middle" fontSize="9" fill="#94a3b8">Probability-weighted strike factor</text>
    </g>
    
    {/* Input Variables */}
    <g transform="translate(50, 310)">
      <text x="300" y="0" textAnchor="middle" fontSize="12" fontWeight="600" fill="white">Model Inputs (5 Variables)</text>
      
      <g transform="translate(0, 20)">
        {[
          { symbol: "S", name: "Stock Price", desc: "Current market price", color: "#22c55e" },
          { symbol: "K", name: "Strike Price", desc: "Exercise price", color: "#dc2626" },
          { symbol: "t", name: "Time to Expiry", desc: "In years", color: "#f97316" },
          { symbol: "r", name: "Risk-Free Rate", desc: "Treasury rate", color: "#3b82f6" },
          { symbol: "σ", name: "Volatility", desc: "Implied volatility", color: "#a855f7" }
        ].map((item, i) => (
          <g key={i} transform={`translate(${i * 120}, 0)`}>
            <rect x="0" y="0" width="110" height="70" fill={item.color} fillOpacity="0.15" rx="8" stroke={item.color} strokeWidth="1"/>
            <text x="55" y="22" textAnchor="middle" fontSize="16" fontWeight="700" fill={item.color}>{item.symbol}</text>
            <text x="55" y="40" textAnchor="middle" fontSize="9" fontWeight="500" fill="white">{item.name}</text>
            <text x="55" y="55" textAnchor="middle" fontSize="8" fill="#94a3b8">{item.desc}</text>
          </g>
        ))}
      </g>
    </g>
    
    {/* Key insight */}
    <g transform="translate(50, 415)">
      <rect x="0" y="0" width="600" height="25" fill="#1e293b" rx="6"/>
      <text x="300" y="17" textAnchor="middle" fontSize="9" fill="#f97316">N(x) = Cumulative standard normal distribution. The only UNKNOWN input is volatility (σ) - hence Implied Volatility.</text>
    </g>
  </svg>
);

// SVG: BS Model Assumptions
const BSAssumptionsSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="320" fill="#0f172a" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Black-Scholes Model Assumptions</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">Theoretical assumptions vs Market reality</text>
    
    {/* Assumptions Grid */}
    <g transform="translate(30, 80)">
      {[
        { assumption: "No dividends during option life", reality: "Stocks pay dividends (adjusted models exist)", valid: false },
        { assumption: "European-style exercise only", reality: "American options can exercise early", valid: false },
        { assumption: "Constant volatility", reality: "Volatility changes constantly (volatility smile)", valid: false },
        { assumption: "Log-normal price distribution", reality: "Fat tails and skewness exist", valid: false },
        { assumption: "No transaction costs or taxes", reality: "Real costs affect profitability", valid: false },
        { assumption: "Risk-free rate is constant and known", reality: "Rates change; affects longer-dated options", valid: true }
      ].map((item, i) => (
        <g key={i} transform={`translate(${(i % 2) * 320}, ${Math.floor(i / 2) * 75})`}>
          <rect x="0" y="0" width="310" height="65" fill="#1e293b" rx="8"/>
          <circle cx="20" cy="20" r="8" fill={item.valid ? "#22c55e" : "#dc2626"} fillOpacity="0.3"/>
          <text x="20" y="24" textAnchor="middle" fontSize="10" fill={item.valid ? "#22c55e" : "#dc2626"}>{item.valid ? "~" : "×"}</text>
          <text x="38" y="20" fontSize="9" fontWeight="600" fill="white">{item.assumption}</text>
          <text x="38" y="40" fontSize="8" fill="#94a3b8">{item.reality}</text>
        </g>
      ))}
    </g>
    
    {/* Bottom note */}
    <g transform="translate(50, 290)">
      <rect x="0" y="0" width="600" height="25" fill="#f97316" fillOpacity="0.15" rx="6"/>
      <text x="300" y="17" textAnchor="middle" fontSize="9" fill="#f97316">Despite limitations, BS remains the foundation. Real traders adjust for violations using Greeks and volatility smile models.</text>
    </g>
  </svg>
);

// SVG: Binomial Model
const BinomialModelSVG = () => (
  <svg viewBox="0 0 700 450" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="450" fill="#0f172a" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Binomial Option Pricing Model</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">Step-by-step approach to option valuation</text>
    
    {/* Tree Diagram */}
    <g transform="translate(100, 90)">
      <text x="0" y="0" fontSize="11" fontWeight="600" fill="white">Two-Period Binomial Tree</text>
      
      {/* Period labels */}
      <text x="50" y="30" textAnchor="middle" fontSize="9" fill="#94a3b8">t=0</text>
      <text x="200" y="30" textAnchor="middle" fontSize="9" fill="#94a3b8">t=1</text>
      <text x="350" y="-5" textAnchor="middle" fontSize="9" fill="#94a3b8">t=2 (Expiry)</text>
      
      {/* Initial node */}
      <circle cx="50" cy="140" r="25" fill="#3b82f6" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="2"/>
      <text x="50" y="137" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">S₀</text>
      <text x="50" y="150" textAnchor="middle" fontSize="8" fill="#94a3b8">$100</text>
      
      {/* Up path t=1 */}
      <line x1="75" y1="125" x2="175" y2="80" stroke="#22c55e" strokeWidth="2"/>
      <circle cx="200" cy="70" r="25" fill="#22c55e" fillOpacity="0.3" stroke="#22c55e" strokeWidth="2"/>
      <text x="200" y="67" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">Su</text>
      <text x="200" y="80" textAnchor="middle" fontSize="8" fill="#22c55e">$110</text>
      <text x="130" y="90" fontSize="8" fill="#22c55e">u=1.1</text>
      
      {/* Down path t=1 */}
      <line x1="75" y1="155" x2="175" y2="210" stroke="#dc2626" strokeWidth="2"/>
      <circle cx="200" cy="210" r="25" fill="#dc2626" fillOpacity="0.3" stroke="#dc2626" strokeWidth="2"/>
      <text x="200" y="207" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">Sd</text>
      <text x="200" y="220" textAnchor="middle" fontSize="8" fill="#dc2626">$91</text>
      <text x="130" y="195" fontSize="8" fill="#dc2626">d=0.91</text>
      
      {/* Up-Up path t=2 */}
      <line x1="225" y1="55" x2="325" y2="30" stroke="#22c55e" strokeWidth="2"/>
      <circle cx="350" cy="30" r="22" fill="#22c55e" fillOpacity="0.3" stroke="#22c55e" strokeWidth="1"/>
      <text x="350" y="27" textAnchor="middle" fontSize="9" fontWeight="600" fill="white">Suu</text>
      <text x="350" y="40" textAnchor="middle" fontSize="8" fill="#22c55e">$121</text>
      
      {/* Up-Down or Down-Up path t=2 */}
      <line x1="225" y1="80" x2="325" y2="100" stroke="#f97316" strokeWidth="2"/>
      <line x1="225" y1="195" x2="325" y2="100" stroke="#f97316" strokeWidth="2"/>
      <circle cx="350" cy="100" r="22" fill="#f97316" fillOpacity="0.3" stroke="#f97316" strokeWidth="1"/>
      <text x="350" y="97" textAnchor="middle" fontSize="9" fontWeight="600" fill="white">Sud</text>
      <text x="350" y="110" textAnchor="middle" fontSize="8" fill="#f97316">$100</text>
      
      {/* Down-Down path t=2 */}
      <line x1="225" y1="225" x2="325" y2="250" stroke="#dc2626" strokeWidth="2"/>
      <circle cx="350" cy="250" r="22" fill="#dc2626" fillOpacity="0.3" stroke="#dc2626" strokeWidth="1"/>
      <text x="350" y="247" textAnchor="middle" fontSize="9" fontWeight="600" fill="white">Sdd</text>
      <text x="350" y="260" textAnchor="middle" fontSize="8" fill="#dc2626">$83</text>
      
      {/* Option Values at expiry */}
      <g transform="translate(385, 0)">
        <text x="0" y="25" fontSize="9" fill="#22c55e">Call: $21</text>
        <text x="50" y="25" fontSize="8" fill="#94a3b8">(121-100)</text>
        <text x="0" y="105" fontSize="9" fill="#f97316">Call: $0</text>
        <text x="50" y="105" fontSize="8" fill="#94a3b8">(100-100)</text>
        <text x="0" y="255" fontSize="9" fill="#dc2626">Call: $0</text>
        <text x="50" y="255" fontSize="8" fill="#94a3b8">(max 0)</text>
      </g>
    </g>
    
    {/* Process */}
    <g transform="translate(50, 370)">
      <rect x="0" y="0" width="600" height="70" fill="#1e293b" rx="10"/>
      <text x="300" y="20" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">Backward Induction Process</text>
      <text x="300" y="40" textAnchor="middle" fontSize="9" fill="#94a3b8">1. Calculate option payoffs at expiry nodes</text>
      <text x="300" y="55" textAnchor="middle" fontSize="9" fill="#94a3b8">2. Work backwards, discounting expected values using risk-neutral probabilities</text>
    </g>
  </svg>
);

// SVG: IV vs HV
const IVvsHVSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="320" fill="#0f172a" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Implied vs Historical Volatility</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">The most critical input in option pricing</text>
    
    {/* Historical Volatility */}
    <g transform="translate(40, 80)">
      <rect x="0" y="0" width="300" height="180" fill="#3b82f6" fillOpacity="0.1" rx="12" stroke="#3b82f6" strokeWidth="2"/>
      <text x="150" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#3b82f6">HISTORICAL VOLATILITY (HV)</text>
      <text x="150" y="50" textAnchor="middle" fontSize="10" fill="#94a3b8">Looking backward</text>
      
      <g transform="translate(20, 70)">
        <rect x="0" y="0" width="260" height="90" fill="#0f172a" rx="8"/>
        <text x="130" y="22" textAnchor="middle" fontSize="10" fill="white">Actual price movements in the past</text>
        <text x="130" y="42" textAnchor="middle" fontSize="9" fill="#94a3b8">Calculated from historical prices</text>
        <text x="130" y="62" textAnchor="middle" fontSize="9" fill="#94a3b8">Standard deviation of returns</text>
        <text x="130" y="82" textAnchor="middle" fontSize="8" fill="#3b82f6">Example: 20-day HV = 25%</text>
      </g>
    </g>
    
    {/* Implied Volatility */}
    <g transform="translate(360, 80)">
      <rect x="0" y="0" width="300" height="180" fill="#f97316" fillOpacity="0.1" rx="12" stroke="#f97316" strokeWidth="2"/>
      <text x="150" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#f97316">IMPLIED VOLATILITY (IV)</text>
      <text x="150" y="50" textAnchor="middle" fontSize="10" fill="#94a3b8">Looking forward</text>
      
      <g transform="translate(20, 70)">
        <rect x="0" y="0" width="260" height="90" fill="#0f172a" rx="8"/>
        <text x="130" y="22" textAnchor="middle" fontSize="10" fill="white">Market&apos;s expectation of future volatility</text>
        <text x="130" y="42" textAnchor="middle" fontSize="9" fill="#94a3b8">Derived from current option prices</text>
        <text x="130" y="62" textAnchor="middle" fontSize="9" fill="#94a3b8">Solve BS formula for σ given market price</text>
        <text x="130" y="82" textAnchor="middle" fontSize="8" fill="#f97316">If IV &gt; HV, options are &quot;expensive&quot;</text>
      </g>
    </g>
    
    {/* Trading Insight */}
    <g transform="translate(50, 275)">
      <rect x="0" y="0" width="600" height="35" fill="#22c55e" fillOpacity="0.15" rx="8"/>
      <text x="300" y="15" textAnchor="middle" fontSize="10" fontWeight="600" fill="#22c55e">TRADING INSIGHT</text>
      <text x="300" y="30" textAnchor="middle" fontSize="9" fill="#94a3b8">Buy options when IV &lt; expected future volatility. Sell options when IV &gt; expected future volatility.</text>
    </g>
  </svg>
);

// SVG: Put-Call Parity
const PutCallParitySVG = () => (
  <svg viewBox="0 0 700 280" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="280" fill="#0f172a" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Put-Call Parity</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">The fundamental relationship between calls, puts, stock, and bonds</text>
    
    {/* Main Formula */}
    <g transform="translate(100, 80)">
      <rect x="0" y="0" width="500" height="70" fill="#1e293b" rx="12"/>
      <text x="250" y="30" textAnchor="middle" fontSize="12" fontWeight="600" fill="#f97316">Put-Call Parity Equation</text>
      <text x="250" y="55" textAnchor="middle" fontSize="20" fontWeight="700" fill="white">C + PV(K) = P + S</text>
    </g>
    
    {/* Components */}
    <g transform="translate(50, 170)">
      {[
        { symbol: "C", name: "Call Premium", color: "#22c55e" },
        { symbol: "PV(K)", name: "Present Value of Strike", color: "#f97316" },
        { symbol: "P", name: "Put Premium", color: "#dc2626" },
        { symbol: "S", name: "Stock Price", color: "#3b82f6" }
      ].map((item, i) => (
        <g key={i} transform={`translate(${i * 150}, 0)`}>
          <rect x="0" y="0" width="140" height="60" fill={item.color} fillOpacity="0.15" rx="8" stroke={item.color} strokeWidth="1"/>
          <text x="70" y="25" textAnchor="middle" fontSize="16" fontWeight="700" fill={item.color}>{item.symbol}</text>
          <text x="70" y="45" textAnchor="middle" fontSize="9" fill="white">{item.name}</text>
        </g>
      ))}
    </g>
    
    {/* Application */}
    <g transform="translate(50, 245)">
      <rect x="0" y="0" width="600" height="25" fill="#1e293b" rx="6"/>
      <text x="300" y="17" textAnchor="middle" fontSize="9" fill="#94a3b8">Application: If parity is violated, arbitrage opportunity exists. Also used to synthetically create positions.</text>
    </g>
  </svg>
);

// Quiz Questions
const quizQuestions = [
  {
    id: 1,
    question: "How many inputs does the Black-Scholes model require?",
    options: [
      "3 inputs",
      "4 inputs",
      "5 inputs",
      "6 inputs"
    ],
    correct: 2,
    explanation: "Black-Scholes requires 5 inputs: Stock price (S), Strike price (K), Time to expiry (t), Risk-free rate (r), and Volatility (σ). All except volatility are directly observable."
  },
  {
    id: 2,
    question: "What is Implied Volatility (IV)?",
    options: [
      "Historical price movement of the stock",
      "Volatility derived from option market prices",
      "The maximum possible price movement",
      "The minimum expected return"
    ],
    correct: 1,
    explanation: "Implied Volatility is the volatility level that, when plugged into the BS model, gives the current market price of the option. It represents the market's expectation of future volatility."
  },
  {
    id: 3,
    question: "Which pricing model can easily handle American-style early exercise?",
    options: [
      "Black-Scholes model only",
      "Binomial model",
      "Neither model",
      "Both models equally"
    ],
    correct: 1,
    explanation: "The Binomial model can easily handle American-style options because it builds a step-by-step tree where early exercise can be evaluated at each node. Black-Scholes assumes European-style (exercise only at expiry)."
  },
  {
    id: 4,
    question: "According to Put-Call Parity, if a call is overpriced relative to the put, what should you do?",
    options: [
      "Buy the call and sell the put",
      "Sell the call and buy the put (plus related stock/bond positions)",
      "Buy both the call and the put",
      "Wait for prices to normalize"
    ],
    correct: 1,
    explanation: "If a call is overpriced relative to put-call parity, you should sell the expensive call and buy the underpriced put (along with appropriate stock and bond positions) to lock in risk-free profit."
  }
];

const FOLesson5 = () => {
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
              Lesson 5 of 12
            </span>
            <span className="flex items-center gap-1 text-gray-500  text-sm">
              <Icons.Clock className="w-4 h-4" />
              30 min read
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900  mb-4">
            Options Pricing Models
          </h1>
          <p className="text-lg text-gray-600 ">
            Black-Scholes, Binomial models, and the critical role of implied volatility.
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
              "Understand the Black-Scholes formula and its inputs",
              "Recognize the assumptions and limitations of theoretical models",
              "Learn the Binomial model approach to option pricing",
              "Master the concept of Implied Volatility and its trading implications"
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
          
          {/* Section 1: Black-Scholes */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                  <Icons.Calculator className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Black-Scholes-Merton Model</h2>
                  <p className="text-sm text-gray-500 ">The foundation of modern options pricing</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Published in 1973 by Fischer Black, Myron Scholes, and Robert Merton (who won the Nobel Prize), 
                this model revolutionized options trading by providing a closed-form solution for European option prices.
              </p>

              <BlackScholesSVG />

              <div className="mt-6 bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                <div className="flex items-start gap-3">
                  <Icons.Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-blue-800  mb-1">The Key Insight</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      Four of the five inputs (S, K, t, r) are directly observable. <strong>Only volatility (σ) is unknown</strong>. 
                      This is why traders focus intensely on volatility - it&apos;s the only variable where they can have an edge.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: BS Assumptions */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                  <Icons.AlertTriangle className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Model Assumptions & Limitations</h2>
                  <p className="text-sm text-gray-500 ">Where theory meets reality</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                The Black-Scholes model makes several simplifying assumptions that don&apos;t hold perfectly in real markets. 
                Understanding these limitations is crucial for practical trading.
              </p>

              <BSAssumptionsSVG />

              <div className="mt-6 bg-red-50  rounded-xl p-5 border border-red-200 ">
                <h4 className="font-bold text-red-800  mb-2">Practical Implications</h4>
                <p className="text-gray-700  text-sm leading-relaxed">
                  Despite these limitations, BS remains the industry standard because it provides a common language. 
                  Traders quote prices in terms of &quot;implied volatility&quot; and use the Greeks (derivatives of BS) 
                  for risk management. More complex models exist but add computational complexity.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Binomial Model */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
                  <Icons.Grid className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Binomial Option Pricing</h2>
                  <p className="text-sm text-gray-500 ">A more intuitive, flexible approach</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                The Binomial model (Cox-Ross-Rubinstein, 1979) breaks the option&apos;s life into discrete time steps. 
                At each step, the stock can only move up or down by fixed amounts.
              </p>

              <BinomialModelSVG />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50  rounded-xl p-5 border border-green-200 ">
                  <h4 className="font-bold text-green-800  mb-2">Advantages</h4>
                  <ul className="text-gray-700  text-sm space-y-1">
                    <li>• Handles American-style options</li>
                    <li>• Intuitive step-by-step logic</li>
                    <li>• Can incorporate dividends</li>
                    <li>• Converges to BS with many steps</li>
                  </ul>
                </div>
                <div className="bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                  <h4 className="font-bold text-amber-800  mb-2">Considerations</h4>
                  <ul className="text-gray-700  text-sm space-y-1">
                    <li>• Computationally intensive</li>
                    <li>• Requires many steps for accuracy</li>
                    <li>• Choice of up/down factors matters</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: IV vs HV */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                  <Icons.Activity className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Implied vs Historical Volatility</h2>
                  <p className="text-sm text-gray-500 ">The heart of options trading</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Volatility is THE key input in options pricing. Understanding the difference between 
                implied and historical volatility is fundamental to trading options profitably.
              </p>

              <IVvsHVSVG />

              <div className="mt-6 bg-purple-50  rounded-xl p-5 border border-purple-200 ">
                <div className="flex items-start gap-3">
                  <Icons.Zap className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-purple-800  mb-1">Professional Approach</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      Many professional options traders don&apos;t bet on direction - they bet on volatility. 
                      If they think IV is too high compared to what volatility will actually be, they sell options. 
                      If IV is too low, they buy options. This is called <strong>volatility trading</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Put-Call Parity */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                  <Icons.BookOpen className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Put-Call Parity</h2>
                  <p className="text-sm text-gray-500 ">The fundamental options relationship</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Put-Call Parity is an arbitrage relationship that must hold for European options. 
                It links the prices of calls, puts, the underlying stock, and risk-free bonds.
              </p>

              <PutCallParitySVG />

              <div className="mt-6 bg-cyan-50  rounded-xl p-5 border border-cyan-200 ">
                <h4 className="font-bold text-cyan-800  mb-2">Practical Uses</h4>
                <ul className="text-gray-700  text-sm space-y-1">
                  <li>• <strong>Synthetic positions:</strong> Create a &quot;stock&quot; using options (long call + short put)</li>
                  <li>• <strong>Arbitrage check:</strong> If parity violated, risk-free profit opportunity exists</li>
                  <li>• <strong>Conversion/Reversal:</strong> Common arbitrage strategies based on parity violations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Key Takeaways */}
          <section>
            <div className="bg-gradient-to-br from-slate-900 to-orange-950 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Key Takeaways</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Black-Scholes requires 5 inputs: S, K, t, r, and σ (volatility)",
                  "Only volatility is not directly observable - hence Implied Volatility",
                  "BS assumptions don't hold perfectly in real markets (smile, fat tails)",
                  "Binomial model handles American options and is more flexible",
                  "IV > HV suggests options are expensive; IV < HV suggests they're cheap",
                  "Put-Call Parity: C + PV(K) = P + S must hold for no-arbitrage"
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
                      ? "Excellent! You understand options pricing models." 
                      : "Review the explanations to strengthen your understanding."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 ">
            <button
              onClick={() => navigate('/learn/derivatives/lesson-4')}
              className="flex items-center gap-2 text-gray-600  hover:text-orange-600 transition-colors"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
              <span>Previous: Options Mechanics</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/derivatives/lesson-6')}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all"
            >
              <span>Next: The Greeks Part 1</span>
              <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FOLesson5;
