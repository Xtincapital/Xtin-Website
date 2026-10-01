import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaLightbulb, FaTrophy } from 'react-icons/fa';
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

const QuizQuestion = ({ question, options, correctAnswer, explanation }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerClick = (option) => {
    setSelectedAnswer(option);
    setShowResult(true);
  };

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <div className="bg-white rounded-xl p-6 shadow-md mb-6 border border-gray-100">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">{question}</h4>
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(option)}
            disabled={showResult}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              showResult
                ? option === correctAnswer
                  ? 'border-green-500 bg-green-50'
                  : option === selectedAnswer
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
                : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {showResult && (
        <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          {isCorrect ? (
            <FaCheckCircle className="text-green-600 text-xl flex-shrink-0 mt-0.5" />
          ) : (
            <FaTimesCircle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
              {isCorrect ? 'Correct!' : 'Not quite right'}
            </p>
            <p className="text-gray-700 mt-1">{explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// SVG 1: Discipline vs Intelligence
const DisciplineVsIntelligenceSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Discipline Beats Intelligence in Markets</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Knowing what to do means nothing without the consistency to do it</text>
    
    {/* Intelligence side */}
    <g transform="translate(60, 80)">
      <rect x="0" y="0" width="250" height="160" fill="#dbeafe" rx="12" stroke="#93c5fd" strokeWidth="2"/>
      <text x="125" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="#1e40af">🧠 Intelligence Alone</text>
      
      <g transform="translate(25, 50)">
        <text x="0" y="0" fontSize="9" fill="#1e3a8a">• Knows the right approach</text>
        <text x="0" y="18" fontSize="9" fill="#1e3a8a">• Understands concepts well</text>
        <text x="0" y="36" fontSize="9" fill="#1e3a8a">• Can analyze situations</text>
        <text x="0" y="54" fontSize="9" fill="#dc2626">• But acts inconsistently</text>
        <text x="0" y="72" fontSize="9" fill="#dc2626">• Breaks rules under pressure</text>
        <text x="0" y="90" fontSize="9" fill="#dc2626">• Knowledge without action</text>
      </g>
    </g>
    
    {/* Plus sign */}
    <g transform="translate(330, 140)">
      <text x="0" y="0" fontSize="24" fontWeight="600" fill="#64748b">→</text>
    </g>
    
    {/* Discipline side */}
    <g transform="translate(390, 80)">
      <rect x="0" y="0" width="250" height="160" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="125" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="#166534">⚡ Discipline Applied</text>
      
      <g transform="translate(25, 50)">
        <text x="0" y="0" fontSize="9" fill="#14532d">• Follows the plan consistently</text>
        <text x="0" y="18" fontSize="9" fill="#14532d">• Acts even when uncomfortable</text>
        <text x="0" y="36" fontSize="9" fill="#14532d">• Maintains habits over time</text>
        <text x="0" y="54" fontSize="9" fill="#14532d">• Stays calm under pressure</text>
        <text x="0" y="72" fontSize="9" fill="#14532d">• Knowledge becomes results</text>
        <text x="0" y="90" fontSize="9" fill="#166534" fontWeight="600">= Long-term survival</text>
      </g>
    </g>
  </svg>
);

// SVG 2: What Is Risk Discipline
const WhatIsRiskDisciplineSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">What Is Risk Discipline?</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">The practice of consistent, repeated behaviors that protect your capital</text>
    
    {/* Central concept */}
    <g transform="translate(250, 75)">
      <rect x="0" y="0" width="200" height="50" fill="#059669" rx="10"/>
      <text x="100" y="30" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">RISK DISCIPLINE</text>
    </g>
    
    {/* Branches */}
    <g transform="translate(60, 150)">
      {/* Branch 1 */}
      <rect x="0" y="0" width="170" height="70" fill="#dcfce7" rx="8" stroke="#86efac" strokeWidth="1"/>
      <text x="85" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">🔄 Consistent Actions</text>
      <text x="85" y="42" textAnchor="middle" fontSize="8" fill="#14532d">Same rules, every time</text>
      <text x="85" y="56" textAnchor="middle" fontSize="8" fill="#14532d">No exceptions for "special" cases</text>
      
      {/* Line to center */}
      <line x1="85" y1="-25" x2="250" y2="-50" stroke="#86efac" strokeWidth="2"/>
    </g>
    
    <g transform="translate(265, 150)">
      {/* Branch 2 */}
      <rect x="0" y="0" width="170" height="70" fill="#dbeafe" rx="8" stroke="#93c5fd" strokeWidth="1"/>
      <text x="85" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1e40af">📋 Pre-set Boundaries</text>
      <text x="85" y="42" textAnchor="middle" fontSize="8" fill="#1e3a8a">Decisions made in advance</text>
      <text x="85" y="56" textAnchor="middle" fontSize="8" fill="#1e3a8a">Not during emotional moments</text>
      
      {/* Line to center */}
      <line x1="85" y1="-25" x2="85" y2="-50" stroke="#93c5fd" strokeWidth="2"/>
    </g>
    
    <g transform="translate(470, 150)">
      {/* Branch 3 */}
      <rect x="0" y="0" width="170" height="70" fill="#fef9c3" rx="8" stroke="#fcd34d" strokeWidth="1"/>
      <text x="85" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#92400e">🛡️ Protection Focus</text>
      <text x="85" y="42" textAnchor="middle" fontSize="8" fill="#78350f">Capital preservation first</text>
      <text x="85" y="56" textAnchor="middle" fontSize="8" fill="#78350f">Growth comes from survival</text>
      
      {/* Line to center */}
      <line x1="85" y1="-25" x2="-80" y2="-50" stroke="#fcd34d" strokeWidth="2"/>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="250" width="500" height="35" fill="#1e293b" rx="8"/>
    <text x="350" y="272" textAnchor="middle" fontSize="10" fill="white">Discipline is not a single decision — it's thousands of small choices, made correctly, over time.</text>
  </svg>
);

// SVG 3: Habit Loop
const HabitLoopSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">The Discipline Habit Loop</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Good habits become automatic with repetition</text>
    
    {/* Circular habit loop */}
    <g transform="translate(200, 100)">
      {/* Circle path */}
      <circle cx="150" cy="100" r="80" fill="none" stroke="#e2e8f0" strokeWidth="8"/>
      
      {/* Arrows on circle */}
      <path d="M150 20 A80 80 0 0 1 230 100" fill="none" stroke="#22c55e" strokeWidth="6" strokeLinecap="round"/>
      <polygon points="225,90 235,100 225,110" fill="#22c55e"/>
      
      <path d="M230 100 A80 80 0 0 1 150 180" fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round"/>
      <polygon points="160,175 150,185 140,175" fill="#3b82f6"/>
      
      <path d="M150 180 A80 80 0 0 1 70 100" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round"/>
      <polygon points="75,110 65,100 75,90" fill="#f59e0b"/>
      
      <path d="M70 100 A80 80 0 0 1 150 20" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round"/>
      <polygon points="140,25 150,15 160,25" fill="#8b5cf6"/>
      
      {/* Labels */}
      <g transform="translate(130, -5)">
        <rect x="0" y="0" width="80" height="25" fill="#22c55e" rx="6"/>
        <text x="40" y="17" textAnchor="middle" fontSize="8" fontWeight="600" fill="white">1. TRIGGER</text>
      </g>
      
      <g transform="translate(235, 85)">
        <rect x="0" y="0" width="80" height="25" fill="#3b82f6" rx="6"/>
        <text x="40" y="17" textAnchor="middle" fontSize="8" fontWeight="600" fill="white">2. ACTION</text>
      </g>
      
      <g transform="translate(110, 185)">
        <rect x="0" y="0" width="80" height="25" fill="#f59e0b" rx="6"/>
        <text x="40" y="17" textAnchor="middle" fontSize="8" fontWeight="600" fill="white">3. RESULT</text>
      </g>
      
      <g transform="translate(-15, 85)">
        <rect x="0" y="0" width="80" height="25" fill="#8b5cf6" rx="6"/>
        <text x="40" y="17" textAnchor="middle" fontSize="8" fontWeight="600" fill="white">4. REINFORCE</text>
      </g>
      
      {/* Center text */}
      <text x="150" y="95" textAnchor="middle" fontSize="10" fontWeight="600" fill="#334155">HABIT</text>
      <text x="150" y="110" textAnchor="middle" fontSize="10" fontWeight="600" fill="#334155">LOOP</text>
    </g>
    
    {/* Example */}
    <g transform="translate(480, 80)">
      <rect x="0" y="0" width="180" height="140" fill="#f0fdf4" rx="10" stroke="#86efac" strokeWidth="1"/>
      <text x="90" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">Example:</text>
      <text x="90" y="45" textAnchor="middle" fontSize="8" fill="#14532d">Trigger: About to enter position</text>
      <text x="90" y="65" textAnchor="middle" fontSize="8" fill="#14532d">Action: Check position size</text>
      <text x="90" y="85" textAnchor="middle" fontSize="8" fill="#14532d">Result: Appropriate exposure</text>
      <text x="90" y="105" textAnchor="middle" fontSize="8" fill="#14532d">Reinforce: Peace of mind</text>
      <text x="90" y="128" textAnchor="middle" fontSize="8" fontWeight="600" fill="#166534">→ Becomes automatic</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="270" width="500" height="35" fill="#059669" rx="8"/>
    <text x="350" y="292" textAnchor="middle" fontSize="10" fill="white">Each repetition strengthens the habit. Eventually, discipline becomes effortless.</text>
  </svg>
);

// SVG 4: Daily, Weekly, Long-term Habits
const HabitTimeframesSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Discipline Habits Across Timeframes</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Different habits for different rhythms</text>
    
    {/* Daily */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="190" height="200" fill="#dbeafe" rx="12" stroke="#93c5fd" strokeWidth="2"/>
      <text x="95" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e40af">📅 Daily Habits</text>
      
      <g transform="translate(15, 50)">
        <circle cx="8" cy="8" r="4" fill="#3b82f6"/>
        <text x="20" y="12" fontSize="8" fill="#1e3a8a">Check position sizes</text>
        
        <circle cx="8" cy="28" r="4" fill="#3b82f6"/>
        <text x="20" y="32" fontSize="8" fill="#1e3a8a">Review open exposure</text>
        
        <circle cx="8" cy="48" r="4" fill="#3b82f6"/>
        <text x="20" y="52" fontSize="8" fill="#1e3a8a">Avoid impulsive decisions</text>
        
        <circle cx="8" cy="68" r="4" fill="#3b82f6"/>
        <text x="20" y="72" fontSize="8" fill="#1e3a8a">Stay within planned limits</text>
        
        <circle cx="8" cy="88" r="4" fill="#3b82f6"/>
        <text x="20" y="92" fontSize="8" fill="#1e3a8a">Note emotional state</text>
      </g>
      
      <rect x="15" y="160" width="160" height="28" fill="#eff6ff" rx="6"/>
      <text x="95" y="178" textAnchor="middle" fontSize="8" fill="#1e40af">Frequency: Every session</text>
    </g>
    
    {/* Weekly */}
    <g transform="translate(255, 75)">
      <rect x="0" y="0" width="190" height="200" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="95" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">📊 Weekly Habits</text>
      
      <g transform="translate(15, 50)">
        <circle cx="8" cy="8" r="4" fill="#22c55e"/>
        <text x="20" y="12" fontSize="8" fill="#14532d">Review week's decisions</text>
        
        <circle cx="8" cy="28" r="4" fill="#22c55e"/>
        <text x="20" y="32" fontSize="8" fill="#14532d">Check overall allocation</text>
        
        <circle cx="8" cy="48" r="4" fill="#22c55e"/>
        <text x="20" y="52" fontSize="8" fill="#14532d">Identify any rule breaks</text>
        
        <circle cx="8" cy="68" r="4" fill="#22c55e"/>
        <text x="20" y="72" fontSize="8" fill="#14532d">Assess emotional patterns</text>
        
        <circle cx="8" cy="88" r="4" fill="#22c55e"/>
        <text x="20" y="92" fontSize="8" fill="#14532d">Plan adjustments if needed</text>
      </g>
      
      <rect x="15" y="160" width="160" height="28" fill="#f0fdf4" rx="6"/>
      <text x="95" y="178" textAnchor="middle" fontSize="8" fill="#166534">Frequency: Once weekly</text>
    </g>
    
    {/* Long-term */}
    <g transform="translate(460, 75)">
      <rect x="0" y="0" width="190" height="200" fill="#fef9c3" rx="12" stroke="#fcd34d" strokeWidth="2"/>
      <text x="95" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#92400e">🎯 Long-term Habits</text>
      
      <g transform="translate(15, 50)">
        <circle cx="8" cy="8" r="4" fill="#f59e0b"/>
        <text x="20" y="12" fontSize="8" fill="#78350f">Quarterly portfolio review</text>
        
        <circle cx="8" cy="28" r="4" fill="#f59e0b"/>
        <text x="20" y="32" fontSize="8" fill="#78350f">Annual approach assessment</text>
        
        <circle cx="8" cy="48" r="4" fill="#f59e0b"/>
        <text x="20" y="52" fontSize="8" fill="#78350f">Update risk boundaries</text>
        
        <circle cx="8" cy="68" r="4" fill="#f59e0b"/>
        <text x="20" y="72" fontSize="8" fill="#78350f">Reflect on major lessons</text>
        
        <circle cx="8" cy="88" r="4" fill="#f59e0b"/>
        <text x="20" y="92" fontSize="8" fill="#78350f">Recommit to principles</text>
      </g>
      
      <rect x="15" y="160" width="160" height="28" fill="#fefce8" rx="6"/>
      <text x="95" y="178" textAnchor="middle" fontSize="8" fill="#92400e">Frequency: Quarterly/Yearly</text>
    </g>
    
    {/* Connection arrow */}
    <g transform="translate(100, 290)">
      <line x1="0" y1="0" x2="500" y2="0" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
      <text x="250" y="18" textAnchor="middle" fontSize="9" fill="#64748b">All timeframes work together to build lasting discipline</text>
    </g>
  </svg>
);

// SVG 5: One-time vs Consistent Behavior
const OneTimeVsConsistentSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">One-Time Decisions vs Consistent Behavior</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Discipline is not a moment — it's a pattern</text>
    
    {/* One-time decision */}
    <g transform="translate(60, 80)">
      <rect x="0" y="0" width="260" height="180" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="130" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">❌ One-Time Decision</text>
      
      {/* Timeline with single point */}
      <g transform="translate(30, 60)">
        <line x1="0" y1="30" x2="200" y2="30" stroke="#e2e8f0" strokeWidth="2"/>
        
        {/* Single good decision */}
        <circle cx="50" cy="30" r="10" fill="#22c55e"/>
        <text x="50" y="50" textAnchor="middle" fontSize="7" fill="#166534">Good</text>
        
        {/* Followed by inconsistency */}
        <circle cx="100" cy="30" r="8" fill="#ef4444"/>
        <circle cx="140" cy="30" r="8" fill="#94a3b8"/>
        <circle cx="180" cy="30" r="8" fill="#ef4444"/>
        
        <text x="140" y="55" textAnchor="middle" fontSize="7" fill="#991b1b">Inconsistent after</text>
      </g>
      
      <text x="130" y="140" textAnchor="middle" fontSize="9" fill="#991b1b">"I'll be disciplined this time"</text>
      <text x="130" y="158" textAnchor="middle" fontSize="9" fill="#991b1b">→ Doesn't protect long-term</text>
      <text x="130" y="172" textAnchor="middle" fontSize="8" fill="#7f1d1d">One good choice can't offset many bad ones</text>
    </g>
    
    {/* Consistent behavior */}
    <g transform="translate(380, 80)">
      <rect x="0" y="0" width="260" height="180" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="130" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">✓ Consistent Behavior</text>
      
      {/* Timeline with consistent points */}
      <g transform="translate(30, 60)">
        <line x1="0" y1="30" x2="200" y2="30" stroke="#86efac" strokeWidth="2"/>
        
        {/* Consistent good decisions */}
        <circle cx="25" cy="30" r="8" fill="#22c55e"/>
        <circle cx="65" cy="30" r="8" fill="#22c55e"/>
        <circle cx="105" cy="30" r="8" fill="#22c55e"/>
        <circle cx="145" cy="30" r="8" fill="#22c55e"/>
        <circle cx="185" cy="30" r="8" fill="#22c55e"/>
        
        <text x="100" y="55" textAnchor="middle" fontSize="7" fill="#166534">Pattern of discipline</text>
      </g>
      
      <text x="130" y="140" textAnchor="middle" fontSize="9" fill="#14532d">"I follow my rules, always"</text>
      <text x="130" y="158" textAnchor="middle" fontSize="9" fill="#14532d">→ Compounds into protection</text>
      <text x="130" y="172" textAnchor="middle" fontSize="8" fill="#166534">Many small right choices build survival</text>
    </g>
  </svg>
);

// SVG 6: Two Participants Story
const TwoParticipantsSVG = () => (
  <svg viewBox="0 0 700 360" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="360" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Two Participants, Different Discipline Levels</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Same starting point, divergent paths over time</text>
    
    {/* Starting point */}
    <g transform="translate(300, 70)">
      <rect x="0" y="0" width="100" height="30" fill="#64748b" rx="6"/>
      <text x="50" y="20" textAnchor="middle" fontSize="9" fontWeight="600" fill="white">Year 0: Start</text>
    </g>
    
    {/* Branching paths */}
    <path d="M350 100 L200 140" fill="none" stroke="#ef4444" strokeWidth="2"/>
    <path d="M350 100 L500 140" fill="none" stroke="#22c55e" strokeWidth="2"/>
    
    {/* Undisciplined path */}
    <g transform="translate(50, 145)">
      <rect x="0" y="0" width="280" height="185" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">😰 Participant A: Inconsistent</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="8" fill="#991b1b">Year 1: Good start, then got careless</text>
        <text x="0" y="18" fontSize="8" fill="#991b1b">Year 2: Big loss from oversized position</text>
        <text x="0" y="36" fontSize="8" fill="#991b1b">Year 3: Recovered some, then lost again</text>
        <text x="0" y="54" fontSize="8" fill="#991b1b">Year 4: Frustrated, took bigger risks</text>
        <text x="0" y="72" fontSize="8" fill="#991b1b">Year 5: Significant capital damage</text>
      </g>
      
      <rect x="20" y="135" width="240" height="40" fill="#fecaca" rx="6"/>
      <text x="140" y="155" textAnchor="middle" fontSize="9" fontWeight="600" fill="#dc2626">Result: Struggling to recover</text>
      <text x="140" y="170" textAnchor="middle" fontSize="8" fill="#991b1b">Years of progress lost to moments of weakness</text>
    </g>
    
    {/* Disciplined path */}
    <g transform="translate(370, 145)">
      <rect x="0" y="0" width="280" height="185" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">😌 Participant B: Disciplined</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="8" fill="#14532d">Year 1: Followed rules, modest progress</text>
        <text x="0" y="18" fontSize="8" fill="#14532d">Year 2: Weathered volatility, stayed calm</text>
        <text x="0" y="36" fontSize="8" fill="#14532d">Year 3: Continued consistency, growing</text>
        <text x="0" y="54" fontSize="8" fill="#14532d">Year 4: Avoided major mistakes</text>
        <text x="0" y="72" fontSize="8" fill="#14532d">Year 5: Compounding working in their favor</text>
      </g>
      
      <rect x="20" y="135" width="240" height="40" fill="#bbf7d0" rx="6"/>
      <text x="140" y="155" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">Result: Steady growth, peace of mind</text>
      <text x="140" y="170" textAnchor="middle" fontSize="8" fill="#14532d">Discipline turned time into an ally</text>
    </g>
  </svg>
);

// SVG 7: Long-term Survival Curve
const SurvivalCurveSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">The Long-Term Survival Curve</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Discipline determines who stays in the game</text>
    
    {/* Chart area */}
    <g transform="translate(80, 80)">
      {/* Axes */}
      <line x1="0" y1="170" x2="540" y2="170" stroke="#cbd5e1" strokeWidth="2"/>
      <line x1="0" y1="0" x2="0" y2="170" stroke="#cbd5e1" strokeWidth="2"/>
      
      {/* Y-axis label */}
      <text x="-20" y="85" textAnchor="middle" fontSize="9" fill="#64748b" transform="rotate(-90, -20, 85)">Participants Remaining</text>
      
      {/* X-axis label */}
      <text x="270" y="195" textAnchor="middle" fontSize="9" fill="#64748b">Time (Years)</text>
      
      {/* X-axis markers */}
      <text x="0" y="185" textAnchor="middle" fontSize="8" fill="#94a3b8">0</text>
      <text x="135" y="185" textAnchor="middle" fontSize="8" fill="#94a3b8">5</text>
      <text x="270" y="185" textAnchor="middle" fontSize="8" fill="#94a3b8">10</text>
      <text x="405" y="185" textAnchor="middle" fontSize="8" fill="#94a3b8">15</text>
      <text x="540" y="185" textAnchor="middle" fontSize="8" fill="#94a3b8">20</text>
      
      {/* Undisciplined curve - drops sharply */}
      <path d="M0 20 Q50 30 100 60 Q150 100 200 130 Q250 150 300 158 Q400 165 540 168" 
            fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
      <text x="460" y="155" fontSize="8" fill="#dc2626">Undisciplined</text>
      <text x="460" y="168" fontSize="7" fill="#991b1b">(Many exit early)</text>
      
      {/* Disciplined curve - stays higher */}
      <path d="M0 20 Q100 25 200 35 Q300 50 400 65 Q500 80 540 90" 
            fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round"/>
      <text x="460" y="80" fontSize="8" fill="#166534">Disciplined</text>
      <text x="460" y="93" fontSize="7" fill="#14532d">(Most survive)</text>
      
      {/* Starting point */}
      <circle cx="0" cy="20" r="6" fill="#64748b"/>
      <text x="15" y="15" fontSize="8" fill="#64748b">Everyone starts here</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="260" width="500" height="28" fill="#1e293b" rx="6"/>
    <text x="350" y="279" textAnchor="middle" fontSize="9" fill="white">The market doesn't care about brilliance. It rewards those who survive long enough to benefit.</text>
  </svg>
);

// SVG 8: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 200" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="200" fill="#f8fafc" rx="16"/>
    
    {/* Central message */}
    <rect x="50" y="25" width="600" height="150" fill="url(#disciplineGradient)" rx="16"/>
    
    <defs>
      <linearGradient id="disciplineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#059669"/>
        <stop offset="100%" stopColor="#0d9488"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="55" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">🏆 Final Takeaway</text>
    
    <text x="350" y="85" textAnchor="middle" fontSize="11" fill="white">Discipline is not about being perfect.</text>
    <text x="350" y="107" textAnchor="middle" fontSize="11" fill="white">It's about being consistent enough, often enough, for long enough</text>
    <text x="350" y="129" textAnchor="middle" fontSize="11" fill="white">that the math works in your favor.</text>
    <text x="350" y="160" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fef3c7">SURVIVE. STAY. SUCCEED.</text>
  </svg>
);

const RiskLesson7 = () => {
  const navigate = useNavigate();

  const quizQuestions = [
    {
      question: "What is risk discipline?",
      options: [
        "Making one big correct decision",
        "Avoiding all risk entirely",
        "Consistent, repeated behaviors that protect your capital over time",
        "Following market predictions accurately"
      ],
      correctAnswer: "Consistent, repeated behaviors that protect your capital over time",
      explanation: "Risk discipline is not about a single choice — it's about thousands of small, consistent behaviors that compound into long-term protection and survival."
    },
    {
      question: "Why does discipline matter more than intelligence in markets?",
      options: [
        "Because intelligent people make more mistakes",
        "Because knowing what to do is useless without the consistency to do it",
        "Because markets reward random behavior",
        "Because discipline makes you smarter over time"
      ],
      correctAnswer: "Because knowing what to do is useless without the consistency to do it",
      explanation: "Many people understand the right approach but fail to follow it consistently. Intelligence without discipline leads to knowing what to do but not doing it when it matters most."
    }
  ];

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/learn/risk-management')}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 transition-colors mb-4"
          >
            <FaArrowLeft />
            <span>Back to Risk Management</span>
          </button>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
              Lesson 7 of 7 — Final Lesson
            </span>
            <h1 className="text-3xl font-bold text-gray-800 mt-4">Risk Discipline & Long-Term Survival</h1>
            <p className="text-gray-600 mt-2">Building habits that protect you for decades</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Discipline Matters More Than Intelligence</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Here's an uncomfortable truth about markets: <strong>intelligence alone doesn't 
              protect you</strong>. There are plenty of brilliant people who understand risk 
              perfectly — and still blow up their portfolios.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Why? Because knowing what to do is only half the equation. The other half — the 
              harder half — is <strong>consistently doing it</strong>. Day after day, decision 
              after decision, especially when emotions are screaming at you to do something else.
            </p>
            <p className="text-lg leading-relaxed">
              This final lesson is about discipline: what it means, why it compounds over time, 
              and how to build habits that protect your capital not just today, but for the 
              decades ahead. Discipline isn't glamorous. But it's what separates those who 
              survive from those who don't.
            </p>
          </div>

          <DisciplineVsIntelligenceSVG />
        </div>

        {/* What Is Risk Discipline */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">What Is Risk Discipline?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Risk discipline is <strong>the practice of consistent, repeated behaviors that 
              protect your capital</strong>. It's not a single decision. It's thousands of 
              small choices, made correctly, over time.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              It means following the same rules every time — not just when it's easy, but 
              especially when it's hard. It means having pre-set boundaries that you respect 
              even when your emotions push against them.
            </p>
            <p className="text-lg leading-relaxed">
              Most importantly, it means accepting that <strong>protection comes before 
              growth</strong>. You can't compound what you've lost. Every disciplined choice 
              is an investment in your future ability to participate.
            </p>
          </div>

          <WhatIsRiskDisciplineSVG />
        </div>

        {/* Habit Loop */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Building Discipline Through Habits</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              The secret to discipline is making it <strong>automatic</strong>. When protective 
              behaviors become habits, you don't have to fight yourself every time. The right 
              action becomes the default action.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Habits work through repetition. Each time you follow your rules, you strengthen 
              the neural pathways that make following them easier next time. The struggle 
              decreases. The discipline becomes effortless.
            </p>
            <p className="text-lg leading-relaxed">
              This is why early consistency matters so much. You're not just making one good 
              decision — you're building the infrastructure for a lifetime of good decisions.
            </p>
          </div>

          <HabitLoopSVG />
        </div>

        {/* Habit Timeframes */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Daily, Weekly, and Long-Term Habits</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Discipline operates across different timeframes. You need habits for the short 
              term — things you check every day or every session. You need habits for the 
              medium term — weekly reviews and adjustments. And you need habits for the 
              long term — periodic deep reflections on your approach.
            </p>
            <p className="text-lg leading-relaxed">
              Each layer supports the others. Daily habits keep you safe moment to moment. 
              Weekly habits catch patterns before they become problems. Long-term habits 
              ensure you're still aligned with your principles as life changes around you.
            </p>
          </div>

          <HabitTimeframesSVG />
        </div>

        {/* One-time vs Consistent */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">One-Time Decisions vs Consistent Behavior</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Many people confuse making a good decision once with being disciplined. They 
              follow their rules for a while, feel proud, and then gradually let things 
              slip. "I'll be careful this time" becomes a pattern of exceptions.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              True discipline isn't about one moment — it's about <strong>pattern consistency</strong>. 
              One good choice can't offset many careless ones. What protects you is the 
              accumulation of small, repeated right actions over time.
            </p>
            <p className="text-lg leading-relaxed">
              Ask yourself: "Would I be comfortable if I repeated this behavior for the next 
              ten years?" If the answer is no, you're not being disciplined — you're getting 
              lucky.
            </p>
          </div>

          <OneTimeVsConsistentSVG />
        </div>

        {/* Two Participants */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Two Participants, Divergent Paths</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Consider two people who start their market journey at the same time, with the 
              same resources and the same knowledge. The only difference is discipline.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              <strong>Participant A</strong> understands risk but doesn't consistently apply 
              what they know. They make good decisions sometimes, but under pressure they 
              break rules. Over years, these exceptions compound into significant damage.
            </p>
            <p className="text-lg leading-relaxed">
              <strong>Participant B</strong> follows their rules consistently, even when it's 
              uncomfortable. Progress is modest but steady. Over time, discipline turns into 
              compounding, and time becomes their ally rather than their enemy.
            </p>
          </div>

          <TwoParticipantsSVG />
        </div>

        {/* Survival Curve */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">The Long-Term Survival Curve</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Markets are often described as a "survival game." Everyone starts, but over 
              time, participants exit — some by choice, many by necessity. Those who remain 
              are disproportionately disciplined.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The undisciplined curve drops sharply in the early years. Big mistakes, 
              emotional decisions, and compounding losses force people out. By year five 
              or ten, many are gone.
            </p>
            <p className="text-lg leading-relaxed">
              The disciplined curve stays higher. Not because these participants are smarter 
              or luckier, but because they avoid the catastrophic errors that end careers. 
              <strong>Survival is the ultimate edge.</strong>
            </p>
          </div>

          <SurvivalCurveSVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
          
          <div className="mt-6 bg-emerald-50 rounded-xl p-5 border border-emerald-200">
            <p className="text-emerald-800 font-medium">
              Remember: Discipline isn't about being perfect. You'll make mistakes. What 
              matters is that your baseline behavior — your default patterns — protect your 
              capital. When discipline is your habit, occasional errors don't compound into 
              disasters. You recover, learn, and continue. That's how long-term survival works.
            </p>
          </div>
        </div>

        {/* India-specific Context */}
        <div className="bg-emerald-50 rounded-2xl p-6 shadow-lg mb-8 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-800 mb-3">🌍 Global Context</h3>
          <p className="text-emerald-900">
            Disciplined investing is emphasized in every major financial market worldwide. 
            From Warren Buffett in the United States to disciplined fund managers in Europe, 
            Asia, and India, the message is consistent: long-term success comes from 
            consistent, rule-based behavior rather than sporadic brilliance. Whether you're 
            participating in Indian markets, global equities, or any other asset class, the 
            principle remains universal — discipline compounds, and discipline survives.
          </p>
        </div>

        {/* Quiz Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Knowledge Check</h2>
          {quizQuestions.map((q, index) => (
            <QuizQuestion key={index} {...q} />
          ))}
        </div>

        {/* Final Reflection Activity */}
        <div className="bg-gradient-to-r from-teal-100 to-emerald-100 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-500 rounded-full p-3">
              <FaLightbulb className="text-white text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-emerald-800 mb-3">Final Reflection: Your Commitment</h3>
              <div className="bg-white rounded-xl p-5 border border-emerald-200">
                <p className="text-gray-800 font-medium mb-4">
                  As you complete this module, make a commitment to yourself:
                </p>
                <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                  <p className="text-emerald-900 font-semibold text-lg mb-2">
                    What is ONE discipline habit you will commit to practicing consistently?
                  </p>
                  <p className="text-emerald-800 text-sm">
                    Choose something specific and actionable. Not "be more careful" but 
                    something like "always check my position size before entering" or 
                    "review my week's decisions every Sunday."
                  </p>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">1.</span>
                    <span>Write down your chosen habit. Make it specific enough that you'll know whether you did it or not.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">2.</span>
                    <span>Decide when and how often you'll practice it. Daily? Weekly? Before every decision?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">3.</span>
                    <span>Commit to practicing it for at least 30 days without exception. After that, it will start becoming automatic.</span>
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-amber-800 text-sm">
                    <strong>Why one habit?</strong> Starting with one achievable commitment 
                    is more powerful than promising yourself twenty changes you won't sustain. 
                    Master one habit, then add another. Discipline builds on itself.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module Completion Summary */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 shadow-lg mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <FaTrophy className="text-yellow-300 text-2xl" />
            <h3 className="text-xl font-bold">Module Complete: Risk Management Mastery</h3>
          </div>
          <p className="text-emerald-100 mb-4">
            Congratulations on completing the Risk Management module. You've learned the 
            foundational principles that separate long-term survivors from those who exit early.
          </p>
          <h4 className="font-bold mb-2">Key Concepts Covered:</h4>
          <ul className="space-y-2 text-lg mb-4">
            <li>• <strong>Lesson 1:</strong> What risk actually means in financial markets</li>
            <li>• <strong>Lesson 2:</strong> Why capital protection always comes first</li>
            <li>• <strong>Lesson 3:</strong> Types of risk — market, system, and emotional</li>
            <li>• <strong>Lesson 4:</strong> Position sizing and exposure control</li>
            <li>• <strong>Lesson 5:</strong> Drawdowns and the reality of recovery</li>
            <li>• <strong>Lesson 6:</strong> Risk differences in trading vs investing</li>
            <li>• <strong>Lesson 7:</strong> Discipline and long-term survival</li>
          </ul>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-white font-medium">
              🎯 Your Next Step: Apply what you've learned. Start with one discipline habit. 
              Build consistency. Let time work for you. That's how lasting wealth is protected 
              and grown.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/risk-lesson-6')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-colors"
          >
            <FaArrowLeft />
            <span>Previous Lesson</span>
          </button>
          <button
            onClick={() => navigate('/learn/risk-management')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl transition-colors"
          >
            <FaTrophy className="text-yellow-300" />
            <span>Complete Module</span>
          </button>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default RiskLesson7;
