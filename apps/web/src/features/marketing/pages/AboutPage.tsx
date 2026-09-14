import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import SEO from '../../../components/SEO';
import { BACKEND_URL } from '../../../config/env';

const API_BASE_URL = `${BACKEND_URL}/api`;

/* ─── Animation ─────────────────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const Section = ({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section
      ref={ref} id={id}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

/* ─── Authentic India SVG Illustrations ─────────────────── */

// Scene 1: Farmer in the field — the backbone of India
const FarmerScene = () => (
  <svg viewBox="0 0 600 300" fill="none" className="w-full">
    {/* Sky gradient */}
    <rect width="600" height="300" fill="#FEF3C7" opacity="0.3"/>
    
    {/* Sun */}
    <circle cx="500" cy="60" r="35" fill="#FBBF24" opacity="0.6"/>
    <circle cx="500" cy="60" r="25" fill="#FCD34D" opacity="0.8"/>
    
    {/* Mountains */}
    <path d="M0 200 L80 120 L160 180 L240 100 L320 160 L400 90 L480 150 L560 110 L600 140 L600 300 L0 300 Z" fill="#D1FAE5" opacity="0.4"/>
    
    {/* Fields — terraced lines */}
    <path d="M0 220 Q150 200 300 220 Q450 240 600 215" stroke="#10B981" strokeWidth="1.5" opacity="0.3" fill="none"/>
    <path d="M0 240 Q150 225 300 240 Q450 255 600 235" stroke="#10B981" strokeWidth="1.5" opacity="0.25" fill="none"/>
    <path d="M0 260 Q150 248 300 260 Q450 272 600 255" stroke="#10B981" strokeWidth="1.5" opacity="0.2" fill="none"/>
    
    {/* Ground */}
    <path d="M0 270 Q300 260 600 270 L600 300 L0 300 Z" fill="#10B981" opacity="0.15"/>
    
    {/* Farmer figure */}
    <g transform="translate(180, 195)">
      {/* Body */}
      <circle cx="0" cy="-35" r="12" fill="#92400E" opacity="0.8"/>
      {/* Turban */}
      <ellipse cx="0" cy="-44" rx="14" ry="8" fill="#DC2626" opacity="0.7"/>
      {/* Torso */}
      <path d="M-10 -23 L10 -23 L8 10 L-8 10 Z" fill="#F5F5F4" opacity="0.8"/>
      {/* Dhoti */}
      <path d="M-8 10 L-12 45 L12 45 L8 10 Z" fill="#F5F5F4" opacity="0.6"/>
      {/* Arms holding tool */}
      <line x1="-10" y1="-15" x2="-25" y2="5" stroke="#92400E" strokeWidth="3" opacity="0.7" strokeLinecap="round"/>
      <line x1="10" y1="-15" x2="25" y2="-5" stroke="#92400E" strokeWidth="3" opacity="0.7" strokeLinecap="round"/>
      {/* Plough / tool */}
      <line x1="25" y1="-5" x2="40" y2="25" stroke="#78716C" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M35 20 L45 30 L38 32" stroke="#78716C" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </g>
    
    {/* Crop plants */}
    {[60, 100, 140, 280, 320, 360, 400, 440, 480].map((x, i) => (
      <g key={i} transform={`translate(${x}, ${255 + (i % 3) * 5})`}>
        <line x1="0" y1="0" x2="0" y2="-18" stroke="#10B981" strokeWidth="1.5" opacity="0.5"/>
        <ellipse cx="-5" cy="-14" rx="5" ry="3" fill="#34D399" opacity="0.4" transform={`rotate(-25 -5 -14)`}/>
        <ellipse cx="5" cy="-16" rx="5" ry="3" fill="#34D399" opacity="0.4" transform={`rotate(20 5 -16)`}/>
      </g>
    ))}
    
    {/* Birds */}
    <path d="M120 60 Q125 55 130 60" stroke="#374151" strokeWidth="1.2" fill="none" opacity="0.3"/>
    <path d="M140 50 Q145 45 150 50" stroke="#374151" strokeWidth="1.2" fill="none" opacity="0.25"/>
    <path d="M155 65 Q160 60 165 65" stroke="#374151" strokeWidth="1.2" fill="none" opacity="0.2"/>
  </svg>
);

// Scene 2: Family at kitchen table — discussing finances
const FamilyScene = () => (
  <svg viewBox="0 0 600 300" fill="none" className="w-full">
    {/* Room background */}
    <rect width="600" height="300" fill="#FEF9C3" opacity="0.15"/>
    
    {/* Wall */}
    <rect x="50" y="30" width="500" height="200" rx="4" fill="#FEFCE8" opacity="0.3" stroke="#E5E7EB" strokeWidth="1"/>
    
    {/* Window */}
    <rect x="400" y="50" width="80" height="60" rx="4" fill="#DBEAFE" opacity="0.4" stroke="#E5E7EB" strokeWidth="1"/>
    <line x1="440" y1="50" x2="440" y2="110" stroke="#E5E7EB" strokeWidth="1"/>
    <line x1="400" y1="80" x2="480" y2="80" stroke="#E5E7EB" strokeWidth="1"/>
    
    {/* Table */}
    <rect x="130" y="180" width="280" height="8" rx="2" fill="#92400E" opacity="0.6"/>
    <rect x="150" y="188" width="8" height="60" fill="#92400E" opacity="0.5"/>
    <rect x="390" y="188" width="8" height="60" fill="#92400E" opacity="0.5"/>
    
    {/* Papers on table */}
    <rect x="200" y="168" width="40" height="14" rx="1" fill="white" stroke="#D1D5DB" strokeWidth="0.5" transform="rotate(-5 200 168)"/>
    <rect x="250" y="170" width="35" height="12" rx="1" fill="white" stroke="#D1D5DB" strokeWidth="0.5" transform="rotate(3 250 170)"/>
    <rect x="310" y="166" width="50" height="16" rx="1" fill="#D1FAE5" stroke="#10B981" strokeWidth="0.5" transform="rotate(-2 310 166)"/>
    
    {/* Father figure - left */}
    <g transform="translate(180, 130)">
      <circle cx="0" cy="-20" r="15" fill="#D4A373" opacity="0.8"/>
      <path d="M-12 0 L12 0 L10 50 L-10 50 Z" fill="#1E40AF" opacity="0.5"/>
      <line x1="12" y1="10" x2="25" y2="35" stroke="#D4A373" strokeWidth="3" opacity="0.6" strokeLinecap="round"/>
    </g>
    
    {/* Mother figure - right */}
    <g transform="translate(350, 130)">
      <circle cx="0" cy="-20" r="14" fill="#D4A373" opacity="0.8"/>
      {/* Bindi */}
      <circle cx="0" cy="-22" r="1.5" fill="#DC2626" opacity="0.6"/>
      <path d="M-11 0 L11 0 L9 50 L-9 50 Z" fill="#10B981" opacity="0.4"/>
      {/* Dupatta hint */}
      <path d="M-14 -10 Q-20 5 -14 20" stroke="#10B981" strokeWidth="2" opacity="0.3" fill="none"/>
      <line x1="-12" y1="10" x2="-25" y2="35" stroke="#D4A373" strokeWidth="3" opacity="0.6" strokeLinecap="round"/>
    </g>
    
    {/* Child figure - center behind table */}
    <g transform="translate(270, 145)">
      <circle cx="0" cy="-15" r="11" fill="#D4A373" opacity="0.8"/>
      <path d="M-8 -2 L8 -2 L7 35 L-7 35 Z" fill="#FBBF24" opacity="0.4"/>
    </g>
    
    {/* Calendar on wall */}
    <rect x="120" y="60" width="40" height="50" rx="2" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
    <rect x="120" y="60" width="40" height="12" rx="2" fill="#DC2626" opacity="0.5"/>
    
    {/* Photo frame on wall */}
    <rect x="260" y="55" width="45" height="35" rx="2" fill="#FEF3C7" stroke="#D4A373" strokeWidth="1.5" opacity="0.6"/>
  </svg>
);

// Scene 3: Student under streetlight — studying at night
const StudentScene = () => (
  <svg viewBox="0 0 600 300" fill="none" className="w-full">
    {/* Night sky */}
    <rect width="600" height="300" fill="#0F172A" opacity="0.05"/>
    
    {/* Stars */}
    {[{x:80,y:30},{x:180,y:50},{x:350,y:25},{x:450,y:60},{x:520,y:35},{x:100,y:70},{x:400,y:80}].map((s,i) => (
      <circle key={i} cx={s.x} cy={s.y} r="1.5" fill="#10B981" opacity={0.15 + (i * 0.05)}/>
    ))}
    
    {/* Moon */}
    <circle cx="480" cy="50" r="22" fill="#10B981" opacity="0.08"/>
    <circle cx="490" cy="45" r="20" fill="white" opacity="0.02"/>
    
    {/* Streetlight pole */}
    <rect x="295" y="90" width="6" height="170" fill="#6B7280" opacity="0.3"/>
    <rect x="280" y="82" width="36" height="12" rx="4" fill="#6B7280" opacity="0.3"/>
    
    {/* Light glow */}
    <ellipse cx="298" cy="100" rx="80" ry="120" fill="#FCD34D" opacity="0.05"/>
    <ellipse cx="298" cy="100" rx="50" ry="80" fill="#FCD34D" opacity="0.06"/>
    
    {/* Light bulb */}
    <circle cx="298" cy="95" r="6" fill="#FCD34D" opacity="0.4"/>
    
    {/* Ground */}
    <path d="M0 270 L600 270 L600 300 L0 300 Z" fill="#10B981" opacity="0.05"/>
    <line x1="0" y1="270" x2="600" y2="270" stroke="#D1D5DB" strokeWidth="0.5" opacity="0.3"/>
    
    {/* Student sitting */}
    <g transform="translate(260, 215)">
      {/* Legs crossed */}
      <ellipse cx="0" cy="45" rx="20" ry="8" fill="#1E3A5F" opacity="0.3"/>
      {/* Body */}
      <path d="M-10 5 L10 5 L8 45 L-8 45 Z" fill="#1E40AF" opacity="0.35"/>
      {/* Head */}
      <circle cx="0" cy="-10" r="13" fill="#D4A373" opacity="0.7"/>
      {/* Hair */}
      <path d="M-13 -15 Q0 -28 13 -15" fill="#1C1917" opacity="0.4"/>
      
      {/* Book in hands */}
      <rect x="-18" y="15" width="36" height="24" rx="2" fill="white" opacity="0.6" stroke="#D1D5DB" strokeWidth="0.5"/>
      <line x1="-18" y1="27" x2="18" y2="27" stroke="#D1D5DB" strokeWidth="0.3"/>
      {/* Text lines on book */}
      <line x1="-14" y1="20" x2="14" y2="20" stroke="#D1D5DB" strokeWidth="0.8" opacity="0.4"/>
      <line x1="-14" y1="24" x2="10" y2="24" stroke="#D1D5DB" strokeWidth="0.8" opacity="0.3"/>
      <line x1="-14" y1="32" x2="12" y2="32" stroke="#D1D5DB" strokeWidth="0.8" opacity="0.3"/>
    </g>
    
    {/* More books beside */}
    <g transform="translate(320, 250)">
      <rect x="0" y="0" width="25" height="5" rx="1" fill="#10B981" opacity="0.3"/>
      <rect x="2" y="-5" width="25" height="5" rx="1" fill="#3B82F6" opacity="0.25"/>
      <rect x="1" y="-10" width="23" height="5" rx="1" fill="#8B5CF6" opacity="0.2"/>
    </g>
    
    {/* Bag */}
    <path d="M200 240 Q195 220 205 215 L220 215 Q230 220 225 240 Z" fill="#78716C" opacity="0.25"/>
  </svg>
);

// Scene 4: Small town shopkeeper
const ShopkeeperScene = () => (
  <svg viewBox="0 0 600 300" fill="none" className="w-full">
    {/* Background */}
    <rect width="600" height="300" fill="#FEF3C7" opacity="0.1"/>
    
    {/* Shop structure */}
    <rect x="100" y="80" width="400" height="180" fill="#FEFCE8" opacity="0.3" stroke="#D4A373" strokeWidth="1.5"/>
    <rect x="100" y="60" width="400" height="25" fill="#DC2626" opacity="0.15"/>
    
    {/* Shop sign */}
    <rect x="200" y="65" width="200" height="15" rx="3" fill="white" opacity="0.5"/>
    
    {/* Shelves */}
    <line x1="120" y1="130" x2="480" y2="130" stroke="#D4A373" strokeWidth="1" opacity="0.3"/>
    <line x1="120" y1="170" x2="480" y2="170" stroke="#D4A373" strokeWidth="1" opacity="0.3"/>
    
    {/* Items on shelves */}
    {[140, 180, 220, 260, 340, 380, 420, 460].map((x, i) => (
      <rect key={i} x={x} y={115 + (i % 2 ? 0 : 40)} width="18" height="14" rx="2" fill={['#10B981','#3B82F6','#FBBF24','#EC4899','#10B981','#8B5CF6','#F59E0B','#3B82F6'][i]} opacity="0.15"/>
    ))}
    
    {/* Counter */}
    <rect x="130" y="210" width="340" height="10" rx="2" fill="#92400E" opacity="0.4"/>
    
    {/* Shopkeeper */}
    <g transform="translate(300, 170)">
      <circle cx="0" cy="-20" r="14" fill="#D4A373" opacity="0.7"/>
      {/* Topi */}
      <ellipse cx="0" cy="-30" rx="16" ry="6" fill="white" opacity="0.5"/>
      <path d="M-12 0 L12 0 L10 40 L-10 40 Z" fill="#F5F5F4" opacity="0.5"/>
      {/* Holding register */}
      <rect x="-15" y="15" width="30" height="20" rx="2" fill="#FEF3C7" opacity="0.6" stroke="#D4A373" strokeWidth="0.8"/>
    </g>
    
    {/* Calculator on counter */}
    <rect x="380" y="198" width="22" height="14" rx="2" fill="#1F2937" opacity="0.3"/>
    <rect x="383" y="200" width="16" height="5" rx="1" fill="#10B981" opacity="0.3"/>
    
    {/* Currency notes */}
    <rect x="180" y="200" width="30" height="12" rx="1" fill="#D1FAE5" opacity="0.5" stroke="#10B981" strokeWidth="0.5" transform="rotate(-8 180 200)"/>
    <rect x="215" y="202" width="30" height="12" rx="1" fill="#D1FAE5" opacity="0.4" stroke="#10B981" strokeWidth="0.5" transform="rotate(5 215 202)"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   ABOUT PAGE — Pure Storytelling, No Selling
   ═══════════════════════════════════════════════════════════ */
const AboutPage = () => {
  const [showContactModal, setShowContactModal] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState('');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'name': 'About Xtin Capital',
    'description': 'Xtin Capital is building India\'s second freedom movement — financial freedom. Making India wealthy, not just rich.',
    'url': 'https://www.xtincapital.com/about',
    'mainEntity': {
      '@type': 'Organization',
      'name': 'XTIN SERVICES LLP',
      'legalName': 'XTIN SERVICES LLP',
      'alternateName': 'Xtin Capital',
      'foundingDate': '2025',
      'taxID': 'ACR-9371',
      'address': { '@type': 'PostalAddress', 'streetAddress': 'Fl No 705 Building B, Shilp Residency, Vesu', 'addressLocality': 'Surat', 'addressRegion': 'Gujarat', 'postalCode': '395007', 'addressCountry': 'IN' },
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/help/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: null,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save your message');
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Failed to send. Please email us directly.');
    }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      <SEO
        title="About Us - Our Mission, Vision & Journey"
        description="Xtin Capital is building India's second freedom movement — financial freedom. Making India wealthy, not just rich."
        keywords="about Xtin Capital, financial freedom India, making India wealthy, financial advisory, Xtin Services LLP"
        canonicalUrl="/about"
        structuredData={structuredData}
      />
      <Navbar />

      {/* ═══════════════ CHAPTER 1: THE OPENING ═══════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-50/30 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-green-100/30 to-emerald-100/10 dark:from-emerald-900/8 dark:to-transparent blur-[120px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 pt-40 pb-20 md:pt-48 md:pb-28 text-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }}>
            
            <motion.p variants={fadeUp} className="text-green-600 dark:text-emerald-400 font-medium text-sm uppercase tracking-[0.2em] mb-8">
              Our Story
            </motion.p>

            <motion.h1 variants={fadeUp} className="text-[2.5rem] sm:text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight mb-8">
              Making India{' '}
              <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 dark:from-emerald-400 dark:via-green-400 dark:to-teal-400 bg-clip-text text-transparent">wealthy</span>,
              <br />
              not just rich.
            </motion.h1>

            <motion.p variants={fadeUp} className="text-xl md:text-2xl text-gray-400 dark:text-slate-500 leading-relaxed font-light max-w-2xl mx-auto">
              This is not a company story. This is a story about India.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ CHAPTER 2: THE FARMER ═══════════════ */}
      <Section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="mb-10 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800">
            <FarmerScene />
          </motion.div>
          
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center space-y-6">
            <p className="text-xl md:text-2xl text-gray-700 dark:text-slate-300 leading-relaxed font-light">
              A farmer in Maharashtra works 14 hours a day. He feeds a nation. But nobody ever taught him what to do with the money he earns.
            </p>
            <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed">
              He doesn't know what a SIP is. He doesn't know that compound interest works while he sleeps. He doesn't know that ₹500 a month, invested wisely, could change his grandchildren's story.
            </p>
            <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed italic">
              Not because he's not smart enough. Because nobody ever explained it in his language.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════ CHAPTER 3: THE FAMILY ═══════════════ */}
      <Section className="py-16 md:py-24 px-6 bg-gray-50/50 dark:bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="mb-10 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800">
            <FamilyScene />
          </motion.div>
          
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center space-y-6">
            <p className="text-xl md:text-2xl text-gray-700 dark:text-slate-300 leading-relaxed font-light">
              A middle-class family in Surat sits around the kitchen table. The father earns ₹40,000 a month. The mother manages every rupee. They argue about school fees, medical bills, and the rising price of dal.
            </p>
            <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed">
              They have a savings account. That's it. They don't know about EPF calculators, tax-saving ELSS funds, or how to plan for retirement. They're not poor — they're <span className="text-gray-700 dark:text-slate-300 font-medium">under-informed</span>.
            </p>
            <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed italic">
              The gap between them and financial security isn't money. It's knowledge.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════ CHAPTER 4: THE STUDENT ═══════════════ */}
      <Section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="mb-10 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800">
            <StudentScene />
          </motion.div>
          
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center space-y-6">
            <p className="text-xl md:text-2xl text-gray-700 dark:text-slate-300 leading-relaxed font-light">
              A college student in a small town studies under a streetlight. She tops her class in engineering. But her college never taught her a single chapter about money.
            </p>
            <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed">
              She'll graduate, get a job, earn a salary — and still won't know the difference between a fixed deposit and a mutual fund. She'll trust a random YouTube "guru" because that's all she has access to.
            </p>
            <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed italic">
              India produces millions of brilliant minds every year. We just don't teach them about money.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════ CHAPTER 5: THE SHOPKEEPER ═══════════════ */}
      <Section className="py-16 md:py-24 px-6 bg-gray-50/50 dark:bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="mb-10 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800">
            <ShopkeeperScene />
          </motion.div>
          
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center space-y-6">
            <p className="text-xl md:text-2xl text-gray-700 dark:text-slate-300 leading-relaxed font-light">
              A shopkeeper in Varanasi keeps his savings in cash — under the mattress. His father did it. His grandfather did it. Three generations of hard work, eaten by inflation.
            </p>
            <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed">
              92% of Indians don't invest in the stock market. Not because they can't — because nobody built a bridge between their world and the world of finance.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════ THE TURNING POINT ═══════════════ */}
      <Section className="py-24 md:py-32 px-6">
        <motion.div variants={fadeUp} className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-0.5 bg-green-600 dark:bg-emerald-400 mx-auto mb-12 opacity-40" />
          
          <p className="text-sm text-green-600 dark:text-emerald-400 font-medium uppercase tracking-[0.2em] mb-8">The Turning Point</p>
          
          <h2 className="text-3xl md:text-[2.75rem] font-extrabold leading-tight mb-8">
            India achieved political freedom in 1947.
            <br />
            <span className="text-gray-400 dark:text-slate-500 font-light">The second freedom movement is</span>
            <br />
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">financial freedom.</span>
          </h2>
          
          <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto mb-6">
            And that movement won't be led by banks or brokers. It'll be led by education. By clarity. By honesty. By giving every Indian — from the farmer to the engineer to the shopkeeper — the tools and knowledge to take control of their financial future.
          </p>
          
          <p className="text-xl text-gray-700 dark:text-slate-300 font-medium">
            That's why Xtin Capital exists.
          </p>
          
          <div className="w-16 h-0.5 bg-green-600 dark:bg-emerald-400 mx-auto mt-12 opacity-40" />
        </motion.div>
      </Section>

      {/* ═══════════════ OUR BELIEF ═══════════════ */}
      <Section className="py-20 px-6 bg-gray-50/50 dark:bg-slate-900/30">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center space-y-10">
            <p className="text-sm text-green-600 dark:text-emerald-400 font-medium uppercase tracking-[0.2em]">What We Believe</p>

            <div className="space-y-8">
              {[
                'Finance should be understood, not feared.',
                'Education should never be a luxury.',
                'Technology should serve people, not confuse them.',
                'Wealth is not just about money — it\'s about understanding.',
                'Every Indian deserves access to honest financial guidance.',
              ].map((belief, i) => (
                <motion.p key={i} variants={fadeUp} custom={i} className="text-xl md:text-2xl text-gray-700 dark:text-slate-300 font-light leading-relaxed">
                  "{belief}"
                </motion.p>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════ WHO WE ARE ═══════════════ */}
      <Section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-sm text-green-600 dark:text-emerald-400 font-medium uppercase tracking-[0.2em] mb-4">Who We Are</p>
            <h2 className="text-3xl md:text-4xl font-bold">The People Behind This</h2>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-6 text-center">
            <p className="text-lg text-gray-600 dark:text-slate-400 leading-relaxed">
              We started as a small research desk in Surat — a group of people frustrated by how complicated the financial world made simple things.
            </p>
            <p className="text-lg text-gray-600 dark:text-slate-400 leading-relaxed">
              We saw brilliant algorithms locked behind expensive subscriptions. We saw financial education sold as ₹50,000 courses. We saw families making decisions based on tips from WhatsApp groups.
            </p>
            <p className="text-lg text-gray-600 dark:text-slate-400 leading-relaxed">
              So we decided to build something different. A platform where education is free. Where calculators don't need a login. Where algorithms are transparent. Where advisory is honest.
            </p>
            <p className="text-xl text-gray-700 dark:text-slate-300 font-medium mt-8">
              Not because it's a good business model.
              <br />
              <span className="text-green-600 dark:text-emerald-400">Because it's the right thing to do.</span>
            </p>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════ THE JOURNEY ═══════════════ */}
      <Section className="py-20 px-6 bg-gray-50/50 dark:bg-slate-900/30">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-sm text-green-600 dark:text-emerald-400 font-medium uppercase tracking-[0.2em] mb-4">Our Journey</p>
            <h2 className="text-3xl md:text-4xl font-bold">From an idea to a movement</h2>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-green-200 dark:bg-emerald-800/40" />

            {[
              {
                marker: 'The Spark',
                text: 'Born out of a simple observation — most people lose money not because of lack of opportunity, but because of lack of understanding. What if we could change that?',
              },
              {
                marker: '2025',
                text: 'XTIN SERVICES LLP was incorporated on 10th October, 2025. What started as a small research desk became real. We built our first algorithms, our first courses, our first calculators.',
              },
              {
                marker: 'The Build',
                text: 'We built everything we wished existed when we started — free courses that actually teach, calculators that actually work with Indian tax rules, algorithms that are transparent about their logic.',
              },
              {
                marker: 'Today',
                text: 'We\'re still small. We\'re still building. But every person who uses our free calculator, every student who completes a course, every family that makes a better financial decision — that\'s the movement growing.',
              },
            ].map((item, i) => (
              <motion.div key={item.marker} variants={fadeUp} custom={i} className="relative pl-16 md:pl-20 mb-12 last:mb-0">
                <div className="absolute left-3.5 md:left-5.5 top-1.5 w-5 h-5 rounded-full bg-green-600 dark:bg-emerald-500 border-4 border-white dark:border-slate-950 z-10">
                  <div className="w-1 h-1 rounded-full bg-white mx-auto mt-1" />
                </div>
                <span className="text-sm font-bold text-green-600 dark:text-emerald-400 block mb-2">{item.marker}</span>
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════ COMPANY DETAILS ═══════════════ */}
      <Section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <p className="text-sm text-green-600 dark:text-emerald-400 font-medium uppercase tracking-[0.2em] mb-4">Registered Entity</p>
            <h2 className="text-2xl md:text-3xl font-bold">Company Details</h2>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800/60 rounded-2xl p-8 border border-gray-100 dark:border-slate-700/50">
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { label: 'Registered Name', value: 'XTIN SERVICES LLP' },
                { label: 'LLP Identification', value: 'ACR-9371' },
                { label: 'Incorporated', value: '10th October, 2025' },
                { label: 'Status', value: 'Active', green: true },
              ].map((d) => (
                <div key={d.label}>
                  <div className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">{d.label}</div>
                  <div className={`text-lg font-bold ${d.green ? 'text-green-600 dark:text-emerald-400' : ''}`}>{d.value}</div>
                </div>
              ))}
              <div className="sm:col-span-2">
                <div className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Registered Office</div>
                <div className="text-gray-600 dark:text-slate-400">Fl No 705 Building B, Shilp Residency, Vesu, Surat, Gujarat, India — 395007</div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700/50">
              <p className="text-xs text-gray-400 dark:text-slate-500">Registered at Registrar of Companies (ROC), RoC-Ahmedabad under Ministry of Corporate Affairs (MCA), Government of India.</p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════ CLOSING ═══════════════ */}
      <Section className="py-24 md:py-32 px-6 bg-gray-50/50 dark:bg-slate-900/30">
        <motion.div variants={fadeUp} className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-0.5 bg-green-600 dark:bg-emerald-400 mx-auto mb-12 opacity-40" />
          
          <h2 className="text-3xl md:text-4xl font-extrabold mb-8 leading-tight">
            We're not building a product.
            <br />
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">We're building a bridge.</span>
          </h2>
          
          <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto mb-8">
            Between the India that works hard and the India that works smart. Between earning money and understanding money. Between being rich and being wealthy.
          </p>
          
          <p className="text-xl text-gray-700 dark:text-slate-300 font-medium mb-12">
            Join us. Not as a customer. As a part of the movement.
          </p>

          <button
            onClick={() => setShowContactModal(true)} 
            className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-10 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-green-600/20 hover:-translate-y-0.5"
          >
            Write to Us
          </button>
        </motion.div>
      </Section>

      {/* ─────────── CONTACT MODAL ─────────── */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Write to Us</h2>
              <button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors" onClick={() => setShowContactModal(false)}>×</button>
            </div>
            <div className="p-6">
              {submitStatus === 'success' && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/30 rounded-xl text-green-800 dark:text-green-300 text-sm">Message sent!</div>
              )}
              {submitStatus === 'error' && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-xl text-red-800 dark:text-red-300 text-sm">{errorMessage || 'Failed to send. Please email us directly.'}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: 'Name', name: 'name', type: 'text', placeholder: 'Your name', minLength: 2 },
                  { label: 'Email', name: 'email', type: 'email', placeholder: 'your.email@example.com' },
                  { label: 'Subject', name: 'subject', type: 'text', placeholder: 'What\'s on your mind?', minLength: 5 },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{f.label}</label>
                    <input type={f.type} name={f.name} value={formData[f.name]} onChange={handleInputChange} required minLength={f.minLength} className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-100" placeholder={f.placeholder} />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Message</label>
                  <textarea rows={4} name="message" value={formData.message} onChange={handleInputChange} required minLength={10} className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-100" placeholder="Tell us your story..." />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50">{isSubmitting ? 'Sending...' : 'Send'}</button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AboutPage;
