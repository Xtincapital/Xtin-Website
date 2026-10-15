import React from 'react';
import QRCodeGenerator from './QRCodeGenerator';

/**
 * CertificateQRModal — Displays a QR code for a certificate in a modal overlay.
 * Props:
 *   certificateId  - The certificate ID to generate QR for
 *   onClose        - Callback when modal is closed
 */
const CertificateQRModal = ({ certificateId, onClose }) => {
  if (!certificateId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 brand-on-dark">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Certificate QR Code
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Scan this QR code to verify the certificate
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <QRCodeGenerator
            certificateId={certificateId}
            size={240}
            includeMargin={true}
          />
        </div>

        {/* Certificate ID */}
        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-center dark:bg-slate-800">
          <p className="text-xs text-gray-500 dark:text-slate-400">Certificate ID</p>
          <p className="font-mono text-sm font-semibold text-gray-900 dark:text-slate-100">
            {certificateId}
          </p>
        </div>

        {/* Close button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateQRModal;

