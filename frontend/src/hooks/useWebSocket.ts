import { useEffect, useState } from 'react';

type Alert = { analysis_id?: string; verdict?: string; risk_score?: number; severity?: string; summary?: string };

export function useWebSocketAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const configured = (import.meta.env.VITE_API_URL || 'https://email-threat-detection-1-w14g.onrender.com').replace(/^http/, 'ws').replace(/\/$/, '');
    const socket = new WebSocket(`${configured}/ws/alerts`);
    socket.onopen = () => setConnected(true);
    socket.onmessage = (event) => { try { setAlerts((current) => [JSON.parse(event.data), ...current].slice(0, 8)); } catch { /* Ignore malformed server frames. */ } };
    socket.onclose = () => setConnected(false);
    socket.onerror = () => setConnected(false);
    return () => socket.close();
  }, []);

  return { alerts, connected };
}
