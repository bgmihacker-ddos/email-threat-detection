import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Shield } from 'lucide-react';
import { AnalysisSummary, listAnalyses } from '../services/analysisApi';

export default function EmailHistory() {
  const [scans, setScans] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    listAnalyses({ query: searchTerm || undefined, verdict: selectedVerdict || undefined, severity: selectedSeverity || undefined })
      .then((response) => setScans(response.data))
      .catch(() => setScans([]))
      .finally(() => setLoading(false));
  }, [searchTerm, selectedVerdict, selectedSeverity]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2"><Shield className="text-cyan-400" /> Email Scan History</h1><p className="text-xs text-gray-400">Persisted forensic analyses and threat verdicts</p></div>
      <div className="bg-[#080D14] p-4 rounded border border-[#151D28] flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]"><Search className="absolute left-3 top-2.5 text-gray-500" size={16} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search analysis ID or summary..." className="w-full bg-[#05080D] border border-[#151D28] pl-9 pr-4 py-2 text-xs text-white rounded focus:outline-none focus:border-cyan-500" /></div>
        <div className="flex items-center gap-2"><Filter size={14} className="text-gray-500" /><select value={selectedVerdict} onChange={(event) => setSelectedVerdict(event.target.value)} className="bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded"><option value="">All verdicts</option><option value="malicious">Malicious</option><option value="suspicious">Suspicious</option><option value="benign">Benign</option></select><select value={selectedSeverity} onChange={(event) => setSelectedSeverity(event.target.value)} className="bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded"><option value="">All severities</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option><option value="info">Info</option></select></div>
      </div>
      <div className="bg-[#080D14] rounded border border-[#151D28] overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 font-mono text-xs animate-pulse">LOADING SCAN HISTORY...</div> : scans.length === 0 ? <div className="p-8 text-center text-gray-500 font-mono text-xs">NO PERSISTED ANALYSES MATCH THE FILTER</div> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-[#0B111A] text-gray-400 border-b border-[#151D28]"><tr><th className="p-3">SCAN ID</th><th className="p-3">SUBJECT</th><th className="p-3">SENDER</th><th className="p-3">RISK</th><th className="p-3">VERDICT</th><th className="p-3">SEVERITY</th><th className="p-3">SCANNED AT</th><th className="p-3" /></tr></thead><tbody className="divide-y divide-[#151D28]">{scans.map((scan) => <tr key={scan.analysis_id} className="hover:bg-[#0E1520]"><td className="p-3 font-mono text-cyan-400">{scan.analysis_id.slice(0, 12)}…</td><td className="p-3 text-gray-200 max-w-[220px] truncate">{scan.subject}</td><td className="p-3 text-gray-400 max-w-[180px] truncate">{scan.sender}</td><td className="p-3 font-mono">{scan.risk_score}</td><td className={`p-3 uppercase font-bold ${scan.verdict === 'malicious' ? 'text-red-400' : scan.verdict === 'suspicious' ? 'text-yellow-400' : 'text-green-400'}`}>{scan.verdict}</td><td className="p-3 uppercase text-gray-300">{scan.severity}</td><td className="p-3 text-gray-400 font-mono">{new Date(scan.created_at).toLocaleString()}</td><td className="p-3 text-right"><button onClick={() => navigate(`/analysis/${scan.analysis_id}`)} className="p-1 bg-[#151D28] hover:bg-[#1E2A3D] text-gray-400 hover:text-white rounded"><Eye size={12} /></button></td></tr>)}</tbody></table></div>}
      </div>
    </div>
  );
}
