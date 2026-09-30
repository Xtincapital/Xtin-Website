// Who sees the admin pages. Mirrors the backend's requireAdmin
// (services/api/middlewares/auth.ts) — the backend is what actually enforces
// it; this only decides whether to show the page. VITE_ADMIN_EMAIL may be a
// comma-separated list.
const ADMIN_EMAILS = ['xtincapital@gmail.com', ...(import.meta.env.VITE_ADMIN_EMAIL || '').split(',')]
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email?: string | null) => !!email && ADMIN_EMAILS.includes(email.toLowerCase());
