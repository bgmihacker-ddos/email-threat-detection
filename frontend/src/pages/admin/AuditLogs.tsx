import { useState, useEffect } from 'react';
import { getAuditLogs } from '../../services/adminApi';
import { AuditLogRecord } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Search, Filter, Eye, Download, Shield, Clock } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActor, setSelectedActor] = useState<string>('ALL');
  const [selectedResult, setSelectedResult] = useState<string>('ALL');
  const { addToast } = useToast();

  useEffect(() => {
    getAuditLogs().then((data) => {
      setLogs(data);
      setFilteredLogs(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = logs;

    if (searchTerm) {
      result = result.filter(
        (l) =>
          l.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedActor !== 'ALL') {
      result = result.filter((l) => l.actor === selectedActor);
    }

    if (selectedResult !== 'ALL') {
      result = result.filter((l) => l.result === selectedResult);
    }

    setFilteredLogs(result);
  }, [searchTerm, selectedActor, selectedResult, logs]);

  const handleExportLogs = () => {
    addToast('Exporting audit logs as CSV (DEMO)', 'success');
  };


  const getResultBadge = (result: string) => {
    switch (result) {
      case 'Success': return 'bg-green-900/30 text-green-300 border-green-700';
      case 'Denied': return 'bg-yellow-900/30 text-yellow-300 border-yellow-700';
      case 'Warning': return 'bg-orange-900/30 text-orange-300 border-orange-700';
      case 'Failed': return 'bg-red-900/30 text-red-300 border-red-700';
      default: return 'bg-[#151D28] text-gray-400 border-[#1E2A3D]';
    }
  };

  const getUniqueActors = () => {
    const actors = logs.map(l => l.actor);
    return [...new Set(actors)];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="text-cyan-400" />
            Security Audit Logs
          </h1>
          <p className="text-xs text-gray-400">Comprehensive record of all security-relevant system events</p>
        </div>
        <button
          onClick={handleExportLogs}
          className="px-4 py-2 bg-cyan-900/40 hover:bg-cyan-900/70 border border-cyan-700 text-cyan-200 text-xs font-bold rounded flex items-center gap-2"
        >
          <Download size={14} />
          Export Logs
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">TOTAL LOGS</p>
          <p className="text-2xl font-bold text-white mt-2">{logs.length}</p>
        </div>

        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">SUCCESSFUL ACTIONS</p>
          <p className="text-2xl font-bold text-green-400 mt-2">
            {logs.filter(l => l.result === 'Success').length}
          </p>
        </div>

        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">DENIED ACCESS</p>
          <p className="text-2xl font-bold text-yellow-400 mt-2">
            {logs.filter(l => l.result === 'Denied').length}
          </p>
        </div>

        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">FAILED OPERATIONS</p>
          <p className="text-2xl font-bold text-red-400 mt-2">
            {logs.filter(l => l.result === 'Failed').length}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#080D14] p-4 rounded border border-[#151D28] grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search by actor, action, resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#05080D] border border-[#151D28] pl-9 pr-4 py-2 text-xs text-white rounded focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-2 items-center">
          <Filter size={14} className="text-gray-500" />
          <select
            value={selectedActor}
            onChange={(e) => setSelectedActor(e.target.value)}
            className="flex-1 bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
          >
            <option value="ALL">All Actors</option>
            {getUniqueActors().map(actor => (
              <option key={actor} value={actor}>{actor}</option>
            ))}
          </select>
        </div>

        <select
          value={selectedResult}
          onChange={(e) => setSelectedResult(e.target.value)}
          className="bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
        >
          <option value="ALL">All Results</option>
          <option value="Success">Success</option>
          <option value="Denied">Denied</option>
          <option value="Warning">Warning</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-[#080D14] rounded border border-[#151D28] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 font-mono text-xs animate-pulse">
            LOADING AUDIT LOGS...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-mono text-xs">
            NO LOGS MATCH THE GIVEN FILTER
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B111A] text-gray-400 border-b border-[#151D28]">
                <tr>
                  <th className="p-3 font-semibold">TIMESTAMP</th>
                  <th className="p-3 font-semibold">ACTOR</th>
                  <th className="p-3 font-semibold">ACTION</th>
                  <th className="p-3 font-semibold">RESOURCE</th>
                  <th className="p-3 font-semibold">IP ADDRESS</th>
                  <th className="p-3 font-semibold">RESULT</th>
                  <th className="p-3 font-semibold text-right">DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151D28]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#0E1520] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-gray-500" />
                        <span className="font-mono text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-white">{log.actor}</span>
                    </td>
                    <td className="p-3 text-cyan-400 font-bold">{log.action}</td>
                    <td className="p-3 text-gray-300 font-mono truncate max-w-[180px]">{log.resource}</td>
                    <td className="p-3">
                      <span className="font-mono text-gray-400">{log.ipAddress}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getResultBadge(log.result)}`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-end">
                        {log.details && (
                          <button
                            onClick={() => addToast(`Viewing details: ${log.details?.substring(0, 50)}...`, 'info')}
                            className="p-1 bg-[#151D28] hover:bg-[#1E2A3D] text-gray-400 hover:text-white rounded"
                          >
                            <Eye size={12} />
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

      {/* Activity Summary */}
      <div className="bg-[#080D14] p-5 rounded border border-[#151D28]">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Recent Activity Summary</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white">Login Attempts</span>
              <span className="text-gray-400">{logs.filter(l => l.action.includes('Login')).length} events</span>
            </div>
            <div className="w-full h-1.5 bg-[#151D28] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                style={{ width: `${(logs.filter(l => l.action.includes('Login')).length / Math.max(logs.length, 1)) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white">User Management</span>
              <span className="text-gray-400">{logs.filter(l => l.action.includes('User') || l.action.includes('Admin')).length} events</span>
            </div>
            <div className="w-full h-1.5 bg-[#151D28] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
                style={{ width: `${(logs.filter(l => l.action.includes('User') || l.action.includes('Admin')).length / Math.max(logs.length, 1)) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white">Threat Operations</span>
              <span className="text-gray-400">{logs.filter(l => l.action.includes('Threat') || l.action.includes('Scan')).length} events</span>
            </div>
            <div className="w-full h-1.5 bg-[#151D28] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"
                style={{ width: `${(logs.filter(l => l.action.includes('Threat') || l.action.includes('Scan')).length / Math.max(logs.length, 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
