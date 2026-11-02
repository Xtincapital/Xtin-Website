import { describe, it, expect, vi, beforeEach } from 'vitest';

const supabase = vi.hoisted(() => ({
  auth: { getSession: vi.fn(), signOut: vi.fn(async () => ({})) },
}));
vi.mock('../supabase', () => ({ default: supabase }));

import authService from './authService';

const fetchMock = vi.fn();
const respond = (status: number, body: unknown = {}) => ({ status, ok: status >= 200 && status < 300, json: async () => body });
const sentHeaders = (call = 0) => (fetchMock.mock.calls[call][1] as RequestInit).headers as Record<string, string>;

const withSession = (token: string | null) => supabase.auth.getSession.mockResolvedValue({ data: { session: token ? { access_token: token } : null } });

beforeEach(() => {
  fetchMock.mockReset();
  supabase.auth.getSession.mockReset();
  supabase.auth.signOut.mockClear();
  localStorage.clear();
  vi.stubGlobal('fetch', fetchMock);
});

describe('makeOptionalAuthRequest (endpoints that also serve signed-out visitors)', () => {
  it('sends a plain request when nobody is signed in', async () => {
    withSession(null);
    fetchMock.mockResolvedValue(respond(200));
    await authService.makeOptionalAuthRequest('/api/x', { method: 'POST', body: '{}' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sentHeaders()).not.toHaveProperty('Authorization');
    expect(sentHeaders()['Content-Type']).toBe('application/json');
    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('POST');
  });

  it('sends the session token when there is one', async () => {
    withSession('tok');
    fetchMock.mockResolvedValue(respond(200));
    await authService.makeOptionalAuthRequest('/api/x');
    expect(sentHeaders().Authorization).toBe('Bearer tok');
  });

  it('falls back to the stored email-login token', async () => {
    withSession(null);
    localStorage.setItem('auth_token', 'stored');
    fetchMock.mockResolvedValue(respond(200));
    await authService.makeOptionalAuthRequest('/api/x');
    expect(sentHeaders().Authorization).toBe('Bearer stored');
  });

  it("retries anonymously if the server refuses a stale token, and doesn't end the session", async () => {
    withSession('stale');
    fetchMock.mockResolvedValueOnce(respond(401)).mockResolvedValueOnce(respond(200, { ok: true }));
    const res = await authService.makeOptionalAuthRequest('/api/x');
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sentHeaders(0).Authorization).toBe('Bearer stale');
    expect(sentHeaders(1)).not.toHaveProperty('Authorization');
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });

  it('does not retry a 401 that was already anonymous', async () => {
    withSession(null);
    fetchMock.mockResolvedValue(respond(401));
    const res = await authService.makeOptionalAuthRequest('/api/x');
    expect(res.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('lets a caller override headers', async () => {
    withSession(null);
    fetchMock.mockResolvedValue(respond(200));
    await authService.makeOptionalAuthRequest('/api/x', { headers: { 'X-Test': '1' } });
    expect(sentHeaders()['X-Test']).toBe('1');
  });
});

describe('makeAuthenticatedRequest (unchanged)', () => {
  it('still refuses to run without a session', async () => {
    withSession(null);
    await expect(authService.makeAuthenticatedRequest('/api/x')).rejects.toThrow('No authentication session found');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('still signs the user out on a 401', async () => {
    withSession('tok');
    localStorage.setItem('auth_token', 'tok');
    fetchMock.mockResolvedValue(respond(401));
    await expect(authService.makeAuthenticatedRequest('/api/x')).rejects.toThrow('Session expired');
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
