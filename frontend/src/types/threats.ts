export type ThreatType = 'Phishing' | 'BEC' | 'Malware' | 'Credential Theft' | 'Suspicious';
export type Severity = 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical';
export type Status = 'Open' | 'In Progress' | 'Resolved' | 'Quarantined';

export interface Threat {
  id: string;
  type: ThreatType;
  severity: Severity;
  confidence: number;
  target: string;
  location: string;
  firstSeen: string;
  lastSeen: string;
  status: Status;
}

export interface ThreatIndicator {
  id: string;
  ioc: string;
  type: 'IP' | 'Domain' | 'URL' | 'Email' | 'Hash';
  risk: Severity;
  firstSeen: string;
  lastSeen: string;
  relatedThreats: string[];
  status: 'Active' | 'Inactive';
}

export interface ThreatMapEvent {
  id: string;
  indicator?: string;
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  threatType: ThreatType;
  severity: Severity;
  timestamp: string;
  source: string;
  confidence: number;
  geoSource?: string;
}
