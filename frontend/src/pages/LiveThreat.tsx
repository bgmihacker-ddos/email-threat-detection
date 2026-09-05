import { ThreatMap } from '../components/map/ThreatMap';

export default function LiveThreat() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-white">LIVE THREAT INTELLIGENCE</h1>
           <p className="text-sm text-gray-400">Global email threat activity and security telemetry</p>
        </div>
        <div className="bg-[#101722] border border-[#151D28] px-3 py-1 rounded text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
            DEMO THREAT FEED
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
         <div className="lg:col-span-3 bg-[#080D14] p-4 rounded border border-[#151D28] h-[500px]">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">MAP</h3>
            <ThreatMap />
         </div>
         <div className="bg-[#080D14] p-4 rounded border border-[#151D28] h-[500px]">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">THREAT ACTIVITY</h3>
             <div className="space-y-2">
                 {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex justify-between text-[10px] p-2 bg-[#0B111A] rounded">
                        <span className="text-red-500 font-bold">CRITICAL</span>
                        <span className="text-gray-300">Phishing</span>
                        <span className="text-gray-500">12s</span>
                    </div>
                 ))}
             </div>
         </div>
      </div>
    </div>
  );
}
