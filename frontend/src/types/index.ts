export type Role = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export type ThreatType = 'Phishing' | 'BEC' | 'Malware' | 'Credential Theft' | 'Suspicious';
export type Severity = 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical';
export type ThreatStatus = 'Open' | 'In Progress' | 'Resolved' | 'Quarantined';

export interface Threat {
  id: string;
  type: ThreatType;
  severity: Severity;
  confidence: number;
  target: string;
  location: string;
  firstSeen: string;
  lastSeen: string;
  status: ThreatStatus;
  description?: string;
  sender?: string;
  indicators?: string[];
  attackStages?: { stage: string; status: 'completed' | 'active' | 'pending'; description: string }[];
}

export type IOCType = 'IP' | 'Domain' | 'URL' | 'Email' | 'Hash';

export interface ThreatIndicator {
  id: string;
  ioc: string;
  type: IOCType;
  risk: Severity;
  confidence: number;
  source: string;
  firstSeen: string;
  lastSeen: string;
  relatedThreats: string[];
  status: 'Active' | 'Inactive';
}

export interface ThreatMapEvent {
  id: string;
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  threatType: ThreatType;
  severity: Severity;
  timestamp: string;
  source: string;
  confidence: number;
}

export interface EmailScanRecord {
  id: string;
  user: string;
  sender: string;
  recipient: string;
  subject: string;
  threatScore: number;
  verdict: 'Safe' | 'Suspicious' | 'Malicious' | 'Critical';
  scannedAt: string;
  status: 'Clean' | 'Quarantined' | 'Blocked' | 'Flagged';
  processingTimeMs: number;
}

export interface SecurityReport {
  id: string;
  title: string;
  description: string;
  dateRange: string;
  category: string;
  metrics: { label: string; value: string | number; change?: string }[];
  status: 'Ready' | 'Generating';
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'Active' | 'Suspended' | 'Pending';
  lastLogin: string;
  scansCount: number;
  createdAt: string;
}

export interface ThreatIntelProvider {
  id: string;
  name: string;
  type: string;
  status: 'Connected' | 'Degraded' | 'Offline' | 'Demo Mode';
  lastSync: string;
  recordsIndexed: number;
  latencyMs: number;
  healthScore: number;
}

export interface SystemServiceHealth {
  id: string;
  service: string;
  status: 'Operational' | 'Degraded' | 'Offline' | 'Demo Mode';
  uptimePct: number;
  latencyMs: number;
  lastChecked: string;
  errorCount24h: number;
  description: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  ipAddress: string;
  result: 'Success' | 'Denied' | 'Warning' | 'Failed';
  details?: string;
}
