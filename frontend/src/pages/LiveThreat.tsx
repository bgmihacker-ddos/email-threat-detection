import { ThreatMap } from '../components/map/ThreatMap';
import { useState, useEffect } from 'react';
import { getLiveThreats } from '../services/threatApi';
import { ThreatMapEvent } from '../types/threats';

export default function LiveThreat() {
  const [threatEvents, setThreatEvents] = useState<ThreatMapEvent[]>([]);

  useEffect(() => {
    getLiveThreats().then(setThreatEvents);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-white">LIVE THREAT INTELLIGENCE</h1>
           <p className="text-sm text-gray-400">Global email threat activity and security telemetry</p>
        </div>
        <div className="bg-[#101722] border border-[#151D28] px-3 py-1 rounded text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
            LIVE THREAT FEED
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
         <div className="lg:col-span-3 bg-[#080D14] p-4 rounded border border-[#151D28] h-[500px]">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">MAP</h3>
            <ThreatMap threatEvents={threatEvents} />
         </div>
         <div className="bg-[#080D14] p-4 rounded border border-[#151D28] h-[500px]">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">THREAT ACTIVITY</h3>
             <div className="space-y-2 overflow-y-auto h-[430px]">
                 {threatEvents.map((event) => (
                    <div key={event.id} className="flex justify-between text-[10px] p-2 bg-[#0B111A] rounded">
                        <span className={`${event.severity === 'High' || event.severity === 'Critical' ? 'text-red-500' : 'text-cyan-500'} font-bold`}>{event.severity.toUpperCase()}</span>
                        <span className="text-gray-300 truncate max-w-[80px]">{event.threatType}</span>
                        <span className="text-gray-500">{(event.confidence)}%</span>
                    </div>
                 ))}
             </div>
         </div>
      </div>
    </div>
  );
}
