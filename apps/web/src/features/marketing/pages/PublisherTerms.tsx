import React from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    <div className="text-gray-700 leading-7 space-y-2">{children}</div>
  </section>
);

function PublisherTerms() {
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Navbar />

      <main className="mt-20 px-6 md:px-12 lg:px-24 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Publisher Terms & Conditions</h1>
          <p className="text-gray-600 mb-8">Last updated on Nov 2, 2025</p>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
            <Section title="1. Overview">
              <p>
                These Publisher Terms govern your participation in the Xtin Capital algorithm marketplace (the "Marketplace"). By submitting an application to publish or by publishing any strategy (an "Algorithm"), you agree to these terms.
              </p>
            </Section>

            <Section title="2. Eligibility & Compliance">
              <ul className="list-disc ml-6 space-y-1">
                <li>You must own or have rights to publish the Algorithm.</li>
                <li>Algorithms must not violate any third‑party intellectual property rights.</li>
                <li>Algorithms must comply with applicable laws, exchange/broker policies, and our platform rules.</li>
              </ul>
            </Section>

            <Section title="3. Submission & Review">
              <ul className="list-disc ml-6 space-y-1">
                <li>All submissions are subject to technical, compliance, and quality review.</li>
                <li>We may request additional documentation, backtests, or live results.</li>
                <li>We reserve the right to approve, reject, de‑list, or suspend any Algorithm at our discretion.</li>
              </ul>
            </Section>

            <Section title="4. Publisher Responsibilities">
              <ul className="list-disc ml-6 space-y-1">
                <li>Provide accurate descriptions, risks, and disclosures.</li>
                <li>Promptly update or fix issues that materially impact users.</li>
                <li>Offer reasonable support to subscribed users as defined by your listing.</li>
              </ul>
            </Section>

            <Section title="5. Pricing & Taxes">
              <p>
                You can propose pricing for your Algorithm; final listing price may be adjusted by mutual agreement. You are responsible for applicable taxes, except where we are required to collect/remit.
              </p>
            </Section>

            <Section title="6. Performance Disclosures">
              <p>
                Backtesting and simulated results have inherent limitations and do not guarantee future performance. Publishers must include clear disclosures and avoid misleading claims.
              </p>
            </Section>

            <Section title="7. IP & License">
              <p>
                You grant Xtin Capital a non‑exclusive, worldwide license to host, market, and deliver your Algorithm to end users through the Marketplace. You retain ownership of your IP.
              </p>
            </Section>

            <Section title="8. Termination">
              <p>
                Either party may terminate participation with reasonable notice. We may immediately suspend or remove an Algorithm for violations, risk, or legal requirement.
              </p>
            </Section>

            <Section title="9. Liability">
              <p>
                To the maximum extent permitted by law, Xtin Capital will not be liable for indirect or consequential damages. Your total liability for claims arising from your Algorithm will not exceed amounts earned by you in the preceding 6 months.
              </p>
            </Section>

            <Section title="10. Contact">
              <p>
                Email <a href="mailto:xtinservice@gmail.com" className="text-green-600 hover:text-green-700 font-medium">xtinservice@gmail.com</a> with subject "Publisher" for questions.
              </p>
            </Section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PublisherTerms;
