import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { DashboardSummary, getDashboardSummary } from '../services/analysisApi';

const EMPTY_SUMMARY: DashboardSummary = {
  metrics: { total_analyses: 0, flagged_analyses: 0, malicious_analyses: 0, average_risk_score: 0 },
  verdict_counts: {},
  severity_counts: {},
  activity: [],
  distribution: [],
  top_indicators: [],
  recent_analyses: [],
  data_source: 'persisted_local_analyses',
};

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch(() => setError('Dashboard metrics are unavailable.'))
      .finally(() => setLoading(false));
  }, []);

  const metrics = [
    ['EMAILS ANALYZED', summary.metrics.total_analyses, 'text-cyan-400'],
    ['FLAGGED', summary.metrics.flagged_analyses, 'text-red-400'],
    ['MALICIOUS', summary.metrics.malicious_analyses, 'text-orange-400'],
    ['AVG RISK', summary.metrics.average_risk_score, 'text-yellow-400'],
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider">SECURITY OVERVIEW</h1>
          <p className="text-xs text-gray-500">Persisted local analysis telemetry</p>
        </div>
        <span className="text-[10px] text-cyan-400 uppercase tracking-widest">{summary.data_source}</span>
      </div>

      {error && <div className="border border-yellow-800 bg-yellow-950/30 p-3 text-xs text-yellow-300">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(([label, value, color]) => (
          <div key={label} className="bg-[#080D14] p-3 rounded border border-[#151D28]">
            <p className="text-[9px] text-gray-500 font-bold tracking-widest">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">ANALYSIS ACTIVITY (7D)</h3>
          {summary.activity.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={summary.activity}>
                <XAxis dataKey="date" hide />
                <Tooltip contentStyle={{ backgroundColor: '#080D14', border: '1px solid #151D28' }} />
                <Bar dataKey="analyses" fill="#06b6d4" />
                <Bar dataKey="flagged" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState text="No persisted analyses yet." />}
        </div>
        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">SEVERITY DISTRIBUTION</h3>
          {summary.distribution.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={summary.distribution} innerRadius={50} outerRadius={70} dataKey="value">
                  {summary.distribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#080D14', border: '1px solid #151D28' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState text="No severity data yet." />}
        </div>
        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">MOST OBSERVED IOCs</h3>
          {summary.top_indicators.length ? (
            <div className="space-y-3">
              {summary.top_indicators.map((item) => (
                <div key={item.indicator} className="flex justify-between text-[10px] gap-2">
                  <span className="text-gray-300 truncate">{item.indicator}</span>
                  <span className="text-gray-400 font-mono">{item.count}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState text="No indicators extracted yet." />}
        </div>
      </div>

      <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">RECENT ANALYSES</h3>
        {summary.recent_analyses.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left">
              <thead className="text-gray-500 border-b border-[#151D28]"><tr><th className="py-2">TIME</th><th className="py-2">SUBJECT</th><th className="py-2">SENDER</th><th className="py-2">RISK</th><th className="py-2">SEVERITY</th></tr></thead>
              <tbody className="text-gray-300">
                {summary.recent_analyses.map((item) => (
                  <tr key={item.analysis_id} className="border-b border-[#0B111A]">
                    <td className="py-2 text-cyan-500">{new Date(item.created_at).toLocaleString()}</td>
                    <td className="py-2 max-w-[220px] truncate">{item.subject}</td>
                    <td className="py-2 max-w-[180px] truncate">{item.sender}</td>
                    <td className="py-2 font-mono">{item.risk_score}</td>
                    <td className="py-2"><SeverityBadge severity={item.severity as any} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState text="No analyses have been persisted." />}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="h-[160px] flex items-center justify-center text-xs text-gray-500 font-mono">{text}</div>;
}
