// Study frame for the hand-written lesson pages (Personal Finance, Stock
// Market, Trading Basics, Technical Analysis, F&O and the rest). The lesson
// keeps its own content; this adds the "Study" view from the approved concept
// (documents/design-concepts/learn-video-study-redesign.html) around it:
// reading bar, breadcrumb, an "On this page" rail built from the lesson's
// <h2>s, and a sidebar with reading progress and the module's lesson list.
// The data-driven modules use StudyLesson instead.
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getModuleInfo } from "../../../constants/learningModules";
import { STANDALONE_MODULES } from "../data/standaloneLessons";

interface Props {
  /** Key in STANDALONE_MODULES (the lesson's folder name). */
  module: string;
  lessonNumber: number;
  children: React.ReactNode;
}

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

const StudyShell = ({ module, lessonNumber, children }: Props) => {
  const mod = STANDALONE_MODULES[module];
  const info = mod ? getModuleInfo(mod.moduleId) : null;
  const contentRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<{ id: string; text: string }[]>([]);
  const [active, setActive] = useState("");
  const [readPct, setReadPct] = useState(0);

  // Build the contents rail from the lesson's own section headings.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const used = new Set<string>();
    const items = [...el.querySelectorAll("h2")]
      .map((h) => {
        const text = (h.textContent || "").replace(/^[\p{Extended_Pictographic}\uFE0F\s]+/u, "").trim();
        if (!text) return null;
        if (!h.id) {
          let id = `study-${slug(text)}`;
          while (used.has(id)) id += "-x";
          h.id = id;
        }
        used.add(h.id);
        h.classList.add("scroll-mt-28");
        return { id: h.id, text };
      })
      .filter(Boolean) as { id: string; text: string }[];
    setToc(items);
  }, [lessonNumber]);

  // Reading progress + the heading currently on screen.
  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      setReadPct(Math.round(Math.max(0, Math.min(1, span > 0 ? -r.top / span : 1)) * 100));
      let cur = "";
      toc.forEach(({ id }) => {
        const h = document.getElementById(id);
        if (h && h.getBoundingClientRect().top < 160) cur = id;
      });
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [toc]);

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
            {mod && (
              <>
                <FaChevronRight className="text-[10px] opacity-60" />
                <Link to={mod.overviewPath} className="hover:text-brand">{info?.title || "Module"}</Link>
              </>
            )}
            <FaChevronRight className="text-[10px] opacity-60" />
            <span className="font-bold text-gray-900 dark:text-slate-100">Lesson {lessonNumber}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] xl:grid-cols-[200px_minmax(0,1fr)_260px]">
            {/* Contents rail */}
            <nav aria-label="On this page" className="hidden xl:block sticky top-28 self-start text-sm max-h-[calc(100vh-8rem)] overflow-y-auto">
              {toc.length > 0 && (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand mb-3">On this page</p>
                  {toc.map(({ id, text }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className={`block py-1.5 pl-3 border-l-2 leading-snug transition-colors ${active === id ? "border-brand text-gray-900 dark:text-slate-100 font-bold" : "border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"}`}
                    >
                      {text}
                    </a>
                  ))}
                </>
              )}
            </nav>

            {/* The lesson's own content */}
            <div ref={contentRef} className="min-w-0">
              {children}
            </div>

            {/* Sidebar */}
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
              {mod && (
                <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                  <div className="px-4 pt-4 pb-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">Module</p>
                    <p className="font-bold text-sm mt-1">{info?.title}</p>
                  </div>
                  <ul className="p-2 max-h-[26rem] overflow-y-auto">
                    {mod.lessons.map((item) => {
                      const current = item.n === lessonNumber;
                      const past = item.n < lessonNumber;
                      return (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            aria-current={current ? "page" : undefined}
                            className={`flex items-center gap-3 p-2 rounded-xl text-sm transition-colors ${current ? "bg-brand-soft ring-1 ring-brand-line" : "hover:bg-gray-50 dark:hover:bg-slate-800"}`}
                          >
                            <span className={`w-6 h-6 shrink-0 rounded-full grid place-items-center text-[10px] font-bold tabular-nums border-[1.5px] ${current ? "border-brand text-brand" : past ? "border-transparent bg-brand-soft text-brand" : "border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-500"}`}>
                              {String(item.n).padStart(2, "0")}
                            </span>
                            <span className={`leading-snug line-clamp-2 ${current ? "font-bold" : "text-gray-700 dark:text-slate-300"}`}>{item.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudyShell;
