// Shared reading-lesson layout for the data-driven modules (Money Mindset,
// Debt, Emergency Fund, Insurance, Retirement, Real Estate, Crypto, Estate and
// Financial Planning). Each module's *LessonPage passes its lesson data and
// icons; this renders the "Study" view from the approved concept
// (documents/design-concepts/learn-video-study-redesign.html): reading bar,
// contents rail, article, quiz, takeaway band and a lesson-list aside.
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheck, FaCheckCircle, FaChevronRight, FaRegClock, FaTimesCircle } from "react-icons/fa";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getModuleInfo } from "../../../constants/learningModules";
import { BookOpenIcon, KeyIcon, LightbulbIcon, TargetIcon, WarningIcon } from "./LearningIcons";
import ModuleBadge from "./ModuleBadge";

export interface StudyLessonData {
  num: number;
  title: string;
  subtitle: string;
  duration: string;
  objectives: string[];
  sections: {
    heading: string;
    body: string[];
    bullets?: string[];
    callout?: { type: string; title: string; text: string };
  }[];
  quiz: { question: string; options: string[]; correct: number; explanation: string };
  takeaway: string;
}

type IconType = React.ComponentType<{ className?: string }>;

interface Props {
  lessons: StudyLessonData[];
  lessonNumber: number;
  /** Module id from constants/learningModules, e.g. "money-mindset". */
  moduleId: string;
  /** One icon per lesson, in order. */
  icons: IconType[];
  /** Optional topic chip shown next to the read time, e.g. "Habit Building". */
  topic?: string;
}

const CALLOUTS: Record<string, { box: string; title: string; icon: IconType }> = {
  principle: { box: "bg-brand-soft border-brand-line", title: "text-brand", icon: KeyIcon },
  warning: { box: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40", title: "text-amber-700 dark:text-amber-300", icon: WarningIcon },
};

const StudyLesson = ({ lessons, lessonNumber, moduleId, icons, topic }: Props) => {
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [readPct, setReadPct] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const articleRef = useRef<HTMLElement>(null);

  const lesson = lessons.find((item) => item.num === lessonNumber) || lessons[0];
  const total = lessons.length;
  const info = getModuleInfo(moduleId);
  const basePath = `/learn/${moduleId}`;
  const lessonPath = (n: number) => `${basePath}-lesson-${n}`;
  const previousPath = lesson.num === 1 ? basePath : lessonPath(lesson.num - 1);
  const nextPath = lesson.num === total ? basePath : lessonPath(lesson.num + 1);
  const LessonIcon = icons[lesson.num - 1] || BookOpenIcon;
  const answered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === lesson.quiz.correct;

  // New lesson → fresh quiz and top of page.
  useEffect(() => { setSelectedAnswer(null); }, [lesson.num]);

  // Reading progress + which section is on screen.
  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      setReadPct(Math.round(Math.max(0, Math.min(1, span > 0 ? -r.top / span : 1)) * 100));
      let cur = 0;
      lesson.sections.forEach((_, i) => {
        const h = document.getElementById(`study-s${i}`);
        if (h && h.getBoundingClientRect().top < 160) cur = i;
      });
      setActiveSection(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [lesson]);

  const quizId = lesson.sections.length;

  return (
    <div className="bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Reading bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none" aria-hidden="true">
        <div className="h-full bg-brand-fill transition-[width] duration-150" style={{ width: `${readPct}%` }} />
      </div>

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-8">
            <Link to="/learn" className="hover:text-brand">Learn</Link>
            {info && (<><FaChevronRight className="text-[10px] opacity-60" /><span>{info.level}</span></>)}
            <FaChevronRight className="text-[10px] opacity-60" />
            <Link to={basePath} className="hover:text-brand">{info?.title || "Module"}</Link>
            <FaChevronRight className="text-[10px] opacity-60" />
            <span className="font-bold text-gray-900 dark:text-slate-100">Lesson {lesson.num}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] xl:grid-cols-[200px_minmax(0,1fr)_260px]">
            {/* Contents rail */}
            <nav aria-label="On this page" className="hidden xl:block sticky top-28 self-start text-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand mb-3">On this page</p>
              {lesson.sections.map((section, i) => (
                <a
                  key={section.heading}
                  href={`#study-s${i}`}
                  className={`block py-1.5 pl-3 border-l-2 leading-snug transition-colors ${activeSection === i && readPct < 100 ? "border-brand text-gray-900 dark:text-slate-100 font-bold" : "border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"}`}
                >
                  {section.heading}
                </a>
              ))}
              <a
                href={`#study-s${quizId}`}
                className={`block py-1.5 pl-3 border-l-2 transition-colors ${readPct >= 100 ? "border-brand text-gray-900 dark:text-slate-100 font-bold" : "border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"}`}
              >
                Quick check
              </a>
            </nav>

            {/* Article */}
            <article ref={articleRef} className="min-w-0 max-w-[68ch]">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {lesson.num === 1 && <ModuleBadge moduleId={moduleId} />}
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">
                  Lesson {lesson.num} of {total}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-[-0.025em] text-balance">{lesson.title}</h1>
              <p className="text-lg text-gray-500 dark:text-slate-400 mt-3">{lesson.subtitle}</p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-gray-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5"><FaRegClock className="text-xs" /> {lesson.duration} read</span>
                <span className="inline-flex items-center gap-1.5"><LessonIcon className="w-4 h-4" /> {lesson.sections.length} section{lesson.sections.length === 1 ? "" : "s"}</span>
                <span className="inline-flex items-center gap-1.5"><FaCheckCircle className="text-xs" /> 1 quiz question</span>
                {topic && <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs font-bold">{topic}</span>}
              </div>

              {/* Objectives */}
              <div className="mt-8 rounded-2xl border border-brand-line bg-brand-soft p-5">
                <p className="font-bold flex items-center gap-2 mb-3">
                  <TargetIcon className="w-5 h-5 text-brand" /> After this lesson, you'll know
                </p>
                <ul className="space-y-2">
                  {lesson.objectives.map((objective) => (
                    <li key={objective} className="flex items-start gap-3 text-gray-700 dark:text-slate-200">
                      <FaCheck className="text-brand text-xs mt-1.5 shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {lesson.sections.map((section, i) => (
                <section key={section.heading}>
                  <h2 id={`study-s${i}`} className="scroll-mt-28 text-2xl font-bold tracking-[-0.02em] mt-12 mb-4">{section.heading}</h2>
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-base md:text-[17px] leading-[1.75] text-gray-700 dark:text-slate-300 mb-4">{paragraph}</p>
                  ))}
                  {section.bullets && (
                    <ul className="my-6 space-y-2.5">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-3 text-gray-700 dark:text-slate-300 leading-relaxed">
                          <span className="mt-1 w-5 h-5 shrink-0 rounded-full bg-brand-soft grid place-items-center">
                            <FaCheck className="text-brand text-[9px]" />
                          </span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.callout && (() => {
                    const style = CALLOUTS[section.callout.type] || CALLOUTS.principle;
                    const Icon = section.callout.type === "warning" ? style.icon : LightbulbIcon;
                    return (
                      <div className={`${style.box} border rounded-2xl p-4 sm:p-5 mt-6 flex gap-3`}>
                        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.title}`} />
                        <div>
                          <p className={`font-bold ${style.title}`}>{section.callout.title}</p>
                          <p className="text-gray-700 dark:text-slate-300 leading-relaxed mt-0.5">{section.callout.text}</p>
                        </div>
                      </div>
                    );
                  })()}
                </section>
              ))}

              {/* Quiz */}
              <div id={`study-s${quizId}`} className="scroll-mt-28 mt-12 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">Quick check</p>
                <p className="text-lg font-bold mt-2 mb-4">{lesson.quiz.question}</p>
                <div className="space-y-2">
                  {lesson.quiz.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrectOption = lesson.quiz.correct === index;
                    const state = answered && isCorrectOption
                      ? "border-brand bg-brand-soft"
                      : answered && isSelected
                        ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-200 dark:border-slate-700 hover:border-brand-line";
                    return (
                      <button
                        key={option}
                        onClick={() => !answered && setSelectedAnswer(index)}
                        disabled={answered}
                        className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl border transition-colors ${state}`}
                      >
                        <span className={`w-6 h-6 shrink-0 rounded-md grid place-items-center text-[11px] font-bold border ${answered && isCorrectOption ? "bg-brand-fill border-transparent text-white" : answered && isSelected ? "bg-red-500 border-transparent text-white" : "border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400"}`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1 text-gray-800 dark:text-slate-200">{option}</span>
                        {answered && isCorrectOption && <FaCheckCircle className="text-brand" />}
                        {answered && isSelected && !isCorrectOption && <FaTimesCircle className="text-red-500" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-3 min-h-[1.5rem]" aria-live="polite">
                  {answered && (<><b className={isCorrect ? "text-brand" : "text-red-500"}>{isCorrect ? "Correct." : "Not quite."}</b> {lesson.quiz.explanation}</>)}
                </p>
              </div>

              {/* Key takeaway */}
              <div className="relative overflow-hidden mt-8 rounded-2xl p-6 bg-gradient-to-br from-[#052E16] via-[#14532D] to-[#166534] text-green-50 brand-on-dark">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-green-300 flex items-center gap-2">
                  <BookOpenIcon className="w-4 h-4" /> Key takeaway
                </p>
                <p className="text-lg font-bold text-white mt-2 leading-snug">{lesson.takeaway}</p>
              </div>

              {/* Prev / next */}
              <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3 justify-between">
                <button
                  onClick={() => navigate(previousPath)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm hover:border-brand-line transition-colors"
                >
                  <FaArrowLeft className="text-xs" />
                  {lesson.num === 1 ? "Module overview" : `Lesson ${lesson.num - 1} · ${lessons[lesson.num - 2]?.title}`}
                </button>
                <button
                  onClick={() => navigate(nextPath)}
                  className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-fill hover:bg-brand-hover text-white font-bold text-sm shadow-lg shadow-brand/25 transition-colors"
                >
                  {lesson.num === total ? "Finish module" : `Lesson ${lesson.num + 1} · ${lessons[lesson.num]?.title}`}
                  <FaArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </article>

            {/* Aside */}
            <aside className="lg:sticky lg:top-28 lg:self-start space-y-4">
              <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="font-bold text-sm">Lesson progress</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-brand-fill rounded-full transition-[width] duration-150" style={{ width: `${readPct}%` }} />
                  </div>
                  <span className="text-xs font-bold tabular-nums text-gray-500 dark:text-slate-400 w-9 text-right">{readPct}%</span>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                <div className="px-4 pt-4 pb-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">Module</p>
                  <p className="font-bold text-sm mt-1">{info?.title}</p>
                </div>
                <ul className="p-2 max-h-[26rem] overflow-y-auto">
                  {lessons.map((item) => {
                    const current = item.num === lesson.num;
                    const past = item.num < lesson.num;
                    return (
                      <li key={item.num}>
                        <Link
                          to={lessonPath(item.num)}
                          aria-current={current ? "page" : undefined}
                          className={`flex items-center gap-3 p-2 rounded-xl text-sm transition-colors ${current ? "bg-brand-soft ring-1 ring-brand-line" : "hover:bg-gray-50 dark:hover:bg-slate-800"}`}
                        >
                          <span className={`w-6 h-6 shrink-0 rounded-full grid place-items-center text-[10px] font-bold tabular-nums border-[1.5px] ${current ? "border-brand text-brand" : past ? "border-transparent bg-brand-soft text-brand" : "border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-500"}`}>
                            {String(item.num).padStart(2, "0")}
                          </span>
                          <span className={`leading-snug line-clamp-2 ${current ? "font-bold" : "text-gray-700 dark:text-slate-300"}`}>{item.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudyLesson;
