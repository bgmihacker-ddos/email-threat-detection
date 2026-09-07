import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, Users, Mail, AlertTriangle, Cpu, Activity, Clock } from 'lucide-react';
import { getDashboardSummary, DashboardSummary } from '../../services/analysisApi';
import { getAdminUsers } from '../../services/adminApi';
import { AdminUserRecord } from '../../types';

export default function AdminOverview() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardSummary().catch(() => null),
      getAdminUsers().catch(() => [])
    ]).then(([summaryData, usersData]) => {
      setSummary(summaryData);
      setUsers(usersData);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[#151D28] rounded w-64 mb-6"></div>
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#080D14] border border-[#151D28] rounded p-6">
                <div className="h-4 bg-[#151D28] rounded mb-2"></div>
                <div className="h-8 bg-[#151D28] rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const metrics = summary?.metrics || { total_analyses: 0, flagged_analyses: 0, malicious_analyses: 0, average_risk_score: 0 };
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Administrator Console</h1>
          <p className="text-sm text-gray-400">Real-time overview of platform health, users, and security operations</p>
        </div>
        <div className="text-xs text-cyan-400 font-mono flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          LIVE OPERATIONAL TELEMETRY
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
          <div className="flex items-center justify-between mb-4">
            <Users className="text-cyan-400" size={24} />
            <div className="text-xs text-gray-500 font-bold">USERS</div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">{totalUsers}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-400">{activeUsers} active</span>
              <span className="text-gray-500">{totalUsers ? Math.round((activeUsers / totalUsers) * 100) : 0}% active</span>
            </div>
          </div>
        </div>

        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
          <div className="flex items-center justify-between mb-4">
            <Mail className="text-green-400" size={24} />
            <div className="text-xs text-gray-500 font-bold">EMAILS ANALYZED</div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">{metrics.total_analyses}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-400">Persisted locally</span>
            </div>
          </div>
        </div>

        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
          <div className="flex items-center justify-between mb-4">
            <Shield className="text-red-400" size={24} />
            <div className="text-xs text-gray-500 font-bold">FLAGGED / MALICIOUS</div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">{metrics.flagged_analyses}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-red-400">{metrics.malicious_analyses} malicious</span>
            </div>
          </div>
        </div>

        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
          <div className="flex items-center justify-between mb-4">
            <Cpu className="text-yellow-400" size={24} />
            <div className="text-xs text-gray-500 font-bold">AVG RISK SCORE</div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">{metrics.average_risk_score} / 100</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-yellow-400">Dynamic Risk Engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scan Activity Chart */}
        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
          <h2 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
            <Activity size={16} />
            Scan Activity (7D)
          </h2>
          <div className="h-64">
            {summary?.activity && summary.activity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.activity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#151D28" vertical={false} />
                  <XAxis dataKey="date" stroke="#4A5568" fontSize={11} />
                  <YAxis stroke="#4A5568" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#080D14', borderColor: '#151D28', fontSize: '12px', color: '#CBD5E0' }} />
                  <Bar dataKey="analyses" name="Analyses" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="flagged" name="Flagged" fill="#ef4444" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500 font-mono">No recent scan activity recorded.</div>
            )}
          </div>
        </div>

        {/* Threat Severity Distribution */}
        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
          <h2 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} />
            Severity Distribution
          </h2>
          <div className="h-64">
            {summary?.distribution && summary.distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={summary.distribution} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                    {summary.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#080D14', borderColor: '#151D28', fontSize: '12px', color: '#CBD5E0' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500 font-mono">No severity data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Analyses List */}
      <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
        <h2 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <Clock size={16} />
          Recent Analysis Telemetry
        </h2>
        <div className="space-y-3">
          {summary?.recent_analyses && summary.recent_analyses.length > 0 ? (
            summary.recent_analyses.map((analysis) => (
              <div key={analysis.analysis_id} className="flex items-center justify-between p-3 bg-[#0B111A] rounded border border-[#151D28]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white font-mono">{analysis.analysis_id.slice(0, 12)}…</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${analysis.verdict === 'malicious' ? 'bg-red-900/40 text-red-300' : analysis.verdict === 'suspicious' ? 'bg-yellow-900/40 text-yellow-300' : 'bg-green-900/40 text-green-300'}`}>
                      {analysis.verdict.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{analysis.subject} ({analysis.sender})</p>
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  {new Date(analysis.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 font-mono">No recent analyses recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}
