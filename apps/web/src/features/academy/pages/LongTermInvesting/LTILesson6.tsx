import React, { useState } from 'react';
import StudyShell from "../../components/StudyShell";
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaSeedling, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';

// SVG 1: The Behavior Gap
const BehaviorGapSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Why Behavior Matters More Than Knowledge</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">The gap between what markets offer and what investors get</text>
    
    {/* Two paths visualization */}
    <g transform="translate(80, 80)">
      {/* Market returns path */}
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="220" height="140" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
        <text x="110" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">📈 What Markets Offer</text>
        
        <g transform="translate(30, 50)">
          <path d="M0 70 Q40 60 80 45 Q120 30 160 10" fill="none" stroke="#16A34A" strokeWidth="3"/>
          <circle cx="160" cy="10" r="5" fill="#16A34A"/>
        </g>
        
        <text x="110" y="125" textAnchor="middle" fontSize="9" fill="#16A34A">Steady long-term growth potential</text>
      </g>
      
      {/* Investor returns path */}
      <g transform="translate(320, 0)">
        <rect x="0" y="0" width="220" height="140" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
        <text x="110" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#654B26">😰 What Many Investors Get</text>
        
        <g transform="translate(30, 50)">
          <path d="M0 40 L30 50 L60 30 L90 60 L120 35 L150 55 L160 45" fill="none" stroke="#B8923F" strokeWidth="3"/>
          <circle cx="160" cy="45" r="5" fill="#B8923F"/>
        </g>
        
        <text x="110" y="125" textAnchor="middle" fontSize="9" fill="#533E22">Undermined by emotional decisions</text>
      </g>
    </g>
    
    {/* The gap explanation */}
    <rect x="150" y="235" width="400" height="35" fill="#2A2A2C" rx="8"/>
    <text x="350" y="250" textAnchor="middle" fontSize="10" fill="white">The difference? <tspan fontWeight="600">Behavior.</tspan></text>
    <text x="350" y="264" textAnchor="middle" fontSize="9" fill="#A0A3AA">Knowing what to do is easy. Doing it when emotions run high is hard.</text>
  </svg>
);

// SVG 2: The Four Emotional Challenges
const EmotionalChallengesSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The Four Emotional Challenges Every Investor Faces</text>
    
    {/* Fear */}
    <g transform="translate(50, 60)">
      <rect x="0" y="0" width="140" height="200" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="1"/>
      <text x="70" y="30" textAnchor="middle" fontSize="28">😨</text>
      <text x="70" y="55" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">Fear</text>
      
      <g transform="translate(15, 70)">
        <text x="0" y="0" fontSize="8" fill="#842428">• "What if I lose everything?"</text>
        <text x="0" y="16" fontSize="8" fill="#842428">• "Markets are crashing!"</text>
        <text x="0" y="32" fontSize="8" fill="#842428">• "I should sell now!"</text>
      </g>
      
      <rect x="15" y="130" width="110" height="55" fill="#FBE1E1" rx="6"/>
      <text x="70" y="150" textAnchor="middle" fontSize="8" fontWeight="500" fill="#842428">Leads to:</text>
      <text x="70" y="165" textAnchor="middle" fontSize="7" fill="#842428">Selling at the bottom</text>
      <text x="70" y="178" textAnchor="middle" fontSize="7" fill="#842428">Missing recovery</text>
    </g>
    
    {/* Greed */}
    <g transform="translate(205, 60)">
      <rect x="0" y="0" width="140" height="200" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="1"/>
      <text x="70" y="30" textAnchor="middle" fontSize="28">🤑</text>
      <text x="70" y="55" textAnchor="middle" fontSize="11" fontWeight="600" fill="#654B26">Greed</text>
      
      <g transform="translate(15, 70)">
        <text x="0" y="0" fontSize="8" fill="#533E22">• "I need to get in now!"</text>
        <text x="0" y="16" fontSize="8" fill="#533E22">• "Everyone else is making $"</text>
        <text x="0" y="32" fontSize="8" fill="#533E22">• "This will keep rising!"</text>
      </g>
      
      <rect x="15" y="130" width="110" height="55" fill="#F6ECCE" rx="6"/>
      <text x="70" y="150" textAnchor="middle" fontSize="8" fontWeight="500" fill="#533E22">Leads to:</text>
      <text x="70" y="165" textAnchor="middle" fontSize="7" fill="#533E22">Buying at the peak</text>
      <text x="70" y="178" textAnchor="middle" fontSize="7" fill="#533E22">Chasing performance</text>
    </g>
    
    {/* Impatience */}
    <g transform="translate(360, 60)">
      <rect x="0" y="0" width="140" height="200" fill="#E0E7F1" rx="12" stroke="#9FB3D3" strokeWidth="1"/>
      <text x="70" y="30" textAnchor="middle" fontSize="28">⏰</text>
      <text x="70" y="55" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2C3F5E">Impatience</text>
      
      <g transform="translate(15, 70)">
        <text x="0" y="0" fontSize="8" fill="#26354F">• "It's not growing fast!"</text>
        <text x="0" y="16" fontSize="8" fill="#26354F">• "Others are doing better"</text>
        <text x="0" y="32" fontSize="8" fill="#26354F">• "I need action now"</text>
      </g>
      
      <rect x="15" y="130" width="110" height="55" fill="#E0E7F1" rx="6"/>
      <text x="70" y="150" textAnchor="middle" fontSize="8" fontWeight="500" fill="#26354F">Leads to:</text>
      <text x="70" y="165" textAnchor="middle" fontSize="7" fill="#26354F">Abandoning good plans</text>
      <text x="70" y="178" textAnchor="middle" fontSize="7" fill="#26354F">Constant switching</text>
    </g>
    
    {/* Regret */}
    <g transform="translate(515, 60)">
      <rect x="0" y="0" width="140" height="200" fill="#ECE4F6" rx="12" stroke="#C0A9E2" strokeWidth="1"/>
      <text x="70" y="30" textAnchor="middle" fontSize="28">😔</text>
      <text x="70" y="55" textAnchor="middle" fontSize="11" fontWeight="600" fill="#654B8A">Regret</text>
      
      <g transform="translate(15, 70)">
        <text x="0" y="0" fontSize="8" fill="#533F70">• "I should have bought then"</text>
        <text x="0" y="16" fontSize="8" fill="#533F70">• "Why didn't I sell earlier?"</text>
        <text x="0" y="32" fontSize="8" fill="#533F70">• "I missed my chance"</text>
      </g>
      
      <rect x="15" y="130" width="110" height="55" fill="#ECE4F6" rx="6"/>
      <text x="70" y="150" textAnchor="middle" fontSize="8" fontWeight="500" fill="#533F70">Leads to:</text>
      <text x="70" y="165" textAnchor="middle" fontSize="7" fill="#533F70">Chasing what's passed</text>
      <text x="70" y="178" textAnchor="middle" fontSize="7" fill="#533F70">Paralysis or overreaction</text>
    </g>
    
    {/* Bottom message */}
    <text x="350" y="285" textAnchor="middle" fontSize="10" fill="#717680">These emotions are <tspan fontWeight="600">normal</tspan>. Everyone feels them. The key is not acting on them.</text>
  </svg>
);

// SVG 3: The Emotional Cycle of Investors
const EmotionalCycleSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The Emotional Cycle of Investing</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">How feelings change as markets move — and why it leads to bad timing</text>
    
    {/* Market line */}
    <g transform="translate(80, 90)">
      <path d="M0 120 Q60 130 120 80 Q180 30 240 20 Q300 15 320 40 Q340 65 380 140 Q420 180 460 170 Q500 160 540 100" 
            fill="none" stroke="#717680" strokeWidth="3"/>
      
      {/* Emotional annotations */}
      {/* Optimism - early rise */}
      <g transform="translate(80, 95)">
        <circle cx="0" cy="0" r="18" fill="#F0FDF4" stroke="#16A34A" strokeWidth="2"/>
        <text x="0" y="4" textAnchor="middle" fontSize="12">😊</text>
        <text x="0" y="40" textAnchor="middle" fontSize="7" fill="#16A34A" fontWeight="500">Optimism</text>
        <text x="0" y="52" textAnchor="middle" fontSize="6" fill="#16A34A">"This is going well"</text>
      </g>
      
      {/* Excitement - approaching peak */}
      <g transform="translate(180, 40)">
        <circle cx="0" cy="0" r="18" fill="#F6ECCE" stroke="#E2C273" strokeWidth="2"/>
        <text x="0" y="4" textAnchor="middle" fontSize="12">🤩</text>
        <text x="0" y="40" textAnchor="middle" fontSize="7" fill="#654B26" fontWeight="500">Excitement</text>
        <text x="0" y="52" textAnchor="middle" fontSize="6" fill="#533E22">"I'm a genius!"</text>
      </g>
      
      {/* Euphoria - peak */}
      <g transform="translate(280, 15)">
        <circle cx="0" cy="0" r="20" fill="#F6ECCE" stroke="#B8923F" strokeWidth="2"/>
        <text x="0" y="4" textAnchor="middle" fontSize="14">🚀</text>
        <text x="0" y="45" textAnchor="middle" fontSize="7" fill="#654B26" fontWeight="600">EUPHORIA</text>
        <text x="0" y="57" textAnchor="middle" fontSize="6" fill="#C7363B">"Buy more!" (Danger)</text>
      </g>
      
      {/* Anxiety - early decline */}
      <g transform="translate(360, 80)">
        <circle cx="0" cy="0" r="18" fill="#FDF1F1" stroke="#F09B9B" strokeWidth="2"/>
        <text x="0" y="4" textAnchor="middle" fontSize="12">😟</text>
        <text x="0" y="40" textAnchor="middle" fontSize="7" fill="#C7363B" fontWeight="500">Anxiety</text>
        <text x="0" y="52" textAnchor="middle" fontSize="6" fill="#842428">"Is this temporary?"</text>
      </g>
      
      {/* Panic - steep decline */}
      <g transform="translate(420, 160)">
        <circle cx="0" cy="0" r="20" fill="#FDF1F1" stroke="#E04848" strokeWidth="2"/>
        <text x="0" y="4" textAnchor="middle" fontSize="14">😱</text>
        <text x="0" y="45" textAnchor="middle" fontSize="7" fill="#C7363B" fontWeight="600">PANIC</text>
        <text x="0" y="57" textAnchor="middle" fontSize="6" fill="#C7363B">"Sell everything!" (Danger)</text>
      </g>
      
      {/* Depression - bottom */}
      <g transform="translate(470, 175)">
        <circle cx="0" cy="0" r="18" fill="#ECE4F6" stroke="#C0A9E2" strokeWidth="2"/>
        <text x="0" y="4" textAnchor="middle" fontSize="12">😞</text>
        <text x="0" y="40" textAnchor="middle" fontSize="7" fill="#654B8A" fontWeight="500">Despair</text>
        <text x="0" y="52" textAnchor="middle" fontSize="6" fill="#533F70">"I give up"</text>
      </g>
      
      {/* Hope - early recovery */}
      <g transform="translate(540, 110)">
        <circle cx="0" cy="0" r="18" fill="#F0FDF4" stroke="#16A34A" strokeWidth="2"/>
        <text x="0" y="4" textAnchor="middle" fontSize="12">🙂</text>
        <text x="0" y="40" textAnchor="middle" fontSize="7" fill="#16A34A" fontWeight="500">Hope</text>
        <text x="0" y="52" textAnchor="middle" fontSize="6" fill="#16A34A">"Maybe it's okay"</text>
      </g>
    </g>
    
    {/* Key insight */}
    <rect x="100" y="300" width="500" height="30" fill="#C7363B" rx="6"/>
    <text x="350" y="320" textAnchor="middle" fontSize="9" fill="white">Most investors buy near the top (euphoria) and sell near the bottom (panic) — the worst possible timing.</text>
  </svg>
);

// SVG 4: Reacting vs Staying Disciplined
const ReactingVsDisciplinedSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Reacting vs Staying Disciplined</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Same market event, two different responses</text>
    
    {/* Market event indicator */}
    <g transform="translate(200, 65)">
      <rect x="0" y="0" width="300" height="30" fill="#F6ECCE" rx="6"/>
      <text x="150" y="19" textAnchor="middle" fontSize="9" fill="#654B26">⚡ Breaking News: "Markets drop sharply"</text>
    </g>
    
    {/* Reactive investor */}
    <g transform="translate(50, 110)">
      <rect x="0" y="0" width="280" height="175" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">😰 The Reactive Investor</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="9" fill="#842428" fontWeight="500">Immediate reaction:</text>
        <text x="0" y="18" fontSize="8" fill="#842428">• Checks portfolio multiple times</text>
        <text x="0" y="33" fontSize="8" fill="#842428">• Feels panic rising</text>
        <text x="0" y="48" fontSize="8" fill="#842428">• Searches for more bad news</text>
        <text x="0" y="63" fontSize="8" fill="#842428">• Sells to "stop the bleeding"</text>
      </g>
      
      <rect x="20" y="120" width="240" height="40" fill="#FBE1E1" rx="6"/>
      <text x="140" y="138" textAnchor="middle" fontSize="8" fontWeight="500" fill="#842428">Result:</text>
      <text x="140" y="152" textAnchor="middle" fontSize="8" fill="#842428">Locked in losses. Missed recovery. Regret.</text>
    </g>
    
    {/* Disciplined investor */}
    <g transform="translate(370, 110)">
      <rect x="0" y="0" width="280" height="175" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">😌 The Disciplined Investor</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="9" fill="#16A34A" fontWeight="500">Measured response:</text>
        <text x="0" y="18" fontSize="8" fill="#16A34A">• Acknowledges the feeling</text>
        <text x="0" y="33" fontSize="8" fill="#16A34A">• Remembers long-term perspective</text>
        <text x="0" y="48" fontSize="8" fill="#16A34A">• Avoids impulsive checking</text>
        <text x="0" y="63" fontSize="8" fill="#16A34A">• Takes no action</text>
      </g>
      
      <rect x="20" y="120" width="240" height="40" fill="#F0FDF4" rx="6"/>
      <text x="140" y="138" textAnchor="middle" fontSize="8" fontWeight="500" fill="#16A34A">Result:</text>
      <text x="140" y="152" textAnchor="middle" fontSize="8" fill="#16A34A">Stayed invested. Captured recovery. Peace.</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="295" width="500" height="20" fill="#2A8C9A" rx="5"/>
    <text x="350" y="309" textAnchor="middle" fontSize="9" fill="white">Both felt the same emotions. Only one acted on them. That made all the difference.</text>
  </svg>
);

// SVG 5: Patience as a Skill
const PatienceSkillSVG = () => (
  <svg viewBox="0 0 700 260" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="260" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Patience Is an Investing Skill</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Like any skill, it can be developed with awareness and practice</text>
    
    {/* Patience building blocks */}
    <g transform="translate(100, 75)">
      {/* Foundation */}
      <rect x="0" y="130" width="500" height="40" fill="#16A34A" rx="8"/>
      <text x="250" y="155" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">🧱 PATIENCE: The Foundation of Long-Term Success</text>
      
      {/* Pillars */}
      <g transform="translate(20, 0)">
        <rect x="0" y="30" width="100" height="100" fill="#F0FDF4" rx="8" stroke="#16A34A" strokeWidth="1"/>
        <text x="50" y="55" textAnchor="middle" fontSize="9" fontWeight="500" fill="#16A34A">Accepting</text>
        <text x="50" y="70" textAnchor="middle" fontSize="9" fontWeight="500" fill="#16A34A">Uncertainty</text>
        <text x="50" y="95" textAnchor="middle" fontSize="7" fill="#16A34A">You can't control</text>
        <text x="50" y="108" textAnchor="middle" fontSize="7" fill="#16A34A">markets</text>
      </g>
      
      <g transform="translate(140, 0)">
        <rect x="0" y="30" width="100" height="100" fill="#F0FDF4" rx="8" stroke="#16A34A" strokeWidth="1"/>
        <text x="50" y="55" textAnchor="middle" fontSize="9" fontWeight="500" fill="#16A34A">Long-Term</text>
        <text x="50" y="70" textAnchor="middle" fontSize="9" fontWeight="500" fill="#16A34A">Perspective</text>
        <text x="50" y="95" textAnchor="middle" fontSize="7" fill="#16A34A">Zooming out from</text>
        <text x="50" y="108" textAnchor="middle" fontSize="7" fill="#16A34A">daily noise</text>
      </g>
      
      <g transform="translate(260, 0)">
        <rect x="0" y="30" width="100" height="100" fill="#F0FDF4" rx="8" stroke="#16A34A" strokeWidth="1"/>
        <text x="50" y="55" textAnchor="middle" fontSize="9" fontWeight="500" fill="#16A34A">Emotional</text>
        <text x="50" y="70" textAnchor="middle" fontSize="9" fontWeight="500" fill="#16A34A">Awareness</text>
        <text x="50" y="95" textAnchor="middle" fontSize="7" fill="#16A34A">Feeling without</text>
        <text x="50" y="108" textAnchor="middle" fontSize="7" fill="#16A34A">acting</text>
      </g>
      
      <g transform="translate(380, 0)">
        <rect x="0" y="30" width="100" height="100" fill="#F0FDF4" rx="8" stroke="#16A34A" strokeWidth="1"/>
        <text x="50" y="55" textAnchor="middle" fontSize="9" fontWeight="500" fill="#16A34A">Process</text>
        <text x="50" y="70" textAnchor="middle" fontSize="9" fontWeight="500" fill="#16A34A">Trust</text>
        <text x="50" y="95" textAnchor="middle" fontSize="7" fill="#16A34A">Following your plan</text>
        <text x="50" y="108" textAnchor="middle" fontSize="7" fill="#16A34A">through ups & downs</text>
      </g>
    </g>
    
    {/* Bottom message */}
    <text x="350" y="240" textAnchor="middle" fontSize="10" fill="#717680">Patience isn't passive. It's an active choice to stay the course when everything urges you to react.</text>
  </svg>
);

// SVG 6: Two Investors Over Time
const TwoInvestorsTimeSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Two Investors, Same Market, Different Experiences</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">How they felt during a typical market cycle</text>
    
    {/* Timeline */}
    <g transform="translate(80, 80)">
      {/* Market line */}
      <path d="M0 80 Q90 70 180 50 Q270 30 320 60 Q370 90 400 120 Q430 100 500 70 Q540 55 540 55" 
            fill="none" stroke="#A0A3AA" strokeWidth="2"/>
      
      {/* Time markers */}
      <text x="0" y="150" fontSize="8" fill="#717680">Year 1</text>
      <text x="180" y="150" fontSize="8" fill="#717680">Year 3</text>
      <text x="400" y="150" fontSize="8" fill="#717680">Year 5</text>
      <text x="540" y="150" textAnchor="end" fontSize="8" fill="#717680">Year 7</text>
    </g>
    
    {/* Reactive investor experience */}
    <g transform="translate(50, 195)">
      <rect x="0" y="0" width="280" height="120" fill="#FDF1F1" rx="10" stroke="#F09B9B" strokeWidth="1"/>
      <text x="140" y="20" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">😰 Rahul: News-Reactive</text>
      
      <g transform="translate(15, 35)">
        <text x="0" y="0" fontSize="8" fill="#842428">Year 1-3: "This is great!" → Adds more</text>
        <text x="0" y="16" fontSize="8" fill="#842428">Year 3-5: "Crash! Sell!" → Exits in panic</text>
        <text x="0" y="32" fontSize="8" fill="#842428">Year 5-7: Watches recovery from sidelines</text>
      </g>
      
      <rect x="15" y="85" width="250" height="25" fill="#FBE1E1" rx="4"/>
      <text x="140" y="102" textAnchor="middle" fontSize="8" fill="#842428">Journey: Stressful, reactive, disappointed</text>
    </g>
    
    {/* Patient investor experience */}
    <g transform="translate(370, 195)">
      <rect x="0" y="0" width="280" height="120" fill="#F0FDF4" rx="10" stroke="#16A34A" strokeWidth="1"/>
      <text x="140" y="20" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16A34A">😌 Meera: Patient</text>
      
      <g transform="translate(15, 35)">
        <text x="0" y="0" fontSize="8" fill="#16A34A">Year 1-3: "Doing fine" → Stays invested</text>
        <text x="0" y="16" fontSize="8" fill="#16A34A">Year 3-5: "Uncomfortable but expected" → Holds</text>
        <text x="0" y="32" fontSize="8" fill="#16A34A">Year 5-7: "Glad I stayed" → Benefits from recovery</text>
      </g>
      
      <rect x="15" y="85" width="250" height="25" fill="#F0FDF4" rx="4"/>
      <text x="140" y="102" textAnchor="middle" fontSize="8" fill="#16A34A">Journey: Steady, peaceful, rewarded</text>
    </g>
  </svg>
);

// SVG 7: Emotions Are Normal
const EmotionsNormalSVG = () => (
  <svg viewBox="0 0 700 220" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="220" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Emotions Are Normal. Reactions Are Optional.</text>
    
    {/* Two-part visual */}
    <g transform="translate(80, 60)">
      {/* Feeling */}
      <rect x="0" y="0" width="220" height="110" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
      <text x="110" y="30" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">✓ Feeling the Emotion</text>
      
      <g transform="translate(30, 50)">
        <text x="0" y="0" fontSize="9" fill="#16A34A">"I feel worried about my portfolio"</text>
        <text x="0" y="18" fontSize="9" fill="#16A34A">"This news makes me anxious"</text>
        <text x="0" y="36" fontSize="9" fill="#16A34A">"I'm tempted to do something"</text>
      </g>
      
      <text x="110" y="100" textAnchor="middle" fontSize="8" fill="#16A34A" fontWeight="500">This is human and healthy</text>
    </g>
    
    {/* Arrow */}
    <g transform="translate(320, 105)">
      <text x="0" y="0" fontSize="9" fill="#717680">is different from</text>
      <path d="M40 5 L60 5" stroke="#717680" strokeWidth="2" markerEnd="url(#arrow)"/>
    </g>
    
    {/* Acting */}
    <g transform="translate(400, 60)">
      <rect x="0" y="0" width="220" height="110" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="110" y="30" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">✗ Acting on the Emotion</text>
      
      <g transform="translate(30, 50)">
        <text x="0" y="0" fontSize="9" fill="#842428">"I'm selling everything now"</text>
        <text x="0" y="18" fontSize="9" fill="#842428">"I need to buy immediately"</text>
        <text x="0" y="36" fontSize="9" fill="#842428">"I'm changing my whole plan"</text>
      </g>
      
      <text x="110" y="100" textAnchor="middle" fontSize="8" fill="#C7363B" fontWeight="500">This often leads to regret</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="185" width="500" height="25" fill="#2A2A2C" rx="6"/>
    <text x="350" y="202" textAnchor="middle" fontSize="9" fill="white">The gap between feeling and doing is where investing wisdom lives.</text>
  </svg>
);

// SVG 8: The Long-Term Path
const LongTermPathSVG = () => (
  <svg viewBox="0 0 700 260" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="260" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The Long-Term Path Through Short-Term Noise</text>
    
    {/* Chart */}
    <g transform="translate(80, 60)">
      {/* Noise cloud */}
      <ellipse cx="270" cy="80" rx="250" ry="60" fill="#EEEEF1" opacity="0.7"/>
      <text x="270" y="30" textAnchor="middle" fontSize="9" fill="#A0A3AA">Short-term noise zone</text>
      
      {/* Noisy path */}
      <path d="M0 100 L40 80 L80 110 L120 70 L160 100 L200 60 L240 95 L280 55 L320 90 L360 50 L400 85 L440 45 L480 75 L520 40 L540 55" 
            fill="none" stroke="#A0A3AA" strokeWidth="1.5" strokeDasharray="4"/>
      
      {/* Smooth long-term trend */}
      <path d="M0 105 Q135 90 270 70 Q405 50 540 35" 
            fill="none" stroke="#16A34A" strokeWidth="4"/>
      
      {/* Start point */}
      <circle cx="0" cy="105" r="6" fill="#16A34A"/>
      <text x="0" y="130" textAnchor="middle" fontSize="8" fill="#16A34A">Start</text>
      
      {/* End point */}
      <circle cx="540" cy="35" r="8" fill="#16A34A"/>
      <text x="540" y="60" textAnchor="end" fontSize="8" fill="#16A34A">Long-term destination</text>
      
      {/* Legend */}
      <g transform="translate(180, 145)">
        <line x1="0" y1="0" x2="25" y2="0" stroke="#A0A3AA" strokeWidth="1.5" strokeDasharray="4"/>
        <text x="32" y="4" fontSize="8" fill="#717680">Daily/weekly noise</text>
      </g>
      <g transform="translate(330, 145)">
        <line x1="0" y1="0" x2="25" y2="0" stroke="#16A34A" strokeWidth="4"/>
        <text x="32" y="4" fontSize="8" fill="#16A34A">Long-term direction</text>
      </g>
    </g>
    
    {/* Bottom message */}
    <rect x="100" y="225" width="500" height="25" fill="#16A34A" rx="6"/>
    <text x="350" y="242" textAnchor="middle" fontSize="9" fill="white">Patient investors see through the noise to the underlying trend. That's their advantage.</text>
  </svg>
);

// SVG 9: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 140" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="140" fill="url(#takeawayGrad6)" rx="16"/>
    
    <defs>
      <linearGradient id="takeawayGrad6" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#16A34A"/>
        <stop offset="100%" stopColor="#2A8C9A"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="40" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">🌱 Key Takeaway</text>
    <text x="350" y="70" textAnchor="middle" fontSize="12" fill="white">Your behavior matters more than your knowledge or timing.</text>
    <text x="350" y="95" textAnchor="middle" fontSize="12" fill="white">Emotions are inevitable. Acting on them is optional.</text>
    <text x="350" y="125" textAnchor="middle" fontSize="11" fill="#BBF7D0">Patience isn't waiting passively — it's choosing not to react when everything urges you to.</text>
  </svg>
);

const LTILesson6 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const quizQuestions = [
    {
      id: 1,
      question: "Why does behavior often matter more than knowledge in investing?",
      options: [
        "Because markets are completely random",
        "Because emotions lead to poor timing decisions that undermine good plans",
        "Because knowledge isn't important for investing",
        "Because behavior makes markets go up"
      ],
      correct: 1,
      explanation: "Many investors know what to do but fail to do it when emotions run high. Fear leads to selling at lows; greed leads to buying at highs. Behavior determines actual outcomes."
    },
    {
      id: 2,
      question: "What's the difference between feeling an emotion and acting on it?",
      options: [
        "There is no difference — feelings and actions are the same",
        "Acting on emotions is always good for investing",
        "Feeling emotions is normal and healthy; acting impulsively often leads to regret",
        "You should never feel emotions about your investments"
      ],
      correct: 2,
      explanation: "Emotions are a normal part of being human. The key difference is that patient investors feel their emotions but don't let those feelings drive impulsive decisions."
    }
  ];

  const handleAnswer = (questionId, answerIndex) => {
    setQuizAnswers({ ...quizAnswers, [questionId]: answerIndex });
    setShowResults({ ...showResults, [questionId]: true });
  };

  return (
    <StudyShell module="LongTermInvesting" lessonNumber={6}>
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
                Lesson 6 of 7
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-2 tracking-[-0.025em]">Behavior & Patience in Investing</h1>
            <p className="text-gray-600 text-lg">
              Why your behavior matters more than your knowledge — and how patience becomes your advantage.
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.025em]">Why Behavior Beats Intelligence</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Here's a truth that surprises most people: <strong>the most intelligent investors 
              don't always get the best results.</strong> The ones who do? They're often the ones 
              with the best behavior.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              It doesn't matter how much you know about markets if you panic and sell at the 
              bottom. It doesn't matter how good your plan is if you abandon it the moment 
              things get uncomfortable.
            </p>
            <p className="text-lg leading-relaxed">
              This lesson is about the hidden factor that determines success more than anything 
              else: <strong>your emotional discipline</strong>. Understanding how emotions affect 
              your decisions — and learning to stay patient through them — is the foundation of 
              long-term wealth building.
            </p>
          </div>
        </div>

        {/* The Behavior Gap */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">The Behavior Gap</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Markets offer potential growth over time. But many investors don't capture that 
              growth — not because the market failed them, but because their behavior got in 
              the way.
            </p>
            <p className="text-lg leading-relaxed">
              They buy when excitement is high and prices are inflated. They sell when fear 
              peaks and prices are depressed. The result is a "behavior gap" — the difference 
              between what the market offered and what they actually got.
            </p>
          </div>

          <BehaviorGapSVG />
        </div>

        {/* The Four Emotional Challenges */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">The Four Emotional Challenges</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Every investor — from complete beginners to seasoned professionals — faces the 
              same emotional challenges. These aren't signs of weakness; they're signs of being 
              human. Recognizing them is the first step to managing them.
            </p>
          </div>

          <EmotionalChallengesSVG />
          
          <div className="mt-6 bg-teal-50 rounded-xl p-5 border border-teal-200">
            <p className="text-teal-800">
              <strong>Important:</strong> You will feel all of these at some point. The goal 
              isn't to eliminate these emotions — it's to recognize them and choose not to act 
              impulsively when they arise.
            </p>
          </div>
        </div>

        {/* The Emotional Cycle */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">The Emotional Cycle of Investing</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Markets move in cycles, and so do investor emotions. The dangerous part? Most 
              people feel most confident at exactly the wrong time (near peaks) and most fearful 
              at exactly the wrong time (near bottoms).
            </p>
            <p className="text-lg leading-relaxed">
              Understanding this cycle helps you recognize where you might be emotionally — and 
              why acting on that feeling often leads to poor timing.
            </p>
          </div>

          <EmotionalCycleSVG />
        </div>

        {/* Reacting vs Staying Disciplined */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Reacting vs Staying Disciplined</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              When scary news hits, everyone feels something. The difference is what happens 
              next. Reactive investors act on the feeling. Disciplined investors feel it, 
              acknowledge it, and choose not to act.
            </p>
            <p className="text-lg leading-relaxed">
              Both investors experience the same emotions. But their different responses lead 
              to vastly different outcomes.
            </p>
          </div>

          <ReactingVsDisciplinedSVG />
        </div>

        {/* Emotions Are Normal */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Emotions Are Normal, Reactions Are Optional</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Let's be clear: there's nothing wrong with feeling worried when markets drop or 
              excited when they rise. These are natural human responses to changing circumstances.
            </p>
            <p className="text-lg leading-relaxed">
              The crucial distinction is between <strong>experiencing</strong> an emotion and 
              <strong>acting</strong> on it. You can feel anxious without selling. You can feel 
              excited without buying. The gap between feeling and doing is where wisdom lives.
            </p>
          </div>

          <EmotionsNormalSVG />
        </div>

        {/* Two Investors Over Time */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Different Behaviors, Different Journeys</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Consider Rahul and Meera, two investors who start at the same time. They experience 
              the same market — the same ups, the same downs, the same news cycles. But their 
              different responses create entirely different experiences.
            </p>
          </div>

          <TwoInvestorsTimeSVG />
          
          <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
            <p className="text-amber-800">
              <strong>Notice:</strong> Meera didn't have a "better" market or special knowledge. 
              She had better behavior. She felt the same discomfort but chose not to react to it.
            </p>
          </div>
        </div>

        {/* Patience as a Skill */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Patience Is a Skill</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Many people think patience is something you either have or don't have. But patience 
              in investing is actually a <strong>skill</strong> — and like any skill, it can be 
              developed with awareness and practice.
            </p>
            <p className="text-lg leading-relaxed">
              Patience isn't passive waiting. It's an active, intentional choice to stay the 
              course when your emotions are urging you to react. It's built on several key 
              foundations.
            </p>
          </div>

          <PatienceSkillSVG />
        </div>

        {/* The Long-Term Path */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Seeing Through the Noise</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Day to day, markets are noisy. Prices jump around. Headlines alarm. Charts look 
              chaotic. But underneath all that noise is a long-term direction — and patient 
              investors learn to see it.
            </p>
            <p className="text-lg leading-relaxed">
              The ability to zoom out, to see the underlying trend rather than the daily 
              fluctuations, is what separates those who build wealth from those who react their 
              way out of it.
            </p>
          </div>

          <LongTermPathSVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
        </div>

        {/* India-specific Context */}
        <div className="bg-teal-50 rounded-2xl p-6 shadow-lg mb-8 border border-teal-200">
          <h3 className="text-lg font-semibold text-teal-800 mb-3">🌍 Global Perspective</h3>
          <p className="text-teal-900 mb-3">
            Investor emotions are universal. Whether you're investing in America, Europe, India, 
            or anywhere else in the world, humans experience the same fear, greed, impatience, 
            and regret. Markets are different, but human psychology is the same everywhere.
          </p>
          <p className="text-teal-800 text-sm">
            Indian investors face the same behavioral challenges as investors worldwide. The 
            emotional cycle, the temptation to react to news, and the struggle to stay patient 
            are not unique to any country — they're universal aspects of investing that every 
            long-term wealth builder must learn to navigate.
          </p>
        </div>

        {/* Knowledge Check */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">📝 Knowledge Check</h2>
          <p className="text-gray-600 mb-6">Test your understanding of behavior and patience in investing.</p>
          
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
            Think honestly about which emotional challenge affects you most when it comes to 
            money and investing:
          </p>
          <div className="bg-white/20 rounded-xl p-5">
            <p className="text-white font-medium mb-2">Consider these questions:</p>
            <ul className="text-teal-100 space-y-2">
              <li>• When markets drop, is your first instinct to sell or to worry excessively? (Fear)</li>
              <li>• When you hear about others making money, do you feel compelled to jump in? (Greed)</li>
              <li>• Do you constantly check your portfolio, wishing it would grow faster? (Impatience)</li>
              <li>• Do you often look back and wish you had done something differently? (Regret)</li>
              <li>• Which of these four emotions has influenced a real financial decision you've made?</li>
            </ul>
          </div>
          <p className="text-teal-200 mt-4 text-sm">
            There's no judgment here. Everyone has emotional tendencies. The first step to 
            managing them is simply knowing which ones affect you most. Self-awareness is the 
            beginning of emotional discipline.
          </p>
        </div>

        {/* Lesson Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📚 Lesson Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <h4 className="font-semibold text-teal-800 mb-2">What We Learned</h4>
              <ul className="text-teal-700 text-sm space-y-1">
                <li>✓ Behavior determines outcomes more than knowledge</li>
                <li>✓ Four key emotions: fear, greed, impatience, regret</li>
                <li>✓ Emotions lead to poor timing (buy high, sell low)</li>
                <li>✓ Patience is a skill that can be developed</li>
              </ul>
            </div>
            <div className="bg-brand-soft rounded-xl p-4 border border-brand-line">
              <h4 className="font-semibold text-brand mb-2">Key Insights</h4>
              <ul className="text-brand text-sm space-y-1">
                <li>✓ Emotions are normal; reactions are optional</li>
                <li>✓ Feeling and acting are different things</li>
                <li>✓ The calm investor often outperforms the clever one</li>
                <li>✓ Long-term perspective cuts through short-term noise</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to="/learn/lti-lesson-5"
            className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Previous: Diversification & Simplicity</span>
          </Link>
          <button
            onClick={() => navigate('/learn/lti-lesson-7')}
            className="flex items-center gap-2 bg-brand-fill hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <span>Next: Building Your Long-Term Mindset</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
    </StudyShell>
  );
};

export default LTILesson6;
