// Publisher applications (services/api/modules/algos/publisherApplications.*).
import authService from '../../../services/authService';
import { BACKEND_URL } from '../../../config/env';

export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

/** Everything the applicant submitted (as stored), plus where it stands. */
export interface PublisherApplication {
  id: string;
  applicant_name: string;
  applicant_email: string;
  algo_name: string;
  strategy_type: string;
  asset_class: string;
  expected_price: number;
  backtest_summary: string;
  description: string;
  experience: string;
  status: ApplicationStatus;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** The form's option values -> the labels the applicant picked. */
export const STRATEGY_LABELS: Record<string, string> = {
  trend: 'Trend Following', 'mean-reversion': 'Mean Reversion', breakout: 'Breakout', scalping: 'Scalping',
  momentum: 'Momentum', options: 'Options Strategy', other: 'Other',
};
export const ASSET_LABELS: Record<string, string> = {
  stocks: 'Stocks', forex: 'Forex', crypto: 'Cryptocurrency', commodities: 'Commodities', mixed: 'Mixed',
};
export const EXPERIENCE_LABELS: Record<string, string> = {
  '1-2': '1-2 years', '3-5': '3-5 years', '5-10': '5-10 years', '10+': '10+ years',
};

async function call<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await authService.makeAuthenticatedRequest(`${BACKEND_URL}/api/algos/publisher-applications${path}`, options);
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const details = Array.isArray(body?.details) ? ` ${body.details.join(' ')}` : '';
    throw new Error(`${body?.error || 'Request failed'}${details}`.trim());
  }
  return body as T;
}

/** An approved algorithm as AlgoMarket shows it (public fields only). */
export type MarketAlgo = Pick<
  PublisherApplication,
  'id' | 'applicant_name' | 'algo_name' | 'strategy_type' | 'asset_class' | 'expected_price' | 'backtest_summary' | 'description' | 'experience' | 'reviewed_at'
>;

export const publisherApi = {
  /** Approved algorithms for AlgoMarket. Public: no sign-in needed. */
  listMarket: async (): Promise<MarketAlgo[]> => {
    const res = await fetch(`${BACKEND_URL}/api/algos/market`);
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(body?.error || 'Could not load AlgoMarket');
    return Array.isArray(body) ? body : [];
  },
  submit: (data: Record<string, unknown>) => call<PublisherApplication>('', { method: 'POST', body: JSON.stringify(data) }),
  /** Correct a submission — only allowed while its status is still "pending". */
  update: (id: string, data: Record<string, unknown>) => call<PublisherApplication>(`/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  listMine: () => call<PublisherApplication[]>(''),
};
