import React from 'react';
import { FaCertificate } from 'react-icons/fa';

const CertificateModal = ({
  certificate,
  recipientName,
  onNameChange,
  onClose,
  onDownload,
  isDownloading,
  errorMessage,
}) => {
  if (!certificate) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 brand-on-dark">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${certificate.badgeBg}`}>
            <FaCertificate className={`text-2xl ${certificate.badgeText}`} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Certificate Unlocked</p>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">{certificate.title}</h3>
          </div>
        </div>

        <p className="text-gray-600 dark:text-slate-300">
          You completed all {certificate.moduleCount} modules in the {certificate.levelLabel.toLowerCase()} track. Enter your name to generate your PDF certificate.
        </p>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-200">Certificate name</label>
          <input
            type="text"
            value={recipientName}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Your full name"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-line dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand dark:focus:ring-brand"
          />
          {errorMessage && (
            <p className="mt-2 text-sm text-rose-600">{errorMessage}</p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Close
          </button>
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className={`flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all ${certificate.buttonBg} ${isDownloading ? 'opacity-70' : 'hover:shadow-lg'}`}
          >
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
