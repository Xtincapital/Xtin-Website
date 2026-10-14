import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import SEO from '../../../components/SEO';
import { COMPANY } from '../../../constants/company';

const Section = ({ title, children }) => (
  <section className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    <div className="text-gray-700 leading-7 space-y-3">{children}</div>
  </section>
);

function AlgoTerms() {
  return (
    <div className="bg-background text-gray-900 min-h-screen">
      <SEO
        title="Algorithm Trading Terms & Conditions"
        description="Read Xtin Capital's Algorithm Trading Terms and Conditions. Understand risks, disclaimers, and your responsibilities when using our trading algorithms."
        keywords="algo trading terms, trading conditions, algorithm terms, risk disclosure, trading disclaimer"
        canonicalUrl="/algo-terms"
      />
      <Navbar />

      <main className="mt-20 px-4 md:px-12 lg:px-24 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/algos" className="inline-flex items-center text-brand hover:text-brand text-sm font-medium mb-4">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Algorithms
            </Link>
            <h1 className="text-3xl md:text-4xl font-display font-semibold mb-2 tracking-[-0.025em]">Algorithm Trading Terms & Conditions</h1>
            <p className="text-sm text-gray-500 mb-1">XTIN SERVICES LLP (LLP ID: ACR-9371)</p>
            <p className="text-gray-600">Last updated: January 13, 2026</p>
          </div>

          {/* Important Notice Banner */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">IMPORTANT RISK DISCLOSURE</h2>
                <p className="text-red-100 text-sm leading-relaxed">
                  Trading in securities market involves substantial risk of loss and is not suitable for every investor. 
                  The valuation of securities may fluctuate and as a result, investors may lose more than their original investment. 
                  Please read this document carefully before subscribing to any algorithm.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
            
            <Section title="1. Nature of Service">
              <p>
                Xtin Capital provides algorithmic trading indicators ("Algorithms") that are technical analysis tools designed to be used on TradingView platform. These algorithms:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>ARE NOT</strong> investment advice, tips, or recommendations to buy or sell any securities</li>
                <li><strong>ARE NOT</strong> automated trading systems that execute trades on your behalf</li>
                <li><strong>ARE</strong> technical analysis tools that provide signals based on mathematical calculations</li>
                <li><strong>ARE</strong> for educational and informational purposes only</li>
              </ul>
              <p>
                We do not manage your portfolio, execute trades, or have access to your trading/demat account.
              </p>
            </Section>

            <Section title="2. SEBI Compliance Disclaimer">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="font-semibold text-amber-800 mb-2">Regulatory Status:</p>
                <ul className="text-amber-700 space-y-2 text-sm">
                  <li>• Xtin Capital is <strong>NOT</strong> registered with SEBI as an Investment Adviser, Research Analyst, or Portfolio Manager</li>
                  <li>• We do not provide personalized investment advice or stock recommendations</li>
                  <li>• Our algorithms are software tools, not financial advice</li>
                  <li>• We are not responsible for any regulatory interpretation of our services</li>
                </ul>
              </div>
              <p>
                By subscribing, you acknowledge that you are purchasing a software tool (TradingView indicator) 
                and not investment advice. Any trading decision you make is entirely your own responsibility.
              </p>
            </Section>

            <Section title="3. Risk Warnings">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                <p className="font-semibold text-red-800">You must understand and accept the following risks:</p>
                <ul className="text-red-700 space-y-2 text-sm">
                  <li><strong>Market Risk:</strong> Securities prices can fall as well as rise. You may lose some or all of your invested capital.</li>
                  <li><strong>No Guarantee of Profits:</strong> Past performance of any algorithm does NOT guarantee future results. Historical backtests do not reflect actual trading conditions.</li>
                  <li><strong>Slippage & Execution:</strong> Real trading involves slippage, commissions, and execution delays that may affect results significantly.</li>
                  <li><strong>Technical Failures:</strong> Software, internet, or platform failures can occur. We are not liable for any losses due to technical issues.</li>
                  <li><strong>Market Conditions:</strong> Algorithms may perform differently in different market conditions (trending, ranging, volatile, etc.)</li>
                  <li><strong>Leverage Risk:</strong> If you use margin/leverage, your losses can exceed your initial investment.</li>
                  <li><strong>Emotional Decisions:</strong> You may not follow signals consistently due to fear, greed, or other emotional factors.</li>
                </ul>
              </div>
            </Section>

            <Section title="4. Subscription Terms">
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Pricing:</strong> Algorithm subscriptions are priced at ₹4,999 per month per algorithm unless otherwise specified.</li>
                <li><strong>Billing:</strong> Subscriptions are one-time payments for one month of access. They do not renew automatically — renew from the Algorithms page to continue.</li>
                <li><strong>Delivery:</strong> Access to the TradingView indicator will be provided within 24 hours of successful payment.</li>
                <li><strong>Platform:</strong> Algorithms are delivered as private indicators on TradingView. You must have a TradingView account.</li>
                <li><strong>Access:</strong> Subscription grants you personal, non-transferable access to the algorithm.</li>
              </ul>
            </Section>

            <Section title="5. Refund Policy">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="font-semibold text-gray-800 mb-2">Refund Conditions:</p>
                <ul className="text-gray-700 space-y-2 text-sm">
                  <li>• <strong>No refunds</strong> will be provided once the indicator has been added to your TradingView account</li>
                  <li>• <strong>No refunds</strong> for dissatisfaction with algorithm performance or trading losses</li>
                  <li>• Refund may be considered only if we fail to deliver the indicator within 72 hours of payment, subject to verification</li>
                  <li>• All refund requests must be made in writing to {COMPANY.supportEmail} within 48 hours of payment</li>
                  <li>• See also our site-wide <Link to="/refund-policy" className="underline">Refund &amp; Cancellation Policy</Link></li>
                </ul>
              </div>
            </Section>

            <Section title="6. User Responsibilities">
              <p>By subscribing to our algorithms, you agree that:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>You are at least 18 years old and legally capable of entering into contracts</li>
                <li>You have adequate knowledge of financial markets and understand the risks involved in trading</li>
                <li>You will use the algorithm only for your personal trading decisions</li>
                <li>You will NOT share, distribute, copy, reverse-engineer, or resell the algorithm</li>
                <li>You will NOT use the algorithm to provide investment advice to others</li>
                <li>All trading decisions are made by you and you alone</li>
                <li>You have read and understood the risk warnings in this document</li>
              </ul>
            </Section>

            <Section title="7. Limitation of Liability">
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-4">
                <p className="text-sm text-slate-700">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, XTIN CAPITAL, ITS DIRECTORS, EMPLOYEES, AND AFFILIATES SHALL NOT BE LIABLE FOR:
                </p>
                <ul className="text-slate-600 space-y-1 text-sm mt-3">
                  <li>• Any trading losses, whether direct, indirect, incidental, or consequential</li>
                  <li>• Loss of profits, revenue, data, or business opportunities</li>
                  <li>• Any reliance on signals generated by the algorithms</li>
                  <li>• Technical failures, errors, or interruptions in service</li>
                  <li>• Actions or inactions based on algorithm signals</li>
                </ul>
                <p className="text-sm text-slate-700 mt-3 font-medium">
                  In no event shall our total liability exceed the amount paid by you for the subscription in the preceding month.
                </p>
              </div>
            </Section>

            <Section title="8. Indemnification">
              <p>
                You agree to defend, indemnify, and hold harmless Xtin Capital, XTIN SERVICES LLP, its partners, 
                employees, and affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) 
                arising from:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Your use of the algorithms</li>
                <li>Your trading activities and decisions</li>
                <li>Your violation of these terms</li>
                <li>Any third-party claims related to your trading activities</li>
              </ul>
            </Section>

            <Section title="9. Intellectual Property">
              <p>
                All algorithms, code, methodologies, and related materials are the exclusive intellectual property 
                of Xtin Capital. Unauthorized copying, distribution, modification, or reverse engineering is strictly 
                prohibited and may result in legal action.
              </p>
            </Section>

            <Section title="10. Termination">
              <ul className="list-disc ml-6 space-y-2">
                <li>We reserve the right to terminate your subscription without notice for violation of these terms</li>
                <li>We may discontinue any algorithm at any time with reasonable notice</li>
                <li>You may cancel your subscription at any time, but no prorated refunds will be provided</li>
              </ul>
            </Section>

            <Section title="11. Dispute Resolution">
              <p>
                Any disputes arising from these terms shall be resolved through arbitration in accordance with 
                the Arbitration and Conciliation Act, 1996. The seat of arbitration shall be Ahmedabad, Gujarat, 
                and proceedings shall be conducted in English.
              </p>
            </Section>

            <Section title="12. Governing Law">
              <p>
                These terms shall be governed by and construed in accordance with the laws of India. 
                The courts of Ahmedabad, Gujarat shall have exclusive jurisdiction over any disputes.
              </p>
            </Section>

            <Section title="13. Amendments">
              <p>
                We reserve the right to modify these terms at any time. Changes will be posted on this page 
                with an updated date. Your continued use of the algorithms after any changes constitutes 
                acceptance of the modified terms.
              </p>
            </Section>

            <Section title="14. Contact Information">
              <div className="bg-brand-soft border border-brand-line rounded-xl p-4">
                <p className="font-semibold text-brand mb-3">For questions or concerns:</p>
                <div className="text-brand space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${COMPANY.supportEmail}`} className="underline">{COMPANY.supportEmail}</a>
                  </p>
                  <p>
                    <strong>Phone:</strong>{' '}
                    <a href={COMPANY.phoneHref} className="underline">{COMPANY.phone}</a>
                  </p>
                  <p className="text-xs text-brand mt-2">
                    Response time: Within 24-48 business hours
                  </p>
                </div>
              </div>
            </Section>

            {/* Final Acknowledgment */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-6 mt-8 brand-on-dark">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                Acknowledgement
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                By subscribing to any Xtin Capital algorithm, you confirm that you have read, understood, 
                and agree to all the terms and conditions stated in this document. You acknowledge that 
                trading involves substantial risk, that past performance does not guarantee future results, 
                and that you are solely responsible for your trading decisions.
              </p>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-8 text-center">
            <Link 
              to="/algos" 
              className="inline-flex items-center px-6 py-3 bg-brand-fill hover:bg-brand-hover text-white font-semibold rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Algorithms
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AlgoTerms;
