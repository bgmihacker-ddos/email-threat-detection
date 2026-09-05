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
    // Map response to match ThreatMapEvent type
    return (response.data || []).map((e: any) => ({
      id: e.id,
      latitude: e.latitude || 0, // Should handle null values
      longitude: e.longitude || 0,
      country: e.country,
      city: '',
      threatType: 'Phishing', // Need to map correctly
      severity: e.severity,
      timestamp: e.timestamp,
      source: e.source,
      confidence: e.confidence
    }));
  } catch (error) {
    console.error('Error fetching live threats:', error);
    return [];
  }
};
