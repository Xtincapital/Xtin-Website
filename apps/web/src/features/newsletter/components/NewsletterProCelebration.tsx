import React, { useEffect, useMemo } from 'react';
import { FaCrown } from 'react-icons/fa';

/**
 * Full-screen celebration the moment Market Brief Pro activates.
 * Peak-end rule: make the purchase feel like an achievement. Pure CSS confetti.
 */
const CONFETTI_COLORS = ['#16A34A', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

const NewsletterProCelebration = ({ open, onDone }) => {
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-20px] rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.5,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `nlConfetti ${p.duration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-sm w-full mx-4 text-center shadow-2xl border border-transparent dark:border-slate-700 animate-[nlPop_0.4s_ease-out]">
        <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40">
          <FaCrown className="text-white text-3xl" />
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-slate-100 mb-2">
          You're now a Pro reader
        </h3>
        <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
          Both editions, in the markets you chose, land in your inbox — starting with the
          very next brief. Welcome to the front row. 📈
        </p>
      </div>

      <style>{`
        @keyframes nlConfetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(540deg); opacity: 0.7; }
        }
        @keyframes nlPop {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NewsletterProCelebration;
