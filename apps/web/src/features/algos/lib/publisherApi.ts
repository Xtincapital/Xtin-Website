// Publisher applications (services/api/modules/algos/publisherApplications.*).
import authService from '../../../services/authService';
import { BACKEND_URL } from '../../../config/env';

export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export interface PublisherApplication {
  id: string;
  algo_name: string;
  strategy_type: string;
  asset_class: string;
  expected_price: number;
  status: ApplicationStatus;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

async function call<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/algos/publisher-applications${path}`, options);
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const details = Array.isArray(body?.details) ? ` ${body.details.join(' ')}` : '';
    throw new Error(`${body?.error || 'Request failed'}${details}`.trim());
  }
  return body as T;
}

export const publisherApi = {
  submit: (data: Record<string, unknown>) => call<PublisherApplication>('', { method: 'POST', body: JSON.stringify(data) }),
  listMine: () => call<PublisherApplication[]>(''),
};
