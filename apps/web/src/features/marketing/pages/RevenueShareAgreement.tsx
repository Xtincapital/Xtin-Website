import React from 'react';
import { LegalHeader } from '../components/PageArt';
import { PiggyBank } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h3 className="text-xl font-semibold text-gray-900 border-l-[3px] border-brand-fill pl-3">{title}</h3>
    <div className="text-gray-700 leading-7 space-y-2">{children}</div>
  </section>
);

function RevenueShareAgreement() {
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Navbar />

      <main className="mt-20 px-6 md:px-12 lg:px-24 py-12">
        <div className="max-w-4xl mx-auto">
          <LegalHeader Icon={PiggyBank} title="Revenue Share Agreement" updated="Nov 2, 2025" />

          <div className="bg-white border border-gray-200 border-t-4 border-t-brand-fill rounded-2xl p-6 md:p-8 shadow-xl shadow-brand/5 space-y-8">
            <Section title="1. Overview">
              <p>
                This Revenue Share Agreement ("Agreement") applies to publisher earnings for Algorithms sold or subscribed to through the Xtin Capital Marketplace.
              </p>
            </Section>

            <Section title="2. Default Split">
              <ul className="list-disc ml-6 space-y-1">
                <li>Publisher: <strong>70%</strong> of net revenue.</li>
                <li>Xtin Capital (platform, processing, support): <strong>30%</strong> of net revenue.</li>
                <li>Custom splits may be agreed in writing for specific listings or partnerships.</li>
              </ul>
            </Section>

            <Section title="3. Net Revenue Definition">
              <p>
                "Net revenue" means amounts actually received by Xtin Capital from end users for an Algorithm, less refunds, chargebacks, discounts, taxes collected/remitted, and payment processing fees.
              </p>
            </Section>

            <Section title="4. Payouts">
              <ul className="list-disc ml-6 space-y-1">
                <li>Payouts are processed monthly, within 15 days after month end.</li>
                <li>Minimum payout threshold may apply (e.g., ₹2,000 or equivalent).</li>
                <li>Publishers must provide valid payout details and KYC/Tax information if requested.</li>
              </ul>
            </Section>

            <Section title="5. Refunds & Chargebacks">
              <p>
                If a refund or chargeback occurs, the relevant portion will be deducted from future payouts. Where insufficient, you agree to reimburse the Platform for negative balances.
              </p>
            </Section>

            <Section title="6. Taxes">
              <p>
                You are responsible for taxes on your earnings. Where required, Xtin Capital may withhold taxes and provide statements.
              </p>
            </Section>

            <Section title="7. Audit & Reporting">
              <p>
                We will maintain reasonable transaction records and provide payout statements. We may investigate suspicious activity or abuse.
              </p>
            </Section>

            <Section title="8. Changes">
              <p>
                We may update this Agreement from time to time with notice by posting the updated version. Continued participation constitutes acceptance.
              </p>
            </Section>

            <Section title="9. Contact">
              <p>
                Questions on payouts? Email <a href="mailto:support@xtincapital.com" className="text-brand hover:text-brand font-medium">support@xtincapital.com</a>.
              </p>
            </Section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default RevenueShareAgreement;
