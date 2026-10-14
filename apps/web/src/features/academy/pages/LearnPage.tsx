import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaBookOpen, FaCheckCircle, FaPlayCircle, FaArrowRight, FaGraduationCap, FaChartLine, FaCertificate, FaUsers, FaCrown, FaBell, FaLock } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";
import SignInModal from "../../../components/SignInModal";
import { DIFFICULTY_LEVELS, MODULES_CONFIG } from "../../../constants/learningModules";
import progressService from "../../../services/progressService";
import learnPlanService from "../services/learnPlanService";
import {
  isLearnPro,
  subscribeLearnPlan,
  learnCatalogueStats,
  learnPricing,
  formatLearnPrice,
  FREE_PREVIEW_LESSONS,
} from "../../../lib/learnPlan";
import LearnTour from "../components/LearnTour";
import LearnUpgradeModal from "../components/LearnUpgradeModal";
import LearnProCelebration from "../components/LearnProCelebration";
import useRegion from "../../../hooks/useRegion";
import { PREMIUM_COURSES, watchPath } from "../data/premiumCourseVideos";
import newsletterService from "../../../services/newsletterService";


// Route prefixes differ from module ids for a few modules (see App.jsx routes).
const ROUTE_PREFIX_OVERRIDES = {
  'algorithmic-trading': 'algo-trading',
  'risk-management': 'risk',
  'long-term-investing': 'lti',
  'portfolio-construction': 'pc',
  'taxes': 'tax',
};

/** Path of lesson N inside a module ("continue where you left off"). */
const lessonPath = (moduleSlug, n) => {
  if (moduleSlug === 'personal-finance' && n === 1) return '/learn/personal-finance-basics';
  // Derivatives' overview links the 12-lesson /learn/derivatives/lesson-N set
  // (the older /learn/deriv-lesson-N pages stop at 7).
  if (moduleSlug === 'derivatives') return `/learn/derivatives/lesson-${n}`;
  const prefix = ROUTE_PREFIX_OVERRIDES[moduleSlug] || moduleSlug;
  return `/learn/${prefix}-lesson-${n}`;
};

const DIFFICULTY_ORDER = [
  DIFFICULTY_LEVELS.BEGINNER,
  DIFFICULTY_LEVELS.INTERMEDIATE,
  DIFFICULTY_LEVELS.ADVANCED,
];
const DIFFICULTY_LABELS = {
  [DIFFICULTY_LEVELS.BEGINNER]: 'Beginner',
  [DIFFICULTY_LEVELS.INTERMEDIATE]: 'Intermediate',
  [DIFFICULTY_LEVELS.ADVANCED]: 'Advanced',
};
const DIFFICULTY_BAR = {
  [DIFFICULTY_LEVELS.BEGINNER]: { text: 'text-green-600', bar: 'from-green-500 to-emerald-400' },
  [DIFFICULTY_LEVELS.INTERMEDIATE]: { text: 'text-blue-600', bar: 'from-blue-500 to-indigo-400' },
  [DIFFICULTY_LEVELS.ADVANCED]: { text: 'text-purple-600', bar: 'from-purple-500 to-pink-400' },
};

// SVG Background Components
const FinanceGraphSVG = () => (
  <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 opacity-10" viewBox="0 0 400 400" fill="none">
    {/* Growth line */}
    <path d="M50 320 L100 280 L150 290 L200 220 L250 200 L300 140 L350 80" stroke="currentColor" strokeWidth="3" className="text-green-600" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="350" cy="80" r="8" className="fill-green-600" />
    {/* Pie chart */}
    <circle cx="320" cy="280" r="50" className="fill-green-500/10 stroke-green-600" strokeWidth="2" />
    <path d="M320 280 L320 230 A50 50 0 0 1 360 260 Z" className="fill-green-500/30" />
    <path d="M320 280 L360 260 A50 50 0 0 1 340 325 Z" className="fill-blue-500/30" />
    {/* Bar chart */}
    <rect x="60" y="280" width="20" height="60" rx="4" className="fill-green-500/30" />
    <rect x="90" y="250" width="20" height="90" rx="4" className="fill-blue-500/30" />
    <rect x="120" y="220" width="20" height="120" rx="4" className="fill-green-500/40" />
    <rect x="150" y="260" width="20" height="80" rx="4" className="fill-emerald-500/30" />
    {/* Currency symbols */}
    <text x="200" y="320" className="fill-green-600/20" fontSize="40" fontWeight="bold">₹</text>
    <text x="260" y="350" className="fill-blue-600/15" fontSize="30" fontWeight="bold">$</text>
  </svg>
);

const FloatingShapesSVG = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Floating circles */}
    <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/5 rounded-full blur-2xl animate-pulse"></div>
    <div className="absolute top-40 right-20 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-green-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>

    {/* Grid pattern */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" className="text-gray-900" />
    </svg>
  </div>
);

const HeroDecorSVG = () => (
  <svg className="absolute left-0 top-0 w-full h-full pointer-events-none" viewBox="0 0 1200 600" fill="none" preserveAspectRatio="xMidYMid slice">
    {/* Gradient definitions */}
    <defs>
      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1FA978" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#1FA978" stopOpacity="0.05" />
      </linearGradient>
      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1FA978" stopOpacity="0" />
        <stop offset="50%" stopColor="#1FA978" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#1FA978" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Abstract shapes */}
    <circle cx="100" cy="100" r="200" fill="url(#greenGradient)" />
    <circle cx="1100" cy="500" r="250" fill="url(#greenGradient)" />

    {/* Decorative lines */}
    <path d="M0 400 Q300 350 600 400 T1200 350" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />
    <path d="M0 450 Q300 400 600 450 T1200 400" stroke="url(#lineGradient)" strokeWidth="1" fill="none" />
  </svg>
);

const WalletSVG = ({ className }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <rect x="8" y="16" width="48" height="36" rx="6" className="fill-green-500/20 stroke-green-600" strokeWidth="2" />
    <path d="M8 28H56" className="stroke-green-600" strokeWidth="2" />
    <circle cx="44" cy="38" r="4" className="fill-green-600" />
    <rect x="12" y="8" width="32" height="8" rx="2" className="fill-green-500/10 stroke-green-600" strokeWidth="2" />
  </svg>
);

const PiggyBankSVG = ({ className }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <ellipse cx="32" cy="36" rx="20" ry="16" className="fill-blue-500/20 stroke-blue-600" strokeWidth="2" />
    <circle cx="40" cy="32" r="2" className="fill-blue-600" />
    <path d="M24 24 Q28 20 32 24" className="stroke-blue-600" strokeWidth="2" fill="none" strokeLinecap="round" />
    <rect x="28" y="18" width="8" height="6" rx="2" className="fill-amber-500/30 stroke-amber-600" strokeWidth="1.5" />
    <path d="M16 40 L12 48" className="stroke-blue-600" strokeWidth="2" strokeLinecap="round" />
    <path d="M48 40 L52 48" className="stroke-blue-600" strokeWidth="2" strokeLinecap="round" />
    <path d="M52 32 L56 28" className="stroke-blue-600" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CertificateSVG = ({ className }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <rect x="8" y="8" width="48" height="36" rx="4" className="fill-amber-500/10 stroke-amber-600" strokeWidth="2" />
    <circle cx="32" cy="26" r="8" className="fill-amber-500/20 stroke-amber-600" strokeWidth="2" />
    <path d="M28 48L32 44L36 48L36 56L32 52L28 56V48Z" className="fill-amber-500/30 stroke-amber-600" strokeWidth="2" />
    <path d="M16 14H48" className="stroke-amber-600/30" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Module total lessons mapping (kept for backward compatibility)
const MODULE_LESSONS = {
  'personal-finance': 9,
  'emergency-fund': 15,
  'money-mindset': 15,
  'financial-planning': 15,
  'stock-market': 7,
  'trading-basics': 7,
  'technical-analysis': 7,
  'insurance': 7,
  'retirement-planning': 7,
  'algorithmic-trading': 9,
  'risk-management': 7,
  'long-term-investing': 7,
  'portfolio-construction': 12,
  'derivatives': 12,
  'taxes': 6,
  'debt-management': 15,
  'real-estate': 10,
  'estate-planning': 12,
  'crypto': 15,
};

// Module Icon Components
const ModuleIcons = {
  wallet: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="8" width="24" height="18" rx="3" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <path d="M4 14H28" className="stroke-current" strokeWidth="2" />
      <circle cx="22" cy="20" r="2" className="fill-current" />
      <rect x="8" y="4" width="12" height="4" rx="1" className="fill-current opacity-30 stroke-current" strokeWidth="1.5" />
    </svg>
  ),
  'chart-pie': ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="10" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <path d="M16 6V16L24 10" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="10" r="4" className="fill-current opacity-30 stroke-current" strokeWidth="1.5" />
    </svg>
  ),
  'chart-line': ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="6" width="24" height="20" rx="2" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <path d="M8 20L12 14L16 17L20 10L24 13" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="14" r="2" className="fill-current" />
      <circle cx="20" cy="10" r="2" className="fill-current" />
    </svg>
  ),
  'trending-up': ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="6" width="24" height="20" rx="2" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <path d="M8 18L12 14L16 16L24 10" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 10H24V14" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chart: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="6" width="24" height="20" rx="2" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <path d="M8 20L12 16L16 18L20 12L24 14" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" y1="10" x2="8" y2="22" className="stroke-current opacity-50" strokeWidth="1.5" />
      <line x1="8" y1="22" x2="24" y2="22" className="stroke-current opacity-50" strokeWidth="1.5" />
    </svg>
  ),
  shield: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <path d="M16 4L26 8V14C26 20 22 25 16 28C10 25 6 20 6 14V8L16 4Z" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <text x="16" y="18" textAnchor="middle" className="fill-current" fontSize="10" fontWeight="bold">$</text>
    </svg>
  ),
  growth: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <path d="M8 24V20L12 18L16 14L20 10L24 8" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="8" r="3" className="fill-current opacity-30 stroke-current" strokeWidth="1.5" />
      <path d="M6 28H26" className="stroke-current opacity-50" strokeWidth="1.5" />
    </svg>
  ),
  document: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect x="6" y="4" width="20" height="24" rx="2" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <path d="M10 10H22M10 14H18M10 18H22M10 22H16" className="stroke-current" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  'credit-card': ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="8" width="24" height="16" rx="3" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <path d="M4 14H28" className="stroke-current" strokeWidth="2" />
      <path d="M8 20H14" className="stroke-current" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="22" cy="20" r="2" className="fill-current opacity-70" />
    </svg>
  ),
  map: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <path d="M5 8L12 5L20 8L27 5V24L20 27L12 24L5 27V8Z" className="fill-current opacity-20 stroke-current" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 5V24M20 8V27" className="stroke-current opacity-60" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 16C11 13 14 13 16 16C18 19 21 19 23 16" className="stroke-current" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="23" cy="16" r="2" className="fill-current" />
    </svg>
  ),
  code: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="8" width="24" height="16" rx="2" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <circle cx="10" cy="16" r="3" className="fill-current opacity-30 stroke-current" strokeWidth="1.5" />
      <circle cx="22" cy="16" r="3" className="fill-current opacity-30 stroke-current" strokeWidth="1.5" />
      <path d="M13 16H19" className="stroke-current opacity-50" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 13L17 16L15 19" className="stroke-current" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'pie-chart': ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <path d="M16 4 A12 12 0 0 1 28 16 L16 16 Z" className="fill-current" />
      <path d="M28 16 A12 12 0 0 1 16 28 L16 16 Z" className="fill-current opacity-70" />
      <path d="M16 28 A12 12 0 0 1 4 16 L16 16 Z" className="fill-current opacity-40" />
      <circle cx="16" cy="16" r="4" className="fill-white" />
    </svg>
  ),
  warning: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <path d="M16 4L28 26H4L16 4Z" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <path d="M16 12V18" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="22" r="1.5" className="fill-current" />
    </svg>
  ),
  clock: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="14" r="8" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <path d="M12 28H20L18 20H14L12 28Z" className="fill-current opacity-30 stroke-current" strokeWidth="1.5" />
      <path d="M16 10V14L18 16" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  'shield-check': ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <path d="M16 4L26 8V14C26 20 22 25 16 28C10 25 6 20 6 14V8L16 4Z" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <path d="M12 16L15 19L20 13" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  heart: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <path d="M16 27C13 24 7 19 7 12.5C7 9.5 9.4 7 12.4 7C14 7 15.2 7.7 16 8.9C16.8 7.7 18 7 19.6 7C22.6 7 25 9.5 25 12.5C25 19 19 24 16 27Z" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <path d="M12 16H14L15.5 12L17.5 20L19 16H21" className="stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  home: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <path d="M4 28V14L16 4L28 14V28H4Z" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <rect x="12" y="18" width="8" height="10" className="fill-current opacity-30 stroke-current" strokeWidth="1.5" />
      <rect x="8" y="12" width="4" height="4" rx="0.5" className="fill-current opacity-40 stroke-current" strokeWidth="1" />
      <rect x="20" y="12" width="4" height="4" rx="0.5" className="fill-current opacity-40 stroke-current" strokeWidth="1" />
    </svg>
  ),
  bitcoin: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <path d="M12 12H18C19.5 12 21 13 21 14.5C21 16 19.5 17 18 17H12V12Z" className="fill-current opacity-40 stroke-current" strokeWidth="1.5" />
      <path d="M12 17H19C20.5 17 22 18 22 19.5C22 21 20.5 22 19 22H12V17Z" className="fill-current opacity-40 stroke-current" strokeWidth="1.5" />
      <path d="M14 10V12M14 22V24M18 10V12M18 22V24" className="stroke-current" strokeWidth="1.5" />
    </svg>
  )
};

const LearnPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifySaved, setNotifySaved] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [pendingModulePath, setPendingModulePath] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    () => localStorage.getItem('xtin_learn_difficulty') || DIFFICULTY_LEVELS.BEGINNER
  );
  const [progress, setProgress] = useState<Record<string, { lesson_slug: string; completed_at: string }[]> | null>(null); // { [module_slug]: [{lesson_slug, completed_at}] }
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [, setPlanTick] = useState(0);
  useRegion(); // re-render when the region resolves so pricing stays correct
  const pro = isLearnPro();
  const pricing = learnPricing();
  const catalogue = learnCatalogueStats();

  // Persist the chosen level so returning learners land where they were.
  useEffect(() => {
    localStorage.setItem('xtin_learn_difficulty', selectedDifficulty);
  }, [selectedDifficulty]);

  // Real progress + authoritative plan, once signed in. Both fail quietly.
  useEffect(() => {
    if (!user) return;
    progressService.getUserProgress().then(setProgress).catch(() => setProgress(null));
    learnPlanService.syncPlan();
  }, [user]);

  // Re-render when the plan changes (upgrade completes anywhere in the app).
  useEffect(() => {
    const unsub = subscribeLearnPlan(() => setPlanTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  /* ---- derived progress ---- */
  const completedCount = (moduleId) => (progress?.[moduleId]?.length || 0);

  const levelProgress = useMemo(() => {
    return DIFFICULTY_ORDER.map((level) => {
      const mods = MODULES_CONFIG.filter((m) => m.difficulty === level);
      const total = mods.reduce((s, m) => s + (m.lessons || 0), 0);
      const done = mods.reduce((s, m) => s + Math.min(completedCount(m.id), m.lessons || 0), 0);
      return { level, label: DIFFICULTY_LABELS[level], total, done, pct: total ? Math.round((done / total) * 100) : 0 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const totalDone = levelProgress.reduce((s, l) => s + l.done, 0);

  // "Continue where you left off" — most recent completion → its next lesson.
  const continueTarget = useMemo(() => {
    if (!progress) return null;
    let latest = null;
    Object.entries(progress).forEach(([moduleSlug, lessons]) => {
      (lessons || []).forEach((l) => {
        if (!latest || new Date(l.completed_at) > new Date(latest.completed_at)) {
          latest = { moduleSlug, ...l };
        }
      });
    });
    if (!latest) return null;
    const mod = MODULES_CONFIG.find((m) => m.id === latest.moduleSlug);
    if (!mod) return null;
    const lastN = parseInt(String(latest.lesson_slug).replace('lesson-', ''), 10) || 1;
    const nextN = Math.min(lastN + 1, mod.lessons || lastN);
    const finished = completedCount(mod.id) >= (mod.lessons || 0);
    return {
      module: mod,
      nextLesson: nextN,
      path: lessonPath(mod.id, nextN),
      finished,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const handleProActivated = () => {
    setShowUpgrade(false);
    setCelebrating(true);
  };

  // Get filtered modules based on selected difficulty
  const filteredModules = MODULES_CONFIG.filter(
    module => module.difficulty === selectedDifficulty
  );

  // Get color classes based on module color
  const getColorClasses = (color) => {
    const colors = {
      green: {
        gradient: 'from-green-500 to-emerald-500',
        bg: 'from-green-50 to-emerald-100',
        border: 'border-emerald-200 hover:border-emerald-300',
        text: 'text-green-600',
        hoverText: 'group-hover:text-green-600',
        badge: 'bg-green-100 text-green-700',
        tagBg: 'bg-green-50 text-green-600'
      },
      blue: {
        gradient: 'from-blue-500 to-cyan-500',
        bg: 'from-blue-50 to-cyan-100',
        border: 'border-blue-200 hover:border-blue-300',
        text: 'text-blue-600',
        hoverText: 'group-hover:text-blue-600',
        badge: 'bg-blue-100 text-blue-700',
        tagBg: 'bg-blue-50 text-blue-600'
      },
      indigo: {
        gradient: 'from-indigo-500 to-purple-500',
        bg: 'from-indigo-50 to-purple-100',
        border: 'border-indigo-200 hover:border-indigo-300',
        text: 'text-indigo-600',
        hoverText: 'group-hover:text-indigo-600',
        badge: 'bg-indigo-100 text-indigo-700',
        tagBg: 'bg-indigo-50 text-indigo-600'
      },
      amber: {
        gradient: 'from-amber-500 to-orange-500',
        bg: 'from-amber-50 to-orange-100',
        border: 'border-amber-200 hover:border-amber-300',
        text: 'text-amber-600',
        hoverText: 'group-hover:text-amber-600',
        badge: 'bg-amber-100 text-amber-700',
        tagBg: 'bg-amber-50 text-amber-600'
      },
      emerald: {
        gradient: 'from-emerald-500 to-teal-500',
        bg: 'from-emerald-50 to-teal-100',
        border: 'border-emerald-200 hover:border-emerald-300',
        text: 'text-emerald-600',
        hoverText: 'group-hover:text-emerald-600',
        badge: 'bg-emerald-100 text-emerald-700',
        tagBg: 'bg-emerald-50 text-emerald-600'
      },
      teal: {
        gradient: 'from-teal-500 to-emerald-500',
        bg: 'from-teal-50 to-emerald-100',
        border: 'border-teal-200 hover:border-teal-300',
        text: 'text-teal-600',
        hoverText: 'group-hover:text-teal-600',
        badge: 'bg-teal-100 text-teal-700',
        tagBg: 'bg-teal-50 text-teal-600'
      },
      rose: {
        gradient: 'from-rose-400 to-pink-400',
        bg: 'from-rose-50 to-pink-100',
        border: 'border-rose-200 hover:border-rose-300',
        text: 'text-rose-600',
        hoverText: 'group-hover:text-rose-600',
        badge: 'bg-rose-100 text-rose-700',
        tagBg: 'bg-rose-50 text-rose-600'
      },
      yellow: {
        gradient: 'from-yellow-400 to-amber-400',
        bg: 'from-yellow-50 to-amber-100',
        border: 'border-yellow-200 hover:border-yellow-300',
        text: 'text-yellow-600',
        hoverText: 'group-hover:text-yellow-600',
        badge: 'bg-yellow-100 text-yellow-700',
        tagBg: 'bg-yellow-50 text-yellow-600'
      }
    };
    return colors[color] || colors.green;
  };

  // Handle module click — sign-in first, then straight into the module.
  const handleModuleAccess = (modulePath) => {
    if (!user) {
      setPendingModulePath(modulePath);
      sessionStorage.setItem('returnUrl', modulePath);
      setShowSignInModal(true);
    } else {
      navigate(modulePath);
    }
  };

  // Handle successful sign-in from modal
  const handleSignInSuccess = () => {
    setShowSignInModal(false);
    if (pendingModulePath) {
      navigate(pendingModulePath);
      setPendingModulePath(null);
      sessionStorage.removeItem('returnUrl');
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowSignInModal(false);
    setPendingModulePath(null);
    sessionStorage.removeItem('returnUrl');
  };

  // Honest numbers, computed from the actual catalogue.
  const stats = [
    { icon: FaGraduationCap, value: `${catalogue.totalModules}`, label: "Complete Courses", color: "text-primary dark:text-success", bg: "bg-primary/10" },
    { icon: FaBookOpen, value: `${catalogue.totalLessons}+`, label: "Bite-size Lessons", color: "text-primary dark:text-success", bg: "bg-primary/10" },
    { icon: FaUsers, value: "2,500+", label: "Learners Enrolled", color: "text-primary dark:text-success", bg: "bg-primary/10" },
    { icon: FaCertificate, value: `${catalogue.freeModules}`, label: "Courses Free Forever", color: "text-primary dark:text-success", bg: "bg-primary/10" },
  ];

  return (
    <div className="bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Premium Hero Section */}
      <section className="relative py-24 px-6 md:px-12 lg:px-24 mt-16 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-green-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/30">
        <HeroDecorSVG />
        <FloatingShapesSVG />
        <FinanceGraphSVG />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-emerald-900/30 text-green-700 dark:text-emerald-300 rounded-full text-sm font-semibold mb-6 border border-transparent dark:border-emerald-700/40">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
                </span>
                XTIN ACADEMY
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-normal leading-tight mb-6 tracking-[-0.015em]">
                Build Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-700">
                  Financial Future
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 dark:text-slate-300 max-w-xl leading-relaxed mb-8">
                Comprehensive finance courses covering investing, budgeting, wealth building, and market analysis. Master money management with expert-led programs.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 flex items-center gap-2"
                >
                  {totalDone > 0 ? 'Continue Learning' : 'Start Learning Free'}
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                {pro ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/30 text-amber-700 dark:text-amber-300 rounded-xl text-sm font-bold">
                    <FaCrown /> Academy Pro
                  </span>
                ) : (
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="px-5 py-4 text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-emerald-300 transition-colors flex items-center gap-2"
                  >
                    <FaCrown className="text-amber-500" />
                    Go Pro  {formatLearnPrice(pricing.yearly, pricing)}/yr
                  </button>
                )}
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Main card — REAL progress, not decoration */}
                <div data-learn-tour="hero-journey" className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-black/40 p-8 border border-gray-100 dark:border-slate-700">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl opacity-20 blur-xl"></div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center">
                      <FaGraduationCap className="text-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-slate-100">Your Finance Journey</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {totalDone > 0
                          ? `${totalDone} lesson${totalDone === 1 ? '' : 's'} completed — keep going!`
                          : 'Finish your first lesson to light this up'}
                      </p>
                    </div>
                  </div>

                  {/* Real per-level progress bars */}
                  <div className="space-y-4">
                    {levelProgress.map(({ level, label, done, total, pct }) => (
                      <div key={level}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-slate-300">{label}</span>
                          <span className={`font-semibold ${DIFFICULTY_BAR[level].text}`}>
                            {done}/{total} · {pct}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${DIFFICULTY_BAR[level].bar} rounded-full transition-all duration-700`}
                            style={{ width: `${Math.max(pct, done > 0 ? 4 : 0)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Continue chip */}
                  {continueTarget && !continueTarget.finished && (
                    <button
                      onClick={() => navigate(continueTarget.path)}
                      className="mt-6 w-full flex items-center justify-between px-4 py-3 bg-green-50 dark:bg-emerald-900/30 hover:bg-green-100 dark:hover:bg-emerald-900/50 rounded-xl transition-colors group/cont"
                    >
                      <span className="text-sm font-semibold text-green-700 dark:text-emerald-300 text-left">
                        Continue: {continueTarget.module.title} — Lesson {continueTarget.nextLesson}
                      </span>
                      <FaPlayCircle className="text-green-600 group-hover/cont:scale-110 transition-transform" />
                    </button>
                  )}
                </div>

                {/* Floating badges */}
                <div className="absolute -left-12 top-1/4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-gray-100 dark:border-slate-700 animate-bounce" style={{ animationDuration: '3s' }}>
                  <WalletSVG className="w-12 h-12" />
                </div>

                <div className="absolute -right-12 top-1/4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-gray-100 dark:border-slate-700 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                  <PiggyBankSVG className="w-12 h-12" />
                </div>

                <div className="absolute right-1/4 -top-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-gray-100 dark:border-slate-700 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
                  <CertificateSVG className="w-12 h-12" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 md:px-12 lg:px-24 bg-white dark:bg-slate-950 border-y border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-14 h-14 ${stat.bg} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`text-2xl ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Modules - Compact Grid */}
      <section id="modules" className="py-20 px-6 md:px-12 lg:px-24 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="moduleGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="#1FA978" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#moduleGrid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-semibold mb-4 border border-transparent dark:border-emerald-700/40">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              THE LIBRARY · {catalogue.freeModules} COURSES FREE FOREVER
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-normal text-gray-900 dark:text-slate-100 mb-4 tracking-[-0.015em]">
              Your Learning Journey
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
              Choose your skill level and explore modules tailored for you. Each module builds on the previous one.
            </p>
          </div>

          {/* Difficulty Level Switcher */}
          <div className="flex justify-center mb-12">
            <div data-learn-tour="difficulty-switcher" className="inline-flex max-w-full bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-slate-700">
              <button
                onClick={() => setSelectedDifficulty(DIFFICULTY_LEVELS.BEGINNER)}
                className={`px-2.5 sm:px-6 py-2.5 sm:py-3 whitespace-nowrap rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 flex items-center gap-1.5 sm:gap-2 ${selectedDifficulty === DIFFICULTY_LEVELS.BEGINNER
                  ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-md shadow-green-500/30'
                  : 'text-gray-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-emerald-300 hover:bg-green-50 dark:hover:bg-emerald-900/30'
                  }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3L4 9v12h16V9l-8-6z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 21V12h6v9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Beginner
              </button>
              <button
                onClick={() => setSelectedDifficulty(DIFFICULTY_LEVELS.INTERMEDIATE)}
                className={`px-2.5 sm:px-6 py-2.5 sm:py-3 whitespace-nowrap rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 flex items-center gap-1.5 sm:gap-2 ${selectedDifficulty === DIFFICULTY_LEVELS.INTERMEDIATE
                  ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-md shadow-blue-500/30'
                  : 'text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                  }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h4l3-9 4 18 3-9h4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Intermediate
              </button>
              <button
                onClick={() => setSelectedDifficulty(DIFFICULTY_LEVELS.ADVANCED)}
                className={`px-2.5 sm:px-6 py-2.5 sm:py-3 whitespace-nowrap rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 flex items-center gap-1.5 sm:gap-2 ${selectedDifficulty === DIFFICULTY_LEVELS.ADVANCED
                  ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-md shadow-purple-500/30'
                  : 'text-gray-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                  }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Advanced
              </button>
            </div>
          </div>

          {/* Difficulty Level Description */}
          <div className="text-center mb-10">
            {selectedDifficulty === DIFFICULTY_LEVELS.BEGINNER && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-emerald-900/30 text-green-700 dark:text-emerald-300 rounded-full text-sm border border-transparent dark:border-emerald-700/40">
                <FaGraduationCap />
                <span>Perfect for those starting their financial journey. Learn the fundamentals.</span>
              </div>
            )}
            {selectedDifficulty === DIFFICULTY_LEVELS.INTERMEDIATE && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm border border-transparent dark:border-blue-700/40">
                <FaChartLine />
                <span>Build on your basics. Dive deeper into strategies and analysis.</span>
              </div>
            )}
            {selectedDifficulty === DIFFICULTY_LEVELS.ADVANCED && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm border border-transparent dark:border-purple-700/40">
                <FaCertificate />
                <span>Master complex topics. For experienced investors ready to level up.</span>
              </div>
            )}
          </div>

          {/* Module Cards Grid - Dynamically Filtered */}
          <div data-learn-tour="module-grid" className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModules.map((module, index) => {
              const colors = getColorClasses(module.color);
              const IconComponent = ModuleIcons[module.icon];
              const done = Math.min(completedCount(module.id), module.lessons || 0);
              const pct = module.lessons ? Math.round((done / module.lessons) * 100) : 0;
              const finished = module.lessons > 0 && done >= module.lessons;
              const isBeginner = module.difficulty === DIFFICULTY_LEVELS.BEGINNER;
              const showsProPill = !isBeginner && !pro;

              return (
                <div
                  key={module.id}
                  onClick={() => module.available && module.path && handleModuleAccess(module.path)}
                  className={`group bg-white dark:bg-slate-900 rounded-2xl p-6 border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col ${module.available ? `cursor-pointer ${colors.border}` : 'opacity-75 cursor-not-allowed border-gray-100 dark:border-slate-700'
                    }`}
                >
                  {/* Gradient accent */}
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors.gradient}`}></div>

                  {/* Icon + completion mark */}
                  <div className="flex items-start justify-between">
                    <div className={`w-14 h-14 bg-gradient-to-br ${colors.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      {IconComponent && <IconComponent className={`w-7 h-7 ${colors.text}`} />}
                    </div>
                    {finished && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-emerald-900/40 text-green-700 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                        <FaCheckCircle /> DONE
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-0.5 ${colors.badge} text-xs font-semibold rounded`}>
                      MODULE {index + 1}
                    </span>
                    {module.lessons > 0 && (
                      <>
                        <span className="text-xs text-gray-400 dark:text-slate-500">•</span>
                        <span className="text-xs text-gray-500 dark:text-slate-400">{module.lessons} Lessons</span>
                      </>
                    )}
                  </div>
                  <h3 className={`text-lg font-bold text-gray-900 dark:text-slate-100 mb-2 ${module.available ? colors.hoverText : ''} transition-colors`}>
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {module.description}
                  </p>

                  {/* Per-course progress (endowed progress — only once started) */}
                  {done > 0 && module.lessons > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-[11px] text-gray-400 dark:text-slate-500 mb-1">
                        <span>{done}/{module.lessons} lessons</span>
                        <span className="font-semibold text-green-600">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  )}

                  {/* Footer — pinned to the bottom so every card lines up */}
                  <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-medium ${colors.tagBg} px-2 py-1 rounded`}>
                        {module.tag}
                      </span>
                      {showsProPill && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 text-[10px] font-bold rounded"
                          title={`First ${FREE_PREVIEW_LESSONS} lessons free — the rest is Academy Pro`}
                        >
                          <FaCrown className="text-[9px]" /> {FREE_PREVIEW_LESSONS} FREE
                        </span>
                      )}
                    </div>
                    {module.available ? (
                      <span className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold ${colors.badge} transition-all group-hover:shadow-md`}>
                        {finished ? 'Review' : done > 0 ? 'Continue' : 'Start Learning'}
                        <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500">
                        <FaLock className="text-xs" />
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress indicator */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-3">Modules by Difficulty</p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500 dark:text-slate-400">Beginner ({MODULES_CONFIG.filter(m => m.difficulty === DIFFICULTY_LEVELS.BEGINNER).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-500 dark:text-slate-400">Intermediate ({MODULES_CONFIG.filter(m => m.difficulty === DIFFICULTY_LEVELS.INTERMEDIATE).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-xs text-gray-500 dark:text-slate-400">Advanced ({MODULES_CONFIG.filter(m => m.difficulty === DIFFICULTY_LEVELS.ADVANCED).length})</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Premium Courses - Fintech Grade UI */}
      <section id="courses" data-learn-tour="premium-section" className="py-16 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-100/40 dark:bg-emerald-900/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-100/30 dark:bg-teal-900/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Compact Premium Header */}
          <div className="text-center mb-10">
            {/* Single Line Headline with Badge */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <h2 className="text-3xl md:text-4xl font-display font-normal text-gray-900 dark:text-slate-100 tracking-[-0.02em]">
                Premium Courses
              </h2>
            </div>

            {/* Compact Supporting Copy */}
            <p className="text-gray-500 dark:text-slate-400 text-sm max-w-xl mx-auto">
              Expert-led programs to master money, markets & wealth.{' '}
              <span className="text-gray-700 dark:text-slate-200 font-medium">
                Lesson 1 of every module is free — the full programs are included with Academy Pro.
              </span>
            </p>
          </div>

          {/* Compact Value Props Row */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8 text-xs text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Finance professionals
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Real-world frameworks
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Xtin Capital integrated
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Early-access perks
            </span>
          </div>

          {/* Early access + Pro CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {pro ? (
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/30 text-amber-700 dark:text-amber-300 rounded-full font-bold text-sm">
                <FaCrown /> Included in your Academy Pro — you'll get these first
              </span>
            ) : (
              <button
                onClick={() => setShowUpgrade(true)}
                className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-full font-semibold text-sm shadow-lg shadow-green-500/25 hover:shadow-xl transition-all duration-300"
              >
                <FaCrown className="text-xs" />
                Lock these in with Pro — {formatLearnPrice(pricing.yearly, pricing)}/yr
              </button>
            )}
            <button
              onClick={() => setShowNotifyModal(true)}
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full font-medium text-sm hover:bg-gray-800 transition-all duration-300 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30"
            >
              <FaBell className="text-xs" />
              Join Early Access
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          {/* Premium Course Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Course 1: Personal Finance Mastery - GREEN */}
            <div className="group relative">

              <div className="relative flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 dark:shadow-black/30 hover:shadow-2xl hover:shadow-green-200/40 dark:hover:shadow-emerald-900/30 hover:-translate-y-1 transition-all duration-500 border border-gray-100/80 dark:border-slate-700">
                {/* Gradient Header with Glassmorphism Icon Container */}
                <div className="relative h-52 bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${PREMIUM_COURSES[0].freeVideoId}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div>
                  {/* Subtle noise/glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                  {/* Glassmorphism Icon Container */}
                  <button
                    onClick={() => navigate(watchPath('personal-finance'))}
                    aria-label="Watch module"
                    className="relative w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300"
                  >
                    <FaPlayCircle className="text-green-600 text-3xl" />
                  </button>

                  {/* Course Number */}
                  <div className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                    <span className="text-white font-bold text-sm">01</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-slate-100 group-hover:text-green-700 dark:group-hover:text-emerald-300 transition-colors">Personal Finance Mastery</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 flex-1 leading-relaxed line-clamp-3">
                    Complete guide to budgeting, saving, emergency funds, and building a strong financial foundation for life.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                      <FaBookOpen className="text-green-500" />
                      <span className="font-medium">12 Chapters</span>
                    </div>
                    <button
                      onClick={() => navigate(watchPath('personal-finance'))}
                      className="group/btn relative text-green-600 font-semibold text-sm hover:text-green-700 transition-colors flex items-center gap-1" title="Watch this module — Lesson 1 is free"
                    >
                      <span className="relative">
                        Watch Module
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover/btn:w-full transition-all duration-300"></span>
                      </span>
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Course 2: Stock Market Investing - BLUE */}
            <div className="group relative">

              <div className="relative flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 dark:shadow-black/30 hover:shadow-2xl hover:shadow-blue-200/40 dark:hover:shadow-blue-900/30 hover:-translate-y-1 transition-all duration-500 border border-gray-100/80 dark:border-slate-700">
                <div className="relative h-52 bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${PREMIUM_COURSES[1].freeVideoId}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                  <button
                    onClick={() => navigate(watchPath('stock-market-investing'))}
                    aria-label="Watch module"
                    className="relative w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300"
                  >
                    <FaPlayCircle className="text-green-600 text-3xl" />
                  </button>

                  <div className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                    <span className="text-white font-bold text-sm">02</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">Stock Market Investing</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 flex-1 leading-relaxed line-clamp-3">
                    Learn to analyze stocks, read financial statements, and build a winning long-term investment portfolio.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                      <FaBookOpen className="text-blue-500" />
                      <span className="font-medium">15 Chapters</span>
                    </div>
                    <button
                      onClick={() => navigate(watchPath('stock-market-investing'))}
                      className="group/btn relative text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors flex items-center gap-1" title="Watch this module — Lesson 1 is free"
                    >
                      <span className="relative">
                        Watch Module
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover/btn:w-full transition-all duration-300"></span>
                      </span>
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Course 3: Mutual Funds Deep Dive - PURPLE */}
            <div className="group relative">

              <div className="relative flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 dark:shadow-black/30 hover:shadow-2xl hover:shadow-purple-200/40 dark:hover:shadow-purple-900/30 hover:-translate-y-1 transition-all duration-500 border border-gray-100/80 dark:border-slate-700">
                <div className="relative h-52 bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${PREMIUM_COURSES[2].freeVideoId}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                  <button
                    onClick={() => navigate(watchPath('mutual-funds'))}
                    aria-label="Watch module"
                    className="relative w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300"
                  >
                    <FaPlayCircle className="text-green-600 text-3xl" />
                  </button>

                  <div className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                    <span className="text-white font-bold text-sm">03</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">Mutual Funds Deep Dive</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 flex-1 leading-relaxed line-clamp-3">
                    Master SIPs, index funds, debt funds, and learn to build a diversified mutual fund portfolio.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                      <FaBookOpen className="text-purple-500" />
                      <span className="font-medium">10 Chapters</span>
                    </div>
                    <button
                      onClick={() => navigate(watchPath('mutual-funds'))}
                      className="group/btn relative text-purple-600 font-semibold text-sm hover:text-purple-700 transition-colors flex items-center gap-1" title="Watch this module — Lesson 1 is free"
                    >
                      <span className="relative">
                        Watch Module
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover/btn:w-full transition-all duration-300"></span>
                      </span>
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Course 4: Options & Derivatives - BLUE (consistent palette) */}
            <div className="group relative">

              <div className="relative flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 dark:shadow-black/30 hover:shadow-2xl hover:shadow-blue-200/40 dark:hover:shadow-blue-900/30 hover:-translate-y-1 transition-all duration-500 border border-gray-100/80 dark:border-slate-700">
                <div className="relative h-52 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${PREMIUM_COURSES[3].freeVideoId}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                  <button
                    onClick={() => navigate(watchPath('options-derivatives'))}
                    aria-label="Watch module"
                    className="relative w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300"
                  >
                    <FaPlayCircle className="text-green-600 text-3xl" />
                  </button>

                  <div className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                    <span className="text-white font-bold text-sm">04</span>
                  </div>

                  {/* Advanced Badge */}
                  <div className="absolute bottom-4 left-4">
                    <span className="px-2 py-1 bg-red-500/80 text-white text-[10px] font-bold rounded uppercase tracking-wider">Advanced</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Options & Derivatives</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 flex-1 leading-relaxed line-clamp-3">
                    Advanced course on options strategies, futures trading, and derivatives for risk management.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                      <FaBookOpen className="text-slate-600" />
                      <span className="font-medium">14 Chapters</span>
                    </div>
                    <button
                      onClick={() => navigate(watchPath('options-derivatives'))}
                      className="group/btn relative text-slate-700 font-semibold text-sm hover:text-slate-900 transition-colors flex items-center gap-1" title="Watch this module — Lesson 1 is free"
                    >
                      <span className="relative">
                        Watch Module
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-700 group-hover/btn:w-full transition-all duration-300"></span>
                      </span>
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Course 5: Tax Planning & Filing - GREEN */}
            <div className="group relative">

              <div className="relative flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 dark:shadow-black/30 hover:shadow-2xl hover:shadow-teal-200/40 dark:hover:shadow-teal-900/30 hover:-translate-y-1 transition-all duration-500 border border-gray-100/80 dark:border-slate-700">
                <div className="relative h-52 bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${PREMIUM_COURSES[4].freeVideoId}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                  <button
                    onClick={() => navigate(watchPath('tax-planning'))}
                    aria-label="Watch module"
                    className="relative w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300"
                  >
                    <FaPlayCircle className="text-green-600 text-3xl" />
                  </button>

                  <div className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                    <span className="text-white font-bold text-sm">05</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">Tax Planning & Filing</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 flex-1 leading-relaxed line-clamp-3">
                    Complete tax guide for investors - deductions, capital gains, ITR filing, and tax-saving strategies.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                      <FaBookOpen className="text-teal-500" />
                      <span className="font-medium">8 Chapters</span>
                    </div>
                    <button
                      onClick={() => navigate(watchPath('tax-planning'))}
                      className="group/btn relative text-teal-600 font-semibold text-sm hover:text-teal-700 transition-colors flex items-center gap-1" title="Watch this module — Lesson 1 is free"
                    >
                      <span className="relative">
                        Watch Module
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover/btn:w-full transition-all duration-300"></span>
                      </span>
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Trust Section */}
          <div className="mt-16 text-center">
            <p className="text-gray-400 dark:text-slate-500 text-sm mb-2">Join thousands of learners waiting for launch</p>
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-gray-500 dark:text-slate-400 text-sm">Highly anticipated</span>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Notify Me Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden border border-transparent dark:border-slate-700">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-emerald-900/30 dark:to-slate-900 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>

            <div className="relative z-10">
              {notifySaved ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                    <FaCheckCircle className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-2 tracking-[-0.015em]">You're on the list!</h3>
                  <p className="text-gray-500 dark:text-slate-400 mb-6">
                    We'll email you the moment premium courses launch — with your early-bird perks attached.
                  </p>
                  <button
                    onClick={() => { setShowNotifyModal(false); setNotifySaved(false); }}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all"
                  >
                    Back to learning
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                      <FaBell className="text-white text-2xl" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-2 tracking-[-0.015em]">Get Early Access</h3>
                    <p className="text-gray-500 dark:text-slate-400">Be the first to know when our premium courses launch. Get exclusive early-bird benefits.</p>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const email = (e.target as any).email.value;
                    // Saved server-side (newsletter list) so the email actually reaches us.
                    newsletterService.subscribeToNewsletter(email)
                      .catch((err) => {
                        if (!/already subscribed/i.test(err?.message || '')) throw err;
                      })
                      .then(() => setNotifySaved(true))
                      .catch(() => alert("Couldn't save your email — please try again."));
                  }}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      required
                      defaultValue={user?.email || ''}
                      className="w-full px-4 py-3.5 border border-gray-200 dark:border-slate-600 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all bg-gray-50/50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      className="w-full px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <FaBell className="text-sm" />
                      Notify Me on Launch
                    </button>
                  </form>

                  <button
                    onClick={() => setShowNotifyModal(false)}
                    className="w-full mt-3 px-6 py-3 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 font-medium transition-colors text-sm"
                  >
                    Maybe Later
                  </button>

                  <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-4">
                    Join thousands of learners waiting for launch
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sign In Modal for Module Access */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={handleModalClose}
        onSuccess={handleSignInSuccess}
        targetToolPath={pendingModulePath}
      />

      {/* Guided tour — auto-starts on first visit, relaunchable via "?" */}
      <LearnTour
        onFinishNavigate={() =>
          document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' })
        }
      />

      {/* Academy Pro upgrade + activation celebration */}
      <LearnUpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onActivated={handleProActivated}
      />
      <LearnProCelebration open={celebrating} onDone={() => setCelebrating(false)} />

      <Footer />
    </div>
  );
};

export default LearnPage;
