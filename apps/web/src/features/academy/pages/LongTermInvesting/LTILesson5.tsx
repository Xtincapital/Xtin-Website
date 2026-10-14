import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaSeedling, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

// SVG 1: The Single Basket Problem
const SingleBasketSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The Risk of Putting Everything in One Place</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">When your single choice struggles, your entire wealth struggles</text>
    
    {/* Single basket scenario */}
    <g transform="translate(100, 75)">
      <rect x="0" y="0" width="200" height="170" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="100" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">🧺 All Eggs, One Basket</text>
      
      {/* Single large egg */}
      <g transform="translate(60, 50)">
        <ellipse cx="40" cy="50" rx="35" ry="45" fill="#F6ECCE" stroke="#E2C273" strokeWidth="2"/>
        <text x="40" y="55" textAnchor="middle" fontSize="9" fill="#654B26">100%</text>
        <text x="40" y="68" textAnchor="middle" fontSize="7" fill="#654B26">One idea</text>
      </g>
      
      <g transform="translate(20, 130)">
        <text x="0" y="0" fontSize="8" fill="#842428">If this one fails → everything fails</text>
        <text x="0" y="14" fontSize="8" fill="#842428">All risk in one place</text>
      </g>
    </g>
    
    {/* Multiple baskets scenario */}
    <g transform="translate(400, 75)">
      <rect x="0" y="0" width="200" height="170" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
      <text x="100" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">🧺🧺🧺 Eggs Spread Out</text>
      
      {/* Multiple smaller eggs */}
      <g transform="translate(15, 45)">
        <ellipse cx="25" cy="30" rx="18" ry="24" fill="#E0E7F1" stroke="#9FB3D3" strokeWidth="1.5"/>
        <ellipse cx="65" cy="30" rx="18" ry="24" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5"/>
        <ellipse cx="105" cy="30" rx="18" ry="24" fill="#F6ECCE" stroke="#E2C273" strokeWidth="1.5"/>
        <ellipse cx="145" cy="30" rx="18" ry="24" fill="#ECE4F6" stroke="#C0A9E2" strokeWidth="1.5"/>
      </g>
      
      <g transform="translate(20, 130)">
        <text x="0" y="0" fontSize="8" fill="#16A34A">If one struggles → others may hold</text>
        <text x="0" y="14" fontSize="8" fill="#16A34A">Risk is distributed</text>
      </g>
    </g>
    
    {/* Bottom message */}
    <rect x="100" y="255" width="500" height="20" fill="#2A2A2C" rx="5"/>
    <text x="350" y="269" textAnchor="middle" fontSize="9" fill="white">Diversification is about protection, not prediction.</text>
  </svg>
);

// SVG 2: What Diversification Means
const DiversificationExplainedSVG = () => (
  <svg viewBox="0 0 700 260" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="260" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">What Diversification Actually Means</text>
    
    {/* Core concept */}
    <g transform="translate(80, 55)">
      <rect x="0" y="0" width="540" height="80" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
      
      <g transform="translate(30, 25)">
        <text x="0" y="0" fontSize="12" fontWeight="600" fill="#16A34A">Spreading Your Investments</text>
        <text x="0" y="22" fontSize="10" fill="#16A34A">Owning different types of assets that don't all move together at the same time.</text>
        <text x="0" y="40" fontSize="10" fill="#16A34A">When one goes down, another might hold steady or go up.</text>
      </g>
    </g>
    
    {/* Visual representation */}
    <g transform="translate(80, 150)">
      <rect x="0" y="0" width="160" height="80" fill="#E0E7F1" rx="10" stroke="#9FB3D3" strokeWidth="1"/>
      <text x="80" y="25" textAnchor="middle" fontSize="9" fontWeight="500" fill="#2C3F5E">Asset A</text>
      <text x="80" y="45" textAnchor="middle" fontSize="18">📊</text>
      <text x="80" y="68" textAnchor="middle" fontSize="8" fill="#717680">Moves one way</text>
    </g>
    
    <g transform="translate(270, 150)">
      <rect x="0" y="0" width="160" height="80" fill="#F0FDF4" rx="10" stroke="#16A34A" strokeWidth="1"/>
      <text x="80" y="25" textAnchor="middle" fontSize="9" fontWeight="500" fill="#16A34A">Asset B</text>
      <text x="80" y="45" textAnchor="middle" fontSize="18">📈</text>
      <text x="80" y="68" textAnchor="middle" fontSize="8" fill="#717680">May move differently</text>
    </g>
    
    <g transform="translate(460, 150)">
      <rect x="0" y="0" width="160" height="80" fill="#F6ECCE" rx="10" stroke="#E2C273" strokeWidth="1"/>
      <text x="80" y="25" textAnchor="middle" fontSize="9" fontWeight="500" fill="#654B26">Asset C</text>
      <text x="80" y="45" textAnchor="middle" fontSize="18">📉</text>
      <text x="80" y="68" textAnchor="middle" fontSize="8" fill="#717680">Independent behavior</text>
    </g>
    
    {/* Connecting message */}
    <text x="350" y="250" textAnchor="middle" fontSize="10" fill="#717680">Together, they create a smoother overall journey.</text>
  </svg>
);

// SVG 3: Concentrated vs Diversified Behavior
const ConcentratedVsDiversifiedSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">How Concentration vs Diversification Behave</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Same time period, different experiences</text>
    
    {/* Concentrated portfolio */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="280" height="200" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="1"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">Concentrated Portfolio</text>
      
      {/* Wild swings */}
      <g transform="translate(25, 50)">
        <line x1="0" y1="70" x2="230" y2="70" stroke="#E4E4EA" strokeWidth="1"/>
        
        <path d="M0 70 L30 30 L60 90 L90 20 L120 100 L150 40 L180 85 L210 35 L230 60" 
              fill="none" stroke="#E04848" strokeWidth="2.5"/>
        
        <text x="115" y="130" textAnchor="middle" fontSize="8" fill="#842428">High highs, low lows</text>
        <text x="115" y="145" textAnchor="middle" fontSize="8" fill="#842428">Emotionally exhausting</text>
      </g>
    </g>
    
    {/* Diversified portfolio */}
    <g transform="translate(370, 75)">
      <rect x="0" y="0" width="280" height="200" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="1"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">Diversified Portfolio</text>
      
      {/* Smoother path */}
      <g transform="translate(25, 50)">
        <line x1="0" y1="70" x2="230" y2="70" stroke="#E4E4EA" strokeWidth="1"/>
        
        <path d="M0 75 L30 68 L60 72 L90 60 L120 65 L150 55 L180 58 L210 48 L230 45" 
              fill="none" stroke="#16A34A" strokeWidth="2.5"/>
        
        <text x="115" y="130" textAnchor="middle" fontSize="8" fill="#16A34A">Steadier progress</text>
        <text x="115" y="145" textAnchor="middle" fontSize="8" fill="#16A34A">Easier to stay invested</text>
      </g>
    </g>
    
    {/* Key insight */}
    <rect x="100" y="285" width="500" height="25" fill="#2A8C9A" rx="6"/>
    <text x="350" y="302" textAnchor="middle" fontSize="9" fill="white">Diversification doesn't eliminate movement — it smooths the journey.</text>
  </svg>
);

// SVG 4: Risk Distribution Visual
const RiskDistributionSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">How Risk Gets Distributed</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">When risk is spread, no single failure can devastate you</text>
    
    {/* Concentrated risk */}
    <g transform="translate(80, 75)">
      <text x="100" y="0" textAnchor="middle" fontSize="10" fontWeight="500" fill="#C7363B">Concentrated</text>
      
      <rect x="0" y="15" width="200" height="25" fill="#E04848" rx="4"/>
      <text x="100" y="32" textAnchor="middle" fontSize="8" fill="white">100% of risk in ONE place</text>
      
      <g transform="translate(0, 55)">
        <text x="0" y="0" fontSize="8" fill="#842428">If it fails:</text>
        <rect x="0" y="8" width="200" height="20" fill="#F6C3C3" rx="3"/>
        <text x="100" y="22" textAnchor="middle" fontSize="8" fill="#C7363B">💔 Entire portfolio affected</text>
      </g>
    </g>
    
    {/* Diversified risk */}
    <g transform="translate(420, 75)">
      <text x="100" y="0" textAnchor="middle" fontSize="10" fontWeight="500" fill="#16A34A">Diversified</text>
      
      <g transform="translate(0, 15)">
        <rect x="0" y="0" width="48" height="25" fill="#5A77AA" rx="4"/>
        <rect x="52" y="0" width="48" height="25" fill="#16A34A" rx="4"/>
        <rect x="104" y="0" width="48" height="25" fill="#B8923F" rx="4"/>
        <rect x="156" y="0" width="44" height="25" fill="#8F6FC4" rx="4"/>
      </g>
      <text x="100" y="55" textAnchor="middle" fontSize="8" fill="#717680">Risk spread across many</text>
      
      <g transform="translate(0, 70)">
        <text x="0" y="0" fontSize="8" fill="#16A34A">If one fails:</text>
        <rect x="0" y="8" width="200" height="20" fill="#F0FDF4" rx="3"/>
        <text x="100" y="22" textAnchor="middle" fontSize="8" fill="#16A34A">✓ Others may compensate</text>
      </g>
    </g>
    
    {/* Visual metaphor - Table legs */}
    <g transform="translate(150, 175)">
      <rect x="0" y="0" width="400" height="70" fill="#EEEEF1" rx="10" stroke="#A0A3AA" strokeWidth="1"/>
      <text x="200" y="22" textAnchor="middle" fontSize="10" fontWeight="500" fill="#373A41">Think of It Like a Table</text>
      
      <g transform="translate(50, 35)">
        <rect x="0" y="0" width="80" height="8" fill="#E04848" rx="2"/>
        <rect x="30" y="8" width="8" height="20" fill="#E04848"/>
        <text x="40" y="40" textAnchor="middle" fontSize="7" fill="#842428">One leg = unstable</text>
      </g>
      
      <g transform="translate(220, 35)">
        <rect x="0" y="0" width="80" height="8" fill="#16A34A" rx="2"/>
        <rect x="5" y="8" width="6" height="20" fill="#16A34A"/>
        <rect x="27" y="8" width="6" height="20" fill="#16A34A"/>
        <rect x="49" y="8" width="6" height="20" fill="#16A34A"/>
        <rect x="71" y="8" width="6" height="20" fill="#16A34A"/>
        <text x="40" y="40" textAnchor="middle" fontSize="7" fill="#16A34A">Four legs = stable</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <text x="350" y="265" textAnchor="middle" fontSize="9" fill="#717680">More support points = more stability when something goes wrong.</text>
  </svg>
);

// SVG 5: Simplicity vs Overcomplications
const SimplicityVsComplexitySVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Diversification ≠ Overcomplication</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">More isn't always better — there's a sweet spot</text>
    
    {/* Too few */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="180" height="180" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="1"/>
      <text x="90" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">Too Concentrated</text>
      
      <g transform="translate(55, 50)">
        <circle cx="35" cy="35" r="30" fill="#E04848" opacity="0.8"/>
        <text x="35" y="40" textAnchor="middle" fontSize="20" fill="white">1</text>
      </g>
      
      <g transform="translate(20, 135)">
        <text x="0" y="0" fontSize="8" fill="#842428">• High risk</text>
        <text x="0" y="14" fontSize="8" fill="#842428">• No safety net</text>
        <text x="0" y="28" fontSize="8" fill="#842428">• Stressful</text>
      </g>
    </g>
    
    {/* Just right */}
    <g transform="translate(260, 75)">
      <rect x="0" y="0" width="180" height="180" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
      <text x="90" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16A34A">✓ Well Diversified</text>
      
      <g transform="translate(30, 45)">
        <circle cx="30" cy="25" r="20" fill="#16A34A" opacity="0.8"/>
        <circle cx="70" cy="25" r="20" fill="#5A77AA" opacity="0.8"/>
        <circle cx="110" cy="25" r="20" fill="#B8923F" opacity="0.8"/>
        <circle cx="50" cy="60" r="20" fill="#8F6FC4" opacity="0.8"/>
        <circle cx="90" cy="60" r="20" fill="#8F6FC4" opacity="0.8"/>
      </g>
      
      <g transform="translate(20, 135)">
        <text x="0" y="0" fontSize="8" fill="#16A34A">• Balanced risk</text>
        <text x="0" y="14" fontSize="8" fill="#16A34A">• Manageable</text>
        <text x="0" y="28" fontSize="8" fill="#16A34A">• Sustainable</text>
      </g>
    </g>
    
    {/* Too many */}
    <g transform="translate(470, 75)">
      <rect x="0" y="0" width="180" height="180" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="1"/>
      <text x="90" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B26">Overcomplicated</text>
      
      <g transform="translate(20, 40)">
        {/* Many tiny circles */}
        {[...Array(20)].map((_, i) => (
          <circle key={i} cx={15 + (i % 5) * 28} cy={15 + Math.floor(i / 5) * 20} r="8" 
                  fill={['#E04848', '#16A34A', '#5A77AA', '#B8923F', '#8F6FC4'][i % 5]} opacity="0.6"/>
        ))}
      </g>
      
      <g transform="translate(20, 135)">
        <text x="0" y="0" fontSize="8" fill="#533E22">• Hard to track</text>
        <text x="0" y="14" fontSize="8" fill="#533E22">• Diminishing benefit</text>
        <text x="0" y="28" fontSize="8" fill="#533E22">• Overwhelming</text>
      </g>
    </g>
    
    {/* Bottom message */}
    <rect x="100" y="265" width="500" height="25" fill="#16A34A" rx="6"/>
    <text x="350" y="282" textAnchor="middle" fontSize="9" fill="white">A few well-chosen, different assets often work better than dozens of similar ones.</text>
  </svg>
);

// SVG 6: The Smoothing Effect
const SmoothingEffectSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">How Diversification Smooths Your Journey</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Individual assets move wildly; together, they balance out</text>
    
    {/* Chart area */}
    <g transform="translate(80, 75)">
      {/* Grid */}
      <line x1="0" y1="150" x2="540" y2="150" stroke="#E4E4EA" strokeWidth="1"/>
      
      {/* Individual asset lines - volatile */}
      <path d="M0 80 L60 40 L120 100 L180 30 L240 90 L300 50 L360 110 L420 40 L480 80 L540 60" 
            fill="none" stroke="#5A77AA" strokeWidth="1.5" strokeDasharray="4" opacity="0.6"/>
      <path d="M0 90 L60 120 L120 60 L180 130 L240 70 L300 100 L360 50 L420 120 L480 70 L540 90" 
            fill="none" stroke="#B8923F" strokeWidth="1.5" strokeDasharray="4" opacity="0.6"/>
      <path d="M0 100 L60 70 L120 110 L180 80 L240 120 L300 60 L360 90 L420 100 L480 60 L540 80" 
            fill="none" stroke="#8F6FC4" strokeWidth="1.5" strokeDasharray="4" opacity="0.6"/>
      
      {/* Combined portfolio - smooth */}
      <path d="M0 90 L60 78 L120 88 L180 75 L240 82 L300 68 L360 78 L420 72 L480 65 L540 60" 
            fill="none" stroke="#16A34A" strokeWidth="3"/>
      
      {/* Legend */}
      <g transform="translate(350, -20)">
        <line x1="0" y1="0" x2="20" y2="0" stroke="#717680" strokeWidth="1.5" strokeDasharray="4"/>
        <text x="28" y="4" fontSize="8" fill="#717680">Individual assets (volatile)</text>
      </g>
      <g transform="translate(350, -5)">
        <line x1="0" y1="0" x2="20" y2="0" stroke="#16A34A" strokeWidth="3"/>
        <text x="28" y="4" fontSize="8" fill="#16A34A">Combined portfolio (smoother)</text>
      </g>
      
      {/* Time label */}
      <text x="270" y="175" textAnchor="middle" fontSize="9" fill="#717680">Time →</text>
    </g>
    
    {/* Key insight */}
    <rect x="100" y="245" width="500" height="25" fill="#2A2A2C" rx="6"/>
    <text x="350" y="262" textAnchor="middle" fontSize="9" fill="white">When some zig and others zag, the overall path becomes gentler.</text>
  </svg>
);

// SVG 7: Two Investors Story
const TwoInvestorsStorySVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Two Investors, Different Approaches</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Same starting point, different levels of stability</text>
    
    {/* Market event indicator */}
    <g transform="translate(200, 65)">
      <rect x="0" y="0" width="300" height="30" fill="#F6ECCE" rx="6"/>
      <text x="150" y="19" textAnchor="middle" fontSize="9" fill="#654B26">⚡ A sector faces temporary difficulty</text>
    </g>
    
    {/* Investor A: Concentrated */}
    <g transform="translate(50, 110)">
      <rect x="0" y="0" width="280" height="195" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">😰 Vikram: Concentrated</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="9" fill="#533E22" fontWeight="500">Portfolio: All in one sector</text>
        
        <rect x="0" y="15" width="240" height="20" fill="#E04848" rx="4"/>
        <text x="120" y="29" textAnchor="middle" fontSize="8" fill="white">One sector = 100%</text>
      </g>
      
      <g transform="translate(20, 95)">
        <text x="0" y="0" fontSize="9" fill="#842428" fontWeight="500">When difficulty hits:</text>
        <text x="0" y="18" fontSize="8" fill="#842428">• Entire portfolio drops significantly</text>
        <text x="0" y="33" fontSize="8" fill="#842428">• Panic sets in</text>
        <text x="0" y="48" fontSize="8" fill="#842428">• Considers selling at the worst time</text>
        <text x="0" y="63" fontSize="8" fill="#842428">• Sleepless nights</text>
      </g>
      
      <rect x="20" y="165" width="240" height="20" fill="#C7363B" rx="4"/>
      <text x="140" y="179" textAnchor="middle" fontSize="8" fill="white">Experience: Stressful, reactive</text>
    </g>
    
    {/* Investor B: Diversified */}
    <g transform="translate(370, 110)">
      <rect x="0" y="0" width="280" height="195" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">😌 Ananya: Diversified</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="9" fill="#16A34A" fontWeight="500">Portfolio: Spread across sectors</text>
        
        <g transform="translate(0, 15)">
          <rect x="0" y="0" width="60" height="20" fill="#5A77AA" rx="4"/>
          <rect x="64" y="0" width="60" height="20" fill="#16A34A" rx="4"/>
          <rect x="128" y="0" width="60" height="20" fill="#B8923F" rx="4"/>
          <rect x="192" y="0" width="48" height="20" fill="#8F6FC4" rx="4"/>
        </g>
      </g>
      
      <g transform="translate(20, 95)">
        <text x="0" y="0" fontSize="9" fill="#16A34A" fontWeight="500">When difficulty hits:</text>
        <text x="0" y="18" fontSize="8" fill="#16A34A">• Affected sector drops, others stable</text>
        <text x="0" y="33" fontSize="8" fill="#16A34A">• Overall impact is muted</text>
        <text x="0" y="48" fontSize="8" fill="#16A34A">• No panic, stays invested</text>
        <text x="0" y="63" fontSize="8" fill="#16A34A">• Sleeps well</text>
      </g>
      
      <rect x="20" y="165" width="240" height="20" fill="#16A34A" rx="4"/>
      <text x="140" y="179" textAnchor="middle" fontSize="8" fill="white">Experience: Calm, consistent</text>
    </g>
  </svg>
);

// SVG 8: The Balance Principle
const BalancePrincipleSVG = () => (
  <svg viewBox="0 0 700 220" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="220" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The Balance Principle</text>
    
    {/* Balance scale visual */}
    <g transform="translate(250, 55)">
      {/* Fulcrum */}
      <polygon points="100,120 85,150 115,150" fill="#2A8C9A"/>
      
      {/* Beam */}
      <rect x="0" y="115" width="200" height="8" fill="#2A8C9A" rx="4"/>
      
      {/* Left pan - Risk */}
      <g transform="translate(-20, 70)">
        <ellipse cx="50" cy="45" rx="45" ry="15" fill="#FDF1F1" stroke="#F09B9B" strokeWidth="2"/>
        <text x="50" y="30" textAnchor="middle" fontSize="9" fontWeight="500" fill="#C7363B">Risk</text>
        <line x1="50" y1="45" x2="70" y2="45" stroke="#A0A3AA" strokeWidth="1"/>
      </g>
      
      {/* Right pan - Stability */}
      <g transform="translate(170, 70)">
        <ellipse cx="50" cy="45" rx="45" ry="15" fill="#F0FDF4" stroke="#16A34A" strokeWidth="2"/>
        <text x="50" y="30" textAnchor="middle" fontSize="9" fontWeight="500" fill="#16A34A">Stability</text>
        <line x1="50" y1="45" x2="30" y2="45" stroke="#A0A3AA" strokeWidth="1"/>
      </g>
      
      {/* Chains */}
      <line x1="30" y1="115" x2="30" y2="85" stroke="#A0A3AA" strokeWidth="2"/>
      <line x1="170" y1="115" x2="170" y2="85" stroke="#A0A3AA" strokeWidth="2"/>
    </g>
    
    {/* Key message */}
    <g transform="translate(80, 175)">
      <rect x="0" y="0" width="540" height="35" fill="#F0FDF4" rx="8" stroke="#16A34A" strokeWidth="1"/>
      <text x="270" y="15" textAnchor="middle" fontSize="10" fontWeight="500" fill="#16A34A">Good diversification finds balance:</text>
      <text x="270" y="30" textAnchor="middle" fontSize="9" fill="#16A34A">Enough spread for stability, not so much that it becomes unmanageable</text>
    </g>
  </svg>
);

// SVG 9: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 140" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="140" fill="url(#takeawayGrad5)" rx="16"/>
    
    <defs>
      <linearGradient id="takeawayGrad5" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#16A34A"/>
        <stop offset="100%" stopColor="#2A8C9A"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="40" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">🌱 Key Takeaway</text>
    <text x="350" y="70" textAnchor="middle" fontSize="12" fill="white">Diversification reduces risk without necessarily reducing growth.</text>
    <text x="350" y="95" textAnchor="middle" fontSize="12" fill="white">Keep it simple: a few different, well-chosen assets beats dozens of similar ones.</text>
    <text x="350" y="125" textAnchor="middle" fontSize="11" fill="#BBF7D0">Spread wisely. Simplify intentionally. Stay balanced.</text>
  </svg>
);

const LTILesson5 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const quizQuestions = [
    {
      id: 1,
      question: "What is the main purpose of diversification?",
      options: [
        "To maximize returns by picking winners",
        "To spread risk so no single failure can devastate your portfolio",
        "To own as many different assets as possible",
        "To time the market more effectively"
      ],
      correct: 1,
      explanation: "Diversification is primarily about spreading risk across different assets so that if one fails, your entire portfolio isn't devastated. It's about protection, not prediction."
    },
    {
      id: 2,
      question: "What's the difference between good diversification and overcomplication?",
      options: [
        "There's no difference — more is always better",
        "Good diversification uses only one asset; overcomplication uses many",
        "Good diversification spreads risk effectively; overcomplication adds assets without added benefit",
        "Overcomplication is cheaper than diversification"
      ],
      correct: 2,
      explanation: "Good diversification means owning enough different assets to spread risk meaningfully. Overcomplication means adding so many assets that it becomes hard to manage without adding real benefit."
    }
  ];

  const handleAnswer = (questionId, answerIndex) => {
    setQuizAnswers({ ...quizAnswers, [questionId]: answerIndex });
    setShowResults({ ...showResults, [questionId]: true });
  };

  return (
    <>
      <Navbar />
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/learn/long-term-investing" 
            className="inline-flex items-center text-teal-600 hover:text-teal-800 mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Long-Term Investing
          </Link>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-teal-100 p-3 rounded-xl">
                <FaSeedling className="text-teal-600 text-2xl" />
              </div>
              <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                Lesson 5 of 7
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-2 tracking-[-0.025em]">Diversification & Simplicity</h1>
            <p className="text-gray-600 text-lg">
              Why spreading your investments wisely creates stability and peace of mind.
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.025em]">Why Concentration Increases Risk</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              There's an old saying: "Don't put all your eggs in one basket." In investing, this 
              wisdom is more than just a proverb — it's a fundamental principle that protects 
              your wealth.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              When you put everything into a single investment, company, or sector, you're 
              betting your entire financial future on that one thing performing well. If it 
              does, great. But if it struggles — even temporarily — your entire wealth struggles 
              with it.
            </p>
            <p className="text-lg leading-relaxed">
              <strong>Diversification</strong> is the antidote to this risk. It's not about 
              chasing higher returns — it's about building a more resilient portfolio that 
              can weather different conditions.
            </p>
          </div>
        </div>

        {/* Single Basket Problem */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">The Single Basket Problem</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              When all your investments are concentrated in one place, you have no safety net. 
              A single piece of bad news, a sector downturn, or an unexpected event can affect 
              everything you own at once. Spreading your investments across different areas 
              creates multiple points of support.
            </p>
          </div>

          <SingleBasketSVG />
        </div>

        {/* What Diversification Means */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">What Diversification Really Means</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Diversification simply means owning different types of investments that don't all 
              move in the same direction at the same time. When one goes down, another might 
              stay steady or even go up.
            </p>
            <p className="text-lg leading-relaxed">
              It's not about owning everything — it's about owning different things. Different 
              sectors, different regions, different types of assets. The key is that they 
              behave independently from each other.
            </p>
          </div>

          <DiversificationExplainedSVG />
        </div>

        {/* How Diversification Smooths Outcomes */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">How Diversification Smooths Your Journey</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Individual investments can be wildly volatile. One day up, the next day down. 
              But when you combine several different investments, something interesting happens: 
              their movements tend to average out.
            </p>
            <p className="text-lg leading-relaxed">
              While some are zigging, others are zagging. The result is a smoother overall 
              journey — not eliminating all movement, but reducing the extreme swings that 
              make investing emotionally difficult.
            </p>
          </div>

          <SmoothingEffectSVG />
        </div>

        {/* Concentrated vs Diversified */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Concentrated vs Diversified Behavior</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              A concentrated portfolio rides every wave fully — both the highs and the lows. 
              This can be exciting when things go well, but exhausting and scary when they don't.
            </p>
            <p className="text-lg leading-relaxed">
              A diversified portfolio experiences a gentler ride. You might not capture every 
              peak, but you also avoid the deepest valleys. For most long-term investors, this 
              trade-off is well worth it.
            </p>
          </div>

          <ConcentratedVsDiversifiedSVG />
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">How Risk Gets Distributed</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Think of your portfolio like a table. A table with one leg is inherently unstable — 
              if that leg breaks, the whole table falls. But a table with four legs can lose 
              one and still stand.
            </p>
            <p className="text-lg leading-relaxed">
              Diversification creates multiple "legs" for your portfolio. If one investment 
              struggles, others can help keep your overall wealth stable.
            </p>
          </div>

          <RiskDistributionSVG />
        </div>

        {/* Simplicity vs Overcomplication */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">The Simplicity Sweet Spot</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Here's where many investors go wrong: they confuse diversification with owning 
              as many different things as possible. More isn't always better.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              <strong>Too concentrated</strong> = all your risk in one place. Dangerous.<br/>
              <strong>Well diversified</strong> = risk spread across meaningfully different assets. Balanced.<br/>
              <strong>Overcomplicated</strong> = so many holdings you can't track them, without added benefit. Overwhelming.
            </p>
            <p className="text-lg leading-relaxed">
              The goal is finding the sweet spot: enough diversity to spread risk, but simple 
              enough to understand and maintain. Often, a few well-chosen, genuinely different 
              assets work better than dozens of similar ones.
            </p>
          </div>

          <SimplicityVsComplexitySVG />
        </div>

        {/* Two Investors Story */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">A Tale of Two Approaches</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Consider Vikram and Ananya, two investors who face the same market event — a 
              sector experiencing temporary difficulty. Their different approaches lead to 
              very different experiences.
            </p>
          </div>

          <TwoInvestorsStorySVG />
          
          <div className="mt-6 bg-teal-50 rounded-xl p-5 border border-teal-200">
            <p className="text-teal-800">
              <strong>The lesson:</strong> Ananya doesn't have a "better" portfolio that never 
              drops. She has a more balanced portfolio where any single problem has a limited 
              impact. That balance lets her stay calm and stay invested.
            </p>
          </div>
        </div>

        {/* Balance Principle */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Finding Balance</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Good diversification is about balance — between risk and stability, between 
              growth potential and protection, between simplicity and adequacy.
            </p>
            <p className="text-lg leading-relaxed">
              You don't need to own everything. You need to own enough different things that 
              your wealth doesn't depend on any single one of them succeeding.
            </p>
          </div>

          <BalancePrincipleSVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
        </div>

        {/* India-specific Context */}
        <div className="bg-teal-50 rounded-2xl p-6 shadow-lg mb-8 border border-teal-200">
          <h3 className="text-lg font-semibold text-teal-800 mb-3">🌍 Global Perspective</h3>
          <p className="text-teal-900 mb-3">
            Diversification is a universal investing principle that works the same way 
            everywhere in the world. Whether you're investing in American markets, European 
            markets, or Indian markets, the logic remains constant: spreading your investments 
            reduces the impact of any single failure.
          </p>
          <p className="text-teal-800 text-sm">
            In India, investors often become concentrated in familiar sectors or companies. 
            The same diversification principles apply: spreading across different sectors, 
            company sizes, and even geographies creates more resilient portfolios.
          </p>
        </div>

        {/* Knowledge Check */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">📝 Knowledge Check</h2>
          <p className="text-gray-600 mb-6">Test your understanding of diversification and simplicity.</p>
          
          <div className="space-y-8">
            {quizQuestions.map((q) => (
              <div key={q.id} className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-800 mb-4">Question {q.id}: {q.question}</h4>
                <div className="space-y-2">
                  {q.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(q.id, index)}
                      disabled={showResults[q.id]}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        showResults[q.id]
                          ? index === q.correct
                            ? 'border-brand bg-brand-soft'
                            : quizAnswers[q.id] === index
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-white'
                          : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={showResults[q.id] && index === q.correct ? 'text-brand font-medium' : ''}>
                          {option}
                        </span>
                        {showResults[q.id] && index === q.correct && (
                          <FaCheckCircle className="text-brand" />
                        )}
                        {showResults[q.id] && quizAnswers[q.id] === index && index !== q.correct && (
                          <FaTimesCircle className="text-red-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {showResults[q.id] && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    quizAnswers[q.id] === q.correct ? 'bg-brand-soft' : 'bg-amber-100'
                  }`}>
                    <p className={quizAnswers[q.id] === q.correct ? 'text-brand' : 'text-amber-800'}>
                      {quizAnswers[q.id] === q.correct ? '✓ Correct! ' : '✗ Not quite. '}
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reflection Activity */}
        <div className="rounded-2xl p-8 shadow-lg mb-8 text-white bg-brand-fill">
          <div className="flex items-center gap-3 mb-4">
            <FaLightbulb className="text-2xl text-teal-200" />
            <h3 className="text-xl font-semibold">Reflection Activity</h3>
          </div>
          <p className="text-teal-100 mb-4">
            Think about your current or future investments. Where might you be too concentrated?
          </p>
          <div className="bg-white/20 rounded-xl p-5">
            <p className="text-white font-medium mb-2">Ask yourself:</p>
            <ul className="text-teal-100 space-y-2">
              <li>• Is most of your investment tied to a single company or sector?</li>
              <li>• If one investment dropped significantly, how much would your total wealth be affected?</li>
              <li>• Are you invested in things that tend to move together, or things that behave differently?</li>
              <li>• Could you explain your portfolio in one or two sentences, or is it overly complicated?</li>
              <li>• Does your current spread give you peace of mind, or does it keep you up at night?</li>
            </ul>
          </div>
          <p className="text-teal-200 mt-4 text-sm">
            There's no perfect answer here. The goal is simply awareness — understanding where 
            you might be exposed so you can make intentional choices about your level of diversification.
          </p>
        </div>

        {/* Lesson Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📚 Lesson Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <h4 className="font-semibold text-teal-800 mb-2">What We Learned</h4>
              <ul className="text-teal-700 text-sm space-y-1">
                <li>✓ Diversification = spreading risk across different assets</li>
                <li>✓ It smooths the investment journey</li>
                <li>✓ Balance beats concentration</li>
                <li>✓ Simplicity beats overcomplication</li>
              </ul>
            </div>
            <div className="bg-brand-soft rounded-xl p-4 border border-brand-line">
              <h4 className="font-semibold text-brand mb-2">Key Principles</h4>
              <ul className="text-brand text-sm space-y-1">
                <li>✓ Don't put all eggs in one basket</li>
                <li>✓ Own different things, not just more things</li>
                <li>✓ A few well-chosen assets often work best</li>
                <li>✓ Diversification reduces risk, not necessarily returns</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to="/learn/lti-lesson-4"
            className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Previous: Volatility & Staying Invested</span>
          </Link>
          <button
            onClick={() => navigate('/learn/lti-lesson-6')}
            className="flex items-center gap-2 bg-brand-fill hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <span>Next: Common Mistakes to Avoid</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default LTILesson5;
