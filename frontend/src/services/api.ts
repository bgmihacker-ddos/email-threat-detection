const configuredBaseUrl = (import.meta.env.VITE_API_URL || '').trim();
const BASE_URL = (
  configuredBaseUrl && !configuredBaseUrl.includes('email-threat-detection1.vercel.app')
    ? configuredBaseUrl
    : 'https://email-threat-detection-1-w14g.onrender.com'
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
    const errorBody = await response.json().catch(() => null) as { detail?: string; message?: string } | null;
    throw new Error(errorBody?.detail || errorBody?.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}
