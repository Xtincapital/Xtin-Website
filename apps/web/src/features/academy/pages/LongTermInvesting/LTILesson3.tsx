import React, { useState } from 'react';
import StudyShell from "../../components/StudyShell";
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaSeedling, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';

// SVG 1: The Two Paths
const TwoPathsSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Two Different Approaches to Investing</text>
    
    {/* Left: Time IN the Market */}
    <g transform="translate(50, 60)">
      <rect x="0" y="0" width="270" height="210" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A">📅 Time IN the Market</text>
      
      {/* Continuous path visualization */}
      <g transform="translate(25, 50)">
        <rect x="0" y="40" width="220" height="8" fill="#16A34A" rx="4"/>
        <circle cx="0" cy="44" r="10" fill="#16A34A"/>
        <text x="0" y="48" textAnchor="middle" fontSize="8" fill="white">Start</text>
        <circle cx="220" cy="44" r="10" fill="#16A34A"/>
        <text x="220" y="48" textAnchor="middle" fontSize="8" fill="white">Now</text>
        
        <text x="110" y="75" textAnchor="middle" fontSize="9" fill="#16A34A">Continuously invested</text>
      </g>
      
      <g transform="translate(20, 130)">
        <text x="0" y="0" fontSize="9" fill="#16A34A">✓ Stay invested through ups and downs</text>
        <text x="0" y="18" fontSize="9" fill="#16A34A">✓ No prediction required</text>
        <text x="0" y="36" fontSize="9" fill="#16A34A">✓ Captures long-term growth</text>
        <text x="0" y="54" fontSize="9" fill="#16A34A">✓ Less stress, fewer decisions</text>
      </g>
    </g>
    
    {/* Right: Timing the Market */}
    <g transform="translate(380, 60)">
      <rect x="0" y="0" width="270" height="210" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="#654B26">⏱️ Timing the Market</text>
      
      {/* Interrupted path visualization */}
      <g transform="translate(25, 50)">
        <rect x="0" y="40" width="50" height="8" fill="#B8923F" rx="4"/>
        <rect x="70" y="40" width="40" height="8" fill="#B8923F" rx="4"/>
        <rect x="130" y="40" width="30" height="8" fill="#B8923F" rx="4"/>
        <rect x="180" y="40" width="40" height="8" fill="#B8923F" rx="4"/>
        
        {/* Gap indicators */}
        <text x="60" y="44" textAnchor="middle" fontSize="8" fill="#C7363B">out</text>
        <text x="120" y="44" textAnchor="middle" fontSize="8" fill="#C7363B">out</text>
        <text x="170" y="44" textAnchor="middle" fontSize="8" fill="#C7363B">out</text>
        
        <text x="110" y="75" textAnchor="middle" fontSize="9" fill="#654B26">In and out repeatedly</text>
      </g>
      
      <g transform="translate(20, 130)">
        <text x="0" y="0" fontSize="9" fill="#533E22">⚠ Try to predict highs and lows</text>
        <text x="0" y="18" fontSize="9" fill="#533E22">⚠ Must be right twice (exit + re-enter)</text>
        <text x="0" y="36" fontSize="9" fill="#533E22">⚠ Risk missing key growth periods</text>
        <text x="0" y="54" fontSize="9" fill="#533E22">⚠ High stress, constant decisions</text>
      </g>
    </g>
  </svg>
);

// SVG 2: Why Timing Feels Attractive
const TimingAttractiveSVG = () => (
  <svg viewBox="0 0 700 260" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="260" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Why Market Timing Feels So Attractive</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">The logical appeal vs the practical reality</text>
    
    {/* The Appeal */}
    <g transform="translate(50, 70)">
      <rect x="0" y="0" width="280" height="160" fill="#E0E7F1" rx="12" stroke="#9FB3D3" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2C3F5E">💭 The Appeal</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="9" fill="#26354F">"Buy low, sell high" sounds logical</text>
        <text x="0" y="22" fontSize="9" fill="#26354F">"Avoid the drops, catch the rises"</text>
        <text x="0" y="44" fontSize="9" fill="#26354F">"Smart people can predict markets"</text>
        <text x="0" y="66" fontSize="9" fill="#26354F">"I'll get back in when things calm down"</text>
        <text x="0" y="88" fontSize="9" fill="#26354F">"This time feels different"</text>
      </g>
    </g>
    
    {/* The Reality */}
    <g transform="translate(370, 70)">
      <rect x="0" y="0" width="280" height="160" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">🔍 The Reality</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="9" fill="#842428">No one consistently predicts bottoms</text>
        <text x="0" y="22" fontSize="9" fill="#842428">Best days often follow worst days</text>
        <text x="0" y="44" fontSize="9" fill="#842428">Even professionals struggle to time</text>
        <text x="0" y="66" fontSize="9" fill="#842428">"Calm" often means you've missed the rise</text>
        <text x="0" y="88" fontSize="9" fill="#842428">Markets always feel uncertain</text>
      </g>
    </g>
  </svg>
);

// SVG 3: The Problem with Missing Key Periods
const MissedPeriodsSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The Hidden Cost of Missing Key Periods</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Markets don't rise gradually — growth often comes in sudden bursts</text>
    
    {/* Timeline visualization */}
    <g transform="translate(60, 80)">
      {/* Base timeline */}
      <line x1="0" y1="100" x2="580" y2="100" stroke="#E4E4EA" strokeWidth="2"/>
      
      {/* Regular periods - flat */}
      <rect x="0" y="85" width="80" height="30" fill="#EEEEF1" rx="4" stroke="#CFD0D3" strokeWidth="1"/>
      <rect x="100" y="85" width="60" height="30" fill="#EEEEF1" rx="4" stroke="#CFD0D3" strokeWidth="1"/>
      <rect x="180" y="85" width="80" height="30" fill="#EEEEF1" rx="4" stroke="#CFD0D3" strokeWidth="1"/>
      <rect x="280" y="85" width="60" height="30" fill="#EEEEF1" rx="4" stroke="#CFD0D3" strokeWidth="1"/>
      <rect x="360" y="85" width="80" height="30" fill="#EEEEF1" rx="4" stroke="#CFD0D3" strokeWidth="1"/>
      <rect x="460" y="85" width="60" height="30" fill="#EEEEF1" rx="4" stroke="#CFD0D3" strokeWidth="1"/>
      
      {/* Key growth periods - highlighted */}
      <rect x="80" y="60" width="20" height="55" fill="#16A34A" rx="4"/>
      <text x="90" y="52" textAnchor="middle" fontSize="8" fill="#16A34A" fontWeight="600">Surge</text>
      
      <rect x="160" y="65" width="20" height="50" fill="#16A34A" rx="4"/>
      <text x="170" y="57" textAnchor="middle" fontSize="8" fill="#16A34A" fontWeight="600">Surge</text>
      
      <rect x="260" y="70" width="20" height="45" fill="#16A34A" rx="4"/>
      <text x="270" y="62" textAnchor="middle" fontSize="8" fill="#16A34A" fontWeight="600">Surge</text>
      
      <rect x="440" y="55" width="20" height="60" fill="#16A34A" rx="4"/>
      <text x="450" y="47" textAnchor="middle" fontSize="8" fill="#16A34A" fontWeight="600">Surge</text>
      
      <rect x="520" y="68" width="20" height="47" fill="#16A34A" rx="4"/>
      <text x="530" y="60" textAnchor="middle" fontSize="8" fill="#16A34A" fontWeight="600">Surge</text>
      
      {/* Labels */}
      <text x="290" y="145" textAnchor="middle" fontSize="9" fill="#717680">Years of investing</text>
    </g>
    
    {/* Key insight boxes */}
    <g transform="translate(60, 195)">
      <rect x="0" y="0" width="270" height="70" fill="#F0FDF4" rx="10" stroke="#16A34A" strokeWidth="1"/>
      <text x="135" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16A34A">If You Stay Invested</text>
      <text x="135" y="42" textAnchor="middle" fontSize="9" fill="#16A34A">You capture ALL the surge periods</text>
      <text x="135" y="58" textAnchor="middle" fontSize="9" fill="#16A34A">Growth accumulates over time</text>
    </g>
    
    <g transform="translate(370, 195)">
      <rect x="0" y="0" width="270" height="70" fill="#FDF1F1" rx="10" stroke="#F09B9B" strokeWidth="1"/>
      <text x="135" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">If You're Out During Surges</text>
      <text x="135" y="42" textAnchor="middle" fontSize="9" fill="#842428">You miss the periods that matter most</text>
      <text x="135" y="58" textAnchor="middle" fontSize="9" fill="#842428">No way to know when surges will happen</text>
    </g>
    
    {/* Bottom message */}
    <rect x="100" y="285" width="500" height="25" fill="#2A2A2C" rx="6"/>
    <text x="350" y="302" textAnchor="middle" fontSize="9" fill="white">The best days are unpredictable. Being invested is the only way to guarantee you don't miss them.</text>
  </svg>
);

// SVG 4: Continuous vs Interrupted Growth
const GrowthPathsSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Continuous Investment vs Interrupted Investment</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Same starting point, same time period, different journeys</text>
    
    {/* Chart area */}
    <g transform="translate(80, 75)">
      {/* Grid */}
      <line x1="0" y1="180" x2="540" y2="180" stroke="#E4E4EA" strokeWidth="1"/>
      <line x1="0" y1="0" x2="0" y2="180" stroke="#E4E4EA" strokeWidth="1"/>
      
      {/* Continuous investor path - smooth upward */}
      <path d="M0 160 Q90 155 180 140 Q270 120 360 90 Q450 55 540 30" 
            fill="none" stroke="#16A34A" strokeWidth="3"/>
      <circle cx="540" cy="30" r="6" fill="#16A34A"/>
      
      {/* Timer investor path - interrupted with gaps */}
      <path d="M0 160 L60 155" fill="none" stroke="#B8923F" strokeWidth="2.5"/>
      <path d="M100 155 L160 145" fill="none" stroke="#B8923F" strokeWidth="2.5"/>
      <path d="M200 155 L280 140" fill="none" stroke="#B8923F" strokeWidth="2.5"/>
      <path d="M320 150 L400 130" fill="none" stroke="#B8923F" strokeWidth="2.5"/>
      <path d="M440 140 L540 110" fill="none" stroke="#B8923F" strokeWidth="2.5"/>
      <circle cx="540" cy="110" r="6" fill="#B8923F"/>
      
      {/* Gap annotations */}
      <rect x="60" y="145" width="40" height="20" fill="#FBE1E1" rx="4"/>
      <text x="80" y="158" textAnchor="middle" fontSize="7" fill="#C7363B">Out</text>
      
      <rect x="160" y="140" width="40" height="20" fill="#FBE1E1" rx="4"/>
      <text x="180" y="153" textAnchor="middle" fontSize="7" fill="#C7363B">Out</text>
      
      <rect x="280" y="135" width="40" height="20" fill="#FBE1E1" rx="4"/>
      <text x="300" y="148" textAnchor="middle" fontSize="7" fill="#C7363B">Out</text>
      
      <rect x="400" y="125" width="40" height="20" fill="#FBE1E1" rx="4"/>
      <text x="420" y="138" textAnchor="middle" fontSize="7" fill="#C7363B">Out</text>
      
      {/* The gap between outcomes */}
      <line x1="555" y1="30" x2="555" y2="110" stroke="#717680" strokeWidth="1" strokeDasharray="4"/>
      <text x="575" y="70" fontSize="8" fill="#717680">Gap</text>
      
      {/* Legend */}
      <g transform="translate(350, -25)">
        <line x1="0" y1="0" x2="25" y2="0" stroke="#16A34A" strokeWidth="3"/>
        <text x="32" y="4" fontSize="9" fill="#16A34A">Stayed invested</text>
      </g>
      <g transform="translate(350, -8)">
        <line x1="0" y1="0" x2="25" y2="0" stroke="#B8923F" strokeWidth="2.5"/>
        <text x="32" y="4" fontSize="9" fill="#654B26">Tried to time</text>
      </g>
      
      {/* Time labels */}
      <text x="0" y="200" fontSize="8" fill="#717680">Start</text>
      <text x="270" y="200" textAnchor="middle" fontSize="8" fill="#717680">Years pass</text>
      <text x="540" y="200" textAnchor="end" fontSize="8" fill="#717680">End</text>
    </g>
  </svg>
);

// SVG 5: The Prediction Problem
const PredictionProblemSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The Prediction Problem</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">To time the market successfully, you need to be right twice</text>
    
    {/* Two decision points */}
    <g transform="translate(100, 80)">
      {/* Decision 1: When to exit */}
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="200" height="150" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
        <text x="100" y="30" textAnchor="middle" fontSize="11" fontWeight="600" fill="#654B26">Decision 1: When to Exit</text>
        
        <g transform="translate(20, 50)">
          <text x="0" y="0" fontSize="9" fill="#533E22">You must predict:</text>
          <text x="0" y="20" fontSize="9" fill="#533E22">• Is this the peak?</text>
          <text x="0" y="38" fontSize="9" fill="#533E22">• Will it fall from here?</text>
          <text x="0" y="56" fontSize="9" fill="#533E22">• How much will it fall?</text>
          <text x="0" y="74" fontSize="9" fill="#533E22">• When should I sell?</text>
        </g>
      </g>
      
      {/* Plus sign */}
      <text x="230" y="85" fontSize="32" fill="#A0A3AA">+</text>
      
      {/* Decision 2: When to re-enter */}
      <g transform="translate(280, 0)">
        <rect x="0" y="0" width="200" height="150" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
        <text x="100" y="30" textAnchor="middle" fontSize="11" fontWeight="600" fill="#654B26">Decision 2: When to Re-enter</text>
        
        <g transform="translate(20, 50)">
          <text x="0" y="0" fontSize="9" fill="#533E22">You must predict:</text>
          <text x="0" y="20" fontSize="9" fill="#533E22">• Is this the bottom?</text>
          <text x="0" y="38" fontSize="9" fill="#533E22">• Will it rise from here?</text>
          <text x="0" y="56" fontSize="9" fill="#533E22">• Is the danger over?</text>
          <text x="0" y="74" fontSize="9" fill="#533E22">• When should I buy?</text>
        </g>
      </g>
    </g>
    
    {/* Bottom message */}
    <rect x="100" y="245" width="500" height="25" fill="#C7363B" rx="6"/>
    <text x="350" y="262" textAnchor="middle" fontSize="9" fill="white">Getting ONE decision wrong can undo the benefit of the other. Getting both right consistently is nearly impossible.</text>
  </svg>
);

// SVG 6: Two Investors Story
const TwoInvestorsSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Two Investors, Same Market, Different Experiences</text>
    
    {/* Investor A: The Steady Investor */}
    <g transform="translate(50, 55)">
      <rect x="0" y="0" width="280" height="255" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">🧘 Maya: The Steady Investor</text>
      
      {/* Timeline */}
      <g transform="translate(20, 50)">
        <rect x="0" y="0" width="240" height="60" fill="#F0FDF4" rx="8"/>
        <line x1="20" y1="30" x2="220" y2="30" stroke="#16A34A" strokeWidth="3"/>
        <circle cx="20" cy="30" r="6" fill="#16A34A"/>
        <circle cx="220" cy="30" r="6" fill="#16A34A"/>
        <text x="120" y="55" textAnchor="middle" fontSize="8" fill="#16A34A">Invested continuously for years</text>
      </g>
      
      <g transform="translate(20, 125)">
        <text x="0" y="0" fontSize="9" fill="#16A34A" fontWeight="500">Maya's approach:</text>
        <text x="0" y="18" fontSize="9" fill="#16A34A">• Invested regularly, rain or shine</text>
        <text x="0" y="36" fontSize="9" fill="#16A34A">• Ignored scary headlines</text>
        <text x="0" y="54" fontSize="9" fill="#16A34A">• Didn't try to predict anything</text>
        <text x="0" y="72" fontSize="9" fill="#16A34A">• Spent time on life, not markets</text>
      </g>
      
      <rect x="20" y="210" width="240" height="30" fill="#16A34A" rx="6"/>
      <text x="140" y="230" textAnchor="middle" fontSize="10" fill="white" fontWeight="500">Result: Peaceful journey, steady progress</text>
    </g>
    
    {/* Investor B: The Timer */}
    <g transform="translate(370, 55)">
      <rect x="0" y="0" width="280" height="255" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#654B26">😰 Raj: The Market Timer</text>
      
      {/* Timeline - fragmented */}
      <g transform="translate(20, 50)">
        <rect x="0" y="0" width="240" height="60" fill="#FBF7EC" rx="8"/>
        <line x1="20" y1="30" x2="60" y2="30" stroke="#B8923F" strokeWidth="3"/>
        <line x1="90" y1="30" x2="130" y2="30" stroke="#B8923F" strokeWidth="3"/>
        <line x1="160" y1="30" x2="220" y2="30" stroke="#B8923F" strokeWidth="3"/>
        <text x="75" y="25" fontSize="7" fill="#C7363B">out</text>
        <text x="145" y="25" fontSize="7" fill="#C7363B">out</text>
        <text x="120" y="55" textAnchor="middle" fontSize="8" fill="#654B26">In and out based on predictions</text>
      </g>
      
      <g transform="translate(20, 125)">
        <text x="0" y="0" fontSize="9" fill="#533E22" fontWeight="500">Raj's approach:</text>
        <text x="0" y="18" fontSize="9" fill="#533E22">• Exited when markets felt scary</text>
        <text x="0" y="36" fontSize="9" fill="#533E22">• Waited for "the right time" to return</text>
        <text x="0" y="54" fontSize="9" fill="#533E22">• Watched markets constantly</text>
        <text x="0" y="72" fontSize="9" fill="#533E22">• Stressed about every decision</text>
      </g>
      
      <rect x="20" y="210" width="240" height="30" fill="#654B26" rx="6"/>
      <text x="140" y="230" textAnchor="middle" fontSize="10" fill="white" fontWeight="500">Result: Stressful journey, uncertain progress</text>
    </g>
  </svg>
);

// SVG 7: The Calm Advantage
const CalmAdvantageSVG = () => (
  <svg viewBox="0 0 700 260" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="260" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The Calm Advantage of Staying Invested</text>
    
    {/* Stress comparison */}
    <g transform="translate(60, 60)">
      {/* Timer stress line */}
      <g transform="translate(0, 0)">
        <text x="0" y="0" fontSize="10" fill="#C7363B" fontWeight="500">Market Timer's Mental State: 😰</text>
        <rect x="150" y="-12" width="420" height="30" fill="#FDF1F1" rx="6"/>
        
        {/* Anxiety spikes */}
        <path d="M160 3 L180 -8 L200 8 L220 -10 L240 10 L260 -8 L280 8 L300 -10 L320 5 L340 -8 L360 10 L380 -10 L400 8 L420 -8 L440 10 L460 -5 L480 8 L500 -10 L520 5 L540 -8 L560 3" 
              fill="none" stroke="#E04848" strokeWidth="2"/>
        
        <text x="360" y="28" textAnchor="middle" fontSize="8" fill="#842428">"Should I be in? Should I be out? Did I miss it?"</text>
      </g>
      
      {/* Long-term investor calm line */}
      <g transform="translate(0, 80)">
        <text x="0" y="0" fontSize="10" fill="#16A34A" fontWeight="500">Long-Term Investor's Mental State: 😌</text>
        <rect x="150" y="-12" width="420" height="30" fill="#F0FDF4" rx="6"/>
        
        {/* Calm steady line */}
        <path d="M160 3 Q280 1 400 3 Q520 5 560 3" 
              fill="none" stroke="#16A34A" strokeWidth="2"/>
        
        <text x="360" y="28" textAnchor="middle" fontSize="8" fill="#16A34A">"Markets do what markets do. I'm invested for the long term."</text>
      </g>
    </g>
    
    {/* Benefits */}
    <g transform="translate(80, 180)">
      <rect x="0" y="0" width="540" height="55" fill="#F0FDF4" rx="10" stroke="#16A34A" strokeWidth="1"/>
      <text x="270" y="20" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16A34A">Benefits of the Calm Approach</text>
      <g transform="translate(30, 35)">
        <text x="0" y="0" fontSize="9" fill="#16A34A">✓ Better sleep</text>
        <text x="120" y="0" fontSize="9" fill="#16A34A">✓ Less anxiety</text>
        <text x="240" y="0" fontSize="9" fill="#16A34A">✓ More free time</text>
        <text x="380" y="0" fontSize="9" fill="#16A34A">✓ Clearer thinking</text>
      </g>
    </g>
  </svg>
);

// SVG 8: Participation Over Prediction
const ParticipationSVG = () => (
  <svg viewBox="0 0 700 200" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="200" fill="url(#participationGrad)" rx="16"/>
    
    <defs>
      <linearGradient id="participationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#16A34A"/>
        <stop offset="100%" stopColor="#2A8C9A"/>
      </linearGradient>
    </defs>
    
    {/* Central message */}
    <text x="350" y="50" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">🎯 The Simple Truth</text>
    
    <g transform="translate(100, 75)">
      <rect x="0" y="0" width="200" height="50" fill="rgba(255,255,255,0.2)" rx="8"/>
      <text x="100" y="22" textAnchor="middle" fontSize="10" fill="white">Trying to PREDICT</text>
      <text x="100" y="40" textAnchor="middle" fontSize="10" fill="white">when to invest</text>
    </g>
    
    <text x="350" y="105" textAnchor="middle" fontSize="20" fill="white">→</text>
    
    <g transform="translate(400, 75)">
      <rect x="0" y="0" width="200" height="50" fill="rgba(255,255,255,0.3)" rx="8"/>
      <text x="100" y="22" textAnchor="middle" fontSize="10" fill="white" fontWeight="600">Simply PARTICIPATING</text>
      <text x="100" y="40" textAnchor="middle" fontSize="10" fill="white" fontWeight="600">consistently over time</text>
    </g>
    
    <text x="350" y="155" textAnchor="middle" fontSize="12" fill="#BBF7D0">Participation beats prediction. Consistency beats cleverness.</text>
    <text x="350" y="180" textAnchor="middle" fontSize="11" fill="white" fontWeight="600">You don't need to be right. You need to be invested.</text>
  </svg>
);

// SVG 9: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 140" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="140" fill="url(#takeawayGrad3)" rx="16"/>
    
    <defs>
      <linearGradient id="takeawayGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#16A34A"/>
        <stop offset="100%" stopColor="#2A8C9A"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="40" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">🌱 Key Takeaway</text>
    <text x="350" y="70" textAnchor="middle" fontSize="12" fill="white">Time IN the market beats trying to time the market.</text>
    <text x="350" y="95" textAnchor="middle" fontSize="12" fill="white">The key to capturing long-term growth is simply staying invested.</text>
    <text x="350" y="125" textAnchor="middle" fontSize="11" fill="#BBF7D0">Your presence matters more than your predictions.</text>
  </svg>
);

const LTILesson3 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const quizQuestions = [
    {
      id: 1,
      question: "Why is 'time in the market' generally more effective than 'timing the market'?",
      options: [
        "Because markets always go up",
        "Because staying invested ensures you don't miss unpredictable growth periods",
        "Because timing requires expensive tools",
        "Because governments prevent market timing"
      ],
      correct: 1,
      explanation: "Key growth periods are unpredictable. Staying invested ensures you capture all the gains, while trying to time means risking missing the periods that matter most."
    },
    {
      id: 2,
      question: "What makes market timing particularly difficult?",
      options: [
        "It requires expensive software",
        "It's illegal in most countries",
        "You need to be right twice — when to exit AND when to re-enter",
        "Markets are closed most of the time"
      ],
      correct: 2,
      explanation: "Successful market timing requires correctly predicting both when to exit and when to re-enter. Getting either decision wrong can eliminate any benefit from the other."
    }
  ];

  const handleAnswer = (questionId, answerIndex) => {
    setQuizAnswers({ ...quizAnswers, [questionId]: answerIndex });
    setShowResults({ ...showResults, [questionId]: true });
  };

  return (
    <StudyShell module="LongTermInvesting" lessonNumber={3}>
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
                Lesson 3 of 7
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-2 tracking-[-0.025em]">Time in the Market vs Timing the Market</h1>
            <p className="text-gray-600 text-lg">
              Why staying invested beats trying to predict the perfect moment.
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.025em]">Why People Try to Time Markets</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              It seems so logical: sell before markets fall, buy before they rise. If you could 
              just avoid the bad days and catch the good ones, wouldn't that be the smart approach?
            </p>
            <p className="text-lg leading-relaxed mb-4">
              This idea — <strong>market timing</strong> — is one of the most seductive concepts 
              in investing. It appeals to our desire for control and our belief that smart people 
              can predict what's coming.
            </p>
            <p className="text-lg leading-relaxed">
              The problem isn't that timing sounds appealing. The problem is that it rarely works 
              in practice — even for professionals who dedicate their careers to trying. Let's 
              understand why, and what actually works better.
            </p>
          </div>
        </div>

        {/* Why Timing Feels Attractive */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Why Timing Feels So Attractive</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Every time markets drop, a voice in your head whispers: "I should have sold before 
              this happened." Every time they rise, another voice says: "I should have bought more 
              before this rally."
            </p>
            <p className="text-lg leading-relaxed">
              This hindsight makes timing seem obvious — in retrospect. But living through real 
              market movements, without knowing what comes next, is entirely different. What feels 
              like "clearly the peak" often isn't. What feels like "surely the bottom" often has 
              further to fall.
            </p>
          </div>

          <TimingAttractiveSVG />
        </div>

        {/* The Two Paths */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Two Different Approaches</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Let's clearly define the two approaches investors can take:
            </p>
            <p className="text-lg leading-relaxed mb-4">
              <strong>Time IN the market</strong> means staying invested through market cycles — 
              ups, downs, sideways movements, all of it. You're not trying to predict anything. 
              You're simply participating in the market's long-term journey.
            </p>
            <p className="text-lg leading-relaxed">
              <strong>Timing the market</strong> means trying to move in and out based on 
              predictions — selling before drops, buying before rises, waiting for "better" 
              entry points. It requires making predictions about an unpredictable future.
            </p>
          </div>

          <TwoPathsSVG />
        </div>

        {/* The Prediction Problem */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">The Problem with Prediction</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Here's what makes market timing so difficult: it's not just one decision. 
              It's two decisions, and you need to get both right.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              First, you need to predict when to exit — selling before a decline. Then, you 
              need to predict when to re-enter — buying before the recovery. If you get the 
              first decision right but the second wrong, you might sell before a drop but then 
              miss the subsequent rise by waiting too long.
            </p>
            <p className="text-lg leading-relaxed">
              Even professional fund managers with teams of analysts and sophisticated tools 
              struggle to consistently time markets. For individual investors trying to do 
              this while living normal lives, the odds are even harder.
            </p>
          </div>

          <PredictionProblemSVG />
        </div>

        {/* Why Missing Key Periods Hurts */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Why Missing Key Periods Hurts</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Markets don't rise steadily like an escalator. They move in bursts — long periods 
              of modest movement punctuated by short periods of significant gains. These key 
              growth periods are unpredictable and often happen suddenly.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Here's the uncomfortable truth: some of the best days in markets often come right 
              after some of the worst days. If you exit during scary times and wait for things 
              to "calm down," you may miss the very recovery you were hoping to catch later.
            </p>
            <p className="text-lg leading-relaxed">
              The only way to guarantee you capture all the key growth periods is to be invested 
              when they happen. Since you can't predict when they'll occur, being continuously 
              invested becomes the most reliable strategy.
            </p>
          </div>

          <MissedPeriodsSVG />
        </div>

        {/* Continuous vs Interrupted Growth */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">The Impact of Staying vs Leaving</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Imagine two investors who start at the same time with the same approach. One stays 
              invested continuously. The other periodically exits when they feel uncertain and 
              waits to re-enter when they feel confident again.
            </p>
            <p className="text-lg leading-relaxed">
              Over time, those gaps add up. Every period spent on the sidelines is a period not 
              participating in potential growth. And because the best growth periods are 
              unpredictable, the timer risks being out precisely when the most growth happens.
            </p>
          </div>

          <GrowthPathsSVG />
          
          <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
            <p className="text-amber-800">
              <strong>Important note:</strong> This isn't about whether you can predict markets. 
              It's about whether you need to. The long-term investor simply accepts they can't 
              predict — and builds their approach around that acceptance.
            </p>
          </div>
        </div>

        {/* Two Investors Story */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Two Investors, Different Journeys</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Consider Maya and Raj, two investors who started at the same time with similar goals. 
              Their different approaches led to very different experiences — not just in outcomes, 
              but in their daily lives.
            </p>
          </div>

          <TwoInvestorsSVG />
          
          <div className="mt-6 bg-teal-50 rounded-xl p-5 border border-teal-200">
            <p className="text-teal-800">
              <strong>The real difference:</strong> Maya spent her time living her life. Raj spent 
              his time worrying about markets. Even if their financial outcomes were similar, their 
              life experiences were vastly different.
            </p>
          </div>
        </div>

        {/* The Calm Advantage */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Why Staying Invested Reduces Stress</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Beyond the practical challenges of timing, there's a deeper benefit to staying 
              invested: <strong>peace of mind</strong>.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              When you accept that you can't predict markets, you free yourself from the burden 
              of trying. You don't need to watch every headline, analyze every indicator, or 
              second-guess every decision. Your approach becomes simple: stay invested, stay patient.
            </p>
            <p className="text-lg leading-relaxed">
              The market timer lives with constant questions: "Should I be in? Should I be out? 
              Did I miss the bottom? Is this the top?" The long-term investor has a simpler 
              mental state: "I'm invested. Markets will do what they do."
            </p>
          </div>

          <CalmAdvantageSVG />
        </div>

        {/* Participation Over Prediction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Participation Over Prediction</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              The shift from timing to time is really a shift in mindset — from trying to be 
              <strong> clever</strong> to being <strong>consistent</strong>.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Consistent participation doesn't require special knowledge, advanced tools, or 
              perfect judgment. It just requires the discipline to stay invested through the 
              inevitable ups and downs that all markets experience.
            </p>
            <p className="text-lg leading-relaxed">
              The good news? Consistency is a skill anyone can develop. Prediction is a skill 
              almost no one can master. Choose the game you can actually win.
            </p>
          </div>

          <ParticipationSVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
        </div>

        {/* India-specific Context */}
        <div className="bg-teal-50 rounded-2xl p-6 shadow-lg mb-8 border border-teal-200">
          <h3 className="text-lg font-semibold text-teal-800 mb-3">🌍 Global Perspective</h3>
          <p className="text-teal-900 mb-3">
            The challenge of market timing is universal. Whether you're investing in American 
            markets, European indices, or Indian equities, no one has consistently demonstrated 
            the ability to predict short-term market movements.
          </p>
          <p className="text-teal-800 text-sm">
            In India, many investors have learned this lesson through experience — watching 
            others exit during scary periods only to miss subsequent recoveries. The principle 
            of "time in market" works the same way everywhere: patience and consistency beat 
            prediction and timing.
          </p>
        </div>

        {/* Knowledge Check */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">📝 Knowledge Check</h2>
          <p className="text-gray-600 mb-6">Test your understanding of time in the market vs timing the market.</p>
          
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
            Consider which approach feels more realistic and sustainable for your life:
          </p>
          <div className="bg-white/20 rounded-xl p-5">
            <p className="text-white font-medium mb-2">Ask yourself:</p>
            <ul className="text-teal-100 space-y-2">
              <li>• Have you ever tried to time a decision (in investing or elsewhere) and wished you'd just stayed consistent?</li>
              <li>• When markets drop, would you feel more calm staying invested or trying to predict the bottom?</li>
              <li>• Would you rather spend time analyzing market conditions, or living your life while invested?</li>
              <li>• Which approach honestly feels more sustainable for 20+ years?</li>
            </ul>
          </div>
          <p className="text-teal-200 mt-4 text-sm">
            There's no judgment here — just honest reflection. Most successful long-term investors 
            eventually realize that participation beats prediction.
          </p>
        </div>

        {/* Lesson Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📚 Lesson Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <h4 className="font-semibold text-teal-800 mb-2">What We Learned</h4>
              <ul className="text-teal-700 text-sm space-y-1">
                <li>✓ Time IN market = staying invested continuously</li>
                <li>✓ Timing the market requires two correct predictions</li>
                <li>✓ Key growth periods are unpredictable</li>
                <li>✓ Missing them can significantly impact outcomes</li>
              </ul>
            </div>
            <div className="bg-brand-soft rounded-xl p-4 border border-brand-line">
              <h4 className="font-semibold text-brand mb-2">Key Mindset Shift</h4>
              <ul className="text-brand text-sm space-y-1">
                <li>✓ From prediction to participation</li>
                <li>✓ From cleverness to consistency</li>
                <li>✓ From anxiety to acceptance</li>
                <li>✓ From control to patience</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to="/learn/lti-lesson-2"
            className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Previous: The Power of Compounding</span>
          </Link>
          <button
            onClick={() => navigate('/learn/lti-lesson-4')}
            className="flex items-center gap-2 bg-brand-fill hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <span>Next: Why Simplicity Wins</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
    </StudyShell>
  );
};

export default LTILesson3;
