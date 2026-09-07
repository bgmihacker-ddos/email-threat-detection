import { useEffect, useState } from 'react';
import { Download, Eye, FileText, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnalysisSummary, downloadReport, listAnalyses } from '../services/analysisApi';

export default function Reports() {
  const [reports, setReports] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    listAnalyses({ limit: 100 }).then((response) => setReports(response.data)).catch(() => setReports([])).finally(() => setLoading(false));
  }, []);

  const exportReport = async (id: string, format: 'json' | 'html') => {
    setExporting(`${id}-${format}`);
    try { await downloadReport(id, format); } finally { setExporting(null); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2"><Shield className="text-cyan-400" /> Forensic Reports</h1><p className="text-xs text-gray-400">Export persisted analysis evidence. Raw message content is redacted by default.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Stat label="REPORTS READY" value={reports.length} /><Stat label="FLAGGED" value={reports.filter((report) => report.verdict !== 'benign').length} /><Stat label="AVG RISK" value={reports.length ? Math.round(reports.reduce((sum, report) => sum + report.risk_score, 0) / reports.length) : 0} /></div>
      <div className="bg-[#080D14] rounded border border-[#151D28] overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 font-mono text-xs animate-pulse">LOADING REPORTS...</div> : reports.length === 0 ? <div className="p-8 text-center text-gray-500 font-mono text-xs">NO REPORTS AVAILABLE</div> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-[#0B111A] text-gray-400 border-b border-[#151D28]"><tr><th className="p-3">ANALYSIS</th><th className="p-3">SUBJECT</th><th className="p-3">VERDICT</th><th className="p-3">RISK</th><th className="p-3">DATE</th><th className="p-3 text-right">EXPORT</th></tr></thead><tbody className="divide-y divide-[#151D28]">{reports.map((report) => <tr key={report.analysis_id}><td className="p-3 font-mono text-cyan-400">{report.analysis_id.slice(0, 12)}…</td><td className="p-3 text-gray-200 max-w-[250px] truncate">{report.subject}</td><td className={`p-3 uppercase font-bold ${report.verdict === 'malicious' ? 'text-red-400' : report.verdict === 'suspicious' ? 'text-yellow-400' : 'text-green-400'}`}>{report.verdict}</td><td className="p-3 font-mono">{report.risk_score}</td><td className="p-3 text-gray-400">{new Date(report.created_at).toLocaleString()}</td><td className="p-3"><div className="flex justify-end gap-1"><Link to={`/analysis/${report.analysis_id}`} className="p-1 bg-[#151D28] text-gray-400 hover:text-white rounded" title="View"><Eye size={12} /></Link><button disabled={exporting === `${report.analysis_id}-json`} onClick={() => exportReport(report.analysis_id, 'json')} className="p-1 bg-[#151D28] text-gray-400 hover:text-white rounded" title="JSON export"><FileText size={12} /></button><button disabled={exporting === `${report.analysis_id}-html`} onClick={() => exportReport(report.analysis_id, 'html')} className="p-1 bg-[#151D28] text-gray-400 hover:text-white rounded" title="Printable HTML"><Download size={12} /></button></div></td></tr>)}</tbody></table></div>}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="bg-[#080D14] p-4 rounded border border-[#151D28]"><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{label}</p><p className="text-2xl font-bold text-white mt-2">{value}</p></div>; }
