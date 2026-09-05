import { useState, useEffect } from 'react';
import { getIndicators } from '../services/adminApi';
import { ThreatIndicator, IOCType, Severity } from '../types';
import { useToast } from '../context/ToastContext';
import { Search, Filter, Copy, ExternalLink, Eye } from 'lucide-react';

export default function Indicators() {
  const [indicators, setIndicators] = useState<ThreatIndicator[]>([]);
  const [filteredIndicators, setFilteredIndicators] = useState<ThreatIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedIndicator, setSelectedIndicator] = useState<ThreatIndicator | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    getIndicators().then((data) => {
      setIndicators(data);
      setFilteredIndicators(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = indicators;

    if (searchTerm) {
      result = result.filter(
        (i) =>
          i.ioc.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'ALL') {
      result = result.filter((i) => i.type === selectedType);
    }

    if (selectedRisk !== 'ALL') {
      result = result.filter((i) => i.risk === selectedRisk);
    }

    if (selectedStatus !== 'ALL') {
      result = result.filter((i) => i.status === selectedStatus);
    }

    setFilteredIndicators(result);
  }, [searchTerm, selectedType, selectedRisk, selectedStatus, indicators]);

  const handleCopyIOC = (ioc: string) => {
    navigator.clipboard.writeText(ioc);
    addToast('IOC copied to clipboard', 'info');
  };

  const getIOCColor = (type: IOCType) => {
    switch (type) {
      case 'IP': return 'text-red-400';
      case 'Domain': return 'text-yellow-400';
      case 'URL': return 'text-cyan-400';
      case 'Email': return 'text-purple-400';
      case 'Hash': return 'text-green-400';
      default: return 'text-gray-300';
    }
  };

  const getRiskBadge = (risk: Severity) => {
    const colors: Record<Severity, { bg: string; text: string; border: string }> = {
      Critical: { bg: 'bg-red-900/30', text: 'text-red-300', border: 'border-red-700' },
      High: { bg: 'bg-orange-900/30', text: 'text-orange-300', border: 'border-orange-700' },
      Medium: { bg: 'bg-yellow-900/30', text: 'text-yellow-300', border: 'border-yellow-700' },
      Low: { bg: 'bg-green-900/30', text: 'text-green-300', border: 'border-green-700' },
      Safe: { bg: 'bg-cyan-900/30', text: 'text-cyan-300', border: 'border-cyan-700' },
    };
    return colors[risk] || colors.Safe;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Eye className="text-cyan-400" />
            Indicators of Compromise (IOC) Registry
          </h1>
          <p className="text-xs text-gray-400">Live network, endpoint, and email‑based threat intelligence</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#080D14] p-4 rounded border border-[#151D28] grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search by IOC value, source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#05080D] border border-[#151D28] pl-9 pr-4 py-2 text-xs text-white rounded focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-500" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
            >
              <option value="ALL">All IOC Types</option>
              <option value="IP">IP Address</option>
              <option value="Domain">Domain</option>
              <option value="URL">URL</option>
              <option value="Email">Email Address</option>
              <option value="Hash">Hash</option>
            </select>
          </div>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Safe">Safe</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Indicators Table */}
      <div className="bg-[#080D14] rounded border border-[#151D28] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 font-mono text-xs animate-pulse">
            LOADING IOC REGISTRY...
          </div>
        ) : filteredIndicators.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-mono text-xs">
            NO INDICATORS MATCH THE GIVEN FILTER
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B111A] text-gray-400 border-b border-[#151D28]">
                <tr>
                  <th className="p-3 font-semibold">IOC VALUE</th>
                  <th className="p-3 font-semibold">TYPE</th>
                  <th className="p-3 font-semibold">RISK</th>
                  <th className="p-3 font-semibold">CONFIDENCE</th>
                  <th className="p-3 font-semibold">SOURCE</th>
                  <th className="p-3 font-semibold">FIRST SEEN</th>
                  <th className="p-3 font-semibold">STATUS</th>
                  <th className="p-3 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151D28]">
                {filteredIndicators.map((indicator) => {
                  const riskStyle = getRiskBadge(indicator.risk);
                  return (
                    <tr
                      key={indicator.id}
                      onClick={() => setSelectedIndicator(indicator)}
                      className="hover:bg-[#0E1520] cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-mono text-white truncate max-w-[180px]">
                        <span className={getIOCColor(indicator.type)}>{indicator.ioc}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#151D28] text-gray-300">
                          {indicator.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${riskStyle.bg} ${riskStyle.text} ${riskStyle.border}`}>
                          {indicator.risk}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-gray-300">{indicator.confidence}%</td>
                      <td className="p-3 text-gray-400 truncate max-w-[140px]">{indicator.source}</td>
                      <td className="p-3 text-gray-400 font-mono">{new Date(indicator.firstSeen).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${indicator.status === 'Active' ? 'bg-green-900/30 text-green-300' : 'bg-gray-900/30 text-gray-400'}`}>
                          {indicator.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyIOC(indicator.ioc);
                            }}
                            className="p-1 bg-[#151D28] hover:bg-[#1E2A3D] text-gray-400 hover:text-white rounded"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToast(`Enrichment lookup for ${indicator.ioc} (DEMO)`, 'info');
                            }}
                            className="p-1 bg-[#151D28] hover:bg-[#1E2A3D] text-gray-400 hover:text-cyan-400 rounded"
                          >
                            <ExternalLink size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* IOC Detail Drawer */}
      {selectedIndicator && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-end pointer-events-auto">
          <div className="bg-[#080D14] w-full max-w-md h-full border-l border-[#151D28] flex flex-col">
            <div className="p-4 border-b border-[#151D28] flex justify-between items-center">
              <h2 className="text-sm font-bold text-white uppercase">IOC Details</h2>
              <button
                onClick={() => setSelectedIndicator(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div className="space-y-2">
                <div className="text-xs text-gray-500 uppercase">IOC Value</div>
                <div className="font-mono text-sm break-all text-white bg-[#05080D] p-3 rounded border border-[#151D28]">
                  {selectedIndicator.ioc}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase">Type</div>
                  <div className="text-sm text-cyan-400 font-bold">{selectedIndicator.type}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Risk Level</div>
                  <div className="text-sm font-bold" style={{ color: getRiskBadge(selectedIndicator.risk).text }}>
                    {selectedIndicator.risk}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Confidence</div>
                  <div className="text-sm text-gray-300">{selectedIndicator.confidence}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Status</div>
                  <div className="text-sm text-gray-300">{selectedIndicator.status}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 uppercase">Source & Attribution</div>
                <div className="text-sm text-gray-300 mt-1">{selectedIndicator.source}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500 uppercase">First / Last Seen</div>
                <div className="text-sm text-gray-300 mt-1 flex gap-6">
                  <span>{new Date(selectedIndicator.firstSeen).toLocaleString()}</span>
                  <span>→</span>
                  <span>{new Date(selectedIndicator.lastSeen).toLocaleString()}</span>
                </div>
              </div>

              {selectedIndicator.relatedThreats.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 uppercase">Related Threat Campaigns</div>
                  <div className="mt-2 space-y-1">
                    {selectedIndicator.relatedThreats.map((threatId, idx) => (
                      <div key={idx} className="text-xs font-mono text-cyan-400 bg-[#05080D] px-3 py-1.5 rounded border border-[#151D28]">
                        {threatId}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#151D28] flex gap-2">
                <button
                  onClick={() => {
                    handleCopyIOC(selectedIndicator.ioc);
                  }}
                  className="flex-1 py-2 px-3 bg-cyan-900/40 hover:bg-cyan-900/70 border border-cyan-700 text-cyan-200 text-xs font-bold rounded"
                >
                  Copy IOC
                </button>
                <button
                  onClick={() => {
                    addToast(`Added ${selectedIndicator.ioc} to blocklist (DEMO)`, 'success');
                  }}
                  className="flex-1 py-2 px-3 bg-red-900/40 hover:bg-red-900/70 border border-red-700 text-red-200 text-xs font-bold rounded"
                >
                  Add to Blocklist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
