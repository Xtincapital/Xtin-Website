import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaChevronRight, FaCrown, FaLink, FaLock, FaPlayCircle, FaRegCircle, FaShareAlt, FaWhatsapp } from 'react-icons/fa';
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
const NOTES_KEY = 'xtin_watch_notes_v1';
const readNotes = (): Record<string, string> => {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'); } catch { return {}; }
};

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
  const [tab, setTab] = useState<'overview' | 'notes'>('overview');
  const [notes, setNotes] = useState<Record<string, string>>(readNotes);
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

  const noteKey = `${slug}:${lesson}`;
  const saveNote = (text: string) => {
    setNotes((m) => {
      const next = { ...m, [noteKey]: text };
      if (!text) delete next[noteKey];
      try { localStorage.setItem(NOTES_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-5">
          <Link to="/learn" className="hover:text-brand">Learn</Link>
          <FaChevronRight className="text-[10px] opacity-60" />
          <span>Module {course.number}</span>
          <FaChevronRight className="text-[10px] opacity-60" />
          <span>{course.name}</span>
          <FaChevronRight className="text-[10px] opacity-60" />
          <span className="font-bold text-gray-900 dark:text-slate-100">Lesson {lesson}</span>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-brand-soft border border-brand-line text-brand text-xs font-bold rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-fill" />
              Module {course.number} · Lesson 1 free
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-slate-100 tracking-[-0.025em]">{course.name}</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-2 max-w-2xl">{course.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={nativeShare} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-gray-700 dark:text-slate-200 hover:border-brand-line transition-colors">
              <FaShareAlt className="text-xs" /> Share
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
              target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"
              className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-brand hover:border-brand-line transition-colors"
            ><FaWhatsapp /></a>
            <button onClick={copyLink} aria-label="Copy link" className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-bold transition-colors ${copied ? 'bg-brand-soft border-brand-line text-brand' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:border-brand-line'}`}>
              {copied ? <FaCheckCircle className="text-xs" /> : <FaLink className="text-xs" />} {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
          {/* Player + details */}
          <div className="min-w-0">
            <div className="relative aspect-video bg-black rounded-[18px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05),0_16px_40px_-16px_rgba(0,0,0,0.35)] brand-on-dark">
              {videoId && !locked && !soon ? (
                <YouTubePlayer videoId={videoId} autoplay={autoplay} onEnded={onEnded} />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#052E16] to-[#0B1F14]">
                  {/* Chart-paper grid */}
                  <div aria-hidden="true" className="absolute inset-0 [background-image:linear-gradient(rgba(134,239,172,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(134,239,172,0.07)_1px,transparent_1px)] [background-size:40px_40px]" />
                  <div className="absolute left-4 top-3.5 sm:left-6 sm:top-6 max-w-[75%]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-green-300">Lesson {String(lesson).padStart(2, '0')}</p>
                    <p className="mt-1 text-base sm:text-2xl font-bold text-white leading-tight line-clamp-1 sm:line-clamp-2">{course.lessons[lesson - 1]}</p>
                  </div>
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center text-white px-6 mt-8 sm:mt-10">
                      <span className="mx-auto mb-2 sm:mb-4 w-12 h-12 sm:w-[76px] sm:h-[76px] rounded-full grid place-items-center bg-white/15 border border-white/30 backdrop-blur-md">
                        {locked ? <FaLock className="text-xl" /> : <FaPlayCircle className={`text-2xl ${soon ? '' : 'animate-pulse'}`} />}
                      </span>
                      <p className="font-bold">{locked ? 'Academy Pro lesson' : soon ? 'Video coming soon' : 'Loading…'}</p>
                      <p className="hidden sm:block text-xs mt-1 text-white/60">
                        {locked ? `Unlock all ${total} lessons in this module with Pro.` : soon ? 'This lesson is being recorded.' : ''}
                      </p>
                      {locked && (
                        <button onClick={unlock} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm pro-gold-bg">
                          <FaCrown className="text-xs" /> Unlock with Pro
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 tracking-[-0.02em]">{course.lessons[lesson - 1]}</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  {course.name} · Lesson {lesson} of {total}{lesson === 1 ? ' · Free' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {lesson < total && (
                  <button
                    onClick={() => selectLesson(lesson + 1)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-gray-700 dark:text-slate-200 hover:border-brand-line transition-colors"
                  >
                    Next lesson <FaChevronRight className="text-[10px]" />
                  </button>
                )}
                <button
                  onClick={() => toggleDone(lesson)}
                  aria-pressed={done.includes(lesson)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold border transition-colors ${done.includes(lesson) ? 'bg-brand-soft border-brand-line text-brand' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:border-brand-line'}`}
                >
                  {done.includes(lesson) ? <FaCheckCircle /> : <FaRegCircle className="text-gray-400" />}
                  {done.includes(lesson) ? 'Watched' : 'Mark as watched'}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div role="tablist" className="mt-6 flex gap-1 border-b border-gray-200 dark:border-slate-700">
              {([['overview', 'Overview'], ['notes', 'My notes']] as const).map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`relative px-4 py-2.5 text-sm font-bold transition-colors ${tab === id ? 'text-gray-900 dark:text-slate-100' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'}`}
                >
                  {label}
                  {id === 'notes' && notes[noteKey] && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-brand-fill align-middle" />}
                  {tab === id && <motion.span layoutId="watch-tab-line" className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand-fill" />}
                </button>
              ))}
            </div>
            <div className="pt-5">
              {tab === 'overview' ? (
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700">
                    <div className="text-2xl font-bold text-brand tabular-nums">{total}</div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Video lessons in this module</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700">
                    <div className="text-2xl font-bold text-brand tabular-nums">{doneCount}/{total}</div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Lessons you've watched</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700">
                    <div className="text-2xl font-bold text-brand">{pro ? 'Pro' : 'Free'}</div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{pro ? 'Every lesson unlocked' : 'Lesson 1 is free to watch'}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="watch-note" className="sr-only">Notes for this lesson</label>
                  <textarea
                    id="watch-note"
                    value={notes[noteKey] || ''}
                    onChange={(e) => saveNote(e.target.value)}
                    placeholder={`Notes for “${course.lessons[lesson - 1]}”`}
                    className="w-full min-h-[120px] rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand/40 resize-y"
                  />
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">Saved on this device as you type.</p>
                </div>
              )}
            </div>

            {!pro && (
              <div className="relative mt-8 overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#052E16] via-[#14532D] to-[#166534] text-green-50 brand-on-dark">
                <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[radial-gradient(closest-side,rgba(205,170,95,0.3),transparent)]" />
                <div className="relative flex flex-wrap items-center justify-between gap-5">
                  <div className="max-w-md">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] pro-gold-text">Academy Pro</p>
                    <p className="mt-2 text-2xl font-bold text-white">Lesson 1 free, {total - 1} more with Pro.</p>
                    <p className="text-sm text-green-200 mt-1.5">Every lesson in this module, plus all 20 text modules and certificates.</p>
                  </div>
                  <button onClick={unlock} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm pro-gold-bg shadow-lg hover:-translate-y-0.5 transition-transform">
                    <FaCrown className="text-xs" /> {unlockLabel}
                  </button>
                </div>
              </div>
            )}

            {!pro && leadState !== 'done' && (
              <form onSubmit={submitLead} className="mt-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                <p className="font-bold text-gray-900 dark:text-slate-100">Get new lessons by email</p>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">We'll tell you when the next {course.name} lessons go live. No spam.</p>
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <input
                    type="email" required placeholder="you@email.com"
                    value={leadEmail || user?.email || ''}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand/40"
                  />
                  <button type="submit" disabled={leadState === 'busy'} className="px-5 py-2.5 rounded-xl bg-brand-fill hover:bg-brand-hover text-white font-bold text-sm disabled:opacity-60 transition-colors">
                    {leadState === 'busy' ? 'Saving…' : 'Notify me'}
                  </button>
                </div>
                {leadState === 'error' && <p className="text-xs text-red-600 mt-2">Couldn't save that. Check the address and try again.</p>}
              </form>
            )}
            {!pro && leadState === 'done' && (
              <p className="mt-4 text-sm text-brand dark:text-brand flex items-center gap-2">
                <FaCheckCircle /> You're on the list — we'll email you when new lessons go live.
              </p>
            )}
          </div>

          {/* Lesson list */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">Course</p>
                <p className="mt-1 font-bold text-gray-900 dark:text-slate-100">{course.name}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-brand-fill rounded-full transition-[width] duration-700" style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-500 dark:text-slate-400 tabular-nums">{doneCount}/{total}</span>
                </div>
              </div>
              <ul className="p-2 max-h-[32rem] overflow-y-auto">
                {course.lessons.map((title, i) => {
                  const n = i + 1;
                  const isPlayable = hasVideo(n) && (n === 1 || pro);
                  const isDone = done.includes(n);
                  const current = n === lesson;
                  const isLocked = !isPlayable && hasVideo(n);
                  return (
                    <li key={n}>
                      <button
                        onClick={() => selectLesson(n)}
                        aria-current={current ? 'true' : undefined}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-sm transition-colors ${current ? 'bg-brand-soft ring-1 ring-brand-line' : 'hover:bg-gray-50 dark:hover:bg-slate-800'} ${isLocked && !current ? 'opacity-60' : ''}`}
                      >
                        <span className={`w-7 h-7 shrink-0 rounded-full grid place-items-center text-[11px] font-bold tabular-nums border-[1.5px] ${isDone ? 'bg-brand-fill border-transparent text-white' : current ? 'border-brand text-brand' : 'border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-500'}`}>
                          {isDone ? <FaCheckCircle className="text-xs" /> : String(n).padStart(2, '0')}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-bold text-gray-800 dark:text-slate-200 leading-snug line-clamp-2">{title}</span>
                          <span className="block text-xs text-gray-500 dark:text-slate-400">
                            {n === 1 ? 'Free' : !hasVideo(n) ? 'Coming soon' : isPlayable ? 'Video' : 'Pro'}
                          </span>
                        </span>
                        {current && isPlayable ? (
                          <FaPlayCircle className="text-brand shrink-0" />
                        ) : isLocked ? (
                          <FaLock className="text-xs pro-gold-text shrink-0" />
                        ) : null}
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
