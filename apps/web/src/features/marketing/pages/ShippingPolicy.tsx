import React from 'react';
import { Link } from 'react-router-dom';
import LegalPage, { LegalSection, SupportEmailLink } from '../components/LegalPage';
import { COMPANY } from '../../../constants/company';

function ShippingPolicy() {
  return (
    <LegalPage
      title="Shipping & Delivery Policy"
      description="How Xtin Capital delivers its digital products and subscriptions after payment."
      canonicalUrl="/shipping-policy"
      lastUpdated="Sep 30, 2026"
    >
      <LegalSection title="1. Digital delivery only">
        <p>
          {COMPANY.legalName} sells only digital services — online plans, subscriptions, algorithm indicators and AI token packs. No
          physical goods are shipped, and no shipping charges apply.
        </p>
      </LegalSection>

      <LegalSection title="2. Delivery timelines">
        <ul className="list-disc ml-6 space-y-1">
          <li>
            <strong>Pro plans, bundles and AI token packs:</strong> activated on your Xtin Capital account immediately after successful
            payment, and in any case within 24 hours.
          </li>
          <li>
            <strong>Algorithm indicators:</strong> added as private indicators to the TradingView username you provide at checkout within
            24 hours of successful payment. A TradingView account is required.
          </li>
          <li>
            <strong>Newsletter (Market Brief Pro):</strong> editions are emailed to your registered address starting with the next
            scheduled edition.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Confirmation">
        <p>
          Razorpay emails a payment receipt to the address used at checkout. Your active plans are always visible on your dashboard after
          signing in.
        </p>
      </LegalSection>

      <LegalSection title="4. Not received?">
        <p>
          If your purchase is not active within 24 hours, email <SupportEmailLink /> with your registered email and the Razorpay payment
          ID. If we cannot deliver within 72 hours, you are eligible for a refund under our{' '}
          <Link to="/refund-policy" className="text-brand hover:text-brand font-medium">Refund &amp; Cancellation Policy</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

export default ShippingPolicy;
