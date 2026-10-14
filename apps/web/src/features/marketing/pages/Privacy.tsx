import React from 'react';
import { LegalHeader } from '../components/PageArt';
import { ShieldCheck } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import SEO from '../../../components/SEO';
import { COMPANY } from '../../../constants/company';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h3 className="text-xl font-semibold text-gray-900 border-l-[3px] border-brand-fill pl-3">{title}</h3>
    <div className="text-gray-700 leading-7 space-y-2">{children}</div>
  </section>
);

function Privacy() {
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <SEO
        title="Privacy Policy"
        description="Read Xtin Capital's Privacy Policy. Learn how we collect, use, and protect your personal information when using our financial services platform."
        keywords="privacy policy, data protection, Xtin Capital privacy, personal data, user privacy"
        canonicalUrl="/privacy"
      />
      <Navbar />

      <main className="mt-20 px-6 md:px-12 lg:px-24 py-12">
        <div className="max-w-4xl mx-auto">
          <LegalHeader Icon={ShieldCheck} title="Privacy Policy" entity="XTIN SERVICES LLP (LLP ID: ACR-9371)" updated="Nov 2, 2025" />

          <div className="bg-white border border-gray-200 border-t-4 border-t-brand-fill rounded-2xl p-6 md:p-8 shadow-xl shadow-brand/5 space-y-8">
            <Section title="1. Overview">
              <p>
                This Privacy Policy explains how XTIN SERVICES LLP, operating as Xtin Capital ("we", "us", "our"), collects, uses, and protects your information when you use our website, products, and services (the "Platform").
              </p>
            </Section>

            <Section title="2. Information We Collect">
              <ul className="list-disc ml-6 space-y-1">
                <li>Account data (name, email, phone) you provide during sign up.</li>
                <li>Usage data (pages visited, interactions) to improve our services.</li>
                <li>Technical data (IP address, device/browser metadata) for security and analytics.</li>
                <li>Communications you send to us (support requests, feedback).</li>
              </ul>
            </Section>

            <Section title="3. How We Use Information">
              <ul className="list-disc ml-6 space-y-1">
                <li>To operate and improve the Platform.</li>
                <li>To communicate with you about updates, security, and support.</li>
                <li>To personalize content and features.</li>
                <li>To comply with legal obligations and enforce our Terms.</li>
              </ul>
            </Section>

            <Section title="4. Cookies and Analytics">
              <p>
                We may use cookies and similar technologies to remember preferences and to measure performance. You can control cookies through your browser settings.
              </p>
            </Section>

            <Section title="5. Data Sharing">
              <p>
                We do not sell your personal data. We may share data with vendors and service providers who help us operate the Platform, subject to confidentiality and security obligations, or where required by law.
              </p>
            </Section>

            <Section title="6. Data Security">
              <p>
                We implement reasonable administrative, technical, and physical safeguards designed to protect your information. No method of transmission over the Internet is 100% secure.
              </p>
            </Section>

            <Section title="7. Your Choices">
              <ul className="list-disc ml-6 space-y-1">
                <li>You can update or delete certain profile information from your account.</li>
                <li>You can opt out of marketing emails using the unsubscribe link.</li>
                <li>You may contact us to request access, correction, or deletion, subject to applicable law.</li>
              </ul>
            </Section>

            <Section title="8. Children’s Privacy">
              <p>
                The Platform is not directed to children under 13 and we do not knowingly collect information from them.
              </p>
            </Section>

            <Section title="9. International Data">
              <p>
                Your information may be processed in countries other than your own. We take steps to ensure appropriate safeguards for such transfers where required.
              </p>
            </Section>

            <Section title="10. Changes to this Policy">
              <p>
                We may update this Policy from time to time. We will post updates on this page with the revised date. Continued use constitutes acceptance of the changes.
              </p>
            </Section>

            <Section title="11. Contact Us">
              <p>
                Questions about privacy, or to request access, correction or deletion of your data? Email <a href={`mailto:${COMPANY.supportEmail}`} className="text-brand hover:text-brand font-medium">{COMPANY.supportEmail}</a> (subject “Privacy”) or call <a className="text-brand hover:text-brand font-medium" href={COMPANY.phoneHref}>{COMPANY.phone}</a>. Our grievance contact is reachable at the same address; we acknowledge requests within 48 hours.
              </p>
            </Section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Privacy;
