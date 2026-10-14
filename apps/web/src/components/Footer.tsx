import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import newsletterService from '../services/newsletterService';
import { BACKEND_URL } from '../config/env';
import { COMPANY, companyAddress } from '../constants/company';
import { Mail, Send, ArrowUp } from 'lucide-react';

const Footer = () => {
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  
  // Featured platforms logos
  const featuredPlatforms = [
    {
      name: 'Startup Time',
      logo: '/logos/Logo1.png',
    },
    {
      name: 'Mumbai Growth & Success Award',
      logo: '/logos/logo2.jpg',
    },
    {
      name: 'Ideathon',
      logo: '/logos/logo3.jpeg',
    },
  ];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterIsError, setNewsletterIsError] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Save to database
      const response = await fetch(`${BACKEND_URL}/api/help/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message
        })
      });

      if (!response.ok) {
        // Read the body once — calling .json() then .text() throws "body stream already read"
        const errorText = await response.text();
        let errorMessage = 'Failed to submit your message. Please try again.';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Non-JSON error body; keep the generic message
        }
        console.error('Response error:', response.status, errorText);
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('Form saved to database successfully:', responseData);

      setSubmitStatus('success');
      setErrorMessage('');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

      // Auto close success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
        setErrorMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewsletterSubscribe = async () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!newsletterEmail || !emailRegex.test(newsletterEmail)) {
      setNewsletterMessage('Please enter a valid email address.');
      setNewsletterIsError(true);
      return;
    }
    setNewsletterLoading(true);
    setNewsletterMessage('');
    setNewsletterIsError(false);
    try {
      await newsletterService.subscribeToNewsletter(newsletterEmail);
      setNewsletterEmail('');
      setNewsletterMessage('Thank you for subscribing!');
      setNewsletterIsError(false);
    } catch (err) {
      console.error('Subscription error:', err);
      setNewsletterMessage('Error: Could not subscribe. Please try again.');
      setNewsletterIsError(true);
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <footer className="relative isolate overflow-hidden bg-gray-100 dark:bg-slate-950 text-gray-700 dark:text-slate-300 py-12 px-6 md:px-12 lg:px-24 border-t border-transparent dark:border-slate-800">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-fill/60 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-56 w-[640px] -translate-x-1/2 rounded-full bg-brand-soft opacity-70 blur-[90px]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 text-brand opacity-[0.10] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000,transparent_65%)]" />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-6">
        
        {/* Logo / Brand */}
        <div className="flex flex-col">
          <a
            href="https://www.xtincapital.com"
            className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-1 hover:opacity-80 transition"
            aria-label="Xtin Capital - Home"
          >
            Xtin <span className="text-brand">Capital</span>
          </a>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">A product of XTIN SERVICES LLP</p>
          <p className="mb-4 max-w-xs rounded-xl border border-gray-200 bg-white/60 px-3.5 py-2.5 text-sm leading-relaxed text-gray-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
            AI trading tools, market research &amp; financial education. Not SEBI-registered; nothing on this site is investment advice.
          </p>
          
          {/* Social Media Icons */}
          <div className="flex gap-3">
            <a 
              href="https://t.me/MarketXtin" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Xtin Capital on Telegram (opens in a new tab)"
              className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm hover:bg-brand-hover hover:border-brand-hover hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/25 transition duration-200 group"
            >
              <svg aria-hidden="true" className="w-5 h-5 text-gray-700 dark:text-slate-300 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
            
            <a 
              href="https://www.instagram.com/xtin_capital/" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Xtin Capital on Instagram (opens in a new tab)"
              className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm hover:bg-brand-hover hover:border-brand-hover hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/25 transition duration-200 group"
            >
              <svg aria-hidden="true" className="w-5 h-5 text-gray-700 dark:text-slate-300 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            
            <a 
              href="https://www.linkedin.com/in/xtin-capital-62b987326/" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Xtin Capital on LinkedIn (opens in a new tab)"
              className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm hover:bg-brand-hover hover:border-brand-hover hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/25 transition duration-200 group"
            >
              <svg aria-hidden="true" className="w-5 h-5 text-gray-700 dark:text-slate-300 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            
            <a 
              href="https://www.facebook.com/profile.php?id=61565142854720" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Xtin Capital on Facebook (opens in a new tab)"
              className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm hover:bg-brand-hover hover:border-brand-hover hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/25 transition duration-200 group"
            >
              <svg aria-hidden="true" className="w-5 h-5 text-gray-700 dark:text-slate-300 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            
            <a 
              href="https://www.youtube.com/@XtinCapital" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Xtin Capital on YouTube (opens in a new tab)"
              className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm hover:bg-brand-hover hover:border-brand-hover hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/25 transition duration-200 group"
            >
              <svg aria-hidden="true" className="w-5 h-5 text-gray-700 dark:text-slate-300 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            
            <a 
              href="https://x.com/XtinCapital" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Xtin Capital on X (Twitter) (opens in a new tab)"
              className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm hover:bg-brand-hover hover:border-brand-hover hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/25 transition duration-200 group"
            >
              <svg aria-hidden="true" className="w-5 h-5 text-gray-700 dark:text-slate-300 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-900 dark:text-slate-100">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="group/link inline-flex items-center gap-1 text-gray-600 transition duration-200 hover:text-brand dark:text-slate-400 dark:hover:text-brand">About<span aria-hidden="true" className="-translate-x-1 opacity-0 transition duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-100">→</span></Link></li>
              <li><Link to="/terms" className="group/link inline-flex items-center gap-1 text-gray-600 transition duration-200 hover:text-brand dark:text-slate-400 dark:hover:text-brand">Terms of Service<span aria-hidden="true" className="-translate-x-1 opacity-0 transition duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-100">→</span></Link></li>
              <li><Link to="/privacy" className="group/link inline-flex items-center gap-1 text-gray-600 transition duration-200 hover:text-brand dark:text-slate-400 dark:hover:text-brand">Privacy Policy<span aria-hidden="true" className="-translate-x-1 opacity-0 transition duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-100">→</span></Link></li>
              <li><Link to="/refund-policy" className="group/link inline-flex items-center gap-1 text-gray-600 transition duration-200 hover:text-brand dark:text-slate-400 dark:hover:text-brand">Refund &amp; Cancellation<span aria-hidden="true" className="-translate-x-1 opacity-0 transition duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-100">→</span></Link></li>
              <li><Link to="/shipping-policy" className="group/link inline-flex items-center gap-1 text-gray-600 transition duration-200 hover:text-brand dark:text-slate-400 dark:hover:text-brand">Shipping &amp; Delivery<span aria-hidden="true" className="-translate-x-1 opacity-0 transition duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-100">→</span></Link></li>
              <li><Link to="/algo-terms" className="group/link inline-flex items-center gap-1 text-gray-600 transition duration-200 hover:text-brand dark:text-slate-400 dark:hover:text-brand">Algorithm Terms<span aria-hidden="true" className="-translate-x-1 opacity-0 transition duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-100">→</span></Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-900 dark:text-slate-100">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="group/link inline-flex items-center gap-1 text-gray-600 transition duration-200 hover:text-brand dark:text-slate-400 dark:hover:text-brand">Contact Us<span aria-hidden="true" className="-translate-x-1 opacity-0 transition duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-100">→</span></Link></li>
              <li><button onClick={() => setShowHelpCenter(true)} className="group/link inline-flex items-center gap-1 text-gray-600 transition duration-200 hover:text-brand dark:text-slate-400 dark:hover:text-brand">Help Center</button></li>
              <li><a href={`mailto:${COMPANY.supportEmail}`} className="group/link inline-flex items-center gap-1 text-gray-600 transition duration-200 hover:text-brand dark:text-slate-400 dark:hover:text-brand">{COMPANY.supportEmail}</a></li>
              <li><a href={COMPANY.phoneHref} className="group/link inline-flex items-center gap-1 text-gray-600 transition duration-200 hover:text-brand dark:text-slate-400 dark:hover:text-brand">{COMPANY.phone}</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Featured Platforms & Newsletter Section */}
      <div className="max-w-7xl mx-auto mt-4 px-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Featured Platforms - Left */}
        <div>
          <h3 className="mb-3 text-center text-base font-semibold text-gray-900 dark:text-slate-100 lg:text-left">Our Startup Was Featured On These Platforms</h3>
          <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4">
            {featuredPlatforms.map((platform, index) => (
              <div key={index} className="flex h-16 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-line hover:shadow-md dark:border-slate-700">
                <img
                  src={platform.logo}
                  alt={platform.name}
                  className="h-10 w-auto object-contain opacity-90 transition-all duration-300 hover:opacity-100"
                  title={platform.name}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter - Right */}
        <div className="relative overflow-hidden rounded-2xl border border-brand-line bg-gradient-to-br from-brand-soft via-brand-soft/60 to-transparent p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-fill/20 blur-2xl" />
          <div className="relative mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl bg-brand-fill text-white shadow-md shadow-brand/25"><Mail className="h-5 w-5" /></div>
          <h3 className="relative mb-1 text-center text-base font-semibold text-gray-900 dark:text-slate-100">Join Our Newsletter</h3>
          <p className="relative mb-4 text-center text-xs text-gray-600 dark:text-slate-400">Stay updated with the latest financial news and insights.</p>
          <div className="relative flex flex-col gap-2.5">
            <label htmlFor="footer-newsletter-email" className="sr-only">Email address for newsletter</label>
            <input
              id="footer-newsletter-email"
              type="email"
              placeholder="Enter your email address"
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 transition focus:border-brand-fill focus:outline-none focus:ring-4 focus:ring-brand/15 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              aria-label="Email address for newsletter subscription"
            />
            <button
              className={`inline-flex items-center justify-center gap-2 rounded-xl bg-brand-fill px-4 py-2.5 text-xs font-semibold tracking-wide text-white shadow-lg shadow-brand/20 transition hover:-translate-y-0.5 hover:bg-brand-hover ${
                newsletterLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleNewsletterSubscribe}
              disabled={newsletterLoading}
            >
              {newsletterLoading ? 'SUBSCRIBING...' : (<><Send className="h-3.5 w-3.5" /> SUBSCRIBE</>)}
            </button>
          </div>
          {newsletterMessage && (
            <p className={`mt-2 text-center text-xs ${newsletterIsError ? 'text-red-500' : 'text-brand'}`}>
              {newsletterMessage}
            </p>
          )}
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="mt-10 border-t border-gray-200 pt-6 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            © {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.
          </p>
          <p className="text-xs text-gray-600 dark:text-slate-400 text-center md:text-right">
            LLP ID: {COMPANY.llpId} <span className="mx-1.5 text-brand">•</span> GSTIN: {COMPANY.gstin} <span className="mx-1.5 text-brand">•</span> {companyAddress}
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="group grid h-10 w-10 flex-shrink-0 place-items-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-fill hover:bg-brand-fill hover:text-white hover:shadow-lg hover:shadow-brand/25 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <ArrowUp className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* Help Center Modal */}
      {showHelpCenter && (
        <div className="fixed inset-0 bg-black/60 dark:bg-slate-950/85 flex items-center justify-center z-50 p-4 brand-on-dark">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-transparent border-t-4 border-t-brand-fill shadow-2xl dark:border-slate-700">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Help Center</h2>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl"
                onClick={() => setShowHelpCenter(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-slate-400 mb-6">
                Need assistance? Choose how you'd like to contact us:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Email Option */}
                <div className="border border-brand-line dark:border-brand-line rounded-2xl p-6 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/10 transition bg-brand-soft">
                  <div className="flex items-center justify-center w-12 h-12 bg-brand-fill rounded-full mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Email Us</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-sm mb-4">
                    Send us an email and we'll respond within 24 hours
                  </p>
                  <a 
                    href={`mailto:${COMPANY.supportEmail}`}
                    className="inline-flex items-center text-brand hover:text-brand font-semibold"
                  >
                    {COMPANY.supportEmail}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>

                {/* Phone Option (Green theme to match brand) */}
                <div className="border border-brand-line dark:border-brand-line rounded-2xl p-6 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/10 transition bg-brand-soft">
                  <div className="flex items-center justify-center w-12 h-12 bg-brand-fill rounded-full mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Call Us</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-sm mb-4">
                    Speak with our support team {COMPANY.supportHours}
                  </p>
                  <div className="flex flex-col gap-2">
                    <a 
                      href={COMPANY.phoneHref}
                      className="inline-flex items-center text-brand hover:text-brand font-semibold"
                    >
                      {COMPANY.phone}
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                    <a 
                      href="tel:+61481878963"
                      className="inline-flex items-center text-brand hover:text-brand font-semibold"
                    >
                      +61 481 878 963
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="mt-8 border-t border-gray-200 dark:border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Or Send Us a Message</h3>
                
                {submitStatus === 'success' && (
                  <div className="mb-4 p-4 bg-brand-soft border border-brand-line rounded-lg flex items-center gap-2 text-brand">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Message sent successfully! We'll get back to you soon.
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errorMessage}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name *</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required 
                        className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email *</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required 
                        className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Subject *</label>
                    <input 
                      type="text" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required 
                      className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Message *</label>
                    <textarea 
                      rows={4} 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required 
                      className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-brand-fill hover:bg-brand-hover text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
