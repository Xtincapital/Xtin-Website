import React from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import SEO from '../../../components/SEO';
import { COMPANY } from '../../../constants/company';
import { LegalHeader } from './PageArt';
import { ScrollText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Shared shell for the policy pages (Contact, Refund, Shipping) — same look as Terms/Privacy.

export const LegalSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
    <div className="text-gray-700 leading-7 space-y-2">{children}</div>
  </section>
);

export const SupportEmailLink = () => (
  <a href={`mailto:${COMPANY.supportEmail}`} className="text-brand hover:text-brand font-medium">
    {COMPANY.supportEmail}
  </a>
);

export const SupportPhoneLink = () => (
  <a href={COMPANY.phoneHref} className="text-brand hover:text-brand font-medium">
    {COMPANY.phone}
  </a>
);

type LegalPageProps = {
  title: string;
  description: string;
  canonicalUrl: string;
  lastUpdated: string;
  icon?: LucideIcon;
  children: React.ReactNode;
};

const LegalPage = ({ title, description, canonicalUrl, lastUpdated, icon, children }: LegalPageProps) => (
  <div className="bg-white text-gray-900 min-h-screen">
    <SEO title={title} description={description} canonicalUrl={canonicalUrl} />
    <Navbar />

    <main className="mt-20 px-6 md:px-12 lg:px-24 py-12">
      <div className="max-w-4xl mx-auto">
        <LegalHeader Icon={icon ?? ScrollText} title={title} entity={`${COMPANY.legalName} (LLP ID: ${COMPANY.llpId})`} updated={lastUpdated} />

        <div className="bg-white border border-gray-200 border-t-4 border-t-brand-fill rounded-2xl p-6 md:p-8 shadow-xl shadow-brand/5 space-y-8">{children}</div>
      </div>
    </main>

    <Footer />
  </div>
);

export default LegalPage;
