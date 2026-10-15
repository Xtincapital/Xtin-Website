import React, { useState } from 'react';
import StudyShell from "../../components/StudyShell";
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaSeedling, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';

// SVG 1: The Snowball Effect
const SnowballEffectSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Compounding: The Snowball Effect</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Growth builds on previous growth, getting larger over time</text>
    
    {/* Snowball rolling downhill visualization */}
    <g transform="translate(80, 70)">
      {/* Hill slope */}
      <path d="M0 180 Q270 180 540 40" fill="none" stroke="#E4E4EA" strokeWidth="3"/>
      
      {/* Small snowball - start */}
      <circle cx="30" cy="170" r="12" fill="#E0E7F1" stroke="#9FB3D3" strokeWidth="2"/>
      <text x="30" y="200" textAnchor="middle" fontSize="8" fill="#2C3F5E">Start</text>
      
      {/* Medium-small snowball */}
      <circle cx="130" cy="160" r="18" fill="#C3D0E4" stroke="#7C95C4" strokeWidth="2"/>
      <text x="130" y="200" textAnchor="middle" fontSize="8" fill="#2C3F5E">Year 5</text>
      
      {/* Medium snowball */}
      <circle cx="250" cy="140" r="28" fill="#9FB3D3" stroke="#5A77AA" strokeWidth="2"/>
      <text x="250" y="200" textAnchor="middle" fontSize="8" fill="#2C3F5E">Year 10</text>
      
      {/* Large snowball */}
      <circle cx="380" cy="105" r="42" fill="#7C95C4" stroke="#3E5C8A" strokeWidth="2"/>
      <text x="380" y="200" textAnchor="middle" fontSize="8" fill="#2C3F5E">Year 20</text>
      
      {/* Huge snowball - end */}
      <circle cx="510" cy="55" r="55" fill="#5A77AA" stroke="#344C72" strokeWidth="2"/>
      <text x="510" y="200" textAnchor="middle" fontSize="8" fill="#2C3F5E">Year 30+</text>
      
      {/* Dollar signs growing with snowballs */}
      <text x="30" y="174" textAnchor="middle" fontSize="8" fill="#2C3F5E">$</text>
      <text x="130" y="165" textAnchor="middle" fontSize="12" fill="#2C3F5E">$</text>
      <text x="250" y="147" textAnchor="middle" fontSize="18" fill="white">$</text>
      <text x="380" y="115" textAnchor="middle" fontSize="26" fill="white">$</text>
      <text x="510" y="68" textAnchor="middle" fontSize="36" fill="white">$</text>
    </g>
  </svg>
);

// SVG 2: Linear vs Compound Growth
const LinearVsCompoundSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Linear Growth vs Compound Growth</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Same starting point, dramatically different outcomes</text>
    
    {/* Chart area */}
    <g transform="translate(80, 75)">
      {/* Grid lines */}
      <line x1="0" y1="200" x2="540" y2="200" stroke="#E4E4EA" strokeWidth="1"/>
      <line x1="0" y1="150" x2="540" y2="150" stroke="#E4E4EA" strokeWidth="1" strokeDasharray="4"/>
      <line x1="0" y1="100" x2="540" y2="100" stroke="#E4E4EA" strokeWidth="1" strokeDasharray="4"/>
      <line x1="0" y1="50" x2="540" y2="50" stroke="#E4E4EA" strokeWidth="1" strokeDasharray="4"/>
      <line x1="0" y1="0" x2="0" y2="200" stroke="#E4E4EA" strokeWidth="1"/>
      
      {/* Linear growth line - straight */}
      <path d="M0 180 L540 80" fill="none" stroke="#A0A3AA" strokeWidth="2.5" strokeDasharray="8"/>
      
      {/* Compound growth curve - exponential */}
      <path d="M0 180 Q180 175 300 150 Q420 100 480 40 L540 10" 
            fill="none" stroke="#16A34A" strokeWidth="3"/>
      
      {/* End points */}
      <circle cx="540" cy="80" r="6" fill="#A0A3AA"/>
      <circle cx="540" cy="10" r="8" fill="#16A34A"/>
      
      {/* Gap annotation */}
      <line x1="550" y1="80" x2="550" y2="10" stroke="#B8923F" strokeWidth="2"/>
      <text x="570" y="50" fontSize="9" fill="#654B26" fontWeight="600">The Gap</text>
      
      {/* Time axis labels */}
      <text x="0" y="220" fontSize="8" fill="#717680">Start</text>
      <text x="180" y="220" textAnchor="middle" fontSize="8" fill="#717680">Year 10</text>
      <text x="360" y="220" textAnchor="middle" fontSize="8" fill="#717680">Year 20</text>
      <text x="540" y="220" textAnchor="end" fontSize="8" fill="#717680">Year 30</text>
      
      {/* Legend */}
      <g transform="translate(350, -25)">
        <line x1="0" y1="0" x2="20" y2="0" stroke="#A0A3AA" strokeWidth="2.5" strokeDasharray="5"/>
        <text x="28" y="4" fontSize="9" fill="#717680">Linear (same amount added)</text>
      </g>
      <g transform="translate(350, -8)">
        <line x1="0" y1="0" x2="20" y2="0" stroke="#16A34A" strokeWidth="3"/>
        <text x="28" y="4" fontSize="9" fill="#16A34A">Compound (growth on growth)</text>
      </g>
    </g>
    
    {/* Key insight */}
    <rect x="100" y="285" width="500" height="25" fill="#F0FDF4" rx="6" stroke="#16A34A" strokeWidth="1"/>
    <text x="350" y="302" textAnchor="middle" fontSize="10" fill="#16A34A">The longer the timeline, the bigger the gap between linear and compound growth.</text>
  </svg>
);

// SVG 3: The Hockey Stick Moment
const HockeyStickSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The "Hockey Stick" Moment</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Compounding feels slow, then suddenly accelerates</text>
    
    {/* Chart */}
    <g transform="translate(80, 75)">
      {/* Axes */}
      <line x1="0" y1="180" x2="540" y2="180" stroke="#E4E4EA" strokeWidth="1"/>
      <line x1="0" y1="0" x2="0" y2="180" stroke="#E4E4EA" strokeWidth="1"/>
      
      {/* The hockey stick curve */}
      <path d="M0 170 L80 168 L160 165 L240 158 L320 145 Q400 110 460 50 L540 10" 
            fill="none" stroke="#16A34A" strokeWidth="3"/>
      
      {/* Flat phase annotation */}
      <rect x="30" y="130" width="180" height="35" fill="#F6ECCE" rx="6" stroke="#E2C273" strokeWidth="1"/>
      <text x="120" y="148" textAnchor="middle" fontSize="9" fontWeight="600" fill="#654B26">"Feels Slow" Phase</text>
      <text x="120" y="160" textAnchor="middle" fontSize="8" fill="#533E22">Patience is tested here</text>
      
      {/* Acceleration phase annotation */}
      <rect x="350" y="60" width="150" height="35" fill="#F0FDF4" rx="6" stroke="#16A34A" strokeWidth="1"/>
      <text x="425" y="78" textAnchor="middle" fontSize="9" fontWeight="600" fill="#16A34A">"Sudden Growth" Phase</text>
      <text x="425" y="90" textAnchor="middle" fontSize="8" fill="#16A34A">Patience is rewarded</text>
      
      {/* Arrow pointing to hockey stick bend */}
      <path d="M300 120 Q310 130 320 145" fill="none" stroke="#B8923F" strokeWidth="2" markerEnd="url(#arrowOrange)"/>
      <text x="260" y="115" fontSize="8" fill="#654B26" fontWeight="500">The bend</text>
      
      {/* Time labels */}
      <text x="80" y="200" textAnchor="middle" fontSize="8" fill="#717680">Early Years</text>
      <text x="280" y="200" textAnchor="middle" fontSize="8" fill="#717680">Middle Years</text>
      <text x="480" y="200" textAnchor="middle" fontSize="8" fill="#717680">Later Years</text>
      
      <defs>
        <marker id="arrowOrange" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#B8923F"/>
        </marker>
      </defs>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="265" width="500" height="25" fill="#2A2A2C" rx="6"/>
    <text x="350" y="282" textAnchor="middle" fontSize="10" fill="white">Most people quit during the flat phase. Winners wait for the bend.</text>
  </svg>
);

// SVG 4: Time as the Key Driver
const TimeAsDriverSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Time: The Secret Ingredient</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">With compounding, time matters more than the size of contributions</text>
    
    {/* Three scenarios */}
    <g transform="translate(50, 80)">
      {/* Person A: Started early */}
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="180" height="180" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
        <text x="90" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">Started Early</text>
        
        {/* Growing bar visualization */}
        <rect x="30" y="50" width="30" height="30" fill="#16A34A" rx="4"/>
        <rect x="70" y="40" width="30" height="40" fill="#16A34A" rx="4"/>
        <rect x="110" y="25" width="30" height="55" fill="#16A34A" rx="4"/>
        
        <text x="90" y="105" textAnchor="middle" fontSize="8" fill="#16A34A">Invested for decades</text>
        
        {/* Result */}
        <rect x="20" y="120" width="140" height="45" fill="#16A34A" rx="8"/>
        <text x="90" y="142" textAnchor="middle" fontSize="9" fill="white">Significant wealth</text>
        <text x="90" y="156" textAnchor="middle" fontSize="8" fill="#BBF7D0">Time did the heavy lifting</text>
      </g>
      
      {/* Person B: Started late */}
      <g transform="translate(210, 0)">
        <rect x="0" y="0" width="180" height="180" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
        <text x="90" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#654B26">Started Later</text>
        
        {/* Smaller bars */}
        <rect x="50" y="55" width="30" height="25" fill="#E2C273" rx="4"/>
        <rect x="90" y="48" width="30" height="32" fill="#CDAA5F" rx="4"/>
        
        <text x="90" y="105" textAnchor="middle" fontSize="8" fill="#533E22">Invested for fewer years</text>
        
        {/* Result */}
        <rect x="20" y="120" width="140" height="45" fill="#654B26" rx="8"/>
        <text x="90" y="142" textAnchor="middle" fontSize="9" fill="white">Moderate wealth</text>
        <text x="90" y="156" textAnchor="middle" fontSize="8" fill="#EDD89D">Less time to compound</text>
      </g>
      
      {/* Person C: Started very late */}
      <g transform="translate(420, 0)">
        <rect x="0" y="0" width="180" height="180" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
        <text x="90" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">Started Very Late</text>
        
        {/* Single small bar */}
        <rect x="70" y="58" width="30" height="22" fill="#F09B9B" rx="4"/>
        
        <text x="90" y="105" textAnchor="middle" fontSize="8" fill="#842428">Invested for few years</text>
        
        {/* Result */}
        <rect x="20" y="120" width="140" height="45" fill="#842428" rx="8"/>
        <text x="90" y="142" textAnchor="middle" fontSize="9" fill="white">Limited growth</text>
        <text x="90" y="156" textAnchor="middle" fontSize="8" fill="#F6C3C3">Not enough time</text>
      </g>
    </g>
    
    {/* Key message */}
    <rect x="100" y="270" width="500" height="22" fill="#16A34A" rx="4"/>
    <text x="350" y="285" textAnchor="middle" fontSize="9" fill="white">The best time to start was years ago. The second best time is now.</text>
  </svg>
);

// SVG 5: Growth on Growth Visualization
const GrowthOnGrowthSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">How Compounding Actually Works</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Each layer of growth becomes part of the base for future growth</text>
    
    {/* Stacked layers visualization */}
    <g transform="translate(100, 70)">
      {/* Year 1 */}
      <g transform="translate(0, 0)">
        <rect x="0" y="140" width="80" height="40" fill="#5A77AA" rx="4"/>
        <text x="40" y="165" textAnchor="middle" fontSize="9" fill="white">Original</text>
        <text x="40" y="200" textAnchor="middle" fontSize="8" fill="#717680">Year 1</text>
      </g>
      
      {/* Year 5 */}
      <g transform="translate(120, 0)">
        <rect x="0" y="120" width="80" height="40" fill="#5A77AA" rx="4"/>
        <rect x="0" y="160" width="80" height="20" fill="#16A34A" rx="4"/>
        <text x="40" y="145" textAnchor="middle" fontSize="8" fill="white">Original</text>
        <text x="40" y="175" textAnchor="middle" fontSize="7" fill="white">Growth</text>
        <text x="40" y="200" textAnchor="middle" fontSize="8" fill="#717680">Year 5</text>
      </g>
      
      {/* Year 10 */}
      <g transform="translate(240, 0)">
        <rect x="0" y="90" width="80" height="40" fill="#5A77AA" rx="4"/>
        <rect x="0" y="130" width="80" height="25" fill="#16A34A"/>
        <rect x="0" y="155" width="80" height="25" fill="#16A34A" rx="4"/>
        <text x="40" y="115" textAnchor="middle" fontSize="8" fill="white">Original</text>
        <text x="40" y="145" textAnchor="middle" fontSize="7" fill="white">Growth</text>
        <text x="40" y="170" textAnchor="middle" fontSize="7" fill="white">+ More</text>
        <text x="40" y="200" textAnchor="middle" fontSize="8" fill="#717680">Year 10</text>
      </g>
      
      {/* Year 20 */}
      <g transform="translate(360, 0)">
        <rect x="0" y="50" width="80" height="40" fill="#5A77AA" rx="4"/>
        <rect x="0" y="90" width="80" height="30" fill="#16A34A"/>
        <rect x="0" y="120" width="80" height="30" fill="#16A34A"/>
        <rect x="0" y="150" width="80" height="30" fill="#16A34A" rx="4"/>
        <text x="40" y="75" textAnchor="middle" fontSize="7" fill="white">Original</text>
        <text x="40" y="108" textAnchor="middle" fontSize="6" fill="white">Growth</text>
        <text x="40" y="138" textAnchor="middle" fontSize="6" fill="white">+ More</text>
        <text x="40" y="168" textAnchor="middle" fontSize="6" fill="white">+ Even More</text>
        <text x="40" y="200" textAnchor="middle" fontSize="8" fill="#717680">Year 20</text>
      </g>
      
      {/* Year 30 */}
      <g transform="translate(480, 0)">
        <rect x="0" y="10" width="80" height="35" fill="#5A77AA" rx="4"/>
        <rect x="0" y="45" width="80" height="28" fill="#16A34A"/>
        <rect x="0" y="73" width="80" height="28" fill="#16A34A"/>
        <rect x="0" y="101" width="80" height="28" fill="#16A34A"/>
        <rect x="0" y="129" width="80" height="28" fill="#16A34A"/>
        <rect x="0" y="157" width="80" height="23" fill="#16A34A" rx="4"/>
        <text x="40" y="32" textAnchor="middle" fontSize="6" fill="white">Original</text>
        <text x="40" y="200" textAnchor="middle" fontSize="8" fill="#717680">Year 30</text>
      </g>
    </g>
    
    {/* Legend */}
    <g transform="translate(100, 240)">
      <rect x="0" y="0" width="12" height="12" fill="#5A77AA" rx="2"/>
      <text x="18" y="10" fontSize="8" fill="#717680">Original investment</text>
      <rect x="130" y="0" width="12" height="12" fill="#16A34A" rx="2"/>
      <text x="148" y="10" fontSize="8" fill="#717680">Growth on original</text>
      <rect x="280" y="0" width="12" height="12" fill="#16A34A" rx="2"/>
      <text x="298" y="10" fontSize="8" fill="#717680">Growth on growth (compounding!)</text>
    </g>
  </svg>
);

// SVG 6: Same Contribution, Different Time
const SameContributionSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Same Effort, Different Outcomes</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Starting earlier makes the same contributions go much further</text>
    
    {/* Two scenarios side by side */}
    <g transform="translate(50, 75)">
      {/* Early starter */}
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="280" height="190" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
        <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">Started at Age 25</text>
        
        {/* Timeline with coins */}
        <g transform="translate(20, 50)">
          <line x1="0" y1="30" x2="240" y2="30" stroke="#16A34A" strokeWidth="2"/>
          
          {/* Coins dropping in */}
          <circle cx="20" cy="30" r="8" fill="#CDAA5F" stroke="#B8923F" strokeWidth="1"/>
          <circle cx="60" cy="30" r="8" fill="#CDAA5F" stroke="#B8923F" strokeWidth="1"/>
          <circle cx="100" cy="30" r="8" fill="#CDAA5F" stroke="#B8923F" strokeWidth="1"/>
          <circle cx="140" cy="30" r="8" fill="#CDAA5F" stroke="#B8923F" strokeWidth="1"/>
          <circle cx="180" cy="30" r="8" fill="#CDAA5F" stroke="#B8923F" strokeWidth="1"/>
          <circle cx="220" cy="30" r="8" fill="#CDAA5F" stroke="#B8923F" strokeWidth="1"/>
          
          <text x="0" y="55" fontSize="7" fill="#16A34A">25</text>
          <text x="120" y="55" fontSize="7" fill="#16A34A">45</text>
          <text x="230" y="55" fontSize="7" fill="#16A34A">65</text>
        </g>
        
        {/* Result */}
        <g transform="translate(20, 110)">
          <text x="0" y="0" fontSize="9" fill="#16A34A">40 years of compounding</text>
          <rect x="0" y="15" width="240" height="35" fill="#16A34A" rx="6"/>
          <text x="120" y="38" textAnchor="middle" fontSize="11" fill="white" fontWeight="600">Large Nest Egg</text>
        </g>
      </g>
      
      {/* Late starter */}
      <g transform="translate(320, 0)">
        <rect x="0" y="0" width="280" height="190" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
        <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#654B26">Started at Age 45</text>
        
        {/* Timeline with coins */}
        <g transform="translate(20, 50)">
          <line x1="0" y1="30" x2="240" y2="30" stroke="#B8923F" strokeWidth="2"/>
          
          {/* Coins dropping in - fewer years */}
          <rect x="0" y="25" width="100" height="10" fill="#E4E4EA" rx="2"/>
          <text x="50" y="18" textAnchor="middle" fontSize="7" fill="#A0A3AA">No investing</text>
          
          <circle cx="120" cy="30" r="8" fill="#CDAA5F" stroke="#B8923F" strokeWidth="1"/>
          <circle cx="160" cy="30" r="8" fill="#CDAA5F" stroke="#B8923F" strokeWidth="1"/>
          <circle cx="200" cy="30" r="8" fill="#CDAA5F" stroke="#B8923F" strokeWidth="1"/>
          
          <text x="0" y="55" fontSize="7" fill="#533E22">25</text>
          <text x="120" y="55" fontSize="7" fill="#533E22">45</text>
          <text x="230" y="55" fontSize="7" fill="#533E22">65</text>
        </g>
        
        {/* Result */}
        <g transform="translate(20, 110)">
          <text x="0" y="0" fontSize="9" fill="#533E22">20 years of compounding</text>
          <rect x="0" y="15" width="140" height="35" fill="#654B26" rx="6"/>
          <text x="70" y="38" textAnchor="middle" fontSize="11" fill="white" fontWeight="600">Smaller Nest Egg</text>
        </g>
      </g>
    </g>
    
    {/* Key message */}
    <rect x="100" y="270" width="500" height="22" fill="#2A2A2C" rx="4"/>
    <text x="350" y="285" textAnchor="middle" fontSize="9" fill="white">Same monthly effort. Different starting points. Vastly different outcomes.</text>
  </svg>
);

// SVG 7: Patience as Multiplier
const PatienceMultiplierSVG = () => (
  <svg viewBox="0 0 700 240" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="240" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Patience: Your Multiplier</text>
    
    {/* The equation visualization */}
    <g transform="translate(80, 60)">
      {/* Box 1: Your Investment */}
      <g transform="translate(0, 30)">
        <rect x="0" y="0" width="120" height="80" fill="#E0E7F1" rx="10" stroke="#9FB3D3" strokeWidth="2"/>
        <text x="60" y="35" textAnchor="middle" fontSize="10" fontWeight="600" fill="#2C3F5E">Your</text>
        <text x="60" y="52" textAnchor="middle" fontSize="10" fontWeight="600" fill="#2C3F5E">Investment</text>
        <text x="60" y="70" textAnchor="middle" fontSize="20" fill="#5A77AA">💰</text>
      </g>
      
      {/* Plus sign */}
      <text x="145" y="80" fontSize="24" fill="#717680">+</text>
      
      {/* Box 2: Time */}
      <g transform="translate(170, 30)">
        <rect x="0" y="0" width="120" height="80" fill="#F6ECCE" rx="10" stroke="#E2C273" strokeWidth="2"/>
        <text x="60" y="35" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B26">Time</text>
        <text x="60" y="52" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B26">(Years)</text>
        <text x="60" y="70" textAnchor="middle" fontSize="20" fill="#B8923F">⏰</text>
      </g>
      
      {/* Plus sign */}
      <text x="315" y="80" fontSize="24" fill="#717680">+</text>
      
      {/* Box 3: Patience */}
      <g transform="translate(340, 30)">
        <rect x="0" y="0" width="120" height="80" fill="#ECE4F6" rx="10" stroke="#C0A9E2" strokeWidth="2"/>
        <text x="60" y="35" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B8A">Patience</text>
        <text x="60" y="52" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B8A">(Staying In)</text>
        <text x="60" y="70" textAnchor="middle" fontSize="20" fill="#8F6FC4">🧘</text>
      </g>
      
      {/* Equals sign */}
      <text x="485" y="80" fontSize="24" fill="#717680">=</text>
      
      {/* Box 4: Result */}
      <g transform="translate(510, 20)">
        <rect x="0" y="0" width="130" height="100" fill="#16A34A" rx="10"/>
        <text x="65" y="35" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">Compound</text>
        <text x="65" y="52" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">Growth</text>
        <text x="65" y="80" textAnchor="middle" fontSize="26" fill="white">📈</text>
      </g>
    </g>
    
    {/* Note */}
    <text x="350" y="190" textAnchor="middle" fontSize="10" fill="#717680">Remove any one ingredient and the magic weakens.</text>
    <text x="350" y="210" textAnchor="middle" fontSize="10" fontWeight="500" fill="#16A34A">Patience is the hardest to maintain — and the most rewarding.</text>
  </svg>
);

// SVG 8: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 140" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="140" fill="url(#takeawayGrad2)" rx="16"/>
    
    <defs>
      <linearGradient id="takeawayGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#16A34A"/>
        <stop offset="100%" stopColor="#2A8C9A"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="40" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">🌱 Key Takeaway</text>
    <text x="350" y="70" textAnchor="middle" fontSize="12" fill="white">Compounding is simple: growth builds on previous growth.</text>
    <text x="350" y="95" textAnchor="middle" fontSize="12" fill="white">But it needs time to work its magic.</text>
    <text x="350" y="125" textAnchor="middle" fontSize="11" fill="#BBF7D0">The earlier you start, the longer time works for you.</text>
  </svg>
);

const LTILesson2 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const quizQuestions = [
    {
      id: 1,
      question: "What makes compound growth different from linear growth?",
      options: [
        "Compound growth uses more money",
        "Compound growth means your growth generates its own growth",
        "Linear growth is always faster",
        "They are the same thing with different names"
      ],
      correct: 1,
      explanation: "Compound growth is unique because each period's growth becomes part of the base for future growth — your gains generate their own gains over time."
    },
    {
      id: 2,
      question: "Why does compounding feel slow at first but accelerate later?",
      options: [
        "Because banks change their policies over time",
        "Because the economy gets better over time",
        "Because the base keeps growing, so the same rate produces larger absolute gains",
        "Because you invest more money later"
      ],
      correct: 2,
      explanation: "As your investment grows, the same growth rate applies to a larger base, producing increasingly larger gains — this is why the curve accelerates over time."
    }
  ];

  const handleAnswer = (questionId, answerIndex) => {
    setQuizAnswers({ ...quizAnswers, [questionId]: answerIndex });
    setShowResults({ ...showResults, [questionId]: true });
  };

  return (
    <StudyShell module="LongTermInvesting" lessonNumber={2}>
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
                Lesson 2 of 7
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-2 tracking-[-0.025em]">The Power of Compounding</h1>
            <p className="text-gray-600 text-lg">
              Understanding how small growth, repeated over time, becomes extraordinary.
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.025em]">Why Compounding Feels Slow at First</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              If you've ever tried to grow something — a savings account, a skill, or even a garden — 
              you've probably experienced this frustration: <strong>early progress feels painfully slow</strong>.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              You put in effort, day after day, and the results seem barely visible. You might wonder 
              if it's even working. This is exactly how compounding feels in the early years — and 
              it's why so many people give up too soon.
            </p>
            <p className="text-lg leading-relaxed">
              But here's what most people miss: <strong>compounding is designed to feel slow at first</strong>. 
              The magic isn't in the early stages — it's in what happens later. Understanding this 
              changes everything about how you approach long-term wealth building.
            </p>
          </div>
        </div>

        {/* The Snowball Effect */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">The Snowball Effect</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Imagine rolling a small snowball down a snowy hill. At first, it's tiny and moves slowly. 
              But as it rolls, it picks up more snow. The bigger it gets, the more snow it can pick up 
              with each revolution. Eventually, what started as a handful of snow becomes a boulder.
            </p>
            <p className="text-lg leading-relaxed">
              This is compounding. Your wealth works the same way — small in the beginning, but 
              continuously gathering "more snow" as it grows. The key is to keep it rolling.
            </p>
          </div>

          <SnowballEffectSVG />
        </div>

        {/* Core Explanation: What Compounding Means */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">What Compounding Actually Means</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              At its core, compounding is beautifully simple: <strong>it's growth on growth</strong>.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              When you invest, your money grows. That growth then becomes part of your base. 
              The next period, you earn growth not just on your original investment, but also 
              on the previous growth. Then that combined growth becomes your new base. And so on.
            </p>
            <p className="text-lg leading-relaxed">
              Each layer of growth becomes the foundation for future growth. Over time, the 
              "growth on growth" portion can become larger than your original investment ever was.
            </p>
          </div>

          <GrowthOnGrowthSVG />
          
          <div className="mt-6 bg-teal-50 rounded-xl p-5 border border-teal-200">
            <p className="text-teal-800">
              <strong>The key insight:</strong> In the later stages of compounding, most of your 
              wealth isn't from what you put in — it's from growth that generated more growth.
            </p>
          </div>
        </div>

        {/* Linear vs Compound Growth */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Linear Growth vs Compound Growth</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              To truly appreciate compounding, compare it to linear growth — where you add the 
              same amount each period without any growth on previous gains.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Linear growth is like climbing stairs at a steady pace. You make the same progress 
              each step. Predictable. Steady. But ultimately limited.
            </p>
            <p className="text-lg leading-relaxed">
              Compound growth is like those stairs getting taller as you climb. Each step lifts 
              you higher than the last. Early on, the difference seems small. But over decades, 
              the gap becomes enormous.
            </p>
          </div>

          <LinearVsCompoundSVG />
        </div>

        {/* The Hockey Stick Moment */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">The Hockey Stick Moment</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              If you plot compound growth over time, it creates a distinctive shape that 
              investors call the "hockey stick." The handle is flat and long — representing 
              years of seemingly slow progress. Then comes the blade — where growth suddenly 
              seems to accelerate.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Here's the truth: <strong>the growth rate hasn't actually changed</strong>. 
              What changed is the size of the base it's working with. When your base is small, 
              even good growth produces small absolute gains. When your base is large, the same 
              rate produces much larger gains.
            </p>
            <p className="text-lg leading-relaxed">
              Most people who give up on long-term investing quit during the "handle" phase, 
              never experiencing the "blade" that their patience would have earned them.
            </p>
          </div>

          <HockeyStickSVG />
        </div>

        {/* Why Time Matters More Than Speed */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Why Time Matters More Than Speed</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Many people focus on finding the "best" investment that grows the fastest. But 
              with compounding, <strong>time in the market typically matters more than the 
              rate of growth</strong>.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              A slightly slower growth rate over a longer period often produces more wealth 
              than a faster rate over a shorter period. This is counterintuitive, but it's 
              how compounding works.
            </p>
            <p className="text-lg leading-relaxed">
              The implication is powerful: you don't need to find the perfect investment or 
              time the market perfectly. You need to start early and stay invested. Time is 
              the secret ingredient that makes everything else work.
            </p>
          </div>

          <TimeAsDriverSVG />
        </div>

        {/* Why Early Patience Pays Off Later */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Why Early Patience Pays Off Later</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Every year you wait to start investing isn't just one year lost — it's a year 
              of compounding that your future self won't have. And because compounding 
              accelerates over time, the later years are worth more than the early ones.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              This creates a paradox: the early years feel the least rewarding, but they're 
              actually the most valuable. The patience you show when results are small creates 
              the foundation for results that will eventually be large.
            </p>
            <p className="text-lg leading-relaxed">
              Think of it this way: early patience is an investment in your future compounding 
              power. Every year of patience adds another potential doubling to your wealth's future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">🕐 The Hard Truth</h4>
              <p className="text-amber-700 text-sm">
                You can't recover lost time. Waiting five years to start doesn't just delay 
                your timeline — it permanently reduces your compounding potential.
              </p>
            </div>
            <div className="bg-brand-soft rounded-xl p-5 border border-brand-line">
              <h4 className="font-semibold text-brand mb-2">✨ The Bright Side</h4>
              <p className="text-brand text-sm">
                If you start now, you begin building compounding power immediately. Every 
                day invested is a day working toward that hockey stick moment.
              </p>
            </div>
          </div>
        </div>

        {/* Practical Example */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Same Effort, Different Outcomes</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Imagine two people who contribute the same amount to their investments each month. 
              Same effort. Same discipline. The only difference is when they started.
            </p>
            <p className="text-lg leading-relaxed">
              The person who started earlier has more time for compounding to work. Their money 
              has more years to grow, and more years for that growth to generate its own growth. 
              By retirement age, the difference between them can be substantial — not because 
              of different effort, but because of different timing.
            </p>
          </div>

          <SameContributionSVG />
          
          <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
            <p className="text-amber-800">
              <strong>Important:</strong> This isn't about making late starters feel bad. If 
              you're starting later, you're still better off than never starting. The lesson 
              is simply: don't delay further. Start where you are, with what you have.
            </p>
          </div>
        </div>

        {/* Patience as Multiplier */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Patience: Your Secret Multiplier</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Compounding requires three ingredients: your investment, time, and patience. 
              Remove any one, and the magic weakens significantly.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Your investment is the seed. Time is the soil and sunlight. But patience — the 
              ability to stay invested through boring periods, scary periods, and tempting 
              periods — is what allows the other two to work.
            </p>
            <p className="text-lg leading-relaxed">
              Most people can find money to invest. Time passes whether we like it or not. 
              But patience is a choice, made daily, for years and decades. It's the hardest 
              ingredient — and the one that separates successful long-term investors from everyone else.
            </p>
          </div>

          <PatienceMultiplierSVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
        </div>

        {/* India-specific Context */}
        <div className="bg-teal-50 rounded-2xl p-6 shadow-lg mb-8 border border-teal-200">
          <h3 className="text-lg font-semibold text-teal-800 mb-3">🌍 Global Perspective</h3>
          <p className="text-teal-900 mb-3">
            Compounding works the same way everywhere in the world — whether you're investing 
            in American index funds, European equities, or Indian mutual funds. The mathematical 
            principle is universal: growth on growth, given enough time, produces extraordinary results.
          </p>
          <p className="text-teal-800 text-sm">
            In India, many investors have experienced the power of compounding through SIPs 
            (Systematic Investment Plans) over the past decades. The same principle that built 
            wealth for Indian investors works identically for investors anywhere in the world.
          </p>
        </div>

        {/* Knowledge Check */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">📝 Knowledge Check</h2>
          <p className="text-gray-600 mb-6">Test your understanding of compounding concepts.</p>
          
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
            Now that you understand compounding, consider how it changes your perspective:
          </p>
          <div className="bg-white/20 rounded-xl p-5">
            <p className="text-white font-medium mb-2">Think about:</p>
            <ul className="text-teal-100 space-y-2">
              <li>• Have you been expecting your investments to grow in a straight line?</li>
              <li>• How does knowing about the "hockey stick" change your patience level?</li>
              <li>• What would it mean for you to start now versus waiting another few years?</li>
              <li>• How might understanding compounding help you during market downturns?</li>
            </ul>
          </div>
          <p className="text-teal-200 mt-4 text-sm">
            Understanding compounding intellectually is one thing. Believing it emotionally — 
            enough to stay patient for decades — is the real challenge.
          </p>
        </div>

        {/* Lesson Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📚 Lesson Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <h4 className="font-semibold text-teal-800 mb-2">What We Learned</h4>
              <ul className="text-teal-700 text-sm space-y-1">
                <li>✓ Compounding is growth on growth</li>
                <li>✓ It starts slow but accelerates over time</li>
                <li>✓ Time matters more than growth rate</li>
                <li>✓ Early patience creates later abundance</li>
              </ul>
            </div>
            <div className="bg-brand-soft rounded-xl p-4 border border-brand-line">
              <h4 className="font-semibold text-brand mb-2">Key Mindset Shift</h4>
              <ul className="text-brand text-sm space-y-1">
                <li>✓ Expect slow progress early</li>
                <li>✓ Trust the hockey stick will come</li>
                <li>✓ Value time over timing</li>
                <li>✓ See patience as an investment</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to="/learn/lti-lesson-1"
            className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Previous: What Is Long-Term Investing?</span>
          </Link>
          <button
            onClick={() => navigate('/learn/lti-lesson-3')}
            className="flex items-center gap-2 bg-brand-fill hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <span>Next: Time in Market vs Timing</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
    </StudyShell>
  );
};

export default LTILesson2;
