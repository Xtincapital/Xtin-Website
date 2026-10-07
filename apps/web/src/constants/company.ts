// Legal and contact details shown on the legal pages, Contact page and footer.
// These must match the business details on file with Razorpay (KYC), since
// Razorpay checks the website against them.
export const COMPANY = {
  brand: 'Xtin Capital',
  legalName: 'XTIN SERVICES LLP',
  entityType: 'Limited Liability Partnership',
  llpId: 'ACR-9371',
  gstin: '24AAAFX5182E1Z5',
  /** Full registered office address, as on the GST certificate. */
  registeredAddress: 'Fl No 705, Building B, Shilp Residency, Surat, Gujarat, India - 395007',
  city: 'Surat, Gujarat, India',
  supportEmail: 'support@xtincapital.com',
  phone: '+91 87092 84477',
  phoneHref: 'tel:+918709284477',
  supportHours: 'Mon–Fri, 9 AM – 6 PM IST',
  responseTime: 'Within 24–48 business hours',
} as const;

export const companyAddress = COMPANY.registeredAddress || COMPANY.city;
