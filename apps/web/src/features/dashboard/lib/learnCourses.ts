// Every Learn course whose lessons record progress, with how many lessons
// count. Slugs are the `module_slug` that LessonProgressTracker saves (see
// utils/lessonProgress.ts: the route prefix, or its alias); counts and paths
// come from the /learn routes in App.tsx. Keep in step when a course or
// lesson is added.

export interface LearnCourse {
  slug: string;
  name: string;
  lessons: number;
  /** Where "Resume" goes: the course page, or its first lesson when it has none. */
  path: string;
}

export const LEARN_COURSES: LearnCourse[] = [
  { slug: "personal-finance", name: "Personal Finance", lessons: 9, path: "/learn/personal-finance-basics" },
  { slug: "money-mindset", name: "Money Mindset", lessons: 15, path: "/learn/money-mindset" },
  { slug: "emergency-fund", name: "Emergency Fund", lessons: 15, path: "/learn/emergency-fund" },
  { slug: "financial-planning", name: "Financial Planning", lessons: 15, path: "/learn/financial-planning" },
  { slug: "debt-management", name: "Debt Management", lessons: 15, path: "/learn/debt-management" },
  { slug: "insurance", name: "Insurance", lessons: 7, path: "/learn/insurance" },
  { slug: "retirement-planning", name: "Retirement Planning", lessons: 7, path: "/learn/retirement-planning" },
  { slug: "estate-planning", name: "Estate Planning", lessons: 12, path: "/learn/estate-planning" },
  { slug: "real-estate", name: "Real Estate", lessons: 10, path: "/learn/real-estate" },
  { slug: "taxes", name: "Taxes", lessons: 6, path: "/learn/taxes" },
  { slug: "stock-market", name: "Stock Market", lessons: 7, path: "/learn/stock-market" },
  { slug: "long-term-investing", name: "Long-term Investing", lessons: 7, path: "/learn/long-term-investing" },
  { slug: "portfolio-construction", name: "Portfolio Construction", lessons: 12, path: "/learn/portfolio-construction" },
  { slug: "risk-management", name: "Risk Management", lessons: 7, path: "/learn/risk-management" },
  { slug: "trading-basics", name: "Trading Basics", lessons: 7, path: "/learn/trading-basics" },
  // Lessons 2–7 have their own pages; the course page itself is lesson 1's content.
  { slug: "technical-analysis", name: "Technical Analysis", lessons: 6, path: "/learn/technical-analysis" },
  // Both lesson sets (deriv-lesson-1…7 and derivatives/lesson-1…12) save under "derivatives".
  { slug: "derivatives", name: "Derivatives (F&O)", lessons: 12, path: "/learn/derivatives" },
  { slug: "algorithmic-trading", name: "Algorithmic Trading", lessons: 9, path: "/learn/algorithmic-trading" },
  { slug: "crypto", name: "Crypto", lessons: 15, path: "/learn/crypto" },
];

export interface CourseProgress {
  module_slug: string;
  completed: number;
  last_completed_at: string | null;
}

export interface CourseStatus extends LearnCourse {
  completed: number;
  pct: number;
}

/**
 * What the Learn card shows: the unfinished course touched most recently, or
 * else the first course not finished. `allDone` when every course is.
 */
export function pickCourse(progress: CourseProgress[]): { course: CourseStatus; started: boolean; allDone: boolean } {
  const bySlug = new Map(progress.map((p) => [p.module_slug, p]));
  const status = LEARN_COURSES.map((c): CourseStatus & { last: string } => {
    const p = bySlug.get(c.slug);
    const completed = Math.min(c.lessons, p?.completed ?? 0);
    return { ...c, completed, pct: Math.round((completed / c.lessons) * 100), last: p?.last_completed_at ?? "" };
  });
  const open = status.filter((c) => c.completed < c.lessons);
  const recent = open.filter((c) => c.completed > 0).sort((a, b) => b.last.localeCompare(a.last))[0];
  const course = recent ?? open[0] ?? status[0];
  return { course, started: Boolean(recent), allDone: open.length === 0 };
}
