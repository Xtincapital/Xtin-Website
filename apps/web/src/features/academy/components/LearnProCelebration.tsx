import React, { useEffect, useMemo } from 'react';
import { FaCrown } from 'react-icons/fa';

/**
 * Full-screen celebration shown the moment Academy Pro activates.
 * The peak-end rule: make the purchase moment feel like an achievement,
 * not a transaction. Pure CSS confetti — no dependencies.
 */
const CONFETTI_COLORS = ['#12805A', '#12805A', '#B8923F', '#5A77AA', '#8F6FC4', '#8F6FC4'];

const LearnProCelebration = ({ open, onDone }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.9,
        duration: 2.2 + Math.random() * 1.6,
        size: 6 + Math.random() * 8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotate: Math.random() * 360,
      })),
    []
  );

  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => onDone?.(), 3400);
    return () => clearTimeout(t);
  }, [open, onDone]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-hidden brand-on-dark">
      {/* Confetti */}
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-20px] rounded-sm animate-[learnConfetti_linear_forwards]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.5,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `learnConfetti ${p.duration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-sm w-full mx-4 text-center shadow-2xl border border-transparent dark:border-slate-700 animate-[learnPop_0.4s_ease-out]">
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40 bg-brand-fill">
          <FaCrown className="text-white text-3xl" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-2 tracking-[-0.015em]">
          Welcome to Academy Pro
        </h3>
        <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
          Every course, every lesson, every certificate — unlocked. Your complete
          financial education starts now. 🎓
        </p>
      </div>

      <style>{`
        @keyframes learnConfetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(540deg); opacity: 0.7; }
        }
        @keyframes learnPop {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LearnProCelebration;
