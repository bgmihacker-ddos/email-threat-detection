import { useState, useEffect } from 'react';
import { getSystemHealth } from '../../services/adminApi';
import { SystemServiceHealth } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Activity, Server, Database, Cpu, Shield, AlertTriangle } from 'lucide-react';

export default function SystemHealth() {
  const [services, setServices] = useState<SystemServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    getSystemHealth().then((data) => {
      setServices(data);
      setLoading(false);
    });
  }, []);

  const handleRestartService = async (serviceName: string) => {
    setLoading(true);
    try {
        const data = await getSystemHealth();
        setServices(data);
        addToast(`${serviceName} verification completed`, 'success');
    } catch {
        addToast(`Failed to verify ${serviceName}`, 'error');
    } finally {
        setLoading(false);
    }
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Operational': return 'bg-green-900/30 text-green-300 border-green-700';
      case 'Degraded': return 'bg-yellow-900/30 text-yellow-300 border-yellow-700';
      case 'Offline': return 'bg-red-900/30 text-red-300 border-red-700';
      default: return 'bg-[#1b3037] text-gray-400 border-[#1E2A3D]';
    }
  };

  const getIcon = (serviceName: string) => {
    if (serviceName.includes('API') || serviceName.includes('Server')) return <Server className="text-cyan-400" />;
    if (serviceName.includes('Database')) return <Database className="text-green-400" />;
    if (serviceName.includes('ML')) return <Cpu className="text-purple-400" />;
    if (serviceName.includes('Auth')) return <Shield className="text-yellow-400" />;
    return <Activity className="text-gray-400" />;
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return 'text-green-400';
    if (uptime >= 99.0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getErrorColor = (errors: number) => {
    if (errors === 0) return 'text-green-400';
    if (errors <= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="text-cyan-400" />
            System Health & Monitoring
          </h1>
          <p className="text-xs text-gray-400">Real‑time monitoring of platform services, uptime, and error rates</p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#101b21] p-4 rounded border border-[#1b3037]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">OPERATIONAL SERVICES</p>
          <p className="text-2xl font-bold text-green-400 mt-2">
            {services.filter(s => s.status === 'Operational').length}
          </p>
        </div>

        <div className="bg-[#101b21] p-4 rounded border border-[#1b3037]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">AVG UPTIME</p>
          <p className="text-2xl font-bold text-cyan-400 mt-2">
            {services.length > 0 ? (services.reduce((acc, s) => acc + s.uptimePct, 0) / services.length).toFixed(2) : 0}%
          </p>
        </div>

        <div className="bg-[#101b21] p-4 rounded border border-[#1b3037]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">TOTAL ERRORS (24H)</p>
          <p className="text-2xl font-bold text-red-400 mt-2">
            {services.reduce((acc, s) => acc + s.errorCount24h, 0)}
          </p>
        </div>

        <div className="bg-[#101b21] p-4 rounded border border-[#1b3037]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">DEGRADED SERVICES</p>
          <p className="text-2xl font-bold text-yellow-400 mt-2">
            {services.filter(s => s.status === 'Degraded').length}
          </p>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-[#101b21] rounded border border-[#1b3037] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 font-mono text-xs animate-pulse">
            LOADING SYSTEM HEALTH STATUS...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#16242a] text-gray-400 border-b border-[#1b3037]">
                <tr>
                  <th className="p-3 font-semibold">SERVICE</th>
                  <th className="p-3 font-semibold">STATUS</th>
                  <th className="p-3 font-semibold">UPTIME %</th>
                  <th className="p-3 font-semibold">LATENCY</th>
                  <th className="p-3 font-semibold">ERRORS (24H)</th>
                  <th className="p-3 font-semibold">LAST CHECKED</th>
                  <th className="p-3 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b3037]">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-[#1b2b31] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-900/30 flex items-center justify-center">
                          {getIcon(service.service)}
                        </div>
                        <div>
                          <p className="font-bold text-white">{service.service}</p>
                          <p className="text-gray-400 text-[11px]">{service.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(service.status)}`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[#1b3037] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                            style={{ width: `${service.uptimePct}%` }}
                          />
                        </div>
                        <span className={`font-mono ${getUptimeColor(service.uptimePct)}`}>
                          {service.uptimePct.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`font-mono ${service.latencyMs < 100 ? 'text-green-400' : service.latencyMs < 300 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {service.latencyMs}ms
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono ${getErrorColor(service.errorCount24h)}`}>
                          {service.errorCount24h}
                        </span>
                        {service.errorCount24h > 0 && (
                          <AlertTriangle className="text-yellow-400" size={12} />
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-gray-400 font-mono">
                      {new Date(service.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-end">
                        {service.status !== 'Operational' && (
                          <button
                            onClick={() => handleRestartService(service.service)}
                            className="px-2 py-1 bg-yellow-900/40 hover:bg-yellow-900/70 border border-yellow-700 text-yellow-200 text-xs font-bold rounded"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Health Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#101b21] p-4 rounded border border-[#1b3037]">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Latency Guidelines</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-green-400">Optimal</span>
              <span className="text-gray-400">&lt; 100ms</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-yellow-400">Acceptable</span>
              <span className="text-gray-400">100‑300ms</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-red-400">Degraded</span>
              <span className="text-gray-400">&gt; 300ms</span>
            </div>
          </div>
        </div>

        <div className="bg-[#101b21] p-4 rounded border border-[#1b3037]">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Uptime SLA</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-green-400">Gold (≥99.9%)</span>
              <span className="text-gray-400">&lt; 8.8h/year</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-yellow-400">Silver (99.0‑99.9%)</span>
              <span className="text-gray-400">&lt; 3.7d/year</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-red-400">Below SLA (&lt;99.0%)</span>
              <span className="text-gray-400">&gt; 3.7d/year</span>
            </div>
          </div>
        </div>

        <div className="bg-[#101b21] p-4 rounded border border-[#1b3037]">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Error Thresholds</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-green-400">Normal</span>
              <span className="text-gray-400">0 errors</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-yellow-400">Warning</span>
              <span className="text-gray-400">1‑5 errors</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-red-400">Critical</span>
              <span className="text-gray-400">&gt; 5 errors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
