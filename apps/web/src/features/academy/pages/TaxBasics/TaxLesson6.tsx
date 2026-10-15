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

// SVG 1: Why Mistakes Happen
const WhyMistakesHappenSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="600" fill="#2C3F5E">Why Do Tax Mistakes Happen?</text>
    <text x="350" y="52" textAnchor="middle" fontSize="11" fill="#717680">Common reasons beginners overlook taxes</text>
    
    {/* Four reasons */}
    <g transform="translate(50, 80)">
      {/* Reason 1 */}
      <rect x="0" y="0" width="140" height="110" fill="#FDF1F1" rx="10" stroke="#F09B9B" strokeWidth="1"/>
      <circle cx="70" cy="35" r="20" fill="#FBE1E1" stroke="#E04848" strokeWidth="2"/>
      <text x="70" y="40" textAnchor="middle" fontSize="18">🙈</text>
      <text x="70" y="70" textAnchor="middle" fontSize="9" fontWeight="600" fill="#C7363B">Not Visible</text>
      <text x="70" y="85" textAnchor="middle" fontSize="7" fill="#842428">Taxes don't show</text>
      <text x="70" y="97" textAnchor="middle" fontSize="7" fill="#842428">on price charts</text>
      
      {/* Reason 2 */}
      <rect x="155" y="0" width="140" height="110" fill="#F6ECCE" rx="10" stroke="#E2C273" strokeWidth="1"/>
      <circle cx="225" cy="35" r="20" fill="#F6ECCE" stroke="#B8923F" strokeWidth="2"/>
      <text x="225" y="40" textAnchor="middle" fontSize="18">⏰</text>
      <text x="225" y="70" textAnchor="middle" fontSize="9" fontWeight="600" fill="#7C5D2B">Delayed Impact</text>
      <text x="225" y="85" textAnchor="middle" fontSize="7" fill="#654B26">Tax bills come</text>
      <text x="225" y="97" textAnchor="middle" fontSize="7" fill="#654B26">later, not now</text>
      
      {/* Reason 3 */}
      <rect x="310" y="0" width="140" height="110" fill="#E0E7F1" rx="10" stroke="#9FB3D3" strokeWidth="1"/>
      <circle cx="380" cy="35" r="20" fill="#F1F4F9" stroke="#5A77AA" strokeWidth="2"/>
      <text x="380" y="40" textAnchor="middle" fontSize="18">📚</text>
      <text x="380" y="70" textAnchor="middle" fontSize="9" fontWeight="600" fill="#2C3F5E">Complex Rules</text>
      <text x="380" y="85" textAnchor="middle" fontSize="7" fill="#2C3F5E">Tax laws are</text>
      <text x="380" y="97" textAnchor="middle" fontSize="7" fill="#2C3F5E">hard to follow</text>
      
      {/* Reason 4 */}
      <rect x="465" y="0" width="140" height="110" fill="#ECE4F6" rx="10" stroke="#C0A9E2" strokeWidth="1"/>
      <circle cx="535" cy="35" r="20" fill="#F6F2FB" stroke="#8F6FC4" strokeWidth="2"/>
      <text x="535" y="40" textAnchor="middle" fontSize="18">🎯</text>
      <text x="535" y="70" textAnchor="middle" fontSize="9" fontWeight="600" fill="#654B8A">Focus on Gains</text>
      <text x="535" y="85" textAnchor="middle" fontSize="7" fill="#533F70">Excitement about</text>
      <text x="535" y="97" textAnchor="middle" fontSize="7" fill="#533F70">profits distracts</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="210" width="500" height="55" fill="#2C3F5E" rx="10"/>
    <text x="350" y="232" textAnchor="middle" fontSize="10" fill="#9FB3D3">The Result:</text>
    <text x="350" y="250" textAnchor="middle" fontSize="11" fill="white" fontWeight="500">
      Taxes become an afterthought — until they become a problem.
    </text>
  </svg>
);

// SVG 2: Mistake 1 - Ignoring Taxes Completely
const Mistake1SVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="600" fill="#C7363B">Mistake #1: Ignoring Taxes Completely</text>
    <text x="350" y="52" textAnchor="middle" fontSize="11" fill="#717680">"I'll deal with taxes later" mentality</text>
    
    {/* Visual representation */}
    <g transform="translate(100, 80)">
      {/* Investor thinking only about returns */}
      <rect x="0" y="0" width="200" height="130" fill="#F0FDF4" rx="10" stroke="#16A34A" strokeWidth="2"/>
      <text x="100" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16A34A">What Beginners Think About</text>
      
      <g transform="translate(30, 45)">
        <circle cx="20" cy="20" r="15" fill="#16A34A"/>
        <text x="20" y="25" textAnchor="middle" fontSize="10" fill="white">📈</text>
        <text x="55" y="25" fontSize="9" fill="#16A34A">Profits going up</text>
      </g>
      <g transform="translate(30, 80)">
        <circle cx="20" cy="20" r="15" fill="#16A34A"/>
        <text x="20" y="25" textAnchor="middle" fontSize="10" fill="white">💰</text>
        <text x="55" y="25" fontSize="9" fill="#16A34A">Account balance</text>
      </g>
      
      {/* VS */}
      <text x="250" y="75" textAnchor="middle" fontSize="14" fontWeight="700" fill="#717680">vs</text>
      
      {/* What they ignore */}
      <rect x="300" y="0" width="200" height="130" fill="#FDF1F1" rx="10" stroke="#F09B9B" strokeWidth="2"/>
      <text x="400" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">What Gets Ignored</text>
      
      <g transform="translate(330, 45)">
        <circle cx="20" cy="20" r="15" fill="#E04848"/>
        <text x="20" y="25" textAnchor="middle" fontSize="10" fill="white">📋</text>
        <text x="55" y="25" fontSize="9" fill="#842428">Tax obligations</text>
      </g>
      <g transform="translate(330, 80)">
        <circle cx="20" cy="20" r="15" fill="#E04848"/>
        <text x="20" y="25" textAnchor="middle" fontSize="10" fill="white">📅</text>
        <text x="55" y="25" fontSize="9" fill="#842428">Future tax bills</text>
      </g>
    </g>
    
    {/* Warning */}
    <rect x="100" y="225" width="500" height="40" fill="#FDF1F1" rx="8" stroke="#F09B9B" strokeWidth="1"/>
    <text x="350" y="250" textAnchor="middle" fontSize="10" fill="#C7363B">
      ⚠️ Ignoring taxes doesn't make them go away — it just delays the surprise.
    </text>
  </svg>
);

// SVG 3: Mistake 2 - Selling Without Thinking
const Mistake2SVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="600" fill="#C7363B">Mistake #2: Selling Without Considering Timing</text>
    <text x="350" y="52" textAnchor="middle" fontSize="11" fill="#717680">Making sell decisions based only on price</text>
    
    {/* Timeline showing two scenarios */}
    <g transform="translate(50, 80)">
      {/* Scenario A: Hasty sell */}
      <rect x="0" y="0" width="280" height="140" fill="#FDF1F1" rx="10" stroke="#F09B9B" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">Hasty Decision</text>
      
      {/* Timeline */}
      <line x1="30" y1="70" x2="250" y2="70" stroke="#CFD0D3" strokeWidth="2"/>
      <circle cx="60" cy="70" r="8" fill="#5A77AA"/>
      <text x="60" y="90" textAnchor="middle" fontSize="7" fill="#717680">Buy</text>
      
      <circle cx="140" cy="70" r="8" fill="#E04848"/>
      <text x="140" y="55" textAnchor="middle" fontSize="7" fill="#C7363B">Sell (11 months)</text>
      <text x="140" y="90" textAnchor="middle" fontSize="7" fill="#C7363B">"Price is up!"</text>
      
      <text x="140" y="120" textAnchor="middle" fontSize="8" fill="#842428">Result: May face higher taxes</text>
      <text x="140" y="133" textAnchor="middle" fontSize="7" fill="#842428">(short-term holding)</text>
      
      {/* Scenario B: Patient approach */}
      <rect x="320" y="0" width="280" height="140" fill="#F0FDF4" rx="10" stroke="#16A34A" strokeWidth="2"/>
      <text x="460" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">Considered Decision</text>
      
      {/* Timeline */}
      <line x1="350" y1="70" x2="570" y2="70" stroke="#CFD0D3" strokeWidth="2"/>
      <circle cx="380" cy="70" r="8" fill="#5A77AA"/>
      <text x="380" y="90" textAnchor="middle" fontSize="7" fill="#717680">Buy</text>
      
      <circle cx="520" cy="70" r="8" fill="#16A34A"/>
      <text x="520" y="55" textAnchor="middle" fontSize="7" fill="#16A34A">Sell (13+ months)</text>
      <text x="520" y="90" textAnchor="middle" fontSize="7" fill="#16A34A">Aware of timing</text>
      
      <text x="460" y="120" textAnchor="middle" fontSize="8" fill="#16A34A">Result: May qualify for different treatment</text>
      <text x="460" y="133" textAnchor="middle" fontSize="7" fill="#16A34A">(long-term holding)</text>
    </g>
    
    {/* Key point */}
    <rect x="100" y="240" width="500" height="45" fill="#F6ECCE" rx="8" stroke="#E2C273" strokeWidth="1"/>
    <text x="350" y="258" textAnchor="middle" fontSize="9" fill="#654B26">💡 This doesn't mean you should always wait — just that timing has tax implications.</text>
    <text x="350" y="273" textAnchor="middle" fontSize="9" fill="#654B26">Being aware helps you make informed decisions.</text>
  </svg>
);

// SVG 4: Mistake 3 - Misunderstanding Gains
const Mistake3SVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="600" fill="#C7363B">Mistake #3: Misunderstanding What Gets Taxed</text>
    <text x="350" y="52" textAnchor="middle" fontSize="11" fill="#717680">Confusion about realized vs unrealized gains</text>
    
    {/* Two scenarios */}
    <g transform="translate(50, 75)">
      {/* Unrealized */}
      <rect x="0" y="0" width="280" height="150" fill="#E0E7F1" rx="10" stroke="#9FB3D3" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2C3F5E">Unrealized Gain</text>
      <text x="140" y="42" textAnchor="middle" fontSize="8" fill="#5A77AA">(Still holding the investment)</text>
      
      {/* Visual */}
      <rect x="30" y="55" width="80" height="70" fill="#F1F4F9" rx="6" stroke="#5A77AA" strokeWidth="1"/>
      <text x="70" y="80" textAnchor="middle" fontSize="20">📊</text>
      <text x="70" y="105" textAnchor="middle" fontSize="7" fill="#2C3F5E">Value went up</text>
      <text x="70" y="118" textAnchor="middle" fontSize="7" fill="#2C3F5E">on screen</text>
      
      <text x="170" y="80" fontSize="9" fill="#2C3F5E">• Paper profit only</text>
      <text x="170" y="95" fontSize="9" fill="#2C3F5E">• Not yet sold</text>
      <text x="170" y="110" fontSize="9" fill="#16A34A" fontWeight="600">• Generally not taxed yet</text>
      
      {/* Realized */}
      <rect x="320" y="0" width="280" height="150" fill="#F6ECCE" rx="10" stroke="#E2C273" strokeWidth="2"/>
      <text x="460" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#7C5D2B">Realized Gain</text>
      <text x="460" y="42" textAnchor="middle" fontSize="8" fill="#9A7634">(Sold the investment)</text>
      
      {/* Visual */}
      <rect x="350" y="55" width="80" height="70" fill="#FBF7EC" rx="6" stroke="#B8923F" strokeWidth="1"/>
      <text x="390" y="80" textAnchor="middle" fontSize="20">💵</text>
      <text x="390" y="105" textAnchor="middle" fontSize="7" fill="#7C5D2B">Profit turned</text>
      <text x="390" y="118" textAnchor="middle" fontSize="7" fill="#7C5D2B">into cash</text>
      
      <text x="490" y="80" fontSize="9" fill="#7C5D2B">• Actual cash received</text>
      <text x="490" y="95" fontSize="9" fill="#7C5D2B">• Investment sold</text>
      <text x="490" y="110" fontSize="9" fill="#C7363B" fontWeight="600">• Typically taxable</text>
    </g>
    
    {/* Common confusion */}
    <rect x="100" y="245" width="500" height="40" fill="#FDF1F1" rx="8" stroke="#F09B9B" strokeWidth="1"/>
    <text x="350" y="265" textAnchor="middle" fontSize="9" fill="#C7363B">
      ⚠️ Common confusion: Thinking you owe taxes just because your portfolio value increased.
    </text>
    <text x="350" y="278" textAnchor="middle" fontSize="8" fill="#842428">
      Generally, taxes apply when you sell — not while you hold.
    </text>
  </svg>
);

// SVG 5: Small Mistakes Compound
const SmallMistakesCompoundSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="600" fill="#2C3F5E">Small Mistakes Add Up Over Time</text>
    <text x="350" y="52" textAnchor="middle" fontSize="11" fill="#717680">Why awareness matters for long-term wealth</text>
    
    {/* Compounding visual */}
    <g transform="translate(80, 70)">
      {/* Year labels */}
      <text x="70" y="170" textAnchor="middle" fontSize="8" fill="#717680">Year 1</text>
      <text x="180" y="170" textAnchor="middle" fontSize="8" fill="#717680">Year 5</text>
      <text x="290" y="170" textAnchor="middle" fontSize="8" fill="#717680">Year 10</text>
      <text x="400" y="170" textAnchor="middle" fontSize="8" fill="#717680">Year 20</text>
      <text x="510" y="170" textAnchor="middle" fontSize="8" fill="#717680">Year 30</text>
      
      {/* Small leak visual - growing drops */}
      <circle cx="70" cy="130" r="8" fill="#E04848" opacity="0.6"/>
      <circle cx="180" cy="110" r="15" fill="#E04848" opacity="0.6"/>
      <circle cx="290" cy="85" r="25" fill="#E04848" opacity="0.6"/>
      <circle cx="400" cy="55" r="40" fill="#E04848" opacity="0.6"/>
      <circle cx="510" cy="20" r="55" fill="#E04848" opacity="0.5"/>
      
      {/* Labels on drops */}
      <text x="70" y="134" textAnchor="middle" fontSize="6" fill="white">Small</text>
      <text x="180" y="114" textAnchor="middle" fontSize="7" fill="white">Growing</text>
      <text x="290" y="89" textAnchor="middle" fontSize="8" fill="white">Larger</text>
      <text x="400" y="59" textAnchor="middle" fontSize="9" fill="white">Significant</text>
      <text x="510" y="24" textAnchor="middle" fontSize="10" fill="white">Substantial</text>
    </g>
    
    {/* Explanation */}
    <rect x="100" y="210" width="500" height="55" fill="#2A2A2C" rx="10"/>
    <text x="350" y="230" textAnchor="middle" fontSize="10" fill="#A0A3AA">The Impact:</text>
    <text x="350" y="248" textAnchor="middle" fontSize="10" fill="white">
      Repeated small tax inefficiencies, compounded over decades,
    </text>
    <text x="350" y="262" textAnchor="middle" fontSize="10" fill="white">
      can meaningfully reduce your final wealth.
    </text>
  </svg>
);

// SVG 6: Global Example - Jordan's Story
const GlobalExampleSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#2C3F5E">Example: Jordan's Tax Surprise</text>
    <text x="350" y="48" textAnchor="middle" fontSize="11" fill="#717680">A common scenario many beginners experience</text>
    
    {/* Character */}
    <g transform="translate(80, 80)">
      <circle cx="40" cy="30" r="25" fill="#E0E7F1" stroke="#5A77AA" strokeWidth="2"/>
      <text x="40" y="35" textAnchor="middle" fontSize="20">👤</text>
      <text x="40" y="75" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2C3F5E">Jordan</text>
      <text x="40" y="90" textAnchor="middle" fontSize="8" fill="#717680">New Investor</text>
    </g>
    
    {/* Story timeline */}
    <g transform="translate(160, 70)">
      {/* Step 1 */}
      <rect x="0" y="0" width="150" height="85" fill="#F0FDF4" rx="8" stroke="#16A34A" strokeWidth="1"/>
      <text x="75" y="20" textAnchor="middle" fontSize="9" fontWeight="600" fill="#16A34A">January</text>
      <text x="75" y="38" textAnchor="middle" fontSize="8" fill="#16A34A">Buys stocks for</text>
      <text x="75" y="55" textAnchor="middle" fontSize="14" fontWeight="700" fill="#16A34A">$5,000</text>
      <text x="75" y="75" textAnchor="middle" fontSize="7" fill="#16A34A">Excited to start investing</text>
      
      {/* Arrow */}
      <line x1="160" y1="42" x2="185" y2="42" stroke="#A0A3AA" strokeWidth="2"/>
      <polygon points="183,37 195,42 183,47" fill="#A0A3AA"/>
      
      {/* Step 2 */}
      <rect x="200" y="0" width="150" height="85" fill="#F6ECCE" rx="8" stroke="#E2C273" strokeWidth="1"/>
      <text x="275" y="20" textAnchor="middle" fontSize="9" fontWeight="600" fill="#7C5D2B">November</text>
      <text x="275" y="38" textAnchor="middle" fontSize="8" fill="#654B26">Sells at profit</text>
      <text x="275" y="55" textAnchor="middle" fontSize="14" fontWeight="700" fill="#7C5D2B">$7,000</text>
      <text x="275" y="75" textAnchor="middle" fontSize="7" fill="#654B26">Happy about $2,000 gain!</text>
      
      {/* Arrow */}
      <line x1="360" y1="42" x2="385" y2="42" stroke="#A0A3AA" strokeWidth="2"/>
      <polygon points="383,37 395,42 383,47" fill="#A0A3AA"/>
    </g>
    
    {/* The surprise */}
    <g transform="translate(160, 170)">
      <rect x="200" y="0" width="230" height="100" fill="#FDF1F1" rx="10" stroke="#E04848" strokeWidth="2"/>
      <text x="315" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">Tax Season Arrives</text>
      <text x="315" y="50" textAnchor="middle" fontSize="9" fill="#842428">Jordan realizes:</text>
      <text x="315" y="68" textAnchor="middle" fontSize="8" fill="#842428">• Owes taxes on the $2,000 gain</text>
      <text x="315" y="82" textAnchor="middle" fontSize="8" fill="#842428">• Held for only 10 months (short-term)</text>
      <text x="315" y="96" textAnchor="middle" fontSize="8" fill="#842428">• Didn't set aside money for taxes</text>
      
      {/* Surprised face */}
      <circle cx="100" cy="50" r="35" fill="#FBE1E1" stroke="#E04848" strokeWidth="2"/>
      <text x="100" y="60" textAnchor="middle" fontSize="30">😮</text>
    </g>
    
    {/* Lesson */}
    <rect x="100" y="285" width="500" height="40" fill="#E0E7F1" rx="8" stroke="#5A77AA" strokeWidth="1"/>
    <text x="350" y="302" textAnchor="middle" fontSize="9" fill="#2C3F5E">
      💡 Jordan's mistake wasn't investing — it was not being aware that selling creates a tax event.
    </text>
    <text x="350" y="316" textAnchor="middle" fontSize="9" fill="#2C3F5E">
      Simple awareness would have helped Jordan plan better.
    </text>
  </svg>
);

// SVG 7: Three Mistakes Summary
const ThreeMistakesSummarySVG = () => (
  <svg viewBox="0 0 700 220" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="220" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#2C3F5E">Three Common Mistakes to Be Aware Of</text>
    
    {/* Three cards */}
    <g transform="translate(50, 50)">
      {/* Mistake 1 */}
      <rect x="0" y="0" width="190" height="120" fill="#FDF1F1" rx="10" stroke="#F09B9B" strokeWidth="2"/>
      <circle cx="95" cy="35" r="20" fill="#FBE1E1" stroke="#E04848" strokeWidth="2"/>
      <text x="95" y="42" textAnchor="middle" fontSize="16" fontWeight="700" fill="#C7363B">1</text>
      <text x="95" y="70" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">Ignoring Taxes</text>
      <text x="95" y="88" textAnchor="middle" fontSize="8" fill="#842428">"I'll think about</text>
      <text x="95" y="100" textAnchor="middle" fontSize="8" fill="#842428">taxes later"</text>
      
      {/* Mistake 2 */}
      <rect x="205" y="0" width="190" height="120" fill="#F6ECCE" rx="10" stroke="#E2C273" strokeWidth="2"/>
      <circle cx="300" cy="35" r="20" fill="#F6ECCE" stroke="#B8923F" strokeWidth="2"/>
      <text x="300" y="42" textAnchor="middle" fontSize="16" fontWeight="700" fill="#7C5D2B">2</text>
      <text x="300" y="70" textAnchor="middle" fontSize="10" fontWeight="600" fill="#7C5D2B">Selling Hastily</text>
      <text x="300" y="88" textAnchor="middle" fontSize="8" fill="#654B26">Without considering</text>
      <text x="300" y="100" textAnchor="middle" fontSize="8" fill="#654B26">timing implications</text>
      
      {/* Mistake 3 */}
      <rect x="410" y="0" width="190" height="120" fill="#E0E7F1" rx="10" stroke="#9FB3D3" strokeWidth="2"/>
      <circle cx="505" cy="35" r="20" fill="#F1F4F9" stroke="#5A77AA" strokeWidth="2"/>
      <text x="505" y="42" textAnchor="middle" fontSize="16" fontWeight="700" fill="#2C3F5E">3</text>
      <text x="505" y="70" textAnchor="middle" fontSize="10" fontWeight="600" fill="#2C3F5E">Misunderstanding</text>
      <text x="505" y="88" textAnchor="middle" fontSize="8" fill="#2C3F5E">Confusing unrealized</text>
      <text x="505" y="100" textAnchor="middle" fontSize="8" fill="#2C3F5E">with realized gains</text>
    </g>
    
    {/* Bottom note */}
    <rect x="150" y="180" width="400" height="28" fill="#F0FDF4" rx="6"/>
    <text x="350" y="199" textAnchor="middle" fontSize="9" fill="#16A34A">
      ✓ Awareness of these mistakes is the first step to avoiding them.
    </text>
  </svg>
);

// SVG 8: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 200" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="200" fill="#F5F5F7" rx="16"/>
    
    {/* Central message */}
    <rect x="50" y="25" width="600" height="150" fill="url(#mistakesGradient)" rx="16"/>
    
    <defs>
      <linearGradient id="mistakesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2C3F5E"/>
        <stop offset="100%" stopColor="#5A77AA"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="60" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">🔑 Key Takeaway</text>
    
    <text x="350" y="90" textAnchor="middle" fontSize="11" fill="white">Tax mistakes happen when taxes are invisible to us.</text>
    <text x="350" y="110" textAnchor="middle" fontSize="11" fill="white">You don't need to become a tax expert — just aware.</text>
    <text x="350" y="145" textAnchor="middle" fontSize="14" fontWeight="700" fill="#F6ECCE">AWARENESS PREVENTS SURPRISES.</text>
  </svg>
);

// SVG 9: India Note
const IndiaNoteSVG = () => (
  <svg viewBox="0 0 700 140" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="140" fill="#FCF3EE" rx="16" stroke="#F0C2A9" strokeWidth="1"/>
    
    {/* Flag colors accent */}
    <rect x="0" y="0" width="8" height="140" fill="#D2754C" rx="4"/>
    <rect x="8" y="0" width="4" height="140" fill="white"/>
    <rect x="12" y="0" width="8" height="140" fill="#16A34A"/>
    
    {/* Content */}
    <text x="350" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fill="#9C4D2E">🇮🇳 India-Specific Note</text>
    
    <text x="350" y="55" textAnchor="middle" fontSize="10" fill="#7D3F28">
      Indian investors face these same common mistakes.
    </text>
    <text x="350" y="75" textAnchor="middle" fontSize="10" fill="#7D3F28">
      Additionally, many beginners are unaware of advance tax requirements for investment income
    </text>
    <text x="350" y="95" textAnchor="middle" fontSize="10" fill="#7D3F28">
      or the distinction between different asset class treatments.
    </text>
    <text x="350" y="120" textAnchor="middle" fontSize="8" fill="#9C4D2E" fontStyle="italic">
      This is for awareness only — consult a tax professional for guidance on Indian tax laws.
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
      This lesson provides awareness about common tax mistakes.
    </text>
    <text x="370" y="72" textAnchor="middle" fontSize="9" fill="#842428">
      It is not tax advice or financial advice. Always consult qualified professionals for your situation.
    </text>
  </svg>
);

const TaxLesson6 = () => {
  const navigate = useNavigate();

  const quizQuestions = [
    {
      question: "Why do beginners often overlook taxes when investing?",
      options: [
        "Because taxes don't apply to investments",
        "Because taxes are invisible on price charts and the impact is delayed until later",
        "Because brokers automatically handle all taxes",
        "Because small investors are exempt from taxes"
      ],
      correctAnswer: "Because taxes are invisible on price charts and the impact is delayed until later",
      explanation: "Taxes don't appear on your trading screen or charts, and the tax bill comes later — not at the moment of the transaction. This makes it easy to forget about them."
    },
    {
      question: "What is the difference between a realized and unrealized gain?",
      options: [
        "There is no difference",
        "Realized gains are from stocks; unrealized gains are from bonds",
        "An unrealized gain is profit on paper while still holding; a realized gain is profit after selling",
        "Unrealized gains are taxed more than realized gains"
      ],
      correctAnswer: "An unrealized gain is profit on paper while still holding; a realized gain is profit after selling",
      explanation: "An unrealized gain means your investment has increased in value but you haven't sold yet. A realized gain occurs when you sell and turn that paper profit into actual cash — which typically triggers a tax event."
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
              Lesson 6 of 6
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mt-4 tracking-[-0.025em]">Common Tax Mistakes Beginners Make</h1>
            <p className="text-gray-600 mt-2">Awareness of pitfalls helps you avoid them</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.025em]">Why Tax Mistakes Happen</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              When you start investing, taxes are probably the last thing on your mind. You're 
              focused on picking investments, watching prices, and hopefully seeing your money 
              grow. <strong>Taxes feel distant and abstract</strong>.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              But this is exactly why mistakes happen. Taxes don't appear on your trading screen. 
              They don't flash warnings when you make decisions. The bill comes later — sometimes 
              much later — catching many beginners by surprise.
            </p>
            <p className="text-lg leading-relaxed">
              The goal of this lesson isn't to make you afraid of taxes. It's to make you 
              <strong> aware</strong> of common mistakes so you can recognize them before they 
              become problems. Awareness is prevention.
            </p>
          </div>

          <WhyMistakesHappenSVG />
        </div>

        {/* Mistake 1 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Mistake #1: Ignoring Taxes Completely</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              The most common mistake is simply <strong>not thinking about taxes at all</strong>. 
              Many beginners get so focused on returns that taxes become invisible.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              This often sounds like: "I'll figure out taxes when I need to" or "That's a problem 
              for future me." But taxes don't disappear just because we ignore them. They quietly 
              accumulate in the background.
            </p>
            <p className="text-lg leading-relaxed">
              The issue isn't that beginners choose to ignore taxes — it's that taxes simply don't 
              occur to them. When your brokerage app shows a profit, it doesn't show the after-tax 
              profit. This creates a blind spot.
            </p>
          </div>

          <Mistake1SVG />
        </div>

        {/* Mistake 2 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Mistake #2: Selling Without Considering Timing</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Another common mistake is making sell decisions based <strong>only on price</strong>, 
              without any awareness of how long you've held the investment.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              As we learned in earlier lessons, many tax systems treat short-term and long-term 
              holdings differently. Selling at 11 months versus 13 months might mean the same 
              profit but different tax treatment.
            </p>
            <p className="text-lg leading-relaxed">
              This doesn't mean you should <strong>always</strong> wait to sell — sometimes selling 
              quickly is the right choice for other reasons. But being <strong>aware</strong> that 
              timing has tax implications helps you make informed decisions rather than accidental ones.
            </p>
          </div>

          <Mistake2SVG />
        </div>

        {/* Mistake 3 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Mistake #3: Misunderstanding What Gets Taxed</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Many beginners confuse <strong>unrealized gains</strong> (paper profits) with 
              <strong> realized gains</strong> (actual profits from selling).
            </p>
            <p className="text-lg leading-relaxed mb-4">
              If your $1,000 investment grows to $1,500 but you haven't sold, that $500 increase 
              is an unrealized gain — it exists on paper but not in your bank account. Generally, 
              you don't owe taxes on unrealized gains.
            </p>
            <p className="text-lg leading-relaxed">
              Taxes typically apply when you <strong>realize</strong> the gain by selling. Some 
              beginners panic thinking they owe taxes just because their portfolio value increased, 
              while others are surprised when they sell and discover they've created a taxable event.
            </p>
          </div>

          <Mistake3SVG />
        </div>

        {/* Small Mistakes Compound */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Why Small Mistakes Matter Over Time</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              You might think: "These mistakes don't seem that serious." And in any single year, 
              they might not be. But investing is a long-term activity, and <strong>small 
              inefficiencies compound</strong>.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Just like how small returns compound into significant wealth over time, small tax 
              mistakes can compound into significant lost wealth over decades. A little awareness 
              early in your investing journey can make a meaningful difference later.
            </p>
            <p className="text-lg leading-relaxed">
              This isn't meant to create anxiety — it's meant to create awareness. You don't need 
              perfect tax optimization. You just need to know that taxes exist and matter.
            </p>
          </div>

          <SmallMistakesCompoundSVG />
        </div>

        {/* Global Example */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Example: Jordan's Tax Surprise</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              <strong>Jordan</strong> is a new investor who bought $5,000 worth of stocks in 
              January. By November, the investment had grown to $7,000 — a $2,000 profit. 
              Excited by the gains, Jordan sold everything.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Jordan celebrated the $2,000 profit and spent some of it on a nice vacation. Then 
              tax season arrived. Jordan discovered several things:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-lg">
              <li>The $2,000 gain was taxable income</li>
              <li>Holding for only 10 months meant short-term treatment</li>
              <li>No money had been set aside for the tax bill</li>
            </ul>
            <p className="text-lg leading-relaxed">
              Jordan's mistake wasn't investing or even selling — it was simply not being aware 
              that selling creates a tax event that requires planning.
            </p>
          </div>

          <GlobalExampleSVG />
        </div>

        {/* Summary Visual */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <ThreeMistakesSummarySVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
          
          <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-200">
            <p className="text-blue-800 font-medium">
              Remember: The goal isn't to become a tax expert or to obsess over every decision. 
              It's simply to have taxes on your radar. When taxes are visible to you — even 
              faintly — you naturally make more thoughtful decisions.
            </p>
          </div>
        </div>

        {/* India Note */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">🌍 Global Context with India Note</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              These three mistakes — ignoring taxes, selling without timing awareness, and 
              misunderstanding what gets taxed — happen to investors worldwide. The specific 
              tax rules differ by country, but the human tendency to overlook taxes is universal.
            </p>
          </div>

          <IndiaNoteSVG />
        </div>

        {/* Quiz Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">📝 Knowledge Check</h2>
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
                  Consider your own awareness level:
                </p>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-blue-900 font-medium">
                    Before this module, which of the three mistakes would you have been most 
                    likely to make? Has your awareness changed now that you've completed 
                    this course?
                  </p>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 text-sm">
                    <strong>Note:</strong> Being honest about where you started helps you 
                    appreciate the value of awareness. Most people begin investing with 
                    zero tax awareness — and that's okay. What matters is learning.
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

        {/* Module Complete */}
        <div className="rounded-2xl p-8 shadow-lg mb-8 text-white bg-brand-fill">
          <h3 className="text-xl font-semibold mb-4">🎉 Module Complete!</h3>
          <p className="text-lg mb-4">
            Congratulations! You've completed the Tax Basics module. You now have foundational 
            awareness of:
          </p>
          <ul className="space-y-2 text-lg mb-6">
            <li>• What taxes are and why governments collect them</li>
            <li>• The difference between income and investment taxes</li>
            <li>• What capital gains mean</li>
            <li>• How holding period affects tax treatment</li>
            <li>• The concept of tax efficiency</li>
            <li>• Common mistakes beginners make</li>
          </ul>
          <p className="text-blue-100">
            Remember: This awareness is just the beginning. For specific tax situations, 
            always consult qualified professionals.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/tax-lesson-5')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-colors"
          >
            <FaArrowLeft />
            <span>Previous Lesson</span>
          </button>
          <button
            onClick={() => navigate('/learn/taxes')}
            className="flex items-center gap-2 bg-brand-fill hover:bg-brand-hover text-white px-6 py-3 rounded-xl transition-colors"
          >
            <span>Back to Module</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default TaxLesson6;
