import { ThreatIndicator } from '../types';

export const demoIndicators: ThreatIndicator[] = [
  {
    id: 'IOC-2026-00891',
    ioc: 'login-update-auth.example',
    type: 'Domain',
    risk: 'Critical',
    confidence: 97,
    source: 'Email Analysis Engine',
    firstSeen: '2026-09-01T10:00:00Z',
    lastSeen: '2026-09-05T12:41:32Z',
    relatedThreats: ['THR-2026-00421'],
    status: 'Active'
  },
  {
    id: 'IOC-2026-00892',
    ioc: '198.51.100.45',
    type: 'IP',
    risk: 'High',
    confidence: 88,
    source: 'AbuseIPDB Integration',
    firstSeen: '2026-08-15T09:12:00Z',
    lastSeen: '2026-09-05T10:15:00Z',
    relatedThreats: ['THR-2026-00421', 'THR-2026-00109'],
    status: 'Active'
  },
  {
    id: 'IOC-2026-00893',
    ioc: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    type: 'Hash',
    risk: 'Critical',
    confidence: 100,
    source: 'VirusTotal Sandbox',
    firstSeen: '2026-09-05T08:14:22Z',
    lastSeen: '2026-09-05T08:14:22Z',
    relatedThreats: ['THR-2026-00421'],
    status: 'Inactive'
  },
  {
    id: 'IOC-2026-00894',
    ioc: 'secure-portal-demo.example',
    type: 'Domain',
    risk: 'High',
    confidence: 92,
    source: 'Email Analysis Engine',
    firstSeen: '2026-09-04T15:20:00Z',
    lastSeen: '2026-09-05T11:05:10Z',
    relatedThreats: ['THR-2026-00422'],
    status: 'Active'
  },
  {
    id: 'IOC-2026-00895',
    ioc: 'corp-executive-vip.example',
    type: 'Email',
    risk: 'Medium',
    confidence: 76,
    source: 'Heuristic Engine',
    firstSeen: '2026-09-03T09:12:00Z',
    lastSeen: '2026-09-05T09:40:00Z',
    relatedThreats: ['THR-2026-00423'],
    status: 'Active'
  },
  {
    id: 'IOC-2026-00896',
    ioc: 'https://login-update-auth.example/secure/v2/auth',
    type: 'URL',
    risk: 'Critical',
    confidence: 98,
    source: 'URLhaus',
    firstSeen: '2026-09-01T10:05:00Z',
    lastSeen: '2026-09-05T12:00:00Z',
    relatedThreats: ['THR-2026-00421'],
    status: 'Active'
  }
];
