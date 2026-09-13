import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { apiFetch } from "../services/api";

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/audit?limit=50&offset=${offset}`);
      const data = await res.json();
      setLogs(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [offset]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center bg-[#0c171c] border border-[#1b3037] p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-[#8ce2d0]">System & Security Audit Logs</h1>
          <p className="text-sm text-slate-400 mt-1">Tamper-evident chain of custody and administrative action history.</p>
        </div>
        <button onClick={fetchLogs} className="p-2 bg-[#183235] hover:bg-[#1b3037] text-[#8ce2d0] rounded-xl transition flex items-center gap-2 text-xs font-semibold">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="bg-[#0c171c] border border-[#1b3037] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#080d10] border-b border-[#1b3037] text-[11px] font-semibold text-[#58d6c0] uppercase tracking-wider">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target User</th>
                <th className="p-4">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b3037] text-xs text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Loading audit records...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No audit records found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#183235]/40 transition">
                    <td className="p-4 font-mono text-slate-400 text-[11px]">{log.created_at || "N/A"}</td>
                    <td className="p-4 font-semibold text-slate-200">{log.actor_user_id || "System"}</td>
                    <td className="p-4"><span className="px-2 py-0.5 rounded bg-[#183235] text-[#58d6c0] font-mono text-[11px]">{log.action}</span></td>
                    <td className="p-4 text-slate-400">{log.target_user_id || "—"}</td>
                    <td className="p-4 font-mono text-[11px] text-slate-400 max-w-xs truncate">{JSON.stringify(log.metadata || {})}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
