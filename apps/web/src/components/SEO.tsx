import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Xtin Capital';
const SITE_URL = 'https://www.xtincapital.com';
const DEFAULT_TITLE = `${SITE_NAME} | AI Trading Tools, Research & Financial Education`;

// The description from index.html, restored on pages that don't set their own.
const DEFAULT_DESCRIPTION =
  typeof document !== 'undefined'
    ? document.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''
    : '';

// Path the most recent <SEO> applied its tags for. RouteMetaFallback uses it
// to tell whether the current page set its own title.
let lastSeoPath: string | null = null;

/**
 * SEO Component for managing document head meta tags
 * Since react-helmet-async doesn't support React 19 yet,
 * this custom component handles SEO meta tags dynamically.
 * 
 * @param {Object} props
 * @param {string} props.title - Page title (will be appended with site name)
 * @param {string} props.description - Meta description (150-160 chars recommended)
 * @param {string} props.keywords - Comma-separated keywords
 * @param {string} props.canonicalUrl - Canonical URL for the page
 * @param {string} props.ogImage - Open Graph image URL
 * @param {string} props.ogType - Open Graph type (default: website)
 * @param {Object} props.structuredData - JSON-LD structured data object
 * @param {boolean} props.noIndex - Whether to add noindex directive
 */
interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object;
  noIndex?: boolean;
}

const SEO = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = 'https://www.xtincapital.com/favicon.png',
  ogType = 'website',
  structuredData,
  noIndex = false
}: SEOProps) => {
  const twitterHandle = '@XtinCapital';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  // Without an explicit canonicalUrl the page is canonical for its own path
  // (pointing every such page at the homepage tells search engines they're duplicates).
  const fullUrl = `${SITE_URL}${canonicalUrl ?? pathname}`;

  useEffect(() => {
    lastSeoPath = pathname;

    // Update document title
    document.title = fullTitle;

    // Helper function to update or create meta tags
    const setMetaTag = (name, content, isProperty = false) => {
      if (!content) return;
      
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    // Helper function to update or create link tags
    const setLinkTag = (rel, href) => {
      if (!href) return;
      
      let link = document.querySelector(`link[rel="${rel}"]`);
      
      if (link) {
        link.setAttribute('href', href);
      } else {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        link.setAttribute('href', href);
        document.head.appendChild(link);
      }
    };

    // Primary Meta Tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    
    // Robots
    if (noIndex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Open Graph
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:url', fullUrl, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:site_name', SITE_NAME, true);

    // Twitter
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:url', fullUrl);
    setMetaTag('twitter:image', ogImage);
    setMetaTag('twitter:site', twitterHandle);
    setMetaTag('twitter:creator', twitterHandle);

    // Canonical URL
    setLinkTag('canonical', fullUrl);

    // Structured Data (JSON-LD)
    if (structuredData) {
      // Remove existing page-specific structured data
      const existingScript = document.querySelector('script[data-seo-page]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-page', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Remove page-specific structured data on unmount
      const pageScript = document.querySelector('script[data-seo-page]');
      if (pageScript) {
        pageScript.remove();
      }
    };
  }, [fullTitle, description, keywords, fullUrl, ogImage, ogType, structuredData, noIndex, pathname]);

  // This component doesn't render anything
  return null;
};

export default SEO;

// ── Fallback for pages without <SEO> ─────────────────────────────────────

const ACRONYMS = new Set(['ai', 'cagr', 'elss', 'emi', 'epf', 'fd', 'hra', 'nps', 'ppf', 'rd', 'sip', 'ssy', 'swp']);

// Names for URL segments that don't read well title-cased.
const SEGMENT_NAMES: Record<string, string> = {
  journal: 'Trading Journal',
  gini: 'Gini AI Planner',
  fundakamental: 'Fundakamental',
  learn: 'Xtin Academy',
  tools: 'Financial Calculators',
  algos: 'Trading Algorithms',
  backtest: 'AI Backtesting',
  app: '',
  intro: '',
  courses: 'Course',
  help: 'Help Center',
  'ssy-calculator': 'SSY Calculator',
  'real-estate-investment': 'Real Estate Investment Calculator',
  'income-tax': 'Income Tax Calculator',
};

const humanize = (segment: string) =>
  segment
    .split('-')
    .map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');

/** "/gini/monte-carlo" → "Monte Carlo – Gini AI Planner". IDs in the path are skipped. */
export const titleForPath = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  const parts = segments
    .filter((s) => !/\d/.test(s) || /^[a-z]+(-[a-z]+)*-\d+$/.test(s)) // keep "lesson-3", drop ids
    .map((s, i) => {
      if (s in SEGMENT_NAMES) return SEGMENT_NAMES[s];
      const name = humanize(s);
      // Calculator pages: /tools/fd → "FD Calculator"
      return segments[0] === 'tools' && i === 1 ? `${name} Calculator` : name;
    })
    .filter(Boolean);
  if (parts.length === 0) return DEFAULT_TITLE;
  return `${parts.reverse().join(' – ')} | ${SITE_NAME}`;
};

const setHeadTag = (selector: string, create: () => HTMLElement, attr: string, value: string) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

/**
 * Render once inside the Router, after <Routes>. On every route change, if the
 * new page did not render <SEO>, sets a title and canonical URL derived from
 * the path — otherwise the previous page's title and canonical would remain.
 */
export const RouteMetaFallback = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // A page's <SEO> effect runs before this one in the same commit; a lazy
    // page's <SEO> may run later, and then simply overwrites what we set here.
    if (lastSeoPath === pathname) return;

    const title = titleForPath(pathname);
    const url = `${SITE_URL}${pathname}`;
    document.title = title;
    const meta = (key: string, isProperty = false) => () => {
      const m = document.createElement('meta');
      m.setAttribute(isProperty ? 'property' : 'name', key);
      return m;
    };
    setHeadTag('meta[property="og:title"]', meta('og:title', true), 'content', title);
    setHeadTag('meta[name="twitter:title"]', meta('twitter:title'), 'content', title);
    setHeadTag('meta[property="og:url"]', meta('og:url', true), 'content', url);
    setHeadTag('meta[name="twitter:url"]', meta('twitter:url'), 'content', url);
    if (DEFAULT_DESCRIPTION) {
      setHeadTag('meta[name="description"]', meta('description'), 'content', DEFAULT_DESCRIPTION);
      setHeadTag('meta[property="og:description"]', meta('og:description', true), 'content', DEFAULT_DESCRIPTION);
      setHeadTag('meta[name="twitter:description"]', meta('twitter:description'), 'content', DEFAULT_DESCRIPTION);
    }
    setHeadTag(
      'link[rel="canonical"]',
      () => {
        const l = document.createElement('link');
        l.setAttribute('rel', 'canonical');
        return l;
      },
      'href',
      url
    );
  }, [pathname]);

  return null;
};

// SEO utility functions for generating structured data

/**
 * Generate BreadcrumbList structured data
 * @param {Array} items - Array of {name, url} objects
 */
export const generateBreadcrumbData = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': items.map((item, index) => ({
    '@type': 'ListItem',
    'position': index + 1,
    'name': item.name,
    'item': `https://www.xtincapital.com${item.url}`
  }))
});

/**
 * Generate Article structured data for blog/learn pages
 * @param {Object} article - Article details
 */
export const generateArticleData = (article) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  'headline': article.title,
  'description': article.description,
  'image': article.image || 'https://www.xtincapital.com/favicon.png',
  'author': {
    '@type': 'Organization',
    'name': 'Xtin Capital'
  },
  'publisher': {
    '@type': 'Organization',
    'name': 'Xtin Capital',
    'logo': {
      '@type': 'ImageObject',
      'url': 'https://www.xtincapital.com/favicon.png',
      'width': 512,
      'height': 512
    }
  },
  'datePublished': article.datePublished,
  'dateModified': article.dateModified || article.datePublished
});

/**
 * Generate SoftwareApplication structured data for tools
 * @param {Object} tool - Tool details
 */
export const generateToolData = (tool) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  'name': tool.name,
  'description': tool.description,
  'applicationCategory': 'FinanceApplication',
  'operatingSystem': 'Web Browser',
  'offers': {
    '@type': 'Offer',
    'price': '0',
    'priceCurrency': 'INR'
  },
  'provider': {
    '@type': 'Organization',
    'name': 'Xtin Capital'
  }
});

/**
 * Generate FAQPage structured data
 * @param {Array} faqs - Array of {question, answer} objects
 */
export const generateFAQData = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': faqs.map(faq => ({
    '@type': 'Question',
    'name': faq.question,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': faq.answer
    }
  }))
});

/**
 * Generate Course structured data for learning content
 * @param {Object} course - Course details
 */
export const generateCourseData = (course) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  'name': course.name,
  'description': course.description,
  'provider': {
    '@type': 'Organization',
    'name': 'Xtin Capital',
    'sameAs': 'https://www.xtincapital.com'
  },
  'educationalLevel': course.level || 'Beginner',
  'courseMode': 'Online'
});
