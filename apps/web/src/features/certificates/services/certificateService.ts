import authService from '../../../services/authService';

// Use relative path so Vite proxy (or production reverse-proxy) handles routing
const API_BASE = `/api/certificates`;

class CertificateService {
  /**
   * Verify a certificate by its ID (public endpoint)
   * @param {string} certificateId - e.g. XC-2026-A8F9K
   * @returns {Promise<object>} Certificate data if valid
   *   status: 'verified' | 'revoked' | 'not_found' | 'error'
   *   data: certificate object (only when verified)
   *   message: human-readable message
   */
  async verifyCertificate(certificateId) {
    try {
      const response = await fetch(`${API_BASE}/verify/${certificateId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await this._parseJSON(response);

      if (response.ok) {
        return {
          status: 'verified',
          message: result.message,
          data: result.data,
        };
      }

      // Handle known error codes from the backend
      if (result.code === 'CERT_REVOKED') {
        return {
          status: 'revoked',
          message: result.message || 'This certificate has been revoked.',
          data: null,
        };
      }

      if (result.code === 'CERT_NOT_FOUND' || response.status === 404) {
        return {
          status: 'not_found',
          message: result.message || 'Certificate Not Found.',
          data: null,
        };
      }

      // Fallback for other errors
      return {
        status: 'error',
        message: result.message || 'Certificate Not Found / Invalid',
        data: null,
      };
    } catch (error) {
      console.error('Certificate verification error:', error);
      return {
        status: 'error',
        message: 'Network error. Please try again.',
        data: null,
      };
    }
  }

  /**
   * Safely parse JSON response, returning a fallback message if body is empty
   */
  async _parseJSON(response) {
    const text = await response.text();
    if (!text) {
      return { message: response.statusText || 'Empty response from server' };
    }
    try {
      return JSON.parse(text);
    } catch {
      // If response is HTML (e.g. Vercel index.html), extract title for debugging
      const isHTML = text.trim().startsWith('<');
      return {
        message: isHTML
          ? 'Server returned HTML instead of JSON. API proxy may be misconfigured.'
          : 'Invalid JSON response from server',
      };
    }
  }

  /**
   * Generate a QR code for a certificate (admin only)
   * @param {string} certificateId
   * @returns {Promise<object>} QR code data URL
   */
  async generateQRCode(certificateId) {
    try {
      const url = `${API_BASE}/qr/${certificateId}`;
      const response = await authService.makeAuthenticatedRequest(url, {
        method: 'GET',
      });

      const result = await this._parseJSON(response);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate QR code');
      }

      return result.data;
    } catch (error) {
      console.error('QR code generation error:', error);
      throw new Error(error.message || 'Failed to generate QR code');
    }
  }

  /**
   * Generate (create) a new certificate (admin only)
   * @param {object} certificateData
   * @returns {Promise<object>} Created certificate
   */
  async generateCertificate(certificateData) {
    try {
      const url = `${API_BASE}/generate`;
      const response = await authService.makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify(certificateData),
      });

      const result = await this._parseJSON(response);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate certificate');
      }

      return result.data;
    } catch (error) {
      console.error('Generate certificate error:', error);
      throw new Error(error.message || 'Failed to generate certificate');
    }
  }

  /**
   * List all certificates (admin only)
   * @param {object} params - { page, limit, revoked, search }
   * @returns {Promise<object>} Certificates with pagination
   */
  async listCertificates(params: { page?: number; limit?: number; revoked?: boolean; search?: string } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.set('page', String(params.page));
      if (params.limit) queryParams.set('limit', String(params.limit));
      if (params.revoked !== undefined) queryParams.set('revoked', String(params.revoked));
      if (params.search) queryParams.set('search', params.search);

      const url = `${API_BASE}?${queryParams.toString()}`;
      const response = await authService.makeAuthenticatedRequest(url, {
        method: 'GET',
      });

      const result = await this._parseJSON(response);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch certificates');
      }

      return result.data;
    } catch (error) {
      console.error('List certificates error:', error);
      throw new Error(error.message || 'Failed to fetch certificates');
    }
  }

  /**
   * Revoke a certificate (admin only)
   * @param {string} certificateId
   * @returns {Promise<object>} Revoked certificate info
   */
  async revokeCertificate(certificateId) {
    try {
      const url = `${API_BASE}/revoke/${certificateId}`;
      const response = await authService.makeAuthenticatedRequest(url, {
        method: 'PUT',
      });

      const result = await this._parseJSON(response);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to revoke certificate');
      }

      return result.data;
    } catch (error) {
      console.error('Revoke certificate error:', error);
      throw new Error(error.message || 'Failed to revoke certificate');
    }
  }

  /**
   * Generate certificate ID format: XC-YYYY-XXXXX
   * @returns {string} Certificate ID
   */
  generateCertificateId() {
    const year = new Date().getFullYear().toString();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `XC-${year}-${randomPart}`;
  }
}

export default new CertificateService();

