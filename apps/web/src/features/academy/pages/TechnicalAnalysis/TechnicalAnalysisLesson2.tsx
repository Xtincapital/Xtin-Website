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

// SVG 1: Why Candlesticks - Line vs Candlestick Comparison
const LineVsCandlestickSVG = () => (
  <svg viewBox="0 0 600 300" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#373A41">Line Chart vs Candlestick Chart</text>
    
    {/* Left Panel - Line Chart */}
    <rect x="20" y="50" width="270" height="230" fill="#ffffff" rx="12" stroke="#E4E4EA" strokeWidth="2"/>
    <text x="155" y="75" textAnchor="middle" fontSize="13" fontWeight="600" fill="#717680">Line Chart</text>
    <text x="155" y="92" textAnchor="middle" fontSize="10" fill="#A0A3AA">Shows only closing prices</text>
    
    {/* Line chart axes */}
    <line x1="50" y1="110" x2="50" y2="240" stroke="#CFD0D3" strokeWidth="1.5"/>
    <line x1="50" y1="240" x2="260" y2="240" stroke="#CFD0D3" strokeWidth="1.5"/>
    
    {/* Simple line */}
    <path 
      d="M60 200 L90 185 L120 190 L150 170 L180 155 L210 165 L240 145" 
      fill="none" 
      stroke="#5A77AA" 
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Dots on line */}
    <circle cx="60" cy="200" r="4" fill="#5A77AA"/>
    <circle cx="120" cy="190" r="4" fill="#5A77AA"/>
    <circle cx="180" cy="155" r="4" fill="#5A77AA"/>
    <circle cx="240" cy="145" r="4" fill="#5A77AA"/>
    
    {/* Missing info indicator */}
    <rect x="45" y="252" width="210" height="22" fill="#F6ECCE" rx="6"/>
    <text x="150" y="267" textAnchor="middle" fontSize="9" fill="#654B26">⚠️ Missing: Open, High, Low data</text>
    
    {/* Right Panel - Candlestick Chart */}
    <rect x="310" y="50" width="270" height="230" fill="#ffffff" rx="12" stroke="#E4E4EA" strokeWidth="2"/>
    <text x="445" y="75" textAnchor="middle" fontSize="13" fontWeight="600" fill="#2C3F5E">Candlestick Chart</text>
    <text x="445" y="92" textAnchor="middle" fontSize="10" fill="#5A77AA">Shows Open, High, Low, Close</text>
    
    {/* Candlestick axes */}
    <line x1="340" y1="110" x2="340" y2="240" stroke="#CFD0D3" strokeWidth="1.5"/>
    <line x1="340" y1="240" x2="550" y2="240" stroke="#CFD0D3" strokeWidth="1.5"/>
    
    {/* Candlesticks */}
    {/* Bearish candle 1 */}
    <line x1="365" y1="140" x2="365" y2="210" stroke="#E04848" strokeWidth="1.5"/>
    <rect x="357" y="155" width="16" height="40" fill="#E04848" rx="2"/>
    
    {/* Bullish candle 2 */}
    <line x1="400" y1="135" x2="400" y2="200" stroke="#16A34A" strokeWidth="1.5"/>
    <rect x="392" y="150" width="16" height="35" fill="#16A34A" rx="2"/>
    
    {/* Bearish candle 3 */}
    <line x1="435" y1="130" x2="435" y2="195" stroke="#E04848" strokeWidth="1.5"/>
    <rect x="427" y="145" width="16" height="30" fill="#E04848" rx="2"/>
    
    {/* Bullish candle 4 */}
    <line x1="470" y1="115" x2="470" y2="175" stroke="#16A34A" strokeWidth="1.5"/>
    <rect x="462" y="130" width="16" height="30" fill="#16A34A" rx="2"/>
    
    {/* Bullish candle 5 */}
    <line x1="505" y1="105" x2="505" y2="160" stroke="#16A34A" strokeWidth="1.5"/>
    <rect x="497" y="115" width="16" height="35" fill="#16A34A" rx="2"/>
    
    {/* Complete info indicator */}
    <rect x="335" y="252" width="210" height="22" fill="#F0FDF4" rx="6"/>
    <text x="440" y="267" textAnchor="middle" fontSize="9" fill="#16A34A">✓ Complete price behavior visible</text>
  </svg>
);

// SVG 2: Candlestick Anatomy - Detailed Breakdown
const CandlestickAnatomySVG = () => (
  <svg viewBox="0 0 600 380" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="380" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">Anatomy of a Candlestick</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#717680">Every candle tells a story about price activity</text>
    
    {/* Center large candlestick */}
    <g transform="translate(300, 210)">
      {/* Upper wick */}
      <line x1="0" y1="-130" x2="0" y2="-70" stroke="#373A41" strokeWidth="3"/>
      
      {/* Body */}
      <rect x="-35" y="-70" width="70" height="100" fill="#E0E7F1" stroke="#5A77AA" strokeWidth="3" rx="4"/>
      
      {/* Lower wick */}
      <line x1="0" y1="30" x2="0" y2="100" stroke="#373A41" strokeWidth="3"/>
      
      {/* Center pattern */}
      <line x1="-20" y1="-20" x2="20" y2="-20" stroke="#5A77AA" strokeWidth="1" strokeDasharray="4 2"/>
      <line x1="-20" y1="0" x2="20" y2="0" stroke="#5A77AA" strokeWidth="1" strokeDasharray="4 2"/>
    </g>
    
    {/* Labels with lines */}
    {/* High label */}
    <line x1="300" y1="80" x2="180" y2="60" stroke="#717680" strokeWidth="1.5" strokeDasharray="4 2"/>
    <rect x="80" y="45" width="100" height="32" fill="#F6ECCE" rx="8" stroke="#B8923F" strokeWidth="1.5"/>
    <text x="130" y="63" textAnchor="middle" fontSize="11" fontWeight="600" fill="#654B26">HIGH</text>
    <text x="130" y="73" textAnchor="middle" fontSize="8" fill="#7C5D2B">Highest price</text>
    
    {/* Open label */}
    <line x1="265" y1="140" x2="160" y2="120" stroke="#717680" strokeWidth="1.5" strokeDasharray="4 2"/>
    <rect x="60" y="105" width="100" height="32" fill="#E0E7F1" rx="8" stroke="#5A77AA" strokeWidth="1.5"/>
    <text x="110" y="123" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2C3F5E">OPEN</text>
    <text x="110" y="133" textAnchor="middle" fontSize="8" fill="#3E5C8A">Starting price</text>
    
    {/* Close label */}
    <line x1="265" y1="240" x2="160" y2="260" stroke="#717680" strokeWidth="1.5" strokeDasharray="4 2"/>
    <rect x="60" y="245" width="100" height="32" fill="#E0E7F1" rx="8" stroke="#5A77AA" strokeWidth="1.5"/>
    <text x="110" y="263" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2C3F5E">CLOSE</text>
    <text x="110" y="273" textAnchor="middle" fontSize="8" fill="#3E5C8A">Ending price</text>
    
    {/* Low label */}
    <line x1="300" y1="310" x2="180" y2="330" stroke="#717680" strokeWidth="1.5" strokeDasharray="4 2"/>
    <rect x="80" y="315" width="100" height="32" fill="#F6ECCE" rx="8" stroke="#B8923F" strokeWidth="1.5"/>
    <text x="130" y="333" textAnchor="middle" fontSize="11" fontWeight="600" fill="#654B26">LOW</text>
    <text x="130" y="343" textAnchor="middle" fontSize="8" fill="#7C5D2B">Lowest price</text>
    
    {/* Right side labels */}
    {/* Upper wick label */}
    <line x1="300" y1="95" x2="420" y2="75" stroke="#717680" strokeWidth="1.5" strokeDasharray="4 2"/>
    <rect x="420" y="55" width="140" height="40" fill="#EEEEF1" rx="8" stroke="#A0A3AA" strokeWidth="1.5"/>
    <text x="490" y="73" textAnchor="middle" fontSize="10" fontWeight="600" fill="#555A63">Upper Wick</text>
    <text x="490" y="88" textAnchor="middle" fontSize="8" fill="#717680">Price reached but retreated</text>
    
    {/* Body label */}
    <line x1="335" y1="190" x2="420" y2="170" stroke="#717680" strokeWidth="1.5" strokeDasharray="4 2"/>
    <rect x="420" y="150" width="140" height="40" fill="#E0E7F1" rx="8" stroke="#5A77AA" strokeWidth="1.5"/>
    <text x="490" y="168" textAnchor="middle" fontSize="10" fontWeight="600" fill="#344C72">Body</text>
    <text x="490" y="183" textAnchor="middle" fontSize="8" fill="#3E5C8A">Range: Open to Close</text>
    
    {/* Lower wick label */}
    <line x1="300" y1="290" x2="420" y2="280" stroke="#717680" strokeWidth="1.5" strokeDasharray="4 2"/>
    <rect x="420" y="260" width="140" height="40" fill="#EEEEF1" rx="8" stroke="#A0A3AA" strokeWidth="1.5"/>
    <text x="490" y="278" textAnchor="middle" fontSize="10" fontWeight="600" fill="#555A63">Lower Wick</text>
    <text x="490" y="293" textAnchor="middle" fontSize="8" fill="#717680">Price dropped but recovered</text>
  </svg>
);

// SVG 3: Bullish vs Bearish Candle
const BullishVsBearishSVG = () => (
  <svg viewBox="0 0 600 340" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">Bullish vs Bearish Candles</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#717680">The color tells you if buyers or sellers won the period</text>
    
    {/* Left Panel - Bullish */}
    <rect x="30" y="70" width="250" height="250" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
    <text x="155" y="98" textAnchor="middle" fontSize="14" fontWeight="600" fill="#16A34A">Bullish Candle</text>
    <text x="155" y="115" textAnchor="middle" fontSize="10" fill="#16A34A">(Green / White)</text>
    
    {/* Bullish candle */}
    <g transform="translate(155, 195)">
      <line x1="0" y1="-55" x2="0" y2="-30" stroke="#16A34A" strokeWidth="2.5"/>
      <rect x="-25" y="-30" width="50" height="60" fill="#16A34A" rx="3"/>
      <line x1="0" y1="30" x2="0" y2="55" stroke="#16A34A" strokeWidth="2.5"/>
      
      {/* Price labels */}
      <text x="35" y="-25" fontSize="9" fill="#16A34A">Close (Higher)</text>
      <text x="35" y="25" fontSize="9" fill="#16A34A">Open (Lower)</text>
    </g>
    
    {/* Arrow showing direction */}
    <g transform="translate(155, 280)">
      <path d="M-20 15 L0 -5 L20 15" stroke="#16A34A" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <text x="155" y="308" textAnchor="middle" fontSize="11" fontWeight="500" fill="#16A34A">Price moved UP</text>
    <text x="155" y="322" textAnchor="middle" fontSize="9" fill="#16A34A">Close &gt; Open</text>
    
    {/* Right Panel - Bearish */}
    <rect x="320" y="70" width="250" height="250" fill="#FDF1F1" rx="12" stroke="#E04848" strokeWidth="2"/>
    <text x="445" y="98" textAnchor="middle" fontSize="14" fontWeight="600" fill="#C7363B">Bearish Candle</text>
    <text x="445" y="115" textAnchor="middle" fontSize="10" fill="#A52A2F">(Red / Black)</text>
    
    {/* Bearish candle */}
    <g transform="translate(445, 195)">
      <line x1="0" y1="-55" x2="0" y2="-30" stroke="#E04848" strokeWidth="2.5"/>
      <rect x="-25" y="-30" width="50" height="60" fill="#E04848" rx="3"/>
      <line x1="0" y1="30" x2="0" y2="55" stroke="#E04848" strokeWidth="2.5"/>
      
      {/* Price labels */}
      <text x="35" y="-25" fontSize="9" fill="#842428">Open (Higher)</text>
      <text x="35" y="25" fontSize="9" fill="#842428">Close (Lower)</text>
    </g>
    
    {/* Arrow showing direction */}
    <g transform="translate(445, 280)">
      <path d="M-20 -5 L0 15 L20 -5" stroke="#C7363B" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <text x="445" y="308" textAnchor="middle" fontSize="11" fontWeight="500" fill="#842428">Price moved DOWN</text>
    <text x="445" y="322" textAnchor="middle" fontSize="9" fill="#A52A2F">Close &lt; Open</text>
  </svg>
);

// SVG 4: Candle Size Meaning
const CandleSizeMeaningSVG = () => (
  <svg viewBox="0 0 600 320" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">What Candle Size Suggests</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#717680">Larger bodies suggest stronger conviction in that direction</text>
    
    {/* Small Candle */}
    <g transform="translate(120, 180)">
      <rect x="-60" y="-110" width="120" height="200" fill="#ffffff" rx="10" stroke="#E4E4EA" strokeWidth="2"/>
      <text x="0" y="-85" textAnchor="middle" fontSize="12" fontWeight="600" fill="#717680">Small Body</text>
      
      <line x1="0" y1="-50" x2="0" y2="-30" stroke="#16A34A" strokeWidth="2"/>
      <rect x="-15" y="-30" width="30" height="20" fill="#16A34A" rx="2"/>
      <line x1="0" y1="-10" x2="0" y2="10" stroke="#16A34A" strokeWidth="2"/>
      
      <text x="0" y="40" textAnchor="middle" fontSize="9" fill="#555A63">Low activity</text>
      <text x="0" y="55" textAnchor="middle" fontSize="9" fill="#555A63">Indecision</text>
      <text x="0" y="70" textAnchor="middle" fontSize="9" fill="#555A63">Balanced buyers/sellers</text>
    </g>
    
    {/* Medium Candle */}
    <g transform="translate(300, 180)">
      <rect x="-60" y="-110" width="120" height="200" fill="#ffffff" rx="10" stroke="#E4E4EA" strokeWidth="2"/>
      <text x="0" y="-85" textAnchor="middle" fontSize="12" fontWeight="600" fill="#717680">Medium Body</text>
      
      <line x1="0" y1="-55" x2="0" y2="-35" stroke="#16A34A" strokeWidth="2"/>
      <rect x="-18" y="-35" width="36" height="45" fill="#16A34A" rx="2"/>
      <line x1="0" y1="10" x2="0" y2="30" stroke="#16A34A" strokeWidth="2"/>
      
      <text x="0" y="50" textAnchor="middle" fontSize="9" fill="#555A63">Moderate activity</text>
      <text x="0" y="65" textAnchor="middle" fontSize="9" fill="#555A63">Some conviction</text>
      <text x="0" y="80" textAnchor="middle" fontSize="9" fill="#555A63">Normal trading</text>
    </g>
    
    {/* Large Candle */}
    <g transform="translate(480, 180)">
      <rect x="-60" y="-110" width="120" height="200" fill="#ffffff" rx="10" stroke="#E4E4EA" strokeWidth="2"/>
      <text x="0" y="-85" textAnchor="middle" fontSize="12" fontWeight="600" fill="#717680">Large Body</text>
      
      <line x1="0" y1="-60" x2="0" y2="-50" stroke="#16A34A" strokeWidth="2"/>
      <rect x="-22" y="-50" width="44" height="70" fill="#16A34A" rx="2"/>
      <line x1="0" y1="20" x2="0" y2="30" stroke="#16A34A" strokeWidth="2"/>
      
      <text x="0" y="50" textAnchor="middle" fontSize="9" fill="#555A63">High activity</text>
      <text x="0" y="65" textAnchor="middle" fontSize="9" fill="#555A63">Strong conviction</text>
      <text x="0" y="80" textAnchor="middle" fontSize="9" fill="#555A63">Decisive movement</text>
    </g>
    
    {/* Bottom note */}
    <rect x="100" y="285" width="400" height="25" fill="#F6ECCE" rx="8"/>
    <text x="300" y="302" textAnchor="middle" fontSize="10" fill="#654B26">💡 Size shows intensity, not direction prediction</text>
  </svg>
);

// SVG 5: Wick Meaning
const WickMeaningSVG = () => (
  <svg viewBox="0 0 600 340" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">What Wicks Tell You</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#717680">Wicks show price rejection — where price went but couldn't stay</text>
    
    {/* Long Upper Wick */}
    <g transform="translate(150, 190)">
      <rect x="-70" y="-120" width="140" height="220" fill="#ffffff" rx="10" stroke="#E4E4EA" strokeWidth="2"/>
      <text x="0" y="-95" textAnchor="middle" fontSize="11" fontWeight="600" fill="#717680">Long Upper Wick</text>
      
      {/* Candle with long upper wick */}
      <line x1="0" y1="-70" x2="0" y2="-20" stroke="#E04848" strokeWidth="2.5"/>
      <rect x="-18" y="-20" width="36" height="35" fill="#E04848" rx="2"/>
      <line x1="0" y1="15" x2="0" y2="30" stroke="#E04848" strokeWidth="2"/>
      
      {/* Annotation */}
      <path d="M25 -45 L45 -45" stroke="#A0A3AA" strokeWidth="1" strokeDasharray="3 2"/>
      <text x="50" y="-42" fontSize="8" fill="#717680">Price rose high</text>
      <text x="50" y="-32" fontSize="8" fill="#717680">but was pushed back</text>
      
      <text x="0" y="60" textAnchor="middle" fontSize="9" fill="#842428">Sellers rejected</text>
      <text x="0" y="75" textAnchor="middle" fontSize="9" fill="#842428">higher prices</text>
    </g>
    
    {/* Long Lower Wick */}
    <g transform="translate(450, 190)">
      <rect x="-70" y="-120" width="140" height="220" fill="#ffffff" rx="10" stroke="#E4E4EA" strokeWidth="2"/>
      <text x="0" y="-95" textAnchor="middle" fontSize="11" fontWeight="600" fill="#717680">Long Lower Wick</text>
      
      {/* Candle with long lower wick */}
      <line x1="0" y1="-50" x2="0" y2="-35" stroke="#16A34A" strokeWidth="2"/>
      <rect x="-18" y="-35" width="36" height="35" fill="#16A34A" rx="2"/>
      <line x1="0" y1="0" x2="0" y2="50" stroke="#16A34A" strokeWidth="2.5"/>
      
      {/* Annotation */}
      <path d="M25 25 L45 25" stroke="#A0A3AA" strokeWidth="1" strokeDasharray="3 2"/>
      <text x="50" y="22" fontSize="8" fill="#717680">Price fell low</text>
      <text x="50" y="32" fontSize="8" fill="#717680">but bounced back</text>
      
      <text x="0" y="70" textAnchor="middle" fontSize="9" fill="#16A34A">Buyers rejected</text>
      <text x="0" y="85" textAnchor="middle" fontSize="9" fill="#16A34A">lower prices</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="295" width="400" height="35" fill="#E0E7F1" rx="8" stroke="#5A77AA" strokeWidth="1"/>
    <text x="300" y="310" textAnchor="middle" fontSize="10" fontWeight="500" fill="#344C72">Key Insight:</text>
    <text x="300" y="323" textAnchor="middle" fontSize="9" fill="#3E5C8A">Long wicks show that price was tested at a level but rejected</text>
  </svg>
);

// SVG 6: Strong Buying vs Strong Selling Example
const BuyingSellingExampleSVG = () => (
  <svg viewBox="0 0 600 300" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">Reading Market Activity</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#717680">These candles show strong conviction in one direction</text>
    
    {/* Strong Buying Candle */}
    <rect x="40" y="70" width="240" height="210" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
    <text x="160" y="95" textAnchor="middle" fontSize="13" fontWeight="600" fill="#16A34A">Strong Buying Activity</text>
    
    <g transform="translate(160, 175)">
      {/* Large bullish candle with small wicks */}
      <line x1="0" y1="-60" x2="0" y2="-50" stroke="#16A34A" strokeWidth="3"/>
      <rect x="-28" y="-50" width="56" height="80" fill="#16A34A" rx="3"/>
      <line x1="0" y1="30" x2="0" y2="40" stroke="#16A34A" strokeWidth="3"/>
    </g>
    
    <text x="160" y="240" textAnchor="middle" fontSize="10" fill="#16A34A">Large green body</text>
    <text x="160" y="255" textAnchor="middle" fontSize="10" fill="#16A34A">Small or no wicks</text>
    <text x="160" y="270" textAnchor="middle" fontSize="9" fill="#16A34A" fontStyle="italic">Buyers dominated the session</text>
    
    {/* Strong Selling Candle */}
    <rect x="320" y="70" width="240" height="210" fill="#FDF1F1" rx="12" stroke="#E04848" strokeWidth="2"/>
    <text x="440" y="95" textAnchor="middle" fontSize="13" fontWeight="600" fill="#C7363B">Strong Selling Activity</text>
    
    <g transform="translate(440, 175)">
      {/* Large bearish candle with small wicks */}
      <line x1="0" y1="-60" x2="0" y2="-50" stroke="#E04848" strokeWidth="3"/>
      <rect x="-28" y="-50" width="56" height="80" fill="#E04848" rx="3"/>
      <line x1="0" y1="30" x2="0" y2="40" stroke="#E04848" strokeWidth="3"/>
    </g>
    
    <text x="440" y="240" textAnchor="middle" fontSize="10" fill="#842428">Large red body</text>
    <text x="440" y="255" textAnchor="middle" fontSize="10" fill="#842428">Small or no wicks</text>
    <text x="440" y="270" textAnchor="middle" fontSize="9" fill="#A52A2F" fontStyle="italic">Sellers dominated the session</text>
  </svg>
);

// SVG 7: OHLC Visual Timeline
const OHLCTimelineSVG = () => (
  <svg viewBox="0 0 600 260" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="260" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">One Candle = One Time Period</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#717680">Each candle captures what happened during its timeframe</text>
    
    {/* Timeline */}
    <line x1="80" y1="85" x2="520" y2="85" stroke="#CFD0D3" strokeWidth="2"/>
    
    {/* Time markers */}
    <circle cx="100" cy="85" r="8" fill="#5A77AA"/>
    <text x="100" y="105" textAnchor="middle" fontSize="9" fill="#5A77AA">OPEN</text>
    <text x="100" y="118" textAnchor="middle" fontSize="8" fill="#717680">$48.00</text>
    
    <circle cx="220" cy="85" r="8" fill="#B8923F"/>
    <text x="220" y="105" textAnchor="middle" fontSize="9" fill="#B8923F">HIGH</text>
    <text x="220" y="118" textAnchor="middle" fontSize="8" fill="#717680">$52.50</text>
    
    <circle cx="380" cy="85" r="8" fill="#B8923F"/>
    <text x="380" y="105" textAnchor="middle" fontSize="9" fill="#B8923F">LOW</text>
    <text x="380" y="118" textAnchor="middle" fontSize="8" fill="#717680">$47.00</text>
    
    <circle cx="500" cy="85" r="8" fill="#16A34A"/>
    <text x="500" y="105" textAnchor="middle" fontSize="9" fill="#16A34A">CLOSE</text>
    <text x="500" y="118" textAnchor="middle" fontSize="8" fill="#717680">$51.00</text>
    
    {/* Arrow showing time */}
    <path d="M80 75 L520 75" stroke="#A0A3AA" strokeWidth="1" markerEnd="url(#arrowhead2)"/>
    <text x="300" y="68" textAnchor="middle" fontSize="9" fill="#A0A3AA">Time →</text>
    
    {/* Resulting candle */}
    <rect x="200" y="145" width="200" height="100" fill="#ffffff" rx="10" stroke="#E4E4EA" strokeWidth="2"/>
    <text x="300" y="165" textAnchor="middle" fontSize="11" fontWeight="500" fill="#717680">Resulting Candle:</text>
    
    <g transform="translate(300, 210)">
      <line x1="0" y1="-30" x2="0" y2="-15" stroke="#16A34A" strokeWidth="2"/>
      <rect x="-20" y="-15" width="40" height="25" fill="#16A34A" rx="2"/>
      <line x1="0" y1="10" x2="0" y2="25" stroke="#16A34A" strokeWidth="2"/>
    </g>
    
    <text x="300" y="248" textAnchor="middle" fontSize="9" fill="#16A34A">Green because Close ($51) &gt; Open ($48)</text>
    
    {/* Arrow definition */}
    <defs>
      <marker id="arrowhead2" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
        <polygon points="0 0, 8 4, 0 8" fill="#A0A3AA"/>
      </marker>
    </defs>
  </svg>
);

const TechnicalAnalysisLesson2 = () => {
  const navigate = useNavigate();

  const quizQuestions = [
    {
      question: "What determines if a candlestick is bullish (green) or bearish (red)?",
      options: [
        "The length of the wicks",
        "The relationship between open and close prices",
        "The total trading volume",
        "The time of day it was formed"
      ],
      correctAnswer: "The relationship between open and close prices",
      explanation: "A bullish candle forms when the close price is higher than the open price. A bearish candle forms when the close is lower than the open. The color simply tells you which direction price moved during that period."
    },
    {
      question: "What does a long wick on a candlestick suggest?",
      options: [
        "Price will definitely reverse",
        "Price was rejected at that level",
        "High trading volume",
        "The market is closed"
      ],
      correctAnswer: "Price was rejected at that level",
      explanation: "A long wick shows that price moved to a certain level but couldn't stay there — it was pushed back. This suggests that buyers or sellers rejected that price level during the trading period."
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
            onClick={() => navigate('/learn/technical-analysis')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <FaArrowLeft />
            <span>Back to Technical Analysis</span>
          </button>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Lesson 2 of 7
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mt-4 tracking-[-0.025em]">Candlesticks – Reading Price Behavior</h1>
            <p className="text-gray-600 mt-2">Understanding how a single candle captures an entire story of price activity</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.025em]">Why Candlesticks?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              When you look at a price chart, you could simply draw a line connecting all the closing prices. 
              That gives you a basic view — but it hides a lot of important information about what actually 
              happened during each time period.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              <strong>Candlestick charts</strong> solve this problem. Each "candle" shows you four key pieces 
              of information: where price <strong>opened</strong>, the <strong>highest</strong> point it reached, 
              the <strong>lowest</strong> point it fell to, and where it <strong>closed</strong>.
            </p>
            <p className="text-lg leading-relaxed">
              This gives you a much richer picture of market activity — helping you understand not just 
              <em>where</em> price ended up, but <em>how</em> it got there.
            </p>
          </div>

          <LineVsCandlestickSVG />
          
          <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-200">
            <p className="text-blue-800">
              <strong>Key insight:</strong> A line chart shows destinations. A candlestick chart shows the 
              journey — including the struggle between buyers and sellers.
            </p>
          </div>
        </div>

        {/* OHLC Explanation */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.025em]">The Four Prices in Every Candle</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Every candlestick represents a specific time period (like 1 day, 1 hour, or 5 minutes). 
              During that period, four prices are recorded:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">📍 Open</h4>
              <p className="text-blue-900 text-sm">
                The first price at which the asset traded when this period began. 
                This is where the candle body starts.
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">⬆️ High</h4>
              <p className="text-amber-900 text-sm">
                The highest price reached during this period. 
                This is the top of the upper wick.
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">⬇️ Low</h4>
              <p className="text-amber-900 text-sm">
                The lowest price reached during this period. 
                This is the bottom of the lower wick.
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🏁 Close</h4>
              <p className="text-blue-900 text-sm">
                The last price at which the asset traded when this period ended. 
                This is where the candle body ends.
              </p>
            </div>
          </div>

          <OHLCTimelineSVG />
          
          <div className="mt-6 bg-slate-100 rounded-xl p-5">
            <p className="text-slate-700">
              <strong>Remember:</strong> The candle's <strong>body</strong> shows the range between open and close. 
              The <strong>wicks</strong> (thin lines) show how far price traveled beyond that range.
            </p>
          </div>
        </div>

        {/* Candlestick Anatomy */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Anatomy of a Candlestick</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Let's break down the parts of a candlestick. Understanding these components is essential 
              for reading any price chart.
            </p>
          </div>

          <CandlestickAnatomySVG />
        </div>

        {/* Bullish vs Bearish */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Bullish vs Bearish Candles</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              The <strong>color</strong> of a candlestick tells you one simple thing: did price go up or down 
              during this period?
            </p>
            <p className="text-lg leading-relaxed">
              If the <strong>close is higher than the open</strong>, buyers pushed the price up — this creates 
              a <strong>bullish candle</strong> (typically green or white). If the <strong>close is lower than 
              the open</strong>, sellers pushed the price down — this creates a <strong>bearish candle</strong> 
              (typically red or black).
            </p>
          </div>

          <BullishVsBearishSVG />
          
          <div className="mt-6 bg-slate-700 rounded-xl p-5 text-white">
            <p className="font-medium">
              💡 The color doesn't predict what will happen next. It only tells you what happened during that specific 
              time period — who won the battle between buyers and sellers.
            </p>
          </div>
        </div>

        {/* Candle Size */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">What Candle Size Tells You</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              The <strong>size of the candle body</strong> gives you a sense of how much conviction there was 
              behind the price movement.
            </p>
            <p className="text-lg leading-relaxed">
              A large body means price moved significantly from open to close — suggesting strong activity in 
              one direction. A small body means price moved very little — suggesting indecision or low activity.
            </p>
          </div>

          <CandleSizeMeaningSVG />
        </div>

        {/* Wick Meaning */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">What Wicks Reveal</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Wicks tell a story that the body alone can't tell. They show you where price <strong>tried to go</strong> 
              but was <strong>pushed back</strong>.
            </p>
            <p className="text-lg leading-relaxed">
              A long upper wick means price rose high but sellers pushed it back down. A long lower wick means 
              price fell low but buyers pushed it back up. These "rejections" give you insight into where 
              resistance and support may exist.
            </p>
          </div>

          <WickMeaningSVG />
        </div>

        {/* Practical Example */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Practical Example: Reading Activity</h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">📌 What Strong Candles Look Like</h3>
            <p className="text-gray-700 mb-4">
              When you see a candle with a <strong>large body and small wicks</strong>, it suggests that 
              one side (buyers or sellers) was clearly in control throughout the period. There was little 
              back-and-forth — price moved decisively in one direction.
            </p>
          </div>

          <BuyingSellingExampleSVG />
          
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-brand-soft rounded-xl p-5 border border-brand-line">
              <h4 className="font-semibold text-brand mb-2">Strong Buying Session</h4>
              <p className="text-brand text-sm">
                A large green candle with minimal wicks shows that buyers were in control from start to finish. 
                Price opened, moved up steadily, and closed near its high.
              </p>
            </div>
            <div className="bg-red-50 rounded-xl p-5 border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">Strong Selling Session</h4>
              <p className="text-red-900 text-sm">
                A large red candle with minimal wicks shows that sellers dominated. 
                Price opened, moved down steadily, and closed near its low.
              </p>
            </div>
          </div>
          
          <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
            <p className="text-amber-800">
              <strong>Important:</strong> These candles show what happened — not what will happen next. 
              A strong buying candle doesn't guarantee more buying will follow. Markets are unpredictable.
            </p>
          </div>
        </div>

        {/* India-specific Note */}
        <div className="bg-indigo-50 rounded-2xl p-6 shadow-lg mb-8 border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-800 mb-3">🌍 Global Context</h3>
          <p className="text-indigo-900">
            Candlestick charts originated in 18th century Japan but are now the global standard for price 
            visualization. Whether you're looking at stocks in New York, currencies in London, or indices 
            in Mumbai, candlestick charts work the same way everywhere. The concepts you're learning here 
            apply universally across all markets.
          </p>
        </div>

        {/* Quiz Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">📝 Knowledge Check</h2>
          {quizQuestions.map((q, index) => (
            <QuizQuestion key={index} {...q} />
          ))}
        </div>

        {/* Reflection Activity */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-purple-500 rounded-full p-3">
              <FaLightbulb className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-purple-800 mb-3">Reflection Activity</h3>
              <div className="bg-white rounded-xl p-5 border border-purple-200">
                <p className="text-gray-800 font-medium mb-3">
                  Take a moment to consider:
                </p>
                <p className="text-gray-700 mb-4 italic">
                  "If you saw a very large candlestick on a chart — much bigger than the candles around it — 
                  what might that tell you about market activity during that period?"
                </p>
                <p className="text-gray-600 text-sm">
                  Think about what a large body suggests about conviction, and what it might mean for 
                  the intensity of buying or selling during that time. Remember: we're observing behavior, 
                  not predicting future movement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="rounded-2xl p-8 shadow-lg mb-8 text-white bg-brand-fill">
          <h3 className="text-xl font-semibold mb-3">🔑 Key Takeaways</h3>
          <ul className="space-y-2 text-lg">
            <li>• Each candlestick shows four prices: Open, High, Low, and Close (OHLC)</li>
            <li>• The body shows the range between open and close; wicks show price extremes</li>
            <li>• Green/white candles = close higher than open (buyers won)</li>
            <li>• Red/black candles = close lower than open (sellers won)</li>
            <li>• Candle size suggests conviction; wicks show price rejection</li>
            <li>• Candlesticks show past behavior, not future predictions</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/technical-analysis')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-colors"
          >
            <FaArrowLeft />
            <span>Previous Lesson</span>
          </button>
          <button
            onClick={() => navigate('/learn/technical-analysis-lesson-3')}
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

export default TechnicalAnalysisLesson2;
