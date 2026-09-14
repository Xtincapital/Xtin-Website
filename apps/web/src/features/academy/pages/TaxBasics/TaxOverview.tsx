import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaLock, FaCheckCircle, FaFileInvoiceDollar, FaInfoCircle } from 'react-icons/fa';

// SVG 1: What Are Taxes
const WhatAreTaxesSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">What Are Taxes and Why Do They Exist?</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">A portion of your earnings that funds public services and infrastructure</text>
    
    {/* Flow visualization */}
    <g transform="translate(50, 75)">
      {/* You earn */}
      <rect x="0" y="0" width="140" height="80" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="2"/>
      <text x="70" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">💼 You Earn</text>
      <text x="70" y="45" textAnchor="middle" fontSize="9" fill="#374151">Salary, investments,</text>
      <text x="70" y="60" textAnchor="middle" fontSize="9" fill="#374151">business income</text>
      
      {/* Arrow */}
      <polygon points="155,40 175,40 175,35 190,45 175,55 175,50 155,50" fill="#64748b"/>
      
      {/* Government takes portion */}
      <rect x="200" y="0" width="140" height="80" fill="#dbeafe" rx="10" stroke="#93c5fd" strokeWidth="2"/>
      <text x="270" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#1e40af">🏛️ Tax Collected</text>
      <text x="270" y="45" textAnchor="middle" fontSize="9" fill="#374151">A percentage goes</text>
      <text x="270" y="60" textAnchor="middle" fontSize="9" fill="#374151">to the government</text>
      
      {/* Arrow */}
      <polygon points="355,40 375,40 375,35 390,45 375,55 375,50 355,50" fill="#64748b"/>
      
      {/* Public services */}
      <rect x="400" y="0" width="140" height="80" fill="#e0e7ff" rx="10" stroke="#a5b4fc" strokeWidth="2"/>
      <text x="470" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#4338ca">🏗️ Public Services</text>
      <text x="470" y="45" textAnchor="middle" fontSize="9" fill="#374151">Roads, schools,</text>
      <text x="470" y="60" textAnchor="middle" fontSize="9" fill="#374151">healthcare, defense</text>
    </g>
    
    {/* Why taxes exist */}
    <g transform="translate(50, 175)">
      <rect x="0" y="0" width="600" height="75" fill="white" rx="10" stroke="#e5e7eb" strokeWidth="1"/>
      <text x="300" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#334155">Why Taxes Exist</text>
      
      <g transform="translate(30, 38)">
        <text x="0" y="0" fontSize="8" fill="#64748b">✓ Fund infrastructure (roads, bridges, utilities)</text>
        <text x="190" y="0" fontSize="8" fill="#64748b">✓ Provide public services (education, healthcare)</text>
        <text x="410" y="0" fontSize="8" fill="#64748b">✓ National defense & security</text>
      </g>
      <g transform="translate(30, 55)">
        <text x="0" y="0" fontSize="8" fill="#64748b">✓ Social safety nets (pensions, unemployment)</text>
        <text x="190" y="0" fontSize="8" fill="#64748b">✓ Maintain law and order</text>
        <text x="410" y="0" fontSize="8" fill="#64748b">✓ Support economic stability</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="258" width="500" height="18" fill="#1e40af" rx="4"/>
    <text x="350" y="270" textAnchor="middle" fontSize="8" fill="white">Taxes are the price we pay for a functioning society — understanding them helps you keep more of what you earn.</text>
  </svg>
);

// SVG 2: Why Taxes Matter in Investing
const TaxesInInvestingSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Why Taxes Matter in Investing</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">What you keep matters more than what you earn</text>
    
    {/* Illustration: Same return, different outcomes */}
    <g transform="translate(50, 75)">
      {/* Investor A */}
      <rect x="0" y="0" width="280" height="170" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">Tax-Aware Investor</text>
      
      <g transform="translate(15, 40)">
        <rect x="0" y="0" width="250" height="115" fill="white" rx="8"/>
        <text x="125" y="18" textAnchor="middle" fontSize="8" fill="#374151">$10,000 invested for 10 years</text>
        <text x="125" y="35" textAnchor="middle" fontSize="8" fill="#374151">8% annual return</text>
        <line x1="20" y1="45" x2="230" y2="45" stroke="#e5e7eb" strokeWidth="1"/>
        <text x="125" y="62" textAnchor="middle" fontSize="8" fill="#64748b">Uses tax-advantaged accounts</text>
        <text x="125" y="77" textAnchor="middle" fontSize="8" fill="#64748b">Holds investments long-term</text>
        <text x="125" y="92" textAnchor="middle" fontSize="8" fill="#64748b">Plans for tax efficiency</text>
        <line x1="20" y1="100" x2="230" y2="100" stroke="#e5e7eb" strokeWidth="1"/>
        <text x="125" y="115" textAnchor="middle" fontSize="10" fill="#166534" fontWeight="600">Final: ~$19,500</text>
      </g>
    </g>
    
    <g transform="translate(370, 75)">
      {/* Investor B */}
      <rect x="0" y="0" width="280" height="170" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">Tax-Unaware Investor</text>
      
      <g transform="translate(15, 40)">
        <rect x="0" y="0" width="250" height="115" fill="white" rx="8"/>
        <text x="125" y="18" textAnchor="middle" fontSize="8" fill="#374151">$10,000 invested for 10 years</text>
        <text x="125" y="35" textAnchor="middle" fontSize="8" fill="#374151">8% annual return (same!)</text>
        <line x1="20" y1="45" x2="230" y2="45" stroke="#e5e7eb" strokeWidth="1"/>
        <text x="125" y="62" textAnchor="middle" fontSize="8" fill="#64748b">Frequent trading (taxed yearly)</text>
        <text x="125" y="77" textAnchor="middle" fontSize="8" fill="#64748b">Ignores tax implications</text>
        <text x="125" y="92" textAnchor="middle" fontSize="8" fill="#64748b">No planning</text>
        <line x1="20" y1="100" x2="230" y2="100" stroke="#e5e7eb" strokeWidth="1"/>
        <text x="125" y="115" textAnchor="middle" fontSize="10" fill="#dc2626" fontWeight="600">Final: ~$14,800</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="255" width="500" height="35" fill="#1e40af" rx="6"/>
    <text x="350" y="270" textAnchor="middle" fontSize="9" fill="white">Same investment, same return rate — but $4,700 difference due to taxes.</text>
    <text x="350" y="285" textAnchor="middle" fontSize="8" fill="#bfdbfe">Tax awareness isn't about avoiding taxes — it's about not paying more than you owe.</text>
  </svg>
);

// SVG 3: Pre-Tax vs Post-Tax Returns
const PreVsPostTaxSVG = () => (
  <svg viewBox="0 0 700 260" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="260" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Pre-Tax vs. Post-Tax Returns</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">The number that matters is what you actually keep</text>
    
    {/* Visual comparison */}
    <g transform="translate(100, 75)">
      {/* Pre-tax bar */}
      <text x="0" y="15" fontSize="10" fill="#334155" fontWeight="500">Pre-Tax Return (10%)</text>
      <rect x="150" y="0" width="350" height="30" fill="#dbeafe" rx="6" stroke="#93c5fd" strokeWidth="1"/>
      <text x="325" y="20" textAnchor="middle" fontSize="10" fill="#1e40af" fontWeight="600">$10,000 → $11,000</text>
      <text x="520" y="20" fontSize="9" fill="#64748b">+$1,000</text>
      
      {/* Tax taken */}
      <text x="0" y="65" fontSize="10" fill="#334155" fontWeight="500">Taxes Owed (e.g., 25%)</text>
      <rect x="150" y="50" width="87.5" height="30" fill="#fecaca" rx="6" stroke="#fca5a5" strokeWidth="1"/>
      <text x="193.75" y="70" textAnchor="middle" fontSize="10" fill="#dc2626" fontWeight="600">-$250</text>
      <text x="520" y="70" fontSize="9" fill="#64748b">Tax paid</text>
      
      {/* Post-tax bar */}
      <text x="0" y="115" fontSize="10" fill="#334155" fontWeight="500">Post-Tax Return (7.5%)</text>
      <rect x="150" y="100" width="262.5" height="30" fill="#dcfce7" rx="6" stroke="#86efac" strokeWidth="2"/>
      <text x="281.25" y="120" textAnchor="middle" fontSize="10" fill="#166534" fontWeight="600">$10,000 → $10,750</text>
      <text x="520" y="120" fontSize="9" fill="#166534" fontWeight="600">+$750 (what you keep)</text>
    </g>
    
    {/* Key insight */}
    <g transform="translate(50, 195)">
      <rect x="0" y="0" width="600" height="55" fill="white" rx="10" stroke="#e5e7eb" strokeWidth="1"/>
      <text x="300" y="20" textAnchor="middle" fontSize="9" fontWeight="600" fill="#334155">🔑 Key Insight</text>
      <text x="300" y="38" textAnchor="middle" fontSize="8" fill="#64748b">A 10% return isn't really 10% — it's whatever remains after taxes.</text>
      <text x="300" y="52" textAnchor="middle" fontSize="8" fill="#64748b">Always think about returns in terms of what you'll actually keep, not the headline number.</text>
    </g>
  </svg>
);

// SVG 4: Common Tax Mistakes
const CommonMistakesSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Common Beginner Tax Mistakes</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Avoiding these can save you significant money over time</text>
    
    {/* Mistake 1 */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="290" height="110" fill="#fef2f2" rx="10" stroke="#fca5a5" strokeWidth="1"/>
      <text x="145" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#dc2626">❌ Ignoring Tax Implications</text>
      <g transform="translate(15, 35)">
        <rect x="0" y="0" width="260" height="60" fill="white" rx="6"/>
        <text x="130" y="18" textAnchor="middle" fontSize="7" fill="#374151">Making investment decisions without</text>
        <text x="130" y="32" textAnchor="middle" fontSize="7" fill="#374151">considering tax consequences.</text>
        <text x="130" y="50" textAnchor="middle" fontSize="7" fill="#dc2626">"I didn't know I'd owe taxes on that!"</text>
      </g>
    </g>
    
    {/* Mistake 2 */}
    <g transform="translate(360, 75)">
      <rect x="0" y="0" width="290" height="110" fill="#fef2f2" rx="10" stroke="#fca5a5" strokeWidth="1"/>
      <text x="145" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#dc2626">❌ Frequent Trading</text>
      <g transform="translate(15, 35)">
        <rect x="0" y="0" width="260" height="60" fill="white" rx="6"/>
        <text x="130" y="18" textAnchor="middle" fontSize="7" fill="#374151">Buying and selling often creates</text>
        <text x="130" y="32" textAnchor="middle" fontSize="7" fill="#374151">taxable events every time you profit.</text>
        <text x="130" y="50" textAnchor="middle" fontSize="7" fill="#dc2626">Short-term gains often taxed higher</text>
      </g>
    </g>
    
    {/* Mistake 3 */}
    <g transform="translate(50, 200)">
      <rect x="0" y="0" width="290" height="110" fill="#fef2f2" rx="10" stroke="#fca5a5" strokeWidth="1"/>
      <text x="145" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#dc2626">❌ Missing Tax-Advantaged Accounts</text>
      <g transform="translate(15, 35)">
        <rect x="0" y="0" width="260" height="60" fill="white" rx="6"/>
        <text x="130" y="18" textAnchor="middle" fontSize="7" fill="#374151">Not using accounts that offer</text>
        <text x="130" y="32" textAnchor="middle" fontSize="7" fill="#374151">tax benefits (retirement accounts, etc.)</text>
        <text x="130" y="50" textAnchor="middle" fontSize="7" fill="#dc2626">Leaving money on the table</text>
      </g>
    </g>
    
    {/* Mistake 4 */}
    <g transform="translate(360, 200)">
      <rect x="0" y="0" width="290" height="110" fill="#fef2f2" rx="10" stroke="#fca5a5" strokeWidth="1"/>
      <text x="145" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#dc2626">❌ Poor Record Keeping</text>
      <g transform="translate(15, 35)">
        <rect x="0" y="0" width="260" height="60" fill="white" rx="6"/>
        <text x="130" y="18" textAnchor="middle" fontSize="7" fill="#374151">Not tracking purchase prices and</text>
        <text x="130" y="32" textAnchor="middle" fontSize="7" fill="#374151">dates for investments.</text>
        <text x="130" y="50" textAnchor="middle" fontSize="7" fill="#dc2626">Can lead to paying more than owed</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="320" width="500" height="15" fill="#1e40af" rx="4"/>
    <text x="350" y="331" textAnchor="middle" fontSize="8" fill="white">These mistakes cost beginners thousands over time. Awareness is the first step to avoiding them.</text>
  </svg>
);

// SVG 5: What You'll Learn
const WhatYoullLearnSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">What You'll Understand After This Module</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Building tax awareness — not expertise, but foundation</text>
    
    {/* Learning outcomes */}
    <g transform="translate(50, 75)">
      {/* Row 1 */}
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="190" height="75" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="1"/>
        <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">✓ Tax Basics</text>
        <text x="95" y="42" textAnchor="middle" fontSize="7" fill="#374151">How taxes work at a</text>
        <text x="95" y="55" textAnchor="middle" fontSize="7" fill="#374151">fundamental level</text>
      </g>
      
      <g transform="translate(205, 0)">
        <rect x="0" y="0" width="190" height="75" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="1"/>
        <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">✓ Investment Taxes</text>
        <text x="95" y="42" textAnchor="middle" fontSize="7" fill="#374151">How different investments</text>
        <text x="95" y="55" textAnchor="middle" fontSize="7" fill="#374151">are taxed differently</text>
      </g>
      
      <g transform="translate(410, 0)">
        <rect x="0" y="0" width="190" height="75" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="1"/>
        <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">✓ Tax-Smart Thinking</text>
        <text x="95" y="42" textAnchor="middle" fontSize="7" fill="#374151">Questions to ask before</text>
        <text x="95" y="55" textAnchor="middle" fontSize="7" fill="#374151">making financial decisions</text>
      </g>
      
      {/* Row 2 */}
      <g transform="translate(100, 95)">
        <rect x="0" y="0" width="190" height="75" fill="#dbeafe" rx="10" stroke="#93c5fd" strokeWidth="1"/>
        <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1e40af">✓ Tax-Advantaged Options</text>
        <text x="95" y="42" textAnchor="middle" fontSize="7" fill="#374151">Awareness of accounts</text>
        <text x="95" y="55" textAnchor="middle" fontSize="7" fill="#374151">that offer tax benefits</text>
      </g>
      
      <g transform="translate(310, 95)">
        <rect x="0" y="0" width="190" height="75" fill="#dbeafe" rx="10" stroke="#93c5fd" strokeWidth="1"/>
        <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1e40af">✓ When to Seek Help</text>
        <text x="95" y="42" textAnchor="middle" fontSize="7" fill="#374151">Recognizing when you</text>
        <text x="95" y="55" textAnchor="middle" fontSize="7" fill="#374151">need professional advice</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="240" width="500" height="30" fill="#166534" rx="6"/>
    <text x="350" y="253" textAnchor="middle" fontSize="9" fill="white">Goal: Not to make you a tax expert, but to make you tax-aware.</text>
    <text x="350" y="266" textAnchor="middle" fontSize="8" fill="#dcfce7">Awareness helps you ask the right questions and avoid costly mistakes.</text>
  </svg>
);

// SVG 6: Module Approach
const ModuleApproachSVG = () => (
  <svg viewBox="0 0 700 160" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="160" fill="url(#taxApproachGrad)" rx="16"/>
    
    <defs>
      <linearGradient id="taxApproachGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e40af"/>
        <stop offset="100%" stopColor="#1e3a8a"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="35" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">📘 Our Approach to Tax Education</text>
    
    <g transform="translate(100, 55)">
      <rect x="0" y="0" width="500" height="85" fill="white" fillOpacity="0.15" rx="8"/>
      
      <g transform="translate(20, 20)">
        <text x="0" y="0" fontSize="9" fill="white">✓ Awareness Only — We explain concepts, not strategies</text>
        <text x="0" y="18" fontSize="9" fill="white">✓ No Legal Advice — This is education, not professional tax guidance</text>
        <text x="0" y="36" fontSize="9" fill="white">✓ Global-First — Examples in USD with optional country-specific notes</text>
        <text x="0" y="54" fontSize="9" fill="white">✓ Simple Language — No jargon, no complicated scenarios</text>
        <text x="0" y="72" fontSize="9" fill="#bfdbfe">✓ Empowerment — Helping you know what questions to ask</text>
      </g>
    </g>
  </svg>
);

// SVG 7: Important Disclaimer
const DisclaimerSVG = () => (
  <svg viewBox="0 0 700 90" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="90" fill="#fef3c7" rx="12" stroke="#fcd34d" strokeWidth="2"/>
    
    {/* Warning icon */}
    <g transform="translate(30, 30)">
      <circle cx="15" cy="15" r="15" fill="#f59e0b"/>
      <text x="15" y="21" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">!</text>
    </g>
    
    {/* Text */}
    <text x="80" y="35" fontSize="11" fontWeight="600" fill="#92400e">Important: This Is Not Tax Advice</text>
    <text x="80" y="55" fontSize="9" fill="#78350f">This module provides general educational information about taxes. Tax laws vary by country and situation.</text>
    <text x="80" y="72" fontSize="9" fill="#78350f">Always consult a qualified tax professional for advice specific to your circumstances.</text>
  </svg>
);

const TaxOverview = () => {
  const navigate = useNavigate();

  const lessons = [
    { id: 1, title: 'What Are Taxes?', available: true, path: '/learn/tax-lesson-1' },
    { id: 2, title: 'Taxes on Income vs Investments', available: true, path: '/learn/tax-lesson-2' },
    { id: 3, title: 'Capital Gains – Simple Idea', available: true, path: '/learn/tax-lesson-3' },
    { id: 4, title: 'Long-Term vs Short-Term Taxes', available: true, path: '/learn/tax-lesson-4' },
    { id: 5, title: 'Tax Efficiency & Planning (Conceptual)', available: true, path: '/learn/tax-lesson-5' },
    { id: 6, title: 'Common Tax Mistakes Beginners Make', available: true, path: '/learn/tax-lesson-6' },
  ];

  const moduleNotes = [
    { icon: '📚', title: 'Awareness Only', description: 'This module explains tax concepts — not how to file taxes or minimize them. No strategies, no loopholes, no shortcuts.' },
    { icon: '⚖️', title: 'Not Legal/Tax Advice', description: 'This is general education only. Tax laws are complex and vary by location. Always consult a professional for your specific situation.' },
    { icon: '🌍', title: 'Global Perspective', description: 'Examples use USD ($) and general concepts. Country-specific notes are provided where helpful, but tax rules differ everywhere.' },
    { icon: '🎯', title: 'Practical Awareness', description: 'After this module, you\'ll understand basic tax concepts and know what questions to ask — not become a tax expert.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/learn" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Learning Center
          </Link>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <FaFileInvoiceDollar className="text-blue-600 text-2xl" />
              </div>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Awareness Module – No Advice
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tax Basics – Understanding Taxes in Investing</h1>
            <p className="text-gray-600 text-lg">
              Learn how taxes affect your income and investments at a fundamental level.
            </p>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="mb-8">
          <DisclaimerSVG />
        </div>

        {/* Module Approach */}
        <div className="mb-8">
          <ModuleApproachSVG />
        </div>

        {/* Module Notes */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaInfoCircle className="text-blue-500" />
            Before You Begin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moduleNotes.map((note, index) => (
              <div key={index} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{note.icon}</span>
                  <div>
                    <h3 className="font-semibold text-blue-900">{note.title}</h3>
                    <p className="text-blue-700 text-sm">{note.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What Are Taxes */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">What Are Taxes and Why Do They Exist?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Taxes are mandatory payments to the government, calculated as a 
              percentage of your income, purchases, or wealth. They fund the 
              services and infrastructure we all use.
            </p>
            <p className="text-lg leading-relaxed">
              Understanding taxes isn't about finding ways to avoid them — it's 
              about understanding how they work so you can make informed financial 
              decisions and not pay more than you legally owe.
            </p>
          </div>
          
          <WhatAreTaxesSVG />
        </div>

        {/* Why Taxes Matter in Investing */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Taxes Matter in Investing</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              When you invest, you're often focused on returns — "I made 10% this 
              year!" But what matters is what you actually <em>keep</em> after taxes.
            </p>
            <p className="text-lg leading-relaxed">
              Two investors with identical returns can end up with very different 
              amounts of money, simply based on how they handled taxes.
            </p>
          </div>
          
          <TaxesInInvestingSVG />
        </div>

        {/* Pre-Tax vs Post-Tax */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Pre-Tax vs. Post-Tax Returns</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              The return percentage you see quoted is usually <strong>pre-tax</strong>. 
              Your actual return — what you get to keep — is <strong>post-tax</strong>. 
              The difference can be significant.
            </p>
          </div>
          
          <PreVsPostTaxSVG />
        </div>

        {/* Common Mistakes */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Common Beginner Tax Mistakes</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Many beginners make costly tax mistakes simply because they don't know 
              what to consider. Awareness of these common pitfalls is the first step 
              to avoiding them.
            </p>
          </div>
          
          <CommonMistakesSVG />
        </div>

        {/* What You'll Learn */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">What You'll Understand After This Module</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              This module won't make you a tax expert — that takes years of study 
              and professional training. But it will give you foundational 
              awareness that helps you make better financial decisions.
            </p>
          </div>
          
          <WhatYoullLearnSVG />
        </div>

        {/* India Context */}
        <div className="bg-blue-50 rounded-2xl p-6 shadow-lg mb-8 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">🇮🇳 India-Specific Note</h3>
          <p className="text-blue-900 mb-3">
            India has specific tax structures like Income Tax, GST, Securities 
            Transaction Tax (STT), and various tax-saving instruments under 
            Section 80C. Throughout this module, we'll include India-specific 
            notes where relevant.
          </p>
          <p className="text-blue-800 text-sm">
            Remember: Indian tax laws change frequently. Always verify current 
            rules with the Income Tax Department website or a qualified CA.
          </p>
        </div>

        {/* Lessons List */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Module Lessons</h2>
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  lesson.available
                    ? 'border-blue-200 bg-blue-50 hover:border-blue-400 cursor-pointer'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
                onClick={() => lesson.available && navigate(lesson.path)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    lesson.available ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
                  }`}>
                    {lesson.available ? lesson.id : <FaLock className="text-sm" />}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${lesson.available ? 'text-gray-800' : 'text-gray-500'}`}>
                      Lesson {lesson.id}: {lesson.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {lesson.available ? 'Available' : 'Coming Soon'}
                    </p>
                  </div>
                </div>
                {lesson.available && (
                  <FaCheckCircle className="text-blue-600 text-xl" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final Note */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-lg text-white">
          <h3 className="text-xl font-bold mb-4">Ready to Build Tax Awareness?</h3>
          <p className="text-blue-100 mb-4">
            Understanding taxes is one of the most practical financial skills 
            you can develop. It won't make headlines like picking winning stocks, 
            but it can quietly save you thousands over your lifetime.
          </p>
          <p className="text-blue-200 text-sm">
            Remember: The goal is awareness, not expertise. You'll learn enough 
            to ask the right questions and avoid common mistakes — and know when 
            to seek professional help.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaxOverview;
