import { useState, useEffect } from 'react';
import { getReports } from '../services/adminApi';
import { SecurityReport } from '../types';
import { useToast } from '../context/ToastContext';
import { Download, Eye, FileText, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Reports() {
  const [reports, setReports] = useState<SecurityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    getReports().then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, []);

  const handleGenerateReport = (title: string) => {
    addToast(`Generating "${title}" report (DEMO)`, 'info');
  };

  const handleExportReport = (title: string) => {
    addToast(`Exporting "${title}" report as PDF (DEMO)`, 'success');
  };

  const chartData = [
    { day: 'Mon', threats: 14, blocks: 8, incidents: 3 },
    { day: 'Tue', threats: 18, blocks: 12, incidents: 4 },
    { day: 'Wed', threats: 22, blocks: 15, incidents: 7 },
    { day: 'Thu', threats: 16, blocks: 11, incidents: 5 },
    { day: 'Fri', threats: 12, blocks: 9, incidents: 2 },
    { day: 'Sat', threats: 8, blocks: 6, incidents: 1 },
    { day: 'Sun', threats: 6, blocks: 4, incidents: 0 },
  ];

  const topThreatsData = [
    { name: 'Phishing', count: 42 },
    { name: 'Credential Theft', count: 28 },
    { name: 'Malware', count: 19 },
    { name: 'BEC', count: 15 },
    { name: 'Suspicious', count: 8 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="text-cyan-400" />
            Security Reports & Analytics
          </h1>
          <p className="text-xs text-gray-400">Generated intelligence summaries, metrics, and action logs</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">REPORTS READY</p>
          <div className="mt-2 flex items-center gap-3">
            <FileText className="text-green-400" size={24} />
            <div>
              <p className="text-2xl font-bold text-white">{reports.filter(r => r.status === 'Ready').length}</p>
              <p className="text-xs text-gray-400">Available now</p>
            </div>
          </div>
        </div>

        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">WEEKLY THREATS</p>
          <div className="mt-2 flex items-center gap-3">
            <TrendingUp className="text-red-400" size={24} />
            <div>
              <p className="text-2xl font-bold text-white">96</p>
              <p className="text-xs text-gray-400">+12% vs last week</p>
            </div>
          </div>
        </div>

        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">AVG RESPONSE TIME</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="text-cyan-400 text-2xl font-mono">5.2s</div>
            <div>
              <p className="text-xs text-gray-400">-0.8s from last week</p>
              <p className="text-xs text-green-400 font-bold flex items-center"><TrendingDown size={12} /> Improving</p>
            </div>
          </div>
        </div>

        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">BLOCKED DOMAINS</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="text-2xl font-bold text-yellow-400">84</div>
            <div>
              <p className="text-xs text-gray-400">This month</p>
              <p className="text-xs text-red-400 font-bold">+24% more malicious</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#080D14] p-5 rounded border border-[#151D28]">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Weekly Threat Activity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#151D28" />
                <XAxis dataKey="day" stroke="#4A5568" fontSize={10} />
                <YAxis stroke="#4A5568" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#080D14', borderColor: '#151D28', fontSize: '11px' }}
                  labelStyle={{ color: '#CBD5E0' }}
                />
                <Line type="monotone" dataKey="threats" stroke="#F56565" strokeWidth={2} dot={{ fill: '#F56565' }} />
                <Line type="monotone" dataKey="blocks" stroke="#ECC94B" strokeWidth={2} dot={{ fill: '#ECC94B' }} />
                <Line type="monotone" dataKey="incidents" stroke="#4299E1" strokeWidth={2} dot={{ fill: '#4299E1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#080D14] p-5 rounded border border-[#151D28]">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Top Threat Types (Last 7 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topThreatsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#151D28" vertical={false} />
                <XAxis dataKey="name" stroke="#4A5568" fontSize={10} />
                <YAxis stroke="#4A5568" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#080D14', borderColor: '#151D28', fontSize: '11px' }}
                  labelStyle={{ color: '#CBD5E0' }}
                />
                <Bar dataKey="count" fill="#4299E1" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-[#080D14] rounded border border-[#151D28] overflow-hidden">
        <div className="p-4 border-b border-[#151D28] flex justify-between items-center">
          <h2 className="text-sm font-bold text-white uppercase">Available Reports</h2>
          <button
            onClick={() => handleGenerateReport('Custom Threat Intelligence Report')}
            className="px-3 py-1.5 bg-cyan-900/40 hover:bg-cyan-900/70 border border-cyan-700 text-cyan-200 text-xs font-bold rounded"
          >
            Generate New Report
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 font-mono text-xs animate-pulse">
            LOADING REPORTS...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B111A] text-gray-400 border-b border-[#151D28]">
                <tr>
                  <th className="p-3 font-semibold">REPORT TITLE</th>
                  <th className="p-3 font-semibold">DESCRIPTION</th>
                  <th className="p-3 font-semibold">DATE RANGE</th>
                  <th className="p-3 font-semibold">CATEGORY</th>
                  <th className="p-3 font-semibold">METRICS</th>
                  <th className="p-3 font-semibold">STATUS</th>
                  <th className="p-3 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151D28]">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-[#0E1520] transition-colors">
                    <td className="p-3 font-bold text-white truncate max-w-[180px]">{report.title}</td>
                    <td className="p-3 text-gray-400 truncate max-w-[220px]">{report.description}</td>
                    <td className="p-3 text-gray-400 font-mono">{report.dateRange}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#151D28] text-gray-300">
                        {report.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {report.metrics.slice(0, 2).map((metric, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-gray-400 text-[10px]">{metric.label}:</span>
                            <span className="text-white font-mono text-[10px]">{metric.value}</span>
                            {metric.change && (
                              <span className={`text-[9px] ${metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                {metric.change}
                              </span>
                            )}
                          </div>
                        ))}
                        {report.metrics.length > 2 && (
                          <div className="text-[9px] text-gray-500">+{report.metrics.length - 2} more</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${report.status === 'Ready' ? 'bg-green-900/30 text-green-300' : 'bg-yellow-900/30 text-yellow-300'}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => addToast(`Viewing "${report.title}" report (DEMO)`, 'info')}
                          className="p-1 bg-[#151D28] hover:bg-[#1E2A3D] text-gray-400 hover:text-white rounded"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => handleExportReport(report.title)}
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
