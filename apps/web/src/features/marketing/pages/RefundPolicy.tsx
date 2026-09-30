import React from 'react';
import { Link } from 'react-router-dom';
import LegalPage, { LegalSection, SupportEmailLink } from '../components/LegalPage';
import { COMPANY } from '../../../constants/company';

// Site-wide version of the refund rules in AlgoTerms ("5. Refund Policy"), applied to every paid plan.
function RefundPolicy() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      description="Refund and cancellation policy for Xtin Capital paid plans, subscriptions, algorithm indicators and AI token packs."
      canonicalUrl="/refund-policy"
      lastUpdated="Sep 30, 2026"
    >
      <LegalSection title="1. Scope">
        <p>
          This policy applies to every paid product sold on xtincapital.com by {COMPANY.legalName} (“Xtin Capital”), including
          Pro plans (Academy, Market Brief, Gini, FundaKaMental, Trade Journal), bundles, algorithm indicator subscriptions and AI
          token packs. All products are digital services; nothing is shipped physically.
        </p>
      </LegalSection>

      <LegalSection title="2. Refunds">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <ul className="text-gray-700 space-y-2 text-sm">
            <li>
              • <strong>No refunds</strong> once access has been delivered to your account — i.e. the plan is active, AI tokens have been
              credited, or an algorithm indicator has been added to your TradingView account.
            </li>
            <li>
              • <strong>No refunds</strong> for dissatisfaction with results, algorithm performance or trading losses.
            </li>
            <li>
              • A refund may be considered only if we fail to deliver access within <strong>72 hours</strong> of a successful payment,
              subject to verification. Duplicate charges for the same purchase are always refunded.
            </li>
            <li>
              • All refund requests must be made in writing to <SupportEmailLink /> within <strong>48 hours</strong> of payment, with your
              registered email and the Razorpay payment ID.
            </li>
          </ul>
        </div>
      </LegalSection>

      <LegalSection title="3. How approved refunds are paid">
        <p>
          Approved refunds are issued to the original payment method through Razorpay within 5–7 working days of approval. Your bank or
          card issuer may take additional time to show the credit.
        </p>
      </LegalSection>

      <LegalSection title="4. Cancellation">
        <ul className="list-disc ml-6 space-y-1">
          <li>Plans are one-time payments for a fixed period (monthly or yearly) and do not renew automatically.</li>
          <li>You may stop using a plan at any time; access continues until the end of the period you paid for.</li>
          <li>No prorated refunds are provided for unused time.</li>
          <li>We may suspend or terminate access, without refund, for violation of our <Link to="/terms" className="text-green-600 hover:text-green-700 font-medium">Terms of Service</Link>.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Failed or pending payments">
        <p>
          If money was debited but your purchase did not activate, it is usually applied automatically within a few minutes. If it is not
          active after 24 hours, write to <SupportEmailLink /> with the payment ID. Payments that fail at the gateway are reversed to your
          account by your bank, typically within 5–7 working days.
        </p>
      </LegalSection>

      <LegalSection title="6. Contact">
        <p>
          Refund questions: <SupportEmailLink /> — response time {COMPANY.responseTime.toLowerCase()}. See also our{' '}
          <Link to="/contact" className="text-green-600 hover:text-green-700 font-medium">Contact page</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

export default RefundPolicy;
