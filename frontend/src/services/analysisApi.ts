import { apiFetch } from './api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface AnalysisSummary {
  analysis_id: string;
  verdict: string;
  risk_score: number;
  severity: string;
  confidence: number;
  summary: string;
  subject: string;
  sender: string;
  recipient: string;
  created_at: string;
  status: string;
}

export interface DashboardSummary {
  metrics: {
    total_analyses: number;
    flagged_analyses: number;
    malicious_analyses: number;
    average_risk_score: number;
  };
  verdict_counts: Record<string, number>;
  severity_counts: Record<string, number>;
  activity: { date: string; analyses: number; flagged: number }[];
  distribution: { name: string; value: number; color: string }[];
  top_indicators: { indicator: string; count: number }[];
  recent_analyses: AnalysisSummary[];
  data_source: string;
}

export const analyzeEmail = async (content: string, file?: File): Promise<any> => {
  const formData = new FormData();
  if (file) formData.append('file', file);
  else formData.append('raw_content', content);

  const response = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Analysis failed');
  return response.json();
};

export const getAnalysisById = async (id: string): Promise<any> =>
  apiFetch(`/api/analyze/${encodeURIComponent(id)}`, { headers: authHeaders() });

export const getDashboardSummary = async (): Promise<DashboardSummary> =>
  apiFetch('/api/dashboard/summary', { headers: authHeaders() });

export const listAnalyses = async (params: {
  query?: string;
  verdict?: string;
  severity?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ data: AnalysisSummary[]; meta: { total: number; limit: number; offset: number } }> => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value));
  });
  return apiFetch(`/api/analyses${search.toString() ? `?${search}` : ''}`, { headers: authHeaders() });
};

export const searchPersistedIocs = async (value: string, type?: string) => {
  const search = new URLSearchParams({ value });
  if (type) search.set('type', type);
  return apiFetch(`/api/analyses/iocs/search?${search}`, { headers: authHeaders() });
};

export const getReportUrl = (id: string, format: 'json' | 'html', includeRawEmail = false) =>
  `${BASE_URL}/api/analyze/${encodeURIComponent(id)}/report.${format}${includeRawEmail ? '?include_raw_email=true' : ''}`;

export const downloadReport = async (id: string, format: 'json' | 'html') => {
  const response = await fetch(getReportUrl(id, format), { headers: authHeaders() });
  if (!response.ok) throw new Error('Report export failed');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `analysis-${id}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
