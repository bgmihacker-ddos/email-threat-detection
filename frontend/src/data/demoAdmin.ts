import { AdminUserRecord, ThreatIntelProvider, SystemServiceHealth, AuditLogRecord } from '../types';

export const demoAdminUsers: AdminUserRecord[] = [
  {
    id: 'USR-001',
    name: 'Admin User',
    email: 'admin@demo.local',
    role: 'admin',
    status: 'Active',
    lastLogin: '2026-09-05T12:00:00Z',
    scansCount: 412,
    createdAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'USR-002',
    name: 'Security Analyst',
    email: 'analyst@demo.local',
    role: 'user',
    status: 'Active',
    lastLogin: '2026-09-05T10:30:00Z',
    scansCount: 1204,
    createdAt: '2025-06-15T09:00:00Z'
  },
  {
    id: 'USR-003',
    name: 'SOC Team Beta',
    email: 'soc-beta@demo.local',
    role: 'user',
    status: 'Suspended',
    lastLogin: '2026-08-01T14:20:00Z',
    scansCount: 840,
    createdAt: '2025-08-01T11:00:00Z'
  }
];

export const demoThreatIntelProviders: ThreatIntelProvider[] = [
  {
    id: 'PRV-VT',
    name: 'VirusTotal',
    type: 'Sandbox / Reputation',
    status: 'Offline',
    lastSync: '2026-09-05T00:00:00Z',
    recordsIndexed: 1450200,
    latencyMs: 145,
    healthScore: 99
  },
  {
    id: 'PRV-UH',
    name: 'URLhaus',
    type: 'Malicious URLs',
    status: 'Offline',
    lastSync: '2026-09-05T01:00:00Z',
    recordsIndexed: 284000,
    latencyMs: 85,
    healthScore: 100
  },
  {
    id: 'PRV-ABIP',
    name: 'AbuseIPDB',
    type: 'IP Reputation',
    status: 'Offline',
    lastSync: '2026-09-05T02:30:00Z',
    recordsIndexed: 5400000,
    latencyMs: 110,
    healthScore: 96
  }
];

export const demoSystemHealth: SystemServiceHealth[] = [
  {
    id: 'SVC-FE',
    service: 'Frontend Web Server',
    status: 'Demo Mode',
    uptimePct: 99.99,
    latencyMs: 12,
    lastChecked: new Date().toISOString(),
    errorCount24h: 0,
    description: 'React client served via Vite/Nginx'
  },
  {
    id: 'SVC-API',
    service: 'FastAPI Backend',
    status: 'Offline',
    uptimePct: 0,
    latencyMs: 0,
    lastChecked: new Date().toISOString(),
    errorCount24h: 0,
    description: 'Primary backend orchestration service'
  },
  {
    id: 'SVC-DB',
    service: 'PostgreSQL Database',
    status: 'Offline',
    uptimePct: 0,
    latencyMs: 0,
    lastChecked: new Date().toISOString(),
    errorCount24h: 0,
    description: 'Relational data store'
  },
  {
    id: 'SVC-ML',
    service: 'ML Inference Engine',
    status: 'Offline',
    uptimePct: 0,
    latencyMs: 0,
    lastChecked: new Date().toISOString(),
    errorCount24h: 0,
    description: 'TensorFlow/PyTorch threat inference pipeline'
  }
];

export const demoAuditLogs: AuditLogRecord[] = [
  {
    id: 'AUD-9993',
    timestamp: '2026-09-05T12:05:00Z',
    actor: 'admin@demo.local',
    action: 'Settings Configuration',
    resource: 'System Configuration',
    ipAddress: '10.0.1.24',
    result: 'Success',
    details: 'Updated global retention policy to 90 days'
  },
  {
    id: 'AUD-9992',
    timestamp: '2026-09-05T10:30:15Z',
    actor: 'analyst@demo.local',
    action: 'Authentication',
    resource: 'Auth Service',
    ipAddress: '10.0.1.45',
    result: 'Success'
  },
  {
    id: 'AUD-9991',
    timestamp: '2026-09-05T10:15:00Z',
    actor: 'unknown',
    action: 'Authentication',
    resource: 'Auth Service',
    ipAddress: '198.51.100.12',
    result: 'Failed',
    details: 'Invalid credentials attempted for admin@demo.local'
  },
  {
    id: 'AUD-9990',
    timestamp: '2026-09-05T09:12:00Z',
    actor: 'system',
    action: 'Threat Detection',
    resource: 'Analysis Engine',
    ipAddress: 'internal',
    result: 'Warning',
    details: 'Quarantined high-risk email from ceo-office@corp-executive-vip.example'
  }
];
