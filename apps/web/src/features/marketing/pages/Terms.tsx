import React from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import SEO from '../../../components/SEO';
import { Link } from 'react-router-dom';
import { COMPANY } from '../../../constants/company';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    <div className="text-gray-700 leading-7 space-y-2">{children}</div>
  </section>
);

function Terms() {
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <SEO
        title="Terms of Service"
        description="Read Xtin Capital's Terms of Service. Understand your rights and responsibilities when using our financial tools, research and trading platform."
        keywords="terms of service, terms and conditions, Xtin Capital terms, user agreement, legal terms"
        canonicalUrl="/terms"
      />
      <Navbar />

      <main className="mt-20 px-6 md:px-12 lg:px-24 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="xt-title mb-3">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-1">XTIN SERVICES LLP (LLP ID: ACR-9371)</p>
          <p className="text-gray-600 mb-8">Last updated on Nov 2, 2025</p>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
            <Section title="1. Acceptance of Terms">
              <p>
                By creating an account, signing in, or using our website, tools, or services, you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.
              </p>
            </Section>

            <Section title="2. Eligibility">
              <p>
                You must be at least 18 years old and legally capable of entering into agreements to use the Platform. By using the Platform you represent and warrant that you meet these requirements.
              </p>
            </Section>

            <Section title="3. Accounts and Security">
              <ul className="list-disc ml-6 space-y-1">
                <li>Keep your login credentials confidential.</li>
                <li>You are responsible for all activity that occurs under your account.</li>
                <li>Notify us immediately of any unauthorized access or breach.</li>
              </ul>
            </Section>

            <Section title="4. No Investment Advice">
              <p>
                Information provided on the Platform, including algorithms, tools, content, and messages from XtinAI, is for educational and informational purposes only and does not constitute financial, legal, tax, or investment advice. You are solely responsible for your investment decisions.
              </p>
            </Section>

            <Section title="5. Use of the Platform">
              <ul className="list-disc ml-6 space-y-1">
                <li>Do not misuse, reverse engineer, or disrupt the Platform.</li>
                <li>Do not upload harmful content or violate the rights of others.</li>
                <li>We may suspend or terminate access for violations or risk.</li>
              </ul>
            </Section>

            <Section title="6. Subscriptions and Payments">
              <p>
                Paid plans are one‑time payments for a fixed period and do not renew automatically. Prices include applicable taxes unless stated otherwise. Refunds and cancellations are governed by our <Link to="/refund-policy" className="text-green-600 hover:text-green-700 font-medium">Refund &amp; Cancellation Policy</Link>, and delivery by our <Link to="/shipping-policy" className="text-green-600 hover:text-green-700 font-medium">Shipping &amp; Delivery Policy</Link>.
              </p>
            </Section>

            <Section title="7. Intellectual Property">
              <p>
                All content, software, logos, and trademarks on the Platform are owned by Xtin Capital or its licensors and are protected by applicable laws. You receive a limited, non‑exclusive license to use the Platform as provided.
              </p>
            </Section>

            <Section title="8. Third‑Party Links and Services">
              <p>
                The Platform may contain links or integrations to third‑party services. We are not responsible for their content, policies, or practices. Use them at your own risk.
              </p>
            </Section>

            <Section title="9. Limitation of Liability">
              <p>
                To the maximum extent permitted by law, Xtin Capital will not be liable for any indirect, incidental, special, consequential, or punitive damages, or loss of profits, data, or business opportunities.
              </p>
            </Section>

            <Section title="10. Indemnification">
              <p>
                You agree to defend, indemnify, and hold harmless Xtin Capital and its affiliates from any claims, damages, losses, and expenses arising from your use of the Platform or violation of these Terms.
              </p>
            </Section>

            <Section title="11. Changes to these Terms">
              <p>
                We may update these Terms from time to time. We will post the updated Terms on this page with the revised date. Continued use constitutes acceptance of the changes.
              </p>
            </Section>

            <Section title="12. Contact">
              <p>
                Questions? Email us at <a href={`mailto:${COMPANY.supportEmail}`} className="text-green-600 hover:text-green-700 font-medium">{COMPANY.supportEmail}</a> or call <a className="text-green-600 hover:text-green-700 font-medium" href={COMPANY.phoneHref}>{COMPANY.phone}</a>.
              </p>
            </Section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Terms;
