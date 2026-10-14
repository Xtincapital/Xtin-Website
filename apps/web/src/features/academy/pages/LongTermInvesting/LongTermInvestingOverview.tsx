import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSeedling, FaCheckCircle, FaClock, FaChartLine, FaLock, FaUserGraduate, FaTimesCircle } from 'react-icons/fa';
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import ModuleBadge from "../../components/ModuleBadge";

// SVG 1: Time & Wealth Hero
const TimeWealthHeroSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The Power of Time in Building Wealth</text>
    
    {/* Central growing tree visualization */}
    <g transform="translate(280, 70)">
      {/* Soil/Foundation */}
      <ellipse cx="70" cy="200" rx="90" ry="20" fill="#654B26" opacity="0.3"/>
      
      {/* Tree trunk */}
      <rect x="55" y="130" width="30" height="70" fill="#654B26" rx="4"/>
      
      {/* Tree crown - representing growth */}
      <ellipse cx="70" cy="100" rx="60" ry="50" fill="#12805A"/>
      <ellipse cx="45" cy="110" rx="35" ry="30" fill="#12805A"/>
      <ellipse cx="95" cy="110" rx="35" ry="30" fill="#12805A"/>
      <ellipse cx="70" cy="70" rx="40" ry="35" fill="#12805A"/>
      
      {/* Money symbols in tree */}
      <text x="50" y="90" fontSize="14" fill="white" fontWeight="600">$</text>
      <text x="70" y="75" fontSize="12" fill="white" fontWeight="600">$</text>
      <text x="85" y="100" fontSize="14" fill="white" fontWeight="600">$</text>
      <text x="60" y="115" fontSize="10" fill="white" fontWeight="600">$</text>
      <text x="80" y="120" fontSize="10" fill="white" fontWeight="600">$</text>
    </g>
    
    {/* Left: Time ingredient */}
    <g transform="translate(40, 90)">
      <rect x="0" y="0" width="180" height="130" fill="#E0E7F1" rx="12" stroke="#9FB3D3" strokeWidth="2"/>
      <text x="90" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2C3F5E">⏰ Time</text>
      
      <text x="90" y="55" textAnchor="middle" fontSize="9" fill="#26354F">The most valuable resource</text>
      <text x="90" y="75" textAnchor="middle" fontSize="9" fill="#26354F">Cannot be bought or recovered</text>
      <text x="90" y="95" textAnchor="middle" fontSize="9" fill="#26354F">Works while you sleep</text>
      <text x="90" y="115" textAnchor="middle" fontSize="9" fontWeight="600" fill="#2C3F5E">Earlier = More powerful</text>
    </g>
    
    {/* Right: Patience ingredient */}
    <g transform="translate(480, 90)">
      <rect x="0" y="0" width="180" height="130" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <text x="90" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">🧘 Patience</text>
      
      <text x="90" y="55" textAnchor="middle" fontSize="9" fill="#12805A">The hardest skill</text>
      <text x="90" y="75" textAnchor="middle" fontSize="9" fill="#12805A">Waiting is active, not passive</text>
      <text x="90" y="95" textAnchor="middle" fontSize="9" fill="#12805A">Discipline through volatility</text>
      <text x="90" y="115" textAnchor="middle" fontSize="9" fontWeight="600" fill="#12805A">Rewards the steady</text>
    </g>
    
    {/* Arrow pointing to result */}
    <line x1="220" y1="180" x2="260" y2="180" stroke="#717680" strokeWidth="2"/>
    <line x1="440" y1="180" x2="480" y2="180" stroke="#717680" strokeWidth="2"/>
    
    {/* Bottom message */}
    <rect x="150" y="280" width="400" height="30" fill="#12805A" rx="8"/>
    <text x="350" y="300" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">Time + Patience + Compounding = Wealth</text>
  </svg>
);

// SVG 2: Compounding Visualization
const CompoundingMagicSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The Magic of Compounding: Growth on Growth</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Same effort, dramatically different results over time</text>
    
    {/* Chart area */}
    <g transform="translate(80, 80)">
      {/* Grid lines */}
      <line x1="0" y1="180" x2="540" y2="180" stroke="#E4E4EA" strokeWidth="1"/>
      <line x1="0" y1="135" x2="540" y2="135" stroke="#E4E4EA" strokeWidth="1" strokeDasharray="4"/>
      <line x1="0" y1="90" x2="540" y2="90" stroke="#E4E4EA" strokeWidth="1" strokeDasharray="4"/>
      <line x1="0" y1="45" x2="540" y2="45" stroke="#E4E4EA" strokeWidth="1" strokeDasharray="4"/>
      <line x1="0" y1="0" x2="0" y2="180" stroke="#E4E4EA" strokeWidth="1"/>
      
      {/* Linear growth (simple interest concept) */}
      <path d="M0 160 L135 140 L270 120 L405 100 L540 80" 
            fill="none" stroke="#A0A3AA" strokeWidth="2" strokeDasharray="5"/>
      <text x="545" y="85" fontSize="8" fill="#717680">Linear</text>
      
      {/* Compound growth curve */}
      <path d="M0 160 Q135 155 270 130 Q400 80 480 30 L540 10" 
            fill="none" stroke="#12805A" strokeWidth="3"/>
      <circle cx="540" cy="10" r="5" fill="#12805A"/>
      <text x="545" y="15" fontSize="8" fill="#12805A" fontWeight="600">Compound</text>
      
      {/* Time labels */}
      <text x="0" y="198" textAnchor="middle" fontSize="8" fill="#717680">Start</text>
      <text x="135" y="198" textAnchor="middle" fontSize="8" fill="#717680">Year 10</text>
      <text x="270" y="198" textAnchor="middle" fontSize="8" fill="#717680">Year 20</text>
      <text x="405" y="198" textAnchor="middle" fontSize="8" fill="#717680">Year 30</text>
      <text x="540" y="198" textAnchor="middle" fontSize="8" fill="#717680">Year 40</text>
      
      {/* Annotation: The hockey stick moment */}
      <g transform="translate(350, 50)">
        <rect x="0" y="0" width="120" height="40" fill="#F6ECCE" rx="6" stroke="#E2C273" strokeWidth="1"/>
        <text x="60" y="18" textAnchor="middle" fontSize="8" fontWeight="600" fill="#654B26">The "Hockey Stick"</text>
        <text x="60" y="32" textAnchor="middle" fontSize="7" fill="#533E22">Most growth in later years</text>
        <line x1="60" y1="40" x2="130" y2="80" stroke="#E2C273" strokeWidth="1"/>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="270" width="500" height="22" fill="#2A2A2C" rx="4"/>
    <text x="350" y="285" textAnchor="middle" fontSize="9" fill="white">Compounding is slow then sudden. The last decade often creates more wealth than the first three combined.</text>
  </svg>
);

// SVG 3: Slow Wealth vs Get Rich Quick
const SlowWealthSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Why Most Wealth Is Built Slowly, Not Quickly</text>
    
    {/* Left: Get Rich Quick approach */}
    <g transform="translate(50, 60)">
      <rect x="0" y="0" width="270" height="210" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">❌ "Get Rich Quick" Mindset</text>
      
      {/* Volatile chart */}
      <g transform="translate(30, 50)">
        <path d="M0 80 L30 40 L60 90 L90 20 L120 100 L150 30 L180 110" 
              fill="none" stroke="#E04848" strokeWidth="2"/>
        <circle cx="180" cy="110" r="4" fill="#E04848"/>
      </g>
      
      <g transform="translate(20, 140)">
        <text x="0" y="0" fontSize="9" fill="#842428">• Chasing hot tips and trends</text>
        <text x="0" y="18" fontSize="9" fill="#842428">• Emotional buying and selling</text>
        <text x="0" y="36" fontSize="9" fill="#842428">• High activity, high fees</text>
        <text x="0" y="54" fontSize="9" fill="#842428">• Stress and anxiety</text>
      </g>
      
      <rect x="20" y="190" width="230" height="15" fill="#F6C3C3" rx="4"/>
      <text x="135" y="201" textAnchor="middle" fontSize="8" fill="#842428">Often ends in disappointment</text>
    </g>
    
    {/* Right: Slow & Steady approach */}
    <g transform="translate(380, 60)">
      <rect x="0" y="0" width="270" height="210" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">✓ Slow & Steady Approach</text>
      
      {/* Steady upward chart */}
      <g transform="translate(30, 50)">
        <path d="M0 100 Q45 95 90 85 Q135 70 180 45" 
              fill="none" stroke="#12805A" strokeWidth="2"/>
        <circle cx="180" cy="45" r="4" fill="#12805A"/>
      </g>
      
      <g transform="translate(20, 140)">
        <text x="0" y="0" fontSize="9" fill="#12805A">• Consistent, boring contributions</text>
        <text x="0" y="18" fontSize="9" fill="#12805A">• Ignore short-term noise</text>
        <text x="0" y="36" fontSize="9" fill="#12805A">• Low activity, low fees</text>
        <text x="0" y="54" fontSize="9" fill="#12805A">• Peace of mind</text>
      </g>
      
      <rect x="20" y="190" width="230" height="15" fill="#ABE5CC" rx="4"/>
      <text x="135" y="201" textAnchor="middle" fontSize="8" fill="#12805A">Historically proven to work</text>
    </g>
  </svg>
);

// SVG 4: Time vs Timing
const TimeVsTimingSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Time IN the Market vs Timing the Market</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">One of the most important distinctions in investing</text>
    
    {/* Left: Market Timer */}
    <g transform="translate(50, 70)">
      <rect x="0" y="0" width="270" height="180" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
      <text x="135" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#654B26">⏱️ Market Timing</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="9" fill="#533E22">Attempts to predict:</text>
        <text x="0" y="18" fontSize="9" fill="#533E22">• When to buy (market bottoms)</text>
        <text x="0" y="36" fontSize="9" fill="#533E22">• When to sell (market tops)</text>
        <text x="0" y="54" fontSize="9" fill="#533E22">• When to stay in cash</text>
      </g>
      
      <rect x="20" y="115" width="230" height="50" fill="#FDF1F1" rx="6"/>
      <text x="135" y="133" textAnchor="middle" fontSize="8" fontWeight="600" fill="#C7363B">The Problem:</text>
      <text x="135" y="148" textAnchor="middle" fontSize="8" fill="#842428">Requires being right twice.</text>
      <text x="135" y="160" textAnchor="middle" fontSize="8" fill="#842428">Missing the best days destroys returns.</text>
    </g>
    
    {/* Right: Time in Market */}
    <g transform="translate(380, 70)">
      <rect x="0" y="0" width="270" height="180" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <text x="135" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">📅 Time in Market</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="9" fill="#12805A">Simply stays invested:</text>
        <text x="0" y="18" fontSize="9" fill="#12805A">• Through market ups</text>
        <text x="0" y="36" fontSize="9" fill="#12805A">• Through market downs</text>
        <text x="0" y="54" fontSize="9" fill="#12805A">• Consistently, year after year</text>
      </g>
      
      <rect x="20" y="115" width="230" height="50" fill="#EEF9F4" rx="6"/>
      <text x="135" y="133" textAnchor="middle" fontSize="8" fontWeight="600" fill="#12805A">The Advantage:</text>
      <text x="135" y="148" textAnchor="middle" fontSize="8" fill="#12805A">No prediction required.</text>
      <text x="135" y="160" textAnchor="middle" fontSize="8" fill="#12805A">Captures long-term market growth.</text>
    </g>
  </svg>
);

// SVG 5: Who This Module Is For
const WhoIsThisForSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Who This Module Is For</text>
    
    {/* This IS for you */}
    <g transform="translate(50, 55)">
      <rect x="0" y="0" width="280" height="240" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">✓ This Module IS For You If...</text>
      
      <g transform="translate(20, 50)">
        <circle cx="8" cy="8" r="4" fill="#12805A"/>
        <text x="20" y="12" fontSize="9" fill="#12805A">You want to build wealth over years/decades</text>
        
        <circle cx="8" cy="32" r="4" fill="#12805A"/>
        <text x="20" y="36" fontSize="9" fill="#12805A">You're tired of short-term market noise</text>
        
        <circle cx="8" cy="56" r="4" fill="#12805A"/>
        <text x="20" y="60" fontSize="9" fill="#12805A">You value peace of mind over excitement</text>
        
        <circle cx="8" cy="80" r="4" fill="#12805A"/>
        <text x="20" y="84" fontSize="9" fill="#12805A">You understand that slow is sustainable</text>
        
        <circle cx="8" cy="104" r="4" fill="#12805A"/>
        <text x="20" y="108" fontSize="9" fill="#12805A">You want a proven, simple approach</text>
        
        <circle cx="8" cy="128" r="4" fill="#12805A"/>
        <text x="20" y="132" fontSize="9" fill="#12805A">You're willing to be patient</text>
        
        <circle cx="8" cy="152" r="4" fill="#12805A"/>
        <text x="20" y="156" fontSize="9" fill="#12805A">You completed Risk Management module</text>
        
        <circle cx="8" cy="176" r="4" fill="#12805A"/>
        <text x="20" y="180" fontSize="9" fill="#12805A">You want process over prediction</text>
      </g>
    </g>
    
    {/* This is NOT for you */}
    <g transform="translate(370, 55)">
      <rect x="0" y="0" width="280" height="240" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">✗ This Module Is NOT For You If...</text>
      
      <g transform="translate(20, 50)">
        <circle cx="8" cy="8" r="4" fill="#E04848"/>
        <text x="20" y="12" fontSize="9" fill="#842428">You want to get rich quickly</text>
        
        <circle cx="8" cy="32" r="4" fill="#E04848"/>
        <text x="20" y="36" fontSize="9" fill="#842428">You enjoy frequent trading action</text>
        
        <circle cx="8" cy="56" r="4" fill="#E04848"/>
        <text x="20" y="60" fontSize="9" fill="#842428">You want stock tips or hot picks</text>
        
        <circle cx="8" cy="80" r="4" fill="#E04848"/>
        <text x="20" y="84" fontSize="9" fill="#842428">You're looking for market timing secrets</text>
        
        <circle cx="8" cy="104" r="4" fill="#E04848"/>
        <text x="20" y="108" fontSize="9" fill="#842428">You expect guaranteed returns</text>
        
        <circle cx="8" cy="128" r="4" fill="#E04848"/>
        <text x="20" y="132" fontSize="9" fill="#842428">You can't handle short-term volatility</text>
        
        <circle cx="8" cy="152" r="4" fill="#E04848"/>
        <text x="20" y="156" fontSize="9" fill="#842428">You need the money within 5 years</text>
        
        <circle cx="8" cy="176" r="4" fill="#E04848"/>
        <text x="20" y="180" fontSize="9" fill="#842428">You prefer excitement over results</text>
      </g>
    </g>
  </svg>
);

// SVG 6: What You'll Learn
const WhatYoullLearnSVG = () => (
  <svg viewBox="0 0 700 260" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="260" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">What You'll Clearly Understand After This Module</text>
    
    {/* Learning outcomes in a flow */}
    <g transform="translate(50, 60)">
      {/* Row 1 */}
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="180" height="70" fill="#E0E7F1" rx="10" stroke="#9FB3D3" strokeWidth="1"/>
        <text x="90" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#2C3F5E">📚 Understand</text>
        <text x="90" y="45" textAnchor="middle" fontSize="8" fill="#26354F">How long-term investing</text>
        <text x="90" y="58" textAnchor="middle" fontSize="8" fill="#26354F">actually builds wealth</text>
      </g>
      
      <g transform="translate(210, 0)">
        <rect x="0" y="0" width="180" height="70" fill="#EEF9F4" rx="10" stroke="#3CCB97" strokeWidth="1"/>
        <text x="90" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#12805A">⏰ Know Why</text>
        <text x="90" y="45" textAnchor="middle" fontSize="8" fill="#12805A">Time in market beats</text>
        <text x="90" y="58" textAnchor="middle" fontSize="8" fill="#12805A">timing the market</text>
      </g>
      
      <g transform="translate(420, 0)">
        <rect x="0" y="0" width="180" height="70" fill="#F6ECCE" rx="10" stroke="#E2C273" strokeWidth="1"/>
        <text x="90" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#654B26">📈 Grasp</text>
        <text x="90" y="45" textAnchor="middle" fontSize="8" fill="#533E22">How compounding works</text>
        <text x="90" y="58" textAnchor="middle" fontSize="8" fill="#533E22">intuitively</text>
      </g>
      
      {/* Row 2 */}
      <g transform="translate(0, 90)">
        <rect x="0" y="0" width="180" height="70" fill="#ECE4F6" rx="10" stroke="#C0A9E2" strokeWidth="1"/>
        <text x="90" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#654B8A">🎯 Learn Why</text>
        <text x="90" y="45" textAnchor="middle" fontSize="8" fill="#533F70">Simplicity beats</text>
        <text x="90" y="58" textAnchor="middle" fontSize="8" fill="#533F70">complexity</text>
      </g>
      
      <g transform="translate(210, 90)">
        <rect x="0" y="0" width="180" height="70" fill="#ECE4F6" rx="10" stroke="#C0A9E2" strokeWidth="1"/>
        <text x="90" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#654B8A">🧠 Develop</text>
        <text x="90" y="45" textAnchor="middle" fontSize="8" fill="#533F70">Long-term mindset</text>
        <text x="90" y="58" textAnchor="middle" fontSize="8" fill="#533F70">and discipline</text>
      </g>
      
      <g transform="translate(420, 90)">
        <rect x="0" y="0" width="180" height="70" fill="#D3EEF1" rx="10" stroke="#82CDD6" strokeWidth="1"/>
        <text x="90" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#2A8C9A">💪 Build</text>
        <text x="90" y="45" textAnchor="middle" fontSize="8" fill="#23727E">Confidence in your</text>
        <text x="90" y="58" textAnchor="middle" fontSize="8" fill="#23727E">investment approach</text>
      </g>
    </g>
    
    {/* Bottom message */}
    <rect x="100" y="225" width="500" height="25" fill="#12805A" rx="6"/>
    <text x="350" y="242" textAnchor="middle" fontSize="10" fill="white">You won't just know what to do — you'll understand WHY it works.</text>
  </svg>
);

// SVG 7: Module Philosophy
const ModulePhilosophySVG = () => (
  <svg viewBox="0 0 700 200" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="200" fill="#F5F5F7" rx="16"/>
    
    {/* Central philosophy */}
    <rect x="50" y="25" width="600" height="150" fill="url(#philosophyGrad)" rx="16"/>
    
    <defs>
      <linearGradient id="philosophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#12805A"/>
        <stop offset="100%" stopColor="#2A8C9A"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="55" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">🌱 Core Philosophy of This Module</text>
    
    <text x="350" y="85" textAnchor="middle" fontSize="11" fill="white">Time is the most powerful factor in building wealth.</text>
    <text x="350" y="107" textAnchor="middle" fontSize="11" fill="white">Compounding rewards patience and punishes impatience.</text>
    <text x="350" y="129" textAnchor="middle" fontSize="11" fill="white">Simplicity beats activity. Process beats prediction.</text>
    <text x="350" y="160" textAnchor="middle" fontSize="14" fontWeight="700" fill="#F6ECCE">CALM. PATIENT. DISCIPLINED. WEALTHY.</text>
  </svg>
);

const LongTermInvestingOverview = () => {
  const navigate = useNavigate();

  const lessons = [
    { id: 1, title: 'What Is Long-Term Investing?', available: true, path: '/learn/lti-lesson-1' },
    { id: 2, title: 'The Power of Compounding', available: true, path: '/learn/lti-lesson-2' },
    { id: 3, title: 'Time in Market vs Timing the Market', available: true, path: '/learn/lti-lesson-3' },
    { id: 4, title: 'Volatility & Staying Invested', available: true, path: '/learn/lti-lesson-4' },
    { id: 5, title: 'Diversification & Simplicity', available: true, path: '/learn/lti-lesson-5' },
    { id: 6, title: 'Behavior & Patience in Investing', available: true, path: '/learn/lti-lesson-6' },
    { id: 7, title: 'Building Your Long-Term Mindset', available: true, path: '/learn/lti-lesson-7' },
  ];

  const modulePhilosophy = [
    { icon: '⏰', title: 'Time Is Power', description: 'The most powerful factor in building wealth isn\'t intelligence or skill — it\'s time. The earlier you start, the more time works for you.' },
    { icon: '📈', title: 'Compounding Rewards Patience', description: 'Compound growth starts slow but accelerates. Most wealth is created in the later years when your base is largest.' },
    { icon: '🎯', title: 'Simplicity Beats Activity', description: 'More trading doesn\'t mean more returns. Often, the best action is no action. Simplicity reduces mistakes and fees.' },
    { icon: '🧘', title: 'Process Over Prediction', description: 'You can\'t predict the market. But you can follow a consistent process that gives you the best chance of success over time.' },
  ];

  return (
    <>
      <Navbar />
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/learn" 
            className="inline-flex items-center text-teal-600 hover:text-teal-800 mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Learning Center
          </Link>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-teal-100 p-3 rounded-xl">
                <FaSeedling className="text-teal-600 text-2xl" />
              </div>
              <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                Wealth Building Module
              </span>
            </div>
            <div className="mb-3"><ModuleBadge moduleId="long-term-investing" /></div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-800 mb-2 tracking-[-0.025em]">Long-Term Investing</h1>
            <p className="text-xl text-teal-600 font-medium mb-4">Wealth Building Fundamentals</p>
            <p className="text-gray-600 text-lg">
              Learn the timeless principles of building wealth through patient, disciplined, 
              long-term investing. This module teaches you why time is your greatest asset 
              and how to harness the power of compounding.
            </p>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <TimeWealthHeroSVG />
        </div>

        {/* What Long-Term Investing Really Means */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.025em]">What Long-Term Investing Really Means</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Long-term investing is often misunderstood. It's not simply "buy and hold forever" 
              without thought. It's not being passive to the point of ignorance. And it's 
              certainly not an excuse to avoid learning about markets.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              <strong>Long-term investing is a deliberate strategy</strong> that recognizes a 
              fundamental truth: over extended periods, quality investments tend to grow in 
              value despite short-term volatility. It's the practice of aligning your investment 
              horizon with the natural rhythm of wealth creation — which happens slowly, then suddenly.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              When you invest long-term, you're making a conscious decision to prioritize 
              <strong> time in the market over timing the market</strong>. You're choosing to 
              let compounding work for you rather than fighting against market noise. You're 
              accepting that you cannot predict short-term movements, but you can participate 
              in long-term growth.
            </p>
            <p className="text-lg leading-relaxed">
              Most importantly, long-term investing is about <strong>mindset</strong>. It requires 
              patience when markets fall, discipline when markets rise, and the wisdom to know 
              that your behavior matters far more than your ability to pick winners.
            </p>
          </div>
        </div>

        {/* Why Most Wealth Is Built Slowly */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Why Most Wealth Is Built Slowly, Not Quickly</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              There's a seductive myth in investing: that wealth is created through brilliant 
              trades, perfect timing, and finding the next big thing before everyone else. 
              Stories of overnight fortunes dominate headlines. But they represent the 
              exception, not the rule — and often the exception that ends in disaster.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The reality? <strong>Most sustainable wealth is built boringly</strong>. It's 
              built through consistent contributions, reasonable returns over decades, and 
              the patience to let compounding do its work. It's built by people who ignore 
              the noise and stay the course.
            </p>
            <p className="text-lg leading-relaxed">
              Consider this: a person who invests consistently for 30 years, earning modest 
              but steady returns, will almost always end up wealthier than someone who chases 
              hot stocks, trades frequently, and tries to time markets perfectly. The boring 
              approach works because it works with time rather than against it.
            </p>
          </div>

          <SlowWealthSVG />
          
          <div className="mt-6 bg-teal-50 rounded-xl p-5 border border-teal-200">
            <p className="text-teal-800">
              <strong>The Hidden Truth:</strong> The wealthiest long-term investors are often 
              the most patient, not the most clever. They understand that wealth-building is 
              a marathon measured in decades, not a sprint measured in days.
            </p>
          </div>
        </div>

        {/* The Role of Time and Compounding */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">The Role of Time and Compounding</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Albert Einstein allegedly called compound interest the "eighth wonder of the world." 
              Whether he actually said it or not, the sentiment is correct. Compounding is the 
              most powerful force in wealth creation — and it requires just one thing you can't 
              buy: <strong>time</strong>.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Compounding works by generating returns on your returns. In year one, you earn 
              returns on your original investment. In year two, you earn returns on your 
              original investment PLUS the returns from year one. This snowball effect starts 
              small but grows exponentially.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Here's what makes compounding magical: <strong>the majority of growth happens 
              in the later years</strong>. The first 10 years might feel slow. The next 10 
              accelerate. The final 10-20 years often create more wealth than all the previous 
              years combined. This is why starting early matters so much — not because of the 
              first few years, but because of the last few decades.
            </p>
          </div>

          <CompoundingMagicSVG />
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🕐 The Earlier You Start</h4>
              <p className="text-blue-700 text-sm">
                Someone who starts investing at 25 and stops at 35 (10 years of contributions) 
                often ends up with more at 65 than someone who starts at 35 and contributes 
                for 30 years. That's the power of compounding time.
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">⚠️ But Time Needs Patience</h4>
              <p className="text-amber-700 text-sm">
                Compounding only works if you stay invested. Every time you sell during a dip, 
                you restart the clock. The power of compounding requires the discipline to 
                leave your investments alone.
              </p>
            </div>
          </div>
        </div>

        {/* Time vs Timing */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Time in the Market vs Timing the Market</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              One of the most important concepts in long-term investing is the distinction between 
              <strong> time IN the market</strong> and <strong>timing the market</strong>. They 
              sound similar but represent completely different approaches — with dramatically 
              different outcomes.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Market timing attempts to predict when to buy (at market bottoms) and when to 
              sell (at market tops). It sounds logical — buy low, sell high. But it requires 
              you to be right twice: once when you exit and once when you re-enter. Study 
              after study shows that even professional investors struggle to time markets 
              consistently.
            </p>
            <p className="text-lg leading-relaxed">
              Time in the market simply stays invested through ups and downs. It doesn't try 
              to predict. It accepts that short-term movements are unpredictable, but long-term 
              trends favor patient investors. Missing just the 10 best days in a decade can 
              cut your returns dramatically — and those best days often occur right after 
              the worst days, when timers are sitting in cash.
            </p>
          </div>

          <TimeVsTimingSVG />
        </div>

        {/* Who This Module Is For */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Who This Module Is For (And Who It's Not For)</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              This module is designed for a specific type of learner. It's for those who want 
              to understand how wealth is really built — not through excitement and action, 
              but through patience and discipline. It's for those willing to embrace "boring" 
              as a feature, not a bug.
            </p>
            <p className="text-lg leading-relaxed">
              However, this module is not for everyone. If you're looking for quick wins, hot 
              tips, or trading excitement, you'll be disappointed. Long-term investing requires 
              accepting that results take years to materialize and that the journey includes 
              periods of decline.
            </p>
          </div>

          <WhoIsThisForSVG />
        </div>

        {/* What You'll Learn */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">What You'll Clearly Understand After This Module</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              By the end of this module, you won't just have knowledge — you'll have 
              <strong> understanding</strong>. You'll grasp not just WHAT to do, but WHY 
              it works. This understanding is what gives you the confidence to stay the 
              course when markets test your resolve.
            </p>
          </div>

          <WhatYoullLearnSVG />
          
          <div className="mt-6 rounded-xl p-6 border border-teal-200 bg-brand-soft">
            <h4 className="font-semibold text-teal-800 mb-3">🎯 The Ultimate Goal</h4>
            <p className="text-teal-700">
              After completing this module, you should feel calm confidence in your approach 
              to building wealth. You'll understand why the "boring" approach works, why 
              patience is your greatest asset, and why you don't need to predict the future 
              to benefit from it. That confidence will help you stay disciplined when 
              markets are volatile and everyone else is panicking.
            </p>
          </div>
        </div>

        {/* Module Philosophy */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <ModulePhilosophySVG />
        </div>

        {/* Core Philosophy Cards */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Module Philosophy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modulePhilosophy.map((item, index) => (
              <div key={index} className="rounded-xl p-5 border border-teal-200 bg-brand-soft">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <h4 className="font-semibold text-teal-800">{item.title}</h4>
                </div>
                <p className="text-teal-700 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* India-specific Context */}
        <div className="bg-teal-50 rounded-2xl p-6 shadow-lg mb-8 border border-teal-200">
          <h3 className="text-lg font-semibold text-teal-800 mb-3">🌍 Global Principles, Universal Application</h3>
          <p className="text-teal-900">
            The principles of long-term investing are universal. Whether you're investing in 
            American markets, European indices, Asian equities, or Indian mutual funds, the 
            fundamentals remain the same: time is powerful, compounding rewards patience, 
            and discipline beats activity. This module uses global concepts (denominated in 
            USD for consistency) but the lessons apply equally to investors anywhere in the 
            world — including India's growing community of long-term investors.
          </p>
        </div>

        {/* Lessons List */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Module Lessons</h2>
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  lesson.available
                    ? 'border-teal-200 hover:border-teal-400 hover:bg-teal-50 cursor-pointer'
                    : 'border-gray-200 bg-gray-50'
                }`}
                onClick={() => lesson.available && navigate(lesson.path)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    lesson.available ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {lesson.id}
                  </div>
                  <span className={`font-medium ${lesson.available ? 'text-gray-800' : 'text-gray-500'}`}>
                    {lesson.title}
                  </span>
                </div>
                {lesson.available ? (
                  <FaCheckCircle className="text-teal-500 text-xl" />
                ) : (
                  <FaLock className="text-gray-400 text-lg" />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-200">
            <p className="text-amber-800 text-sm">
              <strong>Coming Soon:</strong> Lessons for this module are currently being developed. 
              Check back soon for the complete learning experience.
            </p>
          </div>
        </div>

        {/* Prerequisites */}
        <div className="rounded-2xl p-8 shadow-lg mb-8 text-white bg-brand-fill">
          <h3 className="text-xl font-semibold mb-4">📋 Recommended Prerequisites</h3>
          <p className="text-teal-100 mb-4">
            While this module is designed to be accessible to beginners, you'll get more 
            value if you've completed these modules first:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-xl p-4">
              <h4 className="font-semibold mb-2">✓ Risk Management Module</h4>
              <p className="text-sm text-teal-100">
                Understanding how to protect capital ensures your long-term investments 
                survive market downturns.
              </p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <h4 className="font-semibold mb-2">○ Personal Finance (Optional)</h4>
              <p className="text-sm text-teal-100">
                Having your financial foundation in place ensures you can invest without 
                needing the money short-term.
              </p>
            </div>
          </div>
        </div>

        {/* Start Learning CTA */}
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <FaSeedling className="text-teal-500 text-4xl mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-800 mb-3 tracking-[-0.015em]">Ready to Build Wealth the Right Way?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Long-term investing is simple but not easy. It requires understanding, patience, 
            and discipline. This module will give you the understanding — the patience and 
            discipline are up to you.
          </p>
          <button
            onClick={() => navigate('/learn')}
            className="bg-brand-fill hover:bg-brand-hover text-white px-8 py-3 rounded-xl font-semibold transition-colors"
          >
            Back to Learning Center
          </button>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default LongTermInvestingOverview;
