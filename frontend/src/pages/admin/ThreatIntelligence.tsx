import { useState, useEffect } from 'react';
import { getThreatIntelProviders } from '../../services/adminApi';
import { ThreatIntelProvider } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Wifi, WifiOff, RefreshCw, Shield, Activity } from 'lucide-react';

export default function ThreatIntelligence() {
  const [providers, setProviders] = useState<ThreatIntelProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    getThreatIntelProviders().then((data) => {
      setProviders(data);
      setLoading(false);
    });
  }, []);

  const handleSyncProvider = async (_providerId: string, providerName: string) => {
    setLoading(true);
    try {
      const data = await getThreatIntelProviders();
      setProviders(data);
      addToast(`Refreshed telemetry for ${providerName}`, 'success');
    } catch {
      addToast(`Failed to sync provider ${providerName}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Connected': return <Wifi className="text-green-400" />;
      case 'Degraded': return <Activity className="text-yellow-400" />;
      case 'Offline': return <WifiOff className="text-red-400" />;
      default: return <WifiOff className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Connected': return 'text-green-400';
      case 'Degraded': return 'text-yellow-400';
      case 'Offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-900/30 border-green-700';
    if (score >= 70) return 'bg-yellow-900/30 border-yellow-700';
    return 'bg-red-900/30 border-red-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="text-cyan-400" />
            Threat Intelligence Integration
          </h1>
          <p className="text-xs text-gray-400">Monitor and manage external threat intelligence providers and feeds</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ACTIVE PROVIDERS</p>
          <p className="text-2xl font-bold text-white mt-2">
            {providers.filter(p => p.status === 'Connected').length}
          </p>
        </div>

        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">TOTAL RECORDS</p>
          <p className="text-2xl font-bold text-cyan-400 mt-2">
            {providers.reduce((acc, p) => acc + p.recordsIndexed, 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">AVG LATENCY</p>
          <p className="text-2xl font-bold text-yellow-400 mt-2">
            {providers.length > 0 ? Math.round(providers.reduce((acc, p) => acc + p.latencyMs, 0) / providers.length) : 0}ms
          </p>
        </div>

        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">AVG HEALTH SCORE</p>
          <p className="text-2xl font-bold text-green-400 mt-2">
            {providers.length > 0 ? Math.round(providers.reduce((acc, p) => acc + p.healthScore, 0) / providers.length) : 0}%
          </p>
        </div>
      </div>

      {/* Providers Grid */}
      <div className="bg-[#080D14] rounded border border-[#151D28]">
        {loading ? (
          <div className="p-8 text-center text-gray-400 font-mono text-xs animate-pulse">
            LOADING THREAT INTELLIGENCE STATUS...
          </div>
        ) : (
          <div className="divide-y divide-[#151D28]">
            {providers.map((provider) => (
              <div key={provider.id} className="p-4 hover:bg-[#0E1520] transition-colors">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Provider Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-900/30 flex items-center justify-center">
                        {getStatusIcon(provider.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{provider.name}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#151D28] text-gray-300">
                            {provider.type}
                          </span>
                        </div>
                        <p className={`text-xs font-bold ${getStatusColor(provider.status)}`}>
                          {provider.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex flex-wrap gap-4">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase">Records</p>
                      <p className="text-sm font-mono text-white">{provider.recordsIndexed.toLocaleString()}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase">Latency</p>
                      <p className="text-sm font-mono text-yellow-400">{provider.latencyMs}ms</p>
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase">Health Score</p>
                      <div className={`px-2 py-1 rounded text-xs font-bold border ${getHealthScoreBg(provider.healthScore)} ${getHealthScoreColor(provider.healthScore)}`}>
                        {provider.healthScore}%
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase">Last Sync</p>
                      <p className="text-xs font-mono text-gray-400">
                        {new Date(provider.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSyncProvider(provider.id, provider.name)}
                      disabled={provider.status === 'Offline'}
                      className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 ${
                        provider.status === 'Offline'
                          ? 'bg-gray-900/30 text-gray-500 border-gray-700 cursor-not-allowed'
                          : 'bg-cyan-900/40 hover:bg-cyan-900/70 border border-cyan-700 text-cyan-200'
                      }`}
                    >
                      <RefreshCw size={12} />
                      Sync Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Status Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <Wifi className="text-green-400" size={14} />
            <span className="text-xs text-white">Connected</span>
            <span className="text-xs text-gray-500">– Live feed active</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="text-yellow-400" size={14} />
            <span className="text-xs text-white">Degraded</span>
            <span className="text-xs text-gray-500">– High latency or connection issues</span>
          </div>
          <div className="flex items-center gap-2">
            <WifiOff className="text-red-400" size={14} />
            <span className="text-xs text-white">Offline</span>
            <span className="text-xs text-gray-500">– Feed unreachable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
