const configuredBaseUrl = (import.meta.env.VITE_API_URL || '').trim();
export const BASE_URL = (
  import.meta.env.DEV && configuredBaseUrl.includes('email-threat-detection-1-w14g.onrender.com')
    ? ''
    : configuredBaseUrl && !configuredBaseUrl.includes('email-threat-detection1.vercel.app')
      ? configuredBaseUrl
      : import.meta.env.DEV ? '' : 'https://email-threat-detection-1-w14g.onrender.com'
).replace(/\/$/, '');

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null) as { detail?: unknown; message?: string } | null;
    const detail = errorBody?.detail;
    const message = typeof detail === 'string'
      ? detail
      : detail && typeof detail === 'object' && 'error' in detail
        ? String((detail as { error?: unknown }).error)
        : errorBody?.message;
    throw new Error(message || `API Error: ${response.statusText}`);
  }

  return response.json();
}
