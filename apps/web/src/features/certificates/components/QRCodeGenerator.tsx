import React, { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * QRCodeGenerator Component
 * Renders a QR code that encodes the verification URL for a certificate.
 * Props:
 *   certificateId  - The unique certificate ID (e.g., XC-2026-A8F9K)
 *   size           - QR code size in px (default: 200)
 *   includeMargin  - Whether to include a white margin (default: true)
 *   onDownload     - Callback fired when user clicks download
 */

const VERIFICATION_BASE_URL = import.meta.env.VITE_VERIFICATION_URL || 'https://xtincapital.com';

const QRCodeGenerator = ({
  certificateId,
  size = 200,
  includeMargin = true,
  onDownload,
}: {
  certificateId: string;
  size?: number;
  includeMargin?: boolean;
  onDownload?: () => void;
}) => {
  const verificationUrl = useMemo(() => {
    if (!certificateId) return '';
    return `${VERIFICATION_BASE_URL}/verify/${certificateId}`;
  }, [certificateId]);

  const handleDownload = () => {
    // Get the SVG element
    const svg = document.getElementById(`cert-qr-${certificateId}`);
    if (!svg) return;

    // Serialize SVG to XML
    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });

    // Create download link
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-qr-${certificateId}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onDownload) onDownload();
  };

  if (!certificateId) {
    return (
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 dark:border-slate-600 dark:bg-slate-800">
        <p className="text-sm text-gray-500 dark:text-slate-400">
          No certificate ID provided
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <QRCodeSVG
          id={`cert-qr-${certificateId}`}
          value={verificationUrl}
          size={size}
          includeMargin={includeMargin}
          level="M" // Medium error correction — balances density and reliability
          fgColor="#0F172A"
          bgColor="#FFFFFF"
        />
      </div>

      {/* Verification URL */}
      {verificationUrl && (
        <p className="max-w-full truncate text-center text-xs text-gray-500 dark:text-slate-400">
          <span className="font-medium">Scan to verify:</span>{' '}
          <span className="font-mono">{verificationUrl}</span>
        </p>
      )}

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Download QR Code
      </button>
    </div>
  );
};

export default QRCodeGenerator;

