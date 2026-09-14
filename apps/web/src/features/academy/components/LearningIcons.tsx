/**
 * Professional SVG Icons for Learning Module 1 - Personal Finance
 * 
 * Design System:
 * - Stroke Width: 1.5-2px for consistency
 * - Default Size: 24x24 (w-6 h-6)
 * - Colors: Use currentColor to inherit from parent
 * - Style: Modern, clean, professional EdTech aesthetic
 */

import React from 'react';

// ============================================
// LESSON TOPIC ICONS
// ============================================

/** Lightbulb - Ideas, Key Concepts, Tips */
export const LightbulbIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H15M12 3C8.68629 3 6 5.68629 6 9C6 11.2208 7.2066 13.1599 9 14.1973V17C9 17.5523 9.44772 18 10 18H14C14.5523 18 15 17.5523 15 17V14.1973C16.7934 13.1599 18 11.2208 18 9C18 5.68629 15.3137 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 21V18H14V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Balance Scale - Income vs Expenses, Comparisons */
export const BalanceScaleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3V21M12 3L3 8L6 16H3M12 3L21 8L18 16H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 16C6 16 4.5 16 4.5 14C4.5 12 6 8 6 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 16C18 16 19.5 16 19.5 14C19.5 12 18 8 18 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="3" r="1.5" fill="currentColor"/>
  </svg>
);

/** Chart Bar - Budget, Statistics, Analytics */
export const ChartBarIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="12" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="10" y="8" width="4" height="13" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="17" y="4" width="4" height="17" rx="1" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

/** Piggy Bank - Savings, Emergency Fund */
export const PiggyBankIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 8C20.1046 8 21 8.89543 21 10V11C21 11.5523 20.5523 12 20 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M5 10C5 6.68629 7.68629 4 11 4H13C16.3137 4 19 6.68629 19 10V12C19 15.3137 16.3137 18 13 18H11C7.68629 18 5 15.3137 5 12V10Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 18V20C8 20.5523 8.44772 21 9 21H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 18V20C16 20.5523 15.5523 21 15 21H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="9" cy="10" r="1" fill="currentColor"/>
    <path d="M12 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M2 12C2 12 3 11 5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Bank Building - Banking Basics */
export const BankIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M5 10V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 10V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M15 10V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M19 10V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 3L21 10H3L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Credit Card - Credit, Loans, EMIs */
export const CreditCardIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
    <path d="M6 15H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="17" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

/** Shield - Insurance, Protection */
export const ShieldIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Receipt/Document - Taxes */
export const ReceiptIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4C4 2.89543 4.89543 2 6 2H18C19.1046 2 20 2.89543 20 4V21L17 19L14 21L12 19L10 21L7 19L4 21V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 7H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 15H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Warning Triangle - Mistakes, Caution */
export const WarningIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 9V13M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10.2426 4.34315L2.59259 17.6569C1.71089 19.1249 2.74854 21 4.5 21H19.5C21.2515 21 22.2891 19.1249 21.4074 17.6569L13.7574 4.34315C12.8753 2.87454 11.1247 2.87454 10.2426 4.34315Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ============================================
// UI ELEMENT ICONS
// ============================================

/** Wallet - Earning, Income */
export const WalletIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
    <path d="M6 4C6 2.89543 6.89543 2 8 2H16C17.1046 2 18 2.89543 18 4V6H6V4Z" stroke="currentColor" strokeWidth="2"/>
    <circle cx="17" cy="14" r="2" fill="currentColor"/>
  </svg>
);

/** Shopping Cart - Spending */
export const ShoppingCartIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H5.62563C6.193 4 6.69348 4.36579 6.86038 4.90077L9.5 13M9.5 13L10.4377 16.0992C10.6046 16.6342 11.1051 17 11.6725 17H18.3275C18.8949 17 19.3954 16.6342 19.5623 16.0992L21 11.5H11M9.5 13H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10.5" cy="21" r="1.5" stroke="currentColor" strokeWidth="2"/>
    <circle cx="18.5" cy="21" r="1.5" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

/** Book Open - Real-life Examples, Stories */
export const BookOpenIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 6.04168C10.4467 4.75868 8.41833 4 6.21429 4C4.88558 4 3.62325 4.27778 2.5 4.77618V18.7762C3.62325 18.2778 4.88558 18 6.21429 18C8.41833 18 10.4467 18.7587 12 20.0417" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 6.04168C13.5533 4.75868 15.5817 4 17.7857 4C19.1144 4 20.3768 4.27778 21.5 4.77618V18.7762C20.3768 18.2778 19.1144 18 17.7857 18C15.5817 18 13.5533 18.7587 12 20.0417" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 6V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Brain - Quiz, Thinking */
export const BrainIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4.5C10.5 4.5 9.5 5.5 9.5 7C9.5 7 8 7 7 8C6 9 6 10.5 6 10.5C6 10.5 5 11 5 12.5C5 14 6 15 6 15C6 15 5.5 16 6 17C6.5 18 8 18.5 8 18.5C8 18.5 8 20 10 20.5C11 20.75 12 20.5 12 20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 4.5C13.5 4.5 14.5 5.5 14.5 7C14.5 7 16 7 17 8C18 9 18 10.5 18 10.5C18 10.5 19 11 19 12.5C19 14 18 15 18 15C18 15 18.5 16 18 17C17.5 18 16 18.5 16 18.5C16 18.5 16 20 14 20.5C13 20.75 12 20.5 12 20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 4.5V20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Target - Goals, Objectives */
export const TargetIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
    <path d="M12 3V1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 23V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 12H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M23 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Key - Key Takeaways */
export const KeyIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="15" r="5" stroke="currentColor" strokeWidth="2"/>
    <path d="M11.5 11.5L21 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 5L21 2L21 5L18 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 8L17 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Check Circle - Completion, Success */
export const CheckCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Arrow Right - Navigation, Continue */
export const ArrowRightIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Clock - Time/Duration */
export const ClockIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Trophy - Achievement, Completion */
export const TrophyIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 4H17V8C17 11.3137 14.7614 14 12 14C9.23858 14 7 11.3137 7 8V4Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M17 7H19C20.1046 7 21 7.89543 21 9V9C21 10.6569 19.6569 12 18 12H17" stroke="currentColor" strokeWidth="2"/>
    <path d="M7 7H5C3.89543 7 3 7.89543 3 9V9C3 10.6569 4.34315 12 6 12H7" stroke="currentColor" strokeWidth="2"/>
    <path d="M7 4H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Celebration/Party - Success feedback */
export const CelebrationIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 19.5L11 13L14 16L19.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 4H20V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
    <circle cx="19" cy="16" r="1.5" fill="currentColor"/>
    <circle cx="10" cy="19" r="1.5" fill="currentColor"/>
  </svg>
);

/** Lock - Security, Locked content */
export const LockIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1" fill="currentColor"/>
  </svg>
);

/** Interest/Growth - Returns, Growth */
export const GrowthIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 20L9 14L13 18L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 10H21V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Percent - Rates, Percentages */
export const PercentIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
    <circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Coins Stack - Money, Funds */
export const CoinsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="9" cy="6" rx="6" ry="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M15 9C15 10.6569 12.3137 12 9 12C5.68629 12 3 10.6569 3 9" stroke="currentColor" strokeWidth="2"/>
    <path d="M3 6V15C3 16.6569 5.68629 18 9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M15 6V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="15" cy="15" rx="6" ry="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M9 15V18C9 19.6569 11.6863 21 15 21C18.3137 21 21 19.6569 21 18V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Calculator - Calculations */
export const CalculatorIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
    <rect x="7" y="5" width="10" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
    <circle cx="8" cy="13" r="1" fill="currentColor"/>
    <circle cx="12" cy="13" r="1" fill="currentColor"/>
    <circle cx="16" cy="13" r="1" fill="currentColor"/>
    <circle cx="8" cy="17" r="1" fill="currentColor"/>
    <circle cx="12" cy="17" r="1" fill="currentColor"/>
    <circle cx="16" cy="17" r="1" fill="currentColor"/>
  </svg>
);

/** Document Check - Completed */
export const DocumentCheckIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 15L11 17L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Heart - Needs vs Wants */
export const HeartIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21C12 21 4 15 4 9C4 6.23858 6.23858 4 9 4C10.6569 4 12 5 12 5C12 5 13.3431 4 15 4C17.7614 4 20 6.23858 20 9C20 15 12 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Home - Housing, Needs */
export const HomeIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 10L12 3L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 10V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V10" stroke="currentColor" strokeWidth="2"/>
    <path d="M10 21V15C10 13.8954 10.8954 13 12 13C13.1046 13 14 13.8954 14 15V21" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

/** Search/Research - Analysis */
export const SearchIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
    <path d="M21 21L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Star - Premium, Important */
export const StarIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.9389 8.95492L22.5106 9.42705L16.6606 14.2951L18.5291 21.573L12 17.6L5.47087 21.573L7.33939 14.2951L1.48944 9.42705L9.06107 8.95492L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Lightning Bolt - Key Takeaways, Energy */
export const BoltIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Utilities/Plug - Bills, Electricity */
export const PlugIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 16H16C16 16 18 16 18 14V12H6V14C6 16 8 16 8 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 12V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Groceries/Food - Food expenses */
export const GroceryIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 7H20L18 21H6L4 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7" stroke="currentColor" strokeWidth="2"/>
    <path d="M9 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M15 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Bus/Transport - Transportation */
export const BusIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M4 12H20" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 18V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 18V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="7.5" cy="15" r="1.5" fill="currentColor"/>
    <circle cx="16.5" cy="15" r="1.5" fill="currentColor"/>
    <path d="M8 8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Phone - Mobile, Phone bills */
export const PhoneIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="2" width="12" height="20" rx="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M10 5H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="18" r="1" fill="currentColor"/>
  </svg>
);

/** Entertainment/Film - Movies, Streaming */
export const FilmIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M2 8H22" stroke="currentColor" strokeWidth="2"/>
    <path d="M2 16H22" stroke="currentColor" strokeWidth="2"/>
    <path d="M6 4V8" stroke="currentColor" strokeWidth="2"/>
    <path d="M6 16V20" stroke="currentColor" strokeWidth="2"/>
    <path d="M18 4V8" stroke="currentColor" strokeWidth="2"/>
    <path d="M18 16V20" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

/** Clothing/Shirt - Shopping */
export const ShirtIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 3H8L6 5L2 7L4 11L7 9V21H17V9L20 11L22 7L18 5L16 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 3C10 3 10.5 5 12 5C13.5 5 14 3 14 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Gaming/Controller - Entertainment */
export const GamepadIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="12" rx="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M7 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M5 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="15" cy="10" r="1" fill="currentColor"/>
    <circle cx="17" cy="12" r="1" fill="currentColor"/>
    <circle cx="15" cy="14" r="1" fill="currentColor"/>
    <circle cx="19" cy="12" r="1" fill="currentColor"/>
  </svg>
);

/** Pizza/Food - Food delivery */
export const PizzaIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="14" r="1.5" fill="currentColor"/>
    <circle cx="14" cy="16" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="10" r="1.5" fill="currentColor"/>
  </svg>
);

/** Car - Auto expenses, Insurance */
export const CarIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 10L6.5 5H17.5L19 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="3" y="10" width="18" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M5 17H3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M19 17H21V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Money/Dollar - Income, Currency */
export const DollarIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M15 9C15 9 14 8 12 8C10 8 9 9.5 9 10.5C9 11.5 10 12.5 12 12.5C14 12.5 15 13.5 15 14.5C15 15.5 14 17 12 17C10 17 9 16 9 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Invest/Trending Up - Investment */
export const InvestIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 7H21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Medical/Health - Health insurance */
export const MedicalIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Pencil - Quiz, Writing, Edit */
export const PencilIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.862 4.487L18.549 2.799C19.1348 2.21321 20.0846 2.21321 20.6704 2.799L21.2014 3.33C21.7872 3.91579 21.7872 4.86554 21.2014 5.45133L7.58579 19.067C7.21071 19.4421 6.74048 19.7052 6.226 19.8274L2 21L3.17262 16.774C3.29481 16.2595 3.55786 15.7893 3.93299 15.4142L16.862 4.487Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 7L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Clipboard - Activity, Tasks, Checklist */
export const ClipboardIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V7C20 5.89543 19.1046 5 18 5H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <rect x="8" y="2" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 16H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Globe - Global, International */
export const GlobeIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M3.6 9H20.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3.6 15H20.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 3.6V20.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M6.343 6.343A9 9 0 0117.657 17.657" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M17.657 6.343A9 9 0 016.343 17.657" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Flag - Achievement, Country */
export const FlagIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 21V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 14L8 10L12 14L16 10L20 14V4L16 8L12 4L8 8L4 4V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Folder - Organization, Categories */
export const FolderIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H12L10 5H5C3.89543 5 3 5.89543 3 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Rocket - Growth, Launch */
export const RocketIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 16.5L12 9L19.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 9V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8.5 12.5L12 9L15.5 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2C10.8954 2 10 2.89543 10 4V5C10 6.10457 10.8954 7 12 7C13.1046 7 14 6.10457 14 5V4C14 2.89543 13.1046 2 12 2Z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

/** SIP - Systematic Investment Plan */
export const SIPIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V6M12 6L8 10M12 6L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12H6M6 12V8M6 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 12H22M18 12V8M18 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 18V22M12 18L8 14M12 18L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Lump Sum - One-time Investment */
export const LumpSumIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Compare - Comparison, Analysis */
export const CompareIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 12L7 10L9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 12L17 10L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Checkmark - Success, Correct */
export const CheckmarkIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Risk - Risk Assessment */
export const RiskIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 9V11M12 15H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10.2426 4.34315L2.59259 17.6569C1.71089 19.1249 2.74854 21 4.5 21H19.5C21.2515 21 22.2891 19.1249 21.4074 17.6569L13.7574 4.34315C12.8753 2.87454 11.1247 2.87454 10.2426 4.34315Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Cross - Incorrect, Remove */
export const CrossIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Running - Activity, Movement */
export const RunningIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 7L11 11L15 15L19 11L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="6" cy="19" r="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M6 19V15C6 13.8954 6.89543 13 8 13H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Stop - Halt, Pause */
export const StopIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <rect x="8" y="8" width="8" height="8" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

/** Stopwatch - Time Tracking */
export const StopwatchIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 2H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Listen - Audio, Hearing */
export const ListenIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1C8.13401 1 5 4.13401 5 8V12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12V8C19 4.13401 15.866 1 12 1Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 19V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 23H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9.5 6.5C10.3284 6.5 11 7.17157 11 8V10C11 10.8284 10.3284 11.5 9.5 11.5C8.67157 11.5 8 10.8284 8 10V8C8 7.17157 8.67157 6.5 9.5 6.5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M14.5 6.5C15.3284 6.5 16 7.17157 16 8V10C16 10.8284 15.3284 11.5 14.5 11.5C13.6716 11.5 13 10.8284 13 10V8C13 7.17157 13.6716 6.5 14.5 6.5Z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

/** Market Down - Decline, Loss */
export const MarketDownIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7L9 13L15 9L21 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 7V15H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Market Up - Growth, Profit */
export const MarketUpIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17L9 11L15 15L21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 17V9H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Panic - Fear, Anxiety */
export const PanicIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
    <circle cx="15" cy="9" r="1.5" fill="currentColor"/>
    <path d="M9 15C9.5 14 10.5 13.5 12 13.5C13.5 13.5 14.5 14 15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 7V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/** Users - Community, Team */
export const UsersIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="16" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

// ============================================
// EXPORT ALL ICONS AS OBJECT
// ============================================

export const LearningIcons = {
  Lightbulb: LightbulbIcon,
  BalanceScale: BalanceScaleIcon,
  ChartBar: ChartBarIcon,
  PiggyBank: PiggyBankIcon,
  Bank: BankIcon,
  CreditCard: CreditCardIcon,
  Shield: ShieldIcon,
  Receipt: ReceiptIcon,
  Warning: WarningIcon,
  Wallet: WalletIcon,
  ShoppingCart: ShoppingCartIcon,
  BookOpen: BookOpenIcon,
  Brain: BrainIcon,
  Target: TargetIcon,
  Key: KeyIcon,
  CheckCircle: CheckCircleIcon,
  ArrowRight: ArrowRightIcon,
  Clock: ClockIcon,
  Trophy: TrophyIcon,
  Celebration: CelebrationIcon,
  Lock: LockIcon,
  Growth: GrowthIcon,
  Percent: PercentIcon,
  Coins: CoinsIcon,
  Calculator: CalculatorIcon,
  DocumentCheck: DocumentCheckIcon,
  Heart: HeartIcon,
  Home: HomeIcon,
  Search: SearchIcon,
  Star: StarIcon,
  Bolt: BoltIcon,
  Plug: PlugIcon,
  Grocery: GroceryIcon,
  Bus: BusIcon,
  Phone: PhoneIcon,
  Film: FilmIcon,
  Shirt: ShirtIcon,
  Gamepad: GamepadIcon,
  Pizza: PizzaIcon,
  Car: CarIcon,
  Dollar: DollarIcon,
  Invest: InvestIcon,
  Medical: MedicalIcon,
  Pencil: PencilIcon,
  Clipboard: ClipboardIcon,
  Globe: GlobeIcon,
  Flag: FlagIcon,
  Folder: FolderIcon,
  Rocket: RocketIcon,
  SIP: SIPIcon,
  LumpSum: LumpSumIcon,
  Compare: CompareIcon,
  Checkmark: CheckmarkIcon,
  Risk: RiskIcon,
  Cross: CrossIcon,
  Running: RunningIcon,
  Stop: StopIcon,
  Stopwatch: StopwatchIcon,
  Listen: ListenIcon,
  MarketDown: MarketDownIcon,
  MarketUp: MarketUpIcon,
  Panic: PanicIcon,
  Users: UsersIcon,
};

export default LearningIcons;
