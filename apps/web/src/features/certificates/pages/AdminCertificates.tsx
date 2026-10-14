import React, { useState, useEffect, useCallback } from 'react';
import certificateService from '../services/certificateService';
import { useAuth } from '../../../contexts/AuthContext';
import CertificateQRModal from '../components/CertificateQRModal';
import SEO from '../../../components/SEO';
import { isAdminEmail } from '../../../config/admin';
import AdminHeader from '@/features/admin/components/AdminHeader';

/**
 * AdminCertificates — Admin panel for managing internship certificates.
 * - Create new certificates (name, role, start date, end date)
 * - View QR code for any certificate
 * - List all certificates with search, pagination, filter
 * - Revoke certificates
 */
const AdminCertificates = () => {
  const { user } = useAuth();

  // --- Form State ---
  const [formData, setFormData] = useState({
    intern_name: '',
    intern_role: '',
    start_date: '',
    end_date: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // --- List State ---
  const [certificates, setCertificates] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRevoked, setFilterRevoked] = useState('all');
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listError, setListError] = useState(null);

  // --- QR Modal State ---
  const [qrModalCertId, setQrModalCertId] = useState(null);

  // --- Delete/Revoke State ---
  const [revokingId, setRevokingId] = useState(null);

  // Fetch certificates
  const fetchCertificates = useCallback(async (page = 1) => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const params: { page: number; limit: number; search?: string; revoked?: boolean } = {
        page,
        limit: pagination.limit,
      };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (filterRevoked !== 'all') {
        params.revoked = filterRevoked === 'revoked';
      }

      const result = await certificateService.listCertificates(params);
      setCertificates(result.certificates || []);
      setPagination(result.pagination || { page: 1, limit: 15, total: 0, totalPages: 0 });
    } catch (error) {
      setListError(error.message || 'Failed to fetch certificates');
      setCertificates([]);
    } finally {
      setIsLoadingList(false);
    }
  }, [searchQuery, filterRevoked, pagination.limit]);

  // Initial load and when filters change
  useEffect(() => {
    fetchCertificates(1);
  }, [searchQuery, filterRevoked]);

  // --- Form Handling ---
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.intern_name.trim()) errors.intern_name = 'Intern name is required';
    if (!formData.intern_role.trim()) errors.intern_role = 'Intern role is required';
    if (!formData.start_date) errors.start_date = 'Start date is required';
    if (!formData.end_date) errors.end_date = 'End date is required';
    if (formData.start_date && formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      errors.end_date = 'End date must be on or after start date';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleGenerateCertificate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitSuccess(null);

    try {
      const result = await certificateService.generateCertificate({
        intern_name: formData.intern_name.trim(),
        intern_role: formData.intern_role.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
      });

      setSubmitSuccess({
        message: `Certificate ${result.certificate_id} generated successfully!`,
        certificateId: result.certificate_id,
      });

      // Reset form
      setFormData({ intern_name: '', intern_role: '', start_date: '', end_date: '' });
      setFormErrors({});

      // Refresh list and go to first page
      fetchCertificates(1);

      // Show QR modal
      setQrModalCertId(result.certificate_id);
    } catch (error) {
      setSubmitSuccess(null);
      setFormErrors({ submit: error.message || 'Failed to generate certificate' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Revoke ---
  const handleRevoke = async (certificateId) => {
    if (!window.confirm(`Are you sure you want to revoke certificate ${certificateId}?`)) return;

    setRevokingId(certificateId);
    try {
      await certificateService.revokeCertificate(certificateId);
      // Refresh list
      fetchCertificates(pagination.page);
    } catch (error) {
      alert(error.message || 'Failed to revoke certificate');
    } finally {
      setRevokingId(null);
    }
  };

  // --- Pagination ---
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchCertificates(newPage);
  };

  // --- Format date ---
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Only allow admin emails to access this panel (see config/admin.ts)
  const isAuthorized = user && isAdminEmail(user.email);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-lg text-gray-600 dark:text-slate-300">Please log in to access the admin panel.</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg dark:border-red-900/50 dark:bg-slate-800">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Access Denied</h2>
          <p className="mt-2 text-gray-500 dark:text-slate-400">
            You are not authorized to access the certificate admin panel.
          </p>
          <p className="mt-4 text-xs text-gray-400 dark:text-slate-500">
            Logged in as: {user.email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Admin — Certificate Management — Xtin Capital" />
      <AdminHeader />

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-slate-100 tracking-[-0.025em]">
              Certificate Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-slate-400">
              Generate and manage internship certificates with QR code verification
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* LEFT COLUMN: Form */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-slate-100">
                  Generate Certificate
                </h2>

                <form onSubmit={handleGenerateCertificate} className="space-y-5">
                  {/* Intern Name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-slate-200">
                      Intern Name
                    </label>
                    <input
                      type="text"
                      name="intern_name"
                      value={formData.intern_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Rahul Sharma"
                      className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-slate-100 ${
                        formErrors.intern_name
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-500'
                          : 'border-gray-200 focus:border-brand focus:ring-brand-line dark:border-slate-600 dark:focus:border-brand dark:focus:ring-brand'
                      }`}
                    />
                    {formErrors.intern_name && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.intern_name}</p>
                    )}
                  </div>

                  {/* Intern Role */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-slate-200">
                      Intern Role
                    </label>
                    <input
                      type="text"
                      name="intern_role"
                      value={formData.intern_role}
                      onChange={handleInputChange}
                      placeholder="e.g. Financial Analysis Intern"
                      className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-slate-100 ${
                        formErrors.intern_role
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-500'
                          : 'border-gray-200 focus:border-brand focus:ring-brand-line dark:border-slate-600 dark:focus:border-brand dark:focus:ring-brand'
                      }`}
                    />
                    {formErrors.intern_role && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.intern_role}</p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-slate-200">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-slate-100 ${
                        formErrors.start_date
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-500'
                          : 'border-gray-200 focus:border-brand focus:ring-brand-line dark:border-slate-600 dark:focus:border-brand dark:focus:ring-brand'
                      }`}
                    />
                    {formErrors.start_date && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.start_date}</p>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-slate-200">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-slate-100 ${
                        formErrors.end_date
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-500'
                          : 'border-gray-200 focus:border-brand focus:ring-brand-line dark:border-slate-600 dark:focus:border-brand dark:focus:ring-brand'
                      }`}
                    />
                    {formErrors.end_date && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.end_date}</p>
                    )}
                  </div>

                  {/* Submit Error */}
                  {formErrors.submit && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      {formErrors.submit}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-fill dark:hover:bg-brand-hover brand-on-dark"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      'Generate Certificate'
                    )}
                  </button>
                </form>

                {/* Success message */}
                {submitSuccess && (
                  <div className="mt-4 rounded-lg bg-brand-soft p-3 text-sm text-brand dark:bg-brand-soft dark:text-brand">
                    <p className="font-semibold">{submitSuccess.message}</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: List */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                {/* Filters */}
                <div className="border-b border-gray-200 p-4 dark:border-slate-700">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search */}
                    <div className="relative flex-1">
                      <svg
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search by name or certificate ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-line dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-brand dark:focus:ring-brand"
                      />
                    </div>

                    {/* Filter */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 dark:text-slate-300">Status:</label>
                      <select
                        value={filterRevoked}
                        onChange={(e) => setFilterRevoked(e.target.value)}
                        className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-line dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                      >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="revoked">Revoked</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Certificates Table */}
                <div className="overflow-x-auto">
                  {isLoadingList ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-line border-t-brand" />
                    </div>
                  ) : listError ? (
                    <div className="py-16 text-center">
                      <p className="text-red-500 dark:text-red-400">{listError}</p>
                      <button
                        onClick={() => fetchCertificates(1)}
                        className="mt-3 text-sm font-semibold text-brand hover:text-brand dark:text-brand"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : certificates.length === 0 ? (
                    <div className="py-16 text-center">
                      <svg
                        className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {searchQuery ? 'No certificates match your search.' : 'No certificates generated yet.'}
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-700">
                          <th className="px-4 py-3 font-semibold text-gray-600 dark:text-slate-300">Certificate ID</th>
                          <th className="px-4 py-3 font-semibold text-gray-600 dark:text-slate-300">Intern Name</th>
                          <th className="px-4 py-3 font-semibold text-gray-600 dark:text-slate-300">Role</th>
                          <th className="px-4 py-3 font-semibold text-gray-600 dark:text-slate-300">Duration</th>
                          <th className="px-4 py-3 font-semibold text-gray-600 dark:text-slate-300">Issued</th>
                          <th className="px-4 py-3 font-semibold text-gray-600 dark:text-slate-300">Status</th>
                          <th className="px-4 py-3 font-semibold text-gray-600 dark:text-slate-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {certificates.map((cert) => (
                          <tr
                            key={cert.id}
                            className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-slate-700/50 dark:hover:bg-slate-700/30"
                          >
                            <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900 dark:text-slate-100">
                              {cert.certificate_id}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">
                              {cert.intern_name}
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                              {cert.intern_role}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">
                              {formatDate(cert.start_date)} — {formatDate(cert.end_date)}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">
                              {formatDateTime(cert.issued_at)}
                            </td>
                            <td className="px-4 py-3">
                              {cert.is_revoked ? (
                                <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                  Revoked
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand dark:bg-brand-soft dark:text-brand">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {/* View QR */}
                                <button
                                  onClick={() => setQrModalCertId(cert.certificate_id)}
                                  className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                                  title="View QR Code"
                                >
                                  QR
                                </button>

                                {/* Revoke */}
                                {!cert.is_revoked && (
                                  <button
                                    onClick={() => handleRevoke(cert.certificate_id)}
                                    disabled={revokingId === cert.certificate_id}
                                    className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                                    title="Revoke certificate"
                                  >
                                    {revokingId === cert.certificate_id ? '...' : 'Revoke'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-slate-700">
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {qrModalCertId && (
        <CertificateQRModal
          certificateId={qrModalCertId}
          onClose={() => setQrModalCertId(null)}
        />
      )}
    </>
  );
};

export default AdminCertificates;

