import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import ModuleBadge from "../../components/ModuleBadge";

// Premium SVG Icons
const Icons = {
  ArrowLeft: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  ),
  Lock: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Check: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  AlertTriangle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  TrendingUp: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Activity: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Layers: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  Shield: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Zap: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  BookOpen: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  Award: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  ),
  ArrowRight: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  )
};

// Hero SVG - Animated Derivatives Visualization
const HeroVisualizationSVG = () => (
  <svg viewBox="0 0 400 300" className="w-full h-auto max-w-md">
    <defs>
      <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Animated background circles */}
    <circle cx="200" cy="150" r="120" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1">
      <animate attributeName="r" values="120;130;120" dur="3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="200" cy="150" r="90" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1">
      <animate attributeName="r" values="90;100;90" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="200" cy="150" r="60" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1">
      <animate attributeName="r" values="60;70;60" dur="2s" repeatCount="indefinite"/>
    </circle>
    
    {/* Center icon - Derivatives Symbol */}
    <g transform="translate(200, 150)" filter="url(#glow)">
      <circle r="45" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
      
      {/* Call Option Arrow Up */}
      <g transform="translate(-15, 0)">
        <path d="M0,15 L0,-15 M-8,-7 L0,-15 L8,-7" stroke="#1FA978" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </g>
      
      {/* Put Option Arrow Down */}
      <g transform="translate(15, 0)">
        <path d="M0,-15 L0,15 M-8,7 L0,15 L8,7" stroke="#E04848" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </g>
    </g>
    
    {/* Orbiting elements */}
    <g>
      <animateTransform attributeName="transform" type="rotate" from="0 200 150" to="360 200 150" dur="20s" repeatCount="indefinite"/>
      <circle cx="200" cy="30" r="20" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
      <text x="200" y="35" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">F</text>
    </g>
    
    <g>
      <animateTransform attributeName="transform" type="rotate" from="120 200 150" to="480 200 150" dur="20s" repeatCount="indefinite"/>
      <circle cx="200" cy="30" r="20" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
      <text x="200" y="35" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">C</text>
    </g>
    
    <g>
      <animateTransform attributeName="transform" type="rotate" from="240 200 150" to="600 200 150" dur="20s" repeatCount="indefinite"/>
      <circle cx="200" cy="30" r="20" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
      <text x="200" y="35" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">P</text>
    </g>
    
    {/* Price movement line */}
    <path d="M 50 200 Q 100 180 150 220 Q 200 160 250 200 Q 300 140 350 180" 
      stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" strokeLinecap="round">
      <animate attributeName="d" 
        values="M 50 200 Q 100 180 150 220 Q 200 160 250 200 Q 300 140 350 180;
                M 50 190 Q 100 220 150 180 Q 200 200 250 160 Q 300 180 350 200;
                M 50 200 Q 100 180 150 220 Q 200 160 250 200 Q 300 140 350 180" 
        dur="4s" repeatCount="indefinite"/>
    </path>
    
    {/* Labels */}
    <text x="55" y="245" fontSize="9" fill="rgba(255,255,255,0.6)">Futures</text>
    <text x="175" y="245" fontSize="9" fill="rgba(255,255,255,0.6)">Calls</text>
    <text x="305" y="245" fontSize="9" fill="rgba(255,255,255,0.6)">Puts</text>
  </svg>
);

// Risk Warning SVG - Compact Professional Design
const RiskWarningSVG = () => (
  <svg viewBox="0 0 700 85" className="w-full h-auto">
    <defs>
      <linearGradient id="riskGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#6B2023"/>
        <stop offset="100%" stopColor="#842428"/>
      </linearGradient>
    </defs>
    
    <rect x="0" y="0" width="700" height="85" fill="url(#riskGrad)" rx="12"/>
    
    {/* Warning Icon */}
    <g transform="translate(25, 20)">
      <polygon points="22,0 44,40 0,40" fill="none" stroke="#F09B9B" strokeWidth="2"/>
      <text x="22" y="30" textAnchor="middle" fontSize="18" fontWeight="700" fill="#F09B9B">!</text>
    </g>
    
    {/* Content */}
    <g transform="translate(85, 20)">
      <text x="0" y="14" fontSize="13" fontWeight="600" fill="white">Risk Disclosure</text>
      <text x="0" y="32" fontSize="10" fill="#F6C3C3">Derivatives trading involves substantial risk. You can lose more than your initial investment.</text>
      <text x="0" y="48" fontSize="10" fill="#F6C3C3">This is educational content only — not financial advice. 89%+ of retail traders lose money.</text>
    </g>
    
    {/* Warning Badge */}
    <g transform="translate(530, 30)">
      <rect x="0" y="0" width="150" height="24" fill="#3B0D0F" rx="4" stroke="#C7363B" strokeWidth="1"/>
      <text x="75" y="16" textAnchor="middle" fontSize="9" fontWeight="600" fill="#F09B9B">⚠ Trade at your own risk</text>
    </g>
  </svg>
);

// Derivatives Contract Flow SVG
const DerivativesContractSVG = () => (
  <svg viewBox="0 0 800 400" className="w-full h-auto">
    <defs>
      <linearGradient id="heroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D2754C" stopOpacity="0.2"/>
        <stop offset="100%" stopColor="#C0623B" stopOpacity="0.1"/>
      </linearGradient>
      <linearGradient id="heroGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#D2754C"/>
        <stop offset="100%" stopColor="#C7363B"/>
      </linearGradient>
    </defs>
    
    <rect x="0" y="0" width="800" height="400" fill="url(#heroGrad1)" rx="16"/>
    
    {/* Grid */}
    {[...Array(20)].map((_, i) => (
      <line key={`v-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="400" stroke="#D2754C" strokeOpacity="0.05" strokeWidth="1"/>
    ))}
    {[...Array(10)].map((_, i) => (
      <line key={`h-${i}`} x1="0" y1={i * 40} x2="800" y2={i * 40} stroke="#D2754C" strokeOpacity="0.05" strokeWidth="1"/>
    ))}
    
    {/* Underlying Asset */}
    <g transform="translate(80, 120)">
      <rect x="0" y="0" width="180" height="160" fill="white" rx="12" stroke="#1FA978" strokeWidth="2"/>
      <rect x="0" y="0" width="180" height="40" fill="#1FA978" rx="12" ry="12"/>
      <text x="90" y="26" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">UNDERLYING ASSET</text>
      <g transform="translate(30, 60)">
        <rect x="0" y="0" width="120" height="30" fill="#D5F2E5" rx="6"/>
        <text x="60" y="20" textAnchor="middle" fontSize="12" fill="#0D543C">Stock: $150.00</text>
      </g>
      <g transform="translate(30, 100)">
        <rect x="0" y="0" width="120" height="30" fill="#D5F2E5" rx="6"/>
        <text x="60" y="20" textAnchor="middle" fontSize="12" fill="#0D543C">Real Ownership</text>
      </g>
    </g>
    
    {/* Arrow 1 */}
    <g transform="translate(270, 180)">
      <line x1="0" y1="20" x2="70" y2="20" stroke="url(#heroGrad2)" strokeWidth="3"/>
      <polygon points="70,15 85,20 70,25" fill="#D2754C"/>
      <text x="42" y="10" textAnchor="middle" fontSize="10" fill="#D2754C" fontWeight="500">derives from</text>
    </g>
    
    {/* Futures Contract */}
    <g transform="translate(360, 60)">
      <rect x="0" y="0" width="180" height="130" fill="white" rx="12" stroke="#D2754C" strokeWidth="2"/>
      <rect x="0" y="0" width="180" height="40" fill="#D2754C" rx="12" ry="12"/>
      <text x="90" y="26" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">FUTURES CONTRACT</text>
      <g transform="translate(15, 50)">
        <text x="0" y="15" fontSize="11" fill="#404047">• Obligation to buy/sell</text>
        <text x="0" y="35" fontSize="11" fill="#404047">• Fixed future price</text>
        <text x="0" y="55" fontSize="11" fill="#404047">• Margin requirement</text>
        <text x="0" y="75" fontSize="11" fill="#404047">• Daily settlement</text>
      </g>
    </g>
    
    {/* Options Contract */}
    <g transform="translate(360, 210)">
      <rect x="0" y="0" width="180" height="130" fill="white" rx="12" stroke="#C7363B" strokeWidth="2"/>
      <rect x="0" y="0" width="180" height="40" fill="#C7363B" rx="12" ry="12"/>
      <text x="90" y="26" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">OPTIONS CONTRACT</text>
      <g transform="translate(15, 50)">
        <text x="0" y="15" fontSize="11" fill="#404047">• Right, not obligation</text>
        <text x="0" y="35" fontSize="11" fill="#404047">• Strike price</text>
        <text x="0" y="55" fontSize="11" fill="#404047">• Premium paid</text>
        <text x="0" y="75" fontSize="11" fill="#404047">• Time decay</text>
      </g>
    </g>
    
    {/* Arrow 2 */}
    <g transform="translate(550, 180)">
      <line x1="0" y1="20" x2="70" y2="20" stroke="url(#heroGrad2)" strokeWidth="3"/>
      <polygon points="70,15 85,20 70,25" fill="#C7363B"/>
      <text x="42" y="10" textAnchor="middle" fontSize="10" fill="#C7363B" fontWeight="500">results in</text>
    </g>
    
    {/* Profit/Loss */}
    <g transform="translate(640, 100)">
      <rect x="0" y="0" width="140" height="70" fill="#D5F2E5" rx="10" stroke="#1FA978" strokeWidth="2"/>
      <text x="70" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0D543C">Profit</text>
      <text x="70" y="50" textAnchor="middle" fontSize="20" fontWeight="700" fill="#1FA978">+$5,000</text>
    </g>
    <g transform="translate(640, 230)">
      <rect x="0" y="0" width="140" height="70" fill="#FDF1F1" rx="10" stroke="#C7363B" strokeWidth="2"/>
      <text x="70" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">Loss</text>
      <text x="70" y="50" textAnchor="middle" fontSize="20" fontWeight="700" fill="#C7363B">-$10,000</text>
    </g>
    
    {/* Warning */}
    <g transform="translate(580, 320)">
      <rect x="0" y="0" width="200" height="50" fill="#F6ECCE" rx="8" stroke="#B8923F" strokeWidth="1"/>
      <text x="100" y="20" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B26">LEVERAGE WARNING</text>
      <text x="100" y="38" textAnchor="middle" fontSize="9" fill="#654B26">Losses can exceed initial investment</text>
    </g>
  </svg>
);

// Payoff Diagrams SVG
const PayoffDiagramsSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full h-auto">
    <defs>
      <linearGradient id="callGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1FA978" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#1FA978" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id="putGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#E04848" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#E04848" stopOpacity="0"/>
      </linearGradient>
    </defs>
    
    <rect x="0" y="0" width="700" height="300" fill="#151517" rx="12"/>
    
    <g transform="translate(40, 20)">
      <text x="130" y="25" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1FA978">Long Call Option</text>
      <line x1="30" y1="180" x2="250" y2="180" stroke="#75757D" strokeWidth="1"/>
      <line x1="30" y1="40" x2="30" y2="180" stroke="#75757D" strokeWidth="1"/>
      <text x="140" y="205" textAnchor="middle" fontSize="10" fill="#A3A1A6">Stock Price</text>
      <text x="15" y="110" textAnchor="middle" fontSize="10" fill="#A3A1A6" transform="rotate(-90 15 110)">P/L</text>
      <line x1="30" y1="130" x2="250" y2="130" stroke="#5A5A62" strokeWidth="1" strokeDasharray="4"/>
      <path d="M 30 150 L 140 150 L 220 70" stroke="#1FA978" strokeWidth="3" fill="none"/>
      <path d="M 140 150 L 220 70 L 220 180 L 140 180 Z" fill="url(#callGrad)"/>
      <line x1="140" y1="130" x2="140" y2="190" stroke="#B8923F" strokeWidth="2" strokeDasharray="4"/>
      <text x="140" y="215" textAnchor="middle" fontSize="9" fill="#B8923F">Strike</text>
      <text x="80" y="165" fontSize="9" fill="#E04848">Max Loss: Premium</text>
      <text x="180" y="85" fontSize="9" fill="#1FA978">Unlimited Profit</text>
    </g>
    
    <g transform="translate(370, 20)">
      <text x="130" y="25" textAnchor="middle" fontSize="14" fontWeight="600" fill="#E04848">Long Put Option</text>
      <line x1="30" y1="180" x2="250" y2="180" stroke="#75757D" strokeWidth="1"/>
      <line x1="30" y1="40" x2="30" y2="180" stroke="#75757D" strokeWidth="1"/>
      <text x="140" y="205" textAnchor="middle" fontSize="10" fill="#A3A1A6">Stock Price</text>
      <text x="15" y="110" textAnchor="middle" fontSize="10" fill="#A3A1A6" transform="rotate(-90 15 110)">P/L</text>
      <line x1="30" y1="130" x2="250" y2="130" stroke="#5A5A62" strokeWidth="1" strokeDasharray="4"/>
      <path d="M 30 70 L 110 150 L 250 150" stroke="#E04848" strokeWidth="3" fill="none"/>
      <path d="M 30 70 L 110 150 L 110 180 L 30 180 Z" fill="url(#putGrad)"/>
      <line x1="110" y1="130" x2="110" y2="190" stroke="#B8923F" strokeWidth="2" strokeDasharray="4"/>
      <text x="110" y="215" textAnchor="middle" fontSize="9" fill="#B8923F">Strike</text>
      <text x="160" y="165" fontSize="9" fill="#E04848">Max Loss: Premium</text>
      <text x="50" y="85" fontSize="9" fill="#1FA978">Profit when</text>
      <text x="50" y="97" fontSize="9" fill="#1FA978">price falls</text>
    </g>
    
    <g transform="translate(150, 250)">
      <rect x="0" y="0" width="400" height="35" fill="#232327" rx="8"/>
      <circle cx="40" cy="17" r="6" fill="#1FA978"/>
      <text x="55" y="22" fontSize="11" fill="#E4E1D9">Calls profit when price rises</text>
      <circle cx="230" cy="17" r="6" fill="#E04848"/>
      <text x="245" y="22" fontSize="11" fill="#E4E1D9">Puts profit when price falls</text>
    </g>
  </svg>
);

// Greeks Overview SVG
const GreeksOverviewSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="320" fill="#151517" rx="12"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">The Option Greeks</text>
    <text x="350" y="55" textAnchor="middle" fontSize="12" fill="#A3A1A6">Key sensitivities that determine option value</text>
    
    <g transform="translate(30, 80)">
      <rect x="0" y="0" width="120" height="120" fill="#232327" rx="10" stroke="#5A77AA" strokeWidth="2"/>
      <text x="60" y="35" textAnchor="middle" fontSize="28" fontWeight="700" fill="#5A77AA">Δ</text>
      <text x="60" y="55" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">Delta</text>
      <text x="60" y="75" textAnchor="middle" fontSize="9" fill="#A3A1A6">Price sensitivity</text>
      <text x="60" y="90" textAnchor="middle" fontSize="9" fill="#A3A1A6">to underlying</text>
      <rect x="20" y="100" width="80" height="12" fill="#5A77AA" fillOpacity="0.3" rx="2"/>
      <rect x="20" y="100" width="55" height="12" fill="#5A77AA" rx="2"/>
    </g>
    
    <g transform="translate(170, 80)">
      <rect x="0" y="0" width="120" height="120" fill="#232327" rx="10" stroke="#8F6FC4" strokeWidth="2"/>
      <text x="60" y="35" textAnchor="middle" fontSize="28" fontWeight="700" fill="#8F6FC4">Γ</text>
      <text x="60" y="55" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">Gamma</text>
      <text x="60" y="75" textAnchor="middle" fontSize="9" fill="#A3A1A6">Rate of change</text>
      <text x="60" y="90" textAnchor="middle" fontSize="9" fill="#A3A1A6">of delta</text>
      <rect x="20" y="100" width="80" height="12" fill="#8F6FC4" fillOpacity="0.3" rx="2"/>
      <rect x="20" y="100" width="40" height="12" fill="#8F6FC4" rx="2"/>
    </g>
    
    <g transform="translate(310, 80)">
      <rect x="0" y="0" width="120" height="120" fill="#232327" rx="10" stroke="#D2754C" strokeWidth="2"/>
      <text x="60" y="35" textAnchor="middle" fontSize="28" fontWeight="700" fill="#D2754C">Θ</text>
      <text x="60" y="55" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">Theta</text>
      <text x="60" y="75" textAnchor="middle" fontSize="9" fill="#A3A1A6">Time decay</text>
      <text x="60" y="90" textAnchor="middle" fontSize="9" fill="#A3A1A6">(daily loss)</text>
      <rect x="20" y="100" width="80" height="12" fill="#D2754C" fillOpacity="0.3" rx="2"/>
      <rect x="20" y="100" width="70" height="12" fill="#D2754C" rx="2"/>
    </g>
    
    <g transform="translate(450, 80)">
      <rect x="0" y="0" width="120" height="120" fill="#232327" rx="10" stroke="#1FA978" strokeWidth="2"/>
      <text x="60" y="35" textAnchor="middle" fontSize="28" fontWeight="700" fill="#1FA978">V</text>
      <text x="60" y="55" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">Vega</text>
      <text x="60" y="75" textAnchor="middle" fontSize="9" fill="#A3A1A6">Volatility</text>
      <text x="60" y="90" textAnchor="middle" fontSize="9" fill="#A3A1A6">sensitivity</text>
      <rect x="20" y="100" width="80" height="12" fill="#1FA978" fillOpacity="0.3" rx="2"/>
      <rect x="20" y="100" width="50" height="12" fill="#1FA978" rx="2"/>
    </g>
    
    <g transform="translate(590, 80)">
      <rect x="0" y="0" width="80" height="120" fill="#232327" rx="10" stroke="#8F6FC4" strokeWidth="2"/>
      <text x="40" y="35" textAnchor="middle" fontSize="28" fontWeight="700" fill="#8F6FC4">ρ</text>
      <text x="40" y="55" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">Rho</text>
      <text x="40" y="75" textAnchor="middle" fontSize="9" fill="#A3A1A6">Interest</text>
      <text x="40" y="90" textAnchor="middle" fontSize="9" fill="#A3A1A6">rate</text>
    </g>
    
    <g transform="translate(30, 220)">
      <rect x="0" y="0" width="640" height="80" fill="#232327" rx="10"/>
      <text x="320" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="white">Why Greeks Matter</text>
      <text x="320" y="50" textAnchor="middle" fontSize="10" fill="#A3A1A6">Options do not move 1:1 with the underlying. Greeks help you understand</text>
      <text x="320" y="68" textAnchor="middle" fontSize="10" fill="#A3A1A6">exactly how your position will behave under different market conditions.</text>
    </g>
  </svg>
);

const lessons = [
  { id: 1, title: "Introduction to Derivatives", path: "/learn/derivatives/lesson-1", available: true, description: "Understanding derivative contracts and market structure" },
  { id: 2, title: "Futures Fundamentals", path: "/learn/derivatives/lesson-2", available: true, description: "Futures contracts, margin, and settlement mechanics" },
  { id: 3, title: "Futures Pricing & Basis", path: "/learn/derivatives/lesson-3", available: true, description: "Cost of carry, contango, backwardation, and basis trading" },
  { id: 4, title: "Options Mechanics", path: "/learn/derivatives/lesson-4", available: true, description: "Calls, puts, intrinsic value, time value, and moneyness" },
  { id: 5, title: "Options Pricing Models", path: "/learn/derivatives/lesson-5", available: true, description: "Black-Scholes, binomial models, and put-call parity" },
  { id: 6, title: "The Greeks - Part 1", path: "/learn/derivatives/lesson-6", available: true, description: "Delta, gamma, and their practical applications" },
  { id: 7, title: "The Greeks - Part 2", path: "/learn/derivatives/lesson-7", available: true, description: "Theta, vega, rho and Greeks interaction" },
  { id: 8, title: "Volatility Analysis", path: "/learn/derivatives/lesson-8", available: true, description: "Implied vs historical volatility, VIX, and volatility smile" },
  { id: 9, title: "Basic Option Strategies", path: "/learn/derivatives/lesson-9", available: true, description: "Long/short positions, covered calls, and protective puts" },
  { id: 10, title: "Advanced Spreads", path: "/learn/derivatives/lesson-10", available: true, description: "Verticals, butterflies, condors, and calendar spreads" },
  { id: 11, title: "Hedging Techniques", path: "/learn/derivatives/lesson-11", available: true, description: "Delta hedging, portfolio insurance, and tail risk protection" },
  { id: 12, title: "Risk Management & Position Sizing", path: "/learn/derivatives/lesson-12", available: true, description: "Greeks management, scenario analysis, and capital allocation" }
];

const DerivativesOverview = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-orange-50  ">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
        {/* Back Navigation */}
        <Link 
          to="/learn" 
          className="inline-flex items-center gap-2 text-gray-600  hover:text-orange-600  transition-colors mb-8"
        >
          <Icons.ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Learn</span>
        </Link>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 md:p-12 shadow-2xl shadow-orange-500/20 mb-12 overflow-hidden relative">
          <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
            {/* Text Content */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold border border-white/20">
                  MODULE 3
                </span>
                <span className="px-4 py-1.5 bg-red-500/40 backdrop-blur-sm rounded-full text-white text-sm font-semibold border border-red-400/30">
                  ADVANCED
                </span>
              </div>
              
              <div className="mb-3"><ModuleBadge moduleId="derivatives" /></div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-normal text-white mb-4 leading-tight tracking-[-0.015em]">
                Derivatives: <br className="hidden sm:block" />Futures &amp; Options
              </h1>
              
              <p className="text-orange-100 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
                A comprehensive deep-dive into derivative instruments, pricing models, 
                option Greeks, trading strategies, and professional risk management.
              </p>
              
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-white/90 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Icons.BookOpen className="w-5 h-5" />
                  <span className="font-medium">12 Lessons</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Icons.Activity className="w-5 h-5" />
                  <span className="font-medium">Interactive SVGs</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Icons.Award className="w-5 h-5" />
                  <span className="font-medium">Pro Content</span>
                </div>
              </div>
            </div>
            
            {/* Animated Visualization */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <HeroVisualizationSVG />
            </div>
          </div>
        </div>

        {/* Risk Warning */}
        <div className="mb-12">
          <RiskWarningSVG />
        </div>

        {/* Contract Flow Diagram */}
        <div className="bg-white  rounded-2xl p-8 shadow-lg mb-12">
          <h2 className="text-2xl font-semibold text-gray-900  mb-6 text-center tracking-[-0.015em]">Understanding Derivative Contracts</h2>
          <DerivativesContractSVG />
        </div>

        {/* Key Concepts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white  rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-orange-100  rounded-lg flex items-center justify-center">
                <Icons.TrendingUp className="w-5 h-5 text-orange-600" />
              </span>
              <h3 className="text-lg font-semibold text-gray-900 ">Futures Contracts</h3>
            </div>
            <p className="text-gray-600  text-sm leading-relaxed">
              Standardized agreements to buy or sell an asset at a predetermined price on a future date. 
              Both parties are obligated to fulfill the contract. Used for hedging and speculation.
            </p>
          </div>
          
          <div className="bg-white  rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-red-100  rounded-lg flex items-center justify-center">
                <Icons.Layers className="w-5 h-5 text-red-600" />
              </span>
              <h3 className="text-lg font-semibold text-gray-900 ">Options Contracts</h3>
            </div>
            <p className="text-gray-600  text-sm leading-relaxed">
              Contracts giving the buyer the right, but not obligation, to buy (call) or sell (put) 
              an asset at a strike price before expiration. Premium paid for this asymmetric payoff.
            </p>
          </div>
          
          <div className="bg-white  rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-purple-100  rounded-lg flex items-center justify-center">
                <Icons.Zap className="w-5 h-5 text-purple-600" />
              </span>
              <h3 className="text-lg font-semibold text-gray-900 ">Leverage</h3>
            </div>
            <p className="text-gray-600  text-sm leading-relaxed">
              Derivatives allow control of large positions with small capital. While this magnifies 
              potential gains, it equally magnifies losses. Understanding leverage is critical.
            </p>
          </div>
          
          <div className="bg-white  rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-green-100  rounded-lg flex items-center justify-center">
                <Icons.Shield className="w-5 h-5 text-green-600" />
              </span>
              <h3 className="text-lg font-semibold text-gray-900 ">Hedging</h3>
            </div>
            <p className="text-gray-600  text-sm leading-relaxed">
              The original purpose of derivatives — reducing risk exposure. Professional portfolio 
              managers use derivatives to protect portfolios, not just for speculation.
            </p>
          </div>
        </div>

        {/* Payoff Diagrams */}
        <div className="bg-white  rounded-2xl p-8 shadow-lg mb-12">
          <h2 className="text-2xl font-semibold text-gray-900  mb-6 text-center tracking-[-0.015em]">Option Payoff Profiles</h2>
          <PayoffDiagramsSVG />
        </div>

        {/* Greeks Overview */}
        <div className="bg-white  rounded-2xl p-8 shadow-lg mb-12">
          <h2 className="text-2xl font-semibold text-gray-900  mb-6 text-center tracking-[-0.015em]">The Option Greeks</h2>
          <GreeksOverviewSVG />
        </div>

        {/* Course Content */}
        <div className="bg-white  rounded-2xl p-8 shadow-lg mb-12">
          <h2 className="text-2xl font-semibold text-gray-900  mb-2 tracking-[-0.015em]">Course Content</h2>
          <p className="text-gray-600  mb-8">
            12 comprehensive lessons covering derivatives from fundamentals to advanced strategies
          </p>
          
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div 
                key={lesson.id}
                onClick={() => lesson.available && navigate(lesson.path)}
                className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all cursor-pointer ${
                  lesson.available 
                    ? 'border-orange-200  bg-gradient-to-r from-orange-50 to-red-50   hover:border-orange-400  hover:shadow-md' 
                    : 'border-gray-200  bg-gray-50  opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    lesson.available 
                      ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-lg shadow-orange-500/30' 
                      : 'bg-gray-300  text-gray-600 '
                  }`}>
                    {lesson.id}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${lesson.available ? 'text-gray-900 ' : 'text-gray-500 '}`}>
                      {lesson.title}
                    </h3>
                    <p className={`text-sm ${lesson.available ? 'text-gray-600 ' : 'text-gray-400 '}`}>
                      {lesson.description}
                    </p>
                  </div>
                </div>
                {lesson.available ? (
                  <span className="text-orange-600  font-medium flex items-center gap-1">
                    Start
                    <Icons.ArrowRight className="w-4 h-4" />
                  </span>
                ) : (
                  <Icons.Lock className="w-5 h-5 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Learning Path */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-2xl p-8 shadow-lg mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6 tracking-[-0.015em]">Recommended Learning Path</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="text-orange-400 font-bold text-sm mb-2">WEEK 1-2</div>
              <h3 className="text-white font-semibold mb-2">Foundations</h3>
              <p className="text-gray-400 text-sm">Lessons 1-3: Understanding futures and their pricing</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="text-orange-400 font-bold text-sm mb-2">WEEK 3-4</div>
              <h3 className="text-white font-semibold mb-2">Options Core</h3>
              <p className="text-gray-400 text-sm">Lessons 4-7: Options mechanics and the Greeks</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="text-orange-400 font-bold text-sm mb-2">WEEK 5-6</div>
              <h3 className="text-white font-semibold mb-2">Strategies</h3>
              <p className="text-gray-400 text-sm">Lessons 8-10: Volatility and option strategies</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="text-orange-400 font-bold text-sm mb-2">WEEK 7-8</div>
              <h3 className="text-white font-semibold mb-2">Risk Management</h3>
              <p className="text-gray-400 text-sm">Lessons 11-12: Hedging and position sizing</p>
            </div>
          </div>
        </div>

        {/* Prerequisites */}
        <div className="bg-amber-50  border-2 border-amber-200  rounded-2xl p-8 mb-12">
          <div className="flex items-start gap-4">
            <Icons.AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-amber-800  mb-2">Prerequisites</h3>
              <p className="text-amber-700  mb-4">
                This is an advanced module. We strongly recommend completing these modules first:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link to="/learn/stock-market" className="flex items-center gap-2 text-amber-800  hover:text-orange-600 transition-colors">
                  <Icons.Check className="w-4 h-4" />
                  <span>Stock Market Fundamentals</span>
                </Link>
                <Link to="/learn/risk-management" className="flex items-center gap-2 text-amber-800  hover:text-orange-600 transition-colors">
                  <Icons.Check className="w-4 h-4" />
                  <span>Risk Management Basics</span>
                </Link>
                <Link to="/learn/portfolio-construction" className="flex items-center gap-2 text-amber-800  hover:text-orange-600 transition-colors">
                  <Icons.Check className="w-4 h-4" />
                  <span>Portfolio Construction</span>
                </Link>
                <Link to="/learn/technical-analysis" className="flex items-center gap-2 text-amber-800  hover:text-orange-600 transition-colors">
                  <Icons.Check className="w-4 h-4" />
                  <span>Technical Analysis</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-center text-white shadow-xl">
          <h3 className="text-2xl font-semibold mb-3 tracking-[-0.015em]">Ready to Master Derivatives?</h3>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            Begin your journey into the complex world of futures and options. 
            Remember: knowledge is your best protection in derivative markets.
          </p>
          <button 
            onClick={() => navigate('/learn/derivatives/lesson-1')}
            className="bg-white text-orange-600 px-8 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-colors inline-flex items-center gap-2"
          >
            Start Lesson 1
            <Icons.ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DerivativesOverview;
