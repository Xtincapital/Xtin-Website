import React from 'react';
import { Link } from 'react-router-dom';
import LegalPage, { LegalSection, SupportEmailLink, SupportPhoneLink } from '../components/LegalPage';
import { COMPANY, companyAddress } from '../../../constants/company';

function Contact() {
  return (
    <LegalPage
      title="Contact Us"
      description="Contact Xtin Capital (XTIN SERVICES LLP) — support email, phone, registered business details and address."
      canonicalUrl="/contact"
      lastUpdated="Sep 30, 2026"
    >
      <LegalSection title="Customer support">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-green-800 mb-1">Email</p>
            <SupportEmailLink />
            <p className="text-xs text-green-700 mt-2">Response time: {COMPANY.responseTime}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-green-800 mb-1">Phone</p>
            <SupportPhoneLink />
            <p className="text-xs text-green-700 mt-2">{COMPANY.supportHours}</p>
          </div>
        </div>
        <p className="text-sm">
          For payment or refund issues, include your registered email and the Razorpay payment ID. See our{' '}
          <Link to="/refund-policy" className="text-green-600 hover:text-green-700 font-medium">Refund &amp; Cancellation Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Business details">
        <dl className="grid sm:grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="font-semibold text-gray-900">Legal name</dt>
          <dd>{COMPANY.legalName}</dd>
          <dt className="font-semibold text-gray-900">Brand</dt>
          <dd>{COMPANY.brand}</dd>
          <dt className="font-semibold text-gray-900">Entity type</dt>
          <dd>{COMPANY.entityType}</dd>
          <dt className="font-semibold text-gray-900">LLP ID</dt>
          <dd>{COMPANY.llpId}</dd>
          <dt className="font-semibold text-gray-900">GSTIN</dt>
          <dd>{COMPANY.gstin}</dd>
          <dt className="font-semibold text-gray-900">Registered office</dt>
          <dd>{companyAddress}</dd>
        </dl>
      </LegalSection>

      <LegalSection title="Grievances">
        <p>
          Complaints about our services or about how we handle your personal data can be sent to <SupportEmailLink /> with the subject
          “Grievance”. We acknowledge grievances within 48 hours and aim to resolve them within 30 days.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

export default Contact;
