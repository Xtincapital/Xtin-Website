import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

// ============================================
// TAX LESSON 4: LONG-TERM VS SHORT-TERM TAXES
// ============================================

// SVG 1: Time Changes Everything
const TimeChangesEverythingSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F1F4F9" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#2C3F5E">Time Changes How Your Gains Are Taxed</text>
    
    {/* Clock visualization */}
    <g transform="translate(350, 150)">
      {/* Outer ring */}
      <circle cx="0" cy="0" r="90" fill="white" stroke="#5A77AA" strokeWidth="4"/>
      
      {/* Clock face marks */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
        <line
          key={i}
          x1={75 * Math.cos((angle - 90) * Math.PI / 180)}
          y1={75 * Math.sin((angle - 90) * Math.PI / 180)}
          x2={85 * Math.cos((angle - 90) * Math.PI / 180)}
          y2={85 * Math.sin((angle - 90) * Math.PI / 180)}
          stroke="#5A77AA"
          strokeWidth="3"
        />
      ))}
      
      {/* Short-term zone (red) */}
      <path d="M0,0 L0,-70 A70,70 0 0,1 60.6,-35 Z" fill="#F6C3C3" stroke="#E04848" strokeWidth="2"/>
      
      {/* Long-term zone (green) */}
      <path d="M0,0 L60.6,-35 A70,70 0 1,1 -0.1,-70 Z" fill="#BBF7D0" stroke="#16A34A" strokeWidth="2"/>
      
      {/* Center */}
      <circle cx="0" cy="0" r="10" fill="#2C3F5E"/>
      
      {/* Clock hands */}
      <line x1="0" y1="0" x2="0" y2="-55" stroke="#2C3F5E" strokeWidth="4" strokeLinecap="round"/>
      <line x1="0" y1="0" x2="35" y2="0" stroke="#2C3F5E" strokeWidth="3" strokeLinecap="round"/>
    </g>
    
    {/* Labels */}
    <g transform="translate(80, 100)">
      <rect x="0" y="0" width="120" height="60" fill="#F6C3C3" rx="8" stroke="#E04848" strokeWidth="2"/>
      <text x="60" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">SHORT-TERM</text>
      <text x="60" y="45" textAnchor="middle" fontSize="9" fill="#842428">Quick sales</text>
    </g>
    
    <g transform="translate(500, 100)">
      <rect x="0" y="0" width="120" height="60" fill="#BBF7D0" rx="8" stroke="#16A34A" strokeWidth="2"/>
      <text x="60" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">LONG-TERM</text>
      <text x="60" y="45" textAnchor="middle" fontSize="9" fill="#16A34A">Patient holding</text>
    </g>
    
    {/* Bottom message */}
    <rect x="150" y="240" width="400" height="30" fill="#E0E7F1" rx="8"/>
    <text x="350" y="260" textAnchor="middle" fontSize="11" fill="#2C3F5E">The same profit can be taxed differently based on how long you held it</text>
  </svg>
);

// SVG 2: Short-Term Explained
const ShortTermExplainedSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#FDF1F1" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#C7363B">Short-Term: Quick Buy and Sell</text>
    
    {/* Timeline */}
    <g transform="translate(50, 70)">
      {/* Timeline bar */}
      <rect x="0" y="50" width="600" height="8" fill="#F6C3C3" rx="4"/>
      
      {/* Buy point */}
      <g transform="translate(0, 0)">
        <circle cx="0" cy="54" r="15" fill="#E04848" stroke="#C7363B" strokeWidth="2"/>
        <text x="0" y="58" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">BUY</text>
        <text x="0" y="85" textAnchor="middle" fontSize="9" fill="#842428">January 1</text>
      </g>
      
      {/* Time period indicator */}
      <g transform="translate(200, 20)">
        <rect x="0" y="0" width="200" height="25" fill="white" rx="6" stroke="#E04848" strokeWidth="1"/>
        <text x="100" y="17" textAnchor="middle" fontSize="10" fill="#C7363B">Less than the threshold period</text>
      </g>
      
      {/* Sell point */}
      <g transform="translate(400, 0)">
        <circle cx="0" cy="54" r="15" fill="#E04848" stroke="#C7363B" strokeWidth="2"/>
        <text x="0" y="58" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">SELL</text>
        <text x="0" y="85" textAnchor="middle" fontSize="9" fill="#842428">June 15</text>
        <text x="0" y="100" textAnchor="middle" fontSize="8" fill="#6B2023">(~5.5 months later)</text>
      </g>
      
      {/* Arrow showing short period */}
      <line x1="20" y1="35" x2="380" y2="35" stroke="#E04848" strokeWidth="2" strokeDasharray="5,3"/>
      <polygon points="375,30 390,35 375,40" fill="#E04848"/>
    </g>
    
    {/* Characteristics */}
    <g transform="translate(50, 180)">
      <text x="0" y="0" fontSize="12" fontWeight="600" fill="#C7363B">Short-Term Characteristics:</text>
      
      <g transform="translate(0, 20)">
        <rect x="0" y="0" width="180" height="75" fill="white" rx="8" stroke="#F09B9B" strokeWidth="1"/>
        <text x="90" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">⏱️ Quick Turnaround</text>
        <text x="90" y="42" textAnchor="middle" fontSize="9" fill="#6B2023">Held for a shorter</text>
        <text x="90" y="56" textAnchor="middle" fontSize="9" fill="#6B2023">time period</text>
      </g>
      
      <g transform="translate(200, 20)">
        <rect x="0" y="0" width="180" height="75" fill="white" rx="8" stroke="#F09B9B" strokeWidth="1"/>
        <text x="90" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">💰 Often Taxed More</text>
        <text x="90" y="42" textAnchor="middle" fontSize="9" fill="#6B2023">Usually treated like</text>
        <text x="90" y="56" textAnchor="middle" fontSize="9" fill="#6B2023">regular income</text>
      </g>
      
      <g transform="translate(400, 20)">
        <rect x="0" y="0" width="180" height="75" fill="white" rx="8" stroke="#F09B9B" strokeWidth="1"/>
        <text x="90" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">🔄 Active Approach</text>
        <text x="90" y="42" textAnchor="middle" fontSize="9" fill="#6B2023">Frequent buying</text>
        <text x="90" y="56" textAnchor="middle" fontSize="9" fill="#6B2023">and selling</text>
      </g>
    </g>
  </svg>
);

// SVG 3: Long-Term Explained
const LongTermExplainedSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F0FDF4" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#16A34A">Long-Term: Patient Holding</text>
    
    {/* Timeline */}
    <g transform="translate(50, 70)">
      {/* Timeline bar */}
      <rect x="0" y="50" width="600" height="8" fill="#BBF7D0" rx="4"/>
      
      {/* Buy point */}
      <g transform="translate(0, 0)">
        <circle cx="0" cy="54" r="15" fill="#16A34A" stroke="#16A34A" strokeWidth="2"/>
        <text x="0" y="58" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">BUY</text>
        <text x="0" y="85" textAnchor="middle" fontSize="9" fill="#16A34A">January 1, 2023</text>
      </g>
      
      {/* Time period indicator */}
      <g transform="translate(150, 20)">
        <rect x="0" y="0" width="300" height="25" fill="white" rx="6" stroke="#16A34A" strokeWidth="1"/>
        <text x="150" y="17" textAnchor="middle" fontSize="10" fill="#16A34A">Exceeds the threshold period (patient waiting)</text>
      </g>
      
      {/* Sell point */}
      <g transform="translate(600, 0)">
        <circle cx="0" cy="54" r="15" fill="#16A34A" stroke="#16A34A" strokeWidth="2"/>
        <text x="0" y="58" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">SELL</text>
        <text x="0" y="85" textAnchor="middle" fontSize="9" fill="#16A34A">March 15, 2024</text>
        <text x="0" y="100" textAnchor="middle" fontSize="8" fill="#16A34A">(14+ months later)</text>
      </g>
      
      {/* Arrow showing long period */}
      <line x1="20" y1="35" x2="580" y2="35" stroke="#16A34A" strokeWidth="2" strokeDasharray="5,3"/>
      <polygon points="575,30 590,35 575,40" fill="#16A34A"/>
    </g>
    
    {/* Characteristics */}
    <g transform="translate(50, 180)">
      <text x="0" y="0" fontSize="12" fontWeight="600" fill="#16A34A">Long-Term Characteristics:</text>
      
      <g transform="translate(0, 20)">
        <rect x="0" y="0" width="180" height="75" fill="white" rx="8" stroke="#16A34A" strokeWidth="1"/>
        <text x="90" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16A34A">⏳ Patient Holding</text>
        <text x="90" y="42" textAnchor="middle" fontSize="9" fill="#16A34A">Held for longer than</text>
        <text x="90" y="56" textAnchor="middle" fontSize="9" fill="#16A34A">the threshold period</text>
      </g>
      
      <g transform="translate(200, 20)">
        <rect x="0" y="0" width="180" height="75" fill="white" rx="8" stroke="#16A34A" strokeWidth="1"/>
        <text x="90" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16A34A">💚 Often Taxed Less</text>
        <text x="90" y="42" textAnchor="middle" fontSize="9" fill="#16A34A">Usually gets favorable</text>
        <text x="90" y="56" textAnchor="middle" fontSize="9" fill="#16A34A">tax treatment</text>
      </g>
      
      <g transform="translate(400, 20)">
        <rect x="0" y="0" width="180" height="75" fill="white" rx="8" stroke="#16A34A" strokeWidth="1"/>
        <text x="90" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16A34A">🌱 Buy & Hold</text>
        <text x="90" y="42" textAnchor="middle" fontSize="9" fill="#16A34A">Less frequent</text>
        <text x="90" y="56" textAnchor="middle" fontSize="9" fill="#16A34A">transactions</text>
      </g>
    </g>
  </svg>
);

// SVG 4: Why Time Matters
const WhyTimeMattesSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#F6F2FB" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#7A5BA6">Why Does Holding Period Matter?</text>
    
    {/* Reason 1 */}
    <g transform="translate(50, 55)">
      <rect x="0" y="0" width="280" height="120" fill="white" rx="12" stroke="#8F6FC4" strokeWidth="2"/>
      <circle cx="35" cy="35" r="22" fill="#8F6FC4"/>
      <text x="35" y="42" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">1</text>
      
      <text x="70" y="32" fontSize="12" fontWeight="600" fill="#7A5BA6">Encourages Long-Term Thinking</text>
      <text x="20" y="55" fontSize="10" fill="#555A63">Governments want investors to</text>
      <text x="20" y="70" fontSize="10" fill="#555A63">think long-term. Favorable tax</text>
      <text x="20" y="85" fontSize="10" fill="#555A63">treatment for patient holding</text>
      <text x="20" y="100" fontSize="10" fill="#555A63">encourages this behavior.</text>
    </g>
    
    {/* Reason 2 */}
    <g transform="translate(370, 55)">
      <rect x="0" y="0" width="280" height="120" fill="white" rx="12" stroke="#8F6FC4" strokeWidth="2"/>
      <circle cx="35" cy="35" r="22" fill="#8F6FC4"/>
      <text x="35" y="42" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">2</text>
      
      <text x="70" y="32" fontSize="12" fontWeight="600" fill="#7A5BA6">Reduces Market Speculation</text>
      <text x="20" y="55" fontSize="10" fill="#555A63">Quick buying and selling can</text>
      <text x="20" y="70" fontSize="10" fill="#555A63">create market instability. Higher</text>
      <text x="20" y="85" fontSize="10" fill="#555A63">taxes on short-term gains may</text>
      <text x="20" y="100" fontSize="10" fill="#555A63">discourage excessive trading.</text>
    </g>
    
    {/* Reason 3 */}
    <g transform="translate(50, 190)">
      <rect x="0" y="0" width="280" height="120" fill="white" rx="12" stroke="#8F6FC4" strokeWidth="2"/>
      <circle cx="35" cy="35" r="22" fill="#8F6FC4"/>
      <text x="35" y="42" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">3</text>
      
      <text x="70" y="32" fontSize="12" fontWeight="600" fill="#7A5BA6">Rewards Patient Investors</text>
      <text x="20" y="55" fontSize="10" fill="#555A63">Those who hold through market</text>
      <text x="20" y="70" fontSize="10" fill="#555A63">ups and downs are often given</text>
      <text x="20" y="85" fontSize="10" fill="#555A63">a tax benefit as a reward for</text>
      <text x="20" y="100" fontSize="10" fill="#555A63">their patience and commitment.</text>
    </g>
    
    {/* Reason 4 */}
    <g transform="translate(370, 190)">
      <rect x="0" y="0" width="280" height="120" fill="white" rx="12" stroke="#8F6FC4" strokeWidth="2"/>
      <circle cx="35" cy="35" r="22" fill="#8F6FC4"/>
      <text x="35" y="42" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">4</text>
      
      <text x="70" y="32" fontSize="12" fontWeight="600" fill="#7A5BA6">Supports Economic Stability</text>
      <text x="20" y="55" fontSize="10" fill="#555A63">Long-term investing supports</text>
      <text x="20" y="70" fontSize="10" fill="#555A63">businesses with stable capital.</text>
      <text x="20" y="85" fontSize="10" fill="#555A63">Tax policy often reflects this</text>
      <text x="20" y="100" fontSize="10" fill="#555A63">preference for stability.</text>
    </g>
  </svg>
);

// SVG 5: Side-by-Side Comparison
const ComparisonSVG = () => (
  <svg viewBox="0 0 700 350" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="350" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#2C3F5E">Quick Selling vs Patient Holding</text>
    
    {/* Short-term side */}
    <g transform="translate(50, 55)">
      <rect x="0" y="0" width="280" height="270" fill="white" rx="12" stroke="#E04848" strokeWidth="2"/>
      
      {/* Header */}
      <rect x="0" y="0" width="280" height="45" fill="#E04848" rx="12"/>
      <rect x="0" y="25" width="280" height="20" fill="#E04848"/>
      <text x="140" y="30" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">⚡ SHORT-TERM</text>
      
      {/* Content */}
      <g transform="translate(20, 60)">
        <g transform="translate(0, 0)">
          <circle cx="8" cy="8" r="5" fill="#F6C3C3"/>
          <text x="22" y="12" fontSize="10" fill="#373A41"><tspan fontWeight="600">Holding:</tspan> Brief period</text>
        </g>
        
        <g transform="translate(0, 30)">
          <circle cx="8" cy="8" r="5" fill="#F6C3C3"/>
          <text x="22" y="12" fontSize="10" fill="#373A41"><tspan fontWeight="600">Approach:</tspan> Active trading</text>
        </g>
        
        <g transform="translate(0, 60)">
          <circle cx="8" cy="8" r="5" fill="#F6C3C3"/>
          <text x="22" y="12" fontSize="10" fill="#373A41"><tspan fontWeight="600">Tax treatment:</tspan> Usually higher</text>
        </g>
        
        <g transform="translate(0, 90)">
          <circle cx="8" cy="8" r="5" fill="#F6C3C3"/>
          <text x="22" y="12" fontSize="10" fill="#373A41"><tspan fontWeight="600">Often taxed as:</tspan> Regular income</text>
        </g>
        
        <g transform="translate(0, 120)">
          <circle cx="8" cy="8" r="5" fill="#F6C3C3"/>
          <text x="22" y="12" fontSize="10" fill="#373A41"><tspan fontWeight="600">Philosophy:</tspan> Quick profits</text>
        </g>
        
        <rect x="0" y="155" width="240" height="50" fill="#FDF1F1" rx="6"/>
        <text x="120" y="175" textAnchor="middle" fontSize="9" fill="#842428">Example: Buy stock in January,</text>
        <text x="120" y="190" textAnchor="middle" fontSize="9" fill="#842428">sell in March (3 months)</text>
      </g>
    </g>
    
    {/* VS */}
    <g transform="translate(335, 170)">
      <circle cx="15" cy="15" r="22" fill="#2C3F5E"/>
      <text x="15" y="21" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">VS</text>
    </g>
    
    {/* Long-term side */}
    <g transform="translate(370, 55)">
      <rect x="0" y="0" width="280" height="270" fill="white" rx="12" stroke="#16A34A" strokeWidth="2"/>
      
      {/* Header */}
      <rect x="0" y="0" width="280" height="45" fill="#16A34A" rx="12"/>
      <rect x="0" y="25" width="280" height="20" fill="#16A34A"/>
      <text x="140" y="30" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">🌱 LONG-TERM</text>
      
      {/* Content */}
      <g transform="translate(20, 60)">
        <g transform="translate(0, 0)">
          <circle cx="8" cy="8" r="5" fill="#BBF7D0"/>
          <text x="22" y="12" fontSize="10" fill="#373A41"><tspan fontWeight="600">Holding:</tspan> Extended period</text>
        </g>
        
        <g transform="translate(0, 30)">
          <circle cx="8" cy="8" r="5" fill="#BBF7D0"/>
          <text x="22" y="12" fontSize="10" fill="#373A41"><tspan fontWeight="600">Approach:</tspan> Buy and hold</text>
        </g>
        
        <g transform="translate(0, 60)">
          <circle cx="8" cy="8" r="5" fill="#BBF7D0"/>
          <text x="22" y="12" fontSize="10" fill="#373A41"><tspan fontWeight="600">Tax treatment:</tspan> Usually lower</text>
        </g>
        
        <g transform="translate(0, 90)">
          <circle cx="8" cy="8" r="5" fill="#BBF7D0"/>
          <text x="22" y="12" fontSize="10" fill="#373A41"><tspan fontWeight="600">Often taxed as:</tspan> Capital gains</text>
        </g>
        
        <g transform="translate(0, 120)">
          <circle cx="8" cy="8" r="5" fill="#BBF7D0"/>
          <text x="22" y="12" fontSize="10" fill="#373A41"><tspan fontWeight="600">Philosophy:</tspan> Wealth building</text>
        </g>
        
        <rect x="0" y="155" width="240" height="50" fill="#F0FDF4" rx="6"/>
        <text x="120" y="175" textAnchor="middle" fontSize="9" fill="#16A34A">Example: Buy stock in January 2023,</text>
        <text x="120" y="190" textAnchor="middle" fontSize="9" fill="#16A34A">sell in March 2024 (14+ months)</text>
      </g>
    </g>
  </svg>
);

// SVG 6: Global Example - Emma's Two Investments
const GlobalExampleSVG = () => (
  <svg viewBox="0 0 700 420" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="420" fill="#F1F4F9" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#2C3F5E">Example: Emma's Two Stock Sales</text>
    
    {/* Emma character */}
    <g transform="translate(50, 50)">
      <circle cx="35" cy="22" r="20" fill="#5A77AA"/>
      <circle cx="28" cy="18" r="3" fill="white"/>
      <circle cx="42" cy="18" r="3" fill="white"/>
      <path d="M28 28 Q35 34 42 28" stroke="white" strokeWidth="2" fill="none"/>
      <rect x="20" y="45" width="30" height="35" fill="#5A77AA" rx="4"/>
      <text x="85" y="35" fontSize="13" fontWeight="600" fill="#2C3F5E">Emma</text>
      <text x="85" y="52" fontSize="10" fill="#555A63">Made $1,000 profit on each stock</text>
      <text x="85" y="67" fontSize="10" fill="#555A63">But held them for different times</text>
    </g>
    
    {/* Investment 1: Short-term */}
    <g transform="translate(50, 130)">
      <rect x="0" y="0" width="280" height="250" fill="white" rx="12" stroke="#E04848" strokeWidth="2"/>
      
      <rect x="0" y="0" width="280" height="40" fill="#E04848" rx="12"/>
      <rect x="0" y="20" width="280" height="20" fill="#E04848"/>
      <text x="140" y="27" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">Stock A: Short-Term</text>
      
      <g transform="translate(20, 55)">
        <text x="0" y="15" fontSize="10" fill="#555A63">Bought:</text>
        <text x="120" y="15" fontSize="10" fontWeight="600" fill="#373A41">January 1, 2024</text>
        
        <text x="0" y="35" fontSize="10" fill="#555A63">Price paid:</text>
        <text x="120" y="35" fontSize="10" fontWeight="600" fill="#373A41">$5,000</text>
        
        <text x="0" y="55" fontSize="10" fill="#555A63">Sold:</text>
        <text x="120" y="55" fontSize="10" fontWeight="600" fill="#373A41">April 15, 2024</text>
        
        <text x="0" y="75" fontSize="10" fill="#555A63">Sale price:</text>
        <text x="120" y="75" fontSize="10" fontWeight="600" fill="#373A41">$6,000</text>
        
        <line x1="0" y1="90" x2="240" y2="90" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="0" y="110" fontSize="10" fill="#555A63">Profit:</text>
        <text x="120" y="110" fontSize="11" fontWeight="bold" fill="#16A34A">$1,000</text>
        
        <text x="0" y="130" fontSize="10" fill="#555A63">Holding period:</text>
        <text x="120" y="130" fontSize="10" fontWeight="600" fill="#C7363B">~3.5 months</text>
        
        <rect x="0" y="150" width="240" height="40" fill="#FDF1F1" rx="6"/>
        <text x="120" y="168" textAnchor="middle" fontSize="9" fill="#842428">Short-term gain: May be taxed</text>
        <text x="120" y="182" textAnchor="middle" fontSize="9" fill="#842428">at higher rate (like income)</text>
      </g>
    </g>
    
    {/* Investment 2: Long-term */}
    <g transform="translate(370, 130)">
      <rect x="0" y="0" width="280" height="250" fill="white" rx="12" stroke="#16A34A" strokeWidth="2"/>
      
      <rect x="0" y="0" width="280" height="40" fill="#16A34A" rx="12"/>
      <rect x="0" y="20" width="280" height="20" fill="#16A34A"/>
      <text x="140" y="27" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">Stock B: Long-Term</text>
      
      <g transform="translate(20, 55)">
        <text x="0" y="15" fontSize="10" fill="#555A63">Bought:</text>
        <text x="120" y="15" fontSize="10" fontWeight="600" fill="#373A41">January 1, 2023</text>
        
        <text x="0" y="35" fontSize="10" fill="#555A63">Price paid:</text>
        <text x="120" y="35" fontSize="10" fontWeight="600" fill="#373A41">$5,000</text>
        
        <text x="0" y="55" fontSize="10" fill="#555A63">Sold:</text>
        <text x="120" y="55" fontSize="10" fontWeight="600" fill="#373A41">April 15, 2024</text>
        
        <text x="0" y="75" fontSize="10" fill="#555A63">Sale price:</text>
        <text x="120" y="75" fontSize="10" fontWeight="600" fill="#373A41">$6,000</text>
        
        <line x1="0" y1="90" x2="240" y2="90" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="0" y="110" fontSize="10" fill="#555A63">Profit:</text>
        <text x="120" y="110" fontSize="11" fontWeight="bold" fill="#16A34A">$1,000</text>
        
        <text x="0" y="130" fontSize="10" fill="#555A63">Holding period:</text>
        <text x="120" y="130" fontSize="10" fontWeight="600" fill="#16A34A">~15 months</text>
        
        <rect x="0" y="150" width="240" height="40" fill="#F0FDF4" rx="6"/>
        <text x="120" y="168" textAnchor="middle" fontSize="9" fill="#16A34A">Long-term gain: May qualify</text>
        <text x="120" y="182" textAnchor="middle" fontSize="9" fill="#16A34A">for lower tax rate</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="390" width="500" height="25" fill="#E0E7F1" rx="6"/>
    <text x="350" y="407" textAnchor="middle" fontSize="10" fill="#2C3F5E">Same $1,000 profit — but potentially different tax treatment based on holding period</text>
  </svg>
);

// SVG 7: The Threshold Concept
const ThresholdConceptSVG = () => (
  <svg viewBox="0 0 700 240" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="240" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#2C3F5E">The Threshold: Where Short Becomes Long</text>
    
    {/* Timeline visualization */}
    <g transform="translate(50, 70)">
      {/* Short-term zone */}
      <rect x="0" y="30" width="270" height="50" fill="#F6C3C3" rx="0"/>
      <text x="135" y="60" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">SHORT-TERM ZONE</text>
      
      {/* Threshold marker */}
      <g transform="translate(270, 0)">
        <rect x="-3" y="20" width="6" height="70" fill="#2C3F5E"/>
        <polygon points="-15,15 0,0 15,15" fill="#2C3F5E"/>
        <text x="0" y="105" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2C3F5E">THRESHOLD</text>
        <text x="0" y="120" textAnchor="middle" fontSize="8" fill="#717680">(Varies by country</text>
        <text x="0" y="132" textAnchor="middle" fontSize="8" fill="#717680">and asset type)</text>
      </g>
      
      {/* Long-term zone */}
      <rect x="280" y="30" width="320" height="50" fill="#BBF7D0" rx="0"/>
      <text x="440" y="60" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">LONG-TERM ZONE</text>
      
      {/* Timeline bar */}
      <rect x="0" y="48" width="600" height="3" fill="#A0A3AA"/>
      
      {/* Start marker */}
      <circle cx="0" cy="50" r="6" fill="#717680"/>
      <text x="0" y="25" textAnchor="middle" fontSize="8" fill="#717680">Buy</text>
      
      {/* End marker */}
      <circle cx="600" cy="50" r="6" fill="#717680"/>
      <text x="600" y="25" textAnchor="middle" fontSize="8" fill="#717680">Time →</text>
    </g>
    
    {/* Note */}
    <rect x="100" y="200" width="500" height="30" fill="#F6ECCE" rx="6"/>
    <text x="350" y="220" textAnchor="middle" fontSize="9" fill="#654B26">The exact threshold varies (e.g., 1 year in many countries, but can differ by asset type)</text>
  </svg>
);

// SVG 8: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 160" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="160" fill="#E0E7F1" rx="16" stroke="#5A77AA" strokeWidth="2"/>
    
    {/* Lightbulb icon */}
    <g transform="translate(40, 50)">
      <circle cx="30" cy="30" r="28" fill="#5A77AA"/>
      <circle cx="30" cy="25" r="15" fill="#CDAA5F" stroke="#B8923F" strokeWidth="2"/>
      <rect x="24" y="42" width="12" height="8" fill="#CDAA5F"/>
      <line x1="24" y1="52" x2="36" y2="52" stroke="#B8923F" strokeWidth="2"/>
      <line x1="26" y1="55" x2="34" y2="55" stroke="#B8923F" strokeWidth="2"/>
    </g>
    
    {/* Key takeaway text */}
    <g transform="translate(110, 30)">
      <text x="0" y="15" fontSize="14" fontWeight="bold" fill="#2C3F5E">Key Takeaway</text>
      <text x="0" y="42" fontSize="11" fill="#2A2A2C">How long you hold an investment can affect how it's taxed when you sell.</text>
      <text x="0" y="59" fontSize="11" fill="#2A2A2C">Short-term gains (quick sales) are often taxed at higher rates than</text>
      <text x="0" y="76" fontSize="11" fill="#2A2A2C">long-term gains (patient holding).</text>
      <text x="0" y="102" fontSize="11" fontWeight="600" fill="#2C3F5E">Being aware of holding periods can help you understand potential tax implications.</text>
    </g>
  </svg>
);

// SVG 9: India Note
const IndiaNotesSVG = () => (
  <svg viewBox="0 0 700 200" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="200" fill="#FCF3EE" rx="16" stroke="#E3906B" strokeWidth="2"/>
    
    {/* India flag icon */}
    <g transform="translate(30, 25)">
      <rect x="0" y="0" width="60" height="15" fill="#FF9933"/>
      <rect x="0" y="15" width="60" height="15" fill="white"/>
      <rect x="0" y="30" width="60" height="15" fill="#138808"/>
      <circle cx="30" cy="22.5" r="6" fill="none" stroke="#000080" strokeWidth="1"/>
    </g>
    
    {/* Title */}
    <text x="110" y="45" fontSize="14" fontWeight="bold" fill="#9C4D2E">India-Specific Note</text>
    
    {/* Content */}
    <g transform="translate(30, 70)">
      <circle cx="8" cy="8" r="4" fill="#E3906B"/>
      <text x="22" y="12" fontSize="10" fill="#663524"><tspan fontWeight="600">Listed Equity Shares:</tspan> 12-month threshold distinguishes short-term from long-term</text>
      
      <circle cx="8" cy="33" r="4" fill="#E3906B"/>
      <text x="22" y="37" fontSize="10" fill="#663524"><tspan fontWeight="600">Debt Mutual Funds:</tspan> Different rules apply (subject to recent changes)</text>
      
      <circle cx="8" cy="58" r="4" fill="#E3906B"/>
      <text x="22" y="62" fontSize="10" fill="#663524"><tspan fontWeight="600">Real Estate:</tspan> 24-month threshold for property (as of recent rules)</text>
      
      <circle cx="8" cy="83" r="4" fill="#E3906B"/>
      <text x="22" y="87" fontSize="10" fill="#663524"><tspan fontWeight="600">STCG vs LTCG:</tspan> Short-Term Capital Gains vs Long-Term Capital Gains have different treatments</text>
      
      <circle cx="8" cy="108" r="4" fill="#E3906B"/>
      <text x="22" y="112" fontSize="10" fill="#663524"><tspan fontWeight="600">Budget Changes:</tspan> Rules change with annual budgets — always verify current regulations</text>
    </g>
    
    {/* Note */}
    <text x="350" y="190" textAnchor="middle" fontSize="9" fill="#7D3F28" fontStyle="italic">Indian tax rules are complex and change frequently. Consult a CA for specific guidance.</text>
  </svg>
);

// SVG 10: Disclaimer Banner
const DisclaimerBannerSVG = () => (
  <svg viewBox="0 0 700 80" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="80" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
    
    {/* Warning icon */}
    <g transform="translate(25, 25)">
      <circle cx="15" cy="15" r="15" fill="#B8923F"/>
      <text x="15" y="21" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">!</text>
    </g>
    
    {/* Text */}
    <text x="70" y="32" fontSize="11" fontWeight="600" fill="#654B26">Educational Awareness Only</text>
    <text x="70" y="50" fontSize="9" fill="#533E22">This lesson explains general concepts about holding periods and taxes. Actual thresholds and rates depend</text>
    <text x="70" y="65" fontSize="9" fill="#533E22">on your country, asset type, and current tax laws. Always consult a qualified tax professional.</text>
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
    <>
      <Navbar />
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 pt-16">
      {/* Header */}
      <div className="text-white py-12 bg-brand-fill">
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
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-[-0.025em]">Long-Term vs Short-Term Taxes</h1>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4 tracking-[-0.025em]">Time Changes Everything</h2>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.025em]">The Role of Time in Taxes</h2>
          <TimeChangesEverythingSVG />
        </section>

        {/* Short-Term Explained */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.025em]">Short-Term: Quick Buying and Selling</h2>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.025em]">Long-Term: Patient Holding</h2>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Why Does Holding Period Matter?</h2>
          <WhyTimeMattesSVG />
        </section>

        {/* Comparison */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Quick Selling vs Patient Holding</h2>
          <ComparisonSVG />
        </section>

        {/* Threshold Concept */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">The Threshold Line</h2>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Example: Same Profit, Different Treatment</h2>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">India-Specific Context</h2>
          <IndiaNotesSVG />
        </section>

        {/* Quiz Section */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Check Your Understanding</h2>
            
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
                            ? 'border-brand bg-brand-soft'
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
                    className="mt-4 px-6 py-2 bg-brand-fill text-white rounded-lg hover:bg-brand-hover transition-colors"
                  >
                    Check Answer
                  </button>
                )}
                
                {showResults[q.id] && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    quizAnswers[q.id] === q.correctAnswer
                      ? 'bg-brand-soft border border-brand-line'
                      : 'bg-red-100 border border-red-300'
                  }`}>
                    <p className={`font-semibold ${
                      quizAnswers[q.id] === q.correctAnswer ? 'text-brand' : 'text-red-800'
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4 tracking-[-0.015em]">💭 Reflection Question</h2>
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
            onClick={() => navigate('/learn/tax-lesson-5')}
            className="flex items-center gap-2 px-6 py-3 bg-brand-fill text-white rounded-xl hover:bg-brand-hover transition-colors"
          >
            <span>Next: Long-Term vs Short-Term Taxes</span>
            <span>→</span>
          </button>
        </section>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default TaxLesson4;
