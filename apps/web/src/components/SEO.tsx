import { useEffect } from 'react';

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
  const siteName = 'Xtin Capital';
  const siteUrl = 'https://www.xtincapital.com';
  const twitterHandle = '@XtinCapital';
  
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | Advanced Algorithmic Trading Platform & Financial Advisory`;
  const fullUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;

  useEffect(() => {
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
    setMetaTag('og:site_name', siteName, true);

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
  }, [fullTitle, description, keywords, fullUrl, ogImage, ogType, structuredData, noIndex]);

  // This component doesn't render anything
  return null;
};

export default SEO;

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
