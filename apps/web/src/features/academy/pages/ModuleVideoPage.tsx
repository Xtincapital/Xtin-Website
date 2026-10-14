import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaCrown, FaLink, FaLock, FaPlayCircle, FaRegCircle, FaShareAlt, FaWhatsapp } from 'react-icons/fa';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import SEO from '../../../components/SEO';
import SignInModal from '../../../components/SignInModal';
import { useAuth } from '../../../contexts/AuthContext';
import authService from '../../../services/authService';
import newsletterService from '../../../services/newsletterService';
import { BACKEND_URL } from '../../../config/env';
import useRegion from '../../../hooks/useRegion';
import { formatLearnPrice, isLearnPro, learnPricing, subscribeLearnPlan } from '../../../lib/learnPlan';
import learnPlanService from '../services/learnPlanService';
import LearnUpgradeModal from '../components/LearnUpgradeModal';
import LearnProCelebration from '../components/LearnProCelebration';
import { getPremiumCourse, watchPath } from '../data/premiumCourseVideos';

/* ---------- YouTube IFrame API (loaded once) — gives us the "ended" event ---------- */

let ytApiPromise: Promise<any> | null = null;
const loadYouTubeApi = (): Promise<any> => {
  const w = window as any;
  if (w.YT?.Player) return Promise.resolve(w.YT);
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve) => {
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => { prev?.(); resolve(w.YT); };
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    });
  }
  return ytApiPromise;
};

const YouTubePlayer = ({ videoId, autoplay, onEnded }: { videoId: string; autoplay: boolean; onEnded: () => void }) => {
  const holder = useRef<HTMLDivElement>(null);
  const player = useRef<any>(null);
  const endedRef = useRef(onEnded);
  endedRef.current = onEnded;
  const autoplayRef = useRef(autoplay);
  autoplayRef.current = autoplay;

  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then((YT) => {
      if (cancelled || !holder.current) return;
      if (player.current) {
        player.current.loadVideoById(videoId);
        if (!autoplayRef.current) player.current.pauseVideo?.();
        return;
      }
      const target = document.createElement('div');
      holder.current.innerHTML = '';
      holder.current.appendChild(target);
      player.current = new YT.Player(target, {
        videoId,
        host: 'https://www.youtube-nocookie.com',
        width: '100%',
        height: '100%',
        playerVars: { rel: 0, modestbranding: 1, autoplay: autoplayRef.current ? 1 : 0 },
        events: { onStateChange: (e: any) => { if (e.data === 0) endedRef.current(); } },
      });
    });
    return () => { cancelled = true; };
  }, [videoId]);

  useEffect(() => () => { try { player.current?.destroy(); } catch { /* ignore */ } player.current = null; }, []);

  return <div ref={holder} className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full" />;
};

/* ---------- local progress (per device) ---------- */

const PROGRESS_KEY = 'xtin_watch_progress_v1';
type WatchProgress = Record<string, { last?: number; done?: number[] }>;
const readProgress = (): WatchProgress => {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); } catch { return {}; }
};
const writeProgress = (p: WatchProgress) => {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
};
const LEAD_KEY = 'xtin_watch_lead_v1';

const ModuleVideoPage = () => {
  const { slug } = useParams();
  const course = getPremiumCourse(slug);
  const [search, setSearch] = useSearchParams();
  const { user } = useAuth();
  useRegion();
  const pricing = learnPricing();

  const [, setPlanTick] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [available, setAvailable] = useState<number[]>([]);
  const [paidIds, setPaidIds] = useState<Record<number, string>>({});
  const [progress, setProgress] = useState<WatchProgress>(readProgress);
  const [autoplay, setAutoplay] = useState(false);
  const [copied, setCopied] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadState, setLeadState] = useState<'idle' | 'busy' | 'done' | 'error'>(() => {
    try { return localStorage.getItem(LEAD_KEY) ? 'done' : 'idle'; } catch { return 'idle'; }
  });

  const pro = isLearnPro();
  const total = course?.lessons.length || 0;

  // Lesson: ?lesson=N deep link → last watched → 1.
  const lesson = useMemo(() => {
    const q = parseInt(search.get('lesson') || '', 10);
    const n = q || (slug && progress[slug]?.last) || 1;
    return Math.min(Math.max(n, 1), total || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, slug, total]);

  const selectLesson = useCallback((n: number, play = true) => {
    setAutoplay(play);
    setSearch(n === 1 ? {} : { lesson: String(n) }, { replace: true });
    if (!slug) return;
    setProgress((p) => {
      const next = { ...p, [slug]: { ...p[slug], last: n } };
      writeProgress(next);
      return next;
    });
  }, [slug, setSearch]);

  // Plan: authoritative sync once signed in; re-render on change.
  useEffect(() => { if (user) learnPlanService.syncPlan(); }, [user]);
  useEffect(() => {
    const unsub = subscribeLearnPlan(() => setPlanTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  // Which paid lessons have a video yet (numbers only — never IDs).
  useEffect(() => {
    if (!slug) return;
    fetch(`${BACKEND_URL}/api/learn/videos/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setAvailable(j?.data?.available || []))
      .catch(() => setAvailable([]));
  }, [slug]);

  // Paid lesson → ask the server (Pro-gated) for its YouTube ID.
  useEffect(() => {
    if (!slug || lesson < 2 || !pro || !user || !available.includes(lesson) || paidIds[lesson]) return;
    authService
      .makeAuthenticatedRequest(`${BACKEND_URL}/api/learn/videos/${slug}/${lesson}`, { method: 'GET' })
      .then(async (res) => {
        const j = await res.json().catch(() => ({}));
        if (res.ok && j?.data?.videoId) setPaidIds((m) => ({ ...m, [lesson]: j.data.videoId }));
        else if (j?.code === 'PRO_REQUIRED') learnPlanService.syncPlan(); // stale local plan
      })
      .catch(() => { /* leave the lesson in its loading/placeholder state */ });
  }, [slug, lesson, pro, user, available, paidIds]);

  if (!course || !slug) return <Navigate to="/learn" replace />;

  const hasVideo = (n: number) => n === 1 || available.includes(n);
  const videoId = lesson === 1 ? course.freeVideoId : paidIds[lesson];
  const locked = lesson > 1 && hasVideo(lesson) && !pro;
  const soon = lesson > 1 && !hasVideo(lesson);
  const done = progress[slug]?.done || [];
  const doneCount = done.filter((n) => n <= total).length;

  const toggleDone = (n: number) => {
    setProgress((p) => {
      const cur = new Set(p[slug]?.done || []);
      if (cur.has(n)) cur.delete(n);
      else cur.add(n);
      const next = { ...p, [slug]: { ...p[slug], done: [...cur].sort((a, b) => a - b) } };
      writeProgress(next);
      return next;
    });
  };

  const onEnded = () => {
    if (!done.includes(lesson)) toggleDone(lesson);
    const nextN = lesson + 1;
    // Auto-play the next lesson only when this viewer can actually watch it.
    if (nextN <= total && hasVideo(nextN) && pro) selectLesson(nextN, true);
  };

  const unlock = () => (user ? setShowUpgrade(true) : setShowSignIn(true));

  const shareUrl = `${window.location.origin}${watchPath(slug)}`;
  const shareText = `${course.name} — free video course on Xtin Capital`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };
  const nativeShare = () => {
    if (navigator.share) navigator.share({ title: shareText, url: shareUrl }).catch(() => {});
    else copyLink();
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = (leadEmail || user?.email || '').trim();
    if (!email) return;
    setLeadState('busy');
    try {
      await newsletterService.subscribeToNewsletter(email);
      setLeadState('done');
    } catch (err: any) {
      // Already on the list is still a success from the visitor's point of view.
      if (/already subscribed/i.test(err?.message || '')) setLeadState('done');
      else { setLeadState('error'); return; }
    }
    try { localStorage.setItem(LEAD_KEY, '1'); } catch { /* ignore */ }
  };

  const canonical = watchPath(slug);
  const unlockLabel = `Unlock all ${total} lessons with Pro — ${formatLearnPrice(pricing.yearly, pricing)}/yr`;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${course.name} — Free Video Course`}
        description={course.description}
        canonicalUrl={canonical}
        ogImage={`https://img.youtube.com/vi/${course.freeVideoId}/maxresdefault.jpg`}
        keywords={`${course.name}, finance course, free video lesson, Xtin Capital`}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: course.name,
          description: course.description,
          url: `https://www.xtincapital.com${canonical}`,
          image: `https://img.youtube.com/vi/${course.freeVideoId}/maxresdefault.jpg`,
          provider: { '@type': 'Organization', name: 'Xtin Capital', sameAs: 'https://www.xtincapital.com' },
          numberOfLessons: total,
        }}
      />
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/learn" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-brand mb-4">
          <FaArrowLeft className="text-xs" /> All courses
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <span className="inline-block mb-2 px-2.5 py-1 bg-brand-soft dark:bg-brand-fill/40 text-brand dark:text-brand text-xs font-bold rounded-full uppercase tracking-wider">
              Module {course.number} · Lesson 1 free
            </span>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 dark:text-slate-100 tracking-[-0.025em]">{course.name}</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-2 max-w-2xl">{course.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={nativeShare} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800">
              <FaShareAlt className="text-xs" /> Share
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
              target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"
              className="p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 text-brand hover:bg-white dark:hover:bg-slate-800"
            ><FaWhatsapp /></a>
            <button onClick={copyLink} aria-label="Copy link" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800">
              <FaLink className="text-xs" /> {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Player + details */}
          <div className="lg:col-span-2">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-xl flex items-center justify-center brand-on-dark">
              {videoId && !locked && !soon ? (
                <YouTubePlayer videoId={videoId} autoplay={autoplay} onEnded={onEnded} />
              ) : (
                <div className="text-center text-white/80 px-6">
                  {locked ? <FaLock className="mx-auto mb-3 text-2xl" /> : <FaPlayCircle className="mx-auto mb-3 text-3xl" />}
                  <p className="font-semibold">{locked ? 'Academy Pro lesson' : soon ? 'Video coming soon' : 'Loading…'}</p>
                  <p className="text-xs mt-1 text-white/60">
                    {locked ? `Unlock all ${total} lessons in this module with Pro.` : soon ? 'This lesson is being recorded.' : ''}
                  </p>
                  {locked && (
                    <button onClick={unlock} className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg font-semibold text-sm bg-brand-fill">
                      <FaCrown className="text-xs" /> Unlock with Pro
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-gray-400 dark:text-slate-500">Lesson {lesson} of {total}{lesson === 1 ? ' · Free' : ''}</p>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{course.lessons[lesson - 1]}</h2>
              </div>
              <button
                onClick={() => toggleDone(lesson)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
              >
                {done.includes(lesson) ? <FaCheckCircle className="text-brand" /> : <FaRegCircle className="text-gray-400" />}
                {done.includes(lesson) ? 'Watched' : 'Mark as watched'}
              </button>
            </div>

            {!pro && (
              <div className="mt-6 rounded-2xl border border-brand-line dark:border-brand/50 p-5 bg-brand-soft">
                <p className="font-bold text-gray-900 dark:text-slate-100">Lesson 1 free, {total - 1} more with Pro.</p>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Every lesson in this module, plus all 20 text modules and certificates.</p>
                <button onClick={unlock} className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-lg font-semibold text-sm shadow-lg shadow-brand/25 hover:shadow-xl transition-all bg-brand-fill">
                  <FaCrown className="text-xs" /> {unlockLabel}
                </button>
              </div>
            )}

            {!pro && leadState !== 'done' && (
              <form onSubmit={submitLead} className="mt-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                <p className="font-semibold text-gray-900 dark:text-slate-100">Get new lessons by email</p>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">We'll tell you when the next {course.name} lessons go live. No spam.</p>
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <input
                    type="email" required placeholder="you@email.com"
                    value={leadEmail || user?.email || ''}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                  <button type="submit" disabled={leadState === 'busy'} className="px-5 py-2.5 rounded-lg bg-gray-900 dark:bg-slate-700 text-white font-medium text-sm disabled:opacity-60 brand-on-dark">
                    {leadState === 'busy' ? 'Saving…' : 'Notify me'}
                  </button>
                </div>
                {leadState === 'error' && <p className="text-xs text-red-600 mt-2">Couldn't save that — please try again.</p>}
              </form>
            )}
            {!pro && leadState === 'done' && (
              <p className="mt-4 text-sm text-brand dark:text-brand flex items-center gap-2">
                <FaCheckCircle /> You're on the list — we'll email you when new lessons go live.
              </p>
            )}
          </div>

          {/* Lesson list */}
          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <span className="font-semibold text-gray-900 dark:text-slate-100 text-sm">Lessons</span>
                <span className="text-xs text-gray-500 dark:text-slate-400">{doneCount}/{total} watched</span>
              </div>
              <div className="h-1 bg-gray-100 dark:bg-slate-800">
                <div className="h-full bg-brand-fill transition-all" style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }} />
              </div>
              <ul className="divide-y divide-gray-100 dark:divide-slate-800 max-h-[32rem] overflow-y-auto">
                {course.lessons.map((title, i) => {
                  const n = i + 1;
                  const isPlayable = hasVideo(n) && (n === 1 || pro);
                  return (
                    <li key={n}>
                      <button
                        onClick={() => selectLesson(n)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${n === lesson ? 'bg-brand-soft dark:bg-brand-soft' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                      >
                        <span className="w-5 text-xs font-bold text-gray-400 dark:text-slate-500">{n}</span>
                        <span className="flex-1 text-gray-800 dark:text-slate-200 line-clamp-2">{title}</span>
                        {done.includes(n) ? (
                          <FaCheckCircle className="text-brand shrink-0" />
                        ) : n === 1 ? (
                          <span className="text-xs font-bold text-brand dark:text-brand">FREE</span>
                        ) : !hasVideo(n) ? (
                          <span className="text-xs font-semibold text-gray-400 dark:text-slate-500">SOON</span>
                        ) : isPlayable ? (
                          <FaPlayCircle className="text-brand shrink-0" />
                        ) : (
                          <FaLock className="text-xs text-gray-400 dark:text-slate-500 shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">Watch progress is saved on this device.</p>
          </aside>
        </div>
      </main>

      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSuccess={() => { setShowSignIn(false); setShowUpgrade(true); }}
        targetToolPath={canonical}
      />
      <LearnUpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onActivated={() => { setShowUpgrade(false); setCelebrating(true); }}
      />
      <LearnProCelebration open={celebrating} onDone={() => setCelebrating(false)} />
      <Footer />
    </div>
  );
};

export default ModuleVideoPage;
