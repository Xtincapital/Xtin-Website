import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';

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
                : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
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

// SVG 1: Why Mistakes Happen
const WhyMistakesHappenSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="600" fill="#1e40af">Why Do Tax Mistakes Happen?</text>
    <text x="350" y="52" textAnchor="middle" fontSize="11" fill="#64748b">Common reasons beginners overlook taxes</text>
    
    {/* Four reasons */}
    <g transform="translate(50, 80)">
      {/* Reason 1 */}
      <rect x="0" y="0" width="140" height="110" fill="#fef2f2" rx="10" stroke="#fca5a5" strokeWidth="1"/>
      <circle cx="70" cy="35" r="20" fill="#fee2e2" stroke="#ef4444" strokeWidth="2"/>
      <text x="70" y="40" textAnchor="middle" fontSize="18">🙈</text>
      <text x="70" y="70" textAnchor="middle" fontSize="9" fontWeight="600" fill="#dc2626">Not Visible</text>
      <text x="70" y="85" textAnchor="middle" fontSize="7" fill="#991b1b">Taxes don't show</text>
      <text x="70" y="97" textAnchor="middle" fontSize="7" fill="#991b1b">on price charts</text>
      
      {/* Reason 2 */}
      <rect x="155" y="0" width="140" height="110" fill="#fef3c7" rx="10" stroke="#fcd34d" strokeWidth="1"/>
      <circle cx="225" cy="35" r="20" fill="#fef9c3" stroke="#f59e0b" strokeWidth="2"/>
      <text x="225" y="40" textAnchor="middle" fontSize="18">⏰</text>
      <text x="225" y="70" textAnchor="middle" fontSize="9" fontWeight="600" fill="#b45309">Delayed Impact</text>
      <text x="225" y="85" textAnchor="middle" fontSize="7" fill="#92400e">Tax bills come</text>
      <text x="225" y="97" textAnchor="middle" fontSize="7" fill="#92400e">later, not now</text>
      
      {/* Reason 3 */}
      <rect x="310" y="0" width="140" height="110" fill="#dbeafe" rx="10" stroke="#93c5fd" strokeWidth="1"/>
      <circle cx="380" cy="35" r="20" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2"/>
      <text x="380" y="40" textAnchor="middle" fontSize="18">📚</text>
      <text x="380" y="70" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1e40af">Complex Rules</text>
      <text x="380" y="85" textAnchor="middle" fontSize="7" fill="#1e40af">Tax laws are</text>
      <text x="380" y="97" textAnchor="middle" fontSize="7" fill="#1e40af">hard to follow</text>
      
      {/* Reason 4 */}
      <rect x="465" y="0" width="140" height="110" fill="#fce7f3" rx="10" stroke="#f9a8d4" strokeWidth="1"/>
      <circle cx="535" cy="35" r="20" fill="#fdf2f8" stroke="#ec4899" strokeWidth="2"/>
      <text x="535" y="40" textAnchor="middle" fontSize="18">🎯</text>
      <text x="535" y="70" textAnchor="middle" fontSize="9" fontWeight="600" fill="#be185d">Focus on Gains</text>
      <text x="535" y="85" textAnchor="middle" fontSize="7" fill="#9d174d">Excitement about</text>
      <text x="535" y="97" textAnchor="middle" fontSize="7" fill="#9d174d">profits distracts</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="210" width="500" height="55" fill="#1e40af" rx="10"/>
    <text x="350" y="232" textAnchor="middle" fontSize="10" fill="#93c5fd">The Result:</text>
    <text x="350" y="250" textAnchor="middle" fontSize="11" fill="white" fontWeight="500">
      Taxes become an afterthought — until they become a problem.
    </text>
  </svg>
);

// SVG 2: Mistake 1 - Ignoring Taxes Completely
const Mistake1SVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="600" fill="#dc2626">Mistake #1: Ignoring Taxes Completely</text>
    <text x="350" y="52" textAnchor="middle" fontSize="11" fill="#64748b">"I'll deal with taxes later" mentality</text>
    
    {/* Visual representation */}
    <g transform="translate(100, 80)">
      {/* Investor thinking only about returns */}
      <rect x="0" y="0" width="200" height="130" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="2"/>
      <text x="100" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">What Beginners Think About</text>
      
      <g transform="translate(30, 45)">
        <circle cx="20" cy="20" r="15" fill="#22c55e"/>
        <text x="20" y="25" textAnchor="middle" fontSize="10" fill="white">📈</text>
        <text x="55" y="25" fontSize="9" fill="#166534">Profits going up</text>
      </g>
      <g transform="translate(30, 80)">
        <circle cx="20" cy="20" r="15" fill="#22c55e"/>
        <text x="20" y="25" textAnchor="middle" fontSize="10" fill="white">💰</text>
        <text x="55" y="25" fontSize="9" fill="#166534">Account balance</text>
      </g>
      
      {/* VS */}
      <text x="250" y="75" textAnchor="middle" fontSize="14" fontWeight="700" fill="#64748b">vs</text>
      
      {/* What they ignore */}
      <rect x="300" y="0" width="200" height="130" fill="#fef2f2" rx="10" stroke="#fca5a5" strokeWidth="2"/>
      <text x="400" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">What Gets Ignored</text>
      
      <g transform="translate(330, 45)">
        <circle cx="20" cy="20" r="15" fill="#ef4444"/>
        <text x="20" y="25" textAnchor="middle" fontSize="10" fill="white">📋</text>
        <text x="55" y="25" fontSize="9" fill="#991b1b">Tax obligations</text>
      </g>
      <g transform="translate(330, 80)">
        <circle cx="20" cy="20" r="15" fill="#ef4444"/>
        <text x="20" y="25" textAnchor="middle" fontSize="10" fill="white">📅</text>
        <text x="55" y="25" fontSize="9" fill="#991b1b">Future tax bills</text>
      </g>
    </g>
    
    {/* Warning */}
    <rect x="100" y="225" width="500" height="40" fill="#fef2f2" rx="8" stroke="#fca5a5" strokeWidth="1"/>
    <text x="350" y="250" textAnchor="middle" fontSize="10" fill="#dc2626">
      ⚠️ Ignoring taxes doesn't make them go away — it just delays the surprise.
    </text>
  </svg>
);

// SVG 3: Mistake 2 - Selling Without Thinking
const Mistake2SVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="600" fill="#dc2626">Mistake #2: Selling Without Considering Timing</text>
    <text x="350" y="52" textAnchor="middle" fontSize="11" fill="#64748b">Making sell decisions based only on price</text>
    
    {/* Timeline showing two scenarios */}
    <g transform="translate(50, 80)">
      {/* Scenario A: Hasty sell */}
      <rect x="0" y="0" width="280" height="140" fill="#fef2f2" rx="10" stroke="#fca5a5" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">Hasty Decision</text>
      
      {/* Timeline */}
      <line x1="30" y1="70" x2="250" y2="70" stroke="#cbd5e1" strokeWidth="2"/>
      <circle cx="60" cy="70" r="8" fill="#3b82f6"/>
      <text x="60" y="90" textAnchor="middle" fontSize="7" fill="#64748b">Buy</text>
      
      <circle cx="140" cy="70" r="8" fill="#ef4444"/>
      <text x="140" y="55" textAnchor="middle" fontSize="7" fill="#dc2626">Sell (11 months)</text>
      <text x="140" y="90" textAnchor="middle" fontSize="7" fill="#dc2626">"Price is up!"</text>
      
      <text x="140" y="120" textAnchor="middle" fontSize="8" fill="#991b1b">Result: May face higher taxes</text>
      <text x="140" y="133" textAnchor="middle" fontSize="7" fill="#991b1b">(short-term holding)</text>
      
      {/* Scenario B: Patient approach */}
      <rect x="320" y="0" width="280" height="140" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="2"/>
      <text x="460" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#059669">Considered Decision</text>
      
      {/* Timeline */}
      <line x1="350" y1="70" x2="570" y2="70" stroke="#cbd5e1" strokeWidth="2"/>
      <circle cx="380" cy="70" r="8" fill="#3b82f6"/>
      <text x="380" y="90" textAnchor="middle" fontSize="7" fill="#64748b">Buy</text>
      
      <circle cx="520" cy="70" r="8" fill="#10b981"/>
      <text x="520" y="55" textAnchor="middle" fontSize="7" fill="#059669">Sell (13+ months)</text>
      <text x="520" y="90" textAnchor="middle" fontSize="7" fill="#059669">Aware of timing</text>
      
      <text x="460" y="120" textAnchor="middle" fontSize="8" fill="#166534">Result: May qualify for different treatment</text>
      <text x="460" y="133" textAnchor="middle" fontSize="7" fill="#166534">(long-term holding)</text>
    </g>
    
    {/* Key point */}
    <rect x="100" y="240" width="500" height="45" fill="#fef3c7" rx="8" stroke="#fcd34d" strokeWidth="1"/>
    <text x="350" y="258" textAnchor="middle" fontSize="9" fill="#92400e">💡 This doesn't mean you should always wait — just that timing has tax implications.</text>
    <text x="350" y="273" textAnchor="middle" fontSize="9" fill="#92400e">Being aware helps you make informed decisions.</text>
  </svg>
);

// SVG 4: Mistake 3 - Misunderstanding Gains
const Mistake3SVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="600" fill="#dc2626">Mistake #3: Misunderstanding What Gets Taxed</text>
    <text x="350" y="52" textAnchor="middle" fontSize="11" fill="#64748b">Confusion about realized vs unrealized gains</text>
    
    {/* Two scenarios */}
    <g transform="translate(50, 75)">
      {/* Unrealized */}
      <rect x="0" y="0" width="280" height="150" fill="#dbeafe" rx="10" stroke="#93c5fd" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e40af">Unrealized Gain</text>
      <text x="140" y="42" textAnchor="middle" fontSize="8" fill="#3b82f6">(Still holding the investment)</text>
      
      {/* Visual */}
      <rect x="30" y="55" width="80" height="70" fill="#eff6ff" rx="6" stroke="#3b82f6" strokeWidth="1"/>
      <text x="70" y="80" textAnchor="middle" fontSize="20">📊</text>
      <text x="70" y="105" textAnchor="middle" fontSize="7" fill="#1e40af">Value went up</text>
      <text x="70" y="118" textAnchor="middle" fontSize="7" fill="#1e40af">on screen</text>
      
      <text x="170" y="80" fontSize="9" fill="#1e40af">• Paper profit only</text>
      <text x="170" y="95" fontSize="9" fill="#1e40af">• Not yet sold</text>
      <text x="170" y="110" fontSize="9" fill="#10b981" fontWeight="600">• Generally not taxed yet</text>
      
      {/* Realized */}
      <rect x="320" y="0" width="280" height="150" fill="#fef3c7" rx="10" stroke="#fcd34d" strokeWidth="2"/>
      <text x="460" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#b45309">Realized Gain</text>
      <text x="460" y="42" textAnchor="middle" fontSize="8" fill="#d97706">(Sold the investment)</text>
      
      {/* Visual */}
      <rect x="350" y="55" width="80" height="70" fill="#fefce8" rx="6" stroke="#f59e0b" strokeWidth="1"/>
      <text x="390" y="80" textAnchor="middle" fontSize="20">💵</text>
      <text x="390" y="105" textAnchor="middle" fontSize="7" fill="#b45309">Profit turned</text>
      <text x="390" y="118" textAnchor="middle" fontSize="7" fill="#b45309">into cash</text>
      
      <text x="490" y="80" fontSize="9" fill="#b45309">• Actual cash received</text>
      <text x="490" y="95" fontSize="9" fill="#b45309">• Investment sold</text>
      <text x="490" y="110" fontSize="9" fill="#dc2626" fontWeight="600">• Typically taxable</text>
    </g>
    
    {/* Common confusion */}
    <rect x="100" y="245" width="500" height="40" fill="#fef2f2" rx="8" stroke="#fca5a5" strokeWidth="1"/>
    <text x="350" y="265" textAnchor="middle" fontSize="9" fill="#dc2626">
      ⚠️ Common confusion: Thinking you owe taxes just because your portfolio value increased.
    </text>
    <text x="350" y="278" textAnchor="middle" fontSize="8" fill="#991b1b">
      Generally, taxes apply when you sell — not while you hold.
    </text>
  </svg>
);

// SVG 5: Small Mistakes Compound
const SmallMistakesCompoundSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="600" fill="#1e40af">Small Mistakes Add Up Over Time</text>
    <text x="350" y="52" textAnchor="middle" fontSize="11" fill="#64748b">Why awareness matters for long-term wealth</text>
    
    {/* Compounding visual */}
    <g transform="translate(80, 70)">
      {/* Year labels */}
      <text x="70" y="170" textAnchor="middle" fontSize="8" fill="#64748b">Year 1</text>
      <text x="180" y="170" textAnchor="middle" fontSize="8" fill="#64748b">Year 5</text>
      <text x="290" y="170" textAnchor="middle" fontSize="8" fill="#64748b">Year 10</text>
      <text x="400" y="170" textAnchor="middle" fontSize="8" fill="#64748b">Year 20</text>
      <text x="510" y="170" textAnchor="middle" fontSize="8" fill="#64748b">Year 30</text>
      
      {/* Small leak visual - growing drops */}
      <circle cx="70" cy="130" r="8" fill="#ef4444" opacity="0.6"/>
      <circle cx="180" cy="110" r="15" fill="#ef4444" opacity="0.6"/>
      <circle cx="290" cy="85" r="25" fill="#ef4444" opacity="0.6"/>
      <circle cx="400" cy="55" r="40" fill="#ef4444" opacity="0.6"/>
      <circle cx="510" cy="20" r="55" fill="#ef4444" opacity="0.5"/>
      
      {/* Labels on drops */}
      <text x="70" y="134" textAnchor="middle" fontSize="6" fill="white">Small</text>
      <text x="180" y="114" textAnchor="middle" fontSize="7" fill="white">Growing</text>
      <text x="290" y="89" textAnchor="middle" fontSize="8" fill="white">Larger</text>
      <text x="400" y="59" textAnchor="middle" fontSize="9" fill="white">Significant</text>
      <text x="510" y="24" textAnchor="middle" fontSize="10" fill="white">Substantial</text>
    </g>
    
    {/* Explanation */}
    <rect x="100" y="210" width="500" height="55" fill="#1e293b" rx="10"/>
    <text x="350" y="230" textAnchor="middle" fontSize="10" fill="#94a3b8">The Impact:</text>
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
    <rect x="0" y="0" width="700" height="340" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#1e40af">Example: Jordan's Tax Surprise</text>
    <text x="350" y="48" textAnchor="middle" fontSize="11" fill="#64748b">A common scenario many beginners experience</text>
    
    {/* Character */}
    <g transform="translate(80, 80)">
      <circle cx="40" cy="30" r="25" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
      <text x="40" y="35" textAnchor="middle" fontSize="20">👤</text>
      <text x="40" y="75" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e40af">Jordan</text>
      <text x="40" y="90" textAnchor="middle" fontSize="8" fill="#64748b">New Investor</text>
    </g>
    
    {/* Story timeline */}
    <g transform="translate(160, 70)">
      {/* Step 1 */}
      <rect x="0" y="0" width="150" height="85" fill="#dcfce7" rx="8" stroke="#86efac" strokeWidth="1"/>
      <text x="75" y="20" textAnchor="middle" fontSize="9" fontWeight="600" fill="#059669">January</text>
      <text x="75" y="38" textAnchor="middle" fontSize="8" fill="#166534">Buys stocks for</text>
      <text x="75" y="55" textAnchor="middle" fontSize="14" fontWeight="700" fill="#059669">$5,000</text>
      <text x="75" y="75" textAnchor="middle" fontSize="7" fill="#166534">Excited to start investing</text>
      
      {/* Arrow */}
      <line x1="160" y1="42" x2="185" y2="42" stroke="#94a3b8" strokeWidth="2"/>
      <polygon points="183,37 195,42 183,47" fill="#94a3b8"/>
      
      {/* Step 2 */}
      <rect x="200" y="0" width="150" height="85" fill="#fef3c7" rx="8" stroke="#fcd34d" strokeWidth="1"/>
      <text x="275" y="20" textAnchor="middle" fontSize="9" fontWeight="600" fill="#b45309">November</text>
      <text x="275" y="38" textAnchor="middle" fontSize="8" fill="#92400e">Sells at profit</text>
      <text x="275" y="55" textAnchor="middle" fontSize="14" fontWeight="700" fill="#b45309">$7,000</text>
      <text x="275" y="75" textAnchor="middle" fontSize="7" fill="#92400e">Happy about $2,000 gain!</text>
      
      {/* Arrow */}
      <line x1="360" y1="42" x2="385" y2="42" stroke="#94a3b8" strokeWidth="2"/>
      <polygon points="383,37 395,42 383,47" fill="#94a3b8"/>
    </g>
    
    {/* The surprise */}
    <g transform="translate(160, 170)">
      <rect x="200" y="0" width="230" height="100" fill="#fef2f2" rx="10" stroke="#ef4444" strokeWidth="2"/>
      <text x="315" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">Tax Season Arrives</text>
      <text x="315" y="50" textAnchor="middle" fontSize="9" fill="#991b1b">Jordan realizes:</text>
      <text x="315" y="68" textAnchor="middle" fontSize="8" fill="#991b1b">• Owes taxes on the $2,000 gain</text>
      <text x="315" y="82" textAnchor="middle" fontSize="8" fill="#991b1b">• Held for only 10 months (short-term)</text>
      <text x="315" y="96" textAnchor="middle" fontSize="8" fill="#991b1b">• Didn't set aside money for taxes</text>
      
      {/* Surprised face */}
      <circle cx="100" cy="50" r="35" fill="#fee2e2" stroke="#ef4444" strokeWidth="2"/>
      <text x="100" y="60" textAnchor="middle" fontSize="30">😮</text>
    </g>
    
    {/* Lesson */}
    <rect x="100" y="285" width="500" height="40" fill="#dbeafe" rx="8" stroke="#3b82f6" strokeWidth="1"/>
    <text x="350" y="302" textAnchor="middle" fontSize="9" fill="#1e40af">
      💡 Jordan's mistake wasn't investing — it was not being aware that selling creates a tax event.
    </text>
    <text x="350" y="316" textAnchor="middle" fontSize="9" fill="#1e40af">
      Simple awareness would have helped Jordan plan better.
    </text>
  </svg>
);

// SVG 7: Three Mistakes Summary
const ThreeMistakesSummarySVG = () => (
  <svg viewBox="0 0 700 220" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="220" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#1e40af">Three Common Mistakes to Be Aware Of</text>
    
    {/* Three cards */}
    <g transform="translate(50, 50)">
      {/* Mistake 1 */}
      <rect x="0" y="0" width="190" height="120" fill="#fef2f2" rx="10" stroke="#fca5a5" strokeWidth="2"/>
      <circle cx="95" cy="35" r="20" fill="#fee2e2" stroke="#ef4444" strokeWidth="2"/>
      <text x="95" y="42" textAnchor="middle" fontSize="16" fontWeight="700" fill="#dc2626">1</text>
      <text x="95" y="70" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">Ignoring Taxes</text>
      <text x="95" y="88" textAnchor="middle" fontSize="8" fill="#991b1b">"I'll think about</text>
      <text x="95" y="100" textAnchor="middle" fontSize="8" fill="#991b1b">taxes later"</text>
      
      {/* Mistake 2 */}
      <rect x="205" y="0" width="190" height="120" fill="#fef3c7" rx="10" stroke="#fcd34d" strokeWidth="2"/>
      <circle cx="300" cy="35" r="20" fill="#fef9c3" stroke="#f59e0b" strokeWidth="2"/>
      <text x="300" y="42" textAnchor="middle" fontSize="16" fontWeight="700" fill="#b45309">2</text>
      <text x="300" y="70" textAnchor="middle" fontSize="10" fontWeight="600" fill="#b45309">Selling Hastily</text>
      <text x="300" y="88" textAnchor="middle" fontSize="8" fill="#92400e">Without considering</text>
      <text x="300" y="100" textAnchor="middle" fontSize="8" fill="#92400e">timing implications</text>
      
      {/* Mistake 3 */}
      <rect x="410" y="0" width="190" height="120" fill="#dbeafe" rx="10" stroke="#93c5fd" strokeWidth="2"/>
      <circle cx="505" cy="35" r="20" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2"/>
      <text x="505" y="42" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1e40af">3</text>
      <text x="505" y="70" textAnchor="middle" fontSize="10" fontWeight="600" fill="#1e40af">Misunderstanding</text>
      <text x="505" y="88" textAnchor="middle" fontSize="8" fill="#1e40af">Confusing unrealized</text>
      <text x="505" y="100" textAnchor="middle" fontSize="8" fill="#1e40af">with realized gains</text>
    </g>
    
    {/* Bottom note */}
    <rect x="150" y="180" width="400" height="28" fill="#dcfce7" rx="6"/>
    <text x="350" y="199" textAnchor="middle" fontSize="9" fill="#166534">
      ✓ Awareness of these mistakes is the first step to avoiding them.
    </text>
  </svg>
);

// SVG 8: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 200" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="200" fill="#f8fafc" rx="16"/>
    
    {/* Central message */}
    <rect x="50" y="25" width="600" height="150" fill="url(#mistakesGradient)" rx="16"/>
    
    <defs>
      <linearGradient id="mistakesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e40af"/>
        <stop offset="100%" stopColor="#3b82f6"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="60" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">🔑 Key Takeaway</text>
    
    <text x="350" y="90" textAnchor="middle" fontSize="11" fill="white">Tax mistakes happen when taxes are invisible to us.</text>
    <text x="350" y="110" textAnchor="middle" fontSize="11" fill="white">You don't need to become a tax expert — just aware.</text>
    <text x="350" y="145" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fef3c7">AWARENESS PREVENTS SURPRISES.</text>
  </svg>
);

// SVG 9: India Note
const IndiaNoteSVG = () => (
  <svg viewBox="0 0 700 140" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="140" fill="#fff7ed" rx="16" stroke="#fed7aa" strokeWidth="1"/>
    
    {/* Flag colors accent */}
    <rect x="0" y="0" width="8" height="140" fill="#f97316" rx="4 0 0 4"/>
    <rect x="8" y="0" width="4" height="140" fill="white"/>
    <rect x="12" y="0" width="8" height="140" fill="#22c55e"/>
    
    {/* Content */}
    <text x="350" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fill="#c2410c">🇮🇳 India-Specific Note</text>
    
    <text x="350" y="55" textAnchor="middle" fontSize="10" fill="#9a3412">
      Indian investors face these same common mistakes.
    </text>
    <text x="350" y="75" textAnchor="middle" fontSize="10" fill="#9a3412">
      Additionally, many beginners are unaware of advance tax requirements for investment income
    </text>
    <text x="350" y="95" textAnchor="middle" fontSize="10" fill="#9a3412">
      or the distinction between different asset class treatments.
    </text>
    <text x="350" y="120" textAnchor="middle" fontSize="8" fill="#c2410c" fontStyle="italic">
      This is for awareness only — consult a tax professional for guidance on Indian tax laws.
    </text>
  </svg>
);

// SVG 10: Disclaimer Banner
const DisclaimerBannerSVG = () => (
  <svg viewBox="0 0 700 100" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="100" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
    
    {/* Warning icon */}
    <circle cx="60" cy="50" r="25" fill="#fee2e2" stroke="#ef4444" strokeWidth="2"/>
    <text x="60" y="58" textAnchor="middle" fontSize="24" fill="#dc2626">⚠️</text>
    
    {/* Text */}
    <text x="370" y="35" textAnchor="middle" fontSize="12" fontWeight="600" fill="#dc2626">Educational Content Only</text>
    <text x="370" y="55" textAnchor="middle" fontSize="9" fill="#991b1b">
      This lesson provides awareness about common tax mistakes.
    </text>
    <text x="370" y="72" textAnchor="middle" fontSize="9" fill="#991b1b">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
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
            <h1 className="text-3xl font-bold text-gray-800 mt-4">Common Tax Mistakes Beginners Make</h1>
            <p className="text-gray-600 mt-2">Awareness of pitfalls helps you avoid them</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Tax Mistakes Happen</h2>
          
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Mistake #1: Ignoring Taxes Completely</h2>
          
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Mistake #2: Selling Without Considering Timing</h2>
          
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Mistake #3: Misunderstanding What Gets Taxed</h2>
          
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Small Mistakes Matter Over Time</h2>
          
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Example: Jordan's Tax Surprise</h2>
          
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🌍 Global Context with India Note</h2>
          
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Knowledge Check</h2>
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
              <h3 className="text-xl font-bold text-blue-800 mb-3">Reflection Activity</h3>
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-lg mb-8 text-white">
          <h3 className="text-xl font-bold mb-4">🎉 Module Complete!</h3>
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
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
          >
            <span>Back to Module</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaxLesson6;
