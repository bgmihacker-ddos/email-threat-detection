import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmailHistory } from '../services/adminApi';
import { EmailScanRecord } from '../types';
import { Search, Filter, Eye, Shield } from 'lucide-react';

export default function EmailHistory() {
  const [scans, setScans] = useState<EmailScanRecord[]>([]);
  const [filteredScans, setFilteredScans] = useState<EmailScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    getEmailHistory().then((data) => {
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
          s.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.recipient.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedVerdict !== 'ALL') {
      result = result.filter((s) => s.verdict === selectedVerdict);
    }

    if (selectedStatus !== 'ALL') {
      result = result.filter((s) => s.status === selectedStatus);
    }

    setFilteredScans(result);
  }, [searchTerm, selectedVerdict, selectedStatus, scans]);

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Critical': return 'text-red-400';
      case 'Malicious': return 'text-red-400';
      case 'Suspicious': return 'text-yellow-400';
      case 'Safe': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Blocked': return 'text-red-400';
      case 'Quarantined': return 'text-yellow-400';
      case 'Flagged': return 'text-orange-400';
      case 'Clean': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="text-cyan-400" />
            Email Scan History
          </h1>
          <p className="text-xs text-gray-400">Archive of all processed emails with threat verdicts and actions</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#080D14] p-4 rounded border border-[#151D28] grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search by subject, sender, recipient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#05080D] border border-[#151D28] pl-9 pr-4 py-2 text-xs text-white rounded focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-2">
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

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Blocked">Blocked</option>
            <option value="Quarantined">Quarantined</option>
            <option value="Flagged">Flagged</option>
            <option value="Clean">Clean</option>
          </select>
        </div>
      </div>

      {/* Scans Table */}
      <div className="bg-[#080D14] rounded border border-[#151D28] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 font-mono text-xs animate-pulse">
            LOADING SCAN HISTORY...
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
                  <th className="p-3 font-semibold">SUBJECT</th>
                  <th className="p-3 font-semibold">SENDER → RECIPIENT</th>
                  <th className="p-3 font-semibold">THREAT SCORE</th>
                  <th className="p-3 font-semibold">VERDICT</th>
                  <th className="p-3 font-semibold">STATUS</th>
                  <th className="p-3 font-semibold">SCANNED AT</th>
                  <th className="p-3 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151D28]">
                {filteredScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-[#0E1520] transition-colors">
                    <td className="p-3 font-mono text-cyan-400 font-bold">{scan.id}</td>
                    <td className="p-3 text-gray-200 truncate max-w-[200px]">{scan.subject}</td>
                    <td className="p-3 text-gray-400 truncate max-w-[220px]">
                      <span className="text-gray-300">{scan.sender}</span>
                      <span className="mx-2 text-gray-600">→</span>
                      <span className="text-gray-300">{scan.recipient}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[#151D28] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                            style={{ width: `${scan.threatScore}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs">{scan.threatScore}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`font-bold uppercase ${getVerdictColor(scan.verdict)}`}>
                        {scan.verdict}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-bold uppercase ${getStatusColor(scan.status)}`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400 font-mono">
                      {new Date(scan.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => navigate(`/analysis/${scan.id}`)}
                          className="p-1 bg-[#151D28] hover:bg-[#1E2A3D] text-gray-400 hover:text-white rounded"
                        >
                          <Eye size={12} />
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
