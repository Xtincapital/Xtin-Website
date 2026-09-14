import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================
// TAX LESSON 4: LONG-TERM VS SHORT-TERM TAXES
// ============================================

// SVG 1: Time Changes Everything
const TimeChangesEverythingSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f0f9ff" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e40af">Time Changes How Your Gains Are Taxed</text>
    
    {/* Clock visualization */}
    <g transform="translate(350, 150)">
      {/* Outer ring */}
      <circle cx="0" cy="0" r="90" fill="white" stroke="#3b82f6" strokeWidth="4"/>
      
      {/* Clock face marks */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
        <line
          key={i}
          x1={75 * Math.cos((angle - 90) * Math.PI / 180)}
          y1={75 * Math.sin((angle - 90) * Math.PI / 180)}
          x2={85 * Math.cos((angle - 90) * Math.PI / 180)}
          y2={85 * Math.sin((angle - 90) * Math.PI / 180)}
          stroke="#3b82f6"
          strokeWidth="3"
        />
      ))}
      
      {/* Short-term zone (red) */}
      <path d="M0,0 L0,-70 A70,70 0 0,1 60.6,-35 Z" fill="#fecaca" stroke="#ef4444" strokeWidth="2"/>
      
      {/* Long-term zone (green) */}
      <path d="M0,0 L60.6,-35 A70,70 0 1,1 -0.1,-70 Z" fill="#bbf7d0" stroke="#22c55e" strokeWidth="2"/>
      
      {/* Center */}
      <circle cx="0" cy="0" r="10" fill="#1e40af"/>
      
      {/* Clock hands */}
      <line x1="0" y1="0" x2="0" y2="-55" stroke="#1e40af" strokeWidth="4" strokeLinecap="round"/>
      <line x1="0" y1="0" x2="35" y2="0" stroke="#1e40af" strokeWidth="3" strokeLinecap="round"/>
    </g>
    
    {/* Labels */}
    <g transform="translate(80, 100)">
      <rect x="0" y="0" width="120" height="60" fill="#fecaca" rx="8" stroke="#ef4444" strokeWidth="2"/>
      <text x="60" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">SHORT-TERM</text>
      <text x="60" y="45" textAnchor="middle" fontSize="9" fill="#991b1b">Quick sales</text>
    </g>
    
    <g transform="translate(500, 100)">
      <rect x="0" y="0" width="120" height="60" fill="#bbf7d0" rx="8" stroke="#22c55e" strokeWidth="2"/>
      <text x="60" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16a34a">LONG-TERM</text>
      <text x="60" y="45" textAnchor="middle" fontSize="9" fill="#166534">Patient holding</text>
    </g>
    
    {/* Bottom message */}
    <rect x="150" y="240" width="400" height="30" fill="#dbeafe" rx="8"/>
    <text x="350" y="260" textAnchor="middle" fontSize="11" fill="#1e40af">The same profit can be taxed differently based on how long you held it</text>
  </svg>
);

// SVG 2: Short-Term Explained
const ShortTermExplainedSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#fef2f2" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#dc2626">Short-Term: Quick Buy and Sell</text>
    
    {/* Timeline */}
    <g transform="translate(50, 70)">
      {/* Timeline bar */}
      <rect x="0" y="50" width="600" height="8" fill="#fecaca" rx="4"/>
      
      {/* Buy point */}
      <g transform="translate(0, 0)">
        <circle cx="0" cy="54" r="15" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/>
        <text x="0" y="58" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">BUY</text>
        <text x="0" y="85" textAnchor="middle" fontSize="9" fill="#991b1b">January 1</text>
      </g>
      
      {/* Time period indicator */}
      <g transform="translate(200, 20)">
        <rect x="0" y="0" width="200" height="25" fill="white" rx="6" stroke="#ef4444" strokeWidth="1"/>
        <text x="100" y="17" textAnchor="middle" fontSize="10" fill="#dc2626">Less than the threshold period</text>
      </g>
      
      {/* Sell point */}
      <g transform="translate(400, 0)">
        <circle cx="0" cy="54" r="15" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/>
        <text x="0" y="58" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">SELL</text>
        <text x="0" y="85" textAnchor="middle" fontSize="9" fill="#991b1b">June 15</text>
        <text x="0" y="100" textAnchor="middle" fontSize="8" fill="#7f1d1d">(~5.5 months later)</text>
      </g>
      
      {/* Arrow showing short period */}
      <line x1="20" y1="35" x2="380" y2="35" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,3"/>
      <polygon points="375,30 390,35 375,40" fill="#ef4444"/>
    </g>
    
    {/* Characteristics */}
    <g transform="translate(50, 180)">
      <text x="0" y="0" fontSize="12" fontWeight="600" fill="#dc2626">Short-Term Characteristics:</text>
      
      <g transform="translate(0, 20)">
        <rect x="0" y="0" width="180" height="75" fill="white" rx="8" stroke="#fca5a5" strokeWidth="1"/>
        <text x="90" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">⏱️ Quick Turnaround</text>
        <text x="90" y="42" textAnchor="middle" fontSize="9" fill="#7f1d1d">Held for a shorter</text>
        <text x="90" y="56" textAnchor="middle" fontSize="9" fill="#7f1d1d">time period</text>
      </g>
      
      <g transform="translate(200, 20)">
        <rect x="0" y="0" width="180" height="75" fill="white" rx="8" stroke="#fca5a5" strokeWidth="1"/>
        <text x="90" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">💰 Often Taxed More</text>
        <text x="90" y="42" textAnchor="middle" fontSize="9" fill="#7f1d1d">Usually treated like</text>
        <text x="90" y="56" textAnchor="middle" fontSize="9" fill="#7f1d1d">regular income</text>
      </g>
      
      <g transform="translate(400, 20)">
        <rect x="0" y="0" width="180" height="75" fill="white" rx="8" stroke="#fca5a5" strokeWidth="1"/>
        <text x="90" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">🔄 Active Approach</text>
        <text x="90" y="42" textAnchor="middle" fontSize="9" fill="#7f1d1d">Frequent buying</text>
        <text x="90" y="56" textAnchor="middle" fontSize="9" fill="#7f1d1d">and selling</text>
      </g>
    </g>
  </svg>
);

// SVG 3: Long-Term Explained
const LongTermExplainedSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f0fdf4" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#16a34a">Long-Term: Patient Holding</text>
    
    {/* Timeline */}
    <g transform="translate(50, 70)">
      {/* Timeline bar */}
      <rect x="0" y="50" width="600" height="8" fill="#bbf7d0" rx="4"/>
      
      {/* Buy point */}
      <g transform="translate(0, 0)">
        <circle cx="0" cy="54" r="15" fill="#22c55e" stroke="#16a34a" strokeWidth="2"/>
        <text x="0" y="58" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">BUY</text>
        <text x="0" y="85" textAnchor="middle" fontSize="9" fill="#166534">January 1, 2023</text>
      </g>
      
      {/* Time period indicator */}
      <g transform="translate(150, 20)">
        <rect x="0" y="0" width="300" height="25" fill="white" rx="6" stroke="#22c55e" strokeWidth="1"/>
        <text x="150" y="17" textAnchor="middle" fontSize="10" fill="#16a34a">Exceeds the threshold period (patient waiting)</text>
      </g>
      
      {/* Sell point */}
      <g transform="translate(600, 0)">
        <circle cx="0" cy="54" r="15" fill="#22c55e" stroke="#16a34a" strokeWidth="2"/>
        <text x="0" y="58" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">SELL</text>
        <text x="0" y="85" textAnchor="middle" fontSize="9" fill="#166534">March 15, 2024</text>
        <text x="0" y="100" textAnchor="middle" fontSize="8" fill="#14532d">(14+ months later)</text>
      </g>
      
      {/* Arrow showing long period */}
      <line x1="20" y1="35" x2="580" y2="35" stroke="#22c55e" strokeWidth="2" strokeDasharray="5,3"/>
      <polygon points="575,30 590,35 575,40" fill="#22c55e"/>
    </g>
    
    {/* Characteristics */}
    <g transform="translate(50, 180)">
      <text x="0" y="0" fontSize="12" fontWeight="600" fill="#16a34a">Long-Term Characteristics:</text>
      
      <g transform="translate(0, 20)">
        <rect x="0" y="0" width="180" height="75" fill="white" rx="8" stroke="#86efac" strokeWidth="1"/>
        <text x="90" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16a34a">⏳ Patient Holding</text>
        <text x="90" y="42" textAnchor="middle" fontSize="9" fill="#14532d">Held for longer than</text>
        <text x="90" y="56" textAnchor="middle" fontSize="9" fill="#14532d">the threshold period</text>
      </g>
      
      <g transform="translate(200, 20)">
        <rect x="0" y="0" width="180" height="75" fill="white" rx="8" stroke="#86efac" strokeWidth="1"/>
        <text x="90" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16a34a">💚 Often Taxed Less</text>
        <text x="90" y="42" textAnchor="middle" fontSize="9" fill="#14532d">Usually gets favorable</text>
        <text x="90" y="56" textAnchor="middle" fontSize="9" fill="#14532d">tax treatment</text>
      </g>
      
      <g transform="translate(400, 20)">
        <rect x="0" y="0" width="180" height="75" fill="white" rx="8" stroke="#86efac" strokeWidth="1"/>
        <text x="90" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16a34a">🌱 Buy & Hold</text>
        <text x="90" y="42" textAnchor="middle" fontSize="9" fill="#14532d">Less frequent</text>
        <text x="90" y="56" textAnchor="middle" fontSize="9" fill="#14532d">transactions</text>
      </g>
    </g>
  </svg>
);

// SVG 4: Why Time Matters
const WhyTimeMattesSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#faf5ff" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#7c3aed">Why Does Holding Period Matter?</text>
    
    {/* Reason 1 */}
    <g transform="translate(50, 55)">
      <rect x="0" y="0" width="280" height="120" fill="white" rx="12" stroke="#8b5cf6" strokeWidth="2"/>
      <circle cx="35" cy="35" r="22" fill="#8b5cf6"/>
      <text x="35" y="42" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">1</text>
      
      <text x="70" y="32" fontSize="12" fontWeight="600" fill="#7c3aed">Encourages Long-Term Thinking</text>
      <text x="20" y="55" fontSize="10" fill="#4b5563">Governments want investors to</text>
      <text x="20" y="70" fontSize="10" fill="#4b5563">think long-term. Favorable tax</text>
      <text x="20" y="85" fontSize="10" fill="#4b5563">treatment for patient holding</text>
      <text x="20" y="100" fontSize="10" fill="#4b5563">encourages this behavior.</text>
    </g>
    
    {/* Reason 2 */}
    <g transform="translate(370, 55)">
      <rect x="0" y="0" width="280" height="120" fill="white" rx="12" stroke="#8b5cf6" strokeWidth="2"/>
      <circle cx="35" cy="35" r="22" fill="#8b5cf6"/>
      <text x="35" y="42" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">2</text>
      
      <text x="70" y="32" fontSize="12" fontWeight="600" fill="#7c3aed">Reduces Market Speculation</text>
      <text x="20" y="55" fontSize="10" fill="#4b5563">Quick buying and selling can</text>
      <text x="20" y="70" fontSize="10" fill="#4b5563">create market instability. Higher</text>
      <text x="20" y="85" fontSize="10" fill="#4b5563">taxes on short-term gains may</text>
      <text x="20" y="100" fontSize="10" fill="#4b5563">discourage excessive trading.</text>
    </g>
    
    {/* Reason 3 */}
    <g transform="translate(50, 190)">
      <rect x="0" y="0" width="280" height="120" fill="white" rx="12" stroke="#8b5cf6" strokeWidth="2"/>
      <circle cx="35" cy="35" r="22" fill="#8b5cf6"/>
      <text x="35" y="42" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">3</text>
      
      <text x="70" y="32" fontSize="12" fontWeight="600" fill="#7c3aed">Rewards Patient Investors</text>
      <text x="20" y="55" fontSize="10" fill="#4b5563">Those who hold through market</text>
      <text x="20" y="70" fontSize="10" fill="#4b5563">ups and downs are often given</text>
      <text x="20" y="85" fontSize="10" fill="#4b5563">a tax benefit as a reward for</text>
      <text x="20" y="100" fontSize="10" fill="#4b5563">their patience and commitment.</text>
    </g>
    
    {/* Reason 4 */}
    <g transform="translate(370, 190)">
      <rect x="0" y="0" width="280" height="120" fill="white" rx="12" stroke="#8b5cf6" strokeWidth="2"/>
      <circle cx="35" cy="35" r="22" fill="#8b5cf6"/>
      <text x="35" y="42" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">4</text>
      
      <text x="70" y="32" fontSize="12" fontWeight="600" fill="#7c3aed">Supports Economic Stability</text>
      <text x="20" y="55" fontSize="10" fill="#4b5563">Long-term investing supports</text>
      <text x="20" y="70" fontSize="10" fill="#4b5563">businesses with stable capital.</text>
      <text x="20" y="85" fontSize="10" fill="#4b5563">Tax policy often reflects this</text>
      <text x="20" y="100" fontSize="10" fill="#4b5563">preference for stability.</text>
    </g>
  </svg>
);

// SVG 5: Side-by-Side Comparison
const ComparisonSVG = () => (
  <svg viewBox="0 0 700 350" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="350" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e40af">Quick Selling vs Patient Holding</text>
    
    {/* Short-term side */}
    <g transform="translate(50, 55)">
      <rect x="0" y="0" width="280" height="270" fill="white" rx="12" stroke="#ef4444" strokeWidth="2"/>
      
      {/* Header */}
      <rect x="0" y="0" width="280" height="45" fill="#ef4444" rx="12"/>
      <rect x="0" y="25" width="280" height="20" fill="#ef4444"/>
      <text x="140" y="30" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">⚡ SHORT-TERM</text>
      
      {/* Content */}
      <g transform="translate(20, 60)">
        <g transform="translate(0, 0)">
          <circle cx="8" cy="8" r="5" fill="#fecaca"/>
          <text x="22" y="12" fontSize="10" fill="#374151"><tspan fontWeight="600">Holding:</tspan> Brief period</text>
        </g>
        
        <g transform="translate(0, 30)">
          <circle cx="8" cy="8" r="5" fill="#fecaca"/>
          <text x="22" y="12" fontSize="10" fill="#374151"><tspan fontWeight="600">Approach:</tspan> Active trading</text>
        </g>
        
        <g transform="translate(0, 60)">
          <circle cx="8" cy="8" r="5" fill="#fecaca"/>
          <text x="22" y="12" fontSize="10" fill="#374151"><tspan fontWeight="600">Tax treatment:</tspan> Usually higher</text>
        </g>
        
        <g transform="translate(0, 90)">
          <circle cx="8" cy="8" r="5" fill="#fecaca"/>
          <text x="22" y="12" fontSize="10" fill="#374151"><tspan fontWeight="600">Often taxed as:</tspan> Regular income</text>
        </g>
        
        <g transform="translate(0, 120)">
          <circle cx="8" cy="8" r="5" fill="#fecaca"/>
          <text x="22" y="12" fontSize="10" fill="#374151"><tspan fontWeight="600">Philosophy:</tspan> Quick profits</text>
        </g>
        
        <rect x="0" y="155" width="240" height="50" fill="#fef2f2" rx="6"/>
        <text x="120" y="175" textAnchor="middle" fontSize="9" fill="#991b1b">Example: Buy stock in January,</text>
        <text x="120" y="190" textAnchor="middle" fontSize="9" fill="#991b1b">sell in March (3 months)</text>
      </g>
    </g>
    
    {/* VS */}
    <g transform="translate(335, 170)">
      <circle cx="15" cy="15" r="22" fill="#1e40af"/>
      <text x="15" y="21" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">VS</text>
    </g>
    
    {/* Long-term side */}
    <g transform="translate(370, 55)">
      <rect x="0" y="0" width="280" height="270" fill="white" rx="12" stroke="#22c55e" strokeWidth="2"/>
      
      {/* Header */}
      <rect x="0" y="0" width="280" height="45" fill="#22c55e" rx="12"/>
      <rect x="0" y="25" width="280" height="20" fill="#22c55e"/>
      <text x="140" y="30" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">🌱 LONG-TERM</text>
      
      {/* Content */}
      <g transform="translate(20, 60)">
        <g transform="translate(0, 0)">
          <circle cx="8" cy="8" r="5" fill="#bbf7d0"/>
          <text x="22" y="12" fontSize="10" fill="#374151"><tspan fontWeight="600">Holding:</tspan> Extended period</text>
        </g>
        
        <g transform="translate(0, 30)">
          <circle cx="8" cy="8" r="5" fill="#bbf7d0"/>
          <text x="22" y="12" fontSize="10" fill="#374151"><tspan fontWeight="600">Approach:</tspan> Buy and hold</text>
        </g>
        
        <g transform="translate(0, 60)">
          <circle cx="8" cy="8" r="5" fill="#bbf7d0"/>
          <text x="22" y="12" fontSize="10" fill="#374151"><tspan fontWeight="600">Tax treatment:</tspan> Usually lower</text>
        </g>
        
        <g transform="translate(0, 90)">
          <circle cx="8" cy="8" r="5" fill="#bbf7d0"/>
          <text x="22" y="12" fontSize="10" fill="#374151"><tspan fontWeight="600">Often taxed as:</tspan> Capital gains</text>
        </g>
        
        <g transform="translate(0, 120)">
          <circle cx="8" cy="8" r="5" fill="#bbf7d0"/>
          <text x="22" y="12" fontSize="10" fill="#374151"><tspan fontWeight="600">Philosophy:</tspan> Wealth building</text>
        </g>
        
        <rect x="0" y="155" width="240" height="50" fill="#f0fdf4" rx="6"/>
        <text x="120" y="175" textAnchor="middle" fontSize="9" fill="#166534">Example: Buy stock in January 2023,</text>
        <text x="120" y="190" textAnchor="middle" fontSize="9" fill="#166534">sell in March 2024 (14+ months)</text>
      </g>
    </g>
  </svg>
);

// SVG 6: Global Example - Emma's Two Investments
const GlobalExampleSVG = () => (
  <svg viewBox="0 0 700 420" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="420" fill="#f0f9ff" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e40af">Example: Emma's Two Stock Sales</text>
    
    {/* Emma character */}
    <g transform="translate(50, 50)">
      <circle cx="35" cy="22" r="20" fill="#3b82f6"/>
      <circle cx="28" cy="18" r="3" fill="white"/>
      <circle cx="42" cy="18" r="3" fill="white"/>
      <path d="M28 28 Q35 34 42 28" stroke="white" strokeWidth="2" fill="none"/>
      <rect x="20" y="45" width="30" height="35" fill="#3b82f6" rx="4"/>
      <text x="85" y="35" fontSize="13" fontWeight="600" fill="#1e40af">Emma</text>
      <text x="85" y="52" fontSize="10" fill="#4b5563">Made $1,000 profit on each stock</text>
      <text x="85" y="67" fontSize="10" fill="#4b5563">But held them for different times</text>
    </g>
    
    {/* Investment 1: Short-term */}
    <g transform="translate(50, 130)">
      <rect x="0" y="0" width="280" height="250" fill="white" rx="12" stroke="#ef4444" strokeWidth="2"/>
      
      <rect x="0" y="0" width="280" height="40" fill="#ef4444" rx="12"/>
      <rect x="0" y="20" width="280" height="20" fill="#ef4444"/>
      <text x="140" y="27" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">Stock A: Short-Term</text>
      
      <g transform="translate(20, 55)">
        <text x="0" y="15" fontSize="10" fill="#4b5563">Bought:</text>
        <text x="120" y="15" fontSize="10" fontWeight="600" fill="#374151">January 1, 2024</text>
        
        <text x="0" y="35" fontSize="10" fill="#4b5563">Price paid:</text>
        <text x="120" y="35" fontSize="10" fontWeight="600" fill="#374151">$5,000</text>
        
        <text x="0" y="55" fontSize="10" fill="#4b5563">Sold:</text>
        <text x="120" y="55" fontSize="10" fontWeight="600" fill="#374151">April 15, 2024</text>
        
        <text x="0" y="75" fontSize="10" fill="#4b5563">Sale price:</text>
        <text x="120" y="75" fontSize="10" fontWeight="600" fill="#374151">$6,000</text>
        
        <line x1="0" y1="90" x2="240" y2="90" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="0" y="110" fontSize="10" fill="#4b5563">Profit:</text>
        <text x="120" y="110" fontSize="11" fontWeight="bold" fill="#059669">$1,000</text>
        
        <text x="0" y="130" fontSize="10" fill="#4b5563">Holding period:</text>
        <text x="120" y="130" fontSize="10" fontWeight="600" fill="#dc2626">~3.5 months</text>
        
        <rect x="0" y="150" width="240" height="40" fill="#fef2f2" rx="6"/>
        <text x="120" y="168" textAnchor="middle" fontSize="9" fill="#991b1b">Short-term gain: May be taxed</text>
        <text x="120" y="182" textAnchor="middle" fontSize="9" fill="#991b1b">at higher rate (like income)</text>
      </g>
    </g>
    
    {/* Investment 2: Long-term */}
    <g transform="translate(370, 130)">
      <rect x="0" y="0" width="280" height="250" fill="white" rx="12" stroke="#22c55e" strokeWidth="2"/>
      
      <rect x="0" y="0" width="280" height="40" fill="#22c55e" rx="12"/>
      <rect x="0" y="20" width="280" height="20" fill="#22c55e"/>
      <text x="140" y="27" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">Stock B: Long-Term</text>
      
      <g transform="translate(20, 55)">
        <text x="0" y="15" fontSize="10" fill="#4b5563">Bought:</text>
        <text x="120" y="15" fontSize="10" fontWeight="600" fill="#374151">January 1, 2023</text>
        
        <text x="0" y="35" fontSize="10" fill="#4b5563">Price paid:</text>
        <text x="120" y="35" fontSize="10" fontWeight="600" fill="#374151">$5,000</text>
        
        <text x="0" y="55" fontSize="10" fill="#4b5563">Sold:</text>
        <text x="120" y="55" fontSize="10" fontWeight="600" fill="#374151">April 15, 2024</text>
        
        <text x="0" y="75" fontSize="10" fill="#4b5563">Sale price:</text>
        <text x="120" y="75" fontSize="10" fontWeight="600" fill="#374151">$6,000</text>
        
        <line x1="0" y1="90" x2="240" y2="90" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="0" y="110" fontSize="10" fill="#4b5563">Profit:</text>
        <text x="120" y="110" fontSize="11" fontWeight="bold" fill="#059669">$1,000</text>
        
        <text x="0" y="130" fontSize="10" fill="#4b5563">Holding period:</text>
        <text x="120" y="130" fontSize="10" fontWeight="600" fill="#16a34a">~15 months</text>
        
        <rect x="0" y="150" width="240" height="40" fill="#f0fdf4" rx="6"/>
        <text x="120" y="168" textAnchor="middle" fontSize="9" fill="#166534">Long-term gain: May qualify</text>
        <text x="120" y="182" textAnchor="middle" fontSize="9" fill="#166534">for lower tax rate</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="390" width="500" height="25" fill="#dbeafe" rx="6"/>
    <text x="350" y="407" textAnchor="middle" fontSize="10" fill="#1e40af">Same $1,000 profit — but potentially different tax treatment based on holding period</text>
  </svg>
);

// SVG 7: The Threshold Concept
const ThresholdConceptSVG = () => (
  <svg viewBox="0 0 700 240" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="240" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e40af">The Threshold: Where Short Becomes Long</text>
    
    {/* Timeline visualization */}
    <g transform="translate(50, 70)">
      {/* Short-term zone */}
      <rect x="0" y="30" width="270" height="50" fill="#fecaca" rx="0"/>
      <text x="135" y="60" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">SHORT-TERM ZONE</text>
      
      {/* Threshold marker */}
      <g transform="translate(270, 0)">
        <rect x="-3" y="20" width="6" height="70" fill="#1e40af"/>
        <polygon points="-15,15 0,0 15,15" fill="#1e40af"/>
        <text x="0" y="105" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e40af">THRESHOLD</text>
        <text x="0" y="120" textAnchor="middle" fontSize="8" fill="#64748b">(Varies by country</text>
        <text x="0" y="132" textAnchor="middle" fontSize="8" fill="#64748b">and asset type)</text>
      </g>
      
      {/* Long-term zone */}
      <rect x="280" y="30" width="320" height="50" fill="#bbf7d0" rx="0"/>
      <text x="440" y="60" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16a34a">LONG-TERM ZONE</text>
      
      {/* Timeline bar */}
      <rect x="0" y="48" width="600" height="3" fill="#94a3b8"/>
      
      {/* Start marker */}
      <circle cx="0" cy="50" r="6" fill="#64748b"/>
      <text x="0" y="25" textAnchor="middle" fontSize="8" fill="#64748b">Buy</text>
      
      {/* End marker */}
      <circle cx="600" cy="50" r="6" fill="#64748b"/>
      <text x="600" y="25" textAnchor="middle" fontSize="8" fill="#64748b">Time →</text>
    </g>
    
    {/* Note */}
    <rect x="100" y="200" width="500" height="30" fill="#fef3c7" rx="6"/>
    <text x="350" y="220" textAnchor="middle" fontSize="9" fill="#92400e">The exact threshold varies (e.g., 1 year in many countries, but can differ by asset type)</text>
  </svg>
);

// SVG 8: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 160" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="160" fill="#dbeafe" rx="16" stroke="#3b82f6" strokeWidth="2"/>
    
    {/* Lightbulb icon */}
    <g transform="translate(40, 50)">
      <circle cx="30" cy="30" r="28" fill="#3b82f6"/>
      <circle cx="30" cy="25" r="15" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2"/>
      <rect x="24" y="42" width="12" height="8" fill="#fbbf24"/>
      <line x1="24" y1="52" x2="36" y2="52" stroke="#f59e0b" strokeWidth="2"/>
      <line x1="26" y1="55" x2="34" y2="55" stroke="#f59e0b" strokeWidth="2"/>
    </g>
    
    {/* Key takeaway text */}
    <g transform="translate(110, 30)">
      <text x="0" y="15" fontSize="14" fontWeight="bold" fill="#1e40af">Key Takeaway</text>
      <text x="0" y="42" fontSize="11" fill="#1e3a5f">How long you hold an investment can affect how it's taxed when you sell.</text>
      <text x="0" y="59" fontSize="11" fill="#1e3a5f">Short-term gains (quick sales) are often taxed at higher rates than</text>
      <text x="0" y="76" fontSize="11" fill="#1e3a5f">long-term gains (patient holding).</text>
      <text x="0" y="102" fontSize="11" fontWeight="600" fill="#1e40af">Being aware of holding periods can help you understand potential tax implications.</text>
    </g>
  </svg>
);

// SVG 9: India Note
const IndiaNotesSVG = () => (
  <svg viewBox="0 0 700 200" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="200" fill="#fff7ed" rx="16" stroke="#fb923c" strokeWidth="2"/>
    
    {/* India flag icon */}
    <g transform="translate(30, 25)">
      <rect x="0" y="0" width="60" height="15" fill="#FF9933"/>
      <rect x="0" y="15" width="60" height="15" fill="white"/>
      <rect x="0" y="30" width="60" height="15" fill="#138808"/>
      <circle cx="30" cy="22.5" r="6" fill="none" stroke="#000080" strokeWidth="1"/>
    </g>
    
    {/* Title */}
    <text x="110" y="45" fontSize="14" fontWeight="bold" fill="#c2410c">India-Specific Note</text>
    
    {/* Content */}
    <g transform="translate(30, 70)">
      <circle cx="8" cy="8" r="4" fill="#fb923c"/>
      <text x="22" y="12" fontSize="10" fill="#7c2d12"><tspan fontWeight="600">Listed Equity Shares:</tspan> 12-month threshold distinguishes short-term from long-term</text>
      
      <circle cx="8" cy="33" r="4" fill="#fb923c"/>
      <text x="22" y="37" fontSize="10" fill="#7c2d12"><tspan fontWeight="600">Debt Mutual Funds:</tspan> Different rules apply (subject to recent changes)</text>
      
      <circle cx="8" cy="58" r="4" fill="#fb923c"/>
      <text x="22" y="62" fontSize="10" fill="#7c2d12"><tspan fontWeight="600">Real Estate:</tspan> 24-month threshold for property (as of recent rules)</text>
      
      <circle cx="8" cy="83" r="4" fill="#fb923c"/>
      <text x="22" y="87" fontSize="10" fill="#7c2d12"><tspan fontWeight="600">STCG vs LTCG:</tspan> Short-Term Capital Gains vs Long-Term Capital Gains have different treatments</text>
      
      <circle cx="8" cy="108" r="4" fill="#fb923c"/>
      <text x="22" y="112" fontSize="10" fill="#7c2d12"><tspan fontWeight="600">Budget Changes:</tspan> Rules change with annual budgets — always verify current regulations</text>
    </g>
    
    {/* Note */}
    <text x="350" y="190" textAnchor="middle" fontSize="9" fill="#9a3412" fontStyle="italic">Indian tax rules are complex and change frequently. Consult a CA for specific guidance.</text>
  </svg>
);

// SVG 10: Disclaimer Banner
const DisclaimerBannerSVG = () => (
  <svg viewBox="0 0 700 80" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="80" fill="#fef3c7" rx="12" stroke="#fcd34d" strokeWidth="2"/>
    
    {/* Warning icon */}
    <g transform="translate(25, 25)">
      <circle cx="15" cy="15" r="15" fill="#f59e0b"/>
      <text x="15" y="21" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">!</text>
    </g>
    
    {/* Text */}
    <text x="70" y="32" fontSize="11" fontWeight="600" fill="#92400e">Educational Awareness Only</text>
    <text x="70" y="50" fontSize="9" fill="#78350f">This lesson explains general concepts about holding periods and taxes. Actual thresholds and rates depend</text>
    <text x="70" y="65" fontSize="9" fill="#78350f">on your country, asset type, and current tax laws. Always consult a qualified tax professional.</text>
  </svg>
);

const TaxLesson4 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const handleAnswerSelect = (questionId, answer) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const checkAnswer = (questionId) => {
    setShowResults(prev => ({ ...prev, [questionId]: true }));
  };

  const quizQuestions = [
    {
      id: 'q1',
      question: 'What is the main difference between short-term and long-term capital gains?',
      options: [
        { id: 'a', text: 'Short-term gains are smaller; long-term gains are larger' },
        { id: 'b', text: 'Short-term gains come from quick sales; long-term gains come from patient holding' },
        { id: 'c', text: 'Short-term gains are from stocks; long-term gains are from bonds' },
        { id: 'd', text: 'There is no difference — they are taxed the same way' }
      ],
      correctAnswer: 'b',
      explanation: 'The key difference is the holding period. Short-term gains result from selling an asset after a brief period, while long-term gains come from holding an asset beyond a threshold period before selling.'
    },
    {
      id: 'q2',
      question: 'Why do many countries offer favorable tax treatment for long-term gains?',
      options: [
        { id: 'a', text: 'Because long-term investors are always richer' },
        { id: 'b', text: 'To encourage patient investing and reduce market speculation' },
        { id: 'c', text: 'Because long-term gains are always larger' },
        { id: 'd', text: 'Long-term gains are not taxed at all' }
      ],
      correctAnswer: 'b',
      explanation: 'Favorable tax treatment for long-term gains is designed to encourage investors to think long-term, support economic stability, and reduce excessive short-term trading that can create market volatility.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() => navigate('/learn/taxes')}
            className="flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors"
          >
            <span>←</span>
            <span>Back to Tax Basics</span>
          </button>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              Lesson 4
            </span>
            <span className="bg-indigo-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              Awareness Only
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Long-Term vs Short-Term Taxes</h1>
          <p className="text-xl text-blue-100">
            Understanding how holding period affects how your gains are taxed
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Introduction */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Time Changes Everything</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              When you sell an investment for a profit, one of the most important factors in how 
              that profit gets taxed is something simple: <strong>how long did you hold it?</strong>
            </p>
            <p className="text-gray-600 leading-relaxed">
              In most countries, gains from investments you held for a short time are taxed 
              differently than gains from investments you held for a longer period. Understanding 
              this difference can help you be more aware of the tax implications of your 
              investment decisions.
            </p>
          </div>
        </section>

        {/* Time Changes Everything Visual */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">The Role of Time in Taxes</h2>
          <TimeChangesEverythingSVG />
        </section>

        {/* Short-Term Explained */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Short-Term: Quick Buying and Selling</h2>
          <ShortTermExplainedSVG />
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            <p className="text-gray-600 mb-4 leading-relaxed">
              A <strong>short-term capital gain</strong> typically occurs when you sell an asset 
              after holding it for less than a specific threshold period (often one year in many 
              countries, but this varies).
            </p>
            <p className="text-gray-600 leading-relaxed">
              Because you held the investment briefly, tax systems often treat this gain more 
              like regular income you earned — and it may be taxed accordingly. The logic is 
              that quick buying and selling looks more like active income generation than 
              long-term wealth building.
            </p>
          </div>
        </section>

        {/* Long-Term Explained */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Long-Term: Patient Holding</h2>
          <LongTermExplainedSVG />
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            <p className="text-gray-600 mb-4 leading-relaxed">
              A <strong>long-term capital gain</strong> typically occurs when you sell an asset 
              after holding it beyond the threshold period. You demonstrated patience, held 
              through market ups and downs, and now you're realizing your gain.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Many tax systems reward this patience with more favorable tax treatment. The 
              thinking is that long-term investors provide stable capital to the economy and 
              shouldn't be penalized for thoughtful, patient investing.
            </p>
          </div>
        </section>

        {/* Why Time Matters */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Does Holding Period Matter?</h2>
          <WhyTimeMattesSVG />
        </section>

        {/* Comparison */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Selling vs Patient Holding</h2>
          <ComparisonSVG />
        </section>

        {/* Threshold Concept */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">The Threshold Line</h2>
          <ThresholdConceptSVG />
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            <p className="text-gray-600 leading-relaxed">
              Every country sets its own threshold for what counts as "long-term." In many places, 
              it's one year, but it can vary by asset type (stocks, property, etc.) and can change 
              with new tax laws. The key concept is that there's a dividing line: hold shorter than 
              the threshold, and your gain is short-term; hold longer, and it becomes long-term.
            </p>
          </div>
        </section>

        {/* Global Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Example: Same Profit, Different Treatment</h2>
          <GlobalExampleSVG />
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            <p className="text-gray-600 leading-relaxed">
              Emma made the same $1,000 profit on both stocks. But because she held Stock A for 
              only 3.5 months (short-term) and Stock B for 15 months (long-term), the tax treatment 
              could be quite different. The profit amount is identical, but the time factor changes 
              everything from a tax perspective.
            </p>
          </div>
        </section>

        {/* Key Takeaway */}
        <section className="mb-12">
          <KeyTakeawaySVG />
        </section>

        {/* India Note */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">India-Specific Context</h2>
          <IndiaNotesSVG />
        </section>

        {/* Quiz Section */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Check Your Understanding</h2>
            
            {quizQuestions.map((q, index) => (
              <div key={q.id} className={`${index > 0 ? 'mt-8 pt-8 border-t border-gray-200' : ''}`}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Question {index + 1}: {q.question}
                </h3>
                <div className="space-y-3">
                  {q.options.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        quizAnswers[q.id] === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      } ${
                        showResults[q.id]
                          ? option.id === q.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : quizAnswers[q.id] === option.id
                            ? 'border-red-500 bg-red-50'
                            : ''
                          : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={option.id}
                        checked={quizAnswers[q.id] === option.id}
                        onChange={() => handleAnswerSelect(q.id, option.id)}
                        disabled={showResults[q.id]}
                        className="mr-3"
                      />
                      <span className="text-gray-700">{option.text}</span>
                    </label>
                  ))}
                </div>
                
                {!showResults[q.id] && quizAnswers[q.id] && (
                  <button
                    onClick={() => checkAnswer(q.id)}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Check Answer
                  </button>
                )}
                
                {showResults[q.id] && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    quizAnswers[q.id] === q.correctAnswer
                      ? 'bg-green-100 border border-green-300'
                      : 'bg-red-100 border border-red-300'
                  }`}>
                    <p className={`font-semibold ${
                      quizAnswers[q.id] === q.correctAnswer ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {quizAnswers[q.id] === q.correctAnswer ? '✓ Correct!' : '✗ Not quite right'}
                    </p>
                    <p className="text-gray-700 mt-2">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Reflection */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">💭 Reflection Question</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Think about your own approach to investing (or how you might approach it in the future). 
              Are you naturally inclined toward quick decisions or patient waiting? How might 
              understanding that holding period affects taxes influence your thinking about when to 
              sell an investment — not as a strategy, but simply as something to be aware of?
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mb-12">
          <DisclaimerBannerSVG />
        </section>

        {/* Navigation */}
        <section className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/tax-lesson-3')}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
          >
            <span>←</span>
            <span>Previous: Capital Gains – Simple Idea</span>
          </button>
          <button
            onClick={() => navigate('/learn/taxes')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <span>Back to Module</span>
            <span>→</span>
          </button>
        </section>
      </div>
    </div>
  );
};

export default TaxLesson4;
