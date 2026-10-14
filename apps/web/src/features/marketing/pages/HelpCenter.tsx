import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { BACKEND_URL } from '../../../config/env';
import { Mail, Phone, User, MessageSquare, Send, Clock, ShieldCheck } from 'lucide-react';


// Header artwork: a friendly support desk — envelope, chat bubbles and a headset (inherits brand colour)
const SupportArt = () => (
  <svg viewBox="0 0 240 120" fill="none" className="relative mx-auto mb-6 h-28 w-auto text-brand" role="img" aria-label="Support illustration">
    <style>{`
      @keyframes hc-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      @keyframes hc-pop { 0%,60%,100% { transform: scale(1); } 75% { transform: scale(1.12); } }
      .hc-float { animation: hc-float 4.5s ease-in-out infinite; }
      .hc-float2 { animation: hc-float 5.5s ease-in-out -2s infinite; }
      .hc-pop { animation: hc-pop 3.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
      @media (prefers-reduced-motion: reduce) { .hc-float,.hc-float2,.hc-pop { animation: none; } }
    `}</style>
    <ellipse cx="120" cy="108" rx="78" ry="6" fill="currentColor" opacity=".12"/>
    {/* envelope */}
    <g className="hc-float">
      <rect x="76" y="40" width="88" height="60" rx="10" fill="var(--card, #fff)" stroke="currentColor" strokeWidth="3"/>
      <path d="M80 48l40 30 40-30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M80 94l30-24M160 94l-30-24" stroke="currentColor" strokeOpacity=".35" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="162" cy="42" r="10" fill="currentColor"/><path d="M157.500 42l3 3 5-6" stroke="var(--card, #fff)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    {/* chat bubble left */}
    <g className="hc-float2">
      <path d="M22 26h46a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8H44l-12 10V58h-10a8 8 0 0 1-8-8V34a8 8 0 0 1 8-8z" fill="currentColor" fillOpacity=".14" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
      <g className="hc-pop"><circle cx="30" cy="42" r="3" fill="currentColor"/></g><circle cx="44" cy="42" r="3" fill="currentColor" opacity=".7"/><circle cx="58" cy="42" r="3" fill="currentColor" opacity=".45"/>
    </g>
    {/* chat bubble right */}
    <g className="hc-float" style={{ animationDelay: '-1s' }}>
      <path d="M176 18h42a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8h-8v10l-12-10h-22a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8z" fill="currentColor" fillOpacity=".14" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M182 30h30M182 38h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".7"/>
    </g>
    <g fill="currentColor"><path d="M36 92l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" opacity=".7"/><path d="M206 84l1.500 4 4 1.500-4 1.500-1.500 4-1.500-4-4-1.500 4-1.500z" opacity=".6"/></g>
  </svg>
);

const HelpCenter = () => {
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
      // Save to database first
      console.log('Submitting form data:', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message
      });

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

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

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

      // Email sending is optional - only attempt if credentials are configured
      const serviceId = 'YOUR_SERVICE_ID';
      const templateId = 'YOUR_TEMPLATE_ID';
      const publicKey = 'YOUR_PUBLIC_KEY';

      // Skip email if credentials are not configured (contains placeholder values)
      if (serviceId !== 'YOUR_SERVICE_ID' && templateId !== 'YOUR_TEMPLATE_ID' && publicKey !== 'YOUR_PUBLIC_KEY') {
        try {
          const templateParams = {
            from_name: formData.name,
            from_email: formData.email,
            phone: formData.phone || 'Not provided',
            subject: formData.subject,
            message: formData.message,
            to_email: 'xtinservice@gmail.com'
          };

          await (window as any).emailjs.send(serviceId, templateId, templateParams, publicKey);
          console.log('Email sent successfully');
        } catch (emailError) {
          console.warn('Email sending failed, but form was saved to database:', emailError);
          // Don't throw error for email failure - database save was successful
        }
      } else {
        console.log('EmailJS not configured - skipping email send');
      }

      setSubmitStatus('success');
      setErrorMessage('');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative text-center mb-10 pt-4">
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 -top-10 h-56 w-[28rem] -translate-x-1/2 rounded-full bg-brand-soft blur-3xl opacity-80" />
            <SupportArt />
            <p className="relative xt-eyebrow mb-3">We're here to help</p>
            <h1 className="relative text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4 tracking-[-0.025em]">Contact Us</h1>
            <p className="relative text-lg text-gray-600">
              Send us a message and we'll get back to you soon
            </p>
            <div className="relative mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-gray-500">
              <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-brand" /> Quick response</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-brand" /> Your details stay private</span>
                          </div>
          </div>

          {/* Contact Form */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-brand/5 p-6 sm:p-8">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-fill via-brand to-brand-fill" />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-200 bg-gray-50/60 dark:bg-white/5 rounded-xl pl-11 pr-4 py-2.5 transition placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:bg-white dark:focus:bg-transparent focus:border-brand-fill focus:ring-4 focus:ring-brand/15"
                      placeholder="Your name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-200 bg-gray-50/60 dark:bg-white/5 rounded-xl pl-11 pr-4 py-2.5 transition placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:bg-white dark:focus:bg-transparent focus:border-brand-fill focus:ring-4 focus:ring-brand/15"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 bg-gray-50/60 dark:bg-white/5 rounded-xl pl-11 pr-4 py-2.5 transition placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:bg-white dark:focus:bg-transparent focus:border-brand-fill focus:ring-4 focus:ring-brand/15"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
                <div className="relative">
                  <MessageSquare className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-200 bg-gray-50/60 dark:bg-white/5 rounded-xl pl-11 pr-4 py-2.5 transition placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:bg-white dark:focus:bg-transparent focus:border-brand-fill focus:ring-4 focus:ring-brand/15"
                    placeholder="How can we help?"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                <div className="relative">
                  <MessageSquare className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <textarea
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-200 bg-gray-50/60 dark:bg-white/5 rounded-xl pl-11 pr-4 py-2.5 transition placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:bg-white dark:focus:bg-transparent focus:border-brand-fill focus:ring-4 focus:ring-brand/15"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 bg-brand-fill hover:bg-brand-hover text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-brand/20 transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? 'Sending...' : (<><Send className="h-4 w-4" /> Send Message</>)}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;