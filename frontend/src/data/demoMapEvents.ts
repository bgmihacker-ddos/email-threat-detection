import { ThreatMapEvent } from "../types/threats";

export const demoThreatEvents: ThreatMapEvent[] = [
  {
    id: 'THR-001',
    latitude: 40.7128,
    longitude: -74.006,
    country: 'USA',
    city: 'New York',
    threatType: 'Phishing',
    severity: 'High',
    timestamp: '2026-09-05T10:00:00Z',
    source: 'UI',
    confidence: 95
  },
  {
    id: 'THR-002',
    latitude: 51.5074,
    longitude: -0.1278,
    country: 'UK',
    city: 'London',
    threatType: 'Malware',
    severity: 'Critical',
    timestamp: '2026-09-05T10:05:00Z',
    source: 'Network',
    confidence: 99
  },
  {
    id: 'THR-003',
    latitude: 23.0225,
    longitude: 72.5714,
    country: 'India',
    city: 'Ahmedabad',
    threatType: 'BEC',
    severity: 'Medium',
    timestamp: '2026-09-05T10:10:00Z',
    source: 'UI',
    confidence: 85
  }
];
