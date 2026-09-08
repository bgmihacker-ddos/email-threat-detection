import { ThreatMap } from '../components/map/ThreatMap';
import { useState, useEffect } from 'react';
import { getLiveThreats } from '../services/threatApi';
import { ThreatMapEvent } from '../types/threats';
import { Activity, AlertTriangle, Globe2, Radio, RefreshCw, ShieldAlert, Terminal } from 'lucide-react';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { SecurityEnvironmentBackground } from '../components/common/SecurityEnvironmentBackground';

export default function LiveThreat() {
  const [threatEvents, setThreatEvents] = useState<ThreatMapEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadThreats = () => {
    setLoading(true);
    setError(null);
    getLiveThreats().then(setThreatEvents).catch(() => setError('Failed to load live threat feed.')).finally(() => setLoading(false));
  };

  useEffect(() => { loadThreats(); }, []);

  const selected = threatEvents.find(event => event.id === selectedId);
  const highCount = threatEvents.filter(event => event.severity === 'High' || event.severity === 'Critical').length;
  const sourceCount = new Set(threatEvents.map(event => event.source).filter(Boolean)).size;

  return (
    <div className="mx-auto max-w-[1680px] space-y-6 font-sans">
      <SecurityEnvironmentBackground profile="live_threat" intensity="moderate" />

      <header className="relative z-10 flex flex-col gap-4 border-b border-[#151D28] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
           <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-cyan-400">TELEMETRY & GEOSPATIAL CENTER</p>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white">Live Threat Intelligence Feed</h1>
          <p className="mt-1 text-xs text-gray-400 font-mono">Real-time geospatial infrastructure attribution and threat campaign telemetry.</p>
        </div>
        <div className="flex items-center gap-2 rounded border border-red-500/20 bg-red-950/20 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-red-300 font-mono">
          <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" /> Live Telemetry Active
        </div>
      </header>

      <div className="relative z-10 flex items-start gap-3 rounded-lg border border-yellow-800/40 bg-yellow-950/10 px-4 py-3 text-xs leading-relaxed text-yellow-200 font-mono">
        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-yellow-400" />
        <p><strong>Infrastructure attribution notice:</strong> Map pins visualize observed infrastructure or reporting gateways. Location points reflect reported telemetry metadata, not inherently verified attacker locations.</p>
      </div>

      {error && (
        <div className="relative z-10 flex items-center justify-between rounded-lg border border-red-800/60 bg-red-950/30 px-4 py-3 text-xs text-red-200 font-mono">
          <span>{error}</span>
          <button onClick={loadThreats} className="inline-flex items-center gap-1.5 rounded border border-red-700/50 px-2 py-1 hover:bg-red-900/40 transition-colors">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <HudMetric label="Observed Events" value={loading ? '—' : threatEvents.length} icon={Radio} />
        <HudMetric label="Elevated Severity" value={loading ? '—' : highCount} icon={ShieldAlert} tone="text-red-400" />
        <HudMetric label="Intelligence Sources" value={loading ? '—' : sourceCount} icon={Globe2} tone="text-violet-300" />
        <HudMetric label="Feed Status" value={loading ? 'Loading' : error ? 'Degraded' : 'Operational'} icon={Activity} tone={error ? 'text-yellow-400' : 'text-emerald-400'} />
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Map Section */}
        <section className="flex flex-col rounded-lg border border-[#151D28] bg-[#080D14]/90 p-5 shadow-lg min-h-[650px]">
           <div className="mb-4 flex items-center justify-between">
             <div className='flex items-center gap-2'>
                <Terminal size={15} className='text-cyan-400'/>
                <div>
                   <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-600 font-mono">Geospatial Intelligence</p>
                   <h2 className="mt-1 text-sm font-semibold text-gray-200">Observed infrastructure surface area</h2>
                </div>
             </div>
             <div className="hidden items-center gap-4 text-[10px] text-gray-500 sm:flex font-mono">
               <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-red-400" /> High</span>
               <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-yellow-400" /> Medium</span>
               <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-cyan-400" /> Low</span>
             </div>
           </div>
           <div className="flex-1 overflow-hidden rounded-lg border border-[#151D28] bg-[#05080D]">
             {loading ? (
                <div className="flex h-full items-center justify-center font-mono text-xs text-cyan-400 animate-pulse">
                  CALIBRATING GEOSPATIAL TELEMETRY...
                </div>
             ) : (
                <ThreatMap threatEvents={threatEvents} />
             )}
           </div>
        </section>

        {/* Aside Feed */}
        <aside className="flex flex-col rounded-lg border border-[#151D28] bg-[#080D14]/90 p-5 shadow-lg min-h-[650px]">
          <div className="flex items-start justify-between border-b border-[#151D28] pb-4">
            <div>
               <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-600 font-mono">Live Ingestion</p>
               <h2 className="mt-1 text-sm font-semibold text-gray-200">Event Feed <span className="font-mono text-gray-500 font-normal">({threatEvents.length})</span></h2>
            </div>
            <button
               onClick={loadThreats}
               title="Refresh feed"
               className="rounded p-1.5 text-gray-500 transition-colors hover:bg-[#151D28] hover:text-cyan-300"
            >
               <RefreshCw size={14} />
            </button>
          </div>

          <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
             {!loading && !threatEvents.length && (
                <p className="rounded border border-dashed border-[#263449] p-4 text-center font-mono text-xs text-gray-600">No live threat events available.</p>
             )}
             {threatEvents.map(event => (
               <button
                 key={event.id}
                 onClick={() => setSelectedId(event.id)}
                 className={`w-full rounded border p-3 text-left transition-all hover:border-[#263449] ${selectedId === event.id ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-[#151D28] bg-[#060A10]'}`}
               >
                 <div className="flex items-center justify-between gap-2 mb-2">
                    <SeverityBadge severity={event.severity} />
                    <span className="font-mono text-[9px] text-gray-500">{event.confidence}% Conf.</span>
                 </div>
                 <p className="text-xs font-semibold text-gray-200 truncate font-mono">{event.threatType}</p>
                 <p className="text-[10px] text-gray-500 mt-0.5 font-mono">{event.country} · {event.source}</p>
               </button>
             ))}
          </div>

          {selected && (
            <div className="mt-4 rounded-lg border border-cyan-500/20 bg-[#05080D]/95 p-4 font-mono text-[11px] text-gray-300 space-y-2">
              <div className="flex items-center justify-between border-b border-[#151D28] pb-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">Selected Event Telemetry</p>
                <span className="text-[9px] text-gray-500">{selected.source}</span>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Indicator</p>
                <p className="break-all text-cyan-300 font-semibold mt-0.5">{selected.indicator || selected.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] text-gray-500 uppercase">Threat Type</p>
                  <p className="text-gray-200 mt-0.5">{selected.threat_type || selected.threatType}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase">Malware / Payload</p>
                  <p className="text-gray-200 mt-0.5">{selected.malware || 'None reported'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] text-gray-500 uppercase">Location</p>
                  <p className="text-gray-200 mt-0.5">{selected.city !== 'Not reported' && selected.city ? `${selected.city}, ${selected.country}` : selected.country}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase">Status</p>
                  <p className="text-gray-200 mt-0.5 uppercase font-semibold">{selected.status || 'Unknown'}</p>
                </div>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">First Seen / Timestamp</p>
                <p className="text-gray-300 mt-0.5">{formatDate(selected.first_seen || selected.timestamp)}</p>
              </div>
              {selected.reporter && (
                <div>
                  <p className="text-[9px] text-gray-500 uppercase">Reporter</p>
                  <p className="text-gray-300 mt-0.5">{selected.reporter}</p>
                </div>
              )}
              {selected.reference_url && (
                <div>
                  <p className="text-[9px] text-gray-500 uppercase">Reference</p>
                  <a href={selected.reference_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline truncate block mt-0.5">
                    {selected.reference_url}
                  </a>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function HudMetric({ label, value, icon: Icon, tone = 'text-cyan-400' }: { label: string; value: string | number; icon: typeof Activity; tone?: string }) {
  return (
    <div className="rounded-lg border border-[#151D28] bg-[#080D14]/90 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-600 font-mono">{label}</p>
        <Icon size={14} className={tone} />
      </div>
      <p className={`mt-2 font-mono text-xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}