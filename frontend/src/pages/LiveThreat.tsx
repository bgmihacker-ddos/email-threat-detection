import { ThreatMap } from '../components/map/ThreatMap';
import { useState, useEffect } from 'react';
import { getLiveThreats } from '../services/threatApi';
import { ThreatMapEvent } from '../types/threats';

export default function LiveThreat() {
  const [threatEvents, setThreatEvents] = useState<ThreatMapEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLiveThreats()
      .then(setThreatEvents)
      .catch((err) => {
        console.error('Failed to fetch live threats:', err);
        setError('Failed to load live threat feed. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-white">LIVE THREAT INTELLIGENCE</h1>
           <p className="text-sm text-gray-400">ThreatFox and URLhaus observed threat infrastructure telemetry</p>
        </div>
        <div className="bg-[#101722] border border-[#151D28] px-3 py-1 rounded text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
            LIVE THREAT FEED
        </div>
      </div>

      <div className="border border-yellow-800 bg-yellow-950/30 px-4 py-3 text-xs text-yellow-200 rounded">
        <strong>Infrastructure attribution notice:</strong> Pins identify observed infrastructure or reporting gateways, not a verified physical location of an attacker.
      </div>

      {error && (
        <div className="border border-red-800 bg-red-950/30 px-4 py-3 text-xs text-red-200 rounded flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              getLiveThreats()
                .then(setThreatEvents)
                .catch((err) => {
                  console.error('Failed to fetch live threats:', err);
                  setError('Failed to load live threat feed. Please try again later.');
                })
                .finally(() => setLoading(false));
            }}
            className="px-2 py-1 bg-red-900/50 hover:bg-red-900 text-red-200 hover:text-white rounded text-[11px] transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
         <div className="lg:col-span-3 bg-[#080D14] p-4 rounded border border-[#151D28] h-[670px] flex flex-col">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">GEOLOCATED OBSERVED INFRASTRUCTURE</h3>
            <div className="flex-1 w-full relative">
               {loading ? <div className="h-full w-full flex items-center justify-center text-xs font-mono text-gray-400 animate-pulse bg-[#060A10] rounded border border-[#151D28]">LOADING LIVE THREAT FEED...</div> : <ThreatMap threatEvents={threatEvents} />}
            </div>
         </div>
         <div className="bg-[#080D14] p-4 rounded border border-[#151D28] h-[670px] flex flex-col">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">OBSERVED EVENTS ({threatEvents.length})</h3>
             <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                 {!loading && !threatEvents.length && <p className="text-xs text-gray-500 font-mono">NO LIVE THREAT EVENTS AVAILABLE.</p>}
                 {threatEvents.map((event) => (
                    <div key={event.id} className="text-[10px] p-2 bg-[#0B111A] rounded space-y-1 border border-[#151D28]/50 hover:border-cyan-500/30 transition-colors">
                        <div className="flex justify-between gap-2"><span className={`${event.severity === 'High' || event.severity === 'Critical' ? 'text-red-500' : event.severity === 'Medium' ? 'text-orange-400' : 'text-blue-400'} font-bold`}>{event.severity.toUpperCase()}</span><span className="text-gray-500">{event.confidence}%</span></div>
                        <div className="text-gray-300 truncate">{event.threatType} · {event.country}</div>
                        <div className="text-gray-500 truncate">{event.source}{event.geoSource ? ` · ${event.geoSource}` : ''}</div>
                    </div>
                 ))}
             </div>
         </div>
      </div>
    </div>
  );
}
