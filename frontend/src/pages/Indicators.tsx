import { useState, useEffect } from 'react';
import { getIndicators as getLiveIndicators } from '../services/threatApi';
import { searchPersistedIocs } from '../services/analysisApi';
import { ThreatIndicator, IOCType, Severity } from '../types';
import { ThreatIndicator as FeedThreatIndicator } from '../types/threats';
import { useToast } from '../context/ToastContext';
import { Search, Filter, Copy, Eye, Database, Radio } from 'lucide-react';
import { categorizeIoc } from '../utils/iocCategorization';

export default function Indicators() {
  const [indicators, setIndicators] = useState<ThreatIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sourceMode, setSourceMode] = useState<'live' | 'local'>('live');
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        if (sourceMode === 'live') {
          const data = await getLiveIndicators();
          if (!cancelled) setIndicators(data.map(normaliseFeedIndicator));
        } else {
          const response = await searchPersistedIocs(searchTerm || ' ', selectedType === 'ALL' ? undefined : selectedType.toLowerCase());
          if (!cancelled) setIndicators((response.data || []).map((item: any, index: number) => ({
            id: `${item.analysis_id}-${item.indicator}-${index}`,
            ioc: item.indicator,
            type: normaliseType(item.type),
            risk: normaliseSeverity(item.severity),
            confidence: item.confidence || 0,
            source: 'Persisted Local Analysis',
            firstSeen: item.created_at,
            lastSeen: item.created_at,
            relatedThreats: [item.analysis_id],
            status: 'Active',
          })));
        }
      } catch {
        if (!cancelled) setIndicators([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const timer = window.setTimeout(load, sourceMode === 'local' ? 300 : 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [sourceMode, searchTerm, selectedType]);

  const handleCopyIOC = async (ioc: string) => {
    try {
      await navigator.clipboard.writeText(ioc);
      addToast('IOC copied to clipboard', 'info');
    } catch { addToast('Clipboard access was unavailable', 'warning'); }
  };

  const filteredIndicators = indicators.filter((item) => {
    const matchesSearch = !searchTerm || item.ioc.toLowerCase().includes(searchTerm.toLowerCase()) || item.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || item.type === selectedType;
    const itemCategory = categorizeIoc({ value: item.ioc, source: item.source, type: item.type });
    const matchesCategory = selectedCategory === 'ALL' || itemCategory === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2"><Eye className="text-cyan-400" />Indicators of Compromise</h1>
        <p className="text-xs text-gray-400">Live external threat intelligence and IOCs extracted from persisted local analyses</p>
      </div>

      <div className="flex gap-2 border-b border-[#151D28]">
        <button onClick={() => setSourceMode('live')} className={`px-3 py-2 text-xs font-bold ${sourceMode === 'live' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400'}`}><Radio size={13} className="inline mr-1" />LIVE FEEDS</button>
        <button onClick={() => setSourceMode('local')} className={`px-3 py-2 text-xs font-bold ${sourceMode === 'local' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400'}`}><Database size={13} className="inline mr-1" />LOCAL ANALYSIS IOCs</button>
      </div>

      <div className="bg-[#080D14] p-4 rounded border border-[#151D28] flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]"><Search className="absolute left-3 top-2.5 text-gray-500" size={16} /><input placeholder="Search IOC value or source..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#05080D] border border-[#151D28] pl-9 pr-4 py-2 text-xs text-white rounded focus:outline-none focus:border-cyan-500" /></div>
        <div className="flex items-center gap-2"><Filter size={14} className="text-gray-500" /><select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded"><option value="ALL">All Types</option><option value="IP">IP Address</option><option value="Domain">Domain</option><option value="URL">URL</option><option value="Hash">Hash</option></select></div>
        <div className="flex items-center gap-2"><Filter size={14} className="text-gray-500" /><select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded"><option value="ALL">All Categories</option><option value="Actual IOC">Actual IOC</option><option value="Infrastructure">Infrastructure</option><option value="Forensic Artifact">Forensic Artifact</option></select></div>
      </div>

      <div className="bg-[#080D14] rounded border border-[#151D28] overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 font-mono text-xs animate-pulse">LOADING IOC DATA...</div> : !filteredIndicators.length ? <div className="p-8 text-center text-gray-500 font-mono text-xs">NO {sourceMode === 'live' ? 'LIVE INDICATORS' : 'PERSISTED IOCs'} MATCH THE CURRENT FILTER.</div> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-[#0B111A] text-gray-400 border-b border-[#151D28]"><tr><th className="p-3">IOC VALUE</th><th className="p-3">CATEGORY</th><th className="p-3">TYPE</th><th className="p-3">SEVERITY</th><th className="p-3">CONFIDENCE</th><th className="p-3">SOURCE</th><th className="p-3">OBSERVED</th><th className="p-3 text-right">ACTION</th></tr></thead><tbody className="divide-y divide-[#151D28]">{filteredIndicators.map((indicator) => {
          const category = categorizeIoc({ value: indicator.ioc, source: indicator.source, type: indicator.type });
          return (
            <tr key={indicator.id} className="hover:bg-[#0E1520]">
              <td className="p-3 font-mono text-cyan-300 break-all max-w-[360px]">{indicator.ioc}</td>
              <td className="p-3 font-bold text-[10px] uppercase">
                <span className={category === 'Actual IOC' ? 'text-red-400' : category === 'Infrastructure' ? 'text-yellow-400' : 'text-cyan-400'}>
                  {category}
                </span>
              </td>
              <td className="p-3 text-gray-300">{indicator.type}</td>
              <td className={`p-3 font-bold uppercase ${severityClass(indicator.risk)}`}>{indicator.risk}</td>
              <td className="p-3 font-mono text-gray-300">{indicator.confidence}%</td>
              <td className="p-3 text-gray-400">{indicator.source}</td>
              <td className="p-3 text-gray-400">{safeDate(indicator.firstSeen)}</td>
              <td className="p-3 text-right"><button onClick={() => handleCopyIOC(indicator.ioc)} className="p-1 bg-[#151D28] hover:bg-[#1E2A3D] text-gray-400 hover:text-white rounded" title="Copy IOC"><Copy size={12} /></button></td>
            </tr>
          );
        })}</tbody></table></div>}
      </div>
    </div>
  );
}

function normaliseFeedIndicator(item: FeedThreatIndicator): ThreatIndicator { return { ...item, confidence: 0, source: 'External threat feed' }; }
function normaliseType(value: string): IOCType { const type = String(value || '').toLowerCase(); return type === 'url' ? 'URL' : type === 'domain' ? 'Domain' : type === 'ip' ? 'IP' : type === 'email' ? 'Email' : 'Hash'; }
function normaliseSeverity(value: string): Severity { const severity = String(value || '').toLowerCase(); return severity === 'critical' ? 'Critical' : severity === 'high' ? 'High' : severity === 'medium' ? 'Medium' : severity === 'low' ? 'Low' : 'Safe'; }
function severityClass(value: Severity) { return value === 'Critical' || value === 'High' ? 'text-red-400' : value === 'Medium' ? 'text-yellow-400' : 'text-green-400'; }
function safeDate(value?: string) { return value ? new Date(value).toLocaleString() : 'Unknown'; }
