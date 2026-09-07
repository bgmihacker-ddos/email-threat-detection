import { apiFetch } from './api';
import { Threat, ThreatIndicator, ThreatMapEvent } from '../types/threats';

export const getThreats = async (): Promise<Threat[]> => {
  try {
    const response = await apiFetch('/api/threats');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching threats:', error);
    return []; // Graceful fallback or handle error
  }
};

export const getThreatById = async (id: string): Promise<Threat | undefined> => {
  // Assuming backend can handle this if needed, or filter locally if necessary
  const threats = await getThreats();
  return threats.find(t => t.id === id);
};

export const getIndicators = async (): Promise<ThreatIndicator[]> => {
  try {
    const response = await apiFetch('/api/indicators');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching indicators:', error);
    return [];
  }
};

export const getLiveThreats = async (): Promise<ThreatMapEvent[]> => {
  try {
    const response = await apiFetch('/api/live-threats');
    return (response.data || []).map((e: any) => ({
      id: e.id,
      indicator: e.indicator,
      latitude: e.latitude ?? 0,
      longitude: e.longitude ?? 0,
      country: e.country || 'Unknown',
      city: '',
      threatType: e.indicator_type === 'url' || e.indicator_type === 'domain' ? 'Phishing' : 'Malware',
      severity: e.severity === 'critical' || e.severity === 'High' ? 'High' : e.severity === 'high' ? 'High' : e.severity === 'medium' || e.severity === 'Medium' ? 'Medium' : 'Low',
      timestamp: e.timestamp || new Date().toISOString(),
      source: e.source,
      confidence: e.confidence || 0,
      geoSource: e.geo_source || undefined
    }));
  } catch (error) {
    console.error('Error fetching live threats:', error);
    return [];
  }
};
