import { z } from 'zod';

/**
 * Validate the generation of a new certificate (admin-only)
 */
export const validateGenerateCertificate = (data) => {
  const schema = z.object({
    intern_name: z
      .string()
      .trim()
      .min(1, 'Intern name is required')
      .max(255, 'Intern name must be under 255 characters'),
    intern_role: z
      .string()
      .trim()
      .min(1, 'Intern role is required')
      .max(255, 'Intern role must be under 255 characters'),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
    metadata: z
      .object({})
      .passthrough()
      .optional()
      .default({}),
  }).refine(
    (data) => new Date(data.end_date) >= new Date(data.start_date),
    {
      message: 'End date must be on or after start date',
      path: ['end_date'],
    }
  );

  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      errors: result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
      message: 'Validation failed',
    };
  }

  return { data: result.data };
};

/**
 * Validate certificate ID parameter
 */
export const validateCertificateId = (certificateId) => {
  const schema = z
    .string()
    .regex(/^XC-\d{4}-[A-Z0-9]{5}$/, 'Invalid certificate ID format (e.g., XC-2026-A8F9K)');

  const result = schema.safeParse(certificateId);

  if (!result.success) {
    return {
      errors: result.error.errors.map((e) => ({
        field: 'certificate_id',
        message: e.message,
      })),
      message: 'Invalid certificate ID',
    };
  }

  return { data: result.data };
};

