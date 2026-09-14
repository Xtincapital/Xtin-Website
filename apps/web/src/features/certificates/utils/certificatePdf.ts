import { jsPDF } from 'jspdf';

const formatDate = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const sanitizeFilename = (value) => value.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '');

export const generateCertificatePdf = ({
  recipientName,
  levelLabel,
  issuedAt,
  certificateId,
}) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 56;
  const headerHeight = 88;
  const accentHeight = 6;

  doc.setFillColor(250, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  doc.setFillColor(245, 158, 11);
  doc.rect(0, headerHeight - accentHeight, pageWidth, accentHeight, 'F');

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(2);
  doc.rect(margin - 18, margin - 18, pageWidth - (margin - 18) * 2, pageHeight - (margin - 18) * 2);

  doc.setTextColor(226, 232, 240);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(120);
  doc.text('XTIN', pageWidth / 2, pageHeight / 2 + 40, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('XTIN ACADEMY', margin, 48);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Professional Learning Certificate', pageWidth - margin, 48, { align: 'right' });

  const titleY = headerHeight + 70;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(34);
  doc.text('Certificate of Completion', pageWidth / 2, titleY, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(18);
  doc.setTextColor(51, 65, 85);
  doc.text('This certifies that', pageWidth / 2, titleY + 40, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(15, 23, 42);
  doc.text(recipientName, pageWidth / 2, titleY + 95, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(71, 85, 105);
  doc.text('has successfully completed all required lessons in the', pageWidth / 2, titleY + 135, { align: 'center' });

  const levelText = `${levelLabel} Course`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const badgeWidth = doc.getTextWidth(levelText) + 36;
  const badgeHeight = 28;
  const badgeX = (pageWidth - badgeWidth) / 2;
  const badgeY = titleY + 150;
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(1);
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 14, 14, 'FD');
  doc.setTextColor(5, 150, 105);
  doc.text(levelText, pageWidth / 2, badgeY + 19, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(100, 116, 139);
  doc.text('Issued by XTIN Academy - a recognized leader in financial learning.', pageWidth / 2, badgeY + 52, { align: 'center' });

  const sealX = pageWidth - margin - 70;
  const sealY = pageHeight - 170;
  doc.setFillColor(245, 158, 11);
  doc.circle(sealX, sealY, 46, 'F');
  doc.setDrawColor(252, 211, 77);
  doc.setLineWidth(2);
  doc.circle(sealX, sealY, 40, 'S');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('CERTIFIED', sealX, sealY + 4, { align: 'center' });
  doc.setFontSize(9);
  doc.text('XTIN', sealX, sealY + 20, { align: 'center' });

  const signatureY = pageHeight - 130;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(1);
  doc.line(margin, signatureY, margin + 180, signatureY);
  doc.line(pageWidth - margin - 180, signatureY, pageWidth - margin, signatureY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('Program Director', margin, signatureY + 18);
  doc.text('Head of Learning', pageWidth - margin, signatureY + 18, { align: 'right' });

  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);
  doc.text(`Issued on ${formatDate(issuedAt)}`, margin, pageHeight - 70);
  doc.text(`Certificate ID: ${certificateId}`, pageWidth - margin, pageHeight - 70, { align: 'right' });

  const safeName = sanitizeFilename(recipientName) || 'certificate';
  const safeLevel = sanitizeFilename(levelLabel.toLowerCase());
  doc.save(`xtin-${safeLevel}-certificate-${safeName}.pdf`);
};
