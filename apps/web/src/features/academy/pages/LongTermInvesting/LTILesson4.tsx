import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaSeedling, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

// SVG 1: What Volatility Looks Like
const VolatilityVisualizationSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">What Volatility Actually Looks Like</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Markets rarely move in straight lines — they zigzag constantly</text>
    
    {/* Chart area */}
    <g transform="translate(60, 75)">
      {/* Grid lines */}
      <line x1="0" y1="0" x2="580" y2="0" stroke="#E4E4EA" strokeWidth="1" strokeDasharray="4"/>
      <line x1="0" y1="60" x2="580" y2="60" stroke="#E4E4EA" strokeWidth="1" strokeDasharray="4"/>
      <line x1="0" y1="120" x2="580" y2="120" stroke="#E4E4EA" strokeWidth="1" strokeDasharray="4"/>
      <line x1="0" y1="160" x2="580" y2="160" stroke="#E4E4EA" strokeWidth="1"/>
      
      {/* Volatile price path */}
      <path d="M0 140 
               L20 130 L40 145 L60 125 L80 140 L100 115 
               L120 130 L140 105 L160 125 L180 95 L200 110 
               L220 85 L240 105 L260 75 L280 95 L300 70 
               L320 90 L340 65 L360 85 L380 55 L400 75 
               L420 50 L440 70 L460 45 L480 60 L500 35 
               L520 55 L540 30 L560 50 L580 25" 
            fill="none" stroke="#2A8C9A" strokeWidth="2.5"/>
      
      {/* Annotation arrows showing up/down movements */}
      <g transform="translate(100, 100)">
        <path d="M0 0 L0 -20" stroke="#E04848" strokeWidth="2" markerEnd="url(#arrowDown)"/>
        <text x="15" y="-8" fontSize="8" fill="#E04848">down</text>
      </g>
      <g transform="translate(180, 80)">
        <path d="M0 0 L0 20" stroke="#12805A" strokeWidth="2"/>
        <text x="15" y="12" fontSize="8" fill="#12805A">up</text>
      </g>
      <g transform="translate(280, 75)">
        <path d="M0 0 L0 -15" stroke="#E04848" strokeWidth="2"/>
        <text x="15" y="-5" fontSize="8" fill="#E04848">down</text>
      </g>
      <g transform="translate(380, 50)">
        <path d="M0 0 L0 18" stroke="#12805A" strokeWidth="2"/>
        <text x="15" y="10" fontSize="8" fill="#12805A">up</text>
      </g>
      
      {/* Time labels */}
      <text x="0" y="180" fontSize="8" fill="#717680">Start</text>
      <text x="290" y="180" textAnchor="middle" fontSize="8" fill="#717680">Time passes</text>
      <text x="580" y="180" textAnchor="end" fontSize="8" fill="#717680">Now</text>
    </g>
    
    {/* Key insight */}
    <rect x="100" y="245" width="500" height="25" fill="#2A8C9A" rx="6"/>
    <text x="350" y="262" textAnchor="middle" fontSize="9" fill="white">This is normal. Every day, week, and month brings movement — up and down.</text>
  </svg>
);

// SVG 2: Noise vs Trend
const NoiseVsTrendSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Short-Term Noise vs Long-Term Direction</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Zoom out to see what really matters</text>
    
    {/* Left: Short-term view (zoomed in) */}
    <g transform="translate(40, 75)">
      <rect x="0" y="0" width="280" height="200" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="1"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">🔍 Zoomed In (Short-Term)</text>
      
      {/* Volatile short section */}
      <g transform="translate(20, 50)">
        <line x1="0" y1="120" x2="240" y2="120" stroke="#E4E4EA" strokeWidth="1"/>
        
        <path d="M0 80 L30 60 L60 90 L90 50 L120 85 L150 40 L180 75 L210 55 L240 70" 
              fill="none" stroke="#E04848" strokeWidth="2"/>
        
        <text x="120" y="145" textAnchor="middle" fontSize="9" fill="#842428">Feels chaotic and scary</text>
      </g>
      
      <g transform="translate(30, 175)">
        <text x="0" y="0" fontSize="8" fill="#C7363B">• Big swings visible</text>
        <text x="120" y="0" fontSize="8" fill="#C7363B">• Direction unclear</text>
      </g>
    </g>
    
    {/* Right: Long-term view (zoomed out) */}
    <g transform="translate(380, 75)">
      <rect x="0" y="0" width="280" height="200" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="1"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">🌍 Zoomed Out (Long-Term)</text>
      
      {/* Smooth upward trend */}
      <g transform="translate(20, 50)">
        <line x1="0" y1="120" x2="240" y2="120" stroke="#E4E4EA" strokeWidth="1"/>
        
        {/* Underlying trend line */}
        <path d="M0 100 Q120 60 240 20" fill="none" stroke="#12805A" strokeWidth="3"/>
        
        {/* Small noise around trend */}
        <path d="M0 102 L20 98 L40 105 L60 90 L80 95 L100 82 L120 88 L140 70 L160 75 L180 58 L200 62 L220 45 L240 22" 
              fill="none" stroke="#12805A" strokeWidth="1.5" strokeDasharray="3"/>
        
        <text x="120" y="145" textAnchor="middle" fontSize="9" fill="#12805A">Clear upward direction</text>
      </g>
      
      <g transform="translate(30, 175)">
        <text x="0" y="0" fontSize="8" fill="#12805A">• Trend visible</text>
        <text x="120" y="0" fontSize="8" fill="#12805A">• Noise fades away</text>
      </g>
    </g>
    
    {/* Arrow between views */}
    <text x="350" y="175" textAnchor="middle" fontSize="24" fill="#717680">→</text>
    
    {/* Bottom insight */}
    <rect x="100" y="285" width="500" height="25" fill="#12805A" rx="6"/>
    <text x="350" y="302" textAnchor="middle" fontSize="9" fill="white">The daily ups and downs that feel huge are just tiny ripples in the bigger picture.</text>
  </svg>
);

// SVG 3: Volatility as Cost of Growth
const CostOfGrowthSVG = () => (
  <svg viewBox="0 0 700 260" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="260" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Volatility Is the "Price of Admission"</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">To access long-term growth, you must accept short-term movement</text>
    
    {/* Visual metaphor: Ticket */}
    <g transform="translate(100, 70)">
      {/* Ticket shape */}
      <rect x="0" y="0" width="500" height="140" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
      
      {/* Perforated line */}
      <line x1="380" y1="0" x2="380" y2="140" stroke="#E2C273" strokeWidth="2" strokeDasharray="8 4"/>
      
      {/* Left side - What you pay */}
      <g transform="translate(30, 25)">
        <text x="0" y="0" fontSize="11" fontWeight="600" fill="#654B26">🎫 ADMISSION TICKET</text>
        <text x="0" y="25" fontSize="10" fill="#533E22">What You Accept:</text>
        <text x="0" y="45" fontSize="9" fill="#533E22">• Days when value drops</text>
        <text x="0" y="62" fontSize="9" fill="#533E22">• Weeks of uncertainty</text>
        <text x="0" y="79" fontSize="9" fill="#533E22">• Occasional scary headlines</text>
        <text x="0" y="96" fontSize="9" fill="#533E22">• Emotional discomfort</text>
      </g>
      
      {/* Right side - What you get */}
      <g transform="translate(400, 25)">
        <text x="0" y="0" fontSize="10" fontWeight="600" fill="#12805A">What You Access:</text>
        <text x="0" y="25" fontSize="9" fill="#12805A">Long-term</text>
        <text x="0" y="42" fontSize="9" fill="#12805A">wealth</text>
        <text x="0" y="59" fontSize="9" fill="#12805A">building</text>
        <text x="0" y="85" fontSize="12" fill="#12805A">📈 Growth</text>
      </g>
    </g>
    
    {/* Bottom message */}
    <text x="350" y="235" textAnchor="middle" fontSize="10" fill="#717680">You can't have the reward without accepting the cost. That's how investing works.</text>
  </svg>
);

// SVG 4: Why Markets Move
const WhyMarketsMoveSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Why Do Markets Move So Much?</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Markets reflect millions of opinions changing constantly</text>
    
    {/* Central market */}
    <g transform="translate(280, 90)">
      <circle cx="70" cy="70" r="50" fill="#2A8C9A" opacity="0.2"/>
      <circle cx="70" cy="70" r="35" fill="#2A8C9A" opacity="0.4"/>
      <circle cx="70" cy="70" r="20" fill="#2A8C9A"/>
      <text x="70" y="75" textAnchor="middle" fontSize="9" fill="white" fontWeight="600">MARKET</text>
    </g>
    
    {/* Incoming forces - left side */}
    <g transform="translate(60, 100)">
      <rect x="0" y="0" width="150" height="80" fill="#FDF1F1" rx="8"/>
      <text x="75" y="20" textAnchor="middle" fontSize="9" fontWeight="500" fill="#C7363B">Forces Pushing Down</text>
      <text x="75" y="38" textAnchor="middle" fontSize="8" fill="#842428">• Fear and worry</text>
      <text x="75" y="52" textAnchor="middle" fontSize="8" fill="#842428">• Bad news</text>
      <text x="75" y="66" textAnchor="middle" fontSize="8" fill="#842428">• Sellers wanting out</text>
      
      <path d="M150 40 L220 70" stroke="#E04848" strokeWidth="2" markerEnd="url(#arrowRed)"/>
    </g>
    
    {/* Incoming forces - right side */}
    <g transform="translate(490, 100)">
      <rect x="0" y="0" width="150" height="80" fill="#EEF9F4" rx="8"/>
      <text x="75" y="20" textAnchor="middle" fontSize="9" fontWeight="500" fill="#12805A">Forces Pushing Up</text>
      <text x="75" y="38" textAnchor="middle" fontSize="8" fill="#12805A">• Hope and optimism</text>
      <text x="75" y="52" textAnchor="middle" fontSize="8" fill="#12805A">• Good news</text>
      <text x="75" y="66" textAnchor="middle" fontSize="8" fill="#12805A">• Buyers wanting in</text>
      
      <path d="M0 40 L-70 70" stroke="#12805A" strokeWidth="2" markerEnd="url(#arrowGreen)"/>
    </g>
    
    {/* Result */}
    <g transform="translate(200, 210)">
      <rect x="0" y="0" width="300" height="50" fill="#EEEEF1" rx="10" stroke="#A0A3AA" strokeWidth="1"/>
      <text x="150" y="22" textAnchor="middle" fontSize="10" fontWeight="500" fill="#373A41">The Result: Constant Push and Pull</text>
      <text x="150" y="40" textAnchor="middle" fontSize="9" fill="#717680">This creates the daily movement we call "volatility"</text>
    </g>
  </svg>
);

// SVG 5: Two Investors During Volatility
const TwoInvestorsSVG = () => (
  <svg viewBox="0 0 700 360" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="360" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Two Investors Face the Same Volatility</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Same market conditions, different responses, different outcomes</text>
    
    {/* Market line showing volatility */}
    <g transform="translate(100, 70)">
      <text x="250" y="0" textAnchor="middle" fontSize="9" fill="#717680">Market Movement Over Time</text>
      <rect x="0" y="10" width="500" height="60" fill="#EEEEF1" rx="6"/>
      <path d="M10 45 L50 35 L90 50 L130 30 L170 55 L210 25 L250 45 L290 20 L330 40 L370 15 L410 35 L450 18 L490 30" 
            fill="none" stroke="#717680" strokeWidth="2"/>
      
      {/* Drop annotation */}
      <rect x="160" y="45" width="60" height="20" fill="#FDF1F1" rx="4"/>
      <text x="190" y="59" textAnchor="middle" fontSize="7" fill="#C7363B">Drop happens</text>
    </g>
    
    {/* Investor A: Stays */}
    <g transform="translate(50, 155)">
      <rect x="0" y="0" width="280" height="170" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">🧘 Priya: Stays Invested</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="9" fill="#12805A" fontWeight="500">When the drop happens:</text>
        <text x="0" y="18" fontSize="9" fill="#12805A">• Acknowledges the discomfort</text>
        <text x="0" y="34" fontSize="9" fill="#12805A">• Remembers volatility is normal</text>
        <text x="0" y="50" fontSize="9" fill="#12805A">• Takes no action</text>
        <text x="0" y="66" fontSize="9" fill="#12805A">• Continues with life</text>
      </g>
      
      <rect x="20" y="125" width="240" height="32" fill="#12805A" rx="6"/>
      <text x="140" y="140" textAnchor="middle" fontSize="9" fill="white">Result: Still invested when recovery</text>
      <text x="140" y="152" textAnchor="middle" fontSize="9" fill="white">comes. Captures the rebound.</text>
    </g>
    
    {/* Investor B: Exits */}
    <g transform="translate(370, 155)">
      <rect x="0" y="0" width="280" height="170" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">😰 Arjun: Exits During Drop</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="9" fill="#842428" fontWeight="500">When the drop happens:</text>
        <text x="0" y="18" fontSize="9" fill="#842428">• Panics at the decline</text>
        <text x="0" y="34" fontSize="9" fill="#842428">• Sells to "stop the bleeding"</text>
        <text x="0" y="50" fontSize="9" fill="#842428">• Waits for "things to calm down"</text>
        <text x="0" y="66" fontSize="9" fill="#842428">• Re-enters much later (or never)</text>
      </g>
      
      <rect x="20" y="125" width="240" height="32" fill="#C7363B" rx="6"/>
      <text x="140" y="140" textAnchor="middle" fontSize="9" fill="white">Result: Locked in losses. Missed</text>
      <text x="140" y="152" textAnchor="middle" fontSize="9" fill="white">recovery. Must start over.</text>
    </g>
  </svg>
);

// SVG 6: Emotional Reactions vs Disciplined Holding
const EmotionalVsDisciplinedSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Emotional Reactions vs Disciplined Response</text>
    
    {/* Market line */}
    <g transform="translate(60, 60)">
      <path d="M0 100 L80 85 L160 110 L240 70 L320 95 L400 55 L480 80 L560 45" 
            fill="none" stroke="#717680" strokeWidth="2"/>
      
      {/* Emotional investor reactions */}
      <g transform="translate(80, 75)">
        <circle cx="0" cy="0" r="15" fill="#FDF1F1" stroke="#E04848" strokeWidth="2"/>
        <text x="0" y="4" textAnchor="middle" fontSize="10">😟</text>
        <text x="0" y="35" textAnchor="middle" fontSize="7" fill="#C7363B">"It's falling!"</text>
      </g>
      
      <g transform="translate(160, 100)">
        <circle cx="0" cy="0" r="15" fill="#EEF9F4" stroke="#12805A" strokeWidth="2"/>
        <text x="0" y="4" textAnchor="middle" fontSize="10">😊</text>
        <text x="0" y="35" textAnchor="middle" fontSize="7" fill="#12805A">"Going up!"</text>
      </g>
      
      <g transform="translate(240, 60)">
        <circle cx="0" cy="0" r="15" fill="#FDF1F1" stroke="#E04848" strokeWidth="2"/>
        <text x="0" y="4" textAnchor="middle" fontSize="10">😰</text>
        <text x="0" y="35" textAnchor="middle" fontSize="7" fill="#C7363B">"I should sell!"</text>
      </g>
      
      <g transform="translate(320, 85)">
        <circle cx="0" cy="0" r="15" fill="#F6ECCE" stroke="#B8923F" strokeWidth="2"/>
        <text x="0" y="4" textAnchor="middle" fontSize="10">😕</text>
        <text x="0" y="35" textAnchor="middle" fontSize="7" fill="#654B26">"Uncertain..."</text>
      </g>
      
      <g transform="translate(400, 45)">
        <circle cx="0" cy="0" r="15" fill="#EEF9F4" stroke="#12805A" strokeWidth="2"/>
        <text x="0" y="4" textAnchor="middle" fontSize="10">😃</text>
        <text x="0" y="35" textAnchor="middle" fontSize="7" fill="#12805A">"All-time high!"</text>
      </g>
    </g>
    
    {/* Disciplined investor */}
    <g transform="translate(60, 200)">
      <rect x="0" y="0" width="580" height="70" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <g transform="translate(30, 20)">
        <circle cx="0" cy="15" r="20" fill="#12805A"/>
        <text x="0" y="20" textAnchor="middle" fontSize="14" fill="white">😌</text>
      </g>
      <g transform="translate(80, 15)">
        <text x="0" y="0" fontSize="11" fontWeight="600" fill="#12805A">The Disciplined Long-Term Investor</text>
        <text x="0" y="20" fontSize="9" fill="#12805A">"Markets move. That's what they do. I'm in this for the long term."</text>
        <text x="0" y="40" fontSize="9" fill="#12805A">Same response at every point — calm, patient, consistent.</text>
      </g>
    </g>
  </svg>
);

// SVG 7: Volatility Over Different Time Frames
const TimeFramesSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">How Time Changes Your View of Volatility</text>
    
    {/* Daily View */}
    <g transform="translate(50, 55)">
      <rect x="0" y="0" width="180" height="120" fill="#FDF1F1" rx="10" stroke="#F09B9B" strokeWidth="1"/>
      <text x="90" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">📅 Daily View</text>
      
      <g transform="translate(20, 40)">
        <path d="M0 40 L20 25 L40 50 L60 20 L80 55 L100 15 L120 45 L140 30" 
              fill="none" stroke="#E04848" strokeWidth="2"/>
      </g>
      
      <text x="90" y="105" textAnchor="middle" fontSize="8" fill="#842428">Scary! Feels like chaos.</text>
    </g>
    
    {/* Monthly View */}
    <g transform="translate(260, 55)">
      <rect x="0" y="0" width="180" height="120" fill="#F6ECCE" rx="10" stroke="#E2C273" strokeWidth="1"/>
      <text x="90" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B26">📆 Monthly View</text>
      
      <g transform="translate(20, 40)">
        <path d="M0 50 L35 45 L70 40 L105 32 L140 28" 
              fill="none" stroke="#B8923F" strokeWidth="2"/>
      </g>
      
      <text x="90" y="105" textAnchor="middle" fontSize="8" fill="#533E22">Some ups and downs, but clearer.</text>
    </g>
    
    {/* Yearly View */}
    <g transform="translate(470, 55)">
      <rect x="0" y="0" width="180" height="120" fill="#EEF9F4" rx="10" stroke="#3CCB97" strokeWidth="1"/>
      <text x="90" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#12805A">📈 Years View</text>
      
      <g transform="translate(20, 40)">
        <path d="M0 55 Q70 35 140 15" fill="none" stroke="#12805A" strokeWidth="3"/>
      </g>
      
      <text x="90" y="105" textAnchor="middle" fontSize="8" fill="#12805A">Clear trend. Noise disappears.</text>
    </g>
    
    {/* Key insight */}
    <g transform="translate(50, 195)">
      <rect x="0" y="0" width="600" height="60" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <text x="300" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">The Key Insight</text>
      <text x="300" y="45" textAnchor="middle" fontSize="10" fill="#12805A">Volatility looks terrifying up close but almost invisible from far away.</text>
    </g>
    
    {/* Practical takeaway */}
    <g transform="translate(50, 275)">
      <rect x="0" y="0" width="600" height="50" fill="#2A8C9A" rx="10"/>
      <text x="300" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">Your Practical Takeaway</text>
      <text x="300" y="40" textAnchor="middle" fontSize="9" fill="#ABE5CC">Train yourself to see with "years view" eyes. That's where your money lives.</text>
    </g>
  </svg>
);

// SVG 8: The Reassurance Framework
const ReassuranceSVG = () => (
  <svg viewBox="0 0 700 260" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="260" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">When Volatility Feels Scary: A Grounding Framework</text>
    
    {/* Four reassurances */}
    <g transform="translate(50, 55)">
      <rect x="0" y="0" width="140" height="160" fill="#E0E7F1" rx="10" stroke="#9FB3D3" strokeWidth="1"/>
      <text x="70" y="25" textAnchor="middle" fontSize="24">🌊</text>
      <text x="70" y="50" textAnchor="middle" fontSize="10" fontWeight="600" fill="#2C3F5E">This Is Normal</text>
      <text x="70" y="70" textAnchor="middle" fontSize="8" fill="#26354F">Markets have always</text>
      <text x="70" y="82" textAnchor="middle" fontSize="8" fill="#26354F">moved this way.</text>
      <text x="70" y="94" textAnchor="middle" fontSize="8" fill="#26354F">It's not a sign</text>
      <text x="70" y="106" textAnchor="middle" fontSize="8" fill="#26354F">something is broken.</text>
    </g>
    
    <g transform="translate(205, 55)">
      <rect x="0" y="0" width="140" height="160" fill="#EEF9F4" rx="10" stroke="#3CCB97" strokeWidth="1"/>
      <text x="70" y="25" textAnchor="middle" fontSize="24">⏰</text>
      <text x="70" y="50" textAnchor="middle" fontSize="10" fontWeight="600" fill="#12805A">This Will Pass</text>
      <text x="70" y="70" textAnchor="middle" fontSize="8" fill="#12805A">Every drop in history</text>
      <text x="70" y="82" textAnchor="middle" fontSize="8" fill="#12805A">has been followed</text>
      <text x="70" y="94" textAnchor="middle" fontSize="8" fill="#12805A">by recovery.</text>
      <text x="70" y="106" textAnchor="middle" fontSize="8" fill="#12805A">Time heals volatility.</text>
    </g>
    
    <g transform="translate(360, 55)">
      <rect x="0" y="0" width="140" height="160" fill="#F6ECCE" rx="10" stroke="#E2C273" strokeWidth="1"/>
      <text x="70" y="25" textAnchor="middle" fontSize="24">🎯</text>
      <text x="70" y="50" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B26">Stay Focused</text>
      <text x="70" y="70" textAnchor="middle" fontSize="8" fill="#533E22">Your goal is years</text>
      <text x="70" y="82" textAnchor="middle" fontSize="8" fill="#533E22">away. Today's move</text>
      <text x="70" y="94" textAnchor="middle" fontSize="8" fill="#533E22">doesn't change</text>
      <text x="70" y="106" textAnchor="middle" fontSize="8" fill="#533E22">your destination.</text>
    </g>
    
    <g transform="translate(515, 55)">
      <rect x="0" y="0" width="140" height="160" fill="#ECE4F6" rx="10" stroke="#C0A9E2" strokeWidth="1"/>
      <text x="70" y="25" textAnchor="middle" fontSize="24">🧘</text>
      <text x="70" y="50" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B8A">Do Nothing</text>
      <text x="70" y="70" textAnchor="middle" fontSize="8" fill="#533F70">The best response</text>
      <text x="70" y="82" textAnchor="middle" fontSize="8" fill="#533F70">to volatility is</text>
      <text x="70" y="94" textAnchor="middle" fontSize="8" fill="#533F70">usually no response.</text>
      <text x="70" y="106" textAnchor="middle" fontSize="8" fill="#533F70">Patience wins.</text>
    </g>
    
    {/* Bottom message */}
    <rect x="100" y="225" width="500" height="25" fill="#2A2A2C" rx="6"/>
    <text x="350" y="242" textAnchor="middle" fontSize="9" fill="white">Save this framework. Return to it whenever markets feel unsettling.</text>
  </svg>
);

// SVG 9: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 140" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="140" fill="url(#takeawayGrad4)" rx="16"/>
    
    <defs>
      <linearGradient id="takeawayGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#12805A"/>
        <stop offset="100%" stopColor="#2A8C9A"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="40" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">🌱 Key Takeaway</text>
    <text x="350" y="70" textAnchor="middle" fontSize="12" fill="white">Volatility is not a sign that something is wrong — it's how markets work.</text>
    <text x="350" y="95" textAnchor="middle" fontSize="12" fill="white">It's the cost of growth. Accept it, and stay invested through it.</text>
    <text x="350" y="125" textAnchor="middle" fontSize="11" fill="#ABE5CC">The calm investor who does nothing usually wins.</text>
  </svg>
);

const LTILesson4 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const quizQuestions = [
    {
      id: 1,
      question: "What is volatility in the context of investing?",
      options: [
        "A sign that something is broken in the market",
        "The natural up and down movement of prices over time",
        "A strategy used by professional traders",
        "Something that only happens during crises"
      ],
      correct: 1,
      explanation: "Volatility is simply the natural fluctuation of prices — markets go up and down constantly. It's normal behavior, not a warning sign."
    },
    {
      id: 2,
      question: "What is usually the best response to short-term market volatility for a long-term investor?",
      options: [
        "Sell immediately to avoid losses",
        "Buy more during every dip",
        "Stay invested and take no action",
        "Move everything to cash until things stabilize"
      ],
      correct: 2,
      explanation: "For long-term investors, the best response to volatility is usually no response. Staying invested allows you to capture the eventual recovery and long-term growth."
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
                Lesson 4 of 7
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-800 mb-2 tracking-[-0.025em]">Volatility & Staying Invested</h1>
            <p className="text-gray-600 text-lg">
              Understanding market fluctuations and why staying invested matters.
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.025em]">Why Markets Fluctuate</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              If you've ever watched a market — even for a day — you've seen it move up and down. 
              Sometimes dramatically. This movement is called <strong>volatility</strong>, and it's 
              one of the most misunderstood aspects of investing.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Many people see these fluctuations and feel something must be wrong. "The market 
              dropped — should I sell?" "It's at an all-time high — should I buy more?" The 
              constant motion creates constant questions.
            </p>
            <p className="text-lg leading-relaxed">
              But here's what experienced investors understand: <strong>volatility is not a bug 
              in the system. It's how markets work.</strong> Understanding this changes everything 
              about how you invest — and how you feel while doing it.
            </p>
          </div>
        </div>

        {/* What Volatility Looks Like */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">What Volatility Actually Looks Like</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Markets don't move in smooth, predictable lines. They zigzag — constantly. On any 
              given day, prices might go up or down. Over any given week or month, there will be 
              movement in both directions.
            </p>
            <p className="text-lg leading-relaxed">
              This isn't chaos. It's simply millions of people around the world making decisions 
              based on their own views, information, and emotions — all happening at once.
            </p>
          </div>

          <VolatilityVisualizationSVG />
        </div>

        {/* Why Markets Move */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Why Do Markets Move So Much?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Every price you see represents a balance between buyers and sellers. Buyers think 
              something is worth more; sellers think it's time to let go. This tug-of-war never 
              stops.
            </p>
            <p className="text-lg leading-relaxed">
              News, earnings, economic data, political events, emotions — all of these influence 
              how people feel about the future. And since feelings change constantly, so do prices. 
              This is the source of volatility.
            </p>
          </div>

          <WhyMarketsMoveSVG />
        </div>

        {/* Noise vs Trend */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">The Difference Between Noise and Trend</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Here's the crucial distinction that separates anxious investors from calm ones: 
              <strong>short-term movement is noise; long-term direction is the trend.</strong>
            </p>
            <p className="text-lg leading-relaxed mb-4">
              When you're zoomed in on daily or weekly prices, all you see is chaos. Up, down, 
              up, down. It's disorienting and scary. Every movement seems important.
            </p>
            <p className="text-lg leading-relaxed">
              But when you zoom out to years or decades, something remarkable happens: the noise 
              fades away, and the underlying trend becomes clear. What looked like wild swings 
              become barely visible bumps on a longer journey.
            </p>
          </div>

          <NoiseVsTrendSVG />
        </div>

        {/* Volatility as Cost of Growth */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Volatility Is the Cost of Growth</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              This might be the most important reframe in all of investing: <strong>volatility is 
              not a problem to solve — it's a cost to accept.</strong>
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Think of it like an admission ticket. To access the potential for long-term growth, 
              you must accept that there will be uncomfortable moments along the way. Days when 
              your balance drops. Weeks of uncertainty. Periods that test your patience.
            </p>
            <p className="text-lg leading-relaxed">
              You can't have the reward without the cost. The investors who understand this don't 
              try to avoid volatility — they accept it as part of the deal.
            </p>
          </div>

          <CostOfGrowthSVG />
        </div>

        {/* Time Frames */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">How Time Changes Your Perspective</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              One of the most powerful mental tools you can develop is learning to see markets 
              through different time frames. The exact same market can look terrifying or 
              reassuring depending on how you view it.
            </p>
            <p className="text-lg leading-relaxed">
              Your money is invested for years or decades — not for today. Train yourself to 
              look at markets through a "years view" lens, and the daily noise loses its power 
              over you.
            </p>
          </div>

          <TimeFramesSVG />
        </div>

        {/* Two Investors */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Why Reacting Often Harms Outcomes</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              When markets drop, it's natural to feel the urge to do something. "Shouldn't I 
              protect myself?" "Won't it fall further?" These questions feel urgent.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              But action during volatility is often the enemy of good outcomes. Selling during 
              a drop locks in losses. Waiting for "the right time" to return often means missing 
              the recovery. The cost of reacting is usually higher than the cost of sitting still.
            </p>
            <p className="text-lg leading-relaxed">
              Consider how two investors might respond to the same market drop — and how their 
              different responses lead to very different outcomes.
            </p>
          </div>

          <TwoInvestorsSVG />
        </div>

        {/* Emotional vs Disciplined */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Emotional Reactions vs Disciplined Response</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Emotional investors ride a rollercoaster alongside the market. Every up feels 
              great; every down feels terrible. They're constantly reacting, adjusting, worrying.
            </p>
            <p className="text-lg leading-relaxed">
              Disciplined investors experience the same market movements but respond differently. 
              They acknowledge the discomfort, remember their long-term perspective, and stay 
              the course. They're not immune to emotions — they just don't let emotions drive 
              their decisions.
            </p>
          </div>

          <EmotionalVsDisciplinedSVG />
        </div>

        {/* Reassurance Framework */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">A Framework for Scary Moments</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Markets will have scary moments. That's guaranteed. What matters is how you respond 
              to them. Here's a simple framework you can return to whenever volatility feels 
              overwhelming.
            </p>
          </div>

          <ReassuranceSVG />
          
          <div className="mt-6 bg-teal-50 rounded-xl p-5 border border-teal-200">
            <p className="text-teal-800">
              <strong>Pro tip:</strong> Save or screenshot this framework. Pull it out whenever 
              markets get turbulent. It's a reminder that volatility is normal, temporary, and 
              manageable — if you stay calm and stay invested.
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
            Volatility is a universal characteristic of all markets worldwide. Whether you're 
            investing in American stocks, European indices, emerging markets, or Indian equities, 
            you'll experience ups and downs. It's not a feature of any particular market — it's 
            how all markets behave.
          </p>
          <p className="text-teal-800 text-sm">
            Indian markets, for example, have experienced their share of volatility — sometimes 
            dramatic — but have also shown long-term growth for patient investors. The same 
            principle applies everywhere: short-term noise, long-term direction.
          </p>
        </div>

        {/* Knowledge Check */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">📝 Knowledge Check</h2>
          <p className="text-gray-600 mb-6">Test your understanding of volatility and staying invested.</p>
          
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
            Think honestly about how you usually respond to market movement:
          </p>
          <div className="bg-white/20 rounded-xl p-5">
            <p className="text-white font-medium mb-2">Ask yourself:</p>
            <ul className="text-teal-100 space-y-2">
              <li>• When you see markets drop, what's your first instinct? To check more often? To consider selling?</li>
              <li>• When you see markets rise quickly, do you feel regret for not buying more earlier?</li>
              <li>• How do you feel when you see your portfolio balance lower than before?</li>
              <li>• What would help you stay calmer during volatile periods?</li>
              <li>• Can you commit to viewing your investments through a "years view" lens?</li>
            </ul>
          </div>
          <p className="text-teal-200 mt-4 text-sm">
            There are no wrong answers here — just honest self-awareness. Understanding your 
            emotional patterns is the first step to managing them during volatile times.
          </p>
        </div>

        {/* Lesson Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📚 Lesson Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <h4 className="font-semibold text-teal-800 mb-2">What We Learned</h4>
              <ul className="text-teal-700 text-sm space-y-1">
                <li>✓ Volatility = natural price movement</li>
                <li>✓ It's not a sign something is wrong</li>
                <li>✓ Short-term = noise; Long-term = trend</li>
                <li>✓ Volatility is the cost of growth</li>
              </ul>
            </div>
            <div className="bg-brand-soft rounded-xl p-4 border border-brand-line">
              <h4 className="font-semibold text-brand mb-2">Key Behaviors</h4>
              <ul className="text-brand text-sm space-y-1">
                <li>✓ View markets through "years view" lens</li>
                <li>✓ Don't react to short-term movement</li>
                <li>✓ Stay invested through ups and downs</li>
                <li>✓ Use the reassurance framework</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to="/learn/lti-lesson-3"
            className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Previous: Time in Market vs Timing</span>
          </Link>
          <button
            onClick={() => navigate('/learn/lti-lesson-5')}
            className="flex items-center gap-2 bg-brand-fill hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <span>Next: The Role of Patience & Discipline</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default LTILesson4;
