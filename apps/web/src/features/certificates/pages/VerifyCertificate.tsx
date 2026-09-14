import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import certificateService from '../services/certificateService';
import SEO from '../../../components/SEO';

/**
 * VerifyCertificate Page
 * Public page accessed by scanning a QR code on an intern's certificate.
 * Route: /verify/:certificateId
 * Handles three distinct states:
 *   - verified: Certificate is valid
 *   - revoked: Certificate exists but has been revoked
 *   - not_found: Certificate ID does not exist
 *   - error: Network or server error
 */
const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [state, setState] = useState({
    loading: true,
    status: null, // 'verified' | 'revoked' | 'not_found' | 'error'
    certificate: null,
    message: null,
  });

  useEffect(() => {
    if (!certificateId) {
      setState({
        loading: false,
        status: 'not_found',
        certificate: null,
        message: 'No certificate ID provided.',
      });
      return;
    }

    const verify = async () => {
      setState((prev) => ({ ...prev, loading: true, message: null }));

      try {
        const result = await certificateService.verifyCertificate(certificateId);

        setState({
          loading: false,
          status: result.status, // 'verified' | 'revoked' | 'not_found' | 'error'
          certificate: result.data || null,
          message: result.message || null,
        });
      } catch (err) {
        setState({
          loading: false,
          status: 'error',
          certificate: null,
          message: 'An error occurred while verifying the certificate.',
        });
      }
    };

    verify();
  }, [certificateId]);

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <SEO
        title={
          state.status === 'verified'
            ? `Verified Certificate — ${state.certificate?.intern_name}`
            : 'Certificate Verification — Xtin Capital'
        }
        description="Verify internship certificates issued by Xtin Capital."
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-12">
          {/* Logo */}
          <Link to="/" className="mb-8">
            <img
              src="/logos/Logo1.png"
              alt="Xtin Capital"
              className="h-12 w-auto"
            />
          </Link>

          {/* Loading State */}
          {state.loading && (
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                Verifying Certificate
              </h2>
              <p className="mt-2 text-gray-500 dark:text-slate-400">
                Please wait while we verify this certificate...
              </p>
            </div>
          )}

          {/* Verified State */}
          {!state.loading && state.status === 'verified' && state.certificate && (
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              {/* Verified Badge */}
              <div className="mb-6 flex flex-col items-center">
                <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <svg
                    className="h-10 w-10 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-1.5 dark:bg-emerald-900/30">
                  <svg
                    className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    VERIFIED
                  </span>
                </div>
              </div>

              {/* Certificate Header */}
              <div className="mb-6 border-b border-gray-100 pb-4 text-center dark:border-slate-700">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  Internship Certificate
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Issued by Xtin Capital
                </p>
              </div>

              {/* Intern Details (Read-Only) */}
              <div className="space-y-4">
                <DetailRow
                  label="Certificate ID"
                  value={state.certificate.certificate_id}
                  mono
                />
                <DetailRow
                  label="Intern Name"
                  value={state.certificate.intern_name}
                />
                <DetailRow
                  label="Role"
                  value={state.certificate.intern_role}
                />
                <DetailRow
                  label="Start Date"
                  value={formatDate(state.certificate.start_date)}
                />
                <DetailRow
                  label="End Date"
                  value={formatDate(state.certificate.end_date)}
                />
                <DetailRow
                  label="Issued On"
                  value={formatDate(state.certificate.issued_at)}
                />
              </div>

              {/* Footer */}
              <div className="mt-6 border-t border-gray-100 pt-4 text-center dark:border-slate-700">
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  This certificate verification is provided by{' '}
                  <span className="font-semibold text-gray-600 dark:text-slate-300">
                    Xtin Capital
                  </span>
                  . The details above are uneditable and verified through our
                  secure database.
                </p>
              </div>
            </div>
          )}

          {/* Revoked State */}
          {!state.loading && state.status === 'revoked' && (
            <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-lg dark:border-amber-900/50 dark:bg-slate-800">
              {/* Revoked Badge */}
              <div className="mb-6 flex flex-col items-center">
                <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <svg
                    className="h-10 w-10 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 dark:bg-amber-900/30">
                  <svg
                    className="h-4 w-4 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                    CERTIFICATE REVOKED
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                This Certificate Has Been Revoked
              </h2>
              <p className="mt-2 text-gray-500 dark:text-slate-400">
                {state.message || 'This certificate is no longer valid. It has been revoked by the issuer.'}
              </p>

              {certificateId && (
                <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-slate-700/50">
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    Certificate ID:
                  </p>
                  <p className="font-mono text-sm font-medium text-gray-700 dark:text-slate-300">
                    {certificateId}
                  </p>
                </div>
              )}

              <div className="mt-6 border-t border-amber-100 pt-4 dark:border-amber-900/30">
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  If you have questions about this revocation, please contact{' '}
                  <a
                    href="mailto:support@xtincapital.com"
                    className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                  >
                    support@xtincapital.com
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Not Found State */}
          {!state.loading && state.status === 'not_found' && (
            <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg dark:border-red-900/50 dark:bg-slate-800">
              {/* Error Badge */}
              <div className="mb-6 flex flex-col items-center">
                <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <svg
                    className="h-10 w-10 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-4 py-1.5 dark:bg-red-900/30">
                  <svg
                    className="h-4 w-4 text-red-600 dark:text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-bold text-red-700 dark:text-red-300">
                    CERTIFICATE NOT FOUND
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                Certificate Not Found
              </h2>
              <p className="mt-2 text-gray-500 dark:text-slate-400">
                {state.message || 'No certificate matches the provided ID. It may have been entered incorrectly.'}
              </p>

              {certificateId && (
                <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-slate-700/50">
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    Certificate ID you attempted to verify:
                  </p>
                  <p className="font-mono text-sm font-medium text-gray-700 dark:text-slate-300">
                    {certificateId}
                  </p>
                </div>
              )}

              <div className="mt-6 border-t border-red-100 pt-4 dark:border-red-900/30">
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  If you believe this is an error, please contact{' '}
                  <a
                    href="mailto:support@xtincapital.com"
                    className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                  >
                    support@xtincapital.com
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Generic Error State (network, server error, etc.) */}
          {!state.loading && state.status === 'error' && (
            <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg dark:border-red-900/50 dark:bg-slate-800">
              {/* Error Badge */}
              <div className="mb-6 flex flex-col items-center">
                <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <svg
                    className="h-10 w-10 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-4 py-1.5 dark:bg-red-900/30">
                  <span className="text-sm font-bold text-red-700 dark:text-red-300">
                    VERIFICATION ERROR
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                Verification Unavailable
              </h2>
              <p className="mt-2 text-gray-500 dark:text-slate-400">
                {state.message || 'An unexpected error occurred. Please try again later.'}
              </p>

              <div className="mt-6 border-t border-red-100 pt-4 dark:border-red-900/30">
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  Please try again or contact{' '}
                  <a
                    href="mailto:support@xtincapital.com"
                    className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                  >
                    support@xtincapital.com
                  </a>
                  {' '}if the issue persists.
                </p>
              </div>
            </div>
          )}

          {/* Back to Home */}
          <Link
            to="/"
            className="mt-6 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            ← Back to Xtin Capital
          </Link>
        </div>
      </div>
    </>
  );
};

/**
 * DetailRow — Displays a label-value pair
 */
const DetailRow = ({ label, value, mono = false }) => (
  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-slate-700/50">
    <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
      {label}
    </span>
    <span
      className={`text-right text-sm font-semibold text-gray-900 dark:text-slate-100 ${
        mono ? 'font-mono tracking-wide' : ''
      }`}
    >
      {value || '—'}
    </span>
  </div>
);

export default VerifyCertificate;

