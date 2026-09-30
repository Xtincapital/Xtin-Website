// Multipart upload helper for the stateless "parse a document" endpoints
// (Journal trade import, Gini holdings import). `authService.makeAuthenticatedRequest`
// forces a JSON Content-Type, which breaks multipart bodies, so this looks up
// the same token (Supabase session first, localStorage JWT fallback) and calls
// `fetch` directly, leaving Content-Type for the browser to set.
import { BACKEND_URL } from '../config/env';
import supabase from '../supabase';

async function getAuthToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) return data.session.access_token;
  } catch {
    // fall back to the stored token
  }
  return localStorage.getItem('auth_token');
}

/** Maps a file name to the `file_type` the import endpoints expect. */
export function importFileType(file: File): 'csv' | 'excel' | 'pdf' | null {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv') return 'csv';
  if (ext === 'xlsx' || ext === 'xls') return 'excel';
  if (ext === 'pdf') return 'pdf';
  return null;
}

export async function uploadForParse<T = any>(path: string, file: File, fields: Record<string, string> = {}): Promise<T> {
  const token = await getAuthToken();
  if (!token) throw new Error('No authentication session found');

  const body = new FormData();
  body.append('file', file);
  for (const [k, v] of Object.entries(fields)) body.append(k, v);

  const res = await fetch(`${BACKEND_URL}${path}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || json?.message || 'Upload failed');
  return json as T;
}

/** Quote-safe CSV cell. */
export function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Triggers a browser download of `content`. */
export function downloadTextFile(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
