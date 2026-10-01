import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaSeedling, FaCheckCircle, FaTimesCircle, FaLightbulb, FaClock, FaChartLine } from 'react-icons/fa';
import ModuleBadge from "../../components/ModuleBadge";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

// SVG 1: Time Horizon Comparison - Trading vs Long-Term
const TimeHorizonSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Time Horizons: Trading vs Long-Term Investing</text>
    
    {/* Left: Trading / Short-term */}
    <g transform="translate(50, 55)">
      <rect x="0" y="0" width="270" height="210" fill="#fef9c3" rx="12" stroke="#fcd34d" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#92400e">⚡ Trading / Speculation</text>
      
      {/* Timeline visualization - fragmented */}
      <g transform="translate(20, 50)">
        <line x1="0" y1="40" x2="230" y2="40" stroke="#e2e8f0" strokeWidth="2"/>
        
        {/* Many small segments with arrows */}
        <rect x="10" y="30" width="25" height="20" fill="#fbbf24" rx="3"/>
        <text x="22" y="44" textAnchor="middle" fontSize="7" fill="#92400e">Buy</text>
        
        <rect x="45" y="30" width="25" height="20" fill="#f87171" rx="3"/>
        <text x="57" y="44" textAnchor="middle" fontSize="7" fill="#991b1b">Sell</text>
        
        <rect x="80" y="30" width="25" height="20" fill="#fbbf24" rx="3"/>
        <text x="92" y="44" textAnchor="middle" fontSize="7" fill="#92400e">Buy</text>
        
        <rect x="115" y="30" width="25" height="20" fill="#f87171" rx="3"/>
        <text x="127" y="44" textAnchor="middle" fontSize="7" fill="#991b1b">Sell</text>
        
        <rect x="150" y="30" width="25" height="20" fill="#fbbf24" rx="3"/>
        <text x="162" y="44" textAnchor="middle" fontSize="7" fill="#92400e">Buy</text>
        
        <rect x="185" y="30" width="25" height="20" fill="#f87171" rx="3"/>
        <text x="197" y="44" textAnchor="middle" fontSize="7" fill="#991b1b">Sell</text>
        
        {/* Time labels */}
        <text x="0" y="65" fontSize="7" fill="#78350f">Day 1</text>
        <text x="115" y="65" fontSize="7" fill="#78350f">Week 2</text>
        <text x="210" y="65" fontSize="7" fill="#78350f">Month 1</text>
      </g>
      
      <g transform="translate(20, 130)">
        <text x="0" y="0" fontSize="9" fill="#78350f">• Constant decisions</text>
        <text x="0" y="18" fontSize="9" fill="#78350f">• High stress & attention</text>
        <text x="0" y="36" fontSize="9" fill="#78350f">• Reacting to daily news</text>
        <text x="0" y="54" fontSize="9" fill="#78350f">• Trying to predict short-term</text>
      </g>
    </g>
    
    {/* Right: Long-Term Investing */}
    <g transform="translate(380, 55)">
      <rect x="0" y="0" width="270" height="210" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">🌱 Long-Term Investing</text>
      
      {/* Timeline visualization - single continuous bar */}
      <g transform="translate(20, 50)">
        <line x1="0" y1="40" x2="230" y2="40" stroke="#e2e8f0" strokeWidth="2"/>
        
        {/* Single long bar */}
        <rect x="10" y="30" width="200" height="20" fill="#22c55e" rx="3"/>
        <text x="110" y="44" textAnchor="middle" fontSize="8" fill="white" fontWeight="500">Own → Hold → Grow</text>
        
        {/* Time labels */}
        <text x="0" y="65" fontSize="7" fill="#14532d">Year 1</text>
        <text x="100" y="65" fontSize="7" fill="#14532d">Year 5</text>
        <text x="200" y="65" fontSize="7" fill="#14532d">Year 10+</text>
      </g>
      
      <g transform="translate(20, 130)">
        <text x="0" y="0" fontSize="9" fill="#14532d">• Few decisions over years</text>
        <text x="0" y="18" fontSize="9" fill="#14532d">• Low stress approach</text>
        <text x="0" y="36" fontSize="9" fill="#14532d">• Ignoring daily noise</text>
        <text x="0" y="54" fontSize="9" fill="#14532d">• Trusting long-term trends</text>
      </g>
    </g>
  </svg>
);

// SVG 2: Ownership & Business Growth
const OwnershipGrowthSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Long-Term Investing = Owning Pieces of Growing Things</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">When businesses grow, your ownership stake grows in value</text>
    
    {/* Business growth visualization */}
    <g transform="translate(80, 80)">
      {/* Year 1 - Small business */}
      <g transform="translate(0, 0)">
        <rect x="0" y="80" width="80" height="100" fill="#dbeafe" rx="8" stroke="#93c5fd" strokeWidth="2"/>
        <rect x="30" y="130" width="20" height="50" fill="#60a5fa" rx="2"/>
        <rect x="10" y="100" width="15" height="15" fill="#93c5fd" rx="2"/>
        <rect x="55" y="100" width="15" height="15" fill="#93c5fd" rx="2"/>
        <text x="40" y="200" textAnchor="middle" fontSize="10" fontWeight="600" fill="#1e40af">Year 1</text>
        <text x="40" y="215" textAnchor="middle" fontSize="8" fill="#3b82f6">Small</text>
      </g>
      
      {/* Arrow */}
      <path d="M100 130 L140 130" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)"/>
      
      {/* Year 5 - Medium business */}
      <g transform="translate(160, 0)">
        <rect x="0" y="50" width="100" height="130" fill="#dcfce7" rx="8" stroke="#86efac" strokeWidth="2"/>
        <rect x="35" y="110" width="30" height="70" fill="#22c55e" rx="2"/>
        <rect x="10" y="70" width="20" height="20" fill="#86efac" rx="2"/>
        <rect x="70" y="70" width="20" height="20" fill="#86efac" rx="2"/>
        <rect x="40" y="70" width="20" height="20" fill="#86efac" rx="2"/>
        <text x="50" y="200" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">Year 5</text>
        <text x="50" y="215" textAnchor="middle" fontSize="8" fill="#22c55e">Growing</text>
      </g>
      
      {/* Arrow */}
      <path d="M280 130 L320 130" stroke="#94a3b8" strokeWidth="2"/>
      
      {/* Year 10 - Large business */}
      <g transform="translate(340, 0)">
        <rect x="0" y="20" width="130" height="160" fill="#fef9c3" rx="8" stroke="#fcd34d" strokeWidth="2"/>
        <rect x="45" y="90" width="40" height="90" fill="#f59e0b" rx="2"/>
        <rect x="10" y="45" width="25" height="25" fill="#fcd34d" rx="2"/>
        <rect x="52" y="45" width="25" height="25" fill="#fcd34d" rx="2"/>
        <rect x="95" y="45" width="25" height="25" fill="#fcd34d" rx="2"/>
        <rect x="10" y="80" width="25" height="25" fill="#fcd34d" rx="2"/>
        <rect x="95" y="80" width="25" height="25" fill="#fcd34d" rx="2"/>
        <text x="65" y="200" textAnchor="middle" fontSize="10" fontWeight="600" fill="#92400e">Year 10</text>
        <text x="65" y="215" textAnchor="middle" fontSize="8" fill="#f59e0b">Established</text>
      </g>
      
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8"/>
        </marker>
      </defs>
    </g>
    
    {/* Your ownership stake */}
    <g transform="translate(100, 250)">
      <rect x="0" y="0" width="500" height="50" fill="#059669" rx="8"/>
      <text x="250" y="22" textAnchor="middle" fontSize="10" fill="white">Your ownership stake (shares) represents a piece of this growth.</text>
      <text x="250" y="40" textAnchor="middle" fontSize="10" fill="#a7f3d0">As the business grows over years, so does the value of what you own.</text>
    </g>
  </svg>
);

// SVG 3: Market Noise vs Long-Term Trend
const NoiseVsTrendSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Daily Noise vs Long-Term Trend</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">The same asset looks different depending on your time horizon</text>
    
    {/* Chart area */}
    <g transform="translate(80, 70)">
      {/* Grid */}
      <line x1="0" y1="180" x2="540" y2="180" stroke="#e2e8f0" strokeWidth="1"/>
      <line x1="0" y1="0" x2="0" y2="180" stroke="#e2e8f0" strokeWidth="1"/>
      
      {/* Noisy short-term line (gray, jagged) */}
      <path d="M0 140 L20 130 L40 145 L60 120 L80 135 L100 110 L120 125 L140 100 L160 115 L180 95 L200 108 L220 85 L240 100 L260 75 L280 90 L300 70 L320 82 L340 60 L360 75 L380 55 L400 68 L420 50 L440 62 L460 42 L480 55 L500 35 L520 48 L540 30" 
            fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity="0.6"/>
      
      {/* Smooth long-term trend line (green, smooth) */}
      <path d="M0 150 Q135 130 270 100 Q405 65 540 35" 
            fill="none" stroke="#22c55e" strokeWidth="3"/>
      
      {/* Labels */}
      <g transform="translate(545, 25)">
        <circle cx="0" cy="0" r="4" fill="#22c55e"/>
        <text x="10" y="4" fontSize="9" fill="#166534">Long-term trend</text>
      </g>
      
      <g transform="translate(545, 50)">
        <line x1="-5" y1="0" x2="5" y2="0" stroke="#94a3b8" strokeWidth="2"/>
        <text x="10" y="4" fontSize="9" fill="#64748b">Daily fluctuations</text>
      </g>
      
      {/* Time axis labels */}
      <text x="0" y="200" fontSize="8" fill="#64748b">Start</text>
      <text x="260" y="200" textAnchor="middle" fontSize="8" fill="#64748b">Years Pass</text>
      <text x="540" y="200" textAnchor="end" fontSize="8" fill="#64748b">Decades Later</text>
      
      {/* Annotation box */}
      <g transform="translate(150, 130)">
        <rect x="0" y="0" width="180" height="45" fill="#fef9c3" rx="6" stroke="#fcd34d" strokeWidth="1"/>
        <text x="90" y="18" textAnchor="middle" fontSize="8" fontWeight="600" fill="#92400e">The daily noise is real...</text>
        <text x="90" y="35" textAnchor="middle" fontSize="8" fill="#78350f">but it matters less over time.</text>
      </g>
    </g>
  </svg>
);

// SVG 4: Mindset Comparison
const MindsetComparisonSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Two Different Mindsets</text>
    
    {/* Left: Speculator mindset */}
    <g transform="translate(50, 55)">
      <rect x="0" y="0" width="270" height="195" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">🎰 Speculator Mindset</text>
      
      <g transform="translate(20, 50)">
        <text x="0" y="0" fontSize="9" fill="#991b1b">"When should I buy?"</text>
        <text x="0" y="22" fontSize="9" fill="#991b1b">"When should I sell?"</text>
        <text x="0" y="44" fontSize="9" fill="#991b1b">"What will happen tomorrow?"</text>
        <text x="0" y="66" fontSize="9" fill="#991b1b">"Is this the bottom? The top?"</text>
        <text x="0" y="88" fontSize="9" fill="#991b1b">"What are others doing?"</text>
      </g>
      
      <rect x="20" y="150" width="230" height="30" fill="#fee2e2" rx="6"/>
      <text x="135" y="170" textAnchor="middle" fontSize="9" fill="#991b1b">Constant anxiety and second-guessing</text>
    </g>
    
    {/* Right: Investor mindset */}
    <g transform="translate(380, 55)">
      <rect x="0" y="0" width="270" height="195" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">🌱 Investor Mindset</text>
      
      <g transform="translate(20, 50)">
        <text x="0" y="0" fontSize="9" fill="#14532d">"Do I own quality assets?"</text>
        <text x="0" y="22" fontSize="9" fill="#14532d">"Is my time horizon long enough?"</text>
        <text x="0" y="44" fontSize="9" fill="#14532d">"Am I being patient?"</text>
        <text x="0" y="66" fontSize="9" fill="#14532d">"Can I ignore the noise?"</text>
        <text x="0" y="88" fontSize="9" fill="#14532d">"Does this fit my plan?"</text>
      </g>
      
      <rect x="20" y="150" width="230" height="30" fill="#bbf7d0" rx="6"/>
      <text x="135" y="170" textAnchor="middle" fontSize="9" fill="#166534">Calm confidence and clarity</text>
    </g>
  </svg>
);

// SVG 5: Why Frequent Action Isn't Required
const InactionValueSVG = () => (
  <svg viewBox="0 0 700 260" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="260" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Why Frequent Action Isn't Required</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">In long-term investing, patience is the strategy</text>
    
    {/* Visual: Activity level comparison */}
    <g transform="translate(80, 75)">
      {/* High activity trader */}
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="240" height="80" fill="#fef9c3" rx="10"/>
        <text x="120" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#92400e">Active Trader</text>
        
        {/* Many action icons */}
        <g transform="translate(20, 40)">
          <circle cx="10" cy="15" r="8" fill="#f59e0b"/>
          <circle cx="35" cy="15" r="8" fill="#ef4444"/>
          <circle cx="60" cy="15" r="8" fill="#f59e0b"/>
          <circle cx="85" cy="15" r="8" fill="#ef4444"/>
          <circle cx="110" cy="15" r="8" fill="#f59e0b"/>
          <circle cx="135" cy="15" r="8" fill="#ef4444"/>
          <circle cx="160" cy="15" r="8" fill="#f59e0b"/>
          <circle cx="185" cy="15" r="8" fill="#ef4444"/>
        </g>
        <text x="120" y="75" textAnchor="middle" fontSize="8" fill="#78350f">Many decisions, much effort</text>
      </g>
      
      {/* Low activity investor */}
      <g transform="translate(300, 0)">
        <rect x="0" y="0" width="240" height="80" fill="#dcfce7" rx="10"/>
        <text x="120" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">Long-Term Investor</text>
        
        {/* Few action icons */}
        <g transform="translate(70, 40)">
          <circle cx="20" cy="15" r="12" fill="#22c55e"/>
          <text x="20" y="19" textAnchor="middle" fontSize="8" fill="white">✓</text>
          <circle cx="80" cy="15" r="12" fill="#22c55e"/>
          <text x="80" y="19" textAnchor="middle" fontSize="8" fill="white">✓</text>
        </g>
        <text x="120" y="75" textAnchor="middle" fontSize="8" fill="#14532d">Few decisions, more patience</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <g transform="translate(80, 175)">
      <rect x="0" y="0" width="540" height="60" fill="#1e293b" rx="10"/>
      <text x="270" y="25" textAnchor="middle" fontSize="11" fill="white" fontWeight="500">Long-term investing works because time does the heavy lifting.</text>
      <text x="270" y="45" textAnchor="middle" fontSize="10" fill="#94a3b8">Your job is simply to stay invested and let compounding work.</text>
    </g>
  </svg>
);

// SVG 6: Emotional Benefit
const EmotionalBenefitSVG = () => (
  <svg viewBox="0 0 700 240" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="240" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">The Emotional Benefit of Long-Term Thinking</text>
    
    {/* Stress timeline comparison */}
    <g transform="translate(60, 60)">
      {/* Short-term stress line */}
      <g transform="translate(0, 0)">
        <text x="0" y="0" fontSize="10" fill="#dc2626" fontWeight="500">Short-term focus: 😰</text>
        <rect x="120" y="-12" width="450" height="25" fill="#fef2f2" rx="6"/>
        
        {/* Stress spikes */}
        <path d="M130 0 L145 -8 L160 5 L175 -10 L190 8 L205 -5 L220 10 L235 -8 L250 6 L265 -10 L280 5 L295 -7 L310 8 L325 -5 L340 10 L355 -8 L370 5 L385 -10 L400 8 L415 -5 L430 10 L445 -8 L460 6 L475 -10 L490 5 L505 -7 L520 8 L535 -5 L550 5 L560 0" 
              fill="none" stroke="#ef4444" strokeWidth="2"/>
      </g>
      
      {/* Long-term calm line */}
      <g transform="translate(0, 70)">
        <text x="0" y="0" fontSize="10" fill="#16a34a" fontWeight="500">Long-term focus: 😌</text>
        <rect x="120" y="-12" width="450" height="25" fill="#dcfce7" rx="6"/>
        
        {/* Calm steady line */}
        <path d="M130 0 Q270 -2 400 0 Q520 2 560 0" 
              fill="none" stroke="#22c55e" strokeWidth="2"/>
      </g>
    </g>
    
    {/* Benefits list */}
    <g transform="translate(80, 170)">
      <rect x="0" y="0" width="540" height="50" fill="#f0fdf4" rx="8" stroke="#86efac" strokeWidth="1"/>
      <text x="135" y="20" textAnchor="middle" fontSize="9" fill="#166534">✓ Less screen time</text>
      <text x="135" y="38" textAnchor="middle" fontSize="9" fill="#166534">✓ Better sleep</text>
      <text x="270" y="20" textAnchor="middle" fontSize="9" fill="#166534">✓ No daily anxiety</text>
      <text x="270" y="38" textAnchor="middle" fontSize="9" fill="#166534">✓ Focus on life</text>
      <text x="405" y="20" textAnchor="middle" fontSize="9" fill="#166534">✓ Clear mind</text>
      <text x="405" y="38" textAnchor="middle" fontSize="9" fill="#166534">✓ Sustainable approach</text>
    </g>
  </svg>
);

// SVG 7: Held vs Traded Example
const HeldVsTradedSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Same Asset, Different Approaches</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">What happens when you hold vs when you trade frequently</text>
    
    {/* Person A - Holder */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="280" height="190" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">Person A: The Holder</text>
      
      {/* Simple timeline */}
      <g transform="translate(20, 50)">
        <line x1="0" y1="30" x2="240" y2="30" stroke="#22c55e" strokeWidth="3"/>
        <circle cx="0" cy="30" r="8" fill="#22c55e"/>
        <text x="0" y="55" textAnchor="middle" fontSize="8" fill="#166534">Bought</text>
        <circle cx="240" cy="30" r="8" fill="#22c55e"/>
        <text x="240" y="55" textAnchor="middle" fontSize="8" fill="#166534">Still owns</text>
      </g>
      
      <g transform="translate(20, 115)">
        <text x="0" y="0" fontSize="9" fill="#14532d">• Bought quality assets once</text>
        <text x="0" y="18" fontSize="9" fill="#14532d">• Ignored market ups and downs</text>
        <text x="0" y="36" fontSize="9" fill="#14532d">• Checked portfolio occasionally</text>
        <text x="0" y="54" fontSize="9" fill="#14532d">• Lived life peacefully</text>
      </g>
    </g>
    
    {/* Person B - Trader */}
    <g transform="translate(370, 75)">
      <rect x="0" y="0" width="280" height="190" fill="#fef9c3" rx="12" stroke="#fcd34d" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#92400e">Person B: The Trader</text>
      
      {/* Complex timeline */}
      <g transform="translate(20, 50)">
        <line x1="0" y1="30" x2="240" y2="30" stroke="#e2e8f0" strokeWidth="2"/>
        <circle cx="0" cy="30" r="6" fill="#22c55e"/>
        <circle cx="40" cy="30" r="6" fill="#ef4444"/>
        <circle cx="80" cy="30" r="6" fill="#22c55e"/>
        <circle cx="120" cy="30" r="6" fill="#ef4444"/>
        <circle cx="160" cy="30" r="6" fill="#22c55e"/>
        <circle cx="200" cy="30" r="6" fill="#ef4444"/>
        <circle cx="240" cy="30" r="6" fill="#22c55e"/>
        <text x="120" y="55" textAnchor="middle" fontSize="8" fill="#78350f">Buy-sell-buy-sell-buy...</text>
      </g>
      
      <g transform="translate(20, 115)">
        <text x="0" y="0" fontSize="9" fill="#78350f">• Bought and sold many times</text>
        <text x="0" y="18" fontSize="9" fill="#78350f">• Reacted to every news event</text>
        <text x="0" y="36" fontSize="9" fill="#78350f">• Watched markets constantly</text>
        <text x="0" y="54" fontSize="9" fill="#78350f">• Lived with stress</text>
      </g>
    </g>
  </svg>
);

// SVG 8: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 140" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="140" fill="url(#takeawayGrad)" rx="16"/>
    
    <defs>
      <linearGradient id="takeawayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#059669"/>
        <stop offset="100%" stopColor="#0d9488"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="45" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">🌱 Key Takeaway</text>
    <text x="350" y="75" textAnchor="middle" fontSize="12" fill="white">Long-term investing is not about predicting the future.</text>
    <text x="350" y="100" textAnchor="middle" fontSize="12" fill="white">It's about owning pieces of growing things and giving them time to grow.</text>
    <text x="350" y="125" textAnchor="middle" fontSize="11" fill="#a7f3d0">Your patience is your edge.</text>
  </svg>
);

const LTILesson1 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const quizQuestions = [
    {
      id: 1,
      question: "What is the main difference between trading and long-term investing?",
      options: [
        "Trading uses more money than investing",
        "Long-term investing focuses on holding assets over years, while trading focuses on frequent buying and selling",
        "Trading is only for professionals, investing is for beginners",
        "There is no real difference between them"
      ],
      correct: 1,
      explanation: "Long-term investing is about owning assets for years and letting them grow, while trading involves frequent buying and selling to profit from short-term price movements."
    },
    {
      id: 2,
      question: "Why does long-term investing often reduce emotional stress?",
      options: [
        "Because you never lose money",
        "Because you don't need to react to daily market news",
        "Because the government guarantees your investments",
        "Because you invest smaller amounts"
      ],
      correct: 1,
      explanation: "Long-term investors don't need to react to daily market fluctuations, which reduces the anxiety of constant decision-making and market watching."
    }
  ];

  const handleAnswer = (questionId, answerIndex) => {
    setQuizAnswers({ ...quizAnswers, [questionId]: answerIndex });
    setShowResults({ ...showResults, [questionId]: true });
  };

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 pt-24 pb-8 px-4">
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
              <ModuleBadge moduleId="long-term-investing" />
              <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                Lesson 1 of 7
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">What is Long-Term Investing?</h1>
            <p className="text-gray-600 text-lg">
              Understanding the foundation of wealth building through patient ownership.
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Long-Term Investing Exists</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Throughout history, people have built wealth not through clever tricks or perfect timing, 
              but through one simple principle: <strong>owning things that grow over time</strong>.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Long-term investing exists because businesses grow, economies expand, and human 
              innovation creates value over decades. When you invest long-term, you're simply 
              positioning yourself to benefit from this natural growth — without trying to 
              predict what happens tomorrow or next week.
            </p>
            <p className="text-lg leading-relaxed">
              This is fundamentally different from trading or speculation, which tries to profit 
              from short-term price movements. Trading requires constant attention, quick decisions, 
              and often creates stress. Long-term investing requires patience, discipline, and 
              the wisdom to ignore the noise.
            </p>
          </div>
        </div>

        {/* Time Horizon Comparison */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Trading vs Long-Term Investing</h2>
          <TimeHorizonSVG />
          
          <div className="mt-6 bg-teal-50 rounded-xl p-5 border border-teal-200">
            <p className="text-teal-800">
              <strong>The key distinction:</strong> Trading is about <em>timing</em> — trying to 
              predict short-term price movements. Long-term investing is about <em>time</em> — 
              staying invested long enough for growth to happen naturally.
            </p>
          </div>
        </div>

        {/* Core Explanation: What Long-Term Investing Means */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">What Long-Term Investing Really Means</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              At its core, long-term investing means <strong>owning assets — pieces of businesses, 
              funds, or other investments — and holding them for years or decades</strong>. You're 
              not looking to sell next month or react to every headline. You're an owner, not a renter.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              When you buy shares in a company or a fund, you own a tiny piece of something real. 
              As that business grows — hiring more people, serving more customers, creating more 
              value — the worth of your ownership stake tends to grow too. This is how wealth 
              is built over time.
            </p>
            <p className="text-lg leading-relaxed">
              Long-term investing works because it aligns with how the economy actually grows: 
              slowly, imperfectly, but persistently over decades.
            </p>
          </div>

          <OwnershipGrowthSVG />
        </div>

        {/* The Role of Business Growth */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">The Role of Business Growth and Economic Expansion</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Why does long-term investing work? Because the global economy has consistently 
              grown over time. Despite wars, recessions, pandemics, and crises, humanity 
              keeps innovating, building, and creating value.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              When you invest long-term, you're betting on this continued growth. You don't 
              need to predict which specific company will win or what the market will do 
              next month. You simply need to participate in the broad trend of economic expansion.
            </p>
            <p className="text-lg leading-relaxed">
              This is why long-term investing is often called "investing in the future" — 
              you're trusting that human progress will continue, even if you can't predict 
              exactly how it will unfold.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200 text-center">
              <div className="text-3xl mb-2">🏭</div>
              <h4 className="font-semibold text-blue-800 mb-2">Businesses Grow</h4>
              <p className="text-blue-700 text-sm">
                Companies hire, innovate, expand, and create more value over time.
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-5 border border-green-200 text-center">
              <div className="text-3xl mb-2">🌍</div>
              <h4 className="font-semibold text-green-800 mb-2">Economies Expand</h4>
              <p className="text-green-700 text-sm">
                Global population and productivity increase decade after decade.
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 text-center">
              <div className="text-3xl mb-2">💡</div>
              <h4 className="font-semibold text-amber-800 mb-2">Innovation Continues</h4>
              <p className="text-amber-700 text-sm">
                Human creativity solves problems and creates new opportunities.
              </p>
            </div>
          </div>
        </div>

        {/* Why Frequent Action Isn't Required */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Frequent Action Isn't Required</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              One of the biggest misconceptions about investing is that you need to be constantly 
              active — watching screens, making decisions, reacting to news. In long-term investing, 
              the opposite is true: <strong>less action often leads to better results</strong>.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Every time you buy or sell, you're making a prediction about the future. The more 
              decisions you make, the more chances you have to be wrong. Long-term investors 
              minimize these decisions by simply staying invested through market cycles.
            </p>
            <p className="text-lg leading-relaxed">
              Your job as a long-term investor is remarkably simple: choose quality assets, 
              invest consistently, and then get out of the way. Let time and compounding do 
              the hard work while you focus on living your life.
            </p>
          </div>

          <InactionValueSVG />
        </div>

        {/* Noise vs Long-Term Trend */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Seeing Through the Noise</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Every day, markets move up and down. Headlines scream about crashes, rallies, 
              and uncertainty. This is the "noise" of short-term market movements.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              But zoom out to years and decades, and a different picture emerges. The daily 
              fluctuations that seemed so important fade into insignificance against the 
              long-term upward trend of economic growth.
            </p>
            <p className="text-lg leading-relaxed">
              Long-term investors train themselves to see through this noise. They understand 
              that temporary declines are normal and even healthy — they're simply part of 
              the journey, not the destination.
            </p>
          </div>

          <NoiseVsTrendSVG />
        </div>

        {/* Emotional Stress Reduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">How Long-Term Investing Reduces Emotional Stress</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Beyond financial benefits, long-term investing offers something equally valuable: 
              <strong>peace of mind</strong>. When you're not trying to time the market or 
              react to every piece of news, you free yourself from constant anxiety.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Short-term traders often experience significant stress — the market is always 
              open somewhere, there's always news to react to, and every decision feels urgent. 
              Long-term investors escape this cycle entirely.
            </p>
            <p className="text-lg leading-relaxed">
              This isn't just about feeling better — research shows that emotional, reactive 
              investors often make worse decisions. By adopting a long-term mindset, you're 
              not just reducing stress; you're improving your decision-making.
            </p>
          </div>

          <EmotionalBenefitSVG />
        </div>

        {/* Mindset Comparison */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">The Questions You Ask Yourself</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Your mindset shapes your investing experience. A speculator constantly asks 
              <em>"What should I do?"</em> while an investor asks <em>"Am I being patient?"</em>
            </p>
            <p className="text-lg leading-relaxed">
              The questions you ask yourself reveal whether you're approaching markets as 
              a game to be won or as a vehicle for long-term wealth building. The right 
              questions lead to calm confidence; the wrong ones lead to anxiety and mistakes.
            </p>
          </div>

          <MindsetComparisonSVG />
        </div>

        {/* Practical Example */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">A Practical Example: Same Asset, Different Journeys</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Imagine two people who start with the same investment at the same time. Person A 
              simply holds their investment through thick and thin. Person B constantly trades, 
              trying to avoid every dip and catch every rally.
            </p>
            <p className="text-lg leading-relaxed">
              Over years, Person A lives their life — focusing on career, family, hobbies — 
              while their investment quietly grows. Person B spends countless hours watching 
              markets, feeling stressed during downturns, and making many decisions that 
              may or may not work out.
            </p>
          </div>

          <HeldVsTradedSVG />
          
          <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
            <p className="text-amber-800">
              <strong>Note:</strong> This isn't about which approach makes more money — that 
              varies. It's about which approach is sustainable, less stressful, and more 
              aligned with how most people want to live their lives.
            </p>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
        </div>

        {/* India-specific Context */}
        <div className="bg-teal-50 rounded-2xl p-6 shadow-lg mb-8 border border-teal-200">
          <h3 className="text-lg font-semibold text-teal-800 mb-3">🌍 Global Perspective</h3>
          <p className="text-teal-900 mb-3">
            Long-term investing is practiced by millions of people worldwide — from the United States 
            to Europe, Japan to Australia, and increasingly in India and other emerging markets. 
            The principles are universal because they're based on how economies and businesses 
            fundamentally grow.
          </p>
          <p className="text-teal-800 text-sm">
            Whether you're investing in American markets, European indices, or Indian mutual funds, 
            the core concept remains the same: own quality assets, stay patient, and let time work 
            in your favor.
          </p>
        </div>

        {/* Knowledge Check */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Knowledge Check</h2>
          <p className="text-gray-600 mb-6">Test your understanding of this lesson's key concepts.</p>
          
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
                            ? 'border-green-500 bg-green-50'
                            : quizAnswers[q.id] === index
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-white'
                          : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={showResults[q.id] && index === q.correct ? 'text-green-700 font-medium' : ''}>
                          {option}
                        </span>
                        {showResults[q.id] && index === q.correct && (
                          <FaCheckCircle className="text-green-500" />
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
                    quizAnswers[q.id] === q.correct ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    <p className={quizAnswers[q.id] === q.correct ? 'text-green-800' : 'text-amber-800'}>
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
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 shadow-lg mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <FaLightbulb className="text-2xl text-teal-200" />
            <h3 className="text-xl font-bold">Reflection Activity</h3>
          </div>
          <p className="text-teal-100 mb-4">
            Take a moment to think about your own relationship with time and money:
          </p>
          <div className="bg-white/20 rounded-xl p-5">
            <p className="text-white font-medium mb-2">Ask yourself:</p>
            <ul className="text-teal-100 space-y-2">
              <li>• When I think about investing, do I imagine making quick decisions or building something over years?</li>
              <li>• How do I typically react when I hear about market drops in the news?</li>
              <li>• Am I comfortable with the idea of investing in something and not looking at it for months?</li>
              <li>• What would it feel like to invest without constantly checking performance?</li>
            </ul>
          </div>
          <p className="text-teal-200 mt-4 text-sm">
            There are no right or wrong answers — this is about understanding your current mindset 
            before developing a long-term investing approach.
          </p>
        </div>

        {/* Lesson Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Lesson Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <h4 className="font-semibold text-teal-800 mb-2">What We Learned</h4>
              <ul className="text-teal-700 text-sm space-y-1">
                <li>✓ Long-term investing means owning assets for years</li>
                <li>✓ It works because economies grow over time</li>
                <li>✓ Less action often means better results</li>
                <li>✓ Daily noise fades against long-term trends</li>
              </ul>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <h4 className="font-semibold text-emerald-800 mb-2">Key Mindset Shift</h4>
              <ul className="text-emerald-700 text-sm space-y-1">
                <li>✓ From "timing" to "time"</li>
                <li>✓ From "predicting" to "participating"</li>
                <li>✓ From "reacting" to "staying the course"</li>
                <li>✓ From "anxiety" to "patience"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to="/learn/long-term-investing"
            className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Module Overview</span>
          </Link>
          <button
            onClick={() => navigate('/learn/lti-lesson-2')}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <span>Next: The Power of Compounding</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default LTILesson1;
