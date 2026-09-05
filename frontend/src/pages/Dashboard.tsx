import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { getDashboardMetrics, getThreatActivity, getDistribution, getActiveThreats, getRecentLogs } from '../services/dashboardApi';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [activeThreats, setActiveThreats] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setMetrics(await getDashboardMetrics());
      setActivity(await getThreatActivity());
      setDistribution(await getDistribution());
      setActiveThreats(await getActiveThreats());
      setLogs(await getRecentLogs());
    };
    loadData();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-xl font-bold text-white tracking-wider">SECURITY OVERVIEW</h1>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {metrics.map((m: any) => (
           <div key={m.label} className="bg-[#080D14] p-3 rounded border border-[#151D28]">
             <p className="text-[9px] text-gray-500 font-bold tracking-widest">{m.label}</p>
             <div className="flex justify-between items-end mt-1">
                <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                <p className="text-[10px] text-gray-400">{m.trend}</p>
             </div>
           </div>
         ))}
      </div>

      {/* SOC Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         {/* Threat Activity */}
         <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">THREAT ACTIVITY (24H)</h3>
             <ResponsiveContainer width="100%" height={200}>
                <BarChart data={activity}>
                    <XAxis dataKey="name" hide />
                    <Tooltip contentStyle={{ backgroundColor: '#080D14', border: '1px solid #151D28' }} />
                    <Bar dataKey="Phishing" fill="#06b6d4" />
                    <Bar dataKey="BEC" fill="#8b5cf6" />
                </BarChart>
            </ResponsiveContainer>
         </div>
         {/* Distribution */}
         <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">THREAT DISTRIBUTION</h3>
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie data={distribution} innerRadius={50} outerRadius={70} dataKey="value">
                        {distribution.map((e, index) => <Cell key={index} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#080D14', border: '1px solid #151D28' }} />
                </PieChart>
            </ResponsiveContainer>
         </div>
         {/* Most Active Threats */}
         <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">MOST ACTIVE THREATS</h3>
            <div className="space-y-3">
                 {activeThreats.map((t: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-300 w-24 truncate">{t.name}</span>
                        <div className="flex-1 mx-2 h-2 bg-[#0B111A] rounded overflow-hidden">
                            <div className="h-full bg-cyan-700" style={{width: `${(t.count/150)*100}%`}}></div>
                        </div>
                        <span className="text-gray-400">{t.count}</span>
                    </div>
                 ))}
             </div>
         </div>
      </div>

    {/* Logs and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#080D14] p-4 rounded border border-[#151D28]">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">RECENT SECURITY LOGS</h3>
            <table className="w-full text-[11px] text-left">
              <thead className="text-gray-500 border-b border-[#151D28]">
                <tr>
                  <th className="py-2">TIME</th>
                  <th className="py-2">USER</th>
                  <th className="py-2">EVENT</th>
                  <th className="py-2">SEVERITY</th>
                  <th className="py-2">STATUS</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {logs.map((log: any) => (
                  <tr key={log.id} className="border-b border-[#0B111A] font-mono">
                    <td className="py-2 text-cyan-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2">{log.user}</td>
                    <td className="py-2">{log.event}</td>
                    <td className="py-2"><SeverityBadge severity={log.severity as any} /></td>
                    <td className="py-2">{log.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">SECURITY INSIGHTS</h3>
            <p className="text-[10px] text-gray-400 italic mb-2">DEMO INTELLIGENCE</p>
            <ul className="text-[11px] text-gray-300 space-y-2 list-disc pl-4">
                <li>Credential phishing activity increased.</li>
                <li>Repeated brand impersonation pattern observed.</li>
                <li>BEC indicators appeared in recent scans.</li>
            </ul>
         </div>
      </div>
    </div>
  );
}
