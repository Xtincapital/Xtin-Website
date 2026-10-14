import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';
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
                  ? 'border-brand bg-brand-soft'
                  : option === selectedAnswer
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
                : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {showResult && (
        <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${isCorrect ? 'bg-brand-soft' : 'bg-red-100'}`}>
          {isCorrect ? (
            <FaCheckCircle className="text-brand text-xl flex-shrink-0 mt-0.5" />
          ) : (
            <FaTimesCircle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`font-semibold ${isCorrect ? 'text-brand' : 'text-red-800'}`}>
              {isCorrect ? 'Correct!' : 'Not quite right'}
            </p>
            <p className="text-gray-700 mt-1">{explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// SVG 1: What is Tax Efficiency
const WhatIsTaxEfficiencySVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="600" fill="#2C3F5E">What is Tax Efficiency?</text>
    <text x="350" y="52" textAnchor="middle" fontSize="11" fill="#717680">The simple concept of keeping more of what you earn</text>
    
    {/* Central concept */}
    <g transform="translate(350, 160)">
      {/* Large circle representing total earnings */}
      <circle cx="0" cy="0" r="85" fill="#E0E7F1" stroke="#5A77AA" strokeWidth="3"/>
      <text x="0" y="-55" textAnchor="middle" fontSize="10" fontWeight="600" fill="#2C3F5E">WHAT YOU EARN</text>
      
      {/* Inner circle - what you keep */}
      <circle cx="0" cy="0" r="55" fill="#12805A" stroke="#12805A" strokeWidth="3"/>
      <text x="0" y="-10" textAnchor="middle" fontSize="11" fontWeight="700" fill="white">WHAT YOU</text>
      <text x="0" y="8" textAnchor="middle" fontSize="11" fontWeight="700" fill="white">KEEP</text>
      
      {/* Ring area label */}
      <text x="70" y="-30" fontSize="8" fill="#2C3F5E">Taxes</text>
      <path d="M55 -20 Q 70 -15 70 -5" fill="none" stroke="#2C3F5E" strokeWidth="1" strokeDasharray="2"/>
    </g>
    
    {/* Definition box */}
    <rect x="50" y="235" width="600" height="35" fill="#2C3F5E" rx="8"/>
    <text x="350" y="257" textAnchor="middle" fontSize="11" fill="white" fontWeight="500">
      Tax Efficiency = Maximizing the portion you keep after taxes are paid
    </text>
  </svg>
);

// SVG 2: Earning vs Keeping Returns
const EarningVsKeepingSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="600" fill="#2C3F5E">Two Different Things</text>
    <text x="350" y="52" textAnchor="middle" fontSize="11" fill="#717680">What you earn is not the same as what you keep</text>
    
    {/* Left side - Earning */}
    <g transform="translate(175, 170)">
      <rect x="-100" y="-80" width="200" height="160" fill="#E0E7F1" rx="12" stroke="#5A77AA" strokeWidth="2"/>
      
      <text x="0" y="-55" textAnchor="middle" fontSize="13" fontWeight="700" fill="#2C3F5E">EARNING RETURNS</text>
      
      {/* Stack of coins representing gross */}
      <g transform="translate(-40, 0)">
        <ellipse cx="0" cy="40" rx="30" ry="8" fill="#CDAA5F"/>
        <rect x="-30" y="0" width="60" height="40" fill="#CDAA5F"/>
        <ellipse cx="0" cy="0" rx="30" ry="8" fill="#E2C273"/>
        <text x="0" y="5" textAnchor="middle" fontSize="8" fontWeight="600" fill="#533E22">GROSS</text>
      </g>
      
      <text x="0" y="70" textAnchor="middle" fontSize="9" fill="#2C3F5E">Total profit before</text>
      <text x="0" y="82" textAnchor="middle" fontSize="9" fill="#2C3F5E">any taxes</text>
    </g>
    
    {/* Arrow */}
    <g transform="translate(350, 170)">
      <line x1="-30" y1="0" x2="30" y2="0" stroke="#717680" strokeWidth="3"/>
      <polygon points="30,-8 50,0 30,8" fill="#717680"/>
      <text x="10" y="-15" textAnchor="middle" fontSize="8" fill="#717680">Taxes</text>
      <text x="10" y="25" textAnchor="middle" fontSize="8" fill="#717680">taken</text>
    </g>
    
    {/* Right side - Keeping */}
    <g transform="translate(525, 170)">
      <rect x="-100" y="-80" width="200" height="160" fill="#EEF9F4" rx="12" stroke="#12805A" strokeWidth="2"/>
      
      <text x="0" y="-55" textAnchor="middle" fontSize="13" fontWeight="700" fill="#12805A">KEEPING RETURNS</text>
      
      {/* Smaller stack representing net */}
      <g transform="translate(-40, 10)">
        <ellipse cx="0" cy="30" rx="25" ry="6" fill="#12805A"/>
        <rect x="-25" y="5" width="50" height="25" fill="#12805A"/>
        <ellipse cx="0" cy="5" rx="25" ry="6" fill="#3CCB97"/>
        <text x="0" y="10" textAnchor="middle" fontSize="8" fontWeight="600" fill="white">NET</text>
      </g>
      
      <text x="0" y="70" textAnchor="middle" fontSize="9" fill="#12805A">What remains after</text>
      <text x="0" y="82" textAnchor="middle" fontSize="9" fill="#12805A">taxes are paid</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="275" width="500" height="35" fill="#F6ECCE" rx="8" stroke="#B8923F" strokeWidth="1"/>
    <text x="350" y="297" textAnchor="middle" fontSize="10" fill="#654B26">
      💡 Your real return is what you keep — not what you earned on paper.
    </text>
  </svg>
);

// SVG 3: The Gap Visualization
const TheGapSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#2C3F5E">The Gap Between Gross and Net</text>
    <text x="350" y="48" textAnchor="middle" fontSize="11" fill="#717680">Understanding where your returns go</text>
    
    {/* Bar chart visualization */}
    <g transform="translate(100, 70)">
      {/* Gross bar */}
      <rect x="50" y="20" width="120" height="150" fill="#5A77AA" rx="4"/>
      <text x="110" y="100" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">GROSS</text>
      <text x="110" y="120" textAnchor="middle" fontSize="10" fill="white">Returns</text>
      <text x="110" y="12" textAnchor="middle" fontSize="10" fill="#2C3F5E">100%</text>
      
      {/* Tax portion */}
      <rect x="220" y="20" width="120" height="50" fill="#E04848" rx="4"/>
      <text x="280" y="50" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">TAXES</text>
      
      {/* Net portion */}
      <rect x="220" y="75" width="120" height="95" fill="#12805A" rx="4"/>
      <text x="280" y="125" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">NET</text>
      <text x="280" y="145" textAnchor="middle" fontSize="10" fill="white">Returns</text>
      
      {/* Bracket showing split */}
      <line x1="180" y1="20" x2="210" y2="20" stroke="#717680" strokeWidth="1"/>
      <line x1="210" y1="20" x2="210" y2="170" stroke="#717680" strokeWidth="1"/>
      <line x1="180" y1="170" x2="210" y2="170" stroke="#717680" strokeWidth="1"/>
      
      {/* Percentages */}
      <text x="390" y="50" fontSize="10" fill="#C7363B">Portion to government</text>
      <text x="390" y="130" fontSize="10" fill="#12805A">Portion you keep</text>
    </g>
    
    {/* The gap concept */}
    <g transform="translate(100, 240)">
      <rect x="0" y="0" width="500" height="50" fill="#2A2A2C" rx="8"/>
      <text x="250" y="20" textAnchor="middle" fontSize="10" fill="#A0A3AA">THE GAP</text>
      <text x="250" y="38" textAnchor="middle" fontSize="11" fill="white" fontWeight="500">
        Tax efficiency is about minimizing this gap — legally and thoughtfully.
      </text>
    </g>
  </svg>
);

// SVG 4: Why Planning Early Matters
const WhyPlanningEarlyMattersSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#2C3F5E">Why Think About Taxes Early?</text>
    <text x="350" y="48" textAnchor="middle" fontSize="11" fill="#717680">Early awareness creates long-term advantage</text>
    
    {/* Timeline visualization */}
    <g transform="translate(50, 90)">
      {/* Timeline base */}
      <line x1="50" y1="100" x2="600" y2="100" stroke="#CFD0D3" strokeWidth="4" strokeLinecap="round"/>
      
      {/* Early stage */}
      <circle cx="100" cy="100" r="12" fill="#5A77AA" stroke="#2C3F5E" strokeWidth="2"/>
      <text x="100" y="75" textAnchor="middle" fontSize="10" fontWeight="600" fill="#2C3F5E">EARLY</text>
      <text x="100" y="130" textAnchor="middle" fontSize="8" fill="#717680">Start with</text>
      <text x="100" y="142" textAnchor="middle" fontSize="8" fill="#717680">awareness</text>
      
      {/* Mid stage */}
      <circle cx="300" cy="100" r="12" fill="#5A77AA" stroke="#2C3F5E" strokeWidth="2"/>
      <text x="300" y="75" textAnchor="middle" fontSize="10" fontWeight="600" fill="#2C3F5E">BUILDING</text>
      <text x="300" y="130" textAnchor="middle" fontSize="8" fill="#717680">Make informed</text>
      <text x="300" y="142" textAnchor="middle" fontSize="8" fill="#717680">choices</text>
      
      {/* Later stage */}
      <circle cx="500" cy="100" r="12" fill="#12805A" stroke="#12805A" strokeWidth="2"/>
      <text x="500" y="75" textAnchor="middle" fontSize="10" fontWeight="600" fill="#12805A">LATER</text>
      <text x="500" y="130" textAnchor="middle" fontSize="8" fill="#717680">Keep more</text>
      <text x="500" y="142" textAnchor="middle" fontSize="8" fill="#717680">over time</text>
    </g>
    
    {/* Four reasons */}
    <g transform="translate(50, 180)">
      <rect x="0" y="0" width="140" height="70" fill="#E0E7F1" rx="8" stroke="#5A77AA" strokeWidth="1"/>
      <text x="70" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#2C3F5E">🕐 Time</text>
      <text x="70" y="42" textAnchor="middle" fontSize="7" fill="#2C3F5E">Small differences</text>
      <text x="70" y="54" textAnchor="middle" fontSize="7" fill="#2C3F5E">compound over years</text>
      
      <rect x="155" y="0" width="140" height="70" fill="#E0E7F1" rx="8" stroke="#5A77AA" strokeWidth="1"/>
      <text x="225" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#2C3F5E">📚 Knowledge</text>
      <text x="225" y="42" textAnchor="middle" fontSize="7" fill="#2C3F5E">Understanding grows</text>
      <text x="225" y="54" textAnchor="middle" fontSize="7" fill="#2C3F5E">with experience</text>
      
      <rect x="310" y="0" width="140" height="70" fill="#E0E7F1" rx="8" stroke="#5A77AA" strokeWidth="1"/>
      <text x="380" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#2C3F5E">🎯 Choices</text>
      <text x="380" y="42" textAnchor="middle" fontSize="7" fill="#2C3F5E">Better options</text>
      <text x="380" y="54" textAnchor="middle" fontSize="7" fill="#2C3F5E">with early planning</text>
      
      <rect x="465" y="0" width="140" height="70" fill="#E0E7F1" rx="8" stroke="#5A77AA" strokeWidth="1"/>
      <text x="535" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#2C3F5E">😌 Peace</text>
      <text x="535" y="42" textAnchor="middle" fontSize="7" fill="#2C3F5E">Less stress when</text>
      <text x="535" y="54" textAnchor="middle" fontSize="7" fill="#2C3F5E">taxes are due</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="270" width="500" height="35" fill="#EEF9F4" rx="8" stroke="#12805A" strokeWidth="1"/>
    <text x="350" y="292" textAnchor="middle" fontSize="10" fill="#12805A">
      Early awareness ≠ obsessing over taxes. It's simply being thoughtful from the start.
    </text>
  </svg>
);

// SVG 5: Compounding Effect Over Time
const CompoundingEffectSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#2C3F5E">Small Differences Grow Over Time</text>
    <text x="350" y="48" textAnchor="middle" fontSize="11" fill="#717680">Why tax efficiency matters more the longer you invest</text>
    
    {/* Two paths visualization */}
    <g transform="translate(80, 80)">
      {/* Y-axis */}
      <line x1="40" y1="20" x2="40" y2="170" stroke="#CFD0D3" strokeWidth="2"/>
      <text x="15" y="95" fontSize="8" fill="#717680" transform="rotate(-90 15 95)">Wealth Kept</text>
      
      {/* X-axis */}
      <line x1="40" y1="170" x2="560" y2="170" stroke="#CFD0D3" strokeWidth="2"/>
      <text x="300" y="195" textAnchor="middle" fontSize="9" fill="#717680">Time (Years)</text>
      
      {/* Time markers */}
      <text x="100" y="185" textAnchor="middle" fontSize="7" fill="#A0A3AA">5</text>
      <text x="200" y="185" textAnchor="middle" fontSize="7" fill="#A0A3AA">10</text>
      <text x="300" y="185" textAnchor="middle" fontSize="7" fill="#A0A3AA">15</text>
      <text x="400" y="185" textAnchor="middle" fontSize="7" fill="#A0A3AA">20</text>
      <text x="500" y="185" textAnchor="middle" fontSize="7" fill="#A0A3AA">25</text>
      
      {/* More efficient path (higher) */}
      <path d="M50 160 Q150 150 200 130 Q300 100 400 60 Q480 30 540 20" 
            fill="none" stroke="#12805A" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="540" cy="20" r="8" fill="#12805A"/>
      <text x="560" y="25" fontSize="8" fill="#12805A" fontWeight="600">More tax-aware</text>
      
      {/* Less efficient path (lower) */}
      <path d="M50 160 Q150 155 200 145 Q300 125 400 95 Q480 75 540 65" 
            fill="none" stroke="#A0A3AA" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="540" cy="65" r="8" fill="#A0A3AA"/>
      <text x="560" y="70" fontSize="8" fill="#717680">Less tax-aware</text>
      
      {/* Gap indicator */}
      <line x1="530" y1="28" x2="530" y2="57" stroke="#E04848" strokeWidth="2" strokeDasharray="3"/>
      <text x="530" y="45" fontSize="7" fill="#C7363B" textAnchor="end">Gap</text>
    </g>
    
    {/* Key insight */}
    <rect x="100" y="250" width="500" height="35" fill="#2C3F5E" rx="8"/>
    <text x="350" y="272" textAnchor="middle" fontSize="10" fill="white">
      The same returns, with different tax awareness, lead to different outcomes over time.
    </text>
  </svg>
);

// SVG 6: Global Example - Alex's Journey
const GlobalExampleSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#2C3F5E">A Simple Example: Alex's Investment Returns</text>
    <text x="350" y="48" textAnchor="middle" fontSize="11" fill="#717680">Understanding the difference between gross and net returns</text>
    
    {/* Character */}
    <g transform="translate(80, 120)">
      <circle cx="40" cy="30" r="25" fill="#E0E7F1" stroke="#5A77AA" strokeWidth="2"/>
      <text x="40" y="35" textAnchor="middle" fontSize="20">👤</text>
      <text x="40" y="75" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2C3F5E">Alex</text>
      <text x="40" y="90" textAnchor="middle" fontSize="8" fill="#717680">Investor</text>
    </g>
    
    {/* Story flow */}
    <g transform="translate(160, 90)">
      {/* Step 1: Investment */}
      <rect x="0" y="0" width="130" height="80" fill="#E0E7F1" rx="8" stroke="#5A77AA" strokeWidth="1"/>
      <text x="65" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#2C3F5E">INVESTS</text>
      <text x="65" y="45" textAnchor="middle" fontSize="16" fontWeight="700" fill="#2C3F5E">$10,000</text>
      <text x="65" y="65" textAnchor="middle" fontSize="8" fill="#717680">Starting capital</text>
      
      {/* Arrow */}
      <line x1="140" y1="40" x2="170" y2="40" stroke="#A0A3AA" strokeWidth="2"/>
      <polygon points="168,35 180,40 168,45" fill="#A0A3AA"/>
      
      {/* Step 2: Growth */}
      <rect x="185" y="0" width="130" height="80" fill="#EEF9F4" rx="8" stroke="#12805A" strokeWidth="1"/>
      <text x="250" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#12805A">EARNS</text>
      <text x="250" y="45" textAnchor="middle" fontSize="16" fontWeight="700" fill="#12805A">$1,000</text>
      <text x="250" y="65" textAnchor="middle" fontSize="8" fill="#717680">Gross profit</text>
      
      {/* Arrow */}
      <line x1="325" y1="40" x2="355" y2="40" stroke="#A0A3AA" strokeWidth="2"/>
      <polygon points="353,35 365,40 353,45" fill="#A0A3AA"/>
      
      {/* Step 3: Tax */}
      <rect x="370" y="0" width="130" height="80" fill="#FDF1F1" rx="8" stroke="#E04848" strokeWidth="1"/>
      <text x="435" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#C7363B">TAXES DUE</text>
      <text x="435" y="45" textAnchor="middle" fontSize="14" fontWeight="700" fill="#C7363B">Some portion</text>
      <text x="435" y="65" textAnchor="middle" fontSize="8" fill="#717680">To government</text>
    </g>
    
    {/* Result */}
    <g transform="translate(160, 190)">
      <rect x="0" y="0" width="340" height="60" fill="#2C3F5E" rx="10"/>
      <text x="170" y="22" textAnchor="middle" fontSize="10" fill="#9FB3D3">WHAT ALEX KEEPS</text>
      <text x="170" y="45" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">Less than $1,000 — the net return</text>
    </g>
    
    {/* Key point */}
    <g transform="translate(100, 270)">
      <rect x="0" y="0" width="500" height="55" fill="#F6ECCE" rx="10" stroke="#B8923F" strokeWidth="1"/>
      <text x="250" y="20" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B26">💡 THE INSIGHT</text>
      <text x="250" y="38" textAnchor="middle" fontSize="9" fill="#533E22">Alex earned $1,000 on paper, but that's not what Alex keeps.</text>
      <text x="250" y="52" textAnchor="middle" fontSize="9" fill="#533E22">Tax-aware investors think about the after-tax amount from the start.</text>
    </g>
  </svg>
);

// SVG 7: Tax Efficiency is Not Tax Avoidance
const NotTaxAvoidanceSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="600" fill="#2C3F5E">Important Distinction</text>
    <text x="350" y="50" textAnchor="middle" fontSize="11" fill="#717680">Tax efficiency is not the same as tax avoidance</text>
    
    {/* Two columns comparison */}
    <g transform="translate(50, 75)">
      {/* Tax Efficiency - Good */}
      <rect x="0" y="0" width="280" height="140" fill="#EEF9F4" rx="12" stroke="#12805A" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="12" fontWeight="700" fill="#12805A">✓ TAX EFFICIENCY</text>
      <line x1="20" y1="40" x2="260" y2="40" stroke="#3CCB97" strokeWidth="1"/>
      <text x="140" y="60" textAnchor="middle" fontSize="9" fill="#12805A">Being aware of taxes</text>
      <text x="140" y="78" textAnchor="middle" fontSize="9" fill="#12805A">Making thoughtful decisions</text>
      <text x="140" y="96" textAnchor="middle" fontSize="9" fill="#12805A">Using legal options wisely</text>
      <text x="140" y="114" textAnchor="middle" fontSize="9" fill="#12805A">Planning within the rules</text>
      <text x="140" y="132" textAnchor="middle" fontSize="8" fontWeight="600" fill="#12805A">Responsible & Legal</text>
      
      {/* Tax Avoidance/Evasion - Bad */}
      <rect x="320" y="0" width="280" height="140" fill="#FDF1F1" rx="12" stroke="#E04848" strokeWidth="2"/>
      <text x="460" y="28" textAnchor="middle" fontSize="12" fontWeight="700" fill="#C7363B">✗ TAX EVASION</text>
      <line x1="340" y1="40" x2="580" y2="40" stroke="#F09B9B" strokeWidth="1"/>
      <text x="460" y="60" textAnchor="middle" fontSize="9" fill="#842428">Hiding income</text>
      <text x="460" y="78" textAnchor="middle" fontSize="9" fill="#842428">Illegal schemes</text>
      <text x="460" y="96" textAnchor="middle" fontSize="9" fill="#842428">Falsifying records</text>
      <text x="460" y="114" textAnchor="middle" fontSize="9" fill="#842428">Breaking the law</text>
      <text x="460" y="132" textAnchor="middle" fontSize="8" fontWeight="600" fill="#C7363B">Illegal & Punishable</text>
    </g>
    
    {/* Bottom message */}
    <rect x="100" y="230" width="500" height="35" fill="#2A2A2C" rx="8"/>
    <text x="350" y="252" textAnchor="middle" fontSize="10" fill="white">
      This course is about awareness — understanding that taxes exist and matter to your returns.
    </text>
  </svg>
);

// SVG 8: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 200" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="200" fill="#F5F5F7" rx="16"/>
    
    {/* Central message */}
    <rect x="50" y="25" width="600" height="150" fill="url(#taxEfficiencyGradient)" rx="16"/>
    
    <defs>
      <linearGradient id="taxEfficiencyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2C3F5E"/>
        <stop offset="100%" stopColor="#5A77AA"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="60" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">🔑 Key Takeaway</text>
    
    <text x="350" y="90" textAnchor="middle" fontSize="11" fill="white">Tax efficiency isn't about tricks or schemes.</text>
    <text x="350" y="110" textAnchor="middle" fontSize="11" fill="white">It's simply about being aware that what you earn and what you keep</text>
    <text x="350" y="130" textAnchor="middle" fontSize="11" fill="white">are two different numbers — and that difference matters over time.</text>
    <text x="350" y="155" textAnchor="middle" fontSize="14" fontWeight="700" fill="#F6ECCE">AWARENESS IS THE FIRST STEP.</text>
  </svg>
);

// SVG 9: India Context
const IndiaNoteSVG = () => (
  <svg viewBox="0 0 700 160" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="160" fill="#FCF3EE" rx="16" stroke="#F0C2A9" strokeWidth="1"/>
    
    {/* Flag colors accent */}
    <rect x="0" y="0" width="8" height="160" fill="#D2754C" rx="4"/>
    <rect x="8" y="0" width="4" height="160" fill="white"/>
    <rect x="12" y="0" width="8" height="160" fill="#12805A"/>
    
    {/* Content */}
    <text x="350" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fill="#9C4D2E">🇮🇳 India-Specific Note</text>
    
    <text x="350" y="58" textAnchor="middle" fontSize="10" fill="#7D3F28">
      In India, tax efficiency is especially relevant for investors.
    </text>
    <text x="350" y="78" textAnchor="middle" fontSize="10" fill="#7D3F28">
      Different investment types (equity, debt, gold, real estate) have different tax treatments.
    </text>
    <text x="350" y="98" textAnchor="middle" fontSize="10" fill="#7D3F28">
      Being aware of these differences — without obsessing over them — helps make informed choices.
    </text>
    <text x="350" y="125" textAnchor="middle" fontSize="9" fill="#9C4D2E">
      Consult a qualified tax professional for specific guidance on Indian tax laws.
    </text>
    <text x="350" y="145" textAnchor="middle" fontSize="8" fill="#7D3F28" fontStyle="italic">
      This note is for awareness only and does not constitute tax advice.
    </text>
  </svg>
);

// SVG 10: Disclaimer Banner
const DisclaimerBannerSVG = () => (
  <svg viewBox="0 0 700 100" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="100" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
    
    {/* Warning icon */}
    <circle cx="60" cy="50" r="25" fill="#FBE1E1" stroke="#E04848" strokeWidth="2"/>
    <text x="60" y="58" textAnchor="middle" fontSize="24" fill="#C7363B">⚠️</text>
    
    {/* Text */}
    <text x="370" y="35" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">Educational Content Only</text>
    <text x="370" y="55" textAnchor="middle" fontSize="9" fill="#842428">
      This lesson provides general awareness about tax efficiency concepts.
    </text>
    <text x="370" y="72" textAnchor="middle" fontSize="9" fill="#842428">
      It is not tax advice, financial advice, or legal advice. Always consult qualified professionals.
    </text>
  </svg>
);

const TaxLesson5 = () => {
  const navigate = useNavigate();

  const quizQuestions = [
    {
      question: "What does 'tax efficiency' mean for an investor?",
      options: [
        "Paying the highest amount of taxes possible",
        "Avoiding all taxes illegally",
        "Being aware of taxes and keeping more of what you earn after taxes",
        "Only investing in tax-free investments"
      ],
      correctAnswer: "Being aware of taxes and keeping more of what you earn after taxes",
      explanation: "Tax efficiency is simply about being aware that taxes exist and affect your returns. It's about understanding the difference between what you earn (gross) and what you keep (net)."
    },
    {
      question: "Why is it helpful to think about taxes early in your investing journey?",
      options: [
        "Because taxes disappear if you plan early",
        "Because small differences in after-tax returns compound over many years",
        "Because you can eliminate all tax obligations with early planning",
        "Because tax laws only apply to investors who don't plan"
      ],
      correctAnswer: "Because small differences in after-tax returns compound over many years",
      explanation: "Early awareness doesn't eliminate taxes, but it helps you understand that even small differences in what you keep add up significantly over time through compounding."
    }
  ];

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/learn/taxes')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <FaArrowLeft />
            <span>Back to Tax Basics</span>
          </button>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Lesson 5 of 6
            </span>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-800 mt-4 tracking-[-0.025em]">Tax Efficiency & Planning (Conceptual)</h1>
            <p className="text-gray-600 mt-2">Understanding the concept of keeping more of what you earn</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.025em]">Why "Keeping More" Matters</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              As investors, we often focus on <strong>earning returns</strong> — watching prices rise, 
              seeing our investments grow. But there's another side to the story that's equally important: 
              <strong> what you actually keep</strong>.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Taxes are a fact of life for investors around the world. The returns you see on paper 
              (gross returns) are not the same as what ends up in your pocket after taxes (net returns). 
              Understanding this difference is the foundation of what's called "tax efficiency."
            </p>
            <p className="text-lg leading-relaxed">
              In this lesson, we'll explore the <strong>concept</strong> of tax efficiency — not strategies 
              or tactics, but simply the awareness that taxes affect your real returns. This awareness 
              is the first step toward making thoughtful decisions about your financial future.
            </p>
          </div>

          <WhatIsTaxEfficiencySVG />
        </div>

        {/* Earning vs Keeping */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Earning Returns vs Keeping Returns</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              When your investments perform well, you <strong>earn</strong> returns. Your portfolio 
              statement shows growth. Your stocks have gained value. Your interest payments have 
              accumulated. This is your <strong>gross return</strong> — the total amount before 
              any deductions.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              But when tax season comes, some portion of those gains typically goes to the government 
              as taxes. What remains is your <strong>net return</strong> — what you actually keep 
              and can use.
            </p>
            <p className="text-lg leading-relaxed">
              The difference between these two numbers might seem small in any single year. But 
              over years and decades of investing, this gap adds up significantly. Understanding 
              that this gap exists is the first step toward being a thoughtful investor.
            </p>
          </div>

          <EarningVsKeepingSVG />
        </div>

        {/* The Gap */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Understanding the Gap</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Think of your investment returns as starting as a whole pie. This is everything you've 
              earned — your gross return. But this whole pie doesn't all belong to you.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              A slice goes to taxes. This is normal, expected, and how societies fund public services. 
              What remains after taxes is your slice — your net return, what you actually keep.
            </p>
            <p className="text-lg leading-relaxed">
              <strong>Tax efficiency</strong> is simply being aware that this gap exists and that 
              different choices might result in different gap sizes. We're not talking about 
              eliminating taxes (that's not possible or legal) — just being conscious that they're 
              part of the equation.
            </p>
          </div>

          <TheGapSVG />
        </div>

        {/* Why Planning Early */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Why Think About This Early?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              You might wonder: "Why should a beginner think about taxes? Isn't that complicated?" 
              The answer isn't about complexity — it's about awareness.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Early awareness doesn't mean obsessing over taxes or becoming a tax expert. It simply 
              means knowing that <strong>taxes exist as part of investing</strong>. This basic 
              awareness helps you:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg">
              <li>Set realistic expectations about returns</li>
              <li>Understand that headline returns aren't the full story</li>
              <li>Know when to seek professional guidance</li>
              <li>Make more informed choices over time</li>
            </ul>
            <p className="text-lg leading-relaxed">
              The earlier you develop this awareness, the more naturally it becomes part of your 
              investing mindset — not as stress, but as understanding.
            </p>
          </div>

          <WhyPlanningEarlyMattersSVG />
        </div>

        {/* Compounding Effect */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">The Long-Term Perspective</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              In investing, we often talk about <strong>compounding</strong> — how returns build 
              on returns over time. The same principle applies to what you keep after taxes.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Two investors might earn the exact same gross returns year after year. But if one 
              keeps slightly more after taxes (through legal, thoughtful choices), that small 
              difference compounds over time. After 10, 20, or 30 years, the gap between their 
              wealth can be meaningful.
            </p>
            <p className="text-lg leading-relaxed">
              This isn't about aggressive tax planning or complicated schemes. It's simply about 
              the mathematical reality that <strong>what you keep compounds</strong>, just like 
              what you earn. Being aware of this from the start helps frame your thinking correctly.
            </p>
          </div>

          <CompoundingEffectSVG />
        </div>

        {/* Global Example */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">A Simple Example</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Let's consider a straightforward scenario to illustrate the concept:
            </p>
            <p className="text-lg leading-relaxed mb-4">
              <strong>Alex</strong> invests $10,000 and, over time, earns $1,000 in profit. That's 
              a 10% return on paper — the gross return. When Alex checks their investment account, 
              it shows $11,000.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              But when it comes time to pay taxes on that $1,000 gain, some portion goes to the 
              government. Alex doesn't keep the full $1,000 — they keep the <strong>after-tax 
              amount</strong>, whatever that may be based on their situation.
            </p>
            <p className="text-lg leading-relaxed">
              A tax-aware investor understands this from the start. They don't think "I made $1,000" — 
              they think "I earned $1,000 gross, and my actual gain will be somewhat less after taxes." 
              This simple shift in thinking is what tax efficiency awareness is all about.
            </p>
          </div>

          <GlobalExampleSVG />
        </div>

        {/* Important Distinction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">An Important Clarification</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              It's important to be crystal clear: tax efficiency is <strong>not</strong> about 
              avoiding taxes or finding loopholes. Those approaches are either illegal (tax evasion) 
              or often counterproductive.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Tax efficiency is simply about <strong>awareness</strong>:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg">
              <li>Knowing that taxes are part of investing</li>
              <li>Understanding that gross returns differ from net returns</li>
              <li>Recognizing that this difference matters over time</li>
              <li>Being open to learning more as your journey continues</li>
            </ul>
            <p className="text-lg leading-relaxed">
              Nothing in this lesson suggests how to reduce taxes or which investments are "better" 
              for tax purposes. Those are complex topics requiring professional guidance. Here, we're 
              only building awareness.
            </p>
          </div>

          <NotTaxAvoidanceSVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
          
          <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-200">
            <p className="text-blue-800 font-medium">
              Remember: You don't need to become a tax expert. The goal is simply to know that 
              taxes exist, they affect your returns, and that difference compounds over time. 
              That awareness alone puts you ahead of many investors who never think about it.
            </p>
          </div>
        </div>

        {/* India Note */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">🌍 Global Context with India Note</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              The concept of tax efficiency applies universally. Whether you're investing in the 
              United States, Europe, Asia, or anywhere else, taxes are part of the equation. 
              Different countries have different tax systems, rates, and rules — but the fundamental 
              idea remains the same: what you earn and what you keep are two different numbers.
            </p>
          </div>

          <IndiaNoteSVG />
        </div>

        {/* Quiz Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">📝 Knowledge Check</h2>
          {quizQuestions.map((q, index) => (
            <QuizQuestion key={index} {...q} />
          ))}
        </div>

        {/* Reflection Activity */}
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 rounded-full p-3">
              <FaLightbulb className="text-white text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">Reflection Activity</h3>
              <div className="bg-white rounded-xl p-5 border border-blue-200">
                <p className="text-gray-800 font-medium mb-4">
                  Think about your own perspective on investing returns:
                </p>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-blue-900 font-medium">
                    When you imagine making money from investments, do you typically think 
                    about the gross amount (before taxes) or the net amount (after taxes)? 
                    How might shifting to a "net returns" mindset change how you view 
                    investment performance?
                  </p>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 text-sm">
                    <strong>Note:</strong> There's no right or wrong answer here. This reflection 
                    is simply about developing awareness. Most people naturally think about gross 
                    returns because that's what investment statements show. Becoming aware of the 
                    net return perspective is a valuable shift.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mb-8">
          <DisclaimerBannerSVG />
        </div>

        {/* Summary */}
        <div className="rounded-2xl p-8 shadow-lg mb-8 text-white bg-brand-fill">
          <h3 className="text-xl font-semibold mb-4">🔑 Lesson Summary</h3>
          <ul className="space-y-2 text-lg">
            <li>• <strong>Tax efficiency</strong> means keeping more of what you earn after taxes</li>
            <li>• <strong>Gross returns</strong> (total earned) differ from <strong>net returns</strong> (what you keep)</li>
            <li>• The gap between gross and net exists for all investors — it's normal</li>
            <li>• <strong>Early awareness</strong> helps you set realistic expectations</li>
            <li>• Small differences in what you keep <strong>compound over time</strong></li>
            <li>• Tax efficiency is about awareness, not avoidance or complicated schemes</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/tax-lesson-4')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-colors"
          >
            <FaArrowLeft />
            <span>Previous Lesson</span>
          </button>
          <button
            onClick={() => navigate('/learn/tax-lesson-6')}
            className="flex items-center gap-2 bg-brand-fill hover:bg-brand-hover text-white px-6 py-3 rounded-xl transition-colors"
          >
            <span>Next Lesson</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default TaxLesson5;
