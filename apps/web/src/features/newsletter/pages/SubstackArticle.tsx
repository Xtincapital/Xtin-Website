import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import SEO from '../../../components/SEO';
import newsletterService from '../../../services/newsletterService';

const SubstackArticle = () => {
  const { slug } = useParams();
  const location = useLocation();
  // Use the list item passed via navigation state for instant header render.
  const preloaded = location.state?.article || null;

  const [article, setArticle] = useState(preloaded);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Newsletter subscribe (saves to the subscriptions table via the API).
  const [email, setEmail] = useState('');
  const [subMessage, setSubMessage] = useState('');
  const [subError, setSubError] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  const handleSubscribe = async () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email || !emailRegex.test(email)) {
      setSubMessage('Please enter a valid email address.');
      setSubError(true);
      return;
    }
    setSubLoading(true);
    setSubMessage('');
    setSubError(false);
    try {
      await newsletterService.subscribeToNewsletter(email);
      setEmail('');
      setSubMessage('Thank you for subscribing!');
      setSubError(false);
    } catch (err) {
      const text = (err?.message || '').toLowerCase();
      const alreadyMember =
        text.includes('already subscribed') ||
        text.includes('already a member') ||
        text.includes('duplicate');
      if (alreadyMember) {
        setSubMessage('You are already a member of our newsletter.');
        setSubError(false);
      } else {
        setSubMessage('Error: Could not subscribe. Please try again.');
        setSubError(true);
      }
    } finally {
      setSubLoading(false);
    }
  };

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await newsletterService.getSubstackArticleBySlug(slug);
        setArticle(data);
      } catch (err) {
        setError('Failed to load article: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchArticle();
    window.scrollTo(0, 0);
  }, [slug]);

  // Sanitize the Substack-provided HTML before rendering. Allow the embeds
  // Substack uses (images, iframes for video/tweets) while stripping scripts.
  const safeHtml = useMemo(() => {
    if (!article?.bodyHtml) return '';
    return DOMPurify.sanitize(article.bodyHtml, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target'],
    });
  }, [article?.bodyHtml]);

  const formattedDate = article?.postDate
    ? new Date(article.postDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="bg-white dark:bg-slate-950 text-gray-800 dark:text-slate-100 min-h-screen">
      <SEO
        title={article?.title ? `${article.title} - Xtin Capital` : 'Article - Xtin Capital'}
        description={article?.subtitle || 'Long-form analysis from Xtin Capital.'}
        canonicalUrl={`/newsletter/article/${slug}`}
      />
      <Navbar />

      <article className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 max-w-3xl">
        {/* Back link */}
        <Link
          to="/newsletter"
          className="inline-flex items-center gap-2 text-sm font-medium text-green-600 dark:text-emerald-300 hover:gap-3 transition-all mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Newsletter</span>
        </Link>

        {/* Header */}
        {article && (
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-gray-900 dark:text-slate-100 mb-4">
              {article.title}
            </h1>
            {article.subtitle && (
              <p className="text-lg text-gray-600 dark:text-slate-300 mb-6">{article.subtitle}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-slate-400 pb-6 border-b border-gray-100 dark:border-slate-800">
              {article.author && <span className="font-medium text-gray-700 dark:text-slate-200">{article.author}</span>}
              {formattedDate && <span>{formattedDate}</span>}
              {article.wordcount ? <span>{Math.max(1, Math.round(article.wordcount / 200))} min read</span> : null}
            </div>
            {article.coverImage && (
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full rounded-2xl mt-8 object-cover"
              />
            )}
          </header>
        )}

        {/* Body */}
        {loading && !article?.bodyHtml ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 mb-4">{error}</p>
            {article?.canonicalUrl && (
              <a
                href={article.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all"
              >
                Read on Substack
              </a>
            )}
          </div>
        ) : article?.bodyHtml ? (
          <>
            <div
              className="substack-content"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
            {article.truncated && (
              <div className="mt-10 p-6 rounded-2xl bg-green-50 dark:bg-emerald-950/30 border border-green-100 dark:border-emerald-800/40 text-center">
                <p className="text-gray-700 dark:text-slate-200 mb-4">
                  This is a paid post. Continue reading the full article on Substack.
                </p>
                <a
                  href={article.canonicalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  Read full article on Substack
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-slate-400">
            Article content is unavailable.
          </div>
        )}

        {/* Footer link to original */}
        {article?.canonicalUrl && !article?.truncated && (
          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-slate-800 text-center">
            <a
              href={article.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-600 dark:text-emerald-300 font-medium hover:underline"
            >
              View original on Substack
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </article>

      {/* Subscribe band — saves the email to the subscriptions table */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950 border-t border-gray-100 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-3">
            Get more from{' '}
            <a href="https://www.xtincapital.com" className="text-green-600 dark:text-emerald-300 hover:underline">
              Xtin Capital
            </a>
          </h2>
          <p className="text-gray-600 dark:text-slate-300 mb-8">
            Financial news and market insights, delivered in plain English. Subscribe free.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 max-w-lg mx-auto">
            <label htmlFor="substack-subscribe-email" className="sr-only">Email address</label>
            <input
              id="substack-subscribe-email"
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border-0 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
            />
            <button
              onClick={handleSubscribe}
              disabled={subLoading}
              className={`px-7 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow transition-all duration-300 whitespace-nowrap ${
                subLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
              }`}
            >
              {subLoading ? 'Subscribing...' : 'Subscribe Free'}
            </button>
          </div>
          {subMessage && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-medium inline-block ${
              subError
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300'
                : 'bg-green-50 dark:bg-emerald-900/20 text-green-600 dark:text-emerald-300'
            }`}>
              {subError ? subMessage : '🎉 ' + subMessage}
            </div>
          )}
        </div>
      </section>

      {/* Typography for Substack-rendered HTML */}
      <style>{`
        .substack-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #374151;
        }
        .dark .substack-content { color: #cbd5e1; }
        .substack-content p { margin: 0 0 1.5rem; }
        .substack-content h1,
        .substack-content h2,
        .substack-content h3,
        .substack-content h4 {
          font-weight: 700;
          line-height: 1.3;
          margin: 2.5rem 0 1rem;
          color: #111827;
        }
        .dark .substack-content h1,
        .dark .substack-content h2,
        .dark .substack-content h3,
        .dark .substack-content h4 { color: #f1f5f9; }
        .substack-content h1 { font-size: 1.875rem; }
        .substack-content h2 { font-size: 1.5rem; }
        .substack-content h3 { font-size: 1.25rem; }
        .substack-content a {
          color: #059669;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .substack-content a:hover { color: #047857; }
        .substack-content img,
        .substack-content .image2,
        .substack-content figure img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 2rem auto;
          display: block;
        }
        .substack-content figure { margin: 2rem 0; }
        .substack-content figcaption {
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }
        .substack-content blockquote {
          border-left: 4px solid #059669;
          padding-left: 1.25rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #4b5563;
        }
        .dark .substack-content blockquote { color: #94a3b8; }
        .substack-content ul,
        .substack-content ol { margin: 0 0 1.5rem 1.5rem; }
        .substack-content li { margin-bottom: 0.5rem; }
        .substack-content hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 2.5rem 0;
        }
        .dark .substack-content hr { border-top-color: #334155; }
        .substack-content .button,
        .substack-content .subscribe-widget { display: none; }
        .substack-content pre {
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        .dark .substack-content pre { background: #1e293b; }
      `}</style>

      <Footer />
    </div>
  );
};

export default SubstackArticle;
