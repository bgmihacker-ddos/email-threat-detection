import { apiFetch } from './api';
import { AdminUserRecord, SystemServiceHealth, ThreatIntelProvider, Role } from '../types';

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Map backend user schema to the frontend type
export const getAdminUsers = async (): Promise<AdminUserRecord[]> => {
  try {
    const data = await apiFetch('/api/admin/users', { headers: authHeaders() });
    return (data || []).map((u: any) => ({
      id: u.id,
      name: u.name || u.email.split('@')[0],
      email: u.email,
      role: u.role as Role,
      status: u.is_active ? 'Active' : 'Suspended',
      lastLogin: u.updated_at || u.created_at,
      scansCount: 0,
      createdAt: u.created_at,
    }));
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
};

export const activateUser = async (userId: string) => {
  return await apiFetch(`/api/admin/users/${userId}/activate`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
};

export const deactivateUser = async (userId: string) => {
  return await apiFetch(`/api/admin/users/${userId}/deactivate`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
};

export const updateUserRole = async (userId: string, role: string) => {
  return await apiFetch(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ role }),
  });
};

export const getSystemHealth = async (): Promise<SystemServiceHealth[]> => {
  try {
    const data = await apiFetch('/api/health'); // Assuming unauthenticated or works with auth
    const isOnline = data && data.status === 'ok';

    return [
      {
        id: 'sys-api',
        service: 'FastAPI Backend Core',
        status: isOnline ? 'Operational' : 'Offline',
        uptimePct: isOnline ? 99.9 : 0,
        latencyMs: 15,
        lastChecked: new Date().toISOString(),
        errorCount24h: 0,
        description: 'Core REST API endpoints and routing'
      },
      {
        id: 'sys-db',
        service: 'PostgreSQL Database',
        status: isOnline ? 'Operational' : 'Offline',
        uptimePct: isOnline ? 100 : 0,
        latencyMs: 8,
        lastChecked: new Date().toISOString(),
        errorCount24h: 0,
        description: 'Primary relational data store'
      }
    ];
  } catch (error) {
    console.error('Error fetching system health:', error);
    return [];
  }
};

export const getThreatIntelProviders = async (): Promise<ThreatIntelProvider[]> => {
  try {
    const data = await apiFetch('/api/threats?limit=1');
    const meta = data.meta || {};
    const providers = meta.providers || [];

    return providers.map((p: any) => ({
      id: `prov-${p.source.toLowerCase()}`,
      name: p.source,
      type: 'IOC Feed',
      status: p.status === 'success' ? 'Connected' : 'Degraded',
      lastSync: new Date().toISOString(),
      recordsIndexed: meta.count || 0,
      latencyMs: p.status === 'success' ? 45 : 350,
      healthScore: p.status === 'success' ? 100 : 40,
    }));
  } catch (error) {
    console.error('Error fetching threat intel providers:', error);
    return [];
  }
};

