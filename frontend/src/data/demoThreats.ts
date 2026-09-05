import { Threat } from '../types/threats';

export const demoThreats: Threat[] = [
  {
    id: 'THR-2026-00421',
    type: 'Credential Theft',
    severity: 'Critical',
    confidence: 97,
    target: 'analyst@company.local',
    location: 'USA',
    firstSeen: '2026-09-01T10:00:00Z',
    lastSeen: '2026-09-01T10:05:00Z',
    status: 'Open',
  },
  {
    id: 'THR-2026-00422',
    type: 'Phishing',
    severity: 'High',
    confidence: 92,
    target: 'admin@company.local',
    location: 'Germany',
    firstSeen: '2026-09-02T11:00:00Z',
    lastSeen: '2026-09-02T11:05:00Z',
    status: 'In Progress',
  },
];
