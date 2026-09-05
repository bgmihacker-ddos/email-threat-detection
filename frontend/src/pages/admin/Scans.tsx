import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminScans } from '../../services/adminApi';
import { EmailScanRecord } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Search, Eye, Download, Mail, Shield, AlertTriangle } from 'lucide-react';

interface ScanDetailData extends EmailScanRecord {
  analysis: {
    spf: string;
    dkim: string;
    dmarc: string;
    urlAnalysis: string;
    contentAnalysis: string;
    threatIndicators: string[];
    attachments: Array<{
      name: string;
      type: string;
      size: string;
      verdict: string;
    }>;
    headers: {
      from: string;
      to: string[];
      subject: string;
      date: string;
      received: string[];
      xMailer: string;
    };
  };
  findings: Array<{
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    title: string;
    evidence: string;
    confidence: number;
  }>;
}

export default function Scans() {
  const [scans, setScans] = useState<EmailScanRecord[]>([]);
  const [filteredScans, setFilteredScans] = useState<EmailScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('ALL');
  const [selectedScan, setSelectedScan] = useState<ScanDetailData | null>(null);
  const [sortField] = useState<'subject' | 'scannedAt' | 'processingTimeMs'>('scannedAt');
  const [sortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    getAdminScans().then((data) => {
      setScans(data);
      setFilteredScans(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = [...scans];

    if (searchTerm) {
      result = result.filter(
        (s) =>
          s.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedVerdict !== 'ALL') {
      result = result.filter((s) => s.verdict === selectedVerdict);
    }

    if (selectedStatus !== 'ALL') {
      result = result.filter((s) => s.status === selectedStatus);
    }

    if (selectedSeverity !== 'ALL') {
      result = result.filter((s) => {
        if (selectedSeverity === 'CRITICAL') return s.verdict === 'Critical';
        if (selectedSeverity === 'HIGH') return s.verdict === 'Malicious';
        if (selectedSeverity === 'MEDIUM') return s.verdict === 'Suspicious';
        if (selectedSeverity === 'LOW') return s.verdict === 'Safe';
        return true;
      });
    }

    if (selectedDate !== 'ALL') {
      const now = new Date();
      const scanDate = new Date(result[0]?.scannedAt || now);
      const diffHours = (now.getTime() - scanDate.getTime()) / (1000 * 60 * 60);

      if (selectedDate === 'TODAY' && diffHours > 24) {
        result = result.filter(s => (now.getTime() - new Date(s.scannedAt).getTime()) / (1000 * 60 * 60) <= 24);
      } else if (selectedDate === 'LAST_7_DAYS' && diffHours > 168) {
        result = result.filter(s => (now.getTime() - new Date(s.scannedAt).getTime()) / (1000 * 60 * 60) <= 168);
      } else if (selectedDate === 'LAST_30_DAYS' && diffHours > 720) {
        result = result.filter(s => (now.getTime() - new Date(s.scannedAt).getTime()) / (1000 * 60 * 60) <= 720);
      }
    }

    // Sorting
    result.sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'subject') {
        return multiplier * a.subject.localeCompare(b.subject);
      } else if (sortField === 'scannedAt') {
        return multiplier * (new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime());
      } else {
        return multiplier * (a.processingTimeMs - b.processingTimeMs);
      }
    });

    setFilteredScans(result);
  }, [searchTerm, selectedVerdict, selectedStatus, selectedSeverity, selectedDate, scans, sortField, sortDirection]);

  const handleViewDetails = (scan: EmailScanRecord) => {
    // Mock detailed scan data
    const scanDetail: ScanDetailData = {
      ...scan,
      analysis: {
        spf: Math.random() > 0.5 ? 'PASS' : 'FAIL',
        dkim: Math.random() > 0.7 ? 'PASS' : 'NEUTRAL',
        dmarc: Math.random() > 0.6 ? 'PASS' : 'FAIL',
        urlAnalysis: '3 suspicious URLs found',
        contentAnalysis: 'Contains phishing keywords and urgency language',
        threatIndicators: [
          'login-microsoft-security.com (suspicious domain)',
          'IP: 192.168.45.67 (known malicious)',
          'Attachment hash: a1b2c3d4 (malware signature)'
        ],
        attachments: [
          { name: 'invoice.pdf', type: 'PDF', size: '2.4 MB', verdict: 'Suspicious' },
          { name: 'document.zip', type: 'ZIP', size: '5.1 MB', verdict: 'Malicious' }
        ],
        headers: {
          from: scan.sender,
          to: [scan.recipient],
          subject: scan.subject,
          date: new Date(scan.scannedAt).toISOString(),
          received: [
            'from mail-server.example.com (192.168.1.1)',
            'by threat-detection.local (10.0.0.1)'
          ],
          xMailer: 'Microsoft Outlook 16.0'
        }
      },
      findings: [
        { severity: 'Critical', title: 'Malicious Attachment', evidence: 'Detected malware in compressed archive', confidence: 98 },
        { severity: 'High', title: 'Phishing URL', evidence: 'Domain mimics legitimate Microsoft login', confidence: 92 },
        { severity: 'Medium', title: 'Suspicious Sender', evidence: 'Sender domain not authenticated', confidence: 75 },
        { severity: 'Low', title: 'Urgency Language', evidence: 'Contains "urgent action required"', confidence: 65 }
      ]
    };
    setSelectedScan(scanDetail);
  };

  const handleExportScan = (scanId: string) => {
    addToast(`Exporting scan report for ${scanId} (DEMO)`, 'success');
  };

  const handleViewFullAnalysis = (scanId: string) => {
    navigate(`/analysis/${scanId}`);
    addToast(`Opening full analysis for scan ${scanId}`, 'info');
  };


  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'Critical': return 'bg-red-900/30 text-red-300 border-red-700';
      case 'Malicious': return 'bg-red-900/20 text-red-400 border-red-800';
      case 'Suspicious': return 'bg-yellow-900/30 text-yellow-300 border-yellow-700';
      case 'Safe': return 'bg-green-900/30 text-green-300 border-green-700';
      default: return 'bg-[#151D28] text-gray-400 border-[#1E2A3D]';
    }
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-900/30 text-green-300 border-green-700';
      case 'Processing': return 'bg-yellow-900/30 text-yellow-300 border-yellow-700';
      case 'Failed': return 'bg-red-900/30 text-red-300 border-red-700';
      case 'Queued': return 'bg-cyan-900/30 text-cyan-300 border-cyan-700';
      default: return 'bg-gray-900/30 text-gray-400 border-gray-700';
    }
  };

  const getProcessingColor = (timeMs: number) => {
    if (timeMs < 100) return 'text-green-400';
    if (timeMs < 300) return 'text-yellow-400';
    return 'text-red-400';
  };


  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-900/40 text-red-300 border-red-700';
      case 'High': return 'bg-orange-900/40 text-orange-300 border-orange-700';
      case 'Medium': return 'bg-yellow-900/40 text-yellow-300 border-yellow-700';
      case 'Low': return 'bg-green-900/40 text-green-300 border-green-700';
      default: return 'bg-gray-900/40 text-gray-400 border-gray-700';
    }
  };

  const paginatedScans = filteredScans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredScans.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Mail className="text-cyan-400" />
            Email Scan Operations
          </h1>
          <p className="text-xs text-gray-400">Monitor all email scans, filter by severity, verdict, and status</p>
        </div>
        <div className="text-xs text-cyan-400 font-mono flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          REAL-TIME MONITORING
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">TOTAL SCANS</p>
          <p className="text-2xl font-bold text-white mt-2">{scans.length.toLocaleString()}</p>
        </div>
        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">PROCESSING</p>
          <p className="text-2xl font-bold text-yellow-400 mt-2">
            {scans.filter(s => s.status === 'Processing').length}
          </p>
        </div>
        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">COMPLETED</p>
          <p className="text-2xl font-bold text-green-400 mt-2">
            {scans.filter(s => s.status === 'Completed').length}
          </p>
        </div>
        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">THREATS DETECTED</p>
          <p className="text-2xl font-bold text-red-400 mt-2">
            {scans.filter(s => s.verdict === 'Malicious' || s.verdict === 'Critical').length}
          </p>
        </div>
        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">CRITICAL</p>
          <p className="text-2xl font-bold text-red-400 mt-2">
            {scans.filter(s => s.verdict === 'Critical').length}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#080D14] p-4 rounded border border-[#151D28] grid grid-cols-1 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search by subject, sender, recipient, user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#05080D] border border-[#151D28] pl-9 pr-4 py-2 text-xs text-white rounded focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <select
            value={selectedVerdict}
            onChange={(e) => setSelectedVerdict(e.target.value)}
            className="w-full bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
          >
            <option value="ALL">All Verdicts</option>
            <option value="Critical">Critical</option>
            <option value="Malicious">Malicious</option>
            <option value="Suspicious">Suspicious</option>
            <option value="Safe">Safe</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Processing">Processing</option>
            <option value="Failed">Failed</option>
            <option value="Queued">Queued</option>
          </select>
        </div>

        <div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
          >
            <option value="ALL">All Dates</option>
            <option value="TODAY">Today</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
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
          <div className="p-8 text-center">
            <p className="text-gray-500 text-sm mb-3">No scans match the selected filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedVerdict('ALL');
                setSelectedStatus('ALL');
                setSelectedSeverity('ALL');
                setSelectedDate('ALL');
                addToast('Filters reset', 'info');
              }}
              className="px-4 py-2 bg-cyan-900/40 hover:bg-cyan-900/70 border border-cyan-700 text-cyan-200 text-xs font-bold rounded"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B111A] text-gray-400 border-b border-[#151D28] sticky top-0">
                <tr>
                  <th className="p-3 font-semibold">SCAN ID</th>
                  <th className="p-3 font-semibold">USER</th>
                  <th className="p-3 font-semibold">SENDER → RECIPIENT</th>
                  <th className="p-3 font-semibold">SUBJECT</th>
                  <th className="p-3 font-semibold">RISK SCORE</th>
                  <th className="p-3 font-semibold">VERDICT</th>
                  <th className="p-3 font-semibold">PROCESSING</th>
                  <th className="p-3 font-semibold">STATUS</th>
                  <th className="p-3 font-semibold">TIMESTAMP</th>
                  <th className="p-3 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151D28]">
                {paginatedScans.map((scan) => (
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
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getVerdictBadge(scan.verdict)}`}>
                        {scan.verdict}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-mono ${getProcessingColor(scan.processingTimeMs)}`}>
                        {scan.processingTimeMs}ms
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(scan.status)}`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400 font-mono">
                      {new Date(scan.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => handleViewDetails(scan)}
                          className="p-1 bg-[#151D28] hover:bg-[#1E2A3D] text-gray-400 hover:text-white rounded"
                          title="View Details"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => handleExportScan(scan.id)}
                          className="p-1 bg-[#151D28] hover:bg-[#1E2A3D] text-gray-400 hover:text-white rounded"
                          title="Export Report"
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

      {/* Pagination */}
      {filteredScans.length > itemsPerPage && (
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredScans.length)} of {filteredScans.length} scans
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs bg-[#151D28] border border-[#1E2A3D] text-gray-400 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-xs text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs bg-[#151D28] border border-[#1E2A3D] text-gray-400 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Scan Detail Drawer */}
      {selectedScan && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-end pointer-events-auto">
          <div className="bg-[#080D14] w-full max-w-3xl h-full border-l border-[#151D28] flex flex-col">
            <div className="p-4 border-b border-[#151D28] flex justify-between items-center">
              <h2 className="text-sm font-bold text-white uppercase">Scan Details</h2>
              <button
                onClick={() => setSelectedScan(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-6">
              {/* Scan Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-cyan-400 font-bold">{selectedScan.id}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${getVerdictBadge(selectedScan.verdict)}`}>
                    {selectedScan.verdict}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{selectedScan.subject}</h3>
                <p className="text-sm text-gray-400">
                  From: <span className="text-white font-mono">{selectedScan.sender}</span> → To: <span className="text-white font-mono">{selectedScan.recipient}</span>
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0B111A] p-3 rounded border border-[#151D28]">
                  <p className="text-xs text-gray-500">Risk Score</p>
                  <p className="text-xl font-bold text-white">{selectedScan.threatScore}</p>
                </div>
                <div className="bg-[#0B111A] p-3 rounded border border-[#151D28]">
                  <p className="text-xs text-gray-500">Processing Time</p>
                  <p className={`text-xl font-bold ${getProcessingColor(selectedScan.processingTimeMs)}`}>
                    {selectedScan.processingTimeMs}ms
                  </p>
                </div>
                <div className="bg-[#0B111A] p-3 rounded border border-[#151D28]">
                  <p className="text-xs text-gray-500">User</p>
                  <p className="text-xl font-bold text-white">{selectedScan.user}</p>
                </div>
                <div className="bg-[#0B111A] p-3 rounded border border-[#151D28]">
                  <p className="text-xs text-gray-500">Timestamp</p>
                  <p className="text-sm font-mono text-gray-300">
                    {new Date(selectedScan.scannedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Analysis Summary */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                  <Shield size={14} />
                  Analysis Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 bg-[#0B111A] rounded border border-[#151D28] text-center">
                    <p className="text-xs text-gray-500">SPF</p>
                    <p className={`text-sm font-bold ${selectedScan.analysis.spf === 'PASS' ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedScan.analysis.spf}
                    </p>
                  </div>
                  <div className="p-3 bg-[#0B111A] rounded border border-[#151D28] text-center">
                    <p className="text-xs text-gray-500">DKIM</p>
                    <p className={`text-sm font-bold ${selectedScan.analysis.dkim === 'PASS' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {selectedScan.analysis.dkim}
                    </p>
                  </div>
                  <div className="p-3 bg-[#0B111A] rounded border border-[#151D28] text-center">
                    <p className="text-xs text-gray-500">DMARC</p>
                    <p className={`text-sm font-bold ${selectedScan.analysis.dmarc === 'PASS' ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedScan.analysis.dmarc}
                    </p>
                  </div>
                  <div className="p-3 bg-[#0B111A] rounded border border-[#151D28] text-center">
                    <p className="text-xs text-gray-500">URL Analysis</p>
                    <p className="text-sm font-bold text-yellow-400">
                      {selectedScan.analysis.urlAnalysis.split(' ')[0]}
                    </p>
                  </div>
                  <div className="p-3 bg-[#0B111A] rounded border border-[#151D28] text-center">
                    <p className="text-xs text-gray-500">Content</p>
                    <p className="text-sm font-bold text-yellow-400">
                      Suspicious
                    </p>
                  </div>
                </div>
              </div>

              {/* Threat Indicators */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Threat Indicators</h4>
                <div className="space-y-2">
                  {selectedScan.analysis.threatIndicators.map((indicator, idx) => (
                    <div key={idx} className="p-3 bg-[#0B111A] rounded border border-[#151D28]">
                      <p className="text-sm text-red-300 font-mono">{indicator}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Findings */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                  <AlertTriangle size={14} />
                  Security Findings
                </h4>
                <div className="space-y-3">
                  {selectedScan.findings.map((finding, idx) => (
                    <div key={idx} className="p-3 bg-[#0B111A] rounded border border-[#151D28]">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getSeverityBadge(finding.severity)}`}>
                            {finding.severity}
                          </span>
                          <span className="text-sm font-bold text-white">{finding.title}</span>
                        </div>
                        <span className="text-xs text-gray-400">Confidence: {finding.confidence}%</span>
                      </div>
                      <p className="text-xs text-gray-400">{finding.evidence}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Attachments</h4>
                <div className="space-y-2">
                  {selectedScan.analysis.attachments.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-[#0B111A] rounded border border-[#151D28]">
                      <div>
                        <p className="text-sm font-bold text-white">{file.name}</p>
                        <p className="text-xs text-gray-400">{file.type} • {file.size}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        file.verdict === 'Malicious' ? 'bg-red-900/40 text-red-300' :
                        file.verdict === 'Suspicious' ? 'bg-yellow-900/40 text-yellow-300' :
                        'bg-green-900/40 text-green-300'
                      }`}>
                        {file.verdict}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#151D28] flex gap-2">
                <button
                  onClick={() => handleViewFullAnalysis(selectedScan.id)}
                  className="flex-1 py-2 px-3 bg-cyan-900/40 hover:bg-cyan-900/70 border border-cyan-700 text-cyan-200 text-xs font-bold rounded"
                >
                  View Full Analysis
                </button>
                <button
                  onClick={() => handleExportScan(selectedScan.id)}
                  className="flex-1 py-2 px-3 bg-green-900/40 hover:bg-green-900/70 border border-green-700 text-green-200 text-xs font-bold rounded"
                >
                  Export Report
                </button>
                <button
                  onClick={() => {
                    addToast(`Email quarantined (DEMO)`, 'warning');
                  }}
                  className="flex-1 py-2 px-3 bg-red-900/40 hover:bg-red-900/70 border border-red-700 text-red-200 text-xs font-bold rounded"
                >
                  Quarantine Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
