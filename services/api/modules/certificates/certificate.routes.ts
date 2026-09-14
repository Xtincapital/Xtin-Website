import express from 'express';
import { authenticate } from '../../middlewares/auth.js';
import {
  generateQRCode,
  verifyCertificate,
  generateCertificate,
  listCertificates,
  revokeCertificate,
} from './certificate.controller.js';

const router = express.Router();

// =====================================================
// PUBLIC ROUTES (No authentication required)
// =====================================================

/**
 * @route   GET /api/certificates/verify/:certificateId
 * @desc    Public verification endpoint — scans QR code to verify certificate
 * @access  Public
 */
router.get('/certificates/verify/:certificateId', verifyCertificate);

// =====================================================
// AUTHENTICATED ROUTES (Admin/Backend access)
// =====================================================

/**
 * @route   GET /api/certificates/qr/:certificateId
 * @desc    Generate QR code for a certificate
 * @access  Authenticated (admin)
 */
router.get('/certificates/qr/:certificateId', authenticate, generateQRCode);

/**
 * @route   POST /api/certificates/generate
 * @desc    Create a new certificate record
 * @access  Authenticated (admin)
 */
router.post('/certificates/generate', authenticate, generateCertificate);

/**
 * @route   GET /api/certificates
 * @desc    List all certificates (with pagination, filtering)
 * @access  Authenticated (admin)
 */
router.get('/certificates', authenticate, listCertificates);

/**
 * @route   PUT /api/certificates/revoke/:certificateId
 * @desc    Revoke a certificate
 * @access  Authenticated (admin)
 */
router.put('/certificates/revoke/:certificateId', authenticate, revokeCertificate);

export default router;

