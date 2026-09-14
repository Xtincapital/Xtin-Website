const LESSON_ROUTE_ALIASES = {
  'algo-trading': 'algorithmic-trading',
  'risk': 'risk-management',
  'lti': 'long-term-investing',
  'pc': 'portfolio-construction',
  'deriv': 'derivatives',
  'tax': 'taxes',
};

const PATH_ALIASES = {
  '/learn/personal-finance-basics': { moduleSlug: 'personal-finance', lessonSlug: 'lesson-1' },
};

const normalizePathname = (pathname = '') => {
  const trimmed = pathname.split('?')[0].split('#')[0];
  return trimmed.length > 1 ? trimmed.replace(/\/$/, '') : trimmed;
};

export const getLessonInfoFromPath = (pathname) => {
  const normalized = normalizePathname(pathname);

  if (PATH_ALIASES[normalized]) {
    return PATH_ALIASES[normalized];
  }

  const hyphenMatch = normalized.match(/^\/learn\/([^/]+)-lesson-(\d+)$/);
  if (hyphenMatch) {
    const prefix = hyphenMatch[1];
    const moduleSlug = LESSON_ROUTE_ALIASES[prefix] || prefix;
    return {
      moduleSlug,
      lessonSlug: `lesson-${hyphenMatch[2]}`,
    };
  }

  const slashMatch = normalized.match(/^\/learn\/([^/]+)\/lesson-(\d+)$/);
  if (slashMatch) {
    const prefix = slashMatch[1];
    const moduleSlug = LESSON_ROUTE_ALIASES[prefix] || prefix;
    return {
      moduleSlug,
      lessonSlug: `lesson-${slashMatch[2]}`,
    };
  }

  return null;
};
