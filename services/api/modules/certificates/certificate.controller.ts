import QRCode from 'qrcode';
import { HTTP_STATUS, MESSAGES } from '../../constants/constants.js';
import { config } from '../../constants/config.js';
import {
  validateGenerateCertificate,
  validateCertificateId,
} from './certificate.validator.js';
import {
  getCertificateStatusById,
  getCertificateById,
  touchLastVerifiedAt,
  generateCertificateIdRpc,
  insertCertificate,
  listCertificates as listCertificatesQuery,
  revokeCertificateById,
  findCertificateIdCandidate,
} from './certificate.repository.js';

// Base URL for verification — uses API_URL or constructs from env
const BASE_URL = process.env.VERIFICATION_BASE_URL || 'https://xtincapital.com';

/**
 * Generate a QR code for a given certificate ID.
 * QR encodes: https://xtincapital.com/verify/{certificateId}
 */
const generateQRCode = async (req, res) => {
  try {
    const rawCertificateId = req.params.certificateId || '';
    const certificateId = rawCertificateId.trim().toUpperCase();

    // Validate certificate ID format
    const validation = validateCertificateId(certificateId);
    if (validation.errors) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: validation.message,
        errors: validation.errors,
      });
    }

    // First verify the certificate exists in DB
    const { data: certificate, error } = await getCertificateStatusById(certificateId);

    if (error || !certificate) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: 'Certificate not found',
      });
    }

    if (certificate.is_revoked) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'Certificate has been revoked',
      });
    }

    // Generate QR code as data URL (PNG base64)
    const verificationUrl = `${BASE_URL}/verify/${certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0F172A',     // Slate-900
        light: '#FFFFFF',    // White
      },
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: 'QR code generated successfully',
      data: {
        certificate_id: certificateId,
        verification_url: verificationUrl,
        qr_code: qrCodeDataUrl, // Base64 PNG data URL
      },
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: 'Failed to generate QR code',
    });
  }
};

/**
 * Verify a certificate by its ID (public endpoint)
 * Returns intern details if valid.
 * - 200: Certificate is valid and verified
 * - 410: Certificate exists but has been revoked
 * - 404: Certificate does not exist
 */
const verifyCertificate = async (req, res) => {
  try {
    const rawCertificateId = req.params.certificateId || '';
    const certificateId = rawCertificateId.trim().toUpperCase();

    // Validate certificate ID format
    const validation = validateCertificateId(certificateId);
    if (validation.errors) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: validation.message,
        errors: validation.errors,
      });
    }

    // Step 1: Find certificate by ID (regardless of revoked status)
    const { data: certificate, error } = await getCertificateById(certificateId);

    if (error) {
      console.error('Certificate lookup error:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: MESSAGES.SERVER_ERROR,
      });
    }

    // Step 2: Certificate does not exist
    if (!certificate) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: 'Certificate Not Found. The certificate ID is invalid or does not exist.',
        data: null,
        code: 'CERT_NOT_FOUND',
      });
    }

    // Step 3: Certificate exists but has been revoked
    if (certificate.is_revoked) {
      return res.status(HTTP_STATUS.GONE).json({
        status: HTTP_STATUS.GONE,
        message: 'This certificate has been revoked and is no longer valid.',
        data: null,
        code: 'CERT_REVOKED',
      });
    }

    // Step 4: Certificate is valid — update last_verified_at timestamp
    const { error: updateError } = await touchLastVerifiedAt(certificateId);

    if (updateError) {
      // Non-critical: log but don't fail the request
      console.warn('Failed to update last_verified_at:', updateError.message);
    }

    // Return clean intern details (uneditable)
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: 'Certificate verified successfully',
      data: {
        certificate_id: certificate.certificate_id,
        intern_name: certificate.intern_name,
        intern_role: certificate.intern_role,
        start_date: certificate.start_date,
        end_date: certificate.end_date,
        issued_at: certificate.issued_at,
        is_verified: true,
      },
    });
  } catch (error) {
    console.error('Certificate verification error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Generate (create) a new certificate — Admin only
 */
const generateCertificate = async (req, res) => {
  try {
    // Validate input
    const validation = validateGenerateCertificate(req.body);
    if (validation.errors) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: validation.message,
        errors: validation.errors,
      });
    }

    const { intern_name, intern_role, start_date, end_date, metadata } = validation.data;

    // Generate a unique certificate ID using the DB function
    const { data: idResult, error: idError } = await generateCertificateIdRpc();

    let certificateId;
    if (idError || !idResult) {
      // Fallback: generate client-side ID
      certificateId = await generateCertificateIdFallback();
    } else {
      certificateId = idResult;
    }

    // Insert into database
    const { data: certificate, error: insertError } = await insertCertificate({
      certificate_id: certificateId,
      intern_name: intern_name.trim(),
      intern_role: intern_role.trim(),
      start_date,
      end_date,
      metadata,
    });

    if (insertError) {
      console.error('Certificate insert error:', insertError);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'Failed to generate certificate',
        error: insertError.message,
      });
    }

    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: 'Certificate generated successfully',
      data: {
        id: certificate.id,
        certificate_id: certificate.certificate_id,
        intern_name: certificate.intern_name,
        intern_role: certificate.intern_role,
        start_date: certificate.start_date,
        end_date: certificate.end_date,
        issued_at: certificate.issued_at,
        is_revoked: certificate.is_revoked,
      },
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * List all certificates (admin only)
 */
const listCertificates = async (req, res) => {
  try {
    const { page = 1, limit = 20, revoked, search } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const { data: certificates, error, count } = await listCertificatesQuery({
      revoked,
      search,
      offset,
      limitNum,
    });

    if (error) {
      console.error('List certificates error:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch certificates',
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: 'Certificates fetched successfully',
      data: {
        certificates,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: count ? Math.ceil(count / limitNum) : 0,
        },
      },
    });
  } catch (error) {
    console.error('List certificates error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Revoke a certificate (admin only)
 */
const revokeCertificate = async (req, res) => {
  try {
    const rawCertificateId = req.params.certificateId || '';
    const certificateId = rawCertificateId.trim().toUpperCase();

    // Validate certificate ID format
    const validation = validateCertificateId(certificateId);
    if (validation.errors) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: validation.message,
        errors: validation.errors,
      });
    }

    const { data: certificate, error } = await revokeCertificateById(certificateId);

    if (error || !certificate) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: 'Certificate not found',
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: 'Certificate revoked successfully',
      data: {
        certificate_id: certificate.certificate_id,
        is_revoked: certificate.is_revoked,
        revoked_at: certificate.updated_at,
      },
    });
  } catch (error) {
    console.error('Revoke certificate error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Fallback: Generate a certificate ID client-side if the DB function fails
 */
async function generateCertificateIdFallback() {
  const year = new Date().getFullYear().toString();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const candidateId = `XC-${year}-${randomPart}`;

  // Check uniqueness
  const { data: existing } = await findCertificateIdCandidate(candidateId);

  if (existing) {
    // Collision — try again recursively
    return generateCertificateIdFallback();
  }

  return candidateId;
}

export {
  generateQRCode,
  verifyCertificate,
  generateCertificate,
  listCertificates,
  revokeCertificate,
};

