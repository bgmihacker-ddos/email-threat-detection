import { useState, useEffect } from 'react';
import { getAdminScans } from '../../services/adminApi';
import { EmailScanRecord } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Search, Filter, Eye, Download, BarChart } from 'lucide-react';

export default function Scans() {
  const [scans, setScans] = useState<EmailScanRecord[]>([]);
  const [filteredScans, setFilteredScans] = useState<EmailScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState<string>('ALL');
  const { addToast } = useToast();

  useEffect(() => {
    getAdminScans().then((data) => {
      setScans(data);
      setFilteredScans(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = scans;

    if (searchTerm) {
      result = result.filter(
        (s) =>
          s.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.sender.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedVerdict !== 'ALL') {
      result = result.filter((s) => s.verdict === selectedVerdict);
    }

    setFilteredScans(result);
  }, [searchTerm, selectedVerdict, scans]);

  const handleViewDetails = (scanId: string) => {
    addToast(`Opening scan details for ID: ${scanId} (DEMO)`, 'info');
  };

  const handleExportScan = (scanId: string) => {
    addToast(`Exporting scan report for ID: ${scanId} (DEMO)`, 'success');
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Critical': return 'bg-red-900/30 text-red-300 border-red-700';
      case 'Malicious': return 'bg-red-900/20 text-red-400 border-red-800';
      case 'Suspicious': return 'bg-yellow-900/30 text-yellow-300 border-yellow-700';
      case 'Safe': return 'bg-green-900/30 text-green-300 border-green-700';
      default: return 'bg-[#151D28] text-gray-400 border-[#1E2A3D]';
    }
  };

  const getProcessingColor = (timeMs: number) => {
    if (timeMs < 200) return 'text-green-400';
    if (timeMs < 500) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart className="text-cyan-400" />
            Scan Monitoring & Analytics
          </h1>
          <p className="text-xs text-gray-400">Monitor all email scans in real‑time, filter by severity and verdict</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">TOTAL SCANS</p>
          <p className="text-2xl font-bold text-white mt-2">{scans.length}</p>
        </div>

        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">CRITICAL THREATS</p>
          <p className="text-2xl font-bold text-red-400 mt-2">
            {scans.filter(s => s.verdict === 'Critical').length}
          </p>
        </div>

        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">AVG PROCESSING TIME</p>
          <p className="text-2xl font-bold text-cyan-400 mt-2">
            {scans.length > 0 ? Math.round(scans.reduce((acc, s) => acc + s.processingTimeMs, 0) / scans.length) : 0}ms
          </p>
        </div>

        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">BLOCKED EMAILS</p>
          <p className="text-2xl font-bold text-yellow-400 mt-2">
            {scans.filter(s => s.status === 'Blocked').length}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#080D14] p-4 rounded border border-[#151D28] flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search by subject, user, sender..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#05080D] border border-[#151D28] pl-9 pr-4 py-2 text-xs text-white rounded focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <Filter size={14} className="text-gray-500" />

          <select
            value={selectedVerdict}
            onChange={(e) => setSelectedVerdict(e.target.value)}
            className="bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
          >
            <option value="ALL">All Verdicts</option>
            <option value="Critical">Critical</option>
            <option value="Malicious">Malicious</option>
            <option value="Suspicious">Suspicious</option>
            <option value="Safe">Safe</option>
          </select>
        </div>
      </div>

      {/* Scans Table */}
      <div className="bg-[#080D14] rounded border border-[#151D28] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 font-mono text-xs animate-pulse">
            LOADING SCAN MONITOR...
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-mono text-xs">
            NO SCANS MATCH THE GIVEN FILTER
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B111A] text-gray-400 border-b border-[#151D28]">
                <tr>
                  <th className="p-3 font-semibold">SCAN ID</th>
                  <th className="p-3 font-semibold">USER</th>
                  <th className="p-3 font-semibold">SENDER → RECIPIENT</th>
                  <th className="p-3 font-semibold">SUBJECT</th>
                  <th className="p-3 font-semibold">THREAT SCORE</th>
                  <th className="p-3 font-semibold">VERDICT</th>
                  <th className="p-3 font-semibold">PROCESSING</th>
                  <th className="p-3 font-semibold">SCANNED AT</th>
                  <th className="p-3 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151D28]">
                {filteredScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-[#0E1520] transition-colors">
                    <td className="p-3 font-mono text-cyan-400 font-bold">{scan.id}</td>
                    <td className="p-3 text-gray-200">{scan.user}</td>
                    <td className="p-3 text-gray-400 truncate max-w-[180px]">
                      <div className="text-[11px] font-mono">
                        <span className="text-gray-300">{scan.sender}</span>
                        <span className="mx-1 text-gray-600">→</span>
                        <span className="text-gray-300">{scan.recipient}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-200 truncate max-w-[160px]">{scan.subject}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-[#151D28] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                            style={{ width: `${scan.threatScore}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs">{scan.threatScore}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getVerdictColor(scan.verdict)}`}>
                        {scan.verdict}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-mono ${getProcessingColor(scan.processingTimeMs)}`}>
                        {scan.processingTimeMs}ms
                      </span>
                    </td>
                    <td className="p-3 text-gray-400 font-mono">
                      {new Date(scan.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => handleViewDetails(scan.id)}
                          className="p-1 bg-[#151D28] hover:bg-[#1E2A3D] text-gray-400 hover:text-white rounded"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => handleExportScan(scan.id)}
                          className="p-1 bg-[#151D28] hover:bg-[#1E2A3D] text-gray-400 hover:text-white rounded"
                        >
                          <Download size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
