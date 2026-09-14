import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSeedling, FaCheckCircle, FaTimesCircle, FaLightbulb, FaTrophy } from 'react-icons/fa';

// SVG 1: Mindset as the Foundation
const MindsetFoundationSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Mindset Is the Foundation of Everything</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">All the knowledge in this module rests on how you think</text>
    
    {/* Foundation pyramid */}
    <g transform="translate(150, 70)">
      {/* Top - Results */}
      <polygon points="200,0 280,60 120,60" fill="#dcfce7" stroke="#86efac" strokeWidth="2"/>
      <text x="200" y="40" textAnchor="middle" fontSize="9" fontWeight="500" fill="#166534">Results</text>
      <text x="200" y="52" textAnchor="middle" fontSize="7" fill="#14532d">Wealth over time</text>
      
      {/* Middle - Actions */}
      <polygon points="120,65 280,65 320,125 80,125" fill="#a7f3d0" stroke="#86efac" strokeWidth="2"/>
      <text x="200" y="90" textAnchor="middle" fontSize="10" fontWeight="500" fill="#166534">Actions</text>
      <text x="200" y="105" textAnchor="middle" fontSize="8" fill="#14532d">Consistent investing, staying the course</text>
      
      {/* Bottom - Mindset */}
      <polygon points="80,130 320,130 360,190 40,190" fill="#059669" stroke="#047857" strokeWidth="2"/>
      <text x="200" y="155" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">MINDSET</text>
      <text x="200" y="172" textAnchor="middle" fontSize="8" fill="#d1fae5">Long-term thinking, patience, discipline</text>
    </g>
    
    {/* Side annotations */}
    <g transform="translate(520, 100)">
      <rect x="0" y="0" width="140" height="80" fill="#f0fdf4" rx="8" stroke="#86efac" strokeWidth="1"/>
      <text x="70" y="25" textAnchor="middle" fontSize="8" fontWeight="500" fill="#166534">Without the right mindset:</text>
      <text x="70" y="42" textAnchor="middle" fontSize="7" fill="#14532d">• Knowledge gets abandoned</text>
      <text x="70" y="55" textAnchor="middle" fontSize="7" fill="#14532d">• Plans get derailed</text>
      <text x="70" y="68" textAnchor="middle" fontSize="7" fill="#14532d">• Emotions take over</text>
    </g>
    
    {/* Bottom message */}
    <rect x="100" y="240" width="500" height="28" fill="#1e293b" rx="6"/>
    <text x="350" y="258" textAnchor="middle" fontSize="10" fill="white">Your mindset determines whether your knowledge becomes wealth.</text>
  </svg>
);

// SVG 2: Three Time Perspectives
const TimePerspectivesSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">The Long-Term Investor's Three Perspectives</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">How you see time shapes how you invest</text>
    
    {/* Daily */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="180" height="180" fill="#fef9c3" rx="12" stroke="#fcd34d" strokeWidth="2"/>
      <text x="90" y="30" textAnchor="middle" fontSize="24">📅</text>
      <text x="90" y="55" textAnchor="middle" fontSize="11" fontWeight="600" fill="#92400e">Day to Day</text>
      
      <g transform="translate(15, 70)">
        <text x="0" y="0" fontSize="8" fill="#78350f" fontWeight="500">What happens:</text>
        <text x="0" y="16" fontSize="7" fill="#78350f">• Prices move up and down</text>
        <text x="0" y="29" fontSize="7" fill="#78350f">• News creates noise</text>
        <text x="0" y="42" fontSize="7" fill="#78350f">• Emotions spike</text>
      </g>
      
      <rect x="15" y="125" width="150" height="40" fill="#fef3c7" rx="6"/>
      <text x="90" y="143" textAnchor="middle" fontSize="8" fontWeight="500" fill="#92400e">Mindset response:</text>
      <text x="90" y="157" textAnchor="middle" fontSize="7" fill="#78350f">"This is normal. I don't react."</text>
    </g>
    
    {/* Yearly */}
    <g transform="translate(260, 75)">
      <rect x="0" y="0" width="180" height="180" fill="#dbeafe" rx="12" stroke="#93c5fd" strokeWidth="2"/>
      <text x="90" y="30" textAnchor="middle" fontSize="24">📊</text>
      <text x="90" y="55" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e40af">Year to Year</text>
      
      <g transform="translate(15, 70)">
        <text x="0" y="0" fontSize="8" fill="#1e3a8a" fontWeight="500">What happens:</text>
        <text x="0" y="16" fontSize="7" fill="#1e3a8a">• Some years are up, some down</text>
        <text x="0" y="29" fontSize="7" fill="#1e3a8a">• Progress isn't linear</text>
        <text x="0" y="42" fontSize="7" fill="#1e3a8a">• Patterns emerge over time</text>
      </g>
      
      <rect x="15" y="125" width="150" height="40" fill="#dbeafe" rx="6"/>
      <text x="90" y="143" textAnchor="middle" fontSize="8" fontWeight="500" fill="#1e40af">Mindset response:</text>
      <text x="90" y="157" textAnchor="middle" fontSize="7" fill="#1e3a8a">"I'm building, not judging."</text>
    </g>
    
    {/* Lifelong */}
    <g transform="translate(470, 75)">
      <rect x="0" y="0" width="180" height="180" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="90" y="30" textAnchor="middle" fontSize="24">🌳</text>
      <text x="90" y="55" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">Lifelong View</text>
      
      <g transform="translate(15, 70)">
        <text x="0" y="0" fontSize="8" fill="#14532d" fontWeight="500">What happens:</text>
        <text x="0" y="16" fontSize="7" fill="#14532d">• Wealth compounds steadily</text>
        <text x="0" y="29" fontSize="7" fill="#14532d">• Short-term noise fades</text>
        <text x="0" y="42" fontSize="7" fill="#14532d">• Patience is rewarded</text>
      </g>
      
      <rect x="15" y="125" width="150" height="40" fill="#dcfce7" rx="6"/>
      <text x="90" y="143" textAnchor="middle" fontSize="8" fontWeight="500" fill="#166534">Mindset response:</text>
      <text x="90" y="157" textAnchor="middle" fontSize="7" fill="#14532d">"My future self will thank me."</text>
    </g>
    
    {/* Bottom message */}
    <text x="350" y="280" textAnchor="middle" fontSize="10" fill="#64748b">Long-term investors live in all three — but make decisions from the lifelong view.</text>
  </svg>
);

// SVG 3: Consistency Path
const ConsistencyPathSVG = () => (
  <svg viewBox="0 0 700 260" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="260" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Consistency Beats Intensity</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Steady progress always wins over bursts of activity</text>
    
    {/* Two paths */}
    <g transform="translate(80, 75)">
      {/* Erratic path */}
      <g>
        <text x="80" y="-5" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">Intense Bursts</text>
        <path d="M0 100 L20 30 L40 80 L60 20 L80 90 L100 40 L120 110 L140 50 L160 100" 
              fill="none" stroke="#ef4444" strokeWidth="2"/>
        <circle cx="160" cy="100" r="4" fill="#ef4444"/>
        <text x="180" y="105" fontSize="8" fill="#dc2626">Exhausted, inconsistent</text>
      </g>
      
      {/* Steady path */}
      <g transform="translate(300, 0)">
        <text x="80" y="-5" textAnchor="middle" fontSize="9" fill="#22c55e" fontWeight="500">Steady Consistency</text>
        <path d="M0 100 Q40 90 80 80 Q120 70 160 55" 
              fill="none" stroke="#22c55e" strokeWidth="3"/>
        <circle cx="160" cy="55" r="5" fill="#22c55e"/>
        <text x="180" y="60" fontSize="8" fill="#166534">Calm, sustainable</text>
      </g>
    </g>
    
    {/* Comparison */}
    <g transform="translate(100, 190)">
      <rect x="0" y="0" width="200" height="50" fill="#fef2f2" rx="8" stroke="#fca5a5" strokeWidth="1"/>
      <text x="100" y="20" textAnchor="middle" fontSize="8" fontWeight="500" fill="#dc2626">Intense approach:</text>
      <text x="100" y="35" textAnchor="middle" fontSize="7" fill="#991b1b">Big moves, long pauses, burnout</text>
    </g>
    
    <g transform="translate(400, 190)">
      <rect x="0" y="0" width="200" height="50" fill="#dcfce7" rx="8" stroke="#86efac" strokeWidth="1"/>
      <text x="100" y="20" textAnchor="middle" fontSize="8" fontWeight="500" fill="#166534">Consistent approach:</text>
      <text x="100" y="35" textAnchor="middle" fontSize="7" fill="#14532d">Small steps, regular rhythm, lasting</text>
    </g>
  </svg>
);

// SVG 4: Two Investors Story
const TwoInvestorsMindsetSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Two Mindsets, Two Journeys</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Same starting point, different mental approaches</text>
    
    {/* Investor A - Reactive */}
    <g transform="translate(50, 70)">
      <rect x="0" y="0" width="280" height="240" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="140" y="30" textAnchor="middle" fontSize="32">🏃</text>
      <text x="140" y="55" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">Arun: Reactive Mindset</text>
      
      <g transform="translate(20, 75)">
        <text x="0" y="0" fontSize="9" fill="#991b1b" fontWeight="500">How he thinks:</text>
        <text x="0" y="18" fontSize="8" fill="#991b1b">• "I need to do something"</text>
        <text x="0" y="33" fontSize="8" fill="#991b1b">• "What if I miss out?"</text>
        <text x="0" y="48" fontSize="8" fill="#991b1b">• "Others seem to know more"</text>
        <text x="0" y="63" fontSize="8" fill="#991b1b">• "Maybe I should change plans"</text>
      </g>
      
      <g transform="translate(20, 145)">
        <text x="0" y="0" fontSize="9" fill="#991b1b" fontWeight="500">His experience:</text>
        <text x="0" y="18" fontSize="8" fill="#991b1b">• Constant checking</text>
        <text x="0" y="33" fontSize="8" fill="#991b1b">• Frequent changes</text>
        <text x="0" y="48" fontSize="8" fill="#991b1b">• High stress</text>
        <text x="0" y="63" fontSize="8" fill="#991b1b">• Regret and second-guessing</text>
      </g>
    </g>
    
    {/* Investor B - Steady */}
    <g transform="translate(370, 70)">
      <rect x="0" y="0" width="280" height="240" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="140" y="30" textAnchor="middle" fontSize="32">🧘</text>
      <text x="140" y="55" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">Priya: Steady Mindset</text>
      
      <g transform="translate(20, 75)">
        <text x="0" y="0" fontSize="9" fill="#14532d" fontWeight="500">How she thinks:</text>
        <text x="0" y="18" fontSize="8" fill="#14532d">• "I have a plan"</text>
        <text x="0" y="33" fontSize="8" fill="#14532d">• "Short-term doesn't define me"</text>
        <text x="0" y="48" fontSize="8" fill="#14532d">• "Time is on my side"</text>
        <text x="0" y="63" fontSize="8" fill="#14532d">• "I trust my process"</text>
      </g>
      
      <g transform="translate(20, 145)">
        <text x="0" y="0" fontSize="9" fill="#14532d" fontWeight="500">Her experience:</text>
        <text x="0" y="18" fontSize="8" fill="#14532d">• Occasional reviews</text>
        <text x="0" y="33" fontSize="8" fill="#14532d">• Rare changes</text>
        <text x="0" y="48" fontSize="8" fill="#14532d">• Low stress</text>
        <text x="0" y="63" fontSize="8" fill="#14532d">• Peace and confidence</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="320" width="500" height="15" fill="transparent"/>
    <text x="350" y="330" textAnchor="middle" fontSize="9" fill="#64748b">Same market. Same opportunities. Different mindsets = different experiences.</text>
  </svg>
);

// SVG 5: Calm Progress Over Time
const CalmProgressSVG = () => (
  <svg viewBox="0 0 700 240" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="240" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Calm Progress Over Time</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">The long-term path is steady, not dramatic</text>
    
    {/* Progress visualization */}
    <g transform="translate(80, 70)">
      {/* Background waves - noise */}
      <path d="M0 80 Q67 60 135 75 Q202 90 270 70 Q337 50 405 80 Q472 100 540 65" 
            fill="none" stroke="#e2e8f0" strokeWidth="30" opacity="0.5"/>
      
      {/* Steady progress line */}
      <path d="M0 100 Q135 85 270 70 Q405 55 540 35" 
            fill="none" stroke="#22c55e" strokeWidth="4"/>
      
      {/* Milestones */}
      <circle cx="0" cy="100" r="8" fill="#22c55e"/>
      <text x="0" y="125" textAnchor="middle" fontSize="7" fill="#166534">Start</text>
      
      <circle cx="180" cy="80" r="6" fill="#22c55e"/>
      <text x="180" y="105" textAnchor="middle" fontSize="7" fill="#166534">Year 5</text>
      
      <circle cx="360" cy="55" r="6" fill="#22c55e"/>
      <text x="360" y="80" textAnchor="middle" fontSize="7" fill="#166534">Year 15</text>
      
      <circle cx="540" cy="35" r="10" fill="#22c55e"/>
      <text x="540" y="60" textAnchor="middle" fontSize="7" fill="#166534">Long-term</text>
      
      {/* Legend */}
      <g transform="translate(160, 145)">
        <rect x="0" y="0" width="20" height="8" fill="#e2e8f0"/>
        <text x="28" y="8" fontSize="7" fill="#64748b">Market noise</text>
      </g>
      <g transform="translate(300, 145)">
        <line x1="0" y1="4" x2="20" y2="4" stroke="#22c55e" strokeWidth="3"/>
        <text x="28" y="8" fontSize="7" fill="#166534">Your steady progress</text>
      </g>
    </g>
    
    {/* Bottom message */}
    <text x="350" y="225" textAnchor="middle" fontSize="10" fill="#64748b">The noise is loud. The progress is quiet. Trust the direction, not the day.</text>
  </svg>
);

// SVG 6: Mindset Supports All Lessons
const MindsetConnectionsSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">How Mindset Supports Everything You've Learned</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Your mindset is the glue that holds all lessons together</text>
    
    {/* Central mindset hub */}
    <circle cx="350" cy="170" r="50" fill="#059669" stroke="#047857" strokeWidth="3"/>
    <text x="350" y="165" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">Long-Term</text>
    <text x="350" y="180" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">Mindset</text>
    
    {/* Connected concepts */}
    {/* Top - Compounding */}
    <g transform="translate(280, 60)">
      <rect x="0" y="0" width="140" height="45" fill="#dcfce7" rx="8" stroke="#86efac" strokeWidth="1"/>
      <text x="70" y="20" textAnchor="middle" fontSize="9" fontWeight="500" fill="#166534">📈 Compounding</text>
      <text x="70" y="35" textAnchor="middle" fontSize="7" fill="#14532d">Requires patience to work</text>
    </g>
    <line x1="350" y1="105" x2="350" y2="120" stroke="#86efac" strokeWidth="2"/>
    
    {/* Left - Time in Market */}
    <g transform="translate(70, 140)">
      <rect x="0" y="0" width="140" height="45" fill="#dcfce7" rx="8" stroke="#86efac" strokeWidth="1"/>
      <text x="70" y="20" textAnchor="middle" fontSize="9" fontWeight="500" fill="#166534">⏰ Time in Market</text>
      <text x="70" y="35" textAnchor="middle" fontSize="7" fill="#14532d">Requires staying invested</text>
    </g>
    <line x1="210" y1="162" x2="300" y2="165" stroke="#86efac" strokeWidth="2"/>
    
    {/* Right - Diversification */}
    <g transform="translate(490, 140)">
      <rect x="0" y="0" width="140" height="45" fill="#dcfce7" rx="8" stroke="#86efac" strokeWidth="1"/>
      <text x="70" y="20" textAnchor="middle" fontSize="9" fontWeight="500" fill="#166534">🎯 Diversification</text>
      <text x="70" y="35" textAnchor="middle" fontSize="7" fill="#14532d">Requires trust in simplicity</text>
    </g>
    <line x1="490" y1="162" x2="400" y2="165" stroke="#86efac" strokeWidth="2"/>
    
    {/* Bottom Left - Volatility */}
    <g transform="translate(100, 240)">
      <rect x="0" y="0" width="140" height="45" fill="#dcfce7" rx="8" stroke="#86efac" strokeWidth="1"/>
      <text x="70" y="20" textAnchor="middle" fontSize="9" fontWeight="500" fill="#166534">🌊 Handling Volatility</text>
      <text x="70" y="35" textAnchor="middle" fontSize="7" fill="#14532d">Requires emotional calm</text>
    </g>
    <line x1="240" y1="262" x2="320" y2="210" stroke="#86efac" strokeWidth="2"/>
    
    {/* Bottom Right - Behavior */}
    <g transform="translate(460, 240)">
      <rect x="0" y="0" width="140" height="45" fill="#dcfce7" rx="8" stroke="#86efac" strokeWidth="1"/>
      <text x="70" y="20" textAnchor="middle" fontSize="9" fontWeight="500" fill="#166534">🧘 Good Behavior</text>
      <text x="70" y="35" textAnchor="middle" fontSize="7" fill="#14532d">Requires discipline</text>
    </g>
    <line x1="460" y1="262" x2="380" y2="210" stroke="#86efac" strokeWidth="2"/>
    
    {/* Bottom message */}
    <text x="350" y="305" textAnchor="middle" fontSize="9" fill="#64748b">Every lesson you've learned works better with the right mindset behind it.</text>
  </svg>
);

// SVG 7: Daily Habits of Long-Term Investors
const DailyHabitsSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">The Daily Habits of Long-Term Investors</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">What they do (and don't do) differently</text>
    
    {/* They DON'T */}
    <g transform="translate(50, 70)">
      <rect x="0" y="0" width="280" height="170" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="1"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">✗ They DON'T:</text>
      
      <g transform="translate(25, 50)">
        <circle cx="8" cy="6" r="4" fill="#fca5a5"/>
        <text x="20" y="10" fontSize="9" fill="#991b1b">Check portfolio multiple times daily</text>
        
        <circle cx="8" cy="30" r="4" fill="#fca5a5"/>
        <text x="20" y="34" fontSize="9" fill="#991b1b">React to every news headline</text>
        
        <circle cx="8" cy="54" r="4" fill="#fca5a5"/>
        <text x="20" y="58" fontSize="9" fill="#991b1b">Compare with what others are doing</text>
        
        <circle cx="8" cy="78" r="4" fill="#fca5a5"/>
        <text x="20" y="82" fontSize="9" fill="#991b1b">Chase the latest "hot" investment</text>
        
        <circle cx="8" cy="102" r="4" fill="#fca5a5"/>
        <text x="20" y="106" fontSize="9" fill="#991b1b">Worry about short-term drops</text>
      </g>
    </g>
    
    {/* They DO */}
    <g transform="translate(370, 70)">
      <rect x="0" y="0" width="280" height="170" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="1"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">✓ They DO:</text>
      
      <g transform="translate(25, 50)">
        <circle cx="8" cy="6" r="4" fill="#86efac"/>
        <text x="20" y="10" fontSize="9" fill="#14532d">Review once a month or quarter</text>
        
        <circle cx="8" cy="30" r="4" fill="#86efac"/>
        <text x="20" y="34" fontSize="9" fill="#14532d">Ignore short-term market noise</text>
        
        <circle cx="8" cy="54" r="4" fill="#86efac"/>
        <text x="20" y="58" fontSize="9" fill="#14532d">Focus on their own long-term plan</text>
        
        <circle cx="8" cy="78" r="4" fill="#86efac"/>
        <text x="20" y="82" fontSize="9" fill="#14532d">Stay with proven, simple approaches</text>
        
        <circle cx="8" cy="102" r="4" fill="#86efac"/>
        <text x="20" y="106" fontSize="9" fill="#14532d">Trust the process through all seasons</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <text x="350" y="265" textAnchor="middle" fontSize="10" fill="#64748b">Long-term investing is mostly about what you <tspan fontWeight="600">don't</tspan> do.</text>
  </svg>
);

// SVG 8: Building Your Mindset
const BuildingMindsetSVG = () => (
  <svg viewBox="0 0 700 260" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="260" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Building Your Long-Term Mindset</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Four pillars of lasting investing confidence</text>
    
    {/* Four pillars */}
    <g transform="translate(60, 75)">
      {/* Pillar 1 */}
      <rect x="0" y="0" width="130" height="130" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="1"/>
      <text x="65" y="30" textAnchor="middle" fontSize="20">🎯</text>
      <text x="65" y="52" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">Clear Purpose</text>
      <g transform="translate(15, 65)">
        <text x="0" y="0" fontSize="7" fill="#14532d">Know WHY you're</text>
        <text x="0" y="12" fontSize="7" fill="#14532d">investing. Your goals</text>
        <text x="0" y="24" fontSize="7" fill="#14532d">keep you grounded.</text>
      </g>
    </g>
    
    <g transform="translate(205, 75)">
      {/* Pillar 2 */}
      <rect x="0" y="0" width="130" height="130" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="1"/>
      <text x="65" y="30" textAnchor="middle" fontSize="20">📋</text>
      <text x="65" y="52" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">Simple Plan</text>
      <g transform="translate(15, 65)">
        <text x="0" y="0" fontSize="7" fill="#14532d">A clear process you</text>
        <text x="0" y="12" fontSize="7" fill="#14532d">can follow in any</text>
        <text x="0" y="24" fontSize="7" fill="#14532d">market condition.</text>
      </g>
    </g>
    
    <g transform="translate(350, 75)">
      {/* Pillar 3 */}
      <rect x="0" y="0" width="130" height="130" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="1"/>
      <text x="65" y="30" textAnchor="middle" fontSize="20">🧘</text>
      <text x="65" y="52" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">Emotional Calm</text>
      <g transform="translate(15, 65)">
        <text x="0" y="0" fontSize="7" fill="#14532d">Accept that feelings</text>
        <text x="0" y="12" fontSize="7" fill="#14532d">happen but don't</text>
        <text x="0" y="24" fontSize="7" fill="#14532d">need to drive action.</text>
      </g>
    </g>
    
    <g transform="translate(495, 75)">
      {/* Pillar 4 */}
      <rect x="0" y="0" width="130" height="130" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="1"/>
      <text x="65" y="30" textAnchor="middle" fontSize="20">⏳</text>
      <text x="65" y="52" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">Time Horizon</text>
      <g transform="translate(15, 65)">
        <text x="0" y="0" fontSize="7" fill="#14532d">Remember you're</text>
        <text x="0" y="12" fontSize="7" fill="#14532d">playing a decades-</text>
        <text x="0" y="24" fontSize="7" fill="#14532d">long game.</text>
      </g>
    </g>
    
    {/* Bottom message */}
    <rect x="100" y="220" width="500" height="28" fill="#059669" rx="6"/>
    <text x="350" y="238" textAnchor="middle" fontSize="10" fill="white">These four pillars create a mindset that weathers any market storm.</text>
  </svg>
);

// SVG 9: Key Takeaway - Module Completion
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 160" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="160" fill="url(#takeawayGrad7)" rx="16"/>
    
    <defs>
      <linearGradient id="takeawayGrad7" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#059669"/>
        <stop offset="100%" stopColor="#0d9488"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="35" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">🏆 Congratulations!</text>
    <text x="350" y="60" textAnchor="middle" fontSize="11" fill="white">You've completed the Long-Term Investing module.</text>
    
    <text x="350" y="95" textAnchor="middle" fontSize="12" fill="#a7f3d0" fontWeight="500">Your mindset is your most valuable investing tool.</text>
    <text x="350" y="115" textAnchor="middle" fontSize="10" fill="white">Stay patient. Stay consistent. Trust the process.</text>
    <text x="350" y="145" textAnchor="middle" fontSize="10" fill="#d1fae5">Time + Consistency + Right Mindset = Long-Term Wealth</text>
  </svg>
);

const LTILesson7 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const quizQuestions = [
    {
      id: 1,
      question: "Why is mindset considered more important than market conditions for long-term investors?",
      options: [
        "Because mindset changes market prices",
        "Because the right mindset helps you stay consistent through all market conditions",
        "Because mindset eliminates all investment risk",
        "Because markets always follow a predictable pattern"
      ],
      correct: 1,
      explanation: "Markets are unpredictable, but your response to them isn't. A long-term mindset helps you stay the course through ups and downs, which is essential for building wealth over time."
    },
    {
      id: 2,
      question: "What does 'consistency beats intensity' mean for investors?",
      options: [
        "You should invest more money all at once",
        "Making big moves occasionally is better than small regular steps",
        "Steady, regular investing habits over time outperform dramatic bursts of activity",
        "Intensity is always bad for investing"
      ],
      correct: 2,
      explanation: "Long-term wealth is built through steady, sustainable habits — not through occasional bursts of activity followed by long pauses. Consistency creates lasting results."
    }
  ];

  const handleAnswer = (questionId, answerIndex) => {
    setQuizAnswers({ ...quizAnswers, [questionId]: answerIndex });
    setShowResults({ ...showResults, [questionId]: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 py-8 px-4">
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
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                Lesson 7 of 7 — Final Lesson
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Building a Long-Term Investing Mindset</h1>
            <p className="text-gray-600 text-lg">
              The foundation that makes everything else work — how you think shapes how you invest.
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Mindset Matters Most</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              You've now learned the core principles of long-term investing: <strong>compounding, 
              time in the market, handling volatility, diversification, and managing your behavior.</strong>
            </p>
            <p className="text-lg leading-relaxed mb-4">
              But here's the truth that ties everything together: none of that knowledge matters 
              if you don't have the <strong>mindset</strong> to apply it consistently.
            </p>
            <p className="text-lg leading-relaxed">
              Markets will rise. Markets will fall. News will alarm you. Others will seem to be 
              doing better. In those moments, your knowledge alone won't save you. Your 
              <strong> mindset</strong> will. This final lesson is about building the mental 
              foundation that makes everything else work.
            </p>
          </div>
        </div>

        {/* Mindset as Foundation */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Mindset Is the Foundation</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Think of wealth-building as a pyramid. At the top are the results you want — 
              financial security, freedom, peace of mind. Below that are the actions that create 
              those results — consistent investing, staying the course, avoiding panic.
            </p>
            <p className="text-lg leading-relaxed">
              But at the very bottom, holding everything up, is your <strong>mindset</strong>. 
              Without the right way of thinking, the actions become impossible to sustain, and 
              the results never materialize.
            </p>
          </div>

          <MindsetFoundationSVG />
        </div>

        {/* Three Time Perspectives */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">The Three Time Perspectives</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Long-term investors don't ignore what's happening today. They're aware of it. But 
              they make decisions based on a different timescale — the lifelong view.
            </p>
            <p className="text-lg leading-relaxed">
              Understanding how to think across all three timeframes — daily, yearly, and lifelong — 
              is key to staying calm when short-term events try to shake you.
            </p>
          </div>

          <TimePerspectivesSVG />
        </div>

        {/* Consistency Beats Intensity */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Consistency Beats Intensity</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Many people approach investing with bursts of energy — they research intensely for 
              a week, make some moves, then forget about it for months. This pattern doesn't work 
              for long-term wealth.
            </p>
            <p className="text-lg leading-relaxed">
              What works is <strong>consistency</strong>: small, regular actions maintained over 
              years. Not dramatic. Not exciting. Just steady. That's what builds wealth.
            </p>
          </div>

          <ConsistencyPathSVG />
        </div>

        {/* Two Investors Story */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Two Mindsets, Two Journeys</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Consider Arun and Priya. They start investing at the same time, with similar amounts, 
              in similar markets. But they approach it with completely different mindsets.
            </p>
            <p className="text-lg leading-relaxed">
              Their outcomes? Surprisingly different — not just in results, but in their entire 
              experience of investing. One is exhausting, the other peaceful.
            </p>
          </div>

          <TwoInvestorsMindsetSVG />
          
          <div className="mt-6 bg-teal-50 rounded-xl p-5 border border-teal-200">
            <p className="text-teal-800">
              <strong>The key insight:</strong> Priya didn't have better information or smarter 
              picks. She had a better mindset. And that made her entire investing journey different.
            </p>
          </div>
        </div>

        {/* Calm Progress Over Time */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Calm Progress Over Time</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              The media makes investing look dramatic — big swings, breaking news, urgent decisions. 
              But real wealth-building looks nothing like that. It's quiet. It's calm. It's gradual.
            </p>
            <p className="text-lg leading-relaxed">
              The long-term investor learns to see through the noise to the underlying progress. 
              Day to day, it's invisible. Over years, it transforms your financial life.
            </p>
          </div>

          <CalmProgressSVG />
        </div>

        {/* Mindset Supports All Lessons */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">How Mindset Connects Everything</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Every lesson in this module becomes more powerful with the right mindset behind it. 
              Compounding requires patience. Time in market requires staying invested. Volatility 
              requires emotional calm. Diversification requires trust. Behavior requires discipline.
            </p>
            <p className="text-lg leading-relaxed">
              Your mindset is the thread that ties all these lessons together into a coherent, 
              sustainable approach to building wealth.
            </p>
          </div>

          <MindsetConnectionsSVG />
        </div>

        {/* Daily Habits */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Daily Habits of Long-Term Investors</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              A long-term mindset isn't just about big decisions — it shows up in small daily 
              habits. What long-term investors <strong>don't</strong> do is just as important as 
              what they <strong>do</strong>.
            </p>
          </div>

          <DailyHabitsSVG />
        </div>

        {/* Building Your Mindset */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Building Your Long-Term Mindset</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              A strong investing mindset doesn't appear overnight. It's built on four key pillars 
              that support each other and create lasting confidence.
            </p>
          </div>

          <BuildingMindsetSVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
        </div>

        {/* India-specific Context */}
        <div className="bg-teal-50 rounded-2xl p-6 shadow-lg mb-8 border border-teal-200">
          <h3 className="text-lg font-semibold text-teal-800 mb-3">🌍 Global Perspective</h3>
          <p className="text-teal-900 mb-3">
            The long-term investing mindset is valued by successful investors everywhere in the 
            world — from Warren Buffett in America to countless patient wealth-builders across 
            Europe, Asia, and beyond.
          </p>
          <p className="text-teal-800 text-sm">
            In India, where markets can be particularly volatile and where investment media is 
            highly active, cultivating a calm long-term mindset is especially valuable. The 
            principles are universal, but the discipline to apply them matters even more in 
            fast-moving, news-driven environments.
          </p>
        </div>

        {/* Knowledge Check */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Knowledge Check</h2>
          <p className="text-gray-600 mb-6">Final check — test your understanding of the long-term mindset.</p>
          
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
            <h3 className="text-xl font-bold">Final Reflection Activity</h3>
          </div>
          <p className="text-teal-100 mb-4">
            You've completed the entire Long-Term Investing module. Now it's time to commit to action.
          </p>
          <div className="bg-white/20 rounded-xl p-5">
            <p className="text-white font-medium mb-3">Answer this question:</p>
            <p className="text-teal-100 text-lg mb-4">
              "What is ONE long-term investing habit I will build starting today?"
            </p>
            <ul className="text-teal-200 text-sm space-y-1">
              <li>• It could be: reviewing your portfolio monthly instead of daily</li>
              <li>• It could be: setting up automatic investments</li>
              <li>• It could be: pausing before reacting to market news</li>
              <li>• It could be: reminding yourself of your long-term purpose</li>
            </ul>
          </div>
          <p className="text-teal-200 mt-4 text-sm">
            Small, consistent habits compound over time — just like investments. Choose one habit, 
            commit to it, and let it grow.
          </p>
        </div>

        {/* Module Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center gap-3 mb-6">
            <FaTrophy className="text-3xl text-yellow-500" />
            <h3 className="text-xl font-bold text-gray-800">Module Complete! 🎉</h3>
          </div>
          
          <p className="text-gray-700 mb-6">
            You've completed all 7 lessons in the Long-Term Investing module. Here's what you've learned:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <h4 className="font-semibold text-teal-800 mb-2">Lessons 1-3</h4>
              <ul className="text-teal-700 text-sm space-y-1">
                <li>✓ What long-term investing means</li>
                <li>✓ The power of compounding</li>
                <li>✓ Time in market vs timing the market</li>
              </ul>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <h4 className="font-semibold text-emerald-800 mb-2">Lessons 4-7</h4>
              <ul className="text-emerald-700 text-sm space-y-1">
                <li>✓ Handling volatility and staying invested</li>
                <li>✓ Diversification and simplicity</li>
                <li>✓ Behavior and patience</li>
                <li>✓ Building a long-term mindset</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl p-5 text-white">
            <p className="font-medium text-center">
              "The stock market is a device for transferring money from the impatient to the patient."
            </p>
            <p className="text-teal-100 text-center text-sm mt-2">— Warren Buffett</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to="/learn/lti-lesson-6"
            className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Previous: Behavior & Patience</span>
          </Link>
          <button
            onClick={() => navigate('/learn/long-term-investing')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <FaTrophy />
            <span>Back to Module Overview</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LTILesson7;
