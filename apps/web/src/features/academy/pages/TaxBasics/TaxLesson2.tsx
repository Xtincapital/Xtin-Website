import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

// ============================================
// TAX LESSON 2: TAXES ON INCOME VS INVESTMENTS
// ============================================

// SVG 1: Two Types of Earnings
const TwoTypesOfEarningsSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F1F4F9" rx="16"/>
    
    {/* Title */}
    <text x="350" y="35" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#2C3F5E">Two Ways You Can Earn Money</text>
    
    {/* Left side - Working for Money */}
    <g transform="translate(50, 60)">
      <rect x="0" y="0" width="270" height="230" fill="white" rx="12" stroke="#5A77AA" strokeWidth="2"/>
      
      {/* Icon - Person working */}
      <g transform="translate(100, 20)">
        <circle cx="35" cy="20" r="18" fill="#5A77AA"/>
        <rect x="20" y="42" width="30" height="40" fill="#5A77AA" rx="5"/>
        {/* Desk */}
        <rect x="0" y="85" width="70" height="8" fill="#2C3F5E"/>
        <rect x="10" y="65" width="50" height="20" fill="#7C95C4" rx="3"/>
      </g>
      
      <text x="135" y="130" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#2C3F5E">Working for Money</text>
      <text x="135" y="150" textAnchor="middle" fontSize="11" fill="#404047">"Active" Income</text>
      
      {/* Examples */}
      <g transform="translate(20, 165)">
        <circle cx="8" cy="8" r="4" fill="#5A77AA"/>
        <text x="20" y="12" fontSize="10" fill="#5A5A62">Salary from your job</text>
        
        <circle cx="8" cy="28" r="4" fill="#5A77AA"/>
        <text x="20" y="32" fontSize="10" fill="#5A5A62">Freelance payments</text>
        
        <circle cx="8" cy="48" r="4" fill="#5A77AA"/>
        <text x="20" y="52" fontSize="10" fill="#5A5A62">Business profits</text>
      </g>
    </g>
    
    {/* Middle - VS */}
    <g transform="translate(335, 160)">
      <circle cx="15" cy="15" r="20" fill="#2C3F5E"/>
      <text x="15" y="21" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">VS</text>
    </g>
    
    {/* Right side - Money Working for You */}
    <g transform="translate(380, 60)">
      <rect x="0" y="0" width="270" height="230" fill="white" rx="12" stroke="#1FA978" strokeWidth="2"/>
      
      {/* Icon - Money growing */}
      <g transform="translate(100, 20)">
        <rect x="15" y="50" width="40" height="50" fill="#1FA978" rx="3"/>
        <text x="35" y="80" textAnchor="middle" fontSize="18" fill="white">$</text>
        {/* Growth arrow */}
        <path d="M35 45 L35 20 L25 30 M35 20 L45 30" stroke="#1FA978" strokeWidth="3" fill="none"/>
        {/* Plant leaves */}
        <ellipse cx="25" cy="25" rx="8" ry="12" fill="#3CCB97" transform="rotate(-30 25 25)"/>
        <ellipse cx="45" cy="25" rx="8" ry="12" fill="#3CCB97" transform="rotate(30 45 25)"/>
      </g>
      
      <text x="135" y="130" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#12805A">Money Working for You</text>
      <text x="135" y="150" textAnchor="middle" fontSize="11" fill="#404047">"Passive" or Investment Income</text>
      
      {/* Examples */}
      <g transform="translate(20, 165)">
        <circle cx="8" cy="8" r="4" fill="#1FA978"/>
        <text x="20" y="12" fontSize="10" fill="#5A5A62">Dividends from stocks</text>
        
        <circle cx="8" cy="28" r="4" fill="#1FA978"/>
        <text x="20" y="32" fontSize="10" fill="#5A5A62">Interest from savings</text>
        
        <circle cx="8" cy="48" r="4" fill="#1FA978"/>
        <text x="20" y="52" fontSize="10" fill="#5A5A62">Profit from selling investments</text>
      </g>
    </g>
    
    {/* Bottom note */}
    <text x="350" y="305" textAnchor="middle" fontSize="10" fill="#75757D" fontStyle="italic">Both types of earnings can be subject to taxes — but they're often treated differently</text>
  </svg>
);

// SVG 2: What Is Income Tax?
const IncomeTaxExplainedSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F1F4F9" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#2C3F5E">Income Tax: Tax on Money You Earn by Working</text>
    
    {/* Flow diagram */}
    <g transform="translate(50, 55)">
      {/* You working */}
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="120" height="90" fill="white" rx="10" stroke="#5A77AA" strokeWidth="2"/>
        <circle cx="60" cy="30" r="15" fill="#5A77AA"/>
        <rect x="50" y="48" width="20" height="25" fill="#5A77AA" rx="3"/>
        <text x="60" y="85" textAnchor="middle" fontSize="10" fontWeight="600" fill="#2C3F5E">You Work</text>
      </g>
      
      {/* Arrow 1 */}
      <g transform="translate(130, 40)">
        <line x1="0" y1="20" x2="50" y2="20" stroke="#5A77AA" strokeWidth="2"/>
        <polygon points="50,15 60,20 50,25" fill="#5A77AA"/>
      </g>
      
      {/* Employer pays */}
      <g transform="translate(200, 0)">
        <rect x="0" y="0" width="120" height="90" fill="white" rx="10" stroke="#5A77AA" strokeWidth="2"/>
        <rect x="35" y="15" width="50" height="35" fill="#7C95C4" rx="5"/>
        <text x="60" y="38" textAnchor="middle" fontSize="14" fill="white">$$$</text>
        <text x="60" y="75" textAnchor="middle" fontSize="10" fontWeight="600" fill="#2C3F5E">Employer Pays</text>
        <text x="60" y="85" textAnchor="middle" fontSize="9" fill="#75757D">Salary/Wages</text>
      </g>
      
      {/* Arrow 2 */}
      <g transform="translate(330, 40)">
        <line x1="0" y1="20" x2="50" y2="20" stroke="#5A77AA" strokeWidth="2"/>
        <polygon points="50,15 60,20 50,25" fill="#5A77AA"/>
      </g>
      
      {/* Tax applies */}
      <g transform="translate(400, 0)">
        <rect x="0" y="0" width="120" height="90" fill="#F6ECCE" rx="10" stroke="#B8923F" strokeWidth="2"/>
        <text x="60" y="35" textAnchor="middle" fontSize="20">🏛️</text>
        <text x="60" y="60" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B26">Income Tax</text>
        <text x="60" y="75" textAnchor="middle" fontSize="9" fill="#654B26">Applied</text>
      </g>
      
      {/* Arrow 3 */}
      <g transform="translate(530, 40)">
        <line x1="0" y1="20" x2="50" y2="20" stroke="#1FA978" strokeWidth="2"/>
        <polygon points="50,15 60,20 50,25" fill="#1FA978"/>
      </g>
    </g>
    
    {/* Take-home box */}
    <g transform="translate(540, 55)">
      <rect x="0" y="0" width="120" height="90" fill="#D5F2E5" rx="10" stroke="#1FA978" strokeWidth="2"/>
      <text x="60" y="35" textAnchor="middle" fontSize="18">💰</text>
      <text x="60" y="58" textAnchor="middle" fontSize="10" fontWeight="600" fill="#12805A">Your Take-Home</text>
      <text x="60" y="72" textAnchor="middle" fontSize="9" fill="#12805A">Net Pay</text>
    </g>
    
    {/* Examples section */}
    <g transform="translate(50, 165)">
      <text x="0" y="0" fontSize="12" fontWeight="600" fill="#2C3F5E">Examples of Income Subject to Income Tax:</text>
      
      <g transform="translate(0, 20)">
        <rect x="0" y="0" width="140" height="70" fill="white" rx="8" stroke="#5A77AA" strokeWidth="1"/>
        <text x="70" y="25" textAnchor="middle" fontSize="18">💼</text>
        <text x="70" y="45" textAnchor="middle" fontSize="10" fontWeight="600" fill="#2C3F5E">Salary</text>
        <text x="70" y="58" textAnchor="middle" fontSize="9" fill="#75757D">Regular job pay</text>
      </g>
      
      <g transform="translate(160, 20)">
        <rect x="0" y="0" width="140" height="70" fill="white" rx="8" stroke="#5A77AA" strokeWidth="1"/>
        <text x="70" y="25" textAnchor="middle" fontSize="18">💻</text>
        <text x="70" y="45" textAnchor="middle" fontSize="10" fontWeight="600" fill="#2C3F5E">Freelance</text>
        <text x="70" y="58" textAnchor="middle" fontSize="9" fill="#75757D">Self-employment</text>
      </g>
      
      <g transform="translate(320, 20)">
        <rect x="0" y="0" width="140" height="70" fill="white" rx="8" stroke="#5A77AA" strokeWidth="1"/>
        <text x="70" y="25" textAnchor="middle" fontSize="18">🏪</text>
        <text x="70" y="45" textAnchor="middle" fontSize="10" fontWeight="600" fill="#2C3F5E">Business</text>
        <text x="70" y="58" textAnchor="middle" fontSize="9" fill="#75757D">Owner profits</text>
      </g>
      
      <g transform="translate(480, 20)">
        <rect x="0" y="0" width="140" height="70" fill="white" rx="8" stroke="#5A77AA" strokeWidth="1"/>
        <text x="70" y="25" textAnchor="middle" fontSize="18">🎁</text>
        <text x="70" y="45" textAnchor="middle" fontSize="10" fontWeight="600" fill="#2C3F5E">Bonuses</text>
        <text x="70" y="58" textAnchor="middle" fontSize="9" fill="#75757D">Extra pay</text>
      </g>
    </g>
  </svg>
);

// SVG 3: What Is Investment Tax?
const InvestmentTaxExplainedSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#EEF9F4" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#12805A">Investment Tax: Tax on Money Your Money Earns</text>
    
    {/* Flow diagram */}
    <g transform="translate(50, 55)">
      {/* Your money */}
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="120" height="90" fill="white" rx="10" stroke="#1FA978" strokeWidth="2"/>
        <rect x="35" y="15" width="50" height="35" fill="#1FA978" rx="5"/>
        <text x="60" y="38" textAnchor="middle" fontSize="14" fill="white">$$$</text>
        <text x="60" y="75" textAnchor="middle" fontSize="10" fontWeight="600" fill="#12805A">Your Money</text>
        <text x="60" y="85" textAnchor="middle" fontSize="9" fill="#75757D">(Saved/Invested)</text>
      </g>
      
      {/* Arrow 1 */}
      <g transform="translate(130, 40)">
        <line x1="0" y1="20" x2="50" y2="20" stroke="#1FA978" strokeWidth="2"/>
        <polygon points="50,15 60,20 50,25" fill="#1FA978"/>
      </g>
      
      {/* Investments grow */}
      <g transform="translate(200, 0)">
        <rect x="0" y="0" width="120" height="90" fill="white" rx="10" stroke="#1FA978" strokeWidth="2"/>
        <g transform="translate(30, 10)">
          {/* Growth chart */}
          <polyline points="0,50 20,40 40,30 60,15" stroke="#1FA978" strokeWidth="3" fill="none"/>
          <circle cx="60" cy="15" r="5" fill="#1FA978"/>
        </g>
        <text x="60" y="75" textAnchor="middle" fontSize="10" fontWeight="600" fill="#12805A">Grows Over Time</text>
        <text x="60" y="85" textAnchor="middle" fontSize="9" fill="#75757D">Earns returns</text>
      </g>
      
      {/* Arrow 2 */}
      <g transform="translate(330, 40)">
        <line x1="0" y1="20" x2="50" y2="20" stroke="#1FA978" strokeWidth="2"/>
        <polygon points="50,15 60,20 50,25" fill="#1FA978"/>
      </g>
      
      {/* Tax on gains */}
      <g transform="translate(400, 0)">
        <rect x="0" y="0" width="120" height="90" fill="#F6ECCE" rx="10" stroke="#B8923F" strokeWidth="2"/>
        <text x="60" y="35" textAnchor="middle" fontSize="20">🏛️</text>
        <text x="60" y="60" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B26">Investment Tax</text>
        <text x="60" y="75" textAnchor="middle" fontSize="9" fill="#654B26">On Gains Only</text>
      </g>
      
      {/* Arrow 3 */}
      <g transform="translate(530, 40)">
        <line x1="0" y1="20" x2="50" y2="20" stroke="#1FA978" strokeWidth="2"/>
        <polygon points="50,15 60,20 50,25" fill="#1FA978"/>
      </g>
    </g>
    
    {/* Net profit box */}
    <g transform="translate(540, 55)">
      <rect x="0" y="0" width="120" height="90" fill="#D5F2E5" rx="10" stroke="#1FA978" strokeWidth="2"/>
      <text x="60" y="35" textAnchor="middle" fontSize="18">📈</text>
      <text x="60" y="58" textAnchor="middle" fontSize="10" fontWeight="600" fill="#12805A">Your Net Profit</text>
      <text x="60" y="72" textAnchor="middle" fontSize="9" fill="#12805A">After taxes</text>
    </g>
    
    {/* Types of investment income */}
    <g transform="translate(50, 165)">
      <text x="0" y="0" fontSize="12" fontWeight="600" fill="#12805A">Types of Investment Income:</text>
      
      <g transform="translate(0, 20)">
        <rect x="0" y="0" width="190" height="95" fill="white" rx="8" stroke="#1FA978" strokeWidth="1"/>
        <text x="95" y="25" textAnchor="middle" fontSize="18">📊</text>
        <text x="95" y="45" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">Capital Gains</text>
        <text x="95" y="60" textAnchor="middle" fontSize="9" fill="#75757D">Profit from selling stocks,</text>
        <text x="95" y="73" textAnchor="middle" fontSize="9" fill="#75757D">bonds, or property for more</text>
        <text x="95" y="86" textAnchor="middle" fontSize="9" fill="#75757D">than you paid</text>
      </g>
      
      <g transform="translate(210, 20)">
        <rect x="0" y="0" width="190" height="95" fill="white" rx="8" stroke="#1FA978" strokeWidth="1"/>
        <text x="95" y="25" textAnchor="middle" fontSize="18">💵</text>
        <text x="95" y="45" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">Dividends</text>
        <text x="95" y="60" textAnchor="middle" fontSize="9" fill="#75757D">Payments companies make</text>
        <text x="95" y="73" textAnchor="middle" fontSize="9" fill="#75757D">to shareholders from</text>
        <text x="95" y="86" textAnchor="middle" fontSize="9" fill="#75757D">their profits</text>
      </g>
      
      <g transform="translate(420, 20)">
        <rect x="0" y="0" width="190" height="95" fill="white" rx="8" stroke="#1FA978" strokeWidth="1"/>
        <text x="95" y="25" textAnchor="middle" fontSize="18">🏦</text>
        <text x="95" y="45" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">Interest Income</text>
        <text x="95" y="60" textAnchor="middle" fontSize="9" fill="#75757D">Earnings from savings</text>
        <text x="95" y="73" textAnchor="middle" fontSize="9" fill="#75757D">accounts, bonds, or</text>
        <text x="95" y="86" textAnchor="middle" fontSize="9" fill="#75757D">fixed deposits</text>
      </g>
    </g>
  </svg>
);

// SVG 4: Key Difference - Why Different?
const WhyDifferentSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#F6F2FB" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#7A5BA6">Why Are They Taxed Differently?</text>
    
    {/* Reason 1 */}
    <g transform="translate(50, 55)">
      <rect x="0" y="0" width="280" height="120" fill="white" rx="12" stroke="#8F6FC4" strokeWidth="2"/>
      <circle cx="35" cy="35" r="20" fill="#8F6FC4"/>
      <text x="35" y="41" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">1</text>
      
      <text x="70" y="35" fontSize="12" fontWeight="600" fill="#7A5BA6">Encourage Investing</text>
      <text x="20" y="60" fontSize="10" fill="#5A5A62">Governments often want people to</text>
      <text x="20" y="75" fontSize="10" fill="#5A5A62">invest and grow wealth. Lower taxes</text>
      <text x="20" y="90" fontSize="10" fill="#5A5A62">on investments can encourage this</text>
      <text x="20" y="105" fontSize="10" fill="#5A5A62">long-term financial behavior.</text>
    </g>
    
    {/* Reason 2 */}
    <g transform="translate(370, 55)">
      <rect x="0" y="0" width="280" height="120" fill="white" rx="12" stroke="#8F6FC4" strokeWidth="2"/>
      <circle cx="35" cy="35" r="20" fill="#8F6FC4"/>
      <text x="35" y="41" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">2</text>
      
      <text x="70" y="35" fontSize="12" fontWeight="600" fill="#7A5BA6">Risk vs. Certainty</text>
      <text x="20" y="60" fontSize="10" fill="#5A5A62">Salary is guaranteed income —</text>
      <text x="20" y="75" fontSize="10" fill="#5A5A62">you worked for it. Investment</text>
      <text x="20" y="90" fontSize="10" fill="#5A5A62">returns involve risk — you might</text>
      <text x="20" y="105" fontSize="10" fill="#5A5A62">lose money too.</text>
    </g>
    
    {/* Reason 3 */}
    <g transform="translate(50, 190)">
      <rect x="0" y="0" width="280" height="120" fill="white" rx="12" stroke="#8F6FC4" strokeWidth="2"/>
      <circle cx="35" cy="35" r="20" fill="#8F6FC4"/>
      <text x="35" y="41" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">3</text>
      
      <text x="70" y="35" fontSize="12" fontWeight="600" fill="#7A5BA6">Economic Growth</text>
      <text x="20" y="60" fontSize="10" fill="#5A5A62">Investment puts money into businesses,</text>
      <text x="20" y="75" fontSize="10" fill="#5A5A62">which can create jobs and grow the</text>
      <text x="20" y="90" fontSize="10" fill="#5A5A62">economy. This is seen as beneficial</text>
      <text x="20" y="105" fontSize="10" fill="#5A5A62">for society overall.</text>
    </g>
    
    {/* Reason 4 */}
    <g transform="translate(370, 190)">
      <rect x="0" y="0" width="280" height="120" fill="white" rx="12" stroke="#8F6FC4" strokeWidth="2"/>
      <circle cx="35" cy="35" r="20" fill="#8F6FC4"/>
      <text x="35" y="41" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">4</text>
      
      <text x="70" y="35" fontSize="12" fontWeight="600" fill="#7A5BA6">Time Factor</text>
      <text x="20" y="60" fontSize="10" fill="#5A5A62">Long-term investments (held for years)</text>
      <text x="20" y="75" fontSize="10" fill="#5A5A62">are often taxed less than short-term</text>
      <text x="20" y="90" fontSize="10" fill="#5A5A62">gains. This encourages patience</text>
      <text x="20" y="105" fontSize="10" fill="#5A5A62">and stable markets.</text>
    </g>
  </svg>
);

// SVG 5: Global Example - Sam's Situation
const GlobalExampleSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="380" fill="#F1F4F9" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#2C3F5E">Example: Sam's Two Types of Earnings</text>
    
    {/* Sam character */}
    <g transform="translate(50, 55)">
      <circle cx="50" cy="30" r="25" fill="#5A77AA"/>
      <circle cx="42" cy="25" r="3" fill="white"/>
      <circle cx="58" cy="25" r="3" fill="white"/>
      <path d="M40 38 Q50 45 60 38" stroke="white" strokeWidth="2" fill="none"/>
      <rect x="30" y="58" width="40" height="50" fill="#5A77AA" rx="5"/>
      <text x="100" y="45" fontSize="14" fontWeight="600" fill="#2C3F5E">Sam</text>
      <text x="100" y="65" fontSize="11" fill="#5A5A62">Software Developer</text>
      <text x="100" y="85" fontSize="11" fill="#5A5A62">Also invests in stocks</text>
    </g>
    
    {/* Income section */}
    <g transform="translate(50, 160)">
      <rect x="0" y="0" width="280" height="180" fill="white" rx="12" stroke="#5A77AA" strokeWidth="2"/>
      
      <rect x="0" y="0" width="280" height="35" fill="#5A77AA" rx="12" />
      <rect x="0" y="17" width="280" height="18" fill="#5A77AA"/>
      <text x="140" y="23" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">INCOME FROM WORKING</text>
      
      <g transform="translate(20, 50)">
        <text x="0" y="15" fontSize="11" fill="#5A5A62">Annual Salary:</text>
        <text x="180" y="15" fontSize="11" fontWeight="600" fill="#2C3F5E">$75,000</text>
        
        <line x1="0" y1="30" x2="240" y2="30" stroke="#E4E1D9" strokeWidth="1"/>
        
        <text x="0" y="50" fontSize="10" fill="#75757D">This is taxed as regular income</text>
        <text x="0" y="65" fontSize="10" fill="#75757D">because Sam traded his time and</text>
        <text x="0" y="80" fontSize="10" fill="#75757D">skills for this money.</text>
        
        <g transform="translate(0, 95)">
          <rect x="0" y="0" width="240" height="30" fill="#E0E7F1" rx="5"/>
          <text x="120" y="19" textAnchor="middle" fontSize="10" fill="#2C3F5E">💼 Tax Type: Income Tax</text>
        </g>
      </g>
    </g>
    
    {/* Investment section */}
    <g transform="translate(370, 160)">
      <rect x="0" y="0" width="280" height="180" fill="white" rx="12" stroke="#1FA978" strokeWidth="2"/>
      
      <rect x="0" y="0" width="280" height="35" fill="#1FA978" rx="12" />
      <rect x="0" y="17" width="280" height="18" fill="#1FA978"/>
      <text x="140" y="23" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">INCOME FROM INVESTMENTS</text>
      
      <g transform="translate(20, 50)">
        <text x="0" y="15" fontSize="11" fill="#5A5A62">Stock sale profit:</text>
        <text x="180" y="15" fontSize="11" fontWeight="600" fill="#12805A">$5,000</text>
        
        <line x1="0" y1="30" x2="240" y2="30" stroke="#E4E1D9" strokeWidth="1"/>
        
        <text x="0" y="50" fontSize="10" fill="#75757D">This is taxed as investment income</text>
        <text x="0" y="65" fontSize="10" fill="#75757D">because Sam's money earned this</text>
        <text x="0" y="80" fontSize="10" fill="#75757D">while invested in stocks.</text>
        
        <g transform="translate(0, 95)">
          <rect x="0" y="0" width="240" height="30" fill="#D5F2E5" rx="5"/>
          <text x="120" y="19" textAnchor="middle" fontSize="10" fill="#12805A">📈 Tax Type: Capital Gains Tax</text>
        </g>
      </g>
    </g>
    
    {/* Bottom note */}
    <text x="350" y="365" textAnchor="middle" fontSize="10" fill="#75757D" fontStyle="italic">Same person, same year — but two different types of income, potentially taxed differently</text>
  </svg>
);

// SVG 6: Side-by-Side Comparison
const ComparisonTableSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#2C3F5E">Income Tax vs Investment Tax: Quick Comparison</text>
    
    {/* Table header */}
    <g transform="translate(50, 50)">
      {/* Header row */}
      <rect x="0" y="0" width="200" height="35" fill="#75757D" rx="8"/>
      <rect x="0" y="17" width="200" height="18" fill="#75757D"/>
      <text x="100" y="23" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">Aspect</text>
      
      <rect x="210" y="0" width="200" height="35" fill="#5A77AA" rx="8"/>
      <rect x="210" y="17" width="200" height="18" fill="#5A77AA"/>
      <text x="310" y="23" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">Income Tax</text>
      
      <rect x="420" y="0" width="200" height="35" fill="#1FA978" rx="8"/>
      <rect x="420" y="17" width="200" height="18" fill="#1FA978"/>
      <text x="520" y="23" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">Investment Tax</text>
    </g>
    
    {/* Row 1 - Source */}
    <g transform="translate(50, 95)">
      <rect x="0" y="0" width="200" height="45" fill="#EFEDE7" stroke="#E4E1D9" strokeWidth="1"/>
      <text x="100" y="27" textAnchor="middle" fontSize="10" fontWeight="600" fill="#5A5A62">Source of Money</text>
      
      <rect x="210" y="0" width="200" height="45" fill="#F1F4F9" stroke="#E4E1D9" strokeWidth="1"/>
      <text x="310" y="22" textAnchor="middle" fontSize="10" fill="#2C3F5E">Working (salary,</text>
      <text x="310" y="35" textAnchor="middle" fontSize="10" fill="#2C3F5E">freelance, business)</text>
      
      <rect x="420" y="0" width="200" height="45" fill="#EEF9F4" stroke="#E4E1D9" strokeWidth="1"/>
      <text x="520" y="22" textAnchor="middle" fontSize="10" fill="#12805A">Investments (stocks,</text>
      <text x="520" y="35" textAnchor="middle" fontSize="10" fill="#12805A">bonds, property)</text>
    </g>
    
    {/* Row 2 - Effort */}
    <g transform="translate(50, 140)">
      <rect x="0" y="0" width="200" height="45" fill="white" stroke="#E4E1D9" strokeWidth="1"/>
      <text x="100" y="27" textAnchor="middle" fontSize="10" fontWeight="600" fill="#5A5A62">Your Effort</text>
      
      <rect x="210" y="0" width="200" height="45" fill="white" stroke="#E4E1D9" strokeWidth="1"/>
      <text x="310" y="22" textAnchor="middle" fontSize="10" fill="#2C3F5E">Active — you trade</text>
      <text x="310" y="35" textAnchor="middle" fontSize="10" fill="#2C3F5E">time for money</text>
      
      <rect x="420" y="0" width="200" height="45" fill="white" stroke="#E4E1D9" strokeWidth="1"/>
      <text x="520" y="22" textAnchor="middle" fontSize="10" fill="#12805A">Passive — money</text>
      <text x="520" y="35" textAnchor="middle" fontSize="10" fill="#12805A">works for you</text>
    </g>
    
    {/* Row 3 - Risk */}
    <g transform="translate(50, 185)">
      <rect x="0" y="0" width="200" height="45" fill="#EFEDE7" stroke="#E4E1D9" strokeWidth="1"/>
      <text x="100" y="27" textAnchor="middle" fontSize="10" fontWeight="600" fill="#5A5A62">Risk Level</text>
      
      <rect x="210" y="0" width="200" height="45" fill="#F1F4F9" stroke="#E4E1D9" strokeWidth="1"/>
      <text x="310" y="22" textAnchor="middle" fontSize="10" fill="#2C3F5E">Low — you did the</text>
      <text x="310" y="35" textAnchor="middle" fontSize="10" fill="#2C3F5E">work, you get paid</text>
      
      <rect x="420" y="0" width="200" height="45" fill="#EEF9F4" stroke="#E4E1D9" strokeWidth="1"/>
      <text x="520" y="22" textAnchor="middle" fontSize="10" fill="#12805A">Higher — you could</text>
      <text x="520" y="35" textAnchor="middle" fontSize="10" fill="#12805A">gain or lose</text>
    </g>
    
    {/* Row 4 - When taxed */}
    <g transform="translate(50, 230)">
      <rect x="0" y="0" width="200" height="45" fill="white" stroke="#E4E1D9" strokeWidth="1"/>
      <text x="100" y="27" textAnchor="middle" fontSize="10" fontWeight="600" fill="#5A5A62">When Taxed</text>
      
      <rect x="210" y="0" width="200" height="45" fill="white" stroke="#E4E1D9" strokeWidth="1"/>
      <text x="310" y="22" textAnchor="middle" fontSize="10" fill="#2C3F5E">When earned</text>
      <text x="310" y="35" textAnchor="middle" fontSize="10" fill="#2C3F5E">(each paycheck)</text>
      
      <rect x="420" y="0" width="200" height="45" fill="white" stroke="#E4E1D9" strokeWidth="1"/>
      <text x="520" y="22" textAnchor="middle" fontSize="10" fill="#12805A">Often when sold</text>
      <text x="520" y="35" textAnchor="middle" fontSize="10" fill="#12805A">(realized gains)</text>
    </g>
    
    {/* Note */}
    <text x="350" y="300" textAnchor="middle" fontSize="9" fill="#75757D" fontStyle="italic">Note: Actual tax treatment varies by country and specific circumstances</text>
  </svg>
);

// SVG 7: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 160" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="160" fill="#E0E7F1" rx="16" stroke="#5A77AA" strokeWidth="2"/>
    
    {/* Lightbulb icon */}
    <g transform="translate(40, 50)">
      <circle cx="30" cy="30" r="28" fill="#5A77AA"/>
      <circle cx="30" cy="25" r="15" fill="#CDAA5F" stroke="#B8923F" strokeWidth="2"/>
      <rect x="24" y="42" width="12" height="8" fill="#CDAA5F"/>
      <line x1="24" y1="52" x2="36" y2="52" stroke="#B8923F" strokeWidth="2"/>
      <line x1="26" y1="55" x2="34" y2="55" stroke="#B8923F" strokeWidth="2"/>
    </g>
    
    {/* Key takeaway text */}
    <g transform="translate(110, 35)">
      <text x="0" y="15" fontSize="14" fontWeight="bold" fill="#2C3F5E">Key Takeaway</text>
      <text x="0" y="45" fontSize="11" fill="#232327">Money you earn by working (salary, freelance) is usually called</text>
      <text x="0" y="62" fontSize="11" fill="#232327">"income" and taxed one way. Money your investments earn</text>
      <text x="0" y="79" fontSize="11" fill="#232327">(dividends, capital gains) is often taxed differently.</text>
      <text x="0" y="105" fontSize="11" fontWeight="600" fill="#2C3F5E">Understanding this difference helps you know what to expect at tax time.</text>
    </g>
  </svg>
);

// SVG 8: India Note
const IndiaNotesSVG = () => (
  <svg viewBox="0 0 700 180" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="180" fill="#FCF3EE" rx="16" stroke="#E3906B" strokeWidth="2"/>
    
    {/* India flag icon */}
    <g transform="translate(30, 25)">
      <rect x="0" y="0" width="60" height="15" fill="#FF9933"/>
      <rect x="0" y="15" width="60" height="15" fill="white"/>
      <rect x="0" y="30" width="60" height="15" fill="#138808"/>
      <circle cx="30" cy="22.5" r="6" fill="none" stroke="#000080" strokeWidth="1"/>
    </g>
    
    {/* Title */}
    <text x="110" y="45" fontSize="14" fontWeight="bold" fill="#9C4D2E">India-Specific Note</text>
    
    {/* Content */}
    <g transform="translate(30, 70)">
      <circle cx="8" cy="8" r="4" fill="#E3906B"/>
      <text x="22" y="12" fontSize="10" fill="#663524"><tspan fontWeight="600">Income Tax:</tspan> Salary and business income taxed under Income Tax Act slabs</text>
      
      <circle cx="8" cy="33" r="4" fill="#E3906B"/>
      <text x="22" y="37" fontSize="10" fill="#663524"><tspan fontWeight="600">Capital Gains:</tspan> Profits from selling assets (stocks, property) have separate rules</text>
      
      <circle cx="8" cy="58" r="4" fill="#E3906B"/>
      <text x="22" y="62" fontSize="10" fill="#663524"><tspan fontWeight="600">STT:</tspan> Securities Transaction Tax applies when you buy/sell listed securities</text>
      
      <circle cx="8" cy="83" r="4" fill="#E3906B"/>
      <text x="22" y="87" fontSize="10" fill="#663524"><tspan fontWeight="600">Dividends:</tspan> Now taxed as income in the hands of the shareholder (since 2020)</text>
    </g>
    
    {/* Note */}
    <text x="350" y="168" textAnchor="middle" fontSize="9" fill="#7D3F28" fontStyle="italic">Tax laws change frequently. Always verify current rules with a tax professional.</text>
  </svg>
);

// SVG 9: Disclaimer Banner
const DisclaimerBannerSVG = () => (
  <svg viewBox="0 0 700 80" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="80" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
    
    {/* Warning icon */}
    <g transform="translate(25, 25)">
      <circle cx="15" cy="15" r="15" fill="#B8923F"/>
      <text x="15" y="21" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">!</text>
    </g>
    
    {/* Text */}
    <text x="70" y="32" fontSize="11" fontWeight="600" fill="#654B26">Educational Awareness Only</text>
    <text x="70" y="50" fontSize="9" fill="#533E22">This lesson explains general concepts about how different income is taxed. Actual tax treatment depends</text>
    <text x="70" y="65" fontSize="9" fill="#533E22">on your country's laws, your specific situation, and current regulations. Consult a tax professional for advice.</text>
  </svg>
);

const TaxLesson2 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const handleAnswerSelect = (questionId, answer) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const checkAnswer = (questionId) => {
    setShowResults(prev => ({ ...prev, [questionId]: true }));
  };

  const quizQuestions = [
    {
      id: 'q1',
      question: 'What is the main difference between income tax and investment tax?',
      options: [
        { id: 'a', text: 'Income tax is for individuals, investment tax is for companies' },
        { id: 'b', text: 'Income tax is on money earned by working; investment tax is on money your investments earn' },
        { id: 'c', text: 'Income tax is higher than investment tax in all countries' },
        { id: 'd', text: 'There is no difference — they are the same thing' }
      ],
      correctAnswer: 'b',
      explanation: 'Income tax applies to money you actively earn through work (salary, freelance), while investment tax applies to returns your money earns passively (dividends, capital gains).'
    },
    {
      id: 'q2',
      question: 'Which of these would typically be considered investment income?',
      options: [
        { id: 'a', text: 'Your monthly salary from your employer' },
        { id: 'b', text: 'Payment for a freelance project you completed' },
        { id: 'c', text: 'Dividends received from stocks you own' },
        { id: 'd', text: 'A bonus from your job for good performance' }
      ],
      correctAnswer: 'c',
      explanation: 'Dividends are payments you receive from companies because you own their stock — this is your money earning money for you, which is investment income.'
    }
  ];

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() => navigate('/learn/taxes')}
            className="flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors"
          >
            <span>←</span>
            <span>Back to Tax Basics</span>
          </button>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              Lesson 2
            </span>
            <span className="bg-indigo-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              Awareness Only
            </span>
          </div>
          <h1 className="text-4xl font-display font-normal mb-4 tracking-[-0.015em]">Taxes on Income vs Investments</h1>
          <p className="text-xl text-blue-100">
            Understanding how different types of earnings are taxed differently
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Introduction */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 tracking-[-0.015em]">Not All Money Is Taxed the Same Way</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              When it comes to taxes, where your money comes from matters. Money you earn from your job 
              is treated differently than money your investments earn for you. Understanding this basic 
              difference is the first step to making sense of how taxes work.
            </p>
            <p className="text-gray-600 leading-relaxed">
              In this lesson, we'll explore why governments distinguish between these two types of 
              earnings and what that means for you as someone who works and might also invest.
            </p>
          </div>
        </section>

        {/* Two Types of Earnings */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Two Ways to Earn Money</h2>
          <TwoTypesOfEarningsSVG />
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            <p className="text-gray-600 leading-relaxed">
              Think of it this way: you can either <strong>work for money</strong> (trading your time and 
              skills for pay) or have <strong>money work for you</strong> (letting your savings and 
              investments grow). Both can add to your wealth, but the tax system often treats them 
              as two separate things.
            </p>
          </div>
        </section>

        {/* Income Tax Explained */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">What Is Income Tax?</h2>
          <IncomeTaxExplainedSVG />
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">Income Tax = Tax on Your Work Earnings</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              When you get paid for your job — whether that's a regular salary, hourly wages, freelance 
              payments, or profits from a business you run — that money is generally subject to 
              <strong> income tax</strong>.
            </p>
            <p className="text-gray-600 leading-relaxed">
              This is money you actively earned by trading your time, skills, and effort. You worked 
              for it, and the government takes a portion as tax before (or after) you receive it.
            </p>
          </div>
        </section>

        {/* Investment Tax Explained */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">What Is Investment Tax?</h2>
          <InvestmentTaxExplainedSVG />
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            <h3 className="text-lg font-semibold text-green-700 mb-3">Investment Tax = Tax on What Your Money Earns</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              When you invest money and it grows — through dividends, interest, or selling an investment 
              for more than you paid — that profit is generally subject to <strong>investment taxes</strong> 
              (often called capital gains tax or investment income tax).
            </p>
            <p className="text-gray-600 leading-relaxed">
              This is money you didn't actively work for — your money did the work. You took a risk by 
              investing, and if it paid off, the government wants a share of that gain.
            </p>
          </div>
        </section>

        {/* Why Different */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Why Are They Taxed Differently?</h2>
          <WhyDifferentSVG />
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            <p className="text-gray-600 leading-relaxed">
              Different countries have different reasons and rules, but generally, investment income is 
              often (not always) taxed at different rates than work income. This can be to encourage 
              investing, recognize the risk involved, or promote long-term economic growth. The specific 
              rules vary widely by country and situation.
            </p>
          </div>
        </section>

        {/* Global Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Example: Same Person, Different Taxes</h2>
          <GlobalExampleSVG />
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            <p className="text-gray-600 leading-relaxed">
              In Sam's case, the $75,000 salary is taxed as regular income — Sam worked for every dollar. 
              The $5,000 profit from selling stocks is taxed as a capital gain — Sam's invested money 
              earned that profit. Even though both amounts end up in Sam's pocket, the tax system sees 
              them as coming from different sources.
            </p>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Quick Comparison</h2>
          <ComparisonTableSVG />
        </section>

        {/* Key Takeaway */}
        <section className="mb-12">
          <KeyTakeawaySVG />
        </section>

        {/* India Note */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">India-Specific Context</h2>
          <IndiaNotesSVG />
        </section>

        {/* Quiz Section */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Check Your Understanding</h2>
            
            {quizQuestions.map((q, index) => (
              <div key={q.id} className={`${index > 0 ? 'mt-8 pt-8 border-t border-gray-200' : ''}`}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Question {index + 1}: {q.question}
                </h3>
                <div className="space-y-3">
                  {q.options.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        quizAnswers[q.id] === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      } ${
                        showResults[q.id]
                          ? option.id === q.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : quizAnswers[q.id] === option.id
                            ? 'border-red-500 bg-red-50'
                            : ''
                          : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={option.id}
                        checked={quizAnswers[q.id] === option.id}
                        onChange={() => handleAnswerSelect(q.id, option.id)}
                        disabled={showResults[q.id]}
                        className="mr-3"
                      />
                      <span className="text-gray-700">{option.text}</span>
                    </label>
                  ))}
                </div>
                
                {!showResults[q.id] && quizAnswers[q.id] && (
                  <button
                    onClick={() => checkAnswer(q.id)}
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Check Answer
                  </button>
                )}
                
                {showResults[q.id] && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    quizAnswers[q.id] === q.correctAnswer
                      ? 'bg-green-100 border border-green-300'
                      : 'bg-red-100 border border-red-300'
                  }`}>
                    <p className={`font-semibold ${
                      quizAnswers[q.id] === q.correctAnswer ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {quizAnswers[q.id] === q.correctAnswer ? '✓ Correct!' : '✗ Not quite right'}
                    </p>
                    <p className="text-gray-700 mt-2">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Reflection */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 tracking-[-0.015em]">💭 Reflection Question</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Think about your own financial situation. What types of income do you currently have — 
              mostly from work, or do you also have some investment income (even if it's just interest 
              from a savings account)? How might understanding the difference help you think about taxes 
              when you start (or continue) investing?
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mb-12">
          <DisclaimerBannerSVG />
        </section>

        {/* Navigation */}
        <section className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/tax-lesson-1')}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
          >
            <span>←</span>
            <span>Previous: What Are Taxes?</span>
          </button>
          <button
            onClick={() => navigate('/learn/tax-lesson-3')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            <span>Next: Taxes on Income vs Investments</span>
            <span>→</span>
          </button>
        </section>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default TaxLesson2;
