import React from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import SEO from '../../../components/SEO';
import { COMPANY } from '../../../constants/company';

// Shared shell for the policy pages (Contact, Refund, Shipping) — same look as Terms/Privacy.

export const LegalSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
    <div className="text-gray-700 leading-7 space-y-2">{children}</div>
  </section>
);

export const SupportEmailLink = () => (
  <a href={`mailto:${COMPANY.supportEmail}`} className="text-green-600 hover:text-green-700 font-medium">
    {COMPANY.supportEmail}
  </a>
);

export const SupportPhoneLink = () => (
  <a href={COMPANY.phoneHref} className="text-green-600 hover:text-green-700 font-medium">
    {COMPANY.phone}
  </a>
);

type LegalPageProps = {
  title: string;
  description: string;
  canonicalUrl: string;
  lastUpdated: string;
  children: React.ReactNode;
};

const LegalPage = ({ title, description, canonicalUrl, lastUpdated, children }: LegalPageProps) => (
  <div className="bg-white text-gray-900 min-h-screen">
    <SEO title={title} description={description} canonicalUrl={canonicalUrl} />
    <Navbar />

    <main className="mt-20 px-6 md:px-12 lg:px-24 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="xt-title mb-3">{title}</h1>
        <p className="text-sm text-gray-500 mb-1">
          {COMPANY.legalName} (LLP ID: {COMPANY.llpId})
        </p>
        <p className="text-gray-600 mb-8">Last updated on {lastUpdated}</p>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">{children}</div>
      </div>
    </main>

    <Footer />
  </div>
);

export default LegalPage;
