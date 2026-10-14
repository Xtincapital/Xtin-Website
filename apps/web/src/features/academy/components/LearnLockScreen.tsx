import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaCrown, FaLock, FaPlayCircle } from 'react-icons/fa';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import LearnUpgradeModal from './LearnUpgradeModal';
import LearnProCelebration from './LearnProCelebration';
import useRegion from '../../../hooks/useRegion';
import { FREE_PREVIEW_LESSONS, formatLearnPrice, learnPricing } from '../../../lib/learnPlan';

/**
 * Shown when a free learner opens a Pro lesson. Deliberately warm, not a
 * wall: it celebrates what they've already done (endowed progress), shows
 * exactly how much of THIS course is waiting (loss framing + Zeigarnik),
 * and makes the unlock feel tiny next to it.
 */
const LearnLockScreen = ({ moduleConfig, lessonNumber }) => {
  const navigate = useNavigate();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  useRegion(); // re-render when the region resolves so pricing stays correct
  const pricing = learnPricing();

  const totalLessons = moduleConfig?.lessons || 0;
  const remaining = Math.max(0, totalLessons - FREE_PREVIEW_LESSONS);
  const title = moduleConfig?.title || 'this course';

  const handleActivated = () => {
    setShowUpgrade(false);
    setCelebrating(true);
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-24 mt-16 bg-gradient-to-br from-slate-50 via-white to-green-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/30">
        <div className="max-w-xl w-full">
          <button
            onClick={() => navigate('/learn')}
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-green-600 font-medium mb-6 transition-colors"
          >
            <FaArrowLeft className="text-xs" /> Back to Academy
          </button>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/40 border border-gray-100 dark:border-slate-700 p-8 text-center">
            {/* Endowed progress — celebrate first */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-emerald-900/30 text-green-700 dark:text-emerald-300 rounded-full text-xs font-bold mb-5">
              <FaCheckCircle />
              You finished the free preview of {title}
            </div>

            <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <FaCrown className="text-white text-2xl" />
            </div>

            <h1 className="text-2xl md:text-3xl font-display font-normal mb-3 tracking-[-0.015em]">
              {remaining} more lesson{remaining === 1 ? '' : 's'} are waiting in this course
            </h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Lesson {lessonNumber} of <span className="font-semibold">{title}</span> is part of
              Academy Pro. Your progress here is saved — pick up exactly where you stopped.
            </p>

            {/* Lesson dots — what's done, what's waiting */}
            {totalLessons > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mb-7">
                {Array.from({ length: totalLessons }, (_, i) => {
                  const n = i + 1;
                  const free = n <= FREE_PREVIEW_LESSONS;
                  return (
                    <span
                      key={n}
                      title={`Lesson ${n}${free ? ' — free' : ' — Pro'}`}
                      className={`w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center ${
                        free
                          ? 'bg-green-100 dark:bg-emerald-900/40 text-green-700 dark:text-emerald-300'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'
                      }`}
                    >
                      {free ? <FaCheckCircle /> : <FaLock className="text-[9px]" />}
                    </span>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setShowUpgrade(true)}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/35 transition-all duration-300 flex items-center justify-center gap-2 mb-3"
            >
              <FaPlayCircle />
              Continue this course — from {formatLearnPrice(pricing.yearly, pricing)}/year
            </button>
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-6">
              About {pricing.perDay} a day · every course & certificate included
            </p>

            {/* Reciprocity — the free path stays open */}
            <div className="pt-5 border-t border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Not today? No problem —{' '}
                <Link to="/learn" className="text-green-600 font-semibold hover:underline">
                  8 full Beginner courses stay free forever
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>

      <LearnUpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onActivated={handleActivated}
        reason={`Lesson ${lessonNumber} of ${title} is a Pro lesson — unlock it and ${remaining - 1 > 0 ? `${remaining - 1} more in this course alone` : 'finish the course'}.`}
      />
      <LearnProCelebration
        open={celebrating}
        onDone={() => {
          setCelebrating(false);
          // Re-render the route — the gate re-checks the plan and lets them in.
          navigate(0);
        }}
      />

      <Footer />
    </div>
  );
};

export default LearnLockScreen;
